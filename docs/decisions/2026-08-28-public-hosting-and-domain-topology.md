# Public Hosting and Domain Topology

**Date:** 2026-08-28  
**Status:** Proposed; implementation is intentionally staged  
**Scope:** EdLove ecosystem web applications and Sanctuary API

## Decision

EdLove remains the canonical monorepo for EdLove-owned products. Independent
products remain in their own GitHub repositories. Hosting providers may differ
by product; the `edlove.org` DNS zone is the shared naming and routing layer.

## Target map

| Product or service | Repository | Canonical hostname | Initial hosting |
| --- | --- | --- | --- |
| EdLove public web | `NeevSK/EdLove` | `edlove.org` | Vercel |
| Gurudevi marketing site | `NeevSK/EdLove` | `gurudevi.edlove.org` | Cloudflare Pages |
| Gurudevi application web | `NeevSK/EdLove` | `platform.gurudevi.edlove.org` | Cloudflare Pages |
| Sanctuary API | `NeevSK/EdLove` | `api.gurudevi.edlove.org` | Managed Node container |
| Intuituilabs web | `NeevSK/intuitui-web` | `intuituilabs.edlove.org` | Vercel |
| Neevsk web | `NeevSK/neevsk-web` | `neevsk.edlove.org` | Vercel |
| Mobile applications | `NeevSK/EdLove` | App-store identities | Expo EAS |

`intuitui.edlove.org` is not a target hostname. Any existing reference to it
must be reviewed and either corrected or redirected to
`intuituilabs.edlove.org`.

## Rationale

Keeping EdLove products in one monorepo preserves shared packages, schema,
authentication, UI, and coordinated changes. It does not require every app to
use the same hosting provider.

Vercel is the initial host for EdLove public web because it is already present
in the project and allows a later provider migration without changing the
public hostname. Cloudflare Pages is appropriate for the static or mostly
static Gurudevi web surfaces and keeps the existing platform deployment
direction.

Sanctuary API is initially assigned to a managed Node container rather than a
Cloudflare Worker. The current API has Node-oriented entrypoints, database
access, external AI calls, and background or longer-running work. Workers may
be introduced later for edge-specific routes, webhooks, caching, or routing
after an explicit runtime-compatibility assessment.

A managed container is preferred over an unmanaged VPS at first because it
provides process restarts, TLS, logs, deployment integration, and health checks
without requiring manual server administration. A VPS remains a valid later
option if control or cost justifies the operational burden.

## DNS and provider model

Cloudflare may remain the DNS provider for `edlove.org` while individual
subdomains point to Vercel, Cloudflare Pages, or the API host. Hosting provider
and DNS provider are separate decisions.

The production API hostname is `api.gurudevi.edlove.org`. Preview and staging
hostnames must be documented separately and must not replace the production
hostname accidentally.

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

## Implementation sequence

1. Inventory current Vercel projects, Cloudflare Pages projects, DNS records,
   domains, and environment-variable sources.
2. Reconcile repository-to-provider connections for `neevsk-web` and
   `intuitui-web`.
3. Confirm the canonical hostname and redirect policy for
   `intuituilabs.edlove.org`.
4. Confirm the Gurudevi marketing/application split between
   `gurudevi.edlove.org` and `platform.gurudevi.edlove.org`.
5. Deploy and verify EdLove public web on Vercel without changing its public
   domain unexpectedly.
6. Establish a managed Node container deployment for Sanctuary API and verify
   `api.gurudevi.edlove.org`.
7. Migrate or attach domains one at a time, retaining rollback paths.
8. Update application URLs, CI workflows, and operational documentation only
   after each target is verified.

## Open verification items

- Current DNS records and their provider targets.
- Existing Vercel project names, repositories, root directories, and domains.
- Existing Cloudflare Pages/Worker projects and deployment status.
- Sanctuary API runtime requirements and managed-container provider choice.
- Production, preview, staging, and local environment-variable ownership.
- Whether any existing links still use legacy names such as
  `intuitui.edlove.org` or `intuituilabs.edlove.org`.
