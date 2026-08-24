---
title: "@repo/community"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [packages, community]
---

# @repo/community

## Purpose
`@repo/community` is the relational ecosystem domain. It owns groups, feed participation, and community-specific creation and discovery flows.

## Owns
- community APIs, types, and hooks
- group and feed feature components
- community-specific screens and any package-local web/native variants

## Does Not Own
- app shell layout and route orchestration
- profile identity rendering
- classroom, admin, or self feature ownership

## Collaborates With
- `@repo/core` for permissions and shared data access
- `@repo/profile` for identity presentation
- `@repo/ui` for shared interaction patterns

## Web Placement
Community-specific browser experiences belong inside this package when they are truly feature-level differences.

## App Adapter Rule
The app may host route adapters for community routes, but not community orchestration.
