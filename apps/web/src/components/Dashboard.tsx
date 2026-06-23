'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Briefcase, DollarSign, Clock, ShieldAlert, Users, Target, Rocket, Plus,
  Lightbulb, Sparkles, Pencil, MapPin, Loader2, ChevronRight
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
    resetToDashboard
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

    // Process comma separated lists
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
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome to Creator Engine
          </h1>
          <p className="text-slate-500 mt-1">Initialize a venture project to build business plans, roadmap, branding, and marketing assets.</p>
        </div>

        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Your Ventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <Card 
                  key={proj.id} 
                  onClick={() => selectProject(proj.id)}
                  className="p-5 border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all bg-white flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center font-bold text-sm transition-colors">
                      {proj.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{proj.name}</h3>
                      <p className="text-xs text-slate-400 capitalize">{proj.status || 'Draft'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-2xl bg-white max-w-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-500" />
            Create a New Venture
          </h2>
          <p className="text-sm text-slate-500 mb-6">Enter a name to set up a new project workspace.</p>
          
          <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Project Name</label>
              <input
                required
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Acme SaaS, Green Energy Analytics"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !projectName.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Project
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // 2. PROJECT SELECTED BUT NO FOUNDER PROFILE ANALYZED YET
  if (!ventureState?.founderProfile) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            {currentProject.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">ACTIVE VENTURE</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentProject.name}</h1>
          </div>
        </div>

        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-2xl bg-white space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
              Set Up Your Founder Profile
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Provide some context about your skills, resources, and goals. Our AI will analyze your founder profile to recommend tailored opportunities and business strategies.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm text-slate-600 font-medium animate-pulse">{loadingMessage || 'Analyzing Founder Profile...'}</p>
            </div>
          ) : (
            <form onSubmit={handleAnalyzeFounderSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COLUMN 1 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">1. Skills & Background</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Skills (comma separated)</label>
                    <input
                      required
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g. Marketing, Python, Sales"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Experience Level</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Industry Interests (comma separated)</label>
                    <input
                      required
                      type="text"
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      placeholder="e.g. SaaS, E-commerce, Fintech"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Startup Goals</label>
                    <input
                      required
                      type="text"
                      value={formData.startupGoals}
                      onChange={(e) => setFormData({...formData, startupGoals: e.target.value})}
                      placeholder="e.g. Build a lifestyle business, Change the world"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* COLUMN 2 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">2. Resources & Constraints</h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Budget ($)</label>
                    <input
                      required
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Location</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Cairo, Egypt"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Available Time</label>
                    <select
                      value={formData.availableTime}
                      onChange={(e) => setFormData({...formData, availableTime: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="Part-time (10-20 hrs/wk)">Part-time (10-20 hrs/wk)</option>
                      <option value="Full-time (40+ hrs/wk)">Full-time (40+ hrs/wk)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Risk Tolerance</label>
                    <select
                      value={formData.riskTolerance}
                      onChange={(e) => setFormData({...formData, riskTolerance: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="Low (Bootstrapped, profitable from day 1)">Low (Bootstrapped, profitable from day 1)</option>
                      <option value="Medium (Willing to invest savings)">Medium (Willing to invest savings)</option>
                      <option value="High (VC trajectory, high risk/reward)">High (VC trajectory, high risk/reward)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Team Size</label>
                    <select
                      value={formData.teamSize}
                      onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="Solo">Solo Founder</option>
                      <option value="2-3 Cofounders">2-3 Cofounders</option>
                      <option value="Small Team (4-10)">Small Team (4-10)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => resetToDashboard()}
                  className="rounded-xl px-5 font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Change Project
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-semibold shadow-sm text-sm"
                >
                  Analyze Founder Profile
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    );
  }

  // 3. FULL ACTIVE DASHBOARD
  const { founderProfile } = ventureState;

  const handleDiscover = async () => {
    await discoverOpportunities(currentProject.id);
  };

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight">
            Founder Profile
          </h1>
          <p className="text-slate-500 mt-1">Based on your onboarding analysis, here is your founder archetype and strengths.</p>
        </div>
        <Button 
          onClick={handleDiscover}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-semibold shadow-sm text-sm flex items-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Discover Opportunities
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Your Archetype</h3>
                <h2 className="text-3xl font-bold text-emerald-600 mt-2">{founderProfile.founderType || 'Visionary Hustler'}</h2>
              </div>
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {founderProfile.strengths?.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Weaknesses</h4>
                <div className="flex flex-wrap gap-2">
                  {founderProfile.weaknesses?.map((w, i) => (
                    <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 text-sm rounded-full font-medium">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recommended Models & Industries</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Startup Types:</h4>
                <div className="flex gap-2">
                  {founderProfile.recommendedStartupTypes?.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Business Models:</h4>
                <div className="flex gap-2">
                  {founderProfile.recommendedBusinessModels?.map((m, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-md">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white space-y-5">
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Input Parameters</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Budget</p>
                  <p className="font-medium text-slate-800">${founderProfile.budget}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Experience</p>
                  <p className="font-medium text-slate-800">{founderProfile.experience}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Time</p>
                  <p className="font-medium text-slate-800">{founderProfile.availableTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Risk</p>
                  <p className="font-medium text-slate-800">{founderProfile.riskTolerance}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Goals</p>
                  <p className="font-medium text-slate-800 truncate w-[180px]" title={founderProfile.startupGoals}>{founderProfile.startupGoals}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
