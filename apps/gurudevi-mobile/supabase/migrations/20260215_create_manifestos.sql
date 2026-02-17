-- Migration: Create Sanctuary Manifestos system
-- Description: Foundation for collaborative school goals and collaborative vision.

-- 1. Sanctuary Manifestos
CREATE TABLE IF NOT EXISTS public.sanctuary_manifestos (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Removed NOT NULL to allow SET NULL
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    vibe TEXT DEFAULT 'visionary', -- 'visionary', 'supportive', 'academic', 'wellbeing'
    status TEXT DEFAULT 'active', -- 'active', 'archived', 'fulfilled'
    target_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Manifesto Endorsements (Peer Support)
CREATE TABLE IF NOT EXISTS public.manifesto_endorsements (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    manifesto_id UUID NOT NULL REFERENCES public.sanctuary_manifestos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    commitment_text TEXT, -- Optional personal commitment to the goal
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(manifesto_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE public.sanctuary_manifestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesto_endorsements ENABLE ROW LEVEL SECURITY;

-- 4. Basic Policies (to be refined)
CREATE POLICY "Users can view manifestos in their school" 
ON public.sanctuary_manifestos FOR SELECT 
USING (school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Principals and Admins can create manifestos" 
ON public.sanctuary_manifestos FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('principal', 'admin', 'founder')
        AND school_id = sanctuary_manifestos.school_id -- Enforce same school
    )
);

CREATE POLICY "Users can endorse manifestos in their school" 
ON public.manifesto_endorsements FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sanctuary_manifestos m
        JOIN public.users u ON m.school_id = u.school_id
        WHERE m.id = manifesto_id AND u.id = auth.uid()
    )
);

CREATE POLICY "Users can view endorsements in their school"
ON public.manifesto_endorsements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.sanctuary_manifestos m
        JOIN public.users u ON m.school_id = u.school_id
        WHERE m.id = manifesto_id AND u.id = auth.uid()
    )
);
