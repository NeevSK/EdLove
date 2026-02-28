# EVOLUTION: How Gurudevi's Thinking Evolved

> A comprehensive synthesis of how this project's architecture, design, philosophy, and approach evolved from the earliest planning documents to the current state (March 2026).

---

## Phase 1: Early Planning (old_docs era — pre-February 2026)

### Original Vision
Gurudevi (ගුරු දෙවි — "Divine Teacher") was conceived as a mobile-first school platform for Sri Lankan teachers. The earliest documents (`MISSION_01_SELF.md` through `MISSION_06_COMMUNITY_ONBOARDING.md`) laid out a 6-mission architecture:

- **Mission 01**: Self — private teacher reflection, mood tracking, journaling
- **Mission 02**: Teacher Workbench — classroom management, student tracking
- **Mission 03**: Grading — marks, GPA, report cards
- **Mission 04**: Principal — school administration, oversight
- **Mission 05**: Student Path — student-facing features
- **Mission 06**: Community Onboarding — invitation-based school network

The core aesthetic was **Sanctuary** — technology that restores energy rather than extracting it. The Lotus metaphor (rooted in mud → rising through water → hydrophobic surface → blooming above) was established as the guiding design DNA from the very beginning and never changed.

### Original Architecture Decisions
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Frontend**: Expo SDK 54 + React Native 0.81.5 + React 19 + TypeScript
- **UI Framework**: Gluestack UI v2 (chosen over NativeBase for 3x speed and React 19 compatibility)
- **State**: Zustand (global) + TanStack Query (server state)
- **Storage**: MMKV (primary, 30x faster than AsyncStorage) with AsyncStorage fallback
- **Navigation**: React Navigation 7 with 5-tab bottom nav
- **Animation**: React Native Reanimated (NO Moti — broken with React 19)
- **i18n**: i18next with Sinhala/Tamil/English as equal first-class citizens

The tech stack combination (expo 54, react 19, react-native 0.81.5) survived 4 failed builds to arrive at this exact combination — documented as **"do not change without testing"**.

### Key Early Decisions
- **5-Tab Sacred Structure**: Self | Classroom | Community | Library | Profile — chosen as the "same reality, different views" principle. All roles use the same tabs; content adapts by role.
- **Three Sacred Laws**: (1) Same Reality, Different Views; (2) Teacher-Centric Hierarchy; (3) Energy Return on Interaction (EROI)
- **Privacy First**: Self tab is a private sanctuary, inaccessible to higher roles
- **Role system**: Teacher, Student, Principal, Section Head, Grade Head (admin/founder internal)
- **Invitation system**: Invite codes with genealogy tracking, QR codes, role-typed codes (GURU-ABC123-TEACH)

### Barthes: Studium vs. Punctum (Established Early)
The Studium/Punctum design philosophy was established in the earliest documents:
- **Studium (90%)**: The functional infrastructure — tabs, lesson plans, grades, profiles
- **Punctum (10%)**: The piercing detail — lotus petal companion pulsing when overwhelmed, first bloom animation, late-night soft glow

This "lotus petal companion" FAB concept (the `LotusPetalFAB`) was present from the very beginning.

### Early Security Architecture
- Multi-tenant: All schools share one database, isolated via `school_id` + PostgreSQL Row-Level Security
- UUID primary keys (offline-ready, non-guessable)
- Tier-based data protection: Sacred (reflections, mood) → Sensitive (grades, rosters) → Community (posts) → Public (library)
- `requireAuth()`, `requireTeacherAccess()`, `requireClassroomAccess()` utilities established

### UI Abstraction Layer (Early Decision)
The `@/ui` abstraction layer was established to prevent TypeScript stack overflow caused by circular imports from `@gluestack-ui/themed`. All components must use `@/ui`, never direct Gluestack imports. This resolved a critical TS compilation crash.

### What Was Built in Phase 1
- Authentication (email/password + Google OAuth)
- Student profiles (individual creation)
- Attendance tracking (daily marking, history)
- Lessons & assignments (full CRUD)
- Grading system (marks, GPA, feedback)
- Wellbeing features: Mood Lotus, Fire Journal, Daily Rhythm, Joy Jar, Gratitude Glimmers, Wisdom Seeds, Tomorrow's Prep, Energy Forecast, Wind-Down Ritual, Venting Space
- Community: Groups, Posts, Comments
- Library: Resources, Collections
- QR code system: generation + scanning (expo-camera)
- Invitation system: genealogy tracking
- i18n: Sinhala, Tamil, English

---

## Phase 2: Alpha-Beta Phase (Alpha-Beta folder — Early February 2026)

### PRD Integration (February 8, 2026)
A comprehensive Product Requirements Document was integrated, adding two major new concepts:

#### NEW: Thuthimal (තුතිමල් — "Flower of Gratitude")
**Revolutionary economic model concept**: Anyone (alumni, communities, past students) can gift Pro subscriptions to teachers as an act of gratitude. A teacher receives a visible badge: *"Your Pro subscription is a gift of gratitude (තුතිමල්) from [name]"*.
- Database: `is_thuthimal`, `thuthimal_gifter`, `thuthimal_gifted_at` columns added to `users`
- UI: `ThuthimalBadge.tsx` component (full + compact modes)
- Alpha: Manual (external webpage + admin flags); Beta: Automated (payment gateway)
- **Philosophy shift**: From transactional subscription to *gift economics*

#### NEW: Five-Section Architecture Formalized
While the 5-tab structure existed, the documentation now formalized it as "Five Stable Ecological Zones":
1. **Self** — The Inner Ecology (private, non-comparative)
2. **Classroom** — The Operational Ecology (adapts: Teacher→class, Student→learning space, Principal→school)
3. **Community** — The Relational Ecology (peer connection, lateral feedback loops)
4. **Library** — The Knowledge Ecology (shared resources, collective memory)
5. **Profile** — Identity & Boundaries (role management, Thuthimal status)

### Alpha Target: February 14, 2026 (5-day build)
The `ALPHA_PROGRESS_FEB8.md` and `ALPHA_REQUIREMENTS.md` set a specific 5-day build plan:

**Already complete by Feb 8:**
- Daily content system: `daily_content` table, `src/lib/api/dailyContent.ts`, `DailyContentCard.tsx`
- Thuthimal badge system
- Auth screen redesign (login/signup pill-style toggle, simplified signup to email+password)

**Still needed for Alpha:**
1. Bulk student creation (`BulkStudentCreation.tsx`)
2. OCR scanner (`OCRScanner.tsx`, `@react-native-ml-kit/text-recognition`)
3. QR code enhancements (invitation limits max-5, auto-generated context text)
4. Photo upload + principal sharing (`classroom_photos` table)
5. Principal attendance dashboard (aggregated, privacy-preserving)
6. Profile completion progress bar
7. Onboarding philosophy screens (5-screen flow, skippable)
8. In-app notifications

### Authentication Pivot: Passwordless
The `GURUDEVI_ALPHA_COMPLETE_FINAL.md` ("LOCKED" spec dated Feb 9) introduced **Passwordless Auth** (Google + Magic Links) as the preferred auth strategy, with deep link invitations via Firebase. The previous email+password approach was superseded.

### Educational Ecology Philosophy Formalized
The `ECOLOGY_BASED_FEATURES.md` document drew on Bronfenbrenner's Ecological Systems Theory, Polycentric Governance, Autopoietic Systems, and Cybernetic Feedback to formalize Gurudevi's philosophy:
- **Polycentric**: Multiple decision-making centers — students, teachers, principals each have agency
- **Autopoietic**: Each level (classroom, school, system) sustains itself
- **Cybernetic Feedback**: Bi-directional information flow, especially bottom-up feedback
- **Breaking Broken Loops**: Most educational systems have strong downward flow but weak upward flow (student→teacher, teacher→principal)

### Community & Library Ecosystems Designed
- **Community**: "Heartbeat" metaphor — Sacred Missions (Manifestos), Community Feed, Groups (local + inter-school)
- **Library**: Dual workspace — Personal Desk (offline-first, teacher's workbench) + Global Sanctuary (Netflix for Learning)

---

## Phase 3: Mid-Development (hmmm folder — February 10-15, 2026)

### The Environment Engine (February 13, 2026)
The most significant architectural addition of this phase: a centralized **Environment Engine** (`EnvironmentContext.tsx`) that unifies all adaptive state into one reactive hook.

**Six Pillars of Universal Parameters:**
1. **Role** (Teacher, Student, Principal, Admin, Founder, Section Head)
2. **Theme Matrix** (Light/Dark base × Temporal modifier: Dawn/Day/Evening/Night)
3. **Language** (English, Sinhala, Tamil — first-class citizens)
4. **Reality (Hardware/Network)** — Device tier (Low: <3GB RAM, Medium: 3-6GB, High: >6GB); Network quality (offline/poor/fair/good/excellent)
5. **The Veil (Privacy Toggle)** — Global toggle to instantly mask sensitive data (grades, salary, contact info)
6. **Visual Fidelity** (Auto/Low/High — "Glass Sanctuary" vs "Paper Sanctuary")

**The "Mud Rule"**: If a feature works on iPhone 15 but lags on a $100 Android, it is **broken**.

**Implementation completed:**
- `src/context/types.ts`, `src/context/utils.ts`, `src/context/EnvironmentContext.tsx`
- `src/components/shared/EnvironmentGuard.tsx` (adaptive UI wrapper)
- `AppSettingsScreen.tsx` (800+ lines, Gentle UX for technical settings)
- Network strength monitoring (Data Saver mode auto-activates on poor connections)
- 26 unit tests passing for environment context

**Bio-Resonance Layer (DEFERRED):**
- Adaptive haptics (Crisp/Day vs. Breathing/Night) — NOT YET IMPLEMENTED
- Visual Unfolding (petal-like scaling animations) — NOT YET IMPLEMENTED
- Ecosystem Pulsing for LotusPetalFAB — NOT YET IMPLEMENTED

### Triple Helix BDD Philosophy Adopted
The **Triple Helix Development** approach was formally adopted:
1. **Constraints (Gravity)** — Define hardware/network limits first
2. **BDD (Soul)** — Define user behavior with Gherkin `.feature` files
3. **TDD (Bone)** — Write failing tests first, then implement

**Web-First BDD strategy**: Use `@testing-library/react` + `react-native-web` for testing (bypasses React Native invariant errors in Jest environment).

### Offline-First Architecture (February 15, 2026)
Full offline architecture implemented:
- `useMutationQueue.ts` — Zustand store for persistent outbox (MMKV-backed)
- `SyncManager.tsx` — Headless component; replays queue when online
- `useSafeMutation.ts` — Replaces standard useMutation; queues offline
- `MUTATION_REGISTRY` — Maps string keys to async API functions
- **Optimistic updates**: UI responds immediately; sync happens in background

### MMKV Hybrid Persistence Pattern
Established as the "Veteran's Advice": MMKV is primary (blazing fast JSI), AsyncStorage is the fail-safe fallback if MMKV fails to initialize (common on some iOS/Expo environments). **Never use in-memory only as a fallback in production**.

### AI-Human Collaboration Guide
The `ai_human_collaboration_guide.md` formalized the development partnership:
- **BDD vs TDD blindspots**: BDD covers "happy paths"; TDD covers edge cases — need both
- **Goodhart's Law trap**: "When a measure becomes a target, it ceases to be a good measure" — AI must not game tests
- **Web-First pattern**: Always use for universal component logic; never mix environments

---

## Phase 4: Feb 3rd Week (February 18-19, 2026)

### Strategic Pivot: From Invite-Only to Guest-Friendly
The `roadmap_comparison.md` identified the most significant strategic shift of the entire project:

**Alpha Priority (before):** Invite-only exclusiveness, heavy focus on Deep Links, QR Invitations, Passwordless Auth as gatekeepers
**Next Phase Priority (after):** Guest-friendly, crash-proof exploration *before* authentication commitment

Key changes:
- Guest Error Elimination: Audit all sections for RLS/fetch errors in guest mode
- Show "Create account to sync" instead of errors
- `useRoleFeatures` hook for feature visibility by role
- "Explore as Guest" button with Terms footer on Welcome screen

### Gamification Layer Added (Subtle, Non-Extractive)
The `2026-02-18_next_phase_roadmap.md` introduced gamification — but intentionally aligned with Thuthimal/Gratitude philosophy, not extractive mechanics:
- Stat card initialized at zero for new users
- Hidden achievements: "Sanctuary Seeker", "Early Riser", "Rhythm Keeper", "Wisdom Collector", "Community Builder", "QR Hunter"
- Milestone actions tracking: +10 for joining, +5 for exploring each section, +20 for creating account
- Visual growth (lotus/tree progression) rather than points/leaderboards

### QR Extended Beyond Invitations
QR scope expanded from invitation-only to daily utility:
- Classroom join QR (`gurudevi://classroom/{id}/join`)
- Assignment submission QR
- School invitation QR
- Personal profile QR (`gurudevi://user/{id}/connect`)
- Resource sharing QR

### Delegation Playbook Established
The `delegation_playbook.md` formalized the AI agent division of labor:
- **Green (GitHub Copilot Agent)**: UI component audits, boilerplate, skeleton loaders, pattern-matching tasks
- **Yellow (Collaborative)**: Gamification logic, guest mode fallbacks — agent starts, human finishes
- **Red (Keep Manual/Antigravity)**: RLS security, deep link architecture, "Vibe" aesthetics

### Community & Library Full Redesign
- **Community**: Feed aggregates from all joined groups, Sacred Missions (Manifestos) from principal shown at top, Groups split into "My Sanctuary" (school) + "Galaxy" (inter-school discovery)
- **Library**: Personal Desk (offline-first creative workbench) + Global Sanctuary ("Netflix for Learning" with SmartShelves, CollectionCards, Resource Remixing/Forking, Flash-Play mode, Shadow Shelves for study groups)

---

## Phase 5: Feb 4th Week (February 24-28, 2026)

### Agentic Vision 2026
The `agentic_vision_2026.md` articulated the long-term vision:
- Gurudevi as a **Relational Substrate** (not a management tool)
- **Polycentric, Holarchic, Autopoetic** educational ecology
- AI agents (OpenClaw + Synalinks) as **Cybernetic Repair Units**:
  - Close the Affective Loop (detect "Vibe Shifts," notify Principal with Support Proposals)
  - Repair Resource Flows (redistribute operational load)
  - All governed by Sanctuary Manifestos (cannot violate Sovereignty or Dignity)
- 2026 roadmap: **Holarchic Routing**, **Autopoetic Signaling** (Wisdom Seeds evolve over time), **Cybernetic Dashboard**

### Senior Developer Audit (February 24, 2026)
Overall architecture maturity: **56/100** — "Highly Competent Skeleton."

Findings:
1. **Domain ownership gap**: Mobile `src/lib/api/*` near-forks `packages/core/src/api/*` (similarity 0.95-0.998)
2. **QR flows fragmented**: No centralized resolver; `join-class:`, `join-group:`, raw UUIDs with no unified parser
3. **Type safety**: Widespread `any` usage in API/hooks
4. **Testing**: BDD infrastructure good; needs more critical journey coverage
5. **CI/CD gap**: `android-build.yml` exists but no PR quality guard

### Major Codex Audits Completed
- **A11y**: Score 5/100 — 175 interactive elements, only 4 with explicit accessibility props
- **Localization**: Sinhala 76.9% coverage (176 missing keys), Tamil 74.3% (200 missing keys); 44.7% of .tsx files have no `t(...)` usage; 272 potential hardcoded strings
- **QR**: Score 47/100 — generation surfaces good, routing completeness 5/25 (critical gap)
- **OCR**: Score 34/100 — printed English moderate, Sinhala/Tamil handwritten low
- **Monorepo redundancy**: `src/lib/api/*`, `GroupsScreen`, `GroupDetailsScreen`, `LotusPetalFAB`, grading components duplicated between app and packages

### Profile Completion System Implemented
Complete system built:
- `packages/profile/src/config/profileSections.ts` — SSOT manifest with weighted fields
- `useProfileCompletion()` hook — unified calculator replacing two divergent implementations
- `SanctuaryProgressBar.tsx` — reusable in `@repo/ui`
- `AvatarDisplay.tsx` — tap-to-edit, Supabase Storage upload
- `AchievementUnlockOverlay.tsx` — celebration animation at 100%
- `UserAvatar.tsx` — initials + role-emoji fallback for all avatars

### Living Theme System Designed (February 24, 2026)
6-phase × 2-theme matrix:
- **6 phases**: predawn (4-6 AM), dawn (6-9 AM), morning (9AM-12PM), afternoon (12-5PM), dusk (5-8PM), night (8PM-4AM)
- **Dark world phases**: predawn (violet), dawn (saffron), dusk (teal), night (gold)
- **Light world phases**: morning (fresh), afternoon (warm clear)
- All colors in `packages/ui/src/theme/Theme.ts` as a `phases` map — semantic tokens only, no raw hex in components
- `useTheme()` hook for all components

### Infrastructure Hardening
- **Reliability**: Idempotency keys (UUID-v5 deterministic), dead letter queue, exponential backoff, conflict resolution policies (attendance: last-write-wins, self: client-wins, community: server-wins)
- **CI/CD**: `quality-gate.yml` GitHub Action (lint + typecheck + test on every PR)
- **pnpm check-all** command: runs lint, check-types, test in one command
- **Authorization hardening**: `authorization.ts` now uses live DB checks (not stale JWT metadata)
- **LanguageUtils.ts**: Persistent locale using SafeZustandStorage; zero-flash on boot
- **Shadow UI consolidation**: Legacy `LotusPetalFAB.tsx` removed from app; app now uses `@repo/ui` version

### 5-Tier Branching Strategy Established
- `main-innovate` (Volatile: experimental)
- `main-dev` (Semi-Stable: feature-complete)
- `main-QA` (Stable: testing/security audit)
- `main-preview` (Production-Ready: beta testing)
- `main` (Mission-Critical: public release)

### TAIL_FIN: Metacognitive Operating System for AI Agent
`TAIL_FIN.md` and `PARTNERSHIP_MANIFESTO.md` formalized the AI-human collaboration philosophy:
- **Convolutional Resonance (CNN thinking)**: Codebase has topology; changes are kernels that slide across spatial field
- **Library First protocol**: Logic belongs upstream in `@repo/[domain]`, screens are thin shells
- **Theme Loyalty**: Trust the Theme perfectly; expand tokens rather than hardcode fallbacks
- **Reparative Mindset**: Inspired by Jackson's "Broken World Thinking" — software is in constant decay; implementation is an act of care
- **O(Trajectory) vs O(1)**: Invest in long-term durability, not just current prompt satisfaction

---

## Phase 6: Late February / March 1st Week (February 27, 2026 — Current)

### Skia Dark Overlay Bug (P0 Blocker)
The `2026-02-27-priority-matrix-and-skia-runbook.md` documents a critical rendering bug:
- **Symptom**: Skia NoiseOverlay renders as full-screen dark opaque rectangle, hiding all UI
- **Probable causes**: Overlay alpha math, ColorMatrix tint multiply, z-order + blend mode, GPU-specific behavior
- **Fix path**: Step A (zero opacity baseline) → Step B (minimal additive grain, no matrix) → Step C (hard clamp: 0≤opacity≤0.03) → Step D (guarded integration as last child, `pointerEvents="none"`) → Step E (feature flag: `skiaNoiseOverlay=false` by default)
- **Ownership**: Agent implements guarded fallback; User approves visual target on real devices

### Design Master Governance Document Created
`docs/Core/design/GURUDEVI_DESIGN_MASTER.md` establishes:
- **Source of Truth Hierarchy**: Implementation truth (code) > design constitution docs > Core docs > all other docs
- **Canonical design set**: `gurudevi-design-language.md`, `gurudevi-space-specifications.md`, `gurudevi-design-retina.md`, `gurudevi-component-library.md`, `gurudevi-skia-implementation.md`, `gurudevi-architecture.md`
- **Skia location canonicalized**: `packages/ui/src/components-native/` with import `@gurudevi/ui/native`
- **Change protocol**: Update master doc + canonical docs + code in same PR when possible

### Monorepo Duplication Audit Completed
`monorepo_duplication_audit.md` identified high-impact duplicates:
- `LotusPetalFAB`: App version (complex with PanResponder) vs Package version (simpler emoji)
- `GroupsScreen`, `GroupDetailsScreen`, `CreatePostModal`, `ReportPostModal`: Identical names in app and `@repo/community`
- `useTheme / useAccessibility`, `useInventory`: Duplicated hooks
- **Proposed sanitization**: Extract → Harmonize → Sanitize → Verify

### Priority Matrix Execution Plan (Current Week)
Immediate 7-day plan from priority matrix:
- Day 1-2: Skia stabilization + feature flag + Header/navbar token audit
- Day 3-4: Self screen redesign + Community posting constraints
- Day 5: Classroom role-specific demos + Library visual cleanup
- Day 6-7: Real notifications wiring + QA smoke suite

---

## Key Patterns That Evolved

### Architecture Evolution
| Aspect | Phase 1 | Phase 3 | Phase 5 | Phase 6 |
|--------|---------|---------|---------|---------|
| State | Zustand | Zustand + EnvironmentContext | Zustand + Query + MutationQueue | Same + Living Theme |
| UI | Direct Gluestack | `@/ui` abstraction | `@repo/ui` monorepo package | Skia + `packages/ui/components-native` |
| Testing | None | BDD (Gherkin + Jest) | BDD + quality-gate CI | BDD + codex audits |
| Offline | Not designed | SyncManager outbox | Idempotency + DLQ | Conflict resolution policies |
| Auth | Email+password | Passwordless (magic links) | DB-backed role checks | Same |

### Design System Evolution
- **Phase 1**: Color palette defined (voidIndigo, creamSilence, sanctuarySaffron, etc.), 4-phase temporal
- **Phase 3**: AppSettingsScreen, EnvironmentGuard, Reality Tiers (Glass vs Paper Sanctuary)
- **Phase 5**: 6-phase temporal matrix, Shadow Violet for all shadows, Vellum ground color, Skia planned
- **Phase 6**: Design Master governance, Skia canonicalized location, token hierarchy locked

### Features Evolution
- **Phase 1**: Core CRUD (lessons, attendance, grading, community groups)
- **Phase 2**: Thuthimal, bulk student creation, photo upload, principal dashboard
- **Phase 3**: Environment Engine, offline architecture, i18n hardening
- **Phase 4**: Guest mode, gamification, expanded QR utility, community/library redesign
- **Phase 5**: Profile completion system, Living Theme, groups infrastructure, horizontal chips
- **Phase 6**: Skia atmosphere, premium UI redesign of header/navbar/self/community

### AI Collaboration Evolution
- **Phase 1**: Sequential prompts, no formal methodology
- **Phase 3**: Triple Helix BDD philosophy, Web-First testing strategy
- **Phase 4**: Delegation playbook (Green/Yellow/Red task categories for agents)
- **Phase 5**: TAIL_FIN metacognitive OS, PARTNERSHIP_MANIFESTO (Hiccup/Toothless), Convolutional Resonance, O(Trajectory)
- **Phase 6**: Chronicle of Resonance tracking the partnership's evolution

### Philosophy Evolution
- **Phase 1**: Sanctuary aesthetics, teacher-centric, Studium/Punctum, Lotus metaphor
- **Phase 2**: Educational Ecology (Bronfenbrenner), Polycentric Governance, Autopoietic Systems
- **Phase 3**: "The Mud Rule" (performance constraint), "Broken World Thinking"
- **Phase 4**: Cybernetic Repair, bottom-up feedback loops
- **Phase 5**: Relational Substrate, Holarchic (not hierarchical), Autopoetic Signaling
- **Phase 6**: Promise Theory (components make promises; system self-heals)

---

## What Stayed Consistent Throughout

1. **The Lotus metaphor and philosophy** — never changed, deepened with each phase
2. **Five-tab structure** (Self/Classroom/Community/Library/Profile) — locked from Phase 1
3. **Same Reality, Different Views** — all roles see same structure, role-specific content
4. **Privacy First** — Self is sacred, inaccessible to higher roles
5. **Trilingual from Day 1** — Sinhala/Tamil/English as equal citizens, never an afterthought
6. **Teacher-centric hierarchy** — teachers are the heavy lifters, get priority
7. **Sanctuary aesthetic** — warm earth tones, organic animations, no harsh blacks/whites
8. **Supabase + Expo + React Native** — tech stack core unchanged
9. **No extractive gamification** — no leaderboards, streak shaming, exploitative mechanics
10. **Energy EROI principle** — every feature must return more energy than it consumes
11. **LotusPetalFAB** as the wise guardian companion — present from earliest planning
12. **Multi-tenant school isolation via school_id RLS** — fundamental security principle
