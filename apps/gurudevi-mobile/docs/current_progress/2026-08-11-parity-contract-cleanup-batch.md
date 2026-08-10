---
title: "Parity Contract Cleanup Batch"
status: "complete"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, parity, zmodel, notifications, wellbeing, memberships]
---

# Parity Contract Cleanup Batch

This batch aligns ZModel with columns and nullability already present in the
live database. It does not change database data or authorization behavior.

## Changes

- `Notification.body` is required, matching the live table.
- `SchoolMembership.created_at` and `updated_at` are required, matching the
  applied timestamp hardening migration.
- `MoodLog.idempotency_key` is declared as a unique generated value.
- `FireJournalEntry` now models nullable content/burn state and `burned_at`.
- Library vector/search columns are represented as unsupported read-only
  database types.
- Collection links, growth/impact/manifesto timestamps, and longitudinal
  snapshot fields now match live nullability.
- Legacy `school_registry` view nullability is excluded from false-positive
  drift warnings by the auditor.

The live auditor now reports zero structural errors and zero parity warnings.
