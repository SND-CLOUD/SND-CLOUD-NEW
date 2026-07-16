import re

with open('src/components/Settings.tsx', 'r') as f:
    text = f.read()

# I will write a regex or simple parser to locate the `activeTab === 'advanced-management'` block.
start_str = "{activeTab === 'advanced-management' && ("
idx_start = text.find(start_str)

# Find the closing brace for the `activeTab === 'advanced-management'` block.
# We will count braces.
count = 0
idx_end = -1
for i in range(idx_start, len(text)):
    if text[i] == '{':
        count += 1
    elif text[i] == '}':
        count -= 1
        if count == 0:
            idx_end = i + 1 # wait, the block ends with )} not just }.
            # Let's count parentheses instead for the ( ) block!
            break

# The block is `{activeTab === 'advanced-management' && ( ... )}`
paren_count = 0
started = False
for i in range(idx_start + len(start_str) - 1, len(text)):
    if text[i] == '(':
        paren_count += 1
        started = True
    elif text[i] == ')':
        paren_count -= 1
        if started and paren_count == 0:
            idx_end = i + 1
            if text[i+1] == '}':
                idx_end += 1
            break

block = text[idx_start:idx_end]
open('advanced_block.txt', 'w').write(block)
print(f"Extracted block size: {len(block)}")
