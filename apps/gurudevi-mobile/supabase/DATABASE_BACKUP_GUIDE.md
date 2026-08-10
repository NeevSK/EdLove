# Supabase Database Schema Backup Guide

This guide documents the lightweight database schema backup procedure that extracts the full DDL configuration from the linked Supabase database without requiring local Docker Desktop or standard `pg_dump` binary installations.

---

## 🛠️ The Lightweight Backup Script

We use a custom script located at `scripts/backup-db-schema.mjs` that runs natively over the Supabase CLI query mechanism:

```bash
cd apps/gurudevi-mobile
node scripts/backup-db-schema.mjs
```

### Why this exists
- Standard `supabase db dump` commands require Docker Desktop running locally to host the `pg_dump` tools.
- Direct `pg_dump` commands require the PostgreSQL command-line tools to be installed and added to your system's PATH.
- This script uses `supabase db query --linked` under the hood to introspect PostgreSQL `pg_catalog` and `information_schema` views directly, generating an aligned, complete DDL schema dump file.

---

## 📂 Backup Output

The script saves the generated schema backup to:
- **Path**: `supabase/backups/remote_schema_backup.sql`
- **Scope**: Recreates all structure definitions inside the `public` schema.

### Recreated Database Objects:
1. **Extensions**: Saves and enables all enabled extensions (e.g., `postgis`, `uuid-ossp`, etc.).
2. **Custom Types / Enums**: Dumps enum type names and values.
3. **User Functions**: Exports triggers and database functions safely (excluding standard aggregates to prevent syntax conflicts).
4. **Tables & Columns**: Maps all tables, column types, default values, and nullability constraints.
5. **Constraints**: Maps primary keys, foreign keys, and unique checks.
6. **Views**: Extracts view SQL queries.
7. **Indexes**: Maps custom indexes.
8. **Triggers**: Recreates triggers.
9. **Row-Level Security (RLS) Policies**: Extracts policy names, targets (authenticated/anon/service role), query logic, and checks.
10. **RLS Activation**: Adds statements to enable RLS on appropriate tables.

---

## 🚀 Future Baseline Usage

In the future, you can use this schema dump as a **Master Baseline** for a local environment setup:

1. **Local Initialization**:
   If starting a new local container or environment, you can feed this backup to the local instance as a migration or seed script.
2. **Replacing Current Baseline**:
   If the existing `20260211170000_master_baseline.sql` needs to be updated with the current state of production/staging, you can copy the contents of `supabase/backups/remote_schema_backup.sql` to serve as the new master baseline file in the migrations folder.

---

*Created: August 10, 2026*
