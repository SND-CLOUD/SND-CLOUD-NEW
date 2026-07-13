const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const effectCode = `
  // Automatically set default exchange rate to 3.8 if SAR is involved
  useEffect(() => {
    if (selectedCurrency && liabilityCurrency && selectedCurrency !== liabilityCurrency) {
      if ((selectedCurrency === 'SAR' && liabilityCurrency === 'USD') || (selectedCurrency === 'USD' && liabilityCurrency === 'SAR')) {
        setVoucherExchangeRate('3.8');
      } else {
        setVoucherExchangeRate('1');
      }
    } else {
      setVoucherExchangeRate('1');
    }
  }, [selectedCurrency, liabilityCurrency]);

  useEffect(() => {
    const src = funds.find(f => f.id === transferSourceFundId);
    const dest = funds.find(f => f.id === transferDestFundId);
    if (src && dest && src.currency !== dest.currency) {
      if ((src.currency === 'SAR' && dest.currency === 'USD') || (src.currency === 'USD' && dest.currency === 'SAR')) {
        setTransferExchangeRate('3.8');
      } else {
        setTransferExchangeRate('1');
      }
    } else {
      setTransferExchangeRate('1');
    }
  }, [transferSourceFundId, transferDestFundId, funds]);
`;

code = code.replace(/\/\/ Synchronize currency automatically with selected fund/, effectCode + '\n  // Synchronize currency automatically with selected fund');
fs.writeFileSync('src/components/Vault.tsx', code);
