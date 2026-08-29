---
title: "Gurudevi Mobile"
status: "active"
created: 2026-02-05
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, expo, offline-first]
---

# Gurudevi Mobile

The operational engine of the Polymath platform: an Expo React Native app for
teachers, students, and principals, with a full web target built from the same
codebase (React Native Web).

> **Transparent Hosted — MIT open source, hosted production.** `platform.gurudevi.edlove.org` is the recommended way to get community + curated library network benefits. Code is public for audit; self-host is dev-only/edge-case (isolated DB). See ADR [`2026-08-25-transparent-hosted-oss`](../../docs/decisions/2026-08-25-transparent-hosted-oss.md).

> **Stack**: Expo SDK 57 · React Native 0.86 · New Architecture enabled ·
> TypeScript · pnpm monorepo · PowerSync offline-first · Drizzle ORM ·
> ZenStack v3 access control · Sovereign Hono API (`@repo/core`)

---

## Quick start

```bash
pnpm install                 # from repo root (workspace install)

pnpm --filter gurudevi-mobile setup:env   # pull env from Doppler (team)
pnpm --filter gurudevi-mobile dev         # Expo dev server (Doppler-injected)
pnpm --filter gurudevi-mobile android    # native Android dev build
```

No Doppler locally? Use `dev:no-doppler` and a hand-written `.env` — this is also the
edge-case self-host dev loop (see ADR `2026-08-25-transparent-hosted-oss.md`):

```bash
supabase start   # optional — local Postgres 17 + API on 54321 (supabase/config.toml)
supabase status  # copy API URL + publishable key into .env.local
cp .env.example .env.local   # then pnpm --filter gurudevi-mobile dev:no-doppler
```

Secrets are **never** committed; `.env*` is gitignored. `.env.example` is the contract
(`config/doppler-secrets.json`); `EXPO_PUBLIC_POWERSYNC_URL=""` means Message Bus only.
`EXPO_PUBLIC_LIBRARY_UPSTREAM_URL` (empty by default) is reserved for future Hub Pull
federation — leave empty unless you implement it.

### Web target

```bash
pnpm --filter gurudevi-mobile web        # dev server (RN Web)
pnpm --filter gurudevi-mobile build:web  # static export -> dist/
```

Deployed to `platform.gurudevi.edlove.org` via
`.github/workflows/web-deploy.yml`. Web-specific overrides use `*.web.tsx`.

---

## Architecture in one screen

| Concern | Owner |
|---|---|
| UI primitives + brand system | `packages/ui` (`@repo/ui`) |
| Domain logic / sovereign API | `packages/core` (`@repo/core`) |
| Schema + migrations | `packages/schema`, `packages/database` |
| Offline sync | PowerSync + `packages/database` |
| AuthZ policies | ZenStack v3 (`.zmodel`) |
| State | Zustand + TanStack Query |
| Local storage | MMKV (nitro modules) |

**UI rule:** always import from `@repo/ui`. Never import gluestack directly.
Branded state components exist for every async surface — see
[Branded Components guide](../../AGENTS.md) (BrandPulse, ErrorState,
SuccessCheck/Glow, BrandedEmptyState, skeleton family).

---

## Native builds & configuration

- `android/` and `ios/` are **generated artifacts** (gitignored) — never edit
  them. All native config lives in `app.json` + custom plugins in `plugins/`.
- Several packages are pinned to specific versions for new-architecture
  compatibility ("sacred versions"). See the table in the repo-root
  [`AGENTS.md`](../../AGENTS.md) before touching dependencies.
- Never run `npx expo install --fix` or `expo prebuild --clean`.

```bash
pnpm --filter gurudevi-mobile build:dev        # EAS development build
pnpm --filter gurudevi-mobile build:preview    # EAS preview build
pnpm --filter gurudevi-mobile build:prod       # EAS production build
```

Build troubleshooting: [docs/Learning/EXPO_BUILD_RUNBOOK.md](docs/Learning/EXPO_BUILD_RUNBOOK.md)
and [docs/infra/expo-57-native-gradle-sop.md](docs/infra/expo-57-native-gradle-sop.md).

---

## Quality gates

```bash
pnpm --filter gurudevi-mobile lint          # Biome + ESLint
pnpm --filter gurudevi-mobile check-types   # tsc --build
pnpm --filter gurudevi-mobile test          # Vitest
pnpm --filter gurudevi-mobile audit:boundaries
```

A husky pre-push hook ("sovereign gate") runs commitlint, lint, react-doctor,
and type checks before pushes are accepted.

---

## Branch flow

Promotion is merge-forward only:

```
feature/* -> main-dev -> main-QA -> main-preview -> main
```

Default branch: `main-dev`. Experimental work lands on `main-bleeding-edge`;
exploration on `main-innovate`. No rebase on long-lived branches.

---

## Documentation map

All docs follow [docs/docs-sop.md](docs/docs-sop.md) (frontmatter contract,
living/historical/generated tiers).

| Path | Contents |
|---|---|
| `docs/INDEX.md` | Chronological changelog + navigation hub |
| `docs/architecture/` | System design, data engines, security models |
| `docs/Core/` | Engine details, UI doctrine, coding standards |
| `docs/decisions/` | ADRs |
| `docs/current_progress/` | Active plans (finished work moves to `old_docs/`) |
| `docs/infra/` | Builds, CI, deployment, environment |
| `docs/web/` | RN Web alignment guides |
| `docs/Learning/` | Onboarding + build runbooks |

## License

MIT — see root [`LICENSE`](../../LICENSE). Transparent Hosted: code is open, production is hosted at `platform.gurudevi.edlove.org` (community/library network benefits require the hosted stack).
