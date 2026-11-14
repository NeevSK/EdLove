# Recovery backlog v1 (re-ranked 2026-10-16)

Effort: S = under 1 day, M = 1–3 days, L = more than 3 days. Paths are relative to the repo root. Ranking weighs user impact × number of features unblocked ÷ effort.

| # | Item | Unblocks | Effort | Files to touch |
|---|---|---|---|---|
| 1 | Fix the e383ef01 transport regression: move legacy Hono `hc` call sites to typed `orpcClient`. The stopgap is to re-add the 52 `registerRoute` REST mounts. | community-feed, self-wellbeing, classroom-core, cosmic-map, classroom-echoes, learning-reflections, warm-mirror, school-forest, form-builder, tracking-history, agent-status, school-onboarding, library reportBrokenLink | Stopgap S (revert the mount block); proper migration L (92 sites) | apps/sanctuary-api/src/core/app.ts (~L949–985; see `git show e383ef01`); packages/core/src/api/community.ts, self*.ts, classrooms.ts, echoes/mapping/schoolForest/forms/tracking/history/warmMirror/learningReflections API files; packages/core/src/lib/sync/registry.ts:94 |
| 2 | P0 secrets: rotate the Gemini key exposed in history (commit b56f62af) and the Inngest key, then purge history | security | S (rotate); M (history rewrite, needs approval) | env/config files flagged in pass 1; no secret printed here |
| 3 | Add a regression test that every client path resolves to a mounted route | prevents a repeat of #1 | S | apps/sanctuary-api/src/__tests__/ (extend self.orpc.test.ts pattern) |
| 4 | Guardian workspace: create the missing tables (guardian_identities, guardian_notifications, school_events) or repoint the repository at existing models; route `parent` capacity to the guardian workspace | guardian-workspace, notifications (server side) | M | packages/core/src/adapters/supabase/guardianRepository.ts; apps/gurudevi-mobile/supabase/migrations/ (new); packages/schema/schema.zmodel; apps/gurudevi-mobile/src/lib/workspace/routeResolution.ts |
| 5 | Notifications: populate useNotificationStore from community.getNotifications (already a served proc) | notifications | S | packages/core/src/store/useNotificationStore.ts; packages/core/src/hooks/useNotifications.ts |
| 6 | Gate ungated demo fallbacks ('demo-school', 'demo-class', MOCK_CLASSROOMS, MOCK_SCHOOL_STATS) behind isDemoMode | principal-workspace, classroom-core | S | ClassroomList (packages/classroom), useSchoolStats & principal route (packages/admin, apps/gurudevi-mobile/app) |
| 7 | Payments: replace Math.random ids and pi_demo_secret_demo with real PayHere intents | payments | M | payments client/screen files (pass-1 evidence), sanctuary-api PayHere webhook |
| 8 | Wire screens to existing uncalled procs: educational notes/assignments/materials, growth ripples | lessons-materials, classroom-notes, growth-ripples, assignments | M | packages/classroom screens; packages/core/src/api/educational*.ts |
| 9 | Admin console route + `admin` capacity dispatch | admin-console, accounting | M | apps/gurudevi-mobile/app/(new admin route); routeResolution.ts; packages/admin screens |
| 10 | Mount DailyContentCard and presence hooks on screens (both have served backends) | daily-wisdom, presence | S | packages/self/src/components/DailyContentCard.tsx (mount in self tab); packages/core/src/api/hooks/presence.hooks.ts → community tab |
| 11 | Route SchoolForest screen and add a link (after #1) | school-forest | S | apps/gurudevi-mobile/app/ (new route); founder/principal workspace link |
| 12 | Workforce: remove the fake success toast and add an API | workforce | M | packages/admin workforce screen |
| 13 | Edlove-web atlas: commit or seed the atlas_staging.db source; drop the c:/x default path | edlove-atlas-web | S | apps/edlove-web/app/api/atlas/route.ts:69–76 |
| 14 | Remove dead /trube-lab link; gate dev-labs routes in prod | app-settings, dev-labs | S | settings screen (pass-1 evidence); apps/gurudevi-mobile/app/ dev routes |
| 15 | Teacher daily attendance: add a procedure and screen for the orphan TeacherDailyAttendance model | teacher-attendance | M | packages/schema/schema.zmodel; sanctuary-api handlers; packages/admin |
| 16 | Delete dead createResonantProxy demo interceptor | hygiene | S | packages/core/src/api/ (proxy file) |
| 17 | LOST apps (teacher-platform etc.): unchanged, nothing worth recovering (pass 3) | — | — | — |
