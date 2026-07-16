const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

// Undo the wrong injection at 1258!
const wrongInjection = `                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>`;

// Note: I replaced the first </AnimatePresence> with toPrepend + </AnimatePresence>.
// So I will just find toPrepend and replace it with nothing.
const toPrepend = `                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      `;

content = content.replace(toPrepend, '');

// Now inject at the right place!
// The right place is BEFORE `      {/* Custom Dialog for Reset Confirmation */}`
const targetString = "      {/* Custom Dialog for Reset Confirmation */}";
const targetIndex = content.lastIndexOf(targetString);

// Wait, the `</AnimatePresence>` before targetString is the one we want.
// Actually, `</AnimatePresence>` is right above it.
const searchBlock = `</AnimatePresence>\n\n      {/* Custom Dialog for Reset Confirmation */}`;

content = content.replace(searchBlock, toPrepend + searchBlock);

fs.writeFileSync('src/components/Settings.tsx', content);
console.log("Fixed for real!");
