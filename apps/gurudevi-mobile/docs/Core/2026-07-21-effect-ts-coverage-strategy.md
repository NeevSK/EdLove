---
title: "Effect-TS Coverage & Adoption Strategy"
status: "active"
created: 2026-07-21
updated: 2026-07-21
author: "Naveen"
scribe: "Antigravity"
tags: [effect-ts, architecture, strategy, v4-migration]
---

# Effect-TS Coverage & Adoption Strategy

## 0. Executive Summary: ADOPT NOW

**Decision reversed from Jun 25 "Do not adopt now".** The original 80% claim was measured wrong — `SovereignError` covers error **envelope** (presentation, sanitization, agent metadata) which is the least valuable 80%. Effect covers error **flow** (type safety, exhaustiveness, structured concurrency, composable retry) which is the most valuable 20%. They are **complementary**, not substitutes.

| System | What it handles | Layer |
|---|---|---|
| **Effect-TS** | Error **flow**: type-safe channels, exhaustive handling, fiber concurrency, composable retry, compile-time DI | Inside domain logic, before errors escape |
| **SovereignError** | Error **envelope**: RFC 9457 structure, tiered visibility, auto-sanitization, agent-facing metadata | At the boundary, before errors leave the system boundary |
| **Integration** | `Effect<A, SovereignError, R>` with `Data.TaggedError('...')` at domain level, `SovereignError` at HTTP/UI boundary | Domain → SovereignError at boundary |

**Version decision: v3.22.0 now, v4 when stable.** v4 beta still has an open React Native compatibility issue (#6252, unresolved). v3 is officially recommended for production. The bundle size advantage of v4 (~20KB vs ~50KB) is moot since Effect lives in `@repo/core` (Node context), not directly in the mobile bundle.

---

## 1. Investigation: Why Effect Was Left Stagnant

### Timeline

| Date | Event |
|---|---|
| ~Apr 30 | `attendance.effect.ts` + `useSovereignEffect.ts` created as POC spike |
| Jun 25 | **Tools Adoption Matrix** formalized: "Do not adopt now. `SovereignError` covers 80% of the benefit." |
| Jul 21 | Present investigation — files never wired, dead code accumulated |

### Root cause: Misapplied Pareto

The June decision measured the wrong dimensions:

| Dimension | SovereignError | Effect-TS | True weight | June verdict |
|---|---|---|---|---|
| Error presentation | ✅ Tiered, sanitized, agent-ready | ❌ Doesn't do this | 20% | **Overvalued** |
| Error type safety | ❌ `unknown` at every boundary | ✅ Tracked in signatures | 30% | **Ignored** |
| Exhaustiveness checking | ❌ Runtime discovery | ✅ Compiler-enforced | 20% | **Ignored** |
| Structured concurrency | ❌ `void promise.catch(console.warn)` | ✅ Fiber supervision tree | 15% | **Ignored** |
| Composable retry/timeout | ❌ Hand-rolled per site | ✅ Schedule as a value | 10% | **Ignored** |
| Compile-time DI | ❌ `undefined` at runtime | ✅ Layer catches missing deps | 5% | **Ignored** |

The codebase endures real pain daily from the gaps Effect fills:
- `catch (error: unknown)` in 35+ API modules with zero type safety
- `void promise.catch(console.warn)` patterns that silently swallow failures
- Hand-rolled retry loops with inconsistent backoff
- Runtime `undefined` errors from missing dependencies
- No compiler-enforced error handling when new error types are added

### Current state (after Jul 21 sprint)

| Dimension | Status |
|---|---|
| `effect` version | `^3.22.0` (latest v3) |
| `@effect/platform` | Removed — was unused |
| `.effect.ts` files | None — merged into `attendance.ts` (strategy: in-place, no parallel files) |
| React hooks | `useSovereignEffect` fixed — accepts `Effect<A, E, never>`, uses `Runtime.defaultRuntime` (no `R` cast) |
| Effect usage in API | `attendance.ts` — 4 methods rewritten with Effect internally (retry, timeout, typed errors, Promise boundary) |
| Consumers using Effect | None yet — `attendanceAPI` still returns Promise (backward compatible); `attendanceAPI$` exports Effect versions |
| v4 beta references | None |
| Effect Schema usage | None (all validation via Zod v4) |
| Layer/DI usage | None |
| Stream usage | None |

---

## 2. How Effect + SovereignError Fit Together

### Data flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER (Effect-TS)                      │
│                                                                      │
│  Effect.gen(function* () {                                          │
│    // Type-safe error channel — compiler tracks every error type     │
│    const data = yield* Effect.tryPromise({                          │
│      try: () => api.fetch(),                                        │
│      catch: (e) => new DomainError({ cause: e }),                   │
│    });                                                               │
│                                                                      │
│    // Fiber-based fire-and-forget — never silent failure             │
│    yield* Effect.forkDaemon(logAudit({ ... }));                      │
│                                                                      │
│    // Composable retry — Schedule as a value                         │
│    const result = yield* fetchWithRetry().pipe(                      │
│      Effect.retry(Schedule.exponential('1s').pipe(                  │
│        Schedule.intersect(Schedule.recurs(3)),                      │
│      )),                                                              │
│    );                                                                 │
│                                                                      │
│    return result;                                                    │
│  })                                                                  │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ Errors are known types here
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BOUNDARY (SovereignError)                        │
│                                                                      │
│  normalizeError(e) → SovereignError {                               │
│    tier: 'USER' | 'DEV' | 'AGENT' | 'SYSTEM',                       │
│    userMessage: 'Something went wrong',                              │
│    agentAction: { suggestedAction: 'RETRY' },                        │
│    // devDetails auto-sanitized in production                        │
│  }                                                                    │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ Errors are safe, tiered envelopes here
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                UI / HTTP LAYER (Existing patterns)                 │
│                                                                      │
│  • useSafeAction → toast / error boundary                            │
│  • Hono app.onError → JSON ProblemDetails response                   │
│  • TanStack Query → retry + error state                              │
└──────────────────────────────────────────────────────────────────┘
```

### Rule

Effect catches errors **before** they leave the domain layer. SovereignError wraps them **at the boundary** for safe presentation. Both are needed — one without the other leaves either unsafety or untidy boundaries.

---

## 3. Adoption Tiers

### Tier 0: NOW — Immediate cleanup (this sprint ✅ DONE)

| Action | Status | Notes |
|---|---|---|
| **In-place rewrite of `attendance.ts`** with Effect internally | ✅ Done | `attendance.effect.ts` deleted — patterns absorbed into `attendance.ts` |
| **Fix `useSovereignEffect` hook** | ✅ Done | Simplified to `R = never` constraint — caller provides all deps via `Effect.provide` before passing to hook |
| **Remove unused `@effect/platform` dep** | ✅ Done | Removed from both `packages/core` and `gurudevi-mobile` |
| **Bump effect to latest v3** | ✅ Done | `^3.21.3` → `^3.22.0` |
| **Retry + timeout via Effect** | ✅ Done | `Schedule.exponential(200ms).pipe(Schedule.recurs(3))` + 15s timeout for all 4 methods |
| **Expose `attendanceAPI$`** | ✅ Done | Effect versions for consumers who want to compose |
| **Write comparison demo** | ✅ Done | `scripts/effect-vs-async-demo.ts` — run `pnpm dlx tsx scripts/effect-vs-async-demo.ts` |

### Tier 1: SOON — High-value domain targets (weeks 2-8)

| Domain | Why Effect | Specific files |
|---|---|---|
| **Audit logging** (fire-and-forget) | `forkDaemon` prevents silent failures; current pattern is `void promise.catch(console.warn)` | All write operations |
| **Attendance domain** | Already exists as POC, just needs wiring + SovereignError boundary | `attendance.effect.ts` → barrel |
| **External API integrations** (Stripe, OCR, edge functions) | `Schedule.exponential` + `retry` for transient failures; typed errors for each failure mode | `packages/payments/`, edge function callers |
| **Supabase queries with error surfaces** | `tryPromise` + typed errors instead of raw `.catch()` | `packages/core/src/api/supabase.ts` |
| **Auth operations** | Complex error surface (network, token expiry, RLS denial) + retry needs | `packages/core/src/api/auth.ts` |

### Tier 2: LATER — Systematic expansion (months 2-6)

| Area | Why | Prerequisite |
|---|---|---|
| **Backend API routes** (`sanctuary-api`) | Effect HTTP router + Schema for typed request/response contracts | v4 stable (v3 `@effect/platform` HTTP ergonomics are immature) |
| **AI agent orchestration** (`packages/ai`) | Structured concurrency for parallel LLM calls, retry for API failures | v4 stable with `@effect/ai-*` |
| **Data streaming** | `Stream` for backpressured real-time data (attendance pulse, sync events) | Concrete need, not speculative |

### Tier 3: NEVER

| Area | Why |
|---|---|
| **Leaf UI components** | No async, no complex errors — zero benefit |
| **Simple screens** (single fetch) | TanStack Query + Zustand is sufficient |
| **Zustand stores** | Replacing with Effect Ref/Atom breaks existing patterns for no architectural gain |
| **Simple CRUD forms** | try/catch + form state is fine |
| **Public library APIs** | Effect is viral — expose Promise at boundary, keep Effect internal |
| **Tailwind/NativeWind styling** | Not applicable |

---

## 4. v3 vs v4 Decision

**Decision: Use v3.21.3 now, plan v4 migration when stable.**

| Factor | v3.21.3 (current) | v4 beta.99 | Verdict |
|---|---|---|---|
| Production readiness | ✅ Stable, recommended by maintainers | ❌ Beta — APIs change between releases | v3 wins |
| RN/Hermes compatibility | ✅ No known issues | ⚠️ Issue #6252 still open (FetchHttpClient + Hermes crash) | v3 wins |
| Bundle size | ~50KB | ~20KB | v4 wins, but moot for `@repo/core` (Node context) |
| Metro bundler compatibility | ✅ Stable | ⚠️ Had metro issues, fixed in March (PR #1863) | v3 wins |
| Generator transpilation | ✅ `Effect.gen` works | ⚠️ Had Hermes generator issue, fixed in June (PR #6254) | v3 wins |
| API surface | Stable | Unified, cleaner, but unfamiliar | v3 wins for now |
| @effect/ai packages | ❌ Not available | ✅ Available in v4 beta | v4 wins for AI features |
| Durable workflows | ❌ Not available | ✅ `@effect/workflow` alpha | v4 wins for long-term |

**Migration to v4 is planned when v4.0.0 stable is released** (estimated Q4 2026-Q1 2027). Given current usage (2 files), migration effort is ~2 days. The coding guide has the full v3→v4 rename map ready.

### v4 Blockers to track

- Issue [#6252](https://github.com/effect-ts/effect/issues/6252): "Can't use Effect with React Native" — FetchHttpClient + Atom + Hermes crash
- v4.0.0 stable release (currently beta.99, Jul 17 2026)
- effect-smol repo archived, main branch now v4 — v3 lives on `v3` branch

---

## 5. Effect vs TanStack Query + TanStack Pacer

These three tools are **complementary at different layers**, not competing:

```
React Component
  └─ useQuery / useMutation         ← TanStack Query
       │                                "When to fetch, what to show while loading"
       │                                Caching, refetch, stale-while-revalidate
       │                                UI state: loading spinners, error banners
       │
       └─ queryFn calls API
            └─ Effect.runPromise()   ← Effect-TS
                 │                       "How to fetch, error recovery, composition"
                 │                       Typed errors, retry, timeout, fire-and-forget
                 │                       Fiber supervision, structured concurrency
                 │                       Invisible to UI — returns Promise
                 │
                 └─ domain logic / HTTP / Supabase
```

| Concern | Who owns it | Example |
|---|---|---|
| **When to fetch** | TanStack Query | `staleTime: 30s`, `refetchOnFocus`, `enabled: !!id` |
| **What to show while loading** | TanStack Query | `isPending`, `isError`, `error` (from SovereignError) |
| **Rate-limit button clicks** | TanStack Pacer | `throttle(submit, 1000)`, `debounce(search, 300)` |
| **Retry transient network failures** | Effect | `Effect.retry(Schedule.exponential(...))` |
| **Typed error handling** | Effect | `catchTag('NetworkError', handler)` — compiler-enforced |
| **Fire-and-forget audit logging** | Effect | `forkDaemon` — fiber dies silently, won't crash main flow |
| **Timeout / cancellation** | Effect | `Effect.timeout('10s')` — no manual AbortController |
| **Structured concurrency** | Effect | `Effect.all([...], { concurrency: 3 })` — no Promise.all footguns |
| **Dependency injection for testing** | Effect | `Layer.provide(TestLayer)` — no mocking framework needed |

### How they compose

```typescript
// TanStack Query calls Effect — not the other way around
function useAttendance(classroomId: string) {
  return useQuery({
    queryKey: ['attendance', classroomId],
    queryFn: () => Effect.runPromise(
      attendanceAPI$.fetchClassroomAttendance(classroomId).pipe(
        Effect.retry(Schedule.exponential(Duration.seconds(1)).pipe(
          Schedule.intersect(Schedule.recurs(2)),
        )),
      ),
    ),
    staleTime: 30_000,
  });
  // UI sees: { data, isPending, error } — never imports Effect
}
```

```typescript
// TanStack Pacer handles UI-level frequency — different concern
const { throttle } = useThrottle();
const submit = throttle(() => mutation.mutate(form), 1000);
```

### Rule of thumb

- **TanStack Query** owns the UI lifecycle (loading, caching, refetching)
- **Effect** owns the operation lifecycle (retry, timeout, error typing, concurrency, DI)
- **TanStack Pacer** owns the event frequency (throttle, debounce at the UI layer)
- Effect stays **behind** the `queryFn` boundary — the UI never imports `effect`

---

## 6. Decision Tree (Updated)

```
Is it a React component?
├── YES → Does it orchestrate complex operations (multi-step, AI agent)?
│   ├── YES → useSovereignEffect with Effect<A, E, never>
│   └── NO  → Does it fetch server data?
│       ├── YES → TanStack Query (queryFn calls Effect internally)
│       └── NO  → Zustand / local state
│
└── NO  → Is it domain logic in @repo/core (or similar)?
    ├── YES → Does it have 2+ async operations, complex error surface,
    │         retry needs, or testability requirements?
    │   ├── YES → Effect internally, Promise/SovereignError at boundary
    │   └── NO  → Keep simple — async/await is fine
    │
    └── NO  → Is it a UI boundary (HTTP route handler)?
        ├── YES → SovereignError for error envelope
        └── NO  → Consider case-by-case

UI event frequency (throttle/debounce)?
├── YES → TanStack Pacer
└── NO  → Not needed
```

---

## 7. Summary

| Tier | Timeline | Key Actions |
|---|---|---|
| NOW ✅ | This sprint | In-place rewrite of `attendance.ts` with Effect (retry, timeout, typed errors); fixed `useSovereignEffect` hook; removed dead `@effect/platform` dep; bumped to v3.22.0 |
| SOON | 2-8 weeks | Expand to audit logging, external API integrations, auth operations |
| LATER | 2-6 months | v4 stable → migrate, consider HTTP routing + AI orchestration with `@effect/ai` |
| NEVER | — | Leaf UI, simple CRUD, Zustand stores, public API surfaces |

Effect and SovereignError are a **powerful complementary pair**. Effect gives type-safe error flow with structured concurrency; SovereignError gives tiered, sanitized, agent-ready error envelopes at the boundary. Neither replaces the other. TanStack Query and TanStack Pacer operate at different layers (UI lifecycle and event frequency) and compose with Effect cleanly — Effect stays behind the `queryFn` boundary, invisible to the UI.
