# Supabase Setup & Workflow Guide (Gurudevi Alpha)

This guide documents the "Nuclear Reset" strategy and the transition to professional migration tracking using the Supabase CLI.

## 1. Local Environment Setup

### Prerequisites
- **Node.js & pnpm**: For dependency management.
- **Supabase CLI**: Installed as a dev dependency via `pnpm add -D supabase`.
- **Docker** (Optional but Recommended): For running local migrations before pushing to remote.

### CLI Authentication
Before running any commands, ensure you are logged in:
```powershell
pnpm supabase login
```

### Linking to Project
The local environment is linked to the hosted Supabase instance:
```powershell
pnpm supabase link --project-ref [YOUR_PROJECT_REF]
```

## 2. Migration Strategy: The "Clean Slate"

We have consolidated the previous 20+ scattered SQL files into a single source of truth.

### The Baseline
- **File**: `supabase/migrations/00_master_baseline.sql`
- **Purpose**: Defines the entire database structure (Extensions, Tables, RLS, Triggers) in one logical pass.

### Handling Changes
From now on, **DO NOT** edit the 00_master_baseline.sql file. Instead:
1. Create a new migration file: `pnpm supabase migration new [feature_name]`
2. Add your SQL logic.
3. Apply locally: `pnpm supabase db reset` (If Docker is running).
4. Push to remote: `pnpm supabase db push`.

## 3. Native Storage & Session Persistence

### Expo Go vs. Native Builds
- **Auth (Supabase)**: Uses `AsyncStorage`. Persistence works in both Expo Go and Native builds. No need to re-login on refresh.
- **State (Zustand)**: Uses `AsyncStorage`. Persists `onboarding_completed` and user preferences across reloads.
- **High-Performance Storage (MMKV)**: 
    - **Native builds**: Uses JSI for ultra-fast disk access.
    - **Expo Go**: Falls back to `MemoryStorage` (RAM only). Data is lost on refresh.

## 4. Troubleshooting Common Issues

### 42P17: RLS Recursion Error
If you see an infinite recursion error when updating the `users` table:
- **Cause**: An RLS policy for `SELECT` or `UPDATE` is calling the same table in a recursive loop.
- **Fix**: Use a subquery targeting `auth.uid()` or a `security definer` function to break the loop. (Refer to migration `20260211173500_fix_rls_recursion.sql`).

### Onboarding "Not Directing to Home"
- **Cause**: The `onboardingCompleted` flag in Zustand or Supabase might be out of sync.
- **Solution**: Complete the onboarding steps or click "Skip". The app relies on the `onComplete` callback to update the store and trigger navigation in `App.tsx`.

---
*Created: 2026-02-11*
