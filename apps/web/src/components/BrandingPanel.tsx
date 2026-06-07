'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Palette, Copy, Check, X, Info, Sparkles, ImagePlus, Loader2, 
  RefreshCw, BookOpen, Quote, Shield, Compass, Heart
} from 'lucide-react';
import { api } from '../lib/api';

export default function BrandingPanel() {
  const { currentProject, brandIdentity, brandingLoading, generateBranding } = useStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateBranding = async () => {
    if (!currentProject) return;
    try {
      await generateBranding(currentProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateLogo = async () => {
    if (!brandIdentity) return;
    try {
      setIsGeneratingLogo(true);
      setLogoError(null);
      const result = await api.generateImage({
        prompt: brandIdentity.logoPrompt,
        model: 'flux-schnell'
      });
      setGeneratedLogo(result.url);
    } catch (err: any) {
      setLogoError(err.message || 'Failed to generate logo.');
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  // 1. Loading State (Shimmering skeleton cards)
  if (brandingLoading) {
    return (
      <div className="space-y-8 animate-pulse p-1">
        <div className="h-48 rounded-2xl bg-slate-900/50 border border-white/5 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
            <div className="h-8 w-64 bg-slate-800 rounded"></div>
            <div className="h-6 w-96 bg-slate-800 rounded"></div>
          </div>
          <div className="h-10 w-full bg-slate-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-slate-900/50 border border-white/5"></div>
          <div className="h-80 rounded-2xl bg-slate-900/50 border border-white/5 lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  // 2. Empty State (Generate Branding CTA)
  if (!brandIdentity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-8 rounded-2xl border border-white/5 bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center mb-6 shadow-lg shadow-black/50">
          <Palette className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Build Your Visual Identity</h2>
        <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
          Transform your startup business plan into a distinctive, professional brand identity complete with logo prompts, matching color palette, voice guidelines, and core narrative.
        </p>
        <button
          onClick={handleGenerateBranding}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" /> Generate Brand Dossier
        </button>
      </div>
    );
  }

  // 3. Complete Dashboard State
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Brand Identity Overview Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Brand Identity Dossier</span>
          </div>
          <button
            onClick={handleGenerateBranding}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Regenerate Brand
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">
            {brandIdentity.brandName}
          </h1>
          <p className="text-lg text-emerald-400/90 font-medium tracking-wide">
            {brandIdentity.tagline}
          </p>
          <blockquote className="border-l-2 border-indigo-500/30 pl-4 py-1 mt-4 italic text-slate-300 text-sm max-w-3xl leading-relaxed">
            &ldquo;{brandIdentity.slogan}&rdquo;
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 mt-8 border-t border-white/5">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Brand Story
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/30 p-4 rounded-xl border border-white/5">
              {brandIdentity.brandStory}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> Brand Personality
            </h3>
            <div className="flex flex-wrap gap-2">
              {brandIdentity.brandPersonality?.map((trait, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 text-slate-200 shadow-sm hover:border-emerald-500/30 transition-colors"
                >
                  ✨ {trait}
                </span>
              ))}
            </div>
            
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-emerald-400" /> Brand Voice
              </h4>
              {brandIdentity.brandVoice && typeof brandIdentity.brandVoice === 'object' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Check className="w-3.5 h-3.5" /> Do's
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1.5">
                      {brandIdentity.brandVoice.dos?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-1 select-none text-[10px]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-950/15 p-4 rounded-xl border border-rose-500/10 space-y-2">
                    <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <X className="w-3.5 h-3.5" /> Don'ts
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1.5">
                      {brandIdentity.brandVoice.donts?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-500 mt-1 select-none text-[10px]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-white/5">
                  {typeof brandIdentity.brandVoice === 'string' ? brandIdentity.brandVoice : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Identity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colors Palette */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-200">Color System</h2>
            <p className="text-slate-400 text-xs mt-1">Vibrant core HEX values designed for digital presence.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(['primary', 'secondary', 'accent', 'background'] as const).map((colorKey) => {
              const hexVal = brandIdentity.colorPalette[colorKey];
              return (
                <div key={colorKey} className="space-y-2 group">
                  <div 
                    className="h-16 rounded-xl border border-white/10 shadow-lg relative flex items-end p-2 cursor-pointer group-hover:scale-[1.02] transition-transform duration-200" 
                    style={{ backgroundColor: hexVal }}
                    onClick={() => copyToClipboard(hexVal, colorKey)}
                  >
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      {copiedField === colorKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">{colorKey}</span>
                    <code className="text-[11px] font-semibold text-slate-200 font-mono tracking-tight bg-slate-950/80 px-2 py-0.5 rounded border border-white/5">{hexVal}</code>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 text-center leading-relaxed">
            Click swatches to copy hex values directly. Colors match optimal contrast standards.
          </div>
        </div>

        {/* AI Logo Generator Tool */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 lg:col-span-2 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-200">AI Logo Studio</h2>
              <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> FLUX Engine Active
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-normal">
              Below is the custom logo prompt engineered by the Branding Agent. Click generate to build vector assets.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/60 font-mono text-xs text-slate-300 relative select-all leading-relaxed hover:border-white/10 transition-colors">
            {brandIdentity.logoPrompt}
          </div>

          {logoError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" /> {logoError}
            </div>
          )}

          {generatedLogo && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center shadow-inner relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-bold text-slate-400 border border-white/10 bg-slate-900/80 px-2 py-0.5 rounded-md">1024x1024</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedLogo} alt="Generated Logo" className="rounded-lg max-h-56 object-contain shadow-2xl border border-white/10 bg-slate-900" />
              <div className="w-full flex justify-end mt-3">
                <a href={generatedLogo} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold tracking-wide flex items-center gap-1">
                  Download High-Res Vector <Compass className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Transparent 1:1 ratio startup asset bundle.</span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(brandIdentity.logoPrompt, 'logoPrompt')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-all border border-white/10 active:scale-95 flex items-center gap-2"
              >
                {copiedField === 'logoPrompt' ? (
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
                onClick={handleGenerateLogo}
                disabled={isGeneratingLogo}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95"
              >
                {isGeneratingLogo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Assets...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-3.5 h-3.5" /> Generate Logo
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
