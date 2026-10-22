# Worlds: generic components, dressed by a world

Status: foundation landed on `feat/worlds-foundation` (2026-10-22). Settings, the tab bar and the headers are the first dressed surfaces.

## The idea in one paragraph

Gurudevi is open source, so its components have plain, generic names: `Text`, `Button`, `Surface`, `TextField`, `Chip`, `Row`, `Section`, `Switch`. They know behaviour, states and accessibility, and nothing about looks. A **world** is an adapter that dresses them: semantic colour tokens, a dozen style decisions, and the recipes built from those. A person chooses a world (Sanctuary by default, or Temple walls, Wewa, Forest canopy, Angampora, Gems and lace). The world then resolves against the hour of the day and light or dark mode. The poetic vocabulary (the lamp, paper, ola holes) lives in worlds and docs, not in component APIs.

## Layers

```
packages/ui/src/world/
  types.ts      the contract: WorldTokens, recipes, WorldDefinition
  worlds.ts     the six worlds: palettes (light, dark) and style decisions
  build.ts      tokens + style -> recipes (the only place looks are decided)
  resolve.ts    world x phase x mode -> ResolvedWorld (the day moves the light, never the ink)
  color.ts      contrast and mixing helpers (no dependencies)
  css.ts        ResolvedWorld -> CSS custom properties and a stylesheet (web)
  native/       React Native components + WorldContext / WorldScope / useWorld
  dom/          the same components as plain DOM for the Next.js web app
```

Same data, two renderers. That is how mobile and web keep parity.

## Using it

```tsx
import { Button, Row, Section, Text, useWorld } from '@repo/ui/world/native'; // mobile
import { Button, Row, Section, Text } from '@repo/ui/world/dom';            // web

<Section title="Light" voice="Day or night, or follow the hour.">
  <Row label="Follow the hour" accessory={<Switch value={on} onValueChange={set} label="Follow the hour" />} />
</Section>
<Button variant="primary" label="Take attendance" onPress={begin} />
```

- Style the layout around components (margin, flex) as you like. Leave colour, radius and type to the world.
- Need a raw colour value (an icon, a chart)? `const wt = useWorld().tokens;` and use `wt.ink`, `wt.lamp` and the rest. Never hex.
- `lamp` is the one lit thing. On the ground, thin lines and small text use `lampDeep`.
- In className styling, world tokens are also CSS variables: `--w-ground`, `--w-ink`, `--w-lamp` and so on.
- Previews: `<WorldScope world="wewa" mode="dark">…</WorldScope>` renders a subtree in another world.

## How existing screens already follow the world

About 70 files read `useTheme()` and hundreds of classNames read `--phase-*`. `theme/worldBridge.ts` maps any non-default world into that legacy shape. The result is that every screen takes the world's palette today, before it is migrated. Sanctuary keeps the original hand-tuned `phaseMatrix` exactly, so the default changes nothing for current screens.

## Fonts

Mobile previously loaded no custom fonts. The font files were missing and the loader was unused. `apps/gurudevi-mobile/src/boot/WorldFonts.tsx` now loads:
- Newsreader (voice) and Inter (working text) after first paint;
- Noto Serif and Noto Sans in Sinhala or Tamil, only when that language is chosen.

Deep imports keep the bundle to the weights we use. Until fonts arrive, components use the platform serif and system sans.

## Guardrails

- `pnpm check:world` checks two things.
  - Dressed files (listed in `scripts/check-world.mjs`) may not contain raw colours or legacy colour tokens.
  - Everywhere else, the raw hex count (4,139 on 2026-10-22) may only go down. The baseline lives in `tooling/world-ratchet.json`.
- `world.contrast.test.ts` checks every world × phase × mode for text contrast (4.5:1 body, 3:1 large and decorative).
- `primitives.test.tsx` checks roles, states and accessibility of each component.

## Migrating a screen

1. Replace hand-built pieces:
   - `Button`, `SanctuaryButton`, or a `Pressable` styled as a button becomes `Button` (primary, secondary, quiet, danger).
   - A `Box` styled as a card becomes `Surface` (raised, inset, plain), or a `Section` when it groups rows.
   - A settings or list row becomes `Row`.
   - Mood, filter or status pills become `Chip` / `Chips`.
   - `Input` / `Textarea` becomes `TextField`.
   - `Text` with size, weight or uppercase classes becomes `Text kind="display | title | body | label | caption | value"`.
2. Run `node scripts/refactor/tokens-to-world.mjs <file>` for leftover `tokens.semantic.*` / `tokens.colors.*`. Add `const wt = useWorld().tokens;` where needed.
3. Delete raw hex. Add the file to `DRESSED` in `scripts/check-world.mjs`. Run `pnpm check:world --update` to lower the baseline.
4. Look at it in at least Sanctuary (day) and Wewa (night) before calling it done.

Suggested order, by reach:
1. Workspace home and attendance (teachers, daily).
2. Self (daily, calm screens; a fit for the pools-of-light boundary).
3. Library lists.
4. Community feed.
5. Profile.
6. Delete `SanctuaryButton` and `SanctuaryCard` once unused.

## Adding a world

Add a `WorldDefinition` to `worlds.ts`: names in en / si / ta, a light and dark palette, and the style decisions. Run the contrast test, then look at it. Cultural care applies:
- Borrow materials, colours and patterns.
- Never use sacred figures or scenes.
- Credit artists and institutions when their work informs a world.

## Not done yet

- Per-world boundary choice is in the contract (`section` recipes by density). Every world currently uses the "margin" layout on dense screens. Pools of light for calm screens are next.
- Ornament bands (liyawela, ripple, branch) exist as recipe data. Their native drawing waits for the baked-art pipeline (one source, baked to images, screenshot-tested).
- Screenshot tests per world and phase on a real 2GB phone.
