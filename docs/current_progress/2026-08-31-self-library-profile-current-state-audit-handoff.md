# Self, Library, and Profile — current-state audit and successor handoff

**Date:** 2026-08-31  
**Status:** read-only audit of a shared, highly dirty worktree.  
**Scope:** the live Expo Router entries and the Self, Library, and Profile packages only.  
**Purpose:** give the next implementer a safe, evidence-based sequence without treating historical plans or passing source checks as production sign-off.

## Read before changing anything

1. Read repository-root `AGENTS.md`. Do not run `expo install --fix`, `expo install --check`, or `expo prebuild --clean`; do not touch generated `android/` / `ios/`, dependencies, or the lockfile for these slices.
2. Read [the Sanctuary handoff](2026-08-31-sanctuary-experience-firefly-handoff.md), [the delivery plan](2026-08-29-sanctuary-experience-delivery-plan.md), [the parity audit](../architecture/2026-08-29-sanctuary-experience-parity-audit.md), and [the Firefly feedback specification](../architecture/firefly-feedback-system.md).
3. This document is the current evidence snapshot. The older plan/audit describe useful intent, but several claims now differ from live code (notably the Resource Hub invalid-route presentation).
4. Keep a change to one domain and its direct tests. The other active agents own Workspace and Community. Do not edit `packages/ui`, tabs/layouts, package manifests, lockfiles, shared feedback primitives, or `scripts/check-sanctuary-experience-contract.mjs` while implementing one of these slices unless the coordinator explicitly assigns that shared boundary.

## Route and ownership map

| Domain | Live tab route | Mobile implementation | Web implementation | State owner / boundary |
| --- | --- | --- | --- | --- |
| Self | `apps/gurudevi-mobile/app/(tabs)/self/index.tsx` | `packages/self/src/screens/SelfScreen.tsx` | `packages/self/src/screens/SelfScreen.web.tsx` | feature flag and permissions choose legacy vs unified; unified preferences are `useSelfCanvasStore` |
| Library | `apps/gurudevi-mobile/app/(tabs)/library/index.tsx` | `packages/library/src/screens/LibraryScreen.tsx` | `packages/library/src/screens/LibraryScreen.web.tsx` | `useLibrary`, React Query, local knowledge sync, screen reducer; Resource Hub is `app/(tabs)/library/resource/[resourceId].tsx` → `ResourceHubScreen.tsx` |
| Profile | `apps/gurudevi-mobile/app/(tabs)/profile/index.tsx` | `packages/profile/src/screens/ProfileScreen.tsx` | `packages/profile/src/screens/ProfileScreen.web.tsx` | `useProfile` reducer plus mutation queue; native and web use separate screen components selected by the route |

## Evidence collected now

The following commands were executed against the current dirty worktree on 2026-08-31:

```text
pnpm --filter @repo/self exec vitest run \
  src/features/featureResolver.zoneOverrides.test.ts \
  src/screens/self/roleResolution.test.ts
# 2 files, 6 assertions passed

pnpm --filter @repo/library exec vitest run
# 2 files, 11 assertions passed

pnpm --filter @repo/profile exec vitest run src/screens/profileSaveRecovery.test.ts
# 1 file, 2 assertions passed
```

These runs establish that each configured Vitest runner discovers these current tests. They do **not** mount a route, simulate a rejected mutation, demonstrate a browser/physical-device gesture, or prove accessibility feedback. The Profile test is source-text based; the Library suite contains utility tests rather than Library screen-state coverage.

No broad typecheck, lint, anti-slop run, browser test, or device test was run for this read-only audit. Existing working-tree changes are not attributed to this audit.

## Current findings, separated from historical claims

## Accepted repairs after this audit

The following corrections were implemented and independently reviewed after the
read-only snapshot. The remaining risks below exclude these repaired items.

- **Self:** the unified screen recomputes when `zoneOverrides` changes, and
  custom order resolves only from visible features. Hidden or inaccessible
  features cannot reappear. Focused Self tests: 2 files, 7 assertions passed.
- **Library:** resource-page failures now reject into React Query rather than
  becoming `[]`. The removed “offline fallback” had no real resource hydrator:
  `getResourcesByIds` is not implemented, while the local index is only search
  metadata and cannot safely render `LibraryResource` cards. Genuine empty
  results remain empty; failed requests reach established error paths.
- **Profile:** field updates now return `confirmed`, `queued`, or `failed`.
  Queued writes no longer get success haptics/refresh or masquerade as server
  confirmation; the web editor retains queued fields for a real retry.
- **Resource Hub:** an absent resource id renders the shared recoverable error
  treatment with Back to Library, not an empty state.
- **Self customization:** local-first mutations now expose `saving`, `queued`,
  `localError`, and `synced` state. A queued remote write is visibly described
  as a device save that still needs connection, while a failed device write is
  not mislabeled as saved; both have an explicit Retry action. The store retains
  the newest pending write when an older request resolves. Focused persistence
  tests cover the user-visible states and immediate local-first transition.
- **Self native controls:** the copy now names the available reorder/pin/hide
  controls rather than promising a missing long-press gesture; those controls
  provide light haptic feedback. The outer card no longer claims to be a button
  when only its child controls are actionable.
- **Self web drag affordance:** each sortable card now owns a dedicated,
  keyboard-accessible reorder handle. Pin, Hide, and Open no longer share the
  pointer sensor, and the Sanctuary contract prevents a return to card-wide
  dragging.
- **Self access empty state:** a fully resolved account with no accessible
  spaces now receives an explicit Firefly empty state and a safe “Check again”
  action instead of an empty customization shell. The access-policy suite now
  explicitly covers the zero-capability result. Latest focused Self verification:
  4 test files, 11 assertions passed.
- **Library native action recovery:** bookmark, collection, refresh, share/link,
  and collection-creation failures now produce visible toast feedback with
  error haptics; successful bookmark/collection mutations provide success
  haptics. The Sanctuary contract now rejects a return to console-only native
  bookmark, collection, or refresh failure handling.
- **Library web link recovery:** external-resource and link-options failures now
  show an in-context toast rather than logging only. The Sanctuary contract
  protects that browser-specific feedback path as well.
- **Library public fallback recovery:** native failure to load public fallback
  collections is now a non-blocking, accessible warning with Retry—not an
  indistinguishable “No collections yet” result. The Sanctuary contract guards
  that distinction.
- **Profile fetch recovery:** the former HMR-specific exception now resolves the
  fetch state as an ordinary visible error; it cannot leave the profile’s
  initial loader active indefinitely. A reducer test covers that transition.
- **Profile web save contract:** the web editor now consumes the real
  `confirmed | queued | failed` field-update union. Confirmed writes clear a
  queued marker, queued writes remain in the edit flow for retry, and failures
  stop the sequence with the partial-save disclosure intact.
- **Profile avatar recovery:** a web avatar-upload failure now reaches the
  existing assertive profile error region with a retry-oriented message instead
  of failing silently after image selection.
- **Profile capacity boundary:** Profile web now passes the typed active capacity
  directly into completion and journey presentation, removing the two local
  `any` casts that could hide an invalid authority value.
- **Profile school boundary:** profile hydration now reads only the documented
  `school_name` / `organization_name` fields and no longer casts the fetched
  record to an untyped nested-school shape.
- **Profile native capacity boundary:** native Profile completion now validates
  a raw permission string against the declared capacity union before it reaches
  role-specific UI. The pure adapter has a focused test for valid and unknown
  capacities.

### Self

**Confirmed working seam**

- The Self tab forwards to `SelfScreen`; native and web choose `SelfScreen.unified.tsx` behind `canvas.self.unified`, otherwise resolve a legacy role view.
- `setZone` persists an override in `selfCanvasStore.ts`, and `featureResolver.zoneOverrides.test.ts` proves the resolver honors an override.
- The unified screen has a loading state and a permission-resolution error with retry (`SelfScreen.unified.tsx:127-155`).

**Current production risks**

- The flag and permission context are repeatedly coerced at public boundaries: `SelfScreen.tsx:31-35`, `SelfScreen.web.tsx:30-34`, and `SelfScreen.unified.tsx:35,65,73,83,95,97,109,190,200`. This contradicts the repository’s no-`any` / no-double-cast direction and prevents an honest capability-state contract.
- `selfCanvasStore.ts` still has no conflict-resolution policy for a server-side
  preference update and retains erased casts at the Supabase boundary. The new
  status reports local versus remote confirmation accurately; it does not make
  the latest-write-wins policy safe across multiple devices.
- Web `SelfCanvas.web.tsx` now uses a typed Self-specific sortable card with an
  explicit handle; the former dnd-kit import suppressions have been removed.
- A resolved no-access account now has an explicit recovery state. It remains a
  permission/access configuration outcome, not an offline/error diagnosis;
  route-level tests should still demonstrate the visual state with the unified
  feature flag enabled.

### Library

**Confirmed working seam**

- Web `LibraryScreen.web.tsx` now has a blocking error boundary based on `resolveBlockingScreenState`, with retry (`:395-399`, `:1006-1019`), plus a non-blocking sync warning with retry (`:1029-1045`). This is materially newer than the earlier audit’s web-error finding.
- Native main loading/error paths exist (`LibraryScreen.tsx:1210-1230`). Resource Hub distinguishes loading and resource-load error/offline states with Back and Retry (`ResourceHubScreen.tsx:327-366`).
- Web optimistic bookmark failure rolls its local state back and shows an error toast (`LibraryScreen.web.tsx:535-585`).

**Current production risks**

- Native and web public-collection fallback failures now have visible retryable
  states. The contract guards both implementations against a return to a false
  empty result.
- Native bookmark, add-to-collection, refresh, collection-creation, and
  external-link/share failures now have visible toast feedback paired with
  appropriate error haptics. Web external-link and link-options failures now
  use visible toast feedback. Every externally visible mutation still needs
  pending, success/failure, and reconciliation—not only logs.
- **Resolved after this audit:** a missing `resourceId` now renders `BrandedErrorState` with a Back to Library recovery action. Keep the Sanctuary contract guard intact; invalid navigation is not an empty collection.
- Screen tests do not cover empty, error, offline, retry, route-invalid, mutation rollback, or web keyboard/pointer affordances. The 11 passing Library assertions are not evidence for those paths.

### Profile

**Confirmed working seam**

- Native profile has distinct initial loading, blocking error/retry, stale-data refresh failure/retry, logout failure toast + haptic, and deletion failure visible feedback (`ProfileScreen.tsx:383-518`). Haptics are additive to a visible result in the observed logout/delete paths.
- Web has initial loading, blocking error/retry, empty profile treatment, copy failure disclosure, and a sequential field-save disclosure that names fields already persisted before a later failure (`ProfileScreen.web.tsx:76-140`, `:168-224`, `:590-615`). The 2 passing profile assertions only guard text/source presence for that partial-save and clipboard treatment.

**Current production risks**

- Web saving is still a sequence of independent mutations (`ProfileScreen.web.tsx`), not one transactional/batched update. A partial outcome is disclosed but not atomically recoverable. The screen now consumes the confirmed/queued/failed result union directly and retains queued fields for retry, but a supported batched server mutation remains the preferred end state.
- Profile fetch failures—including a development runtime/HMR failure—now settle
  the reducer with `loading: false` and a visible error. The reducer test covers
  this terminal transition; mounted profile-screen retry coverage remains due.
- Profile screens and hook retain significant unsafe boundary types: `completionResult: any`, profile/context casts in `ProfileScreen.tsx:73,95,104,344`; `authority as any` in `ProfileScreen.web.tsx:51`; and multiple `any` values in `useProfile.ts`. These obscure field-update, permission, and async result contracts.
- `ProfileScreen.web.tsx` renders a manual state-card rather than the shared Firefly feedback primitives in its blocking error/empty paths (`:198-224`). This is a design migration candidate, but it must be coordinated with the shared-feedback owner—do not edit `@repo/ui` to solve it in the Profile slice.
- There is no mounted test for focus placement in the web edit dialog,
  disabled/double-save behavior, queued-offline completion, logout/delete
  failure, or native haptic-plus-visible-feedback behavior. Avatar failure now
  has a narrow screen-contract test, but still needs a mounted interaction test.

## Prioritized implementation slices

### Remaining P0 — demonstrate the repaired paths in real screens

| Domain | Slice and files | Completion evidence |
| --- | --- | --- |
| Self | Define typed capability/context adapters and add mounted flag-on/flag-off coverage for the now-correct resolver. Start at `screens/SelfScreen.tsx`, `SelfScreen.web.tsx`, and `SelfScreen.unified.tsx`; add a zero-feature empty state. | Route/component test covers legacy flag-off, flag-on loading, permission retry, persisted zone change, and zero accessible features; package typecheck. |
| Library | Mount the existing screen error paths against rejected resource-page queries on native and web. Then repair public-fallback failures without returning fabricated content. | Screen tests distinguish genuine empty, rejected/offline query, retry, and invalid route; package typecheck. |
| Profile | Decide whether the API can provide a batched update. If it cannot, make the confirmed/queued/failed result visible and test retry/focus/disabled-save behavior in a mounted web screen. | Tests cover no-op, all-confirmed, queued, partial failure, retry of remaining fields, and request exception; mounted web test validates alert/focus and disabled save; package typecheck. |

### P1 — after P0 behavior is demonstrated

| Domain | Slice and files | Completion evidence |
| --- | --- | --- |
| Self | Validate the new native/web customization affordances on real devices/browsers, then document conflict behavior for the now-visible local-first sync. `components/SelfCanvas.tsx`, `SelfCanvas.web.tsx`, `features/selfCanvasStore.ts`. | Native/device and web keyboard/pointer tests; rejected-write/reconnect test; accessible announcement and focus-restoration evidence. |
| Library | Normalize bookmarked/add-to-collection/refresh/open-link outcomes and public-fallback errors. `screens/LibraryScreen.tsx`, `.web.tsx`, `hooks/useLibrary.ts`. | Pending/success/failure/rollback tests; no console-only user-triggered failure path; browser/mobile manual matrix. |
| Profile | Replace manual blocking feedback with the already-approved shared primitive only through the shared-feedback ownership boundary; remove public-boundary type escapes; add avatar/logout/delete failure contracts. `screens/ProfileScreen.tsx`, `.web.tsx`, `hooks/useProfile.ts`. | Semantic state tests, keyboard/dialog test on web, native visible+audible/haptic feedback test, typecheck. |

## Safe implementation and testing sequence

1. Before editing, inspect `git status --short` and `git diff -- <assigned files>`. Do not discard existing edits. If another active change overlaps an assigned file, send the coordinator the exact file/line conflict and pick a different P0 slice.
2. Read the current source listed in the table above and the direct tests. Add a failing behavioral test before changing a state machine; source-string tests may remain as a narrow guard but are not proof of UX.
3. Keep the state adapter/hook pure and typed. The screen consumes a named union such as loading / content / empty / offline / error / queued rather than inferring error from `items.length === 0`.
4. Make the smallest domain-local implementation. Do not add a package or alter shared Firefly rendering to work around an application state bug.
5. Test the negative path first: rejected request, invalid route, offline/queued write, retry, and stale content. Test both platform implementations when the route has `.web.tsx` and native variants.
6. Run the package’s real runner (`pnpm --filter @repo/self|@repo/library|@repo/profile test`) plus `check-types` and the relevant scoped lint. Then run the root Sanctuary contract and anti-slop only when no competing package installation is active. Report any inherited UI-wide typecheck failures separately; never claim them as passed by implication.
7. Require browser/device sign-off for gestures, focus, reduced motion, safe areas, and haptics. Package tests and source contracts cannot replace this.

## Ownership and conflict boundaries

- **Workspace agent:** owns `apps/gurudevi-mobile/app/(tabs)/workspace/**` and its new route-resolution work. Do not change the workspace dispatcher or its tests from these slices.
- **Community agent:** owns Community recovery/mutation work. Do not modify Community imports, routes, or tests.
- **Shared feedback owner/coordinator:** owns `packages/ui` feedback scenes/loaders and `scripts/check-sanctuary-experience-contract.mjs`. Consume the published `BrandPulse`, `BrandedEmptyState`, and `BrandedErrorState` APIs; request a coordinated change instead of changing the shared component internally.
- **API/core owner:** owns API contracts and generic offline/mutation-queue semantics. A transactional Profile mutation or Library error-shape change needs a narrow contract discussion before touching `apps/sanctuary-api` or `packages/core`.
- **Navigation shell owner:** owns tab layout and URL semantics. Domain agents may consume route params but should not modify `app/(tabs)/_layout*.tsx`.

## Definition of safe handoff completion for one slice

- The code has a typed state model and a user-visible recovery path; no outage is relabeled as empty.
- The existing dirty worktree is preserved, with only assigned-domain files changed.
- Tests assert user-observable success and failure transitions; they are discovered by the package’s configured runner.
- `check-types`, scoped lint, and anti-slop are reported with their actual outcomes; failed inherited checks are named, not hidden.
- A human/device or browser pass verifies platform affordances before rollout. Feature flags retain a tested off path and a rollback path.
