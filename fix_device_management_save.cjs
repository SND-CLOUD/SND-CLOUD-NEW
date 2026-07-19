const fs = require('fs');

let content = fs.readFileSync('src/components/DeviceManagement.tsx', 'utf8');

const startStr = "// 1. Update the item document in Firestore";
const endStr = "setAdminNewPrice(0);";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex > -1 && endIndex > -1) {
  const newBlock = `let totalCostOfInvoice = 0;
      let allItemStatuses: string[] = [];

      const currentInvoiceItems = items.filter(it => it.invoiceNumber === selectedInvoiceForAdmin.invoiceNumber);

      if (adminCorrectionScope === 'device' && selectedItemForEdit) {
        const itemCost = Number(adminNewQuantity) * Number(adminNewPrice);
        const itemRef = doc(db, 'invoice_items', selectedItemForEdit.id!);
        batch.update(itemRef, {
          quantity: adminNewQuantity,
          unitCost: adminNewPrice,
          cost: itemCost,
          status: finalStatus,
          subStatus: finalSubStatus,
          updatedAt: serverTimestamp(),
          updatedBy: user?.name || user?.username || 'مدير النظام',
          ...additionalFields
        });

        const otherItems = currentInvoiceItems.filter(it => it.id !== selectedItemForEdit.id);
        totalCostOfInvoice = otherItems.reduce((sum, it) => sum + (Number(it.cost) || 0), 0) + itemCost;
        allItemStatuses = [...otherItems.map(it => it.status), finalStatus];
      } else if (adminCorrectionScope === 'invoice') {
        currentInvoiceItems.forEach(it => {
          const itemRef = doc(db, 'invoice_items', it.id!);
          batch.update(itemRef, {
            status: finalStatus,
            subStatus: finalSubStatus,
            updatedAt: serverTimestamp(),
            updatedBy: user?.name || user?.username || 'مدير النظام',
            ...additionalFields
          });
        });
        totalCostOfInvoice = currentInvoiceItems.reduce((sum, it) => sum + (Number(it.cost) || 0), 0);
        allItemStatuses = currentInvoiceItems.map(() => finalStatus);
      }
      
      const invoiceRef = doc(db, 'invoices', selectedInvoiceForAdmin.id!);
      const updateData: any = {
        totalCost: totalCostOfInvoice,
        updatedAt: serverTimestamp()
      };

      // Determine invoice status (if all items 60 -> 60, if all items 50+ -> 50, else 10)
      const isAllDelivered = allItemStatuses.every(st => st === '60');
      const isAllReadyOrBeyond = allItemStatuses.every(st => Number(st) >= 50);

      if (isAllDelivered) {
        updateData.status = '60';
      } else if (isAllReadyOrBeyond) {
        updateData.status = '50';
      } else {
        updateData.status = '10'; // Keep active
      }

      batch.update(invoiceRef, updateData);

      await batch.commit();

      setSelectedItemForEdit(null);
      setAdminNewStatus('');
      setAdminNewQuantity(1);
      setAdminNewPrice(0);`;

  content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
  fs.writeFileSync('src/components/DeviceManagement.tsx', content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find start/end.");
}
