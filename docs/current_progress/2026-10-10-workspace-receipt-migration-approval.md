---
title: "Workspace layout receipt migration — approval packet"
status: "approved-in-progress"
created: 2026-10-10
updated: 2026-10-10
author: "Codex"
tags: [workspace, sync, receipts, migration, approval]
---

# Purpose

This packet records the smallest persistent change required before workspace
writers can join the canonical outbox. It is a proposal only. No migration has
been executed.

# Current mismatch

The existing Supabase migration constrains `workspace_layouts.layout_version`
to `1`, while the current shared layout contract emits version `2` for canvas
metadata. A real database can therefore reject a valid current layout before
receipt reconciliation runs.

# Proposed additive change

1. Replace the version-1-only check with a forward-compatible check accepting
   versions `1` and `2`.
2. Add a server-owned workspace mutation envelope containing:
   `operation_id`, `idempotency_key`, `input_hash`, `client_revision`, target
   identity, and the complete layout or field patch.
3. Add a durable receipt result with `pending`, `completed`, `failed`, or
   `conflict`, plus `receipt_id`, `server_revision`, and a safe error code.
4. Keep the current whole-row writer and read fallback available during the
   migration window; do not delete or silently reroute it.

# Invariants

- Account and workspace authorization remains server-owned.
- A receipt may settle only the matching `operation_id`.
- Replaying an idempotency key returns the original authoritative outcome.
- A revision conflict preserves the local command and creates a recoverable
  conflict; it never silently overwrites remote state.
- Anonymous/local-only identities cannot upload bounded workspace data.
- Browser Pacer remains transient coalescing, not durability or authority.

# Approval record

Human approval was received in the coordinating chat on 2026-10-10. The
additive migration and shared contract slice are now authorized for repository
implementation. Applying the migration to a live database still requires a
separate deployment operation and is intentionally not performed here.

# Verification gates after approval

- G0: migration SQL lint/schema diff and contract typecheck.
- G1: idempotent replay, revision conflict, authorization, and receipt tests.
- G2: offline → reconnect → retry → receipt settlement scenario.
- G3/G4: native and browser workspace writer integration.
- G5: device process-death and multi-device conflict rehearsal.

