# CURRENT STATE: What Gurudevi Is Right Now

> **Historical snapshot — superseded 2026-07-26.** This March 2026 inventory
> contains retired guest-session and older stack claims. For current identity,
> bond, authorization, and feature-lifecycle rules, use the [Feature Access
> Architecture](../architecture/2026-07-26-feature-access-local-server-architecture.md)
> and [Feature Lifecycle Management](../architecture/feature-lifecycle-management.md).

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
  "expo": "~54.0.32", expo updated need to update these against theall latest package details
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

### ⚠️ Self Screen (SelfScreen) — Built, Critical Gaps Resolved
**Verified in code** (`SelfScreen.tsx`):
- `showPulse` state defaults to `true` → PulseDashboard always shows first
- **PulseDashboard** ✅ — `usePendingActions` queries real DB: classrooms with no attendance today + overdue assignments with ungraded submissions. Tapping attendance item → navigates to `Attendance` screen; tapping grading item → navigates to `Gradebook` screen. Empty state: "Your day is clear 🪷". Skeleton loading.
- "Enter Full Sanctuary" button switches to role-specific view
- **TeacherSelfView**: MoodLotus ✅, FireJournal ✅, DailyRhythm ✅, JoyJar ✅, GratitudeGlimmers ✅, WisdomSeeds ✅, TomorrowPrep ✅, EnergyForecast ✅, WindDownRitual ✅
- **ResonancePatternCard** ✅ — shows 4-axis orientation fingerprint. Rendered after DailyContentCards.
- **✅ Wired in TeacherSelfView MORE_TOOLS**: `SleepTracker.tsx`, `RemindersManager.tsx`, `VoiceJournaling.tsx` — all in `MORE_TOOLS_FEATURES` array and handled in `renderFeature()` switch. Previous doc claim of "NOT wired" was stale.

### ✅ Classroom Section (Core Flows Verified)
**Teacher flow** (`TeacherDashboard.tsx` in `@repo/classroom`):
- ClassroomList ✅, CreateClassroomModal ✅, ScannerModal ✅, TeacherFeedbackModal ✅
- ClassroomDashboard tabs: students, attendance, gradebook, lessons, resources, inventory ✅
- GradebookTable, ReportCard, GradeEntryForm ✅

**Student flow** (`StudentDashboard.tsx`):
- Stat cards: enrolledClasses, pendingAssignments, unlockedRewards ✅
- ClassroomList ✅; assignment submission ✅; grades/attendance history ✅

**Principal flow** (`PrincipalSchoolView.tsx`) — Redesigned Feb 28 2026:
- `MorningSituationalBrief` ✅ — staff presence strip (colour-coded %), student attendance %, at-risk count, pending approvals
- `TeacherCarousel` ✅ — horizontal scroll; per-card status dot from `staff_attendance`, class count
- `StudentPulseSection` ✅ — attendance % + delta, weekly submission rate, at-risk badge, pending enrollment badge
- `LeaveApprovalSection` ✅ — pending leave requests with inline approve/reject
- `InstitutionalCalendarSection` ✅ — upcoming events list + inline add-event form
- `PrincipalObservationsSection` ✅ — classroom observation CRUD (walkthrough/note/concern/praise)
- `staffManagementAPI` ✅ — 8 functions in `packages/core/src/api/staffManagement.ts`
- Still pending: admin tasks (circular composer, report generator), academic trends chart, inventory CRUD

**Role routing** (verified in `ClassroomScreen.tsx`):
- founder → FounderSchoolView, principal → PrincipalSchoolView, section_head → SectionHeadView
- grade_head → GradeHeadView, teacher → TeacherDashboard, student → StudentDashboard, guest/default → ClassroomList
- `profile_completion` nudge exists but `profileCompleted` check is in `classroomData`

**🔲 OCR Scanner** (`OCRScanner.tsx`, `OCRStudentImport.tsx` in `@repo/classroom`):
- `GoogleVisionProvider`, `MLKitProvider`, `OpenAIVisionProvider` — **all are skeleton stubs only**
- `StudentParser`, `TableParser` — exist but depend on stub providers
- **NOT wired to any active UI path** — orphaned code

### ✅ Community Section (Core Built + Group Chat Screen Built)
**Verified in code** (`CommunityScreen.tsx`):
- Two subtabs: "Resonant Feed" (posts) and "Infinite Galaxy" (groups) ✅
- GroupsScreen: Sanctuary (school groups) vs Galaxy (cross-school) sub-tabs ✅
- `useCommunityGroups` hook ✅; GroupCard ✅; create/join/leave flows ✅
- GroupDetailsScreen in `packages/community` ✅; CreatePostModal ✅; ReportPostModal ✅
- Sacred Missions (Manifestos) from Principal ✅
- `GroupChatScreen.tsx` ✅ — Supabase Realtime subscription on `group_messages` table; own messages shown right-aligned; `onMarkAllRead` on open

**❌ DM Chat**: 1:1 direct messaging infrastructure still not built (no `direct_messages` table, no DM screen).

### ✅ Library Section
**Verified in code** (`packages/library/LibraryScreen.tsx`):
- `useLibrary` hook ✅, `AddResourceModal` ✅, `ResourceList` ✅
- `LIBRARY_UI_CATEGORIES` imported from constants ✅
- Search + category filter chips ✅
- `LotusPetalFAB` rendered **inline** in LibraryScreen (not via TabNavigator)
- **✅ PDF viewer** (`PDFViewerScreen.tsx`): `expo-file-system` download with real progress bar; `expo-sharing` opens native PDF app. User-initiated open.
- **✅ Video player** (`VideoPlayerScreen.tsx`): real `expo-av` `Video` component with live play/pause/seek, real progress bar, `onPlaybackStatusUpdate`
- **❌ Library content**: No curated default content — empty library for new schools (cold start problem)

### ✅ Profile Section
**Verified in code**:
- `IdentityCard.tsx` — role-aware (reads actual user role, not hardcoded "teacher") ✅
- `FullProfileScreen.tsx` with inline editing ✅; **"🌸 Give Thuthimal" button** shown when viewing another teacher/principal's profile ✅
- `GiveThuthimalModal.tsx` — optional message + "Send Gift of Gratitude" → `thuthimalAPI.createGift` → toast + haptic ✅
- `useProfileCompletion()` hook + `PROFILE_SECTIONS` SSOT in `packages/profile` ✅
- `SanctuaryProgressBar.tsx`, `AvatarDisplay.tsx`, `AchievementUnlockOverlay.tsx` ✅
- `LogoutModal.tsx` in `@repo/ui` (replaced `Alert.alert`) ✅
- `DeleteAccountModal.tsx` in `@repo/ui` ✅
- `ThuthimalBadge.tsx` (full + compact modes); `thuthimal_gifts` table added Feb 26 migration ✅

### ✅ QR & Invitation System (Fully Working)
**Verified in code** (`packages/scanner-kit/`):
- `QRResolver.ts` — canonical parser, supports legacy formats, `resolveQR()` function ✅
- `QRPayload.ts` — typed action payloads ✅
- `QRBuilder.ts`, `QRShareButton.tsx` ✅
- `useQRDeepLink` hook ✅; `QRHandlerScreen` for modal dispatch ✅
- Invite code generation (GURU-ABC123-TEACH format), QR generation (SVG, ECC-H) ✅
- `join-group:` QR consumer path ✅ (verified Feb 28 — QRResolver + FlowResolver.executeJoinGroup + QRHandlerScreen all wired)
- Principal InviteManager QR modal ✅ (verified Feb 28 — modal renders QRCodeGenerator correctly)
- Teacher QR join ✅ (fixed Feb 28 — FlowResolver.executeJoinClass is now role-aware; students→classroom_students; teachers only set teacher_id when null)

**Scanner engine:**
- Live camera: `expo-camera` → `CameraView.onBarcodeScanned` → Google ML Kit (Android) / Apple Vision (iOS)
- Gallery image: `@react-native-ml-kit/barcode-scanning` → same ML Kit quality for static images (upgraded Feb 28 from jsQR+jpeg-js)
- "Scanned by Google" toast = expected OS attribution for ML Kit API; cannot be removed; is not a privacy concern (on-device scan, no data leaves phone)

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
Migrations from Feb 11 — Feb 28 applied. Confirmed tables:
- Core: `schools`, `users` (with thuthimal fields), `classrooms`, `students`
- Academic: `lessons`, `assignments`, `submissions`, `attendance`, `grading`
- Community: `community_groups`, `community_posts`, `community_group_members`, `group_messages`
- Library: `library_items`
- Profile/Gamification: `user_rewards`, `gift_codes`, `manifestos`, `sections`, `grades`, `invite_codes`, `profile_completion`
- Wellbeing: `daily_content`, `mood_logs`, `fire_journal`
- Social: `student_groups`, `thuthimal_gifts` (added Feb 26)
- Notifications: `notifications` (added Feb 28)
- Principal/Staff (added Feb 28): `staff_attendance`, `staff_leaves`, `principal_observations`, `institutional_calendar`
- Orientation (added Feb 28): `orientation_seeds`
- Other (added Feb 28): `classroom_notes`, `academic_year`, `principal_notes`

**⚠️ DB migration status**: New migrations (Feb 28) need applying to production Supabase. Run `20260228_staff_management.sql`, `20260228_notifications.sql`, `20260228_notification_triggers.sql`, and others from `apps/gurudevi-mobile/supabase/migrations/`.

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
| PulseDashboard (Self default) | ✅ | Real DB queries via `usePendingActions`; tapping navigates to Attendance/Gradebook screens |
| Self: MoodLotus | ✅ | Real DB integration confirmed |
| Self: FireJournal | ✅ | |
| Self: DailyRhythm / JoyJar / GratitudeGlimmers | ✅ | |
| Self: WisdomSeeds / TomorrowPrep / EnergyForecast | ✅ | |
| Self: WindDownRitual | ✅ | |
| Self: SleepTracker | ✅ | Wired in TeacherSelfView MORE_TOOLS (was doc-stale "not wired") |
| Self: RemindersManager | ✅ | Wired in TeacherSelfView MORE_TOOLS |
| Self: VoiceJournaling | ✅ | Wired in TeacherSelfView MORE_TOOLS |
| Self: Daily Content Cards (40 days) | ✅ | |
| Classroom: Create/Manage Classrooms | ✅ | |
| Classroom: Attendance | ✅ | |
| Classroom: Lessons & Assignments | ✅ | |
| Classroom: Grading | ✅ | GradebookTable, ReportCard, GradeEntryForm |
| Classroom: Student Profiles | ✅ | |
| Classroom: Role Routing (all roles) | ✅ | Verified in ClassroomScreen.tsx |
| Classroom: OCR Scanner | 🔲 | Components exist; providers are STUBS; NOT wired to UI |
| Classroom: OCR Providers (Google/MLKit/OpenAI) | 🔲 | Skeleton stubs only |
| Principal: Morning Situational Brief | ✅ | MorningSituationalBrief — staff presence, student attendance %, at-risk count |
| Principal: Teacher Carousel | ✅ | TeacherCarousel — horizontal scroll with status dot + class count |
| Principal: Student Pulse | ✅ | StudentPulseSection — attendance %, submission rate, at-risk flags |
| Principal: Institutional Calendar | ✅ | InstitutionalCalendarSection — events list + add form |
| Principal: Observation Notes | ✅ | PrincipalObservationsSection — walkthrough/note/concern/praise CRUD |
| Principal: Leave Approvals | ✅ | LeaveApprovalSection — pending queue with approve/reject |
| Principal: Circular Composer | ❌ | Not built — Phase 3 of T1.7 |
| Principal: Report Generator | ❌ | Not built — Phase 3 of T1.7 |
| Principal: Academic Trends Chart | ❌ | Not built — Phase 4 of T1.7 |
| Community: Groups (create/join/leave) | ✅ | useCommunityGroups hook confirmed; CreateGroupModal with QR on success |
| Community: Posts + Feed | ✅ | |
| Community: Sacred Missions (Manifestos) | ✅ | |
| Community: GroupDetailsScreen | ✅ | Exists in packages/community |
| Community: Group Chat | ✅ | GroupChatScreen — Supabase Realtime on group_messages; own messages right-aligned |
| Community: DM (Direct Messaging) | ❌ | No direct_messages table, no DM screen |
| Community: Polls | ❌ | Not built |
| Community: Education tags for posts | ❌ | Not built |
| Library: Browse + Search + Category Filter | ✅ | Verified in packages/library |
| Library: AddResourceModal | ✅ | |
| Library: FAB (LotusPetalFAB inline) | ✅ | Rendered in LibraryScreen directly |
| Library: PDF viewer (in-app) | ✅ | expo-file-system download + expo-sharing native viewer |
| Library: Video player | ✅ | expo-av with real play/pause/seek/progress |
| Library: Default curated content | ❌ | Empty for new schools — cold start problem |
| Profile: IdentityCard (role-aware) | ✅ | |
| Profile: FullProfileScreen (inline edit) | ✅ | |
| Profile: Give Thuthimal (from other profile) | ✅ | GiveThuthimalModal + "🌸 Give Thuthimal" button on other profiles |
| Profile: useProfileCompletion (SSOT) | ✅ | packages/profile SSOT confirmed |
| Profile: SanctuaryProgressBar | ✅ | |
| Profile: AchievementUnlockOverlay | ✅ | |
| Profile: ThuthimalBadge | ✅ | DB table + claim screen + give modal all complete |
| Profile: LogoutModal / DeleteAccountModal | ✅ | In @repo/ui, replaces Alert.alert |
| QR: Generation + Scanning | ✅ | |
| QR: Unified Resolver (QRResolver.ts) | ✅ | resolveQR() canonical parser exists |
| QR: join-group consumer path | ✅ | Fixed — QRResolver + FlowResolver + QRHandlerScreen all wired |
| QR: Principal InviteManager modal render | ✅ | Fixed — modal renders QRCodeGenerator correctly |
| QR: Teacher join (ownership vs membership) | ✅ | Fixed — FlowResolver guards against overwriting existing teacher_id |
| FAB actions (App.tsx getFabActions) | ⚠️ | ALL console.log placeholders — still not wired (T3.11) |
| Notifications (NotificationDrawer) | ✅ | Real data from `notifications` table via `useNotifications` hook |
| Notification triggers (DB) | ✅ | 3 triggers: new submission, grade posted, new group post |
| Push Notifications | ❌ | Not built |
| Offline sync (outbox pattern) | ✅ | MUTATION_REGISTRY confirmed |
| i18n (en/si/ta) | ⚠️ | si: 76.9%, ta: 74.3%; 272 hardcoded strings |
| Accessibility (WCAG AA) | ⚠️ | Score ~5/100 — critical gap |
| Skia NoiseOverlay | ⚠️ | DISABLED in App.tsx via comment (Android black screen) |
| DB migrations applied | ⚠️ | Feb 28 migrations need applying to prod Supabase |
| useNavigationState error (PostHog) | ⚠️ | Status of fix uncertain |
| EAS Production Build | ❌ | Build workflow exists, not yet run |
| App Store submission | ❌ | Not done |

---

## Code vs Docs Discrepancies

> Items marked ✅ RESOLVED have been fixed. Items below are still outstanding.

| # | Doc Claim | Code Reality | Status |
|---|-----------|--------------|--------|
| 1 | "PulseDashboard" is the Self default view with real tasks | Was hardcoded console.log — now fixed: `usePendingActions` queries real DB, items navigate | ✅ RESOLVED Feb 28 |
| 2 | "LotusPetalFAB is context-aware floating action button" | FAB actions in `getFabActions()` are still `console.log` — none wired | ⚠️ Still open (T3.11) |
| 3 | "OCR Scanner: component built" implies working feature | `GoogleVisionProvider`, `MLKitProvider`, `OpenAIVisionProvider` are **skeleton stubs** | ⚠️ Still open (T2.4) |
| 4 | Self section: "All features have complete UI + API + DB integration" | SleepTracker / RemindersManager / VoiceJournaling — actually were wired (doc was stale) | ✅ RESOLVED — was stale |
| 5 | "Group Chat: zero implementation" | GroupChatScreen built with Supabase Realtime on group_messages table | ✅ RESOLVED Feb 28 |
| 6 | "QR payload routing: CRITICAL GAP" | QRResolver.ts canonical, join-group consumer path wired, InviteManager modal renders | ✅ RESOLVED Feb 28 |
| 7 | Feature matrix marks "Notifications" as "❌ Pending" | NotificationDrawer reads real DB via useNotifications + 3 DB triggers | ✅ RESOLVED Feb 28 |
| 8 | Docs say Onboarding is "5-screen philosophy flow" | Code confirms **9 screens**: Name + Role + Orientation (optional) + 5 philosophy screens | ✅ Doc updated |
| 9 | "NoiseOverlay: BUG — P0 fix needed" | DISABLED in App.tsx — not blocking; re-enable is T3.10 | ⚠️ Still open (T3.10) |
| 10 | "API duplication: known issue" | `apps/gurudevi-mobile/src/lib/api/` still exists alongside `packages/core/src/api/` | ⚠️ Still open |
| 11 | "Library PDF/Video viewers link externally" | PDFViewerScreen: expo-file-system + expo-sharing; VideoPlayerScreen: expo-av | ✅ RESOLVED Feb 28 |
| 12 | "Thuthimal: no give flow" | GiveThuthimalModal + "🌸 Give Thuthimal" button in FullProfileScreen | ✅ RESOLVED Feb 28 |

---

## Known Bugs and Issues

### 🔴 Critical (Product-Breaking)
1. **DB migrations (Feb 28) need applying to prod** — `staff_attendance`, `staff_leaves`, `principal_observations`, `institutional_calendar`, `notifications`, `notification_triggers`, and other Feb 28 migrations must be run on prod Supabase before those features work.
2. **OCR providers are stubs** — Any teacher who tries the OCR student import feature will get nothing. Feature is advertised but non-functional.

### 🟠 High Priority
3. **useNavigationState error (PostHog)** — PostHogProvider placement may cause navigation errors. Status of fix uncertain.
4. **src/lib/api duplication** — Bug fixes must be applied in two places until consolidated.
5. **Community screens in 2 places** — GroupDetailsScreen, CreatePostModal in both app and `@repo/community`.

### 🟡 Medium Priority
6. **Accessibility: ~5/100 score** — 175 interactive elements with only ~4 having `accessibilityLabel`. Legal/ethical liability.
7. **i18n: 176 si + 200 ta keys missing; 272 hardcoded strings** — App is not production-ready in Sinhala/Tamil.
8. **Library content empty** — New schools see an empty library. No cold-start content.
9. **Skia NoiseOverlay disabled** — Visual richness lost. Needs proper fix before re-enabling.
10. **FAB actions not wired** — `getFabActions()` in App.tsx still has `console.log` placeholders (T3.11).

### 🟢 Fixed This Sprint (Feb 28 2026 — Session 1: earlier session)
- ✅ PulseDashboard hardcoded actions → real DB queries via `usePendingActions` hook
- ✅ FAB actions were all console.log → now call `navigationRef.navigate()`
- ✅ Teacher QR join overwrites teacher_id → FlowResolver.executeJoinClass is now role-aware
- ✅ SleepTracker / RemindersManager / VoiceJournaling wired into TeacherSelfView MORE_TOOLS (was already wired, doc was stale)
- ✅ NotificationDrawer showed 3 hardcoded "Update Available" items → real DB via `useNotifications` hook + migration
- ✅ Alert.alert in ClassroomNotes, PrincipalNotes, TeacherDashboard → useLotusToast
- ✅ CreatePostModal has no tag selection → 8 education tag chips stored in metadata.education_tags
- ✅ ResonancePatternCard missing from PrincipalSelfView + AdminSelfView → added with behavioral hooks
- ✅ Principal InviteManager QR not rendered → was already done (verified by code reading)
- ✅ join-group QR consumer path missing → was already done (verified by code reading)
- ✅ Community group creation — `CreateGroupModal`, `createGroupWithAdmin` API, `group_messages` migration, `GroupChatScreen` with Realtime

### 🟢 Fixed This Sprint (Feb 28 2026 — Session 2: 10-task sprint)
- ✅ PulseDashboard action items now navigate: attendance → Attendance screen; grading → Gradebook screen (was `onPress={() => {}}`)
- ✅ QR teacher join ownership overwrite — confirmed already fixed (FlowResolver guards teacher_id IS NULL)
- ✅ SleepTracker / RemindersManager / VoiceJournaling — confirmed already wired (CURRENT_STATE was stale)
- ✅ Principal Dashboard Phase 1 — `MorningSituationalBrief` + `TeacherCarousel` + `staffManagementAPI` + DB migration
- ✅ Principal Dashboard Phase 2 — `StudentPulseSection` + `InstitutionalCalendarSection` + `PrincipalObservationsSection` + `LeaveApprovalSection`
- ✅ Real notification triggers — 3 `SECURITY DEFINER` PostgreSQL triggers auto-insert into `notifications` table
- ✅ Library PDF viewer — `expo-file-system` download with real progress + `expo-sharing` native viewer (was fake skeleton)
- ✅ Library Video player — `expo-av` with live play/pause/seek/progress (was fake controls)
- ✅ Thuthimal give flow — `GiveThuthimalModal` + "🌸 Give Thuthimal" button in `FullProfileScreen` for other profiles

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
