import { create } from 'zustand';
import { Project, BusinessIdea, BusinessValidation, BusinessModel, BrandIdentity, MarketingCampaign, ExecutionRoadmap, ChatMessage } from '@creator/types';

interface ProjectOutputs {
  idea?: BusinessIdea;
  validation?: BusinessValidation;
  strategy?: BusinessModel;
  branding?: BrandIdentity;
  marketing?: MarketingCampaign;
  roadmap?: ExecutionRoadmap;
}

interface StoreState {
  projects: Project[];
  currentProject: Project | null;
  currentOutputs: ProjectOutputs | null;
  activeTab: 'dashboard' | 'business-builder' | 'financials' | 'guides' | 'ai-consultant' | 'pitch' | 'radar' | 'market-research' | 'branding' | 'marketing' | 'roadmap' | 'ai-studio';
  isOnboarded: boolean;
  loading: boolean;
  loadingMessage: string;
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  // Auth State
  user: { id: string; email: string; name?: string } | null;
  token: string | null;
  isAuthModalOpen: boolean;

  // Actions
  setAuthModalOpen: (isOpen: boolean) => void;
  setAuth: (user: { id: string; email: string; name?: string } | null, token: string | null) => void;
  logout: () => void;
  verifyAuth: () => Promise<void>;
  
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (data: {
    name: string;
    description: string;
    industry: string;
    skills: string[];
    budget: number;
    location: string;
  }) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  resetToDashboard: () => void;
  startNewVenture: () => void;
}

const API_BASE = 'http://localhost:5000/api';

export const useStore = create<StoreState>((set, get) => ({
  projects: [],
  currentProject: null,
  currentOutputs: null,
  activeTab: 'dashboard',
  isOnboarded: false,
  loading: false,
  loadingMessage: '',
  chatMessages: [],
  chatLoading: false,

  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null,
  isAuthModalOpen: false,

  setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('jwt_token');
    set({ user: null, token: null, isOnboarded: false, projects: [], currentProject: null });
  },
  verifyAuth: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { user } = await res.json();
        set({ user });
      } else {
        get().logout();
      }
    } catch (e) {
      console.warn('Auth verification failed', e);
    }
  },

  loadProjects: async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: {
          ...(get().token ? { Authorization: `Bearer ${get().token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({ projects: data });
        // If there are projects, we consider user onboarded to the dashboard
        if (data.length > 0) {
          set({ isOnboarded: true });
        }
      }
    } catch (e) {
      console.warn('Failed to connect to API, running with offline mock projects.', e);
      // Mock projects list if offline
      set({
        projects: [
          {
            id: 'proj_mock_1',
            userId: 'user_demo',
            name: 'EcoKart Egypt',
            description: 'Hyperlocal electric grocery cargo fleet in Tagamoa, Cairo.',
            industry: 'Logistics',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        isOnboarded: true
      });
    }
  },

  selectProject: async (projectId: string) => {
    set({ loading: true, loadingMessage: 'Retrieving venture dossier...' });
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        headers: {
          ...(get().token ? { Authorization: `Bearer ${get().token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({
          currentProject: data.project,
          currentOutputs: data.outputs,
          activeTab: 'business-builder',
          loading: false
        });

        // Load chat history
        const chatRes = await fetch(`${API_BASE}/ai/chat/${projectId}`, {
          headers: {
            ...(get().token ? { Authorization: `Bearer ${get().token}` } : {})
          }
        });
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          set({ chatMessages: chatData });
        } else {
          set({ chatMessages: [] });
        }
      }
    } catch (e) {
      console.warn('Offline fetch project failed, loading mock venture details.', e);
      // Hardcoded offline data
      const mockProject = get().projects.find(p => p.id === projectId) || {
        id: projectId,
        userId: 'user_demo',
        name: 'EcoKart Egypt',
        description: 'Hyperlocal electric grocery cargo fleet in Tagamoa, Cairo.',
        industry: 'Logistics',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set({
        currentProject: mockProject,
        currentOutputs: {
          idea: {
            id: 'idea_mock',
            projectId,
            title: 'EcoKart Logistics',
            description: mockProject.description,
            targetAudience: 'Gourmet supermarkets and organic grocers in Cairo.',
            monetization: ['Per-delivery commission', 'Corporate logistics monthly subscription'],
            skillsRequired: ['Operations Management', 'Fleet Coordination', 'Next.js'],
            score: 95
          },
          validation: {
            id: 'val_mock',
            projectId,
            feasibilityScore: 88,
            marketDemandScore: 92,
            riskScore: 30,
            competitors: [
              { name: 'Rabbit Mart', marketShare: 'High', strengths: ['15 min delivery', 'Deep VC funding'], weaknesses: ['High operational overhead', 'Non-electric fleet'] }
            ],
            marketSize: '$45M TAM in Cairo premium residential zones.',
            barriersToEntry: ['Fleet capital expenditure', 'Courier training and retention.'],
            validationSummary: 'Strong local market signal. Capitalizing on green-energy branding provides a substantial entry niche.'
          },
          strategy: {
            id: 'strategy_mock',
            projectId,
            leanCanvas: {
              problem: ['High courier fuel costs eating margins', 'Cairo traffic stalling traditional bikes'],
              solution: ['Electric cargo cycles dodging traffic', 'Aggregated dark stores partnerships'],
              keyMetrics: ['Cost per delivery (CPD)', 'Delivery fulfillment rate'],
              uniqueValueProposition: 'Eco-friendly cargo cycles offering 20% cheaper last-mile delivery for Cairo green brands.',
              unfairAdvantage: 'Proprietary custom-built lightweight cargo chassis layout.',
              channels: ['Direct sales to eco-brands', 'Social media sustainability showcases'],
              customerSegments: ['High-end organic food suppliers', 'E-commerce fashion boutiques'],
              costStructure: ['Electric bike leasing', 'Rider wages', 'Platform API maintenance'],
              revenueStreams: ['Commission per order', 'Corporate delivery retainers']
            },
            pricingStrategy: 'Flexible pricing models starting with EGP 35 per delivery or flat EGP 8,000 monthly fleet support tiers.',
            mvpScope: ['Landing page lead forms', 'Dispatcher Whatsapp coordination portal', '2 operational custom electric tricycles']
          },
          branding: {
            id: 'branding_mock',
            projectId,
            brandName: 'EcoKart',
            slogan: 'Deliver Green. Deliver Fast.',
            toneOfVoice: 'Eco-conscious, hyper-efficient, urban, and modern.',
            brandPositioning: 'The preferred green-transport logistics partner for progressive Egyptian retail brands.',
            logoPrompt: 'Sleek cargo trike icon green and black, vector minimalist, black background --v 6.0',
            colorPalette: { primary: '#020617', secondary: '#10B981', background: '#0F172A', accent: '#3B82F6' }
          },
          marketing: {
            id: 'mkt_mock',
            projectId,
            targetChannels: ['LinkedIn campaigns', 'Local Cairo design events', 'Direct cold call outreach'],
            budgetAllocation: { 'LinkedIn Advertising': 60, 'Organic Events': 40 },
            adCopies: [
              { platform: 'LinkedIn', headline: 'Cut Delivery Carbon - and Cost', body: 'Ditch fuel inflation. EcoKart offers robust cargo cycles running on pure electrical grids. Lower rates, faster times, zero emission.', callToAction: 'Request Free Pilot' }
            ],
            contentHooks: ['How Cairo startups bypass gridlock using micro-fleet tricycles.', 'Green branding is converting 15% more premium buyers in Egypt.'],
            socialMediaStrategy: 'Showcase riders navigating old Cairo streets, metrics comparing electric vs internal combustion engines.'
          },
          roadmap: {
            id: 'roadmap_mock',
            projectId,
            totalEstimatedBudget: 1200,
            totalDurationWeeks: 12,
            milestones: [
              { id: 'm1', title: 'Waitlist Launch & Brand Setup', description: 'Set up landing pages, collect pilot expressions of interest.', durationWeeks: 3, dependencies: [], tasks: ['Setup website', 'Run LinkedIn cold outreach'], toolRecommendations: ['Figma', 'Next.js'], estimatedCost: 150 },
              { id: 'm2', title: 'Prototype Assembly', description: 'Procure 2 electric tricycles, set up basic dispatch.', durationWeeks: 5, dependencies: ['m1'], tasks: ['Lease trikes', 'Launch dispatcher sheet'], toolRecommendations: ['Google Sheets', 'WhatsApp Business'], estimatedCost: 650 }
            ]
          }
        },
        activeTab: 'business-builder',
        loading: false
      });
    }
  },

  createProject: async (data) => {
    set({ loading: true, loadingMessage: 'Multi-Agent Engines executing (Idea -> Validation -> Strategy -> Branding -> Marketing -> Roadmap)... This may take a few moments.' });
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(get().token ? { Authorization: `Bearer ${get().token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const responseData = await res.json();
        set(state => ({
          projects: [responseData.project, ...state.projects],
          currentProject: responseData.project,
          currentOutputs: responseData.outputs,
          activeTab: 'business-builder',
          isOnboarded: true,
          loading: false,
          chatMessages: []
        }));
      } else {
        throw new Error('API server returned error');
      }
    } catch (e) {
      console.warn('API execution failed, generating with local offline simulator.', e);
      // Simulate slow execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newProjectId = `proj_${Date.now()}`;
      const simulatedProject: Project = {
        id: newProjectId,
        userId: 'user_demo',
        name: data.name,
        description: data.description,
        industry: data.industry,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockOutputs = {
        idea: {
          id: `idea_${Date.now()}`,
          projectId: newProjectId,
          title: `${data.name} Startup`,
          description: `Personalized enterprise leveraging ${data.skills.join(', ')} matching the ${data.industry} space in ${data.location}.`,
          targetAudience: `Consumers and service-seekers in ${data.location} with budget sensitivity.`,
          monetization: ['Subscription commission model', 'Flat fee transaction support'],
          skillsRequired: [...data.skills, 'Strategy'],
          score: 89
        },
        validation: {
          id: `val_${Date.now()}`,
          projectId: newProjectId,
          feasibilityScore: 78,
          marketDemandScore: 82,
          riskScore: 35,
          competitors: [{ name: 'Global incumbents', marketShare: 'High', strengths: ['Scaling power'], weaknesses: ['High localized overhead'] }],
          marketSize: 'Growing regional demand with 25% annual user increase.',
          barriersToEntry: ['Brand awareness', 'Local distribution compliance'],
          validationSummary: `The venture shows strong signals because it leverages ${data.skills.join(', ')} directly to tackle localized friction.`
        },
        strategy: {
          id: `strategy_${Date.now()}`,
          projectId: newProjectId,
          leanCanvas: {
            problem: [`Limited access to local services in ${data.location}`, 'Opaque and variable pricing structures'],
            solution: [`Verified digital platform with escrow integrations`, 'Fixed-tier pricing parameters'],
            keyMetrics: ['Active User Count', 'Transactions completed', 'Retention Rate'],
            uniqueValueProposition: `The most reliable, transparent platform matching ${data.industry} demands.`,
            unfairAdvantage: 'High specialization and low cost base',
            channels: ['Social marketing', 'Direct client referral'],
            customerSegments: ['Tech-savvy youth', 'SME project managers'],
            costStructure: ['Platform infrastructure', 'Marketing reach'],
            revenueStreams: ['Percentage fee per deal', 'Premium upgrades']
          },
          pricingStrategy: `A flat transaction fee tier designed for affordability matching the $${data.budget} launch scale.`,
          mvpScope: ['Lead collection landing page', 'Client registration portal', 'Core directory dashboard']
        },
        branding: {
          id: `brand_${Date.now()}`,
          projectId: newProjectId,
          brandName: `${data.name}`,
          slogan: `Transforming ${data.industry} in ${data.location}`,
          toneOfVoice: 'Reliable, forward-thinking, clean, and customer-first.',
          brandPositioning: 'The smart digital partner for active builders.',
          logoPrompt: 'Geometric vector design logo, solid background, clean lines --v 6.0',
          colorPalette: { primary: '#030712', secondary: '#3B82F6', background: '#0F172A', accent: '#10B981' }
        },
        marketing: {
          id: `mkt_${Date.now()}`,
          projectId: newProjectId,
          targetChannels: ['Instagram/TikTok reels', 'LinkedIn posts'],
          budgetAllocation: { 'Direct Ads': 70, 'Content Strategy': 30 },
          adCopies: [
            { platform: 'Meta', headline: `Solve ${data.industry} challenges`, body: `Tired of standard bottlenecks? Try ${data.name} and experience seamless work coordination.`, callToAction: 'Get Started' }
          ],
          contentHooks: ['3 major industry trends in Egypt you should not ignore.', 'Why low-code is changing how startups deploy features.'],
          socialMediaStrategy: 'Publish video tutorials, student founder diaries, and comparison sheets.'
        },
        roadmap: {
          id: `roadmap_${Date.now()}`,
          projectId: newProjectId,
          totalEstimatedBudget: data.budget * 0.8,
          totalDurationWeeks: 10,
          milestones: [
            { id: 'm1', title: 'Setup & Brand Launch', description: 'Deploy visual landing page and collect first 100 registrations.', durationWeeks: 3, dependencies: [], tasks: ['Setup domains', 'Run social teaser'], toolRecommendations: ['Figma', 'Next.js'], estimatedCost: data.budget * 0.15 },
            { id: 'm2', title: 'Product Core Engineering', description: 'Build and deploy the directory app.', durationWeeks: 4, dependencies: ['m1'], tasks: ['Build database', 'Hook API routes'], toolRecommendations: ['Vercel', 'Supabase'], estimatedCost: data.budget * 0.4 }
          ]
        }
      };

      set(state => ({
        projects: [simulatedProject, ...state.projects],
        currentProject: simulatedProject,
        currentOutputs: mockOutputs,
        activeTab: 'business-builder',
        isOnboarded: true,
        loading: false,
        chatMessages: []
      }));
    }
  },

  sendChatMessage: async (message: string) => {
    const { currentProject, chatMessages } = get();
    if (!currentProject) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      message,
      timestamp: new Date()
    };

    set(state => ({
      chatMessages: [...state.chatMessages, userMsg],
      chatLoading: true
    }));

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(get().token ? { Authorization: `Bearer ${get().token}` } : {})
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          message
        })
      });

      if (res.ok) {
        const data = await res.json();
        set({
          chatMessages: data.history,
          chatLoading: false
        });
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn('Offline chat session. Simulating Cofounder response.', e);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        message: `Offline mode response: That's a great question regarding '${message}'. To optimize this area of our ${currentProject.name} business model, we need to focus on establishing a strong distribution channel and matching our pricing to user thresholds. Let's work on drafting our first core value propositions. What feature should we prioritize first?`,
        timestamp: new Date(),
        ragSources: ['Egypt Market Overview 2026', 'Value-Based SaaS Pricing Strategy']
      };

      set(state => ({
        chatMessages: [...state.chatMessages, aiResponse],
        chatLoading: false
      }));
    }
  },

  resetToDashboard: () => {
    set({
      currentProject: null,
      currentOutputs: null,
      activeTab: 'dashboard',
      chatMessages: []
    });
  },

  startNewVenture: () => {
    set({
      isOnboarded: false,
      currentProject: null,
      currentOutputs: null,
      activeTab: 'dashboard',
      chatMessages: []
    });
  }
}));
