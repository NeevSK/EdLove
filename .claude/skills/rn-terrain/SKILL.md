---
name: rn-terrain
description: |
  Master guidance and pre-flight protocol for AI coding agents developing React Native applications.
  Enforces zero-hallucination version grounding, New Architecture Fabric/TurboModules compliance,
  physical node_modules affordances, Tree-sitter AST diff verification, and sovereign Rust tooling.
  Activate when: writing or refactoring React Native code, modifying native dependencies,
  resolving animation/gesture/storage capabilities, or diagnosing native crashes.
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

## 🚨 Top 4 Danger Zones: Severed vs Canonical Replacements

| Library & Version | ❌ Banned Legacy Pattern (LLM Hallucination) | ✅ Mandatory Modern Standard | Why Legacy Fails |
| :--- | :--- | :--- | :--- |
| **`react-native-reanimated`** (v4.x / 4.7.1) | `useAnimatedGestureHandler({ ... })` | `<GestureDetector gesture={Gesture.Pan()}>` | Decoupled from RNGH; legacy handler deleted from runtime. |
| **`react-native-reanimated`** (v4.x) | Omitting `react-native-worklets` | Co-install `react-native-worklets@^0.13.0` | Worklet runtime extracted into standalone package. |
| **`react-native-gesture-handler`** (v3.x / 3.3.0) | `<PanGestureHandler onGestureEvent={...}>` | `<GestureDetector gesture={Gesture.Pan().onUpdate(...)}>` | Legacy class wrappers bypass Fabric UI-thread state. |
| **`react-native-mmkv`** (v4.x / 4.3.2) | Manual JSI binding / Async storage await | Synchronous `storage.getString(k)` + `react-native-nitro-modules` | Rewritten on Nitro Modules for zero-overhead C++ interop. |
| **React Native Core** (0.88.0-rc.3) | `NativeModules.MyModule` (Bridge) | `TurboModuleRegistry.getEnforcing(...)` | Bridge is severed on New Architecture. |

---

## 🛠️ Stack Archetypes & Sacred Version Pins

When operating in this repository or modern Expo SDK 58+ projects, align to these sacred pins:

```yaml
Mobile Runtime:
  react: 19.3.0
  react-native: 0.88.0-rc.3 (New Architecture / Fabric / TurboModules)
  expo: SDK 58

Platform Spine:
  react-native-reanimated: 4.7.1
  react-native-worklets: 0.13.0
  react-native-gesture-handler: 3.3.0
  react-native-mmkv: 4.3.2 (Nitro Modules)
  react-native-nitro-modules: 0.37.1
  @shopify/react-native-skia: 3.0.2 (Graphite/WebGPU fork)

Toolchain:
  package_manager: pnpm 12.11.2 (with catalogs)
  typescript: 7.0.2
  effect: 4.0.2
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
