'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Megaphone, RefreshCw, Sparkles, BarChart, Rocket, Calendar,
  Copy, Check, Globe, Facebook, Instagram, Linkedin, Wand2, Loader2
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

  // 1. Loading State
  if (marketingLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">Generating Marketing Strategy...</h2>
          <p className="text-slate-500 mt-2">Building your go-to-market playbook and campaigns.</p>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!marketingCampaign) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Megaphone className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Build Your Go-To-Market Playbook</h1>
        <p className="text-lg text-slate-600">
          Create structured ad campaigns, generate ready-to-use social media copy, design platform
          specific headlines, and map out a step-by-step launch roadmap.
        </p>
        <div className="pt-8">
          <Button
            onClick={handleGenerateMarketing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-md"
          >
            <Wand2 className="w-5 h-5 mr-3" />
            Generate Marketing Strategy
          </Button>
        </div>
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
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <Megaphone className="text-indigo-500" />
            Marketing Strategy
          </h1>
          <p className="text-slate-500 mt-1">Go-to-market playbook and launch blueprint</p>
        </div>
        <button
          onClick={handleGenerateMarketing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Go-To-Market Plan */}
        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-500" />
            Go-To-Market Plan
          </h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {marketingCampaign.marketingPlan}
          </p>
        </Card>

        {/* Channels & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Target Distribution Channels</h3>
            <div className="flex flex-wrap gap-2">
              {marketingCampaign.targetChannels?.map((channel, index) => (
                <span key={index} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5">
                  {getPlatformIcon(channel)} {channel}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Budget Allocations</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(marketingCampaign.budgetAllocation || {}).map(([channel, pct], index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">{channel}:</span>
                  <span className="text-xs text-indigo-600 font-bold">{pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Campaigns & Ad Copies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Active Campaigns */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-500" />
              Active Campaigns
            </h3>
            <div className="space-y-4">
              {marketingCampaign.campaigns?.map((camp, idx) => (
                <Card key={idx} className="p-5 border-slate-200 shadow-sm rounded-xl bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {camp.platform}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {camp.duration}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{camp.name}</h4>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div><span className="font-semibold">Goal:</span> {camp.goal}</div>
                    <div><span className="font-semibold">Budget:</span> {camp.budget}%</div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Key Tactics</span>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      {camp.tactics?.map((t, tIdx) => (
                        <li key={tIdx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ad Copy Studio */}
          <div className="lg:col-span-2 space-y-6">

            <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Creative Ad Copies</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Optimized social ad copy designed for high click-through rates.</p>
                </div>
                {/* Platform tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {marketingCampaign.adCopies?.map((ad) => (
                    <button
                      key={ad.platform}
                      onClick={() => setActivePlatformTab(ad.platform)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                        activePlatformTab === ad.platform
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {ad.platform}
                    </button>
                  ))}
                </div>
              </div>

              {marketingCampaign.adCopies?.filter(ad => ad.platform === activePlatformTab).map((ad, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Headline</span>
                      <button onClick={() => copyToClipboard(ad.headline, 999)} className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1">
                        {copiedIndex === 999 ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copiedIndex === 999 ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-900 text-sm">
                      {ad.headline}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Body Text</span>
                      <button onClick={() => copyToClipboard(ad.body, 1000)} className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1">
                        {copiedIndex === 1000 ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copiedIndex === 1000 ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                      {ad.body}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-indigo-50 border border-indigo-100">
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Call To Action</span>
                      <span className="text-indigo-700 font-bold">{ad.callToAction}</span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Hooks & Playbook */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Social Media Hooks</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Engineered hooks to capture attention in 3 seconds.</p>
                </div>
                <div className="space-y-2.5">
                  {marketingCampaign.contentHooks?.map((hook, index) => (
                    <div key={index} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors relative group">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                      <p className="text-xs text-slate-700 pr-8 leading-relaxed italic">&ldquo;{hook}&rdquo;</p>
                      <button
                        onClick={() => copyToClipboard(hook, index)}
                        className="absolute right-3 top-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700"
                      >
                        {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Social Content Playbook</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Distribution strategy and calendar schedule guidelines.</p>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line italic">
                  {marketingCampaign.socialMediaStrategy}
                </p>
              </Card>
            </div>

            {/* Launch Timeline */}
            <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                <Rocket className="w-5 h-5 text-indigo-400" />
                Launch Timeline &amp; Playbook
              </h3>
              {marketingCampaign.launchPlan && typeof marketingCampaign.launchPlan === 'object' ? (
                <div className="relative border-l border-indigo-500/40 ml-4 pl-6 space-y-6 z-10">
                  {Object.entries(marketingCampaign.launchPlan).map(([phase, details], idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">{phase}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line relative z-10">
                  {typeof marketingCampaign.launchPlan === 'string' ? marketingCampaign.launchPlan : ''}
                </p>
              )}
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
