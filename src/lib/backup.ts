import { localDb } from './local-db';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';

const TABLES_TO_BACKUP = [
  'users',
  'settings',
  'company_details',
  'customers',
  'invoices',
  'invoice_items',
  'vault_transactions',
  'maintenance_actions',
  'inventory_items',
  'device_categories',
  'device_models',
  'engineers',
  'approval_actions',
  'fin_transaction_types',
  'fin_funds',
  'fin_currencies',
  'fin_payment_methods',
  'user_devices',
  'document_outputs',
  'job_titles'
];

export async function generateBackupData(): Promise<string> {
  const backup: Record<string, any[]> = {};
  
  for (const table of TABLES_TO_BACKUP) {
    try {
      const res = await localDb.query(`SELECT * FROM ${table}`);
      backup[table] = res.values || [];
    } catch (e) {
      console.error(`Error backing up table ${table}:`, e);
      backup[table] = [];
    }
  }

  const exportData = {
    version: 1,
    timestamp: new Date().toISOString(),
    data: backup
  };

  return JSON.stringify(exportData);
}

export async function restoreBackupData(jsonString: string): Promise<boolean> {
  try {
    const importData = JSON.parse(jsonString);
    if (!importData || !importData.data) {
      throw new Error('Invalid backup file format');
    }

    const { data } = importData;

    for (const table of TABLES_TO_BACKUP) {
      if (data[table] && Array.isArray(data[table])) {
        // Clear existing data
        await localDb.run(`DELETE FROM ${table}`);
        
        // Insert new data
        for (const row of data[table]) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          if (columns.length > 0) {
            const placeholders = columns.map(() => '?').join(',');
            const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;
            await localDb.run(sql, values);
          }
        }
      }
    }
    
    // Attempt to persist local storage triggers if needed
    localStorage.setItem('snd_wipe_v1', 'done'); // avoid triggering wipe
    
    return true;
  } catch (e) {
    console.error('Error during restore:', e);
    throw e;
  }
}

export async function exportBackupFile() {
  try {
    const jsonData = await generateBackupData();
    const fileName = `snd_backup_${new Date().getTime()}.json`;
    
    const info = await Device.getInfo();
    if (info.platform === 'web') {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true, message: 'تم التصدير بنجاح' };
    } else {
      // Save to device
      const result = await Filesystem.writeFile({
        path: fileName,
        data: jsonData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      
      // Share it so user can save it elsewhere
      await Share.share({
        title: 'نسخة احتياطية للبيانات',
        text: 'نسخة احتياطية من برنامج إدارة الصيانة',
        url: result.uri,
        dialogTitle: 'حفظ النسخة الاحتياطية'
      });
      
      return { success: true, message: 'تم الحفظ والمشاركة بنجاح' };
    }
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, message: 'فشل التصدير' };
  }
}

export async function archiveOldData(monthsToKeep: number = 12) {
  try {
    // Determine cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
    const cutoffISO = cutoffDate.toISOString();
    
    // We only delete invoices, invoice_items, and transactions older than cutoffDate
    // and where status is completed/delivered (e.g., 'delivered', 'returned', '60', '70')
    const completedStatuses = ['delivered', 'returned', '60', '70'];
    
    // Delete invoice items
    for (const status of completedStatuses) {
      await localDb.run(`DELETE FROM invoice_items WHERE status = ? AND createdAt < ?`, [status, cutoffISO]);
    }
    
    // Delete invoices
    for (const status of completedStatuses) {
      await localDb.run(`DELETE FROM invoices WHERE status = ? AND createdAt < ?`, [status, cutoffISO]);
    }
    
    // Delete transactions (maybe keep transactions for accounting? Let's leave vault_transactions alone or 
    // delete only if they are very old. We will skip vault for safety unless explicitly requested)
    // await sqlite.run(`DELETE FROM vault_transactions WHERE timestamp < ?`, [cutoffISO]);
    
    return { success: true, message: 'تم الأرشفة والحذف بنجاح' };
  } catch (error) {
    console.error('Archive failed:', error);
    return { success: false, message: 'فشل الأرشفة' };
  }
}
