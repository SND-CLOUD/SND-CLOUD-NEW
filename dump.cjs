const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const targetStr = "{activeAdvancedManagementModal === 'database' && (";
const targetIdx = content.indexOf(targetStr);
let parens = 0;
let endIdx = -1;
let started = false;
for (let i = targetIdx; i < content.length; i++) {
  if (content[i] === '(') {
    parens++;
    started = true;
  } else if (content[i] === ')') {
    parens--;
    if (started && parens === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

const dbModalContent = content.substring(targetIdx, endIdx);
fs.writeFileSync('db_modal_content.txt', dbModalContent);
