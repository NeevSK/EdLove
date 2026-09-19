-- Durable, ownership-checked active scope and lifecycle for relationship bonds.
BEGIN;

ALTER TABLE public.bonds
  ADD COLUMN status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN valid_until TIMESTAMPTZ,
  ADD CONSTRAINT bonds_status_check CHECK (status IN ('active', 'archived', 'revoked')),
  ADD CONSTRAINT bonds_validity_window_check CHECK (valid_until IS NULL OR valid_until > valid_from);

ALTER TABLE public.user_preferences
  ADD COLUMN active_bond_id UUID UNIQUE REFERENCES public.bonds(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.guard_user_preferences_active_bond()
RETURNS trigger AS $$
BEGIN
  IF NEW.active_bond_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.bonds b
    WHERE b.id = NEW.active_bond_id
      AND b.user_id = NEW.user_id
      AND b.status = 'active'
      AND b.valid_from <= now()
      AND (b.valid_until IS NULL OR b.valid_until > now())
  ) THEN
    RAISE EXCEPTION 'active_bond_id must reference a currently valid active bond owned by this user'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER user_preferences_active_bond_guard
  BEFORE INSERT OR UPDATE OF active_bond_id, user_id ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_preferences_active_bond();

CREATE OR REPLACE FUNCTION public.clear_invalid_selected_bond()
RETURNS trigger AS $$
BEGIN
  IF NEW.status <> 'active'
    OR NEW.valid_from > now()
    OR (NEW.valid_until IS NOT NULL AND NEW.valid_until <= now())
    OR EXISTS (
      SELECT 1
      FROM public.user_preferences up
      WHERE up.active_bond_id = NEW.id
        AND up.user_id <> NEW.user_id
    ) THEN
    UPDATE public.user_preferences
    SET active_bond_id = NULL, updated_at = now()
    WHERE active_bond_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER bonds_clear_invalid_selected_scope
  AFTER UPDATE OF user_id, status, valid_from, valid_until ON public.bonds
  FOR EACH ROW EXECUTE FUNCTION public.clear_invalid_selected_bond();

CREATE INDEX bonds_user_validity_idx
  ON public.bonds(user_id, status, valid_from, valid_until);

COMMIT;
