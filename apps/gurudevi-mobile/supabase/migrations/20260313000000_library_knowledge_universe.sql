-- ============================================================================
-- GURUDEVI LIBRARY: KNOWLEDGE UNIVERSE SCHEMA
-- Creates the epistemic graph tables, search functions, and RLS policies
-- that power the holistic digital library.
-- ============================================================================

-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 1. NODES TABLE — The core epistemic unit (resources, concepts, people, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.nodes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title              TEXT NOT NULL,
    title_si           TEXT,
    title_ta           TEXT,
    title_en           TEXT,
    description        TEXT,
    description_si     TEXT,
    description_ta     TEXT,
    description_en     TEXT,
    type               TEXT NOT NULL DEFAULT 'resource',
    format             TEXT DEFAULT 'document',
    url                TEXT,
    thumbnail_url      TEXT,

    -- Categorisation
    subjects           TEXT[]  NOT NULL DEFAULT '{}',
    topics             TEXT[]  NOT NULL DEFAULT '{}',
    grades             INTEGER[] NOT NULL DEFAULT '{}',
    difficulty         TEXT DEFAULT 'intermediate',
    language           TEXT[]  NOT NULL DEFAULT '{"si","en"}',

    -- Localisation shorthand
    visibility         TEXT DEFAULT 'public',

    -- Ownership
    creator_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    creator_name       TEXT,
    creator_role       TEXT,
    school_id          UUID REFERENCES public.schools(id) ON DELETE SET NULL,

    -- Quality signals
    verified           BOOLEAN NOT NULL DEFAULT false,
    verified_by        UUID REFERENCES public.users(id) ON DELETE SET NULL,
    curriculum_aligned BOOLEAN NOT NULL DEFAULT false,
    is_community       BOOLEAN NOT NULL DEFAULT false,
    is_ministry_official BOOLEAN NOT NULL DEFAULT false,
    license            TEXT,
    copyright_notice   TEXT,
    source_url         TEXT,
    source_name        TEXT,

    -- Engagement counters
    views              INTEGER NOT NULL DEFAULT 0,
    uses_count         INTEGER NOT NULL DEFAULT 0,
    endorsements       INTEGER NOT NULL DEFAULT 0,
    bookmarks          INTEGER NOT NULL DEFAULT 0,

    -- Tags
    tags               TEXT[]  NOT NULL DEFAULT '{}',

    -- Link health
    link_status        TEXT DEFAULT 'unknown'
                           CHECK (link_status IN ('working','broken','unknown')),
    last_checked_at    TIMESTAMPTZ,
    fail_count         INTEGER NOT NULL DEFAULT 0,

    -- Media (stored as JSON for flexibility)
    media              JSONB,

    -- Semantic search vector (pgvector 1536 — OpenAI/Anthropic compatible)
    embedding          vector(1536),

    -- Full-text search
    search_vector      tsvector,

    -- Timestamps
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.nodes IS
    'Every epistemic entity in the Gurudevi Library — resources, concepts, people, institutions.';

-- Index for fast filter queries
CREATE INDEX IF NOT EXISTS idx_nodes_type          ON public.nodes (type);
CREATE INDEX IF NOT EXISTS idx_nodes_creator       ON public.nodes (creator_id);
CREATE INDEX IF NOT EXISTS idx_nodes_school        ON public.nodes (school_id);
CREATE INDEX IF NOT EXISTS idx_nodes_verified      ON public.nodes (verified);
CREATE INDEX IF NOT EXISTS idx_nodes_created_at    ON public.nodes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nodes_subjects      ON public.nodes USING gin(subjects);
CREATE INDEX IF NOT EXISTS idx_nodes_topics        ON public.nodes USING gin(topics);
CREATE INDEX IF NOT EXISTS idx_nodes_tags          ON public.nodes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_nodes_fts           ON public.nodes USING gin(search_vector);

-- ============================================================================
-- 2. Full-Text Search trigger on nodes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.nodes_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    new.search_vector :=
        setweight(to_tsvector('simple', coalesce(new.title,       '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(new.title_en,    '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(new.description, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(new.description_en, '')), 'B') ||
        setweight(to_tsvector('simple', array_to_string(coalesce(new.subjects,'{}'), ' ')), 'C') ||
        setweight(to_tsvector('simple', array_to_string(coalesce(new.topics,  '{}'), ' ')), 'C') ||
        setweight(to_tsvector('simple', array_to_string(coalesce(new.tags,    '{}'), ' ')), 'D');
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS tr_nodes_search_vector ON public.nodes;
CREATE TRIGGER tr_nodes_search_vector
    BEFORE INSERT OR UPDATE ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION public.nodes_search_vector_update();

-- Back-fill existing rows (safe to run even if table is empty)
UPDATE public.nodes SET updated_at = now() WHERE id IS NOT NULL;

-- updated_at trigger
DROP TRIGGER IF EXISTS tr_nodes_updated_at ON public.nodes;
CREATE TRIGGER tr_nodes_updated_at
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. EDGES TABLE — Semantic relationships between nodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.edges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_node_id    UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    to_node_id      UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    relationship    TEXT NOT NULL CHECK (relationship IN (
                        'prerequisite','related','part_of','leads_to',
                        'contradicts','supports','opposite','example',
                        'authored_by','issued_by','wrong_path_to'
                    )),
    weight          FLOAT  NOT NULL DEFAULT 1.0,
    is_ai_generated BOOLEAN NOT NULL DEFAULT false,
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(from_node_id, to_node_id, relationship)
);

CREATE INDEX IF NOT EXISTS idx_edges_from ON public.edges (from_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_to   ON public.edges (to_node_id);

-- ============================================================================
-- 4. COLLECTIONS TABLE — Curated learning paths
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.collections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    creator_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    subject         TEXT,
    subjects        TEXT[]    NOT NULL DEFAULT '{}',
    grades          INTEGER[] NOT NULL DEFAULT '{}',
    resource_ids    UUID[]    NOT NULL DEFAULT '{}',
    sequence_order  INTEGER[] NOT NULL DEFAULT '{}',
    visibility      TEXT DEFAULT 'public'
                        CHECK (visibility IN ('private','class','grade','school','public')),
    is_official     BOOLEAN NOT NULL DEFAULT false,
    forks           INTEGER NOT NULL DEFAULT 0,
    used_by_count   INTEGER NOT NULL DEFAULT 0,
    endorsements    INTEGER NOT NULL DEFAULT 0,
    estimated_duration TEXT,
    school_id       UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    original_collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tr_collections_updated_at ON public.collections;
CREATE TRIGGER tr_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. MAP LAYERS TABLE — Geographic and abstract map layers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.map_layers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    layer_type      TEXT NOT NULL UNIQUE,
    projection_type TEXT NOT NULL DEFAULT 'cosmos'
                        CHECK (projection_type IN ('earth','cosmos')),
    description     TEXT,
    icon_emoji      TEXT DEFAULT '🗺',
    color           TEXT DEFAULT '#F5A623',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. STAGING TABLE — ETL pipeline inbox (human review before publishing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staging (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url                   TEXT,
    title                 TEXT,
    description           TEXT,
    content_type          TEXT,
    source_type           TEXT CHECK (source_type IN (
                              'ministry','youtube','archive',
                              'ai_search','community','manual'
                          )),
    ai_score              FLOAT,
    ai_reasoning          TEXT,
    suggested_tags        JSONB,
    suggested_content_type TEXT,
    suggested_roles       TEXT[],
    suggested_language    TEXT[],
    embedding             vector(1536),
    suggested_edges       JSONB,
    map_x                 FLOAT,
    map_y                 FLOAT,
    cloudinary_url        TEXT,
    file_hash             TEXT,
    file_acquired         BOOLEAN NOT NULL DEFAULT false,
    enrichment_complete   BOOLEAN NOT NULL DEFAULT false,
    status                TEXT NOT NULL DEFAULT 'pending_review'
                              CHECK (status IN (
                                  'pending_review','approved','rejected','published'
                              )),
    published_node_id     UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
    auto_approve          BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_staging_status     ON public.staging (status);
CREATE INDEX IF NOT EXISTS idx_staging_created_at ON public.staging (created_at DESC);

-- ============================================================================
-- 7. RPCs
-- ============================================================================

-- ---------------------------------------------------------------------------
-- search_map_universe: Searches both nodes AND map_layers in one call.
-- Used by MapScreen and the Resonance Engine.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_map_universe(
    query_text   TEXT,
    match_count  INT DEFAULT 10
)
RETURNS TABLE (
    id              UUID,
    name            TEXT,
    result_type     TEXT,
    layer_type      TEXT,
    projection_type TEXT,
    subjects        TEXT[],
    tags            TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    safe_query TEXT;
BEGIN
    safe_query := trim(query_text);
    IF safe_query = '' THEN
        RETURN;
    END IF;

    -- Map layers first (exact name match has priority)
    RETURN QUERY
    SELECT
        ml.id,
        ml.name,
        'layer'::TEXT           AS result_type,
        ml.layer_type,
        ml.projection_type,
        '{}'::TEXT[]            AS subjects,
        '{}'::TEXT[]            AS tags
    FROM public.map_layers ml
    WHERE
        ml.is_active = true
        AND (
            ml.name       ILIKE '%' || safe_query || '%'
            OR ml.layer_type ILIKE '%' || safe_query || '%'
            OR ml.description ILIKE '%' || safe_query || '%'
        )
    ORDER BY ml.name
    LIMIT match_count;

    -- Knowledge nodes (FTS or title/tag match)
    RETURN QUERY
    SELECT
        n.id,
        n.title                 AS name,
        'resource'::TEXT        AS result_type,
        n.type                  AS layer_type,
        NULL::TEXT              AS projection_type,
        n.subjects,
        n.tags
    FROM public.nodes n
    WHERE
        n.verified = true
        AND (
            n.search_vector @@ websearch_to_tsquery('simple', safe_query)
            OR n.title       ILIKE '%' || safe_query || '%'
            OR n.description ILIKE '%' || safe_query || '%'
        )
    ORDER BY
        ts_rank_cd(n.search_vector, websearch_to_tsquery('simple', safe_query)) DESC,
        n.views DESC
    LIMIT match_count;
END;
$$;

-- ---------------------------------------------------------------------------
-- report_broken_link: Increments fail_count and flags link as broken.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.report_broken_link(
    resource_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.nodes
    SET
        fail_count  = fail_count + 1,
        link_status = CASE
                          WHEN fail_count + 1 >= 3 THEN 'broken'
                          ELSE 'unknown'
                      END,
        last_checked_at = now()
    WHERE id = resource_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Override increment_resource_views to also update nodes table.
-- The original in master_baseline.sql updates library_resources.
-- This override adds coverage for the nodes table.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_resource_views(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Update nodes table (new epistemic library)
    UPDATE public.nodes
    SET views = views + 1
    WHERE id = resource_id;

    -- Update legacy library_resources table (backwards compat)
    UPDATE public.library_resources
    SET views = views + 1
    WHERE id = resource_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_resource_endorsements(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.nodes
    SET endorsements = endorsements + 1
    WHERE id = resource_id;

    UPDATE public.library_resources
    SET endorsements = endorsements + 1
    WHERE id = resource_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_resource_endorsements(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.nodes
    SET endorsements = GREATEST(0, endorsements - 1)
    WHERE id = resource_id;

    UPDATE public.library_resources
    SET endorsements = GREATEST(0, endorsements - 1)
    WHERE id = resource_id;
END;
$$;

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.nodes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_layers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging     ENABLE ROW LEVEL SECURITY;

-- NODES: Anyone authenticated can read published/public nodes.
--        Users can create community nodes.  Staff can manage all.
CREATE POLICY "nodes_public_read" ON public.nodes
    FOR SELECT TO authenticated
    USING (
        visibility = 'public'
        OR creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

CREATE POLICY "nodes_community_insert" ON public.nodes
    FOR INSERT TO authenticated
    WITH CHECK (creator_id = auth.uid());

CREATE POLICY "nodes_owner_or_admin_update" ON public.nodes
    FOR UPDATE TO authenticated
    USING (
        creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    )
    WITH CHECK (
        creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

CREATE POLICY "nodes_admin_delete" ON public.nodes
    FOR DELETE TO authenticated
    USING (
        creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

-- EDGES: read by all authenticated, write by staff only
CREATE POLICY "edges_read_authenticated" ON public.edges
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "edges_staff_write" ON public.edges
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

-- COLLECTIONS: public collections are readable by all; owner and admin can write
CREATE POLICY "collections_public_read" ON public.collections
    FOR SELECT TO authenticated
    USING (
        visibility = 'public'
        OR creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

CREATE POLICY "collections_creator_insert" ON public.collections
    FOR INSERT TO authenticated
    WITH CHECK (creator_id = auth.uid());

CREATE POLICY "collections_owner_or_admin_update" ON public.collections
    FOR UPDATE TO authenticated
    USING (
        creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    )
    WITH CHECK (
        creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

CREATE POLICY "collections_owner_or_admin_delete" ON public.collections
    FOR DELETE TO authenticated
    USING (
        creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

-- MAP LAYERS: read by all; staff write
CREATE POLICY "map_layers_read_all" ON public.map_layers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "map_layers_staff_write" ON public.map_layers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );

-- STAGING: only staff can read/write
CREATE POLICY "staging_staff_only" ON public.staging
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role IN ('founder','admin','developer')
        )
    );
