# Gurudevi Concrete Remediation Checklist

This is the first-pass inventory from the six audit documents. The verification
notes below are based on the current working tree as of 2026-09-07. Items still
marked `verify` require a deeper caller/runtime check before implementation.

## Stack integrity and documentation

- [ ] **GD-001 — reconcile React versions** — `verify`
  - Root declares React `19.2.8`; mobile manifest, lockfile, and installed
    packages resolve `19.2.3`.
  - Decide the canonical version, update the correct manifest(s), regenerate the
    lockfile, and run mobile type/lint/test checks.
- [ ] **GD-002 — reconcile React Native declarations** — `verify`
  - Mobile manifest declares `0.86.2`; lockfile and installed package resolve
    `0.86.3`.
  - Confirm Expo 57 compatibility and make the declaration/resolution pair
    reproducible. Do not use `expo install --fix`.
- [ ] **GD-003 — refresh generated stack documentation** — `verify`
  - Regenerate stack-map artifacts from the current manifests, review the
    annotations diff, and record any inherited drift.

## Concrete product and reliability issues

- [ ] **GD-004 — replace native `alert()` calls** — `confirmed-by-audit`
  - Reported in `ClaimInviteModal`, `StudentAnalysisModal`,
    `DocumentScannerScreen`, `DemoFeeScreen`, and `WorkforceRoleScreen`.
  - Use the existing toast/error-feedback system and test native and web
    behavior.
- [ ] **GD-005 — Gradebook false-success save** — `confirmed-by-audit`
  - `GradebookScreen.handleSaveGrade` logs failures only and closes the modal in
    `finally`; settings use the same shape.
  - Keep the modal open on failure, show an actionable error, and close only
    after confirmed success.
- [ ] **GD-006 — Mood check-in silent failure** — `confirmed`
  - `useMoodLogs.addMoodLog` rethrows; `TeacherSelfView.handleMoodSelect` has no
    catch and leaves the picker open after the spinner stops.
  - Route through the shared safe-mutation/error path and test offline failure.
- [ ] **GD-007 — Voice Journal false success/data loss** — `confirmed-by-audit`
  - `VoiceJournaling.handleConfirm` reports completion and resets outside the
    try/catch, even when saving fails.
  - Call completion/reset only after a successful durable save; preserve the
    recording or provide recovery on failure.
- [ ] **GD-008 — teacher silent load/mutation failures** — `confirmed-by-audit`
  - Seven handlers across `TeacherClassroomDashboard`,
    `TeacherObservationsWorkspace`, and `TeacherAssignmentsWorkspace` only log.
  - Add visible error states/toasts and distinguish failed loads from empty data.
- [ ] **GD-009 — student silent load failures** — `confirmed`
  - `StudentProfileScreen` and `StudentGradesOverview` reportedly collapse
    failures into console output or empty lists.
  - Add explicit loading/error/empty state separation.
- [x] **GD-010 — hardcoded student streak** — `resolved-code`
  - Fixed 2026-09-07: removed the fabricated fixed streak; the screen now
    presents unmeasured goal momentum honestly until a real activity model exists.
- [ ] **GD-011 — AppSettings navigation prop crash** — `confirmed-by-audit`
  - `AppSettingsScreen.shared.tsx` requires `navigation`, but two of three routes
    reportedly omit it; one lacks an error boundary.
  - Use the route-native navigation contract consistently and test all entry
    routes.
- [x] **GD-012 — account-switch failure has no user feedback** — `resolved-code`
  - Current `DeviceAccountManager` catches the rollback failure, provides error
    haptics, and displays the actual failure message while the hook preserves
    its `finally` busy-state reset.
- [x] **GD-013 — logout implementations diverge** — `resolved-code`
  - Fixed 2026-09-07: `deviceAccounts` is the sole live user-initiated authority.
    The dead duplicate purge path was removed; `useIdentity`, profile, and
    account-recovery sign-out use the device-account lifecycle.
  - `AuthQueryCacheBoundary` clears account-bound React Query data when the
    authenticated subject changes or signs out.
- [ ] **GD-014 — FAB renderer is not mounted** — `verify`
  - Ten screens configure FAB state, but the supplied audit found no mounted
    `LotusPetalFAB` renderer.
  - Mount or remove the dead contract, then verify each intended role surface.
- [x] **GD-015 — clarify logout audit semantics and failure handling** — `resolved-code`
  - Fixed 2026-09-07: the only live authority uses device-account lifecycle
    audit events and local-session semantics; the unused `CLOUD_WIPE_INVOKED`
    path was removed rather than retained with ambiguous meaning.
  - Device switching/sign-out still need a physical-device walkthrough.
- [ ] **GD-016 — verify PowerSync queue admission and batch poison-pill behavior** — `verify`
  - The server intentionally maps four published tables while the local schema
    explicitly marks thirteen others as local-only.
  - Existing tests intentionally assert atomic rollback for an unknown table.
  - Verify that local-only tables cannot enter the CRUD queue; if they can,
    fix queue admission. Do not “fix” the transaction by weakening atomicity.
- [x] **GD-017 — native academic-cycle deletion lacks confirmation** — `resolved-code`
  - Fixed 2026-09-07 with cross-platform `confirmAction`; native dialog
    acceptance/cancellation still needs physical-device validation.
- [x] **GD-018 — native clipboard false success** — `resolved-code`
  - Fixed concurrently on 2026-09-07: `InvitesDashboard` now writes through
    `coreRuntime.clipboard`, checks the result, and displays failure feedback.
- [x] **GD-019 — soft failures leave admin saves stuck** — `resolved-code`
  - Fixed 2026-09-07: calendar and observation saves now turn falsy/Supabase
    error results into visible retryable errors and clear saving in `finally`.
    Screen-level/native validation remains required.
- [x] **GD-020 — analytics polling can become silently stale** — `resolved-code`
  - Fixed 2026-09-07: `AnalyticsDashboardScreen` has stable polling callbacks,
    preserves the last live metrics after a failed refresh, and exposes an
    accessible stale/unavailable-data status.
  - Behavior test remains blocked: the existing admin screen suite imports
    Jest globals but is configured to run under Vitest, so it discovers zero tests.

## Effects and architecture leads

- [ ] **GD-021 — re-baseline cold-start orchestration** — `verify`
  - The supplied audit's claim that `app/_layout.tsx` contains 13 effects does
    not match the current file search; current effects are spread across route
    layouts/providers.
  - Count and trace the current startup graph before proposing a state-machine
    refactor; then test ordering, cancellation, and retry.
- [x] **GD-022 — auth subscribe-after-fetch gap** — `resolved-code`
  - Fixed 2026-09-07: subscription now happens before the initial asynchronous
    session request, closing the event gap.
  - A focused listener-during-bootstrap race test remains required.
  - Establish subscription before fetch or immediately reconcile after fetch.
- [ ] **GD-023 — remove stale “unused abstraction” claim or find remaining gaps** — `verify`
  - Current search shows `useWorkspaceLayoutSync` has many consumers and
    `AppLifecycle` is used by `SanctuaryProvider`; the supplied audit claim is
    stale for those symbols.
  - Review only genuinely unused exports before considering removal.
- [ ] **GD-024 — duplicated local design-system Heading** — `confirmed`
  - `ClaimInviteModal` reportedly defines a local `Heading` instead of importing
    the shared primitive.
  - Replace with the canonical `@repo/ui` component and add a boundary check.

## Usability and accessibility findings

- [ ] **GD-025 — Auth screen has no explicit accessibility semantics** — `confirmed-by-audit`
  - Current `AuthScreen.tsx` contains no explicit label, hint, or role props.
  - Add semantics to every interactive control and test with a screen reader.
- [ ] **GD-026 — Delete-account modal has no explicit accessibility semantics** — `confirmed-by-audit`
  - Current modal has no explicit semantics and its processing-label change has
    no live-region announcement.
  - Add modal/control semantics and announce processing/completion state.
- [ ] **GD-027 — Auth existing-account recovery does not match its BDD behavior** — `confirmed`
  - The audit reports a generic toast instead of switching to login and
    preserving the email.
  - Reconcile current implementation with `src/features/auth_refinement.feature`.
- [ ] **GD-028 — password guidance is reactive only** — `confirmed-by-static-search`
  - The audit found no inline password requirements or strength guidance.
  - Confirm current auth rules and expose requirements before submission.
- [ ] **GD-029 — Self content controls lack semantics** — `confirmed-by-audit`
  - Current source checks found no explicit accessibility props in the audited
    mood/journal/gratitude/joy/voice components, while shell navigation has some.
  - Add labels, hints, roles, and recording-state announcements to content.
- [ ] **GD-030 — workspace dashboards lack semantics and touch-area guidance** — `confirmed-by-static-search`
  - The audit reports zero explicit accessibility props and no `hitSlop` across
    the checked dashboard layer.
  - Recheck current dashboard files, then address high-traffic controls first.

## Stack, performance, and routing findings

- [ ] **GD-031 — AI assistant paywall route bypass** — `confirmed`
  - `app/a-i-assistant.tsx` applies `usePremiumStatus`; the tab route directly
    re-exports the raw assistant screen.
  - Make one gated route the canonical implementation and test deep links/tab
    navigation for premium and non-premium users.
- [ ] **GD-032 — SQLite ownership and redundancy** — `confirmed-as-architecture-risk`
  - `expo-sqlite` is imported by Self and Library while PowerSync uses other
    SQLite backends.
  - Trace whether these stores are intentionally standalone; document ownership
    or consolidate only after measuring persistence/sync impact.
- [ ] **GD-033 — icon package contract enforcement** — `confirmed-as-debt`
  - The UI package has a documented icon bridge, but direct package usage still
    exists (for example Phosphor in the web icon-lab route).
  - Inventory direct imports and enforce the bridge; do not remove packages
    until consumers are migrated.
- [ ] **GD-034 — preview styling dependency in production** — `confirmed-as-risk`
  - Mobile declares NativeWind `5.0.0-preview.4` alongside CSS engines.
  - Run the existing style-stack audits and document the chosen long-term owner.
- [ ] **GD-035 — cold-start performance baseline** — `unverified`
  - The supplied audit identifies expensive boot work but explicitly says TTI is
    inferred, not measured.
  - Run the existing Beast Plan P0 measurement before changing boot sequencing.
- [ ] **GD-036 — magic-link native callback flow** — `unverified`
  - The temporal audit reports a prior declared-versus-wired deep-link gap.
  - Verify current `DeepLinkProvider` wiring with an end-to-end native flow.

## Verification notes — 2026-09-07

- **GD-001/GD-002: confirmed.** The root manifest, mobile manifest, lockfile,
  and installed metadata disagree as recorded in the worklog. No dependency
  changes were made.
- **GD-004: confirmed, with scope correction.** Current source still contains
  raw `alert()` calls in the listed native-capable files. Web-only `alert()`
  calls and proper React Native `Alert.alert()` calls are separate cases and
  should not be mixed into this finding.
- **GD-005: confirmed.** Current `GradebookScreen.tsx:101-109` catches only to
  console and closes the grade modal in `finally`.
- **GD-007: confirmed.** Current `VoiceJournaling.tsx:199-233` calls
  `onFinished` and `handleReset` after the `try/catch/finally`, regardless of
  save success.
- **GD-011: confirmed.** Current shared settings screen uses `navigation` at
  lines 558, 567, and 568; the tab settings route renders `<AppSettingsScreen />`
  without that prop, while the modal route supplies it. The shared prop is also
  typed as `any`.
- **GD-016: original claim narrowed.** Current source explicitly marks thirteen
  tables local-only, and tests document that four tables are published plus
  unsupported-table batches roll back atomically. The remaining verification
  target is queue admission for local-only tables; the supplied audit's raw
  table-count comparison is not itself a defect.
- **GD-013/GD-015: partially corrected.** `globalLogoutAndPurge` currently uses
  local Supabase sign-out and performs local cleanup; the supplied audit's
  network-failure sequencing claim is not proven by this implementation alone.
  Divergent live logout paths and semantic audit-event naming remain open.
- **GD-017: confirmed.** `AcademicCycleManager` still calls `executeDelete`
  immediately on native, while web uses `window.confirm`.
- **GD-018: confirmed.** `InvitesDashboard` still has a native success toast
  without a clipboard write; `InviteManager` is the correct contrast case.
- **GD-019: confirmed.** Both current admin save handlers reset saving only on
  thrown errors or successful branches; a falsy/soft failure can leave saving
  true.
- **GD-014: confirmed at static level.** `LotusPetalFAB` is exported and reads
  FAB context, but there are no current JSX mount sites; the registration hooks
  therefore have no visible consumer unless mounting occurs through an indirect
  mechanism not found by the current search.
- **GD-021: stale framing.** The current root layout does not match the supplied
  13-effect claim; startup effects need a fresh graph rather than inheriting the
  old count.
- **GD-022: resolved in code, not yet proven in runtime.** `useAuthLifecycle`
  registers `onAuthStateChange` before starting its initial asynchronous session
  request. A listener-during-bootstrap regression test remains required.
- **GD-023: original claim disproven for named utilities.** Both
  `useWorkspaceLayoutSync` and `AppLifecycle` have current consumers.
- **GD-010: confirmed.** `StudentGoals.tsx:43-46` still assigns a fixed mock
  five-day streak.
- **GD-020: confirmed as observability gap.** Analytics polling catches errors
  to console only and exposes no stale/error indicator; the polling interval
  itself is cleaned up correctly.
- **GD-025/GD-026/GD-029: confirmed in current source checks.** The audited
  Auth, Delete Account, and Self content files remain devoid of explicit
  accessibility semantics, while shell-level coverage is more concentrated.
- **GD-006: confirmed.** `useMoodLogs.addMoodLog` logs and rethrows, while
  `TeacherSelfView.handleMoodSelect` has `try/finally` without a catch.
- **GD-009: confirmed.** `StudentProfileScreen` logs load failure only;
  `StudentGradesOverview` converts failure to an empty grades list.
- **GD-024: confirmed.** `ClaimInviteModal` still defines a local `Heading`
  wrapper with `any` props instead of using the shared primitive.
- **GD-031: confirmed.** The tab route still re-exports the raw assistant and
  bypasses the premium wrapper in `a-i-assistant.tsx`.
- **GD-032/GD-033/GD-034: confirmed as architecture risks/debt, not automatic
  removal instructions.** Current imports/declarations establish the overlap;
  usage and performance audits must precede dependency changes.
- **GD-027: confirmed.** The BDD feature requires automatic Login-mode
  switching and email preservation; current AuthScreen shows a generic
  “try logging in instead” toast and does not perform that transition.
- **GD-028: confirmed by static search.** The current AuthScreen exposes a
  password field but no inline strength/requirements guidance was found.
- **GD-030: confirmed by static search for the checked dashboards.** The
  high-traffic dashboard files contain Pressables but no explicit accessibility
  props or `hitSlop`; runtime screen-reader validation remains recommended.
- **GD-014: not yet confirmed.** The renderer exists and is exported, but the
  initial search found no JSX mount. Its provider/route wiring still needs a
  complete current-tree search before treating it as a defect.

## Corrections to supplied audit claims

- The raw-alert finding should exclude web-only files and existing native
  `Alert.alert()` usage; it applies to the unqualified `alert()` calls in
  native-capable files.
- The PowerSync “fifteen tables must map server-side” claim needs refinement:
  the current schema deliberately marks many tables local-only. The actionable
  question is queue admission/publication coverage, not table-count equality.
