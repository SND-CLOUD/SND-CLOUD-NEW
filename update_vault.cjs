const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const oldLiability = `      let computedLiabilityAmount = parsedAmount;
      let finalVoucherNotes = voucherNotes.trim();

      if (liabilityCurrency && liabilityCurrency !== selectedCurrency) {
        const vRate = parseFloat(voucherExchangeRate) || 1;
        // If selected fund is SAR, and liability is USD, liability = fund / 3.8
        // If selected fund is USD, and liability is SAR, liability = fund * 3.8
        // Let's assume standard behavior: voucherExchangeRate is how many FundCurrency per 1 LiabilityCurrency.
        // Wait, the UI usually says "سعر صرف الدولار = 3.8 سعودي".
        // If Fund is SAR, Liability is USD, 1 USD = 3.8 SAR. Rate = 3.8.
        // liabilityAmount (USD) = voucherAmount (SAR) / Rate
        computedLiabilityAmount = vRate > 0 ? Math.round((parsedAmount / vRate) * 100) / 100 : 0;
        finalVoucherNotes += \` [سعر الصرف: \${vRate} لعملة \${liabilityCurrency} مقابل \${selectedCurrency}]\`;
      } else {
        computedLiabilityAmount = parsedAmount;
      }`;

const newLiability = `      let computedLiabilityAmount = parsedAmount;
      let finalVoucherNotes = voucherNotes.trim();
      let customerStatementNote = '';

      if (liabilityCurrency && liabilityCurrency !== selectedCurrency) {
        const vRate = parseFloat(voucherExchangeRate) || 1;
        computedLiabilityAmount = vRate > 0 ? Math.round((parsedAmount / vRate) * 100) / 100 : 0;
        finalVoucherNotes += \` [سعر الصرف: \${vRate} لعملة \${liabilityCurrency} مقابل \${selectedCurrency}]\`;
      } else {
        computedLiabilityAmount = parsedAmount;
      }
      
      const statementKeyword = isReceipt ? 'لكم' : 'عليكم';
      const currencyNameText = currencies.find(c => c.name === liabilityCurrency)?.name || liabilityCurrency || '';
      customerStatementNote = \`\${voucherNotes.trim()} \${statementKeyword} مبلغ \${computedLiabilityAmount} \${currencyNameText} مقابل \${selectedCategory}\`;
`;

code = code.replace(oldLiability, newLiability);
fs.writeFileSync('src/components/Vault.tsx', code);
