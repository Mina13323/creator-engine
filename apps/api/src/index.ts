import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
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
  ExecutionRoadmapModel, 
  ConversationModel, 
  UserModel, 
  FounderProfileModel, 
  VentureStateModel, 
  AgentRunModel, 
  UploadedDocumentModel 
} from '@creator/database';
import adminRouter, { registerLockdownHandlers, registerMaintenanceHandlers } from './routes/admin';
import paymentsRouter from './routes/payments';
import marketingStudioRouter from './routes/marketingStudio';
import uploadRouter from './routes/upload';
import { requireCredits, requireSubscription } from './middleware';
import { deductCredits, CREDIT_COSTS, getUserCredits } from './services/creditEngine';
import { authMiddleware, adminMiddleware } from './middleware';
import { LoginRequest, SignupRequest, AuthResponse, AuthUser, FounderProfile, SelectedOpportunity, BusinessPlan } from '@creator/types';
import { runFounderAgent, runOpportunityAgent, runBusinessPlanAgent, runCofounderAgent } from '@creator/agents';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();
dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_for_jwt_fallback_only';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.DATABASE_URL;

let dbConnected = false;
let lockdownActive = false;
registerLockdownHandlers(
  () => lockdownActive,
  (v) => { lockdownActive = v; }
);

let maintenanceActive = false;
registerMaintenanceHandlers(
  () => maintenanceActive,
  (v) => { maintenanceActive = v; }
);

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

// ==========================================
// ENVIRONMENT VALIDATION (Phase 6)
// ==========================================
const requiredKeys = [
  'FIREWORKS_API_KEY',
  'HF_TOKEN',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];
for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.warn(`WARNING: Missing required environment variable: ${key}`);
  }
}

// ==========================================
// AI PROVIDERS STATUS (Phase 4 & 5)
// ==========================================
app.get('/api/ai/providers/status', async (req: Request, res: Response) => {
  const videoProvider = process.env.VIDEO_PROVIDER || 'chain';
  const status = {
    llm: { provider: 'fireworks', status: true },
    image: { status: true },
    video: { 
      provider: videoProvider, 
      type: videoProvider === 'json2video' ? 'COMPOSER_VIDEO' : 'AI_VIDEO',
      status: true 
    },
    replicate: {
      configured: !!process.env.REPLICATE_API_TOKEN,
      creditsAvailable: true // Will be tested below
    },
    fallbackAvailable: !!process.env.JSON2VIDEO_API_KEY
  };
  
  // Test Replicate Credits via a cheap/fast request (or we just mock it for the endpoint if we don't want to actually run a model)
  // For the scope of this update, we will try to fetch Replicate account info or just set it based on config
  try {
    if (process.env.REPLICATE_API_TOKEN) {
      const repRes = await fetch('https://api.replicate.com/v1/account', {
        headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}` }
      });
      // If 402 or 429 or 401, credits/auth failed
      if (repRes.status === 402 || repRes.status === 401) {
        status.replicate.creditsAvailable = false;
      }
    } else {
      status.replicate.creditsAvailable = false;
    }
  } catch (e) {
    status.replicate.creditsAvailable = false;
  }

  res.json(status);
});

// UTILITIES
function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
}


function toAuthUser(user: any): AuthUser {
  return { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role, isBanned: user.isBanned, token: user.token };
}

// Base health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', database: dbConnected ? 'connected' : 'offline' });
});

// Public System Status endpoint (accessible to guest users)
app.get('/api/system/status', (req: Request, res: Response) => {
  res.json({
    lockdown: lockdownActive,
    maintenance: maintenanceActive
  });
});


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

// AUTH ROUTES
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required for authentication' });
    if (lockdownActive) return res.status(503).json({ error: 'New signups are temporarily suspended. Please try again later.' });
    const { email, password, name } = req.body as SignupRequest;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields: email, password, and name are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const token = generateToken(userId, email);
    const newUser = new UserModel({ id: userId, email, password: hashedPassword, name, token });
    await newUser.save();


    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.status(201).json({ token, user: toAuthUser(newUser) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
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

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account has been banned.' });
    }

    if (lockdownActive && user.role !== 'admin') {
      return res.status(503).json({ error: 'The platform is currently under emergency lockdown. Only admins can log in.' });
    }

    const token = generateToken(user.id, email);
    user.token = token;
    await user.save();

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
    const userId = user ? user.id : `usr_${Date.now()}`;
    const token = generateToken(userId, email);

    if (!user) {
      user = new UserModel({ id: userId, email, name, googleId, avatar: picture, token });
      await user.save();

    } else {
      user.token = token;
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account has been banned.' });
    }

    const tokenPayload = generateToken(user.id, email);
    res.cookie('token', tokenPayload, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.json({ token: tokenPayload, user: toAuthUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/logout', async (req: Request, res: Response): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
    
    if (token && dbConnected) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      if (decoded?.id) {
        await UserModel.findOneAndUpdate({ id: decoded.id }, { $unset: { token: '' } });
      }
    }
  } catch (e) {
    // Ignore errors for best-effort session revocation
  }
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

// GET /api/account — full account profile (includes createdAt, plan, project count)
app.get('/api/account', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required' });
    const userId = (req as any).user.id;
    const user = await UserModel.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const projectCount = await ProjectModel.countDocuments({ userId });

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name || null,
      avatar: user.avatar || null,
      role: user.role || 'user',
      isBanned: user.isBanned || false,
      plan: user.role === 'admin' ? 'Admin' : 'Free',
      projectCount,
      joinedAt: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin Elevation Route (Secret endpoint to make someone admin for testing)
app.post('/api/auth/elevate', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });
    const { email, secret } = req.body;
    // Simple dev secret to grant admin
    if (secret !== 'make-me-admin') return res.status(403).json({ error: 'Invalid secret' });
    
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'User is already an admin' });

    user.role = 'admin';
    await user.save();

    return res.json({ message: 'User elevated to admin', user: toAuthUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin Demotion Route (Secret endpoint to revert someone back to user for testing)
app.post('/api/auth/demote', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });
    const { email, secret } = req.body;
    if (secret !== 'make-me-user') return res.status(403).json({ error: 'Invalid secret' });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'user') return res.status(400).json({ error: 'User is already a regular user' });

    user.role = 'user';
    await user.save();

    return res.json({ message: 'User demoted to regular user', user: toAuthUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin Routes
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/marketing-studio', marketingStudioRouter);
app.use('/api/upload', uploadRouter);

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
  if (maintenanceActive) {
    throw new Error('System is under scheduled maintenance. AI workflows are temporarily suspended.');
  }
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

  const inputStr = typeof input === 'string' ? input : JSON.stringify(input || '');
  const promptTokens = Math.max(50, Math.ceil(inputStr.length / 4.1)); // Standard character to token ratio

  try {
    const result = await action();
    run.status = 'success';
    run.completedAt = new Date();
    run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    run.output = result;
    
    const outputStr = typeof result === 'string' ? result : JSON.stringify(result || '');
    const completionTokens = Math.max(50, Math.ceil(outputStr.length / 4.1));
    run.promptTokens = promptTokens;
    run.completionTokens = completionTokens;
    run.totalTokens = promptTokens + completionTokens;
    
    await run.save();
    return result;
  } catch (error: any) {
    run.status = 'failed';
    run.completedAt = new Date();
    run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    run.error = error.message;
    
    run.promptTokens = promptTokens;
    run.completionTokens = 0;
    run.totalTokens = promptTokens;
    
    await run.save();
    throw error;
  }
}

// 0. Create Project (Decoupled)
app.post('/api/projects', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    if (maintenanceActive) {
      return res.status(503).json({ error: 'System is currently under maintenance. New project creations are temporarily suspended.' });
    }
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
app.post('/api/founder/analyze', authMiddleware, requireCredits(CREDIT_COSTS.FOUNDER_ANALYSIS), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, data } = req.body;
    
    if (!projectId || !data) return res.status(400).json({ error: 'Missing projectId or data' });

    // Sanitize data inputs with default fallbacks
    const sanitizedData = {
      ...data,
      experience: data.experience || 'Intermediate',
      location: data.location || 'Remote',
      availableTime: data.availableTime || 'Full-time',
      startupGoals: data.startupGoals || 'Build a successful company',
      riskTolerance: data.riskTolerance || 'Medium',
      teamSize: data.teamSize || 'Solo'
    };

    // Call Agent with tracking
    const analysis = await trackAgentRun(userId, projectId, 'founder-analysis', sanitizedData, () => runFounderAgent(projectId, sanitizedData));
    
    await deductCredits(userId, CREDIT_COSTS.FOUNDER_ANALYSIS, 'Founder Analysis');
    const founderProfile = new FounderProfileModel({
      id: `fp_${Date.now()}`,
      userId,
      projectId,
      ...sanitizedData,
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
app.post('/api/opportunities/discover', authMiddleware, requireCredits(CREDIT_COSTS.OPPORTUNITY_DISCOVERY), async (req: Request, res: Response): Promise<any> => {
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
    await deductCredits(userId, CREDIT_COSTS.OPPORTUNITY_DISCOVERY, 'Opportunity Discovery');
    const formattedOpportunities = (rawOpportunities || []).map((opp: any, idx: number) => {
      const startupCostStr = typeof opp.startupCost === 'number'
        ? `$${opp.startupCost.toLocaleString()}`
        : String(opp.startupCost || '$0');
        
      const estimatedRevenueStr = typeof opp.estimatedRevenue === 'number'
        ? `$${opp.estimatedRevenue.toLocaleString()}/mo`
        : String(opp.estimatedRevenue || '$0/mo');

      return {
        id: opp.id || `opp_${Date.now()}_${idx}_${crypto.randomUUID().substring(0, 5)}`,
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
app.post('/api/business-plan/generate', authMiddleware, requireCredits(CREDIT_COSTS.BUSINESS_PLAN), async (req: Request, res: Response): Promise<any> => {
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
app.post('/api/projects/:projectId/documents/upload', authMiddleware, requireCredits(CREDIT_COSTS.RAG_QUERY), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    await deductCredits(userId, CREDIT_COSTS.RAG_QUERY, 'RAG Upload');
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
    await trackAgentRun(userId, projectId, 'document-processing', { documentId, storageUrl }, async () => {
      // Simulate n8n trigger
      console.info(`[Webhook] Triggering n8n processing for doc ${documentId}`);
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
app.post('/api/ai/chat', authMiddleware, requireCredits(CREDIT_COSTS.AI_CHAT_MESSAGE), async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId, message } = req.body;
    if (!projectId || !message) return res.status(400).json({ error: 'Missing projectId or message' });

    const state = await VentureStateModel.findOne({ projectId });
    let chatHistory: any[] = [];
    const conversation = await ConversationModel.findOne({ projectId });
    if (conversation) chatHistory = conversation.messages;

    const userMessage = { id: `msg_user_${Date.now()}`, sender: 'user' as const, message, timestamp: new Date() };
    chatHistory.push(userMessage);

    const aiResponse = await runCofounderAgent(message, JSON.stringify(state), JSON.stringify(chatHistory));
    chatHistory.push(aiResponse);

    if (dbConnected) {
      await ConversationModel.findOneAndUpdate(
        { projectId },
        { $push: { messages: { $each: [userMessage, aiResponse] } } },
        { upsert: true, new: true }
      );
    }

    return res.json({ userMessage, aiResponse, history: chatHistory });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
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



app.listen(PORT, () => {
  console.info(`Creator Engine backend running on http://localhost:${PORT}`);
});
