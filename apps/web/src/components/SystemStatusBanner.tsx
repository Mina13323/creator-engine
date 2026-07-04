'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

export function SystemStatusBanner() {
  const [status, setStatus] = useState<{ lockdown: boolean; maintenance: boolean } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (document.hidden) return; // Skip network calls when tab is backgrounded
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/system/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch system status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 6000); // Check every 6s

    // Pull instantly when returning to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (dismissed || !status) return null;
  const { lockdown, maintenance } = status;
  if (!lockdown && !maintenance) return null;

  return (
    <div className="w-full z-[100] relative animate-in slide-in-from-top duration-300">
      {lockdown && (
        <div className="bg-rose-950/90 border-b border-rose-500/30 text-rose-200 px-6 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 relative shadow-lg shadow-rose-950/20">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
          <span>
            <strong className="text-white uppercase font-black tracking-wider mr-1">EMERGENCY PROTOCOL ACTIVE:</strong> 
            New user signups and authentication routes are temporarily locked. Access is restricted to system administrators.
          </span>
          <button 
            onClick={() => setDismissed(true)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400/70 hover:text-rose-200 transition-colors p-1 rounded-md"
            title="Dismiss Alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {maintenance && !lockdown && (
        <div className="bg-amber-950/90 border-b border-amber-500/30 text-amber-250 px-6 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 relative shadow-lg shadow-amber-950/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span>
            <strong className="text-white uppercase font-black tracking-wider mr-1">SCHEDULED MAINTENANCE:</strong> 
            Venture engine database operations and AI agent run requests are temporarily offline. Normal operations will resume shortly.
          </span>
          <button 
            onClick={() => setDismissed(true)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-450 hover:text-amber-200 transition-colors p-1 rounded-md"
            title="Dismiss Alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
