const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

// 1. Change the state definition
content = content.replace(
  "const [activeAdvancedManagementModal, setActiveAdvancedManagementModal] = useState<'database' | 'devices' | null>(null);",
  "const [activeAdvancedManagementModal, setActiveAdvancedManagementModal] = useState<'database-sync' | 'database-backup' | 'devices' | null>(null);"
);

// 2. We need to rewrite the inner tabs of "advanced-management"
const newAdvancedMenu = `    <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">
      {/* 1. Database Management Option */}
      <button
        type="button"
        onClick={() => {
          setAdvancedTab('database');
          setAdvancedDbSubTab('sync');
          setActiveAdvancedManagementModal('database-sync');
          setAdvancedDbView('list');
        }}
        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <RefreshCw size={22} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">قاعدة البيانات والمزامنة</h3>
            <p className="text-xs text-gray-400 mt-1">إعدادات الاتصال وقاعدة البيانات الحالية والمزامنة المباشرة</p>
          </div>
        </div>
        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
      </button>

      {/* 2. Backup and Archive Option */}
      <button
        type="button"
        onClick={() => {
          setAdvancedTab('database');
          setAdvancedDbSubTab('backup');
          setActiveAdvancedManagementModal('database-backup');
          setAdvancedDbView('list');
        }}
        className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all group text-right shadow-lg cursor-pointer mx-4 md:mx-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Database size={22} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">نسخ البيانات والمزامنة</h3>
            <p className="text-xs text-gray-400 mt-1">النسخ الاحتياطي اليدوي والتلقائي والأرشفة واستعادة البيانات</p>
          </div>
        </div>
        <ChevronLeft size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-[-4px] transition-all" />
      </button>

      {/* 3. Devices Management Option */}
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
    </div>`;

// Replace the old grid
const oldGridStart = '<div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pt-4">';
const oldGridEnd = '</div>\n\n    {/* Modals for advanced-management options */}';
// find indices
const oldGridStartIdx = content.indexOf(oldGridStart);
let oldGridEndIdx = content.indexOf(oldGridEnd, oldGridStartIdx);
if (oldGridStartIdx !== -1 && oldGridEndIdx !== -1) {
  content = content.substring(0, oldGridStartIdx) + newAdvancedMenu + content.substring(oldGridEndIdx + '</div>'.length);
} else {
  console.log("Could not find old grid to replace.");
}

// 3. Change Modal Header
const oldModalHeaderStart = '<div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">';
const newModalHeader = `<div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {activeAdvancedManagementModal === 'database-sync' && <RefreshCw className="text-indigo-500" size={20} />}
                {activeAdvancedManagementModal === 'database-backup' && <Database className="text-indigo-500" size={20} />}
                {activeAdvancedManagementModal === 'devices' && <Cpu className="text-indigo-500" size={20} />}
                {activeAdvancedManagementModal === 'database-sync' && 'قاعدة البيانات والمزامنة'}
                {activeAdvancedManagementModal === 'database-backup' && 'نسخ البيانات والمزامنة'}
                {activeAdvancedManagementModal === 'devices' && 'إدارة الأجهزة المعتمدة'}
              </h3>
              <button
                onClick={() => setActiveAdvancedManagementModal(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>`;

const oldModalHeaderEndIdx = content.indexOf('</div>', content.indexOf(oldModalHeaderStart, oldGridEndIdx)) + '</div>'.length;
content = content.substring(0, content.indexOf(oldModalHeaderStart, oldGridEndIdx)) + newModalHeader + content.substring(oldModalHeaderEndIdx);

fs.writeFileSync('src/components/Settings.tsx', content);
