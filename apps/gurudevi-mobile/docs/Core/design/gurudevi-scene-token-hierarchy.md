---
title: "Gurudevi Scene Token Hierarchy"
status: "active"
created: 2026-03-20
updated: 2026-03-20
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi Scene Token Hierarchy
### One Layer Grammar for Mobile and Web
*How world, chrome, canvas, surfaces, and readable text stay coherent across themes and phases*

---

## 0. Purpose

This document defines the canonical scene-layer hierarchy for Gurudevi.

It exists to solve a recurring failure mode:

- background changes in one place
- text no longer reads in another
- components invent unrelated surface colors
- dark mode and phase logic become too complex to reason about

The answer is not more per-component color decisions.
The answer is one shared layer grammar.

---

## 1. The Layer Stack

All Gurudevi interfaces, on both mobile and web, should resolve into these six layers:

1. `world`
2. `chrome`
3. `canvas`
4. `surface`
5. `elevated`
6. `interactive`

Every background in the app should belong to one of these layers unless it is an explicitly approved guided exception.

---

## 2. Layer Meanings

### `world`

The deepest atmospheric field.
This is the living backdrop of the app: sky, vellum field, graphite night, aurora drift.

Use for:
- app-wide atmospheric background
- animated or static gradient field
- ambient grain and scenic depth

Never use for:
- ordinary cards
- navigation chrome
- input controls

### `chrome`

The app frame.
This is where navigation and persistent shell elements live.

Use for:
- global header
- top bar
- sidebar
- bottom tab bar
- mobile bottom nav on web

Chrome should feel related to the world, but more controlled and legible.

### `canvas`

The screen-level working field.
This is the background of the actual content area once the shell is in place.

Use for:
- `ScreenWrapper`
- page-level scroll area
- full-screen content background
- modal host page beneath overlays

Canvas is calmer than world and broader than card surfaces.

### `surface`

The standard contained UI plane.

Use for:
- cards
- list sections
- grouped content panels
- standard content containers

This is the default layer for most reusable containers.

### `elevated`

The stronger contained plane.

Use for:
- modals
- sheets
- raised panels
- pinned and emphasized containers

Elevated surfaces should feel more held and more separate than ordinary surfaces.

### `interactive`

The local interaction plane.

Use for:
- inputs
- chips
- segmented controls
- compact action containers
- quiet buttons and field backgrounds

Interactive should support focus and selection without becoming visually loud.

---

## 3. Matching Text Roles

Each layer has a matching readable text role:

- `text.onWorld`
- `text.onChrome`
- `text.onCanvas`
- `text.onSurface`
- `text.onElevated`
- `text.onInteractive`
- `text.onAccent`
- `text.onDanger`

Rule:
components should not guess their text color from visual instinct.
They should consume the matching text role for the layer they sit on.

Secondary and muted text still derive from the current world, but the primary readable anchor should come from the layer pairing above.

---

## 4. Platform Mapping

The semantic stack is the same on both platforms, even when the frame differs.

### Mobile

- `world`: `SanctuaryBackground`
- `chrome`: `GlobalHeader`, bottom tab bar
- `canvas`: `ScreenWrapper` background
- `surface`: cards, grouped sections, content panels
- `elevated`: modals, sheets, overlays
- `interactive`: inputs, chips, compact controls

### Web

- `world`: `.world-bg`
- `chrome`: `.top-bar`, `.sidebar`, `.mobile-bottom-nav`
- `canvas`: `.main-content-canvas`, `.sanctuary-screen`
- `surface`: cards and regular web panels
- `elevated`: modals, sticky inspection panes, emphasized overlays
- `interactive`: filter chips, inputs, compact controls

The shell layout differs.
The semantic layer names do not.

---

## 5. Phase Rules

Phase changes are **atmosphere-only** in v1.

This means phase may affect:

- `world`
- `chrome` tint
- glass tint
- glow family
- accent emphasis

This means phase should not directly rewrite:

- all text roles by hand
- every component variant
- every border or status color

Phase is a modulator, not a second design system.

---

## 6. Dark World Rule

Dark mode must never collapse into pure black.

The Gurudevi dark world should read as:

- neutral graphite
- blue-violet undertone
- matte depth
- sanctuary night

Not:

- glossy black
- cold enterprise charcoal
- OLED void with white text pasted on top

Dark mode remains behind a guarded rollout until the shared shell and primitives are stable.

---

## 7. Guided Exceptions

Guided exceptions are allowed, but only when all of these are true:

1. the screen has a real narrative or functional reason
2. the special background is tokenized centrally
3. it has an explicit readable text pairing
4. it does not become a new ad hoc layer family

Examples that may justify guided exceptions:

- library hero moment
- celebration panel
- a scenic onboarding step
- a map or immersive canvas

Examples that do not justify guided exceptions:

- “this screen looked boring”
- “I wanted a different card color here”
- “the component needed more personality”

---

## 8. Implementation Rule

The complexity belongs in the resolver, not in components.

Components should receive:

- a layer background token
- a layer border token
- a matching readable text token

They should not:

- compute their own readable foreground from scratch
- hardcode fallback text colors
- invent unrelated background values in leaf nodes

---

## 9. V1 Rollout Order

1. shared resolver
2. shell/chrome
3. shared primitives
4. dark-mode guarded reintroduction
5. phase atmosphere reintroduction
6. future profile expansion

Future profiles such as `youth` or `flower` are intentionally deferred until the sanctuary hierarchy is stable.

---

## 10. Final Rule

If a component author cannot answer:

“Which scene layer am I on?”

then that component is not ready to choose colors.

Everything starts from the layer.

---

*Document version 1.0 — March 2026*
*Gurudevi Scene Token Hierarchy*
