> **Current reality (2026-10-30).** Written before the UI kit. Today: the shared doctrine is the world engine in `@repo/ui/theme` (worlds, recipes, contracts; `Theme.ts` is legacy), components live in `@repo/ui/components/native` and `@repo/ui/components/web`, `apps/gurudevi-web` is Next.js (not Astro), and worlds are the app dialects. How to build within it: `docs/architecture/ui-kit-guide.md` and `.agents/skills/ui-kit/SKILL.md`. The principles below still hold.

# Polymath Platform

Use this reference when the task lives in `C:\Users\Naween\projects\polymath-platform`.

## Read First

1. Identify the app in `apps/`.
2. Read that app's `CONTEXT.md` or equivalent.
3. Inspect `packages/ui` before inventing new visual rules.

## Current Stack Shape

- Mobile app: Expo React Native in `apps/gurudevi-mobile`
- Marketing and narrative sites: Astro + Svelte in `apps/gurudevi-web`, `apps/edlove-web`, `apps/intuitui-web`, `apps/neevsk-web`
- Shared UI system: `packages/ui`

## Existing Signals To Reuse

The repo already contains a recognizable visual language. Reuse and systematize it before introducing a separate style.

- Sanctuary / lotus / breathing / calm metaphors
- Glass, glow, warmth, vellum, silk, ink, saffron, gold vocabulary
- Shared theme tokens in `packages/ui/src/theme/Theme.ts`
- Shared components in `packages/ui/src/components` and `packages/ui/src/components-native`

Treat these as evidence of an emerging design system, not random implementation details.

## Doctrine vs Dialect

Do not assume every app should resolve to one visual identity.

Use this split:

- **House doctrine**: shared laws across the product family
  - semantic tokens
  - hierarchy discipline
  - accessibility rules
  - material logic
  - motion temperament
  - overall aesthetic philosophy

- **App dialect**: how one product expresses the doctrine
  - narrative vs operational composition
  - calm vs energetic density
  - ornament level
  - scenic vs structured emphasis
  - warmth vs precision

In practice:
- `packages/ui` should usually carry doctrine
- app code should usually carry dialect
- one screen may carry a local accent only when it has a real narrative/function reason

Good outcome:
- the apps feel related
- no app feels copy-pasted from another
- the family resemblance survives even when layouts differ

## Surface-Specific Direction

### Gurudevi Mobile

- Source: `apps/gurudevi-mobile`
- Role: operational product
- Bias toward calm, safe, tactile, legible interfaces
- Optimize for touch, scanning, and emotional steadiness
- Reuse shared primitives aggressively
- Dialect: sanctuary, scenic, living, atmospheric, devotional calm

### Gurudevi Web

- Source: `apps/gurudevi-web/CONTEXT.md`
- Theme: sanctuary / lotus
- Aim for public trust, breathing space, and memorable calm
- Avoid commodity startup-marketing layouts
- Dialect: public-facing sanctuary with stronger composition and narrative calm

### Intuitui Web

- Source: `apps/intuitui-web/CONTEXT.md`
- Theme: systems clarity
- Aim for intelligence, precision, humane professionalism
- Favor strong typography, visible structure, and diagrammatic composition over decorative softness
- Dialect: more lucid, diagrammatic, and analytic, while still honoring the shared doctrine

### EdLove and Neevsk

- Read each app context before changing direction
- Preserve family resemblance while allowing each surface its own tone

## Implementation Bias

- Put system-wide changes in `packages/ui` or shared tokens whenever possible.
- Keep brand logic in semantic tokens instead of raw hex values in page code.
- Translate one house style across platforms rather than cloning exact layouts between native and web.
- Preserve app dialect in composition and emphasis rather than scattering one-off raw styles.
- Let RN and web differ in interaction details while sharing the same design grammar.

## Practical Audit Checklist

Before editing, ask:

1. What is the primary mood this surface should communicate?
2. Which existing tokens/components already support that mood?
3. Is the current weakness visual blandness, UX confusion, inconsistency, or all three?
4. Would a token/component change solve this better than a local restyle?
5. What platform constraints should shape the final UI?
