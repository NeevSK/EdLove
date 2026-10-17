---
title: "HTTPS Transport Boundary"
status: "active"
created: 2026-10-16
updated: 2026-10-16
author: "Naveen"
scribe: "Codex"
tags: [security, https, tls, clients, deployment]
---

# HTTPS transport boundary

HTTPS on `gurudevi.app` protects the website connection, not every downstream
connection automatically. Web, mobile, authentication and later channel adapters
must protect their own connections to the authoritative API. This requirement
does not change domain commands, account identity or authorization.

## Enforced source boundaries

- `packages/core/src/api/transportSecurity.ts` owns the platform-neutral URL
  policy. Production and unknown environments require absolute HTTPS URLs.
  Embedded credentials, fragments and non-HTTP schemes are rejected. Only
  explicit `development` and `test` environments permit HTTP to exact localhost,
  loopback or private IPv4 LAN addresses, including the Android emulator host.
  There is no production allow-insecure switch.
  A Node runtime configured with `NODE_TLS_REJECT_UNAUTHORIZED=0` is rejected
  before HTTP dispatch, including nominally HTTPS URLs.
- Shared authenticated fetch, assignment replay transport, browser account
  adapters and Supabase HTTP adapters validate destinations and refuse redirects
  before credentials can travel to a redirected destination. Public Explore
  practice remains local when its live API is unconfigured; production clients
  do not silently substitute a localhost API or mock identity-provider project.
- Verification-key downloads validate their configured provider URL and refuse
  redirects. HTTPS failures do not trigger a cleartext retry.
- API ingress rejects cleartext production requests before body processing,
  authentication or domain handlers. `Forwarded` and `X-Forwarded-Proto` are not
  evidence of TLS and cannot exempt a request. Production CORS permits exact
  approved HTTPS web origins, not a localhost-prefix match.

## Standalone server deployment

The Node and Bun entries require real TLS in production. Provide
`SANCTUARY_TLS_KEY` and `SANCTUARY_TLS_CERT` through Doppler/runtime secret
injection, never committed files or plaintext fallback configuration. The
certificate value must contain the appropriate certificate chain for the
configured API hostname. Missing or invalid material prevents startup; there is
no automatic HTTP fallback. TLS 1.2 is the minimum for the standalone origin.

A managed proxy must use a certificate-validating HTTPS connection to this
origin. Do not use Flexible TLS, disable certificate verification, expose an
alternative cleartext listener, or add a forwarded-header exception to make a
deployment work. A future platform-native/serverless adapter must preserve the
runtime's trustworthy HTTPS request information; it must not invent it from
untrusted headers. No new edge deployment is established by these source edits.

Certificate issuance, automatic renewal and hostname routing belong to hosting
operations. Neither an HSTS header nor URL validation provisions a certificate.
HSTS is defense in depth after a valid HTTPS connection, not origin protection
or authorization. See [Hono secure headers](https://hono.dev/docs/middleware/builtin/secure-headers)
and [MDN TLS](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security).

## Acceptance gates

Current evidence: G1 / native Node built-in assertions, 29/29 checks against
the actual shared URL policy, Request handling, forced redirect mode and rejected
missing/invalid TLS material. Fetch was substituted. No TLS handshake, browser,
device, complete framework suite or deployed infrastructure was exercised.
An additional 3/3 native Node assertions verified the final TLS-disable guard
rejects an HTTPS URL without dispatching fetch. Earlier G1 / Vitest boundary
evidence was 36/36 across URL policy, assignment transport, account-bound fetch,
base configuration and mocked Supabase adapter; that run predates the final
TLS-disable regressions. Browser, API ingress, JWKS and startup-listener suites
remain unexecuted for this change under the dependency freeze.

- [ ] Execute URL-policy, credential-before-dispatch, redirect, ingress, CORS
  and certificate-configuration tests after dependency alignment.
- [ ] Complete scoped static checks and review the raw unified diff.
- [ ] Verify the real deployment's API hostname, certificate chain, expiry and
  renewal ownership; do not assume the website's certificate covers the API.
- [ ] Confirm the origin has no public HTTP listener or header-spoofing bypass.
- [ ] Verify browser and native release builds against real HTTPS, including
  invalid/expired certificate failures and interrupted-request recovery.
- [ ] Confirm deployed auth-provider URLs and platform network behavior. Mocked
  fetch assertions alone do not prove native redirect or TLS enforcement.

Dependency installation and alignment remain user-owned. Source implementation
and prepared tests are not a claim that these deployment gates have passed.
