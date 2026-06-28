'use client';

import React, { useEffect } from 'react';
import { useErrorStore, AppError } from '@/store/errorStore';
import { XCircle, AlertCircle, Info, X, RefreshCcw } from 'lucide-react';

const ToastItem = ({ error, onRemove }: { error: AppError; onRemove: (id: string) => void }) => {
  useEffect(() => {
    // Auto-remove after 8 seconds if there's no retry action, otherwise let user manually dismiss/retry
    if (!error.retryAction) {
      const timer = setTimeout(() => onRemove(error.id), 8000);
      return () => clearTimeout(timer);
    }
  }, [error, onRemove]);

  const handleRetry = async () => {
    if (error.retryAction) {
      onRemove(error.id);
      await error.retryAction();
    }
  };

  const icons = {
    error: (
      <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
        <XCircle className="w-4 h-4 text-rose-450" />
      </div>
    ),
    warning: (
      <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
        <AlertCircle className="w-4 h-4 text-amber-500" />
      </div>
    ),
    info: (
      <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <Info className="w-4 h-4 text-indigo-400" />
      </div>
    )
  };

  const cardStyles = {
    error: 'border-l-3 border-l-rose-500/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(4,8,20)] border-y border-r border-slate-200/80 dark:border-slate-800/60',
    warning: 'border-l-3 border-l-amber-500/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(4,8,20)] border-y border-r border-slate-200/80 dark:border-slate-800/60',
    info: 'border-l-3 border-l-indigo-500/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(4,8,20)] border-y border-r border-slate-200/80 dark:border-slate-800/60'
  };

  const type = error.type || 'error';

  return (
    <div className={`flex flex-col gap-2 p-3.5 mb-3 rounded-xl bg-white dark:bg-[#0c1222]/98 backdrop-blur-lg pointer-events-auto transition-all animate-in slide-in-from-right duration-300 ease-out fade-in ${cardStyles[type]}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 w-0">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">{error.title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">{error.message}</p>
          {error.code && <p className="mt-1 text-[9px] font-mono text-slate-500 dark:text-slate-500">Code: {error.code}</p>}
        </div>
        <button
          onClick={() => onRemove(error.id)}
          className="flex-shrink-0 ml-3 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-md"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      
      {error.retryAction && (
        <div className="flex justify-end mt-1.5">
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#131b2e] dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800/60 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export const ToastContainer = () => {
  const { errors, removeError } = useErrorStore();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 sm:p-6 w-full max-w-sm pointer-events-none flex flex-col justify-end">
      {errors.map((error) => (
        <ToastItem key={error.id} error={error} onRemove={removeError} />
      ))}
    </div>
  );
};
