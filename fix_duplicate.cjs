const fs = require('fs');
let code = fs.readFileSync('src/components/AddCustomerModal.tsx', 'utf8');

code = code.replace(/          liabilityCurrency: addLiabilityCurrency,\n          liabilityCurrency: addLiabilityCurrency,/g, "          liabilityCurrency: addLiabilityCurrency,");

fs.writeFileSync('src/components/AddCustomerModal.tsx', code);
