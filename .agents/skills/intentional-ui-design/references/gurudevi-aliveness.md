> **Current reality (2026-10-30).** Written before the UI kit. Today: the shared doctrine is the world engine in `@repo/ui/theme` (worlds, recipes, contracts; `Theme.ts` is legacy), components live in `@repo/ui/components/native` and `@repo/ui/components/web`, `apps/gurudevi-web` is Next.js (not Astro), and worlds are the app dialects. How to build within it: `docs/architecture/ui-kit-guide.md` and `.agents/skills/ui-kit/SKILL.md`. The principles below still hold.

# Gurudevi Aliveness

Use this reference for Gurudevi-facing design work and for any request that sounds like:
- alive interface
- scenic or wondrous UI
- Goethe, truth, living form
- Secret of Kells
- translucent sky-like materiality
- aurora, water, leaf, vellum, sacred atmosphere

## Core Reading In Repo

Read these first when available:

1. `apps/gurudevi-mobile/docs/Core/design/GURUDEVI_DESIGN_MASTER.md`
2. `apps/gurudevi-mobile/docs/Core/design/gurudevi-design-retina.md`

Respect the hierarchy in the master doc:
- implementation truth first
- active design constitution second
- exploratory docs after that

## What The User Is Reaching For

This is not just "better glassmorphism."
This is a search for interfaces that feel:
- alive instead of fabricated
- truthful instead of generic
- ecologically varied instead of flat
- inwardly luminous instead of chrome-coated
- emotionally resonant instead of merely usable

The target is closer to a living atmospheric field than to a panel-based software skin.

## Visual Topology

Think in terms of layered fields rather than flat boxes:

- ground field: vellum, sky haze, deep water, leaf-light
- surface field: translucent membrane, silk, frosted atmosphere, luminous paper
- accent field: saffron, aurora, green life, lotus moments
- depth field: violet shadow, warm recesses, cool edges
- temporal field: dawn, morning, evening, night behavior

Each field should influence the others. Avoid isolated effects that do not belong to the whole ecology.

## Aliveness Signals

Use some of these together, but with discipline:

- micro-variation within surfaces
- warm center / cool edge behavior
- subtle grain or texture
- phase-based color drift over time
- light that appears to come through or from within
- shadow chroma instead of black neutrality
- irregularity in illustration, shape contour, or motion timing
- layered detail that rewards attention without overwhelming first glance

## Avoid Misreadings

Do not translate the brief into:
- generic frosted-glass cards on every surface
- heavy neumorphism with muddy contrast
- over-rendered skeuomorphism
- overloaded gradients with no hierarchy
- constant animation everywhere

The interface should feel alive, not sticky, glossy, or ornamental for its own sake.

## Secret Of Kells Direction

Treat "Secret of Kells" as a clue about atmosphere and density, not a literal style copy.

Relevant qualities:
- sacred illumination
- linework that feels intentional and storied
- jewel-like accents emerging from soft ground
- intricate detail concentrated in meaningful areas
- nature as pattern logic, not as pasted decoration

## Implementation Reality

This is feasible on current devices if implemented selectively.

Prefer a layered approach:

1. semantic tokens for palette, depth, blur, and phase
2. gradients and translucency for most surfaces
3. subtle texture or grain overlays where important
4. restrained motion for breath, drift, shimmer, or focus
5. Skia, canvas, or heavier effects only for hero moments and reusable primitives

Do not require GPU-heavy shaders for every screen. A convincing alive interface usually comes more from composition, token discipline, layered contrast, and selective motion than from raw rendering complexity.

## Conversion To System Rules

When turning this vision into a design system, define:

- atmospheric backgrounds
- surface material types
- luminous accent roles
- chromatic shadow rules
- phase/time behavior
- motion families: breathe, drift, settle, bloom
- scenic hero components versus quiet utility components

Not every component should be equally expressive. Preserve calm by letting ordinary controls stay simpler than hero surfaces.
