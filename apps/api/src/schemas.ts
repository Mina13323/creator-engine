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
    projectId: z.string().min(1, 'projectId is required')
  })
});

export const uploadDocumentSchema = z.object({
  params: z.object({
    projectId: z.string().min(1)
  }),
  body: z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    storageUrl: z.string().url('Invalid storage URL'),
    fileSize: z.coerce.number().optional()
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
