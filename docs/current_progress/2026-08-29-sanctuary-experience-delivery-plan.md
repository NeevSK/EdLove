# Sanctuary experience delivery plan

**Companion:** [parity audit](../architecture/2026-08-29-sanctuary-experience-parity-audit.md)  
**Engineering baseline:** [Sanctuary experience engineering standard](../architecture/sanctuary-experience-engineering-standard.md)  
**Active handoff:** [2026-08-31 sanctuary experience and Firefly feedback handoff](2026-08-31-sanctuary-experience-firefly-handoff.md)
**Goal:** make the five sanctuary spaces configurable without making behavior, recovery, or platform affordances inconsistent.

## Non-negotiable invariants

1. One canonical route and screen-state contract per space; platform files adapt presentation, not business rules.
2. Every remote/persisted surface represents loading, error, offline/queued, empty, permission-denied, and ready states as applicable.
3. A personalization write is optimistic only when it can rollback visibly; it must never silently disappear.
4. Feature flags protect migrations and rollout. Flag-off remains fully supported until flag-on has production evidence.
5. Haptics, animation, and drag are progressive enhancement. Keyboard, screen reader, pointer, and low-motion paths are first-class.
6. No new `any`, `@ts-nocheck`, or double casts. Remove live escapes while touching their boundary.

## Delivery sequence

### 0. Establish the experience contract

Create a shared, typed screen-state vocabulary and mutation-result contract in an existing core/UI ownership boundary (do not introduce a duplicate state library). Document which state each tab owns versus receives from query/cache/sync.

Acceptance:

- Workspace dispatcher and Library web render explicit retryable failure and permission/empty states.
- Shared components use branded loading, error, and empty treatments.
- Unit tests prove every state and retry transition.

**Initial implementation (2026-08-29):** `@repo/ui/state/screenState` now supplies the blocking-state rule, with Jest coverage. Workspace uses it to provide a retryable permission-resolution error, and Library web uses it to distinguish blocking load failures from an empty library while retaining content during a background sync failure. The remaining spaces still need their own state matrices and mounted recovery tests.

**Community message-list slice (2026-08-29):** the Community workspace is now the single owner of its embedded direct-conversation request. Its initial load enters pending state, retry increments a request version so it always refetches, and the embedded list receives controlled data rather than starting a duplicate request. The list preserves cached conversations during refresh/failure and renders an inline retry status. `directMessagesOwnership.test.ts` guards that ownership boundary; it is a structural regression check, not a substitute for device-level send/reconnect validation.

**Community delivery slice (2026-08-29):** Base chat now treats offline delivery as queued rather than falsely failed, acknowledges the queue visibly, and reports queue persistence/read/background-send failures with an accessible recovery state. When a message cannot be queued, its draft is restored. `baseChatDeliveryRecovery.test.ts` prevents those paths returning to silent catches. This does not prove full outbox idempotency, server reconciliation, haptics, or device-level reconnect behavior.

**Profile web save slice (2026-08-29):** profile fields still use the existing sequential API boundary, but the UI now preserves the edit form and names fields saved before a later field fails; retry therefore completes the remaining fields rather than overwriting or concealing a partial result. Clipboard failures are also explicit. `profileSaveRecovery.test.ts` guards this disclosure contract. A true transactional/batched server mutation remains the required end state.

**Self zone slice (2026-08-29):** the previously no-op zone setting now writes a persisted `zoneOverrides` map. The pure feature resolver applies it after hydration, so settings and rendered zones agree. The default empty map makes existing saved preferences forward-compatible. `featureResolver.zoneOverrides.test.ts` proves the override changes a rendered zone. The flag-gated unified screen and store remain type-debt work; this is not a rollout approval.

**Typecheck baseline repair (2026-08-29):** Profile native icon props and Self picker input props now use each component's typed style/color API. Both package-level typechecks pass again. The unified Self screen and canvas store have also shed their `@ts-nocheck` bypasses; typed Zustand updater callbacks now compile. Remaining Self work is behavioral (permission/error/offline recovery and mounted validation), not a compiler bypass.

**Self permission recovery slice (2026-08-29):** a failing capability check now produces a branded, accessible retry state instead of silently omitting spaces. The retry recomputes the capability set without rehydrating or discarding the user's canvas preferences. Mounted flag-on/off and offline validation remain required before rollout.

**Classroom reorder slice (2026-08-29):** the generic Classroom canvas now supplies the existing layout-sync order setter to `WorkspaceCanvas`. Zone-local drag or accessible move actions produce the corresponding persisted global order. `reorderClassroomSurface.test.ts` covers upward and downward moves. This reconnects the already-shared renderer and avoids a second DnD/persistence path; device verification and rejected-write recovery are still required.

**Drag feedback slice (2026-08-29):** shared mobile drag activation now uses a medium haptic in addition to the existing visible lift, shadow, snap-back, and accessible move controls. The haptic is progressive enhancement through the runtime adapter; it is never the sole confirmation. UI package typechecking passes, and serial Jest execution confirms the four workspace-canvas interaction assertions for drag axis and reorder fallback behavior.

**Profile session recovery slice (2026-08-29):** a failed native logout now logs the error and gives haptic plus visible toast feedback while retaining the confirmation modal for retry. Account-deletion failures now log as well, alongside their existing visible error state. Neither action silently leaves the user in an uncertain session state.

### 1. Make navigation and route state reliable

Keep the five mobile tabs. Improve the web rail/topbar to use route-aware link semantics, replace-on-select/idempotent behavior, visible compact-nav overflow behavior, and selected-state accessibility. Decide which Community/Library modes are URL state and implement only those.

Acceptance:

- Each tab opens directly, refreshes safely on web, and back/forward preserve defined mode/filter state.
- Native taps do not grow meaningless history.
- Keyboard-only web test reaches every primary and utility navigation item.

### 2. Ship workspace personalization as a vertical slice

First repair and device-verify the shared native drag path: generic Classroom currently has no reorder callback and the shared manual pan gesture needs verified activation. Then start with one stable role/workspace surface, not every tab. Define a versioned layout schema, migration/default/reset behavior, save status, cross-device conflict policy, and rollback. Use drag handles, not whole-card gestures.

Acceptance:

- Reorder/hide/pin/reset works online, offline/queued, and after a rejected write.
- Mobile long-press feedback/haptic has equivalent visible status; web supports pointer + keyboard reorder and announcements.
- Tests cover schema migration, conflict handling, reducer/state transitions, native gesture, and web DnD failure.

### 3. Harden Self before enabling unified canvas

Replace the no-check/casts with typed context and feature registry contracts. Implement actual zone changes or remove the control. Add hydration errors, fallback to legacy role view, no-data migration, and flagged analytics.

Rollout: internal → opt-in cohort → small percentage → full rollout, with a kill switch and flag-off regression suite at every stage.

Acceptance:

- Flag-on and flag-off have test coverage on mobile and web.
- Permission, persistence, and layout failures are recoverable without losing existing Self access.
- No `@ts-nocheck`, swallowed catch, or no-op exposed control remains in the enabled path.

### 4. Normalize Community, Library, and Profile mutations

Use the shared mutation contract for likes, announcements, library actions, and profile edits. Batch/transactional profile updates where supported; otherwise expose partial-save status and retry. Do not show a data failure as an empty state.

Acceptance:

- All listed mutations give pending/success/failure feedback, rollback or reconciliation, and telemetry.
- Library web has error/offline/retry parity with native.
- Community mode selection behavior is intentionally shareable or intentionally local and documented.

### 5. Production verification and rollout

First repair test discovery: no required test may be excluded without an issue and expiry, and each package must use its configured runner. Replace source-string checks with behavioural contracts where a user can observe the outcome. Run targeted package checks plus `pnpm run check:anti-slop`. Add a device/browser matrix before enabling each flag. Monitor error, rollback, sync-conflict, abandoned customization, and accessibility event rates; rollback on defined thresholds.

### 6. Modernization track: Expo/RN 0.87 readiness

Do not upgrade dependencies during product refactors. Maintain Expo 57/RN 0.86.2 as the supported release train until Expo publishes a stable SDK that supports RN 0.87. Before that upgrade, remove `InteractionManager`, migrate `PanResponder`/JS-thread gesture paths and deprecated RNGH builders to the v3 hook API, replace Reanimated compatibility `runOnJS` imports with Worklets imports, and reduce type/lint suppressions at gesture boundaries.

The later coordinated upgrade decision must pin compatible versions together: RNGH 3.2+ for RN 0.87, Reanimated 4.6+ and matching Worklets 0.12.x. Validate the actual resolved graph, not `package.json` intent, because current Worklets declarations and resolved peers conflict. Do not use Expo 58 as a planning assumption before it is stable.

## Test matrix

| Area | Automated | Manual sign-off |
| --- | --- | --- |
| Shell/navigation | route unit tests + Playwright | desktop, compact web, Android/iOS safe areas, deep links |
| Screen state | component tests for all state variants | offline, slow network, denied permission, empty account |
| Layout personalization | schema/reducer + DnD gesture tests | mouse/touch/keyboard, conflict, reset, reconnect |
| Self flag | flag-on/off integration tests | legacy fallback, migration, kill switch |
| Mutations | success/failure/rollback contract tests | duplicate tap, auth expiry, reconnect, partial profile update |
| Test integrity | test discovery/runner verification | no silent exclusion; Jest vs Vitest command is correct |
| Modern native path | gesture/lifecycle unit tests | cancel, activation, haptics, reduced motion, Android/iOS performance |

## Explicit decisions needed before implementation

- Which user-configurable properties are global, per-device, per-role, or per-workspace?
- Does a layout conflict prefer last-write-wins, prompt the user, or merge by surface ID?
- Which Community and Library states belong in shareable URLs?
- Which workspace roles and platforms are the first release cohort?

## Completion checklist

- [ ] No P0 audit finding remains open.
- [ ] Flag-off and flag-on paths are tested where a flag is involved.
- [ ] Web and mobile behavior differ only where the platform-affordance table permits it.
- [ ] Error, offline, permission, empty, and retry states are demonstrated for every affected surface.
- [ ] Targeted tests, `check-types`, lint, and `pnpm run check:anti-slop` pass for changed packages.
- [ ] Every claimed test is discovered by its real runner; source-contract tests are not used as UX sign-off.
- [ ] Rollback/observability dashboard and release notes are ready.
