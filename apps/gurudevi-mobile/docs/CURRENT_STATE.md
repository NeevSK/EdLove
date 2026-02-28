# CURRENT STATE: What Gurudevi Is Right Now

> Comprehensive snapshot of the app's current architecture, feature status, known issues, and technical decisions as of March 2026.

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

## Monorepo Structure

```
polymath-platform/
├── apps/
│   └── gurudevi-mobile/           # The mobile app
│       ├── App.tsx                # God component — Providers, auth handshake
│       ├── src/
│       │   ├── screens/           # Screen components (thin shells)
│       │   ├── components/        # App-specific components (some duplicated — see issues)
│       │   ├── navigation/        # TabNavigator, ClassroomStackNavigator
│       │   ├── context/           # EnvironmentContext.tsx
│       │   ├── hooks/             # App-level hooks
│       │   ├── lib/
│       │   │   ├── api/           # PARTIALLY REDUNDANT with @repo/core (known issue)
│       │   │   └── sync/          # SyncManager.tsx, registry.ts
│       │   └── utils/             # LanguageUtils.ts, themeColors.ts, etc.
│       └── docs/                  # All documentation
├── packages/
│   ├── ui/                        # Design system, tokens, shared components
│   │   └── src/
│   │       ├── theme/Theme.ts     # Design tokens (SSOT for all colors/spacing)
│   │       ├── components/        # Shared components
│   │       ├── components-native/ # Skia/native-only (canonical location for Skia)
│   │       └── context/types.ts   # TemporalPhase, etc.
│   ├── core/                      # Supabase client, auth, Zustand store, sync
│   │   └── src/
│   │       ├── api/               # API modules (SSOT — use these, not app duplicates)
│   │       ├── store/useStore.ts  # AppState Zustand store
│   │       ├── lib/               # storage.ts, apiInterceptor.ts, grading.ts, etc.
│   │       ├── hooks/             # useSafeMutation.ts
│   │       └── sync/              # types.ts, useMutationQueue.ts
│   ├── classroom/                 # Classroom domain components + screens
│   ├── community/                 # Community domain
│   ├── library/                   # Library domain
│   ├── profile/                   # Profile domain (UserAvatar, useProfileCompletion, etc.)
│   ├── self/                      # Self/wellbeing domain
│   ├── scanner-kit/               # QR generation + scanning
│   └── design-tokens/             # Token definitions
├── docs/
│   └── plans/                     # Feature design + implementation plans
├── pnpm-workspace.yaml
├── turbo.json
└── .github/workflows/
    └── quality-gate.yml           # CI quality gate (lint + typecheck + test)
```

---

## What Has Been Built and Is Working

### ✅ Authentication System
- Email/password signup and login (simplified — full name and role moved to onboarding)
- Google OAuth sign-in
- Passwordless/Magic Link auth (via Supabase)
- Session persistence via MMKV + AsyncStorage fallback
- Forgot password flow via Supabase password reset
- Onboarding: 5-screen philosophy flow (Name → Role → Welcome → FiveSections → Ecology → Privacy → NavigationGuide)
- Skippable onboarding (screens 3-7 skippable; name + role mandatory)
- `onboarding_completed` flag in user profile
- Role-specific welcome modals for all 5 personas
- Guest mode: "Explore as Guest" entry point with Terms footer
- Zero-flash language initialization (`LanguageUtils.ts` + `SafeZustandStorage`)

### ✅ Environment Engine (`src/context/EnvironmentContext.tsx`)
**The Living Organism** — unified reactive state for all environmental parameters:
- **Role Management**: Teacher, Student, Principal, Admin, Founder, Section Head — same 5-tab structure for all
- **Temporal Theme (6 phases)**: predawn (4-6 AM), dawn (6-9 AM), morning (9AM-12PM), afternoon (12-5PM), dusk (5-8PM), night (8PM-4AM)
- **Language**: English, Sinhala, Tamil with real-time switching and persistence
- **Reality Detection**: Device tier (Low/Medium/High RAM), network quality (offline/poor/fair/good/excellent), data saver mode auto-activates
- **Visual Fidelity**: Auto/Low/High — `useHighFidelity()`, `useShouldAnimate()`, `useShouldLoadHighQualityImages()` hooks
- **The Veil**: Global privacy toggle to instantly mask sensitive data
- **Unit tests**: 26 tests passing (`src/__tests__/context/utils.test.ts`)

### ✅ App Settings Screen (`AppSettingsScreen.tsx`)
- Theme control (Auto/Light/Dark with temporal phase indicator)
- Visual Quality (Auto/Low/High)
- Language selector (English/සිංහල/தமிழ் with native scripts)
- Privacy Veil toggle
- Device information (tier, RAM, network quality, data saver indicator)
- 72px minimum touch targets (exceeds 44px WCAG requirement)

### ✅ 5-Tab Navigation
- Bottom navigation: Self | Classroom | Community | Library | Profile
- `TabNavigator.tsx` with `id="MainTabs"` (required prop)
- `ClassroomStackNavigator.tsx` with `id="ClassroomStack"`
- Role-based content routing (same tabs, different content)
- `LotusPetalFAB.tsx` — context-aware floating action button (consolidated to `@repo/ui`)
- FAB shows context-aware accessibility labels based on active tab

### ✅ Self Section (Wellbeing & Reflection)
All features have complete UI + API + database integration:
- **Mood Lotus** — daily mood check-in (1-5 scale)
- **Fire Journal** — private journaling with "burning" entries philosophy
- **Daily Rhythm** — time-based prompts (morning, afternoon, evening)
- **Joy Jar** — capture breakthrough moments with students
- **Gratitude Glimmers** — daily micro-gratitude entries
- **Wisdom Seeds** — pedagogy insights with tagging
- **Tomorrow's Prep** — daily prep items with completion
- **Energy Forecast** — morning capacity check (1-5)
- **Wind-Down Ritual** — evening reflection prompts
- **Venting Space** — safe frustration expression
- **Daily Content Cards** (`DailyContentCard.tsx`) — rotates at midnight; motivation quotes + "Did You Know?" facts; 40 days seeded (20 motivation, 20 facts)
- Principal view: Decision Journal, School Pulse, Leadership Wisdom, Staff Recognition
- Teacher view: All above + Focus Sanctuary, Reflection Journal
- **⚠️ Issue**: Current Self default view needs redesign ("fucking bad" mood tracker per March tasks)

### ✅ Classroom Section
**Teacher View (Complete):**
- Create/Manage Classrooms (full CRUD)
- Student Profiles (individual + bulk creation)
- Student Notes (private to teacher)
- Attendance Marking (Present/Absent/Late/Excused)
- Attendance History
- Lessons (organized as "Months")
- Assignments (create, distribute, collect)
- Grading System (`GradebookTable.tsx`, `ReportCard.tsx`, `GradeEntryForm.tsx`)
- `TeacherDashboard.tsx` in `@repo/classroom`

**Student View (Complete):**
- View enrolled classrooms
- View lessons and assignments
- Submit assignments
- View grades and attendance history
- Goal tracking with streaks

**Principal View (Partial):**
- View all classrooms school-wide
- School hierarchy (Grades, Sections) via `HierarchyBuilder.tsx`
- Generate invite codes (QR codes)
- `InviteManager.tsx` in both app and `@repo/classroom` (duplication issue)
- ⚠️ Aggregated attendance dashboard: needs work
- ⚠️ Shared photos view: pending

**OCR Scanner:**
- Component exists (`OCRScanner.tsx` in `@repo/classroom`)
- Uses `@react-native-ml-kit/text-recognition`
- Heuristic parser for Sinhala/Tamil/English student register tables
- ⚠️ NOT wired to active UI paths in current screens (orphaned component)

### ✅ Community Section
- **Groups**: School-specific groups + inter-school/global groups
- **Posts**: Discussion threads with media support
- **Comments**: Post responses
- **Sacred Missions (Manifestos)**: School vision statements from Principal
- **Community Feed**: Aggregated from all joined groups
- **Group Details**: `GroupDetailsScreen.tsx` (in both app and `@repo/community` — duplication issue)
- **HorizontalChipRow**: FlatList-backed chip filters (fixed VirtualizedList nesting warning)
- `SanctuaryChip.tsx`, `SanctuaryCarousel.tsx` in `@repo/ui`
- ⚠️ Group chat (WhatsApp-style full functionality): pending
- ⚠️ Polls/voting: pending
- ⚠️ Education-tag required for posts: pending

### ✅ Library Section
- **Library Items**: Resource storage
- **Library Collections**: Teacher personal desks
- **Add Resource** (`AddResourceModal.tsx`): Upload/link resources
- **Browse Resources**: `CollectionCard.tsx` (cover-art style), `SmartShelf.tsx` (horizontal scrollers)
- **Personal Desk**: `deskItems` in Zustand store
- **Verified Badging**: `resource.is_verified` condition
- **Global Search**: Real-time filtering functional
- **Category Chips**: Type-based filtering unified
- **Infinite Scroll**: `onEndReached` pagination functional
- **Resource Pinning**: Principal `is_pinned` action
- ⚠️ Native PDF viewer: links out (not in-app) — `react-native-pdf` pending
- ⚠️ Video player: not implemented — `expo-av` or YouTube component needed
- ⚠️ Share Resource: deep-link generation logic missing
- ⚠️ Offline download: `expo-file-system` integration pending
- ⚠️ Content curation defaults: need to collect/curate content

### ✅ Profile Section
Comprehensive profile system built in Phase 5:
- **IdentityCard.tsx**: Role-aware visual card (role reflects actual user role, not hardcoded)
- **FullProfileScreen.tsx**: Inline editing with pencil icon → green tick (no new screens)
- **UserAvatar.tsx** (`@repo/ui`): Profile photo → initials → role-emoji fallback (`🌱` teacher, `📚` student, `🏛️` principal)
- **SanctuaryProgressBar.tsx** (`@repo/ui`): Reusable, animated completion bar
- **useProfileCompletion()** hook: Unified SSOT from `profileSections.ts` manifest — weighted fields
  - identity: full_name (2), avatar_url (2), phone (1), index_number/nic_number (2)
  - bio: bio (2)
  - professional: experience_years (1), subjects_taught (2), qualifications (2)
- **AvatarDisplay.tsx**: Tap-to-edit with `expo-image-picker`, Supabase Storage upload
- **AchievementUnlockOverlay.tsx**: Celebration animation at 100% completion
- **ThuthimalBadge.tsx**: Full + compact modes; `is_thuthimal`, `thuthimal_gifter` fields in `users`
- **AchievementGallery.tsx**: Animated badge gallery
- **LogoutModal.tsx** (`@repo/ui`): Sanctuary-themed; replaces `Alert.alert`
- **DeleteAccountModal.tsx**: GDPR-compliant multi-step purge
- **AppSettingsScreen.tsx**: All universal settings consolidated
- **ProfileCompletion tracking**: `trackingAPI.logFeatureUsage('section_profile')`
- **FadeInDown staggered animations**: All sections (delays 100-750ms)
- ⚠️ In-app notifications history: NotificationsScreen pending
- ⚠️ Personal connectivity (WhatsApp/tel: deep links): pending

### ✅ Invitation & QR System
- Invite code generation (GURU-ABC123-TEACH format)
- QR code generation (custom SVG via `qrcode` + `react-native-svg`, ECC level H)
- QR scanning (`ScannerModal.tsx` with live camera + gallery fallback via `jsqr` + `jpeg-js`)
- Invitation genealogy (who invited whom)
- Invitation tracking in `invitations` table
- ⚠️ QR payload routing: CRITICAL GAP — no centralized resolver; `join-class:`, `join-group:`, raw UUIDs, invite codes all with different handlers (score 47/100)
- ⚠️ `join-group:` QR generated but no consumer path found
- ⚠️ Principal `InviteManager` QR modal state stored but not rendered (button appears to do nothing)

### ✅ Offline Architecture
- `useMutationQueue.ts` (`@repo/core`): Zustand store persisted to MMKV key `'gurudevi-mutation-queue'`
- `SyncManager.tsx` (app): Headless component; replays queue when online + queue > 0
- `useSafeMutation.ts` (`@repo/core`): Detects offline, queues to outbox, returns optimistic null
- `MUTATION_REGISTRY` (app): Maps string keys to async API functions
  - 'createPost', 'createInventoryRequest', 'createResource', 'toggleResourcePin', 'deleteResource', 'saveJournalEntry', 'saveDecision'
- `NetworkStatusBanner.tsx`: Red (offline + pending count), Blue/Saffron (syncing)
- ⚠️ Idempotency keys: planned in claude_sync_plan.md but implementation status unclear
- ⚠️ Dead Letter Queue: planned but not confirmed as built
- ⚠️ Background sync via `expo-background-fetch`: pending

### ✅ Storage Architecture (Hybrid Persistence)
- **Primary**: `react-native-mmkv` (JSI, synchronous, ultra-fast)
- **Fallback**: `RobustAsyncStorage` (for Expo Go; in-memory cache + AsyncStorage background persistence)
- `SafeZustandStorage`: Zustand middleware wrapping MMKV/AsyncStorage
- `StorageKeys` enum: USER_PREFERENCES, LAST_SYNC, CACHED_COMMUNITY_POSTS, CACHED_GROUPS
- **Zustand AppState persisted**: user, userRole, schoolType, themeMode, onboardingCompleted, isExplorerMode, dismissedSampleIds, deskItems

### ✅ Monitoring & Analytics
- **Sentry** (`packages/core/src/monitoring/sentry.ts`): Error tracking
- **PostHog** (`packages/core/src/monitoring/posthog.ts`): Product analytics, privacy-friendly
- ⚠️ PostHog useNavigationState error: PostHogProvider must be inside NavigationContainer (may be fixed)
- `apiInterceptor.ts`: Global error mapper — maps technical errors to Sanctuary-friendly messages; integrates with PostgREST codes (23505, 23503, 42P01, 42501)

### ✅ Internationalization (i18n)
- **English**: 763 leaf keys (baseline)
- **Sinhala**: 587 keys present (76.9% coverage, 176 missing)
- **Tamil**: 567 keys present (74.3% coverage, 200 missing)
- `LanguageUtils.ts`: Persistent locale using SafeZustandStorage; zero-flash on boot
- Default language: Sinhala
- ⚠️ 44.7% of .tsx files (38/85) have no `t(...)` usage
- ⚠️ 272 potential hardcoded UI literal strings detected

### ✅ Testing Infrastructure
- **BDD**: `jest-cucumber` with Gherkin `.feature` files
- **Web-First Strategy**: `@testing-library/react` + `react-native-web` (bypasses native invariant errors)
- **Passing tests**: 26 unit tests for EnvironmentContext utils
- **BDD coverage**: Auth Refinement, Invitation System, Onboarding (all passing)
- ⚠️ Classroom Management: pending BDD retrofit
- ⚠️ Library Uploads: pending BDD retrofit
- ⚠️ E2E testing (Detox): not set up
- ⚠️ Accessibility testing (`@axe-core/react-native`): not set up

### ✅ CI/CD
- `quality-gate.yml` GitHub Action: runs on every PR
- `pnpm check-all`: lint + check-types + test in one command
- 5-tier branching: main-innovate → main-dev → main-QA → main-preview → main

---

## Current Architecture State

### Navigation Flow
```
App.tsx
├── EnvironmentProvider
├── GluestackUIProvider
├── NavigationContainer (+ navigationRef)
│   ├── PostHogProvider (inside NavigationContainer)
│   └── QueryClientProvider
│       ├── Auth check → supabase.auth.getSession()
│       ├── No session → WelcomeScreen → OnboardingScreen → AuthScreen
│       └── Session → MainTabs (TabNavigator)
│           ├── Self Tab → SelfScreen (role-specific views)
│           ├── Classroom Tab → ClassroomStackNavigator
│           ├── Community Tab → CommunityScreen
│           ├── Library Tab → LibraryScreen
│           └── Profile Tab → ProfileScreen
└── SyncManager (headless, watches isOnline + queue)
```

### State Architecture (Zustand AppState)
```typescript
{
  user: User | null,
  userRole: UserRole | null,
  teacherName: string,
  schoolType: SchoolType | null,
  themeMode: 'light' | 'dark' | 'auto' | 'system',
  toast: { message, type, visible },
  onboardingCompleted: boolean,
  justFinishedOnboarding: boolean,
  isDemoMode: boolean,
  isExplorerMode: boolean,
  isBridging: boolean,
  isOnline: boolean,
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline',
  dismissedSampleIds: string[],
  deskItems: DeskItem[],
  demoLogs: [...],
}
```

### API Layer
- **Primary API** (`packages/core/src/api/`): assignments, attendance, auth, classroom, classroomStudents, demo, demoProvider, grading, groups, inventory, lessonMaterials, resources, rewards, sacredMissions, teacher, tracking, onboarding, school, agents, thuthimal, dailyContent
- **App-level proxy** (`apps/gurudevi-mobile/src/lib/api/index.ts`): Composes from package modules (`@repo/core`, `@repo/library`, `@repo/community`, `@repo/self`)
- ⚠️ **Redundant**: `src/lib/api/*.ts` files with 0.95-0.998 similarity to `packages/core/src/api/*`

### Design System State
- **Color palette**: Sanctuary colors defined in `packages/ui/src/theme/Theme.ts`
  - Foundation: Vellum (#F5EDD6), Saffron (#D4843A/#C4956A), Dalu Green (#8BBF7A), Aurora (#7DD4C0), Lotus Pink (#E8A0B0), Ink (#2A2318)
  - Shadow: Shadow Violet `rgba(107,100,128,x)` — ALL shadows (never rgba(0,0,0,x))
  - Never use pure #FFFFFF or #000000
- **Living Theme System**: 6-phase × 2-theme matrix in Theme.ts
  - `Theme.phases[phase][themeMode]` = { gradientNodes, glass, glow, accent, text }
  - `useTheme()` hook for all components
- **Glass Protocol**: BlurView + Theme.colors.glass — structural depth, not decoration
- **Typography**: Sinhala needs 1.8x line height; device-appropriate font loading
- ⚠️ **Skia NoiseOverlay**: BUG — renders as dark opaque rectangle (P0 fix needed)

---

## Feature Completeness Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (email/password/OAuth) | ✅ Complete | |
| Auth (passwordless/magic link) | ✅ Complete | |
| Onboarding flow | ✅ Complete | 5 screens |
| Guest mode (explore) | ✅ Complete | |
| Self: Mood Lotus | ✅ Complete | Redesign needed |
| Self: Fire Journal | ✅ Complete | |
| Self: Daily Rhythm | ✅ Complete | |
| Self: Joy Jar | ✅ Complete | |
| Self: Gratitude Glimmers | ✅ Complete | |
| Self: Wisdom Seeds | ✅ Complete | |
| Self: Daily Content Cards | ✅ Complete | 40 days seeded |
| Self: Energy/Wind-Down/Venting | ✅ Complete | |
| Classroom: Lessons | ✅ Complete | |
| Classroom: Assignments | ✅ Complete | |
| Classroom: Attendance | ✅ Complete | |
| Classroom: Grading | ✅ Complete | |
| Classroom: Student Profiles | ✅ Complete | |
| Classroom: Bulk Student Create | ✅ Complete | |
| Classroom: Photo Upload | ⚠️ Partial | Storage upload works, UI polish needed |
| Classroom: Principal Dashboard | ⚠️ Partial | Aggregated views pending |
| Classroom: OCR Scanner | ⚠️ Orphaned | Component built, not wired to UI |
| Community: Groups | ✅ Complete | |
| Community: Posts | ✅ Complete | |
| Community: Sacred Missions | ✅ Complete | |
| Community: Group Chat | ❌ Pending | WhatsApp-style needed |
| Community: Polls | ❌ Pending | Beta feature |
| Community: Education tags required | ❌ Pending | |
| Library: Browse/Collections | ✅ Complete | |
| Library: Personal Desk | ✅ Complete | |
| Library: SmartShelf/CollectionCard | ✅ Complete | |
| Library: In-app PDF viewer | ❌ Pending | Links out currently |
| Library: Video player | ❌ Pending | |
| Library: Offline download | ❌ Pending | |
| Profile: IdentityCard | ✅ Complete | |
| Profile: FullProfile (inline edit) | ✅ Complete | |
| Profile: UserAvatar | ✅ Complete | Initials + role-emoji fallback |
| Profile: Progress Bar (SSOT) | ✅ Complete | |
| Profile: Thuthimal Badge | ✅ Complete | |
| Profile: Achievement Gallery | ✅ Complete | |
| Profile: LogoutModal | ✅ Complete | Sanctuary-themed |
| Profile: DeleteAccount | ✅ Complete | GDPR-compliant |
| QR Generation | ✅ Complete | SVG, ECC-H |
| QR Scanning | ✅ Complete | Camera + gallery fallback |
| QR Unified Routing | ❌ Pending | Critical gap |
| Invitation system | ✅ Complete | Genealogy tracking |
| Offline sync (outbox) | ✅ Complete | |
| Environment Engine | ✅ Complete | 6 pillars |
| Living Theme (6-phase) | ✅ Complete | Token matrix |
| Skia NoiseOverlay | 🔴 Bug | Dark rectangle rendering |
| i18n (en/si/ta) | ⚠️ Partial | si: 76.9%, ta: 74.3% |
| Accessibility (WCAG AA) | 🔴 Critical | 5/100 score |
| Real Notifications | ❌ Pending | Currently hardcoded |
| Push Notifications | ❌ Pending | |
| In-app PDF viewer | ❌ Pending | |
| EAS Production Build | ⚠️ Not done | Build workflow exists |
| App Store submission | ❌ Pending | |

---

## Known Bugs and Issues

### 🔴 Critical (Blocking)
1. **Skia NoiseOverlay dark rectangle** — Renders as full-screen opaque dark fill. P0 fix with feature flag needed. Located in `packages/ui/src/components-native/`.
2. **Accessibility score 5/100** — 175 interactive elements, only 4 with explicit `accessibilityLabel`/`accessibilityRole`. Legal liability. WCAG 2.1 AA violations everywhere.
3. **QR routing fragmented** — No centralized resolver. `join-class:`, `join-group:`, raw UUID, invite codes with no unified parser. Principal InviteManager QR state stored but not rendered. `join-group:` payloads generated but no consumer. Score 47/100.

### 🟠 High Priority
4. **src/lib/api/* redundancy** — High similarity (0.95-0.998) with `packages/core/src/api/*`. Bug fixes must be patched in two places.
5. **Localization gaps** — 176 missing Sinhala keys, 200 missing Tamil keys, 272 hardcoded strings, 44.7% of screens with no `t()` usage.
6. **VirtualizedList nesting** — Some screens still may have ScrollView wrapping FlatList horizontally (CommunityScreen partially fixed).
7. **PostHog useNavigationState error** — PostHogProvider must be inside NavigationContainer. Status: possibly fixed.
8. **Self screen default view** — Current default described as "fucking bad" in March tasks; needs redesign.
9. **Mood tracker UI** — Current implementation needs redesign.

### 🟡 Medium Priority
10. **LotusPetalFAB duplication** — App version (complex PanResponder) vs `@repo/ui` version (simpler). Need harmonization.
11. **GroupsScreen/GroupDetailsScreen/CreatePostModal duplication** — Both in app and `@repo/community`.
12. **useTheme/useAccessibility/useInventory hooks duplicated** — Between app and packages.
13. **OCR scanner orphaned** — `OCRScanner.tsx` exists in `@repo/classroom` but no active usage path in screens.
14. **BulkStudentCreation orphaned** — Component exists but usage references absent.
15. **Real notifications** — `NotificationsScreen.tsx` shows hardcoded data.
16. **Principal QR modal** — `qrCodeData` state in InviteManager stored but no modal renders it.
17. **Teacher QR join bug** — Does `api.classrooms.update(classId, { teacher_id: user.id })` which overwrites teacher ownership rather than creating membership link.
18. **Global header** — Needs premium redesign, avatar spacing fix, theme alignment.
19. **Bottom navbar** — Needs premium redesign, theme alignment.
20. **Profile screen** — Logout/delete modals need modern premium redesign.

### 🟢 Minor
21. **OCR preprocessing missing** — No deskew, binarization, denoise, contrast normalization. Score 34/100.
22. **Bio-Resonance Layer deferred** — Adaptive haptics (Day/Night) and Visual Unfolding (petal-like) animations not implemented.
23. **Library content** — Need to collect/curate defaults for the library.
24. **Font strategy** — `FONT_STRATEGY.md` and `FONT_SETUP.md` exist; verify Sinhala/Tamil fonts load correctly with 1.8x line height.

---

## Current Technical Decisions

### Confirmed Architecture Decisions
1. **Skia location**: `packages/ui/src/components-native/` — import as `@gurudevi/ui/native`
2. **UI imports**: Always via `@repo/ui` or `@/ui` — never direct `@gluestack-ui/themed`
3. **State**: Zustand for global; TanStack Query for server state; MMKV for persistence
4. **Shadows**: Shadow Violet `rgba(107,100,128,x)` exclusively — no `rgba(0,0,0,x)` anywhere
5. **Colors**: Vellum (#F5EDD6) as warm ground (never #FFFFFF); Ink (#2A2318) for text (never #000000)
6. **Glass/blur**: Either below 12 (intentionally transparent) OR above 36 (frosted) — never 16-28 (muddy)
7. **API SSOT**: `packages/core/src/api/*` — migrate app `src/lib/api/*` to these
8. **Design Master governance**: `docs/Core/design/GURUDEVI_DESIGN_MASTER.md` — implementation truth beats docs
9. **Branching**: main-innovate → main-dev → main-QA → main-preview → main
10. **Conflict resolution**: attendance/classroom = last-write-wins; self = client-wins; community = server-wins
