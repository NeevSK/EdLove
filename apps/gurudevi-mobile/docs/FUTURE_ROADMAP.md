# FUTURE ROADMAP: Gurudevi's Path Forward

> Full roadmap from current state to Alpha → Beta → Launch, synthesized from actual code state + first-principles product thinking.
> This roadmap answers: **What is Gurudevi building, in what order, and why?**
>
> Not "fix UI then add features" — but "make the core loop work perfectly, then add depth, then breadth."

---

## North Star & Core Loop

**Gurudevi's core value proposition:**
> A teacher-centric platform that reduces administrative burden, restores teacher energy, connects the school community, and personalizes student learning — in the Sri Lankan educational and cultural context.

**The fundamental loop that must work perfectly:**
```
Teacher joins/creates school
    → Creates classroom + adds students
    → Marks attendance daily (reduces friction to < 30 seconds)
    → Assigns and grades work
    → PulseDashboard shows what actually needs attention today (REAL data)
    → Connects with colleagues in Community groups
    → Reflects and recharges in Self section
    → Loop repeats daily, becoming habit
```

**Why this loop matters above all else:**
If any step in this loop is broken, unclear, or frustrating, teachers abandon the app. The beautiful Sanctuary theme, the Living Theme System, the 6-phase ambient shifts — none of it matters if the core loop has friction or fake data.

**What makes teachers stay after week 1:**
- PulseDashboard shows real, actionable data (not fake tasks)
- Community group chat (they talk to each other = they come back)
- Self section feels like a genuine sanctuary, not a check-box
- The app works offline without losing data

**What makes the platform unique vs competing LMSes:**
1. **Thuthimal** — the gratitude economy. Alumni honor teachers. No other LMS has this.
2. **Self section** — teacher wellbeing as a first-class feature. Not an add-on.
3. **Trilingual from day 1** — English, Sinhala, Tamil. Sri Lankan cultural DNA.
4. **Living Theme** — 6-phase temporal ambient shifts. The app breathes with the day.
5. **Community as ecosystem** — cross-school groups, Sacred Missions, inter-school collaboration.

---

## Now (Current Sprint — March 2026): Stabilize the Core Loop

**Theme**: Make what's built actually work. Fix the trust-breaking gaps. Close the distance between what docs claim and what code does.

### Week 1: Product Viability Fixes (TIER 0)

| Task | Why | Effort | Code Location |
|------|-----|--------|---------------|
| Verify all DB migrations applied in prod | Silent data failures without this | S | Supabase dashboard |
| End-to-end new school journey validation | Core loop must work before anything else | M | Full app flow |
| Fix PulseDashboard hardcoded action items | Trust destroyed on day 1 if fake | M | `src/components/PulseDashboard/` |
| Wire FAB actions (all console.log today) | Dead buttons on every screen | S | `App.tsx getFabActions()` |
| Fix Teacher QR join (ownership overwrite bug) | Data corruption in real schools | S | `packages/classroom/` QR handler |
| Fix Principal InviteManager QR not rendering | Can't invite teachers without it | S | `InviteManager.tsx` |

### Week 2: Core Value Delivery (TIER 1)

| Task | Why | Effort | Code Location |
|------|-----|--------|---------------|
| Wire SleepTracker/RemindersManager/VoiceJournaling | Built but invisible — wasted work | S | `packages/self/TeacherSelfView.tsx` |
| Audit NotificationDrawer data (hardcoded?) | Notifications are re-engagement | S | `NotificationDrawer.tsx` |
| Attendance flow: reliability check | Daily teacher workflow must be bulletproof | S–M | `packages/core/src/api/attendance.ts` |
| Assignment/Submission/Grading: reliability check | Second daily workflow | M | Classroom + core API |
| Fix join-group QR consumer path | Groups are inaccessible via QR | M | `QRResolver.ts`, `QRHandlerScreen` |
| PulseDashboard UX polish (real data required first) | Morning home screen must feel sacred | M | `PulseDashboard/` |

---

## Short Term (April 2026): Deepen Core Value

**Theme**: Make the app deeply valuable for the teachers who adopted it. Add the stickiness features. Fix the most visible UX gaps.

### Community: Group Chat (The Retention Engine)
Currently **ZERO code exists**. This is the most important new feature for retention.

- **DB migration**: `group_messages` table (`id, group_id, user_id, content, type, created_at`)
- **Backend**: Supabase Realtime subscription on `group_messages`
- **UI**: `GroupChatScreen.tsx` in `packages/community/` — message bubbles, input bar
- **Navigation**: Wire "Chat" button in GroupDetailsScreen to GroupChatScreen
- **Features for v1**: Text messages, image sharing, message delivery status
- **Future**: File attachments, read receipts, unread count badges, push notifications for messages

### Library: Solve the Cold Start Problem
New schools see an empty library. This must be fixed before launch.

- **Add `is_default` flag** to `library_items` table
- **Seed 20–30 curated resources**: Sri Lankan curriculum-aligned lesson plans, inspirational educator videos, government circulars, subject reference materials
- **Human task**: Naveen curates actual content (agent implements the mechanism)
- **Flash-Play preview**: Expand resource in mini bottom-sheet without losing search context

### OCR: At Least One Real Provider
Currently all providers are skeleton stubs. Implement `MLKitProvider` (free, on-device, offline-capable).

- Wire `@react-native-ml-kit/text-recognition` into `MLKitProvider.ts` (replace stub)
- Add basic image preprocessing: contrast normalization, resize for OCR
- Wire `OCRScanner.tsx` to active UI path in `TeacherDashboard`
- Test with real printed Sinhala/Tamil student register samples
- Document accuracy limitations clearly in UI

### Real Notifications (End-to-End)
- Create `notifications` table migration if not existing
- Wire `NotificationDrawer.tsx` to real Supabase data via Realtime
- Notification types: assignment_created, grade_posted, invitation_received, community_post, manifesto_updated
- Mark as read/unread
- Notification badge count on Profile tab

### UI/UX Polish (TIER 3 — Important but After Core Loop)
These are the March tasks.md items — real work that improves quality, but sequenced correctly:

- **Global header redesign**: Modern, premium, token-aligned, `UserAvatar` with correct spacing
- **Bottom navbar redesign**: Glassmorphism/skeuomorphic, theme-aligned, no hardcoded colors
- **Profile modals polish**: Logout + Delete Account modals premium redesign
- **Community screen minimal redesign**: Theme alignment, group flow polish
- **Library screen redesign + FAB z-index fix**
- **Classroom role-specific demo views**: Remove stale content; add role-appropriate demos
- **Error handling normalization**: Replace all `Alert.alert` with `SanctuaryToast`; add empty states
- **Skeleton loaders**: `SkeletonCard`, `SkeletonAvatar`, `SkeletonTextLine` for all data screens

### Accessibility: Begin Systematic Remediation
Currently ~5/100. This is a legal and ethical liability, not just a polish item.

- Priority order: WelcomeScreen → OnboardingScreen → AuthScreen → SelfScreen → LibraryScreen
- Add `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` to all ~171 missing interactive elements
- Add `accessibilityState` on all toggles
- Verify 72px minimum touch targets everywhere
- Add `eslint-plugin-react-native-a11y` to CI

### Localization: Close Key Gaps
- Add 176 missing Sinhala keys to `i18n/locales/si.json`
- Add 200 missing Tamil keys to `i18n/locales/ta.json`
- Externalize top 272 hardcoded strings in priority screens
- Review translation quality: natural Sri Lankan idioms, not robotic Google Translate
  - Sinhala: prefer "හිතේ බර ඉවත් කරගන්න" (natural) over "දවසේ බර මුදා හරින්න" (robotic)
  - Tamil: prefer "மனதில் இருப்பதை வெளியிடுங்கள்" (natural) over "நாளின் பாரத்தை விடுவியுங்கள்" (robotic)

### Monorepo Deduplication (Infrastructure Debt)
- **API first**: Migrate `src/lib/api/*.ts` → `@repo/core`; delete redundant files
- **Community components**: Consolidate to `@repo/community` (remove app-local duplicates)
- **LotusPetalFAB**: Merge PanResponder features into `@repo/ui` version; remove app version
- **Hook cleanup**: `useTheme`/`useAccessibility` → `@repo/ui`; `useInventory` → `@repo/classroom`

### QR Flow: Complete Unification (47/100 → 90+)
- `join-group` consumer path: add to `QRResolver.ts` + `QRHandlerScreen`
- Fix Principal InviteManager: render QR from stored `qrCodeData`
- Fix Teacher QR join: membership link, not `teacher_id` overwrite
- QR image sharing: render to image + `expo-sharing`
- Backward-compatible parser for legacy payload formats
- CI enforcement: block new QR payload formats not going through resolver

---

## Medium Term (May–June 2026): Network Effects & Student Integration

**Theme**: The platform should feel alive with activity. Students are active participants, not just data points. Cross-school connections create national scale.

### Student-Side Experience (First-Class Citizenship)
Students are currently second-class citizens in the app. They see classrooms and assignments but feel no agency.

- **Student PulseDashboard**: Today's assignments, upcoming deadlines, recent grades, attendance streak
- **Student progress visualization**: Gamified streaks, completion percentage, "unlocked" rewards
- **Assignment submission UX overhaul**: Clear status (submitted/pending/late/graded), drag-drop file upload
- **Grade transparency**: Students see their grades immediately when posted; progress over time

### Principal Aggregated Dashboards
- School-wide attendance summary (% present today, trends by class/grade)
- Assignment completion rates across all classrooms
- Anonymized wellbeing pulse (aggregate mood data — never individual teacher data)
- Top community contributors

### Thuthimal: Complete the Gratitude Economy
- In-app Thuthimal gift flow: alumni finds teacher → initiates gift → payment gateway → badge appears
- PayHere SDK integration (Sri Lanka payment gateway)
- Gift confirmation email to teacher
- Public "Wall of Honor" on teacher profiles
- School can showcase top Thuthimal recipients

### Group Chat: Full Features
- File attachments (Cloudinary upload)
- Read receipts and delivery indicators
- Unread message count badges on Community tab
- Push notifications for new messages (`expo-notifications` + APNs/FCM)
- Message search within group
- Pinned messages (important announcements)

### PDF + Video: Native In-App Experience
- `react-native-pdf` integration for in-app PDF reading (no external browser)
- `expo-av` video player for educational video resources
- Resource sharing with deep links
- Offline download for key resources (`expo-file-system`)

### Push Notifications (Full System)
- `expo-notifications` + APNs (iOS) + FCM (Android) setup
- Permission request flow with clear value explanation
- Notification types: all from real notifications + group messages
- Notification preference settings (per-type on/off)
- Notification history (mark all as read)

---

## Long Term (Q3–Q4 2026): Scale, AI, and Platform

**Theme**: After product-market fit is confirmed with 10+ real schools, add intelligence, scale, and platform depth.

### AI Assistant Integration (After Product-Market Fit)
*Build this after you know what teachers actually need help with — don't guess.*

- **Shadow Agent (Orb Entry)**: Context-aware contemplative assistant in Self tab
- **Weekly Wisdom Seeds**: AI-generated insights based on teacher's interaction patterns (not generic GPT output)
- **Lesson planning assistant**: "You're teaching Gravity next week. I found 3 top-rated simulations in the library."
- **Retrospective prompts**: AI-guided weekly school reflection for principals
- **Predictive burnout signal**: Usage pattern analysis → gentle "Your energy looks low this week" nudge

### Advanced Community Features
- **Cross-school groups at national scale**: National Science Olympiad, Subject Teacher Networks
- **Anonymous posts**: Safe space for sensitive professional discussions
- **Community moderation queue**: Report → review → action
- **"Vision Cycle"**: Principal Manifesto → Teacher Endorsement → Student Group → Community Feed
- **Polls and institutional feedback forms**

### Advanced Library Ecosystem
- **AI Smart Summaries**: 3-bullet summary for long PDFs
- **Knowledge Bridges**: "This video connects to your worksheet from Tuesday"
- **Full-text + semantic search** across all library items
- **Resource Remixing/Forking**: Teachers customize collections; evolutionary lineage tracked
- **Popularity analytics**: Most-pulled, most-endorsed, trending by subject

### Administrative Scale Features
- **Timetable generation**: Agentic conflict-resolution timetabling
- **Leave management**: Staff leave submission + principal approval
- **Institutional calendar**: School-wide events + holidays
- **Bulk data upload**: CSV import for student/staff records
- **Letter templates**: Standard academic correspondence generation

### Platform Architecture (v1.0)
- **Hybrid sync**: Local SQLite + Cloud Sync (when offline is mission-critical)
- **E2E encryption**: For Fire Journal, Decision Journal — truly private reflections
- **Multi-tenant school isolation**: Verified RLS policy audit on every table
- **School admin web panel**: For mass onboarding of large schools

---

## Alpha → Beta → Launch Milestones

### Alpha (March–April 2026)
**Goal**: Working app for closed testing with 3–5 selected schools in Sri Lanka.

**Required to call it Alpha:**
- ✅ Auth system (all flows working end-to-end)
- ✅ 5-tab structure with verified role-based content
- 🔄 Core loop validated: school creation → classroom → attendance → grading (T0.2)
- 🔄 PulseDashboard shows REAL data (T0.3)
- 🔄 FAB actions wired (T0.4)
- 🔄 QR join bugs fixed (T0.5, T0.6, T1.5)
- 🔄 SleepTracker / RemindersManager / VoiceJournaling wired (T1.1)
- 🔄 Real notifications (T1.2, T2.3)
- ❌ Group chat (v1 — basic text messaging)
- ❌ Library: default seeded content
- ❌ EAS production build + closed testing on Play Store

**Alpha success criteria (quantitative):**
- App launch time < 3s on low-end Android (Redmi/Samsung budget tier)
- Attendance marking < 30 seconds for a class of 40 students
- App size < 25MB initial download
- 0 data loss incidents in 2-week pilot
- WCAG AA compliance > 50% (from current ~5%)

**Alpha success criteria (qualitative):**
- At least 1 teacher says "this actually helps me"
- Attendance and grading work reliably in a real classroom
- PulseDashboard shows real pending tasks (not fake ones)

---

### Beta (May–June 2026)
**Goal**: Feature-complete app tested with 5–10 real schools across Sri Lanka. Teachers are daily active users.

**New features required for Beta:**
- Group chat (full text + images)
- Push notifications (APNs + FCM)
- Native in-app PDF viewer
- Video player for library resources
- Principal aggregated dashboards (attendance, assignment completion)
- OCR with at least one real provider (MLKit)
- Thuthimal v1 (in-app gift flow)
- Full QR unification (score 90+)
- Student-side PulseDashboard
- Accessibility: WCAG AA > 80%
- Localization: si/ta > 95% coverage

**Beta success criteria:**
- 10+ schools with active daily usage
- Average session length > 8 minutes/day for teachers
- 60%+ 7-day retention for teachers who complete onboarding
- 0 P0 data bugs reported in 4-week pilot
- Teacher NPS > 30

**Beta security requirements:**
- All RLS policies audited and confirmed (row isolation by `school_id`)
- API authorization checks on 100% of endpoints
- No ID-guessing attacks possible
- Privacy audit: grade, salary, contact data masked when The Veil is active

---

### Launch / v0.1 GA (July–August 2026)
**Goal**: Public launch to Sri Lankan school market.

**Required for launch:**
- App Store (iOS) submission + approval
- Google Play Store submission + approval
- PayHere SDK integration + Thuthimal gifting live
- Pricing tiers: Free, Pro (LKR 1,500/month), Premium (LKR 3,000/month)
- Privacy Policy + Terms of Service (live pages, linked in app)
- GDPR/PDPA compliant data handling and deletion
- Full localization: si/ta/en 100% coverage
- Accessibility: WCAG 2.1 AA certified
- Production monitoring dashboards: Sentry error rates < 0.1%, PostHog analytics live
- EAS build pipeline: Development → Staging → Production

**Launch success metrics (Month 1):**
- 50+ schools onboarded
- 1,000+ daily active teachers
- Average daily session > 10 minutes
- Attendance feature used by > 80% of active teachers

---

## Feature Backlog (Parking Lot — Good Ideas, Not Yet Prioritized)

### Administrative Depth
- Staff attendance daily check-in/out logging
- Department tree (visual org chart)
- Classroom walk-through observation feedback system
- Inventory & resources dashboard
- Report card generation (PDF export)
- Timetable Generation (agentic, with conflict resolution)

### Cybernetic Feedback System (Advanced)
From Phase 4 philosophy — these require product-market fit first:
- **Student "Stuck" Signal**: Anonymous signal to teacher → Support Proposal generated
- **Teacher "Reality Check"**: Capacity signal to principal → Support Proposal (not complaint)
- **Aggregated Wellbeing Pulse**: Anonymous mood tracking for principal (never individual data exposed)
- **Affective Loop Repair**: System detects "Vibe Shifts" and suggests structural interventions

### Gamification (Non-Extractive)
Aligned with Thuthimal/Gratitude economy — not points for engagement's sake:
- Hidden achievements scattered across app (exploration rewards)
- Teacher recognition: "Staff Recognition" quick-actions for Gratitude Gifts
- Community recognition wall ("stone tablet" aesthetic for achievements)
- Exploration tracker: % of app discovered

### Living Theme: Full Vision
- **AnimatedGradientMesh**: Smooth gradient transitions as temporal phase shifts
- **LivingGlow protocol**: PostCard and CollectionCard focal points pulse with breath-like rhythm
- **Bio-Resonance Layer**: Adaptive haptics (crisp/Day, soft/Night); UnfoldingView petal-scaling animations
- **Ecosystem Pulsing**: LotusPetalFAB glimmers on received Thuthimal

### Platform Vision (v1.0)
```
v0.1 (Alpha): Cloud-first, core Teacher/Student flows, RLS lockdown
v0.5 (Beta): Thuthimal automation, OCR hardening, Principal dashboards, group chat
v1.0 (GA): Hybrid Sync (Local SQLite + Cloud), E2E encryption for sacred reflections,
           PayHere billing, full AI assistant, national cross-school community
```

**By v1.0, Gurudevi will be:**
- The go-to platform for Sri Lankan school educators
- Trilingual, fully accessible, offline-first
- A Gratitude Economy (Thuthimal) enabling alumni to honor teachers
- An Educational Ecology — repairing broken school feedback loops
- Technology that restores teacher energy rather than extracting it
- Sacred technology honoring 2000 years of Sri Lankan teaching wisdom — ජයවේවා 🪷

---
