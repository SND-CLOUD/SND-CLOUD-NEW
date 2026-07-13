const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

const oldCheck = `    if (!sourceFund || !destFund) {
      setErrorMsg('أحد الصناديق غير موجود');
      return;
    }

    setIsPosting(true);`;

const newCheck = `    if (!sourceFund || !destFund) {
      setErrorMsg('أحد الصناديق غير موجود');
      return;
    }

    if (sourceFund.currency !== destFund.currency) {
      const rate = parseFloat(transferExchangeRate);
      if (isNaN(rate) || rate <= 0) {
        setErrorMsg('الرجاء إدخال سعر صرف صحيح أكبر من الصفر');
        return;
      }
    }

    setIsPosting(true);`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('src/components/Vault.tsx', code);
