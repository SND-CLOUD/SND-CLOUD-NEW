const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagement.tsx', 'utf8');
code = code.replace(/import { Smartphone, Wifi, WifiOff, CheckCircle2, PauseCircle, XCircle, /g, 'import { ');
code = code.replace(/import { ShieldCheck, /g, 'import { Smartphone, Wifi, WifiOff, CheckCircle2, PauseCircle, XCircle, ShieldCheck, ');
fs.writeFileSync('src/components/UserManagement.tsx', code);
console.log('Fixed imports');
