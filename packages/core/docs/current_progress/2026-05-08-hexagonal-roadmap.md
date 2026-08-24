---
title: "Sovereign Hexagonal Roadmap: The Final Isolation ðŸ›ï¸"
status: "active"
created: 2026-05-08
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core, historical]
---

# Sovereign Hexagonal Roadmap: The Final Isolation 🏛️

This document outlines the remaining "leaky" territories in the Polymath Platform and the strategy for creating their respective Ports and Adapters.

## 1. The Auth Territory (`IAuthPort`) 🔑
**Status**: Soft-coupled via Sentinel.
**Target**: `packages/core/src/api/auth.ts`

### 🏗️ Strategy
Define an `IAuthPort` that abstracts session management and identity linking.
- **Port**: `logic/ports/auth.port.ts`
- **Adapter**: `adapters/supabase/auth.adapter.ts`
- **Manager**: `logic/managers/AuthManager.ts`

---

## 2. The Native Territory (Runtime Alignment) 📱
**Status**: Leaking React Native / Expo globals.
**Target**: `packages/core/src/native/deviceTrust.ts`, `appCrypto.ts`

### 🏗️ Strategy
Refactor all files in `src/native/` to use the `CoreRuntimeEnvironment` (from `runtimeAdapter.ts`) instead of direct imports.
- **Goal**: `packages/core` should have **ZERO** imports from `react-native` outside of `runtimeAdapter.ts`.

---

## 3. The Growth Territory (`IGrowthPort`) 🌱
**Status**: Heavy logic mixed with persistence.
**Target**: `packages/core/src/api/growthSignals.ts`

### 🏗️ Strategy
The Growth Model is the "Heart" of the platform. It must be protected from infrastructure changes.
- **Port**: `logic/ports/growthRepository.port.ts` (Handles `growth_events` and `user_growth_state`).
- **Manager**: `logic/managers/GrowthManager.ts` (Handles the "Bhumi" stage logic).
- **Adapter**: `adapters/supabase/growth.adapter.ts`.

---

## 4. The Media Territory (`IFileStoragePort`) 🖼️
**Status**: Partially implemented; uses Cloudinary.
**Target**: `packages/core/src/lib/cloudinary.ts`

### 🏗️ Strategy
Consolidate all media handling under a unified `IFileStoragePort`.
- **Port**: `logic/ports/fileStorage.port.ts`
- **Adapters**: 
  - `CloudinaryAdapter` (Production)
  - `S3Adapter` (Self-hosted fallback)
  - `MockStorageAdapter` (Test/Offline)

---

## 5. Domain-Specific Repositories (The "Deep" Hexagon) 💎
**Status**: High dependence on shared Sentinel.

### 🏗️ Strategy
Instead of a monolithic `__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__`, each domain defines its own repository contract.

| Domain | Port | Infrastructure Implementation |
| :--- | :--- | :--- |
| **Community** | `ICommunityRepository` | `SupabaseCommunityAdapter` |
| **Classroom** | `IClassroomRepository` | `PowerSyncClassroomAdapter` (Local-first) |
| **Library** | `ILibraryRepository` | `SupabaseLibraryAdapter` |

## Summary of Priority Actions
1.  **Audit `src/native`**: Purge direct `react-native` imports.
2.  **Extract `GrowthManager`**: Isolate the Bhumi logic from the SQL/RPC calls.
3.  **Formalize `AuthManager`**: Encapsulate the sign-out lifecycle (clearing PowerSync, MMKV, and Supabase) into a single atomic operation.
