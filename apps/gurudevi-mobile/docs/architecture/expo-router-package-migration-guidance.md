---
title: "Expo Router Package Migration Guidance"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [expo-router, migration, package-boundaries, navigation, guidance]
---

# Expo Router Package Migration Guidance

This is the working guide for migrating route-owned packages in `gurudevi-mobile` to Expo Router. It captures the hard-earned rules from the `profile`, `community`, `self`, and `library` migrations and turns them into a repeatable process.

Use this guide when converting any package that still contains React Navigation assumptions, screen-name navigation, route params, or app-shell wrappers that are more than a thin export.

## Core Principle

Expo Router is the route system. Do not treat it like an import swap.

A successful migration does all of the following:

- moves route ownership into file routes
- converts navigation calls to URL/file-path routing
- reads params with `useLocalSearchParams()` or route-aware equivalents
- keeps app shell wrappers thin and direct
- removes route-adjacent barrel patterns that reintroduce legacy navigation
- preserves web/native differences only when the route truly differs

If a migration only replaces `useNavigation()` imports but leaves screen-name navigation, route params, or wrapper indirection behind, the migration is incomplete.

## What To Inspect First

For every package migration, inspect these layers in order:

1. App route wrappers in `apps/gurudevi-mobile/app/`
2. Package exports in `packages/<name>/src/index.ts`
3. Live route-owned screens in `packages/<name>/src/screens/`
4. Platform variants in `.web.tsx` and native equivalents
5. Package-local hooks and helper components that trigger navigation
6. Archived code only as historical reference, not as live migration evidence

Do not start from a single screen file and assume the work is done.

## Migration Checklist

### 1. Map the route graph first

Before changing code, inventory:

- the route wrappers in `app/`
- the package screen exports
- the current route names used by legacy navigation
- any route params passed through `navigation.navigate(...)`
- any routes that exist in code but do not yet exist in the app file tree

### 2. Find every navigation surface

Search for:

- `useNavigation()`
- `useRoute()`
- `navigation.navigate(...)`
- `navigation.replace(...)`
- `navigation.reset(...)`
- `getParent()?.navigate(...)`
- `route.params`
- hardcoded route-name strings

Also search the package barrel files and app wrappers. Route problems often survive there even after the visible screens are updated.

### 3. Convert to route-path navigation

Prefer:

- `useRouter()`
- `router.push(...)`
- `router.replace(...)`
- `router.back()`
- `useLocalSearchParams()`

Use file paths instead of screen names wherever possible. Examples:

- `/auth`
- `/library/map`
- `/library/review`
- `/library/document/[resourceId]`
- `/library/video/[resourceId]`
- `/library/collections/[id]`
- `/self/wisdom/[id]`
- `/attendance`
- `/gradebook`

### 4. Make route params explicit

Expo Router route params should be treated as data passed through the URL/path, not as implicit navigator state.

Rules:

- read route params from `useLocalSearchParams()`
- normalize optional values before passing them into components that expect required strings
- do not assume route params exist just because the old navigator passed them
- do not pass display-only values as if they were required route identity

Important lesson from the migration:

- `resourceId`, `id`, and other identity values belong in the route
- `title`, `creator`, `format`, and other display values may be passed if the destination needs them, but they should be treated as optional and normalized
- if a screen only needs the ID, keep the route focused on the ID and derive the rest in the destination when practical

### 5. Keep app wrappers thin

The app shell route file should usually do one of these:

- export the package screen directly
- provide a very small wrapper around the package screen
- host route-only composition that is not worth putting in the package

Avoid:

- re-exporting a route through a self-importing barrel
- making `app/(tabs)/...` own business logic
- duplicating screen logic in the app layer

### 6. Preserve platform-specific route variants

Use `.web.tsx` and native files when the route behavior truly differs.

Good reasons to split:

- browser history / browser URL behavior
- native viewer vs web viewer
- external link handling differences
- different layout shells for the same route

Bad reasons to split:

- trying to preserve old navigator assumptions
- hiding unconverted route params
- keeping a screen-name navigation pattern alive

## What Still Cannot Be Mapped 1:1

These are not bugs. They are architectural differences between React Navigation and Expo Router.

- `NavigationContainer`-style global callbacks do not map directly to file-based routes
- `onTabChange` state tracking no longer belongs to the navigator shell
- shell-local state that only existed to mirror the active route should usually disappear
- nested navigator imperatives like `getParent()?.navigate(...)` should be rethought as route-path navigation
- custom route-state listeners and tab-index bookkeeping often need to be replaced by layout composition or path-based logic

When a feature seems “missing,” ask whether it is truly a route feature or just old navigator state.

## Route Mapping Rules

### Usually safe to map directly

- auth and onboarding destinations
- tab destinations
- list/detail flows with stable IDs
- modal routes
- back navigation
- share/open external link actions

### Needs careful review

- nested stack routes that were previously registered in a navigator only
- web-only routes that had custom shell behavior
- route params that were mostly display text
- routes that depend on permission-gated access

### Do not guess

If a legacy route name has no obvious file route destination, do not invent one silently.

Instead, decide one of these:

- create the missing route file and wire it deliberately
- map it to an existing route if the product behavior truly matches
- leave it as an explicit migration gap to be handled in a later pass

This was important for:

- `Attendance`
- `Gradebook`
- `WisdomDetail`
- `ResourceHub`

## Package-by-Package Migration Pattern

For each package:

1. Confirm the package owns the live route surface.
2. Convert route-owned screens to Expo Router hooks.
3. Convert all in-package navigation calls to file routes.
4. Add any missing app route wrappers.
5. Keep web/native variants aligned where they share the same route identity.
6. Re-run a live search for `useNavigation`, `useRoute`, `navigation.navigate`, and `route.params`.
7. Typecheck the package on its own.
8. Only then look at the wider app shell noise.

## What We Learned From Profile

- route ownership belongs in the package, not in a circular wrapper
- the app wrapper should be a thin export
- package-level route params should be read directly from Expo Router
- shared typing noise can hide the fact that the live route tree is actually healthy
- the live package should be evaluated separately from archived code

## What We Learned From Community

- a package can still poison the route tree if one re-export keeps a React Navigation dependency alive
- web and native can share route vocabulary while using different presentation code
- the hidden risk is often route-adjacent code, not the obvious screen body
- once one package is clean, it becomes the template for the next package

## What We Learned From Self

- replacing `useNavigation()` alone is not enough
- route-name calls like `navigate('Auth')` can survive in plain sight
- package actions like `Attendance` and `Gradebook` need real route entries if they are used from the package
- if a route does not exist yet, the migration should stop and make that explicit instead of pretending the route is already there
- child feature routes like `WisdomDetail` need their own file route when the package expects them

## What We Learned From Library

- the library home screen is not the only navigation surface
- map, review, collection, document, video, and resource-hub flows all need route ownership
- display-only params should be normalized before they reach a portal component
- `route.params` usage must be replaced with route-aware param reads before the screen is considered migrated
- if a route does not exist in the app tree, it should be created as part of the migration rather than hidden behind a string name

## Verification Standard

A package migration is only complete when all of these are true:

- live route-owned screens no longer depend on `useNavigation()` or `useRoute()`
- legacy screen-name navigation is gone from the live package tree
- app wrappers are thin and direct
- route params are read through Expo Router
- any missing destination routes have been created or explicitly deferred
- package typecheck passes
- live scan confirms the route tree is clean

### Separate package health from app-shell noise

One lesson from the current migrations: a package can be fully cleaned and typecheck successfully while the app-level `tsc` still fails because of broader workspace issues.

Do not confuse those signals.

- package `tsc` tells you whether the live route-owned package is healthy
- app `tsc` tells you whether the whole app shell and wider dependency surface are clean

If the package migration is the task, fix the package first and record any app-shell noise separately instead of letting it block the route migration itself.

### Legacy navigator tree may still be present

Another lesson from the current cleanup: Expo Router route-owned packages can be clean while the legacy `App.tsx` / `src/navigation/*` / older stack-export tree still exists elsewhere in the repo.

That means:

- route-owned package cleanup can be complete even if the monorepo still has old navigator code
- app-level `tsc` failures may come from the still-legacy navigator layer, not from the Expo Router route wrappers
- when that happens, the correct next step is to either quarantine the old navigator tree or migrate it deliberately, not to assume the route-owned package migration is still incomplete

## Anti-Patterns To Avoid

- swapping imports and stopping there
- leaving `navigation.navigate('SomeScreen')` in a package after route conversion
- assuming old params will always be present
- using the app wrapper as a second place to encode business logic
- hiding route gaps behind a barrel export
- treating archived files as live migration evidence
- treating app-level typecheck noise as proof that the package migration failed
- assuming a clean Expo Router package guarantees the legacy navigator tree has also been retired

## Final Rule

If a migration leaves the codebase with fewer legacy imports but the same routing assumptions, it is not a real migration.

The goal is not just to compile. The goal is for the package to own its route behavior cleanly under Expo Router, with no hidden navigator dependence left behind.
