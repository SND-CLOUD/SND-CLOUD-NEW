const fs = require('fs');
const content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const indexOfAnimatePresence = content.indexOf("</AnimatePresence>");
const before = content.substring(0, indexOfAnimatePresence);
const after = content.substring(indexOfAnimatePresence);

const toPrepend = `                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      `;

fs.writeFileSync('src/components/Settings.tsx', before + toPrepend + after);
console.log("Fixed!");
