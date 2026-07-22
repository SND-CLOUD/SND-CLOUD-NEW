const fs = require('fs');
let code = fs.readFileSync('src/components/AccountingInputs.tsx', 'utf8');

const regex = /<form onSubmit=\{handleJobTitleSubmit\} className="bg-\[#1c1c1c\] p-4 rounded-xl border border-white\/10 space-y-4 animate-in fade-in slide-in-from-top-2">([\s\S]*?)<\/form>/;

const replacement = `<form onSubmit={handleJobTitleSubmit} className="bg-[#1c1c1c] p-4 rounded-xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-400 font-bold block mb-1">اسم الوظيفة <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        required
                        placeholder="مثال: مدير مبيعات"
                        value={jobTitleForm.title}
                        onChange={e => setJobTitleForm({...jobTitleForm, title: e.target.value})}
                        className="w-full bg-[#242424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-bold block mb-1">تفاصيل</label>
                      <input 
                        type="text"
                        placeholder="تفاصيل إضافية..."
                        value={jobTitleForm.notes}
                        onChange={e => setJobTitleForm({...jobTitleForm, notes: e.target.value})}
                        className="w-full bg-[#242424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => { setJobTitleForm({id:'', job_number:'', title:'', notes:''}); setEditingJobTitleId(null); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                      إلغاء
                    </button>
                    <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer">
                      <Check size={16} />
                      {editingJobTitleId && editingJobTitleId !== 'new' ? 'تحديث' : 'حفظ الوظيفة'}
                    </button>
                  </div>
                </form>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AccountingInputs.tsx', code);
console.log('Fixed job title form');
