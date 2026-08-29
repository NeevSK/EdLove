# Source-owned NativeWind UI roadmap

This roadmap turns the source-owned NativeWind UI decision into an incremental
workspace plan. It deliberately keeps one UI system: shadcn and React Native
Reusables are references for APIs and patterns, not additional runtime layers.

## Success criteria

- New reusable UI has one discoverable home in `@repo/ui`.
- Components use owned primitives, semantic tokens, and NativeWind state styles.
- Native and web behavior is explicit at the adapter boundary.
- Accessibility, loading, error, and reduced-motion behavior are tested.
- Third-party dependencies solve behavior gaps rather than introduce competing
  styling or theme systems.
- Existing product packages can migrate without a flag-day rewrite.

## Phases

### Phase 0 — establish governance (now)

Deliverables:

- architecture decision and component-layer rules;
- shared `cn` composition helper;
- source-owned `Dialog` API backed by the existing modal behavior;
- component inventory and ownership metadata;
- focused tests for the shared helper and public Dialog contract.

Exit gate: the package has a clear place for a new component and the first
source-owned component passes typecheck, lint, and focused tests.

### Phase 1 — stabilize the foundation

Deliverables:

- document semantic token names and their NativeWind mappings;
- standardize component props: `variant`, `size`, `disabled`, `loading`,
  `className`, and slot class names where applicable;
- remove new hard-coded colors from reusable UI;
- add test fixtures covering light/dark, temporal themes, web, and native;
- identify the gluestack compatibility surface and stop expanding it.

Exit gate: Button, Input, Dialog, Modal, Toast, and state components have a
consistent API and no new styling system is required to build a component.

### Phase 2 — high-leverage interaction components

Implement source-owned or carefully adapted versions of:

1. Sheet / bottom sheet
2. Tabs
3. Popover and Command
4. Select and Combobox
5. FormField and validation states
6. Date and time picker adapters

Each component must state its platform behavior, portal strategy, accessibility
contract, and failure/loading behavior before implementation.

### Phase 3 — native capability adapters

Use `@expo/ui` selectively for native-feeling menus, pickers, bottom sheets, and
platform controls. Keep those implementations behind `@repo/ui/adapters` and
provide a branded cross-platform fallback when the native surface is not
available. Do not make Expo UI the styling foundation.

### Phase 4 — migration and consolidation

- migrate consumers from direct gluestack imports to `@repo/ui` façades;
- move branded feedback and Sanctuary-specific surfaces into `components/brand`;
- move reusable workflow compositions into `components/patterns`;
- retire compatibility code only after consumer search and focused tests prove
  it is unused.

### Phase 5 — developer experience and visual quality

- add a component inventory/showcase screen;
- add visual snapshots or equivalent deterministic preview coverage;
- add an internal `ui` inspection/scaffolding command if repeated manual work
  justifies it;
- publish component usage, accessibility, and migration notes alongside source.

## Dependency rules

Prefer existing workspace primitives. Add a dependency only when it supplies
behavior that would be expensive or unsafe to recreate. Before adding one,
record its platform coverage, portal/focus behavior, styling escape hatches,
maintenance status, bundle impact, and adapter owner.

Never add a second general-purpose component library beside `@repo/ui`.

## Current implementation status

- Phase 0 architecture document: complete.
- Phase 0 `cn` helper: complete.
- Phase 0 Dialog façade: complete.
- Phase 0 inventory metadata and focused helper/Dialog tests: complete.
- Phase 1 Button disabled contract and semantic token contract: in progress.
- Phase 1 class composition adopted by Button, Input, Modal, and Toast: complete.
- Phase 1 reusable modal/overlay palette literals removed: complete.
- Phase 2 controlled Tabs foundation: complete.
- Phase 2 controlled Sheet façade: complete.
- Phase 2 Sheet behavior aligned with shared class/disabled contracts: complete.
- Phase 2 source-owned Command foundation: complete.
- Phase 2 source-owned Popover foundation: complete.
- Phase 2 Select class/token consolidation: complete.
- Phase 2 source-owned Combobox composition: complete.
- Phase 2 Combobox contract test: complete.
- Phase 2 FormControl class composition and labelled input support: complete.
- Phase 2 FormControl propagation regression test: complete.
- Phase 2 FormField compound contract and regression tests: complete.
- Phase 5 development-only component showcase route: complete.
- Phase 4 reference/consumer migrations (including `ErrorMessageDemo`, `WorkspaceCanvasDemo`, `OnboardingScreen`, `AuthScreen`, `ExternalLinkContext`, `ErrorMessage`, `LoadingOverlay`, `ErrorBoundary`, `ProgressIndicator`, `SanctuaryStatsCard`, `SanctuaryProgressBar`, `SanctuaryCard`, `HeroBanner`, `DailyResonanceCard`, `StepIndicator`, `NetworkStatusBanner`, `LivingGlow`, `CollectionCard`, `DeviceSecurityCenter`, `DeviceAccountManager`, `SanctuaryButton`, `LogoutModal`, `AchievementUnlockOverlay`, `FeatureDiscoveryModal`, `SanctuaryModal`, `AccountPinModal`, `DeleteAccountModal`, `EntityView`, `IdentityCard`, `GlobalHeader` native/web, `ConversationSheet`, `SandboxBanner`, `LotusLoader`, `LotusPetalFAB`, `TemporalNavigator`, `TemporalScrubber`, `PositiveInvitation`, `GuestDataSyncModal`, `JourneyHistoryCard`, `ResonantHeatmap`, `EntityModal` native/web, `GlassCard`, `SanctuaryChip`, workspace canvas helpers, `LotusDropdown`, `ResourceActionSheet`, `AssetCollectionPicker`, `NotificationDrawer`, and `SanctuaryModal.web`): complete.
