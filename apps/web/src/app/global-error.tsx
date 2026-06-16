'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#040814] text-slate-100 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-red-500">A fatal error occurred.</h2>
          <p className="text-slate-400">Our engineering team has been automatically notified.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
