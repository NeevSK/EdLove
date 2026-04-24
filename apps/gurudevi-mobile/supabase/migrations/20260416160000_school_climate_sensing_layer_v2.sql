-- Migration: School Climate Sensing Layer (v2 Refined)
-- Created: 2026-04-16
-- Description: Establishes a two-dimensional sensing layer (Material vs Human)
--              linked to the master edu_schools registry.

-- 1. Cleanup previous preliminary attempt
DROP TABLE IF EXISTS public.edu_school_pulse_logs CASCADE;
DROP TABLE IF EXISTS public.edu_school_climate CASCADE;

-- 2. Create the aggregated Climate table
CREATE TABLE public.edu_school_climate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edu_school_id TEXT NOT NULL UNIQUE REFERENCES public.edu_schools(id) ON DELETE CASCADE,
    census_id TEXT, -- For mapping legacy data
    
    -- Duality Indices
    material_index FLOAT DEFAULT 0.5, -- The 'Ceiling'
    harmony_score FLOAT DEFAULT 0.5,  -- The 'Vibe'
    
    -- Enrichment Meta
    infra_snapshot JSONB DEFAULT '{}'::jsonb, -- { "buildings": "good", "labs": "none" }
    connectivity_metadata JSONB DEFAULT '{}'::jsonb, -- { "wifi": true, "cellular": "4g" }
    
    relational_impedance INTEGER DEFAULT 0,
    pulse_count INTEGER DEFAULT 0,
    last_pulse_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create the Pulse Logs table (Time-Series)
CREATE TABLE public.edu_school_pulse_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edu_school_id TEXT NOT NULL REFERENCES public.edu_schools(id) ON DELETE CASCADE,
    
    -- Context
    dimension TEXT DEFAULT 'general', -- 'material', 'human', 'general'
    score FLOAT NOT NULL,
    
    -- Narrative
    reason_category TEXT,
    detailed_context TEXT,
    
    -- Identity Bridge
    identity_preference TEXT DEFAULT 'anonymous', -- 'anonymous', 'identified'
    author_profile_id UUID, -- Optional link to user profile if identified
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.edu_school_climate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_school_pulse_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Climate summary is readable by authenticated users (internal insights)
CREATE POLICY "Authenticated users can read school climate"
ON public.edu_school_climate FOR SELECT TO authenticated USING (true);

-- Pulse logs are insertable by EVERYONE (including anonymous teachers on marketing site)
CREATE POLICY "Public can create pulse logs"
ON public.edu_school_pulse_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Pulse logs are readable by authenticated users
CREATE POLICY "Authenticated users can read pulse logs"
ON public.edu_school_pulse_logs FOR SELECT TO authenticated USING (true);

-- 6. Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_edu_school_climate_updated_at
BEFORE UPDATE ON public.edu_school_climate
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
