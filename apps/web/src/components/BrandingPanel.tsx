'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Palette, Copy, Check, X, Info, Sparkles, ImagePlus, Loader2,
  RefreshCw, BookOpen, Quote, Shield, Compass, Heart, Wand2
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

  // 1. Loading State
  if (brandingLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">Generating Brand Identity...</h2>
          <p className="text-slate-500 mt-2">Building your visual identity and brand voice.</p>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!brandIdentity) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Palette className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Build Your Visual Identity</h1>
        <p className="text-lg text-slate-600">
          Transform your startup business plan into a distinctive, professional brand identity
          complete with logo prompts, matching color palette, voice guidelines, and core narrative.
        </p>
        <div className="pt-8">
          <Button
            onClick={handleGenerateBranding}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-md"
          >
            <Wand2 className="w-5 h-5 mr-3" />
            Generate Brand Dossier
          </Button>
        </div>
      </div>
    );
  }

  // 3. Complete Dashboard
  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <Palette className="text-emerald-500" />
            Brand Identity Dossier
          </h1>
          <p className="text-slate-500 mt-1">{brandIdentity.brandName}</p>
        </div>
        <button
          onClick={handleGenerateBranding}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate Brand
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Brand Overview */}
        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            {brandIdentity.brandName}
          </h2>
          <p className="text-emerald-600 font-medium mb-3">{brandIdentity.tagline}</p>
          <blockquote className="border-l-2 border-slate-200 pl-4 italic text-slate-600 text-sm leading-relaxed">
            &ldquo;{brandIdentity.slogan}&rdquo;
          </blockquote>
        </Card>

        {/* Brand Story & Personality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Brand Story
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {brandIdentity.brandStory}
            </p>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Brand Personality
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {brandIdentity.brandPersonality?.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {trait}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Brand Voice */}
        <Card className="p-6 md:p-8 border-slate-200 shadow-sm rounded-xl bg-white">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Quote className="w-5 h-5 text-amber-500" />
            Brand Voice
          </h3>
          {brandIdentity.brandVoice && typeof brandIdentity.brandVoice === 'object' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Do&apos;s
                </div>
                <ul className="text-slate-700 text-sm space-y-2">
                  {brandIdentity.brandVoice.dos?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 select-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" /> Don&apos;ts
                </div>
                <ul className="text-slate-700 text-sm space-y-2">
                  {brandIdentity.brandVoice.donts?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5 select-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-slate-700 text-sm leading-relaxed">
              {typeof brandIdentity.brandVoice === 'string' ? brandIdentity.brandVoice : ''}
            </p>
          )}
        </Card>

        {/* Color System & AI Logo Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Color Palette */}
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Palette className="w-5 h-5 text-blue-500" />
                Color System
              </h3>
              <p className="text-slate-500 text-xs">Core HEX values for digital presence.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['primary', 'secondary', 'accent', 'background'] as const).map((colorKey) => {
                const hexVal = brandIdentity.colorPalette[colorKey];
                return (
                  <div key={colorKey} className="space-y-1.5 group">
                    <div
                      className="h-14 rounded-lg border border-slate-200 shadow-sm relative flex items-end p-1.5 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                      style={{ backgroundColor: hexVal }}
                      onClick={() => copyToClipboard(hexVal, colorKey)}
                    >
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {copiedField === colorKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-600" />}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{colorKey}</span>
                      <code className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{hexVal}</code>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 text-center">Click swatches to copy hex values.</p>
          </Card>

          {/* AI Logo Studio */}
          <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ImagePlus className="w-5 h-5 text-emerald-500" />
                  AI Logo Studio
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Below is the custom logo prompt engineered by the Branding Agent. Click generate to build vector assets.
                </p>
              </div>
              <span className="text-[10px] text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> FLUX Active
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-600 leading-relaxed select-all">
              {brandIdentity.logoPrompt}
            </div>

            {logoError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" /> {logoError}
              </div>
            )}

            {generatedLogo && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center relative">
                <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-400 border border-slate-200 bg-white px-2 py-0.5 rounded-md">1024x1024</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={generatedLogo} alt="Generated Logo" className="rounded-lg max-h-56 object-contain shadow border border-slate-200 bg-white" />
                <div className="w-full flex justify-end mt-3">
                  <a href={generatedLogo} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                    Download High-Res Vector <Compass className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Transparent 1:1 ratio startup asset bundle.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(brandIdentity.logoPrompt, 'logoPrompt')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all border border-slate-200 active:scale-95 flex items-center gap-2"
                >
                  {copiedField === 'logoPrompt' ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>
                  )}
                </button>
                <Button
                  onClick={handleGenerateLogo}
                  disabled={isGeneratingLogo}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-5 py-2 disabled:opacity-50"
                >
                  {isGeneratingLogo ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Generating...</>
                  ) : (
                    <><ImagePlus className="w-3.5 h-3.5 mr-1" /> Generate Logo</>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
