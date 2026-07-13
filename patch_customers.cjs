const fs = require('fs');
let code = fs.readFileSync('src/components/Customers.tsx', 'utf8');

// Insert editLiabilityCurrency
code = code.replace(/const \[editHasWhatsapp, setEditHasWhatsapp\] = useState\(true\);/g, "const [editHasWhatsapp, setEditHasWhatsapp] = useState(true);\n  const [editLiabilityCurrency, setEditLiabilityCurrency] = useState('USD');");

// Insert logic inside handleEditCustomer
code = code.replace(/setEditHasWhatsapp\(customer.hasWhatsapp !== undefined \? customer.hasWhatsapp : true\);/g, "setEditHasWhatsapp(customer.hasWhatsapp !== undefined ? customer.hasWhatsapp : true);\n      setEditLiabilityCurrency(customer.liabilityCurrency || 'USD');");

// Inside handleSaveCustomer firebase update
code = code.replace(/notes: editNotes,/g, "notes: editNotes,\n          liabilityCurrency: editLiabilityCurrency,");

// Inside SQLite update
code = code.replace(/notes = \?, hasWhatsapp = \?/g, "notes = ?, hasWhatsapp = ?, liabilityCurrency = ?");
code = code.replace(/editNotes,\n              editHasWhatsapp \? 1 : 0,\n              selectedCustomer.id/g, "editNotes,\n              editHasWhatsapp ? 1 : 0,\n              editLiabilityCurrency,\n              selectedCustomer.id");

// Insert UI field
const notesField = `                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 font-cairo">تفاصيل وملاحظات إضافية</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-cairo text-gray-300 outline-none focus:border-orange-500/50 resize-none h-20"
                      />
                    </div>`;

const currencyField = `
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 font-cairo">عملة الذمة (الحساب)</label>
                      <select
                        value={editLiabilityCurrency}
                        onChange={(e) => setEditLiabilityCurrency(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-cairo text-gray-300 outline-none focus:border-orange-500/50 appearance-none"
                      >
                        <option value="USD">دولار (USD)</option>
                        <option value="SAR">ريال سعودي (SAR)</option>
                        <option value="YER">ريال يمني (YER)</option>
                        <option value="EUR">يورو (EUR)</option>
                      </select>
                    </div>`;

code = code.replace(notesField, currencyField + '\n' + notesField);

// Insert readonly UI field
const readonlyNotesField = `                    <div className="space-y-1 md:col-span-2">
                      <span className="text-[10px] text-gray-500 font-cairo block">تفاصيل إضافية:</span>
                      <p className="text-xs text-white font-cairo leading-relaxed">{selectedCustomer.notes || 'لا يوجد'}</p>
                    </div>`;

const readonlyCurrencyField = `
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 font-cairo block">عملة الذمة الافتراضية:</span>
                      <p className="text-xs text-white font-cairo font-bold">{getArabicCurrencyName(selectedCustomer.liabilityCurrency || 'USD')}</p>
                    </div>`;

code = code.replace(readonlyNotesField, readonlyCurrencyField + '\n' + readonlyNotesField);


fs.writeFileSync('src/components/Customers.tsx', code);
