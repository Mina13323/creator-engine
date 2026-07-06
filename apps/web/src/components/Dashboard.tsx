'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { 
  Button, Card, CardContent, CardHeader, CardTitle, 
  AIThinkingPanel, EmptyState, MetricCard, PageHeader, AgentCard 
} from './design-system';
import { 
  Briefcase, DollarSign, Clock, ShieldAlert, Users, Target, Rocket, Plus,
  Sparkles, Search, FileText, Megaphone, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useI18n } from '../lib/i18n/I18nContext';

const inputClassName = "w-full bg-[#F8FAFD] border border-[#d9eee8] rounded-xl py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#008465]/20 focus:border-[#008465] focus:bg-white transition-all";

export default function Dashboard() {
  const { t, dir } = useI18n();
  const { 
    currentProject, 
    ventureState, 
    projects,
    loading, 
    loadingMessage, 
    createProject, 
    analyzeFounder, 
    selectProject,
    resetToDashboard,
    discoverOpportunities,
    user
  } = useStore();

  const translatedLoadingMessage = React.useMemo(() => {
    if (!loadingMessage) return t('loading.analyzingProfile');
    if (loadingMessage.includes('venture dossier')) return t('loading.retrievingDossier');
    if (loadingMessage.includes('Creating project')) return t('loading.creatingProject');
    if (loadingMessage.includes('Analyzing Founder Profile')) return t('loading.analyzingProfile');
    if (loadingMessage.includes('Discovering Startup Opportunities')) return t('loading.discoveringOpportunities');
    if (loadingMessage.includes('Generating Lean Canvas')) return t('loading.generatingBusinessPlan');
    return loadingMessage;
  }, [loadingMessage, t]);

  const [projectName, setProjectName] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience: 'Intermediate',
    industryInterests: [] as string[],
    budget: 5000,
    location: '',
    availableTime: 'Full-time (40+ hrs/wk)',
    startupGoals: '',
    riskTolerance: 'Medium (Willing to invest savings)',
    teamSize: 'Solo'
  });

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    try {
      await createProject(projectName.trim());
      setProjectName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyzeFounderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    const finalData = {
      ...formData,
      skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      industryInterests: industryInput.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (finalData.skills.length === 0) finalData.skills = ['Management'];
    if (finalData.industryInterests.length === 0) finalData.industryInterests = ['SaaS'];

    try {
      await analyzeFounder(currentProject.id, finalData);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. NO PROJECT SELECTED FLOW
  if (!currentProject) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        <PageHeader 
          title="Welcome to Creator Engine" 
          description="Your AI workspace is ready. Initialize a venture to start building." 
        />

        {projects.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Ventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <Card 
                  key={proj.id} 
                  hoverable
                  onClick={() => selectProject(proj.id)}
                  className="p-5 cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#e4f3ee] text-[#008465] flex items-center justify-center font-bold ring-1 ring-[#ccede3]">
                      {proj.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#008465] transition-colors">{proj.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{proj.status || 'Draft'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#008465]" />
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#008465]" />
              Initialize New Venture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProjectSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project Name</label>
                <input
                  required
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Acme SaaS"
                  className={`${inputClassName} py-3 px-4 text-gray-900`}
                />
              </div>
              <Button type="submit" fullWidth isLoading={loading} disabled={!projectName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Initialize Workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. PROJECT SELECTED BUT NO FOUNDER PROFILE ANALYZED YET
  if (!ventureState?.founderProfile) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <AIThinkingPanel 
            title="Analyzing Founder DNA..."
            stages={[
              { id: '1', label: 'Processing background & skills', status: 'completed' },
              { id: '2', label: 'Mapping to market opportunities', status: 'active' },
              { id: '3', label: 'Building founder archetype', status: 'pending' },
            ]}
          />
        </div>
      );
    }

    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        <PageHeader 
          title={currentProject.name} 
          description="Provide context about your skills and goals to build your founder profile."
        >
          <span className="px-3 py-1 bg-[#e4f3ee] text-[#008465] text-xs font-bold rounded-full uppercase tracking-wider ring-1 ring-[#ccede3]">
            Setup Required
          </span>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#008465]" />
              Founder Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyzeFounderSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">1. Skills & Background</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Skills (comma separated)</label>
                    <input required type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g. Marketing, Python, Sales" className={inputClassName} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Experience Level</label>
                    <select value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className={inputClassName}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Industry Interests (comma separated)</label>
                    <input required type="text" value={industryInput} onChange={(e) => setIndustryInput(e.target.value)} placeholder="e.g. SaaS, E-commerce, Fintech" className={inputClassName} />
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">2. Resources & Constraints</h3>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Budget ($)</label>
                    <input required type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} className={inputClassName} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Available Time</label>
                    <select value={formData.availableTime} onChange={(e) => setFormData({...formData, availableTime: e.target.value})} className={inputClassName}>
                      <option value="Side Hustle (5-10 hrs/wk)">Side Hustle (5-10 hrs/wk)</option>
                      <option value="Part-time (20 hrs/wk)">Part-time (20 hrs/wk)</option>
                      <option value="Full-time (40+ hrs/wk)">Full-time (40+ hrs/wk)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Startup Goals</label>
                    <input required type="text" value={formData.startupGoals} onChange={(e) => setFormData({...formData, startupGoals: e.target.value})} placeholder="e.g. Build a lifestyle business" className={inputClassName} />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[rgba(60,64,67,0.12)] flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => resetToDashboard()}>
                  Switch Project
                </Button>
                <Button type="submit">
                  Analyze Founder Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. EXECUTIVE DASHBOARD
  const { founderProfile } = ventureState;
  
  // Calculate Progress
  const progress = [
    { label: 'Founder Analysis', percent: 100 },
    { label: 'Business Plan', percent: ventureState.businessPlan ? 100 : 0 },
    { label: 'Marketing Assets', percent: (ventureState as any).marketingCampaign ? 100 : 0 },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Executive Dashboard" 
        description={`Venture Overview: ${currentProject.name}`}
      />

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Opportunities Found" value={(ventureState as any).opportunities?.length || 0} icon={Search} delay={0.1} />
        <MetricCard title="AI Documents" value={ventureState.businessPlan ? 2 : 1} icon={FileText} delay={0.2} />
        <MetricCard title="Credits Used" value={(user as any)?.creditsUsed || 0} icon={Target} delay={0.3} />
        <MetricCard title="Generated Assets" value={(ventureState as any).marketingCampaign ? 3 : 0} icon={Megaphone} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverable>
            <CardHeader>
              <CardTitle>Venture Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Founder Archetype</p>
                  <h2 className="text-3xl font-bold text-[#008465]">{founderProfile.founderType || 'Visionary Hustler'}</h2>
                </div>
                <div className="flex-1 bg-[#f1f7f4] rounded-xl p-4 border border-[#d9eee8]">
                  <p className="text-sm font-medium text-gray-700 mb-2">AI Progress Timeline</p>
                  <div className="space-y-3">
                    {progress.map(p => (
                      <div key={p.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{p.label}</span>
                          <span className="font-medium">{p.percent}%</span>
                        </div>
                        <div className="w-full bg-[#d9eee8] rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-[#008465] to-[#00b37e] h-1.5 rounded-full" style={{ width: `${p.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Your AI Workforce</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AgentCard 
              name="Founder Agent"
              status="Completed"
              inputs={['Skills', 'Budget', 'Goals']}
              outputs={['Founder Profile']}
              lastGenerated="Just now"
              onViewDetails={() => useStore.setState({ activeTab: 'dashboard' })}
            />
            <AgentCard 
              name="Opportunity Agent"
              status={(ventureState as any).opportunities?.length ? 'Completed' : 'Ready'}
              inputs={['Founder Profile']}
              outputs={['Market Opportunities']}
              isLoading={loading}
              onRegenerate={() => discoverOpportunities(currentProject.id)}
              onViewDetails={() => useStore.setState({ activeTab: 'opportunities' })}
            />
          </div>
        </div>

        {/* RIGHT COL */}
        <div className="space-y-6">
          <Card className="bg-[#e4f3ee] border-[#ccede3] shadow-[0_18px_50px_rgba(0,132,101,0.07)]">
            <CardHeader>
              <CardTitle className="text-[#008465] flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Next Best Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!(ventureState as any).opportunities?.length ? (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#ccede3] text-sm flex items-start gap-3 cursor-pointer hover:border-[#008465]/40 hover:shadow-[0_12px_28px_rgba(0,132,101,0.08)] transition-all" onClick={() => discoverOpportunities(currentProject.id)}>
                  <Search className="w-5 h-5 text-[#008465] mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Discover Opportunities</p>
                    <p className="text-gray-500 text-xs mt-0.5">Let AI scan the market based on your profile.</p>
                  </div>
                </div>
              ) : !ventureState.businessPlan ? (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#ccede3] text-sm flex items-start gap-3 cursor-pointer hover:border-[#008465]/40 hover:shadow-[0_12px_28px_rgba(0,132,101,0.08)] transition-all" onClick={() => useStore.setState({ activeTab: 'business-plan' })}>
                  <FileText className="w-5 h-5 text-[#008465] mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Build Business Strategy</p>
                    <p className="text-gray-500 text-xs mt-0.5">Generate your Lean Canvas and Model.</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#ccede3] text-sm flex items-start gap-3 cursor-pointer hover:border-[#008465]/40 hover:shadow-[0_12px_28px_rgba(0,132,101,0.08)] transition-all" onClick={() => useStore.setState({ activeTab: 'marketing' })}>
                  <Megaphone className="w-5 h-5 text-[#008465] mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Create Launch Campaign</p>
                    <p className="text-gray-500 text-xs mt-0.5">Generate video ads and social copy.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Founder Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Budget</span>
                  <span className="text-sm font-semibold">${founderProfile.budget}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Time</span>
                  <span className="text-sm font-semibold">{founderProfile.availableTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Risk</span>
                  <span className="text-sm font-semibold">{founderProfile.riskTolerance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
