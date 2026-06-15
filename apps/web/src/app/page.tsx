'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Onboarding from '../components/Onboarding';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import OpportunityExplorer from '../components/OpportunityExplorer';
import BusinessPlanDashboard from '../components/BusinessPlanDashboard';
import BrandingPanel from '../components/BrandingPanel';
import MarketingDashboard from '../components/MarketingDashboard';
import MarketingStudio from '../components/MarketingStudio';
import PitchDashboard from '../components/PitchDashboard';
import RoadmapPanel from '../components/RoadmapPanel';
import CofounderChat from '../components/CofounderChat';
import AIStudioPanel from '../components/AIStudioPanel';
import AuthModal from '../components/AuthModal';
import FinancialEngine from '../components/FinancialEngine';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Home, 
  FileText, 
  BarChart3, 
  BookOpen, 
  MessageSquare, 
  Presentation, 
  Radar, 
  Clock, 
  HelpCircle,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ImagePlus,
  Megaphone,
  Video
} from 'lucide-react';

// Tabs that require authentication
const PROTECTED_TABS = ['dashboard', 'business-builder', 'financials', 'guides', 'ai-consultant', 'pitch', 'radar', 'market-research', 'branding', 'marketing', 'roadmap'];

export default function AppPage() {
  const { 
    isOnboarded, 
    loadProjects, 
    projects, 
    currentProject, 
    activeTab, 
    selectProject, 
    startNewVenture,
    user,
    isAuthenticated,
    logout
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // Verify auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      useStore.getState().verifyAuth();
    }
  }, []);

  // Hide landing page automatically if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowLanding(false);
    }
  }, [isAuthenticated]);

  // Route protection disabled for open UI development
  /*
  useEffect(() => {
    if (isOnboarded && !isAuthenticated && PROTECTED_TABS.includes(activeTab)) {
      useStore.getState().setAuthModalOpen(true);
    }
  }, [isOnboarded, isAuthenticated, activeTab]);
  */

  useEffect(() => {
    if (showLanding || !isAuthenticated) return;
    loadProjects();
  }, [loadProjects, showLanding, isAuthenticated]);

  if (showLanding && !isOnboarded) {
    return (
      <>
        <LandingPage
          onGetStarted={() => setShowLanding(false)}
          onLogin={() => useStore.getState().setAuthModalOpen(true)}
        />
        <AuthModal />
      </>
    );
  }

  if (!isOnboarded) {
    return (
      <>
        <Onboarding />
        <AuthModal />
      </>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Founder Profile', icon: Home, requiresProject: false },
    { id: 'opportunities', label: 'Opportunities', icon: Radar, requiresProject: true },
    { id: 'business-plan', label: 'Business Plan', icon: FileText, requiresProject: true },
    { id: 'financials', label: 'Financials', icon: BarChart3, requiresProject: true },
    { id: 'branding', label: 'Branding', icon: BookOpen, requiresProject: true },
    { id: 'marketing-ai', label: 'Marketing Plan', icon: Megaphone, requiresProject: true },
    { id: 'marketing', label: 'Marketing Studio', icon: Video, requiresProject: true },
    { id: 'pitch', label: 'Pitch Deck', icon: Presentation, requiresProject: true },
    { id: 'roadmap', label: 'Roadmap', icon: Clock, requiresProject: true },
    { id: 'ai-studio', label: 'AI Studio', icon: ImagePlus, requiresProject: false },
  ] as const;

  // User display info
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const userDisplayName = user?.name || user?.email || 'Guest';

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 flex font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex gap-1">
            <div className="w-1/2 h-full bg-emerald-500 rounded-sm skew-x-12"></div>
            <div className="w-1/2 h-full bg-emerald-500 rounded-sm -skew-x-12"></div>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">Venturekit</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : -300 }}
        className={`fixed md:static top-0 left-0 bottom-0 w-[260px] bg-white border-r border-slate-200 z-40 flex flex-col pt-16 md:pt-0 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 pb-2">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2 mb-8">
            <div className="w-5 h-5 flex gap-1">
              <div className="w-1/2 h-full bg-emerald-500 rounded-sm skew-x-12"></div>
              <div className="w-1/2 h-full bg-emerald-500 rounded-sm -skew-x-12"></div>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Venturekit</span>
          </div>

          {/* Project Selector */}
          {currentProject && (
            <div className="flex items-center justify-between p-2 mb-6 rounded-lg hover:bg-slate-50 cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {currentProject.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                  {currentProject.name}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requiresProject && !currentProject;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  useStore.setState({ activeTab: item.id });
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                  ${isActive 
                    ? 'bg-slate-100 text-slate-900 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-semibold rounded-full py-2.5 text-sm transition-colors mb-4">
            Upgrade
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            Help
          </button>
          
          {/* User account section */}
          <div className="flex items-center justify-between px-3 py-2 mt-2 cursor-pointer hover:bg-slate-50 rounded-lg group">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={userDisplayName} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  {userInitial}
                </div>
              )}
              <span className="text-sm text-slate-600 font-medium truncate max-w-[120px]">
                {userDisplayName}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Logout"
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-screen overflow-y-auto pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 w-full max-w-6xl mx-auto"
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'opportunities' && <OpportunityExplorer />}
            {activeTab === 'business-plan' && <BusinessPlanDashboard />}
            {activeTab === 'branding' && <BrandingPanel />}
            {activeTab === 'marketing-ai' && <MarketingDashboard />}
            {activeTab === 'marketing' && <MarketingStudio />}
            {activeTab === 'pitch' && <PitchDashboard />}
            {activeTab === 'roadmap' && <RoadmapPanel />}
            {activeTab === 'ai-studio' && <AIStudioPanel />}
            
            {activeTab === 'financials' && <FinancialEngine />}
            
            {/* Fallbacks for new tabs if components don't exist yet */}
            {['guides', 'ai-consultant', 'radar', 'market-research'].includes(activeTab) && (
              <div className="p-8 md:p-12 text-center text-slate-500">
                <h2 className="text-2xl font-semibold mb-2 text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                <p>This module is under construction in the new UI.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <AuthModal />
    </div>
  );
}
