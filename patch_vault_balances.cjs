const fs = require('fs');

function patchVaultBalances() {
  let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');
  
  // 1. Voucher balance adjustment
  code = code.replace(
    /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[balanceAdjustment, matchedFund\.id\]\s*\);/m,
    `await ProviderFactory.getProvider().updateDoc('fin_funds', matchedFund.id, { balance: { type: 'increment', value: balanceAdjustment } });`
  );

  // 2. Invoice settlement balance adjustment
  code = code.replace(
    /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[parsedAmount, matchedFund\.id\]\s*\);/m,
    `await ProviderFactory.getProvider().updateDoc('fin_funds', matchedFund.id, { balance: { type: 'increment', value: parsedAmount } });`
  );

  // 3. Account settlement balance adjustment
  code = code.replace(
    /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[parsedAmount, matchedFund\.id\]\s*\);/m,
    `await ProviderFactory.getProvider().updateDoc('fin_funds', matchedFund.id, { balance: { type: 'increment', value: parsedAmount } });`
  );

  // 4. Transfer balance adjustments (there are two)
  code = code.replace(
    /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance - \? WHERE id = \?",\s*\[parsedAmount, transferFromFund\.id\]\s*\);/m,
    `await ProviderFactory.getProvider().updateDoc('fin_funds', transferFromFund.id, { balance: { type: 'increment', value: -parsedAmount } });`
  );
  code = code.replace(
    /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[parsedAmount, transferToFund\.id\]\s*\);/m,
    `await ProviderFactory.getProvider().updateDoc('fin_funds', transferToFund.id, { balance: { type: 'increment', value: parsedAmount } });`
  );

  fs.writeFileSync('src/components/Vault.tsx', code);
}
patchVaultBalances();
