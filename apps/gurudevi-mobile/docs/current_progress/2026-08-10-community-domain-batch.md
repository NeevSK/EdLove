---
title: "Community Domain Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, community, schema-parity, zod]
---

# Community Domain Batch

## Evidence

The linked database contains 5 `community_groups`, 7
`community_group_members`, and 2 `community_posts` rows. A zero-null scan
confirmed the required relationship, status, and timestamp fields used by the
ZenStack models. `group_messages` and `community_reactions` currently contain
zero rows; their existing physical columns are retained and modeled, but no
new requiredness is inferred from empty tables.

## Contract decision

- `community_groups`, memberships, posts, messages, and reactions remain one
  active community domain.
- The existing Zod schemas in `packages/core/src/logic/schemas/community.schema.ts`
  are the API boundary; community handlers already parse returned rows.
- The prepared migration hardens only verified non-null fields.
- No community table or column is labeled legacy or removed in this batch.
- PowerSync is not expanded for community yet: current community flows use
  online Supabase/API reads, and there is no evidence that offline community
  mutation/read support is a product requirement.

## Follow-up

Apply the migration, rerun parity, then separately review feature flags and
growth state. Those are not folded into this community batch merely because
the auditor reports them nearby.
