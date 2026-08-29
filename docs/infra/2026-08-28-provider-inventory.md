# Provider Inventory — 2026-08-28

This is a read-only snapshot taken after authenticating the Vercel and
Cloudflare CLIs. It is not a declaration that every deployment is healthy.

## Vercel

Account: `neevskhelloow`  
Team: `neevsk-projects`

| Project | Observed production URL | Intended role | Action |
| --- | --- | --- | --- |
| `gurudevi-edlove-web` | `https://www.edlove.org` | EdLove public web | Preserve |
| `gurudevi-neevsk-web` | `https://neevsk.edlove.org` | Neevsk web | Preserve and verify repository link |
| `gurudevi-intuitui-web` | `https://intuituilabs.edlove.org` | Intuituilabs web | Preserve and verify repository link |
| `gurudevi-gurudevi-web` | Gurudevi website / `gurudevi-edlove.org` site | Gurudevi website | Active; preserve and verify domain mapping |

## Cloudflare

Account: `f814d48362f77d2b7fd38b044e07ce7a`

| Pages project | Observed domain | Intended role | Action |
| --- | --- | --- | --- |
| `gurudevi-platform` | `platform.gurudevi.edlove.org` | Gurudevi application web | Preserve and verify workflow |

No Wrangler configuration file was found in the repository. Sanctuary API
therefore has not yet been configured as a Cloudflare Worker, which is
consistent with the decision to use a managed Node container initially.

## DNS observations

| Hostname | Observed target | Interpretation |
| --- | --- | --- |
| `edlove.org` | Vercel-style A record | Vercel public web target |
| `gurudevi.edlove.org` | Vercel DNS target | Currently Vercel; migration to Pages is not yet performed |
| `platform.gurudevi.edlove.org` | `gurudevi-platform.pages.dev` | Cloudflare Pages |
| `api.gurudevi.edlove.org` | No public record observed | API hostname is not connected yet |
| `neevsk.edlove.org` | Vercel DNS target | Vercel |
| `intuituilabs.edlove.org` | Vercel DNS target | Vercel |

## Safe next actions

1. Inspect each Vercel project's connected repository, root directory, build
   command, and environment-variable names.
2. Inspect the legacy Gurudevi Vercel project before deciding whether it is a
   duplicate, a rollback target, or an unrelated deployment.
3. Treat `gurudevi-gurudevi-web` as the active Gurudevi website deployment;
   verify its `gurudevi-edlove.org` domain mapping before changing any
   Gurudevi hostname.
4. Choose a managed Node container provider for Sanctuary API, deploy to its
   provider hostname, run health checks, and only then create the
   `api.gurudevi.edlove.org` DNS record.
5. Keep all existing Vercel projects and domains during the observation and
   rollback period.

## Vercel failure diagnosis

The independent-site projects currently have the correct custom domains but
the wrong Git source:

- `gurudevi-neevsk-web` is cloning `NeevSK/EdLove` and expects
  `apps/neevsk-web`, which does not exist in that repository.
- `gurudevi-intuitui-web` is cloning `NeevSK/EdLove` and expects
  `apps/intuitui-web`, which does not exist in that repository.

Their most recent deployments fail at the root-directory check. The existing
production domains still return successful responses because they point to
older successful deployments.

The repair is to change the Git repository connection in each existing Vercel
project, preserving the project and custom domain:

| Vercel project | Required Git repository | Root directory |
| --- | --- | --- |
| `gurudevi-neevsk-web` | `NeevSK/neevsk-web` | `/` |
| `gurudevi-intuitui-web` | `NeevSK/intuitui-web` | `/` |

After rebinding, verify the production branch, install command, build command,
output directory, and environment variables before triggering a production
deployment. Do not remove the existing project or domain.
