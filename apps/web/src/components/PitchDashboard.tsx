'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Presentation, RefreshCw, Sparkles, Download, Copy, Check, 
  Info, DollarSign, Target, Shield, Award, Users, TrendingUp
} from 'lucide-react';

export default function PitchDashboard() {
  const { currentProject, pitchDeck, pitchLoading, generatePitch } = useStore();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePitch = async () => {
    if (!currentProject) return;
    try {
      await generatePitch(currentProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Loading State (Shimmering skeleton cards)
  if (pitchLoading) {
    return (
      <div className="space-y-8 animate-pulse p-1 print:hidden">
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

  // 2. Empty State (Generate Pitch CTA)
  if (!pitchDeck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-8 rounded-2xl border border-white/5 bg-slate-950/20 backdrop-blur-sm relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center mb-6 shadow-lg shadow-black/50">
          <Presentation className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Build Your Investor Pitch</h2>
        <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
          Craft investor-grade startup pitches, create a concise elevator pitch, and compile essential key metrics into a printable deck.
        </p>
        <button
          onClick={handleGeneratePitch}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-rose-900/40 hover:shadow-rose-500/20 flex items-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" /> Generate Pitch Deck
        </button>
      </div>
    );
  }

  // Helper to highlight markdown bold in plain text sections
  const formatText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.replace(/\*\*/g, '');
        return <strong key={index} className="text-white font-extrabold block text-base mt-6 mb-2 tracking-tight first:mt-0">{clean}</strong>;
      }
      return <span key={index} className="text-slate-300 leading-relaxed text-sm block whitespace-pre-line mb-4 last:mb-0">{part}</span>;
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn print:space-y-6 print:bg-white print:text-black">
      
      {/* Top action block / header */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 relative overflow-hidden shadow-2xl print:shadow-none print:border-none print:p-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none print:hidden"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none print:hidden"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Investor Pitch Deck Studio</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
            <button
              onClick={handleGeneratePitch}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate Pitch
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none print:text-black print:text-4xl">
            {currentProject?.name} Pitch Dossier
          </h1>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider print:text-slate-600 print:text-[10px]">
            Generated via DeepSeek-V3 • Active Version {pitchDeck.version}
          </p>
        </div>
      </div>

      {/* Grid: Summary Metrics and Elevator Pitch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">
        
        {/* Investor Summary & Elevator Pitch */}
        <div className="lg:col-span-2 space-y-6 print:lg:col-span-1">
          
          {/* Executive Summary */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 shadow-xl print:border-none print:shadow-none print:p-0">
            <h2 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2 print:text-black print:border-slate-200">
              <TrendingUp className="w-5 h-5 text-rose-400" /> Executive Summary
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/20 p-5 rounded-xl border border-white/5 print:bg-slate-50 print:border-slate-100 print:text-slate-700">
              {pitchDeck.investorSummary}
            </p>
          </div>

          {/* Elevator Pitch Card */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 shadow-xl print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 print:border-slate-200">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 print:text-black">
                <Target className="w-5 h-5 text-rose-400" /> 30-Second Elevator Pitch
              </h2>
              <button
                onClick={() => copyToClipboard(pitchDeck.elevatorPitch)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 active:scale-95 print:hidden"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-tr from-slate-950/80 to-slate-900/60 border border-white/5 italic text-slate-200 text-base leading-relaxed tracking-wide shadow-inner relative print:bg-slate-50 print:border-slate-100 print:text-slate-800">
              &ldquo;{pitchDeck.elevatorPitch}&rdquo;
              <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono print:hidden">
                {pitchDeck.elevatorPitch?.length} chars
              </div>
            </div>
          </div>

        </div>

        {/* Key Metrics Sidebar */}
        <div className="lg:col-span-1 space-y-6 print:lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5 shadow-xl min-h-full print:border-none print:shadow-none print:p-0">
            <h2 className="text-base font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2 print:text-black print:border-slate-200">
              <DollarSign className="w-5 h-5 text-rose-400" /> Core Venture Metrics
            </h2>

            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 space-y-1 print:bg-slate-50 print:border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500">Market Size (TAM)</span>
                <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.marketSize}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 space-y-1 print:bg-slate-50 print:border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500">Revenue Model</span>
                <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.revenueModel}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 space-y-1 print:bg-slate-50 print:border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500">Primary Customers</span>
                <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.targetCustomers}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 space-y-1 print:bg-slate-50 print:border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500">Competitive Advantage</span>
                <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.uniqueAdvantage}</p>
              </div>

              {pitchDeck.keyMetrics?.fundingAsk && (
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1 print:bg-slate-50 print:border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-rose-400">Funding Requested</span>
                  <p className="text-sm font-black text-rose-300 print:text-black">{pitchDeck.keyMetrics.fundingAsk}</p>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Main Pitch Narrative section */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 space-y-6 shadow-2xl print:border-none print:shadow-none print:p-0">
        <h2 className="text-xl font-bold text-white border-b border-white/5 pb-4 flex items-center gap-2 print:text-black print:border-slate-200">
          <Award className="w-5 h-5 text-rose-400" /> Full Pitch Narrative
        </h2>
        
        <div className="p-6 md:p-8 rounded-xl bg-slate-950/30 border border-white/5 leading-relaxed text-slate-300 text-sm space-y-4 hover:border-white/10 transition-colors print:bg-transparent print:border-none print:p-0 print:text-slate-800">
          {formatText(pitchDeck.startupPitch)}
        </div>
      </div>

      {/* Traction & Problem/Solution breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
        
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 shadow-xl print:border-none print:shadow-none print:p-0">
          <h3 className="text-sm font-extrabold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2 print:text-black print:border-slate-200">
            <Users className="w-4 h-4 text-rose-400" /> Traction & Milestones
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 print:bg-slate-50 print:border-slate-100">
            <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-line print:text-slate-800">
              {pitchDeck.traction}
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4 shadow-xl print:border-none print:shadow-none print:p-0">
          <h3 className="text-sm font-extrabold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2 print:text-black print:border-slate-200">
            <Shield className="w-4 h-4 text-rose-400" /> Core Moats & Validation
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-white/5 bg-slate-950/10 text-xs print:bg-slate-50 print:border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Problem Statement</span>
              <p className="text-slate-300 leading-normal print:text-slate-700">{pitchDeck.problemStatement}</p>
            </div>
            <div className="p-3 rounded-lg border border-white/5 bg-slate-950/10 text-xs print:bg-slate-50 print:border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Proposed Solution</span>
              <p className="text-slate-300 leading-normal print:text-slate-700">{pitchDeck.solution}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
