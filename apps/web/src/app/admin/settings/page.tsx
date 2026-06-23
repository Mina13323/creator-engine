'use client';

import { useStore } from '@/store/useStore';

export default function SettingsPage() {
  const { user } = useStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Admin Settings</h1>

      <div className="bg-[#0c1222] border border-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Account Information</h2>
        <p className="text-slate-400 text-sm">Your current administrator account details.</p>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-sm text-slate-500 uppercase tracking-wider">Name</span>
            <span className="text-white font-medium">{user?.name || '—'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-sm text-slate-500 uppercase tracking-wider">Email</span>
            <span className="text-white font-medium">{user?.email || '—'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-sm text-slate-500 uppercase tracking-wider">Role</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/50">
              {user?.role || 'user'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 uppercase tracking-wider">User ID</span>
            <span className="text-slate-400 font-mono text-sm">{user?.id || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
