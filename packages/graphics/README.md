---
title: "@repo/graphics"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [packages, graphics]
---

# @repo/graphics

## Purpose
`@repo/graphics` owns reusable visual systems, diagrams, topologies, and richer graphical rendering shared across domains.

## Owns
- reusable graphics and knowledge-topology components
- cross-domain visual rendering logic
- package-local web/native graphic variants when rendering technology differs

## Does Not Own
- domain orchestration
- app shell layout or route control
- business workflows that only happen to include graphics

## Collaborates With
- `@repo/ui` for layout integration
- domain packages that need advanced visuals

## Web Placement
Browser-specific graphic implementations belong here when the visual system itself differs across platforms.

## App Adapter Rule
The app should consume graphics through domain packages or shared exports, not own graphic logic directly.
