import re

filepath = r'C:\Users\Mina Wael\Desktop\CEO\apps\api\src\index.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports if missing
if 'import paymentsRouter from' not in content:
    content = re.sub(
        r"import adminRouter.*?;",
        "import adminRouter, { registerLockdownHandlers } from './routes/admin';\nimport paymentsRouter from './routes/payments';\nimport { requireCredits, requireSubscription } from './middleware';\nimport { deductCredits, CREDIT_COSTS, getUserCredits } from './services/creditEngine';",
        content,
        flags=re.DOTALL
    )

if "app.use('/api/payments', paymentsRouter);" not in content:
    content = re.sub(
        r"app.use\('/api/admin', adminRouter\);",
        "app.use('/api/admin', adminRouter);\napp.use('/api/payments', paymentsRouter);",
        content
    )

# 1. Founder Analysis
content = re.sub(
    r"(app\.post\('/api/founder/analyze', authMiddleware, )(async \(req: Request, res: Response\))",
    r"\1requireCredits(CREDIT_COSTS.FOUNDER_ANALYSIS), \2",
    content
)
content = re.sub(
    r"(const founderProfile = new FounderProfileModel\(\{.*?\}\);\s*if \(dbConnected\) \{)",
    r"await deductCredits(userId, CREDIT_COSTS.FOUNDER_ANALYSIS, 'Founder Analysis');\n    \1",
    content,
    flags=re.DOTALL
)

# 2. Opportunity Discovery
content = re.sub(
    r"(app\.post\('/api/opportunities/discover', authMiddleware, )(async \(req: Request, res: Response\))",
    r"\1requireCredits(CREDIT_COSTS.OPPORTUNITY_DISCOVERY), \2",
    content
)
content = re.sub(
    r"(const formattedOpportunities = \(rawOpportunities \|\| \[\]\))",
    r"await deductCredits(userId, CREDIT_COSTS.OPPORTUNITY_DISCOVERY, 'Opportunity Discovery');\n    \1",
    content
)

# 3. Business Plan
content = re.sub(
    r"(app\.post\('/api/business-plan/generate', authMiddleware, )(async \(req: Request, res: Response\))",
    r"\1requireCredits(CREDIT_COSTS.BUSINESS_PLAN), \2",
    content
)
content = re.sub(
    r"(const businessPlan = new BusinessPlanModel\(\{.*?\}\);\s*if \(dbConnected\) \{)",
    r"await deductCredits(userId, CREDIT_COSTS.BUSINESS_PLAN, 'Business Plan');\n    \1",
    content,
    flags=re.DOTALL
)

# 4. Cofounder Chat
content = re.sub(
    r"(app\.post\('/api/chat/send', authMiddleware, )(async \(req: Request, res: Response\))",
    r"\1requireCredits(CREDIT_COSTS.AI_CHAT_MESSAGE), \2",
    content
)
content = re.sub(
    r"(const userMessage = \{ role: 'user', content: message \};)",
    r"await deductCredits(userId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'AI Chat Message');\n    \1",
    content
)

# Also need an endpoint to get the user's credits
if "app.get('/api/user/credits'" not in content:
    credit_endpoint = """
// Get user credits
app.get('/api/user/credits', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const wallet = await getUserCredits(userId);
    return res.status(200).json({ wallet });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
"""
    content = content.replace("// AUTH ROUTES", credit_endpoint + "\n// AUTH ROUTES")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.ts")
