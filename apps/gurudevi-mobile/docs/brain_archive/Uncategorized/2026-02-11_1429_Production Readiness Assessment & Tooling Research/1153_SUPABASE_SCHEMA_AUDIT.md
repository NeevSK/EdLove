# Supabase Schema Audit & Application Support

**Date**: February 11, 2026
**Status**: Analysis of Current State

## 1. Existing Migrations (Implemented Schema)

The following tables are **already defined** in your `supabase/migrations` folder. You do **NOT** need to re-create these if you ran the migrations.

### Core Users
*   `users`: ID, Email, Role, Full Name, School ID
    *   **New**: `onboarding_completed`, `onboarding_completed_at` (Added Feb 08)

### Education Ecology (Classroom)
*   `schools`: ID, Name, Type (National/Provincial), District
*   `classrooms`: ID, Teacher ID, Name, Subject
*   `classroom_students`: Enrollment linking Students <-> Classrooms
*   `lessons`: Content, Title, Published Date
*   `assignments`: Due Date, Max Points
*   `submissions`: Student work, Grades, Feedback

### Self Ecology (Wellbeing)
*   `mood_logs`: User ID, Score (1-5), Note
*   `fire_journal`: Content (encrypted/private), Burn Status

### Community Ecology
*   `announcements`: School-wide messages
*   `community_posts`: (In `community_library_gamification.sql`)
*   `calendar_events`: School schedules

## 2. Gap Analysis (Code vs. Schema)

### Missing in Frontend Types (`src/types`)
The database has these fields, but your TypeScript code doesn't know about them yet:

1.  **Users**: `src/types/User.ts` is missing `onboarding_completed`.
    *   **Impact**: TypeScript errors when trying to read this field, though writing to it via Supabase client works (as it's `any` typed or loosely typed).
    
2.  **Database Types**: `src/types/database.types.ts` is missing.
    *   **Impact**: You are manually typing Supabase responses. We should eventually generate this file from Supabase to get full type safety, but for now, careful manual typing works.

## 3. Recommendation

You asked: *"seems i have to add lot of supabase schemas and unless app might not work as well"*

**Verdict**: **No**, you do not need to add more *schemas* (SQL) for the core features (Onboarding, Home, Mood, Classrooms). They are there.

**What you DO need to add**:
1.  **Frontend Type Definitions**: Update `User.ts` and others to match the SQL.
2.  **UI Logic**: Connect the frontend screens to these existing tables (which is what we are doing in the Onboarding Refinement task).

## 4. Next Steps
We will proceed with the **Onboarding Refinement** which will:
1.  Update `User.ts` to match the `users` table.
2.  Implement the logic to flip the `onboarding_completed` flag in the database (which exists).
