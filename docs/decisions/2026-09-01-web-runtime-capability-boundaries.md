---
title: "Web Runtime and Capability Boundaries"
status: "accepted"
created: 2026-09-01
decision_owner: "Gurudevi mobile architecture"
tags: [adr, react-native-web, metro, capabilities, powersync]
---

# Web Runtime and Capability Boundaries

## Decision

React Native Web, RNGH, Reanimated, Worklets, and Screens run through their
real approved web runtimes. Metro may enforce a singleton resolution path but
must not replace these core runtimes with no-op shims.

Every platform-dependent feature is owned by a route and classified as
`supported`, `adapter`, or `unavailable`. An adapter must report genuine
success, failure, permission denial, and cancellation. An unavailable feature
shows a truthful state and recovery/alternative where meaningful; it must never
masquerade as a cancelled or successful native operation.

PowerSync remains platform-scoped: native local-first boot is not imported by
the browser. Browser persistence/sync may be adopted only through an explicit,
tested browser adapter and must not block public route rendering.

## Consequences

- Metro aliases are removed one at a time only after their owner route passes
  browser verification.
- No bulk shim cleanup is permitted.
- Capability registry entries include owner route, state, rationale, action
  adapter, failure UX, and test evidence.
- Browser session/persistence behavior remains account-scoped; native secure
  storage semantics are not silently emulated for secrets.

## Related records

- [PowerSync Web / Native Boot Boundary](../../apps/gurudevi-mobile/docs/architecture/2026-06-14-powersync-web-native-boot-boundary.md)
- [Web runtime shim and watcher baseline](../../apps/gurudevi-mobile/docs/infra/2026-09-01-web-runtime-shim-and-watcher-baseline.md)
- [Universal UI modernization delivery record](../../apps/gurudevi-mobile/docs/current_progress/2026-09-01-universal-ui-modernization-delivery.md)
