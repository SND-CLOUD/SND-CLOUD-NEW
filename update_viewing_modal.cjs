const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagement.tsx', 'utf8');

const regex = /\{\/\* View User Modal \*\/\}([\s\S]*?)<\/AnimatePresence>/;

const replacement = `{/* View User Modal */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl p-6 sm:p-8 w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] shadow-2xl relative overflow-y-auto font-cairo text-right"
              dir="rtl"
            >
              {/* Unified Header for Modal */}
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <button 
                  onClick={() => setViewingUser(null)} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
                <h3 className="text-xl font-bold text-white m-0 p-0">عرض متقدم (تفاصيل المستخدم)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account ID */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">معرف الحساب (ID)</label>
                    <p className="text-sm text-gray-300 font-mono">{viewingUser.id || '-'}</p>
                  </div>
                  {/* User Number */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">رقم المستخدم</label>
                    <p className="text-sm text-gray-300 font-mono">{viewingUser.userNumber || (viewingUser.username === 'admin' ? 100 : '-')}</p>
                  </div>
                  {/* Name */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">الاسم الكامل</label>
                    <p className="text-sm text-white font-bold">{viewingUser.name || '-'}</p>
                  </div>
                  {/* Username */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">اسم المستخدم (للدخول)</label>
                    <p className="text-sm text-amber-400 font-mono font-bold">@{viewingUser.username}</p>
                  </div>
                  {/* Job Title */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">المسمى الوظيفي</label>
                    <p className="text-sm text-white font-bold">{jobTitles.find(j => j.id === viewingUser.job_title_id)?.title || 'لا يوجد'}</p>
                  </div>
                  {/* Role */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">نوع الصلاحية بالبرنامج</label>
                    <p className="text-sm text-white font-bold">{ROLE_MAP[viewingUser.role as keyof typeof ROLE_MAP] || viewingUser.role}</p>
                  </div>
                  {/* Phone */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">رقم الهاتف</label>
                    <p className="text-sm text-white font-bold font-mono text-right" dir="ltr">{viewingUser.phone || 'لا يوجد'}</p>
                  </div>
                  {/* Email */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">البريد الإلكتروني</label>
                    <p className="text-sm text-white font-sans">{viewingUser.email || 'لا يوجد'}</p>
                  </div>
                  {/* Account Status */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">حالة الحساب</label>
                    <p className={\`text-sm font-bold \${viewingUser.account_status === 'معطل' || viewingUser.account_status === 'موقوف' ? 'text-red-400' : 'text-emerald-400'}\`}>
                      {viewingUser.account_status || 'نشط'}
                    </p>
                  </div>
                  {/* Network Status */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">حالة الشبكة</label>
                    <p className={\`text-sm font-bold \${viewingUser.network_status === 'متصل' ? 'text-emerald-400' : 'text-gray-400'}\`}>
                      {viewingUser.network_status || 'غير متصل'}
                    </p>
                  </div>
                  {/* Device Access Type */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">صلاحية استخدام الأجهزة</label>
                    <p className="text-sm text-white font-bold">{viewingUser.device_access_type || 'عام'}</p>
                  </div>
                  {/* Linked Device */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">الجهاز المرتبط</label>
                    <p className="text-sm text-white font-bold font-mono">{viewingUser.linked_device_id || 'لا يوجد'}</p>
                  </div>
                  {/* Notes */}
                  <div className="space-y-1.5 p-3 bg-white/[0.02] rounded-xl border border-white/5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500">ملاحظات</label>
                    <p className="text-sm text-gray-300">{viewingUser.notes || 'لا يوجد'}</p>
                  </div>
                  
                  {/* Timestamps */}
                  <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">تاريخ التسجيل بالبرنامج</label>
                    <p className="text-xs text-gray-400 font-mono text-right" dir="ltr">
                      {viewingUser.created_at || (viewingUser as any).createdAt ? new Date(viewingUser.created_at || (viewingUser as any).createdAt).toLocaleString('ar-EG') : 'غير متوفر'}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">تاريخ آخر تعديل</label>
                    <p className="text-xs text-gray-400 font-mono text-right" dir="ltr">
                      {viewingUser.updated_at ? new Date(viewingUser.updated_at).toLocaleString('ar-EG') : 'غير متوفر'}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">آخر تسجيل دخول</label>
                    <p className="text-xs text-emerald-500/80 font-mono text-right" dir="ltr">
                      {viewingUser.last_login || (viewingUser as any).lastLogin ? new Date(viewingUser.last_login || (viewingUser as any).lastLogin).toLocaleString('ar-EG') : 'لم يسجل دخول بعد'}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-3 bg-black/20 rounded-xl border border-white/5">
                    <label className="text-[11px] font-bold text-gray-500">آخر تسجيل خروج</label>
                    <p className="text-xs text-red-500/80 font-mono text-right" dir="ltr">
                      {viewingUser.last_logout || (viewingUser as any).lastLogout ? new Date(viewingUser.last_logout || (viewingUser as any).lastLogout).toLocaleString('ar-EG') : 'لم يسجل خروج بعد'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/UserManagement.tsx', code);
console.log('Replaced successfully');
