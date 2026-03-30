# POA Hardening Audit

Date: 2026-03-27

## Verdict

The POA stack is **not yet production-ready end to end**.

What is currently true:

- `ts-rest` contracts exist for major domains.
- CASL authority checks are wired into a `createPOAProxy` BFF-style gate.
- Several exported APIs now fail fast before reaching Supabase.
- Focused runtime tests prove that behavior for selected `classrooms` and `self` flows.

What is not yet true:

- Contract coverage is incomplete across the API surface.
- Several proxied modules are only partially mapped to contracts.
- Many API modules are still exported with no BFF/contract enforcement at all.
- ZenStack policies exist, but the live request path is still using raw Supabase rather than a ZenStack-enhanced client.

## Evidence Summary

### BFF / Contract Bridge

- POA proxy implementation: `packages/core/src/api/poaProxy.ts`
- Runtime enforcement hook: `packages/core/src/permissions/AuthorityInterceptor.ts`
- Proxied core exports: `packages/core/src/api/index.ts`
- Proxied self export: `packages/self/src/api/self.ts`
- Proxied library export: `packages/library/src/api/library.ts`
- Focused runtime proof: `apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts`

### ZenStack

- Policy source of truth: `packages/database/protocol/schema.zmodel`
- Generated schema: `packages/database/protocol/schema.ts`
- Only observed client usage: `packages/database/src/test-enhance.ts`
- Live app DB path still uses raw Supabase client: `packages/core/src/lib/supabase.ts`

## Contract Inventory

Seven contract files are present:

- `identity.contract.ts`
- `educational.contract.ts`
- `grading.contract.ts`
- `operations.contract.ts`
- `community.contract.ts`
- `self.contract.ts`
- `library.contract.ts`

Total contract routes defined: **48**

Contract subjects used:

- `Assignment`
- `Attendance`
- `Classroom`
- `Grade`
- `Group`
- `Inventory`
- `Lesson`
- `Library`
- `Material`
- `Post`
- `School`
- `User`
- `Wellbeing`

## CASL Subject Parity

Status: **Pass for current contract subjects**

The current CASL surface now includes all subjects/actions referenced by the contract set:

- Added or confirmed in CASL subjects: `Group`, `Post`, `User`, `Material`
- Added or confirmed in CASL actions: `resolve`, `grade`
- Composer/role abilities now cover the contract subject set at the BFF layer

Important limitation:

- CASL parity here means the contract subjects are recognized and can be checked by the BFF.
- It does **not** mean row-level semantics are fully equivalent to the underlying data policies.

## ZenStack Policy Coverage

Status: **Defined, but not operational in the live request path**

Models with ZenStack policies present in `schema.zmodel`:

- `User`
- `Classroom`
- `ClassroomStudent`
- `Assignment`
- `Grade`
- `ClassroomGradingSettings`
- `Group`
- `GroupMember`
- `Post`
- `GroupMessage`
- `CommunityReaction`
- `Lesson`
- `Material`
- `AttendanceRecord`
- `School`
- `InventoryItem`
- `MoodLog`
- `FireJournalEntry`
- `UserPreferences`
- `LibraryResource`
- `LibraryCollection`
- `ResourceEngagement`

Coverage against contract subjects:

| Contract subject | ZenStack policy backing |
| --- | --- |
| `User` | Yes, `User` |
| `Classroom` | Yes, `Classroom` |
| `Assignment` | Yes, `Assignment` |
| `Grade` | Yes, `Grade` and `ClassroomGradingSettings` |
| `Group` | Yes, `Group`, `GroupMember`, `GroupMessage` |
| `Post` | Yes, `Post`, `CommunityReaction` |
| `Lesson` | Yes, `Lesson` |
| `Material` | Yes, `Material` |
| `Attendance` | Yes, `AttendanceRecord` |
| `School` | Yes, `School` |
| `Inventory` | Yes, `InventoryItem` |
| `Wellbeing` | Yes, `MoodLog`, `FireJournalEntry`, `UserPreferences` |
| `Library` | Yes, `LibraryResource`, `LibraryCollection`, `ResourceEngagement` |

Critical gap:

- The audited runtime code does not currently route these app APIs through a ZenStack-enhanced client.
- The active request path is raw Supabase calls from API modules.
- Result: ZenStack policy coverage is **defined on paper** but **not verified as enforced at runtime** for these app APIs.

## API Surface Audit

### Fully Outside POA Contracts

These modules are exported without `createPOAProxy` contract enforcement:

- `authAPI`
- `tasksAPI`
- `notesAPI`
- `lessonsAPI`
- `studentsAPI`
- `resourcesAPI`
- `groupsAPI`
- `lessonMaterialsAPI`
- `assignmentsAPI`
- `classroomStudentsAPI`
- `onboardingAPI`
- `dailyContentAPI`
- `thuthimalAPI`
- `classroomNotesAPI`
- `principalNotesAPI`
- `sacredMissionsAPI`
- `demoAPI`
- `growthSignalsAPI`
- `userGrowthStateAPI`
- `impactRipplesAPI`
- `warmMirrorAPI`
- `naturePathsAPI`
- `moonPhaseAPI`
- `schoolForestAPI`
- `contextualChallengesAPI`
- `founderAPI`
- `academicCyclesAPI`
- `studentObservationsAPI`
- `privacyAPI`
- `echoAPI`
- `studentPotentialAPI`
- `mappingAPI`
- `historyAPI`
- `formTemplatesAPI`

Production implication:

- These APIs may still have ad hoc checks or DB-level protections, but they are not covered by the POA contract/BFF authority bridge.

### Proxied Core Modules

| Module | Status | Notes |
| --- | --- | --- |
| `identityAPI` | Partial | `resolveInternalId` and `getMyInternalId` are contract-enforced; `updateProfile`, `linkIdentity`, `clearCache` are not contract-covered. |
| `attendanceAPI` | Partial | `getByDate` and `record` mapped; `batchRecord` and `getForStudent` bypass contract metadata. |
| `classroomsAPI` | Partial | `getByTeacher`, `getByStudent`, `getById`, `create` enforced; `getBySchool`, `update`, `delete` bypass. |
| `gradingAPI` | Partial | `submitGrade`, `getReportCard`, `getClassroomGrades` enforced; `getGradingSettings`, `updateGradingSettings`, `deleteGrade` bypass. |
| `schoolAPI` | Partial | `getSchool`, `update`, `getSchoolStats` enforced; `create`, `searchSchools` bypass. |
| `inventoryAPI` | Partial | `getAll`, `update` enforced; `getSchoolResourceNeeds` bypasses. |
| `communityAPI` | Partial | Mixed exact/mapped coverage; several methods remain outside contract coverage. |
| `staffManagementAPI` | Broken coverage | Wrapped in `createPOAProxy`, but uses `operationsContract`, which does not describe staff-management routes. In practice this is not meaningful contract enforcement. |

### Community Detailed Gaps

Community methods currently enforced:

- `getGroups`
- `getPosts`
- `createPost`
- `createGroupWithOwner`
- `getGroupById`
- `get`
- `handleMemberRequest`
- `updateJoiningPolicy`
- `getGroupMessages`
- `sendGroupMessage`
- `togglePostReaction`
- `voteInPoll`
- `getDirectConversations`
- `sendDirectMessage`

Community methods currently bypassing POA contract metadata:

- `getAnnouncements`
- `createAnnouncement`
- `joinGroup`
- `getOrCreateDirectConversation`
- `getDirectMessages`

Contract route with no implementation match in `communityAPI`:

- `reportContent`

### Self Domain

Status: **Mostly covered, still incomplete**

Implemented and contract-enforced:

- `logMood`
- `getMoodHistory`
- `burnJournal`
- `getBurnedHistory`

Implemented but not contract-covered:

- `getTodayMood`

Contract-defined but not implemented in `selfAPI`:

- `getPreferences`
- `updatePreferences`

### Library Domain

Status: **Partially covered**

Contract-enforced:

- `getResources`
- `getResourceById`
- `createResource`
- `trackView`
- `trackUse`
- `endorseResource`
- `bookmarkResource`
- `getCollections`

Implemented but currently outside contract coverage:

- `searchMapUniverse`
- `searchResourcesLocal`
- `searchLibrary`
- `updateResource`
- `deleteResource`
- `verifyResource`
- `getBookmarkedResources`
- `getCollectionById`
- `createCollection`
- `addToCollection`
- `removeFromCollection`
- `updateCollection`
- `forkCollection`
- `deleteCollection`
- `getMapTopology`
- `reportBrokenLink`
- `getResonantKnowledge`
- `getGeoTopology`

Production implication:

- Library is not ready for “all calls must be contract-governed” claims.

## Cross-Layer Findings

### 1. BFF POA coverage is still selective, not universal

The contract/BFF bridge protects some important surfaces, but not the platform as a whole.

### 2. `staffManagementAPI` is the clearest false-positive

It appears proxied, but the attached contract is unrelated. This should be treated as uncovered until a real staff-management contract exists.

### 3. ZenStack is not yet part of the active enforcement chain

The existence of `schema.zmodel` is not enough for production claims. The audited APIs are still using direct Supabase access, so ZenStack policy enforcement is not demonstrated in the app path.

### 4. Educational contract coverage is fragmented

The contract defines routes for lessons, materials, assignments, and classroom students, but the exported modules for those areas are not going through the POA proxy in `packages/core/src/api/index.ts`.

### 5. Contract completeness and implementation completeness are both uneven

Examples:

- `selfContract` defines preferences routes, but `selfAPI` does not implement them.
- `communityContract` defines `reportContent`, but `communityAPI` does not implement it.
- Multiple implemented methods have no corresponding contract route at all.

## Runtime Verification Performed

Focused runtime verification passed:

- `apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts`

Verified behaviors:

- Unauthorized `classroomsAPI.create` fails before Supabase
- Guest `selfAPI.getMoodHistory` is denied by POA
- Authenticated teacher `selfAPI.getMoodHistory` is allowed and reaches Supabase

This is strong evidence for the specific covered paths, but it is not broad enough to certify the full stack.

## Production Readiness Scorecard

| Layer | Status |
| --- | --- |
| Zod schema presence | Good |
| `ts-rest` contract presence | Good |
| BFF proxy mechanism | Good |
| BFF coverage breadth | Partial |
| CASL contract subject parity | Good |
| CASL row-level semantics alignment | Partial |
| ZenStack policy definitions | Good |
| ZenStack runtime enforcement in active app path | Not verified / effectively absent |
| End-to-end production confidence | Not ready |

## Required Work Before Claiming Production Readiness

1. Put every mutating and sensitive read API behind a real `ts-rest` contract and `createPOAProxy`.
2. Create a dedicated contract for `staffManagementAPI`.
3. Bring `lessonsAPI`, `studentsAPI`, `assignmentsAPI`, `lessonMaterialsAPI`, and `classroomStudentsAPI` under the same POA proxy path.
4. Finish the missing contract-method mappings for partial modules.
5. Either:
   - route the live server/BFF persistence path through a ZenStack-enhanced client, or
   - explicitly declare ZenStack non-authoritative for runtime enforcement and rely on another verified data-policy mechanism.
6. Add contract-vs-implementation drift tests so missing mappings fail CI.
7. Add ZenStack enforcement integration tests against the real protected persistence path.

## Bottom Line

The system now has a **credible POA foundation** and a working fail-fast BFF mechanism for selected domains, but it is **not yet accurate to say the full POA stack, including ZenStack, is fully functional at production level**.
