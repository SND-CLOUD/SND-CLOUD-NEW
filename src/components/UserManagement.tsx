import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, setDoc, where, getDocs } from '../firebase';
import { db } from '../firebase';
import { User, AppPermissions } from '../types';
import { ShieldCheck, UserPlus, Trash2, Edit2, ShieldAlert, Loader2, Save, X, ArrowLeft, Check, Lock, Package, Wallet, Users, FileText, BarChart, Settings, UserCircle, Cpu, UserCheck, UserX, Eye, EyeOff, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function UserManagement({ currentUser }: { currentUser: User }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showAddConfirmPassword, setShowAddConfirmPassword] = useState(false);

  // Confirm password values
  const [editingConfirmPassword, setEditingConfirmPassword] = useState('');
  const [addConfirmPassword, setAddConfirmPassword] = useState('');

  const DEFAULT_PERMISSIONS: AppPermissions = {
    inventory: { view: true, add: true, edit: true, delete: false, print: true },
    vault: { view: true, add: true, edit: true, delete: false, print: true },
    customers: { view: true, add: true, edit: true, delete: false, print: true },
    invoices: { view: true, add: true, edit: true, delete: false, print: true },
    reports: { view: true, print: true },
    settings: { view: false, edit: false },
    settings_main_data: { view: false, add: false, edit: false, delete: false, print: false },
    settings_devices_engineers: { view: false, add: false, edit: false, delete: false, print: false },
    settings_device_management: { view: false, add: false, edit: false, delete: false, print: false },
    settings_users: { view: false, add: false, edit: false, delete: false, print: false }
  };

  const [formData, setFormData] = useState<Partial<User>>({ 
    username: '', 
    password: '', 
    name: '', 
    role: 'data_entry',
    permissions: DEFAULT_PERMISSIONS
  });

  // Automatically ensure that General Manager (admin/admin) exists in database on mount
  useEffect(() => {
    const checkAndProvisionAdmin = async () => {
      try {
        const q = query(collection(db, 'users'), where('username', '==', 'admin'));
        const snap = await getDocs(q);
        if (snap.empty) {
          const adminData: User = {
            username: 'admin',
            password: 'admin',
            name: 'المدير العام',
            role: 'admin',
            isPrimary: true,
            isActive: true,
            userNumber: 100
          };
          const docRef = doc(db, 'users', 'primary-admin');
          await setDoc(docRef, adminData);
        }
      } catch (err) {
        console.error("Error provisioning admin account:", err);
      }
    };
    checkAndProvisionAdmin();
  }, []);

  const togglePermission = (section: keyof AppPermissions, action: string, isEditing: boolean = false) => {
    if (isEditing && editingUser) {
      const currentPerms = editingUser.permissions || DEFAULT_PERMISSIONS;
      const sectionPerms = { ...(currentPerms[section] || DEFAULT_PERMISSIONS[section] || {}) } as any;
      sectionPerms[action] = !sectionPerms[action];
      setEditingUser({
        ...editingUser,
        permissions: {
          ...currentPerms,
          [section]: sectionPerms
        }
      });
    } else {
      const currentPerms = formData.permissions || DEFAULT_PERMISSIONS;
      const sectionPerms = { ...(currentPerms[section] || DEFAULT_PERMISSIONS[section] || {}) } as any;
      sectionPerms[action] = !sectionPerms[action];
      setFormData({
        ...formData,
        permissions: {
          ...currentPerms,
          [section]: sectionPerms
        }
      });
    }
  };

  const toggleAllPermissions = (isEditing: boolean = false) => {
    const currentPerms = isEditing ? (editingUser?.permissions || DEFAULT_PERMISSIONS) : (formData.permissions || DEFAULT_PERMISSIONS);
    const sections: (keyof AppPermissions)[] = [
      'inventory', 
      'vault', 
      'customers', 
      'invoices', 
      'reports', 
      'settings_main_data',
      'settings_devices_engineers',
      'settings_device_management',
      'settings_users'
    ];
    
    let allSelected = true;
    for (const section of sections) {
      const defaultSection = DEFAULT_PERMISSIONS[section] as any;
      const currentSection = (currentPerms[section] || {}) as any;
      for (const action of PERMISSIONS_ORDER) {
        if (defaultSection[action] !== undefined) {
          if (!currentSection[action]) {
            allSelected = false;
            break;
          }
        }
      }
      if (!allSelected) break;
    }

    const newPerms = { ...currentPerms };
    for (const section of sections) {
      const defaultSection = DEFAULT_PERMISSIONS[section] as any;
      const currentSection = { ...(currentPerms[section] || {}) } as any;
      for (const action of PERMISSIONS_ORDER) {
        if (defaultSection[action] !== undefined) {
          currentSection[action] = !allSelected;
        }
      }
      newPerms[section] = currentSection;
    }

    if (isEditing && editingUser) {
      setEditingUser({
        ...editingUser,
        permissions: newPerms
      });
    } else {
      setFormData({
        ...formData,
        permissions: newPerms
      });
    }
  };

  const SECTION_MAP: Record<string, { label: string; icon: any }> = {
    inventory: { label: 'المخزون', icon: Package },
    vault: { label: 'الخزينة', icon: Wallet },
    customers: { label: 'العملاء', icon: Users },
    invoices: { label: 'الفواتير', icon: FileText },
    reports: { label: 'التقارير', icon: BarChart },
    settings_main_data: { label: 'اعداد بيانات رئيسية', icon: Settings },
    settings_devices_engineers: { label: 'اعداد أجهزة ومهندسين', icon: Cpu },
    settings_device_management: { label: 'اعداد إدارة أجهزة', icon: Settings },
    settings_users: { label: 'اعداد مستخدمون', icon: Users }
  };

  const PERMISSIONS_ORDER = ['view', 'add', 'edit', 'delete', 'print'];
  
  const PERMISSION_LABELS: Record<string, string> = {
    view: 'عرض',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    print: 'طباعة'
  };

  const renderPermissionsTable = (isEditing: boolean = false) => {
    const currentPerms = isEditing ? (editingUser?.permissions || DEFAULT_PERMISSIONS) : (formData.permissions || DEFAULT_PERMISSIONS);
    const sections: (keyof AppPermissions)[] = [
      'inventory', 
      'vault', 
      'customers', 
      'invoices', 
      'reports', 
      'settings_main_data',
      'settings_devices_engineers',
      'settings_device_management',
      'settings_users'
    ];
    
    return (
      <div className="space-y-4 border-t border-white/5 pt-6 mt-6">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap" dir="rtl">
          <h4 className="text-sm font-black text-white flex items-center gap-2 font-cairo m-0">
            <ShieldCheck size={18} className="text-orange-500" />
            جدول صلاحيات المستخدم المخصصة
          </h4>
          
          {canManageUsers && (
            <button
              type="button"
              onClick={() => toggleAllPermissions(isEditing)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#242424] hover:bg-[#2c2c2c] border border-white/10 rounded-xl text-xs font-bold text-orange-400 hover:text-white font-cairo transition-all cursor-pointer shadow-sm shrink-0"
            >
              {(() => {
                let allSelected = true;
                for (const section of sections) {
                  const defaultSection = DEFAULT_PERMISSIONS[section] as any;
                  const currentSection = (currentPerms[section] || {}) as any;
                  for (const action of PERMISSIONS_ORDER) {
                    if (defaultSection[action] !== undefined) {
                      if (!currentSection[action]) {
                        allSelected = false;
                        break;
                      }
                    }
                  }
                  if (!allSelected) break;
                }
                return (
                  <>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      allSelected ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-[#181818] border-white/20 text-transparent'
                    }`}>
                      <Check size={10} strokeWidth={4} />
                    </div>
                    <span>{allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل (Select All)'}</span>
                  </>
                );
              })()}
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto bg-[#181818] rounded-2xl border border-white/5 shadow-xl">
          <table className="w-full text-xs sm:text-sm text-center" dir="rtl">
            <thead className="bg-[#242424] border-b border-white/5 text-gray-300 font-cairo">
              <tr>
                <th className="px-4 py-3.5 font-bold text-right w-1/3 text-gray-200">الصلاحية / القسم</th>
                {PERMISSIONS_ORDER.map(action => (
                  <th key={action} className="px-2 py-3.5 font-bold text-gray-200 text-center">
                    {PERMISSION_LABELS[action]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-cairo">
              {sections.map((section) => {
                const sectionInfo = SECTION_MAP[section] || { label: section, icon: ShieldCheck };
                const Icon = sectionInfo.icon;
                
                return (
                  <tr key={section} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 text-right font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                          <Icon size={14} />
                        </div>
                        <span className="text-xs sm:text-sm">{sectionInfo.label}</span>
                      </div>
                    </td>
                    {PERMISSIONS_ORDER.map((action) => {
                      const isApplicable = (DEFAULT_PERMISSIONS[section] as any)[action] !== undefined;
                      const isChecked = isApplicable ? (currentPerms[section] ? (currentPerms[section] as any)[action] : false) : false;
                      
                      return (
                        <td key={action} className="px-2 py-3.5">
                          {isApplicable ? (
                            <button
                              type="button"
                              disabled={!canManageUsers}
                              onClick={() => togglePermission(section, action, isEditing)}
                              className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center transition-all ${
                                !canManageUsers ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                              } ${
                                isChecked
                                  ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)] animate-in zoom-in-50 duration-150'
                                  : 'bg-[#242424] border-white/10 text-transparent hover:border-white/30'
                              }`}
                            >
                              <Check size={12} strokeWidth={4} className={isChecked ? 'block' : 'hidden'} />
                            </button>
                          ) : (
                            <span className="text-gray-600 font-mono">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (s) => {
      setUsers(s.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== addConfirmPassword) {
      alert("كلمتا المرور غير متطابقتين!");
      return;
    }

    if (formData.username?.toLowerCase() === 'admin') {
      alert("لا يمكن إضافة حساب باسم مستخدم admin!");
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('username', '==', formData.username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert(t('users.userExists'));
        return;
      }
      
      // Auto-generate a userNumber (max + 1)
      const allUsersSnap = await getDocs(collection(db, 'users'));
      let maxNumber = 100;
      allUsersSnap.forEach((doc) => {
         const data = doc.data();
         if (data.userNumber && data.userNumber > maxNumber) {
            maxNumber = data.userNumber;
         }
      });
      const nextUserNumber = maxNumber + 1;

      await addDoc(collection(db, 'users'), { 
        ...formData, 
        userNumber: nextUserNumber, 
        isPrimary: false, 
        isActive: true 
      });
      setShowAddModal(false);
      setFormData({ username: '', password: '', name: '', role: 'data_entry', permissions: DEFAULT_PERMISSIONS });
      setAddConfirmPassword('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;

    const isTargetAdmin = editingUser.isPrimary || editingUser.username === 'admin';
    const isCurrentUserGM = currentUser.isPrimary || currentUser.username === 'admin';
    if (isTargetAdmin && !isCurrentUserGM) {
      alert("لا يمكن لأي مستخدم للنظام تغيير كلمة مرور المدير العام حتى لو معه كل الصلاحيات!");
      return;
    }

    const isPasswordOnlyView = isTargetAdmin || 
                               !hasUsersPermission || 
                               (editingUser.id === currentUser.id && !canManageUsers);

    if (isPasswordOnlyView && editingUser.password !== editingConfirmPassword) {
      alert("كلمتا المرور غير متطابقتين!");
      return;
    }

    setLoading(true);
    try {
      if (isPasswordOnlyView) {
        // Only password update
        await updateDoc(doc(db, 'users', editingUser.id), {
          password: editingUser.password
        });
      } else {
        // Standard user update
        await updateDoc(doc(db, 'users', editingUser.id), {
          name: editingUser.name,
          password: editingUser.password,
          role: editingUser.role,
          permissions: editingUser.permissions || DEFAULT_PERMISSIONS
        });
      }
      setEditingUser(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (userToToggle: User) => {
    if (!userToToggle.id) return;
    if (userToToggle.isPrimary || userToToggle.username === 'admin') return; // Cannot deactivate admin
    
    try {
      const isCurrentlyActive = (userToToggle.isActive as any) === undefined || (userToToggle.isActive as any) === null || (userToToggle.isActive as any) === true || (userToToggle.isActive as any) === 1 || (userToToggle.isActive as any) === 'true' || (userToToggle.isActive as any) === '1';
      const newStatus = isCurrentlyActive ? 0 : 1;
      await updateDoc(doc(db, 'users', userToToggle.id), {
        isActive: newStatus
      });
    } catch (err) {
      console.error("Error toggling user activation:", err);
    }
  };

  const ROLE_MAP = {
    admin: 'المدير العام',
    manager: 'مدير نظام',
    data_entry: 'مدخل بيانات'
  };

  // Check if current user has permissions to modify users
  const canManageUsers = currentUser.role === 'admin' || currentUser.role === 'manager' || (currentUser.permissions?.settings_users?.edit);

  // Check if current user has permissions to view other users
  const canViewAllUsers = currentUser.role === 'admin' || currentUser.role === 'manager' || (currentUser.permissions?.settings_users?.view);

  // Check if user has any permissions in settings_users
  const hasUsersPermission = currentUser.role === 'admin' || 
                            currentUser.role === 'manager' || 
                            !!currentUser.permissions?.settings_users?.view || 
                            !!currentUser.permissions?.settings_users?.edit ||
                            !!currentUser.permissions?.settings_users?.add;

  // Check if current user has permissions to add users
  const canAddUsers = currentUser.role === 'admin' || currentUser.role === 'manager' || (currentUser.permissions?.settings_users?.add);

  const openAddModal = () => {
    setFormData({ 
      username: '', 
      password: '', 
      name: '', 
      role: 'data_entry',
      permissions: DEFAULT_PERMISSIONS
    });
    setAddConfirmPassword('');
    setShowAddPassword(false);
    setShowAddConfirmPassword(false);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600/10 text-orange-500 rounded-lg">
             <ShieldCheck size={20} />
          </div>
          <h2 className="font-cairo font-black text-xl text-white tracking-tight">إدارة مستخدمي النظام</h2>
        </div>
        <button 
          onClick={openAddModal}
          disabled={!canAddUsers}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all font-cairo ${
            canAddUsers 
              ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-950/20 cursor-pointer' 
              : 'bg-orange-600/20 text-orange-600/40 cursor-not-allowed shadow-none'
          }`}
        >
          <UserPlus size={18} />
          {t('users.addUser')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
        {users.filter(u => canViewAllUsers || u.id === currentUser.id).map(u => {
          const isUserAdmin = u.isPrimary || u.username === 'admin';
          const isUserActive = (u.isActive as any) === undefined || (u.isActive as any) === null || (u.isActive as any) === true || (u.isActive as any) === 1 || (u.isActive as any) === 'true' || (u.isActive as any) === '1';
          const isCurrentUserGM = currentUser.isPrimary || currentUser.username === 'admin';
          const canEditThisUser = isUserAdmin 
            ? isCurrentUserGM 
            : (isCurrentUserGM || u.id === currentUser.id || canManageUsers);

          return (
            <div key={u.id} className="bg-[#242424] p-4 sm:p-5 rounded-2xl border border-white/5 flex flex-row items-center justify-between gap-3 sm:gap-4 group">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                 <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0 ${isUserAdmin ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                    {u.name.charAt(0)}
                 </div>
                 <div className="min-w-0">
                    <h3 className="font-bold flex items-center gap-1.5 sm:gap-2 flex-wrap text-white font-cairo text-sm sm:text-base leading-tight">
                      {u.name}
                      <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded border border-white/5 font-mono">#{u.userNumber || (isUserAdmin ? 100 : '')}</span>
                      {isUserAdmin && <span className="text-[10px] bg-orange-600/20 text-orange-500 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest font-black">المدير العام</span>}
                      <span className="text-[10px] text-gray-500">@{u.username}</span>
                      
                      {/* Status badge */}
                      {isUserAdmin ? (
                        <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20 font-black">نشط دائم</span>
                      ) : !isUserActive ? (
                        <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 font-black">معطل</span>
                      ) : (
                        <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20 font-black">نشط</span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 font-cairo mt-0.5">{ROLE_MAP[u.role as keyof typeof ROLE_MAP] || u.role}</p>
                 </div>
              </div>
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

                     {/* Activation / Deactivation Toggle button - NOT shown for admin */}
                     {!isUserAdmin && canManageUsers && (
                       <button 
                         onClick={() => toggleUserActive(u)}
                         className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center gap-1 text-[11px] sm:text-xs font-bold font-cairo border shadow-sm ${
                           !isUserActive
                             ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white cursor-pointer hover:shadow-emerald-950/10'
                             : 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer hover:shadow-red-950/10'
                         }`}
                         title={!isUserActive ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                       >
                         {!isUserActive ? <UserCheck size={13} /> : <UserX size={13} />}
                         <span>
                           {!isUserActive ? 'تفعيل' : 'تعطيل'}
                         </span>
                       </button>
                     )}
                   </>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a1a] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl p-6 sm:p-8 w-full max-w-md h-full sm:h-auto shadow-2xl relative overflow-y-auto"
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
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                  <label className="text-xs font-bold text-gray-500 uppercase mr-1">الاسم الكامل</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-right"
                  />
                </div>
                <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                  <label className="text-xs font-bold text-gray-500 uppercase mr-1">اسم المستخدم (بالإنجليزي)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '') })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none text-white text-left font-mono"
                  />
                </div>
                
                {/* Password Fields with Eye Icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">كلمة المرور</label>
                    <div className="relative">
                      <input 
                        type={showAddPassword ? "text" : "password"} 
                        required
                        value={formData.password}
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
                  <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                    <label className="text-xs font-bold text-gray-500 uppercase mr-1">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <input 
                        type={showAddConfirmPassword ? "text" : "password"} 
                        required
                        value={addConfirmPassword}
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

                <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                  <label className="text-xs font-bold text-gray-500 uppercase mr-1">صلاحية المستخدم</label>
                  <select 
                    value={formData.role}
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
                  disabled={loading || (formData.password !== addConfirmPassword)} 
                  className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 font-cairo disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'تسجيل المستخدم'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {editingUser && (() => {
          const isPasswordOnly = editingUser.isPrimary || 
                                 editingUser.username === 'admin' || 
                                 !hasUsersPermission || 
                                 (editingUser.id === currentUser.id && !canManageUsers);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a1a] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl p-6 sm:p-8 w-full max-w-md h-full sm:h-auto shadow-2xl relative overflow-y-auto"
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
                    <>
                      <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                        <label className="text-xs font-bold text-gray-500 uppercase mr-1">{t('users.fullName')}</label>
                        <input 
                          type="text" 
                          required
                          disabled={!canManageUsers}
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right"
                        />
                      </div>
                      <div className="space-y-1.5 text-right font-cairo" dir="rtl">
                        <label className="text-xs font-bold text-gray-500 uppercase mr-1">{t('users.newPassword')}</label>
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
                        <label className="text-xs font-bold text-gray-500 uppercase mr-1">{t('users.role')}</label>
                        <select 
                          value={editingUser.role}
                          disabled={!canManageUsers}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none disabled:opacity-50 text-white text-right"
                        >
                          <option value="data_entry">{ROLE_MAP.data_entry} (Data Entry)</option>
                          <option value="manager">{ROLE_MAP.manager} (Manager)</option>
                        </select>
                      </div>

                      {renderPermissionsTable(true)}
                    </>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || (isPasswordOnly && editingUser.password !== editingConfirmPassword)} 
                    className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2 font-cairo disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : t('users.applyChanges')}
                  </button>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
