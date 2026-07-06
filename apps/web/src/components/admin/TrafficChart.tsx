'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrafficData } from '@/hooks/useModerationDashboard';

type ModalData = {
  title: string;
  color: string;
  count?: number | string;
  items: string[];
  emptyText: string;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const projectNames = payload[0]?.payload?.projectNames;
    const signupNames = payload[0]?.payload?.signupNames;
    const activeUsers = payload[0]?.payload?.activeUsers;
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
        {signupNames && signupNames.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Signups:</p>
            <div className="max-h-[100px] overflow-y-auto pr-1 text-xs text-slate-350 font-mono space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
              {signupNames.map((name: string, idx: number) => (
                <div key={idx} className="truncate select-text">• {name}</div>
              ))}
            </div>
          </div>
        )}
        {activeUsers && activeUsers.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1">
            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Active Users:</p>
            <div className="max-h-[100px] overflow-y-auto pr-1 text-xs text-slate-350 font-mono space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
              {activeUsers.map((name: string, idx: number) => (
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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openModal = useCallback((d: ModalData) => {
    setModalData(d);
    dialogRef.current?.showModal();
  }, []);

  const closeModal = useCallback(() => {
    dialogRef.current?.close();
    setModalData(null);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data && data.length > 0 && selectedDayIndex === null) {
      setSelectedDayIndex(data.length - 1);
    }
  }, [data, selectedDayIndex]);

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

  const selectedDay = selectedDayIndex !== null && data[selectedDayIndex] ? data[selectedDayIndex] : null;

  return (
    <div className="w-full space-y-6">
      <div className="h-[300px] w-full mt-4">
        <AreaChart 
          width={undefined} 
          height={undefined} 
          data={data} 
          margin={{ top: 15, right: 10, left: -25, bottom: 5 }} 
          style={{ width: '100%', height: '100%' }}
          onClick={(state) => {
            if (state && state.activeTooltipIndex !== undefined) {
              setSelectedDayIndex(Number(state.activeTooltipIndex));
            }
          }}
        >
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

      {selectedDay && (
        <div className="pt-5 border-t border-slate-800/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008465] animate-pulse shrink-0" />
              Detailed Report: {selectedDay.time}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Click on the chart to select a day</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Signups */}
            <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl flex flex-col gap-3 min-h-[140px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 font-mono">New Signups</span>
                <span className="text-xs font-mono font-bold text-slate-350">{selectedDay.signups}</span>
              </div>
              <div className="flex-1 max-h-[70px] overflow-hidden text-xs text-slate-400 space-y-1 font-mono">
                {selectedDay.signupNames && selectedDay.signupNames.length > 0 ? (
                  selectedDay.signupNames.slice(0, 3).map((name, idx) => (
                    <div key={idx} className="truncate">• {name}</div>
                  ))
                ) : (
                  <div className="text-slate-600 text-[10px] italic">No user registrations</div>
                )}
                {selectedDay.signupNames && selectedDay.signupNames.length > 3 && (
                  <div className="text-slate-600 text-[10px]">+{selectedDay.signupNames.length - 3} more...</div>
                )}
              </div>
              <button
                onClick={() => openModal({
                  title: 'New Signups',
                  color: '#a855f7',
                  count: selectedDay.signups,
                  items: selectedDay.signupNames ?? [],
                  emptyText: 'No user registrations on this day'
                })}
                className="mt-auto text-[10px] font-bold text-purple-400/70 hover:text-purple-400 transition-colors uppercase tracking-wider font-mono border border-purple-400/20 hover:border-purple-400/50 rounded-lg py-1.5 px-3 flex items-center gap-1.5 w-fit self-start hover:bg-purple-400/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                See Details
              </button>
            </div>

            {/* Column 2: Projects */}
            <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl flex flex-col gap-3 min-h-[140px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">Created Projects</span>
                <span className="text-xs font-mono font-bold text-slate-350">{selectedDay.projectsCount ?? 0}</span>
              </div>
              <div className="flex-1 max-h-[70px] overflow-hidden text-xs text-slate-400 space-y-1 font-mono">
                {selectedDay.projectNames && selectedDay.projectNames.length > 0 ? (
                  selectedDay.projectNames.slice(0, 3).map((name, idx) => (
                    <div key={idx} className="truncate">• {name}</div>
                  ))
                ) : (
                  <div className="text-slate-600 text-[10px] italic">No projects created</div>
                )}
                {selectedDay.projectNames && selectedDay.projectNames.length > 3 && (
                  <div className="text-slate-600 text-[10px]">+{selectedDay.projectNames.length - 3} more...</div>
                )}
              </div>
              <button
                onClick={() => openModal({
                  title: 'Created Projects',
                  color: '#06b6d4',
                  count: selectedDay.projectsCount ?? 0,
                  items: selectedDay.projectNames ?? [],
                  emptyText: 'No projects created on this day'
                })}
                className="mt-auto text-[10px] font-bold text-cyan-400/70 hover:text-cyan-400 transition-colors uppercase tracking-wider font-mono border border-cyan-400/20 hover:border-cyan-400/50 rounded-lg py-1.5 px-3 flex items-center gap-1.5 w-fit self-start hover:bg-cyan-400/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                See Details
              </button>
            </div>

            {/* Column 3: Active Users & Actions */}
            <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl flex flex-col gap-3 min-h-[140px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">Active Users &amp; Actions</span>
                <span className="text-xs font-mono font-bold text-slate-350">{selectedDay.actions} runs</span>
              </div>
              <div className="flex-1 max-h-[70px] overflow-hidden text-xs text-slate-400 space-y-1 font-mono">
                {selectedDay.activeUsers && selectedDay.activeUsers.length > 0 ? (
                  selectedDay.activeUsers.slice(0, 3).map((name, idx) => (
                    <div key={idx} className="truncate">• {name}</div>
                  ))
                ) : (
                  <div className="text-slate-600 text-[10px] italic">No active users today</div>
                )}
                {selectedDay.activeUsers && selectedDay.activeUsers.length > 3 && (
                  <div className="text-slate-600 text-[10px]">+{selectedDay.activeUsers.length - 3} more...</div>
                )}
              </div>
              <button
                onClick={() => openModal({
                  title: 'Active Users & Actions',
                  color: '#10b981',
                  count: `${selectedDay.actions} AI runs`,
                  items: selectedDay.activeUsers ?? [],
                  emptyText: 'No active users on this day'
                })}
                className="mt-auto text-[10px] font-bold text-emerald-400/70 hover:text-emerald-400 transition-colors uppercase tracking-wider font-mono border border-emerald-400/20 hover:border-emerald-400/50 rounded-lg py-1.5 px-3 flex items-center gap-1.5 w-fit self-start hover:bg-emerald-400/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                See Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) closeModal(); }}
        className="rounded-2xl bg-[#0a0f1e] border border-slate-800/80 shadow-2xl p-0 max-w-lg w-full backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        style={{ outline: 'none' }}
      >
        {modalData && (
          <div className="p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: modalData.color }} />
                  <h3 className="text-sm font-black uppercase tracking-widest font-mono" style={{ color: modalData.color }}>
                    {modalData.title}
                  </h3>
                </div>
                {modalData.count !== undefined && (
                  <p className="text-[10px] text-slate-500 font-mono pl-4">Total: {modalData.count}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto pr-1 flex flex-col gap-1">
              {modalData.items.length > 0 ? (
                modalData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/40 transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: modalData.color, opacity: 0.7 }} />
                    <span className="text-xs text-slate-300 font-mono select-all break-all">{item}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-xs italic text-center py-8">{modalData.emptyText}</div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800/60 flex justify-end">
              <button
                onClick={closeModal}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider font-mono border border-slate-700/60 hover:border-slate-600 rounded-lg py-2 px-4 hover:bg-slate-800/40"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
