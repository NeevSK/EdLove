# Comprehensive Architecture & Tooling Matrix: Statecharts, Agents, and Navigation

## Executive Summary: Critical Analysis of the "2026 Agent-Friendly Statechart Ecosystem"
When analyzing the promise of statechart-guided agent development against real physical codebases, a stark difference appears between **theoretical hype** and **mechanical reality**:

1. **`@statelyai/agent`**:
   - *Hype*: "LLM can't make mistakes because XState controls it."
   - *Brutal Reality*: While it constrains event selection to valid transitions, the agent must still generate the event payload. In a monorepo, if the statechart isn't wired directly to physical routes and presentation physics (sheets, modals, panels), the agent still invents UI behavior.
   - *Installed*: `v1.1.6` installed in `node_modules` via `pnpm`.
2. **Formal Spec Checkers (TLA+ / TLC / Statecharts)**:
   - *Hype*: "Mathematical proof before coding."
   - *Brutal Reality*: Excellent for distributed protocol lifecycles (consensus, database transactions, dual-write outboxes). Too rigid for fluid frontend UI navigation where human aesthetics and animation physics dominate.
   - *Where it belongs*: Protocol boundaries (`apps/sanctuary-api` & SQLite WAL synchronization).
3. **Model-Based Testing (`@xstate/graph`)**:
   - *Hype*: "Zero manual test writing."
   - *Brutal Reality*: Graph traversal produces all paths, but *assertion logic* (what actually displays on screen) still requires human or Playwright/Vitest assertions.
   - *Installed*: `@xstate/graph@3.0.4` installed in `node_modules` via `pnpm`.

---

## The Master Matrix: Local Substrate vs. External Search

| Category | Tool / Substrate | Origin | Where It Lives / Installed | Role It Governs | How It Is Wired (Seams) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Spec & Intent (Layer 1)** | `pjc/*.yaml` | Local Substrate | `packages/core/src/flows/pjc/*.yaml` | Product / BA | Evaluated via `scripts/pjc.ts check`. Enforces unique IDs, outcomes, and legal authorities. |
| **Spec & Intent (Layer 1)** | OpenSpec | External Tool | `devDependencies` (`@fission-ai/openspec@2.0.0`) | Product / Agent | Proposes delta changesets in `openspec/` before merging into permanent PJC YAML. |
| **Agent Statecharts** | `@statelyai/agent` | External Ecosystem | `node_modules` (`@statelyai/agent@1.1.6`) | Autonomous Agent | Bridges LLM event selection with XState machines, preventing unconstrained hallucinated actions. |
| **Graph Traversal & Test** | `@xstate/graph` | External Ecosystem | `node_modules` (`@xstate/graph@3.0.4`) | QA / Verification | Computes simple and shortest paths across statecharts for model-based test generation. |
| **Architecture Topology** | LikeC4 | Local Substrate | `devDependencies` (`likec4@1.60.0`) | Systems Architect | Model in `docs/architecture/model/gurudevi.c4`. Checked via `likec4 validate`. Queried by `ScoutService`. |
| **API Contract Linter** | Spectral CLI | External Tool | `devDependencies` (`@stoplight/spectral-cli@6.17.1`) | API / Protocol Eng | Governed by root `.spectral.yaml`. Lints OpenAPI / oRPC schemas for kebab-case and error contracts. |
| **Execution Flows (Layer 2)** | `FLOW_REGISTRY` | Local Substrate | `packages/core/src/flows/*.flow.ts` | Dev / Runtime | 15 live `FeatureJTBDGraph` flows defining real steps, triggers, and fallback screens. |
| **Presentation Physics (Layer 2)**| `NAVIGATION_POLICY` | Local Substrate | `packages/core/src/flows/navigationPolicy.ts` | Design / UI Eng | Defines physical screen presentation: sheet detents `[0.5, 1.0]`, push, modal, panel, and replace. |
| **Pure Navigator Engine** | `navigator.ts` | Local Substrate | `packages/core/src/flows/navigator.ts` | Core Runtime | Pure function resolving `(flowId, stepId, context) -> ResolvedStep` with physical URLs and NavOps. |
| **Physical Route Catalog** | `route-catalog.mjs` | Local Substrate | `packages/core/src/routing/routeCatalog.generated.ts`| Compiler / Build | Compiles verified physical route lists from Expo 58 and TanStack Router file trees. |
| **Harmonization Seam** | Flow DAG Audit | Local Substrate | `scripts/audit-flow-dag.mjs` | Reconciler | Scans web and mobile routes against `FeatureJTBDGraph` nodes to catch unrendered flow steps. |
| **Harmonization Seam** | Route Intent Slice | Local Substrate | `scripts/check-route-intent-slice.mjs` | Reconciler | Catches shadow code and unanchored routes by asserting they trace back to intentional product slices. |
| **The Master Gatekeeper** | Spec Pipeline | Local Orchestrator | `package.json` (`audit:spec-pipeline`) | Monorepo Sentinel | Runs OpenSpec, PJC, LikeC4, Spectral, and Route Catalog in one continuous, zero-drift command. |
