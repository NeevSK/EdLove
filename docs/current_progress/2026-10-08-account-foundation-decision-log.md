---
title: "Account Foundation Decision Log"
status: "active — provisional decisions recorded"
created: 2026-10-08
owners: [product, identity, mobile, web]
tags: [account-lifecycle, product-decisions, identity, onboarding]
---

# Account Foundation Decision Log

These decisions reflect the user's current product clarification on 2026-10-08.
They override older conflicting intent only after the user confirms the open
questions below.

## Confirmed product direction

### D-001 — User-centered product

Gurudevi is user-centered, not primarily an institutional ERP. A person exists
as an independent user before any school exists. Users may later create or join
school platforms, but school infrastructure is an extension of the user's
account rather than the product's starting identity.

### D-002 — First trustworthy journey

The first release journey is:

```text
sign up → complete name/capacity onboarding → enter the product → do useful work
```

The journey must feel smooth before expanding account or domain scope.

### D-003 — Guest scope differs by platform

- Mobile guest work survives conversion into a permanent account.
- `gurudevi-web` provides temporary Explore only; it does not promise the same
  persistent guest lease as mobile.

### D-004 — Onboarding is mandatory

Every account must provide a name and primary role/capacity before entering the
main product. The product is role-based, not an anonymous general-purpose
workspace.

### D-005 — No multi-account first release

Multiple remembered accounts on one device are not part of the first
trustworthy release. Existing multi-account code is therefore compatibility
debt or deferred scope until explicitly reactivated.

### D-006 — Deletion is a request workflow

“Delete account” submits a deletion request. The user receives feedback about
the request and its status. Immediate client-triggered hard deletion is not the
product contract.

### D-007 — Data ownership is contextual

Ownership and retention depend on the context and kind of data. Personal data,
school-created data, institutional records, safeguarding data, and derived
analytics require separate custody rules. No single blanket ownership rule is
valid.

### D-008 — Web and mobile are both first-class

Both web and mobile must reach the trustworthy account journey. They may have
different guest capabilities, but they cannot silently disagree about account,
onboarding, authorization, or deletion semantics.

### D-009 — First release value is tab/domain coverage

The first trustworthy release must offer at least one coherent useful action
in each primary domain:

- **Self:** personal features, including reflection and wellbeing journal work.
- **Workspace:** role-based tasks; principals may create schools and teachers
  may create or join classes.
- **Library:** at least one real library task with durable user value.
- **Community:** at least one real community task with clear membership and
  privacy boundaries.

The acceptance question is useful account-to-domain flow, not historical
feature count.

### D-010 — School and class relationships

Teachers may create a new class or join an existing class. Joining may occur
through an invitation or another official relationship workflow. Class access
must be relationship-based rather than granted by a submitted client ID.

### D-011 — Explicit first-release exclusions

Student-focused product flows and multi-account device support are deferred
from the first trustworthy release. Existing code for those areas is not
automatically a release requirement.

### D-012 — Domain-based data custody

Data ownership is classified by tab/domain and entity relationship. For each
record we ask whether it is user-owned or entity-owned, which entity owns it,
whether it is persistent or derived, and whether another person or institution
depends on it. User-owned records may be removed with the user subject to
policy; entity-owned records are preserved, anonymized, or transferred under
the relevant domain policy.

### D-013 — Deletion feedback

Deletion feedback follows the actual server state: request receipt, current
status, required next step, failure/retry state, and cancellation when policy
permits. The interface must never imply that local cleanup or request
submission equals final deletion.

## Resolved from repository audit

### D-014 — Recommended first-release domain slices

The repository audit gives us a concrete starting slice for each domain. These
are intentionally narrow acceptance targets, not claims that the whole domain
is complete:

- **Self:** one durable reflection or wellbeing practice, with Fire Journal as
  the leading candidate and Mood Lotus as the adjacent candidate.
- **Workspace:** school creation for a principal and class creation/join for a
  teacher; classroom attendance follows only after the relationship exists.
- **Library:** authenticated resource discovery and opening a validated
  resource link; collections and curator workflows remain later slices.
- **Community:** scoped circle discovery and entry as the first slice;
  posting, membership mutation, moderation, and safety are separate work and
  must not be implied by the directory.

These slices are selected because they align with the user's product direction
and have the clearest existing implementation seams. They still require
runtime evidence before being called trustworthy.

## Next reasoning step

The broad product-question phase is complete. The next step is to write and
review the canonical account lifecycle contract: states, transitions,
onboarding gate, session semantics, guest conversion, relationship creation,
deletion-request states, and domain custody rules. No feature implementation
should proceed until that contract is accepted.
