-- Nightly counter recompute jobs and denormalized counter hygiene
-- Phase 3: Automated maintenance for denormalized counters

-- ============================================================
-- COUNTER VERIFICATION VIEWS
-- ============================================================

-- View to check community_groups.member_count drift
CREATE OR REPLACE VIEW counter_drift_community_groups AS
SELECT
  g.id,
  g.name,
  g.member_count AS stored_count,
  COUNT(m.id) FILTER (WHERE m.status = 'active') AS actual_count,
  (g.member_count - COUNT(m.id) FILTER (WHERE m.status = 'active')) AS drift
FROM community_groups g
LEFT JOIN community_group_members m ON m.group_id = g.id
GROUP BY g.id, g.name, g.member_count
HAVING g.member_count != COUNT(m.id) FILTER (WHERE m.status = 'active');

-- View to check sanctuary_manifestos.endorsement_count drift
CREATE OR REPLACE VIEW counter_drift_sanctuary_manifestos AS
SELECT
  sm.id,
  sm.title,
  sm.endorsement_count AS stored_count,
  COUNT(me.id) AS actual_count,
  (sm.endorsement_count - COUNT(me.id)) AS drift
FROM sanctuary_manifestos sm
LEFT JOIN manifesto_endorsements me ON me.manifesto_id = sm.id
GROUP BY sm.id, sm.title, sm.endorsement_count
HAVING sm.endorsement_count != COUNT(me.id);

-- View to check nodes counters drift
CREATE OR REPLACE VIEW counter_drift_nodes AS
SELECT
  n.id,
  COALESCE(n.title_en, n.title) AS title_en,
  n.views AS stored_views,
  COUNT(re.id) FILTER (WHERE re.engagement_type = 'view') AS actual_views,
  n.uses_count AS stored_uses,
  COUNT(re.id) FILTER (WHERE re.engagement_type = 'use') AS actual_uses,
  n.endorsements AS stored_endorsements,
  COUNT(re.id) FILTER (WHERE re.engagement_type = 'endorse') AS actual_endorsements,
  n.bookmarks AS stored_bookmarks,
  COUNT(re.id) FILTER (WHERE re.engagement_type = 'bookmark') AS actual_bookmarks
FROM nodes n
LEFT JOIN resource_engagements re ON re.resource_id = n.id
GROUP BY n.id, n.title_en, n.title, n.views, n.uses_count, n.endorsements, n.bookmarks
HAVING 
  n.views != COUNT(re.id) FILTER (WHERE re.engagement_type = 'view')
  OR n.uses_count != COUNT(re.id) FILTER (WHERE re.engagement_type = 'use')
  OR n.endorsements != COUNT(re.id) FILTER (WHERE re.engagement_type = 'endorse')
  OR n.bookmarks != COUNT(re.id) FILTER (WHERE re.engagement_type = 'bookmark');

-- View to check collections.used_by_count drift
CREATE OR REPLACE VIEW counter_drift_collections AS
SELECT
  c.id,
  c.name AS title,
  c.used_by_count AS stored_count,
  COUNT(cn.id) AS actual_count,
  (c.used_by_count - COUNT(cn.id)) AS drift
FROM collections c
LEFT JOIN collection_nodes cn ON cn.collection_id = c.id
GROUP BY c.id, c.name, c.used_by_count
HAVING c.used_by_count != COUNT(cn.id);

-- ============================================================
-- NIGHTLY RECOMPUTE FUNCTIONS
-- ============================================================

-- Recompute community_groups.member_count
CREATE OR REPLACE FUNCTION recompute_community_group_members()
RETURNS TABLE(group_id UUID, group_name TEXT, old_count INT, new_count INT, updated BOOLEAN) 
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT g.id, g.name, g.member_count,
           COUNT(m.id) FILTER (WHERE m.status = 'active') AS actual_count
    FROM community_groups g
    LEFT JOIN community_group_members m ON m.group_id = g.id
    GROUP BY g.id, g.name, g.member_count
    HAVING g.member_count != COUNT(m.id) FILTER (WHERE m.status = 'active')
  LOOP
    UPDATE community_groups
    SET member_count = r.actual_count,
        updated_at = now()
    WHERE id = r.id;
    
    RETURN QUERY SELECT r.id, r.name, r.member_count, r.actual_count, TRUE;
  END LOOP;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0, 0, FALSE;
  END IF;
END $$;

-- Recompute sanctuary_manifestos.endorsement_count
CREATE OR REPLACE FUNCTION recompute_manifesto_endorsements()
RETURNS TABLE(manifesto_id UUID, title TEXT, old_count INT, new_count INT, updated BOOLEAN) 
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT sm.id, sm.title, sm.endorsement_count, COUNT(me.id) AS actual_count
    FROM sanctuary_manifestos sm
    LEFT JOIN manifesto_endorsements me ON me.manifesto_id = sm.id
    GROUP BY sm.id, sm.title, sm.endorsement_count
    HAVING sm.endorsement_count != COUNT(me.id)
  LOOP
    UPDATE sanctuary_manifestos
    SET endorsement_count = r.actual_count,
        updated_at = now()
    WHERE id = r.id;
    
    RETURN QUERY SELECT r.id, r.title, r.endorsement_count, r.actual_count, TRUE;
  END LOOP;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0, 0, FALSE;
  END IF;
END $$;

-- Recompute nodes counters (views, uses_count, endorsements, bookmarks)
CREATE OR REPLACE FUNCTION recompute_nodes_counters()
RETURNS TABLE(node_id UUID, title TEXT, counter TEXT, old_val BIGINT, new_val BIGINT, updated BOOLEAN) 
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      n.id,
      COALESCE(n.title_en, n.title) AS title_en,
      n.views,
      COUNT(re.id) FILTER (WHERE re.engagement_type = 'view') AS actual_views,
      n.uses_count,
      COUNT(re.id) FILTER (WHERE re.engagement_type = 'use') AS actual_uses,
      n.endorsements,
      COUNT(re.id) FILTER (WHERE re.engagement_type = 'endorse') AS actual_endorsements,
      n.bookmarks,
      COUNT(re.id) FILTER (WHERE re.engagement_type = 'bookmark') AS actual_bookmarks
    FROM nodes n
    LEFT JOIN resource_engagements re ON re.resource_id = n.id
    GROUP BY n.id, n.title_en, n.title, n.views, n.uses_count, n.endorsements, n.bookmarks
    HAVING 
      n.views != COUNT(re.id) FILTER (WHERE re.engagement_type = 'view')
      OR n.uses_count != COUNT(re.id) FILTER (WHERE re.engagement_type = 'use')
      OR n.endorsements != COUNT(re.id) FILTER (WHERE re.engagement_type = 'endorse')
      OR n.bookmarks != COUNT(re.id) FILTER (WHERE re.engagement_type = 'bookmark')
  LOOP
    IF r.views != r.actual_views THEN
      UPDATE nodes SET views = r.actual_views, updated_at = now() WHERE id = r.id;
      RETURN QUERY SELECT r.id, r.title_en, 'views'::TEXT, r.views::BIGINT, r.actual_views::BIGINT, TRUE;
    END IF;
    
    IF r.uses_count != r.actual_uses THEN
      UPDATE nodes SET uses_count = r.actual_uses, updated_at = now() WHERE id = r.id;
      RETURN QUERY SELECT r.id, r.title_en, 'uses_count'::TEXT, r.uses_count::BIGINT, r.actual_uses::BIGINT, TRUE;
    END IF;
    
    IF r.endorsements != r.actual_endorsements THEN
      UPDATE nodes SET endorsements = r.actual_endorsements, updated_at = now() WHERE id = r.id;
      RETURN QUERY SELECT r.id, r.title_en, 'endorsements'::TEXT, r.endorsements::BIGINT, r.actual_endorsements::BIGINT, TRUE;
    END IF;
    
    IF r.bookmarks != r.actual_bookmarks THEN
      UPDATE nodes SET bookmarks = r.actual_bookmarks, updated_at = now() WHERE id = r.id;
      RETURN QUERY SELECT r.id, r.title_en, 'bookmarks'::TEXT, r.bookmarks::BIGINT, r.actual_bookmarks::BIGINT, TRUE;
    END IF;
  END LOOP;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, 0::BIGINT, 0::BIGINT, FALSE;
  END IF;
END $$;

-- Recompute collections.used_by_count
CREATE OR REPLACE FUNCTION recompute_collections_used_by()
RETURNS TABLE(collection_id UUID, title TEXT, old_count INT, new_count INT, updated BOOLEAN) 
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.id, c.name AS title, c.used_by_count, COUNT(cn.id) AS actual_count
    FROM collections c
    LEFT JOIN collection_nodes cn ON cn.collection_id = c.id
    GROUP BY c.id, c.name, c.used_by_count
    HAVING c.used_by_count != COUNT(cn.id)
  LOOP
    UPDATE collections
    SET used_by_count = r.actual_count,
        updated_at = now()
    WHERE id = r.id;
    
    RETURN QUERY SELECT r.id, r.title, r.used_by_count, r.actual_count, TRUE;
  END LOOP;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0, 0, FALSE;
  END IF;
END $$;

-- ============================================================
-- MASTER NIGHTLY RECOMPUTE FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION nightly_counter_recompute()
RETURNS TABLE(task TEXT, details JSONB) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- community_groups.member_count
  PERFORM recompute_community_group_members();
  RETURN QUERY SELECT 'recompute_community_group_members', jsonb_build_object('status', 'completed');
  
  -- sanctuary_manifestos.endorsement_count
  PERFORM recompute_manifesto_endorsements();
  RETURN QUERY SELECT 'recompute_manifesto_endorsements', jsonb_build_object('status', 'completed');
  
  -- nodes counters
  PERFORM recompute_nodes_counters();
  RETURN QUERY SELECT 'recompute_nodes_counters', jsonb_build_object('status', 'completed');
  
  -- collections.used_by_count
  PERFORM recompute_collections_used_by();
  RETURN QUERY SELECT 'recompute_collections_used_by', jsonb_build_object('status', 'completed');
  
  -- Log drift status
  RETURN QUERY SELECT 'drift_check_community_groups', (
    SELECT jsonb_agg(to_jsonb(t)) FROM counter_drift_community_groups t
  );
  RETURN QUERY SELECT 'drift_check_sanctuary_manifestos', (
    SELECT jsonb_agg(to_jsonb(t)) FROM counter_drift_sanctuary_manifestos t
  );
  RETURN QUERY SELECT 'drift_check_nodes', (
    SELECT jsonb_agg(to_jsonb(t)) FROM counter_drift_nodes t
  );
  RETURN QUERY SELECT 'drift_check_collections', (
    SELECT jsonb_agg(to_jsonb(t)) FROM counter_drift_collections t
  );
END $$;

-- ============================================================
-- PG_CRON JOB SETUP (run nightly at 03:00 UTC)
-- ============================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule nightly counter recompute at 03:00 UTC
SELECT cron.schedule(
  'nightly-counter-recompute',
  '0 3 * * *',
  'SELECT nightly_counter_recompute();'
);

-- Schedule partition maintenance (monthly, 1st at 02:00 UTC)
SELECT cron.schedule(
  'monthly-partition-maintenance',
  '0 2 1 * *',
  'SELECT create_next_month_partitions(); SELECT create_next_month_partitions_growth_ai();'
);

-- Schedule quarterly archival (1st of Jan/Apr/Jul/Oct at 04:00 UTC)
SELECT cron.schedule(
  'quarterly-archival',
  '0 4 1 1,4,7,10 *',
  'SELECT archive_old_partitions(36); SELECT archive_old_partitions_growth_ai();'
);