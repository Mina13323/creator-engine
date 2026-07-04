import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\services\creditEngine.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "if (process.env.DEMO_MODE === 'true' || mongoose.connection.readyState !== 1)",
    "if (process.env.DEMO_MODE === 'true')"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed all readyState checks in creditEngine.ts")
