'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Briefcase, ArrowRight, Plus, Calendar, Compass, BarChart4 } from 'lucide-react';

export default function Dashboard() {
  const { projects, selectProject, startNewVenture } = useStore();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Metric Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Venture Dashboard</h1>
          <p className="text-slate-400 text-sm">Select a venture project workspace or start generating a new business strategy.</p>
        </div>
        <button
          onClick={startNewVenture}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 self-start"
        >
          <Plus className="w-4 h-4" /> New Venture
        </button>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-xs text-slate-400 font-medium">Total Ventures Built</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <BarChart4 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">84%</div>
            <div className="text-xs text-slate-400 font-medium">Avg Feasibility Score</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Compass className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Active</div>
            <div className="text-xs text-slate-400 font-medium">AI Cofounder Memory state</div>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200">Active Dossiers</h2>
        
        {projects.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl border-white/5 text-center">
            <p className="text-slate-400 text-sm mb-4">No venture projects generated yet. Let&apos;s create one!</p>
            <button
              onClick={startNewVenture}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold transition-colors"
            >
              Run Onboarding Survey
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => selectProject(project.id)}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border-white/5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {project.industry}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs font-semibold text-blue-400">Launch dossier complete</span>
                  <div className="text-xs text-slate-400 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                    Open Workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}