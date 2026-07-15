const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

code = code.replace(
  /await localDb\.run\(\s*"UPDATE vault_transactions SET isReversed = 1, notes = \?, updatedAt = \? WHERE id = \?",\s*\[updatedOriginalNotes, timestampIso, tx\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('vault_transactions', tx.id, { isReversed: 1, notes: updatedOriginalNotes, updatedAt: timestampIso });"
);

code = code.replace(
  /await localDb\.run\(\s*`INSERT INTO vault_transactions \([\s\S]*?\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)`,\s*\[([\s\S]*?)\]\s*\);/m,
  `const reverseId = \`vtx-\${Math.random().toString(36).substring(2, 8)}\`;
      await ProviderFactory.getProvider().setDoc('vault_transactions', reverseId, {
          id: reverseId, currency: tx.currency, amount: reverseAmount, customerName: tx.customerName || '', invoiceNumber: tx.invoiceNumber || '',
          userName: user.name || 'المدير العام', userNumber: user.userNumber || 1, userId: user.id || 'none', timestamp: timestampIso, type: tx.type === 'receipt' ? 'payment' : 'receipt',
          notes: reversalNotes, updatedAt: timestampIso, voucherNumber: nextNum, transactionCategory: tx.transactionCategory || '',
          fundId: tx.fundId || '', fundName: tx.fundName || '', customerId: tx.customerId || '',
          isReversed: 0, isReversal: 1, reversalOf: tx.id,
          paymentType: tx.paymentType || 'cash', liabilityCurrency: tx.liabilityCurrency || '', liabilityAmount: tx.liabilityAmount || 0,
          receiptCurrency: tx.receiptCurrency || '', receiptAmount: tx.receiptAmount || 0, bankDetails: tx.bankDetails || '', statementNote: tx.statementNote || ''
      });`
);

code = code.replace(
  /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[reverseAmount, tx\.fundId\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_funds', tx.fundId, { balance: { type: 'increment', value: reverseAmount } });"
);

fs.writeFileSync('src/components/Vault.tsx', code);
