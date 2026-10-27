-- =============================================================================
-- Migration: 20260327120000_temporal_library_community_v2.sql
--
-- Purpose:
--   1. Upgrade community temporal truth with edit/delete history and
--      updated/deleted timestamps across posts, comments, and messages.
--   2. Upgrade library temporal truth with explicit active collection membership,
--      collection membership event history, and revision history for nodes and
--      collections.
--
-- Notes:
--   - Community keeps existing hard-delete application behavior, but DELETE
--     operations are now preserved in history tables.
--   - Library keeps current app compatibility by maintaining collections.resource_ids
--     and sequence_order from active collection_nodes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared helper
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_row_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

-- =============================================================================
-- COMMUNITY V2 TEMPORAL UPGRADE
-- =============================================================================

ALTER TABLE IF EXISTS public.community_posts
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE IF EXISTS public.community_comments
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE IF EXISTS public.group_messages
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE IF EXISTS public.direct_messages
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

DROP TRIGGER IF EXISTS tr_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER tr_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.set_row_updated_at();

DROP TRIGGER IF EXISTS tr_community_comments_updated_at ON public.community_comments;
CREATE TRIGGER tr_community_comments_updated_at
    BEFORE UPDATE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.set_row_updated_at();

DROP TRIGGER IF EXISTS tr_group_messages_updated_at ON public.group_messages;
CREATE TRIGGER tr_group_messages_updated_at
    BEFORE UPDATE ON public.group_messages
    FOR EACH ROW EXECUTE FUNCTION public.set_row_updated_at();

DROP TRIGGER IF EXISTS tr_direct_messages_updated_at ON public.direct_messages;
CREATE TRIGGER tr_direct_messages_updated_at
    BEFORE UPDATE ON public.direct_messages
    FOR EACH ROW EXECUTE FUNCTION public.set_row_updated_at();

CREATE TABLE IF NOT EXISTS public.community_entity_versions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     text NOT NULL CHECK (
        entity_type IN ('community_post', 'community_comment', 'group_message', 'direct_message')
    ),
    entity_id       uuid NOT NULL,
    event_type      text NOT NULL CHECK (
        event_type IN ('insert', 'update', 'delete')
    ),
    changed_at      timestamptz NOT NULL DEFAULT now(),
    changed_by      uuid REFERENCES public.users(id) ON DELETE SET NULL,
    snapshot        jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_entity_versions_lookup
    ON public.community_entity_versions (entity_type, entity_id, changed_at DESC);

ALTER TABLE public.community_entity_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_entity_versions_select_own_scope" ON public.community_entity_versions;
CREATE POLICY "community_entity_versions_select_own_scope"
    ON public.community_entity_versions FOR SELECT
    USING (
        (
            entity_type = 'community_post'
            AND EXISTS (
                SELECT 1
                FROM public.users u
                WHERE u.id = public.get_my_id()
                  AND (
                      COALESCE(
                          snapshot->'after'->>'school_id',
                          snapshot->'before'->>'school_id',
                          snapshot->>'school_id'
                      )::uuid = u.school_id
                      OR COALESCE(
                          snapshot->'after'->>'school_id',
                          snapshot->'before'->>'school_id',
                          snapshot->>'school_id'
                      ) IS NULL
                  )
            )
        )
        OR (
            entity_type = 'community_comment'
            AND EXISTS (
                SELECT 1
                FROM public.users u
                WHERE u.id = public.get_my_id()
                  AND (
                      COALESCE(
                          snapshot->'after'->>'school_id',
                          snapshot->'before'->>'school_id',
                          snapshot->>'school_id'
                      )::uuid = u.school_id
                      OR COALESCE(
                          snapshot->'after'->>'school_id',
                          snapshot->'before'->>'school_id',
                          snapshot->>'school_id'
                      ) IS NULL
                  )
            )
        )
        OR (
            entity_type = 'group_message'
            AND EXISTS (
                SELECT 1
                FROM public.community_group_members m
                WHERE m.group_id = COALESCE(
                    (snapshot->'after'->>'group_id')::uuid,
                    (snapshot->'before'->>'group_id')::uuid,
                    (snapshot->>'group_id')::uuid
                )
                  AND m.user_id = public.get_my_id()
                  AND m.status = 'active'
            )
        )
        OR (
            entity_type = 'direct_message'
            AND EXISTS (
                SELECT 1
                FROM public.direct_conversations dc
                WHERE dc.id = COALESCE(
                    (snapshot->'after'->>'conversation_id')::uuid,
                    (snapshot->'before'->>'conversation_id')::uuid,
                    (snapshot->>'conversation_id')::uuid
                )
                  AND (dc.user1_id = auth.uid() OR dc.user2_id = auth.uid())
            )
        )
    );

CREATE OR REPLACE FUNCTION public.capture_community_entity_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    entity_label text;
    snapshot_row jsonb;
    actor_id uuid;
BEGIN
    entity_label := CASE TG_TABLE_NAME
        WHEN 'community_posts' THEN 'community_post'
        WHEN 'community_comments' THEN 'community_comment'
        WHEN 'group_messages' THEN 'group_message'
        WHEN 'direct_messages' THEN 'direct_message'
        ELSE TG_TABLE_NAME
    END;

    actor_id := COALESCE(
        NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
        auth.uid()
    );

    IF TG_OP = 'INSERT' THEN
        snapshot_row := to_jsonb(NEW);
        INSERT INTO public.community_entity_versions(entity_type, entity_id, event_type, changed_by, snapshot)
        VALUES (entity_label, NEW.id, 'insert', actor_id, snapshot_row);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
            snapshot_row := jsonb_build_object(
                'before', to_jsonb(OLD),
                'after', to_jsonb(NEW)
            );
            INSERT INTO public.community_entity_versions(entity_type, entity_id, event_type, changed_by, snapshot)
            VALUES (entity_label, NEW.id, 'update', actor_id, snapshot_row);
        END IF;
        RETURN NEW;
    ELSE
        snapshot_row := to_jsonb(OLD) || jsonb_build_object('deleted_at', now());
        INSERT INTO public.community_entity_versions(entity_type, entity_id, event_type, changed_by, snapshot)
        VALUES (entity_label, OLD.id, 'delete', actor_id, snapshot_row);
        RETURN OLD;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS tr_community_posts_versions ON public.community_posts;
CREATE TRIGGER tr_community_posts_versions
    AFTER INSERT OR UPDATE OR DELETE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.capture_community_entity_version();

DROP TRIGGER IF EXISTS tr_community_comments_versions ON public.community_comments;
CREATE TRIGGER tr_community_comments_versions
    AFTER INSERT OR UPDATE OR DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.capture_community_entity_version();

DROP TRIGGER IF EXISTS tr_group_messages_versions ON public.group_messages;
CREATE TRIGGER tr_group_messages_versions
    AFTER INSERT OR UPDATE OR DELETE ON public.group_messages
    FOR EACH ROW EXECUTE FUNCTION public.capture_community_entity_version();

DROP TRIGGER IF EXISTS tr_direct_messages_versions ON public.direct_messages;
CREATE TRIGGER tr_direct_messages_versions
    AFTER INSERT OR UPDATE OR DELETE ON public.direct_messages
    FOR EACH ROW EXECUTE FUNCTION public.capture_community_entity_version();

-- =============================================================================
-- LIBRARY V2 TEMPORAL UPGRADE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.collection_nodes (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id   uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    node_id         uuid NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    "position"      integer NOT NULL DEFAULT 0,
    added_at        timestamptz NOT NULL DEFAULT now(),
    added_by        uuid REFERENCES public.users(id) ON DELETE SET NULL,
    UNIQUE(collection_id, node_id)
);

-- Ensure columns exist if table was partially created or renamed from legacy
ALTER TABLE public.collection_nodes ADD COLUMN IF NOT EXISTS "position" integer NOT NULL DEFAULT 0;
ALTER TABLE public.collection_nodes ADD COLUMN IF NOT EXISTS added_by uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- Handle legacy constraint names if we are transitioning from an old schema
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'library_collection_items_collection_id_fkey'
          AND conrelid = 'public.collection_nodes'::regclass
    ) THEN
        ALTER TABLE public.collection_nodes RENAME CONSTRAINT library_collection_items_collection_id_fkey TO collection_nodes_collection_id_fkey;
    END IF;
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'library_collection_items_item_id_fkey'
          AND conrelid = 'public.collection_nodes'::regclass
    ) THEN
        ALTER TABLE public.collection_nodes RENAME CONSTRAINT library_collection_items_item_id_fkey TO collection_nodes_node_id_fkey;
    END IF;
END $$;

-- Add needed unique constraint for ON CONFLICT
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c 
        JOIN pg_class t ON c.conrelid = t.oid 
        WHERE t.relname = 'collection_nodes' AND c.contype = 'u' 
          AND (
            SELECT array_agg(attname ORDER BY attname)::text[] 
            FROM pg_attribute 
            WHERE attrelid = t.oid AND attnum = ANY(c.conkey)
          ) @> ARRAY['collection_id', 'node_id']::text[]
    ) THEN
        ALTER TABLE public.collection_nodes ADD CONSTRAINT collection_nodes_collection_id_node_id_key UNIQUE (collection_id, node_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_collection_nodes_collection_position
    ON public.collection_nodes (collection_id, "position", added_at);

CREATE INDEX IF NOT EXISTS idx_collection_nodes_node
    ON public.collection_nodes (node_id);

ALTER TABLE public.collection_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collection_nodes_select_visible_collection" ON public.collection_nodes;
CREATE POLICY "collection_nodes_select_visible_collection"
    ON public.collection_nodes FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.collections c
            WHERE c.id = collection_nodes.collection_id
        )
    );

DROP POLICY IF EXISTS "collection_nodes_mutate_owner" ON public.collection_nodes;
CREATE POLICY "collection_nodes_mutate_owner"
    ON public.collection_nodes FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.collections c
            WHERE c.id = collection_nodes.collection_id
              AND c.creator_id = public.get_my_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.collections c
            WHERE c.id = collection_nodes.collection_id
              AND c.creator_id = public.get_my_id()
        )
    );

CREATE TABLE IF NOT EXISTS public.collection_node_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id   uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    node_id         uuid NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    event_type      text NOT NULL CHECK (event_type IN ('added', 'removed', 'reordered')),
    "position"      integer,
    occurred_at     timestamptz NOT NULL DEFAULT now(),
    actor_id        uuid REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_collection_node_events_lookup
    ON public.collection_node_events (collection_id, node_id, occurred_at DESC);

ALTER TABLE public.collection_node_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collection_node_events_select_visible_collection" ON public.collection_node_events;
CREATE POLICY "collection_node_events_select_visible_collection"
    ON public.collection_node_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.collections c
            WHERE c.id = collection_node_events.collection_id
        )
    );

CREATE TABLE IF NOT EXISTS public.library_entity_versions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     text NOT NULL CHECK (entity_type IN ('node', 'collection')),
    entity_id       uuid NOT NULL,
    event_type      text NOT NULL CHECK (event_type IN ('insert', 'update', 'delete')),
    changed_at      timestamptz NOT NULL DEFAULT now(),
    changed_by      uuid REFERENCES public.users(id) ON DELETE SET NULL,
    snapshot        jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_library_entity_versions_lookup
    ON public.library_entity_versions (entity_type, entity_id, changed_at DESC);

ALTER TABLE public.library_entity_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "library_entity_versions_select_visible_entity" ON public.library_entity_versions;
CREATE POLICY "library_entity_versions_select_visible_entity"
    ON public.library_entity_versions FOR SELECT
    USING (
        (
            entity_type = 'node'
            AND EXISTS (
                SELECT 1
                FROM public.users u
                WHERE u.id = public.get_my_id()
                  AND (
                      COALESCE(
                          snapshot->'after'->>'visibility',
                          snapshot->'before'->>'visibility',
                          snapshot->>'visibility'
                      ) = 'public'
                      OR COALESCE(
                          snapshot->'after'->>'creator_id',
                          snapshot->'before'->>'creator_id',
                          snapshot->>'creator_id'
                      )::uuid = public.get_my_id()
                      OR (
                          COALESCE(
                              snapshot->'after'->>'school_id',
                              snapshot->'before'->>'school_id',
                              snapshot->>'school_id'
                          )::uuid = u.school_id
                          AND COALESCE(
                              snapshot->'after'->>'visibility',
                              snapshot->'before'->>'visibility',
                              snapshot->>'visibility'
                          ) IN ('school', 'shared', 'class', 'grade')
                      )
                  )
            )
        )
        OR (
            entity_type = 'collection'
            AND EXISTS (
                SELECT 1
                FROM public.users u
                WHERE u.id = public.get_my_id()
                  AND (
                      COALESCE(
                          snapshot->'after'->>'visibility',
                          snapshot->'before'->>'visibility',
                          snapshot->>'visibility'
                      ) = 'public'
                      OR COALESCE(
                          snapshot->'after'->>'creator_id',
                          snapshot->'before'->>'creator_id',
                          snapshot->>'creator_id'
                      )::uuid = public.get_my_id()
                      OR (
                          COALESCE(
                              snapshot->'after'->>'school_id',
                              snapshot->'before'->>'school_id',
                              snapshot->>'school_id'
                          )::uuid = u.school_id
                          AND COALESCE(
                              snapshot->'after'->>'visibility',
                              snapshot->'before'->>'visibility',
                              snapshot->>'visibility'
                          ) IN ('school', 'class', 'grade')
                      )
                  )
            )
        )
    );

CREATE OR REPLACE FUNCTION public.assign_collection_node_position()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW."position" IS NULL OR NEW."position" <= 0 THEN
        SELECT COALESCE(MAX("position"), -1) + 1
        INTO NEW."position"
        FROM public.collection_nodes
        WHERE collection_id = NEW.collection_id;
    END IF;

    IF NEW.added_at IS NULL THEN
        NEW.added_at := now();
    END IF;

    IF NEW.added_by IS NULL THEN
        NEW.added_by := COALESCE(
            NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
            auth.uid()
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_collection_nodes_assign_position ON public.collection_nodes;
CREATE TRIGGER tr_collection_nodes_assign_position
    BEFORE INSERT ON public.collection_nodes
    FOR EACH ROW EXECUTE FUNCTION public.assign_collection_node_position();

CREATE OR REPLACE FUNCTION public.refresh_collection_arrays_from_nodes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    target_collection_id uuid;
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    target_collection_id := COALESCE(NEW.collection_id, OLD.collection_id);

    UPDATE public.collections c
    SET
        resource_ids = COALESCE((
            SELECT array_agg(node_id ORDER BY "position", added_at, id)
            FROM public.collection_nodes
            WHERE collection_id = target_collection_id
        ), '{}'::uuid[]),
        sequence_order = COALESCE((
            SELECT array_agg(seq ORDER BY seq)
            FROM (
                SELECT row_number() OVER (ORDER BY "position", added_at, id) - 1 AS seq
                FROM public.collection_nodes
                WHERE collection_id = target_collection_id
            ) ordered
        ), '{}'::integer[]),
        updated_at = now()
    WHERE c.id = target_collection_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS tr_collection_nodes_refresh_collection_arrays ON public.collection_nodes;
CREATE TRIGGER tr_collection_nodes_refresh_collection_arrays
    AFTER INSERT OR UPDATE OR DELETE ON public.collection_nodes
    FOR EACH ROW EXECUTE FUNCTION public.refresh_collection_arrays_from_nodes();

CREATE OR REPLACE FUNCTION public.seed_collection_nodes_from_collection()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.collection_nodes(collection_id, node_id, "position", added_at, added_by)
    SELECT
        NEW.id,
        resource_id,
        COALESCE(sequence_idx - 1, ordinality - 1),
        NEW.created_at,
        NEW.creator_id
    FROM unnest(COALESCE(NEW.resource_ids, '{}'::uuid[])) WITH ORDINALITY AS resources(resource_id, ordinality)
    LEFT JOIN unnest(COALESCE(NEW.sequence_order, '{}'::integer[])) WITH ORDINALITY AS sequence(sequence_idx, idx)
        ON idx = ordinality
    ON CONFLICT (collection_id, node_id) DO UPDATE
        SET "position" = EXCLUDED."position";

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_collections_seed_nodes ON public.collections;
CREATE TRIGGER tr_collections_seed_nodes
    AFTER INSERT ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.seed_collection_nodes_from_collection();

INSERT INTO public.collection_nodes(collection_id, node_id, "position", added_at, added_by)
SELECT
    c.id,
    resource_id,
    COALESCE(sequence_idx - 1, ordinality - 1),
    c.created_at,
    c.creator_id
FROM public.collections c
CROSS JOIN LATERAL unnest(COALESCE(c.resource_ids, '{}'::uuid[])) WITH ORDINALITY AS resources(resource_id, ordinality)
JOIN public.nodes node ON node.id = resource_id
LEFT JOIN LATERAL unnest(COALESCE(c.sequence_order, '{}'::integer[])) WITH ORDINALITY AS sequence(sequence_idx, idx)
    ON idx = ordinality
ON CONFLICT (collection_id, node_id) DO NOTHING;

INSERT INTO public.collection_node_events(collection_id, node_id, event_type, "position", occurred_at, actor_id)
SELECT
    cn.collection_id,
    cn.node_id,
    'added',
    cn."position",
    cn.added_at,
    cn.added_by
FROM public.collection_nodes cn
WHERE NOT EXISTS (
    SELECT 1
    FROM public.collection_node_events e
    WHERE e.collection_id = cn.collection_id
      AND e.node_id = cn.node_id
      AND e.event_type = 'added'
);

CREATE OR REPLACE FUNCTION public.log_collection_node_event()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    actor_id uuid;
BEGIN
    actor_id := COALESCE(
        NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
        auth.uid()
    );

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.collection_node_events(collection_id, node_id, event_type, "position", occurred_at, actor_id)
        VALUES (NEW.collection_id, NEW.node_id, 'added', NEW."position", now(), COALESCE(NEW.added_by, actor_id));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW."position" IS DISTINCT FROM OLD."position" THEN
            INSERT INTO public.collection_node_events(collection_id, node_id, event_type, "position", occurred_at, actor_id)
            VALUES (NEW.collection_id, NEW.node_id, 'reordered', NEW."position", now(), actor_id);
        END IF;
        RETURN NEW;
    ELSE
        INSERT INTO public.collection_node_events(collection_id, node_id, event_type, "position", occurred_at, actor_id)
        VALUES (OLD.collection_id, OLD.node_id, 'removed', OLD."position", now(), actor_id);
        RETURN OLD;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS tr_collection_nodes_events ON public.collection_nodes;
CREATE TRIGGER tr_collection_nodes_events
    AFTER INSERT OR UPDATE OR DELETE ON public.collection_nodes
    FOR EACH ROW EXECUTE FUNCTION public.log_collection_node_event();

CREATE OR REPLACE FUNCTION public.capture_library_entity_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    entity_label text;
    snapshot_row jsonb;
    actor_id uuid;
BEGIN
    entity_label := CASE TG_TABLE_NAME
        WHEN 'nodes' THEN 'node'
        WHEN 'collections' THEN 'collection'
        ELSE TG_TABLE_NAME
    END;

    actor_id := COALESCE(
        NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
        auth.uid()
    );

    IF TG_OP = 'INSERT' THEN
        snapshot_row := to_jsonb(NEW);
        INSERT INTO public.library_entity_versions(entity_type, entity_id, event_type, changed_by, snapshot)
        VALUES (entity_label, NEW.id, 'insert', actor_id, snapshot_row);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
            snapshot_row := jsonb_build_object(
                'before', to_jsonb(OLD),
                'after', to_jsonb(NEW)
            );
            INSERT INTO public.library_entity_versions(entity_type, entity_id, event_type, changed_by, snapshot)
            VALUES (entity_label, NEW.id, 'update', actor_id, snapshot_row);
        END IF;
        RETURN NEW;
    ELSE
        snapshot_row := to_jsonb(OLD);
        INSERT INTO public.library_entity_versions(entity_type, entity_id, event_type, changed_by, snapshot)
        VALUES (entity_label, OLD.id, 'delete', actor_id, snapshot_row);
        RETURN OLD;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS tr_nodes_versions ON public.nodes;
CREATE TRIGGER tr_nodes_versions
    AFTER INSERT OR UPDATE OR DELETE ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION public.capture_library_entity_version();

DROP TRIGGER IF EXISTS tr_collections_versions ON public.collections;
CREATE TRIGGER tr_collections_versions
    AFTER INSERT OR UPDATE OR DELETE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.capture_library_entity_version();

CREATE OR REPLACE FUNCTION public.get_collection_membership_as_of(
    p_collection_id uuid,
    p_as_of timestamptz DEFAULT now()
)
RETURNS TABLE (
    node_id uuid,
    "position" integer,
    added_at timestamptz,
    removed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH node_event_state AS (
        SELECT
            e.node_id,
            e."position",
            e.occurred_at,
            e.event_type,
            row_number() OVER (
                PARTITION BY e.node_id
                ORDER BY e.occurred_at DESC, e.id DESC
            ) AS rn
        FROM public.collection_node_events e
        WHERE e.collection_id = p_collection_id
          AND e.occurred_at <= p_as_of
    ),
    added_events AS (
        SELECT
            e.node_id,
            max(e.occurred_at) FILTER (WHERE e.event_type = 'added') AS added_at,
            max(e.occurred_at) FILTER (WHERE e.event_type = 'removed') AS removed_at
        FROM public.collection_node_events e
        WHERE e.collection_id = p_collection_id
          AND e.occurred_at <= p_as_of
        GROUP BY e.node_id
    )
    SELECT
        latest.node_id,
        latest."position",
        added.added_at,
        added.removed_at
    FROM node_event_state latest
    JOIN added_events added
      ON added.node_id = latest.node_id
    WHERE latest.rn = 1
      AND latest.event_type <> 'removed'
    ORDER BY latest."position", latest.occurred_at;
$$;
