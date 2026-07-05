import { create } from 'zustand';
import { Project, ChatMessage, AuthUser, FounderProfile, BusinessOpportunity, SelectedOpportunity, BusinessPlan, VentureState, OnboardingData } from '@creator/types';
import { authClient } from '../lib/authClient';
import { useErrorStore } from './errorStore';

interface StoreState {
  projects: Project[];
  currentProject: Project | null;
  ventureState: VentureState | null;
  activeTab: 'dashboard' | 'business-builder' | 'opportunities' | 'business-plan' | 'financials' | 'branding' | 'marketing' | 'roadmap' | 'ai-studio' | 'account' | 'ai-consultant';
  isOnboarded: boolean;
  
  // Async states
  loading: boolean;
  loadingMessage: string;
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  // Lifecycle Output States (for currently generating views)
  opportunities: BusinessOpportunity[];
  selectedOpportunity: SelectedOpportunity | null;
  isSelecting: boolean;
  selectionError: string | null;
  marketingCampaign: any;
  pitchDeck: any;
  currentOutputs: any;
  marketingLoading: boolean;
  pitchLoading: boolean;
  generateMarketing: any;
  generatePitch: any;
  resetProjectState: any;
  archiveProject: any;
  restoreProject: any;
  deleteProject: any;

  clearChat: any;
  conversations: any;
  setActiveConversation: any;
  loadConversations: any;
  activeConversationId: any;
  generateImage: any;
  brandIdentity: any;
  brandingLoading: boolean;
  generateBranding: (projectId: string) => Promise<void>;

  // Auth State
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  isAuthenticated: boolean;
  credits: number;
  isDemo: boolean;
  loadCredits: () => Promise<void>;
  showPricingModal: boolean;
  setShowPricingModal: (show: boolean) => void;

  // Credits gate
  creditsGate: { open: boolean; required: number; featureKey?: string } | null;
  showCreditsGate: (required: number, featureKey?: string) => void;
  closeCreditsGate: () => void;

  // Actions
  setAuthModalOpen: (isOpen: boolean) => void;
  setAuth: (user: AuthUser | null) => void;
  logout: () => void;
  verifyAuth: () => Promise<void>;
  
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  
  // New Lifecycle Actions
  createProject: (name: string) => Promise<string>;
  analyzeFounder: (projectId: string, data: OnboardingData) => Promise<void>;
  discoverOpportunities: (projectId: string) => Promise<void>;
  selectOpportunity: (projectId: string, opportunityId: string) => Promise<void>;
  generateRoadmap: (projectId: string) => Promise<void>;
  updateTaskStatus: (projectId: string, taskId: string, status: string) => Promise<void>;

  generateBusinessPlan: (projectId: string, locale?: string) => Promise<void>;
  uploadDocument: (projectId: string, fileData: { fileName: string, fileType: string, storageUrl: string, fileSize: number }) => Promise<void>;

  sendChatMessage: (message: string) => Promise<void>;
  resetToDashboard: () => void;
  startNewVenture: () => void;
  setActiveTab: (tab: StoreState['activeTab']) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  projects: [],
  currentProject: null,
  ventureState: null,
  activeTab: 'dashboard',
  isOnboarded: false,
  loading: false,
  loadingMessage: '',
  chatMessages: [],
  chatLoading: false,
  opportunities: [],
  selectedOpportunity: null,
  isSelecting: false,
  selectionError: null,

  marketingCampaign: null,
  pitchDeck: null,
  currentOutputs: null,
  marketingLoading: false,
  pitchLoading: false,
  generateMarketing: async () => {},
  generatePitch: async () => {},
  resetProjectState: () => {},
  archiveProject: () => {},
  restoreProject: () => {},
  deleteProject: () => {},

  clearChat: () => {},
  conversations: [],
  setActiveConversation: () => {},
  loadConversations: async () => {},
  activeConversationId: null,
  generateImage: async () => {},
  brandIdentity: null,
  brandingLoading: false,
  generateBranding: async (projectId: string) => {
    set({ brandingLoading: true });
    try {
      const res = await authClient.post<{ brandIdentity: any }>('/branding/generate', { projectId });
      set(state => ({
        brandIdentity: res.brandIdentity,
        ventureState: state.ventureState
          ? { ...state.ventureState, branding: res.brandIdentity }
          : state.ventureState,
        brandingLoading: false
      }));
    } catch (e: any) {
      console.error('generateBranding failed', e);
      set({ brandingLoading: false });
      const creditsMatch = e.message?.match(/(\d+)\s*credits/);
      if (creditsMatch) {
        get().showCreditsGate(parseInt(creditsMatch[1], 10), 'branding');
        return;
      }
      useErrorStore.getState().addError({
        title: 'Branding Engine Failed',
        message: e?.message || 'Could not generate branding.',
        retryAction: () => get().generateBranding(projectId)
      });
      throw e;
    }
  },

  user: null,
  isAuthModalOpen: false,
  isAuthenticated: false,

  credits: 0,
  isDemo: false,
  showPricingModal: false,
  setShowPricingModal: (show) => set({ showPricingModal: show }),

  creditsGate: null,
  showCreditsGate: (required, featureKey) => set({ creditsGate: { open: true, required, featureKey } }),
  closeCreditsGate: () => set({ creditsGate: null }),
  loadCredits: async () => {
    try {
      const data = await authClient.get<any>('/user/credits');
      if (data.wallet) {
        set({ credits: data.wallet.availableCredits, isDemo: !!data.isDemo });
      }
    } catch (e) {
      console.warn('Failed to load credits', e);
    }
  },

  setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
  setAuth: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) get().loadCredits();
  },
  logout: () => {
    authClient.logout(); 
    set({
      user: null,
      isAuthenticated: false,
      credits: 0,
      isDemo: false,
      showPricingModal: false,
      isOnboarded: false,
      projects: [],
      currentProject: null,
      ventureState: null,
      activeTab: 'dashboard',
      chatMessages: [],
      opportunities: [],
      selectedOpportunity: null,
      isSelecting: false,
      selectionError: null
    });
  },
  verifyAuth: async () => {
    try {
      const { user } = await authClient.getMe();
      set({ user, isAuthenticated: true });
      get().loadCredits();
    } catch (e: any) {
      if (e.message && (e.message.includes('404') || e.message.includes('User not found') || e.message.includes('Unauthorized') || e.message.includes('Session expired'))) {
        set({ user: null, isAuthenticated: false });
      } else {
        set({ isAuthenticated: false });
      }
    }
  },

  loadProjects: async () => {
    try {
      const data = await authClient.get<Project[]>('/projects');
      set({ projects: data });
      if (data.length > 0) {
        await get().selectProject(data[0].id || (data[0] as any)._id);
        set({ isOnboarded: true });
      }
    } catch (e) {
      console.warn('Failed to connect to API.', e);
      set({ projects: [] });
    }
  },

  selectProject: async (projectId: string) => {
    set({ loading: true, loadingMessage: 'Retrieving venture dossier...' });
    try {
      const stateData = await authClient.get<VentureState>(`/projects/${projectId}/state`);
      const proj = get().projects.find(p => p.id === projectId);
      
      const existingRoadmap = (stateData as any)?.roadmap || null;
      set({
        currentProject: proj || null,
        ventureState: stateData,
        selectedOpportunity: stateData?.selectedOpportunity || null,
        opportunities: (stateData as any)?.opportunities || [],
        brandIdentity: (stateData as any)?.branding || null,
        currentOutputs: existingRoadmap ? { roadmap: existingRoadmap } : null,
        activeTab: 'dashboard',
        loading: false
      });

      try {
        const chatData = await authClient.get<ChatMessage[]>(`/ai/chat/${projectId}`);
        set({ chatMessages: chatData });
      } catch {
        set({ chatMessages: [] });
      }
    } catch (e) {
      console.warn('Failed to load project state', e);
      set({ loading: false });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  createProject: async (name: string) => {
    set({ loading: true, loadingMessage: 'Creating project...' });
    try {
      const res = await authClient.post<{ projectId: string, project: Project }>('/projects', { name });
      set(state => ({
        projects: [res.project, ...state.projects],
        currentProject: res.project,
        loading: false
      }));
      return res.projectId;
    } catch (e: any) {
      console.error('createProject failed', e);
      set({ loading: false });
      useErrorStore.getState().addError({
        title: 'Project Creation Suspended',
        message: e.message || 'System is currently under maintenance. New project creations are temporarily suspended.',
        type: 'warning'
      });
      throw e;
    }
  },

  analyzeFounder: async (projectId, data) => {
    set({ loading: true, loadingMessage: 'Analyzing Founder Profile...' });
    try {
      const res = await authClient.post<{ founderProfile: FounderProfile }>('/founder/analyze', { projectId, data });
      set(state => ({
        ventureState: {
          id: `vs_${Date.now()}`,
          userId: state.user?.id || '',
          projectId: projectId,
          founderProfile: res.founderProfile,
          lastUpdated: new Date()
        },
        activeTab: 'dashboard',
        isOnboarded: true,
        loading: false
      }));
    } catch (e) {
      console.error('analyzeFounder failed', e);
      set({ loading: false });
      throw e;
    }
  },

  discoverOpportunities: async (projectId) => {
    set({ loading: true, loadingMessage: 'Discovering Startup Opportunities...' });
    try {
      const res = await authClient.post<{ opportunities: BusinessOpportunity[] }>('/opportunities/discover', { projectId });
      set({ opportunities: res.opportunities, activeTab: 'opportunities', loading: false });
    } catch (e: any) {
      set({ loading: false });
      const creditsMatch = e.message?.match(/(\d+)\s*credits/);
      if (creditsMatch) {
        get().showCreditsGate(parseInt(creditsMatch[1], 10), 'opportunity-discovery');
        return;
      }
      console.error('discoverOpportunities failed', e);
      throw e;
    }
  },

  selectOpportunity: async (projectId, opportunityId) => {
    set({ isSelecting: true, selectionError: null });
    try {
      const res = await authClient.post<{ success: boolean; selectedOpportunity: SelectedOpportunity }>('/opportunities/select', { projectId, opportunityId });
      set(state => {
        const updatedState = state.ventureState ? { ...state.ventureState, selectedOpportunity: res.selectedOpportunity } : state.ventureState;
        return {
          selectedOpportunity: res.selectedOpportunity,
          ventureState: updatedState as VentureState,
          isSelecting: false
        };
      });
    } catch (e: any) {
      console.error('selectOpportunity failed', e);
      set({ isSelecting: false, selectionError: e.message || 'Failed to select opportunity' });
      throw e;
    }
  },

  generateRoadmap: async (projectId) => {
    set({ loading: true, loadingMessage: 'Generating execution roadmap...' });
    try {
      const res = await authClient.post<{ roadmap: any }>('/execution/generate', { projectId });
      set(state => ({
        currentOutputs: { ...(state.currentOutputs || {}), roadmap: res.roadmap },
        ventureState: state.ventureState ? { ...state.ventureState, roadmap: res.roadmap } : state.ventureState,
        activeTab: 'roadmap',
        loading: false
      }));
    } catch (e) {
      console.error('generateRoadmap failed', e);
      set({ loading: false });
      throw e;
    }
  },

  updateTaskStatus: async (projectId, taskId, status) => {
    try {
      const res = await authClient.patch<{ roadmap: any }>(`/execution/task/${taskId}`, { projectId, status });
      set(state => ({
        currentOutputs: { ...(state.currentOutputs || {}), roadmap: res.roadmap },
        ventureState: state.ventureState ? { ...state.ventureState, roadmap: res.roadmap } : state.ventureState
      }));
    } catch (e) {
      console.error('updateTaskStatus failed', e);
      throw e;
    }
  },

  generateBusinessPlan: async (projectId, locale = 'en') => {
    set({ loading: true, loadingMessage: 'Generating Lean Canvas & Business Plan...' });
    try {
      const res = await authClient.post<{ businessPlan: BusinessPlan }>('/business-plan/generate', { projectId, locale });
      set(state => {
        const updatedState = state.ventureState ? { ...state.ventureState, businessPlan: res.businessPlan } : state.ventureState;
        return { ventureState: updatedState as VentureState, activeTab: 'business-plan', loading: false };
      });
    } catch (e) {
      console.error('generateBusinessPlan failed', e);
      set({ loading: false });
      throw e;
    }
  },

  uploadDocument: async (projectId, fileData) => {
    try {
      await authClient.post(`/projects/${projectId}/documents/upload`, fileData);
    } catch (e) {
      console.error('uploadDocument failed', e);
      throw e;
    }
  },

  sendChatMessage: async (message: string) => {
    const { currentProject } = get();
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
      const data = await authClient.post<{ history: ChatMessage[] }>('/ai/chat', {
        projectId: currentProject.id,
        message
      });
      set({
        chatMessages: data.history,
        chatLoading: false
      });
    } catch (e) {
      set({ chatLoading: false });
    }
  },

  resetToDashboard: () => {
    set({
      currentProject: null,
      ventureState: null,
      activeTab: 'dashboard',
      chatMessages: []
    });
  },

  startNewVenture: () => {
    set({
      isOnboarded: false,
      currentProject: null,
      ventureState: null,
      activeTab: 'dashboard',
      chatMessages: [],
      opportunities: []
    });
  }
}));
