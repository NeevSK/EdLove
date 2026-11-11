---
title: "Retired Core API Handlers: Ledger"
status: "active"
created: 2026-11-11
updated: 2026-11-11
author: "Naveen"
scribe: "Claude"
tags: [api, retirement, ledger, v1, hono]
---

# Retired Core API Handlers: Ledger

On 11 Nov 2026 the owner approved removing `packages/core/src/api/handlers/` (12 files),
`api/server.ts` and `api/serverAdapter.ts`. This ledger keeps what they did, so each
capability can be rebuilt in its v1 module rather than forgotten.

## Why they went

They belonged to the API generation before the
[30 Oct reset](../../apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md#reset-status-and-historical-findings).
Nothing imported them: no app used `@repo/core/api/server`, and the API serves only
`/api/v1`. They broke the v1 rules in every file:

- They were Hono route handlers, not oRPC capabilities in the
  [contract](../../packages/core/src/api/v1/contract.ts).
- They took the database from the request context (`c.get('db')`). In v1, handlers get no
  database; the authority execution boundary does.
- Request bodies were read unvalidated. Hono 5 types `c.req.json()` as `unknown`, which
  surfaced 44 such reads. Only 4 of the 12 files parsed anything.
- Authorization was whatever ZenStack's access rules allowed. There was no Cedar decision,
  bond or capacity check, durable command, receipt or audit record.

A copy of the removed source stays in git history (`git show d76f3edb0:packages/core/src/api/handlers/<file>`).

## What each did, and where it goes

"Keep" marks behaviour worth carrying into the rebuilt capability. "Don't keep" marks
behaviour that conflicts with the upstream or the platform map.

| Old handler | Endpoints | v1 module | Notes |
| --- | --- | --- | --- |
| `self.ts` | logMood, getTodayMood, getMoodHistory | `wellbeing.mood` | Keep: a person logs only for themselves. **Don't keep:** "owner or an admin can see history". Wellbeing is private by default, and no institution sees it |
| `self.ts` | burnJournal, getJournalHistory | `wellbeing.journal` | Keep: burning is an atomic, one-way release. Journals stay on the device by default (tool ownership doc, Self row) |
| `self.ts` | getPreferences, updatePreferences | Device preferences (Zustand slice), not an API | Partial update semantics |
| `identity.ts` | resolveIdentity | `identity.session` / `identity.entry` (already in v1) | Replaced |
| `identity.ts`, `profile.ts` | getProfile, getUserProfile, updateProfile | `journey.profile` | Keep: only the person edits their profile. "Every signed-in user reads basic info" needs a visibility decision first |
| `identity.ts` | getClassroomCapacitySummary | `learning.classrooms` (query) | Derived view, never a stored fact |
| `profile.ts` | getJourneySnapshot | `journey.record` with `rewards.ledger` | Aggregates growth and moments. No points or streaks (decided 11 Nov) |
| `profile.ts` | getSchoolPulse | `ops.institutions` (aggregate query) | Aggregates are views, never primary facts |
| `onboarding.ts` | createInitialBond, completeOnboarding | `identity.createInitialBond` (already in v1) | Replaced; principals arrive only by invite |
| `educational.ts` | getByTeacher, getById | `learning.classrooms` | Keep: a teacher's classrooms come from teaching relations, not a role ([relations card](domains/learning/relations.md)) |
| `educational.ts` | createLesson, getClassroomResources | `learning.lessons`, with `library.resources` read through its published query | |
| `grading.ts` | getReportCard, getClassroomGrades, submitGrade, publishGrade, getGradingSettings | `learning.grading`, `learning.assessments` | Already a stub that failed on purpose. Grades are corrected, never edited |
| `operations.ts` | getAttendance, recordAttendance, batchRecordAttendance | `ops.attendance` | Keep: authorization is checked per record in a batch. A batch is one durable command with a receipt |
| `operations.ts` | getSchoolAttendancePulse, getAttendanceReport | `ops.attendance` (queries) | Views |
| `admin.ts` | getStaffPresence, submitLeave, getPendingLeaves, approveLeave | `ops.staff` | Approving leave is a command with an audit record |
| `admin.ts` | getSchool | `ops.institutions` | |
| `admin.ts` | getUpcomingCalendarEvents, createCalendarEvent | `calendar` platform service (layer 8), with `ops.events` | |
| `admin.ts` | getTeacherCarousel | A place (Workspace) composing published queries | Not a capability of its own |
| `community.ts` | getGroups, getGroup, createGroup, joinGroup | `community.groups` | Visibility and membership filtering move into Cedar plus scoped SQL |
| `community.ts` | getPosts, createPost, toggleReaction | `community.posts` | Moderation is part of the domain because minors are present. Push delivery goes to the `notify` service, not the handler |
| `library.ts` | getResources, getResource, getCollections, getCollection, engage | `library.resources`, `library.collections` | Engagement is an event, not a write into the resource |
| `library.ts` | searchLibrary | `search` platform service | Was a placeholder; needs Sinhala and Tamil search (tool ownership doc, 6.1) |
| `dailyContent.ts` | getToday, getForDate, getRecent | `library.commons` (published query) | |
| `sync.ts` | uploadPowerSyncBatch, `applyPowerSyncBatch` | `operations` layer: the sync upload path in [local-first writes and sync](../../apps/sanctuary-api/docs/architecture/api-foundations/local-first-writes-and-sync.md) | Keep: a batch is atomic, an unsupported table aborts the whole batch, and a malformed batch is rejected. Its tests were removed with it. Gate 1 of [road to v1](road-to-v1.md) already lists sync upload as a dependency to rebuild |

## Also removed

- `api/server.ts`: the barrel that re-exported the handlers.
- `api/serverAdapter.ts`: `adaptToHono`, used only by that barrel.
- Tests of the removed code: `handlers/__tests__/sync-handler.test.ts`,
  `api/__tests__/sync.test.ts`, `api/__tests__/legacy-grading-handler.test.ts`, and the
  "applyPowerSyncBatch poison pill" block in `effect/__tests__/resilience.test.ts`.
  - What they proved for sync upload: an atomic batch; an unsupported table aborts it; a
    malformed batch is rejected; a completed batch replays without applying again; a key
    can't be reused for another payload; keys are per account; concurrent retries settle
    once.
  - The v1 operations layer already proves the last four against a real database
    (`apps/sanctuary-api/src/operations/store.integration.ts`). The rebuilt upload path
    must add the first three.

`api/pushDispatcher.ts` lost its only caller (`community.ts`). It stays until `notify`
(layer 10) decides whether it's reused.
