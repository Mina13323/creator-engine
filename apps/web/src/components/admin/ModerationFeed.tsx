import { ModerationEvent } from '@/hooks/useModerationDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ModerationFeed({
  feed,
  onAction,
}: {
  feed: ModerationEvent[];
  onAction: (id: string, action: 'Approve' | 'Reject' | 'Ban') => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-400 uppercase bg-[#0c1222] border-b border-slate-800">
          <tr>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {feed.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                No recent events.
              </td>
            </tr>
          )}
          {feed.map((event) => (
            <tr key={event.id} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{event.timestamp}</td>
              <td className="px-4 py-3 font-medium text-slate-200">{event.user}</td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      event.type === 'Flagged Post'
                        ? 'bg-amber-400'
                        : event.type === 'Spam Report'
                        ? 'bg-indigo-400'
                        : 'bg-rose-500'
                    }`}
                  />
                  {event.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={`${
                    event.status === 'Pending'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}
                >
                  {event.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                {event.status === 'Pending' ? (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                      onClick={() => onAction(event.id, 'Approve')}
                    >
                      Ignore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                      onClick={() => onAction(event.id, 'Ban')}
                    >
                      Ban User
                    </Button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Resolved</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
