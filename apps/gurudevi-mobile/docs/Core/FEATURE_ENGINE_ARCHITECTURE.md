# Feature Engine Architecture & Development Guide

## Overview

The Gurudevi Sanctuary **Feature Engine** is our central, strongly-typed system for gating functionality, managing entitlements, and controlling the deployment lifecycle of features across the Polymath Platform.

Following the FAANG principle of **"Strongly Typed Gates"**, the engine ensures that we never use magic strings in the UI to check for permissions or feature availability.

### Mission Statement
1. **Sovereignty**: The app logic is decoupled from the deployment state.
2. **Safety**: Kill switches (Global Safety Flags) can be triggered remotely without a code deploy.
3. **Velocity**: Developers can merge "Developing" features into the main branch safely behind flags.
4. **Context-Aware**: Features resolve based on User Tier, Role, and Environment simultaneously.

---

## Current Architecture

The engine operates on a **Hierarchical Resolution Model**, where flags are determined by merging multiple levels of configuration.

### 1. The Flags Registry (`FeatureFlags`)
Defined in `@repo/core/permissions/feature-engine.ts`, this interface is the "Source of Truth" for all available toggles.

- **Infrastructure Flags**: Gating entire modules (ERP, Community).
- **Business Flags**: Gating by tier (Pro Member, OCR, AI Assistant).
- **Experimental Flags**: Gating features in Beta.
- **Global Safety Flags**: Kill switches (Under Maintenance).

### 2. Hierarchical Resolution
The `resolveFeatureFlags` function computes the final state using the following priority (highest wins):

| Priority | Level | Description |
| :--- | :--- | :--- |
| **5** (Highest) | **User Override** | Flags injected directly into a specific user's context (e.g. for testing). |
| **4** | **Remote Level** | Global Configs (Kill Switches) delivered via API or Remote Config. |
| **3** | **Role/Persona** | Automatic flags based on `authority` (e.g. Developers get everything). |
| **2** | **Entitlement** | Flags based on Subscription Tier or explicit `features` array. |
| **1** | **Infrastructure** | Build-time Environment Variables (`EXPO_PUBLIC_*`). |
| **0** (Lowest) | **Default** | The "Safe Harbor" state defined in the engine. |

---

## Development vs. Under Development Flags

### Current State
Currently, we distinguish between:
- **Beta Features**: Prefixed with `is...Enabled` in the Experimental section (e.g., `isNewOnboardingEnabled`).
- **Kill Switches**: Prefixed with `KILL_SWITCH_` in remote config.

### "Developing" Flags (The Roadmap)
To answer the requirement for "Developing" and "Under Development" statuses, we are moving towards a **Lifecycle-Aware** flag system.

#### Proposed Lifecycle:
1. **Developing (`isDev_...`)**: Hidden from everyone except users with `developer` role. Never active in Prod.
2. **Alpha (`isAlpha_...`)**: Available to Internal/Staff users for testing.
3. **Beta (`is...Enabled`)**: Available to "Beta Tester" opted-in users and Pro members.
4. **Stable**: On by default, flag remains for emergency rollback (Kill Switch).
5. **Deprecated**: Warning shown to developers/admins; logic remains but use is discouraged.

---

## Developer Guide: How to Add a Feature

### Step 1: Register the Flag
Add your flag to the `FeatureFlags` interface in `packages/core/src/permissions/feature-engine.ts`.

```typescript
export interface FeatureFlags {
  // ...
  isDev_DynamicCurriculum: boolean; // Developing status
}
```

### Step 2: Set Defaults and Resolution
Update the `resolveFeatureFlags` function to include your flag.

```typescript
const flags: FeatureFlags = {
  // ...
  isDev_DynamicCurriculum: false, // Safe by default
};

// ... Gating for developers only
if (context.authority === 'developer') {
  flags.isDev_DynamicCurriculum = true;
}
```

### Step 3: Use in UI (Declarative)
Use the `FeatureGuard` component to wrap your new UI elements.

```tsx
import { FeatureGuard } from '@repo/core';

<FeatureGuard feature="isDev_DynamicCurriculum" fallback={<OldCurriculum />}>
  <NewDynamicCurriculum />
</FeatureGuard>
```

### Step 4: Use in Logic (Imperative)
Use the `usePermissions` hook for functional logic.

```tsx
const { flags } = usePermissions();

if (flags.isDev_DynamicCurriculum) {
  // Execute advanced logic
}
```

---

## Future Capabilities & Roadmap

### 1. Multi-Variant Flags (A/B Testing)
Moving beyond boolean `true/false` to support `string`, `number`, or `json` values to allow for A/B testing of different UI variations.

### 2. Admin Feature Lab
A dedicated section in the "Developer/Founder Dashboard" where features can be toggled on-the-fly for the local session without changing code.

### 3. Analytics Integration
Automatic tracking of "Feature Exposure". When a `FeatureGuard` is rendered, it will trigger an event in the analytics pipeline (e.g., PostHog) to correlate feature usage with user behavior.

### 4. Edge-Compatible Resolution
Optimizing the engine to run on Vercel Edge / Cloudflare Workers to resolve flags *before* the page even reaches the user, eliminating "layout shift" or "flicker".
