'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { AILoadingOverlay } from './ui/AILoadingOverlay';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Wand2, Share, Settings, Download, X, Zap, Target, Briefcase, 
  TrendingUp, BarChart2, Package, Megaphone, DollarSign, Crosshair, AlertTriangle, 
  ChevronRight, ArrowUpRight, Activity, Users, ShieldAlert, Award, Compass, Eye
} from 'lucide-react';
import { 
  staggerContainer, fadeInUp, fadeIn, slideInLeft, slideInRight, scaleIn, 
  hoverLift, hoverGlow, chartReveal 
} from '../lib/motion-presets';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function BusinessPlanDashboard() {
  const { currentProject, ventureState, generateBusinessPlan, loading, loadingMessage } = useStore();
  const [selectedSection, setSelectedSection] = useState<{title: string, content: React.ReactNode} | null>(null);

  const businessPlan = ventureState?.businessPlan as any;
  const selectedOpportunity = ventureState?.selectedOpportunity;

  if (!currentProject || !selectedOpportunity) {
    return <AILoadingOverlay message={loadingMessage || "Generating Business Plan..."} />;
  }

  if (!businessPlan || !businessPlan.executiveSummary?.startupName) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Build Your Venture Plan</h1>
        <p className="text-lg text-slate-600">
          You have selected <strong>{selectedOpportunity.title}</strong>. 
          Our AI architect will now generate a complete 10-section business intelligence dossier tailored exactly to your vision.
        </p>
        <div className="pt-8">
          <Button 
            onClick={() => generateBusinessPlan(currentProject.id)}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-xl shadow-slate-900/20 transition-all hover:scale-105"
          >
            <Wand2 className="w-5 h-5 mr-3" />
            Generate Venture Intelligence
          </Button>
        </div>
      </div>
    );
  }

  const bp = businessPlan;
  
  const viabilityScore = bp.viabilityAnalysis?.overallScore || 0;
  const radarData = [
    { subject: 'Market', A: bp.viabilityAnalysis?.marketOpportunityScore || 0, fullMark: 100 },
    { subject: 'Founder Fit', A: bp.viabilityAnalysis?.founderFitScore || 0, fullMark: 100 },
    { subject: 'Profitability', A: bp.viabilityAnalysis?.profitabilityScore || 0, fullMark: 100 },
    { subject: 'Scalability', A: bp.viabilityAnalysis?.scalabilityScore || 0, fullMark: 100 },
    { subject: 'Execution', A: bp.viabilityAnalysis?.executionScore || 0, fullMark: 100 },
  ];

  const financialData = bp.financialInsights?.chartData || [];

  return (
    <div className="min-h-screen pb-20 relative bg-[#f8fafc]">
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-12"
      >
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Venture Intelligence
              <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm font-medium border border-purple-100">
                {bp.executiveSummary?.startupName || selectedOpportunity.title}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full w-10 h-10 p-0 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <Share className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="outline" className="rounded-full w-10 h-10 p-0 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <Settings className="w-4 h-4 text-slate-600" />
            </Button>
            <Button className="rounded-full bg-slate-900 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Export Deck
            </Button>
          </div>
        </div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
          
          {/* SECTION 1: EXECUTIVE SUMMARY */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Compass className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-900">Executive Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:col-span-2 p-8 border-0 shadow-xl shadow-slate-200/40 rounded-3xl bg-white/80 backdrop-blur-xl bg-gradient-to-br from-white to-purple-50/30">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{bp.executiveSummary?.startupName || 'Startup'}</h3>
                <p className="text-lg text-purple-600 font-medium mb-6">{bp.executiveSummary?.valueProposition}</p>
                <p className="text-slate-600 leading-relaxed mb-8">{bp.executiveSummary?.executiveSummary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mission</h4>
                    <p className="text-slate-800 font-medium text-sm">{bp.executiveSummary?.mission}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vision</h4>
                    <p className="text-slate-800 font-medium text-sm">{bp.executiveSummary?.vision}</p>
                  </div>
                </div>
              </Card>

              {/* SECTION 4: VIABILITY ANALYSIS */}
              <Card className="col-span-1 p-8 border-0 shadow-xl shadow-purple-500/10 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden flex flex-col">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
                
                <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center gap-2 relative z-10">
                  <Activity className="w-5 h-5 text-purple-400" />
                  AI Viability Score
                </h3>
                
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path className="text-purple-400" strokeDasharray={`${viabilityScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">{viabilityScore}</span>
                    </div>
                  </div>
                  
                  <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
                    <div className="flex justify-between items-center bg-slate-800/50 px-2 py-1.5 rounded-lg border border-slate-700/50">
                      <span>Market</span><span className="text-white font-medium">{bp.viabilityAnalysis?.marketOpportunityScore}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 px-2 py-1.5 rounded-lg border border-slate-700/50">
                      <span>Founder Fit</span><span className="text-white font-medium">{bp.viabilityAnalysis?.founderFitScore}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 px-2 py-1.5 rounded-lg border border-slate-700/50">
                      <span>Scalability</span><span className="text-white font-medium">{bp.viabilityAnalysis?.scalabilityScore}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 px-2 py-1.5 rounded-lg border border-slate-700/50">
                      <span>Execution</span><span className="text-white font-medium">{bp.viabilityAnalysis?.executionScore}%</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed text-center italic border-t border-slate-700 pt-4 w-full">
                    {bp.viabilityAnalysis?.reasoning ? `&quot;${bp.viabilityAnalysis.reasoning}&quot;` : 'Analyzing...'}
                  </p>
                </div>
              </Card>
            </div>
          </section>

          {/* SECTION 2 & 3: PROBLEM, SOLUTION & BUSINESS MODEL */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Problem & Solution</h2>
              </div>
              <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white h-full flex flex-col">
                <div className="space-y-6 flex-1">
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                    <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> The Problem</h4>
                    <p className="text-slate-700 text-sm leading-relaxed mb-4">{bp.problemAndSolution?.problem}</p>
                    <div className="flex flex-wrap gap-2">
                      {bp.problemAndSolution?.targetPainPoints?.map((p: string, i: number) => (
                        <span key={i} className="bg-white text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 shadow-sm">{p}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 mt-4">
                    <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2"><Zap className="w-4 h-4"/> The Solution</h4>
                    <p className="text-slate-700 text-sm leading-relaxed mb-4">{bp.problemAndSolution?.solution}</p>
                    <div className="flex flex-wrap gap-2">
                      {bp.problemAndSolution?.uniqueAdvantages?.map((a: string, i: number) => (
                        <span key={i} className="bg-white text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-200 shadow-sm">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">Business Model</h2>
              </div>
              <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white h-full flex flex-col">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pricing Strategy</h4>
                    <p className="text-slate-800 font-medium">{bp.businessModel?.pricingStrategy}</p>
                  </div>
                  
                  <div className="col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Revenue Streams</h4>
                    <ul className="space-y-2">
                      {bp.businessModel?.revenueStreams?.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Distribution</h4>
                    <ul className="space-y-2">
                      {bp.businessModel?.distributionChannels?.map((d: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5"></div>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* SECTION 5: MARKET RESEARCH */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">Market Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:col-span-1 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white flex flex-col justify-center items-center text-center">
                <div className="w-full space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Market Size</h4>
                    <div className="text-3xl font-black text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">{bp.marketResearch?.marketSize || 'TBD'}</div>
                  </div>
                  <div className="h-px w-full bg-slate-100"></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Growth Rate</h4>
                    <div className="text-3xl font-black text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">{bp.marketResearch?.industryGrowthRate || 'TBD'}</div>
                  </div>
                  <div className="h-px w-full bg-slate-100"></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Behavior</h4>
                    <p className="text-sm font-medium text-slate-700 line-clamp-3">{bp.marketResearch?.customerBehavior}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="col-span-1 md:col-span-2 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-rose-500"/> Competitor Landscape</h4>
                <div className="space-y-4">
                  {bp.marketResearch?.competitors?.map((comp: any, i: number) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                      <div className="w-full md:w-1/3 font-bold text-slate-800">{comp.name}</div>
                      <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Strength</div>
                          <div className="text-xs text-slate-600">{comp.strengths}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-rose-600 mb-1">Weakness</div>
                          <div className="text-xs text-slate-600">{comp.weaknesses}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* SECTION 6: PRODUCTS & SERVICES */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Products & Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:col-span-1 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-sm font-bold text-indigo-900 mb-4 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">Core Offerings</h4>
                <div className="space-y-3">
                  {bp.productsAndServices?.coreOfferings?.map((item: string, i: number) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h4 className="text-sm font-medium text-slate-900">{item}</h4>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="col-span-1 md:col-span-1 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-sm font-bold text-purple-900 mb-4 bg-purple-50 px-3 py-1.5 rounded-lg inline-block">Premium Offerings</h4>
                <div className="space-y-3">
                  {bp.productsAndServices?.premiumOfferings?.map((item: string, i: number) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h4 className="text-sm font-medium text-slate-900">{item}</h4>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="col-span-1 md:col-span-1 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-sm font-bold text-sky-900 mb-4 bg-sky-50 px-3 py-1.5 rounded-lg inline-block">Support Services</h4>
                <div className="space-y-3">
                  {bp.productsAndServices?.supportServices?.map((item: string, i: number) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h4 className="text-sm font-medium text-slate-900">{item}</h4>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* SECTION 8: FINANCIAL INSIGHTS */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">Financial Insights</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-6">Revenue vs Cost Projection (18 Months)</h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => `$${value/1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, undefined]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="col-span-1 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Break-Even Point</h4>
                    <p className="text-lg font-bold text-slate-900">{bp.financialInsights?.breakEvenPoint}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Monthly Growth</h4>
                    <p className="text-lg font-bold text-slate-900">{bp.financialInsights?.monthlyGrowth}</p>
                  </div>
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
                    <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Unit Economics</h4>
                    <p className="text-sm font-medium text-slate-800">{bp.financialInsights?.unitEconomics}</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* SECTION 7: SALES & MARKETING */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Megaphone className="w-5 h-5 text-pink-600" />
              <h2 className="text-xl font-bold text-slate-900">Sales & Marketing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:col-span-1 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-6">Growth Funnel</h4>
                <div className="space-y-3">
                  {Object.entries(bp.salesAndMarketing?.marketingFunnel || {}).map(([key, value], i) => (
                    <div key={key} className="relative group">
                      <div className={`p-3 rounded-xl border border-slate-100 bg-slate-50 transition-colors hover:border-pink-200 hover:bg-pink-50 relative z-10 mx-auto`} style={{ width: `${100 - (i*10)}%` }}>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{key}</div>
                        <div className="text-xs text-slate-700 font-medium truncate" title={value as string}>{value as string}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="col-span-1 md:col-span-2 p-6 border-0 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Acquisition Channels</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {bp.salesAndMarketing?.acquisitionChannels?.map((ch: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-pink-50 text-pink-700 text-xs font-semibold rounded-lg">{ch}</span>
                      ))}
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Retention Strategy</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {bp.salesAndMarketing?.customerRetention}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Content Strategy</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                      {bp.salesAndMarketing?.contentStrategy}
                    </p>
                    
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Online Presence</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {bp.salesAndMarketing?.onlinePresence}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* SECTION 9: SWOT ANALYSIS */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Crosshair className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900">SWOT Analysis</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 border-t-4 border-t-emerald-500 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">Strengths</h4>
                <ul className="space-y-3">
                  {bp.swotAnalysis?.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-3 bg-emerald-50/30 p-3 rounded-xl border border-emerald-50">
                      <div className="mt-0.5 text-emerald-500"><Award className="w-4 h-4" /></div>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 border-t-4 border-t-rose-500 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-lg font-bold text-rose-900 mb-4 flex items-center gap-2">Weaknesses</h4>
                <ul className="space-y-3">
                  {bp.swotAnalysis?.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-3 bg-rose-50/30 p-3 rounded-xl border border-rose-50">
                      <div className="mt-0.5 text-rose-500"><AlertTriangle className="w-4 h-4" /></div>
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 border-t-4 border-t-blue-500 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">Opportunities</h4>
                <ul className="space-y-3">
                  {bp.swotAnalysis?.opportunities?.map((o: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-3 bg-blue-50/30 p-3 rounded-xl border border-blue-50">
                      <div className="mt-0.5 text-blue-500"><TrendingUp className="w-4 h-4" /></div>
                      {o}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 border-t-4 border-t-amber-500 shadow-lg shadow-slate-200/50 rounded-3xl bg-white">
                <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">Threats</h4>
                <ul className="space-y-3">
                  {bp.swotAnalysis?.threats?.map((t: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-3 bg-amber-50/30 p-3 rounded-xl border border-amber-50">
                      <div className="mt-0.5 text-amber-500"><ShieldAlert className="w-4 h-4" /></div>
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {/* SECTION 10: RISK ASSESSMENT */}
          <section className="mb-20">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-bold text-slate-900">Risk Mitigation</h2>
            </div>
            <Card className="p-8 border-0 shadow-xl shadow-slate-200/50 rounded-3xl bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Risk Factors</h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <h5 className="text-sm font-bold text-slate-800 mb-2">Market & Operational</h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {bp.riskAssessment?.marketRisks?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        {bp.riskAssessment?.operationalRisks?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <h5 className="text-sm font-bold text-slate-800 mb-2">Technical & Financial</h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {bp.riskAssessment?.technicalRisks?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        {bp.riskAssessment?.financialRisks?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Mitigation Strategies</h4>
                  <div className="space-y-3">
                    {bp.riskAssessment?.mitigationStrategies?.map((strat: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                        <div className="shrink-0 mt-0.5"><div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">{i+1}</div></div>
                        <p className="text-sm text-emerald-900 font-medium">{strat}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

        </motion.div>
      </motion.div>
    </div>
  );
}
