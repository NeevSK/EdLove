# ACTIVE TASKS: What Needs Done Right Now

> Priority-ordered task list based on March 1st week priority matrix + Feb 4th week open tasks. Most recent first.

---

## 🔴 P0 — Critical Blockers (Do Today)

### P0.1 — Fix Skia Dark Overlay (Visual Regression)
**Source**: `docs/current_progress/March/1st_week/2026-02-27-priority-matrix-and-skia-runbook.md`  
**Symptom**: Skia `NoiseOverlay` renders as full-screen dark opaque rectangle, hiding all app UI  
**Location**: `packages/ui/src/components-native/`  
**Owner**: Joint — Agent implements; User validates on real devices (low-end + mid-range + flagship)  
**Effort**: M (1-2 days)  
**Risk**: High

**Exact fix sequence:**
1. **Step A** — Render `NoiseOverlay` with opacity `0.0` first. Confirm no dark fill appears.
2. **Step B** — Replace complex ColorMatrix pipeline with minimal additive grain: start at `opacity: 0.01 → 0.02`. Add turbulence only. Postpone tint matrix.
3. **Step C** — Hard clamp all values: `0 ≤ opacity ≤ 0.03`, frequency `0.35..0.85`
4. **Step D** — Mount as last child in root app tree with `pointerEvents="none"`. Keep behind modal blockers.
5. **Step E** — Feature flag: `skiaNoiseOverlay=false` by default in production. Enable on dev builds first; staged rollout by role/percentage.

---

## 🟠 P1 — High Priority This Week

### P1.1 — Premium Global Header Redesign
**Source**: `March/1st_week/tasks.md` item "Global header"  
**Details**:
- Modern and premium, aligned with theme
- No blur — consider skeuomorphic/glassmorphism
- Profile avatar + proper spacing from text in Self view
- Theme alignment of all UI colors (no hardcoded hex)
- Remove decorative hexagon behind avatar if present

**Sub-tasks:**
- [ ] Design token audit: all hardcoded colors/sizes/padding → Theme tokens
- [ ] `GlobalHeader.tsx` in `packages/ui/src/components/` — redesign
- [ ] Add `UserAvatar` (already built) with correct sizing
- [ ] Subtext below heading — evaluate if needed, keep or remove

### P1.2 — Premium Bottom Navbar Redesign
**Source**: `March/1st_week/tasks.md` item "bottom navbar"  
**Details**:
- Modern and premium, aligned with theme
- No blur — skeuomorphic/glassmorphism if appropriate
- Theme alignment of all UI colors
- `LotusBottomNav.tsx` or `TabNavigator` visual layer

**Sub-tasks:**
- [ ] Token audit: no hardcoded colors/shadows
- [ ] Evaluate FAB placement vs navbar (FAB not under navbar issue from Feb tasks)
- [ ] Active tab indicator styling

### P1.3 — Self Screen Default View Redesign
**Source**: `March/1st_week/tasks.md` + `Feb/4th_week/tasks.md` item 8  
**Details**: New default view for all roles — described target: "PulseDashboard, professional and premium"  
**Note**: Current implementation described as needing full redesign

**Sub-tasks:**
- [ ] 8.1 New default view for all roles (PulseDashboard or similar — get user approval first)
- [ ] 8.2 Mood tracker redesign (current described as "fucking bad" — complete overhaul)
- [ ] 8.3 Remove timetable from Self (moves to Classroom tab per task 9.1)
- [ ] Add reminders, sleep trackers to Self
- [ ] Redesign Energy tracker in Principal view
- [ ] Organize Self components coherently

### P1.4 — Profile Screen Modal Polish
**Source**: `March/1st_week/tasks.md` item "profile section"  
**Details**:
- [ ] Logout modal and Delete Account modal: modern/premium, theme-aligned, premium shape
- [ ] Ensure all UI components are responsive and aligned with theme
- [ ] No hardcoded colors, texts, sizes, padding in profile components

---

## 🟡 P2 — Core Feature Flows (This Week / Next Week)

### P2.1 — Community: Create/Join/Leave/Settings/Members/Chat Shell
**Source**: `March/1st_week/tasks.md` item "community screen" + `Feb/4th_week/tasks.md` item 5.2.4  
**Effort**: L (3-4 days) | **Risk**: Medium

**Sub-tasks:**
- [ ] Minimal redesign of Community default view
- [ ] Theme alignment of all UI colors and modals
- [ ] Group creation flow (full UI)
- [ ] Group join flow (QR + invite code)
- [ ] Group leave flow with confirmation
- [ ] Group settings screen
- [ ] Group members list
- [ ] Group chat screen scaffold (WhatsApp-style) — requires backend
- [ ] Group profile/QR display
- [ ] Manifesto settings for teachers/principals
- [ ] Theme-aligned modals for all community flows

**Note from delegation playbook**: Agent can implement navigation/state scaffolding; User must approve product rules.

### P2.2 — Community: Education Tag Required for Posts
**Source**: `Feb/4th_week/tasks.md` item 5.1.1  
**Details**: When posting in community feed, user must select at least 1 education-related tag. Posts must be related to a group. This prevents off-topic content and keeps community educational.  
**Effort**: M | **Risk**: Low  

**Sub-tasks:**
- [ ] Add tag selection UI in `CreatePostModal`
- [ ] Validation: at least 1 tag required before post can be submitted
- [ ] Available tags: define list (subjects, grades, etc.)
- [ ] Tag display on posts in feed

### P2.3 — Classroom: Role-Specific Default Demos/Views
**Source**: `March/1st_week/tasks.md` item "classroom screen" + `Feb/4th_week/tasks.md` item 9  
**Effort**: L | **Risk**: Medium  
**Note**: Product rules and sample data choices need user input (Yellow in delegation playbook)

**Sub-tasks:**
- [ ] 9.9 Change default screen content in `TeacherDashboardView.tsx` (remove stale/demo content)
- [ ] New demo for student classroom view (currently uses teacher demo)
- [ ] New demo for principal classroom view
- [ ] 9.11 ClassroomScreen: if guest user → nudge to profile creation or "play with sample school/classroom"; if registered user without NIC/index number → redirect to UpdateProfile with proper info
- [ ] Fix: `ClassroomScreen.tsx` no blocking — show demo/previous content while loading

### P2.4 — Library: Minimal Redesign + FAB Fix
**Source**: `March/1st_week/tasks.md` item "library screen"  
**Effort**: M | **Risk**: Low

**Sub-tasks:**
- [ ] Minimal redesign of Library default view
- [ ] Theme alignment of all UI colors
- [ ] UI alignment with screen layout
- [ ] FAB not hidden under navbar (z-index/positioning fix)
- [ ] Theme-aligned modals
- [ ] Add/find content for library defaults (needs curation — user task)

---

## 🟢 P3 — Important But Not Immediate

### P3.1 — Feature Mapping: Self + Community per Role
**Source**: `Feb/4th_week/tasks.md` item 1  
**Details**: Map features/functions/components for each role (Teacher, Student, Principal, Founder) to Self and Community sections specifically.

**Sub-tasks:**
- [ ] Create `useRoleFeatures` hook if not already complete
- [ ] Audit Self section: which widgets show for Teacher vs Student vs Principal vs Founder
- [ ] Audit Community section: feed filters, group creation permissions, manifesto access per role
- [ ] Ensure "Online Teachers" → renames to "Online Students" in student view
- [ ] Principal Community: Manifesto edit, Announcement priority, Circle management

### P3.2 — Fix QR Routing (Centralized Resolver)
**Source**: `Feb/4th_week/codex/qr-ocr-implementation-audit.md` + `codex/sustainable-implementation-strategy.md`  
**Effort**: L | **Risk**: High  
**Current score**: 47/100 (critical integration risk)

**Sub-tasks:**
- [ ] Define canonical QR payload schema with versioning: `{ type: 'join-class' | 'join-group' | 'invite' | 'profile', payload: {...}, version: 1 }`
- [ ] Build central resolver/router: scan result → parse → validate → authorize → dispatch
- [ ] Route all scanner entry points through this resolver
- [ ] Fix `join-group:` payloads — create consumer path
- [ ] Fix Principal `InviteManager` — render QR from stored `qrCodeData` state
- [ ] Fix Teacher QR join: use membership link instead of `classrooms.update({ teacher_id })`
- [ ] Implement QR image sharing: render-to-image + `expo-sharing` + deep-link payload
- [ ] Add integration tests for QR join/claim/group flows
- [ ] Add backward-compatible parser for legacy payload formats

### P3.3 — Real Notifications System
**Source**: `Feb/4th_week/tasks.md` item 7.1 + `March/1st_week/tasks.md` item "Notification Screen"  
**Effort**: L | **Risk**: Medium

**Sub-tasks:**
- [ ] Remove hardcoded notifications from `NotificationsScreen.tsx`
- [ ] Wire to `notifications` table in Supabase (schema: `notifications` table exists)
- [ ] Real-time notifications via Supabase Realtime
- [ ] Notification types: assignment created, grade posted, community post, invitation received, manifesto updated
- [ ] Mark as read/unread
- [ ] Push notifications (requires native notification permissions — separate task)
- [ ] Notification badge count on Profile tab icon

### P3.4 — Error Handling Normalization
**Source**: `Feb/4th_week/tasks.md` items 10.1, 10.2  
**Effort**: M | **Risk**: Low

**Sub-tasks:**
- [ ] 10.1 Audit all screens for unhandled errors; wrap in graceful error states
- [ ] 10.2 Error messages should be informing AND nudging to necessary actions (not just "Error occurred")
- [ ] Replace all raw `Alert.alert` with `SanctuaryToast` or `ErrorMessage` components
- [ ] Verify `apiInterceptor.ts` covers all PostgREST error codes
- [ ] Add empty states everywhere (use `PositiveInvitation.tsx` pattern: "This space is yours to create")
- [ ] Skeleton loaders during data fetch (replace spinners with `SkeletonCard`, `SkeletonAvatar`, `SkeletonTextLine`)

---

## 🔵 P4 — Infrastructure & Production

### P4.1 — Accessibility: Critical Path Fix
**Source**: `Feb/4th_week/codex/a11y-localization-completeness-audit.md`  
**Current score**: 5/100 (CRITICAL GAP)  
**Effort**: L (ongoing) | **Risk**: Legal/Ethical

**Immediate actions (priority order per accessibility_strategy.md):**
1. [ ] `WelcomeScreen.tsx` — Add `accessibilityLabel`, `accessibilityRole` to all interactive elements
2. [ ] `OnboardingScreen.tsx` — Same
3. [ ] `AuthScreen.tsx` — Same
4. [ ] `SelfScreen.tsx` — Same
5. [ ] `LibraryScreen.tsx` — Same
6. [ ] All `Pressable`, `TouchableOpacity`, `TouchableWithoutFeedback` without text: add `accessibilityLabel`
7. [ ] All images without explicit `accessibilityLabel`
8. [ ] `accessibilityRole="button"` on all action elements
9. [ ] `accessibilityState` on all toggles (checked/unchecked)
10. [ ] Use `accessible={true}` to group related text + controls
11. [ ] Verify 72px minimum touch targets (currently implemented in AppSettingsScreen — replicate everywhere)

**Do NOT suppress warnings with `eslint-disable` unless technically unavoidable with documentation.**

### P4.2 — Localization: Close Key Gaps
**Source**: `Feb/4th_week/codex/a11y-localization-completeness-audit.md`  
**Effort**: M | **Risk**: Medium

**Sub-tasks:**
- [ ] Add ~176 missing Sinhala (`si.json`) keys
- [ ] Add ~200 missing Tamil (`ta.json`) keys
- [ ] Identify and externalize top 272 hardcoded strings in priority screens
- [ ] Run `pnpm run lint` — fix missing `t()` calls flagged by `eslint-plugin-react-native-a11y`
- [ ] Verify natural translations (see `TRANSLATION_IMPROVEMENTS.md` for specific improvements)
  - Sinhala: "හිතේ බර ඉවත් කරගන්න" instead of "දවසේ බර මුදා හරින්න"
  - Tamil: "மனதில் இருப்பதை வெளியிடுங்கள்" instead of "நாளின் பாரத்தை விடுவியுங்கள்"

### P4.3 — Monorepo Deduplication
**Source**: `March/1st_week/monorepo_duplication_audit.md` + `Feb/4th_week/codex/src-vs-packages-redundancy-audit.md`  
**Effort**: L | **Risk**: Medium

**Priority cleanup order:**
1. **API first (highest ROI)**:
   - [ ] Migrate all remaining `apps/gurudevi-mobile/src/lib/api/*.ts` references to `@repo/core` APIs
   - [ ] Archive/deprecate redundant mobile API files
2. **Community components second**:
   - [ ] Choose SSOT: `@repo/community` or mobile-local for `GroupsScreen`, `GroupDetailsScreen`, `CreatePostModal`, `ReportPostModal`
   - [ ] Move shared logic to package; keep thin wrapper in app only if truly app-specific
3. **LotusPetalFAB harmonization**:
   - [ ] Merge PanResponder/advanced features from app version into `@repo/ui` version
   - [ ] Remove app version; all consumers use `@repo/ui`
4. **Hook deduplication**:
   - [ ] `useTheme`/`useAccessibility` — move to `@repo/ui`
   - [ ] `useInventory` — move to `@repo/classroom`

### P4.4 — QA and Testing
**Source**: `Feb/4th_week/tasks.md` item 11  
**Effort**: L | **Risk**: Medium

**Sub-tasks:**
- [ ] 11.1 Unit tests for critical business logic in `@repo/core`
- [ ] 11.1 BDD tests for Classroom Management flow
- [ ] 11.1 BDD tests for Library Upload flow
- [ ] 11.2 Accessibility smoke tests (screen-reader + language-switch)
- [ ] 11.2 Localization snapshot tests
- [ ] 11.2 Performance budget: bundle size + render timings for key screens
- [ ] 11.2 Security regression tests (privilege escalation paths)
- [ ] E2E tests (Detox): setup for 5 critical flows (auth, classroom creation, content upload, QR scan, grading)

### P4.5 — CI/CD and Production Build
**Source**: `Feb/4th_week/tasks.md` item 12  
**Effort**: M | **Risk**: Medium

**Sub-tasks:**
- [ ] 12.1 EAS Development Build (APK with dev client)
- [ ] 12.2 EAS App Bundle (production AAB)
- [ ] 12.3 App Store/Play Store closed testing submission
- [ ] Set EAS secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN, POSTHOG_API_KEY
- [ ] Verify `.npmrc` has `shamefully-hoist=true` for cloud build
- [ ] Run `npx expo-doctor` before each build
- [ ] Test: GMS (Google Mobile Services) vs HuaweiMS build variants (task 13.3)

---

## Blockers

### Hard Blockers (Cannot Proceed Without These)
1. **Skia P0 bug**: Must be resolved or feature-flagged before any visual work makes sense
2. **User approval on Self redesign direction**: Need agreement on PulseDashboard vs other concept before implementing

### Soft Blockers (Slow Things Down)
3. **Monorepo duplication**: Making changes to GroupsScreen requires editing in two places until deduplicated
4. **QR routing**: New QR features cannot be added until centralized resolver exists
5. **API duplication**: Bug fixes in API layer require double-patching until consolidated

### Dependency Chain
```
Skia fix → Visual work (header, navbar, self)
QR resolver → New QR features
API deduplication → Reliable API behavior
Library content → Library usefulness
Group chat backend → Group chat UI
```

---

## Clear Action Items by Owner

### For the Human (Naveen — Vision, Taste, Critical Decisions)
- [ ] Approve Self screen redesign direction (PulseDashboard concept — define specific wireframe)
- [ ] Validate Skia fix on real devices (low-end Android + mid-range + flagship)
- [ ] Define specific point values for gamification milestones
- [ ] Curate/collect default content for Library (educational materials, inspirational movies, circulars)
- [ ] Define education-related tags list for Community posts
- [ ] Decide: phone number auth vs email vs magic link (task 13.2) for auth screen redesign
- [ ] Review translation improvements in `TRANSLATION_IMPROVEMENTS.md` and approve
- [ ] Define product rules for classroom role-specific demos
- [ ] Review and approve Community flow UX before implementation

### For the Agent (AI — Architecture, Boilerplate, Pattern Implementation)
- [ ] Skia overlay: implement guarded fallback path, clamps, and feature flag
- [ ] Header + navbar: token audit and redesign implementation
- [ ] `SkeletonLoader.tsx` with shimmer effect (variants: SkeletonCard, SkeletonAvatar, SkeletonTextLine)
- [ ] Accessibility: add labels/roles/hints to all 171 interactive elements missing them
- [ ] Localization: add missing si/ta keys, externalize hardcoded strings
- [ ] QR resolver: centralized payload parser/router
- [ ] API deduplication: migrate to `@repo/core`
- [ ] Group chat: scaffold navigation/state (user approves UX direction first)
- [ ] Community flow shells: create/join/leave/settings/members
- [ ] Error handling normalization: replace raw `Alert.alert` everywhere
- [ ] Notification screen: wire to real data

### Joint Tasks (Agent starts, User finishes)
- [ ] Self screen redesign: Agent implements, User approves emotional/visual direction
- [ ] Classroom role-specific demos: Agent implements, User defines content/product rules
- [ ] Community posting constraints: Agent implements validation, User defines tag taxonomy
- [ ] Library redesign: Agent does UI, User does content curation
