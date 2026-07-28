---
title: "Gurudevi Product Analytics Developer Guide"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [guide, analytics, posthog, developers]
---

# Product Analytics Developer Guide

Read the [Product Analytics and PostHog Contract](2026-07-26-product-analytics-posthog-spec.md)
before adding events.

## What to record

Record product outcomes such as onboarding completion, account conversion,
feature opening, and successful actions. Include the approved event-time
context: platform, identity mode, citizenship, active capacity, active entity
type, school type, personal pricing tier, effective entitlement scope/tier,
app version, and analytics schema version.

## What not to record

Never add raw email, names, school IDs, student IDs, classroom IDs, messages,
journals, lessons, or arbitrary database objects. A type or category is usually
enough for product comparison.

## How to reason about changing context

Use event properties for values that can change. A teacher who later becomes a
principal must produce teacher-context events before the change and
principal-context events afterward. Do not depend on the user's current
profile properties to recreate the past.

## Offline behavior

Analytics is best-effort and independent from PowerSync. It may queue and flush
later, but it must never block a local write, sync operation, onboarding step,
or authorization decision. If analytics is unavailable, the feature still
works.

## Review checklist

- Is this a meaningful product outcome?
- Is the event name in the canonical vocabulary?
- Are all properties from the approved allowlist?
- Is changing context captured on the event?
- Does the event avoid raw identifiers and domain content?
- Does the feature work when PostHog is disabled or offline?
- Is a test included for the event contract?

