'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function BusinessBuilder() {
  const { currentOutputs } = useStore();

  if (!currentOutputs || !currentOutputs.idea || !currentOutputs.validation || !currentOutputs.strategy) {
    return <div className="text-slate-400 text-sm">No venture details loaded.</div>;
  }

  const { idea, validation, strategy } = currentOutputs;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Pitch Deck Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Idea Match Score: {idea.score}%
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3">{idea.title}</h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mb-6">{idea.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Monetization Mechanisms</h3>
            <div className="flex flex-wrap gap-2">
              {idea.monetization.map((m, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {m}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Competency Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {idea.skillsRequired.map((s, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric Scores */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between">
          <h2 className="text-base font-bold text-slate-200 mb-6">Market Validation Scoring</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Feasibility Index</span>
                <span className="text-emerald-400">{validation.feasibilityScore}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full shadow-lg shadow-emerald-500/50" style={{ width: `${validation.feasibilityScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Demand Strength</span>
                <span className="text-blue-400">{validation.marketDemandScore}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full shadow-lg shadow-blue-500/50" style={{ width: `${validation.marketDemandScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Risk & Complexity</span>
                <span className="text-red-400">{validation.riskScore}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full shadow-lg shadow-red-500/50" style={{ width: `${validation.riskScore}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-normal">
              Scores generated by comparing regional databases and target location constraints.
            </div>
          </div>
        </div>

        {/* Competitor Map */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Competitive Gaps Map</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validation.competitors.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{comp.name}</h4>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold">
                    Market Share: {comp.marketShare}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">Strengths</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {comp.strengths.map((str, sIdx) => <li key={sIdx}>{str}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 block mb-1">Gaps / Weaknesses</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {comp.weaknesses.map((weak, wIdx) => <li key={wIdx}>{weak}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lean Canvas Strategy Matrix */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Lean Canvas Strategy Matrix</h2>
            <p className="text-slate-400 text-xs mt-0.5">The fundamental 9-box business model visualization.</p>
          </div>
          <span className="text-xs text-blue-400 font-semibold border border-blue-500/20 bg-blue-500/10 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Structured Output
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Column 1: Problem & Key Metrics */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 flex-1 min-h-[160px]">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">1. The Problem</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {strategy.leanCanvas.problem.map((p, idx) => <li key={idx} className="flex gap-1.5"><span>•</span><span>{p}</span></li>)}
              </ul>
            </div>
            <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 flex-1 min-h-[120px]">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">8. Key Metrics</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {strategy.leanCanvas.keyMetrics.map((m, idx) => <li key={idx} className="flex gap-1.5"><span>•</span><span>{m}</span></li>)}
              </ul>
            </div>
          </div>

          {/* Column 2: Solution & Channels */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 flex-1 min-h-[160px]">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">2. Solution</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {strategy.leanCanvas.solution.map((s, idx) => <li key={idx} className="flex gap-1.5"><span>•</span><span>{s}</span></li>)}
              </ul>
            </div>
            <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 flex-1 min-h-[120px]">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">4. Channels</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {strategy.leanCanvas.channels.map((c, idx) => <li key={idx} className="flex gap-1.5"><span>•</span><span>{c}</span></li>)}
              </ul>
            </div>
          </div>

          {/* Column 3: Unique Value Prop */}
          <div className="md:col-span-1 glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 min-h-[300px] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">3. Unique Value Proposition</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                {strategy.leanCanvas.uniqueValueProposition}
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-[10px] text-slate-400">
              High-level concept: The core message that sets you apart.
            </div>
          </div>

          {/* Column 4: Unfair Advantage */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 flex-1 min-h-[160px]">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">9. Unfair Advantage</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {strategy.leanCanvas.unfairAdvantage}
              </p>
            </div>
            <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 flex-1 min-h-[120px] bg-emerald-500/5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Pricing Strategy</h3>
              <p className="text-[11px] text-slate-300 leading-normal">
                {strategy.pricingStrategy}
              </p>
            </div>
          </div>

          {/* Column 5: Customer Segments */}
          <div className="md:col-span-1 glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 min-h-[300px] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">5. Customer Segments</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {strategy.leanCanvas.customerSegments.map((cs, idx) => <li key={idx} className="flex gap-1.5"><span>•</span><span>{cs}</span></li>)}
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5 text-[10px] text-slate-400">
              Target early adopters for launch.
            </div>
          </div>
        </div>

        {/* Structure: Cost & Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
          <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 min-h-[100px]">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">7. Cost Structure</h3>
            <div className="flex flex-wrap gap-2">
              {strategy.leanCanvas.costStructure.map((c, idx) => (
                <span key={idx} className="text-xs bg-slate-950/60 border border-white/5 px-2.5 py-1 rounded-lg text-slate-400">{c}</span>
              ))}
            </div>
          </div>

          <div className="glass-panel bg-slate-900/20 p-4 rounded-xl border-white/5 min-h-[100px]">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">6. Revenue Streams</h3>
            <div className="flex flex-wrap gap-2">
              {strategy.leanCanvas.revenueStreams.map((r, idx) => (
                <span key={idx} className="text-xs bg-emerald-950/30 border border-emerald-500/10 px-2.5 py-1 rounded-lg text-emerald-300 font-semibold">{r}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
