# Workflow & AI Observability Strategy

## Architecture
To achieve deep visibility into workflow stability and cost, the `@creator/agents` package now natively instruments structured JSON logs during every execution cycle.

These logs are output directly via standard streams (`stdout`/`stderr`), making them instantly consumable by aggregation platforms like **Datadog, Grafana Loki, or Sentry**.

### 1. Workflow Executions (`WORKFLOW_EXECUTION`)
Whenever a backend API initiates a workflow (via `callN8n`), the system tracks its complete lifecycle. 
It captures:
- `workflow`: The target path (e.g. `branding-flow`)
- `status`: `SUCCESS` or `FAILED` (parsed strictly from the n8n response shape or network faults)
- `durationMs`: The round-trip execution latency in milliseconds.
- `error`: Populated if the node crashed or validation failed.

*Example Output:*
```json
{
  "event": "WORKFLOW_EXECUTION",
  "workflow": "founder-analysis-flow",
  "status": "SUCCESS",
  "durationMs": 4250,
  "error": null
}
```

### 2. AI Inference Usage (`AI_INFERENCE`)
Whenever `callFireworksChat` is invoked, the HTTP layer extracts telemetry from the OpenAI-compatible `/completions` response object.
It captures:
- `provider`: Fireworks
- `model`: The model tier used (e.g., `deepseek-v4-flash`)
- `tokensPrompt`: Ingress context size
- `tokensCompletion`: Generation output size
- `durationMs`: Total TTFB + streaming execution latency

*Example Output:*
```json
{
  "event": "AI_INFERENCE",
  "provider": "Fireworks",
  "model": "accounts/fireworks/models/deepseek-v4-flash",
  "durationMs": 3100,
  "tokensPrompt": 2504,
  "tokensCompletion": 890,
  "tokensTotal": 3394,
  "status": "SUCCESS"
}
```

## Dashboard Recommendations
We recommend building the following visual panels inside your Log Aggregator (e.g. Datadog):

1. **Workflow Success Rate (Pie/Gauge)**: 
   - `count(status:SUCCESS) / count(*)` grouped by `workflow`.
   - Alert Threshold: Trigger PagerDuty if Success Rate drops below 95% over a 15-minute window.
2. **AI Latency Heatmap (Heatmap/P99)**:
   - Track `durationMs` for `AI_INFERENCE`.
   - Alert Threshold: If p95 latency exceeds 12 seconds, investigate Fireworks node health.
3. **Token Burn Rate (Timeseries/Bar)**:
   - Sum `tokensTotal` grouped by `workflow`. Use this to calculate actual infrastructure costs per user generation.
4. **Catastrophic Failure Feed (Log Stream)**:
   - Filter stream by `status:FAILED AND event:WORKFLOW_EXECUTION`. This perfectly aligns with the `n8n_webhook` Sentry alerts.
