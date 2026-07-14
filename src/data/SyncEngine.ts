import { LocalProviderInstance } from './LocalProvider';
import { FirebaseProviderInstance } from './FirebaseProvider';

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
        // 1. Retrieve all records from Local database
        const localRes = await LocalProviderInstance.getDocs(table);
        const localItems = localRes.docs.map((d: any) => d.data());

        // 2. Retrieve all records from Cloud database (Firebase)
        let cloudItems: any[] = [];
        try {
          const cloudRes = await FirebaseProviderInstance.getDocs(table);
          cloudItems = cloudRes.docs.map((d: any) => d.data());
        } catch (err) {
          console.warn(`Could not sync table ${table} with cloud:`, err);
          continue; // Skip table if cloud fetch fails
        }

        const localMap = new Map<string, any>();
        localItems.forEach(item => {
          if (item && item.id) localMap.set(item.id, item);
        });

        const cloudMap = new Map<string, any>();
        cloudItems.forEach(item => {
          if (item && item.id) cloudMap.set(item.id, item);
        });

        // 3. Upload: Sync Local -> Cloud
        for (const localItem of localItems) {
          if (!localItem || !localItem.id) continue;
          
          const cloudItem = cloudMap.get(localItem.id);
          const localUpdatedStr = localItem.updatedAt?.toISOString?.() || localItem.updatedAt || '';
          const cloudUpdatedStr = cloudItem?.updatedAt?.toISOString?.() || cloudItem?.updatedAt || '';

          const needsUpload = !cloudItem || 
            (localUpdatedStr && (!cloudUpdatedStr || new Date(localUpdatedStr) > new Date(cloudUpdatedStr)));

          if (needsUpload) {
            // Ensure any dates are converted to standard format before setDoc
            await FirebaseProviderInstance.setDoc(table, localItem.id, localItem);
            syncedCount++;
          }
        }

        // 4. Download: Sync Cloud -> Local
        for (const cloudItem of cloudItems) {
          if (!cloudItem || !cloudItem.id) continue;

          const localItem = localMap.get(cloudItem.id);
          const localUpdatedStr = localItem?.updatedAt?.toISOString?.() || localItem?.updatedAt || '';
          const cloudUpdatedStr = cloudItem.updatedAt?.toISOString?.() || cloudItem.updatedAt || '';

          const needsDownload = !localItem ||
            (cloudUpdatedStr && (!localUpdatedStr || new Date(cloudUpdatedStr) > new Date(localUpdatedStr)));

          if (needsDownload) {
            await LocalProviderInstance.setDoc(table, cloudItem.id, cloudItem);
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
      console.error('Data synchronization failed:', error);
      return { success: false, message: `فشلت المزامنة: ${error.message || error}` };
    }
  }
}
