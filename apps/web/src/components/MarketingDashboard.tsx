'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Megaphone, RefreshCw, Sparkles, BarChart, Rocket, Calendar, 
  Copy, Check, Info, Globe, Facebook, Instagram, Linkedin, FileText
} from 'lucide-react';

export default function MarketingDashboard() {
  const { currentProject, marketingCampaign, marketingLoading, generateMarketing } = useStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<string>('');

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

  // 1. Loading State (Shimmering skeleton cards)
  if (marketingLoading) {
    return (
      <div className="space-y-8 animate-pulse p-1">
        <div className="h-48 rounded-2xl bg-slate-900/50 border border-white/5 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
            <div className="h-8 w-64 bg-slate-800 rounded"></div>
          </div>
          <div className="h-10 w-full bg-slate-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-slate-900/50 border border-white/5 lg:col-span-2"></div>
          <div className="h-80 rounded-2xl bg-slate-900/50 border border-white/5"></div>
        </div>
      </div>
    );
  }

  // 2. Empty State (Generate Marketing CTA)
  if (!marketingCampaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-8 rounded-2xl border border-white/5 bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 border border-white/10 flex items-center justify-center mb-6 shadow-lg shadow-black/50">
          <Megaphone className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Build Your Go-To-Market Playbook</h2>
        <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
          Create structured ad campaigns, generate ready-to-use social media copy, design platform specific headlines, and map out a step-by-step launch roadmap.
        </p>
        <button
          onClick={handleGenerateMarketing}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-500/20 flex items-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" /> Generate Marketing Strategy
        </button>
      </div>
    );
  }

  // Set default active ad platform if not set
  if (!activePlatformTab && marketingCampaign.adCopies?.length > 0) {
    setActivePlatformTab(marketingCampaign.adCopies[0].platform);
  }

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook className="w-4 h-4 text-blue-500" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4 text-pink-500" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4 text-sky-600" />;
    return <Globe className="w-4 h-4 text-teal-500" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner overview */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Marketing Strategy & Launch Blueprint</span>
          </div>
          <button
            onClick={handleGenerateMarketing}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Regenerate Strategy
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-400" /> Go-To-Market Plan
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/30 p-5 rounded-xl border border-white/5">
            {marketingCampaign.marketingPlan}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Target Distribution Channels</h4>
            <div className="flex flex-wrap gap-2">
              {marketingCampaign.targetChannels?.map((channel, index) => (
                <span key={index} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-white/5 text-slate-300 flex items-center gap-1.5">
                  {getPlatformIcon(channel)} {channel}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Budget Allocations</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(marketingCampaign.budgetAllocation || {}).map(([channel, pct], index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-xs text-slate-300 font-medium">{channel}:</span>
                  <span className="text-xs text-indigo-400 font-bold">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Campaigns and Platform Ad Copy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campaigns Cards */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Rocket className="w-4.5 h-4.5 text-indigo-400" /> Active Campaigns
          </h3>
          
          <div className="space-y-4">
            {marketingCampaign.campaigns?.map((camp, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border-white/5 space-y-3 hover:border-white/10 transition-colors shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {camp.platform}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {camp.duration}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">{camp.name}</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div><span className="text-slate-500 font-medium">Goal:</span> {camp.goal}</div>
                  <div><span className="text-slate-500 font-medium">Budget allocation:</span> {camp.budget}%</div>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Key Tactics</span>
                  <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                    {camp.tactics?.map((t, tIdx) => (
                      <li key={tIdx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ad Copy Studio & Hooks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ad Copies Tab */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-200">Creative Ad Copies</h3>
                <p className="text-slate-400 text-xs mt-0.5">Optimized social ad copy designed for high click-through rates.</p>
              </div>
              
              {/* Platform tabs selector */}
              <div className="flex bg-slate-950/80 p-1 rounded-lg border border-white/5">
                {marketingCampaign.adCopies?.map((ad) => (
                  <button
                    key={ad.platform}
                    onClick={() => setActivePlatformTab(ad.platform)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      activePlatformTab === ad.platform 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ad.platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Platform Ad Copy Details */}
            {marketingCampaign.adCopies?.filter(ad => ad.platform === activePlatformTab).map((ad, idx) => (
              <div key={idx} className="space-y-4 animate-fadeIn">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Headline</span>
                    <button 
                      onClick={() => copyToClipboard(ad.headline, 999)} 
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 active:scale-95"
                    >
                      {copiedIndex === 999 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 999 ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-950/50 border border-white/5 font-semibold text-white text-sm">
                    {ad.headline}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Body Text</span>
                    <button 
                      onClick={() => copyToClipboard(ad.body, 1000)} 
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 active:scale-95"
                    >
                      {copiedIndex === 1000 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 1000 ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="p-4 rounded-lg bg-slate-950/50 border border-white/5 text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                    {ad.body}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/40 border border-white/5">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">Call To Action</span>
                    <span className="text-white font-bold">{ad.callToAction}</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Hooks & Playbook */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-extrabold text-slate-200">Social Media Hooks</h3>
                <p className="text-slate-500 text-[10px] mt-0.5">Engineered hooks to capture attention in 3 seconds.</p>
              </div>
              <div className="space-y-2.5">
                {marketingCampaign.contentHooks?.map((hook, index) => (
                  <div key={index} className="flex items-start gap-2 bg-slate-950/30 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors relative group">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                    <p className="text-xs text-slate-300 pr-8 leading-relaxed italic">&ldquo;{hook}&rdquo;</p>
                    <button 
                      onClick={() => copyToClipboard(hook, index)}
                      className="absolute right-3 top-3.5 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 text-slate-400 hover:text-slate-200"
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-extrabold text-slate-200">Social Content Playbook</h3>
                <p className="text-slate-500 text-[10px] mt-0.5">Distribution strategy and calendar schedule guidelines.</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-white/5 whitespace-pre-line italic">
                {marketingCampaign.socialMediaStrategy}
              </p>
            </div>

          </div>

          {/* Launch Playbook / Timeline display */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-400" /> Launch Timeline & Playbook
            </h3>
            {marketingCampaign.launchPlan && typeof marketingCampaign.launchPlan === 'object' ? (
              <div className="relative border-l border-indigo-500/30 ml-4 pl-6 space-y-6 my-2">
                {Object.entries(marketingCampaign.launchPlan).map(([phase, details], idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center group-hover:scale-110 transition-all shadow-lg shadow-black/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    </div>
                    
                    <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-2 hover:border-white/10 transition-colors">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">{phase}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{details}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-5 rounded-xl border border-white/5 whitespace-pre-line">
                {typeof marketingCampaign.launchPlan === 'string' ? marketingCampaign.launchPlan : ''}
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
