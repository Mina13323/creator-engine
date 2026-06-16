# Creator Engine - Production Monitoring Guide

This document outlines the Sentry integration implemented within the Creator Engine API layer to ensure reliable production monitoring, strict observability of AI workflows, and proactive alerts on database degradations.

## Architecture

The API utilizes `@sentry/node` and `@sentry/profiling-node` to trace application faults seamlessly. Sentry is initialized as the absolute first process in the Express lifecycle to guarantee that even startup exceptions (like malformed Zod configurations) are accurately trapped.

## Integration Details

1. **Environment Initialization (`apps/api/src/index.ts`)**:
   - Sentry intercepts the Node.js runtime if `SENTRY_DSN` is present in the environment variables (validated safely via Zod in `env.ts`).
   - We utilize `nodeProfilingIntegration` to automatically record V8 CPU profiles in production, helping debug memory/CPU spikes when handling intensive AI payloads.

2. **Global Error Hook (`apps/api/src/errorHandler.ts`)**:
   - Instead of manually instrumenting every `catch` block in the API, our customized Express `errorHandler` natively pipes *all* `status >= 500` exceptions straight into Sentry.
   - Known operational errors (e.g. `400 Validation Error`, `401 Unauthorized`) are dropped to avoid spamming the observability queue, keeping signal-to-noise ratio high.

3. **Contextual Tagging**:
   - Captured exceptions are automatically tagged with metadata to enable high-speed querying inside the Sentry dashboard:
     - `error_code`: Extracts internal codes like `DATABASE_ERROR` or `AI_PROVIDER_ERROR`.
     - `is_database_error`: Set to `true` when MongoDB experiences a `MongoServerError` (like replication lag, timeout, or dropped connections).
     - `ai_provider`: Defaults to `fireworks` or `none` depending on whether the fault originated during an AI API call.

## Environment-Specific Configuration

The Sentry agent relies on proper `.env` configuration. Ensure your `.env` contains:

```env
# Optional. If omitted, Sentry gracefully stays disabled.
SENTRY_DSN="https://your-public-key@o0.ingest.sentry.io/0000000"

# Tracks whether errors originated from 'development', 'staging', or 'production'
NODE_ENV="production"
```

## Fireworks & MongoDB Observability Strategy
- **MongoDB**: Handled natively by inspecting `MongoServerError` inside `errorHandler.ts`. Connection faults directly trigger PagerDuty alerts configured via Sentry.
- **Fireworks/Gemini**: Captured through the `AI_PROVIDER_ERROR` tag. By filtering via `ai_provider: fireworks` in Sentry, we can set up anomaly detection rules (e.g., alert if AI completions fail > 5 times in 10 minutes).

## n8n Workflow Observability
The AI agents running in local n8n nodes are hardened with global `Error Trigger` nodes. If a workflow fails (due to timeouts, bad JSON, or API faults), the engine posts a diagnostic payload to `POST /internal/alerts`.
- **Sentry Integration**: The Express API intercepts these webhooks and pushes them directly into Sentry using `Sentry.captureMessage()`.
- **Tagging**: These are tagged specifically with `source: n8n_webhook` and `workflow: <WorkflowName>` to isolate them from typical backend API errors.
