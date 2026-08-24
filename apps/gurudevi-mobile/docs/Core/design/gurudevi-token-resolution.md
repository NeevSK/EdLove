---
title: "Gurudevi Token Resolution"
status: "active"
created: 2026-03-20
updated: 2026-03-20
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi Token Resolution
### How To Make Living Themes Manageable
*A complexity-reduction doctrine for world, phase, profile, and readability*

---

## 0. The Problem

The vision is valid, but the implementation burden becomes overwhelming when every axis is allowed to multiply every other axis.

The dangerous mental model is:

`profile x world x phase x surface x text x state x component`

That explodes too fast for human reasoning and leads to:

- hardcoded fallbacks
- duplicated theme utilities
- dark mode getting disabled
- phase changes getting disabled
- components carrying readability logic themselves

The answer is not to shrink the vision.
The answer is to reduce where decisions are made.

---

## 1. The Core Rule

**Components must not solve theme complexity.**

They should consume already-resolved semantic roles such as:

- `surface.base`
- `surface.elevated`
- `text.primary`
- `text.secondary`
- `action.primary`
- `glass.surface`
- `glow.primary`

The complexity belongs in one resolver, not in hundreds of components.

---

## 2. The Four Layers

Build the system in four layers only.

### Layer 1: Foundation Tokens

These rarely change:

- spacing
- radius
- typography scale
- motion scale
- shadow scale logic

These are not phase-aware.
Keep them stable.

### Layer 2: Theme Profile

This is where future variants like `sanctuary`, `youth`, or `flower` belong.

A profile should define:

- palette family
- emotional tone
- accent family
- material bias
- ornament density

Important:
Profiles are not full independent themes with separate hand-authored tokens for every state.
They are inputs to the resolver.

### Layer 3: World + Phase Resolution

This is the living scene:

- world: `light` or `dark`
- phase: `predawn`, `dawn`, `morning`, `afternoon`, `dusk`, `night`

This layer should resolve only the atmospheric parts:

- background gradients
- glass surfaces
- glow behavior
- accent shifts
- luminous depth

For Gurudevi dark mode specifically:

- favor sanctuary graphite over brown-black
- use blue-violet undertones instead of generic charcoal
- keep text warm and soft, not icy white
- let phase tint the atmosphere without collapsing into pure black

Do not manually rewrite every text color for every phase if it can be derived.

### Layer 4: Derived Accessibility + Component State

This layer computes:

- readable text on background
- readable text on accent
- muted variants
- disabled states
- focus ring clarity

This should be derived algorithmically wherever possible.

---

## 3. What Phase Is Allowed To Change

Phase should change the atmosphere, not the entire app contract.

Safe phase-aware categories:

- page background nodes
- accent emphasis
- glow family
- glass tint
- ambient texture feel
- hero illustration palette

Unsafe phase-aware categories unless derived carefully:

- every text token by hand
- every border color by hand
- every component state's full palette
- every semantic status color

Phase should be a modulator, not a second design system.

---

## 4. What Profiles Should Be

If you later add themes like `youth` or `flower`, treat them as **profiles**, not separate worlds.

Example:

- `sanctuary`: calm, sacred, vellum, saffron, aurora
- `youth`: brighter, clearer, more playful, lower ornament density
- `flower`: softer, petal-like, warmer, more delicate accent behavior

Each profile should provide:

- a base palette family
- an accent family
- a material family
- a motion temperament

Then the same world + phase resolver acts on that profile.

This keeps the system additive instead of exponential.

---

## 5. Recommended Resolution Order

Always resolve in this order:

1. `profile`
2. `world`
3. `phase`
4. `accessibility derivation`
5. `component state derivation`

Never the reverse.

If text colors are authored before the final background is known, the system will drift and accessibility will break.

---

## 6. Recommended Token Families

Keep the canonical resolved token set small and semantic.

### Surface

- `surface.base`
- `surface.raised`
- `surface.modal`
- `surface.interactive`

### Text

- `text.primary`
- `text.secondary`
- `text.muted`
- `text.inverse`
- `text.onAction`
- `text.onReward`

### Accent

- `accent.action`
- `accent.reward`
- `accent.danger`
- `accent.muted`

### Material

- `glass.surface`
- `glass.modal`
- `glass.interact`

### Atmosphere

- `gradientNodes`
- `glow.soft`
- `glow.primary`
- `glow.action`

### System

- `border.subtle`
- `shadow.soft`
- `focus.ring`

If a token cannot be named semantically, it is probably too low-level for components.

---

## 7. The Readability Rule

Do not hand-manage text colors across every phase/profile combination.

Instead:

- define final background/surface tokens first
- derive text-on-background automatically
- derive text-on-accent automatically
- audit contrast centrally

This is the only realistic way to support living phase changes without mental overload.

---

## 8. Current Repo Direction

The repo already shows the right long-term direction:

- `useTheme()` is the canonical living-theme hook
- `resolvePhaseTokens()` already exists
- adaptive text helpers already exist

The main current problem is architectural drift:

- a second legacy color path still exists
- many components still consume that older path
- dark mode is currently forced off in `EnvironmentContext`

This means the next phase should be simplification, not feature expansion.

---

## 9. Recommended Rollout

### Phase A: Unify Resolution

- keep exactly one canonical resolver
- make old hooks adapt from it instead of inventing their own palette logic

### Phase B: Audit Drift

- remove hardcoded hexes in components
- remove fallback colors that bypass semantic tokens
- identify places where text is manually chosen instead of derived

### Phase C: Re-enable Dark Carefully

- enable dark mode behind a feature flag
- validate only core primitives first
- fix contrast and fallback issues at the primitive layer

### Phase D: Re-enable Phase Changes

- start with background, glass, accent, and glow
- do not let phase rewrite the full component palette yet

### Phase E: Add Profiles

- only after the canonical resolver is stable
- profiles should feed the resolver, not bypass it

---

## 10. The Human Rule

You do not need to hold the full matrix in your head.

You only need to hold:

- what the profile wants to feel like
- what the world wants to feel like
- what the phase wants to tint
- what must remain readable

Everything else should be machine-resolved from those decisions.

That is how this vision becomes buildable.

---

*Document version 1.0 — March 2026*
*Gurudevi Token Resolution*
