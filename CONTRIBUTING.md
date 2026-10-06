---
title: "Contributing to Gurudevi"
status: "active"
created: 2026-08-25
updated: 2026-10-04
author: "Naveen"
scribe: "opencode"
tags: [contributing, onboarding, open-source]
---

# Contributing to Gurudevi

> **Model:** Transparent Hosted — code is MIT (`LICENSE`), production runs hosted at
> `platform.gurudevi.edlove.org`. Self-host is dev-only/edge-case; you get network
> benefits (community + curated library) on our hosted stack. See ADR
> `docs/decisions/2026-08-25-transparent-hosted-oss.md`.

## First-Time Contributors

Welcome! We're glad you're here. Here's how to get started:

### Prerequisites
- **Node.js** 22.x or later
- **pnpm** 9.x or later (`npm install -g pnpm`)
- **Git** for version control

### Quick Start (No Doppler Access)

If you're a contributor without Doppler access:

```bash
# Clone the repo
git clone https://github.com/NeevSK/EdLove.git
cd EdLove

# Install dependencies
pnpm install

# Set up environment for Gurudevi Mobile
cp apps/gurudevi-mobile/.env.example apps/gurudevi-mobile/.env.local
# Edit .env.local and fill in:
#   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
#   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-key

# Optional: Start local Supabase for DB/sync work
cd apps/gurudevi-mobile
supabase start
# Copy API URL + publishable key from supabase status into .env.local

# Run the app
pnpm --filter gurudevi-mobile dev:no-doppler
pnpm --filter gurudevi-mobile web   # Web version at http://localhost:8081
```

### For Team Members (With Doppler Access)

If you have Doppler access:

```bash
# Clone the repo
git clone https://github.com/NeevSK/EdLove.git
cd EdLove

# Install dependencies
pnpm install

# Set up Doppler (follow authentication in browser)
doppler login --scope=./

# Run with Doppler secrets
pnpm --filter gurudevi-mobile dev
```

## Quick Start (All Apps)

### Gurudevi Mobile (React Native / Expo)

```bash
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

### EdLove Web (Astro)

```bash
cp apps/edlove-web/.env.example apps/edlove-web/.env.local
# fill PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY
pnpm --filter edlove-web dev
```

### Gurudevi Marketing Web (Astro)

```bash
cp apps/gurudevi-marketingWeb/.env.example apps/gurudevi-marketingWeb/.env.local
# fill PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_PUBLISHABLE_KEY + INNGEST_EVENT_KEY
pnpm --filter gurudevi-marketingWeb dev
```

### Sanctuary API (Hono)

```bash
cp apps/sanctuary-api/.env.example apps/sanctuary-api/.env.local
# fill DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_PUBLIC_KEY
pnpm --filter @repo/sanctuary-api dev:no-doppler
```

### Gurudevi Web (Next.js)

```bash
cp apps/gurudevi-web/.env.example apps/gurudevi-web/.env.local
# fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
pnpm --filter gurudevi-web dev
```

### Local Supabase (optional, for DB/sync work)

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

## Finding Good First Issues

We label issues that are good for new contributors:
- **`good first issue`** - Small, well-scoped tasks suitable for first-time contributors
- **`help wanted`** - Issues where we'd welcome community help
- **`documentation`** - Improvements to docs, examples, and guides

## Development Workflow

1. **Fork and branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**:
   - Follow the code style in `AGENTS.md` (anti-slop rules, sacred versions)
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**:
   ```bash
   pnpm check-types
   pnpm lint
   pnpm test
   pnpm run check:anti-slop
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -s -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Open a pull request**:
   - Fill out the PR template
   - Link related issues
   - Request review from maintainers

## Communication

- **GitHub Issues**: For bug reports, feature requests, and questions
- **GitHub Discussions**: For broader topics, ideas, and community conversations
- **Security Issues**: Email security@edlove.org (do not open public issues)

## Changelog Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for changelog management.

### Adding a Changeset

When you make a change that should be documented in the changelog:

```bash
# From monorepo root
pnpm change
```

This will prompt you to:
1. Describe the change (required)
2. Choose the version bump type (major/minor/patch)
3. Select which packages are affected

### Versioning and Release

When ready to release a new version:

```bash
# Update all package versions and generate changelogs
pnpm version:all

# Commit the version changes
git add .
git commit -m "chore: version packages"

# Push to trigger CI/CD deployment
git push
```

### Changelog Files

- **Root CHANGELOG.md**: Monorepo-wide changes (OSS readiness, architecture, etc.)
- **Package CHANGELOG.md**: Individual package/app changes (e.g., `apps/gurudevi-mobile/CHANGELOG.md`)

See the root [CHANGELOG.md](./CHANGELOG.md) for the full changelog.

## Code Review Process

- All contributions require review before merge
- We aim to review PRs within 3-5 business days
- Be responsive to review feedback and address requested changes
- Small, focused PRs are easier to review than large ones

## Getting Help

- Check existing issues and discussions first
- Read the documentation in `docs/` and `apps/*/docs/`
- Ask questions in GitHub Discussions
- For technical questions, include relevant code snippets and error messages

Sacred versions are pinned (`AGENTS.md` table: `react-native-gesture-handler 3.3.0`,
`react-native-reanimated 4.6.0`, `react-native-worklets 0.12.2`,
`react-native-mmkv 4.3.2`, `react-native-nitro-modules 0.37.1`,
`@shopify/react-native-skia 2.11.2`, `typescript 7.0.2`) — don't bump without approval.

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