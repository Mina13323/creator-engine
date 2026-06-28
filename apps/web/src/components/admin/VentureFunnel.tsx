import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Layers } from 'lucide-react';

interface VentureFunnelProps {
  statusCounts: Record<string, number>;
}

export function VentureFunnel({ statusCounts }: VentureFunnelProps) {
  const stages = [
    { key: 'draft', label: 'Draft', color: 'from-slate-600 to-slate-500', glow: 'bg-slate-500/10' },
    { key: 'idea', label: 'Idea Pitch', color: 'from-blue-600 to-cyan-500', glow: 'bg-cyan-500/10' },
    { key: 'validated', label: 'Validated', color: 'from-amber-600 to-yellow-500', glow: 'bg-yellow-500/10' },
    { key: 'branded', label: 'Branded', color: 'from-purple-600 to-indigo-500', glow: 'bg-indigo-500/10' },
    { key: 'marketing-ready', label: 'Marketing Ready', color: 'from-pink-600 to-rose-500', glow: 'bg-rose-500/10' },
    { key: 'active', label: 'Launch Active', color: 'from-emerald-600 to-teal-500', glow: 'bg-emerald-500/10' },
    { key: 'archived', label: 'Archived', color: 'from-slate-800 to-slate-700', glow: 'bg-slate-700/5' },
  ];

  // Calculate the max count to scale the bars relatively
  const counts = Object.values(statusCounts);
  const maxCount = Math.max(...counts, 1);

  return (
    <Card className="bg-gradient-to-b from-[#0f172a] to-[#0c1222] border-slate-800/80 rounded-2xl shadow-xl">
      <CardHeader className="border-b border-slate-800/40 pb-4">
        <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Venture Building Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {stages.map((stage) => {
          const count = statusCounts[stage.key] || 0;
          const percentage = Math.round((count / maxCount) * 100);

          return (
            <div key={stage.key} className="space-y-1.5 group">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-2 group-hover:text-slate-100 transition-colors">
                  <span className={`w-2.5 h-2.5 rounded bg-gradient-to-tr ${stage.color}`} />
                  {stage.label}
                </span>
                <span className="font-mono text-slate-400 bg-slate-950/50 border border-slate-855 px-2 py-0.5 rounded-md group-hover:text-emerald-400 transition-colors">
                  {count} {count === 1 ? 'project' : 'projects'}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-950/60 rounded-full overflow-hidden border border-slate-850/50 relative">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
