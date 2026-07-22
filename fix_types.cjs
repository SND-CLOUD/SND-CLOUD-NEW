const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/view: boolean; add: boolean; edit: boolean; delete: boolean; print: boolean/g, 'view: boolean; add: boolean; edit: boolean; delete: boolean; print: boolean; advancedView?: boolean');
code = code.replace(/view: boolean; print: boolean/g, 'view: boolean; print: boolean; advancedView?: boolean');
code = code.replace(/view: boolean; edit: boolean/g, 'view: boolean; edit: boolean; advancedView?: boolean');
fs.writeFileSync('src/types.ts', code);
console.log('Fixed types');
