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
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const bgColors = {
    error: 'bg-red-900/40 border-red-800',
    warning: 'bg-yellow-900/40 border-yellow-800',
    info: 'bg-blue-900/40 border-blue-800'
  };

  const type = error.type || 'error';

  return (
    <div className={`flex flex-col gap-2 p-4 mb-3 rounded-lg border shadow-xl backdrop-blur-md pointer-events-auto transition-all animate-in slide-in-from-right fade-in ${bgColors[type]}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 w-0">
          <h3 className="text-sm font-medium text-white">{error.title}</h3>
          <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{error.message}</p>
          {error.code && <p className="mt-1 text-xs font-mono text-gray-500">Code: {error.code}</p>}
        </div>
        <button
          onClick={() => onRemove(error.id)}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {error.retryAction && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
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
