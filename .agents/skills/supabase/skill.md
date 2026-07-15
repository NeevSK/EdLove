---
name: supabase
description: Use when the user needs help with Supabase and no Supabase MCP is available. Covers docs-first help for schema changes, SQL migrations, RLS policies, auth, generated types, Edge Functions, local CLI workflows, and hosted project operations grounded in official Supabase docs and the repo's existing `supabase/` files.
---

# Supabase (Docs-first, no MCP)

## Overview

Use this skill to work on Supabase-backed projects without MCP by combining local repo inspection, the Supabase CLI, and official Supabase documentation. Prefer deterministic file changes and CLI workflows over dashboard-only guidance whenever the repo already contains a `supabase/` directory or migrations.

## When to use it

Trigger this skill when the user asks to:

- add or fix Supabase SQL migrations
- write or review RLS policies
- debug auth, storage, or database access issues
- generate or update Supabase types
- create or modify Edge Functions
- link or deploy to a hosted Supabase project
- answer "how do I do this in Supabase?" using official docs

## Workflow

### 1) Inspect local Supabase structure first

Start by checking which of these exist:

- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/seed.sql`
- `supabase/functions/`
- app code that creates Supabase clients
- env vars such as `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Match the existing project conventions before adding new files or commands.

### 2) Prefer safe, file-backed changes

Default to:

- SQL migration files instead of dashboard edits
- repo-local config instead of ad hoc one-off commands
- least-privilege changes for auth and RLS
- local validation before remote deploys when practical

Avoid destructive operations unless the user explicitly asks for them. Call out risk before commands such as dropping schemas, resetting remote data, or overwriting generated files used outside the requested scope.

### 3) Use official docs when product behavior may vary

When behavior, flags, limits, or APIs may have changed, browse only official Supabase documentation and release notes. Use the docs to confirm:

- current CLI commands and flags
- Management API behavior
- auth, storage, and Edge Function product details
- recommended RLS and security patterns

Load `references/official-docs.md` for the fastest routing to the right docs section.

### 4) Use the helper scripts as a two-tier toolkit

This skill now uses a two-tier helper model:

- `scripts/inspect_supabase_project.py`: main entrypoint for quick repo or monorepo discovery
- `scripts/audit_supabase_workspace.py`: deeper read-only audit for migration/function structure and risk signals

Use the inspector first, then run the audit when you need a more opinionated summary of what looks risky, duplicated, or operationally complex.

#### Main inspector

Use `scripts/inspect_supabase_project.py` for a quick, repeatable scan before making changes. It reports:

- all detected Supabase workspaces under the scan root
- config, seed, migration, archive, and Edge Function locations per workspace
- likely Supabase env vars present in the current shell
- `.env*` files that reference Supabase keys
- likely generated type files
- app files that create Supabase clients
- operational docs/scripts living beside each `supabase/` directory

Run:

```bash
python scripts/inspect_supabase_project.py .
python scripts/inspect_supabase_project.py . --json
python scripts/inspect_supabase_project.py apps/gurudevi-mobile
```

Prefer this over ad hoc manual searching when you need a fast project inventory. It does not call external services and does not print secret values.

#### Workspace audit

Use `scripts/audit_supabase_workspace.py` when you need a deeper local audit of the detected workspaces. It reports:

- migration counts and duplicate slugs
- near-duplicate migration names
- archived and legacy migration directories
- Edge Function inventory plus shared `deno.json` / `import_map.json`
- env var references inside function `index.ts` files
- operational docs/scripts beside `supabase/`

Run:

```bash
python scripts/audit_supabase_workspace.py .
python scripts/audit_supabase_workspace.py . --json
python scripts/audit_supabase_workspace.py apps/gurudevi-mobile
```

Use this when the project has many migrations, legacy folders, or multiple operational scripts and you want a fast read-only audit before changing anything.

## Common task patterns

### Schema and migrations

- Prefer `supabase migration new <name>` for schema changes that should persist in the repo.
- Put DDL, policy changes, triggers, and seed-adjacent setup in migrations instead of manual dashboard instructions.
- Review earlier migrations before adding a new one so names, helper functions, and policy patterns stay consistent.
- If the user asks to sync local and remote state, explain whether the correct next step is `db diff`, `db push`, `migration up`, or a new migration.

### Local development

Use the CLI for local workflows when the project already uses it. Common commands:

```bash
supabase start
supabase db reset
supabase gen types typescript --local
```

- `supabase db reset` is destructive for the local database; warn before running it.
- If Docker or the CLI is missing, say so briefly and continue with file-only changes where possible.

### Hosted project workflows

Use hosted operations only when the user has access configured locally. Common env vars and inputs:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- project ref from `supabase link --project-ref ...`

Typical commands:

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked
```

- Never ask the user to paste secrets into chat if they can set them locally.
- Never print service-role keys or access tokens back to the user.

### RLS and auth

For policy work:

- inspect table ownership, existing policies, helper functions, and auth usage first
- prefer explicit `to authenticated` / `to anon` scope where appropriate
- use `auth.uid()` / JWT claim helpers only when they match the project's access model
- check whether server code uses the service role, because that bypasses RLS

If changing auth flows, inspect both the database policy layer and the app code that creates browser/server/admin clients.

### Edge Functions

When working on `supabase/functions/*`:

- follow the repo's existing Deno and import conventions
- confirm secrets and environment expectations before deploy
- prefer local serve/test workflows before `supabase functions deploy`
- verify whether the function is intended to run with user JWT context or service credentials

### Type generation

Prefer generated types that match the project setup:

```bash
supabase gen types typescript --local
supabase gen types typescript --linked
```

- update only the expected generated file
- avoid editing generated types by hand unless the user explicitly wants a manual patch

## Guardrails

- Prefer repo inspection first, docs second, guesses never.
- Prefer official Supabase docs over blog posts or third-party tutorials.
- Prefer migrations and committed files over dashboard-only advice.
- Flag destructive or production-affecting commands before running them.
- Keep security-sensitive guidance conservative around RLS, service-role usage, and secret handling.

## References

- `references/official-docs.md`: doc routing for CLI, database, auth, RLS, Edge Functions, Management API, and type generation.
