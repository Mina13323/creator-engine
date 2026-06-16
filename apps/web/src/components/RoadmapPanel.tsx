'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Compass, Calendar, DollarSign, CheckSquare, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, fadeIn } from '../lib/motion-presets';

export default function RoadmapPanel() {
  const { currentOutputs } = useStore();

  if (!currentOutputs || !currentOutputs.roadmap) {
    return <div className="text-slate-400 text-sm p-6 md:p-10 max-w-[1200px] mx-auto">No execution roadmap loaded.</div>;
  }

  const { roadmap } = currentOutputs;

  return (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8"
    >
      {/* Overview Dashboard Row */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col md:flex-row gap-4">
        <motion.div variants={fadeInUp} className="flex-1">
          <Card className="p-6 rounded-2xl border-slate-200 shadow-sm bg-white flex items-center gap-4 relative overflow-hidden hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{roadmap.totalDurationWeeks} Weeks</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Duration to MVP</div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="flex-1">
          <Card className="p-6 rounded-2xl border-slate-200 shadow-sm bg-white flex items-center gap-4 relative overflow-hidden hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">${roadmap.totalEstimatedBudget}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Estimated Budget</div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Timeline Milestones Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Compass className="w-6 h-6 text-slate-500" /> Execution Milestones
        </h2>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-8">
          {roadmap.milestones.map((milestone, idx) => (
            <motion.div variants={fadeInUp} key={idx} className="relative">
              {/* Timeline Indicator Ring */}
              <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center">
              </div>

              {/* Milestone Box */}
              <Card className="p-6 md:p-8 rounded-2xl border-slate-200 shadow-sm bg-white space-y-6 hover:shadow-md transition-all">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      Phase {idx + 1}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                      {milestone.title}
                    </h3>
                  </div>

                  <div className="flex gap-2 mt-2 md:mt-0">
                    <span className="text-[10px] font-bold text-slate-600 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {milestone.durationWeeks} Weeks
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> ${milestone.estimatedCost}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {milestone.description}
                </p>

                {/* Tasks List */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-slate-500" /> Action Checklist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {milestone.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-start gap-2.5 hover:border-slate-300 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                        <span className="leading-relaxed">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
