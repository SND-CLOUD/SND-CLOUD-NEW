const fs = require('fs');

let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');
code = code.replace(
  /receiptAmount: finalReceiptAmount, bankDetails: JSON\.stringify\(finalBankDetails\)/g,
  "receiptAmount: finalReceiptAmount, bankDetails: JSON.stringify(finalBankDetails), statementNote: customerStatementNote"
);

code = code.replace(
  /receiptAmount: 0, bankDetails: JSON\.stringify\(finalBankDetails\)/g,
  "receiptAmount: 0, bankDetails: JSON.stringify(finalBankDetails), statementNote: customerStatementNote || ''"
);

fs.writeFileSync('src/components/Vault.tsx', code);
