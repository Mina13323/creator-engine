import React from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, AlertTriangle, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketResearchDashboard() {
  const { currentOutputs } = useStore();
  const validation = currentOutputs?.marketResearch;

  if (!validation) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <FileSearch className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-medium">No Market Research Available</h2>
        <p className="text-sm mt-2">Generate a project to see market insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Market Research & Validation</h1>
          <p className="text-slate-500 text-sm mt-1">Deep dive into market dynamics and validation metrics powered by our specialized agents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-500" />
            Validation Report
          </h3>
          <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
            {validation.validationReport || "No validation report available."}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="font-semibold mb-6 flex items-center gap-2 text-indigo-100">
            <TrendingUp className="w-5 h-5" />
            Trend Analysis & Dynamics
          </h3>
          <div className="text-slate-200 text-sm whitespace-pre-wrap">
            {validation.trendAnalysis || "No trend analysis available."}
          </div>
        </div>
      </div>
    </div>
  );
}
