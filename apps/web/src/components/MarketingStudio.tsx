"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { useStore } from "../store/useStore";
import { 
  Button, Card, CardContent, CardHeader, CardTitle, 
  PageHeader, AIThinkingPanel 
} from './design-system';
import { 
  Film, Image as ImageIcon, Music, Zap, Download, X, Play, 
  CheckCircle2, Plus, Clock, Layout, MonitorPlay, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Assets & Options ───────────────────────────────────────────────────────────

const ASSETS = {
  avatar: [
    { id: "aa252283-8591-4d14-91a8-41ce54187992", name: "Priya", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Priya.webp" },
    { id: "ba6c9b18-f79c-4dab-9649-88a181d0a038", name: "Elena", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Elena.webp" },
    { id: "30e2cadd-987c-4a7a-81c3-094d4fb3a65e", name: "Kai", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Kai.webp" },
    { id: "fbed59e1-4b8d-4625-9140-ef2044e0be72", name: "Sora", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Sora.webp" },
    { id: "bcd9e6ee-c000-48e6-9f4b-a20fc2a674f7", name: "Minji", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Minji.webp" },
    { id: "1da384ed-3856-45e4-bf4c-a496c7aa95ff", name: "Margot", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Margot.webp" },
    { id: "b799c8f5-fb6e-4905-b33b-cdefac153ec3", name: "Niko", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Niko.webp" },
    { id: "b6971dd4-55fa-4e64-b318-392b16504284", name: "Jin", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/Jin.webp" }
  ],
  ugc: [
    { id: 1, name: "UGC", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc.mp4" },
    { id: 2, name: "Tutorial", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_how_to.mp4" },
    { id: 3, name: "Unboxing", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_unboxing.mp4" },
    { id: 4, name: "Hyper Motion", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/hyper-motion-mini.mp4" },
    { id: 5, name: "Product Review", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/product_review.mp4" },
    { id: 6, name: "TV Spot", url: "https://d3adwkbyhxyrtq.cloudfront.net/web-app/tv-spot-mini.mp4" }
  ]
};

const OPTIONS = {
  ratio: ["9:16", "3:4", "4:3", "16:9", "1:1"],
  res: ["720p", "1080p"],
  duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
};

// ── Components ───────────────────────────────────────────────────────────────

function UploadSlot({ icon: Icon, url, progress, label, onUpload, onClear, multiple = false, images = [] }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="relative group flex items-center">
      <div 
        onClick={() => inputRef.current?.click()}
        title={`Upload ${label}`}
        className={`relative w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer overflow-hidden ${
          url ? 'border-[#1A73E8] bg-blue-50' : 'border-[rgba(60,64,67,0.12)] bg-[#F8FAFD] hover:border-[#1A73E8] hover:bg-blue-50'
        }`}
      >
        <input 
          ref={inputRef} 
          type="file" 
          accept="image/*"
          className="hidden" 
          multiple={multiple}
          onChange={(e) => onUpload(e)} 
        />
        
        {progress > 0 && progress < 100 ? (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <span className="text-[10px] font-bold text-[#1A73E8]">{progress}%</span>
          </div>
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} className="w-full h-full object-cover" alt={label} />
        ) : (
          <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#1A73E8] transition-colors" />
        )}

        {url && !multiple && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-white text-gray-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200 hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>      
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function MarketingStudio() {
  const PERSIST_KEY = "hg_marketing_studio_persistent";
  
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const { currentProject } = useStore();
  
  const [params, setParams] = useState({
    ratio: "9:16",
    format: ASSETS.ugc[0].name,
    videoUrl: ASSETS.ugc[0].url,
    res: "1080p",
    duration: 5
  });

  const [history, setHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState(0);
  const [genResult, setGenResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState({ product: 0, avatar: 0, additional: 0 });
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [providersStatus, setProvidersStatus] = useState<any>({
    llm: { provider: 'gemini', status: true },
    video: { provider: 'replicate', status: true }
  });

  // ── Persistence ───────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.prompt) setPrompt(data.prompt);
        if (data.params) setParams(data.params);
        if (data.productImage) setProductImage(data.productImage);
        if (data.avatarImage) setAvatarImage(data.avatarImage);
        if (data.additionalImages) setAdditionalImages(data.additionalImages);
        if (data.history) setHistory(data.history);
      }
    } catch (err) { console.warn("Load failed", err); }

    fetch('/api/ai/providers/status')
      .then(res => res.json())
      .then(data => setProvidersStatus(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const state = { prompt, params, productImage, avatarImage, additionalImages, history };
      localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(timer);
  }, [prompt, params, productImage, avatarImage, additionalImages, history]);

  // Handle fake stage progression while generating
  useEffect(() => {
    let stageTimer: any;
    if (isGenerating && genStage < 5) {
      stageTimer = setTimeout(() => {
        setGenStage(prev => prev + 1);
      }, 3000); 
    }
    return () => clearTimeout(stageTimer);
  }, [isGenerating, genStage]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleUpload = async (e: any, target: 'product' | 'avatar' | 'additional') => {
    const files = Array.from(e.target.files) as File[];
    if (!files.length) return;
    
    if (target === 'additional') {
      const remaining = 6 - additionalImages.length;
      const toUpload = files.slice(0, remaining);
      for (const file of toUpload) {
        try {
          const url = await api.uploadFile(file, (pct) => setUploadProgress(p => ({ ...p, additional: pct })));
          setAdditionalImages(prev => [...prev, url].slice(0, 6));
        } catch (err: any) { alert(err.message); }
      }
    } else {
      const file = files[0];
      try {
        const url = await api.uploadFile(file, (pct) => setUploadProgress(p => ({ ...p, [target]: pct })));
        if (target === 'product') setProductImage(url);
        else setAvatarImage(url);
      } catch (err: any) { alert(err.message); }
    }
    setUploadProgress(p => ({ ...p, [target]: 0 }));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("Please enter an ad script.");
    if (!productImage) return alert("Please upload a product image.");
    if (!currentProject?.id) return alert("No active project found.");

    setIsGenerating(true);
    setGenStage(0);
    setGenResult(null);
    try {
      const result = await api.generateMarketingStudioAd({
        projectId: currentProject.id,
        prompt,
        aspect_ratio: params.ratio,
        duration: params.duration,
        images_list: [productImage, avatarImage, ...additionalImages].filter(Boolean),
        video_files: params.videoUrl ? [params.videoUrl] : []
      });

      setGenResult(result);

      if (result?.video?.url || result?.url) {
        const url = result?.video?.url || result?.url;
        const entry = {
          id: Date.now(),
          url: url,
          prompt,
          format: params.format,
          timestamp: new Date().toISOString(),
          script: result.script
        };
        setHistory(prev => [entry, ...prev]);
      }
    } catch (err: any) {
      setGenResult({ status: 'failed', error: err.message });
      alert("Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenStage(5);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const STAGES = [
    { id: '1', label: 'Generating Strategy & Script...', status: genStage >= 1 ? 'completed' : 'active' },
    { id: '2', label: 'Creating product visuals...', status: genStage >= 2 ? 'completed' : genStage === 1 ? 'active' : 'pending' },
    { id: '3', label: 'Animating AI video...', status: genStage >= 3 ? 'completed' : genStage === 2 ? 'active' : 'pending' },
    { id: '4', label: 'Generating Voiceover & Finalizing...', status: genStage >= 4 ? 'completed' : genStage === 3 ? 'active' : 'pending' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-32">
      
      <PageHeader 
        title="Marketing Studio" 
        description="Production-grade AI advertisement studio."
      >
        <div className="flex items-center gap-2 text-xs font-medium bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] px-3 py-1.5 rounded-full">
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
            <span className={`w-2 h-2 rounded-full ${providersStatus.llm?.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
            LLM: {providersStatus.llm?.provider || 'Deepseek'}
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <span className={`w-2 h-2 rounded-full ${providersStatus.video?.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Video: {providersStatus.video?.provider || 'Replicate'}
          </div>
        </div>
      </PageHeader>

      {isGenerating ? (
        <div className="py-20">
          <AIThinkingPanel 
            title="Producing Advertisement..."
            stages={STAGES as any}
          />
        </div>
      ) : genResult ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-end">
             <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your AI Ad is Ready</h2>
             <Button variant="outline" onClick={() => setGenResult(null)}>
               Create Another Ad
             </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Video */}
            <Card className="overflow-hidden">
              <div className="bg-black relative aspect-[9/16] max-h-[600px] flex items-center justify-center group">
                 <video 
                  src={genResult.video?.url || genResult.url} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain" 
                />
              </div>
              <CardContent className="p-4 bg-gray-50 flex items-center justify-between border-t border-[rgba(60,64,67,0.12)]">
                <div className="flex items-center gap-2">
                   <div className="bg-[#1A73E8] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {genResult.video?.generationType === 'COMPOSER_VIDEO' ? 'Composer Video' : 'AI Generated Video'}
                  </div>
                </div>
                <Button onClick={() => downloadFile(genResult.video?.url || genResult.url, `marketing-ad-${Date.now()}.mp4`)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download MP4
                </Button>
              </CardContent>
            </Card>

            {/* Right: Copy & Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Social Post Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{genResult.script?.caption}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                   <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Video Script & Voiceover</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-gray-700 text-sm leading-relaxed italic border-l-4 border-[#1A73E8] pl-4">&quot;{genResult.script?.script}&quot;</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Hashtags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(genResult.script?.hashtags || []).map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-[#1A73E8] text-xs font-medium rounded-full border border-blue-100">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls - 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creative Brief</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Campaign Description</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your ad... e.g. A fast-paced UGC style ad for a new skincare line."
                    rows={4}
                    className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">Brand Assets</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col gap-1 items-center">
                      <UploadSlot 
                        label="Product" 
                        icon={ImageIcon} 
                        url={productImage} 
                        progress={uploadProgress.product} 
                        onUpload={(e: any) => handleUpload(e, 'product')} 
                        onClear={() => setProductImage(null)} 
                      />
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Product</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <UploadSlot 
                        label="Avatar" 
                        icon={ImageIcon} 
                        url={avatarImage} 
                        progress={uploadProgress.avatar} 
                        onUpload={(e: any) => handleUpload(e, 'avatar')} 
                        onClear={() => setAvatarImage(null)} 
                      />
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Avatar</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {history.length > 0 && (
               <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-[#1A73E8]" />
                    Recent Generations
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {history.slice(0, 3).map(entry => (
                       <div key={entry.id} className="relative group rounded-xl overflow-hidden border border-[rgba(60,64,67,0.12)] bg-gray-50 shadow-sm hover:shadow-md transition-all">
                         <video 
                          src={entry.url} 
                          className="w-full aspect-[9/16] object-cover cursor-pointer" 
                          onClick={() => setFullscreenUrl(entry.url)}
                          muted loop onMouseOver={e => (e.target as HTMLVideoElement).play()} onMouseOut={e => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                         />
                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); downloadFile(entry.url, `ad-${entry.id}.mp4`); }} className="p-1.5 bg-white/90 rounded text-gray-700 hover:text-[#1A73E8] shadow-sm">
                             <Download className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                    ))}
                  </div>
               </div>
            )}
          </div>
          
          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorPlay className="w-5 h-5 text-[#1A73E8]" />
                  Production Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Video Format</label>
                  <select 
                    value={params.format}
                    onChange={(e) => {
                      const sel = ASSETS.ugc.find(u => u.name === e.target.value);
                      if (sel) setParams(p => ({ ...p, format: sel.name, videoUrl: sel.url }));
                    }}
                    className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-lg p-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-[#1A73E8] outline-none"
                  >
                    {ASSETS.ugc.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Aspect Ratio</label>
                  <select 
                    value={params.ratio}
                    onChange={(e) => setParams(p => ({ ...p, ratio: e.target.value }))}
                    className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-lg p-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-[#1A73E8] outline-none"
                  >
                    {OPTIONS.ratio.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Duration (sec)</label>
                  <select 
                    value={params.duration}
                    onChange={(e) => setParams(p => ({ ...p, duration: Number(e.target.value) }))}
                    className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-lg p-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-[#1A73E8] outline-none"
                  >
                    {OPTIONS.duration.map(d => <option key={d} value={d}>{d} Seconds</option>)}
                  </select>
                </div>

                <div className="pt-4 mt-4 border-t border-[rgba(60,64,67,0.12)]">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !prompt || !productImage}
                    fullWidth
                    className="py-6 text-base"
                  >
                    <Film className="w-5 h-5 mr-2" />
                    Produce Ad Video
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Fullscreen Preview */}
      {fullscreenUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn" onClick={() => setFullscreenUrl(null)}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <video src={fullscreenUrl} controls autoPlay className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

    </div>
  );
}
