'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Onboarding from '../components/Onboarding';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import BusinessBuilder from '../components/BusinessBuilder';
import BrandingPanel from '../components/BrandingPanel';
import MarketingEngine from '../components/MarketingEngine';
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
  Settings,
  ImagePlus
} from 'lucide-react';

export default function AppPage() {
  const { 
    isOnboarded, 
    loadProjects, 
    projects, 
    currentProject, 
    activeTab, 
    selectProject, 
    startNewVenture
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // AI Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [studioUrlInput, setStudioUrlInput] = useState('http://localhost:3001');

  // Load API key and URL from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKeyInput(localStorage.getItem('muapi_key') || '');
      setStudioUrlInput(localStorage.getItem('muapi_studio_url') || 'http://localhost:3001');
      useStore.getState().verifyAuth();
    }
  }, []);

  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('muapi_key', apiKeyInput.trim());
      localStorage.setItem('muapi_studio_url', studioUrlInput.trim());
      // Dispatch a custom event so AIStudioPanel can re-render immediately
      window.dispatchEvent(new Event('muapi_settings_updated'));
      setIsSettingsOpen(false);
    }
  };

  useEffect(() => {
    if (showLanding) return;
    loadProjects();
  }, [loadProjects, showLanding]);

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
    { id: 'dashboard', label: 'Home', icon: Home, requiresProject: false },
    { id: 'business-builder', label: 'Business Plan', icon: FileText, requiresProject: true },
    { id: 'financials', label: 'Financials', icon: BarChart3, requiresProject: true },
    { id: 'guides', label: 'Guides', icon: BookOpen, requiresProject: true },
    { id: 'ai-consultant', label: 'AI Consultant', icon: MessageSquare, requiresProject: true },
    { id: 'pitch', label: 'Pitch', icon: Presentation, requiresProject: true },
    { id: 'radar', label: 'Radar', icon: Radar, requiresProject: true },
    { id: 'market-research', label: 'Market Research', icon: Clock, requiresProject: true },
    { id: 'ai-studio', label: 'AI Studio', icon: ImagePlus, requiresProject: false },
  ] as const;

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
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            AI Settings
          </button>
          
          <div className="flex items-center justify-between px-3 py-2 mt-2 cursor-pointer hover:bg-slate-50 rounded-lg group" onClick={startNewVenture}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                M
              </div>
              <span className="text-sm text-slate-600 font-medium">Account</span>
            </div>
            <LogOut className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
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
            {activeTab === 'business-builder' && <BusinessBuilder />}
            {activeTab === 'branding' && <BrandingPanel />}
            {activeTab === 'marketing' && <MarketingEngine />}
            {activeTab === 'roadmap' && <RoadmapPanel />}
            {activeTab === 'ai-studio' && <AIStudioPanel />}
            
            {activeTab === 'financials' && <FinancialEngine />}
            
            {/* Fallbacks for new tabs if components don't exist yet */}
            {['guides', 'ai-consultant', 'pitch', 'radar', 'market-research'].includes(activeTab) && (
              <div className="p-8 md:p-12 text-center text-slate-500">
                <h2 className="text-2xl font-semibold mb-2 text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                <p>This module is under construction in the new UI.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Custom AI Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">AI Studio Settings</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter your Muapi API Key to enable native image and asset generation within the Creator Engine dashboard.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Muapi API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-mono text-sm bg-slate-50 text-slate-900"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5 mt-4">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Studio Interface URL
                  </label>
                  <input
                    type="url"
                    value={studioUrlInput}
                    onChange={(e) => setStudioUrlInput(e.target.value)}
                    placeholder="http://localhost:3001"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-mono text-sm bg-slate-50 text-slate-900"
                  />
                  <p className="text-xs text-slate-500 mt-1">If the iframe shows an error, ensure the studio is running and update the port here.</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="px-5 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-md shadow-slate-900/10"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AuthModal />
    </div>
  );
}
