---
title: "UI Color Doctrine"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# UI Color Doctrine

## Summary

This document is the reusable visual law behind the strongest Gurudevi redesign work so far. It is not a token dump. It explains how to use the existing sanctuary palette from [Theme.ts](/Users/Naween/projects/polymath-platform/packages/ui/src/theme/Theme.ts) so screens feel related, calm, and alive without collapsing into generic white-card UI.

The core principle is simple:

- background carries atmosphere
- surface carries structure
- text carries clarity
- accents carry meaning

If a screen follows those four rules, it can belong to Gurudevi even when the layout changes by product or role.

## Foundation

### Base World

The light sanctuary world is built from three warm layers:

- `vellum` is the page ground
- `silk` is the primary lifted surface
- `linen` is the border and depth layer

Use these as a hierarchy, not as interchangeable neutrals.

- `vellum` is for the full page or app shell
- `silk` is for the main card or section surface
- `linen` is for borders, separators, muted chips, and depth transitions

Avoid a flat page filled with the same warm tone everywhere. Even calm screens need separation between ground and lifted content.

### Text Law

Text must stay warm and legible.

- primary text: `inkTruth`
- secondary text: `bark`
- tertiary text: `willow`

Use them intentionally:

- `inkTruth` for headings, primary values, and actionable labels
- `bark` for explanatory text and supporting UI copy
- `willow` for metadata, helper labels, timestamps, and quiet context

Do not invent additional gray ramps. The sanctuary system already has its own readable hierarchy.

### Shadow Law

All elevation should come from the shadow-violet family.

- use `shadowAmbient` for default lift
- use `shadowDeep` only for stronger emphasis
- use `shadowFocus` or `shadowSaffron` sparingly for invitation and focus moments

Never use generic gray shadows. They break the Gurudevi atmosphere immediately.

## Accent Law

Accents are semantic, not decorative.

- `sanctuarySaffron`: primary actions, highlighted invitations, living emphasis
- `gurudeviBlue`: clarity, information, structured focus, cool balancing moments
- `gurudeviViolet`: depth, reflective or library-like mood, supporting secondary emphasis
- `sageGreen`: success, wellbeing, safe completion, grounded administrative calm
- `amberGlow`: warning, caution, energetic prompt
- `emberOrange` / `emberRed`: destructive or error states only

Accent colors should not become full-screen themes. They should appear where the product is speaking with intent:

- call to action
- current state
- urgent status
- highlighted chip
- active value
- selected control

## Surface Law

Cards should feel alive and layered, not like flat white boxes dropped on a page.

Rules:

- default card surfaces come from `silk` or a slightly lifted variation of it
- borders should usually come from `linen` or `border`
- surfaces can carry a subtle warm or cool tint when meaning calls for it
- tints must remain restrained; they are atmosphere, not branding resets

Examples:

- a hero card can lean warm with saffron-adjacent softness
- a reflective panel can lean violet softly
- an informational or navigational panel can lean blue softly
- a success or wellbeing card can lean sage softly

Tinted surfaces must still read as part of the same sanctuary world.

## State Law

States must feel integrated into the sanctuary system rather than imported from a SaaS template.

- success: sage-led text or icon on a very light warm-green surface
- warning: amber-led text or icon on a softened saffron/amber surface
- error: ember-led text or icon on a softened warm-red surface
- info: gurudevi blue on a softened vellum-blue surface

State surfaces should never be saturated blocks unless the action is intentionally forceful, such as a destructive confirmation.

## Composition Law

Backgrounds are for atmosphere. Accents are for meaning.

This is the most important discipline to keep across products.

- page backgrounds should be mostly warm and quiet
- large sections should create depth through surface layering first
- strong color should be concentrated around action, state, and important meaning
- one screen may have several accents, but only one should lead at a time

If every section is equally colorful, the screen loses sanctuary and becomes noisy.

## Anti-Rules

Do not do the following:

- no pure white backgrounds
- no pure black surfaces in the light sanctuary world
- no neutral gray card systems detached from the palette
- no random gradients added for novelty
- no section-specific palette drift that makes each product look unrelated
- no heavy colored cards everywhere
- no generic shadow systems outside shadow-violet

## Usage Mapping

### Page Background

- base: `vellum`
- optional atmosphere: very soft warm-to-cool wash derived from vellum, silk, and a restrained accent tint
- keep large backgrounds quiet and low contrast

### Hero or Intro Surface

- base: lifted `silk`
- optional subtle tint based on the dominant intent of the screen
- heading in `inkTruth`
- support copy in `bark`
- highlighted phrase or CTA in `sanctuarySaffron` unless another semantic accent is more truthful

### Content Card

- base: `silk`
- border: `linen` or `border`
- text: `inkTruth` + `bark`
- shadow: `shadowAmbient`

This is the default card pattern for lists, registries, summaries, and most containers.

### Utility Card

- base: `silk` plus restrained semantic tint if needed
- used for side tools, secondary actions, snapshots, support context
- should not visually overpower the primary workspace card

### Chip or Badge

- background: softened tint or muted `linen`
- text: semantic accent or `bark`
- active chips may use saffron, blue, violet, or sage depending on meaning
- inactive chips should remain quiet

### Primary Action

- background: `sanctuarySaffron`
- text: use readable dark text if contrast allows, otherwise `sacredWhite`
- shadow: optional `shadowFocus`

Primary actions should feel warm and invitational, not aggressive.

### Secondary Action

- surface: `silk` or softened semantic tint
- border: `linen`
- text/icon: semantic accent or `inkTruth`

Secondary actions should stay clear without competing with the primary CTA.

### Destructive Action

- use `emberOrange` or `emberRed` carefully
- prefer soft destructive surfaces in browsing contexts
- reserve strong filled destructive styling for confirmed or high-risk actions

### Empty, Loading, and Skeleton States

- empty states should still feel warm and hopeful; use `silk` and quiet accents
- loading cards and skeletons should sit in the sanctuary palette, not gray placeholders
- muted shimmer or placeholder surfaces should derive from `silk`, `linen`, and faint overlays

## Implementation Notes

- Prefer consuming existing `Theme.colors` tokens instead of introducing ad hoc values.
- If a new surface tint is needed, add it only when it clearly generalizes across more than one screen.
- When in doubt, reduce color rather than add more. Gurudevi works best when meaning is concentrated.

## Acceptance Check

A screen follows this doctrine if all of the following are true:

- the page background feels warm and quiet
- the main workspace is separated by surface depth, not by loud color blocks
- text hierarchy is clear using existing warm text tokens
- accents explain meaning instead of decorating everything
- states feel integrated into the sanctuary world
- the screen could sit beside classroom, library, profile, or community and still feel like part of one family
