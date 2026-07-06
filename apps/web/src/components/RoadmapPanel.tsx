'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Compass, Calendar, DollarSign, CheckSquare, Clock,
  Zap, Target, ChevronDown, ChevronUp, RefreshCw,
  Rocket, Map, BarChart3, CheckCircle2, Circle, Sparkles,
  TrendingUp, Shield, Layers, AlertCircle, Banknote
} from 'lucide-react';

import { useI18n } from '../lib/i18n/I18nContext';

/** Format a number with Egyptian currency display */
function formatEGP(amount: number | undefined | null, currency: string = 'EGP', locale: string = 'en'): string {
  if (amount === undefined || amount === null) return '—';
  if (locale === 'ar') {
    const sym = currency === 'EGP' ? 'ج.م' : currency;
    return `${Number(amount).toLocaleString('ar-EG')} ${sym}`;
  } else {
    const sym = currency === 'EGP' ? 'EGP' : currency;
    return `${sym} ${Number(amount).toLocaleString('en-US')}`;
  }
}
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, fadeIn } from '../lib/motion-presets';
import { authClient } from '../lib/authClient';

function EmptyRoadmap() {
  const { currentProject, loading, generateRoadmap } = useStore();

  const handleGenerate = () => {
    if (currentProject) {
      generateRoadmap(currentProject.id);
    }
  };

  const features = [
    { icon: Map, color: 'text-emerald-500', bg: 'bg-[#e4f3ee]', label: '90-Day Execution Plan', desc: 'Phased milestones with clear deliverables' },
    { icon: Target, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Market-Specific Tasks', desc: 'Tailored to your chosen business model' },
    { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Budget Estimates', desc: 'Per-phase cost breakdown & totals' },
    { icon: BarChart3, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Priority Scoring', desc: 'AI-ranked tasks by impact & urgency' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-3xl"
      >
        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-900 p-10 mb-6 shadow-2xl">
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm mb-6 shadow-xl">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Execution Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Build Your 90-Day<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                Launch Roadmap
              </span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-lg mx-auto mb-8">
              Transform your business plan into a prioritized, week-by-week execution plan with tasks, budgets, and milestones — all tailored to your market.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="group relative inline-flex items-center gap-3 bg-white text-slate-900 font-bold px-10 py-4 rounded-2xl text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />}
              {loading ? 'Generating Roadmap...' : 'Generate Execution Roadmap'}
              {!loading && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-75" />}
            </button>
            <p className="text-slate-500 text-xs mt-4">Uses 30 credits · Takes ~20 seconds</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{f.label}</div>
                <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

function PhaseCard({ phase, idx, totalPhases, onTaskToggle }: {
  phase: any;
  idx: number;
  totalPhases: number;
  onTaskToggle: (phaseIdx: number, taskId: string, currentStatus: string) => void;
}) {
  const [expanded, setExpanded] = useState(idx === 0);

  const tasks: any[] = Array.isArray(phase.tasks) ? phase.tasks : [];
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const phaseColors = [
    { dot: 'bg-emerald-500', border: 'border-[#ccede3]', badgeBg: 'bg-[#e4f3ee]', badgeText: 'text-emerald-700', badgeBorder: 'border-[#ccede3]', bar: 'bg-emerald-500', ring: 'border-emerald-500', iconBg: 'bg-[#e4f3ee]', iconText: 'text-emerald-500' },
    { dot: 'bg-purple-500', border: 'border-purple-200', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700', badgeBorder: 'border-purple-200', bar: 'bg-purple-500', ring: 'border-purple-500', iconBg: 'bg-purple-50', iconText: 'text-purple-500' },
    { dot: 'bg-emerald-500', border: 'border-emerald-200', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200', bar: 'bg-emerald-500', ring: 'border-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-500' },
    { dot: 'bg-rose-500', border: 'border-rose-200', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700', badgeBorder: 'border-rose-200', bar: 'bg-rose-500', ring: 'border-rose-500', iconBg: 'bg-rose-50', iconText: 'text-rose-500' },
    { dot: 'bg-amber-500', border: 'border-amber-200', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200', bar: 'bg-amber-500', ring: 'border-amber-500', iconBg: 'bg-amber-50', iconText: 'text-amber-500' },
  ];
  const color = phaseColors[idx % phaseColors.length];

  return (
    <motion.div variants={fadeInUp} className="relative">
      {/* Vertical connector line */}
      {idx < totalPhases - 1 && (
        <div className={`absolute left-[11px] top-10 w-0.5 ${color.dot} opacity-20`} style={{ height: 'calc(100% + 1rem)' }} />
      )}

      {/* Timeline dot */}
      <div className={`absolute left-0 top-5 w-6 h-6 rounded-full border-2 ${color.ring} bg-white shadow-sm flex items-center justify-center z-10`}>
        <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
      </div>

      <div className="ml-10">
        <Card className={`rounded-2xl border ${expanded ? color.border : 'border-slate-200'} bg-white overflow-hidden transition-all hover:shadow-md`}>
          {/* Header */}
          <button className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-4" onClick={() => setExpanded(!expanded)}>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${color.badgeBg} ${color.badgeText} ${color.badgeBorder}`}>
                  Phase {idx + 1}
                </span>
                <span className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-lg">
                  {tasks.length} tasks
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{phase.name || `Phase ${idx + 1}`}</h3>

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color.bar} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{completedCount}/{tasks.length} done</span>
                </div>
              )}
            </div>
            <div className="text-slate-400 flex-shrink-0 mt-1">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {/* Expanded tasks */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-5 md:px-6 pb-6 border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckSquare className="w-3.5 h-3.5" /> Action Items
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {tasks.map((task, tIdx) => {
                      const done = task.status === 'done';
                      const priority = task.priority || 'medium';
                      return (
                        <button
                          key={task.id || tIdx}
                          onClick={() => onTaskToggle(idx, task.id, task.status)}
                          className={`w-full text-left p-4 rounded-xl border text-xs flex items-start gap-3 transition-all duration-150 group ${
                            done
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {done
                              ? <CheckCircle2 className={`w-4 h-4 ${color.iconText}`} />
                              : <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold leading-snug mb-1 ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div className={`text-[11px] leading-relaxed ${done ? 'text-slate-400' : 'text-slate-500'}`}>
                                {task.description}
                              </div>
                            )}
                            <div className="mt-2">
                              <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium}`}>
                                {priority}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </motion.div>
  );
}

export default function RoadmapPanel() {
  const { locale } = useI18n();
  const { currentOutputs, currentProject, loading, generateRoadmap } = useStore();
  const [roadmapState, setRoadmapState] = useState<any>(null);

  // Use local state after first render to allow optimistic task toggling
  const roadmap = roadmapState || currentOutputs?.roadmap;

  React.useEffect(() => {
    if (currentOutputs?.roadmap) {
      setRoadmapState(currentOutputs.roadmap);
    }
  }, [currentOutputs?.roadmap]);

  if (!roadmap) {
    return <EmptyRoadmap />;
  }

  // The agent returns `phases` — support both `phases` and legacy `milestones`
  const phases: any[] = Array.isArray(roadmap.phases) && roadmap.phases.length > 0
    ? roadmap.phases
    : Array.isArray(roadmap.milestones) && roadmap.milestones.length > 0
      ? roadmap.milestones
      : [];

  const totalTasks = phases.reduce((acc, p) => acc + (Array.isArray(p.tasks) ? p.tasks.length : 0), 0);
  const totalDone = phases.reduce((acc, p) => acc + (Array.isArray(p.tasks) ? p.tasks.filter((t: any) => t.status === 'done').length : 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const handleTaskToggle = async (phaseIdx: number, taskId: string, currentStatus: string) => {
    if (!taskId || !currentProject) return;
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';

    // Optimistic update
    setRoadmapState((prev: any) => {
      if (!prev) return prev;
      const updatedPhases = prev.phases.map((phase: any, pIdx: number) => {
        if (pIdx !== phaseIdx) return phase;
        return {
          ...phase,
          tasks: phase.tasks.map((t: any) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        };
      });
      return { ...prev, phases: updatedPhases };
    });

    // Persist to API
    try {
      await authClient.patch(`/execution/task/${taskId}`, {
        projectId: currentProject.id,
        status: newStatus
      });
    } catch (e) {
      console.error('Failed to update task status', e);
    }
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit"
      className="p-6 md:p-10 max-w-[900px] mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900">Execution Roadmap</h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              🇪🇬 Egypt · EGP
            </span>
          </div>
          <p className="text-sm text-slate-500">Your AI-generated go-to-market launch plan — priced in Egyptian Pounds</p>
        </div>
        <button
          onClick={() => currentProject && generateRoadmap(currentProject.id)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-300 hover:shadow-sm transition-all active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* Stats Strip */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock, bg: 'bg-[#e4f3ee]', border: 'border-[#d9eee8]', iconColor: 'text-emerald-500', value: `${roadmap.totalDurationWeeks ?? '—'} Weeks`, label: 'Total Duration' },
          { icon: Banknote, bg: 'bg-emerald-50', border: 'border-emerald-100', iconColor: 'text-emerald-500', value: formatEGP(roadmap.totalEstimatedBudget, roadmap.currency, locale), label: 'Est. Budget' },
          { icon: Layers, bg: 'bg-purple-50', border: 'border-purple-100', iconColor: 'text-purple-500', value: `${phases.length}`, label: 'Phases' },
          { icon: CheckSquare, bg: 'bg-rose-50', border: 'border-rose-100', iconColor: 'text-rose-500', value: `${totalTasks}`, label: 'Action Items' },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Card className={`p-4 rounded-2xl border ${stat.border} ${stat.bg} flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <div className="text-lg font-black text-slate-900 leading-none">{stat.value}</div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Overall progress */}
      {totalTasks > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-700">Overall Progress</span>
              <span className="text-sm font-black text-slate-900">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#008465] to-[#00b37e] rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 whitespace-nowrap">
            <div className="font-black text-slate-800 text-lg">{totalDone}<span className="text-slate-400 font-normal">/{totalTasks}</span></div>
            tasks done
          </div>
        </div>
      )}

      {/* Phase Timeline */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-slate-700 flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          Execution Phases
          <span className="text-xs text-slate-400 font-normal">— click a phase to expand / collapse · click a task to mark done</span>
        </h2>

        {phases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No phases found in this roadmap.</p>
            <p className="text-slate-400 text-sm mt-1">Try regenerating your roadmap.</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="relative pl-3 space-y-4">
            {phases.map((phase, idx) => (
              <PhaseCard
                key={phase.id || idx}
                phase={phase}
                idx={idx}
                totalPhases={phases.length}
                onTaskToggle={handleTaskToggle}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
        <Shield className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>Click any task to toggle it as complete. Progress is saved to your venture. Roadmap is tailored to your specific market context.</span>
      </div>
    </motion.div>
  );
}
