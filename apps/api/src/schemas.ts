import { z } from 'zod';

// AUTH SCHEMAS
export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string().min(1, 'Google credential is required')
  })
});

export const checkEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address')
  })
});

// PROJECT SCHEMAS
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(100)
  })
});

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'projectId parameter is required')
  })
});

// FOUNDER ANALYSIS
export const analyzeFounderSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required'),
    data: z.object({
      skills: z.array(z.string()).min(1, 'At least one skill is required'),
      experience: z.string(),
      industryInterests: z.array(z.string()).min(1),
      budget: z.coerce.number().min(0),
      location: z.string(),
      availableTime: z.string(),
      startupGoals: z.string(),
      riskTolerance: z.string(),
      teamSize: z.string()
    })
  })
});

// OPPORTUNITY SCHEMAS
export const discoverOpportunitySchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required')
  })
});

export const selectOpportunitySchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required'),
    opportunityId: z.string().min(1, 'opportunityId is required')
  })
});

export const generateBusinessPlanSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required'),
    locale: z.string().optional()
  })
});

export const generateFinancialSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required'),
    businessIdea: z.string().min(1).optional(),
    businessModel: z.string().min(1).optional(),
    currency: z.enum(['EGP', 'USD']).optional()
  })
});

export const generateBrandingSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required')
  })
});

export const generateMarketingSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required')
  })
});

export const generatePitchSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required')
  })
});

const startupCostSchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().min(0),
  description: z.string().optional().default('')
});

const monthlyCostSchema = startupCostSchema.extend({
  isVariable: z.boolean().optional().default(false)
});

const revenueProjectionSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  projected_revenue: z.coerce.number().min(0),
  cumulative_revenue: z.coerce.number().min(0)
});

export const financialAgentResponseSchema = z.object({
  financial: z.object({
    startupCosts: z.array(startupCostSchema).min(1),
    monthlyCosts: z.array(monthlyCostSchema).min(1),
    revenueProjections: z.array(revenueProjectionSchema).min(1),
    breakEvenMonth: z.coerce.number().int().min(1).max(12).nullable(),
    assumptionsApplied: z.array(z.string()).default([])
  }),
  pricing: z.object({
    recommendedStrategyType: z.string().min(1),
    marketPositioningRationale: z.string().min(1),
    priceTiers: z.array(z.object({
      tierName: z.string().min(1),
      amount: z.coerce.number().min(0),
      billingCycle: z.enum(['monthly', 'annual', 'one-time']),
      targetSegment: z.string().min(1),
      features: z.array(z.string()).default([]),
      justification: z.string().optional().default('')
    })).default([])
  }).optional()
});

export const brandingAgentResponseSchema = z.object({
  brandName: z.string().min(1),
  tagline: z.string().optional().default(''),
  slogan: z.string().optional().default(''),
  toneOfVoice: z.string().optional().default(''),
  brandPositioning: z.string().optional().default(''),
  brandPersonality: z.array(z.string()).optional().default([]),
  brandStory: z.string().optional().default(''),
  brandVoice: z.object({
    dos: z.array(z.string()).optional().default([]),
    donts: z.array(z.string()).optional().default([])
  }).optional().default({ dos: [], donts: [] }),
  logoPrompt: z.string().optional().default(''),
  colorPalette: z.object({
    primary: z.string().optional().default(''),
    secondary: z.string().optional().default(''),
    background: z.string().optional().default(''),
    accent: z.string().optional().default('')
  }).optional().default({ primary: '', secondary: '', background: '', accent: '' })
});

export const marketingAgentResponseSchema = z.object({
  marketingPlan: z.string().min(1),
  launchPlan: z.union([z.string(), z.record(z.string(), z.string())]).optional().default(''),
  campaigns: z.array(z.object({
    name: z.string().min(1),
    platform: z.string().min(1),
    budget: z.coerce.number().min(0).default(0),
    goal: z.string().min(1),
    duration: z.string().min(1),
    tactics: z.array(z.string()).default([])
  })).default([]),
  targetChannels: z.array(z.string()).default([]),
  budgetAllocation: z.record(z.string(), z.number()).default({}),
  adCopies: z.array(z.object({
    platform: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    callToAction: z.string().min(1)
  })).default([]),
  contentHooks: z.array(z.string()).default([]),
  socialMediaStrategy: z.string().optional().default('')
});

export const pitchAgentResponseSchema = z.object({
  startupPitch: z.string().min(1),
  investorSummary: z.string().min(1),
  elevatorPitch: z.string().min(1),
  problemStatement: z.string().min(1),
  solution: z.string().min(1),
  keyMetrics: z.object({
    marketSize: z.string().optional().default(''),
    revenueModel: z.string().optional().default(''),
    targetCustomers: z.string().optional().default(''),
    uniqueAdvantage: z.string().optional().default(''),
    fundingAsk: z.string().optional().default('')
  }).optional().default({
    marketSize: '',
    revenueModel: '',
    targetCustomers: '',
    uniqueAdvantage: '',
    fundingAsk: ''
  }),
  traction: z.string().optional().default('')
});

export const uploadDocumentSchema = z.object({
  params: z.object({
    projectId: z.string().min(1)
  }),
  body: z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    storageUrl: z.string().url('Invalid storage URL'),
    fileSize: z.coerce.number().optional(),
    fileBase64: z.string().optional()
  })
});

// AI CHAT
export const aiChatSchema = z.object({
  body: z.object({
    projectId: z.string().min(1),
    message: z.string().min(1),
    conversationId: z.string().nullable().optional()
  })
});

// STUDIO
export const generateImageSchema = z.object({
  body: z.object({
    prompt: z.string().min(1),
    style: z.string().min(1)
  })
});
