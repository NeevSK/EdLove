# Security Policy

## Supported versions

`main` and `main-preview` are security-supported. `main-dev` receives fixes as they land.

## Reporting a vulnerability

Email **security@edlove.org** (or open a private security advisory on GitHub).
Do **not** open a public issue for sensitive reports.

Include: affected version/commit, reproduction steps, impact, and whether
student PII is involved (`docs/architecture/2026-06-19-sanctuary-authorization-final-architecture.md`).

We aim to acknowledge within 72 hours, triage within 7 days, and coordinate
disclosure.

## What to check before reporting

- `.env*` files are gitignored (`AGENTS.md`, `config/doppler-secrets.json` is a name
  contract only). If you found a live key in history (e.g., `b56f62af`), rotate it
  and note the commit.
- RLS/authorization is via ZenStack `schema.zmodel` `@@allow`/`@@deny` + Cedar
  `packages/policies` + Ed25519 snapshots
  (`EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY` / `SNAPSHOT_SIGNING_PRIVATE_KEY`).
  Report missing policies, not missing client checks.

## Secret rotation

Doppler is source of truth (`docs/infra/doppler-toolchain.md`). CI masks secrets via
`::add-mask` (`load-doppler-env` action). Never paste real values in issues/PRs.
