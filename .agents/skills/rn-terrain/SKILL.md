---
name: rn-terrain
description: |
  Master guidance and pre-flight protocol for AI coding agents developing React Native applications and Sovereign API stacks.
  Enforces zero-hallucination version grounding, New Architecture Fabric/TurboModules compliance,
  physical node_modules affordances across native mobile and backend API packages (Hono v5, oRPC v2, MCP 2.3),
  Tree-sitter AST diff verification, and sovereign Rust tooling.
  Activate when: writing or refactoring React Native code or API endpoints, modifying dependencies,
  resolving animation/gesture/storage/RPC capabilities, or diagnosing native/backend crashes.
---

# RN-Terrain: Core AI Agent Guidance & Grounding Protocol

> **PURPOSE**: This skill stops AI coding agents from suffering from **Major-N Temporal Training Drift**—the fatal tendency to generate 2021–2023 legacy APIs (e.g. Reanimated v2, legacy Bridge) instead of current modern standards (Reanimated v4, Fabric, TurboModules).

---

## 🧭 The 4 Non-Negotiable Agent Rules

### RULE 1: Never Guess APIs from Memory (Pre-flight Compass)
Before writing or refactoring any code touching major React Native libraries, query the grounded compass:
* **MCP Tool**: `tcdi_compass(package_name: "react-native-reanimated", version: "4.x")`
* **CLI Command**: `rn-eval compass react-native-reanimated`
* **Agent Views**: Query `tcdi_agent_views(view: "danger_zones")` or view [DANGER-ZONES.md](file:///c:/projects/rn-terrain/docs/agent-views/DANGER-ZONES.md).

### RULE 2: Inspect Physical Disk Affordances (`.d.ts` Truth)
If a package is already installed in `node_modules`, do NOT assume its exports. Scrape the real declaration file on disk:
* **MCP Tool**: `tcdi_affordance(package_name: "react-native-reanimated")`
* **CLI Command**: `rn-eval affordance react-native-reanimated`
* The engine will return verified hooks (`exportedHooks`), components (`exportedComponents`), functions (`exportedFunctions`), and extracted README examples. **If a symbol is not in this list, it will fail at compile time.**

### RULE 3: AST Diff Verification Gate Before Committing
Before declaring a code edit complete, verify the proposed diff against the Tree-sitter guardrail:
* **MCP Tool**: `tcdi_verify_ast_diff(package_name: "...", target_version: "...", code_snippet: "...")`
* **CLI Command**: `rn-eval gate <package> <version> [snippet]`
* If `@ast-grep/napi` detects a severed symbol (e.g. `useAnimatedGestureHandler`), you MUST rewrite the code using the canonical replacement before proceeding.

### RULE 4: Capability-Driven Selection (Not Name Guessing)
Do not install or select packages blindly. Query the canonical capability registry:
* **MCP Tool**: `tcdi_resolve_capability(capability_id: "gesture.pan_recognition")`
* **CLI Command**: `rn-eval capability:resolve gesture.pan_recognition`

---

## 🚨 Top Danger Zones: Severed vs Canonical Replacements

### Mobile / Native Runtime
| Library & Version | ❌ Banned Legacy Pattern (LLM Hallucination) | ✅ Mandatory Modern Standard | Why Legacy Fails |
| :--- | :--- | :--- | :--- |
| **`react-native-reanimated`** (v4.x / 4.7.1) | `useAnimatedGestureHandler({ ... })` | `<GestureDetector gesture={Gesture.Pan()}>` | Decoupled from RNGH; legacy handler deleted from runtime. |
| **`react-native-reanimated`** (v4.x) | Omitting `react-native-worklets` | Co-install `react-native-worklets@^0.13.0` | Worklet runtime extracted into standalone package. |
| **`react-native-gesture-handler`** (v3.x / 3.3.0) | `<PanGestureHandler onGestureEvent={...}>` | `<GestureDetector gesture={Gesture.Pan().onUpdate(...)}>` | Legacy class wrappers bypass Fabric UI-thread state. |
| **`react-native-mmkv`** (v4.x / 4.3.2) | Manual JSI binding / Async storage await | Synchronous `storage.getString(k)` + `react-native-nitro-modules` | Rewritten on Nitro Modules for zero-overhead C++ interop. |
| **React Native Core** (0.88.0-rc.3) | `NativeModules.MyModule` (Bridge) | `TurboModuleRegistry.getEnforcing(...)` | Bridge is severed on New Architecture. |

### Server & API Runtime (`apps/sanctuary-api`)
| Library & Version | ❌ Banned Legacy Pattern (LLM Hallucination) | ✅ Mandatory Modern Standard | Why Legacy Fails |
| :--- | :--- | :--- | :--- |
| **`hono`** (v5.x / 5.0.0-rc.1) | `app.onError((err, c) => ...)` | `app.onError((c, next) => { const err = c.error; })` | Signature inverted in Hono v5; `err` is first on `c.error`. |
| **`hono`** (v5.x / 5.0.0-rc.1) | `const body = await c.req.json()` as implicit `any` | Typed schema parse or explicit typing | `c.req.json()` returns `unknown` to enforce runtime schema validation. |
| **`@orpc/server`** (v2.x / 2.0.0-beta.46) | `augmentRouter(router, middleware)` | `os.use(middleware).router(router)` | `augmentRouter` removed; use builder chains. |
| **`@orpc/server`** (v2.x / 2.0.0-beta.46) | Dedicated adapter package `@orpc/server/adapters/hono` | Native `@orpc/server/fetch` `RPCHandler` | Web Standards fetch handler used directly with Hono. |
| **`@orpc/mcp`** (v2.x / 2.0.0-beta.46) | Hallucinated `createMcpHandler(router)` | `new McpRegistrar(router).register(server)` | Exposes domain procedures as MCP tools through standard registrar. |

---

## 🛠️ Stack Archetypes & Sacred Version Pins

When operating in this repository or modern Expo SDK 58+ projects, align to these sacred pins:

```yaml
Mobile Runtime:
  react: 19.3.0
  react-native: 0.88.0 (New Architecture / Fabric / TurboModules)
  expo: SDK 58

Server / API Runtime:
  hono: 5.0.0-rc.1 (@hono/bun: ^1.0.0)
  orpc: 2.0.0-beta.46 (@orpc/server, @orpc/client, @orpc/contract, @orpc/openapi, @orpc/mcp)
  mcp: 2.3.1 (@modelcontextprotocol/server)
  runtime: bun 1.4.4
  authorization: cedar-policy 4.3

Platform Spine:
  react-native-reanimated: 4.7.1
  react-native-worklets: 0.13.0
  react-native-gesture-handler: 3.4.0
  react-native-mmkv: 4.3.2 (Nitro Modules)
  react-native-nitro-modules: 0.37.1
  @shopify/react-native-skia: 3.7.0 (Graphite/WebGPU fork)

Toolchain:
  package_manager: pnpm 12.15.0
  typescript: 7.1.0-beta
```

---

## 🦀 Sovereign Rust Tooling Etiquette

Do not invoke slow legacy shell scripts or Python tools when sovereign Rust utilities exist on the host machine:
* **Search Code**: Use `rg` (ripgrep) instead of grep or node scripts.
* **Find Files**: Use `fd` instead of find/dir.
* **Fast Edits**: Use `sd` instead of sed.
* **Diffs**: Use `delta` for side-by-side terminal syntax diffs.
* **Linting**: Use `oxlint` (Oxc Rust engine, 50-100x faster than ESLint).
* **Audit Tools**: Run `rn-eval doctor` to inspect installed Rust shiny tools.

---

## 🚑 Quick Diagnostic Runbook

```bash
# 1. Audit project dependencies and New Arch readiness
rn-eval scan
rn-eval v1-check

# 2. Plan safe migration jump across breaking majors
rn-eval jump react-native-reanimated 3.16.0 4.7.1

# 3. Inspect physical node_modules exports
rn-eval affordance react-native-reanimated

# 4. Ingest vault updates and refresh agent views
rn-eval seed:curated C:\x
rn-eval agent:views
```
