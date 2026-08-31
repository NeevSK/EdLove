---
title: "Supabase Migration Status Tracker"
status: "active"
created: 2026-02-11
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Supabase Migration Status Tracker

> **Last Updated:** 2026-07-26

## Purpose
This file tracks which migration files have been applied to your Supabase database. Update this manually after running each migration until you set up Supabase CLI.

## Migration Status

| `20260831090000_editorial_control_plane.sql` | ⏳ | - | Pending: server-owned editorial works, versions, authors, rights agreements, events, distribution deliveries, and private contributor submissions. Apply only after API persistence and production backup review. |

| `20260726000000_feature_access_snapshot_contract.sql` | ⏳ | - | Adds the server-owned `permission_snapshots` and `policy_version` tables bound to the authenticated user and active bond. Apply before enabling scoped offline snapshots. |
| `20260726000001_entity_scoped_permission_snapshots.sql` | ⏳ | - | Makes school context optional because active bonds may represent personal, classroom, community, or group entities. |
| `20260726000002_canonicalize_citizenship_default.sql` | ⏳ | - | Migrates legacy WANDERER values to THIRD_CLASS and changes the database default for authenticated users. |
| `20260726000003_scoped_entitlement_grants.sql` | ⏳ | - | Adds bond/entity-scoped institutional grants without replacing individual FREE/PRO plans. |
| `20260726000004_official_school_invite_claim.sql` | ⏳ | - | Makes official invite/founder bond creation and school-bond revocation the only citizenship-promotion path. |

| Migration File | Applied | Date Applied | Notes |
|----------------|---------|--------------|-------|
| **Foundation Schemas** (from archived docs) | | | |
| `1427_minimal_schema.sql` | ✅ | ~Feb 4-5 | CONFIRMED: schools, users, subscriptions tables exist |
| `1559_sri_lankan_hierarchy_schema_fixed.sql` | ✅ | ~Feb 4-5 | CONFIRMED: sections, grades tables exist with FKs |
| `1559_invite_system_schema_fixed.sql` | ✅ | ~Feb 4-5 | CONFIRMED: invite_codes, profile_completion exist |
| **Migration Files** (supabase/migrations/) | | | |
| `20260205_features_schema.sql` | ✅ | ~Feb 5 | CONFIRMED: classrooms, lessons, assignments, submissions, mood_logs, fire_journal, announcements exist |
| `20260205_auto_create_user.sql` | ⚠️ | ~Feb 5 | LIKELY APPLIED: Check triggers to confirm |
| `20260205_community_library_gamification.sql` | ✅ | ~Feb 5 | CONFIRMED: community_groups, community_posts, library_items, user_rewards, gift_codes exist |
| `20260205_NUCLEAR_RLS_FIX.sql` | ⚠️ | ~Feb 5-7 | LIKELY APPLIED: Part of RLS fix iteration |
| `20260205_fix_rls_recursion.sql` | ⚠️ | ~Feb 5-7 | LIKELY APPLIED: One of several RLS fixes |
| `20260205_fix_school_permissions.sql` | ⚠️ | ~Feb 5-7 | LIKELY APPLIED: Part of permission fixes |
| `20260205_remove_trigger.sql` | ⚠️ | ~Feb 5 | UNKNOWN: Check if trigger still exists |
| `20260206_add_lesson_materials.sql` | ❓ | - | VERIFY: Check if lesson_materials table exists |
| `20260206_progressive_features.sql` | ❓ | - | VERIFY: Check for feature flags/progressive tables |
| `20260206_update_classroom_students.sql` | ❓ | - | VERIFY: Check classroom_students columns |
| `20260207_FINAL_RLS_FIX.sql` | ⚠️ | ~Feb 7 | LIKELY APPLIED: Potentially last RLS fix |
| `20260207_fix_enrollment_rls.sql` | ⚠️ | ~Feb 7 | LIKELY APPLIED: Enrollment FKs exist |
| `20260207_shadow_enrollment.sql` | ❓ | - | VERIFY: Check for shadow enrollment table |
| `20260208_add_daily_content.sql` | ❓ | - | VERIFY: Check for daily content tables |
| `20260208_add_onboarding_fields.sql` | ❓ | - | VERIFY: Check users table columns |
| `20260208_add_thuthimal_fields.sql` | ❌ | - | NOW IN CONSOLIDATED FILE |
| `20260208_create_classroom_photos.sql` | ❌ | - | NOW IN CONSOLIDATED FILE |
| `20260208_enhance_invitations.sql` | ❌ | - | NOW IN CONSOLIDATED FILE (BROKEN - fixed in consolidated) |
| `fix_recursion.sql` | ⚠️ | - | UNKNOWN: Undated, likely superseded by later fixes |
| **Consolidated Migration** | | | |
| `20260211_consolidated_missing_features.sql` | ❌ | - | **READY TO APPLY** - Combines all missing migrations with fixes |

## Legend
- ✅ = Successfully applied
- ❌ = Not yet applied
- ❓ = Unknown status (check database)
- ⚠️ = Applied with errors/warnings
- 🔄 = Rolled back

## Instructions

### Before Applying Migrations
1. **Backup your database** (Supabase Dashboard > Database > Backups)
2. Run `supabase_audit.sql` to document current state
3. Save audit results in this folder as `pre_migration_audit_YYYYMMDD.txt`

### Applying a Migration
1. Open Supabase Dashboard > SQL Editor
2. Copy the migration SQL file contents
3. Paste and run in SQL Editor
4. If successful, update this file:
   - Change ❌ to ✅
   - Add today's date
   - Add any relevant notes
5. Run `supabase_audit.sql` again to verify changes

### After Applying Migrations
1. Run `supabase_audit.sql` to verify
2. Save audit results as `post_migration_audit_YYYYMMDD.txt`
3. Test your app to ensure everything works
4. Commit this file to git with your changes

## Common Issues & Solutions

### "relation already exists" error
- Migration was already applied previously
- Mark as ✅ and add note "Already existed"
- Skip to next migration

### "column already exists" error
- Partial migration applied
- Review which parts succeeded
- Manually apply only the missing parts
- Mark as ⚠️ with detailed notes

### RLS lockout (can't access your own data)
- Check policies with: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
- Temporarily disable RLS: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Fix policies and re-enable
- Document the fix in notes column

## Next Steps

Once you've established the current state:
1. Consider consolidating all foundation schemas into a single `00_baseline_schema.sql`
2. Set up Supabase CLI for automatic migration tracking
3. Integrate migrations into your CI/CD pipeline
## 2026-07-26 lifecycle additions

- `20260726000003_scoped_entitlement_grants.sql` is a reviewed, pending
  migration artifact. It must be applied through the normal deployment
  pipeline after the production database owner confirms the target.
- The table separates individual `FREE`/`PRO` plans from school/institution
  grants, which are evaluated only for the active verified bond/entity.
- No PowerSync deployment or sync-rule mutation was performed in this change.
- `20260726000004_official_school_invite_claim.sql` is also reviewed and
  pending. It must be applied after the scoped-grants migration because school
  claim transactions create institutional grants.
