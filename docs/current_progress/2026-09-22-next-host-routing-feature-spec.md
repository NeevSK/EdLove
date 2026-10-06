---
title: "FEATURE SPEC: Next Sanctuary Host Routing"
status: "implemented"
date: 2026-09-22
---

# FEATURE SPEC: Next Sanctuary Host Routing

## Blast Zone: AMBER

## Target Files

- `apps/gurudevi-web/lib/host-routing.ts`
- `apps/gurudevi-web/lib/host-routing.test.ts`
- `apps/gurudevi-web/proxy.ts`

## Reuses

- The approved ownership contract in
  `2026-09-22-sanctuary-domain-and-mobile-identity-cutover-plan.md`.
- The existing Supabase cookie refresh adapter for Sanctuary routes only.
- Next.js 16 `proxy.ts` and `NextResponse.redirect` semantics.

## Contract

- `gurudevi.app` owns public, legal, support, editorial, and machine-readable
  routes.
- `sanctuary.gurudevi.app` owns browser authentication, account deletion,
  onboarding, API routes, and authenticated Sanctuary routes.
- A GET or HEAD request made to the wrong canonical Gurudevi host redirects
  temporarily to the matching canonical host, preserving pathname and query.
- A non-idempotent request is never replayed across origins. It receives a 404
  on the wrong canonical host.
- Local development, preview, and any host other than the two canonical
  Gurudevi hosts preserve current behavior. This is deliberately code-only:
  it changes neither DNS nor external provider configuration.

## Does NOT

- change DNS, TLS, deployment mappings, Supabase redirect allowlists, or API
  CORS;
- make Proxy an authorization boundary;
- remove the temporary Expo web runtime or any route;
- redirect or alter Edlove traffic.

## Complexity Budget

Pure route classification only; each function remains below 15 cognitive
complexity. Route-policy tests cover every canonical-host direction and the
unsafe-method guard.
