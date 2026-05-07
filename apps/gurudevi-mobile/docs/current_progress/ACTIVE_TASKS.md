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
**Status**: ✅ Done (Feb 28 2026)
- `usePendingActions` hook in `@repo/core` queries real DB: classrooms with no attendance today + overdue assignments with ungraded submissions
- `PulseDashboard.tsx` renders real attendance/grading items; tapping attendance item → navigates to `Attendance` screen; tapping grading item → navigates to `Gradebook` screen
- Empty state: "Your day is clear 🪷" with `CheckCircle` icon
- Skeleton loading via `SkeletonCard` while data loads

---

> *Original T0.4 (Wire FAB Actions) moved to T3.11 — FAB is deprioritized. Core loop reliability matters more.*

---

### T0.4 — Fix Teacher QR Join Bug (ownership overwrite)
**Status**: ✅ Done (verified Feb 28 2026)
`FlowResolver.executeJoinClass` is now role-aware:
- Students → upsert into `classroom_students` membership table (never touches `teacher_id`)
- Teachers/staff → only set `teacher_id` when column IS NULL; uses `.is('teacher_id', null)` filter so concurrent claims are atomic (last-write-wins on empty only); if already claimed, teacher joins as a visitor without stealing ownership

---

### T0.5 — Fix Principal InviteManager QR Modal Not Rendering
**Status**: ✅ Done (verified Feb 28 2026) — The `qrCodeData` state drives a `<Modal>` that IS rendered in `InviteManager.tsx`. Each invite code row has a QR icon that calls `setQrCodeData({ code, role })`. The modal renders `QRCodeGenerator` with a `QRBuilder.invite()` payload. This bug was already fixed prior to this sprint.

---

### T0.6 — School Creation: Guide Principal to Hierarchy Setup (Not Classroom Creation)
**Ownership model (now correct in code):**
- **Principal** creates: school → school structure (grades, sections, grade heads) → shares school QR so teachers can join
- **Teacher** creates: classrooms (after joining a school) → lessons, students, resources inside those classrooms
- **Student**: joins classrooms via QR or code — never creates

**What was wrong**: The SchoolCreationScreen success CTA said "Enter Your Sanctuary" with no guidance on what to do next. T0.6 previously planned to add "Set Up First Classroom" — but classrooms are a teacher concern, not a principal concern. Fixed: CTA now says "Set Up School Structure →" with a subtitle explaining the flow. The `ClassroomList` FAB is now role-guarded: only `teacher` and `grade_head` can trigger `CreateClassroomModal` — principals, students, and section_heads are excluded.

**Status**: ✅ Done — code changes committed.
- `SchoolCreationScreen.tsx`: success CTA → "Set Up School Structure →" + explanatory subtitle
- `ClassroomList.tsx`: `canCreateClassroom = !isGuest && (role === 'teacher' || role === 'grade_head')` — replaces `role !== 'student'` and `!isGuest` checks throughout
- `ACTIVE_TASKS.md`: this task corrected

**Why this matters**: Before this fix, a principal landing on ClassroomList (via deep link or unexpected routing) would see a + FAB inviting them to create a classroom. The ownership boundary was blurry in both the UI and the docs. Now it is structural: the code itself enforces who creates what.

---

## 🔴 TIER 1: Core Value Delivery
### *The "Why" of the App — What Teachers Do Every Day*

These are the features teachers will use daily. If they don't work reliably and feel good, teachers will stop using the app after week 1.

---

### T1.1 — Wire SleepTracker, RemindersManager, VoiceJournaling into TeacherSelfView
**Status**: ✅ Done (verified Feb 28 2026)
All three are in `MORE_TOOLS_FEATURES` array and handled in `renderFeature()` switch in `TeacherSelfView.tsx`:
- `SleepTracker` → renders when user selects 'sleep' from More Tools tray
- `RemindersManager` → renders when user selects 'reminders' from More Tools tray
- `VoiceJournaling` → renders when user selects 'voiceJournal' from More Tools tray
Note: CURRENT_STATE.md previously said "NOT wired" — that was a stale doc claim. Code confirmed wired.

---

### T1.2 — Audit and Fix NotificationDrawer Data
**Status**: ✅ Done (Feb 28 2026)
- `notifications` table created via migration `20260228_notifications.sql`
- `useNotifications` hook reads real data from `notifications` table (20 most recent, ordered by `created_at DESC`)
- `NotificationDrawer` passes real `notifications`, `unreadCount`, `isLoading`, `onMarkRead`, `onMarkAllRead` from hook
- `GlobalHeader` wires `useNotifications(user?.id)` and passes props to `NotificationDrawer`
- Three PostgreSQL triggers auto-insert rows (`20260228_notification_triggers.sql`):
  - `trg_notify_submission` — new submission → notifies classroom teacher
  - `trg_notify_grade` — `graded_at` NULL→non-NULL → notifies student
  - `trg_notify_group_post` — new post in group → fan-out to all active members (excluding author)

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
**Status**: ✅ Done (verified Feb 28 2026) — All three layers are already wired:
1. `QRResolver.ts` handles both `join-group:<UUID>` (legacy) and `gurudevi://qr?action=join_group&group_id=...` (canonical)
2. `FlowResolver.executeJoinGroup()` upserts into `group_members` table
3. `QRHandlerScreen` maps `GOTO_COMMUNITY` intent → navigates to Community tab

No further work needed. The consumer path is complete.

---

### T1.6 — Self Screen PulseDashboard UX Polish (after T0.3 makes it real)
**What**: After T0.3 makes PulseDashboard show real data, do UX polish: layout, spacing, Sanctuary aesthetic, loading states, empty states.
**Why**: This is what teachers see every morning. It should feel like a sacred, calm, energizing home base — not a task list.
**Effort**: M (2 days) — depends on T0.3 being done first
**Code to touch**: `apps/gurudevi-mobile/src/components/PulseDashboard/`
**Action**: Design clean morning-dashboard layout. DailyResonanceCard prominent. Pending tasks below. "Enter Full Sanctuary" button prominent. Loading skeleton. Empty state: "Your day is clear 🪷"

---

### T1.7 — Principal Dashboard: Comprehensive Redesign
**Status**: ✅ Done — Phases 1 + 2 complete (Feb 28 2026)

**Phase 1 — Morning Brief + Teacher Carousel** ✅
New components wired into `PrincipalSchoolView.tsx` before the existing stats grid:
- `MorningSituationalBrief.tsx` — staff presence strip (colour-coded: ≥90% green, ≥70% amber, <70% red), student attendance % + yesterday delta, at-risk student count badge, pending approvals badge
- `TeacherCarousel.tsx` — horizontal scroll of teacher cards; each card: status dot from `staff_attendance`, class count, tap handler for detail drill-down
- New `staffManagementAPI` in `packages/core/src/api/staffManagement.ts` (8 functions: `getStaffPresenceSummary`, `getTeacherCarousel`, `submitLeaveRequest`, `getPendingLeaves`, `approveLeave`, `getStudentAttendancePulse`, `getUpcomingCalendarEvents`, `createCalendarEvent`)

**Phase 2 — Student Pulse + Observations + Calendar + Leave Approvals** ✅
- `StudentPulseSection.tsx` — attendance %, delta vs yesterday, weekly submission rate, at-risk flags, pending enrollment badge
- `InstitutionalCalendarSection.tsx` — upcoming events list + inline add-event form (type chips: term/exam/holiday/event; date inputs; save → DB)
- `PrincipalObservationsSection.tsx` — classroom walkthrough notes CRUD (types: walkthrough/note/concern/praise; inline form; last 5 entries list)
- `LeaveApprovalSection.tsx` — pending `staff_leaves` list with inline approve/reject buttons
- DB migration `20260228_staff_management.sql`: `staff_attendance`, `staff_leaves`, `principal_observations`, `institutional_calendar` tables with full RLS

**Phase 3 — Admin Tasks (circular composer, report generator, letters)** — Still pending
**Phase 4 — Academic Trends + Inventory CRUD** — Still pending

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
**Status**: ✅ Done (Feb 28 2026)
- `notifications` table + RLS created via `20260228_notifications.sql`
- `useNotifications` hook reads from table; passed into `NotificationDrawer` via `GlobalHeader`
- `20260228_notification_triggers.sql` — three `SECURITY DEFINER` PostgreSQL triggers:
  - `trg_notify_submission` (INSERT on `submissions`) → notifies assigned classroom teacher
  - `trg_notify_grade` (UPDATE on `submissions` when `graded_at` NULL→non-NULL) → notifies student
  - `trg_notify_group_post` (INSERT on `community_posts` with `group_id`) → fan-out to all active group members

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
**Status**: ✅ Done (Feb 28 2026)
- **Claim side** (`ThuthimalClaimScreen.tsx`) was already complete — QR scan → `thuthimalAPI.claimGift` → celebration animation
- **Send side** added:
  - `packages/profile/src/components/GiveThuthimalModal.tsx` — optional message input + "Send Gift of Gratitude" button → `thuthimalAPI.createGift` → `useLotusToast` + `hapticSuccess`
  - `FullProfileScreen.tsx` — detects `isOtherProfile` (session user ≠ profile user), shows "🌸 Give Thuthimal" button when viewing another teacher or principal's profile

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
**Status**: ✅ Done (Feb 28 2026)
- **PDF** (`packages/library/src/screens/PDFViewerScreen.tsx`): `expo-file-system` downloads the file with a real progress bar (progress callback → animated fill); `expo-sharing` opens device's native PDF app on explicit "Open in Native Viewer" tap. Local cache prevents re-downloading. Bookmark button preserved.
- **Video** (`packages/library/src/screens/VideoPlayerScreen.tsx`): Real `expo-av` `Video` component with `onPlaybackStatusUpdate` for live position/duration, `videoRef` play/pause/±10s seek, tap-to-seek on progress bar, full-screen Sanctuary dark chrome, error state.

---

### T2.9 — Principal Analytics: Staff Attendance + Wellbeing Pulse
**Status**: ✅ Done (Feb 28 2026) — Covered under T1.7 Phases 1+2
- `staff_attendance` table with RLS (see `20260228_staff_management.sql`)
- `staff_leaves` table — staff submit leave requests; principal approves/rejects
- `MorningSituationalBrief` shows today's staff presence count (present/absent/on-leave)
- `LeaveApprovalSection` shows pending leave queue with approve/reject
- Note: anonymized staff wellbeing aggregation (mood trend for principal) is deferred — awaiting approval on dignity-preserving display design

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
**Status**: ✅ Done (Feb 28 2026) — Covered under T1.7 Phase 2 / T2.9
- `staff_leaves` table with RLS (migration `20260228_staff_management.sql`)
- `LeaveApprovalSection.tsx` in Principal Dashboard — pending leave queue, inline approve/reject
- `staffManagementAPI.getPendingLeaves` + `approveLeave` functions

---

### T3.14 — Orientation Layer: Extend to Principal + Admin Self Views ✦ NEW
**Source**: `Individual Difference Layer` — Feb 28 2026
**What**: `ResonancePatternCard` is currently only in `StudentSelfView` + `TeacherSelfView`. Principal and Admin self views have none.
**Effort**: XS | **Code**: `apps/gurudevi-mobile/src/screens/self/PrincipalSelfView.tsx`, `AdminSelfView.tsx` — same 4-line addition as the other views
**Action**: Import `ResonancePatternCard`, `useMoodLogs`, `useEnergyForecast`; add card after DailyContentCards.

---

### T3.15 — Orientation Layer: Pass `gradeNumber` for Student Grade Defaults ✦ NEW
**Source**: `Individual Difference Layer` — Feb 28 2026
**What**: `useOrientationInference` accepts `gradeNumber` (1–13) to fine-tune student defaults (junior=social+active, senior=reflective+depth). Currently `StudentSelfView` does not pass it because `grade_id` is not yet resolved to a number.
**Effort**: S | **Code**: `StudentSelfView.tsx` — resolve `user.grade_id` → grade number via Supabase query or store; pass to `ResonancePatternCard`
**Note**: Low priority — role default is already reasonable without grade refinement.

---

### T3.16 — Orientation Layer: ResonancePatternCard Radar Polygon (Skia) ✦ NEW
**Source**: `Individual Difference Layer` — Feb 28 2026
**What**: The current radar chart uses dot markers + axis lines (pure RN, no deps). A true filled polygon would be more visually compelling. This is a cosmetic upgrade only — the data layer is complete.
**Effort**: S | **Code**: `ResonancePatternCard.tsx` — replace `RadarChart` pure-RN implementation with a Skia `Path` version, behind the existing `useShouldAnimate()` fidelity guard
**Note**: Skip until Skia NoiseOverlay (T3.10) is resolved first — proves the Skia pipeline is stable.

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
**Actions**: EAS Development Build (APK with dev client); EAS App Bundle (production AAB); Set EAS secrets (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SENTRY_DSN, POSTHOG_API_KEY); run `npx expo-doctor` before each build.

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
T0.6 (school creation → hierarchy guidance, role guards) → T0.2 (journey validation complete)
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
- [x] T0.6: ✅ Done — "Set Up School Structure" CTA on SchoolCreationScreen; ClassroomList role-guarded (teacher/grade_head only)

### For the Agent (Architecture, Boilerplate, Pattern Implementation)
- [x] T0.3: ✅ Done — `usePendingActions` hook added; PulseDashboard shows real attendance + grading items
- [x] T0.4: ✅ Done — FlowResolver.executeJoinClass fixed: student→classroom_students, teacher→only sets teacher_id if null
- [x] T0.5: ✅ Already done — QR modal was already rendered in InviteManager.tsx (verified Feb 28)
- [x] T0.6: ✅ Done — see above
- [x] T1.1: ✅ Done — SleepTracker, RemindersManager, VoiceJournaling wired into TeacherSelfView MORE_TOOLS
- [x] T1.2: ✅ Done — useNotifications hook + migration added; NotificationDrawer shows real data + empty state
- [x] T1.5: ✅ Already done — join-group QR is fully wired in QRResolver → FlowResolver → QRHandlerScreen (verified Feb 28)
- [ ] T2.4: Implement MLKitProvider (real, not stub); wire OCRScanner to UI
- [x] T2.5: ✅ Done — Education tag chips added to CreatePostModal; stored in metadata.education_tags
- [ ] T2.8: Replace PDF/Video stub screens with native expo-av + react-native-pdf viewers
- [ ] T2.9: Build staff attendance + leave management schema + UI
- [x] T3.8: ✅ Done — ClassroomNotes, PrincipalNotes, TeacherDashboard all use useLotusToast now
- [x] T3.9: ✅ Already done — SkeletonCard, SkeletonAvatar, SkeletonTextLine all exported from @repo/ui
- [x] T3.11: ✅ Done — getFabActions() now calls navigationRef.navigate() for each tab; no more console.log placeholders
- [x] T3.14: ✅ Done — ResonancePatternCard added to PrincipalSelfView + AdminSelfView
- [ ] T3.15: Resolve grade_id → gradeNumber for student orientation defaults (S)
- [ ] T3.16: ResonancePatternCard radar polygon upgrade via Skia (S, after T3.10)
- [ ] T4.3: Migrate API duplication; community screen deduplication

### Joint Tasks (Agent starts, Human approves/validates)
- [ ] T0.2: Agent creates test script + documents failures; Human validates on device
- [ ] T1.3 + T1.4: Agent walks through flows in code; Human validates on device
- [ ] T2.1: Agent builds chat backend schema + wires Realtime; Human approves UX direction first
- [ ] T2.6: Agent builds Thuthimal claim flow; Human defines gift economics + content
- [ ] T3.1–T3.6: Agent implements UI; Human approves visual direction first

---

