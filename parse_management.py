import re

with open('src/components/Settings.tsx', 'r') as f:
    text = f.read()

start_str = "{activeTab === 'management' && ("
idx_start = text.find(start_str)

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
open('management_block.txt', 'w').write(block)
print(f"Extracted block size: {len(block)}")
