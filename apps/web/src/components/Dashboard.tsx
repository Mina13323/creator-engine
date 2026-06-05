'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Briefcase, DollarSign, Clock, ShieldAlert, Users, Target, Rocket } from 'lucide-react';

export default function Dashboard() {
  const { currentProject, ventureState, discoverOpportunities, loading, loadingMessage } = useStore();

  if (!currentProject || !ventureState?.founderProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        {loading ? (
          <h2 className="text-xl font-semibold text-slate-500 animate-pulse">{loadingMessage || 'Loading...'}</h2>
        ) : (
          <h2 className="text-xl font-semibold text-slate-400">Loading Founder Profile...</h2>
        )}
      </div>
    );
  }

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
