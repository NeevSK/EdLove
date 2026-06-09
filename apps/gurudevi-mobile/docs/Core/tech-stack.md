---
title: "Technical Stack"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, tech-stack, architecture]
---

# Technical Stack

This document defines the core frontend and backend technology choices for Gurudevi Mobile.

---

## 1. Core Architecture

The codebase is managed as a monorepo split into shared packages and client apps:
* **`apps/gurudevi-mobile`**: The Expo client application orchestrating features and navigation.
* **`apps/sanctuary-api`**: Hono API service hosting centralized backend handlers.
* **`packages/core`**: Main logic core (Zustand state slices, API clients, authentication, permissions, database models).
* **`packages/ui`**: Shared design primitives, visual themes, and component styling.

---

## 2. Frontend Technology Stack

* **Expo SDK**: `~56.0.4` (Managed application runtime)
* **React Native**: `~0.85.3` (Running the **New Architecture** by default)
* **React**: `19.2.3` (Concurrent rendering features enabled)
* **Expo Router**: `~56.2.6` (File-based navigation graph)
* **TypeScript**: `^6.0.3` (Strict mode compilation)
* **React Native Reanimated**: `4.3.1` (Utilizing the Reanimated v4 native Worklets engine)
* **Gluestack UI**: `3.0.0` (v3 components using the "Sanctuary" tokens)
* **Tailwind CSS & NativeWind**: `4.1.23` (Tailwind `3.4.17` engine styling)
* **i18next**: `^25.8.11` (Sinhala, Tamil, and English)

---

## 3. State Management & Data Sync

* **Zustand**: `^5.0.10` (Global/local slices)
* **TanStack Query (React Query)**: `^5.90.20` (Server-state caching)
* **PowerSync React Native**: `^1.34.0` (Offline replication engine)
* **OP-SQLite**: `^15.2.14` (High-performance native SQLite engine)
* **Drizzle ORM**: `^0.39.0` (Query composition and schema models)
* **MMKV**: `^4.1.2` (Sync local storage)

---

## 4. Backend & API Services

* **Supabase**: PostgreSQL 15 cloud instance, Auth, and Storage.
* **Hono**: `^4.12.18` (High-performance API framework running on Node and Edge Functions).
* **ZenStack**: `3.6.4` (Schema-first validation).

---

## 5. Offline & ID Strategies

* **UUID Primary Keys**: All entity IDs are generated client-side using `crypto.randomUUID()`. This prevents sequence collisions during offline database writes and simplifies multi-tenant merges.
