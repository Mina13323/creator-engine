# n8n Workflows Security & Integration Guide

This document outlines the security mechanisms implemented for the Creator Engine n8n workflows and how to integrate them securely with the backend application.

## 1. Webhook Authentication Layer

All workflow webhook nodes have been updated to require **Header Authentication**. They will immediately reject unauthorized requests, preventing malicious actors from triggering expensive AI generation pipelines.

### Setup in n8n
To ensure the workflows process requests successfully, you must configure the corresponding credential in your n8n instance:

1. Open your n8n dashboard.
2. Go to **Credentials** -> **Add Credential** -> Search for **Header Auth**.
3. Name the credential exactly: `Creator Engine API Key`.
4. Set the **Name** property to: `Authorization`
5. Set the **Value** property to your secure integration token (e.g., `Bearer your_secure_n8n_integration_token`).
6. Save the credential. When you import the JSON workflows, they will automatically link to this credential name.

### Backend API Integration
When the `packages/agents` or `apps/api` code invokes an n8n webhook, it must include the identical authentication header. 

Ensure the backend `.env` includes the required token, and pass it during fetch:
```typescript
const N8N_URL = env.N8N_API_URL;
const N8N_TOKEN = env.N8N_TOKEN; // "your_secure_n8n_integration_token"

const response = await fetch(`${N8N_URL}/webhook/branding-flow`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${N8N_TOKEN}` 
  },
  body: JSON.stringify({ projectId, data })
});
```

## 2. Secrets Management (Environment Variables)

All hardcoded secrets (e.g., `YOUR_FIREWORKS_API_KEY`) have been purged from the JSON workflow files.

### Using Environment Variables in n8n
The HTTP nodes now dynamically resolve secrets using n8n expressions:
`={{"Bearer " + $env.FIREWORKS_API_KEY}}`

To enable this feature safely:
1. Inject `FIREWORKS_API_KEY` into your n8n Docker container or environment.
2. You **must explicitly permit** n8n workflows to access this variable. Add the following to your n8n environment configuration:
   ```bash
   # Add this variable to your n8n Docker run command or docker-compose.yml
   N8N_ENV_VARS=FIREWORKS_API_KEY
   ```

By moving to environment-driven secrets, the JSON workflow definitions are fully sanitized and safe for version control.
