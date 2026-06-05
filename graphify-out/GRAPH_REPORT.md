# Graph Report - .  (2026-06-03)

## Corpus Check
- Corpus is ~36,976 words - fits in a single context window. You may not need a graph.

## Summary
- 606 nodes · 640 edges · 70 communities (46 shown, 24 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.92)
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
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 56|Community 56]]
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
- [[_COMMUNITY_Community 69|Community 69]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 25 edges
2. `useStore` - 20 edges
3. `compilerOptions` - 17 edges
4. `compilerOptions` - 15 edges
5. `compilerOptions` - 14 edges
6. `compilerOptions` - 10 edges
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
- None detected.

## Hyperedges (group relationships)
- **Financial API Endpoints** — predictfinances_route_post, financial_engine_route_post, _projectid__route_get [INFERRED 0.85]
- **Zustand State Consumers** — app_page_apppage, components_authmodal_authmodal, components_brandingpanel_brandingpanel, components_businessbuilder_businessbuilder, components_cofounderchat_cofounderchat, components_dashboard_dashboard, components_marketingengine_marketingengine, components_onboarding_onboarding, components_roadmappanel_roadmappanel [INFERRED 0.95]
- **Graphify Pipeline Scripts** — graphify_step1_script, graphify_step2_script, graphify_step3_script [INFERRED 0.95]
- **Project Output Renderers** — components_businessbuilder_businessbuilder, components_roadmappanel_roadmappanel, components_brandingpanel_brandingpanel, components_marketingengine_marketingengine [INFERRED 0.85]
- **Venture Building Flow** — src_index_runideaagent, src_index_runvalidationagent, src_index_runbusinessstrategyagent, src_index_runbrandingagent, src_index_runmarketingagent, src_index_runroadmapagent, src_index_orchestrateventurebuilder [EXTRACTED 1.00]
- **Mongoose Schema Models** — src_index_usermodel, src_index_projectmodel, src_index_businessideamodel, src_index_businessvalidationmodel, src_index_businessmodelmodel, src_index_brandidentitymodel, src_index_marketingcampaignmodel, src_index_executionroadmapmodel, src_index_conversationmodel, src_index_financialforecast, src_index_pricingstrategy [EXTRACTED 1.00]
- **Graphify Core Pipeline** — graphify_skill_skill, graphify_skill_detect, graphify_skill_extract, graphify_skill_build [EXTRACTED 1.00]
- **Financial Engine Pipeline** — n8n_workflows_financial_agents_guide_workflow, n8n_workflows_financial_agents_guide_gemini, n8n_workflows_financial_agents_guide_math [EXTRACTED 1.00]

## Communities (70 total, 24 thin omitted)

### Community 0 - "Data Models & Schemas"
Cohesion: 0.06
Nodes (31): POST(), POST(), PredictPayloadSchema, GET(), BrandIdentitySchema, BusinessIdeaSchema, BusinessModelSchema, BusinessValidationSchema (+23 more)

### Community 1 - "Web App Config"
Cohesion: 0.06
Nodes (34): dependencies, @base-ui/react, class-variance-authority, clsx, @creator/rag-core, @creator/types, framer-motion, lucide-react (+26 more)

### Community 2 - "UI Components"
Cohesion: 0.13
Nodes (25): Dashboard(), NAME_IDEAS, UNIQUE_IDEAS, cn(), Badge(), badgeVariants, Button(), buttonVariants (+17 more)

### Community 3 - "Dashboard Features"
Cohesion: 0.13
Nodes (16): AppPage(), AIStudioPanel(), AuthModal(), BrandingPanel(), BusinessBuilder(), CofounderChat(), MarketingEngine(), Onboarding() (+8 more)

### Community 4 - "Langflow Tools"
Cohesion: 0.07
Nodes (16): Record, str, Record, str, Record, Record, str, CompetitorTool (+8 more)

### Community 5 - "API Server Setup"
Cohesion: 0.07
Nodes (26): dependencies, bcryptjs, cors, @creator/agents, @creator/database, @creator/types, dotenv, express (+18 more)

### Community 6 - "Root Package Config"
Cohesion: 0.08
Nodes (24): dependencies, @langchain/openai, mongodb, mongoose, @pinecone-database/pinecone, zod, description, engines (+16 more)

### Community 7 - "Mongoose Models"
Cohesion: 0.08
Nodes (23): BrandIdentity, BrandIdentityModel, BusinessIdea, BusinessIdeaModel, BusinessModel, BusinessModelModel, BusinessValidation, BusinessValidationModel (+15 more)

### Community 8 - "AI Venture Agents"
Cohesion: 0.20
Nodes (17): AGENT_PROMPTS, callLLM(), KNOWLEDGE_BASE, KnowledgeDocument, orchestrateVentureBuilder(), POST /api/ai/chat, POST /api/projects, queryRAG() (+9 more)

### Community 9 - "Tailwind Styling"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Web TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+13 more)

### Community 11 - "Turbo Workspace"
Cohesion: 0.10
Nodes (20): devDependencies, next, prettier, react, react-dom, turbo, @types/node, @types/react (+12 more)

### Community 12 - "Landing Page"
Cohesion: 0.12
Nodes (9): Multi-Agent System, RAG Architecture, faqItems, formationItems, LandingPage(), LandingPageProps, logoMarks, reveal (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (14): dependencies, @creator/prompts, @creator/rag-core, @creator/types, devDependencies, @types/node, typescript, main (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (12): dependencies, @creator/types, mongoose, devDependencies, typescript, main, name, private (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (12): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (11): Claude Graphify Config, Creator Engine Claude Rules, Graphify Build Step, Graphify Detect Step, Graphify Extract Step, Graphify Skill, Extraction Subagent Prompt, Graph Traversal (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.20
Nodes (9): devDependencies, typescript, main, name, private, scripts, build, types (+1 more)

### Community 21 - "Community 21"
Cohesion: 0.20
Nodes (9): devDependencies, typescript, main, name, private, scripts, build, types (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (9): devDependencies, typescript, main, name, private, scripts, build, types (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (6): data, edges, nodes, description, id, name

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (5): dependencies, main, name, private, version

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (5): description, name, private, scripts, version

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 36 - "Community 36"
Cohesion: 0.40
Nodes (3): app, googleClient, inMemoryDB

### Community 40 - "Graphify Scripts"
Cohesion: 0.67
Nodes (3): graphify_step1, graphify_step2, graphify_step3

### Community 41 - "n8n Workflows"
Cohesion: 1.00
Nodes (3): Gemini Chat Model Node, Financial Deterministic Math Code Node, Financial Engine Workflow

## Knowledge Gaps
- **379 isolated node(s):** `PreToolUse`, `name`, `version`, `private`, `main` (+374 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `Data Models & Schemas` to `AI Venture Agents`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `useStore` connect `Dashboard Features` to `UI Components`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `PreToolUse`, `name`, `version` to the rest of the system?**
  _382 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Data Models & Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Web App Config` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.13446969696969696 - nodes in this community are weakly interconnected._
- **Should `Dashboard Features` be split into smaller, more focused modules?**
  _Cohesion score 0.12873563218390804 - nodes in this community are weakly interconnected._