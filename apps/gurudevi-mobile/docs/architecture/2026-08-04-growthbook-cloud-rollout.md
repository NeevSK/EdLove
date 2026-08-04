---
title: "Gurudevi GrowthBook Cloud Rollout — Complete"
status: "active"
created: 2026-08-04
updated: 2026-08-04
author: "Naveen"
scribe: "Antigravity"
tags: [growthbook, feature-flags, rollout, control-plane, adr-012]
---

# Gurudevi GrowthBook Cloud Rollout — Complete

Record of the production GrowthBook control-plane rollout executed 2026-08-04
for the key convention agreed in
[ADR-012](../decisions/012-growthbook-key-naming-ssot.md). The manifest in
`packages/core/src/logic/registry/featureLifecycleManifest.ts` is the single
source of truth for the key mapping; this document records the live control-plane
state and the SDK wiring verification.

## Control-plane facts

- **GrowthBook org:** `org_19g6qmqngi87p`
- **Project:** `prj_2CcG1JXUJwNGKwwGJEb8s8` ("Gurudevi", public id `gurudevi`)
- **Environments:** `production` and `dev` (note: **not** "development").
  The org-level `defaultState` is `true`, so every flag was created with
  `enabled: false` **explicitly** for both environments — a new environment
  would otherwise default flags to enabled.
- **Management origin:** `https://api.growthbook.io`
- **SDK origin (CDN):** `https://cdn.growthbook.io`
- **SDK connection:** a single connection ("React SDK Connection",
  `sdk_19g6rmqnkbmbx`) with client key `sdk-6zz6DgrYuBC3gtl1`. It was reshaped
  from `dev` to **`production`** on 2026-08-04: project-scoped to
  `prj_2CcG1JXUJwNGKwwGJEb8s8`, SDK version 1.7.0, draft experiments excluded.
  There is currently **no `dev` SDK connection**.
- **Feature owner on create:** `u_19g6rmqnghi0x` (Naveen Sandeepa). Secret-key
  authentication requires an explicit `owner` on feature create; only Personal
  Access Tokens can omit it.

## CDN payload verification

`GET https://cdn.growthbook.io/api/features/sdk-6zz6DgrYuBC3gtl1` → HTTP 200 with
`features: {}`. This empty payload is **expected**: GrowthBook excludes features
that are disabled in every environment of the SDK connection from the client
payload. The key is confirmed to serve the `production` payload; once any flag
is enabled in production it will appear in this response.

## Flags created (12)

All flags are `boolean`, `defaultValue` = the manifest `safeDefault`, disabled
in both `production` and `dev`. They were created and left **disabled** so
enablement is a deliberate, later ramp action.

| App flag key | GrowthBook key | Default | Env state |
| :--- | :--- | :---: | :--- |
| `isInventoryEnabled` | `gurudevi.admin.inventory` | false | disabled (both) |
| `isAccountingEnabled` | `gurudevi.admin.accounting` | false | disabled (both) |
| `isAIAssistantEnabled` | `gurudevi.ai.assistant` | false | disabled (both) |
| `isGuardianWorkspaceEnabled` | `gurudevi.admin.guardian-workspace` | false | disabled (both) |
| `isDevelopingWorkspace` | `gurudevi.admin.workspace-development` | false | disabled (both) |
| `isDevelopingWorkforce` | `gurudevi.workforce.development` | false | disabled (both) |
| `isDevelopingFormBuilder` | `gurudevi.form-builder.development` | false | disabled (both) |
| `isGraphicsEngineEnabled` | `gurudevi.core.graphics-engine` | true | disabled (both) |
| `isAnalyticsEnabled` | `gurudevi.core.analytics` | true | disabled (both) |
| `isSocialShieldEnabled` | `gurudevi.core.social-shield` | true | disabled (both) |
| `isUnderMaintenance` | `gurudevi.core.maintenance` | false | disabled (both) |
| `isPowerSyncEnabled` | `gurudevi.core.power-sync` | false | disabled (both) |

Verified via `GET /api/v2/feature-keys` → all 12 keys present.

## SDK wiring verification

The client integration already implements the GrowthBook quickstart contract,
wrapped in the adapter (`packages/core/src/adapters/feature-rollout/growthBookFeatureRollout.adapter.ts`):

| Quickstart item | Implementation |
| :--- | :--- |
| `apiHost: "https://cdn.growthbook.io"` | `EXPO_PUBLIC_GROWTHBOOK_API_HOST` (adapter default `https://cdn.growthbook.io`) |
| `clientKey: "sdk-6zz6DgrYuBC3gtl1"` | `EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY` |
| `enableDevMode: true` | `process.env.NODE_ENV === 'development'` |
| `trackingCallback(...)` | → `trackExposure` → PostHog `feature_exposed` product event |
| `growthbook.init({ streaming: true })` | adapter `init({ streaming: true })`, last-known-good cache fallback |
| `setPolyfills({ localStorage })` | mapped to the MMKV-backed `storage` proxy (zero native pollution in `@repo/core`) |

### Intentional deviations from the quickstart

- **`autoAttributesPlugin` is not used.** It targets browser context
  (url, referrer, …), which is meaningless in React Native. The adapter sets
  explicit targeting attributes from `UserContext` instead.
- **`GrowthBookProvider` / `useFeatureIsOn` are not used.** The repository's
  hexagonal decoupling rule (`.claude/skills/growthbook-feature-rollout`) forbids
  UI components from importing `@growthbook/growthbook` or
  `@growthbook/growthbook-react` directly. `FeatureProvider`
  (`packages/ui/src/providers/FeatureProvider.tsx`, mounted by
  `apps/gurudevi-mobile/app/_layout.tsx`) is the single runtime synchronization
  boundary: it resolves context, subscribes to GrowthBook updates, and writes
  resolved snapshots into the local store. UI reads through `useFeature`-style
  hooks, never the GrowthBook React API.

## Client configuration

`apps/gurudevi-mobile/.env` (gitignored; mirrored in `.env.example`):

```dotenv
EXPO_PUBLIC_GROWTHBOOK_API_HOST=https://cdn.growthbook.io
EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY=sdk-6zz6DgrYuBC3gtl1
```

## Verification

`scripts/audit-growthbook-features.mjs --strict` against production
(`GROWTHBOOK_FEATURE_SCOPE_PREFIX=gurudevi.`):

- `activeRemoteCount = 12`, `localManifestCount = 12`
- `orphanedRemoteKeys = []`, `missingRemoteKeys = []` → **zero drift**

**Gotcha:** `GET /api/v1/features` paginates at 10 by default. The
`GROWTHBOOK_FEATURES_ENDPOINT` must include `?limit=100` (or similar) or the
audit reports false "missing" keys on page two.

## Secrets & security

- **Management credentials** (`GROWTHBOOK_API_KEY`) live in
  `~/.config/growthbook/.env` (outside the repo) and are never placed in an Expo
  environment.
- **Client key** (`sdk-...`) is public by design — it is safe to embed via
  `EXPO_PUBLIC_*`; it only gates SDK-to-CDN access for the configured environment.
- **Action recommended:** the admin secret key was used for this rollout and has
  been exposed in a session transcript. Rotate it and prefer a scoped Personal
  Access Token for future control-plane work.

## Follow-ups

1. **Create a `dev` SDK connection (optional).** The single existing SDK
   connection is now `production`-shaped, so `sdk-6zz6DgrYuBC3gtl1` reads prod
   data. If dev builds must evaluate dev-env flags (e.g. for ramp-testing before
   prod), create a separate SDK connection for the `dev` environment and wire its
   key per build via EAS environment files. Until then, dev builds read the
   production flags — which is the correct default for a release-aligned pipeline.
2. **Rotate management credentials** to a scoped PAT (see above).
3. **Ramp enablement.** All 12 flags are currently disabled in both environments
   by design; enable per release plan, starting with the operational controls
   whose defaults are `true`. Enabled flags will begin appearing in the CDN
   payload automatically.
4. Remaining lifecycle P0 work (archive dry run against the real deployment,
   legacy schema retirement decision) is tracked in
   [feature-lifecycle-future-work.md](./feature-lifecycle-future-work.md).
