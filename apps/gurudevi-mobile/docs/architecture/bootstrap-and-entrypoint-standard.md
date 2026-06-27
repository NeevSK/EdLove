---
title: "Bootstrap and Entrypoint Standard"
status: "active"
created: 2026-05-22
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [bootstrap, entrypoint, expo-router, routing, architecture]
---

# Bootstrap and Entrypoint Standard

## Scope

This is the repo-wide standard for app startup, bootstrap, and entrypoint design across the monorepo.

It applies to:

- `apps/*`
- shared packages that are imported by apps during startup
- web and mobile surfaces alike

The repo contains multiple apps, so this standard is intentionally hierarchical:

- each app owns its own entrypoint
- shared runtime rules are consistent across the repo
- the app layer decides how to wire navigation and root providers
- packages must remain safe to import before the app finishes bootstrapping

## Stack Constraint

The standard assumes:

- Expo React Native as the app substrate
- Expo Router as the navigation layer for `gurudevi-mobile`
- app-owned route groups and layout files

That means the app shell is Expo, but routing and screen orchestration remain explicit and app-owned.

## Design Goals

The startup model should be:

- deterministic
- easy to trace
- safe to import
- platform-aware without being platform-sprawled
- compatible with web, native, and test environments

The codebase should not depend on accidental import order or hidden global mutation.

## Definitions

### Entrypoint

The first file loaded for a given app runtime. It may:

- register the app root
- initialize platform bootstrap
- load polyfills or shims
- start platform services

It should not contain application logic, screen trees, or feature wiring beyond startup concerns.

### Bootstrap

A one-time initialization step that prepares the platform environment before the app renders.

Bootstrap may:

- register runtime adapters
- initialize persistence or storage backends
- configure telemetry
- wire background services
- prepare native-only capabilities

Bootstrap should not:

- render UI
- define navigation trees
- hide app behavior in module side effects

### Runtime Boundary

The point at which shared code is allowed to assume platform capabilities are available.

Before the runtime boundary:

- imports must be safe
- helpers must fail closed
- web shims must not require native services

After the runtime boundary:

- application code may consume runtime capabilities through safe adapters

## Repo-Level Rules

### 1. One Entrypoint Per App

Each app must have a single, obvious entrypoint.

Examples:

- `apps/gurudevi-mobile/index.ts`
- `apps/another-app/index.ts`

The entrypoint may branch by platform if necessary, but it must remain the sole top-level startup file for that app.

### 2. One Bootstrap Boundary Per App

Each app must have one bootstrap function or bootstrap sequence that owns startup responsibilities.

For `gurudevi-mobile`, that boundary is currently `bootstrapPlatform()` plus app-specific startup wiring.

Avoid:

- registering runtime providers in multiple places
- duplicating bootstrap in `App.tsx`
- adding “just one more” initialization call in a feature module

### 3. `App.tsx` Is Not the Bootstrap Owner

`App.tsx` should own:

- the React tree
- providers
- navigation
- app-level effects that happen after mount

`App.tsx` should not own:

- runtime registration
- polyfill setup
- platform initialization that must happen before the tree can safely render

If startup work must happen before import-time consumers are safe, it belongs in the app entrypoint, not in `App.tsx`.

### 4. Shared Packages Must Be Import-Safe

Packages imported by the app during startup must not assume the runtime is already registered.

This means:

- no eager `coreRuntime.*` reads at module top level
- no side-effectful registration hidden in utility modules
- no web import path that reaches native-only APIs during evaluation

If a package cannot be imported safely before bootstrap, it needs a shim, a provider, or a lazy wrapper.

### 5. Platform Behavior Belongs in Platform Files

Prefer platform-specific files over runtime branching in shared code.

Examples:

- `Thing.web.ts`
- `Thing.native.ts`
- `Thing.ios.ts`
- `Thing.android.ts`

Use the shared file only for the platform-agnostic contract.

### 6. Navigation Is App-Owned

Expo Router is the navigation system for `gurudevi-mobile`.

The app entry and bootstrap standard must respect that:

- route groups and layout files stay in the app
- linking config stays in the app
- route guards stay in the app
- shell chrome should live in Expo Router layouts

### 7. App Startup Must Be Deterministic

Startup should happen in a predictable sequence:

1. entrypoint loads
2. platform bootstrap runs
3. runtime providers register
4. app root mounts
5. app effects and navigation initialize

If a step depends on a previous one, that dependency should be visible in code.

## Recommended Startup Shape

### Mobile App

For an Expo React Native app:

- `index.ts` is the true startup entry
- `index.ts` loads required shims and polyfills
- `index.ts` calls bootstrap
- `index.ts` registers the root component
- `App.tsx` renders providers, navigation, and app logic

### Web App

For the web build of the same app:

- use the same app tree when possible
- keep web-only shims in platform files
- avoid importing native-only modules in web entry evaluation
- let Expo Router handle web routing and linking

### Additional Apps

If another app exists in the monorepo, it should follow the same shape while still owning its own platform-specific needs.

The rule is consistency of startup model, not identical file names.

## Related Boundary Docs

- [Auth and Onboarding Highway Boundaries](./AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md)
- [PowerSync Web / Native Boot Boundary](./2026-06-14-powersync-web-native-boot-boundary.md)
- [Web-Native Compatibility Guide](../Core/web-native-compatibility-guide.md)

## What Belongs Where

### Entrypoint

Good fits:

- `bootstrapPlatform()`
- runtime registration
- root mounting
- platform shims that must exist before React renders

Not good fits:

- feature components
- domain logic
- screen trees
- render-time helpers

### App Root

Good fits:

- providers
- `NavigationContainer`
- app-level effects
- route gating
- analytics after mount

Not good fits:

- duplicate runtime registration
- platform setup that other imports depend on

### Shared Package

Good fits:

- pure helpers
- platform-agnostic utilities
- lazy adapters
- explicit web/native surface files

Not good fits:

- side effects at import time
- direct assumptions that bootstrap already ran

## Guardrails

The repo should treat these as red flags:

- multiple runtime registration calls
- `coreRuntime` access in module scope
- web files that import native-only modules directly
- startup code hidden in feature modules
- route initialization spread across more than one place

## Monorepo Pattern

Because this is a monorepo, the standard should be applied at two levels:

### App Level

Each app owns:

- entrypoint
- bootstrap sequence
- navigation container
- app-specific shims

### Shared Level

Shared packages must:

- remain import-safe
- expose explicit platform variants
- avoid hidden startup side effects
- prefer adapters over direct global reads

This lets multiple apps share the same runtime philosophy without forcing them into the same entry structure.

## Acceptance Criteria

A startup implementation is compliant when:

- the app has one clear entrypoint
- bootstrap occurs before root mount
- `App.tsx` does not duplicate registration
- shared utilities can be imported before runtime registration
- platform-specific behavior lives in platform files
- Expo Router remains the router layer
- React Navigation is only used where Expo Router internally depends on it or for isolated compatibility code

## Migration Order

When updating an app:

1. identify the true entrypoint
2. ensure bootstrap happens there only once
3. remove duplicate startup logic from `App.tsx`
4. make shared utilities lazy or shimmed
5. move platform behavior into platform files
6. verify web and native entrypoints separately

## Practical Rule

If a file must know that bootstrap has already run, it should not be imported by code that runs before bootstrap.

If a file must be safe at import time, it should not read runtime state eagerly.

