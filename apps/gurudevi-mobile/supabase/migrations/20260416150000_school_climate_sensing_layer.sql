-- Migration: School Climate Sensing Layer
-- Created: 2026-04-16
-- Description: Establishes the edu_school_climate and edu_school_pulse_logs tables 
--              to capture environment psychodynamics and the 'Congeniality' metric.

-- 1. Create the aggregated Climate table
CREATE TABLE IF NOT EXISTS public.edu_school_climate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL UNIQUE REFERENCES public.schools(id) ON DELETE CASCADE,
    census_id TEXT, -- For mapping legacy data
    congeniality_score FLOAT DEFAULT 0.5,
    difficulty_index JSONB DEFAULT '{}'::jsonb,
    relational_impedance INTEGER DEFAULT 0,
    pulse_count INTEGER DEFAULT 0,
    last_pulse_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create the Pulse Logs table (Anonymous contributions)
CREATE TABLE IF NOT EXISTS public.edu_school_pulse_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    difficulty JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.edu_school_climate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_school_pulse_logs ENABLE ROW LEVEL SECURITY;

-- 4. Set default RLS policies (Will be hardened by ZenStack later)
-- Read policy for authenticated users
CREATE POLICY "Authenticated users can read school climate"
ON public.edu_school_climate
FOR SELECT
TO authenticated
USING (true);

-- Create policy for teachers to log pulses
CREATE POLICY "Authenticated users can create pulse logs"
ON public.edu_school_pulse_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admins have full access to climate data"
ON public.edu_school_climate
TO authenticated
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'authority') = 'admin')
WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb ->> 'authority') = 'admin');

-- 5. Trigger for updated_at
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
