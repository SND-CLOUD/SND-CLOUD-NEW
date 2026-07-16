import re

with open('src/components/Settings.tsx', 'r') as f:
    content = f.read()

# Remove the duplicated blocks that were appended to the end of the file
# Find the last "export default Settings;" and truncate there.
idx = content.rfind("export default Settings;")
if idx != -1:
    idx2 = content.find("export default Settings;")
    if idx2 != -1 and idx2 != idx:
        content = content[:idx2 + len("export default Settings;")] + '\n'

with open('src/components/Settings.tsx', 'w') as f:
    f.write(content)
