---
title: "Feature Gate Order and Context Ownership"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [authorization, entitlements, growthbook, feature-lifecycle, offline]
---

# Feature Gate Order and Context Ownership

## Context

Gurudevi has four distinct decisions that were previously easy to conflate:

- capability inventory: what exists;
- Cedar authorization: whether this actor may perform the action;
- entitlement: whether the customer has commercial access;
- GrowthBook rollout: whether the capability is currently exposed to this cohort.

The client previously reported entitlement failure before Cedar denial, and rollout context could read pricing tier from a user profile while entitlement state was maintained separately.

## Decision

For protected operations, the canonical sequence is:

`initialization → authentication → Cedar authorization → entitlement → lifecycle/rollout → operation`

Cedar is the authoritative security boundary. Entitlements never grant authorization, and GrowthBook never grants either authorization or commercial access.

The client may evaluate a different internal order for rendering performance, but it must not expose more detailed denial information than the server policy permits. The shared permission evaluator therefore gives Cedar denial precedence over entitlement failure.

The canonical commercial context for rollout targeting comes from the entitlement port/store. A user profile pricing field may be used as an input during billing synchronization, but it is not an independent runtime authority. GrowthBook pricing attributes are rollout cohort inputs only.

## Offline and PowerSync boundary

GrowthBook definition fetch and local snapshot evaluation are independent of PowerSync data synchronization. PowerSync must not be required to resolve the flag that decides whether PowerSync starts. Fresh cached temporary flags may continue within the seven-day window; stale temporary flags fail closed, while documented operational controls retain their emergency safe behavior.

## Consequences

- Server Cedar middleware remains mandatory even when a route has a feature flag.
- Feature and entitlement failures can be tested independently without changing authorization semantics.
- Pricing-tier drift between user profile and entitlement state is reduced.
- Any future change to gate precedence requires an ADR update and a truth-table test.
