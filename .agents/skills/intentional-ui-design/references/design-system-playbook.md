> **Current reality (2026-10-30).** Written before the UI kit. Today: the shared doctrine is the world engine in `@repo/ui/theme` (worlds, recipes, contracts; `Theme.ts` is legacy), components live in `@repo/ui/components/native` and `@repo/ui/components/web`, `apps/gurudevi-web` is Next.js (not Astro), and worlds are the app dialects. How to build within it: `docs/architecture/ui-kit-guide.md` and `.agents/skills/ui-kit/SKILL.md`. The principles below still hold.

# Design System Playbook

Use this reference when the user wants to create or evolve a house design system.

## Goal

Build a system that plays the role Material Design plays for Google products: a shared grammar, not a visual cage.

The system should define:
- principles
- semantic tokens
- component anatomy
- interaction states
- motion rules
- platform adaptations

It should not force every product to look identical.

For a multi-product repo, think in layers:
- doctrine: shared design laws
- dialect: product-specific expression
- surface: one screen or flow

That keeps the system disciplined without making every app visually interchangeable.

## Feasibility

A custom design system is technically feasible in this repo because:

- the monorepo already has a shared `packages/ui`
- there is existing token vocabulary in `Theme.ts`
- multiple apps share related brand philosophy
- the stack supports shared code and shared design decisions

The main risk is not technical feasibility. The risk is creating a large but vague style layer without enough semantic rules or rollout discipline.

## Build Order

1. Define principles.
   Example categories:
   - calm vs urgent
   - sacred vs clinical
   - tactile vs flat
   - guiding vs decorative

2. Define semantic tokens.
   Start with roles, not implementation values:
   - background/base/surface/elevated
   - text primary/secondary/muted/inverse
   - action primary/secondary/destructive
   - border subtle/strong
   - focus ring
   - success/warning/error/info
   - spacing scale
   - radius scale
   - shadow or glass scale
   - motion scale

3. Define core primitives.
   Start with:
   - button
   - text
   - heading
   - input
   - card
   - modal/sheet
   - chip/tag
   - navigation shell
   - list row
   - empty state

4. Define interaction states.
   Every primary component should specify:
   - default
   - hover
   - focus
   - pressed
   - disabled
   - loading
   - selected
   - error when relevant

5. Define platform adaptation.
   - Native: larger touch targets, simpler layering, stronger gesture clarity
   - Web app: denser information patterns, keyboard and hover states
   - Marketing site: richer composition, stronger narrative pacing, more expressive art direction

6. Roll out incrementally.
   Replace one component family at a time rather than trying to re-skin the whole monorepo in one pass.

## Recommended Working Method

For a redesign request:

1. Write a 4-6 line design direction.
2. Name the semantic tokens involved.
3. Identify whether to edit tokens, primitives, or one surface.
4. Implement a thin vertical slice.
5. Check responsiveness and state coverage.
6. Expand only after the slice feels coherent.

## What Good Looks Like

- A screen is recognizable as yours from spacing, tone, hierarchy, and motion, even in grayscale.
- Components feel like they belong to the same family.
- Marketing pages and product screens feel related, not duplicated.
- New screens become easier to design because the system gives direction.

## Failure Modes

- Too many one-off exceptions
- Tokens named after colors instead of roles
- Components that encode brand styling internally instead of consuming tokens
- Overdesigned surfaces that sacrifice legibility
- Copying Material Design mechanically instead of learning from its systemization

## Material-Style Ambition, Custom Outcome

Use Material Design as a reference for scope, not appearance.

Emulate:
- clear principles
- semantic tokenization
- component families
- motion rationale
- accessibility discipline

Do not emulate:
- Google's visual identity
- generic card/button defaults
- surface patterns that do not match the product's character
