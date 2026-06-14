'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Crown, BarChart3, Presentation, Radar, Users, FileText, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { currentProject, currentOutputs, user } = useStore();

  const projectName = currentProject?.name || 'Fresh Hearth Foods';
  const financialForecast = currentOutputs?.financialForecast;

  // Use real data or mock data for the chart to match the reference screenshot shape
  const chartData = financialForecast?.profitProjection?.map((profit, index) => ({
    month: `Month ${index + 1}`,
    revenue: profit > 0 ? profit : 0
  })) || [
    { month: 'Jan', revenue: 20 },
    { month: 'Feb', revenue: 30 },
    { month: 'Mar', revenue: 40 },
    { month: 'Apr', revenue: 120 },
    { month: 'May', revenue: 320 },
    { month: 'Jun', revenue: 350 },
    { month: 'Jul', revenue: 380 },
    { month: 'Aug', revenue: 350 },
    { month: 'Sept', revenue: 420 },
    { month: 'Oct', revenue: 460 },
    { month: 'Nov', revenue: 520 },
    { month: 'Dec', revenue: 480 },
  ];

  const maxRevenue = financialForecast 
    ? Math.max(...chartData.map(d => d.revenue)) * 1.2
    : 600;

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      <h1 className="text-2xl font-medium text-slate-800 tracking-tight">
        Welcome, {user?.name || user?.email?.split('@')[0] || 'Founder'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Plan Card */}
          <Card 
            onClick={() => useStore.setState({ activeTab: 'business-builder' })}
            className="p-6 border-slate-200 shadow-sm flex flex-col md:flex-row items-start gap-6 rounded-xl bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Book Graphic - brownish/cream like reference */}
            <div className="relative w-[100px] h-[130px] flex-shrink-0 rounded-md shadow-lg overflow-hidden" style={{ perspective: '600px' }}>
              {/* Book spine */}
              <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#8B7355] z-10 rounded-l-md"></div>
              {/* Book cover */}
              <div className="absolute inset-0 ml-[6px] bg-gradient-to-br from-[#E8DCC8] via-[#D4C4A8] to-[#C9B896] flex flex-col items-center justify-center">
                {/* Top decorative band */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#C5D4C0] to-[#D4C4A8] opacity-60"></div>
                {/* Title text on book */}
                <div className="relative z-10 text-center px-3 mt-2">
                  <span className="text-[9px] font-bold text-[#5C4A32] block leading-tight">Business Plan</span>
                  <div className="w-6 h-px bg-[#8B7355] mx-auto mt-2 opacity-50"></div>
                  <div className="w-4 h-px bg-[#8B7355] mx-auto mt-1 opacity-30"></div>
                </div>
              </div>
              {/* Page edges */}
              <div className="absolute right-0 top-[3px] bottom-[3px] w-[3px] bg-gradient-to-r from-slate-200 to-slate-100 rounded-r-sm"></div>
            </div>

            {/* Plan Info */}
            <div className="flex-1 w-full pt-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-0.5">Business Plan</h2>
              <p className="text-slate-500 text-sm mb-5">{projectName}</p>
              
              {/* Progress Bar Area */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-5 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-700">Free pages</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">14</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-600">
                    <Crown className="w-3 h-3" />
                    <span>Pro pages</span>
                    <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">36</span>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '28%' }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-[#1e293b] rounded-l-full"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-purple-300 rounded-r-full"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Financials Section */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-medium text-slate-800">Financials</h2>
                <p className="text-sm text-slate-500">Financial forecasts automatically created for your business</p>
              </div>
              <Button 
                onClick={() => useStore.setState({ activeTab: 'financials' })}
                className="bg-[#1e293b] hover:bg-slate-800 text-white rounded-full px-6 font-semibold shadow-sm text-sm"
              >
                Go to Financials
              </Button>
            </div>

            <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white">
              {/* Financial Summary */}
              <div className="flex flex-wrap items-start gap-6 md:gap-10 mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    ${financialForecast ? (financialForecast.expectedRevenue * 12).toLocaleString() : '3,284,407'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">1st Year Revenue</p>
                </div>
                
                <div className="opacity-40 filter blur-[2px] select-none">
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    ${financialForecast ? (financialForecast.monthlyExpenses * 12).toLocaleString() : '1,402,100'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">1st Year Expenses</p>
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5"><Crown className="w-2.5 h-2.5"/> Pro</span>
                  </div>
                </div>
                
                <div className="opacity-40 filter blur-[2px] select-none">
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    ${financialForecast ? ((financialForecast.expectedRevenue - financialForecast.monthlyExpenses) * 12).toLocaleString() : '1,882,307'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">1st Year Net Profit</p>
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5"><Crown className="w-2.5 h-2.5"/> Pro</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-56 w-full flex items-end justify-between gap-1.5 pr-12">
                {/* Y Axis labels */}
                <div className="absolute -right-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400 font-medium py-1">
                  <span>$900K</span>
                  <span>$250K</span>
                  <span>$0</span>
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 right-12 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-dashed border-slate-100"></div>
                  <div className="border-b border-dashed border-slate-100"></div>
                  <div className="border-b border-slate-100"></div>
                </div>

                {chartData.map((data, index) => (
                  <div key={data.month} className="relative flex flex-col items-center justify-end w-full h-full group z-10">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05, type: 'spring' }}
                      className="w-full max-w-[22px] bg-[#2d3748] rounded-t-[3px] group-hover:bg-[#1e293b] transition-colors cursor-pointer"
                    />
                    <span className="absolute -bottom-5 text-[9px] text-slate-400">{data.month}</span>
                  </div>
                ))}

                {/* Mock line chart curve overlay */}
                <svg className="absolute inset-0 w-[calc(100%-48px)] h-full pointer-events-none z-20" preserveAspectRatio="none">
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    d="M 10 210 Q 80 210 130 190 T 250 160 T 370 140 T 480 110 T 580 90 T 680 80" 
                    fill="none" 
                    stroke="#94a3b8" 
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-60"
                  />
                </svg>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-10 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#2d3748]"></div> Revenue
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-200"></div> Expenses
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-4 h-px bg-slate-400" style={{ borderTop: '2px dashed #94a3b8' }}></div> Profit
                </div>
              </div>

            </Card>
          </div>

          {/* Bottom Tool Cards - Market Research, Pitch Deck, Radar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { 
                title: 'Market Research', 
                desc: 'Audience demographics, personas, and industry benchmarks.',
                icon: Users,
                tab: 'market-research'
              },
              { 
                title: 'Pitch Deck', 
                desc: 'Secure funding and impress partners.',
                icon: Presentation,
                tab: 'pitch'
              },
              { 
                title: 'Radar', 
                desc: 'Track competitors, news, social media, and local events.',
                icon: Radar,
                tab: 'competitors'
              },
            ].map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  onClick={() => useStore.setState({ activeTab: tool.tab as any })}
                >
                  <Card className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-xl bg-white group overflow-hidden">
                    {/* Thumbnail preview */}
                    <div className="h-24 bg-slate-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-slate-100">
                      <div className="flex items-center gap-2 opacity-50">
                        <Icon className="w-8 h-8 text-slate-300" />
                        <div className="space-y-1.5">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full"></div>
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                          <div className="w-10 h-1.5 bg-slate-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-slate-900">{tool.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{tool.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Guides */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-800">Guides</h2>
            <p className="text-sm text-slate-500">Bespoke guides generated just for you</p>
          </div>

          <div className="space-y-3">
            {[
              { title: '50 Marketing Ideas for Your Business', desc: 'A practical list of marketing ideas tailored to your business, budget, and goals.', accent: '#3B82F6', tab: 'marketing' },
              { title: 'Business Licenses Report', desc: 'A complete guide to the licenses, permits, and filing resources your business may need.', accent: '#8B5CF6', tab: 'guides' },
              { title: 'Small Business Grants Guide', desc: 'A targeted guide to grant opportunities, eligibility details, and where to apply.', accent: '#F59E0B', tab: 'guides' }
            ].map((guide, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => useStore.setState({ activeTab: guide.tab as any })}
              >
                <Card 
                  className="p-5 border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-xl bg-white group relative overflow-hidden"
                  style={{ borderLeft: `3px solid ${guide.accent}` }}
                >
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5 group-hover:text-blue-600 transition-colors">{guide.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{guide.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
