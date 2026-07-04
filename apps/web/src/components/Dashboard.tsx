'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Briefcase, DollarSign, Clock, ShieldAlert, Users, Target, Rocket, Plus,
  Lightbulb, Sparkles, Pencil, MapPin, Loader2, ChevronRight
} from 'lucide-react';
import { useI18n } from '../lib/i18n/I18nContext';

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
    resetToDashboard
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
            {t('dashboard.welcome')}
          </h1>
          <p className="text-slate-500 mt-1">{t('dashboard.initialize')}</p>
        </div>

        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.yourVentures')}</h2>
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
                      <p className="text-xs text-slate-400 capitalize">{proj.status === 'active' ? t('dashboard.active') : t('dashboard.draft')}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-2xl bg-white max-w-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-500" />
            {t('dashboard.createNew')}
          </h2>
          <p className="text-sm text-slate-500 mb-6">{t('dashboard.enterName')}</p>
          
          <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t('dashboard.projectName')}</label>
              <input
                required
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t('dashboard.projectNamePlaceholder')}
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
                  {t('dashboard.creating')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t('dashboard.createProject')}
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
              {t('founderProfile.setupTitle')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('founderProfile.setupSubtitle')}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm text-slate-600 font-medium animate-pulse">{translatedLoadingMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleAnalyzeFounderSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COLUMN 1 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('founderProfile.skillsBackground')}</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.skills')}</label>
                    <input
                      required
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder={t('founderProfile.skillsPlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.experienceLevel')}</label>
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
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.industryInterests')}</label>
                    <input
                      required
                      type="text"
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      placeholder={t('founderProfile.industryPlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.startupGoals')}</label>
                    <input
                      required
                      type="text"
                      value={formData.startupGoals}
                      onChange={(e) => setFormData({...formData, startupGoals: e.target.value})}
                      placeholder={t('founderProfile.goalsPlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* COLUMN 2 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('founderProfile.resourcesConstraints')}</h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.budget')}</label>
                    <input
                      required
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.location')}</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder={t('founderProfile.locationPlaceholder')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.availableTime')}</label>
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
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.riskTolerance')}</label>
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
                    <label className="text-xs font-semibold text-slate-600">{t('founderProfile.teamSize')}</label>
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
                  {t('founderProfile.changeProject')}
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-semibold shadow-sm text-sm"
                >
                  {t('founderProfile.analyzeBtn')}
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
            {t('founderProfile.profileTitle')}
          </h1>
          <p className="text-slate-500 mt-1">{t('founderProfile.profileSubtitle')}</p>
        </div>
        <Button 
          onClick={handleDiscover}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-semibold shadow-sm text-sm flex items-center gap-2"
        >
          <Rocket className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {t('opportunities.discoverBtn')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-800">{t('founderProfile.yourArchetype')}</h3>
                </div>
                <h2 className="text-3xl font-bold text-emerald-600 mt-2">{founderProfile.founderType || 'Visionary Hustler'}</h2>
              </div>
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('founderProfile.strengths')}</h4>
                <div className="flex flex-wrap gap-2">
                  {founderProfile.strengths?.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('founderProfile.weaknesses')}</h4>
                <div className="flex flex-wrap gap-2">
                  {founderProfile.weaknesses?.map((w, i) => (
                    <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 text-sm rounded-full font-medium">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('founderProfile.recommendedModels')}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">{t('founderProfile.startupTypes')}</h4>
                <div className="flex gap-2">
                  {founderProfile.recommendedStartupTypes?.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">{t('founderProfile.businessModels')}</h4>
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
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">{t('founderProfile.inputParameters')}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{t('founderProfile.budgetLabel')}</p>
                  <p className="font-medium text-slate-800">${founderProfile.budget}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{t('founderProfile.experienceLabel')}</p>
                  <p className="font-medium text-slate-800">{founderProfile.experience}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{t('founderProfile.timeLabel')}</p>
                  <p className="font-medium text-slate-800">{founderProfile.availableTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{t('founderProfile.riskLabel')}</p>
                  <p className="font-medium text-slate-800">{founderProfile.riskTolerance}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{t('founderProfile.goalsLabel')}</p>
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
