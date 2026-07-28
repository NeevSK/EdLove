# Docs-Grounded Architecture Analysis: Permissions, Feature Flags & Entitlements

**Date:** 2026-07-23
**Method:** All claims about the target architecture are cited from actual docs. Inferred claims are explicitly labeled. Code audit data from `2026-07-23-architecture-analysis.md` is used for comparison.

---

## 0. Documents Considered

### Authoritative (per June 20 source-of-truth hierarchy)

| # | Document | Date | Status | Why authoritative |
|---|----------|------|--------|-----------------|
| D1 | `docs/gurudevi-sanctuary-permission-architecture.md` | June 2026, Draft 1 | Active | Core permission architecture — the canonical description of the 4-gate model |
| D2 | `docs/2026-06-19-sanctuary-authorization-final-architecture.md` | 2026-06-19 | Accepted ADR | Final disposition on CASL, Shape 1/2, offline write gap |
| D3 | `docs/gurudevi-architecture-draft-1.md` | June 2026, Draft 1 | Active | Contains ADR-004 (capability tokens), ADR-005 (WASM singleton), ADR-006 (policy version), ADR-009 (three ports order) |
| D4 | `docs/gurudevi-data-state-lifecycle.md` | June 2026, Draft 1 | Active | Boot hydration flow, Zone A write flow, Cedar authorization flow — the "how data moves" companion |
| D5 | `docs/decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md` | 2026-06-20 | Active | Resolves authority hierarchy — newer docs override older code |
| D6 | `docs/gurudevi-registry-architecture.md` | June 2026, Draft 1 | Active | Domain registry + citizenship model, companion to D1 |

### Superseded / Historical

| # | Document | Notes |
|---|----------|-------|
| H1 | `apps/gurudevi-mobile/docs/architecture/authorization.md` (2026-03-30) | Describes the 6-layer pre-sanctuary stack (CASL, POA, etc.). Superseded by D1-D4. |
| H2 | `apps/gurudevi-mobile/docs/architecture/2026-05-16-gurudevi-authorization-architecture-audit.md` | Historical audit. Referenced in D2 as evidence of CASL migration status. |
| H3 | `apps/gurudevi-mobile/docs/architecture/2026-05-18-gurudevi-offline-authorization-architecture.md` | Predecessor to the Cedar WASM offline architecture. Superseded by D3 (ADR-005) and D2. |
| H4 | `packages/core/docs/architecture/2026-06-12-hexagonal-ports-adapters-rollout.md` | Superseded by D2 regarding CASL disposition (D2 explicitly supersedes the ambiguity). |

### Deleted During Cleanup

| # | Document | Notes |
|---|----------|-------|
| X1 | `apps/gurudevi-mobile/docs/decisions/2026-06-10-offline-authorization-and-gating.md` | Referenced by search but file no longer exists. Content likely subsumed by D3 (ADR-005). |
| X2 | `docs/decisions/002-sovereignty-grants-pattern.md`, `003-feature-flag-architecture.md` | Superseded, deleted in Phase 3.4 cleanup. |

---

## 1. Documented Target Architecture vs Inferred Target

### 1.1 The Four Gates — DOCUMENTED

From D1 (Section 1 — Core Philosophy):

> ```
> Gate 1 — Citizenship   "Is this user sufficiently in the system?"
> Gate 2 — Entitlement   "Has the tenant paid for this capability?"
> Gate 3 — Cedar (authz) "Does this principal have structural permission for this action on this resource?"
> Cross-cut — Feature flags  "Is this code path operationally active?" (not a gate — a deployment state descriptor)
> ```

From D3 (ADR-009):

> "Evaluation order is strict and short-circuits: entitlement first (cheapest, no WASM, no network), Cedar second, feature flag third. A false at any stage stops evaluation immediately."

**Note on feature flags:** Both D1 and D3 agree that feature flags are a *cross-cut*, not a gate. D1 says "not a gate — a deployment state descriptor." D3 says "feature flag third" in the short-circuit order. These differ — D1 categorizes flags as not-a-gate, D3 places them third in evaluation order. The June 20 hierarchy (D5) says D1 and D3 are "the broader sanctuary docs" that should be used for "the system model." The document says the June 19 ADR (D2) "should not be used to erase the broader architecture around the feature-flag rollout split." So the D1 position (flags are cross-cut, not a gate) is the system-model position, and D3's "third gate" ordering is implementation guidance within that model. **There is a minor tension here that is not resolved — see Open Questions.**

### 1.2 The Evaluation Function — DOCUMENTED

From D1 (Section 5):

```typescript
sanctuaryFeature(
  action: string,
  subject: string,
  context: SanctuaryEvaluationContext,
  resource?: ResourceRef
): SanctuaryFeatureResult
```

> "Pure function — no React, fully testable."

From D2 (Section 5.3):

> "Any query that returns records destined for action buttons must attach the Shape 2 verdict at fetch time, as a field on the returned object. Components only ever read an already-computed field — they never decide."

This is the "No False Buttons" rule.

### 1.3 The Fallback Chain — DOCUMENTED in parts, INFERRED in whole

**D3 (ADR-005):**

> "The Cedar `evaluate` function is imported once at module scope and stored as a module-level singleton."

> "On first load and after invalidation, the client fetches a fresh snapshot from the server. Between fetches, it evaluates against the cached snapshot."

**D4 (Section 8 — Cedar Authorization Flow):**

```
Step 2 — IEntitlementPort.getCapabilities(tenantId)
Step 3 — Cedar WASM evaluation (module singleton, loaded at boot)
Step 4 — IFeatureRolloutPort.isFeatureActive(flagKey)
```

**INFERRED, NOT DOCUMENTED — The server-first fallback:** No document says "call server Cedar first, then fall back to local WASM, then fall back to signed snapshot." The documents describe a *parallel* model: server Cedar on the online write path (confirmed secure in D2 Section 6.2), and local Cedar WASM on the offline path. The offline path uses the pre-computed `permission_snapshots` table as its data source, not as a WASM-failure fallback. The "fallback chain" that was described in the previous analysis (server → local WASM → snapshot) was an inference, not a documented requirement.

**What IS documented (D4 Section 8):**

```
1. Check Zustand for existing valid token for this context
2. IEntitlementPort.getCapabilities(tenantId)
3. Cedar WASM evaluation (module singleton, loaded at boot)
4. IFeatureRolloutPort.isFeatureActive(flagKey)
5. Store token in Zustand
6. All writes in this operation context use the token
```

The offline path does not have a "try WASM, fall back to snapshot" fallback in the docs. The snapshot IS the data source for the local path. The WASM evaluates against the snapshot. This is a single path, not a two-step fallback.

**The native snapshot fallback in `localEvaluator.native.ts`** (try WASM, if fails try permission_snapshots table directly) is **INFERRED, NOT DOCUMENTED** — the docs describe the snapshot as the data source that feeds WASM evaluation, not as a separate evaluation method.

### 1.4 WASM Loading Strategy — DOCUMENTED

From D3 (ADR-005):

> "The Cedar `evaluate` function is imported once at module scope and stored as a module-level singleton. Policy snapshots are server-generated, HMAC-signed, and stored in the existing `permission_snapshots` table."

From D4 (Section 0 — Layer Map):

> "Authorization — Cedar WASM. Loaded once at module scope. Evaluates against locally cached policy snapshot."

From D4 (Section 1 — Boot Hydration):

> "4. Warm Cedar WASM module — module-level singleton — const { evaluate } = await import('@cedar-policy/cedar-wasm/web') — cached for session — never re-imported"

### 1.5 HMAC Signature Verification — DOCUMENTED

From D3 (ADR-005):

> "Policy snapshots are server-generated, HMAC-signed, and stored in the existing `permission_snapshots` table in Zone A. The client trusts the HMAC signature, not the content independently."

From D2 (Section 6.3):

> "server returns HMAC-signed snapshot — store in permission_snapshots table"

### 1.6 Entitlement Port Contract — DOCUMENTED

From D1 (Section 3 — Gate 2):

```typescript
interface IEntitlementPort {
  getCapabilities(tenantId: string): Promise<TenantCapabilities>
}
```

From D1:

> "IEntitlementPort never puts pricing tier attributes into Cedar context. Entitlement is resolved before Cedar is invoked. Cedar sees structural attributes only."

From D3 (ADR-009):

> "`active_capabilities` in Cedar principal context must not carry pricing tier derivatives — Cedar sees structural attributes only. Pricing translation happens inside IEntitlementPort, not inside Cedar policies."

### 1.7 Feature Flag Boundaries — DOCUMENTED

From D1 (Section 3 — Feature Flags):

> "Flags are resolved via IFeatureRolloutPort backed by GrowthBook (or equivalent). Local cache in storage (MMKV). Offline default: fail open unless flag is tagged kill-switch."

From D5 (Section 6):

> "GrowthBook is the intended primary rollout engine. A local offline cache is required."
> "permissionsMap should not be expanded into rollout flags."

### 1.8 Capability Token Pattern — DOCUMENTED

From D3 (ADR-004):

> "Cedar evaluates once per operation context, not per write."
> "All writes within that context use the token without re-evaluation."

From D4 (Section 8):

> "Token must be invalidated on account swap, logout, and policy version change."

### 1.9 The `useCedarDecision` Hook — DOCUMENTED (planned)

From D1 (Section 5):

```typescript
useSanctuaryFeature(
  action: string,
  subject: string,
  resource?: ResourceRef
): SanctuaryFeatureResult
```

From the cleanup plan (`docs/2026-07-23-permission-feature-cleanup-plan.md`, Phase 1.1):

> "Files to create: packages/core/src/logic/permissions/useCedarDecision.ts — New hook that directly evaluates Cedar WASM instead of reading pre-computed permissionsMap."

**This hook was planned but never created.** What exists instead:
- `useCedarDecisionStore` (Zustand store that reads `permission_snapshots`)
- `useSanctuaryFeature` (the hook from D1 — but it reads from `useCedarDecisionStore`, not from Cedar WASM directly)

---

## 2. Reconciliation Table

### 2.1 Core Architecture

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **Gate order** | Citizenship → Entitlement → Cedar → Feature Flag (D1, D3) | `sanctuaryFeature()` checks in this order ✅ | — |
| **sanctuaryFeature() pure function** | Pure function, no React (D1 Section 5) | Pure function in `sanctuaryFeature.ts`, tested ✅ | — |
| **SanctuaryFeatureResult** | Composed type with `reason` for each failure (D1 Section 4) | Defined and used correctly ✅ | — |
| **Cedar data source** | Server-signed `permission_snapshots` table (D3 ADR-005) | `useCedarDecisionStore` reads `permission_snapshots` — but HMAC verification is missing | **(a) code deviates** |

### 2.2 Cedar WASM Loading

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **WASM import strategy** | Module-level singleton, cached for session, never re-imported (D3 ADR-005, D4 Section 1) | `cedarClientEvaluator.ts` has singleton ✅. `localEvaluator.ts` imports per-call ❌ | **(a) code deviates** |
| **WASM warmup at boot** | Warmed eagerly at boot step 4, before first permission check (D4 Section 1) | NOT warmed at boot. First `evaluate()` call triggers lazy import. | **(a) code deviates** |
| **Snapshot invalidation** | `policy_version` Zone A table, `useLiveQuery` triggers invalidation (D3 ADR-006, D4 Section 7) | Not implemented. No `policy_version` table in schema. | **(a) code deviates** |
| **Capability token invalidation on policy change** | Tokens cleared when `policy_version` changes (D3 ADR-006) | Not implemented — no invalidation mechanism exists | **(a) code deviates** |

### 2.3 HMAC / Security

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **Permission snapshot HMAC** | Server-generated, HMAC-signed, client verifies (D3 ADR-005, D2) | `useCedarDecisionStore.loadDecisions()` does NOT call `verifySnapshotSignature()` | **(a) code deviates** |
| **Policy content HMAC** | Cedar policies from `cedar_policies` table signed via HMAC (D1 Section 8, crypto.ts intent) | `verifyLocalPolicySignature()` returns `true` when no signature provided. `cedarPolicies` table has no `signature` column. | **(b) docs and code exist but never reconciled** |
| **Snapshot signature verification** | `verifySnapshotSignature` exists in `signature.ts` | Used by `usePermissionStore` and `localEvaluator.native.ts`, correct ✅ | — |

### 2.4 Entitlement Port

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **IEntitlementPort** | `getCapabilities(tenantId)` returns `TenantCapabilities` (D1, D3 ADR-009) | `SupabaseEntitlementAdapter` implements `getEntitlements(userId)` — different method signature | **(b) never reconciled** |
| **Entitlement data source** | `pricing_manifest` Zone A table, server-sourced (D3 ADR-009) | `pricingManifest` Drizzle table exists ✅, adapter reads from it ✅ | — |
| **No pricing tier in Cedar context** | Pricing tier never put into Cedar entity attributes (D1 Section 3, D3 ADR-009) | `CedarAuthorizationAdapter` passes empty attrs — no tier leakage ✅ | — |
| **Wired into sanctuaryFeature** | Entitlement gate checks `activeEntitlements` (D1 Section 5) | Wired via `useEntitlementStore` → `activeEntitlements` in `SanctuaryEvaluationContext.entitlement` ✅ | — |

### 2.5 Feature Flag Port

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **IFeatureRolloutPort** | `isFeatureActive(flagKey)` (D3 ADR-009) | `GrowthBookFeatureRolloutAdapter` implements the interface ✅ | — |
| **GrowthBook as primary** | GrowthBook is intended primary rollout engine (D5 Section 6) | `featureFlag.factory.ts` exports `GrowthBookFeatureRolloutAdapter` ✅ | — |
| **Local flag cache** | Local cache in `storage` (MMKV), offline default fail open unless kill-switch (D1) | GrowthBook adapter has persistent caching? Needs audit. Feature store persists to storage ✅ | — |
| **Feature flags not in permissionsMap** | `permissionsMap` should not be expanded into rollout flags (D5 Section 6) | `permissionsMap` is being replaced by `useCedarDecisionStore` ✅ | — |
| **Read through port, not store** | UI should read from `IFeatureRolloutPort` | `useSanctuaryFeature` reads from `useFeatureStore` Zustand, not through the port | **(b) never reconciled** |

### 2.6 Adapters / Ports

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **IAuthorizationPort** | `issueCapabilityToken()` + `isPermitted()` (D3 ADR-004, D3 Section 2.3) | `CedarAuthorizationAdapter.isAuthorized()` — different method. No token issuance. | **(b) never reconciled** |
| **Capability token** | Issued per operation context, used for all writes without re-evaluation (D3 ADR-004) | Not implemented. `secureDrizzleProxy` calls `_permissionValidator` on EVERY write. | **(a) code deviates** |
| **SecureDrizzleProxy security boundary** | Online: Hono Gateway, Offline: SecureDrizzleProxy (D2 Section 2) | Both exist ✅. Offline proxy calls `checkLocalPermission` which evaluates per-write | **(a) code deviates from ADR-004** |
| **Server Cedar write path** | "confirmed secure" — Hono Gateway's `poa()` middleware runs Cedar (D2 Section 6.2) | Not audited in this pass — outside `packages/core` scope | — |

### 2.7 Stores

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **usePermissionStore** | Obsolete — marked for deletion (D1 Section 9, D2 Action Items) | Still exists, loaded at boot alongside `useCedarDecisionStore` | **(a) code deviates** |
| **useCedarDecisionStore** | Should replace `usePermissionStore` | Created ✅ but loads same table without HMAC verification ❌ | **(a) security gap** |
| **Dual store load at boot** | Should only load new store | Both loaded in `_layout.tsx` | **(a) code deviates** |

### 2.8 Local Evaluator Duplication

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **Platform-specific evaluators** | No doc describes having three `localEvaluator.*.ts` files | Three variants exist: default, `.native.ts`, `.web.ts` | **(c) no doc — design gap** |
| **Native snapshot fallback** | Described in X1 (deleted doc), content not recoverable | `localEvaluator.native.ts` tries WASM, falls to `permissionSnapshots` | **(c) doc deleted** |
| **WASM per-call import** | Forbidden by ADR-005 — must be module singleton | `localEvaluator.ts` and `.native.ts` import per-call | **(a) code deviates** |

### 2.9 Dead Code

| Component | Doc Says | Code Does | Gap Type |
|-----------|----------|-----------|----------|
| **IFeatureFlagPort** | No doc mentions this interface | Exists in code, `@deprecated` marker, no implementer | **(c) no doc — code-only artifact** |
| **useFeatureRegistry** | D1 Section 7 describes refactored version | Code version exists but is not barrel-exported, zero consumers found | **(b) docs and code never reconciled** |
| **useDomainFeature** | No doc mentions this hook | Exists, barrel-exported, zero consumers found | **(c) no doc — code-only artifact** |

---

## 3. Open Questions

These are points where the docs are silent, contradictory, or I'm not confident which document is authoritative.

### Q1: Is feature flag a "gate" or "cross-cut deployment descriptor"?

- D1 (Section 1) says: "Cross-cut — Feature flags — not a gate — a deployment state descriptor"
- D3 (ADR-009) says: "feature flag third" in the short-circuit evaluation order
- D2 (Section 2) says: Cedar is the exclusive authorization source of truth, feature flags are operational
- D5 (Section 2) says: "The June 19 ADR is supplementary, not absolute" and "should not be used to erase the broader architecture around the feature-flag rollout split"

**Unresolved:** If flags are "not a gate," should `sanctuaryFeature()` check them at all? Or should flags be checked in a separate layer? The code checks them as the last step inside `sanctuaryFeature()`.

### Q2: What is the actual intended fallback chain for offline permission evaluation?

- D4 (Section 8) describes a single path: check cache → entitlement → Cedar WASM → feature flag
- D2 (Section 6.3) says offline writes are currently incomplete and scoped as follow-up
- The `localEvaluator.native.ts` implements a two-step fallback (WASM → snapshot) that no doc describes

**Unresolved:** Should the offline path be:
- (a) WASM always, with snapshot as WASM failure fallback (what `.native.ts` does)?
- (b) WASM against snapshot data (what `cedarClientEvaluator` does — the doc-described path)?
- (c) Snapshot directly, WASM is server-side only?

### Q3: What is the `IAuthorizationPort` contract supposed to be?

- D3 (ADR-004 + Section 2.3) defines it as: `issueCapabilityToken() + isPermitted(token)`
- The actual interface (`authz.port.ts`) defines it as: `isAuthorized(request) → AuthorizationDecision`
- The actual adapter (`CedarAuthorizationAdapter`) implements `isAuthorized()` using `evaluateShape2()`, no tokens

**Unresolved:** Should `IAuthorizationPort` be refactored to the capability token pattern (ADR-004)? Or was ADR-004 superseded by a simpler interface?

### Q4: Who owns policy creation and signing?

- Docs mention "server-signed" snapshots (D3 ADR-005, D2 Section 6.3)
- No doc describes which service creates policies, which endpoint serves signed snapshots, or how the signing key is managed

**Unresolved:** This is an infrastructure dependency that is not documented. Without a policy server, the HMAC verification code has nothing to verify against.

### Q5: What is the correct relationship between `sanctuaryFeature()` and the port interfaces?

- D1 defines `sanctuaryFeature()` as a pure function that takes a fully-populated `SanctuaryEvaluationContext`
- D3 (ADR-009) says evaluation should go through the three port interfaces directly
- The code does *both*: `useSanctuaryFeature` reads from stores and passes to `sanctuaryFeature()`
- The ports (`authz`, `featureFlags`) exist as singletons but are NOT called by `useSanctuaryFeature`

**Unresolved:** Should `useSanctuaryFeature` call the port interfaces instead of reading Zustand stores? Or is the store-read pattern the intended implementation of the ports?

### Q6: The `policy_version` table

- D3 (ADR-006) mandates a `policy_version` Zone A table
- Not found in `schema.ts`. Not found in `cedarPolicies` table (which has no version column)
- The `permission_snapshots` table has `generatedAt` and `expiresAt` but no version field

**Unresolved:** Is `policy_version` not yet implemented, or was this decision overturned?

### Q7: `verifyLocalPolicySignature` purpose

- The function exists in `crypto.ts`
- The `cedarPolicies` table has no `signature` column
- No doc describes signing individual policy rows (only the snapshot as a whole)
- No caller passes a signature parameter

**Unresolved:** Is this meant for a future feature (policy-level signatures) or is it leftover from an earlier design where each policy row had its own signature?

---

## 4. Code Quality by Documented Standards

This section judges each major component against what the docs say it was FOR, not against generic best practice.

### Components That Meet Their Documented Purpose

| Component | Documented Purpose | Meets it? | Notes |
|-----------|-------------------|-----------|-------|
| **`sanctuaryFeature()`** | Pure function, 4 gates, composed result type (D1) | ✅ Yes | Tested, no side effects, correct gate order, correct return types |
| **`SupabaseEntitlementAdapter`** | `IEntitlementPort` implementation, reads pricing from DB (D2, D3) | ✅ Yes | Clean adapter, uses correct tables |
| **`useEntitlementStore`** | Zustand wrapper for entitlement data (D4 Section 1, step 6) | ✅ Yes | Correct boot integration, correct data flow |
| **`GrowthBookFeatureRolloutAdapter`** | `IFeatureRolloutPort`, GrowthBook backed (D1, D5) | ✅ Yes | Proper GrowthBook SDK wrapper |
| **`CedarAuthorizationAdapter`** | Implements `IAuthorizationPort`, calls Cedar directly (D2, D3) | ⚠️ Partial | Calls Cedar directly ✅ but no capability token ❌, no server-first evaluation ❌, interface differs from ADR-004 |

### Components That Deviate From Their Documented Purpose

| Component | Documented Purpose | What's Wrong | Severity |
|-----------|-------------------|-------------|----------|
| **`localEvaluator.ts`** | Offline Cedar evaluator using module-level WASM singleton (D3 ADR-005) | Per-call WASM import ❌, policy signature verification dead ❌, snapshot fallback missing ❌ | High — violates ADR-005 directly |
| **`localEvaluator.native.ts`** | Should not exist per ADR-005 (single evaluator) | Duplicates `localEvaluator.ts` with different fallback logic. Imports from it. Either this should not exist or the default should not exist. | Medium — platform variant pattern not documented anywhere |
| **`useCedarDecisionStore`** | Replace `usePermissionStore` as Cedar decision source (cleanup plan) | Missing HMAC verification ❌, signature check (present in `usePermissionStore`) was not ported | High — security gap |
| **`secureDrizzleProxy`** | Validate writes against Cedar, per ADR-004's token pattern | Validates per-write instead of per-context token ❌. Imports `useStore` (layer inversion) ❌ | High — violates ADR-004, violates layer isolation |
| **`useSanctuaryFeature`** | UI composition point reading from Cedar + entitlement + flags (D1, D5) | Reads from Zustand stores instead of port interfaces. Pre-computed Shape 2 not implemented (D2 Section 5.3) | Medium — works but doesn't use the hexagonal ports as intended |
| **`feature.slice.ts`** `recomputeFlags` | Should resolve flags through GrowthBook | Resets to defaults — dead code | Low |
| **`usePermissions.ts`** | Temporary backward-compat wrapper, `@deprecated` (D1 Section 5) | 10+ consumer files still import it. Still loaded. | Medium — migration incomplete |

### Components That Are Code-Only Artifacts (no doc coverage)

| Component | Status | Recommendation Would Require |
|-----------|--------|-----------------------------|
| `localEvaluator.web.ts` | No doc describes web-specific permission behavior | A decision on whether web needs permission evaluation |
| `IFeatureFlagPort` | Deprecated interface, documented as "prefer IFeatureRolloutPort" | Delete |
| `useFeatureRegistry` | D1 Section 7 describes its refactored form but code version has zero consumers | Delete or reconnect to barrel |
| `useDomainFeature` / `useDomainFeatures` | No consumers found | Delete or find callers |
| `usePermissionStore` | Marked for deletion in D1, D2, cleanup plan | Delete |
| `usePermissionStore.web.ts` | Dead along with parent | Delete |

---

*End of docs-grounded analysis. No fix plan is proposed here. Open questions (Section 3) require resolution before any implementation path is chosen.*
