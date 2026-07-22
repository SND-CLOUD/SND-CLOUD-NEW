const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagement.tsx', 'utf8');

const target = fs.readFileSync('/tmp/edit_form.txt', 'utf8');

const replacement = `                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={\`bg-[#1a1a1a] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl p-6 sm:p-8 w-full \${isPasswordOnly ? 'max-w-md' : 'max-w-3xl'} h-full sm:h-auto sm:max-h-[90vh] shadow-2xl relative overflow-y-auto\`}
              >
              {/* Unified Header for Modal */}
              <div className="flex items-center gap-2 mb-2" dir="rtl">
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
                <h3 className="text-xl font-bold text-white m-0 p-0 font-cairo">
                  {isPasswordOnly ? 'تعديل كلمة المرور' : t('users.editUser')}
                </h3>
              </div>
                <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider text-right">Account ID: {editingUser.id}</p>
                
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  {/* General Manager View: Only password change fields */}
                  {isPasswordOnly ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                        <label className="text-xs font-bold text-gray-500 uppercase mr-1">كلمة المرور الجديدة</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={editingUser.password}
                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:border-orange-500 outline-none text-white text-right font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                        <label className="text-xs font-bold text-gray-500 uppercase mr-1">تأكيد كلمة المرور الجديدة</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            required
                            value={editingConfirmPassword}
                            onChange={(e) => setEditingConfirmPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:border-orange-500 outline-none text-white text-right font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {editingUser.password && editingConfirmPassword && editingUser.password !== editingConfirmPassword && (
                        <p className="text-xs text-red-500 font-bold text-right font-cairo" dir="rtl">كلمتا المرور غير متطابقتين!</p>
                      )}
                    </div>
                  ) : (
                    // Regular User Edit View
                    <div className="text-right font-cairo" dir="rtl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase mr-1">الاسم الكامل <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            disabled={!canManageUsers}
                            value={editingUser.name || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right"
                          />
                        </div>

                        {/* Job Title */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase mr-1">المسمى الوظيفي</label>
                          <select
                            value={editingUser.job_title_id || ''}
                            disabled={!canManageUsers}
                            onChange={(e) => setEditingUser({ ...editingUser, job_title_id: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right appearance-none"
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
                            <button type="button" disabled={!canManageUsers} onClick={() => setEditingUser({...editingUser, phone: 'لا يوجد'})} className="px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white whitespace-nowrap disabled:opacity-50">لا يوجد</button>
                            <input 
                              type="text" 
                              disabled={!canManageUsers}
                              value={editingUser.phone || ''}
                              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase mr-1">البريد الإلكتروني</label>
                          <div className="flex gap-2">
                            <button type="button" disabled={!canManageUsers} onClick={() => setEditingUser({...editingUser, email: 'لا يوجد'})} className="px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white whitespace-nowrap disabled:opacity-50">لا يوجد</button>
                            <input 
                              type="email" 
                              disabled={!canManageUsers}
                              value={editingUser.email || ''}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-left font-sans"
                            />
                          </div>
                        </div>

                        {/* Account Status */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase mr-1">حالة الحساب</label>
                          <select
                            value={editingUser.account_status || 'نشط'}
                            disabled={!canManageUsers}
                            onChange={(e) => setEditingUser({ ...editingUser, account_status: e.target.value as any })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right appearance-none"
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
                            value={editingUser.device_access_type || 'عام'}
                            disabled={!canManageUsers}
                            onChange={(e) => setEditingUser({ ...editingUser, device_access_type: e.target.value as any })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right appearance-none"
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
                            disabled={!canManageUsers}
                            value={editingUser.notes || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right"
                          />
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase mr-1">اسم المستخدم (بالإنجليزي) <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            disabled={!canManageUsers}
                            value={editingUser.username || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '') })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-left font-mono"
                          />
                        </div>
                      </div>

                      {/* Password Edit Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase mr-1">{t('users.newPassword')}</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              required
                              value={editingUser.password || ''}
                              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:border-orange-500 outline-none text-white text-right font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase mr-1">تأكيد كلمة المرور</label>
                          <div className="relative">
                            <input 
                              type={showConfirmPassword ? "text" : "password"} 
                              required
                              value={editingConfirmPassword || ''}
                              onChange={(e) => setEditingConfirmPassword(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:border-orange-500 outline-none text-white text-right font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {editingUser.password && editingConfirmPassword && editingUser.password !== editingConfirmPassword && (
                        <p className="text-xs text-red-500 font-bold text-right font-cairo mt-2" dir="rtl">كلمتا المرور غير متطابقتين!</p>
                      )}

                      <div className="space-y-1.5 mt-4">
                        <label className="text-xs font-bold text-gray-500 uppercase mr-1">{t('users.role')}</label>
                        <select 
                          value={editingUser.role || 'data_entry'}
                          disabled={!canManageUsers}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right appearance-none"
                        >
                          <option value="data_entry">{ROLE_MAP.data_entry} (Data Entry)</option>
                          <option value="manager">{ROLE_MAP.manager} (Manager)</option>
                        </select>
                      </div>

                      <div className="mt-4">
                        {renderPermissionsTable(true)}
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || (isPasswordOnly && editingUser.password !== editingConfirmPassword) || (!isPasswordOnly && editingUser.password !== editingConfirmPassword)} 
                    className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 font-cairo disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('users.saveChanges')}
                  </button>
                </form>
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/UserManagement.tsx', code);
console.log('Replaced edit form successfully');
