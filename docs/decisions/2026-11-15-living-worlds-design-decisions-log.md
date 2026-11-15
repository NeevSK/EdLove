---
title: "Living worlds: design decisions Neev made, 26 Oct to 15 Nov 2026"
status: "active"
created: 2026-11-15
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [decisions, worlds, verger, rooms, floor, ground, accessibility]
---

# Living worlds: design decisions, 26 Oct to 15 Nov 2026

These decisions were made by Neev in project threads on claude.ai while the living worlds were built. Until now they were kept only in the project's memory notes. They are copied here so a new person or agent finds them in the repo. Each line says what was decided and when. The current behaviour of the code is in `docs/Core/design/worlds-reference.md`.

## How to work

- **2026-11-12. Don't block on Neev.** Open questions become product defaults that can be changed later (dials with defaults). Architecture and engineering go ahead. Build in modules: the world and verger command each module.
- **2026-11-13. Use Neev's words and the code that already exists.** Sanctuary, room, floor, world, feature, catalog, SanctuaryFeature, canvas layout. Never add a second system beside an existing one (the floor engine beside `resolveScene`, a list beside the catalog). Check every branch first. Don't delete old files without Neev's yes (Deletion Veto).
- **2026-11-13. Layout and components are not features.** Layer 1 is layout and components (world ground, floor engine, patterns, kit). Layer 2 is features (furniture). Don't do feature work inside the layout job. Sample data goes through the existing sandbox layer (live, ghost, demo), never direct mock imports.
- **2026-11-11. Neev's lens, applied without being asked:** one living world, worn by every surface, for every real person, in every real condition. Surfaces: header, rooms bar, main action button, sheets, toasts, empty and loading states, keyboard bar, keypad. Devices: 2 GB Android, tall phones, tablets, landscape, split screen, notches. Input: thumbs, the main hand, keyboards, screen readers. People: children, parents, older teachers, shared family phones, Sinhala, Tamil and English, large system text. Conditions: offline, sunlight, interruptions.

## Worlds

- **2026-10-26. Keep all eleven worlds** of the World Atelier, in five families. Angampora and Perahera are cultural, not the youth world; Spark is the modern, rebellious youth world; the flower world is rose and pichcha (jasmine).
- **2026-10-26. Bundle every world's fonts in the app** (variable faces for Latin, Sinhala and Tamil). No download tier for now.
- **2026-10-26. Weight check.** No new worlds or big features until the A52 measurement. If the A52 shows a cost, cut fonts and the rarer worlds first.
- **2026-11-10. The world is the mother, verger is the father.** The world decides how things look; verger decides how much of it the device carries. Every visual-level or performance choice the person makes goes into verger as one setting.
- **2026-11-10. A plain world for people who want a normal app** (Classic), beside the living worlds. Forest canopy (Kele) is the default world.
- **2026-11-10. Low-end phones get prerendered Skia pictures** with a few moving layers, never a flat or broken look.
- **2026-11-10. The shell wears the world** (header, tabs, main action button), in three header and three tab styles that adapt from phone to tablet. Tutii versus a separate AI button is an A/B.

## Ground and screens

- **2026-11-12. Every screen stands on the world's ground.** Profile, Settings, notifications, forms and detail screens too, never a flat solid colour. The cascade: the world's default, then an every-room change, then a just-this-room change inside the world's limits, then the screen chooses only how loud the ground is. Comfort and verger can only calm it.
- **2026-11-12. Never hard-code a visual level per screen.** A screen declares its kind; one policy decides. The person's setting is World Behind Screens: Lively, Balanced (default) or Calm. Verger may only calm it further. Web and phone share the rule.
- **2026-11-12. On the web at phone width the room tabs are pinned at the bottom.**

## Rooms, catalogs and floors

- **2026-11-12. The room name for Workspace follows the capacity in the active bond:** Classroom for teacher, tutor and marker; School for a principal; Learning for a student; Family for a guardian; and so on, with Workspace as the fallback. Personal, institutional and commercial is a separate axis and never renames it. Sinhala and Tamil words come from Neev, never guessed.
- **2026-11-12. Features are the Sanctuary's furniture.** SanctuaryFeature decides presence, the saved layout decides place, and reusable layout patterns (not per room) decide arrangement.
- **2026-11-13. One floor for all rooms.**
- **2026-11-13. Drop the fixed March zones;** groups can be anything.
- **2026-11-13. Every feature can have a time lens:** review the past, act now, plan ahead.
- **2026-11-14. The AppCatalog is the one feature list per room.** Each entry also carries its floor details and time lens. The floor engine, web and phone all read it. Remove the other lists, including `ROOM_PLANS`. Prune newly invented terms and keep the older meaningful names. Full decision: `2026-11-14-appcatalog-is-the-one-list.md`.
- **2026-11-15. Each tab opens exactly one main screen** (Overview for Self and Workspace, the shelf for Library, and so on). All floor and layout work drives that screen. Opening an item opens a second-level screen in the same tab, on the same ground and scene, drawn its own way.
- **2026-11-15. Workspace is one Overview drawn for the active role** (teacher, principal, …, switchable), not a dashboard per role. Community's main screen is Feed, Groups and Messages, with the chosen one shown.

## Accessibility

- **2026-11-12. WCAG 3 (the latest working draft) is Gurudevi's adopted standard.** Gurudevi is in beta and chooses its own standard. WCAG 2.2 criteria are used only as extra concrete checks where WCAG 3 is thin. Don't add caveats about the draft's status.

## Repository process

- **2026-11-13. The DCO check is off** (the workflow runs only on demand), at Neev's request.
