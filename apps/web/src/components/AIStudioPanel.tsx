import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

export default function AIStudioPanel() {
  const studioUrl = 'http://localhost:3001';

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">Advanced AI Studio</h1>
          <p className="text-sm text-slate-500">
            Generate images, videos, audio, and more natively.
          </p>
        </div>
        <a 
          href={studioUrl} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          Open in New Tab <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="flex-1 w-full bg-[#0a0a0a] rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[700px]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 -z-10 bg-slate-50 text-center px-4">
          <Info className="w-8 h-8 mb-4 text-slate-400" />
          <p className="font-medium text-slate-700">Waiting for AI Studio Backend...</p>
          <p className="text-sm mt-2 text-slate-500 max-w-md">
            If you see an error, make sure the backend is currently running.
          </p>
        </div>

        <iframe 
          src={studioUrl} 
          className="w-full h-full border-none z-10 relative"
          title="Creator Engine AI Studio"
          allow="microphone; camera; clipboard-write"
        />
      </div>
    </div>
  );
}
