---
title: "ADR: Gurudevi Sanctuary Functional Migration and Navigation"
status: accepted
date: 2026-09-14
owners: [Naveen, Gurudevi platform]
tags: [gurudevi, web, sanctuary, migration, navigation, information-architecture]
---

# ADR: Gurudevi Sanctuary Functional Migration and Navigation

## Decision

The Next.js Sanctuary will be rebuilt from the **functional product model** of the existing browser-oriented Gurudevi implementation. The migration source is the legacy tab shell, its route behavior, its browser-specific screens, and the domain packages they compose. It is not a mandate to reproduce Expo Router, React Native, PowerSync, native primitives, or the legacy component tree.

`apps/gurudevi-web` owns a new semantic HTML and CSS implementation. It may reuse only platform-neutral contracts, validation, authorization results, API clients after browser transport review, assets, copy, and design tokens.

The authenticated Sanctuary has no product “home” route as a destination to invent. Its durable primary destinations are, in this order:

1. Self
2. Workspace
3. Community
4. Library

The persistent lower-priority account destinations are Profile, Notifications, and Settings. Profile is visually treated as the personal/account island rather than a peer primary work domain. Notifications and Settings remain directly reachable; they are not moved into an advanced or developer menu.

Advanced contains only development, internal, experimental, or deliberately non-product tools. It must not become a hiding place for supported user work. Editorial and Agent Lab may appear there only when their authorization and product status classify them as advanced. Examples such as UI Showcase and Icon Lab are development-only and must be unavailable in production navigation.

## Migration source protocol

For each Sanctuary route, record all of the following before implementation:

- the legacy route and its user-visible purpose;
- its route inputs, role/capacity policy, loading, empty, denied, and failure behavior;
- the browser-specific implementation and domain-package ownership, when one exists;
- reusable platform-neutral contracts and browser-incompatible dependencies;
- the canonical Next URL, supporting state, and acceptance evidence.

The legacy evidence begins with:

- `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx` for the responsive shell;
- `apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts` for navigation intent and route hierarchy;
- `apps/gurudevi-mobile/app/(tabs)/**` for route ownership and dispatch;
- `packages/{library,classroom,self,community,profile}/src/**/*.web.tsx` for browser interaction, state, and content behavior.

The Next app must never import those UI implementations, because they depend on the legacy React Native/Expo graph. “Reuse” means documenting and rebuilding the observable user behavior with browser-native components.

The domain-specific spatial and transition language is governed by
`docs/decisions/2026-09-14-gurudevi-sanctuary-spatial-language-and-domain-transitions.md`.
Domain-local active tasks, restoration, and temporal placement are governed by
`docs/decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md`.

## Navigation experiments

The desktop Sanctuary shell will be evaluated with two controlled variants. On a compact browser, the four primary destinations use a browser-native bottom tab bar; account destinations remain in the global header/account menu. A horizontal primary scroller is an overflow fallback, not the intended primary mobile pattern.

| Variant | Primary navigation | Account and utility controls | Hypothesis |
| --- | --- | --- | --- |
| A: rail island | Self, Workspace, Community, Library at the top of a left rail; Profile, Notifications, Settings in a visually separated lower rail island; Advanced below only in development | Account controls remain in the rail | Preserves the established Sanctuary spatial model and makes work domains continuously visible. |
| B: global-header island | Primary domains remain in a left rail | Profile avatar, Notifications, and Settings live at the right edge of the global header; Advanced remains development-only | Reduces rail density and adopts familiar account access patterns similar to GitHub. |

Both variants must preserve keyboard order, visible focus, labelled controls, 44 px minimum targets, unread notification treatment, and direct settings access. The experiment must not measure authentication completion or real user behavior until the browser authorization boundary is live.

## Adaptive canvas contract

The Sanctuary shell is a persistent **structure and plumbing layer**, not a canvas and not a static page template. It provides the authorization boundary, global context, navigation, safe-area handling, route frame, and bounded content region. It does not own a floor.

Each primary domain owns its own real canvas/floor. Workspace owns a work canvas; Self owns a self canvas; Library owns a reading and discovery canvas; Community owns a community-mode canvas; Profile owns an identity/settings canvas. The domain canvas defines its surfaces, density, ordering, empty/loading/error/denied states, interaction tools, and domain-specific layout. Features and task surfaces are the furniture arranged on that tab-specific floor.

The existing workspace-canvas model is the behavioral source for this boundary. It establishes capability-filtered surfaces, zones, pinned/hidden/order state, and responsive renderers. The Next implementation must express the same concepts through browser-native DOM and CSS; it must not import the React Native canvas components, stores, gesture system, or sync lifecycle.

Responsive composition is capability-based, not a hard-coded device classification:

- CSS container queries and intrinsic grid/flex layout choose the canvas density from the space the canvas actually receives.
- Viewport width is only one signal for shell composition. Browser orientation, height, safe-area insets, reduced-motion preference, pointer precision, hover capability, and keyboard presence are also relevant.
- JavaScript may observe media/container capabilities when an interaction truly requires it. It must not guess “mobile” from user agent or use a device model as the source of truth.
- Portrait compact layouts use a fixed bottom tab bar for Self, Workspace, Community, and Library, with content padded for its safe area. Landscape compact layouts may use a compact rail or top navigation when bottom-space pressure would obscure the canvas.
- The old 920/1280 bands are test reference widths, not permanent product truth. The shell must be reviewed across small/large portrait and landscape canvases, resized desktop windows, and browser zoom.

The canvas requires a stable tab contract:

| Layer | Owns | Does not own |
| --- | --- | --- |
| Sanctuary shell | Structure/plumbing: navigation, global account controls, authorization frame, safe area, route frame, and available bounds | A domain canvas/floor, domain surfaces, domain data, or domain-specific toolbars |
| Domain canvas | Its floor: surface registry, layout modes, card/stream/grid arrangement, per-domain actions and state | Cross-domain navigation or identity authority |
| Surface | One task or information unit, including its local loading/error/empty state | The global frame or other surfaces’ ordering policy |

Canvas personalization is introduced only when its server/browser persistence contract is real. Until then, a domain may offer a responsive read-only canvas, but must not imply that rearrangement, pinning, hiding, or sync has been saved.

## Evaluation

Start with structured usability review, not a production A/B rollout:

1. Compare each variant at 360, 390, 768, and desktop widths.
2. Give representative users the same tasks: open a primary space, check a notification, update a setting, and find their profile.
3. Record task completion, first-click correctness, time-to-destination, navigation confusion, and accessibility issues.
4. Select one variant before building domain slices broadly. If a later production experiment is justified, define its metric, audience, consent, exposure, and rollback plan separately.

## Consequences

- A coherent shell is built once and extended only as accepted slices require.
- The old web implementation becomes a high-value behavior reference instead of a second renderer to keep alive indefinitely.
- No fake dashboard, simulated data state, or generic product home is accepted as migration progress.
- The first implementation task is a route-and-behavior inventory, followed by a real shell prototype containing the actual navigation architecture rather than placeholder workspaces.
