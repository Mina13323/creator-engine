'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KPICardsRow } from '@/components/admin/KPICardsRow';
import { TrafficChart } from '@/components/admin/TrafficChart';
import { ModerationFeed } from '@/components/admin/ModerationFeed';
import { useModerationDashboard } from '@/hooks/useModerationDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { adminClient } from '@/lib/adminClient';

export default function AdminDashboardPage() {
  const { stats, traffic, feed, handleAction } = useModerationDashboard();
  const router = useRouter();
  const [lockdown, setLockdown] = useState(false);
  const [lockdownLoading, setLockdownLoading] = useState(false);
  const [lockdownMsg, setLockdownMsg] = useState('');

  // Fetch current lockdown state on mount
  useEffect(() => {
    adminClient.get<{ lockdown: boolean }>('/lockdown')
      .then((res) => setLockdown(res.lockdown ?? false))
      .catch(() => {});
  }, []);

  const handleLockdown = async () => {
    const confirmed = window.confirm(
      lockdown
        ? 'Deactivate emergency lockdown? Users will be able to sign up and log in again.'
        : 'Activate emergency lockdown? This will block all non-admin logins and new signups immediately.'
    );
    if (!confirmed) return;

    setLockdownLoading(true);
    try {
      const res = await adminClient.post<{ lockdown: boolean; message: string }>('/lockdown', { active: !lockdown });
      setLockdown(res.lockdown ?? !lockdown);
      setLockdownMsg(res.message || '');
    } catch {
      setLockdownMsg('Failed to toggle lockdown.');
    } finally {
      setLockdownLoading(false);
      setTimeout(() => setLockdownMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Real-time moderation metrics and active system tracking.</p>
      </div>

      {/* KPI Cards Row */}
      <KPICardsRow stats={stats} />

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-[#0c1222] border-slate-800/80 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-100">Live Traffic & Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart data={traffic} />
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-[#0c1222] border-slate-800/80 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Moderation Filters */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
              <h3 className="font-semibold text-emerald-300">Manage Users</h3>
              <p className="text-sm text-slate-400 mt-1">
                View, ban, or unban platform users.
              </p>
              <button
                onClick={() => router.push('/admin/users')}
                className="mt-3 text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Go to Users
              </button>
            </div>

            {/* Emergency Lockdown */}
            <div className={`p-4 rounded-xl border transition-colors ${lockdown ? 'bg-rose-950/40 border-rose-600/60' : 'bg-rose-950/20 border-rose-900/40'}`}>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-rose-300">Emergency Lockdown</h3>
                {lockdown && (
                  <span className="text-xs font-bold text-rose-200 bg-rose-700/60 px-2 py-0.5 rounded-full animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {lockdown
                  ? 'Platform is locked. Non-admin logins and signups are blocked.'
                  : 'Suspend new signups and non-admin logins temporarily.'}
              </p>
              <button
                onClick={handleLockdown}
                disabled={lockdownLoading}
                className={`mt-3 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50 ${
                  lockdown
                    ? 'bg-slate-600 hover:bg-slate-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {lockdownLoading ? 'Processing...' : lockdown ? 'Deactivate' : 'Activate'}
              </button>
              {lockdownMsg && (
                <p className="mt-2 text-xs text-rose-300">{lockdownMsg}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Event Feed */}
      <Card className="bg-[#0c1222] border-slate-800/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-100">Live Event Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModerationFeed feed={feed} onAction={handleAction} />
        </CardContent>
      </Card>
    </div>
  );
}
