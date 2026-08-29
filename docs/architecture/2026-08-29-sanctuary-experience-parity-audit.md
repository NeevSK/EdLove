# Sanctuary experience parity audit

**Date:** 2026-08-29  
**Evidence base:** `c76bef5c` plus a deliberately dirty working tree. Findings marked **current** were checked against the working tree; older documents are context, not proof of implementation.

## Scope and method

This audit traces the live Expo Router shell into the five primary sanctuary spaces: Self, Workspace, Community, Library, and Profile. It evaluates route reachability, mobile/web layout, state boundaries, errors, loading and empty states, persistence, interaction feedback, accessibility, and tests. It uses a spatial-first UI review: shell and layout first, then information jobs, controls, and route payload consumption.

## What is already in place

- **Current:** mobile has five explicit tabs in `apps/gurudevi-mobile/app/(tabs)/_layout.tsx`; the web counterpart provides a responsive rail/top bar in `_layout.web.tsx`.
- **Current:** app boot has retryable startup and root error boundaries in `apps/gurudevi-mobile/app/_layout.tsx`; notification and library resource views demonstrate branded loading/error/retry patterns.
- **Current:** responsive workspace renderer and native/web drag implementations exist under `packages/ui/src/components/workspace/`; layout sync is reused by Community, Library, Profile, classroom, and Self-related paths.
- **Current:** focused route/entrypoint tests exist, but most are source-string architecture checks. They do not establish interaction, visual, accessibility, recovery, or production behavior (see verification below).

Those foundations should be consolidated, not replaced by a second navigation or state system.

## Findings

| Severity | Space | Finding | Evidence | Required outcome |
| --- | --- | --- | --- | --- |
| P0 | Self | The customizable unified canvas is feature-flagged, starts with `@ts-nocheck`, has casts and a swallowed permission failure; zone changes are currently a no-op. It is not a proven production path. | `packages/self/src/screens/SelfScreen.unified.tsx:1,35-38,57-61,163-166`; flag gate in `SelfScreen.tsx` and `.web.tsx` | Typed persisted layout and explicit loading/error/offline/empty/permission states before any rollout. |
| P0 | Workspace | The role dispatcher handles loading and one student empty state, but has no error, retry, or permission-denied state; it also uses `state: any`. | `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:13-77` | A typed route-resolution state machine with retry and safe, role-aware fallback. |
| P0 | Workspace customization | The generic Classroom workspace exposes customization but does not pass `onReorder`, which disables the mobile renderer's drag path. The shared draggable surface also requests manual pan activation without activating it, so the teacher path is not proven functional either. | `packages/classroom/src/screens/ClassroomScreen.tsx:92-113`; `ClassroomWorkspaceCanvas.tsx:72-133`; `MobileWorkspaceCanvas.tsx:64-65`; `DraggableCanvasSurface.tsx:67-111` | Repair and device-verify one canonical drag implementation before promising rearrangement. |
| P0 | Library web | Query state and `libraryError` are fetched but not rendered; failed sync/public collection loads are console-only, so an outage can look like an empty library. | `packages/library/src/screens/LibraryScreen.web.tsx:291-354`; native contrast at `LibraryScreen.tsx:1210` | Shared screen-state boundary and a retryable web error/offline state. |
| P1 | Community | Feed loading/error/retry exists, but likes and supporting loads are fire-and-forget/console-only. Web mode is local, not URL-addressable; mode buttons lack selected-state semantics. | `packages/community/src/screens/CommunityScreen.web.tsx:225-280,312-316,347-365,621-626` | Mutation feedback with rollback, telemetry, and URL/history state for meaningful modes. |
| P1 | Profile | Web handles loading/error/retry and save error, but a multi-field save writes sequentially with no compensation; type escapes remain. | `packages/profile/src/screens/ProfileScreen.web.tsx:51,75-107,136-190` | Transactional/batched update contract or explicit partial-save recovery. |
| P1 | Navigation | Compact web nav horizontally scrolls without a keyboard-visible continuation; selection uses `router.push` and button semantics rather than link semantics. | `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx:89-95,306-315,381-387` | Semantic links, idempotent tab navigation, and keyboard/pointer discoverability. |
| P1 | Canvas interaction | Web sortable listeners cover each whole card, competing with card actions; reorder persistence has no rollback surface. The web workspace is columns, not a complete spatial canvas. | `packages/self/src/components/SelfCanvas.web.tsx:68-126`; `packages/ui/src/components/workspace/WebDraggableCanvasSurface.tsx:15-30`; `WebWorkspaceCanvas.tsx:46-80` | Dedicated drag handles, optimistic-save failure recovery, and explicit web interaction design. |
| P1 | Native interactions | Unified Self advertises drag/long-press customization but currently offers small buttons rather than gestures; Library has a console-only "pull to desk" handler and no feedback on its long-press/bookmark paths. | `packages/self/src/screens/SelfScreen.unified.tsx:133-136`; `SelfCanvas.tsx:85-107`; `packages/library/src/screens/LibraryScreen.tsx:807-913,1075` | Align copy with real behavior, or implement accessible gestures plus visible/haptic feedback. |
| P1 | Community native | **Partially remediated 2026-08-29:** embedded direct-message loading, retry, and visible recovery now have a single owner. Conversation sending, reconnect behavior, and device-level feedback are still not proven. | `packages/community/src/screens/CommunityScreen.tsx`; `DirectMessagesListScreen.tsx`; `directMessagesOwnership.test.ts` | Add send/reconnect feedback and mounted/device validation. |
| P1 | Cross-cutting | Many live target paths use `any`, `as unknown as`, and suppression; this conflicts with repository policy and obscures state contracts. | Examples: workspace dispatcher above; `SelfScreen.unified.tsx`; Community/Profile/Library screens | Replace escapes at public state boundaries before feature expansion. |
| P2 | Test coverage | Current focused tests validate architecture/entrypoints, but not behavioral failure and interaction paths for the web shell, Self flag states, Library web errors, or DnD keyboard/mutation failure. | `apps/gurudevi-mobile/tests/e2e/`; target package test inventory | Add contract, component, and Playwright/Maestro coverage per delivery plan. |
| P1 | Test validity | The mobile Vitest config excluded `profile-route-capabilities.test.ts`; enabling it exposed a deleted navigator reference. The UI workspace test was invoked with Vitest even though `@repo/ui` is configured for Jest, so it did not execute. | `apps/gurudevi-mobile/vitest.config.mts`; `profile-route-capabilities.test.ts`; `packages/ui/package.json` | Treat passed source checks as narrow regression checks only; keep test discovery and runner configuration executable. |
| P1 | Future stack | Current runtime is Expo 57/RN 0.86.2/RNGH 3.0.2/Reanimated 4.5.0. It cannot be described as Expo 58/RN 0.87 ready yet: RNGH 3.0 does not support RN 0.87, and Reanimated 4.5 does not either. | resolved package graph; official compatibility sources below | Make a coordinated, separately tested upgrade decision—not a piecemeal version bump. |
| P2 | Legacy/native patterns | `TemporalScrubber` uses `PanResponder` and JS-thread `Animated.event`; `AstroView` uses deprecated RNGH builder gestures; `useAppLifecycle` uses `InteractionManager`, removed by RN 0.87. | `packages/ui/src/components/TemporalScrubber.tsx`; `AstroView.tsx`; `packages/core/src/hooks/useAppLifecycle.ts` | Migrate on the modernization track, with gesture and cancellation tests. |

## Platform affordance decision

| Concern | Mobile | Web |
| --- | --- | --- |
| Primary navigation | Persistent bottom tabs; preserve safe-area and keyboard behavior. | Rail on roomy widths, accessible topbar on compact widths; real links and URL state. |
| Customization | Long-press/drag only with clear drag handle, haptic confirmation, and recoverable save. | Pointer + keyboard DnD with handle, announcements, focus restoration, and rollback. |
| Dense workspace | Role dispatcher leads to focused native screen; avoid desktop-column imitation. | Multiple columns/resizable canvases only when measurement shows enough width; otherwise ordered list/sections. |
| Feedback | Haptics are additive, never the sole success/error signal. | Visible toast/inline status and focus movement; no haptic dependency. |

## Documentation status corrections

- Treat dated audit documents as **Historical** until each claim is rechecked. In particular, earlier canvas documents describe a former missing debounce/default-footer problem that current source no longer has.
- `apps/gurudevi-mobile/docs/2026-08-25-unified-canvas-next.md` references a nonexistent `BaseSelfView.tsx`; the live entry is `SelfScreen.tsx` and the unified path is flag-gated.
- `apps/gurudevi-mobile/docs/INDEX.md` contains an active link to a missing `2026-07-28-production-readiness-and-compliance-analysis.md`.

## Modern stack assessment

The application is on the modern Expo 57 / React Native 0.86 line, with RNGH v3 hook APIs and Reanimated 4 available. That is a credible platform base, but code quality is mixed:

- **Elegant/current:** hook-based RNGH use in the workspace drag surface; Reanimated worklet-based animation; route-level native/web presentation splits; PowerSync-backed shared layout sync in several spaces.
- **Legacy or not hardened:** `PanResponder`/JS-thread animation, deprecated RNGH builder APIs, `InteractionManager`, Reanimated compatibility re-export of `runOnJS`, per-card gesture root views, and type/lint suppressions in the live drag and Self paths.
- **Resolved-vs-declared contradiction:** the installed Reanimated 4.5 peer contract resolves Worklets 0.10.x while package manifests/guardrails state `^0.11.1`. Do not force a version from either statement in isolation; resolve it through one lockfile and compatibility test.

Fact check for the proposed target: there is no stable official Expo SDK 58 release documented at this audit date. RN 0.87 is active, but Expo documents it as canary availability; it requires a coordinated move to RNGH 3.2+ and Reanimated 4.6+ with matching Worklets 0.12.x. RN 0.87 also promotes its Strict TypeScript API, removes `InteractionManager`, and deprecates `ImageBackground`. Sources: [Expo SDK 57](https://expo.dev/sdk/57), [Expo upgrade guidance](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/), [RN 0.87 release](https://reactnative.dev/blog/2026/08/11/react-native-0.87), [RNGH compatibility](https://docs.swmansion.com/react-native-gesture-handler/docs/), and [Reanimated compatibility](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/).

## Verification performed and limitations

The earlier test sampling was overstated. It proved only a small number of narrow contracts, and the requested profile test was excluded. Once enabled, it failed because it still named a removed navigator. This audit replaces that stale test with an Expo Router entrypoint check, but source inspection must never be represented as UX or production proof.

The following runs demonstrate runner/configuration status only:

```text
pnpm --filter gurudevi-mobile exec vitest run \
  src/__tests__/architecture/workspace-classroom-domain-slice.test.ts \
  src/__tests__/architecture/student-workspace-classroom-id-regression.test.ts \
  src/__tests__/architecture/profile-route-capabilities.test.ts \
  src/__tests__/architecture/library-surface-entrypoints.test.ts
# 3 files, 7 source/architecture assertions passed; profile test was excluded

pnpm --filter @repo/community exec vitest run src/navigation/communityRoutes.test.ts src/entrypoints.test.ts
# 2 files, 4 happy-path/export assertions passed

pnpm --filter @repo/self exec vitest run src/screens/self/roleResolution.test.ts src/features/__tests__/featureCatalog.test.ts
# 2 files, 6 role/catalog assertions passed
```

The current UI workspace package uses Jest, not Vitest; a Vitest invocation therefore failed before registering tests. The required sign-off matrix is in the delivery plan.

After correcting the stale profile route contract and running each package through its configured runner:

```text
pnpm --filter gurudevi-mobile exec vitest run \
  src/__tests__/architecture/workspace-drag-modern-api.test.ts \
  src/__tests__/architecture/profile-route-capabilities.test.ts
# 2 files, 6 assertions passed

pnpm --filter @repo/ui test -- workspaceCanvas.test.ts
# Jest: 1 suite, 4 assertions passed
```

The new workspace guard rejects manual pan activation without an activation pathway and rejects importing `runOnJS` from Reanimated in the live achievement overlay. It is a regression guard, not a gesture simulator.

Latest focused Community verification:

```text
pnpm --filter @repo/community test -- directMessagesOwnership.test.ts
# 1 file, 2 ownership regression assertions passed

pnpm --filter @repo/community check-types
# passed
```

These checks establish request ownership and type safety only. They do not establish a successful send, error recovery in a mounted native screen, haptics, or real-device behavior.
