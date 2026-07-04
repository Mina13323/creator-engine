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

export default function Dashboard() {
  const { 
    currentProject, 
    ventureState, 
    discoverOpportunities, 
    loading, 
    loadingMessage, 
    createProject, 
    analyzeFounder, 
    projects, 
    selectProject,
    resetToDashboard,
    user
  } = useStore();

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
                    <div className="w-10 h-10 rounded-full bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center font-bold">
                      {proj.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#1A73E8] transition-colors">{proj.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{proj.status || 'Draft'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1A73E8]" />
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#1A73E8]" />
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
                  className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl py-3 px-4 text-sm text-gray-900 focus:ring-2 focus:ring-[#1A73E8] focus:bg-white outline-none transition-all"
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
          <span className="px-3 py-1 bg-blue-50 text-[#1A73E8] text-xs font-bold rounded-full uppercase tracking-wider">
            Setup Required
          </span>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1A73E8]" />
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
                    <input required type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g. Marketing, Python, Sales" className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#1A73E8]" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Experience Level</label>
                    <select value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#1A73E8]">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Industry Interests (comma separated)</label>
                    <input required type="text" value={industryInput} onChange={(e) => setIndustryInput(e.target.value)} placeholder="e.g. SaaS, E-commerce, Fintech" className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#1A73E8]" />
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">2. Resources & Constraints</h3>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Budget ($)</label>
                    <input required type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#1A73E8]" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Available Time</label>
                    <select value={formData.availableTime} onChange={(e) => setFormData({...formData, availableTime: e.target.value})} className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#1A73E8]">
                      <option value="Side Hustle (5-10 hrs/wk)">Side Hustle (5-10 hrs/wk)</option>
                      <option value="Part-time (20 hrs/wk)">Part-time (20 hrs/wk)</option>
                      <option value="Full-time (40+ hrs/wk)">Full-time (40+ hrs/wk)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Startup Goals</label>
                    <input required type="text" value={formData.startupGoals} onChange={(e) => setFormData({...formData, startupGoals: e.target.value})} placeholder="e.g. Build a lifestyle business" className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl py-2.5 px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#1A73E8]" />
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
    { label: 'Marketing Assets', percent: ventureState.marketingCampaign ? 100 : 0 },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Executive Dashboard" 
        description={`Venture Overview: ${currentProject.name}`}
      />

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Opportunities Found" value={ventureState.opportunities?.length || 0} icon={Search} delay={0.1} />
        <MetricCard title="AI Documents" value={ventureState.businessPlan ? 2 : 1} icon={FileText} delay={0.2} />
        <MetricCard title="Credits Used" value={user?.creditsUsed || 0} icon={Target} delay={0.3} />
        <MetricCard title="Generated Assets" value={ventureState.marketingCampaign ? 3 : 0} icon={Megaphone} delay={0.4} />
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
                  <h2 className="text-3xl font-bold text-[#1A73E8]">{founderProfile.founderType || 'Visionary Hustler'}</h2>
                </div>
                <div className="flex-1 bg-[#F8FAFD] rounded-xl p-4 border border-[rgba(60,64,67,0.12)]">
                  <p className="text-sm font-medium text-gray-700 mb-2">AI Progress Timeline</p>
                  <div className="space-y-3">
                    {progress.map(p => (
                      <div key={p.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{p.label}</span>
                          <span className="font-medium">{p.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#1A73E8] h-1.5 rounded-full" style={{ width: `${p.percent}%` }}></div>
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
              status={ventureState.opportunities?.length ? 'Completed' : 'Ready'}
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
          <Card className="bg-[#E8F0FE] border-blue-100">
            <CardHeader>
              <CardTitle className="text-[#1A73E8] flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Next Best Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!ventureState.opportunities?.length ? (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-50 text-sm flex items-start gap-3 cursor-pointer hover:border-blue-200" onClick={() => discoverOpportunities(currentProject.id)}>
                  <Search className="w-5 h-5 text-[#1A73E8] mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Discover Opportunities</p>
                    <p className="text-gray-500 text-xs mt-0.5">Let AI scan the market based on your profile.</p>
                  </div>
                </div>
              ) : !ventureState.businessPlan ? (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-50 text-sm flex items-start gap-3 cursor-pointer hover:border-blue-200" onClick={() => useStore.setState({ activeTab: 'business-plan' })}>
                  <FileText className="w-5 h-5 text-[#1A73E8] mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Build Business Strategy</p>
                    <p className="text-gray-500 text-xs mt-0.5">Generate your Lean Canvas and Model.</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-50 text-sm flex items-start gap-3 cursor-pointer hover:border-blue-200" onClick={() => useStore.setState({ activeTab: 'marketing' })}>
                  <Megaphone className="w-5 h-5 text-[#1A73E8] mt-0.5" />
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
