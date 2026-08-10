-- Library engagement parity: live null scan returned zero null rows for these
-- required relationship/timestamp fields. Search vectors and embeddings remain
-- outside ZenStack as upstream search infrastructure.

-- Library core fields: live scan found zero NULL rows for these columns.
-- creator_id is intentionally excluded: system-owned/unattributed content is
-- an active domain case and must not be assigned a fake user.
ALTER TABLE public.nodes
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN format SET NOT NULL,
  ALTER COLUMN subjects SET NOT NULL,
  ALTER COLUMN topics SET NOT NULL,
  ALTER COLUMN grades SET NOT NULL,
  ALTER COLUMN language SET NOT NULL,
  ALTER COLUMN visibility SET NOT NULL,
  ALTER COLUMN creator_role SET NOT NULL,
  ALTER COLUMN verified SET NOT NULL,
  ALTER COLUMN is_community SET NOT NULL,
  ALTER COLUMN views SET NOT NULL,
  ALTER COLUMN uses_count SET NOT NULL,
  ALTER COLUMN endorsements SET NOT NULL,
  ALTER COLUMN bookmarks SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.collections
  ALTER COLUMN visibility SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.resource_engagements
  ALTER COLUMN resource_id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;
