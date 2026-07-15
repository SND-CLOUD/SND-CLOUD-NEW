const fs = require('fs');

function patchVault() {
  let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');
  
  if (!code.includes('import { ProviderFactory }')) {
    code = code.replace("import { localDb } from '../lib/local-db';", "import { localDb } from '../lib/local-db';\nimport { ProviderFactory } from '../data/ProviderFactory';");
  }

  // 1. Voucher insert (lines 730-760)
  code = code.replace(
    /await localDb\.run\(\s*`INSERT INTO vault_transactions \([\s\S]*?\) VALUES \([\s\S]*?\)`,\s*\[([\s\S]*?)\]\s*\);/m,
    `const txData1 = {
        id: txId, currency: selectedCurrency, amount: isReceipt ? parsedAmount : -parsedAmount, customerName: customerSearch.trim() || 'جهة عامة أخرى', invoiceNumber: '',
        userName: user.name || 'المدير العام', userNumber: user.userNumber || 1, userId: user.id || 'none', timestamp: timestampIso, type: isReceipt ? 'receipt' : 'payment',
        notes: matchedFund.type !== 'cash' ? \`رقم المرجع: \${referenceNumber.trim()} | المودع: \${depositorName.trim()} | الملاحظات: \${finalVoucherNotes}\` : finalVoucherNotes,
        updatedAt: timestampIso, voucherNumber: nextVoucherNum, transactionCategory: selectedCategory, fundId: matchedFund.id, fundName: matchedFund.name,
        customerId: selectedCustomerId || '', isReversed: 0, isReversal: 0, reversalOf: '', paymentType: finalPaymentType, liabilityCurrency: finalLiabilityCurrency,
        liabilityAmount: finalLiabilityAmount, receiptCurrency: finalReceiptCurrency, receiptAmount: finalReceiptAmount, bankDetails: JSON.stringify(finalBankDetails)
      };
      await ProviderFactory.getProvider().setDoc('vault_transactions', txId, txData1);`
  );
  
  // 2. Fund balance update for Voucher (line 770)
  code = code.replace(
    /await localDb\.run\(\s*'UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?',\s*\[isReceipt \? parsedAmount : -parsedAmount, matchedFund\.id\]\s*\);/m,
    `await ProviderFactory.getProvider().updateDoc('fin_funds', matchedFund.id, { balance: { type: 'increment', value: isReceipt ? parsedAmount : -parsedAmount } });`
  );

  // 3. Invoice partial settlement insert (line 878)
  code = code.replace(
    /await localDb\.run\(\s*`INSERT INTO vault_transactions \([\s\S]*?\) VALUES \([\s\S]*?\)`,\s*\[([\s\S]*?)\]\s*\);/m,
    `const txData2 = {
        id: txId, currency: selectedCurrency, amount: parsedAmount, customerName: settleInvoice.customerName || '', invoiceNumber: settleInvoice.invoiceNumber,
        userName: user.name || 'المدير العام', userNumber: user.userNumber || 1, userId: user.id || 'none', timestamp: timestampIso, type: 'receipt',
        notes: matchedFund.type !== 'cash' ? \`دفعة من حساب فاتورة مبيعات رقم \${settleInvoice.invoiceNumber} | رقم المرجع: \${referenceNumber} | المودع: \${depositorName}\` : \`دفعة من حساب فاتورة مبيعات رقم \${settleInvoice.invoiceNumber}\`,
        updatedAt: timestampIso, voucherNumber: null, transactionCategory: '', fundId: matchedFund.id, fundName: matchedFund.name, customerId: settleInvoice.customerId || '',
        isReversed: 0, isReversal: 0, reversalOf: '', paymentType: finalPaymentType, liabilityCurrency: '', liabilityAmount: 0, receiptCurrency: '', receiptAmount: 0, bankDetails: JSON.stringify(finalBankDetails)
      };
      await ProviderFactory.getProvider().setDoc('vault_transactions', txId, txData2);`
  );

  // 4. Fund balance update for Invoice partial (line 907)
  code = code.replace(
    /await localDb\.run\(\s*'UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?',\s*\[parsedAmount, matchedFund\.id\]\s*\);/m,
    `await ProviderFactory.getProvider().updateDoc('fin_funds', matchedFund.id, { balance: { type: 'increment', value: parsedAmount } });`
  );

  // 5. Account settlement insert (line 936 -> wait, let's look at it)
  // Actually, wait, let's not blindly replace without checking.
  fs.writeFileSync('src/components/Vault.tsx', code);
}
patchVault();
