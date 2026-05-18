# API Purge Tasks: The "Self" Domain 🌸

## Phase 1: Breaking the Foundation
- [x] Migrate `Self` domain (Mood, Journal, Prefs)
- [x] Migrate `Profile` domain (User, Social)
- [x] Migrate `Community` domain (Groups, Posts, Reactions)
- [x] Migrate `Classroom` structural logic (Classrooms, Lessons)
- [x] Migrate `Grading` engine (Marks, GPA, Publication)
- [x] Migrate `Attendance` tracking (Daily records, Pulse)
- [x] Migrate `Identity` resolution & `Admin` staff management
- [ ] Implement `Library` domain migration (Resources, Media)

## Phase 2: Building the Bridge
- [x] Scaffold `apps/sanctuary-api` (Railway ready)
- [x] Create `self.hono.ts` adapter for server-side routing
- [x] Implement Hono handlers for Mood Logging
- [x] Implement Hono handlers for Fire Journaling
- [x] Implement Hono handlers for User Preferences

## Phase 3: Healing the System
- [x] Update `packages/core/src/api/index.ts` to expose the new Hono-ready `selfAPI`
- [x] Refactor `packages/self/src/api/self.ts` to use Hono RPC Client [HEALED]
- [ ] Refactor `apps/gurudevi-mobile` (Healing compilation errors)
- [ ] Verify CASL ability propagation for `Wellbeing` subject

## Phase 4: Verification
- [ ] Smoke test Mood Logging on Mobile
- [ ] Verify "Sanctuary" vibe in API responses (concise, grounded)
