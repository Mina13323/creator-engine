'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminClient } from '@/lib/adminClient';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ShieldAlert, 
  Cpu, 
  Coins, 
  Activity, 
  Check, 
  AlertTriangle, 
  Trash2,
  Clock,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface AgentRun {
  id: string;
  userId: string;
  projectId: string;
  workflow: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  aiModel: string;
  provider: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  error?: string;
}

interface ObservabilityStats {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  averageTokens: number;
  totalRuns: number;
  workflowBreakdown: Record<string, { count: number; tokens: number }>;
}

interface ProjectForMod {
  id: string;
  name: string;
  userId: string;
  industry: string;
  isFlagged?: boolean;
  flagReason?: string;
  creator?: {
    name?: string;
    email: string;
  } | null;
}

export default function ModerationPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [stats, setStats] = useState<ObservabilityStats | null>(null);
  const [flaggedProjects, setFlaggedProjects] = useState<ProjectForMod[]>([]);
  const [loading, setLoading] = useState(true);

  // Moderation action states
  const [flaggingProject, setFlaggingProject] = useState<ProjectForMod | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [deletingProject, setDeletingProject] = useState<ProjectForMod | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [runsData, statsData, projectsData] = await Promise.all([
        adminClient.get<AgentRun[]>('/agent-runs'),
        adminClient.get<ObservabilityStats>('/observability/stats'),
        adminClient.get<ProjectForMod[]>('/projects'),
      ]);

      setRuns(runsData);
      setStats(statsData);
      // Filter only flagged projects
      setFlaggedProjects(projectsData.filter(p => p.isFlagged));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load live moderation data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll data every 15 seconds for real-time tracking
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleApprove = async (projectId: string) => {
    try {
      await adminClient.post(`/projects/${projectId}/flag`, { flag: false });
      toast.success('Project approved and unflagged.');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve project.');
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flaggingProject) return;

    setIsActionProcessing(true);
    try {
      await adminClient.post(`/projects/${flaggingProject.id}/flag`, { flag: true, reason: flagReason });
      toast.success('Project flagged successfully.');
      setFlaggingProject(null);
      setFlagReason('');
      fetchData();
    } catch (error) {
      toast.error('Failed to flag project.');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    setIsActionProcessing(true);
    try {
      await adminClient.delete(`/projects/${deletingProject.id}`);
      toast.success('Project permanently deleted from DB.');
      setDeletingProject(null);
      setDeleteConfirmName('');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete project.');
    } finally {
      setIsActionProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const successRate = stats && stats.totalRuns > 0 
    ? Math.round((runs.filter(r => r.status === 'success').length / Math.max(1, runs.length)) * 100) 
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Observability & Moderation</h1>
        <p className="text-slate-400 mt-2">Monitor AI agent workflows, token consumption, and audit flagged content queues.</p>
      </div>

      {/* Observability Stats Row */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#0c1222] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total LLM Tokens Burned</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2">{stats.totalTokens.toLocaleString()}</h3>
              <p className="text-slate-500 text-[11px] mt-1">Prompt: {stats.totalPromptTokens.toLocaleString()} | Comp: {stats.totalCompletionTokens.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0c1222] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg. Tokens / Execution</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2">{stats.averageTokens.toLocaleString()}</h3>
              <p className="text-slate-500 text-[11px] mt-1">Based on {stats.totalRuns} total runs</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0c1222] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Agent Success Rate</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2">{successRate}%</h3>
              <p className="text-slate-500 text-[11px] mt-1">Status of live loaded runs</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0c1222] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Flagged Content</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2">{flaggedProjects.length}</h3>
              <p className="text-slate-500 text-[11px] mt-1">Requires admin review</p>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Content Moderation Queue */}
      <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#0d1427] flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Pending Flagged Projects Moderation Queue
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-full">
            {flaggedProjects.length} Flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-[#0c1222] border-b border-slate-800/50">
              <tr>
                <th className="px-6 py-3">Project & Industry</th>
                <th className="px-6 py-3">Creator info</th>
                <th className="px-6 py-3">Flag Reason</th>
                <th className="px-6 py-3 text-right">Moderator Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {flaggedProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200">{p.name}</div>
                    <div className="text-xs text-slate-400 capitalize">{p.industry}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300 font-medium">{p.creator?.name || 'Unnamed'}</div>
                    <div className="text-xs text-slate-500 select-all">UID: {p.userId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-rose-400 bg-rose-500/5 border border-rose-500/10 px-2.5 py-1 rounded-xl block max-w-sm truncate" title={p.flagReason}>
                      {p.flagReason || 'Violation of Platform Rules'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1"
                        onClick={() => handleApprove(p.id)}
                      >
                        <Check className="w-3.5 h-3.5" /> Approve / Unflag
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        onClick={() => {
                          setDeletingProject(p);
                          setDeleteConfirmName('');
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {flaggedProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Moderation queue is clean. No projects are currently flagged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Observability Grid: Workflow breakdown & Agent runs list */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workflow breakdown list */}
        <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl shadow-lg p-6 lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Token Burn by Workflow
          </h3>
          <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto pr-1">
            {stats && Object.entries(stats.workflowBreakdown).map(([workflow, meta]) => (
              <div key={workflow} className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-200 truncate capitalize" title={workflow}>
                    {workflow.replace(/-/g, ' ')}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{meta.count} calls</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {meta.tokens.toLocaleString()} tokens
                  </div>
                </div>
              </div>
            ))}
            {(!stats || Object.keys(stats.workflowBreakdown).length === 0) && (
              <p className="text-sm text-slate-500 py-4 text-center">No token details generated yet.</p>
            )}
          </div>
        </div>

        {/* Live Agent run log stream */}
        <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl shadow-lg lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 bg-[#0d1427] flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Live Agent Execution Logs (Last 50 Runs)
            </h3>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-[#0c1222] border-b border-slate-800/50 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 bg-[#0c1222]">Workflow & Model</th>
                  <th className="px-5 py-3 bg-[#0c1222]">Latency</th>
                  <th className="px-5 py-3 bg-[#0c1222]">Token details</th>
                  <th className="px-5 py-3 bg-[#0c1222] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {runs.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-200 capitalize">{r.workflow.replace(/-/g, ' ')}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{r.aiModel || 'deepseek-v3'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-300">
                      {r.durationMs ? `${(r.durationMs / 1000).toFixed(2)}s` : 'Processing...'}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.totalTokens ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-indigo-300">{r.totalTokens.toLocaleString()} total</span>
                          <span className="text-[9px] text-slate-500">Prompt: {r.promptTokens} | Comp: {r.completionTokens}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {r.status === 'success' ? (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">Success</span>
                      ) : r.status === 'failed' ? (
                        <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold" title={r.error}>Failed</span>
                      ) : (
                        <span className="text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse">Running</span>
                      )}
                    </td>
                  </tr>
                ))}
                {runs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      No agent executions tracked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {deletingProject && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1222] border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Project?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-slate-200">&quot;{deletingProject.name}&quot;</span>?
                This action is <span className="text-rose-500 font-bold uppercase">irreversible</span>.
              </p>

              <div className="mb-6 text-left">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  To confirm deletion, type the project name <span className="font-bold text-slate-200">&quot;{deletingProject.name}&quot;</span> below:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Type project name here"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingProject(null)}
                  disabled={isActionProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteProject}
                  disabled={isActionProcessing || deleteConfirmName !== deletingProject.name}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isActionProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isActionProcessing ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
