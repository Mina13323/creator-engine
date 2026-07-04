'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrafficData } from '@/hooks/useModerationDashboard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const projectNames = payload[0]?.payload?.projectNames;
    return (
      <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-2xl space-y-1.5 animate-in fade-in duration-200 min-w-[200px]">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{label}</p>
        {payload.map((item: any) => (
          <div key={item.name} className="flex items-center justify-between gap-6">
            <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color || '#6366f1' }} />
              {item.name}
            </span>
            <span className="text-xs font-black text-slate-100 font-mono">{item.value}</span>
          </div>
        ))}
        {projectNames && projectNames.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Created Projects:</p>
            <div className="max-h-[100px] overflow-y-auto pr-1 text-xs text-slate-350 font-mono space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
              {projectNames.map((name: string, idx: number) => (
                <div key={idx} className="truncate select-text">• {name}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function TrafficChart({ data, view }: { data: TrafficData[]; view: 'USERS' | 'PROJECTS' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[300px] w-full mt-4 bg-slate-900/10 animate-pulse rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full mt-4 flex items-center justify-center border border-dashed border-slate-800/80 rounded-2xl text-slate-500 text-xs font-mono">
        Active traffic sync pending...
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <AreaChart width={undefined} height={undefined} data={data} margin={{ top: 15, right: 10, left: -25, bottom: 5 }} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
          </linearGradient>
          <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
          </linearGradient>
          <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.01}/>
          </linearGradient>
          <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(30, 41, 59, 0.4)" />
        <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} style={{ fontFamily: 'monospace' }} />
        <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} style={{ fontFamily: 'monospace' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '10px' }} />
        
        {view === 'USERS' ? (
          <>
            <Area type="monotone" dataKey="signups" name="User Signups" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorSignups)" />
            <Area type="monotone" dataKey="logins" name="User Logins" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLogins)" />
            <Area type="monotone" dataKey="actions" name="User Actions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorActions)" />
          </>
        ) : (
          <Area type="monotone" dataKey="projectsCount" name="Projects Created" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorProjects)" />
        )}
      </AreaChart>
    </div>
  );
}
