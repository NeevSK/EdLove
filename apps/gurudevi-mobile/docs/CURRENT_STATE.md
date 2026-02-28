# CURRENT STATE: What Gurudevi Is Right Now

> Comprehensive snapshot of the app's current architecture, feature status, known issues, and technical decisions as of March 2026.
> **IMPORTANT**: This document is reconciled against actual code, not just documentation claims. Status symbols reflect code reality, not intent.
>
> - ✅ = Confirmed working in code (not just mentioned in docs)
> - ⚠️ = Built but incomplete or broken (specific reason given)
> - 🔲 = Scaffolded/Stubbed (code exists but is not functional)
> - ❌ = Not built

---

## Tech Stack (Locked — Do Not Change Without Testing)

```json
{
  "expo": "~54.0.32",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "typescript": "~5.9.2",
  "@gluestack-ui/themed": "v2",
  "react-native-reanimated": "4.1.1",
  "zustand": "4.x",
  "react-native-mmkv": "2.x",
  "i18next": "23.x",
  "@supabase/supabase-js": "latest",
  "turbo": "latest",
  "pnpm": "workspaces"
}
```

**Critical notes:**
- This exact Expo 54 + React 19 + RN 0.81.5 combination survived 4 failed builds. Do not upgrade without testing.
- Do NOT use Moti (broken with React 19). Use `react-native-reanimated` directly.
- Never import from `@gluestack-ui/themed` directly in screens. Always use `@/ui` or `@repo/ui`.

---

## Monorepo Structure (Verified from Code)

```
gurudevi/   (pnpm workspace root)
├── apps/
│   └── gurudevi-mobile/           # The mobile app (Expo 54)
│       ├── App.tsx                # Provider stack: QueryClient → EnvironmentProvider →
│       │                          #   GluestackUIProvider → PostHogProvider →
│       │                          #   NavigationContainer → SentryWrap
│       │                          # getFabActions() — all console.log TODOs (not wired)
│       │                          # NoiseOverlay — DISABLED via comment (Android black screen)
│       ├── src/
│       │   ├── screens/           # Thin screen shells (SelfScreen, ClassroomScreen, etc.)
│       │   ├── components/        # App-specific components
│       │   │   └── PulseDashboard/ # SelfScreen default view — hardcoded action items
│       │   ├── navigation/
│       │   │   ├── TabNavigator.tsx        # 5 tabs: Profile|Classroom|SELF(center)|Community|Library
│       │   │   └── ClassroomStackNavigator.tsx
│       │   ├── context/           # EnvironmentContext.tsx (6-pillar engine)
│       │   ├── hooks/             # App-level hooks (useQRDeepLink, etc.)
│       │   ├── lib/
│       │   │   ├── api/           # ⚠️ REDUNDANT with @repo/core — double maintenance burden
│       │   │   └── sync/          # SyncManager.tsx (headless), registry.ts (MUTATION_REGISTRY)
│       │   └── utils/             # LanguageUtils.ts, themeColors.ts, etc.
│       └── docs/                  # All documentation (this file lives here)
├── packages/
│   ├── ui/                        # Design system, tokens, shared components
│   │   └── src/
│   │       ├── theme/Theme.ts     # SSOT for all colors/spacing/phase matrix
│   │       ├── components/        # Shared components (LogoutModal, DeleteAccountModal, etc.)
│   │       ├── components-native/ # Skia/native-only — NoiseOverlay lives here (DISABLED)
│   │       └── context/types.ts   # TemporalPhase, ThemeMode, etc.
│   ├── core/                      # Supabase client, auth, Zustand store, sync
│   │   └── src/
│   │       ├── api/               # SSOT API modules — always import these, not app duplicates
│   │       │   └── (assignments, attendance, auth, classroom, classroomStudents, demo,
│   │       │       grading, groups, inventory, lessonMaterials, resources, rewards,
│   │       │       sacredMissions, teacher, tracking, onboarding, school, agents,
│   │       │       thuthimal, dailyContent)
│   │       ├── store/useStore.ts  # AppState Zustand store (persisted to MMKV)
│   │       ├── lib/               # storage.ts, apiInterceptor.ts, grading.ts, etc.
│   │       ├── hooks/             # useSafeMutation.ts
│   │       ├── sync/              # types.ts, useMutationQueue.ts
│   │       └── monitoring/        # sentry.ts, posthog.ts (initSentry, initPostHog)
│   ├── classroom/                 # Classroom domain — TeacherDashboard, ClassroomList,
│   │                              #   CreateClassroomModal, ScannerModal, TeacherFeedbackModal,
│   │                              #   OCRScanner (🔲 stub), OCRStudentImport,
│   │                              #   GoogleVisionProvider (🔲), MLKitProvider (🔲),
│   │                              #   OpenAIVisionProvider (🔲), StudentParser, TableParser
│   ├── community/                 # Community domain
│   │   └── ⚠️ GroupDetailsScreen exists HERE and also in app screens — duplication
│   ├── library/                   # Library domain — LibraryScreen.tsx, useLibrary hook,
│   │                              #   AddResourceModal, ResourceList, FAB inline (LotusPetalFAB)
│   ├── profile/                   # Profile domain — PROFILE_SECTIONS SSOT, useProfileCompletion,
│   │                              #   IdentityCard, FullProfileScreen, SanctuaryProgressBar,
│   │                              #   AvatarDisplay, AchievementUnlockOverlay
│   ├── self/                      # Self/wellbeing domain — MoodLotus, FireJournal, DailyRhythm,
│   │                              #   JoyJar, GratitudeGlimmers, WisdomSeeds, TomorrowPrep,
│   │                              #   EnergyForecast, WindDownRitual
│   │                              #   SleepTracker (🔲 exists but NOT wired in TeacherSelfView)
│   │                              #   RemindersManager (🔲 exists but NOT wired)
│   │                              #   VoiceJournaling (🔲 exists but NOT wired)
│   ├── scanner-kit/               # QR: QRResolver.ts, QRPayload.ts, QRBuilder.ts,
│   │                              #   QRShareButton, useQRDeepLink, QRHandlerScreen
│   └── design-tokens/             # Token definitions
├── docs/                          # Repo-level plans
├── pnpm-workspace.yaml
├── turbo.json
└── .github/workflows/
    └── quality-gate.yml           # CI: lint + typecheck + test on every PR
```

### ⚠️ Known Structural Issues (Duplication)
- **Community screens in 2 places**: `GroupDetailsScreen` exists in both `apps/gurudevi-mobile/src/screens/` and `packages/community/`. CreatePostModal and ReportPostModal similarly duplicated. Bug fixes must be applied in two places until consolidated.
- **API in 2 places**: `apps/gurudevi-mobile/src/lib/api/*.ts` files are 0.95–0.998 similar to `packages/core/src/api/*`. SSOT is `@repo/core`. App duplicates must be removed.
- **LotusPetalFAB in 2 places**: App version (complex PanResponder) vs `@repo/ui` version (simpler). Not yet harmonized.

---

## What Has Been Built (Code-Verified Status)

### ✅ Authentication System
- Email/password signup and login (simplified — full name and role in onboarding)
- Google OAuth sign-in via Supabase
- Session persistence via MMKV + AsyncStorage fallback
- Forgot password flow via Supabase password reset
- Anonymous "Explore as Guest" → `signInAnonymously()` in WelcomeScreen
- Language picker on WelcomeScreen; "I have an account" → AuthScreen
- **Verified in code**: `WelcomeScreen.tsx`, `AuthScreen.tsx` — email/password + Google OAuth + QR scan invite
- Zero-flash language initialization (`LanguageUtils.ts` + `SafeZustandStorage`)

### ✅ Onboarding Flow
- 9 screens: Name (required) → Role (required) → **Orientation capture (optional, skippable)** → 5 philosophy tour screens (skippable)
- `onboarding_completed` flag in user profile triggers routing in `App.tsx`
- Orientation step: 3 situational picture-card questions → silently encodes `OrientationSeeds` (4 dimensions, 0–100 each). If skipped, seeds are null.
- **Verified in code**: `OnboardingScreen.tsx` + `OrientationCaptureStep.tsx`

### ✅ Environment Engine (`src/context/EnvironmentContext.tsx`)
**The Living Organism** — unified reactive state for all environmental parameters:
- **Role Management**: Teacher, Student, Principal, Admin, Founder, Section Head — same 5-tab structure for all
- **Temporal Theme (6 phases)**: predawn (4–6 AM), dawn (6–9 AM), morning (9 AM–12 PM), afternoon (12–5 PM), dusk (5–8 PM), night (8 PM–4 AM)
- **Language**: English, Sinhala, Tamil with real-time switching and persistence
- **Reality Detection**: Device tier (Low/Medium/High RAM), network quality (offline/poor/fair/good/excellent), data saver mode auto-activates
- **Visual Fidelity**: Auto/Low/High — `useHighFidelity()`, `useShouldAnimate()`, `useShouldLoadHighQualityImages()` hooks
- **The Veil**: Global privacy toggle to instantly mask sensitive data
- **Unit tests**: 26 tests passing (`src/__tests__/context/utils.test.ts`)

### ✅ 5-Tab Navigation
- **Verified in code** (`TabNavigator.tsx`): 5 tabs — Profile | Classroom | Self (CENTER) | Community | Library
- `TabNavigator.tsx` with `id="MainTabs"` (required prop); `ClassroomStackNavigator.tsx` with `id="ClassroomStack"`
- Role-based content routing (same tabs, different content per role)
- `LotusPetalFAB.tsx` — in TabNavigator but **NOT rendered at tab level**; rendered per-screen (CommunityScreen and LibraryScreen have their own inline FABs)
- `getFabActions()` in `App.tsx` — **ALL actions are `console.log` placeholders. Not wired to anything.**

### ⚠️ Self Screen (SelfScreen) — Built but with Critical Gaps
**Verified in code** (`SelfScreen.tsx`):
- `showPulse` state defaults to `true` → **PulseDashboard always shows first**
- **PulseDashboard HARDCODED data**: greeting + teacherName from store, DailyResonanceCard (motivation + wisdom from `daily_content` API), but the action items **"Mark Morning Attendance"** and **"Grade Science Assignment"** are `console.log` placeholders — **NOT real data from DB**. Teachers will see fake tasks.
- "Enter Full Sanctuary" button switches to role-specific view
- **TeacherSelfView**: MoodLotus ✅ (real DB integration), FireJournal ✅, DailyRhythm ✅, JoyJar ✅, GratitudeGlimmers ✅, WisdomSeeds ✅, TomorrowPrep ✅, EnergyForecast ✅, WindDownRitual ✅ — all components exist
- **ResonancePatternCard** ✅ (new) — shows 4-axis orientation fingerprint. Calls `useOrientationInference` hook internally. Never shows a type label — shows a pattern shape only. Rendered after DailyContentCards.
- **🔲 NOT WIRED in TeacherSelfView**: `SleepTracker.tsx`, `RemindersManager.tsx`, `VoiceJournaling.tsx` — code exists in `packages/self/` but are not rendered or connected

### ✅ Classroom Section (Core Flows Verified)
**Teacher flow** (`TeacherDashboard.tsx` in `@repo/classroom`):
- ClassroomList ✅, CreateClassroomModal ✅, ScannerModal ✅, TeacherFeedbackModal ✅
- ClassroomDashboard tabs: students, attendance, gradebook, lessons, resources, inventory ✅
- GradebookTable, ReportCard, GradeEntryForm ✅

**Student flow** (`StudentDashboard.tsx`):
- Stat cards: enrolledClasses, pendingAssignments, unlockedRewards ✅
- ClassroomList ✅; assignment submission ✅; grades/attendance history ✅

**Role routing** (verified in `ClassroomScreen.tsx`):
- founder → FounderSchoolView, principal → PrincipalSchoolView, section_head → SectionHeadView
- grade_head → GradeHeadView, teacher → TeacherDashboard, student → StudentDashboard, guest/default → ClassroomList
- `profile_completion` nudge exists but `profileCompleted` check is in `classroomData`

**🔲 OCR Scanner** (`OCRScanner.tsx`, `OCRStudentImport.tsx` in `@repo/classroom`):
- `GoogleVisionProvider`, `MLKitProvider`, `OpenAIVisionProvider` — **all are skeleton stubs only**
- `StudentParser`, `TableParser` — exist but depend on stub providers
- **NOT wired to any active UI path** — orphaned code

### ✅ Community Section (Core Built, Chat Missing)
**Verified in code** (`CommunityScreen.tsx`):
- Two subtabs: "Resonant Feed" (posts) and "Infinite Galaxy" (groups) ✅
- GroupsScreen: Sanctuary (school groups) vs Galaxy (cross-school) sub-tabs ✅
- `useCommunityGroups` hook ✅; GroupCard ✅; create/join/leave flows ✅
- GroupDetailsScreen in `packages/community` ✅; CreatePostModal ✅; ReportPostModal ✅
- Sacred Missions (Manifestos) from Principal ✅

**❌ Chat**: **ZERO chat implementation in the codebase**. GroupsScreen has UI scaffolding (chat button) but there is no chat screen, no `group_messages` table integration, no Supabase Realtime subscription for chat. This is a complete gap, not partial.

### ✅ Library Section
**Verified in code** (`packages/library/LibraryScreen.tsx`):
- `useLibrary` hook ✅, `AddResourceModal` ✅, `ResourceList` ✅
- `LIBRARY_UI_CATEGORIES` imported from constants ✅
- Search + category filter chips ✅
- `LotusPetalFAB` rendered **inline** in LibraryScreen (not via TabNavigator)
- **🔲 PDF viewer**: `PDFViewerScreen` exists (code), but uses external link, not in-app rendering
- **🔲 Video player**: `VideoPlayerScreen` exists (code) but `expo-av` integration incomplete
- **❌ Library content**: No curated default content — empty library for new schools (cold start problem)

### ✅ Profile Section
**Verified in code**:
- `IdentityCard.tsx` — role-aware (reads actual user role, not hardcoded "teacher") ✅
- `FullProfileScreen.tsx` with inline editing ✅
- `useProfileCompletion()` hook + `PROFILE_SECTIONS` SSOT in `packages/profile` ✅
- `SanctuaryProgressBar.tsx`, `AvatarDisplay.tsx`, `AchievementUnlockOverlay.tsx` ✅
- `LogoutModal.tsx` in `@repo/ui` (replaced `Alert.alert`) ✅
- `DeleteAccountModal.tsx` in `@repo/ui` ✅
- `ThuthimalBadge.tsx` (full + compact modes); `thuthimal` table added Feb 26 migration ✅

### ✅ QR & Invitation System (Partially Unified)
**Verified in code** (`packages/scanner-kit/`):
- `QRResolver.ts` — canonical parser, supports legacy formats, `resolveQR()` function ✅
- `QRPayload.ts` — typed action payloads ✅
- `QRBuilder.ts`, `QRShareButton.tsx` ✅
- `useQRDeepLink` hook ✅; `QRHandlerScreen` for modal dispatch ✅
- Invite code generation (GURU-ABC123-TEACH format), QR generation (SVG, ECC-H) ✅

**⚠️ Still broken**: `join-group:` QR generated but no consumer path found; Principal `InviteManager` QR state stored but modal not rendered; Teacher QR join does `classrooms.update({ teacher_id })` — overwrites ownership rather than creating membership link.

### ✅ Analytics & Monitoring
**Verified in code** (`packages/core/src/monitoring/`):
- `initSentry()` called in App.tsx; `Sentry.wrap(App)` wrapping ✅
- `initPostHog()` called; `trackEvent`, `identifyUser`, `PostHogProvider` ✅
- `useTracking` hook — `discoverFeature()` called in each main screen ✅
- `apiInterceptor.ts` — maps PostgREST codes (23505, 23503, 42P01, 42501) to user-friendly messages ✅

**⚠️ PostHog `useNavigationState` error**: PostHogProvider must be inside NavigationContainer — status of fix is uncertain.

### ✅ Offline Architecture
- `useMutationQueue.ts` (`@repo/core`): Zustand store persisted to MMKV key `'gurudevi-mutation-queue'` ✅
- `SyncManager.tsx` (app): Headless component; replays queue when online + queue > 0 ✅
- `useSafeMutation.ts` (`@repo/core`): Detects offline, queues to outbox, returns optimistic null ✅
- `MUTATION_REGISTRY`: Maps 'createPost', 'createInventoryRequest', 'createResource', 'toggleResourcePin', 'deleteResource', 'saveJournalEntry', 'saveDecision' ✅
- `NetworkStatusBanner.tsx`: Red (offline + pending count), Blue/Saffron (syncing) ✅

### ✅ Database Schema (Supabase)
Migrations from Feb 11–26 applied. Confirmed tables:
- Core: `schools`, `users` (with thuthimal fields), `classrooms`, `students`
- Academic: `lessons`, `assignments`, `submissions`, `attendance`, `grading`
- Community: `community_groups`, `community_posts`
- Library: `library_items`
- Profile/Gamification: `user_rewards`, `gift_codes`, `manifestos`, `sections`, `grades`, `invite_codes`, `profile_completion`
- Wellbeing: `daily_content`, `mood_logs`, `fire_journal`
- Social: `student_groups`, `thuthimal` (added Feb 26 — most recent migration)

**⚠️ DB migration status**: Uncertain for 10+ migrations. `migration_status.md` shows uncertainty. If migrations not applied, features that depend on new tables will silently fail.

### ✅ App Settings Screen (`AppSettingsScreen.tsx`)
- Theme, Visual Quality, Language selector, Privacy Veil toggle, device info ✅
- 72px minimum touch targets (exceeds 44px WCAG requirement) ✅

### ✅ Storage, State & i18n
- **Zustand AppState** persisted to MMKV; `SafeZustandStorage` wrapper ✅
- **i18n**: en (763 keys), si (587 keys / 76.9%), ta (567 keys / 74.3%) ✅
- **⚠️** 44.7% of .tsx files have no `t(...)` usage; ~272 hardcoded UI strings

### ✅ Testing & CI
- 26 passing unit tests for EnvironmentContext utils ✅
- BDD (jest-cucumber): Auth Refinement, Invitation System, Onboarding ✅
- `quality-gate.yml` GitHub Action: lint + typecheck + test on every PR ✅
- **⚠️** Classroom Management, Library Upload BDD tests pending
- **❌** E2E tests (Detox): not set up
- **❌** Accessibility testing (`@axe-core/react-native`): not set up

---

## Feature Completeness Matrix (Code-Verified)

| Feature | Status | Code-Verified Notes |
|---------|--------|---------------------|
| Auth (email/password/OAuth) | ✅ | Verified in WelcomeScreen, AuthScreen |
| Auth (anonymous guest) | ✅ | signInAnonymously() in WelcomeScreen |
| Onboarding (9 screens) | ✅ | Name + Role required; Orientation optional; screens 4-8 skippable |
| Self: OrientationSeeds capture | ✅ | Onboarding step 2 — 3 picture-card questions, skippable, saves to DB |
| Self: useOrientationInference | ✅ | Passive inference hook: explicit seeds → behavioral signals (quality-guarded) → role defaults |
| Self: ResonancePatternCard | ✅ | 4-axis fingerprint card, rendered in Student + Teacher self views |
| Environment Engine (6 pillars) | ✅ | 26 passing tests |
| PulseDashboard (Self default) | ⚠️ | Greeting real; action items HARDCODED (console.log) |
| Self: MoodLotus | ✅ | Real DB integration confirmed |
| Self: FireJournal | ✅ | |
| Self: DailyRhythm / JoyJar / GratitudeGlimmers | ✅ | |
| Self: WisdomSeeds / TomorrowPrep / EnergyForecast | ✅ | |
| Self: WindDownRitual | ✅ | |
| Self: SleepTracker | 🔲 | Component exists, NOT wired in TeacherSelfView |
| Self: RemindersManager | 🔲 | Component exists, NOT wired in TeacherSelfView |
| Self: VoiceJournaling | 🔲 | Component exists, NOT wired in TeacherSelfView |
| Self: Daily Content Cards (40 days) | ✅ | |
| Classroom: Create/Manage Classrooms | ✅ | |
| Classroom: Attendance | ✅ | |
| Classroom: Lessons & Assignments | ✅ | |
| Classroom: Grading | ✅ | GradebookTable, ReportCard, GradeEntryForm |
| Classroom: Student Profiles | ✅ | |
| Classroom: Role Routing (all roles) | ✅ | Verified in ClassroomScreen.tsx |
| Classroom: OCR Scanner | 🔲 | Components exist; providers are STUBS; NOT wired to UI |
| Classroom: OCR Providers (Google/MLKit/OpenAI) | 🔲 | Skeleton stubs only |
| Community: Groups (create/join/leave) | ✅ | useCommunityGroups hook confirmed |
| Community: Posts + Feed | ✅ | |
| Community: Sacred Missions (Manifestos) | ✅ | |
| Community: GroupDetailsScreen | ✅ | Exists in packages/community |
| Community: Group Chat | ❌ | ZERO code — no table, no Realtime, no UI |
| Community: Polls | ❌ | Not built |
| Community: Education tags for posts | ❌ | Not built |
| Library: Browse + Search + Category Filter | ✅ | Verified in packages/library |
| Library: AddResourceModal | ✅ | |
| Library: FAB (LotusPetalFAB inline) | ✅ | Rendered in LibraryScreen directly |
| Library: PDF viewer (in-app) | 🔲 | Screen exists, links out — not in-app |
| Library: Video player | 🔲 | Screen exists, integration incomplete |
| Library: Default curated content | ❌ | Empty for new schools — cold start problem |
| Profile: IdentityCard (role-aware) | ✅ | |
| Profile: FullProfileScreen (inline edit) | ✅ | |
| Profile: useProfileCompletion (SSOT) | ✅ | packages/profile SSOT confirmed |
| Profile: SanctuaryProgressBar | ✅ | |
| Profile: AchievementUnlockOverlay | ✅ | |
| Profile: ThuthimalBadge | ✅ | DB table added Feb 26 |
| Profile: LogoutModal / DeleteAccountModal | ✅ | In @repo/ui, replaces Alert.alert |
| QR: Generation + Scanning | ✅ | |
| QR: Unified Resolver (QRResolver.ts) | ✅ | resolveQR() canonical parser exists |
| QR: join-group consumer path | ❌ | QR generated but no consumer found |
| QR: Principal InviteManager modal render | ⚠️ | State stored, modal NOT rendered |
| QR: Teacher join (ownership vs membership) | ⚠️ | BUG: overwrites teacher_id instead of membership |
| FAB actions (App.tsx getFabActions) | ⚠️ | ALL console.log placeholders — not wired |
| Notifications (NotificationDrawer) | ⚠️ | Component exists; content unclear / likely hardcoded |
| Push Notifications | ❌ | Not built |
| Offline sync (outbox pattern) | ✅ | MUTATION_REGISTRY confirmed |
| i18n (en/si/ta) | ⚠️ | si: 76.9%, ta: 74.3%; 272 hardcoded strings |
| Accessibility (WCAG AA) | ⚠️ | Score ~5/100 — critical gap |
| Skia NoiseOverlay | ⚠️ | DISABLED in App.tsx via comment (Android black screen) |
| DB migrations applied | ⚠️ | Uncertain for 10+ migrations (migration_status.md) |
| useNavigationState error (PostHog) | ⚠️ | Status of fix uncertain |
| EAS Production Build | ❌ | Build workflow exists, not yet run |
| App Store submission | ❌ | Not done |

---

## Code vs Docs Discrepancies

> These are places where prior documentation claimed something was done but code shows otherwise. These are NOT failures — they are honest gaps that must be tracked.

| # | Doc Claim | Code Reality |
|---|-----------|--------------|
| 1 | "PulseDashboard" is the Self default view with real tasks | Action items ("Mark Morning Attendance", "Grade Science Assignment") are **hardcoded console.log** — not queried from DB |
| 2 | "LotusPetalFAB is context-aware floating action button" | FAB actions in App.tsx `getFabActions()` are **all console.log** — none wired to actual navigation or actions |
| 3 | "OCR Scanner: component built" implies working feature | `GoogleVisionProvider`, `MLKitProvider`, `OpenAIVisionProvider` are **skeleton stubs**; not wired to any UI path |
| 4 | Self section: "All features have complete UI + API + DB integration" | `SleepTracker`, `RemindersManager`, `VoiceJournaling` are **built but NOT wired** into TeacherSelfView |
| 5 | "Group Chat (WhatsApp-style): pending" | More accurately: **ZERO code exists** — no DB table, no Realtime subscription, no screen, no hook |
| 6 | "QR payload routing: CRITICAL GAP — no centralized resolver" | Partially addressed: `QRResolver.ts` exists with `resolveQR()`. But `join-group` consumer path still missing and InviteManager modal not rendered. |
| 7 | Feature matrix marks "Notifications" as "❌ Pending" | `NotificationDrawer.tsx` **exists** as component — needs investigation of what data it shows |
| 8 | Docs say Onboarding is "5-screen philosophy flow" | Code confirms **9 screens**: Name + Role + Orientation (optional) + 5 philosophy screens |
| 9 | "NoiseOverlay: BUG — P0 fix needed" | Already mitigated: **DISABLED** in App.tsx via comment — not a blocking visual regression right now. Re-enabling is planned (T3.10) with proper guarded rollout. |
| 10 | "API duplication: known issue" | Still not resolved — `apps/gurudevi-mobile/src/lib/api/` still exists alongside `packages/core/src/api/` |
| 11 | Docs claimed DB migration status is known | `migration_status.md` shows uncertainty for 10+ migrations — **unknown if all tables exist in prod** |

---

## Known Bugs and Issues

### 🔴 Critical (Product-Breaking)
1. **PulseDashboard hardcoded action items** — The Self screen default view shows fake tasks ("Mark Morning Attendance", "Grade Science Assignment") that are `console.log` placeholders. Teachers see made-up data on their home screen. Trust-destroying on day 1.
2. **FAB actions are all console.log** — `getFabActions()` in `App.tsx` does nothing. Every FAB tap is a dead end.
3. **DB migration status uncertain** — 10+ migrations may not be applied. Tables that don't exist will cause silent data failures.
4. **OCR providers are stubs** — Any teacher who tries the OCR student import feature will get nothing. Feature is advertised but non-functional.
5. **Group chat: zero implementation** — Community section shows a chat affordance with no backend, no UI, no data. Dead feature.

### 🟠 High Priority
6. **QR join-group has no consumer** — QR codes generated for groups cannot be scanned and acted upon.
7. **Teacher QR join overwrites teacher_id** — Security/data bug: joining via QR does `classrooms.update({ teacher_id: user.id })` which overwrites the classroom owner. Should create a membership link.
8. **Principal InviteManager QR not rendered** — `qrCodeData` state stored but no modal renders it. Button appears to do nothing.
9. **SleepTracker / RemindersManager / VoiceJournaling not wired** — Built features invisible to users.
10. **useNavigationState error (PostHog)** — PostHogProvider placement may cause navigation errors. Status of fix uncertain.
11. **src/lib/api duplication** — Bug fixes must be applied in two places until consolidated.
12. **Community screens in 2 places** — GroupDetailsScreen, CreatePostModal in both app and `@repo/community`.

### 🟡 Medium Priority
13. **Accessibility: ~5/100 score** — 175 interactive elements with only ~4 having `accessibilityLabel`. Legal/ethical liability.
14. **i18n: 176 si + 200 ta keys missing; 272 hardcoded strings** — App is not production-ready in Sinhala/Tamil.
15. **Notifications content unclear** — `NotificationDrawer.tsx` exists but populated with what? May be hardcoded.
16. **Library content empty** — New schools see an empty library. No cold-start content.
17. **Self screen default view (PulseDashboard)** — Needs real data + UX polish.
18. **Skia NoiseOverlay disabled** — Visual richness lost. Needs proper fix before re-enabling.

### 🟢 Minor
19. **LotusPetalFAB not harmonized** — App version vs `@repo/ui` version; PanResponder features not merged.
20. **OCR no preprocessing** — Even if providers were real, no deskew/binarization pipeline exists.
21. **Font strategy** — Sinhala/Tamil 1.8x line height; verify on device.
22. **Bio-Resonance Layer** — Adaptive haptics, UnfoldingView deferred.
23. **ResonancePatternCard radar polygon** — currently rendered as dot markers + axis lines (pure RN). A true filled polygon would need react-native-svg or Skia. Acceptable for now; upgrade path is clear (see T3.16).

---

## Individual Difference Layer (Orientation Seeds) — Added Feb 28 2026

A silent, private system for personalising the app to each individual's learning tendencies. **No type labels ever shown to the user.**

### What it does

- Maintains a 4-dimensional fingerprint per user: `depth_breadth` · `reflect_act` · `solo_social` · `steady_surge` (all 0–100, stored as `orientation_seeds JSONB` on `users`)
- Personalises library shelf ordering silently (deep users see guides first; exploratory users see maps/films first)
- Shows a `ResonancePatternCard` in the Self section — a 4-axis shape, never a type name

### Data sources (priority order)

| Priority | Source | Condition to activate |
|----------|---------|----------------------|
| 1 | Explicit seeds (onboarding step 2) | User completed the orientation card questions |
| 2 | Behavioral inference | ≥7 mood logs across ≥3 unique days AND/OR ≥5 energy logs across ≥3 unique days |
| 3 | Role-based defaults | Always available — teacher=deep+reflective, student=social+active, etc. |
| 4 | Neutral fallback (all 50) | Role unknown (guest with no role set) |

### Signal quality guardrails (`useOrientationInference`)

| Failure mode | Guard |
|---|---|
| All-same tapping (always 5) | `signalConsistency()` scores near 0 for flat CV; signal ignored |
| Sparse data (2-3 clicks) | Hard minimums: mood ≥7 samples, energy ≥5 samples |
| Single-session burst | `uniqueDays() ≥ 3` required regardless of total count |
| Stale data (6 weeks ago) | Exponential decay, 14-day half-life; old entries fade to near-zero |
| Contradicting signals | mood ↑ + energy ↓ on same dim → both weights halved |
| Low-quality behavioral data | `overallBehavioralQuality` cap: poor data nudges but never dominates |

### Key files

```
packages/self/src/hooks/useOrientationInference.ts   — pure computation hook, no API calls
apps/gurudevi-mobile/src/components/self/
  OrientationCaptureStep.tsx                          — onboarding step 2 (skippable)
  ResonancePatternCard.tsx                            — 4-axis card shown in Self section
packages/profile/src/types/index.ts                  — OrientationSeeds interface
packages/core/src/types/User.ts                      — orientation_seeds field on User
packages/library/src/screens/LibraryScreen.tsx       — orderedShelfDefs (silent re-ordering)
apps/gurudevi-mobile/supabase/migrations/
  20260228_orientation_seeds.sql                      — ALTER TABLE users ADD COLUMN
```

### What it does NOT do
- Never shows a MBTI / Enneagram / astrology label
- Never stores behavioral fingerprints without intent (inference is ephemeral, computed on-device)
- Does not require onboarding — role defaults activate from day 1
- Does not affect any feature except library shelf ordering and the ResonancePatternCard

### What's next for this layer
- [ ] Pass `gradeNumber` to `ResonancePatternCard` for student grade-based defaults
- [ ] Update library shelf ordering when orientation_seeds change at runtime (currently computed once on mount)
- [ ] Explore wiring orientation to content difficulty suggestions in library
- [ ] Consider adding `useOrientationInference` to `AdminSelfView` and `PrincipalSelfView`

---

## Current Architecture State

### Navigation Flow (Verified from App.tsx + TabNavigator.tsx)
```
App.tsx
├── QueryClientProvider
│   └── EnvironmentProvider
│       └── GluestackUIProvider
│           └── PostHogProvider
│               └── NavigationContainer (+ navigationRef)
│                   └── SentryWrap
│                       ├── Auth check → supabase.auth.getSession()
│                       ├── No session → WelcomeScreen → OnboardingScreen → AuthScreen
│                       └── Session → MainTabs (TabNavigator)
│                           ├── Profile Tab → ProfileScreen
│                           ├── Classroom Tab → ClassroomStackNavigator
│                           ├── Self Tab (CENTER) → SelfScreen
│                           │   ├── showPulse=true → PulseDashboard (default, hardcoded)
│                           │   └── "Enter Full Sanctuary" → TeacherSelfView/etc.
│                           ├── Community Tab → CommunityScreen
│                           └── Library Tab → LibraryScreen
└── SyncManager (headless, watches isOnline + queue)
    {/* Skia NoiseOverlay — DISABLED */}
```

---

## Current Technical Decisions (Locked)

1. **Skia location**: `packages/ui/src/components-native/` — import as `@gurudevi/ui/native`
2. **UI imports**: Always via `@repo/ui` or `@/ui` — never direct `@gluestack-ui/themed`
3. **State**: Zustand for global; TanStack Query for server state; MMKV for persistence
4. **Shadows**: Shadow Violet `rgba(107,100,128,x)` exclusively — no `rgba(0,0,0,x)` anywhere
5. **Colors**: Vellum (#F5EDD6) as warm ground (never #FFFFFF); Ink (#2A2318) for text (never #000000)
6. **Glass/blur**: Either below 12 OR above 36 — never 16–28
7. **API SSOT**: `packages/core/src/api/*` — migrate app `src/lib/api/*` to these
8. **Design Master governance**: `docs/Core/design/GURUDEVI_DESIGN_MASTER.md` — implementation truth beats docs
9. **Branching**: main-innovate → main-dev → main-QA → main-preview → main
10. **Conflict resolution**: attendance/classroom = last-write-wins; self = client-wins; community = server-wins
11. **Do NOT use Moti** (broken with React 19) — use `react-native-reanimated` directly
12. **Expo 54 + React 19 + RN 0.81.5**: This exact combination survived 4 failed builds. Do not upgrade without full test cycle.
