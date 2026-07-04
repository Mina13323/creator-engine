'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Lightbulb, Sparkles, Pencil, MapPin, Globe, DollarSign,
  FileText, BarChart, Store, CheckCircle, ChevronLeft, Loader2,
  Briefcase, Clock, ShieldAlert, Users, Target
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { OnboardingData } from '@creator/types';

export default function Onboarding() {
  const { createProject, analyzeFounder, loading, loadingMessage, setAuthModalOpen, user } = useStore();

  const [step, setStep] = useState(0); // 0: Project Name, 1: Skills, 2: Resources, 3: Goals
  const [projectName, setProjectName] = useState('');
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    skills: [],
    experience: '',
    industryInterests: [],
    budget: 5000,
    location: '',
    availableTime: '',
    startupGoals: '',
    riskTolerance: '',
    teamSize: 'Solo'
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  const handleNextStep = async () => {
    if (step === 0) {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      if (!projectName.trim()) return;
      const pid = await createProject(projectName);
      setCreatedProjectId(pid);
      setStep(1);
    } else {
      setStep(step + 1);
    }
  };

  const handleLaunch = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    if (!createdProjectId) {
      console.error('No project created');
      return;
    }
    
    // Process comma separated lists
    const finalData = {
      ...formData,
      skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      industryInterests: industryInput.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (finalData.skills.length === 0) finalData.skills = ['Management'];
    if (finalData.industryInterests.length === 0) finalData.industryInterests = ['SaaS'];

    await analyzeFounder(createdProjectId, finalData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center pt-24 p-6 font-sans">
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="w-5 h-5 flex gap-1">
            <div className="w-1/2 h-full bg-emerald-500 rounded-sm skew-x-12"></div>
            <div className="w-1/2 h-full bg-emerald-500 rounded-sm -skew-x-12"></div>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">CEO</span>
        </div>
        <div className="w-full max-w-xl text-center space-y-6 mt-12">
          <div className="flex justify-center gap-4 text-emerald-500 mb-6">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
          <h1 className="text-2xl font-medium text-slate-900 mb-10">{loadingMessage || 'Analyzing Founder Profile...'}</h1>
        </div>
      </div>
    );
  }

  const renderStepIcon = () => {
    if (step === 0) return <div className="flex justify-center gap-4 text-emerald-600 mb-8"><Briefcase className="w-5 h-5" /></div>;
    if (step === 1) return <div className="flex justify-center gap-4 text-emerald-600 mb-8"><Briefcase className="w-5 h-5" /><Pencil className="w-5 h-5" /></div>;
    if (step === 2) return <div className="flex justify-center gap-4 text-indigo-500 mb-8"><DollarSign className="w-5 h-5" /><MapPin className="w-5 h-5" /></div>;
    if (step === 3) return <div className="flex justify-center gap-4 text-rose-500 mb-8"><Target className="w-5 h-5" /><ShieldAlert className="w-5 h-5" /></div>;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative font-sans">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-5 h-5 flex gap-1">
          <div className="w-1/2 h-full bg-emerald-500 rounded-sm skew-x-12"></div>
          <div className="w-1/2 h-full bg-emerald-500 rounded-sm -skew-x-12"></div>
        </div>
        <span className="font-bold text-lg text-slate-900 tracking-tight">Creator Engine</span>
      </div>

      <div className="absolute top-6 right-6">
        {!user ? (
          <Button onClick={() => setAuthModalOpen(true)} variant="ghost" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:bg-emerald-50">Login</Button>
        ) : (
          <span className="text-emerald-700 font-medium text-sm">Logged in as {user.name || user.email}</span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {renderStepIcon()}
          
          <div className="relative">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="absolute left-0 top-1 text-slate-400 hover:text-slate-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-2xl font-medium text-center text-slate-900 mb-6">
              {step === 0 && "Name your new project"}
              {step === 1 && "What is your background?"}
              {step === 2 && "What are your resources?"}
              {step === 3 && "What are your goals?"}
            </h1>
          </div>

          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Project Name</label>
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Acme Startup, Future Tech" className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200" />
              </div>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Skills (comma separated)</label>
                  <Input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g. Marketing, Python, Sales" className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Experience Level</label>
                  <Select value={formData.experience} onValueChange={(v) => setFormData({...formData, experience: v || ''})}>
                    <SelectTrigger className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200"><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Industry Interests (comma separated)</label>
                  <Input value={industryInput} onChange={(e) => setIndustryInput(e.target.value)} placeholder="e.g. E-commerce, AI, Local Services" className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Budget ($)</label>
                  <Input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Cairo, Egypt" className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Team Size</label>
                  <Select value={formData.teamSize} onValueChange={(v) => setFormData({...formData, teamSize: v || ''})}>
                    <SelectTrigger className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200"><SelectValue placeholder="Select team size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo">Solo Founder</SelectItem>
                      <SelectItem value="2-3 Cofounders">2-3 Cofounders</SelectItem>
                      <SelectItem value="Small Team (4-10)">Small Team (4-10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Available Time</label>
                  <Select value={formData.availableTime} onValueChange={(v) => setFormData({...formData, availableTime: v || ''})}>
                    <SelectTrigger className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200"><SelectValue placeholder="Select time" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Part-time (10-20 hrs/wk)">Part-time (10-20 hrs/wk)</SelectItem>
                      <SelectItem value="Full-time (40+ hrs/wk)">Full-time (40+ hrs/wk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Risk Tolerance</label>
                  <Select value={formData.riskTolerance} onValueChange={(v) => setFormData({...formData, riskTolerance: v || ''})}>
                    <SelectTrigger className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200"><SelectValue placeholder="Select risk" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low (Bootstrapped, profitable from day 1)">Low (Bootstrapped, profitable from day 1)</SelectItem>
                      <SelectItem value="Medium (Willing to invest savings)">Medium (Willing to invest savings)</SelectItem>
                      <SelectItem value="High (VC trajectory, high risk/reward)">High (VC trajectory, high risk/reward)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Startup Goals</label>
                  <Input value={formData.startupGoals} onChange={(e) => setFormData({...formData, startupGoals: e.target.value})} placeholder="e.g. Build a lifestyle business, Change the world" className="w-full rounded-xl py-6 px-4 bg-slate-50 border-slate-200" />
                </div>
              </>
            )}
          </div>

          <div className="pt-8 flex justify-center">
            {step < 3 ? (
              <Button onClick={handleNextStep} disabled={step === 0 && !projectName.trim()} className="w-full sm:w-auto min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-base font-semibold">
                Continue
              </Button>
            ) : (
              <Button onClick={handleLaunch} className="w-full sm:w-auto min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-base font-semibold">
                Analyze Founder Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
