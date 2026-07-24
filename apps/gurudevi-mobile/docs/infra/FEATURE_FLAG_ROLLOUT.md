# Guidance: Feature Flag Rollout (Remote Config)

This document outlines the systematic move from a static `feature-engine.ts` to a dynamic, Supabase-backed remote configuration system.

## 1. Current State
*   **Engine**: `packages/core/src/logic/permissions/feature-engine.ts` resolves flags based on a static map + user context.
*   **Storage**: `useFeatureStore` (Zustand) persists flags to MMKV (Native) or LocalStorage (Web) for instant launch.

## 2. The Systematic Roadmap

### Phase 1: Database Foundation
We will implement the `feature_flags` table in the `auth` or `public` schema.
*   **Fields**: `flag_key` (String), `is_enabled` (Bool), `rules` (JSONB), `description` (String).
*   **Security**: RLS restricted to `admin` read/write; `authenticated` read-only.

### Phase 2: Remote Configuration Sync
Update `useFeatureStore` to perform a "Delta Sync":
1.  **On Launch**: Load keys from Local Storage (instant).
2.  **Background**: Fetch latest `globalConfigs` from Supabase.
3.  **Resolve**: Re-run `resolveFeatureFlags(context, latestGlobalConfigs)`.
4.  **Persist**: Update Local Storage.

### Phase 3: The `useFeature` Component Hook
Never access `flags` directly from the store in the UI. Use the specialized hook:

```typescript
// Proposed Implementation
export function useFeature(key: keyof FeatureFlags): boolean {
  const flags = useFeatureStore((s) => s.flags);
  const value = flags[key] ?? false;
  
  // Implicitly track exposure for PostHog
  useEffect(() => {
    trackFeatureExposure(key, value);
  }, [key, value]);

  return value;
}
```

## 3. Flag Lifecycle
1.  **`isDeveloping*`**: Default `false`. Only `true` for `authority === 'developer'`.
2.  **`isBeta*`**: Controlled via `context.features` array (managed in Supabase User profile).
3.  **`is*Enabled`**: Global kill-switches managed in the `feature_flags` table.

---
*Reference: ADR-003 Feature Flag Architecture*
