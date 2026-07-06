import { Users, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ModerationStats } from '@/hooks/useModerationDashboard';

export function KPICardsRow({ stats }: { stats: ModerationStats }) {
  const cards = [
    { 
      title: 'Active Users', 
      value: stats.activeUsers.toLocaleString(), 
      icon: Users, 
      color: 'text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30', 
      bgGlow: 'bg-emerald-500/10',
      sub: 'Total registered platform creators' 
    },
    { 
      title: 'Ventures Created', 
      value: stats.totalProjects.toLocaleString(), 
      icon: Activity, 
      color: 'text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30', 
      bgGlow: 'bg-emerald-500/10',
      sub: 'Active business engines' 
    },
    { 
      title: 'AI Workflow Cycles', 
      value: stats.agentRuns.toLocaleString(), 
      icon: Cpu, 
      color: 'text-amber-400 border-amber-500/10 hover:border-amber-500/30', 
      bgGlow: 'bg-amber-500/10',
      sub: `${stats.successRate}% successful pipeline operations` 
    },
    { 
      title: 'Flagged Content', 
      value: stats.flaggedContent, 
      icon: ShieldAlert, 
      color: 'text-rose-400 border-rose-500/10 hover:border-rose-500/30', 
      bgGlow: 'bg-rose-500/10',
      sub: stats.flaggedContent > 0 ? 'Requires immediate action' : 'System is secure' 
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className={`bg-gradient-to-b from-[#0f172a] to-[#0c1222] border rounded-2xl p-5 shadow-xl relative overflow-hidden group transition-all duration-300 cursor-default hover:translate-y-[-2px] ${c.color.split(' ')[1]} ${c.color.split(' ')[2]}`}>
            {/* Ambient Glow */}
            <div className={`absolute -right-4 -bottom-4 w-28 h-28 rounded-full blur-[45px] transition-all duration-500 group-hover:scale-125 opacity-10 group-hover:opacity-20 ${c.bgGlow}`} />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl border bg-slate-950/40 border-slate-900 ${c.color.split(' ')[0]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black text-slate-100 tracking-tight">
                {c.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center font-medium">
                {i === 1 && (
                  <span className="flex h-1.5 w-1.5 relative mr-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                )}
                {c.sub}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
