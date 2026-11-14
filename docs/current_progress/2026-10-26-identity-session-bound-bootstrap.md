---
title: "Session-bound canonical identity bootstrap"
status: active
created: 2026-10-26
updated: 2026-10-26
author: Codex
tags: [auth, identity, transport, verification]
---

# Feature spec

Maintain mode; AMBER with the already-authorized server identity seam. Targets:
core `adapters/supabaseIdentity.adapter.ts`, a shared provider session-continuity
helper, `api/identity.ts`, `api/clientRuntime.ts`, `api/orpcClient.ts`; Sanctuary
`core/middleware/identityBridge.ts` and its existing CORS header list; matching
boundary and RPC tests. Reuse SDK session storage, APIError, typed oRPC context,
authenticatedSovereignFetch, verified provider result and canonical-account lookup.
No extra identity endpoint, local mapping, JWT decoder, schema migration or new
dependency. New functions have cognitive complexity below 15.

Installed auth-js 2.117.2 getUser may remove the current session on a missing-
session response. Redundant identity-path getUser calls can therefore destroy a
newer login. Replace those reads with local session continuity and existing
Sanctuary verification. Local user.id is a comparison assertion, not authority:
bind the request to its captured token and send an expected-subject header that
the server compares against the verified provider subject before account mapping.
Reject missing/mismatched tokens before network dispatch; reject a changed local
session before publishing the response. Exclude bound requests from batch/dedupe
plugins that replace context. No fallback to the provider UUID or direct writes.

The active-bond resolver remains a non-authoritative hint. Use a local session
read, and discard a persisted hint if its owning account changes during the read.
Preserve existing anonymous guest behavior. Cache/in-flight keys remain token-
specific; no access or refresh token enters an HTTP URL or product error message.

Required evidence: changed token before dispatch; installed RPC context retention;
wrong/untrusted local subject rejected by the server; A-to-B-to-A request isolation;
stale response rejection; session errors and no-session behavior; existing
canonical mapping, profile/onboarding and anonymous flows; CORS admission for the
new assertion header. Report all SDK/network/database substitutions explicitly.

## Implementation and evidence

The adapter now captures SDK getSession token/subject and passes typed
expectedSession context through the existing RPC transport. The shared bootstrap
API uses the same continuity helper, checks the session after the RPC response,
and retains session-specific in-flight deduplication. No-session returns null;
session-read errors and changed sessions reject with sanitized errors. Canonical
account validation remains independent of the provider UUID. The persisted bond
hint is discarded when the active canonical account changes during storage read.

Bound RPC requests bypass batching and GET deduplication because those plugins
can replace context. Owner-bound GET requests also bypass deduplication, closing
the analogous existing expectedAccountId context-loss case. Session-bound fetches
use no-store. The identity bridge compares the optional subject assertion against
the verified provider subject before canonical lookup; an assertion without
credentials or with a mismatched subject denies. The global CORS list admits the
header. This assertion applies to identity-bridge routes; it is not a new policy
for the separately verified /api/auth routes.

- G1/G2 / Vitest 5.0.5: the six-file core selection completed 101/101 cases.
  SDK/network/storage boundaries are substituted in the adapter/transport/API
  cases; the three existing SDK factory scenarios run actual auth-js with
  simulated HTTP and memory persistence. Existing manager and RPC error cases
  remain included. Log: reports/auth-identity-session-core-tests.log.
- G1 / Hono with substituted verifier and account database: 8/8 assertion and
  real-app CORS cases succeeded. G2 / actual adapter, oRPC client/plugins,
  RPCHandler, Hono bridge and identity handler with substituted SDK session,
  verifier and account database: 3/3 scenarios succeeded. These exercise distinct
  provider/canonical IDs, A-to-B-to-A token selection, and untrusted stored user
  denial before canonical lookup. The full serial API suite completed 966 cases
  across 125 files, with six existing skipped cases and one skipped file.
  After correcting the scenario's Hono context type, its 3/3 cases were rerun.
  Logs: reports/auth-identity-session-api-tests.log,
  reports/auth-identity-session-api-suite.log and
  reports/auth-identity-session-rpc-final.log.
- G0 / installed TypeScript: forced core declaration build and API noEmit check
  exit 0. Scoped Biome with cognitive complexity maximum 15 checks 11 files
  successfully. Workspace typecheck still reports seven community errors;
  ESLint 10.13.0/SonarJS 4.2.2 fails initialization while reading Void.
- Broader gates: CNG succeeds, native anti-slop reports 48 findings and stops
  the combined gate. Version-drift and test-evidence audits exit 0. Device
  evidence audit uses the certified baseline layout fixture; it supplies no
  physical-device evidence for this change.
- rn-terrain's installed-package affordance query succeeds. Its policy gate
  returns QUARANTINE_HOLD because the bitemporal index does not recognize
  @orpc/client 2.0.0-beta.46. Exit 0 from that CLI is not acceptance. Installed
  declarations and actual RPC scenarios ground the implementation, but the
  policy-index reconciliation remains unresolved. No gate was weakened.

The raw unified diff was reviewed, including removals of redundant SDK getUser
calls and preserving earlier server-owned profile/onboarding changes in the
shared dirty checkout. No route, credential method or test was removed. This
does not prove real provider JWT/session revocation, native SDK storage,
cross-tab restoration, SQLite queue preservation, or a real authenticated client
journey. Autonomous SDK events and broader device-account/sync lifecycle work
remain open. No external configuration changed in this slice.
