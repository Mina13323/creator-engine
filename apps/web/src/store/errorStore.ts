import { create } from 'zustand';
import * as Sentry from '@sentry/nextjs';

export interface AppError {
  id: string;
  title: string;
  message: string;
  code?: string;
  type?: 'error' | 'warning' | 'info';
  retryAction?: () => Promise<void> | void;
}

interface ErrorState {
  errors: AppError[];
  addError: (error: Omit<AppError, 'id'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  addError: (error) => set((state) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    // Check if an identical error already exists to prevent spam
    const exists = state.errors.some(e => e.title === error.title && e.message === error.message);
    if (exists) return state;

    // Push the handled API failure to Sentry automatically
    Sentry.captureMessage(`[API Failure] ${error.title}: ${error.message}`, {
      level: error.type === 'info' ? 'info' : error.type === 'warning' ? 'warning' : 'error',
      tags: { error_code: error.code || 'UNKNOWN_API_ERROR' }
    });

    return { errors: [...state.errors, { ...error, id, type: error.type || 'error' }] };
  }),
  removeError: (id) => set((state) => ({
    errors: state.errors.filter((e) => e.id !== id)
  })),
  clearErrors: () => set({ errors: [] })
}));
