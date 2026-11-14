# Reviews v1 (advocate → critic → hostile)

These are per-feature verdicts. The same text is stored under `reviews:` in features.yaml. The critic's lines are generated from the layer gaps; the hostile verdicts were adjudicated by hand.

## library-browse
- **Advocate:** LIVE: 19 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (LIVE)
- **Critic — missing:** weak layers: ['client']; unserved procs: ['library.reportBrokenLink']
- **Critic — overemphasized:** advocate rated PARTIAL by rules; adjudicated LIVE
- **Hostile:** 19/20 procs served via typed oRPC; library.reportBrokenLink is REST-only (unserved). Seeded content.

## library-curation-review
- **Advocate:** LIVE: 19 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client']; unserved procs: ['library.reportBrokenLink']
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Served procs but curation gating relies on client role checks; verifyResource reachable; partial client (P).

## library-tools
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Pure client tools, no persistence; pass-1 caveats stand.

## cosmic-map
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client', 'real_data']; unserved procs: ['mapping.getById', 'mapping.getSchoolPulse', 'mapping.upsert', 'mapping.createShareLink']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** mapping.* calls are Hono REST: REST hc client path has no server mount since e383ef01 (2026-07-30 08:03). Map renders but data calls 404 statically.

## self-wellbeing
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client']; unserved procs: ['self.logMood', 'self.getMoodHistory', 'self.burnJournal', 'self.getJournalHistory', 'self.getTodayMood']; procs without client: ['self.saveThoughtRecord', 'self.getThoughtRecords', 'self.completeThoughtRecordFollowUp', 'self.getPreferences', 'self.updatePreferences']
- **Critic — overemphasized:** -
- **Hostile:** self.mood/journal via (client.api as any).self.* and sync registry packages/core/src/lib/sync/registry.ts:94: REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).

## decision-journal
- **Advocate:** LIVE: 5 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** All feature procs have served oRPC sites; renderer chain traced from /self closure. Promoted from PARTIAL.

## learning-reflections
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client']; unserved procs: ['learningReflections.saveLearningReflection', 'learningReflections.getLearningReflections', 'learningReflections.completeLearningReflectionFollowUp']
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** learningReflections.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).

## daily-wisdom
- **Advocate:** LIVE: 3 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** WisdomSeeds -> packages/self/src/api/dailyContent.ts:16 orpcClient.dailyContent.getToday (served), but DailyContentCard (packages/self/src/components/DailyContentCard.tsx:53) is exported and used by no screen.

## warm-mirror
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client', 'real_data']; unserved procs: ['warmMirror.getDataPoints']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** warmMirror.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03); no served path reached from routes.

## privacy-ledger
- **Advocate:** LIVE: 2 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** 2 procs served and reached; caveat: 534 direct Supabase .from sites bypass the ledger. Promoted.

## community-feed
- **Advocate:** LIVE: 2 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status LIVE -> PARTIAL
- **Critic — missing:** weak layers: ['client']; unserved procs: ['community.getGroup', 'community.createGroup', 'community.updateMemberStatus', 'community.updateGroupPolicy', 'community.getGroupMembers']; procs without client: ['community.getReactionStatus']
- **Critic — overemphasized:** -
- **Hostile:** Downgraded from LIVE. usePostsInfiniteQuery (packages/core/src/api/hooks/community.hooks.ts:62) -> communityAPI.getPosts (packages/core/src/api/community.ts:17) `(client.api as any).community.posts.$get`: REST hc client path has no server mount since e383ef01 (2026-07-30 08:03). 23/26 community sites are REST.

## direct-messages
- **Advocate:** LIVE: 12 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** DM screens use socialAPI (served oRPC) + Supabase; promoted. messagingAPI still has zero UI consumers.

## messaging-router
- **Advocate:** LIVE: 4 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'P', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status unchanged (BACKEND-ONLY)
- **Critic — missing:** weak layers: ['screen', 'nav', 'real_data']
- **Critic — overemphasized:** -
- **Hostile:** 4 procs, no screen consumer.

## presence
- **Advocate:** LIVE: 2 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status PARTIAL -> BACKEND-ONLY
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated BACKEND-ONLY
- **Hostile:** presenceAPI used only by packages/community/src/api/presence.ts and presence.hooks.ts; no screen imports either. Downgraded.

## sacred-missions
- **Advocate:** LIVE: 4 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Consumer found: community tab closure reaches sacredMissions.list/create/endorse/unendorse (served). Promoted.

## announcements
- **Advocate:** LIVE: 2 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Served and reached from principal/community routes. Promoted.

## classroom-core
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client']; unserved procs: ['educational.getByTeacher', 'educational.getByStudent', 'educational.getTeacherStats', 'educational.getById', 'educational.createClassroom']; procs without client: ['educational.claimShadowStudent', 'educational.getClassroomNotes', 'educational.getClassroomNoteSnapshot', 'educational.getClassroomNoteTimeline', 'educational.createClassroomNote']
- **Critic — overemphasized:** -
- **Hostile:** api.classrooms.getByTeacher (packages/core/src/api/classrooms.ts) is Hono REST (unserved); ClassroomList falls back to MOCK_CLASSROOMS ungated.

## attendance
- **Advocate:** LIVE: 5 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (LIVE)
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated PARTIAL by rules; adjudicated LIVE
- **Hostile:** oRPC served + PowerSync.

## teacher-attendance
- **Advocate:** PARTIAL: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'N', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status PARTIAL -> BACKEND-ONLY
- **Critic — missing:** weak layers: ['screen', 'nav', 'real_data']
- **Critic — overemphasized:** advocate rated UNKNOWN by rules; adjudicated BACKEND-ONLY
- **Hostile:** Schema-only: TeacherDailyAttendance model has no procedure, client or screen. (pass-1 PARTIAL was generous.)

## gradebook
- **Advocate:** LIVE: 6 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'P'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** -
- **Hostile:** Served grading procs but data partly sample/fallback (real_data P).

## assignments
- **Advocate:** PARTIAL: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'N', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client']; procs without client: ['educational.getAssignments', 'educational.createAssignment', 'educational.getStudentSubmissions', 'educational.getUpcomingAssignments', 'educational.submitAssignment']
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Screen is demo-only; educational assignment procs have no client call site.

## student-goals
- **Advocate:** PARTIAL: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status unchanged (UI-UNWIRED)
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated UI-UNWIRED
- **Hostile:** Screen with local demo state; no schema/API.

## student-potential
- **Advocate:** LIVE: 3 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Served and reached. Promoted.

## longitudinal-profile
- **Advocate:** LIVE: 2 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Served and reached. Promoted.

## classroom-echoes
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'P'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client', 'real_data']; unserved procs: ['echoes.sendEcho', 'echoes.getMyEchoes', 'echoes.getEchoesByClassroom', 'echoes.getTeacherEchoes', 'echoes.respondToEcho']
- **Critic — overemphasized:** -
- **Hostile:** echoes.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).

## inventory
- **Advocate:** LIVE: 4 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client']; unserved procs: ['inventory.getSchoolRequests']
- **Critic — overemphasized:** -
- **Hostile:** Beta flag inventory defaults false (packages/core/src/store/types/featureFlags.ts); one REST site unserved.

## principal-workspace
- **Advocate:** LIVE: 12 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** none at layer level; procs without client: ['admin.getSchool']
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Served data but ungated 'demo-school' fallback and MOCK_SCHOOL_STATS in no-school state.

## principal-notes
- **Advocate:** LIVE: 5 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Served and reached. Promoted.

## staff-leave
- **Advocate:** LIVE: 3 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Served and reached. Promoted.

## academic-cycles
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** Screen without API; Term/Subject models unreferenced by API.

## school-onboarding
- **Advocate:** LIVE: 6 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status LIVE -> PARTIAL
- **Critic — missing:** weak layers: ['client']; unserved procs: ['onboarding.createFounderSchoolBond']; procs without client: ['onboarding.revokeSchoolBond', 'identity.capabilityBootstrap', 'identity.selectActiveScope']
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Downgraded from LIVE: onboarding.createFounderSchoolBond call site is REST (unserved); rest of bootstrap served.

## guardian-workspace
- **Advocate:** LIVE: 1 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** guardianServices -> packages/core/src/adapters/supabase/guardianRepository.ts reads guardian_identities/guardian_notifications/school_events: no such table in any *.sql migration nor schema.zmodel. Also 'parent' capacity falls through to classroom-list (apps/gurudevi-mobile/src/lib/workspace/routeResolution.ts); only 'guardian' reaches it.

## founder-dashboard
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Supabase founderRepository rpc get_ecosystem_stats (exists in migrations 20260308000001/20260315000000); not via API; no zmodel. Real-but-unaudited.

## school-forest
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'P', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status unchanged (UI-UNWIRED)
- **Critic — missing:** weak layers: ['client', 'screen', 'nav', 'real_data']; unserved procs: ['schoolForest.getForestOverview', 'schoolForest.getSchoolPulse', 'schoolForest.sendGratitudeGift', 'schoolForest.getPendingGifts', 'schoolForest.markGiftDelivered']
- **Critic — overemphasized:** advocate rated BACKEND-ONLY by rules; adjudicated UI-UNWIRED
- **Hostile:** Screen unrouted; schoolForest.* REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).

## admin-console
- **Advocate:** LIVE: 7 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'P', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status PARTIAL -> UI-UNWIRED
- **Critic — missing:** weak layers: ['screen', 'nav', 'real_data']; procs without client: ['admin.getSchool']
- **Critic — overemphasized:** advocate rated BACKEND-ONLY by rules; adjudicated UI-UNWIRED
- **Hostile:** Downgraded: screens exist but no route/nav; 'admin' capacity falls through to classroom-list.

## editorial
- **Advocate:** LIVE: 10 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (LIVE)
- **Critic — missing:** none at layer level; procs without client: ['editorial.recordEvent', 'editorial.recordDelivery']
- **Critic — overemphasized:** -
- **Hostile:** oRPC served, raw SQL.

## form-builder
- **Advocate:** LIVE: 3 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'P', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['client', 'nav']; unserved procs: ['forms.getById', 'forms.getBySlug', 'forms.getByOwner', 'forms.delete', 'forms.submitResponse']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** Flag default-off; 5/8 forms sites REST hc client path has no server mount since e383ef01 (2026-07-30 08:03).

## thuthimal
- **Advocate:** LIVE: 4 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Served; claim route via QR deep link by design. Promoted. Caveat: ThuthimalGift vs GratitudeGift overlap.

## rewards-energy
- **Advocate:** LIVE: 8 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status PARTIAL -> LIVE
- **Critic — missing:** none at layer level; procs without client: ['rewards.getWhisperedMoments']
- **Critic — overemphasized:** -
- **Hostile:** Served and reached. Promoted.

## payments
- **Advocate:** PARTIAL: 5 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'P', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['nav', 'real_data']; procs without client: ['erp.getTransactions']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** Math.random ids and pi_demo_secret_demo; nav P.

## accounting
- **Advocate:** PARTIAL: 5 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'P', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status PARTIAL -> UI-UNWIRED
- **Critic — missing:** weak layers: ['screen', 'nav', 'real_data']; procs without client: ['erp.getTransactions']
- **Critic — overemphasized:** advocate rated BACKEND-ONLY by rules; adjudicated UI-UNWIRED
- **Hostile:** Downgraded: screen not routed (nav N); flag default-off.

## tuition-commercial
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** Screen without API.

## workforce
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'P', 'real_data': 'NA'}
- **Critic — noted:** status unchanged (UI-UNWIRED)
- **Critic — missing:** weak layers: ['nav']
- **Critic — overemphasized:** -
- **Hostile:** Fake success toast; no API.

## notifications
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status PARTIAL -> UI-UNWIRED
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** -
- **Hostile:** Downgraded: packages/core/src/store/useNotificationStore.ts is never written by any non-test code (only store + hooks/useNotifications.ts); screen always empty. Server-side guardian_notifications table missing.

## profile
- **Advocate:** LIVE: 1 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** none at layer level; procs without client: ['profile.getUserProfile', 'profile.updateProfile', 'profile.getJourneySnapshot', 'profile.getSocialLinks', 'profile.upsertSocialLink']
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** profile.* procedures uncalled; screens use other paths; web has 'mocked' branch.

## ai-assistant
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** fetch /api/ai/chat (packages/ai/src/hooks/useAIAgent.ts:214) gated by isAIAssistantEnabled server-side and default-off flag.

## durable-agents
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Plain Hono routes mounted; UI reachable; admin-ish, no role gate verified.

## tracking-history
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'P', 'real_data': 'N'}
- **Critic — noted:** status unchanged (BACKEND-ONLY)
- **Critic — missing:** weak layers: ['client', 'nav', 'real_data']; unserved procs: ['tracking.listExploredFeatures', 'tracking.logFeatureUsage', 'history.getCollectionMembershipTimeline', 'history.getCollectionMembershipAsOf', 'history.getLibraryEntityHistory']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated BACKEND-ONLY
- **Hostile:** tracking/history REST hc client path has no server mount since e383ef01 (2026-07-30 08:03); route has no inbound link.

## agent-status
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'P', 'screen': 'N', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status unchanged (BACKEND-ONLY)
- **Critic — missing:** weak layers: ['client', 'screen', 'nav', 'real_data']; unserved procs: ['agent.getSystemStatus']
- **Critic — overemphasized:** -
- **Hostile:** REST hc client path has no server mount since e383ef01 (2026-07-30 08:03); no screen.

## edlove-atlas-web
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** apps/edlove-web/app/api/atlas/route.ts:69-76 opens a local SQLite atlas_staging.db (default c:/x/data/...); file not in repo -> real data exists only on Naveen's machine.

## gurudevi-web-sanctuary
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** Web shell; inherits per-feature transport breaks.

## teacher-platform
- **Advocate:** LOST: historical evidence only
- **Critic — noted:** status unchanged (LOST)
- **Critic — missing:** weak layers: ['schema', 'api', 'client', 'screen', 'nav', 'real_data']
- **Critic — overemphasized:** -
- **Hostile:** Gone from main.

## teacher-planner
- **Advocate:** LOST: historical evidence only
- **Critic — noted:** status unchanged (LOST)
- **Critic — missing:** weak layers: ['schema', 'api', 'client', 'screen', 'nav', 'real_data']
- **Critic — overemphasized:** -
- **Hostile:** Gone from main.

## trube-lab
- **Advocate:** LOST: historical evidence only
- **Critic — noted:** status unchanged (LOST)
- **Critic — missing:** weak layers: ['client', 'screen', 'nav']
- **Critic — overemphasized:** -
- **Hostile:** Gone from main.

## rn-terrain
- **Advocate:** LOST: historical evidence only
- **Critic — noted:** status unchanged (LOST)
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** Gone from main.

## neevsk-intuitui-web
- **Advocate:** LOST: historical evidence only
- **Critic — noted:** status unchanged (LOST)
- **Critic — missing:** weak layers: ['screen', 'nav']
- **Critic — overemphasized:** -
- **Hostile:** Gone from main.

## gurudevi-webapp
- **Advocate:** LOST: historical evidence only
- **Critic — noted:** status unchanged (LOST)
- **Critic — missing:** weak layers: ['schema', 'api', 'client', 'screen', 'nav', 'real_data']
- **Critic — overemphasized:** -
- **Hostile:** Gone from main.

## legacy-web-api-docs
- **Advocate:** LOST: historical evidence only
- **Critic — noted:** status unchanged (LOST)
- **Critic — missing:** weak layers: ['schema', 'api', 'client', 'screen', 'nav', 'real_data']
- **Critic — overemphasized:** -
- **Hostile:** Gone from main.

## grade-section-head-views
- **Advocate:** LOST: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'P', 'real_data': 'NA'}
- **Critic — noted:** status unchanged (PARTIAL)
- **Critic — missing:** weak layers: ['nav']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** Routes with no inbound link (nav P); no own data.

## auth-identity
- **Advocate:** LIVE: 4 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status None -> LIVE
- **Critic — missing:** none at layer level; procs without client: ['identity.capabilityBootstrap', 'identity.selectActiveScope', 'authorization.refresh']
- **Critic — overemphasized:** -
- **Hostile:** NEW. Supabase auth + identity procs served; demo mode is user-chosen (IdentityInitialState.tsx:327).

## offline-sync
- **Advocate:** BACKEND-ONLY: 2 served procs; layers {'schema': 'NA', 'api': 'Y', 'client': 'Y', 'screen': 'N', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status None -> BACKEND-ONLY
- **Critic — missing:** weak layers: ['screen', 'nav', 'real_data']
- **Critic — overemphasized:** -
- **Hostile:** NEW. PowerSync + sync registry infra; logMood queue entry uses unserved REST (registry.ts:94).

## app-settings
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status None -> PARTIAL
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** NEW. Settings screens real (local+Supabase), but dead /trube-lab link.

## lessons-materials
- **Advocate:** UI-UNWIRED: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status None -> UI-UNWIRED
- **Critic — missing:** weak layers: ['client', 'real_data']; unserved procs: ['educational.getClassroomResources', 'educational.createLesson']; procs without client: ['educational.getMaterials', 'educational.getLessonMaterials', 'educational.createMaterial', 'educational.updateMaterial', 'educational.deleteMaterial']
- **Critic — overemphasized:** -
- **Hostile:** NEW. Screens exist; educational notes/materials procs have zero client sites.

## classroom-notes
- **Advocate:** UI-UNWIRED: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'P', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status None -> UI-UNWIRED
- **Critic — missing:** weak layers: ['client', 'real_data']; unserved procs: ['history.getClassroomNoteHistory']; procs without client: ['educational.getClassroomNotes', 'educational.getClassroomNoteSnapshot', 'educational.getClassroomNoteTimeline', 'educational.createClassroomNote', 'educational.updateClassroomNote']
- **Critic — overemphasized:** -
- **Hostile:** NEW. Screen exists; notes procs uncalled / REST only.

## growth-ripples
- **Advocate:** UI-UNWIRED: 0 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'N', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status None -> UI-UNWIRED
- **Critic — missing:** weak layers: ['client', 'real_data']; procs without client: ['rewards.getWhisperedMoments']
- **Critic — overemphasized:** -
- **Hostile:** NEW. Screen; procs have no client site (client N).

## calendar-events
- **Advocate:** LIVE: 2 served procs; layers {'schema': 'Y', 'api': 'Y', 'client': 'Y', 'screen': 'Y', 'nav': 'Y', 'real_data': 'Y'}
- **Critic — noted:** status None -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** NEW. Calendar procs served and reached.

## edlove-public-site
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status None -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** NEW. Static marketing site (no data needed).

## gurudevi-marketing-legal
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status None -> LIVE
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** -
- **Hostile:** NEW. Static marketing/legal pages.

## dev-labs
- **Advocate:** LIVE: 0 served procs; layers {'schema': 'NA', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'NA'}
- **Critic — noted:** status None -> PARTIAL
- **Critic — missing:** none at layer level
- **Critic — overemphasized:** advocate rated LIVE by rules; adjudicated PARTIAL
- **Hostile:** NEW. Dev/lab routes shipped in app router; no data, should be gated.

## workspace-dispatch
- **Advocate:** UI-UNWIRED: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'Y', 'nav': 'Y', 'real_data': 'N'}
- **Critic — noted:** status None -> PARTIAL
- **Critic — missing:** weak layers: ['real_data']
- **Critic — overemphasized:** advocate rated UI-UNWIRED by rules; adjudicated PARTIAL
- **Hostile:** NEW. routeResolution.ts maps founder/principal/guardian/student; parent+admin fall through to classroom-list.

## pricing-manifest
- **Advocate:** UNKNOWN: 0 served procs; layers {'schema': 'Y', 'api': 'NA', 'client': 'NA', 'screen': 'N', 'nav': 'N', 'real_data': 'N'}
- **Critic — noted:** status None -> BACKEND-ONLY
- **Critic — missing:** weak layers: ['screen', 'nav', 'real_data']
- **Critic — overemphasized:** advocate rated UNKNOWN by rules; adjudicated BACKEND-ONLY
- **Hostile:** NEW. Pricing/plan schema+config, no screen.
