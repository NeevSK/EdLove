---
title: "UI Component System Rebuild: Integrated Plan"
status: "draft"
created: 2026-10-29
updated: 2026-10-29
author: "Naveen"
scribe: "Claude"
tags: [ui, design-system, worlds, theme, tokens, components, native, web, a11y, migration]
---

# UI Component System Rebuild: Integrated Plan

One plan for the whole UI layer: where things live, how styling works on each
platform, which components we own, and the order in which old code is replaced
and deleted. It replaces the scattered audits listed under Sources.

## 1. Decisions (locked)

| # | Decision |
| :--- | :--- |
| D1 | **Hard break.** No facades, no compatibility re-exports, no aliases. Old code is reference only; what is good in it is rebuilt in the new kit. |
| D2 | **Break the API, not the build.** Every commit compiles and passes its gates. A package moves to the new kit and drops its old imports in the same commit. Legacy is deleted last. |
| D3 | **Canonical names.** `@repo/ui/tokens`, `@repo/ui/theme`, `@repo/ui/components/native`, `@repo/ui/components/web`. No `world/` folder; "world" is only the name of what a person chooses (`WorldId`). |
| D4 | **Two component sets, one contract.** Native and web components have the same names and the same props. Props types live once, in `@repo/ui/theme`. |
| D5 | **Phase styling is retired.** `phaseMatrix`, `--phase-*` variables, `phase-*` classes and `worldBridge` are removed. Time of day is an input that tints the world 0 to 12%. |
| D6 | **Scene is part of theme, with one clock.** The scene resolver (sky, season, weather, landscape) moves from `@repo/core/scene` to `@repo/ui/theme/scene`, and hour to phase is computed once, there. The scene painters become components. |
| D7 | **NativeWind stays on mobile**, for screen layout, with colours only through `w-*` classes. Components style from recipes, not classNames. |
| D8 | **Expo web is dead.** All `*.web.tsx` files go. The only web app is `apps/gurudevi-web` (Next.js). |
| D9 | Work happens on `integrate/worlds-and-upstream`. |

## 2. The mental model

```
@repo/ui/tokens         fixed scales: spacing, radii, sizes, touch targets,
        │               breakpoints, z-index, durations (never change per world)
        ▼
@repo/ui/theme          theme/scene: clock (hour -> phase), sky, season, weather,
        │                 landscape; resolveScene(world, room, budget) -> what to paint
        │               resolveTheme(world, phase, mode) -> tokens + recipes
        │               11 worlds × 2 modes × 6 phases = 132 resolved themes
   ┌────┴─────────────────────────────┐
   ▼                                  ▼
components/native                components/web
recipes -> StyleSheet            recipes -> CSS variables (one sheet, all worlds)
ThemeProvider (context)          <html data-world data-mode data-phase>
   │                                  │
   ▼                                  ▼
mobile screens                   web floors
NativeWind layout + w-* colours  CSS modules for layout + var(--w-*) colours
```

Why components use recipes rather than classNames: recipes carry values a class
cannot express cleanly (per-corner radii, gradient fills, inner frames, glows,
a different face per script for English, Sinhala and Tamil).

## 3. Target layout

```
packages/ui/src/
  tokens/                 @repo/ui/tokens
    index.ts              world-independent scales (from tokens.ts, minus colours)
  theme/                  @repo/ui/theme
    worlds/               one file per world: sanctuary.ts, wewa.ts, kandyan.ts …
    scene/                clock, sky, season, weather, landscape, resolveScene, wash
    types.ts              WorldId, tokens, recipes, and shared component props
    resolve.ts build.ts color.ts motion.ts faces.ts
    css.ts                web: worlds -> one stylesheet of CSS variables
    native.tsx            ThemeProvider, useTheme, ThemeScope (React Native)
    web.tsx               ThemeStyles, ThemeScope (DOM)
  components/
    native/               @repo/ui/components/native   one folder per component
      Button/Button.tsx, Button.test.tsx …
    web/                  @repo/ui/components/web      one folder per component
      Button/Button.tsx, Button.test.tsx …
```

Today's `packages/ui/src/world/*` moves here as follows:

| From | To |
| :--- | :--- |
| `world/types.ts resolve.ts build.ts color.ts motion.ts faces.ts` | `theme/` |
| `world/worlds.ts` (717 lines) | `theme/worlds/*.ts`, one file per world |
| `world/css.ts`, `WorldStyles`, `WorldScope` (dom) | `theme/css.ts`, `theme/web.tsx` |
| `world/native/WorldContext.tsx`, `motion.tsx`, `style.ts` | `theme/native.tsx` (+ `components/native/_style.ts`) |
| `world/native/*` components | `components/native/*/` |
| `world/dom/index.tsx` (397 lines, one file) | `components/web/*/`, one folder per component |
| `world/__tests__/*` | beside the code they test |
| `packages/core/src/scene/*` (sky, landscape, resolveScene + tests) | `theme/scene/` |
| `packages/ui/src/scene/wash.ts` | `theme/scene/` |
| `packages/ui/src/scene/native/*` (SceneBackdrop, SceneStill, SceneWeather, useScene) | `components/native/Scene/` |
| Web scene layers in `apps/gurudevi-web/app/(sanctuary)/components/` (SceneStillLayer, SceneLiveLayer, WorldSceneSvg, WorldGroundSurface) | `components/web/Scene/`, after checking they use nothing app-local |

Rules enforced by a check script:

- `components/web/**` never imports `react-native`, `expo-*` or NativeWind.
- `components/native/**` and `components/web/**` never import each other.
- No file outside the legacy set may import a legacy path (ratchet: the count only goes down).
- `@repo/ui/theme` and `@repo/ui/tokens` import nothing from `components/`.

## 4. The component kit

Same name and same props on both platforms. "Exists" means a world version is in
`packages/ui/src/world/` today.

| Group | Exists (native / web) | To build (both unless noted) |
| :--- | :--- | :--- |
| Actions | Button (both) | IconButton, Link, Menu |
| Text and layout | Text, Surface, Section, Row (both) | Divider, Avatar, Stack and Grid (web) |
| Inputs | TextField, Chip/Chips (both); Switch (native) | Switch (web), Checkbox, Radio, Select, Slider, Search |
| Overlays | none | Dialog, Sheet, Popover, Tooltip, Toast |
| Navigation | none | Tabs, SegmentedControl, Breadcrumb (web) |
| Scene | SceneBackdrop, SceneStill, SceneWeather (native, Skia); scene layers (web, in the app) | one `Scene` component per platform with the same props |
| Status | Waiting, WaitingSign, Perch (native) | the same three on web, Progress, Skeleton, Badge, EmptyState, ErrorState |

Capabilities to port from old components (rebuilt, not wrapped):

| From | Becomes |
| :--- | :--- |
| `SafeButton` + `useSafeAction` | a `useSafeAction` hook; the button only takes `loading` |
| `PredictiveButton` (hover to prefetch) | an `onHoverIn` / intent hook; no special button |
| `SanctuaryButton` icons, haptics, sizes | `icon`, `haptic`, `size` props on Button |
| `SanctuaryCard` press and long press | a pressable Surface (or Row) with link and button roles |
| Firefly / Tutii feedback, BrandPulse | Waiting, WaitingSign, Perch, EmptyState, ErrorState |
| `SyncStatusRetryButton`, `QRShareButton` | composed in their feature, from Button and Surface |

### Definition of done (every component, both platforms)

1. Props typed with no `any`; `ref` as a prop (React 19), no `forwardRef`.
2. Accessible name, role and state: disabled, busy, selected, checked, expanded, invalid.
3. Keyboard on web (focus ring from `--w-focus`, Escape for overlays, arrow keys in groups); screen reader labels on native.
4. Every state rendered: rest, hover (web), pressed, focus, disabled, loading, error.
5. Readable in all 132 themes: contrast test passes for every world × mode × phase.
6. Reduced motion respected; motion from the world's motion recipe.
7. Text works in English, Sinhala and Tamil (faces from the world).
8. Touch target at least 44 px on native.
9. Tests: G1 behaviour and a11y contract; G3 mounted tree; G4 Next.js page for web components. Reported in the AGENTS.md evidence format.

## 5. Styling rules after the rebuild

| | Components | Screens and layout | Not allowed |
| :--- | :--- | :--- | :--- |
| **Native** | recipes -> StyleSheet | NativeWind for layout; colours only `bg-w-*`, `text-w-*`, `border-w-*` | `phase-*` classes, hex or palette colour classes (`bg-white`, `text-[#…]`) |
| **Web** | `components/web` reading `--w-*` | CSS modules for layout; colours only `var(--w-*)` | hard-coded colours in modules, hand-made buttons, pills and fields |

Today: 4,342 `phase-*` class uses and 2 `w-*` uses on native; 1,706 hard-coded
colour classes; 6 of 96 web CSS modules read `--w-*`.

## 6. Phases

### Phase 0 — Foundations

1. Scene into theme, one clock: move `@repo/core/scene` to `theme/scene` and update its importers in the same commit. A single `phaseAt(date)` there and one `Phase` type replace `TemporalPhase`, `WorldPhase` and `ScenePhase`. Remove the copies in `packages/ui/src/context/utils.ts` and the inline thresholds in `apps/gurudevi-web/app/layout.tsx` (generate that script from the same function). `theme/scene` may import `@repo/core/verger` (device budget); that direction (ui → core) is allowed.
2. Move `world/*` into `theme/` and `components/native|web/` (section 3). Update the ~13 files that import `@repo/ui/world*` in the same commit. Carry over the uncommitted edits on this branch (for example `world/css.ts`).
3. `tokens.ts` -> `tokens/`. (Done as a move only: its colours have 66 importers, so they leave in Phase 3 as those screens migrate.)
4. Package exports: add the canonical entries (`theme`, `theme/native`, `theme/web`, `theme/scene`, `components/native`, `components/web`). `@repo/ui/native` was left as it is; it goes with the ledger in Phase 4.
5. Add the boundary check script (section 3 rules) to `check:anti-slop`.
6. Update AGENTS.md: component locations, styling rules, the `@repo/ui/web` rule replaced by `@repo/ui/components/web`.

Exit: typecheck and world tests pass; boundary check runs in CI.

### Phase 1 — Complete the kit

How a world covers a component: a world is a palette plus a dozen style
decisions (`WorldStyle`: corners, primary fill, quiet form, raised edge, field
and chip form, label voice, display, line weight, boundary, ornament), and
`buildRecipes` in `theme/build.ts` derives every component recipe from them. A
new component therefore costs **one recipe builder**, not eleven hand-made
looks. A new `WorldStyle` decision is added only when worlds must differ in a
way the existing decisions cannot express; one-off tweaks go in a world's
`refine`.

| Step | Work | New world coverage |
| :--- | :--- | :--- |
| 1.1 Contracts | Move props types into `theme/contracts.ts`, imported by both sets (D4). Split `components/web` into one folder per component. | none |
| 1.2 Close the exceptions | Base durations into `tokens/`; loading pulse into the kit. The boundary check's exception list becomes empty. | none |
| 1.3 Web parity | Switch, Waiting/Skeleton, WaitingSign, Perch, WorldPicker, Scene (from the app's scene layers) on web. | none: recipes exist |
| 1.4 Overlays | Dialog, Sheet, Toast, Popover, Tooltip | `buildOverlay`: scrim from ground and ink, panel from the raised surface and `corner.surface`, entry from the world's motion |
| 1.5 Choices | Checkbox, Radio, Switch recipe of its own, Select, Menu, Slider | `buildToggle` from `corner.chip`, `lineWeight` and lamp; Select and Menu reuse the field and row recipes |
| 1.6 Navigation | Tabs, SegmentedControl, Breadcrumb (web) | `buildTabs` from the chip form (underline or outlined) |
| 1.7 Actions and status | IconButton, Link, Progress, Badge, Avatar, Divider, EmptyState, ErrorState | IconButton and Link reuse the button recipe; `buildStatus` for progress, badge and avatar; Divider reuses the boundary; Empty and Error compose Perch, Text and Button |
| 1.8 Collections | List (virtualized on native), Table | reuse row and section recipes |
| 1.9 Gallery | One route per platform: every component in any world, mode and phase | contrast check runs over the gallery |

Exit: every kit component exists on both platforms with matching props, and
every recipe builder is covered by the contrast test in all 132 themes.

### Verdicts for the old components

Decided by what the code does, not by its age. File-by-file lines go in the
ledger (section 7) before Phase 4.

| Group | Examples | Verdict |
| :--- | :--- | :--- |
| Primitive layer | `components/ui/*`, `primitives`, Sanctuary Button/Card/Chip/Input/Modal/Toast/ProgressBar/StatsCard, SafeButton, PredictiveButton, AccessibleTouchable, PressableScale, FocusRing, Collapse, GlassCard, HorizontalChipRow, LotusDropdown, UniversalModal, EntityModal, Progress/StepIndicator, UserAvatar, Skeleton(Loader), LoadingOverlay, EmptyState, BrandedEmptyState, ErrorState, ErrorMessage, Success, Breathing/LotusLoader | **Replaced by the kit.** Behaviour worth keeping is ported as listed in section 4; then delete. |
| Companion and brand moments | Firefly*, Mascot*, LivingFirefly, BrandPulse, Celebration and AchievementUnlock overlays, LivingGlow, FounderGlow, SkiaGlowAura, LotusPetalFAB, BreathAnimation | **Rebuild as kit components** (Perch, Waiting, a Celebration moment), dressed by the world. |
| App shell | GlobalHeader, DomainSubHeader, ActiveSubTabStrip (already world-dressed), Gateway header/footer/shell, SettingsGroup, NotificationDrawer, PerspectiveSwitcherSheet, LanguageSwitcher, RealmSelector, DoorwayActions | **Rebuild as patterns** composed from the kit. |
| Feature composites | chat (Composer, MessageBubble, ConversationSheet), PostCard, PollWidget, cards (Collection, DailyResonance, JourneyHistory, Identity), charts, QR, `media/`, `maps/`, `social/`, `visualization/`, `workspace/`, account and device modals, sync status family, banners | **Keep the behaviour, rebuild the UI on the kit.** Domain-specific ones move to their feature package. |
| Lists and tables | SanctuaryFlashList, LegendList, Table, VirtualTable, SovereignVirtualList, ChatScrollView, Carousel | **Replaced by kit List and Table** (1.8). |
| Runtime logic, not UI | Error/Journey/FeatureState boundaries, Environment and Sanctuary guards, Temporal* providers, LifecycleMonitor, ConflictResolver, InternalBrowser, VisualCapabilityInspector, AdaptiveLayout | **Not part of the kit.** Review each: keep where it is a real runtime concern, never as a wrapping view around screens. |
| `*.web.tsx` | 112 files | **Delete** (D8). |

### Phase 2 — Harden

1. Apply the definition of done to every component.
2. Contrast test across all 132 themes (extend `world.contrast.test.ts`).
3. Visual snapshots per world for the gallery (G4 on web; device capture G5 for native spot checks).
4. Sinhala and Tamil text runs through every component.

Exit: definition of done met and evidenced for the full kit.

### Phase 3 — Migrate

Web first (smaller and already browser-native):

1. Replace hand-made buttons (111 files), fields (64 files) and pills with kit components, floor by floor.
2. Rewrite CSS modules to layout only, colours from `--w-*`.
3. Replace `LivingCard` with Surface.

Mobile, one feature package per commit, smallest first so the pattern settles
before the big ones: workforce, ai, scanner-kit, analytics, people, graphics,
form-builder, profile, community, library, self, admin, classroom.

1. Swap old primitives for kit components.
2. Codemod `phase-*` classes to `w-*` (mechanical mapping table, reviewed per package).
3. Fix hard-coded colour classes by hand.
4. Rebuild the composites in `packages/ui/src/components/` that hold real features (video player, PDF viewer, maps, chat, workspace canvas, account modals) on the kit.
5. Rebuild or delete `packages/ui/src/screens/` file by file.

Exit: no file imports a legacy path; ratchet count is zero.

### Phase 4 — Retire

Delete the legacy layer after sign-off on the ledger (section 7). Remove the
`phase` colours from the Tailwind config and the `--phase-*` block from
`CircadianProvider` and `global.css`.

Exit: the legacy paths no longer exist; build, typecheck, tests and
`check:anti-slop` pass.

### Phase 5 — Visual consistency, then UX

1. Screen-by-screen review in three contrasting worlds (Sanctuary, Kandyan, Colombo) in light and dark.
2. Spacing, hierarchy and density pass using tokens only.
3. UX pass: flows, empty, offline and error states, wording, motion moments.

## 7. Deletion ledger (draft — needs sign-off)

Each line is reviewed before Phase 4. A file listed under "rebuild" is deleted
only after its replacement exists.

| Group | Files | Verdict |
| :--- | :--- | :--- |
| `components/ui/*`, `gluestack/`, `primitives.ts`, `button.tsx`, `card.tsx`, `code.tsx` | ~47 files, ~4.0k lines | delete |
| `components-native/` (LivingCard, TemporalGlass, NoiseOverlay) and the `@repo/ui/native` export pointing at it | 7 files | delete |
| `archive/` | 1 file | delete |
| `theme/Theme.ts`, `phaseMatrix`, `CLASSIC_TOKENS`, `theme/worldBridge.ts`, colour part of `tokens.ts` | ~1.4k lines | delete |
| `theme/nitroThemeTransition*` | 3 files | review: keep if it serves the new theme switch |
| `Sanctuary*` primitives (Button, Card, Chip, Input, Modal, Toast, ProgressBar, StatsCard) and `SafeButton`, `PredictiveButton`, `SyncStatusRetryButton` | ~11 files | delete after Phase 3 |
| Other `Sanctuary*` files (FlashList, LegendList, Table, Carousel, ChatScrollView, Guard, Background, Nudge, Signal, RealmSelector, DoorwayActions, GlobalStyles) | ~15 files incl. `.web` | review each: rebuild on kit or delete |
| Feature composites in `components/` (media, maps, social, workspace, chat, modals) | most of 272 files | rebuild on kit, then delete the old |
| `screens/` in `@repo/ui` | 32 files | rebuild or delete, per file |
| `*.web.tsx` across packages | 113 files | delete |
| `packages/scanner-kit/src/qr/QRShareButton.tsx` duplicate | 1 file | delete the `@repo/ui` copy |

## 8. Verification

- G0 on every commit: `pnpm run check-types`, boundary check, `check:anti-slop`.
- G1/G3 for each component (definition of done item 9).
- G4: Next.js gallery and floors rendered in a browser across worlds.
- G5: mobile gallery on a physical low-end Android before Phase 4.
- Step 5 Delta Gate (`git diff`, deletions first) before each commit.

## 9. Risks

| Risk | Mitigation |
| :--- | :--- |
| Long migration leaves screens half old, half new | One package per commit; the ratchet makes progress visible. |
| `phase-*` codemod maps a colour wrongly | Mapping table reviewed once; per-package visual check in two worlds. |
| Feature behaviour lost when composites are rebuilt | Rebuild before delete; each rebuild lists the behaviours it keeps. |
| Uncommitted work on this branch collides with the move | Do the move in a dedicated commit and carry the edits explicitly. |
| NativeWind is a release candidate (5.0.0-rc.0) | Components do not depend on it; only screen layout does. |

## 10. Sources

- `~/.gemini/antigravity/brain/740e4459-…/legacy_primitives_audit_and_comparison.md` (2026-10-29). Inventory is useful; its facade blueprints are not used (D1), and they had two bugs: a CSS-variable class on native, and empty labels for non-string children.
- `~/.gemini/antigravity/brain/740e4459-…/worlds_component_mapping_and_integration_strategy.md` (2026-10-29)
- `~/.gemini/antigravity/brain/740e4459-…/worlds-and-upstream-ui-inventory.md` (2026-10-28)
- [`docs/Core/design/2026-10-26-ui-vision-timeline.md`](../Core/design/2026-10-26-ui-vision-timeline.md)
- [`docs/Core/design/gurudevi-design-system-audit-and-plan.md`](../Core/design/gurudevi-design-system-audit-and-plan.md)
- [`docs/current_progress/2026-09-07-ui-primitives-production-hardening-plan.md`](../current_progress/2026-09-07-ui-primitives-production-hardening-plan.md) (its targets move from Gluestack primitives to this kit)
- [`docs/architecture/2026-10-28-living-worlds-real-integration-master-spec.md`](2026-10-28-living-worlds-real-integration-master-spec.md) (backdrop and ground work; runs alongside this plan)

## 11. Scoreboard: old versus kit (2026-10-30)

Counts are consumer files outside `@repo/ui` (G0, `rg` over `apps/gurudevi-mobile` and `packages`).

| Old | Used in | Kit now | Gap |
| :--- | ---: | :--- | :--- |
| `Text`, `Heading` (primitives) | 476, 174 | `Text` (kinds, tones, trilingual faces) | none; migrate |
| `Box`, `VStack`, `HStack`, `Center` | 383, 388, 361, 34 | none | **Stack, Inline, Grid** (1b.1) |
| `Icon` | 262 | `icon` props on Button/IconButton | **Icon** (1b.1) |
| `Button` + `ButtonText`, `SanctuaryButton` | 125, 39 | `Button`, `IconButton` | none; migrate |
| `SanctuaryCard`, `GlassCard`, `CollectionCard` | 26, 6, 3 | `Surface` | **Card / Tile** (1b.2) |
| horizontal lists, `HorizontalChipRow`, `SmartShelf` | 30, 2, 3 | none | **Rail, Carousel** (1b.2) |
| `numColumns` grids | 4 | none | **Grid** (1b.1) |
| `SettingsGroup` | 4 | `Section` + `Row` (world boundaries incl. inset boxes) | **Group** with proximity spacing (1b.3) |
| `BrandPulse`, `SkeletonLoader`, loaders | 68, 43 | `Waiting`, `WaitingSign`, `WorldSkeleton`, `Progress` | none; migrate |
| `ErrorState`, `BrandedEmptyState` | 30, 20 | `ErrorState`, `EmptyState` | none; migrate |
| `UniversalModal`, actionsheets, toasts | 4+ | `Dialog`, `Sheet`, `ToastHost`, `Popover`, `Menu` | none; migrate |
| `SanctuaryFlashList`, `SanctuaryLegendList` | 14, 2 | `List` (FlashList) | none; migrate |
| `UserAvatar`, badges, progress bars | 9, 1, 3 | `Avatar`, `Badge`, `Progress` | none; migrate |
| `useTheme`, `useThemedColors` | 64, 38 | `useWorld`, `useWorldContext` | none; migrate |
| `useResponsive` | 10 | none | **container size** (1b.4) |
| `useAccessibility` | 12 | partial (motion via verger) | **system a11y settings** (1b.4) |
| `useSafeAction` | 2 | — | keep as a hook |

Only 18 consumer files use the kit yet. Coverage of what screens need is the
point of 1b; adoption is Phase 3.

## 12. Worlds: open-ended, one folder each

Worlds are data, so there is no limit of eleven. Every stylesheet, picker
and contrast test already loops over `WORLD_IDS`, and a saved choice that no
longer exists falls back to the default (`isWorldId`). Adding a world today
still touches seven places (`WorldId` union, world file, registry, `FACES`,
`MOTION`, `SIGNS`, `PERCHES`, font manifest). 1b.0 makes a world one folder:

```
theme/worlds/kandyan/index.ts   palette, style, faces, motion, sign, perch, names
theme/worlds/index.ts           the registry (one line per world)
```

`WorldId` is derived from the registry (`keyof typeof WORLDS`), the font
manifest is generated from each world's faces, and a test fails if a world
is missing any part or fails contrast in any of its 12 mode × phase themes.
Add = one folder + one line. Remove = delete both.

## 13. Phase 1b: layout, grouping and space

| Step | Work |
| :--- | :--- |
| 1b.0 | One folder per world (section 12). |
| 1b.1 | `Stack` and `Inline` (gap from the spacing relations below), `Grid` (columns from container width), `Icon` (lucide, sized and inked by role). |
| 1b.2 | `Card` / `Tile` (pressable Surface with media, title, meta; shapes: tile, wide, square, pill; sizes sm/md/lg; corners from the world), `Rail` (horizontal, snapping; FlashList horizontal on native, CSS scroll-snap on web), `Carousel` (paged, with position and announced page; no autoplay by default). |
| 1b.3 | `Group`: rows share one surface, only the outer corners round, hairlines inside; groups stand apart. Section's `boxes` boundary becomes this. |
| 1b.4 | Space-aware components: `useContainerSize` (onLayout on native, container queries on web) so a Row puts its detail under its label when narrow, a Grid drops columns, a Card moves media above text. System accessibility settings (`isHighTextContrastEnabled`, `isDarkerSystemColorsEnabled`, `isReduceTransparencyEnabled`, font scale) feed the world: stronger edges, no glass, larger targets. |
| 1b.5 | Contrast guard: every recipe pair in every theme (text on fill, on-lamp on lamp, focus ring on ground), not only tokens; ink chosen over imagery with `inkOn` (theme/scene) rather than Reanimated's `contrastColor`, which returns pure white or black and the worlds never use those. |
| 1b.6 | Inspector: the gallery (1.9) is the component tree to look at; every kit element carries its name (`data-kit` on web, `testID` prefix on native) so React DevTools and React Native DevTools (built into RN 0.88) show `kit.Button` rather than anonymous views. No overlays or wrappers (runtime concerns stay out of the tree). |
| 1b.7 | Living light: colour, brightness and edges answer state, not only size. On native, `interpolateColor` (Reanimated 4.7.1) between two recipe colours driven by one shared value per component (pressed, focused, invalid, success): an edge warms from `edge` to `lamp` on focus, a fill brightens on press, an error edge goes to `danger` and settles back to a held tint, a success glow blooms and fades. On web, the same pairs as `--w-*` transitions (`color-mix` for in-between tints). The pairs come from the recipe (`world.recipes.*.states`), never from the component, so a world can choose a quiet or a vivid response; motion level `still` and reduced motion jump to the end colour. No new colours: every endpoint is already a token that passes the contrast guard (1b.5). Cost: one shared value and an animated style per pressed or focused element, on the UI thread. |

### Spacing relations (proximity)

Space says what belongs together. Four relations, each a token in
`@repo/ui/tokens`, scaled by density (compact, comfortable) and by font scale:

| Relation | Meaning | Comfortable |
| :--- | :--- | ---: |
| `inside` | within one control (icon to label, label to hint) | 4–8 |
| `between` | siblings in one group (rows, chips) | 0 + hairline, or 8 |
| `group` | group to group | 24 |
| `section` | section to section, and screen edges | 40 |

Components read the relation, never a number, so a world, a density or a
person's font size can open or close the whole page consistently.

## 14. Phase 1c: forms, assessments and media

The form engine (`@intuitui-labs/form-builder-engine@0.3.0`, re-exported by
`@repo/form-builder/engine`) already models much more than the UI renders:

- 16 field types: text, email, password, select, textarea, number, heading,
  divider, slider, likert, **rich-text, statement, file, image-capture,
  audio-record, visualization**.
- 8 form kinds: survey, **quiz, exam, assessment**, poll, intake, feedback,
  form. Questions carry rubrics; forms have pages, branching (`Condition`,
  `PageJumpRule`) and attempt governance (reservation, drafts, offline outbox).
- Validators include `fileSize`, `fileType` (MIME list) and `maxFiles`; media
  descriptors (image, gif, video, audio, embed, lottie) carry required `alt`,
  captions and aspect ratio. Fields carry semantic intents (autocomplete).

Today `@repo/form-builder` renders with 17 legacy `@repo/ui/primitives`
imports, and the web builder floor (`apps/gurudevi-web/app/(sanctuary)/admin/forms/builder`)
is hand-built (21 raw inputs and buttons). `@repo/core`'s `FieldType` lists
only the first 10 engine types: the engine is the source of truth and core
should re-export its types rather than keep a copy.

| Step | Kit work |
| :--- | :--- |
| 1c.1 | `Scale` (Likert and rating: a radio group of 3–11 points with end labels, emoji or numeric), `Stepper`/`FormPager` (page n of m, back/next, Progress), field `autoComplete` from semantic intents. |
| 1c.2 | `FileField`: pick (and drop on web), each file a row with name, size, progress, retry and remove; enforces `fileType`, `fileSize`, `maxFiles` with announced errors; offline-safe (queues with the outbox). `ImageCapture` (camera, retake), `AudioRecord` (record, pause, play back, length). |
| 1c.3 | `Media` (image, video, audio, embed, lottie) honouring `alt`, captions, poster, aspect ratio and reduced motion; `DocumentViewer` for PDFs (page, zoom, search, download; replaces legacy `PdfViewer` / `UniversalDocumentPortal`). |
| 1c.4 | Assessment states: a field shows correct, incorrect or awaiting review (from the rubric), a `Timer` for exams that announces at set marks, and a review summary. `RichText` (editor and reader) after a library decision (needs research against installed versions). |
| 1c.5 | Rebuild `@repo/form-builder` renderers and the web builder floor on the kit; one renderer per field type, chosen from the engine schema. |

### 1c design: ports and adapters

The kit owns the frame, the world's look, the states and an honest
fallback. Anything that parses or renders a format is an adapter the app
plugs in through `MediaAdapters` (one registry per platform, inherited down
the tree). A library choice is therefore reversible, and a missing adapter
never loses the person's content.

| Port (kit) | Adapter props | Native default | Web default | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `Markdown` | source, onLinkPress (+ world prose on native) | enriched-markdown (installed) | none yet | paragraphs as plain text, never HTML |
| `DocumentView` (pdf, document, sheet, slides, markdown, text) | file, onError | none yet | browser PDF viewer, download beside it | `FileCard` that opens or downloads |
| `FileCard` | (kit piece) | | | unsafe addresses (javascript:, data: HTML) are never linked or framed |

Shared and platform-neutral: `fileKindOf`, `formatBytes`, `safeFileUrl`,
labels (`components/shared/files.ts`); question rules
(`components/shared/questions.ts`). The `prose` and `question` recipes
carry the look; both are in the contrast guard.

Questions speak the form engine's vocabulary (`@intuitui-labs/form-builder-engine`
0.3.0: instant or deferred evaluation, rubrics, explanation, streak and
speed bonus, hints, reward port). The engine evaluates; the kit shows the
result it is given (`ChoiceQuestion` `reveal`). Anonymity exists in the
engine only as a transport `anonymousId`, so the service decides it and
`PrivacyNote` says it plainly.

Open library decisions (each lands as one adapter, nothing else changes):

| Port | Candidates being weighed | What the adapter must pass |
| :--- | :--- | :--- |
| Markdown on web | (none chosen) | sanitised output, GFM tables, KaTeX optional, Sinhala and Tamil shaping |
| Rich text (editor and reader) | Software Mansion enriched text (Markdown) vs HTML rich text | round-trip without loss; offline drafts through the engine's outbox |
| PDF on native | react-native-pdf vs a better maintained PDF engine | page, zoom, search; 2 GB devices |
| Office (docx, xlsx, pptx) | to be researched | read-only first; falls back to download |
| Slides | reveal.js vs Marp | from Markdown; keyboard and swipe; no autoplay |

Built so far: `Markdown`, `FileCard`, `DocumentView`, `MediaAdapters`,
`Scale`, `ChoiceQuestion`, `PrivacyNote` (both kits). Next in 1c: `Media`
(image with alt and caption, video and audio with poster and reduced motion;
expo-image, expo-video, expo-audio on native are installed), `FileField`
(pick, drop, progress, offline queue), `AudioRecord`, `ImageCapture`,
`Timer` (announces at marks), playful moments from the engine's streak and
rewards (felt through the feedback grammar, never required to answer), then
the form-builder renderers (1c.5).

### 1c roadmap: agent kit, then media foundation, then forms

Agreed order (2026-10-31). Kit pieces only: screens (AIScreen, DM, FAB
overlays) are composed from them later. Each layer finishes before the next
starts, because the next one is built from it.

**Why this order.** Chat and agent surfaces are where the person meets the
AI every day (FAB, AIScreen, DM), and today they sit on legacy UI: the
legacy ratchet cannot reach baseline until they move. Forms need the media
layer (file, image and voice answers, rich text) and the agent layer
(AI-drafted questions, review gates), so they come last and stay granular.

**Layer 1 — agent kit (AG-UI shaped).** One piece per AG-UI event family
(`2026-10-29-ai-stack-and-agui-architectural-blueprint.md`) and per chat
parity pillar (`2026-10-29-production-2026-chat-and-agent-parity-blueprint.md`).
The kit renders events; it never speaks the wire protocol (that stays in
`packages/ai`, `@tanstack/ai`).

| Piece | AG-UI family / pillar | Notes |
| :--- | :--- | :--- |
| `MessageBubble` (kit) | Text stream | own words on the lamp, replies on paper; streaming Markdown through the `Markdown` port; announces once when a message completes, never per token |
| `MessageList` | Text stream | virtualized (FlashList); keeps the latest in view; date and author grouping |
| `Composer` | Attachments, controls | multiline field, send / stop, attachment tray of `FileCard`s, think-depth chip, Sinhala and Tamil input |
| `MessageActions` | Lifecycle controls | copy, regenerate, edit, stop; each with a name |
| `ThinkingTrace` | Reasoning | collapsed by default, says "Thought for 12 s", expandable |
| `ToolCallCard` | Tool calls | name, arguments summary, running / done / failed, result preview |
| `ApprovalCard` | Human approval | what will change, Accept / Discard; accepted only when the service confirms (as fixed in AIScreen) |
| `RunStatus` | Lifecycle | steps with progress, elapsed time, cancel |
| `Citation` | Grounding | numbered badge, source sheet |
| `ArtifactCard` | Artifacts | preview tile that opens a `DocumentView` or sandboxed frame |
| `PrivacyState` | Incognito / temporary | always visible while not saved; same words as `PrivacyNote` |
| `ActionFab` + `FabMenu` | FAB ingress | world-dressed floating action and its menu (primary action, AI companion, breathing reset, incognito), replacing `LotusPetalFAB` after sign-off |
| `RichTextEditor` port | Rich text | native default: Software Mansion `EnrichedMarkdownTextInput` (installed); web adapter open |

**Layer 1 status (2026-10-31): built on both kits.** Every piece in the table
above exists natively and on the web with the same names and props
(`7ef3230b2`, `efed8524c`). Decisions taken:

- **Lists for chat: Legend List 3.6.0**, not FlashList. It gives the same chat
  props on both platforms (`alignItemsAtEnd`, `initialScrollAtEnd`,
  `maintainScrollAtEnd`, `maintainVisibleContentPosition`, `onStartReached`),
  and its DOM build (`@legendapp/list/react`) depends only on React, so it
  passes the web boundary. Its keyboard build (`KeyboardAwareLegendList`,
  `useKeyboardChatComposerInset` on the installed keyboard controller) is
  for the chat pane a screen composes. FlashList stays for `List` and
  `Rail`.
- **Rich text on native: Software Mansion's `EnrichedMarkdownTextInput`**
  (part of the installed `react-native-enriched-markdown`) is the default
  `RichTextEditor` adapter. Web has no editor yet; a plain Markdown field
  stands in.

Still open in layer 1: moving AIScreen, the DM screen and the FAB overlay
onto these pieces (screen work), then retiring `LotusPetalFAB`, legacy
`MessageBubble` and `ChatComposer` after sign-off. Not yet seen in a
browser or on a device: list pinning, keyboard behaviour and streaming
performance need the galleries (G4, G5).

**Layer 2 — media foundation.** Done when every format below has its port,
default adapter or honest fallback, capture where it applies, and tests, so
a later library swap cannot regress a screen.

| Format | View | Capture / pick | Foundation still needed |
| :--- | :--- | :--- | :--- |
| Image | `Media` (alt required, caption, aspect, blur-up) | camera, library (expo-image-picker, expo-camera) | compression before upload, permission prompts in plain words |
| Video | `Media` (poster, captions, reduced motion: no autoplay) | library | thumbnails (expo-video-thumbnails), size limits |
| Voice / audio | `Media` audio, waveform-free player (play, seek, speed) | `AudioRecord` (expo-audio) | transcript slot for accessibility |
| PDF | `DocumentView` (web: browser viewer) | `FileField` pick | native PDF adapter decision |
| Markdown | `Markdown` (native: enriched-markdown) | `RichTextEditor` | web adapter decision |
| Office | `DocumentView` fallback card | `FileField` pick | read-only adapters decision |
| Any file | `FileCard` | `FileField` (pick, drop on web, progress, retry, offline queue via the engine's `IAttachmentPort`) | `safeFileUrl`, `fileKindOf` (done) |

**Layer 2 status (2026-10-31): foundation built on both kits** (`730882848`).
`Media`, `FileField`, `ImageCapture`, `AudioRecord` with the same names
and props on both kits; every capture tool is a port.

| Port | Native adapter | Web | Missing adapter |
| :--- | :--- | :--- | :--- |
| image view | expo-image (kit) | `<img>` | file card + words |
| video view | expo-video (kit) | `<video controls>` + captions track | file card + words |
| audio view | expo-audio (mobile app) | `<audio controls>` | file card + words |
| pick files | expo-document-picker (app) | file input + drop | says "cannot here", no dead button |
| pick / take photo | expo-image-picker (app), compressed to 0.7 | file input, `capture="environment"` | same |
| record voice | expo-audio recorder (app) | MediaRecorder | same |

The mobile app fills the ports once at boot (`registerMediaAdapters` inside
`registerAppCatalog`), so nothing wraps the tree. Still to do in layer 2:
the upload pipeline (form engine `IAttachmentPort`: progress, retry and the
offline outbox feeding `FileItem.progress` and `error`), video thumbnails
(`expo-video-thumbnails` is installed), sidecar captions on native video
(expo-video plays embedded subtitle tracks only), and the open adapter
decisions (native PDF, office, web Markdown, web rich text). G4/G5 evidence
(real pickers, permission prompts, recording) needs the galleries.

**Layer 3 — forms, granular.** One renderer per engine field type (16), each
its own step with its own tests: text, email, password, select, textarea,
number, heading, divider, slider, likert (`Scale`), rich-text, statement,
file, image-capture, audio-record, visualization. Then pages (`FormPager`),
branching, attempt governance, assessment states (`ChoiceQuestion` reveal,
`Timer`), playful moments from the engine's streak and rewards (felt, never
required), anonymous and named identity (`PrivacyNote`), and finally the
web builder floor (1c.5).

**Gaps named on 2026-10-31 (each is part of "done" for its layer):**

- Seeing it: galleries (1.9) before forms at the latest, ideally before the
  FAB replacement, which touches every screen.
- Streaming: screen readers hear a message once, when it completes, never
  per token; a streaming reply re-renders only its own bubble (2 GB devices).
- Agent failure states: stream dropped mid-reply, tool failed, approval
  timed out, offline. Each has its own words and a retry, not only the
  happy path.
- Voice and video carry a transcript or captions slot (deaf learners, loud
  classrooms).
- AI output is untrusted: links pass `safeFileUrl`; HTML artifacts render
  only in a sandboxed frame; Markdown is never raw HTML.
- Capture: permission prompts in plain words, compression before upload,
  size limits enforced and announced before sending.
- Retirement: `LotusPetalFAB`, legacy `MessageBubble` and `ChatComposer`
  go only with sign-off, once their kit versions carry every behaviour.

**Cross-cutting, every layer:** world recipes only; contrast guard for each
new pair; the feedback grammar for every outcome; failure paths (network
drop, 503, permission denied, file too large); 2 GB devices (virtualized
lists, no per-token re-render storms); evidence beyond G1 through the
galleries (1.9) before a layer is called done.

### Order from here (2026-10-31)

Naveen keeps layout and placement; the visuals are what need refining, and
they must come from the world on both platforms. So the shell is re-dressed
from kit pieces in place, never redesigned.

1. **Galleries (1.9) first.** Visual refinement is judged by eye, so every kit
   piece and every shell piece is shown in every world, mode and phase, on a
   phone and in the browser, before and after. This is also the G4/G5
   evidence the agent and media layers still lack.
2. **Shell refresh, both platforms, placement kept.**

   | Shell part | Today | Kit pieces it becomes |
   | :--- | :--- | :--- |
   | Global header | \`GlobalHeader\` (447 lines, legacy) | \`AppHeader\` (new): title, back, actions, avatar, notification bell with a spoken count |
   | Domain sub-header and strip | \`DomainSubHeader\`, \`ActiveSubTabStrip\` (legacy) | \`Tabs\`, \`SegmentedControl\` |
   | Bottom tabs | \`NativeShellTabs\` (system tabs, world colours) | same system tabs; icons and the selected mark from the world; web: \`SanctuaryShell\` nav on kit \`Tabs\` |
   | Floating action | \`LotusPetalFAB\` (legacy) | \`ActionFab\` + \`FabMenu\` (built) |
   | Notifications | \`NotificationsScreen\` (+ \`.web.tsx\`) | \`NotificationItem\` (new: \`Row\` with unread signal, time, actions), grouped by day in \`Group\`s on \`List\` |
   | Settings | \`AppSettingsScreen.shared\` (1200 lines) | \`Group\` + \`Row\` + \`Switch\` + \`Select\` + \`WorldPicker\` (all built) |

   Each part is one step: compose from the kit, keep its place and behaviour,
   then retire the legacy piece with sign-off. (No gallery for now, by
   decision; `ui-kit-gallery-guide.md` says how to build one later.)

   **Done (`62e2c6e3d`):** `AppHeader` on both kits; `GlobalHeader` drawn by
   it with every prop and behaviour kept; bottom tabs lit by the world (both
   mobile variants); the web shell stylesheet entirely on world variables with
   the kit's press and light feedback. **Next:** sub-header and strip onto
   `Tabs`, notifications (`NotificationItem`), settings onto `Group`/`Row`,
   the FAB onto `ActionFab` + `FabMenu`.
3. **Layer 1 screens:** AIScreen, the DM screen and the FAB overlay onto the
   agent kit.
4. **Layer 2 remainder:** upload pipeline (engine \`IAttachmentPort\`, offline
   outbox), video thumbnails, native sidecar captions.
5. **Layer 3, forms and quizzes, granular.** Built so far: \`Scale\`,
   \`ChoiceQuestion\` with reveal, \`PrivacyNote\`. Still to build, one step
   each: short answer and number answers with their marks, true/false,
   ordering and matching (if the engine's rubrics carry them), \`Timer\`
   (announces at marks), \`FormPager\` (page n of m, back and next, progress),
   the review summary (score, each question, explanations), playful moments
   (streak and speed bonus from the engine, felt and shown, never required),
   attempt states (locked, drift, offline draft), then one renderer per
   engine field type (16) and the web builder floor (1c.5).

## 15. Status ledger

Updated with every commit. If this conversation's context is lost, this
section plus the guide (`ui-kit-guide.md`) and the requirements ledger
(`ui-kit-requirements-ledger.md`) is the state of the work.

### Done

| Commit | Step |
| :--- | :--- |
| `cbfeb4942` | Phase 0: canonical theme, tokens, components; one clock; boundary check |
| `8dd7a1d59` | 1.1 shared contracts; web kit one folder per component |
| `def84347d` | 1.2 motion scales into tokens; kit button pulse; no kit → legacy links |
| `828f93d44`, `190aa14b4` | 1.3 web parity: Switch, Waiting, WaitingSign, Perch, WorldPicker |
| `3533705df` | 1.4 overlays: Dialog, Sheet, Toast, Popover, Tooltip |
| `7488e1459` | 1.5 choices: Checkbox, RadioGroup, Select, Menu, Slider |
| `7969a48b1` | 1.6 navigation: Tabs, SegmentedControl, Breadcrumb (web) |
| `de62a8f2b` | 1.7 IconButton, Link, Progress, Badge, Avatar, Divider, EmptyState, ErrorState |
| `e1b0b9d0b` | 1.8 List (FlashList / content-visibility), Table |
| `1e0d1c76a` | SwipeRow; AGENTS.md worklets rule matches installed APIs |
| `875ee53b3` | Scoreboard, open-ended worlds, Phase 1b |
| `a550af520` | Kit guide, ui-kit skill, Phase 1c, this ledger |
| `aaee20fe3` | Feedback grammar (`useFeedback`, `usePressMotion`, `useErrorFeedback`, web `--w-press` and shake) across native kit; intentional-ui-design references restored |
| `814ec2753` | Feedback grammar in guide and skill; 1b.7 living light step |
| `3bbfe14b8` | World material (light, grain, wash, tinted shadow, detail, lit moments) and living light: `useLivingStyle`, TextField edges, Button press light, web `--w-light-*` |
| `60594f4c0` | Requirements ledger (`ui-kit-requirements-ledger.md`) |
| `bceeb8d9e` | Spacing relations (`tokens/space.ts`), Stack, Inline, Group on both kits |
| `4cf5656d7` | Icon, Grid, Card (tile/wide/square/pill), Rail, Carousel, `useContainerWidth` on both kits |
| `dd5926629` | Living light in Checkbox and Chip; material wash on raised surfaces |
| `e2b6719d6` | Recipe contrast guard (every pair, 132 themes) and the fixes it found |
| `429940109`, `0803183be` | Inspector naming checks on both sets |
| `8e158aa79` | 1b.0 one folder per world; `WorldId` from the registry |
| `c0706eee8` | Row space-aware with press light; Tabs on living light (`ChipPaint`) |
| `46726d173` | Boxed Sections render as Group |
| `db829df75` | System accessibility settings (`WorldAccess`, `useSystemAccess`, web media queries) |
| `dcac5d532` | 1c media ports: prose recipe, `Markdown`, `FileCard`, `DocumentView`, `MediaAdapters`; floor sky from theme/scene |
| `0ddd06e7f` | Owned open UI work: FAB AI companion, chat bubble on world prose, AIScreen on world colours, Todo, web floors, period card on the kit |
| `b5df866f3` | Security: safe file links and frames; agent promotion only when confirmed; route cannot lower chat privacy |
| `b094d69ad` | Question kit: `Scale`, `ChoiceQuestion` (reveal), `PrivacyNote`; question recipe in the contrast guard |
| `b96b6dffd` | Security: file addresses with control or space characters refused |
| `f4766d648`, `16db140ff` | 1c roadmap (agent kit, media foundation, forms) and the gaps that are part of done |
| `7ef3230b2` | Native agent kit (AG-UI shaped): bubble, list on Legend List, composer, thinking, tool call, approval, run status, actions, citation, artifact, privacy, ActionFab, FabMenu, RichTextEditor port |
| `efed8524c` | Web agent kit with the same names and props; shared-name checks on both kits |
| `730882848` | Media foundation: Media, FileField, ImageCapture, AudioRecord on both kits; capture ports; mobile adapters registered at boot |
| `62e2c6e3d` | Shell refresh, placement kept: AppHeader (both kits), GlobalHeader on it, bottom tabs and web shell from the world |

Evidence at `1e0d1c76a`: G0 `@repo/ui` 0 type errors; G1 kit native + theme
1558+ tests, web kit 45/45 (`apps/gurudevi-web/tests/unit/kit`). Not yet: G4
(browser) and G5 (device), which come with the galleries.

### Next, in order

Phase 1b is done.

1. 1.9 galleries on both platforms (G4 browser, G5 device).
2. 1c forms, assessments and media.
3. Phase 2 harden, Phase 3 migrate (web floors, then packages smallest first),
   Phase 4 retire (ledger sign-off), Phase 5 polish.

### Open items

- The Todo feature (native `TodoView` and row in `@repo/self`, web `TodoView`
  in `apps/gurudevi-web/app/(sanctuary)/components`, `@repo/core/todos`) was
  moved out of the kit and fixed, but is someone else's uncommitted work: left
  for its owner to commit.
- Security: `apps/sanctuary-api/src/ai/routes.ts` lets the request choose its
  role (`?role=` and `body.role`, default `'teacher'`); use only the
  server-resolved capacity and answer 403 when missing. Not UI work; not fixed.
- Pre-existing failing tests: `gestureLifecycle.test.tsx` (gesture mock lacks
  `Gesture`), `worldBootstrap.test.tsx` (renders the async `RootLayout`
  synchronously).
- Ratchets read above baseline because of other uncommitted work; do not
  raise the baselines.
