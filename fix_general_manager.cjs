const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const importStatement = "import SystemManagersList from './SystemManagersList';\n";
content = content.replace("import UserManagement from './UserManagement';", importStatement + "import UserManagement from './UserManagement';");

const oldGeneralManagerBlock = `                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-white text-sm">مدير النظام</h4>
                                  <button onClick={() => alert('ميزة إنشاء مدير النظام ستتوفر قريباً')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer">
                                     إنشاء مدير نظام
                                  </button>
                                </div>
                                <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 flex flex-col gap-3 items-center justify-center py-8">
                                   <Shield size={24} className="text-gray-600" />
                                   <p className="text-xs text-gray-500 font-bold">لا يوجد مدراء نظام مضافين حالياً</p>
                                </div>
                             </div>`;

const newGeneralManagerBlock = `                             <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <SystemManagersList />
                             </div>`;

content = content.replace(oldGeneralManagerBlock, newGeneralManagerBlock);

const adminBlock = `<button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white border border-orange-500/20 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-lg cursor-pointer">`;
const adminBlockReplacement = `<button onClick={async () => {
                                     const newPass = window.prompt('أدخل كلمة المرور الجديدة للمدير العام:');
                                     if (!newPass) return;
                                     try {
                                        const { collection, query, where, getDocs, updateDoc, doc } = await import('../firebase');
                                        const { db } = await import('../firebase');
                                        const q = query(collection(db, 'users'), where('username', '==', 'admin'));
                                        const snap = await getDocs(q);
                                        if (!snap.empty) {
                                           await updateDoc(doc(db, 'users', snap.docs[0].id), { password: newPass });
                                           alert('تم تغيير كلمة المرور للمدير العام بنجاح');
                                        } else {
                                           alert('حساب المدير العام غير موجود');
                                        }
                                     } catch (e) {
                                        alert('حدث خطأ');
                                     }
                                   }} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white border border-orange-500/20 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-lg cursor-pointer">`;

content = content.replace(adminBlock, adminBlockReplacement);

fs.writeFileSync('src/components/Settings.tsx', content);
console.log("Updated general manager and system managers!");
