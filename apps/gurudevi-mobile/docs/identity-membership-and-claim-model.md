---
title: "Gurudevi Identity, Membership, and Claim Model"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, identity, users, memberships, claims, schools, classrooms, zenstack]
---

# Gurudevi Identity, Membership, and Claim Model

## Core idea

Gurudevi separates three things that are often accidentally combined:

1. the real person/account;
2. the person's relationship to an entity such as a school or classroom;
3. a provisional record created before that person has an account.

This lets a principal or teacher prepare a school/classroom roster, while a real
person can later sign up and claim the correct provisional membership. It also lets
a person join directly without a provisional record.

## Canonical layers in this repository

### `users` — one internal person/profile

`users` is the canonical Gurudevi person record. It is not a row per device and not
a row per school/classroom membership. The identity adapter resolves external auth
providers through `auth_identities` to this internal user ID.

The repository's multi-account device feature stores multiple sessions locally in
the device-account registry and switches the active account. That does not require
duplicating the person in `users`.

### `auth_identities` — external login mappings

This maps a provider/provider-user ID to an internal `users.id`. One internal person
may have more than one provider identity, subject to linking rules. Authentication
identity and product membership are separate concepts.

### `bonds` — generalized actor-to-entity capacity

`bonds` is the current generalized relationship table:

| Field | Meaning |
| --- | --- |
| `user_id` | actor/person |
| `entity_id` | school, classroom, platform, or other entity |
| `entity_type` | entity namespace |
| `capacity` | role/capacity such as teacher, principal, student, admin |
| `metadata` | relationship-specific details |

This is the right foundation for relationships such as principal → school,
teacher → school, teacher → classroom, or student → school.

### `classroom_students` — classroom enrollment/provisional roster

This is the canonical classroom-specific membership record. It already supports:

- a real enrollment with `student_id`;
- a provisional/shadow record with `student_id = NULL`;
- display data such as `full_name` and `roll_number`;
- a unique `invite_code`;
- claiming through `student_id` plus `claimed_at`;
- direct enrollment when the user already exists.

The current code implements `addShadowStudent`, `claimShadowStudent`, direct
enrollment, and roster management against this table.

### School and classroom ownership — relationship first, shortcut second

The school-level model currently has two layers:

- `bonds` is the generalized relationship: principal, teacher, section head,
  grade head, or another capacity can be attached to a school or classroom.
- `schools.created_by` and `classrooms.teacher_id` are direct ownership shortcuts
  retained by current product and authorization paths.

Therefore, a principal-created teacher should normally be represented as an
invited or provisional school bond, then linked to the real `users.id` when the
teacher signs up. A classroom's `teacher_id` is the current primary-owner
shortcut, not the complete staff roster. Before launch, we need one explicit rule
for when a claimed teacher bond also populates `teacher_id`, and how transfer and
history are recorded. Until then, `teacher_id` alone must not answer who can act
for a classroom.

The existing `invite_codes` flow is school-scoped and role-aware, so it is a
natural invitation mechanism for teachers and administrators. Its database
column is `role`; application code may expose that as contextual `capacity`.
Claiming is performed by the `claim_invite_code` RPC so code consumption and bond
creation remain atomic. It should be reviewed alongside `bonds`, not replaced by
a second teacher table.

### `students` — legacy/parallel table

The separate `students` table contains `classroom_id`, `full_name`, `index_number`,
and `notes`, but the current application enrollment path uses
`classroom_students`. It should not become a second canonical student model until
we prove that an active feature still needs it. The current recommendation is to
consolidate or retire it after checking live rows, views, functions, and jobs.

## Supported lifecycle

### Path A — owner creates a provisional actor

1. Owner creates or selects a school/classroom.
2. Owner creates a provisional membership with display name and optional roster data.
3. System generates a single-use or controlled-use invite token/code.
4. Provisional membership has no `student_id` yet.

### Path B — person claims the provisional actor

1. Person authenticates and becomes/resolves to a `users.id`.
2. Person presents the invite code or secure invite token.
3. Server verifies the token, entity, capacity, expiry, and current claim state.
4. Server sets the membership's `student_id` and `claimed_at` atomically.
5. Subsequent domain records reference the real `users.id`, not the provisional label.

### Path C — person joins directly

1. Person authenticates and resolves to `users.id`.
2. Owner or approved join flow creates the membership directly.
3. The same uniqueness and authorization rules apply.

### Path D — owner adds an existing person

1. Owner selects an existing internal person.
2. Server creates the entity membership/bond.
3. No shadow record is created.

## Generalization beyond students

The same conceptual pattern applies to teachers, principals, guardians, and other
actors, but the storage should follow the relationship's nature:

- school/classroom role or capacity → `bonds`;
- classroom student roster with provisional details → `classroom_students`;
- external login mapping → `auth_identities`;
- one person's sessions on a device → local device-account registry;
- domain-specific details that need independent lifecycle → a dedicated domain model.

Do not create separate `teacher`, `principal`, or `student` person tables merely to
represent roles. Roles/capacities belong in relationships; person identity belongs
in `users`.

## Invariants we must enforce

1. A provisional membership may have no `student_id`, but a claimed membership must
   have exactly one internal user.
2. An invite token must be unguessable or sufficiently protected, scoped to the
   intended entity/capacity, and single-use unless explicitly designed otherwise.
3. Claiming must be atomic and must reject already-claimed or expired invitations.
4. A user must not have duplicate active membership for the same entity/capacity.
5. Display fields from a provisional record must not overwrite the real user's
   canonical profile without an explicit merge rule.
6. Historical records must reference stable internal IDs, not invite codes or names.
7. RLS and server authorization must protect roster reads, claims, and role changes.

## Current repository findings

- The intended classroom shadow/claim flow already exists in code.
- `ClassroomStudent` in ZModel is incomplete compared with the live table and code:
  optional `student_id`, `full_name`, `invite_code`, `roll_number`, `enrolled_at`,
  and `claimed_at` need to be represented deliberately.
- `ClassroomStudent` is now represented in ZModel with the provisional and
  compatibility fields; the additive `notes` migration is prepared but not yet
  deployed.
- `users` is heavily used as the internal profile/person record.
- `bonds` is heavily used for capacities and active perspectives.
- `device_accounts` is a multi-account session/security concern, not the canonical
  person table.
- The separate `students` table is currently a consolidation candidate, not a new
  ZenStack model.

## Implementation order

1. Align `ClassroomStudent` ZModel with the existing canonical table and claim flow.
2. Add/verify explicit claim invariants and RLS in staging.
3. Document school-level teacher/principal bonds and invite-code flows.
4. Decide the relationship between school bonds, classroom primary ownership, and
   teacher transfer/history.
5. Audit `students` for live usage and plan migration/retirement.
6. Only then consider a generic `EntityMembership` abstraction if multiple domains
   genuinely need the same provisional lifecycle.

The generic abstraction should be earned by repeated evidence; it should not replace
the working classroom-specific flow prematurely.
