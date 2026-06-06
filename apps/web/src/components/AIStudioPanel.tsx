'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ImagePlus, Video, FileAudio, FolderHeart, Sparkles, Download, Layers } from 'lucide-react';

type StudioTab = 'image' | 'media' | 'library';

export default function AIStudioPanel() {
  const { currentProject } = useStore();
  const [activeTab, setActiveTab] = useState<StudioTab>('image');
  
  // Image Gen State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('Realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Please select a project to use the AI Studio.
      </div>
    );
  }

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      // Return a placeholder generated image
      setGeneratedImageUrl(`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop`);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">Advanced AI Studio</h1>
          <p className="text-sm text-slate-500">
            Generate images, videos, audio, and brand assets natively.
          </p>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'image' 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <ImagePlus className={`w-5 h-5 ${activeTab === 'image' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Image Generation
          </button>
          
          <button 
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'media' 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Video className={`w-5 h-5 ${activeTab === 'media' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Media Generation
          </button>

          <div className="h-px bg-slate-200 my-2"></div>
          
          <button 
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'library' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <FolderHeart className={`w-5 h-5 ${activeTab === 'library' ? 'text-emerald-600' : 'text-slate-400'}`} />
            Asset Library
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'image' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Create an Image</h2>
                <p className="text-sm text-slate-500">Describe the asset you want to generate for your venture.</p>
              </div>

              <form onSubmit={handleGenerateImage} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Prompt</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="E.g., A minimalist vector logo for a fintech startup, blue and green colors..."
                    className="w-full p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none h-32 text-slate-700"
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Style</label>
                  <div className="flex flex-wrap gap-2">
                    {['Realistic', 'Vector Art', '3D Render', 'Logo Design', 'Minimalist'].map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setImageStyle(style)}
                        disabled={isGenerating}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                          imageStyle === style 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!imagePrompt.trim() || isGenerating}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Asset
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Result Area */}
              {generatedImageUrl && !isGenerating && (
                <div className="pt-8 border-t border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Generated Result</h3>
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[16/9] md:aspect-[21/9]">
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated AI asset" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Save to Library
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                <Video className="w-8 h-8 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Video & Audio Generation</h2>
              <p className="text-slate-500 mb-8 text-sm">
                Create promotional videos, voiceovers, and marketing collateral directly from your text prompts. This feature requires an active API integration.
              </p>
              <button className="flex items-center gap-2 bg-slate-100 text-slate-400 px-6 py-3 rounded-xl font-semibold cursor-not-allowed border border-slate-200">
                <FileAudio className="w-5 h-5" />
                Coming Soon
              </button>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Project Asset Library</h2>
                  <p className="text-sm text-slate-500">All media generated for {currentProject.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock saved assets */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-100 relative">
                      <img 
                        src={`https://images.unsplash.com/photo-${1618005182384 + item}-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop`} 
                        alt="Saved asset placeholder" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm font-medium transition-colors text-sm w-32 justify-center">
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg backdrop-blur-sm font-medium transition-colors text-sm w-32 justify-center">
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-slate-700 truncate">Asset_{item}.png</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Generated via Image Studio</p>
                    </div>
                  </div>
                ))}
                
                {/* Upload new placeholder */}
                <button className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 gap-3">
                  <Layers className="w-8 h-8" />
                  <span className="text-sm font-medium">Upload Asset</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
