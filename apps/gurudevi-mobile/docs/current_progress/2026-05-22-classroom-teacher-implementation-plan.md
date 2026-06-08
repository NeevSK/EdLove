---
title: "Classroom Teacher Implementation Plan"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Classroom Teacher Implementation Plan

## Summary

This document turns the approved `Teacher ClassroomScreen` redesign into an implementation-ready spec for both mobile and web. It is a visual and structural refactor over the current classroom teacher experience, not a product rewrite.

The governing rule is:

- keep existing capability
- improve hierarchy
- make the classroom registry the center of gravity
- apply the sanctuary color doctrine consistently

The two implementation targets are:

- [TeacherDashboard.tsx](/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/TeacherDashboard.tsx)
- [TeacherDashboard.web.tsx](/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/TeacherDashboard.web.tsx)

## Current Capability to Preserve

The redesign must preserve these behaviors and flows:

- temporal navigation
- create class
- join class
- scan QR
- classroom registry and classroom entry
- summary stats / pulse
- admin access
- principal echo / feedback
- teacher echoes history
- breathing reset
- library access on mobile
- demo mode and guest handling
- past-view disabling behavior
- create-classroom modal and QR join logic

No backend contract, navigation contract, or QR/join/create flow should change in this first slice.

## Target Information Hierarchy

### Shared Intent

Both platforms should feel like the same product family, but not the same composition.

- first read: "this is my classroom workspace"
- second read: "these are my immediate actions and pulse"
- third read: "supporting context is nearby but not competing"

### Web

Web should become a teacher command surface with clear dominance:

1. hero and primary actions
2. temporal context
3. classroom registry as the dominant workspace
4. side context for assignments, snapshot, and admin utilities

Web should not feel like equal-weight cards stacked in a dashboard. The classroom registry column should be visually and spatially dominant.

### Mobile

Mobile should become a calmer sanctuary stack:

1. hero intro
2. temporal context
3. compact primary action group
4. pulse / stat strip
5. classroom registry
6. secondary tools and reflective utilities

Mobile should reduce the feeling that every action tile is equally loud.

## Implementation Changes

### 1. Shell and Background Cleanup

Apply the UI color doctrine before changing deeper layout hierarchy.

- use a sanctuary page background built from `vellum` with restrained depth
- upgrade major sections to feel lifted through `silk`/`linen` layering and shadow-violet
- remove any "plain card on plain page" feeling from the teacher shell
- keep accent use sparse and meaningful

This shell cleanup may justify a small shared wrapper in `@repo/ui` only if both mobile and web clearly reuse it.

### 2. Shared Visual Patterns

Create or refactor these visual patterns before deeper screen-specific edits:

- hero / intro section shell
- classroom workspace section shell
- utility/support panel shell
- action chip or action tile treatment for teacher tools
- stat card treatment aligned with the doctrine

Keep the first pass local to `@repo/classroom` unless duplication across both platforms is obvious and stable.

### 3. Mobile Screen Refactor

Refactor [TeacherDashboard.tsx](/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/TeacherDashboard.tsx) into a more intentional vertical rhythm.

Required structure:

- short hero/introduction section above the navigator
- temporal navigator in its own calmer band
- primary actions grouped into a clearer cluster
- secondary actions separated from primary actions
- stat cards simplified so they support the registry instead of competing with it
- classroom registry as the primary long-form section
- breathing, echoes, admin, and library tools moved into a quieter secondary support zone when possible

Behavior rules:

- keep `isPastView` disabling behavior intact
- keep `useRegisterFAB` behavior intact
- keep modal triggers and navigation targets unchanged
- preserve demo and guest invitations

Recommended mobile grouping:

- primary actions: create, join, scan
- support actions: admin, library, principal echo, my echoes, breathing

### 4. Web Screen Refactor

Refactor [TeacherDashboard.web.tsx](/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/TeacherDashboard.web.tsx) into a more explicit workspace layout.

Required structure:

- hero header with teacher identity and primary actions
- temporal navigator below the hero
- stats row as supporting context
- main two-column body
- dominant left column for classroom registry
- narrower right column for snapshot, assignments, and admin actions

Behavior rules:

- preserve existing hook usage and data contracts from:
  - `useTeacherRegistry`
  - `useTeacherAssignmentsPulse`
  - `useTeacherEchoesPulse`
  - `useTeacherTemporalSnapshot`
- keep create-classroom behavior unchanged
- keep existing POA actions, but align them visually and structurally with the new hierarchy

Web-specific divergence:

- the registry must read as the primary working lane
- assignments and snapshot stay visible, but visually secondary
- admin actions belong with support context, not in the main workspace lane

### 5. Component Boundary Guidance

The following can stay local to `@repo/classroom` on the first pass:

- teacher dashboard-specific section wrappers
- teacher-specific action group styling
- registry-focused layout composition
- web-only sidebar composition

Only move something into `@repo/ui` if it becomes a clearly reusable primitive after both platforms are implemented.

Possible shared UI additions if proven necessary:

- sanctuary page section wrapper
- shared action chip/tile primitive
- shared "workspace panel" shell

## Public APIs / Interfaces

No public backend API changes.

No navigation changes.

Allowed UI-surface changes:

- small presentational prop additions on classroom components
- optional shared wrapper components in `@repo/ui` if reuse is confirmed

Not allowed in this slice:

- changes to flow resolver logic
- changes to QR payload handling
- route renames or dashboard flow rewrites

## Testing and Validation

### Functional Scenarios

- teacher can create a class from mobile and web
- teacher can join a class from mobile
- teacher can scan QR and follow the current flow
- teacher can open a classroom from the registry
- teacher can access admin actions
- teacher can access principal echo and my echoes
- teacher can access breathing reset
- teacher can still see stats and temporal navigation
- demo mode and guest mode still render correctly
- past-view still disables actions correctly

### UI Validation

- web registry is the dominant visual workspace
- mobile has a calmer top-to-bottom rhythm than the current dashboard
- support actions are discoverable but no longer visually equal to the main workflow
- surfaces follow the doctrine: vellum ground, silk cards, linen borders, shadow-violet lift
- accents are restrained and meaningful
- loading and empty states still feel sanctuary-native

### Comparison Check

Before sign-off, compare coded web and mobile screens against the approved teacher redesign in Figma and adjust:

- hierarchy
- section weight
- action grouping
- surface treatment
- spacing rhythm

## Execution Sequence

1. Apply doctrine-level shell and surface cleanup to mobile and web.
2. Refactor web hierarchy around registry-first composition.
3. Refactor mobile hierarchy into the calmer sanctuary stack.
4. Tighten duplicated visual primitives only where reuse is proven.
5. Compare code against Figma and iterate.

## Assumptions

- Teacher classroom is the only redesign approved for implementation right now.
- Both platforms should be planned and built together so the doctrine stays coherent.
- The first implementation should optimize for stronger hierarchy and visual consistency, not new product features.
- Other sections may later inherit the doctrine, but not the classroom layout unless their context truly matches.
