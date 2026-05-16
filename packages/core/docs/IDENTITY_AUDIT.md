# Sovereign Identity Fabric: Historical Audit

This document is a historical audit of the older identity and onboarding model.
It is retained for investigation and migration history only.

Canonical references:

- `apps/gurudevi-mobile/docs/architecture/legacy-free-agentic-mcp-ssot.md`
- `packages/core/docs/DATA_ODYSSEY.md`
- `docs/architecture/authorization.md`

The old terminology in this file should be treated as archival context, not runtime truth.

---

## 1. Database & RLS Layer (Foundation)
The identity fabric was originally anchored in Supabase tables and RLS policies.

### `users` Table
- Purpose: primary identity storage.
- Key columns historically included `id`, `is_anonymous`, `school_id`, and `onboarding_completed`.

### `bonds` Table
- Purpose: atomic unit of ReBAC.
- Historical columns included `user_id`, `entity_id`, `entity_type`, and `capacity`.

---

## 2. Policy Layer
Access rules were historically defined in `schema.zmodel` and translated into policy checks.

---

## 3. Runtime Context
The runtime context now belongs to the canonical SSOT docs and should be read there.

---

## 4. Migration Rule
If this file conflicts with the canonical docs, the canonical docs win.
