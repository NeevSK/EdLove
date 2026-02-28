# ACTIVE TASKS: What Needs Done Right Now

> Priority-ordered task list applying **first-principles PM + architect thinking**.
> The fundamental question answered here: **What actually matters to build right now?**
>
> The previous ACTIVE_TASKS.md was UI-polish-focused. This rewrite reorders by product impact.
> If no real user can complete the "join a school + do daily work" loop, all UI polish is wasted effort.
>
> **Key insight**: The March tasks doc focused heavily on header/navbar/modal redesigns (TIER 3).
> This is important work — but not before making sure the app actually works for real users.

---

## 📚 Source Documents (Read These First)

This task list synthesizes from three sources, listed by authority:

1. **`docs/Tasks/mobile_feature_audit.md`** — Complete feature scope: 404 features across all roles. The product bible for what Gurudevi does. Read this to understand the full scope.
2. **`docs/Tasks/mobile_feature_strategy.md`** — Technical audit: each feature mapped to UI/API/DB with 🟢/🟡/🔴 status (256 complete, 27 partial, 117 missing). Strategy doc's "Immediate Focus" = Library voids, Principal Analytics, Engineering Excellence, Mission UI, DM Infrastructure.
3. **`docs/current_progress/*/tasks.md`** — Sprint-level UI/UX task lists (Feb + March). Mostly TIER 3 work.

**Where strategy doc says 🟢 Complete but code evidence is uncertain:**
- `QR-003` (Group Join QR) — strategy says complete; code analysis found consumer path missing → see T1.5
- `PRN-CLS-025` (InviteManager QR modal) — strategy says complete; code shows QR state stored but modal not rendered → see T0.5
- Many Teacher/Student Self features (TCH-SLF-005–020) — plausible from component code but not E2E verified → verify in T0.2

---

## 🔴 TIER 0: Product Viability Gates
### *Do FIRST — Nothing else matters until these work*

These are the tasks that, if broken, mean zero real users can use the app. They are not glamorous. They are not visible in screenshots. But they are the foundation.

---

### T0.1 — Verify & Fix Database Migration Status
**What**: Confirm all migrations from Feb 11–26 are applied in production Supabase. Specifically: `thuthimal` table (Feb 26), `sections`/`grades` tables, `profile_completion` table, `daily_content` table, `mood_logs`, `fire_journal`.
**Why**: `migration_status.md` shows uncertainty for 10+ migrations. If these tables don't exist in prod, every feature that touches them will silently fail. Attendance will fail. Self features will fail. Profile completion will fail. This is the #1 silent killer.
**Effort**: S (1 day)
**Code to touch**: Supabase dashboard + `apps/gurudevi-mobile/docs/current_progress/*/migration_status.md`
**Action**: Run each migration SQL against prod; confirm table existence; update migration_status.md with verified checkmarks.

---

### T0.2 — End-to-End "New School" Journey Validation
**What**: Manually walk through the complete new-user journey as each role:
1. Teacher creates account → onboarding → creates school → creates classroom → invites student via QR
2. Student joins via QR code → sees classroom → submits an assignment
3. Principal creates account → joins school → views classrooms

**Why**: This is the core loop. If any step breaks, the app has no users. This has NEVER been formally validated end-to-end from code evidence. The QR join bug (T0.4) alone could break step 1.
**Effort**: M (2 days including fixes)
**Code to touch**: `WelcomeScreen`, `AuthScreen`, `OnboardingScreen`, `ClassroomScreen`, `ScannerModal`, QR flow
**Action**: Document every broken step. Fix blocking bugs. Re-validate.

---

### T0.3 — Fix PulseDashboard: Replace Hardcoded Actions with Real Data
**What**: The Self screen default view (`PulseDashboard`) shows hardcoded `console.log` fake tasks: "Mark Morning Attendance" and "Grade Science Assignment". These must query real pending data from the DB.
**Why**: This is the FIRST THING a teacher sees every morning. If it shows fake data, the teacher immediately knows the app is not ready for real use. Trust is destroyed on first use.
**Effort**: M (2–3 days)
**Code to touch**: `apps/gurudevi-mobile/src/components/PulseDashboard/` + `packages/core/src/api/attendance.ts` + `packages/core/src/api/assignments.ts`
**Action**: Query today's classrooms with no attendance taken → show as "Mark Attendance for [Class Name]". Query assignments with today's due date → show as "Grade [Assignment] for [Class]". Replace hardcoded strings.

---

> *Original T0.4 (Wire FAB Actions) moved to T3.11 — FAB is deprioritized. Core loop reliability matters more.*

---

### T0.4 — Fix Teacher QR Join Bug (ownership overwrite)
**What**: When a teacher joins a classroom via QR, the code does `api.classrooms.update(classId, { teacher_id: user.id })`. This overwrites the original teacher's ownership.
**Why**: This is a data corruption bug. Any teacher joining a classroom via QR immediately steals ownership from the original teacher. If this fires in a real school, it's catastrophic.
**Effort**: S (half day)
**Code to touch**: `packages/classroom/` — QR join handler; `packages/core/src/api/classroom.ts`
**Action**: Change to create a `classroom_teachers` membership record instead of updating `teacher_id`. Check directly in Supabase Dashboard (SQL Editor: `SELECT to_regclass('public.classroom_teachers');`) — if null, create a migration to add the join table. This fix can be done independently of T0.1; the schema check takes < 2 minutes.

---

### T0.5 — Fix Principal InviteManager QR Modal Not Rendering
**What**: Principal generates a QR code → state is stored in `qrCodeData` but no modal renders it. The button silently does nothing.
**Why**: Principals cannot invite teachers without this. School creation is broken for the primary administrative role.
**Effort**: S (half day)
**Code to touch**: `packages/classroom/InviteManager.tsx` (or wherever `qrCodeData` state lives)
**Action**: Find the stored `qrCodeData` state and add the QR display modal that was never rendered.

---

### T0.6 — School + Classroom Creation: Unified Onboarding Flow
**What**: Currently `SchoolCreationScreen` success state shows a QR code + one CTA: "Enter Your Sanctuary" → `ClassroomList`. There is no prompt to create the first classroom. The teacher must discover classroom creation independently after landing in ClassroomList.

Fix: Add **"Set Up Your First Classroom →"** as the primary CTA on the school creation success screen, with "Skip for now" as secondary. This navigates directly to `CreateClassroomModal` (which already exists in `@repo/classroom`).

**Why**: School without a classroom is an empty shell. A new principal/teacher completing school setup needs to create their first classroom immediately — it completes the setup loop. This is the difference between "I set up the app" and "I'm ready to use the app." Every SaaS onboarding principle says: get users to their first value moment as fast as possible. First value moment = first classroom created.
**Effort**: S (half day — SchoolCreationScreen change + routing)
**Code to touch**: `apps/gurudevi-mobile/src/screens/SchoolCreationScreen.tsx` (success state), `packages/classroom/src/components/CreateClassroomModal.tsx`
**Action**: 
1. In SchoolCreationScreen success state, replace the single "Enter Your Sanctuary" button with two CTAs: primary = "Set Up First Classroom →" (navigates to Classroom tab with CreateClassroomModal pre-opened), secondary = "Explore Sanctuary" (navigate to ClassroomList as before)
2. Pass `schoolId` from `successData` to `CreateClassroomModal` as a prop so classroom is auto-linked to the newly created school

---

## 🔴 TIER 1: Core Value Delivery
### *The "Why" of the App — What Teachers Do Every Day*

These are the features teachers will use daily. If they don't work reliably and feel good, teachers will stop using the app after week 1.

---

### T1.1 — Wire SleepTracker, RemindersManager, VoiceJournaling into TeacherSelfView
**What**: These three components exist in `packages/self/` but are NOT rendered anywhere in `TeacherSelfView`. They are built but invisible.
**Why**: These are key wellbeing features — teacher reminders and sleep tracking are explicit user requests. Built but unwired = wasted effort AND user disappointment if they were promised.
**Effort**: S (1 day)
**Code to touch**: `packages/self/TeacherSelfView.tsx` — add these components in the appropriate section
**Action**: Import and render `SleepTracker`, `RemindersManager`, `VoiceJournaling` in TeacherSelfView with appropriate section headers.

---

### T1.2 — Audit and Fix NotificationDrawer Data
**What**: `NotificationDrawer.tsx` exists but it's unclear if it shows real data or hardcoded content.
**Why**: Notifications are how teachers know about new submissions, overdue attendance, community messages. If it shows fake data, it's worse than no notifications.
**Effort**: S (1 day)
**Code to touch**: `apps/gurudevi-mobile/src/components/NotificationDrawer.tsx`
**Action**: Inspect the component. If data is hardcoded, wire to Supabase `notifications` table. If table doesn't exist, create it with migration.

---

### T1.3 — Attendance Flow: End-to-End Reliability Check
**What**: Attendance is the daily job. Mark attendance → data persists → teacher can see history → principal can see summary. Verify this entire flow works in the current codebase.
**Why**: This is the core daily teacher workflow. If attendance breaks on day 3 of real use, teachers abandon the app. Not optional.
**Effort**: S–M (1–2 days)
**Code to touch**: `packages/core/src/api/attendance.ts`, `packages/classroom/` attendance components
**Action**: Walk through the full flow. Fix any broken steps. Verify data appears in both TeacherDashboard and (for principals) PrincipalSchoolView.

---

### T1.4 — Assignment/Submission/Grading: End-to-End Reliability Check
**What**: Teacher creates assignment → student sees it → student submits → teacher sees submission → teacher grades. Verify the full loop.
**Why**: This is the second daily teacher workflow. The grading system (`GradebookTable`, `ReportCard`, `GradeEntryForm`) all exist in code but have never been validated end-to-end from what we can verify.
**Effort**: M (2 days)
**Code to touch**: `packages/core/src/api/assignments.ts`, `packages/core/src/api/submissions.ts`, `packages/core/src/api/grading.ts`, classroom components
**Action**: Walk through as teacher + student pair. Document and fix any breaking steps.

---

### T1.5 — Fix join-group QR Consumer Path
**What**: QR codes for groups are generated but there is no code that handles scanning one. The consumer path doesn't exist.
**Why**: Community groups are central to teacher connection. If the join flow for groups is broken, groups are invitation-only by manual search — killing discovery and adoption.
**Effort**: M (2 days)
**Code to touch**: `packages/scanner-kit/QRResolver.ts` — add `join-group` case; `packages/community/` — add group join handler; `QRHandlerScreen`
**Action**: Add `join-group` resolution to `QRResolver.ts`. Create the group join action in community package. Wire `QRHandlerScreen` to dispatch it.

---

### T1.6 — Self Screen PulseDashboard UX Polish (after T0.3 makes it real)
**What**: After T0.3 makes PulseDashboard show real data, do UX polish: layout, spacing, Sanctuary aesthetic, loading states, empty states.
**Why**: This is what teachers see every morning. It should feel like a sacred, calm, energizing home base — not a task list.
**Effort**: M (2 days) — depends on T0.3 being done first
**Code to touch**: `apps/gurudevi-mobile/src/components/PulseDashboard/`
**Action**: Design clean morning-dashboard layout. DailyResonanceCard prominent. Pending tasks below. "Enter Full Sanctuary" button prominent. Loading skeleton. Empty state: "Your day is clear 🪷"

---

## 🟠 TIER 2: Stickiness & Network Effects
### *What Makes Teachers Come Back After Week 1*

These features don't block launch, but without them the app is a utility, not a community. They drive retention.

---

### T2.1 — Group Chat: Backend + Basic UI
**What**: Implement WhatsApp-style group messaging. Currently ZERO code exists.
**Why**: Teachers talking to each other in groups is the #1 retention mechanic for community apps. Without it, Community is just a notice board. With it, teachers have a reason to open the app 5× per day.
**Effort**: XL (1–2 weeks)
**Code to touch**:
- DB: New Supabase migration for `group_messages` table (`id, group_id, user_id, content, created_at, type`)
- Backend: Supabase Realtime subscription on `group_messages`
- UI: New `GroupChatScreen.tsx` in `packages/community/`
- Navigation: Wire "Chat" button in GroupDetailsScreen to GroupChatScreen
**Note**: Get user approval on UX direction (WhatsApp-style vs threaded vs hybrid) before implementing.

---

### T2.2 — Library: Seed Default Content (Cold Start Fix)
**What**: New schools open the Library and see nothing. Curate and seed a default set of educational resources that appear for all schools.
**Why**: An empty library = dead feature. Teachers need to see value immediately. Even 20 curated resources (inspirational videos, Sri Lankan curriculum lesson plans, government circulars) make the library feel alive.
**Effort**: M (2 days — agent seeds schema; human curates content)
**Code to touch**: `packages/core/src/api/resources.ts` — add `is_default` flag; seed script for `library_items`
**Owner split**: Agent implements `is_default` flag and seed mechanism. Human (Naveen) curates actual content.

---

### T2.3 — Real Notifications (End-to-End)
**What**: Remove hardcoded notifications. Wire `NotificationDrawer.tsx` to real Supabase `notifications` table via Realtime. Show: assignment created, grade posted, invitation received, community post.
**Why**: Notifications are the primary re-engagement mechanism. Without real notifications, teachers must manually check every section. With real notifications, the app pulls them back.
**Effort**: L (3–4 days)
**Code to touch**: `apps/gurudevi-mobile/src/components/NotificationDrawer.tsx`, `packages/core/src/api/` (new notifications module), Supabase `notifications` table (migration if needed)

---

### T2.4 — OCR Providers: Implement at Least One Real Provider
**What**: `GoogleVisionProvider`, `MLKitProvider`, `OpenAIVisionProvider` are all skeleton stubs. Implement `MLKitProvider` as the primary (free, on-device, works offline) using `@react-native-ml-kit/text-recognition`.
**Why**: OCR bulk student import is a flagship feature for Sri Lankan schools that have printed registers. Currently it is a completely non-functional stub. Implementing even one real provider delivers actual value.
**Effort**: L (3–4 days)
**Code to touch**: `packages/classroom/src/providers/MLKitProvider.ts` — replace stub with real implementation; wire `OCRScanner.tsx` to active UI path in TeacherDashboard
**Dependency**: Requires testing with real Sinhala/Tamil printed text.

---

### T2.5 — Community: Education Tags Required for Posts
**What**: Add tag selection UI in `CreatePostModal`. Require at least 1 education-related tag before a post can be submitted. Show tags on posts in feed.
**Why**: Without content constraints, the community feed becomes off-topic noise. Educational tagging keeps the community relevant and makes moderation tractable.
**Effort**: M (2 days)
**Code to touch**: `CreatePostModal.tsx` (whichever location is SSOT after deduplication), `packages/core/src/api/groups.ts`

---

### T2.6 — Thuthimal Flow: Wire Full Claim + Gift Experience
**What**: `ThuthimalClaimScreen` and `ThuthimalBadge` are partially built. The `thuthimal` table was added Feb 26. Complete the flow: alumni discovers teacher → initiates gift → teacher claims → badge appears on profile.
**Why**: Thuthimal is Gurudevi's core differentiator and brand story. It's the gratitude economy that makes the platform unique. Even a v1 of this working = powerful word-of-mouth.
**Effort**: L (3–4 days)
**Code to touch**: `ThuthimalClaimScreen`, `ThuthimalBadge`, `packages/core/src/api/thuthimal.ts`, Profile screen

---

### T2.7 — Direct Messaging (DM) Infrastructure
**Source**: `docs/Tasks/mobile_feature_strategy.md` — Immediate Focus #5. `ALL-COM-061` (`direct_messages` table), `ALL-COM-063` (Block Pillar), `ALL-COM-064` (Mute), `ALL-COM-065` (Social Shield reporting), `ALL-COM-066` (Privacy Cloak) — all `🔴 Pending`.
**What**: Build the 1:1 messaging layer. Currently ZERO code: no `direct_messages` table, no DM screen, no block/mute infrastructure.
**Why**: Direct messaging enables teacher-to-teacher, teacher-to-parent collaboration without going through group feeds. The Social Shield (block/mute/report) is a safety requirement — a school app without user blocking is a liability. This is distinct from group chat (T2.1) — DMs are for private professional collaboration.
**Effort**: XL (1–2 weeks — schema, Realtime, UI, safety infrastructure)
**Code to touch**:
- DB: Migration for `direct_messages`, `blocked_users`, `muted_threads` tables
- Backend: Supabase Realtime subscription on `direct_messages`
- UI: `DMListScreen.tsx`, `DMChatScreen.tsx` in `packages/community/`
- Safety: `useDMGuard` hook for role-based DM initiation controls
**Note**: Get user approval on role-based DM permissions (can students DM teachers? parents?) before implementing.

---

### T2.8 — Library: Native PDF Viewer + Video Player
**Source**: `docs/Tasks/mobile_feature_strategy.md` — Immediate Focus #1. `LIB-011` (PDF) and `LIB-012` (Video) are both `🔴 Pending`. Currently both `PDFViewerScreen.tsx` and `VideoPlayerScreen.tsx` exist as stub screens that link externally.
**What**: Replace external link fallback with in-app native viewers.
- PDF: `react-native-pdf` or `expo-file-viewer` for in-app PDF rendering
- Video: `expo-av` (already a dependency) for video streaming/playback with Sanctuary UI chrome
**Why**: Teachers upload PDFs and videos as lesson materials. If tapping a lesson material opens a browser instead of staying in-app, the experience is broken. Students lose context. Teachers lose confidence in the app. This directly blocks the classroom content workflow.
**Effort**: L (3–4 days — one viewer per type + Sanctuary-themed player UI)
**Code to touch**: `packages/library/src/screens/PDFViewerScreen.tsx`, `packages/library/src/screens/VideoPlayerScreen.tsx`, `packages/classroom/src/screens/LessonFeed.tsx`

---

### T2.9 — Principal Analytics: Staff Attendance + Wellbeing Pulse
**Source**: `docs/Tasks/mobile_feature_strategy.md` — Immediate Focus #2. `PRN-CLS-041` (Staff Attendance), `PRN-SLF-004` (Staff Wellbeing Pulse), `PRN-CLS-043` (Staff Attendance Pulse) — all `🔴 Pending`. `PRN-CLS-042/044` (Leave Management + Approval) also `🔴 Pending`.
**What**: Build the principal oversight layer for staff:
1. Daily staff check-in/check-out logging (`staff_attendance` table)
2. Leave submission flow for staff (`staff_leaves` table) + leave approval portal for principal
3. Anonymized staff wellbeing aggregation (aggregate mood_logs for staff roles, show as trend to principal without individual attribution)
**Why**: This is what makes Gurudevi valuable to school *principals* vs just to *teachers*. A principal using the app needs to see: who's in school today, who's on leave, how the staff is doing overall. Without this, principals have no reason to use the app daily. Principal adoption drives whole-school adoption.
**Effort**: L (3–5 days — schema migration + API + UI)
**Code to touch**: 
- DB: Migrations for `staff_attendance`, `staff_leaves` tables
- API: New modules in `packages/core/src/api/`
- UI: `StaffAttendanceList.tsx`, `LeaveRequestScreen.tsx`, `LeaveApprovalScreen.tsx` in `packages/classroom/`

---

## 🟡 TIER 3: Polish & UX Refinement
### *Important But Not First — These tasks were the entire focus of March tasks.md*

> **Honest statement to team**: The March `tasks.md` was almost entirely TIER 3 work (global header, bottom navbar, modal redesigns). This is real work that matters for quality and the teacher experience. But it is not the first thing to do. Build the foundation first. Then polish it.

---

### T3.1 — Premium Global Header Redesign
**Source**: March/1st_week/tasks.md — "Global header"
**What**: Modern and premium header, aligned with Sanctuary theme. Profile avatar with correct spacing. No hardcoded hex colors.
**Effort**: M | **Code**: `packages/ui/src/components/GlobalHeader.tsx`
**Sub-tasks**:
- [ ] Token audit: all hardcoded colors/sizes/padding → Theme tokens
- [ ] Add `UserAvatar` with correct sizing
- [ ] Subtext below heading — evaluate and finalize

---

### T3.2 — Premium Bottom Navbar Redesign
**Source**: March/1st_week/tasks.md — "bottom navbar"
**What**: Modern and premium navbar. Skeuomorphic/glassmorphism if appropriate. Theme alignment.
**Effort**: M | **Code**: `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx`
**Sub-tasks**:
- [ ] Token audit: no hardcoded colors/shadows
- [ ] Active tab indicator styling
- [ ] FAB placement vs navbar (FAB not hidden under navbar)

---

### T3.3 — Profile Screen Modal Polish
**Source**: March/1st_week/tasks.md — "profile section"
**What**: Logout and Delete Account modals: modern/premium, theme-aligned.
**Effort**: S | **Code**: `packages/ui/src/components/LogoutModal.tsx`, `DeleteAccountModal.tsx`

---

### T3.4 — Community Screen Minimal Redesign
**Source**: March/1st_week/tasks.md — "community screen"
**What**: Minimal redesign of Community default view. Theme alignment. Group creation + join flows with polished UX.
**Effort**: M | **Code**: `CommunityScreen.tsx`, `GroupsScreen.tsx`, community modals

---

### T3.5 — Library Screen Redesign + FAB Z-Index Fix
**Source**: March/1st_week/tasks.md — "library screen"
**What**: Library default view redesign. FAB not hidden under navbar.
**Effort**: M | **Code**: `packages/library/LibraryScreen.tsx`

---

### T3.6 — Classroom Role-Specific Demo Views
**Source**: March/1st_week/tasks.md + Feb/4th_week/tasks.md item 9
**What**: Remove stale demo content from `TeacherDashboardView`. New demo for student and principal views.
**Effort**: M | **Code**: `ClassroomScreen.tsx`, role-specific view components
**Owner**: Agent implements; Human defines content/product rules (what does a "good" demo look like?)

---

### T3.7 — Self Section: Role-Based Feature Mapping Audit
**Source**: Feb/4th_week/tasks.md item 1
**What**: Audit which Self widgets show for Teacher vs Student vs Principal vs Founder. Ensure correct role-based rendering.
**Effort**: M | **Code**: `SelfScreen.tsx`, role view components in `packages/self/`

---

### T3.8 — Error Handling Normalization
**Source**: Feb/4th_week/tasks.md items 10.1, 10.2
**What**: Audit all screens for unhandled errors. Replace all raw `Alert.alert` with `SanctuaryToast` or `ErrorMessage` components. Add empty states everywhere.
**Effort**: M | **Code**: All screens

---

### T3.9 — Skeleton Loaders
**What**: `SkeletonCard`, `SkeletonAvatar`, `SkeletonTextLine` shimmer components for all data-fetching screens.
**Effort**: S | **Code**: `packages/ui/src/components/`

---

### T3.10 — Re-enable Skia NoiseOverlay (Properly)
**Source**: Feb tasks Skia runbook
**What**: Implement proper guarded rollout: opacity 0.0 test → minimal grain → feature flag off by default → staged rollout.
**Effort**: M | **Code**: `packages/ui/src/components-native/NoiseOverlay`

---

### T3.11 — Wire FAB Actions (Deprioritized from T0)
**Source**: Original T0.4 (Wire FAB Actions) — moved here per product feedback. FAB is real but not a viability blocker.
**What**: `getFabActions()` in `App.tsx` has all actions as `console.log` placeholders. Wire each to the correct navigation target.
**Effort**: S | **Code**: `apps/gurudevi-mobile/App.tsx` — `getFabActions()`
**Action**: Wire: Self tab → mark attendance, Community tab → create post, Library tab → add resource, Classroom tab → create lesson/assignment.

---

### T3.12 — Mission/Manifesto UI for Students and Teachers  
**Source**: `docs/Tasks/mobile_feature_strategy.md` — Immediate Focus #4. `sacredMissions.ts` and `sanctuary_manifestos` table exist but there is no student or teacher UI to view/reflect on the school manifesto.
**What**: Surface the school manifesto in the Self and Community tabs for all roles. Students and teachers should be able to view, reflect on, and engage with the school's mission.
**Effort**: S–M | **Code**: `packages/community/src/components/ManifestoCard.tsx`, Self views
**Action**: Add `ManifestoCard` to StudentSelfView and TeacherSelfView. Add "Reflect" action with a journal-entry-style response.

---

### T3.13 — Staff Leave Management Flow (Principal)
**Source**: `docs/Tasks/mobile_feature_strategy.md` `PRN-CLS-042/044` — `🔴 Pending`
**What**: Staff submit leave requests (Sick/Casual/Duty leave). Principal views and approves/rejects.
**Effort**: M | **Code**: New `LeaveRequestScreen`, `LeaveApprovalScreen` in `packages/classroom/`, DB migration for `staff_leaves`
**Note**: Pair with T2.9 (staff attendance infrastructure) — natural sibling feature.

---

## 🔵 TIER 4: Scale & Infrastructure
### *Important for production. Not blocking alpha.*

---

### T4.1 — Accessibility: Critical Path Fix
**Source**: Feb/4th_week/codex/a11y-localization-completeness-audit.md
**Current score**: ~5/100 (CRITICAL gap — legal/ethical liability)
**Effort**: L (ongoing) | **Code**: All screens
**Priority order**: WelcomeScreen → OnboardingScreen → AuthScreen → SelfScreen → LibraryScreen → ClassroomScreen
**Actions**: `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` on all ~171 missing interactive elements; `accessibilityState` on all toggles; 72px minimum touch targets everywhere.

---

### T4.2 — Localization: Close Key Gaps
**Source**: Feb/4th_week/codex/a11y-localization-completeness-audit.md
**Effort**: M | **Code**: `i18n/locales/si.json`, `i18n/locales/ta.json`
**Actions**: Add 176 missing Sinhala keys; add 200 missing Tamil keys; externalize top 272 hardcoded strings; verify natural translations (not robotic Google Translate).

---

### T4.3 — Monorepo Deduplication (Priority Order)
**Source**: March/1st_week/monorepo_duplication_audit.md
**Effort**: L | **Risk**: Medium
**Priority cleanup**:
1. API first (highest ROI): migrate `src/lib/api/*.ts` → `@repo/core`; delete redundant files
2. Community components: choose SSOT for `GroupsScreen`, `GroupDetailsScreen`, `CreatePostModal`, `ReportPostModal`
3. LotusPetalFAB: merge PanResponder features into `@repo/ui` version; remove app version
4. Hook deduplication: `useTheme`/`useAccessibility` → `@repo/ui`; `useInventory` → `@repo/classroom`

---

### T4.4 — QA: BDD Tests for Core Flows
**Source**: Feb/4th_week/tasks.md item 11
**Effort**: L
**Actions**: BDD tests for Classroom Management flow; Library Upload flow; E2E tests (Detox) for 5 critical flows: auth, classroom creation, content upload, QR scan, grading.

---

### T4.5 — CI/CD: Production Build
**Source**: Feb/4th_week/tasks.md item 12
**Effort**: M
**Actions**: EAS Development Build (APK with dev client); EAS App Bundle (production AAB); Set EAS secrets (SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN, POSTHOG_API_KEY); run `npx expo-doctor` before each build.

---

### T4.6 — App Attest Security (Device Integrity)
**Source**: `docs/Tasks/mobile_feature_strategy.md` `ENG-INF-004` — `🔴 Pending`
**What**: Implement device integrity verification using `expo-device-integrity` / App Attest (iOS) + Play Integrity (Android). Prevents bot sign-ups and fake accounts.
**Effort**: M | **Code**: `packages/core/src/lib/` — new `appAttest.ts` module

---

### T4.7 — OTA Hotfix Channel (EAS Updates)
**Source**: `docs/Tasks/mobile_feature_strategy.md` `ENG-INF-007` — `🟡 Partial` (`eas.json` exists, OTA logic missing)
**What**: Configure EAS Updates for over-the-air JS bundle updates. Enables deploying critical bug fixes without App Store review cycles.
**Effort**: S | **Code**: `eas.json`, `app.json` updates configuration

---

### T4.8 — Rate Limiting + Privacy Ledger
**Source**: `docs/Tasks/mobile_feature_strategy.md` `ENG-INF-011` (Rate Limiting) + `ENG-INF-013` (Privacy Ledger) — both `🔴 Pending`
**What**: Edge-level rate limiting via Supabase Edge Functions (UPSTASH Redis or Supabase's built-in). Privacy Ledger: user-facing consent history screen showing what data is tracked.
**Effort**: M (rate limiting) + M (privacy ledger) | **Code**: Supabase Edge Functions, `packages/core/src/lib/ConsentManager.ts`

---

## Dependency Chain

```
T0.1 (DB migrations) → ALL other features (silent failures otherwise)
T0.2 (journey validation) → Trust that core loop works
T0.3 (real pulse data) → T1.6 (pulse UX polish)
T0.4 (QR join fix) → T0.2 (journey works end-to-end)
T0.6 (school+classroom creation) → T0.2 (journey validation complete)
T1.5 (join-group QR) → T2.1 (group chat — groups must be joinable first)
T2.1 (group chat backend) → T3.4 (community UI polish)
T2.7 (DM infrastructure) → T3.4 (community UI polish)
T2.8 (Library PDF/Video) → T1.4 (assignment/grading workflow complete with materials)
T2.9 (Staff Attendance) → T3.13 (Leave Management natural sibling)
T4.3 (deduplication) → safer to make changes in community + library
```

---

## Clear Action Items by Owner

### For the Human (Naveen — Vision, Taste, Critical Decisions)
- [ ] Validate DB migration status on production Supabase (T0.1)
- [ ] Walk the "new school" journey on a real device (T0.2)
- [ ] Curate default Library content — 20 resources minimum (T2.2)
- [ ] Approve Self PulseDashboard redesign direction before T1.6 (wireframe approval)
- [ ] Define education-related tags list for Community posts (T2.5)
- [ ] Define product rules for classroom role-specific demos (T3.6)
- [ ] Approve Community group chat UX direction before T2.1 (WhatsApp-style vs other)
- [ ] Review and approve translation improvements in `TRANSLATION_IMPROVEMENTS.md`
- [ ] Approve DM role permissions (can students DM teachers? parents DM teachers?) (T2.7)
- [ ] Validate SchoolCreationScreen → ClassroomModal flow on device (T0.6)

### For the Agent (Architecture, Boilerplate, Pattern Implementation)
- [ ] T0.3: Wire PulseDashboard to real attendance + assignment queries
- [ ] T0.4: Fix teacher QR join (membership link, not teacher_id overwrite)
- [ ] T0.5: Render QR modal for Principal InviteManager
- [ ] T0.6: Add "Set Up First Classroom" CTA to SchoolCreationScreen success state
- [ ] T1.1: Wire SleepTracker / RemindersManager / VoiceJournaling into TeacherSelfView
- [ ] T1.2: Audit NotificationDrawer data; wire to real Supabase if hardcoded
- [ ] T1.5: Add join-group QR consumer path in QRResolver + QRHandlerScreen
- [ ] T2.4: Implement MLKitProvider (real, not stub); wire OCRScanner to UI
- [ ] T2.5: Add education tag selection to CreatePostModal
- [ ] T2.8: Replace PDF/Video stub screens with native expo-av + react-native-pdf viewers
- [ ] T2.9: Build staff attendance + leave management schema + UI
- [ ] T3.8: Replace all raw Alert.alert with SanctuaryToast
- [ ] T3.9: Build SkeletonCard / SkeletonAvatar / SkeletonTextLine
- [ ] T3.11: Wire getFabActions() (deprioritized; do after core loop tasks)
- [ ] T4.3: Migrate API duplication; community screen deduplication

### Joint Tasks (Agent starts, Human approves/validates)
- [ ] T0.2: Agent creates test script + documents failures; Human validates on device
- [ ] T1.3 + T1.4: Agent walks through flows in code; Human validates on device
- [ ] T2.1: Agent builds chat backend schema + wires Realtime; Human approves UX direction first
- [ ] T2.6: Agent builds Thuthimal claim flow; Human defines gift economics + content
- [ ] T3.1–T3.6: Agent implements UI; Human approves visual direction first

---

