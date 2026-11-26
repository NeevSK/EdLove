---
title: "Operations · Educational Institutions"
status: "admitted"
owner: "Naveen"
created: 2026-11-17
updated: 2026-11-17
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, domains, ops, institutions, card]
---

# Operations · Educational Institutions

`ops.institutions` is the authoritative domain module for educational institutions, schools,
academies, campuses, and institutes across the Polymath and Gurudevi Platform.

It governs both:
1. **Institutional Schools**: Government, national, provincial, and registered schools existing in
   the national educational registry (`EduSchool`, Sri Lankan classification Type 1AB, 1C, 2, 3), claimed
   and bonded by verified principals.
2. **Commercial & Independent Institutions**: Pre-schools, K-12 private/international schools, collegiate
   institutes, tuition centers, and vocational academies provisioned with an initial principal bond and
   community HQ group.

## Facts it owns

- **School / Institution (`public.schools`)**: The core entity record including canonical ID, institutional
  display name, unique slug handle, school level/type (`SchoolLevel`), tenant classification (`SchoolKind`),
  local timezone, and school-wide policies.
- **Institutional Community HQ Group (`public.community_groups`)**: Default community hub initialized upon
  institution provisioning.
- **Institutional Founder/Principal Bond (`public.bonds`)**: Root administrative ReBAC bond linking the
  founding creator account to the school with `capacity: 'principal'` and `citizenship: 'FIRST_CLASS'`.

## Invariants

1. **Unique Identity & Handle**: Every institution must possess a distinct, URL-safe slug handle that is
   globally unique across active institutions.
2. **Atomic Provisioning**: A commercial institution, its community HQ group, and the founder's active
   principal bond are committed together in one transactional boundary.
3. **ReBAC Isolation**: Holding a principal bond at an institution grants authority solely within that
   institution's scope (`entity_type = 'SCHOOL', entity_id = school.id`), never across other institutions
   or platform globals.
4. **Idempotent Submission**: Provisioning requests carry a unique idempotency key; duplicate requests with
   the same key replay the committed result without re-executing inserts.

## Commands

- `ops.institutions.provision`
- `ops.institutions.update`
- `ops.institutions.createInviteCode`
- `ops.institutions.revokeInviteCode`

## Queries

- `ops.institutions.handleAvailable`
- `ops.institutions.listInviteCodes`

## Events it publishes

- `ops.institution.provisioned`
- `ops.institution.updated`
- `ops.institution.connected`
- `ops.institution.inviteCodeCreated`
- `ops.institution.inviteCodeRevoked`

## What it reads from other subdomains

- `identity`: Verified account identities for founders and members.
- `authority`: Active ReBAC bonds and scopes.
