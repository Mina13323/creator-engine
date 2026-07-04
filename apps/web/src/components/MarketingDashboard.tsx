'use client';

import { AILoadingOverlay } from './ui/AILoadingOverlay';
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Megaphone, RefreshCw, BarChart, Rocket, Calendar,
  Copy, Check, Globe, Facebook, Instagram, Linkedin, Wand2,
  X, Target, LayoutTemplate, Layers, ChevronRight, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, fadeIn, staggerContainer } from '../lib/motion-presets';

export default function MarketingDashboard() {
  const { currentProject, marketingCampaign, marketingLoading, generateMarketing } = useStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<{ type: 'campaign' | 'ad', data: any } | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateMarketing = async () => {
    if (!currentProject) return;
    try {
      await generateMarketing(currentProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (marketingLoading) {
    return <AILoadingOverlay message="Generating Marketing Strategy..." />;
  }

  if (!marketingCampaign) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Megaphone className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">No marketing strategy has been generated yet.</h1>
        <p className="text-lg text-slate-600">
          Create structured ad campaigns, generate ready-to-use social media copy, design platform
          specific headlines, and map out a step-by-step launch roadmap.
        </p>
        <div className="pt-8">
          <Button
            onClick={handleGenerateMarketing} disabled={marketingLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-md"
          >
            <Wand2 className="w-5 h-5 mr-3" />
            Build Marketing Strategy
          </Button>
        </div>
      </div>
    );
  }

  if (!activePlatformTab && marketingCampaign.adCopies?.length > 0) {
    setActivePlatformTab(marketingCampaign.adCopies[0].platform);
  }

  const getPlatformIcon = (platform: string) => {
    const p = platform?.toLowerCase() || '';
    if (p.includes('facebook')) return <Facebook className="w-4 h-4 text-blue-500" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4 text-pink-500" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4 text-sky-600" />;
    return <Globe className="w-4 h-4 text-teal-500" />;
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8"
      >
        {/* Upgrade Banner Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Megaphone className="w-5 h-5" /> Marketing Strategies & Go-To-Market
            </h2>
            <p className="text-indigo-100 text-sm">Your AI-generated marketing playbook is ready. Tap any card to read the full content.</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleGenerateMarketing} disabled={marketingLoading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
            <button className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> Export Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column - Core Strategy */}
          <div className="xl:col-span-1 space-y-8">
            <Card className="p-6 border-slate-200 shadow-sm rounded-3xl bg-white hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" /> Core Strategy
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                {marketingCampaign.marketingPlan}
              </p>
              
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Distribution Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {marketingCampaign.targetChannels?.map((channel: string, index: number) => (
                    <span key={index} className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 flex items-center gap-2 shadow-sm">
                      {getPlatformIcon(channel)} {channel}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200 shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                <Rocket className="w-5 h-5 text-indigo-400" /> Launch Playbook
              </h3>
              {marketingCampaign.launchPlan && typeof marketingCampaign.launchPlan === 'object' ? (
                <div className="relative border-l border-indigo-500/30 ml-3 pl-5 space-y-6 z-10">
                  {Object.entries(marketingCampaign.launchPlan).map(([phase, details], idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900"></div>
                      <div className="space-y-1 cursor-pointer hover:bg-slate-800/50 p-2 -ml-2 rounded-lg transition-colors" onClick={() => setSelectedItem({ type: 'campaign', data: { name: phase, body: details }})}>
                        <h4 className="text-sm font-bold text-indigo-300">{phase}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{details as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300 relative z-10 line-clamp-6">{marketingCampaign.launchPlan as string}</p>
              )}
            </Card>
          </div>

          {/* Right Column - Campaigns & Ad Copies */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Active Campaigns List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-purple-500" /> Strategic Campaigns
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketingCampaign.campaigns?.map((camp: any, idx: number) => (
                  <Card 
                    key={idx} 
                    onClick={() => setSelectedItem({ type: 'campaign', data: camp })}
                    className="p-5 border-slate-200 shadow-sm rounded-2xl bg-white hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(camp.platform)}
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{camp.platform}</span>
                      </div>
                      <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {camp.duration}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">{camp.name}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{camp.goal}</p>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-3 border-t border-slate-100">
                      <span>Budget: <strong className="text-slate-700">{camp.budget}%</strong></span>
                      <span className="flex items-center text-purple-600">View details <ChevronRight className="w-3 h-3 ml-1" /></span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Creative Ad Copies */}
            <Card className="p-6 border-slate-200 shadow-sm rounded-3xl bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <LayoutTemplate className="w-6 h-6 text-pink-500" /> Ad Copy Studio
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar-hidden">
                  {marketingCampaign.adCopies?.map((ad: any) => (
                    <button
                      key={ad.platform}
                      onClick={() => setActivePlatformTab(ad.platform)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activePlatformTab === ad.platform
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {ad.platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketingCampaign.adCopies?.filter((ad: any) => ad.platform === activePlatformTab).map((ad: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedItem({ type: 'ad', data: ad })}
                    className="group border border-slate-200 rounded-2xl p-5 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-b from-white to-slate-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 bg-pink-50 px-2 py-1 rounded-lg">Headline</span>
                      <Copy className="w-4 h-4 text-slate-300 group-hover:text-pink-400 transition-colors" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-3 leading-snug">{ad.headline}</h4>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-4">{ad.body}</p>
                    <div className="inline-flex items-center justify-center w-full bg-slate-900 text-white text-sm font-bold py-2.5 rounded-xl group-hover:bg-slate-800 transition-colors">
                      {ad.callToAction}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </motion.div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">
                      {selectedItem.type === 'campaign' ? 'Campaign Strategy' : 'Ad Creative'}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedItem.type === 'campaign' ? selectedItem.data.name : selectedItem.data.headline}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar-thin">
                  {selectedItem.type === 'campaign' ? (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-xs text-slate-500 block mb-1">Platform</span>
                          <span className="font-bold text-slate-900">{selectedItem.data.platform || 'General'}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-xs text-slate-500 block mb-1">Duration</span>
                          <span className="font-bold text-slate-900">{selectedItem.data.duration || 'Ongoing'}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-xs text-slate-500 block mb-1">Budget</span>
                          <span className="font-bold text-slate-900">{selectedItem.data.budget}%</span>
                        </div>
                      </div>
                      
                      {selectedItem.data.goal && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Campaign Goal</h4>
                          <p className="text-slate-600 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">{selectedItem.data.goal}</p>
                        </div>
                      )}

                      {selectedItem.data.tactics && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-3">Key Tactics</h4>
                          <ul className="space-y-2">
                            {selectedItem.data.tactics.map((tactic: string, idx: number) => (
                              <li key={idx} className="flex gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span>{tactic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedItem.data.body && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Details</h4>
                          <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedItem.data.body}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex justify-between">
                          Body Copy
                          <button onClick={() => copyToClipboard(selectedItem.data.body, 1)} className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-1">
                            {copiedIndex === 1 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                          </button>
                        </h4>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                          {selectedItem.data.body}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex justify-between">
                          Call To Action
                          <button onClick={() => copyToClipboard(selectedItem.data.callToAction, 2)} className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-1">
                            {copiedIndex === 2 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                          </button>
                        </h4>
                        <div className="bg-slate-900 text-white font-bold p-4 rounded-2xl text-center">
                          {selectedItem.data.callToAction}
                        </div>
                      </div>

                      {selectedItem.data.hook && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-2 flex justify-between">
                            Hook Idea
                            <button onClick={() => copyToClipboard(selectedItem.data.hook, 3)} className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-1">
                              {copiedIndex === 3 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                            </button>
                          </h4>
                          <p className="text-slate-600 italic bg-purple-50 p-4 rounded-2xl border border-purple-100">
                            &quot;{selectedItem.data.hook}&quot;
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
