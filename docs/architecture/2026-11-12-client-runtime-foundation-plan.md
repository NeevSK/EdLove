# Client runtime foundation: the whole picture and the plan

Status: plan, 2026-11-12. Scope: everything on the client, from data shapes up to what the user sees
and feels. The API and server side are Neev's; this plan only consumes their contracts.

Read with: [architecture mental model](2026-11-12-architecture-mental-model.md) (tiers, modules,
why each layer exists) and [state, effects, hooks and capabilities](2026-11-12-state-effects-hooks-and-capabilities.md).

## 1. The picture

The client runtime answers one question for every user action: *what happened, and what does the
user see and feel because of it?* It has two halves. They meet at one shared idea, the **outcome**.

```
 EXPERIENCE PLANE                                   (what the user sees and feels)
 L9  Journeys & presentation   intent → destination + presentation (push, sheet, panel, modal)
 L8  Motion & interaction      tokens, transitions, gestures, reduced motion
 L7  Feedback                  outcome → toast / haptic / sound / inline state
 L6  Media & files             one type, size and processing policy for every file
 ─────────────────────────────  OUTCOME  (one tagged type per result)  ─────────────────────────
 L5  Reads                     queries, live queries, cache rules, prefetch
 L4  Writes                    mutation → idempotency key → outbox → replay → conflict → heal
 L3  Resilience                error kinds, one retry policy, pacing (debounce, throttle, rate limit)
 L2  Transport                 oRPC client, PowerSync connection, Supabase auth; timeouts, headers
 L1  State                     stores, slices, machines; ownership and persistence versions
 L0  Contracts                 Zod is the single source of truth for data shapes
 DATA PLANE                                         (what is true, and how it gets there)
```

Build from the bottom. A layer may only rely on the layers below it. Each layer is done three times
over: **baseline** (correct, one way, enforced), **production** (survives real users and bad
networks) and **enterprise** (provable, auditable, measured). This plan takes every layer to
baseline first, then up.

**The outcome.** Every operation ends in exactly one of a small set of tagged results: `Saved`,
`Queued` (offline, will replay), `Conflict`, `Retrying`, `Failed(kind)`, `Recovered`. L3 and L4
produce them. L7 turns each into feedback, L8 into motion, and L9 decides where the user goes next.
Today each screen invents its own: that is why wiring a journey takes work in five places.

## 2. Layer by layer

Evidence was gathered on 2026-11-12 with ripgrep over `packages/` and `apps/`. Reference-only `.web` files are excluded.

### L0 Contracts: Zod is the single source of truth

- **Rule.** `schema.zmodel` → ZenStack → Zod. `@repo/schema` exposes `makeModelSchema`,
  `makeTypeSchema` and `makeEnumSchema` over the generated ORM schema. A persisted entity's client
  contract is *derived* from that Zod schema (`pick`, `extend`, `transform`) and its type is
  `z.infer` of it. Hand-written Zod stays only for things that are not stored: UI forms, agent
  contracts, view models.
- **Today.** 118 models in ZModel. 42 hand-written schema files in `core/logic/schemas` with 568
  `z.object` calls. Only 25 core files import `@repo/schema`. Known drift: the generated
  `UserGrowthState` and the hand-written one disagree, so switching `profile.port.ts` broke the
  repository.
- **Baseline.** Every persisted entity's contract derives from the generated Zod schema, and
  hand-written duplicates move out (moved, not deleted). A drift check fails when a hand-written
  schema names a model field the generated one doesn't have, or the types diverge. Untrusted input
  is parsed once, at the adapter.
- **Production.** Contract versions; migrations for persisted client data when a shape changes.
- **Enterprise.** Compatibility across app versions in the field; audit fields enforced.

### L1 State

- **Today (done to baseline).** Tiers, store ownership, no cross-store subscriptions, every
  persisted store has a `version`, guarded by tests. See the state doc.
- **Next.** XState: 14 machines without `setup()`; replace hand-built snapshot versioning with
  `validatePersistedSnapshot` and `machineVersions`. Decide between `useSchoolCreation` and
  `schoolProvisioningMachine` (Neev's decision).

### L2 Transport

- **Today.** oRPC 2 beta client (`orpcClient.ts`, with its own `retryDelay`), PowerSync 2.4 native
  and 2.6 web, Supabase auth, an `idempotencyHeaderMiddleware`.
- **Baseline.** One client per channel, built in the composition root; one place that attaches
  auth, idempotency and trace headers; timeouts on every call; one offline signal that every layer
  reads. No retry logic in transport; retry belongs to L3.
- **Production.** Token refresh with request replay, server back-pressure (`Retry-After`) honoured,
  PowerSync connect, disconnect and account-switch as one state machine.
- **Enterprise.** Request tracing end to end, certificate pinning where required.

### L3 Resilience: errors, retry, pacing

- **Today.** 20 classes that extend `Error`; no tagged errors; `lib/errors.ts` exists. At least
  **seven retry policies**: `effect/Schedules.ts`, the oRPC client's `retryDelay`,
  `logic/utils/errorPolicy.ts`, `logic/workspace/syncPolicy.ts`, device-security reads,
  `lib/idempotency.ts`'s own loop and `utils/mutation.ts`. TanStack Pacer 0.24 is installed and
  used in 2 files; debounce and throttle are hand-rolled in 5.
- **Baseline.** One list of error kinds as tagged Effect errors: `Offline`, `Unauthorized`,
  `Forbidden`, `NotFound`, `Conflict`, `Validation`, `RateLimited`, `Transient`, `Fatal`.
  Every adapter maps raw failures to one. One retry policy (an Effect `Schedule`) keyed by kind, used
  by queries, mutations, the outbox and sync. Pacer for every debounce, throttle, rate limit and
  batch.
- **Production.** Jitter, caps, circuit breaking per endpoint, retry budgets.
- **Enterprise.** Error budgets and SLOs; chaos tests for each kind.

### L4 Writes: idempotency, outbox, replay, healing

- **Today.** Idempotency keys everywhere (162 references). Three queue-like mechanisms: the mutation
  queue store (`gurudevi-mutation-queue`), the workspace outbox (`logic/workspace/outbox.ts`) and
  the provisional workspace commands. 17 files mention healing; no single reconcile loop was found.
- **Baseline.** One write path. A mutation gets an idempotency key at creation; goes to one
  outbox (persisted, versioned); replays in order per entity with the L3 policy; ends in an
  outcome. The PowerSync upload connector drains the same outbox. Healing is one loop: on reconnect
  or on a `Conflict`, re-read the server state, rebase or surface the conflict.
- **Production.** Conflict resolution per entity type (server wins, merge, ask the user); replay
  after app restart proven by tests; poison-message handling.
- **Enterprise.** Every replay traceable to a user and device; audit trail.

### L5 Reads

- **Today.** TanStack Query 5.107 with `queryOptions` in the experience builders; PowerSync live
  queries; 151 effects that set or derive state, about 105 of them fetch-then-set.
- **Baseline.** Every read is a `queryOptions` factory or a live query; effects only for external
  systems (state doc, rule 7). Query keys are scoped by account, so switching accounts never shows
  another account's data. The ratchet counts the effects down to 0.
- **Production.** Offline-first cache, prefetch on intent (L9 tells L5 where the user is going),
  invalidation rules owned by L4 outcomes.
- **Enterprise.** Tenant isolation proven by tests.

### L6 Media and files

- **Today.** `lib/mediaUploadPolicy.ts` in core; expo-image, expo-video, expo-document-picker,
  expo-image-picker, expo-file-system. Not checked: whether every upload goes through the policy.
- **Baseline.** One policy for accepted types, size limits and image compression; uploads go
  through the outbox (L4) so they survive going offline; one viewer per media kind.
- **Production.** Resumable uploads, processing states, local cache cleanup.
- **Enterprise.** Scanning, retention, compliance.

### L7 Feedback

- **Today.** `ui/theme/feedback.ts` exists; haptics imported directly in 16 files; toasts fired from
  51 files.
- **Baseline.** One feedback channel: screens emit outcomes, not toasts. A table maps each outcome
  to its toast, haptic, sound and inline state. Direct `expo-haptics` imports outside the channel are
  ratcheted to 0.
- **Production.** Feedback for each phase: optimistic, queued, failed, recovered. Localised
  messages per error kind.
- **Enterprise.** Accessibility audited (screen-reader announcements for every outcome).

### L8 Motion and interaction

- **Today.** Reanimated 4.7, Gesture Handler 3.5, Skia 3.9, Keyboard Controller 1.23; motion tokens
  in `ui/theme`. 50 files animate; 22 hard-code durations or springs; 28 handle reduced motion.
- **Baseline.** Motion comes from the world's recipes (`@repo/ui/theme`), as the UI kit rules
  already require for colour and type: durations, springs and easings by name. Reduced motion is
  honoured everywhere through one hook. A lint rule bans numeric durations and springs outside the
  theme.
- **Production.** Interruptible, gesture-driven transitions; shared-element transitions between
  list and detail; a frame budget.
- **Enterprise.** Performance regressions measured in CI.

### L9 Journeys and presentation

The question "is this the next screen, a side panel, a bottom sheet, or a modal?" should be answered
in **one place**, not at each call site. The repo already decided where: the
[journey doc](2026-10-28-canonical-user-journey-and-screen-state-machine-architecture.md) and the
`user-journey-orchestration` skill say the router is a passive projection, and journeys are
declared as flows in `packages/core/src/flows`. This layer builds on those flows; it doesn't add a
second registry.

- **Today.** 16 flow files declare a `FeatureJTBDGraph` (triggers, steps with `mobileRoute` and
  `webRoute`, fallbacks, completion) and are registered in `FLOW_REGISTRY`, with `validateFlowDAG` in
  `types/FlowDAG.ts`. **No screen or navigator reads them**: the flows are declared, not wired.
  Meanwhile 45 files call `router.push` directly, 14 call `router.replace`, 26 render `<Modal>` and
  40 mention a drawer or side panel. A flow step has a route but no presentation. expo-router 58 and
  react-native-screens 4.30 ship native sheets (`presentation: 'formSheet'`, `sheetAllowedDetents`);
  there is no sheet library and no sheet in use. The skill itself notes that `audit-flow-dag.mjs`
  only inventories files and proves nothing about links, cycles or reachability.
- **Baseline: a flow step is the intent.** A screen asks for a step, not a route:
  `open(teacherRollCallFlow, 'select_roster', { sectionId })`. Each `FlowNodeStep` gains what it
  is missing:
  - `presentation`, chosen by context: on a phone, `push` or `sheet` (with detents); on a tablet,
    `panel`; `modal` for blocking tasks; `replace` for steps that can't be revisited;
  - `back`: pop, dismiss the sheet, close the panel, or confirm before leaving;
  - `transition`: an L8 token;
  - `prefetch`: the L5 `queryOptions` for the destination.

  Capability guards and fallbacks are already in the schema. One navigator adapter resolves a step
  from `FLOW_REGISTRY` to an expo-router (or Next) navigation with that presentation. Direct
  `router.push`, `router.replace` and `<Modal>` outside the adapter are ratcheted to 0.
  `validateFlowDAG` becomes a real gate: every route exists, every fallback resolves, a terminal
  step is reachable.
- **Production.** Deep links resolve through the same flows (the doc's intent resolver: stash the
  intent if signed out, prompt on account mismatch); journey analytics hang off steps
  (`journeyAnalytics.ts` exists); state restoration after the process is killed.
- **Enterprise.** Flows as data: a journey can change by configuration and is tested as a graph.

**Why this is also the agent scaffold.** An agent adding a feature should add *entries*, not
wiring: a contract (L0), a `queryOptions` and mutation (L4, L5), a flow step (L9) and outcome
mappings (L7). Each has one file, one shape and one gate. After the baseline, a generator
(`pnpm new:feature <domain>/<name>`) writes those entries, and the gates check that every step has
a destination, a presentation, a back rule and a capability.

## 3. Order of work

Each step is baseline for its layer, gated by the ratchet, then committed:

1. **L0 contracts.** Inventory hand-written schemas against the generated models; derive the
   persisted ones from `makeModelSchema`; add the drift check.
2. **L3 errors.** The tagged error kinds; adapters map to them.
3. **L3 retry and pacing.** One `Schedule` per kind, replacing the seven policies; Pacer for the
   hand-rolled debounce and throttle.
4. **L2 transport.** One client per channel, one header path, timeouts, one offline signal.
5. **L4 writes.** One outbox for the three queues; replay, conflict and healing loop; the outcome type.
6. **L5 reads.** Effects → queries, package by package; account-scoped keys.
7. **L1 machines.** `setup()` and XState 6 snapshot versioning.
8. **L7 feedback, L8 motion, L6 files.** One channel, tokens only, one file policy.
9. **L9 journeys.** Presentation, back, transition and prefetch on flow steps; the navigator adapter;
   `validateFlowDAG` as a real gate; then the feature generator.

Then production level, layer by layer, in the same order.

## 4. Decisions for Neev

| # | Decision | When |
| --- | --- | --- |
| 1 | Merging the three write queues: which persisted store wins, and how existing queued items migrate | Before step 5 |
| 2 | Conflict policy per entity type (server wins, merge, ask) | Before step 5 |
| 3 | `useSchoolCreation` or `schoolProvisioningMachine` | Before step 7 |
| 4 | Presentation per device class (does a tablet get panels, or sheets everywhere?) | Before step 9 |

Settled: Zod (generated from ZModel) is the single source of truth for data shapes. Not building yet.
The API is Neev's.
