---
title: "Expo Router Deep Link Decision"
status: "superseded"
superseded_by: "../../../../docs/architecture/route-intent-policy.md"
created: 2026-06-10
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [expo-router, deep-linking, linking, routing, mobile, web]
---

# Expo Router Deep Link Decision

> Superseded by the cross-platform [Route Intent Policy](../../../../docs/architecture/route-intent-policy.md).
> This record remains historical context for the earlier Expo Router decision.

This note decides how `gurudevi-mobile` should handle internal sharing, QR flows, library-item links, and external app handoff while staying aligned with Expo Router.

## Short Answer

We do **not** need a separate "detour" navigation system for the current app.

Expo Router already covers the main deep-linking use cases we have:

- direct links to app screens
- shareable URLs for tab routes and nested routes
- route parameters for item/detail pages
- web-to-native and native-to-web path parity

We only need an extra customization layer if we want to rewrite unusual incoming link payloads before routing them.

## What We Already Have

Live Expo Router routes already exist for:

- `/qr`
- `/a-i-assistant`
- `/self`
- `/community`
- `/library`
- `/profile`
- `/notifications`
- `/settings`
- `/library/document/[resourceId]`
- `/library/collections/[id]`
- `/library/video/[resourceId]`
- nested routes under `app/(tabs)/...`

Current code also already does:

- route navigation with `router.push(...)` and `router.replace(...)`
- parameter passing with `router.push({ pathname, params })`
- web route title updates
- browser-side "Open App" handoff for mobile web
- deep link interception in `DeepLinkProvider`

## What Expo Router Already Solves

Expo Router supports deep linking by default for app routes.

That means we can share or open:

- a QR-related screen
- a library item
- a collection
- a profile or community page
- nested tabs and modal routes

without building a separate navigation framework.

## Where We Need Extra Care

### 1. QR payloads

QR payloads may contain non-URL data.

Current approach:

- parse the incoming QR payload in app logic
- route to `/qr`
- pass the payload as a serializable query value when needed

Tradeoff:

- simple for the router
- but large or complex payloads should stay in app state or storage rather than the URL

### 2. Library-item links

Library items are a strong fit for Expo Router because they are already modeled as routes.

Good fit:

- `/library/document/[resourceId]`
- `/library/video/[resourceId]`
- `/library/collections/[id]`

Tradeoff:

- route params must stay serializable
- anything too rich for a URL should be loaded from storage or an API after navigation

### 3. Internal browser or sandbox handoff

This is the main case where people sometimes imagine a "detour" layer.

Our current `RedirectToApp` web component already handles the real need:

- mobile web users can be offered the native app
- session handoff can be signaled through a URL
- the app can open a custom scheme like `gurudevi://`

Tradeoff:

- simple and explicit
- but it is a handoff mechanism, not a routing framework

### 4. Third-party or unusual incoming links

Expo Router documents a `+native-intent` customization point for links that arrive in non-standard forms.

We should only add that if we actually encounter:

- a third-party app sending non-route payloads
- a partner system that needs link rewriting
- a closed-app launch flow that does not map cleanly to a route

## Decision

### Do

- keep Expo Router as the only live routing system
- use plain route URLs for shareable internal destinations
- use route params for library items and simple deep links
- keep QR and session handoff in small adapter code
- keep browser-to-native "open app" behavior as a separate handoff concern

### Do Not

- do not add a second navigation abstraction just for deep links
- do not resurrect React Navigation route-name navigation in live code
- do not pass large opaque payloads through URLs if the data is better stored locally
- do not force every handoff case into the same routing mechanism

## Recommended Pattern

For most internal sharing:

- route URL
- serializable params
- Expo Router screen

For special incoming links:

- small parser / adapter
- optional `+native-intent`
- then route with Expo Router

For browser handoff:

- keep the existing web "Open App" flow
- treat it as external app launch, not internal navigation

## Bottom Line

We do **not** need a detour system today.

Expo Router already covers the normal internal sharing cases in this app, and the current codebase already uses route-first navigation in the right places. The only thing we should add later is a link-rewrite adapter if an actual external integration proves we need it.

