---
title: "Gurudevi Responsive Shell and Layout Spec"
status: "active"
created: 2026-05-27
updated: 2026-05-27
author: "Naween"
tags: [reorganized]
---

# Gurudevi Responsive Shell and Layout Spec

This document defines the presentation modes for the Expo Router migration. It is intentionally about layout and shell behavior, not about sealed auth/capacity logic.

## Purpose

We need the app to feel intentionally different across:
- mobile phones
- tablets and pads
- mini laptops and narrow desktops
- full desktop web

The goal is not to scale one layout down or up. The goal is to choose a different shell and density policy for each mode while reusing the same business logic, hooks, and feature components.

## Core Principle

Treat these as separate concerns:
- `platform` decides the baseline shell family
- `width` decides the density and column policy
- `role` decides what the user is allowed to see
- `workspace capacity` stays store-only and never becomes route state

## Responsive Modes

### 1. Mobile

This is the smallest native form factor.

Expected traits:
- bottom-tab centric navigation
- compact global header
- notifications may live in the global header
- settings may live inside Profile
- single-column content is the default
- modal sheets are preferred over side panels

### 2. Tablet and Pad

This is the most important middle mode.

Expected traits:
- still touch-first
- may keep the mobile navigation model
- but can widen into two-pane or split-pane layouts
- can show persistent panels when space allows
- should not automatically become desktop shell
- should not automatically become mobile shell

Tablet behavior should be a deliberate hybrid:
- more context than mobile
- less density than desktop
- room for persistent navigation or inspector panels

### 3. Mini Laptop / Narrow Web

This is a web-specific compact mode.

Expected traits:
- web navigation rules, but compact density
- should not become a tiny stretched desktop
- may collapse desktop panels into stacked sections
- may keep profile/settings/notifications separated in route structure while presenting them compactly
- should not inherit all desktop affordances if width is below the desktop threshold

### 4. Desktop Web

This is the full web shell.

Expected traits:
- richer shell
- separate destinations for notifications and settings if desired
- profile can stay profile-only
- side rail or wide header patterns are acceptable
- multi-column layouts are preferred where useful
- persistent panels are acceptable

## Proposed Shell Model

Use a layout resolver that can identify:
- `mobile`
- `nativeTablet`
- `webCompact`
- `webTabletCompact`
- `webDesktop`

The resolver should consider:
- `Platform.OS`
- window width
- maybe height if needed for special cases

Tablet is not one thing:
- `nativeTablet` means the app is running on a tablet-sized native device
- `webTabletCompact` means the app is running in web but at tablet-like width

But the output should be behavioral, not just dimensional:
- tab style
- header density
- panel persistence
- number of columns
- route emphasis

## Navigation Policy

### Mobile
- Profile owns settings
- notifications may be a header action
- tabs remain the primary app map

### Tablet
- may keep mobile-style tab routing
- may elevate some utilities into persistent side panels
- may use a two-column profile or settings view

### Mini Laptop / Narrow Web
- may use a compact web shell
- settings and notifications can stay separate routes
- layout should collapse gracefully into one column when narrow

### Desktop
- profile is profile-only
- settings and notifications may be first-class routes
- shell can use a side rail or hybrid header

## Route Strategy

Routes should remain mostly shared.

Examples:
- `profile`
- `settings`
- `notifications`
- `community`
- `library`
- `self`

The shell decides:
- whether a route is top-level
- whether it appears in the chrome
- whether it opens as a panel
- whether it is hidden behind a utility affordance

## What Changes by Mode

### Mobile
- compact cards
- fewer visible actions
- tighter header
- bottom tabs

### Tablet
- larger touch targets
- more whitespace than mobile
- optional persistent panes
- can show denser content without becoming desktop

### Mini Laptop / Narrow Web
- compact spacing
- web navigation semantics
- stacked layout instead of over-wide panels
- avoid “stretched phone” behavior

### Desktop
- multi-column layouts
- persistent utilities
- wider content regions
- separate destinations for navigation-heavy areas

## What Should Stay Shared

These should not be duplicated just because the shell changes:
- data fetching
- hooks
- permission checks
- role resolution
- feature registry logic
- most reusable UI primitives and feature components

## What Can Differ

These can differ between modes:
- route shell
- tab order / visibility
- header actions
- panel persistence
- column count
- density
- whether settings and notifications are surfaced globally or per tab

## Tablet-Specific Guidance

Tablet is its own mode, not a midpoint to ignore.

Recommended tablet rules:
- do not assume tablet should match desktop
- do not assume tablet should match phone
- favor split layouts only when there is enough width
- keep interactions touch-friendly
- avoid overcomplicated sidebars unless there is enough room

If a screen benefits from it, tablet can:
- show a master/detail split
- keep the tab shell but widen content panes
- make settings a panel instead of a page

## Web Compact Guidance

This mode exists so mini laptops and narrow windows do not look broken.

Recommended web-compact rules:
- keep web route semantics
- reduce density
- collapse multi-column layouts
- make persistent panels conditional
- avoid mirroring the full desktop chrome when width is too small

## Recommended Migration Order

1. Establish the shared Expo Router shell.
2. Remove the React Navigation bridge.
3. Introduce a layout resolver for `mobile`, `tablet`, `webCompact`, and `webDesktop`.
4. Move the current tab shell into route layouts.
5. Keep mobile and web shell differences explicit.
6. Start splitting route wrappers for profile, settings, notifications, and tab content.
7. Then refine tablet and web-compact behavior screen by screen.

## Notes From Existing Audits

Relevant references:
- `docs/GURUDEVI_PRE_MIGRATION_OPERATIONALIZATION_PLAN.md`
- `docs/GURUDEVI_PRE_MIGRATION_CAVEATS_AND_MEMORY.md`
- `docs/GURUDEVI_PRE_MIGRATION_PROGRESS_TRACKER.md`
- `docs/Expo router audit 1 .md`
- `docs/expo router audit 2.md`
- `docs/ground-truth-audit.md`
- `docs/ground-truth-audit-2.md`

The audits already confirm:
- web has a different shell topology than native
- `Self` is layered and identity-resolved
- workspace capacity is store-only
- `WorkspaceCanvas`, `WorkspaceLayout`, and `WorkspaceSurface` already exist
- the app still has deep React Navigation usage that must be retired carefully

## Implementation Boundary

Do not change these as part of the layout resolver:
- auth slice internals
- permission store internals
- capacity switching internals
- CASL recomputation logic
- Self registry shape

The layout resolver should only decide how existing routes and surfaces are presented.
