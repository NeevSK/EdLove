-- ============================================
-- SUPABASE DATABASE AUDIT SCRIPT
-- ============================================
-- Purpose: Generate a comprehensive report of what's currently in your Supabase database
-- Run this in the Supabase SQL Editor to see what's deployed
-- ============================================

-- 1. LIST ALL TABLES IN PUBLIC SCHEMA
SELECT 
  'TABLES' as category,
  table_name,
  NULL as detail
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CHECK RLS STATUS ON ALL TABLES
SELECT 
  'RLS STATUS' as category,
  tablename as table_name,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as detail
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. COUNT POLICIES PER TABLE
SELECT 
  'POLICY COUNT' as category,
  tablename as table_name,
  COUNT(*)::text as detail
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 4. LIST ALL POLICIES (DETAILED)
SELECT 
  'POLICIES' as category,
  tablename || '.' || policyname as table_name,
  cmd || ' - ' || COALESCE(qual::text, 'No USING clause') as detail
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. LIST ALL TRIGGERS
SELECT 
  'TRIGGERS' as category,
  event_object_table as table_name,
  trigger_name || ' (' || action_timing || ' ' || event_manipulation || ')' as detail
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 6. LIST ALL FOREIGN KEY CONSTRAINTS
SELECT 
  'FOREIGN KEYS' as category,
  tc.table_name,
  tc.constraint_name || ': ' || kcu.column_name || ' -> ' || ccu.table_name || '.' || ccu.column_name as detail
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 7. COUNT ROWS IN EACH TABLE (CAUTION: May be slow on large tables)
DO $$
DECLARE
  r RECORD;
  row_count INTEGER;
BEGIN
  FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') LOOP
    EXECUTE 'SELECT COUNT(*) FROM public.' || quote_ident(r.table_name) INTO row_count;
    RAISE NOTICE 'ROW COUNT | % | %', r.table_name, row_count;
  END LOOP;
END $$;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Copy this entire script
-- 2. Open Supabase Dashboard > SQL Editor
-- 3. Paste and run this script
-- 4. Copy the results
-- 5. Share with the assistant for comparison with local files
-- ============================================
