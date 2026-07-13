const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

code = code.replace(/\/\/ In the future: set liabilityCurrency = c.liabilityCurrency \|\| 'USD';/g, "setLiabilityCurrency(c.liabilityCurrency || 'USD');");

fs.writeFileSync('src/components/Vault.tsx', code);
