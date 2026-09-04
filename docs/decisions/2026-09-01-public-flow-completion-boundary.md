---
title: "Public Flow Completion and Account Boundary"
status: "accepted"
created: 2026-09-01
decision_owner: "Gurudevi mobile architecture"
tags: [adr, public-flow, onboarding, multi-account, local-first]
---

# Public Flow Completion and Account Boundary

## Decision

Welcome, consent, authentication, guest entry, onboarding, sign-out, and
account removal form one complete public-flow contract. Each action must expose
pending, failure, recovery, and completion feedback; no authentication or
guest action may fail silently.

Public routes remain available before account and local-sync initialization.
When an account becomes active, onboarding progress, cached UI state, and
local-first data are scoped to that account. Switching accounts, signing out,
or deleting an account must not display or reuse the previous account's route
state or local data.

## Consequences

- Public-flow tests cover Welcome → Auth → Back, guest flow, validation,
  onboarding resume/back/complete, sign-out, and account-specific persistence.
- A background refresh error cannot redirect away from an already valid route;
  it is visible and recoverable in place.
- Shared-device support requires an explicit account chooser/switch decision;
  no account is selected implicitly merely because local storage contains one.

## Related records

- [Multi-Account Contract](../../apps/gurudevi-mobile/docs/current_progress/2026-06-26-multi-account-contract.md)
- [Canonical Account State Model](../../apps/gurudevi-mobile/docs/current_progress/2026-06-26-canonical-account-state-model.md)
- [Universal UI modernization delivery record](../../apps/gurudevi-mobile/docs/current_progress/2026-09-01-universal-ui-modernization-delivery.md)
