# @repo/self

## Purpose
`@repo/self` is the personal sanctuary domain. It owns inner-life, growth, journaling, wellbeing, and role-shaped self-work surfaces.

## Owns
- self screens and role-specific self views
- wellbeing, journaling, mood, rhythm, and growth components
- self-focused hooks, constants, and feature orchestration
- package-local web/native variants for self features

## Does Not Own
- app navigation shells or linking
- classroom pedagogy, institutional governance, or profile identity records
- global browser shell behaviors

## Collaborates With
- `@repo/core` for identity, timing, shared state, and capabilities
- `@repo/ui` for sanctuary primitives
- `apps/gurudevi-mobile` as a route adapter host only

## Web Placement
Feature-specific `*.web.tsx` files belong inside `src/components`, `src/screens`, and `src/screens/self` when the self experience differs by platform.

## App Adapter Rule
`apps/gurudevi-mobile` may keep thin route adapters for self routes, but self rendering and self orchestration should live here.
