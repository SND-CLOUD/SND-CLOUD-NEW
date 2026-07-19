const fs = require('fs');
const content = fs.readFileSync('original_block.txt', 'utf8');

const lines = content.split('\n');

const dbContent = lines.slice(43, 638).join('\n'); // this corresponds to lines 44 to 638 (0-indexed 43 to 637)

const newBlock = `{activeTab === 'advanced-management' && (
  <div className="space-y-6 pb-8 text-right font-cairo" dir="rtl">
    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
      {/* 1. Database Management Option */}
      <button
        type="button"
        onClick={() => {
          setAdvancedTab('database');
          setActiveAdvancedManagementModal('database');
          setAdvancedDbView('list');
        }}
        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Database size={22} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">إدارة قاعدة البيانات والمزامنة</h3>
            <p className="text-xs text-gray-400 mt-1">إعدادات الاتصال، النسخ الاحتياطي، المزامنة السحابية والصيانة</p>
          </div>
        </div>
        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
      </button>

      {/* 2. Devices Management Option */}
      <button
        type="button"
        onClick={() => {
          setAdvancedTab('devices');
          setActiveAdvancedManagementModal('devices');
        }}
        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Cpu size={22} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">إدارة الأجهزة المعتمدة</h3>
            <p className="text-xs text-gray-400 mt-1">الأجهزة المرتبطة بحسابك وصلاحيات الدخول والمزامنة</p>
          </div>
        </div>
        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
      </button>
    </div>

    {/* Modals for advanced-management options */}
    <AnimatePresence>
      {activeAdvancedManagementModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a1a1a] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-[2rem] border border-white/10 shadow-2xl flex flex-col p-4 md:p-6 overflow-hidden"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {activeAdvancedManagementModal === 'database' && <Database className="text-indigo-500" size={20} />}
                {activeAdvancedManagementModal === 'devices' && <Cpu className="text-indigo-500" size={20} />}
                {activeAdvancedManagementModal === 'database' && 'إدارة قاعدة البيانات والمزامنة'}
                {activeAdvancedManagementModal === 'devices' && 'إدارة الأجهزة المعتمدة'}
              </h3>
              <button
                onClick={() => setActiveAdvancedManagementModal(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Modal Content container */}
            <div className="flex-1 overflow-y-auto pr-1">
              {activeAdvancedManagementModal === 'database' && (
                <div className="animate-in fade-in duration-200">
${dbContent}
                </div>
              )}
              
              {activeAdvancedManagementModal === 'devices' && (
                <div className="animate-in fade-in duration-200 h-full">
                  <DeviceManagement user={user} onBack={() => setActiveAdvancedManagementModal(null)} shopConfig={shopConfig} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
)}`;

fs.writeFileSync('new_block.txt', newBlock);

const fullContent = fs.readFileSync('src/components/Settings.tsx', 'utf8');
const replacedContent = fullContent.replace(content, newBlock);
fs.writeFileSync('src/components/Settings.tsx', replacedContent);
