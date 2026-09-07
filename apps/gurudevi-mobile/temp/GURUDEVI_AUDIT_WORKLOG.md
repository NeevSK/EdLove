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
