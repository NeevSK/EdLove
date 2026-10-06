---
title: "Sanctuary Domain and Mobile Identity Cutover"
status: "approved architecture; implementation pending"
created: 2026-09-22
author: "Naveen"
scribe: "Codex"
tags: [domain, mobile-identity, auth, cutover, sanctuary]
---

# Sanctuary Domain and Mobile Identity Cutover

## Decision

| Purpose | Canonical identity | Notes |
| --- | --- | --- |
| Public marketing/editorial web | `https://gurudevi.app` | Public pages, SEO, support, legal, and app-entry links. |
| Authenticated web application | `https://sanctuary.gurudevi.app` | Sign-in, onboarding, authenticated routes, recovery, and deletion. |
| New iOS bundle ID / Android application ID | `app.gurudevi.sanctuary` | Canonical reverse-DNS form of the Sanctuary host; new listing cannot update `org.edlove.gurudevi` installs. |
| Native callback URI | `gurudevi://auth/callback` | Retained: it has no Edlove identity. Prefer HTTPS Sanctuary links for public app opening. |

`edlove.org` remains a valid, separate Edlove product/domain. This migration
removes only Gurudevi's active dependency on Edlove hosts and the old Gurudevi
mobile identity `org.edlove.gurudevi`; it does not rename, delete, redirect, or
otherwise disturb Edlove-owned sites, content, DNS, applications, or accounts.
This is a clean Gurudevi app cutover, not an in-place app-store upgrade.

## Initial platform scope

The initial release is **web plus Android**. Native iOS distribution is deferred
because there is no paid Apple Developer/TestFlight path. This is a scope limit,
not a product failure: no native iOS support, App Store availability, or G5 iOS
evidence may be claimed until that distribution path exists. Safari web testing
may still be useful, but it is not native iOS application evidence.

## Consequences

- The old app cannot upgrade to the new package/bundle ID.
- Sanctuary is the only browser-auth return host. Marketing is not an auth
  origin.
- The OAuth provider still uses its required Supabase callback endpoint; the
  final user return is `https://sanctuary.gurudevi.app/auth/complete`.
- Android and Apple app associations must name the new ID and current release
  signing values. Never use old IDs, placeholders, or debug fingerprints.
- A new native binary is mandatory; an OTA update cannot change the installed
  app identity or link entitlements.

## Target contract

| Surface | Required target | Explicit non-target |
| --- | --- | --- |
| Marketing canonical/SEO | `https://gurudevi.app` | Edlove hosts as Gurudevi marketing canonical URLs. |
| App routes/browser auth | `https://sanctuary.gurudevi.app` | `gurudevi.app/auth/*` and Edlove hosts as Gurudevi auth origins. |
| Supabase Site URL | `https://sanctuary.gurudevi.app` | Edlove hosts as Gurudevi auth Site URL. |
| Supabase redirect allowlist | Exact Sanctuary callback/recovery paths and `gurudevi://auth/callback` | Broad/unused Edlove redirects for Gurudevi auth. |
| API CORS production origin | `https://sanctuary.gurudevi.app` | `platform.gurudevi.edlove.org` as a Gurudevi app origin; standalone Edlove API policy is out of scope. |
| Android/iOS app links | Sanctuary HTTPS host, new identity, release signing values | Old host/ID/debug values. |
| Public URLs and email | Gurudevi domains only | Edlove domains/brand strings. |

## Ordered implementation

### 1. Freeze identity inputs

Obtain securely: Android **release** signing SHA-256; new Google OAuth client
IDs; and enabled Android payment/provider identities for the new ID. Apple Team
ID, Apple-specific providers, AASA, and native iOS release work are deferred.
Do not copy values from the old app.

### 2. Create the native identity

In `apps/gurudevi-mobile/app.json`, change `android.package` to
`app.gurudevi.sanctuary` and remove Edlove-branded active iOS configuration
without claiming a shipped iOS app. Use the EAS remote-version workflow for the
new Android release version/build. Retain `gurudevi` URI scheme unless a
separate scheme migration is approved. Make Sanctuary the only Android HTTPS
association host. Replace native Google/Stripe settings if enabled. This is a
RED change: feature spec and fresh review first; never edit generated
`android/`/`ios/`.

### 3. Deploy strict host ownership

Attach `gurudevi.app` to marketing and `sanctuary.gurudevi.app` to the
authenticated deployment. Verify DNS/TLS/host routing. Publish on Sanctuary:
`/.well-known/assetlinks.json`, publicly over HTTPS, with no login, redirect,
or stale CDN content. Verify exact body, content type, and identity. Defer the
Apple association file until native iOS distribution is funded and planned.

### 4. Cut auth and API to Sanctuary

Set Supabase Site URL and exact Sanctuary redirect URLs; change each OAuth
provider’s web/mobile client configuration; preserve PKCE/code flow and do not
restore URL-token fallbacks. Set deployed API/public URL variables, restrict
production CORS to Sanctuary after testing, and prove confirmation, recovery,
sign-out, and deletion routes at Sanctuary.

### 5. Detach Gurudevi from Edlove safely

Inventory every **Gurudevi-owned** runtime/build/deployment/provider/analytics/
email reference and classify it. Replace only values that make Gurudevi depend
on an Edlove host, brand, or old mobile identity. Preserve standalone Edlove
apps, domains, DNS, content, accounts, and their configuration. Historical
Gurudevi documents may remain when labelled historical. Do not global-replace
editorial URLs or delete any external identity.

### 6. Build and prove the new app

Build/install the new Android debug client first, then a release candidate as
needed, using the WSL workflow in `AGENTS.md`. Run the Layer-1 real journey at
Sanctuary: auth, callback, cold start/reload, recovery, sign-out, deletion,
replay/malformed callback, and normal/poor/offline networks. Verify marketing
stays public while Sanctuary opens web app/mobile links safely.

## Promotion gates

No web/Android production claim until: installed Android candidates prove the
new ID; `assetlinks.json` is public and matches release signing; browser auth
works at Sanctuary; no active **Gurudevi** production flow points to an Edlove
host or old app ID; Layer-1 G4/G5 web/Android evidence is recorded; and the
old Gurudevi deployment/app-listing disposition is explicitly documented.
Edlove systems remain out of scope. Native iOS remains deferred.

## Immediate next slice

The required RED [identity-migration feature
spec](2026-09-22-sanctuary-identity-migration-feature-spec.md) now defines the
implementation boundary. The scoped [Gurudevi–Edlove detachment
inventory](2026-09-22-gurudevi-edlove-detachment-inventory.md) records the
active references and provider decisions. Review it before changing package
IDs, auth, DNS, or external identities.

The Android verification, signing, Google OAuth, and internal-test procedure is
in the [Google Play and Google OAuth release runbook](../../apps/gurudevi-mobile/docs/runbooks/2026-09-22-google-play-google-oauth-release-runbook.md).
