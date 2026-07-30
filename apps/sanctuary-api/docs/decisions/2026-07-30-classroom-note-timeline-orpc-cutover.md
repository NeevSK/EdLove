---
title: "Classroom Note Timeline oRPC Cutover"
status: "implemented"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
tags: [decision, api, orpc, classroom, audit, temporal]
---

# Classroom Note Timeline oRPC Cutover

## Decision

Classroom note snapshots and timelines are now native educational oRPC procedures. Note create, update, and delete handlers append lifecycle events to the deployed `classroom_note_events` table. Snapshot reads replay the latest event per note as of the requested timestamp and exclude deleted notes.

## Data alignment

The event model follows the deployed migration exactly: `note_id`, `event_type`, `snapshot`, `occurred_at`, `recorded_at`, `effective_from`, `effective_to`, and `recorded_by`. This replaces the legacy repository's incompatible `entity_id`, `operation`, and `metadata` column names.

## Verification

The native education integration test now covers note CRUD, snapshot, and timeline procedures through the in-memory Fetch → Hono → oRPC → Cedar → handler path. API typecheck passes. The test database remains a controlled proxy; real PostgreSQL replay and event persistence still require the real-database acceptance profile.
