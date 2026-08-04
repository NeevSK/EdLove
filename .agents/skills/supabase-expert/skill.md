---
title: Supabase Database and Security Expert
description: Guides the agent through safe database schema changes, SQL migrations, RLS (Row Level Security) safety audits, and generating TypeScript types.
triggers:
  - "supabase schema change"
  - "database migration"
  - "add new table to supabase"
  - "audit RLS policies"
  - "generate types for supabase"
---

# Supabase Database & Security Skill Playbook

Use this skill when implementing schema updates, modifying security policies, or writing Edge Functions in the `apps/gurudevi-mobile/supabase` directory.

## Step-by-Step Procedure

### 1. Design & Plan
- Define the minimal schema addition or modification.
- Always implement **Row Level Security (RLS)** for any new table. Do NOT leave a table without RLS.
- Choose clean, descriptive naming conventions matching the existing database (snake_case for columns/tables).

### 2. Generate and Apply SQL Migrations
- Write migrations as incremental, safe, roll-forward DDL scripts under `apps/gurudevi-mobile/supabase/migrations/`.
- Ensure migrations are repeatable and contain `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, etc.
- Use `default_api:mcp_supabase_apply_migration` to dry-run and apply migrations to the development database branch.

### 3. Row-Level Security (RLS) Safety Audit
- Write explicit `CREATE POLICY` statements.
- Never write `TO public` without strict read-only constraints.
- Run `default_api:mcp_supabase_get_advisors` with `type: "security"` to catch any missing policies.

### 4. Re-Generate TypeScript Types
- Always re-generate TypeScript types after making schema changes to maintain compile-time safety.
- Run:
  ```powershell
  pnpm --filter platform-mcp run generate-types
  ```
  or execute `default_api:mcp_supabase_generate_typescript_types` to refresh type definitions.

## Recommended Recipes

### Creating a New Table
```sql
-- 1. Table definition
CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 3. Policy definition
CREATE POLICY "Users can only manage their own records"
  ON public.new_table
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```
