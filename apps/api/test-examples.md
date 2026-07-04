# Validation Testing Examples

The following `cURL` commands can be used to verify that the Zod validation middleware is working correctly. They demonstrate how the API rejects invalid payloads and formats the errors cleanly.

### 1. Test Signup Endpoint (Missing Fields)

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}'
```

**Expected Response (HTTP 400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.email",
      "message": "Invalid email address"
    },
    {
      "path": "body.password",
      "message": "Required"
    },
    {
      "path": "body.name",
      "message": "Required"
    }
  ]
}
```

### 2. Test Project Creation (Empty Name)

**Request:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid_token>" \
  -d '{"name": ""}'
```

**Expected Response (HTTP 400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.name",
      "message": "Project name is required"
    }
  ]
}
```

### 3. Test Founder Analysis (Missing Array Item)

**Request:**
```bash
curl -X POST http://localhost:5000/api/founder/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid_token>" \
  -d '{
        "projectId": "proj_123",
        "data": {
          "skills": [],
          "experience": "5 years",
          "budget": -100
        }
      }'
```

**Expected Response (HTTP 400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.data.skills",
      "message": "At least one skill is required"
    },
    {
      "path": "body.data.industryInterests",
      "message": "Required"
    },
    {
      "path": "body.data.budget",
      "message": "Number must be greater than or equal to 0"
    }
  ]
}
```

### 4. Test AI Chat (Missing Project ID)

**Request:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid_token>" \
  -d '{"message": "Hello AI cofounder"}'
```

**Expected Response (HTTP 400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.projectId",
      "message": "Required"
    }
  ]
}
```
