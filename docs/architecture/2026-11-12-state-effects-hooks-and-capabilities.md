---
title: "State, Effects and Hooks: Deterministic Rules and the Capability Map"
status: "active"
created: 2026-11-12
author: "Neev"
scribe: "Claude"
tags: [architecture, state, zustand, tanstack-query, xstate, effect, react-19, useEffect, useReducer, capabilities]
---

# State, Effects and Hooks

This document answers two questions with evidence from the repository on 2026-11-12:

1. **Where does each piece of state, effect and hook belong?** The answer is a decision procedure
   that two people, or two agents, applying it to the same code would agree on.
2. **What does each library offer, what do we use, and what should we use?** This is checked in
   both directions: capabilities we're missing, and things we hand-built that the library already
   provides. In some cases our version is the right one.

It refines [the client state decision (2026-10-23)](2026-10-23-client-state-architecture-decision.md),
which still stands, and sits beside [the architecture mental model](2026-11-12-architecture-mental-model.md).

## 1. Who owns which state

| The state is… | Owner | Rule |
| --- | --- | --- |
| Data from a server or the local database | **TanStack Query** (server) / **PowerSync live query** (local SQLite) | Define it once with `queryOptions()` in `store/queries/*` or next to its oRPC procedure. Account-scoped keys |
| Small client state shared beyond one component (preferences, view controls, session scope) | **Zustand** | Atomic selectors; persisted stores declare `name` and `version` |
| A multi-step protocol that must survive interruption | **XState** | Only if it passes the admission test (`assessProtocolAdmission`, all five criteria) |
| One component's interaction state (form fields, open/closed, a PIN being typed) | **`useState` / `useReducer`** | Not persisted. `useReducer` when several fields change together |
| A sequence of I/O steps run once (switch account, activate guest) | **Coordinator** (`*.coordinator.ts`) | Plain async; I/O through `effect/bindings/*` |
| An I/O program with retries, typed errors, cancellation | **Effect** (the library) | In ports, adapters and coordinators, run with `callPort` / `runToPromise`, never inside `useEffect` |

### `useReducer` or XState?

`useReducer` is a state machine without the safety: any action is allowed from any state, and it
lives only as long as the component. That is fine, and simpler, for one screen's interaction
state. It is wrong when the flow is **persisted, resumable or multi-step across screens**. Then
the reducer gets loading and saving code bolted onto it in effects, which is a hand-made, weaker
XState.

The repository has 16 `useReducer` calls. Most are what reducers are for: `ToastProvider`,
`AccountPinModal`, `VideoPlayer`, `GlobalHeader`. One is the anti-pattern:
**`hooks/useSchoolCreation.ts`** is a persisted, multi-step wizard built from a reducer plus
storage reads and writes in `useEffect`, while
**`packages/classroom/src/machines/schoolProvisioningMachine.ts`** models the same kind of flow
in XState. Neither has a consumer outside its package barrel and its own test, so this is two
parallel, unwired implementations. Decide which one lives before wiring either; until then,
neither is extended. The same check applies to `useClassroomCreation` and `useGroupCreation`.

## 2. Effects: the deterministic rule

`useEffect` synchronizes a component with **something outside React**: a subscription, a timer,
the DOM or a native view, a non-React SDK. If no external system is involved, it is the wrong
tool. Go down this list and stop at the first match:

| # | The effect… | Replace it with | Lint rule that catches it |
| --- | --- | --- | --- |
| 1 | Fetches or awaits a call, then sets state | `useQuery(queryOptions)` / live query / `useActionState` for a submit | `react-hooks/set-state-in-effect`; `check:native-slop` (to be widened from `fetch(` to any awaited call) |
| 2 | Sets state computed from props or state | Compute during render (the React Compiler memoizes) | `react-hooks/no-deriving-state-in-effects`, `set-state-in-effect` |
| 3 | Resets state when an id changes | `key={id}` on the component | `set-state-in-effect` |
| 4 | Runs because the user did something | Do it in the event handler | (review) |
| 5 | Notifies a parent or logs analytics with current values | `useEffectEvent` inside the effect | `exhaustive-deps` stops complaining once `useEffectEvent` is used |
| 6 | Reads a store or an external source | A Zustand selector or `useSyncExternalStore` | (review) |
| 7 | Subscribes, sets a timer, or touches the DOM or a native view | **Keep it**, with a cleanup that undoes it | `react-hooks/refs`, `immutability`; missing cleanup is a review item |

What the code does today (537 effects, classified by parsing each body; a heuristic):

| Pattern | Count | Rule # |
| --- | --- | --- |
| Fetch, then set state | 105 | 1 |
| Derived set state | 65 | 2–3 |
| Subscription with cleanup | 73 | 7 (keep) |
| Timer with cleanup | 53 | 7 (keep) |
| DOM/ref, animation start, analytics | 102 | mostly 7; analytics is 5 |
| **Timer or subscription without cleanup** | **10** | 7 (probable leaks: `ToastProvider`, `CommandPalette`, `OnboardingForm`, `InteractiveChat`, `ScannerModal.web`) |
| Other | 124 | review |

The React team's own checks for this are **installed but switched off**: `eslint-plugin-react-hooks`
7.1.1 ships `set-state-in-effect`, `no-deriving-state-in-effects`, `purity`, `refs`,
`immutability` and `set-state-in-render`, but `packages/eslint-config` enables only
`rules-of-hooks` and `exhaustive-deps`. Running them in report mode: gurudevi-web 59
set-state-in-effect, ui 19, self 21. There are also **9 `rules-of-hooks` violations**
(web 8, ui 1). Those are real bugs, and they persist because the pre-push lint is bypassed.

**Policy:** turn the compiler rules on as a ratchet. They are errors for new code. A stored count
per package may only go down, like `tooling/ui-legacy-ratchet.json`. A rule is never suppressed.

## 3. Hooks: what a hook may be

A hook is the screen's interface to state and logic. It should be thin:

- **Read:** Zustand selectors, `useQuery(queryOptions)`, live queries, `useSyncExternalStore`.
- **Act:** call a coordinator, a mutation (`useMutation` / `useActionState`), or a store action.
- **Effects:** only rule 7 above.
- **Never:** call an adapter directly (use a binding), parse untrusted data, or hand-roll
  loading, error or retry state that a query or mutation already provides.

A hook longer than about 100 lines, or holding several effects, usually hides a coordinator or a
query definition; move that out.

## 4. Capability map: upstream, our use, what to do

Installed versions are read from each package's `package.json`. The usage counts come from
searching source files, excluding tests and docs.

| Library (installed) | Capability | Used | Direction | Action |
| --- | --- | --- | --- | --- |
| **React 19.3.1** | React Compiler (Next and Expo configs) | on | ✓ | Turn on its lint rules (§2) |
| | `useEffectEvent` (19.2) | 1 | we're missing it | Use for rule 5 |
| | `useActionState` (19.0) | **0** | we're missing it | Forms and submits instead of hand-rolled loading/error state |
| | `useOptimistic` | 4 | ✓ | — |
| | `use()` + `<Suspense>` | 15 / 4 | partial | With `useSuspenseQuery`, where a screen can suspend |
| | `<Activity>` (19.2) | 8 | ✓ | Tabs and floors that keep state |
| | `<ViewTransition>`, Fragment refs (19.3) | 0 | optional | Web only; not React Native |
| **TanStack Query 5.107** | `useQuery` / `useMutation` | 42 / 18 | ✓ | The home for the 105 fetch-in-effect cases |
| | `queryOptions()` | 19 | ✓ | Every shared query definition |
| | `mutationOptions()` | **0** | we're missing it | Shared mutation definitions next to `queryOptions` |
| | `useSuspenseQuery` | 0 | optional | With `<Suspense>` boundaries |
| | Query persistence (`persistQueryClient` / per-query persister) | 0 | **we hand-built it** | `useQuerySnapshotHydration` and the entitlement/growth snapshots add account isolation and decoding in the adapter, which the generic persister doesn't do. Keep ours, but make it one helper rather than one per query |
| **oRPC 2.0 beta.50** | TanStack utils (`.queryOptions` on procedures) | 16 | ✓ | Prefer it over hand-written keys for API reads |
| **Zustand 5.1.0** (latest) | Atomic selectors, `persist` + `version`/`migrate`/`partialize` | all stores | ✓ (fixed 2026-11-12) | Async `migrate` is available in 5.1 when a shape changes |
| | `subscribeWithSelector`, `devtools`, `unstable_ssrSafe` | 0 | not needed yet | One store subscription exists and is correct |
| **XState 6.0.0-beta.2** | `setup({...})` | 5 of 19 machines | **behind** | 14 machines use plain `createMachine`; v6 marks its second `options` argument deprecated in favour of `setup()` or `machine.provide()`. Migrate when touched (ratchet "Machines without setup()") |
| | Persistence: `restoreActor`, `validatePersistedSnapshot`, `machineVersions` | 4 / 0 / 0 | **we hand-built it** | `adapters/storage/journeySnapshot.adapter.ts` writes its own version envelope. v6 ships validation and versioned migration; adopt it for the role journey and the admin setup machine |
| | `fromPromise` / `fromCallback` actors | 0 | ✓ (n/a) | Effects run through `@xstate/effect` |
| **Effect 4.1.4** | `Effect.gen`, `Layer`, `Schedule` | 22 / 4 / 8 | ✓ | Ports and adapters |
| | `Stream` | 0 | not needed yet | — |
| | `Effect.run*` outside the runtime | 46 (ratchet 43) | **too many** | Run only through `callPort` / `runToPromise` |
| **Zod 4.6.7** | `parse` / `safeParse` | 488 | ✓ | At the boundary only (the tier rules) |
| | `z.codec`, `z.toJSONSchema` | 0 | we're missing them | Codecs suit stored-envelope encode/decode; JSON Schema for MCP and agent tools |
| **ZenStack 3.10.1** | Generated types and Zod factories | core contracts | ✓ | — |
| | Policy-enforcing client (`@repo/database`) | **0 live users** | **we're missing it** | The API uses raw `pg` pools. See the single-source-of-truth question in the mental model |
| **PowerSync 2.x** | Live queries (`@powersync/react`) | 5 | partial | The local-first read path for synced tables |
| **React Native 0.88.1 / FlashList 2.3.3** | `FlashList` | 63 | ✓ | — |
| | `ScrollView` | 125 | **review** | Long lists inside a `ScrollView` are unvirtualized; `check:native-slop` already looks for this |

**Duplicate installs** in `node_modules/.pnpm`: two each of TanStack Query, Zustand, XState
(old alpha), `@xstate/effect`, Effect (3.21), oRPC and Hono (4). Every workspace manifest declares
one version. The extra copies come from transitive dependencies (Effect 3 via Prisma via
ZenStack's CLI) or are store leftovers, so they don't load at runtime.

## 5. Where the existing documents stand

| Document | Status |
| --- | --- |
| [Client state decision (2026-10-23)](2026-10-23-client-state-architecture-decision.md) | **Authoritative.** Its "what is wrong" item 5 (unversioned stores) was fixed on 2026-11-12 |
| [Monorepo state guidance (2026-10-24)](2026-10-24-monorepo-state-architecture-and-decision-guide.md) | Its "Singleton Service" option is superseded by coordinators and bindings |
| [RN 0.88 / Expo 58 state canon (2026-10-24)](2026-10-24-react-native-0.88-expo-58-state-and-provider-canon.md) | Provider flattening still applies. Its version numbers (`xstate ^5.33`, `zustand ^5.0.16`) are out of date: XState 6 beta.2 and Zustand 5.1.0 are installed |
| [Architecture mental model](2026-11-12-architecture-mental-model.md) | Layers, coordinators, bindings, the scorecard |

## 6. Order of work

1. **Defects first:** the 9 `rules-of-hooks` violations and the 10 effects without cleanup.
2. **Turn on the compiler lint rules** as a ratchet (§2), and widen `check:native-slop` to catch
   any awaited call inside an effect.
3. **Fetch-in-effect → queries**, package by package (web, ui, self first), with `queryOptions`,
   `mutationOptions` and `useActionState`.
4. **Decide `useSchoolCreation` against `schoolProvisioningMachine`** (and the classroom and group
   creation hooks) before wiring either.
5. **XState:** move to `setup()` when a machine is touched; adopt `validatePersistedSnapshot` and
   `machineVersions` for persisted machines.
