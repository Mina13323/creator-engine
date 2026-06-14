import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  connectDB,
  UserModel,
  ProjectModel,
  FounderProfileModel,
  BusinessPlanModel,
  MarketResearchModel,
  FinancialForecastModel,
  BrandingModel,
  MarketingModel,
  ExecutionRoadmapModel,
  ConversationModel
} from '@creator/database';
import { orchestrateVentureBuilder, runCofounderAgent } from '@creator/agents';
import { FounderProfile, ProjectResultsResponse } from '@creator/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors());
app.use(express.json());

// In-Memory Fallback for MVP Phase
const inMemoryDB = {
  users: [] as any[],
  projects: [] as any[],
  founderProfiles: [] as any[],
  businessPlans: [] as any[],
  marketResearches: [] as any[],
  financialForecasts: [] as any[],
  brandings: [] as any[],
  marketings: [] as any[],
  roadmaps: [] as any[],
  conversations: [] as any[]
};

let dbConnected = false;

// Initialize MongoDB
if (MONGODB_URI) {
  connectDB(MONGODB_URI)
    .then(() => {
      dbConnected = true;
    })
    .catch((err) => {
      console.warn('Falling back to In-Memory DB');
      dbConnected = false;
    });
} else {
  console.log('No MONGODB_URI provided. Starting with In-Memory DB.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

// Authentication Middleware
const authMiddleware = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', async (req, res): Promise<any> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    let existingUser;
    if (dbConnected) {
      existingUser = await UserModel.findOne({ email });
    } else {
      existingUser = inMemoryDB.users.find(u => u.email === email);
    }
    
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const userDoc = { id: userId, email, password: hashedPassword, name: name || email.split('@')[0] };
    
    if (dbConnected) {
      await new UserModel(userDoc).save();
    } else {
      inMemoryDB.users.push(userDoc);
    }
    
    const userReturn = { id: userId, email, name: userDoc.name };
    const token = jwt.sign(userReturn, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: userReturn, token });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    let user;
    if (dbConnected) {
      user = await UserModel.findOne({ email });
    } else {
      user = inMemoryDB.users.find(u => u.email === email);
    }
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    const userReturn = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(userReturn, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: userReturn, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const user = { id: 'usr_google_1', email: 'google@example.com', name: 'Google User' };
  return res.json({ user, token: 'mock_jwt_token_google' });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});
// ----------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: dbConnected ? 'mongodb' : 'memory' });
});

// Generate Complete Venture (Multi-Agent Orchestration)
app.post('/api/projects', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { name, industry, skills, budget, location, commitment = 'part-time' } = req.body;

    if (!name || !industry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const projectId = `proj_${Date.now()}`;
    const projectDoc = {
      id: projectId,
      userId,
      name,
      description: `A ${industry} venture in ${location}`,
      industry,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const founderProfile: FounderProfile = {
      skills: skills || [],
      budget: budget || 1000,
      industry,
      location: location || 'Unknown',
      commitment
    };

    console.log(`[API] Initializing Project: ${name}`);

    // Trigger multi-agent pipeline
    const agentOutputs = await orchestrateVentureBuilder(projectId, founderProfile);

    if (dbConnected) {
      await new ProjectModel(projectDoc).save();
      await new FounderProfileModel({ ...founderProfile, projectId }).save();
      await new BusinessPlanModel({ ...agentOutputs.businessPlan.data, projectId }).save();
      // MarketResearch is saved separately by Next.js calling the n8n webhook and then saving to API
      await new FinancialForecastModel({ ...agentOutputs.financialForecast.data, projectId }).save();
      await new BrandingModel({ ...agentOutputs.branding.data, projectId }).save();
      await new MarketingModel({ ...agentOutputs.marketing.data, projectId }).save();
      await new ExecutionRoadmapModel({ ...agentOutputs.roadmap.data, projectId }).save();
    } else {
      inMemoryDB.projects.push(projectDoc);
      inMemoryDB.founderProfiles.push({ ...founderProfile, projectId });
      inMemoryDB.businessPlans.push({ ...agentOutputs.businessPlan.data, projectId });
      // MarketResearch is saved separately by Next.js calling the n8n webhook and then saving to API
      inMemoryDB.financialForecasts.push({ ...agentOutputs.financialForecast.data, projectId });
      inMemoryDB.brandings.push({ ...agentOutputs.branding.data, projectId });
      inMemoryDB.marketings.push({ ...agentOutputs.marketing.data, projectId });
      inMemoryDB.roadmaps.push({ ...agentOutputs.roadmap.data, projectId });
    }

    return res.status(201).json({
      project: projectDoc,
      outputs: agentOutputs
    });
  } catch (error: any) {
    console.error('Error generating venture models:', error);
    return res.status(500).json({ error: 'Internal Server Error during AI generation', details: error.message });
  }
});

// Endpoint to save Market Research after Next.js triggers the n8n webhook
app.post('/api/projects/:id/market-research', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const projectId = req.params.id;
    const data = req.body; // validationReport, competitorAnalysis, trendAnalysis

    if (dbConnected) {
      await new MarketResearchModel({ ...data, projectId }).save();
    } else {
      inMemoryDB.marketResearches.push({ ...data, projectId });
    }

    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error saving market research:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get Project Details & All AI Generated Outputs
app.get('/api/projects/:id/results', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const projectId = req.params.id;

    if (dbConnected) {
      const project = await ProjectModel.findOne({ id: projectId });
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const founderProfile = await FounderProfileModel.findOne({ projectId });
      const businessPlan = await BusinessPlanModel.findOne({ projectId });
      const marketResearch = await MarketResearchModel.findOne({ projectId });
      const financialForecast = await FinancialForecastModel.findOne({ projectId });
      const branding = await BrandingModel.findOne({ projectId });
      const marketing = await MarketingModel.findOne({ projectId });
      const roadmap = await ExecutionRoadmapModel.findOne({ projectId });

      const response: ProjectResultsResponse = {
        projectId,
        founderProfile: founderProfile?.toObject() as FounderProfile,
        businessPlan: businessPlan?.toObject() as any,
        marketResearch: marketResearch?.toObject() as any,
        financialForecast: financialForecast?.toObject() as any,
        branding: branding?.toObject() as any,
        marketing: marketing?.toObject() as any,
        roadmap: roadmap?.toObject() as any
      };

      return res.json(response);
    } else {
      const project = inMemoryDB.projects.find(p => p.id === projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const founderProfile = inMemoryDB.founderProfiles.find(fp => fp.projectId === projectId);
      const businessPlan = inMemoryDB.businessPlans.find(i => i.projectId === projectId);
      const marketResearch = inMemoryDB.marketResearches.find(v => v.projectId === projectId);
      const financialForecast = inMemoryDB.financialForecasts.find(c => c.projectId === projectId);
      const branding = inMemoryDB.brandings.find(t => t.projectId === projectId);
      const marketing = inMemoryDB.marketings.find(m => m.projectId === projectId);
      const roadmap = inMemoryDB.roadmaps.find(b => b.projectId === projectId);

      const response: ProjectResultsResponse = {
        projectId,
        founderProfile,
        businessPlan,
        marketResearch,
        financialForecast,
        branding,
        marketing,
        roadmap
      };

      return res.json(response);
    }
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List Projects
app.get('/api/projects', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (dbConnected) {
      const list = await ProjectModel.find({ userId }).sort({ createdAt: -1 });
      res.json(list);
    } else {
      res.json([...inMemoryDB.projects].filter(p => p.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// AI Cofounder Chat Endpoint
app.post('/api/ai/chat', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId, message } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({ error: 'Missing projectId or message payload' });
    }

    let projectDesc = '';
    let chatHistory: any[] = [];

    // Retrieve context about the venture
    if (dbConnected) {
      const project = await ProjectModel.findOne({ id: projectId });
      const bp = await BusinessPlanModel.findOne({ projectId });
      projectDesc = `${project?.name || ''} - ${project?.description || ''}. AI idea: ${bp?.businessIdea || ''}`;

      const conversation = await ConversationModel.findOne({ projectId });
      chatHistory = conversation?.messages || [];
    } else {
      const project = inMemoryDB.projects.find(p => p.id === projectId);
      const bp = inMemoryDB.businessPlans.find(i => i.projectId === projectId);
      projectDesc = `${project?.name || ''} - ${project?.description || ''}. AI idea: ${bp?.businessIdea || ''}`;

      const conversation = inMemoryDB.conversations.find(c => c.projectId === projectId);
      chatHistory = conversation?.messages || [];
    }

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user' as const,
      message,
      timestamp: new Date()
    };

    chatHistory.push(userMessage);

    // Call Cofounder Agent runner
    const aiResponse = await runCofounderAgent(message, projectDesc, chatHistory);
    chatHistory.push(aiResponse);

    if (dbConnected) {
      await ConversationModel.findOneAndUpdate(
        { projectId },
        { $push: { messages: { $each: [userMessage, aiResponse] } } },
        { upsert: true, new: true }
      );
    } else {
      let conversation = inMemoryDB.conversations.find(c => c.projectId === projectId);
      if (!conversation) {
        conversation = { id: `conv_${Date.now()}`, projectId, messages: [] };
        inMemoryDB.conversations.push(conversation);
      }
      conversation.messages.push(userMessage, aiResponse);
    }

    return res.json({
      userMessage,
      aiResponse,
      history: chatHistory
    });
  } catch (error) {
    console.error('Error in cofounder chat:', error);
    return res.status(500).json({ error: 'Internal Server Error in chat conversation' });
  }
});

// Get Chat History
app.get('/api/ai/chat/:projectId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (dbConnected) {
      const conv = await ConversationModel.findOne({ projectId });
      res.json(conv?.messages || []);
    } else {
      const conv = inMemoryDB.conversations.find(c => c.projectId === projectId);
      res.json(conv?.messages || []);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Creator Engine backend running on http://localhost:${PORT}`);
});
