'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap, DollarSign, TrendingUp, AlertCircle, Building, Server, ArrowRight } from 'lucide-react';
import { authClient } from '../lib/authClient';
import { useStore } from '../store/useStore';

export default function FinancialEngine() {
  const currentProject = useStore(state => state.currentProject);
  const ventureState = useStore(state => state.ventureState);
  
  const [businessIdea, setBusinessIdea] = useState(ventureState?.selectedOpportunity?.description || '');
  const [businessModel, setBusinessModel] = useState('SaaS');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  React.useEffect(() => {
    if (ventureState?.selectedOpportunity && !businessIdea) {
      setBusinessIdea(ventureState.selectedOpportunity.title + ': ' + ventureState.selectedOpportunity.description);
    }
  }, [ventureState?.selectedOpportunity, businessIdea]);

  const handleGenerate = async () => {
    if (!businessIdea) return;
    setLoading(true);
      const response = await fetch('/api/financial-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject?.id || 'demo-project',
          businessIdea,
          businessModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to generate financials', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex gap-1">
              <div className="w-1/2 h-full bg-emerald-500 rounded-sm skew-x-12"></div>
              <div className="w-1/2 h-full bg-emerald-500 rounded-sm -skew-x-12"></div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Financial Engine
            </h1>
          </div>
          <p className="text-slate-500 text-lg">
            AI-driven forecasts and pricing strategies for the Egyptian market.
          </p>
        </div>

        {/* Input Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Business Idea / Product Description</label>
              <textarea 
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="e.g. A marketplace for local Egyptian artisans with InstaPay integration..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all resize-none h-32"
              />
            </div>
            
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Business Model Structure</label>
                <div className="relative">
                  <select 
                    value={businessModel}
                    onChange={(e) => setBusinessModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none appearance-none"
                  >
                    <option value="SaaS">B2B SaaS (Subscription)</option>
                    <option value="Marketplace">Marketplace (Commission)</option>
                    <option value="Agency">Agency (Retainer / Project)</option>
                    <option value="Freemium">Freemium Consumer App</option>
                    <option value="Usage-based">Usage-based API</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !businessIdea}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                    Crunching Data...
                  </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-emerald-400" />
                    Generate Model
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'Startup Capital', icon: Building, value: `EGP ${results.financial.totalStartupCost?.toLocaleString()}` },
                { title: 'Burn Rate (Mo)', icon: Server, value: `EGP ${results.financial.monthlyBurn?.toLocaleString()}` },
                { title: 'Break-even', icon: TrendingUp, value: `Month ${results.financial.breakEvenMonth}`, color: 'text-emerald-600' },
                { title: 'Pricing Model', icon: DollarSign, value: results.pricing.recommendedStrategyType, color: 'text-indigo-600 text-lg' }
              ].map((kpi, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <kpi.icon className="w-4 h-4" /> {kpi.title}
                  </div>
                  <div className={`text-2xl font-bold ${kpi.color || 'text-slate-900'}`}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Financial Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Cost Breakdown */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Calculator className="w-5 h-5 text-indigo-500" />
                    Cost Infrastructure
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">One-time Startup Costs</h4>
                      <div className="space-y-3">
                        {results.financial.startupCosts?.map((cost: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="font-semibold text-slate-800">{cost.category}</p>
                              <p className="text-sm text-slate-500 mt-0.5">{cost.description}</p>
                            </div>
                            <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">
                              EGP {cost.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Monthly Operating Costs</h4>
                      <div className="space-y-3">
                        {results.financial.monthlyCosts?.map((cost: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="font-semibold text-slate-800">{cost.category}</p>
                              <p className="text-sm text-slate-500 mt-0.5">{cost.description}</p>
                            </div>
                            <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">
                              EGP {cost.amount.toLocaleString()}/mo
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Strategy Panel */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Market Pricing
                  </h3>
                  
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6">
                    <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                      {results.pricing.marketPositioningRationale}
                    </p>
                  </div>

                  <div className="space-y-4 flex-1">
                    {results.pricing.priceTiers?.map((tier: any, i: number) => (
                      <div key={i} className={`border rounded-xl p-5 relative overflow-hidden transition-all ${i === 1 ? 'border-emerald-500 shadow-md bg-white' : 'border-slate-200 bg-slate-50'}`}>
                        {i === 1 && (
                          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                            Recommended
                          </div>
                        )}
                        <h4 className="text-lg font-bold text-slate-900">{tier.tierName}</h4>
                        <div className="mt-1 mb-4 flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">EGP {tier.amount}</span>
                          <span className="text-slate-500 text-sm font-medium">/{tier.billingCycle}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 font-medium">{tier.targetSegment}</p>
                        <ul className="space-y-2">
                          {tier.features?.map((feat: string, j: number) => (
                            <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {results.financial.assumptionsApplied && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-indigo-500" /> Market Context
                      </h4>
                      <ul className="space-y-2">
                        {results.financial.assumptionsApplied.map((assump: string, i: number) => (
                          <li key={i} className="text-sm text-slate-500 flex items-start gap-2">
                            <span className="text-slate-300 mt-1">•</span>
                            {assump}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
