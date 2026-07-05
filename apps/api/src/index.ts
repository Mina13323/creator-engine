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
  PitchDeckModel,
  ExecutionRoadmapModel, 
  ConversationModel, 
  UserModel, 
  FounderProfileModel, 
  VentureStateModel, 
  AgentRunModel, 
  AIEvaluationModel,
  UploadedDocumentModel,
  FinancialForecast,
  buildContextString,
  getProjectContext
} from '@creator/database';
import adminRouter, { registerLockdownHandlers, registerMaintenanceHandlers } from './routes/admin';
import paymentsRouter from './routes/payments';
import marketingStudioRouter from './routes/marketingStudio';
import uploadRouter from './routes/upload';
import executionRouter from './routes/execution';
import { requireCredits, requireSubscription } from './middleware';
import { deductCredits, CREDIT_COSTS, getUserCredits, provisionUserMonetization } from './services/creditEngine';
import { authMiddleware, adminMiddleware } from './middleware';
import { LoginRequest, SignupRequest, AuthResponse, AuthUser, FounderProfile, SelectedOpportunity, BusinessPlan } from '@creator/types';
import { runFounderAgent, runOpportunityAgent, runBusinessPlanAgent, runCofounderAgent, runFinancialAgent, runBrandingAgent, runMarketingAgent, runPitchAgent, runEvaluatorAgent } from '@creator/agents';
import { processAndIngestDocument } from '@creator/rag-core';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import helmet from 'helmet';
import { authRateLimiter, generalRateLimiter, aiRateLimiter } from './rateLimit';
import { env } from './env';
import { errorHandler } from './errorHandler';
import { validateRequest } from './validate';
import {
  aiChatSchema,
  analyzeFounderSchema,
  checkEmailSchema,
  createProjectSchema,
  discoverOpportunitySchema,
  financialAgentResponseSchema,
  generateBusinessPlanSchema,
  generateBrandingSchema,
  generateFinancialSchema,
  generateMarketingSchema,
  generatePitchSchema,
  googleAuthSchema,
  loginSchema,
  brandingAgentResponseSchema,
  marketingAgentResponseSchema,
  pitchAgentResponseSchema,
  selectOpportunitySchema,
  signupSchema,
  uploadDocumentSchema
} from './schemas';

dotenv.config();
dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const app = express();
app.use(helmet());

const allowedOrigins = env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: true
}));

app.use(generalRateLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const PORT = env.PORT;
const MONGO_URL = env.DATABASE_URL;

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

connectDB(MONGO_URL)
  .then(() => {
    dbConnected = true;
  })
  .catch((err) => {
    console.error('MongoDB connection failed. API requires DB.', err);
    if (env.NODE_ENV === 'production') process.exit(1);
  });

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
  
  // Probe Replicate account availability without running a model.
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
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, { expiresIn: '7d' });
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

app.get('/api/system/health', async (req: Request, res: Response): Promise<any> => {
  const databaseOnline = dbConnected && ProjectModel.db.readyState === 1;
  const hasFireworks = Boolean(process.env.FIREWORKS_API_KEY);
  const hasCloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  const hasPaymob = Boolean(
    process.env.PAYMOB_API_KEY &&
    process.env.PAYMOB_HMAC &&
    process.env.PAYMOB_INTEGRATION_ID &&
    process.env.PAYMOB_IFRAME_ID
  );

  return res.status(databaseOnline ? 200 : 503).json({
    database: databaseOnline ? 'online' : 'offline',
    ai: {
      fireworks: hasFireworks,
      embeddings: hasFireworks
    },
    storage: {
      cloudinary: hasCloudinary
    },
    payments: {
      paymob: hasPaymob
    }
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
app.post('/api/auth/signup', authRateLimiter, validateRequest(signupSchema), async (req: Request, res: Response): Promise<any> => {
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
    await provisionUserMonetization(userId);


    res.cookie('token', token, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.status(201).json({ token, user: toAuthUser(newUser) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/auth/login', authRateLimiter, validateRequest(loginSchema), async (req: Request, res: Response): Promise<any> => {
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

    res.cookie('token', token, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.json({ token, user: toAuthUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/google', authRateLimiter, validateRequest(googleAuthSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'Database connection required' });
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) return res.status(401).json({ error: 'Invalid Google token' });

    const { email, name, sub: googleId, picture } = payload;
    let user = await UserModel.findOne({ email });
    const userId = user ? user.id : `usr_${Date.now()}`;
    const token = generateToken(userId, email);

    if (!user) {
      user = new UserModel({ id: userId, email, name, googleId, avatar: picture, token });
      await user.save();
      await provisionUserMonetization(userId);

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
    res.cookie('token', tokenPayload, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
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
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
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

app.post('/api/auth/check-email', authRateLimiter, validateRequest(checkEmailSchema), async (req: Request, res: Response): Promise<any> => {
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

// Admin Routes
app.use('/api/portal', adminRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/marketing-studio', aiRateLimiter, marketingStudioRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/execution', executionRouter);

// ==========================================
// BUSINESS PLAN ENGINE ROUTES
// ==========================================

// Helper to update Venture State
async function updateVentureState(projectId: string, userId: string, update: Partial<any>) {
  if (!dbConnected) return;
  await VentureStateModel.findOneAndUpdate(
    { projectId },
    {
      $set: { ...update, lastUpdated: new Date() },
      $setOnInsert: { id: `vs_${Date.now()}`, projectId, userId }
    },
    { upsert: true, new: true }
  );
}


// AI Evaluation Helper
async function evaluateAndSave(
  userId: string,
  projectId: string,
  targetType: 'founder_profile' | 'opportunity' | 'business_plan' | 'financial_plan' | 'branding' | 'marketing' | 'pitch',
  targetId: string,
  input: unknown,
  generatedOutput: unknown
) {
  if (!dbConnected) return null;
  try {
    const context = await getProjectContext(projectId, userId);
    const { buildEgyptContextString } = await import('@creator/agents');
    const egyptCtx = await buildEgyptContextString(JSON.stringify(input));
    
    const evaluation = await runEvaluatorAgent({
      ventureContext: context,
      egyptMarketContext: egyptCtx,
      generatedOutput,
      targetType
    });
    
    if (evaluation) {
      evaluation.id = `eval_${Date.now()}`;
      evaluation.userId = userId;
      evaluation.projectId = projectId;
      evaluation.targetType = targetType;
      evaluation.targetId = targetId;
      
      const evalDoc = new AIEvaluationModel(evaluation);
      await evalDoc.save();
      return evalDoc.toObject();
    }
  } catch(e) {
    console.error('Evaluation failed:', e);
  }
  return null;
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

function getLatestBusinessPlanFromState(context: any) {
  return context.businessPlan || context.ventureState?.businessPlan || null;
}

function getBusinessIdeaFromContext(context: any, explicitIdea?: string) {
  if (explicitIdea) return explicitIdea;
  if (context.selectedOpportunity) {
    return `${context.selectedOpportunity.title}: ${context.selectedOpportunity.description}`;
  }
  if (context.project?.name) return context.project.name;
  return '';
}

function getBusinessModelFromContext(context: any, explicitModel?: string) {
  if (explicitModel) return explicitModel;
  const planModel = context.businessPlan?.businessModel;
  if (typeof planModel === 'string') return planModel;
  if (planModel?.pricingStrategy) return planModel.pricingStrategy;
  if (planModel?.revenueStreams?.length) return planModel.revenueStreams.join(', ');
  return 'SaaS';
}

async function loadOwnedProjectContext(projectId: string, userId: string) {
  if (!dbConnected) throw new Error('Database connection required');
  const context = await getProjectContext(projectId, userId);
  if (!context.project) {
    const error: any = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  return context;
}

// 0. Create Project (Decoupled)
app.post('/api/projects', authMiddleware, validateRequest(createProjectSchema), async (req: Request, res: Response): Promise<any> => {
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
app.post('/api/founder/analyze', authMiddleware, aiRateLimiter, validateRequest(analyzeFounderSchema), requireCredits(CREDIT_COSTS.FOUNDER_ANALYSIS), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, data } = req.body;
    
    if (!projectId || !data) return res.status(400).json({ error: 'Missing projectId or data' });
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });

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
    
    const founderProfile = new FounderProfileModel({
      id: `fp_${Date.now()}`,
      userId,
      projectId,
      ...sanitizedData,
      ...(analysis || {})
    });
    
    await founderProfile.save();
    await updateVentureState(projectId, userId, { founderProfile: founderProfile.toObject() });
    await deductCredits(userId, CREDIT_COSTS.FOUNDER_ANALYSIS, 'Founder Analysis');

    const evaluation = await evaluateAndSave(userId, projectId, 'founder_profile', founderProfile.id, sanitizedData, founderProfile.toObject());
    return res.status(201).json({ founderProfile, evaluation });
  } catch (err: any) {
    console.error('Founder analysis error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. Opportunity Discovery
app.post('/api/opportunities/discover', authMiddleware, aiRateLimiter, validateRequest(discoverOpportunitySchema), requireCredits(CREDIT_COSTS.OPPORTUNITY_DISCOVERY), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });

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

    // Clear previous opportunities for the project to prevent duplicates on regeneration
    await BusinessOpportunityModel.deleteMany({ projectId, userId });
    
    if (formattedOpportunities.length > 0) {
      await BusinessOpportunityModel.insertMany(formattedOpportunities);
    }
    await deductCredits(userId, CREDIT_COSTS.OPPORTUNITY_DISCOVERY, 'Opportunity Discovery');

    const evaluation = await evaluateAndSave(userId, projectId, 'opportunity', formattedOpportunities[0]?.id, founderProfile.toObject(), formattedOpportunities);
    return res.json({ opportunities: formattedOpportunities, evaluation });
  } catch (err: any) {
    console.error('Opportunity discovery error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. Select Opportunity
app.post('/api/opportunities/select', authMiddleware, validateRequest(selectOpportunitySchema), async (req: Request, res: Response): Promise<any> => {
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
        const selectedPayload = {
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
        };

        if (dbConnected) {
          const newSelected = await SelectedOpportunityModel.findOneAndUpdate(
            { projectId },
            { $set: selectedPayload },
            { upsert: true, new: true }
          );
          // Save selectedOpportunityId on Project document (instead of renaming project)
          await ProjectModel.findOneAndUpdate({ id: projectId, userId }, { selectedOpportunityId: opportunityId });
          await updateVentureState(projectId, userId, { selectedOpportunity: newSelected.toObject() });
          return newSelected;
        }

        return selectedPayload;
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
app.post('/api/business-plan/generate', authMiddleware, aiRateLimiter, validateRequest(generateBusinessPlanSchema), requireCredits(CREDIT_COSTS.BUSINESS_PLAN), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!dbConnected) return res.status(503).json({ error: 'DB required' });
    
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
      () => runBusinessPlanAgent(projectId, selected.toObject(), founderProfile.toObject(), '', locale || 'en'),
      'deepseek-v4-flash'
    );

    let version = 1;
    const existingLatest = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });
    if (existingLatest) {
      version = (existingLatest.version || 1) + 1;
      existingLatest.isLatest = false;
      await existingLatest.save();
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
    await deductCredits(userId, CREDIT_COSTS.BUSINESS_PLAN, 'Business Plan');

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
    
    // Attach discovered opportunities to state
    const ops = await BusinessOpportunityModel.find({ projectId, userId }).lean();
    if (ops && ops.length > 0) {
      stateObj.opportunities = ops;
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
app.post('/api/projects/:projectId/documents/upload', authMiddleware, validateRequest(uploadDocumentSchema), requireCredits(CREDIT_COSTS.RAG_QUERY), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    const { fileName, fileType, storageUrl, fileSize, fileBase64 } = req.body;
    
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

    await trackAgentRun(userId, projectId, 'document-processing', { documentId, storageUrl }, async () => {
      uploadedDoc.processingStatus = 'processing';
      await uploadedDoc.save();

      if (!fileBase64) {
        throw new Error('Document bytes are required for ingestion');
      }

      const fileBuffer = Buffer.from(fileBase64, 'base64');
      await processAndIngestDocument(fileBuffer, fileName, fileType, userId, projectId, documentId);
    });
    await deductCredits(userId, CREDIT_COSTS.RAG_QUERY, 'RAG Upload');

    const processedDoc = await UploadedDocumentModel.findOne({ id: documentId });
    return res.status(201).json({ document: processedDoc || uploadedDoc });
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
app.post('/api/ai/chat', authMiddleware, aiRateLimiter, validateRequest(aiChatSchema), requireCredits(CREDIT_COSTS.AI_CHAT_MESSAGE), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, message } = req.body;
    if (!projectId || !message) return res.status(400).json({ error: 'Missing projectId or message' });

    const context = await loadOwnedProjectContext(projectId, userId);
    const state = await VentureStateModel.findOne({ projectId, userId });
    let chatHistory: any[] = [];
    const conversation = await ConversationModel.findOne({ projectId, userId });
    if (conversation) chatHistory = conversation.messages;

    const userMessage = { id: `msg_user_${Date.now()}`, sender: 'user' as const, message, timestamp: new Date() };
    chatHistory.push(userMessage);

    const aiResponse = await runCofounderAgent(message, state?.toObject() || context.project, `${buildContextString(context)}\nConversation:\n${JSON.stringify(chatHistory)}`);
    if (!aiResponse) return res.status(502).json({ error: 'AI consultant failed to produce a response' });
    chatHistory.push(aiResponse);

    if (dbConnected) {
      await ConversationModel.findOneAndUpdate(
        { projectId },
        {
          $setOnInsert: { id: `conv_${Date.now()}`, projectId, userId },
          $push: { messages: { $each: [userMessage, aiResponse] } }
        },
        { upsert: true, new: true }
      );
    }
    await deductCredits(userId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'AI Chat Message');

    return res.json({ userMessage, aiResponse, history: chatHistory });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/ai/chat/:projectId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    if (dbConnected) {
      const conv = await ConversationModel.findOne({ projectId, userId });
      res.json(conv?.messages || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


async function generateFinancialHandler(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).user.id;
    const { projectId, businessIdea, businessModel, currency = 'EGP' } = req.body;
    const context = await loadOwnedProjectContext(projectId, userId);
    const contextStr = buildContextString(context);
    const resolvedIdea = getBusinessIdeaFromContext(context, businessIdea);
    const resolvedModel = getBusinessModelFromContext(context, businessModel);

    if (!resolvedIdea) {
      return res.status(400).json({ error: 'A business idea or selected opportunity is required' });
    }

    const rawFinancial = await trackAgentRun(
      userId,
      projectId,
      'financial',
      { businessIdea: resolvedIdea, businessModel: resolvedModel, context },
      () => runFinancialAgent(projectId, resolvedIdea, resolvedModel, contextStr),
      'deepseek-v4-flash'
    );

    if (!rawFinancial) {
      return res.status(502).json({ error: 'Financial agent failed to produce a response' });
    }

    const parsedFinancial = financialAgentResponseSchema.parse(rawFinancial);

    const startupCosts = parsedFinancial.financial.startupCosts;
    const monthlyCosts = parsedFinancial.financial.monthlyCosts;
    const forecast = await FinancialForecast.findOneAndUpdate(
      { projectId },
      {
        userId,
        projectId,
        startupCosts,
        totalStartupCost: startupCosts.reduce((sum, item) => sum + item.amount, 0),
        monthlyCosts,
        totalMonthlyCost: monthlyCosts.reduce((sum, item) => sum + item.amount, 0),
        revenueProjections: parsedFinancial.financial.revenueProjections,
        breakEvenMonth: parsedFinancial.financial.breakEvenMonth,
        currency,
        assumptionsApplied: parsedFinancial.financial.assumptionsApplied
      },
      { upsert: true, new: true, runValidators: true }
    );

    await updateVentureState(projectId, userId, { financialForecast: forecast.toObject() });
    await deductCredits(userId, CREDIT_COSTS.FINANCIAL_ENGINE, 'Financial Engine');
    return res.status(201).json({ financialForecast: forecast, pricing: parsedFinancial.pricing || null });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    if (err.message === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' });
    return res.status(500).json({ error: err.message });
  }
}

async function generateBrandingHandler(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    const context = await loadOwnedProjectContext(projectId, userId);
    const selectedOpportunity = context.selectedOpportunity;
    const businessPlan = getLatestBusinessPlanFromState(context);

    if (!selectedOpportunity) {
      return res.status(400).json({ error: 'A selected opportunity is required before branding generation' });
    }
    if (!businessPlan) {
      return res.status(400).json({ error: 'A business plan is required before branding generation' });
    }

    const rawBranding = await trackAgentRun(
      userId,
      projectId,
      'branding',
      { selectedOpportunity, businessPlan, context },
      () => runBrandingAgent(projectId, selectedOpportunity, businessPlan, buildContextString(context)),
      'deepseek-v4-flash'
    );

    if (!rawBranding) {
      return res.status(502).json({ error: 'Branding agent failed to produce a response' });
    }

    const parsedBranding = brandingAgentResponseSchema.parse(rawBranding);

    const latest = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });
    const version = latest ? (latest.version || 1) + 1 : 1;
    await BrandIdentityModel.updateMany({ projectId, userId, isLatest: true }, { $set: { isLatest: false } });

    const brandIdentity = new BrandIdentityModel({
      id: `brand_${Date.now()}`,
      userId,
      projectId,
      ...parsedBranding,
      generatedByModel: 'deepseek-v4-flash',
      generatedAt: new Date(),
      version,
      isLatest: true
    });
    await brandIdentity.save();
    await updateVentureState(projectId, userId, { branding: brandIdentity.toObject() });
    await deductCredits(userId, CREDIT_COSTS.BRANDING, 'Branding');

    const evaluation = await evaluateAndSave(userId, projectId, 'branding', brandIdentity.id, businessPlan, brandIdentity.toObject());
    return res.status(201).json({ brandIdentity, evaluation });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    if (err.message === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' });
    return res.status(500).json({ error: err.message });
  }
}

async function generateMarketingHandler(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    const context = await loadOwnedProjectContext(projectId, userId);
    const businessPlan = getLatestBusinessPlanFromState(context);
    const brandIdentity = context.branding;

    if (!businessPlan) {
      return res.status(400).json({ error: 'A business plan is required before marketing generation' });
    }
    if (!brandIdentity) {
      return res.status(400).json({ error: 'A brand identity is required before marketing generation' });
    }

    const rawMarketing = await trackAgentRun(
      userId,
      projectId,
      'marketing',
      { brandIdentity, businessPlan, context },
      () => runMarketingAgent(projectId, brandIdentity, businessPlan, buildContextString(context)),
      'deepseek-v4-flash'
    );

    if (!rawMarketing) {
      return res.status(502).json({ error: 'Marketing agent failed to produce a response' });
    }

    const parsedMarketing = marketingAgentResponseSchema.parse(rawMarketing);

    const latest = await MarketingCampaignModel.findOne({ projectId, userId, isLatest: true });
    const version = latest ? (latest.version || 1) + 1 : 1;
    await MarketingCampaignModel.updateMany({ projectId, userId, isLatest: true }, { $set: { isLatest: false } });

    const marketingCampaign = new MarketingCampaignModel({
      id: `mkt_${Date.now()}`,
      userId,
      projectId,
      ...parsedMarketing,
      generatedByModel: 'deepseek-v4-flash',
      generatedAt: new Date(),
      version,
      isLatest: true
    });
    await marketingCampaign.save();
    await updateVentureState(projectId, userId, { marketing: marketingCampaign.toObject() });
    await deductCredits(userId, CREDIT_COSTS.MARKETING, 'Marketing');

    const evaluation = await evaluateAndSave(userId, projectId, 'marketing', marketingCampaign.id, businessPlan, marketingCampaign.toObject());
    return res.status(201).json({ marketingCampaign, evaluation });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    if (err.message === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' });
    return res.status(500).json({ error: err.message });
  }
}

async function generatePitchHandler(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    const context = await loadOwnedProjectContext(projectId, userId);
    const businessPlan = getLatestBusinessPlanFromState(context);
    const brandIdentity = context.branding;

    if (!businessPlan) {
      return res.status(400).json({ error: 'A business plan is required before pitch deck generation' });
    }
    if (!brandIdentity) {
      return res.status(400).json({ error: 'A brand identity is required before pitch deck generation' });
    }

    const rawPitch = await trackAgentRun(
      userId,
      projectId,
      'pitch',
      { businessPlan, brandIdentity, context },
      () => runPitchAgent(projectId, businessPlan, brandIdentity, buildContextString(context)),
      'deepseek-v4-flash'
    );

    if (!rawPitch) {
      return res.status(502).json({ error: 'Pitch agent failed to produce a response' });
    }

    const parsedPitch = pitchAgentResponseSchema.parse(rawPitch);

    const latest = await PitchDeckModel.findOne({ projectId, userId, isLatest: true });
    const version = latest ? (latest.version || 1) + 1 : 1;
    await PitchDeckModel.updateMany({ projectId, userId, isLatest: true }, { $set: { isLatest: false } });

    const pitchDeck = new PitchDeckModel({
      id: `pitch_${Date.now()}`,
      userId,
      projectId,
      ...parsedPitch,
      generatedByModel: 'deepseek-v4-flash',
      generatedAt: new Date(),
      version,
      isLatest: true
    });
    await pitchDeck.save();
    await updateVentureState(projectId, userId, { pitchDeck: pitchDeck.toObject() });
    await deductCredits(userId, CREDIT_COSTS.PITCH_DECK, 'Pitch Deck');

    const evaluation = await evaluateAndSave(userId, projectId, 'pitch', pitchDeck.id, businessPlan, pitchDeck.toObject());
    return res.status(201).json({ pitchDeck, evaluation });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    if (err.message === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' });
    return res.status(500).json({ error: err.message });
  }
}

app.post(
  ['/api/financial/generate', '/api/financial-engine/generate'],
  authMiddleware,
  aiRateLimiter,
  validateRequest(generateFinancialSchema),
  requireCredits(CREDIT_COSTS.FINANCIAL_ENGINE),
  generateFinancialHandler
);

app.post(
  '/api/branding/generate',
  authMiddleware,
  aiRateLimiter,
  validateRequest(generateBrandingSchema),
  requireCredits(CREDIT_COSTS.BRANDING),
  generateBrandingHandler
);

app.post(
  '/api/marketing/generate',
  authMiddleware,
  aiRateLimiter,
  validateRequest(generateMarketingSchema),
  requireCredits(CREDIT_COSTS.MARKETING),
  generateMarketingHandler
);

app.post(
  '/api/pitch/generate',
  authMiddleware,
  aiRateLimiter,
  validateRequest(generatePitchSchema),
  requireCredits(CREDIT_COSTS.PITCH_DECK),
  generatePitchHandler
);



if (require.main === module) {
  app.listen(PORT, () => {
    console.info(`Creator Engine backend running on http://localhost:${PORT}`);
  });
}

app.use(errorHandler);

export { app };
