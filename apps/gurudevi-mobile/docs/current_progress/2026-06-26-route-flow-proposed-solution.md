---
title: "Route Flow Proposed Solution"
status: "draft"
created: 2026-06-26
updated: 2026-06-26
author: "Naween"
scribe: "Antigravity"
tags: [solution, routing, auth, onboarding, identity, cedar, poa, rls]
---

# Route Flow Proposed Solution

This document proposes a durable cleanup plan for the public-entry and onboarding flow in `gurudevi-mobile`.

The goal is not to rewrite the whole platform.
The goal is to make the user journey easy to reason about again.

## Design Goals

- One canonical route-family decision point.
- One canonical identity contract.
- One onboarding state machine.
- One guest-entry idempotency rule.
- Same business rules on web and mobile.
- Keep POA, Cedar, and RLS layered and distinct.

## Proposed Target Shape

### 1. Route ownership

The Expo Router root shell should be the only place that decides:

- public
- onboarding
- app

Recommended pattern:

- `app/_layout.tsx` owns global gating
- `app/index.tsx` becomes a thin bootstrap route or redirect-only shim
- leaf routes only perform their local screen action

### 2. Identity contract

Use these meanings consistently:

- `identity_state` = anonymous / onboarded / verified
- `citizenship` = participation depth
- `capacity` = role or domain lens selected during onboarding
- `guest` = citizenship state, not role

### 3. Onboarding contract

Onboarding should be a real state machine with explicit step groups:

- arrival / name collection
- capacity selection
- mandatory steps
- skippable steps
- completion

Rules:

- capacity is chosen during onboarding, not before
- first three steps are mandatory
- later steps are skippable
- skipping optional steps still lands the user in the app

### 4. Auth contract

Auth should support:

- sign up
- login
- guest handoff

Rules:

- sign up routes to onboarding if onboarding is incomplete
- login routes to app if onboarding is complete
- login routes to onboarding if onboarding is incomplete
- auth should not guess capacity

### 5. Guest contract

Guest entry should:

- use Supabase anonymous auth
- not require email
- show toast guidance on failure
- ignore repeated taps while request is in flight
- reuse an existing guest session if one already exists

This is where the idempotency utility should be used.

### 6. Dev / sandbox contract

The developer fast-path belongs inside onboarding, not beside it.

Rules:

- keep it opt-in and explicit
- allow it only where the app already owns identity setup
- do not let it weaken production onboarding requirements

### 7. Permission stack contract

Keep the layers separate:

- route gate chooses the entry family
- UI permission helpers decide what to show
- POA / Cedar decides structural permission
- RLS decides final row access

Do not collapse them into one accidental concept.

## Implementation Order

### Phase 1

- Remove duplicate route decisions.
- Make root layout the only authority for entry family selection.

### Phase 2

- Align identity contract terms across auth, onboarding, and docs.
- Remove any email-based guest inference.

### Phase 3

- Harden guest entry with in-flight protection and session reuse.
- Apply idempotency to retryable welcome/onboarding actions.

### Phase 4

- Simplify onboarding into a single explicit state machine.
- Keep the dev fast-path isolated as a documented branch of that state machine.

### Phase 5

- Trim permission confusion:
  - route gating stays at the shell
  - capability checks stay in permission helpers
  - data access stays behind POA/Cedar/RLS

### Phase 6

- Mark old archive-era guidance as historical where it conflicts with the current contract.
- Keep canonical docs easy to find from the index.

## Modern 2026 Practices Worth Keeping

- Prefer one source of truth per decision type.
- Use route helpers only for routing, not business policy.
- Treat guest actions as retryable side effects and guard them accordingly.
- Keep public flow docs explicit about mobile/web parity.
- Record confidence and validation date in analysis docs.
- Use narrow imports for auth/onboarding to avoid startup side effects.
- Keep server-side handlers idempotent where user retries are expected.
- Prefer explicit finite-state flow objects over nested boolean checks.
- Prefer typed route decisions over stringly-typed ad hoc branching.
- Prefer “one redirect owner, many passive screens” for Expo Router shells.
- Keep debug/dev shortcuts inside the same domain state machine they affect.
- Make retry behavior explicit at the UI boundary rather than relying on lucky side effects.
- When a screen has a public-side effect, design it as if the user will tap twice on a slow network.

## Risks If We Do Nothing

- users get stuck between welcome and onboarding
- login success still lands in the wrong place
- guest sessions multiply on repeated taps
- onboarding can appear complete in one layer but incomplete in another
- future agents keep re-solving the same problem from scratch

## Validation Date

This proposal was written against the codebase and docs as of 2026-06-26.
