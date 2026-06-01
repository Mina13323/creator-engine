import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@creator/types';

interface AppState {
  isOnboarded: boolean;
  onboardingData: any | null;
  projects: Project[];
  currentProject: Project | null;
  activeTab: string;
  
  // Actions
  completeOnboarding: (data: any) => void;
  loadProjects: () => void;
  selectProject: (projectId: string) => void;
  startNewVenture: () => void;
  resetToDashboard: () => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      onboardingData: null,
      projects: [],
      currentProject: null,
      activeTab: 'dashboard',

      completeOnboarding: (data) => {
        set({ isOnboarded: true, onboardingData: data });
      },

      loadProjects: () => {
        const savedProjects = localStorage.getItem('ceo_projects');
        const projects = savedProjects ? JSON.parse(savedProjects) : [];
        set({ projects });
      },

      selectProject: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        set({ currentProject: project || null, activeTab: 'dashboard' });
      },

      startNewVenture: () => {
        const newProject: Project = {
          id: `proj_${Date.now()}`,
          userId: 'local',
          name: 'New Venture',
          description: 'AI-powered business venture',
          industry: 'Technology',
          status: 'idea',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const updatedProjects = [...get().projects, newProject];
        localStorage.setItem('ceo_projects', JSON.stringify(updatedProjects));
        set({ 
          projects: updatedProjects, 
          currentProject: newProject,
          activeTab: 'dashboard'
        });
      },

      resetToDashboard: () => {
        set({ currentProject: null, activeTab: 'dashboard' });
      },

      addProject: (project) => {
        const updatedProjects = [...get().projects, project];
        localStorage.setItem('ceo_projects', JSON.stringify(updatedProjects));
        set({ projects: updatedProjects });
      },

      updateProject: (projectId, updates) => {
        const updatedProjects = get().projects.map(p => 
          p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
        );
        localStorage.setItem('ceo_projects', JSON.stringify(updatedProjects));
        set({ 
          projects: updatedProjects,
          currentProject: get().currentProject?.id === projectId 
            ? { ...get().currentProject, ...updates } 
            : get().currentProject
        });
      },
    }),
    {
      name: 'ceo-storage',
    }
  )
);