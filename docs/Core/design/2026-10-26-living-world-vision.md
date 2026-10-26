---
title: "Gurudevi Living World: Vision, Mission and Direction"
status: "proposed"
created: 2026-10-26
updated: 2026-10-26
author: "Naveen"
tags: [gurudevi-mobile, design, worlds, circadian, vision]
---

# Gurudevi Living World

Gurudevi should feel like a place that is alive: it is morning in it when it is morning for the teacher, the light moves through the day, and each part of the app is a different clearing in the same forest. This note gathers what earlier design docs already said, compares it with what the code does today, and sets one direction for the next UI work.

It draws only on documents already in the repo. The ICT4Edu chat could not be read in full, so anything said only in that chat is missing here and should be added.

## Sources this note gathers

| Idea | Where it already lives |
| --- | --- |
| Sacred clarity with living atmosphere (Swiss + silk + ecological aliveness + sacred illumination) | `apps/gurudevi-mobile/docs/Core/design/gurudevi-aesthetic-doctrine.md` |
| Vellum, silk, leaf tissue, deep water as materials; chromatic shadow, never black | same doctrine; `gurudevi-design-language.md` |
| One forest, five clearings (Self glade, Classroom grove, Community clearing, Library ancient forest, Profile threshold) | `gurudevi-space-specifications.md` |
| Archetype x phase x mode (six phases: predawn, dawn, morning, afternoon, dusk, night) | `gurudevi-multi-archetype-engine.md`, `packages/ui/src/theme/Theme.ts` (`phaseMatrix`) |
| Phase is a modulator, not a second design system | `gurudevi-token-resolution.md` |
| Layer stack: world, chrome, canvas, surface, elevated, interactive | `gurudevi-scene-token-hierarchy.md` |
| Place before surface; motion explains causality; space is memory | `gurudevi-external-world-design-canon.md` |
| Lotus rooted in mud: works on what teachers have, offline, data-conscious, trilingual | `apps/gurudevi-mobile/docs/Core/NORTH_STAR.md` |
| The surface is quiet, the companion is alive (firefly) | `docs/Core/design/2026-09-09-gurudevi-living-firefly-implementation-spec.md` |
| Worlds: generic components dressed by a chosen world, six worlds | `docs/Core/design/2026-10-22-worlds-foundation.md`, `packages/ui/src/world` |
| The phone decides how much it can afford | verger, `docs/engineering/runtime-performance/verger/` on `feat/adaptive-runtime` |

## Vision

A teacher in a rural Sri Lankan school opens Gurudevi on a 2GB phone at 6:40 in the morning and the app is in dawn light. By the afternoon register it is warmer and brighter; in the evening, while planning, it is dusk and quiet. Nothing blinks for attention. The day itself is the motion.

The app is one living forest with five clearings. Each clearing keeps its own light and pace, and the person always knows which clearing they are in. Whichever world the person chooses (Sanctuary, Temple walls, Wewa, Forest canopy, Angampora, Gems and lace) dresses the same forest in its own materials.

## Mission

Make the app feel alive through light, place and time, never through noise, on the phones teachers really have.

## Principles

1. **The day is the motion.** Aliveness comes from the light changing with the hour, not from things moving on screen. Interactive motion still has to explain cause (canon, law 5).
2. **Atmosphere lives in the back layers.** Time of day changes the `world` and `canvas` layers (sky, ground, glow, texture). Text, controls and status colours stay readable and stable (token resolution, section 3).
3. **Quiet utility, living primary, sacred hero.** Forms and rows stay calm. Home and space headers carry visible atmosphere. Only arrival, completion and empty states get the full scene (doctrine, section 10).
4. **Place before surface.** Each clearing has its own spatial model and light signature, and its landmarks stay where they are.
5. **Materials, not effects.** Vellum, silk, leaf tissue and water, with chromatic shadow. Blur, glow and particles appear only when they mean something.
6. **The phone decides how much.** On a low-end or hot phone, or with Data Saver on, the world steps down from a painted scene, to a gradient, to a flat tint. It never drops readability. Verger supplies that budget.
7. **Culture without appropriation.** Borrow materials, colours and patterns. Never use sacred figures. Credit sources. Sinhala, Tamil and English get equal care.

## Where the code is today

| Promise | Today | Gap |
| --- | --- | --- |
| The app changes with the time of day | `world/resolve.ts` tints the ground with each hour's light at 0 to 7% in light mode and 0 to 12% in dark | The change is hard to see. Mobile had a visible crossfading backdrop (`SanctuaryBackground`, Feb 24) but lost it when navigation moved to Expo Router (Jun 9); see `2026-10-26-ui-vision-timeline.md` |
| Five clearings with their own light | Space signatures are written up in docs; worlds dress Settings, the tab bar and the headers only | No screen beyond those has a clearing identity yet |
| Living primary and sacred hero levels | The world contract has `section` recipes and ornament bands as data only | Nothing draws scenes or ornament on native yet (baked-art pipeline pending) |
| Quiet surfaces | `pnpm check:world` ratchet, hex baseline 4,139 | About 70 screens still read legacy tokens through `worldBridge` |
| Budget by device | Verger is built on `feat/adaptive-runtime` but not mounted, and that branch lacks `packages/ui/src/world` | Worlds and verger are not joined yet |

A contradiction to settle: `NORTH_STAR.md` says "nothing is static, everything has micro-motion", while the external canon and the firefly spec say surfaces stay quiet and only the companion moves. This note follows the newer docs: the surface is quiet, the light changes, and the companion is alive.

## Direction

The order is chosen so that each step can be seen on a phone before the next one starts.

1. **Make the day visible.** Add a `sky` (world-layer) token family per world and phase: a two-stop gradient plus one glow position. Phase changes it clearly (dawn rose, noon clear, dusk amber, night deep) while text tokens stay fixed. Show it first on the home header and the tab bar. Verify with the contrast test and with screenshots in Sanctuary at dawn, noon, dusk and night.
2. **Smooth the hour.** Blend between neighbouring phases by minute instead of snapping at phase boundaries, and let the person pin a phase or follow the hour (Settings already offers "With the hour").
3. **Give each clearing its light.** Apply the space signatures from `gurudevi-space-specifications.md` as a small tint or accent shift per space, carried through `WorldScope`. Then migrate workspace home and attendance (step 1 of the worlds migration order).
4. **Join worlds and verger.** Map verger's visual-detail level to three scene tiers: painted, gradient, flat. Until verger is mounted, choose the tier from the existing device-tier classifier.
5. **Draw the hero moments.** Use the baked-art pipeline for the arrival, completion and empty-state scenes, and for ornament bands (liyawela, ripple, branch), screenshot-tested per world and phase.
6. **Finish the migration.** Self, Library, Community and Profile follow, then `SanctuaryButton` and `SanctuaryCard` are removed.

## Open questions for Naveen

- Which ideas from the ICT4Edu chat are missing here? Paste or point to the key messages and they will be folded in.
- Should time of day follow the phone's clock, or sunrise and sunset in Sri Lanka (which change little across the year)?
- Should dark mode follow night automatically, or stay a separate choice?
- Is the home header the right first surface for the visible day, or should it be attendance?
