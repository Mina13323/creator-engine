# Graph Report - .  (2026-06-05)

## Corpus Check
- Corpus is ~41,621 words - fits in a single context window. You may not need a graph.

## Summary
- 779 nodes · 838 edges · 94 communities (58 shown, 36 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Data Models & Schemas|Data Models & Schemas]]
- [[_COMMUNITY_Web App Config|Web App Config]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Dashboard Features|Dashboard Features]]
- [[_COMMUNITY_Langflow Tools|Langflow Tools]]
- [[_COMMUNITY_API Server Setup|API Server Setup]]
- [[_COMMUNITY_Root Package Config|Root Package Config]]
- [[_COMMUNITY_Mongoose Models|Mongoose Models]]
- [[_COMMUNITY_AI Venture Agents|AI Venture Agents]]
- [[_COMMUNITY_Tailwind Styling|Tailwind Styling]]
- [[_COMMUNITY_Web TypeScript Config|Web TypeScript Config]]
- [[_COMMUNITY_Turbo Workspace|Turbo Workspace]]
- [[_COMMUNITY_Landing Page|Landing Page]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Graphify Scripts|Graphify Scripts]]
- [[_COMMUNITY_n8n Workflows|n8n Workflows]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 25 edges
2. `useStore` - 16 edges
3. `compilerOptions` - 15 edges
4. `compilerOptions` - 13 edges
5. `compilerOptions` - 10 edges
6. `request()` - 10 edges
7. `callLLM()` - 9 edges
8. `scripts` - 8 edges
9. `orchestrateVentureBuilder()` - 8 edges
10. `AGENT_PROMPTS` - 8 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `generateFinancialPrediction()`  [INFERRED]
  apps/web/src/app/api/predictFinances/route.ts → packages/rag-core/src/ragService.ts
- `GET()` --calls--> `connectDB()`  [INFERRED]
  apps/web/src/app/api/financials/[projectId]/route.ts → packages/database/src/index.ts
- `POST()` --calls--> `connectDB()`  [INFERRED]
  apps/web/src/app/api/predictFinances/route.ts → packages/database/src/index.ts
- `POST /api/ai/chat` --calls--> `runCofounderAgent()`  [EXTRACTED]
  apps/api/src/index.ts → packages/agents/src/index.ts
- `POST /api/projects` --calls--> `orchestrateVentureBuilder()`  [EXTRACTED]
  apps/api/src/index.ts → packages/agents/src/index.ts

## Import Cycles
- 2-file cycle: `apps/web/src/lib/authClient.ts -> apps/web/src/store/useStore.ts -> apps/web/src/lib/authClient.ts`

## Communities (94 total, 36 thin omitted)

### Community 0 - "Data Models & Schemas"
Cohesion: 0.09
Nodes (33): AppPage(), PROTECTED_TABS, Dashboard(), NAME_IDEAS, Onboarding(), UNIQUE_IDEAS, muapi, cn() (+25 more)

### Community 1 - "Web App Config"
Cohesion: 0.04
Nodes (42): POST(), KnowledgeDocument, POST(), PredictPayloadSchema, GET(), { connectDB, ProjectModel, FounderProfileModel, BusinessIdeaModel, BusinessValidationModel, BusinessModelModel, BrandIdentityModel, MarketingCampaignModel, ExecutionRoadmapModel }, mongoose, { orchestrateVentureBuilder } (+34 more)

### Community 2 - "UI Components"
Cohesion: 0.05
Nodes (22): Record, str, Record, str, Record, Record, str, CustomComponent (+14 more)

### Community 3 - "Dashboard Features"
Cohesion: 0.06
Nodes (33): AgentRun, AuthResponse, AuthUser, BrandIdentity, BrandIdentityModel, BusinessIdea, BusinessIdeaModel, BusinessModel (+25 more)

### Community 4 - "Langflow Tools"
Cohesion: 0.07
Nodes (28): dependencies, bcryptjs, cookie-parser, cors, @creator/agents, @creator/database, @creator/types, dotenv (+20 more)

### Community 5 - "API Server Setup"
Cohesion: 0.07
Nodes (27): devDependencies, next, prettier, react, react-dom, turbo, @types/node, @types/react (+19 more)

### Community 6 - "Root Package Config"
Cohesion: 0.15
Nodes (18): AGENT_PROMPTS, callLLM(), embedText(), KNOWLEDGE_BASE, KnowledgeDocument, orchestrateVentureBuilder(), POST /api/ai/chat, POST /api/projects (+10 more)

### Community 7 - "Mongoose Models"
Cohesion: 0.08
Nodes (25): dependencies, @base-ui/react, class-variance-authority, clsx, @creator/rag-core, @creator/types, framer-motion, lucide-react (+17 more)

### Community 8 - "AI Venture Agents"
Cohesion: 0.08
Nodes (15): Multi-Agent System, RAG Architecture, faqItems, formationItems, LandingPage(), LandingPageProps, logoMarks, reveal (+7 more)

### Community 9 - "Tailwind Styling"
Cohesion: 0.09
Nodes (23): dependencies, @langchain/openai, mongodb, mongoose, @pinecone-database/pinecone, zod, description, engines (+15 more)

### Community 10 - "Web TypeScript Config"
Cohesion: 0.10
Nodes (21): active, connections, Code in JavaScript, Embeddings OpenAI, Message a model, MongoDB Vector Search, Webhook, ai_embedding (+13 more)

### Community 11 - "Turbo Workspace"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "Landing Page"
Cohesion: 0.12
Nodes (4): ASSETS, OPTIONS, api, ApiClient

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (14): dependencies, @creator/prompts, @creator/rag-core, @creator/types, devDependencies, @types/node, typescript, main (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, resolveJsonModule (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (12): dependencies, @creator/types, mongoose, devDependencies, typescript, main, name, private (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (12): dependencies, @creator/database, devDependencies, @types/node, typescript, main, name, private (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (11): Claude Graphify Config, Creator Engine Claude Rules, Graphify Build Step, Graphify Detect Step, Graphify Extract Step, Graphify Skill, Extraction Subagent Prompt, Graph Traversal (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (5): app, authMiddleware(), googleClient, inMemoryDB, verifyToken()

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (9): Skills CLI, Find Skills Skill, computedHash, skillPath, source, sourceType, skills, frontend-design (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.38
Nodes (9): checkEmail(), get(), getMe(), googleLogin(), login(), logout(), post(), request() (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (9): Gemini Chat Model Node, Financial Deterministic Math Code Node, connections, Code Node (Financial Deterministic Math), MongoDB Atlas Vector Search Node, Webhook Node (Trigger), name, nodes (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.24
Nodes (9): active, connections, Fireworks AI, Parse JSON, Webhook, name, nodes, settings (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (9): connections, Fireworks AI, Get Opportunities, Insert Rankings, Parse Rankings, Webhook, name, nodes (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.20
Nodes (9): devDependencies, typescript, main, name, private, scripts, build, types (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (9): devDependencies, typescript, main, name, private, scripts, build, types (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.20
Nodes (9): active, connections, Webhook, description, id, name, nodes, settings (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.20
Nodes (9): active, connections, Webhook, description, id, name, nodes, settings (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.20
Nodes (9): active, connections, Webhook, description, id, name, nodes, settings (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.20
Nodes (9): active, connections, Webhook, description, id, name, nodes, settings (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.20
Nodes (9): active, connections, Webhook, description, id, name, nodes, settings (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.20
Nodes (9): active, connections, Webhook, description, id, name, nodes, settings (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.31
Nodes (8): connections, Fireworks AI, Insert Opportunities, Parse Opportunities, Webhook, name, nodes, main

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (5): dependencies, main, name, private, version

### Community 40 - "Graphify Scripts"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 41 - "n8n Workflows"
Cohesion: 0.33
Nodes (5): description, name, private, scripts, version

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (5): description, name, private, scripts, version

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 47 - "Community 47"
Cohesion: 0.50
Nodes (3): app, express, request

### Community 48 - "Community 48"
Cohesion: 0.50
Nodes (3): compilerOptions, exclude, include

## Knowledge Gaps
- **455 isolated node(s):** `hooks`, `PreToolUse`, `name`, `version`, `private` (+450 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `API Server Setup` to `Tailwind Styling`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `API Server Setup` to `Mongoose Models`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `KnowledgeDocument` connect `Root Package Config` to `Web App Config`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `hooks`, `PreToolUse`, `name` to the rest of the system?**
  _458 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Data Models & Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.08944793850454227 - nodes in this community are weakly interconnected._
- **Should `Web App Config` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._