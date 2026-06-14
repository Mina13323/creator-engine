import React from 'react';
import { useStore } from '../store/useStore';
import { Radar, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompetitorDashboard() {
  const { currentOutputs } = useStore();
  const competitorsData = currentOutputs?.marketResearch?.competitorAnalysis;

  if (!competitorsData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Radar className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-medium">No Competitor Data Available</h2>
        <p className="text-sm mt-2">Generate a project to see competitor insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Competitor Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">Discover market landscape and evaluate existing players based on AI insights.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            Competitive Landscape
          </h3>
        </div>

        <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
          {competitorsData || "No competitor analysis available."}
        </div>
      </motion.div>
    </div>
  );
}
