-- Relief Assignments: Tracking who covers for absent teachers
CREATE TABLE IF NOT EXISTS public.relief_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    original_teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    relief_teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Resource Inventory Items: Tracking school-wide assets
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- furniture, tech, stationery, etc.
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    condition TEXT DEFAULT 'good', -- new, good, fair, poor, broken
    location TEXT, -- warehouse, classroom-A, etc.
    last_audit_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Resonance (Temporal Tracking / Bi-Temporal History)
-- This automatically creates the _history tables and triggers
SELECT resonance.enable_resonance('public', 'relief_assignments');
SELECT resonance.enable_resonance('public', 'inventory_items');

-- RLS Policies (Principal & Admin access)
ALTER TABLE public.relief_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Principals can manage relief assignments" ON public.relief_assignments
    FOR ALL
    USING (public.get_my_id() IN (SELECT id FROM public.users WHERE school_id = relief_assignments.school_id AND role IN ('principal', 'founder')))
    WITH CHECK (public.get_my_id() IN (SELECT id FROM public.users WHERE school_id = relief_assignments.school_id AND role IN ('principal', 'founder')));

CREATE POLICY "Principals can manage inventory" ON public.inventory_items
    FOR ALL
    USING (public.get_my_id() IN (SELECT id FROM public.users WHERE school_id = inventory_items.school_id AND role IN ('principal', 'founder')))
    WITH CHECK (public.get_my_id() IN (SELECT id FROM public.users WHERE school_id = inventory_items.school_id AND role IN ('principal', 'founder')));

-- RLS policies do not grant table privileges. Keep the Data API ACL aligned
-- with the authenticated principal/admin policies above.
REVOKE ALL ON TABLE public.relief_assignments, public.inventory_items FROM anon;
REVOKE ALL ON TABLE public.relief_assignments, public.inventory_items FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.relief_assignments, public.inventory_items TO authenticated;
