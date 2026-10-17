# v5 claim check: ATTENDANCE_DEMO_WIRING.md + environments/GAPS.md vs terrain/version-hops @ 50fb1b9e
Method: git fetch, then `git checkout --detach origin/terrain/version-hops` in the local clone (nothing pushed). Checks are grep plus import trace. The migrations were replayed locally (v5/replay.sh, stub v5/boot.sql; results in /tmp/pgv5-*/results.txt).

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | Head is 50fb1b9e, 9 ahead of main 175c036e, commits 09:24–11:39 Colombo | **CONFIRMED** | rev-list 9 ahead / 0 behind; d2123913 2026-10-17 09:24:05 +0530 … 50fb1b9e 11:39:53 +0530 |
| 2 | Screen calls `api.attendance.batchRecord` + `getClassroomAttendanceSnapshot`; `core/api/attendance.ts` lacks both; the server has batchRecord | **CONFIRMED** | AttendanceScreen.tsx:46,148; attendance.ts:43 has 4 methods; handlers/attendance.ts:124. Proxy returns undefined (temporalProxy.ts). assertContractCoverage only checks keys that exist. Extra: registry.ts:163 `api.attendance.record` is also dead. |
| 3 | Screen sends a legacy classrooms id; daily_attendance needs a grade_classes id | **CONFIRMED** | routeResolution.ts:126; 20260813010000:207 FK grade_classes; no mapping migration. The web workspace has the same bug (lib/workspace/attendance.ts:396/470 → CONFLICT). |
| 4 | Shadow students can't be saved to daily_attendance | **CONFIRMED** | classroom_students.student_id NULL "for shadow profiles" (master_baseline.sql:142) vs daily_attendance.student_id NOT NULL (:208) |
| 5 | New: badge QR scan, offline banner | **CONFIRMED** | AttendanceScreen.tsx:7,209,268,277-286 |
| 6 | sync-config.yaml syncs no attendance/classrooms | **CONFIRMED** | file unchanged vs main; streams identity + classroom_roster (classrooms only as a JOIN) |
| 7 | 50/188 migrations fail from empty; 2 syntax errors near current_user | **CONFIRMED (reproduced)** | replay on branch: 138 ok / 50 fail of 188; main: 119 / 59 of 178. Syntax errors at auth_final_fix.sql:75 and founder_dashboard.sql:63 (`AS current_user`). |
| 8 | No seed.sql (draft in edlove-plan) | **CONFIRMED** | no seed.sql tracked; draft exists at environments/seed/seed.sql (not executed by me) |
| 9 | RN 0.88.0, Expo ~58.0.13, skia 3.6.1, ZenStack 3.9.7 | **CONFIRMED** | apps/gurudevi-mobile/package.json; pnpm-lock (react-native@0.88.0, expo@58.0.13, react-native-skia@3.6.1); schema/database/root package.json all 3.9.7 |
| 10 | Inngest events via API; key no longer in public env? | **PARTLY** | Via API: confirmed (inngest.ts deleted; inngestEvents.ts:22 orpcClient.events.dispatch → handlers/events.ts:18). Not removed: `EXPO_PUBLIC_INNGEST_EVENT_KEY` is still in .env.example:36 and config/doppler-secrets.json:26 (no code reads it). |
| 11 | expo-updates has no URL | **CONFIRMED** | expo-updates ~58.0.17; no `updates` key in app.json/app.config.js |
| 12 | academic_cycles has duplicate date cols not in zmodel | **CONFIRMED** | 20260813010000:33-39 adds start_date/end_date + starts_at/ends_at; zmodel AcademicCycle has only starts_at/ends_at |
| 13 | DailyAttendance has no zmodel policy | **CONFIRMED** | schema.zmodel:1790-1812 has no @@allow/@@deny (183 @@allow elsewhere) |
| 14 | handle_school_membership_sync writes legacy profile tables | **CONFIRMED (+)** | UPDATE teacher_profiles/principal_profiles; defined only in supabase/backups/remote_schema_backup.sql:3975, in no migration |
| — | "my earlier 'Attendance mostly working'" | **REFUTED (the earlier verdict)** | It was wrong on main too. The v4 atlas mis-read the legacy-facade call as typed oRPC. Fixed in analysis/graph.py and trace.py. |

Process note: partway through, the box was restored to an earlier snapshot and the fetched ref reverted to main. Every claim above was re-checked at HEAD = 50fb1b9e afterwards. An interim reading made against main's content was discarded.
