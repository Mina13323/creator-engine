import re

with open('src/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    err_decl = match.group(1)
    err_var = err_decl.split(':')[0].strip() # extract variable name if it has types
    return f"catch ({err_decl}) {{\n    throw {err_var};\n  }}"

# Fix generic swallowed errors in catch blocks
content = re.sub(
    r'catch\s*\(([^)]+)\)\s*\{\s*(?:console\.error\([^)]+\);\s*)?throw new AppError\([\'"`]Internal Server Error[\'"`],\s*500,\s*[\'"`]INTERNAL_SERVER_ERROR[\'"`]\);\s*\}',
    replacer,
    content
)

content = re.sub(
    r'catch\s*\(([^)]+)\)\s*\{\s*(?:console\.error\([^)]+\);\s*)?throw new AppError\([\'"`]Failed to retrieve memory[\'"`],\s*500,\s*[\'"`]INTERNAL_SERVER_ERROR[\'"`]\);\s*\}',
    replacer,
    content
)

content = re.sub(
    r'catch\s*\(([^)]+)\)\s*\{\s*(?:console\.error\([^)]+\);\s*)?throw new AppError\([\'"`]Failed to clear memory[\'"`],\s*500,\s*[\'"`]INTERNAL_SERVER_ERROR[\'"`]\);\s*\}',
    replacer,
    content
)

with open('src/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed catch blocks")
