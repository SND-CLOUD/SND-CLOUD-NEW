const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

if (!code.includes("import { tafqeet } from '../lib/tafqeet';")) {
  code = code.replace("import React,", "import { tafqeet } from '../lib/tafqeet';\nimport React,");
}

const oldStatementCompute = `      const statementKeyword = isReceipt ? 'لكم' : 'عليكم';
      const currencyNameText = currencies.find(c => c.name === liabilityCurrency)?.name || liabilityCurrency || '';
      customerStatementNote = \`\${voucherNotes.trim()} \${statementKeyword} مبلغ \${computedLiabilityAmount} \${currencyNameText} مقابل \${selectedCategory}\`;`;

const newStatementCompute = `      const statementKeyword = isReceipt ? 'لكم' : 'عليكم';
      const currencyNameText = currencies.find(c => c.name === liabilityCurrency)?.name || liabilityCurrency || '';
      customerStatementNote = \`\${voucherNotes.trim()} \${statementKeyword} مبلغ \${tafqeet(computedLiabilityAmount)} \${currencyNameText} مقابل \${selectedCategory}\`;`;

code = code.replace(oldStatementCompute, newStatementCompute);

// And update the print view
const oldPrintNotesCompute = `                                const statementKeyword = activeSegment === 'receipt' ? 'لكم' : 'عليكم';
                                const currencyNameText = currencies.find(c => c.name === liabilityCurrency)?.name || liabilityCurrency || '';
                                return \`\${voucherNotes.trim()} \${statementKeyword} مبلغ \${computed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} \${currencyNameText} مقابل \${selectedCategory}\`;
                              })()}`;

const newPrintNotesCompute = `                                const statementKeyword = activeSegment === 'receipt' ? 'لكم' : 'عليكم';
                                const currencyNameText = currencies.find(c => c.name === liabilityCurrency)?.name || liabilityCurrency || '';
                                return \`\${voucherNotes.trim()} \${statementKeyword} مبلغ \${tafqeet(computed)} \${currencyNameText} مقابل \${selectedCategory}\`;
                              })()}`;

code = code.replace(oldPrintNotesCompute, newPrintNotesCompute);

fs.writeFileSync('src/components/Vault.tsx', code);
