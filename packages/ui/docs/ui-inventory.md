# `@repo/ui` Inventory SSOT

Last validated against code: 2026-04-22

This document is the package-local source of truth for `packages/ui`.

## Hard Gate

- Any UI work that adds, removes, reclassifies, or repurposes a file in `packages/ui` must update this document in the same change.
- A file does not stay alive just because it exists. Active usage plus doctrinal fit is the survival rule.
- `apps/gurudevi-mobile/docs/Core/ui-development-guide.md` governs primitive construction.
- `apps/gurudevi-mobile/docs/Core/design/GURUDEVI_DESIGN_MASTER.md` governs doctrine and design conflict resolution.

## Usage Truth

- Checked consumer roots: `apps/gurudevi-mobile/src` plus `packages/admin|ai|analytics|classroom|community|library|people|profile|scanner-kit|self/src`.
- Active consumer imports are from root `@repo/ui` and a handful of stable component subpaths.
- No active consumer import of `@repo/ui/gluestack` was found in the checked graph on 2026-04-22.
- `src/gluestack/index.tsx` is still used internally inside `packages/ui`; it remains transitional and is on the healing queue.

## Public Export Ledger

### `package.json` exports

| Surface | Current state | Usage | Canonical status | Action | Notes |
| --- | --- | --- | --- | --- | --- |
| `.` | exported | used | canonical | keep | Root public API for primitives, shared components, providers, hooks, screens, and utilities. |
| `./components/SanctuaryButton` | exported | unknown-unverified | canonical | keep | Stable targeted component subpath. |
| `./components/SanctuaryInput` | exported | unknown-unverified | canonical | keep | Stable targeted component subpath. |
| `./components/QRCodeGenerator` | exported | unknown-unverified | canonical | keep | Stable targeted component subpath. |
| `./screens` | exported | unknown-unverified | canonical | keep | Screen bundle export. |
| `./screens/AppSettingsScreen` | exported | unknown-unverified | canonical | keep | Stable screen subpath. |
| `./screens/AppSettingsScreen.web` | exported | unknown-unverified | canonical | keep | Stable screen subpath. |
| `./screens/NotificationsScreen.web` | exported | unknown-unverified | canonical | keep | Stable screen subpath. |
| `./native` | exported | unknown-unverified | canonical | keep | Native-only doctrine surface. |
| `./svelte/*` | exported | unknown-unverified | canonical | keep | Svelte support surface. |
| `./package.json` | exported | unknown-unverified | canonical | keep | Package metadata surface. |
| `./gluestack` | removed in this change | no active consumer usage found | non-canonical | export-prune | Public bridge removed; root canonical exports now carry the primitive surface. |

### `src/index.ts` root surface

- Canonical primitive exports now come directly from `src/components/ui/*`, not via `src/gluestack/index.tsx`.
- `GluestackUIProvider`, `createConfig`, and `gluestackConfig` are still exposed from the root for compatibility, but are defined on the canonical root path rather than re-exported from the bridge.
- Root exports remain the preferred import path for app and package consumers.

## Healing Ledger

### Completed in this change

- Pruned the public `./gluestack` package export because no active consumer import was found in the checked graph.
- Replaced the root `src/index.ts` bridge re-export with direct canonical primitive exports from `src/components/ui/*`.
- Moved these actively used shared components off the internal bridge:
  - `src/components/SanctuaryButton.tsx`
  - `src/components/SanctuaryInput.tsx`
  - `src/components/ScreenWrapper.tsx`
- Added `src/components/ui/index.ts` so package-internal healing can import canonical primitives without routing back through `src/gluestack/index.tsx`.
- Replaced the raw placeholder hex in `src/components/SanctuaryInput.tsx` with a token-backed theme color.

### Next healing queue

- Continue replacing package-internal imports of `src/gluestack/index.tsx` inside `src/components/*`, `src/components/workspace/*`, `src/context/*`, and `src/screens/*` with direct canonical primitive imports.
- Keep `src/components-legacy/*` and `src/gluestack-legacy/index.ts` documented but non-canonical until a later delete pass.

## Exhaustive File Ledger

| Path | Category | Current usage | Canonical status | Action | Owner / notes |
| --- | --- | --- | --- | --- | --- |
| `src/__tests__/useTheme.test.js` | utility | unknown-unverified | canonical | keep | Record in SSOT; validate on demand. |
| `src/archive/LotusPetalFAB.complex.tsx` | archive | unknown-unverified | archive-only | keep | Archive material; keep out of active runtime decisions. |
| `src/button.tsx` | utility | unknown-unverified | canonical | keep | Record in SSOT; validate on demand. |
| `src/card.tsx` | utility | unknown-unverified | canonical | keep | Record in SSOT; validate on demand. |
| `src/code.tsx` | utility | unknown-unverified | canonical | keep | Record in SSOT; validate on demand. |
| `src/components/AccountPinModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/AchievementUnlockOverlay.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/AdaptiveLayout.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/BreathAnimation.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/BreathingLoader.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/CapabilityGuard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/CitizenGate.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/CollectionCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/DailyResonanceCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/debug/FeatureOverridesPanel.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/DeleteAccountModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/DeviceAccountManager.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/EmptyState.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/EntityModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/EntityModal.web.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/EntityView.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/EnvironmentGuard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/ErrorBoundary.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/ErrorMessage.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/FeatureDiscoveryModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/FeatureInfoIcon.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/FounderGlow.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/GlassCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/GlobalHeader.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/GuestDataSyncModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/HistoryTimeline.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/HorizontalChipRow.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/IdentityCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/index.ts` | shared component | used | canonical | keep | Shared component layer; exported as root API. |
| `src/components/InternalBrowser.tsx` | shared component | used | canonical | keep | Sandboxed internal browser (Decision 11); implements react-native-webview. |
| `src/components/InternalBrowser.web.tsx` | shared component | used | canonical | keep | Web implementation of sandboxed browser using iframe. |
| `src/components/InteractiveRadarChart.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/JourneyHistoryCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/LivingGlow.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/LoadingOverlay.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/LogoutModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/LotusDropdown.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/LotusLoader.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/LotusPetalFAB.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/NetworkStatusBanner.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/NotificationDrawer.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/PositiveInvitation.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/ProgressIndicator.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/QRCodeGenerator.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/ResonantHeatmap.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryBackground.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryButton.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; actively healed to canonical primitive imports in this change. |
| `src/components/SanctuaryCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryCarousel.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryChip.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryFlashList.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryFlashList.web.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryGlobalStyles.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryInput.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; actively healed to canonical primitive imports in this change. |
| `src/components/SanctuaryModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryModal.web.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryNudge.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryProgressBar.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryStatsCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SanctuaryToast.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SandboxBanner.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/ScreenWrapper.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; actively healed to canonical primitive imports in this change. |
| `src/components/ScreenWrapper.web.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SkeletonLoader.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/SmartShelf.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/StepIndicator.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/TemporalNavigator.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/TemporalPilot.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/TemporalProvider.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/TemporalProvider.web.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/TemporalScrubber.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/TemporalShield.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/ui/actionsheet/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/avatar/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/badge/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/box/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/button/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/center/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/checkbox/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/divider/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/fab/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/form-control/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/hstack/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/icon/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/image/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/image-background/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/index.ts` | doctrine primitive | used | canonical | keep | Package-internal canonical barrel added in this change to accelerate bridge healing. |
| `src/components/ui/input/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/linear-gradient/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/link/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/list/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/modal/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/overlay/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/portal/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/pressable/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/progress/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/radio/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/scroll-view/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/select/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/slider/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/spinner/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/switch/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/text/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/textarea/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/text-input/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/toast/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/view/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/ui/vstack/index.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Guided by ui-development-guide.md; canonical primitive surface. |
| `src/components/UniversalModal.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/UniversalModal.web.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/UserAvatar.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/WebScreenHeader.web.tsx` | shared component | unknown-unverified | canonical | keep | Shared component layer; several files still import the internal gluestack bridge and must be healed over time. |
| `src/components/workspace/CanvasSurfaceCard.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/CanvasZoneColumn.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/index.ts` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/renderers/index.ts` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/renderers/MobileWorkspaceCanvas.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/renderers/TabletWorkspaceCanvas.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/renderers/WebWorkspaceCanvas.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/ResponsiveWorkspaceCanvas.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/shared.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/types.ts` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components/workspace/WorkspaceCanvas.tsx` | shared component | unknown-unverified | canonical | keep | Shared workspace composition; consumer packages depend on root exports. |
| `src/components-legacy/box/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/button/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/center/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/divider/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/form-control/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/hstack/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/image/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/input/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/modal/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/overlay/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/portal/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/text/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/view/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-legacy/vstack/index.tsx` | legacy | unused | non-canonical | delete-candidate | Old v1/v2 compatibility primitives; record only, do not revive. |
| `src/components-native/index.ts` | doctrine primitive | unknown-unverified | canonical | keep | Native-only doctrine surface; Gurudevi design master governs material depth. |
| `src/components-native/LivingCard.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Native-only doctrine surface; Gurudevi design master governs material depth. |
| `src/components-native/LivingCard.web.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Native-only doctrine surface; Gurudevi design master governs material depth. |
| `src/components-native/NoiseOverlay.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Native-only doctrine surface; Gurudevi design master governs material depth. |
| `src/components-native/NoiseOverlay.web.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Native-only doctrine surface; Gurudevi design master governs material depth. |
| `src/components-native/TemporalGlass.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Native-only doctrine surface; Gurudevi design master governs material depth. |
| `src/components-native/TemporalGlass.web.tsx` | doctrine primitive | unknown-unverified | canonical | keep | Native-only doctrine surface; Gurudevi design master governs material depth. |
| `src/context/CircadianProvider.tsx` | provider/context/hook | unknown-unverified | canonical | keep | Package state/context surface; keep aligned with root exports. |
| `src/context/EnvironmentContext.tsx` | provider/context/hook | unknown-unverified | canonical | keep | Package state/context surface; keep aligned with root exports. |
| `src/context/ExternalLinkContext.tsx` | provider/context/hook | unknown-unverified | canonical | keep | Package state/context surface; keep aligned with root exports. |
| `src/context/FABContext.tsx` | provider/context/hook | unknown-unverified | canonical | keep | Package state/context surface; keep aligned with root exports. |
| `src/context/index.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package state/context surface; keep aligned with root exports. |
| `src/context/types.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package state/context surface; keep aligned with root exports. |
| `src/context/utils.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package state/context surface; keep aligned with root exports. |
| `src/declarations.d.ts` | utility | unknown-unverified | canonical | keep | Record in SSOT; validate on demand. |
| `src/global.css` | utility | unknown-unverified | canonical | keep | Record in SSOT; validate on demand. |
| `src/gluestack/index.tsx` | bridge/export | used | transitional | heal | Internal bridge currently used inside packages/ui; public subpath pruned in this migration. |
| `src/gluestack-legacy/index.ts` | legacy | unused | non-canonical | delete-candidate | Old compatibility bridge; record only, do not revive. |
| `src/hooks/index.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package hook surface; keep aligned with root exports. |
| `src/hooks/useAccessibility.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package hook surface; keep aligned with root exports. |
| `src/hooks/useDemoBridge.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package hook surface; keep aligned with root exports. |
| `src/hooks/useResponsive.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package hook surface; keep aligned with root exports. |
| `src/hooks/useTheme.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package hook surface; keep aligned with root exports. |
| `src/hooks/useThemedColors.ts` | provider/context/hook | unknown-unverified | canonical | keep | Package hook surface; keep aligned with root exports. |
| `src/index.ts` | utility | used | canonical | keep | Canonical root export surface. |
| `src/providers/FeatureProvider.tsx` | provider/context/hook | unknown-unverified | canonical | keep | Package provider surface; keep aligned with root exports. |
| `src/providers/SanctuaryProvider.tsx` | provider/context/hook | unknown-unverified | canonical | keep | Package provider surface; keep aligned with root exports. |
| `src/providers/ToastProvider.tsx` | provider/context/hook | unknown-unverified | canonical | keep | Package provider surface; keep aligned with root exports. |
| `src/qr/index.ts` | shared component | unknown-unverified | canonical | keep | QR-specific shared surface used by scanner workflows. |
| `src/qr/QRShareButton.tsx` | shared component | unknown-unverified | canonical | keep | QR-specific shared surface used by scanner workflows. |
| `src/screens/AppSettingsScreen.bridge.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/AppSettingsScreen.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/AppSettingsScreen.web.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/AuthScreen.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/AuthScreen.web.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/ErrorMessageDemo.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/index.ts` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/NotificationsScreen.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/NotificationsScreen.web.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/OnboardingScreen.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/OnboardingScreen.web.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/OnboardingWrapper.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/WelcomeScreen.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/WelcomeScreen.web.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/screens/WorkspaceCanvasDemo.tsx` | screen | unknown-unverified | canonical | keep | Package-owned screens; not part of primitive doctrine. |
| `src/svelte/SvelteForm.svelte` | shared component | unknown-unverified | canonical | keep | Svelte support surface; keep until usage is re-audited. |
| `src/theme/Theme.ts` | doctrine primitive | unknown-unverified | canonical | keep | Implementation truth for tokens and theme resolution. |
| `src/types/apca-w3.d.ts` | utility | unknown-unverified | canonical | keep | Ambient/type support. |
| `src/types/culori.d.ts` | utility | unknown-unverified | canonical | keep | Ambient/type support. |
| `src/types/fab.ts` | utility | unknown-unverified | canonical | keep | Ambient/type support. |
| `src/types/modules.d.ts` | utility | unknown-unverified | canonical | keep | Ambient/type support. |
| `src/utils/__tests__/AccessibilityAudit.test.js` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/a11yUtils.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/colorUtils.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/dateTimeUtils.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/DeviceUtils.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/haptics.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/haptics.web.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/linking.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/SanctuaryLocation.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/SanctuaryLocation.web.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/stringUtils.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
| `src/utils/themeColors.ts` | utility | unknown-unverified | canonical | keep | Shared utility surface; keep unless import graph proves dead. |
