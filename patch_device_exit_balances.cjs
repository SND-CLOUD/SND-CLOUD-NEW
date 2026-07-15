const fs = require('fs');

let code = fs.readFileSync('src/components/entry-exit/DeviceExit.tsx', 'utf8');

if (!code.includes("ProviderFactory")) {
    code = code.replace("import { localDb } from '../../lib/local-db';", "import { localDb } from '../../lib/local-db';\nimport { ProviderFactory } from '../../data/ProviderFactory';");
}

code = code.replace(
  /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[receiptParsed, matchedFund\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_funds', matchedFund.id, { balance: { type: 'increment', value: receiptParsed } });"
);

code = code.replace(
  /await localDb\.run\(\s*"UPDATE fin_funds SET balance = balance \+ \? WHERE id = \?",\s*\[paymentParsed, matchedFund\.id\]\s*\);/m,
  "await ProviderFactory.getProvider().updateDoc('fin_funds', matchedFund.id, { balance: { type: 'increment', value: paymentParsed } });"
);

fs.writeFileSync('src/components/entry-exit/DeviceExit.tsx', code);
