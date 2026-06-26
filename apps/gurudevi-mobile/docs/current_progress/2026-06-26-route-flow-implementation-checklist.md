---
title: "Route Flow Implementation Checklist"
status: "draft"
created: 2026-06-26
updated: 2026-06-26
author: "Naween"
scribe: "Antigravity"
tags: [checklist, implementation, routing, auth, onboarding]
---

# Route Flow Implementation Checklist

This checklist turns the route-flow proposal into an execution plan.

## Objective

Make welcome, auth, onboarding, guest entry, and app entry behave as one stable isomorphic flow across mobile and web.

## Checklist

### A. Routing authority

- [ ] Keep `app/_layout.tsx` as the primary route-family authority.
- [ ] Remove or neutralize duplicate route decisions in `app/index.tsx`.
- [ ] Ensure root navigation decisions use the same shared identity rules on both platforms.
- [ ] Avoid adding new redirect logic to leaf screens unless they own a local forward navigation action.

### B. Identity contract

- [ ] Use `identity_state` for anonymous / onboarded / verified state.
- [ ] Use `is_anonymous` as the canonical guest marker where the Supabase session exposes it.
- [ ] Do not infer guest state from email presence or absence.
- [ ] Keep `citizenship` distinct from capacity / role.
- [ ] Keep capacity selection inside onboarding, not welcome or auth.

### C. Welcome flow

- [ ] Treat welcome as the public face for first-time users and returning signed-out users.
- [ ] Show toast guidance on guest-entry failure.
- [ ] Guard guest entry so repeated taps do not create duplicate anonymous sessions.
- [ ] Reuse existing anonymous session state when possible.

### D. Auth flow

- [ ] Route login success to app only when onboarding is already complete.
- [ ] Route login success to onboarding when onboarding is incomplete.
- [ ] Route sign-up success to onboarding when onboarding is incomplete.
- [ ] Keep auth screen free of capacity selection logic.

### E. Onboarding flow

- [ ] Keep mandatory steps non-skippable.
- [ ] Keep optional steps skippable without blocking app entry.
- [ ] Keep developer sandbox entry inside onboarding only.
- [ ] Preserve the ability to complete onboarding after mandatory steps even if optional steps are skipped.

### F. Server-side integrity

- [ ] Keep onboarding writes behind the server contract.
- [ ] Make onboarding completion idempotent or retry-safe.
- [ ] Keep POA / Cedar / RLS layered rather than merged.
- [ ] Preserve server-side truth even if the client state is stale.

### G. Documentation hygiene

- [ ] Keep analysis docs in `current_progress/`.
- [ ] Keep durable reference docs in `architecture/`.
- [ ] Add validation date and confidence notes to analysis docs.
- [ ] Mark older docs as potentially outdated when they reflect legacy behavior.
- [ ] Link the flow docs from `INDEX.md`.

### H. Future-proofing practices

- [ ] Prefer finite-state flow objects over nested booleans.
- [ ] Prefer one redirect owner per route family.
- [ ] Prefer typed route decisions over ad hoc string branching.
- [ ] Keep retry behavior explicit at the UI boundary.
- [ ] Avoid using route files as business logic containers.

## Execution Order

1. Remove duplicate routing behavior.
2. Add or refine shared route decisions if needed.
3. Harden welcome guest entry for retry safety.
4. Clean up onboarding completion semantics.
5. Verify web/mobile parity.
6. Update docs if implementation reveals a new canonical rule.

