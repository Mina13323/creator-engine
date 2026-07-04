import re

files_to_patch = [
    r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\index.ts',
    r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\middleware.ts'
]

for filepath in files_to_patch:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change dotenv.config() to also load from root
    if "dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') })" not in content:
        content = re.sub(
            r"dotenv\.config\(\);",
            "dotenv.config();\ndotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });",
            content
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Patched dotenv config to load root .env")
