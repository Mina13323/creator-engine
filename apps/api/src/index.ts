import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });
console.log('[API] Resolved .env path:', envPath, 'Loaded Fireworks Key:', process.env.FIREWORKS_API_KEY ? 'YES' : 'NO');
import {
  connectDB,
  ProjectModel,
  BusinessIdeaModel,
  BusinessOpportunityModel,
  SelectedOpportunityModel,
  BusinessValidationModel,
  BusinessModelModel,
  BusinessPlanModel,
  BrandIdentityModel,
  MarketingCampaignModel,
  PitchDeckModel,
  ExecutionRoadmapModel,
  ConversationModel,
  UserModel,
  FounderProfileModel,
  VentureStateModel,
  AgentRunModel,
  UploadedDocumentModel
} from '@creator/database';
import { LoginRequest, SignupRequest, AuthResponse, AuthUser, FounderProfile, SelectedOpportunity, BusinessPlan, PitchDeck } from '@creator/types';
import { queryRAG } from '@creator/rag-core';
import { runFounderAgent, runOpportunityAgent, runBusinessPlanAgent, runCofounderAgent, runBrandingAgent, runMarketingAgent, runPitchAgent } from '@creator/agents';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_for_jwt_fallback_only';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'mock_client_id');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.DATABASE_URL;

let dbConnected = false;

if (MONGO_URL) {
  connectDB(MONGO_URL)
    .then(() => {
      dbConnected = true;
    })
    .catch((err) => {
      console.warn('MongoDB connection failed. API requires DB.', err);
    });
} else {
  console.warn('DATABASE_URL is missing.');
}

// UTILITIES
function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): { id: string; email: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
}

function toAuthUser(user: any): AuthUser {
  return { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
}

// MIDDLEWARES
export const authMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    const decoded = verifyToken(token);
    (req as any).user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Base health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', database: dbConnected ? 'connected' : 'offline' });
});

// AUTH ROUTES
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required for authentication' });
    const { email, password, name } = req.body as SignupRequest;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields: email, password, and name are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const newUser = new UserModel({ id: userId, email, password: hashedPassword, name });
    await newUser.save();

    const token = generateToken(newUser.id, email);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.status(201).json({ token, user: toAuthUser(newUser) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response): Promise<any> => {
  // Alias
  return app._router.handle(req, res, () => { });
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required for authentication' });
    const { email, password } = req.body as LoginRequest;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields: email and password are required' });

    const user = await UserModel.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, email);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.json({ token, user: toAuthUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/google', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required' });
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

    let payload: any = null;
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
      } else {
        payload = jwt.decode(credential);
      }
    } catch (e) {
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) return res.status(401).json({ error: 'Invalid Google token' });

    const { email, name, sub: googleId, picture } = payload;
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = new UserModel({ id: `usr_${Date.now()}`, email, name, googleId, avatar: picture });
      await user.save();
    } else {
      let needsSave = false;
      if (!user.googleId) { user.googleId = googleId; needsSave = true; }
      if (!user.avatar && picture) { user.avatar = picture; needsSave = true; }
      if (needsSave) await user.save();
    }

    const token = generateToken(user.id, email);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.json({ token, user: toAuthUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/check-email', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required' });
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const user = await UserModel.findOne({ email });
    return res.json({ exists: !!user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required' });
    const userId = (req as any).user.id;
    const user = await UserModel.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: toAuthUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// BUSINESS PLAN ENGINE ROUTES
// ==========================================

// Helper to update Venture State
async function updateVentureState(projectId: string, userId: string, update: Partial<any>) {
  if (!dbConnected) return;
  await VentureStateModel.findOneAndUpdate(
    { projectId, userId },
    { $set: { ...update, lastUpdated: new Date() } },
    { upsert: true, new: true }
  );
}

// Helper to track Agent Runs
async function trackAgentRun(
  userId: string,
  projectId: string,
  workflow: string,
  input: any,
  action: () => Promise<any>,
  aiModel?: string
) {
  if (!dbConnected) return await action();

  const run = new AgentRunModel({
    id: `run_${Date.now()}`,
    userId,
    projectId,
    workflow,
    status: 'running',
    aiModel: aiModel || 'deepseek-v3',
    provider: 'fireworks',
    startedAt: new Date(),
    input
  });
  await run.save();

  try {
    const result = await action();
    run.status = 'success';
    run.completedAt = new Date();
    run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    run.output = result;
    await run.save();
    return result;
  } catch (error: any) {
    run.status = 'failed';
    run.completedAt = new Date();
    run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    run.error = error.message;
    await run.save();
    throw error;
  }
}

// 0. Create Project (Decoupled)
app.post('/api/projects', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing project name' });

    const projectId = `proj_${Date.now()}`;
    const project = new ProjectModel({
      id: projectId,
      userId,
      name,
      description: `Project for ${userId}`,
      industry: 'Unknown',
      status: 'draft'
    });

    if (dbConnected) {
      await project.save();
    }

    return res.status(201).json({ projectId, status: 'draft', project });
  } catch (err: any) {
    console.error('Project creation error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 1. Founder Analysis
app.post('/api/founder/analyze', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, data } = req.body;

    if (!projectId || !data) return res.status(400).json({ error: 'Missing projectId or data' });

    // Call Agent with tracking
    const analysis = await trackAgentRun(userId, projectId, 'founder-analysis', data, () => runFounderAgent(projectId, data));

    const founderProfile = new FounderProfileModel({
      id: `fp_${Date.now()}`,
      userId,
      projectId,
      ...data,
      ...(analysis || {})
    });

    if (dbConnected) {
      await founderProfile.save();
      await updateVentureState(projectId, userId, { founderProfile: founderProfile.toObject() });
    }

    return res.status(201).json({ founderProfile });
  } catch (err: any) {
    console.error('Founder analysis error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. Opportunity Discovery
app.post('/api/opportunities/discover', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

    const founderProfile = await FounderProfileModel.findOne({ projectId, userId });
    if (!founderProfile) return res.status(404).json({ error: 'Founder profile not found' });

    // Call Agent with tracking (Model: deepseek-v4-flash)
    const rawOpportunities = await trackAgentRun(
      userId,
      projectId,
      'opportunity-discovery',
      founderProfile.toObject(),
      () => runOpportunityAgent(projectId, founderProfile.toObject()),
      'deepseek-v4-flash'
    );

    // Express owns formatting and persistence
    const formattedOpportunities = (rawOpportunities || []).map((opp: any, idx: number) => {
      const startupCostStr = typeof opp.startupCost === 'number'
        ? `$${opp.startupCost.toLocaleString()}`
        : String(opp.startupCost || '$0');

      const estimatedRevenueStr = typeof opp.estimatedRevenue === 'number'
        ? `$${opp.estimatedRevenue.toLocaleString()}/mo`
        : String(opp.estimatedRevenue || '$0/mo');

      return {
        id: opp.id || `opp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        projectId,
        title: opp.title,
        description: opp.description,
        opportunityScore: opp.opportunityScore || 0,
        founderFitScore: opp.founderFitScore || 0,
        marketDemandScore: opp.marketDemandScore || 0,
        aiAdvantageScore: opp.aiAdvantageScore || 0,
        difficulty: opp.difficulty || 'Medium',
        startupCost: startupCostStr,
        estimatedRevenue: estimatedRevenueStr,
        timeToMVP: opp.timeToMVP || '4 Weeks'
      };
    });

    if (dbConnected) {
      // Clear previous opportunities for the project to prevent duplicates on regeneration
      await BusinessOpportunityModel.deleteMany({ projectId, userId });

      if (formattedOpportunities.length > 0) {
        await BusinessOpportunityModel.insertMany(formattedOpportunities);
      }
    }

    return res.json({ opportunities: formattedOpportunities });
  } catch (err: any) {
    console.error('Opportunity discovery error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. Select Opportunity
app.post('/api/opportunities/select', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, opportunityId } = req.body;
    if (!projectId || !opportunityId) return res.status(400).json({ error: 'Missing projectId or opportunityId' });

    const project = await ProjectModel.findOne({ id: projectId, userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const opportunity = await BusinessOpportunityModel.findOne({ id: opportunityId, projectId });
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });

    // Wrap in trackAgentRun to audit opportunity selection (workflow: 'opportunity-selection', model: 'system')
    const selected = await trackAgentRun(
      userId,
      projectId,
      'opportunity-selection',
      { opportunityId },
      async () => {
        // Delete previous selected opportunity for this project
        await SelectedOpportunityModel.deleteMany({ projectId, userId });

        const newSelected = new SelectedOpportunityModel({
          id: `sel_${Date.now()}`,
          userId,
          projectId,
          opportunityId,
          title: opportunity.title,
          description: opportunity.description,
          opportunityScore: opportunity.opportunityScore,
          founderFitScore: opportunity.founderFitScore,
          marketDemandScore: opportunity.marketDemandScore,
          aiAdvantageScore: opportunity.aiAdvantageScore,
          difficulty: opportunity.difficulty,
          startupCost: opportunity.startupCost,
          estimatedRevenue: opportunity.estimatedRevenue,
          timeToMVP: opportunity.timeToMVP,
          selectedAt: new Date()
        });

        if (dbConnected) {
          await newSelected.save();
          // Save selectedOpportunityId on Project document (instead of renaming project)
          await ProjectModel.findOneAndUpdate({ id: projectId, userId }, { selectedOpportunityId: opportunityId });
          await updateVentureState(projectId, userId, { selectedOpportunity: newSelected.toObject() });
        }

        return newSelected;
      },
      'system'
    );

    return res.json({ success: true, selectedOpportunity: selected });
  } catch (err: any) {
    console.error('Opportunity selection error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. Generate Business Plan
app.post('/api/business-plan/generate', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;

    const selected = await SelectedOpportunityModel.findOne({ projectId, userId });
    if (!selected) return res.status(400).json({ error: 'No opportunity selected for this project' });

    const founderProfile = await FounderProfileModel.findOne({ projectId, userId });
    if (!founderProfile) return res.status(400).json({ error: 'Founder profile not found for this project' });

    // Call Agent with tracking (workflow: 'business-plan', model: 'deepseek-v4-flash')
    const planData = await trackAgentRun(
      userId,
      projectId,
      'business-plan',
      selected.toObject(),
      () => runBusinessPlanAgent(projectId, selected.toObject(), founderProfile.toObject()),
      'deepseek-v4-flash'
    );

    let version = 1;
    if (dbConnected) {
      const existingLatest = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });
      if (existingLatest) {
        version = (existingLatest.version || 1) + 1;
        existingLatest.isLatest = false;
        await existingLatest.save();
      }
    }

    const plan = new BusinessPlanModel({
      id: `bp_${Date.now()}`,
      userId,
      projectId,
      ...planData,
      generatedByModel: 'deepseek-v4-flash',
      generatedAt: new Date(),
      version,
      isLatest: true
    });

    if (dbConnected) {
      await plan.save();
      await updateVentureState(projectId, userId, {
        latestBusinessPlan: {
          id: plan.id,
          version: plan.version,
          generatedAt: plan.generatedAt || new Date(),
          generatedByModel: plan.generatedByModel || 'deepseek-v4-flash'
        }
      });
      // Ensure we unset the old full businessPlan if it exists to avoid DB duplication
      await VentureStateModel.updateOne({ projectId, userId }, { $unset: { businessPlan: "" } });
    }

    return res.json({ businessPlan: plan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4.5 Get Business Plans
app.get('/api/projects/:projectId/business-plans', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;

    if (!dbConnected) return res.status(503).json({ error: 'DB required' });

    const plans = await BusinessPlanModel.find({ projectId, userId }).sort({ version: -1 });
    return res.json({ businessPlans: plans });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Get Venture State
app.get('/api/projects/:projectId/state', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;

    if (!dbConnected) return res.status(503).json({ error: 'DB required' });

    const state = await VentureStateModel.findOne({ projectId, userId });
    if (!state) return res.status(404).json({ error: 'Venture state not found' });

    const stateObj = state.toObject();
    if (stateObj.latestBusinessPlan && stateObj.latestBusinessPlan.id) {
      const plan = await BusinessPlanModel.findOne({ id: stateObj.latestBusinessPlan.id, userId });
      if (plan) {
        stateObj.businessPlan = plan.toObject();
      }
    }

    return res.json(stateObj);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. AI Cofounder Context Endpoint
app.get('/api/projects/:projectId/context', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;

    if (!dbConnected) return res.status(503).json({ error: 'DB required' });

    const project = await ProjectModel.findOne({ id: projectId, userId });
    const founderProfile = await FounderProfileModel.findOne({ projectId, userId });
    const opportunities = await BusinessOpportunityModel.find({ projectId, userId });
    const selectedOpportunity = await SelectedOpportunityModel.findOne({ projectId, userId });
    const ventureState = await VentureStateModel.findOne({ projectId, userId });

    let ventureStateObj = null;
    if (ventureState) {
      ventureStateObj = ventureState.toObject();
      if (ventureStateObj.latestBusinessPlan && ventureStateObj.latestBusinessPlan.id) {
        const plan = await BusinessPlanModel.findOne({ id: ventureStateObj.latestBusinessPlan.id, userId });
        if (plan) {
          ventureStateObj.businessPlan = plan.toObject();
        }
      }
    }

    return res.json({
      project,
      founderProfile,
      opportunities,
      selectedOpportunity,
      ventureState: ventureStateObj
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Upload Document Pipeline
app.post('/api/projects/:projectId/documents/upload', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    const { fileName, fileType, storageUrl, fileSize } = req.body;

    if (!fileName || !fileType || !storageUrl) {
      return res.status(400).json({ error: 'Missing required file details (fileName, fileType, storageUrl)' });
    }

    if (!dbConnected) return res.status(503).json({ error: 'DB required' });

    const project = await ProjectModel.findOne({ id: projectId, userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const documentId = `doc_${Date.now()}`;
    const uploadedDoc = new UploadedDocumentModel({
      id: documentId,
      userId,
      projectId,
      fileName,
      fileType,
      fileSize: fileSize || 0,
      storageUrl,
      processingStatus: 'pending'
    });

    await uploadedDoc.save();

    // The actual triggering of the n8n webhook would happen here.
    // We wrap it in trackAgentRun to track it.
    // For now we don't have an agent method implemented in packages/agents, so we just mock it.
    await trackAgentRun(userId, projectId, 'document-processing', { documentId, storageUrl }, async () => {
      // Simulate n8n trigger
      console.log(`[Webhook] Triggering n8n processing for doc ${documentId}`);
      uploadedDoc.processingStatus = 'processing';
      await uploadedDoc.save();
      // Assume completed later...
    });

    return res.status(201).json({ document: uploadedDoc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List Projects
app.get('/api/projects', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (dbConnected) {
      const list = await ProjectModel.find({ userId }).sort({ createdAt: -1 });
      const formattedList = list.map(p => ({
        ...p.toObject(),
        id: p.id || p._id.toString()
      }));
      res.json(formattedList);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// AI Cofounder Chat Endpoint
app.post('/api/ai/chat', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId, message, conversationId } = req.body;
    const userId = (req as any).user.id;
    if (!projectId || !message) return res.status(400).json({ error: 'Missing projectId or message' });

    const state = await VentureStateModel.findOne({ projectId });
    let chatHistory: any[] = [];


    let activeConversationId = conversationId;
    let isNewConversation = false;

    if (activeConversationId) {
      const conversation = await ConversationModel.findOne({ id: activeConversationId });
      if (conversation) chatHistory = conversation.messages;
    } else {
      activeConversationId = `conv_${Date.now()}`;
      isNewConversation = true;
    }

    const userMessage = { id: `msg_user_${Date.now()}`, sender: 'user' as const, message, timestamp: new Date() };
    chatHistory.push(userMessage);

    // Fetch relevant context from Knowledge Base
    const ragResults = await queryRAG(message, 2);
    const ragContext = JSON.stringify(ragResults);

    const aiResponse = await runCofounderAgent(message, JSON.stringify(state), chatHistory, ragContext);

    // Attach RAG sources to AI response for UI transparency
    if (aiResponse) {
      aiResponse.ragSources = ragResults.map((r: any) => r.title);
    }

    chatHistory.push(aiResponse);

    if (dbConnected) {
      if (isNewConversation) {
        const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        await ConversationModel.create({
          id: activeConversationId,
          userId,
          projectId,
          title,
          messages: [userMessage, aiResponse]
        });

        // Enforce limit of 3
        const projectConversations = await ConversationModel.find({ projectId }).sort({ createdAt: -1 });
        if (projectConversations.length > 3) {
          const toDelete = projectConversations.slice(3);
          for (const conv of toDelete) {
            await ConversationModel.deleteOne({ id: conv.id });
          }
        }
      } else {
        await ConversationModel.findOneAndUpdate(
          { id: activeConversationId },
          { $push: { messages: { $each: [userMessage, aiResponse] } } }
        );
      }
    }

    return res.json({ userMessage, aiResponse, history: chatHistory, conversationId: activeConversationId });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Memory Retrieval Endpoint
app.get('/api/projects/:projectId/memory', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    const conversations = await ConversationModel.find({ projectId }).sort({ createdAt: -1 });
    return res.json({ conversations });
  } catch (error) {
    console.error('Memory retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});

// Clear Memory Endpoint
app.delete('/api/projects/:projectId/memory', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    await ConversationModel.findOneAndUpdate({ projectId }, { messages: [] });
    return res.json({ success: true });
  } catch (error) {
    console.error('Memory clear error:', error);
    res.status(500).json({ error: 'Failed to clear memory' });
  }
});

// Image Generation Endpoint (AI Studio)
app.post('/api/studio/generate-image', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const fireworksKey = process.env.FIREWORKS_API_KEY;
    if (!fireworksKey) {
      return res.status(500).json({ error: 'Fireworks API key not configured' });
    }

    const enhancedPrompt = `${prompt}, ${style} style, high quality, highly detailed`;
    const url = "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image";

    const imageRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fireworksKey}`,
        'Accept': 'image/jpeg'
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        aspect_ratio: "16:9"
      })
    });

    if (!imageRes.ok) {
      const errText = await imageRes.text();
      console.error('Fireworks image error:', errText);
      throw new Error('Image generation failed');
    }

    const buffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return res.json({ imageUrl: dataUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/ai/chat/:projectId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (dbConnected) {
      const conv = await ConversationModel.findOne({ projectId });
      res.json(conv?.messages || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// BRANDING ROUTES
// ==========================================

app.post('/api/branding/generate', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

    const selected = await SelectedOpportunityModel.findOne({ projectId, userId });
    const businessPlan = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });

    const brandData = await trackAgentRun(
      userId, projectId, 'branding', { projectId },
      () => runBrandingAgent(projectId, businessPlan?.toObject() || {}, selected?.toObject() || {}),
      'deepseek-v3'
    );

    // Versioning
    let version = 1;
    if (dbConnected) {
      const existingLatest = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });
      if (existingLatest) {
        version = (existingLatest.version || 1) + 1;
        existingLatest.isLatest = false;
        await existingLatest.save();
      }
    }

    const brand = new BrandIdentityModel({
      id: `brand_${Date.now()}`,
      userId, projectId,
      ...brandData,
      version,
      isLatest: true,
      generatedByModel: 'deepseek-v3',
      generatedAt: new Date()
    });

    if (dbConnected) {
      await brand.save();
      await updateVentureState(projectId, userId, { branding: brand.toObject() });
    }

    return res.json({ brandIdentity: brand });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:projectId/branding', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });
    const brand = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });
    if (!brand) return res.status(404).json({ error: 'Brand identity not found' });
    return res.json({ brandIdentity: brand });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MARKETING ROUTES
// ==========================================

app.post('/api/marketing/generate', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

    const brand = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });
    const businessPlan = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });

    const marketingData = await trackAgentRun(
      userId, projectId, 'marketing', { projectId },
      () => runMarketingAgent(projectId, brand?.toObject() || {}, businessPlan?.toObject() || {}),
      'deepseek-v3'
    );

    let version = 1;
    if (dbConnected) {
      const existingLatest = await MarketingCampaignModel.findOne({ projectId, userId, isLatest: true });
      if (existingLatest) {
        version = (existingLatest.version || 1) + 1;
        existingLatest.isLatest = false;
        await existingLatest.save();
      }
    }

    const marketing = new MarketingCampaignModel({
      id: `mkt_${Date.now()}`,
      userId, projectId,
      ...marketingData,
      version,
      isLatest: true,
      generatedByModel: 'deepseek-v3',
      generatedAt: new Date()
    });

    if (dbConnected) {
      await marketing.save();
      await updateVentureState(projectId, userId, { marketing: marketing.toObject() });
    }

    return res.json({ marketingCampaign: marketing });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:projectId/marketing', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });
    const marketing = await MarketingCampaignModel.findOne({ projectId, userId, isLatest: true });
    if (!marketing) return res.status(404).json({ error: 'Marketing campaign not found' });
    return res.json({ marketingCampaign: marketing });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PITCH ROUTES
// ==========================================

app.post('/api/pitch/generate', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

    const businessPlan = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });
    const brand = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });

    const pitchData = await trackAgentRun(
      userId, projectId, 'pitch', { projectId },
      () => runPitchAgent(projectId, businessPlan?.toObject() || {}, brand?.toObject() || {}),
      'deepseek-v3'
    );

    let version = 1;
    if (dbConnected) {
      const existingLatest = await PitchDeckModel.findOne({ projectId, userId, isLatest: true });
      if (existingLatest) {
        version = (existingLatest.version || 1) + 1;
        existingLatest.isLatest = false;
        await existingLatest.save();
      }
    }

    const pitch = new PitchDeckModel({
      id: `pitch_${Date.now()}`,
      userId, projectId,
      ...pitchData,
      version,
      isLatest: true,
      generatedByModel: 'deepseek-v3',
      generatedAt: new Date()
    });

    if (dbConnected) {
      await pitch.save();
      await updateVentureState(projectId, userId, { pitchDeck: pitch.toObject() });
    }

    return res.json({ pitchDeck: pitch });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:projectId/pitch', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });
    const pitch = await PitchDeckModel.findOne({ projectId, userId, isLatest: true });
    if (!pitch) return res.status(404).json({ error: 'Pitch deck not found' });
    return res.json({ pitchDeck: pitch });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Creator Engine backend running on http://localhost:${PORT}`);
});
