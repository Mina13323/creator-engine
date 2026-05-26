import React, { useState, useEffect } from 'react';
import { ExternalLink, Info } from 'lucide-react';

export default function AIStudioPanel() {
  const [studioUrl, setStudioUrl] = useState('http://localhost:3001');

  useEffect(() => {
    const loadUrl = () => {
      setStudioUrl(localStorage.getItem('muapi_studio_url') || 'http://localhost:3001');
    };
    
    loadUrl();
    
    window.addEventListener('muapi_settings_updated', loadUrl);
    return () => window.removeEventListener('muapi_settings_updated', loadUrl);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">Advanced AI Studio</h1>
          <p className="text-sm text-slate-500">
            Powered by Open-Generative-AI. Generate images, videos, audio, and more.
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
        {/* Helper overlay that only shows briefly or if the iframe fails to load (though iframes don't easily fire error events cross-origin, it's mostly a fallback visual) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 -z-10 bg-slate-50 text-center px-4">
          <Info className="w-8 h-8 mb-4 text-slate-400" />
          <p className="font-medium text-slate-700">Waiting for AI Studio Backend...</p>
          <p className="text-sm mt-2 text-slate-500 max-w-md">
            If you see an error, make sure Open-Generative-AI is currently running.
          </p>
          <p className="text-xs mt-4 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Current Target: <span className="font-mono">{studioUrl}</span>
          </p>
        </div>

        <iframe 
          src={studioUrl} 
          className="w-full h-full border-none z-10 relative"
          title="Open Generative AI Studio"
          allow="microphone; camera; clipboard-write"
        />
      </div>
    </div>
  );
}
