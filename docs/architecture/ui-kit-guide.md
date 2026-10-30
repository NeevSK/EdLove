---
title: "UI Kit Guide: how to add, change and retire components, worlds and recipes"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Claude"
tags: [ui, kit, worlds, theme, tokens, components, guide, a11y]
---

# UI Kit Guide

The working manual for the Gurudevi UI kit. Read it before adding or changing
any UI. The plan and its history are in
[`2026-10-29-ui-component-system-rebuild-plan.md`](2026-10-29-ui-component-system-rebuild-plan.md);
this page is how to do the work. The skill `.agents/skills/ui-kit/SKILL.md`
points here.

## 1. The model in one picture

```
@repo/ui/tokens        fixed scales: spacing relations, radii, sizes, motion durations
@repo/ui/theme         the world engine (platform-neutral, no React Native, no DOM)
  worlds/              one definition per world: palette + style decisions
  build.ts             style decisions -> recipes (button, surface, field, chip, row,
                       section, overlay, toggle, status ...)
  resolve.ts           resolveWorld(world, phase, mode) -> tokens + recipes
  contracts.ts         the props every component has on both platforms
  scene/               the one clock (phaseAt), sky, season, weather, landscape
  signs.ts perches.ts  shared drawings, rendered by both platforms
  css.ts kitCss.ts     recipes -> CSS variables and rules for the web
  native/ web/         the active world on each platform (useWorld / WorldStyles)
@repo/ui/components
  native/<Name>/       React Native components (recipes -> StyleSheet)
  web/<Name>/          DOM components (classes gd-* + var(--w-*))
  shared/              platform-neutral kit logic (toast queue, range maths, initials)
```

A world is a palette plus about a dozen **style decisions** (`WorldStyle`:
corners, primary fill, quiet form, raised edge, field and chip form, label
voice, display, line weight, boundary, ornament). `build.ts` turns those into
**recipes**, one per component family. Components read recipes and never
hard-code a colour, radius, font or duration. That is why one new builder
covers every world at once, and why a new world needs no component changes.

Everything else in `@repo/ui` (Gluestack-style `components/ui`, `primitives`,
flat `components/*`, `theme/Theme`, `worldBridge`) is **legacy**: frozen, no new
imports (`pnpm check:ui-boundaries` counts them and fails if the count rises).

## 2. Where does my change go?

| I want to... | Change | Not |
| :--- | :--- | :--- |
| a new control or layout piece | `theme/contracts.ts` + `components/native/X` + `components/web/X` | an app folder, a flat `components/*` file |
| one look in every world | the builder in `theme/build.ts` | a component |
| one look in one world | that world's `refine` | a component, an `if (world === …)` |
| a fixed number (spacing, size) | `tokens/` | a component constant used twice |
| logic both platforms share | `components/shared/` (no React Native, no DOM) | copy-paste in both |
| data fetching, domain rules | the feature package or `@repo/core` | any kit component |
| a feature made of kit parts | its feature package (`@repo/self`, …) or the web app | the kit barrels |

The kit never imports `@repo/core` at runtime. A component that fetches is a
feature, not a kit component (the Todo view was moved out for this reason).

## 3. Playbooks

### 3.1 Add a component (both platforms)

1. **Contract.** Add `XContract` to `theme/contracts.ts`: only the props both
   platforms share, each with a one-line doc comment.
2. **Recipe.** Reuse an existing recipe first (tabs reuse chips, segments reuse
   surfaces, icon buttons reuse button variants). Add a builder to `build.ts`
   only when worlds must look different in a way no recipe expresses; derive it
   from tokens and `WorldStyle`, add its type to `WorldRecipes` in `types.ts`.
3. **Native.** `components/native/X/X.tsx`: `XProps extends XContract` plus
   native extras (`style`, `haptic`). Style from `useWorld().recipes`; roles and
   names on the element that is the control (`role`, `aria-*`, `accessible`).
4. **Web.** `components/web/X/X.tsx`: semantic HTML first (`<button>`,
   `<input>`, `<dialog>`, `<table>`); class `gd-x` and rules in `theme/kitCss.ts`
   using only `var(--w-*)`. If a value differs per world but not per
   mode/phase, emit a per-world variable in `shapeVars` (kitCss).
5. **Barrels.** Export from `components/native/index.ts` and
   `components/web/index.ts`.
6. **Tests.** Native: `components/native/__tests__/*.test.tsx` (Vitest + React
   Native Testing Library). Web: `apps/gurudevi-web/tests/unit/kit/*.test.tsx`
   (Testing Library + user-event; `@repo/ui` has no react-dom types). Cover the
   accessible name and role, every state, keyboard paths, and one assertion
   across all worlds where looks come from a recipe.
7. **Gallery.** Add it to the gallery route on each platform (step 1.9).
8. **Checks** (section 6).

### 3.2 Change how something looks

- Every world: edit its builder in `build.ts`; run the contrast test.
- One world: that world's `refine` in `theme/worlds/<id>.ts`.
- A new kind of difference between worlds: add a field to `WorldStyle`, set it
  in every world, read it in the builder. Prefer deriving from existing fields.

### 3.3 Add a world

Until 1b.0 lands (one folder per world), a world touches seven places:

1. `theme/types.ts`: add the id to `WorldId`.
2. `theme/worlds/<id>.ts`: names (en, si, ta), description, family, palette
   (light and dark tokens via `tokens()`), style decisions, preferred mode.
3. `theme/worlds/index.ts`: register it in `WORLDS`.
4. `theme/faces.ts`: its `FACES` and `MOTION` entries.
5. `theme/signs.ts`: its waiting sign in `SIGNS` (reuse a kind or add one, with
   native drawing + web keyframes).
6. `theme/perches.ts`: its perch shapes.
7. `scripts/fonts/world-fonts.json` and the embedded font files if it brings
   new faces.

Then run the contrast test: it checks the new world in all 12 mode × phase
themes. Nothing in components changes.

### 3.4 Remove a world

Delete it from the same places. People who had chosen it fall back to the
default (`isWorldId` guards saved choices). Removing a world deletes working
behaviour, so ask for sign-off first (Deletion Veto).

### 3.5 Migrate a screen off legacy

Replace legacy imports with kit components, one feature package per commit;
colours through the world (`w-*` NativeWind classes on native, `var(--w-*)` on
web); lower the ratchets (`node scripts/check-ui-boundaries.mjs --update`,
`node scripts/check-world.mjs --update`) once counts drop.

### 3.6 Retire legacy code

Only after its last importer is gone, listed in the deletion ledger (plan
section 7) and signed off.

## 4. Rules that are easy to miss

- **Colours**: never hex or rgba in kit or dressed files; `check:world` fails.
  Overlay tints use `color-mix` with world variables (web) or `alpha()` (native).
- **Motion**: `scheduleOnRN` / `scheduleOnUI` from `react-native-worklets`
  (`runOnJS`/`runOnUI` are deprecated in the installed 0.13.1 and in
  Reanimated 4.7.1); shared values with `.get()` / `.set()`; respect the world's
  motion level (`useWorldMotion().animates`) and `prefers-reduced-motion`.
- **Gestures**: RNGH 3 hook API (`usePanGesture`, `GestureDetector`). Every
  gesture has a non-gesture path (accessibility actions, buttons).
- **Accessibility**: the element that is the control carries the role and
  name; containers (`dialog`, `list`, `table`) are not made `accessible` on
  native (that would merge their contents for VoiceOver). Text in buttons is
  the accessible name. Touch targets at least 44.
- **Lists**: no `ScrollView` + `.map()` for data (`check:native-slop` blocks it);
  use `List`. Chrome like tabs wraps instead.
- **Spacing**: say the relation (inside, between, group, section), not a number
  (plan section 13).
- **Overlays and wrappers**: never wrap screens in views for runtime concerns;
  feed them from existing roots and hooks.

## 5. Known traps (learned the hard way)

| Trap | What to do |
| :--- | :--- |
| RNTL `getByRole` finds only accessible elements | find containers by `getByLabelText`, then assert `props.role` |
| Hidden-from-a11y nodes are skipped by queries | pass `{ includeHiddenElements: true }` |
| jsdom has no `dialog.showModal()` | substitute open/close in the test; focus trapping needs a browser (G4) |
| FlashList needs real layout | test its loading/empty states; check items on a device (G5) |
| RN 0.88 `Text` has no `hitSlop` | pad the parent instead |
| `@repo/self`, `@repo/admin` typecheck against `packages/ui/dist` | after kit changes run `tsc --build` in `packages/ui` to refresh declarations |
| PowerShell `WriteAllLines` writes CRLF | join with `` `n `` or fix endings before committing |
| Other sessions edit this checkout | commit only your files; for shared files stage HEAD + your hunks |

## 6. Checks before you call it done

```bash
cd packages/ui && node --max-old-space-size=6144 ../../node_modules/typescript/bin/tsc --build --noEmit; cd ../..  # G0
pnpm --filter @repo/ui exec vitest run --config vitest.config.mts src/theme src/components                         # G1 native + theme
pnpm --filter gurudevi-web exec vitest run tests/unit/kit                                                          # G1 web
node scripts/check-ui-boundaries.mjs
node scripts/check-world.mjs
```

Report results with their evidence level (AGENTS.md section 6). G4 (browser)
and G5 (device) come from the gallery routes.
