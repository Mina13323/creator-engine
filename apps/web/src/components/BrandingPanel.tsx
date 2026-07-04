'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Button, Card, CardContent, CardHeader, CardTitle, 
  PageHeader, AIThinkingPanel, EmptyState
} from './design-system';
import {
  Palette, Copy, Check, X, Info, Sparkles, ImagePlus, Loader2,
  RefreshCw, BookOpen, Quote, Shield, Compass, Heart, Wand2
} from 'lucide-react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

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

  if (brandingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AIThinkingPanel 
          title="Building Brand Identity..."
          stages={[
            { id: '1', label: 'Extracting narrative from business plan', status: 'completed' },
            { id: '2', label: 'Formulating color psychology', status: 'active' },
            { id: '3', label: 'Generating prompt for logo', status: 'pending' },
          ]}
        />
      </div>
    );
  }

  if (!brandIdentity) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto mt-20">
        <EmptyState
          icon={Palette}
          title="No Brand Identity Yet"
          description="Transform your startup business plan into a distinctive, professional brand identity complete with logo prompts, matching color palette, and voice guidelines."
          actionLabel="Build Brand Identity"
          onAction={handleGenerateBranding}
          isLoading={brandingLoading}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      
      <PageHeader 
        title="Brand Studio" 
        description={`Identity for ${brandIdentity.brandName}`}
      >
        <Button 
          variant="outline" 
          onClick={handleGenerateBranding} 
          disabled={brandingLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Rebuild Brand
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">

        {/* Brand Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#E8F0FE] rounded-2xl">
                <Sparkles className="w-8 h-8 text-[#1A73E8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {brandIdentity.brandName}
                </h2>
                <p className="text-[#1A73E8] font-medium mb-3 text-lg">{brandIdentity.tagline}</p>
                <blockquote className="border-l-4 border-[#1A73E8] pl-4 italic text-gray-600 text-sm leading-relaxed">
                  &ldquo;{brandIdentity.slogan}&rdquo;
                </blockquote>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Story & Personality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Brand Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {brandIdentity.brandStory}
              </p>
            </CardContent>
          </Card>

          <Card hoverable className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Brand Personality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {brandIdentity.brandPersonality?.map((trait: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F8FAFD] text-gray-700 border border-[rgba(60,64,67,0.12)]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand Voice */}
        <Card hoverable>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-[#FBBC04]" />
              Brand Voice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brandIdentity.brandVoice && typeof brandIdentity.brandVoice === 'object' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#e6f4ea] border border-[#ceead6] rounded-xl p-5">
                  <div className="text-xs font-bold text-[#137333] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Do&apos;s
                  </div>
                  <ul className="text-gray-700 text-sm space-y-2">
                    {brandIdentity.brandVoice.dos?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#34A853] mt-0.5 select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-xl p-5">
                  <div className="text-xs font-bold text-[#c5221f] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Don&apos;ts
                  </div>
                  <ul className="text-gray-700 text-sm space-y-2">
                    {brandIdentity.brandVoice.donts?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#EA4335] mt-0.5 select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed">
                {typeof brandIdentity.brandVoice === 'string' ? brandIdentity.brandVoice : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Color System & AI Logo Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Color Palette */}
          <Card hoverable className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#1A73E8]" />
                Color System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {(['primary', 'secondary', 'accent', 'background'] as const).map((colorKey) => {
                  const hexVal = brandIdentity.colorPalette[colorKey];
                  return (
                    <div key={colorKey} className="space-y-2 group">
                      <div
                        className="h-16 rounded-xl border border-[rgba(60,64,67,0.12)] shadow-sm relative flex items-end p-2 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                        style={{ backgroundColor: hexVal }}
                        onClick={() => copyToClipboard(hexVal, colorKey)}
                      >
                        <div className="absolute top-2 right-2 w-6 h-6 rounded bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          {copiedField === colorKey ? <Check className="w-3.5 h-3.5 text-[#34A853]" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs uppercase font-semibold text-gray-500 block mb-0.5">{colorKey}</span>
                        <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{hexVal}</code>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Logo Studio */}
          <Card hoverable className="lg:col-span-2 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="w-5 h-5 text-[#1A73E8]" />
                  AI Logo Studio
                </CardTitle>
                <p className="text-gray-500 text-xs mt-1">
                  Custom logo prompt engineered by AI. Click generate to build vector assets.
                </p>
              </div>
              <span className="text-xs text-[#1A73E8] border border-blue-200 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> FLUX Active
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="p-4 rounded-xl border border-[rgba(60,64,67,0.12)] bg-[#F8FAFD] font-mono text-xs text-gray-600 leading-relaxed select-all">
                {brandIdentity.logoPrompt}
              </div>

              {logoError && (
                <div className="p-3.5 rounded-xl bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" /> {logoError}
                </div>
              )}

              {generatedLogo && (
                <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] flex flex-col items-center relative">
                  <span className="absolute top-3 right-3 text-xs font-bold text-gray-400 border border-[rgba(60,64,67,0.12)] bg-white px-2 py-0.5 rounded-md">1024x1024</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedLogo} alt="Generated Logo" className="rounded-xl max-h-56 object-contain shadow-sm border border-[rgba(60,64,67,0.12)] bg-white" />
                  <div className="w-full flex justify-end mt-4">
                    <a href={generatedLogo} target="_blank" rel="noreferrer" className="text-sm text-[#1A73E8] hover:text-blue-700 font-semibold flex items-center gap-1.5">
                      Download High-Res Vector <Compass className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[rgba(60,64,67,0.12)]">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Transparent 1:1 ratio startup asset bundle.</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(brandIdentity.logoPrompt, 'logoPrompt')}
                    className="text-gray-600"
                  >
                    {copiedField === 'logoPrompt' ? <Check className="w-4 h-4 mr-1.5 text-[#34A853]" /> : <Copy className="w-4 h-4 mr-1.5" />}
                    Copy Prompt
                  </Button>
                  <Button
                    onClick={handleGenerateLogo}
                    disabled={isGeneratingLogo}
                    isLoading={isGeneratingLogo}
                  >
                    <ImagePlus className="w-4 h-4 mr-1.5" />
                    Render Logo
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
