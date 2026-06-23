# Postman API Integration & Testing Guide

This guide provides step-by-step instructions on how to access, query, and test the Venturekit / Creator Engine REST API using Postman. All operations run directly against your MongoDB Atlas cluster.

---

## 1. Environment & Setup

- **Base URL**: `http://localhost:5000`
- **Default Headers**:
  - `Content-Type`: `application/json`
- **Authentication**: Authenticated endpoints require a JWT token.
  - In Postman: Go to the **Authorization** tab of the request, select **Bearer Token** from the dropdown, and paste the `token` string returned during Login or Signup.
  - Alternatively, set the header: `Authorization: Bearer YOUR_JWT_TOKEN`

---

## 2. Authentication Endpoints

### A. Sign Up (Create User Account)

- **Method**: `POST`
- **Endpoint**: `/api/auth/signup`
- **Request Body (JSON)**:

```json
{
  "email": "test-user@example.com",
  "password": "Password123",
  "name": "Alex Founder"
}
```

- **Response (201 Created)**:

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_1719234567",
    "email": "test-user@example.com",
    "name": "Alex Founder",
    "avatar": null,
    "role": "user",
    "isBanned": false
  }
}
```

### B. Sign In (Login)

- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Request Body (JSON)**:

```json
{
  "email": "test-user@example.com",
  "password": "Password123"
}
```

- **Response (200 OK)**: Contains the JWT `token` to copy/paste into subsequent requests.

### C. Verify / Get Current Profile

- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Auth Required**: Yes (Bearer Token)
- **Response (200 OK)**: Returns the current logged in user details.

### D. Logout

- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Response (200 OK)**: Clears server-side authentication cookies.

```json
{
  "message": "Logged out successfully"
}
```

### E. Developer User Elevation (Secret Endpoint)

- **Method**: `POST`
- **Endpoint**: `/api/auth/elevate`
- **Request Body (JSON)**:

```json
{
  "email": "test-user@example.com",
  "secret": "make-me-admin"
}
```

- **Response (200 OK)**: Elevates user to `admin` role in the database.

### F. Developer User Demotion (Secret Endpoint)

- **Method**: `POST`
- **Endpoint**: `/api/auth/demote`
- **Request Body (JSON)**:

```json
{
  "email": "test-user@example.com",
  "secret": "make-me-user"
}
```

- **Response (200 OK)**: Reverts user back to `user` role in the database.

---

## 3. Project / Venture Endpoints

### A. Create Project

- **Method**: `POST`
- **Endpoint**: `/api/projects`
- **Auth Required**: Yes (Bearer Token)
- **Request Body (JSON)**:

```json
{
  "name": "Acme AI Analytics"
}
```

- **Response (201 Created)**:

```json
{
  "projectId": "proj_1719234599",
  "status": "draft",
  "project": {
    "id": "proj_1719234599",
    "userId": "usr_1719234567",
    "name": "Acme AI Analytics",
    "description": "Project for usr_1719234567",
    "industry": "Unknown",
    "status": "draft"
  }
}
```

### B. List My Projects

- **Method**: `GET`
- **Endpoint**: `/api/projects`
- **Auth Required**: Yes (Bearer Token)
- **Response (200 OK)**: Array of all projects belonging to the logged-in user.

---

## 4. Founder Analysis & Opportunities

### A. Analyze Founder Profile

- **Method**: `POST`
- **Endpoint**: `/api/founder/analyze`
- **Auth Required**: Yes (Bearer Token)
- **Request Body (JSON)**:

```json
{
  "projectId": "proj_1719234599",
  "data": {
    "skills": ["TypeScript", "Marketing", "Management"],
    "experience": "Intermediate",
    "industryInterests": ["SaaS", "E-commerce"],
    "budget": 5000,
    "location": "Cairo, Egypt",
    "availableTime": "Full-time (40+ hrs/wk)",
    "startupGoals": "Build a lifestyle business",
    "riskTolerance": "Medium (Willing to invest savings)",
    "teamSize": "Solo"
  }
}
```

- **Response (201 Created)**: Returns the AI-generated `founderProfile` including weaknesses, strengths, and recommended startup styles.

### B. Discover Startup Opportunities

- **Method**: `POST`
- **Endpoint**: `/api/opportunities/discover`
- **Auth Required**: Yes (Bearer Token)
- **Request Body (JSON)**:

```json
{
  "projectId": "proj_1719234599"
}
```

- **Response (200 OK)**: Returns an array of tailored startup opportunities with scores, MVP timeline, and cost estimates.

### C. Select Opportunity

- **Method**: `POST`
- **Endpoint**: `/api/opportunities/select`
- **Auth Required**: Yes (Bearer Token)
- **Request Body (JSON)**:

```json
{
  "projectId": "proj_1719234599",
  "opportunityId": "opp_1719234612_0_xyz"
}
```

- **Response (200 OK)**: Links the selected opportunity to the project workspace.

---

## 5. Planning & Content Generation

### A. Generate Business Plan (Lean Canvas)

- **Method**: `POST`
- **Endpoint**: `/api/business-plan/generate`
- **Auth Required**: Yes (Bearer Token)
- **Request Body (JSON)**:

```json
{
  "projectId": "proj_1719234599"
}
```

- **Response (200 OK)**: Returns the generated Lean Canvas and detailed business execution plan.

### B. Retrieve Venture State (Dossier)

- **Method**: `GET`
- **Endpoint**: `/api/projects/proj_1719234599/state`
- **Auth Required**: Yes (Bearer Token)
- **Response (200 OK)**: Returns the full dashboard data, including founder profiles, selected opportunities, and generated business plans.

---

## 6. AI Cofounder Chat

### A. Send Chat Message

- **Method**: `POST`
- **Endpoint**: `/api/ai/chat`
- **Auth Required**: Yes (Bearer Token)
- **Request Body (JSON)**:

```json
{
  "projectId": "proj_1719234599",
  "message": "What should be my next step for this SaaS project?"
}
```

- **Response (200 OK)**: Returns the user's message, AI cofounder response, and complete chat history.

### B. Get Chat History

- **Method**: `GET`
- **Endpoint**: `/api/ai/chat/proj_1719234599`
- **Auth Required**: Yes (Bearer Token)
- **Response (200 OK)**: Array of all messages exchanged.

---

## 7. Admin Dashboard Endpoints

_Note: Accessing these requires Bearer Token of a user with `"role": "admin"`._

### A. Get General Portal Stats

- **Method**: `GET`
- **Endpoint**: `/api/admin/stats`
- **Response (200 OK)**: Active users, projects, agent runs, system health, and success rates.

### B. Get Traffic Aggregations

- **Method**: `GET`
- **Endpoint**: `/api/admin/traffic`
- **Response (200 OK)**: 11-day login and action traffic details.

### C. List All Platform Users

- **Method**: `GET`
- **Endpoint**: `/api/admin/users`
- **Response (200 OK)**: Array of all user documents.

### D. Ban / Unban User

- **Method**: `POST`
- **Endpoint**: `/api/admin/users/usr_1719234567/ban`
- **Request Body (JSON)**:

```json
{
  "ban": true
}
```

- **Response (200 OK)**: Updates `isBanned` state in the database.

---

## 8. Step-by-Step Testing Workflow in Postman

1. **Sign Up**: Send a `POST` request to `/api/auth/signup` to create a new user. Copy the `token` string from the JSON response.
2. **Configure Authentication**: Under the **Authorization** tab in Postman, choose **Bearer Token** and paste the copied token. This will automatically authenticate all subsequent workspace requests.
3. **Create Project**: Send a `POST` to `/api/projects` with a project `name`. Copy the returned `projectId` (e.g. `proj_1719...`).
4. **Analyze Founder**: Send a `POST` to `/api/founder/analyze` with the `projectId` and the founder inputs.
5. **Discover Opportunities**: Send a `POST` to `/api/opportunities/discover` with the `projectId`. Copy one of the opportunity `id` values from the returned list.
6. **Select Opportunity**: Send a `POST` to `/api/opportunities/select` with the `projectId` and `opportunityId` to bind it.
7. **Generate Lean Canvas**: Send a `POST` to `/api/business-plan/generate` with the `projectId` to trigger AI business modeling.
8. **Consult AI Cofounder**: Send a `POST` to `/api/ai/chat` to verify the chatbot uses your venture context database parameters.
