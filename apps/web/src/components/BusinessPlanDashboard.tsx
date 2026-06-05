'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { FileText, Wand2, Loader2, Target, Lightbulb, Users, DollarSign, Rocket, Briefcase } from 'lucide-react';

export default function BusinessPlanDashboard() {
  const { currentProject, ventureState, generateBusinessPlan, loading, loadingMessage } = useStore();

  if (!currentProject || !ventureState?.selectedOpportunity) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-semibold text-slate-400">Please select an opportunity first.</h2>
      </div>
    );
  }

  const { selectedOpportunity, businessPlan } = ventureState;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">{loadingMessage || 'Generating Business Plan...'}</h2>
          <p className="text-slate-500 mt-2">Compiling Lean Canvas and go-to-market strategy.</p>
        </div>
      </div>
    );
  }

  if (!businessPlan) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Ready to build your plan?</h1>
        <p className="text-lg text-slate-600">
          You have selected <strong>{selectedOpportunity.title}</strong>. 
          Our AI will now generate a comprehensive business plan including a Lean Canvas, 
          revenue model, and go-to-market strategy based on your founder profile.
        </p>
        <div className="pt-8">
          <Button 
            onClick={() => generateBusinessPlan(currentProject.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-md"
          >
            <Wand2 className="w-5 h-5 mr-3" />
            Generate Business Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
          <FileText className="text-emerald-500" />
          Business Plan
        </h1>
        <p className="text-slate-500 mt-1">{selectedOpportunity.title}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Executive Summary */}
        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Executive Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{businessPlan.executiveSummary}</p>
        </Card>

        {/* Core Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-500" />
              Problem Statement
            </h3>
            <p className="text-slate-700">{businessPlan.problemStatement}</p>
          </Card>
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Solution
            </h3>
            <p className="text-slate-700">{businessPlan.solution}</p>
          </Card>
        </div>

        {/* Lean Canvas */}
        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <h2 className="text-xl font-bold mb-8 relative z-10">Lean Canvas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {/* Column 1 */}
            <div className="space-y-4 md:col-span-1 border border-slate-700/50 rounded-lg p-4 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-400 uppercase">Problem</h3>
              <ul className="list-disc pl-4 text-sm space-y-2">
                {businessPlan.leanCanvas.problem.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-4 md:col-span-1 border border-slate-700/50 rounded-lg p-4 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-400 uppercase">Solution</h3>
              <ul className="list-disc pl-4 text-sm space-y-2">
                {businessPlan.leanCanvas.solution.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Key Metrics</h3>
                <ul className="list-disc pl-4 text-sm space-y-1">
                  {businessPlan.leanCanvas.keyMetrics.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4 md:col-span-1 border border-emerald-500/30 rounded-lg p-4 bg-emerald-900/20">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase">Unique Value Prop</h3>
              <p className="text-sm leading-relaxed">{businessPlan.leanCanvas.uniqueValueProposition}</p>
            </div>

            {/* Column 4 */}
            <div className="space-y-4 md:col-span-1 border border-slate-700/50 rounded-lg p-4 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-400 uppercase">Unfair Advantage</h3>
              <p className="text-sm leading-relaxed">{businessPlan.leanCanvas.unfairAdvantage}</p>
              
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Channels</h3>
                <ul className="list-disc pl-4 text-sm space-y-1">
                  {businessPlan.leanCanvas.channels.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>

            {/* Column 5 */}
            <div className="space-y-4 md:col-span-1 border border-slate-700/50 rounded-lg p-4 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-400 uppercase">Customer Segments</h3>
              <ul className="list-disc pl-4 text-sm space-y-2">
                {businessPlan.leanCanvas.customerSegments.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 relative z-10">
            <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Cost Structure</h3>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {businessPlan.leanCanvas.costStructure.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Revenue Streams</h3>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {businessPlan.leanCanvas.revenueStreams.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        </Card>

        {/* Execution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-500" />
              Go-To-Market Strategy
            </h3>
            <p className="text-slate-700">{businessPlan.goToMarketStrategy}</p>
          </Card>
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Revenue & Pricing
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Revenue Model</span>
                <span className="text-slate-800 font-medium">{businessPlan.revenueModel}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Pricing Strategy</span>
                <span className="text-slate-800 font-medium">{businessPlan.pricingStrategy}</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
