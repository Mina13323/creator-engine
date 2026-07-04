import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Cpu, Zap, Activity } from 'lucide-react';

interface DashboardObservabilityProps {
  observability: {
    totalTokens: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalRuns: number;
    successfulRuns: number;
    successRate: number;
    averageLatencyMs: number;
  };
}

export function DashboardObservability({ observability }: DashboardObservabilityProps) {
  const avgLatencySec = (observability.averageLatencyMs / 1000).toFixed(2);

  return (
    <Card className="bg-gradient-to-b from-[#0f172a] to-[#0c1222] border-slate-800/80 rounded-2xl shadow-xl">
      <CardHeader className="border-b border-slate-800/40 pb-4">
        <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Platform AI Telemetry
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Token Count display */}
        <div className="flex items-center justify-between gap-4 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">LLM Tokens Consumed</span>
            <div className="text-lg font-black text-slate-100 mt-1 font-mono">
              {observability.totalTokens.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">
              P: {observability.totalPromptTokens.toLocaleString()} | C: {observability.totalCompletionTokens.toLocaleString()}
            </p>
          </div>
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        {/* Latency and Execution Count */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Avg Latency</span>
            <div className="text-base font-black text-slate-150 mt-1 font-mono">{avgLatencySec}s</div>
            <p className="text-[8px] text-slate-500 mt-0.5">n8n pipeline latency</p>
          </div>

          <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Total Runs</span>
            <div className="text-base font-black text-slate-150 mt-1 font-mono">{observability.totalRuns}</div>
            <p className="text-[8px] text-slate-500 mt-0.5">Executed tasks queue</p>
          </div>
        </div>

        {/* Success Rate progress section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Agent Success Rate
            </span>
            <span className="font-mono text-emerald-400">{observability.successRate}%</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-1000"
              style={{ width: `${observability.successRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 font-mono">
            <span>{observability.successfulRuns} succeeded</span>
            <span>{observability.totalRuns - observability.successfulRuns} failed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
