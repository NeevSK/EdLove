-- The schema reconciliation migration enabled RLS on these tables but did
-- not add policies. Keep the database policy surface aligned with the
-- corresponding ZenStack @@allow rules.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'classroom_grading_settings' AND policyname = 'classroom_grading_settings_read') THEN
    CREATE POLICY classroom_grading_settings_read ON public.classroom_grading_settings
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND (c.teacher_id = auth.uid() OR c.is_archived = false)));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'classroom_grading_settings' AND policyname = 'classroom_grading_settings_manage') THEN
    CREATE POLICY classroom_grading_settings_manage ON public.classroom_grading_settings
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'calendar_events' AND policyname = 'calendar_events_read') THEN
    CREATE POLICY calendar_events_read ON public.calendar_events
      FOR SELECT TO authenticated
      USING (is_public OR school_id IN (SELECT u.school_id FROM public.users u WHERE u.id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'calendar_events' AND policyname = 'calendar_events_admin') THEN
    CREATE POLICY calendar_events_admin ON public.calendar_events
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.bonds b WHERE b.user_id = auth.uid() AND b.entity_type = 'PLATFORM' AND b.capacity = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.bonds b WHERE b.user_id = auth.uid() AND b.entity_type = 'PLATFORM' AND b.capacity = 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'invoices_customer_or_admin') THEN
    CREATE POLICY invoices_customer_or_admin ON public.invoices
      FOR ALL TO authenticated
      USING (customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.bonds b WHERE b.user_id = auth.uid() AND b.entity_type = 'PLATFORM' AND b.capacity = 'admin'))
      WITH CHECK (customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.bonds b WHERE b.user_id = auth.uid() AND b.entity_type = 'PLATFORM' AND b.capacity = 'admin'));
  END IF;
END
$$;

-- Financial, payment, gift, receipt, and audit tables are platform-admin
-- surfaces in schema.zmodel. A policy is intentionally present even when the
-- caller is not an admin: RLS remains deny-by-default for normal users.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'accounts', 'financial_transactions', 'ledger_entries', 'budgets',
    'pro_gifts', 'payment_intents', 'receipts', 'sentinel_audit_logs'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name AND policyname = table_name || '_platform_admin'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.bonds b WHERE b.user_id = auth.uid() AND b.entity_type = ''PLATFORM'' AND b.capacity = ''admin'')) WITH CHECK (EXISTS (SELECT 1 FROM public.bonds b WHERE b.user_id = auth.uid() AND b.entity_type = ''PLATFORM'' AND b.capacity = ''admin''))',
        table_name || '_platform_admin', table_name
      );
    END IF;
  END LOOP;
END
$$;
