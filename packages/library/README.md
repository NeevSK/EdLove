---
title: "@repo/library"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [packages, library]
---

# @repo/library

## Purpose
`@repo/library` is the knowledge sanctuary domain. It owns library browsing, collections, resource consumption, maps, and contribution flows.

## Owns
- library APIs, types, hooks, and resource logic
- library screens, collection detail views, and media viewers
- package-local web/native variants for browsing and resource playback
- collection and curation UI that belongs to the library domain

## Does Not Own
- app shell navigation
- generic browser shell components
- classroom or profile workflows that only happen to link into the library

## Collaborates With
- `@repo/core` for data and identity context
- `@repo/ui` for shared cards and sanctuary surfaces
- `@repo/graphics` for richer visual perspectives

## Web Placement
`*.web.tsx` files belong in `src/screens` and feature component folders when the browser version needs denser browsing, map, or media UX.

## App Adapter Rule
The app may keep thin route adapters and stack registration, but library search, collections, and contribution behavior should live here.
