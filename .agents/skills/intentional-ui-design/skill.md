---
name: intentional-ui-design
description: Elevate UI, UX, and visual craft across product surfaces without falling back to generic boilerplate styling. Use when Codex needs to redesign or refine frontend/mobile interfaces, define or extend a custom design system, improve information hierarchy, create more intentional layouts, translate a brand mood into reusable tokens/components, or evolve one shared design doctrine across multiple apps while preserving each product's own dialect across Expo React Native, React/TypeScript web apps, Astro/Svelte sites, and shared UI packages.
---

# Intentional UI Design

Build interfaces with a clear point of view, stronger hierarchy, and a reusable system rather than one-off decoration. Treat aesthetics, usability, motion, accessibility, and implementation constraints as one design problem.

## Doctrine and Dialects

When the repo contains multiple products with their own visual identity, do not force them into one identical style.

Model the system in two layers:
- shared doctrine: the deeper laws the product family shares
- app dialect: the way one app expresses those laws

Shared doctrine usually owns:
- semantic token logic
- spacing discipline
- contrast and readability rules
- component anatomy
- motion temperament
- material philosophy

App dialect usually owns:
- density
- compositional tone
- accent emphasis
- ornament level
- scenic vs operational mood
- how warm, sacred, playful, clinical, or diagrammatic the surface feels

In this repo, assume the goal is usually:
- family resemblance without cloning
- reuse without flattening
- one grammar, many expressions

Before redesigning, explicitly decide:
1. What belongs to the shared doctrine?
2. What belongs to this app's dialect?
3. What belongs only to this screen?

## Alive Interface Mode

When the user's intent points toward aliveness, scenic wonder, translucency, material depth, or nature-derived visual feeling, do not collapse the request into ordinary glassmorphism, neumorphism, or flat modern SaaS styling.

Interpret the direction as:
- living surfaces, not decorative overlays
- inner luminosity, not generic outer glow
- micro-variation, not uniform fills
- ecological color relationships, not isolated accent colors
- temporal change, not static perfection
- tactile invitation, not cold efficiency

Ask of every important surface:
"Does this feel alive or does it feel manufactured?"

If it feels manufactured, introduce system-level causes of aliveness:
- subtle warm-to-cool variation within a surface
- depth that suggests atmosphere, water, vellum, leaf, sky, or aurora
- quiet asymmetry or irregularity where appropriate
- motion that breathes, drifts, or settles rather than snaps mechanically
- detail density focused near important moments rather than everywhere

## Workflow

1. Identify the surface.
   Confirm which app or package is in scope before changing visuals.
   In the `polymath-platform` repo, read the relevant app context first, inspect `packages/ui`, and identify whether the request is about doctrine, dialect, or one surface.

2. Diagnose before designing.
   Audit the current UI for:
   - bland or default typography
   - weak hierarchy
   - token drift across screens
   - inconsistent spacing/radius/shadow rules
   - low-contrast or inaccessible states
   - motion with no meaning or no motion where orientation is needed

3. Write a compact design direction.
   Summarize:
   - shared doctrine in 1-2 lines
   - app dialect in 1-2 lines
   - brand mood in 3-5 adjectives
   - interaction tone
   - visual metaphors
   - what this surface must never feel like
   Keep the direction short enough to guide implementation decisions.

4. Convert the direction into system primitives.
   Prefer reusable primitives over page-specific styling:
   - color roles, not just colors
   - type scale, not isolated font sizes
   - spacing rhythm
   - corner radius rules
   - elevation or glass rules
   - motion tempos
   - component states

5. Map the design system to the active stack.
   - Expo React Native: use shared tokens and cross-platform primitives; respect touch targets, safe areas, and mobile ergonomics.
   - Astro/Svelte sites: preserve narrative pacing, stronger composition, and expressive visual identity; avoid generic Tailwind landing-page patterns.
   - React/TypeScript web apps: prioritize task clarity, state clarity, density control, and keyboard/accessibility support.

6. Implement at the right level.
   Prefer edits in shared tokens or shared components when the change is doctrinal. Keep dialect-specific expression in app-level composition, variants, and selective overrides. Only style locally when the surface is intentionally unique.

7. Validate visually and behaviorally.
   Check:
   - visual hierarchy at a glance
   - mobile and desktop responsiveness
   - hover/focus/pressed/disabled/loading/empty/error states
   - accessibility contrast and readable sizing
   - whether the result still feels like the product family

## Default Deliverables

When the request is exploratory or broad, provide these artifacts implicitly in the work:
1. A short design direction statement.
2. A proposed token or component change list.
3. The implementation itself when feasible.
4. A brief note on tradeoffs, especially when consistency and uniqueness compete.

## Design Heuristics

- Design from intent, not trend.
- Make one visual idea dominant; let supporting elements stay quiet.
- Use contrast in size, weight, spacing, and density before adding more color.
- Avoid flat sameness: vary rhythm, framing, and emphasis deliberately.
- Prefer scenic depth over fashionable polish when the product calls for wonder.
- Keep decorative motifs tied to meaning; do not scatter effects randomly.
- Build families of components with shared anatomy and state behavior.
- Let a product keep its own visual dialect if the underlying grammar stays coherent.
- Let accessibility improve the aesthetic by enforcing clarity.

## Anti-Patterns

- Default Tailwind dashboard or landing-page look with no brand point of view.
- Forcing every app in a monorepo to look like the same product.
- Mixing multiple visual languages on one screen.
- Adding gradients, blur, glass, or shadows without interaction purpose.
- Mistaking "alive" for "busy" and covering everything in effects.
- Hardcoding colors and spacing in leaf components when tokens should own them.
- Rebuilding new components when a variant of an existing primitive is enough.
- Making web and native look identical when they should feel related but platform-appropriate.

## Polymath Platform Guidance

When working in `C:\Users\Naween\projects\polymath-platform`, read [references/polymath-platform.md](./references/polymath-platform.md).
Use it to align with the repo's shared doctrine, app dialects, shared UI package, and app-specific context files.

When defining or extending a house design system, read [references/design-system-playbook.md](./references/design-system-playbook.md).
Use it to turn aesthetic direction into tokens, primitives, variants, and rollout steps.

When the direction is specifically Gurudevi or "alive interface" work, read [references/gurudevi-aliveness.md](./references/gurudevi-aliveness.md).
Use it to ground implementation in the repo's existing design constitution rather than generic design trends.
