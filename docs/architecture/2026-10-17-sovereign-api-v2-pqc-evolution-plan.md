---
title: "Sovereign API Evolution 2026: oRPC v2, Supabase Middleware 1.0, POA, and Post-Quantum Architecture"
status: "proposed"
created: 2026-10-17
author: "Naveen"
scribe: "Antigravity (Solution Architect & Hostile Reviewer)"
tags: [architecture, orpc, supabase, security, pqc, cedar, poa]
---

# Sovereign API Evolution: oRPC v2, Supabase Middleware 1.0, POA, & Post-Quantum Cryptography

> **THE COGNITIVE HANDSHAKE**
> - **Surface & Mode**: API Spine, Contract Layer & Platform Cryptography (`Implement / Plan Mode`)
> - **Grounded Substrate**: [`packages/core/src/api/orpcClient.ts`](file:///c:/x/packages/core/src/api/orpcClient.ts), [`apps/sanctuary-api/src/core/orpcMiddleware.ts`](file:///c:/x/apps/sanctuary-api/src/core/orpcMiddleware.ts), [`apps/sanctuary-api/src/core/app.ts`](file:///c:/x/apps/sanctuary-api/src/core/app.ts), [`packages/core/src/api/contracts.ts`](file:///c:/x/packages/core/src/api/contracts.ts), [`apps/gurudevi-mobile`](file:///c:/x/apps/gurudevi-mobile), `@supabase/middleware 1.0`, NIST FIPS 203 ML-KEM.
> - **Active Seam & Constraints**: Multi-client blast radius across native iOS/Android, Web, and Railway Hono API. Zero-downtime wire compatibility and the Native Deletion Veto.

---

## 1. Executive Summary & Architectural Theses

We stand at a convergence point for the Sovereign API infrastructure:
1. **oRPC v2 Beta (`2.0.0-beta.44`)**: Decouples routing into pure metadata, adopts Zod v4 natively, and replaces ad-hoc iterators with `AsyncIteratorObject`. **However, it introduces breaking wire serializer changes, eliminates `error.status`, and reorganizes procedure introspection.**
2. **Supabase Middleware 1.0 (`@supabase/middleware`)**: Released mid-October 2026, introducing a universal Web Fetch standard middleware pipeline with typed `ctx` composition and `@supabase/server` token/client delegation.
3. **Proof of Authority (POA)**: Our CASL/Cedar authorization layer in [`packages/core/src/api/contracts.ts`](file:///c:/x/packages/core/src/api/contracts.ts) requires a cleaner decoupling from Hono transport and procedure routing.
4. **Post-Quantum Cryptography (PQC)**: Industry migration to NIST FIPS 203 (`ML-KEM-768`) and Cloudflare's hybrid `X25519MLKEM768` key agreement requires edge-to-origin transit protection and field-level sensitive data sealing.

---

## 2. The Hostile Critic Audit (Pragmatic Reality Check)

Before writing migration code, the Hostile Reviewer must stress-test each assumption against empirical code:

### Myth 1: *"oRPC v2 churn is mostly additive; upgrading won't hurt much."*
**REALITY: FALSE.** A naive upgrade will catastrophically break both backend and mobile clients:
- **Crash 1 (Mobile Wire Incompatibility)**: v1 `RPCLink` cannot deserialize v2 server wire payloads. Native iOS/Android builds (`apps/gurudevi-mobile`) in production would immediately fail on every RPC mutation and sync upload.
- **Crash 2 (Procedure Introspection)**: In [`apps/sanctuary-api/src/core/orpcMiddleware.ts:134`](file:///c:/x/apps/sanctuary-api/src/core/orpcMiddleware.ts#L134):
  ```ts
  const routePath = procedure['~orpc'].route.path;
  ```
  In v2, `.route` was removed from the builder. This throws `TypeError: Cannot read properties of undefined (reading 'path')` on all authorized requests.
- **Crash 3 (Client Error Status Stripped)**: In [`packages/core/src/api/orpcClient.ts:54`](file:///c:/x/packages/core/src/api/orpcClient.ts#L54):
  ```ts
  const status = (options.error as any)?.status;
  if (status === 503) return false;
  ```
  `ORPCError` in v2 no longer carries `status`. It is `undefined`, silently crippling retry policies and error boundaries.
- **Crash 4 (Batch Filter Semantics Inversion)**: `BatchLinkPlugin.exclude` was replaced with `filter`, which inverts boolean logic (`false` = do not batch). Direct mapping will batch what was meant to be isolated.
- **Crash 5 (GET Rejected by Default)**: In v2, `RPCHandler` rejects `GET` requests unless `allowMethods: ['GET', ...]` is passed. Our client sends `GET` for cached queries (`context?.cache`), triggering `405 Method Not Allowed`.

### Myth 2: *"We should run Post-Quantum Kyber algorithms inside Node.js/TypeScript application code."*
**REALITY: FALSE (Dangerous Anti-Pattern).**
Running JavaScript/Wasm lattice math inside Node.js/Bun for request transit wastes CPU cycles, increases memory pressure, and introduces side-channel vulnerabilities. 
- **The Correct Pattern**: Cloudflare edge network terminates hybrid `X25519MLKEM768` TLS at wire speed. Transit between Cloudflare and Railway origin is secured via Cloudflare Tunnel (`cloudflared`) with PQC enabled.
- **Application-Layer PQC**: Only applied for **at-rest field encryption** (e.g., student psychological journals, biometric records) using native libsodium or audited WebCrypto envelopes.

### Myth 3: *"Supabase Middleware 1.0 replaces our Hono and Cedar architecture."*
**REALITY: FALSE.**
Supabase Middleware 1.0 is a composable fetch-handler pipeline. It excels at request context hydration (validating Supabase session JWTs, caching claims, creating scoped Supabase clients). Our Hono layer remains the transport spine (the *Lotus Principle*), while Cedar/Rust remains the deep authorization evaluator.

---

## 3. The Holistic Architecture Blueprint

```
                      +-------------------------------------------------------------+
                      |               CLIENT LAYER (Mobile & Web)                   |
                      |  - apps/gurudevi-mobile (Expo 58 / RN 0.88)                 |
                      |  - apps/gurudevi-web (Next.js 16)                           |
                      +------------------------------+------------------------------+
                                                     |
                                                     | TLS 1.3 + Hybrid X25519MLKEM768 (PQC)
                                                     v
                      +-------------------------------------------------------------+
                      |                   CLOUDFLARE EDGE                           |
                      |  - Post-Quantum Key Agreement (FIPS 203 ML-KEM-768)         |
                      |  - WAF, Rate Limiting, DDoS Protection                      |
                      +------------------------------+------------------------------+
                                                     |
                                                     | Cloudflare Tunnel (cloudflared PQC Transit)
                                                     v
                      +-------------------------------------------------------------+
                      |           RAILWAY ORIGIN: sanctuary-api (Hono)              |
                      |                                                             |
                      |  [Step 1: Ingress Security & Tracing]                      |
                      |   - Correlation ID, OpenTelemetry, Secure Headers           |
                      |                                                             |
                      |  [Step 2: Supabase Middleware 1.0 Pipeline]                 |
                      |   - defineMiddleware: withSupabaseAuth, withClaims          |
                      |   - Eliminates 200 LOC manual JWKS caching in jwt.ts        |
                      |                                                             |
                      |  [Step 3: Dual-Wire oRPC Ingress Gateway]                   |
                      |   - /api/v1/* (v1 Wire Handler for legacy mobile builds)    |
                      |   - /api/v2/* (v2 Wire Handler for web & modern clients)   |
                      |                                                             |
                      |  [Step 4: Cedar / POA Authorization Gate]                   |
                      |   - Evaluates POAMetadata (Action/Subject) via Rust worker  |
                      |   - Hydrates principal & tenancy context                    |
                      +------------------------------+------------------------------+
                                                     |
                                                     v
                      +-------------------------------------------------------------+
                      |            DOMAIN SERVICES & STORAGE LAYER                  |
                      |  - ZenStack V3 Client (ReBAC access policies)              |
                      |  - PostgreSQL (Supabase / Neon)                             |
                      |  - PQC Sealed Envelopes (Sensitive journals at rest)        |
                      +------------------------------+------------------------------+
```

---

## 4. Phase-Gated Implementation Plan (`/plan`)

### Phase 0: Dependency Hygiene & Immediate Stabilization (Day 1)
- **Goal**: Clean up the dependency leak in `apps/sanctuary-api`.
- **Actions**:
  1. Pin all `@orpc/*` packages across `packages/core`, `apps/sanctuary-api`, and `apps/gurudevi-web` to **`1.15.7`**.
  2. Revert `@orpc/opentelemetry` and `@orpc/pino` from `2.0.0-beta.31` back to `1.14.11` (or matching v1 stable).
  3. Run `pnpm run check:anti-slop` and verify clean G0/G1 contracts.

### Phase 1: Supabase Middleware 1.0 Adoption in Hono (Days 2–3)
- **Goal**: Modernize request context hydration using Supabase's official middleware engine while preserving the Lotus Principle.
- **Actions**:
  1. Install `@supabase/middleware` and `@supabase/server` in `apps/sanctuary-api`.
  2. Create `src/core/middleware/supabaseAuthPipeline.ts`:
     - Compose `withSupabase` and `withClaims` using `pipeline`.
     - Replace the custom 200-line JWKS cache in [`apps/sanctuary-api/src/jwt.ts`](file:///c:/x/apps/sanctuary-api/src/jwt.ts).
  3. Bridge the typed context into Hono `c.set('user', claims)` and `ORPCContext`.
  4. Verify existing integration tests (`canonical-account.security.test.ts`).

### Phase 2: Post-Quantum Security & Edge Hardening (Days 3–4)
- **Goal**: Full PQC transit coverage without slowing down application CPU.
- **Actions**:
  1. **Cloudflare Dashboard / Terraform**:
     - Verify `Post-Quantum Cryptography` is set to `Enabled` (defaulting to hybrid `X25519MLKEM768`).
     - Audit packet MTU and fragmentation handling for mobile networks.
  2. **Origin Tunnel Transit**:
     - Configure `cloudflared` ingress with `--post-quantum` flag enabled for the Railway service tunnel.
  3. **Application-Layer Sealing (PQC Data at Rest)**:
     - Design `PQCSealedRecord` schema in `@repo/core` for ultra-sensitive fields (FERPA/PDPA student reflection logs).
     - Utilize hybrid key encapsulation (classical X25519 + ML-KEM-768 ciphertext) before writing to PostgreSQL JSONB columns.

### Phase 3: The Dual-Wire oRPC Gateway (Days 5–7)
- **Goal**: Upgrade to oRPC v2 without violating the Deletion Veto or cutting off mobile clients.
- **Actions**:
  1. **Dual-Handler Strategy**:
     - Maintain `/api/v1/rpc` backed by v1 serialization for existing mobile builds.
     - Mount `/api/v2/rpc` backed by v2 `RPCHandler` with `allowMethods: ['GET', 'POST']` and `GetMethodCsrfProtectionHandlerPlugin`.
  2. **Procedure Metadata Refactoring**:
     - Refactor [`apps/sanctuary-api/src/core/orpcMiddleware.ts`](file:///c:/x/apps/sanctuary-api/src/core/orpcMiddleware.ts) to use `defineMeta('poa')` instead of relying on `procedure['~orpc'].route.path`.
  3. **Client Upgrades**:
     - Upgrade [`packages/core/src/api/orpcClient.ts`](file:///c:/x/packages/core/src/api/orpcClient.ts):
       - Split `url` into `origin` and `url: '/api/v2/rpc'`.
       - Migrate `BatchLinkPlugin` to use `filter` with negated logic.
       - Rename `ClientRetryPlugin` $\rightarrow$ `RetryLinkPlugin`.
       - Map error checking via `isDefinedError(error)` instead of `(error as any)?.status`.
  4. **Mobile Bundle Verification**:
     - Update mobile client to use v2 client. Verify with `G3/G4` component mounting and offline queue replay tests.

---

## 5. Verification Gate & Attestation Checklist

Before any phase is declared complete:
- [ ] `pnpm run check:anti-slop` exits 0.
- [ ] No `(error as any)?.status` reads remain in client retry plugins.
- [ ] Mobile offline sync (`inngestEvents.ts` and `applyPowerSyncBatch`) passes without wire deserialization errors.
- [ ] Cloudflare TLS negotiation attests `X25519MLKEM768` cipher suite via test probe.
- [ ] Zero duplicate middleware executions detected in OpenTelemetry spans.
