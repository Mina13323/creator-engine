import { create } from 'zustand';
import { Project, VentureProjectState, ChatMessage } from '@creator/types';

interface StoreState {
  projects: Project[];
  currentProject: Project | null;
  currentOutputs: VentureProjectState | null;
  activeTab: 'dashboard' | 'business-builder' | 'financials' | 'guides' | 'ai-consultant' | 'pitch' | 'radar' | 'market-research' | 'competitors' | 'branding' | 'marketing' | 'roadmap' | 'ai-studio';
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
        if (data.length > 0) {
          set({ isOnboarded: true });
        }
      }
    } catch (e) {
      console.warn('Failed to connect to API, running with offline mock projects.', e);
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
      const res = await fetch(`${API_BASE}/projects/${projectId}/results`, {
        headers: {
          ...(get().token ? { Authorization: `Bearer ${get().token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({
          currentProject: data.project,
          currentOutputs: data,
          activeTab: 'business-builder',
          loading: false
        });

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
      
      const mockOutputs: VentureProjectState = {
        founderProfile: {
          skills: ['Logistics', 'Management'],
          budget: 15000,
          industry: 'Logistics',
          location: 'Cairo, Egypt',
          commitment: 'full-time'
        },
        businessPlan: {
          businessIdea: mockProject.description,
          targetAudience: 'Organic grocers and local supermarkets',
          valueProposition: 'Affordable, green last-mile delivery using electric tricycles.',
          revenueModel: ['Per-delivery commission', 'Monthly retainer'],
          mvpFeatures: ['Dispatcher Dashboard', 'Rider App', 'Client Booking Portal']
        },
        marketResearch: {
          validationReport: 'Strong local market signal. Capitalizing on green-energy branding provides a substantial entry niche.',
          competitorAnalysis: 'Rabbit Mart: Deep VC funding, but high operational overhead and non-electric fleet.',
          trendAnalysis: 'Growing demand for sustainable logistics and government incentives for EVs. Main risk is battery degradation in hot weather.'
        },
        financialForecast: {
          startupCost: 12000,
          monthlyExpenses: 3000,
          expectedRevenue: 5000,
          breakEvenMonth: 8,
          profitProjection: [-2000, -1000, 0, 1500, 3000, 5000]
        },
        branding: {
          brandName: 'EcoKart',
          slogan: 'Deliver Green. Deliver Fast.',
          tone: 'Eco-conscious, hyper-efficient, urban, and modern.',
          logoPrompt: 'Sleek cargo trike icon green and black, vector minimalist, black background --v 6.0',
          colorPalette: { primary: '#020617', secondary: '#10B981', background: '#0F172A', accent: '#3B82F6' }
        },
        marketing: {
          channels: ['LinkedIn campaigns', 'Local Cairo design events', 'Direct cold call outreach'],
          campaigns: [
            { platform: 'LinkedIn', headline: 'Cut Delivery Carbon - and Cost', description: 'Ditch fuel inflation. EcoKart offers robust cargo cycles running on pure electrical grids. Lower rates, faster times, zero emission.', callToAction: 'Request Free Pilot' }
          ],
          contentIdeas: ['How Cairo startups bypass gridlock using micro-fleet tricycles.', 'Green branding is converting 15% more premium buyers in Egypt.'],
          socialMediaStrategy: 'Showcase riders navigating old Cairo streets, metrics comparing electric vs internal combustion engines.'
        },
        roadmap: {
          totalEstimatedBudget: 1200,
          totalDurationWeeks: 12,
          milestones: [
            { title: 'Waitlist Launch & Brand Setup', description: 'Set up landing pages, collect pilot expressions of interest.', durationWeeks: 3, dependencies: [], tasks: ['Setup website', 'Run LinkedIn cold outreach'], estimatedCost: 150 },
            { title: 'Prototype Assembly', description: 'Procure 2 electric tricycles, set up basic dispatch.', durationWeeks: 5, dependencies: ['Waitlist Launch & Brand Setup'], tasks: ['Lease trikes', 'Launch dispatcher sheet'], estimatedCost: 650 }
          ]
        }
      };

      set({
        currentProject: mockProject,
        currentOutputs: mockOutputs,
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

        set({ loadingMessage: 'Running Market Research Workflow (n8n)...' });
        try {
          const webhookRes = await fetch('http://localhost:5678/webhook/start-market-research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: responseData.project.id })
          });
          
          if (webhookRes.ok) {
            const mrDataArr = await webhookRes.json();
            const mrData = Array.isArray(mrDataArr) ? mrDataArr[0] : mrDataArr;
            
            await fetch(`${API_BASE}/projects/${responseData.project.id}/market-research`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...(get().token ? { Authorization: `Bearer ${get().token}` } : {})
              },
              body: JSON.stringify(mrData)
            });
            responseData.outputs.marketResearch = mrData;
          }
        } catch (webhookErr) {
          console.warn('n8n workflow failed, using fallback or skipping.', webhookErr);
        }

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

      const mockOutputs: VentureProjectState = {
        founderProfile: {
          skills: data.skills,
          budget: data.budget,
          industry: data.industry,
          location: data.location,
          commitment: 'part-time'
        },
        businessPlan: {
          businessIdea: `Personalized enterprise leveraging ${data.skills.join(', ')} matching the ${data.industry} space in ${data.location}.`,
          targetAudience: `Consumers and service-seekers in ${data.location} with budget sensitivity.`,
          valueProposition: `The most reliable, transparent platform matching ${data.industry} demands.`,
          revenueModel: ['Subscription commission model', 'Flat fee transaction support'],
          mvpFeatures: ['Lead collection landing page', 'Client registration portal', 'Core directory dashboard']
        },
        marketResearch: {
          validationReport: `The venture shows strong signals because it leverages ${data.skills.join(', ')} directly to tackle localized friction.`,
          competitorAnalysis: 'Global incumbents have scaling power but suffer from high localized overhead.',
          trendAnalysis: 'Growing regional demand with 25% annual user increase. Opportunities in Localization and AI integration. Risks include high operational overhead.'
        },
        financialForecast: {
          startupCost: data.budget * 0.4,
          monthlyExpenses: data.budget * 0.1,
          expectedRevenue: data.budget * 0.5,
          breakEvenMonth: 6,
          profitProjection: [0, 500, 1200, 2500, 4000, 7000]
        },
        branding: {
          brandName: `${data.name}`,
          slogan: `Transforming ${data.industry} in ${data.location}`,
          tone: 'Reliable, forward-thinking, clean, and customer-first.',
          logoPrompt: 'Geometric vector design logo, solid background, clean lines --v 6.0',
          colorPalette: { primary: '#030712', secondary: '#3B82F6', background: '#0F172A', accent: '#10B981' }
        },
        marketing: {
          channels: ['Instagram/TikTok reels', 'LinkedIn posts'],
          campaigns: [
            { platform: 'Meta', headline: `Solve ${data.industry} challenges`, description: `Tired of standard bottlenecks? Try ${data.name} and experience seamless work coordination.`, callToAction: 'Get Started' }
          ],
          contentIdeas: ['3 major industry trends in Egypt you should not ignore.', 'Why low-code is changing how startups deploy features.'],
          socialMediaStrategy: 'Publish video tutorials, student founder diaries, and comparison sheets.'
        },
        roadmap: {
          totalEstimatedBudget: data.budget * 0.8,
          totalDurationWeeks: 10,
          milestones: [
            { title: 'Setup & Brand Launch', description: 'Deploy visual landing page and collect first 100 registrations.', durationWeeks: 3, dependencies: [], tasks: ['Setup domains', 'Run social teaser'], estimatedCost: data.budget * 0.15 },
            { title: 'Product Core Engineering', description: 'Build and deploy the directory app.', durationWeeks: 4, dependencies: ['Setup & Brand Launch'], tasks: ['Build database', 'Hook API routes'], estimatedCost: data.budget * 0.4 }
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
