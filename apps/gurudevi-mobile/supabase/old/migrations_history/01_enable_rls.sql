-- ============================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
-- Run this script first in Supabase SQL Editor to enable RLS
-- Once RLS is enabled, all requests are denied by default until policies are created
-- ============================================================================

-- Core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ALTER TABLE granules ENABLE ROW LEVEL SECURITY;

-- Classroom & enrollment
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;

-- Content & learning
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;

-- Teacher tools
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Community & library
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;

-- Groups & management
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Grading settings
ALTER TABLE classroom_grading_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION: Check which tables have RLS enabled
-- ============================================================================
-- Run this query to verify:
SELECT schemaname, tablename, rowlevelenabled
FROM information_schema.table_privileges
WHERE table_catalog = 'postgres'
ORDER BY schemaname, tablename;
