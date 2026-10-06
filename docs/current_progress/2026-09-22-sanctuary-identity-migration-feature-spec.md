---
title: "FEATURE SPEC: Sanctuary Identity Migration"
status: "proposal — RED approval required before implementation"
created: 2026-09-22
author: "Naveen"
scribe: "Codex"
tags: [feature-spec, red-zone, mobile, auth, domain, migration]
---

# FEATURE SPEC: Sanctuary Identity Migration

## Blast Zone

**RED:** native application identity, auth redirect origins, production hosts,
and deployment configuration.

## Target files and systems

- `apps/gurudevi-mobile/app.json` — Expo source-of-truth only; never generated
  `android/` or `ios/`.
- `apps/gurudevi-web` host routing and public association endpoints.
- `apps/sanctuary-api/src/core/app.ts` production CORS allowlist.
- deployed EAS, Apple Developer, Google Play, Supabase, OAuth provider,
  Vercel/Cloudflare, and secret-manager configuration.
- active runtime/docs/test references identified by the migration inventory.

## Outcome

Ship a new Gurudevi Sanctuary app identity:

- marketing: `https://gurudevi.app`;
- authenticated web app: `https://sanctuary.gurudevi.app`;
- Android application ID and iOS bundle ID: `app.gurudevi.sanctuary`;
- no active Gurudevi hostname, old mobile ID, or Gurudevi production config
  that depends on Edlove identity; standalone Edlove systems remain unchanged.

## Reuses

- Expo config plugins and existing EAS profiles/version policy;
- code-only callback handling, `DeepLinkManager`, route-intent policy, and
  existing Supabase auth adapters;
- existing build commands: `pnpm run build:android` for debug and EAS profiles
  for cloud release artifacts;
- existing evidence/running-app plan and route-intent test slice.

## Does not

- Edit `android/` or `ios/` directly.
- Attempt to upgrade existing `org.edlove.gurudevi` installations.
- Restore URL access/refresh-token auth callback handling.
- Delete or alter Edlove domains, accounts, app listings, content, or historical
  documents. They are outside this migration.
- Turn on passkeys, payments, or browser-offline support. Google sign-in is in
  scope; payment checkout is deliberately deferred.

## Assumptions requiring verification

| Assumption | Verification | If false |
| --- | --- | --- |
| Sanctuary host can be attached to the authenticated web deployment. | DNS/Vercel or Cloudflare host verification. | Stop before auth cutover. |
| New Android app identity is available in Google Play/EAS. | Create/inspect new identifier and release signing data. | Stop before Android native build. |
| Supabase/OAuth settings can accept Sanctuary final return URLs. | Read current settings, apply minimal scoped update, run provider round trip. | Keep old config intact; correct provider setup. |
| EAS project/account is accessible. | Read-only account/project/profile check. | Build locally only; request account access. |
| Current Gurudevi old-host references can be classified without touching Edlove-owned systems. | Scoped inventory and owner review. | Do not global replace/delete. |

## Threats and failure modes

| Threat/failure | Required control |
| --- | --- |
| Wrong package/bundle ID or signing fingerprint | Validate exact new ID and release certificate before publishing association files. |
| Old app receives an incompatible update | New app listing only; never repurpose old application ID. |
| OAuth callback reaches wrong host or accepts URL tokens | Exact Sanctuary redirects, code/PKCE flow, and existing fail-closed policy. |
| DNS/TLS/association file error strands login/app link | Verify anonymous HTTPS response, body, content type, and installed-device opening before promotion. |
| CORS/URL setting breaks authenticated app | Apply host changes in a candidate environment and run Layer-1 web/mobile matrix. |
| Gurudevi migration changes unrelated Edlove content or infrastructure | Scope inventory to Gurudevi-owned consumers; Edlove systems are excluded. |
| New native release cannot be debugged/rolled back | Preserve candidate SHA/build IDs; validate debug build first and keep release promotion separate. |

## Evidence plan

1. G0/G1: updated identity, callback, route-policy, and API-origin contracts;
   negative cases include old host, wrong host, malformed/replayed callback.
2. G3: local configured Next/Expo composition, with no generated-native edits.
3. G4: deployed `gurudevi.app` marketing and Sanctuary browser auth/recovery/
   sign-out/deletion evidence.
4. G5: installed Android new-identity binary; app links, cold start, auth,
   recovery, sign-out, and constrained-network cases. Native iOS is deferred
   until a paid Apple Developer distribution path exists.
5. Promotion packet: exact candidate SHA, EAS build IDs, association-file
   bodies/fingerprints, redirect/CORS checks, open waivers, and independent
   review.

## Rollback

Before external removal, roll back Sanctuary deployment/configuration to the
prior candidate while leaving old systems unchanged. After creating the new
listing, halt its rollout rather than altering the old listing. DNS or provider
deletion is deferred until the new hosted flow has production evidence and the
explicit external-disposition record is approved.

## First implementation tranche

1. Produce and review active-reference inventory.
2. Obtain Android release SHA-256, provider client IDs, and host ownership/
   access. Apple identity work is deferred with iOS distribution.
3. Implement the source configuration and hosted association endpoints.
4. Run scoped static tests plus debug build/device checks.
5. Apply external configuration one system at a time; run the real journey
   after each boundary change.
