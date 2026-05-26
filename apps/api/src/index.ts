import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  connectDB,
  ProjectModel,
  BusinessIdeaModel,
  BusinessValidationModel,
  BusinessModelModel,
  BrandIdentityModel,
  MarketingCampaignModel,
  ExecutionRoadmapModel,
  ConversationModel
} from '@creator/database';
import { orchestrateVentureBuilder, runCofounderAgent } from '@creator/agents';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.DATABASE_URL;

// Optional database connection connection state tracker
let dbConnected = false;

if (MONGO_URL) {
  connectDB(MONGO_URL)
    .then(() => {
      dbConnected = true;
    })
    .catch((err) => {
      console.warn('MongoDB connection failed. Running API with in-memory fallback state.', err);
    });
} else {
  console.warn('DATABASE_URL is missing. API running with in-memory fallback state.');
}

// In-Memory Fallback DB for running offline or without database configurations
const inMemoryDB = {
  projects: [] as any[],
  ideas: [] as any[],
  validations: [] as any[],
  models: [] as any[],
  brands: [] as any[],
  marketings: [] as any[],
  roadmaps: [] as any[],
  conversations: [] as any[]
};

// ==========================================
// ROUTES
// ==========================================

// Base health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', database: dbConnected ? 'connected' : 'offline/mock-fallback' });
});

// Create Project & Kickoff Multi-Agent Generation
app.post('/api/projects', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, industry, skills, budget, location, userId = 'user_demo' } = req.body;

    if (!name || !description || !industry || !skills || !budget || !location) {
      return res.status(400).json({ error: 'Missing required onboarding parameters' });
    }

    const projectId = `proj_${Date.now()}`;
    const projectDoc = {
      id: projectId,
      userId,
      name,
      description,
      industry,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(`[API] Initializing Project: ${name}`);

    // Trigger multi-agent pipeline
    const agentOutputs = await orchestrateVentureBuilder(
      projectId,
      skills,
      budget,
      industry,
      location
    );

    if (dbConnected) {
      const pModel = new ProjectModel(projectDoc);
      await pModel.save();

      await new BusinessIdeaModel({ ...agentOutputs.idea, projectId }).save();
      await new BusinessValidationModel({ ...agentOutputs.validation, projectId }).save();
      await new BusinessModelModel({ ...agentOutputs.strategy, projectId }).save();
      await new BrandIdentityModel({ ...agentOutputs.branding, projectId }).save();
      await new MarketingCampaignModel({ ...agentOutputs.marketing, projectId }).save();
      await new ExecutionRoadmapModel({ ...agentOutputs.roadmap, projectId }).save();
    } else {
      inMemoryDB.projects.push(projectDoc);
      inMemoryDB.ideas.push({ ...agentOutputs.idea, projectId });
      inMemoryDB.validations.push({ ...agentOutputs.validation, projectId });
      inMemoryDB.models.push({ ...agentOutputs.strategy, projectId });
      inMemoryDB.brands.push({ ...agentOutputs.branding, projectId });
      inMemoryDB.marketings.push({ ...agentOutputs.marketing, projectId });
      inMemoryDB.roadmaps.push({ ...agentOutputs.roadmap, projectId });
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

// Get Project Details & All AI Generated Outputs
app.get('/api/projects/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const projectId = req.params.id;

    if (dbConnected) {
      const project = await ProjectModel.findOne({ id: projectId });
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const idea = await BusinessIdeaModel.findOne({ projectId });
      const validation = await BusinessValidationModel.findOne({ projectId });
      const strategy = await BusinessModelModel.findOne({ projectId });
      const branding = await BrandIdentityModel.findOne({ projectId });
      const marketing = await MarketingCampaignModel.findOne({ projectId });
      const roadmap = await ExecutionRoadmapModel.findOne({ projectId });

      return res.json({
        project,
        outputs: { idea, validation, strategy, branding, marketing, roadmap }
      });
    } else {
      const project = inMemoryDB.projects.find(p => p.id === projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const idea = inMemoryDB.ideas.find(i => i.projectId === projectId);
      const validation = inMemoryDB.validations.find(v => v.projectId === projectId);
      const strategy = inMemoryDB.models.find(m => m.projectId === projectId);
      const branding = inMemoryDB.brands.find(b => b.projectId === projectId);
      const marketing = inMemoryDB.marketings.find(m => m.projectId === projectId);
      const roadmap = inMemoryDB.roadmaps.find(r => r.projectId === projectId);

      return res.json({
        project,
        outputs: { idea, validation, strategy, branding, marketing, roadmap }
      });
    }
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List Projects
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    if (dbConnected) {
      const list = await ProjectModel.find().sort({ createdAt: -1 });
      res.json(list);
    } else {
      res.json([...inMemoryDB.projects].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// AI Cofounder Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response): Promise<any> => {
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
      const idea = await BusinessIdeaModel.findOne({ projectId });
      projectDesc = `${project?.name || ''} - ${project?.description || ''}. AI idea: ${idea?.description || ''}`;

      const conversation = await ConversationModel.findOne({ projectId });
      chatHistory = conversation?.messages || [];
    } else {
      const project = inMemoryDB.projects.find(p => p.id === projectId);
      const idea = inMemoryDB.ideas.find(i => i.projectId === projectId);
      projectDesc = `${project?.name || ''} - ${project?.description || ''}. AI idea: ${idea?.description || ''}`;

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
app.get('/api/ai/chat/:projectId', async (req: Request, res: Response) => {
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
