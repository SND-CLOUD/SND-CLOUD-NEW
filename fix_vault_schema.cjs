const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const target = `      const finalPaymentType = (liabilityCurrency && liabilityCurrency !== selectedCurrency) ? 2 : 1;`;

const newTarget = `      const finalPaymentType = (liabilityCurrency && liabilityCurrency !== selectedCurrency) ? 2 : 1;

      // Ensure statementNote column exists (hot-reload safety)
      try {
        await localDb.run('ALTER TABLE vault_transactions ADD COLUMN statementNote TEXT');
      } catch (e) {}
`;

if (code.includes(target)) {
  code = code.replace(target, newTarget);
  fs.writeFileSync('src/components/Vault.tsx', code);
  console.log('Fixed schema issue');
} else {
  console.log('Target not found');
}
