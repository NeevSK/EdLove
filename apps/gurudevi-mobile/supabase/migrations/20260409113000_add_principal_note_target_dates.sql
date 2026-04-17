ALTER TABLE public.principal_notes
    ADD COLUMN IF NOT EXISTS target_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_principal_notes_target_date
    ON public.principal_notes (school_id, target_date DESC);
