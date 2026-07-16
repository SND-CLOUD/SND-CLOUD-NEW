import re

with open('src/components/Settings.tsx', 'r') as f:
    text = f.read()

text = text.replace('ShieldAlert', 'Shield')

with open('src/components/Settings.tsx', 'w') as f:
    f.write(text)
