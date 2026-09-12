---
title: "Gurudevi Human Interface Implementation Method"
status: "active"
created: 2026-09-09
updated: 2026-09-09
author: "Naveen"
tags: [apps, gurudevi-mobile, design, ux, implementation]
---

# Gurudevi Human Interface Implementation Method

This is the delivery method for turning the External-World Design Canon into elegant, usable screens.

## Phase 1: Choose one real process

Do not redesign an entire app at once. Choose one high-value process and document the user's before, during, and after state.

```text
arrive -> orient -> notice -> choose -> practice -> reflect -> carry forward
```

## Phase 2: Draw the spatial composition

Before selecting colors or effects, sketch the screen as regions and relationships:

```text
[place marker / return context]

[primary activity: generous space]

[supporting context]       [next meaningful action]

[history / continuity]
```

Decide what is fixed, what scrolls, what expands, and what remains near the user's thumb or keyboard focus.

## Phase 3: Define the state story

Specify default, selected, pressed, loading, empty, error, completed, interrupted, reduced-motion, and larger-text behavior before implementation. The completed state must show where the result went; interruption must preserve trust and work.

## Phase 4: Create a thin visual system

Define only the tokens needed for the chosen process: environmental ground, primary activity, supporting text, focus/selection, completion/caution, spacing rhythm, type hierarchy, material levels, and motion families.

Start in grayscale to verify hierarchy. Add color after the composition works. Add material after the layer relationships are clear.

## Phase 5: Add behavior before ornament

Implement source-to-destination continuity, action feedback, state settling, progressive disclosure, and restoration of place. Only then consider texture, atmospheric variation, or scenic detail.

## Phase 6: Validate in real conditions

Review first visit, repeat visit, slow network or offline interruption, empty data, error/recovery, keyboard or touch reach, larger text, reduced motion, and narrow/wide layouts.

Ask: Can a new person begin? Can a returning person resume? Can they tell what changed? Can they recover without fear of losing work?

## Phase 7: Extract only what proved useful

After one process feels coherent, extract reusable primitives and tokens. Promote a pattern only when it appears in more than one meaningful process or has a clearly reusable state contract.

## Recommended rollout

1. Pick one process with visible user value.
2. Write its human and spatial model.
3. Prototype layout without effects.
4. Add state and transition behavior.
5. Add one material and one memorable visual moment.
6. Run anti-slop and accessibility review.
7. Test with real people or task-based observation.
8. Extract reusable primitives.
9. Apply the method to the next process.

The goal is not to make every screen equally expressive. The goal is to make every screen honest about the human activity it supports.
