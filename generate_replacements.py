advanced_block = open('advanced_block.txt').read()
management_block = open('management_block.txt').read()

def rewrite_advanced(old_block):
    # This just replaces the container structure.
    # The inner content is everything inside `advancedTab === ...` checks.
    # We will use simple regexes to find the inner content for each tab.
    import re
    
    db_content = re.search(r"{advancedTab === 'database' && \((.*?)\n\s*\)}", old_block, re.DOTALL).group(1)
    general_manager_content = re.search(r"{advancedTab === 'general_manager' && \((.*?)\n\s*\)}", old_block, re.DOTALL).group(1)
    system_reset_content = re.search(r"{advancedTab === 'system_reset' && \((.*?)\n\s*\)}", old_block, re.DOTALL).group(1)
    
    # We need to construct the new block
    new_block = """{activeTab === 'advanced-management' && (
                  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
                      
                      <button type="button" onClick={() => { setAdvancedTab('database'); setActiveAdvancedModal('database'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Database size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">قاعدة البيانات والمزامنة</h3>
                            <p className="text-xs text-gray-400 mt-1">إعدادات قاعدة البيانات والربط</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      <button type="button" onClick={() => { setAdvancedTab('general_manager'); setActiveAdvancedModal('general_manager'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <UserIcon size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">المدير العام</h3>
                            <p className="text-xs text-gray-400 mt-1">إعدادات المدير العام للصيانة</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      <button type="button" onClick={() => {
                            if (window.confirm('هل أنت متأكد من اعتماد الإعدادات الجديدة وإعادة تشغيل النظام؟ سيتم تسجيل الخروج.')) {
                              setSaving(true);
                              sessionStorage.removeItem('snd_user');
                              window.location.reload();
                            }
                          }} className="w-full flex items-center justify-between p-6 bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 hover:border-green-500/50 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-600/20 text-green-500 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                            <CheckCircle size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">تأكيد واعتماد النظام</h3>
                            <p className="text-xs text-gray-400 mt-1">حفظ الإعدادات وإعادة تشغيل النظام</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      <button type="button" onClick={() => { setAdvancedTab('system_reset'); setActiveAdvancedModal('system_reset'); }} className="w-full flex items-center justify-between p-6 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-500/50 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                            <RotateCcw size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-red-500 text-base">إعادة التهيئة (System Reset)</h3>
                            <p className="text-xs text-red-400/70 mt-1">مسح جميع البيانات وإعادة النظام لحالة المصنع</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-red-500 group-hover:translate-x-[-4px] transition-all" />
                      </button>

                    </div>

                    <AnimatePresence>
                      {activeAdvancedModal !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] w-full h-full sm:h-[85vh] max-w-4xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                          >
                            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                {activeAdvancedModal === 'database' && <Database className="text-orange-500" size={20} />}
                                {activeAdvancedModal === 'general_manager' && <UserIcon className="text-orange-500" size={20} />}
                                {activeAdvancedModal === 'system_reset' && <RotateCcw className="text-red-500" size={20} />}
                                
                                {activeAdvancedModal === 'database' && 'قاعدة البيانات والمزامنة'}
                                {activeAdvancedModal === 'general_manager' && 'المدير العام'}
                                {activeAdvancedModal === 'system_reset' && 'إعادة التهيئة'}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setActiveAdvancedModal(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer"
                              >
                                <X size={24} />
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
                              {activeAdvancedModal === 'database' && (
""" + db_content + """
                              )}
                              {activeAdvancedModal === 'general_manager' && (
""" + general_manager_content + """
                              )}
                              {activeAdvancedModal === 'system_reset' && (
""" + system_reset_content + """
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                )}"""
    return new_block


def rewrite_management(old_block):
    import re
    db_read_content = re.search(r"{managementTab === 'database_read' && \((.*?)\n\s*\)}", old_block, re.DOTALL).group(1)
    backup_content = re.search(r"{managementTab === 'backup' && \((.*?)\n\s*\)}", old_block, re.DOTALL).group(1)
    devices_content = re.search(r"{managementTab === 'devices' && \((.*?)\n\s*\)}", old_block, re.DOTALL).group(1)
    
    new_block = """{activeTab === 'management' && (
                  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
                    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
                      
                      <button type="button" onClick={() => { setManagementTab('database_read'); setActiveManagementModal('database_read'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Database size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">بيانات قاعدة البيانات</h3>
                            <p className="text-xs text-gray-400 mt-1">عرض وتصدير بيانات قاعدة البيانات</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                      <button type="button" onClick={() => { setManagementTab('backup'); setActiveManagementModal('backup'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Download size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">النسخ الاحتياطي</h3>
                            <p className="text-xs text-gray-400 mt-1">إدارة عمليات النسخ الاحتياطي والأرشفة</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>
                      
                      <button type="button" onClick={() => { setManagementTab('devices'); setActiveManagementModal('devices'); }} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Smartphone size={22} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">إدارة الأجهزة المسموحة</h3>
                            <p className="text-xs text-gray-400 mt-1">إدارة الأجهزة المصرح لها بالدخول للنظام</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
                      </button>

                    </div>

                    <AnimatePresence>
                      {activeManagementModal !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] w-full h-full sm:h-[85vh] max-w-4xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                          >
                            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                {activeManagementModal === 'database_read' && <Database className="text-orange-500" size={20} />}
                                {activeManagementModal === 'backup' && <Download className="text-orange-500" size={20} />}
                                {activeManagementModal === 'devices' && <Smartphone className="text-orange-500" size={20} />}
                                
                                {activeManagementModal === 'database_read' && 'بيانات قاعدة البيانات'}
                                {activeManagementModal === 'backup' && 'النسخ الاحتياطي'}
                                {activeManagementModal === 'devices' && 'إدارة الأجهزة المسموحة'}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setActiveManagementModal(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer"
                              >
                                <X size={24} />
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
                              {activeManagementModal === 'database_read' && (
""" + db_read_content + """
                              )}
                              {activeManagementModal === 'backup' && (
""" + backup_content + """
                              )}
                              {activeManagementModal === 'devices' && (
""" + devices_content + """
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                )}"""
    return new_block


open('advanced_management_replacement.txt', 'w').write(rewrite_advanced(advanced_block))
open('management_replacement.txt', 'w').write(rewrite_management(management_block))
