import re

with open('src/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
if "import 'express-async-errors';" not in content:
    content = "import 'express-async-errors';\n" + content

if "import { errorHandler, AppError }" not in content:
    content = content.replace(
        "import express, { Request, Response } from 'express';", 
        "import express, { Request, Response, NextFunction } from 'express';\nimport { errorHandler, AppError } from './errorHandler';"
    )

# 2. Replace return res.status(XYZ).json({ error: ... })
def replacer(match):
    status = match.group(1)
    msg = match.group(2)
    
    # If the message is the error variable's message
    if msg == 'err.message':
        return 'throw err;'
    if msg == 'error.message':
        return 'throw error;'
        
    code_map = {
        '400': 'BAD_REQUEST',
        '401': 'UNAUTHORIZED',
        '403': 'FORBIDDEN',
        '404': 'NOT_FOUND',
        '409': 'CONFLICT',
        '500': 'INTERNAL_SERVER_ERROR',
        '502': 'BAD_GATEWAY',
        '503': 'SERVICE_UNAVAILABLE'
    }
    code = code_map.get(status, 'ERROR')
    
    # Ensure msg is quoted if it isn't a variable
    if msg.startswith("'") or msg.startswith("`") or msg.startswith('"'):
        return f"throw new AppError({msg}, {status}, '{code}');"
    else:
        return f"throw new AppError(String({msg}), {status}, '{code}');"

content = re.sub(r'return res\.status\((\d+)\)\.json\(\{\s*error:\s*(.+?)\s*\}\);', replacer, content)
content = re.sub(r'res\.status\((\d+)\)\.json\(\{\s*error:\s*(.+?)\s*\}\);', replacer, content)

# 3. Handle specific auth middleware 401 returns
# We need to make sure auth middleware passes errors using throw instead of next since it's wrapped by async-errors
# Actually express-async-errors does catch errors inside middleware too!
# Just in case, let's leave it as is if it didn't match the regex.

# 4. Mount error handler
if 'app.use(errorHandler);' not in content:
    content = content.replace('app.listen(PORT', 'app.use(errorHandler);\n\napp.listen(PORT')

with open('src/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored index.ts")
