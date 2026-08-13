---
title: "Doppler-Centered Engineering Toolchain"
status: "active"
created: 2026-08-12
updated: 2026-08-12
tags: [doppler, secrets, dev, devops, cicd, security]
---

# Doppler-Centered Engineering Toolchain

Doppler is the source of truth for runtime configuration and secrets in this
workspace. The current Doppler project is `gurudevi-mobile`; the repository
contract is recorded in [`config/doppler-secrets.json`](../../config/doppler-secrets.json).
The environment promotion procedure is documented in
[`doppler-environment-bootstrap.md`](doppler-environment-bootstrap.md).

The important boundary is simple:

- public Expo configuration may be bundled into a client build, but is still
  managed and promoted through Doppler;
- private credentials are never placed in `EXPO_PUBLIC_*` variables, app code,
  `.env` files, workflow YAML, or source-control artifacts;
- processes receive configuration through `doppler run`;
- the repository only verifies secret names and required contracts, never values.

## Configuration model

| Use | Doppler config | GitHub environment | Intended access |
| --- | --- | --- | --- |
| Local development | `dev` | — | developer login or personal config clone |
| Pull-request / CI checks | `dev` | `development` | read-only service token |
| Preview / QA | `stg` | `preview` | read-only deployment token |
| Production | `prd` | `production` | protected, read-only deployment token |

Create `stg` and `prd` before enabling preview or production workflows. Do not
reuse a personal Doppler token in CI. Use one scoped service token per config,
stored as the `DOPPLER_TOKEN` secret in the matching GitHub Environment.

Readiness check: `dev` currently satisfies the repository contract; `stg` and
`prd` currently contain only Doppler metadata. Populate them with
environment-specific values through Doppler before relying on preview or
production workflows. Do not copy development credentials into either config.
Run `pnpm env:check:ci` to verify all required names without printing values.

## First-time local setup

Install the Doppler CLI, authenticate, and configure the two scopes that are
most commonly used:

```powershell
winget install Doppler.doppler
doppler login
doppler setup --project gurudevi-mobile --config dev --no-interactive
Set-Location apps/gurudevi-mobile
doppler setup --project gurudevi-mobile --config dev --no-interactive
Set-Location ../..
```

Verify the contract without printing values:

```powershell
pnpm run env:check -- --scope mobile
pnpm run env:check -- --scope api
pnpm run audit:secrets
```

Run the app or API through the existing Doppler-backed scripts:

```powershell
pnpm --filter gurudevi-mobile dev
pnpm --filter @repo/sanctuary-api dev
```

For an intentional local `.env` fallback only:

```powershell
pnpm --filter @repo/sanctuary-api dev:no-doppler
```

That fallback is explicit and should not be used by CI or release commands.
`pnpm --filter gurudevi-mobile setup:env` is now a names-only contract check;
it no longer writes secrets to disk.

## Secret lifecycle

Add, rotate, and revoke secrets in Doppler. Keep names stable across configs so
the same code path can be promoted from `dev` to `stg` to `prd`.

```powershell
# Inspect names only
doppler secrets --only-names

# Add a multiline value without putting it in shell history
Get-Content .\private-key.txt | doppler secrets set SNAPSHOT_SIGNING_PRIVATE_KEY

# Verify presence without echoing the value
doppler secrets get DATABASE_URL --plain | ForEach-Object { if ($_){ 'DATABASE_URL is present' } }
```

Do not use `doppler secrets download ... > .env` in normal development. Doppler
fallback files such as `doppler.json` are ignored and are not a backup strategy.
Use Doppler history and a documented rotation procedure instead.

## CI/CD contract

GitHub Actions should contain only:

- `DOPPLER_TOKEN`, supplied by the protected GitHub Environment;
- non-secret metadata such as a deployment target, profile, or release version.

Workflows install the official Doppler CLI action and run build/test commands
under `doppler run -p gurudevi-mobile -c <config> -- ...`. Provider credentials
such as EAS, Sentry, or Cloudflare tokens belong in the matching Doppler config,
not in workflow YAML.

Required GitHub setup:

1. Create GitHub Environments named `development`, `preview`, and
   `production`.
2. Add a read-only Doppler service token as `DOPPLER_TOKEN` in each matching
   environment.
3. Require approval and restrict branches for `production`.
4. Configure the `stg` and `prd` Doppler configs with only the credentials that
   their deployment requires.
5. Run the manual Doppler contract workflow before the first release.

The production boundary is intentionally fail-closed: if the config, token, or
required secret contract is missing, the workflow stops before building or
deploying.

## Lifecycle gates

| Lifecycle | Local command / workflow | Gate |
| --- | --- | --- |
| Edit | `pnpm lint` | formatting, lint, architecture boundaries |
| Type safety | `pnpm check-types` | workspace TypeScript contracts |
| Unit/integration | `pnpm test` | test suite and focused domain checks |
| Dependency health | `pnpm maintenance:outdated` | deliberate upgrade review |
| Secrets | `pnpm audit:secrets` | Doppler names-only contract |
| Supply chain | `pnpm audit:security` | Snyk/Semgrep policy |
| Mobile readiness | `pnpm audit:mobile:doctor` | Expo doctor; never `expo install --fix` |
| Preview | Android/web workflows | `stg` config + protected token |
| Release | production workflow dispatch | `prd` config + GitHub approval |
| Operations | Doppler activity/history + Sentry | rotate, observe, and record incidents |

## Incident response

If a secret is exposed, stop the affected workflow, rotate the value in
Doppler, revoke the old provider credential, review Doppler/GitHub/Sentry
access logs, and rerun the names-only contract check. Never paste the exposed
value into an issue, commit, or chat transcript.

The repository intentionally does not attempt to copy secret values between
systems. That keeps Doppler authoritative and makes rotations auditable.

## Official references

- [Doppler CLI guide](https://docs.doppler.com/docs/cli)
- [Doppler secrets setup](https://docs.doppler.com/docs/secrets-setup-guide)
- [Doppler GitHub Actions](https://docs.doppler.com/docs/github-actions)
- [Doppler secrets access](https://docs.doppler.com/docs/accessing-secrets)
