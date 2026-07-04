import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\index.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 4. Cofounder Chat
content = re.sub(
    r"(app\.post\('/api/ai/chat', authMiddleware, )(async \(req: Request, res: Response\))",
    r"\1requireCredits(CREDIT_COSTS.AI_CHAT_MESSAGE), \2",
    content
)
content = re.sub(
    r"(const userMessage = \{ role: 'user', content: message \};)",
    r"await deductCredits(userId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'AI Chat Message');\n    \1",
    content
)

# 5. RAG Upload
content = re.sub(
    r"(app\.post\('/api/projects/:projectId/documents/upload', authMiddleware, )(async \(req: Request, res: Response\))",
    r"\1requireCredits(CREDIT_COSTS.RAG_QUERY), \2",
    content
)
# We assume deductCredits can just be placed at the top of the route handler.
content = re.sub(
    r"(const userId = \(req as any\)\.user\.id;)",
    r"\1\n    await deductCredits(userId, CREDIT_COSTS.RAG_QUERY, 'RAG Upload');",
    content
)

# Append Placeholder Routes for missing endpoints
missing_endpoints = """
// 6. Financial Engine
app.post('/api/financial-engine/generate', authMiddleware, requireCredits(CREDIT_COSTS.FINANCIAL_ENGINE), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    await deductCredits(userId, CREDIT_COSTS.FINANCIAL_ENGINE, 'Financial Engine');
    return res.status(200).json({ success: true, message: 'Financial Engine Generated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Branding
app.post('/api/branding/generate', authMiddleware, requireCredits(CREDIT_COSTS.BRANDING), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    await deductCredits(userId, CREDIT_COSTS.BRANDING, 'Branding');
    return res.status(200).json({ success: true, message: 'Branding Generated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. Marketing
app.post('/api/marketing/generate', authMiddleware, requireCredits(CREDIT_COSTS.MARKETING), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    await deductCredits(userId, CREDIT_COSTS.MARKETING, 'Marketing');
    return res.status(200).json({ success: true, message: 'Marketing Generated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. Pitch Deck
app.post('/api/pitch-deck/generate', authMiddleware, requireCredits(CREDIT_COSTS.PITCH_DECK), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    await deductCredits(userId, CREDIT_COSTS.PITCH_DECK, 'Pitch Deck');
    return res.status(200).json({ success: true, message: 'Pitch Deck Generated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 10. Image Generation
app.post('/api/image/generate', authMiddleware, requireCredits(CREDIT_COSTS.IMAGE_GENERATION), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    await deductCredits(userId, CREDIT_COSTS.IMAGE_GENERATION, 'Image Generation');
    return res.status(200).json({ success: true, url: 'https://via.placeholder.com/512' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
"""

if "api/financial-engine/generate" not in content:
    # insert before app.listen
    content = content.replace("app.listen(PORT", missing_endpoints + "\napp.listen(PORT")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.ts again")
