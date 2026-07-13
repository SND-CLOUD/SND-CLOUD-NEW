const fs = require('fs');
let code = fs.readFileSync('src/components/Vault.tsx', 'utf8');

code = code.replace(/      let destAmount = parsedAmount;\n      let finalTransferNotesSrc = transferNotes \? ' - ' \+ transferNotes : '';\n      let finalTransferNotesDest = transferNotes \? ' - ' \+ transferNotes : '';\n\n      if \(sourceFund\.currency !== destFund\.currency\) \{\n        const srcRate = parseFloat\(transferSourceRate\) \|\| 1;\n        const dstRate = parseFloat\(transferDestRate\) \|\| 1;\n        destAmount = dstRate > 0 \? Math\.round\(\(parsedAmount \* \(srcRate \/ dstRate\)\) \* 100\) \/ 100 : 0;\n        \n        const rateNotes = \` \[سعر الصرف: \$\{srcRate\} لعملة \$\{sourceFund\.currency\} مقابل \$\{dstRate\} لعملة \$\{destFund\.currency\}\]\`;\n        finalTransferNotesSrc \+= rateNotes;\n        finalTransferNotesDest \+= rateNotes;\n      \}/g,
`      let destAmount = parsedAmount;
      let finalTransferNotesSrc = transferNotes ? ' - ' + transferNotes : '';
      let finalTransferNotesDest = transferNotes ? ' - ' + transferNotes : '';

      if (sourceFund.currency !== destFund.currency) {
        const rate = parseFloat(transferExchangeRate) || 1;
        destAmount = rate > 0 ? Math.round((parsedAmount / rate) * 100) / 100 : 0;
        
        const rateNotes = \` [سعر الصرف: \${rate} لعملة \${sourceFund.currency} مقابل \${destFund.currency}]\`;
        finalTransferNotesSrc += rateNotes;
        finalTransferNotesDest += rateNotes;
      }`);

fs.writeFileSync('src/components/Vault.tsx', code);
