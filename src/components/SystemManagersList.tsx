import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Shield, Lock, Trash2, UserPlus } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from '../firebase';
import { db } from '../firebase';

export default function SystemManagersList() {
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'system_manager'));
      const snap = await getDocs(q);
      setManagers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async () => {
    const name = window.prompt('أدخل اسم مدير النظام:');
    if (!name) return;
    const username = window.prompt('أدخل اسم المستخدم:');
    if (!username) return;
    const password = window.prompt('أدخل كلمة المرور:');
    if (!password) return;

    try {
      await addDoc(collection(db, 'users'), {
        name,
        username,
        password,
        role: 'system_manager',
        status: 'active',
        createdAt: serverTimestamp()
      });
      alert('تم إنشاء مدير النظام بنجاح');
      fetchManagers();
    } catch (e) {
      alert('حدث خطأ أثناء الإنشاء');
    }
  };

  const handleChangePassword = async (id: string) => {
    const newPass = window.prompt('أدخل كلمة المرور الجديدة:');
    if (!newPass) return;
    try {
      await updateDoc(doc(db, 'users', id), { password: newPass });
      alert('تم تغيير كلمة المرور بنجاح');
      fetchManagers();
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!user.id) return;
    const newStatus = user.isActive ? false : true;
    if (!window.confirm(`هل أنت متأكد من ${newStatus ? 'تفعيل' : 'تعطيل'} هذا الحساب؟`)) return;
    
    try {
      await updateDoc(doc(db, 'users', user.id), { isActive: newStatus });
      fetchManagers();
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white text-sm">مدراء النظام</h4>
        <button onClick={handleCreateManager} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg">
           <UserPlus size={14} />
           إنشاء مدير نظام
        </button>
      </div>
      
      {loading ? (
        <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
      ) : managers.length === 0 ? (
        <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 flex flex-col gap-3 items-center justify-center py-8">
           <Shield size={24} className="text-gray-600" />
           <p className="text-xs text-gray-500 font-bold">لا يوجد مدراء نظام مضافين حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {managers.map(manager => (
            <div key={manager.id} className={`bg-[#1e1e1e] p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${manager.status === 'inactive' ? 'border-red-500/20 opacity-75' : 'border-white/5'}`}>
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${manager.status === 'inactive' ? 'bg-red-500/20 text-red-500' : 'bg-blue-600 text-white'}`}>
                    {manager.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{manager.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400">@{manager.username}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${manager.status === 'inactive' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {manager.status === 'inactive' ? 'معطل' : 'نشط'}
                      </span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => handleChangePassword(manager.id!)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer">
                     <Lock size={13} />
                     كلمة المرور
                  </button>
                  <button onClick={() => handleToggleStatus(manager)} className={`px-3 py-1.5 border font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer ${manager.status === 'inactive' ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20'}`}>
                     <Shield size={13} />
                     {manager.status === 'inactive' ? 'تفعيل' : 'تعطيل'}
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
