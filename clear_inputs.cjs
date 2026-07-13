const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const clearVoucherCode = `
  useEffect(() => {
    setVoucherAmount('');
    setVoucherNotes('لا يوجد');
    setDepositorName('');
    setReferenceNumber('');
  }, [selectedFundId, liabilityCurrency]);

  useEffect(() => {
    setTransferAmount('');
    setTransferNotes('');
  }, [transferSourceFundId, transferDestFundId]);
`;

code = code.replace(/\/\/ Form Validity check/, clearVoucherCode + '\n  // Form Validity check');
fs.writeFileSync('src/components/Vault.tsx', code);
