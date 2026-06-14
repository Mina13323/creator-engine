'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, CheckCircle2, Target, Lightbulb, CheckSquare } from 'lucide-react';

export default function BusinessBuilder() {
  const { currentOutputs } = useStore();

  if (!currentOutputs || !currentOutputs.businessPlan || !currentOutputs.founderProfile) {
    return <div className="text-slate-400 text-sm">No business plan loaded.</div>;
  }

  const { businessPlan, founderProfile } = currentOutputs;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Pitch Deck Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Core Business Plan
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-3">Business Idea</h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mb-6">{businessPlan.businessIdea}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" /> Target Audience
            </h3>
            <p className="text-slate-400 text-sm">{businessPlan.targetAudience}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Value Proposition
            </h3>
            <p className="text-slate-400 text-sm">{businessPlan.valueProposition}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Revenue Model</h2>
          <div className="flex flex-wrap gap-2">
            {businessPlan.revenueModel.map((m, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {m}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <h2 className="text-base font-bold text-slate-200">MVP Features</h2>
          <div className="space-y-2">
            {businessPlan.mvpFeatures.map((f, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border-white/5">
        <h2 className="text-base font-bold text-slate-200 mb-4">Founder Profile Match</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <span className="block text-xs text-slate-400 mb-1">Industry</span>
            <span className="text-white font-medium capitalize">{founderProfile.industry}</span>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <span className="block text-xs text-slate-400 mb-1">Location</span>
            <span className="text-white font-medium">{founderProfile.location}</span>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <span className="block text-xs text-slate-400 mb-1">Budget</span>
            <span className="text-white font-medium">${founderProfile.budget.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <span className="block text-xs text-slate-400 mb-1">Commitment</span>
            <span className="text-white font-medium capitalize">{founderProfile.commitment}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <h3 className="text-xs text-slate-400 mb-2">Leveraged Skills</h3>
          <div className="flex flex-wrap gap-2">
            {founderProfile.skills.map((s, idx) => (
              <span key={idx} className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
