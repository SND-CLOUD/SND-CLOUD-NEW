import { localDb } from '../lib/local-db';
import { LocalProviderInstance } from './LocalProvider';
import { FirebaseProviderInstance } from './FirebaseProvider';

function isPermissionError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || err).toLowerCase();
  const code = String(err.code || '').toLowerCase();
  return (
    code === 'permission-denied' ||
    msg.includes('permission-denied') ||
    msg.includes('insufficient permissions') ||
    msg.includes('permission')
  );
}

export class SyncEngine {
  private static syncing = false;

  static isSyncing(): boolean {
    return this.syncing;
  }

  static async syncAll(): Promise<{ success: boolean; message: string; syncedCount?: number }> {
    if (this.syncing) {
      return { success: false, message: 'عملية المزامنة قيد التشغيل حالياً.' };
    }

    this.syncing = true;
    let syncedCount = 0;

    try {
      // 1. Process Outbox (Local -> Cloud) in chronological order (FIFO)
      const outboxRes = await localDb.query(
        "SELECT * FROM outbox WHERE status IN ('PENDING', 'FAILED') ORDER BY timestamp ASC, id ASC"
      );

      const items = outboxRes.values || [];
      if (items.length > 0) {
        console.log(`SyncEngine: Found ${items.length} pending operations in outbox.`);
        const processedIds = new Set<string>();

        for (const item of items) {
          if (processedIds.has(item.id)) continue;

          const txGroupId = item.transactionGroupId;
          if (txGroupId) {
            // Group transactional operations together
            const groupItems = items.filter(it => it.transactionGroupId === txGroupId);
            groupItems.forEach(it => processedIds.add(it.id));

            console.log(`SyncEngine: Syncing transactional group ${txGroupId} with ${groupItems.length} operations.`);

            try {
              // We use Firestore writeBatch to guarantee atomic sync of related rows
              const batch = FirebaseProviderInstance.writeBatch();

              for (const gItem of groupItems) {
                const { tableName, recordId, action, payload } = gItem;
                const parsedPayload = payload ? JSON.parse(payload) : null;
                const docRef = { name: tableName, id: recordId };

                if (action === 'SET') {
                  const { data, options } = parsedPayload || {};
                  batch.set(docRef, data, options);
                } else if (action === 'UPDATE') {
                  batch.update(docRef, parsedPayload);
                } else if (action === 'DELETE') {
                  batch.delete(docRef);
                }
              }

              // Commit atomically to Firestore
              await batch.commit();

              // Delete group from local Outbox
              const placeholders = groupItems.map(() => '?').join(', ');
              await localDb.run(
                `DELETE FROM outbox WHERE id IN (${placeholders})`,
                groupItems.map(it => it.id)
              );

              syncedCount += groupItems.length;
              console.log(`SyncEngine: Successfully synced group ${txGroupId}.`);

            } catch (err: any) {
              if (isPermissionError(err)) {
                console.warn(`SyncEngine: Permission denied for group ${txGroupId}. Marking group status as PERMISSION_DENIED to prevent queue block.`, err);
                for (const gItem of groupItems) {
                  await localDb.run(
                    "UPDATE outbox SET status = 'PERMISSION_DENIED', retryCount = retryCount + 1 WHERE id = ?",
                    [gItem.id]
                  );
                }
                continue;
              }
              console.error(`SyncEngine: Failed to sync group ${txGroupId}:`, err);
              // Mark group as FAILED and pause queue processing to preserve FIFO order
              for (const gItem of groupItems) {
                await localDb.run(
                  "UPDATE outbox SET status = 'FAILED', retryCount = retryCount + 1 WHERE id = ?",
                  [gItem.id]
                );
              }
              this.syncing = false;
              return { success: false, message: `فشلت مزامنة العمليات المترابطة: ${err.message || err}` };
            }

          } else {
            // Process single outbox item
            processedIds.add(item.id);
            const { id, tableName, recordId, action, payload } = item;
            const parsedPayload = payload ? JSON.parse(payload) : null;

            console.log(`SyncEngine: Syncing single operation ${action} on ${tableName}/${recordId}.`);

            try {
              if (action === 'SET') {
                const { data, options } = parsedPayload || {};
                await FirebaseProviderInstance.setDoc(tableName, recordId, data, options);
              } else if (action === 'UPDATE') {
                await FirebaseProviderInstance.updateDoc(tableName, recordId, parsedPayload);
              } else if (action === 'DELETE') {
                await FirebaseProviderInstance.deleteDoc(tableName, recordId);
              }

              // Success: Delete from local outbox
              await localDb.run("DELETE FROM outbox WHERE id = ?", [id]);
              syncedCount++;
              console.log(`SyncEngine: Successfully synced item ${id}.`);

            } catch (err: any) {
              if (isPermissionError(err)) {
                console.warn(`SyncEngine: Permission denied for item ${id}. Marking status as PERMISSION_DENIED to prevent queue block.`, err);
                await localDb.run(
                  "UPDATE outbox SET status = 'PERMISSION_DENIED', retryCount = retryCount + 1 WHERE id = ?",
                  [id]
                );
                continue;
              }
              console.error(`SyncEngine: Failed to sync item ${id}:`, err);
              await localDb.run(
                "UPDATE outbox SET status = 'FAILED', retryCount = retryCount + 1 WHERE id = ?",
                [id]
              );
              // Pause queue processing to preserve chronological ordering
              this.syncing = false;
              return { success: false, message: `فشلت مزامنة العملية ${tableName}/${recordId}: ${err.message || err}` };
            }
          }
        }
      }

      // 2. Fetch updates from cloud (Cloud -> Local)
      const tables = [
        'company_details',
        'customers',
        'invoices',
        'invoice_items',
        'vault_transactions',
        'maintenance_actions',
        'device_categories',
        'device_models',
        'approval_actions',
        'settings'
      ];

      for (const table of tables) {
        // Find IDs of documents with pending local writes in the outbox
        const pendingRes = await localDb.query(
          "SELECT recordId FROM outbox WHERE tableName = ? AND status IN ('PENDING', 'FAILED')",
          [table]
        );
        const pendingIds = new Set((pendingRes.values || []).map(r => r.recordId));

        // Fetch cloud records
        let cloudItems: any[] = [];
        try {
          const cloudRes = await FirebaseProviderInstance.getDocs(table);
          cloudItems = cloudRes.docs.map((d: any) => d.data());
        } catch (err) {
          console.warn(`SyncEngine: Could not fetch cloud records for table ${table}:`, err);
          continue; // Skip table if cloud fetch fails (e.g. offline)
        }

        // Fetch local records
        const localRes = await LocalProviderInstance.getDocs(table);
        const localItems = localRes.docs.map((d: any) => d.data());
        const localMap = new Map<string, any>();
        localItems.forEach(it => {
          if (it && it.id) localMap.set(it.id, it);
        });

        // Sync Cloud -> Local
        for (const cloudItem of cloudItems) {
          if (!cloudItem || !cloudItem.id) continue;
          if (pendingIds.has(cloudItem.id)) continue; // Skip pulling if there is a pending local write

          const localItem = localMap.get(cloudItem.id);
          const localUpdatedStr = localItem?.updatedAt?.toISOString?.() || localItem?.updatedAt || '';
          const cloudUpdatedStr = cloudItem.updatedAt?.toISOString?.() || cloudItem.updatedAt || '';

          const needsDownload = !localItem ||
            (cloudUpdatedStr && (!localUpdatedStr || new Date(cloudUpdatedStr) > new Date(localUpdatedStr)));

          if (needsDownload) {
            // Bypass outbox queuing during down-sync by using the 'BYPASS_OUTBOX' txGroupId
            await LocalProviderInstance.setDoc(table, cloudItem.id, cloudItem, undefined, 'BYPASS_OUTBOX');
            syncedCount++;
          }
        }
      }

      this.syncing = false;
      return {
        success: true,
        message: syncedCount > 0 ? `تمت المزامنة بنجاح! تم نقل وتحديث ${syncedCount} سِجل.` : 'النظام متزامن بالكامل مع السحابة.',
        syncedCount
      };

    } catch (error: any) {
      this.syncing = false;
      console.error('SyncEngine: Data synchronization failed:', error);
      return { success: false, message: `فشلت المزامنة: ${error.message || error}` };
    }
  }
}
