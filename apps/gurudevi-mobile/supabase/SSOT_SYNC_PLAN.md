---
title: "Supabase Migration SSOT Sync Plan"
status: "active"
created: 2026-03-19
updated: 2026-03-19
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Supabase Migration SSOT Sync Plan

## Current status

- Local migration filenames are now normalized to Supabase's required format:
  - `^\d{14}_name.sql`
- Duplicate active version `20260318000002` was resolved by keeping:
  - `20260318000002_community_full_stack.sql`
  - and archiving:
    - `migrations/archive/20260318000002_community_full_feature.sql`
- Linked project migration history was repaired and aligned.
- `supabase db push --linked --dry-run` now reports:
  - `Remote database is up to date.`

## What was fixed

1. Invalid migration filename prefixes were normalized to valid 14-digit versions.
2. Historical drift between local and remote migration history was reconciled via:
   - `supabase migration repair --status reverted ...`
   - `supabase migration repair --status applied ...`
3. Auth/profile reliability fixes were added to prevent anonymous upgrade desync:
   - `20260318103000_sync_auth_user_updates_to_public_users.sql`
   - app-side upsert safety in `packages/core/src/api/auth.ts`
4. Signup constraint fix added:
   - `20260318100000_fix_username_constraint_for_auth_signups.sql`

## SSOT operating rules (going forward)

1. Always create migrations with full 14-digit UTC timestamps.
2. Never keep two active files with the same 14-digit version.
3. Never keep non-conforming files in `migrations/`:
   - move legacy or reference SQL to `migrations/archive/`.
4. Before every push:
   - `supabase migration list --linked`
   - `supabase db push --linked --dry-run`
5. If drift appears:
   - repair history first (`migration repair`), then push.

## Quick verification commands

```powershell
cd apps/gurudevi-mobile
supabase migration list --linked
supabase db push --linked --dry-run
```

## Anonymous-to-registered conversion checks

After an anonymous user upgrades to email/password, verify:

1. `auth.users` row has:
   - `is_anonymous = false`
   - expected `email`
2. `public.users` row (same id) has:
   - `is_anonymous = false`
   - updated `email`, `full_name`, and role
3. `public.auth_identities` has mapping:
   - `provider='supabase'`
   - `provider_user_id = auth.users.id::text`
