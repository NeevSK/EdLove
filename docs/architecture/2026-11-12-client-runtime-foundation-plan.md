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
- **Done (2026-11-13).** XState: all 19 machines declare their schemas, and none uses the
  deprecated `createMachine(config, options)`, so a `setup()` sweep would change nothing (it is for
  shared sources and per-state schemas). Persisted machines (role journey, principal setup) are
  versioned: `store/persistedActor.ts` restores through XState, drops another version or a finished
  flow, and takes a `migrate` function when a version change must keep people's place. Ratchet
  gates replace "Machines without setup()".
- **Open.** Decide between `useSchoolCreation` and `schoolProvisioningMachine` (Neev's decision).
  Runtime validation (`standardSchemaValidator`) is experimental; try it in tests first.

### L2 Transport

- **Today.** oRPC 2 beta client (`orpcClient.ts`, with its own `retryDelay`), PowerSync 2.4 native
  and 2.6 web, Supabase auth, an `idempotencyHeaderMiddleware`.
- **Baseline.** One client per channel, built in the composition root; one place that attaches
  auth, idempotency and trace headers; timeouts on every call; one offline signal that every layer
  reads. No retry logic in transport; retry belongs to L3.
- **Done (2026-11-12), grounded in what the server does:**
  - **Timeout.** Every v1 call is abandoned after 15 s (`V1_TIMEOUT_MS`; the server's own timeout
    is 10 s). A timeout becomes `UnavailableError` (`CLIENT_TIMEOUT`), which is worth retrying.
    It's built on `AbortController` alone, because Hermes may lack `AbortSignal.timeout` and
    `AbortSignal.any`. The caller's own signal still cancels.
  - **Interruptions.** Cancelled work (`AbortError`, TanStack's `CancelledError`) is neither
    retried nor shown nor reported (`isInterruption`).
  - **Request ID.** The diagnosis carries the server's `requestId` from v1 error data, to find
    the server's log line. It stays in-app: the telemetry filter drops `*_id` keys.
  - **No new request headers.** The API's CORS allows only `Authorization` and `Content-Type`, so
    any extra header would break every browser call at the preflight. v1 idempotency travels in
    the input (`idempotency_key`), so no header is needed for it.
  - **No client rate limiter.** The API already does admission control (503 with
    `Retry-After: 1` past its in-flight limit), and the jittered backoff spreads devices out. A
    client `AsyncRateLimiter` would reject the person's own calls; it's left out until traffic
    shows a need.
  - **Offline signal.** Each platform already feeds one source into TanStack's `onlineManager`
    (mobile `networkMonitor`, web `subscribeToNetwork`). There's no short-circuit before fetch,
    because captive portals make "offline" unreliable; the timeout bounds the wait instead.
- **Asks for the API (Neev's side):**
  1. Put `retryAfterMs` in error `data` beside `requestId` (the classifier already reads it), so
     clients honour back-pressure exactly.
  2. Allow `traceparent` in CORS if end-to-end tracing is wanted.
  3. Decide whether `request_id` may go to telemetry (it joins a report to a server log line that
     holds the account).
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
- **Done (2026-11-12).** The design was already decided in the
  [2026-11-11 doc](2026-11-11-product-shape-and-tool-ownership.md), section 4: expected failures,
  defects and interruptions, with one feedback table. What was built on it:
  - **Six more kinds** in `effect/Errors.ts`: Forbidden, NotFound, Conflict, Validation,
    RateLimited, Unavailable.
  - **One classifier**, `logic/failure/classifyFailure.ts`. It turns an oRPC, HTTP, Postgres, JWT,
    Zod or fetch failure into a kind; anything it doesn't recognise is a defect.
  - **`RETRY_POLICY`**, a table keyed by kind.
  - **Three classifiers re-pointed** to it: the outbox (`classifyError`), workspace sync and
    `shouldRetryAPIRequest`. A comparison over 70 inputs found only fixes: workspace sync never
    retried oRPC 429 and 5xx (v2 errors have no `status`); the outbox retried 422s and Zod
    failures forever. Two suites that failed at baseline now pass (`syncPolicy`,
    `errorNormalizer`).
  - **Feedback.** The new kinds have entries in the existing feedback table, reusing existing
    messages. Four deserve their own copy in en, si and ta: no access, no longer available, changed
    elsewhere, and check the form.
  - **Two audiences.** The person gets a message key and a remedy (`FEEDBACK`). Developers and
    agents get `diagnoseFailure`: the kind, the source's own code, the retry rule, an
    `AGENT_HINT` (for example `REFETCH_AND_REBASE`) and the operation. The diagnosis is flat and
    identifier-free, so it passes the telemetry privacy filter as it is. `presentFailure` shows
    the first and reports the second. A test checks that neither carries the other's text. This
    replaces the unused `guide` and `agentHint` fields of the old `lib/errors.ts`, which stays
    until its one importer moves.
  - **Ratchet.** `catchAndLogOnly` has a ceiling of 165.
  - **Step 3 done (2026-11-12).** Every retry path shares one predicate, `worthRetrying`:
    transient kinds retry, kinds retrying can't fix don't, and unrecognised failures retry as
    before. The paths that read it:
    - **Effect:** `retryTransient(schedule)` in `effect/Schedules.ts` gives `Effect.retry` options.
      The five `Effect.retry(policy)` sites (Supabase identity, the relief agent ×2, attendance,
      plan bridge) used to retry every failure, sign-out and forbidden included.
    - **Queries:** `shouldRetryQuery`.
    - **API:** `shouldRetryAPIRequest`.
    - **Mutations:** `executeMutation$`.
    - **Idempotent writes:** `withIdempotency`.
    - **Supabase codes.** `SupabaseQueryError` now carries the Postgres code, so `42501` reads as
      forbidden.
    - **Pacer.** The hooks moved to core (`@repo/core/hooks/usePacer`), replacing two diverged app
      copies (mobile's hand-rolled `useDebouncedValue` is gone). The core resize hook and mobile's
      dev-error pipeline use Pacer; the resize hook's timer used to leak on unmount. Ratchet:
      `handRolledPacing` 3 (edlove-web, Verger's frame sampler, the Pacer demo screen).
    - **Not changed.** Device security has no retry of its own (it queues through the mutation
      queue). The pre-v1 oRPC client's transport retry is retired code and is left as it is.
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
- **Corrected (2026-11-12): there is one outbox, not three.** `mutationQueue.store.ts` is the
  outbox. `logic/workspace/outbox.ts` holds helpers that build entries *for* it (used only by
  tests). `provisionalWorkspace.store.ts` is deliberately separate: drafts that can't authorise
  anything before a server receipt, and it isn't wired. So there was nothing to merge, and the
  "which queue survives" policy is gone.
- **What was actually wrong, and is fixed:**
  - **Two drains with different rules.** The foreground `SyncOrchestrator` classified failures.
    The mobile background task (`backgroundSync.ts`, twice) didn't: it retried an expired session,
    a forbidden or a validation failure until the dead-letter queue, and its retry limit was 3
    against 5. Both now apply `decideReplayFailure` (`lib/sync/replayDecision.ts`):
    - an expired session pauses (`AuthPaused`);
    - a conflict waits for resolution (`Conflict`);
    - a permanent failure is dead-lettered at once (`Failed`);
    - a transient one retries with jittered backoff (`Retrying`) until `REPLAY_POLICY.maxRetries`.
  - **An unknown mutation.** The orchestrator dead-lettered it, the background task kept it.
    Both now keep it queued (`API_CAPABILITY_NOT_ADMITTED`).
  - **Feedback.** Hard-coded English toasts that showed internal mutation names ("Action required:
    patchWorkspaceLayout failed permanentely") now go through `presentFailure`: a localised
    message for the person, the diagnosis for developers. The success toast ("Synced N pending
    actions") is still English and needs its copy.
  - **Tier.** The drain was written as a presentation component, and that one file held 15 of
    the 35 counted tier violations. It moved to `lib/sync/useOutboxReplay.ts` (T5), with platform
    pieces through bindings (`feedback`, `eventBus`, the new `effect/bindings/outbox.ts`).
    `SyncOrchestrator` is now a two-line mount. Tier violations went from 35 to 20 (ceiling
    lowered).
- **Dormant by design until v1 commands exist.** `MUTATION_REGISTRY` is empty (the pre-v1 replay
  table was retired with the old API), and neither drain is mounted or registered: no app
  renders `SyncOrchestrator`, and nothing calls `registerBackgroundSync`. Writes queued today
  (web's domain adapters, the PowerSync connector) wait. When a domain registers a v1 command
  handler, mount `SyncOrchestrator` in each app and register the background task; both then follow
  the same rules.
- **Outcome type.** The replay decision is the outcome for queued work. The success outcomes
  (Saved, Recovered) and the outcome-to-feedback table come with L7, where they have a consumer.
- **Production.** Conflict resolution per entity type (server wins, merge, ask the user); replay
  after app restart proven by tests; poison-message handling.
- **Enterprise.** Every replay traceable to a user and device; audit trail.

### L5 Reads

- **Today.** TanStack Query 5.107 with `queryOptions` in the experience builders; PowerSync live
  queries; 151 effects that set or derive state, about 105 of them fetch-then-set.
- **Baseline.** Every read is a `queryOptions` factory or a live query; effects only for external
  systems (state doc, rule 7). Query keys are scoped by account, so switching accounts never shows
  another account's data. The ratchet counts the effects down to 0.
- **Done (2026-11-12): one QueryClient policy.** `effect/bindings/queryClient.ts`
  (`queryClientConfig`) gives both apps the same retry, backoff and feedback. Each app keeps its
  platform settings:
  - **Retry by kind.** A query retries at most twice, and only for transient kinds and defects. The
    old `retry: 2` also retried sign-out, forbidden and validation errors. Mutations aren't retried
    here; offline writes go through the outbox.
  - **Backoff.** `retryDelayMs`: full jitter capped at 30 s, or the server's `retryAfterMs`.
    Workspace sync uses the same function.
  - **Feedback.** A failed mutation goes to `presentFailure` unless its caller handles it (its own
    `onError`, or `meta: { feedback: 'silent' }`). A failed query toasts only when it was a
    background refresh over data already on screen. Query and mutation `meta` is typed through
    TanStack's `Register`.
  - **Web had no toast host:** `showToast` reached nothing there. `FeedbackToasts` in the
    sanctuary layout now forwards core's `feedback:toast` into the kit's `ToastHost`.
  - **Moved.** `GuestStorageError` now lives in `effect/Errors.ts`. Its type import made web's
    type check load React Native's globals.
  - **v1 query options, derived.** `createV1QueryUtils` in `api/v1/client.ts` (oRPC's TanStack
    utils, with the `'v1'` key prefix) gives every procedure in your contract `queryOptions`,
    `mutationOptions` and keys, with no hand-written factory. Mobile exports it as `v1` next to
    `v1Client`. Web calls v1 only on the server so far, so it has no browser utils yet.
  - **Account boundary on mobile.** It was missing: switching accounts on mobile left the previous
    account's cached queries in memory. `accounts/queryAccountBoundary.coordinator.ts` disposes
    them whenever the scope session's principal changes, and leaves queued writes alone. Web
    already did this in `AuthQueryCacheBoundary`.
  - **Outcome type: moved to step 5.** It needs real producers. Online mutations are covered by
    the QueryClient policy; Queued, Conflict and Recovered come from the outbox, so the type lands
    with the outbox port rather than as an unused type now.
  - **First conversion candidate.** Mobile onboarding's first bond (`app/onboarding.tsx`
    `handleComplete`): a hand-rolled `submitting` flag, `try/catch` and `console.warn` around
    `v1Client.identity.createInitialBond`. Its toast copy is better than the generic message, so
    convert it with its own message (see L7, the copy that is still owed).
- **Step 6 (effects → queries), in progress.** Patterns used, all on TanStack Query 5.107
  (current):
  - **Local query:** data kept on the device, read through a query keyed by the record
    (`initialData` for a synchronous read, `staleTime: Infinity`, `networkMode: 'always'`) and
    written by a mutation that saves, `setQueryData`s and queues in the outbox. Used for chat
    and climate sensing.
  - **Cache-then-network:** a device query, plus a live query that takes it as
    `placeholderData`; TanStack's online manager pauses the live read while offline. Used for the
    progress tree in `packages/self`.
  - **Writes as `useMutation`:** `isPending` replaces hand-rolled `isSubmitting` and
    `isProcessing` flags. Used in the academic and tuition domain hooks.
  - **Converted:** `useCommunityChat`, `useClimateSensing`, `useAcademicDomain`,
    `useTuitionDomain`, `useStudentGrades`, `useProgressTree` (self), and web's `ProgressTree`.
    Ratchet: effects that set state 151 → 143, hand-rolled loading flags 52 → 49.
  - **Found on the way:**
    - `packages/self` `useProgressTree` imports `@repo/self/data/selfInsights.data`, a module
      that has never existed, so that hook fails on import (it did before too).
    - Web's `ProgressTree` shows a fixed count (12) when the read fails, which is not the person's
      real progress. It's kept as it was and named `FALLBACK_INTERACTION_COUNT`; that copy and
      behaviour is Neev's decision.
    - The `lib/sync/*` hook copies in web are unwired and left in place.
- **Production.** Offline-first cache, prefetch on intent (L9 tells L5 where the user is going),
  invalidation rules owned by L4 outcomes.
- **Enterprise.** Tenant isolation proven by tests.

### L6 Media and files

- **Done (2026-11-13): one file policy.** `core/logic/files/filePolicy.ts` `FILE_POLICY` per purpose
  (avatar, wallpaper, submission, scan, attachment): accepted kinds and types, size, count and pixel
  limits, and how an image is prepared (capture quality, crop, square, downsample size and format).
  `checkFile` / `checkFiles` return OK or a refusal code (the codes wallpaper uploads already used);
  `assertFileAllowed` throws for upload code; `fileRulesFor` gives the kit's `FileField` its rules;
  `acceptAttributeFor` gives web inputs theirs; `imagePickerOptionsFor` gives every picker its
  settings. File kinds (`FileKind`, `FileRef`, `fileKindOf`) moved to `core/logic/files/fileKind.ts`;
  the kit re-exports them. `lib/mediaUploadPolicy.ts` moved into the policy.
- **Wired.** Mobile: the capture adapter, submission photos, avatar, companions, QR and OCR scanners
  (and the scanner's downsample). Web: avatar (the 2 MB rule), wallpaper (accept, downsample),
  submissions (accept). The deprecated `ImagePicker.MediaTypeOptions` is gone (6 uses). Values are
  what each path used, except companions, which moved from 0.6 to the avatar quality (0.9).
  "Policy default" values (submissions: 20 MB, 5 files) had no limit before.
- **Defects found, not fixed (decisions or server side).**
  - `adapters/storage/supabase.adapter.ts` uploads the file's URI string, not its bytes (`fileUri as
    any`), to a public bucket at `uploads/<timestamp>`, with no account in the path. Avatar upload on
    mobile goes through it.
  - `api/mediaUpload.ts` (wallpaper to Cloudinary) has no caller and uses the legacy `orpcClient`.
  - No upload reaches the server through v1; web submissions say so on screen.
- **Next (baseline).** Uploads as v1 upload intents (the server signs where the bytes go and
  checks the same policy) carried by the outbox, so they survive going offline; one viewer per
  media kind. Neev: buckets, privacy (public or signed URLs) and the v1 upload procedure.
- **Production.** Resumable uploads, processing states, local cache cleanup.
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
- **Status (2026-11-13).** Baseline foundation landed, see the
  [navigation mental model](2026-11-13-navigation-mental-model.md). It includes a generated route
  catalogue (`scripts/route-catalog.mjs`), a route matcher, and `checkFlowRoutes`. That check found
  46 broken references, now ratcheted in `flowRoutes.test.ts`. It also includes optional `presentation`
  on steps, with defaults by purpose and size class, the pure `resolveFlowStep`, and a
  `useFlowNavigator` adapter in each app. Not done yet: moving call sites onto the adapter, the
  ratchet on direct router use, `back`, `transition`, `prefetch`, and layouts declaring sheets.
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

## 2a. Ownership and leverage (2026-11-12)

**Ownership.** L0 (schemas, contracts, the drift check) is Neev's. Everything downstream (L1 to L9)
takes contract types as they are and does not edit `packages/schema`, `*.schema.ts` or the API.
When L0 changes, it flows through the types.

**Where small work moves the most.** Measured over shipping code (no tests, no reference-only files):

| Signal | Count |
| --- | --- |
| `throw new Error(` | 754 in 257 files |
| `console.error` / `console.warn` | 609 in 255 files |
| `catch` blocks that only log | 167 |
| Hand-rolled loading flags (`useState(false)`, `isXLoading`) | 389 in 244 files |
| `useQuery(` / `useMutation(` | 42 / 18 |
| `queryOptions(` factories | 19 in 6 files |
| `setTimeout(` | 175 in 136 files |
| `useRouter(` | 55 files |

Ordered by what each one unlocks:

1. **The outcome and error kinds** (L3). One module: tagged error kinds and the outcome type. It is the
   input to retry, healing, feedback, telemetry and navigation, so every later layer gets simpler.
   About 250 files throw, log or swallow failures today; each becomes "map to a kind".
2. **Query and mutation factories** (L5, L4). Account-scoped keys, plus `queryOptions` and
   `mutationOptions` per domain with the retry policy and error mapping built in. With 389
   hand-rolled loading flags against 42 `useQuery` calls, this removes the most code.
3. **The feedback channel** (L7). Mutations settle into outcomes; one channel turns outcomes into
   toast, haptic and inline state. It depends on 1 and 2, and replaces 51 toast sites and 16 direct
   haptics imports.
4. **The navigator adapter** (L9) over the flow steps, with the presentation policy. 55 files use
   the router directly.
5. **The outbox port** (L4). One interface; the three queues become backends selected by policy.
6. **Mechanical sweeps.** Pacer for hand-rolled debounce and throttle, motion from the recipes, XState
   `setup()`, timer cleanup.

**The multiplier is the ratchet.** Each primitive lands with a metric that may only go down (sites
that throw raw `Error`, catch-and-log blocks, hand-rolled loading flags, direct router calls, direct
toasts and haptics). Then any agent can do the conversions safely, a few files at a time, without a
decision from Neev, and the count shows the progress.

## 2b. Pacer: where each capability goes (2026-11-12)

`@tanstack/react-pacer` 0.24.1 (2026-10-05) is the latest release, so the gap is capability,
not version. Each utility has one job in this plan, and none duplicates the retry engine:

| Pacer utility | Job here | Step |
| --- | --- | --- |
| `AsyncQueuer` (concurrency, priority, `started`/stop, `onSettled`) | Drains the outbox: one entity at a time, in order; paused while offline or signed out; each item settles into an outcome | 5 |
| `AsyncRateLimiter` | Client-side limit per procedure for the synchronized morning load (10,000 schools), honouring `RateLimitedError.retryAfterMs` | 4 |
| `AsyncBatcher` | Batches telemetry, breadcrumbs and sync-event invalidations (it replaces `useBatchedAction`'s plain batcher) | 4, 5 |
| `AsyncDebouncer` / `useAsyncDebouncedCallback` | Search and lookups that call the server, cancelling stale calls | 6 |
| `Throttler`, `Debouncer` | Already used: invalidation bursts, resize, dev errors | done |
| State selectors (`useDebouncer(fn, opts, selector)`) | `isPending` and `isExecuting` for the UI, replacing hand-rolled loading flags | 6 |
| `PacerProvider` | Shared defaults in each app root | 4 |
| `@tanstack/react-pacer-devtools` 0.9.1 | Dev-only inspection; `key` on every pacer | later |
| `AsyncRetryer` | **Not used.** Retry has one engine, Effect `Schedule` with `worthRetrying`; a second engine would split the policy | — |

## 2c. fate (fate.technology), assessed 2026-11-12

fate is Christoph Nakazawa's data client: views composed per component, a normalized cache, data
masking, and Async React. 2.0 adds GraphQL, client state, offline mutations queued with
idempotency keys, and IndexedDB persistence. Its starter (`vp create fate`) deploys to Cloudflare
with Void.

**Not adopted.** It speaks native HTTP, tRPC and GraphQL, not oRPC; React Native isn't covered;
its offline layer is IndexedDB, while ours is PowerSync's SQLite on device. Swapping would replace
L2 to L5 on both apps for a web-first tool.

**Borrowed ideas.**
- **Views and data masking:** a component declares the fields it needs, and the screen fetches
  them together. That is the L9 flow-step `prefetch` plus per-component `queryOptions`.
- **Offline mutations with idempotency keys and optimistic rollback:** the L4 outbox, step 5.
- **Memo fields:** derived data shared across views, as store selectors.

**Already aligned.** Vite+ bundles Oxlint and Oxfmt; our lint already runs on Oxlint. Where the
API is deployed (Void, Cloudflare) is the API side, Neev's.

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
7. **L1 machines.** XState 6 snapshot versioning and schema gates. *Done 2026-11-13.*
8. **L7 feedback, L8 motion, L6 files.** One channel, tokens only, one file policy.
9. **L9 journeys.** Presentation, back, transition and prefetch on flow steps; the navigator adapter;
   `validateFlowDAG` as a real gate; then the feature generator.

Then production level, layer by layer, in the same order.

## 4. Policies, not choices

Neev's rule (2026-11-12): where the right answer isn't known yet, don't commit to one. Make it a
**policy**: a typed value with a default, declared once, read by the mechanism, and changeable
without touching call sites. The mechanism is built once and must work under every allowed value.

| Policy | Allowed values | Default until decided | Read by |
| --- | --- | --- | --- |
| `REPLAY_POLICY` | `maxRetries`, `authPauseMs` | 5 retries, 5 s | L4: both outbox drains (`lib/sync/replayDecision.ts`) |
| `conflict[entityKind]` | `serverWins`, `clientWins`, `merge`, `ask` | `serverWins` | L4 healing loop; an unknown kind falls back to the default |
| `presentation[step][sizeClass]` | `push`, `sheet(detents)`, `panel`, `modal`, `replace` | `push` on phone, `panel` on tablet and web | L9 navigator adapter; a flow step can override |
| `retry[errorKind]` | an Effect `Schedule` | the current `defaultRetryPolicy` | L3 |

Policies live in core, in one module per layer, and are covered by tests that run the mechanism
under each value.

## 5. Journeys: two catalogs, kept separate

- **PJC** (`packages/core/src/flows/pjc`, [guide](product-journey-catalog.md)) is the **product
  spec**: feature → intent → journey → steps and transitions, each transition with its action and
  feedback, plus bindings to authorities (state, failure, offline, auth). It's the requirement
  and traceability layer, and it stays the authoring source. Neev has local changes there, so this
  plan doesn't edit it.
- **FlowDAG** (`packages/core/src/flows/<domain>/*.flow.ts`) is the **runtime** description the
  navigator reads (L9). The PJC guide keeps the two separate on purpose.
- **The link.** A runtime flow step carries the PJC step ID it implements, and an outcome mapping
  (L7) carries the PJC transition ID whose feedback it renders. A check can then report PJC
  transitions with no runtime implementation, and runtime steps with no spec.

## 6. School creation: resolved (2026-11-13)

**The main path is connecting, not creating** (Neev). Institutional schools (government and the
like) already exist in the national registry (`EduSchool`, with the official classification in
`constants/SriLankanSchools.ts`). A principal chooses one and asks to connect, or accepts an
invitation, and the request waits for review: PJC `feature:admin.school_connection`. Creating a
school from scratch is the secondary path, for commercial schools (private, international, tuition).

| Piece | State |
| --- | --- |
| One contract (`core/logic/schemas/school.schema.ts`) | `SchoolKindSchema` (institutional, commercial; more, such as sanctuary, when they exist) and `SchoolLevelSchema` (the union of both machines' lists, Neev's choice). Both machines use it; neither keeps its own enum. Kind has no `School` column yet (L0) |
| `classroom/machines/schoolProvisioningMachine.ts` | The commercial creation machine. Runs its own server calls through two ports (`checkHandle`, `provision`). Creation is **one** server command, with the school, the founder bond and the group made together; the idempotency key is made once per submission and reused on retry. Until v1 admits `school.handleAvailable` and `school.provision`, it fails as not admitted: no direct database writes. Before, nothing ever checked the handle, and the runner made three separate client writes |
| `admin/machines/principalSetupMachine.ts` | Kept separate (Neev). It collects a profile and shows "activated" without creating anything; it is not reached from any app |
| `core/hooks/useSchoolCreation.ts` | Kept for later (Neev): the draft's location, demographics and grade fields aren't in the `School` model; the registry (`EduSchool`) holds them for institutional schools |
| Owed (API, Neev) | v1: registry search, connection request and invitation accept (the main path); `school.handleAvailable` and `school.provision` (commercial) |

## 6a. Machines audit (2026-11-13)

All 19 machines resolve XState 6.0.0-beta.2; no deprecated API is in use. The real defect was
different: **16 machines did not run their own work**. Screens ran it through exported
`execute*Effect` helpers and fed the results back as `SET_*` events. A machine that runs its work
through `setup({ actors })` + `invoke` owns its whole flow, cancels it when the state is left,
and is tested with `machine.provide({ actors })`. That is where `setup()` earns its place.

| Machine | Reached from an app | Done |
| --- | --- | --- |
| `ui/guestDataSyncMachine` | Yes (mobile guest conversion) | Moved: invokes the summary (async logic, aborted on close) and the transfer (callback logic, progress sent back). The modal sends `START_LOADING` / `START_SYNC` |
| `classroom/schoolProvisioningMachine` | No | Moved (section 6) |
| `ui/authOrchestrationMachine` | Yes (mobile sign-in) | **For Neev's approval.** The screen runs four sign-in methods and PIN itself and drives the machine through an `action: any` shim. The machine's own `executePasswordAuthEffect` is a second copy of the steps, used only by its test. The target is the machine owning sign-in through invoked actors, but it is the most account-sensitive flow and is only testable with mocks here |
| `ui/mediaPlaybackMachine` | Yes (library video) | Correct: native video callbacks are real-world events. Its position-saving helpers are used only by tests, so playback position is not saved (unwired feature) |
| `self/*` (wind-down and others) | No: their screens import the removed self data layer | Left alone (gone family) |
| `sanctuaryPulse`, `roleJourney`, `principalSetup` | Pulse yes; the others no | No async work to move |
| The other 10 | No consumers | Left in place; moved when wired |

