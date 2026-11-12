---
title: "AGENTS.md - Agent Guardrails for Polymath Platform"
status: "active"
created: 2026-08-03
updated: 2026-10-08
author: "Naveen"
scribe: "Antigravity"
tags: [AGENTS.md, quality, guardrails, architecture]
---

# AGENTS.md - Agent Guardrails for Polymath Platform

> **PRIME DIRECTIVE: WEB-FIRST & REPO-DOCS-FIRST FOR ALL MODERN ECOSYSTEM DECISIONS**  
> Agent static training memory has a fixed cutoff and is blind to recent changes in Expo SDK 58, React Native 0.88+, Kotlin 2.x, Gradle 8.x, Skia v3, Effect v4, etc. **NEVER rely on internal memory or make guesses.** The model is a stateless reasoner (CPU), not a memory bank. Always inspect the physical substrate (source files, AST symbols, installed `node_modules` declarations) and perform live web searches (`search_web`) or registry queries.
> 0. **The Cognitive Handshake (Active Reasoning Invariant)**: Passive reading decays. Before proposing code or diffs, the agent MUST output the 3-line Bounding Triad: (1) Surface & Mode, (2) Grounded Substrate (files/types inspected), (3) Active Seam & Constraints.
> 1. **Context Boundary Rules**: Monorepo packages are strictly divided into Domain Logic (`@repo/core`, `@repo/classroom`), UI Theme, Tokens and Kit (`@repo/ui/theme`, `@repo/ui/tokens`, `@repo/ui/components/native|web`), Native Apps (`apps/gurudevi-mobile`), and Browser Web (`apps/gurudevi-web`). Never cross these boundaries.
> 2. **Verification Protocol**: Before declaring completion, verify your changes against the monorepo toolchain. Never submit unverified code.
> 3. **The Deletion Veto**: Working behavior, tests, fallbacks, or routes must NEVER be silently deleted. If you need to deprecate or remove code, you MUST request explicit human approval first. A **move is not a deletion**: moving code to its new home, re-pointing every importer and removing the old file in the same change needs no sign-off when behaviour is unchanged and the type-check and test baselines hold. Never move by copying.
> 4. **Two-Tier Search Protocol (Dated Precision)**: First execute broad architectural pattern discovery, immediately followed by a mandatory dated precision round targeting official release tags, commit changelogs, RFCs, and migration guides tied to the exact active package versions. Never rely on generic high-level keywords.
> 5. **Source-Code Grounding Over Memory**: When researching APIs, deprecations, or internal architecture of active dependencies (e.g., Reanimated, Worklets, Nitro, React 19, Fabric), NEVER guess or recall from LLM training memory. Directly open and inspect the installed package files in `node_modules/<pkg>/src`, type declarations (`.d.ts`), and native/C++ hooks (`Common/`, `android/`, `ios/`). Ground all dialect migration advice in empirical `@deprecated` annotations and verified runtime signatures.
> 6. **The Upstream Depth Realism & Threshold Invariant (Layer 0 Meta-Ontology)**: Never commit the Epistemic Fallacy by mistaking Empirical metrics (dashboards, pass rates) for Real generative mechanisms. Never systems-wash heaps or passive tools as living systems. Respect non-linear phase transitions (Thresholds) and the Matthew Effect ($gap(t) = gap_0 \cdot e^{\lambda t}$). Automate the Clear, engineer the Complicated, but bow before and protect the living Complex. Code proposals must enforce the Convivial Limit—software exists to lift administrative drudgery, never to enclose human life. Reference: [`docs/architecture/2026-10-11-the-upstream-epistemic-and-systemic-invariants.md`](file:///c:/x/docs/architecture/2026-10-11-the-upstream-epistemic-and-systemic-invariants.md).
> 7. **Deterministic Ecosystem Invariant Ledger (Zero-Tolerance Dialect Veto)**: The model CPU is strictly forbidden from emitting legacy dialects. Introducing any of the following triggers an instant gate veto under Step 5 Delta Gate:
>    - **Reanimated 4 / Worklets**: NEVER use `runOnJS` or `runOnUI` from either package: both are `@deprecated` in the installed `react-native-worklets@0.13.1` and `react-native-reanimated@4.7.1`. Use `scheduleOnRN(fn, ...args)` and `scheduleOnUI(worklet, ...args)` from `react-native-worklets`. NEVER import `createWorkletRuntime`, `executeOnUIRuntimeSync` or `makeShareableCloneRecursive` from `react-native-reanimated` (deprecated re-exports; use `react-native-worklets`). On shared values prefer `.get()` / `.set()` (React compiler safe) over assigning `.value`.
>    - **RNGH 3.4**: NEVER use legacy `<PanGestureHandler>` or `useAnimatedGestureHandler`. ALWAYS use `Gesture.Pan()` with `<GestureDetector>`.
>    - **React 19**: NEVER use `React.forwardRef` (pass `ref` directly as a standard prop). NEVER use `useFormState` (use `useActionState`).
>    - **React Native 0.88**: NEVER use `findNodeHandle`, `Alert.alert`, `useNativeDriver: false`, or `InteractionManager`.
>    - **Live Substrate Deprecations**: The verification gate enforces `reports/live-deprecations.json` (7,733 harvested deprecations) on all modified files. Zero unannotated deprecated symbols permitted.

---

## 1. Monorepo Map & Sacred Architectural Boundaries

### The Apps (Know Which You're In)

| App | Purpose | Framework | **Build In** |
| :--- | :--- | :--- | :--- |
| **`apps/gurudevi-mobile`** | **Native iOS/Android** - flagship mobile | Expo 58 (RN 0.88, New Arch) | ✅ Mobile features |
| **`apps/gurudevi-web`** | **Gurudevi web app** - `sanctuary.gurudevi.app` and `explore.gurudevi.app` | Vite + React + TanStack Router (`spa/`); Next.js serves the routes not yet moved ([decision](docs/decisions/2026-11-12-web-stack-astro-vite.md)) | ✅ **Web app** |
| **`apps/gurudevi-public`** | **Public site** - `gurudevi.app`: pages, journal, legal, SEO and agent files | Astro, static; React islands only where a page is interactive | ✅ **Public pages** |
| `apps/sanctuary-api` | Sanctuary API | Node.js/Hono | ✅ Active |

### Domain Packages (Shared Logic Only)

| Package | Purpose | Use For |
| :--- | :--- | :--- |
| `@repo/core` | **Platform spine**: auth, tenancy, permissions, contracts, API clients | Shared logic, hooks, schemas, API clients |
| `@repo/classroom` | **Classroom domain**: attendance, gradebook, reflect, workspace | Classroom domain logic |
| `@repo/ui/theme` | **World engine**, platform-neutral: 11 worlds, `resolveWorld`, recipes, CSS variables, `Phase`; `theme/scene` holds the one clock (`phaseAt`), sky, season, weather | Anything a world changes |
| `@repo/ui/theme/native` · `@repo/ui/theme/web` | The active world on each platform (`useWorld`, `WorldScope` · `WorldStyles`) | Theme bindings only |
| `@repo/ui/tokens` | Fixed scales (spacing, radii, sizes, touch targets) - platform-neutral; its colours are legacy and leave as screens migrate | Values that never change per world |
| `@repo/ui/components/native` | **Owned RN components** (Button, Text, Surface, TextField, Chip, Row, Section, Switch, Waiting, Scene …) | All new mobile UI |
| `@repo/ui/components/web` | **Owned DOM components**, same names and props as native | All new web UI |
| `@repo/ui` (everything else) | Legacy: Gluestack-style `components/ui`, `primitives`, flat `components/*`, `theme/Theme`, `worldBridge` | Frozen. No new imports; being replaced |
| `@repo/platform-mcp` | **Sovereign Control Plane & Gateway** - multiplexes downstream tools | Agentic discovery, audit, maintenance, and tool proxy |

**UI kit rules** (plan: [`docs/architecture/2026-10-29-ui-component-system-rebuild-plan.md`](docs/architecture/2026-10-29-ui-component-system-rebuild-plan.md); enforced by `pnpm check:ui-boundaries`, part of `check:anti-slop`):
- Components read colour, radius, type and motion from the world's recipes, never hard-coded values. On native, NativeWind is for screen layout only, with colours through `w-*` classes. On web, CSS modules are for layout only, with colours through `var(--w-*)`.
- `theme/` (except `theme/native`) and everything web never import React Native, Expo, NativeWind or Skia. Native never imports web. Theme never imports components.
- Imports of legacy UI and the count of `*.web.tsx` files may only go down (`tooling/ui-legacy-ratchet.json`).
- Phase styling is retired: no new `phase-*` classes, `--phase-*` variables, `phaseMatrix` or `worldBridge` reads.

### The Sovereign Context & Integration Pattern (The Anti-Island Law)

**Sanctuary API cutover:** follow
[`apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md`](apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md).
The owner authorized retiring legacy procedure surfaces without deployed-client
compatibility obligations. Native oRPC v2 commands/queries target `/api/v1` only;
navigation, business ownership and channel adapters are distinct. The current
phase is horizontal foundation, not feature migrations or invented domain rules.
Owner clarification (2026-11-03): complete reusable horizontal foundations before
business vertical slices. Prove common mechanisms with independent synthetic
capabilities, without admitting product policies. Design for approximately 10,000
Sri Lankan schools and synchronized morning demand; keep deployment size configurable.
Graceful degradation, interoperability and portable data are foundation requirements.
National-scale design is not national-scale performance evidence. The API engineering
playbook owns the horizontal acceptance matrix; its scale guide owns workload assumptions.
Run `pnpm audit:api-composition`; its failures must not be waived to preserve
legacy aliases, conversion or parallel first-party transports. Passing its
fixtures is not proof that the current API meets the target. User MCP, browser
WebMCP and developer `platform-mcp` are distinct; record unimplemented channels
and unresolved product decisions honestly.

**Architecture mental model (read first):** [`docs/architecture/2026-11-12-architecture-mental-model.md`](docs/architecture/2026-11-12-architecture-mental-model.md) explains the whole model in one place: modules versus layers, why each layer exists, the decisions and their costs, a scorecard and the known unverified risks. It also says how the other architecture documents relate. For state, effects, hooks, `useReducer` versus XState, and which library capabilities to use, follow [`docs/architecture/2026-11-12-state-effects-hooks-and-capabilities.md`](docs/architecture/2026-11-12-state-effects-hooks-and-capabilities.md).

**Client runtime plan:** [`docs/architecture/2026-11-12-client-runtime-foundation-plan.md`](docs/architecture/2026-11-12-client-runtime-foundation-plan.md) is the whole client picture, from contracts (Zod is the source of truth) through transport, errors, retry, outbox, queries, feedback, motion and journeys, at baseline, production and enterprise level, with the order of work. Build from the bottom layer up.

**`*.web.ts(x)` outside `apps/gurudevi-web` are reference only.** The web app is `apps/gurudevi-web`. Lint, type checks, tests and the audits skip them, except the live files in `tooling/live-web-files.json` (shared code imports those by name). Don't build on a reference file. If you add or remove an import of a `.web` file, run `node scripts/check-reference-only.mjs`; the ratchet fails while the list is out of date.

**Platform structure (read before any API, package or screen design):**
[`docs/architecture/platform-map.md`](docs/architecture/platform-map.md) is the
top-down map: channels, places (tabs), business domains, platform services, runtime,
substrate. Tabs are places, not domains; every fact has one owning subdomain. Before
adding a procedure, follow [`docs/architecture/domain-design-method.md`](docs/architecture/domain-design-method.md)
(namespace = `<domain>.<subdomain>`, procedure = capability, a subdomain card before
code). Privacy, sharing, audit, soft delete, retention and export follow
[`docs/architecture/data-governance-and-records.md`](docs/architecture/data-governance-and-records.md).
Modules follow [`docs/architecture/module-structure.md`](docs/architecture/module-structure.md)
(modular monolith, walking skeleton; every module listed in
[`docs/architecture/domains/README.md`](docs/architecture/domains/README.md)); authority
follows [`docs/architecture/authority-model.md`](docs/architecture/authority-model.md);
security and AI agents follow [`docs/architecture/security-and-ai-threat-model.md`](docs/architecture/security-and-ai-threat-model.md).
Removing product screens or routes because their API is missing is a Deletion Veto
case: ask first. Any channel or agent (MCP, WebMCP, WhatsApp, Telegram, ephemeral workers)
follows [`docs/architecture/channel-admission-model.md`](docs/architecture/channel-admission-model.md);
the gates to a production v1 are in [`docs/architecture/road-to-v1.md`](docs/architecture/road-to-v1.md). **Current foundation work, its state and how to resume it in any tool:**
[`apps/sanctuary-api/docs/current_progress/2026-11-02-foundation-follow-ups.md`](apps/sanctuary-api/docs/current_progress/2026-11-02-foundation-follow-ups.md).

Never treat the monorepo as an empty workspace or create ad-hoc "islands" (throwaway scripts, redundant utilities, or disconnected client configs). Integration is not just about where files go-it is a strict **Cognitive Order of Operations** that must precede any attempt to write code:

```
[1. Explore Existing Terrain] ➔ [2. Absorb Architecture & Context] ➔ [3. Think in Existing Terms] ➔ [4. Minimal Additive Seam] ➔ [5. Code, Verify, Codify]
```

1. **Phase 1: Explore Existing Terrain (No Code First):**
   - Before writing or proposing any code, explore the workspace substrate first.
   - For agent tools/APIs: Inspect `packages/platform-mcp/` (`DiscoveryService`, `ScoutService`, downstreams).
   - For domain logic: Search `@repo/core`, `@repo/classroom`, and package manifests for existing contracts and utilities.
   - For UI: Check `@repo/ui/components/native|web`, `@repo/ui/theme` and `@repo/ui/tokens`.
2. **Phase 2: Absorb Architecture & Invariants:**
   - Understand how the system already solves adjacent problems.
   - Identify active boundaries, secret configurations (Doppler), and runtime rules.
3. **Phase 3: Think in Existing Terms (Conceptual Alignment):**
   - Translate the user's request into the codebase's existing vocabulary, abstractions, and structures.
   - Do NOT invent new paradigms, ad-hoc wrapper scripts, or duplicate abstractions. If the monorepo uses `buildDownstreamServerSpecs()`, think in downstream specs. If it uses `storageDriver`, think in `storageDriver`.
4. **Phase 4: Formulate the Minimal Additive Seam:**
   - Define the minimal, non-destructive modification that cleanly extends existing abstractions without violating the Deletion Veto.
5. **Phase 5: Execute, Verify, and Codify:**
   - **Secrets via Doppler:** All external credentials (`EXA_API_KEY`, `CONTEXT7_API_KEY`, etc.) belong in Doppler (`gurudevi-mobile:dev`) and runtime injection-never committed or stored as plaintext in configuration files.
   - **Compile & Verify:** Changes must compile cleanly (`tsc`, `pnpm build`) and pass anti-slop verification.
   - **Codification:** Capabilities and conventions must be documented in `AGENTS.md` and architecture ledgers to prevent cognitive drift across future sessions.

### Critical Import Boundaries (NEVER CROSS)

**Canonical account identity (2026-10-25):** `public.users.id` is the immutable
EdLove Identity/account UUIDv8, created transactionally by the database. Supabase
subjects remain credential bindings in `auth_identities`; domain SQL uses
`public.get_my_id()`. Do not restore the retired `users.edlove_id` side-ID or its
assignment worker. See [the cutover record](docs/current_progress/2026-10-25-canonical-uuidv8-account-cutover.md)
for migrations, the signed `canonical_account_id` claim, and real-database proof.

| ❌ NEVER | ✅ INSTEAD |
| :--- | :--- |
| Import `*.web.tsx` in `gurudevi-web` | Build browser-native in `apps/gurudevi-web` |
| Import legacy `@repo/ui` (primitives, `components/ui`, flat `components/*`) in Next.js | Use `@repo/ui/components/web`, `@repo/ui/theme`, `@repo/ui/theme/web` |
| Import Expo/RN/PowerSync in `gurudevi-web` | Use `@repo/core/web-auth`, `@repo/core/web-authorized-entry` |
| Build reusable UI ad hoc in an app (hand-made buttons, pills, fields) | Add it to `@repo/ui/components/web` and `/native` with the same props |
| Import native storage (MMKV) in `@repo/core` | Use `storageDriver` polyfill proxy (zero native pollution) |
| Use RN Web (`*.web.tsx`) for new features | RN Web is **migration source only** - being retired |
| Use Java OOP names (`*Manager`, `*Service`, `*Repository`) | Use 2026 Taxonomy: `*Driver`, `*Monitor`, `*Vault`, `*.adapter.ts`, `use*` |
| Import from `components/workbench` in production floors/routes | `components/workbench` is the developer's private prototyping playground (zero barrels). Never import workbench drafts into production; promote approved components to `@repo/ui/components/web` or `app/(sanctuary)/components`. |

### The 2026 Sovereign Naming Taxonomy & Archetype Consistency Rules

The monorepo enforces the 8 Sovereign Archetypes defined in [`docs/architecture/2026-11-02-monorepo-naming-conventions-and-consistency-rules.md`](docs/architecture/2026-11-02-monorepo-naming-conventions-and-consistency-rules.md):
1. **Platform Drivers (`*Driver.ts`, `*Monitor.ts`, `*Sink.ts`, `*Vault.ts`)**: Low-level platform I/O (`storageDriver`, `networkMonitor`, `telemetrySink`, `cryptoVault`, `deviceIdentityDriver`).
2. **Hexagonal Adapters (`*.adapter.ts`)**: Boundary translation (`academicAdapter`, `schoolAdapter`, etc.).
3. **Atomic Client Stores (`use*Store.ts`)**: Zustand state with mandatory atomic selectors (`useStore((s) => s.foo)`).
4. **Declarative Hooks (`use*.ts`)**: UI facades and React 19 Action transitions (`useActionState`, `useOptimistic`).
5. **Live Queries & Procedures (`useLiveQuery()`, `orpcClient.*.*`)**: Reactive SQLite queries and typed RPC procedures. Zero "Repository" classes.
6. **Pure Domain Cores (`*.port.ts`, `*.schema.ts`)**: 100% deterministic pure functions and schemas.
7. **Spatial UI Containers (`*Modal.tsx`, `*Panel.tsx`, `*Drawer.tsx`, `*Sheet.tsx`, `*Floor.tsx`, `*Screen.tsx`)**: Visual presentation surfaces. Never named `*Manager`.
8. **Agent Tool Services (`@repo/platform-mcp/src/services/*Service.ts`)**: Sovereign Agent MCP tools (the ONLY approved use of the word `Service`).

### Platform MCP Gateway & Sovereign Support Service Guide

The `@repo/platform-mcp` is the agent's primary sovereign control plane. Agents must NEVER guess tool signatures or invent ad-hoc node scripts when native gateway actions exist:

- **Orientation & Ledgers (`sovereign_guide`)**:
  - `action: 'inventory'`: Master directory of all actions, tools, and options.
  - `action: 'mistakes'`: Architectural dead-ends and learnings (read before starting refactors).
  - `action: 'soul'`: Metaphors and non-negotiable platform doctrines.
  - `action: 'refusal'`: The Senior Refusal Protocol (when to say "No" to bad architecture).
- **Intelligence & Discovery (`sovereign_discovery`)**:
  - `action: 'simulate', params: { symbol: '...' }`: AST symbol definition + 1-hop & 2-hop transitive blast radius.
  - `action: 'codegraph', params: { mode: 'symbol'|'callers'|'repo-map', query: '...' }`: Sub-second AST lookup and in-degree PageRank repo-maps.
  - `action: 'scout', params: { keyword: '...' }`: Assembles full contextual dossier for a feature keyword.
  - `action: 'view', params: { path: '...', range: '1:50' }`: Syntax-highlighted file viewing via `bat`.
  - `action: 'find', params: { query: '...' }`: Fast file discovery via `fd`.
- **Architectural Sentinels (`sovereign_audit`)**:
  - `action: 'hygiene'`: Audits circular dependencies and dead code across monorepo boundaries.
  - `action: 'architecture', params: { package: '...' }`: Checks platform agnosticism and integrity.
- **Refactoring & Maintenance (`sovereign_maintenance`)**:
  - `action: 'refactor', params: { find: '...', replace: '...', path: '...' }`: Atomic regex replacement powered by Rust `sd`.
  - `action: 'heal'`: Repairs JSX and TypeScript syntax corruption.
  - `action: 'checkpoint', params: { message: '...' }`: Atomic git commit with smart categorization.

### Platform MCP & Rust "Shiny Tools" Affordance Matrix

Agents must leverage the monorepo's native tools instead of inventing ad-hoc node scripts:

| Tooling Layer | Primary Command / MCP Tool | When to Use (Agent Affordance) |
| :--- | :--- | :--- |
| **CodeGraph Symbol Index** | `pnpm codegraph symbol <name>` | Instant AST symbol lookup with signature, file & line (sub-second cached). |
| **CodeGraph Blast Radius** | `sovereign_discovery(action: "simulate")` / `pnpm codegraph blast-radius <target>` | 1-hop and 2-hop transitive blast radius, importers, and domain breakdown. |
| **CodeGraph Repo Map** | `pnpm codegraph repo-map <scope>` | In-degree PageRank ranked AST symbol & signature map for bounded context. |
| **Component Contracts** | `sovereign_discovery(action: "component_api", name: "...")` | Extract Props/interfaces without loading full monolith files. |
| **Structural AST Search** | `sovereign_discovery(action: "ast", query: "...")` | Search AST code structures via Biome without regex brittleness. |
| **Fast Lexical Search** | `rg -n "pattern"` / `fd "pattern"` | Hyper-fast keyword and file search in Rust (`ripgrep` & `fd-find`). |
| **Fast Atomic Edits** | `sd "search_regex" "replacement" <file>` | Rust-powered find-and-replace for clean multi-line substitutions. |
| **Delta & Code Review** | `sovereign_discovery(action: "delta")` / `pnpm delta` / `delta` | Unified uncommitted git diff review for Step 5 Delta Gate. |
| **Physical Affordance Firewall** | `sovereign_discovery(action: "affordance", params: { package: "..." })` / `node scripts/run-rn-terrain.mjs affordance <pkg> [project]` | Grounded physical `.d.ts` exported hooks, components, procedures, and live deprecations across both Native Mobile (`apps/gurudevi-mobile`) and Server/API Substrates (`apps/sanctuary-api` - Hono v5, oRPC v2, MCP 2.3) to prevent LLM memory hallucinations. |
| **Architecture Audit** | `sovereign_audit(action: "hygiene" \| "hooks")` | Check circular dependencies, unused exports, and hook state density. |
| **4-Pillars Health** | `node scripts/audit-4-pillars.mjs` | Instant 0-100 monorepo health score across 450k LOC in 2 seconds. |
| **Dual-Engine Typecheck** | `pnpm run check-types` / `pnpm run check-types:profile` | High-velocity Go (`tsgo` 7.1.0-beta) & Rust (`tsrs`) typechecker with Go pprof profiling. |

---

## 2. Dependency Architecture Tiers & The Cautious Upgrade Protocol

Dependencies are governed by **Architectural Weight & Blast Radius**, not poetic dogma or unchangeable amber. "Sacred Pins" designate **Tier 1 Critical Native Architecture** — packages that bind directly into native C++ Fabric, JSI, Nitro ABI, and Hermes bytecode. Naive or ad-hoc updates cause fatal native `SIGABRT` crashes or uncatchable runtime drops. However, they must **never rot silently**: our **Active Upstream Radar** continuously monitors upstream releases, and upgrades are executed via the **Cautious Upgrade Protocol**.

### The 4 Architectural Weight Tiers

Versions live in [`scripts/lib/dependency-cohorts.mjs`](scripts/lib/dependency-cohorts.mjs) and `pnpm-workspace.yaml`, never here. Read [`docs/architecture/dependencies.md`](docs/architecture/dependencies.md) before updating anything: it has the held packages, why, and when to re-check.

| Tier | Architectural Classification | Key Packages | Blast Radius & Risk | Upgrade Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Critical Native Architecture** (fka Sacred Pins) | Reanimated, Worklets, Gesture Handler, MMKV, Nitro Modules, Skia, TypeScript | **CRITICAL (Native C++/JSI)**: Fatal `SIGABRT`, JSI memory corruption, native thread deadlocks. | **Cautious Upgrade Protocol**: Upstream changelog analysis $\rightarrow$ peer matrix check $\rightarrow$ `rn-terrain audit:seams` $\rightarrow$ RFC sign-off $\rightarrow$ Harmonizer. |
| **Tier 2** | **Framework Runtime Matrix** | Expo SDK and its modules, React Native, React, Expo Router | **HIGH (Platform Engine)**: Monorepo-wide framework baseline. | Gated on Expo SDK release lifecycle and `pnpm --filter gurudevi-mobile exec expo-doctor`. |
| **Tier 3** | **Database & Contract Schemas** | ZenStack, Zod, Kysely | **MODERATE (Domain/Schema)**: ZModel AST, generated ORM contracts, SQL query semantics. | Harmonize cohort $\rightarrow$ `zenstack generate` $\rightarrow$ `tsc --build --noEmit` contract check. |
| **Tier 4** | **Standalone Utilities & Dev Tools** | `lucide-react`, `oxlint`, `vitest`, `rimraf`, `wrangler` | **LOW (Isolated)**: Scoped to toolchain or UI leaf nodes. | Upgraded via `pnpm run deps:upgrade` (preserves Tiers 1–3). |

### The Senior Architect Dependency-Hell Precepts (Non-Negotiable Invariants)

1. **Entangled Seams Over Isolated Pins**: Dependencies do not exist in isolation. You cannot upgrade PowerSync without auditing the oRPC batch upload, Kysely dialects, ZenStack access policies, and Drizzle schema contracts. All updates to data schemas, sync connectors, or native runtimes must be audited across the entire end-to-end seam.
2. **The Temporal Grounded Search Mandate**: Before authoring migration code or bumping non-leaf dependencies, execute the **Granular-First Temporal Search Ladder** (Physical disk `.d.ts` $\rightarrow$ GitHub Releases / packuments $\rightarrow$ Current-month anchors). Never guess method names or dialect signatures from memory.
3. **The Deletion Veto in Upgrades**: Upgrading a package must never be an excuse to delete working error boundaries, retry policies, offline fallback queues, or type shims to make TypeScript happy. Preserve working functionality through additive adaptation.
4. **Graduated Evidence Over Compiler Complacency**: `tsc --noEmit` is step 0. Every upgrade must verify runtime contracts via G1/G2 boundary mocks, `audit-seams.mjs`, and native anti-slop sentinels. Native C++ crashes (`SIGABRT`), Hermes GC pauses, and layout thrashing bypass the TypeScript compiler entirely.

### The Four-Step Cautious Upgrade Protocol (Tier 1 & Cohorts)

When the Active Radar detects an upstream release on a Tier 1 or Cohort dependency:
1. **Upstream Investigation & Temporal Grounding:** Perform live research on release notes, C++ header changes, and breaking changes via the Temporal Grounded Search Ladder. Inspect `node_modules/<pkg>/.../*.d.ts` and GitHub releases tags. Never rely on training memory.
2. **Peer Matrix & Blast Radius Simulation:** Verify that peer dependencies remain ABI-compatible (e.g. Worklets $\leftrightarrow$ Reanimated $\leftrightarrow$ Nitro $\leftrightarrow$ RN 0.88; ZenStack $\leftrightarrow$ Kysely $\leftrightarrow$ PowerSync $\leftrightarrow$ oRPC). Run `sovereign_discovery(action: "simulate")` to compute the monorepo blast radius.
3. **Integrative Seams & Native Proof:** Run `node scripts/audit-seams.mjs` to verify that cross-thread worklet execution, gesture recognizers, window insets, and lifecycle state machines exhibit zero regressions.
4. **Cohort Harmonization & Invariant Gate:** Use `node scripts/harmonize-dependencies.mjs --write` to propagate the upgrade across all manifests in-place, lockfile sync (`pnpm install --lockfile-only`), and verify with `pnpm run deps:check` and `pnpm run check:anti-slop`.

### Native Integrity Rules
* **Rule 1:** NEVER run `npx expo install --fix` or `--check` (downgrades Tier 1 native pins). Run `pnpm --filter gurudevi-mobile exec expo-doctor` instead.
* **Rule 2:** NEVER run `npx expo prebuild --clean` without explicit approval.
* **Rule 3:** NEVER edit files inside `android/` or `ios/` directly (ephemeral artifacts). Use `app.json` or config plugins in `apps/gurudevi-mobile/plugins/`.
* **Rule 4:** NEVER remove version exclusions from `package.json` (`expo.install.exclude` and `expo.doctor.reactNativeDirectoryCheck.exclude`).
* **Rule 5:** NEVER run unconstrained `pnpm update` or `taze -w`. All updates must flow through `pnpm run deps:upgrade` or the Cautious Upgrade Protocol.

---

## 3. The Tri-Modal Operating Protocol

Classify every task into one of three explicit operational modes before taking action:

1. **`Vibe Mode` (Greenfield / Throwaway Spikes):**
   * High-level outcome + constraints. Strictly capped at a single component or prototype file.
   * *Exit Gate:* Exit immediately the moment code has real users, persistent data, or shared contracts.
2. **`Implement Mode` (Agentic Engineering):**
   * Spec-first: Invariants, non-goals, and boundary types defined before writing code. Agent receives bounded context.
   * Tests and typechecks must pass before change is accepted.
3. **`Maintain Mode` (Default on All Code >3,000 Lines):**
   * Mandatory impact query first (callers, dependents, tests). Emits minimal additive patches.
   * Blast radius and structural containment verified.

---

## 4. The Hostile Critical Reviewer & Deletion Interceptor

Every turn must pass an adversarial review gate acting as the **Vibe Maintainer** of the codebase:

### The Deletion Veto (Never Silently Delete Working Code)
* **RULE:** Never delete an existing flow, handler, fallback, storage path, or route merely because it appears redundant or inconvenient.
* **PROTOCOL:** If proposing to remove, replace, or deprecate working code, the agent **MUST halt and ask the user for sign-off**, explicitly presenting:
  1. Exactly what code/behavior is being removed.
  2. The technical rationale.
  3. The potential risks and compatibility trade-offs.
* **A MOVE IS NOT A DELETION (owner rule, 2026-11-11):** Relocating code (a file, a type, a component) to its proper home, re-pointing every importer and removing the old copy *in the same change* is a move. It needs no sign-off when behaviour is unchanged and the type-check and test baselines hold. Leaving the old file behind is the failure: every reorganisation here was once done by copying, and the copies drifted (see `docs/current_progress/2026-11-11-unwired-files-and-duplicate-contracts-chronology.md`). Use `scripts/move-modules.mjs` (files) and `scripts/move-exports.mjs` (named exports); they rewrite importers in their original style. Contracts (types and schemas) are owned by `@repo/core`; a package never keeps its own copy.

### The Adversarial Self-Audit
Before proposing any code, the agent must ask:
* *"What happens when this network call drops, times out, or returns 503?"* (No happy-path only code).
* *"Did I touch files outside the computed blast radius?"* ($\text{Diff} \subseteq \text{ImpactSet}$).
* *"Did I invent a helper that already exists in `@repo/core` or `@repo/ui`?"* (Consolidate, don't duplicate).

### Step 5: The Post-Execution Delta-Reasoning Gate (Verification Engineering)
Before declaring any task complete, closing a ticket, or committing changes:
* **RULE:** The agent **MUST execute `git diff`** and reason across the delta against the original prompt intent.
* **INSPECTION PROTOCOL:**
  1. **Read deletions first (`-`):** Inspect every removed line. Removed guards, error fallbacks, and assertions are where silent regressions hide. Any deletion requires approval via the Deletion Veto.
  2. **Audit additions (`+`):** Verify no dead abstractions, duplicate utilities, unconstrained `any`, or hardcoded values were introduced.
  3. **Audit against Intent & Blast Radius:** Verify that the diff cleanly satisfies the original intent without spilling outside the computed blast radius.
  4. **Generator $\ne$ Verifier:** The model cannot trust its own generative output without an empirical inspection step. Unless verified against the actual raw unified diff, work is NOT done.

---

## 5. The Anti-Slop Standard (Banned Patterns)

1. **No restating comments:** `// gets the user` above `getUser()` is noise. A comment must explain *why*, not restate syntax.
2. **No unapproved behavior replacement or deletion:** Preserve working behavior through an additive path.
3. **No dead abstractions:** An interface used once, a factory with one implementation, a wrapper forwarding args - inline them.
4. **No duplicate utilities:** Search `@repo/core` and `packages/*` first. Consolidate; never add near-copies with new names.
5. **No defensive noise:** No try/catch swallowing errors silently; no checks for impossible states; no optional chaining on non-null values.
6. **No happy-path-only code:** Every network call or boundary must handle failure gracefully.
7. **Never weaken a test to make it pass:** Assertions loosen only with written justification. Deleting/skipping tests is forbidden.
8. **Never weaken quality gates:** No lint suppressions, skipped CI steps, raised budgets, or `|| true`.
9. **No scope creep:** A task touching 2 files must not touch 9.
10. **Types over assertions:** No `any`, no `as unknown as X`. Model domain types honestly.
11. **No unannotated version drift:** Every dependency lagging by $\ge 2$ major versions must have an approved waiver in `docs/stack-map/landscape/dependency-annotations.yaml`. New code must not introduce deprecated dialects (`React.forwardRef` in React 19, `useNativeDriver: false`).
12. **No memory-hallucinated API replacements:** When updating deprecated patterns or legacy dialects, the replacement API must be verified against the installed package declarations (`node_modules/<pkg>/...`) or the official package registry before authoring code.

### Anti-Slop Verification Commands
Run before declaring work complete:
```bash
# Anti-slop gate: CNG firewall, native slop, aislop, fallow, version-drift, and seams must exit 0
pnpm run check:anti-slop

# Continuous Native Generation firewall (vetoes direct edits to android/ or ios/)
pnpm run check:cng

# Native anti-slop AST sentinel (useEffect fetch, secret leaks, unvirtualized lists)
pnpm run check:native-slop

# G5 device evidence attestation
pnpm run audit:device-evidence

# Direct version drift & framework dialect check
pnpm run check:version-drift

# Evidence gate: audit test commands
pnpm run check:test-evidence
```

---

## 6. Graduated Evidence Claim Mandate

Never write the unqualified claim **"tests passed"**. A test result is valid only when its evidence level, engine, and limitations are stated:

| Level | Evidence Tier | Engine / Runtime | Substitutions Allowed? |
| :--- | :--- | :--- | :--- |
| **G0** | Static Contract | TypeScript, ESLint | Zero runtime execution |
| **G1** | Boundary Mock | Vitest, Jest | External APIs/storage substituted |
| **G2** | Scenario Contract | Multi-step stateful flow | Network/storage substituted |
| **G3** | Component Mounting | Real React component tree | Native bridge substituted |
| **G4** | Platform Bundling | Metro/Next.js bundler + DOM | Real CSS and bundler |
| **G5** | Physical Device | Physical Android/iOS device | Real OS native threads |
| **R1** | Production Canary | Production canary traffic | Real live systems |

**Required reporting format:**
```text
G1 boundary / Vitest mock engine - SessionRouteGate.test.tsx: 4/4 passed.
Proves: the named contract assertions under configured substitutions.
Does not prove: real React Native, device back handling, visual fidelity, or production behavior.
```

---

## 7. TypeScript & Workspace Maintenance Rules

* **TypeScript Strictness Floor:** `packages/typescript-config/base.json` (`strict` + `noUncheckedIndexedAccess`) is mandatory for all packages. New packages must extend `base.json`.
* **Toolchain Single Source of Truth (SSoT):**
  * `package.json` (`packageManager`) and `.nvmrc` are the monorepo's canonical toolchain authority.
  * CI workflows use `pnpm/setup@fbda4c85fc2e1e08721cd8763afea8f48d60f024` (v3.0.0), which automatically derives pnpm and Node versions from SSoT with zero hardcoded version strings.
  * Run `pnpm run toolchain:sync` to automatically propagate version changes to `mise.toml`, `.devcontainer/`, `dagger.ts`, and bootstrap scripts.
  * Run `pnpm run toolchain:check` in CI to fail on any toolchain drift.
* **Automated Dependency Upgrades (Sacred-Pin-Aware):**
  * NEVER run unconstrained `pnpm update` or `taze -w` across the monorepo.
  * Use `pnpm run deps:check` to inspect outdated packages.
  * Use `pnpm run deps:upgrade` (minor/patch) or `pnpm run deps:upgrade:latest` to execute updates through `scripts/smart-upgrade-deps.mjs`, which automatically excludes and protects the Sacred Native Pins (Section 2), aligns workspace packages with `syncpack`, and verifies lockfile integrity.
* **Stack Map (Required after dependency changes):**
  * After adding/removing any package: run `pnpm run stack-map:bootstrap`, review in `docs/stack-map/landscape/stack-map-annotations.yaml`, then run `pnpm run stack-map`.
  * External dependencies: `pnpm run stack-map:deps` regenerates catalog from `dependency-annotations.yaml`.
* **Git Rules:** `android/`, `ios/`, and `node_modules/` are strictly gitignored. Lock files (`pnpm-lock.yaml`) MUST be committed. Feature branches merge forward.

---

## 8. Progressive Skill Router (Load On-Demand)

When performing specialized tasks, dynamically view the authoritative skill in `.agents/skills/`:

| Domain / Task | Specialized Skill Path |
| :--- | :--- |
| **Android Builds & WSL 2 / WSL 3** | [`.agents/skills/android-build/SKILL.md`](file:///c:/x/.agents/skills/android-build/SKILL.md) & [`docs/infra/2026-10-09-wsl3-modern-architecture-capabilities-and-patterns.md`](file:///c:/x/docs/infra/2026-10-09-wsl3-modern-architecture-capabilities-and-patterns.md) |
| **UI kit: components, worlds, recipes, tokens (mobile and web)** | [`.agents/skills/ui-kit/SKILL.md`](.agents/skills/ui-kit/SKILL.md), then [`docs/architecture/ui-kit-guide.md`](docs/architecture/ui-kit-guide.md). `branded-ui` describes the legacy `@repo/ui` root exports; use it only when reading legacy code. |

| **Expo & React Native Architecture** | Load [`.agents/skills/expo-overview/SKILL.md`](file:///c:/x/.agents/skills/expo-overview/SKILL.md), then the task-specific skill. Mobile agent setup and cloud/device workflow: [`apps/gurudevi-mobile/docs/architecture/2026-10-16-agent-native-mobile-workflow.md`](apps/gurudevi-mobile/docs/architecture/2026-10-16-agent-native-mobile-workflow.md). |
| **Verger (adaptive runtime) & its phases** | [`.agents/skills/verger/SKILL.md`](.agents/skills/verger/SKILL.md), then [`docs/engineering/runtime-performance/verger/playbook/README.md`](docs/engineering/runtime-performance/verger/playbook/README.md). Gate: `pnpm verger:check`. |
| **Nitro Modules & MMKV Guidance** | [`.agents/skills/nitro-guidance/SKILL.md`](file:///c:/x/.agents/skills/nitro-guidance/SKILL.md) & [`.agents/skills/mmkv-guidance/SKILL.md`](file:///c:/x/.agents/skills/mmkv-guidance/SKILL.md) |
| **Device Automation & UI Inspection** | [`.agents/skills/agent-device-control/SKILL.md`](file:///c:/x/.agents/skills/agent-device-control/SKILL.md) |
| **Offline Sync & PowerSync** | [`.agents/skills/powersync/SKILL.md`](file:///c:/x/.agents/skills/powersync/SKILL.md) |
| **Database & Schema Modeling** | [`.agents/skills/drizzle/SKILL.md`](file:///c:/x/.agents/skills/drizzle/SKILL.md) & [`.agents/skills/zenstack-schema-modeling/SKILL.md`](file:///c:/x/.agents/skills/zenstack-schema-modeling/SKILL.md) |
| **Storage & Data Efficiency** | [`.agents/skills/storage-efficiency/SKILL.md`](file:///c:/x/.agents/skills/storage-efficiency/SKILL.md) |
| **Resilient Web Crawling / SQLite WAL**| [`.agents/skills/resilient-crawler-pipeline/SKILL.md`](file:///c:/x/.agents/skills/resilient-crawler-pipeline/SKILL.md) |
| **Production Evidence Governance** | [`docs/architecture/production-evidence-governance.md`](file:///c:/x/docs/architecture/production-evidence-governance.md) |
| **User Journey Orchestration & FlowDAGs** | [`.agents/skills/user-journey-orchestration/SKILL.md`](file:///c:/x/.agents/skills/user-journey-orchestration/SKILL.md) & [`docs/architecture/2026-10-28-canonical-user-journey-and-screen-state-machine-architecture.md`](file:///c:/x/docs/architecture/2026-10-28-canonical-user-journey-and-screen-state-machine-architecture.md) |
| **Verification & Harness Architecture**| [`docs/architecture/verification-and-harness-engineering-2026.md`](file:///c:/x/docs/architecture/verification-and-harness-engineering-2026.md) |
| **Educational Systemantics & Civic Ground Truth** | [`docs/research/edu-audit/CANONICAL-SYSTEMANTICS-AND-EDUCATIONAL-GROUND-TRUTH.md`](file:///c:/x/docs/research/edu-audit/CANONICAL-SYSTEMANTICS-AND-EDUCATIONAL-GROUND-TRUTH.md) |
| **Educational Logistics & The Last-Mile** | [`docs/research/edu-audit/THE-LOGISTICS-OF-EDUCATION-TRUNK-LINES-HUBS-AND-THE-LAST-MILE.md`](file:///c:/x/docs/research/edu-audit/THE-LOGISTICS-OF-EDUCATION-TRUNK-LINES-HUBS-AND-THE-LAST-MILE.md) |
| **Education in Era of AI & Convivial Limits** | [`docs/research/edu-audit/EDUCATION-IN-THE-ERA-OF-AI-THE-ZERO-MARGINAL-COST-MYTH-AND-CONVIVIAL-LIMITS.md`](file:///c:/x/docs/research/edu-audit/EDUCATION-IN-THE-ERA-OF-AI-THE-ZERO-MARGINAL-COST-MYTH-AND-CONVIVIAL-LIMITS.md) |
| **The Educational Floor, Red Queen & Climber Alienation** | [`docs/research/edu-audit/THE-DIALECTIC-OF-THE-FLOOR-AND-THE-RED-QUEEN-MOBILITY-BURNOUT-AND-ALIENTATION.md`](file:///c:/x/docs/research/edu-audit/THE-DIALECTIC-OF-THE-FLOOR-AND-THE-RED-QUEEN-MOBILITY-BURNOUT-AND-ALIENTATION.md) |

### Reliable Skill Loading Across Long Tasks

Skills are not durable model memory. For every specialized task, load the matching `SKILL.md` into the active context before planning implementation; a catalog entry or a reference in this table is not a substitute for reading it. Use `.agents/skills/CATALOG.md` to find the best trigger match, then load the workspace skill and any referenced material that applies. If two skills apply, load the entry/router skill first and then the focused skill.

After a context reset, compaction, handoff, or material change in task scope, re-check the current task against this router and re-open the relevant skill before continuing. Keep a short task note with the goal, inspected files, active skill(s), constraints, decisions, and next action; treat it as a pointer to source files, not a replacement for rereading the skill. Re-check installed package versions and current source for version-sensitive instructions.

For Expo or React Native work, load `expo-overview` first, followed by the focused skill it routes to. For device verification, use the installed `agent-device` CLI's own `help workflow` and command-specific help as the version-matched authority; use `agent-device-control` only for the repository's `sovereign_device` adapter. See [`docs/agent/agent-native-mobile-and-skill-retrieval.md`](docs/agent/agent-native-mobile-and-skill-retrieval.md) for the audited mobile workflow and skill maintenance findings.
