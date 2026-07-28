---
title: "Gurudevi Product Analytics and PostHog Contract"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [architecture, analytics, posthog, privacy, offline-first]
---

# Gurudevi Product Analytics and PostHog Contract

## 1. Purpose

Product analytics helps the team understand how the sanctuary is used. It
answers questions about discovery, activation, adoption, completion, and
retention. It is not an authorization, entitlement, identity, sync, or feature
rollout authority.

This contract standardizes the dimensions that may be used for comparison and
the events that may be sent to PostHog. It prevents each feature from inventing
its own event names, context shape, or privacy rules.

## 2. Architectural boundary

```text
feature/domain code
        -> typed product event contract
        -> IAnalyticsPort
        -> injected PostHog adapter
        -> PostHog queue/transport
```

The core layer owns the port and event/context contract. The PostHog package
owns the native, web, and server adapters. Feature code must not import
`posthog-js`, `posthog-react-native`, or `posthog-node` directly.

PostHog is best-effort. Analytics failure must never block onboarding,
authorization, entitlement resolution, PowerSync, or a domain mutation.

## 3. Product questions and canonical dimensions

The dimensions below are deliberately whitelisted. They are captured as an
event-time context snapshot so historical analysis remains correct when a user
changes capacity, school, citizenship, or entitlement later.

| Dimension | Example | Why it is useful |
| --- | --- | --- |
| `platform` | `ios`, `android`, `web` | Compare platform activation and failures. |
| `identity_mode` | `anonymous`, `authenticated` | Compare guest exploration with durable accounts. |
| `citizenship` | `THIRD_CLASS`, `SECOND_CLASS`, `FIRST_CLASS` | Compare registration/institutional stages. |
| `onboarding_completed` | `true` | Separate exploration from activated usage. |
| `active_capacity` | `student`, `teacher`, `principal` | Compare the currently selected perspective. |
| `active_entity_type` | `PERSONAL_CLASSROOM`, `SCHOOL`, `CLASSROOM` | Distinguish personal and institutional usage. |
| `school_type` | `primary`, `secondary` | Compare school-context product fit without exposing a school ID. |
| `personal_pricing_tier` | `FREE`, `PRO` | Compare personal commercial adoption. |
| `effective_entitlement_scope` | `individual`, `active_bond`, `add_on` | Explain which access path enabled the experience. |
| `effective_entitlement_tier` | `FREE`, `PRO`, `INSTITUTIONAL` | Compare access outcomes without conflating pricing and citizenship. |
| `app_version` | `1.4.0` | Detect release-specific regressions and adoption. |
| `analytics_schema_version` | `1` | Keep historical event interpretation stable. |

`active_capacity` means the selected active bond capacity, not every capacity
the user possesses. A later account-level event may include a count of
available capacities, but should not send the entire bond list by default.

## 4. Event contract

The initial product event vocabulary is:

```text
app_started
guest_started
onboarding_started
onboarding_completed
signup_started
account_converted
school_bond_claimed
feature_exposed
feature_opened
feature_action_completed
feature_action_failed
```

Events should describe meaningful product outcomes, not every UI interaction.
The `feature_id` and registry `analyticsKey` identify the product surface.
`feature_exposed` is the analytics record of a GrowthBook exposure; it does
not decide rollout eligibility.

Timing is useful when it answers a product question. The SDK event timestamp is
the source for event time. Funnel events may additionally include:

```text
duration_seconds
time_since_signup_seconds
time_to_first_feature_seconds
```

Client-captured timestamps are retained as optional diagnostic fields when
offline queueing matters. Server receipt time must not replace event time.

## 5. Identity and privacy rules

- Anonymous users may be represented by a pseudonymous analytics identity.
- Durable identity conversion must preserve the product funnel without sending
  raw email or personal profile content.
- Do not send email, display name, school ID, student ID, classroom ID,
  journal content, message content, lesson content, or unrestricted bond
  metadata.
- School type may be sent; school identity must not be sent by default.
- Changing dimensions belong on events. Current person properties must not be
  used to reconstruct historical capacity or entitlement.
- Analytics opt-in/disablement is a privacy or operational control, not an
  ordinary release flag.
- Session replay and autocapture remain disabled until an explicit privacy
  review enables them for the relevant platform and jurisdiction.

## 6. Responsibilities and negative boundaries

| Concern | Authority | PostHog role |
| --- | --- | --- |
| Authentication/session validity | Supabase Auth | Observe lifecycle outcomes only. |
| Structural permission | Cedar/server authorization | Observe permitted/denied outcome categories only; never decide access. |
| Commercial entitlement | Scoped entitlement service | Record effective scope/tier snapshot; never grant access. |
| Rollout/cohort assignment | GrowthBook | Record exposure and adoption; never replace GrowthBook. |
| Domain data | Supabase/PowerSync/local stores | Never copy domain content into analytics. |
| Offline correctness | Local-first app and PowerSync | Queue analytics independently; never make product work depend on analytics. |

## 7. Current implementation disposition

Already present:

- `IAnalyticsPort` in core;
- PostHog adapters for native, web, and server;
- injected PostHog bridge used by core;
- GrowthBook exposure tracking;
- registry-level `analyticsKey`;
- feature discovery tracking;
- application initialization and identity calls.

Completed in the current implementation:

- consolidate duplicate provider/shell initialization;
- replace arbitrary `string`/`any` event calls with typed event contracts;
- sanitize identity and bond properties;
- add anonymous-to-durable conversion events;
- add event-time context snapshots;
- add tests for analytics failure isolation and privacy allowlisting.

Remaining operational and product-analysis work is tracked in the
[Product Analytics Future Work](product-analytics-future-work.md) roadmap.

## 8. Explicit non-goals

This change does not:

- introduce PostHog feature flags;
- move authorization into PostHog;
- move GrowthBook rollout decisions into PostHog;
- add a second database or analytics event table;
- sync analytics through PowerSync;
- transmit school or student content;
- make analytics a prerequisite for app entry or domain writes.

## 9. Future developer workflow

When adding a product feature:

1. Add or update the domain registry entry and its `analyticsKey`.
2. Define the smallest meaningful product outcome events.
3. Use the shared typed analytics API; do not call a PostHog SDK directly.
4. Add only approved context dimensions and no raw identifiers/content.
5. Add a test for event name, required properties, and failure isolation.
6. Update this contract only when the vocabulary or privacy boundary changes.
7. Verify that analytics is not used in Cedar, entitlement, GrowthBook, or
   PowerSync decisions.
