const fs = require('fs');
let content = fs.readFileSync('src/components/DeviceManagement.tsx', 'utf8');

const startStr = `                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Quantity Block */}`;

const endStr = `                      </div>
                    </div>

                  </div>

                  {/* Status update block */}`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex > -1 && endIndex > -1) {
  const newBlock = `                  {adminCorrectionScope === 'device' && selectedItemForEdit && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                      {/* Quantity Block */}
                      <div className="space-y-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                        <h4 className="text-xs font-black text-gray-400 border-b border-white/5 pb-2 flex items-center gap-1.5">
                          <Hash size={14} className="text-orange-500" />
                          <span>مربع التحكم بالأعداد والكميات</span>
                        </h4>

                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 block">العدد الحالي للجهاز في الفاتورة:</label>
                          <div className="bg-black/40 border border-white/5 text-gray-400 font-mono font-bold text-sm px-4 py-2.5 rounded-xl">
                            {selectedItemForEdit.quantity} حبات/أجهزة
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-orange-500 font-bold block">العدد الجديد:</label>
                          <input
                            type="number"
                            min={1}
                            dir="ltr"
                            lang="en"
                            onFocus={e => e.target.select()}
                            value={adminNewQuantity}
                            onChange={(e) => setAdminNewQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-orange-500 outline-none text-white font-bold text-center"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <label className="text-xs text-gray-500 block">الحالة الحالية للجهاز:</label>
                          <div className="bg-black/60 border border-white/5 text-blue-400 font-bold text-xs px-4 py-3 rounded-xl">
                            {getStatusTextArabic(selectedItemForEdit.status)}
                          </div>
                        </div>
                      </div>

                      {/* Price Block */}
                      <div className="space-y-4 bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                        <h4 className="text-xs font-black text-gray-400 border-b border-white/5 pb-2 flex items-center gap-1.5">
                          <DollarSign size={14} className="text-orange-500" />
                          <span>مربع التحكم بالتكلفة والسعر</span>
                        </h4>

                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 block">السعر الحالي المفرد (تكلفة الوحدة):</label>
                          <div className="bg-black/40 border border-white/5 text-gray-400 font-mono font-bold text-sm px-4 py-2.5 rounded-xl">
                            {((selectedItemForEdit.unitCost !== undefined && selectedItemForEdit.unitCost !== null) 
                              ? Number(selectedItemForEdit.unitCost) 
                              : (Number(selectedItemForEdit.quantity || 0) > 0 ? (Number(selectedItemForEdit.cost || 0) / Number(selectedItemForEdit.quantity || 0)) : Number(selectedItemForEdit.cost || 0))
                            ).toFixed(2)} <span className="text-xs font-sans text-gray-600">{selectedInvoiceForAdmin.currency || 'YER'}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-orange-500 font-bold block">السعر الجديد المفرد:</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            dir="ltr"
                            lang="en"
                            onFocus={e => e.target.select()}
                            value={adminNewPrice}
                            onChange={(e) => setAdminNewPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-orange-500 outline-none text-white font-bold text-center border-dashed"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <label className="text-xs text-gray-500 block">التكلفة الإجمالية المحسوبة:</label>
                          <div className="bg-[#141414] border border-white/5 p-2.5 text-emerald-400 font-mono uppercase text-sm font-black rounded-xl text-center">
                            {(adminNewQuantity * adminNewPrice).toFixed(2)} <span className="text-xs font-sans text-slate-500">{selectedInvoiceForAdmin.currency || 'YER'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Status update block */}`;

  content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
  fs.writeFileSync('src/components/DeviceManagement.tsx', content);
  console.log("Replaced UI blocks successfully.");
} else {
  console.log("Could not find start/end for blocks.");
}
