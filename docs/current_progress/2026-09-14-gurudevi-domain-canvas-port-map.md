---
title: "Gurudevi Domain Canvas Port Map"
status: "active"
created: 2026-09-14
owners: [Gurudevi platform]
tags: [gurudevi, web, migration, canvas, domain-floor]
---

# Gurudevi Domain Canvas Port Map

This is the factual implementation map for the browser migration. It is a
source map, not a proposal to reuse the mobile UI wholesale.

## Shared truth

`packages/core/src/logic/workspace/canvas.ts` and
`packages/core/src/types/workspace.ts` contain the reusable layout model:
normalization, resolution, ordering, visibility, pinning, and persistence
shape. The existing `ResponsiveWorkspaceCanvas` is a Workspace-specific visual
renderer, not a universal Sanctuary floor.

The browser seam resolves the shared model and requires each domain to declare
its own semantic groups. Domain floors render their own furniture.

## Domain map

| Domain | Real floor | Fixed structure | Configurable concern | Browser first slice |
| --- | --- | --- | --- | --- |
| Self | Overview, pinned work, filters, catalog, opened feature | role/access framing, overview, feature identity | selected/order/hidden/pinned/view mode | Overview plus one reflection feature; one preference authority |
| Workspace/Classroom | role-resolved operational zone deck | capacity, classroom context, real school actions | layout/order/visibility within the workspace model | account-backed classroom resolver and a truthful role surface |
| Library | discovery/reading floor | search, filters, shelves, collections, reader modes | shelf visibility/order and view preference | browse/search/filter, then resource and reader modes |
| Community | mode hub | Feed, Circles, Messages, Announcements and trust gates | limited quick paths/contextual blocks | read/sample feed and local draft only after server policy is explicit |
| Profile | identity/settings groups | identity, privacy/security, account actions | safe section presentation only | verified identity and typed edit contract |

## Evidence and constraints

- Self has overlapping `SelfCanvas`, `SelfNavigator`, and `SanctuaryOverviewHub`
  systems. The overview is the richer entry behavior; the browser port must not
  create a third preference/pinning authority.
- Workspace's five zones are valid Workspace vocabulary only. Do not translate
  Self, Library, Community, or Profile into them.
- Library's existing web browse screen is the behavioral authority; its surface
  registry is partial metadata, not a renderer.
- Community's mode hub is its floor. Its two duplicate surface registries must
  be consolidated before configurable layout is added.
- Profile's destructive/account controls remain structurally protected and are
  never arbitrary movable cards.
- Existing registries containing `content: undefined as unknown as ReactNode`
  are metadata leaks, not browser render contracts.

## Chosen next implementation order

1. Keep the browser domain-canvas seam small and model-only.
2. Replace the provisional Explore-only Self reflection component with a
   domain-owned Self overview and a typed account adapter.
3. Make that same Self floor accept an Explore-local adapter after the account
   path has truthful loading, failure, and save behavior.
4. Continue the remaining domain floors in the experience order in the active
   implementation plan.

No visual `CanvasFrame` is a product architecture. The Sanctuary shell owns
structure and plumbing; each domain owns its floor.
