'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Loader2, ShieldAlert, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, verifyAuth, user, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      verifyAuth().then(() => {
        if (!useStore.getState().isAuthenticated) router.push('/');
      });
    }
  }, [isAuthenticated, verifyAuth, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500">Verifying admin credentials...</p>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-200">Access Denied</h2>
        <p className="text-slate-500 mt-2">You must be an administrator to view this page.</p>
        <button onClick={() => router.push('/')} className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors">
          Return to App
        </button>
      </div>
    );
  }

  const currentPage = pathname.split('/').pop() || 'dashboard';

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans flex flex-col">
      <AdminSidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-slate-800/60 bg-[#0a0f1d]/50 backdrop-blur flex items-center justify-between px-8 z-30">
          <div className="text-slate-400 text-xs tracking-wider flex items-center gap-2">
            <span>ADMIN PORTAL</span>
            <span className="text-slate-700">/</span>
            <span className="text-emerald-400 font-semibold capitalize">{currentPage}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-xs font-medium bg-slate-800/40 px-3 py-1 rounded-full border border-slate-800/30">
              {user?.name || user?.email}
            </span>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
