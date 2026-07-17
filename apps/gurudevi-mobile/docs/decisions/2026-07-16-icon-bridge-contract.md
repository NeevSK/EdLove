---
title: "Icon Bridge Contract"
status: "active"
created: 2026-07-16
updated: 2026-07-16
author: "Naween"
scribe: "Codex"
tags: [decision, icons, lucide, metro, monorepo, mobile]
---

# Icon Bridge Contract

## Context

The mobile app failed a production bundle check because shared UI code imported icons directly from `lucide-react-native`, bypassing the existing bridge in `@repo/ui/icons`.

The repo already uses an icon bridge for two reasons:

1. it centralizes package swapping and icon-name normalization,
2. it allows bundle optimizations to live in one place instead of leaking through the monorepo.

The bundle failure showed that the bridge had drifted from being the public contract and had become only one of several icon paths.

## Decision

`@repo/ui/icons` is the only public icon import surface for the repository.

Direct imports from `lucide-react-native` are not allowed in application or shared-package source files.

Deep Lucide ESM imports are only allowed inside the bridge implementation itself.

## Why

- If the icon package changes later, we want one update point.
- If Lucide naming or export shape changes again, the bridge can absorb it.
- If Metro or the monorepo resolver behaves differently on a future Expo or pnpm upgrade, the failure surface stays small.
- If bundle-size work is needed, the optimization can remain inside the bridge without leaking implementation details into feature code.

## Consequences

- Shared packages become simpler to reason about.
- New icons must be added to the bridge before they can be used elsewhere.
- The codebase gains a single enforcement point for icon usage.
- A repo-level validation check is useful so the contract cannot drift silently again.

## Implementation status

- `packages/ui/src/components/GlobalHeader.tsx` and related shared components now use `@repo/ui/icons`.
- The Android production bundle now completes successfully after the bridge fix.
- A repository validation check should be kept in place to prevent future direct Lucide imports from reappearing.

## Related docs

- [Icon Layer Fishbone Cleanup Plan](../current_progress/2026-07-16-icon-layer-fishbone-cleanup-plan.md)
- [Mobile Bundle Size Optimization Execution Report](../infra/2026-06-11-mobile-bundle-optimization-report.md)
