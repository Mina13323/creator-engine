# Centralized Error Handling Guide

The Creator Engine API uses a robust, centralized error handling middleware to ensure all client responses are standardized, secure, and predictable. Stack traces are never exposed to the client.

## Standard Error Response Format

Regardless of where an error occurs, the API will always return the following JSON structure if a request fails:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] // Optional: Only present if there are validation specifics
  }
}
```

## Error Codes & Types

The global error handler intercepts exceptions and maps them to appropriate HTTP status codes and internal error codes:

| Type | HTTP Status | Internal Code | Trigger |
| :--- | :--- | :--- | :--- |
| **Validation Error** | `400 Bad Request` | `VALIDATION_ERROR` | Triggered automatically when Zod schema parsing fails. Includes a `details` array. |
| **Authentication Error** | `401 Unauthorized` | `UNAUTHORIZED` | Invalid tokens, missing credentials, or expired JWTs. |
| **Duplicate Entry** | `409 Conflict` | `DUPLICATE_ENTRY` | MongoDB duplicate key error (e.g., registering an email that already exists). |
| **Database Error** | `500 Internal Error` | `DATABASE_ERROR` | Mongoose validation failures, cast errors, or database disconnections. |
| **AI Provider Error** | `502 Bad Gateway` | `AI_PROVIDER_ERROR` | Fireworks API timeouts, rate limits, or service disruptions. |
| **Application Error** | *Variable* | *Variable* | Custom thrown errors using `new AppError('Message', statusCode, 'CODE')`. |
| **Unknown Error** | `500 Internal Error` | `INTERNAL_SERVER_ERROR` | Unhandled exceptions. Stack traces are logged to the console but **never** exposed to the client. |

## Throwing Errors in Routes

You no longer need to write `try/catch` blocks or use `res.status().json()` for error flows. We use `express-async-errors`, meaning you can simply throw errors directly inside async route handlers!

**Correct Way:**
```typescript
import { AppError } from './errorHandler';

app.get('/api/projects/:projectId', async (req, res) => {
  const project = await ProjectModel.findById(req.params.projectId);
  
  if (!project) {
    // This will automatically be formatted and sent to the client as a 404!
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  res.json(project);
});
```

The global error handler will automatically catch this, log it securely, and format the JSON response.
