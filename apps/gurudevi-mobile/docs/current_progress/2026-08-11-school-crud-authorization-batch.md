---
title: "School CRUD Authorization Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, schools, principals, rls, zenstack, crud]
---

# School CRUD Authorization Batch

## Decision

School tenant administration is bond-authorized. A principal or section head
may manage school structure and invite codes; a grade head may manage grades;
platform administration remains an override. Read access is school-scoped.

Registry facts (`edu_schools`) are not tenant CRUD and remain read-only.

## Corrections

- Added matching ZenStack policies for School, Section, SchoolGrade, and
  InviteCode.
- Added Postgres RLS policies for section, grade, and invite-code CRUD.
- Fixed grade creation to populate the required `grade_levels.school_id`.
- Kept membership/bond/entitlement creation inside the authority RPC rather
  than allowing direct client writes.

