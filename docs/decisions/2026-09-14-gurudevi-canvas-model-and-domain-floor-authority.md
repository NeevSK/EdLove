---
title: "Gurudevi Canvas Model and Domain-Floor Authority"
status: "accepted"
created: 2026-09-14
owners: [Naveen, Gurudevi platform]
tags: [adr, gurudevi, canvas, domains, web, mobile, architecture]
supersedes:
  - "2026-09-14-gurudevi-browser-unified-canvas-foundation.md"
  - "apps/gurudevi-mobile/docs/2026-08-25-unified-canvas-system.md"
  - "apps/gurudevi-mobile/docs/2026-08-25-unified-canvas-next.md"
---

# Gurudevi Canvas Model and Domain-Floor Authority

## Authoritative decision

Gurudevi has one reusable **canvas model**, not one visually identical canvas
for every tab.

The existing canonical model is the pure surface/layout engine in
`packages/core/src/types/Workspace.ts` and
`packages/core/src/logic/workspace/canvas.ts`. It owns reusable arrangement
semantics only: surface definition, layout, default/normalization/reset,
ordered visibility, pin state, group/zone assignment, and resolved surfaces.

The Sanctuary shell owns structure and plumbing only: session boundary,
navigation, global header/account controls, safe areas, route frame, focus, and
available bounds. It does not own a domain floor.

Each domain owns its floor/renderer and furniture:

| Domain | Floor model | Configurable furniture boundary |
| --- | --- | --- |
| Workspace/Classroom | Zone-oriented operational workspace | Surface order, hide, pin, permitted zone movement |
| Self | Sanctuary navigator: feature discovery and reflection | Presentation mode, allowed feature order/hide/pin; not generic dashboard zones |
| Library | Reading/discovery shelves and reader pathways | Stable shelves only; hero, pulse, search, and reader stay domain-fixed |
| Community | Mutually exclusive mode hub | Mode order/hide and per-mode state; not multi-zone draggable cards |
| Profile | Identity and settings groups | Group/row order and frequent settings; not generic surface tiles |

Features are furniture on those floors. Account, Explore, and future
guest-cloud sessions swap data/capability/persistence adapters below the same
domain floor and feature command contract. They never fork the shell, floor,
or feature UI.

## Retained

- `WorkspaceSurfaceDefinition`, `WorkspaceLayout`, and
  `ResolvedWorkspaceSurface` remain canonical shared model.
- Default, normalization, resolved placement, grouping, pin-cap, visibility,
  and reset semantics remain the source of truth.
- Existing Self and Classroom adapters are behavioral evidence.
- Library, Community, and Profile registries are furniture inventory, not proof
  that those domains have complete rendered canvases.

## Rejected

- A new generic `CanvasFrame`/universal browser canvas that duplicates the
  existing core model.
- Treating `ResponsiveWorkspaceCanvas` as a neutral all-domain floor. Its hero,
  workspace metrics, dotted ground, fixed zones, zone columns, cards, and drag
  mechanics are Workspace renderer choices.
- Treating all five domains as configurable dashboards.
- Calling a surface registry a completed rendered domain canvas.
- Explore-specific feature components, shells, or domain canvases.
- `as any`, fake `ReactNode` content, or placeholder casts that conceal a
  mismatch between a domain and the shared model.

## Implementation law

1. Audit real domain route and package behavior before changing a canvas.
2. Use the core model when a domain needs configurable furniture; never force
   generic zones where the domain semantics differ.
3. Build a browser-native renderer per domain dialect, sharing only the core
   model and primitives justified by repeated use.
4. Build real account-backed product behavior first.
5. Apply Explore/local and future guest-cloud adapters to the same commands and
   components only after the real domain behavior exists.

## Current truth and repair

The current shared renderer mixes generic chrome, responsive policy, Workspace
visual language, drag mechanics, and furniture cards. It is appropriate for
operational Workspace/Classroom use but not a universal visual renderer. Self
partially adapts it; Library, Community, and Profile keep mostly bespoke
composition despite registries.

The browser migration therefore ports the core model, then each domain's actual
composition and behavior, then its persistence adapter. A canvas is not
accepted merely because it displays registry surfaces: it must deliver the real
domain task and correct loading, empty, denied, and failure states.
