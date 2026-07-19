const fs = require('fs');
let content = fs.readFileSync('src/components/DeviceManagement.tsx', 'utf8');

const restOfFile = `
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 animate-fade-in"
        >
          {/* Action view header */}
          <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-white/5 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] bg-orange-500/20 text-orange-500 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono">
                  تصحيح بيانات أجهزة الفاتورة #{selectedInvoiceForAdmin.invoiceNumber}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">العميل: {selectedInvoiceForAdmin.customerName}</h2>
              </div>

              <div className="text-right text-xs text-gray-400 space-y-1 bg-black/20 p-3 rounded-2xl border border-white/5">
                <div>مستخدم النظام المسؤول: <span className="text-white font-bold">{user?.name || user?.username || 'المشرف'}</span></div>
                <div>تاريخ ووقت الإجراء: <span className="text-white font-mono">{new Date().toLocaleString('ar-YE')}</span></div>
              </div>
            </div>

            <button
              onClick={() => setSubview('admin_correction')}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5"
              title="العودة لقائمة الفواتير"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Form container */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Scope Selection */}
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 pt-2"
                >
                  {adminCorrectionScope === 'device' && selectedItemForEdit && (
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

                  {/* Status update block */}
                  <div className="space-y-2 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                    <label className="text-xs font-bold text-orange-500 block">الحالة الجديدة المطلوبة للجهاز:</label>
                    <select
                      value={adminNewStatus}
                      onChange={(e) => setAdminNewStatus(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all text-white font-bold"
                    >
                      {ALL_STATUSES.map(st => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Save actions */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedItemForEdit(null)}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-bold font-cairo border border-white/5"
                    >
                      إلغاء التغييرات
                    </button>

                    <button
                      type="button"
                      disabled={adminSaveLoading || !adminNewStatus}
                      onClick={handleAdminSaveDevice}
                      className="px-6 py-2.5 bg-gradient-to-l from-orange-600 to-orange-700 hover:from-orange-500 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {adminSaveLoading ? 'جاري الحفظ...' : 'حفظ التغييرات الإدارية'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
`;
  
content += restOfFile;
fs.writeFileSync('src/components/DeviceManagement.tsx', content);
console.log("Restored end of file successfully!");
