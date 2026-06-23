import { Users, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModerationStats } from '@/hooks/useModerationDashboard';

export function KPICardsRow({ stats }: { stats: ModerationStats }) {
  const cards = [
    { title: 'Registered Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'text-indigo-400', sub: 'Total registered' },
    { title: 'Total Projects', value: stats.totalProjects.toLocaleString(), icon: Activity, color: 'text-emerald-400', sub: 'Active ventures' },
    { title: 'Agent Workflows', value: stats.agentRuns.toLocaleString(), icon: AlertTriangle, color: 'text-amber-400', sub: `${stats.successRate}% success rate` },
    { title: 'Flagged Projects', value: stats.flaggedContent, icon: ShieldAlert, color: 'text-rose-500', sub: 'Pending review' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Card key={i} className="bg-[#0c1222] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{c.title}</CardTitle>
            <c.icon className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${i === 3 ? 'text-rose-500' : 'text-white'}`}>{c.value}</div>
            <p className={`text-xs mt-1 flex items-center ${i === 2 && stats.successRate < 90 ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>
              {i === 1 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />}
              {c.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
