# Gurudevi mobile: demo readiness (v5: static read of terrain/version-hops @ 50fb1b9e, 2026-10-17)
Static only: nothing was built or run on a device. One exception: the migrations were replayed into a throwaway local Postgres 17 on the box, using Supabase stubs (`v5/replay.sh`, `v5/boot.sql`). EAS, Doppler, the live DB and devices were not checked.

## Correction to the v4 verdict
v4 said **"Attendance: mostly working, atlas LIVE."** That was wrong, on main and on this branch.
The atlas counted `api.attendance.batchRecord(...)` in `AttendanceScreen.tsx` as a typed oRPC call. It is actually a call on the legacy facade, and the facade has no such method. The v5 trace now checks facade methods exist (`analysis/trace.py` facade_missing, `analysis/graph.py`). It finds **11 such dead calls**, 5 of them in attendance.

## 1. Attendance: what the code actually does
- **Mobile screen** (`packages/classroom/src/screens/AttendanceScreen.tsx`, routes `/attendance` and `/workspace/classroom/[id]/attendance`):
  - `:46` calls `api.attendance.getClassroomAttendanceSnapshot` and `:148` calls `api.attendance.batchRecord`.
  - Neither method exists on `attendanceAPI` (`packages/core/src/api/attendance.ts:43`). `api.attendance` is a Proxy (`orchestration/operations.ts:30`, `temporalProxy.ts`) that returns `undefined` for unknown names, so both calls throw a TypeError online.
  - The screen then falls back to local SQLite: reads from `attendance` (`:53`), writes with `INSERT OR REPLACE INTO attendance` (`:161`), and shows "Saved offline — will sync when online". **Nothing ever reaches sanctuary-api.**
  - The offline replay is dead too: `core/src/lib/sync/registry.ts:163` calls `api.attendance.record`, which also doesn't exist.
- **Id model:**
  - The screen sends `classroom_id`, which is a `public.classrooms.id` (`routeResolution.ts:126`).
  - The server writes `daily_attendance`, which has `grade_class_id → grade_classes` and `student_id NOT NULL → users` (`20260813010000:203-216`). No migration maps classrooms to grade_classes.
  - Shadow students (`classroom_students.student_id` NULL, `master_baseline.sql:142`) can't be stored.
  - The legacy `attendance` table exists only in `migrations/archive/`.
- **Web Workspace** (`apps/gurudevi-web/lib/workspace/attendance.ts:468`) uses typed `orpcClient.attendance.batchRecord`, which is served. But it sends a legacy `classrooms.id` as `gradeClassId` (`:396`, `:470`). The server's `loadDaily` gets NOT_FOUND, and `batchRecord` returns CONFLICT "Attendance batch was not applied" (`handlers/attendance.ts:51-56`, `:124-133`). Shadow students are skipped (`:464`).
- **PowerSync:** `powersync/sync-config.yaml` is unchanged. It has no attendance/daily_attendance stream and no classrooms stream. `isPowerSyncEnabled: false` (`featureFlags.ts:30`).
- **New on the branch:** badge QR scan (`handleScanBadge :209`, ScannerModal) and an offline banner (`:268`). Both are UI only and use the same broken save path.
- **Schema:** zmodel `DailyAttendance` (`schema.zmodel:1790`) has no `@@allow`/`@@deny`. `academic_cycles` carries both `start_date/end_date` and `starts_at/ends_at` (`20260813010000:34-39`), but the zmodel only has `starts_at/ends_at`.
- **Atlas status:** `attendance:mobile-daily-mark` PARTIAL (dead calls), `attendance:web-workspace-mark` PARTIAL (id mismatch), `attendance:offline-sync` PARTIAL, `attendance.batchRecord` LIVE→PARTIAL.

## 2. What the branch improved
- **Transport:** all 92 Hono REST call sites that had no server mount since e383ef01 are gone (0 remain). The trace now shows 233 sites, all served oRPC.
  - Onboarding, guest onboarding and the founder-school bond are now served. School creation is no longer broken.
  - Community posts/messages/comments went PARTIAL→LIVE.
- **Teacher classroom list:** real (`api.classrooms.getByTeacher`). But principals hit the dead `api.identity.getClassroomCapacitySummary` and `api.classrooms.getBySchool` (`ClassroomList.tsx:30,35`).
- **Toolchain (confirmed in package.json and pnpm-lock):**
  - react-native 0.88.0 (stable)
  - expo ~58.0.13, expo-updates ~58.0.17
  - react-native-skia 3.6.1, with `@shopify/react-native-skia` aliased to it
  - ZenStack 3.9.7 everywhere
  - EAS image `ubuntu-26.04-jdk-17-ndk-r27b-sdk-58`
- **Inngest:** the mobile `inngest.ts` client is deleted. Events now go through `orpcClient.events.dispatch` (`inngestEvents.ts:22`), and the server sends them (`handlers/events.ts:18`). But `EXPO_PUBLIC_INNGEST_EVENT_KEY` is still in `.env.example:36` and `config/doppler-secrets.json:26`. Rotate the key (old builds shipped it) and delete both mentions.

## 3. Blockers still open
- **No buildable database:**
  - Replaying from empty, 50 of 188 migrations fail on this branch (59 of 178 on main). Two are syntax errors (`AS current_user` in `20260303000000_auth_final_fix.sql:75` and `20260303000002_founder_dashboard.sql:63`). The rest are mostly tables that exist only on the live DB.
  - Two of the new migrations also fail in the replay, because columns are missing in the chain: `20261015150000_server_owned_auth_identity` (users.deleted_at) and `20261015130000_account_scoped_submission_idempotency`.
  - No `seed.sql` in the repo (the draft is at `edlove-plan/environments/seed/seed.sql`).
- **OTA:** `expo-updates` is installed, but `app.json`/`app.config.js` have no `updates.url`.
- **`handle_school_membership_sync`** writes `teacher_profiles`/`principal_profiles`. It's defined only in `supabase/backups/remote_schema_backup.sql`, not in any migration.
- **Doppler-only scripts:** 15 `doppler run` scripts. EAS env still needs filling. `eas.json` still has submit placeholders.

## 4. Verdict
**Not demo-ready for "Attendance offline".** Today the screen renders and marks students, but every save stays on the device in a table nothing syncs. The toolchain risk is lower than in v4, so the work is now mostly wiring and data, roughly 2–3 days of "step 0" before the offline story.
The recommended route is A (new academic model): attendance from a grade class, writing to `daily_attendance`. Naveen needs to confirm A, B or C.

## 5. Revised punch list (Expo App Awards close 31 Oct 2026; aim to submit by 29 Oct)
| Day | Task | Size |
| --- | --- | --- |
| D0 (17–18 Oct) | Naveen picks A/B/C. Default: A | — |
| D1 | Add `attendanceAPI.batchRecord` and `getClassroomAttendanceSnapshot` (map to `orpcClient.attendance.batchRecord`/`getByClassroom`); fix `registry.ts:163` (`record` → `upsertAttendanceRecord`); type `api` so the 11 dead facade calls fail typecheck | S–M |
| D2 | Route attendance from a grade class, with the roster from `student_grade_class_enrollments`, on mobile and web; decide on shadow students | M |
| D3 | Freeze a prod baseline migration (`supabase db dump`), archive the old files, add the seed (grade class 5A plus enrolments, demo teacher) | M |
| D4–5 | PowerSync: `daily_attendance` + `grade_classes` streams; point the local fallback at `daily_attendance`; enable `isPowerSyncEnabled` for preview | L |
| D6 | Replace the empty catches and the fake "Saved offline" with real error/pending states (the offline banner exists) | S |
| D7 | EAS preview APK on RN 0.88.0 / Expo 58.0.13; `eas update:configure`; rotate the Inngest key and remove the public var mentions | M |
| D8 | Test badge QR scan on a device | S |
| D9 | Maestro airplane-mode e2e (mark offline → reconnect → row in `daily_attendance`) | M |
| D10–11 | Device polish and crash fixes | M |
| D12 | Record the 90-second video | S |
| D13 | Buffer, then submit | — |
