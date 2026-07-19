const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const targetStr = "{activeAdvancedManagementModal === 'database' && (";
const targetIdx = content.indexOf(targetStr);
if (targetIdx === -1) {
  console.log("Not found target");
  process.exit(1);
}

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

// dbModalContent currently has the sidebar layout:
// <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
// ...
// <div className="md:col-span-3">
//   {advancedDbView === 'list' ? (
//      <div className="space-y-6">
//        {advancedDbSubTab === 'sync' ? (
//           [SYNC CONTENT]
//        ) : (
//           [BACKUP CONTENT]
//        )}
//      </div>
//   ) : (
//      [OTHER CONTENT]
//   )}
// </div>

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
const backupContent = dbModalContent.substring(backupStartIdx + backupStartStr.length, backupEndIdx - 1);

const otherContentStartStr = "                              {advancedDbView === 'list' ? (";
// wait, the outer is: {advancedDbView === 'list' ? ( ... ) : ( ... )}
// The other views (import, archive, factory_reset) are in the backup section?
// No, looking at my previous cats, they are handled at the same level as `list`.
// Let's just find the `advancedDbView === 'list' ? (` and `) : (`.
