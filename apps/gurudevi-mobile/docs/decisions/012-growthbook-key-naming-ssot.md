---
title: "GrowthBook Key Naming and Flag-Source SSOT"
status: "active"
created: 2026-08-04
updated: 2026-08-04
author: "Codex"
tags: [growthbook, feature-lifecycle, feature-flags, source-of-truth]
---

# GrowthBook Key Naming and Flag-Source SSOT

## Context

Gurudevi has a mature in-app feature-flag system. The app-side SSOT is
`FEATURE_FLAG_MANIFEST` in
`packages/core/src/logic/registry/featureLifecycleManifest.ts`: it declares the
12 active flags (plus 14 retired keys), their lifecycle class, disposition, and
safe default. `AppCatalog` (27 capabilities) requires beta entries to carry a
`flagKey` and validates that the key exists in the manifest. Runtime evaluation
flows `GrowthBookFeatureRolloutAdapter → feature.slice → useSanctuaryFeature /
useDomainFeature`.

GrowthBook is the agreed rollout engine ("AppCatalog answers what exists.
GrowthBook answers who receives it now."), but the Gurudevi GrowthBook project
currently has **0 flags**. No app key has yet been given a GrowthBook identity.

The open question is: **what key names do we create in GrowthBook?**

Two candidate schemes were considered.

### Option A — exact interface keys

Use the existing manifest/interface names verbatim (`isInventoryEnabled`,
`isDevelopingWorkforce`, ...) as GrowthBook keys.

- Zero code change; the adapter already reads "all features by key".
- But: camelCase keys read like internal identifiers, not a durable external
  contract. The GrowthBook key is the long-lived surface an operations team,
  a web SDK, and future products will see. `isXEnabled` encodes the *rendering
  shape* (`is`, `Enabled`) rather than the *capability* (`inventory`). It is the
  "older shape" the audit flagged. Renaming later (allowing two products or a
  `gurudevi.` prefix) would then require a code change.

### Option B — namespaced kebab-case keys + manifest mapping (chosen)

Use `gurudevi.<domain>.<feature>` in GrowthBook, and keep the manifest as the
single place that maps app identity → GrowthBook identity.

- The GrowthBook key reads as a stable external contract and is future-proof:
  a second product, a web SDK, or a marketing pilot can reference the same key
  without knowing Gurudevi internals.
- The mapping is declared once, in the SSOT, and validated at boot.
- Costs one migration inside `packages/core` (RED/AMBER zones) and an alias-free
  re-key of the adapter's evaluation path.

## Decision

1. **GrowthBook keys follow the convention `gurudevi.<domain>.<feature>`** —
   lowercase, dot-separated, kebab-case segments. Example: `gurudevi.admin.inventory`.

   - `<domain>` is the owning capability domain, matching the package registry
     that declares the flag: `admin`, `ai`, `workforce`, `form-builder`, or
     `core` (platform-wide operational controls).
   - `<feature>` is a kebab-case capability identifier, lifecycle-state free
     (the `is...Enabled` / `developing` state stays in the manifest, not in the key).

2. **The manifest is the SSOT for the mapping.** Each active flag gains a
   required `growthbookKey` field. `featureLifecycleManifest.ts` derives
   `GROWTHBOOK_KEY_BY_FLAG` and exposes `resolveGrowthBookKey(appKey)`.

3. **Boot-time validation is extended.** `growthbookKey` must match
   `/^[a-z0-9]+(\.[a-z0-9]+)*$/` (namespaced kebab-case), must be unique across
   the manifest, and retired keys keep their historical key so the archive trail
   stays intact. A mismatch or collision fails `validateFeatureFlagManifest`.

4. **The adapter emits app keys, not GrowthBook keys.** The rollout adapter
   resolves each manifest flag by its `growthbookKey`, and the snapshot it
   produces is keyed by the existing app key. `feature.slice`,
   `useSanctuaryFeature`, `useDomainFeature`, and every registry therefore see
   **no change** — the migration is contained at the boundary where external
   identity meets internal identity.

5. **Control-plane tooling reads the mapping.** `scripts/audit-growthbook-features.mjs`
   (inventory drift check) and the archive script compare remote feature keys
   against the manifest's `growthbookKey` values, not against a hard-coded list.

### Flag key mapping (12 active flags)

| App key (manifest / interface) | GrowthBook key | Domain |
|---|---|---|
| `isGuardianWorkspaceEnabled` | `gurudevi.admin.guardian-workspace` | admin |
| `isInventoryEnabled` | `gurudevi.admin.inventory` | admin |
| `isAccountingEnabled` | `gurudevi.admin.accounting` | admin |
| `isDevelopingWorkspace` | `gurudevi.admin.workspace-development` | admin |
| `isDevelopingWorkforce` | `gurudevi.workforce.development` | workforce |
| `isDevelopingFormBuilder` | `gurudevi.form-builder.development` | form-builder |
| `isAIAssistantEnabled` | `gurudevi.ai.assistant` | ai |
| `isGraphicsEngineEnabled` | `gurudevi.core.graphics-engine` | core |
| `isAnalyticsEnabled` | `gurudevi.core.analytics` | core |
| `isSocialShieldEnabled` | `gurudevi.core.social-shield` | core |
| `isPowerSyncEnabled` | `gurudevi.core.power-sync` | core |
| `isUnderMaintenance` | `gurudevi.core.maintenance` | core |

## Why this keeps doors open

- **Multiple products / orgs:** a future `gurudevi-web` or a second product gets
  its own top-level segment; no collision, no prefix retrofit.
- **Multi-SDK:** web and native SDKs reference the same durable key.
- **Rename discipline:** renaming a GrowthBook key never touches app code — the
  manifest is the single edit point. The app-facing `FeatureFlags` interface
  stays stable.
- **Environment policy:** Production + development is already agreed; the key
  convention does not encode environment (matching GrowthBook's env matrix),
  so keys are portable across projects if the org is ever split.

## Alternatives rejected

- **Option A (exact interface keys):** no migration cost, but bakes the internal
  rendering shape into a permanent external contract. Rejected for durability.
- **No manifest mapping (adapter switches on hard-coded keys):** forks the SSOT;
  drift between `FEATURE_FLAG_MANIFEST` and the adapter's key list would be
  undetectable at boot. Rejected.
- **Environment-encoded keys (`gurudevi-prod.admin.inventory`):** duplicates
  GrowthBook's built-in environment matrix and makes flags non-portable. Rejected.

## Rollout plan

Status: **complete** (verified 2026-08-04).

1. Migrate `featureLifecycleManifest.ts` (RED zone): add `growthbookKey`,
   derive `GROWTHBOOK_KEY_BY_FLAG` / `resolveGrowthBookKey`, extend validation
   (regex, uniqueness, retired-key retention). ✅
2. Re-key the adapter (AMBER zone): evaluate by `growthbookKey`, emit app keys. ✅
3. Update `scripts/audit-growthbook-features.mjs` + archive script to compare
   against `growthbookKey`. ✅
4. Update `feature-lifecycle-management.md` SSOT + this ADR to `active`. ✅
5. Create the 12 flags in the Gurudevi GrowthBook project via the control-plane
   API. **Environments are named `production` and `dev`** (not "development");
   every flag was created with `enabled: false` explicitly for **both**
   environments (the org-level `defaultState` is true, so a new env would
   otherwise default flags to enabled). Defaults = manifest safeDefault.
   Owner required on create (secret-key auth): `u_19g6rmqnghi0x`. ✅
6. Run the read-only inventory audit against production: expect zero drift.
   ✅ Confirmed `activeRemoteCount = localManifestCount = 12`,
   `orphanedRemoteKeys = []`, `missingRemoteKeys = []`. Note: the
   `GROWTHBOOK_FEATURES_ENDPOINT` must include `?limit=100` because the v1
   `GET /api/v1/features` endpoint paginates at 10 features by default.
7. Obtain `EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY` (`sdk-...`) once flags exist.
   ✅ Client keys live on **SDK Connections**, not environments. The single SDK
   connection (key `sdk-6zz6DgrYuBC3gtl1`) was reshaped from `dev` to
   **`production`** on 2026-08-04 (project-scoped to `prj_2CcG1JXUJwNGKwwGJEb8s8`,
   SDK 1.7.0). There is currently **no `dev` SDK connection**; create one only if
   dev builds must read dev-env flags. The CDN payload for the key is empty until
   a flag is enabled — GrowthBook excludes fully-disabled features from the
   client payload, so the key is verified against the `production` payload.

## Consequences

- **+** One canonical mapping, validated at boot, visible in one file.
- **+** Durable, readable GrowthBook keys shared across any future SDK/product.
- **+** App-facing flag shape unchanged; registries and gate logic untouched.
- **-** Requires a RED-zone manifest change + AMBER adapter change before any
  flag can be created (sequential, small, fully testable).
- **-** GrowthBook keys, once created, are effectively permanent; the mapping in
  this ADR must be reviewed before step 5 ships.
