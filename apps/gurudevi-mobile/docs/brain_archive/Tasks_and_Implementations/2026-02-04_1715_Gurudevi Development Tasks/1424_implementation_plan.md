# Supabase Database Setup Plan

## Current Status

✅ Supabase connection working  
✅ App loads successfully  
❌ No database tables (can't create account)  

## Goal

Set up the minimal database schema needed for authentication, then add feature tables incrementally.

## Why Minimal is SAFE (Addressing Your Concerns)

### ✅ What We're Doing (Safe - Additive)
**Adding NEW tables** that reference existing ones

Example: Today we create `schools` and `users`. Tomorrow:
```sql
CREATE TABLE classrooms (
  school_id UUID REFERENCES schools(id),  -- Uses existing table
  teacher_id UUID REFERENCES users(id)    -- Uses existing table
);
```
**Result**: Nothing breaks. Zero modifications needed.

### ❌ What We're NOT Doing (Dangerous - Modifications)
**Changing existing table structures**

```sql
ALTER TABLE users DROP COLUMN email;  -- ❌ BREAKS EVERYTHING
ALTER TABLE users ALTER COLUMN role TYPE integer;  -- ❌ BREAKS EVERYTHING
```

### The Foundation Tables

These 3 tables won't need modification:

1. **`schools`** - Root tenant (id, name, type, district)
   - Future tables just reference it: `classroom.school_id → schools.id`
   
2. **`users`** - User profiles (id, school_id, role, email)
   - Future tables just reference it: `lesson.created_by → users.id`
   
3. **`subscriptions`** - Tier tracking (user_id, tier, status)
   - Features just check it: `if (tier === 'premium') { ... }`

**See `path_dependence_explained.md` for detailed examples.**

---

## Proposed Changes

### Tables to Create

#### 1. `schools` Table
Multi-tenant root - each school is a separate tenant

```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('government', 'private', ...)),
  district TEXT,
  ...
);
```

#### 2. `users` Table
Extends Supabase auth.users with app-specific data

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  school_id UUID REFERENCES schools(id) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'principal')),
  language TEXT DEFAULT 'si',
  ...
);
```

#### 3. `subscriptions` Table
Tracks pricing tiers (free/pro/premium)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier TEXT CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT DEFAULT 'active',
  ...
);
```

### Row-Level Security (RLS)

Each table gets policies:
- **School isolation**: Users only see data from their school
- **Self-access**: Users can update own profile
- **Signup**: Allow table inserts during registration

### Automatic Features

- **UUID generation**: `uuid_generate_v4()` for all IDs
- **Updated timestamps**: Auto-update `updated_at` on changes
- **Free tier**: New users automatically get free subscription

---

## Implementation Steps

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the SQL Script

1. Open the file `minimal_schema.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables Created

Run this verification query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('schools', 'users', 'subscriptions');
```

Expected result: 3 rows (schools, users, subscriptions)

### Step 4: Test Sign Up

1. Open Gurudevi app
2. Tap "Sign Up"
3. Fill in:
   - Email: your email
   - Password: secure password
   - Full Name: your name
   - Role: Teacher or Principal
   - Language: Sinhala/Tamil/English
4. Submit

**Expected**: Account created! ✅  
**If error**: Check Supabase logs (Dashboard → Logs → API)

---

## Verification Plan

### Automated Checks

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Manual Testing

1. ✅ Sign up succeeds
2. ✅ Can log in with created account
3. ✅ Profile shows correct name, role, language
4. ✅ Can log out and log back in
5. ✅ App remembers session (close app, reopen → still logged in)

---

## Next Steps After Minimal Setup

### If Everything Works:

1. Test the foundation thoroughly
2. Add feature tables as needed:
   - Week 2: `classrooms`, `classroom_students`
   - Week 3: `lessons`, `assignments`, `submissions`
   - Week 4: `mood_logs`, `self_reflections`, `announcements`

### Adding More Tables Later (Example):

```sql
-- This is SAFE - just creates new table, doesn't modify existing
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_isolation"
  ON classrooms FOR SELECT
  USING (school_id IN (SELECT school_id FROM users WHERE id = auth.uid()));
```

**Time to add**: ~5 minutes  
**Risk of breaking existing code**: Zero  

---

## What If Something Goes Wrong?

### Issue: Sign up fails

1. Check Supabase logs: Dashboard → Logs → API
2. Look for error message
3. Common fixes:
   - RLS policy too restrictive → Adjust policy
   - Missing column → Add column to schema
   - FK constraint violation → Check school exists

### Issue: Can't see users table

1. RLS is blocking you → Run queries as service_role in SQL Editor
2. Add policy to allow viewing

### Rollback (Nuclear Option):

If you want to start over:

```sql
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
```

Then re-run the minimal schema SQL.

---

## Files Created

- [`minimal_schema.sql`](file:///C:/Users/Naween/.gemini/antigravity/brain/426210bd-da2b-48cd-8376-cb5dc369fc5b/minimal_schema.sql) - SQL script to run in Supabase
- [`path_dependence_explained.md`](file:///C:/Users/Naween/.gemini/antigravity/brain/426210bd-da2b-48cd-8376-cb5dc369fc5b/path_dependence_explained.md) - Detailed safety explanation
