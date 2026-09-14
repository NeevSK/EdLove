---
title: "ADR: Gurudevi Sanctuary Spatial Language and Domain Transitions"
status: accepted
date: 2026-09-14
owners: [Naveen, Gurudevi platform]
tags: [gurudevi, sanctuary, web, design-system, motion, canvas]
---

# ADR: Gurudevi Sanctuary Spatial Language and Domain Transitions

## Decision

Gurudevi is an education ecology entered through a Sanctuary. Its web interface
must feel like a sequence of purposeful places rather than a single dashboard
with theme-coloured tabs. The Sanctuary shell is structural plumbing; each
domain owns a distinct canvas/floor and a distinct spatial atmosphere.

The experience borrows spatial qualities—threshold, procession, spaciousness,
light, orientation, shelter, gathering, and privacy—from sacred, civic,
forest, archive, and museum-like places. It does not copy any religion’s
symbols, rites, or iconography.

## Spatial grammar

Every meaningful domain crossing follows this sequence:

```text
orientation → threshold → arrival → domain canvas → focused alcove → return
```

- **Orientation** is the persistent Sanctuary structure: navigation and clear
  account context.
- **Threshold** signals that the person has chosen to enter a different kind of
  work, not merely changed a URL.
- **Arrival** offers one calm, legible cue before a dense canvas appears.
- **Domain canvas** is the tab-owned floor where its surfaces are arranged.
- **Focused alcove** narrows attention for reading, attendance, writing,
  settings, or another committed task.
- **Return** preserves orientation and makes leaving intelligible.

Use expansive compositions only for arrival, reflection, orientation, and
creative possibility. Use tighter, quieter alcoves for attention-demanding
work. Spaciousness is proportion, sightline, hierarchy, and the absence of
competing demands—not a permanently oversized empty page.

## Domain atmospheres

| Domain | Felt quality | Canvas/floor | Light and composition | Transition behavior |
| --- | --- | --- | --- | --- |
| Self | calm, reflective, invitational | Personal sanctuary canvas | Soft side-light, generous arrival space, few simultaneous focal objects, sheltered practice alcoves | A slow but restrained arrival; never animate continuously while a person journals, reflects, or records mood. |
| Workspace | focused, grounded, capable | Work canvas with meaningful zones | Clear task light, strong alignment, visible work surfaces, reduced decorative movement | Fast, direct threshold; preserve task context and never delay attendance, grading, or a save action for ceremony. |
| Community | warm, lively, participatory | Commons/mode canvas | A shared central field with peripheral context; richer but controlled presence cues | Brief gathering transition; live updates must be calm, grouped, and dismissible rather than constantly moving. |
| Library | calm, contemplative, inviting | Archive/reading canvas | Quiet reading light, long visual rhythm, shelves and passages, focused reader alcoves | Measured reveal into reading; reader controls remain immediate and unanimated once opened. |
| Profile | private, dignified, bounded | Identity/settings canvas | Intimate scale, clear privacy boundaries, high legibility | Minimal transition; privacy and settings actions favour certainty over atmosphere. |

## Light, height, and spaciousness

Light is a structural state, not a decorative gradient. Each domain has one
primary illumination plane or “window” that establishes orientation; secondary
regions recede through contrast, surface value, and spacing. Do not put glow,
blur, or animated particles behind every card.

Vertical spaciousness is applied selectively:

- high/open arrival regions for beginning a domain, discovering a library, or
  returning to reflection;
- lower/contained work regions for forms, table work, settings, and readers;
- clear sightlines from the arrival region to the next meaningful action;
- no false “cathedral” claim: high/open compositions are not assumed to improve
  wellbeing or concentration for every person or task.

## Transition implementation contract

Domain identity is carried in a small set of browser CSS custom properties on
the domain canvas root, for example `data-domain="self"` and semantic tokens
for surface, light, emphasis, and transition duration. Components consume
semantic tokens; they do not hard-code a domain colour or animation.

Allowed transition moments:

1. Entering a primary domain from another primary domain.
2. Entering or leaving a deep, focused alcove such as a Library reader or a
   Workspace attendance session.
3. A user-confirmed state change with a meaningful outcome.

Do not animate routine tab presses, typing, list filtering, loading retries,
errors, destructive actions, authentication redirects, or every card hover.
Transitions must be interruptible and must never conceal new content, block
input, or delay navigation.

The preferred technical shape is progressive enhancement: browser-native view
or CSS transitions where supported, an immediate semantic navigation fallback
everywhere else, and `prefers-reduced-motion: reduce` as an explicit no-motion
path. The motion system must expose duration/easing tokens, route-transition
intent, and testable completion events; it must not depend on React Native
animation, Reanimated, or a hidden full-screen animation layer.

## Acceptance criteria

- A person can identify their current domain and the next action without relying
  on motion, colour, or decorative light.
- Each domain canvas feels distinct through composition and behavior, not only
  a palette swap.
- The global shell remains quiet enough for domain atmospheres to matter.
- Large text, compact portrait, compact landscape, keyboard navigation, and
  reduced motion preserve both orientation and task access.
- Animation is reviewed in the actual browser at normal and constrained device
  performance before it is called part of the product experience.
