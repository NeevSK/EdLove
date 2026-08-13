-- PowerSync logical replication publication for the first offline vertical slice.
-- Keep this list explicit: adding a table to local schema must be an intentional
-- sync-scope decision, not an accidental publication of the whole database.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'powersync'
  ) THEN
    CREATE PUBLICATION powersync FOR TABLE
      public.bonds,
      public.school_memberships,
      public.classrooms,
      public.classroom_students;
  END IF;
END
$$;

ALTER TABLE public.bonds REPLICA IDENTITY FULL;
ALTER TABLE public.school_memberships REPLICA IDENTITY FULL;
ALTER TABLE public.classrooms REPLICA IDENTITY FULL;
ALTER TABLE public.classroom_students REPLICA IDENTITY FULL;
