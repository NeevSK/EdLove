# FUTURE ROADMAP: Gurudevi's Path Forward

> Full roadmap from current state to Alpha → Beta → Launch, synthesized from all planning documents.

---

## Short Term: Next 2 Weeks (March 2026)

### Week 1: Stabilize & Polish
**Theme**: Fix blockers, premium UI foundation

| Priority | Task | Owner | Effort |
|----------|------|-------|--------|
| P0 | Skia NoiseOverlay fix (feature flag, guarded rollout) | Joint | M |
| P1 | Global Header premium redesign (no hardcoded colors) | Agent | M |
| P1 | Bottom navbar premium redesign + token alignment | Agent | M |
| P1 | Self screen: remove timetable, redesign default view | Joint | M |
| P1 | Mood tracker complete overhaul | Joint | S |
| P1 | Profile modals: premium Logout + Delete Account redesign | Agent | S |
| P2 | Community: minimal redesign of default view | Agent | S |

### Week 2: Core Feature Flows
**Theme**: Community functionality, Classroom improvements

| Priority | Task | Owner | Effort |
|----------|------|-------|--------|
| P2 | Community: create/join/leave/settings/members shell | Agent | L |
| P2 | Community: education tag required for posts | Agent | M |
| P2 | Classroom: student-specific demo view (replace teacher demo) | Joint | M |
| P2 | Classroom: principal-specific demo view | Joint | M |
| P2 | Library: minimal redesign + FAB z-index fix | Agent | M |
| P3 | Error handling normalization (replace all Alert.alert) | Agent | M |
| P3 | Skeleton loaders (SkeletonCard, SkeletonAvatar, SkeletonTextLine) | Agent | S |

---

## Medium Term: Next Month (April 2026)

### Accessibility Overhaul (WCAG AA Compliance)
Currently **5/100** — critical gap. Legal and ethical requirement.

**Phase 1 Foundation:**
- Add `accessibilityLabel`/`accessibilityRole`/`accessibilityHint` to ~171 missing interactive elements
- Priority order: WelcomeScreen → OnboardingScreen → AuthScreen → SelfScreen → LibraryScreen → ClassroomScreen → ProfileScreen
- Add `accessibilityState` for all toggles
- Add `accessible={true}` grouping for related content
- Verify 44px+ touch targets everywhere (72px target for critical controls)
- Implement `useAccessibility` hook with `isReduceMotionEnabled` checks for all animations

**Phase 2 Automation:**
- `eslint-plugin-react-native-a11y` lint gates active in CI
- Screen-reader smoke tests in release checklist
- Accessibility testing in `pnpm check-all`

### Localization Completion (Production-Ready)
Currently **70/100** for average si/ta coverage.

**Actions:**
- Add 176 missing Sinhala keys to `i18n/locales/si.json`
- Add 200 missing Tamil keys to `i18n/locales/ta.json`
- Externalize top 272 hardcoded strings across 85 screens
- Review translation quality per `TRANSLATION_IMPROVEMENTS.md` (natural Sri Lankan idioms, not robotic Google Translate)
- Key improvements: Sinhala "හිතේ බර ඉවත් කරගන්න" > "දවසේ බර මුදා හරින්න"; Tamil "மனம் சொல்லுங்கள்" > "பாரம் இறக்கு"
- Establish localization owner for translation workflow SLA

### QR Flow Unification (Score 47/100 → 90+)
Finite refactor sprint (6-10 weeks total, overlapping with other work):

1. **Contract freeze (Week 1)**: Canonical payload schema: `{ type, payload, version }` — types: join-class, join-group, invite-teacher, invite-student, profile-connect, resource-share
2. **Central resolver (Weeks 2-5)**: Parse → validate → authorize → dispatch routing
3. **Migrate all scanners** to route through resolver
4. **Fix incomplete surfaces**: Principal InviteManager QR modal, join-group consumer path
5. **Fix Teacher QR join security bug**: membership link instead of `classrooms.update({ teacher_id })`
6. **Sharing**: render QR to image + `expo-sharing` + deep-link generation
7. **Backward-compatible parser** for legacy payload formats
8. **CI enforcement**: Block new QR payload formats not going through resolver

### Monorepo Deduplication (API + Components)
Finite cleanup sprint:

1. **API first**: Migrate `src/lib/api/*.ts` to `@repo/core` APIs; delete redundant files
2. **Community components**: Consolidate GroupsScreen/GroupDetailsScreen/CreatePostModal/ReportPostModal to `@repo/community`
3. **LotusPetalFAB harmonization**: Merge advanced features (PanResponder) into `@repo/ui` version
4. **Hook cleanup**: `useTheme/useAccessibility` → `@repo/ui`; `useInventory` → `@repo/classroom`
5. **CI enforcement**: Import boundary linting to prevent re-duplication

### Group Chat Implementation
WhatsApp-style full group chat:

- Backend: Supabase Realtime for live messages; `group_messages` table
- UI: `ChatScreen.tsx` — message bubbles, input bar, attachment support
- Features: text messages, image sharing, file attachments (Cloudinary)
- Message delivery status indicators
- Unread message count badges
- Push notifications for new messages

### Real Notifications System
Complete end-to-end notification system:

- Supabase Realtime subscription to `notifications` table
- Notification types: assignment_created, grade_posted, community_post, invitation_received, manifesto_updated, student_stuck_signal, group_message
- `NotificationsScreen.tsx`: real data, paginated history, mark as read
- Push notifications: `expo-notifications` + APNs/FCM setup
- Notification badge on Profile tab icon
- Bi-directional signals: student "Stuck" → teacher notification; teacher "Reality Check" → principal notification

### Library: OCR Improvements
Currently **34/100** — needs image preprocessing:

- **Preprocessing pipeline**: deskew, perspective correction, adaptive binarization, denoise, contrast normalization, region segmentation
- **Parser hardening**: per-line confidence scores, language-model correction pass, structured table reconstruction, duplicate name handling
- **Integration**: Wire `OCRScanner.tsx` to active UI paths in Classroom → BulkStudentCreation
- **Benchmark**: Create test set of printed Sinhala/Tamil registers to measure accuracy

### Library: Content Acquisition Pipeline
Currently empty — need to populate:

- Content types: movies (inspirational trailers), government circulars, news updates, lesson plans, papers, books, maps/visualizations, short notes, mind maps
- Teacher upload portal (currently works — needs UX polish)
- Verification system for peer-approved content
- Resource forking/remixing: teachers can "Fork" a collection and customize it (track lineage/pedigree)
- Flash-Play mode: expand resource in mini bottom-sheet preview without losing search context
- Collaborative Shadow Shelves: private study groups with shared resource shelves
- AI-assisted discovery: "You're planning a lesson on Gravity. I've found 3 top-rated simulations in the Sanctuary."

---

## Long Term: 3-6 Months (April–September 2026)

### Alpha → Beta Milestones

#### Alpha Release (March–April 2026)
**Goal**: Polished, functional app for closed testing with selected schools

**Requirements:**
- ✅ Auth system (all flows functional)
- ✅ 5-tab structure with role-based content
- ✅ Teacher: Full classroom workflow (lessons, attendance, grading)
- ✅ Student: Enrolled classroom view + submissions
- ✅ Principal: School hierarchy + staff management
- ✅ Community: Groups + Feed + Sacred Missions
- ✅ Library: Basic browsing + upload
- ✅ Self: All wellbeing features
- ✅ Offline sync (outbox pattern)
- 🔄 Accessibility: WCAG AA compliance (in progress)
- 🔄 QR flows: Unified routing (in progress)
- ❌ Real notifications: Supabase Realtime wired
- ❌ Group chat: Basic messaging
- ❌ EAS production build + App Store/Play Store closed testing

**Alpha success metrics (quantitative):**
- App launch time < 3s on low-end Android
- 60fps scrolling on all screens
- App size < 20MB (monitor as features are added)
- WCAG AA compliance > 80% (from current 5%)
- Localization coverage > 90% for si/ta

**Alpha success metrics (qualitative):**
- Teachers feel "seen" and energized (not drained)
- Reduces administrative friction
- Culturally resonant (natural Sinhala/Tamil, lotus metaphor)
- Works offline reliably

#### Beta Release (May–June 2026)
**Goal**: Feature-complete app tested with 3-5 real schools in Sri Lanka

**New features for Beta:**
- Group chat (full WhatsApp-style functionality)
- Push notifications (APNs + FCM)
- OCR improvements (preprocessing pipeline)
- PDF viewer (native in-app via `react-native-pdf`)
- Video player (in-app streaming via `expo-av`)
- Resource sharing with deep links
- Principal aggregated dashboards (attendance patterns, mood analytics — anonymous)
- Timetable system (moved from Self to Classroom)
- Multi-year student data (when students change classes annually)
- Thuthimal automation: In-app gifting UI + payment gateway
- QR: Full unified routing + sharing

**Beta security requirements:**
- All RLS policies audited and confirmed
- API authorization checks on 100% of endpoints
- No ID-guessing attacks possible
- Privacy audit: grade, salary, contact data masked when The Veil is active
- Security regression tests for privilege escalation

#### Launch / v0.1 GA (July–August 2026)
**Goal**: Public launch to Sri Lankan school market

**Required for launch:**
- App Store (iOS) submission + approval
- Google Play Store submission + approval (including HuaweiMS variant if needed)
- PayHere SDK integration (Sri Lanka payment gateway)
- Pricing tiers: Free, Pro (LKR 1,500/month), Premium (LKR 3,000/month)
- Thuthimal automated gifting (alumni → teacher Pro subscriptions)
- School admin panel (web) for mass onboarding
- Privacy policy + Terms of Service (live pages, linked in app)
- GDPR/PDPA compliant data handling
- Full localization: si/ta/en 100% coverage
- Accessibility: WCAG 2.1 AA certified
- Production monitoring: Sentry error rates, PostHog analytics dashboards

### Feature Backlog (v0.5 — Beta+)

#### Principal & Administrative Features
- **Leave Management**: Staff sick/casual/annual leave submission + principal approval portal
- **Timetable Generation**: Agentic timetabling with conflict resolution
- **Staff Attendance**: Daily check-in/out logging
- **Bulk Data Upload**: CSV import for student and staff records
- **Institutional Calendar**: School-wide events + holidays
- **QR School Card**: Unique school code for kiosks and displays
- **Department Tree**: Visual organizational chart
- **Classroom Observation**: Walk-through feedback system
- **Inventory & Resources**: Classroom equipment needs dashboard
- **Report Generation**: Auto-generate student progress reports
- **Letter Templates**: Standard academic correspondence

#### Library Ecosystem (Full Vision)
- **The Personal Desk** fully offline-first with auto-sync
- **Resource Remixing/Forking**: Evolutionary map tracking lineage
- **Smart Summaries**: AI 3-bullet summaries for long PDFs
- **Knowledge Bridges**: AI identifies connections between desk items ("This video matches yesterday's worksheet")
- **FTS/Vector Search**: Full-text + semantic search across library
- **Export pipeline**: OCR text → PDF/MD/TXT/DOCX
- **Document ingestion queue**: Status/retry/audit metadata
- **Popularity analytics**: Most-pulled, most-endorsed, trending by subject

#### Community Ecosystem (Full Vision)
- **"Vision Cycle"**: Principal Manifesto → Teacher Endorsement → Student Group → Community Feed
- **Cross-school/Inter-school groups**: National Science Olympiad, React Developers, etc.
- **Anonymous posts**: Safe space for sensitive community discussions
- **Polls and forms**: Quick institutional feedback gathering
- **Event broadcasting**: School-wide events promoted to feed
- **Community moderation**: Report → review queue → ban/restrict
- **Resonance Filter**: View feed based on "Positive Resonance" educational tags

#### Cybernetic Feedback System (Advanced)
From `agentic_vision_2026.md` and Phase 4 philosophy:
- **Student "Stuck" Signal**: Student can anonymously signal "I'm stuck" → Teacher sees notification with Support Proposal
- **Teacher "Reality Check"**: Teacher can signal capacity issues to Principal → Principal sees Support Proposal (not complaint)
- **Aggregated Wellbeing Pulse**: Anonymous mood tracking aggregated for Principal (never individual teacher data exposed)
- **Affective Loop Repair**: System detects "Vibe Shifts" and suggests structural interventions
- **Resource Flow Repair**: When overloaded teacher spotted, suggest relief redistribution

#### AI Assistant Integration
- **Shadow Agent (Orb Entry)**: Context-aware contemplative assistant accessible from Self tab
- **Socratic Prompting**: AI suggestions for classroom discussions
- **AI Insights Summary**: Weekly "Wisdom Seeds" evolving based on teacher's interaction patterns
- **Retrospecitlve Prompts**: AI-generated guided review prompts for weekly school reflection
- **Contextual Thought Seeds**: Role-specific reflection questions
- **Predictive Burnout Detection**: AI flag when usage patterns suggest burnout risk

#### Gamification (Phase 2)
*Non-extractive — aligned with Thuthimal/Gratitude economy*
- Hidden achievements scattered across app
- Exploration tracker (% of app explored)
- Achievement gallery with animated unlocking
- Profile completion celebration (AchievementUnlockOverlay already built)
- Teacher recognition ("Staff Recognition" quick-actions for Gratitude Gifts)
- Community recognition wall (achievements on "stone tablets" aesthetic)

### Technical Debt Items

#### Critical Technical Debt
1. **A11y 5/100 → 90+**: ~171 interactive elements needing accessibility metadata
2. **Localization 70/100 → 100%**: 376 missing keys (si + ta), 272 hardcoded strings
3. **QR routing fragmentation**: Centralized resolver needed; 6+ independent handlers
4. **src/lib/api duplication**: Near-fork of packages/core/src/api — double maintenance burden
5. **Component duplication**: GroupsScreen, GroupDetailsScreen, LotusPetalFAB, useTheme, useInventory

#### Architecture Debt
6. **OCR no preprocessing**: Raw image → MLKit without deskew/binarization (poor accuracy for handwritten Sinhala/Tamil)
7. **Type safety**: Widespread `any` usage in API/hooks; needs runtime validators (zod) at API ingress
8. **No E2E tests**: Detox not configured; zero end-to-end test coverage
9. **PDF viewer links out**: Native in-app PDF viewer (`react-native-pdf`) not integrated
10. **Video player missing**: `expo-av` or YouTube component not integrated

#### Performance Debt
11. **Component size**: Large feature components mixing data fetching + orchestration + rendering; need container/presentational split
12. **Memoization**: Heavy screens need `useMemo`/`useCallback` audit (beyond GradebookTable, ReportCard which already have it)
13. **Bundle size**: No CI gate for bundle size — add to `pnpm check-all`
14. **Render timing**: No CI gate for render performance on key screens (auth, classroom list, library browse)

#### Security Debt
15. **API authorization**: All API endpoints need `requireAuth()` at start; verify 100% coverage
16. **RLS audit**: Full table-by-table verification of `school_id` isolation policies
17. **QR ownership bug**: Teacher QR join overwrites `teacher_id` instead of creating membership
18. **Error messages**: Ensure no sensitive information leaked in error responses
19. **Data saver**: "No Image" mode placeholder only — needs real implementation

---

## Living Theme System (v0.5+ Vision)

The `gurudevi-skia-implementation.md` describes the full visual vision:

- **Skia NoiseOverlay**: Subtle grain texture over gradients (when P0 bug fixed)
- **AnimatedGradientMesh**: Smooth gradient transitions as temporal phase shifts
- **LivingGlow protocol**: `PostCard` and `CollectionCard` focal points pulse with breath-like rhythm
- **Temporal Fluidity**: Components consume `useThemedColors` with temporal phase integration
- **Glass Protocol**: `BlurView` + structural glass tokens — layered sanctuary depth
- **Bio-Resonance Layer** (still deferred):
  - Adaptive Haptics: Crisp/Impact haptics for Day; Soft/Breathing haptics for Night
  - Visual Unfolding: `UnfoldingView` wrapper — petal-scaling animation for all major card mounts
  - Ecosystem Pulsing: `LotusPetalFAB` glimmers on student "Stuck" signals or received Thuthimal

---

## Gurudevi v1.0 Vision

**From `NORTH_STAR.md` and `GURUDEVI_ARCHITECTURE_v5_0.md`:**

v0.1 (Alpha): Cloud-first, core Teacher/Student flows, RLS lockdown  
v0.5 (Beta): Thuthimal automation, OCR hardening, Principal dashboards, group chat  
v1.0 (GA): Hybrid Sync (Local SQLite + Cloud Sync), E2E Encryption for sacred reflections, PayHere billing, full AI assistant

**By v1.0, Gurudevi will be:**
- The go-to platform for Sri Lankan school educators
- Trilingual, fully accessible, offline-first
- A Gratitude Economy (Thuthimal) enabling alumni to honor teachers
- An Educational Ecology (not an LMS) — repairing broken feedback loops
- Technology that restores energy rather than extracting it
- Sacred technology honoring 2000 years of Sri Lankan teaching wisdom — ජයවේවා 🪷
