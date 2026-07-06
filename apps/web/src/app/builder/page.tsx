'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    // Call the API endpoint to start generation
    const res = await fetch('/api/builder/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, ventureId: 'v1' })
    });
    const data = await res.json();
    setProjectId(data.projectId);
  };

  useEffect(() => {
    if (!projectId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/builder/status?projectId=${projectId}`);
      const data = await res.json();
      setStatus(data.project);
      setLogs(data.buildLog?.logs || []);
      
      if (data.project?.previewUrl) {
        setPreviewUrl(data.project.previewUrl);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* Left Panel: Cofounder Chat */}
      <div className="w-1/3 flex flex-col border-r border-gray-700 p-4">
        <h2 className="text-xl font-bold mb-4">AI Cofounder Chat</h2>
        
        <div className="flex-1 overflow-y-auto mb-4 bg-gray-800 p-4 rounded">
          {logs.map((log, i) => (
            <div key={i} className="text-sm text-gray-300 mb-2">{log}</div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Build a website for my AI fitness startup..." 
            className="flex-1 text-black bg-white"
          />
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
      </div>

      {/* Right Panel: Preview / Code / Logs */}
      <div className="w-2/3 flex flex-col p-4 bg-gray-950 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Live Preview</h2>
          <div className="text-sm bg-gray-800 px-3 py-1 rounded">Status: {status.status || 'idle'}</div>
        </div>
        
        {previewUrl ? (
          <iframe 
            src={previewUrl} 
            className="w-full h-full border-none bg-white rounded"
            title="Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full border-2 border-dashed border-gray-700 rounded text-gray-500">
            {status.status === 'building' ? 'Building your application...' : 'Awaiting prompt...'}
          </div>
        )}
      </div>
    </div>
  );
}
