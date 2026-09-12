# Gurudevi / EdLove Audit Worklog

Status: active
Started: 2026-09-07

## Scope

This audit covers the repository state in `C:/x`, with detailed review of:

- `EDLOVE_GURUDEVI_CONTEXT.md`
- `GURUDEVI_MOBILE_FINDINGS_AND_TREATMENTS.md`
- `GURUDEVI_TEMPORAL_FLOW_AUDIT.md`
- `GURUDEVI_TWO_LAYER_AUDIT.md`
- `GURUDEVI_USABILITY_DELIGHT_A11Y_AUDIT.md`
- `GURUDEVI_USEEFFECT_ANALYSIS.md`

The ZIP was verified separately: its nine Markdown entries exactly match the
neighboring extracted Markdown files. `device-before.png` and `device-ui.xml`
are separate later artifacts.

## Method

1. Establish the current stack from source manifests and current configuration.
2. Check documentation freshness against file metadata and recent Git history.
3. Convert audit claims into evidence-linked concrete issues.
4. Group concrete issues into recurring system patterns.
5. Define detection, prevention, and quality-gate controls for each pattern.
6. Validate claims against current source before calling an item confirmed.

## Evidence log

### 2026-09-07 — repository and artifact inventory

- Workspace: `C:/x`.
- Relevant audit files were created/modified on 2026-09-07.
- `files.zip` contains nine Markdown files; all extracted Markdown hashes match
  the ZIP entries exactly.
- Existing unrelated worktree changes were observed and left untouched:
  `packages/ui/src/components/ChatComposer.tsx` and the real-device validation
  document.

### 2026-09-07 — current stack baseline

Authoritative sources inspected:

- `apps/gurudevi-mobile/package.json`
- root `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- Expo/mobile configuration and repository scripts

Current mobile baseline, with manifest drift noted:

- Expo SDK `~57.0.20`.
- Resolved React Native is `0.86.3`; the mobile manifest still declares
  `0.86.2`.
- Resolved/installed React is `19.2.3`; the root manifest declares `19.2.8`,
  while the mobile manifest still declares `19.2.3`.
- TypeScript `7.0.2`.
- New Architecture stack with Reanimated `4.6.0`, Worklets `0.12.1`, RNGH
  `3.2.1`, MMKV `4.3.2`, Nitro Modules `0.37.1`, and Skia `2.11.1`.
- State/query: Zustand and TanStack Query.
- Persistence/sync: MMKV, PowerSync, Drizzle, and SQLite adapters.
- Domain/API/access: `@repo/core`, Supabase, ZenStack, Zod.
- UI: `@repo/ui`, NativeWind 5 preview, React Native CSS interop.
- Platform/build: Expo Router, Expo Dev Client, EAS, Doppler, config plugins.
- Observability and product tooling: Sentry, PostHog, GrowthBook, Inngest.

### 2026-09-07 — documentation freshness

- `docs/stack-map/landscape/stack-map.md` last changed 2026-08-31.
- `docs/stack-map/landscape/dependency-catalog.md` last changed 2026-09-04.
- Mobile package and workspace files changed 2026-09-05.
- Recent commits on 2026-09-06 include mobile, UI, core, API, and dependency
  changes.

Conclusion: the generated dependency catalog is newer and useful, but the
stack-map overview is not proven current against the latest commits. It must be
regenerated or reconciled before being used as the final architectural source.

Additional confirmed stack-integrity issue: root declarations, the mobile app
manifest, the lockfile, and installed packages do not describe one identical
React/React Native pair. This must be resolved before treating dependency
compatibility checks or runtime findings as fully trustworthy.

## Open audit state

- [x] Artifact inventory and ZIP relationship checked.
- [x] Current stack baseline captured.
- [x] Documentation freshness discrepancy recorded.
- [x] First-pass concrete finding inventory extracted from the supplied audits.
- [x] First-pass systemic pattern and prevention checklist created.
- [ ] Verify remaining findings against current source and classify confidence.
- [x] Produce the concrete remediation checklist.
- [x] Produce the recurring-pattern checklist.
- [x] Produce the proactive detection/prevention checklist.
- [x] Produce an evidence/status coverage matrix.
- [ ] Run relevant repository checks for resulting fixes or recommendations.

### 2026-09-07 — highest-severity source verification

- Confirmed current raw unqualified `alert()` calls in native-capable files,
  including `ClaimInviteModal`, `StudentAnalysisModal`,
  `DocumentScannerScreen`, `DemoFeeScreen`, and `WorkforceRoleScreen`.
- Confirmed `GradebookScreen.handleSaveGrade` closes its modal in `finally`
  after console-only error handling.
- Confirmed `VoiceJournaling.handleConfirm` invokes completion/reset after the
  try/catch/finally, independent of save success.
- Confirmed `AppSettingsScreen.shared.tsx` calls `navigation.navigate` while
  the primary tab route renders it without a navigation prop; the prop is typed
  as `any`.
- Refined the PowerSync finding: local-only tables are intentionally declared
  and covered by tests. The remaining question is queue admission, not whether
  every local table belongs in the server model map.
- Confirmed existing tests intentionally preserve atomic rollback for an
  unsupported sync table; this behavior must not be weakened.
- Confirmed native academic-cycle deletion still bypasses confirmation; web
  uses `window.confirm` but native calls deletion directly.
- Confirmed `InvitesDashboard` still emits a native clipboard success toast
  without performing a clipboard write; `InviteManager` is the correct local
  implementation.
- Confirmed the two admin soft-failure save shapes can leave `isSaving` true
  when their API resolves without throwing but returns a falsy/error result.
- Confirmed no current JSX mount site for `LotusPetalFAB`; registration hooks
  are widely used but the visible renderer is not found in the tree.
- Refined the logout sequencing claim: current `globalLogoutAndPurge` calls
  Supabase local sign-out after local cleanup, so the supplied remote-network
  failure scenario is not established by this function alone. Divergent live
  logout paths and audit-event semantics remain open.

### 2026-09-07 — lifecycle and stale-claim verification

- The supplied “13 effects in `app/_layout.tsx`” claim does not match the
  current file search; the current startup graph spans route layouts and
  providers, so this item requires re-baselining rather than direct refactoring.
- The supplied “unused lifecycle utilities” claim is stale for the named
  utilities: `useWorkspaceLayoutSync` has multiple screen/workspace consumers,
  and `AppLifecycle` is used by `SanctuaryProvider`.
- The auth lifecycle still performs the initial session/profile fetch before
  registering the Supabase auth-state listener; a narrow event-gap lead remains
  and needs a regression test.
- The fixed five-day student streak remains present at
  `packages/self/src/components/StudentGoals.tsx:43-46`.
- Analytics live polling is cleaned up correctly, but its failure path remains
  console-only and exposes no stale-data status.
- Added `GURUDEVI_AUDIT_COVERAGE_MATRIX.md` to make every current checklist item
  traceable to a source audit, confidence status, and next action.
- Rechecked the usability/accessibility audit: Auth, Delete Account, and the
  audited Self content components still have no explicit accessibility props,
  while shell/navigation coverage is concentrated rather than uniform.
- Added six usability/accessibility items (GD-025 through GD-030) to the
  remediation checklist and coverage matrix.
- Confirmed the Mood check-in failure path remains catchless at the screen
  boundary, while `useMoodLogs` rethrows after logging.
- Confirmed Student Profile load failure is console-only and Student Grades
  converts load failure into an empty list.
- Confirmed `ClaimInviteModal` still carries a local `Heading` wrapper with
  `any` props instead of the shared UI primitive.
- Completed the remaining scope sweep across Mobile Findings and Temporal Flow.
- Confirmed the AI assistant tab route bypasses the premium wrapper.
- Confirmed SQLite/icon/styling overlap as architecture debt or risk; no package
  removal is recommended without usage and performance evidence.
- Added cold-start measurement and native magic-link verification as explicit
  unverified tasks, because the supplied audit itself describes them as needing
  runtime measurement/end-to-end validation.

### 2026-09-07 — documentation integrity gate

- Checklist and coverage matrix both contain exactly GD-001 through GD-036.
- `git diff --check` completed without whitespace errors; only existing line
  ending warnings were reported for unrelated worktree files.
- A small set of items remains explicitly unverified because they require
  runtime, end-to-end, or measurement evidence, especially cold-start baseline
  measurement, native magic-link completion, and deeper caller/contract traces
  noted in the matrix.
- No code fixes or dependency changes were made during this audit/documentation
  phase.
- Current Auth source was compared directly with `auth_refinement.feature`:
  the required automatic login-mode transition/email preservation is absent,
  while the implementation emits a generic guidance toast.
- Static searches confirmed no inline password guidance in AuthScreen and no
  explicit accessibility semantics/hitSlop in the checked workspace dashboards.
- Added `GURUDEVI_AUDIT_INDEX.md` as the handoff entry point for the complete
  audit package.
- Added `GURUDEVI_EXECUTION_ROADMAP.md`, sequencing the 36 items into truth,
  correctness, shared-contract, accessibility, and architecture phases with
  explicit exit evidence.
- Corrected the deliverable structure after review: added three separate
  abstraction documents — the granular source-linked cross-list, the first
  abstraction of recurring patterns, and the second abstraction of proactive
  controls/prevention. These are now linked from the audit index.

### 2026-09-07 — lifecycle/routing priority and color-runtime handoff

- Incorporated the lifecycle fragmentation handoff into the permanent recovery
  plan and remediation SOP as a Phase 1, RED-zone proposal-first stream.
- The scope is not a naming cleanup: three sign-out shapes, account recovery
  cleanup, mixed Context/persisted-store route decisions, oversized auth
  lifecycle ownership, duplicate native lifecycle code, and unmounted legacy
  Sanctuary wiring require current-source tracing and contract tests first.
- The proposed authority is the pure bootstrap route contract, with one
  canonical account-scoped sign-out/account-switch coordinator. No broad
  refactor is authorized by this documentation update.
- Linked the native color diagnosis log. Its Metro singleton fix has promising
  post-reload evidence but is pending visual exercise of the unlocked,
  signed-in device shell.

### 2026-09-07 — account-recovery sign-out boundary

- Implemented the first bounded lifecycle repair: `account-recovery.tsx` now
  uses `deviceAccounts.signOutCurrentAccount()` instead of the generic
  `authAPI.signOut()` path.
- This preserves the existing device-account lifecycle contract: remove the
  active saved account/session and reset scoped state while retaining other
  remembered accounts. The route stays on recovery and re-enables its control
  if the operation fails.
- Feature spec: `../docs/current_progress/2026-09-07-account-recovery-device-sign-out-feature-spec.md`.
- The broader canonical coordinator, duplicate lifecycle retirement, and route
  authority consolidation remain open pending complete caller traces and
  targeted contract tests.

### 2026-09-07 — AI entitlement route consolidation

- Implemented GD-031: both the direct `/a-i-assistant` route and the Self-tab
  AI route now use `AIAssistantRouteContent`, which owns the existing premium
  decision, fallback, and protected screen rendering.
- The Self-tab route previously exported the raw assistant screen, bypassing
  the guard used by the direct route. Both routes now also have route error
  boundaries. No entitlement or permission policy was changed.

### 2026-09-07 — entry-shell service recovery

- Implemented the first live-provider repair: `EntryShell` now mounts the
  existing `DeepLinkProvider` beneath the live `GlobalProvider`. Its outbox
  drain lives in a small `AuthenticatedSyncService`, which mounts the existing
  headless `SyncManager` only after an active identity is available.
- Those services previously existed only in the unmounted legacy
  `SanctuaryProvider`, so cold/foreground deep-link handling and foreground
  outbox draining were absent from the live entry composition.
- Added a focused entry-shell architecture test and feature spec. Native
  cold-start deep-link and offline-queue validation remain required before
  release.

### 2026-09-07 — legacy Sanctuary provider retirement

- Confirmed `SanctuaryProvider` had no source importer. Its live-needed
  DeepLinkProvider and SyncManager responsibilities were recovered in the
  entry shell; global error setup is already installed by
  `EntryStartupBoundary`; its AppLifecycle callback was logging-only.
- Removed the unmounted provider instead of maintaining a second root
  composition. Historical documents that describe it are evidence, not current
  architecture.

### 2026-09-07 — duplicate native auth lifecycle retirement

- Workspace-wide non-document source tracing found the native
  `useAuthLifecycle` implementation was unreachable: `AuthProvider` consumes
  the canonical hook, while the native version was only exported from its own
  barrel.
- Removed the unused native implementation/export. The canonical hook remains
  the sole lifecycle implementation and retains the device-account capture
  behavior missing from the deleted copy.

### 2026-09-07 — lifecycle recovery verification upgrade

- Structural source tests are retained only as regression guards; they are not
  treated as runtime proof.
- Added behavioral component tests for account recovery (current-device
  sign-out success and failure), authenticated sync gating (public/inactive
  versus active identity), and DeepLinkProvider (foreground plus cold-start
  callback without an authenticated session). Focused suite: 6 passing tests.
- Core typecheck passes. Mobile typecheck is currently blocked by unrelated
  existing errors in `workspace/editorial.tsx`, `@repo/community` web profile,
  and shared `@repo/ui` button/modal types; none reference these recovery
  files. Native cold-start, magic-link, and offline-queue evidence remains
  required before release.

### 2026-09-07 — device account scope startup

- Implemented the missing live call to `deviceAccounts.initialize()` in the
  essential startup contract. It now occurs after core-runtime registration and
  app-catalog registration, before `EntryShell` mounts `GlobalProvider` and
  starts auth/session resolution.
- Extended the startup-coordinator test to prove the ordered runtime → catalog
  → device-account-scope sequence.

### 2026-09-07 — canonical auth lifecycle decomposition

- Moved verified device-account capture out of `useAuthLifecycle` into the
  device-account domain. The new contract captures once per session token and
  deliberately retries after a registry failure; behavioral tests cover both.
- Consolidated repeated identity reset operations inside the canonical hook so
  inactive-profile, invalid-session, and sign-out paths share the same derived
  state-clearing contract.
- Focused capture/profile tests pass and core typecheck remains clean. Profile
  hydration and monitoring ownership remain the next lifecycle separation.

### 2026-09-07 — profile resolution and telemetry ownership

- Moved identity lookup, school-type lookup, and deactivation classification to
  `logic/auth/profileResolution.ts`. The canonical hook now applies a typed
  active/inactive/unavailable result instead of owning the resolution flow.
- Active profile application now sets onboarding completion both true and false,
  preventing persisted completion state from surviving an active profile that
  reports onboarding incomplete.
- Moved auth telemetry identity to `monitoring/authIdentity.ts`. Sign-out now
  clears both Sentry and PostHog identity, preventing cross-account analytics
  attribution on shared devices.
- Focused resolver, capture, lifecycle-profile, and telemetry tests: 8 passing;
  core typecheck remains clean.

### 2026-09-07 — honest student momentum

- Removed the hardcoded five-day streak from `StudentGoals`. The screen now
  describes goal momentum without presenting an unmeasured activity metric as
  user data. A measured streak remains a future data-backed feature, not a UI
  placeholder.

### 2026-09-07 — academic-cycle deletion confirmation

- Replaced the native auto-delete branch in `AcademicCycleManager` with the
  existing cross-platform `confirmAction` adapter. Both web and native now wait
  for explicit confirmation before calling the delete API.
- Admin typecheck passes. Native dialog acceptance/cancellation remains a
  required physical-device verification item.

### 2026-09-07 — admin soft-failure recovery

- Fixed `InstitutionalCalendarSection` and `PrincipalObservationsSection` so a
  falsy calendar result or Supabase insert error follows the same failure path
  as a thrown exception: the entered form remains, a visible retryable error is
  shown, and saving clears in `finally`.
- Admin typecheck passes. This is marked resolved-code; screen/native failure
  validation is still required before release.

### 2026-09-07 — authority provider retirement

- Confirmed `AuthorityLifecycleProvider` had one caller, `GlobalProvider`, and
  its only behavior was a development console log. Removed it from the live
  provider tree and public export rather than preserving a false lifecycle
  owner.
- Expanded the granular ledger from 39 bundled observations to 120 separately
  addressable entries (L001-L120). The expansion decomposes multi-file,
  multi-handler, multi-impact findings without inventing new claims; each item
  retains an audit source/line reference and pattern mapping.
- Added provenance notes clarifying that the six supplied audit Markdown files
  remain authoritative for original evidence and narrative; the 120-item
  ledger and abstraction documents are reorganizations, decompositions, and
  prevention planning—not 120 new discoveries.
- Created permanent implementation documents: the phased recovery plan under
  `docs/current_progress/` and the remediation SOP under `docs/runbooks/`.

### 2026-09-07 — Expo diagnostic check

- Ran `pnpm --filter gurudevi-mobile exec expo-doctor` without changing files.
- The check started 20 diagnostics but could not complete: the Expo config
  schema check failed because the network TLS connection to the Expo API was
  interrupted (`fetch failed`).
- The local diagnostic also reported missing Supabase runtime configuration,
  expected because the command was run without Doppler. This is an environment
  limitation, not evidence that the app configuration is valid or invalid.
- The result is recorded as incomplete; no green Expo-doctor claim is made.

### 2026-09-07 — analytics polling recovery and test-harness finding

- Fixed `AnalyticsDashboardScreen` polling lifecycle: loaders are stable across
  renders, a first fetch starts immediately, and each failed refresh leaves the
  last successful metrics visible with an accessible stale-data indicator.
- The current admin screen test suite is not valid verification: a targeted
  Vitest run stops at `@jest/globals` before discovering any test. Repairing
  that runner mismatch and adding failure/recovery interaction coverage is a
  prerequisite for declaring this behavior proven.

### 2026-09-07 — auth listener ordering recovery

- Registered `onAuthStateChange` before initiating the asynchronous initial
  session lookup in `useAuthLifecycle`, closing the bootstrap event-loss window.
- This remains `resolved-code`, not runtime-proven: a hook-level test must emit
  an auth event while the initial session promise remains pending.

### 2026-09-07 — account lifecycle authority and cache isolation

- Made `deviceAccounts` the sole live user-initiated sign-out authority:
  `useIdentity`, profile, and account recovery all delegate to the same
  current-device operation. Removed the unused divergent purge implementation.
- Added `AuthQueryCacheBoundary` beneath the existing query provider. It clears
  account-bound React Query data only on a real authenticated-subject transition,
  including sign-out, and preserves cache during initial restoration.
- Focused mobile tests cover the cache boundary, authenticated sync guard, and
  account-recovery route (6 tests passing). Physical-device switching and
  sign-out remain release validation, not an inferred green result.

### 2026-09-07 — bootstrap route-state authority

- Replaced direct route-input assembly in `SessionRouteGate` with the typed
  `bootstrapRouteState` adapter. The adapter alone combines auth lifecycle,
  route path, active capacity, and entitlement snapshot ownership before
  delegating the decision to the existing core `getAuthRouteTarget` policy.
- Restored safe offline routing only for a fresh cached entitlement snapshot
  owned by the restored session; a mismatched account snapshot cannot grant app
  access. Focused route contracts pass (17 tests).

### 2026-09-07 — auth bootstrap freshness

- Closed the remaining bootstrap race after listener-first ordering: each
  initial-session read records the auth-event generation under which it began;
  if an event occurs while it is pending, its result is discarded rather than
  overwriting the newer session.
- Added a deterministic hook test that keeps the initial lookup pending,
  delivers a `TOKEN_REFRESHED` event, then resolves the initial lookup and
  verifies only the event session was written. Focused tests (8), scoped Biome,
  and core TypeScript compilation pass. Physical-device sign-in/sign-out
  remains required release validation.

### 2026-09-07 — deep-link lifecycle boundary

- Made `DeepLinkProvider` the single owner of native cold-start and foreground
  URL subscription. Pure URL acceptance and generic dispatch now sit outside
  the React provider; accepted links are dispatched and tracked once.
- Removed the provider's second listener via `useQRDeepLink`. QR links now use
  the scanner-kit dispatcher through the same provider listener: authenticated
  users navigate to `/qr`; signed-out payloads retain the existing pending
  redemption path.
- Focused provider/policy tests pass (6), scanner-kit TypeScript compilation
  passes, and scoped formatting/duplication checks pass. Native callback and QR
  walkthrough evidence remains required before release.

### 2026-09-07 — web auth callback contract

- Corrected the web magic-link redirect from the bare origin to
  `/auth/callback`. Added the platform-specific callback route, which delegates
  to the existing core deep-link manager rather than parsing or exchanging
  tokens in a screen.
- Extended the shared bootstrap route contract so the callback can render while
  unauthenticated, then hands a completed authenticated bootstrap to the
  existing `/self` route decision. Kernel tests cover the real Supabase OTP
  request and both callback route states (9 focused core tests passing).

### 2026-09-07 — account-scoped shell admission

- Tightened `/self` admission: an active profile must belong to the restored
  session, have a non-empty display name, and expose a live capacity after
  onboarding. Cached entitlements cannot stand in for those identity facts.
- A detected previous-account profile now produces a protected bootstrap hold;
  `SessionRouteGate` withholds native tabs and web shell children until the
  matching identity resolves, while public auth callback content remains
  available. Focused mobile routing tests pass (19) and focused core policy
  tests pass (2).

### 2026-09-07 — route, load, and interaction contract reconciliation

- Moved route-input collection behind the typed `useBootstrapRouteState`
  adapter; `SessionRouteGate` now consumes one snapshot and delegates to the
  existing pure route policy. Bootstrap route coverage now includes booting,
  public, onboarding, inactive-account recovery, app entry, and account-owned
  offline capability states.
- Repaired several remaining false-empty/false-success dashboard paths:
  curriculum progress, teacher directory, student pulse, and dashboard echo
  now distinguish loading, populated, empty, and failed-with-retry states.
  Dashboard echo no longer substitutes fabricated feedback on a backend error.
- Added accessibility semantics to the corresponding high-traffic cards and
  principal actions, including staff, invite, hierarchy, logbook, student-pulse,
  and teacher controls.
- Verification completed for the touched packages: mobile route/type checks,
  admin TypeScript, Self TypeScript/tests, and focused guardian/document
  behavior tests. Device screen-reader, native dialog, entitlement, and
  deep-link walkthroughs remain runtime evidence gaps.
- Reconciled the coverage matrix so code-resolved findings are not still marked
  confirmed; runtime-dependent proof remains explicitly open.

### 2026-09-07 — profile and classroom action reconciliation

- Replaced profile support rows that only emitted haptics with working FAQ,
  feedback-email, and public-site destinations, including visible launch
  failure feedback.
- Made the profile Data Saver placeholder explicitly disabled instead of
  presenting a tappable no-op control.
- Connected the admin institution profile's Manage Institution action to the
  canonical principal workspace route.
- Revalidated current student profile/grades and teacher workspace paths;
  their visible retry and mutation-failure states are now reflected in the
  coverage matrix rather than remaining marked as confirmed silent failures.

### 2026-09-07 — Self platform parity and honest failure states

- Aligned web and native Fire Journal behavior so failed persistence preserves
  the entry instead of showing a false release success.
- Added retryable failure states to web voice journaling, Wind Down Ritual,
  Tomorrow Prep, and Progress Tree flows.
- Added native Wind Down persistence so mobile reflections are saved on the
  same contract as web, with completion gated on a successful write.
- Disabled the Fire Journal microphone affordance until that surface has a
  real recording implementation; the dedicated Voice Journal remains the
  available recording path.

### 2026-09-07 — interaction recovery and onboarding polish

- Added truthful refresh and retry states across Self reflection cards,
  student goals, energy/sleep/wisdom history, and classroom resources.
- Prevented false success or misleading empty data in attendance snapshots,
  teacher analysis partial loads, school search/join requests, and invite flows.
- Tightened invite-code validation, reset transient invite-modal state on close,
  added destructive-action confirmation, and confirmed clipboard outcomes.
- Added accessibility labels and selected/busy/error semantics to high-traffic
  filters, roster actions, reflection controls, and onboarding controls.
- Package verification remained green for the touched areas: Self (9 files,
  28 tests), Classroom (1 file, 2 tests), plus TypeScript and diff checks.

### 2026-09-07 — final interaction semantics sweep

- Added accessible labels and contextual hints to the remaining legacy admin
  back control and student workspace pin/move actions.
- Revalidated Admin and Classroom TypeScript compilation and focused diff
  checks after the sweep.
- Removed hardcoded Grade Head roster totals and made unfinished quick actions
  visibly disabled until their backing surfaces are connected.
- Made unfinished Section Head assignment, draft-review, schedule-review, and
  workload actions visibly unavailable instead of presenting tap-to-toast dead ends.
- Applied the same unavailable treatment to Grade Head relief assignment,
  removing the last active “not connected yet” action in that dashboard cluster.
- Cleaned malformed comma-heavy Founder workspace empty-state and bridge copy
  so disabled states read as deliberate product language rather than generated text.
- Cleaned the most visible Guardian and Principal workspace hints and bridge
  descriptions, removing generated comma artifacts from navigation copy.
- Added web accessibility labels, hints, and selected state to Self mode
  switches, focused-space pinning, and Daily Rhythm day tabs.
- Added labels, hints, and busy/disabled state to Daily Rhythm deletion and
  Shadow Agent open/close controls.
- Matched those Shadow Agent labels and hints on native so the reflection
  drawer has platform-parity semantics.
- Re-ran the Self behavior suite after the parity pass: 9 files and 28 tests
  passed; only the existing Vite native-config warning was emitted.
- Re-ran the Classroom suite after a transient Vitest cache cleanup race:
  1 file and 2 tests passed; only the existing Vite native-config warning remained.
- Added web and native accessibility semantics to Student workspace surface
  actions, including pin, zone movement, disabled state, and open guidance.
- Added Guardian labels and hints for learner profiles, notifications, events,
  action tiles, and workspace pin/move/open controls; cleaned visible comma-heavy
  copy in those same flows.
- Added Guardian student-card and room-back semantics, and cleaned the back
  label so the navigation path is explicit to assistive technology.
- Rewrote Classroom teacher and student preview summaries into natural,
  readable product language, removing generated comma artifacts.
- Rewrote the Principal preview catalog in the same natural voice, removing
  malformed punctuation from all role-orientation summaries.
- Cleaned Guardian and Founder capability registry titles and descriptions,
  removing malformed punctuation from shared workspace metadata.
- Completed the remaining visible Guardian and Founder workspace guidance copy
  cleanup, including orientation subtitles and capability explanations.
- Added state-aware semantics to Guardian workspace switcher targets so enabled
  and unavailable role destinations explain themselves to assistive technology.
- Verification checkpoint passed across Admin, Classroom, and Self TypeScript;
  Self behavior tests passed (9 files/28 tests) and Classroom behavior tests
  passed (1 file/2 tests). Only the existing Vite native-config warning appeared.
- Corrected the Guardian student-card announcement to match its current root
  workspace route rather than implying a student-specific selection.
- Added explicit semantics to the web Teacher classroom back control so its
  destination is clear to keyboard and screen-reader users.
- Re-ran the app integration suite: 6 files and 13 tests passed, including
  bootstrap, guest traversal, and network-flap recovery scenarios.

### 2026-09-09 — analytics truthfulness guard

- Removed fabricated tenant analytics and random comparison values from the
  aggregate engine; unsupported institutional analytics now fail closed.
- Removed fabricated live CPU, memory, storage, and health telemetry; the live
  telemetry path now reports an explicit unavailable error until instrumentation
  is connected.
- Added an honest dashboard unavailable state and changed engine tests from
  shape-only assertions to behavior assertions that reject fabricated data.
- Admin analytics engine tests pass: 18 tests. Repaired the stale-poll screen
  harness with async fake timers; the focused analytics suites now pass 21 tests.

### 2026-09-09 — route transition behavior coverage

- Strengthened `SessionRouteGate` coverage from static render snapshots to a
  stateful bootstrap-to-public transition: protected content remains withheld,
  the redirect is issued once, and the settled destination does not loop.
- Focused route-gate suite passes: 4 tests.

### 2026-09-09 — navigation-shell recovery slice

- Extended the shared navigation contract to resolve every primary and utility
  destination against the live Expo Router route tree, then bound the native
  tab list, hidden header-only routes, keyboard behavior, and web metadata use
  to that contract. Route, responsive-shell, and navigation tests pass.
- Essential startup now applies its retryable deadline to platform bootstrap,
  app-catalog loading, and device-account initialization. Kernel tests execute
  all three real timeout paths rather than imitating them in a separate race.
- A live web trace showed startup completing before `FABContext` repeatedly
  emitted empty cleanup state and caused React's maximum update-depth error in
  the Community layout. Empty FAB cleanup is now a state-identity no-op and an
  app-level provider integration test proves it does not rerender the shell.
- Current browser interaction evidence remains open: the current Doppler-backed
  Metro process reaches configuration/plugin setup but does not bind port 8081.
  It must become live before route clicks, web keyboard traversal, or an
  absence-of-runtime-error claim can be accepted.
