---
title: "The Agent Armory: Tools, Runtimes, and Verification Engineering Matrix"
status: "active"
created: 2026-11-11
updated: 2026-11-11
author: "Naveen & Antigravity"
tags: [agent-armory, tools, mcp, cli, workflows, software-factory, verification-engineering, expo, maestro]
---

# The Agent Armory: Tools, Runtimes, and Verification Engineering Matrix

## 1. Executive Summary

Autonomous agents operating on natural language prompts suffer from severe epistemic drift, hallucinations, and patch-cascades unless encased in deterministic scaffolding. This document catalogs the **Three-Tier Armory**, the **Consolidated Essential Toolset**, the architecture of **AI Software Factories**, and the modern discipline of **Verification Engineering** for Web and Mobile (Expo SDK 58+).

---

## 2. The Three-Tier Agent Armory Catalog

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ TIER 1: DURABLE WORKFLOW ENGINES (Control Plane & Rails)               │
  ├────────────────────────────────────────────────────────────────────────┤
  │ TIER 2: MODEL CONTEXT PROTOCOL (MCP) SERVERS (The Senses)              │
  ├────────────────────────────────────────────────────────────────────────┤
  │ TIER 3: HIGH-VELOCITY RUST/GO CLIs (The Mechanical Actuators)          │
  └────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Durable Workflow Engines (The Skeletal Rails)
Prevents infinite loops, saves token costs, provides crash recovery, and enforces non-negotiable state transitions.

| Tool | Focus & Archetype | Key Capabilities for Agents |
| :--- | :--- | :--- |
| **LangGraph (`StateGraph`)** | Cyclic cognitive graphs & multi-agent handoffs | Enforces strictly typed state schemas (`State`), conditional branching, checkpointing, and native `interrupt()` breakpoints for human-in-the-loop (HITL) approval. Runs natively in TypeScript/Python. |
| **Temporal** (LangGraph on Temporal) | Enterprise durable execution | Records workflow history on disk. If a machine crashes or human review takes 3 days, execution resumes from the exact millisecond of the last completed step with zero token waste and zero duplicate side-effects. |
| **Inngest** | Serverless durable step engine | Uses `step.run()` memoization. Step outputs are cached and replayed; offers native rate-limiting, retries, and step-level telemetry. |
| **XState (v5) / Statecharts** | Mathematical finite state machines | 100% deterministic, zero-dependency, local statechart execution. Proves mathematically that forbidden states (e.g. `UI_RENDER` before `SCHEMA_COMPILED`) cannot be entered. |

### Tier 2: Model Context Protocol (MCP) Servers (The Senses)
Provides typed, validated, and sandboxed access to project realities.

| Server | Upstream Provider | Agent Superpower |
| :--- | :--- | :--- |
| **GitHub MCP** | `@modelcontextprotocol/server-github` | Inspects issues, pull request diffs, GitHub Action runs, and code review comments directly. |
| **Playwright MCP** | `@playwright/mcp` (Microsoft) | Connects models to live browser engines. Inspects the Accessibility Object Model (AOM), takes DOM snapshots, and executes clicks/assertions via semantic locators. |
| **Postgres / Supabase MCP** | `@modelcontextprotocol/server-postgres` | Read-only introspection of real database schemas, foreign keys, and RLS policies, eliminating SQL hallucinations. |
| **Context7 MCP** | Context7 | Injects version-pinned library documentation directly into context, preventing outdated API guesses for bleeding-edge SDKs. |
| **Platform MCP Gateway** | Internal (`@repo/platform-mcp`) | Monorepo control plane: multiplexes symbol graph lookups (`codegraph`), blast-radius simulation, and presubmit architectural audits. |

### Tier 3: High-Velocity Rust/Go CLIs (The Scalpel & Hammer)
Replaces sluggish, non-deterministic RAG vector searches with millisecond-fast AST and text manipulation.

| Tool | Engine | What It Does & Why It Outperforms |
| :--- | :--- | :--- |
| **`ripgrep` (`rg`)** | Rust | Millisecond literal search across 500k LOC. Respects `.gitignore` and ignores binary assets automatically. |
| **`ast-grep` (`sg`)** | Rust | Searches and rewrites code by **AST shape** (syntax pattern matching) rather than raw text regex, preventing false-positive edits. |
| **`sd`** | Rust | Safe, deterministic find-and-replace. Eliminates escaping bugs and silent file corruption common in legacy `sed -i`. |
| **`fd-find` (`fd`)** | Rust | Sub-second file and directory discovery across monorepo package boundaries. |
| **`tsgo` / `tsc`** | Go / Node | High-velocity presubmit typecheckers that emit UTF-8 error vectors. Serves as the ultimate mechanical gatekeeper. |
| **`gh` CLI** | Go | Complete pull request lifecycle automation, branch management, and CI run introspection from the terminal. |

---

## 3. The Consolidated Essential Toolset (The Solo Dev / Lean Team Defense)

A team does not need to buy 30 disconnected SaaS subscriptions. You consolidate the 25+ socio-technical dimensions into **5 Core Substrates**:

```
        ┌────────────────────────────────────────────────────────┐
        │       1. INTENT & FLOW: Linear (or GitHub Issues)      │
        │       2. DESIGN & TOKENS: Figma + Style-Dictionary     │
        │       3. CODE & CONTRACTS: GitHub + TypeScript Monorepo│
        │       4. DATA & IDENTITY: Postgres / Supabase          │
        │       5. VERIFICATION: Sentry + Maestro / Playwright   │
        └────────────────────────────────────────────────────────┘
```

1. **Intent Substrate (Linear / GitHub Issues):** Stores product requirements, epics, and acceptance criteria.
2. **Visual Substrate (Figma $\rightarrow$ Tokens):** Exports design tokens directly to `@repo/ui/tokens` via CLI/API.
3. **Execution Substrate (GitHub + Monorepo Toolchain):** The single source of truth for contracts (oRPC), domain logic, and AST tools.
4. **Data Substrate (PostgreSQL / Supabase):** Transactional state, migrations, and Row-Level Security policies.
5. **Verification Substrate (Sentry + Maestro / Playwright):** Automated E2E assertion runs and real-time production error telemetry.

---

## 4. The AI Software Factory: Assembly Line vs. Co-Pilot

The industry has crossed the chasm from **AI as a Co-Pilot** (autocomplete in an IDE) to the **AI Software Factory** (an automated assembly line):

```
 [ INCOMING INTENT ]
   Issue / Epic Created in Linear
          │
          ▼
 [ STAGE 1: SPECIFICATION & TRIAGE AGENT ]
   • Validates requirements against existing domain cards
   • Emits machine-readable FlowDAG & Acceptance Criteria
          │
          ▼ (Gate: Human Architect Sign-off)
 [ STAGE 2: SUBSTRATE & CONTRACT AGENT ]
   • Generates typed schemas (oRPC, Zod, DB migration)
   • Compiles types (`tsc --noEmit`)
          │
          ▼ (Gate: Mechanical Typecheck passes exit code 0)
 [ STAGE 3: BUILDER AGENT ]
   • Implements domain logic & UI components via token kit
   • Applies changes via `ast-grep` and `sd`
          │
          ▼ (Gate: Presubmit AST Linter & Boundary Ratchet)
 [ STAGE 4: VERIFICATION AGENT ]
   • Runs local unit tests + E2E Maestro/Playwright flows
   • Captures video trace and failure-moment screenshots
          │
          ▼ (Gate: 100% Green Assertions)
 [ STAGE 5: PR GOVERNANCE & SHIP ]
   • Opens Pull Request with attached execution evidence
   • Human conducts final 2-minute architectural review
```

---

## 5. Verification Engineering & Mobile E2E (Expo 58 / React Native)

As code generation approaches zero marginal cost, **Verification is the primary bottleneck and cost driver.**

### The Mobile Testing Evolution: Why Detox/Appium Were Replaced by Maestro
* **Legacy Detox / Appium:** Required complex native iOS/Android test drivers, fragile accessibility ID setups, and frequent test flakiness due to asynchronous thread synchronization.
* **Modern Maestro (The Standard for Expo):**
  * **Black-box declarative YAML:** Tests run against compiled development or preview binaries (`.apk` / `.app`) without native code injection.
  * **Native Expo & EAS Workflows Integration:** Executes Maestro flows natively in cloud Android emulators and iOS simulators on EAS without requiring local macOS runner hardware.
  * **Maestro Insights & Flake Analysis:** Captures step-by-step video recordings and failure screenshots automatically.

### The Agentic Verification Loop:
Instead of humans manually authoring and maintaining 50 E2E test scripts:
1. Verification agents inspect the **Product FlowDAG** and PR diff.
2. The agent synthesizes the corresponding **Maestro YAML flow** (`launchApp`, `tapOn`, `assertVisible`).
3. The flow executes against the Expo build on a headless cloud simulator.
4. If a regression occurs, the verification agent extracts the exact DOM/accessibility tree hierarchy at the failure point, writes a regression report, and routes it back to the Builder agent.
