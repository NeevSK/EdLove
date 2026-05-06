-- Purge Legacy RBAC Columns
-- Phase: ReBAC Finalization
-- Description: Drops the legacy 'authority' and 'role' columns from the 'users' table.
-- WARNING: Ensure that the IdentityManager and appropriate adapters are deployed and active before running this.

ALTER TABLE "public"."users" 
DROP COLUMN IF EXISTS "authority",
DROP COLUMN IF EXISTS "school_role",
DROP COLUMN IF EXISTS "role";

-- Note: In the Sovereign ReBAC model, these concepts are now managed via the 'bonds' system.
-- Currently, bonds are resolved dynamically from entity-specific tables (school_staff, etc.) 
-- or a dedicated 'bonds' table if implemented in the next phase.
