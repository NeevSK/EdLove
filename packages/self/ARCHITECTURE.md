# Self Architecture Recovery

## Purpose
`@repo/self` owns the personal sanctuary experience: self screens, self feature composition, self-specific hooks, and self-facing domain services.

This document defines the production-grade boundary we are restoring.

## Ownership
- `@repo/self`
  - self screens and role-specific self views
  - self feature UI and package-local platform overrides
  - self domain hooks
  - self-owned repositories and APIs for wellbeing, journaling, rhythm, and growth
- `@repo/core`
  - auth, identity, permissions, POA enforcement, temporal utilities
  - shared infrastructure clients such as Supabase
  - cross-domain shared hooks and services
- `apps/gurudevi-mobile`
  - route adapters
  - stack registration
  - app-shell presentation and navigation wiring only

## Boundary Rules
1. Components and screens in `@repo/self` must not call Supabase directly.
2. Hooks in `@repo/self` should orchestrate state, cache, and view behavior, but DB access belongs in `src/api` repositories.
3. POA-protected self mutations must flow through `selfAPI` and `selfContract`.
4. `@repo/self` must only consume public exports from `@repo/core`, never `packages/core/src/*`.
5. App adapters in `apps/gurudevi-mobile` stay thin re-exports unless the app shell has a true routing concern.

## Recovery Phases
1. Restore package and app-shell boundaries.
2. Move direct self data access behind package-owned repositories.
3. Route self mutations through POA-covered APIs.
4. Reduce cross-domain UI leakage from self screens.
5. Add checks so new leaks are caught early.

## Current Focus
- restore missing self route adapters
- remove deep imports into `core/src`
- migrate mood and fire journal off direct UI-layer Supabase access
- tighten POA coverage for `selfAPI`
