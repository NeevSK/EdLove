---
title: "Icon Layer Fishbone Cleanup Plan"
status: "active"
created: 2026-07-16
updated: 2026-07-16
author: "Naween"
scribe: "Codex"
tags: [mobile, icons, metro, monorepo, lucide, build-verification]
---

# Icon Layer Fishbone Cleanup Plan

## Why this exists

We hit a Metro bundle failure while building `gurudevi-mobile`, and the failure exposed a broader icon-layer pattern rather than a single bad import.

The immediate error was:

- `lucide-react-native/dist/esm/icons/more-horizontal` could not be resolved from `packages/ui/src/components/GlobalHeader.tsx`

That is only the first branch of the problem. The same class of failure can repeat elsewhere because the workspace currently mixes:

- direct Lucide imports in shared UI components,
- a shared Lucide icon bridge in `@repo/ui/icons`,
- and a Babel transform in the mobile app that rewrites Lucide member imports to deep ESM paths.

## Fishbone summary

```text
                         Metro bundle failure
                                 |
    --------------------------------------------------------------------
    |                 |                  |                  |           |
 Source usage       Bridge layer      Transform layer    Monorepo path  Package drift
    |                 |                  |                  |           |
 direct Lucide      @repo/ui/icons    Babel rewrites     pnpm symlinks   Expo SDK / Doctor
 imports in         exists but some   imports to         and Metro        warnings are
 shared components  code still bypass  deep Lucide paths  resolution       background noise
                    it in places
```

## What we found

1. `@repo/ui/icons` already centralizes native icon exports.
2. `GlobalHeader.tsx` was still importing Lucide directly instead of using the bridge.
3. `apps/gurudevi-mobile/babel.config.js` rewrites Lucide member imports to deep `lucide-react-native/dist/esm/icons/...` paths.
4. `expo export:embed --platform android` completed after the header was moved back onto the bridge, which means the first hard blocker was real and fixable.
5. Metro still prints many Lucide subpath warnings, so more hidden breakpoints may still exist in the icon layer even though the bundle now succeeds.

## Decision options

### Option A: Centralize shared UI icons through `@repo/ui/icons`

This is the safest long-term option for shared packages like `@repo/ui`, `@repo/classroom`, `@repo/profile`, and `@repo/self`.

Pros:

- one compatibility layer to maintain,
- easier to swap icon package internals later,
- fewer deep Lucide paths leaking through the monorepo.

Cons:

- requires updating imports across many shared components,
- the icon bridge must stay complete and current.

### Option B: Keep direct Lucide imports only in app-local files

This keeps local screens flexible while shared packages stay standardized.

Pros:

- shared UI remains consistent,
- app-local experiments stay easy,
- less risk of duplicated bridge logic.

Cons:

- developers need to remember the boundary,
- shared code can still drift back into direct Lucide imports unless we guard it.

### Option C: Add a lint rule to block new direct Lucide imports in shared packages

This is the best enforcement layer if we want the bridge to stay authoritative.

Pros:

- prevents the same failure from creeping back in later,
- gives fast feedback before Metro bundling,
- makes the codebase intention explicit.

Cons:

- needs a careful allowlist for app-local files and any intentional exceptions,
- can be noisy if we do not plan the migration order.

## Recommended cleanup plan

1. Keep `@repo/ui/icons` as the canonical icon surface for shared packages.
2. Allow direct Lucide imports only in app-local code when there is a clear reason.
3. Add a lint guard for shared packages so new direct Lucide imports are blocked.
4. If needed, refactor the remaining shared components that still import Lucide directly.
5. Re-run the Android production bundle after each icon-layer migration batch.

## Current state

- `packages/ui/src/components/GlobalHeader.tsx` now imports from `@repo/ui/icons`.
- The Android production bundle now completes successfully.
- Metro warnings still exist, so we should treat the icon layer as improved but not yet fully cleaned up.

## Follow-up checks

- Scan for remaining direct Lucide imports in shared packages.
- Decide whether `packages/ui/src/icons.native.ts` should stay as the long-term bridge or be moved/renamed to make the boundary clearer.
- Add a lint rule or CI check once the migration scope is agreed.
