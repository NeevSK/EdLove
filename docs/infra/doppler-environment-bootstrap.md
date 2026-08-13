---
title: "Doppler Environment Bootstrap"
status: "active"
created: 2026-08-12
updated: 2026-08-12
tags: [doppler, environments, staging, production, github-actions]
---

# Doppler Environment Bootstrap

The repository already treats the existing `dev` configuration as development.
The `stg` and `prd` configurations exist, but are intentionally metadata-only
until they receive environment-specific provider values.

## Promotion model

```text
local dev  ->  GitHub development  ->  GitHub preview/stg  ->  GitHub production/prd
   dev              dev                    stg                       prd
```

Each environment must have its own Supabase project, database connection, and
deployment credentials. Never copy development credentials into staging or
production: that would cause test data, access scope, and rotation boundaries
to cross environments.

## One-time setup

1. Create or confirm separate Supabase projects for staging and production.
2. Record each environment's URL, publishable key, database URL, and API URL.
3. In Doppler, select project `gurudevi-mobile` and config `stg`; add only the
   staging values required by the contract.
4. Repeat for config `prd` with production values.
5. Create one read-only Doppler service token per config. Do not use a personal
   token in automation.
6. Create GitHub Environments named `development`, `preview`, and `production`.
   Store the matching service token as `DOPPLER_TOKEN` in each environment.
7. Require approval and restrict branches for the `production` environment.

The repository does not guess provider credentials or mutate external projects.
Those values must come from the corresponding Supabase/Cloudflare/EAS/Sentry
accounts and be entered into Doppler by the account owner.

## Safe verification

Run these commands from the repository root. They print secret names and
contract status, never secret values:

```powershell
pnpm env:check:ci
pnpm audit:secrets
```

The CI contract is complete only when all three configurations pass. Until then,
preview and production workflows should remain blocked; this is intentional.

## Rotation and exposure response

If a Doppler token appeared in a diagnostic output, revoke that exact credential
in Doppler immediately, then authenticate the CLI again with a fresh credential.
If it was a GitHub environment service token, replace the environment secret as
well. Re-run the checks above and review Doppler and GitHub audit history.

Do not paste the old token into an issue, commit, chat, or `.env` file.
