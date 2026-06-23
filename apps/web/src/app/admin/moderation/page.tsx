'use client';

import { useModerationDashboard } from '@/hooks/useModerationDashboard';
import { ModerationFeed } from '@/components/admin/ModerationFeed';

export default function ModerationPage() {
  const { feed, handleAction } = useModerationDashboard();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Moderation Queue</h1>
      <p className="text-slate-400">Review newly created projects and monitor AI agent workflows.</p>
      
      <div className="bg-[#0c1222] border border-slate-800 rounded-lg p-6">
        <ModerationFeed feed={feed} onAction={handleAction} />
      </div>
    </div>
  );
}
