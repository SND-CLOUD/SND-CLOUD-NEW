const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagement.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">([\s\S]*?)<\/div>\n\s*\{\/\* Add User Modal \*\/\}/;

const replacement = `<div className="grid grid-cols-1 gap-4" dir="rtl">
        {users.filter(u => canViewAllUsers || u.id === currentUser.id).map(u => {
          const isUserAdmin = u.isPrimary || u.username === 'admin';
          const isUserActive = (u.isActive as any) === undefined || (u.isActive as any) === null || (u.isActive as any) === true || (u.isActive as any) === 1 || (u.isActive as any) === 'true' || (u.isActive as any) === '1';
          const isCurrentUserGM = currentUser.isPrimary || currentUser.username === 'admin';
          const canEditThisUser = isUserAdmin 
            ? isCurrentUserGM 
            : (isCurrentUserGM || u.id === currentUser.id || canManageUsers);

          const accountStatus = u.account_status || (isUserActive ? 'نشط' : 'معطل');

          return (
            <div key={u.id} className="bg-[#242424] p-3 sm:p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group">
              {/* First Row */}
              <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                {/* Initial */}
                <div className={\`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 \${isUserAdmin ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-400'}\`}>
                  {u.name.charAt(0)}
                </div>
                
                {/* User Number */}
                <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded border border-white/5 font-mono">
                  {u.userNumber || (isUserAdmin ? 100 : '')}
                </span>

                {/* Full Name */}
                <span className="font-bold text-white text-sm font-cairo">
                  {u.name}
                </span>

                {/* Username */}
                {u.username !== 'admin' && u.username !== 'rd' && (
                  <span className="text-[10px] text-gray-500">@{u.username}</span>
                )}

                {/* Role */}
                <span className="text-[10px] text-gray-400 font-cairo bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {ROLE_MAP[u.role as keyof typeof ROLE_MAP] || u.role}
                </span>

                {/* Device Number */}
                <div className="flex items-center gap-1 text-[10px] bg-white/5 text-gray-300 px-1.5 py-0.5 rounded border border-white/10 font-mono">
                  <Smartphone size={12} className="text-amber-500" />
                  <span>{u.linked_device_id || 'بدون'}</span>
                </div>

                {/* Network Status */}
                <div className="flex items-center gap-1" title={u.network_status || 'غير متصل'}>
                  {u.network_status === 'متصل' ? (
                    <Wifi size={14} className="text-emerald-500" />
                  ) : (
                    <WifiOff size={14} className="text-gray-500" />
                  )}
                </div>

                {/* Account Status */}
                <div className="flex items-center gap-1 mr-auto" title={accountStatus}>
                  {accountStatus === 'نشط' ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : accountStatus === 'معطل' ? (
                    <PauseCircle size={16} className="text-yellow-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
              </div>

              {/* Second Row */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                {/* Job Title */}
                <span className="text-xs text-gray-500 font-cairo font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                  {jobTitles.find(j => j.id === u.job_title_id)?.title || 'بدون مسمى وظيفي'}
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                   {!hasUsersPermission ? (
                     // Only show "تعديل كلمة المرور" (Change Password) button if they are themselves AND they are General Manager
                     u.id === currentUser.id && (
                       <button
                         onClick={() => {
                           setEditingUser(u);
                           setEditingConfirmPassword(u.password || '');
                           setShowPassword(false);
                           setShowConfirmPassword(false);
                         }}
                         className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white border border-orange-500/20 font-bold rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-cairo shadow-lg shadow-orange-950/20 cursor-pointer"
                         title="تعديل كلمة المرور"
                       >
                         <Lock size={13} />
                         <span>تعديل كلمة المرور</span>
                       </button>
                     )
                   ) : (
                     // If they have settings_users permissions, we render prominent Edit and Activate buttons
                     <>
                       {/* Edit Button */}
                       {canEditThisUser && (
                         <button 
                           onClick={() => {
                             setEditingUser(u);
                             setEditingConfirmPassword(u.password || '');
                             setShowPassword(false);
                             setShowConfirmPassword(false);
                           }}
                           className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center gap-1 text-[11px] sm:text-xs font-bold font-cairo border shadow-sm bg-orange-500/15 border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white cursor-pointer hover:shadow-orange-950/10"
                           title="تعديل"
                         >
                           <Edit2 size={13} />
                           <span>تعديل</span>
                         </button>
                       )}

                       {/* Advanced View Button */}
                       <button 
                         onClick={() => setViewingUser(u)}
                         className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center gap-1 text-[11px] sm:text-xs font-bold font-cairo border shadow-sm bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer hover:shadow-blue-950/10"
                         title="عرض تفاصيل"
                       >
                         <Eye size={13} />
                         <span>عرض</span>
                       </button>
                     </>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Add User Modal */}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/UserManagement.tsx', code);
console.log('Replaced successfully');
