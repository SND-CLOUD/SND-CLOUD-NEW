const fs = require('fs');
let code = fs.readFileSync('src/components/AccountingInputs.tsx', 'utf8');

const regex = /if \(editingJobTitleId\) \{/;
const replacement = `if (editingJobTitleId && editingJobTitleId !== 'new') {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AccountingInputs.tsx', code);
console.log('Fixed handleJobTitleSubmit');
