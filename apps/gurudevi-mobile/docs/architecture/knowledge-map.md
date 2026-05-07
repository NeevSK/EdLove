# Gurudevi Platform: Knowledge Map (Foundational Index)

This file is a navigation map for learning the entire system: database, API, frontend, backend, information architecture, accessibility, UX, security, performance, and memory. It is intentionally precise and checklist-driven (minimal prose).

## How to use this map
- Pick a domain (DB / API / UI / Security / Performance / A11y / DX).
- Jump to the section and follow paths to the source-of-truth files.
- Use the Rules lists as "what good looks like" during reviews.

---

## 0) Monorepo mental model (boundaries)
- `apps/*`: product shells (platform-specific runtime + UI).
- `packages/core`: sovereign core (domain logic + adapters + shared APIs).
- `packages/database`: database + schema tooling (migrations, clients, types).
- `packages/ui`: design system / primitives (reused across apps).
- Shell depends on core; core must not depend on app UI.

---

## 1) Entry points (start here)

### Mobile app (Gurudevi)
- Runtime entry: `apps/gurudevi-mobile/index.ts`
- App root: `apps/gurudevi-mobile/App.tsx`
- App source: `apps/gurudevi-mobile/src`
- Features: `apps/gurudevi-mobile/features`
- App docs: `apps/gurudevi-mobile/docs`

### Core (domain + APIs)
- Public exports: `packages/core/src/index.ts`
- Domain rules (sovereign brain): `packages/core/src/logic`
- API surface (clients/contracts): `packages/core/src/api`
- Adapters (ports ↔ external systems): `packages/core/src/adapters`
- Store/state foundations: `packages/core/src/store`
- Hooks/providers: `packages/core/src/hooks`, `packages/core/src/providers`
- Types: `packages/core/src/types`

### UI system
- Shared UI primitives: `packages/ui`

### Platform tools
- Audits / hygiene tooling: `packages/platform-mcp`

---

## 2) System topology (the only diagram you need)
- UI screens/components → feature modules → hooks/providers → core API → core logic → adapters → database / queues / external services
- Data crosses layers only through typed boundaries (no "random shape objects").

---

## 3) Database & data model (schema-first)

### Where the truth lives
- DB package root: `packages/database`
- ZenStack schema: `packages/database/zenstack/schema.zmodel`
- Generated domain artifacts target: `packages/core/src/logic/generated`
- Core DB-related code: `packages/core/database`
- SQL migrations (incl. RLS policies): `packages/core/database/migrations`

### Rules (DB)
- Model invariants belong in schema/logic, not UI.
- Prefer additive schema changes; treat destructive changes as migrations with explicit rollout.
- Enforce multi-tenancy at the lowest possible layer (row-level where available).
- Every persisted entity has: identifier strategy, ownership/tenant key, created/updated timestamps (where applicable), and indexing strategy.
- Never trust client input; validate at API boundary and at DB boundary where possible.

### What to learn (DB)
- Relational modeling: normalization vs denormalization, join costs, indexes, constraints.
- Transactions: isolation, retries, idempotency keys.
- Migration safety: backwards compatible columns, feature flags, phased rollouts.

---

## 4) API & backend (contracts, boundaries, versioning)

### Where to look
- Core API contracts: `packages/core/src/api`
- Cross-cutting server logic/adapters: `packages/core/src/adapters`
- Supabase adapters: `packages/core/src/adapters/supabase`
- Shared types: `packages/core/src/types`

### Rules (API)
- No leaky DB models directly to UI; expose deliberate DTOs.
- All endpoints/events are typed, validated, and authorization-checked.
- Errors are structured and stable (machine-readable codes + human message).
- All write operations are idempotent or have an idempotency story.
- Authentication ≠ authorization: enforce both.
- Prefer capability/permission checks in one place (the gate), not sprinkled in UI.

### What to learn (API)
- REST/RPC shape, pagination, filtering, sorting.
- Caching: client cache vs server cache; invalidation strategy.
- Event-driven workflows: outbox pattern, retries, dedupe, dead-lettering.

---

## 5) Frontend (React Native) & UI architecture

### Where to look
- App UI + navigation: `apps/gurudevi-mobile/src`
- Feature modules: `apps/gurudevi-mobile/features`
- Shared UI primitives: `packages/ui`
- Core hooks/providers: `packages/core/src/hooks`, `packages/core/src/providers`

### Rules (UI)
- Screens orchestrate; do not contain business rules.
- Components are pure rendering + local interaction; avoid network side-effects by default.
- State is minimal, normalized, and colocated; avoid duplicated sources of truth.
- Side-effects use explicit boundaries (hooks/providers/core API), never hidden in rendering.
- Styling uses semantic tokens, not ad-hoc colors; reuse primitives.

### What to learn (UI)
- React render model: referential equality, memoization, derived state, suspense/concurrency implications.
- Navigation lifecycle: focus/blur side-effects; resource cleanup.
- Offline-first basics: optimistic updates, conflict resolution, sync.

---

## 6) Accessibility (A11y) & inclusive UX

### Rules (A11y)
- Every interactive element has: role, label, state (disabled/selected/expanded), and reachable focus.
- Contrast meets target; do not rely on color alone.
- Touch targets are large enough; spacing respects motor accessibility.
- Dynamic content announces changes (where applicable).
- Motion respects reduced motion preferences.

### What to learn (A11y)
- Screen reader flows (VoiceOver/TalkBack), focus order, grouping.
- Semantic components vs custom views.
- Color/contrast and typography scaling.

---

## 7) UX & information architecture (IA)

### Rules (UX/IA)
- Every screen has one primary job; secondary actions are discoverable but not dominant.
- Copy is consistent (terms, capitalization, error tone).
- Forms: validation is immediate but non-blocking; errors are specific and local.
- Empty states teach the next action; loading states are honest and cancellable.
- Privacy: explain why you need a permission before requesting it.

### What to learn (UX/IA)
- Task flows, affordances, feedback loops, error prevention.
- Consistency vs platform conventions.

---

## 8) Security (auth, authorization, data protection)

### Where to look
- Core policies/rules: `packages/core/src/logic`
- Authorization points: `packages/core/src/api`
- Adapters/policy enforcement: `packages/core/src/adapters`

### Rules (Security)
- Treat every boundary as hostile: UI input, network, storage, deep links.
- Authorization is enforced server-side (and/or DB policy), not only in UI.
- Least privilege: narrow scopes; avoid "admin" as a catch-all.
- Secrets never ship to clients; tokens are stored with platform-appropriate security.
- Auditability: important actions are traceable (who/what/when).
- Data minimization: only collect/return what’s needed.

### What to learn (Security)
- Threat modeling: assets, actors, entry points, trust boundaries.
- OWASP basics: injection, broken auth, sensitive data exposure, misconfig.
- Multi-tenancy: tenant isolation in queries and storage.

---

## 9) Performance & memory management (mobile realities)

### Rules (Perf/Mem)
- Avoid unnecessary re-renders: stable props, memoization, derived selectors.
- Lists: virtualize, key correctly, avoid heavy item renders.
- Images: size appropriately; cache strategy; avoid decoding huge bitmaps.
- Networking: batch requests; debounce; avoid waterfalls; handle slow/offline.
- Cleanup: unsubscribe timers/listeners on unmount; cancel in-flight work on blur/unmount.
- Storage: bound caches; define eviction; avoid unbounded arrays in state.

### What to learn (Perf/Mem)
- JS ↔ native bridge costs; avoid large payloads across boundaries.
- Measuring: flame graphs, render counts, memory snapshots.
- Backpressure: queues, retries, exponential backoff with jitter.

---

## 10) Observability (logs, metrics, traces)

### Rules (Observability)
- Log with context: user/tenant (non-PII), request IDs, action names, error codes.
- Errors preserve original cause; avoid swallowing exceptions.
- Metrics: latency, failure rate, retry counts, queue lag.
- Privacy: never log secrets or sensitive user content.

---

## 11) Testing strategy (what to test where)

### Where to look
- Core tests: `packages/core/src/__tests__`
- Mobile tests: `apps/gurudevi-mobile/__mocks__` and app test config files

### Rules (Tests)
- Domain logic: unit tests in core (fast, deterministic).
- API: contract tests + authorization tests at the boundary.
- UI: a few high-value flows; avoid snapshot-only confidence.
- Every bug fix adds a regression test when feasible.

---

## 12) Build, release, and DX (keep the repo healthy)

### Where to look
- Root scripts/config: `package.json`, `turbo.json`, `biome.json`
- Mobile build config: `apps/gurudevi-mobile/eas.json`

### Rules (DX)
- Formatting/linting is non-negotiable (keep diffs small).
- Avoid circular dependencies; respect package boundaries.
- Prefer incremental builds; keep CI fast.

---

## 13) Common commands (repeatable workflows)
- Generate typed domain artifacts from schema: `pnpm -C packages/database generate`
- Apply schema changes to DB (push): `pnpm -C packages/database db:push`
- Run DB studio: `pnpm -C packages/database db:studio`
- Run migrations: `pnpm -C packages/database db:migrate`

---

## Glossary (short, stable)

| Term | Meaning |
| :--- | :--- |
| Sovereign core | Domain rules independent of app/runtime details. |
| Shell | Platform-specific app (UI, device APIs, integration glue). |
| Port/Adapter | Boundary interface (port) + external integration (adapter). |
| DTO | Deliberate API shape sent over the wire (not a DB model). |
| SSOT | Single source of truth for schema/types/contracts. |
