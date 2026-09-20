---
title: "Project Atlas and Shared Vocabulary"
status: "active"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [architecture, collaboration, learning, governance, vocabulary]
---

# Project Atlas and Shared Vocabulary

## Purpose

The Project Atlas is the shared orientation system for Gurudevi. It makes the
platform understandable without requiring one person to memorize every
framework, file, or engineering concept. It turns unknowns into named questions
with a way to investigate them.

This is a living map, not a claim that the whole platform is known or proven.
Experienced engineering teams use the same principle: they distribute
understanding across architecture maps, contracts, tests, decision records,
dashboards, and operational practice.

## Shared Vocabulary

Metaphors are valid architectural language when they point to a concrete type of
system concern. Use the term first; translate it into technical detail only when
that detail affects a decision or implementation.

| Metaphor | Meaning in Gurudevi | Questions it should trigger |
| --- | --- | --- |
| Foundation | A non-negotiable invariant: identity, tenancy, authorization, data integrity, privacy, or durable domain rule | What must always remain true? Who verifies it? What happens if it fails? |
| Plumbing | Cross-cutting capability used by many rooms: API contracts, auth/session handling, URL policy, telemetry, errors, flags, retries, idempotency | Who owns it? Is it reusable? Can mobile and web drift? How does failure appear? |
| Room | A bounded feature/domain with a clear responsibility and public door | What outcome does it own? What may enter or leave? Who maintains it? |
| Door | A trust, data, or platform boundary: user to tenant data, external URL to app, mobile/web to API, API to worker, worker to database | What input is untrusted? How is authority established? What must be rejected or redacted? |
| Blueprint | The intended contract, architecture, state machine, or decision record | Does real code match it? What evidence checks that? |
| Inspection | Independent review, hostile test, static check, runtime test, or operational observation | What claim is this trying to disprove? What does it fail to prove? |
| Fire exit | Rollback, kill switch, retry/recovery path, backup, or incident procedure | How do we safely stop harm and recover user intent? Has it been exercised? |
| Renovation | Refactoring that improves an existing room, plumbing path, or foundation without changing product intent | What must remain compatible? Can it be staged and rolled back? |
| Scaffolding | Temporary compatibility code, feature flag, migration layer, or experiment support | Who owns its removal? What is the expiry and removal condition? |

## Orientation Protocol

Before a meaningful change, investigation, or claim, create a short orientation
note. It can be a conversation response, feature spec, PR description, or
decision record; it does not require a new document every time.

1. **Human outcome:** What person is trying to do, and why does it matter?
2. **Atlas location:** Which room, plumbing path, foundation, or door is in
   scope?
3. **Existing ownership:** Which package, app, contract, utility, or decision
   already owns this behavior?
4. **Platforms:** What differs between Expo 57 mobile, Next.js 16 web, API,
   database, and background workers?
5. **Failure and harm:** What could break, leak, duplicate, block, or become
   unrecoverable?
6. **Truth state:** What is known, inferred, and unproven?
7. **Next proof:** What is the smallest useful inspection, test, experiment, or
   question that reduces the highest-risk unknown?

If an agent cannot answer an item, it says so plainly and investigates before
making a consequential recommendation.

## The Five Atlas Maps

### Journey Map

Shows what people try to accomplish, including entry, success, failure,
recovery, and return. A journey is not complete because the happy path renders.
It includes slow network, offline, retry, background/resume, expired session,
duplicate action, and user-visible recovery where relevant.

### System Map

Shows the rooms, plumbing, foundations, and doors that implement a journey.
It identifies the canonical owner and public contract so agents do not create
near-duplicate utilities in apps or packages.

### Trust Map

Shows assets, actors, authority sources, and enforcement points. It answers who
may read or change what, how scope is derived, what is untrusted, and where the
system fails closed. It includes tenant boundaries, device/session state, and
sensitive telemetry redaction.

### Runtime Map

Shows capability differences across Expo 57, Next.js 16, the Sanctuary API,
database/sync infrastructure, and workers. Shared domain contracts belong in
platform-neutral packages; routing, rendering, persistence, permissions, and
runtime lifecycle stay behind explicit platform adapters.

### Evidence Map

Shows what is proven and at what level. It records test or operational evidence,
the substituted dependencies, the scenarios covered, limits, waivers, and the
next missing proof. It prevents a mock test, a static check, or a document from
being mistaken for real-device or production evidence.

## Unknowns Register

Unknowns are not defects or personal failures. Unnamed unknowns are dangerous;
named unknowns with an owner and a next proof are manageable.

| Field | Meaning |
| --- | --- |
| Question | The thing not yet understood or remembered |
| Atlas location | Journey, room, plumbing, foundation, or door affected |
| Why it matters | User harm, security, reliability, cost, or maintenance impact |
| Truth state | Known, inferred, or unproven |
| Next proof | Specific code trace, test, device run, environment check, or decision needed |
| Owner | Person or role responsible for moving it forward |
| Decision deadline | When uncertainty must be resolved before promotion |

## Learning by Relevance

The goal is not to complete a multi-year engineering curriculum before building.
Learning happens when a concept affects an active product or architecture
decision. The agent explains the smallest useful concept in ordinary language,
connects it to its consequence, and preserves a short durable note only if it
will recur.

The required explanation pattern is:

1. What it is in human terms.
2. Why it matters in this exact moment.
3. What can go wrong.
4. The realistic choices and trade-offs.
5. The decision that belongs to Naveen.

## Systematic Coverage Rule

Absolute coverage is not possible. A system earns confidence through declared
scope and progressively stronger evidence. For each critical journey or trust
boundary, the Atlas should eventually make visible:

- the outcome and state/recovery path;
- owning rooms and shared plumbing;
- authority and data boundaries;
- platform-specific adapters and limitations;
- hostile/failure cases;
- current evidence level and missing proof;
- recovery or rollback route.

Work one journey or boundary at a time. Do not wait for a complete Atlas before
building; update the relevant map as a consequence of doing real work.

## First Application

The first Atlas exercise is the shared deep-link and route-intent path across
Expo mobile and Next.js web. It is a good starting slice because it combines a
user journey, shared plumbing, external doors, security boundaries, platform
differences, telemetry/privacy, and recovery behavior.

The first output is an inventory, not a refactor:

1. Trace all mobile and web entry points.
2. Identify their shared meaning and genuine platform differences.
3. Identify the current contract owners and any divergence.
4. Record the hostile/failure matrix and evidence already available.
5. Propose only the smallest platform-neutral contract worth extracting.
