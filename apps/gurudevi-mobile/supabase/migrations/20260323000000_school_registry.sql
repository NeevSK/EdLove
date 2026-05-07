-- Create school_registry table for high-performance school lookup and signup suggestions
CREATE TABLE IF NOT EXISTS public.school_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    census_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    tel_no TEXT,
    email TEXT,
    province TEXT,
    district TEXT,
    zone TEXT,
    division TEXT,
    medium TEXT,
    gender TEXT,
    category TEXT, -- National / Provincial
    type TEXT, -- 1AB, 1C, Type 2, Type 3
    grade_span TEXT,
    total_students INTEGER,
    difficulty_level TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable pg_trgm for fast text search if not enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_registry_name_trgm ON public.school_registry USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_school_registry_census_id ON public.school_registry (census_id);
CREATE INDEX IF NOT EXISTS idx_school_registry_geo_params ON public.school_registry (province, district, zone);

-- RLS Policies (Public read for signup suggestions)
ALTER TABLE public.school_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to school registry"
    ON public.school_registry
    FOR SELECT
    USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_school_registry_updated_at
    BEFORE UPDATE ON public.school_registry
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
