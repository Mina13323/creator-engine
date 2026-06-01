'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import Onboarding from '@/components/Onboarding';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import BusinessBuilder from '@/components/BusinessBuilder';
import BrandingPanel from '@/components/BrandingPanel';
import MarketingEngine from '@/components/MarketingEngine';
import RoadmapPanel from '@/components/RoadmapPanel';
import CofounderChat from '@/components/CofounderChat';

import { 
  LayoutDashboard, 
  BookOpen, 
  Palette, 
  Megaphone, 
  MapPin, 
  MessageCircle, 
  ChevronRight, 
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function CEOPage() {
  const { 
    isOnboarded, 
    loadProjects, 
    projects, 
    currentProject, 
    activeTab, 
    selectProject, 
    resetToDashboard,
    startNewVenture
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    if (showLanding) {
      return;
    }

    loadProjects();
  }, [loadProjects, showLanding]);

  if (showLanding && !isOnboarded) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
        onLogin={() => setShowLanding(false)}
      />
    );
  }

  if (!isOnboarded) {
    return <Onboarding />;
  }

  // Sidebar link items
  const sidebarItems = [
    { id: 'dashboard', label: 'Venture Dashboard', icon: LayoutDashboard },
    { id: 'business-builder', label: 'Lean Canvas Strategy', icon: BookOpen, requiresProject: true },
    { id: 'branding', label: 'Brand Identity', icon: Palette, requiresProject: true },
    { id: 'marketing', label: 'Marketing Engine', icon: Megaphone, requiresProject: true },
    { id: 'roadmap', label: 'Execution Roadmap', icon: MapPin, requiresProject: true },
  ] as const;

  return (
    <div className="min-h-screen bg-[#040814] flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-10 left-10"></div>
      <div className="glow-orb glow-purple w-[400px] h-[400px] bottom-10 right-10"></div>

      {/* Global Top Navbar */}
      <header className="h-16 border-b border-white/5 bg-[#040814]/85 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-white/5 bg-slate-950 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={resetToDashboard}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                CREATOR ENGINE
              </span>
              <span className="text-[9px] font-semibold text-slate-500 block uppercase tracking-widest leading-none">
                AI Venture Builder
              </span>
            </div>
          </div>

          {/* Project Switcher Dropdown */}
          {currentProject && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10">
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <select
                value={currentProject.id}
                onChange={(e) => {
                  if (e.target.value === '__new') {
                    startNewVenture();
                  } else {
                    selectProject(e.target.value);
                  }
                }}
                className="bg-slate-900 border border-white/5 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer font-bold max-w-[200px]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value="__new" className="text-blue-400 font-bold">+ Build New Venture</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentProject && (
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                chatOpen 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-200' 
                  : 'border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> AI Cofounder
            </button>
          )}

          <button
            onClick={startNewVenture}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-white/5 px-3 py-1.5 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex min-h-0 relative z-10">
        
        {/* Left Navigation Sidebar */}
        <aside className={`w-64 border-r border-white/5 bg-[#040814]/50 backdrop-blur-md flex flex-col justify-between p-4 flex-shrink-0 md:static fixed top-16 bottom-0 left-0 z-30 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="space-y-6">
            {/* Context Widget */}
            {currentProject && (
              <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                  Active Venture Workspace
                </span>
                <h4 className="text-xs font-extrabold text-white truncate mb-1">
                  {currentProject.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {currentProject.description}
                </p>
              </div>
            )}

            {/* Sidebar Navigation */}
            <nav className="space-y-1">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const requiresProject = item.requiresProject;
                const disabled = requiresProject && !currentProject;

                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    disabled={disabled}
                    onClick={() => {
                      useStore.setState({ activeTab: item.id });
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 active:scale-95 ${
                      disabled 
                        ? 'opacity-40 cursor-not-allowed text-slate-500' 
                        : active 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile footer info */}
          <div className="pt-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-slate-300">
              U
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-none">Entrepreneur</div>
              <span className="text-[9px] text-slate-500 mt-1 block">Cairo HQ</span>
            </div>
          </div>
        </aside>

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0 min-w-0">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'business-builder' && <BusinessBuilder />}
          {activeTab === 'branding' && <BrandingPanel />}
          {activeTab === 'marketing' && <MarketingEngine />}
          {activeTab === 'roadmap' && <RoadmapPanel />}
        </main>

        {/* AI Cofounder Chat overlay panel */}
        {currentProject && chatOpen && (
          <aside className="w-80 h-full border-l border-white/5 bg-[#040814]/50 backdrop-blur-md flex-shrink-0 md:static fixed top-16 bottom-0 right-0 z-30 transition-transform duration-300">
            <CofounderChat />
          </aside>
        )}
      </div>
    </div>
  );
}