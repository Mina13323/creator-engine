'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Presentation, RefreshCw, Sparkles, Download, Copy, Check,
  DollarSign, Target, Shield, Award, Users, TrendingUp, Wand2, Loader2
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

  // 1. Loading State
  if (pitchLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in print:hidden">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">Generating Pitch Deck...</h2>
          <p className="text-slate-500 mt-2">Compiling your investor-grade startup pitch.</p>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!pitchDeck) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto text-center space-y-8 animate-in fade-in print:hidden">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Presentation className="w-12 h-12 text-rose-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Build Your Investor Pitch</h1>
        <p className="text-lg text-slate-600">
          Craft investor-grade startup pitches, create a concise elevator pitch, and compile
          essential key metrics into a printable deck.
        </p>
        <div className="pt-8">
          <Button
            onClick={handleGeneratePitch}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-md"
          >
            <Wand2 className="w-5 h-5 mr-3" />
            Generate Pitch Deck
          </Button>
        </div>
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
        return <strong key={index} className="text-slate-900 font-extrabold block text-base mt-6 mb-2 tracking-tight first:mt-0">{clean}</strong>;
      }
      return <span key={index} className="text-slate-700 leading-relaxed text-sm block whitespace-pre-line mb-4 last:mb-0">{part}</span>;
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 print:space-y-6 print:bg-white print:text-black">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <Presentation className="text-rose-500" />
            Investor Pitch Deck
          </h1>
          <p className="text-slate-500 mt-1">{currentProject?.name} — Version {pitchDeck.version}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            onClick={handleGeneratePitch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate Pitch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Executive Summary */}
        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white print:border-slate-200 print:shadow-none">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 print:text-black">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            Executive Summary
          </h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line print:text-slate-800">
            {pitchDeck.investorSummary}
          </p>
        </Card>

        {/* Elevator Pitch + Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">

          {/* Elevator Pitch */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white h-full print:border-slate-200 print:shadow-none">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 print:text-black">
                  <Target className="w-5 h-5 text-amber-500" />
                  30-Second Elevator Pitch
                </h2>
                <button
                  onClick={() => copyToClipboard(pitchDeck.elevatorPitch)}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 print:hidden"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 italic text-slate-800 text-base leading-relaxed tracking-wide relative print:bg-slate-50 print:border-slate-200">
                &ldquo;{pitchDeck.elevatorPitch}&rdquo;
                <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono print:hidden">
                  {pitchDeck.elevatorPitch?.length} chars
                </div>
              </div>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-slate-900 text-white h-full print:border-slate-200 print:shadow-none print:bg-white print:text-black">
              <h2 className="text-base font-bold mb-5 flex items-center gap-2 border-b border-slate-700/50 pb-3 print:text-black print:border-slate-200">
                <DollarSign className="w-5 h-5 text-rose-400 print:text-rose-500" />
                Core Venture Metrics
              </h2>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-700/50 bg-slate-800/50 space-y-1 print:bg-slate-50 print:border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Market Size (TAM)</span>
                  <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.marketSize}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-700/50 bg-slate-800/50 space-y-1 print:bg-slate-50 print:border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Revenue Model</span>
                  <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.revenueModel}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-700/50 bg-slate-800/50 space-y-1 print:bg-slate-50 print:border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Primary Customers</span>
                  <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.targetCustomers}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-700/50 bg-slate-800/50 space-y-1 print:bg-slate-50 print:border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Competitive Advantage</span>
                  <p className="text-sm font-extrabold text-white print:text-black">{pitchDeck.keyMetrics?.uniqueAdvantage}</p>
                </div>
                {pitchDeck.keyMetrics?.fundingAsk && (
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1 print:bg-slate-50 print:border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-rose-400 print:text-rose-600">Funding Requested</span>
                    <p className="text-sm font-black text-rose-300 print:text-black">{pitchDeck.keyMetrics.fundingAsk}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Full Pitch Narrative */}
        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white print:border-slate-200 print:shadow-none">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4 print:text-black print:border-slate-200">
            <Award className="w-5 h-5 text-indigo-500" />
            Full Pitch Narrative
          </h2>
          <div className="leading-relaxed text-slate-700 text-sm space-y-4 print:text-slate-800">
            {formatText(pitchDeck.startupPitch)}
          </div>
        </Card>

        {/* Traction & Problem/Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white print:border-slate-200 print:shadow-none">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 print:text-black print:border-slate-200">
              <Users className="w-4 h-4 text-blue-500" />
              Traction &amp; Milestones
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-line print:text-slate-800">
              {pitchDeck.traction}
            </p>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white print:border-slate-200 print:shadow-none">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 print:text-black print:border-slate-200">
              <Shield className="w-4 h-4 text-emerald-500" />
              Core Moats &amp; Validation
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs print:bg-slate-50 print:border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Problem Statement</span>
                <p className="text-slate-700 leading-normal print:text-slate-700">{pitchDeck.problemStatement}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs print:bg-slate-50 print:border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Proposed Solution</span>
                <p className="text-slate-700 leading-normal print:text-slate-700">{pitchDeck.solution}</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
