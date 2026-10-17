# Public Hosting and Domain Topology

**Date:** 2026-08-28  
**Updated:** 2026-10-11  
**Status:** Superseded by [Sanctuary Domain and Mobile Identity Cutover Plan](../current_progress/2026-09-22-sanctuary-domain-and-mobile-identity-cutover-plan.md)  
**Scope:** EdLove ecosystem web applications, Gurudevi standalone identity, and Intuitui Labs studio

> [!NOTE]
> **Evolution Note (September 2026 / October 2026)**:  
> The initial temporary subdomain allocations in this document have evolved to full standalone domain identities:
> - **Gurudevi** has cut over to its canonical home at **`https://gurudevi.app`** (marketing) and **`https://sanctuary.gurudevi.app`** (authenticated app), with **`https://explore.gurudevi.app`** for sandbox exploration and **`https://gurudevi.lk`** as national alias. Legacy `gurudevi.edlove.org` permanently 301-redirects to `gurudevi.app`.
> - **Intuitui Labs** has graduated to **`https://intuituilabs.studio`** (studio apex), **`https://docs.intuituilabs.studio`** (developer/OSS docs), and **`https://intuituilabs.lk`** (national gateway).
> - Refer to [`docs/current_progress/2026-09-22-sanctuary-domain-and-mobile-identity-cutover-plan.md`](../current_progress/2026-09-22-sanctuary-domain-and-mobile-identity-cutover-plan.md) for the active production contract.

---

## Canonical Target Map

| Product or service | Repository | Canonical hostname | National Alias | Initial hosting |
| --- | --- | --- | --- | --- |
| **EdLove public web** | `NeevSK/EdLove` | `https://edlove.org` | - | Vercel |
| **Gurudevi marketing home** | `NeevSK/EdLove` | `https://gurudevi.app` | `https://gurudevi.lk` | Cloudflare Pages |
| **Gurudevi sanctuary app** | `NeevSK/EdLove` | `https://sanctuary.gurudevi.app` | - | Cloudflare Pages / Next.js |
| **Gurudevi exploration** | `NeevSK/EdLove` | `https://explore.gurudevi.app` | - | Cloudflare |
| **Sanctuary API** | `NeevSK/EdLove` | `https://sanctuary.gurudevi.app/api` | - | Managed Node container |
| **Intuitui Labs Studio** | `NeevSK/intuitui-web` | `https://intuituilabs.studio` | `https://intuituilabs.lk` | Vercel |
| **Intuitui Labs Docs** | `NeevSK/intuitui-web` | `https://docs.intuituilabs.studio` | - | Vercel |
| **Neevsk archive & studio profile** | `NeevSK/neevsk-web` | `https://neevsk.intuituilabs.studio` | `https://neevsk.lk` | Vercel |
| **Mobile applications** | `NeevSK/EdLove` | `app.gurudevi.sanctuary` | - | Expo EAS |

---

## Decision

EdLove remains the canonical monorepo for EdLove-owned products. Independent
products remain in their own GitHub repositories. Hosting providers may differ
by product; the `edlove.org` DNS zone is the shared naming and routing layer for EdLove initiatives, while `gurudevi.app` and `intuituilabs.studio` operate under their own sovereign DNS zones.

## Rationale

Keeping EdLove products in one monorepo preserves shared packages, schema,
authentication, UI, and coordinated changes. It does not require every app to
use the same hosting provider.

Vercel is the initial host for EdLove public web because it is already present
in the project and allows a later provider migration without changing the
public hostname. Cloudflare Pages is appropriate for the static or mostly
static Gurudevi web surfaces and keeps the existing platform deployment
direction.

## DNS and provider model

Cloudflare is the DNS provider for `edlove.org`, `gurudevi.app`, and `intuituilabs.studio`.

## Safety and migration rules

1. Preserve all existing Vercel projects, deployments, domains, and environment
   variables until their replacements are verified.
2. Do not delete or archive an old deployment during the initial migration.
3. Verify the existing DNS record and live target before changing a hostname.
4. Deploy a new target on its provider-generated hostname first.
5. Test health checks, authentication, API calls, assets, redirects, and SSL.
6. Attach the custom hostname only after the replacement passes verification.
7. Keep the previous provider available as a rollback target for a defined
   observation period.
8. Never commit provider secrets, API tokens, or production environment files.
