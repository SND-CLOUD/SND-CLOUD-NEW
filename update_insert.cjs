const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const oldInsert = `      // 1. Insert into database
      await localDb.run(
        \`INSERT INTO vault_transactions (
          id, currency, amount, customerName, invoiceNumber, 
          userName, userNumber, userId, timestamp, type, 
          notes, updatedAt, voucherNumber, transactionCategory, 
          fundId, fundName, customerId, isReversed, isReversal, reversalOf,
          paymentType, liabilityCurrency, liabilityAmount, receiptCurrency, receiptAmount, bankDetails
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
        [
          txId,
          selectedCurrency,
          isReceipt ? parsedAmount : -parsedAmount,
          customerSearch.trim() || 'جهة عامة أخرى',
          '', // No invoice number for direct receipt
          user?.name || 'مدير النظام',
          user?.userNumber || '100',
          user?.id || 'admin',
          new Date().toISOString(),
          activeSegment,
          finalVoucherNotes,
          new Date().toISOString(),
          nextVoucherNum,
          selectedCategory,
          matchedFund.id,
          matchedFund.name,
          selectedCustomerId || '',
          0,
          0,
          '',
          finalPaymentType,
          finalLiabilityCurrency,
          finalLiabilityAmount,
          selectedCurrency, // Receipt Currency
          parsedAmount,     // Receipt Amount
          matchedFund.type !== 'cash' ? JSON.stringify({ referenceNumber: referenceNumber.trim(), depositorName: depositorName.trim() }) : ''
        ]
      );`;

const newInsert = `      // 1. Insert into database
      await localDb.run(
        \`INSERT INTO vault_transactions (
          id, currency, amount, customerName, invoiceNumber, 
          userName, userNumber, userId, timestamp, type, 
          notes, updatedAt, voucherNumber, transactionCategory, 
          fundId, fundName, customerId, isReversed, isReversal, reversalOf,
          paymentType, liabilityCurrency, liabilityAmount, receiptCurrency, receiptAmount, bankDetails, statementNote
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
        [
          txId,
          selectedCurrency,
          isReceipt ? parsedAmount : -parsedAmount,
          customerSearch.trim() || 'جهة عامة أخرى',
          '', // No invoice number for direct receipt
          user?.name || 'مدير النظام',
          user?.userNumber || '100',
          user?.id || 'admin',
          new Date().toISOString(),
          activeSegment,
          finalVoucherNotes,
          new Date().toISOString(),
          nextVoucherNum,
          selectedCategory,
          matchedFund.id,
          matchedFund.name,
          selectedCustomerId || '',
          0,
          0,
          '',
          finalPaymentType,
          finalLiabilityCurrency,
          finalLiabilityAmount,
          selectedCurrency, // Receipt Currency
          parsedAmount,     // Receipt Amount
          matchedFund.type !== 'cash' ? JSON.stringify({ referenceNumber: referenceNumber.trim(), depositorName: depositorName.trim() }) : '',
          customerStatementNote
        ]
      );`;

if (code.includes('INSERT INTO vault_transactions')) {
  code = code.replace(oldInsert, newInsert);
  
  // also add statementNote to firestore
  const oldFirestore = `        liabilityAmount: finalLiabilityAmount,
        receiptCurrency: selectedCurrency,
        receiptAmount: parsedAmount,
        bankDetails: matchedFund.type !== 'cash' ? JSON.stringify({ referenceNumber: referenceNumber.trim(), depositorName: depositorName.trim() }) : ''
      });`;
  const newFirestore = `        liabilityAmount: finalLiabilityAmount,
        receiptCurrency: selectedCurrency,
        receiptAmount: parsedAmount,
        bankDetails: matchedFund.type !== 'cash' ? JSON.stringify({ referenceNumber: referenceNumber.trim(), depositorName: depositorName.trim() }) : '',
        statementNote: customerStatementNote
      });`;
  code = code.replace(oldFirestore, newFirestore);
  
  fs.writeFileSync('src/components/Vault.tsx', code);
  console.log('Update successful');
} else {
  console.log('Could not find insert query');
}
