# Creator Engine - Frontend Monitoring Guide

This document outlines the Sentry integration implemented within the Creator Engine Next.js frontend to track UI crashes, trace API failures, and record route exceptions.

## Architecture

The frontend uses the official `@sentry/nextjs` SDK which deeply integrates with Next.js's App Router, Webpack compiler, and global error boundaries.

### 1. Global UI & Route Crashes
- **`src/app/global-error.tsx`**: A catch-all boundary that wraps the entire `RootLayout`. If a catastrophic failure occurs preventing the React tree from rendering entirely, Sentry instantly captures the exception, and the user is presented with a hard-reload fallback UI.
- **`src/app/error.tsx`**: A nested error boundary designed to catch rendering or fetching errors specific to routes. This ensures that if a specific view (like the Dashboard or AI Consultant) crashes, the layout persists, the error is sent to Sentry, and the user receives a contextual "Try Again" prompt.

### 2. API Failure Tracking (`store/errorStore.ts`)
- Our centralized Zustand error store doubles as a telemetry agent. 
- When an AI engine (Branding, Pitch, etc.) or network request fails, the application dispatches an alert payload to `useErrorStore`.
- Before rendering the visual Toast notification, the store automatically executes `Sentry.captureMessage` tagged with `[API Failure]` and the specific `error_code`. This ensures we have analytics on *gracefully handled* failures as well as unhandled crashes.

### 3. Session Replay & Telemetry
- The `sentry.client.config.ts` initializes the `Sentry.replayIntegration`. This automatically records video-like sessions of UI state when a crash occurs.
- **Privacy First**: It is configured with `maskAllText: true` and `blockAllMedia: true` to guarantee zero PII (Personally Identifiable Information) or sensitive startup intellectual property is ever transmitted to the monitoring servers.

## Verification Steps

To verify the integration in production or staging:

1. **Verify Environment Variables**:
   Ensure your hosting environment (Vercel, Docker) exposes the `NEXT_PUBLIC_SENTRY_DSN` variable to the build process.
   ```env
   NEXT_PUBLIC_SENTRY_DSN="https://your-public-key@o0.ingest.sentry.io/0000000"
   ```

2. **Trigger a Handled API Failure**:
   - Temporarily disable your internet connection or invalidate your backend session.
   - Click "Generate Business Plan". 
   - Wait for the Toast UI to appear.
   - Check the Sentry Dashboard for a message titled `[API Failure] Generation Failed: ...`.

3. **Trigger a Hard Crash (React Error Boundary)**:
   - Temporarily add `throw new Error('Test Frontend Crash')` to the top of any `useEffect` in `apps/web/src/components/Dashboard.tsx`.
   - Reload the page.
   - You should see the custom Error Page (`error.tsx`) UI.
   - Check the Sentry Dashboard for the stack trace and the corresponding Session Replay video.
