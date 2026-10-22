-- ==============================================================================
-- Migration: 20261022120000_october_30_data_api_grants.sql
-- Description: Establishes explicit Data API access grants for PostgREST & supabase-js
-- in accordance with the October 30 Supabase breaking change policy.
-- Ensures all existing and future tables, sequences, and routines in the "public" schema
-- have explicit grants for anon, authenticated, and service_role.
-- ==============================================================================

-- 1. Default Privileges for all FUTURE objects created in the public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Explicit Grants for all EXISTING objects in the public schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
