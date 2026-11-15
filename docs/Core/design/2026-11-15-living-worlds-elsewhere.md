---
title: "Living worlds elsewhere: what others do and what Gurudevi takes"
status: "active"
created: 2026-11-15
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [worlds, research, verger, themes, ledger]
source: "https://claude.ai/artifact/EvVAWKsy7co32QsFetCK7r"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/EvVAWKsy7co32QsFetCK7r so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. The ledger at the end lists what Gurudevi adopted, what is worth adopting, and what was left out.

# Living worlds elsewhere: what others do and what Gurudevi takes

Nov 15, 2026 · @Neev

Many products now let a look change the whole app, and some make it live. None we found combines all three things Gurudevi does: a world that themes components and behaviour, a scene driven by the real hour, season and weather, and one runtime (verger) that decides how much of it a cheap phone may show. Each section below says what one product does, then what Gurudevi takes from it. The last section is the ledger: already adopted, worth adopting, and deliberately left out.

Words used: **Sanctuary** (the app), **rooms** (each tab), **floors** (what a room lays out), **worlds** (the skin and its behaviour), **scene** (the living sky behind), **verger** (the runtime that budgets quality), **World Behind Screens** (the person's setting: Lively, Balanced, Calm).

## Claude Code desktop themes (mods, November 2026)

A Claude theme is colours plus one background, set once per session; components keep their shape and motion. Read from the mod authoring guide and API types shipped with Claude Code 2.1.325.

- **One call, one theme.** A mod calls `theme.set({ colors, backdrop })` at session start. A later set replaces the whole theme; there is no stack or cascade.
- **Few colours in, about 100 out.** The author gives 7 greys (surface-0 to surface-3, three text strengths) and 5 roles (accent, danger, success, warning, pro). A helper derives the rest, keeping each role's hue and setting its lightness. Code highlighting is coloured from the same roles.
- **Unreadable means unpainted.** If text contrast is too low, the desktop app ignores the whole palette and keeps its own.
- **Scene as a bounded asset.** One SVG of at most 131,072 characters, animated only by CSS, no scripts, nothing loaded. Or a still ground: colour, gradient, vector or image (at most 1 MiB, 4096 px).
- **Glass for readability.** Blur, tint and opacity over the scene. Desktop frosts each panel; mobile lays one veil and does not blur yet.
- **Placement rules.** Keep the scene's subject away from the middle (words) and the foot (message box); fit any screen with `slice` and pinned nested SVGs.
- **Safety surfaces stay plain.** Permission prompts always keep the app's own look.
- **Not in the API:** reduced motion, battery or device budget. The scene's CSS loop just runs.
- **Shared as packages.** The official theme-examples plugin carries 20 scenes; anyone can publish one.

**What Gurudevi takes:** fewer hand-picked colours per world, a runtime refusal of unreadable colours, plain safety surfaces, and a size cap per scene.

## Google: Material You dynamic colour (Android 12, 2021 onward)

Material You turns one source colour, usually taken from the person's wallpaper, into a whole app palette whose contrast is guaranteed by construction.

- **Source to key colours.** One source colour becomes five key colours: primary, secondary, tertiary, neutral and neutral variant.
- **Tonal palettes.** Each key colour becomes a palette of tones from 0 (black) to 100 (white) in the HCT colour space, where tone is perceived lightness.
- **Roles pick tones, not colours.** A role such as "text on primary" always uses a fixed tone pair, so any hue stays readable. Contrast levels (standard, medium, high) shift those pairs.
- **Components read roles only.** Buttons, cards and chips never name a hex; that is why one wallpaper can restyle the whole system.

**What Gurudevi takes:** the same idea as Claude's anchors, older and better documented. A world could name a hue and a mood, and the tones for ground, raised, sunken, inkSoft and inkFaint follow from lightness rules. Gurudevi's `WorldTokens` already work like roles (components read `lamp`, never a hex), so the change is in how a world is authored, not in components.

## Apple: glass, time-of-day wallpapers and the Weather app

Apple shows the two halves Gurudevi joins: a material that reacts to what is behind it, and pictures that follow the sun. Its accessibility switches are the part to copy most closely.

- **Liquid Glass (iOS 26, 2025).** Controls and bars are a translucent material that bends and tints with the content behind. With Reduce Transparency it becomes frosted and more opaque; with Increase Contrast it gains borders.
- **Dynamic Desktop (macOS, since 2018).** One wallpaper holds several pictures of a place across the day, switched by the sun's position at the person's location.
- **Weather app.** The background animates to the actual conditions and hour: rain, cloud, night sky.
- **Reduce Motion.** System animations become fades; apps are expected to honour the same flag.

**What Gurudevi takes:** the Weather app is the nearest relative of `resolveScene` (hour, season, weather, moon), but it lives in one app screen, not behind every room. Gurudevi already reads Reduce Transparency and High Text Contrast (`theme/native/access.ts`) and Reduce Motion (`core/hooks/useAccessibility.ts`). Worth checking that each one reaches verger as a ceiling, so Reduce Transparency always means frost becomes paper.

## Windows Mica and Android live wallpapers

These two are the strongest lesson for a 2 GB phone: make the expensive look cheap by doing it once, and stop it entirely when nobody can see it.

- **Mica samples the wallpaper once.** Microsoft's Mica material tints a window from the desktop wallpaper, but it captures the wallpaper only once, which Microsoft says is why it is built for app performance. Acrylic, the real live blur, is kept for short-lived surfaces like menus.
- **Mica's fallbacks are a list, not a guess.** It drops to a solid fill when transparency is off, Battery Saver is on, the hardware is low-end, the window is inactive, or Windows is too old.
- **Android live wallpapers** run as a wallpaper service whose engine is told when it becomes visible or hidden. The expected practice is to stop drawing when hidden.

**What Gurudevi takes:** verger already follows both. `wallpaperAllowed` turns decorative wallpapers off for low fidelity, a hidden app, battery saver and any network limit, almost the same list as Mica's. `resolveScene` holds a hidden scene still and drops frost to paper when visual effects are short. The new idea is Mica's "sample once": on a low tier, a frosted card could take one tint from the scene when the hour changes, instead of blurring live.

## Games: worlds on the real clock, and quality that adapts

Games solved "a living world on weak hardware" decades ago; Gurudevi's verger is a game-style quality governor applied to an app.

- **Real clock and calendar.** Animal Crossing uses the console's own clock and calendar, so in-game time, season and time of day match reality, and some events fall on set dates. Gurudevi's Poya and season logic is the same idea in a Sri Lankan calendar.
- **Day and night cycles.** Most open-world games colour the whole world, not only the sky, by the hour. Gurudevi does this through the scene palette and `skyInk`.
- **Quality presets and dynamic resolution.** Games offer Low to Ultra presets and, while running, lower the rendering resolution to hold a frame rate. That is verger's tiers (rich, balanced, essential) and its fps choice of 0, 15 or 30.
- **Level of detail.** Far objects use cheaper versions. Gurudevi's low tier using pre-rendered Skia pictures with a few moving layers is the same trade.

**What Gurudevi takes:** confidence that verger is the right shape. One game habit worth checking for: a visible frame-time overlay for testers, which would make the A52 and A24 runs easier if verger's dev tools don't show one yet.

## Calm apps and calm technology

The closest relatives in spirit are apps where a small living picture carries meaning, and the design principle that technology should sit in the periphery.

- **Calm technology** (Weiser and Brown, 1990s; principles by Amber Case): technology should need the smallest possible amount of attention, should use the periphery, and should move to the centre only when needed and back again.
- **Forest-style focus apps.** A tree grows while you stay focused; the picture is the progress, not decoration.
- **Calm, Headspace and similar.** A nature scene and sound set the mood of the whole session.
- **Duolingo.** A character, streaks and celebrations give the app a personality that reacts to what you did.

**What Gurudevi takes:** this is where Gurudevi is already ahead of Claude's themes. World Behind Screens (Lively, Balanced, Calm) and per-screen presence (full, band, quiet) are calm technology in practice: the scene stays in the periphery on working screens. Tutii, celebrations and perches play Duolingo's role. The open idea from Forest is letting the scene carry real meaning, for example the time lens or a class's progress showing in the sky, rather than only the hour.

## Web and design-system plumbing

The web now has standard ways to carry a look and the person's comfort settings; Gurudevi's web app can lean on them instead of inventing its own.

- **Design tokens format.** The W3C Design Tokens Community Group published its first stable format, version 2025.10, in October 2025: one JSON shape for colours, sizes and motion that design tools and code both read.
- **Comfort media queries.** `prefers-reduced-motion`, `prefers-contrast` and `prefers-reduced-transparency` pass the person's OS settings to a web page. Reduced transparency is still experimental and not in every browser.
- **VS Code and Obsidian themes.** Both have big community galleries. VS Code themes set hundreds of named colour keys by hand, and many look broken in corners; Obsidian themes override CSS variables. The lesson is the opposite of Material: the more keys an author must fill, the more themes break.

**What Gurudevi takes:** writing each world in the design tokens format would let a designer edit a world in a tool, and would make worlds shareable later. The web app already uses all three comfort queries (about 47 reduced-motion rules, 4 each for contrast and transparency), and `verger-web` reads reduced motion. The gap is that contrast and transparency live only in CSS files, so verger cannot use them to calm the scene.

## Ledger: adopted, worth adopting, not adopting

Nine ideas are already in Gurudevi, nine are worth adopting, and four are deliberately left out. Change a row's status as decisions land.

| Idea | Seen in | Gurudevi today | Status |
| --- | --- | --- | --- |
| Components read roles, never a hex | Material You | `WorldTokens` (`lamp`, `ink`, `ground`) used by every component | Adopted |
| Scene from the real hour, season, weather and moon | Apple Weather, games | `resolveScene`, with Poya and Sri Lankan seasons | Adopted |
| Quality tiers and a frame-rate budget | Games | verger tiers rich, balanced, essential; scene fps 0, 15 or 30 | Adopted |
| Stop when hidden; off on battery saver, low fidelity, data limits | Android live wallpapers, Mica | `wallpaperAllowed`; hidden scene holds still | Adopted |
| Frosted cards fall back to plain paper | Mica, Claude mobile veil | `resolveScene` drops frost when visual effects are short | Adopted |
| Text contrast checked over the scene | Claude | `sceneContrast.test`: every world, hour and weather, at build time | Adopted |
| OS comfort settings respected | Apple, web | Reduce Motion, Reduce Transparency, High Text Contrast on phone; `prefers-*` on web | Adopted |
| Scene stays in the periphery on working screens | Calm technology | World Behind Screens (Lively, Balanced, Calm) and presence full, band, quiet | Adopted |
| Cheap pictures instead of live drawing on low phones | Games (level of detail) | Low tier = pre-rendered Skia pictures plus few moving layers; planned, not yet measured on a phone | Adopted |
| Derive most world colours from a few anchors | Material You, Claude | Each world hand-picks 16 colours per mode; only `line` is derived | Worth adopting |
| Refuse unreadable person-chosen grounds while running | Claude | Not confirmed for photo grounds; fall back to the world's ground | Worth adopting |
| Keep safety screens plain in every world | Claude permission prompts | Pick the list: consent, safeguarding reports, payments | Worth adopting |
| Size cap per scene asset, checked automatically | Claude (131 KB SVG) | No cap or lint yet | Worth adopting |
| Sample the scene once for a frosted tint on low tier | Windows Mica | Today frost is on or off | Worth adopting |
| Every comfort setting as a verger ceiling | Apple, web | Web contrast and transparency live only in CSS | Worth adopting |
| Worlds written as design-token data, shareable | Design Tokens 2025.10, Claude theme-examples | Worlds are TypeScript objects, close to data | Worth adopting |
| Scene carries meaning, such as progress or the time lens | Forest | Scene follows time and weather only | Worth adopting |
| Frame-time overlay for testers | Games | Check verger dev tools before building one | Worth adopting |
| One theme replaces everything, no cascade | Claude | Gurudevi needs world, room, screen kind and the person's setting | Not adopting |
| Palette taken from the person's wallpaper | Material You | Worlds carry cultural meaning; a photo sits inside a world as its ground | Not adopting |
| Hundreds of hand-filled colour keys | VS Code themes | The more keys an author fills, the more themes break | Not adopting |
| Live blur everywhere | Acrylic, Liquid Glass | Too costly for 2 GB phones | Not adopting |

## Sources

Opened and read for this doc:

- Claude Code mod authoring guide and API types, bundled with Claude Code 2.1.325 (theme, backdrop, glass, colours)
- [ClaudeDevs announcement](https://x.com/ClaudeDevs/status/2121392666244186327) and [Claude mods docs](https://code.claude.com/docs/en/plugins/mods/overview)
- [Starry Hope review of Claude Code mods](https://www.starryhope.com/linux/claude-code-mods-omarchy/) and [daily.dev summary](https://daily.dev/posts/claude-code-on-desktop-adds-custom-themes-through-mods-4hiuiwznn) (theme-examples names are second-hand)
- [Microsoft: Mica material](https://learn.microsoft.com/en-us/windows/apps/design/style/mica)
- [Design Tokens Community Group](https://www.designtokens.org/)
- [MDN: prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency)
- [Calm Technology principles](https://calmtech.com/)
- [Wikipedia: Animal Crossing](https://en.wikipedia.org/wiki/Animal_Crossing)
- Gurudevi code on `integrate/worlds-and-upstream`: `packages/ui/src/theme/scene/resolveScene.ts`, `packages/ui/src/theme/worlds/`, `packages/core/src/verger/wallpaper.ts`, `packages/ui/src/theme/native/access.ts`

From general knowledge, not re-checked today (the official pages did not load): Material You tonal palettes, Apple Liquid Glass and Dynamic Desktop, Android live wallpaper visibility, game quality presets, Forest, Calm and Duolingo.
