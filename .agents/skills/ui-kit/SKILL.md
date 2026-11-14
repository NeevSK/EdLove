---
name: ui-kit
description: "Use when adding, changing or migrating any UI in Gurudevi (mobile or web): kit components in @repo/ui/components/native and /web, world recipes in @repo/ui/theme, tokens, worlds, or moving a screen off legacy @repo/ui primitives."
---

# UI Kit

Gurudevi's UI is one kit with two platform sets and one world engine. Load this
before touching UI; it replaces `branded-ui` (which describes the legacy
`@repo/ui` root exports).

## Read first

1. `docs/architecture/ui-kit-guide.md` — the manual: where every change goes,
   playbooks (add a component, change a look, add/remove a world, migrate a
   screen, retire legacy), rules and known traps.
2. `docs/architecture/2026-10-29-ui-component-system-rebuild-plan.md` — the
   plan, decisions, scoreboard (old vs kit), Phase 1b/1c and the status ledger.
3. `docs/architecture/ui-kit-requirements-ledger.md` — every requirement
   (structure, components, space, feedback and aliveness) with its status.
4. `docs/architecture/ui-kit-gallery-guide.md` — how to build the gallery (G4/G5 evidence) when it is time.

## The five rules

1. **Two sets, one contract.** Props shared by both platforms live in
   `@repo/ui/theme` (`contracts.ts`); `components/native/X` and
   `components/web/X` extend them with the same names.
2. **Looks come from the world.** Components read `useWorld().recipes`
   (native) or `var(--w-*)` (web). New looks go in `theme/build.ts`; one-world
   tweaks in that world's `refine`. No hex, rgba or font names in components.
3. **The kit renders, it never fetches.** No runtime `@repo/core` imports in
   the kit; data-bound views live in feature packages or the app.
4. **Everything has an accessible path.** Role and name on the control;
   gestures always have an accessibility action or a button.
5. **Legacy only goes down.** No new imports of `primitives`,
   `components/ui`, flat `components/*`, `theme/Theme`; `check:ui-boundaries`
   enforces it.
6. **Discrete degradation over continuous squeezing (The 4 Gears via Container Queries).**
   - A component must never degrade by awkward text-wrapping, font-squishing, or broken line-boxes.
   - **Mandatory Container Queries**: All discrete degradation gears must be driven by CSS Container Queries (`container-type: inline-size; @container`) on the component wrapper, NEVER by viewport media queries (`@media`), ensuring components adapt properly regardless of whether they are staged full-width, in a split rail, or in a drawer.
   - When container boundaries shrink, it must transition into explicit discrete gears:
     - **G3 (Full)**: Complete expanded instrument with all affordances (≥ 520px).
     - **G2 (Medium)**: Single-row horizontal bar with day/time badges (380px–519px).
     - **G1 (Compact)**: Flat, content-width capsule hugging text (`‹ Nov 01 ›`, 320px–379px).
     - **G0 (Nano)**: Atomic, non-wrapping badge (Day number + Month Narrow) for dense cells (< 320px).
7. **Container awareness & spatial baseline (Inter vs. Intra).** Responsiveness
   is inseparable from its staging canvas:
   - **Canvas Ground**: Background surfaces (`--w-ground`, `--w-surface`) set the baseline contrast and texture.
   - **Inter-container space**: Outer margins and gutters govern the breathing room and spaciousness.
   - **Intra-container tension**: Internal padding, hairline borders (`--w-line`), and corner radii (`--w-radius-*`) establish tactile instrument density. A component must never fight its container's padding.
8. **Foveal scanpath & directional symmetry (Vector Cognition).** The human eye
   processes components in foveal fixation spots:
   - **Primary Anchor**: Stable, high-contrast center (Date or Time) with tabular numbers to prevent horizontal jitter.
   - **Left Flank = Regressive**: Previous, Undo, Past (`‹`, `« Past`) belong on the left.
   - **Right Flank = Progressive / Unfolding**: Next, Future, Expand Drawer (`›`, `Future »`, `[📅]`) belong on the right.
   - **Vertical Hierarchy**: High-frequency fleeting signals on top (**Time**); grounding anchors on the bottom (**Date**).
9. **Zero-drama affordance transparency & theme vectors (with Anchor Restraint).**
   - No dramatic names (`TemporalHorizonRefined`, `CircadianMesh`). Use canonical names: `Date`, `Time`, `DateTimeCombo`, `ScrollArea`, `Card`.
   - If tapping the element itself triggers depth (e.g. tapping the date opens the calendar), delete redundant "Goto" or "Pick Date" buttons.
   - **Core Meaningful Anchors Only**: Only primary architectural and navigational anchors (card identity glyphs, tool controls, floor landmarks) use stroke/fill vector SVGs that drink the active world's lamp tokens (`var(--w-lamp)`, `var(--w-on-lamp)`).
   - **Approved Vector Glyph Registry**: Use canonical icons from `lucide-react` adapted with `KitIconProps` (`size`, `color="currentColor"`), or `@repo/ui/components/web/Icon`. Never use OS emojis for system controls.
   - **No Exhaustive Emoji Skinning**: NEVER try to turn every casual, content-level, or user-facing emoji into a themed SVG. Skinning every minor emoji causes visual noise, asset sprawl, and over-engineered churn. Let content be content; reserve themed vector anchors strictly for primary spatial locus points.
10. **Contextual Orientation & Intentional Guidance over Redundant Echoes.**
   - **Newcomer Orientation is Essential**: Novel or domain-specific features (e.g. "Fire Journal", "Climate Sensing", "Warm Mirror", "Daily Sadhana") MUST provide clear, friendly orientation for exploring or first-time users. Never leave a new user stranded trying to guess what an unfamiliar feature does.
   - **Feature Comprehension Affordances**: Provide concise value-proposition descriptions on cards and support rich, informative feature orientation tooltips or hover previews (`aria-describedby`) that explain *what the tool is and why to use it*.
   - **Ban Redundant Echoes Only**: Eliminate tooltips that merely parrot existing visible labels (e.g. hovering a button labeled "Close" just to see "Close", or hovering "Pin" to see "Pin"). Reserve tooltips for **genuine explanatory guidance**, domain orientation, or hotkey hints.
   - **Cross-Platform Parity for Guidance**: Explanatory guidance must never be a desktop-only hover secret. On touch surfaces (mobile/tablet), ensure new users have an accessible path (such as an info trigger, long-press peek, or onboarding sheet) to discover what a feature does.
11. **Compound Interactive Controls & The Composition Seam.**
   - **No Nested Interactive Elements**: In valid HTML and accessible trees, an `<a>` or `<button>` must NEVER contain another nested `<button>` (e.g. a pin button inside a clickable card). Use a trailing action bar, or manage outer clicks via `role="button"` / event dispatch with child `e.stopPropagation()`.
   - **Primitive vs Domain Composition**: The kit provides `@repo/ui/components/web/Card` (`CardContract`). Domain packages/apps compose this primitive with their telemetry and pins; they must NEVER invent parallel rogue primitives (like `LivingCard`).

## Checklist for a new component

- [ ] `XContract` in `theme/contracts.ts`
- [ ] recipe reused, or a builder in `theme/build.ts` (+ type in `types.ts`)
- [ ] native `components/native/X/X.tsx`, web `components/web/X/X.tsx`
- [ ] web rules in `theme/kitCss.ts` (only `var(--w-*)`)
- [ ] exported from both barrels
- [ ] living light: state colours through `useLivingStyle` / `--w-light-*`, never hard-coded per state
- [ ] feedback: `useFeedback()` with an event name (no direct haptics), `usePressMotion()` on pressables, `useErrorFeedback(error)` on fields
- [ ] native tests in `components/native/__tests__`, web tests in
      `apps/gurudevi-web/tests/unit/kit`
- [ ] gallery entry on both platforms
- [ ] typecheck, both test runs, `check:ui-boundaries`, `check:world`
- [ ] dates and times through `components/shared/time.ts` and `recipes.time` (never hand-formatted); on the web prefer the browser control (`<details>`, `<input type=date|time|number|search>`) and style it
- [ ] new names added to both `SHARED` lists (native `inspector.test.tsx`, web `webKitNames.test.tsx`)

## APIs verified against installed packages (2026-10-30)

- `react-native-worklets@0.13.1`: `scheduleOnRN`, `scheduleOnUI` (not the
  deprecated `runOnJS`, `runOnUI`).
- `react-native-reanimated@4.7.1`: shared value `.get()` / `.set()`;
  `contrastColor()` exists but returns pure white/black, which worlds never
  use; use `inkOn` from `@repo/ui/theme/scene`.
- `react-native-gesture-handler@3.4.0`: `usePanGesture`, `GestureDetector`.
- `@shopify/flash-list@2.3.3` for long lists (`List`).
- React Native 0.88: roles via `role`/`aria-*`; `AccessibilityInfo` has
  high-contrast, darker-colours and reduce-transparency queries.

Re-check versions before relying on these after an upgrade.
