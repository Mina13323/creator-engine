'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Palette, Copy, Check, Info, Sparkles, ImagePlus, Loader2, Key } from 'lucide-react';
import { api } from '../lib/api';

export default function BrandingPanel() {
  const { currentOutputs } = useStore();
  const [copied, setCopied] = useState(false);
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentOutputs || !currentOutputs.branding) {
    return <div className="text-slate-400 text-sm">No branding dossier loaded.</div>;
  }

  const { branding } = currentOutputs;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(branding.logoPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateLogo = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const result = await api.generateImage({
        prompt: branding.logoPrompt,
        model: 'flux-schnell'
      });
      setGeneratedLogo(result.url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate logo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Brand Identity Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Brand Dossier</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
          {branding.brandName}
        </h1>
        <p className="text-xl text-slate-300 font-medium italic mb-6">
          &quot;{branding.slogan}&quot;
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tone of Voice</h3>
            <p className="text-slate-200 text-sm leading-relaxed">{branding.toneOfVoice}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Market Positioning</h3>
            <p className="text-slate-200 text-sm leading-relaxed">{branding.brandPositioning}</p>
          </div>
        </div>
      </div>

      {/* Visual Identity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colors Palette */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-200">Color System</h2>
            <p className="text-slate-400 text-xs mt-0.5">Primary brand HEX codes generated for visual harmony.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div 
                className="h-16 rounded-xl border border-white/10 shadow-inner" 
                style={{ backgroundColor: branding.colorPalette.primary }}
              ></div>
              <div className="text-xs font-semibold text-center">
                <span className="text-slate-400">Primary:</span> <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">{branding.colorPalette.primary}</code>
              </div>
            </div>

            <div className="space-y-2">
              <div 
                className="h-16 rounded-xl border border-white/10 shadow-inner" 
                style={{ backgroundColor: branding.colorPalette.secondary }}
              ></div>
              <div className="text-xs font-semibold text-center">
                <span className="text-slate-400">Secondary:</span> <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">{branding.colorPalette.secondary}</code>
              </div>
            </div>

            <div className="space-y-2">
              <div 
                className="h-16 rounded-xl border border-white/10 shadow-inner" 
                style={{ backgroundColor: branding.colorPalette.accent }}
              ></div>
              <div className="text-xs font-semibold text-center">
                <span className="text-slate-400">Accent:</span> <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">{branding.colorPalette.accent}</code>
              </div>
            </div>

            <div className="space-y-2">
              <div 
                className="h-16 rounded-xl border border-white/10 shadow-inner" 
                style={{ backgroundColor: branding.colorPalette.background }}
              ></div>
              <div className="text-xs font-semibold text-center">
                <span className="text-slate-400">Background:</span> <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">{branding.colorPalette.background}</code>
              </div>
            </div>
          </div>
        </div>

        {/* AI Logo Generator Tool */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-200">AI Logo Generator</h2>
              <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> Powered by Open-Generative-AI
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-normal">
              Review the prompt below, then generate a vector-optimized brand icon natively.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/60 font-mono text-xs text-slate-300 relative select-all leading-relaxed">
            {branding.logoPrompt}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {generatedLogo && (
            <div className="mt-4 p-2 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedLogo} alt="Generated Logo" className="rounded-lg max-h-64 object-contain shadow-2xl" />
              <div className="w-full flex justify-end mt-2">
                <a href={generatedLogo} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                  Open Original Image
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Info className="w-3.5 h-3.5" />
              <span>Generates a 1:1 format logo using Flux.</span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center gap-2 border border-white/10 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Prompt
                  </>
                )}
              </button>
              <button
                onClick={generateLogo}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/50 active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4" /> Generate Logo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
