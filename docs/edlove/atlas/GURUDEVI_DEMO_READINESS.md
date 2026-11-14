# Gurudevi mobile: demo readiness (static read, main @ 175c036e, 2026-10-16)
Static only: nothing was built or run. I could not check EAS, Doppler, the live DB or the device.

## 1. Teacher flows
- **Mostly working:** Attendance. `app/attendance.tsx` loads `@repo/classroom/attendance`, which calls `api.classroomStudents.getAll`, `api.attendance.getClassroomAttendanceSnapshot` and `batchRecord` with an idempotency key. The atlas lists it as LIVE.
- **Other atlas-LIVE teacher capabilities** (typed oRPC): announcements, staff leave, DMs, decision journal. Each needs a runtime check.
- **Partial or broken:** Classroom list falls back to `MOCK_CLASSROOMS` (`packages/classroom/src/components/ClassroomList.tsx`; mocks in `packages/core/src/api/mockData.ts` and `demoProvider.ts`). Self mood/journal and the community feed call REST routes deleted in e383ef01. The gradebook uses demo-class IDs.

## 2. Closest to offline-demo-ready
1. **Attendance** (`packages/classroom/src/screens/AttendanceScreen.tsx`):
   - Lines 38-70: reads fall back to PowerSync Drizzle (`attendance`, `classroom_students`).
   - Lines 148-165: writes fall back to `INSERT OR REPLACE` locally and return `queuedOffline`.
   - **Problem:** `isPowerSyncEnabled: false` (`packages/core/src/store/types/featureFlags.ts:30`). With the flag off, `PowerSyncProvider.tsx:43` deactivates the runtime, so offline currently fails. The fallbacks also swallow errors (`catch {}`).
   - **Missing:** turn the flag on for preview, make sure the sync rules cover these two tables, prime the cache while online, sync after reconnect, and show an offline/pending UI.
2. **Mood check-in:** has an MMKV offline queue, but it drains to a deleted route. It needs re-pointing to oRPC.
3. **Classroom list:** pick a classroom from local PowerSync instead of the mock, so the attendance demo starts from real data.

## 3. Blockers
- **Toolchain:** expo ~58.0.3 with RN 0.88.0-rc.3 (a release candidate). The `eas.json` preview profile builds an APK on a custom image `ubuntu-26.04-jdk-17-ndk-r27b-sdk-57`. Whether that image exists and the native deps (op-sqlite, PowerSync, mmkv 4.3.2) build is unverified. There's a `postinstall` asset copy step.
- **Doppler-only scripts:** every `build:*`, `android` and `start` script runs `doppler run --no-fallback`. Only `dev:no-doppler` skips it. EAS needs the same values set as EAS env/secrets.
- **Public env:** the Inngest key ships in the app's public settings. Rotate it.
- **Auth:** an OAuth callback screen exists (`app/auth/callback.tsx`) but needs a runtime check. Make a demo teacher account.
- **Data:** demo-school fallbacks and 31 tables missing from the schema.

## 4. Two-week punch list
| Day | Task | Size |
| --- | --- | --- |
| D1 | Fill EAS env, run a preview APK build, pin RN stable if the rc fails | M |
| D2 | Rotate keys; seed a demo school/teacher/class | S |
| D3-4 | Turn PowerSync on; sync rules for attendance and classroom_students; check the offline read | L |
| D5 | Upload queue/reconnect sync for attendance; replace the empty catches with error states | M |
| D6 | Classroom list from oRPC/PowerSync, mock only in demo mode | M |
| D7 | Offline banner and pending-sync badge | S |
| D8-9 | Re-point the mood queue to oRPC (optional second flow) | M |
| D10 | Maestro airplane-mode e2e | M |
| D11-12 | Polish and fix crashes on a real device | M |
| D13 | Record the 90-second video | S |
| D14 | Buffer, then submit around Oct 24 | — |
