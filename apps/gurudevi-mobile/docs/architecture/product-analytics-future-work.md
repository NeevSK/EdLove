---
title: "Gurudevi Product Analytics Future Work"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [analytics, posthog, roadmap, privacy, product]
---

# Product Analytics Future Work

This roadmap follows the [Product Analytics and PostHog Contract](2026-07-26-product-analytics-posthog-spec.md).
The typed event boundary and basic lifecycle instrumentation are implemented;
the items below are operational/product-analysis work that still needs
deliberate ownership.

## Completed foundation

- `IAnalyticsPort` remains the provider-neutral hexagonal port.
- Native, web, and server PostHog adapters remain replaceable.
- Product events and approved context dimensions are typed.
- PostHog receives event-time context for capacity, school type, citizenship,
  platform, personal pricing, and effective entitlement scope/tier.
- Anonymous, onboarding, conversion, school-bond, exposure, and feature-use
  events are defined.
- Identifiers, names, content, and domain IDs are sanitized or excluded.
- Analytics is best-effort and independent of Cedar, entitlements, PowerSync,
  and domain writes.
- The app shell owns one PostHog adapter initialization path.

## Remaining work

### P0 — Privacy and production readiness

1. Decide the consent/legal basis for product analytics by platform and market.
2. Define retention, deletion, access, and export settings in the PostHog
   project.
3. Keep session replay and autocapture disabled until a separate privacy review
   approves their masking and scope.
4. Verify production environment configuration without committing API keys;
   local development remains disabled by default.

Acceptance evidence: a documented privacy decision, configured retention, a
tested opt-out/disable path, and a production configuration review.

### P0 — Event quality

- Create a PostHog event dictionary from the typed contract.
- Add schema validation for required event properties in CI or tests.
- Verify anonymous-to-durable conversion produces one coherent funnel rather
  than two unrelated users.
- Verify changing active capacity, school type, citizenship, and entitlement
  produces historically correct event snapshots.
- Add duplicate-event checks for retries, React effects, and offline flushes.

### P1 — Product analysis surfaces

- Build the onboarding funnel: guest start → onboarding start → completion →
  signup → conversion.
- Build feature adoption views by active capacity and school type.
- Compare personal FREE/PRO usage against active-bond institutional access.
- Add platform/version breakdowns for feature failures and abandonment.
- Define activation and retention metrics before building dashboards.

### P1 — Offline and operational verification

- Test event queueing and later flush on native and web offline paths.
- Verify analytics transport failures do not affect local writes or route entry.
- Add a bounded queue/flush policy and document behavior during long offline
  periods.
- Add a development inspector or test adapter that records events without
  contacting PostHog.

### P2 — Provider and governance maturity

- Add a second fake analytics adapter to prove the port is genuinely
  provider-neutral.
- Add event ownership and review metadata for high-value metrics.
- Version event contracts when property meaning changes.
- Revisit server-side product events only where client events cannot provide
  trustworthy completion evidence; avoid duplicate client/server counting.

## Negative boundaries

This roadmap does not:

- use PostHog for authorization, entitlement, or rollout decisions;
- add PostHog feature flags;
- copy educational or user-generated content into analytics;
- send raw school, classroom, student, or resource identifiers by default;
- make analytics required for onboarding, sync, or domain writes;
- replace PowerSync with an analytics event database;
- collect every available variable merely because it exists.

## Execution order

```text
privacy decision
  -> production configuration
  -> event dictionary and validation
  -> funnel/cohort dashboards
  -> offline/duplicate-event verification
  -> provider and governance maturity
```

