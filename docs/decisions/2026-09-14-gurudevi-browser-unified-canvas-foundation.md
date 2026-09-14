---
title: "Gurudevi Browser Unified Canvas Foundation"
status: "superseded"
created: 2026-09-14
owners: [Naveen, Gurudevi platform]
tags: [adr, gurudevi, web, canvas, migration, dry]
---

# Gurudevi Browser Unified Canvas Foundation (Superseded)

> Superseded by `2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md`.
> This record incorrectly proposed a new generic browser CanvasFrame instead
> of treating the existing core canvas model as canonical and domain floors as
> distinct renderers.

## Decision

The real Gurudevi product is built first. Explore, guest-cloud, and durable
account are session and persistence adapters underneath that product; they are
not separate route trees, shells, feature implementations, or demo screens.

Every primary domain uses one shared **browser-native CanvasFrame** foundation.
It is rebuilt in `apps/gurudevi-web` from the platform-neutral canvas model,
not imported from the current React Native `@repo/ui` canvas renderer. The
shared frame resolves available bounds, named zones, surface ordering, semantic
groups, loading/empty/error boundaries, keyboard movement, and responsive
composition. Each domain supplies its own canvas definition and furniture:

| Shared CanvasFrame owns | Each domain canvas owns |
| --- | --- |
| available bounds, zones, ordered/visible surfaces, semantic group structure, responsive layout modes, keyboard/focus conventions, generic state boundaries | surface registry, content/data contract, domain actions, density, visual atmosphere, and which furniture is configurable |

The Sanctuary shell remains structure and plumbing above the canvas: session
boundary, header/account controls, navigation, safe areas, route frame, and
available bounds. It never becomes a generic dashboard floor.

## Source and reuse boundary

The functional source must be read before browser implementation:

- `packages/core/src/logic/workspace/canvas.ts` and
  `packages/core/src/types/workspace.ts` provide the platform-neutral surface,
  zone, layout, normalization, visibility, pin, and ordering concepts.
- `packages/ui/src/components/workspace/ResponsiveWorkspaceCanvas.tsx` and its
  renderers show current product behavior but are React Native/RNW code and are
  prohibited imports for Next.
- `packages/{self,classroom,library,community,profile}` provide each domain's
  actual surfaces, hooks, browser variants, states, and task behavior.
- `apps/gurudevi-mobile/app/(tabs)` plus `appNavigation` provide shell and
  route-intent evidence.

The browser may reuse pure core contracts after import review. It must rebuild
the renderer as semantic DOM and CSS container/orientation-aware composition.
`@repo/ui` is not the browser component source; its current canvas is a
behavioral reference, not an import target.

## Required implementation order

1. Perform domain-by-domain functional archaeology and publish a migration
   manifest: legacy route, canvas surfaces/zones, task actions, real data
   contract, loading/empty/denied/failure states, and browser gaps.
2. Build the shared Next `CanvasFrame` and resolve pure layout contracts before
   building an Explore route or a domain-specific feature screen.
3. Build real account-backed domain slices on the shared frame, beginning with
   the smallest real browser-safe loop. Reuse legacy `.web.tsx` behavior, not
   its renderer.
4. Add Explore as an adapter to the same domain canvas and commands, with local
   baseline data and local persistence. No Explore-specific feature tree.
5. Add guest-cloud only after its own policy and browser contract are accepted.

## DRY acceptance rule

For a feature to exist in more than one session, there must be exactly one
domain canvas/component and one command/data contract. A session chooses an
adapter; it may alter capability and truthful disclosure, but cannot fork the
feature UI. Separate delivery route files may exist only to obtain the session
and render the same shared composition.

## Consequences

- No more route-first preview/sandbox implementation.
- Existing Explore-specific scaffold work is provisional and must be folded
  into the shared CanvasFrame/domain composition before acceptance.
- Persistence is introduced after real feature contracts, not used to invent
  feature behavior.
