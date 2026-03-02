-- ========================================================
-- LIBRARY SCHEMA ALIGNMENT (v4.0)
-- Aligning 'library_items' with 'library_resources' API
-- ========================================================

-- 1. Rename existing tables and columns for alignment
ALTER TABLE IF EXISTS public.library_items RENAME TO library_resources;
ALTER TABLE IF EXISTS public.library_collections RENAME TO resource_collections;
ALTER TABLE IF EXISTS public.library_collection_items RENAME TO collection_resources;

-- Update foreign key references and constraints if needed (Supabase usually handles this, but let's be explicit)
ALTER TABLE public.library_resources RENAME COLUMN uploader_id TO creator_id;
ALTER TABLE public.library_resources RENAME COLUMN resource_url TO url;
ALTER TABLE public.library_resources RENAME COLUMN resource_type TO type;

-- 2. Add missing columns for the "Map" and "Enrichment" vision
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS creator_name TEXT;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS creator_role TEXT;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS grades INTEGER[] DEFAULT '{}';
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'intermediate';
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'si';
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id);
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS curriculum_aligned BOOLEAN DEFAULT false;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS copyright_notice TEXT;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS endorsements INTEGER DEFAULT 0;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS bookmarks INTEGER DEFAULT 0;

-- 3. Add pgvector support for semantic search
-- Check if extension exists first
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS embedding vector(1536); -- Standard Anthropic/OpenAI size

-- 4. Resource Engagements Table (If not in baseline)
CREATE TABLE IF NOT EXISTS public.resource_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.library_resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL, -- 'view', 'use', 'endorse', 'bookmark'
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS Policies for the new world
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_engagements ENABLE ROW LEVEL SECURITY;

-- 6. Helper Functions for Counters
CREATE OR REPLACE FUNCTION increment_resource_views(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE library_resources SET views = views + 1 WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_resource_endorsements(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE library_resources SET endorsements = endorsements + 1 WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_resource_endorsements(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE library_resources SET endorsements = GREATEST(0, endorsements - 1) WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;
