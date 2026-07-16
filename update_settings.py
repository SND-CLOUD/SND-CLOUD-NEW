import re

with open('src/components/Settings.tsx', 'r') as f:
    content = f.read()

with open('/tmp/advanced_management_replacement.txt', 'r') as f:
    advanced_repl = f.read()

with open('/tmp/management_replacement.txt', 'r') as f:
    management_repl = f.read()

# Replace the advanced-management block
# The block starts at "{activeTab === 'advanced-management' && ("
# and ends right before "{activeTab === 'management' && ("
# We can use regex to find it.

pattern_adv = r"\{activeTab === 'advanced-management' && \([\s\S]*?(?=\{activeTab === 'management' && \()"
content = re.sub(pattern_adv, advanced_repl + "\n                ", content)

# Replace the management block
# It starts at "{activeTab === 'management' && ("
# and ends right before "              </div>"
# Wait, let's look at the exact end. The end is:
#                      </div>
#                    </div>
#                  </div>
#                )}
#              </div>
#            </motion.div>
pattern_man = r"\{activeTab === 'management' && \([\s\S]*?\}\)[\s]*</>"
content = re.sub(pattern_man, management_repl + "\n                  </>", content)

with open('src/components/Settings.tsx', 'w') as f:
    f.write(content)
