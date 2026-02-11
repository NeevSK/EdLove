# Supabase Schema Audit & Sync

## Overview
Audit local Supabase schema files and compare with deployed state to establish synchronization strategy.

## Tasks

### [x] Discovery Phase
- [x] Find all Supabase schema/migration files in the codebase
- [x] Identify database configuration files
- [x] Locate any existing migration tools or scripts


### [x] Audit & Analysis
- [x] Document what schemas/tables are defined locally
- [x] Check current Supabase database state
- [x] Create comparison report (local vs. remote)

### [x] Synchronization Strategy
- [x] Establish migration workflow
- [x] Create deployment scripts if needed
- [x] Document the sync process


### [/] Implementation
- [x] Reset Supabase Database (Nuclear Option)
- [x] Apply Master Baseline schema (00_master_baseline.sql)
- [x] Verify database state
- [x] Install Supabase CLI (pnpm)
- [x] Initialize Supabase configuration
- [x] Login to Supabase
- [x] Link project to hosted Supabase instance
- [x] Repair migration history (Baseline)
- [x] Fix RLS recursion in `users` table
- [x] Implement "Failsafe Design" in Onboarding
- [x] Add Back button to Onboarding flow
- [x] Fix RLS Recursion v2 (SECURITY DEFINER + INSERT policy)
- [x] Redesign Onboarding UI (Skip top-right, Back/Forward bottom)
- [x] Expand User Role Constraints (Add founder/admin)
- [x] Fix Profile Screen Render Error (Export Progress components)
- [x] Fix Self Screen Render Error (Export Slider components)
- [x] Consolidate Baseline Schema & Archive Migrations
- [x] Implement Landing Flow (WelcomeScreen)
- [x] Fix UI Abstraction Layer (Direct Exports)
- [ ] Refine Auth Pipeline (Welcome -> Onboarding -> Guest Home -> Auth)
- [ ] Implement Guest Terms Acceptance
- [ ] Create SanctuaryLock component
- [ ] Fix Schema Crash (Add schools.created_by - *On Hold*)
- [ ] Pull existing schema (Requires Docker)

### [x] Cleanup Tasks
- [x] Create supabase/old folder
- [x] Design consolidated Master Terrain
- [x] Archive old migration files
- [x] Move duplicate classrooms_schema.sql
- [x] Verify migrations folder only contains canonical migrations (00_master_baseline.sql)
- [x] Update documentation (walkthrough)
- [x] Move implementation plan to project docs (`docs/current_progress/`)
