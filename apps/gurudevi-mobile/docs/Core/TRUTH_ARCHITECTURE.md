# GURUDEVI TECHNICAL ARCHITECTURE (CORE TRUTH)
*The Definitive Technical Identity, Stack, and Data Model*

---

## 1. CORE IDENTITY & PHILOSOPHY
**Product Type**: School Platform (Educational Ecology)
**Aesthetic**: Sanctuary (Calm, Nurturing, Organic)
**Law**: One Reality, Different Views (5-Tab Structure for all roles)

### The Lotus Metaphor
- **Rooted in mud**: Designed for low-end Androids (2GB RAM), intermittent data, and exhausted teachers.
- **Rising through water**: Organic growth, resilience, and filtering noise into wisdom.
- **Hydrophobic surface**: Protecting teacher dignity and data sovereignty against surveillance.

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Multi-Tenant Foundation
A single PostgreSQL database serves all schools, strictly isolated via `school_id` and **PostgreSQL Row-Level Security (RLS)**.
- **Mandatory Policy**: Every query must include or be joined on `school_id`.
- **Identity Awareness**: Every user record is tied to a specific `school_id` root.

### 2.2 Shared Reality (The 5 Tabs)
All users navigate the same educational reality through a unified structural lens:
1. **Self**: Inner ecology (wellbeing, reflection, private journal).
2. **Classroom**: Operational ecology (lesson planning, grading, attendance).
3. **Community**: Relational ecology (school announcements, teacher forums).
4. **Library**: Knowledge ecology (curated resources, shared lesson plans).
5. **Profile**: Identity & Boundaries (role management, settings, Thuthimal status).

### 2.3 Component & State Philosophy
- **Monorepo Structure**: 
  - `@repo/core`: Central source of truth for Logic, Types, and Zustand State.
  - `@repo/ui`: Unified design tokens and visual components.
  - `apps/gurudevi-mobile`: Feature orchestration and navigation.
- **Thin & Sensing UI**: Components should only consume state. Logic resides in hooks/stores.

---

## 3. TECHNICAL STACK
- **Frontend**: Expo 54 + React 19 (React Native 0.81.5)
- **UI Framework**: Gluestack UI v2 (Sanctuary Theme)
- **State**: Zustand (Reactive Global State) + TanStack Query (Server State)
- **Storage**: MMKV (High-performance local key-value storage)
- **Backend**: Supabase (PostgreSQL 15, Auth, Storage, Edge Functions)
- **i18n**: i18next (Sinhala, Tamil, English - Equal citizens)

---

## 4. DATA MODEL & SECURITY

### 4.1 UUID Strategy
All primary keys are **UUIDs**. This facilitates:
- **Offline Readiness**: Client-side ID generation (using `crypto.randomUUID()`).
- **Isolation**: No ID overlap in multi-tenant migrations.
- **Security**: Non-sequential, non-guessable identifiers.

### 4.2 Security Protocol (RLS)
- **Owner Verification**: Actions modifying resources must verify `auth.uid()` ownership.
- **Pattern Visibility**: Higher roles (Principals/Section Heads) see *aggregated patterns* of health, not individual private reflections.

---

## 5. THE GRATITUDE ECONOMY (THUTHIMAL)
**Thuthimal (තුතිමල්)**: A "Flower of Gratitude."
- We reject extractive gamification.
- Sustainability is driven by alumni/community gifts (subscriptions) to teachers.
- Profile status displays Thuthimal icons to honor the educator.

---

## 6. DEVELOPMENT ROADMAP
- **Alpha (Current)**: Cloud-first, RLS lockdown, core Teacher/Student/Principal flows.
- **Beta**: Thuthimal automation, OCR for local languages, Cross-school libraries.
- **GA**: Hybrid Sync (Local SQLite/Drizzle + Cloud Sync), E2E Encryption for sacred data.
