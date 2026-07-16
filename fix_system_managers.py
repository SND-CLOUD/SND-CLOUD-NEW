import re

with open('src/components/SystemManagersList.tsx', 'r') as f:
    text = f.read()

text = text.replace("user.status === 'active' ? 'inactive' : 'active'", "user.isActive ? false : true")
text = text.replace("newStatus === 'active'", "newStatus")
text = text.replace("{ status: newStatus }", "{ isActive: newStatus }")
text = text.replace("user.status === 'active'", "user.isActive")

with open('src/components/SystemManagersList.tsx', 'w') as f:
    f.write(text)
