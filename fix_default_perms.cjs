const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagement.tsx', 'utf8');

const regex = /const DEFAULT_PERMISSIONS: AppPermissions = \{([\s\S]*?)\};/;
const replacement = `const DEFAULT_PERMISSIONS: AppPermissions = {
    inventory: { view: true, add: true, edit: true, delete: false, print: true, advancedView: false },
    vault: { view: true, add: true, edit: true, delete: false, print: true, advancedView: false },
    customers: { view: true, add: true, edit: true, delete: false, print: true, advancedView: false },
    invoices: { view: true, add: true, edit: true, delete: false, print: true, advancedView: false },
    reports: { view: true, print: true, advancedView: false },
    settings: { view: false, edit: false, advancedView: false },
    settings_main_data: { view: false, add: false, edit: false, delete: false, print: false, advancedView: false },
    settings_devices_engineers: { view: false, add: false, edit: false, delete: false, print: false, advancedView: false },
    settings_device_management: { view: false, add: false, edit: false, delete: false, print: false, advancedView: false },
    settings_users: { view: false, add: false, edit: false, delete: false, print: false, advancedView: false },
    settings_hybrid_db: { view: false, edit: false, advancedView: false }
  };`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/UserManagement.tsx', code);
console.log('Fixed DEFAULT_PERMISSIONS');
