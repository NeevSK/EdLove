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

## How provisional decisions govern implementation

These are intentionally provisional product policies, not irreversible schema
or release commitments. Implementation may proceed against a small, explicit
current contract while preserving compatibility seams and recording the
assumptions that can change later. A future decision may revise a boundary or
capability without invalidating the evidence for an earlier contract, provided
the migration includes characterization tests, a compatibility decision, and a
rollback or reconciliation path. “Provisional” therefore means revisable with
evidence; it does not mean that each caller may invent a different policy.

The reusable engineering rule, hardening priorities, and change protocol live
in the [Provisional Product Policy and Current Implementation Contract](../architecture/provisional-policy-and-implementation-contract.md)
guide. This decision log records the current product choices; the guide records
how to implement and revise them safely.

## Confirmed product direction

### D-001 — User-centered product

Gurudevi is user-centered, not primarily an institutional ERP. A person exists
as an independent user before any school exists. Users may later create or join
school platforms, but school infrastructure is an extension of the user's
account rather than the product's starting identity.

The product metaphor is a person entering Sanctuary first. Sanctuary is the
whole authenticated Gurudevi app. Inside Sanctuary, Self is the primary home
tab; Workspace, Library, and Community are additional tabs/domains.
Institutions, classes, and other participation contexts arise later from that
person's participation. A school is never a prerequisite for having a
Gurudevi account or entering Self.

### D-002 — First trustworthy journey

The first release journey is:

```text
sign up → complete name/capacity onboarding → enter Sanctuary → Self home → do useful work
```

Sanctuary is the app; Self is its primary home tab. The journey must feel
smooth before expanding institutional relationships or organization scope.

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
- **Workspace:** role-based tasks are available according to the user's
  declared capacity; a new user may enter Workspace and begin setup without
  already belonging to a school or class. Principals may create schools and
  teachers may create or join classes.
- **Library:** public/open discovery and at least one real library task that
  does not require institutional membership.
- **Community:** open community discovery and participation available to an
  eligible user without a school, with private/scoped membership rules added
  separately.

The acceptance question is useful account-to-domain flow, not historical
feature count.

### D-010 — School and class relationships

Teachers may create a new class or join an existing class. Joining may occur
through an invitation or another official relationship workflow. Class access
must be relationship-based rather than granted by a submitted client ID.

The initial class entity may be personal/standalone and later attach to a
school, or may be created directly inside a selected school context. This is
an entity-model choice that remains provisional; it must not be turned into an
access barrier. The current implementation should therefore keep class
creation and later school attachment separable, with server-owned relationship
records and an explicit migration path when the model is narrowed.

These are participation contexts and capability targets, not entry barriers.
They must not gate Sanctuary, Self, Workspace entry, open Community, or public
Library experiences. A relationship is required only when operating on a
specific existing organization, class, or other scoped entity.

### D-011 — Explicit first-release exclusions

Student-focused product flows and multi-account device support are deferred
from the first trustworthy release. Existing code for those areas is not
automatically a release requirement.

The current web onboarding form does not offer Student as a first-release
capacity. The capacity vocabulary remains available in the domain contract for
the later student slice; this is a product-scope deferral, not deletion of the
underlying model.

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
  teacher; classroom attendance follows only after the relationship exists and
  is not part of the initial Sanctuary gate.
- **Library:** public/open resource discovery and opening a validated resource
  link; collections and curator workflows remain later slices.
- **Community:** open discovery and a safe public participation boundary first;
  private circle membership, posting, moderation, and safety are separate work
  and must not be implied by the directory.

These slices are selected because they align with the user's product direction
and have the clearest existing implementation seams. They still require
runtime evidence before being called trustworthy.

## Next reasoning step

The broad product-question phase is complete. The next step is to write and
review the canonical account lifecycle contract: states, transitions,
onboarding gate, session semantics, guest conversion, relationship creation,
deletion-request states, and domain custody rules. No feature implementation
should proceed until that contract is accepted.
