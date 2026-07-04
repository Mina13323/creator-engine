'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { 
  Sliders, 
  Cpu, 
  Coins, 
  ShieldAlert, 
  Save, 
  User, 
  Mail, 
  Activity,
  Wrench,
  AlertCircle,
  FolderLock,
  Loader2
} from 'lucide-react';
import { adminClient } from '@/lib/adminClient';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI Settings State
  const [defaultModel, setDefaultModel] = useState('deepseek-v4-flash');
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [maxTokensPerRun, setMaxTokensPerRun] = useState(150000);

  // Platform limits
  const [freeCredits, setFreeCredits] = useState(50);
  const [maxProjects, setMaxProjects] = useState(5);

  // Security Protocols
  const [lockdown, setLockdown] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  // Alert Settings
  const [flagAlerts, setFlagAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Fetch current saved config on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminClient.get('/settings');
        if (data) {
          setDefaultModel(data.defaultModel || 'deepseek-v4-flash');
          setAiTemperature(data.aiTemperature !== undefined ? data.aiTemperature : 0.7);
          setMaxTokensPerRun(data.maxTokensPerRun || 150000);
          setFreeCredits(data.freeCredits || 50);
          setMaxProjects(data.maxProjects || 5);
          setLockdown(!!data.lockdown);
          setMaintenance(!!data.maintenance);
          setFlagAlerts(data.flagAlerts !== false);
          setWeeklyReports(!!data.weeklyReports);
        }
      } catch (err) {
        console.error('Failed to load global settings:', err);
        toast.error('Failed to load system settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Save changes handler
  const handleSave = async () => {
    setSaving(true);
    try {
      await adminClient.post('/settings', {
        defaultModel,
        aiTemperature,
        maxTokensPerRun,
        freeCredits,
        maxProjects,
        lockdown,
        maintenance,
        flagAlerts,
        weeklyReports
      });
      toast.success('Configuration saved successfully!', {
        style: {
          background: '#0f172a',
          color: '#f1f5f9',
          border: '1px solid #1e293b',
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#0f172a',
        },
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save configuration settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500 pb-12">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-slate-400 mt-1">Configure global venture builder limits, default AI run policies, and platform security rules.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all shrink-0 self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving System Policies...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: AI Agent Orchestration */}
        <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">AI Agent Orchestration</h2>
              <p className="text-xs text-slate-500">Tune LLM execution models & creativity limits.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Default Synthesis Model</label>
              <select 
                value={defaultModel} 
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="deepseek-v4-flash">Deepseek v4 Flash (Recommended)</option>
                <option value="deepseek-v3-pro">Deepseek v3 Pro</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-400">Model Temperature</label>
                <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">{aiTemperature.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.1" 
                value={aiTemperature} 
                onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[10px] text-slate-500 italic">Lower values produce structured results; higher values produce more creative marketing/names.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-400">Max Token Limit Per Execution</label>
                <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">{maxTokensPerRun.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="500000" 
                step="25000" 
                value={maxTokensPerRun} 
                onChange={(e) => setMaxTokensPerRun(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Platform Rule Limits */}
        <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Platform Limits & Rules</h2>
              <p className="text-xs text-slate-500">Global credit thresholds and workspace counts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-400">Free Account Welcome Credits</label>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">{freeCredits} credits</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="5" 
                value={freeCredits} 
                onChange={(e) => setFreeCredits(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-slate-500">Credits automatically granted to user wallets upon email verification.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-400">Maximum Projects Per User</label>
                <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">{maxProjects} projects</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="20" 
                step="1" 
                value={maxProjects} 
                onChange={(e) => setMaxProjects(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <p className="text-[10px] text-slate-500">Imposes limits to curb spam database creation records.</p>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Operation Gates */}
        <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Security & Operational Gates</h2>
              <p className="text-xs text-slate-500">Block registration tunnels or restrict user access routes.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  Emergency Lockdown
                  {lockdown && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />}
                </label>
                <p className="text-[10px] text-slate-400 leading-relaxed">Instantly blocks all logins and authentication tunnels for non-admin accounts.</p>
              </div>
              <button 
                onClick={() => setLockdown(!lockdown)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500/25 ${
                  lockdown 
                    ? 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.3)]' 
                    : 'bg-slate-800'
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                    lockdown ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 border-t border-slate-800/40 pt-4">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  Maintenance Window Mode
                  {maintenance && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />}
                </label>
                <p className="text-[10px] text-slate-400 leading-relaxed">Renders a "Scheduled System Maintenance" banner, disabling database creation queries.</p>
              </div>
              <button 
                onClick={() => setMaintenance(!maintenance)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/25 ${
                  maintenance 
                    ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                    : 'bg-slate-800'
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                    maintenance ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Audit & Administrative Alerts */}
        <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Audit & Admin Notification Logs</h2>
              <p className="text-xs text-slate-500">Configure alert rules for flagged entities.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-200">Email Alerts on Content Flags</label>
                <p className="text-[10px] text-slate-400 leading-relaxed">Send an immediate notification to admin team email when content hits safety flags.</p>
              </div>
              <button 
                onClick={() => setFlagAlerts(!flagAlerts)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${
                  flagAlerts 
                    ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' 
                    : 'bg-slate-800'
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                    flagAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 border-t border-slate-800/40 pt-4">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-200">Weekly System Usage Reports</label>
                <p className="text-[10px] text-slate-400 leading-relaxed">Compile a weekly PDF breakdown of token consumption and user signups.</p>
              </div>
              <button 
                onClick={() => setWeeklyReports(!weeklyReports)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${
                  weeklyReports 
                    ? 'bg-indigo-650 shadow-[0_0_10px_rgba(79,70,229,0.3)]' 
                    : 'bg-slate-800'
                }`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                    weeklyReports ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 5: Account Info */}
        <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4">
            <div className="p-2.5 bg-slate-800/80 text-slate-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-sans">Active Administrative Profile</h2>
              <p className="text-xs text-slate-500">Security attributes of the logged-in admin user.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2 text-xs">
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
              <span className="text-slate-500 uppercase tracking-wider font-mono text-[9px]">Administrator Name</span>
              <div className="text-slate-200 font-bold mt-1 truncate">{user?.name || '—'}</div>
            </div>
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
              <span className="text-slate-500 uppercase tracking-wider font-mono text-[9px]">Administrative Email</span>
              <div className="text-slate-200 font-bold mt-1 truncate select-all">{user?.email || '—'}</div>
            </div>
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
              <span className="text-slate-500 uppercase tracking-wider font-mono text-[9px]">Security Role Privilege</span>
              <div className="mt-1">
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                  {user?.role?.toUpperCase() || 'USER'}
                </span>
              </div>
            </div>
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900">
              <span className="text-slate-500 uppercase tracking-wider font-mono text-[9px]">Database Identifier</span>
              <div className="text-slate-450 font-mono mt-1 truncate select-all">{user?.id || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
