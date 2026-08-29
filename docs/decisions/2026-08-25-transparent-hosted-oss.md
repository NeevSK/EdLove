---
title: "Transparent Hosted OSS — Open Source Without Promising Self-Host"
status: "accepted"
created: 2026-08-25
updated: 2026-08-25
author: "Naveen"
scribe: "opencode"
tags: [open-source, adr, hosting, self-host, federation]
---

# ADR: Transparent Hosted OSS — Open Source Without Promising Self-Host

## Status

**Accepted** — supersedes `2026-08-24-openness-and-reuse-strategy.md:Decision D` for the
monorepo. The monorepo remains the product monorepo but is now **transparent hosted**:
code is public (MIT) for audit/trust, production runs on the hosted stack. Self-host
remains a **dev-only / edge-case** path, not the primary promise.

## Context

The product question: *"If Gurudevi goes open source, must it also be self-hostable like
most EdTech (Moodle, Kolibri)?"* Exploration showed:

- The monorepo has **no self-hosting path** today — no `Dockerfile`, no `docker-compose`,
  no `SELF_HOSTING.md` (verified `glob Dockerfile → 0`). "Self-host" in the repo refers
  only to *dependencies* (PowerSync self-host Docker, Supabase self-host via
  `supabase start`) — not to hiding `community`/`library` tabs behind a self-host flag.
- `community` (`@repo/community`) and `library` (`@repo/library`) are **always-routed
  tabs** — `app/(tabs)/community`, `app/(tabs)/library` — not gated by deployment.
  Offline behavior is `isPowerSyncEnabled=false` (`packages/core/src/store/types/featureFlags.ts:13`)
  → direct API + MMKV cache (`docs/Library/gurudevi-library-spec` MMKV TTLs), not hidden.
- Sri Lankan school reality: money + skills make full self-host an **edge case**, not the
  default. The hosted `platform.gurudevi.edlove.org` (Expo Web/Metro `dist/` on GitHub
  Pages, Supabase Cloud `qzoawolfkuwiuyaoiybz`, PowerSync Cloud `jp`
  `69f9851...`, EAS `1701dfb9…`) delivers network benefits (cross-school community,
  curated library) that an isolated self-host loses.
- The prior ADR kept the monorepo private due to leaked Google API key (`b56f62af` →
  `83e3b4c9`, still in history) and broad business-code exposure. That decision is
  superseded: history stays, but the *current* tracked surface is clean
  (`pnpm audit:secrets` + `config/doppler-secrets.json` contract + gitignored `.env*`).

Decision driver: **don't promise what EdTech users don't need**, but don't lock the
door for the edge case that does.

## Decision

### 1. Transparent Hosted is the product promise

> **Gurudevi is open source (MIT `LICENSE`) — code public for audit. Production runs
> hosted at `platform.gurudevi.edlove.org` (Expo 57/RN 0.86, Supabase Cloud, PowerSync
> Cloud, EAS). Self-host is dev-only; your school's community/library data lives on
> your instance (isolated) — use our hosted to get network benefits. Full
> `docker-compose` self-host is roadmap, not v1.**

This matches the existing `apps/gurudevi-mobile/README.md:32` `dev` vs `dev:no-doppler`
split: Doppler is primary, `dev:no-doppler` + hand-written `.env` is the escape hatch.

### 2. Three seams now so later is not hard (2 hours, zero lock-in)

Seam A — **Env contract** — `.env.example` files are the contract
(`apps/gurudevi-mobile/.env.example:64`, `apps/sanctuary-api/.env.example:76`,
`config/doppler-secrets.json:58`). Keep `EXPO_PUBLIC_SUPABASE_URL` +
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` required, `EXPO_PUBLIC_POWERSYNC_URL=""`
(empty → Message Bus only `…/.env.example:20`) and all SaaS (`GROWTHBOOK`,
`POSTHOG`, `SENTRY`, `CLOUDINARY`, `INNGEST`, `SNAPSHOT_SIGNING_PUBLIC_KEY`,
`GOOGLE_*`) optional with `ENABLED=false` guards.

Seam B — **No-Doppler path** — document `pnpm --filter gurudevi-mobile dev:no-doppler`
(`package.json:10`) + `supabase start` (`supabase/config.toml:5` ports `54321-54327`)
as the contributor/self-host dev loop. No code change.

Seam C — **Upstream placeholder** — reserve
`EXPO_PUBLIC_LIBRARY_UPSTREAM_URL` (`app.config.js:13` bridge) + GrowthBook flag
`gurudevi.library.upstream` (`docs/architecture/feature-lifecycle-management.md` naming)
default `false`. No pull code v1; just the flag/env so Tier 1 Hub Pull
(`GET hub/api/library/nodes` → local `nodes/resources` upsert, Ed25519 snapshot
`packages/core/src/adapters/powersync/secureDrizzleProxy.ts:71`) is additive later.

### 3. What v1 does NOT promise

- No `docker-compose.selfhost.yml` v1 (Supabase CLI `supabase start` + `pnpm web`
  already Docker-capable; full compose is edge-case follow-up).
- No federated community write path — community stays isolated per deployment.
  Library federation is read-only Tier 1 then curated Tier 2, never Tier 3 peer
  federation v1 (`REPLICA IDENTITY FULL` `20260812000000_powersync_publication.sql:9`
  + `sync-config.yaml:5` edition 3 streams stay single-tenant).

## Consequences

- New contributors can run without Doppler/agency access — `dev:no-doppler` is the
  edge-case door.
- If a school asks for self-host, effort with seams is ~1 week (compose + seed
  `apps/gurudevi-mobile/schema_dump.sql`) vs ~2 weeks without seams (untangle
  `app.config.js:15`/`metro.config.js:53`/`babel.config.js:13` bridge + Doppler
  hardcodes). See federation tiers in decision discussion (1 Hub Pull 1-2 wks,
  2 Curated Publish 3-4 wks, 3 Full Peer 8-12 wks).
- Stack-map unchanged; no sacred version drift (`AGENTS.md:60` table
  `react-native-gesture-handler 3.0.2` etc.).
- Supersedes ADR `2026-08-24-openness-and-reuse-strategy.md:Decision D` — monorepo
  is now transparent hosted; extracted repos `rn-terrain`/`trube-art` remain private
  until their own launch criteria per that ADR's extraction rule.

## References

- Prior openness ADR: [2026-08-24-openness-and-reuse-strategy.md](./2026-08-24-openness-and-reuse-strategy.md)
- License: [2026-08-24-license-tradeoffs.md](./2026-08-24-license-tradeoffs.md) / `LICENSE` (MIT)
- Supabase PowerSync seams: `supabase/config.toml`, `powersync/service.yaml:32`,
  `powersync/sync-config.yaml:5`, `packages/core/src/providers/PowerSyncProvider.tsx:41`
- SaaS guards: `app/_layout.tsx:176` PostHog, `@sentry/react-native/expo` `app.json:96`
