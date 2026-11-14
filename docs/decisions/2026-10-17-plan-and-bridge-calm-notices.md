---
title: "ADR: Plan-and-bridge v0 — calm school notices, quiet hours as the first mode"
status: proposed
date: 2026-10-17
owners: [Naveen]
tags: [plan-and-bridge, calm-communication, modes, notices, guardians, rls, inngest]
---

# ADR: Plan-and-bridge v0 — calm school notices, quiet hours as the first mode

## 1. Context

Teachers plan school events (sports day, PTA, exams) and families hear about
them late, loudly, or at 22:40. Plan-and-bridge is the feature group that ties
the **plan** (a calendar event for a grade class) to the **bridge** (a notice
to the verified guardians of the students in that class), sent at a calm hour.

Before this slice:

- `Announcement` existed in SQL and a handler, but not in `schema.zmodel`; the
  handler trusted the caller's `school_id`.
- `calendar_events` had no class scope and no notice lead time.
- Guardian links (`student_guardian_relationships`, `guardian_bonds`) could be
  self-asserted and were then used to read child data. A parent could claim a
  child. That is a privacy bug, not a feature gap.
- There was no school timezone, no quiet hours, no scheduled delivery.

## 2. Principle: configurable over closed decisions; real usage decides defaults

We do not yet know what schools want. So this slice avoids hard-coded answers:

- **Every policy is a row per school**, not a constant: send window, lock level,
  who may override, override rate limit, timezone.
- **Defaults are provisional placeholders**, kept in one file
  (`packages/core/src/logic/modes/provisionalDefaults.ts`, every value marked
  `PROVISIONAL`) and surfaced in the API as `provisional: true` so the UI says
  "default, not yet chosen by your school". The migration seeds **no** rows.
- **Usage, not opinion, should move the defaults.** A small opt-in aggregate
  signal (§6) exists so that, later, we can see whether schools keep, loosen,
  or override the defaults, without collecting content.

## 3. Decision

### 3.1 Modes engine v0 (quiet hours is mode #1)

`school_mode_policies` — one row per `(school_id, mode_key)`:

| column | meaning |
| --- | --- |
| `mode_key` | `good_night` now; `rest_day`, `school_day`, `office_hours`, `teaching`, `exam` reserved |
| `capacities` | which roles the mode applies to (empty = everyone) |
| `lock` | `locked` (school rule, needs logged override) · `suggested` (nudge, "send as planned" allowed) · `off` (ignored) |
| `schedule` | `{ weekly: [{ days, start, end }], date_overrides }`, school-local clock |
| `trigger` | reserved for future triggers (manual, calendar-driven) |
| `effects` | jsonb, e.g. `{ hold_notices, inbox_always, defer_push }` |
| `override_roles` | capacities allowed to use the emergency lane |
| `override_rate_limit_per_day` | nullable; overrides per school per day |
| `version` | bumped on every change |

`schools.timezone` (default `Asia/Colombo`) anchors all clocks.

**One resolver** decides send time: `resolveSendTime()` in
`packages/core/src/logic/modes/resolveSendTime.ts`. Server and client both call
it; the server's answer is authoritative. Outcomes: `as_requested`,
`next_allowed` (snap to window end, e.g. "send at 6:30 AM?"), or `override`
(reason ≥ 10 chars, allowed role, under the rate limit; logged). Precedence,
for when more modes exist: **school policy > personal mode > logged emergency
override**.

Effects in v0: inbox always receives (notification row written on release);
push may wait (deferred push delivery is PB8d, not in this slice).

### 3.2 Notices are announcements

`announcements` gains `audience_scope` (`school` | `grade_class`),
`grade_class_id`, `calendar_event_id`, `status`
(draft/scheduled/sent/failed/cancelled), `send_at`, `held_by_mode`,
`override_reason/by/at`, `schedule_version`, `recipient_count`. Every state
change is appended to `school_notice_events` (server-only).

Recipients: **verified** guardians of **actively enrolled** students of the
grade class (Model A: `grade_classes` + enrolment). Never `classrooms`, never
shadow students. This slice does not depend on PR #144.

### 3.3 Delivery: Inngest first, SQL sweep as the floor

- On schedule, the API emits `school/notice.scheduled` (id
  `notice-{id}-v{version}`); `noticeRelease` does `step.sleepUntil(send_at)`
  then calls `release_school_notice(id, expected_version)`.
- Reschedule bumps `schedule_version`; a stale run returns `superseded`.
  `cancelOn` is an optimisation, not the guarantee.
- `release_school_notice` is idempotent (`notifications.idempotency_key` unique
  per notice × recipient); a second call returns `already_sent`.
- Fallback: `release_due_school_notices()` sweep, run by an Inngest cron
  (every 5 min) and by `pg_cron` (every minute) where the extension exists.
  Notices further than 6 days away are left to the sweep.

### 3.4 Guardian privacy fixes

- `verification_status` (`pending` | `verified` | `revoked`) on guardian links;
  self-service inserts are `pending` only; no self-UPDATE.
- Only principal / assistant principal / admin of the student's school may
  verify (`verifyGuardianLink`), never themselves.
- `guardianAssessment` and notice recipients require `verified`.
- Guardian notifications/settings tables are owner-only.

### 3.5 Authorization

Leaders (principal, AP, section/grade head, admin) plan for any grade class in
their school; teachers only for grade classes they are assigned to. Another
school's ids get the same `NOT_FOUND` as missing ones. Cedar: parents are
denied Calendar/Announcement create. Quiet-hours editors: principal, AP, admin.

## 4. Usage signal (stub)

`schools.usage_signal_opt_in` (default `false`). When on, the server bumps
`school_mode_usage_daily(school, day, mode_key, event, capacity, count)` for
`held`, `sent_in_window`, `override`, `policy_changed`. No content, no user ids.
`read_school_mode_usage(school, from, k)` returns `NULL` for any count below
`max(k, 5)`. Both functions are `service_role` only.

TODO: no read API or dashboard yet; no opt-in toggle in the UI yet (set by SQL).

## 5. Consequences

- Existing guardian links become `pending` until a leader verifies them.
  Parents may stop seeing child data until then. This is deliberate but needs a
  rollout note and probably a backfill decision per school.
- Notice delivery needs Inngest keys in each environment; without them the
  sweep still delivers (up to ~1–5 min late).
- The live database may diverge from the migration replay; the migration is
  forward-only and `IF NOT EXISTS` throughout.

## 6. Deferred

Telegram / WhatsApp bridges, notice templates, print view, compliance view,
PowerSync streams for notices, deferred push (PB8d), personal modes, web
screens, usage read API, native si/ta translations.

## 7. Credits (ideas only, no code)

Novu and Knock (schedule + digest shapes), Zulip (calm-by-default delivery).
