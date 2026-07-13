const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const startMarker = '{/* Payment Mode Selector */}';
const endMarker = '{/* Form Actions */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `
                  {/* FORM BODY - Unified Compact Layout */}
                  <div className="max-w-xl mx-auto bg-[#141414] border border-white/5 rounded-2xl p-3.5 space-y-1.5 font-cairo">
                     
                     {/* 1. الصندوق المالي */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1 border-b border-white/5">
                        <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                          الصندوق المالي:
                        </label>
                        <select 
                          value={selectedFundId}
                          onFocus={handleInputFocus} onChange={(e) => setSelectedFundId(e.target.value)}
                          className="flex-1 max-w-xs bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-amber-500/50 text-right appearance-none font-semibold"
                          required
                        >
                           <option value="" className="bg-[#1c1c1c]">-- اختر الصندوق --</option>
                           {funds.map(f => {
                             const mCur = currencies.find(c => c.name === f.currency);
                             const curSym = mCur ? mCur.symbol : f.currency;
                             const typeStr = f.type === 'cash' ? 'نقدي' : 'بنكي';
                             return (
                               <option key={f.id} value={f.id} className="bg-[#1c1c1c]">
                                 {\`\${f.name} / \${curSym} / \${typeStr}\`}
                               </option>
                             );
                           })}
                        </select>
                     </div>

                     {/* 2. نوع العملية */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1 border-b border-white/5">
                        <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                          نوع العملية:
                        </label>
                        <select 
                          value={selectedCategory}
                          onFocus={handleInputFocus} onChange={(e) => setSelectedCategory(e.target.value)}
                          className="flex-1 max-w-xs bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-amber-500/50 appearance-none text-right font-semibold"
                          required
                        >
                           {txTypes
                             .filter(cat => cat.type === activeSegment)
                             .map(cat => (
                               <option key={cat.id} value={cat.name} className="bg-[#1c1c1c]">{cat.name}</option>
                             ))
                           }
                        </select>
                     </div>

                     {/* 3. اسم العميل */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1 border-b border-white/5">
                        <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                          اسم العميل / المستفيد:
                        </label>
                        <div className="flex-1 max-w-xs relative bg-transparent text-right">
                           <div className="flex gap-1">
                             <input 
                               type="text"
                               placeholder="ابحث بالحرف أو اختر من السهم..."
                               value={customerSearch}
                               onChange={(e) => {
                                  setCustomerSearch(e.target.value);
                                  setSelectedCustomerId('');
                                  setShowCustomerDropdown(true);
                               }}
                               onFocus={(e) => { setShowCustomerDropdown(true); handleInputFocus(e); }}
                               className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-amber-500/50"
                             />
                             <button 
                               type="button"
                               onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                               className="px-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 border border-white/5"
                             >
                               <ArrowUpDown size={14} />
                             </button>
                           </div>

                           {/* Combobox Dropdown */}
                           {showCustomerDropdown && (
                              <div className="absolute top-full right-0 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-30 shadow-2xl max-h-40 overflow-y-auto">
                                {customers
                                  .filter(c => 
                                    !customerSearch || 
                                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                    (c.phone1 && c.phone1.includes(customerSearch))
                                  )
                                  .map(c => (
                                    <button 
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                         setCustomerSearch(c.name);
                                         setSelectedCustomerId(c.id);
                                         // In the future: set liabilityCurrency = c.liabilityCurrency || 'USD';
                                         setShowCustomerDropdown(false);
                                      }}
                                      className="w-full text-right px-3 py-2 text-[10px] text-gray-300 hover:bg-amber-600/20 hover:text-white transition-all font-cairo border-b border-white/5 last:border-0"
                                    >
                                      {c.name} {c.companyName ? \`(\${c.companyName})\` : ''}
                                    </button>
                                  ))}
                                  {customers.filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                                     <div className="p-3 text-center text-xs text-gray-650">لا توجد نتائج مسبقة، السند سيسجل باسم جديد</div>
                                  )}
                              </div>
                           )}
                        </div>
                     </div>

                     {/* 4. عملة الذمة */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1 border-b border-white/5">
                        <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                          عملة الذمة (الحساب):
                        </label>
                        <select 
                          value={liabilityCurrency}
                          onFocus={handleInputFocus} onChange={(e) => setLiabilityCurrency(e.target.value)}
                          className="flex-1 max-w-xs bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-blue-500/50 text-right appearance-none font-semibold"
                          required
                        >
                           {currencies.map(c => (
                             <option key={c.id} value={c.name} className="bg-[#1c1c1c]">
                               {\`\${c.name} - \${c.symbol}\`}
                             </option>
                           ))}
                        </select>
                     </div>

                     {/* 5. المبلغ المدفوع الحالي */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1 border-b border-white/5">
                        <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                          المبلغ المدفوع الحالي:
                        </label>
                        <div className="flex-1 max-w-xs relative text-right">
                           <input 
                             type="text"
                             inputMode="decimal"
                             dir="ltr"
                             lang="en"
                             onFocus={e => { e.target.select(); handleInputFocus(e); }}
                             placeholder="0.00"
                             value={voucherAmount}
                             onChange={(e) => {
                               const val = e.target.value.replace(/[^0-9.]/g, '');
                               const parts = val.split('.');
                               if (parts.length > 2) return;
                               setVoucherAmount(val);
                             }}
                             className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-emerald-400 font-bold font-mono outline-none focus:border-amber-500/50 placeholder:text-gray-800 text-left"
                             required
                           />
                           {selectedCurrency && (
                             <span className="absolute right-3 top-1 text-[9px] text-gray-500 font-bold">{selectedCurrency}</span>
                           )}
                        </div>
                     </div>

                     {/* 6. صرف الدفع + 7. المبلغ المسدد */}
                     <div className="flex flex-col gap-2 py-2 border-b border-white/5">
                       <div className="grid grid-cols-2 gap-2">
                         <div>
                           <label className="block text-[9px] text-gray-400 font-bold mb-1 font-cairo text-center">
                             صرف الدفع
                           </label>
                           <input
                             type="text"
                             inputMode="decimal"
                             dir="ltr"
                             lang="en"
                             value={selectedCurrency === liabilityCurrency ? '1' : voucherExchangeRate}
                             disabled={selectedCurrency === liabilityCurrency || !selectedCurrency || !liabilityCurrency}
                             onFocus={e => e.target.select()}
                             onChange={(e) => {
                               const val = e.target.value.replace(/[^0-9.]/g, '');
                               const parts = val.split('.');
                               if (parts.length > 2) return;
                               setVoucherExchangeRate(val);
                             }}
                             className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 text-center text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                             placeholder="1.00"
                           />
                         </div>
                         <div>
                           <label className="block text-[9px] text-blue-400 font-bold mb-1 font-cairo text-center">
                             المبلغ المسدد بالذمة
                           </label>
                           <div className="w-full h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-center font-mono text-xs font-black text-blue-300" dir="ltr">
                             {(() => {
                               if (selectedCurrency === liabilityCurrency) return (parseFloat(voucherAmount) || 0).toFixed(2);
                               const rate = parseFloat(voucherExchangeRate) || 1;
                               return rate > 0 ? ((parseFloat(voucherAmount) || 0) / rate).toFixed(2) : '0.00';
                             })()}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Bank specific fields */}
                     {(() => {
                        const matchedFund = funds.find(f => f.id === selectedFundId);
                        if (matchedFund && matchedFund.type !== 'cash') {
                          return (
                            <>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1 border-b border-white/5">
                                 <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                                   اسم المودع الشخصي:
                                 </label>
                                 <input 
                                   type="text"
                                   placeholder="أدخل اسم مودع المبلغ بالكامل..."
                                   value={depositorName}
                                   onFocus={handleInputFocus} onChange={(e) => setDepositorName(e.target.value)}
                                   className="flex-1 max-w-xs bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-amber-500/50"
                                   required
                                 />
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1 border-b border-white/5">
                                 <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                                   رقم المرجع البنكي:
                                 </label>
                                 <input 
                                   type="text"
                                   placeholder="أدخل رقم المرجع أو الشيك..."
                                   value={referenceNumber}
                                   onFocus={handleInputFocus} onChange={(e) => setReferenceNumber(e.target.value)}
                                   className="flex-1 max-w-xs bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-amber-500/50 font-mono text-left"
                                   required
                                 />
                              </div>
                            </>
                          );
                        }
                        return null;
                     })()}

                     {/* 10. ملاحظات السند */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-1">
                        <label className="text-[11px] font-bold text-gray-400 min-w-[120px]">
                          البيان والملاحظات:
                        </label>
                        <input 
                          type="text"
                          placeholder="أدخل ملاحظات السند..."
                          value={voucherNotes}
                          onFocus={handleInputFocus} onChange={(e) => setVoucherNotes(e.target.value)}
                          className="flex-1 max-w-xs bg-black/40 border border-white/5 rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-amber-500/50"
                          required
                        />
                     </div>
                  </div>

                  `;
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/components/Vault.tsx', code);
  console.log("Success form replace");
} else {
  console.log("Markers not found");
}
