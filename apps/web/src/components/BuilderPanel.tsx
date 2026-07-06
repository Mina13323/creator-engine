import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Play, Settings, Wrench, LayoutTemplate, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuilderPanel() {
  const currentProject = useStore((state) => state.currentProject);
  const [prompt, setPrompt] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `builder_project_id_${currentProject?.id || 'v1'}`;
      const saved = localStorage.getItem(storageKey);
      setProjectId(saved);
      if (!saved) {
        setLogs([]);
        setPreviewUrl(null);
        setStatus({});
      }
    }
  }, [currentProject?.id]);
  const [activeTab, setActiveTab] = useState<'canvas' | 'preview'>('canvas');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setLogs(prev => [...prev, `User: ${prompt}`]);
    
    try {
      const res = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          ventureId: currentProject?.id || 'v1',
          businessIdea: currentProject?.name || 'My Startup'
        })
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      if (data.projectId) {
        setProjectId(data.projectId);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`builder_project_id_${currentProject?.id || 'v1'}`, data.projectId);
        }
      }
    } catch (e: any) {
      console.error(e);
      setLogs(prev => [...prev, `[System Error]: ${e.message}`]);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/builder/status?projectId=${projectId}`);
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        if (data.project) {
          setStatus(data.project);
        }
        if (data.buildLog?.logs) {
          setLogs(data.buildLog.logs);
        }
        
        if (data.project?.previewUrl) {
          setPreviewUrl(data.project.previewUrl);
          if (activeTab === 'canvas') setActiveTab('preview');
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Fetch immediately on mount or projectId change
    fetchStatus();

    // Then poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [projectId, activeTab]);

  return (
    <div className="flex h-full w-full bg-[#0E0E0E] text-slate-300 font-sans rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Left Panel: Chat / Agent Console */}
      <div className="w-[340px] flex flex-col border-r border-slate-800 bg-[#141414]">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
              <Code className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-200">AI Builder</span>
          </div>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">v1.0</span>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-indigo-500/20 flex-shrink-0 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm text-slate-200 mb-1">
                I&apos;m your AI Engineer. I know about your project <strong>{currentProject?.name || 'your startup'}</strong>. 
                What kind of website should we build today?
              </div>
            </div>
          </div>

          {logs.map((log, i) => {
            const isUser = log.startsWith('User:');
            const text = isUser ? log.replace('User: ', '') : log;
            
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'items-start gap-3'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 flex items-center justify-center">
                    {log.includes('error') || log.includes('failed') ? (
                      <Wrench className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Settings className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
                
                <div className={`text-sm p-3 rounded-xl max-w-[85%] ${
                  isUser 
                    ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-tr-none' 
                    : 'bg-transparent text-slate-300'
                }`}>
                  {text}
                </div>
              </div>
            );
          })}
          
          {isGenerating && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              </div>
              <div className="text-sm text-slate-400 py-1">Thinking...</div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Message Agent..."
              className="w-full bg-[#1A1A1A] border border-slate-700 rounded-lg pl-3 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 resize-none"
              rows={2}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-2 bottom-3 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Code className="w-3 h-3" /> CodeGen
            </span>
            <span className="text-xs text-slate-500">
              {status.status === 'building' ? 'Building...' : status.status === 'running' ? 'Live' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Workspace */}
      <div className="flex-1 flex flex-col bg-[#0E0E0E] relative overflow-hidden">
        {/* Top Tabs */}
        <div className="h-14 border-b border-slate-800 flex items-center px-4 gap-6">
          <button 
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 text-sm h-full border-b-2 transition-colors ${
              activeTab === 'canvas' ? 'border-indigo-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" /> Canvas
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 text-sm h-full border-b-2 transition-colors ${
              activeTab === 'preview' ? 'border-indigo-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Play className="w-4 h-4" /> Preview
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 flex flex-col">
          {activeTab === 'preview' && previewUrl ? (
            <div className="flex-1 bg-white rounded-lg overflow-hidden border border-slate-700 shadow-xl flex flex-col">
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white px-3 py-1 rounded text-xs text-slate-500 border border-slate-200 flex items-center gap-2 max-w-sm w-full">
                    <span>🔒</span> {previewUrl}
                  </div>
                </div>
              </div>
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-none"
                title="Preview"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-md w-full bg-[#141414] border border-slate-800 rounded-xl p-8 flex flex-col items-center text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                  <Wrench className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Work on multiple tasks in parallel</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Ask the agent to build a new feature, run a build, or edit your database. 
                  The workspace will update automatically.
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <div className="bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg text-xs text-slate-400">Next.js App Router</div>
                  <div className="bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg text-xs text-slate-400">Tailwind CSS v4</div>
                  <div className="bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg text-xs text-slate-400">shadcn/ui</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
