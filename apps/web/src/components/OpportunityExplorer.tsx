'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Radar, Trophy, Users, Zap, TrendingUp, CheckCircle, Loader2, SplitSquareHorizontal, ArrowLeft } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

export default function OpportunityExplorer() {
  const { currentProject, opportunities, selectOpportunity, loading, loadingMessage } = useStore();
  const [selectedToCompare, setSelectedToCompare] = React.useState<string[]>([]);
  const [isComparing, setIsComparing] = React.useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">{loadingMessage || 'Discovering Opportunities...'}</h2>
          <p className="text-slate-500 mt-2">Our AI is analyzing the market against your founder profile.</p>
        </div>
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-semibold text-slate-400">No opportunities found yet.</h2>
      </div>
    );
  }

  const handleSelect = async (opportunityId: string) => {
    if (!currentProject) return;
    await selectOpportunity(currentProject.id, opportunityId);
  };

  const toggleCompare = (id: string) => {
    setSelectedToCompare(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  if (isComparing) {
    const comparingOpps = opportunities.filter(o => selectedToCompare.includes(o.id));
    return (
      <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <Button variant="ghost" onClick={() => setIsComparing(false)} className="mb-4 text-slate-500 hover:text-slate-800 -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
          </Button>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <SplitSquareHorizontal className="text-emerald-500" />
            Compare Opportunities
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparingOpps.map((opp) => (
            <Card key={opp.id} className="p-6 border-slate-200 shadow-sm rounded-xl bg-white flex flex-col h-full">
              <div className="flex-1 space-y-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">{opp.title}</h2>
                <p className="text-slate-600 text-sm">{opp.description}</p>
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Startup Cost</span><span className="font-medium text-slate-900">{opp.startupCost}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Est. Revenue</span><span className="font-medium text-emerald-600">{opp.estimatedRevenue}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Difficulty</span><span className="font-medium text-slate-900">{opp.difficulty}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Time to MVP</span><span className="font-medium text-slate-900">{opp.timeToMVP}</span></div>
                </div>
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500"/> Opp Score</span><span className="font-bold text-slate-900">{opp.opportunityScore}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500"/> Founder Fit</span><span className="font-bold text-slate-900">{opp.founderFitScore}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500"/> Market Demand</span><span className="font-bold text-slate-900">{opp.marketDemandScore}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-500"/> AI Advantage</span><span className="font-bold text-slate-900">{opp.aiAdvantageScore}</span></div>
                </div>
              </div>
              <Button onClick={() => handleSelect(opp.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-auto">
                <CheckCircle className="w-4 h-4 mr-2" /> Select this idea
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <Radar className="text-emerald-500" />
            Opportunity Explorer
          </h1>
          <p className="text-slate-500 mt-1">Select the best business opportunity tailored to your profile.</p>
        </div>
        {selectedToCompare.length > 1 && (
          <Button onClick={() => setIsComparing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <SplitSquareHorizontal className="w-4 h-4 mr-2" />
            Compare {selectedToCompare.length}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {opportunities.map((opp, idx) => (
          <Card key={opp.id || idx} className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white hover:border-emerald-200 transition-colors">
            <div className="flex flex-col md:flex-row gap-8 justify-between">
              
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <Checkbox 
                    checked={selectedToCompare.includes(opp.id)} 
                    onCheckedChange={() => toggleCompare(opp.id)} 
                    className="mt-1.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{opp.title}</h2>
                    <p className="text-slate-600 mt-2">{opp.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Startup Cost</p>
                    <p className="font-medium text-slate-800">{opp.startupCost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Est. Revenue</p>
                    <p className="font-medium text-slate-800 text-emerald-600">{opp.estimatedRevenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Difficulty</p>
                    <p className="font-medium text-slate-800">{opp.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Time to MVP</p>
                    <p className="font-medium text-slate-800">{opp.timeToMVP}</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 flex flex-col justify-between space-y-4 bg-slate-50 p-4 rounded-xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Trophy className="w-4 h-4 text-amber-500"/> Opportunity</span>
                    <span className="font-bold text-slate-900">{opp.opportunityScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Users className="w-4 h-4 text-blue-500"/> Founder Fit</span>
                    <span className="font-bold text-slate-900">{opp.founderFitScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium"><TrendingUp className="w-4 h-4 text-emerald-500"/> Market Demand</span>
                    <span className="font-bold text-slate-900">{opp.marketDemandScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Zap className="w-4 h-4 text-purple-500"/> AI Advantage</span>
                    <span className="font-bold text-slate-900">{opp.aiAdvantageScore}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSelect(opp.id)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Select this idea
                </Button>
              </div>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
