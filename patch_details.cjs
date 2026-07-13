const fs = require('fs');
let code = fs.readFileSync('src/components/Customers.tsx', 'utf8');

code = code.replace(/let details = tx.notes \|\| '';/g, "let details = tx.statementNote || tx.notes || '';");

fs.writeFileSync('src/components/Customers.tsx', code);
