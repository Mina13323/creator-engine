import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\index.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all incorrectly placed deductCredits for RAG Upload
content = re.sub(
    r"\n\s*await deductCredits\(userId, CREDIT_COSTS\.RAG_QUERY, 'RAG Upload'\);",
    '',
    content
)

# Re-insert only in the RAG Upload route
content = re.sub(
    r"(app\.post\('/api/projects/:projectId/documents/upload', authMiddleware, requireCredits\(CREDIT_COSTS\.RAG_QUERY\), async \(req: Request, res: Response\): Promise<any> => \{\s*try \{\s*const userId = \(req as any\)\.user\.id;)",
    r"\1\n    await deductCredits(userId, CREDIT_COSTS.RAG_QUERY, 'RAG Upload');",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed index.ts regex damage')
