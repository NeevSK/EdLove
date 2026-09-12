---
title: "Gurudevi Anti-Slop Enforcement"
status: "active"
created: 2026-09-09
updated: 2026-09-09
author: "Naveen"
tags: [apps, gurudevi-mobile, design, quality, anti-slop]
---

# Gurudevi Anti-Slop Enforcement

This policy prevents generic AI-generated UI from becoming the default design language. It applies to design proposals, generated code, visual QA, and reviews.

## What counts as slop

Slop is not a particular color, framework, or component. Slop is an unreasoned pattern that could be moved to another product without changing its meaning.

High-risk signals include generic gradients, neon, glow, mesh, blobs, particles, universal glass/blur, equal rounded-card grids, nested containers, default typography, repeated centered hero compositions, decorative badges/icons, purposeless motion, invented content, and vague action copy.

## Required design evidence

Every new or substantially redesigned screen must document:

1. Human activity: what real activity does this screen support?
2. Spatial model: what place, arrangement, or relationship does the user understand?
3. Primary object: what deserves attention first and why?
4. Process stage: where is the user in the journey?
5. State model: what changes after the primary action?
6. Landmark: what helps a returning user know where they are?
7. Material rationale: why does each expressive surface exist?
8. Motion rationale: what does each animation explain?
9. Accessibility behavior: focus, reduced motion, larger text, contrast, and target size.
10. Removal test: which decorative element was removed because it had no job?

If these answers are absent, the work is not ready for visual polish or implementation.

## Review gates

- Meaning: reject when the screen cannot be explained as a human process or place.
- Hierarchy: reject when every element has similar weight or the main action is unclear without color.
- Material: reject when blur, glass, shadow, gradient, or glow has no layer or interaction rationale.
- Motion: reject when animation is continuous by default, repeats on frequent actions, cannot be interrupted, or communicates nothing useful.
- Evidence: reject when only a default screenshot is reviewed; check primary, empty, loading, error, completion, reduced-motion, and larger-text states.

## Machine-checkable checks

These checks are signals, not substitutes for human review:

- flag new raw color values in screen-level styles;
- flag repeated `blur`, `backdrop`, `glow`, `neon`, `gradient`, `particle`, `float`, and `parallax` in new UI code;
- flag repeated card/container components in one screen;
- flag animation declarations without an adjacent state or interaction reference;
- flag generic action copy such as `Get Started`, `Nothing here yet`, `No data found`, or `Learn more` when a specific action can be named;
- flag opacity-only state changes without an additional non-visual cue;
- flag duplicated primitives instead of justified variants.

Machine checks must report findings for review. Only high-confidence generic patterns block changed UI. Token violations such as black shadows remain review findings until their context is understood. Exceptions require a written reason and human reviewer; suppressions must not silently weaken the gate.

## Human review checklist

- Would this look and behave the same if the brand name were removed?
- Can a new person understand the main activity in three seconds?
- Is distinction caused by meaning or only decoration?
- Does the layout support memory and return?
- Does motion follow action and preserve orientation?
- Are there real states, or only a polished default screenshot?
- Does the screen remain good without gradients, blur, or animation?
- Is there one memorable decision rather than ten competing effects?

## Enforcement outcome

Each review ends as accepted, revise, exception, or rejected. An exception must name the surface, technique, reason, and expiry/review condition.
