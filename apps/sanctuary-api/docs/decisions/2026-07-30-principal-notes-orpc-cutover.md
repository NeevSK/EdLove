---
title: Principal notes oRPC cutover
status: proposed
date: 2026-07-30
scope: sanctuary-api, packages/core, packages/schema, packages/admin
---

# Decision

Expose the deployed `principal_notes` table through native oRPC procedures and the shared ZenStack client:

- `principalNotes.getAll`
- `principalNotes.getRecent`
- `principalNotes.create`
- `principalNotes.update`
- `principalNotes.delete`

The server derives `author_id` from the authenticated principal. School and note IDs remain inputs because they select the governed resource; caller-supplied author IDs are not accepted.

# Schema mapping

The existing table is mapped into the generated schema with `@@map("principal_notes")`. No database migration is created because the table and its RLS policies are already deployed. The model preserves the private-author semantics and note lifecycle; deletion remains supported for compatibility with the existing admin UI.

# Verification target

Add contract, HTTP, authorization, and admin-caller tests. Run ZenStack schema validation/generation, Sanctuary API typecheck, Node/Bun API suites, and the policies suite before advancing to another domain.
