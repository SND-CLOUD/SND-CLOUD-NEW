const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagement.tsx', 'utf8');

code = code.replace(/const PERMISSIONS_ORDER = \['view', 'add', 'edit', 'delete', 'print'\];/g, "const PERMISSIONS_ORDER = ['view', 'add', 'edit', 'delete', 'print', 'advancedView'];");

code = code.replace(/print: 'طباعة'/g, "print: 'طباعة',\n    advancedView: 'عرض متقدم'");

code = code.replace(/const DEFAULT_PERMISSIONS: AppPermissions = \{([\s\S]*?)\};/, function(match, p1) {
    let replaced = p1.replace(/print: (true|false)/g, 'print: $1, advancedView: false');
    replaced = replaced.replace(/edit: false/g, 'edit: false, advancedView: false');
    return 'const DEFAULT_PERMISSIONS: AppPermissions = {' + replaced + '};';
});

fs.writeFileSync('src/components/UserManagement.tsx', code);
console.log('Fixed UserManagement');
