---
title: "Canonical School Registry Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, education, edu-schools, registry, zenstack, parity]
---

# Canonical School Registry Batch

## Decision

`edu_schools` is the canonical factual registry. It is a base table with 9,962
live rows, not a tenant table and not a replacement for the application's
`schools` workspace/tenant model.

`school_registry` remains a read-only compatibility view over
`school_registry_legacy` and must not be used as the source for the national
registry count.

## ZenStack boundary

The `EduSchool` model maps the canonical table and exposes read access only.
The PostGIS `location` column is represented as `Unsupported("geography")` so
ZenStack does not pretend it can safely write or compare spatial values. The
existing database GIST spatial index and trigram name index remain database-
owned optimizations.

No write repository is introduced in this batch. Future school onboarding must
create or claim an application `School` tenant and reference canonical facts
through an explicit census mapping, rather than mutating registry facts.

## Follow-up

- Add a typed read repository for name/province/district discovery.
- Add a deliberate `EduSchool` ↔ tenant-school claim/link model if onboarding
  needs provenance and review state.
- Model `edu_school_registry_stats` and contacts only when active consumers
  require them; do not expand ZenStack coverage speculatively.

