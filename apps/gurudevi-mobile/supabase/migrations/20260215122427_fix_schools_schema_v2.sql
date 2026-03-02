-- Fix Schools Table Schema & Policies
-- Supporting Phase 12 refinements

-- 1. Add missing columns to schools table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='created_by') THEN
        ALTER TABLE public.schools ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='is_sample') THEN
        ALTER TABLE public.schools ADD COLUMN is_sample BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Robust RLS Policies for Schools
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON public.schools;
DROP POLICY IF EXISTS "Users can create their own schools" ON public.schools;
DROP POLICY IF EXISTS "Principals manage their own schools" ON public.schools;

CREATE POLICY "Schools are viewable by authenticated users" 
ON public.schools FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can insert schools" 
ON public.schools FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Anyone authenticated can initialize a sanctuary

CREATE POLICY "Principals manage their own schools" 
ON public.schools FOR ALL 
TO authenticated 
USING (created_by = auth.uid());

-- 3. Ensure users table has school_id column (it should, but just in case)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='school_id') THEN
        ALTER TABLE public.users ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
    END IF;
END $$;
