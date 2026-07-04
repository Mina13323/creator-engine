# Creator Engine n8n Error Handling & Recovery Strategy

This document outlines the standardized error handling, fallback strategies, and retry mechanisms configured across all Creator Engine n8n workflows.

## 1. Retry Logic (HTTP Nodes)
To handle transient network failures or rate limits from external AI providers (like Fireworks AI), all AI-bound HTTP request nodes are configured with native retry logic:
- `retryOnFail`: True
- `maxTries`: 3
- `waitBetweenTries`: 2000 ms (2 seconds)
- **Effect**: If an AI provider responds with a 429 or 500, n8n automatically pauses and retries the request up to 3 times before declaring a hard failure.

## 2. Workflow-Level Error Handling
Instead of allowing individual nodes to crash silently or return raw stack traces to the webhook initiator, every workflow implements a global **Error Trigger**:
- **Trigger**: The `Error Trigger` node intercepts any unhandled exception (e.g., node failure after 3 retries, payload parsing failure).
- **Sanitization**: A Code node catches the execution error and strips out sensitive internal data (stack traces, paths).
- **Failure Notification**: An HTTP Request node fires an alert to the internal alerting system (`http://api.creatorengine.local/internal/alerts`) with the sanitized error message and the originating workflow name.

## 3. Fallback Responses
When a workflow experiences a hard crash, it stops processing the main branch. 
Because our primary access pattern relies on synchronous Webhook nodes (`webhookResponseMode: "lastNode"`), n8n responds to the backend with an HTTP 500 (Internal Server Error) without exposing the raw error trace.

**Graceful Recovery in the API Layer**:
Our Node.js API (`callN8n` helper in `@creator/agents`) treats any non-200 HTTP response from n8n as a workflow failure.
```typescript
try {
  // Call n8n webhook
  if (!response.ok) throw new Error(`n8n responded with status ${response.status}`);
} catch (e) {
  // Workflow failed! Fallback to local AI or Hardcoded Data
  return null; 
}
```
If `null` is returned, the backend automatically switches to its secondary LLM provider or hardcoded mock data, ensuring the end user *never* sees an error state and the frontend dashboard loads successfully.

## 4. Operational Settings
Every workflow's core settings have been audited:
- `saveDataErrorExecution`: `"all"` (Allows debugging of failed runs in the n8n execution UI).
- `saveDataSuccessExecution`: `"none"` (Prevents database bloat and ensures GDPR/privacy compliance by not storing successful prompt/user data).
- `saveManualExecutions`: `true` (Allows testing).
- `callerPolicy`: `"workflowsFromSameOwner"` (Prevents cross-tenant workflow injections).

## 5. Recovery Procedures
If a workflow repeatedly fails and triggers internal alerts:
1. Open the n8n Execution Logs.
2. Filter by "Failed". Because `saveDataErrorExecution` is enabled, the complete payload and exact failing node will be visible.
3. If the error originates from the AI node, verify the API key and prompt schema.
4. If the error originates from a data mismatch, check the incoming Webhook payload shape against `@creator/types`.
