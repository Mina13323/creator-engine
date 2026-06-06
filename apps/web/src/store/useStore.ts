import { create } from 'zustand';
import { Project, ChatMessage, AuthUser, FounderProfile, BusinessOpportunity, SelectedOpportunity, BusinessPlan, VentureState, OnboardingData } from '@creator/types';
import { authClient } from '../lib/authClient';

interface StoreState {
  projects: Project[];
  currentProject: Project | null;
  ventureState: VentureState | null;
  activeTab: 'dashboard' | 'business-builder' | 'opportunities' | 'business-plan' | 'financials' | 'branding' | 'marketing' | 'roadmap' | 'ai-consultant' | 'ai-studio';
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

  // Auth State
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  isAuthenticated: boolean;

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
  generateBusinessPlan: (projectId: string) => Promise<void>;
  uploadDocument: (projectId: string, fileData: { fileName: string, fileType: string, storageUrl: string, fileSize: number }) => Promise<void>;
  generateImage: (prompt: string, style: string) => Promise<string>;

  sendChatMessage: (message: string) => Promise<void>;
  clearChat: () => Promise<void>;
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

  user: null,
  isAuthModalOpen: false,
  isAuthenticated: false,

  setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
  setAuth: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    authClient.logout(); 
    set({
      user: null,
      isAuthenticated: false,
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
      
      set({
        currentProject: proj || null,
        ventureState: stateData,
        selectedOpportunity: stateData?.selectedOpportunity || null,
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
    } catch (e) {
      console.error('createProject failed', e);
      set({ loading: false });
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
    } catch (e) {
      console.error('discoverOpportunities failed', e);
      set({ loading: false });
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

  generateBusinessPlan: async (projectId) => {
    set({ loading: true, loadingMessage: 'Generating Lean Canvas & Business Plan...' });
    try {
      const res = await authClient.post<{ businessPlan: BusinessPlan }>('/business-plan/generate', { projectId });
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

  generateImage: async (prompt: string, style: string) => {
    try {
      const res = await authClient.post<{ imageUrl: string }>('/studio/generate-image', { prompt, style });
      return res.imageUrl;
    } catch (e) {
      console.error('generateImage failed', e);
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

  clearChat: async () => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ chatMessages: [] });
    try {
      await authClient.delete(`/projects/${currentProject.id}/memory`);
    } catch (e) {
      console.error('Failed to clear chat memory', e);
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
