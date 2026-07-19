const fs = require('fs');
let content = fs.readFileSync('src/components/DeviceManagement.tsx', 'utf8');

const startStr = `              {/* Selector dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 block pb-1">اختر الجهاز المطلوب تصحيح بياناته:</label>
                <select`;

const endStr = `              {/* Editable form parameters */}
              {selectedItemForEdit && (
                <motion.div`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex > -1 && endIndex > -1) {
  const newBlock = `              {/* Scope Selection */}
              <div className="flex gap-4 p-1 bg-black/40 border border-white/5 rounded-2xl w-max mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAdminCorrectionScope('device');
                    setSelectedItemForEdit(null);
                  }}
                  className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all \${adminCorrectionScope === 'device' ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-white'}\`}
                >
                  تعديل جهاز واحد
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminCorrectionScope('invoice');
                    setSelectedItemForEdit(null);
                    setAdminNewStatus('');
                  }}
                  className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all \${adminCorrectionScope === 'invoice' ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-white'}\`}
                >
                  تعديل كل أجهزة الفاتورة
                </button>
              </div>

              {/* Selector dropdown */}
              {adminCorrectionScope === 'device' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 block pb-1">اختر الجهاز المطلوب تصحيح بياناته:</label>
                  <select
                    value={selectedItemForEdit?.id || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = items.find(it => it.id === selectedId);
                      if (found) {
                        setSelectedItemForEdit(found);
                        setAdminNewStatus(found.status);
                        setAdminNewQuantity(Number(found.quantity) || 1);
                        const uCost = (found.unitCost !== undefined && found.unitCost !== null) 
                          ? Number(found.unitCost) 
                          : (Number(found.quantity) > 0 ? (Number(found.cost || 0) / Number(found.quantity)) : Number(found.cost || 0));
                        setAdminNewPrice(isNaN(uCost) ? 0 : uCost);
                      } else {
                        setSelectedItemForEdit(null);
                        setAdminNewStatus('');
                        setAdminNewQuantity(1);
                        setAdminNewPrice(0);
                      }
                    }}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-orange-500 outline-none transition-all text-white font-bold"
                  >
                    <option value="">-- اختر الجهاز من القائمة --</option>
                    {items
                      .filter(it => it.invoiceNumber === selectedInvoiceForAdmin.invoiceNumber)
                      .map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.deviceType} {it.deviceName ? \`- \${it.deviceName}\` : ''} | الكمية: {it.quantity} | عطل: {it.faultType}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Editable form parameters */}
              {(adminCorrectionScope === 'invoice' || selectedItemForEdit) && (
                <motion.div`;
                
  content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
  fs.writeFileSync('src/components/DeviceManagement.tsx', content);
  console.log("Replaced UI successfully.");
} else {
  console.log("Could not find start/end.");
}
