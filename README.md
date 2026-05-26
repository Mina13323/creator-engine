# Creator Engine – AI Venture Builder Monorepo

Creator Engine is a production-grade, AI-native SaaS platform designed to transform a simple business idea into a complete, launch-ready business using a multi-agent AI framework, RAG pipeline, and modern dashboards.

## Architecture & Tech Stack

- **Monorepo**: Turborepo + `pnpm` workspaces
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Zustand
- **Backend API**: Express + TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **AI/Orchestration**: Multi-Agent orchestration, Langflow flows configuration, RAG integrations

## Structure

```
creator-engine/
│
├── apps/
│   ├── web/          # Next.js 15 Dashboard & Builder Frontend
│   ├── api/          # Express/TS Serverless Backend
│   └── langflow/     # Langflow JSON workflows & Custom Python tools
│
└── packages/
    ├── ui/           # Shared Tailwind/React UI components
    ├── database/     # MongoDB connections & models
    ├── agents/       # Multi-agent orchestrator & execution pipeline
    ├── prompts/      # System prompts for 7 AI agents
    ├── rag-core/     # RAG database search & embedding helper
    ├── types/        # TypeScript typing contracts
    └── config/       # Shared TS/ESlint/Tailwind configs
```

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Launch development workspace:
   ```bash
   pnpm dev
   ```
