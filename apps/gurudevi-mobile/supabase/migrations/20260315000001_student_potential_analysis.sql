-- Student Potential Analysis Migration
-- Adds support for holistic, multi-perspective child analysis for teachers.

CREATE TABLE IF NOT EXISTS public.student_potential_analysis (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    
    -- Potential Dimensions (0-100 scale)
    cognitive_flow INTEGER DEFAULT 50 CHECK (cognitive_flow >= 0 AND cognitive_flow <= 100),
    emotional_resonance INTEGER DEFAULT 50 CHECK (emotional_resonance >= 0 AND emotional_resonance <= 100),
    social_weaving INTEGER DEFAULT 50 CHECK (social_weaving >= 0 AND social_weaving <= 100),
    creative_spark INTEGER DEFAULT 50 CHECK (creative_spark >= 0 AND creative_spark <= 100),
    practical_mastery INTEGER DEFAULT 50 CHECK (practical_mastery >= 0 AND practical_mastery <= 100),
    
    -- Qualitative Insights
    silver_lining TEXT,
    potential_notes JSONB DEFAULT '[]'::JSONB,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure one analysis per teacher per student in a classroom (can be updated over time)
    UNIQUE(student_id, teacher_id, classroom_id)
);

-- Enable RLS
ALTER TABLE public.student_potential_analysis ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Teachers can manage their own analyses
CREATE POLICY "Teachers can manage their own analyses" 
    ON public.student_potential_analysis
    FOR ALL 
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

-- 2. Principals and Grade Heads can view all analyses in their school
-- (Assuming school_id is available on the user or classroom - for now keep it simple)
CREATE POLICY "School leadership can view analyses"
    ON public.student_potential_analysis
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('principal', 'grade_head', 'developer')
        )
    );

-- 3. Students can view their own analyses if shared (default always visible for now)
CREATE POLICY "Students can view their own analyses"
    ON public.student_potential_analysis
    FOR SELECT
    USING (auth.uid() = student_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_potential_analysis_updated_at
    BEFORE UPDATE ON public.student_potential_analysis
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- RPC for atomic upsert
CREATE OR REPLACE FUNCTION upsert_student_potential_analysis(
    p_student_id UUID,
    p_classroom_id UUID,
    p_cognitive_flow INTEGER,
    p_emotional_resonance INTEGER,
    p_social_weaving INTEGER,
    p_creative_spark INTEGER,
    p_practical_mastery INTEGER,
    p_silver_lining TEXT
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO public.student_potential_analysis (
        student_id, teacher_id, classroom_id, 
        cognitive_flow, emotional_resonance, social_weaving, creative_spark, practical_mastery,
        silver_lining
    )
    VALUES (
        p_student_id, auth.uid(), p_classroom_id,
        p_cognitive_flow, p_emotional_resonance, p_social_weaving, p_creative_spark, p_practical_mastery,
        p_silver_lining
    )
    ON CONFLICT (student_id, teacher_id, classroom_id) DO UPDATE SET
        cognitive_flow = EXCLUDED.cognitive_flow,
        emotional_resonance = EXCLUDED.emotional_resonance,
        social_weaving = EXCLUDED.social_weaving,
        creative_spark = EXCLUDED.creative_spark,
        practical_mastery = EXCLUDED.practical_mastery,
        silver_lining = EXCLUDED.silver_lining,
        updated_at = now()
    RETURNING to_jsonb(student_potential_analysis.*) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
