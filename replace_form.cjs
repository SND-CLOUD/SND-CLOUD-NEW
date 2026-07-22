const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagement.tsx', 'utf8');

const target = fs.readFileSync('/tmp/add_form.txt', 'utf8');

const replacement = `              className="bg-[#1a1a1a] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl p-6 sm:p-8 w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] shadow-2xl relative overflow-y-auto"
            >
            {/* Unified Header for Modal */}
            <div className="flex items-center gap-2 mb-6" dir="rtl">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
              >
                <X size={18} />
              </button>
              <h3 className="text-xl font-bold text-white m-0 p-0 font-cairo">{t('users.registerUser')}</h3>
            </div>
              <form onSubmit={handleAddUser} className="space-y-4 text-right font-cairo" dir="rtl">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">الاسم الكامل <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-right"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">المسمى الوظيفي</label>
                    <select
                      value={formData.job_title_id || ''}
                      onChange={(e) => setFormData({ ...formData, job_title_id: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-right appearance-none"
                    >
                      <option value="">لا يوجد</option>
                      {jobTitles.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">رقم الهاتف</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setFormData({...formData, phone: 'لا يوجد'})} className="px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white whitespace-nowrap">لا يوجد</button>
                      <input 
                        type="text" 
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-right"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">البريد الإلكتروني</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setFormData({...formData, email: 'لا يوجد'})} className="px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white whitespace-nowrap">لا يوجد</button>
                      <input 
                        type="text" 
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-left font-sans"
                      />
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">حالة الحساب</label>
                    <select
                      value={formData.account_status || 'نشط'}
                      onChange={(e) => setFormData({ ...formData, account_status: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-right appearance-none"
                    >
                      <option value="نشط">نشط</option>
                      <option value="معطل">معطل</option>
                      <option value="موقوف">موقوف</option>
                    </select>
                  </div>

                  {/* Device Access Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">صلاحية استخدام الأجهزة</label>
                    <select
                      value={formData.device_access_type || 'عام'}
                      onChange={(e) => setFormData({ ...formData, device_access_type: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-right appearance-none"
                    >
                      <option value="عام">عام (كل الأجهزة)</option>
                      <option value="مخصص">مخصص (جهاز محدد فقط)</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">ملاحظات</label>
                    <input 
                      type="text"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-right"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">اسم المستخدم (بالإنجليزي) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '') })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-left font-mono"
                    />
                  </div>
                </div>
                
                {/* Password Fields with Eye Icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">كلمة المرور <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type={showAddPassword ? "text" : "password"} 
                        required
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:border-orange-500 outline-none text-white text-right font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddPassword(!showAddPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">تأكيد كلمة المرور <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type={showAddConfirmPassword ? "text" : "password"} 
                        required
                        value={addConfirmPassword || ''}
                        onChange={(e) => setAddConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:border-orange-500 outline-none text-white text-right font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddConfirmPassword(!showAddConfirmPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showAddConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {formData.password && addConfirmPassword && formData.password !== addConfirmPassword && (
                  <p className="text-xs text-red-500 font-bold text-right font-cairo" dir="rtl">كلمتا المرور غير متطابقتين!</p>
                )}

                <div className="space-y-1.5 mt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase mr-1">نوع الصلاحية</label>
                  <select 
                    value={formData.role || 'data_entry'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none appearance-none text-white text-right"
                  >
                    <option value="data_entry">مدخل بيانات (Data Entry)</option>
                    <option value="manager">مدير نظام (Manager)</option>
                  </select>
                </div>

                {renderPermissionsTable(false)}

                <button 
                  type="submit" 
                  disabled={loading || (formData.password !== addConfirmPassword) || !formData.name?.trim() || !formData.username?.trim()} 
                  className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 font-cairo disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'تسجيل المستخدم'}
                </button>
              </form>
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/UserManagement.tsx', code);
console.log('Replaced successfully');
