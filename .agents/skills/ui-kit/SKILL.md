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

## Checklist for a new component

- [ ] `XContract` in `theme/contracts.ts`
- [ ] recipe reused, or a builder in `theme/build.ts` (+ type in `types.ts`)
- [ ] native `components/native/X/X.tsx`, web `components/web/X/X.tsx`
- [ ] web rules in `theme/kitCss.ts` (only `var(--w-*)`)
- [ ] exported from both barrels
- [ ] feedback: `useFeedback()` with an event name (no direct haptics), `usePressMotion()` on pressables, `useErrorFeedback(error)` on fields
- [ ] native tests in `components/native/__tests__`, web tests in
      `apps/gurudevi-web/tests/unit/kit`
- [ ] gallery entry on both platforms
- [ ] typecheck, both test runs, `check:ui-boundaries`, `check:world`

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
