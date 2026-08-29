---
title: "Contributing to Gurudevi"
status: "active"
created: 2026-08-25
updated: 2026-08-25
author: "Naveen"
scribe: "opencode"
tags: [contributing, onboarding, open-source]
---

# Contributing to Gurudevi

> **Model:** Transparent Hosted — code is MIT (`LICENSE`), production runs hosted at
> `platform.gurudevi.edlove.org`. Self-host is dev-only/edge-case; you get network
> benefits (community + curated library) on our hosted stack. See ADR
> `docs/decisions/2026-08-25-transparent-hosted-oss.md`.

## Quick start (without agency secrets)

```bash
pnpm install

# With Doppler (team — auto-injects EXPO_PUBLIC_* + DATABASE_URL etc.)
pnpm --filter gurudevi-mobile setup:env
pnpm --filter gurudevi-mobile dev

# Without Doppler (contributors / self-host dev)
cp apps/gurudevi-mobile/.env.example apps/gurudevi-mobile/.env.local
# fill EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# → use http://127.0.0.1:54321 + publishable key from `supabase start` if running local Supabase
pnpm --filter gurudevi-mobile dev:no-doppler
pnpm --filter gurudevi-mobile web   # RN Web → http://localhost:8081
```

Local Supabase (optional, for DB/sync work):

```bash
supabase start   # uses supabase/config.toml ports 54321-54327, ~120 migrations
supabase status  # API URL + publishable key → paste into .env.local
supabase db reset
```

Native builds: `android/` and `ios/` are generated artifacts (gitignored). Never edit
them — configure via `apps/gurudevi-mobile/app.json` + `plugins/*.js`. Never run
`npx expo install --fix` or `expo prebuild --clean` without approval (`AGENTS.md`).

## Quality gates (before every push)

```bash
pnpm check-types
pnpm lint
pnpm test           # or pnpm --filter <pkg> test
pnpm audit:secrets  # Doppler contract: config/doppler-secrets.json
```

Also required on changed files before merge: `pnpm run check:anti-slop`
(`aislop` + `fallow`). See `AGENTS.md` — Quality Regulation.

Sacred versions are pinned (`AGENTS.md` table: `react-native-gesture-handler 3.0.2`,
`react-native-reanimated 4.5.0`, `react-native-worklets 0.11.1`,
`react-native-mmkv 4.3.2`, `react-native-nitro-modules 0.36.1`,
`@shopify/react-native-skia 2.6.5`, `typescript 7.0.2`) — don't bump without approval.

## Secrets

- Real secrets live in Doppler project `gurudevi-mobile` (`dev`/`stg`/`prd` configs
  in `config/doppler-secrets.json` + `infra/doppler-toolchain.md`). Never commit
  `.env`, `.env.local`, `.env.docker`.
- `.env.example` files are placeholders only — safe to commit.

## Branch flow

```
feature/* → main-dev → main-QA → main-preview → main
```

Default: `main-dev`. No rebase on long-lived branches (`docs/infra/git-branching-model.md`).

## Docs

Follow `docs/docs-sop.md` (frontmatter) + `apps/gurudevi-mobile/docs/docs-sop.md`.
New ADR? Add to `docs/decisions/` and link in `docs/INDEX.md` changelog.
Stack-map after dep changes: `pnpm run stack-map:bootstrap` → edit
`docs/stack-map/landscape/stack-map-annotations.yaml` → `pnpm run stack-map` (`AGENTS.md`).

## Issues & PRs

Use `.github/ISSUE_TEMPLATE/*`. Fill the PR template checklist (RLS, grants, Zod,
PII, 2GB boundary, `check-types`). Small diffs by default.
