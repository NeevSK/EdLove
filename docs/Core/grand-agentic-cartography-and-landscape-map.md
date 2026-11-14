---
title: "The Grand Agentic Cartography: The 8-Sphere Ecosystem Map & Technology Coordinates"
status: "canonical"
author: "Naveen"
scribe: "Antigravity"
tags: [core, architecture, cartography, landscape, agents, mcp, ag-ui, inngest, mastra, rivet, copilotkit, canonical]
supersedes: []
---

# The Grand Agentic Cartography: The 8-Sphere Ecosystem Map & Technology Coordinates

> **CANONICAL ECOSYSTEM ATLAS**  
> While Hexagonal Architecture provides code-level simplicity (Ports & Adapters), over-reducing the modern AI landscape risks blindness to critical emerging protocols, runtime mechanisms, and memory models.  
> This specification codifies **The 8-Sphere Cartography of the Modern Agentic Ecosystem**, providing exact coordinates for every framework, wire protocol, memory architecture, tool standard, and governance mechanism across the Polymath Platform.

---

## 1. The High-Level Topology: The 8 Concentric Spheres

Every agentic technology operating in 2026 occupies an exact position across eight interlocking spheres:

```
                                  ┌──────────────────────────────────────────────┐
                                  │      SPHERE VIII: CONVIVIAL GOVERNANCE       │
                                  │  Cedar Policies · Safeguarding · Human Gates │
                                  │  Atomic Pre-Reservations · Convivial Limits  │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │    SPHERE VII: THE PROTOCOL & WIRE BRIDGE    │
                                  │  AG-UI 1.0 (State Sync, Tool Events, Cards)  │
                                  │  oRPC Contracts · SSE Streams · WebSockets   │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │    SPHERE VI: SENSORY & HUMAN INTERACTION    │
                                  │  Next.js Canvas · Expo 58 Living Worlds · UI │
                                  │  Proposal Cards ([Accept] [Edit] [Discard])  │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │       SPHERE V: TOOLING & ENVIRONMENT        │
                                  │  Model Context Protocol (MCP) · WebMCP       │
                                  │  Sandboxed Runtimes (E2B / Cloud VMs) · OS   │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │     SPHERE IV: AGENT RUNTIME & ORCHESTRATION │
                                  │  Inngest AgentKit · Mastra Supervisor Pattern│
                                  │  Rivet Micro-Actors · LangGraph State Graph  │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │   SPHERE III: COGNITIVE BRAIN & INFERENCE    │
                                  │  Claude Opus 5.5 · Gemini 2.5 · DeepSeek R1  │
                                  │  OpenAI o3 · Multi-Provider Router · TanStack│
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │    SPHERE II: KNOWLEDGE, MEMORY & EPISODE    │
                                  │  Short-Term Working Context · Observational  │
                                  │  Relational PostgreSQL · Vector · GraphRAG   │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │   SPHERE I: PERSISTENCE & PHYSICAL ENGINE    │
                                  │  Supabase Postgres (Cloud) · PowerSync Sync  │
                                  │  SQLite (op-sqlite on A52) · ZenStack Schema │
                                  └──────────────────────────────────────────────┘
```

---

## 2. Exhaustive Sphere Directory: Responsibilities, Tools & Repository Seams

### Sphere I: Physical & Offline Persistence (The Ground Truth)
* **What it does:** Owns transactional consistency, relational integrity, and offline synchronization. This is the unyielding ground upon which everything rests.
* **Industry Paradigms:** PostgreSQL, Supabase, SQLite, PowerSync, ZenStack, Kysely, Drizzle.
* **Monorepo Substrate:**
  - `packages/schema/schema.zmodel`: The Single Source of Truth for domain models and row-level access policies.
  - `apps/sanctuary-api/src/database`: Supabase/PostgreSQL connection pools.
  - `packages/core/src/accounts/sync`: PowerSync connector syncing PostgreSQL tables to mobile SQLite.
  - `apps/gurudevi-mobile`: Local SQLite (`op-sqlite` on native Hermes; `wa-sqlite` on web).
* **Guiding Law:** An LLM or agent framework must never directly touch Sphere I without passing through authorization and domain invariants.

---

### Sphere II: Knowledge, Memory & Epistemic Retrieval (The Mind's Library)
* **What it does:** Structures short-term context, working memory, long-term memory, and epistemic ground truth.
* **Industry Paradigms:**
  - **Working Context:** Dynamic token-budgeted prompt construction.
  - **Observational Memory:** Summarizing and extracting key personal preferences over time (Mastra Memory, CopilotKit Intelligence).
  - **Vector Retrieval (RAG):** pgvector, Pinecone, Qdrant for semantic similarity.
  - **GraphRAG:** Neo4j / knowledge graphs for relational traversal across complex ontologies.
* **Monorepo Substrate:**
  - `apps/sanctuary-api/src/ai/ports/AiPersistencePort.ts`: Transcript and message history interface.
  - `docs/research/edu-audit/`: Canonical knowledge repositories and scientometric audit ledgers.
* **Guiding Law:** Grounded in `2026-10-11-the-upstream-epistemic-and-systemic-invariants.md`, memory must distinguish between *personal reflections* (private to the child/teacher) and *institutional records* (curriculum, official marks).

---

### Sphere III: Cognitive Brain & Inference (The Reasoning Engine)
* **What it does:** Executes linguistic parsing, reasoning, synthesis, and mathematical evaluation.
* **Industry Paradigms:**
  - **Deep Reasoners:** Claude Opus 5.5, OpenAI o3, DeepSeek R1.
  - **High-Velocity Models:** Google Gemini 2.5 Flash, Claude 3.5 Haiku, GPT-4o-mini.
  - **Local Small Language Models (SLMs):** On-device Gemma 2 / Llama 3 running via ExecuTorch/ONNX (future research).
  - **SDK Routers:** `@tanstack/ai`, Vercel `ai` SDK.
* **Monorepo Substrate:**
  - `apps/sanctuary-api/src/ai/routes.ts`: The unified Hono AI router.
  - `apps/sanctuary-api/src/ai/domain/Orchestrator.ts`: Multi-provider routing with Circuit Breaker (protecting against provider outages).
  - `apps/sanctuary-api/src/ai/adapters/`: `GeminiAdapter`, `AnthropicAdapter`, `OpenAiAdapter`, `DeepSeekAdapter`, `OpenRouterAdapter`.

---

### Sphere IV: Agent Runtime & Durable Orchestration (The Stamina & Nervous System)
* **What it does:** Gives the agent endurance. Manages task state, multi-step loops, step retries, background scheduling, and human approval pauses without losing execution memory.
* **Industry Paradigms:**
  - **Inngest Core + `@inngest/agent-kit`:** Durable execution engine with autonomous multi-agent networks and MCP tool integration.
  - **Mastra 1.0:** In-process TypeScript orchestrator with `@mastra/hono` and the Supervisor Pattern.
  - **Rivet (`@rivet-dev/workflows`):** Stateful micro-actors with embedded SQLite and replayable steps.
  - **LangGraph / CrewAI:** Graph-based state machines and role-playing agent groups.
* **Monorepo Substrate:**
  - `apps/sanctuary-api/src/agents/inngest.ts`: Inngest client initialization.
  - `apps/sanctuary-api/src/agents/studentSupport.ts`: Durable background functions, step memoization, and audit event triggers.
* **Monorepo Selection:** **Inngest** is our single authorized champion for Sphere IV. Mastra and Rivet are actively tracked and benchmarked, but rejected for immediate installation to prevent engine sprawl.

---

### Sphere V: Tool Protocols & Environment (The Hands & Senses)
* **What it does:** Allows the agent to perceive the world and invoke external actions in a standardized format.
* **Industry Paradigms:**
  - **Model Context Protocol (MCP):** Anthropic/open standard for tools, resources, and prompt discovery.
  - **WebMCP:** Emerging browser-native projection of web APIs for client-side agents.
  - **Sandboxed Execution:** Cloud VMs, E2B containers, Docker bot computers (OpenDuet/OpenBot).
  - **Browser & Computer Use:** Playwright, Puppeteer, Claude Computer Use.
* **Monorepo Substrate:**
  - `packages/platform-mcp`: The sovereign engineering control plane (`sovereign_discovery`, `sovereign_audit`, `sovereign_maintenance`).
  - Planned `@orpc/mcp` Domain Projection: Exposing curated school procedures (attendance, library search) as secure MCP tools.

---

### Sphere VI: Sensory & Human Interaction (The Glass & Atmosphere)
* **What it does:** The human-facing experience. Renders visual hierarchy, interactive proposal cards, streaming feedback, and sensory atmosphere.
* **Industry Paradigms:** React 19, Next.js 16 App Router, Expo 58 (React Native 0.88 New Architecture / Fabric), Generative UI, Canvas.
* **Monorepo Substrate:**
  - `apps/gurudevi-web/app/(sanctuary)`: The web floors (`SelfFloor`, `WorkspaceFloor`, `LibraryFloor`).
  - `apps/gurudevi-mobile/app/(tabs)`: Native mobile tabs and screens.
  - `@repo/ui/src/theme/worlds/`: **Living Worlds Engine** (11 cultural world themes: `sanctuary`, `wewa`, `kele`, `ratna`, `tea`, etc.).
  - `packages/verger-android`: **Verger Runtime** (hardware-governed frame budgeting and thermal throttling on devices like the Samsung Galaxy A52).
  - `DurableAgentsScreen.tsx`: Proposal cards with explicit **[Accept & Promote]** action triggers.

---

### Sphere VII: The Protocol & Wire Bridge (The Universal Translator)
* **What it does:** Bridges backend agent lifecycles across HTTP, SSE, and sockets into real-time UI components.
* **Industry Paradigms:**
  - **AG-UI 1.0 (Agent-User Interaction Protocol):** Standardized SSE event families (`RUN_STARTED`, `STEP_STARTED`, `TOOL_CALL_START`, `APPROVAL_REQUIRED`, `TEXT_MESSAGE_CONTENT`, `STATE_DELTA`).
  - **oRPC (Open RPC):** Type-safe procedure contracts shared across TypeScript monorepos.
  - **Server-Sent Events (SSE) & NDJSON:** Streaming text and state deltas over HTTP/2.
* **Monorepo Substrate:**
  - `packages/core/src/api/*.contract.ts`: Typed oRPC procedure definitions.
  - `apps/gurudevi-web/lib/sanctuary/aiStreamClient.ts`: Client NDJSON stream decoder.
  - `apps/sanctuary-api/src/ai/routes.ts`: Server streaming endpoint supporting `TEXT_MESSAGE_CONTENT` and `RUN_FINISHED`.

---

### Sphere VIII: Convivial Governance, Economics & Safeguards (The Citadel)
* **What it does:** Protects human dignity, financial survival, institutional security, and legal safeguarding.
* **Industry Paradigms:** Cedar Policy Engine, Prompt Injection Firewalls, Token Ledgers, Quota Pre-Reservations, Human-in-the-Loop Review.
* **Monorepo Substrate:**
  - `packages/core/src/cedar`: Cedar/Rust authorization evaluator (`/tmp/cedar.sock`).
  - `apps/sanctuary-api/src/ai/middleware/rateLimit.ts`: Rate-limiting middleware.
  - `apps/sanctuary-api/src/ai/adapters/DbBillingAdapter.ts`: BYOK, baseline, and tier billing records.
  - `docs/Core/computational-generations-and-agent-taxonomy.md`: Codifying the **Inverted U-Curve of Convivial ROI** and the **Convivial Ceilings**.
* **Guiding Law:** Natural language is never an authoritative commit. Software exists to lift administrative toil, never to enclose human community.

---

## 3. How the Spheres Cooperate: An End-to-End Task Walkthrough

```
[User Taps: "Prepare Flood Adaptation Lesson Pack"]
       │
       ▼ (Sphere VI: Expo Mobile / Next.js Web Glass)
[Sphere VII: Typed oRPC Driving Port]
       │
       ▼
[Sphere VIII: Cedar Policy & Token Pre-Reservation Check]
       │  ├── Verified: Principal/Teacher Role
       │  └── Pre-Reserved: 15,000 Token Budget in PostgreSQL Ledger
       │
       ▼
[Sphere IV: Inngest Durable Execution Spine]
       │
       ├── Step 1 ──▶ [Sphere I: PostgreSQL / PowerSync SQLite]
       │             Reads: Local Classroom Grade 5 Curriculum Records
       │
       ├── Step 2 ──▶ [Sphere III: Claude Opus 5.5 / Gemini 2.5 via Model Router]
       │             Executes: Linguistic Reasoning & Lesson Adaptation Loop
       │
       ├── Step 3 ──▶ [Sphere V: Model Context Protocol (MCP) Tool Call]
       │             Calls: `search_weather_archives("monsoon_season")`
       │
       ├── Step 4 ──▶ [Sphere IV: step.waitForEvent("human.approval")]
       │             Pauses execution; emits AG-UI `APPROVAL_REQUIRED` event
       │
       ▼ (Sphere VII: Wire SSE Stream)
[Sphere VI: Client Displays Interactive Review Card]
       │  ├── Card shows: 45-min lesson plan + 3 reflective check-in questions
       │  └── Buttons: [Accept & Save]  [Edit Draft]  [Discard]
       │
       ▼ (Teacher clicks: [Accept & Save])
[Sphere I: Domain Transaction Committed to PostgreSQL]
       │
       ▼ (Sphere VIII: Ledger Reconciled)
[Signed Transaction Receipt Returned; Teacher Agency Restored]
```

---

## 4. Architectural Summary

1. **The Cartography is Complete:** Every tool in the agentic ecosystem has an exact, unambiguous home across Spheres I through VIII.
2. **Hexagonal Architecture governs code structure:** Inside the codebase, Spheres I, III, IV, and VII plug into the Core Hexagon as Adapters.
3. **Cartography governs architectural awareness:** When reading new announcements, RFCs, or vendor releases, place the tool in its exact Sphere. Never allow a tool in Sphere IV (Orchestrator) to usurp Sphere I (Database) or bypass Sphere VIII (Governance).
