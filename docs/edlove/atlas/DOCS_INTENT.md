# Docs intent sweep (atlas v3)

Read-only sweep. It covers /workspace/edlove-plan/*, every .md/.mdx/.txt on main, docs that exist only on other branches, and docs deleted in any ref. For deleted docs, the text was taken from the parent of the deleting commit. Dates are Asia/Colombo: front-matter `updated`/`created` when present, otherwise the first commit. The last commit is also recorded, because a mass docs commit on 2026-08-24 touched most files.

## Counts

- Docs read: **3173**. By origin: main 1771, plan 4, deleted 672, branch-only 726
- After dedupe (exact hash plus MinHash Jaccard ≥ 0.85): **1963 canonical**, 1210 duplicates or near-duplicates. Canonical preference: plan > main > branch-only > deleted, then the latest version.
- Canonical docs by kind: vendor-skill 192, architecture/dev 729, other 120, progress/status 262, content/marketing 235, plan 330, research 95
- Excluded from intent extraction, but still counted as read: 522 docs (vendor skills, marketing/edlove-web content, research).
- Raw requirement lines extracted: **9976**. By class: product 3866, engineering 2725, other 2995, business 91, qa 299
- Product intents after near-duplicate merge (token-set ≥ 92): **3389**. Verdicts: UNCLASSIFIED 1470, NEW 936, MATCHED 746, CONTRADICTED 220, CLAIM-UNVERIFIED 17

### Verdict by role

| role | MATCHED | NEW→PLANNED | CONTRADICTED | CLAIM-UNVERIFIED | UNCLASSIFIED |
|---|---|---|---|---|---|
| teacher | 89 | 140 | 40 | 4 | 5 |
| principal | 63 | 97 | 24 | 2 | 1 |
| student | 68 | 132 | 30 | 4 | 5 |
| parent | 10 | 19 | 1 | 0 | 4 |
| admin | 14 | 23 | 12 | 0 | 7 |
| founder | 14 | 26 | 10 | 0 | 1 |
| ? | 536 | 585 | 133 | 9 | 1454 |

**Method.** Lines are extracted from checkboxes, task and gap tables, intent-headed lists, user stories, and role-ability sentences. Each line is classified as product, engineering, qa, business or other. Product intents get a domain from a keyword map and are scored by TF-IDF against the capabilities in that domain (a matching role gets a bonus).
- **MATCHED:** similarity ≥ 0.22. High confidence at ≥ 0.30.
- **CONTRADICTED:** the latest non-superseded claim says done/✅, but the capability is PARTIAL, UI-UNWIRED, BACKEND-ONLY or LOST. Also when a doc claims something is built and no capability matches.
- **NEW → PLANNED:** task-like and unmatched.
- **UNCLASSIFIED:** not task-like.
Manual spot checks are in v3/manual_checks.json. The fuzzy matching is heuristic, so expect noise in the LOW-CONFIDENCE items.

## Top themes of unbuilt intent (NEW→PLANNED)

| theme/area | PLANNED | likely still wanted | example |
|---|---|---|---|
| (no domain) | 342 | 110 | Create Supabase migration with new tables (COMMUNITY_LIBRARY_SUMMARY.md) |
| auth-identity | 113 | 28 | Generate QR codes for first principals (ALPHA_REQUIREMENTS.md) |
| school-onboarding | 70 | 14 | Generate QR codes for first principals (ALPHA_REQUIREMENTS.md) |
| community-feed | 62 | 16 | Five sections visible (Self, Classroom functional; Community, Library as skeletons) (GURUDEVI_COMPLETE_PRD.md) |
| classroom-core | 61 | 10 | principal view features and screens (task copy.md) |
| library-curation-review | 58 | 25 | ✅ Library (teacher upload, student view) (task copy.md) |
| library-browse | 56 | 23 | ✅ Library (teacher upload, student view) (task copy.md) |
| gradebook | 56 | 12 | T3.15: Resolve `grade_id` → `gradeNumber` for student grade defaults — S / Low (ACTIVE_TASKS.md) |
| self-wellbeing | 37 | 8 | Build Self section (mood check-in, reflection journal) (GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md) |
| profile | 29 | 10 | Add profile progress UI (task copy.md) |
| app-settings | 25 | 7 | Principal attendance dashboard (aggregated, privacy-preserving) (EVOLUTION.md) |
| offline-sync | 24 | 10 | Add offline support with local caching (DELEGATION_PACKET_STATUS.md) |
| lessons-materials | 24 | 3 | **Impact Ripples** — Receive (resource saved, lesson accessed) / Receive (gratitude from teachers) (GROWTH_MODEL.md) |
| guardian-workspace | 23 | 14 | Approve DM role permissions (can students DM teachers? parents DM teachers?) (T2.7) (ACTIVE_TASKS.md) |
| growth-ripples | 21 | 1 | StudentGoals tracks progress and streaks (DELEGATION_PACKET_STATUS.md) |
| rewards-energy | 21 | 1 | StudentGoals tracks progress and streaks (DELEGATION_PACKET_STATUS.md) |
| library-tools | 20 | 9 | **Implement pdf-lib API** (generate, merge, split, forms) (ARCHITECTURE.md) |
| cosmic-map | 19 | 8 | Remove student — Not explicit in screen / Yes (2026-05-16-teacher-classroom-inner-view-audit.md) |
| decision-journal | 19 | 5 | Monitoring — 50 dashboards / 1 dashboard (GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md) |
| assignments | 17 | 4 | Build auth flow (login, signup, role assignment) (GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md) |
| founder-dashboard | 14 | 6 | **All roles codified** — `useTeacher/Student/Founder/Guardian/Principal/Admin*` / Added `kind/domain/groupId`  (2026-08-25-unified-canvas-next.md) |
| form-builder | 14 | 5 | **Implement pdf-lib API** (generate, merge, split, forms) (ARCHITECTURE.md) |
| academic-cycles | 14 | 3 | Create hierarchy tables (task copy.md) |
| ai-assistant | 14 | 6 | **Asst. Principal** — `assistantPrincipal` / Bonds / CASL (2026-05-16-gurudevi-actor-resource-permission-matrix-audit.md) |
| durable-agents | 14 | 6 | **Asst. Principal** — `assistantPrincipal` / Bonds / CASL (2026-05-16-gurudevi-actor-resource-permission-matrix-audit.md) |
| privacy-ledger | 13 | 3 | Principal attendance dashboard (aggregated, privacy-preserving) (EVOLUTION.md) |
| calendar-events | 12 | 7 | Calendar view or list view (GURUDEVI_COMPLETE_PRD.md) |
| ~timetable | 12 | 4 | Schedule classroom visits (2026-02-18_next_phase_roadmap.md) |
| attendance | 11 | 4 | Principal attendance dashboard (aggregated, privacy-preserving) (EVOLUTION.md) |
| teacher-attendance | 11 | 4 | Principal attendance dashboard (aggregated, privacy-preserving) (EVOLUTION.md) |

## Biggest contradictions (docs say done; code disagrees)

| intent | doc (latest) | date | code says | note |
|---|---|---|---|---|
| Shadow agent (age-appropriate reflection prompts) — ✅ `ShadowAgentDrawer` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:87 | 2026-03-01 | task:self:student:8 → UNVERIFIED | Manual: only packages/self/src/components/archive/ShadowAgentDrawer.tsx exists, and no code imports it. The doc's ✅ (2026-03-01) is false at HEAD. |
| Shadow agent drawer (AI reflection prompt) — ✅ `ShadowAgentDrawer` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:72 | 2026-03-01 | task:self:teacher:16 → UNVERIFIED | Manual: only packages/self/src/components/archive/ShadowAgentDrawer.tsx exists, and no code imports it. The doc's ✅ (2026-03-01) is false at HEAD. |
| See resonance patterns (weekly emotional arc) — ✅ `ResonancePatternCard` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:68 | 2026-03-01 | task:self:teacher:12 → UI-UNWIRED | Manual: packages/self/src/components/ResonancePatternCard.tsx is defined; only docs reference it, no importer. |
| See daily content card (inspiration) — ✅ `DailyContentCard` + `useDailyContent` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:67 | 2026-03-01 | task:self:teacher:11 → UI-UNWIRED | Manual (v1): DailyContentCard is exported but no screen uses it. |
| See daily content card — ✅ `DailyContentCard` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:85 | 2026-03-01 | task:self:student:6 → UI-UNWIRED | Manual (v1): DailyContentCard is exported but no screen uses it. |
| Report inappropriate posts — ✅ `ReportPostModal` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:172 | 2026-03-01 | task:community:teacher:8 → UNVERIFIED | Manual: no ReportPostModal file exists at HEAD. The community.reportContent procedure exists. |
| Classroom: Grading — GradebookTable, ReportCard, GradeEntryForm | apps/gurudevi-mobile/docs/current_progress/CURRENT_STATE.md:331 | 2026-07-28 | gradebook:grading.getReportCard → UI-UNWIRED | Manual: packages/classroom/src/components/grading/GradeEntryForm.tsx is defined, but no code imports it. |
| Grade student submissions — ✅ `GradeEntryForm` + `gradingAPI.submitGrade` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:116 | 2026-03-01 | gradebook:grading.submitGrade → UI-UNWIRED | Manual: packages/classroom/src/components/grading/GradeEntryForm.tsx is defined, but no code imports it. |
| See student attendance pulse — ✅ `StudentPulseSection` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:148 | 2026-03-01 | task:classroom:principal:5 → UNVERIFIED | Manual: no StudentPulseSection file exists. The name survives only in StudentEnrollmentPulse.tsx. |
| Principal: Student Pulse — StudentPulseSection — attendance %, submission rate, at-risk flags | apps/gurudevi-mobile/docs/current_progress/CURRENT_STATE.md:338 | 2026-07-28 | task:classroom:principal:5 → UNVERIFIED | Manual: no StudentPulseSection file exists. The name survives only in StudentEnrollmentPulse.tsx. |
| `grading/GradeEntryForm.tsx` `Pending` | packages/classroom/doc/ui-inventory.md:71 | 2026-04-22 | gradebook:grading.submitGrade → UI-UNWIRED | Manual: packages/classroom/src/components/grading/GradeEntryForm.tsx is defined, but no code imports it. |
| Add classroom notes — ✅ `ClassroomNotes` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:118 | 2026-03-01 | classroom-notes:educational.getClassroomNotes → BACKEND-ONLY |  |
| Invite Code System — ✅ Implemented / 8-character codes for school joining | apps/gurudevi-mobile/docs/old_docs/COMPREHENSIVE_APP_ANALYSIS.md:105 | 2026-07-24 | school-onboarding:supabase.read:school_invite_codes → UI-UNWIRED |  |
| Migrate `Profile` domain (User, Social) | packages/core/docs/current_progress/2026-05-16-api-purge-tasks.md:15 | 2026-07-28 | profile:supabase.read:user_social_links → UI-UNWIRED |  |
| **Phase 2** — Canary deploy works, rollback < 30s, audit logs written | apps/sanctuary-api/docs/implementation/PRODUCTION_HARDENING_MASTER_PLAN.md:284 | 2026-08-25 | pkg:core:supabase.read:audit_logs → UI-UNWIRED |  |
| Add materials to lessons — ✅ `LessonFeed` + `api.lessonMaterials` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:114 | 2026-03-01 | lessons-materials:supabase.read:lesson_materials → UI-UNWIRED |  |
| **Generate Invite Codes** — ✅ Implemented / QR codes for school | apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_FEATURE_MAPPING.md:88 | 2026-02-19 | school-onboarding:supabase.read:school_invite_codes → UI-UNWIRED |  |
| Pin/unpin resources — ✅ `ContentLibrary` + `api.resources.togglePin` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:119 | 2026-03-01 | task:classroom:teacher:12 → UI-UNWIRED |  |
| **Task 4.3**: Implement "Stale-While-Revalidate" (SWR) for classroom attendance to allow offline mar | packages/ui/docs/current_progress/tasks.md:37 | 2026-07-28 | attendance:attendance.getByClassroom → UI-UNWIRED |  |
| Temporal architecture and derived history — `useTemporalStore`, temporal utilities, navigators, and  | docs/architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md:43 | 2026-08-10 | self-wellbeing:self.getMoodHistory → PARTIAL |  |
| ✅ **Test login** → should see user profile | apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1715_Gurudevi Development Tasks/1455_supabase_auth_explained.md:357 | 2026-02-04 | profile:profile.getUserProfile → BACKEND-ONLY |  |
| Keep notifications as a first-class route destination | apps/gurudevi-mobile/docs/current_progress/2026-06-10-expo-router-tabnav-transfer/task.md:32 | 2026-06-10 | notifications:supabase.read:notifications → UI-UNWIRED |  |
| Add a resource (teacher/principal) — ✅ `LotusPetalFAB` → `AddResourceModal` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:211 | 2026-03-01 | task:library:all:8 → UI-UNWIRED |  |
| Mood History — API: `self.ts` / ✅ Complete | apps/gurudevi-mobile/docs/old_docs/COMPREHENSIVE_APP_ANALYSIS.md:127 | 2026-07-24 | self-wellbeing:self.getMoodHistory → PARTIAL |  |
| Offline sync — ✅ PowerSync + Drizzle + SQLite | apps/gurudevi-mobile/docs/current_progress/2026-08-06-production-hardening-aesthetic-polish-plan.md:77 | 2026-08-06 | offline-sync:sync.getMutationReceipt → UI-UNWIRED |  |
| Assignment Submission — `SubmissionModal.tsx` / ✅ Complete | apps/gurudevi-mobile/docs/old_docs/COMPREHENSIVE_APP_ANALYSIS.md:153 | 2026-07-24 | assignments:educational.gradeAssignmentSubmission → BACKEND-ONLY |  |
| Community Posts — ✅ Implemented / Social feed with likes/comments | apps/gurudevi-mobile/docs/old_docs/COMPREHENSIVE_APP_ANALYSIS.md:175 | 2026-07-24 | community-feed:supabase.write:community_posts → UI-UNWIRED |  |
| Create "App Settings" Section in Profile (Consolidated Controls) | apps/gurudevi-mobile/docs/current_progress/hmmm/task.md:39 | 2026-02-25 | app-settings:route/app-settings → UI-UNWIRED |  |
| Mission 05: Student Experience (API Found: `classroomStudents.ts`) | apps/gurudevi-mobile/docs/old_docs/task copy.md:108 | 2026-07-24 | classroom-core:supabase.read:classroom_students → UI-UNWIRED |  |
| QR code scanning for invite codes | apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/ALPHA_REQUIREMENTS.md:30 | 2026-02-19 | school-onboarding:supabase.read:school_invite_codes → UI-UNWIRED |  |
| **Profile** — ✅ Siphoned / User, Social, Journey | packages/core/docs/current_progress/2026-05-16-api-purge-implementation-plan.md:22 | 2026-07-28 | profile:supabase.read:user_social_links → UI-UNWIRED |  |
| Keep settings as a first-class route destination | apps/gurudevi-mobile/docs/current_progress/2026-06-10-expo-router-tabnav-transfer/task.md:33 | 2026-06-10 | app-settings:route/app-settings → UI-UNWIRED |  |
| **Invite Code Generation** — ✅ Implemented / Auto-generated codes | apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_FEATURE_MAPPING.md:166 | 2026-02-19 | school-onboarding:supabase.read:school_invite_codes → UI-UNWIRED |  |
| **View Attendance** — ✅ Implemented / Own attendance record | apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_FEATURE_MAPPING.md:75 | 2026-02-19 | attendance:attendance.record → UI-UNWIRED |  |
| **Hook Synchronization**: Updated `@repo/core` hooks (comment, poll, community) to match ReBAC-aware | packages/core/docs/current_progress/domain-api-healing-plan.md:27 | 2026-07-28 | community-feed:community.voteInPoll → PARTIAL |  |
| Annotation toolbar (highlight, note, bookmark) | packages/library/ARCHITECTURE.md:221 | 2026-08-29 | classroom-notes:educational.createClassroomNote → BACKEND-ONLY |  |
| **Posts** — ✅ Implemented / Discussion threads | apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_FEATURE_MAPPING.md:104 | 2026-02-19 | community-feed:supabase.write:community_posts → UI-UNWIRED |  |
| Self mood check-in fully implemented and tested | apps/gurudevi-mobile/docs/Core/archive/CRITICAL_FIX_ROADMAP.md:273 | 2026-02-28 | self-wellbeing:self.getMoodHistory → PARTIAL |  |
| `messages` — live / implemented direct/group message screens exist | docs/current_progress/2026-08-31-gurudevi-registry-implementation-audit.md:186 | 2026-08-31 | community-feed:community.sendGroupMessage → PARTIAL |  |
| Store submission gate — ✅ Documented / `production-hardening-runbook.md` §4 | docs/engineering/2026-08-25-production-hardening-results.md:57 | 2026-08-25 | assignments:educational.gradeAssignmentSubmission → BACKEND-ONLY |  |
| Mission 01: Self (Wellbeing) | apps/gurudevi-mobile/docs/old_docs/MISSION_COMPLETION_SUMMARY.md:215 | 2026-07-24 | self-wellbeing:self.getPreferences → BACKEND-ONLY |  |
| Create a group — ✅ `CreateGroupModal` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:168 | 2026-03-01 | community-feed:route/create-group → UI-UNWIRED |  |
| Post in the community — ✅ no role block on `CreatePostModal` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:182 | 2026-03-01 | community-feed:community.createPost → PARTIAL |  |
| Invite Code Generation — ✅ Implemented / 8-char random codes | apps/gurudevi-mobile/docs/old_docs/COMPREHENSIVE_APP_ANALYSIS.md:218 | 2026-07-24 | school-onboarding:supabase.read:school_invite_codes → UI-UNWIRED |  |
| Created minimal database schema | apps/gurudevi-mobile/docs/old_docs/task copy.md:126 | 2026-07-24 | profile:profile.updateProfile → BACKEND-ONLY |  |
| Complete Self/Mood feature (4-5 hours) | apps/gurudevi-mobile/docs/old_docs/PR_SUMMARY.md:211 | 2026-07-24 | self-wellbeing:self.getMoodHistory → PARTIAL |  |
| Complete Self/Mood check-in (4-5 hours) | apps/gurudevi-mobile/docs/brain_archive/EXTENDED_SESSION_SUMMARY_2026-02-14.md:323 | 2026-02-14 | self-wellbeing:self.getMoodHistory → PARTIAL |  |
| Migrate `Self` domain (Mood, Journal, Prefs) | packages/core/docs/current_progress/2026-05-16-api-purge-tasks.md:14 | 2026-07-28 | self-wellbeing:self.logMood → PARTIAL |  |
| Design "Community" table (Announcements) | apps/gurudevi-mobile/docs/old_docs/task copy.md:94 | 2026-07-24 | pkg:core:supabase.read:announcements → UI-UNWIRED |  |
| [Inventory & Resource Integration](#inventory--resource-integration) | apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/2026-02-18_next_phase_roadmap.md:115 | 2026-02-25 | inventory:inventory.getAll → PARTIAL |  |
| Refactor `attendanceAPI` to Sanctuary RPC. | packages/core/docs/architecture/tasks.md:14 | 2026-05-16 | attendance:supabase.write:attendance → UI-UNWIRED |  |
| Refactor `communityAPI` (Comments, Polls, Posts) to Sanctuary RPC. | packages/core/docs/architecture/tasks.md:16 | 2026-05-16 | pkg:core:supabase.read:community_comments → UI-UNWIRED |  |
| Migrate `Grading` engine (Marks, GPA, Publication) | packages/core/docs/current_progress/2026-05-16-api-purge-tasks.md:18 | 2026-07-28 | gradebook:grading.getGradingSettings → UI-UNWIRED |  |
| Created invite_codes table | apps/gurudevi-mobile/docs/old_docs/task copy.md:68 | 2026-07-24 | school-onboarding:supabase.read:school_invite_codes → UI-UNWIRED |  |
| Self Mood — 🔴 NOT STARTED / ~4-5 hours to complete | apps/gurudevi-mobile/docs/brain_archive/EXTENDED_SESSION_SUMMARY_2026-02-14.md:184 | 2026-02-14 | self-wellbeing:self.getMoodHistory → PARTIAL |  |
| Create a post — ✅ `CreatePostModal` / — | apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md:166 | 2026-03-01 | community-feed:community.createPost → PARTIAL |  |
| Attendance Tracking — `AttendanceSheet.tsx` / ✅ Complete | apps/gurudevi-mobile/docs/old_docs/COMPREHENSIVE_APP_ANALYSIS.md:149 | 2026-07-24 | attendance:supabase.write:attendance → UI-UNWIRED |  |
| **Comments** — ✅ Implemented / Post responses | apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_FEATURE_MAPPING.md:105 | 2026-02-19 | community-feed:community.getComments → PARTIAL |  |
| **Announcements + Read Receipts** — ✅ Easy / 1 week | apps/gurudevi-mobile/docs/Core/archive/GURUDEVI_STACK_v3_1_FINAL.md:496 | 2026-02-28 | pkg:core:supabase.read:announcements → UI-UNWIRED |  |
| Migrate `Attendance` tracking (Daily records, Pulse) | packages/core/docs/current_progress/2026-05-16-api-purge-tasks.md:19 | 2026-07-28 | attendance:attendance.getSchoolPulse → UI-UNWIRED |  |

## Docs that disagree with each other (10 intents)

Some docs mark these done and others mark them not done. Listed oldest to newest; the newest non-superseded doc wins.

| intent | claims over time |
|---|---|
| Ã¢Å¡Â Ã¯Â¸Â Principal aggregated attendance dashboard | 2026-02-04 not-done (superseded) 1402_task.md; 2026-02-04 done GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md; 2026-02-04 done GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md; 2026-02-04 done GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md; 2026-02-05 not-done task.md; 2026-02-09 not-done GURUDEVI_COMPLETE_PRD.md |
| Achievement system for profile completion | 2026-02-04 not-done (superseded) 1605_session_retrospective.md; 2026-02-04 done (superseded) 1402_task.md; 2026-02-05 done task.md; 2026-02-09 not-done GURUDEVI_COMPLETE_PRD.md; 2026-02-11 not-done (superseded) GURUDEVI_COMPLETE_PRD.md; 2026-02-19 not-done ALPHA_REQUIREMENTS.md |
| ✅ Library (teacher upload, student view) | 2026-02-04 not-done (superseded) 0806_status_and_action_plan.md; 2026-02-04 not-done (superseded) 1402_task.md; 2026-02-05 intent GETTING_STARTED.md; 2026-02-05 not-done task.md; 2026-02-25 not-done 2026-02-18_next_phase_roadmap.md; 2026-02-25 done ARCHITECTURE_TECH_STACK.md |
| Library: 20 resources display correctly | 2026-02-04 not-done GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md; 2026-02-19 done ALPHA_REQUIREMENTS.md; 2026-02-28 intent (superseded) BUILD_ORDER.md; 2026-03-30 intent 2026-05-16-teacher-classroom-inner-view-audit.md; 2026-05-07 not-done (superseded) GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md; 2026-07-24 not-done (superseded) GURUDEVI_ALPHA_COMPLETE_FINAL.md |
| Search functionality (Pagefind integration) | 2026-02-04 intent (superseded) 2324_EDLOVE_PAGES_WALKTHROUGH.md; 2026-02-25 not-done FULL_IMPLEMENTATION_REPORT.md; 2026-07-28 done edlove-master-design-document-v2.md; 2026-07-28 intent project-proposal-full.md; 2026-07-28 not-done 2026-02-03-10-roadmap.md; 2026-07-28 not-done 2026-02-05-strategic-roadmap-2026-2028.md |
| Student profile creation (individual) working | 2026-02-09 done GURUDEVI_COMPLETE_PRD.md; 2026-02-09 not-done GURUDEVI_COMPLETE_PRD.md; 2026-02-11 done (superseded) GURUDEVI_COMPLETE_PRD.md; 2026-02-11 not-done (superseded) GURUDEVI_COMPLETE_PRD.md; 2026-02-19 done ALPHA_REQUIREMENTS.md |
| Create Implementation Plan (Schema, API, UI) <!-- id: 0 --> | 2026-02-11 not-done (superseded) 2229_task.md; 2026-02-11 done (superseded) 1353_task.md; 2026-02-11 done (superseded) 1651_task.md; 2026-02-11 not-done (superseded) 0316_task.md |
| CodeQL security scan passed | 2026-06-20 not-done developer-workflow-guide.md; 2026-07-24 done (superseded) IMPLEMENTATION_SUMMARY.md; 2026-07-24 done (superseded) MISSION_01_IMPLEMENTATION.md |
| Press button with haptic feedback | 2026-02-04 done (superseded) 0844_lotus_fab_plan.md; 2026-02-04 not-done (superseded) 1727_implementation_plan.md; 2026-02-04 not-done (superseded) LotusPetalFAB.README.md |
| **Progress Tracking** — ✅ Easy / 1 week | 2026-02-28 done (superseded) GURUDEVI_STACK_v3_1_FINAL.md; 2026-07-24 not-done (superseded) onboarding_design.md |

## Superseded docs: 479 canonical docs (archive/old/deleted/historical status)

Intents that come only from superseded docs are kept with `all_superseded: true` and never set `likely_wanted`.

## Intent timeline (first appearance by month)

| month | new intents | MATCHED | PLANNED | CONTRADICTED |
|---|---|---|---|---|
| 2026-02 | 1120 | 244 | 335 | 117 |
| 2026-03 | 407 | 143 | 190 | 21 |
| 2026-04 | 129 | 15 | 51 | 1 |
| 2026-05 | 84 | 15 | 22 | 4 |
| 2026-06 | 97 | 16 | 19 | 5 |
| 2026-07 | 564 | 133 | 126 | 49 |
| 2026-08 | 411 | 85 | 79 | 17 |
| 2026-09 | 420 | 71 | 89 | 5 |
| 2026-10 | 157 | 24 | 25 | 1 |

## Per-doc summary (canonical docs)

| doc | origin | kind | date | last commit | status | dup group | lines extracted | MATCHED/NEW/CONTRA |
|---|---|---|---|---|---|---|---|---|
| .agents/scratch/tasks.md | main | vendor-skill | 2026-05-06 09:30 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| .agents/skills/CATALOG.md | main | vendor-skill | 2026-09-05 17:16 | 2026-09-05 17:16 |  | 1 | 0 | 0/0/0 |
| .agents/skills/agent-device-control/SKILL.md | main | vendor-skill | 2026-08-14 17:25 | 2026-09-04 07:59 |  | 1 | 0 | 0/0/0 |
| .agents/skills/analytics-explore/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/android-build/SKILL.md | main | vendor-skill | 2026-10-08 21:15 | 2026-10-08 21:15 |  | 1 | 0 | 0/0/0 |
| .agents/skills/branded-ui/SKILL.md | main | vendor-skill | 2026-10-08 21:15 | 2026-10-08 21:15 |  | 1 | 0 | 0/0/0 |
| .agents/skills/cloudflare-deploy/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/doc/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/drizzle/SKILL.md | main | vendor-skill | 2026-08-10 22:44 | 2026-08-10 22:44 |  | 1 | 0 | 0/0/0 |
| .agents/skills/experiment-analyze/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/experiment-brainstorm/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/experiment-design/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/experiment-launch/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/experiment-stop/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/expo-rn-expert/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-10-08 21:15 |  | 1 | 0 | 0/0/0 |
| .agents/skills/figma-code-connect-components/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/figma-create-design-system-rules/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/figma-create-new-file/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/figma-generate-design/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/figma-generate-library/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/figma-implement-design/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/figma-use/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/figma/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/flag-cleanup/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-create/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-default-value/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-experiment/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-graph/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-metadata/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-monitoring/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-prerequisites/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-publish/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-ramp/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-review/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-revisions/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-rules/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-schedule/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-search/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-targeting/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/flag-toggle/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/frontend-skill/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/gb-setup/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/gh-address-comments/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/gh-fix-ci/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/growthbook-feature-rollout/skill.md | main | vendor-skill | 2026-06-21 | 2026-10-08 21:15 | active | 2 | 0 | 0/0/0 |
| .agents/skills/gurudevi-quality-gate/SKILL.md | main | vendor-skill | 2026-07-17 13:25 | 2026-07-26 09:31 |  | 1 | 0 | 0/0/0 |
| .agents/skills/imagegen/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/intentional-ui-design/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/jupyter-notebook/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/linear/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/metric-search/SKILL.md | main | vendor-skill | 2026-08-04 20:03 | 2026-08-04 20:03 |  | 1 | 0 | 0/0/0 |
| .agents/skills/mmkv-guidance/SKILL.md | main | vendor-skill | 2026-07-17 23:32 | 2026-07-17 23:32 |  | 1 | 0 | 0/0/0 |
| .agents/skills/netlify-deploy/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/nitro-guidance/SKILL.md | main | vendor-skill | 2026-07-17 23:32 | 2026-07-17 23:32 |  | 1 | 0 | 0/0/0 |
| .agents/skills/open-source-maintainer/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/openai-docs/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/pdf/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/playwright-interactive/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/playwright/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/powersync-expert/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/powersync/AGENTS.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/CLAUDE.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/SKILL.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/attachments.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/custom-backend.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/onboarding-custom.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/onboarding-supabase.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/powersync-cli.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/powersync-debug.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/powersync-overview.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/powersync-service.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/raw-tables.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-dart.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-dotnet.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-js-node.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-js-orm.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-js-react-native.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-js-react.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-js-tanstack.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-js-vue.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-js.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-kotlin.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sdks/powersync-swift.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/supabase-auth.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/powersync/references/sync-config.md | main | vendor-skill | 2026-06-22 21:58 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |
| .agents/skills/render-deploy/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/resilient-crawler-pipeline/SKILL.md | main | vendor-skill | 2026-10-06 14:04 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| .agents/skills/screenshot/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/security-best-practices/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/security-ownership-map/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/security-threat-model/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/sentry/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/storage-efficiency/SKILL.md | main | vendor-skill | 2026-08-29 20:21 | 2026-10-08 21:15 |  | 1 | 0 | 0/0/0 |
| .agents/skills/supabase-expert/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/supabase/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/ui-polisher/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/vercel-deploy/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/winui-app/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/workspace-documentation/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-09-04 07:59 |  | 2 | 0 | 0/0/0 |
| .agents/skills/yeet/skill.md | main | vendor-skill | 2026-07-15 18:27 | 2026-07-15 18:27 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-access-control/references/access-control-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-access-control/references/enforcing-policies.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-access-control/references/field-level.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-access-control/references/policy-plugin-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-access-control/references/post-update.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-access-control/references/write-policies.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-access-control/references/zmodel-expression-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-elysia.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-express.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-fastify.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-hono.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-next.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-nuxt.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-sveltekit.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/adapter-tanstack-start.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/api-handler-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/api-handler-rest.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/api-handler-rpc.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/api-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/client-sdk-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/fetch-client.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/openapi-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/openapi-restful.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/openapi-rpc.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/server-adapter.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/service-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-crud-server/references/tanstack-query.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-db-migration/references/cli-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 4 | 0 | 0/0/0 |
| .agents/skills/zenstack-db-migration/references/introspection.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 4 | 0 | 0/0/0 |
| .agents/skills/zenstack-db-migration/references/migration.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 4 | 0 | 0/0/0 |
| .agents/skills/zenstack-migrate-from-prisma/references/migrate-prisma.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-migrate-from-v2/references/migrate-v2.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/entity-mutation-hooks.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/extending-orm-client.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/kysely-query-hooks.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/plugin-dev.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/query-api-hooks.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/runtime-plugins-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/zmodel-plugin-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-plugin-dev/references/zmodel-plugin.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-project-setup/references/cli.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-project-setup/references/prerequisite.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-project-setup/references/quick-start.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-aggregate.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-count.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-create.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-delete.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-filter.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-find.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-group-by.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-raw-sql.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-transaction.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/api-update.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/client.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/computed-fields.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 4 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/custom-procedures.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/errors.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/inferred-types.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/input-validation-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/logging.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/orm-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/polymorphism.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/query-builder.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/typed-json.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-querying/references/validation.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/attribute.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/custom-type.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/datasource.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/enum.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/mixin.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/model.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/modeling-overview.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/polymorphism.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/relation.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/typed-json.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/zmodel-attribute-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/skills/zenstack-schema-modeling/references/zmodel-function-reference.md | deleted 0eff3863 | vendor-skill | 2026-06-26 23:01 | 2026-07-03 05:33 |  | 2 | 0 | 0/0/0 |
| .agents/workflows/code-execution.md | main | vendor-skill | 2026-02-28 15:44 | 2026-02-28 15:44 |  | 1 | 0 | 0/0/0 |
| .agents/workflows/sovereign-quality-gate.md | main | vendor-skill | 2026-05-06 09:30 | 2026-05-06 09:56 |  | 1 | 0 | 0/0/0 |
| .changeset/README.md | main | architecture/dev | 2026-04-23 08:45 | 2026-04-23 08:45 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1776914148303.md | deleted 4cd41ed5 | other | 2026-04-23 08:45 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777037178465.md | deleted 4cd41ed5 | other | 2026-04-24 18:56 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777046732988.md | deleted 4cd41ed5 | other | 2026-04-24 21:35 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777055549646.md | deleted 4cd41ed5 | other | 2026-04-25 00:02 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777059251185.md | deleted 4cd41ed5 | other | 2026-04-25 01:04 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777059523105.md | deleted 4cd41ed5 | other | 2026-04-25 01:08 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777081524546.md | deleted 4cd41ed5 | other | 2026-04-25 07:15 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777083682575.md | deleted 4cd41ed5 | other | 2026-04-25 07:51 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777085822217.md | deleted 4cd41ed5 | other | 2026-04-25 08:27 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777086402323.md | deleted 4cd41ed5 | other | 2026-04-25 08:36 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777183377368.md | deleted 4cd41ed5 | other | 2026-04-26 11:32 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777198771254.md | deleted 4cd41ed5 | other | 2026-04-26 15:49 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777206869130.md | deleted 4cd41ed5 | other | 2026-04-26 18:04 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777253028078.md | deleted 4cd41ed5 | other | 2026-04-27 06:53 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777253042586.md | deleted 4cd41ed5 | other | 2026-04-27 06:54 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777256847825.md | deleted 4cd41ed5 | other | 2026-04-27 07:57 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777259645539.md | deleted 4cd41ed5 | other | 2026-04-27 08:44 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777453193638.md | deleted 4cd41ed5 | other | 2026-04-29 14:29 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1777453886906.md | deleted 4cd41ed5 | other | 2026-04-29 14:41 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1778040039241.md | deleted 4cd41ed5 | other | 2026-05-06 09:30 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1778041574413.md | deleted 4cd41ed5 | other | 2026-05-06 09:56 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1778131161141.md | deleted 4cd41ed5 | other | 2026-05-07 10:49 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1778133868731.md | deleted 4cd41ed5 | other | 2026-05-07 11:34 | 2026-05-07 11:43 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1778255748985.md | main | other | 2026-05-08 21:25 | 2026-05-08 21:25 |  | 1 | 0 | 0/0/0 |
| .changeset/smart-1778944136452.md | main | other | 2026-05-16 20:38 | 2026-05-16 20:38 |  | 12 | 0 | 0/0/0 |
| .changeset/smart-1791100007446.md | main | other | 2026-10-06 14:04 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| .claude/skills/expo-rn-expert/skill.md | main | vendor-skill | 2026-05-31 09:39 | 2026-05-31 09:39 |  | 1 | 0 | 0/0/0 |
| .claude/skills/zenstack-access-control/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-crud-server/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-db-migration/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-migrate-from-prisma/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-migrate-from-v2/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-plugin-dev/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-project-setup/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-querying/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .claude/skills/zenstack-schema-modeling/skill.md | main | vendor-skill | 2026-08-24 19:45 | 2026-08-24 19:45 |  | 3 | 0 | 0/0/0 |
| .github/ISSUE_TEMPLATE/bug_report.md | main | progress/status | 2026-08-29 20:21 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| .github/ISSUE_TEMPLATE/feature_request.md | main | other | 2026-08-29 20:21 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| .github/agent_missions/MISSION_01_SELF.md | branch-only | other | 2026-02-05 00:46 | 2026-02-05 00:46 |  | 1 | 0 | 0/0/0 |
| .github/copilot-instructions.md | main | other | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 37 | 0/1/0 |
| .github/maintainer/context.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 2 | 0/0/0 |
| .github/maintainer/contributors.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/decisions.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/patterns.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/runs.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/standing-rules.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/work/agent-briefs.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/work/agent-prompts.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/work/opportunities.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/maintainer/work/queue.md | main | other | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| .github/pull_request_template.md | main | other | 2026-10-02 | 2026-10-06 14:04 | active | 1 | 21 | 1/0/0 |
| /workspace/edlove-plan/DATA_LAYERS_CASE_AGAINST.md | plan | plan | 2026-10-16 (plan |  |  | 1 | 15 | 0/0/0 |
| /workspace/edlove-plan/DATA_LAYERS_CASE_FOR.md | plan | plan | 2026-10-16 (plan |  |  | 1 | 0 | 0/0/0 |
| /workspace/edlove-plan/EDLOVE_DEFLATION_PLAN.md | plan | plan | 2026-10-16 (plan |  |  | 1 | 64 | 3/2/0 |
| /workspace/edlove-plan/EDLOVE_INTEGRATED_PLAN.md | plan | plan | 2026-10-16 (plan |  |  | 1 | 41 | 0/2/0 |
| AGENTS.md | deleted 146fa2fd | other | 2026-10-04 | 2026-10-08 21:15 | active | 1 | 3 | 0/0/0 |
| CODE_OF_CONDUCT.md | main | other | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| CONTRIBUTING.md | main | other | 2026-08-29 20:21 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| DCO.md | main | other | 2026-10-06 14:04 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| LIBRARY_SEED_SOP.md | deleted 83faa3ee | other | 2026-03-13 21:58 | 2026-03-16 12:22 |  | 1 | 0 | 0/0/0 |
| README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| SECURITY.md | main | other | 2026-08-29 20:21 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| apps/00_ECOSYSTEM_INDEX.md | main | other | 2026-08-24 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/edlove-web/AGENTS.md | main | other | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/CLAUDE.md | main | other | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/CONTEXT.md | deleted 190614ac | other | 2026-04-18 | 2026-10-15 15:42 | active | 1 | 0 | 0/0/0 |
| apps/edlove-web/Docs/00_INDEX.md | deleted 08ebc35e | architecture/dev | 2026-02-03 16:43 | 2026-07-28 12:18 |  | 1 | 20 | 2/2/0 |
| apps/edlove-web/Docs/11_SUBDOMAIN_NOTES.md | branch-only | architecture/dev | 2026-02-09 11:22 | 2026-02-09 11:22 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/Docs/INNOVATIONS_AND_IMPROVEMENTS.md | deleted bc03458b | architecture/dev | 2026-02-05 11:27 | 2026-02-12 08:04 |  | 1 | 1 | 0/0/0 |
| apps/edlove-web/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 17:33 | active | 1 | 0 | 0/0/0 |
| apps/edlove-web/content/cosmos/01-biological.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/cosmos/02-industrial.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/cosmos/03-montessori.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/cosmos/04-democratic.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/cosmos/05-unschooling.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/cosmos/06-indigenous.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/001-ecobasa.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/002-learnreciprocal.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/003-gratitude-x-mooc.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/004-donorschoose.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/005-open-collective-education.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/006-learning-council-gift-model.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/007-p2pu.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/008-kresge-commons.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/009-radical-childcare-coops.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/010-timebank-education.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/011-gitcoin-education-grants.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/012-thuthimal-protocol.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/013-kolibri.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/014-beekee-box.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/015-ka-lite.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/016-simba-education.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/017-eneza-education.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/018-befit-malawi.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/019-internet-in-a-box.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/020-rachel-world-possible.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/021-aleutia-solar-classroom.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/022-kiwix.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/023-foondamate.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/024-mesh-potato-serval.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/025-powersync-local-first.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/026-offline-scratch.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/027-calibre-offline-library.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/028-slow-education-movement.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/029-contemplative-technopedagogy.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/030-tagore-visva-bharati.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/031-buberian-dialogic-tech.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/032-waldorf-analog-anchor.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/033-reggio-emilia-atelier.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/034-mindful-schools.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/035-krishnamurti-schools.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/036-forest-schools.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/037-calm-classroom.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/038-wake-up-schools.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/039-teaning-epistemology.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/040-idoceo.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/041-schedulemaker.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/042-zipgrade.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/043-planboard-chalk.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/044-goodnotes-teacher-planners.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/045-magicschool-ai.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/046-diffit-teachers.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/047-canva-for-education.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/048-obsidian-for-educators.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/049-curipod.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/050-brisk-teaching.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/051-gurudevi-mobile-sanctuary.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/052-ecole-42.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/053-schoolhouse-world.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/054-sugata-mitra-sole.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/055-sudbury-valley.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/056-agora-school-netherlands.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/057-altschool-africa.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/058-freecodecamp.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/059-deep-springs-college.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/060-swarm-learning-pods.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/061-socrat-ai.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/062-kiron-open-higher-ed.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/063-enspiral-dev-academy.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/064-turing-school.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/065-plan-ceibal-uruguay.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/066-estonia-e-kool.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/067-south-korea-ai-textbooks.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/068-dp-education-sri-lanka.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/069-diksha-india.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/070-nenasa-sri-lanka.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/071-e-thaksalawa-sri-lanka.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/072-rwanda-smart-classroom.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/073-finland-phenomenon-learning.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/074-kazakhstan-ai-curriculum.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/075-olpc-xo-laptop.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/076-stemup-sri-lanka.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/077-pasifika-education-lens.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/078-reciprocal-education-approach-canada.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/079-indigenous-tech-australia.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/080-green-school-bali.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/081-sekem-egypt.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/082-barefoot-college-india.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/083-mukurtu-cms.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/084-terralingua-biocultural.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/085-te-kohanga-reo-maori.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/086-alpa-kids-vernacular.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/087-auroville-integral-education.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/088-kalu-ganga-bioregional.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/089-classroomio.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/090-learnhouse.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/091-frappe-lms.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/092-moodle-ecosystem.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/093-canvas-open-source.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/094-chamilo-lms.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/095-openedx-platform.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/096-sakai-project.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/097-openolat.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/098-h5p-interactive-content.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/099-bigbluebutton.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/100-phet-simulations.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/101-anki-spaced-repetition.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/102-logseq-outliner.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/103-roam-research.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/104-tiddlywiki-notebook.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/105-remnote-concept-workspace.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/106-heptabase-visual-map.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/107-marginnote-multimodal-reader.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/108-zotero-open-research.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/109-scispace-literature-navigator.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/110-elicit-research-ai.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/111-consensus-evidence-engine.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/112-readwise-reader.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/113-liquidtext-workspace.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/114-khanmigo-socratic-ai.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/115-q-chat-socratic-assistant.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/116-claude-academic-dialogue.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/117-hello-history-dialogue.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/118-oatmeal-socratic-bot.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/119-prof-jim-cinematic-ai.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/120-amira-reading-companion.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/121-socratic-by-google.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/122-synthesis-tutor.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/123-kialo-edu-argument-mapping.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/124-parlay-ideas-discussion.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/125-mindstone-active-learning.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/126-opendyslexic-typeface.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/127-be-my-eyes-assistive.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/128-coughdrop-open-aac.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/129-seeing-ai-narrator.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/130-speechify-accessible-reading.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/131-otter-accessible-transcripts.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/132-goblin-tools-neurodiverse.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/133-tiimo-adhd-visual-planner.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/134-bionic-reading-algorithm.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/135-specialeffect-eyemine.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/136-dot-braille-display.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/137-ava-classroom-transcriber.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/138-arduino-open-hardware.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/139-bbc-microbit-foundation.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/140-raspberry-pi-foundation.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/141-netlogo-complex-systems.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/142-geogebra-dynamic-math.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/143-stellarium-planetarium.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/144-makey-makey-invention-kit.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/145-fablab-academy-commons.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/146-tinkercad-3d-maker.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/147-snap-visual-programming.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/148-godot-engine-schools.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/149-minetest-educational-sandbox.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/150-wildflower-montessori-network.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/151-prenda-microschool-hub.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/152-acton-academy-network.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/153-summerhill-school.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/154-high-tech-high-projects.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/155-nuvu-innovation-studio.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/156-quest-to-learn-game-school.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/157-brockwood-park-school.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/158-mirambika-free-progress.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/159-think-global-school.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/160-shanti-bhavan-project.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/161-studio-schools-model.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/162-kaospilot-leadership-school.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/163-mit-opencourseware.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/164-openstax-textbooks.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/165-oer-commons-library.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/166-wikiversity-commons.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/167-project-gutenberg-library.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/168-internet-archive-open-library.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/169-arxiv-open-science.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/170-doaj-open-access.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/171-pressbooks-open-publishing.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/172-libretexts-open-network.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/173-creative-commons-licenses.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/174-curriki-open-curricula.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/175-sci-hub-open-access.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/176-babeld-mesh-routing.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/177-libremesh-community-firmware.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/178-guifi-net-telecom-commons.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/179-disaster-radio-solar-mesh.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/180-meshtastic-lora-mesh.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/181-solar-protocol-web.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/182-low-tech-magazine-solar-web.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/183-hermes-open-sms-mesh.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/184-serval-mesh-calling.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/185-village-telco-mesh-potato.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/186-outernet-satellite-data.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/187-openwrt-embedded-linux.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/188-briar-mesh-messaging.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/189-ipfs-distributed-web.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/190-holochain-agent-framework.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/191-secure-scuttlebutt-mesh.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/192-radicle-code-collaboration.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/193-urbit-sovereign-identity.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/194-commons-stack-engineering.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/195-regen-network-ecological.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/196-permaculture-design-commons.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/197-saranath-bio-pedagogy.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/198-pfeiffer-biodynamic-science.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/199-earthship-biotecture-academy.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/innovations/200-edlove-cosmos-sanctuary.md | main | content/marketing | 2026-09-02 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| apps/edlove-web/content/journal/architecture-of-gratitude.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/journal/beyond-extractive-classroom.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/journal/learning-as-care-work.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/library/framework-teaning.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/library/thinker-freire.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/content/library/thinker-montessori.md | main | content/marketing | 2026-10-15 15:42 | 2026-10-15 15:42 |  | 2 | 0 | 0/0/0 |
| apps/edlove-web/docs/architecture/11-subdomain-notes.md | deleted 190614ac | architecture/dev | 2026-08-24 | 2026-10-15 15:42 | active | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/authors/edlove.md | deleted 190614ac | other | 2026-09-01 01:53 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/community/01-trust-sangha.md | deleted 190614ac | other | 2026-02-12 11:04 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/cosmos/01-life-wisdom.md | deleted 9e9c0b06 | other | 2026-02-12 11:04 | 2026-02-14 07:14 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/cosmos/02-factory-model.md | deleted 9e9c0b06 | other | 2026-02-12 11:04 | 2026-02-14 07:14 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/cosmos/05-indigenous-knowledge.md | deleted 9e9c0b06 | other | 2026-02-12 11:04 | 2026-02-14 07:14 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/gurudevi/pillar-01-self.md | deleted 190614ac | other | 2026-02-12 11:04 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/gurudevi/pillar-02-classroom.md | deleted 190614ac | other | 2026-02-12 11:04 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/gurudevi/pillar-03-community.md | deleted 190614ac | other | 2026-02-14 07:14 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/gurudevi/pillar-04-library.md | deleted 190614ac | other | 2026-02-14 07:14 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/resources/01-vision.md | deleted 9e9c0b06 | plan | 2026-02-12 11:04 | 2026-02-14 07:14 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/resources/02-how-it-works.md | deleted 9e9c0b06 | other | 2026-02-12 11:04 | 2026-02-14 07:14 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/resources/global-gallery.md | deleted 190614ac | other | 2026-02-14 07:14 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/resources/pattern-language.md | deleted 190614ac | other | 2026-02-14 07:14 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/sri-lanka/01-local-roots.md | deleted 9e9c0b06 | other | 2026-02-12 11:04 | 2026-02-14 07:14 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/sri-lanka/02-teacher-dignity.md | deleted 9e9c0b06 | other | 2026-02-12 11:04 | 2026-02-14 07:14 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/sri-lanka/discrepancies.md | deleted 190614ac | other | 2026-02-14 07:14 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/sri-lanka/government-schooling.md | deleted 190614ac | other | 2026-02-14 07:14 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/edlove-web/src/content/sri-lanka/tuition-culture.md | deleted 190614ac | other | 2026-02-14 07:14 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/CONTEXT.md | main | content/marketing | 2026-03-20 | 2026-08-24 19:15 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/DEPRECATION.md | main | content/marketing | 2026-10-06 14:04 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/README.md | main | content/marketing | 2026-10-15 | 2026-10-15 19:19 | deprecated | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/Core/core-idea.md | main | content/marketing | 2026-07-28 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/Core/editorial-and-media-guidelines.md | main | content/marketing | 2026-09-01 | 2026-09-03 01:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/Core/editorial-sanctuary-layout.md | main | content/marketing | 2026-09-01 | 2026-09-03 01:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/Core/gurudevi-copy-and-content-guide.md | main | content/marketing | 2026-08-08 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/Core/quantitative-ui-ux-quality-gate.md | main | content/marketing | 2026-09-01 | 2026-09-03 01:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/Core/typography-families-and-optical-physics.md | main | content/marketing | 2026-09-09 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/INDEX.md | main | content/marketing | 2026-07-28 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/current_progress/2026-08-13-gurudevi-marketing-redesign-plan.md | main | content/marketing | 2026-08-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/current_progress/tasks.md | main | content/marketing | 2026-07-28 | 2026-08-29 20:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/docs-sop.md | main | content/marketing | 2026-09-01 | 2026-09-03 01:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/docs/tasks.md | branch-only | content/marketing | 2026-03-20 22:35 | 2026-03-20 22:35 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/src/content/authors/gurudevi.md | main | content/marketing | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/src/content/authors/naveen.md | main | content/marketing | 2026-09-03 01:45 | 2026-09-03 01:45 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/src/content/journal/architecture-of-gratitude.md | main | content/marketing | 2026-09-03 01:45 | 2026-09-03 01:45 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/src/content/journal/beyond-extractive-classroom.md | main | content/marketing | 2026-09-03 01:45 | 2026-09-03 01:45 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/src/content/journal/meaning-of-gurudevi.md | main | content/marketing | 2026-09-03 01:45 | 2026-09-03 01:45 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/src/content/journal/what-is-gurudevi-app.md | main | content/marketing | 2026-09-03 01:45 | 2026-09-03 01:45 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-marketingWeb/src/content/journal/why-gurudevi-begins-with-care.md | main | content/marketing | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/.agents/skills/react-doctor/SKILL.md | main | vendor-skill | 2026-06-13 12:07 | 2026-06-13 12:07 |  | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/.agents/skills/react-doctor/references/explain.md | main | vendor-skill | 2026-06-13 | 2026-08-24 18:46 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/CURRENT_SPRINT.md | branch-only | plan | 2026-02-03 16:43 | 2026-02-04 08:51 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/Core/GETTING_STARTED.md | branch-only | other | 2026-02-05 00:30 | 2026-02-05 00:30 |  | 2 | 84 | 5/18/0 |
| apps/gurudevi-mobile/Docs v 3.0/Core/GURUDEVI_COMPLETE_PRD.md | branch-only | plan | 2026-02-09 15:29 | 2026-02-09 15:29 |  | 3 | 48 | 10/10/8 |
| apps/gurudevi-mobile/Docs v 3.0/Support/GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md | branch-only | architecture/dev | 2026-02-04 18:53 | 2026-02-04 18:53 |  | 2 | 33 | 9/7/0 |
| apps/gurudevi-mobile/Docs v 3.0/Support/THUTHIMAL_README.md | branch-only | architecture/dev | 2026-02-09 15:29 | 2026-02-09 15:29 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/Tasks/task.md | branch-only | plan | 2026-02-05 00:30 | 2026-02-05 00:30 |  | 1 | 66 | 10/19/8 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/00_RECENT_DASHBOARD.md | deleted fdb3a463 | other | 2026-02-04 18:20 | 2026-02-11 21:21 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-03_2324_Phase 1 Foundation Implementation/1721_walkthrough.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-03_2324_Phase 1 Foundation Implementation/2215_EDLOVE_FOUNDATION_GUIDE.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 5 | 0/2/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-03_2324_Phase 1 Foundation Implementation/2216_EDLOVE_WALKTHROUGH.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 9 | 0/3/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-03_2324_Phase 1 Foundation Implementation/2246_GURUDEVI_API_GUIDE.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 2 | 0/1/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-03_2324_Phase 1 Foundation Implementation/2324_EDLOVE_PAGES_WALKTHROUGH.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 12 | 4/3/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0832_github_agent_delegation_guide.md | branch-only | architecture/dev | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 2 | 0/1/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0850_agent_reference_guide.md | branch-only | architecture/dev | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0942_agent_review_walkthrough.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 17 | 1/2/1 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1715_Gurudevi Development Tasks/1405_supabase_setup_guide.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 1 | 0/1/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1715_Gurudevi Development Tasks/1414_walkthrough.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1715_Gurudevi Development Tasks/1428_path_dependence_explained.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1715_Gurudevi Development Tasks/1435_database_setup_guide.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 9 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1715_Gurudevi Development Tasks/1455_supabase_auth_explained.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 4 | 0/1/1 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1715_Gurudevi Development Tasks/1605_session_retrospective.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 9 | 1/1/1 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Learning_and_Walkthrough/2026-02-04_1813_Task_ Evolve to a Sovereign Incremental Archive/1809_walkthrough.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-03_2324_Phase 1 Foundation Implementation/2140_AI_AGENT_STRATEGY.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 6 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0806_status_and_action_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 75 | 8/7/1 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0820_immediate_action_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 6 | 3/1/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0844_lotus_fab_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 5 | 15 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0948_doc_consolidation_strategy.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1032_COMPLETE_DOC_CONSOLIDATION_PLAN.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 9 | 0/8/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1036_MASTER_ROADMAP.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 9 | 1/2/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Planning_and_Strategies/2026-02-04_1715_Gurudevi Development Tasks/1715_strategic_delegation_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2025-11-26_1215_Domain & Email Setup Guide/1146_task.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 5 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-02_2018_EdLove Ecosystem Task List/0813_task.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 21 | 1/0/7 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-02_2018_EdLove Ecosystem Task List/0814_implementation_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-03_2324_Phase 1 Foundation Implementation/1716_task.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 46 | 1/0/5 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-03_2324_Phase 1 Foundation Implementation/1727_implementation_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 72 | 0/6/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0826_frontend_only_tasks.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0840_task.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 17 | 0/1/1 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0948_next_agent_tasks.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 12 | 3/5/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1355_implementation_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1715_Gurudevi Development Tasks/1402_task.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 55 | 8/19/5 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1715_Gurudevi Development Tasks/1424_implementation_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1715_Gurudevi Development Tasks/agent_mode_prompts.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 5 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1715_Gurudevi Development Tasks/grading_system_design.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 5 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1813_Task_ Evolve to a Sovereign Incremental Archive/1732_task.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 8 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Tasks_and_Implementations/2026-02-04_1813_Task_ Evolve to a Sovereign Incremental Archive/1752_implementation_plan.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-02_2018_EdLove Ecosystem Task List/1046_graphics_tech_tiers.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 2 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-03_2324_Phase 1 Foundation Implementation/1858_PHASE_1_COMPLETE.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-03_2324_Phase 1 Foundation Implementation/2149_AGENT_PROMPT_TEMPLATES.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 4 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-03_2324_Phase 1 Foundation Implementation/2149_FOUNDATION_CATEGORIES.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-03_2324_Phase 1 Foundation Implementation/2207_FOUNDATION_ASSESSMENT.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 22 | 0/2/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-03_2324_Phase 1 Foundation Implementation/2230_GIT_WORKFLOW_SUMMARY.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 5 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-03_2324_Phase 1 Foundation Implementation/2248_OPTIONS_COMPLETE_SUMMARY.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 8 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0833_README.md | branch-only | architecture/dev | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0900_learnings.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 2 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/0900_powershell_cheatsheet.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1038_QUICK_REFERENCE.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1040_SESSION_JOURNAL.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 2 | 1/1/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1040_START_HERE.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 2 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1143_batch1_review.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 23 | 1/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1149_edlove_fixes.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1355_TASK_ Prepare GitHub Agent Prompts/1155_edlove_premium_ui.md | branch-only | other | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 2 | 7 | 0/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1715_Gurudevi Development Tasks/1505_terminal_analysis.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 6 | 1/0/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1715_Gurudevi Development Tasks/1554_next_steps.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 5 | 1/2/0 |
| apps/gurudevi-mobile/Docs v 3.0/brain_archive/Uncategorized/2026-02-04_1715_Gurudevi Development Tasks/1600_sql_comparison.md | branch-only | plan | 2026-02-04 18:20 | 2026-02-04 18:20 |  | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 2 | 1/0/1 |
| apps/gurudevi-mobile/assets/fonts/Abhaya_Libre,Baloo_Thambi_2/Abhaya_Libre/OFL.txt | deleted 95acfc46 | other | 2026-02-03 18:54 | 2026-02-18 15:03 |  | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/assets/fonts/Abhaya_Libre,Baloo_Thambi_2/Baloo_Thambi_2/README.txt | deleted 95acfc46 | architecture/dev | 2026-02-03 18:54 | 2026-02-18 15:03 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/assets/fonts/Noto_Sans_Tamil/README.txt | deleted 95acfc46 | architecture/dev | 2026-02-03 18:45 | 2026-02-18 15:03 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/assets/fonts/README.txt | deleted 95acfc46 | architecture/dev | 2026-02-03 18:45 | 2026-02-18 15:03 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/bdd_acceptance_report.txt | deleted 1ac79d4c | progress/status | 2026-02-12 08:04 | 2026-02-19 22:11 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/2026-06-25-typescript-7-migration-guide.md | main | architecture/dev | 2026-06-25 | 2026-06-25 16:26 | active | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/2026-07-17-reanimated-worklets-migration-analysis.md | main | architecture/dev | 2026-07-17 | 2026-07-24 15:07 | active | 1 | 19 | 0/2/0 |
| apps/gurudevi-mobile/docs/2026-07-17-rngh-v3-migration-analysis.md | main | architecture/dev | 2026-07-24 15:07 | 2026-07-24 15:07 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/2026-08-24-canvas-pattern-other-tabs-analysis.md | main | architecture/dev | 2026-08-24 | 2026-08-24 23:07 | draft | 1 | 43 | 6/6/0 |
| apps/gurudevi-mobile/docs/2026-08-24-workspace-drag-drop-implementation-plan.md | main | plan | 2026-08-24 | 2026-08-24 23:07 | draft | 1 | 36 | 0/1/1 |
| apps/gurudevi-mobile/docs/2026-08-25-unified-canvas-next.md | main | architecture/dev | 2026-08-26 | 2026-09-15 00:36 | superseded | 1 | 14 | 0/1/0 |
| apps/gurudevi-mobile/docs/2026-08-25-unified-canvas-system.md | main | architecture/dev | 2026-08-26 | 2026-09-15 00:36 | superseded | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/2026-08-27-self-elegant-refactor-plan.md | main | plan | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 11 | 0/1/0 |
| apps/gurudevi-mobile/docs/2026-08-27-self-feature-system-audit-and-plan.md | main | plan | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 20 | 1/2/0 |
| apps/gurudevi-mobile/docs/ACTIVE_TASKS.md | branch-only | plan | 2026-02-28 08:52 | 2026-02-28 12:02 |  | 1 | 40 | 3/9/2 |
| apps/gurudevi-mobile/docs/ARCHIVE_CATALOG.md | main | architecture/dev | 2026-08-24 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/CURRENT_STATE.md | branch-only | progress/status | 2026-02-28 08:52 | 2026-02-28 12:08 |  | 1 | 67 | 22/7/2 |
| apps/gurudevi-mobile/docs/Core/2026-07-21-effect-ts-coverage-strategy.md | main | architecture/dev | 2026-07-21 | 2026-09-04 08:05 | active | 1 | 39 | 3/0/0 |
| apps/gurudevi-mobile/docs/Core/20260521_AUTH_EVENTS_AND_MFA_ARCHITECTURE.md | main | architecture/dev | 2026-05-22 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/ARCHITECTURAL_HANDOVER_MANIFEST.md | main | architecture/dev | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/CITIZENSHIP_ARCHITECTURE.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 1 | 3 | 1/0/0 |
| apps/gurudevi-mobile/docs/Core/FEATURE_ENGINE_ARCHITECTURE.md | main | architecture/dev | 2026-07-26 | 2026-07-26 13:47 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/GETTING_STARTED.md | main | architecture/dev | 2026-08-24 | 2026-08-24 18:56 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/GLUESTACK_V3_MIGRATION_AUDIT_2026.md | main | progress/status | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/GROWTH_MODEL.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 1 | 82 | 16/29/0 |
| apps/gurudevi-mobile/docs/Core/GURUDEVI_COMPLETE_PRD.md | main | plan | 2026-02-11 | 2026-08-24 19:20 | superseded | 1 | 48 | 10/10/8 |
| apps/gurudevi-mobile/docs/Core/IDENTITY_AND_DEVICE_TRUST_ARCHITECTURE.md | main | architecture/dev | 2026-05-02 | 2026-08-24 18:46 | active | 1 | 11 | 0/2/0 |
| apps/gurudevi-mobile/docs/Core/MONOREPO_STRUCTURAL_AUDIT_2026.md | main | progress/status | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/NORTH_STAR.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 3 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/README.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/RLS_DEPLOYMENT_GUIDE.md | main | architecture/dev | 2026-02-14 | 2026-08-24 18:46 | active | 1 | 34 | 7/3/0 |
| apps/gurudevi-mobile/docs/Core/RLS_SECURITY_AUDIT.md | main | progress/status | 2026-02-14 | 2026-08-24 18:46 | active | 1 | 11 | 6/4/0 |
| apps/gurudevi-mobile/docs/Core/SCHOOL_CLIMATE_ARCHITECTURE.md | main | architecture/dev | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 1 | 0/1/0 |
| apps/gurudevi-mobile/docs/Core/TESTING_STRATEGY.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/TRIPLE_HELIX_BDD_ANALYSIS.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 2 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/TRUTH_AI_CONTEXT.md | main | architecture/dev | 2026-06-09 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/TRUTH_ARCHITECTURE.md | deleted f7655d4c | architecture/dev | 2026-02-28 15:44 | 2026-06-09 15:31 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/TRUTH_DESIGN_SYSTEM.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/archive/AI_CONTEXT.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 4 | 8 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/archive/ALPHA_RELEASE_TRACKER.md | main | plan | 2026-02-28 | 2026-08-24 18:46 | active | 4 | 13 | 1/2/1 |
| apps/gurudevi-mobile/docs/Core/archive/BUILD_ORDER.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 4 | 122 | 5/39/0 |
| apps/gurudevi-mobile/docs/Core/archive/CRITICAL_FIX_ROADMAP.md | main | plan | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 47 | 10/5/1 |
| apps/gurudevi-mobile/docs/Core/archive/CURRENT_SPRINT.md | main | plan | 2026-02-28 | 2026-08-24 18:46 | active | 3 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/archive/DESIGN_SYSTEM.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/archive/GURUDEVI_ARCHITECTURE_v2_0.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 4 | 6 | 4/2/0 |
| apps/gurudevi-mobile/docs/Core/archive/GURUDEVI_ARCHITECTURE_v5_0.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/archive/GURUDEVI_SECURITY_FOUNDATION_v2_0.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/archive/GURUDEVI_STACK_v3_1_FINAL.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 4 | 23 | 1/2/1 |
| apps/gurudevi-mobile/docs/Core/coding-standards.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/database_enterprise_guide.md | main | architecture/dev | 2026-08-10 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/GURUDEVI_DESIGN_MASTER.md | main | architecture/dev | 2026-03-20 | 2026-09-12 20:24 | active | 1 | 9 | 0/1/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-aesthetic-doctrine.md | main | architecture/dev | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-anti-slop-enforcement.md | main | architecture/dev | 2026-09-09 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-architecture.md | main | architecture/dev | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-component-library.md | main | architecture/dev | 2026-02-27 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-design-language.md | main | architecture/dev | 2026-02-27 | 2026-08-24 19:03 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-design-retina.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-external-world-design-canon.md | main | architecture/dev | 2026-09-09 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-human-interface-implementation-method.md | main | architecture/dev | 2026-09-09 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-multi-archetype-engine.md | main | architecture/dev | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-scene-token-hierarchy.md | main | architecture/dev | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-session-starter.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:20 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-skia-implementation.md | main | architecture/dev | 2026-02-27 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-space-specifications.md | main | plan | 2026-02-27 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/gurudevi-token-resolution.md | main | architecture/dev | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/principal-redesign-gap-map.md | main | plan | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/design/trube-art.md | main | architecture/dev | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/domain-and-users.md | main | architecture/dev | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 8 | 3/5/0 |
| apps/gurudevi-mobile/docs/Core/educational-ecology-philosophy.md | main | architecture/dev | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/effect-otel-production-roadmap.md | main | plan | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 5 | 0/2/0 |
| apps/gurudevi-mobile/docs/Core/effect-ts-coding-guide.md | main | architecture/dev | 2026-07-22 (Laye | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/flash-list-patterns.md | main | architecture/dev | 2026-04-30 | 2026-06-08 19:37 | active | 2 | 8 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/gurudevi-creator-reflection.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/gurudevi_design_framework.md | main | architecture/dev | 2026-02-11 | 2026-08-24 19:15 | active | 3 | 3 | 1/1/0 |
| apps/gurudevi-mobile/docs/Core/gurudevi_foundation_v4.md | main | architecture/dev | 2026-04-23 | 2026-06-08 19:37 | active | 2 | 54 | 3/2/0 |
| apps/gurudevi-mobile/docs/Core/gurudevi_master_implementation_v2.md | main | architecture/dev | 2026-04-29 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/gurudevi_tools_tricks_v2.md | main | architecture/dev | 2026-04-23 | 2026-06-08 19:37 | active | 2 | 14 | 0/1/0 |
| apps/gurudevi-mobile/docs/Core/higher-learning.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/identity-and-access-management.md | main | architecture/dev | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/mcp_architectural_design.md | main | architecture/dev | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 8 | 0/1/0 |
| apps/gurudevi-mobile/docs/Core/monorepo-status-report.md | main | progress/status | 2026-08-12 | 2026-08-12 21:53 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/navigation-chrome-doctrine.md | main | architecture/dev | 2026-06-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/navigation-shell-audit.md | main | progress/status | 2026-06-13 | 2026-08-24 18:46 | active | 1 | 3 | 0/1/0 |
| apps/gurudevi-mobile/docs/Core/observability-and-error-handling-guide.md | main | architecture/dev | 2026-07-26 | 2026-08-13 07:37 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/offline-online-sync-spec.md | main | plan | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/platform_identity_auth_architecture.md | main | architecture/dev | 2026-03-08 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/product-footprint-web-vs-mobile.md | main | architecture/dev | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/project-map.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:15 | active | 1 | 4 | 0/1/0 |
| apps/gurudevi-mobile/docs/Core/sanctuary-api-and-backend-spec.md | main | plan | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/security-and-data-integrity.md | main | architecture/dev | 2026-06-10 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/swm-integration-guide.md | main | architecture/dev | 2026-06-13 | 2026-06-13 12:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/tech-stack.md | main | architecture/dev | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/technical-architecture-constraints.md | main | architecture/dev | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/token-usage-guide.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/ui-development-guide.md | main | architecture/dev | 2026-08-12 | 2026-08-12 21:53 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/web-native-compatibility-guide.md | main | architecture/dev | 2026-06-09 | 2026-06-09 15:31 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Core/workspace-navigation-philosophy.md | main | architecture/dev | 2026-06-11 | 2026-06-13 12:07 | active | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/EVOLUTION.md | branch-only | progress/status | 2026-02-28 08:52 | 2026-02-28 08:54 |  | 1 | 5 | 0/3/0 |
| apps/gurudevi-mobile/docs/FUTURE_ROADMAP.md | branch-only | plan | 2026-02-28 08:52 | 2026-02-28 09:24 |  | 1 | 19 | 3/2/0 |
| apps/gurudevi-mobile/docs/INDEX.md | main | architecture/dev | 2026-09-20 | 2026-09-20 19:49 | active | 1 | 74 | 1/0/0 |
| apps/gurudevi-mobile/docs/Learning/CLAUDE_CAPABILITIES_MAP.md | main | architecture/dev | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 12 | 1/0/0 |
| apps/gurudevi-mobile/docs/Learning/DEVELOPER_REFERENCE.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 3 | 17 | 0/0/0 |
| apps/gurudevi-mobile/docs/Learning/EXPO_AGENT_CLI_GUIDANCE.md | main | architecture/dev | 2026-10-06 | 2026-10-06 21:15 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md | main | architecture/dev | 2026-09-05 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Learning/EXPO_OBSERVE_RUNBOOK.md | main | architecture/dev | 2026-08-28 | 2026-08-29 20:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Learning/FONT_SETUP.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Learning/FONT_STRATEGY.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Learning/QUICK_COMMANDS.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Learning/TRANSLATION_IMPROVEMENTS.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/ARCHITECTURE_VISUALIZATION.md | main | architecture/dev | 2026-03-16 | 2026-08-24 18:46 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/LIBRARY_SEED_SOP.md | main | architecture/dev | 2026-03-14 | 2026-08-24 18:46 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/api-research.md | main | research | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/data_generation_guidance.md | main | architecture/dev | 2026-03-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/gurudevi-etl-spec.md | main | plan | 2026-03-02 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/gurudevi-library-spec.md | main | plan | 2026-08-24 | 2026-08-24 19:20 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/gurudevi-library-ui-spec.md | main | plan | 2026-03-02 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/gurudevi-philosophy.md | main | architecture/dev | 2026-03-02 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/gurudevi-vision.md | main | plan | 2026-03-02 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/holistic_library_report.md | main | progress/status | 2026-03-13 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/implementation-plan.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 1 | 0/1/0 |
| apps/gurudevi-mobile/docs/Library/innovation-vision.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/planned-resources.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/Library/walkthrough.md | main | architecture/dev | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/SOP.md | branch-only | architecture/dev | 2026-06-08 19:37 | 2026-06-08 19:37 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Support/GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md | main | architecture/dev | 2026-05-07 | 2026-08-24 19:20 | superseded | 1 | 33 | 6/7/0 |
| apps/gurudevi-mobile/docs/Support/GURUDEVI_BUSINESS_MODEL_v1_0.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 3 | 16 | 0/2/0 |
| apps/gurudevi-mobile/docs/Support/GURUDEVI_MASTER_DOCUMENT.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Support/THUTHIMAL_README.md | main | architecture/dev | 2026-06-09 | 2026-08-24 18:46 | active | 1 | 1 | 0/1/0 |
| apps/gurudevi-mobile/docs/Tasks/MISSION_05_STUDENT_PATH.md | branch-only | plan | 2026-02-11 21:21 | 2026-02-11 21:21 |  | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/Tasks/MISSION_06_COMMUNITY_ONBOARDING.md | branch-only | plan | 2026-02-11 21:21 | 2026-02-11 21:21 |  | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/ACCESSIBILITY_GUIDANCE.md | main | architecture/dev | 2026-03-13 | 2026-08-24 18:46 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/AGENT_PROMPT_LENS.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:20 | active | 1 | 17 | 0/1/0 |
| apps/gurudevi-mobile/docs/agent/AGENT_RESONANCE.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:20 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/ARCHITECTURAL_RESPECT.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/CHRONICLE.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/MASTER_PROTOCOL.md | main | architecture/dev | 2026-03-05 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/PARTNERSHIP_MANIFESTO.md | main | architecture/dev | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/TAIL_FIN.md | main | architecture/dev | 2026-03-05 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/agent-briefing-offline-strategy-framework.md | main | architecture/dev | 2026-06-09 | 2026-08-24 18:46 | active | 2 | 8 | 3/0/0 |
| apps/gurudevi-mobile/docs/agent/agent-prompt-template.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/agent/agent-tasks-queue.md | main | plan | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 18 | 3/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-05-gurudevi-mobile-rebac-identity-audit.md | main | progress/status | 2026-05-06 | 2026-06-26 22:57 | active | 2 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-05-gurudevi-mobile-rebac-identity-plan.md | main | plan | 2026-05-06 | 2026-06-08 19:48 | active | 2 | 12 | 1/2/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-06-sovereign-identity-fabric.md | main | architecture/dev | 2026-05-20 | 2026-06-08 19:48 | active | 2 | 7 | 1/1/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-06-sovereign-identity-operationalization.md | main | architecture/dev | 2026-05-06 | 2026-06-22 21:58 | active | 2 | 6 | 1/0/1 |
| apps/gurudevi-mobile/docs/architecture/2026-05-06-sovereign-rebac-developer-guide.md | main | architecture/dev | 2026-05-22 | 2026-06-08 19:48 | active | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-16-gurudevi-actor-resource-permission-matrix-audit.md | main | plan | 2026-05-20 | 2026-06-08 19:48 | active | 2 | 10 | 0/6/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-16-gurudevi-architecture-audit.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-16-gurudevi-authorization-architecture-audit.md | main | progress/status | 2026-05-20 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-16-teacher-classroom-inner-view-audit.md | main | progress/status | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 47 | 10/16/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-18-gurudevi-offline-authorization-architecture.md | main | architecture/dev | 2026-05-18 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-20-gurudevi-offline-iam-write-safety-audit.md | main | progress/status | 2026-05-20 | 2026-06-08 19:48 | active | 2 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-27-expo-router-audit-1.md | main | progress/status | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-27-expo-router-audit-2.md | main | progress/status | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-27-ground-truth-audit-2.md | main | progress/status | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-27-ground-truth-audit.md | main | progress/status | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-05-31-sovereign-agent-skills.md | main | architecture/dev | 2026-05-31 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-08-offline-first-supabase-gateway-moscow.md | main | architecture/dev | 2026-05-22 | 2026-07-28 12:18 | active | 3 | 10 | 2/2/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-10-expo-router-deeplink-decision.md | main | architecture/dev | 2026-06-10 | 2026-09-20 19:49 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-10-expo-router-react-navigation-migration-guidance.md | main | architecture/dev | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-10-expo-router-tabnav-transfer-audit.md | main | progress/status | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-12-expo-sdk-missing-packages-strategy.md | main | architecture/dev | 2026-06-12 | 2026-06-13 12:07 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-12-expo-sdk-packages-comparison.md | main | architecture/dev | 2026-06-12 | 2026-06-13 12:07 | active | 1 | 39 | 1/1/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-13-data-sync-alignment-audit.md | main | progress/status | 2026-06-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-13-unified-orchestration-solution.md | main | architecture/dev | 2026-06-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-14-powersync-chronology-map.md | main | architecture/dev | 2026-06-14 | 2026-06-22 21:58 | active | 1 | 22 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-14-powersync-web-native-boot-boundary.md | main | architecture/dev | 2026-06-14 | 2026-06-22 21:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-26-developer-sandbox-console.md | main | architecture/dev | 2026-06-26 | 2026-06-26 22:57 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-26-welcome-auth-onboarding-flow.md | main | architecture/dev | 2026-06-26 | 2026-07-28 10:58 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-27-agent-database-governance-checklist.md | main | architecture/dev | 2026-06-27 | 2026-07-03 05:33 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-27-database-drift-ignore-discernment.md | main | architecture/dev | 2026-06-27 | 2026-07-03 05:33 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-27-database-drift-scorecard.md | main | architecture/dev | 2026-06-27 | 2026-07-03 05:33 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-27-supabase-zenstack-foundation-audit.md | main | progress/status | 2026-06-27 | 2026-07-03 05:33 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-27-supabase-zenstack-gap-analysis.md | main | plan | 2026-06-27 | 2026-07-03 05:33 | active | 1 | 1 | 1/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-06-27-zenstack-supabase-policy-contract.md | main | architecture/dev | 2026-06-27 | 2026-07-03 05:33 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-07-26-effect-otel-coherence-and-coverage-audit.md | main | progress/status | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-07-26-entity-bond-policy-parity-feature-spec.md | main | plan | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-07-26-feature-access-local-server-architecture.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-07-26-feature-flag-lifecycle-audit-and-plan.md | main | plan | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 17 | 0/1/1 |
| apps/gurudevi-mobile/docs/architecture/2026-07-26-feature-flag-schema-retirement-runbook.md | main | architecture/dev | 2026-07-26 | 2026-07-26 13:47 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-07-26-product-analytics-posthog-spec.md | main | plan | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 3 | 1/1/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-04-growthbook-cloud-rollout.md | main | architecture/dev | 2026-08-04 | 2026-08-04 20:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-10-powersync-capabilities-and-future-directions.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-10-powersync-js-v2-implementation-and-patterns.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-10-powersync-latest-status-and-version-audit.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-10-powersync-phased-implementation-plan.md | main | plan | 2026-08-12 | 2026-08-13 07:37 | active | 1 | 11 | 2/2/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-13-auth-gate-deeplink-audit.md | main | progress/status | 2026-08-13 | 2026-09-20 19:49 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-23-nativewind-v5-universal-monorepo-reference.md | main | architecture/dev | 2026-08-23 | 2026-08-24 15:20 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-23-stack-analysis-and-ui-elegance-plan.md | main | plan | 2026-08-23 | 2026-08-24 15:20 | active | 1 | 12 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-23-tailwind-v4-primitives-modernization-plan.md | main | plan | 2026-08-23 | 2026-08-24 15:20 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-08-28-callstack-perf-checklist.md | main | architecture/dev | 2026-08-28 | 2026-08-29 20:21 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-09-03-entry-flow-fishbone-rca.md | main | architecture/dev | 2026-09-03 | 2026-09-04 07:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-09-03-entry-shell-reconstruction-spec.md | main | plan | 2026-09-04 07:58 | 2026-09-04 07:58 |  | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-09-07-metro-windows-watcher-remediation.md | main | architecture/dev | 2026-09-07 | 2026-09-08 00:57 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-09-07-url-uri-deep-link-audit.md | main | progress/status | 2026-09-07 | 2026-09-20 19:49 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/2026-09-08-dev-entry-error-audit-and-architecture.md | main | progress/status | 2026-09-08 | 2026-09-08 01:42 | active | 1 | 23 | 3/3/0 |
| apps/gurudevi-mobile/docs/architecture/AGENT_GUIDELINES.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/ATTENDANCE_HARDENING_PLAN.md | main | plan | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 4 | 2/2/0 |
| apps/gurudevi-mobile/docs/architecture/AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md | main | architecture/dev | 2026-06-26 | 2026-06-26 22:57 | active | 1 | 2 | 2/0/0 |
| apps/gurudevi-mobile/docs/architecture/CANONICAL_API_MAP.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/CANVAS_SHARED_SURFACE_MODEL.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/CAPABILITY_CANVAS_STRATEGY.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 9 | 2/5/0 |
| apps/gurudevi-mobile/docs/architecture/CLASSROOM_BOUNDARY_PHASE1.md | main | plan | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 3 | 0/1/0 |
| apps/gurudevi-mobile/docs/architecture/CLASSROOM_READAHEAD_BLUEPRINT.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/CROSS_HOLON_CONTRACT_MAP.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md | main | architecture/dev | 2026-05-22 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/DATA_HIGHWAYS_MIGRATION_CHECKLIST.md | main | architecture/dev | 2026-05-22 | 2026-07-26 13:47 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/DOMAIN_OWNERSHIP_MAP.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/DURABLE_AGENTS_RND_GUIDE.md | main | architecture/dev | 2026-04-29 | 2026-08-14 17:25 | active | 2 | 5 | 0/1/0 |
| apps/gurudevi-mobile/docs/architecture/GRADING_HARDENING_PLAN.md | main | plan | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 3 | 0/2/0 |
| apps/gurudevi-mobile/docs/architecture/GUARDIAN_TEMPORAL_POLICY.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/INNGEST_V4_CORE_SHELL.md | main | architecture/dev | 2026-04-29 | 2026-08-13 15:20 | active | 2 | 13 | 0/2/0 |
| apps/gurudevi-mobile/docs/architecture/INSTRUCTIONS.md | main | architecture/dev | 2026-04-29 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/LANDSCAPE.md | main | research | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/NEW_FEATURE_CHECKLIST.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 29 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/PARALLEL_WORK_GUIDE.md | main | architecture/dev | 2026-05-16 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/POA_IMPLEMENTATION_GUIDE.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/PRE_POA_STABILIZATION_MAP.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 1 | 1/0/0 |
| apps/gurudevi-mobile/docs/architecture/PROFILE_ROUTE_OWNERSHIP_MAP.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/ROLE_WORKSPACE_AUDIT_PHASE2A.md | main | plan | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/ROLE_WORKSPACE_IMPLEMENTATION_GUIDE.md | main | architecture/dev | 2026-04-18 | 2026-06-08 19:37 | active | 2 | 15 | 1/5/0 |
| apps/gurudevi-mobile/docs/architecture/ROLE_WORKSPACE_STRATEGY.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/STUDENT_WORKSPACE_FEATURE_INVENTORY.md | main | architecture/dev | 2026-04-18 | 2026-06-08 19:37 | active | 2 | 8 | 3/3/0 |
| apps/gurudevi-mobile/docs/architecture/SYSTEM_MAP.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/Sovereign_Identity_Operationalization.md | main | architecture/dev | 2026-05-06 | 2026-06-08 19:37 | active | 2 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/Sovereign_Identity_Philosophy.md | main | architecture/dev | 2026-05-16 | 2026-06-08 19:37 | active | 2 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/Sovereign_Resilience_Architecture_2026.md | main | architecture/dev | 2026-07-26 | 2026-08-24 18:46 | active | 1 | 10 | 0/0/1 |
| apps/gurudevi-mobile/docs/architecture/TEMPORAL_API_CONSOLIDATION.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/TEMPORAL_SSOT.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/architecture/audit-authorization-2026-03.md | main | progress/status | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/authority-implementation.md | main | architecture/dev | 2026-03-30 | 2026-08-24 18:46 | active | 1 | 3 | 1/1/0 |
| apps/gurudevi-mobile/docs/architecture/authority.md | main | architecture/dev | 2026-05-22 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/authorization.md | main | architecture/dev | 2026-05-16 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/beta-vs-production-monorepo-guidance.md | main | plan | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/bootstrap-and-entrypoint-standard.md | main | architecture/dev | 2026-06-10 | 2026-06-26 22:57 | active | 2 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/architecture/capability-policy-composition-guide.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/cjs-to-esm-native-guide.md | main | architecture/dev | 2026-05-25 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/data-contracts.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/dependency-update-guidance.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:20 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/dependency-update-strategy-and-checklist.md | main | architecture/dev | 2026-05-25 | 2026-08-24 18:46 | active | 1 | 27 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/dependency-upgrade-checklist.md | main | architecture/dev | 2026-06-10 | 2026-08-24 18:46 | active | 1 | 62 | 1/0/0 |
| apps/gurudevi-mobile/docs/architecture/expo-56-support-guide.md | main | architecture/dev | 2026-06-10 | 2026-06-10 21:00 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/expo-router-package-migration-guidance.md | main | architecture/dev | 2026-06-11 | 2026-06-13 12:07 | active | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/expo-router-quick-onboarding.md | main | architecture/dev | 2026-06-11 | 2026-06-13 12:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/feature-lifecycle-future-work.md | main | architecture/dev | 2026-07-26 | 2026-08-04 20:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/feature-lifecycle-management.md | main | architecture/dev | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/future-patterns-and-standards.md | main | architecture/dev | 2026-05-20 | 2026-08-24 18:46 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/graphics-tiers.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/gurudevi-responsive-shell-layout-spec.md | main | plan | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 6 | 1/0/0 |
| apps/gurudevi-mobile/docs/architecture/gurudevi-worldview.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/idealist-builders-engineering-handbook.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/identity-app-device-lifecycle.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/knowledge-map.md | main | architecture/dev | 2026-04-27 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/legacy-free-agentic-mcp-ssot.md | main | architecture/dev | 2026-05-16 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/local-first-transition-spec.md | main | plan | 2026-05-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/mobile-navigation-and-adaptive-chrome.md | main | architecture/dev | 2026-09-15 | 2026-09-20 00:01 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/modern-runtime-vision.md | main | plan | 2026-05-25 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/navigation-architecture.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/offline-security-and-resilience.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 5 | 0/1/0 |
| apps/gurudevi-mobile/docs/architecture/poa-authority-ssot.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/product-analytics-future-work.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/product-analytics-guide.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/react-native-web-fabric-shims.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/schema-db-trust-and-performance.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/screen-relocation-map.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/skill-playbook.md | main | architecture/dev | 2026-03-25 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/stack-and-compatibility-atlas.md | main | architecture/dev | 2026-08-12 | 2026-08-12 21:53 | superseded | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/ui-color-doctrine.md | main | architecture/dev | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 3 | 1/0/0 |
| apps/gurudevi-mobile/docs/architecture/web-shims-registry.md | main | architecture/dev | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/zenstack-v3-migration.md | main | architecture/dev | 2026-05-06 | 2026-08-24 18:46 | active | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/architecture/zod-4-zenstack-v3-research-2026-05-01.md | main | research | 2026-05-02 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/00_RECENT_DASHBOARD.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/COMPLETION_SUMMARY_2026-02-14.md | deleted 1ac79d4c | progress/status | 2026-02-14 10:46 | 2026-02-19 22:11 |  | 1 | 23 | 2/2/1 |
| apps/gurudevi-mobile/docs/brain_archive/EXTENDED_SESSION_SUMMARY_2026-02-14.md | deleted 1ac79d4c | progress/status | 2026-02-14 11:00 | 2026-02-19 22:11 |  | 1 | 44 | 1/2/2 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-04_1816_Task_ Evolve to a Sovereign Incremental Archive/1809_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-05_0527_Gurudevi Development Tasks/1414_walkthrough.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-05_1043_UI Redesign Tasks/0648_walkthrough.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-05_1636_Current Sprint Task List/1414_walkthrough.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-05_2140_Tasks_ EdLove Web - Footer & General Update/1655_walkthrough.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 23 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-06_1550_Fix Navigation Errors and Warnings/1545_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-06_1553_Task_ Fix TypeScript Error in VoiceJournaling.tsx/1553_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-06_1558_Task Checklist/1558_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-07_1504_Profile & Role Management Enhancements/0339_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-07_1648_Tasks/1648_retrospective_01.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-09_1127_Tasks/1121_walkthrough.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-09_1256_Gurudevi Mobile UI Update/1255_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-09_1406_Gurudevi Mobile UI Update/1356_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 22 | 1/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-09_1524_Task_- [x] Analyze current documentation structure _!-- id_ 0 --_/1523_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 3 | 0/0/1 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-09_1547_Task_ Review Documentation Reorganization and New Priority Docs/1547_walkthrough.md | deleted 054ae0f0 | architecture/dev | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0711_walkthrough_bdd_success.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0745_testing_guidelines_web_vs_mobile.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0825_ai_human_collaboration_guide.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0922_walkthrough_ui_abstraction.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1156_walkthrough_onboarding_refinement.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1754_walkthrough_stabilisation.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2313_walkthrough_alignment_fix.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Learning_and_Walkthrough/2026-02-11_1736_Supabase Schema Audit & Sync/1614_walkthrough.md | deleted 054ae0f0 | progress/status | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Planning_and_Strategies/2026-02-05_0527_Gurudevi Development Tasks/0141_architecture_evolution_lesson.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Planning_and_Strategies/2026-02-05_0527_Gurudevi Development Tasks/0517_UI_REDESIGN_PLAN.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Planning_and_Strategies/2026-02-05_2140_Tasks_ EdLove Web - Footer & General Update/2102_localization_strategy.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Planning_and_Strategies/2026-02-05_2140_Tasks_ EdLove Web - Footer & General Update/2116_future_architecture.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Planning_and_Strategies/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1400_GURUDEVI_PROJECT_SUMMARY_ROADMAP.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Planning_and_Strategies/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1844_analysis_bdd_strategy.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-04_2231_Fix Mobile Warnings and Issues/2229_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 7 | 0/1/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-04_2231_Fix Mobile Warnings and Issues/2231_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_0527_Gurudevi Development Tasks/2323_role_based_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_1043_UI Redesign Tasks/0536_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_1043_UI Redesign Tasks/0536_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 41 | 1/3/11 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_1043_UI Redesign Tasks/1010_implementation_plan_universal.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_1636_Current Sprint Task List/1353_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_1636_Current Sprint Task List/1353_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 28 | 1/6/5 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_2140_Tasks_ EdLove Web - Footer & General Update/1651_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 110 | 1/1/4 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-05_2140_Tasks_ EdLove Web - Footer & General Update/1653_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 35 | 1/0/1 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-06_1550_Fix Navigation Errors and Warnings/1536_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 12 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-06_1550_Fix Navigation Errors and Warnings/1538_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-06_1553_Task_ Fix TypeScript Error in VoiceJournaling.tsx/1550_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-06_1553_Task_ Fix TypeScript Error in VoiceJournaling.tsx/1552_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-06_1558_Task Checklist/1554_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-06_1558_Task Checklist/1557_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-07_1504_Profile & Role Management Enhancements/0316_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 32 | 4/1/9 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-07_1504_Profile & Role Management Enhancements/0317_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-07_1648_Tasks/1513_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 15 | 2/1/1 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-07_1648_Tasks/1538_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1103_Task_ Debug Profile Screen Infinite Loop/1035_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1127_Tasks/1120_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1127_Tasks/1120_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 9 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1256_Gurudevi Mobile UI Update/1236_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 28 | 0/1/2 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1256_Gurudevi Mobile UI Update/1238_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1406_Gurudevi Mobile UI Update/1355_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 34 | 0/1/3 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1524_Task_- [x] Analyze current documentation structure _!-- id_ 0 --_/1438_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 20 | 0/0/2 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1524_Task_- [x] Analyze current documentation structure _!-- id_ 0 --_/1439_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-09_1547_Task_ Review Documentation Reorganization and New Priority Docs/1547_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0659_implementation_plan_web_test_strategy.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0723_implementation_plan_invitation_acceptance.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0751_implementation_plan_auth_refinement.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0845_implementation_plan_gluestack_fix.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0924_task.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1149_implementation_plan_onboarding_refinement.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1405_implementation_plan_cloudinary_media.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1439_implementation_plan_tsc_fixes.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1458_implementation_plan_storage_refactor.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1749_implementation_plan_final_tsc_fixes.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1828_implementation_plan_alpha_roadmap.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2015_implementation_plan_bdd_setup.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2213_implementation_plan_tsconfig_fix.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2227_implementation_plan_react_sync.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2252_implementation_plan_alignment_fix.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2319_implementation_plan_bdd_stage1.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1736_Supabase Schema Audit & Sync/1601_task.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 26 | 0/0/7 |
| apps/gurudevi-mobile/docs/brain_archive/Tasks_and_Implementations/2026-02-11_1736_Supabase Schema Audit & Sync/1603_implementation_plan.md | deleted 054ae0f0 | plan | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0801_diagnosis_tsc_errors.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/0925_PROJECT_STATUS_REPORT.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1153_SUPABASE_SCHEMA_AUDIT.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1411_diagnosis_ios_build_errors.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1542_tsc_diagnosis_findings.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/1558_typescript_fix_summary.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2014_feature_alpha_journey.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2059_diagnosis_installation_errors.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1429_Production Readiness Assessment & Tooling Research/2158_feature_ecological_layers.md | deleted 054ae0f0 | research | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/brain_archive/Uncategorized/2026-02-11_1736_Supabase Schema Audit & Sync/1612_database_comparison.md | deleted 054ae0f0 | progress/status | 2026-02-11 21:21 | 2026-02-26 09:25 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-05-22-classroom-teacher-implementation-plan.md | main | plan | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 3 | 0/2/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-caveats-memory.md | main | progress/status | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-operationalization-plan.md | main | plan | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-05-27-pre-migration-progress-tracker.md | main | progress/status | 2026-05-27 | 2026-06-08 19:37 | active | 1 | 23 | 0/4/1 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-10-community-expo-router-pilot-notes.md | main | progress/status | 2026-06-10 | 2026-06-10 21:00 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-10-expo-router-tabnav-transfer/task.md | main | progress/status | 2026-06-10 | 2026-06-10 21:00 | active | 1 | 28 | 0/0/2 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-10-profile-expo-router-migration-notes.md | main | progress/status | 2026-06-10 | 2026-06-10 21:00 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-14-isomorphic-powersync-plan.md | main | plan | 2026-06-14 | 2026-06-22 21:58 | draft | 1 | 8 | 1/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-26-canonical-account-state-model.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-26-logout-bootstrap-contract.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-26-multi-account-contract.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-26-route-flow-fishbone-analysis.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | draft | 1 | 1 | 1/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-26-route-flow-implementation-checklist.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | draft | 1 | 35 | 4/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-26-route-flow-proposed-solution.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | draft | 1 | 1 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-06-26-test-strategy-jest-vs-vitest.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-07-14-react-native-web-sustainability-plan.md | main | plan | 2026-07-14 | 2026-08-10 22:45 | active-with-powersync-follow-up | 1 | 4 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-07-16-icon-layer-fishbone-cleanup-plan.md | main | plan | 2026-07-16 | 2026-07-17 13:25 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-07-17-gluestack-comprehensive-migration-plan.md | main | plan | 2026-08-11 | 2026-08-13 07:37 | superseded | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-07-17-gurudevi-quality-constellation-plan.md | main | plan | 2026-07-17 | 2026-07-17 13:25 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-07-17-reanimated-worklets-migration-plan.md | main | plan | 2026-07-17 | 2026-07-24 15:07 | active | 1 | 88 | 2/4/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-07-17-rngh-v3-comprehensive-migration-plan.md | main | plan | 2026-07-17 | 2026-07-17 23:40 | active | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-06-production-hardening-aesthetic-polish-plan.md | main | plan | 2026-08-06 | 2026-08-08 19:03 | active | 1 | 9 | 0/0/1 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-06-trivial-gaps-audit.md | main | plan | 2026-08-06 | 2026-08-08 19:03 | active | 1 | 23 | 1/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-08-gurudevi-production-gaps-and-phased-hardening-plan.md | main | plan | 2026-08-08 | 2026-08-08 19:03 | active | 1 | 3 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-08-gurudevi-public-link-ssot-spec.md | main | plan | 2026-08-08 | 2026-08-08 19:03 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-08-gurudevi-web-ecosystem-revamp-plan.md | main | plan | 2026-08-08 | 2026-08-08 19:03 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-authorization-pricing-parity-audit.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-community-domain-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-database-review-batch-01.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-database-review-batch-02.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 2 | 0/0/1 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-database-review-batch-03.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-database-review-batch-04.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | complete-local-ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-database-review-batch-05.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-database-review-batch-06.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-education-idempotency-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-feature-flags-growth-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-idempotency-audit.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-identity-membership-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-library-domain-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-pricing-table-authority-review.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-schema-parity-next-phases-plan.md | main | plan | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 4 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-10-stable-stack-and-future-upgrade-roadmap.md | main | plan | 2026-08-10 | 2026-09-04 08:05 | active | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-canonical-school-registry-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-institutional-administration-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-migration-safety-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | complete | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-notifications-web-push-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-parity-contract-cleanup-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | complete | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-powersync-completeness-audit.md | main | progress/status | 2026-08-12 | 2026-08-13 07:37 | partial-foundation | 1 | 13 | 0/1/1 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-school-crud-authorization-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-school-discovery-invite-contract-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-school-registry-claim-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | ready-for-application | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-11-trust-performance-verification-batch.md | main | progress/status | 2026-08-10 | 2026-08-10 22:45 | complete | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-13-classroom-routing-feature-spec.md | main | plan | 2026-08-13 | 2026-08-14 12:44 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-13-compact-tablet-canvas-audit.md | main | progress/status | 2026-08-13 | 2026-08-14 12:44 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-13-gurudevi-web-audit.md | main | progress/status | 2026-08-13 | 2026-08-14 12:44 | draft | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-13-integrated-ui-redesign-plan.md | main | plan | 2026-08-13 | 2026-08-14 12:44 | draft | 1 | 5 | 1/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-13-mobile-landscape-typography-audit.md | main | research | 2026-08-13 | 2026-08-14 12:44 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-13-native-mobile-audit.md | main | progress/status | 2026-08-13 | 2026-08-14 12:44 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-13-wellbeing-self-audit.md | main | progress/status | 2026-08-13 | 2026-08-14 12:44 | active | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-13-ui-audit/2026-08-14-real-device-runtime-validation.md | main | progress/status | 2026-08-14 | 2026-09-07 13:38 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-14-expo-web-doppler-runtime-troubleshooting.md | main | progress/status | 2026-08-14 | 2026-08-14 17:25 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-27-oss-pattern-integration-plan.md | main | plan | 2026-08-27 | 2026-08-29 20:21 | active | 1 | 14 | 2/2/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-28-beast-baseline.md | main | progress/status | 2026-08-28 | 2026-08-29 20:21 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-28-beast-master-plan.md | main | plan | 2026-08-28 | 2026-08-29 20:21 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-08-31-interaction-delight-audit-and-plan.md | main | plan | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-01-account-deletion-store-readiness.md | main | progress/status | 2026-09-01 | 2026-09-04 07:58 | blocked-on-policy-and-runtime-validation | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-01-account-lifecycle-experience-phase-3.md | main | plan | 2026-09-01 | 2026-09-04 07:58 | active | 1 | 3 | 1/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-01-account-lifecycle-foundation-phase-1.md | main | plan | 2026-09-01 | 2026-09-04 07:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-01-account-lifecycle-integration-phase-2.md | main | plan | 2026-09-01 | 2026-09-04 07:58 | needs-runtime-validation | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-01-account-lifecycle-roadmap.md | main | plan | 2026-09-01 | 2026-09-04 07:58 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-01-guardian-child-lifecycle-boundary.md | main | progress/status | 2026-09-01 | 2026-09-04 07:58 | audit-complete-next-contract-required | 1 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-01-universal-ui-modernization-delivery.md | main | progress/status | 2026-09-01 | 2026-09-04 07:58 | active | 1 | 8 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-account-lifecycle-authority.md | main | progress/status | 2026-09-07 | 2026-09-08 00:57 | implemented-code | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-account-recovery-device-sign-out-feature-spec.md | main | plan | 2026-09-07 | 2026-09-07 13:38 | implemented | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-auth-bootstrap-race-feature-spec.md | main | plan | 2026-09-07 | 2026-09-08 00:57 | implemented-code | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-auth-subject-account-boundary-plan.md | main | plan | 2026-09-07 | 2026-09-12 20:24 | phase-1-implemented-code | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-bootstrap-route-state-adapter-feature-spec.md | main | plan | 2026-09-07 | 2026-09-08 00:57 | approved-for-implementation | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-deep-link-lifecycle-feature-spec.md | main | plan | 2026-09-07 | 2026-09-20 19:49 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-entry-shell-service-recovery-feature-spec.md | main | plan | 2026-09-07 | 2026-09-07 13:38 | implemented | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-essential-startup-deadline-feature-spec.md | main | plan | 2026-09-07 | 2026-09-08 00:57 | approved-for-implementation | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-gurudevi-audit-recovery-plan.md | main | plan | 2026-09-07 | 2026-09-08 00:57 | active | 1 | 22 | 1/1/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-native-color-runtime-diagnosis.md | main | progress/status | 2026-09-07 | 2026-09-07 13:38 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-platform-navigation-matrix-plan.md | main | plan | 2026-09-07 | 2026-09-12 20:24 | implementation-in-progress | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-07-url-uri-deep-link-implementation-plan.md | main | plan | 2026-09-07 | 2026-09-20 19:49 | superseded | 1 | 16 | 1/4/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-09-cross-platform-ui-rendering-recovery-plan.md | main | plan | 2026-09-09 | 2026-10-06 14:04 | in-progress | 1 | 12 | 0/2/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-09-fab-shell-loop-feature-spec.md | main | plan | 2026-09-09 | 2026-09-12 20:24 | approved-for-implementation | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-09-ui-slop-audit.md | main | progress/status | 2026-09-09 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/2026-09-12-navigation-and-sanctuary-refactor.md | main | progress/status | 2026-09-12 | 2026-09-12 22:13 | active | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/4th_week/git_workflow.md | branch-only | progress/status | 2026-02-23 11:32 | 2026-02-23 11:32 |  | 1 | 4 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/4th_week/tasks.md | branch-only | plan | 2026-02-24 16:11 | 2026-02-24 16:11 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/ACTIVE_TASKS.md | main | plan | 2026-05-07 | 2026-08-24 18:46 | active | 1 | 40 | 3/9/2 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/ACTION_ITEMS.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 28 | 6/2/1 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/ALPHA_PROGRESS_FEB8.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 11 | 3/5/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/ALPHA_REQUIREMENTS.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 35 | 8/5/3 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/BETA_RELEASE_ASSESSMENT.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 14 | 0/3/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/COMMUNITY_LIBRARY_DOCS_INDEX.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 19 | 2/1/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/COMMUNITY_LIBRARY_IMPLEMENTATION_PLAN.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 60 | 10/18/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/COMMUNITY_LIBRARY_SUMMARY.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 11 | 2/6/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/ECOLOGY_BASED_FEATURES.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 29 | 6/9/1 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GROUPS_FEATURE_GUIDE.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 1 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_FEATURE_MAPPING.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 3 | 128 | 28/11/20 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_NEXT_ACTIONS.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 3 | 55 | 13/10/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_PRD_INTEGRATION_COMPLETE.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 3 | 9 | 1/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/GURUDEVI_PRD_SUMMARY.md | main | plan | 2026-02-19 | 2026-08-24 18:46 | active | 3 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/CURRENT_STATE.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 1 | 91 | 33/7/5 |
| apps/gurudevi-mobile/docs/current_progress/EVOLUTION.md | main | progress/status | 2026-02-28 | 2026-08-24 18:46 | active | 1 | 6 | 0/4/0 |
| apps/gurudevi-mobile/docs/current_progress/FUTURE_ROADMAP.md | main | plan | 2026-08-29 | 2026-08-29 20:21 | active | 1 | 19 | 3/2/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/2026-02-18_next_phase_roadmap.md | main | plan | 2026-02-25 | 2026-08-24 18:46 | active | 4 | 78 | 11/19/1 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/2026-02-19_tasks.md | main | plan | 2026-03-20 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/agent_blueprint_accessibility.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/agent_blueprint_community.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 1 | 1/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/agent_blueprint_library.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/community_ecosystem.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 2 | 0/2/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/delegation_playbook.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 3 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/library_ecosystem.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 1 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/3rd_week/roadmap_comparison.md | main | plan | 2026-02-25 | 2026-08-24 18:46 | active | 3 | 3 | 1/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/agentic_vision_2026.md | main | plan | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/architecture_overview.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/claude_sync_plan.md | main | plan | 2026-02-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/codex/a11y-localization-completeness-audit.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/codex/claude_analysis.md | main | progress/status | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 7 | 3/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/codex/qr-ocr-implementation-audit.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/codex/src-vs-packages-redundancy-audit.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/codex/sustainable-implementation-strategy.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 1 | 1/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/codex/whole-app-architectural-improvements-audit.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 2 | 1/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/implementation_plan.md | main | plan | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/plans/2026-02-24-living-theme-system-design.md | main | plan | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/plans/2026-02-24-living-theme-system-impl.md | main | plan | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 8 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/plans/2026-02-25-profile-completion-implementation.md | main | plan | 2026-05-22 | 2026-08-24 18:46 | active | 2 | 11 | 3/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/plans/2026-02-25-profile-completion-system-design.md | main | plan | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/plans/2026-02-25-week4-master-implementation-plan.md | main | plan | 2026-05-25 | 2026-08-24 18:46 | active | 2 | 12 | 2/3/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/senior_dev_audit_report.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/tasks.md | main | plan | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/walkthrough.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/IDENTITY_ARCHITECTURE_REPORT.md | main | progress/status | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/March/1st_week/2026-02-27-priority-matrix-and-skia-runbook.md | main | plan | 2026-02-27 | 2026-08-24 18:46 | active | 1 | 5 | 1/1/0 |
| apps/gurudevi-mobile/docs/current_progress/March/1st_week/individual_difference_layer.md | main | progress/status | 2026-02-28 | 2026-08-24 18:46 | active | 1 | 3 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/March/1st_week/monorepo_duplication_audit.md | main | progress/status | 2026-02-28 | 2026-08-24 18:46 | active | 1 | 5 | 0/2/0 |
| apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md | main | plan | 2026-03-01 | 2026-08-24 18:46 | active | 1 | 125 | 69/4/21 |
| apps/gurudevi-mobile/docs/current_progress/March/1st_week/tasks.md | main | plan | 2026-02-28 | 2026-08-24 18:46 | active | 1 | 29 | 5/6/0 |
| apps/gurudevi-mobile/docs/current_progress/WEB_COMPAT_STRATEGY.md | branch-only | progress/status | 2026-03-02 12:23 | 2026-03-02 12:23 |  | 2 | 10 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/architecture_spec.md | main | plan | 2026-03-18 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/copilot_workspace_prompt.md | branch-only | progress/status | 2026-02-11 21:21 | 2026-02-11 21:21 |  | 2 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/ARCHITECTURE_TECH_STACK.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 3 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/DAILY_REFERENCES.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 3 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/ENVIRONMENT_ENGINE_AUDIT.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/ENVIRONMENT_ENGINE_IMPLEMENTATION.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/ENVIRONMENT_ENGINE_SUMMARY.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 23 | 0/4/1 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/FULL_IMPLEMENTATION_REPORT.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 25 | 2/1/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/PRODUCTION_READINESS.md | main | progress/status | 2026-05-07 | 2026-08-24 18:46 | active | 3 | 42 | 0/2/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/PROJECT_STATUS_REPORT.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 3 | 11 | 0/1/1 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/REFINED_AGENT_PROMPT.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/UI_VISUAL_GUIDE.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/VETERAN_RADAR.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/accessibility_strategy.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 17 | 0/0/1 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/ai_human_collaboration_guide.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 3 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/implementation_plan.md | main | plan | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/offline-architecture.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/hmmm/task.md | main | progress/status | 2026-02-25 | 2026-08-24 18:46 | active | 2 | 29 | 0/4/4 |
| apps/gurudevi-mobile/docs/current_progress/issues_i_saw.md | main | progress/status | 2026-03-16 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/mobile_feature_audit.md | main | progress/status | 2026-02-28 | 2026-08-24 18:46 | active | 2 | 60 | 11/15/0 |
| apps/gurudevi-mobile/docs/current_progress/mobile_feature_strategy.md | main | progress/status | 2026-03-18 | 2026-08-24 18:46 | active | 2 | 334 | 54/149/0 |
| apps/gurudevi-mobile/docs/current_progress/old_docs/2026-06-08-typescript-6-migration-guide.md | main | progress/status | 2026-06-25 | 2026-07-28 12:18 | superseded | 3 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/old_docs/poa_status_report_2026-03.md | main | progress/status | 2026-03-30 | 2026-06-08 19:37 | active | 2 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/package_migrations/SELF_DOMAIN_HANDOVER.md | main | progress/status | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/current_progress/principal_dashboard_design.md | main | progress/status | 2026-03-06 | 2026-08-24 18:46 | active | 1 | 4 | 1/1/0 |
| apps/gurudevi-mobile/docs/database-parity-inventory-governance.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/001-ui-foundation-reset.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 2 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/002-sovereignty-grants-pattern.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/003-feature-flag-architecture.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/004-event-driven-cross-module.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/004-feature-lifecycle-management.md | main | architecture/dev | 2026-07-26 | 2026-07-26 13:47 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/005-feature-gate-order-and-context-ownership.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/005-offline-v1-online-v2-crdt.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/006-storage-strategy.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/007-crdt-yjs-for-sync.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/008-ghost-curriculum-observation-layer.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/009-inngest-hosting-topology.md | main | architecture/dev | 2026-04-29 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/010-durable-agent-rnd-lane.md | main | architecture/dev | 2026-04-29 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/011-legacy-free-agentic-mcp-implementation-plan.md | main | plan | 2026-05-16 | 2026-08-24 18:46 | active | 1 | 11 | 0/1/0 |
| apps/gurudevi-mobile/docs/decisions/012-growthbook-key-naming-ssot.md | main | architecture/dev | 2026-08-04 | 2026-08-04 20:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/013-capability-token-refinement.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-08-openness-decision.md | main | architecture/dev | 2026-03-20 | 2026-07-28 12:18 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-10-offline-authorization-and-gating.md | main | architecture/dev | 2026-06-10 | 2026-07-28 10:58 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-10-poa-proxy-unentanglement.md | main | architecture/dev | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-12-decoupled-tanstack-table-and-virtual-integration.md | main | architecture/dev | 2026-06-12 | 2026-06-13 12:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-12-react-query-pacer-integration.md | main | architecture/dev | 2026-06-12 | 2026-06-13 12:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-12-web-only-payments-and-entitlements.md | main | architecture/dev | 2026-06-12 | 2026-06-13 12:07 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-20-rngh-v3-upgrade-decision.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-06-25-conditional-exports-and-static-stub-strategy.md | main | architecture/dev | 2026-06-25 | 2026-06-25 16:26 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-07-16-icon-bridge-contract.md | main | architecture/dev | 2026-07-16 | 2026-07-17 13:25 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-07-17-gurudevi-quality-constellation-chronicle.md | main | architecture/dev | 2026-07-17 | 2026-07-17 13:25 | active | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-07-17-gurudevi-quality-constellation-critique.md | main | architecture/dev | 2026-07-17 | 2026-07-17 13:25 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-07-22-effect-layer-di-tradeoffs.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 1 | 2 | 2/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-07-26-effect-observability-boundary.md | main | architecture/dev | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-08-08-gurudevi-web-hosting-topology.md | main | architecture/dev | 2026-08-08 | 2026-08-08 19:03 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-08-12-ui-facade-and-styling-engine-decision.md | main | architecture/dev | 2026-08-12 | 2026-08-12 21:53 | active | 1 | 3 | 0/1/0 |
| apps/gurudevi-mobile/docs/decisions/2026-09-04-agent-docs-qa.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | accepted | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-09-04-cn-merge-strategy.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | accepted | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-09-04-nitro-fetch-adoption.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | accepted | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-09-04-paste-input-adoption.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | accepted | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-09-04-play-hygiene-pedagogy.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/decisions/2026-09-04-visual-qa-contract.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 22 | 1/1/0 |
| apps/gurudevi-mobile/docs/decisions/2026-09-04-web-evidence-proxy.md | main | architecture/dev | 2026-09-05 | 2026-09-05 17:16 | deferred | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/docs-sop.md | main | architecture/dev | 2026-06-10 | 2026-08-24 18:46 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/expo/eas_build_guide.md | main | architecture/dev | 2026-05-07 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/expo/eas_build_plan.md | main | plan | 2026-02-17 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/expo/expo_workflow.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:20 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/guides/biome.md | main | architecture/dev | 2026-05-22 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/guides/mcp-environment-setup.md | main | architecture/dev | 2026-04-26 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/identity-membership-and-claim-model.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 7 | 2/1/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-10-dependency-alignment-and-upgrade-testing.md | main | architecture/dev | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-10-dependency-audit.md | main | progress/status | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-10-migration-and-major-dependency-audit.md | main | progress/status | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-10-monorepo-upgrade-and-cleanup-execution.md | main | architecture/dev | 2026-06-10 | 2026-06-10 21:00 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-11-mobile-bundle-optimization-report.md | main | progress/status | 2026-06-11 | 2026-06-11 17:16 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-13-react-doctor-sop.md | main | architecture/dev | 2026-06-13 | 2026-06-13 18:48 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-19-pnpm-11-8-0-upgrade.md | main | architecture/dev | 2026-06-19 | 2026-06-22 21:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-06-26-identity-contract-audit.md | main | progress/status | 2026-06-26 | 2026-07-28 10:58 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-07-14-gluestack-v5-migration-report.md | main | progress/status | 2026-08-11 | 2026-08-12 21:53 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-08-08-cloudflare-platform-pages-setup.md | main | architecture/dev | 2026-08-08 | 2026-08-13 07:37 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-08-11-css-interop-migration-inventory.md | main | architecture/dev | 2026-08-12 | 2026-08-12 21:53 | active | 1 | 38 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-08-11-existing-style-stack-hardening.md | main | architecture/dev | 2026-08-12 | 2026-08-12 21:53 | active | 1 | 10 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-08-11-gluestack-v5-stack-audit.md | main | progress/status | 2026-09-01 | 2026-09-01 01:53 | active | 1 | 24 | 0/3/0 |
| apps/gurudevi-mobile/docs/infra/2026-09-01-web-runtime-shim-and-watcher-baseline.md | main | architecture/dev | 2026-09-01 | 2026-09-01 01:53 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-09-04-peer-dependency-audit-and-intentional-mismatches.md | main | progress/status | 2026-09-04 | 2026-09-05 17:16 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-09-05-android-build-chronicle-and-savings-report.md | main | progress/status | 2026-09-05 | 2026-09-05 21:55 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/2026-09-08-linux-ext4-native-release-build-sop.md | main | architecture/dev | 2026-09-08 | 2026-09-08 20:57 | active | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/FEATURE_FLAG_ROLLOUT.md | main | architecture/dev | 2026-07-26 | 2026-07-26 13:47 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/UI_HARDENING_STANDARDS.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/ZOD_DATA_GOVERNANCE.md | main | architecture/dev | 2026-04-23 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/android-build-caching-diagnostics-sop.md | main | architecture/dev | 2026-09-08 | 2026-09-08 17:21 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/cloudflare-deployment.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/dependency-lifecycle.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:20 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md | main | architecture/dev | 2026-09-05 | 2026-09-20 00:01 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/expo-development-paths.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/expo-eas-build-verification-guide.md | main | architecture/dev | 2026-07-16 | 2026-07-17 13:25 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/expo-sdk-deprecation-guide.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/first-principles-native-build-sop.md | main | architecture/dev | 2026-09-08 | 2026-09-08 17:21 | active | 1 | 6 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/git-branching-model.md | main | architecture/dev | 2026-06-09 | 2026-07-28 12:18 | superseded | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/hosting-guide.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 5 | 0/2/0 |
| apps/gurudevi-mobile/docs/infra/internal-versioning.md | main | architecture/dev | 2026-04-23 | 2026-06-08 19:37 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/local-development-playbook.md | main | architecture/dev | 2026-05-22 | 2026-07-28 12:18 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/oxlint-and-eslint-hybrid-guide.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/pnpm-guide.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 5 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/pure-linux-wsl-migration-sop.md | main | architecture/dev | 2026-09-08 | 2026-09-08 17:21 | active | 1 | 8 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/react-compiler-and-eslint-guide.md | main | architecture/dev | 2026-06-09 | 2026-06-09 18:59 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/security-checklist.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 16 | 0/1/0 |
| apps/gurudevi-mobile/docs/infra/testing-strategy.md | main | architecture/dev | 2026-05-06 | 2026-07-28 12:18 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/infra/vercel-deployment.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/infra/vercel-limits-and-r2.md | main | architecture/dev | 2026-02-11 | 2026-07-28 12:18 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/llms.txt | main | architecture/dev | 2026-10-15 19:19 | 2026-10-15 19:19 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/offline-invitation-claim-contract.md | main | architecture/dev | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/00_DELEGATION_PACKET.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/API_REFACTORING_COMPARISON copy.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 11 | 0/1/0 |
| apps/gurudevi-mobile/docs/old_docs/API_REFACTORING_COMPARISON.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/CLASSROOM_LIST_README.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/old_docs/COMPREHENSIVE_APP_ANALYSIS.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 104 | 11/19/17 |
| apps/gurudevi-mobile/docs/old_docs/DELEGATION_PACKET_STATUS.md | main | progress/status | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 57 | 11/11/8 |
| apps/gurudevi-mobile/docs/old_docs/DOCS_INDEX.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 17 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/GURUDEVI_ALPHA_COMPLETE_FINAL.md | main | plan | 2026-07-24 | 2026-08-24 18:46 | active | 3 | 115 | 16/19/1 |
| apps/gurudevi-mobile/docs/old_docs/GURUDEVI_DOCS_INDEX.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 16 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/IMPLEMENTATION_SUMMARY.md | main | progress/status | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 30 | 3/3/0 |
| apps/gurudevi-mobile/docs/old_docs/LOTUSPETALFAB_ANALYSIS.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 12 | 0/1/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_01_IMPLEMENTATION.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 24 | 5/1/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_01_SELF.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_02_IMPLEMENTATION_SUMMARY.md | main | progress/status | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_02_TEACHER_WORKBENCH.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_03_GRADING.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_04_PRINCIPAL.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_05_STUDENT_PATH.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_06_COMMUNITY_ONBOARDING.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_COMPLETE_TASK_D.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 2 | 1/1/0 |
| apps/gurudevi-mobile/docs/old_docs/MISSION_COMPLETION_SUMMARY.md | main | progress/status | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 13 | 0/0/4 |
| apps/gurudevi-mobile/docs/old_docs/ONBOARDING_STRATEGY.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 17 | 8/1/0 |
| apps/gurudevi-mobile/docs/old_docs/PR_REVIEW_RESPONSE.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 1 | 1/0/0 |
| apps/gurudevi-mobile/docs/old_docs/PR_SUMMARY.md | main | progress/status | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 8 | 1/0/1 |
| apps/gurudevi-mobile/docs/old_docs/QUICK_REFERENCE.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 15 | 0/1/0 |
| apps/gurudevi-mobile/docs/old_docs/QUICK_VISUAL_SUMMARY.md | main | progress/status | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/REORGANIZATION_SUMMARY.md | main | progress/status | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/SECURITY_ARCHITECTURE_REVIEW.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 5 | 1/1/0 |
| apps/gurudevi-mobile/docs/old_docs/THEME_INTEGRATION_PLAN.md | main | plan | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 15 | 1/2/0 |
| apps/gurudevi-mobile/docs/old_docs/Theme.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/UI_REDESIGN_PLAN.md | main | plan | 2026-07-24 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/UX_CONSISTENCY_GUIDE.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 10 | 0/1/0 |
| apps/gurudevi-mobile/docs/old_docs/copilot_workspace_delegation_analysis.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 3 | 12 | 0/4/0 |
| apps/gurudevi-mobile/docs/old_docs/copilot_workspace_prompt.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/feature_definitions.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 2 | 0/1/0 |
| apps/gurudevi-mobile/docs/old_docs/gurudevi_final_invitation_auth_system.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 3 | 161 | 17/19/2 |
| apps/gurudevi-mobile/docs/old_docs/implementation plan doc 1.md | main | plan | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/implementation_plan_ui_abstraction.md | main | plan | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 9 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/onboarding_design.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 6 | 11 | 6/1/0 |
| apps/gurudevi-mobile/docs/old_docs/protocol_oriented_authority.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/strategic_delegation_plan.md | main | plan | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/old_docs/task copy.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 81 | 10/18/9 |
| apps/gurudevi-mobile/docs/old_docs/ui_abstraction_layer_architecture.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 4 | 22 | 1/0/0 |
| apps/gurudevi-mobile/docs/old_docs/walkthrough_ui_abstraction.md | main | architecture/dev | 2026-07-24 | 2026-08-24 18:46 | active | 3 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/project-map.md | branch-only | architecture/dev | 2026-03-20 | 2026-06-08 19:48 | active | 2 | 6 | 0/1/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-adopt-hygiene.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-agent-docs-skills-qa.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-agent-search-infra.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-build-bundler-tooling.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-cross-platform-noise-triage.md | main | research | 2026-09-05 17:16 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-education-domain-pedagogy.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-expo-native-evolution.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-forage-candidate-catalog.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-pilot-agent-evidence.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-rn-performance-patterns.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-spike-cn-parity.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-spike-native-capabilities.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-styling-design-system.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/research/2026-09-04-trial-ci-visual.md | main | research | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/role-feature-map.md | deleted f8ed0e7f | architecture/dev | 2026-02-25 22:35 | 2026-02-28 08:35 |  | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/runbooks/2026-09-22-google-play-google-oauth-release-runbook.md | main | architecture/dev | 2026-09-22 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/runbooks/gurudevi-audit-remediation-sop.md | main | progress/status | 2026-09-07 | 2026-09-07 13:38 | active | 1 | 7 | 0/0/0 |
| apps/gurudevi-mobile/docs/runbooks/pedagogy-srl-composition-points.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | active | 1 | 8 | 0/2/0 |
| apps/gurudevi-mobile/docs/runbooks/play-console-hygiene-m1-m6.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | active | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/runbooks/screenmap-sling-approval-packet.md | main | architecture/dev | 2026-09-05 | 2026-09-05 17:16 | dropped | 1 | 17 | 1/0/0 |
| apps/gurudevi-mobile/docs/runbooks/visual-qa-screenshot-checklist.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | active | 1 | 25 | 3/0/0 |
| apps/gurudevi-mobile/docs/runbooks/vitest-5-closeout-decision.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/docs/school_erp/architecture_meta_exploration.md | main | architecture/dev | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 4 | 0/1/0 |
| apps/gurudevi-mobile/docs/school_erp/implementation 3.md | main | architecture/dev | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/school_erp/implementation_pass_2_execution.md | main | architecture/dev | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 5 | 0/2/0 |
| apps/gurudevi-mobile/docs/school_erp/package_definitions.md | main | architecture/dev | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 3 | 0/0/0 |
| apps/gurudevi-mobile/docs/school_erp/package_inventory.md | main | architecture/dev | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 4 | 0/0/0 |
| apps/gurudevi-mobile/docs/school_erp/plan_1_foundation.md | main | plan | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/school_erp/plan_2_features.md | main | plan | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/school_erp/plan_3_web_and_future.md | main | plan | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 3 | 0/1/0 |
| apps/gurudevi-mobile/docs/school_erp/web-mobile-package-migration-plan.md | main | plan | 2026-03-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/WEB_ALIGNMENT_HANDOVER.md | main | architecture/dev | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/WEB_COMPAT_STRATEGY.md | main | architecture/dev | 2026-06-13 | 2026-08-24 18:46 | active | 1 | 10 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/WEB_GUIDE.md | main | architecture/dev | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/WEB_PLATFORM.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 72 | 1/0/0 |
| apps/gurudevi-mobile/docs/web/WEB_VITALITY_MANIFESTO.md | main | architecture/dev | 2026-03-07 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/gurudevi-web-layout-guide.md | main | architecture/dev | 2026-05-25 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/implementation_plan_web_modals.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/implementation_plan_web_nav.md | deleted ad154bf9 | plan | 2026-03-04 08:42 | 2026-03-13 15:57 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/implementation_plan_web_ui.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/innovation_plan_v2.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/innovation_plan_v3.md | main | plan | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 1 | 0/1/0 |
| apps/gurudevi-mobile/docs/web/mapping-strategy.md | main | architecture/dev | 2026-03-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/vault-strategy.md | main | architecture/dev | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/web_issues_i_saw.md | main | architecture/dev | 2026-03-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/docs/web/web_native_critique.md | main | architecture/dev | 2026-03-04 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/reports/check-code-child-routes.md | main | progress/status | 2026-06-08 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/reports/check-code-modal-shell.md | main | progress/status | 2026-06-08 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/reports/check-code-nested-routes.md | main | progress/status | 2026-06-08 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/reports/check-code-web-shell.md | main | progress/status | 2026-06-08 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/reports/check-code.md | main | progress/status | 2026-06-08 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/reports/db-drift/2026-06-27-database-drift-scorecard.md | deleted 299009c5 | progress/status | 2026-06-27 | 2026-08-10 22:43 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/runtime-fixtures/style-engine/README.md | main | architecture/dev | 2026-09-07 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/src/components/LotusPetalFAB.README.md | deleted c6a9b36b | architecture/dev | 2026-02-04 20:15 | 2026-02-05 15:04 |  | 1 | 16 | 0/0/0 |
| apps/gurudevi-mobile/src/ui/README.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:20 | superseded | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/supabase/DATABASE_BACKUP_GUIDE.md | main | architecture/dev | 2026-08-10 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/supabase/SSOT_SYNC_PLAN.md | main | plan | 2026-03-19 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/supabase/SUPABASE_SETUP_GUIDE.md | main | architecture/dev | 2026-02-11 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/supabase/migration_status.md | main | progress/status | 2026-07-28 | 2026-09-01 01:53 | active | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/temp/EDLOVE_GURUDEVI_CONTEXT.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 4 | 1/3/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_AUDIT_COVERAGE_MATRIX.md | main | plan | 2026-09-07 13:38 | 2026-09-12 20:24 |  | 1 | 1 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_AUDIT_INDEX.md | main | progress/status | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_AUDIT_WORKLOG.md | main | progress/status | 2026-09-07 13:38 | 2026-09-12 20:24 |  | 1 | 12 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_CONCRETE_REMEDIATION_CHECKLIST.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 36 | 2/2/1 |
| apps/gurudevi-mobile/temp/GURUDEVI_EXECUTION_ROADMAP.md | main | plan | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 2 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_FIRST_ABSTRACTION_PATTERNS.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_GRANULAR_LINE_BY_LINE_CROSSLIST.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_MOBILE_FINDINGS_AND_TREATMENTS.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_SECOND_ABSTRACTION_CONTROLS.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_STACK_AND_DOC_FRESHNESS.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_SYSTEMIC_PATTERNS_AND_PREVENTION.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 43 | 0/4/1 |
| apps/gurudevi-mobile/temp/GURUDEVI_TEMPORAL_FLOW_AUDIT.md | main | progress/status | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_TWO_LAYER_AUDIT.md | main | progress/status | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 7 | 1/0/1 |
| apps/gurudevi-mobile/temp/GURUDEVI_USABILITY_DELIGHT_A11Y_AUDIT.md | main | progress/status | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/temp/GURUDEVI_USEEFFECT_ANALYSIS.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/temp/edtech_global_comprehensive.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 5 | 0/0/0 |
| apps/gurudevi-mobile/temp/south_asia_edtech_stats.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 8 | 0/1/0 |
| apps/gurudevi-mobile/temp/sri_lanka_edtech_deep_dive.md | main | other | 2026-09-07 13:38 | 2026-09-07 13:38 |  | 1 | 20 | 1/6/0 |
| apps/gurudevi-mobile/tsc_errors_principal.txt | deleted 83e3b4c9 | other | 2026-02-09 15:29 | 2026-02-10 23:20 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/tsc_errors_utf8.txt | deleted 83e3b4c9 | other | 2026-02-05 09:22 | 2026-02-10 23:20 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/tsc_errors_v2.txt | deleted 83e3b4c9 | other | 2026-02-05 09:22 | 2026-02-10 23:20 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/tsc_output.txt | deleted 83e3b4c9 | other | 2026-02-05 16:38 | 2026-02-10 23:20 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/tsc_output_2.txt | deleted 6b5a8e79 | other | 2026-02-05 02:53 | 2026-02-05 02:53 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-mobile/tsc_output_latest.txt | deleted 83e3b4c9 | other | 2026-02-09 15:29 | 2026-02-10 23:20 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-web/AGENTS.md | main | other | 2026-09-12 20:24 | 2026-09-12 20:24 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-web/CONTEXT.md | main | other | 2026-02-12 08:04 | 2026-09-12 20:24 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-web/README.md | main | architecture/dev | 2026-02-12 08:55 | 2026-10-15 19:19 |  | 1 | 0 | 0/0/0 |
| apps/gurudevi-webApp/README.md | deleted 8fd7e343 | architecture/dev | 2026-02-27 12:09 | 2026-03-11 11:14 |  | 1 | 0 | 0/0/0 |
| apps/intuitui-web/CONTEXT.md | deleted 37f1f5a5 | other | 2026-02-12 08:04 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/intuitui-web/README.md | deleted 37f1f5a5 | architecture/dev | 2026-02-12 08:55 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/intuitui-web/docs/INDEX.md | deleted 37f1f5a5 | architecture/dev | 2026-07-28 | 2026-08-24 14:17 | active | 1 | 1 | 0/0/0 |
| apps/intuitui-web/docs/Intuitui Labs.md | branch-only | architecture/dev | 2026-02-12 08:04 | 2026-02-12 08:04 |  | 2 | 0 | 0/0/0 |
| apps/intuitui-web/docs/website.md | branch-only | architecture/dev | 2026-02-12 08:04 | 2026-02-12 08:04 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/CONTEXT.md | deleted 37f1f5a5 | other | 2026-02-12 08:04 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/neevsk-web/README.md | deleted 37f1f5a5 | architecture/dev | 2026-02-12 08:55 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/neevsk-web/docs/00-MASTER-OVERVIEW.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 3 | 0/0/0 |
| apps/neevsk-web/docs/01-THEME-HOME.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/docs/02-THEME-NATURE.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 2 | 0/1/0 |
| apps/neevsk-web/docs/03-THEME-TWILIGHT-SYSTEMS.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 2 | 0/1/0 |
| apps/neevsk-web/docs/04-THEME-LIGHT-TECH.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 2 | 0/0/0 |
| apps/neevsk-web/docs/05-THEME-WARM-ARCHIVE.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 3 | 0/1/0 |
| apps/neevsk-web/docs/06-THEME-DIGITAL-NEON.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 2 | 0/1/0 |
| apps/neevsk-web/docs/07-CONTENT-ARCHITECTURE.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/docs/08-COMPONENT-LIBRARY.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 14 | 0/0/0 |
| apps/neevsk-web/docs/09-ANIMATION-INTERACTIONS.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 10 | 0/0/0 |
| apps/neevsk-web/docs/10-PAGE-DESIGNS.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/docs/11-TECHNICAL-IMPLEMENTATION.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 16 | 0/0/0 |
| apps/neevsk-web/docs/12-NAVIGATION-FOOTER.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/docs/13-CREATIVE-SIGNATURES.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 10 | 0/1/0 |
| apps/neevsk-web/docs/AI-AGENT-BUILD-BRIEF.md | branch-only | architecture/dev | 2026-02-14 11:23 | 2026-02-14 14:38 |  | 2 | 13 | 0/1/0 |
| apps/neevsk-web/docs/COLOR_PALETTE_UPGRADE.md | branch-only | architecture/dev | 2026-02-14 11:30 | 2026-02-14 11:30 |  | 2 | 1 | 0/1/0 |
| apps/neevsk-web/docs/CONTENT_EXECUTION_IMMEDIATE.md | branch-only | architecture/dev | 2026-02-17 16:20 | 2026-02-17 16:20 |  | 3 | 2 | 0/0/0 |
| apps/neevsk-web/docs/CONTENT_IMPLEMENTATION_PLAN.md | branch-only | plan | 2026-02-17 16:20 | 2026-02-17 16:20 |  | 3 | 59 | 1/3/0 |
| apps/neevsk-web/docs/DESIGN_TRANSFORMATION_SUMMARY.md | branch-only | progress/status | 2026-02-14 11:15 | 2026-02-14 14:38 |  | 2 | 14 | 0/0/0 |
| apps/neevsk-web/docs/INDEX.md | deleted 37f1f5a5 | architecture/dev | 2026-07-28 | 2026-08-24 14:17 | active | 1 | 8 | 0/0/0 |
| apps/neevsk-web/docs/changes.md | branch-only | architecture/dev | 2026-02-14 18:11 | 2026-02-14 18:11 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/docs/hall_of_flame.md | branch-only | architecture/dev | 2026-02-12 08:17 | 2026-02-12 08:17 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/docs/neevsk_website.md | branch-only | architecture/dev | 2026-02-12 08:04 | 2026-02-12 08:04 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/docs/personal-section-content.md | branch-only | architecture/dev | 2026-02-14 07:14 | 2026-02-14 07:14 |  | 2 | 0 | 0/0/0 |
| apps/neevsk-web/src/content/archive/01-uncollapsed-wave.md | deleted 37f1f5a5 | other | 2026-02-12 11:04 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/neevsk-web/src/content/hall-of-flame/first-light.md | deleted 37f1f5a5 | other | 2026-02-12 11:04 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/neevsk-web/src/content/projects/edlove-ai.md | deleted 37f1f5a5 | other | 2026-02-12 11:04 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/neevsk-web/src/content/projects/polymath.md | deleted 37f1f5a5 | other | 2026-02-12 11:04 | 2026-08-24 14:17 |  | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 17:33 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/INDEX.md | main | architecture/dev | 2026-07-30 | 2026-08-29 20:21 | active | 1 | 34 | 1/0/0 |
| apps/sanctuary-api/docs/architecture/2026-06-12-ai-orchestrator-hono-migration.md | main | architecture/dev | 2026-06-12 | 2026-06-13 12:07 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/2026-06-25-sovereign-api-architecture-direction.md | main | architecture/dev | 2026-06-25 | 2026-07-26 13:47 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/2026-06-25-tools-adoption-matrix.md | main | plan | 2026-07-26 | 2026-07-28 10:58 | active | 1 | 18 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/2026-06-26-guest-session-lifecycle.md | main | architecture/dev | 2026-06-26 | 2026-06-26 22:57 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/2026-07-26-observability-and-tracing-plan.md | main | plan | 2026-07-26 | 2026-07-28 10:58 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/2026-07-26-otel-hono-bun-feature-spec.md | main | plan | 2026-07-26 | 2026-07-28 10:58 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/2026-07-30-orpc-test-audit.md | main | progress/status | 2026-07-30 | 2026-07-30 08:03 | active | 1 | 4 | 0/2/0 |
| apps/sanctuary-api/docs/architecture/2026-08-25-comprehensive-audit-and-plan.md | main | plan | 2026-08-25 | 2026-08-29 20:21 | active | 1 | 39 | 1/0/0 |
| apps/sanctuary-api/docs/architecture/developer-onboarding-guide.md | main | architecture/dev | 2026-06-25 | 2026-06-26 22:57 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/developer-sandbox-console.md | main | architecture/dev | 2026-06-26 | 2026-06-26 22:57 | superseded | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/infrastructure-and-cost-evaluation.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 5 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/orpc-api-architecture.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/orpc-contributor-guide.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/orpc-migration-and-effect-standards.md | main | architecture/dev | 2026-07-29 | 2026-07-30 08:03 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/tech-stack-and-standards.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/architecture/testing-standards.md | main | architecture/dev | 2026-06-25 | 2026-06-26 22:57 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/current_progress/2026-07-30-orpc-migration-checkpoint.md | main | progress/status | 2026-07-30 | 2026-07-30 08:03 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-announcements-orpc-slice-spec.md | main | plan | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-classroom-lifecycle-orpc-cutover.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-classroom-note-timeline-orpc-cutover.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-community-comments-polls-data-model-proposal.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-community-group-messaging-orpc-cutover.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-direct-messaging-orpc-cutover.md | main | architecture/dev | 2026-07-30 08:03 | 2026-07-30 08:03 | accepted | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-group-member-management-orpc-cutover.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-library-read-orpc-cutover.md | main | architecture/dev | 2026-07-30 08:03 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-notifications-safety-orpc-slice-spec.md | main | plan | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-onboarding-actor-derivation.md | main | architecture/dev | 2026-07-30 08:03 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-principal-notes-orpc-cutover.md | main | architecture/dev | 2026-07-30 08:03 | 2026-07-30 08:03 | proposed | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/decisions/2026-07-30-profile-social-links-orpc-cutover.md | main | architecture/dev | 2026-07-30 | 2026-07-30 08:03 | implemented | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/docs-sop.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/implementation/PRODUCTION_HARDENING_MASTER_PLAN.md | main | plan | 2026-08-25 | 2026-08-29 20:21 | active | 1 | 15 | 1/0/1 |
| apps/sanctuary-api/docs/infra/2026-06-25-astro-v6-to-v7-breaking-changes.md | main | architecture/dev | 2026-06-25 | 2026-06-25 16:26 | active | 1 | 0 | 0/0/0 |
| apps/sanctuary-api/docs/infra/astro-v7-upgrade-guide.md | main | architecture/dev | 2026-06-25 | 2026-06-25 16:26 | active | 1 | 4 | 0/1/0 |
| apps/sanctuary-api/docs/runbooks/template.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 4 | 0/0/0 |
| apps/teacher-platform/README.md | branch-only | architecture/dev | 2025-12-12 10:41 | 2025-12-12 10:41 |  | 2 | 0 | 0/0/0 |
| apps/teacher-platform/debug_log.txt | branch-only | other | 2025-12-12 10:41 | 2025-12-12 10:41 |  | 2 | 0 | 0/0/0 |
| apps/web/README.md | branch-only | architecture/dev | 2025-11-03 17:04 | 2025-11-03 17:04 |  | 3 | 0 | 0/0/0 |
| audit_report.md | deleted b6bd32cd | progress/status | 2026-02-26 21:26 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| audit_report_clean.md | deleted cd136234 | progress/status | 2026-03-20 22:35 | 2026-03-25 15:48 |  | 1 | 0 | 0/0/0 |
| audit_report_full.md | deleted cd136234 | progress/status | 2026-03-20 22:35 | 2026-03-25 15:48 |  | 1 | 0 | 0/0/0 |
| docs/2026-07-24-expo-57-rust-inline-module-chronicle.md | branch-only | architecture/dev | 2026-07-28 10:58 | 2026-07-28 10:58 |  | 2 | 0 | 0/0/0 |
| docs/ARCHITECTURAL_TESTING_STRATEGY.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 6 | 1/0/0 |
| docs/Advanced Rust CPP/ai-agent-tooling-and-rn-toolchain-guide-1.md | deleted 40190328 | architecture/dev | 2026-08-08 18:58 | 2026-08-24 15:01 |  | 1 | 0 | 0/0/0 |
| docs/Advanced Rust CPP/cpp-rust-rn-native-research.md | branch-only | research | 2026-07-28 10:58 | 2026-07-28 10:58 |  | 2 | 0 | 0/0/0 |
| docs/Advanced Rust CPP/expo-prebuild-ci-config-patterns.md | branch-only | architecture/dev | 2026-07-28 10:58 | 2026-07-28 10:58 |  | 2 | 0 | 0/0/0 |
| docs/Advanced Rust CPP/famous-native-integrations-deep-dive.md | branch-only | architecture/dev | 2026-07-28 10:58 | 2026-07-28 10:58 |  | 2 | 0 | 0/0/0 |
| docs/Advanced Rust CPP/ffi-mechanics-deep-dive-1.md | deleted 40190328 | architecture/dev | 2026-08-08 18:58 | 2026-08-24 15:01 |  | 1 | 0 | 0/0/0 |
| docs/Advanced Rust CPP/ffi-verification-rd-synthesis.md | deleted 40190328 | architecture/dev | 2026-08-08 18:58 | 2026-08-24 15:01 |  | 1 | 0 | 0/0/0 |
| docs/Advanced Rust CPP/gurudevi-rust-crates-reference.md | deleted 40190328 | architecture/dev | 2026-07-28 10:58 | 2026-08-24 15:01 |  | 1 | 0 | 0/0/0 |
| docs/Advanced Rust CPP/multi-agent-ffi-detection-synthesis-paper.md | deleted 40190328 | architecture/dev | 2026-08-08 18:58 | 2026-08-24 15:01 |  | 1 | 1 | 0/0/0 |
| docs/Advanced Rust CPP/wasm-deep-dive-mobile-constraints.md | deleted 40190328 | architecture/dev | 2026-08-08 18:58 | 2026-08-24 15:01 |  | 1 | 1 | 0/0/0 |
| docs/BRANCHING_MODEL.md | deleted 8c03da6a | architecture/dev | 2026-03-20 22:35 | 2026-06-08 19:48 |  | 1 | 0 | 0/0/0 |
| docs/COVERAGE_PLAN.md | main | plan | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 25 | 4/1/0 |
| docs/Core/agent-observability-contract.md | main | architecture/dev | 2026-08-13 | 2026-08-13 15:20 | active | 1 | 0 | 0/0/0 |
| docs/Core/data-state-ownership-map.md | main | architecture/dev | 2026-08-13 | 2026-08-13 15:20 | active | 1 | 6 | 0/0/0 |
| docs/Core/decision-architecture-framework.md | deleted 5011c5c1 | architecture/dev | 2026-07-28 10:58 | 2026-08-10 22:45 |  | 1 | 0 | 0/0/0 |
| docs/Core/design/2026-09-09-gurudevi-living-firefly-implementation-spec.md | main | plan | 2026-09-09 | 2026-09-12 20:24 | proposed | 1 | 0 | 0/0/0 |
| docs/Core/design/2026-09-09-gurudevi-living-mascot-art-direction-guide.md | main | architecture/dev | 2026-09-09 | 2026-09-12 20:24 | proposed | 1 | 0 | 0/0/0 |
| docs/Core/design/2026-09-09-gurudevi-mascot-reset-plan.md | main | plan | 2026-09-09 | 2026-09-12 20:24 | proposed | 1 | 10 | 0/4/0 |
| docs/Core/design/gurudevi-design-system-audit-and-plan.md | main | plan | 2026-08-30 | 2026-09-01 01:53 | active | 1 | 14 | 1/0/0 |
| docs/Core/design/gurudevi-mascot-system-production-plan.md | main | plan | 2026-08-30 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| docs/Core/developer-playbook.md | main | architecture/dev | 2026-08-11 | 2026-08-10 22:45 | active | 3 | 0 | 0/0/0 |
| docs/Core/editorial-publishing-future-directions.md | main | architecture/dev | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 1 | 0/1/0 |
| docs/Core/editorial-publishing-vision.md | main | plan | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| docs/Core/gurudevi-sanctuary-your-guide.md | main | architecture/dev | 2026-08-11 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| docs/Core/journey-chronological.md | deleted 5011c5c1 | architecture/dev | 2026-07-28 10:58 | 2026-08-10 22:45 |  | 1 | 0 | 0/0/0 |
| docs/Core/journey-synthesis.md | deleted 5011c5c1 | architecture/dev | 2026-07-28 10:58 | 2026-08-10 22:45 |  | 1 | 0 | 0/0/0 |
| docs/Core/local-first-architecture-principles.md | main | architecture/dev | 2026-08-11 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| docs/Core/onboarding.md | main | architecture/dev | 2026-06-26 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| docs/INDEX.md | main | architecture/dev | 2026-10-04 | 2026-10-06 21:15 | active | 1 | 0 | 0/0/0 |
| docs/Learning.md | branch-only | architecture/dev | 2025-11-03 18:01 | 2025-11-03 18:01 |  | 1 | 0 | 0/0/0 |
| docs/MIGRATION-GUIDE.md | main | architecture/dev | 2026-07-18 | 2026-07-28 10:58 | active | 1 | 0 | 0/0/0 |
| docs/RN Terrain/Core/rn-terrain-agent-guide.md | deleted 49e2d675 | architecture/dev | 2026-06-09 12:15 | 2026-08-24 15:25 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/Core/rn-terrain-founder-doc.md | deleted 49e2d675 | architecture/dev | 2026-06-09 12:15 | 2026-08-24 15:25 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/INDEX.md | deleted 49e2d675 | architecture/dev | 2026-06-09 12:15 | 2026-08-24 15:25 |  | 1 | 8 | 0/0/0 |
| docs/RN Terrain/README.md | deleted e1edebcb | architecture/dev | 2026-08-24 15:25 | 2026-08-24 18:37 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/architecture/rn-terrain-blueprint-v2.md | deleted 49e2d675 | architecture/dev | 2026-06-09 12:15 | 2026-08-24 15:25 |  | 1 | 21 | 0/0/0 |
| docs/RN Terrain/architecture/rn-terrain-integrity-spec.md | deleted 49e2d675 | plan | 2026-06-09 12:15 | 2026-08-24 15:25 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/current_progress/2026-06-09-rn-terrain-phase-1-implementation-plan.md | deleted 49e2d675 | plan | 2026-06-09 | 2026-08-24 15:25 | active | 1 | 0 | 0/0/0 |
| docs/RN Terrain/current_progress/2026-06-09-rn-terrain-phase-1-walkthrough.md | deleted 49e2d675 | plan | 2026-06-09 | 2026-08-24 15:25 | active | 1 | 0 | 0/0/0 |
| docs/RN Terrain/current_progress/old_docs/2026-06-02-rn-terrain-chronicle.md | deleted 49e2d675 | progress/status | 2026-06-09 12:15 | 2026-08-24 15:25 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/decisions/2026-06-02-rn-terrain-open-source-strategy.md | deleted 49e2d675 | architecture/dev | 2026-06-09 12:15 | 2026-08-24 15:25 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/catalog/edlove-web.md | branch-only | research | 2026-08-10 22:44 | 2026-08-10 22:44 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/catalog/gurudevi-marketingWeb.md | branch-only | content/marketing | 2026-08-10 22:44 | 2026-08-13 15:05 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/catalog/gurudevi-mobile.md | branch-only | research | 2026-08-10 22:44 | 2026-08-22 14:45 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/catalog/intuitui-web.md | deleted e1edebcb | research | 2026-08-10 22:44 | 2026-08-24 18:37 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/catalog/neevsk-web.md | deleted e1edebcb | research | 2026-08-10 22:44 | 2026-08-24 18:37 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/catalog/sanctuary-api.md | branch-only | research | 2026-08-10 22:44 | 2026-08-14 17:25 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/dependency-catalog.md | branch-only | research | 2026-08-10 22:44 | 2026-08-24 15:01 |  | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/rn-terrain-landscape-giants.md | deleted e1edebcb | research | 2026-08-05 | 2026-08-24 18:37 | active | 1 | 0 | 0/0/0 |
| docs/RN Terrain/landscape/stack-map.md | branch-only | research | 2026-08-10 22:44 | 2026-08-24 15:01 |  | 1 | 0 | 0/0/0 |
| docs/agent/skill-doctor-quarterly-process.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 6 | 1/0/0 |
| docs/architecture-guidelines.md | branch-only | architecture/dev | 2026-03-30 | 2026-06-08 19:48 | active | 2 | 0 | 0/0/0 |
| docs/architecture/2026-06-19-sanctuary-authorization-final-architecture.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 6 | 0/0/0 |
| docs/architecture/2026-06-19-sqlite-drizzle-powersync-mechanics-guide.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/architecture/2026-06-22-gurudevi-architecture-draft-1.md | main | architecture/dev | 2026-08-10 | 2026-08-24 18:46 | active | 2 | 13 | 1/0/0 |
| docs/architecture/2026-07-23-architecture-analysis.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 36 | 0/0/0 |
| docs/architecture/2026-07-23-docs-grounded-architecture-analysis.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 44 | 0/1/0 |
| docs/architecture/2026-07-24-cedar-benchmark-sop-architecture.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/architecture/2026-07-24-permission-refactor-review-report.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 12 | 0/0/0 |
| docs/architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md | main | architecture/dev | 2026-08-10 | 2026-08-13 07:37 | active | 1 | 29 | 3/1/3 |
| docs/architecture/2026-08-13-sanctuary-api-production-architecture-review.md | main | architecture/dev | 2026-08-14 | 2026-08-14 17:25 | proposed | 1 | 18 | 1/3/0 |
| docs/architecture/2026-08-25-gurudevi-workspace-canvas-audit.md | main | progress/status | 2026-08-25 | 2026-08-29 20:21 | active | 1 | 6 | 1/0/0 |
| docs/architecture/2026-08-25-storage-efficiency-plan.md | main | plan | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 19 | 1/5/1 |
| docs/architecture/2026-08-29-sanctuary-api-adversarial-security-audit.md | main | progress/status | 2026-08-30 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-08-29-sanctuary-api-future-readiness-audit.md | main | progress/status | 2026-08-29 | 2026-08-29 20:21 | active | 1 | 2 | 0/0/0 |
| docs/architecture/2026-08-29-sanctuary-experience-parity-audit.md | main | progress/status | 2026-08-29 20:21 | 2026-08-30 02:40 |  | 1 | 0 | 0/0/0 |
| docs/architecture/2026-09-05-a11y-gate-canonical-consolidation.md | main | architecture/dev | 2026-09-05 | 2026-10-06 14:04 | active | 1 | 8 | 0/0/0 |
| docs/architecture/2026-09-07-sovereign-data-scale-and-olap-topology.md | main | architecture/dev | 2026-09-07 | 2026-09-08 00:57 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-09-15-community-domain-canonical.md | main | architecture/dev | 2026-09-15 | 2026-09-20 00:01 | superseded | 1 | 0 | 0/0/0 |
| docs/architecture/2026-09-15-workspace-classroom-domain-authority.md | main | architecture/dev | 2026-09-15 | 2026-09-20 00:01 | canonical | 1 | 24 | 7/8/0 |
| docs/architecture/2026-09-20-deep-link-security-and-resilience.md | main | architecture/dev | 2026-09-20 | 2026-09-20 19:49 | superseded | 1 | 0 | 0/0/0 |
| docs/architecture/2026-09-20-jwt-auth-identity-modes-and-route-boundaries.md | main | architecture/dev | 2026-09-20 | 2026-09-20 16:20 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-09-20-mutation-pipeline-optimizations-and-low-end-efficiency.md | main | architecture/dev | 2026-09-20 | 2026-09-20 21:01 | active | 1 | 3 | 0/0/0 |
| docs/architecture/2026-10-06-harness-and-verification-audit.md | main | progress/status | 2026-10-06 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-10-08-autonomous-frontier-discovery-engine.md | main | architecture/dev | 2026-10-08 21:15 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-10-08-codebase-scale-and-vibe-coding-audit.md | main | progress/status | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 1 | 0/1/0 |
| docs/architecture/2026-10-08-decay-of-secondary-knowledge.md | main | architecture/dev | 2026-10-08 21:15 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-10-08-empirical-toolchain-verification-loop.md | main | architecture/dev | 2026-10-08 21:15 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-10-08-enterprise-architecture-and-governance.md | main | architecture/dev | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 5 | 0/0/0 |
| docs/architecture/2026-10-08-integrated-frontier-verification-architecture.md | main | architecture/dev | 2026-10-08 21:15 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/architecture/2026-10-08-sovereign-deep-linking-and-threat-model.md | main | architecture/dev | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 10 | 0/2/0 |
| docs/architecture/2026-10-08-the-3-operational-dimensions-of-agentic-systems.md | main | architecture/dev | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 4 | 0/0/0 |
| docs/architecture/2026-10-08-the-4-pillars-of-vibe-and-harness-engineering.md | main | architecture/dev | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 7 | 0/0/0 |
| docs/architecture/2026-10-08-the-architecture-of-ai-native-systems.md | main | architecture/dev | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/architecture/API_IMPLEMENTATION_PHASED_PLAN.md | main | plan | 2026-08-14 | 2026-08-24 18:46 | active | 1 | 12 | 1/1/0 |
| docs/architecture/AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md | deleted 8c03da6a | architecture/dev | 2026-05-22 14:43 | 2026-06-08 19:48 |  | 1 | 2 | 2/0/0 |
| docs/architecture/WORKER_PARITY_MATRIX.md | main | plan | 2026-08-14 | 2026-08-24 18:46 | active | 1 | 7 | 3/0/0 |
| docs/architecture/adaptive-capabilities-production-hardening-plan.md | main | plan | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/adaptive-visual-capabilities-integration.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/api-boundary-migration-backlog.md | main | plan | 2026-08-14 | 2026-08-24 18:46 | active | 1 | 17 | 3/0/0 |
| docs/architecture/architecture-deep-dive.md | main | architecture/dev | 2026-03-30 | 2026-06-13 12:07 | active | 3 | 0 | 0/0/0 |
| docs/architecture/architecture-guidelines.md | main | architecture/dev | 2026-03-30 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| docs/architecture/component-import-decisions.md | main | architecture/dev | 2026-08-30 02:40 | 2026-08-30 02:40 |  | 1 | 0 | 0/0/0 |
| docs/architecture/dependency-intelligence-graph.md | main | architecture/dev | 2026-09-26 | 2026-10-06 14:04 | active | 1 | 5 | 0/0/0 |
| docs/architecture/dependency-intelligence-master.md | main | architecture/dev | 2026-09-26 | 2026-10-06 14:04 | active | 1 | 49 | 2/7/0 |
| docs/architecture/device-efficiency-guidance.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/device-efficiency-implementation-plan.md | main | plan | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 9 | 1/3/0 |
| docs/architecture/ecosystem-50-vendors-landscape.md | main | research | 2026-08-30 02:40 | 2026-08-30 02:40 |  | 1 | 0 | 0/0/0 |
| docs/architecture/editorial-platform-architecture.md | main | architecture/dev | 2026-08-31 | 2026-09-01 01:53 | draft | 1 | 1 | 0/0/0 |
| docs/architecture/effect-ts-architecture.md | main | architecture/dev | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/architecture/environment-topology-and-promotion.md | main | architecture/dev | 2026-09-28 | 2026-10-06 14:04 | active | 1 | 9 | 0/1/0 |
| docs/architecture/external-packages-linking.md | main | architecture/dev | 2026-09-04 07:59 | 2026-10-06 14:04 |  | 1 | 26 | 4/0/0 |
| docs/architecture/firefly-feedback-system.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/gurudevi-data-state-lifecycle.md | main | architecture/dev | 2026-08-10 | 2026-08-24 18:46 | active | 2 | 12 | 0/0/0 |
| docs/architecture/gurudevi-mascot-artwork-reproduction-guide.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/gurudevi-mascot-asset-pipeline.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/gurudevi-mascot-low-end-performance.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/gurudevi-registry-architecture.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/architecture/gurudevi-repository-registry-boundary.md | main | architecture/dev | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 3 | 0/0/0 |
| docs/architecture/gurudevi-sanctuary-permission-architecture.md | main | architecture/dev | 2026-07-26 | 2026-08-10 22:45 | superseded | 2 | 0 | 0/0/0 |
| docs/architecture/gurudevi-visual-confidence-without-devices.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/gurudevi-visual-feedback-hardening-spec.md | main | plan | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/gurudevi-visual-system-operating-model.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/architecture/memory-efficiency-guidance.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 1 | 0/0/0 |
| docs/architecture/memory-efficiency-implementation-plan.md | main | plan | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 14 | 1/2/0 |
| docs/architecture/multi-tenant-institutional-handoff.md | main | architecture/dev | 2026-09-07 | 2026-09-08 00:57 | active | 1 | 0 | 0/0/0 |
| docs/architecture/negentropy-reward-economy-and-ad-center-vision.md | main | plan | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| docs/architecture/offline-state-resilience-sop.md | main | architecture/dev | 2026-09-07 | 2026-09-20 00:01 | active | 1 | 0 | 0/0/0 |
| docs/architecture/production-evidence-governance.md | main | architecture/dev | 2026-09-28 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| docs/architecture/route-intent-policy.md | main | architecture/dev | 2026-09-20 | 2026-09-21 22:49 | active | 1 | 4 | 0/2/0 |
| docs/architecture/safe-exploration-and-reversible-work-model.md | main | architecture/dev | 2026-10-04 | 2026-10-06 14:04 | active | 1 | 12 | 0/0/0 |
| docs/architecture/sanctuary-experience-engineering-standard.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 8 | 0/0/0 |
| docs/architecture/state-and-component-strategy.md | main | architecture/dev | 2026-08-30 02:40 | 2026-09-20 00:01 |  | 1 | 0 | 0/0/0 |
| docs/architecture/tactile-spatial-depth-doctrine.md | main | architecture/dev | 2026-09-08 | 2026-10-06 21:15 | active | 1 | 0 | 0/0/0 |
| docs/architecture/tech-stack-and-standards.md | main | architecture/dev | 2026-06-26 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| docs/architecture/testing-standards.md | main | architecture/dev | 2026-06-26 | 2026-06-26 22:57 | active | 1 | 0 | 0/0/0 |
| docs/architecture/tinyfish-proxy-budget.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 0 | 0/0/0 |
| docs/architecture/tinyfish-proxy-flag-wiring.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 8 | 0/2/0 |
| docs/architecture/tinyfish-proxy-route-design.md | main | architecture/dev | 2026-09-04 | 2026-09-05 17:16 | draft | 1 | 2 | 0/0/0 |
| docs/architecture/tripartite-multi-perspective-architecture.md | main | plan | 2026-09-07 | 2026-09-08 00:57 | active | 1 | 4 | 0/1/0 |
| docs/architecture/ui-runtime-testing-standard.md | main | architecture/dev | 2026-09-07 | 2026-09-12 20:24 | active | 1 | 26 | 0/0/0 |
| docs/architecture/verification-and-harness-engineering-2026.md | main | architecture/dev | 2026-10-08 21:15 | 2026-10-08 21:15 |  | 1 | 3 | 0/1/0 |
| docs/architecture/vite-vitest-capabilities-matrix.md | main | plan | 2026-09-04 | 2026-09-04 07:57 | active | 1 | 0 | 0/0/0 |
| docs/architecture/zenstack-schema-architecture.md | main | architecture/dev | 2026-06-26 | 2026-09-04 07:59 | active | 1 | 0 | 0/0/0 |
| docs/architecture/zod-4-5-capabilities.md | main | architecture/dev | 2026-09-01 | 2026-09-04 07:58 | active | 1 | 6 | 0/0/0 |
| docs/archive/2026-10-06-public-launch-and-sponsorship/FUNDING_EVOLUTION.md | main | progress/status | 2026-10-06 21:15 | 2026-10-06 21:15 |  | 2 | 30 | 4/0/0 |
| docs/archive/2026-10-06-public-launch-and-sponsorship/PUBLIC_LAUNCH_PLAN.md | main | plan | 2026-10-06 21:15 | 2026-10-06 21:15 |  | 2 | 4 | 0/0/0 |
| docs/archive/2026-10-06-public-launch-and-sponsorship/README.md | main | architecture/dev | 2026-10-06 21:15 | 2026-10-06 21:15 |  | 1 | 0 | 0/0/0 |
| docs/archive/2026-10-06-public-launch-and-sponsorship/SPONSOR.md | main | architecture/dev | 2026-10-06 21:15 | 2026-10-06 21:15 |  | 2 | 5 | 0/1/0 |
| docs/archive/2026-10-06-public-launch-and-sponsorship/oss-public-release-devops-checklist.md | main | architecture/dev | 2026-10-02 | 2026-10-06 21:15 | active | 2 | 65 | 1/3/0 |
| docs/archive/2026-10-06-public-launch-and-sponsorship/oss-public-release-security-checklist.md | main | architecture/dev | 2026-10-02 | 2026-10-06 21:15 | active | 2 | 182 | 6/6/0 |
| docs/archive/2026-10-06-public-launch-and-sponsorship/oss-readiness-initial.md | main | architecture/dev | 2026-10-06 21:15 | 2026-10-06 21:15 |  | 2 | 0 | 0/0/0 |
| docs/cross-stack-storage-contracts.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-06-09-oxlint-eslint-hybrid-checklist.md | main | progress/status | 2026-06-12 | 2026-06-13 12:07 | active | 2 | 64 | 0/3/0 |
| docs/current_progress/2026-06-20-feature-rollout-implementation-plan.md | main | plan | 2026-06-20 | 2026-08-10 22:45 | active | 1 | 3 | 0/0/0 |
| docs/current_progress/2026-06-22-gurudevi-powersync-web-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/current_progress/2026-06-26-onboarding-api-routing.md | main | progress/status | 2026-06-26 | 2026-06-26 22:57 | active | 1 | 12 | 0/1/0 |
| docs/current_progress/2026-07-14-gurudevi-native-deps-migration.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 8 | 0/0/0 |
| docs/current_progress/2026-07-23-permission-feature-cleanup-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 4 | 0/0/0 |
| docs/current_progress/2026-07-28-expo-file-system-migration-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 5 | 0/1/0 |
| docs/current_progress/2026-07-28-gurudevi-local-pdp-implementation-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/current_progress/2026-08-06-community-chat-foundation-phased-plan.md | main | plan | 2026-08-06 | 2026-08-08 19:03 | draft | 1 | 8 | 6/0/0 |
| docs/current_progress/2026-08-09-doppler-implementation-plan.md | main | plan | 2026-08-09 | 2026-08-13 07:37 | active | 1 | 127 | 3/12/0 |
| docs/current_progress/2026-08-10-gurudevi-edlove-exploration-integration-plan.md | main | plan | 2026-08-10 | 2026-08-13 07:37 | active | 1 | 9 | 3/2/0 |
| docs/current_progress/2026-08-10-live-supabase-inspection.md | main | plan | 2026-08-10 | 2026-08-10 22:45 | active | 1 | 2 | 1/0/0 |
| docs/current_progress/2026-08-12-gurudevi-rigorous-improvement-plan.md | main | plan | 2026-08-12 | 2026-08-13 07:33 | draft | 1 | 7 | 0/2/0 |
| docs/current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md | main | plan | 2026-08-13 | 2026-08-13 15:20 | active | 1 | 51 | 1/1/0 |
| docs/current_progress/2026-08-27-guided-reflection-engine-extraction-proposal.md | main | progress/status | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-08-27-guided-reflection-persistence-port-proposal.md | main | progress/status | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-08-29-sanctuary-api-future-readiness-plan.md | main | plan | 2026-08-29 | 2026-08-29 20:21 | active | 1 | 7 | 0/2/0 |
| docs/current_progress/2026-08-29-sanctuary-experience-delivery-plan.md | main | plan | 2026-08-29 20:21 | 2026-09-01 01:53 |  | 1 | 7 | 0/0/0 |
| docs/current_progress/2026-08-30-sanctuary-api-implementation-handoff.md | main | progress/status | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 2 | 0/0/0 |
| docs/current_progress/2026-08-31-ad-center-phased-implementation-plan.md | main | plan | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 9 | 0/1/0 |
| docs/current_progress/2026-08-31-editorial-publishing-implementation-plan.md | main | plan | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 28 | 4/7/0 |
| docs/current_progress/2026-08-31-fluid-responsive-critique-and-next-gen-proposal.md | main | progress/status | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 5 | 0/0/0 |
| docs/current_progress/2026-08-31-fluid-responsive-web-architecture-plan.md | main | plan | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-08-31-gurudevi-registry-implementation-audit.md | main | progress/status | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 41 | 7/3/5 |
| docs/current_progress/2026-08-31-sanctuary-experience-firefly-handoff.md | main | progress/status | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-08-31-self-library-profile-current-state-audit-handoff.md | main | progress/status | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-07-ui-primitives-production-hardening-plan.md | main | plan | 2026-09-07 | 2026-09-12 20:24 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-12-gurudevi-web-hard-cutover-plan.md | main | plan | 2026-09-12 20:24 | 2026-09-15 00:36 |  | 1 | 29 | 10/1/1 |
| docs/current_progress/2026-09-12-gurudevi-web-migration-plan.md | main | plan | 2026-09-12 | 2026-09-12 20:24 | active | 1 | 8 | 0/1/0 |
| docs/current_progress/2026-09-12-gurudevi-web-route-compatibility-matrix.md | main | plan | 2026-09-12 20:24 | 2026-09-12 22:13 |  | 1 | 1 | 0/0/0 |
| docs/current_progress/2026-09-14-gurudevi-domain-canvas-port-map.md | main | progress/status | 2026-09-14 | 2026-09-15 00:36 | active | 1 | 1 | 0/0/0 |
| docs/current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md | main | plan | 2026-10-04 | 2026-10-06 21:15 | active | 1 | 2 | 0/0/0 |
| docs/current_progress/2026-09-14-gurudevi-web-migration-restart-handoff.md | main | progress/status | 2026-09-14 | 2026-09-15 00:36 | active | 1 | 3 | 0/1/0 |
| docs/current_progress/2026-09-15-gurudevi-library-domain-authority.md | main | progress/status | 2026-09-15 | 2026-09-20 00:01 | active | 1 | 38 | 3/7/1 |
| docs/current_progress/2026-09-15-gurudevi-self-migration-control-matrix.md | main | plan | 2026-09-20 00:01 | 2026-10-06 21:15 | active | 1 | 57 | 6/1/0 |
| docs/current_progress/2026-09-20-adversarial-production-hardening-ratchet-plan.md | main | plan | 2026-09-20 | 2026-09-20 16:20 | active | 1 | 25 | 0/1/0 |
| docs/current_progress/2026-09-20-auth-callback-lifecycle-hardening-feature-spec.md | main | plan | 2026-09-20 | 2026-09-21 22:49 | superseded | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-20-auth-session-lifecycle-hardening-feature-spec.md | main | plan | 2026-09-20 | 2026-09-21 22:49 | proposed | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-20-cross-platform-auth-session-seam-implementation-plan.md | main | plan | 2026-09-20 | 2026-09-21 22:49 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-20-cross-platform-local-first-implementation-plan.md | main | plan | 2026-09-20 | 2026-09-21 22:49 | in_progress | 1 | 15 | 2/6/0 |
| docs/current_progress/2026-09-20-future-hardening-roadmap.md | main | plan | 2026-09-20 | 2026-10-06 14:04 | active | 1 | 16 | 0/0/0 |
| docs/current_progress/2026-09-20-mutation-foundation-primitives-audit.md | main | progress/status | 2026-09-20 | 2026-09-21 22:49 | in progress | 1 | 9 | 0/1/0 |
| docs/current_progress/2026-09-20-mutation-offline-reconciliation-hardening-feature-spec.md | main | plan | 2026-09-20 | 2026-09-21 22:49 | superseded | 1 | 1 | 1/0/0 |
| docs/current_progress/2026-09-20-offline-mutation-hardening-and-hexagonal-decoupling.md | main | progress/status | 2026-09-20 | 2026-09-20 21:01 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-20-route-intent-policy-hardening-feature-spec.md | main | plan | 2026-09-20 | 2026-09-21 22:49 | proposed | 1 | 4 | 0/0/0 |
| docs/current_progress/2026-09-20-shared-route-intent-atlas-inventory.md | main | progress/status | 2026-09-20 | 2026-09-20 19:49 | active | 1 | 14 | 0/0/0 |
| docs/current_progress/2026-09-21-mutation-foundation-change-comparison.md | main | progress/status | 2026-09-21 | 2026-09-21 22:49 | review_required | 1 | 15 | 1/0/0 |
| docs/current_progress/2026-09-21-running-app-user-journey-plan.md | main | plan | 2026-09-21 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-21-single-account-auth-session-release-slice.md | main | progress/status | 2026-09-21 22:49 | 2026-09-21 22:49 |  | 1 | 9 | 2/0/0 |
| docs/current_progress/2026-09-22-gurudevi-edlove-detachment-inventory.md | main | progress/status | 2026-09-22 | 2026-10-06 14:04 | active — implementation input | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-22-gurudevi-web-native-separation-inventory-and-plan.md | main | plan | 2026-10-06 14:04 | 2026-10-06 14:04 |  | 1 | 4 | 1/0/0 |
| docs/current_progress/2026-09-22-next-host-routing-feature-spec.md | main | plan | 2026-10-06 14:04 | 2026-10-06 14:04 | implemented | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-22-sanctuary-domain-and-mobile-identity-cutover-plan.md | main | plan | 2026-09-22 | 2026-10-06 14:04 | approved architecture; implementation pending | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-22-sanctuary-identity-migration-feature-spec.md | main | plan | 2026-09-22 | 2026-10-06 14:04 | proposal — RED approval required before implementation | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-26-dependency-intelligence-graph-implementation-plan.md | main | plan | 2026-09-26 | 2026-10-06 14:04 | active | 1 | 35 | 3/3/0 |
| docs/current_progress/2026-09-26-gurudevi-web-implementation-plan.md | main | plan | 2026-09-26 | 2026-10-06 21:15 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-09-28-phase-1-evidence-classification.md | main | plan | 2026-09-28 | 2026-10-06 14:04 | active | 1 | 1 | 0/0/0 |
| docs/current_progress/2026-09-28-production-readiness-baseline.md | main | progress/status | 2026-09-28 | 2026-10-06 14:04 | draft | 1 | 11 | 0/0/0 |
| docs/current_progress/2026-10-06-harness-and-verification-checkpoint.md | main | progress/status | 2026-10-06 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-10-08-account-foundation-audit-workbook.md | main | progress/status | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 70 | 5/1/0 |
| docs/current_progress/2026-10-08-account-foundation-contradiction-register.md | main | progress/status | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-10-08-account-foundation-decision-log.md | main | progress/status | 2026-10-08 | 2026-10-08 21:15 | active — provisional decisions recorded | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-10-08-account-foundation-evidence-ledger.md | main | progress/status | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-10-08-account-foundation-gap-backlog.md | main | plan | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-10-08-account-foundation-implementation-plan.md | main | plan | 2026-10-08 | 2026-10-08 21:15 | active — sequencing plan | 1 | 2 | 1/0/0 |
| docs/current_progress/2026-10-08-account-foundation-journey-matrix.md | main | plan | 2026-10-08 | 2026-10-08 21:15 | active | 1 | 9 | 1/2/0 |
| docs/current_progress/2026-10-08-account-lifecycle-contract.md | main | progress/status | 2026-10-08 | 2026-10-08 21:15 | proposed — acceptance checkpoint | 1 | 1 | 0/0/0 |
| docs/current_progress/2026-10-08-auth-seam-characterization.md | main | progress/status | 2026-10-08 | 2026-10-08 21:15 | active — Phase A1 characterization | 1 | 0 | 0/0/0 |
| docs/current_progress/2026-10-08-onboarding-compatibility-client-feature-spec.md | main | plan | 2026-10-08 | 2026-10-08 21:15 | proposed — additive integration | 1 | 0 | 0/0/0 |
| docs/current_progress/SLICE_PATTERN.md | main | progress/status | 2026-09-26 | 2026-10-06 14:04 | active | 1 | 13 | 1/0/0 |
| docs/current_progress/foundation-hardening-ledger.md | main | progress/status | 2026-09-21 | 2026-09-21 22:49 | active | 1 | 19 | 0/2/0 |
| docs/current_progress/old_docs/gurudevi-registry-agent-execution-guide.md | main | progress/status | 2026-08-11 | 2026-08-10 22:45 | superseded | 3 | 17 | 0/0/0 |
| docs/current_progress/old_docs/gurudevi-sanctuary-agent-execution-guide.md | main | progress/status | 2026-08-11 | 2026-08-10 22:45 | superseded | 3 | 15 | 0/0/0 |
| docs/decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 2 | 0/0/0 |
| docs/decisions/2026-06-26-route-onboarding-through-api.md | main | architecture/dev | 2026-06-26 | 2026-06-26 22:57 | active | 1 | 0 | 0/0/0 |
| docs/decisions/2026-07-28-gurudevi-authz-decision-record.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/decisions/2026-08-09-doppler-secrets-management-adoption.md | main | architecture/dev | 2026-08-09 | 2026-08-10 22:43 | active | 1 | 28 | 0/3/0 |
| docs/decisions/2026-08-12-grade-school-grade-marks-domain.md | main | architecture/dev | 2026-08-12 | 2026-08-13 07:33 | draft | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-13-expo-orchestrator-agent-toolchain-adr.md | main | architecture/dev | 2026-08-13 | 2026-08-13 15:20 | active | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-24-license-tradeoffs.md | main | architecture/dev | 2026-08-24 | 2026-08-24 15:01 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-24-openness-and-reuse-strategy.md | main | architecture/dev | 2026-08-24 | 2026-08-24 15:25 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-25-transparent-hosted-oss.md | main | architecture/dev | 2026-08-25 | 2026-08-29 20:21 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-27-gpl-reference-project-clean-room-strategy.md | main | architecture/dev | 2026-08-27 | 2026-08-29 20:21 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-28-public-hosting-and-domain-topology.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-31-editorial-platform-topology.md | main | architecture/dev | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| docs/decisions/2026-08-31-rewarded-ad-center-policy-and-compliance.md | main | architecture/dev | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-01-account-lifecycle-foundation.md | main | architecture/dev | 2026-09-01 | 2026-09-04 07:58 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-01-public-flow-completion-boundary.md | main | architecture/dev | 2026-09-01 | 2026-09-04 07:58 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-01-universal-ui-route-shell-contract.md | main | architecture/dev | 2026-09-01 | 2026-09-04 07:58 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-01-web-runtime-capability-boundaries.md | main | architecture/dev | 2026-09-01 | 2026-09-04 07:58 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-10-entry-route-authority.md | main | architecture/dev | 2026-10-04 | 2026-10-06 14:04 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-10-guest-local-first-lease.md | main | architecture/dev | 2026-10-04 | 2026-10-06 14:04 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-12-gurudevi-web-canonical-platform.md | main | architecture/dev | 2026-09-12 20:24 | 2026-09-20 16:20 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-14-gurudevi-browser-unified-canvas-foundation.md | main | architecture/dev | 2026-09-14 | 2026-09-15 00:36 | superseded | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md | main | architecture/dev | 2026-09-14 | 2026-09-15 00:36 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-14-gurudevi-sanctuary-spatial-language-and-domain-transitions.md | main | architecture/dev | 2026-09-15 00:36 | 2026-09-15 00:36 | accepted | 1 | 1 | 0/0/0 |
| docs/decisions/2026-09-14-gurudevi-web-sanctuary-functional-migration-and-navigation.md | main | architecture/dev | 2026-09-15 00:36 | 2026-09-20 00:01 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-14-sanctuary-explore-access-and-persistence.md | main | architecture/dev | 2026-10-04 | 2026-10-06 14:04 | accepted | 1 | 2 | 0/0/0 |
| docs/decisions/2026-09-15-community-domain-functional-authority.md | main | architecture/dev | 2026-09-15 | 2026-09-20 00:01 | accepted | 1 | 17 | 5/0/0 |
| docs/decisions/2026-09-15-gurudevi-account-destinations-functional-authority.md | main | architecture/dev | 2026-09-15 | 2026-09-20 00:01 | accepted | 1 | 17 | 4/0/0 |
| docs/decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md | main | architecture/dev | 2026-09-17 | 2026-09-20 00:01 | active | 1 | 28 | 1/1/0 |
| docs/decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md | main | plan | 2026-09-20 00:01 | 2026-09-20 00:01 | accepted | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-15-gurudevi-migration-execution-discipline.md | main | architecture/dev | 2026-09-20 00:01 | 2026-09-20 00:01 | accepted | 1 | 2 | 0/0/0 |
| docs/decisions/2026-09-23-rngh-reanimated-v3-migration-audit.md | main | progress/status | 2026-10-06 14:04 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| docs/decisions/2026-09-28-production-hardening-intent.md | main | architecture/dev | 2026-09-28 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| docs/decisions/2026-10-06-quiet-cultivation-and-private-sanctuary-decision.md | main | architecture/dev | 2026-10-06 | 2026-10-06 21:15 | active | 1 | 0 | 0/0/0 |
| docs/docs-sop.md | main | architecture/dev | 2026-08-09 | 2026-08-10 22:45 | active | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/01-possibility-and-bedrock.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/02-solution-architecture.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/03-senior-engineering.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/04-user-experience.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/05-business-analysis.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/06-cybersecurity.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/07-finance-and-sustainability.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/08-database-and-consistency.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/09-hostile-critical-review.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/10-product-ownership.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/11-integration-scenarios-and-milestones.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/12-technical-frontier-and-edge.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/13-material-reality-and-access.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/14-frontier-reality-integration.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/2026-10-11-sanctuary-many-doors/README.md | main | research | 2026-10-11 | 2026-10-15 15:42 | draft | 1 | 0 | 0/0/0 |
| docs/dossiers/the-grade-5-scholarship-machine.md | main | research | 2026-10-10 | 2026-10-15 15:42 | published | 1 | 0 | 0/0/0 |
| docs/edlove/Core/01-philosophy.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| docs/edlove/Core/02-design.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| docs/edlove/Core/editorial-and-media-guidelines.md | main | architecture/dev | 2026-09-01 | 2026-10-15 15:42 | active | 2 | 0 | 0/0/0 |
| docs/edlove/Core/editorial-sanctuary-layout.md | main | architecture/dev | 2026-09-01 | 2026-10-15 15:42 | active | 2 | 0 | 0/0/0 |
| docs/edlove/Core/edlove-master-design-document-v2.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 67 | 3/3/0 |
| docs/edlove/Core/quantitative-ui-ux-quality-gate.md | main | architecture/dev | 2026-09-01 | 2026-10-15 15:42 | active | 2 | 0 | 0/0/0 |
| docs/edlove/Core/readme-strategic-docs.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| docs/edlove/INDEX.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 2 | 7 | 0/0/0 |
| docs/edlove/architecture/03-tech.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 14 | 1/1/0 |
| docs/edlove/architecture/11-subdomain-notes.md | main | architecture/dev | 2026-10-11 | 2026-10-15 15:42 | active | 1 | 0 | 0/0/0 |
| docs/edlove/architecture/2026-09-01-modern-astro-and-island-architecture-innovations.md | main | architecture/dev | 2026-09-01 | 2026-10-15 15:42 | active | 2 | 5 | 0/0/0 |
| docs/edlove/architecture/project-proposal-full.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 19 | 2/1/0 |
| docs/edlove/current_progress/2026-02-03-10-roadmap.md | main | plan | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 96 | 5/10/0 |
| docs/edlove/current_progress/2026-02-05-strategic-roadmap-2026-2028.md | main | plan | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 259 | 29/17/0 |
| docs/edlove/current_progress/2026-04-18-18-web-platform-status.md | main | progress/status | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| docs/edlove/current_progress/2026-04-18-19-ai-native-web-roadmap.md | main | plan | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 10 | 0/0/0 |
| docs/edlove/decisions/2026-08-08-gurudevi-edlove-content-ownership-and-publishing.md | main | architecture/dev | 2026-08-08 | 2026-10-15 15:42 | active | 2 | 0 | 0/0/0 |
| docs/edlove/docs-sop.md | main | architecture/dev | 2026-09-01 | 2026-10-15 15:42 | active | 2 | 0 | 0/0/0 |
| docs/edlove/domain-1/04_Domain_I.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 5 | 0/0/0 |
| docs/edlove/domain-2/05_Domain_II.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 2 | 0/0/0 |
| docs/edlove/domain-2/education_system_intro.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| docs/edlove/domain-2/shadow_education_analysis.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| docs/edlove/domain-2/sri_lanka_government_education_(schooling)_analysis.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 0 | 0/0/0 |
| docs/edlove/domain-3/06_Domain_III.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 4 | 0/0/0 |
| docs/edlove/domain-4/07_Domain_IV.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 5 | 1/1/0 |
| docs/edlove/domain-5/08_Domain_V.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 1 | 0/0/0 |
| docs/edlove/domain-6/09_Domain_VI.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 18 | 0/2/0 |
| docs/edlove/domain-6/education-paradigms-genealogy.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 3 | 1 | 0/1/0 |
| docs/edlove/domain-6/teaning_paper_complete.md | main | architecture/dev | 2026-07-28 | 2026-10-15 15:42 | active | 5 | 10 | 1/4/0 |
| docs/edlove/ed-tech-and-world/12_STRATEGY_THE_PASSAGE.md | main | research | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 0 | 0/0/0 |
| docs/edlove/ed-tech-and-world/13_GLOBAL_INNOVATION_GALLERY.md | main | research | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 0 | 0/0/0 |
| docs/edlove/ed-tech-and-world/14_SRI_LANKA_FRIENDLY_TOOLS.md | main | research | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 0 | 0/0/0 |
| docs/edlove/ed-tech-and-world/15_THE_TEACHER_LIFECYCLE.md | main | research | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 0 | 0/0/0 |
| docs/edlove/ed-tech-and-world/16_PATTERN_LANGUAGE.md | main | research | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 0 | 0/0/0 |
| docs/edlove/ed-tech-and-world/17_THE_STUDENTS_JOURNEY.md | main | research | 2026-07-28 | 2026-10-15 15:42 | active | 4 | 0 | 0/0/0 |
| docs/edlove/ed-tech-and-world/INDEX.md | main | research | 2026-09-02 | 2026-10-15 15:42 | active | 2 | 0 | 0/0/0 |
| docs/edlove/ed-tech-and-world/ROADMAP.md | main | research | 2026-09-03 | 2026-10-15 15:42 | active | 2 | 0 | 0/0/0 |
| docs/engineering/2026-08-14-gurudevi-android-build-delivery.md | main | architecture/dev | 2026-08-14 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/engineering/2026-08-25-ease-migration-results.md | main | architecture/dev | 2026-08-25 | 2026-08-29 20:21 | active | 1 | 0 | 0/0/0 |
| docs/engineering/2026-08-25-journey-hardening-results.md | main | architecture/dev | 2026-08-25 | 2026-08-29 20:21 | active | 1 | 0 | 0/0/0 |
| docs/engineering/2026-08-25-production-hardening-results.md | main | architecture/dev | 2026-08-25 | 2026-08-29 20:21 | active | 1 | 5 | 0/0/1 |
| docs/engineering/2026-08-25-quality-regulation-sprint-retro.md | main | plan | 2026-08-25 | 2026-08-29 20:21 | active | 1 | 0 | 0/0/0 |
| docs/engineering/2026-ai-slop-healing-audit.md | main | progress/status | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 14 | 0/0/0 |
| docs/engineering/2026-production-hardening-audit.md | main | progress/status | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 21 | 1/0/0 |
| docs/engineering/ai-slop-healing-sop.md | main | architecture/dev | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 0 | 0/0/0 |
| docs/engineering/delight-system-audit.md | main | progress/status | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 9 | 0/0/0 |
| docs/engineering/delight-system-sop.md | main | architecture/dev | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 1 | 0/0/0 |
| docs/engineering/human-ai-collaboration-charter.md | main | architecture/dev | 2026-09-20 | 2026-09-21 22:49 | active | 1 | 0 | 0/0/0 |
| docs/engineering/production-hardening-runbook.md | main | architecture/dev | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 8 | 0/0/0 |
| docs/engineering/project-atlas-and-shared-vocabulary.md | main | architecture/dev | 2026-09-20 | 2026-09-20 19:49 | active | 1 | 6 | 0/0/0 |
| docs/engineering/release-journey-hardening.md | main | architecture/dev | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 0 | 0/0/0 |
| docs/engineering/rn-e2e-testing.md | main | architecture/dev | 2026-08-24 | 2026-08-24 18:46 | active | 2 | 2 | 0/0/0 |
| docs/engineering/rn-js-react-profiling.md | main | architecture/dev | 2026-08-24 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/engineering/rn-perf-surface-map.md | main | architecture/dev | 2026-08-24 | 2026-08-24 18:46 | active | 2 | 1 | 0/0/0 |
| docs/engineering/root-configuration-map.md | main | architecture/dev | 2026-08-24 | 2026-08-24 19:50 | active | 1 | 0 | 0/0/0 |
| docs/engineering/slop-register.md | main | architecture/dev | 2026-08-24 | 2026-08-24 23:07 | active | 1 | 0 | 0/0/0 |
| docs/engineering/typescript-policy.md | main | architecture/dev | 2026-10-06 14:04 | 2026-10-06 14:04 |  | 1 | 5 | 0/0/0 |
| docs/engineering/ui-thread-discipline.md | main | architecture/dev | 2026-08-24 | 2026-08-24 18:46 | active | 2 | 7 | 0/0/0 |
| docs/expo-57-rust-inline-module-sop.md | branch-only | architecture/dev | 2026-07-28 10:58 | 2026-07-28 10:58 |  | 2 | 0 | 0/0/0 |
| docs/files new/README.md | deleted b23af01f | architecture/dev | 2026-08-10 | 2026-08-13 07:37 | reference | 1 | 0 | 0/0/0 |
| docs/files/README.md | main | architecture/dev | 2026-08-11 | 2026-08-13 07:44 | reference | 1 | 0 | 0/0/0 |
| docs/files/fundamental/00-biomimicry-principles.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| docs/files/fundamental/01-data-architecture.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| docs/files/fundamental/02-ui-visual-design.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| docs/files/fundamental/03-ux-interaction-design.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| docs/files/fundamental/04-network-transport.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 3 | 3 | 0/0/0 |
| docs/files/fundamental/05-storage-indexing.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| docs/files/fundamental/06-query-patterns.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 3 | 0 | 0/0/0 |
| docs/files/fundamental/12-architectural-governance-supabase-bypass.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/fundamental/13-ai-inference-architecture.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/fundamental/15-visual-design-philosophy.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/fundamental/16-agent-ready-spacing-typography-ia.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 5 | 3/1/0 |
| docs/files/fundamental/17-leverage-pattern-theory.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/fundamental/18-leverage-applied-to-ui.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 1 | 0/0/0 |
| docs/files/fundamental/26-temporal-architecture-ui-seam.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/fundamental/27-screen-reading-method.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/fundamental/SKILL.md | main | architecture/dev | 2026-08-13 07:44 | 2026-08-13 07:44 |  | 3 | 1 | 0/0/0 |
| docs/files/specialized/07-library-media.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/08-code-grounding-run1-data.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/09-wellbeing-self-domain-audit.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 3 | 0/0/0 |
| docs/files/specialized/10-classroom-academic-domain-audit.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 1 | 1/0/0 |
| docs/files/specialized/11-community-domain-audit.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 1 | 1/0/0 |
| docs/files/specialized/14-profile-domain-exploration.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 1 | 0/1/0 |
| docs/files/specialized/19-notifications-settings.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/20-self-tab-ui-operationalization.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/21-workspace-tab-ui-operationalization.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/22-workspace-canvas-redesign.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/24-profile-tab-full-arc.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/25-library-tab-full-arc.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/28-derived-history-view-implementation.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files/specialized/30-global-header-audit.md | main | plan | 2026-08-13 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/files2/07-library-media.md | branch-only | architecture/dev | 2026-07-28 10:58 | 2026-07-28 10:58 |  | 1 | 0 | 0/0/0 |
| docs/gurudevi-sanctuary-your-guide.md | branch-only | architecture/dev | 2026-06-22 21:58 | 2026-07-14 17:55 |  | 1 | 0 | 0/0/0 |
| docs/gurudevi-ui-development-guide.md | deleted 5a2c092f | architecture/dev | 2026-06-09 15:31 | 2026-06-13 12:07 |  | 1 | 0 | 0/0/0 |
| docs/infra/2026-07-24-physical-device-deployment-log.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| docs/infra/2026-08-15-android-build-log.md | main | architecture/dev | 2026-08-15 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/infra/2026-08-28-provider-inventory.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/infra/2026-09-05-wsl-android-build-architecture-sop.md | main | architecture/dev | 2026-09-05 | 2026-09-05 17:45 | active | 1 | 0 | 0/0/0 |
| docs/infra/2026-09-14-chatgpt-codex-desktop-recovery-sop.md | main | architecture/dev | 2026-09-14 | 2026-09-20 00:01 | active | 1 | 0 | 0/0/0 |
| docs/infra/2026-09-17-supabase-governance-audit.md | main | progress/status | 2026-09-20 21:08 | 2026-09-20 21:08 |  | 1 | 0 | 0/0/0 |
| docs/infra/2026-09-17-supabase-shared-database-governance-handoff.md | main | architecture/dev | 2026-09-17 | 2026-09-20 00:01 | active | 1 | 0 | 0/0/0 |
| docs/infra/2026-09-19-custom-domain-cloudflare-vercel-sop.md | main | architecture/dev | 2026-09-19 | 2026-09-20 00:01 | active | 1 | 2 | 0/0/0 |
| docs/infra/2026-09-19-gurudevi-app-custom-domain-sop.md | main | architecture/dev | 2026-09-19 | 2026-09-20 00:01 | active | 1 | 4 | 0/0/0 |
| docs/infra/2026-09-20-nub-vs-pnpm-v12-evaluation.md | main | architecture/dev | 2026-09-20 | 2026-09-20 16:20 | active | 1 | 0 | 0/0/0 |
| docs/infra/2026-10-01-chatgpt-codex-windows-installation-and-sandbox-recovery-sop.md | main | architecture/dev | 2026-10-01 | 2026-10-06 14:04 | active | 1 | 0 | 0/0/0 |
| docs/infra/adb-physical-device-deployment.md | main | architecture/dev | 2026-07-31 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/infra/android-local-and-cloud-build-guide.md | main | architecture/dev | 2026-09-05 | 2026-09-20 00:01 | active | 1 | 7 | 0/0/0 |
| docs/infra/code-checkers.md | main | architecture/dev | 2026-06-12 | 2026-06-13 12:07 | active | 1 | 0 | 0/0/0 |
| docs/infra/code-quality-workflow.md | main | architecture/dev | 2026-06-20 | 2026-08-13 07:33 | active | 1 | 22 | 1/1/3 |
| docs/infra/command-execution-reporter.md | main | progress/status | 2026-06-21 | 2026-06-22 21:58 | active | 1 | 0 | 0/0/0 |
| docs/infra/critical-infra-vs-use-cases.md | main | architecture/dev | 2026-08-12 | 2026-08-13 07:33 | active | 1 | 15 | 2/0/0 |
| docs/infra/developer-environment-and-distribution-plan.md | main | plan | 2026-10-02 | 2026-10-06 14:04 | in-progress | 1 | 27 | 0/0/0 |
| docs/infra/developer-workflow-guide.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 6 | 0/0/0 |
| docs/infra/doppler-day-to-day-usage-guide.md | main | architecture/dev | 2026-08-09 | 2026-08-13 07:33 | active | 1 | 0 | 0/0/0 |
| docs/infra/doppler-environment-bootstrap.md | main | architecture/dev | 2026-08-12 | 2026-08-13 07:33 | active | 1 | 0 | 0/0/0 |
| docs/infra/doppler-secrets-management-guide.md | main | architecture/dev | 2026-08-09 | 2026-08-13 07:33 | active | 1 | 13 | 0/1/0 |
| docs/infra/doppler-toolchain.md | main | architecture/dev | 2026-08-12 | 2026-08-13 07:33 | active | 1 | 0 | 0/0/0 |
| docs/infra/eas-build-diagnostic-report.md | main | progress/status | 2026-08-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/infra/eas-local-build-resolution-logs.md | main | architecture/dev | 2026-08-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/infra/eas-local-docker-build-guide.md | main | architecture/dev | 2026-08-20 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/infra/editorial-operations-guide.md | main | architecture/dev | 2026-08-31 | 2026-09-01 01:53 | active | 1 | 0 | 0/0/0 |
| docs/infra/git-branching-model.md | main | architecture/dev | 2026-06-09 | 2026-06-13 12:07 | active | 2 | 0 | 0/0/0 |
| docs/infra/git-workflow-guidelines.md | main | architecture/dev | 2026-06-09 | 2026-06-13 12:07 | active | 2 | 0 | 0/0/0 |
| docs/infra/github-student-pack-toolchain.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/infra/markdown-platform-routing.md | main | architecture/dev | 2026-08-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/infra/platform-mcp-guidelines.md | main | architecture/dev | 2026-06-09 | 2026-06-13 12:07 | active | 2 | 0 | 0/0/0 |
| docs/infra/production-readiness-program.md | main | architecture/dev | 2026-08-12 | 2026-08-13 07:33 | active | 1 | 79 | 7/3/0 |
| docs/infra/react-doctor-guide.md | main | architecture/dev | 2026-06-20 | 2026-06-22 21:58 | active | 1 | 5 | 0/0/0 |
| docs/infra/release-environments-runbook.md | main | architecture/dev | 2026-08-12 | 2026-08-13 07:33 | active | 1 | 0 | 0/0/0 |
| docs/infra/rust-git-guidelines.md | deleted 40190328 | architecture/dev | 2026-07-28 | 2026-08-24 15:01 | active | 1 | 0 | 0/0/0 |
| docs/infra/testing-and-performance-toolchain.md | main | architecture/dev | 2026-08-12 | 2026-08-24 14:17 | active | 1 | 0 | 0/0/0 |
| docs/infra/version-management.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| docs/mobile-storage-optimization.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 4 | 0/0/0 |
| docs/postgres-storage-optimization.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/production-hardening-guide.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/react-native-ecosystem-packages.md | main | architecture/dev | 2026-08-30 02:40 | 2026-09-20 00:01 |  | 1 | 36 | 1/0/0 |
| docs/splash-animations/README.md | main | architecture/dev | 2026-08-22 | 2026-08-24 18:46 | active | 1 | 4 | 0/0/0 |
| docs/stack-map/README.md | main | research | 2026-08-24 | 2026-08-24 18:37 | active | 1 | 0 | 0/0/0 |
| docs/stack-map/landscape/catalog/edlove-web.md | main | research | 2026-08-24 18:37 | 2026-10-15 15:42 |  | 1 | 0 | 0/0/0 |
| docs/stack-map/landscape/catalog/gurudevi-marketingWeb.md | main | content/marketing | 2026-08-24 18:37 | 2026-09-12 20:24 |  | 1 | 0 | 0/0/0 |
| docs/stack-map/landscape/catalog/gurudevi-mobile.md | main | research | 2026-08-24 18:37 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| docs/stack-map/landscape/catalog/gurudevi-web.md | main | research | 2026-09-12 20:24 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| docs/stack-map/landscape/catalog/rn-terrain.md | main | research | 2026-08-24 18:37 | 2026-08-24 18:37 |  | 2 | 0 | 0/0/0 |
| docs/stack-map/landscape/catalog/sanctuary-api.md | main | research | 2026-08-24 18:37 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| docs/stack-map/landscape/dependency-catalog.md | main | research | 2026-08-24 18:37 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| docs/stack-map/landscape/stack-map.md | main | research | 2026-08-24 18:37 | 2026-10-06 14:04 |  | 1 | 0 | 0/0/0 |
| docs/stack-map/radar/README.md | main | research | 2026-08-24 | 2026-08-24 18:37 | active | 1 | 0 | 0/0/0 |
| docs/translation/gurudevi-terminology.md | main | architecture/dev | 2026-10-09 | 2026-10-15 15:42 | active | 1 | 0 | 0/0/0 |
| expo_doctor_final_clean.md | deleted cd136234 | other | 2026-03-20 22:35 | 2026-03-25 15:48 |  | 2 | 0 | 0/0/0 |
| lint_output.txt | deleted e6297ee2 | other | 2026-06-13 12:07 | 2026-06-22 21:58 |  | 1 | 1 | 0/1/0 |
| llms.txt | main | other | 2026-10-15 19:19 | 2026-10-15 19:19 |  | 1 | 0 | 0/0/0 |
| packages/accounting/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/admin/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/admin/reports/audit-admin-architecture.md | main | progress/status | 2026-04-27 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/ai/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 18:46 | active | 1 | 0 | 0/0/0 |
| packages/analytics/README.md | main | architecture/dev | 2026-07-28 | 2026-10-15 17:33 | active | 1 | 0 | 0/0/0 |
| packages/analytics/docs/INDEX.md | main | architecture/dev | 2026-07-28 | 2026-07-28 12:18 | active | 1 | 1 | 0/0/0 |
| packages/analytics/docs/architecture/package-inventory.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/classroom/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/classroom/doc/ui-inventory.md | main | other | 2026-04-22 | 2026-08-24 18:46 | active | 1 | 81 | 6/37/1 |
| packages/classroom/src/components/README.md | main | architecture/dev | 2026-02-19 | 2026-08-24 18:46 | active | 2 | 6 | 4/0/0 |
| packages/community/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 2 | 1/0/0 |
| packages/core/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/core/docs/Core/hono-patterns.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/Core/sovereign-development-patterns.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/Core/tanstack-query-guide.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/INDEX.md | main | architecture/dev | 2026-07-28 | 2026-07-28 12:18 | active | 1 | 15 | 0/0/0 |
| packages/core/docs/architecture/2026-06-12-hexagonal-ports-adapters-rollout.md | main | architecture/dev | 2026-06-12 | 2026-07-26 13:47 | superseded | 1 | 0 | 0/0/0 |
| packages/core/docs/architecture/architecture-governance.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/architecture/browser-authorized-entry-port.md | main | architecture/dev | 2026-09-12 22:13 | 2026-09-12 22:13 |  | 1 | 0 | 0/0/0 |
| packages/core/docs/architecture/data-odyssey.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/architecture/hono-sovereignty.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 7 | 0/0/0 |
| packages/core/docs/architecture/sovereign-api-strategy.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/architecture/sovereign-infrastructure.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 4 | 0/0/0 |
| packages/core/docs/architecture/sovereign-push-notifications.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/architecture/tasks.md | main | plan | 2026-05-16 | 2026-08-24 18:46 | active | 1 | 16 | 2/0/2 |
| packages/core/docs/current_progress/2026-05-07-identity-audit.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/current_progress/2026-05-08-hexagonal-roadmap.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/core/docs/current_progress/2026-05-16-api-migration-roadmap.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 1 | 0/0/0 |
| packages/core/docs/current_progress/2026-05-16-api-purge-implementation-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 8 | 2/0/3 |
| packages/core/docs/current_progress/2026-05-16-api-purge-tasks.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 19 | 3/0/6 |
| packages/core/docs/current_progress/2026-05-16-identity-contract-and-migration-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 1 | 1/0/0 |
| packages/core/docs/current_progress/domain-api-healing-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 11 | 0/0/1 |
| packages/core/src/api/README.md | main | architecture/dev | 2026-03-30 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/database/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 18:46 | active | 1 | 0 | 0/0/0 |
| packages/editorial/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 18:46 | active | 1 | 0 | 0/0/0 |
| packages/eslint-config/README.md | main | architecture/dev | 2025-11-03 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| packages/form-builder-engine/PUBLISH_CHECKLIST.md | deleted 76035c45 | other | 2026-05-22 | 2026-10-02 14:05 | active | 1 | 0 | 0/0/0 |
| packages/form-builder-engine/README.md | deleted 76035c45 | architecture/dev | 2026-05-22 | 2026-10-02 14:05 | active | 1 | 0 | 0/0/0 |
| packages/form-builder-engine/docs/Core/form-engine-architecture.md | deleted 76035c45 | architecture/dev | 2026-06-12 | 2026-10-02 14:05 | active | 1 | 0 | 0/0/0 |
| packages/form-builder-engine/docs/INDEX.md | deleted 76035c45 | architecture/dev | 2026-06-12 | 2026-10-02 14:05 | active | 1 | 0 | 0/0/0 |
| packages/form-builder-engine/docs/decisions/2026-06-12-transition-to-tanstack-form.md | deleted 76035c45 | architecture/dev | 2026-06-12 | 2026-10-02 14:05 | active | 1 | 0 | 0/0/0 |
| packages/form-builder-engine/docs/decisions/2026-06-20-codegen-addition-and-dependency-isolation.md | deleted 76035c45 | architecture/dev | 2026-06-20 | 2026-10-02 14:05 | active | 1 | 0 | 0/0/0 |
| packages/form-builder/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 2 | 1/1/0 |
| packages/form-builder/docs/Core/vision.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 5 | 1/0/0 |
| packages/form-builder/docs/INDEX.md | main | architecture/dev | 2026-07-28 | 2026-07-28 12:18 | active | 1 | 3 | 0/0/0 |
| packages/form-builder/docs/architecture/form-builder-architecture.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/form-builder/docs/current_progress/2026-05-16-current-state.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 2 | 1/0/0 |
| packages/form-builder/docs/current_progress/2026-05-16-form-builder-operationalization.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 10 | 1/1/0 |
| packages/graphics/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/graphics/docs/INDEX.md | main | architecture/dev | 2026-07-28 | 2026-07-28 12:18 | active | 1 | 1 | 0/0/0 |
| packages/graphics/docs/architecture/graphics-package-inventory.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 4 | 0/0/0 |
| packages/library/ARCHITECTURE.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 33 | 6/4/3 |
| packages/library/CONTENT_LICENSE.md | main | other | 2026-03-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| packages/library/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 1 | 0/1/0 |
| packages/lk-edu-geo/README.md | deleted 76035c45 | architecture/dev | 2026-03-25 | 2026-10-02 14:05 | active | 1 | 0 | 0/0/0 |
| packages/payments/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/people/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/platform-mcp/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 18:46 | active | 1 | 0 | 0/0/0 |
| packages/platform-mcp/docs/Core/mcp-philosophy.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/platform-mcp/docs/Core/project-soul.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/platform-mcp/docs/Core/senior-refusal-protocol.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/platform-mcp/docs/Core/shiny-tools.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/platform-mcp/docs/INDEX.md | main | architecture/dev | 2026-07-28 | 2026-07-28 12:18 | active | 1 | 7 | 0/0/0 |
| packages/platform-mcp/docs/architecture/agentic-architecture-2026.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/platform-mcp/docs/architecture/mcp-v2-specification.md | main | plan | 2026-08-03 |  | active | 1 | 5 | 0/0/0 |
| packages/platform-mcp/docs/architecture/runbyte-integration.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/platform-mcp/docs/current_progress/2026-04-29-tooling-2026.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 6 | 0/0/0 |
| packages/platform-mcp/docs/current_progress/2026-05-01-god-mode-plan.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 12 | 0/0/1 |
| packages/platform-mcp/docs/current_progress/mcp-v2-migration-plan.md | main | plan | 2026-08-03 |  | active | 1 | 10 | 0/1/0 |
| packages/platform-mcp/docs/current_progress/mistake-ledger.md | main | progress/status | 2026-07-28 | 2026-10-08 21:15 | active | 2 | 0 | 0/0/0 |
| packages/platform-mcp/docs/infra/2026-06-11-expo-and-stdio-mcp-troubleshooting.md | main | architecture/dev | 2026-06-11 | 2026-06-11 12:09 | active | 1 | 1 | 0/0/0 |
| packages/platform-mcp/docs/infra/mcp-implementation-walkthrough.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 2 | 0/0/0 |
| packages/platform-mcp/docs/mcp_power_index.md | deleted dd0f0511 | architecture/dev | 2026-04-18 09:48 | 2026-04-25 00:02 |  | 1 | 20 | 0/1/0 |
| packages/policies/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 18:46 | active | 1 | 0 | 0/0/0 |
| packages/profile/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 1 | 0/1/0 |
| packages/scanner-kit/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/scanner-kit/docs/INDEX.md | main | architecture/dev | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 0 | 0/0/0 |
| packages/scanner-kit/docs/decisions/2026-06-10-camera-and-ocr-architecture.md | main | architecture/dev | 2026-06-10 | 2026-06-10 13:21 | active | 1 | 0 | 0/0/0 |
| packages/schema/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 18:46 | active | 1 | 0 | 0/0/0 |
| packages/self/ARCHITECTURE.md | main | architecture/dev | 2026-03-30 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| packages/self/BASE_SELF_FEATURE_RECOVERY.md | main | other | 2026-04-08 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| packages/self/BASE_SELF_TEMPORAL_ARCHITECTURE.md | main | architecture/dev | 2026-04-08 | 2026-08-24 18:46 | active | 1 | 2 | 0/0/0 |
| packages/self/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/trube-art/IMPLEMENTATION-REALIGNMENT.md | deleted 3cfcb499 | other | 2026-03-25 15:47 | 2026-08-24 13:19 |  | 1 | 0 | 0/0/0 |
| packages/trube-art/README.md | deleted 3cfcb499 | architecture/dev | 2026-03-25 15:47 | 2026-08-24 13:19 |  | 1 | 0 | 0/0/0 |
| packages/trube-art/artifacts/approval-snapshots.md | deleted 3cfcb499 | other | 2026-03-25 15:47 | 2026-08-24 13:19 |  | 1 | 0 | 0/0/0 |
| packages/trube-art/trube-art-revival-scope.md | deleted 3cfcb499 | other | 2026-07-28 10:58 | 2026-08-24 13:19 |  | 1 | 3 | 0/0/0 |
| packages/ui/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| packages/ui/assets/mascot/README.md | main | architecture/dev | 2026-09-01 01:53 | 2026-09-01 01:53 |  | 1 | 0 | 0/0/0 |
| packages/ui/docs/Core/state-management-guide.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/ui/docs/Core/state-quality-ux-standards.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/ui/docs/INDEX.md | main | architecture/dev | 2026-07-28 | 2026-09-08 00:57 | active | 1 | 11 | 0/0/0 |
| packages/ui/docs/architecture/a11y-governance.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 3 | 0/0/0 |
| packages/ui/docs/architecture/media-consumption-architecture.md | main | architecture/dev | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/ui/docs/architecture/semantic-tokens.md | main | architecture/dev | 2026-08-29 20:21 | 2026-09-12 20:24 |  | 1 | 0 | 0/0/0 |
| packages/ui/docs/architecture/source-owned-nativewind-ui-roadmap.md | main | plan | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 6 | 0/1/0 |
| packages/ui/docs/architecture/source-owned-nativewind-ui.md | main | architecture/dev | 2026-08-29 20:21 | 2026-08-29 20:21 |  | 1 | 0 | 0/0/0 |
| packages/ui/docs/architecture/ui-inventory.md | main | architecture/dev | 2026-07-28 | 2026-09-01 01:53 | active | 2 | 215 | 1/0/0 |
| packages/ui/docs/architecture/ui-test-evidence-inventory.md | main | architecture/dev | 2026-09-07 | 2026-09-12 20:24 | active | 1 | 5 | 0/0/0 |
| packages/ui/docs/current_progress/2026-04-23-a11y-remediations-draft.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 4 | 0/0/0 |
| packages/ui/docs/current_progress/state-hardening-registry.md | main | progress/status | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 0 | 0/0/0 |
| packages/ui/docs/current_progress/tasks.md | main | plan | 2026-07-28 | 2026-08-24 18:46 | active | 2 | 22 | 0/0/2 |
| packages/workforce/README.md | main | architecture/dev | 2026-10-15 | 2026-10-15 19:19 | active | 1 | 0 | 0/0/0 |
| reports/2026-03-21T08-15-52/README.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 2 | 0/1/0 |
| reports/2026-03-21T08-15-52/agent-briefs.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/2026-03-21T08-15-52/agent-prompts.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/2026-03-21T08-15-52/contributors.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/2026-03-21T08-15-52/executive-summary.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/2026-03-21T08-15-52/gurudevi-web-threat-model-and-quality.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/2026-03-21T08-15-52/run-summary.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/2026-03-21T08-15-52/triage.md | deleted b6bd32cd | progress/status | 2026-03-25 15:46 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-admin-architecture.md | deleted b6bd32cd | progress/status | 2026-04-27 06:53 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-admin-summary.md | deleted b6bd32cd | progress/status | 2026-04-27 06:53 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-classroom-architecture.md | deleted b6bd32cd | progress/status | 2026-04-27 08:44 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-classroom-summary.md | deleted b6bd32cd | progress/status | 2026-04-27 06:53 | 2026-05-06 09:30 |  | 1 | 31 | 0/0/0 |
| reports/audit-community-architecture.md | deleted b6bd32cd | progress/status | 2026-04-27 07:57 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-community-summary.md | deleted b6bd32cd | progress/status | 2026-04-27 07:57 | 2026-05-06 09:30 |  | 1 | 20 | 0/0/0 |
| reports/audit-core-architecture.md | deleted b6bd32cd | progress/status | 2026-04-27 08:44 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-core-summary.md | deleted b6bd32cd | progress/status | 2026-04-27 06:53 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-free-tier-tooling-2026.md | deleted b6bd32cd | progress/status | 2026-04-30 00:30 | 2026-05-06 09:30 |  | 1 | 18 | 0/1/0 |
| reports/audit-gurudevi-mobile-architecture.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-library-architecture.md | deleted b6bd32cd | progress/status | 2026-04-29 08:59 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-library-summary.md | deleted b6bd32cd | progress/status | 2026-04-29 08:59 | 2026-05-06 09:30 |  | 1 | 3 | 0/0/0 |
| reports/audit-platform-mcp-architecture.md | deleted b6bd32cd | progress/status | 2026-04-27 08:44 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-platform-mcp-summary.md | deleted b6bd32cd | progress/status | 2026-04-29 14:29 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-polymath-platform-architecture.md | deleted b6bd32cd | progress/status | 2026-04-27 07:57 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-summary.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/audit-ui-architecture.md | deleted b6bd32cd | progress/status | 2026-04-27 08:44 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/callstack_audit.md | main | progress/status | 2026-06-13 | 2026-08-24 18:46 | active | 1 | 7 | 0/1/0 |
| reports/check-code.md | main | progress/status | 2026-06-09 | 2026-08-24 18:46 | active | 1 | 1 | 0/0/0 |
| reports/check-types.md | deleted b6bd32cd | progress/status | 2026-04-27 06:53 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/dependency_upgrade_audit_report.md | main | progress/status | 2026-06-10 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| reports/deprecation-manifest-2026.md | deleted b6bd32cd | progress/status | 2026-04-30 00:30 | 2026-05-06 09:30 |  | 1 | 22 | 0/2/0 |
| reports/final_audit.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 3 | 0 | 0/0/0 |
| reports/final_healing_pass.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 2 | 0 | 0/0/0 |
| reports/final_healing_pass_3.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/final_healing_pass_4.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 3 | 0 | 0/0/0 |
| reports/grade-domain-consumer-inventory.md | main | progress/status | 2026-08-13 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| reports/poa-foundation-progress-2026-03-27.md | deleted 150d6894 | progress/status | 2026-03-30 05:57 | 2026-04-24 21:35 |  | 1 | 2 | 1/0/0 |
| reports/poa-hardening-audit-2026-03-27.md | deleted 150d6894 | progress/status | 2026-03-30 05:57 | 2026-04-24 21:35 |  | 1 | 17 | 3/0/0 |
| reports/push_audit.md | main | progress/status | 2026-05-01 08:13 | 2026-09-09 12:46 |  | 1 | 0 | 0/0/0 |
| reports/softwaremansion_audit.md | main | progress/status | 2026-06-13 | 2026-08-24 18:46 | active | 1 | 8 | 0/0/0 |
| reports/subpath_audit.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/subpath_audit_post.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/subpath_audit_v2.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/test-wrapper.md | deleted b6bd32cd | progress/status | 2026-04-27 06:53 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/ultimate_healing.md | deleted b6bd32cd | progress/status | 2026-05-01 08:13 | 2026-05-06 09:30 |  | 1 | 0 | 0/0/0 |
| reports/version-drift-report.md | main | progress/status | 2026-10-08 21:15 | 2026-10-08 21:15 |  | 1 | 6 | 0/0/0 |
| scripts/refactor/HEALING_AGENT_OPERATIONS.md | main | other | 2026-04-18 | 2026-08-24 18:46 | active | 1 | 0 | 0/0/0 |
| tasks.md | deleted 37f1f5a5 | plan | 2026-05-06 09:30 | 2026-08-24 14:17 |  | 1 | 35 | 0/0/0 |
| tooling/oxlint-custom-rules/README.md | main | architecture/dev | 2026-10-06 14:04 | 2026-10-15 17:33 |  | 1 | 0 | 0/0/0 |
| typecheck_output.txt | deleted e6297ee2 | other | 2026-06-13 12:07 | 2026-06-22 21:58 |  | 1 | 0 | 0/0/0 |

## v4 verification (evidence-first; supersedes v3 PLANNED verdicts)

Each of the 1067 v3 PLANNED intents was re-checked by code search: identifiers, routes, i18n keys and joined phrases, on main (3165 files), on the 19 branches, and in deleted history. Hits are mapped to capabilities by file. Text similarity is not used. Every record is in v4/verification.json as {method, terms, hits, verdict, confidence}.

| v3 PLANNED → | count |
|---|---|
| PLANNED | 681 |
| MERGED:LIVE | 165 |
| NON-CAPABILITY | 123 |
| PARTIAL | 24 |
| UI-UNWIRED | 23 |
| MERGED:UI-UNWIRED | 22 |
| BACKEND-ONLY | 15 |
| MERGED:PARTIAL | 14 |
| LOST | 3 |

Doc CONTRADICTED refs re-checked against the hostile statuses: {'CONFIRMED': 82, 'RESOLVED': 4}. The 134 PLANNED items that came from CONTRADICTED intents are included in the table above.

### Examples
- **MERGED->task:community:teacher:10** (high): `layoutSizingVertical/Horizontal = 'FILL'` is set AFTER `parent.appendChild(child)` (evidence: FILL, Horizontal, appendChild)
- **MERGED->offline-sync:sync.uploadBatch** (medium): **Teacher Classroom Flow**: Fast, one-tap morning attendance, quick student notes, assignment tracking, and ti (evidence: timetable, schedule, teacherclassroom)
- **MERGED->task:self:teacher:10** (medium): `physical` → `outlook` — Energy Forecast, Wind Down, Sleep Tracker | 10, 20, 30 (evidence: winddown, energyforecast, sleeptracker)
- **MERGED->task:self:teacher:6** (medium): `working` → `work` — Daily Rhythm, Tomorrow Prep, Reminders, Decisions, Teaching History | 10, 20, 30, 40, 50 (evidence: tomorrowprep, teachinghistory, dailyrhythm)
- **PARTIAL** (high): Create `useLibraryWorkspaceSurfaces` hook — Medium | Map sections → surfaces with `defaultZone` (evidence: defaultZone, useLibraryWorkspaceSurfaces)
- **PARTIAL** (high): Enable remote sync + GrowthBook flags (evidence: GrowthBook, enableremotesync)
- **PARTIAL** (high): Create ThemeProvider wrapper (evidence: ThemeProvider)
- **PARTIAL** (medium): Connect mascot animated states to user wellbeing actions (e.g. lotus/firefly mascot breathing during meditatio (evidence: quietmode, fireflymascot)
- **UI-UNWIRED** (high): `PRN-SLF-019` — School Launch Flow | **UI**: `SchoolCreationScreen.tsx` (evidence: SchoolCreationScreen)
- **UI-UNWIRED** (high): `PRN-CLS-039` — Setup Flow | **UI**: `SchoolCreationScreen.tsx` (evidence: SchoolCreationScreen)
- **UI-UNWIRED** (high): `TCH-SLF-017` — Breathing Sync | **UI**: `Pacer.tsx` (evidence: Pacer)
- **UI-UNWIRED** (high): `STU-SLF-002` — Daily Intentions | **UI**: Goal tracker in `StudentSelfView` (evidence: StudentSelfView)
- **LOST** (medium): Create `useRoleFeatures` hook mapping features to roles (evidence: identifier exists only on another branch or in deleted history)
- **LOST** (medium): Add NIC number (staff identity verification) — ✅ `onlyForRoles: ['teacher', 'principal', ...]` | — (evidence: nicnumber)
- **LOST** (medium): `TCH-COM-057` — Direct Messaging | **UI**: `ChatScreen` (evidence: identifier exists only on another branch or in deleted history)
- **NON-CAPABILITY** (medium): Combined roles: `teacher+guardian` user sees union of features, `isGeneral` true for cross-role, `roleAffinity (evidence: roleAffinity, isGeneral)
- **NON-CAPABILITY** (low): Create indexes for performance (evidence: engineering/implementation item (component/infra/test/docs), not a user capability)
- **NON-CAPABILITY** (low): Create permission helper functions (evidence: engineering/implementation item (component/infra/test/docs), not a user capability)
- **NON-CAPABILITY** (medium): Create LotusPetalFAB component (evidence: engineering component item, not a user capability)
- **PLANNED** (low): **Shared Element Transition** on New Architecture (feature flag) (evidence: no hit for 7 terms on main, branches or history)
- **PLANNED** (low): Shared value transitions (evidence: sharedvalue)
- **PLANNED** (medium): Create `useSelfWorkspaceSurfaces` hooks per role — Medium | Map domains → zones, features → surfaces (evidence: no hit for 12 terms on main, branches or history)
- **PLANNED** (medium): Create `useSelfWorkspaceSurfaces` hooks (6 roles) (evidence: no hit for 2 terms on main, branches or history)
