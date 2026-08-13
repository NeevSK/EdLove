---
title: "Gurudevi Platform Cloudflare Pages Setup"
status: "active"
created: 2026-08-08
updated: 2026-08-08
author: "Codex"
tags: [gurudevi, cloudflare, pages, expo, deployment, github]
---

# Gurudevi Platform Cloudflare Pages Setup

## Target

- Cloudflare Pages project: `gurudevi-platform`
- Preview branch alias: `preview`
- Production branch alias: `main`
- Intended custom domain: `platform.gurudevi.edlove.org`
- Build output: `apps/gurudevi-mobile/dist`

The Expo web export remains root-hosted at `/`. This setup does not attempt the unresolved `/app` base-path topology.

## GitHub workflow

The repository workflow is:

- `.github/workflows/cloudflare-gurudevi-platform.yml`

It is manual-only until the Cloudflare project and secrets are configured. It builds the existing Expo web export and deploys either a preview branch or the production branch.

## One-time Cloudflare setup

1. Create or select the Cloudflare account that owns `edlove.org`.
2. Create a Pages project named `gurudevi-platform`.
3. Connect the GitHub repository `NeevSK/Gurudevi` if dashboard Git integration is preferred, or use the repository workflow as the deployment source. The project is already connected to the repository with automatic deployments disabled until the first verified deployment.
4. Configure the matching Doppler `stg` or `prd` config with:
   - `CLOUDFLARE_API_TOKEN` — scoped to Pages deploy/edit for the account.
   - `CLOUDFLARE_ACCOUNT_ID`.
   - `EXPO_PUBLIC_SUPABASE_URL`.
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - Optional: `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`, `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_INNGEST_EVENT_KEY`, `EXPO_PUBLIC_POWERSYNC_URL`.
5. Add only the scoped Doppler service token as `DOPPLER_TOKEN` to the GitHub
   Environment (`preview` or `production`).
5. Add the custom domain `platform.gurudevi.edlove.org` under Pages → Custom domains after the first successful preview deployment. The custom-domain record has already been registered and is awaiting validation.
6. Verify the DNS record is managed by the same Cloudflare account and points to `gurudevi-platform.pages.dev`. The previous GitHub Pages CNAME was replaced during this setup.

## Required proof before production

- Preview deployment opens the root route without a blank screen.
- Refresh works on `/auth`, `/onboarding`, `/app/library`, `/app/profile`, and `/qr`.
- OAuth callback and QR links resolve on the custom domain.
- `robots.txt`, `sitemap.xml`, `llms.txt`, and `knowledge.json` are served from the platform host.
- Service-worker scope is limited to the platform root and does not collide with the marketing site.
- Supabase redirect URLs include the final host.
- Browser console has no runtime errors in guest, sign-in, and consent flows.
- Production deployment can be rolled back to the prior Pages deployment.

## Current status

The Cloudflare Pages project, GitHub source connection, and custom-domain registration are complete. The local Expo web export also passes after adding the missing `babel-plugin-transform-imports@2.0.0` development dependency.

The first deployment is still pending until the Doppler config, scoped service
token, and protected GitHub Environment are configured. Automatic source
deployments remain disabled intentionally; after that setup, run the workflow
manually for a preview, complete the proof checklist, and then run it for
production.
