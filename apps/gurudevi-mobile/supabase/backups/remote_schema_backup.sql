-- ==========================================
-- Supabase Remote Database Schema Backup
-- Generated: 2026-08-10T17:10:01.039Z
-- ==========================================

-- ─── Extensions ───
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA public VERSION '1.11';
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA public VERSION '1.6';
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public VERSION '1.3';
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA public VERSION '1.0';
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA public VERSION '3.3.7';
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA public VERSION '0.3.1';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public VERSION '1.1';
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public VERSION '0.8.2';

-- ─── Custom Types / Enums ───
CREATE TYPE public."node_relationship_type" AS ENUM ('prerequisite', 'related', 'leads_to', 'part_of', 'opposite', 'example');
CREATE TYPE public."report_target_type" AS ENUM ('teacher', 'principal', 'platform');

-- ─── Functions and Triggers ───
CREATE OR REPLACE FUNCTION public._postgis_deprecate(oldname text, newname text, version text)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE STRICT COST 500
AS $function$
DECLARE
  curver_text text;
BEGIN
  --
  -- Raises a NOTICE if it was deprecated in this version,
  -- a WARNING if in a previous version (only up to minor version checked)
  --
	curver_text := '3.3.7';
	IF pg_catalog.split_part(curver_text,'.',1)::int > pg_catalog.split_part(version,'.',1)::int OR
	   ( pg_catalog.split_part(curver_text,'.',1) = pg_catalog.split_part(version,'.',1) AND
		 pg_catalog.split_part(curver_text,'.',2) != split_part(version,'.',2) )
	THEN
	  RAISE WARNING '% signature was deprecated in %. Please use %', oldname, version, newname;
	ELSE
	  RAISE DEBUG '% signature was deprecated in %. Please use %', oldname, version, newname;
	END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public._postgis_index_extent(tbl regclass, col text)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_index_extent$function$
;

CREATE OR REPLACE FUNCTION public._postgis_join_selectivity(regclass, text, regclass, text, text DEFAULT '2'::text)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_joinsel$function$
;

CREATE OR REPLACE FUNCTION public._postgis_pgsql_version()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
	SELECT CASE WHEN pg_catalog.split_part(s,'.',1)::integer > 9 THEN pg_catalog.split_part(s,'.',1) || '0'
	ELSE pg_catalog.split_part(s,'.', 1) || pg_catalog.split_part(s,'.', 2) END AS v
	FROM pg_catalog.substring(version(), E'PostgreSQL ([0-9\\.]+)') AS s;
$function$
;

CREATE OR REPLACE FUNCTION public._postgis_scripts_pgsql_version()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT '170'::text AS version$function$
;

CREATE OR REPLACE FUNCTION public._postgis_selectivity(tbl regclass, att_name text, geom geometry, mode text DEFAULT '2'::text)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_sel$function$
;

CREATE OR REPLACE FUNCTION public._postgis_stats(tbl regclass, att_name text, text DEFAULT '2'::text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_stats$function$
;

CREATE OR REPLACE FUNCTION public._st_3ddfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin3d$function$
;

CREATE OR REPLACE FUNCTION public._st_3ddwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dwithin3d$function$
;

CREATE OR REPLACE FUNCTION public._st_3dintersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_3DIntersects$function$
;

CREATE OR REPLACE FUNCTION public._st_asgml(integer, geometry, integer, integer, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asGML$function$
;

CREATE OR REPLACE FUNCTION public._st_asx3d(integer, geometry, integer, integer, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asX3D$function$
;

CREATE OR REPLACE FUNCTION public._st_bestsrid(geography, geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_bestsrid$function$
;

CREATE OR REPLACE FUNCTION public._st_bestsrid(geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_bestsrid$function$
;

CREATE OR REPLACE FUNCTION public._st_contains(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$contains$function$
;

CREATE OR REPLACE FUNCTION public._st_containsproperly(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$containsproperly$function$
;

CREATE OR REPLACE FUNCTION public._st_coveredby(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_coveredby$function$
;

CREATE OR REPLACE FUNCTION public._st_coveredby(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$coveredby$function$
;

CREATE OR REPLACE FUNCTION public._st_covers(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_covers$function$
;

CREATE OR REPLACE FUNCTION public._st_covers(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$covers$function$
;

CREATE OR REPLACE FUNCTION public._st_crosses(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$crosses$function$
;

CREATE OR REPLACE FUNCTION public._st_dfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin$function$
;

CREATE OR REPLACE FUNCTION public._st_distancetree(geography, geography)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceTree($1, $2, 0.0, true)$function$
;

CREATE OR REPLACE FUNCTION public._st_distancetree(geography, geography, double precision, boolean)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_distance_tree$function$
;

CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceUnCached($1, $2, 0.0, true)$function$
;

CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography, double precision, boolean)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_distance_uncached$function$
;

CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography, boolean)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceUnCached($1, $2, 0.0, $3)$function$
;

CREATE OR REPLACE FUNCTION public._st_dwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dwithin$function$
;

CREATE OR REPLACE FUNCTION public._st_dwithin(geog1 geography, geog2 geography, tolerance double precision, use_spheroid boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_dwithin$function$
;

CREATE OR REPLACE FUNCTION public._st_dwithinuncached(geography, geography, double precision)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT $1 OPERATOR(public.&&) public._ST_Expand($2,$3) AND $2 OPERATOR(public.&&) public._ST_Expand($1,$3) AND public._ST_DWithinUnCached($1, $2, $3, true)$function$
;

CREATE OR REPLACE FUNCTION public._st_dwithinuncached(geography, geography, double precision, boolean)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_dwithin_uncached$function$
;

CREATE OR REPLACE FUNCTION public._st_equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Equals$function$
;

CREATE OR REPLACE FUNCTION public._st_expand(geography, double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_expand$function$
;

CREATE OR REPLACE FUNCTION public._st_geomfromgml(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$geom_from_gml$function$
;

CREATE OR REPLACE FUNCTION public._st_intersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Intersects$function$
;

CREATE OR REPLACE FUNCTION public._st_linecrossingdirection(line1 geometry, line2 geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_LineCrossingDirection$function$
;

CREATE OR REPLACE FUNCTION public._st_longestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_longestline2d$function$
;

CREATE OR REPLACE FUNCTION public._st_maxdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_maxdistance2d_linestring$function$
;

CREATE OR REPLACE FUNCTION public._st_orderingequals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_same$function$
;

CREATE OR REPLACE FUNCTION public._st_overlaps(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$overlaps$function$
;

CREATE OR REPLACE FUNCTION public._st_pointoutside(geography)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$geography_point_outside$function$
;

CREATE OR REPLACE FUNCTION public._st_sortablehash(geom geometry)
 RETURNS bigint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$_ST_SortableHash$function$
;

CREATE OR REPLACE FUNCTION public._st_touches(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$touches$function$
;

CREATE OR REPLACE FUNCTION public._st_voronoi(g1 geometry, clip geometry DEFAULT NULL::geometry, tolerance double precision DEFAULT 0.0, return_polygons boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 10000
AS '$libdir/postgis-3', $function$ST_Voronoi$function$
;

CREATE OR REPLACE FUNCTION public._st_within(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$SELECT public._ST_Contains($2,$1)$function$
;

CREATE OR REPLACE FUNCTION public.addauth(text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
	lockid alias for $1;
	okay boolean;
	myrec record;
BEGIN
	-- check to see if table exists
	--  if not, CREATE TEMP TABLE mylock (transid xid, lockcode text)
	okay := 'f';
	FOR myrec IN SELECT * FROM pg_class WHERE relname = 'temp_lock_have_table' LOOP
		okay := 't';
	END LOOP;
	IF (okay <> 't') THEN
		CREATE TEMP TABLE temp_lock_have_table (transid xid, lockcode text);
			-- this will only work from pgsql7.4 up
			-- ON COMMIT DELETE ROWS;
	END IF;

	--  INSERT INTO mylock VALUES ( $1)
--	EXECUTE 'INSERT INTO temp_lock_have_table VALUES ( '||
--		quote_literal(getTransactionID()) || ',' ||
--		quote_literal(lockid) ||')';

	INSERT INTO temp_lock_have_table VALUES (getTransactionID(), lockid);

	RETURN true::boolean;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.addgeometrycolumn(schema_name character varying, table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STABLE STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.AddGeometryColumn('',$1,$2,$3,$4,$5,$6,$7) into ret;
	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.addgeometrycolumn(catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	rec RECORD;
	sr varchar;
	real_schema name;
	sql text;
	new_srid integer;

BEGIN

	-- Verify geometry type
	IF (postgis_type_name(new_type,new_dim) IS NULL )
	THEN
		RAISE EXCEPTION 'Invalid type name "%(%)" - valid ones are:
	POINT, MULTIPOINT,
	LINESTRING, MULTILINESTRING,
	POLYGON, MULTIPOLYGON,
	CIRCULARSTRING, COMPOUNDCURVE, MULTICURVE,
	CURVEPOLYGON, MULTISURFACE,
	GEOMETRY, GEOMETRYCOLLECTION,
	POINTM, MULTIPOINTM,
	LINESTRINGM, MULTILINESTRINGM,
	POLYGONM, MULTIPOLYGONM,
	CIRCULARSTRINGM, COMPOUNDCURVEM, MULTICURVEM
	CURVEPOLYGONM, MULTISURFACEM, TRIANGLE, TRIANGLEM,
	POLYHEDRALSURFACE, POLYHEDRALSURFACEM, TIN, TINM
	or GEOMETRYCOLLECTIONM', new_type, new_dim;
		RETURN 'fail';
	END IF;

	-- Verify dimension
	IF ( (new_dim >4) OR (new_dim <2) ) THEN
		RAISE EXCEPTION 'invalid dimension';
		RETURN 'fail';
	END IF;

	IF ( (new_type LIKE '%M') AND (new_dim!=3) ) THEN
		RAISE EXCEPTION 'TypeM needs 3 dimensions';
		RETURN 'fail';
	END IF;

	-- Verify SRID
	IF ( new_srid_in > 0 ) THEN
		IF new_srid_in > 998999 THEN
			RAISE EXCEPTION 'AddGeometryColumn() - SRID must be <= %', 998999;
		END IF;
		new_srid := new_srid_in;
		SELECT SRID INTO sr FROM spatial_ref_sys WHERE SRID = new_srid;
		IF NOT FOUND THEN
			RAISE EXCEPTION 'AddGeometryColumn() - invalid SRID';
			RETURN 'fail';
		END IF;
	ELSE
		new_srid := public.ST_SRID('POINT EMPTY'::public.geometry);
		IF ( new_srid_in != new_srid ) THEN
			RAISE NOTICE 'SRID value % converted to the officially unknown SRID value %', new_srid_in, new_srid;
		END IF;
	END IF;

	-- Verify schema
	IF ( schema_name IS NOT NULL AND schema_name != '' ) THEN
		sql := 'SELECT nspname FROM pg_namespace ' ||
			'WHERE text(nspname) = ' || quote_literal(schema_name) ||
			'LIMIT 1';
		RAISE DEBUG '%', sql;
		EXECUTE sql INTO real_schema;

		IF ( real_schema IS NULL ) THEN
			RAISE EXCEPTION 'Schema % is not a valid schemaname', quote_literal(schema_name);
			RETURN 'fail';
		END IF;
	END IF;

	IF ( real_schema IS NULL ) THEN
		RAISE DEBUG 'Detecting schema';
		sql := 'SELECT n.nspname AS schemaname ' ||
			'FROM pg_catalog.pg_class c ' ||
			  'JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace ' ||
			'WHERE c.relkind = ' || quote_literal('r') ||
			' AND n.nspname NOT IN (' || quote_literal('pg_catalog') || ', ' || quote_literal('pg_toast') || ')' ||
			' AND pg_catalog.pg_table_is_visible(c.oid)' ||
			' AND c.relname = ' || quote_literal(table_name);
		RAISE DEBUG '%', sql;
		EXECUTE sql INTO real_schema;

		IF ( real_schema IS NULL ) THEN
			RAISE EXCEPTION 'Table % does not occur in the search_path', quote_literal(table_name);
			RETURN 'fail';
		END IF;
	END IF;

	-- Add geometry column to table
	IF use_typmod THEN
		 sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD COLUMN ' || quote_ident(column_name) ||
			' geometry(' || public.postgis_type_name(new_type, new_dim) || ', ' || new_srid::text || ')';
		RAISE DEBUG '%', sql;
	ELSE
		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD COLUMN ' || quote_ident(column_name) ||
			' geometry ';
		RAISE DEBUG '%', sql;
	END IF;
	EXECUTE sql;

	IF NOT use_typmod THEN
		-- Add table CHECKs
		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD CONSTRAINT '
			|| quote_ident('enforce_srid_' || column_name)
			|| ' CHECK (st_srid(' || quote_ident(column_name) ||
			') = ' || new_srid::text || ')' ;
		RAISE DEBUG '%', sql;
		EXECUTE sql;

		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD CONSTRAINT '
			|| quote_ident('enforce_dims_' || column_name)
			|| ' CHECK (st_ndims(' || quote_ident(column_name) ||
			') = ' || new_dim::text || ')' ;
		RAISE DEBUG '%', sql;
		EXECUTE sql;

		IF ( NOT (new_type = 'GEOMETRY')) THEN
			sql := 'ALTER TABLE ' ||
				quote_ident(real_schema) || '.' || quote_ident(table_name) || ' ADD CONSTRAINT ' ||
				quote_ident('enforce_geotype_' || column_name) ||
				' CHECK (GeometryType(' ||
				quote_ident(column_name) || ')=' ||
				quote_literal(new_type) || ' OR (' ||
				quote_ident(column_name) || ') is null)';
			RAISE DEBUG '%', sql;
			EXECUTE sql;
		END IF;
	END IF;

	RETURN
		real_schema || '.' ||
		table_name || '.' || column_name ||
		' SRID:' || new_srid::text ||
		' TYPE:' || new_type ||
		' DIMS:' || new_dim::text || ' ';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.addgeometrycolumn(table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.AddGeometryColumn('','',$1,$2,$3,$4,$5, $6) into ret;
	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_school_join_request(p_request_id uuid, p_reviewer_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  caller UUID := auth.uid();
  request_row public.school_join_requests%ROWTYPE;
  existing_bond public.bonds%ROWTYPE;
  created_bond public.bonds%ROWTYPE;
  membership_id UUID;
  reviewer_is_admin BOOLEAN;
  reviewer_is_school_lead BOOLEAN;
BEGIN
  IF caller IS NULL OR p_reviewer_id IS NULL OR caller <> p_reviewer_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated reviewer does not match caller');
  END IF;

  SELECT * INTO request_row
  FROM public.school_join_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND OR request_row.user_id IS NULL OR request_row.school_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Join request is incomplete or not found');
  END IF;

  IF request_row.status = 'approved' THEN
    SELECT * INTO existing_bond FROM public.bonds
    WHERE user_id = request_row.user_id
      AND entity_id = request_row.school_id::text
      AND entity_type = 'SCHOOL'
      AND lower(capacity) = lower(request_row.role)
    LIMIT 1;

    SELECT id INTO membership_id FROM public.school_memberships
    WHERE user_id = request_row.user_id
      AND school_id = request_row.school_id
      AND lower(role) = lower(request_row.role)
      AND status = 'active'
    LIMIT 1;

    RETURN jsonb_build_object(
      'success', true, 'already_approved', true,
      'request_id', request_row.id, 'user_id', request_row.user_id,
      'school_id', request_row.school_id, 'role', request_row.role,
      'bond_id', existing_bond.id, 'membership_id', membership_id
    );
  END IF;

  IF request_row.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only pending join requests can be approved');
  END IF;

  reviewer_is_admin := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller AND b.entity_type = 'PLATFORM'
      AND b.entity_id = 'GLOBAL' AND lower(b.capacity) = 'admin'
  );
  reviewer_is_school_lead := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller AND b.entity_type = 'SCHOOL'
      AND b.entity_id = request_row.school_id::text
      AND lower(b.capacity) IN ('principal', 'section_head')
  );

  IF NOT reviewer_is_admin AND NOT reviewer_is_school_lead THEN
    RETURN jsonb_build_object('success', false, 'message', 'School leadership or platform administration required');
  END IF;

  SELECT * INTO existing_bond FROM public.bonds
  WHERE user_id = request_row.user_id
    AND entity_id = request_row.school_id::text
    AND entity_type = 'SCHOOL'
    AND lower(capacity) = lower(request_row.role)
  LIMIT 1;

  IF FOUND THEN
    created_bond := existing_bond;
  ELSE
    INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata)
    VALUES (
      request_row.user_id,
      request_row.school_id::text,
      'SCHOOL',
      lower(request_row.role),
      jsonb_build_object('source', 'school_join_request', 'request_id', request_row.id)
    )
    RETURNING * INTO created_bond;
  END IF;

  membership_id := public.ensure_official_school_membership(
    request_row.user_id, request_row.school_id, request_row.role
  );

  INSERT INTO public.user_entitlement_grants (
    user_id, bond_id, scope_type, tier, modules, source
  )
  VALUES (
    request_row.user_id, created_bond.id, 'BOND', 'INSTITUTIONAL',
    ARRAY['school_workspace']::TEXT[], 'school_join_request'
  );

  UPDATE public.school_join_requests
  SET status = 'approved', updated_at = now()
  WHERE id = request_row.id;

  UPDATE public.users
  SET citizenship = 'FIRST_CLASS', school_id = request_row.school_id::text, updated_at = now()
  WHERE id = request_row.user_id;

  RETURN jsonb_build_object(
    'success', true, 'request_id', request_row.id,
    'user_id', request_row.user_id, 'school_id', request_row.school_id,
    'role', request_row.role, 'bond_id', created_bond.id,
    'membership_id', membership_id, 'citizenship', 'FIRST_CLASS'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_school_registry_claim(p_claim_id uuid, p_reviewer_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  caller UUID := auth.uid();
  claim_row public.school_registry_claims%ROWTYPE;
  linked_school public.schools%ROWTYPE;
  reviewer_is_admin BOOLEAN;
  reviewer_is_school_lead BOOLEAN;
BEGIN
  IF caller IS NULL OR p_reviewer_id IS NULL OR caller <> p_reviewer_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated reviewer does not match caller');
  END IF;

  SELECT * INTO claim_row
  FROM public.school_registry_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Registry claim not found');
  END IF;

  IF claim_row.status = 'approved' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_approved', true,
      'claim_id', claim_row.id,
      'school_id', claim_row.school_id,
      'edu_school_id', claim_row.edu_school_id
    );
  END IF;

  IF claim_row.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only pending claims can be approved');
  END IF;

  reviewer_is_admin := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller
      AND b.entity_type = 'PLATFORM'
      AND lower(b.capacity) = 'admin'
      AND b.entity_id = 'GLOBAL'
  );

  reviewer_is_school_lead := EXISTS (
    SELECT 1 FROM public.bonds b
    WHERE b.user_id = caller
      AND b.entity_type = 'SCHOOL'
      AND b.entity_id = claim_row.school_id::text
      AND lower(b.capacity) IN ('principal', 'section_head')
  );

  IF NOT reviewer_is_admin AND NOT reviewer_is_school_lead THEN
    RETURN jsonb_build_object('success', false, 'message', 'School leadership or platform administration required');
  END IF;

  SELECT * INTO linked_school
  FROM public.schools
  WHERE id = claim_row.school_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Target school tenant not found');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.schools s
    WHERE s.census_id = claim_row.edu_school_id
      AND s.id <> claim_row.school_id
      AND s.deleted_at IS NULL
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Canonical school is already linked to another active tenant');
  END IF;

  UPDATE public.schools
  SET census_id = claim_row.edu_school_id,
      last_census_sync = now(),
      sync_status = 'claimed',
      updated_at = now()
  WHERE id = claim_row.school_id;

  UPDATE public.school_registry_claims
  SET status = 'approved',
      reviewed_by = caller,
      reviewed_at = now(),
      claimed_at = now(),
      updated_at = now()
  WHERE id = claim_row.id;

  RETURN jsonb_build_object(
    'success', true,
    'claim_id', claim_row.id,
    'school_id', claim_row.school_id,
    'edu_school_id', claim_row.edu_school_id,
    'reviewed_by', caller
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(real[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(double precision[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(integer[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(numeric[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(double precision[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(numeric[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(real[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(integer[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(integer[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(real[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(double precision[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.array_to_vector(numeric[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$array_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.assign_collection_node_position()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role text, new_school_id uuid DEFAULT NULL::uuid, new_section_id uuid DEFAULT NULL::uuid, new_grade_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NOT (SELECT public.has_capacity('admin') OR public.has_capacity('founder')) THEN
    RAISE EXCEPTION 'Unauthorized: Only founders and admins can assign roles';
  END IF;

  INSERT INTO public.bonds (user_id, entity_id, capacity)
  VALUES (target_user_id, COALESCE(new_school_id::text, 'GLOBAL'), new_role)
  ON CONFLICT (user_id, entity_id, capacity) DO NOTHING;

  INSERT INTO public.audit_log (action, actor_id, target_user_id, new_role, new_school_id, created_at)
  VALUES ('capacity_assignment', auth.uid(), target_user_id, new_role, new_school_id, now());
END;
$function$
;

CREATE OR REPLACE FUNCTION public.binary_quantize(halfvec)
 RETURNS bit
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_binary_quantize$function$
;

CREATE OR REPLACE FUNCTION public.binary_quantize(vector)
 RETURNS bit
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$binary_quantize$function$
;

CREATE OR REPLACE FUNCTION public.box(geometry)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX$function$
;

CREATE OR REPLACE FUNCTION public.box(box3d)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX$function$
;

CREATE OR REPLACE FUNCTION public.box2d(box3d)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX2D$function$
;

CREATE OR REPLACE FUNCTION public.box2d(geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX2D$function$
;

CREATE OR REPLACE FUNCTION public.box2d_in(cstring)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_in$function$
;

CREATE OR REPLACE FUNCTION public.box2d_out(box2d)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_out$function$
;

CREATE OR REPLACE FUNCTION public.box2df_in(cstring)
 RETURNS box2df
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$box2df_in$function$
;

CREATE OR REPLACE FUNCTION public.box2df_out(box2df)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$box2df_out$function$
;

CREATE OR REPLACE FUNCTION public.box3d(geometry)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX3D$function$
;

CREATE OR REPLACE FUNCTION public.box3d(box2d)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX2D_to_BOX3D$function$
;

CREATE OR REPLACE FUNCTION public.box3d_in(cstring)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_in$function$
;

CREATE OR REPLACE FUNCTION public.box3d_out(box3d)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_out$function$
;

CREATE OR REPLACE FUNCTION public.box3dtobox(box3d)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX$function$
;

CREATE OR REPLACE FUNCTION public.bytea(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_bytea$function$
;

CREATE OR REPLACE FUNCTION public.bytea(geography)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_to_bytea$function$
;

CREATE OR REPLACE FUNCTION public.capture_community_entity_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.capture_community_profile_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    target public.community_groups;
begin
    target := case when tg_op = 'DELETE' then old else new end;

    insert into public.community_profile_versions (
        community_id,
        school_id,
        creator_id,
        operation,
        snapshot,
        recorded_at,
        recorded_by
    )
    values (
        target.id,
        target.school_id,
        target.created_by,
        lower(tg_op),
        jsonb_build_object(
            'id', target.id,
            'school_id', target.school_id,
            'name', target.name,
            'description', target.description,
            'is_public', target.is_public,
            'member_count', target.member_count,
            'created_by', target.created_by,
            'join_policy', target.join_policy,
            'group_type', target.group_type,
            'handle', target.handle,
            'image_url', target.image_url,
            'created_at', target.created_at
        ),
        coalesce(target.created_at, now()),
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.capture_library_entity_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.capture_student_longitudinal_event_generic()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_record record;
    snapshot jsonb;
    entity_kind text := tg_argv[0];
    student_column text := tg_argv[1];
    classroom_column text := tg_argv[2];
    school_column text := tg_argv[3];
    occurred_column text := tg_argv[4];
    effective_from_column text := tg_argv[5];
    effective_to_column text := tg_argv[6];
    
    student_value uuid;
    classroom_value uuid;
    school_value uuid;
    grade_value uuid; 
    occurred_value timestamptz;
    effective_from_value timestamptz;
    effective_to_value timestamptz;
BEGIN
    target_record := CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
    snapshot := to_jsonb(target_record);

    -- Identify the student
    IF COALESCE(student_column, '') = '' OR COALESCE(snapshot ->> student_column, '') = '' THEN
        IF TG_TABLE_NAME = 'users' THEN
            student_value := (snapshot ->> 'id')::uuid;
        ELSE
            RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
        END IF;
    ELSE
        student_value := (snapshot ->> student_column)::uuid;
    END IF;

    -- Extract / Lookup context
    IF COALESCE(classroom_column, '') <> '' AND COALESCE(snapshot ->> classroom_column, '') <> '' THEN
        classroom_value := (snapshot ->> classroom_column)::uuid;
    END IF;

    -- CRUCIAL FIX: Look for context in the Faceted Profile, not the God User
    SELECT u.school_id, sp.current_grade_id::uuid 
    INTO school_value, grade_value
    FROM public.users u
    LEFT JOIN public.student_profiles sp ON sp.user_id = u.id
    WHERE u.id = student_value;

    -- Timing
    IF COALESCE(occurred_column, '') <> '' AND COALESCE(snapshot ->> occurred_column, '') <> '' THEN
        occurred_value := (snapshot ->> occurred_column)::timestamptz;
    ELSE
        occurred_value := NOW();
    END IF;

    INSERT INTO public.student_longitudinal_events (
        student_id, school_id, grade_id, classroom_id,
        entity_type, entity_id, operation, source_table,
        snapshot, occurred_at, recorded_at, effective_from, 
        effective_to, recorded_by
    )
    VALUES (
        student_value, school_value, grade_value, classroom_value,
        entity_kind, 
        CASE WHEN snapshot ? 'id' THEN snapshot ->> 'id' ELSE md5(snapshot::text) END,
        LOWER(TG_OP), TG_TABLE_NAME, snapshot, occurred_value, NOW(), 
        occurred_value, CASE WHEN TG_OP = 'DELETE' THEN NOW() ELSE NULL END,
        auth.uid()
    );

    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.capture_student_longitudinal_study_note_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    target_record record;
    snapshot jsonb;
    operation_kind text;
    classroom_record record;
begin
    if tg_op = 'UPDATE' then
        if old.note_type = 'personal' and new.note_type <> 'personal' then
            target_record := old;
            operation_kind := 'delete';
        elsif old.note_type <> 'personal' and new.note_type = 'personal' then
            target_record := new;
            operation_kind := 'insert';
        elsif new.note_type = 'personal' then
            target_record := new;
            operation_kind := 'update';
        else
            return new;
        end if;
    elsif tg_op = 'DELETE' then
        if old.note_type <> 'personal' then
            return old;
        end if;
        target_record := old;
        operation_kind := 'delete';
    else
        if new.note_type <> 'personal' then
            return new;
        end if;
        target_record := new;
        operation_kind := 'insert';
    end if;

    snapshot := to_jsonb(target_record);

    select c.id, c.school_id
    into classroom_record
    from public.classrooms c
    where c.id = (snapshot ->> 'classroom_id')::uuid;

    insert into public.student_longitudinal_events (
        student_id,
        school_id,
        classroom_id,
        entity_type,
        entity_id,
        operation,
        source_table,
        snapshot,
        occurred_at,
        recorded_at,
        effective_from,
        effective_to,
        recorded_by
    )
    values (
        (snapshot ->> 'author_id')::uuid,
        classroom_record.school_id,
        classroom_record.id,
        'study_note',
        (snapshot ->> 'id'),
        operation_kind,
        tg_table_name,
        snapshot,
        coalesce(nullif(snapshot ->> 'updated_at', '')::timestamptz, nullif(snapshot ->> 'created_at', '')::timestamptz, now()),
        now(),
        coalesce(nullif(snapshot ->> 'created_at', '')::timestamptz, now()),
        case when operation_kind = 'delete' then now() else null end,
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.capture_student_longitudinal_submission_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    target_record record;
    assignment_record record;
    classroom_record record;
    snapshot jsonb;
    occurred_value timestamptz;
begin
    target_record := case when tg_op = 'DELETE' then old else new end;
    snapshot := to_jsonb(target_record);

    select a.id, a.classroom_id, c.school_id
    into assignment_record
    from public.assignments a
    left join public.classrooms c on c.id = a.classroom_id
    where a.id = (snapshot ->> 'assignment_id')::uuid;

    occurred_value := coalesce(
        nullif(snapshot ->> 'submitted_at', '')::timestamptz,
        nullif(snapshot ->> 'graded_at', '')::timestamptz,
        now()
    );

    insert into public.student_longitudinal_events (
        student_id,
        school_id,
        classroom_id,
        entity_type,
        entity_id,
        operation,
        source_table,
        snapshot,
        occurred_at,
        recorded_at,
        effective_from,
        effective_to,
        recorded_by
    )
    values (
        (snapshot ->> 'student_id')::uuid,
        assignment_record.school_id,
        assignment_record.classroom_id,
        'submission',
        (snapshot ->> 'id'),
        lower(tg_op),
        tg_table_name,
        snapshot,
        occurred_value,
        now(),
        occurred_value,
        case when tg_op = 'DELETE' then now() else null end,
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.capture_user_growth_state_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    target public.user_growth_state;
begin
    target := case when tg_op = 'DELETE' then old else new end;

    insert into public.user_growth_state_versions (
        user_id,
        operation,
        snapshot,
        recorded_at,
        recorded_by
    )
    values (
        target.user_id,
        lower(tg_op),
        jsonb_build_object(
            'id', target.id,
            'user_id', target.user_id,
            'bhumi_stage', target.bhumi_stage,
            'presence_signals', target.presence_signals,
            'nourishing_signals', target.nourishing_signals,
            'witnessing_signals', target.witnessing_signals,
            'weaving_signals', target.weaving_signals,
            'blooming_signals', target.blooming_signals,
            'banyan_stage', target.banyan_stage,
            'peer_mentored_count', target.peer_mentored_count,
            'circles_facilitated_count', target.circles_facilitated_count,
            'river_stage', target.river_stage,
            'lessons_completed_count', target.lessons_completed_count,
            'reflections_submitted_count', target.reflections_submitted_count,
            'crystal_tier', target.crystal_tier,
            'crystals_found_count', target.crystals_found_count,
            'fractal_moments_count', target.fractal_moments_count,
            'last_seen_at', target.last_seen_at,
            'created_at', target.created_at,
            'updated_at', target.updated_at
        ),
        coalesce(target.updated_at, target.created_at, now()),
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.capture_user_profile_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_row JSONB;
BEGIN
    target_row := to_jsonb(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END);
    
    INSERT INTO public.user_profile_versions (
        user_id,
        operation,
        snapshot,
        recorded_at,
        recorded_by
    ) VALUES (
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        LOWER(TG_OP),
        target_row,
        now(),
        auth.uid()
    );
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.capture_user_rewards_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target public.user_rewards;
BEGIN
  target := CASE WHEN tg_op = 'DELETE' THEN old ELSE new END;

  INSERT INTO public.user_rewards_versions (
    user_id,
    operation,
    snapshot,
    recorded_at,
    recorded_by
  )
  VALUES (
    target.user_id,
    lower(tg_op),
    jsonb_build_object(
      'id', target.id,
      'user_id', target.user_id,
      'points', target.points,
      'badges', target.badges,
      'created_at', target.created_at,
      'updated_at', target.updated_at
    ),
    COALESCE(target.updated_at, target.created_at, now()),
    COALESCE(public.get_my_id(), auth.uid())
  );

  RETURN CASE WHEN tg_op = 'DELETE' THEN old ELSE new END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.checkauth(text, text, text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
	schema text;
BEGIN
	IF NOT LongTransactionsEnabled() THEN
		RAISE EXCEPTION 'Long transaction support disabled, use EnableLongTransaction() to enable.';
	END IF;

	if ( $1 != '' ) THEN
		schema = $1;
	ELSE
		SELECT current_schema() into schema;
	END IF;

	-- TODO: check for an already existing trigger ?

	EXECUTE 'CREATE TRIGGER check_auth BEFORE UPDATE OR DELETE ON '
		|| quote_ident(schema) || '.' || quote_ident($2)
		||' FOR EACH ROW EXECUTE PROCEDURE CheckAuthTrigger('
		|| quote_literal($3) || ')';

	RETURN 0;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.checkauth(text, text)
 RETURNS integer
 LANGUAGE sql
AS $function$ SELECT CheckAuth('', $1, $2) $function$
;

CREATE OR REPLACE FUNCTION public.checkauthtrigger()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/postgis-3', $function$check_authorization$function$
;

CREATE OR REPLACE FUNCTION public.claim_invite_code(p_invite_code text, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  invite_row public.invite_codes%ROWTYPE;
  existing_bond public.bonds%ROWTYPE;
  created_bond public.bonds%ROWTYPE;
  requested_capacity TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated user does not match claim subject');
  END IF;

  SELECT * INTO invite_row
  FROM public.invite_codes
  WHERE code = p_invite_code
    AND is_active = true
    AND (max_uses IS NULL OR uses_count < max_uses)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invite code is invalid or exhausted');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_user_id AND is_anonymous = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Create or verify an account before joining an official school');
  END IF;

  requested_capacity := lower(invite_row.role);

  SELECT * INTO existing_bond
  FROM public.bonds
  WHERE user_id = p_user_id
    AND entity_id = invite_row.school_id::text
    AND entity_type = 'SCHOOL'
    AND lower(capacity) = requested_capacity
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'bond_id', existing_bond.id,
      'school_id', invite_row.school_id,
      'capacity', existing_bond.capacity,
      'already_claimed', true
    );
  END IF;

  UPDATE public.invite_codes
  SET uses_count = uses_count + 1,
      is_active = CASE WHEN max_uses IS NOT NULL AND uses_count + 1 >= max_uses THEN false ELSE is_active END
  WHERE id = invite_row.id;

  INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata)
  VALUES (
    p_user_id,
    invite_row.school_id::text,
    'SCHOOL',
    requested_capacity,
    jsonb_build_object('source', 'official_invite_code', 'invite_code_id', invite_row.id)
  )
  RETURNING * INTO created_bond;

  -- Keep school_id only as a compatibility projection. The bond is the
  -- authority for school scope and active perspective.
  UPDATE public.users
  SET citizenship = 'FIRST_CLASS',
      school_id = invite_row.school_id::text,
      updated_at = now()
  WHERE id = p_user_id;

  -- Official school membership receives institution-scoped base access. This
  -- does not alter the user's individual FREE/PRO plan.
  INSERT INTO public.user_entitlement_grants (
    user_id, bond_id, scope_type, tier, modules, source
  )
  VALUES (
    p_user_id,
    created_bond.id,
    'BOND',
    'INSTITUTIONAL',
    ARRAY['school_workspace']::TEXT[],
    'official_school_invite'
  );

  RETURN jsonb_build_object(
    'success', true,
    'bond_id', created_bond.id,
    'school_id', invite_row.school_id,
    'capacity', created_bond.capacity,
    'citizenship', 'FIRST_CLASS'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.claim_thuthimal_gift(p_token uuid, p_recipient uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_gift thuthimal_gifts;
BEGIN
  SELECT * INTO v_gift
  FROM thuthimal_gifts
  WHERE gift_token = p_token
    AND claimed = false
    AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_claimed_or_invalid'
    );
  END IF;

  UPDATE thuthimal_gifts
  SET
    claimed      = true,
    claimed_at   = now(),
    recipient_id = p_recipient
  WHERE id = v_gift.id;

  UPDATE users
  SET
    is_pro             = true,
    is_thuthimal       = true,
    thuthimal_gifter   = v_gift.gifter_name,
    thuthimal_gifted_at = now()
  WHERE id = p_recipient;

  RETURN jsonb_build_object(
    'success',      true,
    'gifter_name',  v_gift.gifter_name
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.contains_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$
;

CREATE OR REPLACE FUNCTION public.contains_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_geom_2d$function$
;

CREATE OR REPLACE FUNCTION public.contains_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.@) $1;$function$
;

CREATE OR REPLACE FUNCTION public.cosine_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$cosine_distance$function$
;

CREATE OR REPLACE FUNCTION public.cosine_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_cosine_distance$function$
;

CREATE OR REPLACE FUNCTION public.cosine_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_cosine_distance$function$
;

CREATE OR REPLACE FUNCTION public.create_school_founder_bond(p_school_id uuid, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  school_creator UUID;
  existing_bond public.bonds%ROWTYPE;
  created_bond public.bonds%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authenticated user does not match claim subject');
  END IF;

  SELECT created_by INTO school_creator FROM public.schools WHERE id = p_school_id;
  IF school_creator IS NULL OR school_creator <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only the official school creator may establish its founder bond');
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id AND is_anonymous = true) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Create or verify an account before establishing an official school');
  END IF;

  SELECT * INTO existing_bond FROM public.bonds
  WHERE user_id = p_user_id AND entity_id = p_school_id::text
    AND entity_type = 'SCHOOL' AND lower(capacity) = 'principal'
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'bond_id', existing_bond.id, 'already_exists', true);
  END IF;

  INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, metadata)
  VALUES (p_user_id, p_school_id::text, 'SCHOOL', 'principal', jsonb_build_object('source', 'official_school_creation'))
  RETURNING * INTO created_bond;

  UPDATE public.users
  SET citizenship = 'FIRST_CLASS', school_id = p_school_id::text, updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.user_entitlement_grants (user_id, bond_id, scope_type, tier, modules, source)
  VALUES (p_user_id, created_bond.id, 'BOND', 'INSTITUTIONAL', ARRAY['school_workspace']::TEXT[], 'official_school_creation');

  RETURN jsonb_build_object('success', true, 'bond_id', created_bond.id, 'citizenship', 'FIRST_CLASS');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_school_invite_code(p_school_id uuid, p_role text, p_created_by uuid, p_idempotency_key text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  normalized_role TEXT := lower(trim(p_role));
  existing_code public.invite_codes%ROWTYPE;
  created_code public.invite_codes%ROWTYPE;
  candidate TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_created_by THEN
    RAISE EXCEPTION 'Authenticated user does not match invite creator';
  END IF;

  IF normalized_role NOT IN (
    'teacher', 'student', 'principal', 'grade_head', 'section_head',
    'assistant_principal'
  ) THEN
    RAISE EXCEPTION 'Unsupported school invite role';
  END IF;

  IF NOT (
    public.has_capacity_in_school('principal', p_school_id)
    OR public.has_capacity_in_school('section_head', p_school_id)
    OR public.has_capacity('admin', 'GLOBAL')
  ) THEN
    RAISE EXCEPTION 'Only school leaders or platform administrators may create invites';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO existing_code
    FROM public.invite_codes
    WHERE school_id = p_school_id
      AND created_by = p_created_by
      AND idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF FOUND THEN
      RETURN to_jsonb(existing_code);
    END IF;
  END IF;

  LOOP
    candidate := 'GURU-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)) ||
      CASE WHEN normalized_role = 'teacher' THEN '-TEACH' ELSE '-ADMIN' END;
    BEGIN
      INSERT INTO public.invite_codes (
        school_id, code, role, created_by, idempotency_key, is_active
      )
      VALUES (
        p_school_id, candidate, normalized_role, p_created_by,
        p_idempotency_key, true
      )
      RETURNING * INTO created_code;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- A code collision is extraordinarily unlikely; retry with fresh bytes.
      IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO existing_code
        FROM public.invite_codes
        WHERE school_id = p_school_id
          AND created_by = p_created_by
          AND idempotency_key = p_idempotency_key
        FOR UPDATE;
        IF FOUND THEN
          RETURN to_jsonb(existing_code);
        END IF;
      END IF;
    END;
  END LOOP;

  RETURN to_jsonb(created_code);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
  DECLARE
    claims jsonb;
    internal_id uuid;
  BEGIN
    claims := event -> 'claims';
    
    -- Lookup the internal user ID associated with this Supabase User ID
    SELECT user_id INTO internal_id
    FROM public.auth_identities
    WHERE provider_user_id = (event ->> 'user_id')::text
    LIMIT 1;

    -- If found, inject it into the 'internal_user_id' claim
    IF internal_id IS NOT NULL THEN
      claims := jsonb_set(claims, '{internal_user_id}', to_jsonb(internal_id::text));
    END IF;

    -- Return the modified event object
    RETURN jsonb_set(event, '{claims}', claims);
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_resource_endorsements(resource_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE library_resources SET endorsements = GREATEST(0, endorsements - 1) WHERE id = resource_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_user_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Deleting from auth.users will trigger ON DELETE CASCADE to public.users
  -- and other tables linked to public.users(id)
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.disablelongtransactions()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	rec RECORD;

BEGIN

	--
	-- Drop all triggers applied by CheckAuth()
	--
	FOR rec IN
		SELECT c.relname, t.tgname, t.tgargs FROM pg_trigger t, pg_class c, pg_proc p
		WHERE p.proname = 'checkauthtrigger' and t.tgfoid = p.oid and t.tgrelid = c.oid
	LOOP
		EXECUTE 'DROP TRIGGER ' || quote_ident(rec.tgname) ||
			' ON ' || quote_ident(rec.relname);
	END LOOP;

	--
	-- Drop the authorization_table table
	--
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorization_table' LOOP
		DROP TABLE authorization_table;
	END LOOP;

	--
	-- Drop the authorized_tables view
	--
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorized_tables' LOOP
		DROP VIEW authorized_tables;
	END LOOP;

	RETURN 'Long transactions support disabled';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myrec RECORD;
	okay boolean;
	real_schema name;

BEGIN

	-- Find, check or fix schema_name
	IF ( schema_name != '' ) THEN
		okay = false;

		FOR myrec IN SELECT nspname FROM pg_namespace WHERE text(nspname) = schema_name LOOP
			okay := true;
		END LOOP;

		IF ( okay <>  true ) THEN
			RAISE NOTICE 'Invalid schema name - using current_schema()';
			SELECT current_schema() into real_schema;
		ELSE
			real_schema = schema_name;
		END IF;
	ELSE
		SELECT current_schema() into real_schema;
	END IF;

	-- Find out if the column is in the geometry_columns table
	okay = false;
	FOR myrec IN SELECT * from public.geometry_columns where f_table_schema = text(real_schema) and f_table_name = table_name and f_geometry_column = column_name LOOP
		okay := true;
	END LOOP;
	IF (okay <> true) THEN
		RAISE EXCEPTION 'column not found in geometry_columns table';
		RETURN false;
	END IF;

	-- Remove table column
	EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) || '.' ||
		quote_ident(table_name) || ' DROP COLUMN ' ||
		quote_ident(column_name);

	RETURN real_schema || '.' || table_name || '.' || column_name ||' effectively removed.';

END;
$function$
;

CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(schema_name character varying, table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret text;
BEGIN
	SELECT public.DropGeometryColumn('',$1,$2,$3) into ret;
	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret text;
BEGIN
	SELECT public.DropGeometryColumn('','',$1,$2) into ret;
	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.dropgeometrytable(schema_name character varying, table_name character varying)
 RETURNS text
 LANGUAGE sql
 STRICT
AS $function$ SELECT public.DropGeometryTable('',$1,$2) $function$
;

CREATE OR REPLACE FUNCTION public.dropgeometrytable(table_name character varying)
 RETURNS text
 LANGUAGE sql
 STRICT
AS $function$ SELECT public.DropGeometryTable('','',$1) $function$
;

CREATE OR REPLACE FUNCTION public.dropgeometrytable(catalog_name character varying, schema_name character varying, table_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	real_schema name;

BEGIN

	IF ( schema_name = '' ) THEN
		SELECT current_schema() into real_schema;
	ELSE
		real_schema = schema_name;
	END IF;

	-- TODO: Should we warn if table doesn't exist probably instead just saying dropped
	-- Remove table
	EXECUTE 'DROP TABLE IF EXISTS '
		|| quote_ident(real_schema) || '.' ||
		quote_ident(table_name) || ' RESTRICT';

	RETURN
		real_schema || '.' ||
		table_name ||' dropped.';

END;
$function$
;

CREATE OR REPLACE FUNCTION public.enablelongtransactions()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	"query" text;
	exists bool;
	rec RECORD;

BEGIN

	exists = 'f';
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorization_table'
	LOOP
		exists = 't';
	END LOOP;

	IF NOT exists
	THEN
		"query" = 'CREATE TABLE authorization_table (
			toid oid, -- table oid
			rid text, -- row id
			expires timestamp,
			authid text
		)';
		EXECUTE "query";
	END IF;

	exists = 'f';
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorized_tables'
	LOOP
		exists = 't';
	END LOOP;

	IF NOT exists THEN
		"query" = 'CREATE VIEW authorized_tables AS ' ||
			'SELECT ' ||
			'n.nspname as schema, ' ||
			'c.relname as table, trim(' ||
			quote_literal(chr(92) || '000') ||
			' from t.tgargs) as id_column ' ||
			'FROM pg_trigger t, pg_class c, pg_proc p ' ||
			', pg_namespace n ' ||
			'WHERE p.proname = ' || quote_literal('checkauthtrigger') ||
			' AND c.relnamespace = n.oid' ||
			' AND t.tgfoid = p.oid and t.tgrelid = c.oid';
		EXECUTE "query";
	END IF;

	RETURN 'Long transactions support enabled';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_official_school_membership(p_user_id uuid, p_school_id uuid, p_role text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  membership_id UUID;
BEGIN
  INSERT INTO public.school_memberships AS sm (
    user_id, school_id, role, status, start_date, is_primary,
    created_at, updated_at, joined_at, deleted_at, left_at
  )
  VALUES (
    p_user_id, p_school_id, lower(p_role), 'active', now(), true,
    now(), now(), now(), NULL, NULL
  )
  ON CONFLICT (user_id, school_id, role, status)
  DO UPDATE SET
    start_date = COALESCE(sm.start_date, now()),
    updated_at = now(),
    joined_at = COALESCE(sm.joined_at, now()),
    deleted_at = NULL,
    left_at = NULL,
    deletion_reason = NULL,
    deleted_by = NULL
  RETURNING id INTO membership_id;

  RETURN membership_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_Equals$function$
;

CREATE OR REPLACE FUNCTION public.find_srid(character varying, character varying, character varying)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	schem varchar =  $1;
	tabl varchar = $2;
	sr int4;
BEGIN
-- if the table contains a . and the schema is empty
-- split the table into a schema and a table
-- otherwise drop through to default behavior
	IF ( schem = '' and strpos(tabl,'.') > 0 ) THEN
	 schem = substr(tabl,1,strpos(tabl,'.')-1);
	 tabl = substr(tabl,length(schem)+2);
	END IF;

	select SRID into sr from public.geometry_columns where (f_table_schema = schem or schem = '') and f_table_name = tabl and f_geometry_column = $3;
	IF NOT FOUND THEN
	   RAISE EXCEPTION 'find_srid() - could not find the corresponding SRID - is the geometry registered in the GEOMETRY_COLUMNS table?  Is there an uppercase/lowercase mismatch?';
	END IF;
	return sr;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_mapping_share_token(p_topology_id uuid, p_expires_days integer DEFAULT 7)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_token TEXT;
BEGIN
    v_token := encode(gen_random_bytes(16), 'hex');
    
    UPDATE public.mapping_topologies
    SET share_token = v_token,
        updated_at = now()
    WHERE id = p_topology_id 
      AND owner_id = auth.uid();
      
    RETURN v_token;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.geog_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
AS '$libdir/postgis-3', $function$geog_brin_inclusion_add_value$function$
;

CREATE OR REPLACE FUNCTION public.geography(geometry)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_from_geometry$function$
;

CREATE OR REPLACE FUNCTION public.geography(bytea)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_from_binary$function$
;

CREATE OR REPLACE FUNCTION public.geography(geography, integer, boolean)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_enforce_typmod$function$
;

CREATE OR REPLACE FUNCTION public.geography_analyze(internal)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/postgis-3', $function$gserialized_analyze_nd$function$
;

CREATE OR REPLACE FUNCTION public.geography_cmp(geography, geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_cmp$function$
;

CREATE OR REPLACE FUNCTION public.geography_distance_knn(geography, geography)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 100
AS '$libdir/postgis-3', $function$geography_distance_knn$function$
;

CREATE OR REPLACE FUNCTION public.geography_eq(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_eq$function$
;

CREATE OR REPLACE FUNCTION public.geography_ge(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_ge$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_compress(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_compress$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_consistent(internal, geography, integer)
 RETURNS boolean
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_consistent$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_decompress(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_decompress$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_distance(internal, geography, integer)
 RETURNS double precision
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_geog_distance$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_penalty$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_picksplit$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_same(box2d, box2d, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_same$function$
;

CREATE OR REPLACE FUNCTION public.geography_gist_union(bytea, internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$gserialized_gist_union$function$
;

CREATE OR REPLACE FUNCTION public.geography_gt(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_gt$function$
;

CREATE OR REPLACE FUNCTION public.geography_in(cstring, oid, integer)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_in$function$
;

CREATE OR REPLACE FUNCTION public.geography_le(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_le$function$
;

CREATE OR REPLACE FUNCTION public.geography_lt(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_lt$function$
;

CREATE OR REPLACE FUNCTION public.geography_out(geography)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_out$function$
;

CREATE OR REPLACE FUNCTION public.geography_overlaps(geography, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps$function$
;

CREATE OR REPLACE FUNCTION public.geography_recv(internal, oid, integer)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_recv$function$
;

CREATE OR REPLACE FUNCTION public.geography_send(geography)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_send$function$
;

CREATE OR REPLACE FUNCTION public.geography_spgist_choose_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_nd$function$
;

CREATE OR REPLACE FUNCTION public.geography_spgist_compress_nd(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_nd$function$
;

CREATE OR REPLACE FUNCTION public.geography_spgist_config_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_nd$function$
;

CREATE OR REPLACE FUNCTION public.geography_spgist_inner_consistent_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_nd$function$
;

CREATE OR REPLACE FUNCTION public.geography_spgist_leaf_consistent_nd(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_nd$function$
;

CREATE OR REPLACE FUNCTION public.geography_spgist_picksplit_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_nd$function$
;

CREATE OR REPLACE FUNCTION public.geography_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.geography_typmod_out(integer)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_out$function$
;

CREATE OR REPLACE FUNCTION public.geom2d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom2d_brin_inclusion_add_value$function$
;

CREATE OR REPLACE FUNCTION public.geom3d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom3d_brin_inclusion_add_value$function$
;

CREATE OR REPLACE FUNCTION public.geom4d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom4d_brin_inclusion_add_value$function$
;

CREATE OR REPLACE FUNCTION public.geometry(geography)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_from_geography$function$
;

CREATE OR REPLACE FUNCTION public.geometry(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$
;

CREATE OR REPLACE FUNCTION public.geometry(polygon)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$polygon_to_geometry$function$
;

CREATE OR REPLACE FUNCTION public.geometry(point)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$point_to_geometry$function$
;

CREATE OR REPLACE FUNCTION public.geometry(path)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$path_to_geometry$function$
;

CREATE OR REPLACE FUNCTION public.geometry(geometry, integer, boolean)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_enforce_typmod$function$
;

CREATE OR REPLACE FUNCTION public.geometry(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_from_bytea$function$
;

CREATE OR REPLACE FUNCTION public.geometry(box3d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_LWGEOM$function$
;

CREATE OR REPLACE FUNCTION public.geometry(box2d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX2D_to_LWGEOM$function$
;

CREATE OR REPLACE FUNCTION public.geometry_above(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_above_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_analyze(internal)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/postgis-3', $function$gserialized_analyze_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_below(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_below_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_cmp(geom1 geometry, geom2 geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_cmp$function$
;

CREATE OR REPLACE FUNCTION public.geometry_contained_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contained_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_contains(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_contains_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_contains_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains$function$
;

CREATE OR REPLACE FUNCTION public.geometry_distance_box(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_distance_box_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_distance_centroid(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_Distance$function$
;

CREATE OR REPLACE FUNCTION public.geometry_distance_centroid_nd(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_distance_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_distance_cpa(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_DistanceCPA$function$
;

CREATE OR REPLACE FUNCTION public.geometry_eq(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_eq$function$
;

CREATE OR REPLACE FUNCTION public.geometry_ge(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_ge$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_compress_2d(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_compress_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_compress_nd(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_compress$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_consistent_2d(internal, geometry, integer)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_consistent_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_consistent_nd(internal, geometry, integer)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_consistent$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_decompress_2d(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_decompress_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_decompress_nd(internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_decompress$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_distance_2d(internal, geometry, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_distance_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_distance_nd(internal, geometry, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_distance$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_penalty_2d(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_penalty_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_penalty_nd(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_penalty$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_picksplit_2d(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_picksplit_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_picksplit_nd(internal, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_picksplit$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_same_2d(geom1 geometry, geom2 geometry, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_same_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_same_nd(geometry, geometry, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_same$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_sortsupport_2d(internal)
 RETURNS void
 LANGUAGE c
 STRICT
AS '$libdir/postgis-3', $function$gserialized_gist_sortsupport_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_union_2d(bytea, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_union_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gist_union_nd(bytea, internal)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_union$function$
;

CREATE OR REPLACE FUNCTION public.geometry_gt(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_gt$function$
;

CREATE OR REPLACE FUNCTION public.geometry_hash(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_hash$function$
;

CREATE OR REPLACE FUNCTION public.geometry_in(cstring)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_in$function$
;

CREATE OR REPLACE FUNCTION public.geometry_le(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_le$function$
;

CREATE OR REPLACE FUNCTION public.geometry_left(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_left_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_lt(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_lt$function$
;

CREATE OR REPLACE FUNCTION public.geometry_out(geometry)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_out$function$
;

CREATE OR REPLACE FUNCTION public.geometry_overabove(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overabove_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_overbelow(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overbelow_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_overlaps(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_overlaps_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_overlaps_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps$function$
;

CREATE OR REPLACE FUNCTION public.geometry_overleft(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overleft_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_overright(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overright_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_recv(internal)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_recv$function$
;

CREATE OR REPLACE FUNCTION public.geometry_right(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_right_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_same(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_same_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_same_3d(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_same_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_same_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_same$function$
;

CREATE OR REPLACE FUNCTION public.geometry_send(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_send$function$
;

CREATE OR REPLACE FUNCTION public.geometry_sortsupport(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$lwgeom_sortsupport$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_choose_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_choose_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_choose_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_choose_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_compress_2d(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_compress_3d(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_compress_nd(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_compress_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_config_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_config_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_config_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_config_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_inner_consistent_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_inner_consistent_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_inner_consistent_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_inner_consistent_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_leaf_consistent_2d(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_leaf_consistent_3d(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_leaf_consistent_nd(internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_leaf_consistent_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_picksplit_2d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_picksplit_3d(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_3d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_spgist_picksplit_nd(internal, internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_spgist_picksplit_nd$function$
;

CREATE OR REPLACE FUNCTION public.geometry_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.geometry_typmod_out(integer)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_out$function$
;

CREATE OR REPLACE FUNCTION public.geometry_within(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_within_2d$function$
;

CREATE OR REPLACE FUNCTION public.geometry_within_nd(geometry, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_within$function$
;

CREATE OR REPLACE FUNCTION public.geometrytype(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_getTYPE$function$
;

CREATE OR REPLACE FUNCTION public.geometrytype(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_getTYPE$function$
;

CREATE OR REPLACE FUNCTION public.geomfromewkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOMFromEWKB$function$
;

CREATE OR REPLACE FUNCTION public.geomfromewkt(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$
;

CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_collection_membership_as_of(p_collection_id uuid, p_as_of timestamp with time zone DEFAULT now())
 RETURNS TABLE(node_id uuid, "position" integer, added_at timestamp with time zone, removed_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_daily_content_for_today(content_type text)
 RETURNS SETOF daily_content
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT *
  FROM daily_content
  WHERE type = content_type
    AND active = true
    AND date <= CURRENT_DATE
  ORDER BY date DESC
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_ecosystem_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    result JSONB;
    caller_is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.bonds 
        WHERE user_id = auth.uid() AND capacity = 'admin'
    ) INTO caller_is_admin;

    IF NOT caller_is_admin THEN
        RAISE EXCEPTION 'Access Denied: Admin privileges required.';
    END IF;

    SELECT jsonb_build_object(
        'total_schools',         (SELECT count(*)::int FROM public.schools),
        'total_users',           (SELECT count(*)::int FROM public.users),
        'total_students',        (SELECT count(*)::int FROM public.bonds WHERE capacity = 'student'),
        'total_teachers',        (SELECT count(*)::int FROM public.bonds WHERE capacity = 'teacher'),
        'total_principals',      (SELECT count(*)::int FROM public.bonds WHERE capacity = 'principal'),
        'total_classrooms',      (SELECT count(*)::int FROM public.classrooms),
        'generated_at',           NOW()
    ) INTO result;

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_active_school_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT school_id FROM teacher_profiles WHERE user_id = auth.uid() AND deleted_at IS NULL),
    (SELECT school_id FROM principal_profiles WHERE user_id = auth.uid() AND deleted_at IS NULL)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_device_trust(p_device_id uuid DEFAULT NULL::uuid, p_install_id text DEFAULT NULL::text)
 RETURNS TABLE(device_id uuid, install_id text, is_trusted boolean, model_name text, os_version text, platform text, last_seen_at timestamp with time zone, last_accessed_at timestamp with time zone, linked_account_id uuid)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT
        dr.device_id,
        dr.install_id,
        dr.is_trusted,
        dr.model_name,
        dr.os_version,
        dr.platform,
        dr.last_seen_at,
        da.last_accessed_at,
        da.account_id AS linked_account_id
    FROM public.device_registry dr
    JOIN public.device_accounts da
      ON da.device_id = dr.device_id
    WHERE da.account_id = public.get_my_id()
      AND (
          (p_device_id IS NOT NULL AND dr.device_id = p_device_id)
          OR (p_device_id IS NULL AND p_install_id IS NOT NULL AND dr.install_id = p_install_id)
          OR (p_device_id IS NULL AND p_install_id IS NULL)
      )
    ORDER BY da.last_accessed_at DESC NULLS LAST
    LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    -- First try the identity mapping table (preferred path for all users)
    SELECT COALESCE(
        (SELECT user_id FROM public.auth_identities
         WHERE provider_user_id = auth.uid()::text
         LIMIT 1),
        -- Fallback: for brand-new users whose trigger hasn't committed yet,
        -- or legacy users without an auth_identities row, return the Supabase auth UID directly.
        -- This is safe because handle_new_user always uses auth.uid() as the public user ID.
        auth.uid()
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_node_subjects_count()
 RETURNS TABLE(subject text, count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT unnest(subjects) as subject, count(*) as count
  FROM nodes
  WHERE subjects IS NOT NULL
  GROUP BY subject
  HAVING count(*) > 0
  ORDER BY count DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_node_topics_count()
 RETURNS TABLE(topic text, count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT unnest(topics) as topic, count(*) as count
  FROM nodes
  WHERE topics IS NOT NULL
  GROUP BY topic
  HAVING count(*) > 0
  ORDER BY count DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(target_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    uid1 UUID;
    uid2 UUID;
    conv_id UUID;
BEGIN
    -- Sort IDs to maintain unique pair constraint
    IF auth.uid() < target_user_id THEN
        uid1 := auth.uid();
        uid2 := target_user_id;
    ELSE
        uid1 := target_user_id;
        uid2 := auth.uid();
    END IF;

    -- Try to find existing
    SELECT id INTO conv_id
    FROM public.direct_conversations
    WHERE user1_id = uid1 AND user2_id = uid2;

    -- Create if not found
    IF conv_id IS NULL THEN
        INSERT INTO public.direct_conversations (user1_id, user2_id)
        VALUES (uid1, uid2)
        RETURNING id INTO conv_id;
    END IF;

    RETURN conv_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_proj4_from_srid(integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
	BEGIN
	RETURN proj4text::text FROM public.spatial_ref_sys WHERE srid= $1;
	END;
	$function$
;

CREATE OR REPLACE FUNCTION public.get_school_mapping_pulse(p_school_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_school_name TEXT;
    v_nodes JSONB;
    v_links JSONB;
BEGIN
    -- Get school name
    SELECT name INTO v_school_name FROM public.schools WHERE id = p_school_id;
    
    -- Construct nodes
    -- 1. School (Root)
    -- 2. Subjects (Mid-layer)
    -- 3. Classrooms (Leaves)
    WITH node_data AS (
        SELECT id::text as node_id, name as label, 'topic' as type, 'School' as "group"
        FROM public.schools 
        WHERE id = p_school_id
        
        UNION ALL
        
        SELECT DISTINCT 'subj-' || subject as node_id, subject as label, 'topic' as type, 'Department' as "group"
        FROM public.classrooms
        WHERE school_id = p_school_id AND subject IS NOT NULL
        
        UNION ALL
        
        SELECT id::text as node_id, name as label, 'topic' as type, subject as "group"
        FROM public.classrooms
        WHERE school_id = p_school_id
    )
    SELECT jsonb_agg(jsonb_build_object('id', node_id, 'label', label, 'type', type, 'group', "group"))
    INTO v_nodes
    FROM node_data;

    -- Construct links
    -- 1. School -> Subjects
    -- 2. Subjects -> Classrooms
    WITH link_data AS (
        SELECT p_school_id::text as source, 'subj-' || subject as target, 'manages' as relationship
        FROM public.classrooms
        WHERE school_id = p_school_id AND subject IS NOT NULL
        GROUP BY subject
        
        UNION ALL
        
        SELECT 'subj-' || subject as source, id::text as target, 'contains' as relationship
        FROM public.classrooms
        WHERE school_id = p_school_id AND subject IS NOT NULL
    )
    SELECT jsonb_agg(jsonb_build_object('source', source, 'target', target, 'relationship', relationship))
    INTO v_links
    FROM link_data;

    RETURN jsonb_build_object(
        'nodes', COALESCE(v_nodes, '[]'::jsonb),
        'links', COALESCE(v_links, '[]'::jsonb),
        'context', jsonb_build_object('title', COALESCE(v_school_name, 'School') || ' Topology Pulse')
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_student_longitudinal_history(target_student_id uuid, access_purpose text DEFAULT 'audit'::text)
 RETURNS TABLE(id uuid, student_id uuid, school_id uuid, grade_id uuid, classroom_id uuid, entity_type text, entity_id text, operation text, snapshot jsonb, occurred_at timestamp with time zone, recorded_at timestamp with time zone, effective_from timestamp with time zone, effective_to timestamp with time zone, recorded_by uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_accessor_id uuid := auth.uid();
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.bonds b
        JOIN public.users student ON student.id = target_student_id
        WHERE b.user_id = current_accessor_id
          AND b.entity_id = student.school_id::text
          AND b.capacity IN ('principal', 'admin', 'teacher')
    ) OR EXISTS (
        SELECT 1 FROM public.bonds WHERE user_id = current_accessor_id AND capacity = 'admin'
    ) OR target_student_id = current_accessor_id THEN
        RETURN QUERY
        SELECT sle.id, sle.student_id, sle.school_id, sle.grade_id, sle.classroom_id, sle.entity_type, sle.entity_id, sle.operation, sle.snapshot, sle.occurred_at, sle.recorded_at, sle.effective_from, sle.effective_to, sle.recorded_by
        FROM public.student_longitudinal_events sle
        WHERE sle.student_id = target_student_id
        ORDER BY sle.occurred_at DESC;
    ELSE
        RAISE EXCEPTION 'Insufficient permissions to access Student Record.';
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.gettransactionid()
 RETURNS xid
 LANGUAGE c
AS '$libdir/postgis-3', $function$getTransactionID$function$
;

CREATE OR REPLACE FUNCTION public.gidx_in(cstring)
 RETURNS gidx
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gidx_in$function$
;

CREATE OR REPLACE FUNCTION public.gidx_out(gidx)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gidx_out$function$
;

CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$
;

CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$
;

CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$
;

CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$
;

CREATE OR REPLACE FUNCTION public.gserialized_gist_joinsel_2d(internal, oid, internal, smallint)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_joinsel_2d$function$
;

CREATE OR REPLACE FUNCTION public.gserialized_gist_joinsel_nd(internal, oid, internal, smallint)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_joinsel_nd$function$
;

CREATE OR REPLACE FUNCTION public.gserialized_gist_sel_2d(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_sel_2d$function$
;

CREATE OR REPLACE FUNCTION public.gserialized_gist_sel_nd(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_sel_nd$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$
;

CREATE OR REPLACE FUNCTION public.halfvec(halfvec, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_accum(double precision[], halfvec)
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_accum$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_add(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_add$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_avg(double precision[])
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_avg$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_cmp(halfvec, halfvec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_cmp$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_combine$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_concat(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_concat$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_eq(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_eq$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_ge(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_ge$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_gt(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_gt$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_in(cstring, oid, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_in$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_l2_squared_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_squared_distance$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_le(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_le$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_lt(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_lt$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_mul(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_mul$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_ne(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_ne$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_negative_inner_product(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_negative_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_out(halfvec)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_out$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_recv(internal, oid, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_recv$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_send(halfvec)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_send$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_spherical_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_spherical_distance$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_sub(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_sub$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_to_float4(halfvec, integer, boolean)
 RETURNS real[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_to_float4$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_to_sparsevec(halfvec, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_to_vector(halfvec, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.halfvec_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.hamming_distance(bit, bit)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$hamming_distance$function$
;

CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_provider text;
  v_is_anonymous boolean;
  v_display_name text;
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_username text;
  v_capacity text;
BEGIN
  v_provider := COALESCE(new.raw_app_meta_data->>'provider', 'supabase');
  v_is_anonymous := COALESCE(new.is_anonymous, false);
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');
  v_first_name := NULLIF(new.raw_user_meta_data->>'first_name', '');
  v_last_name := NULLIF(new.raw_user_meta_data->>'last_name', '');
  v_username := NULLIF(new.raw_user_meta_data->>'username', '');
  
  -- Prioritize capacity but fall back to role for older clients/tests
  v_capacity := COALESCE(new.raw_user_meta_data->>'capacity', new.raw_user_meta_data->>'role');

  INSERT INTO public.users (id, email, display_name, full_name, first_name, last_name, username, avatar_url, capacity, is_anonymous, identity_state)
  VALUES (
    new.id,
    CASE WHEN v_is_anonymous THEN NULL ELSE new.email END,
    COALESCE(v_display_name, v_full_name, CASE WHEN v_is_anonymous THEN 'Guest' ELSE 'Sanctuary User' END),
    COALESCE(
      v_full_name,
      CASE
        WHEN v_first_name IS NOT NULL OR v_last_name IS NOT NULL
          THEN TRIM(CONCAT_WS(' ', COALESCE(v_first_name, ''), COALESCE(v_last_name, '')))
        WHEN v_is_anonymous THEN 'Guest'
        ELSE 'Sanctuary User'
      END
    ),
    v_first_name,
    v_last_name,
    v_username,
    new.raw_user_meta_data->>'avatar_url',
    CASE
        WHEN v_capacity IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer') THEN v_capacity
        WHEN v_is_anonymous THEN 'guest'
        ELSE NULL
      END,
    v_is_anonymous,
    CASE WHEN v_is_anonymous THEN 'anonymous' ELSE 'onboarded' END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = CASE WHEN EXCLUDED.is_anonymous THEN public.users.email ELSE COALESCE(EXCLUDED.email, public.users.email) END,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    username = COALESCE(EXCLUDED.username, public.users.username),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    is_anonymous = EXCLUDED.is_anonymous,
    identity_state = CASE WHEN EXCLUDED.is_anonymous THEN 'anonymous' ELSE COALESCE(public.users.identity_state, 'onboarded') END,
    capacity = CASE
      WHEN v_capacity IN ('founder','admin','principal','section_head','grade_head','teacher','student','guest','developer') THEN v_capacity
      WHEN EXCLUDED.is_anonymous THEN COALESCE(public.users.capacity, 'guest')
      ELSE public.users.capacity
    END,
    updated_at = now();

  INSERT INTO public.auth_identities (user_id, provider, provider_user_id)
  VALUES (new.id, v_provider, new.id::text)
  ON CONFLICT (provider, provider_user_id) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        updated_at = now();

  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_identity_link()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_email TEXT;
BEGIN
    -- Get the email from auth.users for the linked user
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;

    -- Update the user record to mark as not anonymous and sync email
    UPDATE public.users
    SET is_anonymous = false,
        email = COALESCE(public.users.email, v_email),
        updated_at = now()
    WHERE id = NEW.user_id AND (is_anonymous = true OR email IS NULL);

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_display_name text;
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_username text;
  v_is_anonymous boolean;
  v_capacity text;
BEGIN
  v_is_anonymous := COALESCE((new.raw_user_meta_data->>'is_anonymous')::boolean, (new.email IS NULL));
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');
  v_first_name := NULLIF(new.raw_user_meta_data->>'first_name', '');
  v_last_name := NULLIF(new.raw_user_meta_data->>'last_name', '');
  v_username := NULLIF(new.raw_user_meta_data->>'username', '');
  
  -- Prioritize capacity but fall back to role for older clients/tests
  v_capacity := COALESCE(new.raw_user_meta_data->>'capacity', new.raw_user_meta_data->>'role');

  INSERT INTO public.users (id, email, display_name, full_name, first_name, last_name, username, capacity, is_anonymous, identity_state)
  VALUES (
    new.id,
    COALESCE(new.email, 'anonymous@' || new.id::text),
    COALESCE(v_display_name, v_full_name, CASE WHEN v_is_anonymous THEN 'Guest User' ELSE 'Sanctuary User' END),
    COALESCE(v_full_name, CASE WHEN v_is_anonymous THEN 'Guest User' ELSE 'Sanctuary User' END),
    v_first_name,
    v_last_name,
    v_username,
    COALESCE(
      v_capacity, 
      CASE WHEN v_is_anonymous THEN 'guest' ELSE NULL END
    ),
    v_is_anonymous,
    CASE WHEN v_is_anonymous THEN 'anonymous' ELSE 'onboarded' END
  )
  ON CONFLICT (id) DO UPDATE SET
    is_anonymous = EXCLUDED.is_anonymous,
    display_name = CASE
      WHEN EXCLUDED.display_name IS NOT NULL THEN EXCLUDED.display_name
      WHEN EXCLUDED.first_name IS NOT NULL OR EXCLUDED.last_name IS NOT NULL
        THEN TRIM(CONCAT_WS(' ', COALESCE(EXCLUDED.first_name, public.users.first_name), COALESCE(EXCLUDED.last_name, public.users.last_name)))
      ELSE public.users.display_name
    END,
    full_name = CASE
      WHEN EXCLUDED.full_name IS NOT NULL THEN EXCLUDED.full_name
      WHEN EXCLUDED.first_name IS NOT NULL OR EXCLUDED.last_name IS NOT NULL
        THEN TRIM(CONCAT_WS(' ', COALESCE(EXCLUDED.first_name, public.users.first_name), COALESCE(EXCLUDED.last_name, public.users.last_name)))
      ELSE public.users.full_name
    END,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    username = COALESCE(EXCLUDED.username, public.users.username),
    identity_state = CASE WHEN EXCLUDED.is_anonymous THEN 'anonymous' ELSE COALESCE(public.users.identity_state, 'onboarded') END,
    email = CASE WHEN EXCLUDED.is_anonymous = false AND users.is_anonymous = true THEN EXCLUDED.email ELSE users.email END;

  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_school_membership_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- When a membership is created/updated, sync the context to the role-based profiles
    -- This maintains compatibility with current UI structures while using the Lattice.
    IF (NEW.role = 'teacher') THEN
        UPDATE public.teacher_profiles SET school_id = NEW.school_id WHERE user_id = NEW.user_id;
    ELSIF (NEW.role = 'principal') THEN
        UPDATE public.principal_profiles SET school_id = NEW.school_id WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync_after()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Initialize basic growth and preference facets (Essential for every human)
    INSERT INTO public.user_growth_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_social_state (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

    -- Capacity-specific facet initialization
    -- Note: school_id sync from users is deprecated; handles directly in facets/memberships
    IF (NEW.capacity = 'teacher') THEN
        INSERT INTO public.teacher_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.capacity = 'principal') THEN
        INSERT INTO public.principal_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF (NEW.capacity = 'student') THEN
        INSERT INTO public.student_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_row_defaults()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF (NEW.tier_id IS NULL) THEN
        NEW.tier_id := '8a45d2cf-0201-45d8-8ea9-e5a67fa24401';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_capacity(p_capacity text, p_entity_id text DEFAULT 'GLOBAL'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bonds 
    WHERE user_id = public.get_my_id() 
    AND capacity = p_capacity 
    AND entity_id = p_entity_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_capacity_in_school(p_capacity text, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bonds 
    WHERE user_id = public.get_my_id() 
    AND capacity = p_capacity 
    AND entity_id = p_school_id::text
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.hnsw_bit_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$hnsw_bit_support$function$
;

CREATE OR REPLACE FUNCTION public.hnsw_halfvec_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$hnsw_halfvec_support$function$
;

CREATE OR REPLACE FUNCTION public.hnsw_sparsevec_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$hnsw_sparsevec_support$function$
;

CREATE OR REPLACE FUNCTION public.hnswhandler(internal)
 RETURNS index_am_handler
 LANGUAGE c
AS '$libdir/vector', $function$hnswhandler$function$
;

CREATE OR REPLACE FUNCTION public.increment_growth_dimension(p_user_id uuid, p_column text)
 RETURNS user_growth_state
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_result public.user_growth_state;
BEGIN
    -- Whitelist valid dimensional columns
    IF p_column NOT IN (
        'presence_signals', 'nourishing_signals', 'witnessing_signals', 
        'weaving_signals', 'blooming_signals',
        'peer_mentored_count', 'circles_facilitated_count', 
        'lessons_completed_count', 'reflections_submitted_count', 
        'crystals_found_count', 'fractal_moments_count'
    ) THEN
        RAISE EXCEPTION 'Invalid dimension column: %', p_column;
    END IF;

    EXECUTE format(
        'INSERT INTO public.user_growth_state (user_id, %I, updated_at)
         VALUES ($1, 1, now())
         ON CONFLICT (user_id)
         DO UPDATE SET %I = user_growth_state.%I + 1, updated_at = now()
         RETURNING *',
        p_column, p_column, p_column
    )
    USING p_user_id
    INTO v_result;

    RETURN v_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_resource_endorsements(resource_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE library_resources SET endorsements = endorsements + 1 WHERE id = resource_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_resource_views(resource_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE library_resources SET views = views + 1 WHERE id = resource_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.inner_product(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$inner_product$function$
;

CREATE OR REPLACE FUNCTION public.inner_product(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.inner_product(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.is_active(target_record jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN (target_record ->> 'deleted_at') IS NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_contained_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_within_box2df_geom_2d$function$
;

CREATE OR REPLACE FUNCTION public.is_contained_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.~) $1;$function$
;

CREATE OR REPLACE FUNCTION public.is_contained_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$
;

CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.community_group_members
        WHERE group_id = p_group_id
          AND user_id = get_my_id()
          AND role = 'admin'
          AND status = 'active'
    );
$function$
;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM community_group_members
        WHERE group_id = p_group_id
          AND user_id = get_my_id()
          AND status = 'active'
    );
$function$
;

CREATE OR REPLACE FUNCTION public.is_onboarded(u_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Accept the flag from EITHER the growth-state table OR the primary users table.
    -- The API's completeOnboarding handler writes to public.users; the RLS migration
    -- originally only checked user_growth_state — this bridges the gap.
    RETURN EXISTS (
        SELECT 1 FROM public.user_growth_state
        WHERE user_id = u_id AND onboarding_completed = true
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = u_id AND onboarding_completed = true
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ivfflat_bit_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$ivfflat_bit_support$function$
;

CREATE OR REPLACE FUNCTION public.ivfflat_halfvec_support(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/vector', $function$ivfflat_halfvec_support$function$
;

CREATE OR REPLACE FUNCTION public.ivfflathandler(internal)
 RETURNS index_am_handler
 LANGUAGE c
AS '$libdir/vector', $function$ivfflathandler$function$
;

CREATE OR REPLACE FUNCTION public.jaccard_distance(bit, bit)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$jaccard_distance$function$
;

CREATE OR REPLACE FUNCTION public."json"(geometry)
 RETURNS json
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geometry_to_json$function$
;

CREATE OR REPLACE FUNCTION public.jsonb(geometry)
 RETURNS jsonb
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geometry_to_jsonb$function$
;

CREATE OR REPLACE FUNCTION public.l1_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l1_distance$function$
;

CREATE OR REPLACE FUNCTION public.l1_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l1_distance$function$
;

CREATE OR REPLACE FUNCTION public.l1_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$l1_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$l2_distance$function$
;

CREATE OR REPLACE FUNCTION public.l2_norm(halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_norm$function$
;

CREATE OR REPLACE FUNCTION public.l2_norm(sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_norm$function$
;

CREATE OR REPLACE FUNCTION public.l2_normalize(halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_l2_normalize$function$
;

CREATE OR REPLACE FUNCTION public.l2_normalize(sparsevec)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_normalize$function$
;

CREATE OR REPLACE FUNCTION public.l2_normalize(vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$l2_normalize$function$
;

CREATE OR REPLACE FUNCTION public.library_resource_search_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- We use array_to_string to join the subjects for text search indexing
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.subjects, ' '), '')), 'C');
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.link_my_device_account(p_device_id uuid, p_account_id uuid DEFAULT NULL::uuid)
 RETURNS device_accounts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_my_id UUID;
    v_account_id UUID;
    v_link public.device_accounts;
BEGIN
    v_my_id := public.get_my_id();
    v_account_id := COALESCE(p_account_id, v_my_id);

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to link a device account';
    END IF;

    IF v_account_id IS DISTINCT FROM v_my_id THEN
        RAISE EXCEPTION 'You may only link the current account to this device';
    END IF;

    IF p_device_id IS NULL THEN
        RAISE EXCEPTION 'device_id is required';
    END IF;

    PERFORM 1
    FROM public.device_registry
    WHERE device_id = p_device_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % is not registered', p_device_id;
    END IF;

    INSERT INTO public.device_accounts (
        device_id,
        account_id,
        last_accessed_at
    )
    VALUES (
        p_device_id,
        v_account_id,
        now()
    )
    ON CONFLICT (device_id, account_id) DO UPDATE
    SET last_accessed_at = now()
    RETURNING * INTO v_link;

    UPDATE public.device_registry
    SET last_seen_at = now()
    WHERE device_id = p_device_id;

    RETURN v_link;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.list_my_auth_events(p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, action text, metadata jsonb, created_at timestamp with time zone, account_id uuid, device_id uuid, install_id text, is_trusted boolean, model_name text, os_version text, platform text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT
        sal.id,
        sal.action,
        sal.metadata,
        sal.created_at,
        sal.account_id,
        sal.device_id,
        dr.install_id,
        dr.is_trusted,
        dr.model_name,
        dr.os_version,
        dr.platform
    FROM public.security_audit_logs sal
    LEFT JOIN public.device_registry dr
      ON dr.device_id = sal.device_id
    WHERE sal.account_id = public.get_my_id()
      AND sal.action LIKE 'AUTH_%'
    ORDER BY sal.created_at DESC
    LIMIT GREATEST(COALESCE(p_limit, 50), 1);
$function$
;

CREATE OR REPLACE FUNCTION public.lockrow(text, text, text)
 RETURNS integer
 LANGUAGE sql
 STRICT
AS $function$ SELECT LockRow(current_schema(), $1, $2, $3, now()::timestamp+'1:00'); $function$
;

CREATE OR REPLACE FUNCTION public.lockrow(text, text, text, text)
 RETURNS integer
 LANGUAGE sql
 STRICT
AS $function$ SELECT LockRow($1, $2, $3, $4, now()::timestamp+'1:00'); $function$
;

CREATE OR REPLACE FUNCTION public.lockrow(text, text, text, timestamp without time zone)
 RETURNS integer
 LANGUAGE sql
 STRICT
AS $function$ SELECT LockRow(current_schema(), $1, $2, $3, $4); $function$
;

CREATE OR REPLACE FUNCTION public.lockrow(text, text, text, text, timestamp without time zone)
 RETURNS integer
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myschema alias for $1;
	mytable alias for $2;
	myrid   alias for $3;
	authid alias for $4;
	expires alias for $5;
	ret int;
	mytoid oid;
	myrec RECORD;

BEGIN

	IF NOT LongTransactionsEnabled() THEN
		RAISE EXCEPTION 'Long transaction support disabled, use EnableLongTransaction() to enable.';
	END IF;

	EXECUTE 'DELETE FROM authorization_table WHERE expires < now()';

	SELECT c.oid INTO mytoid FROM pg_class c, pg_namespace n
		WHERE c.relname = mytable
		AND c.relnamespace = n.oid
		AND n.nspname = myschema;

	-- RAISE NOTICE 'toid: %', mytoid;

	FOR myrec IN SELECT * FROM authorization_table WHERE
		toid = mytoid AND rid = myrid
	LOOP
		IF myrec.authid != authid THEN
			RETURN 0;
		ELSE
			RETURN 1;
		END IF;
	END LOOP;

	EXECUTE 'INSERT INTO authorization_table VALUES ('||
		quote_literal(mytoid::text)||','||quote_literal(myrid)||
		','||quote_literal(expires::text)||
		','||quote_literal(authid) ||')';

	GET DIAGNOSTICS ret = ROW_COUNT;

	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_collection_node_event()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_my_device_audit(p_action text, p_device_id uuid DEFAULT NULL::uuid, p_account_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_my_id UUID;
    v_account_id UUID;
    v_log_id UUID;
BEGIN
    v_my_id := public.get_my_id();
    v_account_id := COALESCE(p_account_id, v_my_id);

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to write device audit logs';
    END IF;

    IF COALESCE(BTRIM(p_action), '') = '' THEN
        RAISE EXCEPTION 'action is required';
    END IF;

    IF v_account_id IS DISTINCT FROM v_my_id THEN
        RAISE EXCEPTION 'You may only write audit logs for the current account';
    END IF;

    IF p_device_id IS NOT NULL THEN
        PERFORM 1
        FROM public.device_accounts da
        WHERE da.device_id = p_device_id
          AND da.account_id = v_account_id;

        IF NOT FOUND THEN
            PERFORM 1
            FROM public.device_registry dr
            WHERE dr.device_id = p_device_id
              AND dr.created_by = v_account_id;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Device % is not linked to account %', p_device_id, v_account_id;
            END IF;
        END IF;
    END IF;

    INSERT INTO public.security_audit_logs (
        account_id,
        device_id,
        action,
        metadata,
        created_at
    )
    VALUES (
        v_account_id,
        p_device_id,
        BTRIM(p_action),
        COALESCE(p_metadata, '{}'::jsonb),
        now()
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.longtransactionsenabled()
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
	rec RECORD;
BEGIN
	FOR rec IN SELECT oid FROM pg_class WHERE relname = 'authorized_tables'
	LOOP
		return 't';
	END LOOP;
	return 'f';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.map_layers_search_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.layer_type, '')), 'C');
  return new;
END
$function$
;

CREATE OR REPLACE FUNCTION public.match_nodes(query_embedding vector, match_threshold double precision, match_count integer)
 RETURNS TABLE(id uuid, name text, similarity double precision, map_x double precision, map_y double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    nodes.id,
    nodes.name,
    1 - (nodes.embedding <=> query_embedding) AS similarity,
    nodes.map_x,
    nodes.map_y
  FROM nodes
  WHERE 1 - (nodes.embedding <=> query_embedding) > match_threshold
  ORDER BY nodes.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.nodes_search_vector_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.notify_on_grade()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_assignment_title TEXT;
BEGIN
  IF OLD.graded_at IS NULL AND NEW.graded_at IS NOT NULL THEN
    SELECT title INTO v_assignment_title FROM public.assignments WHERE id = NEW.assignment_id;
    INSERT INTO public.notifications(user_id, type, title, body, reference_id, reference_type)
    VALUES (
      NEW.student_id,
      'submission_graded',
      'Assignment Graded',
      COALESCE(v_assignment_title, 'Your assignment') || ' has been graded',
      NEW.id,
      'submission'
    );
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_on_group_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_author_name TEXT;
  v_group_name  TEXT;
BEGIN
  SELECT full_name INTO v_author_name FROM public.users WHERE id = NEW.author_id;
  SELECT name INTO v_group_name FROM public.community_groups WHERE id = NEW.group_id;

  -- Batch-insert one notification per active group member (excluding the author).
  -- Avoids the N+1 loop (one INSERT per member) by using INSERT ... SELECT.
  INSERT INTO public.notifications(user_id, type, title, body, reference_id, reference_type)
  SELECT
    m.user_id,
    'new_post',
    COALESCE(v_group_name, 'Group') || ': New Post',
    COALESCE(v_author_name, 'Someone') || ' posted in ' || COALESCE(v_group_name, 'your circle'),
    NEW.id,
    'post'
  FROM public.community_group_members m
  WHERE m.group_id = NEW.group_id
    AND m.user_id <> NEW.author_id
    AND m.status = 'active';

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_on_submission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_teacher_id UUID;
  v_assignment_title TEXT;
  v_student_name TEXT;
BEGIN
  -- Get teacher and assignment info
  SELECT a.title, c.teacher_id 
    INTO v_assignment_title, v_teacher_id
    FROM public.assignments a
    JOIN public.classrooms c ON c.id = a.classroom_id
    WHERE a.id = NEW.assignment_id;

  SELECT full_name INTO v_student_name FROM public.users WHERE id = NEW.student_id;

  IF v_teacher_id IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, type, title, body, reference_id, reference_type)
    VALUES (
      v_teacher_id,
      'new_submission',
      'New Submission',
      COALESCE(v_student_name, 'A student') || ' submitted ' || COALESCE(v_assignment_title, 'an assignment'),
      NEW.id,
      'submission'
    );
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps_box2df_geom_2d$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.&&) $1;$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_geog(gidx, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_geog_overlaps$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_geog(gidx, gidx)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_gidx_overlaps$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_geog(geography, gidx)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT $2 OPERATOR(public.&&) $1;$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_nd(gidx, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_geom_overlaps$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_nd(gidx, gidx)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_gidx_overlaps$function$
;

CREATE OR REPLACE FUNCTION public.overlaps_nd(geometry, gidx)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.&&&) $1;$function$
;

CREATE OR REPLACE FUNCTION public.path(geometry)
 RETURNS path
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_path$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, boolean)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, boolean, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asgeobuf_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asgeobuf_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asgeobuf_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_combinefn(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_combinefn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_deserialfn(bytea, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_deserialfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_serialfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_serialfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer, text, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, double precision)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, double precision, integer)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_clusterintersecting_finalfn(internal)
 RETURNS geometry[]
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_clusterintersecting_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_clusterwithin_finalfn(internal)
 RETURNS geometry[]
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_clusterwithin_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_collect_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_collect_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_makeline_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_makeline_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_polygonize_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_polygonize_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_combinefn(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_combinefn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_deserialfn(bytea, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_deserialfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_finalfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_serialfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_serialfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry, double precision)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_transfn$function$
;

CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_transfn$function$
;

CREATE OR REPLACE FUNCTION public.point(geometry)
 RETURNS point
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_point$function$
;

CREATE OR REPLACE FUNCTION public.polygon(geometry)
 RETURNS polygon
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_polygon$function$
;

CREATE OR REPLACE FUNCTION public.populate_geometry_columns(use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	inserted	integer;
	oldcount	integer;
	probed	  integer;
	stale	   integer;
	gcs		 RECORD;
	gc		  RECORD;
	gsrid	   integer;
	gndims	  integer;
	gtype	   text;
	query	   text;
	gc_is_valid boolean;

BEGIN
	SELECT count(*) INTO oldcount FROM public.geometry_columns;
	inserted := 0;

	-- Count the number of geometry columns in all tables and views
	SELECT count(DISTINCT c.oid) INTO probed
	FROM pg_class c,
		 pg_attribute a,
		 pg_type t,
		 pg_namespace n
	WHERE c.relkind IN('r','v','f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%' AND c.relname != 'raster_columns' ;

	-- Iterate through all non-dropped geometry columns
	RAISE DEBUG 'Processing Tables.....';

	FOR gcs IN
	SELECT DISTINCT ON (c.oid) c.oid, n.nspname, c.relname
		FROM pg_class c,
			 pg_attribute a,
			 pg_type t,
			 pg_namespace n
		WHERE c.relkind IN( 'r', 'f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%' AND c.relname != 'raster_columns'
	LOOP

		inserted := inserted + public.populate_geometry_columns(gcs.oid, use_typmod);
	END LOOP;

	IF oldcount > inserted THEN
		stale = oldcount-inserted;
	ELSE
		stale = 0;
	END IF;

	RETURN 'probed:' ||probed|| ' inserted:'||inserted;
END

$function$
;

CREATE OR REPLACE FUNCTION public.populate_geometry_columns(tbl_oid oid, use_typmod boolean DEFAULT true)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
	gcs		 RECORD;
	gc		  RECORD;
	gc_old	  RECORD;
	gsrid	   integer;
	gndims	  integer;
	gtype	   text;
	query	   text;
	gc_is_valid boolean;
	inserted	integer;
	constraint_successful boolean := false;

BEGIN
	inserted := 0;

	-- Iterate through all geometry columns in this table
	FOR gcs IN
	SELECT n.nspname, c.relname, a.attname, c.relkind
		FROM pg_class c,
			 pg_attribute a,
			 pg_type t,
			 pg_namespace n
		WHERE c.relkind IN('r', 'f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%'
		AND c.oid = tbl_oid
	LOOP

		RAISE DEBUG 'Processing column %.%.%', gcs.nspname, gcs.relname, gcs.attname;

		gc_is_valid := true;
		-- Find the srid, coord_dimension, and type of current geometry
		-- in geometry_columns -- which is now a view

		SELECT type, srid, coord_dimension, gcs.relkind INTO gc_old
			FROM geometry_columns
			WHERE f_table_schema = gcs.nspname AND f_table_name = gcs.relname AND f_geometry_column = gcs.attname;

		IF upper(gc_old.type) = 'GEOMETRY' THEN
		-- This is an unconstrained geometry we need to do something
		-- We need to figure out what to set the type by inspecting the data
			EXECUTE 'SELECT public.ST_srid(' || quote_ident(gcs.attname) || ') As srid, public.GeometryType(' || quote_ident(gcs.attname) || ') As type, public.ST_NDims(' || quote_ident(gcs.attname) || ') As dims ' ||
					 ' FROM ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) ||
					 ' WHERE ' || quote_ident(gcs.attname) || ' IS NOT NULL LIMIT 1;'
				INTO gc;
			IF gc IS NULL THEN -- there is no data so we can not determine geometry type
				RAISE WARNING 'No data in table %.%, so no information to determine geometry type and srid', gcs.nspname, gcs.relname;
				RETURN 0;
			END IF;
			gsrid := gc.srid; gtype := gc.type; gndims := gc.dims;

			IF use_typmod THEN
				BEGIN
					EXECUTE 'ALTER TABLE ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || ' ALTER COLUMN ' || quote_ident(gcs.attname) ||
						' TYPE geometry(' || postgis_type_name(gtype, gndims, true) || ', ' || gsrid::text  || ') ';
					inserted := inserted + 1;
				EXCEPTION
						WHEN invalid_parameter_value OR feature_not_supported THEN
						RAISE WARNING 'Could not convert ''%'' in ''%.%'' to use typmod with srid %, type %: %', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), gsrid, postgis_type_name(gtype, gndims, true), SQLERRM;
							gc_is_valid := false;
				END;

			ELSE
				-- Try to apply srid check to column
				constraint_successful = false;
				IF (gsrid > 0 AND postgis_constraint_srid(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) ||
								 ' ADD CONSTRAINT ' || quote_ident('enforce_srid_' || gcs.attname) ||
								 ' CHECK (ST_srid(' || quote_ident(gcs.attname) || ') = ' || gsrid || ')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							RAISE WARNING 'Not inserting ''%'' in ''%.%'' into geometry_columns: could not apply constraint CHECK (st_srid(%) = %)', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), quote_ident(gcs.attname), gsrid;
							gc_is_valid := false;
					END;
				END IF;

				-- Try to apply ndims check to column
				IF (gndims IS NOT NULL AND postgis_constraint_dims(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || '
								 ADD CONSTRAINT ' || quote_ident('enforce_dims_' || gcs.attname) || '
								 CHECK (st_ndims(' || quote_ident(gcs.attname) || ') = '||gndims||')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							RAISE WARNING 'Not inserting ''%'' in ''%.%'' into geometry_columns: could not apply constraint CHECK (st_ndims(%) = %)', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), quote_ident(gcs.attname), gndims;
							gc_is_valid := false;
					END;
				END IF;

				-- Try to apply geometrytype check to column
				IF (gtype IS NOT NULL AND postgis_constraint_type(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || '
						ADD CONSTRAINT ' || quote_ident('enforce_geotype_' || gcs.attname) || '
						CHECK (geometrytype(' || quote_ident(gcs.attname) || ') = ' || quote_literal(gtype) || ')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							-- No geometry check can be applied. This column contains a number of geometry types.
							RAISE WARNING 'Could not add geometry type check (%) to table column: %.%.%', gtype, quote_ident(gcs.nspname),quote_ident(gcs.relname),quote_ident(gcs.attname);
					END;
				END IF;
				 --only count if we were successful in applying at least one constraint
				IF constraint_successful THEN
					inserted := inserted + 1;
				END IF;
			END IF;
		END IF;

	END LOOP;

	RETURN inserted;
END

$function$
;

CREATE OR REPLACE FUNCTION public.postgis_addbbox(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_addBBOX$function$
;

CREATE OR REPLACE FUNCTION public.postgis_cache_bbox()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/postgis-3', $function$cache_bbox$function$
;

CREATE OR REPLACE FUNCTION public.postgis_constraint_dims(geomschema text, geomtable text, geomcolumn text)
 RETURNS integer
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 500
AS $function$
SELECT  replace(split_part(s.consrc, ' = ', 2), ')', '')::integer
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%ndims(% = %';
$function$
;

CREATE OR REPLACE FUNCTION public.postgis_constraint_srid(geomschema text, geomtable text, geomcolumn text)
 RETURNS integer
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 500
AS $function$
SELECT replace(replace(split_part(s.consrc, ' = ', 2), ')', ''), '(', '')::integer
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%srid(% = %';
$function$
;

CREATE OR REPLACE FUNCTION public.postgis_constraint_type(geomschema text, geomtable text, geomcolumn text)
 RETURNS character varying
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 500
AS $function$
SELECT  replace(split_part(s.consrc, '''', 2), ')', '')::varchar
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%geometrytype(% = %';
$function$
;

CREATE OR REPLACE FUNCTION public.postgis_dropbbox(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_dropBBOX$function$
;

CREATE OR REPLACE FUNCTION public.postgis_extensions_upgrade()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	rec record;
	sql text;
	var_schema text;
	target_version text; -- TODO: optionally take as argument
BEGIN

	FOR rec IN
		SELECT name, default_version, installed_version
		FROM pg_catalog.pg_available_extensions
		WHERE name IN (
			'postgis',
			'postgis_raster',
			'postgis_sfcgal',
			'postgis_topology',
			'postgis_tiger_geocoder'
		)
		ORDER BY length(name) -- this is to make sure 'postgis' is first !
	LOOP --{

		IF target_version IS NULL THEN
			target_version := rec.default_version;
		END IF;

		IF rec.installed_version IS NULL THEN --{
			-- If the support installed by available extension
			-- is found unpackaged, we package it
			IF --{
				 -- PostGIS is always available (this function is part of it)
				 rec.name = 'postgis'

				 -- PostGIS raster is available if type 'raster' exists
				 OR ( rec.name = 'postgis_raster' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_type
							WHERE typname = 'raster' ) )

				 -- PostGIS SFCGAL is availble if
				 -- 'postgis_sfcgal_version' function exists
				 OR ( rec.name = 'postgis_sfcgal' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_proc
							WHERE proname = 'postgis_sfcgal_version' ) )

				 -- PostGIS Topology is available if
				 -- 'topology.topology' table exists
				 -- NOTE: watch out for https://trac.osgeo.org/postgis/ticket/2503
				 OR ( rec.name = 'postgis_topology' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_class c
							JOIN pg_catalog.pg_namespace n ON (c.relnamespace = n.oid )
							WHERE n.nspname = 'topology' AND c.relname = 'topology') )

				 OR ( rec.name = 'postgis_tiger_geocoder' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_class c
							JOIN pg_catalog.pg_namespace n ON (c.relnamespace = n.oid )
							WHERE n.nspname = 'tiger' AND c.relname = 'geocode_settings') )
			THEN --}{
				-- Force install in same schema as postgis
				SELECT INTO var_schema n.nspname
				  FROM pg_namespace n, pg_proc p
				  WHERE p.proname = 'postgis_full_version'
					AND n.oid = p.pronamespace
				  LIMIT 1;
				IF rec.name NOT IN('postgis_topology', 'postgis_tiger_geocoder')
				THEN
					sql := format(
							  'CREATE EXTENSION %1$I SCHEMA %2$I VERSION unpackaged;'
							  'ALTER EXTENSION %1$I UPDATE TO %3$I',
							  rec.name, var_schema, target_version);
				ELSE
					sql := format(
							 'CREATE EXTENSION %1$I VERSION unpackaged;'
							 'ALTER EXTENSION %1$I UPDATE TO %2$I',
							 rec.name, target_version);
				END IF;
				RAISE NOTICE 'Packaging and updating %', rec.name;
				RAISE DEBUG '%', sql;
				EXECUTE sql;
			ELSE
				RAISE DEBUG 'Skipping % (not in use)', rec.name;
			END IF;
		ELSE -- IF target_version != rec.installed_version THEN --}{
			sql = '';
			-- If logged in as super user
			-- force an update regardless if at target version, no downgrade allowed
			IF (SELECT usesuper FROM pg_user WHERE usename = CURRENT_USER)
						AND pg_catalog.substring(target_version, '[0-9]+\.[0-9]+\.[0-9]+')
								>= pg_catalog.substring(rec.installed_version, '[0-9]+\.[0-9]+\.[0-9]+')
			THEN
				sql = format(
					'UPDATE pg_catalog.pg_extension SET extversion = ''ANY'' WHERE extname = %1$L;'
					'ALTER EXTENSION %1$I UPDATE TO %2$I',
					rec.name, target_version
				);
			-- sandboxed users do standard upgrade
			ELSE
				sql = format(
				'ALTER EXTENSION %1$I UPDATE TO %2$I',
				rec.name, target_version
				);
			END IF;
			RAISE NOTICE 'Updating extension % %',
				rec.name, rec.installed_version;
			RAISE DEBUG '%', sql;
			EXECUTE sql;
		END IF; --}

	END LOOP; --}

	RETURN format(
		'Upgrade to version %s completed, run SELECT postgis_full_version(); for details',
		target_version
	);


END
$function$
;

CREATE OR REPLACE FUNCTION public.postgis_full_version()
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
	libver text;
	librev text;
	projver text;
	geosver text;
	sfcgalver text;
	gdalver text := NULL;
	libxmlver text;
	liblwgeomver text;
	dbproc text;
	relproc text;
	fullver text;
	rast_lib_ver text := NULL;
	rast_scr_ver text := NULL;
	topo_scr_ver text := NULL;
	json_lib_ver text;
	protobuf_lib_ver text;
	wagyu_lib_ver text;
	sfcgal_lib_ver text;
	sfcgal_scr_ver text;
	pgsql_scr_ver text;
	pgsql_ver text;
	core_is_extension bool;
BEGIN
	SELECT public.postgis_lib_version() INTO libver;
	SELECT public.postgis_proj_version() INTO projver;
	SELECT public.postgis_geos_version() INTO geosver;
	SELECT public.postgis_libjson_version() INTO json_lib_ver;
	SELECT public.postgis_libprotobuf_version() INTO protobuf_lib_ver;
	SELECT public.postgis_wagyu_version() INTO wagyu_lib_ver;
	SELECT public._postgis_scripts_pgsql_version() INTO pgsql_scr_ver;
	SELECT public._postgis_pgsql_version() INTO pgsql_ver;
	BEGIN
		SELECT public.postgis_gdal_version() INTO gdalver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_gdal_version() not found.  Is raster support enabled and rtpostgis.sql installed?';
	END;
	BEGIN
		SELECT public.postgis_sfcgal_full_version() INTO sfcgalver;
		BEGIN
			SELECT public.postgis_sfcgal_scripts_installed() INTO sfcgal_scr_ver;
		EXCEPTION
			WHEN undefined_function THEN
				sfcgal_scr_ver := 'missing';
		END;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_sfcgal_scripts_installed() not found. Is sfcgal support enabled and sfcgal.sql installed?';
	END;
	SELECT public.postgis_liblwgeom_version() INTO liblwgeomver;
	SELECT public.postgis_libxml_version() INTO libxmlver;
	SELECT public.postgis_scripts_installed() INTO dbproc;
	SELECT public.postgis_scripts_released() INTO relproc;
	SELECT public.postgis_lib_revision() INTO librev;
	BEGIN
		SELECT topology.postgis_topology_scripts_installed() INTO topo_scr_ver;
	EXCEPTION
		WHEN undefined_function OR invalid_schema_name THEN
			RAISE DEBUG 'Function postgis_topology_scripts_installed() not found. Is topology support enabled and topology.sql installed?';
		WHEN insufficient_privilege THEN
			RAISE NOTICE 'Topology support cannot be inspected. Is current user granted USAGE on schema "topology" ?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_topology_scripts_installed() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	BEGIN
		SELECT postgis_raster_scripts_installed() INTO rast_scr_ver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_raster_scripts_installed() not found. Is raster support enabled and rtpostgis.sql installed?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_raster_scripts_installed() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	BEGIN
		SELECT public.postgis_raster_lib_version() INTO rast_lib_ver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_raster_lib_version() not found. Is raster support enabled and rtpostgis.sql installed?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_raster_lib_version() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	fullver = 'POSTGIS="' || libver;

	IF  librev IS NOT NULL THEN
		fullver = fullver || ' ' || librev;
	END IF;

	fullver = fullver || '"';

	IF EXISTS (
		SELECT * FROM pg_catalog.pg_extension
		WHERE extname = 'postgis')
	THEN
			fullver = fullver || ' [EXTENSION]';
			core_is_extension := true;
	ELSE
			core_is_extension := false;
	END IF;

	IF liblwgeomver != relproc THEN
		fullver = fullver || ' (liblwgeom version mismatch: "' || liblwgeomver || '")';
	END IF;

	fullver = fullver || ' PGSQL="' || pgsql_scr_ver || '"';
	IF pgsql_scr_ver != pgsql_ver THEN
		fullver = fullver || ' (procs need upgrade for use with PostgreSQL "' || pgsql_ver || '")';
	END IF;

	IF  geosver IS NOT NULL THEN
		fullver = fullver || ' GEOS="' || geosver || '"';
	END IF;

	IF  sfcgalver IS NOT NULL THEN
		fullver = fullver || ' SFCGAL="' || sfcgalver || '"';
	END IF;

	IF  projver IS NOT NULL THEN
		fullver = fullver || ' PROJ="' || projver || '"';
	END IF;

	IF  gdalver IS NOT NULL THEN
		fullver = fullver || ' GDAL="' || gdalver || '"';
	END IF;

	IF  libxmlver IS NOT NULL THEN
		fullver = fullver || ' LIBXML="' || libxmlver || '"';
	END IF;

	IF json_lib_ver IS NOT NULL THEN
		fullver = fullver || ' LIBJSON="' || json_lib_ver || '"';
	END IF;

	IF protobuf_lib_ver IS NOT NULL THEN
		fullver = fullver || ' LIBPROTOBUF="' || protobuf_lib_ver || '"';
	END IF;

	IF wagyu_lib_ver IS NOT NULL THEN
		fullver = fullver || ' WAGYU="' || wagyu_lib_ver || '"';
	END IF;

	IF dbproc != relproc THEN
		fullver = fullver || ' (core procs from "' || dbproc || '" need upgrade)';
	END IF;

	IF topo_scr_ver IS NOT NULL THEN
		fullver = fullver || ' TOPOLOGY';
		IF topo_scr_ver != relproc THEN
			fullver = fullver || ' (topology procs from "' || topo_scr_ver || '" need upgrade)';
		END IF;
		IF core_is_extension AND NOT EXISTS (
			SELECT * FROM pg_catalog.pg_extension
			WHERE extname = 'postgis_topology')
		THEN
				fullver = fullver || ' [UNPACKAGED!]';
		END IF;
	END IF;

	IF rast_lib_ver IS NOT NULL THEN
		fullver = fullver || ' RASTER';
		IF rast_lib_ver != relproc THEN
			fullver = fullver || ' (raster lib from "' || rast_lib_ver || '" need upgrade)';
		END IF;
		IF core_is_extension AND NOT EXISTS (
			SELECT * FROM pg_catalog.pg_extension
			WHERE extname = 'postgis_raster')
		THEN
				fullver = fullver || ' [UNPACKAGED!]';
		END IF;
	END IF;

	IF rast_scr_ver IS NOT NULL AND rast_scr_ver != relproc THEN
		fullver = fullver || ' (raster procs from "' || rast_scr_ver || '" need upgrade)';
	END IF;

	IF sfcgal_scr_ver IS NOT NULL AND sfcgal_scr_ver != relproc THEN
		fullver = fullver || ' (sfcgal procs from "' || sfcgal_scr_ver || '" need upgrade)';
	END IF;

	-- Check for the presence of deprecated functions
	IF EXISTS ( SELECT oid FROM pg_catalog.pg_proc WHERE proname LIKE '%_deprecated_by_postgis_%' )
	THEN
		fullver = fullver || ' (deprecated functions exist, upgrade is not complete)';
	END IF;

	RETURN fullver;
END
$function$
;

CREATE OR REPLACE FUNCTION public.postgis_geos_noop(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$GEOSnoop$function$
;

CREATE OR REPLACE FUNCTION public.postgis_geos_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_geos_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_getbbox(geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX2DF$function$
;

CREATE OR REPLACE FUNCTION public.postgis_hasbbox(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_hasBBOX$function$
;

CREATE OR REPLACE FUNCTION public.postgis_index_supportfn(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$postgis_index_supportfn$function$
;

CREATE OR REPLACE FUNCTION public.postgis_lib_build_date()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_build_date$function$
;

CREATE OR REPLACE FUNCTION public.postgis_lib_revision()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_revision$function$
;

CREATE OR REPLACE FUNCTION public.postgis_lib_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_libjson_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_libjson_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_liblwgeom_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_liblwgeom_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_libprotobuf_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$postgis_libprotobuf_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_libxml_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_libxml_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_noop(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_noop$function$
;

CREATE OR REPLACE FUNCTION public.postgis_proj_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_proj_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_scripts_build_date()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT '2024-09-05 22:13:41'::text AS version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_scripts_installed()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$ SELECT trim('3.3.7'::text || $rev$ a0c7967 $rev$) AS version $function$
;

CREATE OR REPLACE FUNCTION public.postgis_scripts_released()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_scripts_released$function$
;

CREATE OR REPLACE FUNCTION public.postgis_svn_version()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
	SELECT public._postgis_deprecate(
		'postgis_svn_version', 'postgis_lib_revision', '3.1.0');
	SELECT public.postgis_lib_revision();
$function$
;

CREATE OR REPLACE FUNCTION public.postgis_transform_geometry(geom geometry, text, text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$transform_geom$function$
;

CREATE OR REPLACE FUNCTION public.postgis_type_name(geomname character varying, coord_dimension integer, use_new_name boolean DEFAULT true)
 RETURNS character varying
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$
	SELECT CASE WHEN $3 THEN new_name ELSE old_name END As geomname
	FROM
	( VALUES
			('GEOMETRY', 'Geometry', 2),
			('GEOMETRY', 'GeometryZ', 3),
			('GEOMETRYM', 'GeometryM', 3),
			('GEOMETRY', 'GeometryZM', 4),

			('GEOMETRYCOLLECTION', 'GeometryCollection', 2),
			('GEOMETRYCOLLECTION', 'GeometryCollectionZ', 3),
			('GEOMETRYCOLLECTIONM', 'GeometryCollectionM', 3),
			('GEOMETRYCOLLECTION', 'GeometryCollectionZM', 4),

			('POINT', 'Point', 2),
			('POINT', 'PointZ', 3),
			('POINTM','PointM', 3),
			('POINT', 'PointZM', 4),

			('MULTIPOINT','MultiPoint', 2),
			('MULTIPOINT','MultiPointZ', 3),
			('MULTIPOINTM','MultiPointM', 3),
			('MULTIPOINT','MultiPointZM', 4),

			('POLYGON', 'Polygon', 2),
			('POLYGON', 'PolygonZ', 3),
			('POLYGONM', 'PolygonM', 3),
			('POLYGON', 'PolygonZM', 4),

			('MULTIPOLYGON', 'MultiPolygon', 2),
			('MULTIPOLYGON', 'MultiPolygonZ', 3),
			('MULTIPOLYGONM', 'MultiPolygonM', 3),
			('MULTIPOLYGON', 'MultiPolygonZM', 4),

			('MULTILINESTRING', 'MultiLineString', 2),
			('MULTILINESTRING', 'MultiLineStringZ', 3),
			('MULTILINESTRINGM', 'MultiLineStringM', 3),
			('MULTILINESTRING', 'MultiLineStringZM', 4),

			('LINESTRING', 'LineString', 2),
			('LINESTRING', 'LineStringZ', 3),
			('LINESTRINGM', 'LineStringM', 3),
			('LINESTRING', 'LineStringZM', 4),

			('CIRCULARSTRING', 'CircularString', 2),
			('CIRCULARSTRING', 'CircularStringZ', 3),
			('CIRCULARSTRINGM', 'CircularStringM' ,3),
			('CIRCULARSTRING', 'CircularStringZM', 4),

			('COMPOUNDCURVE', 'CompoundCurve', 2),
			('COMPOUNDCURVE', 'CompoundCurveZ', 3),
			('COMPOUNDCURVEM', 'CompoundCurveM', 3),
			('COMPOUNDCURVE', 'CompoundCurveZM', 4),

			('CURVEPOLYGON', 'CurvePolygon', 2),
			('CURVEPOLYGON', 'CurvePolygonZ', 3),
			('CURVEPOLYGONM', 'CurvePolygonM', 3),
			('CURVEPOLYGON', 'CurvePolygonZM', 4),

			('MULTICURVE', 'MultiCurve', 2),
			('MULTICURVE', 'MultiCurveZ', 3),
			('MULTICURVEM', 'MultiCurveM', 3),
			('MULTICURVE', 'MultiCurveZM', 4),

			('MULTISURFACE', 'MultiSurface', 2),
			('MULTISURFACE', 'MultiSurfaceZ', 3),
			('MULTISURFACEM', 'MultiSurfaceM', 3),
			('MULTISURFACE', 'MultiSurfaceZM', 4),

			('POLYHEDRALSURFACE', 'PolyhedralSurface', 2),
			('POLYHEDRALSURFACE', 'PolyhedralSurfaceZ', 3),
			('POLYHEDRALSURFACEM', 'PolyhedralSurfaceM', 3),
			('POLYHEDRALSURFACE', 'PolyhedralSurfaceZM', 4),

			('TRIANGLE', 'Triangle', 2),
			('TRIANGLE', 'TriangleZ', 3),
			('TRIANGLEM', 'TriangleM', 3),
			('TRIANGLE', 'TriangleZM', 4),

			('TIN', 'Tin', 2),
			('TIN', 'TinZ', 3),
			('TINM', 'TinM', 3),
			('TIN', 'TinZM', 4) )
			 As g(old_name, new_name, coord_dimension)
	WHERE (upper(old_name) = upper($1) OR upper(new_name) = upper($1))
		AND coord_dimension = $2;
$function$
;

CREATE OR REPLACE FUNCTION public.postgis_typmod_dims(integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_dims$function$
;

CREATE OR REPLACE FUNCTION public.postgis_typmod_srid(integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_srid$function$
;

CREATE OR REPLACE FUNCTION public.postgis_typmod_type(integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_type$function$
;

CREATE OR REPLACE FUNCTION public.postgis_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_version$function$
;

CREATE OR REPLACE FUNCTION public.postgis_wagyu_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_wagyu_version$function$
;

CREATE OR REPLACE FUNCTION public.propagate_school_soft_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
        UPDATE public.classrooms SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by, 
            deletion_reason = 'Cascaded from school: ' || COALESCE(NEW.deletion_reason, 'None')
            WHERE school_id = NEW.id AND deleted_at IS NULL;
        UPDATE public.school_memberships SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by, status = 'archived'
            WHERE school_id = NEW.id AND deleted_at IS NULL;
    ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
        UPDATE public.school_memberships SET deleted_at = NULL, deleted_by = NULL, status = 'active'
            WHERE school_id = NEW.id AND deleted_at = OLD.deleted_at;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.propagate_user_soft_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
        UPDATE public.teacher_profiles SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by WHERE user_id = NEW.id;
        UPDATE public.principal_profiles SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by WHERE user_id = NEW.id;
        UPDATE public.student_profiles SET deleted_at = NEW.deleted_at, deleted_by = NEW.deleted_by WHERE user_id = NEW.id;
        UPDATE public.user_preferences SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.user_growth_state SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.user_social_state SET deleted_at = NEW.deleted_at WHERE user_id = NEW.id;
        UPDATE public.thuthimal_gifts SET deleted_at = NEW.deleted_at WHERE recipient_id = NEW.id;
    ELSIF (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL) THEN
        UPDATE public.teacher_profiles SET deleted_at = NULL, deleted_by = NULL WHERE user_id = NEW.id;
        UPDATE public.principal_profiles SET deleted_at = NULL, deleted_by = NULL WHERE user_id = NEW.id;
        UPDATE public."student_profiles" SET "deleted_at" = NULL, "deleted_by" = NULL WHERE "user_id" = NEW.id;
        UPDATE public.user_preferences SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.user_growth_state SET deleted_at = NULL WHERE user_id = NEW.id;
        UPDATE public.user_social_state SET deleted_at = NULL WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_collection_arrays_from_nodes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.register_my_device(p_install_id text, p_model_name text DEFAULT NULL::text, p_os_version text DEFAULT NULL::text, p_platform text DEFAULT NULL::text)
 RETURNS device_registry
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_my_id UUID;
    v_device public.device_registry;
BEGIN
    v_my_id := public.get_my_id();

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to register a device';
    END IF;

    IF COALESCE(BTRIM(p_install_id), '') = '' THEN
        RAISE EXCEPTION 'install_id is required';
    END IF;

    INSERT INTO public.device_registry (
        install_id,
        model_name,
        os_version,
        platform,
        created_by,
        last_seen_at
    )
    VALUES (
        p_install_id,
        NULLIF(BTRIM(p_model_name), ''),
        NULLIF(BTRIM(p_os_version), ''),
        NULLIF(BTRIM(p_platform), ''),
        v_my_id,
        now()
    )
    ON CONFLICT (install_id) DO UPDATE
    SET
        model_name = COALESCE(EXCLUDED.model_name, public.device_registry.model_name),
        os_version = COALESCE(EXCLUDED.os_version, public.device_registry.os_version),
        platform = COALESCE(EXCLUDED.platform, public.device_registry.platform),
        last_seen_at = now(),
        created_by = COALESCE(public.device_registry.created_by, EXCLUDED.created_by)
    RETURNING * INTO v_device;

    RETURN v_device;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.report_broken_link(resource_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.library_resources
    SET 
        fail_count = fail_count + 1,
        link_status = CASE WHEN fail_count + 1 >= 3 THEN 'broken' ELSE link_status END,
        last_checked_at = now()
    WHERE id = resource_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.revoke_school_bond(p_user_id uuid, p_school_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  caller UUID := auth.uid();
  target_bond UUID;
  remaining_school UUID;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Authentication required');
  END IF;

  IF caller <> p_user_id AND NOT EXISTS (
    SELECT 1 FROM public.bonds
    WHERE user_id = caller AND entity_type = 'PLATFORM' AND lower(capacity) = 'admin'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.bonds
    WHERE user_id = caller AND entity_id = p_school_id::text
      AND entity_type = 'SCHOOL' AND lower(capacity) IN ('principal', 'section_head')
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not permitted to revoke this school bond');
  END IF;

  SELECT id INTO target_bond FROM public.bonds
  WHERE user_id = p_user_id AND entity_id = p_school_id::text AND entity_type = 'SCHOOL';

  IF target_bond IS NULL THEN
    RETURN jsonb_build_object('success', true, 'already_revoked', true);
  END IF;

  DELETE FROM public.user_entitlement_grants WHERE bond_id = target_bond;
  DELETE FROM public.bonds WHERE id = target_bond;

  SELECT entity_id::uuid INTO remaining_school FROM public.bonds
  WHERE user_id = p_user_id AND entity_type = 'SCHOOL'
  ORDER BY created_at ASC LIMIT 1;

  UPDATE public.users
  SET school_id = remaining_school::text,
      citizenship = CASE WHEN remaining_school IS NULL THEN 'SECOND_CLASS' ELSE 'FIRST_CLASS' END,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'remaining_school_id', remaining_school);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_library(query_text text, query_embedding vector DEFAULT NULL::vector, filter_type text DEFAULT NULL::text, filter_subjects text[] DEFAULT NULL::text[], match_count integer DEFAULT 20, match_threshold double precision DEFAULT 0.5)
 RETURNS TABLE(id uuid, title text, description text, url text, type text, subjects text[], is_community boolean, similarity double precision, search_rank real)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.title,
    n.description,
    n.url,
    n.type,
    n.subjects,
    n.is_community,
    CASE 
      WHEN query_embedding IS NOT NULL THEN (1 - (n.embedding <=> query_embedding))::double precision
      ELSE 0::double precision
    END as similarity,
    ts_rank_cd(to_tsvector('english', n.title || ' ' || COALESCE(n.description, '')), websearch_to_tsquery('english', query_text)) as search_rank
  FROM public.nodes n
  WHERE
    (query_text IS NULL OR to_tsvector('english', n.title || ' ' || COALESCE(n.description, '')) @@ websearch_to_tsquery('english', query_text))
    AND (filter_type IS NULL OR n.type = filter_type)
    AND (filter_subjects IS NULL OR n.subjects && filter_subjects)
    AND (query_embedding IS NULL OR (1 - (n.embedding <=> query_embedding)) > match_threshold)
  ORDER BY
    search_rank DESC,
    similarity DESC
  LIMIT match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_map_universe(query_text text, match_count integer DEFAULT 10)
 RETURNS TABLE(result_type text, id uuid, name text, description text, layer_type text, projection_type text, rank real)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  -- 1. Search Layers
  SELECT
    'layer'::TEXT as result_type,
    ml.id,
    ml.name,
    ml.description,
    ml.layer_type,
    ml.projection_type,
    ts_rank_cd(ml.search_vector, websearch_to_tsquery('english', query_text)) as rank
  FROM public.map_layers ml
  WHERE ml.search_vector @@ websearch_to_tsquery('english', query_text)

  UNION ALL

  -- 2. Search Resources (Map Nodes)
  SELECT
    'resource'::TEXT as result_type,
    n.id,
    n.title as name,
    n.description,
    n.type as layer_type,
    CASE WHEN n.is_geographic THEN 'earth' ELSE 'cosmos' END as projection_type,
    ts_rank_cd(n.search_vector, websearch_to_tsquery('english', query_text)) as rank
  FROM public.nodes n
  WHERE n.search_vector @@ websearch_to_tsquery('english', query_text)
  
  ORDER BY rank DESC
  LIMIT match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.seed_collection_nodes_from_collection()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;   
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$
;

CREATE OR REPLACE FUNCTION public.set_row_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$
;

CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$
;

CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$
;

CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$
;

CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec(sparsevec, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_cmp(sparsevec, sparsevec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_cmp$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_eq(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_eq$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_ge(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_ge$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_gt(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_gt$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_in(cstring, oid, integer)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_in$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_l2_squared_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_l2_squared_distance$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_le(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_le$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_lt(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_lt$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_ne(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_ne$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_negative_inner_product(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_negative_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_out(sparsevec)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_out$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_recv(internal, oid, integer)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_recv$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_send(sparsevec)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_send$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_to_halfvec(sparsevec, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_to_vector(sparsevec, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_to_vector$function$
;

CREATE OR REPLACE FUNCTION public.sparsevec_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$sparsevec_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.spheroid_in(cstring)
 RETURNS spheroid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ellipsoid_in$function$
;

CREATE OR REPLACE FUNCTION public.spheroid_out(spheroid)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ellipsoid_out$function$
;

CREATE OR REPLACE FUNCTION public.st_3dclosestpoint(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_closestpoint3d$function$
;

CREATE OR REPLACE FUNCTION public.st_3ddfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin3d$function$
;

CREATE OR REPLACE FUNCTION public.st_3ddistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_3DDistance$function$
;

CREATE OR REPLACE FUNCTION public.st_3ddwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dwithin3d$function$
;

CREATE OR REPLACE FUNCTION public.st_3dintersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_3DIntersects$function$
;

CREATE OR REPLACE FUNCTION public.st_3dlength(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_length_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_3dlineinterpolatepoint(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_3DLineInterpolatePoint$function$
;

CREATE OR REPLACE FUNCTION public.st_3dlongestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_longestline3d$function$
;

CREATE OR REPLACE FUNCTION public.st_3dmakebox(geom1 geometry, geom2 geometry)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_construct$function$
;

CREATE OR REPLACE FUNCTION public.st_3dmaxdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_maxdistance3d$function$
;

CREATE OR REPLACE FUNCTION public.st_3dperimeter(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_perimeter_poly$function$
;

CREATE OR REPLACE FUNCTION public.st_3dshortestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_shortestline3d$function$
;

CREATE OR REPLACE FUNCTION public.st_addmeasure(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_AddMeasure$function$
;

CREATE OR REPLACE FUNCTION public.st_addpoint(geom1 geometry, geom2 geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_addpoint$function$
;

CREATE OR REPLACE FUNCTION public.st_addpoint(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_addpoint$function$
;

CREATE OR REPLACE FUNCTION public.st_affine(geometry, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_affine$function$
;

CREATE OR REPLACE FUNCTION public.st_affine(geometry, double precision, double precision, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  $2, $3, 0,  $4, $5, 0,  0, 0, 1,  $6, $7, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_angle(pt1 geometry, pt2 geometry, pt3 geometry, pt4 geometry DEFAULT '0101000000000000000000F87F000000000000F87F'::geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_angle$function$
;

CREATE OR REPLACE FUNCTION public.st_angle(line1 geometry, line2 geometry)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT ST_Angle(St_StartPoint($1), ST_EndPoint($1), St_StartPoint($2), ST_EndPoint($2))$function$
;

CREATE OR REPLACE FUNCTION public.st_area(text)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Area($1::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_area(geog geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_area$function$
;

CREATE OR REPLACE FUNCTION public.st_area(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Area$function$
;

CREATE OR REPLACE FUNCTION public.st_area2d(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Area$function$
;

CREATE OR REPLACE FUNCTION public.st_asbinary(geography)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

CREATE OR REPLACE FUNCTION public.st_asbinary(geometry, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

CREATE OR REPLACE FUNCTION public.st_asbinary(geography, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

CREATE OR REPLACE FUNCTION public.st_asbinary(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asBinary$function$
;

CREATE OR REPLACE FUNCTION public.st_asencodedpolyline(geom geometry, nprecision integer DEFAULT 5)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asEncodedPolyline$function$
;

CREATE OR REPLACE FUNCTION public.st_asewkb(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$WKBFromLWGEOM$function$
;

CREATE OR REPLACE FUNCTION public.st_asewkb(geometry, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$WKBFromLWGEOM$function$
;

CREATE OR REPLACE FUNCTION public.st_asewkt(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

CREATE OR REPLACE FUNCTION public.st_asewkt(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

CREATE OR REPLACE FUNCTION public.st_asewkt(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$ SELECT public.ST_AsEWKT($1::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_asewkt(geometry, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

CREATE OR REPLACE FUNCTION public.st_asewkt(geography, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asEWKT$function$
;

CREATE OR REPLACE FUNCTION public.st_asgeojson(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$ SELECT public.ST_AsGeoJson($1::public.geometry, 9, 0);  $function$
;

CREATE OR REPLACE FUNCTION public.st_asgeojson(geog geography, maxdecimaldigits integer DEFAULT 9, options integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_as_geojson$function$
;

CREATE OR REPLACE FUNCTION public.st_asgeojson(r record, geom_column text DEFAULT ''::text, maxdecimaldigits integer DEFAULT 9, pretty_bool boolean DEFAULT false)
 RETURNS text
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_AsGeoJsonRow$function$
;

CREATE OR REPLACE FUNCTION public.st_asgeojson(geom geometry, maxdecimaldigits integer DEFAULT 9, options integer DEFAULT 8)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asGeoJson$function$
;

CREATE OR REPLACE FUNCTION public.st_asgml(version integer, geog geography, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0, nprefix text DEFAULT 'gml'::text, id text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_as_gml$function$
;

CREATE OR REPLACE FUNCTION public.st_asgml(version integer, geom geometry, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0, nprefix text DEFAULT NULL::text, id text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asGML$function$
;

CREATE OR REPLACE FUNCTION public.st_asgml(geog geography, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0, nprefix text DEFAULT 'gml'::text, id text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_as_gml$function$
;

CREATE OR REPLACE FUNCTION public.st_asgml(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$ SELECT public._ST_AsGML(2,$1::public.geometry,15,0, NULL, NULL);  $function$
;

CREATE OR REPLACE FUNCTION public.st_asgml(geom geometry, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asGML$function$
;

CREATE OR REPLACE FUNCTION public.st_ashexewkb(geometry, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asHEXEWKB$function$
;

CREATE OR REPLACE FUNCTION public.st_ashexewkb(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_asHEXEWKB$function$
;

CREATE OR REPLACE FUNCTION public.st_askml(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$ SELECT public.ST_AsKML($1::public.geometry, 15);  $function$
;

CREATE OR REPLACE FUNCTION public.st_askml(geom geometry, maxdecimaldigits integer DEFAULT 15, nprefix text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asKML$function$
;

CREATE OR REPLACE FUNCTION public.st_askml(geog geography, maxdecimaldigits integer DEFAULT 15, nprefix text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_as_kml$function$
;

CREATE OR REPLACE FUNCTION public.st_aslatlontext(geom geometry, tmpl text DEFAULT ''::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_latlon$function$
;

CREATE OR REPLACE FUNCTION public.st_asmarc21(geom geometry, format text DEFAULT 'hdddmmss'::text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_AsMARC21$function$
;

CREATE OR REPLACE FUNCTION public.st_asmvtgeom(geom geometry, bounds box2d, extent integer DEFAULT 4096, buffer integer DEFAULT 256, clip_geom boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$ST_AsMVTGeom$function$
;

CREATE OR REPLACE FUNCTION public.st_assvg(geom geometry, rel integer DEFAULT 0, maxdecimaldigits integer DEFAULT 15)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asSVG$function$
;

CREATE OR REPLACE FUNCTION public.st_assvg(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$ SELECT public.ST_AsSVG($1::public.geometry,0,15);  $function$
;

CREATE OR REPLACE FUNCTION public.st_assvg(geog geography, rel integer DEFAULT 0, maxdecimaldigits integer DEFAULT 15)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_as_svg$function$
;

CREATE OR REPLACE FUNCTION public.st_astext(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$ SELECT public.ST_AsText($1::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_astext(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

CREATE OR REPLACE FUNCTION public.st_astext(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

CREATE OR REPLACE FUNCTION public.st_astext(geography, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

CREATE OR REPLACE FUNCTION public.st_astext(geometry, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asText$function$
;

CREATE OR REPLACE FUNCTION public.st_astwkb(geom geometry[], ids bigint[], prec integer DEFAULT NULL::integer, prec_z integer DEFAULT NULL::integer, prec_m integer DEFAULT NULL::integer, with_sizes boolean DEFAULT NULL::boolean, with_boxes boolean DEFAULT NULL::boolean)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$TWKBFromLWGEOMArray$function$
;

CREATE OR REPLACE FUNCTION public.st_astwkb(geom geometry, prec integer DEFAULT NULL::integer, prec_z integer DEFAULT NULL::integer, prec_m integer DEFAULT NULL::integer, with_sizes boolean DEFAULT NULL::boolean, with_boxes boolean DEFAULT NULL::boolean)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$TWKBFromLWGEOM$function$
;

CREATE OR REPLACE FUNCTION public.st_asx3d(geom geometry, maxdecimaldigits integer DEFAULT 15, options integer DEFAULT 0)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE COST 500
AS $function$SELECT public._ST_AsX3D(3,$1,$2,$3,'');$function$
;

CREATE OR REPLACE FUNCTION public.st_azimuth(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_azimuth$function$
;

CREATE OR REPLACE FUNCTION public.st_azimuth(geog1 geography, geog2 geography)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_azimuth$function$
;

CREATE OR REPLACE FUNCTION public.st_bdmpolyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	geomtext alias for $1;
	srid alias for $2;
	mline public.geometry;
	geom public.geometry;
BEGIN
	mline := public.ST_MultiLineStringFromText(geomtext, srid);

	IF mline IS NULL
	THEN
		RAISE EXCEPTION 'Input is not a MultiLinestring';
	END IF;

	geom := public.ST_Multi(public.ST_BuildArea(mline));

	RETURN geom;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.st_bdpolyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	geomtext alias for $1;
	srid alias for $2;
	mline public.geometry;
	geom public.geometry;
BEGIN
	mline := public.ST_MultiLineStringFromText(geomtext, srid);

	IF mline IS NULL
	THEN
		RAISE EXCEPTION 'Input is not a MultiLinestring';
	END IF;

	geom := public.ST_BuildArea(mline);

	IF public.GeometryType(geom) != 'POLYGON'
	THEN
		RAISE EXCEPTION 'Input returns more then a single polygon, try using BdMPolyFromText instead';
	END IF;

	RETURN geom;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.st_boundary(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$boundary$function$
;

CREATE OR REPLACE FUNCTION public.st_boundingdiagonal(geom geometry, fits boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ST_BoundingDiagonal$function$
;

CREATE OR REPLACE FUNCTION public.st_box2dfromgeohash(text, integer DEFAULT NULL::integer)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$box2d_from_geohash$function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(geography, double precision, integer)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Buffer(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1)), $2, $3), public.ST_SRID($1)))$function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(geom geometry, radius double precision, quadsegs integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$ SELECT public.ST_Buffer($1, $2, CAST('quad_segs='||CAST($3 AS text) as text)) $function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(geom geometry, radius double precision, options text DEFAULT ''::text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$buffer$function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(text, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Buffer($1::public.geometry, $2);  $function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(geography, double precision)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Buffer(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1)), $2), public.ST_SRID($1)))$function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(text, double precision, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Buffer($1::public.geometry, $2, $3);  $function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(text, double precision, text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Buffer($1::public.geometry, $2, $3);  $function$
;

CREATE OR REPLACE FUNCTION public.st_buffer(geography, double precision, text)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Buffer(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1)), $2, $3), public.ST_SRID($1)))$function$
;

CREATE OR REPLACE FUNCTION public.st_buildarea(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_BuildArea$function$
;

CREATE OR REPLACE FUNCTION public.st_centroid(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Centroid($1::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_centroid(geography, use_spheroid boolean DEFAULT true)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_centroid$function$
;

CREATE OR REPLACE FUNCTION public.st_centroid(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$centroid$function$
;

CREATE OR REPLACE FUNCTION public.st_chaikinsmoothing(geometry, integer DEFAULT 1, boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_ChaikinSmoothing$function$
;

CREATE OR REPLACE FUNCTION public.st_cleangeometry(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_CleanGeometry$function$
;

CREATE OR REPLACE FUNCTION public.st_clipbybox2d(geom geometry, box box2d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_ClipByBox2d$function$
;

CREATE OR REPLACE FUNCTION public.st_closestpoint(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_closestpoint$function$
;

CREATE OR REPLACE FUNCTION public.st_closestpointofapproach(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_ClosestPointOfApproach$function$
;

CREATE OR REPLACE FUNCTION public.st_clusterdbscan(geometry, eps double precision, minpoints integer)
 RETURNS integer
 LANGUAGE c
 WINDOW IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_ClusterDBSCAN$function$
;

CREATE OR REPLACE FUNCTION public.st_clusterintersecting(geometry[])
 RETURNS geometry[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$clusterintersecting_garray$function$
;

CREATE OR REPLACE FUNCTION public.st_clusterkmeans(geom geometry, k integer, max_radius double precision DEFAULT NULL::double precision)
 RETURNS integer
 LANGUAGE c
 WINDOW STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_ClusterKMeans$function$
;

CREATE OR REPLACE FUNCTION public.st_clusterwithin(geometry[], double precision)
 RETURNS geometry[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$cluster_within_distance_garray$function$
;

CREATE OR REPLACE FUNCTION public.st_collect(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$LWGEOM_collect$function$
;

CREATE OR REPLACE FUNCTION public.st_collect(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_collect_garray$function$
;

CREATE OR REPLACE FUNCTION public.st_collectionextract(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_CollectionExtract$function$
;

CREATE OR REPLACE FUNCTION public.st_collectionextract(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_CollectionExtract$function$
;

CREATE OR REPLACE FUNCTION public.st_collectionhomogenize(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_CollectionHomogenize$function$
;

CREATE OR REPLACE FUNCTION public.st_combinebbox(box3d, geometry)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$BOX3D_combine$function$
;

CREATE OR REPLACE FUNCTION public.st_combinebbox(box3d, box3d)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$BOX3D_combine_BOX3D$function$
;

CREATE OR REPLACE FUNCTION public.st_combinebbox(box2d, geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$BOX2D_combine$function$
;

CREATE OR REPLACE FUNCTION public.st_concavehull(param_geom geometry, param_pctconvex double precision, param_allow_holes boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_ConcaveHull$function$
;

CREATE OR REPLACE FUNCTION public.st_contains(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$contains$function$
;

CREATE OR REPLACE FUNCTION public.st_containsproperly(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$containsproperly$function$
;

CREATE OR REPLACE FUNCTION public.st_convexhull(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$convexhull$function$
;

CREATE OR REPLACE FUNCTION public.st_coorddim(geometry geometry)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_ndims$function$
;

CREATE OR REPLACE FUNCTION public.st_coveredby(text, text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_CoveredBy($1::public.geometry, $2::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_coveredby(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_coveredby$function$
;

CREATE OR REPLACE FUNCTION public.st_coveredby(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$coveredby$function$
;

CREATE OR REPLACE FUNCTION public.st_covers(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_covers$function$
;

CREATE OR REPLACE FUNCTION public.st_covers(text, text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_Covers($1::public.geometry, $2::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_covers(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$covers$function$
;

CREATE OR REPLACE FUNCTION public.st_cpawithin(geometry, geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_CPAWithin$function$
;

CREATE OR REPLACE FUNCTION public.st_crosses(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$crosses$function$
;

CREATE OR REPLACE FUNCTION public.st_curvetoline(geom geometry, tol double precision DEFAULT 32, toltype integer DEFAULT 0, flags integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_CurveToLine$function$
;

CREATE OR REPLACE FUNCTION public.st_delaunaytriangles(g1 geometry, tolerance double precision DEFAULT 0.0, flags integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_DelaunayTriangles$function$
;

CREATE OR REPLACE FUNCTION public.st_dfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin$function$
;

CREATE OR REPLACE FUNCTION public.st_difference(geom1 geometry, geom2 geometry, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Difference$function$
;

CREATE OR REPLACE FUNCTION public.st_dimension(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_dimension$function$
;

CREATE OR REPLACE FUNCTION public.st_disjoint(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$disjoint$function$
;

CREATE OR REPLACE FUNCTION public.st_distance(geog1 geography, geog2 geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_distance$function$
;

CREATE OR REPLACE FUNCTION public.st_distance(text, text)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Distance($1::public.geometry, $2::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_distance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Distance$function$
;

CREATE OR REPLACE FUNCTION public.st_distancecpa(geometry, geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_DistanceCPA$function$
;

CREATE OR REPLACE FUNCTION public.st_distancesphere(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$select public.ST_distance( public.geography($1), public.geography($2),false)$function$
;

CREATE OR REPLACE FUNCTION public.st_distancesphere(geom1 geometry, geom2 geometry, radius double precision)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_distance_sphere$function$
;

CREATE OR REPLACE FUNCTION public.st_distancespheroid(geom1 geometry, geom2 geometry, spheroid)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_distance_ellipsoid$function$
;

CREATE OR REPLACE FUNCTION public.st_distancespheroid(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_distance_ellipsoid$function$
;

CREATE OR REPLACE FUNCTION public.st_dump(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_dump$function$
;

CREATE OR REPLACE FUNCTION public.st_dumppoints(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dumppoints$function$
;

CREATE OR REPLACE FUNCTION public.st_dumprings(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_dump_rings$function$
;

CREATE OR REPLACE FUNCTION public.st_dumpsegments(geometry)
 RETURNS SETOF geometry_dump
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dumpsegments$function$
;

CREATE OR REPLACE FUNCTION public.st_dwithin(text, text, double precision)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_DWithin($1::public.geometry, $2::public.geometry, $3);  $function$
;

CREATE OR REPLACE FUNCTION public.st_dwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_dwithin$function$
;

CREATE OR REPLACE FUNCTION public.st_dwithin(geog1 geography, geog2 geography, tolerance double precision, use_spheroid boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_dwithin$function$
;

CREATE OR REPLACE FUNCTION public.st_endpoint(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_endpoint_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_envelope(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_envelope$function$
;

CREATE OR REPLACE FUNCTION public.st_equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_Equals$function$
;

CREATE OR REPLACE FUNCTION public.st_estimatedextent(text, text)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT SECURITY DEFINER
AS '$libdir/postgis-3', $function$gserialized_estimated_extent$function$
;

CREATE OR REPLACE FUNCTION public.st_estimatedextent(text, text, text)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT SECURITY DEFINER
AS '$libdir/postgis-3', $function$gserialized_estimated_extent$function$
;

CREATE OR REPLACE FUNCTION public.st_estimatedextent(text, text, text, boolean)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT SECURITY DEFINER
AS '$libdir/postgis-3', $function$gserialized_estimated_extent$function$
;

CREATE OR REPLACE FUNCTION public.st_expand(box3d, double precision)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_expand$function$
;

CREATE OR REPLACE FUNCTION public.st_expand(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_expand$function$
;

CREATE OR REPLACE FUNCTION public.st_expand(box box2d, dx double precision, dy double precision)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_expand$function$
;

CREATE OR REPLACE FUNCTION public.st_expand(box box3d, dx double precision, dy double precision, dz double precision DEFAULT 0)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_expand$function$
;

CREATE OR REPLACE FUNCTION public.st_expand(geom geometry, dx double precision, dy double precision, dz double precision DEFAULT 0, dm double precision DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_expand$function$
;

CREATE OR REPLACE FUNCTION public.st_expand(box2d, double precision)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_expand$function$
;

CREATE OR REPLACE FUNCTION public.st_exteriorring(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_exteriorring_polygon$function$
;

CREATE OR REPLACE FUNCTION public.st_filterbym(geometry, double precision, double precision DEFAULT NULL::double precision, boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$LWGEOM_FilterByM$function$
;

CREATE OR REPLACE FUNCTION public.st_findextent(text, text)
 RETURNS box2d
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	tablename alias for $1;
	columnname alias for $2;
	myrec RECORD;

BEGIN
	FOR myrec IN EXECUTE 'SELECT public.ST_Extent("' || columnname || '") As extent FROM "' || tablename || '"' LOOP
		return myrec.extent;
	END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.st_findextent(text, text, text)
 RETURNS box2d
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	schemaname alias for $1;
	tablename alias for $2;
	columnname alias for $3;
	myrec RECORD;
BEGIN
	FOR myrec IN EXECUTE 'SELECT public.ST_Extent("' || columnname || '") As extent FROM "' || schemaname || '"."' || tablename || '"' LOOP
		return myrec.extent;
	END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.st_flipcoordinates(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_FlipCoordinates$function$
;

CREATE OR REPLACE FUNCTION public.st_force2d(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_2d$function$
;

CREATE OR REPLACE FUNCTION public.st_force3d(geom geometry, zvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Force3DZ($1, $2)$function$
;

CREATE OR REPLACE FUNCTION public.st_force3dm(geom geometry, mvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_3dm$function$
;

CREATE OR REPLACE FUNCTION public.st_force3dz(geom geometry, zvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_3dz$function$
;

CREATE OR REPLACE FUNCTION public.st_force4d(geom geometry, zvalue double precision DEFAULT 0.0, mvalue double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_4d$function$
;

CREATE OR REPLACE FUNCTION public.st_forcecollection(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_collection$function$
;

CREATE OR REPLACE FUNCTION public.st_forcecurve(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_force_curve$function$
;

CREATE OR REPLACE FUNCTION public.st_forcepolygonccw(geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$ SELECT public.ST_Reverse(public.ST_ForcePolygonCW($1)) $function$
;

CREATE OR REPLACE FUNCTION public.st_forcepolygoncw(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_clockwise_poly$function$
;

CREATE OR REPLACE FUNCTION public.st_forcerhr(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_clockwise_poly$function$
;

CREATE OR REPLACE FUNCTION public.st_forcesfs(geometry, version text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_force_sfs$function$
;

CREATE OR REPLACE FUNCTION public.st_forcesfs(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_force_sfs$function$
;

CREATE OR REPLACE FUNCTION public.st_frechetdistance(geom1 geometry, geom2 geometry, double precision DEFAULT '-1'::integer)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_FrechetDistance$function$
;

CREATE OR REPLACE FUNCTION public.st_fromflatgeobuf(anyelement, bytea)
 RETURNS SETOF anyelement
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_fromflatgeobuf$function$
;

CREATE OR REPLACE FUNCTION public.st_fromflatgeobuftotable(text, text, bytea)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$pgis_tablefromflatgeobuf$function$
;

CREATE OR REPLACE FUNCTION public.st_generatepoints(area geometry, npoints integer)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_GeneratePoints$function$
;

CREATE OR REPLACE FUNCTION public.st_generatepoints(area geometry, npoints integer, seed integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_GeneratePoints$function$
;

CREATE OR REPLACE FUNCTION public.st_geogfromtext(text)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_from_text$function$
;

CREATE OR REPLACE FUNCTION public.st_geogfromwkb(bytea)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_from_binary$function$
;

CREATE OR REPLACE FUNCTION public.st_geographyfromtext(text)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_from_text$function$
;

CREATE OR REPLACE FUNCTION public.st_geohash(geog geography, maxchars integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_GeoHash$function$
;

CREATE OR REPLACE FUNCTION public.st_geohash(geom geometry, maxchars integer DEFAULT 0)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_GeoHash$function$
;

CREATE OR REPLACE FUNCTION public.st_geomcollfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE
	WHEN public.geometrytype(public.ST_GeomFromText($1)) = 'GEOMETRYCOLLECTION'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_geomcollfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE
	WHEN public.geometrytype(public.ST_GeomFromText($1, $2)) = 'GEOMETRYCOLLECTION'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_geomcollfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE
	WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'GEOMETRYCOLLECTION'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_geomcollfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE
	WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'GEOMETRYCOLLECTION'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_geometricmedian(g geometry, tolerance double precision DEFAULT NULL::double precision, max_iter integer DEFAULT 10000, fail_if_not_converged boolean DEFAULT false)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 10000
AS '$libdir/postgis-3', $function$ST_GeometricMedian$function$
;

CREATE OR REPLACE FUNCTION public.st_geometryfromtext(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

CREATE OR REPLACE FUNCTION public.st_geometryfromtext(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

CREATE OR REPLACE FUNCTION public.st_geometryn(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_geometryn_collection$function$
;

CREATE OR REPLACE FUNCTION public.st_geometrytype(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_geometrytype$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromewkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOMFromEWKB$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromewkt(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromgeohash(text, integer DEFAULT NULL::integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE COST 50
AS $function$ SELECT CAST(public.ST_Box2dFromGeoHash($1, $2) AS geometry); $function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromgeojson(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geom_from_geojson$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromgeojson(jsonb)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_GeomFromGeoJson($1::text)$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromgeojson(json)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_GeomFromGeoJson($1::text)$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromgml(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public._ST_GeomFromGML($1, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromgml(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geom_from_gml$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromkml(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geom_from_kml$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfrommarc21(marc21xml text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_GeomFromMARC21$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromtext(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromtext(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromtwkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOMFromTWKB$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_SetSRID(public.ST_GeomFromWKB($1), $2)$function$
;

CREATE OR REPLACE FUNCTION public.st_geomfromwkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_from_WKB$function$
;

CREATE OR REPLACE FUNCTION public.st_gmltosql(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geom_from_gml$function$
;

CREATE OR REPLACE FUNCTION public.st_gmltosql(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public._ST_GeomFromGML($1, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_hasarc(geometry geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_has_arc$function$
;

CREATE OR REPLACE FUNCTION public.st_hausdorffdistance(geom1 geometry, geom2 geometry, double precision)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$hausdorffdistancedensify$function$
;

CREATE OR REPLACE FUNCTION public.st_hausdorffdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$hausdorffdistance$function$
;

CREATE OR REPLACE FUNCTION public.st_hexagon(size double precision, cell_i integer, cell_j integer, origin geometry DEFAULT '010100000000000000000000000000000000000000'::geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Hexagon$function$
;

CREATE OR REPLACE FUNCTION public.st_hexagongrid(size double precision, bounds geometry, OUT geom geometry, OUT i integer, OUT j integer)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_ShapeGrid$function$
;

CREATE OR REPLACE FUNCTION public.st_interiorringn(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_interiorringn_polygon$function$
;

CREATE OR REPLACE FUNCTION public.st_interpolatepoint(line geometry, point geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_InterpolatePoint$function$
;

CREATE OR REPLACE FUNCTION public.st_intersection(geom1 geometry, geom2 geometry, gridsize double precision DEFAULT '-1'::integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Intersection$function$
;

CREATE OR REPLACE FUNCTION public.st_intersection(text, text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$ SELECT public.ST_Intersection($1::public.geometry, $2::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_intersection(geography, geography)
 RETURNS geography
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$SELECT public.geography(public.ST_Transform(public.ST_Intersection(public.ST_Transform(public.geometry($1), public._ST_BestSRID($1, $2)), public.ST_Transform(public.geometry($2), public._ST_BestSRID($1, $2))), public.ST_SRID($1)))$function$
;

CREATE OR REPLACE FUNCTION public.st_intersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_Intersects$function$
;

CREATE OR REPLACE FUNCTION public.st_intersects(text, text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public.ST_Intersects($1::public.geometry, $2::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_intersects(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$geography_intersects$function$
;

CREATE OR REPLACE FUNCTION public.st_isclosed(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_isclosed$function$
;

CREATE OR REPLACE FUNCTION public.st_iscollection(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ST_IsCollection$function$
;

CREATE OR REPLACE FUNCTION public.st_isempty(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_isempty$function$
;

CREATE OR REPLACE FUNCTION public.st_ispolygonccw(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_IsPolygonCCW$function$
;

CREATE OR REPLACE FUNCTION public.st_ispolygoncw(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_IsPolygonCW$function$
;

CREATE OR REPLACE FUNCTION public.st_isring(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$isring$function$
;

CREATE OR REPLACE FUNCTION public.st_issimple(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$issimple$function$
;

CREATE OR REPLACE FUNCTION public.st_isvalid(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$isvalid$function$
;

CREATE OR REPLACE FUNCTION public.st_isvalid(geometry, integer)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$SELECT (public.ST_isValidDetail($1, $2)).valid$function$
;

CREATE OR REPLACE FUNCTION public.st_isvaliddetail(geom geometry, flags integer DEFAULT 0)
 RETURNS valid_detail
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$isvaliddetail$function$
;

CREATE OR REPLACE FUNCTION public.st_isvalidreason(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$isvalidreason$function$
;

CREATE OR REPLACE FUNCTION public.st_isvalidreason(geometry, integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$
	SELECT CASE WHEN valid THEN 'Valid Geometry' ELSE reason END FROM (
		SELECT (public.ST_isValidDetail($1, $2)).*
	) foo
	$function$
;

CREATE OR REPLACE FUNCTION public.st_isvalidtrajectory(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_IsValidTrajectory$function$
;

CREATE OR REPLACE FUNCTION public.st_length(geog geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_length$function$
;

CREATE OR REPLACE FUNCTION public.st_length(text)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$ SELECT public.ST_Length($1::public.geometry);  $function$
;

CREATE OR REPLACE FUNCTION public.st_length(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_length2d_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_length2d(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_length2d_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_length2dspheroid(geometry, spheroid)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_length2d_ellipsoid$function$
;

CREATE OR REPLACE FUNCTION public.st_lengthspheroid(geometry, spheroid)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_length_ellipsoid_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_letters(letters text, font json DEFAULT NULL::json)
 RETURNS geometry
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE COST 500
 SET standard_conforming_strings TO 'on'
AS $function$
DECLARE
  letterarray text[];
  letter text;
  geom geometry;
  prevgeom geometry = NULL;
  adjustment float8 = 0.0;
  position float8 = 0.0;
  text_height float8 = 100.0;
  width float8;
  m_width float8;
  spacing float8;
  dist float8;
  wordarr geometry[];
  wordgeom geometry;
  -- geometry has been run through replace(encode(st_astwkb(geom),'base64'), E'\n', '')
  font_default_height float8 = 1000.0;
  font_default json = '{
  "!":"BgACAQhUrgsTFOQCABQAExELiwi5AgAJiggBYQmJCgAOAg4CDAIOBAoEDAYKBgoGCggICAgICAgGCgYKBgoGCgQMBAoECgQMAgoADAIKAAoADAEKAAwBCgMKAQwDCgMKAwoFCAUKBwgHBgcIBwYJBgkECwYJBAsCDQILAg0CDQANAQ0BCwELAwsDCwUJBQkFCQcHBwcHBwcFCQUJBQkFCQMLAwkDCQMLAQkACwEJAAkACwIJAAsCCQQJAgsECQQJBAkGBwYJCAcIBQgHCAUKBQoDDAUKAQwDDgEMAQ4BDg==",
  "&":"BgABAskBygP+BowEAACZAmcAANsCAw0FDwUNBQ0FDQcLBw0HCwcLCQsJCwkLCQkJCwsJCwkLCQ0HCwcNBw8HDQUPBQ8DDwMRAw8DEQERAREBEQERABcAFQIXAhUCEwQVBBMGEwYTBhEIEQgPChEKDwoPDA0MDQwNDgsOCRAJEAkQBxAHEgUSBRQFFAMUAxQBFgEWARgAigEAFAISABICEgQQAhAEEAQQBg4GEAoOCg4MDg4ODgwSDgsMCwoJDAcMBwwFDgUMAw4DDgEOARABDgEQARIBEAASAHgAIAQeBB4GHAgaChoMGA4WDhYQFBISEhISDhQQFAwWDBYKFgoYBhgIGAQYBBgCGgAaABgBGAMYAxYHFgUWCRYJFAsUCxIPEg0SERARDhMOFQwVDBcIGQYbBhsCHQIfAR+dAgAADAAKAQoBCgEIAwgFBgUGBQYHBAUEBwQHAgcCBwIHAAcABwAHAQcBBwMHAwUDBwUFBQUHBQUBBwMJAQkBCQAJAJcBAAUCBQAFAgUEBQIDBAUEAwQDBgMEAQYDBgEGAAgBBgAKSeECAJ8BFi84HUQDQCAAmAKNAQAvExMx",
  "\"":"BgACAQUmwguEAgAAkwSDAgAAlAQBBfACAIACAACTBP8BAACUBA==",
  "''":"BgABAQUmwguEAgAAkwSDAgAAlAQ=",
  "(":"BgABAUOQBNwLDScNKw0rCysLLwsxCTEJMwc1BzcHNwM7AzsDPwE/AEEANwI1AjMEMwIzBjEGLwYvCC0ILQgrCCkKKQonCicMJbkCAAkqCSoHLAksBywFLgcuBS4FMAMwAzADMgEwATQBMgA0ADwCOgI6BDoEOAY4BjYINgg2CjQKMgoyCjIMMAwwDi7AAgA=",
  ")":"BgABAUMQ3Au6AgAOLQwvDC8KMQoxCjEKMwg1CDUGNQY3BDcEOQI5AjkAOwAzATEBMQExAy8DLwMvBS8FLQctBS0HKwktBykJKwkpswIADCYKKAooCioIKggsCC4ILgYwBjAGMgQ0AjQCNAI2ADgAQgFAAz4DPAM8BzgHOAc2CTQJMgsyCzALLg0sDSoNKg==",
  "+":"BgABAQ3IBOwGALcBuAEAANUBtwEAALcB0wEAALgBtwEAANYBuAEAALgB1AEA",
  "/":"BgABAQVCAoIDwAuyAgCFA78LrQIA",
  "4":"BgABAhDkBr4EkgEAEREApwJ/AADxARIR5QIAEhIA9AHdAwAA7ALIA9AG6gIAEREA8QYFqwIAAIIDwwH/AgABxAEA",
  "v":"BgABASDmA5AEPu4CROwBExb6AgAZFdMC0wgUFaECABIU0wLWCBcW+AIAExVE6wEEFQQXBBUEFwQVBBUEFwQVBBUEFwQVBBUEFwQXBBUEFwYA",
  ",":"BgABAWMYpAEADgIOAgwCDgQMBAoGDAYKBgoICAgICAgICAoGCgYKBAoEDAQKBAoCDAIKAgwCCgAKAAwACgEMAQoBCgMMAwoDCgUKBQgFCgUIBwYJCAcGCQYJBAsGCQQLAg0CCwINAg0AAwABAAMAAwADAQMAAwADAAMBBQAFAQcBBwEHAwcBCQMJAQsDCwMLAw0FDQMNBQ8FDwURBxMFEwkTBxcJFwkXswEAIMgBCQYJBgkGBwYJCAcIBQgHCgUKBQoFDAEMAwwBDgEOABA=",
  "-":"BgABAQUq0AMArALEBAAAqwLDBAA=",
  ".":"BgABAWFOrAEADgIOAg4CDgQMBAoGDAYKBgoICAgKCAgIBgoGCgYKBgoEDAQKBAwECgIMAAwCDAAMAAwBCgAMAQoDDAMKAwoDCgUKBQgFCgUIBwgJBgcICQYJBgsGCQQLAg0CDQINAA0ADQENAQ0BCwMNAwkFCwUJBQkHBwcJBwUHBwkFCQUJBQkDCwMJAwsDCQELAAsBCwALAAsCCQALAgkECwQJBAkECQYJBgcGBwgJBgcKBQgHCgUKBQwFCgEOAwwBDgEOAA4=",
  "0":"BgABAoMB+APaCxwAHAEaARoDFgMYBRYFFAcUBxIJEgkQCRALEAsOCwwNDA0MDQoPCg0IDwgPBhEGDwYRBA8EEQIRAhMCEQITABMA4QUAEQETAREBEQMRAxEFEQURBREHDwkPBw8JDwsNCw0LDQ0NDQsNCw8JEQkRCREJEwcTBxUFFQUVAxUDFwEXARkAGQAZAhcCFwQXBBUGEwYTCBMIEQoRCg8KDwoPDA0MDQ4NDgsOCQ4JEAkQBxAHEAUSBRIDEgMSAxIDEgESARQAEgDiBQASAhQCEgISBBIEEgYSBhIGEggQChAIEAoQDBAMDgwODg4ODA4MEgwQChIKEggUCBQIFgYWBBYGGAQYAhgCGgILZIcDHTZBEkMRHTUA4QUeOUITRBIePADiBQ==",
  "2":"BgABAWpUwALUA44GAAoBCAEKAQgDBgMGBQYFBgUEBwQFBAUCBwIHAgUABwAHAAUBBwMFAQcFBQMHBQUHBQcFBwMJAwkBCQELAQsAC68CAAAUAhIAFAISBBQCEgQUBBIEEgYUCBIGEAgSChAKEAoQDBAMDg4ODgwQDBIMEgoSChQIFggWCBgGGAQaAhwCHAIWABQBFgEUARQDFAMSAxQFEgUSBxIHEAkQCRALDgsODQ4NDA8KDwwRCBMKEwgTBhUGFwQXBBcEGwAbABsAHQEftwPJBdIDAACpAhIPzwYAFBIArgI=",
  "1":"BgABARCsBLALAJ0LEhERADcA2QEANwATABQSAOYIpwEAALgCERKEBAASABER",
  "3":"BgABAZ0B/gbEC/sB0QQOAwwBDAMMAwwFCgMKBQoFCgUIBwoFCAcICQgJBgkICQYLCAsECwYLBA0GDwINBA8CDwQRAhECEQITABUCFQAVAH0AEQETAREBEQETAxEDEQURBREFDwcRBw8JDwkNCQ8LDQsNDQsNCw0LDwsPCREJEQcRBxMFFQUVBRUDFwEXARkAGQAZAhkCFwQVBBUEEwYTCBEIEQgRCg0MDwoNDA0OCw4LDgkQCRAHEAkQBRAFEgUSAxIDFAMSAxYBFAEWARYAFqQCAAALAgkCCQQHAgcGBwYHBgUIBQYDCAMIAwYDCAEIAQgACAAIAAgCCAIIAgYCCAQIBAgGBgYEBgQIBAoCCgAKAAwAvAEABgEIAAYBBgMGAwQDBgMEBQQDBAUCBQQFAgUABwIFAJkBAACmAaIB3ALbAgAREQDmAhIRggYA",
  "5":"BgABAaAB0APgBxIAFAESABIBEgMSARADEgMQAxIFEAcOBRAHDgkOCQ4JDgsMCwwLCgsKDQoPCA0IDwgPBhEEEwYTAhMEFwIXABcAiQIAEwETABEBEQMTAxEDDwMRBQ8FDwUPBw8JDQcNCQ0LDQsLCwsNCw0JDwkPCREHEQcTBxMFEwMVAxcDGQEZARkAFwAVAhUCFQQTBBMGEwYRCBEIDwoPCg8KDQwNDA0MCw4LDgkOCRAJEAcOBxAHEgUQBRIDEAMSAxIBEgEUARIAFLgCAAAFAgUABQIFBAUCBQQDBAUEAwYDBgMIAwgBCAEIAQoACAAIAgYACAQGAgQEBgQEBAQGBAQCBgIGAgYCBgIIAAYA4AEABgEIAAYBBgMGAQQDBgMEAwQFBAMCBQQFAgUABwIFAPkBAG+OAQCCBRESAgAAAuYFABMRAK8CjQMAAJ8BNgA=",
  "7":"BgABAQrQBsILhQOvCxQR7wIAEhK+AvYIiwMAAKgCERKwBgA=",
  "6":"BgABAsYBnAOqBxgGFgYYBBYEFgIWABQBFgEUAxQDFAUUBRIFEAcSCRAJEAkOCw4NDgsMDQoPCg8KDwgRCBEGEQYRBBMCEwITAhUAkwIBAAERAREBEQEPAxEFEQMPBREFDwcPBw8HDwkNCQ0LDQsNCwsNCw0LDQkPCQ8JDwcRBxEHEwUTAxMFFQEXAxcBGQAVABUCEwIVBBMEEQYTBhEIEQgPChEKDQoPDA0MDQwNDgsOCxALDgkQCRAHEgcQBxIFEgUSBRIBFAMSARIBFAASAOIFABACEgIQAhIEEAQQBhIGEAYQCBAKEAgOChAMDgwMDA4ODA4MDgwODBAKEAoQChIIEggSBhQGFgYUAhYCGAIYABoAGAEYARYBFgMUBRQFEgUSBxAHEAcQCQ4LDgkMCwwNDA0KDQgPCg0GEQgPBhEEEQQRBBMEEwITAhMCFQIVABWrAgAACgEIAQoBCAEGAwYDBgUGBQQFBAUEBQQFAgUABwIFAAUABwEFAAUBBQMFAwUDBQMFBQMFAwUBBQEHAQkBBwAJAJcBDUbpBDASFi4A4AETLC8SBQAvERUrAN8BFC0yEQQA",
  "8":"BgABA9gB6gPYCxYAFAEUARYBEgMUBRQFEgUSBxIHEAcSCQ4JEAkOCw4LDgsMDQwNCg0KDQoPCg8IDwgPBhEGEQQPBBMCEQIRABMAQwAxAA8BEQEPAREDDwMRAw8FEQUPBxEJDwkPCQ8NDw0PDQ8IBwYHCAcGBwgHBgkGBwYJBgcECQYJBAkGCQQJBAsECwQLBA0CCwINAg8CDwIPAA8AaQATAREBEwERAxEFEQURBREHEQcPBw8JDwkPCw8LDQsNDQ0LCw0LDwsNCQ8JDwcPBw8HEQURAxEFEQMRARMBEwFDABEAEwIRAhEEEQQRBg8GEQgPCA8KDwoPCg0MDQwNDAsOCw4LDgkQCRAJDgkQBxIHEAcSBRADEgMUAxIBFAEUABQAagAOAhAADgIOAg4EDAIOBAwEDAQMBgwECgYMBAoGCAYKBgoGCggKBgoICgYICAoICA0MCwwLDgsOCRAHEAcQBxIFEgUSAxIDEgMSARABEgASADIARAASAhICEgQSAhIGEAYSBhAIEAgQCBAKDgoODA4MDgwMDgwODA4KEAwQCBIKEggSCBQIFAYUBBQEFgQWAhYCGAANT78EFis0EwYANBIYLgC0ARcsMRQFADERGS0AswELogHtAhcuNxA3DRkvALMBGjE6ETYSGDIAtAE=",
  "9":"BgABAsYBpASeBBcFFQUXAxUDFQEVABMCFQITBBMEEwYRBhMGDwgRCg8KDwoNDA0OCwwNDgkQCRAJEAcSBxIFEgUSAxQBFAEUARYAlAICAAISAhICEgQSAhAGEgQQBhIGEAgSCA4IEAoOChAMDAwODAwODA4MEAoOChAKEAgSCBIIFAYUBBQGFgIYBBgCGgAWABYBFAEWAxQDEgUUBRIHEgcQCRIJEAkOCw4LDgsODQwNDA0MDwoPCg8IDwgRCBEGEQYRBhEEEQITAhECEwARAOEFAA8BEQEPAREDDwMPBREFDwUPBw8JDwcNCQ8LDQsLCw0NCw0LDQsNCw8JEQkPCREHEQcTBRMFEwUTARUBFQEXABkAFwIXAhcCFQQTBhMGEQYRCA8IDwgNCg8MCwoLDAsOCQ4JDgkQBxAHEAUQBRIFEgMSAxQDFAEUAxQAFgEWABamAgAACwIJAgkCCQIHBAcEBwYFBgUGAwYDBgMGAQgBBgEIAAgABgIIAgYCBgQGBAYEBgYGBgQIBAgECAIKAgoCCgAMAJgBDUXqBC8RFS0A3wEUKzARBgAwEhYsAOABEy4xEgMA",
  ":":"BgACAWE0rAEADgIOAg4CDgQMBAoGDAYKBgoICAgKCAgIBgoGCgYKBgoEDAQKBAwECgIMAAwCDAAMAAwBCgAMAQoDDAMKAwoDCgUKBQgFCgUIBwgJBgcICQYJBgsGCQQLAg0CDQINAA0ADQENAQ0BCwMNAwkFCwUJBQkHBwcJBwUHBwkFCQUJBQkDCwMJAwsDCQELAAsBCwALAAsCCQALAgkECwQJBAkECQYJBgcGBwgJBgcKBQgHCgUKBQwFCgEOAwwBDgEOAA4BYQDqBAAOAg4CDgIOBAwECgYMBgoGCggICAoICAgGCgYKBgoGCgQMBAoEDAQKAgwADAIMAAwADAEKAAwBCgMMAwoDCgMKBQoFCAUKBQgHCAkGBwgJBgkGCwYJBAsCDQINAg0ADQANAQ0BDQELAw0DCQULBQkFCQcHBwkHBQcHCQUJBQkFCQMLAwkDCwEJAwsACwELAAsACwIJAAsECQILBAkECQQJBgkGBwYHCAkGBwoFCAcKBQoFDAUKAQ4DDAEOAQ4ADg==",
  "x":"BgABARHmAoAJMIMBNLUBNrYBMIQB1AIA9QG/BI4CvwTVAgA5hgFBwAFFxwE1fdUCAI4CwATzAcAE1AIA",
  ";":"BgACAWEslgYADgIOAg4CDgQMBAoGDAYKBgoICAgKCAgIBgoGCgYKBgoEDAQKBAwECgIMAAwCDAAMAAwBCgAMAQoDDAMKAwoDCgUKBQgFCgUIBwgJBgcICQYJBgsGCQQLAg0CDQINAA0ADQENAQ0BCwMNAwkFCwUJBQkHBwcJBwUHBwkFCQUJBQkDCwMJAwsBCQMLAAsBCwALAAsCCQALBAkCCwQJBAkECQYJBgcGBwgJBgcKBQgHCgUKBQwFCgEOAwwBDgEOAA4BYwjxBAAOAg4CDAIOBAwECgYMBgoGCggICAgICAgICgYKBgoECgQMBAoECgIMAgoCDAIKAAoADAAKAQwBCgEKAwwDCgMKBQoFCAUKBQgHBgkIBwYJBgkECwYJBAsCDQILAg0CDQADAAEAAwADAAMBAwADAAMAAwEFAAUBBwEHAQcDBwEJAwkBCwMLAwsDDQUNAw0FDwUPBREHEwUTCRMHFwkXCRezAQAgyAEJBgkGCQYHBgkIBwgFCAcKBQoFCgUMAQwDDAEOAQ4AEA==",
  "=":"BgACAQUawAUA5gHEBAAA5QHDBAABBQC5AgDsAcQEAADrAcMEAA==",
  "B":"BgABA2e2BMQLFgAUARQBFAEUAxIDEgUSBRIFEAcQBxAJDgkOCQ4LDgsMCwwNDA0KDQgNCg0IDwYPBg8GDwQRBBEEEQIRAhMAEwAHAAkABwEHAAkBCQAHAQkBCQEHAQkBCQMJAwcDCQMJAwkFBwUJAwkHCQUHBQkHCQcJBwcHBwkHBwcJBwsHCQUQBQ4FDgcOCQ4JDAkMCwoNCg0IDwgRBhMEFQQXAhcCGwDJAQEvAysFJwklDSMPHREbFRkXFRsTHw8fCyUJJwcrAy0B6wMAEhIAoAsREuYDAAiRAYEElgEAKioSSA1EOR6JAQAA0wEJkAGPBSwSEiwAzAETKikSjwEAAMUCkAEA",
  "A":"BgABAg/KBfIBqQIAN98BEhHzAgAWEuwCngsREvwCABMR8gKdCxIR8QIAFBI54AEFlwGCBk3TA6ABAE3UAwMA",
  "?":"BgACAe4BsgaYCAAZABkBFwEXBRUDEwUTBxEHEQcPCQ8JDQkNCQ0LCwsLCwsLCQsJCwcNBwsHDQcLBQsFDQULAwkFCwMLAwkDCQMBAAABAQABAAEBAQABAAEAAQABAAABAQAAAQEAEwcBAQABAAMBAwADAAUABQAFAAcABwAFAAcABwAFAgcABQAHAAUAW7cCAABcABgBFgAUAhQAFAISAhACEAIQBA4EDgQMBgwGDAYMBgoICgYKCAgKCggICAgKBgoICgYMCAwGDAgOBg4GEAYQBgIAAgIEAAICBAACAgQCBAIKBAoGCAQKBggIBgYICAYIBggGCgQIBAoECAQKAggCCgIKAAgACgAKAAgBCAEKAwgDCAMIAwgFBgMIBQYHBAUGBQQFBAcCBQQHAgcCCQIHAgkCBwAJAgkACQAJAAkBCQAJAQsACQELAQsDCwELAwsDCwMLAwsDCwULAwsFCwMLBV2YAgYECAQKBAwGDAQMBhAIEAYSBhIIEgYUBhIEFgYUBBYEFgQWAhgCFgIYABYAGAAYARgBGAMWBRYHFgcWCRYLFA0IBQYDCAUIBwYFCAcGBwgHBgcICQYJCAkGCQYJCAsGCwYLBgsGDQYNBA0GDQQNBA8EDwQPAg8EEQIRAhEAEQITAWGpBesGAA4CDgIOAg4EDAQKBgwGCgYKCAgICggICAYKBgoGCgYKBAwECgQMBAoCDAAMAgwADAAMAQoADAEKAwwDCgMKAwoFCgUIBQoFCAcICQYHCAkGCQYLBgkECwINAg0CDQANAA0BDQENAQsDDQMJBQsFCQUJBwcHCQcFBwcJBQkFCQUJAwsDCQMLAwkBCwALAQsACwALAgkACwIJBAsECQQJBAkGCQYHBgcICQYHCgUIBwoFCgUMBQoBDgMMAQ4BDgAO",
  "C":"BgABAWmmA4ADAAUCBQAFAgUEBQIDBAUEAwQDBgMEAQYDBgEGAAgBBgDWAgAAwQLVAgATABMCEQITBBEEEQQRBhEIEQgPCA8KDwoNCg0MDQwNDAsOCw4LDgkOCxAHEAkQBxIHEgUSBRIDEgEUARIBFAAUAMIFABQCFAISBBQEEgQSBhIIEggSCBAKEAoQCg4MDgwODA4ODA4MDgwQDA4KEggQChIIEggSBhIGFAQSAhQCEgIUAMYCAADBAsUCAAUABwEFAAUBBQMDAQUDAwMDAwMFAQMDBQEFAAUBBwAFAMEF",
  "L":"BgABAQmcBhISEdkFABIQALQLwgIAAIEJ9AIAAK8C",
  "D":"BgABAkeyBMQLFAAUARIBFAESAxIDEgMSBRIFEAcQBxAHDgkOCQ4LDgsMCwwNDA0KDwoPCg8IDwgRCBEGEwQTBBMEEwIVAhUAFwDBBQAXARcBFwMTAxUDEwUTBxEHEQcPCQ8JDwkNCw0LCwsLDQsNCQ0JDQcPBw8HDwcRBREFEQMRAxEDEwERARMBEwDfAwASEgCgCxES4AMACT6BAxEuKxKLAQAAvwaMAQAsEhIsAMIF",
  "F":"BgABARGABoIJ2QIAAIECsgIAEhIA4QIRErECAACvBBIR5QIAEhIAsgucBQASEgDlAhES",
  "E":"BgABARRkxAuWBQAQEgDlAhES0QIAAP0BtgIAEhIA5wIRFLUCAAD/AfACABISAOUCERLDBQASEgCyCw==",
  "G":"BgABAZsBjgeIAgMNBQ8FDQUNBQ0HCwcNBwsHCwkLCQsJCwsJCwsLCQsJDQkLBw0HDwcNBw8FDwUPAw8DEQMPAxEBEQERARMBEQAXABUCFwIVAhMEFQQTBhMGEwYRCBEIDwoRCg8KDwwNDA0MDQ4LDgkQCRAJEAcQBxIFEgUUBRQDFAMUARYBFgEYAMoFABQCFAASBBQCEgQSBBIEEgYSBhAGEAgQCBAKDgoOCg4MDgwMDgwOChAKEAoSCBIIFAgUBhQEGAYWAhgEGAIaAOoCAAC3AukCAAcABwEFAQUBBQMFAwMFAwUDBQEFAQcBBQEFAQUABwAFAMUFAAUCBwIFAgUCBQQFBAMGBQYDBgUGAwgDBgMIAQgDCAEIAQoBCAEIAAgACgAIAAgCCAIIAggECgQGBAgECAYIBgC6AnEAAJwCmAMAAJcF",
  "H":"BgABARbSB7ILAQAAnwsSEeUCABISAOAE5QEAAN8EEhHlAgASEgCiCxEQ5gIAEREA/QPmAQAAgAQPEOYCABER",
  "I":"BgABAQmuA7ILAJ8LFBHtAgAUEgCgCxMS7gIAExE=",
  "J":"BgABAWuqB7ILALEIABEBEwERAREDEwMRAxEFEQURBw8HEQcPCQ0LDwsNCw0NDQ0LDwsPCxEJEQkTCRMJFQcVBxcFFwMZAxsBGwEbAB8AHQIbAhsEGQYXBhcGFQgTCBMKEwoRDA8KDwwNDA0OCw4LDgkQCRAJEAcQBRIFEgUSAxQDEgESARIBFAESABIAgAEREtoCABERAn8ACQIHBAcEBwYHBgUIBQoDCgMKAwoDDAEKAQwBCgEMAAwACgAMAgoCDAIKBAoECgYKBggGBgYGCAQGBAgCCgAIALIIERLmAgAREQ==",
  "M":"BgACAQRm1gsUABMAAAABE5wIAQDBCxIR5QIAEhIA6gIK5gLVAe0B1wHuAQztAgDhAhIR5QIAEhIAxAsUAPoDtwT4A7YEFgA=",
  "K":"BgABAVXMCRoLBQsDCQMLAwsDCwMLAwsBCwELAQsBCwELAQ0ACwELAAsADQALAg0ACwILAA0CCwILAgsCDQQLBAsECwYNBAsGCwYLCAsGCwgJCgsICQoJCgkMCQwJDAkOCRALEAkQCRKZAdICUQAAiwQSEecCABQSAKALExLoAgAREQC3BEIA+AG4BAEAERKCAwAREdkCzQXGAYUDCA0KDQgJCgkMBwoFDAUMAQwBDgAMAg4CDAQOBAwGDghmlQI=",
  "O":"BgABAoMBsATaCxwAHAEaARoDGgMYBRYFFgcWBxQJEgkSCRILEAsODQ4NDg0MDwoNDA8KDwgPCBEIDwYRBg8GEQQRAhMCEQITABMA0QUAEQETAREBEQMTBREFEQURBxEHDwcRCQ8LDQsPCw0NDQ0NDwsPCw8LEQkTCRMJEwkVBxUHFwUXAxkDGQEbARsAGwAZAhkCGQQXBhcGFQYVCBUIEwoRChEMEQoRDA8MDQ4NDg0OCxAJEAsQCRAHEgcSBxIFFAMSAxIDEgEUARIAEgDSBQASAhQCEgISBBIEEgYSBhIIEggQCBAKEgwODBAMEA4ODg4QDhIMEAwSChQKFAgUCBYIFgYYBBoGGgQcAh4CHgILggGLAylCWxZbFSlBANEFKklcGVwYKkwA0gU=",
  "N":"BgABAQ+YA/oEAOUEEhHVAgASEgC+CxQAwATnBQDIBRMS2AIAExEAzQsRAL8ElgU=",
  "P":"BgABAkqoB5AGABcBFQEVAxMDEwMTBREHEQcRBw8JDwkNCQ0LDQsNCwsNCw0JDQkNCQ8HDwcPBxEFEQURAxEDEQMTAREBEwETAH8AAIMDEhHlAgASEgCgCxES1AMAFAAUARIAFAESAxIDEgMSAxIFEAUQBRAHDgkOCQ4JDgsMCwwNDA0KDQoNCg8IDwgRCBEGEwQTBBUEFQIXAhkAGQCzAgnBAsoCESwrEn8AANUDgAEALBISLgDYAg==",
  "R":"BgABAj9msgsREvYDABQAFAESARQBEgESAxIDEgUSBRAFEAcQBw4JDgkOCQ4LDAsMDQwLCg0KDwoNCA8IDwgPBhEEEwYTAhMEFQIXABcAowIAEwEVARMDEwMTBRMFEQcTBxELEQsRDQ8PDREPEQ0VC8QB/QMSEfkCABQSiQGyA3EAALEDFBHnAgASEgCgCwnCAscFogEALhISLACqAhEsLRKhAQAApQM=",
  "Q":"BgABA4YBvAniAbkB8wGZAYABBQUFAwUFBQUHBQUDBwUFBQcFBQMHBQcDBwUJAwcDCQMJAwkDCQMJAQsDCwMLAQsDCwENAw0BDQEPAA8BDwAPABsAGwIZAhcEGQQXBBUGFQgVCBMIEQoTChEKDwwPDA8ODQ4NDgsQCxAJEAkQBxIHEgUSBRQFFAMUARQDFAEWABYAxgUAEgIUAhICEgQSBBIGEgYSCBIIEAgQChIMDgwQDBAODg4OEA4SDBAMEgoUChQIFAgWCBYGGAQaBhoEHAIeAh4CHAAcARoBGgMaAxgFFgUWBxYHFAkSCRIJEgsQCw4NDg0ODQwPCg0MDwoPCA8IEQgPBhEGDwYRBBECEwIRAhMAEwC7BdgBrwEImQSyAwC6AylAWxZbFSk/AP0BjAK7AQeLAoMCGEc4J0wHVBbvAaYBAEM=",
  "S":"BgABAYMC8gOEBxIFEgUQBxIFEgcSBxIJEgcSCRIJEAkQCRALEAsOCw4NDg0MDQ4PDA0KEQoPChEKEQgRCBMGFQQTBBcCFQAXABkBEwARAREBEQMPAQ8DDwMPAw0DDQUNAw0FCwULBwsFCwUJBwsFCQcHBQkHCQUHBwcHBwUHBwUFBQcHBwUHAwcFEQsRCxMJEwkTBxMFEwUVBRUDFQMVARMBFwEVABUAFQIVAhUCFQQVBBUEEwYVBhMIEwgTCBMIEwgRCBMKEQgRCmK6AgwFDgUMAw4FEAUOBRAFEAUQBRAFEAMSAw4DEAMQAxABEAEOAQ4AEAIMAg4CDgQMBAwGCggKCAoKBgwGDgYQBBACCgAMAAoBCAMKBQgFCAcIBwgJCAsGCQgLCA0IDQgNCA8IDQgPCA8IDwgPChEIDwgPCBEKDwoPDBEMDwwPDg8ODw4NEA0QCxALEgsSCRIHEgcUBRQFGAUYAxgBGgEcAR4CJAYkBiAIIAweDBwQHBAYEhgUFBYUFhQWEBoQGg4aDBwKHAoeBh4GIAQgAiACIgEiASIFIgUiBSAJIgkgCyINZ58CBwQJAgkECwQLAgsECwINBA0CDQQNAg0CDQALAg0ADQANAAsBCwELAQsDCwULBQkFCQcHBwcJBwkFCwMLAw0BDQENAAsCCwQLBAkGCQgJCAkKBwoJCgcMBQoHDAcMBQwF",
  "V":"BgABARG2BM4DXrYEbKwDERL0AgAVEesCnQsSEfsCABQS8QKeCxES8gIAExFuqwNgtQQEAA==",
  "T":"BgABAQskxAv0BgAAtQKVAgAA+wgSEeUCABISAPwImwIAALYC",
  "U":"BgABAW76B7ALAKMIABcBFwMXARUFFQUTBxMHEwkRCREJEQsPDQ0LDw0NDwsPCw8LEQkPCRMJEQcTBxMFEwUVBRUDEwMXARUBFQEXABUAEwIVAhMCFQQTBBUEEwYTBhMIEwgRChEIEQwRDA8MDw4PDg0OCxANEAsSCRIJEgcUBxQHFAMWBRYBGAEYARgApggBAREU9AIAExMAAgClCAALAgkECQQHBAcIBwgHCAUKBQoDCgMKAwwBCgEMAQwADAAMAgoCDAIKAgoECgQKBggGCAYICAYKBAgCCgIMAgwApggAARMU9AIAExM=",
  "X":"BgABARmsCBISEYkDABQSS54BWYICXYkCRZUBEhGJAwAUEtYCzgXVAtIFExKIAwATEVClAVj3AVb0AVKqAREShgMAERHXAtEF2ALNBQ==",
  "W":"BgABARuODcQLERHpAp8LFBHlAgASEnW8A2+7AxIR6wIAFBKNA6ALERKSAwATEdQB7wZigARZ8AIREugCAA8RaKsDYsMDXsoDaqYDExLqAgA=",
  "Y":"BgABARK4BcQLhgMAERHnAvMGAKsEEhHnAgAUEgCsBOkC9AYREoYDABERWOEBUJsCUqICVtwBERI=",
  "Z":"BgABAQmAB8QLnwOBCaADAADBAusGAMgDggmhAwAAwgLGBgA=",
  "`":"BgABAQfqAd4JkQHmAQAOlgJCiAGpAgALiwIA",
  "c":"BgABAW3UA84GBQAFAQUABQEFAwMBBQMDAwMDAwUBAwMFAQUABQEHAAUAnQMABQIFAAUCBQQFAgMEBQQDBAMGAwQBBgMGAQYABgEGAPABABoMAMsCGw7tAQATABMCEwARAhMEEQIPBBEEDwQPBg8IDwYNCA0KDQoNCgsMCwwLDAkOCRAHDgcQBxIFEgUUBRQDFAEWAxgBGAAYAKQDABQCFAISBBQCEgYSBhAGEggQCBAIEAoQCg4MDAwODAwODAwKDgwQCg4IEAgQCBAIEAYSBhIGEgQSAhQCFAIUAOABABwOAM0CGQzbAQA=",
  "a":"BgABApoB8AYCxwF+BwkHCQcJCQkHBwkHBwcJBQkFBwUJBQkFCQMHBQkDCQMJAwcDCQEHAQkBBwEJAQcABwAHAQcABQAHAAUBBQAFABMAEwITAhEEEwQPBBEGDwgPCA0IDwoLCg0KCwwLDAsMCQ4JDgkOBw4HEAcQBRAFEAUSAxADEgESAxIBFAESABQAFAISAhQCEgQSBBIEEgYSBhIIEAgQChAIDgwODA4MDg4MDgwODBAMEAoSCBIKEggUCBQGFgYWBBgEGAIaAhoAcgAADgEMAQoBCgEIAwgDBgUEBQQFBAcCBwIHAgkCCQAJAKsCABcPAMwCHAvCAgAUABYBEgAUARIDFAMQAxIDEAUSBQ4FEAcOCRAJDAkOCwwLDA0MCwoNCg8IDwgPCA8GEQYRBhMEEwIXAhUCFwAZAIMGFwAKmQLqA38ATxchQwgnGiMwD1AMUDYAdg==",
  "b":"BgABAkqmBIIJGAAYARYBFgEUAxQDEgUSBRIFEAcQCQ4HDgkOCw4LDAsMDQoNCg0KDQgPBg8GDwYRBBEEEQQTBBECEwIVAhMAFQD/AgAZARcBFwEXAxUDEwUTBREFEQcPBw8JDwkNCQ0LDQsLCwsNCQ0JDQcPBw8HDwURAxEDEQMTAxMBEwMVARUAFQHPAwAUEgCWCxEY5gIAERkAowKCAQAJOvECESwrEn8AAJsEgAEALBISLgCeAw==",
  "d":"BgABAkryBgDLAXAREQ8NEQ0PDREJDwkRBw8FDwURAw8DDwERAw8BEQEPACMCHwQfCB0MGw4bEhcUFxgVGhEeDSANJAkmBSgDKgEuAIADABYCFAIUAhQCFAQUBBIGEgYSBhAIEAgQCBAKDgoODAwMDAwMDgoOCg4KEAgQCBIGEgYSBhQEFgQWBBYCGAIYAHwAAKQCERrmAgARFwCnCxcADOsCugJGMgDmA3sAKxERLQCfAwolHBUmBSQKBAA=",
  "e":"BgABAqMBigP+AgAJAgkCCQQHBAcGBwYFCAUIBQgDCgMIAQoDCAEKAQoACgAKAAoCCAIKAggECgQIBAgGCAYGBgQIBAoECAIKAAyiAgAAGQEXARcBFwMVBRMFEwURBxEHDwcPCQ8LDQkNCwsNCw0LDQkNBw8JDwcPBQ8FEQURAxEDEwMTAxMBFQAVARcALwIrBCkIJwwlDiESHxQbGBkaFR4TIA0iCyQJKAMqASwAggMAFAIUABIEFAISBBIEEgQSBhIGEAgQCBAIEAoODA4MDgwODgwQDBAKEAoSChIIFAgUCBYGGAQYBhoCGgQcAh4ALgEqAygFJgkkDSANHhEaFRgXFBsSHQ4fDCUIJwQpAi0AGQEXAxcDFQcTBRMJEQkPCw8LDQ0PDQsNDQ8LEQsRCxEJEwkTCRMJEwcTBxUHFQUVBRUHFQUVBRUHFwcVBRUHCs4BkAMfOEUURxEfMwBvbBhAGBwaBiA=",
  "h":"BgABAUHYBJAGAAYBBgAGAQYDBgEEAwYDBAMEBQQDAgUEBQIFAAUCBQB1AAC5BhIT5wIAFhQAlAsRGOYCABEZAKMCeAAYABgBFgEWARQDFAMSBRIFEgUQBxAJDgcOCQ4LDgsMCwwNCg0KDQoNCA8GDwYPBhEEEQQRBBMEEQITAhUCEwAVAO0FFhPnAgAUEgD+BQ==",
  "g":"BgABArkBkAeACQCNCw8ZERkRFxEVExMVERUPFQ8XDRcLGQkZBxsFGwUdAR0BDQALAA0ADQINAAsCDQANAg0CDQILAg0EDQINBA0GDQQNBg0EDQYNCA0GDwgNCA0IDQgPCg0KDwwNDA8MDw4PDqIB7gEQDRALEAkQCQ4JEAcOBw4FDgUOAwwFDgMMAQwBDAEMAQwACgEKAAoACAIIAAgCCAIGAggCBgIGBAYCBgQEAgYEAqIBAQADAAEBAwADAAMABQADAAUAAwAFAAMABQAFAAMABQA3ABMAEwIRAhMCEQQRBBEEEQYRBg8IDwgPCA0KDQoNCg0MCwwLDgsOCQ4JDgkQBxAHEgcSBRIDFAMWAxQBFgEYABgA/gIAFgIWAhQEFgQUBBIGFAgSCBIIEAoSChAKDgwODA4MDg4MDgwODA4KEAgQCBAIEgYSBhIEEgYSBBQCEgIUAhQCOgAQABABDgEQAQ4BEAMOAw4FDgUOBQwFDgcMBQ4HDAkMB4oBUBgACbsCzQYAnAR/AC0RES0AnQMSKy4RgAEA",
  "f":"BgABAUH8A6QJBwAHAAUABwEFAQcBBQEFAwUDBQMDAwMDAwUDAwMFAQUAwQHCAQAWEgDZAhUUwQEAAOMEFhftAgAWFADKCQoSChIKEAoQCg4KDgwOCgwMDAoKDAwMCgwIDAgMCAwIDAYOCAwEDgYMBA4GDAIOBA4CDgQOAg4CDgAOAg4ADgC2AQAcDgDRAhkQowEA",
  "i":"BgACAQlQABISALoIERLqAgAREQC5CBIR6QIAAWELyAoADgIOAgwEDgIKBgwGCgYKCAoGCAgICggIBggGCgYKBAoECgQMBAoCDAIMAgwCDAAMAAwADAEMAQoBDAMKAwoDCgUKBQgFCgUIBwgHCAcICQgJBgkECwQJBA0CCwANAA0ADQELAQ0BCwMJBQsFCQUJBwkFBwcHBwcJBQcFCQUJBQkDCQMLAwkBCwELAQsACwALAAsCCwILAgkCCwIJBAkECQQJBgcGCQYHCAcIBwgHCgUKBQwFCgMMAQwBDgEMAA4=",
  "j":"BgACAWFKyAoADgIOAgwEDgIKBgwGCgYKCAoGCAgICggIBggGCgYKBAoECgQMBAoCDAIMAgwCDAAMAAwADAEMAQoBDAMKAwoDCgUKBQgFCgUIBwgHCAcICQgJBgkECwQJBA0CCwANAA0ADQELAQ0BCwMJBQsFCQUJBwkFBwcHBwcJBQcFCQUJBQkDCQMLAwkBCwELAQsACwALAAsCCwILAgkCCwIJBAkECQQJBgcGCQYHCAcIBwgHCgUKBQwFCgMMAQwBDgEMAA4BO+YCnwwJEQkRCQ8JDwsNCQ0LDQkLCwsJCQsLCQkLBwsHCwcLBwsFCwcNAwsFDQMLBQ0BDQMNAQ0DDQENAQ0ADQENAA0AVwAbDQDSAhoPQgAIAAgABgAIAgYCCAIGAgYEBgQGBAQEBAQEBgQEBAYCBgC4CRES6gIAEREAowo=",
  "k":"BgABARKoA/QFIAC0AYoD5gIAjwK5BJICwwTfAgDDAbIDFwAAnwMSEeUCABISAJILERLmAgAREQCvBQ==",
  "n":"BgABAW1yggmQAU8GBAgEBgQGBgYCCAQGBAYEBgQIAgYECAQGAggEBgIIBAgCCAQIAggCCAIIAgoACAIKAAgCCgAKAgoADAAKAgwAFgAWARQAFAEUAxQDFAMSAxIFEgUQBRIHEAkOBxAJDgsOCwwLDA0MDQoPCA8IEQgRBhEGEwYVBBUEFQIXAhkCGQDtBRQR5QIAFBAA/AUACAEIAQYBCAMGBQQFBgUEBwQFBAcCBwIHAgcCCQIHAAcACQAHAQcABwMHAQUDBwMFAwUFBQUDBQEFAwcBBwAHAPkFEhHjAgASEgDwCBAA",
  "m":"BgABAZoBfoIJigFbDAwMCg4KDggOCA4IDgYQBhAGEAQQBBAEEAISAhACEgAmASQDJAciCyANHhEcFRwXDg4QDBAKEAwQCBAKEggSBhIGEgYSBBQEEgIUAhICFAAUABQBEgEUARIDEgMSAxIFEgUQBxAHEAcQBw4JDgkOCw4LDAsMDQoNCg8KDwgPCBEIEQYRBBMEEwQTAhMCFQAVAP0FEhHlAgASEgCCBgAIAQgBBgEGAwYFBgUEBQQHBAUEBwIHAgcCBwIJAAcABwAJAAcBBwEHAQUBBwMFAwUDBQMDBQMFAwUBBQEHAQcAgQYSEeUCABISAIIGAAgBCAEGAQYDBgUGBQQFBAcEBQQHAgcCBwIHAgkABwAHAAkABwEHAQcBBQEHAwUDBQMFAwMFAwUDBQEFAQcBBwCBBhIR5QIAEhIA8AgYAA==",
  "l":"BgABAQnAAwDrAgASFgDWCxEa6gIAERkA0wsUFw==",
  "y":"BgABAZ8BogeNAg8ZERkRFxEVExMVERUPFQ8XDRcLGQkZBxsFGwUdAR0BDQALAA0ADQINAAsCDQANAg0CDQILAg0EDQINBA0GDQQNBg0EDQYNCA0GDwgNCA0IDQgPCg0KDwwNDA8MDw4PDqIB7gEQDRALEAkQCQ4JEAcOBw4FDgUOAwwFDgMMAQwBDAEMAQwACgEKAAoACAIIAAgCCAIGAggCBgIGBAYCBgQEAgYEAqIBAQADAAEBAwADAAMABQADAAUAAwAFAAMABQAFAAMABQA3ABMAEwIRABECEwQRAg8EEQQPBBEGDwgNCA8IDQgNCg0MDQwLDAkOCw4JDgcQBxAHEgUSBRQFFAMWARgDGAEaABwA9AUTEuQCABEPAP8FAAUCBQAFAgUEBQIDBAUEAwQDBgMEAQYDBgEGAAgBBgCAAQAAvAYREuICABMPAP0K",
  "q":"BgABAmj0A4YJFgAWARQAEgESAxADEAMOAw4FDgUMBQ4HDgcOBwwJDgmeAU4A2QwWGesCABYaAN4DAwADAAMBAwADAAUAAwADAAMABQAFAAUABwAHAQcACQAVABUCFQATAhUCEwQRAhMEEQQRBhEGDwgPCA8IDQoNDA0MCwwLDgkOCRAJEAkQBxIHEgUUBRYDFgMYARoBGgAcAP4CABYCFgIWBBYEFAQSBhQIEggSCBAKEgoQDA4MDgwODg4ODBAMDgwQChIIEAoSCBIGEgYUBhQEFAQWAhYCFgIWAApbkQYSKy4ReAAAjARTEjkRHykJMwDvAg==",
  "p":"BgABAmiCBIYJFgAWARYBFAEWAxQDEgUUBRIFEgcSBxAJEAkQCQ4LDgsOCwwNDA0KDwoPCg8IEQgRCBEGEwQTBhMCFQQVAhUAFQD9AgAbARkBFwMXAxcDEwUTBxMHEQcRCQ8JDQsNCw0LCw0LDQkPCQ0JDwURBxEFEQURAxMDEQMTARUBEwEVARUBFQAJAAcABwAFAAcABQAFAAMAAwADAAUAAwIDAAMAAwIDAADdAxYZ6wIAFhoA2gyeAU0OCgwIDgoMCA4GDgYMBg4GDgQQBBAEEgQUAhQCFgIWAApcoQMJNB8qNxJVEQCLBHgALhISLADwAg==",
  "o":"BgABAoMB8gOICRYAFgEWARQBFgMUAxIDFAUSBRIHEgcQBxAJEAkOCw4LDgsMDQwNCg8KDwoPCg8IEQgRBhMGEwQTBBMCFQIVABcAiwMAFwEVARUDEwMTAxMFEwcRBxEHDwkPCQ8LDQsNCw0NCw0LDwkNCw8HEQkPBxEHEQcRBRMFEwMTAxUDFQEVABUAFQAVAhUCFQITBBMEEwYTBhEGEQgRCA8KDwoPCg0KDQwNDAsOCw4JDgkQCRAJEgcSBxIFFAUUAxQDFgEWARYAFgCMAwAYAhYCFgQUBBQEFAYUCBIIEggQChAKEAwODA4MDg4MDgwQCg4KEgoQChIIEggSBhQGEgYUBBYEFAIWAhYCFgALYv0CHTZBFEMRHTcAjwMcNUITQhIiOACQAw==",
  "r":"BgACAQRigAkQAA8AAAABShAAhAFXDAwODAwKDgoOCBAIDgYQBhAEEAQQBBAEEAISABACEAAQAA4BEAAQARADEAEQAxADEAUSBRIHFAcUCxQLFA0WDVJFsQHzAQsMDQwLCgkICwgLCAkGCQYJBAkGBwIJBAcCBwQHAAcCBwAFAgcABQAHAQUABQEFAQUBBQEDAQUBAwMDAQMDAwEAmwYSEeMCABISAO4IEAA=",
  "u":"BgABAV2KBwGPAVANCQsHDQcNBw0FCwUNBQ0FDQMPAw8DEQMTARMBFQEVABUAFQITABMEEwITBBMEEQQRBhEGDwYRCA8KDQgPCg0MDQwLDAsOCRALDgcQBxIHEgUUBRQFFAMWAxgBGAEYARoA7gUTEuYCABMPAPsFAAcCBwIFBAcCBQYDBgUGAwgDBgMIAQgBCAEIAQoBCAAIAAoACAIIAggCCAIGBAgEBgQGBgYGBAYCBgQIAggACAD6BRES5AIAEREA7wgPAA==",
  "s":"BgABAasC/gLwBQoDCgMMBQ4DDgUOBRAFEAUSBRAHEgcQCRIJEAkSCxALEAsQDRANDg0ODw4PDA8MDwoRChEIEwYTBBcCFQIXABkBGQEXAxcFFQUTBRMHEwcRCREJDwkNCQ8LDQ0LCwsNCw0JDQkPBw8HDwUPBREDEQMRAREDEQETABEBEwARABMADwIRABECEQIRBBMCEwQVBBUEFQYVBhMIFwgVChUKFQxgsAIIAwYDCAMKAQgDCAMKAQoDCgEKAwoBCgMKAQwDCgEKAwoBDAMKAQoBCgEMAQoACgEKAAoBCgAKAQgACgAIAQgABgoECAIKAgoCCgAMAQoBDAUEBwIHBAcEBwIHBAkECQQJBAkECQYLBAkGCwYJBgsGCwYJCAsGCwgJBgsICQgLCAkICwgJCgkKCQoJCgcKCQwHDAcMBwwFDAcMAw4FDAMOAw4BDgMQARAAEAESABIAEgIQAg4CDgIOBA4CDgQMBAwEDAQMBgoECgYKBgoGCgYIBggGCAgIBggGBgYIBgYGBgYGBgYGBAgGBgQIBAYECAQQChIIEggSBhIEEgQSBBQCFAISABQAEgASABIAEgESARIBEAEQAxIDDgMQAxADDgUOBQwDDAMMAwoDCAMIAQYBe6cCAwIDAgUAAwIFAgUCBwIFAgcCBQIHAgUCBwIHAAUCBwIHAgUABwIHAgcABQIHAAcCBwAFAgUABQIFAAUABQIDAAEAAQABAQEAAQEBAQEBAQEBAQEDAQEAAwEBAQMAAwEDAAMBAwADAQMAAwABAQMAAwADAAEAAwIBAAMCAQQDAgE=",
  "t":"BgABAUe8BLACWAAaEADRAhsOaQANAA0ADwINAA0CDQANAg0CDQINBA0CCwYNBA0GCwYNBgsIDQgLCAsKCwgJDAsKCQwJDAkOCQ4HEAcSBxIHEgUUAOAEawAVEQDWAhYTbAAAygIVFOYCABUXAMUCogEAFhQA1QIVEqEBAADzAwIFBAMEBQQDBAMEAwYDBgMGAwYBCAEGAQgBBgEIAAgA",
  "w":"BgABARz8BsAEINYCKNgBERLuAgARD+8B3QgSEc0CABQSW7YCV7UCFBHJAgASEpMC3AgREvACABERmAHxBDDaAVeYAxES7gIAEREo1QE81wIIAA==",
  "z":"BgABAQ6cA9AGuQIAFw8AzAIaC9QFAAAr9wKjBuACABYQAMsCGQyZBgCaA9AG"
   }';
BEGIN

  IF font IS NULL THEN
    font := font_default;
  END IF;

  -- For character spacing, use m as guide size
  geom := ST_GeomFromTWKB(decode(font->>'m', 'base64'));
  m_width := ST_XMax(geom) - ST_XMin(geom);
  spacing := m_width / 12;

  letterarray := regexp_split_to_array(replace(letters, ' ', E'\t'), E'');
  FOREACH letter IN ARRAY letterarray
  LOOP
    geom := ST_GeomFromTWKB(decode(font->>(letter), 'base64'));
    -- Chars are not already zeroed out, so do it now
    geom := ST_Translate(geom, -1 * ST_XMin(geom), 0.0);
    -- unknown characters are treated as spaces
    IF geom IS NULL THEN
      -- spaces are a "quarter m" in width
      width := m_width / 3.5;
    ELSE
      width := (ST_XMax(geom) - ST_XMin(geom));
    END IF;
    geom := ST_Translate(geom, position, 0.0);
    -- Tighten up spacing when characters have a large gap
    -- between them like Yo or To
    adjustment := 0.0;
    IF prevgeom IS NOT NULL AND geom IS NOT NULL THEN
      dist = ST_Distance(prevgeom, geom);
      IF dist > spacing THEN
        adjustment = spacing - dist;
        geom := ST_Translate(geom, adjustment, 0.0);
      END IF;
    END IF;
    prevgeom := geom;
    position := position + width + spacing + adjustment;
    wordarr := array_append(wordarr, geom);
  END LOOP;
  -- apply the start point and scaling options
  wordgeom := ST_CollectionExtract(ST_Collect(wordarr));
  wordgeom := ST_Scale(wordgeom,
                text_height/font_default_height,
                text_height/font_default_height);
  return wordgeom;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.st_linecrossingdirection(line1 geometry, line2 geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$ST_LineCrossingDirection$function$
;

CREATE OR REPLACE FUNCTION public.st_linefromencodedpolyline(txtin text, nprecision integer DEFAULT 5)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$line_from_encoded_polyline$function$
;

CREATE OR REPLACE FUNCTION public.st_linefrommultipoint(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_line_from_mpoint$function$
;

CREATE OR REPLACE FUNCTION public.st_linefromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1, $2)) = 'LINESTRING'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_linefromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1)) = 'LINESTRING'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_linefromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'LINESTRING'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_linefromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'LINESTRING'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoint(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_line_interpolate_point$function$
;

CREATE OR REPLACE FUNCTION public.st_lineinterpolatepoints(geometry, double precision, repeat boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_line_interpolate_point$function$
;

CREATE OR REPLACE FUNCTION public.st_linelocatepoint(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_line_locate_point$function$
;

CREATE OR REPLACE FUNCTION public.st_linemerge(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$linemerge$function$
;

CREATE OR REPLACE FUNCTION public.st_linemerge(geometry, boolean)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$linemerge$function$
;

CREATE OR REPLACE FUNCTION public.st_linestringfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'LINESTRING'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_linestringfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'LINESTRING'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_linesubstring(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_line_substring$function$
;

CREATE OR REPLACE FUNCTION public.st_linetocurve(geometry geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_line_desegmentize$function$
;

CREATE OR REPLACE FUNCTION public.st_locatealong(geometry geometry, measure double precision, leftrightoffset double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_LocateAlong$function$
;

CREATE OR REPLACE FUNCTION public.st_locatebetween(geometry geometry, frommeasure double precision, tomeasure double precision, leftrightoffset double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_LocateBetween$function$
;

CREATE OR REPLACE FUNCTION public.st_locatebetweenelevations(geometry geometry, fromelevation double precision, toelevation double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_LocateBetweenElevations$function$
;

CREATE OR REPLACE FUNCTION public.st_longestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$SELECT public._ST_LongestLine(public.ST_ConvexHull($1), public.ST_ConvexHull($2))$function$
;

CREATE OR REPLACE FUNCTION public.st_m(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_m_point$function$
;

CREATE OR REPLACE FUNCTION public.st_makebox2d(geom1 geometry, geom2 geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_construct$function$
;

CREATE OR REPLACE FUNCTION public.st_makeenvelope(double precision, double precision, double precision, double precision, integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_MakeEnvelope$function$
;

CREATE OR REPLACE FUNCTION public.st_makeline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makeline$function$
;

CREATE OR REPLACE FUNCTION public.st_makeline(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makeline_garray$function$
;

CREATE OR REPLACE FUNCTION public.st_makepoint(double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

CREATE OR REPLACE FUNCTION public.st_makepoint(double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

CREATE OR REPLACE FUNCTION public.st_makepoint(double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

CREATE OR REPLACE FUNCTION public.st_makepointm(double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint3dm$function$
;

CREATE OR REPLACE FUNCTION public.st_makepolygon(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoly$function$
;

CREATE OR REPLACE FUNCTION public.st_makepolygon(geometry, geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoly$function$
;

CREATE OR REPLACE FUNCTION public.st_makevalid(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_MakeValid$function$
;

CREATE OR REPLACE FUNCTION public.st_makevalid(geom geometry, params text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_MakeValid$function$
;

CREATE OR REPLACE FUNCTION public.st_maxdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$SELECT public._ST_MaxDistance(public.ST_ConvexHull($1), public.ST_ConvexHull($2))$function$
;

CREATE OR REPLACE FUNCTION public.st_maximuminscribedcircle(geometry, OUT center geometry, OUT nearest geometry, OUT radius double precision)
 RETURNS record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_MaximumInscribedCircle$function$
;

CREATE OR REPLACE FUNCTION public.st_memsize(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_mem_size$function$
;

CREATE OR REPLACE FUNCTION public.st_minimumboundingcircle(inputgeom geometry, segs_per_quarter integer DEFAULT 48)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_MinimumBoundingCircle$function$
;

CREATE OR REPLACE FUNCTION public.st_minimumboundingradius(geometry, OUT center geometry, OUT radius double precision)
 RETURNS record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_MinimumBoundingRadius$function$
;

CREATE OR REPLACE FUNCTION public.st_minimumclearance(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_MinimumClearance$function$
;

CREATE OR REPLACE FUNCTION public.st_minimumclearanceline(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_MinimumClearanceLine$function$
;

CREATE OR REPLACE FUNCTION public.st_mlinefromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE
	WHEN public.geometrytype(public.ST_GeomFromText($1, $2)) = 'MULTILINESTRING'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mlinefromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1)) = 'MULTILINESTRING'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mlinefromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'MULTILINESTRING'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mlinefromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'MULTILINESTRING'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpointfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1)) = 'MULTIPOINT'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpointfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1, $2)) = 'MULTIPOINT'
	THEN ST_GeomFromText($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpointfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'MULTIPOINT'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpointfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'MULTIPOINT'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpolyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1, $2)) = 'MULTIPOLYGON'
	THEN public.ST_GeomFromText($1,$2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpolyfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1)) = 'MULTIPOLYGON'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpolyfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'MULTIPOLYGON'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_mpolyfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'MULTIPOLYGON'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_multi(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_force_multi$function$
;

CREATE OR REPLACE FUNCTION public.st_multilinefromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'MULTILINESTRING'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_multilinestringfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_MLineFromText($1, $2)$function$
;

CREATE OR REPLACE FUNCTION public.st_multilinestringfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_MLineFromText($1)$function$
;

CREATE OR REPLACE FUNCTION public.st_multipointfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_MPointFromText($1)$function$
;

CREATE OR REPLACE FUNCTION public.st_multipointfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'MULTIPOINT'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_multipointfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1,$2)) = 'MULTIPOINT'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_multipolyfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'MULTIPOLYGON'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_multipolyfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'MULTIPOLYGON'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_multipolygonfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_MPolyFromText($1, $2)$function$
;

CREATE OR REPLACE FUNCTION public.st_multipolygonfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_MPolyFromText($1)$function$
;

CREATE OR REPLACE FUNCTION public.st_ndims(geometry)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_ndims$function$
;

CREATE OR REPLACE FUNCTION public.st_node(g geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Node$function$
;

CREATE OR REPLACE FUNCTION public.st_normalize(geom geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_Normalize$function$
;

CREATE OR REPLACE FUNCTION public.st_npoints(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_npoints$function$
;

CREATE OR REPLACE FUNCTION public.st_nrings(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_nrings$function$
;

CREATE OR REPLACE FUNCTION public.st_numgeometries(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numgeometries_collection$function$
;

CREATE OR REPLACE FUNCTION public.st_numinteriorring(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numinteriorrings_polygon$function$
;

CREATE OR REPLACE FUNCTION public.st_numinteriorrings(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numinteriorrings_polygon$function$
;

CREATE OR REPLACE FUNCTION public.st_numpatches(geometry)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType($1) = 'ST_PolyhedralSurface'
	THEN public.ST_NumGeometries($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_numpoints(geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_numpoints_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_offsetcurve(line geometry, distance double precision, params text DEFAULT ''::text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_OffsetCurve$function$
;

CREATE OR REPLACE FUNCTION public.st_orderingequals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$LWGEOM_same$function$
;

CREATE OR REPLACE FUNCTION public.st_orientedenvelope(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_OrientedEnvelope$function$
;

CREATE OR REPLACE FUNCTION public.st_overlaps(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$overlaps$function$
;

CREATE OR REPLACE FUNCTION public.st_patchn(geometry, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.ST_GeometryType($1) = 'ST_PolyhedralSurface'
	THEN public.ST_GeometryN($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_perimeter(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_perimeter2d_poly$function$
;

CREATE OR REPLACE FUNCTION public.st_perimeter(geog geography, use_spheroid boolean DEFAULT true)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_perimeter$function$
;

CREATE OR REPLACE FUNCTION public.st_perimeter2d(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_perimeter2d_poly$function$
;

CREATE OR REPLACE FUNCTION public.st_point(double precision, double precision, srid integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Point$function$
;

CREATE OR REPLACE FUNCTION public.st_point(double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_makepoint$function$
;

CREATE OR REPLACE FUNCTION public.st_pointfromgeohash(text, integer DEFAULT NULL::integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$point_from_geohash$function$
;

CREATE OR REPLACE FUNCTION public.st_pointfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1)) = 'POINT'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_pointfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1, $2)) = 'POINT'
	THEN public.ST_GeomFromText($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_pointfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'POINT'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_pointfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'POINT'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_pointinsidecircle(geometry, double precision, double precision, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_inside_circle_point$function$
;

CREATE OR REPLACE FUNCTION public.st_pointm(xcoordinate double precision, ycoordinate double precision, mcoordinate double precision, srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_PointM$function$
;

CREATE OR REPLACE FUNCTION public.st_pointn(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_pointn_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_pointonsurface(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$pointonsurface$function$
;

CREATE OR REPLACE FUNCTION public.st_points(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_Points$function$
;

CREATE OR REPLACE FUNCTION public.st_pointz(xcoordinate double precision, ycoordinate double precision, zcoordinate double precision, srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_PointZ$function$
;

CREATE OR REPLACE FUNCTION public.st_pointzm(xcoordinate double precision, ycoordinate double precision, zcoordinate double precision, mcoordinate double precision, srid integer DEFAULT 0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_PointZM$function$
;

CREATE OR REPLACE FUNCTION public.st_polyfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1, $2)) = 'POLYGON'
	THEN public.ST_GeomFromText($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_polyfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromText($1)) = 'POLYGON'
	THEN public.ST_GeomFromText($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_polyfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1, $2)) = 'POLYGON'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_polyfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'POLYGON'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_polygon(geometry, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT public.ST_SetSRID(public.ST_MakePolygon($1), $2)
	$function$
;

CREATE OR REPLACE FUNCTION public.st_polygonfromtext(text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_PolyFromText($1)$function$
;

CREATE OR REPLACE FUNCTION public.st_polygonfromtext(text, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS $function$SELECT public.ST_PolyFromText($1, $2)$function$
;

CREATE OR REPLACE FUNCTION public.st_polygonfromwkb(bytea)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1)) = 'POLYGON'
	THEN public.ST_GeomFromWKB($1)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_polygonfromwkb(bytea, integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$
	SELECT CASE WHEN public.geometrytype(public.ST_GeomFromWKB($1,$2)) = 'POLYGON'
	THEN public.ST_GeomFromWKB($1, $2)
	ELSE NULL END
	$function$
;

CREATE OR REPLACE FUNCTION public.st_polygonize(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$polygonize_garray$function$
;

CREATE OR REPLACE FUNCTION public.st_project(geog geography, distance double precision, azimuth double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$geography_project$function$
;

CREATE OR REPLACE FUNCTION public.st_quantizecoordinates(g geometry, prec_x integer, prec_y integer DEFAULT NULL::integer, prec_z integer DEFAULT NULL::integer, prec_m integer DEFAULT NULL::integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$ST_QuantizeCoordinates$function$
;

CREATE OR REPLACE FUNCTION public.st_reduceprecision(geom geometry, gridsize double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_ReducePrecision$function$
;

CREATE OR REPLACE FUNCTION public.st_relate(geom1 geometry, geom2 geometry, text)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$relate_pattern$function$
;

CREATE OR REPLACE FUNCTION public.st_relate(geom1 geometry, geom2 geometry, integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$relate_full$function$
;

CREATE OR REPLACE FUNCTION public.st_relate(geom1 geometry, geom2 geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$relate_full$function$
;

CREATE OR REPLACE FUNCTION public.st_relatematch(text, text)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_RelateMatch$function$
;

CREATE OR REPLACE FUNCTION public.st_removepoint(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_removepoint$function$
;

CREATE OR REPLACE FUNCTION public.st_removerepeatedpoints(geom geometry, tolerance double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_RemoveRepeatedPoints$function$
;

CREATE OR REPLACE FUNCTION public.st_reverse(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_reverse$function$
;

CREATE OR REPLACE FUNCTION public.st_rotate(geometry, double precision, geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), -sin($2), 0,  sin($2),  cos($2), 0, 0, 0, 1, public.ST_X($3) - cos($2) * public.ST_X($3) + sin($2) * public.ST_Y($3), public.ST_Y($3) - sin($2) * public.ST_X($3) - cos($2) * public.ST_Y($3), 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_rotate(geometry, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), -sin($2), 0,  sin($2),  cos($2), 0, 0, 0, 1,	$3 - cos($2) * $3 + sin($2) * $4, $4 - sin($2) * $3 - cos($2) * $4, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_rotate(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), -sin($2), 0,  sin($2), cos($2), 0,  0, 0, 1,  0, 0, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_rotatex(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1, 1, 0, 0, 0, cos($2), -sin($2), 0, sin($2), cos($2), 0, 0, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_rotatey(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  cos($2), 0, sin($2),  0, 1, 0,  -sin($2), 0, cos($2), 0,  0, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_rotatez(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Rotate($1, $2)$function$
;

CREATE OR REPLACE FUNCTION public.st_scale(geometry, geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Scale$function$
;

CREATE OR REPLACE FUNCTION public.st_scale(geometry, geometry, origin geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Scale$function$
;

CREATE OR REPLACE FUNCTION public.st_scale(geometry, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Scale($1, public.ST_MakePoint($2, $3, $4))$function$
;

CREATE OR REPLACE FUNCTION public.st_scale(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Scale($1, $2, $3, 1)$function$
;

CREATE OR REPLACE FUNCTION public.st_scroll(geometry, geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Scroll$function$
;

CREATE OR REPLACE FUNCTION public.st_segmentize(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_segmentize2d$function$
;

CREATE OR REPLACE FUNCTION public.st_segmentize(geog geography, max_segment_length double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geography_segmentize$function$
;

CREATE OR REPLACE FUNCTION public.st_seteffectivearea(geometry, double precision DEFAULT '-1'::integer, integer DEFAULT 1)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_SetEffectiveArea$function$
;

CREATE OR REPLACE FUNCTION public.st_setpoint(geometry, integer, geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_setpoint_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_setsrid(geog geography, srid integer)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_set_srid$function$
;

CREATE OR REPLACE FUNCTION public.st_setsrid(geom geometry, srid integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_set_srid$function$
;

CREATE OR REPLACE FUNCTION public.st_sharedpaths(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_SharedPaths$function$
;

CREATE OR REPLACE FUNCTION public.st_shiftlongitude(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_longitude_shift$function$
;

CREATE OR REPLACE FUNCTION public.st_shortestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_shortestline2d$function$
;

CREATE OR REPLACE FUNCTION public.st_simplify(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_simplify2d$function$
;

CREATE OR REPLACE FUNCTION public.st_simplify(geometry, double precision, boolean)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_simplify2d$function$
;

CREATE OR REPLACE FUNCTION public.st_simplifypolygonhull(geom geometry, vertex_fraction double precision, is_outer boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_SimplifyPolygonHull$function$
;

CREATE OR REPLACE FUNCTION public.st_simplifypreservetopology(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$topologypreservesimplify$function$
;

CREATE OR REPLACE FUNCTION public.st_simplifyvw(geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_SetEffectiveArea$function$
;

CREATE OR REPLACE FUNCTION public.st_snap(geom1 geometry, geom2 geometry, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Snap$function$
;

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geometry, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_snaptogrid$function$
;

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geometry, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_SnapToGrid($1, 0, 0, $2, $2)$function$
;

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_SnapToGrid($1, 0, 0, $2, $3)$function$
;

CREATE OR REPLACE FUNCTION public.st_snaptogrid(geom1 geometry, geom2 geometry, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_snaptogrid_pointoff$function$
;

CREATE OR REPLACE FUNCTION public.st_split(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Split$function$
;

CREATE OR REPLACE FUNCTION public.st_square(size double precision, cell_i integer, cell_j integer, origin geometry DEFAULT '010100000000000000000000000000000000000000'::geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_Square$function$
;

CREATE OR REPLACE FUNCTION public.st_squaregrid(size double precision, bounds geometry, OUT geom geometry, OUT i integer, OUT j integer)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_ShapeGrid$function$
;

CREATE OR REPLACE FUNCTION public.st_srid(geog geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_get_srid$function$
;

CREATE OR REPLACE FUNCTION public.st_srid(geom geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_get_srid$function$
;

CREATE OR REPLACE FUNCTION public.st_startpoint(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_startpoint_linestring$function$
;

CREATE OR REPLACE FUNCTION public.st_subdivide(geom geometry, maxvertices integer DEFAULT 256, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS SETOF geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Subdivide$function$
;

CREATE OR REPLACE FUNCTION public.st_summary(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_summary$function$
;

CREATE OR REPLACE FUNCTION public.st_summary(geography)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_summary$function$
;

CREATE OR REPLACE FUNCTION public.st_swapordinates(geom geometry, ords cstring)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_SwapOrdinates$function$
;

CREATE OR REPLACE FUNCTION public.st_symdifference(geom1 geometry, geom2 geometry, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_SymDifference$function$
;

CREATE OR REPLACE FUNCTION public.st_symmetricdifference(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE sql
AS $function$SELECT ST_SymDifference(geom1, geom2, -1.0);$function$
;

CREATE OR REPLACE FUNCTION public.st_tileenvelope(zoom integer, x integer, y integer, bounds geometry DEFAULT '0102000020110F00000200000093107C45F81B73C193107C45F81B73C193107C45F81B734193107C45F81B7341'::geometry, margin double precision DEFAULT 0.0)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_TileEnvelope$function$
;

CREATE OR REPLACE FUNCTION public.st_touches(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$touches$function$
;

CREATE OR REPLACE FUNCTION public.st_transform(geometry, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$transform$function$
;

CREATE OR REPLACE FUNCTION public.st_transform(geom geometry, to_proj text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$SELECT public.postgis_transform_geometry($1, proj4text, $2, 0)
	FROM spatial_ref_sys WHERE srid=public.ST_SRID($1);$function$
;

CREATE OR REPLACE FUNCTION public.st_transform(geom geometry, from_proj text, to_srid integer)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$SELECT public.postgis_transform_geometry($1, $2, proj4text, $3)
	FROM spatial_ref_sys WHERE srid=$3;$function$
;

CREATE OR REPLACE FUNCTION public.st_transform(geom geometry, from_proj text, to_proj text)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$SELECT public.postgis_transform_geometry($1, $2, $3, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_translate(geometry, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Translate($1, $2, $3, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_translate(geometry, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1, 1, 0, 0, 0, 1, 0, 0, 0, 1, $2, $3, $4)$function$
;

CREATE OR REPLACE FUNCTION public.st_transscale(geometry, double precision, double precision, double precision, double precision)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS $function$SELECT public.ST_Affine($1,  $4, 0, 0,  0, $5, 0,
		0, 0, 1,  $2 * $4, $3 * $5, 0)$function$
;

CREATE OR REPLACE FUNCTION public.st_triangulatepolygon(g1 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_TriangulatePolygon$function$
;

CREATE OR REPLACE FUNCTION public.st_unaryunion(geometry, gridsize double precision DEFAULT '-1.0'::numeric)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_UnaryUnion$function$
;

CREATE OR REPLACE FUNCTION public.st_union(geometry[])
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$pgis_union_geometry_array$function$
;

CREATE OR REPLACE FUNCTION public.st_union(geom1 geometry, geom2 geometry, gridsize double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Union$function$
;

CREATE OR REPLACE FUNCTION public.st_union(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Union$function$
;

CREATE OR REPLACE FUNCTION public.st_voronoilines(g1 geometry, tolerance double precision DEFAULT 0.0, extend_to geometry DEFAULT NULL::geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public._ST_Voronoi(g1, extend_to, tolerance, false) $function$
;

CREATE OR REPLACE FUNCTION public.st_voronoipolygons(g1 geometry, tolerance double precision DEFAULT 0.0, extend_to geometry DEFAULT NULL::geometry)
 RETURNS geometry
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$ SELECT public._ST_Voronoi(g1, extend_to, tolerance, true) $function$
;

CREATE OR REPLACE FUNCTION public.st_within(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000 SUPPORT postgis_index_supportfn
AS '$libdir/postgis-3', $function$within$function$
;

CREATE OR REPLACE FUNCTION public.st_wkbtosql(wkb bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_from_WKB$function$
;

CREATE OR REPLACE FUNCTION public.st_wkttosql(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_from_text$function$
;

CREATE OR REPLACE FUNCTION public.st_wrapx(geom geometry, wrap double precision, move double precision)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$ST_WrapX$function$
;

CREATE OR REPLACE FUNCTION public.st_x(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_x_point$function$
;

CREATE OR REPLACE FUNCTION public.st_xmax(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_xmax$function$
;

CREATE OR REPLACE FUNCTION public.st_xmin(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_xmin$function$
;

CREATE OR REPLACE FUNCTION public.st_y(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_y_point$function$
;

CREATE OR REPLACE FUNCTION public.st_ymax(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_ymax$function$
;

CREATE OR REPLACE FUNCTION public.st_ymin(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_ymin$function$
;

CREATE OR REPLACE FUNCTION public.st_z(geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_z_point$function$
;

CREATE OR REPLACE FUNCTION public.st_zmax(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_zmax$function$
;

CREATE OR REPLACE FUNCTION public.st_zmflag(geometry)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_zmflag$function$
;

CREATE OR REPLACE FUNCTION public.st_zmin(box3d)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_zmin$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$
;

CREATE OR REPLACE FUNCTION public.subvector(halfvec, integer, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_subvector$function$
;

CREATE OR REPLACE FUNCTION public.subvector(vector, integer, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$subvector$function$
;

CREATE OR REPLACE FUNCTION public.sync_membership_for_official_school_bond()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.entity_type = 'SCHOOL'
     AND NEW.metadata ->> 'source' IN ('official_invite_code', 'official_school_creation')
  THEN
    PERFORM public.ensure_official_school_membership(
      NEW.user_id,
      NEW.entity_id::uuid,
      NEW.capacity
    );
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_student_context_on_enrollment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_school_id uuid;
BEGIN
    SELECT school_id INTO v_school_id FROM public.classrooms WHERE id = NEW.classroom_id;
    
    IF NEW.student_id IS NOT NULL THEN
        UPDATE public.student_profiles 
        SET 
            school_id = v_school_id, 
            active_classroom_id = NEW.classroom_id
        WHERE user_id = NEW.student_id;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.text(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_text$function$
;

CREATE OR REPLACE FUNCTION public.touch_my_device_account(p_device_id uuid, p_account_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(device_id uuid, install_id text, is_trusted boolean, model_name text, os_version text, platform text, last_seen_at timestamp with time zone, last_accessed_at timestamp with time zone, linked_account_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_my_id UUID;
    v_account_id UUID;
BEGIN
    v_my_id := public.get_my_id();
    v_account_id := COALESCE(p_account_id, v_my_id);

    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to touch a device account';
    END IF;

    IF v_account_id IS DISTINCT FROM v_my_id THEN
        RAISE EXCEPTION 'You may only touch the current account device link';
    END IF;

    IF p_device_id IS NULL THEN
        RAISE EXCEPTION 'device_id is required';
    END IF;

    PERFORM 1
    FROM public.device_accounts da
    WHERE da.device_id = p_device_id
      AND da.account_id = v_account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % is not linked to account %', p_device_id, v_account_id;
    END IF;

    UPDATE public.device_registry
    SET last_seen_at = now()
    WHERE device_id = p_device_id;

    UPDATE public.device_accounts
    SET last_accessed_at = now()
    WHERE device_id = p_device_id
      AND account_id = v_account_id;

    RETURN QUERY
    SELECT *
    FROM public.get_my_device_trust(p_device_id, NULL);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.touch_user_workspace_layout_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.updated_at := now();
    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.unlockrows(text)
 RETURNS integer
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret int;
BEGIN

	IF NOT LongTransactionsEnabled() THEN
		RAISE EXCEPTION 'Long transaction support disabled, use EnableLongTransaction() to enable.';
	END IF;

	EXECUTE 'DELETE FROM authorization_table where authid = ' ||
		quote_literal($1);

	GET DIAGNOSTICS ret = ROW_COUNT;

	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.direct_conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_group_member_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.community_groups
    SET member_count = (
      SELECT COUNT(*) FROM public.community_group_members
      WHERE group_id = NEW.group_id AND status = 'active'
    )
    WHERE id = NEW.group_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.community_groups
    SET member_count = (
      SELECT COUNT(*) FROM public.community_group_members
      WHERE group_id = OLD.group_id AND status = 'active'
    )
    WHERE id = OLD.group_id;
  END IF;

  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.updategeometrysrid(catalogn_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myrec RECORD;
	okay boolean;
	cname varchar;
	real_schema name;
	unknown_srid integer;
	new_srid integer := new_srid_in;

BEGIN

	-- Find, check or fix schema_name
	IF ( schema_name != '' ) THEN
		okay = false;

		FOR myrec IN SELECT nspname FROM pg_namespace WHERE text(nspname) = schema_name LOOP
			okay := true;
		END LOOP;

		IF ( okay <> true ) THEN
			RAISE EXCEPTION 'Invalid schema name';
		ELSE
			real_schema = schema_name;
		END IF;
	ELSE
		SELECT INTO real_schema current_schema()::text;
	END IF;

	-- Ensure that column_name is in geometry_columns
	okay = false;
	FOR myrec IN SELECT type, coord_dimension FROM public.geometry_columns WHERE f_table_schema = text(real_schema) and f_table_name = table_name and f_geometry_column = column_name LOOP
		okay := true;
	END LOOP;
	IF (NOT okay) THEN
		RAISE EXCEPTION 'column not found in geometry_columns table';
		RETURN false;
	END IF;

	-- Ensure that new_srid is valid
	IF ( new_srid > 0 ) THEN
		IF ( SELECT count(*) = 0 from spatial_ref_sys where srid = new_srid ) THEN
			RAISE EXCEPTION 'invalid SRID: % not found in spatial_ref_sys', new_srid;
			RETURN false;
		END IF;
	ELSE
		unknown_srid := public.ST_SRID('POINT EMPTY'::public.geometry);
		IF ( new_srid != unknown_srid ) THEN
			new_srid := unknown_srid;
			RAISE NOTICE 'SRID value % converted to the officially unknown SRID value %', new_srid_in, new_srid;
		END IF;
	END IF;

	IF postgis_constraint_srid(real_schema, table_name, column_name) IS NOT NULL THEN
	-- srid was enforced with constraints before, keep it that way.
		-- Make up constraint name
		cname = 'enforce_srid_'  || column_name;

		-- Drop enforce_srid constraint
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' DROP constraint ' || quote_ident(cname);

		-- Update geometries SRID
		EXECUTE 'UPDATE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' SET ' || quote_ident(column_name) ||
			' = public.ST_SetSRID(' || quote_ident(column_name) ||
			', ' || new_srid::text || ')';

		-- Reset enforce_srid constraint
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' ADD constraint ' || quote_ident(cname) ||
			' CHECK (st_srid(' || quote_ident(column_name) ||
			') = ' || new_srid::text || ')';
	ELSE
		-- We will use typmod to enforce if no srid constraints
		-- We are using postgis_type_name to lookup the new name
		-- (in case Paul changes his mind and flips geometry_columns to return old upper case name)
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) || '.' || quote_ident(table_name) ||
		' ALTER COLUMN ' || quote_ident(column_name) || ' TYPE  geometry(' || public.postgis_type_name(myrec.type, myrec.coord_dimension, true) || ', ' || new_srid::text || ') USING public.ST_SetSRID(' || quote_ident(column_name) || ',' || new_srid::text || ');' ;
	END IF;

	RETURN real_schema || '.' || table_name || '.' || column_name ||' SRID changed to ' || new_srid::text;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.updategeometrysrid(character varying, character varying, character varying, integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.UpdateGeometrySRID('',$1,$2,$3,$4) into ret;
	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.updategeometrysrid(character varying, character varying, integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.UpdateGeometrySRID('','',$1,$2,$3) into ret;
	RETURN ret;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_student_potential_analysis(p_student_id uuid, p_classroom_id uuid, p_cognitive_flow integer, p_emotional_resonance integer, p_social_weaving integer, p_creative_spark integer, p_practical_mastery integer, p_silver_lining text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO public.student_potential_analysis (
        student_id, teacher_id, classroom_id, 
        cognitive_flow, emotional_resonance, social_weaving, creative_spark, practical_mastery,
        silver_lining
    )
    VALUES (
        p_student_id, auth.uid(), p_classroom_id,
        p_cognitive_flow, p_emotional_resonance, p_social_weaving, p_creative_spark, p_practical_mastery,
        p_silver_lining
    )
    ON CONFLICT (student_id, teacher_id, classroom_id) DO UPDATE SET
        cognitive_flow = EXCLUDED.cognitive_flow,
        emotional_resonance = EXCLUDED.emotional_resonance,
        social_weaving = EXCLUDED.social_weaving,
        creative_spark = EXCLUDED.creative_spark,
        practical_mastery = EXCLUDED.practical_mastery,
        silver_lining = EXCLUDED.silver_lining,
        updated_at = now()
    RETURNING to_jsonb(student_potential_analysis.*) INTO v_result;
    
    RETURN v_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v7()
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  -- Extract milliseconds since epoch
  unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
  -- Concatenate with 10 random bytes - QUALIFIED with extensions schema
  uuid_bytes = unix_ts_ms || extensions.gen_random_bytes(10);
  -- Set version (7)
  -- Cast to bit(8) before integer to handle Postgres 16+ strict bitstring casting
  uuid_bytes = set_byte(uuid_bytes, 6, (b'0111' || (get_byte(uuid_bytes, 6) & 15)::bit(4))::bit(8)::integer);
  -- Set variant (RFC 4122)
  uuid_bytes = set_byte(uuid_bytes, 8, (b'10' || (get_byte(uuid_bytes, 8) & 63)::bit(6))::bit(8)::integer);
  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$function$
;

CREATE OR REPLACE FUNCTION public.vector(vector, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector$function$
;

CREATE OR REPLACE FUNCTION public.vector_accum(double precision[], vector)
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_accum$function$
;

CREATE OR REPLACE FUNCTION public.vector_add(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_add$function$
;

CREATE OR REPLACE FUNCTION public.vector_avg(double precision[])
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_avg$function$
;

CREATE OR REPLACE FUNCTION public.vector_cmp(vector, vector)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_cmp$function$
;

CREATE OR REPLACE FUNCTION public.vector_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_combine$function$
;

CREATE OR REPLACE FUNCTION public.vector_concat(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_concat$function$
;

CREATE OR REPLACE FUNCTION public.vector_dims(vector)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_dims$function$
;

CREATE OR REPLACE FUNCTION public.vector_dims(halfvec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$halfvec_vector_dims$function$
;

CREATE OR REPLACE FUNCTION public.vector_eq(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_eq$function$
;

CREATE OR REPLACE FUNCTION public.vector_ge(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_ge$function$
;

CREATE OR REPLACE FUNCTION public.vector_gt(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_gt$function$
;

CREATE OR REPLACE FUNCTION public.vector_in(cstring, oid, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_in$function$
;

CREATE OR REPLACE FUNCTION public.vector_l2_squared_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_l2_squared_distance$function$
;

CREATE OR REPLACE FUNCTION public.vector_le(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_le$function$
;

CREATE OR REPLACE FUNCTION public.vector_lt(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_lt$function$
;

CREATE OR REPLACE FUNCTION public.vector_mul(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_mul$function$
;

CREATE OR REPLACE FUNCTION public.vector_ne(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_ne$function$
;

CREATE OR REPLACE FUNCTION public.vector_negative_inner_product(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_negative_inner_product$function$
;

CREATE OR REPLACE FUNCTION public.vector_norm(vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_norm$function$
;

CREATE OR REPLACE FUNCTION public.vector_out(vector)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_out$function$
;

CREATE OR REPLACE FUNCTION public.vector_recv(internal, oid, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_recv$function$
;

CREATE OR REPLACE FUNCTION public.vector_send(vector)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_send$function$
;

CREATE OR REPLACE FUNCTION public.vector_spherical_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_spherical_distance$function$
;

CREATE OR REPLACE FUNCTION public.vector_sub(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_sub$function$
;

CREATE OR REPLACE FUNCTION public.vector_to_float4(vector, integer, boolean)
 RETURNS real[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_to_float4$function$
;

CREATE OR REPLACE FUNCTION public.vector_to_halfvec(vector, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_to_halfvec$function$
;

CREATE OR REPLACE FUNCTION public.vector_to_sparsevec(vector, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_to_sparsevec$function$
;

CREATE OR REPLACE FUNCTION public.vector_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/vector', $function$vector_typmod_in$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$
;

-- ─── Tables ───
CREATE TABLE public."academic_cycles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "name" text NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "is_current" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public."accounts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "code" text NOT NULL,
    "type" text NOT NULL,
    "parent_id" uuid,
    "balance" double precision DEFAULT 0 NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."ai_messages" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "thread_id" text NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text NOT NULL,
    "content" text NOT NULL,
    "privacy_mode" text DEFAULT 'saved'::text NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."announcements" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid NOT NULL,
    "author_id" uuid,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "is_pinned" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."app_config" (
    "key" text NOT NULL,
    "value" text NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."assignments" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "classroom_id" uuid NOT NULL,
    "lesson_id" uuid,
    "title" text NOT NULL,
    "description" text,
    "due_date" timestamp with time zone,
    "max_points" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."attendance" (
    "classroom_id" uuid NOT NULL,
    "student_id" uuid NOT NULL,
    "date" date NOT NULL,
    "status" text NOT NULL,
    "idempotency_key" text DEFAULT gen_random_uuid()
);

CREATE TABLE public."audit_log" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "action" text NOT NULL,
    "actor_id" uuid,
    "target_user_id" uuid,
    "old_role" text,
    "new_role" text,
    "old_school_id" uuid,
    "new_school_id" uuid,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."audit_logs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "action" text NOT NULL,
    "entity_id" uuid,
    "target_id" uuid,
    "entity_type" text,
    "executor_id" uuid,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "idempotency_key" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."auth_identities" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "provider" text NOT NULL,
    "provider_user_id" text NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."bonds" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "entity_id" text NOT NULL,
    "entity_type" text NOT NULL,
    "capacity" text NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."budgets" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "account_id" uuid NOT NULL,
    "amount" double precision NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "actual_spent" double precision DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."calendar_events" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "title" text NOT NULL,
    "type" text NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "is_public" boolean DEFAULT true NOT NULL,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."classroom_grading_settings" (
    "classroom_id" uuid NOT NULL,
    "grading_mode" text DEFAULT 'both'::text NOT NULL,
    "show_ranks" boolean DEFAULT true NOT NULL
);

CREATE TABLE public."classroom_join_requests" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "classroom_id" uuid NOT NULL,
    "role" text NOT NULL,
    "subject_label" text,
    "status" text DEFAULT 'pending'::text NOT NULL,
    "message" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."classroom_legacy_records" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "classroom_id" uuid NOT NULL,
    "academic_year" text NOT NULL,
    "teacher_id" uuid NOT NULL,
    "student_count" integer DEFAULT 0 NOT NULL,
    "avg_performance" numeric,
    "top_achievements" ARRAY DEFAULT '{}'::text[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."classroom_note_events" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "note_id" uuid NOT NULL,
    "classroom_id" uuid NOT NULL,
    "author_id" uuid NOT NULL,
    "event_type" text NOT NULL,
    "note_type" text NOT NULL,
    "visibility" text NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "snapshot" jsonb NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "effective_from" timestamp with time zone,
    "effective_to" timestamp with time zone,
    "recorded_by" uuid
);

CREATE TABLE public."classroom_notes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "classroom_id" uuid NOT NULL,
    "author_id" uuid NOT NULL,
    "content" text NOT NULL,
    "note_type" text DEFAULT 'note'::text NOT NULL,
    "visibility" text DEFAULT 'private'::text NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."classroom_photos" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "teacher_id" uuid,
    "classroom_id" uuid,
    "file_url" text NOT NULL,
    "caption" text,
    "shared_with_principal" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."classroom_students" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "classroom_id" uuid NOT NULL,
    "student_id" uuid,
    "full_name" text,
    "invite_code" text DEFAULT "substring"((uuid_generate_v4())::text, 1, 8),
    "roll_number" integer,
    "enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
    "claimed_at" timestamp with time zone,
    "status" text DEFAULT 'active'::text NOT NULL,
    "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
    "notes" text
);

CREATE TABLE public."classrooms" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid,
    "teacher_id" uuid,
    "grade_id" uuid,
    "section_id" uuid,
    "name" text NOT NULL,
    "subject" text,
    "description" text,
    "color_theme" text DEFAULT 'blue'::text,
    "is_archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "academic_year" text DEFAULT to_char(now(), 'YYYY'::text) NOT NULL,
    "created_by" uuid,
    "handle" text,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid,
    "deletion_reason" text
);

CREATE TABLE public."collection_node_events" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "collection_id" uuid NOT NULL,
    "node_id" uuid NOT NULL,
    "event_type" text NOT NULL,
    "position" integer,
    "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
    "actor_id" uuid
);

CREATE TABLE public."collection_nodes" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "collection_id" uuid,
    "node_id" uuid,
    "added_at" timestamp with time zone DEFAULT now(),
    "position" integer DEFAULT 0 NOT NULL,
    "added_by" uuid
);

CREATE TABLE public."collections" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "creator_id" uuid,
    "name" text NOT NULL,
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "description" text,
    "icon_emoji" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "verified" boolean DEFAULT false,
    "type" text DEFAULT 'subject'::text,
    "subject" text,
    "subjects" ARRAY DEFAULT '{}'::text[] NOT NULL,
    "grades" ARRAY DEFAULT '{}'::integer[] NOT NULL,
    "resource_ids" ARRAY DEFAULT '{}'::uuid[] NOT NULL,
    "sequence_order" ARRAY DEFAULT '{}'::integer[] NOT NULL,
    "visibility" text DEFAULT 'public'::text NOT NULL,
    "is_official" boolean DEFAULT false NOT NULL,
    "forks" integer DEFAULT 0 NOT NULL,
    "used_by_count" integer DEFAULT 0 NOT NULL,
    "endorsements" integer DEFAULT 0 NOT NULL,
    "estimated_duration" text,
    "school_id" uuid,
    "original_collection_id" uuid,
    "thumbnail_url" text,
    "topics" ARRAY DEFAULT '{}'::text[] NOT NULL
);

CREATE TABLE public."community_comments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "post_id" uuid NOT NULL,
    "author_id" uuid,
    "content" text NOT NULL,
    "is_edited" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

CREATE TABLE public."community_entity_versions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" uuid NOT NULL,
    "event_type" text NOT NULL,
    "changed_at" timestamp with time zone DEFAULT now() NOT NULL,
    "changed_by" uuid,
    "snapshot" jsonb NOT NULL
);

CREATE TABLE public."community_group_members" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "group_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text DEFAULT 'member'::text NOT NULL,
    "joined_at" timestamp with time zone DEFAULT now(),
    "status" text DEFAULT 'pending'::text NOT NULL
);

CREATE TABLE public."community_groups" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "classroom_id" uuid,
    "join_policy" text DEFAULT 'open'::text,
    "group_type" text DEFAULT 'general'::text,
    "image_url" text,
    "member_count" integer DEFAULT 0,
    "handle" text,
    "is_public" boolean DEFAULT true
);

CREATE TABLE public."community_poll_votes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "post_id" uuid,
    "user_id" uuid,
    "option_id" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."community_posts" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid,
    "group_id" uuid NOT NULL,
    "author_id" uuid NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "media_url" text,
    "media_type" text,
    "post_type" text DEFAULT 'text'::text,
    "poll_data" jsonb,
    "author_role" text,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

CREATE TABLE public."community_profile_versions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "community_id" uuid NOT NULL,
    "school_id" uuid,
    "creator_id" uuid,
    "operation" text NOT NULL,
    "snapshot" jsonb NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "recorded_by" uuid
);

CREATE TABLE public."community_reactions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "post_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "emoji" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."community_reports" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "reporter_id" uuid NOT NULL,
    "post_id" uuid,
    "group_id" uuid,
    "target_user_id" uuid,
    "reason" text NOT NULL,
    "report_target" public."report_target_type" DEFAULT 'platform'::report_target_type,
    "assigned_handler_id" uuid,
    "status" text DEFAULT 'pending'::text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."contextual_challenges" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "type" text NOT NULL,
    "school_id" uuid,
    "classroom_id" uuid,
    "creator_user_id" uuid,
    "title_en" text NOT NULL,
    "description_en" text,
    "metric" text NOT NULL,
    "target_count" integer NOT NULL,
    "current_count" integer DEFAULT 0,
    "status" text DEFAULT 'active'::text NOT NULL,
    "nature_metaphor" text NOT NULL,
    "completion_celebration_en" text,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."contextual_moments" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "moment_type" text NOT NULL,
    "acknowledged" boolean DEFAULT false,
    "prompt_text" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."conversation_settings" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "conversation_id" uuid,
    "group_id" uuid,
    "is_muted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."daily_content" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "type" text NOT NULL,
    "content" text NOT NULL,
    "author" text,
    "date" date NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."daily_prep_items" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "item_text" text NOT NULL,
    "prep_date" date NOT NULL,
    "is_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."device_accounts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "device_id" uuid,
    "account_id" uuid,
    "last_accessed_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."device_registry" (
    "device_id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "model_name" text,
    "os_version" text,
    "is_trusted" boolean DEFAULT true,
    "last_seen_at" timestamp with time zone DEFAULT now(),
    "created_at" timestamp with time zone DEFAULT now(),
    "install_id" text NOT NULL,
    "platform" text,
    "created_by" uuid
);

CREATE TABLE public."direct_conversations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user1_id" uuid NOT NULL,
    "user2_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."direct_messages" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "conversation_id" uuid NOT NULL,
    "author_id" uuid NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

CREATE TABLE public."districts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "d_code" text,
    "province_name" text,
    "geom" public."geom_type",
    "properties" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."ecosystem_events" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "event_type" text NOT NULL,
    "entity_name" text NOT NULL,
    "entity_type" text DEFAULT 'package'::text NOT NULL,
    "event_date" timestamp with time zone DEFAULT now() NOT NULL,
    "summary" text NOT NULL,
    "source_url" text,
    "severity" text DEFAULT 'info'::text,
    "affects" ARRAY DEFAULT '{}'::text[],
    "raw_data" jsonb,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."edges" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "from_node_id" uuid,
    "to_node_id" uuid,
    "relationship" public."relationship_type" DEFAULT 'related'::node_relationship_type NOT NULL,
    "weight" double precision DEFAULT 1.0,
    "is_ai_generated" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "source_node_id" uuid,
    "target_node_id" uuid,
    "metadata" jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE public."edu_school_climate" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "edu_school_id" text NOT NULL,
    "census_id" text,
    "material_index" double precision DEFAULT 0.5,
    "harmony_score" double precision DEFAULT 0.5,
    "infra_snapshot" jsonb DEFAULT '{}'::jsonb,
    "connectivity_metadata" jsonb DEFAULT '{}'::jsonb,
    "relational_impedance" integer DEFAULT 0,
    "pulse_count" integer DEFAULT 0,
    "last_pulse_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."edu_school_contacts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" text,
    "contact_type" text NOT NULL,
    "contact_name" text,
    "phone" text,
    "email" text,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."edu_school_pulse_logs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "edu_school_id" text NOT NULL,
    "dimension" text DEFAULT 'general'::text,
    "score" double precision NOT NULL,
    "reason_category" text,
    "detailed_context" text,
    "identity_preference" text DEFAULT 'anonymous'::text,
    "author_profile_id" uuid,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."edu_school_registry_stats" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" text,
    "academic_year" integer DEFAULT EXTRACT(year FROM now()) NOT NULL,
    "total_students" integer DEFAULT 0,
    "medium" text,
    "grade_span" text,
    "difficulty_level" text,
    "properties" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."edu_schools" (
    "id" text NOT NULL,
    "census_no" text NOT NULL,
    "name" text NOT NULL,
    "gender" text,
    "category" text,
    "type_code" text,
    "province_id" text,
    "district_id" text,
    "gn_division_id" text,
    "postal_unit_id" text,
    "zone_id" text,
    "division_id" text,
    "location" public."location_type",
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "status" varchar(255),
    "religion" varchar(255),
    "website" text,
    "socio_economic_tier" varchar(255)
);

CREATE TABLE public."energy_forecasts" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "energy_level" integer NOT NULL,
    "notes" text,
    "forecast_date" date DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."feature_flags" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "key" text NOT NULL,
    "description" text,
    "tenant_kinds" ARRAY DEFAULT ARRAY[]::text[] NOT NULL,
    "citizenships" ARRAY DEFAULT ARRAY[]::text[] NOT NULL,
    "pricing_tiers" ARRAY DEFAULT ARRAY[]::text[] NOT NULL,
    "capacities" ARRAY DEFAULT ARRAY[]::text[] NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "is_development" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."feature_usage_log" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "feature_name" text NOT NULL,
    "interaction_type" text DEFAULT 'view'::text,
    "duration_seconds" integer,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."financial_transactions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "date" timestamp with time zone DEFAULT now() NOT NULL,
    "description" text NOT NULL,
    "reference_no" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."fire_journal" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "content_preview" text,
    "is_burned" boolean DEFAULT false,
    "burned_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."form_responses" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "template_id" uuid,
    "responder_id" uuid,
    "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public."form_templates" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "owner_id" uuid,
    "title" text NOT NULL,
    "description" text,
    "config" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "is_published" boolean DEFAULT false,
    "slug" text,
    "category" text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public."geo_datasets" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "category" text,
    "source_url" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."geo_districts" (
    "id" text NOT NULL,
    "province_id" text,
    "name" text NOT NULL,
    "name_si" text,
    "name_ta" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."geo_ds_divisions" (
    "id" text NOT NULL,
    "district_id" text,
    "name" text NOT NULL,
    "name_si" text,
    "name_ta" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."geo_features" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "dataset_id" uuid NOT NULL,
    "geom" public."geom_type",
    "properties" jsonb DEFAULT '{}'::jsonb,
    "admin_id" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."geo_gn_divisions" (
    "id" text NOT NULL,
    "ds_division_id" text,
    "district_id" text,
    "name" text NOT NULL,
    "name_si" text,
    "name_ta" text,
    "gn_code" text,
    "location" public."location_type",
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."geo_postal_towns" (
    "id" text NOT NULL,
    "district_id" text,
    "city" text NOT NULL,
    "postal_code" text NOT NULL,
    "location" public."location_type",
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."geo_provinces" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "name_si" text,
    "name_ta" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."gift_codes" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "code" text NOT NULL,
    "type" text NOT NULL,
    "value" integer,
    "is_redeemed" boolean DEFAULT false,
    "redeemed_by" uuid,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."grade_levels" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid NOT NULL,
    "section_id" uuid NOT NULL,
    "grade_number" integer NOT NULL,
    "grade_head_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."gratitude_entries" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "content" text NOT NULL,
    "category" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."gratitude_gifts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "sender_user_id" uuid NOT NULL,
    "recipient_user_id" uuid NOT NULL,
    "school_id" uuid,
    "message" text,
    "gift_type" text DEFAULT 'lantern'::text NOT NULL,
    "warm_message_en" text NOT NULL,
    "warm_message_si" text,
    "warm_message_ta" text,
    "delivered" boolean DEFAULT false,
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."group_messages" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "group_id" uuid NOT NULL,
    "author_id" uuid NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone,
    "idempotency_key" text
);

CREATE TABLE public."group_reports" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "group_id" uuid,
    "reporter_id" uuid,
    "target_user_id" uuid,
    "reason" text NOT NULL,
    "details" text,
    "status" text DEFAULT 'pending'::text,
    "created_at" timestamp with time zone DEFAULT now(),
    "post_id" uuid
);

CREATE TABLE public."growth_events" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "dimension" text NOT NULL,
    "event_type" text NOT NULL,
    "event_metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."impact_ripples" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "recipient_user_id" uuid NOT NULL,
    "actor_user_id" uuid,
    "entity_id" uuid,
    "ripple_type" text NOT NULL,
    "warm_message_en" text NOT NULL,
    "warm_message_si" text,
    "delivered" boolean DEFAULT false,
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."institutional_calendar" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "title" text NOT NULL,
    "type" text DEFAULT 'event'::text NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date,
    "is_public" boolean DEFAULT true NOT NULL,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."inventory_items" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "name" text NOT NULL,
    "category" text NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit" text DEFAULT 'pcs'::text,
    "condition" text DEFAULT 'good'::text NOT NULL,
    "location" text,
    "last_audit_at" timestamp with time zone DEFAULT now(),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "local_sync_id" uuid,
    "is_pending_sync" boolean DEFAULT false,
    "valid_from" timestamp with time zone DEFAULT now(),
    "valid_to" timestamp with time zone,
    "classroom_id" uuid,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."inventory_requests" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid,
    "classroom_id" uuid,
    "teacher_id" uuid,
    "item_name" text NOT NULL,
    "quantity" text NOT NULL,
    "reason" text,
    "status" text DEFAULT 'pending'::text,
    "priority" text DEFAULT 'normal'::text,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public."invite_codes" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid NOT NULL,
    "code" text NOT NULL,
    "role" text NOT NULL,
    "max_uses" integer,
    "uses_count" integer DEFAULT 0,
    "invitation_text" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "idempotency_key" text
);

CREATE TABLE public."invoices" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid NOT NULL,
    "amount" double precision NOT NULL,
    "currency" text DEFAULT 'LKR'::text NOT NULL,
    "status" text DEFAULT 'draft'::text NOT NULL,
    "due_date" timestamp with time zone NOT NULL,
    "items" jsonb NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."journal_entries" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."journeys" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "node_id" uuid,
    "status" text,
    "progress_score" double precision DEFAULT 0,
    "last_accessed_at" timestamp with time zone DEFAULT now(),
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."joy_moments" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "student_name" text,
    "moment_description" text NOT NULL,
    "category" text DEFAULT 'breakthrough'::text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."key_persons" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" text NOT NULL,
    "github_handle" text,
    "twitter_handle" text,
    "affiliation" text,
    "signal_weight" integer DEFAULT 5,
    "focus_areas" ARRAY DEFAULT '{}'::text[],
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."ledger_entries" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "transaction_id" uuid NOT NULL,
    "account_id" uuid NOT NULL,
    "amount" double precision NOT NULL,
    "side" text NOT NULL,
    "description" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."lesson_materials" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "classroom_id" uuid NOT NULL,
    "lesson_id" uuid,
    "title" text NOT NULL,
    "type" text NOT NULL,
    "url" text,
    "content" text,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."lessons" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "classroom_id" uuid NOT NULL,
    "title" text NOT NULL,
    "content" text,
    "order_index" integer DEFAULT 0 NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."library_entity_versions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" uuid NOT NULL,
    "event_type" text NOT NULL,
    "changed_at" timestamp with time zone DEFAULT now() NOT NULL,
    "changed_by" uuid,
    "snapshot" jsonb NOT NULL
);

CREATE TABLE public."manifesto_endorsements" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "manifesto_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "commitment_text" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."map_layers" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "layer_type" text NOT NULL,
    "icon_name" text,
    "is_visible" boolean DEFAULT true,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "projection_type" text DEFAULT 'cosmos'::text,
    "search_vector" tsvector,
    "icon_emoji" text DEFAULT '🗺'::text,
    "color" text DEFAULT '#F5A623'::text,
    "is_active" boolean DEFAULT true NOT NULL,
    "category" text,
    "is_geographic" boolean DEFAULT false
);

CREATE TABLE public."mapping_topologies" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "owner_id" uuid,
    "name" text NOT NULL,
    "description" text,
    "nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "links" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "supported_perspectives" ARRAY DEFAULT '{}'::text[],
    "context" jsonb DEFAULT '{}'::jsonb,
    "is_public" boolean DEFAULT false,
    "share_token" text DEFAULT encode(gen_random_bytes(16), 'hex'::text),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."mood_logs" (
    "id" uuid DEFAULT uuid_generate_v7() NOT NULL,
    "user_id" uuid NOT NULL,
    "mood_score" integer NOT NULL,
    "note" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "mood" text,
    "idempotency_key" uuid DEFAULT gen_random_uuid()
);

CREATE TABLE public."node_tags" (
    "node_id" uuid NOT NULL,
    "tag_id" uuid NOT NULL
);

CREATE TABLE public."nodes" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid,
    "creator_id" uuid,
    "title" text NOT NULL,
    "description" text,
    "url" text,
    "thumbnail_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "type" text NOT NULL,
    "creator_name" text,
    "creator_role" text NOT NULL,
    "subjects" ARRAY DEFAULT '{}'::text[] NOT NULL,
    "topics" ARRAY DEFAULT '{}'::text[] NOT NULL,
    "grades" ARRAY DEFAULT '{}'::integer[] NOT NULL,
    "difficulty" text DEFAULT 'intermediate'::text,
    "language" ARRAY DEFAULT ARRAY['si'::text] NOT NULL,
    "tags" ARRAY DEFAULT '{}'::text[],
    "verified" boolean DEFAULT false NOT NULL,
    "verified_by" uuid,
    "curriculum_aligned" boolean DEFAULT false,
    "copyright_notice" text,
    "views" integer DEFAULT 0 NOT NULL,
    "uses_count" integer DEFAULT 0 NOT NULL,
    "endorsements" integer DEFAULT 0 NOT NULL,
    "bookmarks" integer DEFAULT 0 NOT NULL,
    "embedding" public."embedding_type",
    "search_vector" tsvector,
    "is_geographic" boolean DEFAULT false,
    "latitude" double precision,
    "longitude" double precision,
    "map_x" double precision,
    "map_y" double precision,
    "parent_node_id" uuid,
    "island_id" text,
    "link_status" text DEFAULT 'unknown'::text,
    "last_checked_at" timestamp with time zone,
    "fail_count" integer DEFAULT 0,
    "title_si" text,
    "title_ta" text,
    "title_en" text,
    "description_si" text,
    "description_ta" text,
    "description_en" text,
    "is_community" boolean DEFAULT false NOT NULL,
    "format" text DEFAULT 'document'::text NOT NULL,
    "license" text,
    "is_ministry_official" boolean DEFAULT false,
    "media" jsonb,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "visibility" text DEFAULT 'public'::text NOT NULL,
    "file_path" text
);

CREATE TABLE public."notifications" (
    "id" uuid DEFAULT uuid_generate_v7() NOT NULL,
    "user_id" uuid NOT NULL,
    "type" text NOT NULL,
    "title" text NOT NULL,
    "body" text NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "reference_id" uuid,
    "reference_type" text,
    "idempotency_key" text
);

CREATE TABLE public."package_alternatives" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "package_name" text NOT NULL,
    "alternative_name" text NOT NULL,
    "comparison_summary" text,
    "migration_effort" text,
    "migration_notes" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."package_companions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "package_name" text NOT NULL,
    "companion_name" text NOT NULL,
    "co_occurrence_score" double precision DEFAULT 0,
    "context" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."package_conflicts" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "package_a" text NOT NULL,
    "package_b" text NOT NULL,
    "severity" text DEFAULT 'warning'::text,
    "reason" text NOT NULL,
    "rn_version_range" text,
    "workaround" text,
    "source_url" text,
    "resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."packages" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "package_name" text NOT NULL,
    "display_name" text,
    "description" text,
    "vendor" text DEFAULT 'independent'::text,
    "category" text NOT NULL,
    "use_case_tags" ARRAY DEFAULT '{}'::text[],
    "topology_layer" text DEFAULT 'L3'::text,
    "radar_status" text DEFAULT 'ASSESS'::text,
    "vitality_score" integer DEFAULT 0,
    "v1_readiness" text DEFAULT 'UNKNOWN'::text,
    "android_support" boolean DEFAULT false,
    "ios_support" boolean DEFAULT false,
    "web_support" boolean DEFAULT false,
    "expo_go_compatible" boolean DEFAULT false,
    "new_architecture_status" text DEFAULT 'unknown'::text,
    "typescript_support" boolean DEFAULT false,
    "rn_dir_maintained" boolean DEFAULT true,
    "expo_config_plugin" boolean DEFAULT false,
    "windows_support" boolean DEFAULT false,
    "macos_support" boolean DEFAULT false,
    "visionos_support" boolean DEFAULT false,
    "current_stable_version" text,
    "latest_version" text,
    "version_lag_major" integer DEFAULT 0,
    "version_lag_minor" integer DEFAULT 0,
    "version_lag_patch" integer DEFAULT 0,
    "update_safety_band" text DEFAULT 'unknown'::text,
    "maturity_period_days" integer,
    "last_major_bump_date" date,
    "breaking_change_frequency_months" double precision,
    "changelog_url" text,
    "release_notes_quality" text DEFAULT 'unknown'::text,
    "github_url" text,
    "npm_package_name" text,
    "bus_factor" integer DEFAULT 1,
    "lindy_age_months" integer DEFAULT 0,
    "stars_total" integer DEFAULT 0,
    "stars_30d_delta" integer DEFAULT 0,
    "stars_trajectory" text DEFAULT 'unknown'::text,
    "forks_total" integer DEFAULT 0,
    "contributors_total" integer DEFAULT 0,
    "contributors_active_90d" integer DEFAULT 0,
    "top_contributor_pct" double precision DEFAULT 100,
    "commit_count_30d" integer DEFAULT 0,
    "commit_count_90d" integer DEFAULT 0,
    "avg_gap_between_commits_days" double precision,
    "last_commit_date" timestamp with time zone,
    "last_meaningful_commit_date" timestamp with time zone,
    "open_issues_count" integer DEFAULT 0,
    "closed_issues_ratio" double precision DEFAULT 0,
    "open_prs_count" integer DEFAULT 0,
    "avg_pr_merge_days" double precision,
    "last_release_date" timestamp with time zone,
    "days_since_last_release" integer,
    "has_native_code" boolean DEFAULT false,
    "native_languages" ARRAY DEFAULT '{}'::text[],
    "jsi_binding_type" text DEFAULT 'unknown'::text,
    "nitro_modules_powered" boolean DEFAULT false,
    "hermes_v1_compatible" boolean,
    "wasm_compiled" boolean DEFAULT false,
    "wasm_source_language" text DEFAULT 'none'::text,
    "wasm_binary_size_bytes" integer DEFAULT 0,
    "prebuilt_ios_binary" boolean DEFAULT false,
    "bundle_increment_bytes" integer DEFAULT 0,
    "dependency_fan_out" integer DEFAULT 0,
    "peer_dependency_count" integer DEFAULT 0,
    "build_time_impact" text DEFAULT 'unknown'::text,
    "thread_safety" text DEFAULT 'unknown'::text,
    "adoption_rank_in_category" integer,
    "downloads_weekly_npm" integer DEFAULT 0,
    "download_trajectory" text DEFAULT 'unknown'::text,
    "used_by_expo_sdk" boolean DEFAULT false,
    "superseded_by" text,
    "supersedes" text,
    "v1_readiness_score" integer DEFAULT 0,
    "legacy_arch_code_present" boolean DEFAULT false,
    "stable_js_api_compliant" boolean,
    "breaking_change_risk_v1" text DEFAULT 'unknown'::text,
    "v1_migration_notes" text,
    "npm_deprecated" boolean DEFAULT false,
    "npm_deprecated_message" text,
    "has_api_deprecations" boolean DEFAULT false,
    "ecosystem_deprecated" boolean DEFAULT false,
    "last_synced_github" timestamp with time zone,
    "last_synced_npm" timestamp with time zone,
    "last_synced_rn_dir" timestamp with time zone,
    "manually_curated" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "wasm_thread_model" text DEFAULT 'unknown'::text,
    "wasm_worklets_required" boolean DEFAULT false,
    "wasm_worklets_min_version" text,
    "primary_purpose" text,
    "key_capabilities" ARRAY DEFAULT '{}'::text[],
    "known_limitations" ARRAY DEFAULT '{}'::text[],
    "thread_model" text DEFAULT 'unknown'::text,
    "compatibility_matrix" jsonb DEFAULT '{}'::jsonb,
    "depended_on_by_count" integer DEFAULT 0,
    "cascade_risk" text DEFAULT 'low'::text,
    "layer_completeness" integer DEFAULT 1
);

CREATE TABLE public."payment_intents" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "amount" double precision NOT NULL,
    "currency" text DEFAULT 'LKR'::text NOT NULL,
    "status" text DEFAULT 'pending'::text NOT NULL,
    "provider" text DEFAULT 'stripe'::text NOT NULL,
    "client_secret" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."permission_snapshots" (
    "id" text NOT NULL,
    "user_id" uuid NOT NULL,
    "active_bond_id" uuid NOT NULL,
    "school_id" text,
    "policy_version" text NOT NULL,
    "generated_at" timestamp with time zone NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "permissions" jsonb NOT NULL,
    "temporal_hints" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "signature" text NOT NULL,
    "active_entity_id" text NOT NULL,
    "active_entity_type" text NOT NULL
);

CREATE TABLE public."personal_classrooms" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "name" text NOT NULL,
    "type" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."personal_compasses" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "title_en" text NOT NULL,
    "metric" text NOT NULL,
    "target_count" integer NOT NULL,
    "current_count" integer DEFAULT 0,
    "status" text DEFAULT 'active'::text NOT NULL,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."policy_version" (
    "id" text NOT NULL,
    "hash" text NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."pricing_manifest" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "tier" text NOT NULL,
    "features" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."principal_governance_events" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "principal_id" uuid NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" text NOT NULL,
    "event_type" text NOT NULL,
    "snapshot" jsonb NOT NULL,
    "occurred_at" timestamp with time zone NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "effective_from" timestamp with time zone,
    "effective_to" timestamp with time zone,
    "recorded_by" uuid
);

CREATE TABLE public."principal_governance_records" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "principal_id" uuid,
    "school_id" uuid,
    "academic_year" text NOT NULL,
    "role" text NOT NULL,
    "staff_count" integer DEFAULT 0,
    "student_count" integer DEFAULT 0,
    "key_initiatives" ARRAY DEFAULT '{}'::text[],
    "institutional_growth_score" numeric,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."principal_notes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "author_id" uuid NOT NULL,
    "content" text NOT NULL,
    "note_type" text DEFAULT 'note'::text NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "is_done" boolean DEFAULT false NOT NULL,
    "context_teacher_id" uuid,
    "context_classroom_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."principal_observations" (
    "id" uuid DEFAULT uuid_generate_v7() NOT NULL,
    "school_id" uuid NOT NULL,
    "principal_id" uuid NOT NULL,
    "teacher_id" uuid,
    "classroom_id" uuid,
    "content" text NOT NULL,
    "type" text DEFAULT 'note'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "idempotency_key" uuid DEFAULT gen_random_uuid()
);

CREATE TABLE public."principal_profiles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "school_id" uuid,
    "nic_number" text,
    "staff_id" text,
    "designation" text,
    "office_hours" text,
    "management_bio" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "deleted_at" timestamp with time zone,
    "gender" text,
    "date_of_birth" date,
    "school_role" text,
    "work_roles" ARRAY,
    "deleted_by" uuid,
    "deletion_reason" text
);

CREATE TABLE public."privacy_ledger_entries" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "activity_type" text NOT NULL,
    "resource_name" text NOT NULL,
    "description" text NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."pro_gifts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "gifter_id" uuid NOT NULL,
    "recipient_id" uuid,
    "gifter_name" text,
    "recipient_role" text,
    "gift_message" text,
    "gift_token" text,
    "claimed" boolean DEFAULT false NOT NULL,
    "claimed_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."profile_completion" (
    "user_id" uuid NOT NULL,
    "completion_percentage" integer DEFAULT 30,
    "has_phone" boolean DEFAULT false,
    "has_avatar" boolean DEFAULT false,
    "has_bio" boolean DEFAULT false,
    "last_updated" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."provinces" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "p_code" text,
    "geom" public."geom_type",
    "properties" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."public_site_stats" (
    "id" integer DEFAULT 1 NOT NULL,
    "teachers_count" bigint DEFAULT 0 NOT NULL,
    "students_count" bigint DEFAULT 0 NOT NULL,
    "schools_count" bigint DEFAULT 0 NOT NULL,
    "lessons_shared_count" bigint DEFAULT 0 NOT NULL,
    "teachers_delta_30d" integer,
    "students_delta_30d" integer,
    "schools_delta_30d" integer,
    "lessons_shared_delta_30d" integer,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."receipts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "invoice_id" uuid,
    "amount" double precision NOT NULL,
    "currency" text DEFAULT 'LKR'::text NOT NULL,
    "paid_at" timestamp with time zone DEFAULT now() NOT NULL,
    "payment_method" text NOT NULL,
    "receipt_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."relief_assignments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "classroom_id" uuid NOT NULL,
    "original_teacher_id" uuid NOT NULL,
    "relief_teacher_id" uuid,
    "date" date DEFAULT CURRENT_DATE NOT NULL,
    "status" text DEFAULT 'pending'::text NOT NULL,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "local_sync_id" uuid,
    "is_pending_sync" boolean DEFAULT false,
    "valid_from" timestamp with time zone DEFAULT now(),
    "valid_to" timestamp with time zone
);

CREATE TABLE public."reminders" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "icon_type" text DEFAULT 'bell'::text,
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."resource_engagements" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "resource_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "engagement_type" text NOT NULL,
    "classroom_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."sanctuary_manifestos" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid NOT NULL,
    "creator_id" uuid NOT NULL,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "vibe" text DEFAULT 'visionary'::text,
    "status" text DEFAULT 'active'::text,
    "target_date" timestamp with time zone,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "endorsement_count" integer DEFAULT 0 NOT NULL
);

CREATE TABLE public."school_forest_state" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "teacher_user_id" uuid NOT NULL,
    "tree_health" text DEFAULT 'seedling'::text NOT NULL,
    "has_thuthimal" boolean DEFAULT false,
    "last_signal_at" timestamp with time zone,
    "computed_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."school_join_requests" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "school_id" uuid,
    "role" text NOT NULL,
    "status" text DEFAULT 'pending'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."school_legacy_records" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid,
    "academic_year" text NOT NULL,
    "total_students" integer DEFAULT 0,
    "total_staff" integer DEFAULT 0,
    "avg_performance" numeric,
    "graduation_rate" numeric,
    "milestones" ARRAY DEFAULT '{}'::text[],
    "leadership" jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."school_memberships" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "school_id" uuid NOT NULL,
    "role" text NOT NULL,
    "status" text DEFAULT 'active'::text NOT NULL,
    "start_date" timestamp with time zone DEFAULT now(),
    "end_date" timestamp with time zone,
    "is_primary" boolean DEFAULT true,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_by" uuid,
    "deletion_reason" text,
    "joined_at" timestamp with time zone DEFAULT now(),
    "left_at" timestamp with time zone
);

CREATE TABLE public."school_registry_claims" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "edu_school_id" text NOT NULL,
    "requested_by" uuid NOT NULL,
    "status" text DEFAULT 'pending'::text NOT NULL,
    "evidence" jsonb,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "claimed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "idempotency_key" text
);

CREATE TABLE public."school_registry_legacy" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "census_id" text NOT NULL,
    "name" text NOT NULL,
    "address" text,
    "tel_no" text,
    "email" text,
    "province" text,
    "district" text,
    "zone" text,
    "division" text,
    "medium" text,
    "gender" text,
    "category" text,
    "type" text,
    "grade_span" text,
    "total_students" integer,
    "difficulty_level" text,
    "properties" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."schools" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "type" text,
    "created_by" uuid,
    "is_sample" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "handle" text,
    "tenant_kind" text DEFAULT 'customer'::text NOT NULL,
    "deleted_at" timestamp with time zone,
    "census_id" text,
    "custom_branding" jsonb DEFAULT '{}'::jsonb,
    "deleted_by" uuid,
    "deletion_reason" text,
    "last_census_sync" timestamp with time zone,
    "sync_status" text DEFAULT 'synced'::text,
    "avatar_url" text
);

CREATE TABLE public."sections" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "school_id" uuid NOT NULL,
    "name" text NOT NULL,
    "name_si" text,
    "name_ta" text,
    "grade_range" text,
    "section_head_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."security_audit_logs" (
    "id" uuid DEFAULT uuid_generate_v7() NOT NULL,
    "account_id" uuid,
    "device_id" uuid,
    "action" text NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."sentinel_audit_logs" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "actor_id" uuid NOT NULL,
    "action" text NOT NULL,
    "resource_type" text NOT NULL,
    "resource_id" text,
    "details" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."sleep_logs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "hours" double precision NOT NULL,
    "quality" text,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."snapshot_moments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "resonance_date" date NOT NULL,
    "label" text DEFAULT 'Resonant Moment'::text NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."spatial_ref_sys" (
    "srid" integer NOT NULL,
    "auth_name" varchar(256),
    "auth_srid" integer,
    "srtext" varchar(2048),
    "proj4text" varchar(2048)
);

CREATE TABLE public."staff_attendance" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "school_id" uuid NOT NULL,
    "check_in" timestamp with time zone DEFAULT now(),
    "check_out" timestamp with time zone,
    "status" text DEFAULT 'present'::text,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "date" date DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE public."staff_leaves" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "school_id" uuid NOT NULL,
    "leave_type" text NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "reason" text,
    "status" text DEFAULT 'pending'::text NOT NULL,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."staging" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "url" text NOT NULL,
    "source_type" text NOT NULL,
    "content_type" text NOT NULL,
    "language" ARRAY DEFAULT '{}'::text[],
    "target_roles" ARRAY DEFAULT '{}'::text[],
    "status" text DEFAULT 'pending_review'::text,
    "embedding" public."embedding_type",
    "map_x" double precision,
    "map_y" double precision,
    "suggested_tags" jsonb DEFAULT '[]'::jsonb,
    "suggested_edges" jsonb DEFAULT '[]'::jsonb,
    "enrichment_complete" boolean DEFAULT false,
    "author_name" text,
    "published_at" timestamp with time zone,
    "ai_score" double precision,
    "ai_reasoning" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."student_academic_records" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "student_id" uuid NOT NULL,
    "classroom_id" uuid NOT NULL,
    "teacher_id" uuid,
    "school_id" uuid NOT NULL,
    "academic_year" text NOT NULL,
    "grade_number" integer,
    "subject" text,
    "avg_grade" numeric,
    "highest_grade" numeric,
    "lowest_grade" numeric,
    "assignments_total" integer DEFAULT 0,
    "assignments_submitted" integer DEFAULT 0,
    "teacher_note" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."student_grades" (
    "id" uuid DEFAULT uuid_generate_v7() NOT NULL,
    "student_id" uuid NOT NULL,
    "classroom_id" uuid NOT NULL,
    "assignment_id" text,
    "marks" numeric NOT NULL,
    "grade" text NOT NULL,
    "gpa" numeric NOT NULL,
    "feedback" text,
    "graded_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "graded_by" uuid NOT NULL,
    "deleted_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "idempotency_key" text,
    "publication_state" text DEFAULT 'draft'::text NOT NULL,
    "published_at" timestamp with time zone,
    "published_by" uuid,
    "publication_action" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."student_guardian_relationships" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "student_id" uuid NOT NULL,
    "guardian_id" uuid NOT NULL,
    "relationship_type" text DEFAULT 'parent'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."student_longitudinal_events" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "student_id" uuid NOT NULL,
    "school_id" uuid,
    "grade_id" uuid,
    "classroom_id" uuid,
    "entity_type" text NOT NULL,
    "entity_id" text NOT NULL,
    "operation" text NOT NULL,
    "source_table" text NOT NULL,
    "snapshot" jsonb NOT NULL,
    "occurred_at" timestamp with time zone NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "effective_from" timestamp with time zone,
    "effective_to" timestamp with time zone,
    "recorded_by" uuid,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."student_observations" (
    "id" uuid DEFAULT uuid_generate_v7() NOT NULL,
    "classroom_id" uuid NOT NULL,
    "classroom_student_id" uuid NOT NULL,
    "student_id" uuid,
    "author_id" uuid NOT NULL,
    "content" text NOT NULL,
    "observation_type" text DEFAULT 'neutral'::text NOT NULL,
    "visibility" text DEFAULT 'private'::text NOT NULL,
    "is_finalized" boolean DEFAULT false NOT NULL,
    "honesty_declaration_accepted" boolean DEFAULT false NOT NULL,
    "idempotency_key" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."student_potential_analysis" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "student_id" uuid NOT NULL,
    "teacher_id" uuid NOT NULL,
    "classroom_id" uuid NOT NULL,
    "cognitive_flow" integer DEFAULT 50,
    "emotional_resonance" integer DEFAULT 50,
    "social_weaving" integer DEFAULT 50,
    "creative_spark" integer DEFAULT 50,
    "practical_mastery" integer DEFAULT 50,
    "silver_lining" text,
    "potential_notes" jsonb DEFAULT '[]'::jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."student_profiles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "index_number" text,
    "guardian_id" uuid,
    "current_grade_id" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "deleted_at" timestamp with time zone,
    "section_id" uuid,
    "deleted_by" uuid,
    "deletion_reason" text,
    "school_id" uuid,
    "active_classroom_id" uuid
);

CREATE TABLE public."student_record_access_grants" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "student_id" uuid NOT NULL,
    "grantee_school_id" uuid NOT NULL,
    "granter_id" uuid NOT NULL,
    "status" text DEFAULT 'pending'::text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "granted_at" timestamp with time zone,
    "revoked_at" timestamp with time zone,
    "expiry_at" timestamp with time zone
);

CREATE TABLE public."students" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "classroom_id" uuid,
    "full_name" text NOT NULL,
    "index_number" text,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."submissions" (
    "id" uuid DEFAULT uuid_generate_v7() NOT NULL,
    "assignment_id" uuid NOT NULL,
    "student_id" uuid NOT NULL,
    "content" text,
    "submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
    "grade" numeric,
    "feedback" text,
    "graded_at" timestamp with time zone,
    "idempotency_key" uuid DEFAULT gen_random_uuid(),
    "photo_url" text
);

CREATE TABLE public."subscriptions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "school_id" uuid,
    "tier" text DEFAULT 'free'::text NOT NULL,
    "status" text DEFAULT 'active'::text NOT NULL,
    "started_at" timestamp with time zone DEFAULT now() NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."tags" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name_si" text,
    "name_ta" text,
    "name_en" text NOT NULL,
    "category" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."teacher_insight_events" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "insight_type" text NOT NULL,
    "insight_id" uuid NOT NULL,
    "owner_id" uuid NOT NULL,
    "school_id" uuid,
    "classroom_id" uuid,
    "student_id" uuid,
    "event_type" text NOT NULL,
    "visibility" text,
    "share_state" text NOT NULL,
    "promotion_target" text,
    "snapshot" jsonb NOT NULL,
    "occurred_at" timestamp with time zone NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "effective_from" timestamp with time zone,
    "effective_to" timestamp with time zone,
    "recorded_by" uuid
);

CREATE TABLE public."teacher_professional_records" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "teacher_id" uuid,
    "school_id" uuid,
    "academic_year" text NOT NULL,
    "designation" text NOT NULL,
    "subjects" ARRAY DEFAULT '{}'::text[],
    "classrooms_count" integer DEFAULT 0,
    "students_count" integer DEFAULT 0,
    "avg_classroom_performance" numeric,
    "achievements" ARRAY DEFAULT '{}'::text[],
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."teacher_profiles" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "school_id" uuid,
    "nic_number" text,
    "staff_id" text,
    "designation" text,
    "experience_years" integer,
    "subjects_taught" ARRAY,
    "qualifications" ARRAY,
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "is_section_head" boolean DEFAULT false,
    "section_id" uuid,
    "deleted_at" timestamp with time zone,
    "gender" text,
    "date_of_birth" date,
    "school_role" text,
    "work_roles" ARRAY,
    "deleted_by" uuid,
    "deletion_reason" text
);

CREATE TABLE public."temporal_summaries" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "resonance_date" date NOT NULL,
    "scale" text NOT NULL,
    "metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "summary_text" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."thuthimal_gifts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "gift_token" uuid DEFAULT gen_random_uuid() NOT NULL,
    "gifter_id" uuid NOT NULL,
    "gifter_name" text NOT NULL,
    "recipient_role" text NOT NULL,
    "recipient_id" uuid,
    "claimed" boolean DEFAULT false NOT NULL,
    "claimed_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone,
    "gift_message" text
);

CREATE TABLE public."timetable" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "day_of_week" integer NOT NULL,
    "period_number" integer NOT NULL,
    "subject" text NOT NULL,
    "class_name" text NOT NULL,
    "type" text DEFAULT 'subject'::text NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "academic_year" text DEFAULT to_char(now(), 'YYYY'::text) NOT NULL
);

CREATE TABLE public."user_blocks" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "blocker_id" uuid NOT NULL,
    "blocked_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."user_entitlement_grants" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "bond_id" uuid,
    "entity_id" text,
    "entity_type" text,
    "scope_type" text NOT NULL,
    "tier" text NOT NULL,
    "modules" ARRAY DEFAULT '{}'::text[] NOT NULL,
    "source" text NOT NULL,
    "status" text DEFAULT 'ACTIVE'::text NOT NULL,
    "starts_at" timestamp with time zone DEFAULT now() NOT NULL,
    "expires_at" timestamp with time zone,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."user_growth_state" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "bhumi_stage" text DEFAULT 'bijam'::text NOT NULL,
    "presence_signals" integer DEFAULT 0 NOT NULL,
    "nourishing_signals" integer DEFAULT 0 NOT NULL,
    "witnessing_signals" integer DEFAULT 0 NOT NULL,
    "weaving_signals" integer DEFAULT 0 NOT NULL,
    "blooming_signals" integer DEFAULT 0 NOT NULL,
    "banyan_stage" text DEFAULT 'sapling'::text,
    "river_stage" text DEFAULT 'trickle'::text,
    "crystal_tier" text DEFAULT 'spark'::text,
    "peer_mentored_count" integer DEFAULT 0 NOT NULL,
    "circles_facilitated_count" integer DEFAULT 0 NOT NULL,
    "lessons_completed_count" integer DEFAULT 0 NOT NULL,
    "reflections_submitted_count" integer DEFAULT 0 NOT NULL,
    "crystals_found_count" integer DEFAULT 0 NOT NULL,
    "fractal_moments_count" integer DEFAULT 0 NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_completed_at" timestamp with time zone,
    "profile_completed" boolean DEFAULT false,
    "deleted_at" timestamp with time zone
);

CREATE TABLE public."user_growth_state_versions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "operation" text NOT NULL,
    "snapshot" jsonb NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "recorded_by" uuid
);

CREATE TABLE public."user_preferences" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "favorite_features" ARRAY DEFAULT ARRAY['mood'::text, 'fire'::text, 'rhythm'::text] NOT NULL,
    "hidden_features" ARRAY DEFAULT ARRAY[]::text[] NOT NULL,
    "morning_check_time" time without time zone DEFAULT '08:00:00'::time without time zone,
    "afternoon_check_time" time without time zone DEFAULT '14:47:00'::time without time zone,
    "evening_wind_down_time" time without time zone DEFAULT '17:00:00'::time without time zone,
    "enable_contextual_prompts" boolean DEFAULT true NOT NULL,
    "enable_usage_tracking" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "notification_settings" jsonb DEFAULT '{"channels": {"push": true, "email": false, "in_app": true}, "categories": {"academic": {"push": true, "email": true}, "security": {"push": true, "email": true}, "community": {"push": true, "email": false}, "direct_messages": {"push": true, "email": false}}, "quiet_hours": {"end": "07:00", "start": "22:00", "enabled": false}}'::jsonb
);

CREATE TABLE public."user_profile_versions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "school_id" uuid,
    "operation" text NOT NULL,
    "snapshot" jsonb NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "recorded_by" uuid
);

CREATE TABLE public."user_push_tokens" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "push_token" text NOT NULL,
    "device_id" text NOT NULL,
    "platform" text NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT now(),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."user_rewards" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid,
    "points" integer DEFAULT 0,
    "badges" ARRAY,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."user_rewards_versions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "operation" text NOT NULL,
    "snapshot" jsonb NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
    "recorded_by" uuid
);

CREATE TABLE public."user_social_links" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "platform" text NOT NULL,
    "url" text NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "privacy_level" text DEFAULT 'public'::text NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."user_social_state" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "invitations_remaining" integer DEFAULT 5,
    "invitations_sent" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "deleted_at" timestamp with time zone
);

CREATE TABLE public."user_workspace_layouts" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "workspace_id" text NOT NULL,
    "order_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "hidden_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "pinned_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "zone_by_surface_jsonb" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "layout_version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "layout_target" text DEFAULT 'shared'::text NOT NULL
);

CREATE TABLE public."users" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "email" text,
    "full_name" text DEFAULT 'Sanctuary User'::text NOT NULL,
    "avatar_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "last_seen_at" timestamp with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    "bio" text,
    "public_profile" boolean DEFAULT true,
    "username" text,
    "escrowed_recovery_key" text,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid,
    "deletion_reason" text,
    "onboarding_completed_at" timestamp with time zone,
    "index_number" text,
    "nic_number" text,
    "experience_years" integer,
    "subjects_taught" ARRAY DEFAULT '{}'::text[] NOT NULL,
    "qualifications" ARRAY DEFAULT '{}'::text[] NOT NULL,
    "school_id" uuid,
    "tenant_kind" text,
    "onboarding_completed" boolean DEFAULT false,
    "citizenship" text DEFAULT 'THIRD_CLASS'::text NOT NULL,
    "pricing_tier" text DEFAULT 'FREE'::text NOT NULL,
    "phone" text,
    "profile_completed" boolean DEFAULT false,
    "metadata" jsonb,
    "display_name" text,
    "first_name" text,
    "last_name" text,
    "identity_state" text DEFAULT 'anonymous'::text,
    "capacity" text,
    "is_thuthimal" boolean DEFAULT false,
    "thuthimal_gifter" text,
    "thuthimal_gifted_at" timestamp with time zone
);

CREATE TABLE public."whispered_moments" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "moment_key" text NOT NULL,
    "moment_name_en" text NOT NULL,
    "moment_name_si" text,
    "awarded_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE public."wisdom_notes" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "insight" text NOT NULL,
    "tags" ARRAY,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── Constraints ───
ALTER TABLE ONLY public."accounts" ADD CONSTRAINT "accounts_code_key" UNIQUE (code);
ALTER TABLE ONLY public."attendance" ADD CONSTRAINT "attendance_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."audit_logs" ADD CONSTRAINT "audit_logs_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."auth_identities" ADD CONSTRAINT "auth_identities_provider_provider_user_id_key" UNIQUE (provider, provider_user_id);
ALTER TABLE ONLY public."bonds" ADD CONSTRAINT "bonds_user_entity_capacity_unique" UNIQUE (user_id, entity_id, capacity);
ALTER TABLE ONLY public."classroom_students" ADD CONSTRAINT "classroom_students_invite_code_key" UNIQUE (invite_code);
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_handle_key" UNIQUE (handle);
ALTER TABLE ONLY public."collection_nodes" ADD CONSTRAINT "collection_nodes_collection_id_node_id_key" UNIQUE (collection_id, node_id);
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "community_groups_handle_key" UNIQUE (handle);
ALTER TABLE ONLY public."community_poll_votes" ADD CONSTRAINT "community_poll_votes_post_id_user_id_key" UNIQUE (post_id, user_id);
ALTER TABLE ONLY public."device_accounts" ADD CONSTRAINT "device_accounts_device_id_account_id_key" UNIQUE (device_id, account_id);
ALTER TABLE ONLY public."districts" ADD CONSTRAINT "districts_d_code_key" UNIQUE (d_code);
ALTER TABLE ONLY public."districts" ADD CONSTRAINT "districts_name_key" UNIQUE (name);
ALTER TABLE ONLY public."edges" ADD CONSTRAINT "edges_from_node_id_to_node_id_relationship_key" UNIQUE (from_node_id, to_node_id, relationship);
ALTER TABLE ONLY public."edu_school_climate" ADD CONSTRAINT "edu_school_climate_edu_school_id_key" UNIQUE (edu_school_id);
ALTER TABLE ONLY public."edu_school_registry_stats" ADD CONSTRAINT "edu_school_registry_stats_school_id_academic_year_key" UNIQUE (school_id, academic_year);
ALTER TABLE ONLY public."edu_schools" ADD CONSTRAINT "edu_schools_census_no_key" UNIQUE (census_no);
ALTER TABLE ONLY public."energy_forecasts" ADD CONSTRAINT "energy_forecasts_user_id_forecast_date_key" UNIQUE (user_id, forecast_date);
ALTER TABLE ONLY public."feature_flags" ADD CONSTRAINT "feature_flags_key_key" UNIQUE (key);
ALTER TABLE ONLY public."form_templates" ADD CONSTRAINT "form_templates_slug_key" UNIQUE (slug);
ALTER TABLE ONLY public."gift_codes" ADD CONSTRAINT "gift_codes_code_key" UNIQUE (code);
ALTER TABLE ONLY public."grade_levels" ADD CONSTRAINT "grades_school_id_grade_number_key" UNIQUE (school_id, grade_number);
ALTER TABLE ONLY public."group_messages" ADD CONSTRAINT "group_messages_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."inventory_items" ADD CONSTRAINT "inventory_items_local_sync_id_key" UNIQUE (local_sync_id);
ALTER TABLE ONLY public."invite_codes" ADD CONSTRAINT "invite_codes_code_key" UNIQUE (code);
ALTER TABLE ONLY public."journeys" ADD CONSTRAINT "journeys_user_id_node_id_key" UNIQUE (user_id, node_id);
ALTER TABLE ONLY public."nodes" ADD CONSTRAINT "library_resources_url_unique" UNIQUE (url);
ALTER TABLE ONLY public."manifesto_endorsements" ADD CONSTRAINT "manifesto_endorsements_manifesto_id_user_id_key" UNIQUE (manifesto_id, user_id);
ALTER TABLE ONLY public."map_layers" ADD CONSTRAINT "map_layers_name_unique" UNIQUE (name);
ALTER TABLE ONLY public."mapping_topologies" ADD CONSTRAINT "mapping_topologies_share_token_key" UNIQUE (share_token);
ALTER TABLE ONLY public."mood_logs" ADD CONSTRAINT "mood_logs_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."notifications" ADD CONSTRAINT "notifications_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."packages" ADD CONSTRAINT "packages_package_name_key" UNIQUE (package_name);
ALTER TABLE ONLY public."pricing_manifest" ADD CONSTRAINT "pricing_manifest_tier_key" UNIQUE (tier);
ALTER TABLE ONLY public."principal_observations" ADD CONSTRAINT "principal_observations_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."principal_profiles" ADD CONSTRAINT "principal_profiles_user_id_key" UNIQUE (user_id);
ALTER TABLE ONLY public."provinces" ADD CONSTRAINT "provinces_name_key" UNIQUE (name);
ALTER TABLE ONLY public."provinces" ADD CONSTRAINT "provinces_p_code_key" UNIQUE (p_code);
ALTER TABLE ONLY public."relief_assignments" ADD CONSTRAINT "relief_assignments_local_sync_id_key" UNIQUE (local_sync_id);
ALTER TABLE ONLY public."school_forest_state" ADD CONSTRAINT "school_forest_state_school_id_teacher_user_id_key" UNIQUE (school_id, teacher_user_id);
ALTER TABLE ONLY public."school_memberships" ADD CONSTRAINT "school_memberships_user_school_role_status_key" UNIQUE (user_id, school_id, role, status);
ALTER TABLE ONLY public."school_registry_legacy" ADD CONSTRAINT "school_registry_census_id_key" UNIQUE (census_id);
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claim_pair_key" UNIQUE (school_id, edu_school_id);
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claims_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "schools_handle_key" UNIQUE (handle);
ALTER TABLE ONLY public."sections" ADD CONSTRAINT "sections_school_id_name_key" UNIQUE (school_id, name);
ALTER TABLE ONLY public."staging" ADD CONSTRAINT "staging_url_key" UNIQUE (url);
ALTER TABLE ONLY public."student_academic_records" ADD CONSTRAINT "student_academic_records_student_id_classroom_id_academic_y_key" UNIQUE (student_id, classroom_id, academic_year);
ALTER TABLE ONLY public."student_grades" ADD CONSTRAINT "student_grades_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_student_id_guardian_id_key" UNIQUE (student_id, guardian_id);
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_student_id_teacher_id_classroom__key" UNIQUE (student_id, teacher_id, classroom_id);
ALTER TABLE ONLY public."student_profiles" ADD CONSTRAINT "student_profiles_user_id_key" UNIQUE (user_id);
ALTER TABLE ONLY public."student_record_access_grants" ADD CONSTRAINT "student_record_access_grants_student_id_grantee_school_id_key" UNIQUE (student_id, grantee_school_id);
ALTER TABLE ONLY public."students" ADD CONSTRAINT "students_classroom_id_index_number_key" UNIQUE (classroom_id, index_number);
ALTER TABLE ONLY public."submissions" ADD CONSTRAINT "submissions_assignment_id_student_id_key" UNIQUE (assignment_id, student_id);
ALTER TABLE ONLY public."submissions" ADD CONSTRAINT "submissions_idempotency_key_key" UNIQUE (idempotency_key);
ALTER TABLE ONLY public."tags" ADD CONSTRAINT "tags_name_en_key" UNIQUE (name_en);
ALTER TABLE ONLY public."teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_key" UNIQUE (user_id);
ALTER TABLE ONLY public."temporal_summaries" ADD CONSTRAINT "temporal_summaries_user_id_resonance_date_scale_key" UNIQUE (user_id, resonance_date, scale);
ALTER TABLE ONLY public."thuthimal_gifts" ADD CONSTRAINT "thuthimal_gifts_gift_token_key" UNIQUE (gift_token);
ALTER TABLE ONLY public."timetable" ADD CONSTRAINT "timetable_user_day_period_year_key" UNIQUE (user_id, day_of_week, period_number, academic_year);
ALTER TABLE ONLY public."user_blocks" ADD CONSTRAINT "unique_block_pair" UNIQUE (blocker_id, blocked_id);
ALTER TABLE ONLY public."conversation_settings" ADD CONSTRAINT "unique_user_chat_settings" UNIQUE (user_id, conversation_id, group_id);
ALTER TABLE ONLY public."direct_conversations" ADD CONSTRAINT "unique_user_pair" UNIQUE (user1_id, user2_id);
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "uq_user_workspace_layout" UNIQUE (user_id, workspace_id, layout_target);
ALTER TABLE ONLY public."user_growth_state" ADD CONSTRAINT "user_growth_state_user_id_key" UNIQUE (user_id);
ALTER TABLE ONLY public."user_preferences" ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE (user_id);
ALTER TABLE ONLY public."user_push_tokens" ADD CONSTRAINT "user_push_tokens_user_device_key" UNIQUE (user_id, device_id);
ALTER TABLE ONLY public."user_social_state" ADD CONSTRAINT "user_social_state_user_id_key" UNIQUE (user_id);
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_email_key" UNIQUE (email);
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_username_key" UNIQUE (username);
ALTER TABLE ONLY public."whispered_moments" ADD CONSTRAINT "whispered_moments_user_id_moment_key_key" UNIQUE (user_id, moment_key);
ALTER TABLE ONLY public."academic_cycles" ADD CONSTRAINT "academic_cycles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."accounts" ADD CONSTRAINT "accounts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ai_messages" ADD CONSTRAINT "ai_messages_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."announcements" ADD CONSTRAINT "announcements_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."app_config" ADD CONSTRAINT "app_config_pkey" PRIMARY KEY (key);
ALTER TABLE ONLY public."assignments" ADD CONSTRAINT "assignments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."attendance" ADD CONSTRAINT "attendance_pkey" PRIMARY KEY (classroom_id, student_id, date);
ALTER TABLE ONLY public."audit_log" ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."audit_logs" ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."auth_identities" ADD CONSTRAINT "auth_identities_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."bonds" ADD CONSTRAINT "bonds_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."budgets" ADD CONSTRAINT "budgets_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."calendar_events" ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."classroom_grading_settings" ADD CONSTRAINT "classroom_grading_settings_pkey" PRIMARY KEY (classroom_id);
ALTER TABLE ONLY public."classroom_join_requests" ADD CONSTRAINT "classroom_join_requests_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."classroom_legacy_records" ADD CONSTRAINT "classroom_legacy_records_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."classroom_note_events" ADD CONSTRAINT "classroom_note_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."classroom_notes" ADD CONSTRAINT "classroom_notes_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."classroom_photos" ADD CONSTRAINT "classroom_photos_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."classroom_students" ADD CONSTRAINT "classroom_students_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."collection_node_events" ADD CONSTRAINT "collection_node_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_comments" ADD CONSTRAINT "community_comments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_entity_versions" ADD CONSTRAINT "community_entity_versions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_group_members" ADD CONSTRAINT "community_group_members_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "community_groups_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_poll_votes" ADD CONSTRAINT "community_poll_votes_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_posts" ADD CONSTRAINT "community_posts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_profile_versions" ADD CONSTRAINT "community_profile_versions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_reactions" ADD CONSTRAINT "community_reactions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."community_reports" ADD CONSTRAINT "community_reports_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."contextual_challenges" ADD CONSTRAINT "contextual_challenges_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."contextual_moments" ADD CONSTRAINT "contextual_moments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."conversation_settings" ADD CONSTRAINT "conversation_settings_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."daily_content" ADD CONSTRAINT "daily_content_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."daily_prep_items" ADD CONSTRAINT "daily_prep_items_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."device_accounts" ADD CONSTRAINT "device_accounts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."device_registry" ADD CONSTRAINT "device_registry_pkey" PRIMARY KEY (device_id);
ALTER TABLE ONLY public."direct_conversations" ADD CONSTRAINT "direct_conversations_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."direct_messages" ADD CONSTRAINT "direct_messages_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."districts" ADD CONSTRAINT "districts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ecosystem_events" ADD CONSTRAINT "ecosystem_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."edges" ADD CONSTRAINT "edges_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."edu_school_climate" ADD CONSTRAINT "edu_school_climate_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."edu_school_contacts" ADD CONSTRAINT "edu_school_contacts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."edu_school_pulse_logs" ADD CONSTRAINT "edu_school_pulse_logs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."edu_school_registry_stats" ADD CONSTRAINT "edu_school_registry_stats_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."edu_schools" ADD CONSTRAINT "edu_schools_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."energy_forecasts" ADD CONSTRAINT "energy_forecasts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."feature_flags" ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."feature_usage_log" ADD CONSTRAINT "feature_usage_log_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."financial_transactions" ADD CONSTRAINT "financial_transactions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."fire_journal" ADD CONSTRAINT "fire_journal_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."form_responses" ADD CONSTRAINT "form_responses_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."form_templates" ADD CONSTRAINT "form_templates_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."geo_datasets" ADD CONSTRAINT "geo_datasets_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."geo_districts" ADD CONSTRAINT "geo_districts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."geo_ds_divisions" ADD CONSTRAINT "geo_ds_divisions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."geo_features" ADD CONSTRAINT "geo_features_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."geo_gn_divisions" ADD CONSTRAINT "geo_gn_divisions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."geo_postal_towns" ADD CONSTRAINT "geo_postal_towns_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."geo_provinces" ADD CONSTRAINT "geo_provinces_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."gift_codes" ADD CONSTRAINT "gift_codes_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."grade_levels" ADD CONSTRAINT "grades_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."gratitude_entries" ADD CONSTRAINT "gratitude_entries_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."gratitude_gifts" ADD CONSTRAINT "gratitude_gifts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."group_messages" ADD CONSTRAINT "group_messages_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."group_reports" ADD CONSTRAINT "group_reports_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."growth_events" ADD CONSTRAINT "growth_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."impact_ripples" ADD CONSTRAINT "impact_ripples_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."institutional_calendar" ADD CONSTRAINT "institutional_calendar_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."inventory_items" ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."inventory_requests" ADD CONSTRAINT "inventory_requests_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."invite_codes" ADD CONSTRAINT "invite_codes_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."invoices" ADD CONSTRAINT "invoices_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."journal_entries" ADD CONSTRAINT "journal_entries_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."journeys" ADD CONSTRAINT "journeys_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."joy_moments" ADD CONSTRAINT "joy_moments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."key_persons" ADD CONSTRAINT "key_persons_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ledger_entries" ADD CONSTRAINT "ledger_entries_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."lesson_materials" ADD CONSTRAINT "lesson_materials_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."lessons" ADD CONSTRAINT "lessons_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."collection_nodes" ADD CONSTRAINT "library_collection_items_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."collections" ADD CONSTRAINT "library_collections_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."library_entity_versions" ADD CONSTRAINT "library_entity_versions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."nodes" ADD CONSTRAINT "library_items_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."manifesto_endorsements" ADD CONSTRAINT "manifesto_endorsements_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."map_layers" ADD CONSTRAINT "map_layers_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."mapping_topologies" ADD CONSTRAINT "mapping_topologies_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."mood_logs" ADD CONSTRAINT "mood_logs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."node_tags" ADD CONSTRAINT "node_tags_pkey" PRIMARY KEY (node_id, tag_id);
ALTER TABLE ONLY public."notifications" ADD CONSTRAINT "notifications_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."package_alternatives" ADD CONSTRAINT "package_alternatives_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."package_companions" ADD CONSTRAINT "package_companions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."package_conflicts" ADD CONSTRAINT "package_conflicts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."packages" ADD CONSTRAINT "packages_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."payment_intents" ADD CONSTRAINT "payment_intents_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."permission_snapshots" ADD CONSTRAINT "permission_snapshots_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."personal_classrooms" ADD CONSTRAINT "personal_classrooms_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."personal_compasses" ADD CONSTRAINT "personal_compasses_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."policy_version" ADD CONSTRAINT "policy_version_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."pricing_manifest" ADD CONSTRAINT "pricing_manifest_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."principal_governance_events" ADD CONSTRAINT "principal_governance_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."principal_governance_records" ADD CONSTRAINT "principal_governance_records_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."principal_notes" ADD CONSTRAINT "principal_notes_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."principal_observations" ADD CONSTRAINT "principal_observations_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."principal_profiles" ADD CONSTRAINT "principal_profiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."privacy_ledger_entries" ADD CONSTRAINT "privacy_ledger_entries_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."pro_gifts" ADD CONSTRAINT "pro_gifts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."profile_completion" ADD CONSTRAINT "profile_completion_pkey" PRIMARY KEY (user_id);
ALTER TABLE ONLY public."provinces" ADD CONSTRAINT "provinces_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."public_site_stats" ADD CONSTRAINT "public_site_stats_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."receipts" ADD CONSTRAINT "receipts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."relief_assignments" ADD CONSTRAINT "relief_assignments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."reminders" ADD CONSTRAINT "reminders_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."resource_engagements" ADD CONSTRAINT "resource_engagements_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."sanctuary_manifestos" ADD CONSTRAINT "sanctuary_manifestos_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."school_forest_state" ADD CONSTRAINT "school_forest_state_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."school_join_requests" ADD CONSTRAINT "school_join_requests_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."school_legacy_records" ADD CONSTRAINT "school_legacy_records_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."school_memberships" ADD CONSTRAINT "school_memberships_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claims_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."school_registry_legacy" ADD CONSTRAINT "school_registry_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "schools_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."sections" ADD CONSTRAINT "sections_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."security_audit_logs" ADD CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."sentinel_audit_logs" ADD CONSTRAINT "sentinel_audit_logs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."sleep_logs" ADD CONSTRAINT "sleep_logs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."snapshot_moments" ADD CONSTRAINT "snapshot_moments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."spatial_ref_sys" ADD CONSTRAINT "spatial_ref_sys_pkey" PRIMARY KEY (srid);
ALTER TABLE ONLY public."staff_attendance" ADD CONSTRAINT "staff_attendance_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."staff_leaves" ADD CONSTRAINT "staff_leaves_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."staging" ADD CONSTRAINT "staging_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_academic_records" ADD CONSTRAINT "student_academic_records_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_grades" ADD CONSTRAINT "student_grades_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_longitudinal_events" ADD CONSTRAINT "student_longitudinal_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_profiles" ADD CONSTRAINT "student_profiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."student_record_access_grants" ADD CONSTRAINT "student_record_access_grants_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."students" ADD CONSTRAINT "students_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."submissions" ADD CONSTRAINT "submissions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."subscriptions" ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."tags" ADD CONSTRAINT "tags_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."teacher_professional_records" ADD CONSTRAINT "teacher_professional_records_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."teacher_profiles" ADD CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."temporal_summaries" ADD CONSTRAINT "temporal_summaries_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."thuthimal_gifts" ADD CONSTRAINT "thuthimal_gifts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."timetable" ADD CONSTRAINT "timetable_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_blocks" ADD CONSTRAINT "user_blocks_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_entitlement_grants" ADD CONSTRAINT "user_entitlement_grants_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_growth_state" ADD CONSTRAINT "user_growth_state_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_growth_state_versions" ADD CONSTRAINT "user_growth_state_versions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_preferences" ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_profile_versions" ADD CONSTRAINT "user_profile_versions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_push_tokens" ADD CONSTRAINT "user_push_tokens_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_rewards" ADD CONSTRAINT "user_rewards_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_rewards_versions" ADD CONSTRAINT "user_rewards_versions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_social_links" ADD CONSTRAINT "user_social_links_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_social_state" ADD CONSTRAINT "user_social_state_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "user_workspace_layouts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."whispered_moments" ADD CONSTRAINT "whispered_moments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."wisdom_notes" ADD CONSTRAINT "wisdom_notes_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."academic_cycles" ADD CONSTRAINT "academic_cycles_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."accounts" ADD CONSTRAINT "accounts_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."ai_messages" ADD CONSTRAINT "ai_messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."assignments" ADD CONSTRAINT "assignments_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."assignments" ADD CONSTRAINT "assignments_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."attendance" ADD CONSTRAINT "attendance_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."attendance" ADD CONSTRAINT "attendance_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."audit_log" ADD CONSTRAINT "audit_log_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."audit_logs" ADD CONSTRAINT "audit_logs_executor_id_fkey" FOREIGN KEY (executor_id) REFERENCES users(id);
ALTER TABLE ONLY public."auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."bonds" ADD CONSTRAINT "bonds_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."budgets" ADD CONSTRAINT "budgets_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."calendar_events" ADD CONSTRAINT "calendar_events_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_grading_settings" ADD CONSTRAINT "classroom_grading_settings_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_join_requests" ADD CONSTRAINT "classroom_join_requests_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_join_requests" ADD CONSTRAINT "classroom_join_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_legacy_records" ADD CONSTRAINT "classroom_legacy_records_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_legacy_records" ADD CONSTRAINT "classroom_legacy_records_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."classroom_note_events" ADD CONSTRAINT "classroom_note_events_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_note_events" ADD CONSTRAINT "classroom_note_events_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_note_events" ADD CONSTRAINT "classroom_note_events_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."classroom_notes" ADD CONSTRAINT "classroom_notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_notes" ADD CONSTRAINT "classroom_notes_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_photos" ADD CONSTRAINT "classroom_photos_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_photos" ADD CONSTRAINT "classroom_photos_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_students" ADD CONSTRAINT "classroom_students_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classroom_students" ADD CONSTRAINT "classroom_students_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_grade_id_fkey" FOREIGN KEY (grade_id) REFERENCES grade_levels(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_section_id_fkey" FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."collection_node_events" ADD CONSTRAINT "collection_node_events_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."collection_node_events" ADD CONSTRAINT "collection_node_events_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."collection_node_events" ADD CONSTRAINT "collection_node_events_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."collection_nodes" ADD CONSTRAINT "collection_nodes_added_by_fkey" FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."collection_nodes" ADD CONSTRAINT "collection_nodes_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."collection_nodes" ADD CONSTRAINT "collection_nodes_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."collections" ADD CONSTRAINT "collections_original_collection_id_fkey" FOREIGN KEY (original_collection_id) REFERENCES collections(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."collections" ADD CONSTRAINT "collections_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."community_comments" ADD CONSTRAINT "community_comments_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."community_comments" ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_entity_versions" ADD CONSTRAINT "community_entity_versions_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."community_group_members" ADD CONSTRAINT "community_group_members_group_id_fkey" FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_group_members" ADD CONSTRAINT "community_group_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "community_groups_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "community_groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE ONLY public."community_poll_votes" ADD CONSTRAINT "community_poll_votes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_poll_votes" ADD CONSTRAINT "community_poll_votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_posts" ADD CONSTRAINT "community_posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_posts" ADD CONSTRAINT "community_posts_group_id_fkey" FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_profile_versions" ADD CONSTRAINT "community_profile_versions_community_id_fkey" FOREIGN KEY (community_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_profile_versions" ADD CONSTRAINT "community_profile_versions_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."community_profile_versions" ADD CONSTRAINT "community_profile_versions_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."community_reactions" ADD CONSTRAINT "community_reactions_post_id_fkey" FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_reactions" ADD CONSTRAINT "community_reactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_reports" ADD CONSTRAINT "community_reports_assigned_handler_id_fkey" FOREIGN KEY (assigned_handler_id) REFERENCES users(id);
ALTER TABLE ONLY public."community_reports" ADD CONSTRAINT "community_reports_group_id_fkey" FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."community_reports" ADD CONSTRAINT "community_reports_post_id_fkey" FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."community_reports" ADD CONSTRAINT "community_reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."community_reports" ADD CONSTRAINT "community_reports_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."contextual_challenges" ADD CONSTRAINT "contextual_challenges_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id);
ALTER TABLE ONLY public."contextual_challenges" ADD CONSTRAINT "contextual_challenges_creator_user_id_fkey" FOREIGN KEY (creator_user_id) REFERENCES users(id);
ALTER TABLE ONLY public."contextual_moments" ADD CONSTRAINT "contextual_moments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."conversation_settings" ADD CONSTRAINT "conversation_settings_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES direct_conversations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."conversation_settings" ADD CONSTRAINT "conversation_settings_group_id_fkey" FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."conversation_settings" ADD CONSTRAINT "conversation_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."daily_prep_items" ADD CONSTRAINT "daily_prep_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."device_accounts" ADD CONSTRAINT "device_accounts_account_id_fkey" FOREIGN KEY (account_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."device_accounts" ADD CONSTRAINT "device_accounts_device_id_fkey" FOREIGN KEY (device_id) REFERENCES device_registry(device_id) ON DELETE CASCADE;
ALTER TABLE ONLY public."device_registry" ADD CONSTRAINT "device_registry_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."direct_conversations" ADD CONSTRAINT "direct_conversations_user1_id_fkey" FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."direct_conversations" ADD CONSTRAINT "direct_conversations_user2_id_fkey" FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."direct_messages" ADD CONSTRAINT "direct_messages_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."direct_messages" ADD CONSTRAINT "direct_messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES direct_conversations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."districts" ADD CONSTRAINT "districts_province_name_fkey" FOREIGN KEY (province_name) REFERENCES provinces(name);
ALTER TABLE ONLY public."edges" ADD CONSTRAINT "edges_from_node_id_fkey" FOREIGN KEY (from_node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edges" ADD CONSTRAINT "edges_source_node_id_fkey" FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edges" ADD CONSTRAINT "edges_target_node_id_fkey" FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edges" ADD CONSTRAINT "edges_to_node_id_fkey" FOREIGN KEY (to_node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edu_school_climate" ADD CONSTRAINT "edu_school_climate_edu_school_id_fkey" FOREIGN KEY (edu_school_id) REFERENCES edu_schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edu_school_contacts" ADD CONSTRAINT "edu_school_contacts_school_id_fkey" FOREIGN KEY (school_id) REFERENCES edu_schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edu_school_pulse_logs" ADD CONSTRAINT "edu_school_pulse_logs_edu_school_id_fkey" FOREIGN KEY (edu_school_id) REFERENCES edu_schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edu_school_registry_stats" ADD CONSTRAINT "edu_school_registry_stats_school_id_fkey" FOREIGN KEY (school_id) REFERENCES edu_schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."edu_schools" ADD CONSTRAINT "edu_schools_district_id_fkey" FOREIGN KEY (district_id) REFERENCES geo_districts(id);
ALTER TABLE ONLY public."edu_schools" ADD CONSTRAINT "edu_schools_gn_division_id_fkey" FOREIGN KEY (gn_division_id) REFERENCES geo_gn_divisions(id);
ALTER TABLE ONLY public."edu_schools" ADD CONSTRAINT "edu_schools_postal_unit_id_fkey" FOREIGN KEY (postal_unit_id) REFERENCES geo_postal_towns(id);
ALTER TABLE ONLY public."edu_schools" ADD CONSTRAINT "edu_schools_province_id_fkey" FOREIGN KEY (province_id) REFERENCES geo_provinces(id);
ALTER TABLE ONLY public."energy_forecasts" ADD CONSTRAINT "energy_forecasts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."feature_usage_log" ADD CONSTRAINT "feature_usage_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."fire_journal" ADD CONSTRAINT "fire_journal_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."form_responses" ADD CONSTRAINT "form_responses_responder_id_fkey" FOREIGN KEY (responder_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."form_responses" ADD CONSTRAINT "form_responses_template_id_fkey" FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."form_templates" ADD CONSTRAINT "form_templates_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."geo_districts" ADD CONSTRAINT "geo_districts_province_id_fkey" FOREIGN KEY (province_id) REFERENCES geo_provinces(id);
ALTER TABLE ONLY public."geo_ds_divisions" ADD CONSTRAINT "geo_ds_divisions_district_id_fkey" FOREIGN KEY (district_id) REFERENCES geo_districts(id);
ALTER TABLE ONLY public."geo_features" ADD CONSTRAINT "geo_features_dataset_id_fkey" FOREIGN KEY (dataset_id) REFERENCES geo_datasets(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."geo_gn_divisions" ADD CONSTRAINT "geo_gn_divisions_district_id_fkey" FOREIGN KEY (district_id) REFERENCES geo_districts(id);
ALTER TABLE ONLY public."geo_gn_divisions" ADD CONSTRAINT "geo_gn_divisions_ds_division_id_fkey" FOREIGN KEY (ds_division_id) REFERENCES geo_ds_divisions(id);
ALTER TABLE ONLY public."geo_postal_towns" ADD CONSTRAINT "geo_postal_towns_district_id_fkey" FOREIGN KEY (district_id) REFERENCES geo_districts(id);
ALTER TABLE ONLY public."gift_codes" ADD CONSTRAINT "gift_codes_redeemed_by_fkey" FOREIGN KEY (redeemed_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."grade_levels" ADD CONSTRAINT "grades_head_fkey" FOREIGN KEY (grade_head_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."grade_levels" ADD CONSTRAINT "grades_section_id_fkey" FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."gratitude_entries" ADD CONSTRAINT "gratitude_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."gratitude_gifts" ADD CONSTRAINT "gratitude_gifts_recipient_user_id_fkey" FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."gratitude_gifts" ADD CONSTRAINT "gratitude_gifts_sender_user_id_fkey" FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."group_messages" ADD CONSTRAINT "group_messages_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."group_messages" ADD CONSTRAINT "group_messages_group_id_fkey" FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."group_reports" ADD CONSTRAINT "group_reports_group_id_fkey" FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."group_reports" ADD CONSTRAINT "group_reports_post_id_fkey" FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."group_reports" ADD CONSTRAINT "group_reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."group_reports" ADD CONSTRAINT "group_reports_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."growth_events" ADD CONSTRAINT "growth_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."impact_ripples" ADD CONSTRAINT "impact_ripples_actor_user_id_fkey" FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."impact_ripples" ADD CONSTRAINT "impact_ripples_recipient_user_id_fkey" FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."institutional_calendar" ADD CONSTRAINT "institutional_calendar_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."inventory_items" ADD CONSTRAINT "inventory_items_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."inventory_items" ADD CONSTRAINT "inventory_items_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."inventory_requests" ADD CONSTRAINT "inventory_requests_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."inventory_requests" ADD CONSTRAINT "inventory_requests_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id);
ALTER TABLE ONLY public."invite_codes" ADD CONSTRAINT "invite_codes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE ONLY public."invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."journal_entries" ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."journeys" ADD CONSTRAINT "journeys_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."journeys" ADD CONSTRAINT "journeys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."joy_moments" ADD CONSTRAINT "joy_moments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."ledger_entries" ADD CONSTRAINT "ledger_entries_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES financial_transactions(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."lesson_materials" ADD CONSTRAINT "lesson_materials_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."lesson_materials" ADD CONSTRAINT "lesson_materials_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."lessons" ADD CONSTRAINT "lessons_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."library_entity_versions" ADD CONSTRAINT "library_entity_versions_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."nodes" ADD CONSTRAINT "library_items_uploader_id_fkey" FOREIGN KEY (creator_id) REFERENCES users(id);
ALTER TABLE ONLY public."nodes" ADD CONSTRAINT "library_resources_parent_node_id_fkey" FOREIGN KEY (parent_node_id) REFERENCES nodes(id);
ALTER TABLE ONLY public."nodes" ADD CONSTRAINT "library_resources_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."manifesto_endorsements" ADD CONSTRAINT "manifesto_endorsements_manifesto_id_fkey" FOREIGN KEY (manifesto_id) REFERENCES sanctuary_manifestos(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."manifesto_endorsements" ADD CONSTRAINT "manifesto_endorsements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."mapping_topologies" ADD CONSTRAINT "mapping_topologies_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."mood_logs" ADD CONSTRAINT "mood_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."node_tags" ADD CONSTRAINT "node_tags_node_id_fkey" FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."node_tags" ADD CONSTRAINT "node_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."package_alternatives" ADD CONSTRAINT "package_alternatives_alternative_name_fkey" FOREIGN KEY (alternative_name) REFERENCES packages(package_name) ON DELETE CASCADE;
ALTER TABLE ONLY public."package_alternatives" ADD CONSTRAINT "package_alternatives_package_name_fkey" FOREIGN KEY (package_name) REFERENCES packages(package_name) ON DELETE CASCADE;
ALTER TABLE ONLY public."package_companions" ADD CONSTRAINT "package_companions_companion_name_fkey" FOREIGN KEY (companion_name) REFERENCES packages(package_name) ON DELETE CASCADE;
ALTER TABLE ONLY public."package_companions" ADD CONSTRAINT "package_companions_package_name_fkey" FOREIGN KEY (package_name) REFERENCES packages(package_name) ON DELETE CASCADE;
ALTER TABLE ONLY public."package_conflicts" ADD CONSTRAINT "package_conflicts_package_a_fkey" FOREIGN KEY (package_a) REFERENCES packages(package_name) ON DELETE CASCADE;
ALTER TABLE ONLY public."package_conflicts" ADD CONSTRAINT "package_conflicts_package_b_fkey" FOREIGN KEY (package_b) REFERENCES packages(package_name) ON DELETE CASCADE;
ALTER TABLE ONLY public."permission_snapshots" ADD CONSTRAINT "permission_snapshots_active_bond_id_fkey" FOREIGN KEY (active_bond_id) REFERENCES bonds(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."permission_snapshots" ADD CONSTRAINT "permission_snapshots_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."personal_classrooms" ADD CONSTRAINT "personal_classrooms_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."personal_compasses" ADD CONSTRAINT "personal_compasses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."principal_governance_events" ADD CONSTRAINT "principal_governance_events_principal_id_fkey" FOREIGN KEY (principal_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."principal_governance_events" ADD CONSTRAINT "principal_governance_events_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."principal_governance_events" ADD CONSTRAINT "principal_governance_events_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."principal_governance_records" ADD CONSTRAINT "principal_governance_records_principal_id_fkey" FOREIGN KEY (principal_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."principal_governance_records" ADD CONSTRAINT "principal_governance_records_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."principal_notes" ADD CONSTRAINT "principal_notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."principal_notes" ADD CONSTRAINT "principal_notes_context_classroom_id_fkey" FOREIGN KEY (context_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."principal_notes" ADD CONSTRAINT "principal_notes_context_teacher_id_fkey" FOREIGN KEY (context_teacher_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."principal_observations" ADD CONSTRAINT "principal_observations_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id);
ALTER TABLE ONLY public."principal_observations" ADD CONSTRAINT "principal_observations_principal_id_fkey" FOREIGN KEY (principal_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."principal_observations" ADD CONSTRAINT "principal_observations_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id);
ALTER TABLE ONLY public."principal_profiles" ADD CONSTRAINT "principal_profiles_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public."principal_profiles" ADD CONSTRAINT "principal_profiles_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."principal_profiles" ADD CONSTRAINT "principal_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."privacy_ledger_entries" ADD CONSTRAINT "privacy_ledger_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."pro_gifts" ADD CONSTRAINT "pro_gifts_gifter_id_fkey" FOREIGN KEY (gifter_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."pro_gifts" ADD CONSTRAINT "pro_gifts_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."profile_completion" ADD CONSTRAINT "profile_completion_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."receipts" ADD CONSTRAINT "receipts_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."relief_assignments" ADD CONSTRAINT "relief_assignments_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."relief_assignments" ADD CONSTRAINT "relief_assignments_original_teacher_id_fkey" FOREIGN KEY (original_teacher_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."relief_assignments" ADD CONSTRAINT "relief_assignments_relief_teacher_id_fkey" FOREIGN KEY (relief_teacher_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."relief_assignments" ADD CONSTRAINT "relief_assignments_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."collections" ADD CONSTRAINT "resource_collections_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."resource_engagements" ADD CONSTRAINT "resource_engagements_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."resource_engagements" ADD CONSTRAINT "resource_engagements_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES nodes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."resource_engagements" ADD CONSTRAINT "resource_engagements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."sanctuary_manifestos" ADD CONSTRAINT "sanctuary_manifestos_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."school_forest_state" ADD CONSTRAINT "school_forest_state_teacher_user_id_fkey" FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."school_join_requests" ADD CONSTRAINT "school_join_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."school_legacy_records" ADD CONSTRAINT "school_legacy_records_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."school_memberships" ADD CONSTRAINT "school_memberships_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public."school_memberships" ADD CONSTRAINT "school_memberships_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."school_memberships" ADD CONSTRAINT "school_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claims_edu_school_id_fkey" FOREIGN KEY (edu_school_id) REFERENCES edu_schools(id);
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claims_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES users(id);
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claims_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES users(id);
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claims_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "schools_census_id_fkey" FOREIGN KEY (census_id) REFERENCES edu_schools(id);
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "schools_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public."sections" ADD CONSTRAINT "sections_head_fkey" FOREIGN KEY (section_head_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."security_audit_logs" ADD CONSTRAINT "security_audit_logs_account_id_fkey" FOREIGN KEY (account_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."security_audit_logs" ADD CONSTRAINT "security_audit_logs_device_id_fkey" FOREIGN KEY (device_id) REFERENCES device_registry(device_id) ON DELETE SET NULL;
ALTER TABLE ONLY public."sentinel_audit_logs" ADD CONSTRAINT "sentinel_audit_logs_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."sleep_logs" ADD CONSTRAINT "sleep_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."snapshot_moments" ADD CONSTRAINT "snapshot_moments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."staff_attendance" ADD CONSTRAINT "staff_attendance_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."staff_leaves" ADD CONSTRAINT "staff_leaves_approved_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES users(id);
ALTER TABLE ONLY public."staff_leaves" ADD CONSTRAINT "staff_leaves_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."staff_leaves" ADD CONSTRAINT "staff_leaves_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_academic_records" ADD CONSTRAINT "student_academic_records_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_academic_records" ADD CONSTRAINT "student_academic_records_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_academic_records" ADD CONSTRAINT "student_academic_records_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_grades" ADD CONSTRAINT "student_grades_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_grades" ADD CONSTRAINT "student_grades_graded_by_fkey" FOREIGN KEY (graded_by) REFERENCES users(id);
ALTER TABLE ONLY public."student_grades" ADD CONSTRAINT "student_grades_published_by_fkey" FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_grades" ADD CONSTRAINT "student_grades_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_guardian_id_fkey" FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_longitudinal_events" ADD CONSTRAINT "student_longitudinal_events_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_longitudinal_events" ADD CONSTRAINT "student_longitudinal_events_grade_id_fkey" FOREIGN KEY (grade_id) REFERENCES grade_levels(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_longitudinal_events" ADD CONSTRAINT "student_longitudinal_events_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_longitudinal_events" ADD CONSTRAINT "student_longitudinal_events_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_classroom_student_id_fkey" FOREIGN KEY (classroom_student_id) REFERENCES classroom_students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_profiles" ADD CONSTRAINT "student_profiles_active_classroom_id_fkey" FOREIGN KEY (active_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_profiles" ADD CONSTRAINT "student_profiles_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public."student_profiles" ADD CONSTRAINT "student_profiles_guardian_id_fkey" FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_profiles" ADD CONSTRAINT "student_profiles_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_record_access_grants" ADD CONSTRAINT "student_record_access_grants_grantee_school_id_fkey" FOREIGN KEY (grantee_school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_record_access_grants" ADD CONSTRAINT "student_record_access_grants_granter_id_fkey" FOREIGN KEY (granter_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."student_record_access_grants" ADD CONSTRAINT "student_record_access_grants_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."students" ADD CONSTRAINT "students_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."submissions" ADD CONSTRAINT "submissions_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."submissions" ADD CONSTRAINT "submissions_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_student_id_fkey" FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."teacher_professional_records" ADD CONSTRAINT "teacher_professional_records_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."teacher_professional_records" ADD CONSTRAINT "teacher_professional_records_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."teacher_profiles" ADD CONSTRAINT "teacher_profiles_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public."teacher_profiles" ADD CONSTRAINT "teacher_profiles_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."teacher_profiles" ADD CONSTRAINT "teacher_profiles_section_id_fkey" FOREIGN KEY (section_id) REFERENCES sections(id);
ALTER TABLE ONLY public."teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."temporal_summaries" ADD CONSTRAINT "temporal_summaries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."thuthimal_gifts" ADD CONSTRAINT "thuthimal_gifts_gifter_id_fkey" FOREIGN KEY (gifter_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."thuthimal_gifts" ADD CONSTRAINT "thuthimal_gifts_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."timetable" ADD CONSTRAINT "timetable_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_entitlement_grants" ADD CONSTRAINT "user_entitlement_grants_bond_id_fkey" FOREIGN KEY (bond_id) REFERENCES bonds(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_entitlement_grants" ADD CONSTRAINT "user_entitlement_grants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_growth_state" ADD CONSTRAINT "user_growth_state_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_growth_state_versions" ADD CONSTRAINT "user_growth_state_versions_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."user_growth_state_versions" ADD CONSTRAINT "user_growth_state_versions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_profile_versions" ADD CONSTRAINT "user_profile_versions_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."user_profile_versions" ADD CONSTRAINT "user_profile_versions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_push_tokens" ADD CONSTRAINT "user_push_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_rewards" ADD CONSTRAINT "user_rewards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_rewards_versions" ADD CONSTRAINT "user_rewards_versions_recorded_by_fkey" FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."user_rewards_versions" ADD CONSTRAINT "user_rewards_versions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_social_links" ADD CONSTRAINT "user_social_links_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_social_state" ADD CONSTRAINT "user_social_state_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "user_workspace_layouts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE ONLY public."whispered_moments" ADD CONSTRAINT "whispered_moments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."wisdom_notes" ADD CONSTRAINT "wisdom_notes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."attendance" ADD CONSTRAINT "attendance_status_check" CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text, 'excused'::text])));
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "chk_user_workspace_layout_hidden_array" CHECK ((jsonb_typeof(hidden_json) = 'array'::text));
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "chk_user_workspace_layout_order_array" CHECK ((jsonb_typeof(order_json) = 'array'::text));
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "chk_user_workspace_layout_pinned_array" CHECK ((jsonb_typeof(pinned_json) = 'array'::text));
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "chk_user_workspace_layout_target" CHECK ((layout_target = ANY (ARRAY['shared'::text, 'web'::text, 'mobile'::text])));
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "chk_user_workspace_layout_zone_object" CHECK ((jsonb_typeof(zone_by_surface_jsonb) = 'object'::text));
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classroom_handle_format_check" CHECK ((handle ~* '^[a-z0-9_-]{3,30}$'::text));
ALTER TABLE ONLY public."classroom_join_requests" ADD CONSTRAINT "classroom_join_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));
ALTER TABLE ONLY public."classroom_note_events" ADD CONSTRAINT "classroom_note_events_event_type_check" CHECK ((event_type = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."classroom_note_events" ADD CONSTRAINT "classroom_note_events_note_type_check" CHECK ((note_type = ANY (ARRAY['note'::text, 'announcement'::text, 'lesson_recap'::text, 'reminder'::text, 'personal'::text])));
ALTER TABLE ONLY public."classroom_note_events" ADD CONSTRAINT "classroom_note_events_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'class'::text])));
ALTER TABLE ONLY public."classroom_notes" ADD CONSTRAINT "classroom_notes_note_type_check" CHECK ((note_type = ANY (ARRAY['note'::text, 'announcement'::text, 'lesson_recap'::text, 'reminder'::text, 'personal'::text])));
ALTER TABLE ONLY public."classroom_notes" ADD CONSTRAINT "classroom_notes_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'class'::text])));
ALTER TABLE ONLY public."classrooms" ADD CONSTRAINT "classrooms_handle_format" CHECK (((handle IS NULL) OR (handle ~* '^[a-z0-9_-]{3,30}$'::text)));
ALTER TABLE ONLY public."collection_node_events" ADD CONSTRAINT "collection_node_events_event_type_check" CHECK ((event_type = ANY (ARRAY['added'::text, 'removed'::text, 'reordered'::text])));
ALTER TABLE ONLY public."collections" ADD CONSTRAINT "collections_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'class'::text, 'grade'::text, 'school'::text, 'public'::text])));
ALTER TABLE ONLY public."community_entity_versions" ADD CONSTRAINT "community_entity_versions_entity_type_check" CHECK ((entity_type = ANY (ARRAY['community_post'::text, 'community_comment'::text, 'group_message'::text, 'direct_message'::text])));
ALTER TABLE ONLY public."community_entity_versions" ADD CONSTRAINT "community_entity_versions_event_type_check" CHECK ((event_type = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."community_group_members" ADD CONSTRAINT "community_group_members_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'rejected'::text])));
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "community_groups_group_type_check" CHECK ((group_type = ANY (ARRAY['class'::text, 'interest'::text, 'staff'::text, 'public'::text, 'general'::text, 'club'::text, 'subject'::text])));
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "community_groups_handle_format" CHECK (((handle IS NULL) OR (handle ~* '^[a-z0-9_-]{3,30}$'::text)));
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "community_groups_join_policy_check" CHECK ((join_policy = ANY (ARRAY['open'::text, 'approval_required'::text, 'invite_only'::text])));
ALTER TABLE ONLY public."community_posts" ADD CONSTRAINT "community_posts_media_type_check" CHECK ((media_type = ANY (ARRAY['image'::text, 'video'::text, 'audio'::text, 'document'::text])));
ALTER TABLE ONLY public."community_profile_versions" ADD CONSTRAINT "community_profile_versions_operation_check" CHECK ((operation = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."community_reports" ADD CONSTRAINT "community_reports_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'dismissed'::text])));
ALTER TABLE ONLY public."contextual_challenges" ADD CONSTRAINT "contextual_challenges_metric_check" CHECK ((metric = ANY (ARRAY['library_resources_opened'::text, 'joy_jar_entries'::text, 'assignments_submitted'::text, 'community_posts'::text, 'reflections_written'::text, 'lessons_completed'::text, 'attendance_recorded'::text, 'feedback_given'::text])));
ALTER TABLE ONLY public."contextual_challenges" ADD CONSTRAINT "contextual_challenges_nature_metaphor_check" CHECK ((nature_metaphor = ANY (ARRAY['river_rising'::text, 'forest_brightening'::text, 'lotus_opening'::text, 'crystal_growing'::text])));
ALTER TABLE ONLY public."contextual_challenges" ADD CONSTRAINT "contextual_challenges_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'expired'::text, 'draft'::text])));
ALTER TABLE ONLY public."contextual_challenges" ADD CONSTRAINT "contextual_challenges_type_check" CHECK ((type = ANY (ARRAY['class_collective_pulse'::text, 'school_season_challenge'::text])));
ALTER TABLE ONLY public."daily_content" ADD CONSTRAINT "daily_content_type_check" CHECK ((type = ANY (ARRAY['motivation'::text, 'did_you_know'::text])));
ALTER TABLE ONLY public."direct_conversations" ADD CONSTRAINT "different_users" CHECK ((user1_id <> user2_id));
ALTER TABLE ONLY public."energy_forecasts" ADD CONSTRAINT "energy_forecasts_energy_level_check" CHECK (((energy_level >= 1) AND (energy_level <= 5)));
ALTER TABLE ONLY public."geo_datasets" ADD CONSTRAINT "geo_datasets_category_check" CHECK ((category = ANY (ARRAY['socioeconomic'::text, 'education'::text, 'health'::text, 'infrastructure'::text, 'demographics'::text])));
ALTER TABLE ONLY public."grade_levels" ADD CONSTRAINT "grades_grade_number_check" CHECK (((grade_number >= 1) AND (grade_number <= 13)));
ALTER TABLE ONLY public."gratitude_gifts" ADD CONSTRAINT "gratitude_gifts_gift_type_check" CHECK ((gift_type = ANY (ARRAY['lantern'::text, 'rain'::text, 'sunlight'::text, 'seed'::text])));
ALTER TABLE ONLY public."community_groups" ADD CONSTRAINT "group_handle_format_check" CHECK ((handle ~* '^[a-z0-9_-]{3,30}$'::text));
ALTER TABLE ONLY public."group_reports" ADD CONSTRAINT "group_reports_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text])));
ALTER TABLE ONLY public."institutional_calendar" ADD CONSTRAINT "institutional_calendar_type_check" CHECK ((type = ANY (ARRAY['term_start'::text, 'term_end'::text, 'exam'::text, 'holiday'::text, 'sports'::text, 'event'::text, 'other'::text])));
ALTER TABLE ONLY public."inventory_requests" ADD CONSTRAINT "inventory_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'delivered'::text, 'rejected'::text])));
ALTER TABLE ONLY public."invite_codes" ADD CONSTRAINT "invite_codes_role_check" CHECK ((role = ANY (ARRAY['teacher'::text, 'student'::text, 'principal'::text, 'grade_head'::text, 'section_head'::text, 'assistant_principal'::text])));
ALTER TABLE ONLY public."journeys" ADD CONSTRAINT "journeys_status_check" CHECK ((status = ANY (ARRAY['unlocked'::text, 'in_progress'::text, 'completed'::text, 'mastered'::text])));
ALTER TABLE ONLY public."ledger_entries" ADD CONSTRAINT "ledger_entries_side_check" CHECK ((side = ANY (ARRAY['debit'::text, 'credit'::text])));
ALTER TABLE ONLY public."lesson_materials" ADD CONSTRAINT "lesson_materials_type_check" CHECK ((type = ANY (ARRAY['pdf'::text, 'link'::text, 'note'::text])));
ALTER TABLE ONLY public."library_entity_versions" ADD CONSTRAINT "library_entity_versions_entity_type_check" CHECK ((entity_type = ANY (ARRAY['node'::text, 'collection'::text])));
ALTER TABLE ONLY public."library_entity_versions" ADD CONSTRAINT "library_entity_versions_event_type_check" CHECK ((event_type = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."nodes" ADD CONSTRAINT "library_resources_link_status_check" CHECK ((link_status = ANY (ARRAY['working'::text, 'broken'::text, 'unknown'::text])));
ALTER TABLE ONLY public."nodes" ADD CONSTRAINT "library_resources_type_check" CHECK ((type = ANY (ARRAY['pdf'::text, 'video'::text, 'link'::text, 'text'::text, 'doc'::text, 'lesson'::text, 'worksheet'::text, 'guide'::text, 'reading'::text, 'pedagogy'::text, 'map'::text, 'infographic'::text, 'story'::text, 'circular'::text, 'movie_trailer'::text, 'tech_guide'::text, 'other'::text])));
ALTER TABLE ONLY public."mood_logs" ADD CONSTRAINT "mood_logs_mood_score_check" CHECK (((mood_score >= 1) AND (mood_score <= 5)));
ALTER TABLE ONLY public."user_blocks" ADD CONSTRAINT "no_self_block" CHECK ((blocker_id <> blocked_id));
ALTER TABLE ONLY public."conversation_settings" ADD CONSTRAINT "one_target" CHECK ((((conversation_id IS NOT NULL) AND (group_id IS NULL)) OR ((conversation_id IS NULL) AND (group_id IS NOT NULL))));
ALTER TABLE ONLY public."permission_snapshots" ADD CONSTRAINT "permission_snapshots_expiry_check" CHECK ((expires_at > generated_at));
ALTER TABLE ONLY public."personal_classrooms" ADD CONSTRAINT "personal_classrooms_type_check" CHECK ((type = ANY (ARRAY['teacher_classroom'::text, 'student_classroom'::text, 'unrelated_classroom'::text, 'undefined'::text])));
ALTER TABLE ONLY public."personal_compasses" ADD CONSTRAINT "personal_compasses_metric_check" CHECK ((metric = ANY (ARRAY['library_resources_opened'::text, 'joy_jar_entries'::text, 'assignments_submitted'::text, 'community_posts'::text, 'reflections_written'::text, 'lessons_completed'::text, 'attendance_recorded'::text, 'feedback_given'::text])));
ALTER TABLE ONLY public."personal_compasses" ADD CONSTRAINT "personal_compasses_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'expired'::text])));
ALTER TABLE ONLY public."pricing_manifest" ADD CONSTRAINT "pricing_manifest_tier_check" CHECK ((tier = ANY (ARRAY['FREE'::text, 'PRO'::text, 'INSTITUTIONAL'::text])));
ALTER TABLE ONLY public."principal_governance_events" ADD CONSTRAINT "principal_governance_events_entity_type_check" CHECK ((entity_type = ANY (ARRAY['principal_observation'::text, 'school_invite'::text])));
ALTER TABLE ONLY public."principal_governance_events" ADD CONSTRAINT "principal_governance_events_event_type_check" CHECK ((event_type = ANY (ARRAY['create'::text, 'read'::text, 'use'::text, 'expire'::text, 'revoke'::text, 'follow_up'::text, 'approve'::text])));
ALTER TABLE ONLY public."principal_notes" ADD CONSTRAINT "principal_notes_note_type_check" CHECK ((note_type = ANY (ARRAY['todo'::text, 'observation'::text, 'decision'::text, 'reminder'::text, 'note'::text])));
ALTER TABLE ONLY public."principal_observations" ADD CONSTRAINT "principal_observations_type_check" CHECK ((type = ANY (ARRAY['walkthrough'::text, 'note'::text, 'concern'::text, 'praise'::text])));
ALTER TABLE ONLY public."public_site_stats" ADD CONSTRAINT "public_site_stats_singleton" CHECK ((id = 1));
ALTER TABLE ONLY public."school_forest_state" ADD CONSTRAINT "school_forest_state_tree_health_check" CHECK ((tree_health = ANY (ARRAY['seedling'::text, 'growing'::text, 'flourishing'::text, 'flowering'::text, 'ancient'::text])));
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "school_handle_format_check" CHECK ((handle ~* '^[a-z0-9_-]{3,30}$'::text));
ALTER TABLE ONLY public."school_join_requests" ADD CONSTRAINT "school_join_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));
ALTER TABLE ONLY public."school_registry_claims" ADD CONSTRAINT "school_registry_claim_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'withdrawn'::text])));
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "schools_handle_format" CHECK (((handle IS NULL) OR (handle ~* '^[a-z0-9_-]{3,30}$'::text)));
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "schools_name_check" CHECK ((char_length(TRIM(BOTH FROM name)) > 0));
ALTER TABLE ONLY public."schools" ADD CONSTRAINT "schools_tenant_kind_check" CHECK ((tenant_kind = ANY (ARRAY['internal'::text, 'customer'::text, 'demo'::text, 'sandbox'::text])));
ALTER TABLE ONLY public."spatial_ref_sys" ADD CONSTRAINT "spatial_ref_sys_srid_check" CHECK (((srid > 0) AND (srid <= 998999)));
ALTER TABLE ONLY public."staging" ADD CONSTRAINT "staging_status_check" CHECK ((status = ANY (ARRAY['pending_review'::text, 'approved'::text, 'rejected'::text])));
ALTER TABLE ONLY public."student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_relationship_type_check" CHECK ((relationship_type = ANY (ARRAY['parent'::text, 'legal_guardian'::text, 'other'::text])));
ALTER TABLE ONLY public."student_longitudinal_events" ADD CONSTRAINT "student_longitudinal_events_entity_type_check" CHECK ((entity_type = ANY (ARRAY['enrollment'::text, 'attendance'::text, 'grade'::text, 'guardian_relationship'::text, 'observation'::text, 'submission'::text, 'study_note'::text])));
ALTER TABLE ONLY public."student_longitudinal_events" ADD CONSTRAINT "student_longitudinal_events_operation_check" CHECK ((operation = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_observation_type_check" CHECK ((observation_type = ANY (ARRAY['positive'::text, 'growth'::text, 'neutral'::text, 'concern'::text])));
ALTER TABLE ONLY public."student_observations" ADD CONSTRAINT "student_observations_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'student_visible'::text, 'handover_visible'::text])));
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_cognitive_flow_check" CHECK (((cognitive_flow >= 0) AND (cognitive_flow <= 100)));
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_creative_spark_check" CHECK (((creative_spark >= 0) AND (creative_spark <= 100)));
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_emotional_resonance_check" CHECK (((emotional_resonance >= 0) AND (emotional_resonance <= 100)));
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_practical_mastery_check" CHECK (((practical_mastery >= 0) AND (practical_mastery <= 100)));
ALTER TABLE ONLY public."student_potential_analysis" ADD CONSTRAINT "student_potential_analysis_social_weaving_check" CHECK (((social_weaving >= 0) AND (social_weaving <= 100)));
ALTER TABLE ONLY public."student_record_access_grants" ADD CONSTRAINT "student_record_access_grants_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'granted'::text, 'revoked'::text, 'expired'::text])));
ALTER TABLE ONLY public."subscriptions" ADD CONSTRAINT "subscription_target" CHECK ((((user_id IS NOT NULL) AND (school_id IS NULL)) OR ((user_id IS NULL) AND (school_id IS NOT NULL))));
ALTER TABLE ONLY public."subscriptions" ADD CONSTRAINT "subscriptions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'trial'::text])));
ALTER TABLE ONLY public."subscriptions" ADD CONSTRAINT "subscriptions_tier_check" CHECK ((tier = ANY (ARRAY['free'::text, 'pro'::text, 'premium'::text])));
ALTER TABLE ONLY public."teacher_profiles" ADD CONSTRAINT "teacher_exp_check" CHECK ((experience_years >= 0));
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_event_type_check" CHECK ((event_type = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text, 'finalize'::text, 'share'::text, 'revoke_share'::text, 'promote'::text])));
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_insight_type_check" CHECK ((insight_type = ANY (ARRAY['teacher_note'::text, 'student_observation'::text, 'student_potential'::text])));
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_share_state_check" CHECK ((share_state = ANY (ARRAY['private'::text, 'shared_selected'::text, 'shared_role'::text, 'official'::text])));
ALTER TABLE ONLY public."teacher_insight_events" ADD CONSTRAINT "teacher_insight_events_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'student_visible'::text, 'handover_visible'::text])));
ALTER TABLE ONLY public."temporal_summaries" ADD CONSTRAINT "temporal_summaries_scale_check" CHECK ((scale = ANY (ARRAY['day'::text, 'week'::text, 'month'::text, 'year'::text])));
ALTER TABLE ONLY public."thuthimal_gifts" ADD CONSTRAINT "thuthimal_gifts_recipient_role_check" CHECK ((recipient_role = ANY (ARRAY['teacher'::text, 'principal'::text])));
ALTER TABLE ONLY public."timetable" ADD CONSTRAINT "timetable_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6)));
ALTER TABLE ONLY public."timetable" ADD CONSTRAINT "timetable_type_check" CHECK ((type = ANY (ARRAY['subject'::text, 'relief'::text, 'interval'::text])));
ALTER TABLE ONLY public."user_entitlement_grants" ADD CONSTRAINT "user_entitlement_grants_scope_check" CHECK ((((scope_type = 'INDIVIDUAL'::text) AND (bond_id IS NULL) AND (entity_id IS NULL)) OR ((scope_type = 'BOND'::text) AND (bond_id IS NOT NULL)) OR ((scope_type = 'ENTITY'::text) AND (entity_id IS NOT NULL) AND (entity_type IS NOT NULL)) OR (scope_type = 'ADD_ON'::text)));
ALTER TABLE ONLY public."user_entitlement_grants" ADD CONSTRAINT "user_entitlement_grants_scope_type_check" CHECK ((scope_type = ANY (ARRAY['INDIVIDUAL'::text, 'BOND'::text, 'ENTITY'::text, 'ADD_ON'::text])));
ALTER TABLE ONLY public."user_entitlement_grants" ADD CONSTRAINT "user_entitlement_grants_status_check" CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'SUSPENDED'::text, 'REVOKED'::text])));
ALTER TABLE ONLY public."user_entitlement_grants" ADD CONSTRAINT "user_entitlement_grants_tier_check" CHECK ((tier = ANY (ARRAY['FREE'::text, 'PRO'::text, 'INSTITUTIONAL'::text])));
ALTER TABLE ONLY public."user_growth_state" ADD CONSTRAINT "user_growth_state_banyan_stage_check" CHECK ((banyan_stage = ANY (ARRAY['sapling'::text, 'roots_spreading'::text, 'canopy'::text, 'shade_giver'::text, 'forest_maker'::text])));
ALTER TABLE ONLY public."user_growth_state" ADD CONSTRAINT "user_growth_state_crystal_tier_check" CHECK ((crystal_tier = ANY (ARRAY['spark'::text, 'cluster'::text, 'cave'::text, 'fractal'::text])));
ALTER TABLE ONLY public."user_growth_state" ADD CONSTRAINT "user_growth_state_river_stage_check" CHECK ((river_stage = ANY (ARRAY['trickle'::text, 'stream'::text, 'river'::text, 'delta'::text])));
ALTER TABLE ONLY public."user_growth_state_versions" ADD CONSTRAINT "user_growth_state_versions_operation_check" CHECK ((operation = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."user_profile_versions" ADD CONSTRAINT "user_profile_versions_operation_check" CHECK ((operation = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."user_rewards_versions" ADD CONSTRAINT "user_rewards_versions_operation_check" CHECK ((operation = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])));
ALTER TABLE ONLY public."user_workspace_layouts" ADD CONSTRAINT "user_workspace_layouts_layout_version_check" CHECK ((layout_version = 1));
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_capacity_check" CHECK (((capacity IS NULL) OR (capacity = ANY (ARRAY['founder'::text, 'admin'::text, 'principal'::text, 'section_head'::text, 'grade_head'::text, 'teacher'::text, 'student'::text, 'guest'::text, 'developer'::text]))));
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_full_name_check" CHECK ((char_length(TRIM(BOTH FROM full_name)) > 0));
ALTER TABLE ONLY public."users" ADD CONSTRAINT "users_username_format" CHECK (((username IS NULL) OR (username ~* '^[a-z0-9_-]{3,30}$'::text)));
ALTER TABLE ONLY public."academic_cycles" ADD CONSTRAINT "valid_dates" CHECK ((start_date <= end_date));

-- ─── Views ───
CREATE OR REPLACE VIEW public."active_classrooms" AS
SELECT id,
    school_id,
    teacher_id,
    grade_id,
    section_id,
    name,
    subject,
    description,
    color_theme,
    is_archived,
    created_at,
    updated_at,
    academic_year
   FROM classrooms
  WHERE ((academic_year = to_char(now(), 'YYYY'::text)) AND (is_archived = false));;

CREATE OR REPLACE VIEW public."active_timetable" AS
SELECT id,
    user_id,
    day_of_week,
    period_number,
    subject,
    class_name,
    type,
    start_time,
    end_time,
    created_at,
    academic_year
   FROM timetable
  WHERE (academic_year = to_char(now(), 'YYYY'::text));;

CREATE OR REPLACE VIEW public."community_posts_with_counts" AS
SELECT id,
    school_id,
    group_id,
    author_id,
    content,
    created_at,
    media_url,
    media_type,
    post_type,
    poll_data,
    author_role,
    updated_at,
    deleted_at,
    ( SELECT count(*) AS count
           FROM community_comments c
          WHERE (c.post_id = p.id)) AS comment_count,
    ( SELECT count(*) AS count
           FROM community_reactions r
          WHERE (r.post_id = p.id)) AS reaction_count
   FROM community_posts p;;

-- View: public."geography_columns" (Definition empty/not accessible)
-- View: public."geometry_columns" (Definition empty/not accessible)
CREATE OR REPLACE VIEW public."resource_needs" AS
WITH aggregated_requests AS (
         SELECT inventory_requests.item_name AS resource_type,
            (inventory_requests.item_name || ' for classrooms'::text) AS description,
            count(DISTINCT inventory_requests.classroom_id) AS requested_by_count,
            inventory_requests.school_id
           FROM inventory_requests
          WHERE (inventory_requests.status = 'pending'::text)
          GROUP BY inventory_requests.item_name, inventory_requests.school_id
        )
 SELECT resource_type,
    description,
    requested_by_count,
        CASE
            WHEN (requested_by_count > 10) THEN 'urgent'::text
            WHEN (requested_by_count > 5) THEN 'high'::text
            ELSE 'medium'::text
        END AS priority,
    'supplies'::text AS icon,
    school_id,
    gen_random_uuid() AS id
   FROM aggregated_requests;;

CREATE OR REPLACE VIEW public."school_registry" AS
SELECT id,
    census_id,
    name,
    address,
    tel_no,
    email,
    province,
    district,
    zone,
    division,
    medium,
    gender,
    category,
    type,
    grade_span,
    total_students,
    difficulty_level,
    properties,
    created_at,
    updated_at
   FROM school_registry_legacy;;

-- ─── Indexes ───
CREATE INDEX idx_academic_cycles_dates ON public.academic_cycles USING btree (start_date, end_date);
CREATE INDEX idx_academic_cycles_school_id ON public.academic_cycles USING btree (school_id);
CREATE INDEX idx_ai_messages_expires_at ON public.ai_messages USING btree (expires_at);
CREATE INDEX idx_ai_messages_user_thread_created ON public.ai_messages USING btree (user_id, thread_id, created_at);
CREATE INDEX idx_assignments_classroom_due_date ON public.assignments USING btree (classroom_id, due_date);
CREATE INDEX idx_attendance_classroom_date ON public.attendance USING btree (classroom_id, date);
CREATE INDEX idx_attendance_student_date ON public.attendance USING btree (student_id, date);
CREATE INDEX idx_auth_identities_provider_id ON public.auth_identities USING btree (provider, provider_user_id);
CREATE INDEX idx_auth_identities_user_id ON public.auth_identities USING btree (user_id);
CREATE INDEX idx_bonds_composite ON public.bonds USING btree (user_id, entity_type, capacity);
CREATE INDEX idx_bonds_entity_id ON public.bonds USING btree (entity_id);
CREATE INDEX idx_bonds_user_id ON public.bonds USING btree (user_id);
CREATE INDEX idx_classroom_note_events_classroom ON public.classroom_note_events USING btree (classroom_id, occurred_at DESC, recorded_at DESC);
CREATE INDEX idx_classroom_note_events_note_timeline ON public.classroom_note_events USING btree (note_id, occurred_at DESC, recorded_at DESC);
CREATE INDEX idx_classroom_notes_classroom_date ON public.classroom_notes USING btree (classroom_id, created_at DESC);
CREATE INDEX classroom_students_classroom_status_idx ON public.classroom_students USING btree (classroom_id, status);
CREATE INDEX idx_classroom_students_student_status ON public.classroom_students USING btree (student_id, status);
CREATE INDEX idx_classrooms_academic_year ON public.classrooms USING btree (school_id, academic_year);
CREATE INDEX idx_collection_node_events_lookup ON public.collection_node_events USING btree (collection_id, node_id, occurred_at DESC);
CREATE INDEX idx_collection_nodes_collection_position ON public.collection_nodes USING btree (collection_id, "position", added_at);
CREATE INDEX idx_collection_nodes_node ON public.collection_nodes USING btree (node_id);
CREATE INDEX idx_community_entity_versions_lookup ON public.community_entity_versions USING btree (entity_type, entity_id, changed_at DESC);
CREATE INDEX idx_community_group_members_group_status ON public.community_group_members USING btree (group_id, status);
CREATE INDEX idx_community_groups_classroom_id ON public.community_groups USING btree (classroom_id);
CREATE INDEX idx_community_groups_school_created ON public.community_groups USING btree (school_id, created_at DESC);
CREATE INDEX idx_community_posts_author_created ON public.community_posts USING btree (author_id, created_at DESC);
CREATE INDEX idx_community_posts_group_created ON public.community_posts USING btree (group_id, created_at DESC);
CREATE INDEX idx_community_profile_versions_community_recorded_at ON public.community_profile_versions USING btree (community_id, recorded_at DESC);
CREATE INDEX idx_community_reactions_user_created ON public.community_reactions USING btree (user_id, created_at DESC);
CREATE INDEX idx_device_accounts_account_id ON public.device_accounts USING btree (account_id);
CREATE INDEX idx_device_accounts_device_id ON public.device_accounts USING btree (device_id);
CREATE UNIQUE INDEX device_registry_install_id_key ON public.device_registry USING btree (install_id);
CREATE INDEX idx_direct_conv_user1 ON public.direct_conversations USING btree (user1_id);
CREATE INDEX idx_direct_conv_user2 ON public.direct_conversations USING btree (user2_id);
CREATE INDEX idx_direct_messages_conv_created ON public.direct_messages USING btree (conversation_id, created_at);
CREATE INDEX idx_districts_geom ON public.districts USING gist (geom);
CREATE INDEX idx_events_entity ON public.ecosystem_events USING btree (entity_name, event_date DESC);
CREATE INDEX idx_events_severity ON public.ecosystem_events USING btree (severity, event_date DESC);
CREATE INDEX idx_events_type ON public.ecosystem_events USING btree (event_type, event_date DESC);
CREATE INDEX idx_school_contacts_school ON public.edu_school_contacts USING btree (school_id);
CREATE INDEX idx_school_stats_year ON public.edu_school_registry_stats USING btree (academic_year);
CREATE INDEX idx_edu_schools_location ON public.edu_schools USING gist (location);
CREATE INDEX idx_edu_schools_name_trgm ON public.edu_schools USING gin (name gin_trgm_ops);
CREATE INDEX idx_fire_journal_user_created ON public.fire_journal USING btree (user_id, created_at DESC);
CREATE INDEX form_templates_slug_idx ON public.form_templates USING btree (slug);
CREATE INDEX geo_features_geom_idx ON public.geo_features USING gist (geom);
CREATE INDEX idx_grade_levels_section ON public.grade_levels USING btree (section_id);
CREATE INDEX idx_group_messages_group_created ON public.group_messages USING btree (group_id, created_at);
CREATE INDEX idx_growth_events_user_created ON public.growth_events USING btree (user_id, created_at DESC);
CREATE INDEX idx_growth_events_user_dimension_created ON public.growth_events USING btree (user_id, dimension, created_at DESC);
CREATE UNIQUE INDEX invite_codes_school_creator_idempotency_key ON public.invite_codes USING btree (school_id, created_by, idempotency_key) WHERE (idempotency_key IS NOT NULL);
CREATE INDEX idx_journal_entries_created ON public.journal_entries USING btree (user_id, created_at DESC);
CREATE INDEX idx_journal_entries_user ON public.journal_entries USING btree (user_id);
CREATE INDEX idx_lesson_materials_classroom_created ON public.lesson_materials USING btree (classroom_id, created_at DESC);
CREATE INDEX idx_lesson_materials_lesson ON public.lesson_materials USING btree (lesson_id);
CREATE INDEX idx_lessons_classroom_order ON public.lessons USING btree (classroom_id, order_index);
CREATE INDEX idx_library_entity_versions_lookup ON public.library_entity_versions USING btree (entity_type, entity_id, changed_at DESC);
CREATE INDEX idx_mood_logs_user_created ON public.mood_logs USING btree (user_id, created_at DESC);
CREATE INDEX idx_library_resources_cosmos ON public.nodes USING btree (map_x, map_y) WHERE (is_geographic = false);
CREATE INDEX idx_library_resources_geo ON public.nodes USING btree (latitude, longitude) WHERE (is_geographic = true);
CREATE INDEX idx_library_resources_search ON public.nodes USING gin (search_vector);
CREATE INDEX idx_nodes_fts ON public.nodes USING gin (search_vector);
CREATE INDEX idx_nodes_subjects ON public.nodes USING gin (subjects);
CREATE INDEX idx_nodes_tags ON public.nodes USING gin (tags);
CREATE INDEX idx_nodes_topics ON public.nodes USING gin (topics);
CREATE INDEX idx_nodes_type ON public.nodes USING btree (type);
CREATE INDEX notifications_user_created_at_idx ON public.notifications USING btree (user_id, created_at DESC);
CREATE INDEX notifications_user_is_read_idx ON public.notifications USING btree (user_id, is_read);
CREATE INDEX idx_packages_category ON public.packages USING btree (category);
CREATE INDEX idx_packages_expo_go ON public.packages USING btree (expo_go_compatible);
CREATE INDEX idx_packages_name ON public.packages USING btree (package_name);
CREATE INDEX idx_packages_new_arch ON public.packages USING btree (new_architecture_status);
CREATE INDEX idx_packages_radar_status ON public.packages USING btree (radar_status);
CREATE INDEX idx_packages_topology_layer ON public.packages USING btree (topology_layer);
CREATE INDEX idx_packages_v1_readiness ON public.packages USING btree (v1_readiness);
CREATE INDEX idx_packages_vendor ON public.packages USING btree (vendor);
CREATE INDEX idx_packages_vitality_score ON public.packages USING btree (vitality_score DESC);
CREATE INDEX permission_snapshots_user_bond_idx ON public.permission_snapshots USING btree (user_id, active_bond_id);
CREATE INDEX personal_classrooms_user_id_idx ON public.personal_classrooms USING btree (user_id);
CREATE INDEX idx_pricing_manifest_tier ON public.pricing_manifest USING btree (tier);
CREATE INDEX idx_principal_governance_events_principal_occurred ON public.principal_governance_events USING btree (principal_id, occurred_at DESC, recorded_at DESC);
CREATE INDEX idx_principal_governance_events_school_entity ON public.principal_governance_events USING btree (school_id, entity_type, occurred_at DESC);
CREATE INDEX idx_principal_notes_school_date ON public.principal_notes USING btree (school_id, created_at DESC);
CREATE INDEX idx_privacy_ledger_user ON public.privacy_ledger_entries USING btree (user_id, created_at DESC);
CREATE INDEX idx_provinces_geom ON public.provinces USING gist (geom);
CREATE INDEX idx_school_memberships_active ON public.school_memberships USING btree (school_id, status) WHERE (status = 'active'::text);
CREATE INDEX idx_school_memberships_user ON public.school_memberships USING btree (user_id) WHERE (deleted_at IS NULL);
CREATE INDEX school_registry_claims_edu_status_idx ON public.school_registry_claims USING btree (edu_school_id, status);
CREATE INDEX school_registry_claims_requester_status_idx ON public.school_registry_claims USING btree (requested_by, status);
CREATE INDEX idx_school_registry_census_id ON public.school_registry_legacy USING btree (census_id);
CREATE INDEX idx_school_registry_geo_params ON public.school_registry_legacy USING btree (province, district, zone);
CREATE INDEX idx_school_registry_name_trgm ON public.school_registry_legacy USING gin (name gin_trgm_ops);
CREATE INDEX idx_schools_deleted_at ON public.schools USING btree (deleted_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_sections_deleted_at ON public.sections USING btree (deleted_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_sections_school ON public.sections USING btree (school_id);
CREATE INDEX idx_security_audit_logs_account_created_at ON public.security_audit_logs USING btree (account_id, created_at DESC);
CREATE INDEX idx_snapshot_moments_user_date ON public.snapshot_moments USING btree (user_id, resonance_date);
CREATE INDEX idx_student_academic_records_school_year ON public.student_academic_records USING btree (school_id, academic_year);
CREATE INDEX idx_student_academic_records_student_year ON public.student_academic_records USING btree (student_id, academic_year);
CREATE INDEX idx_student_grades_assignment ON public.student_grades USING btree (assignment_id);
CREATE INDEX idx_student_grades_classroom_student ON public.student_grades USING btree (classroom_id, student_id);
CREATE INDEX idx_student_grades_deleted ON public.student_grades USING btree (deleted_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_student_grades_grader ON public.student_grades USING btree (graded_by);
CREATE INDEX idx_student_grades_student_created ON public.student_grades USING btree (student_id, created_at DESC);
CREATE INDEX idx_student_longitudinal_classroom_occurred ON public.student_longitudinal_events USING btree (classroom_id, occurred_at DESC);
CREATE INDEX idx_student_longitudinal_events_classroom_occurred_at ON public.student_longitudinal_events USING btree (classroom_id, occurred_at DESC);
CREATE INDEX idx_student_longitudinal_events_school_entity ON public.student_longitudinal_events USING btree (school_id, entity_type, occurred_at DESC);
CREATE INDEX idx_student_longitudinal_events_student_occurred_at ON public.student_longitudinal_events USING btree (student_id, occurred_at DESC, recorded_at DESC);
CREATE INDEX idx_student_longitudinal_student_occurred ON public.student_longitudinal_events USING btree (student_id, occurred_at DESC);
CREATE INDEX idx_student_profiles_section ON public.student_profiles USING btree (section_id);
CREATE INDEX idx_student_profiles_user ON public.student_profiles USING btree (user_id);
CREATE INDEX idx_students_classroom ON public.students USING btree (classroom_id);
CREATE INDEX submissions_assignment_submitted_at_idx ON public.submissions USING btree (assignment_id, submitted_at DESC);
CREATE INDEX submissions_student_submitted_at_idx ON public.submissions USING btree (student_id, submitted_at DESC);
CREATE INDEX idx_teacher_insight_events_owner_occurred ON public.teacher_insight_events USING btree (owner_id, occurred_at DESC, recorded_at DESC);
CREATE INDEX idx_teacher_insight_events_school_share ON public.teacher_insight_events USING btree (school_id, share_state, occurred_at DESC);
CREATE INDEX idx_teacher_insight_events_target_occurred ON public.teacher_insight_events USING btree (insight_type, insight_id, occurred_at DESC, recorded_at DESC);
CREATE INDEX idx_teacher_profiles_school ON public.teacher_profiles USING btree (school_id);
CREATE INDEX idx_teacher_profiles_user ON public.teacher_profiles USING btree (user_id);
CREATE INDEX idx_temporal_summaries_composite ON public.temporal_summaries USING btree (user_id, scale, resonance_date);
CREATE INDEX idx_thuthimal_gifts_token ON public.thuthimal_gifts USING btree (gift_token) WHERE (claimed = false);
CREATE INDEX idx_timetable_user_year ON public.timetable USING btree (user_id, academic_year);
CREATE INDEX user_entitlement_grants_entity_idx ON public.user_entitlement_grants USING btree (entity_id, entity_type, status);
CREATE INDEX user_entitlement_grants_user_bond_idx ON public.user_entitlement_grants USING btree (user_id, bond_id, status);
CREATE INDEX user_entitlement_grants_user_scope_idx ON public.user_entitlement_grants USING btree (user_id, scope_type, status);
CREATE INDEX idx_user_growth_state_versions_user_recorded_at ON public.user_growth_state_versions USING btree (user_id, recorded_at DESC);
CREATE INDEX idx_user_profile_versions_user_recorded_at ON public.user_profile_versions USING btree (user_id, recorded_at DESC);
CREATE INDEX user_push_tokens_user_platform_idx ON public.user_push_tokens USING btree (user_id, platform);
CREATE INDEX idx_user_rewards_versions_user_recorded_at ON public.user_rewards_versions USING btree (user_id, recorded_at DESC);
CREATE INDEX idx_user_workspace_layouts_updated_at ON public.user_workspace_layouts USING btree (updated_at DESC);
CREATE INDEX idx_user_workspace_layouts_user_workspace_target ON public.user_workspace_layouts USING btree (user_id, workspace_id, layout_target);
CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at) WHERE (deleted_at IS NULL);

-- ─── Triggers ───
CREATE TRIGGER trg_capture_student_longitudinal_attendance AFTER INSERT OR DELETE OR UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION capture_student_longitudinal_event_generic('attendance', 'student_id', 'classroom_id', '', 'date', 'date', '');
CREATE TRIGGER on_identity_linked AFTER INSERT OR UPDATE ON public.auth_identities FOR EACH ROW EXECUTE FUNCTION handle_identity_link();
CREATE TRIGGER trg_sync_membership_for_official_school_bond AFTER INSERT ON public.bonds FOR EACH ROW EXECUTE FUNCTION sync_membership_for_official_school_bond();
CREATE TRIGGER trg_capture_student_longitudinal_study_note AFTER INSERT OR DELETE OR UPDATE ON public.classroom_notes FOR EACH ROW EXECUTE FUNCTION capture_student_longitudinal_study_note_event();
CREATE TRIGGER tr_sync_student_context AFTER INSERT ON public.classroom_students FOR EACH ROW EXECUTE FUNCTION sync_student_context_on_enrollment();
CREATE TRIGGER trg_capture_student_longitudinal_enrollment AFTER INSERT OR DELETE OR UPDATE ON public.classroom_students FOR EACH ROW EXECUTE FUNCTION capture_student_longitudinal_event_generic('enrollment', 'student_id', 'classroom_id', '', 'enrolled_at', 'enrolled_at', 'claimed_at');
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_collection_nodes_assign_position BEFORE INSERT ON public.collection_nodes FOR EACH ROW EXECUTE FUNCTION assign_collection_node_position();
CREATE TRIGGER tr_collection_nodes_events AFTER INSERT OR DELETE OR UPDATE ON public.collection_nodes FOR EACH ROW EXECUTE FUNCTION log_collection_node_event();
CREATE TRIGGER tr_collection_nodes_refresh_collection_arrays AFTER INSERT OR DELETE OR UPDATE ON public.collection_nodes FOR EACH ROW EXECUTE FUNCTION refresh_collection_arrays_from_nodes();
CREATE TRIGGER tr_collections_seed_nodes AFTER INSERT ON public.collections FOR EACH ROW EXECUTE FUNCTION seed_collection_nodes_from_collection();
CREATE TRIGGER tr_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_collections_versions AFTER INSERT OR DELETE OR UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION capture_library_entity_version();
CREATE TRIGGER tr_community_comments_updated_at BEFORE UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();
CREATE TRIGGER tr_community_comments_versions AFTER INSERT OR DELETE OR UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION capture_community_entity_version();
CREATE TRIGGER trg_group_member_count AFTER INSERT OR DELETE OR UPDATE ON public.community_group_members FOR EACH ROW EXECUTE FUNCTION update_group_member_count();
CREATE TRIGGER trg_capture_community_profile_version AFTER INSERT OR DELETE OR UPDATE ON public.community_groups FOR EACH ROW EXECUTE FUNCTION capture_community_profile_version();
CREATE TRIGGER tr_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();
CREATE TRIGGER tr_community_posts_versions AFTER INSERT OR DELETE OR UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION capture_community_entity_version();
CREATE TRIGGER trg_notify_group_post AFTER INSERT ON public.community_posts FOR EACH ROW WHEN ((new.group_id IS NOT NULL)) EXECUTE FUNCTION notify_on_group_post();
CREATE TRIGGER tr_direct_messages_updated_at BEFORE UPDATE ON public.direct_messages FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();
CREATE TRIGGER tr_direct_messages_versions AFTER INSERT OR DELETE OR UPDATE ON public.direct_messages FOR EACH ROW EXECUTE FUNCTION capture_community_entity_version();
CREATE TRIGGER trigger_update_conv_timestamp AFTER INSERT ON public.direct_messages FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();
CREATE TRIGGER update_edu_school_climate_updated_at BEFORE UPDATE ON public.edu_school_climate FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_edu_school_contacts BEFORE UPDATE ON public.edu_school_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_edu_school_stats BEFORE UPDATE ON public.edu_school_registry_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_edu_schools BEFORE UPDATE ON public.edu_schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_geo_districts BEFORE UPDATE ON public.geo_districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_geo_ds_divisions BEFORE UPDATE ON public.geo_ds_divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_geo_gn_divisions BEFORE UPDATE ON public.geo_gn_divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_geo_postal_towns BEFORE UPDATE ON public.geo_postal_towns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_u_geo_provinces BEFORE UPDATE ON public.geo_provinces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_group_messages_updated_at BEFORE UPDATE ON public.group_messages FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();
CREATE TRIGGER tr_group_messages_versions AFTER INSERT OR DELETE OR UPDATE ON public.group_messages FOR EACH ROW EXECUTE FUNCTION capture_community_entity_version();
CREATE TRIGGER trg_resonance_mirror_inventory_items BEFORE DELETE OR UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION resonance.archive_inventory_items();
CREATE TRIGGER tr_map_layers_search BEFORE INSERT OR UPDATE ON public.map_layers FOR EACH ROW EXECUTE FUNCTION map_layers_search_trigger();
CREATE TRIGGER tr_library_resource_search BEFORE INSERT OR UPDATE ON public.nodes FOR EACH ROW EXECUTE FUNCTION library_resource_search_trigger();
CREATE TRIGGER tr_nodes_search_vector BEFORE INSERT OR UPDATE ON public.nodes FOR EACH ROW EXECUTE FUNCTION nodes_search_vector_update();
CREATE TRIGGER tr_nodes_versions AFTER INSERT OR DELETE OR UPDATE ON public.nodes FOR EACH ROW EXECUTE FUNCTION capture_library_entity_version();
CREATE TRIGGER packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.personal_classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_site_stats_updated_at BEFORE UPDATE ON public.public_site_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_resonance_mirror_relief_assignments BEFORE DELETE OR UPDATE ON public.relief_assignments FOR EACH ROW EXECUTE FUNCTION resonance.archive_relief_assignments();
CREATE TRIGGER tr_school_membership_sync AFTER INSERT OR UPDATE ON public.school_memberships FOR EACH ROW EXECUTE FUNCTION handle_school_membership_sync();
CREATE TRIGGER update_school_registry_updated_at BEFORE UPDATE ON public.school_registry_legacy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_school_soft_delete AFTER UPDATE OF deleted_at ON public.schools FOR EACH ROW EXECUTE FUNCTION propagate_school_soft_delete();
CREATE TRIGGER update_student_potential_analysis_updated_at BEFORE UPDATE ON public.student_potential_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_audit_students AFTER INSERT OR DELETE OR UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();
CREATE TRIGGER trg_capture_student_growth_event AFTER INSERT OR UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION capture_student_longitudinal_event_generic('grade_change', 'user_id', 'null', 'null', 'updated_at');
CREATE TRIGGER trigger_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_capture_student_longitudinal_submission AFTER INSERT OR DELETE OR UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION capture_student_longitudinal_submission_event();
CREATE TRIGGER trg_notify_grade AFTER UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION notify_on_grade();
CREATE TRIGGER trg_notify_submission AFTER INSERT ON public.submissions FOR EACH ROW EXECUTE FUNCTION notify_on_submission();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_audit_teachers AFTER INSERT OR DELETE OR UPDATE ON public.teacher_profiles FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();
CREATE TRIGGER trg_capture_user_growth_state_version AFTER INSERT OR DELETE OR UPDATE ON public.user_growth_state FOR EACH ROW EXECUTE FUNCTION capture_user_growth_state_version();
CREATE TRIGGER trg_capture_user_rewards_version AFTER INSERT OR DELETE OR UPDATE ON public.user_rewards FOR EACH ROW EXECUTE FUNCTION capture_user_rewards_version();
CREATE TRIGGER trg_touch_user_workspace_layout_updated_at BEFORE UPDATE ON public.user_workspace_layouts FOR EACH ROW EXECUTE FUNCTION touch_user_workspace_layout_updated_at();
CREATE TRIGGER on_auth_user_created_preferences AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION handle_new_user_preferences();
CREATE TRIGGER tr_audit_users AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();
CREATE TRIGGER tr_propagate_soft_delete AFTER UPDATE OF deleted_at ON public.users FOR EACH ROW EXECUTE FUNCTION propagate_user_soft_delete();
CREATE TRIGGER tr_user_profile_sync_after AFTER INSERT OR UPDATE OF capacity ON public.users FOR EACH ROW EXECUTE FUNCTION handle_user_profile_sync_after();
CREATE TRIGGER tr_user_row_defaults BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION handle_user_row_defaults();
CREATE TRIGGER trg_capture_user_profile_version AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION capture_user_profile_version();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security Policies ───
CREATE POLICY "Users can view academic cycles for their school" ON public."academic_cycles" FOR SELECT TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "accounts_platform_admin" ON public."accounts" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "ai_messages_owner_delete" ON public."ai_messages" FOR DELETE USING ((user_id = auth.uid()));
CREATE POLICY "ai_messages_owner_insert" ON public."ai_messages" FOR INSERT WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "ai_messages_owner_read" ON public."ai_messages" FOR SELECT USING ((user_id = auth.uid()));
CREATE POLICY "ai_messages_owner_update" ON public."ai_messages" FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Anyone in school can view announcements" ON public."announcements" FOR SELECT TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "Classroom members can view assignments" ON public."assignments" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (classrooms c
     LEFT JOIN classroom_students cs ON ((c.id = cs.classroom_id)))
  WHERE ((c.id = assignments.classroom_id) AND ((c.teacher_id = get_my_id()) OR (cs.student_id = get_my_id()))))));
CREATE POLICY "Students can view their own attendance" ON public."attendance" FOR SELECT TO authenticated USING ((get_my_id() = student_id));
CREATE POLICY "Teachers can manage attendance in their classrooms" ON public."attendance" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM classrooms
  WHERE ((classrooms.id = attendance.classroom_id) AND (classrooms.teacher_id = get_my_id())))));
CREATE POLICY "Users can view their own audit logs" ON public."audit_logs" FOR SELECT TO authenticated USING ((auth.uid() = executor_id));
CREATE POLICY "Anonymous users can manage their own identities" ON public."auth_identities" FOR ALL TO anon USING (((get_my_id() = user_id) OR (auth.uid() = user_id))) WITH CHECK (((get_my_id() = user_id) OR (auth.uid() = user_id)));
CREATE POLICY "Users can manage their own auth identities" ON public."auth_identities" FOR ALL TO authenticated USING (((get_my_id() = user_id) OR (auth.uid() = user_id))) WITH CHECK (((get_my_id() = user_id) OR (auth.uid() = user_id)));
CREATE POLICY "Platform admins can manage all bonds" ON public."bonds" FOR ALL USING (has_capacity('admin'::text, 'GLOBAL'::text));
CREATE POLICY "Users can create their own bonds" ON public."bonds" FOR INSERT WITH CHECK ((get_my_id() = user_id));
CREATE POLICY "Users can view their own bonds" ON public."bonds" FOR SELECT USING ((get_my_id() = user_id));
CREATE POLICY "budgets_platform_admin" ON public."budgets" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "calendar_events_admin" ON public."calendar_events" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "calendar_events_read" ON public."calendar_events" FOR SELECT TO authenticated USING ((is_public OR (school_id IN ( SELECT u.school_id
   FROM users u
  WHERE (u.id = auth.uid())))));
CREATE POLICY "classroom_grading_settings_manage" ON public."classroom_grading_settings" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = classroom_grading_settings.classroom_id) AND (c.teacher_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = classroom_grading_settings.classroom_id) AND (c.teacher_id = auth.uid())))));
CREATE POLICY "classroom_grading_settings_read" ON public."classroom_grading_settings" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = classroom_grading_settings.classroom_id) AND ((c.teacher_id = auth.uid()) OR (c.is_archived = false))))));
CREATE POLICY "Users can view own classroom requests" ON public."classroom_join_requests" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Anyone in classroom can view classroom legacy" ON public."classroom_legacy_records" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM classroom_students
  WHERE ((classroom_students.classroom_id = classroom_legacy_records.classroom_id) AND (classroom_students.student_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM classrooms
  WHERE ((classrooms.id = classroom_legacy_records.classroom_id) AND (classrooms.teacher_id = auth.uid()))))));
CREATE POLICY "classroom_note_events_class_read" ON public."classroom_note_events" FOR SELECT USING (((visibility = 'class'::text) AND ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = classroom_note_events.classroom_id) AND (c.teacher_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM classroom_students cs
  WHERE ((cs.classroom_id = classroom_note_events.classroom_id) AND (cs.student_id = auth.uid())))))));
CREATE POLICY "classroom_note_events_insert" ON public."classroom_note_events" FOR INSERT WITH CHECK (((author_id = auth.uid()) AND ((recorded_by IS NULL) OR (recorded_by = auth.uid()))));
CREATE POLICY "classroom_note_events_own_read" ON public."classroom_note_events" FOR SELECT USING ((author_id = auth.uid()));
CREATE POLICY "classroom_notes_class_read" ON public."classroom_notes" FOR SELECT TO authenticated USING (((visibility = 'class'::text) AND ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = classroom_notes.classroom_id) AND (c.teacher_id = get_my_id())))) OR (EXISTS ( SELECT 1
   FROM classroom_students cs
  WHERE ((cs.classroom_id = classroom_notes.classroom_id) AND (cs.student_id = get_my_id())))))));
CREATE POLICY "classroom_notes_delete" ON public."classroom_notes" FOR DELETE TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "classroom_notes_insert" ON public."classroom_notes" FOR INSERT TO authenticated WITH CHECK ((author_id = get_my_id()));
CREATE POLICY "classroom_notes_own_read" ON public."classroom_notes" FOR SELECT TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "classroom_notes_update" ON public."classroom_notes" FOR UPDATE TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "Teachers can manage their own classroom photos" ON public."classroom_photos" FOR ALL TO authenticated USING ((teacher_id = get_my_id())) WITH CHECK ((teacher_id = get_my_id()));
CREATE POLICY "Users can view classroom photos" ON public."classroom_photos" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Classroom members can view student list" ON public."classroom_students" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM classrooms c
  WHERE ((c.id = classroom_students.classroom_id) AND ((c.teacher_id = get_my_id()) OR (EXISTS ( SELECT 1
           FROM classroom_students cs
          WHERE ((cs.classroom_id = c.id) AND (cs.student_id = get_my_id())))))))));
CREATE POLICY "Teachers manage their classrooms" ON public."classrooms" FOR ALL TO authenticated USING ((teacher_id = get_my_id()));
CREATE POLICY "classrooms_owner_all" ON public."classrooms" FOR ALL TO authenticated USING (((get_my_id() = created_by) OR (get_my_id() = teacher_id)));
CREATE POLICY "collection_node_events_insert_collection_owner" ON public."collection_node_events" FOR INSERT TO authenticated WITH CHECK (((actor_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM collections c
  WHERE ((c.id = collection_node_events.collection_id) AND (c.creator_id = auth.uid()))))));
CREATE POLICY "collection_node_events_select_visible_collection" ON public."collection_node_events" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM collections c
  WHERE ((c.id = collection_node_events.collection_id) AND ((c.visibility = ANY (ARRAY['public'::text, 'school'::text, 'shared'::text])) OR (c.creator_id = auth.uid()))))));
CREATE POLICY "collection_nodes_owner_delete" ON public."collection_nodes" FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM collections c
  WHERE ((c.id = collection_nodes.collection_id) AND (c.creator_id = auth.uid())))));
CREATE POLICY "collection_nodes_owner_insert" ON public."collection_nodes" FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM collections c
  WHERE ((c.id = collection_nodes.collection_id) AND (c.creator_id = auth.uid())))));
CREATE POLICY "collection_nodes_select_visible_collection" ON public."collection_nodes" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM collections c
  WHERE ((c.id = collection_nodes.collection_id) AND ((c.visibility = ANY (ARRAY['public'::text, 'school'::text, 'shared'::text])) OR (c.creator_id = auth.uid()))))));
CREATE POLICY "Public collections are viewable by everyone" ON public."collections" FOR SELECT TO anon, authenticated USING (((is_public = true) OR (verified = true)));
CREATE POLICY "Users can manage their own collections" ON public."collections" FOR ALL TO authenticated USING ((get_my_id() = creator_id));
CREATE POLICY "Anyone in school can read comments" ON public."community_comments" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can manage own comments" ON public."community_comments" FOR ALL TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "community_entity_versions_select_own_scope" ON public."community_entity_versions" FOR SELECT TO authenticated USING ((((entity_type = 'community_post'::text) AND (((COALESCE(((snapshot -> 'after'::text) ->> 'school_id'::text), ((snapshot -> 'before'::text) ->> 'school_id'::text), (snapshot ->> 'school_id'::text)))::uuid = get_my_active_school_id()) OR (COALESCE(((snapshot -> 'after'::text) ->> 'school_id'::text), ((snapshot -> 'before'::text) ->> 'school_id'::text), (snapshot ->> 'school_id'::text)) IS NULL))) OR ((entity_type = 'community_comment'::text) AND (((COALESCE(((snapshot -> 'after'::text) ->> 'school_id'::text), ((snapshot -> 'before'::text) ->> 'school_id'::text), (snapshot ->> 'school_id'::text)))::uuid = get_my_active_school_id()) OR (COALESCE(((snapshot -> 'after'::text) ->> 'school_id'::text), ((snapshot -> 'before'::text) ->> 'school_id'::text), (snapshot ->> 'school_id'::text)) IS NULL))) OR ((entity_type = 'group_message'::text) AND (EXISTS ( SELECT 1
   FROM community_group_members m
  WHERE ((m.group_id = (COALESCE(((community_entity_versions.snapshot -> 'after'::text) ->> 'group_id'::text), ((community_entity_versions.snapshot -> 'before'::text) ->> 'group_id'::text), (community_entity_versions.snapshot ->> 'group_id'::text)))::uuid) AND (m.user_id = get_my_id()) AND (m.status = 'active'::text)))))));
CREATE POLICY "Members can view group membership" ON public."community_group_members" FOR SELECT USING (is_group_member(group_id));
CREATE POLICY "Users can join groups" ON public."community_group_members" FOR INSERT WITH CHECK ((get_my_id() = user_id));
CREATE POLICY "group_members_join" ON public."community_group_members" FOR INSERT TO authenticated WITH CHECK (((user_id = get_my_id()) AND (role = 'member'::text) AND (EXISTS ( SELECT 1
   FROM community_groups g
  WHERE ((g.id = community_group_members.group_id) AND (((g.join_policy = 'open'::text) AND (community_group_members.status = 'active'::text)) OR ((g.join_policy = ANY (ARRAY['approval_required'::text, 'invite_only'::text])) AND (community_group_members.status = 'pending'::text))))))));
CREATE POLICY "group_members_management_v3" ON public."community_group_members" FOR ALL USING ((is_group_admin(group_id) OR (user_id = get_my_id()))) WITH CHECK ((is_group_admin(group_id) OR (user_id = get_my_id())));
CREATE POLICY "group_members_self_read" ON public."community_group_members" FOR SELECT TO authenticated USING ((user_id = get_my_id()));
CREATE POLICY "Anyone can view groups" ON public."community_groups" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators and admins can manage groups" ON public."community_groups" FOR ALL USING (((get_my_id() = created_by) OR is_group_admin(id)));
CREATE POLICY "Users can view poll votes" ON public."community_poll_votes" FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public."community_poll_votes" FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can update/delete posts" ON public."community_posts" FOR ALL TO authenticated USING ((get_my_id() = author_id));
CREATE POLICY "Group members can create posts" ON public."community_posts" FOR INSERT TO authenticated WITH CHECK (((EXISTS ( SELECT 1
   FROM community_group_members
  WHERE ((community_group_members.group_id = community_posts.group_id) AND (community_group_members.user_id = get_my_id()) AND (community_group_members.status = 'active'::text)))) AND (get_my_id() = author_id)));
CREATE POLICY "Group members can view posts" ON public."community_posts" FOR SELECT USING (is_group_member(group_id));
CREATE POLICY "Users cannot see posts from blocked users" ON public."community_posts" FOR SELECT USING ((NOT (EXISTS ( SELECT 1
   FROM user_blocks
  WHERE (((user_blocks.blocker_id = auth.uid()) AND (user_blocks.blocked_id = community_posts.author_id)) OR ((user_blocks.blocker_id = community_posts.author_id) AND (user_blocks.blocked_id = auth.uid())))))));
CREATE POLICY "Group members can view reactions" ON public."community_reactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM community_posts p
  WHERE ((p.id = community_reactions.post_id) AND is_group_member(p.group_id)))));
CREATE POLICY "Users can manage their own reactions" ON public."community_reactions" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "community_reports_insert_own" ON public."community_reports" FOR INSERT TO authenticated WITH CHECK ((get_my_id() = reporter_id));
CREATE POLICY "community_reports_read_own" ON public."community_reports" FOR SELECT TO authenticated USING ((get_my_id() = reporter_id));
CREATE POLICY "Users can view challenges in their school/classroom" ON public."contextual_challenges" FOR SELECT TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "Users can manage their own contextual moments" ON public."contextual_moments" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "conv_settings_all_own" ON public."conversation_settings" FOR ALL TO authenticated USING ((get_my_id() = user_id)) WITH CHECK ((get_my_id() = user_id));
CREATE POLICY "conv_settings_read_own" ON public."conversation_settings" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Anyone can view daily content" ON public."daily_content" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own daily prep items" ON public."daily_prep_items" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can delete their own device links" ON public."device_accounts" FOR DELETE USING ((account_id = get_my_id()));
CREATE POLICY "Users can insert their own device links" ON public."device_accounts" FOR INSERT WITH CHECK ((account_id = get_my_id()));
CREATE POLICY "Users can update their own device links" ON public."device_accounts" FOR UPDATE USING ((account_id = get_my_id())) WITH CHECK ((account_id = get_my_id()));
CREATE POLICY "Users can view their own device links" ON public."device_accounts" FOR SELECT USING ((account_id = get_my_id()));
CREATE POLICY "Users can create their own devices" ON public."device_registry" FOR INSERT WITH CHECK ((created_by = get_my_id()));
CREATE POLICY "Users can see their registered devices" ON public."device_registry" FOR SELECT USING (((created_by = get_my_id()) OR (EXISTS ( SELECT 1
   FROM device_accounts da
  WHERE ((da.device_id = device_registry.device_id) AND (da.account_id = get_my_id()))))));
CREATE POLICY "Users can update their own devices" ON public."device_registry" FOR UPDATE USING ((created_by = get_my_id())) WITH CHECK ((created_by = get_my_id()));
CREATE POLICY "direct_conversations_read" ON public."direct_conversations" FOR SELECT TO authenticated USING (((get_my_id() = user1_id) OR (get_my_id() = user2_id)));
CREATE POLICY "Users cannot message blocked users" ON public."direct_messages" FOR INSERT WITH CHECK ((NOT (EXISTS ( SELECT 1
   FROM user_blocks
  WHERE (((user_blocks.blocker_id = auth.uid()) AND (user_blocks.blocked_id = ( SELECT direct_conversations.user1_id
           FROM direct_conversations
          WHERE (direct_conversations.id = direct_messages.conversation_id)
        UNION
         SELECT direct_conversations.user2_id
           FROM direct_conversations
          WHERE (direct_conversations.id = direct_messages.conversation_id)))) OR ((user_blocks.blocker_id = ( SELECT direct_conversations.user1_id
           FROM direct_conversations
          WHERE (direct_conversations.id = direct_messages.conversation_id)
        UNION
         SELECT direct_conversations.user2_id
           FROM direct_conversations
          WHERE (direct_conversations.id = direct_messages.conversation_id))) AND (user_blocks.blocked_id = auth.uid())))))));
CREATE POLICY "direct_messages_insert" ON public."direct_messages" FOR INSERT TO authenticated WITH CHECK (((author_id = get_my_id()) AND (EXISTS ( SELECT 1
   FROM direct_conversations c
  WHERE ((c.id = direct_messages.conversation_id) AND ((get_my_id() = c.user1_id) OR (get_my_id() = c.user2_id)) AND (NOT (EXISTS ( SELECT 1
           FROM user_blocks b
          WHERE ((b.blocker_id =
                CASE
                    WHEN (c.user1_id = get_my_id()) THEN c.user2_id
                    ELSE c.user1_id
                END) AND (b.blocked_id = get_my_id()))))))))));
CREATE POLICY "direct_messages_read" ON public."direct_messages" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM direct_conversations c
  WHERE ((c.id = direct_messages.conversation_id) AND ((get_my_id() = c.user1_id) OR (get_my_id() = c.user2_id))))));
CREATE POLICY "Public read access for districts" ON public."districts" FOR SELECT USING (true);
CREATE POLICY "Public edges are viewable by everyone" ON public."edges" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can read school climate" ON public."edu_school_climate" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to school contacts" ON public."edu_school_contacts" FOR SELECT USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Allow public read access to school contacts" ON public."edu_school_contacts" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create pulse logs" ON public."edu_school_pulse_logs" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow public read access to school stats" ON public."edu_school_registry_stats" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to schooling factual data" ON public."edu_schools" FOR SELECT USING (true);
CREATE POLICY "Users can manage their own energy forecasts" ON public."energy_forecasts" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can insert own usage logs" ON public."feature_usage_log" FOR INSERT TO authenticated WITH CHECK ((user_id = COALESCE(get_my_id(), auth.uid())));
CREATE POLICY "Users can view own usage logs" ON public."feature_usage_log" FOR SELECT TO authenticated USING ((user_id = COALESCE(get_my_id(), auth.uid())));
CREATE POLICY "financial_transactions_platform_admin" ON public."financial_transactions" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "Users can manage their own fire journal" ON public."fire_journal" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "fire_journal_privacy" ON public."fire_journal" FOR ALL TO authenticated USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "Anyone can submit a response" ON public."form_responses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM form_templates
  WHERE ((form_templates.id = form_responses.template_id) AND (form_templates.is_published = true)))));
CREATE POLICY "Owners can see responses to their templates" ON public."form_responses" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM form_templates
  WHERE ((form_templates.id = form_responses.template_id) AND (form_templates.owner_id = auth.uid())))));
CREATE POLICY "Public can read published templates" ON public."form_templates" FOR SELECT USING ((is_published = true));
CREATE POLICY "Users can manage their own templates" ON public."form_templates" FOR ALL TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));
CREATE POLICY "Public Read Access" ON public."geo_datasets" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON public."geo_districts" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON public."geo_ds_divisions" FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public."geo_features" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON public."geo_gn_divisions" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON public."geo_postal_towns" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geo metadata" ON public."geo_provinces" FOR SELECT USING (true);
CREATE POLICY "Users can see their redeemed gift codes" ON public."gift_codes" FOR SELECT TO authenticated USING ((get_my_id() = redeemed_by));
CREATE POLICY "Grade heads can manage grades" ON public."grade_levels" FOR ALL TO authenticated USING ((grade_head_id = get_my_id())) WITH CHECK ((grade_head_id = get_my_id()));
CREATE POLICY "School leaders can create grades" ON public."grade_levels" FOR INSERT WITH CHECK ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity_in_school('grade_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can delete grades" ON public."grade_levels" FOR DELETE USING ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can update grades" ON public."grade_levels" FOR UPDATE USING ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity_in_school('grade_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text))) WITH CHECK ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity_in_school('grade_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School members can view grades" ON public."grade_levels" FOR SELECT USING ((has_capacity_in_school('student'::text, school_id) OR has_capacity_in_school('teacher'::text, school_id) OR has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity_in_school('grade_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "Users can manage their own gratitude entries" ON public."gratitude_entries" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can view their own received gifts" ON public."gratitude_gifts" FOR SELECT TO authenticated USING ((recipient_user_id = get_my_id()));
CREATE POLICY "group_messages_member_insert" ON public."group_messages" FOR INSERT WITH CHECK (((author_id = get_my_id()) AND (EXISTS ( SELECT 1
   FROM community_group_members m
  WHERE ((m.group_id = group_messages.group_id) AND (m.user_id = get_my_id()) AND (m.status = 'active'::text))))));
CREATE POLICY "group_messages_member_read" ON public."group_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM community_group_members m
  WHERE ((m.group_id = group_messages.group_id) AND (m.user_id = get_my_id()) AND (m.status = 'active'::text)))));
CREATE POLICY "group_messages_own_delete" ON public."group_messages" FOR DELETE TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "Authors can see their reports" ON public."group_reports" FOR SELECT TO authenticated USING ((get_my_id() = reporter_id));
CREATE POLICY "Users can view their own growth events" ON public."growth_events" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can insert impact ripples" ON public."impact_ripples" FOR INSERT TO authenticated WITH CHECK ((get_my_id() = actor_user_id));
CREATE POLICY "Users can view their own impact ripples" ON public."impact_ripples" FOR SELECT TO authenticated USING (((get_my_id() = recipient_user_id) OR (get_my_id() = actor_user_id)));
CREATE POLICY "calendar_school_read" ON public."institutional_calendar" FOR SELECT TO authenticated USING ((is_public OR (get_my_active_school_id() = school_id)));
CREATE POLICY "inventory_items_school_manage" ON public."inventory_items" FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'SCHOOL'::text) AND (b.entity_id = (inventory_items.school_id)::text) AND (b.capacity = ANY (ARRAY['principal'::text, 'teacher'::text]))))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'SCHOOL'::text) AND (b.entity_id = (inventory_items.school_id)::text) AND (b.capacity = ANY (ARRAY['principal'::text, 'teacher'::text])))))));
CREATE POLICY "inventory_items_school_read" ON public."inventory_items" FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'SCHOOL'::text) AND (b.entity_id = (inventory_items.school_id)::text))))));
CREATE POLICY "Teachers can manage their own requests" ON public."inventory_requests" FOR ALL TO authenticated USING ((get_my_id() = teacher_id));
CREATE POLICY "Invite codes select active" ON public."invite_codes" FOR SELECT TO anon, authenticated USING ((is_active = true));
CREATE POLICY "School leaders can create invite codes" ON public."invite_codes" FOR INSERT WITH CHECK ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can delete invite codes" ON public."invite_codes" FOR DELETE USING ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can update invite codes" ON public."invite_codes" FOR UPDATE USING ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text))) WITH CHECK ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "invoices_customer_or_admin" ON public."invoices" FOR ALL TO authenticated USING (((customer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))))) WITH CHECK (((customer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))));
CREATE POLICY "journal_entries_privacy" ON public."journal_entries" FOR ALL TO authenticated USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "Users can insert their own journeys" ON public."journeys" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own journeys" ON public."journeys" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own journeys" ON public."journeys" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can manage their own joy moments" ON public."joy_moments" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "ledger_entries_platform_admin" ON public."ledger_entries" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "Classroom members can view materials" ON public."lesson_materials" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (classrooms c
     LEFT JOIN classroom_students cs ON ((c.id = cs.classroom_id)))
  WHERE ((c.id = lesson_materials.classroom_id) AND ((c.teacher_id = get_my_id()) OR (cs.student_id = get_my_id()))))));
CREATE POLICY "Classroom members can view lessons" ON public."lessons" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (classrooms c
     LEFT JOIN classroom_students cs ON ((c.id = cs.classroom_id)))
  WHERE ((c.id = lessons.classroom_id) AND ((c.teacher_id = get_my_id()) OR (cs.student_id = get_my_id()))))));
CREATE POLICY "library_entity_versions_select_visible_entity" ON public."library_entity_versions" FOR SELECT TO authenticated USING (((entity_type = 'node'::text) AND ((COALESCE(((snapshot -> 'after'::text) ->> 'visibility'::text), ((snapshot -> 'before'::text) ->> 'visibility'::text), (snapshot ->> 'visibility'::text)) = 'public'::text) OR ((COALESCE(((snapshot -> 'after'::text) ->> 'creator_id'::text), ((snapshot -> 'before'::text) ->> 'creator_id'::text), (snapshot ->> 'creator_id'::text)))::uuid = get_my_id()) OR (((COALESCE(((snapshot -> 'after'::text) ->> 'school_id'::text), ((snapshot -> 'before'::text) ->> 'school_id'::text), (snapshot ->> 'school_id'::text)))::uuid = get_my_active_school_id()) AND (COALESCE(((snapshot -> 'after'::text) ->> 'visibility'::text), ((snapshot -> 'before'::text) ->> 'visibility'::text), (snapshot ->> 'visibility'::text)) = ANY (ARRAY['school'::text, 'shared'::text, 'class'::text, 'grade'::text]))))));
CREATE POLICY "Users can endorse manifestos in their school" ON public."manifesto_endorsements" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM sanctuary_manifestos m
  WHERE ((m.id = manifesto_endorsements.manifesto_id) AND (m.school_id = get_my_active_school_id())))));
CREATE POLICY "Users can view endorsements in their school" ON public."manifesto_endorsements" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM sanctuary_manifestos m
  WHERE ((m.id = manifesto_endorsements.manifesto_id) AND (m.school_id = get_my_active_school_id())))));
CREATE POLICY "Public can view map layers" ON public."map_layers" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners can manage their own topologies" ON public."mapping_topologies" FOR ALL USING ((auth.uid() = owner_id));
CREATE POLICY "Public can view public or shared topologies" ON public."mapping_topologies" FOR SELECT USING (((is_public = true) OR (share_token IS NOT NULL)));
CREATE POLICY "Users can manage their own mood logs" ON public."mood_logs" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "mood_logs_privacy" ON public."mood_logs" FOR ALL TO authenticated USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "Public node_tags are viewable by everyone" ON public."node_tags" FOR SELECT USING (true);
CREATE POLICY "Public library nodes are viewable by everyone" ON public."nodes" FOR SELECT TO anon, authenticated USING (((visibility = 'public'::text) OR (verified = true)));
CREATE POLICY "nodes_community_insert" ON public."nodes" FOR INSERT TO authenticated WITH CHECK ((creator_id = auth.uid()));
CREATE POLICY "nodes_creator_read_own" ON public."nodes" FOR SELECT TO authenticated USING ((creator_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON public."notifications" FOR UPDATE TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can view own notifications" ON public."notifications" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "payment_intents_platform_admin" ON public."payment_intents" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "Users can read their own permission snapshots" ON public."permission_snapshots" FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "personal_classrooms_owner_access" ON public."personal_classrooms" FOR ALL USING ((auth.uid() = user_id));
CREATE POLICY "Users manage their own compasses" ON public."personal_compasses" FOR ALL TO authenticated USING ((user_id = get_my_id()));
CREATE POLICY "Authenticated users can read policy version" ON public."policy_version" FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing_manifest_admin_delete" ON public."pricing_manifest" FOR DELETE USING ((auth.role() = 'service_role'::text));
CREATE POLICY "pricing_manifest_admin_insert" ON public."pricing_manifest" FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));
CREATE POLICY "pricing_manifest_admin_update" ON public."pricing_manifest" FOR UPDATE USING ((auth.role() = 'service_role'::text));
CREATE POLICY "pricing_manifest_select" ON public."pricing_manifest" FOR SELECT USING (true);
CREATE POLICY "Principal governance same-school read" ON public."principal_governance_events" FOR SELECT TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "Founders can view their principal's history" ON public."principal_governance_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM school_memberships
  WHERE ((school_memberships.school_id = principal_governance_records.school_id) AND (school_memberships.user_id = auth.uid()) AND (school_memberships.role = ANY (ARRAY['Founder'::text, 'Admin'::text]))))));
CREATE POLICY "Principals can view their own history" ON public."principal_governance_records" FOR SELECT USING ((auth.uid() = principal_id));
CREATE POLICY "principal_notes_delete" ON public."principal_notes" FOR DELETE TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "principal_notes_insert" ON public."principal_notes" FOR INSERT TO authenticated WITH CHECK ((author_id = get_my_id()));
CREATE POLICY "principal_notes_own_read" ON public."principal_notes" FOR SELECT TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "principal_notes_update" ON public."principal_notes" FOR UPDATE TO authenticated USING ((author_id = get_my_id()));
CREATE POLICY "observations_principal_own" ON public."principal_observations" FOR ALL TO authenticated USING (((get_my_id() = principal_id) AND (get_my_active_school_id() = school_id)));
CREATE POLICY "Users can view their own profile" ON public."principal_profiles" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "privacy_ledger_insert_own" ON public."privacy_ledger_entries" FOR INSERT TO authenticated WITH CHECK ((get_my_id() = user_id));
CREATE POLICY "privacy_ledger_read_own" ON public."privacy_ledger_entries" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "pro_gifts_platform_admin" ON public."pro_gifts" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "Users can manage their own profile completion" ON public."profile_completion" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Public read access for provinces" ON public."provinces" FOR SELECT USING (true);
CREATE POLICY "Public can read marketing stats" ON public."public_site_stats" FOR SELECT TO anon USING (true);
CREATE POLICY "receipts_platform_admin" ON public."receipts" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "Users can manage their own reminders" ON public."reminders" FOR ALL USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "Users can manage own resource engagements" ON public."resource_engagements" FOR ALL TO authenticated USING ((user_id = get_my_id()));
CREATE POLICY "Users can view manifestos in their school" ON public."sanctuary_manifestos" FOR SELECT TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "Users can view own school requests" ON public."school_join_requests" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Anyone in school can view school legacy" ON public."school_legacy_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM school_memberships
  WHERE ((school_memberships.school_id = school_legacy_records.school_id) AND (school_memberships.user_id = auth.uid())))));
CREATE POLICY "Users can view their own memberships" ON public."school_memberships" FOR SELECT USING ((user_id = auth.uid()));
CREATE POLICY "Owners can update school registry claims" ON public."school_registry_claims" FOR UPDATE USING (((auth.uid() = requested_by) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_id = (school_registry_claims.school_id)::text) AND (b.capacity = ANY (ARRAY['principal'::text, 'section_head'::text]))))) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text))) WITH CHECK (((auth.uid() = requested_by) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_id = (school_registry_claims.school_id)::text) AND (b.capacity = ANY (ARRAY['principal'::text, 'section_head'::text]))))) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text)));
CREATE POLICY "Users can create their school registry claims" ON public."school_registry_claims" FOR INSERT WITH CHECK ((auth.uid() = requested_by));
CREATE POLICY "Users can read their school registry claims" ON public."school_registry_claims" FOR SELECT USING (((auth.uid() = requested_by) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_id = (school_registry_claims.school_id)::text) AND (b.capacity = ANY (ARRAY['principal'::text, 'section_head'::text]))))) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text)));
CREATE POLICY "Allow public read access to school registry" ON public."school_registry_legacy" FOR SELECT USING (true);
CREATE POLICY "School leaders can delete schools" ON public."schools" FOR DELETE USING (((created_by = auth.uid()) OR has_capacity_in_school('principal'::text, id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can update schools" ON public."schools" FOR UPDATE USING (((created_by = auth.uid()) OR has_capacity_in_school('principal'::text, id) OR has_capacity_in_school('section_head'::text, id) OR has_capacity('admin'::text, 'GLOBAL'::text))) WITH CHECK (((created_by = auth.uid()) OR has_capacity_in_school('principal'::text, id) OR has_capacity_in_school('section_head'::text, id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "Users can create a school" ON public."schools" FOR INSERT TO authenticated WITH CHECK ((created_by = auth.uid()));
CREATE POLICY "Users can view their own school" ON public."schools" FOR SELECT USING (((id = get_my_active_school_id()) OR (created_by = auth.uid()) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can create sections" ON public."sections" FOR INSERT WITH CHECK ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can delete sections" ON public."sections" FOR DELETE USING ((has_capacity_in_school('principal'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School leaders can update sections" ON public."sections" FOR UPDATE USING ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text))) WITH CHECK ((has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "School members can view sections" ON public."sections" FOR SELECT USING ((has_capacity_in_school('student'::text, school_id) OR has_capacity_in_school('teacher'::text, school_id) OR has_capacity_in_school('principal'::text, school_id) OR has_capacity_in_school('section_head'::text, school_id) OR has_capacity('admin'::text, 'GLOBAL'::text)));
CREATE POLICY "Users can insert their own security logs" ON public."security_audit_logs" FOR INSERT WITH CHECK ((account_id = get_my_id()));
CREATE POLICY "Users can view their own security logs" ON public."security_audit_logs" FOR SELECT USING ((account_id = get_my_id()));
CREATE POLICY "sentinel_audit_logs_platform_admin" ON public."sentinel_audit_logs" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = auth.uid()) AND (b.entity_type = 'PLATFORM'::text) AND (b.capacity = 'admin'::text)))));
CREATE POLICY "Users can manage their own sleep logs" ON public."sleep_logs" FOR ALL TO authenticated USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "Users can insert their own snapshots" ON public."snapshot_moments" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view their own snapshots" ON public."snapshot_moments" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own attendance" ON public."staff_attendance" FOR SELECT TO authenticated USING ((user_id = get_my_id()));
CREATE POLICY "Users can manage their own leave requests" ON public."staff_leaves" FOR ALL TO authenticated USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "authenticated can access staging" ON public."staging" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sar_staff_read_school" ON public."student_academic_records" FOR SELECT TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "sar_staff_update" ON public."student_academic_records" FOR UPDATE TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "sar_staff_write" ON public."student_academic_records" FOR INSERT TO authenticated WITH CHECK ((get_my_active_school_id() = school_id));
CREATE POLICY "sar_student_read_own" ON public."student_academic_records" FOR SELECT TO authenticated USING ((student_id = get_my_id()));
CREATE POLICY "Students can view their own grades" ON public."student_grades" FOR SELECT TO authenticated USING ((get_my_id() = student_id));
CREATE POLICY "Teachers can manage grades in their classrooms" ON public."student_grades" FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM classrooms
  WHERE ((classrooms.id = student_grades.classroom_id) AND (classrooms.teacher_id = get_my_id())))));
CREATE POLICY "guardians_self_manage" ON public."student_guardian_relationships" FOR ALL USING ((auth.uid() = guardian_id));
CREATE POLICY "students_see_guardians" ON public."student_guardian_relationships" FOR SELECT USING ((auth.uid() = student_id));
CREATE POLICY "Student longitudinal self or elevated read" ON public."student_longitudinal_events" FOR SELECT TO authenticated USING (((student_id = get_my_id()) OR (EXISTS ( SELECT 1
   FROM student_guardian_relationships sgr
  WHERE ((sgr.student_id = student_longitudinal_events.student_id) AND (sgr.guardian_id = get_my_id())))) OR (EXISTS ( SELECT 1
   FROM bonds b
  WHERE ((b.user_id = get_my_id()) AND (b.entity_id = (student_longitudinal_events.school_id)::text) AND (b.capacity = ANY (ARRAY['principal'::text, 'section_head'::text, 'grade_head'::text, 'teacher'::text]))))) OR has_capacity('admin'::text)));
CREATE POLICY "Students can view their own analyses" ON public."student_potential_analysis" FOR SELECT USING ((auth.uid() = student_id));
CREATE POLICY "Teachers can manage their own analyses" ON public."student_potential_analysis" FOR ALL USING ((auth.uid() = teacher_id)) WITH CHECK ((auth.uid() = teacher_id));
CREATE POLICY "Students can view own profile" ON public."student_profiles" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own student profile" ON public."student_profiles" FOR SELECT USING (((get_my_id() = user_id) OR has_capacity('admin'::text) OR (EXISTS ( SELECT 1
   FROM (bonds b
     JOIN users u ON ((u.id = student_profiles.user_id)))
  WHERE ((b.user_id = get_my_id()) AND (b.entity_id = (u.school_id)::text) AND (b.capacity = ANY (ARRAY['principal'::text, 'teacher'::text, 'section_head'::text, 'grade_head'::text])))))));
CREATE POLICY "manage_grants" ON public."student_record_access_grants" FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM users student
  WHERE ((student.id = student_record_access_grants.student_id) AND has_capacity_in_school('principal'::text, student.school_id)))) OR (EXISTS ( SELECT 1
   FROM student_guardian_relationships sgr
  WHERE ((sgr.student_id = student_record_access_grants.student_id) AND (sgr.guardian_id = get_my_id())))) OR (student_id = get_my_id()) OR has_capacity('admin'::text)));
CREATE POLICY "students_teacher_policy" ON public."students" FOR ALL TO authenticated USING ((classroom_id IN ( SELECT classrooms.id
   FROM classrooms
  WHERE (classrooms.teacher_id = get_my_id()))));
CREATE POLICY "Students can create submissions" ON public."submissions" FOR INSERT TO authenticated WITH CHECK ((student_id = get_my_id()));
CREATE POLICY "Students can read their own submissions" ON public."submissions" FOR SELECT TO authenticated USING ((student_id = get_my_id()));
CREATE POLICY "Teachers can grade submissions in their classrooms" ON public."submissions" FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (assignments a
     JOIN classrooms c ON ((c.id = a.classroom_id)))
  WHERE ((a.id = submissions.assignment_id) AND (c.teacher_id = get_my_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (assignments a
     JOIN classrooms c ON ((c.id = a.classroom_id)))
  WHERE ((a.id = submissions.assignment_id) AND (c.teacher_id = get_my_id())))));
CREATE POLICY "Teachers can read submissions in their classrooms" ON public."submissions" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (assignments a
     JOIN classrooms c ON ((c.id = a.classroom_id)))
  WHERE ((a.id = submissions.assignment_id) AND (c.teacher_id = get_my_id())))));
CREATE POLICY "Users can view their own subscriptions" ON public."subscriptions" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Public tags are viewable by everyone" ON public."tags" FOR SELECT USING (true);
CREATE POLICY "Teacher insight lifecycle private-aware read" ON public."teacher_insight_events" FOR SELECT TO authenticated USING ((get_my_active_school_id() = school_id));
CREATE POLICY "School staff can view relevant history" ON public."teacher_professional_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM school_memberships
  WHERE ((school_memberships.school_id = teacher_professional_records.school_id) AND (school_memberships.user_id = auth.uid()) AND (school_memberships.role = ANY (ARRAY['Principal'::text, 'Admin'::text, 'Founder'::text]))))));
CREATE POLICY "Teachers can view their own history" ON public."teacher_professional_records" FOR SELECT USING ((auth.uid() = teacher_id));
CREATE POLICY "Principals can view staff profiles" ON public."teacher_profiles" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM principal_profiles pp
  WHERE ((pp.user_id = auth.uid()) AND (pp.school_id = teacher_profiles.school_id) AND (pp.deleted_at IS NULL)))));
CREATE POLICY "Teachers can view own profile" ON public."teacher_profiles" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own teacher profile" ON public."teacher_profiles" FOR SELECT USING (((get_my_id() = user_id) OR has_capacity('admin'::text) OR has_capacity_in_school('principal'::text, school_id)));
CREATE POLICY "Users can view their own summaries" ON public."temporal_summaries" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "anyone_reads_unclaimed" ON public."thuthimal_gifts" FOR SELECT TO authenticated USING ((claimed = false));
CREATE POLICY "gifter_creates_gift" ON public."thuthimal_gifts" FOR INSERT TO authenticated WITH CHECK ((gifter_id = get_my_id()));
CREATE POLICY "gifter_reads_own_gifts" ON public."thuthimal_gifts" FOR SELECT TO authenticated USING ((gifter_id = get_my_id()));
CREATE POLICY "Users manage own timetable" ON public."timetable" FOR ALL TO authenticated USING ((user_id = get_my_id()));
CREATE POLICY "user_blocks_delete_own" ON public."user_blocks" FOR DELETE TO authenticated USING ((get_my_id() = blocker_id));
CREATE POLICY "user_blocks_insert_own" ON public."user_blocks" FOR INSERT TO authenticated WITH CHECK ((get_my_id() = blocker_id));
CREATE POLICY "user_blocks_read_own" ON public."user_blocks" FOR SELECT TO authenticated USING ((get_my_id() = blocker_id));
CREATE POLICY "user_entitlement_grants_select" ON public."user_entitlement_grants" FOR SELECT USING (((auth.uid() = user_id) OR (auth.role() = 'service_role'::text)));
CREATE POLICY "user_entitlement_grants_service_write" ON public."user_entitlement_grants" FOR ALL USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));
CREATE POLICY "Users can manage their own growth state" ON public."user_growth_state" FOR ALL TO authenticated USING ((get_my_id() = user_id)) WITH CHECK ((get_my_id() = user_id));
CREATE POLICY "Users can view their own growth state" ON public."user_growth_state" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can read own growth history" ON public."user_growth_state_versions" FOR SELECT TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY "Users can manage their own preferences" ON public."user_preferences" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Service role can manage all push tokens" ON public."user_push_tokens" FOR ALL TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text)) WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));
CREATE POLICY "Users can manage their own push tokens" ON public."user_push_tokens" FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Anon can manage own rewards" ON public."user_rewards" FOR ALL TO anon USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "Service role manages rewards" ON public."user_rewards" FOR ALL TO service_role USING (true);
CREATE POLICY "Users can insert own rewards" ON public."user_rewards" FOR INSERT TO authenticated WITH CHECK ((user_id = COALESCE(get_my_id(), auth.uid())));
CREATE POLICY "Users can manage own rewards" ON public."user_rewards" FOR ALL TO authenticated USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "Users can update own rewards" ON public."user_rewards" FOR UPDATE TO authenticated USING ((user_id = COALESCE(get_my_id(), auth.uid()))) WITH CHECK ((user_id = COALESCE(get_my_id(), auth.uid())));
CREATE POLICY "Users can view own rewards" ON public."user_rewards" FOR SELECT TO authenticated USING ((user_id = COALESCE(get_my_id(), auth.uid())));
CREATE POLICY "Users can read own rewards history" ON public."user_rewards_versions" FOR SELECT TO authenticated USING ((user_id = COALESCE(get_my_id(), auth.uid())));
CREATE POLICY "Anyone can view public social links" ON public."user_social_links" FOR SELECT TO authenticated USING (((is_public = true) OR (user_id = get_my_id())));
CREATE POLICY "Users can manage their own social links" ON public."user_social_links" FOR ALL TO authenticated USING ((user_id = get_my_id())) WITH CHECK ((user_id = get_my_id()));
CREATE POLICY "user_self_social_access" ON public."user_social_state" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete own workspace layouts" ON public."user_workspace_layouts" FOR DELETE TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY "Users can insert own workspace layouts" ON public."user_workspace_layouts" FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Users can read own workspace layouts" ON public."user_workspace_layouts" FOR SELECT TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY "Users can update own workspace layouts" ON public."user_workspace_layouts" FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Allow anon to insert their own profile" ON public."users" FOR INSERT TO anon WITH CHECK ((get_my_id() = id));
CREATE POLICY "Users can update safe profile fields" ON public."users" FOR UPDATE TO authenticated USING ((id = get_my_id())) WITH CHECK (((id = get_my_id()) AND (NOT (capacity IS DISTINCT FROM ( SELECT users_1.capacity
   FROM users users_1
  WHERE (users_1.id = get_my_id())))) AND (NOT (school_id IS DISTINCT FROM ( SELECT users_1.school_id
   FROM users users_1
  WHERE (users_1.id = get_my_id())))) AND (NOT (pricing_tier IS DISTINCT FROM ( SELECT users_1.pricing_tier
   FROM users users_1
  WHERE (users_1.id = get_my_id())))) AND (NOT (is_thuthimal IS DISTINCT FROM ( SELECT users_1.is_thuthimal
   FROM users users_1
  WHERE (users_1.id = get_my_id()))))));
CREATE POLICY "Users can update their own profile" ON public."users" FOR UPDATE TO authenticated USING ((get_my_id() = id));
CREATE POLICY "Users can view their own profile" ON public."users" FOR SELECT TO authenticated USING ((get_my_id() = id));
CREATE POLICY "user_insert_own" ON public."users" FOR INSERT TO anon, authenticated WITH CHECK ((id = get_my_id()));
CREATE POLICY "user_select_own" ON public."users" FOR SELECT TO anon, authenticated USING ((id = get_my_id()));
CREATE POLICY "user_update_own" ON public."users" FOR UPDATE TO anon, authenticated USING ((id = get_my_id())) WITH CHECK ((id = get_my_id()));
CREATE POLICY "Users can manage their own whispered moments" ON public."whispered_moments" FOR ALL TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can view their own whispered moments" ON public."whispered_moments" FOR SELECT TO authenticated USING ((get_my_id() = user_id));
CREATE POLICY "Users can manage their own wisdom notes" ON public."wisdom_notes" FOR ALL TO authenticated USING ((get_my_id() = user_id));

-- ─── Enable RLS ───
ALTER TABLE public."academic_cycles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ai_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."auth_identities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."bonds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."calendar_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classroom_grading_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classroom_join_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classroom_legacy_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classroom_note_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classroom_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classroom_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classroom_students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."classrooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."collection_node_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."collection_nodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."collections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_entity_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_group_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_poll_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_profile_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_reactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."community_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."contextual_challenges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."contextual_moments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."conversation_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."daily_content" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."daily_prep_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."device_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."device_registry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."direct_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."direct_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."districts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."edges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."edu_school_climate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."edu_school_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."edu_school_pulse_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."edu_school_registry_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."edu_schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."energy_forecasts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."feature_usage_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."financial_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."fire_journal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."form_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."form_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."geo_datasets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."geo_districts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."geo_ds_divisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."geo_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."geo_gn_divisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."geo_postal_towns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."geo_provinces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."gift_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."grade_levels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."gratitude_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."gratitude_gifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."group_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."group_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."growth_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."impact_ripples" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."institutional_calendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."inventory_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."invite_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."journal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."journeys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."joy_moments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ledger_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."lesson_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."library_entity_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."manifesto_endorsements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."map_layers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mapping_topologies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mood_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."node_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."nodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."payment_intents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."permission_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."personal_classrooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."personal_compasses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."policy_version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."pricing_manifest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."principal_governance_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."principal_governance_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."principal_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."principal_observations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."principal_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."privacy_ledger_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."pro_gifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."profile_completion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."provinces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."public_site_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."receipts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."relief_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."reminders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."resource_engagements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sanctuary_manifestos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."school_forest_state" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."school_join_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."school_legacy_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."school_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."school_registry_claims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."school_registry_legacy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."security_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sentinel_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sleep_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."snapshot_moments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."staff_attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."staff_leaves" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."staging" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."student_academic_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."student_grades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."student_guardian_relationships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."student_longitudinal_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."student_potential_analysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."student_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."student_record_access_grants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."teacher_insight_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."teacher_professional_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."teacher_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."temporal_summaries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."thuthimal_gifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."timetable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_entitlement_grants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_growth_state" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_growth_state_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_profile_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_push_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_rewards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_rewards_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_social_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_social_state" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_workspace_layouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."whispered_moments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."wisdom_notes" ENABLE ROW LEVEL SECURITY;
