import 'express-async-errors';
import { env } from './env';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

import express, { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from './errorHandler';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { processAndIngestDocument } from '@creator/rag-core';
import helmet from 'helmet';
console.log('[API] Loaded Fireworks Key:', env.FIREWORKS_API_KEY ? 'YES' : 'NO');
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
  UploadedDocumentModel,
  FinancialForecast,
  PricingStrategy,
  KnowledgeDocumentModel,
  getProjectContext,
  buildContextString
} from '@creator/database';
import { LoginRequest, SignupRequest, AuthResponse, AuthUser, FounderProfile, SelectedOpportunity, BusinessPlan, PitchDeck } from '@creator/types';
import { queryRAG } from '@creator/rag-core';
import { runFounderAgent, runOpportunityAgent, runBusinessPlanAgent, runCofounderAgent, runBrandingAgent, runMarketingAgent, runPitchAgent, callFireworksImage, runFinancialAgent } from '@creator/agents';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { generalRateLimiter, authRateLimiter, aiRateLimiter } from './rateLimit';
import { validateRequest } from './validate';
import {
  signupSchema, loginSchema, googleAuthSchema, checkEmailSchema,
  createProjectSchema, projectIdParamSchema, analyzeFounderSchema,
  discoverOpportunitySchema, selectOpportunitySchema,
  generateBusinessPlanSchema, uploadDocumentSchema, aiChatSchema, generateImageSchema
} from './schemas';

const JWT_SECRET = env.JWT_SECRET;
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const app = express();

if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use(helmet());
app.set('trust proxy', 1); // Support reverse proxies

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting policies
app.use('/api', generalRateLimiter);
app.use('/api/auth', authRateLimiter);
app.use('/api/founder/analyze', aiRateLimiter);
app.use('/api/opportunities/discover', aiRateLimiter);
app.use('/api/business-plan/generate', aiRateLimiter);
app.use('/api/ai', aiRateLimiter);
app.use('/api/studio', aiRateLimiter);

// Internal routes (not prefixed with /api, exempt from general rate limit but protected by local network conceptually)
app.post('/internal/alerts', (req: Request, res: Response) => {
  const { workflowName, errorMsg } = req.body;
  if (env.SENTRY_DSN && Sentry) {
    Sentry.captureMessage(`[n8n Failure] ${workflowName}: ${errorMsg}`, {
      level: 'error',
      tags: { source: 'n8n_webhook', workflow: workflowName }
    });
  }
  console.error(`[n8n Alert] Workflow: ${workflowName} | Error: ${errorMsg}`);
  res.status(200).json({ success: true, message: 'Alert ingested' });
});

const PORT = env.PORT;
const MONGO_URL = env.MONGODB_URI;

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
    if (!token) throw new AppError('Unauthorized: No token provided', 401, 'UNAUTHORIZED');

    const decoded = verifyToken(token);
    (req as any).user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    throw new AppError('Unauthorized: Invalid token', 401, 'UNAUTHORIZED');
  }
};

// Base health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', database: dbConnected ? 'connected' : 'offline' });
});

// AUTH ROUTES
app.post('/api/auth/signup', validateRequest(signupSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) throw new AppError('Database connection required for authentication', 503, 'SERVICE_UNAVAILABLE');
    const { email, password, name } = req.body as SignupRequest;
    if (!email || !password || !name) throw new AppError('Missing fields: email, password, and name are required', 400, 'BAD_REQUEST');
    if (password.length < 6) throw new AppError('Password must be at least 6 characters', 400, 'BAD_REQUEST');

    const existing = await UserModel.findOne({ email });
    if (existing) throw new AppError('Email already in use', 400, 'BAD_REQUEST');

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const newUser = new UserModel({ id: userId, email, password: hashedPassword, name });
    await newUser.save();

    const token = generateToken(newUser.id, email);
    res.cookie('token', token, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.status(201).json({ token, user: toAuthUser(newUser) });
  } catch (error) {
    throw error;
  }
});

app.post('/api/auth/register', validateRequest(signupSchema), async (req: Request, res: Response): Promise<any> => {
  // Alias
  return app._router.handle(req, res, () => { });
});

app.post('/api/auth/login', validateRequest(loginSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) throw new AppError('Database connection required for authentication', 503, 'SERVICE_UNAVAILABLE');
    const { email, password } = req.body as LoginRequest;
    if (!email || !password) throw new AppError('Missing fields: email and password are required', 400, 'BAD_REQUEST');

    const user = await UserModel.findOne({ email });
    if (!user || !user.password) throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');

    const token = generateToken(user.id, email);
    res.cookie('token', token, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.json({ token, user: toAuthUser(user) });
  } catch (error) {
    throw error;
  }
});

app.post('/api/auth/google', validateRequest(googleAuthSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) throw new AppError('Database connection required', 503, 'SERVICE_UNAVAILABLE');
    const { credential } = req.body;
    if (!credential) throw new AppError('Missing Google credential', 400, 'BAD_REQUEST');

    let payload: any = null;
    try {
      if (env.GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
      } else {
        payload = jwt.decode(credential);
      }
    } catch (e) {
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) throw new AppError('Invalid Google token', 401, 'UNAUTHORIZED');

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
    res.cookie('token', token, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
    return res.json({ token, user: toAuthUser(user) });
  } catch (error) {
    throw error;
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/check-email', validateRequest(checkEmailSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) throw new AppError('Database connection required', 503, 'SERVICE_UNAVAILABLE');
    const { email } = req.body;
    if (!email) throw new AppError('Missing email', 400, 'BAD_REQUEST');
    const user = await UserModel.findOne({ email });
    return res.json({ exists: !!user });
  } catch (error) {
    throw error;
  }
});

app.get('/api/auth/me', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    if (!dbConnected) throw new AppError('Database connection required', 503, 'SERVICE_UNAVAILABLE');
    const userId = (req as any).user.id;
    const user = await UserModel.findOne({ id: userId });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return res.json({ user: toAuthUser(user) });
  } catch (error) {
    throw error;
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
    aiModel: aiModel || 'deepseek-v4-flash',
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
app.post('/api/projects', authMiddleware, validateRequest(createProjectSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { name } = req.body;

    if (!name) throw new AppError('Missing project name', 400, 'BAD_REQUEST');

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
    throw err;
  }
});

// 1. Founder Analysis
app.post('/api/founder/analyze', authMiddleware, validateRequest(analyzeFounderSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, data } = req.body;

    if (!projectId || !data) throw new AppError('Missing projectId or data', 400, 'BAD_REQUEST');

    const projectContext = await getProjectContext(projectId, userId);
    const contextStr = buildContextString(projectContext);

    // Call Agent with tracking
    const analysis = await trackAgentRun(userId, projectId, 'founder-analysis', data, () => runFounderAgent(projectId, data, contextStr));

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
    throw err;
  }
});

// 2. Opportunity Discovery
app.post('/api/opportunities/discover', authMiddleware, validateRequest(discoverOpportunitySchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) throw new AppError('Missing projectId', 400, 'BAD_REQUEST');

    const founderProfile = await FounderProfileModel.findOne({ projectId, userId });
    if (!founderProfile) throw new AppError('Founder profile not found', 404, 'NOT_FOUND');

    const projectContext = await getProjectContext(projectId, userId);
    const contextStr = buildContextString(projectContext);

    // Call Agent with tracking (Model: deepseek-v4-flash)
    const rawOpportunities = await trackAgentRun(
      userId,
      projectId,
      'opportunity-discovery',
      founderProfile.toObject(),
      () => runOpportunityAgent(projectId, founderProfile.toObject(), contextStr),
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
    throw err;
  }
});

// 3. Select Opportunity
app.post('/api/opportunities/select', authMiddleware, validateRequest(selectOpportunitySchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, opportunityId } = req.body;
    if (!projectId || !opportunityId) throw new AppError('Missing projectId or opportunityId', 400, 'BAD_REQUEST');

    const project = await ProjectModel.findOne({ id: projectId, userId });
    if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

    const opportunity = await BusinessOpportunityModel.findOne({ id: opportunityId, projectId });
    if (!opportunity) throw new AppError('Opportunity not found', 404, 'NOT_FOUND');

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
    throw err;
  }
});

// 4. Generate Business Plan
app.post('/api/business-plan/generate', authMiddleware, validateRequest(generateBusinessPlanSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;

    const selected = await SelectedOpportunityModel.findOne({ projectId, userId });
    if (!selected) throw new AppError('No opportunity selected for this project', 400, 'BAD_REQUEST');

    const founderProfile = await FounderProfileModel.findOne({ projectId, userId });
    if (!founderProfile) throw new AppError('Founder profile not found for this project', 400, 'BAD_REQUEST');

    const projectContext = await getProjectContext(projectId, userId);
    const contextStr = buildContextString(projectContext);

    // Call Agent with tracking (workflow: 'business-plan', model: 'deepseek-v4-flash')
    const planData = await trackAgentRun(
      userId,
      projectId,
      'business-plan',
      selected.toObject(),
      () => runBusinessPlanAgent(projectId, selected.toObject(), founderProfile.toObject(), contextStr),
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
    throw err;
  }
});

// 4.5 Get Business Plans
app.get('/api/projects/:projectId/business-plans', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;

    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');

    const plans = await BusinessPlanModel.find({ projectId, userId }).sort({ version: -1 });
    return res.json({ businessPlans: plans });
  } catch (err: any) {
    throw err;
  }
});

// 5. Get Venture State
app.get('/api/projects/:projectId/state', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;

    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');

    const state = await VentureStateModel.findOne({ projectId, userId });
    if (!state) throw new AppError('Venture state not found', 404, 'NOT_FOUND');

    const stateObj = state.toObject();
    if (stateObj.latestBusinessPlan && stateObj.latestBusinessPlan.id) {
      const plan = await BusinessPlanModel.findOne({ id: stateObj.latestBusinessPlan.id, userId });
      if (plan) {
        stateObj.businessPlan = plan.toObject();
      }
    }

    return res.json(stateObj);
  } catch (err: any) {
    throw err;
  }
});

// 6. AI Cofounder Context Endpoint
app.get('/api/projects/:projectId/context', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;

    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');

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
    throw err;
  }
});

// 6.5 Generate Financial Model
app.post('/api/financial-engine', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, businessIdea, businessModel } = req.body;

    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');

    const projectContext = await getProjectContext(projectId || 'demo-project', userId);
    const contextStr = buildContextString(projectContext);

    const result = await trackAgentRun(
      userId,
      projectId || 'demo-project',
      'financial-engine',
      { businessIdea, businessModel },
      async () => await runFinancialAgent(projectId || 'demo-project', businessIdea, businessModel, contextStr)
    );

    if (dbConnected) {
      await FinancialForecast.findOneAndUpdate(
        { projectId: projectId || 'demo-project' },
        {
          id: `fin_${Date.now()}`,
          userId,
          projectId: projectId || 'demo-project',
          financialForecast: result,
          generatedByModel: 'n8n-workflow',
          generatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    return res.json(result);
  } catch (err: any) {
    console.error('Financial Engine Error:', err);
    throw err;
  }
});


const upload = multer({ storage: multer.memoryStorage() });

// 7. Upload Document Pipeline
app.post('/api/projects/:projectId/documents/upload', authMiddleware, aiRateLimiter, upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;

    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'BAD_REQUEST');
    }

    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');

    const project = await ProjectModel.findOne({ id: projectId, userId });
    if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

    const documentId = `doc_${Date.now()}`;
    const uploadedDoc = new UploadedDocumentModel({
      id: documentId,
      userId,
      projectId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size || 0,
      storageUrl: 'local-memory',
      processingStatus: 'processing'
    });

    await uploadedDoc.save();

    // Trigger ingestion pipeline asynchronously
    processAndIngestDocument(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      userId,
      projectId,
      documentId
    ).catch(console.error);

    return res.status(201).json({ document: uploadedDoc });
  } catch (err: any) {
    throw err;
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
    throw error;
  }
});

// Get Project
app.get('/api/projects/:projectId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    if (!dbConnected) return res.json(null);
    const project = await ProjectModel.findOne({ id: projectId, userId });
    res.json(project ? { ...project.toObject(), id: project.id || project._id.toString() } : null);
  } catch (error) {
    throw error;
  }
});

// Update Project
app.patch('/api/projects/:projectId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    const updates = req.body;
    if (!dbConnected) return res.json(null);
    const project = await ProjectModel.findOneAndUpdate({ id: projectId, userId }, updates, { new: true });
    res.json(project ? { ...project.toObject(), id: project.id || project._id.toString() } : null);
  } catch (error) {
    throw error;
  }
});

// Delete Project
app.delete('/api/projects/:projectId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    if (!dbConnected) return res.json({ success: true });
    
    // Check ownership
    const project = await ProjectModel.findOne({ id: projectId, userId });
    if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');

    await Promise.all([
      ProjectModel.deleteOne({ id: projectId, userId }),
      FounderProfileModel.deleteMany({ projectId, userId }),
      BusinessOpportunityModel.deleteMany({ projectId, userId }),
      SelectedOpportunityModel.deleteMany({ projectId, userId }),
      BusinessPlanModel.deleteMany({ projectId, userId }),
      FinancialForecast.deleteMany({ projectId }),
      PricingStrategy.deleteMany({ projectId }),
      BrandIdentityModel.deleteMany({ projectId, userId }),
      MarketingCampaignModel.deleteMany({ projectId, userId }),
      PitchDeckModel.deleteMany({ projectId, userId }),
      ExecutionRoadmapModel.deleteMany({ projectId, userId }),
      UploadedDocumentModel.deleteMany({ projectId, userId }),
      KnowledgeDocumentModel.deleteMany({ projectId, userId }),
      VentureStateModel.deleteMany({ projectId, userId }),
      AgentRunModel.deleteMany({ projectId, userId }),
      ConversationModel.deleteMany({ projectId, userId })
    ]);

    res.json({ success: true });
  } catch (error) {
    throw error;
  }
});

// Archive Project
app.post('/api/projects/:projectId/archive', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    if (!dbConnected) return res.json({ success: true });
    const project = await ProjectModel.findOneAndUpdate({ id: projectId, userId }, { status: 'archived' }, { new: true });
    res.json(project ? { ...project.toObject(), id: project.id || project._id.toString() } : null);
  } catch (error) {
    throw error;
  }
});

// Restore Project
app.post('/api/projects/:projectId/restore', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    if (!dbConnected) return res.json({ success: true });
    const project = await ProjectModel.findOneAndUpdate({ id: projectId, userId }, { status: 'active' }, { new: true });
    res.json(project ? { ...project.toObject(), id: project.id || project._id.toString() } : null);
  } catch (error) {
    throw error;
  }
});


// AI Cofounder Chat Endpoint
app.post('/api/ai/chat', authMiddleware, validateRequest(aiChatSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId, message, conversationId } = req.body;
    const userId = (req as any).user.id;
    if (!projectId || !message) throw new AppError('Missing projectId or message', 400, 'BAD_REQUEST');

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

    const projectContext = await getProjectContext(projectId, userId);
    const contextStr = buildContextString(projectContext);

    const aiResponse = await runCofounderAgent(message, projectContext, contextStr);

    // Attach RAG sources to AI response for UI transparency
    if (aiResponse) {
      aiResponse.ragSources = ragResults.map((r: any) => r.title);
      chatHistory.push(aiResponse);
    } else {
      chatHistory.push({
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        message: 'Sorry, I am currently unable to process your request. Please try again later.',
        timestamp: new Date()
      });
    }

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
    throw error;
  }
});

// Memory Retrieval Endpoint
app.get('/api/projects/:projectId/memory', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    const conversations = await ConversationModel.find({ projectId }).sort({ createdAt: -1 });
    return res.json({ conversations });
  } catch (error) {
    throw error;
  }
});

// Clear Memory Endpoint
app.delete('/api/projects/:projectId/memory', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    await ConversationModel.findOneAndUpdate({ projectId }, { messages: [] });
    return res.json({ success: true });
  } catch (error) {
    throw error;
  }
});

// Image Generation Endpoint (AI Studio)
app.post('/api/studio/generate-image', authMiddleware, validateRequest(generateImageSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) throw new AppError('Missing prompt', 400, 'BAD_REQUEST');

    const fireworksKey = env.FIREWORKS_API_KEY;
    if (!fireworksKey) {
      throw new AppError('Fireworks API key not configured', 500, 'INTERNAL_SERVER_ERROR');
    }

    const enhancedPrompt = `${prompt}, ${style} style, high quality, highly detailed`;

    try {
      const imageBuffer = await callFireworksImage(enhancedPrompt, "16:9");
      if (!imageBuffer) {
        throw new AppError('Image generation returned empty', 502, 'AI_PROVIDER_ERROR');
      }
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      return res.json({ imageUrl: dataUrl });
    } catch (error) {
      console.error('Fireworks image error:', error);
      throw new AppError('Image generation failed', 502, 'AI_PROVIDER_ERROR');
    }
  } catch (error) {
    throw error;
  }
});

app.get('/api/ai/chat/:projectId', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (dbConnected) {
      const conv = await ConversationModel.findOne({ projectId });
      res.json(conv?.messages || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    throw error;
  }
});

// ==========================================
// BRANDING ROUTES
// ==========================================

app.post('/api/branding/generate', authMiddleware, validateRequest(generateBusinessPlanSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) throw new AppError('Missing projectId', 400, 'BAD_REQUEST');

    const selected = await SelectedOpportunityModel.findOne({ projectId, userId });
    const businessPlan = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });

    const projectContext = await getProjectContext(projectId, userId);
    const contextStr = buildContextString(projectContext);

    const brandData = await trackAgentRun(
      userId, projectId, 'branding', { projectId },
      () => runBrandingAgent(projectId, selected?.toObject() || {}, businessPlan?.toObject() || {}, contextStr),
      'deepseek-v4-flash'
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
      generatedByModel: 'deepseek-v4-flash',
      generatedAt: new Date()
    });

    if (dbConnected) {
      await brand.save();
      await updateVentureState(projectId, userId, { branding: brand.toObject() });
    }

    return res.json({ brandIdentity: brand });
  } catch (err: any) {
    throw err;
  }
});

app.get('/api/projects/:projectId/branding', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');
    const brand = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });
    if (!brand) throw new AppError('Brand identity not found', 404, 'NOT_FOUND');
    return res.json({ brandIdentity: brand });
  } catch (err: any) {
    throw err;
  }
});

// ==========================================
// MARKETING ROUTES
// ==========================================

app.post('/api/marketing/generate', authMiddleware, validateRequest(generateBusinessPlanSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) throw new AppError('Missing projectId', 400, 'BAD_REQUEST');

    const brand = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });
    const businessPlan = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });

    const projectContext = await getProjectContext(projectId, userId);
    const contextStr = buildContextString(projectContext);

    const marketingData = await trackAgentRun(
      userId, projectId, 'marketing', { projectId },
      () => runMarketingAgent(projectId, brand?.toObject() || {}, businessPlan?.toObject() || {}, contextStr),
      'deepseek-v4-flash'
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
      generatedByModel: 'deepseek-v4-flash',
      generatedAt: new Date()
    });

    if (dbConnected) {
      await marketing.save();
      await updateVentureState(projectId, userId, { marketing: marketing.toObject() });
    }

    return res.json({ marketingCampaign: marketing });
  } catch (err: any) {
    throw err;
  }
});

app.get('/api/projects/:projectId/marketing', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');
    const marketing = await MarketingCampaignModel.findOne({ projectId, userId, isLatest: true });
    if (!marketing) throw new AppError('Marketing campaign not found', 404, 'NOT_FOUND');
    return res.json({ marketingCampaign: marketing });
  } catch (err: any) {
    throw err;
  }
});

// ==========================================
// PITCH ROUTES
// ==========================================

app.post('/api/pitch/generate', authMiddleware, validateRequest(generateBusinessPlanSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    if (!projectId) throw new AppError('Missing projectId', 400, 'BAD_REQUEST');

    const businessPlan = await BusinessPlanModel.findOne({ projectId, userId, isLatest: true });
    const brand = await BrandIdentityModel.findOne({ projectId, userId, isLatest: true });

    const projectContext = await getProjectContext(projectId, userId);
    const contextStr = buildContextString(projectContext);

    const pitchData = await trackAgentRun(
      userId, projectId, 'pitch', { projectId },
      () => runPitchAgent(projectId, businessPlan?.toObject() || {}, brand?.toObject() || {}, contextStr),
      'deepseek-v4-flash'
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
      generatedByModel: 'deepseek-v4-flash',
      generatedAt: new Date()
    });

    if (dbConnected) {
      await pitch.save();
      await updateVentureState(projectId, userId, { pitchDeck: pitch.toObject() });
    }

    return res.json({ pitchDeck: pitch });
  } catch (err: any) {
    throw err;
  }
});

app.get('/api/projects/:projectId/pitch', authMiddleware, validateRequest(projectIdParamSchema), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.params;
    if (!dbConnected) throw new AppError('DB required', 503, 'SERVICE_UNAVAILABLE');
    const pitch = await PitchDeckModel.findOne({ projectId, userId, isLatest: true });
    if (!pitch) throw new AppError('Pitch deck not found', 404, 'NOT_FOUND');
    return res.json({ pitchDeck: pitch });
  } catch (err: any) {
    throw err;
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Creator Engine backend running on http://localhost:${PORT}`);
});
