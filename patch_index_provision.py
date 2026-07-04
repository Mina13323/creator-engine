import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\index.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure it's imported
if "provisionUserMonetization" not in content:
    content = content.replace("import { getUserCredits, deductCredits } from './services/creditEngine';",
                              "import { getUserCredits, deductCredits, provisionUserMonetization } from './services/creditEngine';")

# 1. Patch signup
if "await provisionUserMonetization(newUser.id);" not in content:
    content = re.sub(
        r"(const newUser = new UserModel\(\{.*\}\);\s*await newUser\.save\(\);)",
        r"\1\n    await provisionUserMonetization(newUser.id);",
        content
    )

# 2. Patch google auth
if "await provisionUserMonetization(user.id);" not in content:
    content = re.sub(
        r"(user = new UserModel\(\{.*\}\);\s*await user\.save\(\);\s*\})",
        r"\1\n    await provisionUserMonetization(user.id);",
        content
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched index.ts to call provisionUserMonetization")
