'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Megaphone, MessageSquareText, Copy, Check, ImagePlus, Loader2, Info } from 'lucide-react';
import { muapi } from '../lib/muapi';

export default function MarketingEngine() {
  const { currentOutputs } = useStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // AI Generation States
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  if (!currentOutputs || !currentOutputs.marketing) {
    return <div className="text-slate-400 text-sm">No marketing campaign dossier loaded.</div>;
  }

  const { marketing } = currentOutputs;

  const copyAdText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateCreative = async (campaign: any, idx: number) => {
    try {
      setGeneratingIndex(idx);
      setErrors(prev => ({ ...prev, [idx]: '' }));
      const prompt = `A highly engaging, professional marketing ad background for ${campaign.platform}. Headline context: ${campaign.headline}. Theme: ${campaign.description.substring(0, 100)}... Clean, modern, eye-catching, no text layout.`;
      
      const result = await muapi.generateImage({
        prompt,
        model: 'flux-schnell',
        aspect_ratio: campaign.platform.toLowerCase().includes('instagram') ? '1:1' : '16:9'
      });
      
      setGeneratedImages(prev => ({ ...prev, [idx]: result.url }));
    } catch (err: any) {
      const errMsg = err.message.includes('API Key missing') 
        ? 'Please set your Muapi API key in the Dashboard settings or localStorage (muapi_key).' 
        : (err.message || 'Failed to generate ad creative.');
      setErrors(prev => ({ ...prev, [idx]: errMsg }));
    } finally {
      setGeneratingIndex(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper overview card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Marketing Strategy Planner</span>
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2">Omnichannel Strategy</h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mb-6">
          {marketing.socialMediaStrategy}
        </p>

        <div className="flex flex-wrap gap-2">
          {marketing.channels.map((ch, idx) => (
            <span key={idx} className="px-3 py-1.5 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-300 text-xs font-semibold">
              {ch}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Content Ideas */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-200">High-Converting Content Ideas</h2>
            <p className="text-slate-400 text-xs mt-0.5">Use these angles for social carousels, threads, and short-form videos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {marketing.contentIdeas.map((idea, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-white/5 bg-slate-950/40 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-200 leading-normal">{idea}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copywriting Templates Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-1.5">
          <MessageSquareText className="w-4 h-4 text-slate-400" /> Ready-to-Publish Copywriting Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketing.campaigns.map((campaign, idx) => {
            const adString = `[${campaign.platform} Ad]\nHeadline: ${campaign.headline}\nBody: ${campaign.description}\nCall to Action: ${campaign.callToAction}`;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      {campaign.platform} Copy
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-white leading-normal pt-1">
                    Headline: <span className="text-slate-300 font-normal">{campaign.headline}</span>
                  </h4>
                  
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5 whitespace-pre-line">
                    {campaign.description}
                  </p>

                  {errors[idx] && (
                    <div className="p-3 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 flex-shrink-0" /> {errors[idx]}
                    </div>
                  )}

                  {generatedImages[idx] && (
                    <div className="mt-4 p-2 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={generatedImages[idx]} alt={`${campaign.platform} Ad Creative`} className="rounded-lg max-h-48 object-cover shadow-2xl w-full" />
                      <div className="w-full flex justify-end mt-2">
                        <a href={generatedImages[idx]} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                          Open Original Image
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[11px] text-slate-500">CTA: <strong>{campaign.callToAction}</strong></span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateCreative(campaign, idx)}
                      disabled={generatingIndex === idx}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-900/50"
                    >
                      {generatingIndex === idx ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-3.5 h-3.5" /> Generate Ad Image
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => copyAdText(adString, idx)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white transition-colors flex items-center gap-1.5 border border-white/5"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Text
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
