# Creator Engine - Admin Dashboard & Moderation Portal Guide

This document provides a comprehensive overview of the **Admin Dashboard** in the Creator Engine, detailing every page, feature, operational control, and the underlying technical mechanisms that make them work.

---

## Table of Contents
1. [System Architecture & Authentication Flow](#1-system-architecture--authentication-flow)
2. [Dashboard Navigation & Global Layout](#2-dashboard-navigation--global-layout)
3. [Page-by-Page Feature Breakdown](#3-page-by-page-feature-breakdown)
   - [Overview Dashboard](#overview-dashboard)
   - [User Management](#user-management)
   - [Project Management](#project-management)
   - [Observability & Moderation](#observability--moderation)
   - [Subscription Plans Manager](#subscription-plans-manager)
   - [System Settings](#system-settings)
4. [Backend Mechanics & Operational Gates](#4-backend-mechanics--operational-gates)
   - [Emergency Lockdown System](#emergency-lockdown-system)
   - [Scheduled Maintenance Mode](#scheduled-maintenance-mode)
   - [Observability & Token Telemetry Tracking](#observability--token-telemetry-tracking)

---

## 1. System Architecture & Authentication Flow

The Admin Dashboard is a privileged, secure portal decoupled into Next.js frontend pages and Express backend routes.

*   **Frontend Location**: Pages are organized under the App Router path: [apps/web/src/app/admin/](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/)
*   **Backend Location**: Admin controllers and routes are registered in: [apps/api/src/routes/admin.ts](file:///d:/ITI_Final/creator-engine/apps/api/src/routes/admin.ts)

### How Authentication Works:
1.  **Route Protection Middleware**:
    Every route in the backend admin router is wrapped with two core middleware guards:
    *   `authMiddleware`: Validates that the request has a valid JSON Web Token (JWT) session.
    *   `adminMiddleware`: Inspects the database record of the authenticated user to verify that `user.role === 'admin'`. Non-admins receive a `403 Forbidden` response.
2.  **Frontend Layout Guard**:
    The main layout wrapper ([layout.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/layout.tsx)) checks authentication status on mount. If verification fails, users are immediately redirected back to the landing page. If `user.role` is not `'admin'`, access is denied and a secure lockout notification is rendered.
3.  **Global Command Search Palette**:
    Admins can trigger a global search palette overlay from any admin subpage by pressing **Ctrl+K** (or Command+K on macOS). This triggers the [CommandPalette.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/components/admin/CommandPalette.tsx) component, allowing quick navigation between admin modules.

---

## 2. Dashboard Navigation & Global Layout

The administrative sidebar is implemented in [AdminSidebar.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/components/admin/AdminSidebar.tsx) and acts as the central router between modules:

*   **Overview**: Key operational metrics, live system traffic graphs, venture funnels, and emergency state controls.
*   **Users**: Creator directories, privilege modifications, and user lifecycle controls.
*   **Projects**: Visual list of all startup workspaces, workflow progression status, and deletion cascades.
*   **Moderation**: AI agent token observability audit logs and flagged project moderation queue.
*   **Plans**: Customized card managers for different subscription billing tiers (Free, Starter, Pro, Agency, etc.).
*   **Settings**: Global platform configurations, AI temperature sliders, welcome bonus structures, and security overrides.

---

## 3. Page-by-Page Feature Breakdown

### Overview Dashboard
*   **Route**: `/admin/dashboard`
*   **Key Frontend File**: [dashboard/page.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/dashboard/page.tsx)
*   **Primary Hook**: [useModerationDashboard.ts](file:///d:/ITI_Final/creator-engine/apps/web/src/hooks/useModerationDashboard.ts)

#### Features:
1.  **Live Operational KPIs**: A series of key performance indicators tracking active users, total projects, AI agent runs, model execution success rates, and active content flags.
2.  **Live Traffic & Transactions Chart**: Renders a dynamic `TrafficChart` tracking Signups, Logins, and Agent Actions over the last 11 days. Admins can use navigation buttons to change the `offset` parameter, paginating back to view historic traffic.
3.  **Venture Funnel Breakdown**: Summarizes project counts grouped by workspace progression states (e.g. how many ideas are currently *Drafts*, *Validated*, *Branded*, *Marketing-Ready*, *Active*, or *Archived*).
4.  **Revenue Analytics Panel**: Displays cumulative EGP transaction revenue, billing plan distribution, and a list of the 10 most recent payment actions (populated with Stripe payment intent details and creator info).
5.  **Live Operations Feed**: A real-time log displaying the latest 15 operations (new signups, project creations, agent executions, and content flags).
6.  **Emergency Controls**: Quick buttons to toggle **Emergency Lockdown**, **Maintenance Window Mode**, or **Seed Billing Plans** directly from the summary console.
7.  **Real-Time Polling**: The page automatically polls the backend APIs every 15 seconds to keep the telemetry dashboard accurate without manual refreshes.

---

### User Management
*   **Route**: `/admin/users`
*   **Key Frontend File**: [users/page.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/users/page.tsx)

#### Features:
1.  **User Directory Listing**: Displays name, email, role, and current active/banned status.
2.  **Role Promotion & Demotion**: Admins can change user roles from `user` to `admin` or vice-versa using a simple selector. Changing roles triggers a secure confirmation alert to prevent accidental privileges exposure.
3.  **Banning & Suspension**: Admins can toggle a user's ban status. Banned users are rejected immediately during login attempts.
4.  **Account Deletion (Cascade Clean)**: Clicking the delete button opens a confirmation modal warning the admin that deleting the user is irreversible. Performing the deletion executes a cascade cleanup in the database:
    *   Removes the user record (`UserModel`).
    *   Deletes all projects owned by the user (`ProjectModel`).
    *   Cancels active subscriptions associated with their ID (`UserSubscriptionModel`).

---

### Project Management
*   **Route**: `/admin/projects`
*   **Key Frontend File**: [projects/page.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/projects/page.tsx)

#### Features:
1.  **Search and Filter Catalog**: Live query filtering searches project titles, industries, creator details (names/emails), subscription tiers, and system statuses.
2.  **Status Badging**: Projects are styled dynamically depending on their workspace tier (Starter, Pro, Agency) and workflow phase.
3.  **Manual Moderation Flags**: Flag projects violating platform rules (e.g., spam, illegal activity). Allows entering a custom `flagReason` which hides or restricts the project context.
4.  **Edit Project details**: Modal form allowing administrators to update name, industry tags, descriptions, workflow phases, or flag rules.
5.  **Irreversible Deletion Safeguard**: Deleting a project is a high-risk operation. The deletion modal requires typing the exact project name to confirm. When executed, it cleans up all related collections to keep MongoDB tidy:
    *   *Selected opportunities, Business opportunities, Lean Canvas models, Business plans, Brand identities, Marketing campaigns, Pitch decks, Execution roadmaps, Active agent run logs, Uploaded files/documents, and Pinecone/Atlas vector index references.*

---

### Observability & Moderation
*   **Route**: `/admin/moderation`
*   **Key Frontend File**: [moderation/page.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/moderation/page.tsx)

#### Features:
1.  **Token Burn Analytics**: High-level counters tracking total prompt tokens, completion tokens, combined token usage, and average tokens consumed per LLM call.
2.  **Token Usage by Workflow**: Summarizes which AI tasks are consuming the most resources (e.g., business opportunity assessment vs brand name validation).
3.  **Flagged Projects Review Queue**: A specialized table dedicated to projects flagged for policy breaches. Admins can review the flag reason, then click "Approve/Unflag" to restore visibility or "Delete Forever" to clear them.
4.  **Live Agent Execution Logs**: Audits the last 50 LLM agent runs, showing:
    *   **Workflow Type** (e.g., Co-Founder Agent, Opportunity Analyzer).
    *   **Model Used** (e.g., `deepseek-v3`, `gpt-4o-mini`).
    *   **Execution Time (Latency)** in seconds.
    *   **Detailed Token Counts** (Prompt/Completion breakdown).
    *   **Status Indicators**: *Success* (green), *Running* (animating pulse), or *Failed* (red badge with an error message tooltip explaining the API/timeout crash).

---

### Subscription Plans Manager
*   **Route**: `/admin/plans`
*   **Key Frontend File**: [plans/page.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/plans/page.tsx)

#### Features:
1.  **Custom Plan Cards**: Displaying active plans. Each plan tier slug uses a distinct CSS skin to represent its pricing level:
    *   `free`: Industrial grey monochrome border, mono font, Zap icon.
    *   `starter`: Teal botanical gradient, Leaf icon.
    *   `pro`: Neon purple neon-noir glow, Flask icon, and pulsing animation.
    *   `agency`: Golden editorial luxury theme, Crown icon.
    *   `enterprise`: Steel-grey aerospace styling, Cpu icon.
    *   `premium`: Cosmic deep space purple, Sparkles icon.
2.  **Dynamic Feature Toggles**: Add, edit, or remove itemized feature lists associated with pricing tiers.
3.  **Credit Limits & Project Quotas**: Configure how many free credits users receive monthly and the max projects they are allowed to create.
4.  **Delete Safeguard**: The backend prevents deleting any subscription plan that has active subscribers (queries `UserSubscriptionModel` counts and returns a warning code to prevent breaking payment loops).

---

### System Settings
*   **Route**: `/admin/settings`
*   **Key Frontend File**: [settings/page.tsx](file:///d:/ITI_Final/creator-engine/apps/web/src/app/admin/settings/page.tsx)

#### Features:
1.  **AI Agent Tuning**:
    *   **Default Synthesis Model**: Choose which LLM acts as the default brain (`deepseek-v4-flash`, `gemini-1.5-pro`, etc.).
    *   **AI Temperature**: Slider (0.0 to 1.0) adjusting creativity. Lower values enforce strict logical validation; higher values generate creative brand names.
    *   **Max Token Limits**: Caps max tokens per run to limit billing costs.
2.  **Global Limits**:
    *   Configure credits automatically granted to new creators upon sign-up email confirmation.
    *   Cap maximum project workspaces users can create.
3.  **Security Overrides**: Set global operational gates (Emergency Lockdown, Maintenance Mode).
4.  **Admin Alerting rules**: Configure whether admins receive immediate email notifications for safety violations and toggle automatic generation of weekly operational usage reports.
5.  **Active Administrative Profile**: Displays metadata for the logged-in administrator (Role privileges, database IDs) for security audit logging.

---

## 4. Backend Mechanics & Operational Gates

The admin panel routes configure state controllers in the server application entry point ([index.ts](file:///d:/ITI_Final/creator-engine/apps/api/src/index.ts)). These states alter the platform's API request life cycle globally:

### Emergency Lockdown System
*   **State Variable**: `lockdownActive` (boolean)
*   **How it works**:
    1.  Toggled via a POST call to `/api/admin/lockdown`.
    2.  When `true`, the user authentication endpoints check status:
        *   **Signups**: `/api/auth/signup` immediately blocks new registration requests, returning a `503 Service Temporarily Suspended` response.
        *   **Logins**: `/api/auth/login` checks the user role. If the account is a consumer account (non-admin), it blocks the session generation and returns a `503` explaining that the portal is under emergency lockdown. Admins are permitted to login to deactivate the lockdown.

### Scheduled Maintenance Mode
*   **State Variable**: `maintenanceActive` (boolean)
*   **How it works**:
    1.  Toggled via the admin settings post API (`/api/admin/settings`).
    2.  When `true`, project creation and execution gates are closed:
        *   **Project Creation**: `/api/projects` stops validation runs and returns a `503` warning that project creation is suspended.
        *   **AI Workflows**: The main agent execution helper `trackAgentRun` intercepts all incoming requests. If maintenance is active, it throws an error immediately before dispatching requests to the AI agent nodes, preserving API tokens during outages.
        *   **Banner Display**: A status check route `/api/system/status` exposes the active maintenance flags, allowing the React frontend client to render global warnings immediately.

### Observability & Token Telemetry Tracking
*   **MongoDB Model**: `AgentRunModel`
*   **How it works**:
    Every action taken by a co-founder agent is tracked. The backend wraps executions inside the `trackAgentRun` function:
    1.  On start, it logs an execution record in MongoDB with a `running` status, recording the user ID, project ID, workflow target, and the fireworks provider.
    2.  When the agent completes, the database document updates the status to `success`, caching latency times, prompt tokens, and completion tokens.
    3.  If the execution throws an error (e.g. rate limits or API key timeouts), the document records the status as `failed` and saves the stack trace in the `error` field.
    4.  The dashboard observability tab aggregates these records via MongoDB aggregation pipelines (`$group`, `$sum`, `$cond`), presenting total operational token costs in real-time.
