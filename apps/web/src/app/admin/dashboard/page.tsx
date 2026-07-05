'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KPICardsRow } from '@/components/admin/KPICardsRow';
import { ModerationFeed } from '@/components/admin/ModerationFeed';
import { useModerationDashboard } from '@/hooks/useModerationDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { adminClient } from '@/lib/adminClient';
import { authClient } from '@/lib/authClient';
import { ChevronLeft, ChevronRight, Wrench, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';

import { VentureFunnel } from '@/components/admin/VentureFunnel';
import { RevenueAnalytics } from '@/components/admin/RevenueAnalytics';
import { DashboardObservability } from '@/components/admin/DashboardObservability';

export const dynamic = 'force-dynamic';

const TrafficChart = dynamic(
  () => import('@/components/admin/TrafficChart').then((mod) => mod.TrafficChart),
  { ssr: false }
);

export default function AdminDashboardPage() {
  const { stats, traffic, feed, handleAction, offset, setOffset, extendedData } = useModerationDashboard();
  const router = useRouter();
  
  // Lockdown controls
  const [lockdown, setLockdown] = useState(false);
  const [lockdownLoading, setLockdownLoading] = useState(false);
  const [lockdownMsg, setLockdownMsg] = useState('');

  // Maintenance & Seeding controls
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  const [chartView, setChartView] = useState<'USERS' | 'PROJECTS'>('USERS');

  // Fetch current lockdown state on mount
  useEffect(() => {
    adminClient.get<{ lockdown: boolean }>('/lockdown')
      .then((res) => setLockdown(res.lockdown ?? false))
      .catch(() => {});
  }, []);

  // Update lockdown UI state when extendedData loaded
  useEffect(() => {
    if (extendedData?.settings) {
      setLockdown(!!extendedData.settings.lockdown);
    }
  }, [extendedData]);

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
      toast.success(res.message || 'Emergency protocol updated.', {
        style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #1e293b' }
      });
    } catch {
      toast.error('Failed to toggle lockdown protocol.');
    } finally {
      setLockdownLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!extendedData?.settings) return;
    const isMaintenance = !!extendedData.settings.maintenance;
    const confirmed = window.confirm(
      isMaintenance
        ? 'Deactivate scheduled maintenance window? Users will be able to create ventures again.'
        : 'Activate maintenance window? This will show a maintenance banner and suspend new project creation.'
    );
    if (!confirmed) return;

    setMaintenanceLoading(true);
    try {
      await adminClient.post('/settings', {
        ...extendedData.settings,
        maintenance: !isMaintenance
      });
      toast.success(isMaintenance ? 'Maintenance deactivated.' : 'Maintenance activated.', {
        style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #1e293b' }
      });
    } catch {
      toast.error('Failed to toggle maintenance mode.');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleSeedPlans = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to seed default billing plans and credit packs? This will upsert them in the database.'
    );
    if (!confirmed) return;

    setSeedingLoading(true);
    try {
      await authClient.post('/payments/seed', {});
      toast.success('Successfully seeded pricing plans & packs!', {
        style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #1e293b' }
      });
    } catch (err) {
      toast.error('Failed to seed plans.');
    } finally {
      setSeedingLoading(false);
    }
  };

  // Humanized welcome greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            {getGreeting()}, Admin
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Here is the live operational intelligence and command center overview for today.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <KPICardsRow stats={stats} />

      {/* Charts & Funnel & Telemetry & Controls Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Left Side Column - Width 4 */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Traffic Chart */}
          <Card className="bg-gradient-to-b from-[#0f172a] to-[#0c1222] border-slate-800/80 rounded-2xl shadow-xl">
            <CardHeader className="border-b border-slate-800/40 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-100">Live Traffic & System Transactions</CardTitle>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                    {offset === 0 ? 'Live (Past 11 Days)' : `Offset: -${offset} days ago`}
                  </p>
                </div>
                <Select value={chartView} onValueChange={(val: any) => setChartView(val)}>
                  <SelectTrigger className="w-[110px] h-7 bg-slate-950/40 border-slate-800/80 text-slate-350 rounded-lg text-[9px] font-bold uppercase tracking-wider font-sans focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select View" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-slate-855 text-slate-300 text-[9px] font-bold uppercase tracking-wider font-sans">
                    <SelectItem value="USERS" className="focus:bg-slate-800 focus:text-white">USERS</SelectItem>
                    <SelectItem value="PROJECTS" className="focus:bg-slate-800 focus:text-white">PROJECTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg border-slate-850 bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-white"
                  onClick={() => setOffset(prev => prev + 11)}
                  title="Go to past dates"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-lg border-slate-850 bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                  onClick={() => setOffset(prev => Math.max(0, prev - 11))}
                  disabled={offset === 0}
                  title="Go to newer dates"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <TrafficChart data={traffic} view={chartView} />
            </CardContent>
          </Card>

          {/* Project Funnel Breakdown */}
          {extendedData && (
            <VentureFunnel statusCounts={extendedData.projectsStatus} />
          )}
        </div>

        {/* Right Side Column - Width 3 */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Command Controls */}
          <Card className="bg-gradient-to-b from-[#0f172a] to-[#0c1222] border-slate-800/80 rounded-2xl shadow-xl">
            <CardHeader className="border-b border-slate-800/40 pb-4">
              <CardTitle className="text-base font-bold text-slate-100">Command Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              
              {/* Manage Users Button */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/25 rounded-2xl transition-colors">
                <h3 className="font-bold text-sm text-indigo-300">Creator Directory Mod</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Elevate/demote roles, manage user wallets, or execute platform accounts suspension.
                </p>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="mt-3.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition-colors"
                >
                  Launch User Directory
                </button>
              </div>

              {/* Lockdown Protocol Button */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                lockdown 
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30' 
                  : 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/25'
              }`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-rose-300">Emergency Protocol</h3>
                  {lockdown && (
                    <span className="text-[9px] font-bold text-rose-200 bg-rose-700/60 border border-rose-500/40 px-2 py-0.5 rounded-md animate-pulse">
                      PROTOCOL ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {lockdown
                    ? 'All consumer signups and non-admin session validation gates are currently locked down.'
                    : 'Instantly lock non-admin signups and authentication routes in case of a service breach.'}
                </p>
                <button
                  onClick={handleLockdown}
                  disabled={lockdownLoading}
                  className={`mt-3.5 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-colors disabled:opacity-50 ${
                    lockdown
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {lockdownLoading ? 'Processing...' : lockdown ? 'Deactivate Protocol' : 'Trigger Lockdown'}
                </button>
              </div>

              {/* Maintenance & Seeding Row */}
              <div className="grid grid-cols-2 gap-3.5">
                
                {/* Toggle Maintenance mode */}
                <div className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  extendedData?.settings?.maintenance
                    ? 'bg-amber-955/25 border-amber-500/40 shadow-md'
                    : 'bg-slate-900/30 border-slate-800/80 hover:border-slate-800'
                }`}>
                  <div>
                    <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      Maintenance
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Display maintenance status window banner.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    disabled={maintenanceLoading || !extendedData}
                    className="mt-3 text-[10px] font-bold bg-slate-850 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 text-center transition-colors"
                  >
                    {maintenanceLoading ? 'Updating...' : extendedData?.settings?.maintenance ? 'Deactivate' : 'Activate'}
                  </button>
                </div>

                {/* Seed default plans */}
                <div className="p-3.5 rounded-2xl border border-slate-800/80 hover:border-slate-800 bg-slate-900/30 text-left flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      Seed Data
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Upsert default pricing plans and packs.
                    </p>
                  </div>
                  <button
                    onClick={handleSeedPlans}
                    disabled={seedingLoading}
                    className="mt-3 text-[10px] font-bold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 py-1.5 px-3 rounded-lg text-center transition-colors"
                  >
                    {seedingLoading ? 'Seeding...' : 'Seed Plans'}
                  </button>
                </div>

              </div>

            </CardContent>
          </Card>

          {/* AI Obs Telemetry Details */}
          {extendedData && (
            <DashboardObservability observability={extendedData.observability} />
          )}
        </div>

      </div>

      {/* Revenue & Subscriptions Analytics Panel */}
      {extendedData && (
        <RevenueAnalytics
          totalRevenue={extendedData.totalRevenue}
          subscriptionDistribution={extendedData.subscriptionDistribution}
          recentPayments={extendedData.recentPayments}
        />
      )}

      {/* Live Event Feed */}
      <Card className="bg-gradient-to-b from-[#0f172a] to-[#0c1222] border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/40 pb-4">
          <CardTitle className="text-base font-bold text-slate-100">Live Operations Feed Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModerationFeed feed={feed} onAction={handleAction} />
        </CardContent>
      </Card>
    </div>
  );
}
