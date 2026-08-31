# Sanctuary experience and Firefly feedback handoff

**Status:** active handoff — implementation is in a dirty, shared worktree.  
**Audience:** the next agent, including a junior implementer working under senior review.  
**Primary objective:** deliver elegant, production-hardened UX across Self, Workspace, Community, Library, Profile, and the five-tab shell without losing platform-specific affordances or recovery behavior.

## Read this first

1. Read repository-root `AGENTS.md` before touching Expo, React Native, Gradle, dependencies, or gestures. In particular: do not run `expo install --fix`, `expo install --check`, `expo prebuild --clean`, or edit `android/` / `ios/`.
2. This worktree has extensive unrelated user and agent changes. Never reset, checkout, reformat broadly, or edit `pnpm-lock.yaml` unless the assigned task explicitly requires it.
3. Start with [the parity audit](../architecture/2026-08-29-sanctuary-experience-parity-audit.md), [the delivery plan](2026-08-29-sanctuary-experience-delivery-plan.md), and [the engineering standard](../architecture/sanctuary-experience-engineering-standard.md). They distinguish evidence from intent and state what is not production-proven.
4. For the current visual language, read [the Firefly feedback system](../architecture/firefly-feedback-system.md) before changing a loader, empty state, error state, or recovery treatment.

## Product and design thesis

Gurudevi feedback should orient a person to the next useful action; it must not decorate an outage with the product logo. Firefly is the current guide. Its signature is a small **light path**: guidance is visible, while written state and recovery controls remain the source of truth.

Do not replace this with a generic rounded-card empty state, a large mascot sticker, a spinner, or a forced whimsical label. Great-brand restraint here means:

- Firefly is compact in rows and buttons, and only becomes a scene for blocking empty/error states.
- A real empty state invites a first action. A failed request, invalid route, denied permission, and offline condition are not empty states.
- Copy is specific to the screen. Do not add generic labels such as “Paused, not lost” that make a permission denial or missing item sound temporary.
- Motion is one composed moment, not ambient decoration everywhere. It must have a static, reduced-motion equivalent.
- Mobile gets UI-thread animation, gestures/haptics only as enhancement, and clear visible feedback. Web gets CSS motion, keyboard/pointer behavior, and URL semantics where state is shareable.

The visual skill’s compact palette is documented in `firefly-feedback-system.md`: Vellum `#F5EDD6`, Ink `#2A2318`, Saffron `#D4843A`, Lantern `#FFC107`, Dalu `#8BBF7A`, and Weathered amber `#D4A03A`. Keep those semantic roles; do not introduce unreviewed bright palettes for status illustrations.

## Current implementation state

### Shared feedback primitives

The following files are the active feedback seam:

| File | Responsibility |
| --- | --- |
| `packages/ui/src/components/Mascot.tsx` | `MascotProvider`, configuration seam, and Firefly renderer selection. Firefly is the only approved mascot today. |
| `packages/ui/src/components/FireflyMascot.tsx` | Compact, legible Firefly glyph used in dense loader contexts down to 18px. |
| `packages/ui/src/components/FireflyFeedbackScene.tsx` | Full blocking-state light-path scene; web arrival/ambient CSS motion and static native equivalent. |
| `packages/ui/src/components/fireflyFeedback.ts` | Pure state-to-presentation map. It keeps loading, empty, offline/error, and success visually and accessibly distinct. |
| `packages/ui/src/components/BrandPulse.tsx` | Shared Firefly loader. Native uses typed Reanimated UI-thread breathing; web uses CSS; reduced motion settles to a static glyph. Preserve its `progressbar`, label, and tint API. |
| `packages/ui/src/components/BrandedEmptyState.tsx` | Empty-state scene and first-action framing. `subtle` may animate but must remain semantically `empty`. |
| `packages/ui/src/components/ErrorState.tsx` | Error/recovery scene; callers own precise title, explanation, and action. |

Existing call sites in Self, Workspace, Community, Library, and Profile use `BrandPulse`, `BrandedEmptyState`, or `BrandedErrorState`; therefore the shared redesign reaches their current feedback paths. That is integration of the shared presentation, not proof that every screen’s state machine is complete.

### State semantics changed during this handoff

- `packages/library/src/screens/ResourceHubScreen.tsx`: a missing/invalid resource id now renders `BrandedErrorState` with “Back to Library”; it is no longer misrepresented as an empty state.
- The generic error primitive no longer imposes a cute status label that can contradict a caller’s actual permission, absence, or network condition.
- Tiny loading affordances now use a compact Firefly glyph rather than an unreadable full-size illustration or logo mark.

### Regression controls

`scripts/check-sanctuary-experience-contract.mjs` is an active CI-style source contract. It currently prevents:

- new `@ts-nocheck`, PanResponder, JS-thread `Animated.event`, deprecated gesture builders, `InteractionManager`, Reanimated `runOnJS` compatibility imports, and broad ESLint disabling in Sanctuary source;
- `BrandPulse` re-embedding a SVG/logo instead of using the configurable mascot;
- shared empty/error primitives bypassing `FireflyFeedbackScene` with a direct mascot;
- Resource Hub turning an invalid route back into an empty state.

Keep this script narrow and behavioral. Add a guard only for a concrete regression that a test cannot efficiently catch; do not turn it into a source-string substitute for mounted or device UX testing.

## Evidence and verification

Verified during this handoff:

```text
packages/ui: direct Jest invocation
  BrandPulse.test.tsx
  feedbackStates.test.tsx
  fireflyFeedback.test.ts
  -> 3 suites, 6 tests passed

packages/ui: direct Biome checks on feedback primitives and tests passed
node scripts/check-sanctuary-experience-contract.mjs
  -> passed
git diff --check on handoff-owned files
  -> passed (line-ending warnings only)
```

The package-wide UI TypeScript check remains blocked by pre-existing `packages/ui/src/components/InternalBrowser.tsx` WebView JSX typing errors (lines 166–179). Do not claim a UI-wide typecheck passes until that unrelated boundary is repaired or independently baselined. A later direct type run was interrupted by competing workspace processes, so it is not fresh evidence after the last loader refinement.

`pnpm run check:anti-slop` was not accepted as passing. Direct `aislop` stalled while the workspace was running a separate package installation. Re-run it after checking the active process list; do not alter its budgets, suppressions, or lockfile to make it pass.

## How to work safely from here

### Standard loop

1. Pick one vertical slice from the priority list below. Inspect its mobile and web route, state owner, data boundary, and existing tests before editing.
2. Write or update a state matrix: loading, ready, background refresh, empty, permission denied, offline/queued, failure, and retry/rollback as applicable.
3. Reuse `@repo/ui` feedback primitives. If they do not fit, improve the shared primitive only after confirming that the behavior is truly cross-cutting.
4. Add a behavioral test at the owning package’s configured runner. Use Jest for `@repo/ui`; do not invoke Vitest there. A structural source test is only a regression guard.
5. Run direct targeted formatter/test/type commands if `pnpm` would trigger an unrelated install. Then run package scripts and `pnpm run check:anti-slop` once the workspace is idle.
6. Inspect the diff, especially deleted guards and test assertion changes. Preserve all unrelated modifications.

### Useful commands

```powershell
# Read-only current-state checks
git status --short
rg -n "<BrandedEmptyState|<BrandedErrorState|<BrandPulse" apps packages
node scripts/check-sanctuary-experience-contract.mjs

# UI feedback focused Jest suite (avoids Watchman failures)
Set-Location packages/ui
cmd /c ..\..\node_modules\.bin\jest.cmd --runInBand --no-watchman `
  BrandPulse.test.tsx feedbackStates.test.tsx fireflyFeedback.test.ts

# Targeted format/lint if the repository Biome binary is available
& ..\..\node_modules\.pnpm\@biomejs+cli-win32-x64@2.4.16\node_modules\@biomejs\cli-win32-x64\biome.exe check <files>

# When no other package installation is running
pnpm run check:anti-slop
pnpm --filter @repo/ui check-types
```

The exact Biome store path is environment-specific; discover it rather than hardcoding a new version. Do not use `pnpm exec` while another package install is active because it can spawn an unwanted dependency verification install.

## Prioritized next slices

### 1. Workspace role dispatcher: P0

**Look at:** `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx`, its web counterpart, workspace route tests, and `@repo/ui/state/screenState`.

Replace `state: any` and the incomplete role resolution with a typed state machine that renders loading, denied, retryable failure, empty, and role-ready paths. Preserve existing content during background refresh. Validate direct route entry, retry, and platform-specific layout. This is the highest user-visible state integrity gap from the audit.

### 2. Web navigation semantics: P1

**Look at:** `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx` and mobile `_layout.tsx`.

Make tab navigation semantic/idempotent on web, keyboard reachable, and discoverable at compact width. Preserve bottom tabs, safe areas, and non-growing history on mobile. Add browser-level coverage rather than only source assertions.

### 3. Workspace personalization/reorder failure: P1

**Look at:** `packages/ui/src/components/workspace/`, `packages/classroom/src/screens/ClassroomWorkspaceCanvas.tsx`, layout sync, and `reorderClassroomSurface.test.ts`.

Use a dedicated drag handle. Ensure native long-press activation provides visible/haptic confirmation and that web supports pointer, keyboard, announcements, focus restoration, and a save-failure rollback. Device-test persistence, offline queue, rejected write, reset, and reconnect before promising customization.

### 4. Community mutation and reconnection completion: P1

**Look at:** `packages/community/src/screens/CommunityScreen.*`, `BaseChatScreen.tsx`, `DirectMessagesListScreen.tsx`, and the existing ownership/delivery tests.

The direct-message request owner, visible retry, queued send acknowledgement, and draft restoration were improved already. Missing proof: server reconciliation/idempotency, likes and supporting mutation feedback, haptics, and mounted/native reconnect behavior. Keep cached messages visible through refresh/failure.

### 5. Profile save transaction: P1

**Look at:** `packages/profile/src/screens/ProfileScreen.web.tsx`, native profile screen, and `profileSaveRecovery.test.ts`.

Partial sequential saves are disclosed correctly but are not the desired end state. Prefer a supported batched/transactional server mutation. If unavailable, preserve the current explicit partial-save/retry experience and add mounted coverage.

### 6. Legacy native modernization: planned, not opportunistic

**Look at:** `TemporalScrubber.tsx`, `AstroView.tsx`, and `packages/core/src/hooks/useAppLifecycle.ts`.

Migrate PanResponder/JS-thread animation, deprecated gesture builders, and `InteractionManager` only as separately tested vertical slices. Do not bump Expo/RN, RNGH, Reanimated, Worklets, MMKV, Nitro, or Skia in a UI task. Sacred version and upgrade rules are in `AGENTS.md`.

## Common traps and lessons

- **Passing tests are not a UX sign-off.** The focused Firefly tests prove state mapping, rendered recovery framing, and accessible loader semantics—not device animation quality, contrast in sunlight, or real network behavior.
- **Empty is not a failure fallback.** Invalid routes, failed queries, permission denial, and offline are actionable interruption states. Empty means a successful query with no meaningful content.
- **A visual provider is not a settings feature.** `MascotProvider` is the approved seam for now. Do not expose a mascot selector until more than one tested, approved renderer and asset policy exists.
- **Do not make mascot assets the sole status signal.** Keep title, message, `progressbar`/alert semantics, and controls accessible.
- **Subtle animation must not mutate semantic state.** The `subtle` empty state remains `empty`; it may never be implemented by changing it to `loading`.
- **Avoid broad barrel edits.** `packages/ui/src/components/index.ts` and root entrypoints have pre-existing ordering/format debt. Export a new shared API only when a real caller needs it; otherwise use the explicit subpath.
- **Do not trust package-manager behavior in a dirty workspace.** `pnpm exec` can wait on or spawn dependency verification. Inspect process state first and prefer the project’s already-installed direct runner for narrow checks.
- **Do not reuse forced brand copy.** Let a screen say “You do not have access” when that is the truth. Brand voice lives in the scene, material, and restraint.

## Definition of a good handoff completion

Before marking this experience effort complete, the next agent must produce evidence for every affected vertical slice:

- Mobile and web have intentional, documented differences.
- State matrices and mounted tests cover failure, empty, retry, offline/queued, permission, and background refresh where relevant.
- Gesture/haptic/motion paths have static/accessibility equivalents and real-device validation.
- No user action silently fails, no data outage renders as empty, and no optimistic write lacks visible reconciliation.
- The configured runner discovers the relevant tests; targeted package typecheck/lint/test and anti-slop gates are green or have an explicitly accepted, pre-existing baseline.
- A fresh reviewer reads the diff and test changes independently of the implementation session.

## Handoff note

The next agent should begin by re-reading the worktree, not trusting this document over source. The repository changed concurrently during this work: mascot assets, visual-capability context files, packages, lockfile, API docs, and many screen files are outside this handoff’s ownership. Treat them as user-owned until a diff and authoring context prove otherwise.
