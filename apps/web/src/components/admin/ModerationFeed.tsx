import { ModerationEvent } from '@/hooks/useModerationDashboard';
import { Button } from '@/components/ui/button';
import { User, ShieldAlert, FileText, Check, AlertCircle, Cpu, UserPlus } from 'lucide-react';

export function ModerationFeed({
  feed,
  onAction,
}: {
  feed: ModerationEvent[];
  onAction: (id: string, action: 'Approve' | 'Reject' | 'Ban') => void;
}) {
  return (
    <div className="space-y-3.5 p-6">
      {feed.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No recent events logged. System is operating normally.
        </div>
      )}
      {feed.map((event) => {
        // Set style configurations based on event type
        let cardBgClass = 'bg-slate-900/40 border-slate-800/80 hover:border-slate-800';
        let iconContainerClass = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
        let icon = <FileText className="w-4 h-4" />;
        let title = 'New Venture Created';
        let description = event.details || `Project engine initialization completed successfully.`;

        if (event.type === 'Flagged Project') {
          cardBgClass = 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20';
          iconContainerClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
          icon = <ShieldAlert className="w-4 h-4" />;
          title = 'Flagged Content Detected';
          description = event.details || `Project flag review required for venture ID: ${event.id}`;
        } else if (event.type === 'User Signup') {
          cardBgClass = 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20';
          iconContainerClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
          icon = <UserPlus className="w-4 h-4" />;
          title = 'New User Registered';
          description = event.details || `User signed up to the platform.`;
        } else if (event.type === 'Agent Execution') {
          cardBgClass = 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/20';
          iconContainerClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
          icon = <Cpu className="w-4 h-4" />;
          title = 'AI Agent Execution Log';
          description = event.details || `AI agent process thread finalized.`;
        }

        const isFlagged = event.type === 'Flagged Project';

        return (
          <div 
            key={event.id} 
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${cardBgClass}`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${iconContainerClass}`}>
                {icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-200">
                    {title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950/40 border border-slate-900 px-1.5 py-0.5 rounded">
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                  {description}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-400 select-all" title={event.user}>
                    {event.type === 'User Signup' ? 'Email:' : 'Creator:'} {event.user.includes('@') ? event.user : `${event.user.slice(0, 10)}...`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                event.status === 'Pending'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : (event.status as any) === 'Failed' || (event.status as any) === 'Banned'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {event.status}
              </span>
              
              {isFlagged && event.status === 'Pending' ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] h-7 px-2.5 rounded-lg flex items-center gap-1"
                    onClick={() => onAction(event.id, 'Approve')}
                  >
                    <Check className="w-3 h-3" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    className="bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white font-semibold text-[10px] h-7 px-2.5 rounded-lg flex items-center gap-1 transition-all"
                    onClick={() => onAction(event.id, 'Ban')}
                  >
                    <AlertCircle className="w-3 h-3" /> Ban Creator
                  </Button>
                </div>
              ) : (
                event.type === 'Flagged Project' && (
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Audit Resolved
                  </span>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
