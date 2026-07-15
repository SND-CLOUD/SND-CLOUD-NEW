const fs = require('fs');
let code = fs.readFileSync('src/components/AccountingInputs.tsx', 'utf8');

code = code.replace("import { localDb } from '../lib/local-db';", "import { ProviderFactory } from '../data/ProviderFactory';");

// loadAllData
code = code.replace(
  /const typesRes = await localDb\.query\('SELECT \* FROM fin_transaction_types'\);\s*setTxTypes\(\(typesRes\.values \|\| \[\]\) as FinTransactionType\[\]\);\s*const fundsRes = await localDb\.query\('SELECT \* FROM fin_funds'\);\s*setFunds\(\(fundsRes\.values \|\| \[\]\) as FinFund\[\]\);\s*const currRes = await localDb\.query\('SELECT \* FROM fin_currencies'\);\s*setCurrencies\(\(currRes\.values \|\| \[\]\) as FinCurrency\[\]\);\s*const methRes = await localDb\.query\('SELECT \* FROM fin_payment_methods'\);\s*setMethods\(\(methRes\.values \|\| \[\]\) as FinPaymentMethod\[\]\);/,
  `const provider = ProviderFactory.getProvider();
      const typesRes = await provider.getDocs('fin_transaction_types');
      setTxTypes(typesRes.docs.map(d => d.data()) as FinTransactionType[]);
      const fundsRes = await provider.getDocs('fin_funds');
      setFunds(fundsRes.docs.map(d => d.data()) as FinFund[]);
      const currRes = await provider.getDocs('fin_currencies');
      setCurrencies(currRes.docs.map(d => d.data()) as FinCurrency[]);
      const methRes = await provider.getDocs('fin_payment_methods');
      setMethods(methRes.docs.map(d => d.data()) as FinPaymentMethod[]);`
);

fs.writeFileSync('src/components/AccountingInputs.tsx', code);
