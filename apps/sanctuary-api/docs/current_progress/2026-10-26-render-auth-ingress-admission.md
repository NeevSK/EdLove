---
title: "Render ingress admission for owned authentication"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, deployment, render, transport, acceptance]
---

# Deployment boundary and feature spec

The linked hosted Supabase/PowerSync Development targets are authorized. No
Render API credential, service identifier, deploy hook or public Sanctuary API
URL is present in the inspected Doppler dev configuration. No Render connector
is available. A question about the Development service is pending; no service
creation or public deployment is authorized by an inferred production target.

The current source cannot start behind the documented Render ingress without
local TLS certificates: both entrypoints require them for production and the
middleware rejects the internal HTTP request even with forwarding headers.
`render.yaml` and the Docker health probe reference `/health`, while the actual
liveness route is `/health/live`. The Docker dependency installation also uses
Bun against a pnpm lockfile with a non-frozen fallback and an incomplete set of
workspace manifests. That build issue needs separate empirical resolution.

Maintain mode; targets: `core/transportSecurity.ts`, `core/nodeTransport.ts`,
both API entrypoints, existing transport tests, `render.yaml` and the Docker
liveness path. Reuse the existing TLS validator and HTTPS middleware. Default
direct TLS behavior and its certificate checks remain. Introduce an explicit
`SANCTUARY_TLS_TERMINATION=render` mode admitted only with Render's runtime
markers (`RENDER=true` and nonempty `RENDER_SERVICE_ID`). Reject unknown modes or
unverifiable Render configuration at startup. In that mode only, accept internal
HTTP application requests with exactly `X-Forwarded-Proto: https`; missing,
HTTP, comma-separated or unsupported values deny before handlers/body parsing.
Only GET `/health/live` may use internal HTTP without forwarding metadata.
No readiness/auth/data endpoint gains this exception. Complexity below 15.

Required evidence: retain every direct-TLS/forged-header assertion; cover mode
configuration, Render admission/denial, exact liveness exemption and startup
without local certificates only for an admitted Render runtime. No passing mock
test may be promoted into proof of actual Render ingress, header sanitization,
container build or public auth behavior.

Sources: [Render web ingress](https://render.com/docs/web-services),
[default runtime markers](https://render.com/docs/environment-variables),
[health checks](https://render.com/docs/health-checks),
[Hono reverse-proxy guidance](https://hono.dev/examples/behind-reverse-proxy),
and the installed Hono 5.0.0-rc.1 / Node adapter declarations.

The Render blueprint's rate-limit proxy header is also corrected from
`X-Forwarded-For` to `CF-Connecting-IP`. Render's
[current public-ingress guidance](https://render.com/articles/host-pocketbase-on-render)
states that Cloudflare overwrites the latter and that the leftmost forwarded-for
entry can be supplied by the caller. This deployment profile is for a public
Render web service; private service ingress requires a separately trusted
forwarder. The actual Render-header overwrite behavior still needs live
deployment acceptance. No arbitrary forwarded header becomes trusted merely
because a request supplied it in direct TLS mode.

The normal tsup bundle command fails with installed esbuild 0.27.7 because the
shared TypeScript target is `es2026`, which that bundler does not accept. Extend
the impact set to `apps/sanctuary-api/tsup.config.ts`: derive its Node engine
target from the canonical `.nvmrc` instead of duplicating a version or changing
the compiler strictness floor. Keep the existing CLI entrypoints/format/clean
behavior. A successful bundle is required evidence; no dependency upgrade or
lockfile regeneration is part of this repair.

## Implemented and verified

Both entrypoints now use `loadServerTlsOptions()`. Its default remains direct
TLS with the existing PEM validation; the explicit Render mode requires runtime
markers before skipping local certificates. The shared HTTPS middleware admits
only the documented Render forwarding value or the exact GET liveness exception.
Unknown termination modes fail closed. The Render/Docker health path is now
`/health/live`. The blueprint declares the owned signer, PowerSync endpoint,
publishable provider key and BYOK secret as externally supplied values; no secret
was committed or copied into the blueprint.

G1 / Vitest 5.0.5: 49 selected transport/grant cases succeeded. The full serial
API suite then completed with 939 cases succeeding, six existing skips, and
122 successful files plus one skipped file. This suite substitutes external
boundaries; it does not establish actual Render forwarding or production auth.
No test or assertion was deleted to obtain this result. Log:
`reports/auth-render-ingress-api-suite.log`.

G0 / API TypeScript and scoped Biome/complexity checks succeeded. The existing
tsup 8.5.1 / esbuild 0.27.7 bundle initially failed on the inherited `es2026`
target. `tsup.config.ts` now derives `node24` from `.nvmrc`; the same two-entry
ESM command succeeds. The bundler still warns that it does not recognize the
inherited `ES2026` tsconfig target. This warning is recorded, not suppressed.
The TypeScript configuration, lockfile and package versions were not changed.
Bundling is static evidence, not a successful container/entrypoint boot. Log:
`reports/auth-render-ingress-build.log`. Broad anti-slop still exits 1 on the
same 48 native findings; CNG succeeds and no gate was weakened.

## Real HTTP scenario and startup findings

The first full-app production-mode probe failed before creating a fixture:
the inspected Doppler dev set lacks production JWT issuer/audience settings.
A separate presence-only check found no configured BYOK encryption key, which
the entrypoint's `load-env` check requires. The test did not invent or persist
a replacement BYOK secret and did not change a deployed environment.

G2 / Node 24.22.1 loopback HTTP through the full Hono app, real hosted Supabase
issuer and canonical PostgreSQL, real persisted Dev grant signer: succeeded.
This scenario explicitly supplied non-secret issuer/audience and shared
rate-limit settings in its process, and simulated Render's platform markers.
It admitted GET `/health/live` without forwarding metadata, denied HTTP
readiness/application requests and ambiguous forwarding, issued a valid
canonical grant for a real password session, and denied renewal with 401 after
actual global logout. Signature and 300-second lifetime were checked. The
existing app middleware, not only the isolated auth router, handled the HTTP
requests. No `load-env` entrypoint boot or actual Render edge was exercised.

The fixture marker is `20261026-render-ingress`. One synthetic permanent
account was globally revoked and banned in cleanup. An independent hosted
count query confirmed one retained account and one banned account. Lifecycle
cleanup remains open; no bond rows were created. Admin fixture email
confirmation is not evidence of email ownership. Credentials and private key
material stayed in memory. Summary:
`reports/auth-render-ingress-acceptance.json`.

## Deployment admission still required

The user explicitly chose **a new Development Render service**. Plugin discovery
found Render available but not installed/connected; its connection option was
surfaced. No Render service was created, no Git changes were pushed and no
public deployment occurred. Installation/account connection remains necessary
before using that capability. Do not silently deploy the existing production
blueprint to a different environment.

Before service admission, resolve the Docker pnpm/workspace installation issue,
provide the production startup settings and BYOK encryption-key stewardship,
inject the existing Dev sync signer through the approved secret workflow, and
verify actual Render TLS/header/rate-limit behavior. Verify a publicly reachable
owned-grant/login/logout journey and SDK sync using the new service URL before
updating client environment URLs. The full identity/auth/sync goal remains active.

## Container dependency feature spec

Maintain mode; target the API Dockerfile and its Dockerfile-specific ignore
file. Reuse the root pnpm package-manager authority, `.nvmrc`, workspace and
patch definitions. Replace Bun dependency installation and its non-frozen retry
with Node/Corepack and filtered pnpm frozen installation. Retain Bun 1.4.4 as
the application runtime. Verify the pinned builder Node version against `.nvmrc`
inside the build so a stale image fails loudly. Include all shared package
manifests/source required by the API dependency graph; exclude unrelated apps,
installed host dependencies, environment/credential files, reports and build
artifacts. No environment secret or build argument is needed to install public
dependencies. Do not change dependency versions, regenerate the lockfile, skip
dependency scripts or weaken installation guards to make a build succeed.
Required evidence: actual linux/amd64 Podman build and runtime checks. Render
BuildKit remains separate platform evidence, and no image is published by the
local build.

## Render access and container verification follow-up

Render CLI 2.31.0 was downloaded from the official release and checked against
its SHA-256 manifest. Browser authorization completed successfully; no token
was printed. The selected workspace is `My Workspace`
(`tea-dbeltbgm7kps73eaj8d0`), which listed no services. The requested service
name is `sanctuary-api`; creating a new organization is unnecessary. The user
suggested `Intuitui Labs` only if an organization name is required; no workspace
rename or organization creation was performed.

The Render plugin's skills briefly became available, but authenticated resource
tools were absent. Its cached skill directory was subsequently removed during
the session; the downloaded CLI remains the verified operational path. Both
available browser-control runtimes failed initialization with a missing kernel
asset path. The user completed the supported CLI browser authorization instead.

Actual authenticated Blueprint validation returned `valid: false` with
`need_payment_info` for both the existing paid blueprint and the new
`render.development.yaml` with `plan: free`. This is an account admission result,
not evidence that the remaining schema/build/runtime is valid. The Development
blueprint uses the requested service name, Singapore, manual deployment and the
existing external database/sync configuration. No paid plan, billing mutation,
service creation, public deployment or Git push occurred. A request to complete
Render's required account setup is pending.

The Dockerfile now uses Node 24.22.1/Corepack for filtered, frozen pnpm 12.15.0
installation, keeps Bun 1.4.4 as runner, and checks Node against `.nvmrc`.
The Dockerfile-specific ignore list excludes host dependencies, local secrets,
reports, docs and build artifacts while retaining the pnpm hook and patches.
The first linux/amd64 Podman build stopped at frozen installation on an override
mismatch. Inspection found its lockfile hash differed from the current checkout
while the workspace hash matched, consistent with concurrent dependency edits.
Current workspace and lockfile override maps compare equal. No shared dependency
edit was reverted and no lockfile was regenerated by this work. A second build
including `.pnpmfile.cjs` is being observed through its live execution handle;
neither successful installation nor a runnable image is claimed yet.

### Local-first steering and observed build outcome

The user asked why payment was required and directed that work proceed locally
if Hobby/free was insufficient. No paid-tier requirement has been established:
the actual evidence is only Render's `need_payment_info` response even for
`plan: free`. Do not equate that response with Hobby being inadequate. Public
Render provisioning is deferred under this steering; do not repeat billing
requests or create a paid resource. The account remains authenticated, but no
service exists and no payment details were entered.

The second container build passed frozen lockfile consistency and supply-chain
verification and began downloading/linking dependencies. Inspection of its
intermediate image confirmed current lock/workspace hashes and the pnpm hook;
`.env`, `.git`, reports and host node_modules were absent. It also showed that
Podman's ignore semantics included unrelated app source through the parent
directory inclusion. The ignore file now explicitly excludes `apps/*` before
reincluding `apps/sanctuary-api`; this correction is not yet build-verified.
The exact tagged build process was interrupted after confirming its PID and
command line. No image success is claimed and no live build handle remains.
The existing Supabase rehearsal/restore containers were not stopped or changed.

Logs: `reports/auth-render-container-build.log` (initial terminal frozen failure)
and `reports/auth-render-container-build-with-hook.log` (interrupted download
attempt). Broad anti-slop still exits 1 with 48 existing native findings. Raw
Dockerfile/ignore/Development Blueprint diff and whitespace checks were reviewed.
The local runtime and API/client/device acceptance work remains active; the
unverified container is not a prerequisite for continuing source-runtime tests.
