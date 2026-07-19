const fs = require('fs');
const content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const startStr = "{activeTab === 'advanced-management' && (";
const startIdx = content.indexOf(startStr);

let parens = 0;
let endIdx = -1;
let started = false;
for (let i = startIdx; i < content.length; i++) {
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

const block = content.substring(startIdx, endIdx + 1); // +1 to include } if it's there
fs.writeFileSync('original_block.txt', block);
