---
title: "Library Domain Parity Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, library, database, parity, zenstack, zod, search]
---

# Library Domain Parity Batch

## Authority decision

`nodes`, `collections`, and `resource_engagements` are active product tables.
They are not legacy tables: the mobile library API, realtime hooks, Sanctuary
API, and local knowledge index all use them.

## Contract changes

- Added active localized content, tags, school scope, thumbnails, license,
  media, link-health, quality, and collection metadata to ZenStack.
- Added explicit ZenStack models for `collection_nodes` and
  `collection_node_events`, including ordering, actor attribution, temporal
  audit data, indexes, and parent-collection access rules.
- Kept `creator_id` nullable because live data contains 40 system-owned or
  unattributed nodes and 2 collections without a creator. These are active
  Library records; no fake owner identity is introduced and no record is
  classified as legacy from age or null attribution alone.
- Kept vector embeddings and `tsvector` search columns outside ZenStack. They
  are database search infrastructure, not application CRUD fields.
- Prepared engagement nullability constraints after a zero-null live scan.
- Extended the prepared migration with zero-null NOT NULL constraints for
  Library core counters, filters, timestamps, and collection visibility.

## Remaining library work

1. Verify indexes for the actual filters: `subjects`, `topics`, `tags`,
   `visibility`, `school_id`, `created_at`, and engagement counters.
2. Keep collection membership reads/writes on the explicit `collection_nodes`
   model in ORM consumers, then reconcile any remaining direct Supabase reads
   in a later batch. The source/projection split between `collection_nodes` and the
   active `resource_ids`/`sequence_order` projections. `collection_nodes` is the
   ordered membership source; database triggers maintain the projections for
   current clients and temporal compatibility. Neither representation is
   removable in this batch.
3. Add/verify PowerSync projection only if offline library reads are part of the
   launch scope; the current local knowledge index is a separate cache.
4. Rerun parity after applying the batch migrations and regenerate the finding
   count.

## Validation rule

Library fields are classified as model, search infrastructure, or maintained
projection only after tracing live consumers. No broad `SELECT *` cleanup and
no destructive Library column/table removal is allowed without direct evidence
that product behavior and temporal triggers no longer depend on it.
