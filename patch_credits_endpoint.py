import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\index.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update /api/user/credits to return isDemo
if "isDemo:" not in content:
    content = re.sub(
        r"return res\.status\(200\)\.json\(\{ wallet \}\);",
        "return res.status(200).json({ wallet, isDemo: process.env.DEMO_MODE === 'true' });",
        content
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated /api/user/credits endpoint")
