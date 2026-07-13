const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

// Remove paymentMode state
code = code.replace(/const \[paymentMode, setPaymentMode\] = useState<'unified' \| 'different'>\('unified'\);\n/g, '');

// Replace EXCHANGE RATE STATES
code = code.replace(/const \[voucherLiabilityRate, setVoucherLiabilityRate\] = useState<string>\('1'\);\n  const \[voucherFundRate, setVoucherFundRate\] = useState<string>\('1'\);/g, 
  "const [voucherExchangeRate, setVoucherExchangeRate] = useState<string>('1');");
  
code = code.replace(/const \[transferSourceRate, setTransferSourceRate\] = useState<string>\('1'\);\n  const \[transferDestRate, setTransferDestRate\] = useState<string>\('1'\);/g,
  "const [transferExchangeRate, setTransferExchangeRate] = useState<string>('1');");

// In isFormValid
code = code.replace(/    if \(paymentMode === 'different'\) \{\n      if \(!liabilityAmount \|\| !liabilityAmount\.trim\(\)\) return false;\n      const liabVal = parseFloat\(liabilityAmount\);\n      if \(isNaN\(liabVal\) \|\| liabVal <= 0\) return false;\n      if \(!liabilityCurrency\) return false;\n    \}/g, '');

code = code.replace(/const finalLiabilityCurrency = paymentMode === 'unified' \? selectedCurrency : liabilityCurrency;/g, 
  "const finalLiabilityCurrency = liabilityCurrency || selectedCurrency;");
  
code = code.replace(/const finalLiabilityAmount = paymentMode === 'unified' \? parsedAmount : computedLiabilityAmount;/g, 
  "const finalLiabilityAmount = computedLiabilityAmount;");
  
code = code.replace(/const finalPaymentType = paymentMode === 'unified' \? 1 : 2;/g, 
  "const finalPaymentType = (liabilityCurrency && liabilityCurrency !== selectedCurrency) ? 2 : 1;");

fs.writeFileSync('src/components/Vault.tsx', code);
