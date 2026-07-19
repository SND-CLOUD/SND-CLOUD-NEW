const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const modalBodyStartStr = "            {/* Modal Content container */}\n            <div className=\"flex-1 overflow-y-auto pr-1\">\n              {activeAdvancedManagementModal === 'database' && (";
const modalBodyIdx = content.indexOf(modalBodyStartStr);

if (modalBodyIdx === -1) {
    console.log("Could not find modal body");
    process.exit(1);
}

// Just copy everything up to modalBodyIdx + ...
