const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

// Find the start of the `database` modal content
const dbModalStart = "{activeAdvancedManagementModal === 'database' && (";
const startIdx = content.indexOf(dbModalStart);

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

const dbModalContent = content.substring(startIdx, endIdx);

// Now parse dbModalContent to extract the sync and backup parts.
// Sync part: 
const syncStartStr = "{advancedDbSubTab === 'sync' ? (";
const syncStartIdx = dbModalContent.indexOf(syncStartStr);
let syncParens = 0;
let syncEndIdx = -1;
let syncStarted = false;
for (let i = syncStartIdx; i < dbModalContent.length; i++) {
  if (dbModalContent[i] === '(') {
    syncParens++;
    syncStarted = true;
  } else if (dbModalContent[i] === ')') {
    syncParens--;
    if (syncStarted && syncParens === 0) {
      syncEndIdx = i + 1;
      break;
    }
  }
}
const syncContent = dbModalContent.substring(syncStartIdx + syncStartStr.length, syncEndIdx - 1);
// Wait, syncContent is wrapped in `<div className="space-y-6 animate-in fade-in duration-200"> ... </div>`

// Backup part:
const backupStartStr = ") : (";
const backupStartIdx = dbModalContent.indexOf(backupStartStr, syncEndIdx - 2);
let backupParens = 0;
let backupEndIdx = -1;
let backupStarted = false;
for (let i = backupStartIdx + backupStartStr.length - 1; i < dbModalContent.length; i++) {
  if (dbModalContent[i] === '(') {
    backupParens++;
    backupStarted = true;
  } else if (dbModalContent[i] === ')') {
    backupParens--;
    if (backupStarted && backupParens === 0) {
      backupEndIdx = i + 1;
      break;
    }
  }
}
const backupContentList = dbModalContent.substring(backupStartIdx + backupStartStr.length, backupEndIdx - 1);

// Now for the other views (the else branch of advancedDbView === 'list'):
const otherViewsStartStr = ") : (";
const otherViewsStartIdx = dbModalContent.indexOf(otherViewsStartStr, backupEndIdx - 2);
let otherViewsParens = 0;
let otherViewsEndIdx = -1;
let otherViewsStarted = false;
for (let i = otherViewsStartIdx + otherViewsStartStr.length - 1; i < dbModalContent.length; i++) {
  if (dbModalContent[i] === '(') {
    otherViewsParens++;
    otherViewsStarted = true;
  } else if (dbModalContent[i] === ')') {
    otherViewsParens--;
    if (otherViewsStarted && otherViewsParens === 0) {
      otherViewsEndIdx = i + 1;
      break;
    }
  }
}
const otherViewsContent = dbModalContent.substring(otherViewsStartIdx + otherViewsStartStr.length, otherViewsEndIdx - 1);

// Construct new blocks
const newSyncBlock = `{activeAdvancedManagementModal === 'database-sync' && (
  <div className="animate-in fade-in duration-200 h-full">
    ${syncContent}
  </div>
)}`;

// The backup block has multiple views. It originally had:
// {advancedDbView === 'list' ? ( [backupContentList] ) : ( [otherViewsContent] )}
const newBackupBlock = `{activeAdvancedManagementModal === 'database-backup' && (
  <div className="animate-in fade-in duration-200 h-full">
    {advancedDbView === 'list' ? (
      ${backupContentList}
    ) : (
      ${otherViewsContent}
    )}
  </div>
)}`;

// Replace old dbModalContent with the new ones.
const finalReplacement = newSyncBlock + '\n\n' + newBackupBlock;

const newContent = content.substring(0, startIdx) + finalReplacement + content.substring(endIdx);
fs.writeFileSync('src/components/Settings.tsx', newContent);

