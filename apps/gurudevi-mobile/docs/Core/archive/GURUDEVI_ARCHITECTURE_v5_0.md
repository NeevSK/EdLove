---
title: "GURUDEVI TECHNICAL ARCHITECTURE v5.0"
status: "active"
created: 2026-02-28
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI TECHNICAL ARCHITECTURE v5.0
*The Definitive Technical Truth and Roadmap*

---

## 1. CORE IDENTITY & PHILOSOPHY
**Product Type**: School Platform (Educational Ecology)
**Aesthetic**: Sanctuary (Calm, Nurturing, Organic)
**Law**: Same Reality, Different Views (5-Tab Structure for all roles)

### The Lotus Metaphor
- **Rooted in mud**: Designed for low-end Androids, intermittent data, and exhausted teachers.
- **Rising through water**: Organic growth and resilience.
- **Hydrophobic surface**: Protecting teacher dignity and data sovereignty.

---

## 2. SYSTEM ARCHITECTURE
### 2.1 Multi-Tenant Foundation
One database serves all schools, isolated via `school_id` and PostgreSQL Row-Level Security (RLS). This ensures cross-school collaboration (Library sharing) while preserving institutional privacy.

### 2.2 Component Architecture
- **UI Abstraction Layer**: All screens and features must import UI components from `@/ui`.
- **Atomic Design**: Components are exported via `src/ui/index.ts` using direct sub-module imports for optimal tree-shaking.

### 2.3 Shared Reality (The 5 Tabs)
1. **Self**: Inner ecology (wellbeing, reflection).
2. **Classroom**: Operational ecology (lesson planning, grading, attendance).
3. **Community**: Relational ecology (teacher forums, school announcements).
4. **Library**: Knowledge ecology (curated and shared resources).
5. **Profile**: Identity & Boundaries (role management, Thuthimal status).

---

## 3. TECHNICAL STACK (Alpha/Production)
- **Frontend**: Expo 54 + React 19 (React Native 0.81.5)
- **UI Framework**: Gluestack UI v2 (Sanctuary Theme)
- **State**: Zustand (Global) + TanStack Query (Server State)
- **Storage**: MMKV (Local caching)
- **Backend**: Supabase (PostgreSQL 15, Auth, Storage, Edge Functions)
- **i18n**: i18next (Sinhala, Tamil, English - Equal citizens)

---

## 4. DATA MODEL & SECURITY
### 4.1 UUID Strategy
All primary keys are UUIDs. This allows for:
- Client-side ID generation (Offline-ready for v1.0).
- Collision-free data migrations.
- Enhanced security (non-sequential/non-guessable IDs).

### 4.2 Security Lockdown
- **RLS at Core**: All queries must join on `school_id`.
- **Ownership Verification**: API requests in `src/lib/api/` must verify `auth.uid()` ownership of the resource being modified.

---

## 5. REWARDS & ECONOMY (THUTHIMAL)
**Rejecting Gamification**: We explicitly reject exploitative mechanics (leaderboards, streaks, shaming).
**The Gratitude Economy (Thuthimal)**:
- Subscriptions are gifted as "Flowers of Gratitude" from alumni and communities.
- Focus is on reciprocal care and honoring the "Guru Devi" (Divine Teacher).

---

## 6. ROADMAP TO v1.0
- **v0.1 (Alpha)**: Cloud-first, core Teacher/Student flows, RLS lockdown.
- **v0.5 (Beta)**: Thuthimal automation, OCR for Sinhala/Tamil, Principal dashboards.
- **v1.0 (GA)**: Hybrid Sync (Local SQLite + Cloud Sync), E2E Encryption for sacred reflections.
