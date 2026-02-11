# Supabase Schema Audit Walkthrough

## What We Accomplished

Successfully audited your Supabase database schema situation and established clear tracking for future migrations.

### 📊 Key Findings

**Database Status: ✅ Healthy & Well-Populated**
- **25+ tables** deployed across all major feature areas
- Core foundation, classrooms, community, library, and gamification features all present
- Row Level Security (RLS) enabled on tables

**Migration History: ⚠️ Partially Tracked**
- 6 migrations **confirmed applied** (foundation schemas + core features)
- 7 migrations **likely applied** (RLS fixes and triggers)  
- 7 migrations **need verification** (Feb 6-8 additions)

---

## Files Created

### 1. Database Comparison Report
[database_comparison.md](file:///C:/Users/Naween/.gemini/antigravity/brain/f01f7ce8-d7f5-458a-a9b3-a81b00f665e3/database_comparison.md)

Comprehensive analysis comparing your deployed database state against local migration files. Shows:
- Complete inventory of 25 deployed tables organized by feature area
- Confidence levels for which migrations have been applied
- Recommendations for next steps

### 2. Migration Status Tracker  
[migration_status.md](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/supabase/migration_status.md)

Living document tracking migration application status. Updated with audit findings:
- ✅ 6 confirmed applied migrations
- ⚠️ 7 likely applied migrations
- ❓ 7 migrations requiring verification

### 3. Database Audit Script
[supabase_audit.sql](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/supabase/supabase_audit.sql)

Comprehensive SQL queries to audit your Supabase database:
- Lists all tables and their RLS status
- Counts policies per table
- Shows all triggers and foreign keys
- Provides row counts

### 4. Verification Queries
[verify_migrations.sql](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/supabase/verify_migrations.sql)

Targeted queries to check the 7 uncertain migrations:
- Checks for specific tables (lesson_materials, classroom_photos, daily content, etc.)
- Inspects column additions to existing tables
- Verifies triggers

### 5. Migration Helper Script
[apply_migrations.ps1](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/supabase/apply_migrations.ps1)

PowerShell utility to help manage migrations:
- List all migration files
- Show migration status
- Display migration content
- Copy migration SQL to clipboard

---

## Confirmed Applied Migrations ✅

Based on your database audit showing existing foreign keys, these migrations are **definitely deployed**:

| Migration | Evidence |
|-----------|----------|
| **1427_minimal_schema.sql** | Tables: schools, users, subscriptions |
| **1559_sri_lankan_hierarchy_schema_fixed.sql** | Tables: sections, grades + FKs |
| **1559_invite_system_schema_fixed.sql** | Tables: invite_codes, profile_completion |
| **20260205_features_schema.sql** | Tables: classrooms, lessons, assignments, submissions, mood_logs, fire_journal, announcements |
| **20260205_community_library_gamification.sql** | Tables: community_groups, community_posts, library_items, library_collections, user_rewards, gift_codes |

**These should NOT be re-applied** - they would cause "table already exists" errors.

---

## Migrations Needing Verification ❓

Run the queries in `verify_migrations.sql` to check these:

1. `20260206_add_lesson_materials.sql` - Check for lesson_materials table
2. `20260206_progressive_features.sql` - Check for feature flags tables
3. `20260206_update_classroom_students.sql` - Check classroom_students columns
4. `20260207_shadow_enrollment.sql` - Check for shadow enrollment table
5. `20260208_add_daily_content.sql` - Check for daily content tables
6. `20260208_add_onboarding_fields.sql` - Check users table columns
7. `20260208_add_thuthimal_fields.sql` - Check users table columns
8. `20260208_create_classroom_photos.sql` - Check for classroom_photos table
9. `20260208_enhance_invitations.sql` - Check invite_codes columns

---

## Next Steps

### Option 1: Quick Path (Recommended)
1. Run `verify_migrations.sql` queries in Supabase SQL Editor
2. Share results with me
3. I'll identify which migrations need to be applied
4. Apply only the missing ones

### Option 2: Comprehensive Path
1. Run verification queries
2. Create `supabase/old/` folder
3. Archive old schema files from docs
4. Consolidate into a single baseline migration
5. Set up Supabase CLI for automatic tracking

---

## Cleanup Plan (Per Your Request)

You mentioned wanting to create `supabase/old/` folder and move old files. Here's the plan:

### Files to Archive
Move these to `supabase/old/`:
- `docs/sql/classrooms_schema.sql` (duplicate/alternative version)
- Archived schemas from `Docs v 3.0/brain_archive/`:
  - `1427_minimal_schema.sql`
  - `1559_sri_lankan_hierarchy_schema_fixed.sql`
  - `1559_invite_system_schema_fixed.sql`
  - Other older schema files

### Files to Keep in `supabase/migrations/`
Keep all 19 timestamped migration files as-is. These are your official migration history.

### Recommended Structure After Cleanup
```
supabase/
├── migrations/           # Active migrations (keep as-is)
│   ├── 20260205_*.sql
│   ├── 20260206_*.sql
│   ├── 20260207_*.sql
│   └── 20260208_*.sql
├── old/                  # Archived (create this)
│   ├── archived_schemas/
│   │   ├── 1427_minimal_schema.sql
│   │   ├── 1559_sri_lankan_hierarchy_schema_fixed.sql
│   │   └── 1559_invite_system_schema_fixed.sql
│   └── alternate_versions/
│       └── classrooms_schema.sql
├── migration_status.md   # Track applied migrations
├── supabase_audit.sql    # Audit script
├── verify_migrations.sql # Verification queries
└── apply_migrations.ps1  # Helper script
```

---

## Mission Accomplished: The Terrain is Clear 🏔️

We have successfully navigated the Supabase schema dilemma. 

### 🗺️ The New Map
- **[00_master_baseline.sql](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/supabase/migrations/00_master_baseline.sql)**: Your single source of truth.
- **`supabase/old/`**: Your library of past history, safely archived.

#### Onboarding Fixes & Failsafe Design
- **Recursion Resolved**: Fixed an RLS loop on the `users` table that was blocking onboarding completion.
- **Back Button**: Added a "Back" button to the onboarding flow for better navigation.
- **Failsafe Design**: Implemented `AsyncStorage` persistence. If the app closes or crashes mid-onboarding, your name, role, and current screen are saved and restored automatically.

## Benefits of the Current State
1. **Single Source of Truth**: `00_master_baseline.sql` contains the complete schema.
2. **Professional Tracking**: Supabase CLI is now linked and tracking every change.
3. **Resilient UX**: Onboarding is now robust against errors and interruptions.

Enjoy the clean terrain!

The main blocker was lack of migration tracking. Now you have:
- Clear visibility into what's deployed
- Tools to verify remaining uncertainties
- System to track future migrations
- Plan to clean up old files
