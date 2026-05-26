'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Compass, Calendar, DollarSign, Wrench, CheckSquare, Clock } from 'lucide-react';

export default function RoadmapPanel() {
  const { currentOutputs } = useStore();

  if (!currentOutputs || !currentOutputs.roadmap) {
    return <div className="text-slate-400 text-sm">No execution roadmap loaded.</div>;
  }

  const { roadmap } = currentOutputs;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Dashboard Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 glass-panel p-6 rounded-2xl border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{roadmap.totalDurationWeeks} Weeks</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Duration to MVP</div>
          </div>
        </div>

        <div className="flex-1 glass-panel p-6 rounded-2xl border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">${roadmap.totalEstimatedBudget}</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Estimated Budget</div>
          </div>
        </div>
      </div>

      {/* Timeline Milestones Cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Compass className="w-5 h-5 text-slate-400" /> Execution Milestones
        </h2>

        <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
          {roadmap.milestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative">
              {/* Timeline Indicator Ring */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border border-blue-500 bg-[#040814] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              </div>

              {/* Milestone Box */}
              <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      Phase {idx + 1}
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {milestone.title}
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-slate-300 border border-white/10 bg-white/[0.02] px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {milestone.durationWeeks} Weeks
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-1 rounded-lg flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" /> ${milestone.estimatedCost}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {milestone.description}
                </p>

                {/* Tasks List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> Action Checklist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {milestone.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="p-3 rounded-lg border border-white/5 bg-slate-950/20 text-xs text-slate-300 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Tools */}
                {milestone.toolRecommendations && milestone.toolRecommendations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" /> Recommended Launch Stack
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.toolRecommendations.map((tool, rIdx) => (
                        <span key={rIdx} className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-white/5 px-2.5 py-1 rounded-lg">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
