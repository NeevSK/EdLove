---
title: "Gurudevi External-World Design Canon"
status: "active"
created: 2026-09-09
updated: 2026-09-09
author: "Naveen"
tags: [apps, gurudevi-mobile, design, ux, hci, canon]
---

# Gurudevi External-World Design Canon

This document records design principles for Gurudevi derived from human experience, HCI research, interaction design, spatial metaphors, materiality, visual perception, and platform guidance. It is intentionally separate from Gurudevi's existing visual vocabulary. Existing tokens and components are implementation constraints; this document is the external reference for deciding what the experience should mean.

## Core proposition

An interface should feel like a place where a human activity happens, not a collection of styled components.

The product must make visible where the person is, what they are doing, what has changed, what they can do next, and what the system remembers for them. Beauty is a consequence of coherent meaning, hierarchy, material behavior, and rhythm. Effects are subordinate to those decisions.

## The five external laws

### 1. Place before surface

Every important screen needs a spatial model. Choose a real-world activity or place whose logic helps the person understand the screen: a desk, journal, workbench, classroom, shelf, archive, path, threshold, or gathering table.

Do not copy its appearance literally. Translate its relationships: containment, adjacency, sequence, orientation, reach, pause, return, and discovery.

Ask: if this were a physical place, what would the person be doing here and what would they naturally reach for next?

### 2. Surface, behavior, and system must agree

An interactive object has three inseparable aspects: surface (visual and tactile presence), behavior (response to touch, time, movement, and state), and system (meaning, persistence, and relationship to other objects).

Do not polish a surface whose behavior communicates nothing. A restrained surface with coherent behavior is more human than a rich surface with arbitrary animation.

### 3. Space is memory

People learn repeated interfaces partly through location. Stable placement, recognizable landmarks, visible context, and predictable return paths reduce visual search and create automaticity.

Keep primary landmarks stable. Let change occur within the space rather than relocating the space itself. Use a clear "you are here" signal and preserve the relationship between an object and the place where it was discovered.

### 4. Hierarchy is a perceptual and temporal sequence

Hierarchy is created by scale, contrast, proximity, alignment, density, whitespace, and timing before it is created by color or effects.

Each screen should have a perceptual sequence:

```text
orient -> notice -> choose -> act -> understand the result -> continue or rest
```

The layout should not make every element equally loud. One element or activity may be memorable; supporting elements should be calm enough to make it legible.

### 5. Motion explains causality

Motion is valuable when it explains what changed, where something came from, where it is going, or how an action completed. It should follow the user's gesture and the object's apparent source.

Motion must be brief, interruptible, and optional where possible. Never use continuous motion as proof of aliveness. If an element moves without explaining a state or relationship, remove the motion.

## Human process model

Do not design a screen as a static set of content blocks. Model the human process it supports.

Common process stages:

```text
arrive -> orient -> notice -> choose -> practice -> reflect -> carry forward
```

For each screen, document the human intention, current process stage, primary object of attention, next action, result of that action, place to return later, and quiet state when no action is needed.

## Material and depth model

Use depth as a relationship, not an effect. Prefer overlap, occlusion, scale, distance, foreground/middle-ground/background, edge sharpness, contrast, atmospheric reduction, alignment, containment, different motion speeds, and concentrated detail.

Use blur, translucency, gradients, and shadow only when they express a material or clarify a layer. A material must answer: what is behind it, what is above it, what is protected, and why is this layer separate?

Do not apply one material treatment to every surface. Ordinary utility controls should be quieter than scenic or emotionally important moments.

## Color model

Color is relational. It should communicate environmental condition, focus, energy, rest, urgency, completion, or belonging.

Use semantic roles: ground, primary activity, focus, support, completion, caution, invitation, and memory. Color may change across state, phase, or space, but the change must have meaning. Do not add accents merely to make a screen feel richer.

## Layout and relative space

Use proximity to show relationship, separation to show difference, alignment to create invisible rails, and whitespace to create pauses.

Do not give every section the same rhythm. A human composition may have an opening, a concentrated activity area, a pause, a reveal, and a continuation.

Respect reading order, safe areas, touch reach, text length, and responsive behavior. Let the most important content appear where attention naturally begins, while preserving enough space around actions to make their role clear.

## Recognition, disclosure, and wayfinding

Prefer recognition over recall. Keep the information needed for an action visible or easily retrievable. Use progressive disclosure for advanced or infrequent options, but make the route to them obvious.

Every substantial space should answer: Where am I? What is this place for? What is active now? What is nearby? What did I last do here? How do I return without losing my place?

## States and accessibility

Empty, loading, error, completion, and interruption are part of the experience. Empty states should offer a beginning; errors should explain recovery; completion should show where the result now lives; interruption should preserve work and continuity.

Legibility, focus, target size, reduced motion, readable type, and non-color state cues are design constraints, not post-design compliance. Motion must never be the only communication channel.

## Anti-pattern boundary

Glass, blur, gradients, glow, particles, cards, centered layouts, badges, and motion are not forbidden techniques. They are forbidden as defaults without a documented reason tied to human activity, hierarchy, material, state, or wayfinding.

## External references

- [Apple Human Interface Guidelines: Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple Human Interface Guidelines: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Apple Human Interface Guidelines: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [NN/g: Spatial Memory](https://www.nngroup.com/articles/spatial-memory/)
- [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [NN/g: Recognition and Recall](https://www.nngroup.com/articles/recognition-and-recall/)
- [NN/g: Visual Design Principles](https://www.nngroup.com/articles/principles-visual-design/)
- [Jung, Wiltse, Wiberg, Stolterman: Metaphors, Materialities, and Affordances](https://www.sciencedirect.com/science/article/abs/pii/S0142694X17300467)
- [Spatial Metaphors and the Design of Everyday Things](https://pmc.ncbi.nlm.nih.gov/articles/PMC9723982/)
- [Norman's signifiers and affordances overview](https://assets.interaction-design.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed/affordances)

## Canonical status

This document governs design reasoning. It does not prescribe a fixed visual style or replace implementation truth. When implementation and this canon disagree, record the discrepancy and decide deliberately whether to change the implementation, refine the canon, or mark the idea as exploratory.
