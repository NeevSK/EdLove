---
title: "Universal UI Route-Shell Contract"
status: "accepted"
created: 2026-09-01
decision_owner: "Gurudevi mobile architecture"
tags: [adr, universal-ui, expo-router, web, native, accessibility]
---

# Universal UI Route-Shell Contract

## Decision

Every application route has one explicit vertical scroll owner and an explicit
layer policy. The document is clipped; a gateway shell, standard screen shell,
or specialized list/canvas owns vertical scrolling. Overlay surfaces capture
pointer and focus only while open. Decorative layers and closed portals are
non-interactive.

Navigation policy (title, active matching, visibility, permission decision,
and destination) is platform-neutral metadata. Native and web preserve their
own visual renderers but must not reimplement that policy independently.

## Consequences

- A new screen must declare its scroll owner and overlay behavior before UI
  implementation is accepted.
- Nested vertical scroll surfaces require a documented specialized reason.
- A visual overlay that blocks pointer input is a regression, including when
  transparent or visually absent.
- Browser validation includes keyboard focus, pointer activation, scroll to
  content end, and modal isolation; render-only tests are insufficient.

## Rationale

The previous web failure where visible controls could not be clicked was caused
by an input-capturing portal layer, not a screen-local control defect. Route
shell ownership therefore needs a system contract rather than convention.

## Related records

- [Universal UI modernization delivery record](../../apps/gurudevi-mobile/docs/current_progress/2026-09-01-universal-ui-modernization-delivery.md)
- [Interaction delight audit](../../apps/gurudevi-mobile/docs/current_progress/2026-08-31-interaction-delight-audit-and-plan.md)
