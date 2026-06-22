---
title: "GrowthBook Feature Rollout Developer Skill"
status: "active"
created: 2026-06-21
updated: 2026-06-21
author: "Naveen"
scribe: "Antigravity"
tags: [growthbook, feature-flags, rollout, skills]
---

# GrowthBook Feature Rollout Developer Skill

This playbook guides the implementation and extension of feature management and experiments using the GrowthBook JS SDK within the Polymath Platform.

## Core Integration Rules

### 1. Zero Native Pollution in `@repo/core`
Never import `react-native` or native storage libraries (like MMKV or AsyncStorage) directly inside packages that are shared with web/server targets.
Always map storage to the `StorageManager` proxy using custom polyfills.

```typescript
import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { storage } from '../../lib/storage';

setPolyfills({
  localStorage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
});
```

### 2. State & Caching Architecture
* **Zustand (`useFeatureStore`)**: In-memory, reactive state engine for UI reads.
* **MMKV (`SafeZustandStorage`)**: Synchronous disk caching provider that persists resolved flags.
* **Instant Launch**: On cold-start, hydrate Zustand immediately from the MMKV-backed cache to prevent visual flickers. Do not await remote network fetches before drawing the UI.

### 3. Hexagonal Decoupling
UI components must never import `@growthbook/growthbook` or `@growthbook/growthbook-react` directly.
Always use the [IFeatureRolloutPort](file:///c:/Users/Naween/projects/polymath-platform/packages/core/src/logic/ports/featureRollout.port.ts) and evaluate flags through decoupled custom hooks (e.g. `useFeature`).

### 4. Telemetry Binding
Bind the GrowthBook `trackingCallback` to the existing analytics port (`IAnalyticsPort`) to automatically track A/B test exposures:

```typescript
const gb = new GrowthBook({
  trackingCallback: (experiment, result) => {
    analytics.track("Experiment Viewed", {
      experimentId: experiment.key,
      variationId: result.key,
    });
  }
});
```
