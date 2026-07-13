const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const oldValid = `  const isFormValid = () => {
    if (!selectedFundId) return false;
    if (!voucherAmount || !voucherAmount.trim()) return false;
    const amountVal = parseFloat(voucherAmount);
    if (isNaN(amountVal) || amountVal <= 0) return false;
    
    if (!customerSearch || !customerSearch.trim()) return false;
    if (!selectedCategory || !selectedCategory.trim()) return false;
    if (!voucherNotes || !voucherNotes.trim()) return false;

    // Additional checks for bank fund mode
    const matchedFund = funds.find(f => f.id === selectedFundId);
    if (matchedFund && matchedFund.type !== 'cash') {
      if (!referenceNumber || !referenceNumber.trim()) return false;
      if (!depositorName || !depositorName.trim()) return false;
    }

    return true;
  };`;

const newValid = `  const isFormValid = () => {
    if (!selectedFundId) return false;
    if (!voucherAmount || !voucherAmount.trim()) return false;
    const amountVal = parseFloat(voucherAmount);
    if (isNaN(amountVal) || amountVal <= 0) return false;
    
    if (liabilityCurrency && selectedCurrency && liabilityCurrency !== selectedCurrency) {
      const rate = parseFloat(voucherExchangeRate);
      if (isNaN(rate) || rate <= 0) return false;
    }

    if (!customerSearch || !customerSearch.trim()) return false;
    if (!selectedCategory || !selectedCategory.trim()) return false;
    if (!voucherNotes || !voucherNotes.trim()) return false;

    const matchedFund = funds.find(f => f.id === selectedFundId);
    if (matchedFund && matchedFund.type !== 'cash') {
      if (!referenceNumber || !referenceNumber.trim()) return false;
      if (!depositorName || !depositorName.trim()) return false;
    }

    return true;
  };`;

code = code.replace(oldValid, newValid);
fs.writeFileSync('src/components/Vault.tsx', code);
