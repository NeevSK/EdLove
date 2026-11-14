---
title: "Gurudevi UI Vision Timeline: What the Docs Said vs What Was Coded"
status: "active"
created: 2026-10-26
updated: 2026-10-26
author: "Naveen"
tags: [gurudevi-mobile, gurudevi-web, design, history, timeline]
---

# Gurudevi UI Vision Timeline

The vision has stayed the same since the first missions: a living sanctuary that breathes with the teacher's day, a lotus, five spaces, on cheap phones, in three languages. What changed was the vocabulary and the vehicle. The biggest single finding is that mobile had a visible living backdrop in February 2026 and lost it in June, while the web went on to get wallpapers and atmosphere layers in October.

Method: every branch of `NeevSK/EdLove` (commits from 2025-11-03 to 2026-10-26), design-doc `created:` dates (most docs were moved on 2026-09-08, so the git date alone misleads), and code searches on `terrain/version-hops`. Chats are not included. The ICT4Edu chat was too long to read in full.

## At a glance

| When | Design docs said | Code did | Fate |
| --- | --- | --- | --- |
| Before Feb 2026 | Missions 01 to 06; Sanctuary aesthetic; Lotus; studium and punctum | Repo starts 2025-11-03 (10 commits to Jan) | Lasting |
| Feb 3 to 14 | Font strategy; UI abstraction layer | `Theme.ts`, Abhaya Libre, Baloo Thambi 2 and Noto fonts; `LotusPetalFAB` with breathing; `SanctuaryCard`, `MoodLotus`, Fire Journal; "time-aware UI" (Feb 6); `EnvironmentGuard` and 4-phase temporal theme (Feb 13) | Fonts later dropped on mobile until Oct 22; FAB lasting |
| Feb 14 | neevsk-web: six themes (Home, Nature, Twilight, Light Tech, Warm Archive, Digital Neon) | Built in `apps/neevsk-web` | Temporary: extracted to its own repo on Aug 24 |
| Feb 24 to 25 | **Living Theme System**: 6 phases (predawn to night) x light and dark; night as "Cosmic Star Temple", dusk as "deep ocean" | 6-phase token matrix, `useTheme()`, **`SanctuaryBackground`** crossfading gradient mounted in `TabNavigator`, glass tab bar, `enableLivingTheme` toggle in Settings | Matrix lasting; **visible backdrop lost on mobile by Jun 9** |
| Feb 27 to 28 | Design constitution: design language (Dalu leaves after rain, aurora, Secret of Kells, Book of Kells, lotus), five-clearings space specs, design retina, Skia guide, component library, aliveness and growth model, EVOLUTION.md | Skia black-screen fix, `GlassCard`, `NoiseOverlay`, `ThemedIcon`, `SanctuaryModal`; legacy colours renamed to Sanctuary tokens | Doctrine lasting; Skia scene never shipped as the default |
| Mar 1 to 7 | Web standards, reduced motion | Web "WOAH": temporal background, lotus particles, cursor (Mar 1); adaptive web theme system, PR #97 (Mar 7) | Lost: PR #97 closed unmerged on Jun 10 |
| Mar 20 | Aesthetic doctrine ("Swiss clarity, silk elegance, ecological aliveness, sacred illumination"; vellum, silk, leaf tissue); token resolution ("phase is a modulator"); scene token hierarchy (world, chrome, canvas, surface, elevated, interactive) | Dark phases retuned from brown-black to graphite with blue-violet | Lasting: this is the clearest statement of the vision |
| Mar 25 to 30 | Trube-Art triple-tier rendering; UI colour doctrine | Trube-Art engine; Mar 30 recovery from a stash after breakage | Trube-Art temporary: extracted Aug 24 |
| Apr 8 to 25 | ADR-001 UI foundation reset; multi-archetype engine (sanctuary, starlight, lotus x phase x mode) | "Sanctuary V3" and "Zero-Legacy" migrations to NativeWind and semantic tokens; Gluestack v3 | Archetypes temporary: became "profiles", then worlds |
| May to Jul | Quiet on design | **Jun 9: `TabNavigator` archived for Expo Router.** The new tabs never mount `SanctuaryBackground` | Lost: mobile goes back to a static ground |
| Aug 10 to 30 | Styling-engine decision (Aug 12); UI audit and integrated redesign plan (Aug 13); UI elegance plan (Aug 23); design system audit and Figma plan (Aug 30) | Branded components, motion tokens, splash animation (Aug 10); neevsk-web, trube-art and rn-terrain extracted (Aug 24) | Plans partly done |
| Sep 5 to 15 | External-world canon, anti-slop gate, human-interface method (Sep 9); living firefly and mascot plans (Sep 9) | Phase-aware onboarding accents (Sep 5); "tactile spatial depth" in workspace canvas (Sep 9); sanctuary web domain canvas and exploration routes (Sep 15) | Canon lasting; firefly partly done |
| Oct 10 to 18 | Web dual-surface contract with `explore.gurudevi.app` (Oct 13); spatial canvas and furniture framework: wallpaper, atmospheric shader (washi grain, aurora, embers), colour wash (Oct 18); Tutii mascot bible (Oct 18) | User wallpaper assets and authority (Oct 10 to 11 migrations); web floors, `SanctuaryFloorCanvas`, `WorkspaceWallpaperLayer`, floor slideshow (synced Oct 17) | Web only: mobile has none of it |
| Oct 21 | Verger ADRs: the phone decides how much it can afford | Governor, then verger (on `feat/adaptive-runtime`, not mounted) | Lasting, not joined to UI yet |
| Oct 22 to 23 | Worlds foundation | Six worlds, generic components, Settings, tab bar and headers dressed; phase light at 0 to 12% tint; `terrain/version-hops` merges it | Current |
| Oct 26 | Living world vision | (this branch) | Proposed |

## What stayed the same every time

- A sanctuary that restores energy, not a meditation or temple app (NORTH_STAR, Feb onwards).
- The lotus and its companion: the FAB in Feb, the firefly in Sep, Tutii in Oct.
- Five spaces with their own light: Self, Classroom, Community, Library, Profile. They were tabs in Feb, clearings in Feb 27 and floors on the web in Oct.
- Six phases of the day: predawn, dawn, morning, afternoon, dusk, night. They have been unchanged since Feb 24.
- Vellum, warm ink, chromatic shadow, never black (Feb 27 and Mar 20).
- Low-end phones, offline use and three languages.

## What came and went (iteration vocabulary)

| Term | Period | Became |
| --- | --- | --- |
| Six neevsk-web themes | Feb 14 | Left the repo on Aug 24 |
| Glass, glassmorphism, `GlassCard` | Feb 24 to Mar | Rejected by the doctrine on Mar 20 ("not generic glassmorphism"); "sky-morphism" proposed instead |
| Cosmic Star Temple, deep ocean | Feb 24 | Phase moods, absorbed into tokens |
| Trube-Art | Mar 25 | Its own repo |
| Archetypes: classic, starlight, lotus | Apr 18 | Profiles (in token resolution), then worlds (Oct 22) |
| Sanctuary V3, Zero-Legacy, sovereign | Apr | Migration slogans, no design meaning |
| Floors, furniture, wallpaper, colour wash | Oct (web) | Web's version of clearings |
| Worlds (Sanctuary, Temple walls, Wewa, Forest canopy, Angampora, Gems and lace) | Oct 22 | Current carrier for the look |

## Seams where docs and code split

1. **Living backdrop, mobile.** Designed and built on Feb 24. Gone after Jun 9, when navigation moved to Expo Router. The worlds code (Oct 22) brings back only a faint tint.
2. **Web vs mobile.** The web gained wallpapers, atmosphere shaders and floors in October. Mobile gained none of them, and the worlds doc names mobile and web parity as a goal.
3. **Skia scenes.** Specified on Feb 27 (921-line guide). Never the default renderer.
4. **Motion.** NORTH_STAR says "nothing is static". The Sep 9 canon and the firefly spec say the surface stays quiet and only the companion moves. The newer view should win.
5. **Budget.** Feb's backdrop already had a low-end static fallback. Verger (Oct) is the proper budget, but it is not connected to the UI.

## What this means for the next step

Bring back the February backdrop idea in the worlds system, not the old component. That means a sky layer per world and phase, budgeted by device tier and later by verger, shown first on mobile so it catches up with the web. This is step 1 in `2026-10-26-living-world-vision.md`.

## Gaps in this timeline

- The ICT4Edu chat and any other chats are missing. Paste the key messages to add them.
- Dates come from commit author dates and doc `created:` fields. A large checkpoint commit (for example Oct 17) can hold work done over several days before it.
