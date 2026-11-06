---
title: "The Canonical 12 File Archetypes: From Vibe Coder to First-Principles Architect"
status: "active"
date: "2026-11-01"
author: "Antigravity Pair Programming"
tags: [architecture, clean-architecture, hexagonal, first-principles, archetypes, pareto, patterns, anti-patterns]
---

# The Canonical 12 File Archetypes: From Vibe Coder to First-Principles Architect

## 1. The Mental Shift: Escaping "Archetype Soup"

When developers "vibe code" without first principles, codebases devolve into **Archetype Soup**—a sea of files with ambiguous names like:
`userManager.ts`, `authHelper.ts`, `dataService.ts`, `storageHandler.ts`, `syncUtils.ts`, `sessionCoordinator.ts`, `index.ts`.

Nobody knows:
- Is a `Manager` stateful or stateless? Does it make network calls or hold React state?
- Does a `Helper` contain business logic, pure math, or database queries?
- Why does `useSanctuaryFeature` do schema validation, database queries, and store coordination all in one file?
- Why is an `Adapter` imported directly by a React UI component?

### The First Principle: There Are Only 12 Building Blocks
In any professional, clean, scalable software architecture (Clean Architecture, Hexagonal/Ports & Adapters, DDD), **there are NOT a thousand file types**. 

Every file belongs to exactly **one of 12 Canonical Archetypes**, structured into a **strict top-down unidirectional hierarchy**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     TOP-DOWN ARCHITECTURAL HIERARCHY (TIERS 6 TO 0)                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  [TIER 6: PRESENTATION]        (1) Component  •  (2) Screen / Route                     │
│         │                                                                               │
│         ▼                                                                               │
│  [TIER 5: APPLICATION]         (3) Hook (UI Facade)  •  (4) Flow (Saga/Use Case)        │
│         │                                                                               │
│         ▼                                                                               │
│  [TIER 4: STATE MANAGEMENT]    (5) Store  •  (6) Slice                                  │
│         │                                                                               │
│         ├───────────────────────────────┐                                               │
│         ▼                               ▼                                               │
│  [TIER 2: DOMAIN CORE]          [TIER 1: PORTS]                                         │
│    (7) Entity & Invariant         (9) Port (Interface Contract)                         │
│    (8) Domain Service                     ▲                                             │
│         │                                 │ (implements)                                │
│         │                       [TIER 3: INFRASTRUCTURE / ADAPTERS]                     │
│         │                         (10) External Gateway Adapter                         │
│         │                         (11) Data & Query Adapter (SQL / SQLite / oRPC)       │
│         │                                 │                                             │
│         ▼                                 ▼                                             │
│  [TIER 0: SUBSTRATE & SCHEMAS] (12) Schema & Contract  •  Type Definitions              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.5. First Principles: Why Java Enterprise Architecture (Repositories, Managers, BFF) is Banned in Modern React Native, Local-First, and API-First Stacks

A frequent architectural regression in full-stack TypeScript codebases is **Java Enterprise Cargo-Culting**—developers copy-pasting 2000s Spring Boot patterns (`@Repository`, `@Service`, `*Manager`, `*Factory`, GoF Singletons) into modern React Native, Local-First, and API-First applications.

This is an epistemic fallacy. Modern client and edge architectures operate on fundamentally different physics than multi-threaded JVM servlet containers:

```
❌ THE BANNED JAVA ENTERPRISE CEREMONY (Spring Boot / BFF Baggage):
React UI ──► *Manager.ts ──► *Repository.ts ──► DAO / JDBC ──► SQL Database
(Imperative, one-shot, blocking, stateful OOP containers, GoF singletons)

✅ THE IDIOMATIC POLYMATH SOVEREIGN ARCHITECTURE:
Local-First Mobile:   React Native ──► useLiveQuery() ──► SQLite (PowerSync WAL stream)
API-First Sanctuary:  Web/Mobile ──► oRPC v2 Procedure ──► Cedar Authz ──► Kysely SQL (Hono v5)
Client State & I/O:   React Hook ──► Zustand Store (Atomic) ──► Hexagonal Adapter (*.adapter.ts)
```

### The 4 Architectural Invariants Behind the Ban:

#### 1. Local-First (PowerSync + SQLite) Destroys Imperative Repositories
- **The Java Mindset**: A `Repository` exposes imperative one-shot methods: `attendanceRepository.getAttendances(): Promise<Attendance[]>`.
- **The Reality in Local-First**: SQLite lives directly on the mobile device, continually replicated in the background via PowerSync WAL streams. 
- **Why Repository Fails**: If a UI component calls an imperative `repo.getAttendances()`, it receives a static snapshot. When background sync streams new rows into SQLite, the UI **does not update**! The developer is forced to write polling loops or manual cache-invalidation code.
- **The Mandated Pattern**: The UI directly binds to **reactive live queries** (`useLiveQuery(...)` or TanStack Query hooks). The local database is the single source of truth, and updates flow automatically into the React render tree with zero imperative repository overhead.

#### 2. No BFF / API-First (Hono v5 + oRPC v2) Eliminates Server Repositories
- **The Java Mindset**: In traditional web architectures, a **Backend-For-Frontend (BFF)** was introduced between web clients and backend microservices. The BFF used "Repositories" to call downstream services and aggregate JSON.
- **The Reality in Our Stack**: **There is NO BFF.** We are **API-First**.
- **Why Repository Fails**:
  - `apps/sanctuary-api` exposes type-safe **oRPC v2 procedures** running on **Hono v5**.
  - oRPC generates the end-to-end typed contract (`@repo/core/api/v1/contract`) and client (`@repo/core/api/v1/client`).
  - Mobile and Web import `client` and call typed procedures directly: `client.classroom.getAttendance({ schoolId })`.
  - Inside Sanctuary API, oRPC procedure handlers are thin functional pipelines: Cedar policies evaluate fine-grained authorization at the boundary, and **Kysely** compiles typed SQL queries directly to PostgreSQL within transactions.
  - Adding a Spring Boot-style `AttendanceRepository` class inside Sanctuary API or `@repo/core` adds zero abstraction value—**Kysely is already a type-safe SQL query compiler!** An intermediate repository just copies arguments from oRPC to Kysely and doubles maintenance surface.

#### 3. React 19 & ES Modules Kill GoF Singletons & Stateful Managers
- **The Java Mindset**: Java classes cannot exist outside class loaders, so developers used GoF `static getInstance()` singletons and created `*Manager` classes to hold global state and business logic.
- **The Reality in React 19 / Modern TS**:
  - ES Modules are **native singletons** guaranteed by the JavaScript engine runtime.
  - Client state belongs in **atomic Zustand stores** (`useAuthStore`, `useTemporalStore`), consumed via granular selectors to prevent re-render cascading.
  - Business rules belong in **pure deterministic domain functions** (`sanctuaryFeature.ts`).
  - Cross-platform hardware bridges (`storageDriver`, `networkMonitor`, `telemetrySink`, `cryptoVault`, `deviceIdentityDriver`) are strictly **platform drivers** bridging MMKV, Sentry, and SecureStore to the monorepo—not stateful domain containers.

#### 4. The Terminology Translation Table (Zero-Tolerance Ledger)

| Java / Spring Boot Term (BANNED ❌) | Why It Fails in RN / Local-First / API-First | Idiomatic Modern Architecture (MANDATED ✅) |
| :--- | :--- | :--- |
| `*Repository.ts` | Imperative `get*()` breaks local-first reactive queries; duplicates Kysely / oRPC v2 procedures. | `*.query.ts`, `useLiveQuery()`, or typed oRPC procedure (`api/v1/client`) |
| `*Manager.ts` | Ambiguous junk container holding mixed React state, network I/O, and domain rules. | Platform Driver (`*Driver.ts`), Atomic Store (`use*Store.ts`), or Spatial Container (`*Modal.tsx`, `*Panel.tsx`) |
| `*Factory.ts` | Pointless instantiation ceremony in a module system with first-class functions. | Standalone exported functions or module singletons |
| `*Service.ts` / `*ServiceImpl.ts` | Banned in UI/Web/Core (allowed ONLY in `@repo/platform-mcp` for agent tools). | Hexagonal Adapter (`*.adapter.ts`), Declarative Hook (`use*.ts`), or pure functions |
| `static getInstance()` | Emulates JVM static class loader singletons; breaks module tree-shaking and mocking. | Direct module const export (`export const engine = new Engine();`) |
| BFF (Backend For Frontend) | Adds intermediate network hops, serialization overhead, and redundant DTOs. | API-First: Direct typed oRPC v2 procedures over Hono v5 with Cedar authz |

---

## 2. The 12 Canonical Archetypes Reference Manual

---

### TIER 0: SUBSTRATE & DATA CONTRACTS (Bedrock)

#### 1. Schema (`*.schema.ts`, `*.zmodel`)
- **What it is**: The runtime structural definition of data. Typically written with Zod, TypeBox, or ZenStack.
- **Single Responsibility (SRP)**: Validate unknown or external inputs (API payloads, database rows, user forms) and infer TypeScript types.
- **Allowed Imports**: External validation libraries (`zod`), other Tier 0 Schemas.
- **FORBIDDEN Imports**: Logic, Stores, Adapters, Hooks, UI. (NEVER put business rules in a schema!).
- **Repo Example**: [`packages/core/src/logic/schemas/capacity.schema.ts`](file:///c:/x/packages/core/src/logic/schemas/capacity.schema.ts)
- **Vibe Coder vs. Senior Architect**:
  - *Vibe Coder*: Puts database queries and permission checks inside a Zod `.refine()` or exports mutable global objects.
  - *Senior Architect*: Schema is a pure, immutable validation definition that parses raw input into a validated domain shape.

#### 2. Type Definition (`types/*.ts`, `*.types.ts`)
- **What it is**: Pure compile-time TypeScript declarations (`type`, `interface`, `enum`).
- **Single Responsibility (SRP)**: Define compile-time shape contracts with zero runtime JavaScript footprint.
- **Allowed Imports**: Other pure type definitions.
- **FORBIDDEN Imports**: Any runtime code (classes, executable functions, mutable variables).
- **Repo Example**: [`packages/core/src/types/Identity.ts`](file:///c:/x/packages/core/src/types/Identity.ts), [`packages/core/src/types/authorization.ts`](file:///c:/x/packages/core/src/types/authorization.ts)
- **Golden Rule**: If you delete TypeScript, this file produces **0 bytes** of compiled JavaScript.

---

### TIER 1: BOUNDARY CONTRACTS (Dependency Inversion)

#### 3. Port (`*.port.ts`, `I*.ts`)
- **What it is**: An abstract TypeScript interface declaring what the domain *needs* from the outside world (I/O, database, network, auth, billing).
- **Single Responsibility (SRP)**: Enable **Dependency Inversion Principle (DIP)**. The domain defines the Port interface; the outside world (Adapter) implements it.
- **Allowed Imports**: Tier 0 (Schemas, Types).
- **FORBIDDEN Imports**: Tier 3 Adapters, Tier 4 Stores, Tier 5 Hooks, Tier 6 UI.
- **Repo Example**: [`packages/core/src/logic/ports/entitlement.port.ts`](file:///c:/x/packages/core/src/logic/ports/entitlement.port.ts), [`packages/core/src/logic/ports/authz.port.ts`](file:///c:/x/packages/core/src/logic/ports/authz.port.ts)
- **First Principle Rule**: If you switch from Supabase to Postgres or Firebase, the **Port does NOT change**! Only the Adapter changes.

---

### TIER 2: PURE DOMAIN CORE (The Heart of the Application)

#### 4. Entity & Domain Invariant (`*.ts` in `logic/` or `domain/`)
- **What it is**: Pure business rules, state transition functions, and domain calculators.
- **Single Responsibility (SRP)**: Enforce domain invariants (e.g. "A third-class citizen cannot write to school records", "Calculate pricing tier access").
- **Allowed Imports**: Tier 0 (Schemas, Types), Tier 1 (Ports).
- **FORBIDDEN Imports**: React (`useState`, `useEffect`), Zustand stores, SQLite, PowerSync, fetch/HTTP.
- **Repo Example**: [`packages/core/src/logic/permissions/sanctuaryFeature.ts`](file:///c:/x/packages/core/src/logic/permissions/sanctuaryFeature.ts), [`packages/core/src/logic/registry/citizenship.ts`](file:///c:/x/packages/core/src/logic/registry/citizenship.ts)
- **First Principle Rule**: Deterministic, pure functions. Given the same inputs, it ALWAYS returns the same output. It can be unit-tested in 2 milliseconds with zero mocks.

#### 5. Domain Service (`*Service.ts`)
- **What it is**: A stateless domain orchestrator that coordinates business logic across multiple entities or ports.
- **Single Responsibility (SRP)**: Execute business operations that don't belong to a single entity (e.g., `BillingService.calculateProration()`).
- **Allowed Imports**: Tier 0 (Schemas), Tier 1 (Ports), Tier 2 (Entities).
- **FORBIDDEN Imports**: React UI, concrete databases directly.

---

### TIER 3: INFRASTRUCTURE & ADAPTERS (The Outside World)

#### 6. Adapter (`*.adapter.ts`, `*Adapter.ts`)
- **What it is**: The concrete glue that implements a Port by talking to an external SDK, library, or network protocol.
- **Single Responsibility (SRP)**: Translate between the domain's language (Port) and the third-party library's language (SDK/API).
- **Allowed Imports**: The 3rd-party SDK (Supabase, GrowthBook, MMKV, fetch), Tier 1 Ports (implements them), Tier 0 Schemas.
- **FORBIDDEN Imports**: UI components, React hooks, Application flows.
- **Repo Example**: [`packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts`](file:///c:/x/packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts), [`packages/core/src/adapters/feature-rollout/growthBookFeatureRollout.adapter.ts`](file:///c:/x/packages/core/src/adapters/feature-rollout/growthBookFeatureRollout.adapter.ts)
- **First Principle Rule**: Adapters are disposable. You can throw away `growthBookFeatureRollout.adapter.ts` and replace it with `launchDarklyFeatureRollout.adapter.ts` without touching a single line of domain or UI code!

#### 7. Data & Query Adapter (`*.query.ts`, `*.adapter.ts`)
- **What it is**: The concrete persistence implementation of a Port (or typed database query module) that talks directly to durable storage (Kysely SQL, SQLite, PowerSync, or Supabase).
- **Single Responsibility (SRP)**: Execute database queries, handle transactions, and map raw rows into validated domain shapes.
- **Why NOT "Repository"?**: In Spring Boot, "Repository" implies an imperative, stateful collection class (`attendanceRepository.findAll()`). In modern TypeScript, data access is functional: either reactive query hooks (`useLiveQuery`), typed Kysely/SQL builders (`attendance.query.ts`), or hexagonal adapters (`attendance.adapter.ts`).
- **Allowed Imports**: Database clients (Kysely, Drizzle, SQLite, Supabase), Tier 0 Table Schemas, Tier 1 Ports.
- **FORBIDDEN Imports**: React hooks, UI presentation components.
- **Repo Example**: [`packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts`](file:///c:/x/packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts), [`packages/core/src/api/v1/client.ts`](file:///c:/x/packages/core/src/api/v1/client.ts).

---

### TIER 4: STATE MANAGEMENT (Client Reactivity)

#### 8. Store (`use*Store.ts`, `*Store.ts`)
- **What it is**: An in-memory, reactive state container (typically Zustand) that holds the single source of truth (SSOT) for the client session.
- **Single Responsibility (SRP)**: Hold active client snapshots, provide synchronous selectors for React rendering, and dispatch actions.
- **Allowed Imports**: Tier 1 Ports (via Dependency Injection), Tier 2 Domain Logic, Tier 0 Schemas.
- **FORBIDDEN Imports**: **Direct imports of Tier 3 Concrete Adapters!** (Stores must be decoupled from whether data comes from mock, SQLite, or network).
- **Repo Example**: [`packages/core/src/store/useFeatureStore.ts`](file:///c:/x/packages/core/src/store/useFeatureStore.ts), [`packages/core/src/store/useEntitlementStore.ts`](file:///c:/x/packages/core/src/store/useEntitlementStore.ts)

#### 9. Slice (`*.slice.ts`)
- **What it is**: A sub-partition of a large store's state and actions, used to prevent monolithic 1,000-line store files.
- **Single Responsibility (SRP)**: Manage a single domain slice (e.g. `auth.slice.ts`, `tenant.slice.ts`) within a composite store.
- **Repo Example**: [`packages/core/src/store/slices/auth.slice.ts`](file:///c:/x/packages/core/src/store/slices/auth.slice.ts)

---

### TIER 5: APPLICATION & ORCHESTRATION (Use Cases)

#### 10. Hook (`use*.ts`, `use*.tsx`)
- **What it is**: A React-lifecycle facade that subscribes to stores, coordinates user interactions, and provides ready-to-render data to UI components.
- **Single Responsibility (SRP)**: Bridge between React's render loop and the underlying state stores and services.
- **Allowed Imports**: Tier 4 Stores, Tier 2 Domain Logic, Tier 0 Types.
- **FORBIDDEN Imports**: Direct database calls, direct concrete adapters, runtime Zod schema parsing.
- **Repo Example**: [`packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts`](file:///c:/x/packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts)
- **First Principle Rule**: A Hook is a thin presentation adapter. If a hook contains 200 lines of state transitions and data munging, that logic belongs in a Store or a Flow!

#### 11. Flow / Coordinator (`*.flow.ts`, `*Coordinator.ts`)
- **What it is**: A multi-step saga or workflow that spans across multiple stores, repositories, and user interactions (e.g., Onboarding Wizard, Account Deletion, School Link).
- **Single Responsibility (SRP)**: Orchestrate sequential steps, rollback on error, and coordinate state across boundaries.
- **Allowed Imports**: Tier 4 Stores, Tier 1 Ports, Tier 2 Logic.
- **Repo Example**: `principalConnectSchool.flow.ts`, `scopeSessionCoordinator.ts`.

---

### TIER 6: PRESENTATION UI (The View)

#### 12. Component (`*.tsx`, `*Prompt.tsx`, `*Guard.tsx`)
- **What it is**: A pure React component that maps state to JSX (DOM or React Native primitives).
- **Single Responsibility (SRP)**: Render visual elements, layout structure, and bind user gestures (clicks, taps) to hook callbacks.
- **Allowed Imports**: Tier 5 Hooks, Tier 0 Types, UI Design Tokens.
- **FORBIDDEN Imports**: Tier 4 Stores directly (prefer hooks), Tier 3 Adapters, Tier 1 Ports, Database SQL.
- **Repo Example**: [`packages/ui/src/components/SanctuaryGuard.tsx`](file:///c:/x/packages/ui/src/components/SanctuaryGuard.tsx), [`packages/ui/src/components/SanctuaryButton.tsx`](file:///c:/x/packages/ui/src/components/SanctuaryButton.tsx)

---

### CROSS-CUTTING: The Barrel (`index.ts`)

#### The Barrel (`index.ts`)
- **What it is**: An export catalog file that defines the public boundary of a package or folder.
- **The Golden Law of Barrels**:
  > **Barrels export DOWNWARD to consumers. Files within the same folder must NEVER import each other through their own barrel!**
- **The Fatal Vibe Coder Mistake**: File `A.ts` imports from `./index.ts`, while `index.ts` exports `A.ts` and `B.ts`. This causes instant circular dependency deadlocks and undefined imports at runtime.

---

## 3. The Pareto 20%: Unmasking the 136 Freeform Files

Applying the Pareto Principle ($80/20$ rule):
> **The 20% of unclassified files (136 files) generate 80% of the architectural confusion, hidden dependencies, and regressions across the monorepo.**

When we analyzed every single one of the 136 freeform files in `packages/core/src`, we discovered that they are **NOT truly unclassifiable**—they are **victims of two historical anti-patterns**:

### 1. The "Utility Junk Drawer" Anti-Pattern (`lib/` - 62 files)
Nearly half of the unclassified files (62 files) live in `packages/core/src/lib/`:
- `lib/authStorage.ts`, `lib/authProfileStorage.ts`, `lib/scopedStateStorage.ts`, `lib/storageWrapper.ts`, `lib/storage.ts`  
  $\longrightarrow$ **These are NOT utilities! These are Tier 3 Storage Adapters.**
- `lib/cloudinary.ts`, `lib/inngest.ts`, `lib/resend.ts`  
  $\longrightarrow$ **These are NOT utilities! These are Tier 3 Third-Party External Adapters.**
- `lib/circuit-breaker.ts`, `lib/idempotency.ts`, `lib/temporalEvents.ts`  
  $\longrightarrow$ **These are Tier 2/3 Resilience Infrastructure.**
- **The Fix**: Liquidate `lib/`. Move adapters to `src/adapters/`, move resilience to `src/resilience/` or `src/effect/`, and delete the junk drawer.

### 2. The "Misnamed Native" Anti-Pattern (`native/` - 21 files)
21 files live in `packages/core/src/native/`:
- `guestConversionLedger.ts`, `guestDataManager.ts`, `guestDataSync.ts`, `guestDataTransferPolicy.ts`, `guestIdentity.ts`, `guestLease.ts`, `guestScope.ts`, `guestSessionCleanup.ts`
- **The Reality**: These files contain **zero React Native or C++ Fabric code**! They are pure TypeScript guest session state managers, imported directly by web browsers. Calling this folder `native/` misled developers into creating parallel web storage implementations.
- **The Fix**: Re-home them into `src/domains/guest/` or `src/logic/guest/` as standard Domain Policies.

---

## 4. What Was Missing? The 5 Specialized Architectural Subsystems

Beyond the 12 core archetypes, modern enterprise monorepos feature **5 Specialized Cross-Cutting Subsystems** that must be formally recognized:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     THE 5 SPECIALIZED ARCHITECTURAL SUBSYSTEMS                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  [1. Sync Engine & Offline Outbox]   Delta, Receipts, Replay Policy, Outbox Queue       │
│  [2. React Context Providers]        AuthProvider, AssetsProvider, Hydration Roots      │
│  [3. Telemetry & Observability]      Sentry, PostHog, Breadcrumbs, Performance Timers   │
│  [4. Resilience & Effect Runtime]    Circuit Breakers, Retry Schedules, Typed Errors    │
│  [5. API Gateway & Procedures]       oRPC v2 Routers, Hono v5 Handlers, Contracts       │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **The Sync Engine & Offline Outbox (`lib/sync/` - 15 files)**:
   - Files: `commandLifecycle.ts`, `delta.ts`, `MutationAuditLog.ts`, `receipts.ts`, `replayAdmission.ts`, `outboxMigration.ts`.
   - **Role**: Tier 3 Infrastructure. Handles SQLite $\longleftrightarrow$ Supabase local-first sync streams, conflict resolution, and offline mutation replays.
2. **React Context Providers (`providers/` - 4 files)**:
   - Files: `AuthProvider.tsx`, `AssetsProvider.tsx`, `CapabilityHydrationProvider.tsx`.
   - **Role**: Tier 5/6 Root Orchestrators. Injects DI containers and root capabilities into the React tree.
3. **Telemetry & Observability (`monitoring/` - 10 files)**:
   - Files: `sentry.ts`, `posthog.ts`, `breadcrumbs.ts`, `safeData.ts`, `authIdentity.ts`.
   - **Role**: Cross-Cutting Telemetry Adapters. Must never throw errors or crash user flows.
4. **Resilience & Effect-TS Runtime (`effect/` - 6 files)**:
   - Files: `Layers.ts`, `Runtime.ts`, `Schedules.ts`, `Errors.ts`, `circuit-breaker.ts`.
   - **Role**: Hexagonal Effect Substrate. Replaces ad-hoc `setTimeout` and try/catch with composable, fiber-based concurrency and exponential backoff retry schedules.
5. **API Gateway & Procedure Contracts (`api/v1/` - 2 files)**:
   - Files: `client.ts`, `contract.ts`.
   - **Role**: End-to-end type-safe RPC boundaries (oRPC v2) binding browser/mobile to Sanctuary API.

---

## 5. Disambiguation Matrix: Clearing Confusing Pairs

| Pair | What Vibe Coders Confuse | The Senior Architect Truth |
| :--- | :--- | :--- |
| **Port vs. Adapter** | Treating them as the same thing or calling an adapter a port. | **Port is the Interface** (`IEntitlementPort`). **Adapter is the Implementation** (`SupabaseEntitlementAdapter`). Domain owns the Port; Infrastructure owns the Adapter. |
| **Store vs. Service** | Putting state in services or putting business algorithms in stores. | **Store is Stateful** (holds memory snapshot for UI reactivity). **Service is Stateless** (pure computation or multi-step coordination). |
| **Manager vs. Coordinator** | Calling any messy utility file a `*Manager.ts`. | A `Manager` is usually a legacy anti-pattern. Replace with a **Coordinator** (orchestrates a saga flow) or a **Store** (holds state). |
| **Repository vs. Adapter** | Mixing generic technology with entity persistence. | **Adapter** connects to a technology (Supabase, PowerSync, Sentry). **Repository** handles CRUD persistence for a domain aggregate (e.g. `AttendanceRecord`). |
| **Schema vs. Type** | Writing a TypeScript interface and expecting runtime validation. | **Type** is compile-time only (vanishes at runtime). **Schema** is an executable Zod validator that inspects actual runtime JSON. |
| **Hook vs. Flow** | Putting a 300-line multi-step saga inside a React `useEffect`. | **Hook** binds a component to state. **Flow** is a pure async state machine that executes across multiple screens/steps. |

---

## 6. Anti-Patterns & Refactoring Playbook (Concrete Code Blueprints)

### Anti-Pattern 1: The God Hook
```typescript
// ❌ VIBE CODER: Hook acts as Store + Schema Validator + DB Adapter
export function useFeature(id: string) {
  const [data, setData] = useState();
  useEffect(() => {
    // Direct SQL or API call inside UI hook!
    fetch(`/api/data/${id}`).then(r => r.json()).then(raw => {
      const parsed = MySchema.safeParse(raw); // Runtime parsing in hook!
      setData(parsed.data);
    });
  }, [id]);
  return data;
}

// ✅ SENIOR ARCHITECT: Clean 4-Tier Separation of Concerns
// 1. Schema defines shape (Tier 0)
// 2. Adapter fetches & validates (Tier 3)
// 3. Store holds reactive cache (Tier 4)
// 4. Hook is a 1-line selector (Tier 5)
export function useFeature(id: string) {
  return useFeatureStore((s) => s.getFeature(id));
}
```

### Anti-Pattern 2: The Adapter-Coupled Store
```typescript
// ❌ VIBE CODER: Store hardcodes Supabase adapter import
import { SupabaseEntitlementAdapter } from '../adapters/supabase/supabaseEntitlement.adapter';

export const useEntitlementStore = create((set) => ({
  fetch: async () => {
    const adapter = new SupabaseEntitlementAdapter(); // TIGHT COUPLING!
    const data = await adapter.getEntitlements();
    set({ data });
  }
}));

// ✅ SENIOR ARCHITECT: Dependency Inversion via Port
import type { IEntitlementPort } from '../logic/ports/entitlement.port';

export const createEntitlementStore = (port: IEntitlementPort) => create((set) => ({
  fetch: async () => {
    const data = await port.getEntitlements(); // LOOSE COUPLING via Port!
    set({ data });
  }
}));
```

### Anti-Pattern 3: Ad-Hoc Retry Loops vs. Effect Schedules
```typescript
// ❌ VIBE CODER: Fragile, un-cancelable while loop with setTimeout
async function fetchWithRetry(url: string) {
  let attempts = 0;
  while (attempts < 3) {
    try {
      return await fetch(url);
    } catch (e) {
      attempts++;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts)));
    }
  }
}

// ✅ SENIOR ARCHITECT: Composable Effect-TS Canonical Schedule
import { Effect, Schedule } from 'effect';

const canonicalRetry = Schedule.exponential('200 millis').pipe(
  Schedule.compose(Schedule.recurs(3)),
  Schedule.jittered
);

export const resilientFetch = (url: string) =>
  Effect.tryPromise(() => fetch(url)).pipe(
    Effect.retry(canonicalRetry)
  );
```

---

## 7. The "Using Somewhere" Fallacy & The Accretive Frankenstein

### The Existential Dilemma
One of the most persistent confusions among developers transitioning from vibe coding to senior architecture is:
> *"If `AuthManager.ts` is an anti-pattern, why is it imported in `auth.factory.ts`? If something is being used somewhere, doesn't that prove it is necessary and working?"*

The short answer is **NO**. "Being used somewhere" is often merely an artifact of **The Accretive Illusion**.

### The Anatomy of Accretive Frankenstein Development
In rapid, multi-agent or multi-developer codebases without strict architectural gates:
```
[Agent 1: Feb 2026]
Creates OOP Spring-Boot style AuthManager.ts (611 LOC) with constructor injection.
       │
       ▼
[Agent 2: March 2026]
Creates auth.factory.ts to instantiate new AuthManager(new SupabaseAuthAdapter()).
       │
       ▼
[Agent 3: May 2026 - Building Real UI Screens]
Realizes AuthManager is an imperative class with no reactive triggers for React.
Bypasses AuthManager entirely and builds useAuthStore.ts using Zustand!
All 34 production screens and hooks import useAuthStore.ts.
       │
       ▼
[Agent 4: Today - Vibe Coder / Maintenance]
Looks at AuthManager.ts and thinks:
"Wait! It is imported by auth.factory.ts, and auth.factory.ts is imported by factory.ts!
It is 'used somewhere'! We cannot touch it or remove it!"
```

### The 3 Reasons Why Accretive Deadweight Survives
1. **The Self-Referential Zombie Loop**: Dead code imports dead code. `AuthManager` is imported by `auth.factory.ts`, which is imported by `misc.factory.ts`, which is imported by nothing in production! It has an in-degree of 2, but its **effective reach to real users is exactly ZERO**.
2. **Fear of the Unknown (The Chesterton's Fence Fallacy)**: Developers fear deleting a 600-line file because they assume an invisible genius wrote it for a secret reason. In reality, it was written by an LLM prompt hallucinating a Java enterprise pattern.
3. **Compiler Complacency (`tsc` Blindness)**: TypeScript only checks whether types match; it has zero concept of runtime utility. A codebase can compile with 0 errors while 40% of its files are deadweight zombies.

> [!IMPORTANT]
> **The Senior Architect Law of Legitimate In-Degree**:
> Merely having an `import` statement in another file is NOT proof of architectural health.
> Real architectural legitimacy requires **Inward Layer Authority**: Does the file serve an active production UI route, a background sync worker, or a verified domain invariant? If it only serves other wrappers, it is deadweight.

---

## 8. Java Language Contamination in Modern TypeScript

### The Historical Origin of the Disease
TypeScript was designed by Anders Hejlsberg (creator of C#) and gained rapid adoption among enterprise backend developers transitioning from Java (Spring Boot) and C# (.NET). When LLMs were trained on GitHub, billions of tokens originated from enterprise Java repositories.

As a result, developers and AI agents frequently infect TypeScript codebases with **Java Enterprise OOP Contamination**.

### Java Dogma vs. Modern TypeScript Reality

| Concept | The Java / Spring Boot Constraint | The Modern TypeScript (2026) Reality |
| :--- | :--- | :--- |
| **Top-Level Code** | Everything MUST be wrapped in a `class`. Top-level functions are forbidden by the compiler. | ES Modules (`.ts` files) are first-class namespaces. Functions are first-class citizens. |
| **Singletons** | Requires `@Component`, `@Service`, or a Factory class to instantiate a singleton. | A `.ts` file evaluated once IS ALREADY a module singleton! Zero factory classes required. |
| **Interfaces** | Every class must implement an interface (`IUserService` $\rightarrow$ `UserServiceImpl`) for DI mockability. | Structural typing duck-types automatically. Creating an interface with only 1 implementation is useless ceremony. |
| **State & Methods** | State and behavior must be combined into mutable classes (`this.user = ...`). | State belongs in reactive stores (`useSyncExternalStore`); behavior belongs in pure functions. |
| **Pass-Throughs** | Multi-tier ceremony: Controller $\rightarrow$ Service $\rightarrow$ Manager $\rightarrow$ Repository. | Pure composition: Hook $\rightarrow$ Store or Domain Function $\rightarrow$ Port / Adapter. |

### The 4 Sins of Java Contamination (Empirical Repository Evidence)

Our automated audit (`scripts/audit-java-contamination.mjs`) scanned `packages/core/src/logic/managers/` and discovered **30 out of 32 files (94%) have ZERO application callers**:

#### Sin 1: The Useless Pass-Through Wrapper (`AuditManager.ts`, `TeacherManager.ts`)
```typescript
// ❌ JAVA CONTAMINATION (Actual code from packages/core/src/logic/managers/AuditManager.ts):
// 30 lines of pure boilerplate that does NOTHING except forward to this.repo!
export class AuditManager {
  constructor(private repo: IAuditRepository) {}

  async log(entry: AuditLogEntry): Promise<void> {
    return this.repo.log(entry); // 100% USELESS PASS-THROUGH!
  }

  async getLogs(params: { entityType: string }): Promise<any[]> {
    return this.repo.getLogs(params); // 100% USELESS PASS-THROUGH!
  }
}

// ✅ MODERN FUNCTIONAL TYPESCRIPT:
// In modern TS, you don't create a 30-line class to wrap a 2-method repository.
// You either call the repository directly via its Port, or compose a pure domain function:
export const recordAuditLog = (repo: IAuditRepository) => (entry: AuditLogEntry) => 
  repo.log(entry);
```

#### Sin 2: The Deadweight Factory (`auth.factory.ts`, `community.factory.ts`, `growth.factory.ts`)
```typescript
// ❌ JAVA CONTAMINATION (Actual code from packages/core/src/logic/managers/community.factory.ts):
import { SupabaseCommunityRepository } from '@repo/core/adapters/supabase/communityRepository';
import { CommunityManager } from '@repo/core/logic/managers/CommunityManager';
import { growth } from '@repo/core/logic/managers/growth.factory';

// Manual Spring-Boot style DI factory wiring:
export const community = new CommunityManager(new SupabaseCommunityRepository(), growth);

// The Reality: `community.factory.ts` has ZERO application callers in mobile or web!
// Why? Because UI screens use Zustand's `useCommunityStore` and oRPC queries instead!
```

#### Sin 3: The State-Hoarding Non-Reactive Manager (`AuthManager.ts` - 611 LOC)
`AuthManager.ts` attempted to manage user session, tokens, device trust, and password reset within an OOP class instance:
- Because it is a plain class, **it does not notify React when its properties change**.
- React components cannot re-render when `authManager.user` is updated.
- To use it, developers would have to attach manual event listeners or force-update React trees.
- Consequently, mobile engineers completely bypassed it and built `useAuthStore.ts` (Zustand), leaving `AuthManager.ts` as a 611-line deadweight zombie.

#### Sin 4: Interface Proliferation for Singletons
Declaring `interface IAuditManager` or `interface ICrypto` when there is only ever one concrete implementation across the entire monorepo history.

#### Sin 5: The "Repository" Fallacy & The Spring Boot Triad Unmasked
The most insidious Java enterprise pattern in `@repo/core` was copying the entire **Spring Boot 4-Tier Enterprise Architecture**:
```
  Spring Boot / Java Enterprise Stack:
  @Controller ──► @Service (Manager) ──► @Repository ──► @Entity
  
  What was copy-pasted into @repo/core:
  React Component ──► ProfileManager ──► ProfileRepository ──► ProfileEntity
```

**Why "Repository" is Java/Hibernate JPA Baggage**:
- **Etymology**: Latin *repositorium* ("a place where things are stored or put back", from *reponere*).
- **Origin**: Martin Fowler (2002 PoEAA) and Eric Evans (2003 DDD). Popularized worldwide by **Spring Data JPA** (`@Repository public interface UserRepository extends JpaRepository<User, UUID>`).
- **Why Java Needed It**: Hibernate and JPA map relational SQL tables into stateful, in-memory Java objects. Java architects invented the "Repository" to **pretend that the SQL database is an in-memory Java `Collection<User>`** with methods like `.add(user)` and `.remove(user)`.
- **Why It is Contamination in TypeScript & React**:
  1. In modern TypeScript, we do NOT pretend SQL is an in-memory array. We have typed query engines (Drizzle, Kysely, Supabase, oRPC).
  2. In React, data fetching is **declarative server-state synchronization** via **TanStack Query / PowerSync** (`useQuery`, `useLiveQuery`), not imperative repository calls.
  3. In Clean / Hexagonal Architecture, I/O boundaries are called **Adapters** (`supabaseProfileAdapter.ts`) implementing **Ports** (`profile.port.ts`). Calling external I/O a "Repository" in a frontend/BFF TypeScript stack is pure enterprise Java cargo-culting.

---

## 9. State Mechanics Deep Dive: React 18 vs. React 19.3

### The Quad: Providers vs. Stores vs. Context vs. Managers

| Mechanism | Primary Purpose | Reactive Engine | Re-Render Blast Radius | Access Outside React (Interceptors, Sagas) |
| :--- | :--- | :--- | :--- | :--- |
| **Context** | JSX Tree Scope & Dependency Injection | React Context API | **Cascading** (entire subtree re-renders unless memoized) | ❌ **FORBIDDEN** (Throws `useContext` outside React component render) |
| **Provider** | Infrastructure / Scope Mounting Boundary | JSX Element Hierarchy | **Tree Boundary** (Establishes CSS variables, DI root, or error catchers) | ❌ **FORBIDDEN** (Lives inside JSX tree only) |
| **Store (Zustand)** | Global Mutable Client Application State | `useSyncExternalStore` | **Surgical** (Only components whose selected property changes re-render) | ✅ **NATIVE** (`store.getState()` and `store.setState()` synchronous anywhere) |
| **Manager (Legacy)** | Imperative Class combining State + I/O | None (Manual Events / Poll) | **Zero Reactivity** (Fails to notify React without manual event hacks) | ✅ Native JS, but decoupled from UI |

### React 18 vs. React 19.3: Why the Architecture Shifted

#### In React 18:
- Developers routinely used `React.createContext()` for global mutable state (Auth, Theme, Cart, User Settings).
- This resulted in **"Provider Hell"**:
  ```tsx
  // ❌ REACT 18 ERA: The Provider Pyramid of Doom
  <AuthProvider>
    <UserProvider>
      <ThemeProvider>
        <CartProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </CartProvider>
      </ThemeProvider>
    </UserProvider>
  </AuthProvider>
  ```
- **The Performance Disaster**: Whenever `AuthProvider` updated a session timestamp, **every component in the entire tree re-rendered**, causing frame drops on low-end mobile devices and requiring brittle manual `useMemo` and `useCallback` annotations.

#### In React 19.3:
React 19.3 and the React Compiler fundamentally clarify the boundaries:

1. **Context is Strictly for Environmental Scope, NOT State**:
   - Use Context / Providers ONLY for values that **do not change frequently** and configure a component subtree's environment:
     - `<WorldScope value="sanctuary">`: Configures CSS variables and theme token inheritance.
     - `<QueryClientProvider client={queryClient}>`: Injects the TanStack Query client instance into the tree.
     - `<GestureHandlerRootView>`: Wires native gesture touch events.
     - `<AuthQueryCacheBoundary>`: Lifecycle boundaries for resetting caches on user change.
2. **External Stores (Zustand / `useSyncExternalStore`) Own Global State**:
   - Zero `<Provider>` wrapping in the root layout!
   - Surgical subscriptions:
     ```tsx
     // ✅ REACT 19.3: Fine-Grained Atomic Subscription
     // This component ONLY re-renders when user.displayName changes.
     // If user.token or user.lastActiveAt changes, ZERO re-renders occur!
     export function UserBadge() {
       const displayName = useAuthStore((s) => s.user?.displayName);
       return <span>{displayName}</span>;
     }
     ```
3. **Synchronous Universal Read/Write (Zero React Hooks Dependency)**:
   - Modern architectures require reading authentication state inside oRPC interceptors, PowerSync sync rules, web workers, and background fetch tasks.
   - You cannot call `useContext(AuthContext)` inside an oRPC middleware.
   - With Zustand, you simply call:
     ```typescript
     // ✅ Works seamlessly inside pure TypeScript, network interceptors, or workers:
     const token = useAuthStore.getState().session?.accessToken;
     ```

---

## 10. The Strangler Fig Refactoring Playbook

How do senior developers safely eliminate 30 zombie managers and factories without causing a "Big Bang" outage?

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE STRANGLER FIG REFACTORING LIFECYCLE              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Step 1: Empirical Callers Audit]   node scripts/audit-java-contamination.mjs
│                   │                                                    │
│                   ▼                                                    │
│  [Step 2: Crown the SSOT Facade]     Ensure useAuthStore has 100% test │
│                                      coverage & contracts              │
│                   │                                                    │
│                   ▼                                                    │
│  [Step 3: Reroute Lingering Callers] Reroute core tests/factories to   │
│                                      useAuthStore.getState()           │
│                   │                                                    │
│                   ▼                                                    │
│  [Step 4: The In-Degree Zero Gate]   Verify In-Degree reaches 0        │
│                   │                                                    │
│                   ▼                                                    │
│  [Step 5: Deletion Veto Presentation] Present exact diff & retire files │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Step 1: Run the Empirical In-Degree Sentinel**:
   Never guess. Run `scripts/audit-java-contamination.mjs` to measure exact caller fan-in across apps and core.
2. **Step 2: Fortify the Production Facade**:
   Confirm that the reactive store (`useAuthStore`) or the real Port/Adapter already supports all operations currently wrapped by the Manager.
3. **Step 3: Reroute Inward Dependencies**:
   If an internal utility imports `auth.factory`, replace it with `useAuthStore.getState()` or inject the underlying Port.
4. **Step 4: Verify Zero Callers**:
   Once caller count is 0, the file is fully strangled.
5. **Step 5: Execute Clean Liquidation under Deletion Veto**:
   Present the zero-caller proof to the user and remove the deadweight file.

---

## 11. Summary Checksheet for New Files

Before creating any file in this repository, answer these 5 questions:

1. **Which Archetype is this file?** (Schema, Type, Port, Entity, Service, Adapter, Repository, Store, Slice, Hook, Flow, Component, or Specialized Subsystem).
2. **What is its Tier?** (Tier 0 to Tier 6).
3. **Does it only import from equal or lower tiers?** (Zero upward dependencies; no store importing adapters).
4. **Is it free from Java OOP Contamination?** (Zero useless pass-through `*Manager` classes, zero manual `*.factory.ts` singletons).
5. **Does it follow React 19.3 State Mechanics?** (Global mutable state in Zustand stores; Providers strictly for environmental DI boundaries).

---

## 12. The Rosetta Stone: Java Enterprise OOP vs. Modern React & TypeScript

In enterprise Java (Spring Boot), developers reflexively use Java Enterprise vocabulary (`*Manager`, `*Repository`, `*ServiceImpl`, `*Factory`, `*Entity`). In modern **React 19.3 & React Native 0.88**, these concepts map to clean, specialized architectural primitives:

| ❌ Java Enterprise Slop | What It Actually Does | ✅ Modern TypeScript / React Idiom | Canonical Name & Suffix | Real Monorepo Example |
| :--- | :--- | :--- | :--- | :--- |
| **`*Manager` (State)** | Holds reactive client-side state for UI rendering | **Zustand Client Store** (atomic selectors) | `use*Store.ts` or `*Slice.ts` | [`useAuthStore.ts`](file:///c:/x/packages/core/src/store/useAuthStore.ts) |
| **`*Manager` (Action)** | Connects UI components to actions and validation | **Custom React Hook** (UI Facade) | `use*.ts` | [`useSanctuaryFeature.ts`](file:///c:/x/packages/core/src/logic/permissions/hooks/useSanctuaryFeature.ts) |
| **`*Repository`** | Fetches, caches, and persists data across I/O boundaries | **Hexagonal Adapter** (I/O) or **TanStack Query** | `*Adapter.ts` / `useQuery` | [`supabaseProfileAdapter.ts`](file:///c:/x/packages/core/src/adapters/supabase/profileRepository.ts) |
| **`*Service` / `*ServiceImpl`** | Stateless business operations or rules | **Pure Domain Functions** or **Policies** | `*Logic.ts` / `*Policy.ts` | [`authCallbackPolicy.ts`](file:///c:/x/packages/core/src/logic/auth/authCallbackPolicy.ts) |
| **`*Factory`** | Instantiates a class with injected dependencies | **Native ES Module Export** (Module Singleton) | `*.ts` (module export) | `export const authAdapter = ...` |
| **`*Entity`** | Defines database schema and model shapes | **Zod Schema & Inferred Type** | `*Schema.ts` / `type *` | [`identity.schema.ts`](file:///c:/x/packages/core/src/logic/schemas/identity.schema.ts) |
| **`*DTO`** | Data Transfer Object for network requests | **Zod Contract Schema** (`z.infer<typeof X>`) | `*Contract.ts` | `entitlement.schema.ts` |
| **`*Helper` / `*Utils`** | Random assortment of stateless functions | **Explicit Pure Functions** (named by domain) | `formatDate`, `parseJwt` | `temporalUtils.ts` |

### The Golden Rule: The 3-Way Separation
Whenever tempted to write a `class FooManager` or `class FooRepository`:
1. If it's **State that the UI renders**: Make a Zustand store (`useFooStore.ts`).
2. If it's **Network, database, or hardware I/O**: Make an async adapter (`fooAdapter.ts`) implementing a port (`foo.port.ts`).
3. If it's **Component convenience**: Wrap both into a custom hook (`useFoo.ts`).
*Zero classes. Zero memory-hoarding singletons. Zero cascading re-renders.*
