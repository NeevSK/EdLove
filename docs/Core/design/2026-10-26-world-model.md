---
title: "The Gurudevi World Model: One Mental Model for Web, Mobile and Explore"
status: "proposed"
created: 2026-10-26
updated: 2026-10-26
author: "Naveen"
tags: [gurudevi-mobile, gurudevi-web, explore, design, worlds, scene, mental-model]
---

# The Gurudevi World Model

Every screen in Gurudevi, on web, mobile and explore.gurudevi.app, is drawn from one answer to six questions: **which world, what hour, which place, what backdrop, how rich, and what is the person doing.** One shared resolver turns those answers into a `Scene`, and each platform only paints it. This is how the October web floors, the October mobile worlds and the sun-and-moon idea fit together without fighting.

Companion notes: `2026-10-26-living-world-vision.md` (why), `2026-10-26-ui-vision-timeline.md` (how we got here). The interactive mind map and scene lab: https://claude.ai/artifact/Hd9ig5vE7Q5VcNdKrnUpjH

## The six questions

| Question | Layer | Values today | Who decides | Platform state |
| --- | --- | --- | --- | --- |
| Which world? | **World** (identity) | Sanctuary, Temple walls, Wewa, Forest canopy, Angampora, Gems and lace | Person; default Sanctuary | Mobile and web (`packages/ui/src/world`) |
| What hour? | **Time** | 6 phases (predawn 4 to 6, dawn 6 to 9, morning 9 to 12, afternoon 12 to 17, dusk 17 to 20, night 20 to 4), plus the sun or moon's position | The clock; person may pin a phase | Phase on both (`context/utils.ts`); sun position nowhere yet |
| Which place? | **Space** | Self, Classroom or Workspace, Community, Library, Profile | Navigation | Docs only (space specs); web floors partly |
| What backdrop? | **Ground** | Living sky, wallpaper (preset, own photo, slideshow), solid colour, plain | Person; default living sky | Web: wallpaper, slideshow, colour wash. Mobile: `WorkspaceWallpaper` built but not mounted |
| How rich? | **Budget** | Rich, balanced, essential | The phone (device tier now, verger later) | `core/efficiency` visual budget; verger unmounted |
| What is the person doing? | **Expression** | Quiet utility, living primary, sacred hero | The screen's role | Doctrine only (aesthetic doctrine, section 10) |

The companion (firefly, Tutii) sits outside the stack. It is the only thing allowed to move on its own.

## How the layers stack

Back to front, matching the scene token hierarchy (world, chrome, canvas, surface, elevated, interactive):

1. **Sky or ground.** The living sky, the wallpaper, a solid colour or plain world ground. Time of day acts here and only here.
2. **Atmosphere.** None, washi grain, aurora, or embers. Optional, and only at the rich tier.
3. **Wash.** A tint that keeps the backdrop behind text quiet: the world's ground at a set opacity, or the person's own colour.
4. **Place accent.** A small shift per space, carried by `WorldScope`.
5. **Surfaces and controls.** World recipes (`Surface`, `Section`, `Row`, `Button`). They never change with the hour, so text contrast is the same at noon and at night.
6. **Companion.** Firefly or Tutii.

Rule: layers 1 to 4 may be rich, and layer 5 stays readable. The existing contrast test guards layer 5 for every world, phase and mode. A new test should guard the wash: text over any backdrop at any tier must stay at 4.5:1.

## The living sky, and what the sun and moon cost

The local experiment drew a sun or moon that moves with the time on an HTML canvas. It looks alive, but a canvas animation loop costs battery on every frame. The model keeps the look and drops the loop. The sun moves about 0.25 degrees a minute, so redrawing once a minute already looks continuous.

| Tier | When | Sky | Sun or moon | Atmosphere | Cost |
| --- | --- | --- | --- | --- | --- |
| Rich | Mid or high phone, not hot, not on battery saver | Painted gradient with 3 stops, horizon glow | Disc on its arc, redrawn once a minute; moon phase drawn | Grain, aurora or embers allowed | One redraw a minute plus an optional ambient layer |
| Balanced | Default on 2GB phones | 2-stop gradient | Static disc placed by the hour, updated on phase change | None | One redraw per phase (6 a day) |
| Essential | Battery saver, overheating, data saver plus low-end | Flat world ground with the phase tint | None | None | Zero |

Implementation notes:

- **No `requestAnimationFrame` and no Skia loop for the sky.** Mobile uses a Skia or SVG picture, or two `expo-linear-gradient` layers, rerendered by a one-minute timer that pauses when the app is in the background. Web uses CSS gradients and one absolutely positioned element.
- **Sun times:** the phone clock with fixed phase hours, which is today's behaviour. An optional "true sky" mode would use sunrise and sunset for Sri Lanka, which vary only about 6:00 to 6:30 and 17:50 to 18:30 across the year (approximate). It is a small formula with no network.
- **Embers (web `FloorAtmosphere`)** keep their 35 fps cap and reduced-motion guard, but only at the rich tier and never on mobile by default.
- **Reduced motion:** the sky still changes with the hour (that is not motion), but the slideshow and atmosphere stop.

## Opinionated default, full freedom

The default shows how beautiful the world is. Every choice can be undone in one tap, down to a plain solid colour.

| Choice | Default (opinionated) | Freedom (person can set) |
| --- | --- | --- |
| World | Sanctuary | Any of six; preview each at the current hour before choosing |
| Time | Follow the hour | Pin a phase; follow Sri Lanka sunrise (true sky); light or dark only |
| Ground | Living sky | Preset wallpaper, own photo, slideshow (3, 5 or 15 min), solid colour, plain |
| Wash | World ground at the tier's opacity | Own colour; strength |
| Atmosphere | None on mobile; washi grain on web rich tier | Grain, aurora, embers, none |
| Per space | Same everywhere, with place accents | Different ground per space (web already stores per workspace) |
| Richness | Set by the phone | Visual detail setting: full, balanced, simple (verger's setting, R12) |

The taste behind the default, as gathered from the docs: washi and vellum paper, lamp light, warm ink, one lit thing at a time, Secret of Kells density held in small places, Columbus stillness, Swiss order, Sri Lankan materials (lime plaster, tank water, brass, beeralu lace), Dalu leaves after rain, aurora, the lotus. The taste avoids glassmorphism, black shadows, neon, emoji as decoration and badges everywhere. If this does not match Naveen's own sense of it, this list is the place to correct.

## Showing how rich a world can be

- **World gallery** (Settings and explore). Each world appears as a live card at the current hour, using `WorldScope`. A "play the day" slider runs predawn to night in a few seconds.
- **explore.gurudevi.app** is the showroom. It runs the same resolver in showcase mode: rich tier where the device allows, one world per visit, and a "make it yours" panel that shows the same freedoms. It uses browser-local fixtures only, as the dual-surface contract already requires.
- **Hero moments** (arrival, completion, empty states) get the full scene. Ordinary screens stay quiet, so the hero moments stand out.

## The time plug: two clocks

Explore's date row (`TemporalHorizon`, with `current`, `review` and `plan` intents from `@repo/core/logic/workbench`) already lets a teacher travel to the past to review and to the future to plan. The model adds a time part and separates two clocks:

- **Now** is the real time. It drives the sky and never jumps when someone browses dates, so the world stays where the person actually is.
- **Focus** is the date and time being looked at. It drives the data: register, timetable, journal.

The time plug is one core cursor, `{ date, minute | null, intent }`, with three optional parts. Each space plugs in the parts it needs.

| Part | What it shows | Options | Used by |
| --- | --- | --- | --- |
| Date strip | Days, with past and future labels (exists) | Week starts Monday or Sunday; markers for poya days, school terms, exams and holidays | Workspace, Self, timetable |
| Time strip | The school day as periods, scrubbable | Periods from the timetable or plain hours; 12 or 24 hour | Workspace, timetable, attendance |
| Clock face | The current time | None, digital, sky arc (the living sky is the clock) or a world-styled dial; redrawn once a minute | Home header, Self |

How it stays alive without jumping:

- When Focus is not Now, the time strip shows a small sky chip for that hour, drawn with `WorldScope`. Planning tomorrow at 08:00 shows a dawn chip, while the real sky stays as it is.
- Review gets the canon's "memory" colour role (a slightly cooler and paler wash), and plan gets "invitation" (a little more lamp). The difference is small and readable, and it is never the only cue, because the label says "3 days ago" or "In a week".
- Poya days line up with the moon phase drawn in the rich sky, so the calendar and the sky agree.
- Returning to Now is one tap ("Today", which already exists) and settles with one short motion.

Fix when this is built: `TemporalHorizon` formats dates with `en-US` and writes "Yesterday" and "In a week" in English only, so Sinhala and Tamil are missing.

## Living atmosphere: particles, seasons and prior art

Animated scenes with falling leaves or butterflies in React Native (Skia draws, Reanimated runs per-frame physics on the UI thread) are practical on mid and high-end phones. The author reported that low-end Android had not been tested. In this model they are an **atmosphere** option at the rich tier only:

- Cap particle count (12 to 20), run at 30 fps, pause when the screen is not focused or the app is in the background, and stop on battery saver or heat. Verger can supply these signals once it is mounted.
- Settle after arrival. Particles drift for a few seconds on the home screen or in a hero moment, then rest, so the surface stays quiet.
- Use Sri Lankan seasons, not autumn: monsoon rain (Yala, Maha), fireflies at dusk (which ties to the companion), and drifting petals in April. Religious festivals such as Vesak need the same cultural care as the worlds, and their decoration should not be used as ornament.
- System live wallpapers (outside the app) are out of scope. They are only practical on Android and they cost battery all day.

Prior art. Each piece has been done before; the combination has not, as far as this note knows. Time-of-day wallpapers: macOS Dynamic Desktop (2018). Weather and hour backgrounds: Apple Weather and Pixel. Real-clock worlds: Animal Crossing, and the day cycles in Alto's Odyssey and Sky. Calm scenes: Calm and Headspace. No school platform is known to combine culturally grounded worlds that follow the real hour with a device budget for low-end phones and a planning timeline that can show another hour's sky. Check this against current sources before stating it publicly.

## One resolver, three painters

```
@repo/core  resolveScene({ world, phase, minute, space, ground, wash, atmosphere, tier, showcase })
            -> Scene { sky, celestial, atmosphere, wash, accent, tokens }
   |                         |                          |
 mobile painter         web painter                explore
 (RN, gradients/SVG)    (CSS, DOM, canvas rich)    (web painter, showcase: true)
```

- `resolveScene` is pure data, like `resolveWorld` today, and goes in `@repo/core` (or `@repo/ui/world`) so both apps share it.
- It reads `WorkspaceAppearance` (already in `@repo/core/types`, synced through Supabase) for the ground, so a wallpaper chosen on the web shows on the phone too.
- The tier comes from `resolveRuntimeVisualBudget` (`core/efficiency`) now, and from verger once it is mounted.

## Old vocabulary mapped to the model

| Existing thing | Where it goes |
| --- | --- |
| Web appearance presets: Sandstone, Dawn Coral, Verdant, Night Twilight, Off | Retire as separate presets. They are world plus phase (Sanctuary afternoon, Sanctuary dawn, Forest canopy, Wewa night) and "plain" |
| Web custom colour wash | Wash layer, kept |
| Web `FloorAtmosphere` (washi grain, aurora mesh, celestial embers) | Atmosphere layer, rich tier |
| Web floors and furniture | Space layer (floors are clearings on the web); furniture is layout, outside the scene |
| Web `DiurnalThemeToggle` | World and time choice, the same as mobile Settings |
| Mobile `SanctuaryBackground` (Feb 24) | Replaced by the living sky painter |
| Mobile `WorkspaceWallpaper` | Ground layer painter for wallpapers; mount it |
| `phaseMatrix`, `worldBridge` | Legacy tokens; shrink as screens migrate |
| Archetypes, profiles | Worlds |
| Living Theme toggle (`enableLivingTheme`) | "Follow the hour" |

## Findings in the current code

- Web preset wallpapers Bamboo Grove, Misty Peaks and Cosmos load from `images.unsplash.com` at 1920px. That costs data, fails offline and is outside the Supabase asset authority. Bundle them, or host them in the same asset store as user uploads.
- The web presets' labels use emoji (☀️ 🌅 🌿 🌌 ⚪). The worlds work removed emoji from labels on mobile.
- Mobile `WorkspaceWallpaper` is built and budgeted but not mounted on any screen.
- Phase hours are fixed in `packages/ui/src/context/utils.ts`. Nothing computes a sun position.

## Order of work toward the anniversary (2026-11-03)

1. `resolveScene` in core, with tests: contrast over every backdrop and tier, and the tier mapping.
2. Mobile living sky painter at the balanced tier, on the home header and behind the tabs. Screenshots at dawn, noon, dusk and night in Sanctuary and Wewa.
3. Mount `WorkspaceWallpaper` on mobile through the ground layer, sharing `WorkspaceAppearance` with the web.
4. Web: map the presets to world plus phase, bundle the Unsplash wallpapers, and route `FloorAtmosphere` through the tier.
5. World gallery with "play the day", in Settings and on explore.
6. Rich tier: sun and moon arc, true-sky mode.

Steps 1 to 3 fit in a week. Steps 4 to 6 follow and can each be shown on their own.

## Open questions for Naveen

- Should the default ground be the living sky, or the plain world ground with the sky only in headers?
- Should the true-sky mode (sunrise times) be the default, or the fixed phase hours?
- Should a wallpaper chosen on one device follow the person to the other? (The data model already allows it.)
- Should explore show one world per visit, or let visitors switch freely?
