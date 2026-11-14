# EdLove Feature Atlas v1

Generated from features.yaml (source of truth) by analysis/render_v1.py. Basis: main @ 175c036e (2026-10-15 19:19 +0530). Times are Asia/Colombo.

> Method: static import/call-chain trace over 2561 files (analysis/graph.py, trace.py, eval.py, autostatus.py) + manual adjudication (analysis/overrides.py). Not runtime-tested.
> Caveat: unpushed laptop work isn't visible. Statuses are static-analysis verdicts and need runtime confirmation.

## Counts
- BACKEND-ONLY: 7
- LIVE: 18
- LOST: 7
- PARTIAL: 30
- UI-UNWIRED: 9

## Systemic finding
Commit e383ef01 (2026-07-30 08:03, "chore: normalize workspace import aliases") removed 52 REST `registerRoute` mounts. Since then, 92 legacy Hono `hc` call sites (`(client.api as any).<x>.$get/$post`) hit paths that sanctuary-api no longer serves. Only typed oRPC procedure URLs (/api/<router>/<proc>, 139 sites) and GET-only /api/openapi/* are served (apps/sanctuary-api/src/core/app.ts ~L949–985; test __tests__/self.orpc.test.ts:296).

## Features

| id | name | roles | schema | api | client | screen | nav | data | status (v0→v1) | first seen | last touched |
|---|---|---|---|---|---|---|---|---|---|---|---|
| library-browse | Library (Holistic Digital Library) | teacher, student, principal, parent | Y | Y | P | Y | Y | Y | LIVE→**LIVE** | 6b5bc57c 2026-02-02 15:11 | 3599b9d2 2026-10-06 14:04 |
| library-curation-review | Library Review (curation) | teacher, admin | Y | Y | P | Y | Y | Y | PARTIAL→**PARTIAL** | 24c73ce1 2026-02-19 | f4a135fb 2026-09-01 01:53 |
| library-tools | Library Tools (OCR, image-to-PDF, PDF editor, spreadsheet, cloud export, document scanner) | teacher, student | NA | NA | NA | Y | Y | NA | PARTIAL→**PARTIAL** | 95acfc46 2026-02-18 | c2c223d5 2026-09-09 12:46 |
| cosmic-map | Library Map / Mapping Topology | student, teacher | Y | Y | P | Y | Y | N | PARTIAL→**PARTIAL** | 24e3e078 2026-03-02 12:23 | 87f5a15c 2026-08-29 20:21 |
| self-wellbeing | Self Sanctuary (mood, thought records, journal) | student, teacher, principal, parent | Y | Y | P | Y | Y | Y | PARTIAL→**PARTIAL** | 6b5bc57c 2026-02-02 15:11 | 3fed1735 2026-10-06 21:15 |
| decision-journal | Decision Journal / Journal Entries | student, teacher, principal | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 2e479108 2026-03-30 | 3fed1735 2026-10-06 21:15 |
| learning-reflections | Reflect (Learning Reflections) | student | Y | Y | P | Y | Y | Y | PARTIAL→**PARTIAL** | b6bd32cd 2026-05-06 | f4a135fb 2026-09-01 01:53 |
| daily-wisdom | Wisdom Seeds / Daily Content | student, teacher, parent | NA | Y | Y | Y | Y | N | PARTIAL→**PARTIAL** | 55efec6d 2026-02-06 14:10 | 3fed1735 2026-10-06 21:15 |
| warm-mirror | Warm Mirror (wellbeing enrichment) | student | NA | Y | P | Y | Y | N | PARTIAL→**PARTIAL** | 0d12d463 2026-02-28 | 3fed1735 2026-10-06 21:15 |
| privacy-ledger | Privacy Ledger | student, teacher, parent, principal | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 8d90984f 2026-03-06 | 87f5a15c 2026-08-29 20:21 |
| community-feed | Community (feed, posts, reactions, groups) | teacher, student, principal, parent | Y | Y | P | Y | Y | Y | LIVE→**PARTIAL** | 6b5bc57c 2026-02-02 15:11 | 3599b9d2 2026-10-06 14:04 |
| direct-messages | Direct Messages / Chat | teacher, student, principal, parent | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 075fd98f 2026-03-04 08:42 | f4a135fb 2026-09-01 01:53 |
| messaging-router | Messaging API | teacher, student | NA | Y | Y | P | N | N | BACKEND-ONLY→**BACKEND-ONLY** | 53607f90 2026-05-02 | 7d6d377a 2026-09-04 08:18 |
| presence | Presence (who is here) | teacher, student | NA | Y | Y | Y | Y | N | PARTIAL→**BACKEND-ONLY** | 2e479108 2026-03-30 | c2c223d5 2026-09-09 12:46 |
| sacred-missions | Sacred Missions | student, teacher | NA | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 76dd662a 2026-02-15 16:04 | c2c223d5 2026-09-09 12:46 |
| announcements | Announcements | principal, teacher, parent | NA | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 24c73ce1 2026-02-19 | c2c223d5 2026-09-09 12:46 |
| classroom-core | Classroom (overview, join requests, students) | teacher, student | Y | Y | P | Y | Y | Y | PARTIAL→**PARTIAL** | 6b5bc57c 2026-02-02 15:11 | 3fed1735 2026-10-06 21:15 |
| attendance | Attendance (student daily + sessions) | teacher, principal, parent | Y | Y | Y | Y | Y | Y | LIVE→**LIVE** | 33c08014 2026-02-15 14:50 | 294896df 2026-09-20 21:01 |
| teacher-attendance | Teacher Attendance | teacher, principal | Y | NA | NA | N | N | N | PARTIAL→**BACKEND-ONLY** | b6bd32cd 2026-05-06 | cde883dc 2026-09-20 |
| gradebook | Gradebook & Grading | teacher, student, parent | Y | Y | Y | Y | Y | P | PARTIAL→**PARTIAL** | 80979b04 2026-02-05 03:33 | 3599b9d2 2026-10-06 14:04 |
| assignments | Assignments & Submissions | teacher, student | Y | Y | N | Y | Y | Y | PARTIAL→**PARTIAL** | 9b51724c 2026-02-06 15:16 | 50d42e10 2026-09-08 00:57 |
| student-goals | Student Goals (self-tracking) | student | NA | NA | NA | Y | Y | NA | UI-UNWIRED→**UI-UNWIRED** | 004efe12 2026-03-30 | 50d42e10 2026-09-08 00:57 |
| student-potential | Student Potential (analysis) | teacher | NA | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 83faa3ee 2026-03-16 | f4a135fb 2026-09-01 01:53 |
| longitudinal-profile | Longitudinal Student Story | teacher, principal, parent | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 8d90984f 2026-03-06 | 209904b7 2026-09-07 13:38 |
| classroom-echoes | Echoes (feedback to teacher) | teacher, student, principal | NA | Y | P | Y | Y | P | PARTIAL→**PARTIAL** | 83faa3ee 2026-03-16 | 50d42e10 2026-09-08 00:57 |
| inventory | Inventory & Resource Needs | teacher, principal | Y | Y | P | Y | Y | Y | PARTIAL→**PARTIAL** | d0ba512d 2026-02-06 13:09 | 294896df 2026-09-20 21:01 |
| principal-workspace | Principal Workspace (Morning Situational Brief, Hierarchy Builder, Invite Manager, Calendar, Staff Pulse) | principal | Y | Y | Y | Y | Y | Y | PARTIAL→**PARTIAL** | eb52292b 2026-02-04 23:39 | f4a135fb 2026-09-01 01:53 |
| principal-notes | Principal Notes / Observations (Logbook) | principal | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 1c28e27c 2026-02-28 09:57 | 3fed1735 2026-10-06 21:15 |
| staff-leave | Staff Leave Approvals | principal, teacher | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 275b159e 2026-02-28 | 50d42e10 2026-09-08 00:57 |
| academic-cycles | Academic Cycles, Terms, Grade Classes | principal, admin | Y | NA | NA | Y | Y | N | PARTIAL→**PARTIAL** | 8d90984f 2026-03-06 17:42 | 50d42e10 2026-09-08 00:57 |
| school-onboarding | Onboarding, Invites & School Registry Claim | principal, teacher, student, parent | Y | Y | P | Y | Y | Y | LIVE→**PARTIAL** | f7d7dc43 2026-02-08 19:03 | 146fa2fd 2026-10-08 21:15 |
| guardian-workspace | Guardian Bridge (parent workspace) | parent | Y | Y | Y | Y | Y | N | PARTIAL→**PARTIAL** | 2e479108 2026-03-30 | eaf840a2 2026-09-12 22:13 |
| founder-dashboard | Founder Vision / Ecosystem Dashboard | founder | NA | NA | NA | Y | Y | NA | PARTIAL→**PARTIAL** | 9e9c0b06 2026-02-14 07:14 | aa6eacc2 2026-08-13 19:01 |
| school-forest | School Forest | principal, founder | Y | Y | P | P | N | N | UI-UNWIRED→**UI-UNWIRED** | 4525aa67 2026-02-28 | 0c1cd781 2026-08-14 17:25 |
| admin-console | Admin Room (audit log, authority repair, feature registry, incidents, jobs, releases, tenants) | admin | Y | Y | Y | P | N | N | PARTIAL→**UI-UNWIRED** | 3fab1de6 2026-04-18 | 50d42e10 2026-09-08 00:57 |
| editorial | Editorial (Journal publishing pipeline) | admin, teacher, founder | NA | Y | Y | Y | Y | Y | LIVE→**LIVE** | 5142dc7e 2026-06-08 | ad9c59ed 2026-09-12 20:24 |
| form-builder | Form Builder & Public Forms | principal, teacher, admin | NA | Y | P | Y | P | Y | PARTIAL→**PARTIAL** | eb8ca66c 2026-03-20 | bff7bbf1 2026-09-01 01:53 |
| thuthimal | Thuthimal (gratitude gifts) | student, teacher, parent | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 91bb2bc0 2026-02-25 22:35 | bff7bbf1 2026-09-01 01:53 |
| rewards-energy | Rewards / Energy Balance / Ad Rewards | student, teacher | Y | Y | Y | Y | Y | Y | PARTIAL→**LIVE** | 24c73ce1 2026-02-19 | c9648552 2026-09-08 00:57 |
| payments | Payments (PayHere / Stripe, invoices, receipts) | parent, principal, admin | Y | Y | Y | Y | P | N | PARTIAL→**PARTIAL** | eb8ca66c 2026-03-20 | c2c223d5 2026-09-09 12:46 |
| accounting | Accounting (ledger, budgets) | principal, admin | Y | Y | Y | P | N | N | PARTIAL→**UI-UNWIRED** | eb8ca66c 2026-03-20 | f4a135fb 2026-09-01 01:53 |
| tuition-commercial | Commercial Batches (Tuition Institutes) | teacher, admin | Y | NA | NA | Y | Y | N | PARTIAL→**PARTIAL** | b6bd32cd 2026-05-06 | c2c223d5 2026-09-09 12:46 |
| workforce | Workforce Roles | principal, admin | NA | NA | NA | Y | P | NA | UI-UNWIRED→**UI-UNWIRED** | 22bd9f10 2026-03-25 | c2c223d5 2026-09-09 12:46 |
| notifications | Notifications & Push | teacher, student, principal, parent | Y | NA | NA | Y | Y | N | PARTIAL→**UI-UNWIRED** | 48b1f372 2026-02-28 | 4a0f4286 2026-09-09 12:45 |
| profile | Profile (public/full profile, bonds, social links, mute hub) | teacher, student, principal, parent | Y | Y | Y | Y | Y | Y | PARTIAL→**PARTIAL** | 6b5bc57c 2026-02-02 15:11 | bff7bbf1 2026-09-01 01:53 |
| ai-assistant | Sanctuary AI Assistant (BYOK) | teacher, student | Y | NA | NA | Y | Y | N | PARTIAL→**PARTIAL** | 1ac79d4c 2026-02-19 22:11 | 209904b7 2026-09-07 13:38 |
| durable-agents | Durable Agents (Inngest) | admin, founder | NA | NA | NA | Y | Y | NA | PARTIAL→**PARTIAL** | cd2c1aa2 2026-04-23 11:00 | c2c223d5 2026-09-09 12:46 |
| tracking-history | Tracking & History APIs | admin | NA | Y | P | Y | P | N | BACKEND-ONLY→**BACKEND-ONLY** | 1ac79d4c 2026-02-19 | c2c223d5 2026-09-09 12:46 |
| agent-status | Agent System Status | admin | NA | Y | P | N | N | N | BACKEND-ONLY→**BACKEND-ONLY** | 209788ea 2026-08-13 | c583c61e 2026-08-24 23:07 |
| edlove-atlas-web | EdLove Atlas (public school atlas, cosmos, pedagogy, innovations) | founder, principal, parent | Y | NA | NA | Y | Y | N | PARTIAL→**PARTIAL** | b6bd32cd 2026-05-06 | 190614ac 2026-10-15 15:42 |
| gurudevi-web-sanctuary | Gurudevi Web Sanctuary (web floors) | teacher, student, principal, parent | NA | NA | NA | Y | Y | NA | PARTIAL→**PARTIAL** | ad9c59ed 2026-09-12 | 146fa2fd 2026-10-08 21:15 |
| teacher-platform | Teacher Platform (original app) | teacher | N | N | N | N | N | N | LOST→**LOST** | b56f62af 2025-12-12 | 83e3b4c9 2026-02-10 |
| teacher-planner | Planner (teacher tasks) | teacher | N | N | N | N | N | N | LOST→**LOST** | b56f62af 2025-12-12 | b4b8daa0 2026-02-02 |
| trube-lab | Trube Lab / Trube Art | admin, founder | NA | NA | N | N | P | NA | LOST→**LOST** | 92227a6f 2026-03-25 | 3cfcb499 2026-08-24 |
| rn-terrain | RN Terrain (core/cli/mcp/vscode tooling) | admin | NA | NA | NA | NA | NA | NA | LOST→**LOST** | 7d189b0e 2026-06-09 | 3cfcb499 2026-08-24 |
| neevsk-intuitui-web | NeevSK & IntuitUI websites | founder | NA | NA | NA | N | N | NA | LOST→**LOST** | b3e4b4f9 2026-02-09 | 37f1f5a5 2026-08-24 |
| gurudevi-webapp | Gurudevi WebApp (first web client) | teacher, student | N | N | N | N | N | N | LOST→**LOST** | 01737e29 2026-02-27 | 8fd7e343 2026-03-11 |
| legacy-web-api-docs | Original Turborepo web/api/docs apps | admin | N | N | N | N | N | N | LOST→**LOST** | 6c8c5381 2025-11-03 | 6f602ade 2026-02-11 |
| grade-section-head-views | Grade Head & Section Head Views | teacher, principal | NA | NA | NA | Y | P | NA | PARTIAL→**PARTIAL** | e9912414 2026-02-04 | 50d42e10 2026-09-08 00:57 |
| auth-identity | Threshold of Identity (auth & identity) | teacher, student, principal, parent, founder, admin | Y | Y | Y | Y | Y | Y | new→**LIVE** | 6b5bc57c 2026-02-02 15:11 | 3fed1735 2026-10-06 21:15 |
| offline-sync | Quiet Continuity (offline sync) | teacher, student | NA | Y | Y | N | N | N | new→**BACKEND-ONLY** | e383ef01 2026-07-30 08:03 | 2ddf8f09 2026-09-21 22:49 |
| app-settings | Personal Garden (settings) | teacher, student, principal, parent | Y | NA | NA | Y | Y | Y | new→**PARTIAL** | f8e6887b 2026-02-13 10:46 | bff7bbf1 2026-09-01 01:53 |
| lessons-materials | Lesson Seeds (lessons & materials) | teacher, student | Y | Y | P | Y | Y | N | new→**UI-UNWIRED** | 2023940b 2026-02-05 03:36 | f4a135fb 2026-09-01 01:53 |
| classroom-notes | Classroom Notes | teacher | Y | Y | P | Y | Y | N | new→**UI-UNWIRED** | 5e9c1e4f 2026-02-28 09:51 | f4a135fb 2026-09-01 01:53 |
| growth-ripples | Growth Ripples | teacher, student | Y | Y | N | Y | Y | N | new→**UI-UNWIRED** | c99de48e 2026-05-08 21:25 | 3fed1735 2026-10-06 21:15 |
| calendar-events | Calendar of Seasons (events) | principal, teacher, parent | Y | Y | Y | Y | Y | Y | new→**LIVE** | 1fad8d95 2026-03-19 23:26 | f4a135fb 2026-09-01 01:53 |
| edlove-public-site | EdLove public site | founder | NA | NA | NA | Y | Y | NA | new→**LIVE** | 190614ac 2026-10-15 15:42 | 190614ac 2026-10-15 15:42 |
| gurudevi-marketing-legal | Gurudevi marketing & legal | founder | NA | NA | NA | Y | Y | NA | new→**LIVE** | ad9c59ed 2026-09-12 20:24 | 3599b9d2 2026-10-06 14:04 |
| dev-labs | Dev labs | admin | NA | NA | NA | Y | Y | NA | new→**PARTIAL** | 9bfbe8fb 2026-07-17 13:25 | 190614ac 2026-10-15 15:42 |
| workspace-dispatch | Workspace dispatch | teacher, student, principal, parent, founder, admin | Y | NA | NA | Y | Y | N | new→**PARTIAL** | 5142dc7e 2026-06-08 19:37 | 50d42e10 2026-09-08 00:57 |
| pricing-manifest | Pricing manifest | founder, admin | Y | NA | NA | N | N | N | new→**BACKEND-ONLY** | ? | ? |

## Evidence

### library-browse — LIVE
- Hostile verdict: 19/20 procs served via typed oRPC; library.reportBrokenLink is REST-only (unserved). Seeded content.
- schema: LibraryResource @ packages/schema/schema.zmodel:1073 (table nodes); LibraryCollection @ packages/schema/schema.zmodel:1135 (table collections); CollectionNode @ packages/schema/schema.zmodel:1174 (table collection_nodes); ResourceEngagement @ packages/schema/schema.zmodel:1211 (table resource_engagements); CollectionNodeEvent @ packages/schema/schema.zmodel:1194 (table collection_node_events)
- api: library.getCounts @ apps/sanctuary-api/src/core/handlers/library.ts:246 [orpc-rpc:served]; library.getResources @ apps/sanctuary-api/src/core/handlers/library.ts:269 [orpc-rpc:served]; library.getResource @ apps/sanctuary-api/src/core/handlers/library.ts:334 [orpc-rpc:served]; library.getBookmarkedResources @ apps/sanctuary-api/src/core/handlers/library.ts:359 [orpc-rpc:served]; library.searchLibrary @ apps/sanctuary-api/src/core/handlers/library.ts:379 [orpc-rpc:served]; library.createResource @ apps/sanctuary-api/src/core/handlers/library.ts:397 [orpc-rpc:served]; library.updateResource @ apps/sanctuary-api/src/core/handlers/library.ts:424 [orpc-rpc:served]; library.deleteResource @ apps/sanctuary-api/src/core/handlers/library.ts:440 [orpc-rpc:served]; library.verifyResource @ apps/sanctuary-api/src/core/handlers/library.ts:447 [orpc-rpc:served]; library.reportBrokenLink @ apps/sanctuary-api/src/core/handlers/library.ts:459 [hono-rest:NO-SERVER-MOUNT]; library.engage @ apps/sanctuary-api/src/core/handlers/library.ts:481 [orpc-rpc:served]; library.createCollection @ apps/sanctuary-api/src/core/handlers/library.ts:572 [orpc-rpc:served]
- client: library.getCounts <- packages/core/src/api/library.ts:16; library.getResources <- apps/gurudevi-web/app/(sanctuary)/library/LibraryFloor.tsx:83; library.getResource <- packages/core/src/api/library.ts:68; library.getBookmarkedResources <- packages/core/src/api/library.ts:86; library.searchLibrary <- packages/core/src/api/library.ts:80; library.createResource <- packages/core/src/api/library.ts:110; library.updateResource <- packages/core/src/api/library.ts:126; library.deleteResource <- packages/core/src/api/library.ts:133
- screen: apps/gurudevi-mobile/app/(tabs)/library/collections/[id].tsx; apps/gurudevi-mobile/app/(tabs)/library/document/[resourceId].tsx; apps/gurudevi-mobile/app/(tabs)/library/index.tsx; apps/gurudevi-mobile/app/(tabs)/library/resource/[resourceId].tsx; apps/gurudevi-mobile/app/(tabs)/library/video/[resourceId].tsx; apps/gurudevi-web/app/(sanctuary)/library/page.tsx
- nav: /library/collections/[id] <- packages/library/src/screens/LibraryScreen.tsx:954, packages/library/src/screens/LibraryScreen.web.tsx:1140; /library/document/[resourceId] <- packages/library/src/screens/LibraryScreen.tsx:602, packages/library/src/screens/CollectionDetailScreen.web.tsx:614; /library <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:31, packages/admin/src/screens/GuardianDashboard.tsx:101; /library/resource/[resourceId] <- packages/library/src/screens/CollectionDetailScreen.tsx:71, packages/library/src/screens/MapScreen.web.tsx:335
- real_data: /library/collections/[id] -> library.addToCollection [orpc-rpc:served]; /library/collections/[id] -> library.createCollection [orpc-rpc:served]; /library/collections/[id] -> library.createResource [orpc-rpc:served]; /library/collections/[id] -> library.deleteCollection [orpc-rpc:served]; /library/collections/[id] -> library.deleteResource [orpc-rpc:served]; /library/collections/[id] -> library.engage [orpc-rpc:served]
- unserved: /library/collections/[id] -> library.reportBrokenLink [hono-rest:NO-SERVER-MOUNT]; /library -> library.reportBrokenLink [hono-rest:NO-SERVER-MOUNT]; /library/resource/[resourceId] -> library.reportBrokenLink [hono-rest:NO-SERVER-MOUNT]

### library-curation-review — PARTIAL
- Hostile verdict: Served procs but curation gating relies on client role checks; verifyResource reachable; partial client (P).
- schema: LibraryResource @ packages/schema/schema.zmodel:1073 (table nodes)
- api: library.getCounts @ apps/sanctuary-api/src/core/handlers/library.ts:246 [orpc-rpc:served]; library.getResources @ apps/sanctuary-api/src/core/handlers/library.ts:269 [orpc-rpc:served]; library.getResource @ apps/sanctuary-api/src/core/handlers/library.ts:334 [orpc-rpc:served]; library.getBookmarkedResources @ apps/sanctuary-api/src/core/handlers/library.ts:359 [orpc-rpc:served]; library.searchLibrary @ apps/sanctuary-api/src/core/handlers/library.ts:379 [orpc-rpc:served]; library.createResource @ apps/sanctuary-api/src/core/handlers/library.ts:397 [orpc-rpc:served]; library.updateResource @ apps/sanctuary-api/src/core/handlers/library.ts:424 [orpc-rpc:served]; library.deleteResource @ apps/sanctuary-api/src/core/handlers/library.ts:440 [orpc-rpc:served]; library.verifyResource @ apps/sanctuary-api/src/core/handlers/library.ts:447 [orpc-rpc:served]; library.reportBrokenLink @ apps/sanctuary-api/src/core/handlers/library.ts:459 [hono-rest:NO-SERVER-MOUNT]; library.engage @ apps/sanctuary-api/src/core/handlers/library.ts:481 [orpc-rpc:served]; library.createCollection @ apps/sanctuary-api/src/core/handlers/library.ts:572 [orpc-rpc:served]
- client: library.getCounts <- packages/core/src/api/library.ts:16; library.getResources <- apps/gurudevi-web/app/(sanctuary)/library/LibraryFloor.tsx:83; library.getResource <- packages/core/src/api/library.ts:68; library.getBookmarkedResources <- packages/core/src/api/library.ts:86; library.searchLibrary <- packages/core/src/api/library.ts:80; library.createResource <- packages/core/src/api/library.ts:110; library.updateResource <- packages/core/src/api/library.ts:126; library.deleteResource <- packages/core/src/api/library.ts:133
- screen: apps/gurudevi-mobile/app/(tabs)/library/review.tsx
- nav: /library/review <- packages/library/src/screens/LibraryScreen.tsx:878, packages/library/src/screens/LibraryScreen.web.tsx:1308
- real_data: /library/review -> supabase .from('nodes') @ packages/library/src/screens/CuratorReviewScreen.tsx:96

### library-tools — PARTIAL
- Hostile verdict: Pure client tools, no persistence; pass-1 caveats stand.
- screen: apps/gurudevi-mobile/app/(tabs)/library/document-scanner.tsx; apps/gurudevi-mobile/app/(tabs)/library/tools/cloud-export.tsx; apps/gurudevi-mobile/app/(tabs)/library/tools/image-to-pdf.tsx; apps/gurudevi-mobile/app/(tabs)/library/tools/index.tsx; apps/gurudevi-mobile/app/(tabs)/library/tools/ocr.tsx; apps/gurudevi-mobile/app/(tabs)/library/tools/pdf-editor.tsx; apps/gurudevi-mobile/app/(tabs)/library/tools/spreadsheet.tsx
- nav: /library/tools/cloud-export <- packages/library/src/screens/ToolsHubScreen.tsx:41; /library/tools/image-to-pdf <- apps/gurudevi-mobile/app/(tabs)/library/tools/index.tsx:56, packages/library/src/screens/ToolsHubScreen.tsx:40; /library/tools <- packages/library/src/screens/LibraryScreen.tsx:882; /library/tools/ocr <- apps/gurudevi-mobile/app/(tabs)/library/tools/index.tsx:38, packages/library/src/screens/ToolsHubScreen.tsx:39
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### cosmic-map — PARTIAL
- Hostile verdict: mapping.* calls are Hono REST: REST hc client path has no server mount since e383ef01 (2026-07-30 08:03). Map renders but data calls 404 statically.
- schema: MappingTopology @ packages/schema/schema.zmodel:1052 (table mapping_topologies)
- api: mapping.getById @ apps/sanctuary-api/src/core/handlers/mapping.ts:41 [hono-rest:NO-SERVER-MOUNT]; mapping.getSchoolPulse @ apps/sanctuary-api/src/core/handlers/mapping.ts:47 [hono-rest:NO-SERVER-MOUNT]; mapping.upsert @ apps/sanctuary-api/src/core/handlers/mapping.ts:115 [hono-rest:NO-SERVER-MOUNT]; mapping.createShareLink @ apps/sanctuary-api/src/core/handlers/mapping.ts:159 [hono-rest:NO-SERVER-MOUNT]
- client: mapping.getById <- packages/core/src/api/mapping.ts:13; mapping.getSchoolPulse <- packages/core/src/api/mapping.ts:19; mapping.upsert <- packages/core/src/api/mapping.ts:29; mapping.createShareLink <- packages/core/src/api/mapping.ts:46
- screen: apps/gurudevi-mobile/app/(tabs)/library/map.tsx
- nav: /library/map <- packages/library/src/screens/LibraryScreen.tsx:874, packages/library/src/screens/LibraryScreen.web.tsx:740

### self-wellbeing — PARTIAL
- Hostile verdict: self.mood/journal via (client.api as any).self.* and sync registry packages/core/src/lib/sync/registry.ts:94: REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).
- schema: MoodLog @ packages/schema/schema.zmodel:929 (table mood_logs); ThoughtRecord @ packages/schema/schema.zmodel:958 (table thought_records); FireJournalEntry @ packages/schema/schema.zmodel:944 (table fire_journal); UserPreferences @ packages/schema/schema.zmodel:1023 (table user_preferences)
- api: self.logMood @ apps/sanctuary-api/src/core/handlers/self.ts:55 [hono-rest:NO-SERVER-MOUNT]; self.getMoodHistory @ apps/sanctuary-api/src/core/handlers/self.ts:68 [hono-rest:NO-SERVER-MOUNT]; self.burnJournal @ apps/sanctuary-api/src/core/handlers/self.ts:80 [hono-rest:NO-SERVER-MOUNT]; self.getJournalHistory @ apps/sanctuary-api/src/core/handlers/self.ts:99 [hono-rest:NO-SERVER-MOUNT]; self.getTodayMood @ apps/sanctuary-api/src/core/handlers/self.ts:129 [hono-rest:NO-SERVER-MOUNT]; self.saveThoughtRecord @ apps/sanctuary-api/src/core/handlers/self.ts:146 [NO-CLIENT]; self.getThoughtRecords @ apps/sanctuary-api/src/core/handlers/self.ts:159 [NO-CLIENT]; self.completeThoughtRecordFollowUp @ apps/sanctuary-api/src/core/handlers/self.ts:171 [NO-CLIENT]; self.getPreferences @ apps/sanctuary-api/src/core/handlers/self.ts:185 [NO-CLIENT]; self.updatePreferences @ apps/sanctuary-api/src/core/handlers/self.ts:194 [NO-CLIENT]
- client: self.logMood <- packages/self/src/api/self.ts:36; self.getMoodHistory <- packages/self/src/api/self.ts:67; self.burnJournal <- packages/self/src/api/self.ts:83; self.getJournalHistory <- packages/self/src/api/self.ts:111; self.getTodayMood <- packages/self/src/api/self.ts:127
- screen: apps/gurudevi-mobile/app/(tabs)/self/index.tsx; apps/gurudevi-web/app/(sanctuary)/self/page.tsx
- nav: /self <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:49, apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts:169; /self <- apps/gurudevi-web/app/(sanctuary)/sanctuary-nav.ts:22, apps/gurudevi-web/app/(sanctuary)/onboarding/OnboardingForm.tsx:71
- real_data: /self -> supabase .from('mood_logs') @ packages/self/src/api/selfInsightsRepository.ts:99; /self -> supabase .from('fire_journal') @ packages/self/src/api/selfInsightsRepository.ts:104; /self -> PowerSync (packages/core/src/accounts/accountTransition.ts)
- unserved: /self -> self.burnJournal [hono-rest:NO-SERVER-MOUNT]; /self -> self.getJournalHistory [hono-rest:NO-SERVER-MOUNT]; /self -> self.getMoodHistory [hono-rest:NO-SERVER-MOUNT]; /self -> self.getTodayMood [hono-rest:NO-SERVER-MOUNT]; /self -> self.logMood [hono-rest:NO-SERVER-MOUNT]
- ungated_mock: apps/gurudevi-web/lib/sanctuary/selfExplore.ts:134 'sample-fire-journal-entry'; apps/gurudevi-web/lib/sanctuary/selfExplore.ts:146 'sample-mood-lotus-entry'; packages/core/src/lib/persistenceBoundary.ts:110 'demo-local-only'; packages/core/src/lib/persistenceBoundary.ts:33 'demo-local-only'; packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:171 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:99 Math.random().toString

### decision-journal — LIVE
- Hostile verdict: All feature procs have served oRPC sites; renderer chain traced from /self closure. Promoted from PARTIAL.
- schema: DecisionJournal @ packages/schema/schema.zmodel:1008 (table decision_journals)
- api: decisionJournal.list @ apps/sanctuary-api/src/core/handlers/decisionJournal.ts:27 [orpc-rpc:served]; decisionJournal.create @ apps/sanctuary-api/src/core/handlers/decisionJournal.ts:44 [orpc-rpc:served]; decisionJournal.markReviewed @ apps/sanctuary-api/src/core/handlers/decisionJournal.ts:64 [orpc-rpc:served]; journalEntries.list @ apps/sanctuary-api/src/core/handlers/journalEntries.ts:23 [orpc-rpc:served]; journalEntries.create @ apps/sanctuary-api/src/core/handlers/journalEntries.ts:40 [orpc-rpc:served]
- client: decisionJournal.list <- packages/core/src/api/decisionJournal.ts:5; decisionJournal.create <- packages/core/src/api/decisionJournal.ts:18; decisionJournal.markReviewed <- packages/core/src/api/decisionJournal.ts:24; journalEntries.list <- packages/core/src/api/journalEntries.ts:5; journalEntries.create <- packages/core/src/api/journalEntries.ts:14
- screen: apps/gurudevi-mobile/app/(tabs)/self/index.tsx
- nav: /self <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:49, apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts:169
- real_data: /self -> decisionJournal.create [facade,orpc-rpc:served]; /self -> decisionJournal.list [facade,orpc-rpc:served]; /self -> decisionJournal.markReviewed [orpc-rpc:served]; /self -> journalEntries.create [facade,orpc-rpc:served]; /self -> journalEntries.list [facade,orpc-rpc:served]
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:171 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:99 Math.random().toString; packages/self/src/components/ReframeWizard.tsx:76 Math.random().toString; packages/self/src/components/VoiceJournaling.tsx:252 mock-uri; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'

### learning-reflections — PARTIAL
- Hostile verdict: learningReflections.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).
- schema: LearningReflection @ packages/schema/schema.zmodel:981 (table learning_reflections)
- api: learningReflections.saveLearningReflection @ apps/sanctuary-api/src/core/handlers/learningReflections.ts:33 [hono-rest:NO-SERVER-MOUNT]; learningReflections.getLearningReflections @ apps/sanctuary-api/src/core/handlers/learningReflections.ts:46 [hono-rest:NO-SERVER-MOUNT]; learningReflections.completeLearningReflectionFollowUp @ apps/sanctuary-api/src/core/handlers/learningReflections.ts:62 [hono-rest:NO-SERVER-MOUNT]
- client: learningReflections.saveLearningReflection <- packages/classroom/src/api/learningReflections.ts:19; learningReflections.getLearningReflections <- packages/classroom/src/api/learningReflections.ts:51; learningReflections.completeLearningReflectionFollowUp <- packages/classroom/src/api/learningReflections.ts:71
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/reflect.tsx
- nav: /workspace/classroom/reflect <- packages/classroom/src/screens/StudentDashboard.web.tsx:61, packages/classroom/src/screens/StudentClassroomDashboard.tsx:83
- real_data: /workspace/classroom/reflect -> PowerSync (packages/core/src/accounts/accountTransition.ts)
- ungated_mock: packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample; packages/classroom/src/components/ClassroomList.tsx:93 'sample-c1'; packages/classroom/src/components/ClassroomList.tsx:94 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:96 is_sample; packages/classroom/src/components/student/StudentGradesOverview.tsx:24 'demo-grade-1'

### daily-wisdom — PARTIAL
- Hostile verdict: WisdomSeeds -> packages/self/src/api/dailyContent.ts:16 orpcClient.dailyContent.getToday (served), but DailyContentCard (packages/self/src/components/DailyContentCard.tsx:53) is exported and used by no screen.
- api: dailyContent.getToday @ apps/sanctuary-api/src/core/handlers/dailyContent.ts:35 [orpc-rpc:served]; dailyContent.getForDate @ apps/sanctuary-api/src/core/handlers/dailyContent.ts:43 [orpc-rpc:served]; dailyContent.getRecent @ apps/sanctuary-api/src/core/handlers/dailyContent.ts:47 [orpc-rpc:served]
- client: dailyContent.getToday <- packages/core/src/api/dailyContent.ts:16; dailyContent.getForDate <- packages/core/src/api/dailyContent.ts:31; dailyContent.getRecent <- packages/core/src/api/dailyContent.ts:41
- screen: apps/gurudevi-mobile/app/(tabs)/self/index.tsx; apps/gurudevi-mobile/app/(tabs)/self/wisdom/[id].tsx
- nav: /self <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:49, apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts:169; /self/wisdom/[id] <- packages/self/src/components/WisdomSeeds.tsx:178
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:171 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:99 Math.random().toString; packages/self/src/components/ReframeWizard.tsx:76 Math.random().toString; packages/self/src/components/VoiceJournaling.tsx:252 mock-uri; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'

### warm-mirror — PARTIAL
- Hostile verdict: warmMirror.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03); no served path reached from routes.
- Name note: Single procedure; 'mirror' implies a dialogue — behaviour is one enrichment call.
- api: warmMirror.getDataPoints @ apps/sanctuary-api/src/core/handlers/warmMirror.ts:34 [hono-rest:NO-SERVER-MOUNT]
- client: warmMirror.getDataPoints <- packages/core/src/api/warmMirror.ts:11
- screen: apps/gurudevi-mobile/app/(tabs)/self/index.tsx
- nav: /self <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:49, apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts:169
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:171 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:99 Math.random().toString; packages/self/src/components/ReframeWizard.tsx:76 Math.random().toString; packages/self/src/components/VoiceJournaling.tsx:252 mock-uri; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'

### privacy-ledger — LIVE
- Hostile verdict: 2 procs served and reached; caveat: 534 direct Supabase .from sites bypass the ledger. Promoted.
- Name note: Name promises completeness the architecture cannot yet guarantee.
- schema: GuardianAssessmentReadAuditEvent @ packages/schema/schema.zmodel:1881 (table guardian_assessment_read_audit_events)
- api: privacy.getPrivacyLedger @ apps/sanctuary-api/src/core/handlers/privacy.ts:26 [orpc-rpc:served]; privacy.logPrivacyEvent @ apps/sanctuary-api/src/core/handlers/privacy.ts:40 [orpc-rpc:served]
- client: privacy.getPrivacyLedger <- packages/core/src/api/privacy.ts:22; privacy.logPrivacyEvent <- packages/core/src/api/privacy.ts:36
- screen: apps/gurudevi-mobile/app/(tabs)/profile/privacy-ledger.tsx
- nav: /profile/privacy-ledger <- packages/profile/src/navigation/ProfileNavigationContext.tsx:46
- real_data: /profile/privacy-ledger -> privacy.getPrivacyLedger [orpc-rpc:served]; /profile/privacy-ledger -> privacy.logPrivacyEvent [orpc-rpc:served]

### community-feed — PARTIAL
- Hostile verdict: Downgraded from LIVE. usePostsInfiniteQuery (packages/core/src/api/hooks/community.hooks.ts:62) -> communityAPI.getPosts (packages/core/src/api/community.ts:17) `(client.api as any).community.posts.$get`: REST hc client path has no server mount since e383ef01 (2026-07-30 08:03). 23/26 community sites are REST.
- schema: Post @ packages/schema/schema.zmodel:555 (table community_posts); Group @ packages/schema/schema.zmodel:505 (table community_groups); GroupMember @ packages/schema/schema.zmodel:534 (table community_group_members); CommunityReaction @ packages/schema/schema.zmodel:626 (table community_reactions); GroupMessage @ packages/schema/schema.zmodel:585 (table group_messages)
- api: community.getGroups @ apps/sanctuary-api/src/core/handlers/community.ts:74 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; community.getGroup @ apps/sanctuary-api/src/core/handlers/community.ts:89 [hono-rest:NO-SERVER-MOUNT]; community.createGroup @ apps/sanctuary-api/src/core/handlers/community.ts:96 [hono-rest:NO-SERVER-MOUNT]; community.joinGroup @ apps/sanctuary-api/src/core/handlers/community.ts:110 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; community.updateMemberStatus @ apps/sanctuary-api/src/core/handlers/community.ts:127 [hono-rest:NO-SERVER-MOUNT]; community.updateGroupPolicy @ apps/sanctuary-api/src/core/handlers/community.ts:144 [hono-rest:NO-SERVER-MOUNT]; community.getGroupMembers @ apps/sanctuary-api/src/core/handlers/community.ts:154 [hono-rest:NO-SERVER-MOUNT]; community.updateMemberRole @ apps/sanctuary-api/src/core/handlers/community.ts:165 [hono-rest:NO-SERVER-MOUNT]; community.approveAllMembers @ apps/sanctuary-api/src/core/handlers/community.ts:177 [hono-rest:NO-SERVER-MOUNT]; community.getPosts @ apps/sanctuary-api/src/core/handlers/community.ts:186 [hono-rest:NO-SERVER-MOUNT]; community.getCommunityResonance @ apps/sanctuary-api/src/core/handlers/community.ts:200 [hono-rest:NO-SERVER-MOUNT]; community.createPost @ apps/sanctuary-api/src/core/handlers/community.ts:226 [hono-rest:NO-SERVER-MOUNT]
- client: community.getGroups <- packages/core/src/api/groups.ts:20; community.getGroup <- packages/core/src/api/groups.ts:42; community.createGroup <- packages/core/src/api/groups.ts:65; community.joinGroup <- packages/core/src/api/groups.ts:80; community.updateMemberStatus <- packages/core/src/api/community.ts:56; community.updateGroupPolicy <- packages/core/src/api/community.ts:65; community.getGroupMembers <- packages/core/src/api/community.ts:74; community.updateMemberRole <- packages/core/src/api/community.ts:83
- screen: apps/gurudevi-mobile/app/(modal)/create-group.tsx; apps/gurudevi-mobile/app/(modal)/create-post.tsx; apps/gurudevi-mobile/app/(tabs)/community/groups/[groupId].tsx; apps/gurudevi-mobile/app/(tabs)/community/index.tsx; apps/gurudevi-web/app/(sanctuary)/community/page.tsx
- nav: /community/groups/[groupId] <- packages/classroom/src/components/CreateSchoolModal.tsx:161, packages/community/src/screens/CommunityScreen.tsx:348; /community <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:58, apps/gurudevi-mobile/src/providers/PushNotificationProvider.tsx:71; /community <- apps/gurudevi-web/app/(sanctuary)/sanctuary-nav.ts:24
- real_data: /create-group -> community.joinGroup [facade,hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; /create-group -> supabase .from('community_groups') @ packages/core/src/native/flows/FlowResolver.ts:196; /create-group -> supabase .from('community_reactions') @ packages/community/src/api/community.ts:231; /create-group -> supabase .from('community_group_members') @ packages/community/src/screens/GroupDetailsScreen.tsx:99; /create-post -> community.joinGroup [facade,hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; /create-post -> supabase .from('community_groups') @ packages/core/src/native/flows/FlowResolver.ts:196
- unserved: /create-group -> community.approveAllMembers [hono-rest:NO-SERVER-MOUNT]; /create-group -> community.createComment [facade,hono-rest:NO-SERVER-MOUNT]; /create-group -> community.createGroup [facade,hono-rest:NO-SERVER-MOUNT]; /create-group -> community.createPost [facade,hono-rest:NO-SERVER-MOUNT]; /create-group -> community.deleteComment [facade,hono-rest:NO-SERVER-MOUNT]; /create-group -> community.deletePost [hono-rest:NO-SERVER-MOUNT]
- ungated_mock: apps/gurudevi-web/app/(sanctuary)/community/CommunityFeedFloor.tsx:277 focusedCircleFeedMock; packages/core/src/api/hooks/notification.hooks.ts:43 Math.random().toString; packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### direct-messages — LIVE
- Hostile verdict: DM screens use socialAPI (served oRPC) + Supabase; promoted. messagingAPI still has zero UI consumers.
- schema: GroupMessage @ packages/schema/schema.zmodel:585 (table group_messages)
- api: social.getNotifications @ apps/sanctuary-api/src/core/handlers/social.ts:22 [orpc-rpc:served]; social.getUnreadNotificationCount @ apps/sanctuary-api/src/core/handlers/social.ts:35 [orpc-rpc:served]; social.markNotificationRead @ apps/sanctuary-api/src/core/handlers/social.ts:44 [orpc-rpc:served]; social.markAllNotificationsRead @ apps/sanctuary-api/src/core/handlers/social.ts:53 [orpc-rpc:served]; social.blockUser @ apps/sanctuary-api/src/core/handlers/social.ts:62 [orpc-rpc:served]; social.unblockUser @ apps/sanctuary-api/src/core/handlers/social.ts:78 [orpc-rpc:served]; social.isBlockingActive @ apps/sanctuary-api/src/core/handlers/social.ts:84 [orpc-rpc:served]; social.getBlockedUsers @ apps/sanctuary-api/src/core/handlers/social.ts:98 [orpc-rpc:served]; messaging.getConversations @ apps/sanctuary-api/src/core/handlers/messaging.ts:48 [orpc-rpc:served]; messaging.getOrCreateConversation @ apps/sanctuary-api/src/core/handlers/messaging.ts:56 [orpc-rpc:served]; messaging.getMessages @ apps/sanctuary-api/src/core/handlers/messaging.ts:71 [orpc-rpc:served]; messaging.sendMessage @ apps/sanctuary-api/src/core/handlers/messaging.ts:84 [orpc-rpc:served]
- client: social.getNotifications <- packages/core/src/api/social.ts:37; social.getUnreadNotificationCount <- packages/core/src/api/social.ts:51; social.markNotificationRead <- packages/core/src/api/social.ts:59; social.markAllNotificationsRead <- packages/core/src/api/social.ts:67; social.blockUser <- packages/core/src/api/social.ts:77; social.unblockUser <- packages/core/src/api/social.ts:85; social.isBlockingActive <- packages/core/src/api/social.ts:93; social.getBlockedUsers <- packages/core/src/api/social.ts:101
- screen: apps/gurudevi-mobile/app/(tabs)/community/chat/[conversationId].tsx; apps/gurudevi-mobile/app/(tabs)/community/direct-messages.tsx; apps/gurudevi-mobile/app/(tabs)/community/direct-messages/[conversationId].tsx
- nav: /community/chat/[conversationId] <- packages/community/src/screens/GroupDetailsScreen.tsx:126; /community/direct-messages/[conversationId] <- packages/community/src/navigation/communityRoutes.ts:3
- real_data: /community/chat/[conversationId] -> social.blockUser [orpc-rpc:served]; /community/chat/[conversationId] -> social.getBlockedUsers [orpc-rpc:served]; /community/chat/[conversationId] -> social.getNotifications [orpc-rpc:served]; /community/chat/[conversationId] -> social.getUnreadNotificationCount [orpc-rpc:served]; /community/chat/[conversationId] -> social.isBlockingActive [orpc-rpc:served]; /community/chat/[conversationId] -> social.markAllNotificationsRead [orpc-rpc:served]

### messaging-router — BACKEND-ONLY
- Hostile verdict: 4 procs, no screen consumer.
- api: messaging.getConversations @ apps/sanctuary-api/src/core/handlers/messaging.ts:48 [orpc-rpc:served]; messaging.getOrCreateConversation @ apps/sanctuary-api/src/core/handlers/messaging.ts:56 [orpc-rpc:served]; messaging.getMessages @ apps/sanctuary-api/src/core/handlers/messaging.ts:71 [orpc-rpc:served]; messaging.sendMessage @ apps/sanctuary-api/src/core/handlers/messaging.ts:84 [orpc-rpc:served]
- client: messaging.getConversations <- packages/core/src/api/messaging.ts:28; messaging.getOrCreateConversation <- packages/core/src/api/messaging.ts:32; messaging.getMessages <- packages/core/src/api/messaging.ts:42; messaging.sendMessage <- packages/core/src/api/messaging.ts:54

### presence — BACKEND-ONLY
- Hostile verdict: presenceAPI used only by packages/community/src/api/presence.ts and presence.hooks.ts; no screen imports either. Downgraded.
- api: presence.getFallbackCount @ apps/sanctuary-api/src/core/handlers/presence.ts:15 [orpc-rpc:served]; presence.markSeen @ apps/sanctuary-api/src/core/handlers/presence.ts:40 [orpc-rpc:served]
- client: presence.getFallbackCount <- packages/core/src/api/presence.ts:19; presence.markSeen <- packages/core/src/api/presence.ts:30
- screen: apps/gurudevi-mobile/app/(tabs)/community/index.tsx
- nav: /community <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:58, apps/gurudevi-mobile/src/providers/PushNotificationProvider.tsx:71
- ungated_mock: packages/core/src/api/hooks/notification.hooks.ts:43 Math.random().toString; packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### sacred-missions — LIVE
- Hostile verdict: Consumer found: community tab closure reaches sacredMissions.list/create/endorse/unendorse (served). Promoted.
- api: sacredMissions.list @ apps/sanctuary-api/src/core/handlers/sacredMissions.ts:41 [orpc-rpc:served]; sacredMissions.create @ apps/sanctuary-api/src/core/handlers/sacredMissions.ts:56 [orpc-rpc:served]; sacredMissions.endorse @ apps/sanctuary-api/src/core/handlers/sacredMissions.ts:78 [orpc-rpc:served]; sacredMissions.unendorse @ apps/sanctuary-api/src/core/handlers/sacredMissions.ts:101 [orpc-rpc:served]
- client: sacredMissions.list <- packages/core/src/api/sacredMissions.ts:10; sacredMissions.create <- packages/core/src/api/sacredMissions.ts:26; sacredMissions.endorse <- packages/core/src/api/sacredMissions.ts:47; sacredMissions.unendorse <- packages/core/src/api/sacredMissions.ts:59
- screen: apps/gurudevi-mobile/app/(tabs)/community/index.tsx
- nav: /community <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:58, apps/gurudevi-mobile/src/providers/PushNotificationProvider.tsx:71
- real_data: /community -> sacredMissions.create [orpc-rpc:served]; /community -> sacredMissions.endorse [orpc-rpc:served]; /community -> sacredMissions.list [orpc-rpc:served]; /community -> sacredMissions.unendorse [orpc-rpc:served]
- ungated_mock: packages/core/src/api/hooks/notification.hooks.ts:43 Math.random().toString; packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### announcements — LIVE
- Hostile verdict: Served and reached from principal/community routes. Promoted.
- api: announcements.getAnnouncements @ apps/sanctuary-api/src/core/handlers/announcements.ts:20 [orpc-rpc:served]; announcements.createAnnouncement @ apps/sanctuary-api/src/core/handlers/announcements.ts:30 [orpc-rpc:served]
- client: announcements.getAnnouncements <- packages/core/src/api/announcements.ts:13; announcements.createAnnouncement <- packages/core/src/api/announcements.ts:17
- screen: apps/gurudevi-mobile/app/(tabs)/community/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/attendance.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/gradebook.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/reflect.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/student/[classroomId].tsx
- nav: /community <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:58, apps/gurudevi-mobile/src/providers/PushNotificationProvider.tsx:71; /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61; /workspace/classroom <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:104, apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:151; /workspace/classroom/reflect <- packages/classroom/src/screens/StudentDashboard.web.tsx:61, packages/classroom/src/screens/StudentClassroomDashboard.tsx:83
- real_data: /community -> announcements.createAnnouncement [facade,orpc-rpc:served]; /community -> announcements.getAnnouncements [facade,orpc-rpc:served]; /workspace/classroom/[classroomId] -> announcements.createAnnouncement [facade,orpc-rpc:served]; /workspace/classroom/[classroomId] -> announcements.getAnnouncements [facade,orpc-rpc:served]; /workspace/classroom -> announcements.createAnnouncement [facade,orpc-rpc:served]; /workspace/classroom -> announcements.getAnnouncements [facade,orpc-rpc:served]
- ungated_mock: packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample; packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample

### classroom-core — PARTIAL
- Hostile verdict: api.classrooms.getByTeacher (packages/core/src/api/classrooms.ts) is Hono REST (unserved); ClassroomList falls back to MOCK_CLASSROOMS ungated.
- schema: Classroom @ packages/schema/schema.zmodel:225 (table classrooms); ClassroomStudent @ packages/schema/schema.zmodel:289 (table classroom_students); ClassroomJoinRequest @ packages/schema/schema.zmodel:376 (table classroom_join_requests); ClassroomLegacyRecord @ packages/schema/schema.zmodel:398 (table classroom_legacy_records)
- api: educational.getByTeacher @ apps/sanctuary-api/src/core/handlers/educational.ts:128 [hono-rest:NO-SERVER-MOUNT]; educational.getByStudent @ apps/sanctuary-api/src/core/handlers/educational.ts:139 [hono-rest:NO-SERVER-MOUNT]; educational.getTeacherStats @ apps/sanctuary-api/src/core/handlers/educational.ts:148 [hono-rest:NO-SERVER-MOUNT]; educational.getById @ apps/sanctuary-api/src/core/handlers/educational.ts:165 [hono-rest:NO-SERVER-MOUNT]; educational.createClassroom @ apps/sanctuary-api/src/core/handlers/educational.ts:177 [hono-rest:NO-SERVER-MOUNT]; educational.updateClassroom @ apps/sanctuary-api/src/core/handlers/educational.ts:201 [hono-rest:NO-SERVER-MOUNT]; educational.deleteClassroom @ apps/sanctuary-api/src/core/handlers/educational.ts:228 [hono-rest:NO-SERVER-MOUNT]; educational.getClassroomResources @ apps/sanctuary-api/src/core/handlers/educational.ts:235 [hono-rest:NO-SERVER-MOUNT]; educational.createLesson @ apps/sanctuary-api/src/core/handlers/educational.ts:254 [hono-rest:NO-SERVER-MOUNT]; educational.getClassroomStudents @ apps/sanctuary-api/src/core/handlers/educational.ts:273 [hono-rest:NO-SERVER-MOUNT]; educational.enrollStudent @ apps/sanctuary-api/src/core/handlers/educational.ts:282 [hono-rest:NO-SERVER-MOUNT]; educational.addShadowStudent @ apps/sanctuary-api/src/core/handlers/educational.ts:303 [hono-rest:NO-SERVER-MOUNT]
- client: educational.getByTeacher <- packages/core/src/api/classrooms.ts:37; educational.getByStudent <- packages/core/src/api/classrooms.ts:53; educational.getTeacherStats <- packages/core/src/api/classrooms.ts:65; educational.getById <- packages/core/src/api/classrooms.ts:77; educational.createClassroom <- packages/core/src/api/classrooms.ts:27; educational.updateClassroom <- packages/core/src/api/classrooms.ts:18; educational.deleteClassroom <- packages/core/src/api/classrooms.ts:33; educational.getClassroomResources <- packages/core/src/api/resources.ts:20
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/student/[classroomId].tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61; /workspace/classroom <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:104, apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:151; /workspace/classroom/student/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:124, packages/classroom/src/screens/StudentDashboard.tsx:65
- real_data: /workspace/classroom/[classroomId] -> supabase .from('classrooms') @ packages/core/src/native/flows/FlowResolver.ts:131; /workspace/classroom/[classroomId] -> supabase .from('classroom_students') @ packages/core/src/native/flows/FlowResolver.ts:147; /workspace/classroom/[classroomId] -> PowerSync (packages/core/src/accounts/accountTransition.ts); /workspace/classroom -> supabase .from('classrooms') @ packages/ai/src/api/agents.ts:68; /workspace/classroom -> supabase .from('classroom_students') @ packages/core/src/native/flows/FlowResolver.ts:147; /workspace/classroom -> PowerSync (packages/core/src/accounts/accountTransition.ts)
- unserved: /workspace/classroom/[classroomId] -> educational.addShadowStudent [facade]; /workspace/classroom/[classroomId] -> educational.getById [facade]; /workspace/classroom/[classroomId] -> educational.getByStudent [facade]; /workspace/classroom/[classroomId] -> educational.getByTeacher [facade]; /workspace/classroom/[classroomId] -> educational.getClassroomStudents [facade]; /workspace/classroom/[classroomId] -> educational.updateClassroom [facade]
- ungated_mock: packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample; packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample

### attendance — LIVE
- Hostile verdict: oRPC served + PowerSync.
- schema: DailyAttendance @ packages/schema/schema.zmodel:1643 (table daily_attendance); AttendanceSession @ packages/schema/schema.zmodel:1667 (table attendance_sessions); AttendanceRecord @ packages/schema/schema.zmodel:690 (table attendance)
- api: attendance.getByClassroom @ apps/sanctuary-api/src/core/handlers/attendance.ts:105 [orpc-rpc:served]; attendance.record @ apps/sanctuary-api/src/core/handlers/attendance.ts:121 [orpc-rpc:served]; attendance.batchRecord @ apps/sanctuary-api/src/core/handlers/attendance.ts:124 [orpc-rpc:served]; attendance.getSchoolPulse @ apps/sanctuary-api/src/core/handlers/attendance.ts:135 [orpc-rpc:served]; attendance.getReport @ apps/sanctuary-api/src/core/handlers/attendance.ts:153 [orpc-rpc:served]
- client: attendance.getByClassroom <- packages/core/src/api/attendance.ts:60; attendance.record <- packages/core/src/api/attendance.ts:50; attendance.batchRecord <- apps/gurudevi-web/lib/workspace/attendance.ts:444; attendance.getSchoolPulse <- packages/core/src/api/attendance.ts:72; attendance.getReport <- packages/core/src/api/attendance.ts:87
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/attendance.tsx; apps/gurudevi-mobile/app/attendance.tsx
- nav: /attendance <- packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx:132, packages/self/src/components/PulseDashboard.tsx:171
- real_data: /workspace/classroom/[classroomId]/attendance -> attendance.batchRecord [orpc-rpc:served]; /workspace/classroom/[classroomId]/attendance -> PowerSync (packages/classroom/src/screens/AttendanceScreen.tsx); /attendance -> attendance.batchRecord [orpc-rpc:served]; /attendance -> PowerSync (packages/classroom/src/screens/AttendanceScreen.tsx)
- unserved: /workspace/classroom/[classroomId]/attendance -> attendance.getReport [facade]; /attendance -> attendance.getReport [facade]
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### teacher-attendance — BACKEND-ONLY
- Hostile verdict: Schema-only: TeacherDailyAttendance model has no procedure, client or screen. (pass-1 PARTIAL was generous.)
- schema: TeacherDailyAttendance @ packages/schema/schema.zmodel:1698 (table teacher_daily_attendance); TeacherAttendanceSession @ packages/schema/schema.zmodel:1720 (table teacher_attendance_sessions)

### gradebook — PARTIAL
- Hostile verdict: Served grading procs but data partly sample/fallback (real_data P).
- schema: Grade @ packages/schema/schema.zmodel:338 (table student_grades); GradeMark @ packages/schema/schema.zmodel:1749 (table grade_marks); ClassroomGradingSettings @ packages/schema/schema.zmodel:492 (table classroom_grading_settings)
- api: grading.getGradingSettings @ apps/sanctuary-api/src/core/handlers/grading.ts:56 [orpc-rpc:served]; grading.updateGradingSettings @ apps/sanctuary-api/src/core/handlers/grading.ts:68 [orpc-rpc:served]; grading.getReportCard @ apps/sanctuary-api/src/core/handlers/grading.ts:88 [orpc-rpc:served]; grading.getClassroomGrades @ apps/sanctuary-api/src/core/handlers/grading.ts:103 [orpc-rpc:served]; grading.submitGrade @ apps/sanctuary-api/src/core/handlers/grading.ts:118 [orpc-rpc:served]; grading.publishGrade @ apps/sanctuary-api/src/core/handlers/grading.ts:158 [orpc-rpc:served]
- client: grading.getGradingSettings <- packages/core/src/api/grading.ts:66; grading.updateGradingSettings <- packages/core/src/api/grading.ts:77; grading.getReportCard <- packages/core/src/api/grading.ts:124; grading.getClassroomGrades <- packages/core/src/api/grading.ts:56; grading.submitGrade <- packages/core/src/api/grading.ts:98; grading.publishGrade <- packages/core/src/api/grading.ts:109
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/gradebook.tsx; apps/gurudevi-mobile/app/gradebook.tsx
- nav: /gradebook <- packages/self/src/components/PulseDashboard.tsx:188
- unserved: /workspace/classroom/[classroomId]/gradebook -> grading.updateGradingSettings [facade]; /gradebook -> grading.updateGradingSettings [facade]
- ungated_mock: packages/classroom/src/screens/GradebookScreen.tsx:35 'demo-class'; packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### assignments — PARTIAL
- Hostile verdict: Screen is demo-only; educational assignment procs have no client call site.
- schema: Assignment @ packages/schema/schema.zmodel:315 (table assignments); AssignmentSubmission @ packages/schema/schema.zmodel:418 (table submissions)
- api: educational.getAssignments @ apps/sanctuary-api/src/core/handlers/educational.ts:484 [NO-CLIENT]; educational.createAssignment @ apps/sanctuary-api/src/core/handlers/educational.ts:502 [NO-CLIENT]; educational.getStudentSubmissions @ apps/sanctuary-api/src/core/handlers/educational.ts:542 [NO-CLIENT]; educational.getUpcomingAssignments @ apps/sanctuary-api/src/core/handlers/educational.ts:558 [NO-CLIENT]; educational.submitAssignment @ apps/sanctuary-api/src/core/handlers/educational.ts:579 [NO-CLIENT]; educational.gradeAssignmentSubmission @ apps/sanctuary-api/src/core/handlers/educational.ts:604 [NO-CLIENT]
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/student/[classroomId].tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61; /workspace/classroom/student/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:124, packages/classroom/src/screens/StudentDashboard.tsx:65
- real_data: /workspace/classroom/[classroomId] -> supabase .from('assignments') @ packages/analytics/src/engine/PerformanceAnalyzer.ts:44; /workspace/classroom/student/[classroomId] -> supabase .from('assignments') @ packages/analytics/src/engine/PerformanceAnalyzer.ts:44
- ungated_mock: packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample; packages/classroom/src/components/ClassroomList.tsx:93 'sample-c1'; packages/classroom/src/components/ClassroomList.tsx:94 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:96 is_sample; packages/classroom/src/components/student/StudentGradesOverview.tsx:24 'demo-grade-1'

### student-goals — UI-UNWIRED
- Hostile verdict: Screen with local demo state; no schema/API.
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/student/[classroomId].tsx
- nav: /workspace/classroom/student/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:124, packages/classroom/src/screens/StudentDashboard.tsx:65
- ungated_mock: packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample; packages/classroom/src/components/ClassroomList.tsx:93 'sample-c1'; packages/classroom/src/components/ClassroomList.tsx:94 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:96 is_sample; packages/classroom/src/components/student/StudentGradesOverview.tsx:24 'demo-grade-1'

### student-potential — LIVE
- Hostile verdict: Served and reached. Promoted.
- Name note: Lives in the library package as a modal — surprising home for a teacher analytics feature.
- api: studentPotential.getForClassroom @ apps/sanctuary-api/src/core/handlers/studentPotential.ts:38 [orpc-rpc:served]; studentPotential.listForStudent @ apps/sanctuary-api/src/core/handlers/studentPotential.ts:74 [orpc-rpc:served]; studentPotential.upsert @ apps/sanctuary-api/src/core/handlers/studentPotential.ts:109 [orpc-rpc:served]
- client: studentPotential.getForClassroom <- packages/core/src/api/studentPotential.ts:47; studentPotential.listForStudent <- packages/core/src/api/studentPotential.ts:59; studentPotential.upsert <- packages/core/src/api/studentPotential.ts:73
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61
- real_data: /workspace/classroom/[classroomId] -> studentPotential.getForClassroom [facade,orpc-rpc:served]; /workspace/classroom/[classroomId] -> studentPotential.listForStudent [orpc-rpc:served]; /workspace/classroom/[classroomId] -> studentPotential.upsert [facade,orpc-rpc:served]
- ungated_mock: packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample; packages/classroom/src/components/ClassroomList.tsx:93 'sample-c1'; packages/classroom/src/components/ClassroomList.tsx:94 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:96 is_sample

### longitudinal-profile — LIVE
- Hostile verdict: Served and reached. Promoted.
- schema: StudentLongitudinalEvent @ packages/schema/schema.zmodel:2166 (table student_longitudinal_events)
- api: longitudinal.getStudentTimeline @ apps/sanctuary-api/src/core/handlers/longitudinal.ts:105 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; longitudinal.getStudentSnapshotAsOf @ apps/sanctuary-api/src/core/handlers/longitudinal.ts:118 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]
- client: longitudinal.getStudentTimeline <- packages/core/src/api/longitudinal.ts:27; longitudinal.getStudentSnapshotAsOf <- packages/core/src/api/longitudinal.ts:43
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/attendance.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/gradebook.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/reflect.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/classroom/student/[classroomId].tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61; /workspace/classroom <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:104, apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:151; /workspace/classroom/reflect <- packages/classroom/src/screens/StudentDashboard.web.tsx:61, packages/classroom/src/screens/StudentClassroomDashboard.tsx:83; /workspace/classroom/student/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:124, packages/classroom/src/screens/StudentDashboard.tsx:65
- real_data: /workspace/classroom/reflect -> longitudinal.getStudentSnapshotAsOf [orpc-rpc:served]; /workspace/classroom/reflect -> longitudinal.getStudentTimeline [orpc-rpc:served]; /workspace/classroom/student/[classroomId] -> longitudinal.getStudentSnapshotAsOf [orpc-rpc:served]; /workspace/classroom/student/[classroomId] -> longitudinal.getStudentTimeline [orpc-rpc:served]
- ungated_mock: packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample; packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample

### classroom-echoes — PARTIAL
- Hostile verdict: echoes.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).
- api: echoes.sendEcho @ apps/sanctuary-api/src/core/handlers/echo.ts:46 [hono-rest:NO-SERVER-MOUNT]; echoes.getMyEchoes @ apps/sanctuary-api/src/core/handlers/echo.ts:70 [hono-rest:NO-SERVER-MOUNT]; echoes.getEchoesByClassroom @ apps/sanctuary-api/src/core/handlers/echo.ts:79 [hono-rest:NO-SERVER-MOUNT]; echoes.getTeacherEchoes @ apps/sanctuary-api/src/core/handlers/echo.ts:97 [hono-rest:NO-SERVER-MOUNT]; echoes.respondToEcho @ apps/sanctuary-api/src/core/handlers/echo.ts:111 [hono-rest:NO-SERVER-MOUNT]; echoes.markAsRead @ apps/sanctuary-api/src/core/handlers/echo.ts:127 [hono-rest:NO-SERVER-MOUNT]
- client: echoes.sendEcho <- packages/core/src/api/echo.ts:21; echoes.getMyEchoes <- packages/core/src/api/echo.ts:39; echoes.getEchoesByClassroom <- packages/core/src/api/echo.ts:51; echoes.getTeacherEchoes <- packages/core/src/api/echo.ts:63; echoes.respondToEcho <- packages/core/src/api/echo.ts:78; echoes.markAsRead <- packages/core/src/api/echo.ts:90
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61; /workspace/principal <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:98, packages/admin/src/screens/SchoolProfileScreen.web.tsx:106
- unserved: /workspace/classroom/[classroomId] -> echoes.markAsRead [facade]
- ungated_mock: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx:19 'demo-school'; packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample; packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS

### inventory — PARTIAL
- Hostile verdict: Beta flag inventory defaults false (packages/core/src/store/types/featureFlags.ts); one REST site unserved.
- schema: InventoryItem @ packages/schema/schema.zmodel:877 (table inventory_items); InventoryRequest @ packages/schema/schema.zmodel:906 (table inventory_requests)
- api: inventory.getAll @ apps/sanctuary-api/src/core/handlers/inventory.ts:45 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; inventory.update @ apps/sanctuary-api/src/core/handlers/inventory.ts:54 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; inventory.getSchoolResourceNeeds @ apps/sanctuary-api/src/core/handlers/inventory.ts:73 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; inventory.createRequest @ apps/sanctuary-api/src/core/handlers/inventory.ts:96 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; inventory.getSchoolRequests @ apps/sanctuary-api/src/core/handlers/inventory.ts:117 [hono-rest:NO-SERVER-MOUNT]
- client: inventory.getAll <- packages/core/src/api/inventory.ts:28; inventory.update <- packages/core/src/api/inventory.ts:36; inventory.getSchoolResourceNeeds <- packages/core/src/api/inventory.ts:53; inventory.createRequest <- packages/core/src/api/inventory.ts:61; inventory.getSchoolRequests <- packages/core/src/api/inventory.ts:69
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61; /workspace/principal <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:98, packages/admin/src/screens/SchoolProfileScreen.web.tsx:106
- real_data: /workspace/classroom/[classroomId] -> inventory.createRequest [orpc-rpc:served]; /workspace/classroom/[classroomId] -> inventory.getAll [orpc-rpc:served]; /workspace/classroom/[classroomId] -> inventory.update [orpc-rpc:served]; /workspace/classroom/[classroomId] -> supabase .from('inventory_requests') @ packages/admin/src/reporting.ts:137; /workspace/principal -> inventory.getSchoolResourceNeeds [facade,orpc-rpc:served]
- unserved: /workspace/principal -> inventory.getSchoolRequests [facade]
- ungated_mock: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx:19 'demo-school'; packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample; packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS

### principal-workspace — PARTIAL
- Hostile verdict: Served data but ungated 'demo-school' fallback and MOCK_SCHOOL_STATS in no-school state.
- schema: School @ packages/schema/schema.zmodel:710 (table schools); SchoolMembership @ packages/schema/schema.zmodel:850 (table school_memberships)
- api: admin.getStaffPresence @ apps/sanctuary-api/src/core/handlers/admin.ts:38 [orpc-rpc:served]; admin.getTeacherCarousel @ apps/sanctuary-api/src/core/handlers/admin.ts:55 [orpc-rpc:served]; admin.submitLeave @ apps/sanctuary-api/src/core/handlers/admin.ts:86 [orpc-rpc:served]; admin.getSchool @ apps/sanctuary-api/src/core/handlers/admin.ts:100 [NO-CLIENT]; admin.getPendingLeaves @ apps/sanctuary-api/src/core/handlers/admin.ts:115 [orpc-rpc:served]; admin.approveLeave @ apps/sanctuary-api/src/core/handlers/admin.ts:125 [orpc-rpc:served]; admin.getUpcomingCalendarEvents @ apps/sanctuary-api/src/core/handlers/admin.ts:136 [orpc-rpc:served]; admin.createCalendarEvent @ apps/sanctuary-api/src/core/handlers/admin.ts:150 [orpc-rpc:served]; principalNotes.getAll @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:27 [orpc-rpc:served]; principalNotes.getRecent @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:35 [orpc-rpc:served]; principalNotes.create @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:44 [orpc-rpc:served]; principalNotes.update @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:61 [orpc-rpc:served]
- client: admin.getStaffPresence <- packages/core/src/api/staffManagement.ts:54; admin.getTeacherCarousel <- packages/core/src/api/staffManagement.ts:61; admin.submitLeave <- packages/core/src/api/staffManagement.ts:75; admin.getPendingLeaves <- packages/core/src/api/staffManagement.ts:89; admin.approveLeave <- packages/core/src/api/staffManagement.ts:93; admin.getUpcomingCalendarEvents <- packages/core/src/api/staffManagement.ts:106; admin.createCalendarEvent <- packages/core/src/api/staffManagement.ts:123; principalNotes.getAll <- packages/admin/src/components/principal/PrincipalNotes.tsx:326
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx
- nav: /workspace/principal <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:98, packages/admin/src/screens/SchoolProfileScreen.web.tsx:106
- real_data: /workspace/principal -> admin.approveLeave [facade,orpc-rpc:served]; /workspace/principal -> admin.createCalendarEvent [facade,orpc-rpc:served]; /workspace/principal -> admin.getPendingLeaves [facade,orpc-rpc:served]; /workspace/principal -> admin.getStaffPresence [facade,orpc-rpc:served]; /workspace/principal -> admin.getTeacherCarousel [facade,orpc-rpc:served]; /workspace/principal -> admin.getUpcomingCalendarEvents [facade,orpc-rpc:served]
- ungated_mock: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx:19 'demo-school'; packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample

### principal-notes — LIVE
- Hostile verdict: Served and reached. Promoted.
- schema: ClassroomNote @ packages/schema/schema.zmodel:2147 (table classroom_notes)
- api: principalNotes.getAll @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:27 [orpc-rpc:served]; principalNotes.getRecent @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:35 [orpc-rpc:served]; principalNotes.create @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:44 [orpc-rpc:served]; principalNotes.update @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:61 [orpc-rpc:served]; principalNotes.delete @ apps/sanctuary-api/src/core/handlers/principalNotes.ts:73 [orpc-rpc:served]
- client: principalNotes.getAll <- packages/admin/src/components/principal/PrincipalNotes.tsx:326; principalNotes.getRecent <- packages/core/src/api/principalNotes.ts:22; principalNotes.create <- packages/admin/src/components/principal/PrincipalNotes.tsx:356; principalNotes.update <- packages/admin/src/components/principal/PrincipalNotes.tsx:374; principalNotes.delete <- packages/admin/src/components/principal/PrincipalNotes.tsx:405
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx
- nav: /workspace/principal <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:98, packages/admin/src/screens/SchoolProfileScreen.web.tsx:106
- real_data: /workspace/principal -> principalNotes.create [orpc-rpc:served]; /workspace/principal -> principalNotes.delete [orpc-rpc:served]; /workspace/principal -> principalNotes.getAll [orpc-rpc:served]; /workspace/principal -> principalNotes.update [orpc-rpc:served]
- ungated_mock: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx:19 'demo-school'; packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample

### staff-leave — LIVE
- Hostile verdict: Served and reached. Promoted.
- schema: StaffLeave @ packages/schema/schema.zmodel:1808 (table staff_leaves)
- api: admin.submitLeave @ apps/sanctuary-api/src/core/handlers/admin.ts:86 [orpc-rpc:served]; admin.getPendingLeaves @ apps/sanctuary-api/src/core/handlers/admin.ts:115 [orpc-rpc:served]; admin.approveLeave @ apps/sanctuary-api/src/core/handlers/admin.ts:125 [orpc-rpc:served]
- client: admin.submitLeave <- packages/core/src/api/staffManagement.ts:75; admin.getPendingLeaves <- packages/core/src/api/staffManagement.ts:89; admin.approveLeave <- packages/core/src/api/staffManagement.ts:93
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx
- nav: /workspace/principal <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:98, packages/admin/src/screens/SchoolProfileScreen.web.tsx:106
- real_data: /workspace/principal -> admin.approveLeave [facade,orpc-rpc:served]; /workspace/principal -> admin.getPendingLeaves [facade,orpc-rpc:served]; /workspace/principal -> admin.submitLeave [orpc-rpc:served]; /workspace/principal -> supabase .from('staff_leaves') @ packages/people/src/staff.ts:80
- ungated_mock: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx:19 'demo-school'; packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample

### academic-cycles — PARTIAL
- Hostile verdict: Screen without API; Term/Subject models unreferenced by API.
- schema: AcademicCycle @ packages/schema/schema.zmodel:1427 (table academic_cycles); Term @ packages/schema/schema.zmodel:1455 (table academic_terms); GradeClass @ packages/schema/schema.zmodel:1549 (table grade_classes); Subject @ packages/schema/schema.zmodel:1505 (table academic_subjects); GradeLevel @ packages/schema/schema.zmodel:1529 (table academic_grade_levels); GradeClassSubject @ packages/schema/schema.zmodel:1576 (table grade_class_subjects)
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx
- nav: /workspace/principal <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:98, packages/admin/src/screens/SchoolProfileScreen.web.tsx:106
- ungated_mock: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx:19 'demo-school'; packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample

### school-onboarding — PARTIAL
- Hostile verdict: Downgraded from LIVE: onboarding.createFounderSchoolBond call site is REST (unserved); rest of bootstrap served.
- schema: InviteCode @ packages/schema/schema.zmodel:770 (table invite_codes); SchoolInviteCode @ packages/schema/schema.zmodel:1963 (table school_invite_codes); SchoolJoinRequest @ packages/schema/schema.zmodel:795 (table school_join_requests); SchoolRegistryClaim @ packages/schema/schema.zmodel:817 (table school_registry_claims); Bond @ packages/schema/schema.zmodel:151 (table bonds)
- api: onboarding.createInitialBond @ apps/sanctuary-api/src/core/handlers/onboarding.ts:21 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; onboarding.completeOnboarding @ apps/sanctuary-api/src/core/handlers/onboarding.ts:207 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; onboarding.createFounderSchoolBond @ apps/sanctuary-api/src/core/handlers/onboarding.ts:260 [hono-rest:NO-SERVER-MOUNT]; onboarding.revokeSchoolBond @ apps/sanctuary-api/src/core/handlers/onboarding.ts:314 [NO-CLIENT]; identity.identifyActiveCitizen @ apps/sanctuary-api/src/core/handlers/identity.ts:22 [orpc-rpc:served]; identity.capabilityBootstrap @ apps/sanctuary-api/src/core/handlers/identity.ts:38 [NO-CLIENT]; identity.fetchUserProfile @ apps/sanctuary-api/src/core/handlers/identity.ts:112 [orpc-rpc:served]; identity.selectActiveScope @ apps/sanctuary-api/src/core/handlers/identity.ts:133 [NO-CLIENT]; identity.resolveWorkspaceContext @ apps/sanctuary-api/src/core/handlers/identity.ts:173 [orpc-rpc:served]; identity.modifyUserProfile @ apps/sanctuary-api/src/core/handlers/identity.ts:217 [orpc-rpc:served]
- client: onboarding.createInitialBond <- packages/core/src/api/onboarding.ts:54; onboarding.completeOnboarding <- packages/core/src/api/onboarding.ts:78; onboarding.createFounderSchoolBond <- packages/core/src/api/onboarding.ts:90; identity.identifyActiveCitizen <- packages/core/src/api/identity.ts:62; identity.fetchUserProfile <- packages/core/src/api/identity.ts:82; identity.resolveWorkspaceContext <- packages/core/src/api/identity.ts:106; identity.modifyUserProfile <- packages/core/src/api/identity.ts:98
- screen: apps/gurudevi-mobile/app/invitation-welcome.tsx; apps/gurudevi-mobile/app/onboarding.tsx; apps/gurudevi-mobile/app/qr.tsx; apps/gurudevi-web/app/(sanctuary)/c/[code]/page.tsx; apps/gurudevi-web/app/(sanctuary)/onboarding/page.tsx
- nav: /onboarding <- apps/gurudevi-mobile/app/welcome.tsx:38; /qr <- apps/gurudevi-mobile/src/components/web/CommandPalette.web.tsx:187, apps/gurudevi-mobile/src/providers/PushNotificationProvider.tsx:62; /onboarding <- apps/gurudevi-web/app/(sanctuary)/self/page.tsx:34, apps/gurudevi-web/app/(sanctuary)/sign-up/SignUpForm.tsx:41
- real_data: /invitation-welcome -> identity.fetchUserProfile [orpc-rpc:served]; /invitation-welcome -> identity.identifyActiveCitizen [orpc-rpc:served]; /invitation-welcome -> identity.modifyUserProfile [orpc-rpc:served]; /invitation-welcome -> identity.resolveWorkspaceContext [orpc-rpc:served]; /invitation-welcome -> onboarding.completeOnboarding [orpc-rpc:served]; /invitation-welcome -> onboarding.createInitialBond [orpc-rpc:served]
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### guardian-workspace — PARTIAL
- Hostile verdict: guardianServices -> packages/core/src/adapters/supabase/guardianRepository.ts reads guardian_identities/guardian_notifications/school_events: no such table in any *.sql migration nor schema.zmodel. Also 'parent' capacity falls through to classroom-list (apps/gurudevi-mobile/src/lib/workspace/routeResolution.ts); only 'guardian' reaches it.
- schema: StudentGuardianRelationship @ packages/schema/schema.zmodel:1851 (table student_guardian_relationships); GuardianAssessmentPermission @ packages/schema/schema.zmodel:1867 (table guardian_assessment_permissions); GuardianAssessmentReadAuditEvent @ packages/schema/schema.zmodel:1881 (table guardian_assessment_read_audit_events); GuardianBond @ packages/schema/schema.zmodel:1943 (table guardian_bonds)
- api: guardianAssessment.getPublishedAssessmentSummary @ apps/sanctuary-api/src/core/handlers/guardianAssessment.ts:13 [orpc-rpc:served]
- client: guardianAssessment.getPublishedAssessmentSummary <- packages/core/src/api/guardian.ts:72
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/guardian.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/guardian/[studentId].tsx; apps/gurudevi-mobile/app/(tabs)/workspace/guardian/bridge.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/guardian/events.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/guardian/notifications.tsx; apps/gurudevi-mobile/app/(tabs)/workspace/guardian/students.tsx
- nav: /workspace/guardian <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:101; /workspace/guardian/[studentId] <- packages/admin/src/screens/GuardianDashboard.tsx:82, packages/admin/src/screens/GuardianDashboard.tsx:95; /workspace/guardian/bridge <- packages/admin/src/screens/GuardianDashboard.tsx:154; /workspace/guardian/events <- packages/admin/src/screens/GuardianDashboard.tsx:124, packages/admin/src/screens/GuardianDashboard.tsx:149

### founder-dashboard — PARTIAL
- Hostile verdict: Supabase founderRepository rpc get_ecosystem_stats (exists in migrations 20260308000001/20260315000000); not via API; no zmodel. Real-but-unaudited.
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/founder.tsx
- nav: /workspace/founder <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:95
- ungated_mock: packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample

### school-forest — UI-UNWIRED
- Hostile verdict: Screen unrouted; schoolForest.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).
- schema: GratitudeGift @ packages/schema/schema.zmodel:1397 (table gratitude_gifts)
- api: schoolForest.getForestOverview @ apps/sanctuary-api/src/core/handlers/schoolForest.ts:302 [hono-rest:NO-SERVER-MOUNT]; schoolForest.getSchoolPulse @ apps/sanctuary-api/src/core/handlers/schoolForest.ts:308 [hono-rest:NO-SERVER-MOUNT]; schoolForest.sendGratitudeGift @ apps/sanctuary-api/src/core/handlers/schoolForest.ts:314 [hono-rest:NO-SERVER-MOUNT]; schoolForest.getPendingGifts @ apps/sanctuary-api/src/core/handlers/schoolForest.ts:349 [hono-rest:NO-SERVER-MOUNT]; schoolForest.markGiftDelivered @ apps/sanctuary-api/src/core/handlers/schoolForest.ts:363 [hono-rest:NO-SERVER-MOUNT]
- client: schoolForest.getForestOverview <- packages/core/src/api/schoolForest.ts:35; schoolForest.getSchoolPulse <- packages/core/src/api/schoolForest.ts:51; schoolForest.sendGratitudeGift <- packages/core/src/api/schoolForest.ts:64; schoolForest.getPendingGifts <- packages/core/src/api/schoolForest.ts:73; schoolForest.markGiftDelivered <- packages/core/src/api/schoolForest.ts:84

### admin-console — UI-UNWIRED
- Hostile verdict: Downgraded: screens exist but no route/nav; 'admin' capacity falls through to classroom-list.
- schema: SentinelAuditLog @ packages/schema/schema.zmodel:2195 (table sentinel_audit_logs); FeatureFlag @ packages/schema/schema.zmodel:2210 (table feature_flags)
- api: admin.getStaffPresence @ apps/sanctuary-api/src/core/handlers/admin.ts:38 [orpc-rpc:served]; admin.getTeacherCarousel @ apps/sanctuary-api/src/core/handlers/admin.ts:55 [orpc-rpc:served]; admin.submitLeave @ apps/sanctuary-api/src/core/handlers/admin.ts:86 [orpc-rpc:served]; admin.getSchool @ apps/sanctuary-api/src/core/handlers/admin.ts:100 [NO-CLIENT]; admin.getPendingLeaves @ apps/sanctuary-api/src/core/handlers/admin.ts:115 [orpc-rpc:served]; admin.approveLeave @ apps/sanctuary-api/src/core/handlers/admin.ts:125 [orpc-rpc:served]; admin.getUpcomingCalendarEvents @ apps/sanctuary-api/src/core/handlers/admin.ts:136 [orpc-rpc:served]; admin.createCalendarEvent @ apps/sanctuary-api/src/core/handlers/admin.ts:150 [orpc-rpc:served]
- client: admin.getStaffPresence <- packages/core/src/api/staffManagement.ts:54; admin.getTeacherCarousel <- packages/core/src/api/staffManagement.ts:61; admin.submitLeave <- packages/core/src/api/staffManagement.ts:75; admin.getPendingLeaves <- packages/core/src/api/staffManagement.ts:89; admin.approveLeave <- packages/core/src/api/staffManagement.ts:93; admin.getUpcomingCalendarEvents <- packages/core/src/api/staffManagement.ts:106; admin.createCalendarEvent <- packages/core/src/api/staffManagement.ts:123

### editorial — LIVE
- Hostile verdict: oRPC served, raw SQL.
- api: editorial.listMine @ apps/sanctuary-api/src/core/handlers/editorial.ts:124 [orpc-rpc:served]; editorial.listForReview @ apps/sanctuary-api/src/core/handlers/editorial.ts:136 [orpc-rpc:served]; editorial.submit @ apps/sanctuary-api/src/core/handlers/editorial.ts:150 [orpc-rpc:served]; editorial.reviewSubmission @ apps/sanctuary-api/src/core/handlers/editorial.ts:187 [orpc-rpc:served]; editorial.recordEvent @ apps/sanctuary-api/src/core/handlers/editorial.ts:254 [NO-CLIENT]; editorial.listEvents @ apps/sanctuary-api/src/core/handlers/editorial.ts:275 [orpc-rpc:served]; editorial.recordDelivery @ apps/sanctuary-api/src/core/handlers/editorial.ts:287 [NO-CLIENT]; editorial.listRightsAgreements @ apps/sanctuary-api/src/core/handlers/editorial.ts:339 [orpc-rpc:served]; editorial.listDeliveries @ apps/sanctuary-api/src/core/handlers/editorial.ts:353 [orpc-rpc:served]; editorial.createRightsAgreement @ apps/sanctuary-api/src/core/handlers/editorial.ts:368 [orpc-rpc:served]; editorial.listAuthorProfiles @ apps/sanctuary-api/src/core/handlers/editorial.ts:395 [orpc-rpc:served]; editorial.createAuthorProfile @ apps/sanctuary-api/src/core/handlers/editorial.ts:409 [orpc-rpc:served]
- client: editorial.listMine <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:115; editorial.listForReview <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:114; editorial.submit <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:207; editorial.reviewSubmission <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:318; editorial.listEvents <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:123; editorial.listRightsAgreements <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:117; editorial.listDeliveries <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:120; editorial.createRightsAgreement <- apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx:256
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/editorial.tsx; apps/gurudevi-web/app/(marketing)/(editorial)/authors/[id]/page.tsx; apps/gurudevi-web/app/(marketing)/(editorial)/journal/[slug]/page.tsx; apps/gurudevi-web/app/(marketing)/(editorial)/journal/page.tsx
- nav: /workspace/editorial <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:67, apps/gurudevi-mobile/app/(tabs)/_layout.tsx:340; /authors/[id] <- apps/gurudevi-web/app/(marketing)/(editorial)/journal/[slug]/page.tsx:11; /journal/[slug] <- apps/gurudevi-web/app/(marketing)/(editorial)/journal/page.tsx:12, apps/gurudevi-web/app/(marketing)/(editorial)/authors/[id]/page.tsx:12; /journal <- apps/gurudevi-web/app/(marketing)/MarketingFooter.tsx:22, apps/gurudevi-web/app/(marketing)/MarketingHeader.tsx:11
- real_data: /workspace/editorial -> editorial.createAuthorProfile [orpc-rpc:served]; /workspace/editorial -> editorial.createRightsAgreement [orpc-rpc:served]; /workspace/editorial -> editorial.listAuthorProfiles [orpc-rpc:served]; /workspace/editorial -> editorial.listDeliveries [orpc-rpc:served]; /workspace/editorial -> editorial.listEvents [orpc-rpc:served]; /workspace/editorial -> editorial.listForReview [orpc-rpc:served]

### form-builder — PARTIAL
- Hostile verdict: Flag default-off; 5/8 forms sites REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).
- api: forms.create @ apps/sanctuary-api/src/core/handlers/forms.ts:47 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; forms.getById @ apps/sanctuary-api/src/core/handlers/forms.ts:69 [hono-rest:NO-SERVER-MOUNT]; forms.getBySlug @ apps/sanctuary-api/src/core/handlers/forms.ts:81 [hono-rest:NO-SERVER-MOUNT]; forms.getByOwner @ apps/sanctuary-api/src/core/handlers/forms.ts:92 [hono-rest:NO-SERVER-MOUNT]; forms.update @ apps/sanctuary-api/src/core/handlers/forms.ts:104 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]; forms.delete @ apps/sanctuary-api/src/core/handlers/forms.ts:129 [hono-rest:NO-SERVER-MOUNT]; forms.submitResponse @ apps/sanctuary-api/src/core/handlers/forms.ts:138 [hono-rest:NO-SERVER-MOUNT]; forms.getResponses @ apps/sanctuary-api/src/core/handlers/forms.ts:155 [hono-rest:NO-SERVER-MOUNT,orpc-rpc:served]
- client: forms.create <- packages/core/src/api/formTemplates.ts:40; forms.getById <- packages/core/src/api/formTemplates.ts:60; forms.getBySlug <- packages/core/src/api/formTemplates.ts:71; forms.getByOwner <- packages/core/src/api/formTemplates.ts:81; forms.update <- packages/core/src/api/formTemplates.ts:95; forms.delete <- packages/core/src/api/formTemplates.ts:115; forms.submitResponse <- packages/core/src/api/formTemplates.ts:125; forms.getResponses <- packages/core/src/api/formTemplates.ts:137
- screen: apps/gurudevi-mobile/app/public-form/[slug].tsx
- real_data: /public-form/[slug] -> forms.create [orpc-rpc:served]; /public-form/[slug] -> forms.getResponses [orpc-rpc:served]; /public-form/[slug] -> forms.update [orpc-rpc:served]
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### thuthimal — LIVE
- Hostile verdict: Served; claim route via QR deep link by design. Promoted. Caveat: ThuthimalGift vs GratitudeGift overlap.
- schema: ThuthimalGift @ packages/schema/schema.zmodel:1230 (table thuthimal_gifts); GratitudeGift @ packages/schema/schema.zmodel:1397 (table gratitude_gifts); ProGift @ packages/schema/schema.zmodel:2083 (table pro_gifts)
- api: thuthimal.createGift @ apps/sanctuary-api/src/core/handlers/thuthimal.ts:27 [orpc-rpc:served]; thuthimal.claimGift @ apps/sanctuary-api/src/core/handlers/thuthimal.ts:46 [orpc-rpc:served]; thuthimal.getMyGifts @ apps/sanctuary-api/src/core/handlers/thuthimal.ts:85 [orpc-rpc:served]; thuthimal.previewGift @ apps/sanctuary-api/src/core/handlers/thuthimal.ts:95 [orpc-rpc:served]
- client: thuthimal.createGift <- packages/core/src/api/thuthimal.ts:42; thuthimal.claimGift <- packages/core/src/api/thuthimal.ts:58; thuthimal.getMyGifts <- packages/core/src/api/thuthimal.ts:85; thuthimal.previewGift <- packages/core/src/api/thuthimal.ts:95
- screen: apps/gurudevi-mobile/app/(tabs)/profile/index.tsx; apps/gurudevi-mobile/app/thuthimal-claim.tsx
- nav: /profile <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:103, packages/admin/src/screens/PrincipalDashboard.tsx:59; /thuthimal-claim <- packages/scanner-kit/src/screens/QRHandlerScreen.tsx:57, packages/scanner-kit/src/screens/QRHandlerScreen.tsx:72
- real_data: /profile -> thuthimal.claimGift [facade,orpc-rpc:served]; /profile -> thuthimal.createGift [facade,orpc-rpc:served]; /profile -> thuthimal.getMyGifts [orpc-rpc:served]; /profile -> thuthimal.previewGift [orpc-rpc:served]; /thuthimal-claim -> thuthimal.claimGift [facade,orpc-rpc:served]; /thuthimal-claim -> thuthimal.createGift [facade,orpc-rpc:served]
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/components/NotificationSettingsPanel.tsx:60 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### rewards-energy — LIVE
- Hostile verdict: Served and reached. Promoted.
- schema: UserEnergyBalance @ packages/schema/schema.zmodel:2314 (table user_energy_balances); AdRewardTransaction @ packages/schema/schema.zmodel:2336 (table ad_reward_transactions); UserEntitlementGrant @ packages/schema/schema.zmodel:180 (table user_entitlement_grants)
- api: rewards.getRewards @ apps/sanctuary-api/src/core/handlers/rewards.ts:65 [orpc-rpc:served]; rewards.getRewardsHistory @ apps/sanctuary-api/src/core/handlers/rewards.ts:82 [orpc-rpc:served]; rewards.getRewardsAsOf @ apps/sanctuary-api/src/core/handlers/rewards.ts:107 [orpc-rpc:served]; rewards.getRewardsRangeHistory @ apps/sanctuary-api/src/core/handlers/rewards.ts:130 [orpc-rpc:served]; rewards.initializeRewards @ apps/sanctuary-api/src/core/handlers/rewards.ts:183 [orpc-rpc:served]; rewards.addPoints @ apps/sanctuary-api/src/core/handlers/rewards.ts:209 [orpc-rpc:served]; rewards.awardBadge @ apps/sanctuary-api/src/core/handlers/rewards.ts:239 [orpc-rpc:served]; rewards.checkAndAwardAchievements @ apps/sanctuary-api/src/core/handlers/rewards.ts:273 [orpc-rpc:served]; rewards.getWhisperedMoments @ apps/sanctuary-api/src/core/handlers/rewards.ts:336 [NO-CLIENT]
- client: rewards.getRewards <- packages/core/src/api/rewards.ts:7; rewards.getRewardsHistory <- packages/core/src/api/rewards.ts:23; rewards.getRewardsAsOf <- packages/core/src/api/rewards.ts:15; rewards.getRewardsRangeHistory <- packages/core/src/api/rewards.ts:35; rewards.initializeRewards <- packages/core/src/api/rewards.ts:45; rewards.addPoints <- packages/core/src/api/rewards.ts:53; rewards.awardBadge <- packages/core/src/api/rewards.ts:61; rewards.checkAndAwardAchievements <- packages/core/src/api/rewards.ts:72
- screen: apps/gurudevi-mobile/app/(tabs)/profile/index.tsx
- nav: /profile <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:103, packages/admin/src/screens/PrincipalDashboard.tsx:59
- real_data: /profile -> rewards.addPoints [facade,orpc-rpc:served]; /profile -> rewards.awardBadge [facade,orpc-rpc:served]; /profile -> rewards.checkAndAwardAchievements [facade,orpc-rpc:served]; /profile -> rewards.getRewards [facade,orpc-rpc:served]; /profile -> rewards.getRewardsAsOf [facade,orpc-rpc:served]; /profile -> rewards.getRewardsHistory [facade,orpc-rpc:served]
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/components/NotificationSettingsPanel.tsx:60 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### payments — PARTIAL
- Hostile verdict: Math.random ids and pi_demo_secret_demo; nav P.
- schema: PaymentIntent @ packages/schema/schema.zmodel:2100 (table payment_intents); Invoice @ packages/schema/schema.zmodel:2115 (table invoices); Receipt @ packages/schema/schema.zmodel:2133 (table receipts)
- api: erp.getAccounts @ apps/sanctuary-api/src/core/handlers/erp.ts:80 [orpc-rpc:served]; erp.getTransactions @ apps/sanctuary-api/src/core/handlers/erp.ts:86 [NO-CLIENT]; erp.recordTransaction @ apps/sanctuary-api/src/core/handlers/erp.ts:110 [orpc-rpc:served]; erp.createPaymentIntent @ apps/sanctuary-api/src/core/handlers/erp.ts:151 [orpc-rpc:served]; erp.getInvoices @ apps/sanctuary-api/src/core/handlers/erp.ts:197 [orpc-rpc:served]; erp.getReceipt @ apps/sanctuary-api/src/core/handlers/erp.ts:209 [orpc-rpc:served]
- client: erp.getAccounts <- packages/core/src/api/erp.ts:22; erp.recordTransaction <- packages/core/src/api/erp.ts:32; erp.createPaymentIntent <- packages/core/src/api/erp.ts:54; erp.getInvoices <- packages/core/src/api/erp.ts:70; erp.getReceipt <- packages/core/src/api/erp.ts:74
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/demo-fee.tsx
- ungated_mock: apps/gurudevi-mobile/src/screens/DemoFeeScreen.tsx:19 pi_demo_secret_demo

### accounting — UI-UNWIRED
- Hostile verdict: Downgraded: screen not routed (nav N); flag default-off.
- schema: Account @ packages/schema/schema.zmodel:2013 (table accounts); LedgerEntry @ packages/schema/schema.zmodel:2034 (table ledger_entries); FinancialTransaction @ packages/schema/schema.zmodel:2050 (table financial_transactions); Budget @ packages/schema/schema.zmodel:2064 (table budgets)
- api: erp.getAccounts @ apps/sanctuary-api/src/core/handlers/erp.ts:80 [orpc-rpc:served]; erp.getTransactions @ apps/sanctuary-api/src/core/handlers/erp.ts:86 [NO-CLIENT]; erp.recordTransaction @ apps/sanctuary-api/src/core/handlers/erp.ts:110 [orpc-rpc:served]; erp.createPaymentIntent @ apps/sanctuary-api/src/core/handlers/erp.ts:151 [orpc-rpc:served]; erp.getInvoices @ apps/sanctuary-api/src/core/handlers/erp.ts:197 [orpc-rpc:served]; erp.getReceipt @ apps/sanctuary-api/src/core/handlers/erp.ts:209 [orpc-rpc:served]
- client: erp.getAccounts <- packages/core/src/api/erp.ts:22; erp.recordTransaction <- packages/core/src/api/erp.ts:32; erp.createPaymentIntent <- packages/core/src/api/erp.ts:54; erp.getInvoices <- packages/core/src/api/erp.ts:70; erp.getReceipt <- packages/core/src/api/erp.ts:74

### tuition-commercial — PARTIAL
- Hostile verdict: Screen without API.
- schema: TuitionInstitute @ packages/schema/schema.zmodel:1898 (table tuition_institutes); TuitionBatch @ packages/schema/schema.zmodel:1916 (table tuition_batches)
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/commercial/[batchId].tsx
- nav: /workspace/commercial/[batchId] <- apps/gurudevi-mobile/app/(tabs)/_layout.tsx:237, apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:110

### workforce — UI-UNWIRED
- Hostile verdict: Fake success toast; no API.
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/workforce-role.tsx
- ungated_mock: apps/gurudevi-mobile/src/screens/WorkforceRoleScreen.tsx:16 In real implementation

### notifications — UI-UNWIRED
- Hostile verdict: Downgraded: packages/core/src/store/useNotificationStore.ts is never written by any non-test code (only store + hooks/useNotifications.ts); screen always empty. Server-side guardian_notifications table missing.
- schema: Notification @ packages/schema/schema.zmodel:444 (table notifications); PushToken @ packages/schema/schema.zmodel:471 (table user_push_tokens)
- screen: apps/gurudevi-mobile/app/(tabs)/notifications.tsx
- nav: /notifications <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:85, apps/gurudevi-mobile/app/(tabs)/_layout.tsx:357
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### profile — PARTIAL
- Hostile verdict: profile.* procedures uncalled; screens use other paths; web has 'mocked' branch.
- schema: User @ packages/schema/schema.zmodel:21 (table users); UserSocialLink @ packages/schema/schema.zmodel:206 (table user_social_links)
- api: profile.getUserProfile @ apps/sanctuary-api/src/core/handlers/profile.ts:21 [NO-CLIENT]; profile.updateProfile @ apps/sanctuary-api/src/core/handlers/profile.ts:50 [NO-CLIENT]; profile.getJourneySnapshot @ apps/sanctuary-api/src/core/handlers/profile.ts:64 [NO-CLIENT]; profile.getSchoolPulse @ apps/sanctuary-api/src/core/handlers/profile.ts:86 [orpc-rpc:served]; profile.getSocialLinks @ apps/sanctuary-api/src/core/handlers/profile.ts:99 [NO-CLIENT]; profile.upsertSocialLink @ apps/sanctuary-api/src/core/handlers/profile.ts:107 [NO-CLIENT]; profile.deleteSocialLink @ apps/sanctuary-api/src/core/handlers/profile.ts:137 [NO-CLIENT]
- client: profile.getSchoolPulse <- packages/admin/src/hooks/useDashboardHooks.ts:28
- screen: apps/gurudevi-mobile/app/(tabs)/community/profile/[id].tsx; apps/gurudevi-mobile/app/(tabs)/profile/full/[id].tsx; apps/gurudevi-mobile/app/(tabs)/profile/index.tsx; apps/gurudevi-mobile/app/(tabs)/profile/mute-hub.tsx; apps/gurudevi-mobile/app/(tabs)/profile/public/[id].tsx
- nav: /community/profile/[id] <- packages/community/src/screens/GroupChatScreen.tsx:65, packages/community/src/screens/CommunityScreen.tsx:380; /profile/full/[id] <- packages/profile/src/navigation/ProfileNavigationContext.tsx:43; /profile <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:103, packages/admin/src/screens/PrincipalDashboard.tsx:59; /profile/mute-hub <- packages/profile/src/navigation/ProfileNavigationContext.tsx:47
- real_data: /community/profile/[id] -> supabase .from('users') @ packages/community/src/screens/UserPublicProfileScreen.web.tsx:72; /profile/public/[id] -> supabase .from('users') @ packages/community/src/screens/UserPublicProfileScreen.web.tsx:72
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/components/NotificationSettingsPanel.tsx:60 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### ai-assistant — PARTIAL
- Hostile verdict: fetch /api/ai/chat (packages/ai/src/hooks/useAIAgent.ts:214) gated by isAIAssistantEnabled server-side and default-off flag.
- schema: AiMessage @ packages/schema/schema.zmodel:605 (table ai_messages)
- screen: apps/gurudevi-mobile/app/(tabs)/self/ai-assistant.tsx; apps/gurudevi-mobile/app/a-i-assistant.tsx
- nav: /a-i-assistant <- apps/gurudevi-mobile/src/components/web/CommandPalette.web.tsx:175, apps/gurudevi-mobile/src/components/web/CommandPalette.web.tsx:236
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### durable-agents — PARTIAL
- Hostile verdict: Plain Hono routes mounted; UI reachable; admin-ish, no role gate verified.
- screen: apps/gurudevi-mobile/app/durable-agents.tsx
- nav: /durable-agents <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:76

### tracking-history — BACKEND-ONLY
- Hostile verdict: tracking/history REST hc client path has no server mount since e383ef01 (2026-07-30 08:03); route has no inbound link.
- api: tracking.listExploredFeatures @ apps/sanctuary-api/src/core/handlers/tracking.ts:24 [hono-rest:NO-SERVER-MOUNT]; tracking.logFeatureUsage @ apps/sanctuary-api/src/core/handlers/tracking.ts:35 [hono-rest:NO-SERVER-MOUNT]; history.getCollectionMembershipTimeline @ apps/sanctuary-api/src/core/handlers/history.ts:12 [hono-rest:NO-SERVER-MOUNT]; history.getCollectionMembershipAsOf @ apps/sanctuary-api/src/core/handlers/history.ts:48 [hono-rest:NO-SERVER-MOUNT]; history.getLibraryEntityHistory @ apps/sanctuary-api/src/core/handlers/history.ts:80 [hono-rest:NO-SERVER-MOUNT]; history.getCommunityEntityHistory @ apps/sanctuary-api/src/core/handlers/history.ts:126 [hono-rest:NO-SERVER-MOUNT]; history.getClassroomNoteHistory @ apps/sanctuary-api/src/core/handlers/history.ts:204 [hono-rest:NO-SERVER-MOUNT]
- client: tracking.listExploredFeatures <- packages/core/src/api/tracking.ts:30; tracking.logFeatureUsage <- packages/core/src/api/tracking.ts:14; history.getCollectionMembershipTimeline <- packages/core/src/api/history.ts:126; history.getCollectionMembershipAsOf <- packages/core/src/api/history.ts:143; history.getLibraryEntityHistory <- packages/core/src/api/history.ts:111; history.getCommunityEntityHistory <- packages/core/src/api/history.ts:95; history.getClassroomNoteHistory <- packages/core/src/api/history.ts:81

### agent-status — BACKEND-ONLY
- Hostile verdict: REST hc client path has no server mount since e383ef01 (2026-07-30 08:03); no screen.
- api: agent.getSystemStatus @ apps/sanctuary-api/src/core/handlers/agent.ts:16 [hono-rest:NO-SERVER-MOUNT]
- client: agent.getSystemStatus <- packages/core/src/api/agent.ts:9

### edlove-atlas-web — PARTIAL
- Hostile verdict: apps/edlove-web/app/api/atlas/route.ts:69-76 opens a local SQLite atlas_staging.db (default c:/x/data/...); file not in repo -> real data exists only on Naveen's machine.
- schema: SchoolRegistry @ packages/schema/schema.zmodel:2248 (table school_registry); EduSchool @ packages/schema/schema.zmodel:2278 (table edu_schools); WebEvidenceCache @ packages/schema/schema.zmodel:1987 (table web_evidence_cache)
- screen: apps/edlove-web/app/atlas/page.tsx; apps/edlove-web/app/atlas/school/[census_no]/page.tsx
- nav: /atlas <- apps/edlove-web/app/page.tsx:134, apps/edlove-web/app/layout.tsx:127; /atlas/school/[census_no] <- apps/edlove-web/app/atlas/page.tsx:944, apps/edlove-web/app/atlas/page.tsx:5582

### gurudevi-web-sanctuary — PARTIAL
- Hostile verdict: Web shell; inherits per-feature transport breaks.
- screen: apps/gurudevi-web/app/(sanctuary)/auth/callback/page.tsx; apps/gurudevi-web/app/(sanctuary)/c/[code]/page.tsx; apps/gurudevi-web/app/(sanctuary)/community/page.tsx; apps/gurudevi-web/app/(sanctuary)/explore/community/page.tsx; apps/gurudevi-web/app/(sanctuary)/explore/library/page.tsx; apps/gurudevi-web/app/(sanctuary)/explore/notifications/page.tsx; apps/gurudevi-web/app/(sanctuary)/explore/page.tsx; apps/gurudevi-web/app/(sanctuary)/explore/profile/page.tsx
- nav: /community <- apps/gurudevi-web/app/(sanctuary)/sanctuary-nav.ts:24; /explore/self <- apps/gurudevi-web/app/(marketing)/page.tsx:142, apps/gurudevi-web/app/(marketing)/MarketingFooter.tsx:31; /library <- apps/gurudevi-web/app/(sanctuary)/sanctuary-nav.ts:25; /onboarding <- apps/gurudevi-web/app/(sanctuary)/self/page.tsx:34, apps/gurudevi-web/app/(sanctuary)/sign-up/SignUpForm.tsx:41
- ungated_mock: apps/gurudevi-web/app/(sanctuary)/community/CommunityFeedFloor.tsx:277 focusedCircleFeedMock; apps/gurudevi-web/lib/sanctuary/selfExplore.ts:134 'sample-fire-journal-entry'; apps/gurudevi-web/lib/sanctuary/selfExplore.ts:146 'sample-mood-lotus-entry'; packages/core/src/lib/persistenceBoundary.ts:110 'demo-local-only'; packages/core/src/lib/persistenceBoundary.ts:33 'demo-local-only'

### teacher-platform — LOST
- Hostile verdict: Gone from main.

### teacher-planner — LOST
- Hostile verdict: Gone from main.

### trube-lab — LOST
- Hostile verdict: Gone from main.

### rn-terrain — LOST
- Hostile verdict: Gone from main.

### neevsk-intuitui-web — LOST
- Hostile verdict: Gone from main.

### gurudevi-webapp — LOST
- Hostile verdict: Gone from main.

### legacy-web-api-docs — LOST
- Hostile verdict: Gone from main.

### grade-section-head-views — PARTIAL
- Hostile verdict: Routes with no inbound link (nav P); no own data.

### auth-identity — LIVE
- Hostile verdict: NEW. Supabase auth + identity procs served; demo mode is user-chosen (IdentityInitialState.tsx:327).
- schema: User @ packages/schema/schema.zmodel:21 (table users); Bond @ packages/schema/schema.zmodel:151 (table bonds); PersonalClassroom @ packages/schema/schema.zmodel:271 (table personal_classrooms)
- api: identity.identifyActiveCitizen @ apps/sanctuary-api/src/core/handlers/identity.ts:22 [orpc-rpc:served]; identity.capabilityBootstrap @ apps/sanctuary-api/src/core/handlers/identity.ts:38 [NO-CLIENT]; identity.fetchUserProfile @ apps/sanctuary-api/src/core/handlers/identity.ts:112 [orpc-rpc:served]; identity.selectActiveScope @ apps/sanctuary-api/src/core/handlers/identity.ts:133 [NO-CLIENT]; identity.resolveWorkspaceContext @ apps/sanctuary-api/src/core/handlers/identity.ts:173 [orpc-rpc:served]; identity.modifyUserProfile @ apps/sanctuary-api/src/core/handlers/identity.ts:217 [orpc-rpc:served]; authorization.refresh @ apps/sanctuary-api/src/core/handlers/permissionSnapshot.ts:11 [NO-CLIENT]
- client: identity.identifyActiveCitizen <- packages/core/src/api/identity.ts:62; identity.fetchUserProfile <- packages/core/src/api/identity.ts:82; identity.resolveWorkspaceContext <- packages/core/src/api/identity.ts:106; identity.modifyUserProfile <- packages/core/src/api/identity.ts:98
- screen: apps/gurudevi-mobile/app/account-recovery.tsx; apps/gurudevi-mobile/app/auth.tsx; apps/gurudevi-mobile/app/auth/callback.tsx; apps/gurudevi-mobile/app/index.tsx; apps/gurudevi-mobile/app/welcome.tsx; apps/gurudevi-web/app/(sanctuary)/auth/callback/page.tsx; apps/gurudevi-web/app/(sanctuary)/recovery/page.tsx; apps/gurudevi-web/app/(sanctuary)/reset-password/page.tsx
- nav: /auth <- apps/gurudevi-mobile/src/entry/GuestPersistenceNotice.tsx:67, apps/gurudevi-mobile/app/welcome.tsx:31; /welcome <- apps/gurudevi-mobile/src/entry/SessionRouteGate.tsx:78, apps/gurudevi-mobile/app/account-recovery.tsx:28; /recovery <- apps/gurudevi-web/app/(sanctuary)/auth/SignInForm.tsx:100; /sign-in <- apps/gurudevi-web/app/(sanctuary)/auth/RecoveryForm.tsx:44, apps/gurudevi-web/app/(sanctuary)/sign-up/page.tsx:27
- real_data: /account-recovery -> identity.fetchUserProfile [orpc-rpc:served]; /account-recovery -> identity.identifyActiveCitizen [orpc-rpc:served]; /account-recovery -> identity.modifyUserProfile [orpc-rpc:served]; /account-recovery -> identity.resolveWorkspaceContext [orpc-rpc:served]; /account-recovery -> PowerSync (packages/core/src/accounts/accountTransition.ts); /auth -> identity.fetchUserProfile [orpc-rpc:served]
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### offline-sync — BACKEND-ONLY
- Hostile verdict: NEW. PowerSync + sync registry infra; logMood queue entry uses unserved REST (registry.ts:94).
- api: sync.getMutationReceipt @ apps/sanctuary-api/src/core/handlers/sync.ts:9 [orpc-rpc:served]; sync.uploadBatch @ apps/sanctuary-api/src/core/handlers/sync.ts:40 [orpc-rpc:served]
- client: sync.getMutationReceipt <- apps/gurudevi-mobile/src/lib/inngestEvents.ts:70; sync.uploadBatch <- packages/core/src/lib/sync/registry.ts:54

### app-settings — PARTIAL
- Hostile verdict: NEW. Settings screens real (local+Supabase), but dead /trube-lab link.
- schema: UserPreferences @ packages/schema/schema.zmodel:1023 (table user_preferences)
- screen: apps/gurudevi-mobile/app/(modal)/app-settings.tsx; apps/gurudevi-mobile/app/(tabs)/profile/settings.tsx; apps/gurudevi-mobile/app/(tabs)/settings.tsx
- nav: /settings <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:94, apps/gurudevi-mobile/app/(tabs)/_layout.tsx:401
- real_data: /settings -> PowerSync (packages/core/src/accounts/accountTransition.ts)
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:209 'demo-principal'; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:214 'demo-founder'

### lessons-materials — UI-UNWIRED
- Hostile verdict: NEW. Screens exist; educational notes/materials procs have zero client sites.
- schema: Lesson @ packages/schema/schema.zmodel:645 (table lessons); Material @ packages/schema/schema.zmodel:666 (table lesson_materials)
- api: educational.getClassroomResources @ apps/sanctuary-api/src/core/handlers/educational.ts:235 [hono-rest:NO-SERVER-MOUNT]; educational.createLesson @ apps/sanctuary-api/src/core/handlers/educational.ts:254 [hono-rest:NO-SERVER-MOUNT]; educational.getMaterials @ apps/sanctuary-api/src/core/handlers/educational.ts:431 [NO-CLIENT]; educational.getLessonMaterials @ apps/sanctuary-api/src/core/handlers/educational.ts:438 [NO-CLIENT]; educational.createMaterial @ apps/sanctuary-api/src/core/handlers/educational.ts:447 [NO-CLIENT]; educational.updateMaterial @ apps/sanctuary-api/src/core/handlers/educational.ts:463 [NO-CLIENT]; educational.deleteMaterial @ apps/sanctuary-api/src/core/handlers/educational.ts:478 [NO-CLIENT]
- client: educational.getClassroomResources <- packages/core/src/api/resources.ts:20; educational.createLesson <- packages/core/src/api/classroom.ts:22
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61
- ungated_mock: packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample; packages/classroom/src/components/ClassroomList.tsx:93 'sample-c1'; packages/classroom/src/components/ClassroomList.tsx:94 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:96 is_sample

### classroom-notes — UI-UNWIRED
- Hostile verdict: NEW. Screen exists; notes procs uncalled / REST only.
- schema: ClassroomNote @ packages/schema/schema.zmodel:2147 (table classroom_notes)
- api: educational.getClassroomNotes @ apps/sanctuary-api/src/core/handlers/educational.ts:344 [NO-CLIENT]; educational.getClassroomNoteSnapshot @ apps/sanctuary-api/src/core/handlers/educational.ts:356 [NO-CLIENT]; educational.getClassroomNoteTimeline @ apps/sanctuary-api/src/core/handlers/educational.ts:374 [NO-CLIENT]; educational.createClassroomNote @ apps/sanctuary-api/src/core/handlers/educational.ts:383 [NO-CLIENT]; educational.updateClassroomNote @ apps/sanctuary-api/src/core/handlers/educational.ts:400 [NO-CLIENT]; educational.deleteClassroomNote @ apps/sanctuary-api/src/core/handlers/educational.ts:416 [NO-CLIENT]; history.getClassroomNoteHistory @ apps/sanctuary-api/src/core/handlers/history.ts:204 [hono-rest:NO-SERVER-MOUNT]
- client: history.getClassroomNoteHistory <- packages/core/src/api/history.ts:81
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/classroom/[classroomId]/index.tsx
- nav: /workspace/classroom/[classroomId] <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:139, packages/classroom/src/screens/StudentDashboard.web.tsx:61
- ungated_mock: packages/classroom/src/components/ClassroomList.tsx:2 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:423 is_sample; packages/classroom/src/components/ClassroomList.tsx:82 is_sample; packages/classroom/src/components/ClassroomList.tsx:86 'sample-school-1'; packages/classroom/src/components/ClassroomList.tsx:87 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:89 is_sample; packages/classroom/src/components/ClassroomList.tsx:93 'sample-c1'; packages/classroom/src/components/ClassroomList.tsx:94 MOCK_CLASSROOMS; packages/classroom/src/components/ClassroomList.tsx:96 is_sample

### growth-ripples — UI-UNWIRED
- Hostile verdict: NEW. Screen; procs have no client site (client N).
- schema: GrowthEvent @ packages/schema/schema.zmodel:1286 (table growth_events); ImpactRipple @ packages/schema/schema.zmodel:1251 (table impact_ripples); WhisperedMoment @ packages/schema/schema.zmodel:1271 (table whispered_moments); UserGrowthState @ packages/schema/schema.zmodel:1303 (table user_growth_state); SanctuaryManifesto @ packages/schema/schema.zmodel:1336 (table sanctuary_manifestos); ManifestoEndorsement @ packages/schema/schema.zmodel:1358 (table manifesto_endorsements)
- api: rewards.getWhisperedMoments @ apps/sanctuary-api/src/core/handlers/rewards.ts:336 [NO-CLIENT]
- screen: apps/gurudevi-mobile/app/(tabs)/profile/index.tsx; apps/gurudevi-mobile/app/(tabs)/self/index.tsx
- nav: /profile <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:103, packages/admin/src/screens/PrincipalDashboard.tsx:59; /self <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:49, apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts:169
- ungated_mock: packages/core/src/native/guestDataSync.ts:119 Math.random().toString; packages/core/src/native/guestDataSync.ts:139 Math.random().toString; packages/core/src/native/guestDataSync.ts:158 Math.random().toString; packages/core/src/native/guestDataSync.ts:94 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:171 Math.random().toString; packages/self/src/api/wellbeingRepository.ts:99 Math.random().toString; packages/self/src/components/ReframeWizard.tsx:76 Math.random().toString; packages/self/src/components/VoiceJournaling.tsx:252 mock-uri; packages/ui/src/components/NotificationSettingsPanel.tsx:60 Math.random().toString; packages/ui/src/screens/WorkspaceCanvasDemo.tsx:204 'demo-teacher'

### calendar-events — LIVE
- Hostile verdict: NEW. Calendar procs served and reached.
- schema: CalendarEvent @ packages/schema/schema.zmodel:1829 (table calendar_events)
- api: admin.getUpcomingCalendarEvents @ apps/sanctuary-api/src/core/handlers/admin.ts:136 [orpc-rpc:served]; admin.createCalendarEvent @ apps/sanctuary-api/src/core/handlers/admin.ts:150 [orpc-rpc:served]
- client: admin.getUpcomingCalendarEvents <- packages/core/src/api/staffManagement.ts:106; admin.createCalendarEvent <- packages/core/src/api/staffManagement.ts:123
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx
- nav: /workspace/principal <- apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:98, packages/admin/src/screens/SchoolProfileScreen.web.tsx:106
- real_data: /workspace/principal -> admin.createCalendarEvent [facade,orpc-rpc:served]; /workspace/principal -> admin.getUpcomingCalendarEvents [facade,orpc-rpc:served]
- ungated_mock: apps/gurudevi-mobile/app/(tabs)/workspace/principal.tsx:19 'demo-school'; packages/admin/src/bridge/founderWorkspace.ts:1 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:171 MOCK_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 MOCK_SCHOOL_STATS; packages/admin/src/bridge/founderWorkspace.ts:328 is_sample

### edlove-public-site — LIVE
- Hostile verdict: NEW. Static marketing site (no data needed).
- screen: apps/edlove-web/app/cosmos/[slug]/page.tsx; apps/edlove-web/app/cosmos/page.tsx; apps/edlove-web/app/focus/page.tsx; apps/edlove-web/app/innovations/[slug]/page.tsx; apps/edlove-web/app/innovations/page.tsx; apps/edlove-web/app/page.tsx; apps/edlove-web/app/pedagogy/[slug]/page.tsx; apps/edlove-web/app/pedagogy/page.tsx
- nav: /cosmos/[slug] <- apps/edlove-web/app/cosmos/page.tsx:35; /cosmos <- apps/edlove-web/app/page.tsx:40, apps/edlove-web/app/cosmos/[slug]/page.tsx:39; /focus <- apps/edlove-web/app/page.tsx:46, apps/edlove-web/app/components/HeaderNav.tsx:9; /innovations/[slug] <- apps/edlove-web/app/innovations/page.tsx:53

### gurudevi-marketing-legal — LIVE
- Hostile verdict: NEW. Static marketing/legal pages.
- screen: apps/gurudevi-web/app/(marketing)/(info)/faq/page.tsx; apps/gurudevi-web/app/(marketing)/(info)/thuthimal/page.tsx; apps/gurudevi-web/app/(marketing)/(legal)/delete-account/page.tsx; apps/gurudevi-web/app/(marketing)/(legal)/privacy/page.tsx; apps/gurudevi-web/app/(marketing)/(legal)/terms/page.tsx; apps/gurudevi-web/app/(marketing)/(support)/support/page.tsx; apps/gurudevi-web/app/(marketing)/about/page.tsx; apps/gurudevi-web/app/(marketing)/page.tsx
- nav: /faq <- apps/gurudevi-web/app/(marketing)/MarketingFooter.tsx:23, apps/gurudevi-web/app/(marketing)/MarketingHeader.tsx:12; /thuthimal <- apps/gurudevi-web/app/(marketing)/MarketingFooter.tsx:25; /delete-account <- apps/gurudevi-web/app/(marketing)/MarketingFooter.tsx:45, apps/gurudevi-web/app/(marketing)/(legal)/privacy/page.tsx:40; /privacy <- apps/gurudevi-web/app/(marketing)/MarketingFooter.tsx:44

### dev-labs — PARTIAL
- Hostile verdict: NEW. Dev/lab routes shipped in app router; no data, should be gated.
- screen: apps/edlove-web/app/font-lab/page.tsx; apps/gurudevi-mobile/app/icon-lab.tsx; apps/gurudevi-mobile/app/icon-lab.web.tsx; apps/gurudevi-mobile/app/ui-showcase.tsx
- nav: /icon-lab <- packages/ui/src/screens/AppSettingsScreen.shared.tsx:610; /icon-lab <- packages/ui/src/screens/AppSettingsScreen.shared.tsx:610

### workspace-dispatch — PARTIAL
- Hostile verdict: NEW. routeResolution.ts maps founder/principal/guardian/student; parent+admin fall through to classroom-list.
- schema: PersonalClassroom @ packages/schema/schema.zmodel:271 (table personal_classrooms)
- screen: apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx
- nav: /workspace <- apps/gurudevi-mobile/src/lib/navigation/appNavigation.ts:40, apps/gurudevi-mobile/app/(tabs)/_layout.tsx:470

### pricing-manifest — BACKEND-ONLY
- Hostile verdict: NEW. Pricing/plan schema+config, no screen.
- schema: PricingManifest @ packages/schema/schema.zmodel:2238 (table pricing_manifest)

## Capabilities per feature (v2)

See capabilities.yaml, UI_COVERAGE.md and TODO_MASTER.md.

| feature | v1 status | capabilities | LIVE | PARTIAL | UI-UNWIRED | BACKEND-ONLY |
|---|---|---|---|---|---|---|
| library-browse | LIVE | 62 | 21 | 3 | 5 | 0 |
| library-curation-review | PARTIAL | 4 | 3 | 0 | 1 | 0 |
| library-tools | PARTIAL | 11 | 6 | 0 | 2 | 0 |
| cosmic-map | PARTIAL | 13 | 0 | 3 | 1 | 0 |
| self-wellbeing | PARTIAL | 60 | 22 | 14 | 2 | 5 |
| decision-journal | LIVE | 20 | 2 | 0 | 3 | 1 |
| learning-reflections | PARTIAL | 15 | 7 | 1 | 3 | 0 |
| daily-wisdom | PARTIAL | 3 | 0 | 0 | 3 | 0 |
| warm-mirror | PARTIAL | 1 | 0 | 0 | 1 | 0 |
| privacy-ledger | LIVE | 2 | 1 | 0 | 1 | 0 |
| community-feed | PARTIAL | 68 | 8 | 19 | 7 | 1 |
| direct-messages | LIVE | 11 | 5 | 1 | 2 | 0 |
| messaging-router | BACKEND-ONLY | 4 | 0 | 0 | 4 | 0 |
| presence | BACKEND-ONLY | 4 | 0 | 0 | 2 | 0 |
| sacred-missions | LIVE | 11 | 3 | 0 | 1 | 0 |
| announcements | LIVE | 21 | 4 | 6 | 0 | 0 |
| classroom-core | PARTIAL | 70 | 3 | 3 | 15 | 4 |
| attendance | LIVE | 17 | 2 | 1 | 5 | 1 |
| teacher-attendance | BACKEND-ONLY | 0 | 0 | 0 | 0 | 0 |
| gradebook | PARTIAL | 35 | 0 | 0 | 10 | 1 |
| assignments | PARTIAL | 24 | 2 | 0 | 2 | 6 |
| student-goals | UI-UNWIRED | 4 | 0 | 0 | 1 | 0 |
| student-potential | LIVE | 5 | 2 | 0 | 1 | 0 |
| longitudinal-profile | LIVE | 6 | 2 | 0 | 0 | 0 |
| classroom-echoes | PARTIAL | 6 | 0 | 0 | 6 | 0 |
| inventory | PARTIAL | 8 | 1 | 4 | 1 | 0 |
| principal-workspace | PARTIAL | 11 | 6 | 0 | 3 | 1 |
| principal-notes | LIVE | 2 | 0 | 0 | 2 | 0 |
| staff-leave | LIVE | 6 | 5 | 0 | 0 | 0 |
| academic-cycles | PARTIAL | 16 | 0 | 0 | 4 | 0 |
| school-onboarding | PARTIAL | 38 | 14 | 5 | 8 | 3 |
| guardian-workspace | PARTIAL | 18 | 6 | 0 | 5 | 1 |
| founder-dashboard | PARTIAL | 11 | 0 | 0 | 0 | 0 |
| school-forest | UI-UNWIRED | 5 | 0 | 0 | 5 | 0 |
| admin-console | UI-UNWIRED | 0 | 0 | 0 | 0 | 0 |
| editorial | LIVE | 16 | 13 | 1 | 0 | 2 |
| form-builder | PARTIAL | 17 | 0 | 0 | 8 | 0 |
| thuthimal | LIVE | 5 | 2 | 0 | 2 | 0 |
| rewards-energy | LIVE | 9 | 8 | 0 | 1 | 0 |
| payments | PARTIAL | 8 | 0 | 0 | 4 | 0 |
| accounting | UI-UNWIRED | 9 | 0 | 0 | 4 | 1 |
| tuition-commercial | PARTIAL | 7 | 1 | 0 | 2 | 0 |
| workforce | UI-UNWIRED | 1 | 0 | 0 | 1 | 0 |
| notifications | UI-UNWIRED | 9 | 4 | 0 | 0 | 0 |
| profile | PARTIAL | 46 | 10 | 1 | 6 | 7 |
| ai-assistant | PARTIAL | 12 | 0 | 0 | 0 | 1 |
| durable-agents | PARTIAL | 1 | 1 | 0 | 0 | 0 |
| tracking-history | BACKEND-ONLY | 7 | 0 | 0 | 6 | 0 |
| agent-status | BACKEND-ONLY | 1 | 0 | 0 | 1 | 0 |
| edlove-atlas-web | PARTIAL | 3 | 2 | 0 | 1 | 0 |
| gurudevi-web-sanctuary | PARTIAL | 16 | 5 | 0 | 10 | 0 |
| teacher-platform | LOST | 0 | 0 | 0 | 0 | 0 |
| teacher-planner | LOST | 0 | 0 | 0 | 0 | 0 |
| trube-lab | LOST | 0 | 0 | 0 | 0 | 0 |
| rn-terrain | LOST | 0 | 0 | 0 | 0 | 0 |
| neevsk-intuitui-web | LOST | 0 | 0 | 0 | 0 | 0 |
| gurudevi-webapp | LOST | 0 | 0 | 0 | 0 | 0 |
| legacy-web-api-docs | LOST | 0 | 0 | 0 | 0 | 0 |
| grade-section-head-views | PARTIAL | 0 | 0 | 0 | 0 | 0 |
| auth-identity | LIVE | 42 | 7 | 2 | 4 | 3 |
| offline-sync | BACKEND-ONLY | 11 | 0 | 0 | 3 | 1 |
| app-settings | PARTIAL | 24 | 0 | 1 | 2 | 0 |
| lessons-materials | UI-UNWIRED | 25 | 0 | 0 | 6 | 5 |
| classroom-notes | UI-UNWIRED | 11 | 0 | 0 | 1 | 6 |
| growth-ripples | UI-UNWIRED | 32 | 0 | 2 | 12 | 1 |
| calendar-events | LIVE | 11 | 0 | 0 | 2 | 0 |
| edlove-public-site | LIVE | 10 | 10 | 0 | 0 | 0 |
| gurudevi-marketing-legal | LIVE | 11 | 10 | 0 | 0 | 0 |
| dev-labs | PARTIAL | 4 | 2 | 0 | 2 | 0 |
| workspace-dispatch | PARTIAL | 1 | 1 | 0 | 0 | 0 |
| pricing-manifest | BACKEND-ONLY | 2 | 0 | 0 | 0 | 0 |

## Totals dashboard (main @ 175c036e, static)

**Capabilities: 1448.** api 242, screen-only 75, direct-supabase 202, user-task(doc) 120, i18n-implied 7, lost-screen 35, doc-intent 746, verified-task 21

| status | count |
|---|---|
| LIVE | 267 |
| PARTIAL | 108 |
| UI-UNWIRED | 265 |
| BACKEND-ONLY | 58 |
| LOST | 38 |
| UNVERIFIED | 30 |
| PLANNED | 682 |

### By role (a capability can list several roles)

| role | LIVE | PARTIAL | UI-UNWIRED | BACKEND-ONLY | LOST | UNVERIFIED | PLANNED | total |
|---|---|---|---|---|---|---|---|---|
| teacher | 193 | 50 | 147 | 43 | 1 | 14 | 118 | 566 |
| principal | 132 | 50 | 97 | 19 | 1 | 14 | 83 | 396 |
| student | 139 | 44 | 126 | 32 | 0 | 16 | 110 | 467 |
| parent | 108 | 38 | 71 | 17 | 0 | 0 | 16 | 250 |
| admin | 24 | 4 | 35 | 5 | 0 | 0 | 25 | 93 |
| founder | 40 | 2 | 8 | 4 | 0 | 0 | 23 | 77 |

### UI states / screens

- UI states needed, summed over code-derived capabilities: **2613**. Existing: **1107**. Missing: **1506**. On top of that, 682 PLANNED doc intents each need at least one screen.
- Screen files (route files plus Screen components across apps/packages): **296**.
  - On the path of a LIVE/PARTIAL capability (wired): **148**.
  - Showing real API data (path of a LIVE api/direct capability): **71**.
  - Coverage tiers: capability 153, ORPHAN-unrouted 65, capability-route(depth<=3) 74, ORPHAN-deep-in-closure 4
- Procedures: **242**. With UI reaching them: **148**. Without UI: **94**. LIVE: **65**. BACKEND-ONLY (no client site): **42**. DEAD-CALL: **30**.

### Coverage proof (every inventory item maps to ≥1 capability or is listed as an orphan in UI_COVERAGE.md)

| source | total | tiers |
|---|---|---|
| models | 94 | covered 66, server-ref-only 10, ORPHAN 18 |
| migration_tables | 244 | ORPHAN 75, zmodel 92, covered-direct 48, server/edge-ref-only 29 |
| screens | 296 | capability 153, ORPHAN-unrouted 65, capability-route(depth<=3) 74, ORPHAN-deep-in-closure 4 |
| hooks | 305 | ORPHAN-not-near-route 88, capability 36, capability-route(depth<=3) 166, ORPHAN-unused 15 |
| i18n | 66 | used 59, ORPHAN 7 |
| procs | 242 | every proc is one api capability (by construction) |
| flags | 14 | mapped to feature: 7; default false: 11 |
| nav entries | 57 | literal nav targets in layouts/nav configs (inbound links per route used for nav status) |
| docs | 1795 md files | role tasks parsed from section-role-gap-matrix.md (120); other docs/plan files not parsed into tasks (see caveats) |
| history | 35 deleted screens | lost-screen capabilities |

