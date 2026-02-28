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

**Why**: This is the core loop. If any step breaks, the app has no users. This has NEVER been formally validated end-to-end from code evidence. The QR join bug (T0.5) alone could break step 1.
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

### T0.4 — Wire FAB Actions (getFabActions)
**What**: `getFabActions()` in `App.tsx` has all actions as `console.log` placeholders. Every FAB tap does nothing.
**Why**: The FAB is visible on every screen. Dead buttons destroy trust immediately. This is a T0 bug masquerading as a "feature to implement."
**Effort**: S (1 day)
**Code to touch**: `apps/gurudevi-mobile/App.tsx` — `getFabActions()` function
**Action**: Wire each action to its correct navigation target (create classroom, mark attendance, add post, add resource). Use `navigationRef.navigate()` for each.

---

### T0.5 — Fix Teacher QR Join Bug (ownership overwrite)
**What**: When a teacher joins a classroom via QR, the code does `api.classrooms.update(classId, { teacher_id: user.id })`. This overwrites the original teacher's ownership.
**Why**: This is a data corruption bug. Any teacher joining a classroom via QR immediately steals ownership from the original teacher. If this fires in a real school, it's catastrophic.
**Effort**: S (half day)
**Code to touch**: `packages/classroom/` — QR join handler; `packages/core/src/api/classroom.ts`
**Action**: Change to create a `classroom_teachers` membership record instead of updating `teacher_id`. First verify (as part of T0.1 DB migration audit) whether a `classroom_teachers` join table already exists in schema; if not, create migration to add it. Implementation owner: Agent; DB verification: can be confirmed during T0.1.

---

### T0.6 — Fix Principal InviteManager QR Modal Not Rendering
**What**: Principal generates a QR code → state is stored in `qrCodeData` but no modal renders it. The button silently does nothing.
**Why**: Principals cannot invite teachers without this. School creation is broken for the primary administrative role.
**Effort**: S (half day)
**Code to touch**: `packages/classroom/InviteManager.tsx` (or wherever `qrCodeData` state lives)
**Action**: Find the stored `qrCodeData` state and add the QR display modal that was never rendered.

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

## Dependency Chain

```
T0.1 (DB migrations) → ALL other features (silent failures otherwise)
T0.2 (journey validation) → Trust that core loop works
T0.3 (real pulse data) → T1.6 (pulse UX polish)
T0.5 (QR join fix) → T0.2 (journey works end-to-end)
T1.5 (join-group QR) → T2.1 (group chat — groups must be joinable first)
T2.1 (group chat backend) → T3.4 (community UI polish)
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

### For the Agent (Architecture, Boilerplate, Pattern Implementation)
- [ ] T0.3: Wire PulseDashboard to real attendance + assignment queries
- [ ] T0.4: Wire getFabActions() to real navigation targets
- [ ] T0.5: Fix teacher QR join (membership link, not teacher_id overwrite)
- [ ] T0.6: Render QR modal for Principal InviteManager
- [ ] T1.1: Wire SleepTracker / RemindersManager / VoiceJournaling into TeacherSelfView
- [ ] T1.2: Audit NotificationDrawer data; wire to real Supabase if hardcoded
- [ ] T1.5: Add join-group QR consumer path in QRResolver + QRHandlerScreen
- [ ] T2.4: Implement MLKitProvider (real, not stub); wire OCRScanner to UI
- [ ] T2.5: Add education tag selection to CreatePostModal
- [ ] T3.8: Replace all raw Alert.alert with SanctuaryToast
- [ ] T3.9: Build SkeletonCard / SkeletonAvatar / SkeletonTextLine
- [ ] T4.3: Migrate API duplication; community screen deduplication

### Joint Tasks (Agent starts, Human approves/validates)
- [ ] T0.2: Agent creates test script + documents failures; Human validates on device
- [ ] T1.3 + T1.4: Agent walks through flows in code; Human validates on device
- [ ] T2.1: Agent builds chat backend schema + wires Realtime; Human approves UX direction first
- [ ] T2.6: Agent builds Thuthimal claim flow; Human defines gift economics + content
- [ ] T3.1–T3.6: Agent implements UI; Human approves visual direction first

---

