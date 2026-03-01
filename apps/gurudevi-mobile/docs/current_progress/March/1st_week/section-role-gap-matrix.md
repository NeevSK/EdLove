# Section × Role Gap Matrix
**Hats worn:** Solution Architect · Product Manager · TAIL_FIN (Zero Fallback Rule)  
**Date:** 2026-03-01  
**Scope:** `apps/gurudevi-mobile` — both web PWA and native (iOS/Android)  
**Audience:** Naveen + any future contributor picking up where we left off

---

## Platform Philosophy (why this analysis exists)

Gurudevi is not an LMS. It is a **digital sanctuary** for Sri Lankan teachers who give everything to children while their own lives quietly collapse. The lotus aesthetic is structural DNA, not decoration. Every screen must return more energy than it takes.

The web platform is the same codebase rendered as a PWA — sidebar replaces bottom bar, URLs are deep-linkable, PWA install banner appears. Everything else: same data, same RLS, same emotion.

The five sections map to five dimensions of a teacher's life:
- **Self** — inner world, wellbeing, reflection
- **Classroom** — professional practice, the daily work
- **Community** — belonging, collective wisdom
- **Library** — knowledge commons, shared resources
- **Profile** — identity, recognition, settings

---

## Mobile Parity Notes (Rounds 1–4)

| Change | Web | Native | Verdict |
|---|---|---|---|
| `console.log` scrub in `App.tsx` | ✅ | ✅ same file | Parity ✅ |
| `ROLE_META` theme tokens (`TabNavigator.web.tsx`) | ✅ | ✅ native already used `useThemedColors()` | Parity ✅ |
| FAB nav fix (`getFabActions`) | ✅ | ✅ same file | Parity ✅ |
| `PHASE_GRADIENT` tokens (`WelcomeScreen.web.tsx`) | ✅ | Native `WelcomeScreen.tsx` has different structure; no gradient map | N/A — different layouts |
| Honest stats on WelcomeScreen | ✅ web only | Native has no stats section | N/A — different layouts |
| Deep URL linking | ✅ web only | Native uses Expo deep links (different mechanism) | By design |
| `useAIAgent` real Supabase data | ✅ | ✅ same hook | Parity ✅ |
| `useSchoolPulse` real data (Round 5) | ✅ | ✅ same hook | Parity ✅ |
| `StudentDashboard` pending assignments wired | ✅ | ✅ same component | Parity ✅ |
| `SubmissionModal` real image picker | ✅ | ✅ same component (expo-image-picker) | Parity ✅ |

---

## SELF Section

### Teacher — should accomplish / wired / gap

| # | What the teacher should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Log mood via MoodLotus (tap a petal) | ✅ `MoodLotus` + `useMoodLogs` → Supabase | — |
| 2 | Track energy level over time | ✅ `EnergyForecast` + `useEnergyForecast` | — |
| 3 | Write privately in Fire Journal (voice or text) | ✅ `VoiceJournaling` + `useJournal` | — |
| 4 | Use breathing guide for decompression | ✅ `BreathGuide` | — |
| 5 | Receive daily wisdom seeds | ✅ `WisdomSeeds` + `useWisdom` | — |
| 6 | Plan for tomorrow (prep ritual) | ✅ `TomorrowPrep` + `useTomorrowPrep` | — |
| 7 | Track sleep quality | ✅ `SleepTracker` + `useSleepTracker` | — |
| 8 | Manage personal reminders | ✅ `RemindersManager` | — |
| 9 | Add to Gratitude Glimmers jar | ✅ `GratitudeGlimmers` + `useGratitude` | — |
| 10 | Wind-down ritual before bed | ✅ `WindDownRitual` | — |
| 11 | See daily content card (inspiration) | ✅ `DailyContentCard` + `useDailyContent` | — |
| 12 | See resonance patterns (weekly emotional arc) | ✅ `ResonancePatternCard` | — |
| 13 | Joy Jar (capture joyful classroom moments) | ✅ `JoyJar` + `useJoyJar` | — |
| 14 | Progress tree (gamified growth visualization) | ✅ `ProgressTree` | — |
| 15 | Decision journal (capture key professional decisions) | ⚠️ `useDecisionJournal` exists but only surfaced in `PrincipalSelfView` | Wire `DecisionJournal` component into `TeacherSelfView` feature carousel |
| 16 | Shadow agent drawer (AI reflection prompt) | ✅ `ShadowAgentDrawer` | — |
| 17 | Community presence (see who's online in their school) | ✅ `CommunityPresence` component | — |
| 18 | Orientation capture (on first open) | ✅ `OrientationCaptureStep` | — |

### Student — should accomplish / wired / gap

| # | What the student should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Log mood | ✅ `MoodLotus` | — |
| 2 | Set and track learning goals | ✅ `StudentGoals` + `useStudentGoals` → real Supabase | — |
| 3 | Study rhythm / focus timer | ❌ `case 'study'` renders `PositiveInvitation` ("coming soon") | Implement Pomodoro-style study timer — no backend needed |
| 4 | Daily learning reflection | ❌ `case 'reflection'` renders `PositiveInvitation` | Wire `FireJournal` with student-appropriate prompts |
| 5 | Progress visualization (watch yourself bloom) | ❌ `case 'progress'` renders `PositiveInvitation` | Wire `ProgressTree` — already built |
| 6 | See daily content card | ✅ `DailyContentCard` | — |
| 7 | Resonance pattern | ✅ `ResonancePatternCard` | — |
| 8 | Shadow agent (age-appropriate reflection prompts) | ✅ `ShadowAgentDrawer` | — |

### Principal — should accomplish / wired / gap

| # | What the principal should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Track leadership energy | ✅ `EnergyForecast` | — |
| 2 | Decision journal | ✅ `useDecisionJournal` + `PrincipalSelfView` | — |
| 3 | Log mood privately | ✅ `MoodLotus` | — |
| 4 | See school community pulse (aggregate, never individual) | ⚠️ `useSchoolPulse` was mock data (`resonance: 84`, `mood: 'focus'`) | **Fixed Round 5** — now queries `community_posts`, `library_items`, `community_groups`, `classrooms` for real activity signals. `aggregated_mood` correctly stays `'unknown'` (requires future privacy-preserving Edge Function — RLS blocks individual mood access by design) |
| 5 | Daily content card | ✅ `DailyContentCard` | — |
| 6 | Breathing and wind-down rituals | ✅ inherited from teacher carousel | — |

---

## CLASSROOM Section

### Teacher — should accomplish / wired / gap

| # | What the teacher should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | See all classrooms in their school | ✅ `ClassroomScreen` → `TeacherDashboard` → `ClassroomList` | — |
| 2 | Create a classroom | ✅ `CreateClassroomModal` | — |
| 3 | Mark attendance in < 30 seconds | ✅ `AttendanceScreen` + `useAttendance` → real Supabase `upsert` | — |
| 4 | Add students manually | ✅ `AddStudentModal` | — |
| 5 | Bulk-import students via OCR | ✅ `OCRScanner` + `OCRStudentImport` | OCR provider is still stub (`MLKitProvider`) — see roadmap |
| 6 | Create lesson months (curriculum structure) | ✅ `ClassroomDashboard` add-month modal | — |
| 7 | Add materials to lessons | ✅ `LessonFeed` + `api.lessonMaterials` | — |
| 8 | Create assignments with due dates | ✅ `api.assignments.create` | — |
| 9 | Grade student submissions | ✅ `GradeEntryForm` + `gradingAPI.submitGrade` | — |
| 10 | View gradebook sorted by marks/name/grade | ✅ `GradebookView` + `useGradebook` | — |
| 11 | Add classroom notes | ✅ `ClassroomNotes` | — |
| 12 | Pin/unpin resources | ✅ `ContentLibrary` + `api.resources.togglePin` | — |
| 13 | Add resources to classroom library | ✅ `ResourcesView` + `api.resources.create` | — |
| 14 | Track classroom inventory | ✅ `InventoryView` | — |
| 15 | Manage student groups within classroom | ✅ `GroupManager` | — |

### Student — should accomplish / wired / gap

| # | What the student should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | See enrolled classrooms with meaningful info | ✅ `StudentDashboard` + `ClassroomList` | — |
| 2 | See **real** pending assignments count on dashboard | ❌ `pendingAssignments` was always `0` (never queried) | **Fixed Round 5** — now queries Supabase for unsubmitted assignments within 7-day window |
| 3 | Navigate into a classroom detail | ✅ tap classroom → `ClassroomDashboard` | — |
| 4 | See lesson months and materials | ✅ `LessonFeed` (student sees read-only view) | — |
| 5 | See assignments in a lesson | ✅ `LessonFeed` shows assignments | — |
| 6 | Submit work on an assignment (text) | ✅ `SubmissionModal` → `api.submissions.create` | — |
| 7 | Submit work with a photo attachment | ❌ `handlePickImage` showed `Alert.alert("would be implemented here")` | **Fixed Round 5** — real `expo-image-picker` with permissions flow; works on web + native |
| 8 | See their own grades | ❌ No student-facing grade view; `GradebookTable` is teacher-only | Future: `MyGradesView` component querying `submissions` where `student_id = auth.uid()` and `grade IS NOT NULL` |
| 9 | Quick navigate to Library / Community from dashboard | ✅ `StudentDashboard` quick shortcuts | — |
| 10 | See rewards (gamification) | ❌ Shows "Rewards blossoming soon 🌸" toast | Future: wire `useRewards` → rewards display |
| 11 | See personal timetable | ❌ Shows "Timetables in preparation 🍃" toast | Future: query `timetable` table (migration exists) |

### Principal — should accomplish / wired / gap

| # | What the principal should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | See morning situational brief (staff present, attendance %, at-risk count) | ✅ `MorningSituationalBrief` → `staffManagementAPI` → real Supabase | — |
| 2 | See teacher carousel with presence | ✅ `TeacherCarousel` | — |
| 3 | Build school hierarchy (sections, grades) | ✅ `HierarchyBuilder` | — |
| 4 | Invite teachers/staff via QR code | ✅ `InviteManager` + `QRCodeGenerator` from `@repo/scanner-kit` | — |
| 5 | See student attendance pulse | ✅ `StudentPulseSection` | — |
| 6 | Approve / reject staff leave requests | ✅ `LeaveApprovalSection` | — |
| 7 | See resource needs dashboard | ✅ `ResourceNeedsDashboard` | — |
| 8 | Add principal observations/notes | ✅ `PrincipalNotes` | — |
| 9 | See curriculum pulse across school | ✅ `CurriculumPulse` | — |
| 10 | Generate AI timetable draft | ⚠️ `useAIAgent.generateTimetable` calls `TimetableScheduler.generateDraft` which is still a mock | Future: real timetable logic — complex, post-Alpha |
| 11 | Manage staff list | ✅ `staffManagementAPI` | — |
| 12 | Institutional calendar | ✅ `InstitutionalCalendarSection` | — |

---

## COMMUNITY Section

### Teacher — should accomplish / wired / gap

| # | What the teacher should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | See school + community feed | ✅ `CommunityScreen` feed tab | — |
| 2 | Create a post | ✅ `CreatePostModal` | — |
| 3 | Browse and join groups | ✅ `GroupsScreen` + `GroupCard` | — |
| 4 | Create a group | ✅ `CreateGroupModal` | — |
| 5 | Chat in real-time within a group | ✅ `GroupChatScreen` + Supabase Realtime | — |
| 6 | Manage group members (add/remove) | ✅ `GroupMemberManagement` | — |
| 7 | See and endorse teacher manifestos | ✅ `ManifestoCard` + `useManifestos` | — |
| 8 | Report inappropriate posts | ✅ `ReportPostModal` | — |
| 9 | See pinned resources in a group | ✅ `PinnedResourcesShelf` | — |
| 10 | See community hearth (live presence, sacred missions) | ✅ `CommunityHearth` | — |
| 11 | Browse direct messages tab | ⚠️ `activeTab === 'dms'` renders placeholder in `CommunityScreen` | Future: DM screen |

### Student — should accomplish / wired / gap

| # | What the student should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Browse school community feed | ✅ same `CommunityScreen` | — |
| 2 | Post in the community | ✅ no role block on `CreatePostModal` | — |
| 3 | Join study groups | ✅ | — |
| 4 | Chat in group | ✅ `GroupChatScreen` | — |
| 5 | NOT see manifesto creation controls | ❌ No role-gate; student can trigger `CreatePostModal` for manifestos | Should be gated: `ManifestoCard` creation = `teacher`/`principal` only |

### Principal — should accomplish / wired / gap

| # | What the principal should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Moderate groups (as admin) | ✅ `isAdmin = role === 'principal'` in `GroupDetailsScreen` | — |
| 2 | See all school community activity | ✅ | — |
| 3 | Post school-wide announcements | ⚠️ Uses same `CreatePostModal` as everyone — no "announcement" type distinction | Future: `type: 'announcement'` on `community_posts`; announcement renders differently in feed |
| 4 | Pin important posts school-wide | ❌ `PinnedResourcesShelf` is group-scoped, not school-scoped | Future: `is_pinned_school_wide` flag |

---

## LIBRARY Section

### All Roles — should accomplish / wired / gap

| # | What any user should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Browse Netflix-style category shelves | ✅ `LibraryScreen` + `SmartShelf` rows | — |
| 2 | Search resources by keyword | ✅ `GlobalHeader` search → `ResourceList` | — |
| 3 | Filter by category chip | ✅ `HorizontalChipRow` + `LIBRARY_UI_CATEGORIES` | — |
| 4 | Endorse a resource (upvote) | ✅ `endorseMutation` | — |
| 5 | Open resource in external URL | ✅ `openExternalURL` | — |
| 6 | See hero banner (featured resource) | ✅ `ImageBackground` hero | — |
| 7 | See trending and new arrivals shelves | ✅ | — |
| 8 | Add a resource (teacher/principal) | ✅ `LotusPetalFAB` → `AddResourceModal` | — |
| 9 | Create a collection | ✅ `createCollectionMutation` | — |
| 10 | See copyright notice on externally-sourced content | ✅ `copyright_notice` badge | — |
| 11 | Experience a non-empty library on first use | ❌ No seed content; new school sees 10 empty shelves | **Roadmap**: `is_default` flag on `library_items`; 20–30 curated Sri Lankan curriculum resources (human-curated by Naveen) |

---

## PROFILE Section

### Teacher — should accomplish / wired / gap

| # | What the teacher should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Edit identity (name, photo, phone) | ✅ `EditableItem` + `profileAPI.updateProfile` | — |
| 2 | Add subjects taught | ✅ `profileSections` config | — |
| 3 | Add qualifications | ✅ | — |
| 4 | Add NIC number (staff identity verification) | ✅ `onlyForRoles: ['teacher', 'principal', ...]` | — |
| 5 | Add social/contact links | ✅ `ContactLinktree` + `useSocialLinks` | — |
| 6 | See completion score with actionable nudges | ✅ `useProfileCompletion` | — |
| 7 | See Thuthimal gratitude badge (if gifted by alumni) | ✅ `ThuthimalBadge` | — |
| 8 | Give Thuthimal to another teacher | ✅ `GiveThuthimalModal` | — |
| 9 | Change language (Sinhala / Tamil / English) | ✅ `AppSettingsScreen` | — |
| 10 | Change theme (dark/light/circadian) | ✅ `AppSettingsScreen` | — |
| 11 | Logout | ✅ modal + `supabase.auth.signOut()` | — |
| 12 | Delete account | ✅ modal + `useAccountDeletion` | — |

### Student — should accomplish / wired / gap

| # | What the student should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | Edit identity (name, photo, phone) | ✅ | — |
| 2 | Add student index number | ✅ `onlyForRoles: ['student']` in profileSections | — |
| 3 | See grade/school info | ✅ `StatsSection` | — |
| 4 | Change language and theme | ✅ `AppSettingsScreen` | — |

### Principal — should accomplish / wired / gap

| # | What the principal should be able to do | Wired? | Gap / Action |
|---|---|---|---|
| 1 | All teacher profile features | ✅ | — |
| 2 | See school association clearly | ✅ `StatsSection` + `useSchoolPulse` (now real data) | — |
| 3 | Staff management from profile | ✅ `staffManagementAPI` accessible via classroom section | — |

---

## Priority Bridge Plan

### Tier 0 — Fixed in Round 5 (this session)
- ✅ `StudentDashboard.pendingAssignments` — now live Supabase query
- ✅ `SubmissionModal.handlePickImage` — real `expo-image-picker`
- ✅ `useSchoolPulse` — real activity aggregation from school-scoped tables

### Tier 1 — Ready to build (no backend work needed)
- [ ] `StudentSelfView 'progress'` → wire existing `ProgressTree` component
- [ ] `TeacherSelfView` → add `DecisionJournal` to teacher feature carousel

### Tier 2 — Needs light backend (migration exists)
- [ ] Student grade visibility: `MyGradesView` querying `submissions` where `student_id = auth.uid()` and grade is set
- [ ] Community manifesto creation: role-gate to `teacher`/`principal` only

### Tier 3 — Requires curation / external work
- [ ] Library cold-start: curated seed content (human task: Naveen selects 20–30 Sri Lankan curriculum resources)
- [ ] `aggregated_mood` in school pulse: privacy-preserving Supabase Edge Function

### Tier 4 — Post-Alpha features (architecture is ready)
- [ ] Student timetable view (migration `timetable` table exists, no UI)
- [ ] Student rewards display (hook exists, no display UI)
- [ ] Principal school-wide announcement type
- [ ] DM tab in Community

---

## Architecture Health Score (as of 2026-03-01)

| Dimension | Score | Notes |
|---|---|---|
| Domain boundaries | 7/10 | Good package split; some redundancy in `src/lib/api/*` vs `@repo/core` |
| Real data wiring | 7/10 | Most hooks are real; a few historical mocks remain (TimetableScheduler) |
| Role differentiation | 8/10 | All 5 sections are role-aware; student experience is thinnest |
| Theme token purity | 9/10 | After rounds 3–5 fixes; only `#FFFDF7` warm-white lacks a token |
| Mobile ↔ Web parity | 9/10 | Near-complete; layout differences are intentional |
| Trust (no fake data shown to users) | 9/10 | Stats fixed, school pulse fixed, pending assignments fixed |
| Production readiness | 7/10 | No console.log leaks; error boundaries in place; skeleton loaders exist |

---

*This document is a living architectural record. Update after each sprint cycle.*  
*Next update target: when student grade visibility (`MyGradesView`) is shipped.*
