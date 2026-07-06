'use client';

import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useStore } from '../store/useStore';
import Onboarding from '../components/Onboarding';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import OpportunityExplorer from '../components/OpportunityExplorer';
import BusinessPlanDashboard from '../components/BusinessPlanDashboard';
import BrandingPanel from '../components/BrandingPanel';
import MarketingStudio from '../components/MarketingStudio';
import RoadmapPanel from '../components/RoadmapPanel';
import AIStudioPanel from '../components/AIStudioPanel';
import AIConsultantDashboard from '../components/AIConsultantDashboard';
import AuthModal from '../components/AuthModal';
import CreditIndicator from '../components/CreditIndicator';
import PricingModal from '../components/PricingModal';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';
import FinancialEngine from '../components/FinancialEngine';
import AccountDetails from '../components/AccountDetails';
import { authClient } from '../lib/authClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../lib/i18n/I18nContext';

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
  ShieldAlert,
  UserCircle,
  Globe
} from 'lucide-react';

// Tabs that require authentication
const PROTECTED_TABS = ['dashboard', 'business-builder', 'financials', 'guides', 'ai-consultant', 'pitch', 'radar', 'market-research', 'branding', 'marketing', 'roadmap'];

export default function AppPage() {
  const { t, dir, locale, setLocale } = useI18n();
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
    logout,
    creditsGate,
    closeCreditsGate
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  const effectivelyOnboarded = isOnboarded || isAuthenticated;


  // Verify auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      useStore.getState().verifyAuth();
    }
  }, []);

  const [prevAuth, setPrevAuth] = useState(isAuthenticated);

  // Sync landing page visibility with authentication state transitions
  useEffect(() => {
    if (isAuthenticated !== prevAuth) {
      setPrevAuth(isAuthenticated);
      if (isAuthenticated) {
        setShowLanding(false);
      } else {
        setShowLanding(true);
      }
    }
  }, [isAuthenticated, prevAuth]);


  // Check for Paymob redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const merchantOrderId = urlParams.get('merchant_order_id') || localStorage.getItem('pending_payment_intent');

    if (success && merchantOrderId && isAuthenticated) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.removeItem('pending_payment_intent');
      
      if (success === 'true') {
        const verifyPayment = async () => {
          try {
            await authClient.post('/payments/paymob/verify-redirect', { merchant_order_id: merchantOrderId, success });
            toast.success('Payment successful! Credits added to your wallet.');
            useStore.getState().loadCredits();
          } catch (error: any) {
            // In production, verify-redirect returns 404 because webhook handles it
            if (error?.message?.includes('404') || error?.message?.includes('Not found')) {
              toast.success('Payment received! Credits will update shortly.');
              setTimeout(() => useStore.getState().loadCredits(), 3000);
            } else {
              toast.error(error?.message || 'Payment verification failed');
            }
          }
        };
        verifyPayment();
      } else {
        toast.error('Payment failed or was cancelled.');
      }
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

  if (showLanding) {
    return (
      <>
        <LandingPage
          onGetStarted={() => setShowLanding(false)}
          onLogin={() => useStore.getState().setAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
        />
        <AuthModal />
      </>
    );
  }

  if (!effectivelyOnboarded) {
    return (
      <>
        <Onboarding />
        <AuthModal />
      </>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: Home, requiresProject: false },
    { id: 'opportunities', label: t('sidebar.opportunities'), icon: Radar, requiresProject: true },
    { id: 'business-plan', label: t('sidebar.businessPlan'), icon: FileText, requiresProject: true },
    { id: 'financials', label: t('sidebar.financials'), icon: BarChart3, requiresProject: true },
    { id: 'branding', label: t('sidebar.branding'), icon: BookOpen, requiresProject: true },
    { id: 'marketing', label: t('sidebar.marketing'), icon: Megaphone, requiresProject: true },
    { id: 'roadmap', label: t('sidebar.roadmap'), icon: Clock, requiresProject: true },
    { id: 'ai-consultant', label: t('sidebar.aiConsultant'), icon: MessageSquare, requiresProject: true },
    { id: 'ai-studio', label: t('sidebar.aiStudio'), icon: ImagePlus, requiresProject: false },
    { id: 'account', label: t('sidebar.account'), icon: UserCircle, requiresProject: false },
  ] as const;

  // User display info
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const userDisplayName = user?.name || user?.email || 'Guest';

  return (
    <div className="h-screen bg-[#FDFDFD] text-slate-900 flex font-sans overflow-hidden">
      
      <Toaster />
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex gap-1">
            <div className="w-1/2 h-full bg-[#008465] rounded-sm skew-x-12"></div>
            <div className="w-1/2 h-full bg-[#008465] rounded-sm -skew-x-12"></div>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">Creator Engine</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-sm"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === 'en' ? 'AR' : 'EN'}</span>
          </button>

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('sidebar.admin')}
            </Link>
          )}
          {isAuthenticated && <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50/80 border border-rose-100 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('sidebar.logout')}
          </button>}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600" aria-label="Toggle Mobile Menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : -300 }}
        className={`fixed md:static top-0 left-0 bottom-0 w-[260px] h-screen md:h-full bg-white border-r border-slate-200 z-40 flex flex-col pt-16 md:pt-0 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 pb-2">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2 mb-8">
            <div className="w-5 h-5 flex gap-1">
              <div className="w-1/2 h-full bg-[#008465] rounded-sm skew-x-12"></div>
              <div className="w-1/2 h-full bg-[#008465] rounded-sm -skew-x-12"></div>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Creator Engine</span>
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
          {/* Landing Page Button */}
          <button
            onClick={() => {
              setShowLanding(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-50 group mb-2"
          >
            <Globe className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            <span>{t('nav.home')}</span>
          </button>

          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requiresProject && !currentProject;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  useStore.setState({ activeTab: item.id as any });
                  setMobileMenuOpen(false);
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all z-10 group
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                  ${isActive 
                    ? 'text-emerald-900 font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-emerald-50 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-700'}`} />
                <span className={`relative z-10 ${isActive ? 'text-emerald-700 font-bold' : 'text-slate-700 font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
          {user?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 mt-2 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-700" />
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button onClick={() => useStore.getState().setShowPricingModal(true)} className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-semibold rounded-full py-2.5 text-sm transition-colors mb-4">
            {t('sidebar.upgrade')}
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            {t('sidebar.help')}
          </button>
          
          {/* User account section */}
          <div className="flex items-center justify-between px-3 py-2 mt-2 cursor-pointer hover:bg-slate-50 rounded-lg group">
            <div className="flex items-center gap-3">
              {user?.avatar && !avatarError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.avatar} 
                  alt={userDisplayName} 
                  onError={() => setAvatarError(true)}
                  className="w-6 h-6 rounded-full object-cover" 
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
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
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="text-slate-400 text-xs tracking-wider flex items-center gap-2 font-semibold">
            <span>{t('sidebar.workspace')}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 capitalize font-bold">{sidebarItems.find(item => item.id === activeTab)?.label || activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-[0_8px_20px_rgba(0,132,101,0.08)] hover:bg-emerald-100 hover:border-emerald-300 transition-all text-xs font-extrabold text-emerald-800 tracking-wide"
              title="Switch Language / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#008465]" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </motion.button>

            <CreditIndicator />
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-[0_8px_20px_rgba(15,23,42,0.06)] text-xs font-extrabold text-slate-700 tracking-wide">
              <UserCircle className="w-3.5 h-3.5 text-[#008465]" />
              <span>{userDisplayName}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => logout()}
              className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full shadow-[0_8px_20px_rgba(225,29,72,0.08)] hover:bg-rose-100 hover:border-rose-300 transition-all text-xs font-extrabold text-rose-700 tracking-wide"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              {t('sidebar.logout')}
            </motion.button>
          </div>
        </header>

        {/* Workspace Viewport */}
        <div className={`flex-grow min-h-0 ${activeTab === 'ai-consultant' ? 'overflow-hidden p-0' : 'overflow-y-auto p-6 md:p-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex-1 w-full ${activeTab === 'ai-consultant' ? 'h-full max-w-none' : 'max-w-6xl mx-auto'}`}
            >
              {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'opportunities' && <OpportunityExplorer />}
            {activeTab === 'business-plan' && <BusinessPlanDashboard />}
            {activeTab === 'branding' && <BrandingPanel />}
            {activeTab === 'marketing' && <MarketingStudio />}
            {activeTab === 'roadmap' && <RoadmapPanel />}
            {activeTab === 'ai-studio' && <AIStudioPanel />}
            {activeTab === 'ai-consultant' && <AIConsultantDashboard />}
            {activeTab === 'account' && <AccountDetails />}
            
            {activeTab === 'financials' && <FinancialEngine />}
            
            {/* Fallbacks for new tabs if components don't exist yet */}
            {['guides', 'pitch', 'radar', 'market-research'].includes(activeTab) && (
              <div className="p-8 md:p-12 text-center text-slate-500">
                <h2 className="text-2xl font-semibold mb-2 text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                <p>This module is under construction in the new UI.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
    <AuthModal />
    <PricingModal />
    <InsufficientCreditsModal
      open={!!creditsGate?.open}
      onClose={closeCreditsGate}
      requiredCredits={creditsGate?.required ?? 0}
      featureKey={creditsGate?.featureKey}
    />
  </div>
  );
}
