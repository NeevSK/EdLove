---
title: "The Architecture Mental Model: What We Built, Why, and What It Costs"
status: "active"
created: 2026-11-12
author: "Neev"
scribe: "Claude"
tags: [architecture, mental-model, hexagonal, layers, tradeoffs, scorecard, start-here]
---

# The Architecture Mental Model

Read this first. It explains the whole model in one place: what each part is, why we chose it
over the usual alternatives, what each choice costs, and where we stand today. The detailed
rules live in the documents listed at the end. Where those documents disagree with this one,
the disagreement is named here.

## 1. The model in one paragraph

Gurudevi is **one app made of modules** (packages such as `@repo/self`, `@repo/classroom`,
`@repo/community`), with `@repo/core` as the shared foundation. **Inside** each module the code
is arranged so that **dependencies point one way: from the screen down to the data.** Screens
ask hooks. Hooks read stores and call pure logic. Anything that touches the outside world
(Supabase, PowerSync, storage, the network, the clock) sits at the edge, behind a small typed
interface, and is wired in from one place. Data from the outside world is checked once, at that
edge. Everything above the edge works with typed, already-checked values.

That is all of it. The rest is detail and enforcement.

## 2. Two levels: modules and layers

People mix these up, which is where most of the confusion comes from.

| Level | Question it answers | Our answer | Industry name | Where it's written |
| --- | --- | --- | --- | --- |
| **Macro: modules** | Which part of the product owns this fact? | One package per business area; one owner per fact; `@repo/core` owns shared types | Modular monolith with bounded contexts (DDD) | [platform-map.md](platform-map.md), [module-structure.md](module-structure.md) |
| **Micro: layers** | Inside a module, what may this file depend on? | Contracts → pure logic → I/O at the edge, wired in one place → state → hooks → screens | Ports and adapters (hexagonal), plus the layering React apps use anyway | This document and [the tier standard](2026-11-01-architectural-hierarchy-and-archetypes.md) |

The two levels don't compete. Modules decide *who owns what*. Layers decide *how code inside an
owner is arranged*.

## 3. The layers, and why each exists

The tier numbers (0–6) are only labels for ordering. Each layer is here because it prevents a
specific, common failure.

| # | Layer | What it holds | The failure it prevents | Common alternative, and why we didn't take it |
| --- | --- | --- | --- | --- |
| 0 | **Contracts** | Zod schemas, types, constants | Two files with the same `Student` type drifting apart (we found 90 such duplicates) | Types next to each feature: quick, but it caused exactly that drift |
| 1 | **Ports** | Small interfaces: what the outside world must provide (`GrowthViewSource`, `INotificationPort`) | Logic tied to Supabase, so it can't be tested or swapped | Calling the Supabase client everywhere: simplest, but every test needs a database and every vendor change touches 100 files |
| 2 | **Pure logic** | Functions that take data and return data | Logic secretly reading app state (the temporal filter read the store from inside repositories) | "Utils" that reach for whatever they need: convenient, invisible coupling |
| 3 | **Adapters** (I/O) | The only code that talks to Supabase, PowerSync, storage, network, crypto | Untrusted data reaching screens unchecked; I/O scattered everywhere | A "services" folder with mixed logic and I/O: no clear place to check data |
| C | **Wiring** (`effect/Layers.ts`, `effect/AppRuntime.ts`, `effect/bindings/*`) | Which adapter backs which port, decided once | Every caller choosing its own adapter; tests can't substitute | A DI container (Java/Angular style): heavy and magical. We use plain module exports and Effect layers |
| 4 | **State** | Zustand stores, slices, XState machines, TanStack Query definitions | Server data copied into stores by hand; state holding unchecked data | Redux everywhere: more ceremony. Context everywhere: re-render storms |
| 5 | **Hooks** | What screens call; they combine state and logic | Screens knowing about stores, queries and adapters | Fat components: fine for prototypes, painful at our size |
| 5 | **Coordinators** (`*.coordinator.ts`) | Multi-step work across several stores and ports: guest activation, account switching, snapshot refresh, device-security intents | Orchestration smeared across hooks and `useEffect`s, or hidden inside adapters that then have to read stores | A "service layer" (Java). This is the archetypes doc's Flow / Coordinator ("use case" in Clean Architecture). Plain functions, no classes, no React |
| 6 | **Screens and components** | JSX | UI importing the database | (none; this is just React) |

**Is this a Java pattern?** No. The archetypes doc §1.5 bans the Java baggage (`*Manager`,
`*Repository` class hierarchies, DI containers, factories). What we use is idiomatic TypeScript:
interfaces, plain objects and functions, Effect tags, Zustand, TanStack Query. The *idea* of
keeping I/O at the edge is decades old and language-neutral. It is also what React Native and
local-first apps converge on: React Query for server state, a small store for client state, and
adapters for the platform.

**Is it best practice?** Partly, and it's worth being precise:

- **Widely accepted** (you'll find these in most well-run React and React Native codebases):
  checking data at the edge with Zod; server state in TanStack Query and client state in a small
  store; screens never calling the database; platform code (native and web) kept apart; one owner
  per type; no barrel `index.ts` re-export files (they slow Metro and Next and hide where things
  come from).
- **Our house choices** (reasonable, but other good teams do it differently): numbered tiers, the
  file-name suffixes, a script that counts violations, and the ratchet that blocks a merge when a
  count rises. These exist because many people *and AI agents* write code here. Mechanical rules
  are how a large mixed team keeps one shape. A solo developer could live with fewer of them.

## 4. The rules that matter, and the ones that are only labels

**Rules worth enforcing.** Each one caught a real problem this month.

1. **Screens and hooks never call an adapter directly.** They go through a store, a query or a
   binding. Caught: 17 hooks calling Supabase or storage directly.
2. **Untrusted data is checked once, in the adapter.** Caught: growth data, journey snapshots and
   mood history were parsed in hooks and logic.
3. **Pure logic never reads app state.** Caught: the temporal filter read the store from inside
   repositories.
4. **A module that every store imports must stay light and platform-neutral.** Caught: putting the
   native AsyncStorage binding there pulled React Native into web and broke six web test files.
   Putting the database client there slowed the first entitlement read from 0.5s to 1.1s.
5. **One owner per type.** Caught: 90 duplicated contracts.

**Labels, not laws.** These help you navigate, and nobody should spend effort satisfying them for
their own sake.

- File suffixes (`.adapter.ts`, `.store.ts`, `.machine.ts`, `.react.ts`). They make a file's job
  visible from its name.
- Tier numbers.
- The exact violation counts. The direction matters; the number is just a progress meter.

### Coordinator: plain async function or XState machine?

Use the repo's own admission test, `assessProtocolAdmission` in `lib/clientStateFoundation.ts`.
A coordinator becomes an XState machine only when **all five** hold:

1. **A meaningful guarded state graph:** named states the UI shows or reacts to (a wizard step,
   syncing / paused / error), with transitions that may be illegal from some states.
2. **It survives interruption:** the process must resume or recover after the app is killed,
   backgrounded or the network drops, so its state is persisted and restored.
3. **Guards improve safety:** the transition table prevents real mistakes (double submit,
   finishing before a step completes).
4. **Effect owners are named:** timers, retries, cancellation and subscriptions each belong to a
   state.
5. **Machine tests add evidence** that direct tests of the functions wouldn't.

Otherwise it is a **plain async coordinator**: one call, ordered steps, deduplication or rollback
inside, and nothing the UI watches between calls.

| Coordinator | Form | Why |
| --- | --- | --- |
| `accounts/localGuestActivation.coordinator.ts` | async | One call, deduplicated per session; nothing to resume |
| `accounts/accountTransition.coordinator.ts` | async | One ordered sequence (close replay → database → queue) |
| `logic/permissions/snapshotRefresh.coordinator.ts` | async (long-running) | Has timers and events, but rebuilds from the current scope on every start (fails 2), and direct tests cover it (fails 5) |
| `lib/sync/deviceSecurityIntents.coordinator.ts`, `replayPolicy.coordinator.ts` | async | Single decisions over queue state |
| `logic/journey/roleJourney.machine.ts`, the classroom and admin wizards | XState | Persisted, resumable, user-driven steps |

A coordinator's I/O goes through `effect/bindings/*` (`localDatabase`, `guestDevice`, `state`),
never straight to an adapter or a database client.

### Who may read the database schema

Only `@repo/core` may import `@repo/schema` (the generated ZModel contracts) or `@repo/database`.
Within core, only the contract files (`logic/schemas/*`, `types/*`) and adapters do. Everyone else
imports core's contract types. An upstream schema change then lands in one place, core's
schemas, instead of in every screen. This was already the rule for `@repo/database`
(`no-db-leaks-to-apps` in `.dependency-cruiser.cjs`); it now covers `@repo/schema` too. Checked
on 2026-11-12: no code outside core imports either package.

Note that the shape of the data comes from **types**, not from stores. Stores hold runtime
values; a store is not a channel for schema information.

## 5. Decisions so far, with their costs

| Decision | Why | Cost and tradeoff |
| --- | --- | --- |
| `@repo/core` owns every shared type; duplicates removed | One truth; no drift between packages | About 90 renames, done once. Core becomes something every package depends on, so changes there need care |
| A move is not a deletion | The old "never delete" rule made people *copy* instead of move, which created the duplicates | Needs discipline: move, re-point every importer, remove the old file in the same change |
| Retired 28 barrel (re-export) files | Faster bundling; you can see where a name really comes from | Import paths got longer |
| A file's name states its job (`*.adapter.ts`, …) | You can tell what a file may do without opening it | About 40 renames. Pure churn if nobody uses the labels |
| Check data in the adapter | One place to trust or reject data | A little more code at the edges |
| Ports plus bindings instead of direct imports | Swappable and mockable; heavy chains stay lazy | More small files. **Tension with AGENTS.md anti-slop rule 3** ("no dead abstractions: an interface used once, a wrapper forwarding args"). A port with one Supabase implementation, or a one-line binding (`deviceSecurity.ts`, `notifications.ts`), is that, unless it pays for itself by keeping a heavy or platform-specific chain out of a light module (the measured cases) or by giving tests one seam to replace. Merge the ones that do neither |
| Hooks may use bindings directly (owner, 2026-11-12) | Avoids forwarding layers that only pass calls through | Hooks can reach more, so each hook needs review discipline |
| A store may read another store, never subscribe to it (owner, 2026-11-12) | Normal Zustand practice; subscriptions are what tangle lifetimes | Stores know about each other; this is fine for reads |
| `// contract-check:` marks parses of data the code owns | The parse rule was too blunt: checking your own manifest is not decoding untrusted input | An escape hatch that someone could misuse. Review it |
| `*.react.ts`: a vendor's React binding stays an adapter | PowerSync's `useQuery` *is* the adapter's reactive face; splitting it adds nothing | An exception to remember |
| XState 6 beta | The statechart runtime we already target (ADR) | A beta dependency |
| Guests write local Self data with no sync | Product decision: try before signing up, nothing leaks to the server | Guest data stays on the device until conversion |
| The ratchet blocks a merge when a metric rises | Stops backsliding | It is red today on two older metrics (files over 800 lines, root scripts), so everyone commits with `--no-verify`. **The gate currently protects nothing.** See §7 |

### Tooling: what already exists, and what to use instead of hand-rolling

- **dependency-cruiser is already configured** (`.dependency-cruiser.cjs`: package layers, no
  database leaks, no stores outside core, no cross-domain imports, no cycles). It is the standard
  tool for exactly this job. Two problems, though: it can't read TypeScript under the repo's
  TypeScript 7 (it needs `typescript <7` until TS 7.1 publishes an API), so it misses sources; and
  no hook or CI job runs it. Today it reports 131 errors (59 cycles, 27 store imports from apps,
  24 core-to-package imports, 7 cross-domain imports). Our hand-written tier audit
  (`scripts/audit-archetype-violations.mjs`) duplicates part of it. The sensible end state: a
  TypeScript 6 compiler beside TS 7 for tools, dependency-cruiser running in CI for the package
  level, and the tier audit kept only for what dependency-cruiser can't express (content rules,
  parse checks).
- **eslint-plugin-boundaries** is the other common choice. It doesn't fit here: the repo lints
  with Biome and oxlint, and typescript-eslint doesn't support TypeScript 7 yet.
- **Zustand 5.1** (installed, latest stable). Baseline enforced since 2026-11-12: every persisted
  store names its storage key and declares `version` next to it. All 17 do;
  `store/__tests__/persistContract.test.ts` fails otherwise. The next shape change bumps the
  version and adds a `migrate`, which may be async as of 5.1.
  The gap was components reading the whole store (`const { a, b } = useTemporalStore()`), which
  re-renders on every change. 41 such reads became atomic selectors (2026-11-12), as AGENTS.md
  requires. `useShallow` is the tool for multi-field reads where a package depends on zustand.
  `devtools`, `subscribeWithSelector` and `unstable_ssrSafe` (for Next) aren't used yet. They're
  optional, and `ssrSafe` is still marked unstable.
- **TanStack Query 5**: use `queryOptions()` for shared query definitions (`store/queries/*`), as
  `api/hooks` already does; it keeps keys and data types linked.

## 6. Where I disagree (Claude), and why

- **Keep the strict direction rules; drop only the ceremony.** The rules caught the web/native
  leak, the slow import chain and unchecked data. Those are real bugs, not audit points. The
  ceremony to drop is one-line forwarding files and work done only to lower a count.
- **No new "service" layer.** There's no need for one: the archetypes doc already defines a
  **Flow / Coordinator** (§ Tier 5, "use case" in Clean Architecture terms). It is code that
  orchestrates several stores and ports across steps: guest activation, account switching,
  snapshot refresh, sync start. The tooling never implemented it. It also clashes with
  `*.flow.ts`, which in our code means declarative journey *definitions*. Proposal: name
  orchestrators `*.coordinator.ts` (`scopeSessionCoordinator.ts` already exists), allow them
  stores, bindings, ports and logic, and let hooks and providers call them. That fixes most of
  the 24 remaining findings by naming what the code already is, not by adding a layer.
- **Apply our own anti-slop rule to my work.** Some of today's small binding files and single-use ports are borderline dead abstractions by AGENTS.md rule 3. Keep the ones that isolate a heavy or platform chain (`bindings/state.ts` versus `bindings/nativeStorage.ts`, `growth`, `experience`); fold the rest into fewer files.
- **Fix the red gate before trusting it.** Leaving the two older ceilings red (the earlier
  instruction) means the pre-commit and pre-push checks fail on every commit, so they get
  bypassed. Either re-baseline those two with a written reason, or fix them. A gate that is
  always red trains everyone to ignore it.

## 7. Scorecard

Judgment scores out of 100, each with the evidence behind it. "Before" is 2026-11-11, before the
bottom-up reconstruction; "now" is after commit `e3d89ea18`.

| Dimension | Before | Now | Evidence |
| --- | --- | --- | --- |
| Dependency direction and boundaries | 35 | 70 | Core findings 242 → 51 under the same rules; files with no tier 335 → 0; import violations 199 → 48 |
| Single source of truth | 30 | 75 | 88 of 90 duplicate contracts resolved; **31 copied module pairs remain** |
| Data safety at boundaries | 50 | 70 | Growth, journey and mood decoding moved to adapters; 3 decodes still in logic |
| Testability | 55 | 66 | Temporal filter is pure; ports are mockable; some tests are still time-fragile |
| Simplicity (higher is simpler) | 50 | 52 | 28 barrels gone and paths are clearer, but there are more small files and more rules to know |
| Documentation coherence | 35 | 45 | This document, but 223 architecture docs, two standards that disagree on Flow, about 26 docs naming old paths |
| Enforcement health | 30 | 40 | The tier metrics are meaningful now, but the gates are red and bypassed |
| Performance | 60 | 64 | Barrels removed; heavy chains kept lazy (test load 0.5s → 0.4s); **no app bundle or start-up measurement yet** |
| Type health | 45 | 50 | Errors fell in 12 packages (admin 142 → 122, core 52 → 50); edlove-web still has 4,167 |
| **Overall** | **45** | **62** | Clearly better foundations; not yet proven in a real build |

**Good:** one owner per type; screens and hooks no longer reach the database; data is checked at
the edge; platform code separated; clear names; every change verified against the previous commit.

**Bad, or not yet good:** more small files and rules to learn; documents disagree; gates are
bypassed; nothing verified in a real Metro or Next build; copies and the old API client remain.

## 8. Risks not yet caught

Everything so far is **G0 (tsc per package) and G1 (Vitest with mocks, compared with HEAD)** in the AGENTS.md evidence ladder. Nothing has reached **G4** (a real Metro or Next bundle) or **G5** (a device). These are what G0 and G1 **cannot** see:

1. **No real bundle has been built.** Metro's platform resolution of renamed files
   (`localEvaluator.adapter.native.ts`), the custom resolver in `apps/gurudevi-mobile/metro.config.js`,
   the dynamic `import()`s in `effect/Layers.ts`, and Next's build are untested.
   **Next check:** `expo export` for iOS, Android and web, plus `next build`.
2. **Tests that already failed hide regressions.** 22 core test files failed before this work, so
   breakage in those areas is invisible.
3. **Existing type errors hide new ones** in the same files (edlove-web 4,167, self 134, admin 122).
4. **Bindings captured when a hook loads** (`const { deviceAccounts } = authLifecycle`). A test
   that `vi.spyOn`s the adapter *after* import won't see the spy. Today's tests mock modules, so
   they're unaffected.
5. **One deliberate behaviour change:** journey-history cache keys now include `phase`, so past and
   present views no longer share cached data.
6. **Three import cycles in core** (`api/mockData ↔ staffManagement`, `flows/index ↔ journeyPilot`,
   `useActorSnapshot ↔ useMachineActor`). They predate this work.
7. **Stale material:** about 26 docs and the generated `architectureData.json` snapshots name
   files that have moved.

## 9. How the documents relate

| Document | Status |
| --- | --- |
| **This document** | Start here: the model, the reasons, the costs, the scorecard |
| [2026-11-01 architectural hierarchy and archetypes](2026-11-01-architectural-hierarchy-and-archetypes.md) | The enforced tier rules (kept in sync with `tooling/architecture-tiers.mjs`) |
| [2026-11-01 canonical file archetypes](2026-11-01-canonical-file-archetypes-and-first-principles.md) | The 12 archetypes and the Java ban. Its Flow/Coordinator is not yet implemented in tooling (§6) |
| [platform-map.md](platform-map.md), [module-structure.md](module-structure.md) | The macro level: modules and ownership |
| [2026-11-02 naming conventions and consistency rules](2026-11-02-monorepo-naming-conventions-and-consistency-rules.md), AGENTS.md naming taxonomy | File naming (`*Driver`, `*.adapter.ts`, `use*Store`, no `*Manager`/`*Service`/`*Repository`). The tier tooling's name rules follow it; `*.coordinator.ts` (§6) would be an addition to it |
| [2026-10-24 monorepo state architecture](2026-10-24-monorepo-state-architecture-and-decision-guide.md), [2026-10-23 client state decision](2026-10-23-client-state-architecture-decision.md) | Which state tool goes where; still valid |
| [2026-10-09 civic epistemic hexagonal architecture](2026-10-09-civic-epistemic-hexagonal-architecture-and-ldf-integration.md) | Early hexagonal framing; superseded by the two 2026-11-01 documents for code structure |
| `docs/current_progress/foundation-hardening-ledger.md` | What changed, batch by batch, with its verification |
