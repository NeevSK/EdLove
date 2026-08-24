---
title: "Modern Runtime Vision"
status: "active"
created: 2026-05-22
updated: 2026-05-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Modern Runtime Vision

## Purpose

This document sets the target operating model for runtime access in `gurudevi-mobile` as we modernize the codebase.

The stack constraint is intentional:

- Expo React Native remains the app foundation.
- Web and mobile are both served through React Navigation 7.
- Expo Router is not part of the architecture.

The goal is not to replace the stack. The goal is to make the stack feel modern, predictable, and elegant.

## Vision

We want a repo where:

- runtime capabilities are explicit, not magically available
- platform differences are isolated in small shims, not spread across app code
- imports are safe at module load time
- app startup is deterministic and easy to reason about
- web and native share the same conceptual architecture while keeping platform-specific behavior in the right place
- navigation remains React Navigation 7-first, with Expo only providing the app shell and runtime substrate

This means moving from a “global service locator + hope the entrypoint runs first” model to a “registered capability boundary + lazy access + platform files” model.

## Current State

The repo is partway through that transition.

What is already healthy:

- platform-specific files exist for several web shims
- the entrypoint is using `registerRootComponent`
- there is an established `bootstrapPlatform()` boundary in `@repo/core/native`
- React Navigation 7 is already the router layer in the app, and React Navigation 8 is being evaluated separately rather than treated as the default runtime.

What is still brittle:

- some utilities still read `coreRuntime` eagerly
- registration and bootstrap logic have historically been duplicated between `index.ts` and `App.tsx`
- some modules assume runtime availability during import or very early render
- web-safe fallbacks exist in some places, but not consistently across the shared utility surface

The main issue is timing. The app mostly works, but the dependency graph still has hidden order constraints.

## Why This Matters

When runtime access is eager:

- a harmless import can become a crash
- web builds can fail because a native-only capability was touched too early
- tests become harder to isolate
- refactors become risky because startup order is part of behavior

This is especially painful in a monorepo where shared utilities are imported from many surfaces.

## Bridge Pattern

The bridge from the current state to the modern state should follow this sequence:

### 1. Entry Boundary

Keep one bootstrap boundary at the app entrypoint.

Responsibilities:

- initialize platform adapters once
- register runtime providers once
- start background or platform services once
- mount the app root only after the bootstrap contract is satisfied

### 2. Shared Utilities Become Lazy

Shared helpers should not assume runtime registration has already happened.

Rules:

- never read `coreRuntime.*` at module top level if the value may not exist yet
- use guarded access inside functions
- fail closed on web or pre-registration states
- cache only after a successful read

### 3. Platform Files Own Platform Behavior

Prefer:

- `*.web.ts`
- `*.native.ts`
- `*.ios.ts`
- `*.android.ts`

This keeps the shared file simple and prevents conditional branching from infecting business logic.

### 4. UI Reads Capabilities Through Stable Interfaces

UI code should consume capabilities through:

- a hook
- a provider
- or a tiny adapter module with clear fallback behavior

The UI should not care whether a capability came from Expo, browser APIs, or a runtime registry.

### 5. Navigation Stays on React Navigation 7

We should keep the navigation model centered on React Navigation 7 for the current runtime.

That means:

- route structure remains explicit
- app bootstrapping remains in our control
- no migration pressure toward Expo Router
- deep linking, guards, and entry gating continue to live in our own code

## Practical Migration Targets

The first targets for cleanup are:

- `apps/gurudevi-mobile/index.ts`
- `apps/gurudevi-mobile/App.tsx`
- shared runtime-touching utilities in `packages/ui/src/utils`
- any module that accesses `coreRuntime` during import

The most important question for each file is:

> Can this code be imported safely before the runtime is registered?

If the answer is no, it should be refactored.

## Success Criteria

We will know the bridge is working when:

- the app starts without relying on accidental import order
- web and mobile entrypoints can be loaded safely
- `coreRuntime` access is lazy and guarded
- platform shims are the default, not the exception
- React Navigation 7 remains the sole navigation layer for the current app runtime
- bootstrap logic is small enough that a new contributor can explain it in one minute

## Next Step

The next doc should be a concrete migration bridge:

- current file-by-file runtime touch points
- what becomes a shim
- what becomes a provider
- what stays in shared code
- what should be deleted

