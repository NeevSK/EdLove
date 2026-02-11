-- ============================================
-- VERIFICATION QUERIES FOR REMAINING MIGRATIONS
-- ============================================
-- Run these queries to determine which Feb 6-8 migrations have been applied
-- Copy and paste each section into Supabase SQL Editor
-- ============================================

-- 1. CHECK FOR LESSON_MATERIALS TABLE (20260206_add_lesson_materials.sql)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'lesson_materials'
    ) THEN '✅ lesson_materials table EXISTS'
    ELSE '❌ lesson_materials table DOES NOT EXIST'
  END as result;

-- 2. CHECK FOR CLASSROOM_PHOTOS TABLE (20260208_create_classroom_photos.sql)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'classroom_photos'
    ) THEN '✅ classroom_photos table EXISTS'
    ELSE '❌ classroom_photos table DOES NOT EXIST'
  END as result;

-- 3. CHECK FOR DAILY CONTENT TABLES (20260208_add_daily_content.sql)
SELECT 
  table_name,
  '✅ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%daily%'
ORDER BY table_name;
-- If no results, daily content tables don't exist

-- 4. CHECK FOR SHADOW ENROLLMENT TABLE (20260207_shadow_enrollment.sql)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%shadow%'
    ) THEN '✅ shadow enrollment table EXISTS'
    ELSE '❌ shadow enrollment table DOES NOT EXIST'
  END as result;

-- 5. CHECK FOR PROGRESSIVE FEATURES TABLE (20260206_progressive_features.sql)
SELECT 
  table_name,
  '✅ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%feature%' OR table_name LIKE '%progressive%')
ORDER BY table_name;
-- If no results, progressive features tables don't exist

-- 6. CHECK USERS TABLE COLUMNS (for onboarding & thuthimal fields)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Look for columns like:
-- - onboarding_* (20260208_add_onboarding_fields.sql)
-- - thuthimal_* (20260208_add_thuthimal_fields.sql)

-- 7. CHECK INVITE_CODES TABLE COLUMNS (for enhanced invitations)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'invite_codes'
ORDER BY ordinal_position;

-- 8. CHECK CLASSROOM_STUDENTS TABLE COLUMNS (for updates)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'classroom_students'
ORDER BY ordinal_position;

-- 9. LIST ALL TABLES (comprehensive check)
SELECT 
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 10. CHECK ALL TRIGGERS (to verify auto_create_user and others)
SELECT 
  trigger_name,
  event_object_table,
  action_timing || ' ' || event_manipulation as trigger_type
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Copy each query above
-- 2. Run in Supabase SQL Editor
-- 3. Save results
-- 4. Share with the assistant to finalize migration status
-- ============================================
