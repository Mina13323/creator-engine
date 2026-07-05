const fs = require('fs');
let code = fs.readFileSync('apps/api/src/routes/execution.ts', 'utf8');

// Add runNextActionAgent import
code = code.replace('runExecutionAgent, buildEgyptContextString', 'runExecutionAgent, runNextActionAgent, buildEgyptContextString');

if (!code.includes('getProjectContext')) {
  code = code.replace('dbConnected', 'dbConnected,\n  getProjectContext');
}

const nextActionRoute = `

// GET smart recommendations
router.get('/recommendations', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.query.projectId as string;
    
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    
    const context = await getProjectContext(projectId, userId);
    const egyptCtx = await buildEgyptContextString(JSON.stringify(context.project || {}));
    
    const recommendations = await runNextActionAgent({
      ventureContext: context,
      egyptMarketContext: egyptCtx
    });
    
    return res.json({ recommendations });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace('export default router;', nextActionRoute + '\nexport default router;');

fs.writeFileSync('apps/api/src/routes/execution.ts', code);
console.log('Added /recommendations route');
