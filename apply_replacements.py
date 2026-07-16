with open('src/components/Settings.tsx', 'r') as f:
    text = f.read()

advanced_block = open('advanced_block.txt').read()
advanced_replacement = open('advanced_management_replacement.txt').read()

management_block = open('management_block.txt').read()
management_replacement = open('management_replacement.txt').read()

if advanced_block in text:
    text = text.replace(advanced_block, advanced_replacement)
else:
    print("Advanced block not found!")

if management_block in text:
    text = text.replace(management_block, management_replacement)
else:
    print("Management block not found!")

with open('src/components/Settings.tsx', 'w') as f:
    f.write(text)
print("Done!")
