-- Restore a scoped policy for the modeled inventory_items table.
-- The previous table was RLS-enabled with no live policies, which made every
-- authenticated access fail closed. This table is school-scoped; classroom_inventory
-- is a separate legacy/code-path naming issue and is not silently treated as the
-- same relation here.

BEGIN;

DROP POLICY IF EXISTS "inventory_items_school_read" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_items_school_manage" ON public.inventory_items;

CREATE POLICY "inventory_items_school_read"
  ON public.inventory_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_type = 'PLATFORM'
        AND b.capacity = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_type = 'SCHOOL'
        AND b.entity_id = inventory_items.school_id::text
    )
  );

CREATE POLICY "inventory_items_school_manage"
  ON public.inventory_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_type = 'PLATFORM'
        AND b.capacity = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_type = 'SCHOOL'
        AND b.entity_id = inventory_items.school_id::text
        AND b.capacity IN ('principal', 'teacher')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_type = 'PLATFORM'
        AND b.capacity = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM public.bonds b
      WHERE b.user_id = auth.uid()
        AND b.entity_type = 'SCHOOL'
        AND b.entity_id = inventory_items.school_id::text
        AND b.capacity IN ('principal', 'teacher')
    )
  );

COMMIT;
