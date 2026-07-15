const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

// Replace Transfer Out insert
code = code.replace(
  /const txIdOut = `vtx-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 8\)\}`;[\s\S]*?await localDb\.run\([\s\S]*?`INSERT INTO vault_transactions \([\s\S]*?\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)`,\s*\[[\s\S]*?\]\s*\);/m,
  `const txIdOut = \`vtx-\${Math.random().toString(36).substring(2, 8)}\`;
      await ProviderFactory.getProvider().setDoc('vault_transactions', txIdOut, {
          id: txIdOut, currency: sourceFund.currency, amount: -parsedAmount, customerName: 'تحويل داخلي', invoiceNumber: '',
          userName: user.name || 'المدير العام', userNumber: user.userNumber || 1, userId: user.id || 'none', timestamp: timestampIso, type: 'payment',
          notes: \`تحويل صادر إلى الصندوق: \${destFund.name}\${finalTransferNotesSrc}\`, updatedAt: timestampIso, voucherNumber: nextVoucherNum, transactionCategory: 'تحويل بين الصناديق',
          fundId: sourceFund.id, fundName: sourceFund.name, customerId: ''
      });`
);

// Replace Transfer In insert
code = code.replace(
  /const txIdIn = `vtx-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 8\)\}`;[\s\S]*?await localDb\.run\([\s\S]*?`INSERT INTO vault_transactions \([\s\S]*?\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)`,\s*\[[\s\S]*?\]\s*\);/m,
  `const txIdIn = \`vtx-\${Math.random().toString(36).substring(2, 8)}\`;
      await ProviderFactory.getProvider().setDoc('vault_transactions', txIdIn, {
          id: txIdIn, currency: destFund.currency, amount: destAmount, customerName: 'تحويل داخلي', invoiceNumber: '',
          userName: user.name || 'المدير العام', userNumber: user.userNumber || 1, userId: user.id || 'none', timestamp: timestampIso, type: 'receipt',
          notes: \`تحويل وارد من الصندوق: \${sourceFund.name}\${finalTransferNotesDest}\`, updatedAt: timestampIso, voucherNumber: nextVoucherNum, transactionCategory: 'تحويل بين الصناديق',
          fundId: destFund.id, fundName: destFund.name, customerId: ''
      });`
);

// Replace balances
code = code.replace(
  /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance - \? WHERE id = \?",\s*\[parsedAmount, sourceFund\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_funds', sourceFund.id, { balance: { type: 'increment', value: -parsedAmount } });"
);

code = code.replace(
  /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[destAmount, destFund\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_funds', destFund.id, { balance: { type: 'increment', value: destAmount } });"
);

fs.writeFileSync('src/components/Vault.tsx', code);
