BEGIN;

DO $$
BEGIN
  IF current_database() <> 'gurudevi_foundation_test' THEN
    RAISE EXCEPTION 'Library alignment rehearsal requires the isolated foundation database';
  END IF;

  IF EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations
    WHERE version = '20260302094048'
  ) THEN
    RAISE EXCEPTION 'This fixture requires library alignment migration to be unapplied';
  END IF;

  IF to_regclass('public.library_items') IS NULL
     OR to_regclass('public.library_collections') IS NULL
     OR to_regclass('public.library_collection_items') IS NULL
     OR to_regclass('public.library_resources') IS NOT NULL THEN
    RAISE EXCEPTION 'This fixture requires the original library baseline tables';
  END IF;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;
SELECT plan(10);

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('f0510000-0000-4000-8000-000000000001', 'library-alignment@example.invalid', '{}');

INSERT INTO public.library_items (id, uploader_id, title, file_url) VALUES
  ('f0520000-0000-4000-8000-000000000001', 'f0510000-0000-4000-8000-000000000001',
   'Alignment sentinel', 'https://example.invalid/library/sentinel.pdf');

INSERT INTO public.library_collections (id, user_id, name) VALUES
  ('f0530000-0000-4000-8000-000000000001', 'f0510000-0000-4000-8000-000000000001', 'Alignment collection');

INSERT INTO public.library_collection_items (id, collection_id, item_id) VALUES
  ('f0540000-0000-4000-8000-000000000001', 'f0530000-0000-4000-8000-000000000001',
   'f0520000-0000-4000-8000-000000000001');

\ir ../../migrations/20260302094048_library_alignment_v3.sql

SELECT ok(to_regclass('public.library_resources') IS NOT NULL
  AND to_regclass('public.library_items') IS NULL, 'library table is renamed');
SELECT is((SELECT url FROM public.library_resources WHERE id = 'f0520000-0000-4000-8000-000000000001'),
  'https://example.invalid/library/sentinel.pdf', 'original file URL is preserved as url');
SELECT is((SELECT creator_id FROM public.library_resources WHERE id = 'f0520000-0000-4000-8000-000000000001'),
  'f0510000-0000-4000-8000-000000000001'::uuid, 'original uploader ownership is preserved as creator');
SELECT is((SELECT type FROM public.library_resources WHERE id = 'f0520000-0000-4000-8000-000000000001'),
  NULL::text, 'new resource type remains unknown instead of being invented');
SELECT ok(to_regclass('public.resource_collections') IS NOT NULL
  AND to_regclass('public.library_collections') IS NULL, 'collection table is renamed');
SELECT ok(to_regclass('public.collection_resources') IS NOT NULL
  AND to_regclass('public.library_collection_items') IS NULL, 'collection membership table is renamed');
SELECT is((SELECT collection_id FROM public.collection_resources WHERE id = 'f0540000-0000-4000-8000-000000000001'),
  'f0530000-0000-4000-8000-000000000001'::uuid, 'collection membership retains its collection');
SELECT is((SELECT item_id FROM public.collection_resources WHERE id = 'f0540000-0000-4000-8000-000000000001'),
  'f0520000-0000-4000-8000-000000000001'::uuid, 'collection membership retains its resource id');
SELECT ok(EXISTS (
  SELECT 1 FROM pg_constraint
  WHERE conrelid = 'public.collection_resources'::regclass
    AND confrelid = 'public.library_resources'::regclass
    AND contype = 'f'
), 'collection membership foreign key follows the resource table rename');
SELECT is((SELECT count(*) FROM public.library_resources WHERE id = 'f0520000-0000-4000-8000-000000000001'),
  1::bigint, 'sentinel resource remains present');

SELECT * FROM finish();
ROLLBACK;
