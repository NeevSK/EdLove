---
title: "Owned PowerSync credential boundary"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, powersync, credentials, acceptance]
---

# Sanctuary sync grant boundary

The hosted development download probe established that a copied Supabase JWT
still downloaded a complete PowerSync checkpoint after global logout. The
connector's live identity check cannot revoke credentials used directly against
the service. This record implements the server side of a separate sync grant;
the remote trust and client cutover are still required.

## Contract and implementation

`POST /api/auth/sync-credentials` requires the existing uncached live provider
session check, an explicitly nonanonymous provider user, and an active canonical
account resolved from the authoritative database binding. Request-body account,
expiry and audience values have no authority. There is no credential cache or
provider-token fallback in this endpoint. Provider/database/configuration failure
denies issuance with a fixed error and no credential or upstream diagnostic.

The response uses Core's strict `SyncCredentialsSchema`: canonical `accountId`,
PowerSync `endpoint`, signed `token`, and integer epoch-second `expiresAt`.
`sub` and `canonical_account_id` both identify the account UUIDv8; `aud` is the
configured service origin. The ES256 grant lasts at most 300 seconds and never
outlives the admitted provider JWT. Each signature is checked against the public
coordinates before returning it, so mismatched key material fails closed.

`GET /api/auth/sync-jwks` explicitly projects public coordinates and key metadata.
Both routes return `private, no-store`. The active private P-256 JWK comes only
from runtime `POWERSYNC_SIGNING_JWK`, with required `kid`, `kty`, `crv`, `x`, `y`
and `d`. Persist a real service key in Doppler, never a workspace plaintext file.
The service origin comes from `POWERSYNC_URL` or its existing public counterpart;
unsafe transport, paths, credentials, query and fragment values are rejected.

The routes are mounted in the existing auth namespace before the oRPC catch-all.
At the issuance checkpoint, the native connector still used the provider
credential path and no PowerSync service configuration or signing secret had
changed. The subsequent development trust/client cutover is recorded below.
Missing configuration returns 503; it cannot silently select the provider's
signing key.

## Grounding and revocation limits

The [official custom-auth flow](https://docs.powersync.com/configuration/auth/custom)
uses backend-issued, audience-bound grants and asymmetric JWKS. The exact deployed
service version [1.27.2 KeyStore](https://github.com/powersync-ja/powersync-service/blob/v1.27.2/packages/service-core/src/auth/KeyStore.ts)
uses 60 seconds of clock tolerance during JWT admission. Its
[token stream](https://github.com/powersync-ja/powersync-service/blob/v1.27.2/packages/service-core/src/sync/util.ts)
ends at expiry, and the [stream composition](https://github.com/powersync-ja/powersync-service/blob/v1.27.2/packages/service-core/src/sync/sync.ts)
aborts when either constituent iterator ends. These source observations inform
the intended bound; they do not replace an actual deployed expiry/stream test.
An already-issued grant remains a bearer credential until expiry. The intended
admission window includes the service's 60-second tolerance, not an immediate
remote-revocation guarantee. Already downloaded offline data needs its own
account-switch/cache lifecycle acceptance.

## Evidence

G1 / Vitest 5.0.5 with real Node WebCrypto and substituted provider/account DB:
25 grant cases succeeded. Combined with the existing gateway and credential
inventory suites, 55 cases across three files succeeded. Assertions cover
cryptographic verification, canonical subject/audience, TTL clamp, public-only
JWKS, mismatched keys, repeated live admission, revoked/anonymous sessions,
account removal/outage, unsafe endpoints and invalid configuration. This does
not prove a deployed PowerSync trust configuration or native SDK behavior.

Hosted development scenario / real Supabase issuer and canonical PostgreSQL,
in-process Sanctuary Hono route, ephemeral acceptance-only signing key: password
login issued a correctly scoped, cryptographically verified grant; actual global
logout made the next grant request return 401. No mock provider or database was
used. No public API deployment, PowerSync-owned-key admission, email ownership,
device or production evidence is claimed. Fixture marker
`20261026-owned-sync-grant`: one synthetic account was globally revoked and
banned in cleanup; the retained account remains a lifecycle-cleanup obligation.
No bond rows were created. Admin fixture email confirmation is not an ownership
ceremony. Tokens, password, key and downloaded provider data stayed in memory.

G0 / API TypeScript check and forced Core declaration build succeeded. Scoped
Biome and explicitly enabled cognitive-complexity checks succeeded. Broad
anti-slop still exits 1 on the same 48 native findings; no gate was weakened.
CNG, version-drift and test-command evidence audits exited 0. The device-evidence
audit also exited 0 using its certified baseline layout fixture; this run did
not execute the changed auth flow on a device and adds no G5 acceptance.

## Development trust and client cutover

The active ES256 key was generated once and persisted in Doppler
`gurudevi-mobile:dev` as `POWERSYNC_SIGNING_JWK` through CLI stdin. No key was
printed or persisted as plaintext. `powersync/service.yaml` contains public
verification coordinates only. The CLI schema, connection and stream validation
checks succeeded before `deploy service-config` completed for Development
`69f985158d064eb85ee933e0`, project `69f98513b0f9f400071f2114`. Production was
not targeted. The remote configuration now has `supabase: false`, temporary
tokens disabled, and the owned ES256 public key as its sole verification key.

The pre-cutover configuration is backed up with Windows CurrentUser DPAPI at
`C:/Users/Naween/.codex/backups/gurudevi-auth-20261025/powersync-dev-pre-owned-trust.json.dpapi`.
The existing remote replication connection uses a managed password `secret_ref`;
the local cloud configuration now preserves that representation. A post-deploy
fetch confirmed byte-equivalent serialized replication settings and identical
stream SQL before/after. No replication password was replaced from Doppler and
the sync streams were not redeployed. Service version remains 1.27.2, stream
version 7. Source diagnostics remain connected with no table/query errors.
The first status snapshot reported 1,424 bytes of replication lag; the final
snapshot reported 16,772,960 bytes. A subsequent direct PostgreSQL slot query
showed an active slot with `wal_status = reserved`, 2,688 unconfirmed WAL bytes
and 16,775,648 retained WAL bytes. These are distinct observations/measurements,
not proof of sustained zero lag or a sync-latency SLA. The status snapshots are
`reports/auth-owned-sync-grant-status.json` and
`reports/auth-owned-sync-grant-final-status.json`.

The connector now fetches the strict grant through the existing authenticated
transport and expected-account guard. After response parsing it rechecks the
active canonical owner, rejects expired/overlong metadata and unsafe service
URLs, then returns the owned token and expiry. The authoritative API selects the
sync endpoint. Five-second transport timeout and no caching/retries apply.
The direct provider-JWT return and redundant identity-only request are replaced;
local verified provider claims and every upload ownership/retry/acknowledgment
guard remain. Errors never fall back to a provider token.

G1 / Vitest: 42 cases across connector, offline-write scenario, connection
lifecycle and single-active-runtime suites succeeded. Provider/server/storage
boundaries were substituted. They prove owned-grant selection and failure/race
contracts under those substitutes, not a real SDK database or physical device.
G0 / forced Core declaration build and scoped Biome/complexity checks succeeded.
Broad anti-slop still exits 1 on the same 48 native findings.

### Actual hosted acceptance

Actual Supabase password sessions and authoritative hosted canonical accounts
obtained grants through the in-process Sanctuary route using the persisted Dev
signer. Both grants downloaded full checkpoints from actual hosted PowerSync.
Each received its own synthetic bond and no foreign-owned bond/other fixture;
spoofed client parameters could not change ownership. Exact fixture deletion
was reflected at a subsequent complete checkpoint. The provider JWT now returns
401 directly from PowerSync. Wrong-audience and modified-signature grants also
return 401, as does a genuinely signed token expired beyond the 60-second
admission tolerance.

A valid grant with 15 seconds remaining downloaded a checkpoint, emitted
`token_expires_in: 0` and ended its stream after 14,842 milliseconds. This is a
real expiry observation, not a fake-timer assertion. Actual global logout denied
the next Sanctuary renewal with 401. An already-issued unexpired grant still
downloaded successfully, confirming the documented residual bearer window.
Immediate invalidation of already downloaded offline data is not implied.

Fixture marker `20261026-owned-sync-cutover`: both synthetic bond rows were
removed with UUID/owner/marker predicates; both sessions were globally revoked
and both fixture accounts banned. A separate hosted count query confirmed zero
remaining tagged bonds and exactly two retained, banned accounts. Those records
still need lifecycle cleanup. Credentials and downloaded rows remained in
process memory. The saved acceptance summary is
`reports/auth-owned-sync-cutover-acceptance.json`.

No checksum-verified SDK local database, cache clearing on a real account switch,
offline queue/replay/reconnect, physical device, public Sanctuary API deployment,
email ownership or production behavior is established by this protocol probe.

### Connector feature spec

Blast Zone: AMBER. Target:
`packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts` and its
existing boundary suite. Reuse `fetchSession$`, `authenticatedSovereignFetch`,
`SOVEREIGN_API_URL`, `SyncCredentialsSchema`, secure URL validation and the
existing active-owner guard. Obtain the owned grant from the auth endpoint with
five-second transport timeout and no caching/retries. Validate the canonical
owner after the response body resolves, reject expired or overlong grants, and
return the grant endpoint/token/expiry to the SDK. Never return a provider JWT,
clear offline data, acknowledge a batch, or change upload semantics in this path.
The API owns the sync endpoint selection. Complexity must stay below 15.
Required G1 cases: success, denied/outage/malformed response, wrong account,
switch during request/body read, expired/overlong grant and unsafe endpoint.

Client expiry validation allows 60 seconds of forward clock skew, matching the
deployed service's admission tolerance. The server issuance ceiling remains
300 seconds. The initial client assertion rejected offsets above 300 seconds;
that would reject a legitimate grant when the device clock trails the server.
Its test threshold is deliberately corrected to 360 seconds, with a positive
skew case added. This changes client metadata admission, not signed token TTL.

## Local rotation implementation and evidence

Optional runtime `POWERSYNC_VERIFYING_JWKS` now contains one to three public
ES256/P-256 keys. The active signer's exact key ID and coordinates must be in
that set. Duplicate IDs, absent/mismatched active coordinates, private material,
wrong algorithms/usage/curve, malformed points and invalid serialized input
deny both issuance and publication. Actual WebCrypto imports validate every
public point. When the setting is absent, existing single-key behavior remains.
The JWKS route awaits configuration validation and sanitizes failures to 503.
No key or provider fallback is introduced, and live-session/TTL checks remain.

The new configuration supports the existing
[official publish–switch–retire sequence](https://docs.powersync.com/configuration/auth/custom):
publish old and next public keys first, wait for the actual remote service to
acknowledge/fetch the next key, then change the active private signer. Retain
the old public key until all issued grants expire, including the deployed
service's 60-second admission tolerance and operational clock uncertainty.
For inline hosted JWKS, both publication and retirement require a service-config
deployment; merely changing this endpoint does not update the currently inline
Development configuration. A compromised key may require emergency retirement
and forced reconnect rather than the ordinary overlap process. Neither path
implies deletion of already downloaded data.

G1 / Vitest 5.0.5 with real WebCrypto and substituted provider/account database:
the combined grant/gateway selections and rotation boundary cases succeeded.
G2 / local rotation Vitest scenario: real signatures with a virtual clock
verified overlap, signer switch and old-key removal. Across these three files,
60 cases succeeded; this combined count includes that one G2 scenario and is
not 60 real-provider/device cases. No assertion was weakened or removed.

An additional G2 local loopback HTTP rehearsal used an independent JOSE 6.2.8
verifier already installed with the PowerSync CLI. It fetched the actual JWKS
route, verified both signers during overlap, observed real-clock expiry of a
two-second grant, removed the old key, verified the new grant and confirmed
sanitized 503 for private-key input. This verifier used zero clock tolerance;
it does not reproduce PowerSync's 60-second admission window. The account was
synthetic, tokens were minted through the internal signing function, and no
provider/database/login/SDK/remote sync service participated. Keys and tokens
remained in memory. No dependency, Doppler value, hosted key, service config,
account fixture or production state changed. Summary:
`reports/auth-local-sync-key-rotation-acceptance.json`.

G0 / API TypeScript, scoped Biome and enabled complexity checks succeeded.
The two-entry ESM bundle succeeded with the existing recorded inherited ES2026
warning. Broad anti-slop still exits 1 on 48 native findings; CNG succeeded and
no gate was weakened. This is local key-overlap capability and verification,
not an executed hosted key rotation or a complete operational runbook rehearsal.

## Remaining acceptance

### Local key-overlap feature spec

Maintain mode. Targets: `core/syncCredentials.ts`, the existing JWKS route and
`auth-sync.test.ts`. Extend the existing signer configuration with optional
`POWERSYNC_VERIFYING_JWKS`, a strict public ES256/P-256 set of one to three keys.
Require unique key IDs and inclusion of the active signer's exact public
coordinates. Reject private key fields, wrong algorithms, malformed points,
empty/oversized sets and absent/mismatched active signers. Validate before
issuance as well as JWKS publication; default to the active public key when
the optional set is absent. Preserve the five-minute grant and live-session
admission. Rehearse publish old+new, switch signer, then remove old using real
local signatures and virtual time. No hosted key/config change or immediate
revocation claim. Complexity below 15; no second JWT framework/dependency.

Decide and rehearse key overlap/rotation before production admission. Admit the
publicly hosted Sanctuary deployment separately so a device can reach the same
grant endpoint with Doppler-injected signing material. Complete two-account SDK
cache/offline-queue and roster/membership revocation scenarios, authenticated
browser/native journeys and physical-device evidence. Preserve the five-minute
signed lifetime and the separately documented clock tolerance. The full
identity/auth/sync goal remains active.
