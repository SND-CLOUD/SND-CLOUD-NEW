const fs = require('fs');
let code = fs.readFileSync('src/components/AccountingInputs.tsx', 'utf8');

code = code.replace(
  /await localDb\.run\(\s*'UPDATE fin_transaction_types SET name = \?, type = \? WHERE id = \?',\s*\[typeForm\.name\.trim\(\), typeForm\.type, typeForm\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_transaction_types', typeForm.id, { name: typeForm.name.trim(), type: typeForm.type });"
);

code = code.replace(
  /await localDb\.run\(\s*'INSERT INTO fin_transaction_types \(id, name, type\) VALUES \(\?, \?, \?\)',\s*\[newId, typeForm\.name\.trim\(\), typeForm\.type\]\s*\);/m,
  "await ProviderFactory.getProvider().setDoc('fin_transaction_types', newId, { name: typeForm.name.trim(), type: typeForm.type });"
);

code = code.replace(
  /await localDb\.run\('DELETE FROM fin_transaction_types WHERE id = \?', \[id\]\);/m,
  "await ProviderFactory.getProvider().deleteDoc('fin_transaction_types', id);"
);

// funds
code = code.replace(
  /await localDb\.run\(\s*'UPDATE fin_funds SET name = \?, type = \?, currency = \?, description = \?, status = \?, bankAccount = \? WHERE id = \?',\s*\[\s*fundForm\.name\.trim\(\),\s*fundForm\.type,\s*fundForm\.currency,\s*fundForm\.description\.trim\(\),\s*fundForm\.status,\s*fundForm\.bankAccount\.trim\(\),\s*fundForm\.id\s*\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_funds', fundForm.id, { name: fundForm.name.trim(), type: fundForm.type, currency: fundForm.currency, description: fundForm.description.trim(), status: fundForm.status, bankAccount: fundForm.bankAccount.trim() });"
);

code = code.replace(
  /await localDb\.run\(\s*'INSERT INTO fin_funds \(id, name, type, currency, description, status, balance, bankAccount\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)',\s*\[\s*newId,\s*fundForm\.name\.trim\(\),\s*fundForm\.type,\s*fundForm\.currency,\s*fundForm\.description\.trim\(\),\s*fundForm\.status,\s*0,\s*fundForm\.bankAccount\.trim\(\)\s*\]\s*\);/m,
  "await ProviderFactory.getProvider().setDoc('fin_funds', newId, { name: fundForm.name.trim(), type: fundForm.type, currency: fundForm.currency, description: fundForm.description.trim(), status: fundForm.status, balance: 0, bankAccount: fundForm.bankAccount.trim() });"
);

code = code.replace(
  /await localDb\.run\(\s*'UPDATE fin_funds SET status = \? WHERE id = \?',\s*\[newStatus, fund\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_funds', fund.id, { status: newStatus });"
);

code = code.replace(
  /await localDb\.run\(\s*'DELETE FROM fin_funds WHERE id = \?',\s*\[fund\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().deleteDoc('fin_funds', fund.id);"
);

// currencies
code = code.replace(
  /await localDb\.run\(\s*'UPDATE fin_currencies SET name = \?, symbol = \?, decimals = \?, status = \? WHERE id = \?',\s*\[\s*currencyForm\.name\.trim\(\),\s*currencyForm\.symbol\.trim\(\),\s*Number\(currencyForm\.decimals\),\s*currencyForm\.status,\s*currencyForm\.id\s*\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_currencies', currencyForm.id, { name: currencyForm.name.trim(), symbol: currencyForm.symbol.trim(), decimals: Number(currencyForm.decimals), status: currencyForm.status });"
);

code = code.replace(
  /await localDb\.run\(\s*'INSERT INTO fin_currencies \(id, name, symbol, decimals, status\) VALUES \(\?, \?, \?, \?, \?\)',\s*\[\s*newId,\s*currencyForm\.name\.trim\(\),\s*currencyForm\.symbol\.trim\(\),\s*Number\(currencyForm\.decimals\),\s*currencyForm\.status\s*\]\s*\);/m,
  "await ProviderFactory.getProvider().setDoc('fin_currencies', newId, { name: currencyForm.name.trim(), symbol: currencyForm.symbol.trim(), decimals: Number(currencyForm.decimals), status: currencyForm.status });"
);

// payment methods
code = code.replace(
  /await localDb\.run\(\s*'UPDATE fin_payment_methods SET name = \?, description = \?, status = \? WHERE id = \?',\s*\[\s*methodForm\.name\.trim\(\),\s*methodForm\.description\.trim\(\),\s*methodForm\.status,\s*methodForm\.id\s*\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_payment_methods', methodForm.id, { name: methodForm.name.trim(), description: methodForm.description.trim(), status: methodForm.status });"
);

code = code.replace(
  /await localDb\.run\(\s*'INSERT INTO fin_payment_methods \(id, name, description, status\) VALUES \(\?, \?, \?, \?\)',\s*\[\s*newId,\s*methodForm\.name\.trim\(\),\s*methodForm\.description\.trim\(\),\s*methodForm\.status\s*\]\s*\);/m,
  "await ProviderFactory.getProvider().setDoc('fin_payment_methods', newId, { name: methodForm.name.trim(), description: methodForm.description.trim(), status: methodForm.status });"
);

fs.writeFileSync('src/components/AccountingInputs.tsx', code);
