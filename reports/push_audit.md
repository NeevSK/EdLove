# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/8/2026, 9:28:49 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run lint; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm run i18n:check
> **Duration:** 94.4s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 204 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 57 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 18 |
| packages/analytics | 21 |
| packages/community | 3 |
| packages/core | 73 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 6 |
| packages/scanner-kit | 3 |
| packages/trube-art | 3 |
| packages/ui | 24 |

## Detailed Findings

### Category: General
- @repo/types-shim:lint:biome: Found 2 errors.
- @repo/types-shim:lint:biome: Found 10 warnings.
- @repo/workforce:lint:biome: Found 4 errors.
- @repo/people:lint:biome:      50     │ - → → → console.error("Attendance·toggle·failed:",·err);␍
- @repo/people:lint:biome:      41     │ - → → → warning:·"text-phase-warning·bg-phase-warning/5·border-phase-warning/20",␍
- @repo/people:lint:biome:      43     │ - → → → error:·"text-phase-error·bg-phase-error/5·border-phase-error/20",␍
- @repo/people:lint:biome:      75     │ - → → → variant:·"warning",␍
- @repo/people:lint:biome:      93     │ - → → → variant:·"error",␍
- @repo/people:lint:biome:     105     │ - → → → variant:·"error",␍
- @repo/accounting:lint:biome:     15 │ 		const { data, error } = await supabase
- @repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
- @repo/accounting:lint:biome:     11    │ - → → const·{·data:·budget,·error:·budgetError·}·=·await·supabase␍
- @repo/accounting:lint:biome:     20    │ - → → if·(budgetError)·return·null;·//·No·budget·defined␍
- @repo/accounting:lint:biome:     23    │ - → → const·{·data:·balanceData,·error:·balanceError·}·=·await·supabase␍
- @repo/accounting:lint:biome:     30    │ - → → if·(balanceError)·throw·balanceError;␍
- @repo/accounting:lint:biome:        11 │ + ····const·{·data:·budget,·error:·budgetError·}·=·await·supabase
- @repo/accounting:lint:biome:        20 │ + ····if·(budgetError)·return·null;·//·No·budget·defined
- @repo/accounting:lint:biome:        23 │ + ····const·{·data:·balanceData,·error:·balanceError·}·=·await·supabase
- @repo/accounting:lint:biome:        30 │ + ····if·(balanceError)·throw·balanceError;
- @repo/accounting:lint:biome:     15    │ - → → const·{·data,·error·}·=·await·supabase␍
- @repo/accounting:lint:biome:     25    │ - → → if·(error)·throw·error;␍
- @repo/accounting:lint:biome:     36    │ - → → const·{·data,·error·}·=·await·supabase␍
- @repo/accounting:lint:biome:     47    │ - → → if·(error)·throw·error;␍
- @repo/people:lint:biome:      45     │ - → → → → console.error("Failed·to·load·feedback·history:",·err);␍
- @repo/people:lint:biome:      95     │ - → → → → → → → → → → → → ?·"bg-phase-error"␍
- @repo/people:lint:biome:     111     │ - → → → → → → → → → → → → → → → ?·"bg-phase-error/10·border-phase-error/20"␍
- @repo/people:lint:biome:     118     │ - → → → → → → → → → → → → → → → → ?·"text-phase-error"␍
- @repo/people:lint:biome:     129     │ - → → → → → → → → → → → → → → → :·"bg-phase-warning/10·border-phase-warning/20"␍
- @repo/accounting:lint:biome:        15 │ + ····const·{·data,·error·}·=·await·supabase
- @repo/accounting:lint:biome:        25 │ + ····if·(error)·throw·error;
- @repo/accounting:lint:biome:        33 │ + ····const·{·data,·error·}·=·await·supabase
- @repo/accounting:lint:biome:        44 │ + ····if·(error)·throw·error;
- @repo/accounting:lint:biome:     20    │ - → → → throw·new·Error(␍
- @repo/accounting:lint:biome:     26    │ - → → const·{·data:·tx,·error:·txError·}·=·await·supabase␍
- @repo/accounting:lint:biome:     33    │ - → → if·(txError)·throw·txError;␍
- @repo/accounting:lint:biome:     41    │ - → → const·{·error:·entriesError·}·=·await·supabase␍
- @repo/accounting:lint:biome:     46    │ - → → if·(entriesError)·throw·entriesError;␍
- @repo/accounting:lint:biome:     55    │ - → → const·{·data,·error·}·=·await·supabase␍
- @repo/accounting:lint:biome:     62    │ - → → if·(error)·throw·error;␍
- @repo/people:lint:biome:     136     │ - → → → → → → → → → → → → → → → → :·"text-phase-warning"␍
- @repo/accounting:lint:biome:        20 │ + ······throw·new·Error('Transaction·is·not·balanced.·Debits·must·equal·Credits.');
- @repo/people:lint:biome:     100     │ - → → → → → → ?·"bg-phase-error·shadow-error/20"␍
- @repo/workforce:lint:biome:   × Some errors were emitted while running checks.
- @repo/accounting:lint:biome:        24 │ + ····const·{·data:·tx,·error:·txError·}·=·await·supabase
- @repo/library:lint:biome:     185 │ 			throw new APIError("Failed to fetch resources", error.code, error);
- @repo/accounting:lint:biome:        31 │ + ····if·(txError)·throw·txError;
- @repo/accounting:lint:biome:        39 │ + ····const·{·error:·entriesError·}·=·await·supabase
- @repo/accounting:lint:biome:        44 │ + ····if·(entriesError)·throw·entriesError;
- @repo/accounting:lint:biome:        53 │ + ····const·{·data,·error·}·=·await·supabase
- @repo/accounting:lint:biome:        60 │ + ····if·(error)·throw·error;
- @repo/accounting:lint:biome: Found 7 errors.
- @repo/accounting:lint:biome: Found 3 warnings.
- @repo/accounting:lint:biome:   × Some errors were emitted while running checks.
- apps-edlove-web:lint:biome: Found 35 errors.
- apps-edlove-web:lint:biome: Found 93 warnings.
- apps-edlove-web:lint:biome:   × Some errors were emitted while running checks.
- @repo/people:lint:biome:      36     │ - → → const·{·data:·bondRows,·error:·bondError·}·=·await·supabase␍
- @repo/people:lint:biome:      41     │ - → → if·(bondError)·throw·bondError;␍
- @repo/library:lint:biome:      62     │ - → → → //·Create·FTS5·Search·Table␍
- @repo/library:lint:biome:      64     │ - ················CREATE·VIRTUAL·TABLE·IF·NOT·EXISTS·knowledge_search_fts·USING·fts5(␍
- @repo/people:lint:biome:      55     │ - → → const·{·data:·userRows,·error:·userError·}·=·await·supabase␍
- @repo/people:lint:biome:      60     │ - → → if·(userError)·throw·userError;␍
- @repo/library:lint:biome:     116     │ - → → }·catch·(error)·{␍
- @repo/library:lint:biome:     117     │ - → → → console.error("Failed·to·initialize·Knowledge·DB:",·error);␍
- @repo/library:lint:biome:     122     │ - → ·*·Search·the·local·knowledge·index·using·FTS5.␍
- @repo/graphics:lint:biome: Found 58 errors.
- @repo/graphics:lint:biome: Found 26 warnings.
- @repo/library:lint:biome:     128     │ - → → → //·Sanitize·query·for·FTS5·(basic)␍
- @repo/people:lint:biome:      71     │ - → → const·{·data:·userRow,·error:·userError·}·=·await·supabase␍
- @repo/people:lint:biome:      76     │ - → → if·(userError)·throw·userError;␍
- @repo/library:lint:biome:     138     │ - → → }·catch·(error)·{␍
- @repo/library:lint:biome:     139     │ - → → → console.error("Local·search·failed:",·error);␍
- @repo/people:lint:biome:      89     │ - → → const·{·data:·bondRow,·error:·bondError·}·=·await·supabase␍
- @repo/graphics:lint:biome:   × Some errors were emitted while running checks.
- @repo/people:lint:biome:      96     │ - → → if·(bondError)·throw·bondError;␍
- @repo/analytics:lint:biome:      9    │ - → → throw·new·Error(␍
- @repo/people:lint:biome:          36 │ + ····const·{·data:·bondRows,·error:·bondError·}·=·await·supabase
- @repo/people:lint:biome:          41 │ + ····if·(bondError)·throw·bondError;
- @repo/people:lint:biome:      2    │ - import·{·handleAPIError·}·from·"@repo/core/logic";␍
- @repo/people:lint:biome:     24    │ - → → → const·{·error·}·=·await·supabase.from("school_echo_feedback").insert({␍
- @repo/people:lint:biome:     34    │ - → → → if·(error)·throw·error;␍
- @repo/people:lint:biome:     36    │ - → → }·catch·(error)·{␍
- @repo/people:lint:biome:     37    │ - → → → handleAPIError(error);␍
- @repo/analytics:lint:biome:         9 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');
- @repo/people:lint:biome:     48    │ - → → const·{·data,·error·}·=·await·supabase␍
- @repo/people:lint:biome:     57    │ - → → if·(error)·{␍
- @repo/people:lint:biome:     58    │ - → → → handleAPIError(error);␍
- @repo/people:lint:biome:         2 │ + import·{·handleAPIError·}·from·'@repo/core/logic';
- @repo/analytics:lint:biome:     18    │ - → → throw·new·Error(␍
- @repo/analytics:lint:biome:        16 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');
- @repo/people:lint:biome:        24 │ + ······const·{·error·}·=·await·supabase.from('school_echo_feedback').insert({
- @repo/people:lint:biome:        34 │ + ······if·(error)·throw·error;
- @repo/people:lint:biome:        36 │ + ····}·catch·(error)·{
- @repo/people:lint:biome:        37 │ + ······handleAPIError(error);
- @repo/people:lint:biome:        45 │ + ····const·{·data,·error·}·=·await·supabase
- @repo/people:lint:biome:        54 │ + ····if·(error)·{
- @repo/people:lint:biome:        55 │ + ······handleAPIError(error);
- @repo/people:lint:biome:       2     │ - import·{·handleAPIError·}·from·"@repo/core/logic";␍
- @repo/library:lint:biome:      62     │ - → → → request.onerror·=·()·=>·reject(request.error);␍
- @repo/people:lint:biome:      23     │ - → → }·catch·(error)·{␍
- @repo/people:lint:biome:      24     │ - → → → handleAPIError(error);␍
- @repo/library:lint:biome:     110     │ - → → → transaction.onerror·=·()·=>·reject(transaction.error);␍
- @repo/library:lint:biome:     126     │ - → → → → request.onerror·=·()·=>·resolve(null);␍
- @repo/people:lint:biome:      84     │ - → → }·catch·(error)·{␍
- @repo/people:lint:biome:      85     │ - → → → handleAPIError(error);␍
- @repo/people:lint:biome:      86     │ - → → → return·{·success:·false,·error·};␍
- @repo/people:lint:biome:      98     │ - → → }·catch·(error)·{␍
- @repo/people:lint:biome:      99     │ - → → → handleAPIError(error);␍
- @repo/people:lint:biome:     100     │ - → → → return·{·success:·false,·error·};␍
- @repo/people:lint:biome:     119     │ - → → }·catch·(error)·{␍
- @repo/people:lint:biome:     120     │ - → → → handleAPIError(error);␍
- @repo/people:lint:biome:     121     │ - → → → return·{·success:·false,·error·};␍
- @repo/people:lint:biome:           2 │ + import·{·handleAPIError·}·from·'@repo/core/logic';
- @repo/library:lint:biome:     141     │ - → → → //···2-param:·INSERT·\u2026·(key,·sync_status)··\u2190·error·path␍
- @repo/library:lint:biome:     150     │ - → → → → record·=·{·key,·sync_status:·params[1]·??·"error"·};␍
- @repo/analytics:lint:biome:      31     │ - → → → → ?·colors.error␍
- @repo/analytics:lint:biome:      32     │ - → → → → :·colors.warning;␍
- @repo/analytics:lint:biome:     107     │ - → → → → → → → → backgroundColor:·isOnTrack·?·colors.success·:·colors.warning,␍
- @repo/library:lint:biome:      35     │ - → → → const·{·data:·resourceData,·error:·resourceError·}·=·await·supabase␍
- @repo/library:lint:biome:      43     │ - → → → if·(resourceError)·{␍
- @repo/library:lint:biome:      44     │ - → → → → console.error("Fetch·resources·from·Supabase·failed:",·resourceError);␍
- @repo/library:lint:biome:      45     │ - → → → → throw·resourceError;␍
- @repo/library:lint:biome:      49     │ - → → → const·{·data:·layerData,·error:·layerError·}·=·await·supabase␍
- @repo/library:lint:biome:      55     │ - → → → if·(layerError)·throw·layerError;␍
- ERROR  @repo/workforce#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\workforce) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run lint:biome exited (1)
- ERROR  run failed: command  exited (1)
- @repo/core:check-types: src/adapters/native/NativeDeviceIdentityAdapter.ts(1,27): error TS2307: Cannot find module 'react-native-keychain' or its corresponding type declarations.
- @repo/core:check-types: src/adapters/supabase/communityRepository.ts(5,25): error TS2305: Module '"../../types"' has no exported member 'PollStatus'.
- @repo/core:check-types: src/adapters/zenstack/profileRepository.ts(98,3): error TS2739: Type '{ getUserProfile(userId: string): Promise<User | null>; getUserProfileAsOf(userId: string, asOf: string): Promise<User | null>; getUserProfileHistory(userId: string, limit?: number): Promise<...>; ... 13 more ...; getSchoolPulse(schoolId: string, options: ProfileTemporalReadOptions): Promise<...>; }' is missing the following properties from type 'ProfileRepository': getUserPreferences, updateUserPreferences
- @repo/core:check-types: src/api/classrooms.ts(51,12): error TS2352: Conversion of type 'Promise<any>' to type '{ total_students: number; average_attendance: number; pending_assignments: number; active_classrooms: number; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
- @repo/core:check-types: src/api/identity.ts(35,5): error TS2739: Type 'User' is missing the following properties from type '{ [x: string]: unknown; id: string; full_name: string; citizenship: string; pricing_tier: string; subjects_taught: string[]; qualifications: string[]; created_at: string; email?: string | null | undefined; ... 17 more ...; last_seen_at?: string | ... 1 more ... | undefined; }': citizenship, pricing_tier
- @repo/core:check-types: src/api/identity.ts(42,43): error TS2345: Argument of type 'Partial<{ [x: string]: unknown; id: string; full_name: string; citizenship: string; pricing_tier: string; subjects_taught: string[]; qualifications: string[]; created_at: string; email?: string | null | undefined; ... 17 more ...; last_seen_at?: string | ... 1 more ... | undefined; }>' is not assignable to parameter of type 'Partial<User>'.
- @repo/core:check-types: src/api/runtimes/classroomNotes.runtime.ts(1,56): error TS2307: Cannot find module '../../adapters/supabase/classroomNotesRepository' or its corresponding type declarations.
- @repo/core:check-types: src/api/runtimes/profile.runtime.ts(10,5): error TS2554: Expected 2 arguments, but got 1.
- @repo/core:check-types: src/hooks/useAuthorityLifecycle.ts(118,9): error TS2322: Type 'AuthSession | null' is not assignable to type 'Session | null'.
- @repo/core:check-types: src/hooks/useFeatureRegistry.ts(48,6): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
- @repo/core:check-types: src/index.ts(12,10): error TS2300: Duplicate identifier 'marksToGPA'.
- @repo/core:check-types: src/index.ts(13,10): error TS2300: Duplicate identifier 'marksToGPA'.
- @repo/core:check-types: src/logic/domains/community/ports.ts(1,25): error TS2305: Module '"../../../types"' has no exported member 'PollStatus'.
- @repo/core:check-types: src/logic/domains/factory.ts(5,56): error TS2307: Cannot find module '../../adapters/supabase/classroomNotesRepository' or its corresponding type declarations.
- @repo/core:check-types: src/logic/index.ts(18,8): error TS2300: Duplicate identifier 'InviteCodeData'.
- @repo/core:check-types: src/logic/index.ts(19,3): error TS2300: Duplicate identifier 'incrementInviteCodeUsage'.
- @repo/core:check-types: src/logic/index.ts(20,3): error TS2300: Duplicate identifier 'validateInviteCode'.
- @repo/core:check-types: src/logic/index.ts(23,8): error TS2300: Duplicate identifier 'InviteCodeData'.
- @repo/core:check-types: src/logic/index.ts(24,3): error TS2300: Duplicate identifier 'incrementInviteCodeUsage'.
- @repo/core:check-types: src/logic/index.ts(25,3): error TS2300: Duplicate identifier 'validateInviteCode'.
- @repo/core:check-types: src/logic/index.ts(77,1): error TS2308: Module './domains' has already exported a member named 'UserPreferences'. Consider explicitly re-exporting to resolve the ambiguity.
- @repo/core:check-types: src/logic/managers/AuthManager.ts(83,7): error TS2353: Object literal may only specify known properties, and 'citizenship' does not exist in type 'Partial<User>'.
- @repo/core:check-types: src/logic/managers/CommunityManager.ts(2,25): error TS2305: Module '"../../types"' has no exported member 'PollStatus'.
- @repo/core:check-types: src/logic/managers/DeepLinkManager.ts(46,51): error TS4111: Property 'access_token' comes from an index signature, so it must be accessed with ['access_token'].
- @repo/core:check-types: src/logic/managers/DeepLinkManager.ts(55,21): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
- @repo/core:check-types: src/logic/managers/DeepLinkManager.ts(77,33): error TS4111: Property 'access_token' comes from an index signature, so it must be accessed with ['access_token'].
- @repo/core:check-types: src/logic/managers/DeepLinkManager.ts(78,34): error TS4111: Property 'refresh_token' comes from an index signature, so it must be accessed with ['refresh_token'].
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(6,28): error TS2307: Cannot find module '../../../lib/grading' or its corresponding type declarations.
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(7,26): error TS2307: Cannot find module '../../../types/API' or its corresponding type declarations.
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(14,8): error TS2307: Cannot find module '../../schemas/classroom.schema' or its corresponding type declarations.
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(78,24): error TS2339: Property 'emitSilent' does not exist on type 'GrowthManager'.
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(94,26): error TS2339: Property 'emitSilent' does not exist on type 'GrowthManager'.
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(97,54): error TS4111: Property 'classroom_id' comes from an index signature, so it must be accessed with ['classroom_id'].
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(270,29): error TS2304: Cannot find name 'LessonMaterial'.
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(271,43): error TS2304: Cannot find name 'LessonMaterial'.
- @repo/core:check-types: src/logic/managers/EducationalManager.ts(294,24): error TS2339: Property 'emitSilent' does not exist on type 'GrowthManager'.
- @repo/core:check-types: src/logic/managers/PushNotificationManager.ts(47,33): error TS4111: Property 'url' comes from an index signature, so it must be accessed with ['url'].
- @repo/core:check-types: src/logic/managers/TeacherManager.ts(2,22): error TS2307: Cannot find module '../../../types' or its corresponding type declarations.
- @repo/core:check-types: src/logic/managers/TeacherManager.ts(3,26): error TS2307: Cannot find module '../../../types/API' or its corresponding type declarations.
- @repo/core:check-types: src/logic/permissions/composer.test.ts(7,9): error TS2739: Type '{ user_id: string; userId: string; email: string; school_id: string; schoolId: string; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; ... 14 more ...; classroom_id: null; }' is missing the following properties from type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...': citizenship, pricing_tier
- @repo/core:check-types: src/logic/permissions/hooks/usePermissions.ts(25,11): error TS2739: Type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 21 more ...; classr...' is missing the following properties from type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...': citizenship, pricing_tier
- @repo/core:check-types: src/logic/schemas/feature-registry.schema.ts(19,15): error TS2554: Expected 2-3 arguments, but got 1.
- @repo/core:check-types: src/logic/schemas/index.ts(12,1): error TS2308: Module './classroom.schema' has already exported a member named 'Lesson'. Consider explicitly re-exporting to resolve the ambiguity.
- @repo/core:check-types: src/logic/schemas/index.ts(12,1): error TS2308: Module './classroom.schema' has already exported a member named 'LessonSchema'. Consider explicitly re-exporting to resolve the ambiguity.
- @repo/core:check-types: src/native/runtimeAdapter.ts(6,33): error TS2307: Cannot find module 'expo-background-task' or its corresponding type declarations.
- @repo/core:check-types: src/native/runtimeAdapter.ts(7,30): error TS2307: Cannot find module 'expo-task-manager' or its corresponding type declarations.
- @repo/core:check-types: src/native/runtimeAdapter.ts(8,32): error TS2307: Cannot find module 'expo-notifications' or its corresponding type declarations.
- @repo/core:check-types: src/native/runtimeAdapter.ts(26,23): error TS2307: Cannot find module 'expo-font' or its corresponding type declarations.
- @repo/core:check-types: src/native/runtimeAdapter.ts(175,62): error TS7006: Parameter 'token' implicitly has an 'any' type.
- @repo/core:check-types: src/native/useAuthorityLifecycle.ts(114,20): error TS2345: Argument of type 'AuthSession | null' is not assignable to parameter of type 'SetStateAction<Session | null>'.
- @repo/core:check-types: src/native/useAuthorityLifecycle.ts(115,24): error TS2345: Argument of type 'AuthSession | null' is not assignable to parameter of type 'Session | null'.
- @repo/core:check-types: src/store/resetScopedStores.ts(49,51): error TS2345: Argument of type '{ user_id: null; userId: null; email: null; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; role: null; traits: never[]; ... 14 more ...; classroom_id: null; }' is not assignable to parameter of type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...'.
- @repo/core:check-types: src/store/slices/feature.slice.ts(23,30): error TS2345: Argument of type '{ user_id: null; userId: null; email: null; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; role: null; traits: never[]; ... 14 more ...; classroom_id: null; }' is not assignable to parameter of type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...'.
- @repo/core:check-types: src/types/API.ts(3,14): error TS2415: Class 'APIError' incorrectly extends base class 'SovereignError'.
- @repo/core:check-types:   Property 'details' is optional in type 'APIError' but required in type 'SovereignError'.
- @repo/core:check-types: src/types/API.ts(7,5): error TS4115: This parameter property must have an 'override' modifier because it overrides a member in base class 'SovereignError'.
- ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)
- ERROR  run failed: command  exited (2)
- x 88 dependency violations (20 errors, 68 warnings). 2012 modules, 6416 dependencies cruised.
- x 88 dependency violations (20 errors, 68 warnings). 2012 modules, 6416 dependencies cruised.
- x 88 dependency violations (20 errors, 68 warnings). 2012 modules, 6416 dependencies cruised.
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - scanner.errors.customBuild
- - scanner.errors.noQrFound
- - scanner.errors.scanFailed
- - scanner.web.emptyError
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - scanner.errors.customBuild
- - scanner.errors.noQrFound
- - scanner.errors.scanFailed
- - scanner.web.emptyError

### Category: apps/edlove-web
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs

### Category: apps/gurudevi-marketingWeb
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs

### Category: apps/gurudevi-mobile
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js

### Category: apps/intuitui-web
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs

### Category: apps/neevsk-web
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs

### Category: packages/admin
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts

### Category: packages/analytics
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx

### Category: packages/community
- warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts

### Category: packages/core
- @repo/core:check-types: src/hooks/useFeatureRegistry.ts(2,62): error TS1149: File name 'C:/Users/Naween/projects/polymath-platform/packages/core/src/types/workspace.ts' differs from already included file name 'C:/Users/Naween/projects/polymath-platform/packages/core/src/types/Workspace.ts' only in casing.
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- error no-circular: packages/core/src/logic/managers/NotificationManager.ts →
- error no-circular: packages/core/src/logic/managers/GrowthManager.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/EducationalManager.ts →
- error no-circular: packages/core/src/logic/managers/EducationalManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/hooks/useNotifications.ts →
- error no-circular: packages/core/src/api/growthSignals.ts →
- error no-circular: packages/core/src/api/growthSignals.generated.ts →
- error no-circular: packages/core/src/api/deviceTrust.ts →
- error no-circular: packages/core/src/adapters/zenstack/profileRepository.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabase/profileRepository.ts →
- error no-circular: packages/core/src/adapters/supabase/profileRepository.ts →
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- error no-circular: packages/core/src/logic/managers/NotificationManager.ts →
- error no-circular: packages/core/src/logic/managers/GrowthManager.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/EducationalManager.ts →
- error no-circular: packages/core/src/logic/managers/EducationalManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/hooks/useNotifications.ts →
- error no-circular: packages/core/src/api/growthSignals.ts →
- error no-circular: packages/core/src/api/growthSignals.generated.ts →
- error no-circular: packages/core/src/api/deviceTrust.ts →
- error no-circular: packages/core/src/adapters/zenstack/profileRepository.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabase/profileRepository.ts →
- error no-circular: packages/core/src/adapters/supabase/profileRepository.ts →
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- error no-circular: packages/core/src/logic/managers/NotificationManager.ts →
- error no-circular: packages/core/src/logic/managers/GrowthManager.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/factory.ts →
- error no-circular: packages/core/src/logic/managers/EducationalManager.ts →
- error no-circular: packages/core/src/logic/managers/EducationalManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts →
- error no-circular: packages/core/src/hooks/useNotifications.ts →
- error no-circular: packages/core/src/api/growthSignals.ts →
- error no-circular: packages/core/src/api/growthSignals.generated.ts →
- error no-circular: packages/core/src/api/deviceTrust.ts →
- error no-circular: packages/core/src/adapters/zenstack/profileRepository.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts →
- error no-circular: packages/core/src/adapters/supabase/profileRepository.ts →
- error no-circular: packages/core/src/adapters/supabase/profileRepository.ts →

### Category: packages/library
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts

### Category: packages/lk-edu-geo
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts

### Category: packages/profile
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src
- warn no-orphans: packages/trube-art/src
- warn no-orphans: packages/trube-art/src

### Category: packages/ui
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/button.tsx

## Raw Output

```text

> polymath-platform@1.0.0 lint C:\Users\Naween\projects\polymath-platform
> pnpm turbo run lint


• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running lint in 29 packages

   • Remote caching disabled


@repo/analytics:lint:biome: cache miss, executing 3e2640b64aa6649b

@repo/library:lint:biome: cache miss, executing 3b144ce07f06b2fa

apps-edlove-web:lint:biome: cache miss, executing bb9b9b8b1a01a647

@repo/accounting:lint:biome: cache miss, executing 3c8733fc1d890135

@repo/types-shim:lint:biome: cache miss, executing 53dfbad9969510a1

@repo/core:lint:biome: cache miss, executing 0946bf98fa4f48d9

@repo/graphics:lint:biome: cache miss, executing 136660b1c611c1d1

@repo/workforce:lint:biome: cache miss, executing 08f08838928cf04a

@repo/ui:lint:biome: cache miss, executing 34d6bd5ff5006422

@repo/people:lint:biome: cache miss, executing 6deb65b7af1a5390

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: > @repo/analytics@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\analytics

@repo/analytics:lint:biome: > biome check .

@repo/analytics:lint:biome: 

@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: > @repo/graphics@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:lint:biome: > biome check .
@repo/graphics:lint:biome: 

@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: > @repo/types-shim@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:lint:biome: > biome check .
@repo/types-shim:lint:biome: 

@repo/people:lint:biome: 

@repo/people:lint:biome: > @repo/people@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:lint:biome: > biome check .
@repo/people:lint:biome: 

@repo/library:lint:biome: 

@repo/library:lint:biome: > @repo/library@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:lint:biome: > biome check .
@repo/library:lint:biome: 

@repo/core:lint:biome: 
@repo/core:lint:biome: > @repo/core@0.1.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:lint:biome: > biome check .
@repo/core:lint:biome: 

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: > apps-edlove-web@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:lint:biome: > biome check .
apps-edlove-web:lint:biome: 

@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: > @repo/accounting@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:lint:biome: > biome check .
@repo/accounting:lint:biome: 

@repo/ui:lint:biome: 
@repo/ui:lint:biome: > @repo/ui@1.1.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome: > biome check .
@repo/ui:lint:biome: 

@repo/workforce:lint:biome: 

@repo/workforce:lint:biome: > @repo/workforce@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:lint:biome: > biome check .
@repo/workforce:lint:biome: 

@repo/types-shim:lint:biome: index.d.ts:49:45 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     47 │ 	import * as React from "react";
@repo/types-shim:lint:biome:     48 │ 
@repo/types-shim:lint:biome:   > 49 │ 	export const BarChart: React.ComponentType<any>;

@repo/types-shim:lint:biome:        │ 	                                           ^^^
@repo/types-shim:lint:biome:     50 │ 	export const PieChart: React.ComponentType<any>;

@repo/types-shim:lint:biome:     51 │ }
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome: index.d.ts:50:45 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.

@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     49 │ 	export const BarChart: React.ComponentType<any>;

@repo/types-shim:lint:biome:   > 50 │ 	export const PieChart: React.ComponentType<any>;

@repo/types-shim:lint:biome:        │ 	                                           ^^^
@repo/types-shim:lint:biome:     51 │ }
@repo/types-shim:lint:biome:     52 │ 
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome: index.d.ts:54:24 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     53 │ declare module "react-native-gesture-handler" {
@repo/types-shim:lint:biome:   > 54 │ 	export const Gesture: any;
@repo/types-shim:lint:biome:        │ 	                      ^^^
@repo/types-shim:lint:biome:     55 │ 	export const GestureDetector: any;
@repo/types-shim:lint:biome:     56 │ 	export const GestureHandlerRootView: any;
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome: index.d.ts:55:32 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.

@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     53 │ declare module "react-native-gesture-handler" {
@repo/types-shim:lint:biome:     54 │ 	export const Gesture: any;
@repo/types-shim:lint:biome:   > 55 │ 	export const GestureDetector: any;
@repo/types-shim:lint:biome:        │ 	                              ^^^
@repo/types-shim:lint:biome:     56 │ 	export const GestureHandlerRootView: any;

@repo/types-shim:lint:biome:     57 │ 	export const PanGestureHandler: any;
@repo/types-shim:lint:biome:   

@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/types-shim:lint:biome:   

@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome: index.d.ts:56:39 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.

@repo/types-shim:lint:biome:   

@repo/types-shim:lint:biome:     54 │ 	export const Gesture: any;

@repo/types-shim:lint:biome:     55 │ 	export const GestureDetector: any;

@repo/types-shim:lint:biome:   > 56 │ 	export const GestureHandlerRootView: any;

@repo/types-shim:lint:biome:        │ 	                                     ^^^
@repo/types-shim:lint:biome:     57 │ 	export const PanGestureHandler: any;
@repo/types-shim:lint:biome:     58 │ 	export const PinchGestureHandler: any;
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: index.d.ts:57:34 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     55 │ 	export const GestureDetector: any;
@repo/types-shim:lint:biome:     56 │ 	export const GestureHandlerRootView: any;
@repo/types-shim:lint:biome:   > 57 │ 	export const PanGestureHandler: any;
@repo/types-shim:lint:biome:        │ 	                                ^^^
@repo/types-shim:lint:biome:     58 │ 	export const PinchGestureHandler: any;
@repo/types-shim:lint:biome:     59 │ 	export const State: any;

@repo/types-shim:lint:biome:   

@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: Checked 5 files in 503ms. No fixes applied.
@repo/types-shim:lint:biome: Found 2 errors.
@repo/types-shim:lint:biome: Found 10 warnings.

@repo/types-shim:lint:biome: index.d.ts:58:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     56 │ 	export const GestureHandlerRootView: any;
@repo/types-shim:lint:biome:     57 │ 	export const PanGestureHandler: any;
@repo/types-shim:lint:biome:   > 58 │ 	export const PinchGestureHandler: any;
@repo/types-shim:lint:biome:        │ 	                                  ^^^
@repo/types-shim:lint:biome:     59 │ 	export const State: any;
@repo/types-shim:lint:biome:     60 │ }
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: index.d.ts:59:22 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     57 │ 	export const PanGestureHandler: any;
@repo/types-shim:lint:biome:     58 │ 	export const PinchGestureHandler: any;
@repo/types-shim:lint:biome:   > 59 │ 	export const State: any;
@repo/types-shim:lint:biome:        │ 	                    ^^^
@repo/types-shim:lint:biome:     60 │ }
@repo/types-shim:lint:biome:     61 │ 
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: index.d.ts:66:19 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     64 │ 	export function defineTask(
@repo/types-shim:lint:biome:     65 │ 		taskName: string,
@repo/types-shim:lint:biome:   > 66 │ 		task: (...args: any[]) => any,
@repo/types-shim:lint:biome:        │ 		                ^^^
@repo/types-shim:lint:biome:     67 │ 	): void;
@repo/types-shim:lint:biome:     68 │ 	export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;

@repo/types-shim:lint:biome:   

@repo/workforce:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/workforce:lint:biome: 
@repo/workforce:lint:biome:   × Formatter would have printed the following content:
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/base";␍
@repo/workforce:lint:biome:     2   │ - ␍
@repo/workforce:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/workforce:lint:biome:     4   │ - export·default·[...config];␍
@repo/workforce:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/base';
@repo/workforce:lint:biome:       2 │ + 
@repo/workforce:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/workforce:lint:biome:       4 │ + export·default·[...config];

@repo/workforce:lint:biome:     5 5 │   
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: src\WorkforceShell.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome:   × Formatter would have printed the following content:
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome:      1    │ - import·{·FeatureGuard·}·from·"@repo/core/logic";␍
@repo/workforce:lint:biome:      2    │ - import·{·Box,·Heading,·Icon,·Text,·Theme,·VStack·}·from·"@repo/ui/primitives";␍
@repo/workforce:lint:biome:      3    │ - import·{·Hammer,·Users2·}·from·"lucide-react-native";␍
@repo/workforce:lint:biome:      4    │ - ␍
@repo/workforce:lint:biome:      5    │ - export·default·function·WorkforceShell()·{␍
@repo/workforce:lint:biome:      6    │ - → return·(␍
@repo/workforce:lint:biome:      7    │ - → → <FeatureGuard·feature="isDevelopingWorkforce">␍
@repo/workforce:lint:biome:      8    │ - → → → <VStack␍
@repo/workforce:lint:biome:      9    │ - → → → → className="flex-1·justify-center·items-center·p-10·bg-phase-canvas"␍
@repo/workforce:lint:biome:     10    │ - → → → → space="xl"␍
@repo/workforce:lint:biome:     11    │ - → → → >␍

@repo/workforce:lint:biome:     12    │ - → → → → <Box·className="w-[100px]·h-[100px]·rounded-full·justify-center·items-center·bg-sanctuarySaffron/10">␍

@repo/workforce:lint:biome:     13    │ - → → → → → <Icon·as={Users2}·size={48}·color={Theme.colors.sanctuarySaffron}·/>␍
@repo/workforce:lint:biome:     14    │ - → → → → </Box>␍
@repo/workforce:lint:biome:     15    │ - ␍
@repo/workforce:lint:biome:     16    │ - → → → → <VStack·space="sm"·className="items-center">␍
@repo/workforce:lint:biome:     17    │ - → → → → → <Heading·size="xl"·className="text-center">␍
@repo/workforce:lint:biome:     18    │ - → → → → → → Workforce·Management␍
@repo/workforce:lint:biome:     19    │ - → → → → → </Heading>␍
@repo/workforce:lint:biome:     20    │ - → → → → → <Text·className="text-phaseText-secondary·text-center·max-w-[320px]">␍
@repo/workforce:lint:biome:     21    │ - → → → → → → Streamline·institutional·human·capital·with·digital·dignity.␍
@repo/workforce:lint:biome:     22    │ - → → → → → </Text>␍
@repo/workforce:lint:biome:     23    │ - → → → → </VStack>␍

@repo/workforce:lint:biome:     24    │ - ␍
@repo/workforce:lint:biome:     25    │ - → → → → <Box·className="flex-row·items-center·gap-2·p-3·bg-black/5·rounded-2xl">␍
@repo/workforce:lint:biome:     26    │ - → → → → → <Icon·as={Hammer}·size={16}·color={Theme.colors.sanctuarySaffron}·/>␍
@repo/workforce:lint:biome:     27    │ - → → → → → <Text·size="xs"·className="font-bold·text-sanctuarySaffron">␍
@repo/workforce:lint:biome:     28    │ - → → → → → → UNDER·ACTIVE·CONSTRUCTION␍
@repo/workforce:lint:biome:     29    │ - → → → → → </Text>␍
@repo/workforce:lint:biome:     30    │ - → → → → </Box>␍
@repo/workforce:lint:biome:     31    │ - → → → </VStack>␍
@repo/workforce:lint:biome:     32    │ - → → </FeatureGuard>␍
@repo/workforce:lint:biome:     33    │ - → );␍
@repo/workforce:lint:biome:     34    │ - }␍

@repo/workforce:lint:biome:         1 │ + import·{·FeatureGuard·}·from·'@repo/core/logic';
@repo/workforce:lint:biome:         2 │ + import·{·Box,·Heading,·Icon,·Text,·Theme,·VStack·}·from·'@repo/ui/primitives';
@repo/workforce:lint:biome:         3 │ + import·{·Hammer,·Users2·}·from·'lucide-react-native';
@repo/workforce:lint:biome:         4 │ + 
@repo/workforce:lint:biome:         5 │ + export·default·function·WorkforceShell()·{
@repo/workforce:lint:biome:         6 │ + ··return·(
@repo/workforce:lint:biome:         7 │ + ····<FeatureGuard·feature="isDevelopingWorkforce">
@repo/workforce:lint:biome:         8 │ + ······<VStack·className="flex-1·justify-center·items-center·p-10·bg-phase-canvas"·space="xl">
@repo/workforce:lint:biome:         9 │ + ········<Box·className="w-[100px]·h-[100px]·rounded-full·justify-center·items-center·bg-sanctuarySaffron/10">

@repo/workforce:lint:biome:        10 │ + ··········<Icon·as={Users2}·size={48}·color={Theme.colors.sanctuarySaffron}·/>
@repo/workforce:lint:biome:        11 │ + ········</Box>
@repo/workforce:lint:biome:        12 │ + 
@repo/workforce:lint:biome:        13 │ + ········<VStack·space="sm"·className="items-center">
@repo/workforce:lint:biome:        14 │ + ··········<Heading·size="xl"·className="text-center">
@repo/workforce:lint:biome:        15 │ + ············Workforce·Management
@repo/workforce:lint:biome:        16 │ + ··········</Heading>
@repo/workforce:lint:biome:        17 │ + ··········<Text·className="text-phaseText-secondary·text-center·max-w-[320px]">
@repo/workforce:lint:biome:        18 │ + ············Streamline·institutional·human·capital·with·digital·dignity.
@repo/workforce:lint:biome:        19 │ + ··········</Text>

@repo/workforce:lint:biome:        20 │ + ········</VStack>
@repo/workforce:lint:biome:        21 │ + 
@repo/workforce:lint:biome:        22 │ + ········<Box·className="flex-row·items-center·gap-2·p-3·bg-black/5·rounded-2xl">
@repo/workforce:lint:biome:        23 │ + ··········<Icon·as={Hammer}·size={16}·color={Theme.colors.sanctuarySaffron}·/>
@repo/workforce:lint:biome:        24 │ + ··········<Text·size="xs"·className="font-bold·text-sanctuarySaffron">
@repo/workforce:lint:biome:        25 │ + ············UNDER·ACTIVE·CONSTRUCTION
@repo/workforce:lint:biome:        26 │ + ··········</Text>
@repo/workforce:lint:biome:        27 │ + ········</Box>
@repo/workforce:lint:biome:        28 │ + ······</VStack>
@repo/workforce:lint:biome:        29 │ + ····</FeatureGuard>
@repo/workforce:lint:biome:        30 │ + ··);
@repo/workforce:lint:biome:        31 │ + }

@repo/workforce:lint:biome:     35 32 │   
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: src\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/workforce:lint:biome: 

@repo/workforce:lint:biome:   × Formatter would have printed the following content:
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome:      1    │ - export·type·WorkforceJobFamily·=␍
@repo/workforce:lint:biome:      2    │ - → |·"academic"␍
@repo/workforce:lint:biome:      3    │ - → |·"operations"␍
@repo/workforce:lint:biome:      4    │ - → |·"finance"␍
@repo/workforce:lint:biome:      5    │ - → |·"wellbeing"␍
@repo/workforce:lint:biome:      6    │ - → |·"facilities"␍
@repo/workforce:lint:biome:      7    │ - → |·"transport"␍

@repo/workforce:lint:biome:      8    │ - → |·"food_service"␍
@repo/workforce:lint:biome:      9    │ - → |·"external_service";␍
@repo/workforce:lint:biome:     10    │ - ␍
@repo/workforce:lint:biome:     11    │ - export·interface·WorkforcePosition·{␍
@repo/workforce:lint:biome:     12    │ - → id:·string;␍
@repo/workforce:lint:biome:     13    │ - → schoolId:·string;␍
@repo/workforce:lint:biome:     14    │ - → title:·string;␍
@repo/workforce:lint:biome:     15    │ - → family:·WorkforceJobFamily;␍
@repo/workforce:lint:biome:     16    │ - → reportsToUserId?:·string·|·null;␍

@repo/workforce:lint:biome:     17    │ - → active:·boolean;␍
@repo/workforce:lint:biome:     18    │ - }␍
@repo/workforce:lint:biome:     19    │ - ␍
@repo/workforce:lint:biome:     20    │ - export·interface·WorkforceAssignment·{␍
@repo/workforce:lint:biome:     21    │ - → id:·string;␍
@repo/workforce:lint:biome:     22    │ - → userId:·string;␍
@repo/workforce:lint:biome:     23    │ - → schoolId:·string;␍
@repo/workforce:lint:biome:     24    │ - → positionId:·string;␍
@repo/workforce:lint:biome:     25    │ - → startDate?:·string·|·null;␍
@repo/workforce:lint:biome:     26    │ - → endDate?:·string·|·null;␍
@repo/workforce:lint:biome:     27    │ - → status:·"active"·|·"inactive"·|·"planned";␍

@repo/workforce:lint:biome:     28    │ - }␍
@repo/workforce:lint:biome:     29    │ - ␍
@repo/workforce:lint:biome:     30    │ - export·{·default·as·WorkforceShell·}·from·"./WorkforceShell";␍
@repo/workforce:lint:biome:         1 │ + export·type·WorkforceJobFamily·=
@repo/workforce:lint:biome:         2 │ + ··|·'academic'
@repo/workforce:lint:biome:         3 │ + ··|·'operations'
@repo/workforce:lint:biome:         4 │ + ··|·'finance'
@repo/workforce:lint:biome:         5 │ + ··|·'wellbeing'
@repo/workforce:lint:biome:         6 │ + ··|·'facilities'

@repo/workforce:lint:biome:         7 │ + ··|·'transport'
@repo/workforce:lint:biome:         8 │ + ··|·'food_service'
@repo/workforce:lint:biome:         9 │ + ··|·'external_service';

@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome: index.d.ts:66:29 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   ! Unexpected any. Specify a different type.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     64 │ 	export function defineTask(
@repo/types-shim:lint:biome:     65 │ 		taskName: string,
@repo/types-shim:lint:biome:   > 66 │ 		task: (...args: any[]) => any,
@repo/types-shim:lint:biome:        │ 		                          ^^^
@repo/types-shim:lint:biome:     67 │ 	): void;
@repo/types-shim:lint:biome:     68 │ 	export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;

@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: index.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   × Formatter would have printed the following content:
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:      1    │ - //·This·is·an·empty·type·definition·file·to·satisfy·legacy·peer·dependencies.␍
@repo/types-shim:lint:biome:      2    │ - //·React·Native·0.83+·provides·its·own·types.␍

@repo/types-shim:lint:biome:      3    │ - //␍
@repo/types-shim:lint:biome:      4    │ - //·Monorepo·convention:␍
@repo/types-shim:lint:biome:      5    │ - //·We·allow·`className`·on·core·React·Native·primitives·to·support·web·+·tailwind-style␍
@repo/types-shim:lint:biome:      6    │ - //·styling·(e.g.·via·`react-native-web`,·`react-native-css-interop`,·etc.).·The·runtime␍
@repo/types-shim:lint:biome:      7    │ - //·integration·varies·by·app,·but·the·prop·is·intentionally·tolerated·at·the·type·level.␍
@repo/types-shim:lint:biome:      8    │ - ␍
@repo/types-shim:lint:biome:      9    │ - declare·module·"react-native"·{␍
@repo/types-shim:lint:biome:     10    │ - → interface·ViewProps·{␍
@repo/types-shim:lint:biome:     11    │ - → → className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     12    │ - → }␍
@repo/types-shim:lint:biome:     13    │ - ␍
@repo/types-shim:lint:biome:     14    │ - → interface·TextProps·{␍
@repo/types-shim:lint:biome:     15    │ - → → className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     16    │ - → }␍
@repo/types-shim:lint:biome:     17    │ - ␍

@repo/types-shim:lint:biome:     18    │ - → interface·TextInputProps·{␍
@repo/types-shim:lint:biome:     19    │ - → → className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     20    │ - → → accessibilityDescribedBy?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     21    │ - → }␍
@repo/types-shim:lint:biome:     22    │ - ␍
@repo/types-shim:lint:biome:     23    │ - → interface·PressableProps·{␍
@repo/types-shim:lint:biome:     24    │ - → → className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     25    │ - → }␍
@repo/types-shim:lint:biome:     26    │ - ␍
@repo/types-shim:lint:biome:     27    │ - → interface·ImageProps·{␍
@repo/types-shim:lint:biome:     28    │ - → → className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     29    │ - → }␍
@repo/types-shim:lint:biome:     30    │ - ␍

@repo/types-shim:lint:biome:     31    │ - → interface·ImageBackgroundProps·{␍
@repo/types-shim:lint:biome:     32    │ - → → className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     33    │ - → }␍
@repo/types-shim:lint:biome:     34    │ - ␍
@repo/types-shim:lint:biome:     35    │ - → interface·ScrollViewProps·{␍
@repo/types-shim:lint:biome:     36    │ - → → className?:·string·|·undefined;␍

@repo/types-shim:lint:biome:     37    │ - → → contentContainerClassName?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     38    │ - → }␍
@repo/types-shim:lint:biome:     39    │ - ␍

@repo/types-shim:lint:biome:     40    │ - → interface·FlatListProps<ItemT>·{␍
@repo/types-shim:lint:biome:     41    │ - → → className?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     42    │ - → → contentContainerClassName?:·string·|·undefined;␍
@repo/types-shim:lint:biome:     43    │ - → }␍
@repo/types-shim:lint:biome:     44    │ - }␍
@repo/types-shim:lint:biome:     45    │ - ␍
@repo/types-shim:lint:biome:     46    │ - declare·module·"react-native-gifted-charts"·{␍
@repo/types-shim:lint:biome:     47    │ - → import·*·as·React·from·"react";␍
@repo/types-shim:lint:biome:     48    │ - ␍
@repo/types-shim:lint:biome:     49    │ - → export·const·BarChart:·React.ComponentType<any>;␍
@repo/types-shim:lint:biome:     50    │ - → export·const·PieChart:·React.ComponentType<any>;␍
@repo/types-shim:lint:biome:     51    │ - }␍
@repo/types-shim:lint:biome:     52    │ - ␍
@repo/types-shim:lint:biome:     53    │ - declare·module·"react-native-gesture-handler"·{␍
@repo/types-shim:lint:biome:     54    │ - → export·const·Gesture:·any;␍
@repo/types-shim:lint:biome:     55    │ - → export·const·GestureDetector:·any;␍
@repo/types-shim:lint:biome:     56    │ - → export·const·GestureHandlerRootView:·any;␍

@repo/types-shim:lint:biome:     57    │ - → export·const·PanGestureHandler:·any;␍
@repo/types-shim:lint:biome:     58    │ - → export·const·PinchGestureHandler:·any;␍
@repo/types-shim:lint:biome:     59    │ - → export·const·State:·any;␍
@repo/types-shim:lint:biome:     60    │ - }␍
@repo/types-shim:lint:biome:     61    │ - ␍
@repo/types-shim:lint:biome:     62    │ - 
@repo/types-shim:lint:biome:     63    │ - declare·module·"expo-task-manager"·{
@repo/types-shim:lint:biome:     64    │ - → export·function·defineTask(
@repo/types-shim:lint:biome:     65    │ - → → taskName:·string,
@repo/types-shim:lint:biome:     66    │ - → → task:·(...args:·any[])·=>·any,
@repo/types-shim:lint:biome:     67    │ - → ):·void;
@repo/types-shim:lint:biome:     68    │ - → export·function·isTaskRegisteredAsync(taskName:·string):·Promise<boolean>;
@repo/types-shim:lint:biome:         1 │ + //·This·is·an·empty·type·definition·file·to·satisfy·legacy·peer·dependencies.

@repo/types-shim:lint:biome:         2 │ + //·React·Native·0.83+·provides·its·own·types.

@repo/types-shim:lint:biome:         3 │ + //

@repo/types-shim:lint:biome:         4 │ + //·Monorepo·convention:

@repo/types-shim:lint:biome:         5 │ + //·We·allow·`className`·on·core·React·Native·primitives·to·support·web·+·tailwind-style

@repo/types-shim:lint:biome:         6 │ + //·styling·(e.g.·via·`react-native-web`,·`react-native-css-interop`,·etc.).·The·runtime

@repo/types-shim:lint:biome:         7 │ + //·integration·varies·by·app,·but·the·prop·is·intentionally·tolerated·at·the·type·level.

@repo/types-shim:lint:biome:         8 │ + 

@repo/types-shim:lint:biome:         9 │ + declare·module·'react-native'·{

@repo/types-shim:lint:biome:        10 │ + ··interface·ViewProps·{

@repo/types-shim:lint:biome:        11 │ + ····className?:·string·|·undefined;

@repo/types-shim:lint:biome:        12 │ + ··}

@repo/types-shim:lint:biome:        13 │ + 

@repo/types-shim:lint:biome:        14 │ + ··interface·TextProps·{

@repo/types-shim:lint:biome:        15 │ + ····className?:·string·|·undefined;

@repo/workforce:lint:biome:        10 │ + 

@repo/workforce:lint:biome: Checked 6 files in 635ms. No fixes applied.

@repo/workforce:lint:biome:        11 │ + export·interface·WorkforcePosition·{

@repo/workforce:lint:biome: Found 4 errors.

@repo/workforce:lint:biome:        12 │ + ··id:·string;
@repo/workforce:lint:biome:        13 │ + ··schoolId:·string;
@repo/workforce:lint:biome:        14 │ + ··title:·string;
@repo/workforce:lint:biome:        15 │ + ··family:·WorkforceJobFamily;
@repo/workforce:lint:biome:        16 │ + ··reportsToUserId?:·string·|·null;
@repo/workforce:lint:biome:        17 │ + ··active:·boolean;
@repo/workforce:lint:biome:        18 │ + }
@repo/workforce:lint:biome:        19 │ + 
@repo/workforce:lint:biome:        20 │ + export·interface·WorkforceAssignment·{
@repo/workforce:lint:biome:        21 │ + ··id:·string;
@repo/workforce:lint:biome:        22 │ + ··userId:·string;
@repo/workforce:lint:biome:        23 │ + ··schoolId:·string;
@repo/workforce:lint:biome:        24 │ + ··positionId:·string;

@repo/workforce:lint:biome:        25 │ + ··startDate?:·string·|·null;
@repo/workforce:lint:biome:        26 │ + ··endDate?:·string·|·null;
@repo/workforce:lint:biome:        27 │ + ··status:·'active'·|·'inactive'·|·'planned';
@repo/workforce:lint:biome:        28 │ + }

@repo/workforce:lint:biome:        29 │ + 

@repo/workforce:lint:biome:        30 │ + export·{·default·as·WorkforceShell·}·from·'./WorkforceShell';
@repo/workforce:lint:biome:     31 31 │   
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome:   × Formatter would have printed the following content:
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome:      1    │ - {␍
@repo/workforce:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
@repo/workforce:lint:biome:      3    │ - → "compilerOptions":·{␍
@repo/workforce:lint:biome:      4    │ - → → "outDir":·"dist",␍
@repo/workforce:lint:biome:      5    │ - → → "rootDir":·"src",␍
@repo/workforce:lint:biome:      6    │ - → → "baseUrl":·".",␍
@repo/workforce:lint:biome:      7    │ - → → "jsx":·"react-native",␍
@repo/workforce:lint:biome:      8    │ - → → "esModuleInterop":·true,␍
@repo/workforce:lint:biome:      9    │ - → → "skipLibCheck":·true,␍
@repo/workforce:lint:biome:     10    │ - → → "paths":·{␍

@repo/workforce:lint:biome:     11    │ - → → → "@/*":·["src/*"]␍

@repo/types-shim:lint:biome:        16 │ + ··}

@repo/types-shim:lint:biome:        17 │ + 
@repo/types-shim:lint:biome:        18 │ + ··interface·TextInputProps·{
@repo/types-shim:lint:biome:        19 │ + ····className?:·string·|·undefined;
@repo/types-shim:lint:biome:        20 │ + ····accessibilityDescribedBy?:·string·|·undefined;
@repo/types-shim:lint:biome:        21 │ + ··}
@repo/types-shim:lint:biome:        22 │ + 
@repo/types-shim:lint:biome:        23 │ + ··interface·PressableProps·{
@repo/types-shim:lint:biome:        24 │ + ····className?:·string·|·undefined;
@repo/types-shim:lint:biome:        25 │ + ··}
@repo/types-shim:lint:biome:        26 │ + 
@repo/types-shim:lint:biome:        27 │ + ··interface·ImageProps·{
@repo/types-shim:lint:biome:        28 │ + ····className?:·string·|·undefined;
@repo/types-shim:lint:biome:        29 │ + ··}
@repo/types-shim:lint:biome:        30 │ + 

@repo/types-shim:lint:biome:        31 │ + ··interface·ImageBackgroundProps·{

@repo/types-shim:lint:biome:        32 │ + ····className?:·string·|·undefined;
@repo/types-shim:lint:biome:        33 │ + ··}

@repo/types-shim:lint:biome:        34 │ + 
@repo/types-shim:lint:biome:        35 │ + ··interface·ScrollViewProps·{
@repo/types-shim:lint:biome:        36 │ + ····className?:·string·|·undefined;
@repo/types-shim:lint:biome:        37 │ + ····contentContainerClassName?:·string·|·undefined;
@repo/types-shim:lint:biome:        38 │ + ··}

@repo/types-shim:lint:biome:        39 │ + 
@repo/types-shim:lint:biome:        40 │ + ··interface·FlatListProps<ItemT>·{
@repo/types-shim:lint:biome:        41 │ + ····className?:·string·|·undefined;
@repo/types-shim:lint:biome:        42 │ + ····contentContainerClassName?:·string·|·undefined;
@repo/types-shim:lint:biome:        43 │ + ··}
@repo/types-shim:lint:biome:        44 │ + }
@repo/types-shim:lint:biome:        45 │ + 
@repo/types-shim:lint:biome:        46 │ + declare·module·'react-native-gifted-charts'·{

@repo/types-shim:lint:biome:        47 │ + ··import·*·as·React·from·'react';
@repo/types-shim:lint:biome:        48 │ + 
@repo/types-shim:lint:biome:        49 │ + ··export·const·BarChart:·React.ComponentType<any>;
@repo/types-shim:lint:biome:        50 │ + ··export·const·PieChart:·React.ComponentType<any>;
@repo/types-shim:lint:biome:        51 │ + }
@repo/types-shim:lint:biome:        52 │ + 
@repo/types-shim:lint:biome:        53 │ + declare·module·'react-native-gesture-handler'·{
@repo/types-shim:lint:biome:        54 │ + ··export·const·Gesture:·any;
@repo/types-shim:lint:biome:        55 │ + ··export·const·GestureDetector:·any;

@repo/types-shim:lint:biome:        56 │ + ··export·const·GestureHandlerRootView:·any;
@repo/types-shim:lint:biome:        57 │ + ··export·const·PanGestureHandler:·any;
@repo/types-shim:lint:biome:        58 │ + ··export·const·PinchGestureHandler:·any;
@repo/types-shim:lint:biome:        59 │ + ··export·const·State:·any;
@repo/types-shim:lint:biome:        60 │ + }
@repo/types-shim:lint:biome:        61 │ + 
@repo/types-shim:lint:biome:        62 │ + declare·module·'expo-task-manager'·{
@repo/types-shim:lint:biome:        63 │ + ··export·function·defineTask(taskName:·string,·task:·(...args:·any[])·=>·any):·void;
@repo/types-shim:lint:biome:        64 │ + ··export·function·isTaskRegisteredAsync(taskName:·string):·Promise<boolean>;
@repo/types-shim:lint:biome:     69 65 │   }
@repo/types-shim:lint:biome:     70 66 │   
@repo/types-shim:lint:biome:     71    │ - declare·module·"expo-background-task"·{
@repo/types-shim:lint:biome:     72    │ - → export·const·BackgroundTaskResult:·{

@repo/types-shim:lint:biome:     73    │ - → → NewData:·number;
@repo/types-shim:lint:biome:     74    │ - → → NoData:·number;
@repo/types-shim:lint:biome:     75    │ - → → Failed:·number;
@repo/types-shim:lint:biome:     76    │ - → };
@repo/types-shim:lint:biome:     77    │ - → export·const·BackgroundTaskStatus:·{
@repo/types-shim:lint:biome:     78    │ - → → Available:·number;
@repo/types-shim:lint:biome:     79    │ - → → Denied:·number;
@repo/types-shim:lint:biome:     80    │ - → → Restricted:·number;
@repo/types-shim:lint:biome:     81    │ - → };
@repo/types-shim:lint:biome:     82    │ - → export·type·BackgroundTaskOptions·=·{
@repo/types-shim:lint:biome:     83    │ - → → minimumInterval?:·number;

@repo/types-shim:lint:biome:     84    │ - → → stopOnTerminate?:·boolean;
@repo/types-shim:lint:biome:     85    │ - → → startOnBoot?:·boolean;
@repo/types-shim:lint:biome:     86    │ - → };
@repo/types-shim:lint:biome:   33 more lines truncated
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

@repo/types-shim:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   × Formatter would have printed the following content:
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:     1   │ - {␍
@repo/types-shim:lint:biome:     2   │ - ··"compilerOptions":·{␍
@repo/types-shim:lint:biome:     3   │ - ····"noEmit":·true,␍

@repo/types-shim:lint:biome:     4   │ - ····"skipLibCheck":·true␍
@repo/types-shim:lint:biome:     5   │ - ··},␍
@repo/types-shim:lint:biome:     6   │ - ··"include":·["index.d.ts"]␍
@repo/types-shim:lint:biome:     7   │ - }␍
@repo/types-shim:lint:biome:     8   │ - ␍
@repo/types-shim:lint:biome:       1 │ + {
@repo/types-shim:lint:biome:       2 │ + ··"compilerOptions":·{
@repo/types-shim:lint:biome:       3 │ + ····"noEmit":·true,
@repo/types-shim:lint:biome:       4 │ + ····"skipLibCheck":·true
@repo/types-shim:lint:biome:       5 │ + ··},
@repo/types-shim:lint:biome:       6 │ + ··"include":·["index.d.ts"]

@repo/types-shim:lint:biome:       7 │ + }
@repo/types-shim:lint:biome:     9 8 │   
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

@repo/workforce:lint:biome:     12    │ - → → }␍

@repo/workforce:lint:biome:     13    │ - → },␍

@repo/workforce:lint:biome:     14    │ - → "include":·["src/**/*"],␍

@repo/workforce:lint:biome:     15    │ - → "exclude":·["node_modules",·"dist"]␍

@repo/workforce:lint:biome:     16    │ - }␍

@repo/workforce:lint:biome:         1 │ + {

@repo/workforce:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",

@repo/workforce:lint:biome:         3 │ + ··"compilerOptions":·{

@repo/workforce:lint:biome:         4 │ + ····"outDir":·"dist",

@repo/workforce:lint:biome:         5 │ + ····"rootDir":·"src",

@repo/workforce:lint:biome:         6 │ + ····"baseUrl":·".",

@repo/workforce:lint:biome:         7 │ + ····"jsx":·"react-native",

@repo/workforce:lint:biome:         8 │ + ····"esModuleInterop":·true,

@repo/workforce:lint:biome:         9 │ + ····"skipLibCheck":·true,

@repo/workforce:lint:biome:        10 │ + ····"paths":·{

@repo/workforce:lint:biome:        11 │ + ······"@/*":·["src/*"]

@repo/workforce:lint:biome:        12 │ + ····}

@repo/workforce:lint:biome:        13 │ + ··},

@repo/workforce:lint:biome:        14 │ + ··"include":·["src/**/*"],

@repo/workforce:lint:biome:        15 │ + ··"exclude":·["node_modules",·"dist"]

@repo/workforce:lint:biome:        16 │ + }

@repo/workforce:lint:biome:     17 17 │   

@repo/workforce:lint:biome:   

@repo/workforce:lint:biome: 

@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx:37:5 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   ! Unexpected any. Specify a different type.
@repo/people:lint:biome:   
@repo/people:lint:biome:     35 │ 		variant = "primary",
@repo/people:lint:biome:     36 │ 		onPress,
@repo/people:lint:biome:   > 37 │ 	}: any) => {
@repo/people:lint:biome:        │ 	   ^^^
@repo/people:lint:biome:     38 │ 		const colorClasses = {
@repo/people:lint:biome:     39 │ 			primary:
@repo/people:lint:biome:   
@repo/people:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/people:lint:biome:   
@repo/people:lint:biome: 

@repo/people:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/people:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/react-internal";␍
@repo/people:lint:biome:     2   │ - ␍
@repo/people:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/people:lint:biome:     4   │ - export·default·[...config];␍
@repo/people:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/react-internal';
@repo/people:lint:biome:       2 │ + 
@repo/people:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/people:lint:biome:       4 │ + export·default·[...config];
@repo/people:lint:biome:     5 5 │   
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\StaffPresencePulse.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   

@repo/people:lint:biome:       1     │ - import·{␍
@repo/people:lint:biome:       2     │ - → Box,␍
@repo/people:lint:biome:       3     │ - → Heading,␍
@repo/people:lint:biome:       4     │ - → HStack,␍
@repo/people:lint:biome:       5     │ - → Icon,␍
@repo/people:lint:biome:       6     │ - → Pressable,␍
@repo/people:lint:biome:       7     │ - → Spinner,␍
@repo/people:lint:biome:       8     │ - → Text,␍
@repo/people:lint:biome:       9     │ - → VStack,␍

@repo/people:lint:biome:      10     │ - }·from·"@repo/ui/primitives";␍
@repo/people:lint:biome:      11     │ - import·{·hapticLight·}·from·"@repo/ui/utils/haptics";␍
@repo/people:lint:biome:      12     │ - ␍
@repo/people:lint:biome:      13     │ - import·{·format·}·from·"date-fns";␍
@repo/people:lint:biome:      14     │ - import·{␍
@repo/people:lint:biome:      15     │ - → Calendar,␍
@repo/people:lint:biome:      16     │ - → CheckCircle2,␍
@repo/people:lint:biome:      17     │ - → Clock,␍
@repo/people:lint:biome:      18     │ - → LogIn,␍
@repo/people:lint:biome:      19     │ - → LogOut,␍
@repo/people:lint:biome:      20     │ - }·from·"lucide-react-native";␍
@repo/people:lint:biome:      21     │ - import·type·React·from·"react";␍
@repo/people:lint:biome:      22     │ - import·{·useState·}·from·"react";␍
@repo/people:lint:biome:      23     │ - import·{·useTranslation·}·from·"react-i18next";␍
@repo/people:lint:biome:      24     │ - import·{·useStaffPresence·}·from·"../hooks/useStaffPresence";␍
@repo/people:lint:biome:      25     │ - ␍
@repo/people:lint:biome:      26     │ - interface·StaffPresencePulseProps·{␍
@repo/people:lint:biome:      27     │ - → userId:·string;␍
@repo/people:lint:biome:      28     │ - → schoolId:·string;␍
@repo/people:lint:biome:      29     │ - }␍
@repo/people:lint:biome:      30     │ - ␍
@repo/people:lint:biome:      31     │ - export·const·StaffPresencePulse:·React.FC<StaffPresencePulseProps>·=·({␍
@repo/people:lint:biome:      32     │ - → userId,␍
@repo/people:lint:biome:      33     │ - → schoolId,␍
@repo/people:lint:biome:      34     │ - })·=>·{␍
@repo/people:lint:biome:      35     │ - → const·{·t,·i18n·}·=·useTranslation();␍
@repo/people:lint:biome:      36     │ - → const·{·attendance,·isCheckedIn,·checkIn,·checkOut,·loading·}·=␍
@repo/people:lint:biome:      37     │ - → → useStaffPresence(userId,·schoolId);␍
@repo/people:lint:biome:      38     │ - → const·[actionLoading,·setActionLoading]·=·useState(false);␍
@repo/people:lint:biome:      39     │ - ␍
@repo/people:lint:biome:      40     │ - → const·handleToggleAttendance·=·async·()·=>·{␍
@repo/people:lint:biome:      41     │ - → → hapticLight();␍
@repo/people:lint:biome:      42     │ - → → setActionLoading(true);␍
@repo/people:lint:biome:      43     │ - → → try·{␍
@repo/people:lint:biome:      44     │ - → → → if·(isCheckedIn)·{␍
@repo/people:lint:biome:      45     │ - → → → → await·checkOut();␍
@repo/people:lint:biome:      46     │ - → → → }·else·{␍
@repo/people:lint:biome:      47     │ - → → → → await·checkIn();␍
@repo/people:lint:biome:      48     │ - → → → }␍
@repo/people:lint:biome:      49     │ - → → }·catch·(err)·{␍
@repo/people:lint:biome:      50     │ - → → → console.error("Attendance·toggle·failed:",·err);␍
@repo/people:lint:biome:      51     │ - → → }·finally·{␍
@repo/people:lint:biome:      52     │ - → → → setActionLoading(false);␍
@repo/people:lint:biome:      53     │ - → → }␍
@repo/people:lint:biome:      54     │ - → };␍
@repo/people:lint:biome:      55     │ - ␍
@repo/people:lint:biome:      56     │ - → if·(loading)·return·null;␍
@repo/people:lint:biome:      57     │ - ␍
@repo/people:lint:biome:      58     │ - → const·todayStr·=·format(new·Date(),·"yyyy-MM-dd");␍
@repo/people:lint:biome:      59     │ - → const·todayAttendance·=·attendance.find(␍
@repo/people:lint:biome:      60     │ - → → (a)·=>·format(new·Date(a.check_in),·"yyyy-MM-dd")·===·todayStr,␍
@repo/people:lint:biome:      61     │ - → );␍
@repo/people:lint:biome:      62     │ - ␍

@repo/people:lint:biome:      63     │ - → return·(␍
@repo/people:lint:biome:      64     │ - → → <VStack·className="gap-5">␍
@repo/people:lint:biome:      65     │ - → → → <VStack·className="gap-1.5·px-1">␍
@repo/people:lint:biome:      66     │ - → → → → <Heading·className="text-[20px]·font-black·text-phaseText-primary·tracking-tight">␍
@repo/people:lint:biome:      67     │ - → → → → → {t("staffPresence.title")·||·"Presence·Pulse"}␍
@repo/people:lint:biome:      68     │ - → → → → </Heading>␍
@repo/people:lint:biome:      69     │ - → → → → <Text·className="text-[11px]·font-bold·text-phaseText-muted·uppercase·tracking-[2px]">␍
@repo/people:lint:biome:      70     │ - → → → → → Gate·Monitoring␍
@repo/people:lint:biome:      71     │ - → → → → </Text>␍
@repo/people:lint:biome:      72     │ - → → → </VStack>␍
@repo/people:lint:biome:      73     │ - ␍
@repo/people:lint:biome:      74     │ - → → → <Box·className="p-6·rounded-[32px]·bg-phase-surface·border·border-phase-border·shadow-sm">␍
@repo/people:lint:biome:      75     │ - → → → → <VStack·className="gap-6">␍
@repo/people:lint:biome:      76     │ - → → → → → <HStack·className="justify-between·items-center">␍
@repo/people:lint:biome:      77     │ - → → → → → → <VStack·className="gap-0.5">␍
@repo/people:lint:biome:      78     │ - → → → → → → → <Text·className="text-[14px]·font-black·text-phaseText-primary·tracking-tight">␍
@repo/people:lint:biome:      79     │ - → → → → → → → → {t("staffPresence.attendanceStatus")·||·"Shift·Identity"}␍
@repo/people:lint:biome:      80     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:      81     │ - → → → → → → → <Text·className="text-[11px]·font-bold·text-phaseText-muted·uppercase·tracking-wider">␍
@repo/people:lint:biome:      82     │ - → → → → → → → → {new·Intl.DateTimeFormat(i18n.language,·{␍

@repo/people:lint:biome:      83     │ - → → → → → → → → → weekday:·"long",␍
@repo/people:lint:biome:      84     │ - → → → → → → → → → day:·"numeric",␍
@repo/people:lint:biome:      85     │ - → → → → → → → → → month:·"short",␍
@repo/people:lint:biome:      86     │ - → → → → → → → → }).format(new·Date())}␍
@repo/people:lint:biome:      87     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:      88     │ - → → → → → → </VStack>␍
@repo/people:lint:biome:      89     │ - → → → → → → <Box␍
@repo/people:lint:biome:      90     │ - → → → → → → → className={`flex-row·items-center·px-4·py-1.5·rounded-full·border·${isCheckedIn·?·"bg-phase-success/10·border-phase-success/20"·:·"bg-phase-danger/10·border-phase-danger/20"}`}␍
@repo/people:lint:biome:      91     │ - → → → → → → >␍
@repo/people:lint:biome:      92     │ - → → → → → → → <Box␍
@repo/people:lint:biome:      93     │ - → → → → → → → → className={`w-1.5·h-1.5·rounded-full·mr-2·${isCheckedIn·?·"bg-phase-success"·:·"bg-phase-danger"}`}␍
@repo/people:lint:biome:      94     │ - → → → → → → → />␍
@repo/people:lint:biome:      95     │ - → → → → → → → <Text␍
@repo/people:lint:biome:      96     │ - → → → → → → → → className={`text-[10px]·font-black·uppercase·tracking-widest·${isCheckedIn·?·"text-phase-success"·:·"text-phase-danger"}`}␍
@repo/people:lint:biome:      97     │ - → → → → → → → >␍
@repo/people:lint:biome:      98     │ - → → → → → → → → {isCheckedIn␍
@repo/people:lint:biome:      99     │ - → → → → → → → → → ?·t("staffPresence.checkedIn")·||·"ACTIVE"␍
@repo/people:lint:biome:     100     │ - → → → → → → → → → :·t("staffPresence.checkedOut")·||·"STATIONED"}␍
@repo/people:lint:biome:     101     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     102     │ - → → → → → → </Box>␍
@repo/people:lint:biome:     103     │ - → → → → → </HStack>␍
@repo/people:lint:biome:     104     │ - ␍
@repo/people:lint:biome:     105     │ - → → → → → <HStack·className="gap-3">␍
@repo/people:lint:biome:     106     │ - → → → → → → <VStack·className="flex-1·bg-phase-canvas·p-4·rounded-[20px]·items-center·gap-1·border·border-phase-border/50">␍

@repo/people:lint:biome:     107     │ - → → → → → → → <Icon·as={Clock}·size="sm"·className="text-phase-interactive"·/>␍

@repo/people:lint:biome:     108     │ - → → → → → → → <Text·className="text-[9px]·text-phaseText-muted·uppercase·font-black·tracking-widest·mt-1">␍
@repo/people:lint:biome:     109     │ - → → → → → → → → {t("staffPresence.checkedInAt")·||·"CHECK-IN"}␍

@repo/people:lint:biome:     110     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     111     │ - → → → → → → → <Text·className="text-[15px]·font-black·text-phaseText-primary">␍
@repo/people:lint:biome:     112     │ - → → → → → → → → {todayAttendance␍
@repo/people:lint:biome:     113     │ - → → → → → → → → → ?·new·Intl.DateTimeFormat(i18n.language,·{␍
@repo/people:lint:biome:     114     │ - → → → → → → → → → → → hour:·"2-digit",␍
@repo/people:lint:biome:     115     │ - → → → → → → → → → → → minute:·"2-digit",␍
@repo/people:lint:biome:     116     │ - → → → → → → → → → → }).format(new·Date(todayAttendance.check_in))␍
@repo/people:lint:biome:     117     │ - → → → → → → → → → :·"--:--"}␍
@repo/people:lint:biome:     118     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     119     │ - → → → → → → </VStack>␍
@repo/people:lint:biome:     120     │ - → → → → → → <VStack·className="flex-1·bg-phase-canvas·p-4·rounded-[20px]·items-center·gap-1·border·border-phase-border/50">␍
@repo/people:lint:biome:     121     │ - → → → → → → → <Icon·as={LogOut}·size="sm"·className="text-phaseText-muted"·/>␍
@repo/people:lint:biome:     122     │ - → → → → → → → <Text·className="text-[9px]·text-phaseText-muted·uppercase·font-black·tracking-widest·mt-1">␍

@repo/people:lint:biome:     123     │ - → → → → → → → → {t("staffPresence.checkedOutAt")·||·"CHECK-OUT"}␍
@repo/people:lint:biome:     124     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     125     │ - → → → → → → → <Text·className="text-[15px]·font-black·text-phaseText-primary">␍
@repo/people:lint:biome:     126     │ - → → → → → → → → {todayAttendance?.check_out␍
@repo/people:lint:biome:     127     │ - → → → → → → → → → ?·new·Intl.DateTimeFormat(i18n.language,·{␍

@repo/people:lint:biome:     128     │ - → → → → → → → → → → → hour:·"2-digit",␍
@repo/people:lint:biome:     129     │ - → → → → → → → → → → → minute:·"2-digit",␍
@repo/people:lint:biome:     130     │ - → → → → → → → → → → }).format(new·Date(todayAttendance.check_out))␍
@repo/people:lint:biome:     131     │ - → → → → → → → → → :·"--:--"}␍
@repo/people:lint:biome:     132     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:     133     │ - → → → → → → </VStack>␍
@repo/people:lint:biome:     134     │ - → → → → → </HStack>␍
@repo/people:lint:biome:     135     │ - ␍
@repo/people:lint:biome:     136     │ - → → → → → <Pressable␍
@repo/people:lint:biome:     137     │ - → → → → → → onPress={handleToggleAttendance}␍
@repo/people:lint:biome:     138     │ - → → → → → → disabled={actionLoading}␍
@repo/people:lint:biome:     139     │ - → → → → → → className={`h-14·rounded-[20px]·flex-row·items-center·justify-center·gap-3·shadow-md·active:scale-95·transition-all·${␍
@repo/people:lint:biome:     140     │ - → → → → → → → isCheckedIn·?·"bg-phase-danger"·:·"bg-phase-interactive"␍
@repo/people:lint:biome:     141     │ - → → → → → → }`}␍
@repo/people:lint:biome:     142     │ - → → → → → >␍
@repo/people:lint:biome:     143     │ - → → → → → → {actionLoading·?·(␍
@repo/people:lint:biome:     144     │ - → → → → → → → <Spinner·size="small"·color="white"·/>␍
@repo/people:lint:biome:     145     │ - → → → → → → )·:·(␍
@repo/people:lint:biome:     146     │ - → → → → → → → <>␍
@repo/people:lint:biome:     147     │ - → → → → → → → → <Icon␍
@repo/people:lint:biome:     148     │ - → → → → → → → → → as={isCheckedIn·?·LogOut·:·LogIn}␍
@repo/people:lint:biome:     149     │ - → → → → → → → → → size="sm"␍
@repo/people:lint:biome:     150     │ - → → → → → → → → → className="text-white"␍
@repo/people:lint:biome:   205 more lines truncated
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherAdminPortalModal.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/people:lint:biome:      1    │ - import·SanctuaryModal·from·"@repo/ui/components/SanctuaryModal";␍
@repo/people:lint:biome:      2    │ - import·{·Box,·ScrollView,·Text·}·from·"@repo/ui/primitives";␍
@repo/people:lint:biome:      3    │ - ␍
@repo/people:lint:biome:      4    │ - import·TeacherAdminWidget·from·"./TeacherAdminWidget";␍
@repo/people:lint:biome:      5    │ - ␍
@repo/people:lint:biome:      6    │ - interface·TeacherAdminPortalModalProps·{␍
@repo/people:lint:biome:      7    │ - → visible:·boolean;␍
@repo/people:lint:biome:      8    │ - → onClose:·()·=>·void;␍
@repo/people:lint:biome:      9    │ - → onAction?:·(action:·string)·=>·void;␍
@repo/people:lint:biome:     10    │ - → title?:·string;␍
@repo/people:lint:biome:     11    │ - }␍
@repo/people:lint:biome:     12    │ - ␍
@repo/people:lint:biome:     13    │ - /**␍
@repo/people:lint:biome:     14    │ - ·*·TEACHER·ADMIN·PORTAL·MODAL␍
@repo/people:lint:biome:     15    │ - ·*·Sanctuary·V3·standard·for·full-screen·administrative·access.␍
@repo/people:lint:biome:     16    │ - ·*·Features·premium·glassmorphism·and·standardized·Sanctuary·primitives.␍
@repo/people:lint:biome:     17    │ - ·*/␍
@repo/people:lint:biome:     18    │ - export·default·function·TeacherAdminPortalModal({␍
@repo/people:lint:biome:     19    │ - → visible,␍
@repo/people:lint:biome:     20    │ - → onClose,␍
@repo/people:lint:biome:     21    │ - → onAction,␍
@repo/people:lint:biome:     22    │ - → title·=·"Administrative·Portal",␍

@repo/people:lint:biome:     23    │ - }:·TeacherAdminPortalModalProps)·{␍

@repo/graphics:lint:biome: src\charts\AnalyticsEngine.tsx:18:8 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/graphics:lint:biome:   

@repo/people:lint:biome:     24    │ - → return·(␍
@repo/people:lint:biome:     25    │ - → → <SanctuaryModal␍
@repo/people:lint:biome:     26    │ - → → → isOpen={visible}␍
@repo/people:lint:biome:     27    │ - → → → onClose={onClose}␍
@repo/people:lint:biome:     28    │ - → → → title={title}␍
@repo/people:lint:biome:     29    │ - → → → subtitle="SOVEREIGN·MANAGEMENT"␍
@repo/people:lint:biome:     30    │ - → → >␍
@repo/people:lint:biome:     31    │ - → → → <Box·className="flex-1">␍
@repo/people:lint:biome:     32    │ - → → → → <ScrollView␍
@repo/people:lint:biome:     33    │ - → → → → → showsVerticalScrollIndicator={false}␍

@repo/people:lint:biome:     34    │ - → → → → → contentContainerStyle={{·padding:·0,·paddingBottom:·60·}}␍
@repo/people:lint:biome:     35    │ - → → → → >␍
@repo/people:lint:biome:     36    │ - → → → → → <TeacherAdminWidget·onAction={onAction}·/>␍
@repo/people:lint:biome:     37    │ - ␍
@repo/people:lint:biome:     38    │ - → → → → → <Box·className="mt-12·p-6·bg-phase-surface/30·rounded-[32px]·border·border-phase-surface/50">␍
@repo/people:lint:biome:     39    │ - → → → → → → <Text·className="text-xs·text-phase-text-tertiary·leading-5·font-medium·italic·text-center">␍
@repo/people:lint:biome:     40    │ - → → → → → → → This·portal·is·secured·by·the·Gurudevi·Sanctuary·Governance␍
@repo/people:lint:biome:     41    │ - → → → → → → → protocols.·All·administrative·actions·are·logged·in·the·sovereign␍
@repo/people:lint:biome:     42    │ - → → → → → → → record.␍
@repo/people:lint:biome:     43    │ - → → → → → → </Text>␍
@repo/people:lint:biome:     44    │ - → → → → → </Box>␍
@repo/people:lint:biome:     45    │ - → → → → </ScrollView>␍

@repo/people:lint:biome:     46    │ - → → → </Box>␍
@repo/people:lint:biome:     47    │ - → → </SanctuaryModal>␍
@repo/people:lint:biome:     48    │ - → );␍
@repo/people:lint:biome:     49    │ - }␍
@repo/people:lint:biome:         1 │ + import·SanctuaryModal·from·'@repo/ui/components/SanctuaryModal';
@repo/people:lint:biome:         2 │ + import·{·Box,·ScrollView,·Text·}·from·'@repo/ui/primitives';
@repo/people:lint:biome:         3 │ + 
@repo/people:lint:biome:         4 │ + import·TeacherAdminWidget·from·'./TeacherAdminWidget';
@repo/people:lint:biome:         5 │ + 
@repo/people:lint:biome:         6 │ + interface·TeacherAdminPortalModalProps·{
@repo/people:lint:biome:         7 │ + ··visible:·boolean;
@repo/people:lint:biome:         8 │ + ··onClose:·()·=>·void;
@repo/people:lint:biome:         9 │ + ··onAction?:·(action:·string)·=>·void;
@repo/people:lint:biome:        10 │ + ··title?:·string;
@repo/people:lint:biome:        11 │ + }
@repo/people:lint:biome:        12 │ + 
@repo/people:lint:biome:        13 │ + /**
@repo/people:lint:biome:        14 │ + ·*·TEACHER·ADMIN·PORTAL·MODAL

@repo/people:lint:biome:        15 │ + ·*·Sanctuary·V3·standard·for·full-screen·administrative·access.
@repo/people:lint:biome:        16 │ + ·*·Features·premium·glassmorphism·and·standardized·Sanctuary·primitives.
@repo/people:lint:biome:        17 │ + ·*/
@repo/people:lint:biome:        18 │ + export·default·function·TeacherAdminPortalModal({
@repo/people:lint:biome:        19 │ + ··visible,
@repo/people:lint:biome:        20 │ + ··onClose,
@repo/people:lint:biome:        21 │ + ··onAction,
@repo/people:lint:biome:        22 │ + ··title·=·'Administrative·Portal',
@repo/people:lint:biome:        23 │ + }:·TeacherAdminPortalModalProps)·{
@repo/people:lint:biome:        24 │ + ··return·(
@repo/people:lint:biome:        25 │ + ····<SanctuaryModal
@repo/people:lint:biome:        26 │ + ······isOpen={visible}
@repo/people:lint:biome:        27 │ + ······onClose={onClose}

@repo/people:lint:biome:        28 │ + ······title={title}
@repo/people:lint:biome:        29 │ + ······subtitle="SOVEREIGN·MANAGEMENT"
@repo/people:lint:biome:        30 │ + ····>
@repo/people:lint:biome:        31 │ + ······<Box·className="flex-1">

@repo/people:lint:biome:        32 │ + ········<ScrollView
@repo/people:lint:biome:        33 │ + ··········showsVerticalScrollIndicator={false}
@repo/people:lint:biome:        34 │ + ··········contentContainerStyle={{·padding:·0,·paddingBottom:·60·}}

@repo/people:lint:biome:        35 │ + ········>
@repo/people:lint:biome:        36 │ + ··········<TeacherAdminWidget·onAction={onAction}·/>
@repo/people:lint:biome:        37 │ + 
@repo/people:lint:biome:        38 │ + ··········<Box·className="mt-12·p-6·bg-phase-surface/30·rounded-[32px]·border·border-phase-surface/50">
@repo/people:lint:biome:        39 │ + ············<Text·className="text-xs·text-phase-text-tertiary·leading-5·font-medium·italic·text-center">
@repo/people:lint:biome:        40 │ + ··············This·portal·is·secured·by·the·Gurudevi·Sanctuary·Governance·protocols.·All
@repo/people:lint:biome:        41 │ + ··············administrative·actions·are·logged·in·the·sovereign·record.
@repo/people:lint:biome:        42 │ + ············</Text>
@repo/people:lint:biome:        43 │ + ··········</Box>
@repo/people:lint:biome:        44 │ + ········</ScrollView>
@repo/people:lint:biome:        45 │ + ······</Box>
@repo/people:lint:biome:        46 │ + ····</SanctuaryModal>
@repo/people:lint:biome:        47 │ + ··);
@repo/people:lint:biome:        48 │ + }
@repo/people:lint:biome:     50 49 │   
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx:127:19 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/people:lint:biome:   

@repo/people:lint:biome:     125 │ 			<VStack className="gap-2">
@repo/graphics:lint:biome:     17 │ interface AnalyticsEngineProps {

@repo/people:lint:biome:     126 │ 				{rows.map((row, rowIndex) => (
@repo/people:lint:biome:   > 127 │ 					<HStack key={rowIndex} className="gap-2">
@repo/people:lint:biome:         │ 					             ^^^^^^^^
@repo/people:lint:biome:     128 │ 						{row.map((action, actionIndex) => (

@repo/graphics:lint:biome:   > 18 │ 	data: any[];
@repo/graphics:lint:biome:        │ 	      ^^^
@repo/graphics:lint:biome:     19 │ 	title?: string;

@repo/graphics:lint:biome:     20 │ 	showFilters?: boolean;
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\charts\AnalyticsEngine.tsx:29:2 lint/correctness/noUnusedFunctionParameters ━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   ! This parameter is unused.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     27 │ 	showFilters = true,
@repo/graphics:lint:biome:     28 │ 	showExport = true,
@repo/graphics:lint:biome:   > 29 │ 	showRealTime = false,

@repo/graphics:lint:biome:        │ 	^^^^^^^^^^^^
@repo/graphics:lint:biome:     30 │ }: AnalyticsEngineProps) {
@repo/graphics:lint:biome:     31 │ 	const [selectedMetric, setSelectedMetric] = useState("all");

@repo/graphics:lint:biome:   

@repo/people:lint:biome:     129 │ 							<AdminAction
@repo/people:lint:biome:   
@repo/people:lint:biome:   i This is the source of the key value.
@repo/people:lint:biome:   

@repo/people:lint:biome:     124 │ 			</HStack>
@repo/people:lint:biome:     125 │ 			<VStack className="gap-2">
@repo/people:lint:biome:   > 126 │ 				{rows.map((row, rowIndex) => (
@repo/people:lint:biome:         │ 				                ^^^^^^^^
@repo/people:lint:biome:     127 │ 					<HStack key={rowIndex} className="gap-2">
@repo/people:lint:biome:     128 │ 						{row.map((action, actionIndex) => (
@repo/people:lint:biome:   
@repo/people:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/people:lint:biome:   
@repo/people:lint:biome:   i Check the React documentation. 
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx:130:14 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/people:lint:biome:   
@repo/people:lint:biome:     128 │ 						{row.map((action, actionIndex) => (
@repo/people:lint:biome:     129 │ 							<AdminAction
@repo/people:lint:biome:   > 130 │ 								key={actionIndex}
@repo/people:lint:biome:         │ 								     ^^^^^^^^^^^
@repo/people:lint:biome:     131 │ 								icon={action.icon}
@repo/people:lint:biome:     132 │ 								label={action.label}

@repo/people:lint:biome:   
@repo/people:lint:biome:   i This is the source of the key value.
@repo/people:lint:biome:   
@repo/people:lint:biome:     126 │ 				{rows.map((row, rowIndex) => (
@repo/people:lint:biome:     127 │ 					<HStack key={rowIndex} className="gap-2">
@repo/people:lint:biome:   > 128 │ 						{row.map((action, actionIndex) => (
@repo/people:lint:biome:         │ 						                  ^^^^^^^^^^^
@repo/people:lint:biome:     129 │ 							<AdminAction
@repo/people:lint:biome:     130 │ 								key={actionIndex}
@repo/people:lint:biome:   
@repo/people:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/people:lint:biome:   
@repo/people:lint:biome:   i Check the React documentation. 

@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherAdminWidget.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/people:lint:biome:       1     │ - import·{·usePermissions·}·from·"@repo/core/logic";␍
@repo/people:lint:biome:       2     │ - import·{␍
@repo/people:lint:biome:       3     │ - → Box,␍
@repo/people:lint:biome:       4     │ - → HStack,␍
@repo/people:lint:biome:       5     │ - → Icon,␍

@repo/people:lint:biome:       6     │ - → Pressable,␍
@repo/people:lint:biome:       7     │ - → Text,␍
@repo/people:lint:biome:       8     │ - → VStack,␍
@repo/people:lint:biome:       9     │ - }·from·"@repo/ui/primitives";␍
@repo/people:lint:biome:      10     │ - import·{·hapticLight·}·from·"@repo/ui/utils/haptics";␍
@repo/people:lint:biome:      11     │ - ␍
@repo/people:lint:biome:      12     │ - import·{␍

@repo/people:lint:biome:      13     │ - → ArrowRightLeft,␍
@repo/people:lint:biome:      14     │ - → Calendar,␍
@repo/people:lint:biome:      15     │ - → CheckSquare,␍
@repo/people:lint:biome:      16     │ - → ClipboardList,␍
@repo/people:lint:biome:      17     │ - → DollarSign,␍
@repo/people:lint:biome:      18     │ - → FileText,␍
@repo/people:lint:biome:      19     │ - }·from·"lucide-react-native";␍
@repo/people:lint:biome:      20     │ - import·{·useTranslation·}·from·"react-i18next";␍
@repo/people:lint:biome:      21     │ - ␍
@repo/people:lint:biome:      22     │ - interface·TeacherAdminWidgetProps·{␍
@repo/people:lint:biome:      23     │ - → onAction?:·(action:·string)·=>·void;␍
@repo/people:lint:biome:      24     │ - }␍

@repo/people:lint:biome:      25     │ - ␍
@repo/people:lint:biome:      26     │ - export·default·function·TeacherAdminWidget({␍
@repo/people:lint:biome:      27     │ - → onAction,␍
@repo/people:lint:biome:      28     │ - }:·TeacherAdminWidgetProps)·{␍
@repo/people:lint:biome:      29     │ - → const·{·t·}·=·useTranslation();␍
@repo/people:lint:biome:      30     │ - → const·{·flags·}·=·usePermissions();␍
@repo/people:lint:biome:      31     │ - ␍
@repo/people:lint:biome:      32     │ - → const·AdminAction·=·({␍
@repo/people:lint:biome:      33     │ - → → icon:·LucideIcon,␍
@repo/people:lint:biome:      34     │ - → → label,␍
@repo/people:lint:biome:      35     │ - → → variant·=·"primary",␍
@repo/people:lint:biome:      36     │ - → → onPress,␍

@repo/people:lint:biome:      37     │ - → }:·any)·=>·{␍
@repo/people:lint:biome:      38     │ - → → const·colorClasses·=·{␍
@repo/people:lint:biome:      39     │ - → → → primary:␍
@repo/people:lint:biome:      40     │ - → → → → "text-phase-interactive·bg-phase-interactive/5·border-phase-interactive/20",␍
@repo/people:lint:biome:      41     │ - → → → warning:·"text-phase-warning·bg-phase-warning/5·border-phase-warning/20",␍
@repo/people:lint:biome:      42     │ - → → → success:·"text-phase-success·bg-phase-success/5·border-phase-success/20",␍
@repo/people:lint:biome:      43     │ - → → → error:·"text-phase-error·bg-phase-error/5·border-phase-error/20",␍
@repo/people:lint:biome:      44     │ - → → };␍
@repo/people:lint:biome:      45     │ - ␍
@repo/people:lint:biome:      46     │ - → → const·activeColor·=␍
@repo/people:lint:biome:      47     │ - → → → colorClasses[variant·as·keyof·typeof·colorClasses]·||␍
@repo/people:lint:biome:      48     │ - → → → colorClasses.primary;␍
@repo/people:lint:biome:      49     │ - → → const·[textColor,·bgColor,·borderColor]·=·activeColor.split("·");␍
@repo/people:lint:biome:      50     │ - ␍
@repo/people:lint:biome:      51     │ - → → return·(␍
@repo/people:lint:biome:      52     │ - → → → <Pressable␍
@repo/people:lint:biome:      53     │ - → → → → onPress={()·=>·{␍
@repo/people:lint:biome:      54     │ - → → → → → hapticLight();␍

@repo/people:lint:biome:      55     │ - → → → → → if·(onPress)·onPress();␍
@repo/people:lint:biome:      56     │ - → → → → → if·(onAction)·onAction(label);␍
@repo/people:lint:biome:      57     │ - → → → → }}␍
@repo/people:lint:biome:      58     │ - → → → → className={`flex-1·bg-phase-canvas·p-4·rounded-3xl·border·${borderColor}·items-center·justify-center·gap-3·min-h-[110px]·shadow-sm`}␍
@repo/people:lint:biome:      59     │ - → → → >␍
@repo/people:lint:biome:      60     │ - → → → → <Box·className={`p-3·rounded-2xl·${bgColor}`}>␍
@repo/people:lint:biome:      61     │ - → → → → → <Icon·as={LucideIcon}·size="md"·className={textColor}·/>␍
@repo/people:lint:biome:      62     │ - → → → → </Box>␍
@repo/people:lint:biome:      63     │ - → → → → <Text·className="text-[12px]·font-bold·text-center·text-phase-text-primary·uppercase·tracking-tight">␍
@repo/people:lint:biome:      64     │ - → → → → → {label}␍
@repo/people:lint:biome:      65     │ - → → → → </Text>␍
@repo/people:lint:biome:      66     │ - → → → </Pressable>␍

@repo/people:lint:biome:      67     │ - → → );␍
@repo/people:lint:biome:      68     │ - → };␍
@repo/people:lint:biome:      69     │ - ␍
@repo/people:lint:biome:      70     │ - → //·Define·actions·with·their·visibility·conditions␍
@repo/people:lint:biome:      71     │ - → const·actions·=·[␍
@repo/people:lint:biome:      72     │ - → → {␍
@repo/people:lint:biome:      73     │ - → → → icon:·Calendar,␍
@repo/people:lint:biome:      74     │ - → → → label:·t("teacher.admin.myLeaves")·||·"My·Leaves",␍
@repo/people:lint:biome:      75     │ - → → → variant:·"warning",␍
@repo/people:lint:biome:      76     │ - → → → visible:·flags.isStaffManagementEnabled,␍
@repo/people:lint:biome:      77     │ - → → },␍
@repo/people:lint:biome:      78     │ - → → {␍
@repo/people:lint:biome:      79     │ - → → → icon:·ArrowRightLeft,␍
@repo/people:lint:biome:      80     │ - → → → label:·t("teacher.admin.substitutions")·||·"Substitutions",␍

@repo/people:lint:biome:      81     │ - → → → variant:·"primary",␍
@repo/people:lint:biome:      82     │ - → → → visible:·flags.isStaffManagementEnabled,␍
@repo/people:lint:biome:      83     │ - → → },␍
@repo/people:lint:biome:      84     │ - → → {␍
@repo/people:lint:biome:      85     │ - → → → icon:·FileText,␍
@repo/people:lint:biome:      86     │ - → → → label:·t("teacher.admin.reportGen")·||·"Student·Reports",␍
@repo/people:lint:biome:      87     │ - → → → variant:·"success",␍
@repo/people:lint:biome:      88     │ - → → → visible:·flags.isStudentReportingEnabled,␍
@repo/people:lint:biome:      89     │ - → → },␍
@repo/people:lint:biome:      90     │ - → → {␍

@repo/people:lint:biome:      91     │ - → → → icon:·ClipboardList,␍
@repo/people:lint:biome:      92     │ - → → → label:·t("teacher.admin.templates")·||·"Letter·Templates",␍

@repo/people:lint:biome:      93     │ - → → → variant:·"error",␍
@repo/people:lint:biome:      94     │ - → → → visible:·flags.isTemplateManagementEnabled,␍
@repo/people:lint:biome:      95     │ - → → },␍

@repo/people:lint:biome:      96     │ - → → {␍
@repo/people:lint:biome:      97     │ - → → → icon:·DollarSign,␍
@repo/people:lint:biome:      98     │ - → → → label:·t("teacher.admin.financials")·||·"Financials",␍
@repo/people:lint:biome:      99     │ - → → → variant:·"success",␍
@repo/people:lint:biome:     100     │ - → → → visible:·flags.isAccountingEnabled,␍
@repo/people:lint:biome:     101     │ - → → },␍
@repo/people:lint:biome:     102     │ - → → {␍
@repo/people:lint:biome:     103     │ - → → → icon:·CheckSquare,␍
@repo/people:lint:biome:     104     │ - → → → label:·t("teacher.admin.approvals")·||·"Approvals",␍

@repo/people:lint:biome:     105     │ - → → → variant:·"error",␍
@repo/people:lint:biome:     106     │ - → → → visible:·flags.isStaffManagementEnabled,␍
@repo/people:lint:biome:     107     │ - → → },␍
@repo/people:lint:biome:     108     │ - → ].filter((action)·=>·action.visible);␍
@repo/people:lint:biome:     109     │ - ␍
@repo/people:lint:biome:     110     │ - → //·Group·actions·into·rows·of·2␍
@repo/people:lint:biome:     111     │ - → const·rows·=·[];␍
@repo/people:lint:biome:     112     │ - → for·(let·i·=·0;·i·<·actions.length;·i·+=·2)·{␍
@repo/people:lint:biome:     113     │ - → → rows.push(actions.slice(i,·i·+·2));␍
@repo/people:lint:biome:     114     │ - → }␍
@repo/people:lint:biome:     115     │ - ␍
@repo/people:lint:biome:     116     │ - → if·(actions.length·===·0)·return·null;␍
@repo/people:lint:biome:     117     │ - ␍
@repo/people:lint:biome:     118     │ - → return·(␍
@repo/people:lint:biome:     119     │ - → → <VStack·className="gap-6·mt-4·px-1">␍

@repo/people:lint:biome:     120     │ - → → → <HStack·className="justify-between·items-center">␍
@repo/people:lint:biome:     121     │ - → → → → <Text·className="text-[11px]·font-black·uppercase·tracking-[2px]·text-phase-text-tertiary">␍
@repo/people:lint:biome:     122     │ - → → → → → {t("teacher.admin.title")·||·"Administrative·Portal"}␍

@repo/people:lint:biome:     123     │ - → → → → </Text>␍
@repo/people:lint:biome:     124     │ - → → → </HStack>␍
@repo/people:lint:biome:     125     │ - → → → <VStack·className="gap-2">␍
@repo/people:lint:biome:     126     │ - → → → → {rows.map((row,·rowIndex)·=>·(␍
@repo/people:lint:biome:     127     │ - → → → → → <HStack·key={rowIndex}·className="gap-2">␍
@repo/people:lint:biome:     128     │ - → → → → → → {row.map((action,·actionIndex)·=>·(␍
@repo/people:lint:biome:     129     │ - → → → → → → → <AdminAction␍
@repo/people:lint:biome:     130     │ - → → → → → → → → key={actionIndex}␍
@repo/people:lint:biome:     131     │ - → → → → → → → → icon={action.icon}␍
@repo/people:lint:biome:     132     │ - → → → → → → → → label={action.label}␍
@repo/people:lint:biome:     133     │ - → → → → → → → → variant={action.variant}␍
@repo/people:lint:biome:     134     │ - → → → → → → → />␍
@repo/people:lint:biome:     135     │ - → → → → → → ))}␍
@repo/people:lint:biome:     136     │ - → → → → → → {/*·Fill·space·if·only·one·item·in·row·*/}␍
@repo/people:lint:biome:     137     │ - → → → → → → {row.length·===·1·&&·<Box·className="flex-1"·/>}␍
@repo/people:lint:biome:     138     │ - → → → → → </HStack>␍
@repo/people:lint:biome:     139     │ - → → → → ))}␍
@repo/people:lint:biome:     140     │ - → → → </VStack>␍
@repo/people:lint:biome:     141     │ - → → </VStack>␍
@repo/people:lint:biome:     142     │ - → );␍

@repo/people:lint:biome:     143     │ - }␍
@repo/people:lint:biome:           1 │ + import·{·usePermissions·}·from·'@repo/core/logic';
@repo/people:lint:biome:           2 │ + import·{·Box,·HStack,·Icon,·Pressable,·Text,·VStack·}·from·'@repo/ui/primitives';
@repo/people:lint:biome:           3 │ + import·{·hapticLight·}·from·'@repo/ui/utils/haptics';
@repo/people:lint:biome:           4 │ + 
@repo/people:lint:biome:           5 │ + import·{
@repo/people:lint:biome:           6 │ + ··ArrowRightLeft,
@repo/people:lint:biome:           7 │ + ··Calendar,
@repo/people:lint:biome:   120 more lines truncated
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherEchoHistoryModal.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

@repo/accounting:lint:biome: src\cheques.ts:13:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 

@repo/accounting:lint:biome:   ! Unexpected any. Specify a different type.

@repo/accounting:lint:biome:   

@repo/accounting:lint:biome:     11 │ 		amount: number;

@repo/accounting:lint:biome:     12 │ 		issue_date: string;

@repo/accounting:lint:biome:   > 13 │ 		metadata?: any;

@repo/accounting:lint:biome:        │ 		           ^^^

@repo/accounting:lint:biome:     14 │ 	}) {

@repo/graphics:lint:biome:   i Unused parameters might be the result of an incomplete refactoring.
@repo/graphics:lint:biome:   

@repo/graphics:lint:biome: 

@repo/graphics:lint:biome: src\charts\GiftedCharts.tsx:6:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 

@repo/graphics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/graphics:lint:biome:   

@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   

@repo/accounting:lint:biome:     15 │ 		const { data, error } = await supabase

@repo/accounting:lint:biome:   

@repo/accounting:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/accounting:lint:biome:   
@repo/accounting:lint:biome: 

apps-edlove-web:lint:biome: src\components\CinematicBackground.astro:6:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable showVideo is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     4 │ }

apps-edlove-web:lint:biome:     5 │ 
apps-edlove-web:lint:biome:   > 6 │ const { showVideo = false } = Astro.props;
apps-edlove-web:lint:biome:       │         ^^^^^^^^^

@repo/graphics:lint:biome:     4 │ // The library definitely exports these (verified in node_modules), but TSC sometimes trips up

@repo/people:lint:biome:       1     │ - import·SanctuaryModal·from·"@repo/ui/components/SanctuaryModal";␍

apps-edlove-web:lint:biome:     7 │ ---
apps-edlove-web:lint:biome:     8 │ 

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

@repo/graphics:lint:biome:     5 │ // on the complex re-export chain in react-native-gifted-charts/dist/index.d.ts.

@repo/graphics:lint:biome:   > 6 │ export const BarChart = (Gifted as any).BarChart;

@repo/graphics:lint:biome:       │                                    ^^^

@repo/graphics:lint:biome:     7 │ export const LineChart = (Gifted as any).LineChart;

@repo/graphics:lint:biome:     8 │ export const PieChart = (Gifted as any).PieChart;

@repo/graphics:lint:biome:   

@repo/graphics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/graphics:lint:biome:   

@repo/graphics:lint:biome: 

@repo/graphics:lint:biome: src\charts\GiftedCharts.tsx:7:37 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 

@repo/graphics:lint:biome:   ! Unexpected any. Specify a different type.

@repo/graphics:lint:biome:   

@repo/graphics:lint:biome:     5 │ // on the complex re-export chain in react-native-gifted-charts/dist/index.d.ts.

@repo/graphics:lint:biome:     6 │ export const BarChart = (Gifted as any).BarChart;

@repo/graphics:lint:biome:   > 7 │ export const LineChart = (Gifted as any).LineChart;

@repo/graphics:lint:biome:       │                                     ^^^

@repo/graphics:lint:biome:     8 │ export const PieChart = (Gifted as any).PieChart;

@repo/people:lint:biome:       2     │ - import·{·SkeletonCard·}·from·"@repo/ui/components/SkeletonLoader";␍

@repo/people:lint:biome:       3     │ - import·{·Box,·HStack,·ScrollView,·Text,·VStack·}·from·"@repo/ui/primitives";␍

@repo/people:lint:biome:       4     │ - ␍

@repo/people:lint:biome:       5     │ - import·{·useEffect,·useState·}·from·"react";␍

@repo/people:lint:biome:       6     │ - import·{·type·TeacherSentEcho,·teacherFeedbackAPI·}·from·"../feedback";␍

@repo/people:lint:biome:       7     │ - ␍

@repo/people:lint:biome:       8     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/people:lint:biome:       9     │ - //·TYPES␍

@repo/people:lint:biome:      10     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/people:lint:biome:      11     │ - ␍

@repo/people:lint:biome:      12     │ - interface·TeacherEchoHistoryModalProps·{␍

@repo/people:lint:biome:      13     │ - → visible:·boolean;␍

@repo/people:lint:biome:      14     │ - → teacherId:·string;␍

@repo/people:lint:biome:      15     │ - → onClose:·()·=>·void;␍

@repo/people:lint:biome:      16     │ - }␍

@repo/people:lint:biome:      17     │ - ␍

@repo/people:lint:biome:      18     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/people:lint:biome:      19     │ - //·COMPONENT␍

@repo/accounting:lint:biome: src\types.ts:15:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 

@repo/accounting:lint:biome:   ! Unexpected any. Specify a different type.

@repo/accounting:lint:biome:   

@repo/accounting:lint:biome:     13 │ 	parentId?: string;

@repo/accounting:lint:biome:     14 │ 	balance: number;

@repo/accounting:lint:biome:   > 15 │ 	metadata?: Record<string, any>;

@repo/accounting:lint:biome:        │ 	                          ^^^

@repo/accounting:lint:biome:     16 │ }

@repo/accounting:lint:biome:     17 │ 

@repo/accounting:lint:biome:   

@repo/accounting:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/accounting:lint:biome:   

@repo/accounting:lint:biome: 

@repo/accounting:lint:biome: src\types.ts:33:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 

@repo/graphics:lint:biome:     9 │ export const AreaChart = (Gifted as any).LineChart; // Area is a mode of LineChart
@repo/graphics:lint:biome:   

@repo/people:lint:biome:      20     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/people:lint:biome:      21     │ - ␍
@repo/people:lint:biome:      22     │ - /**␍

@repo/people:lint:biome:      23     │ - ·*·TEACHER·ECHO·HISTORY·MODAL␍

@repo/people:lint:biome:      24     │ - ·*·Sanctuary·V3·standard·for·reviewing·sent·feedback.␍

@repo/people:lint:biome:      25     │ - ·*·Features·hierarchical·priority·display·and·premium·styling.␍

@repo/accounting:lint:biome:   ! Unexpected any. Specify a different type.
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome:     31 │ 	description: string;
@repo/accounting:lint:biome:     32 │ 	referenceNo?: string;
@repo/accounting:lint:biome:   > 33 │ 	metadata?: Record<string, any>;
@repo/accounting:lint:biome:        │ 	                          ^^^

apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable title is unused.

apps-edlove-web:lint:biome:   

@repo/types-shim:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 

apps-edlove-web:lint:biome:      7 │ }
apps-edlove-web:lint:biome:      8 │ 
apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;
apps-edlove-web:lint:biome:        │         ^^^^^
apps-edlove-web:lint:biome:     10 │ ---
apps-edlove-web:lint:biome:     11 │ 
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable subtitle is unused.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      7 │ }
apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;

apps-edlove-web:lint:biome:        │                ^^^^^^^^

apps-edlove-web:lint:biome:     10 │ ---

apps-edlove-web:lint:biome:     11 │ 

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:26 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable icon is unused.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      7 │ }

apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;

apps-edlove-web:lint:biome:        │                          ^^^^

apps-edlove-web:lint:biome:     10 │ ---

apps-edlove-web:lint:biome:     11 │ 

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\ExpandableContent.astro:9:32 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! This variable mode is unused.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      7 │ }

apps-edlove-web:lint:biome:      8 │ 

apps-edlove-web:lint:biome:    > 9 │ const { title, subtitle, icon, mode = "panel" } = Astro.props;

apps-edlove-web:lint:biome:        │                                ^^^^

apps-edlove-web:lint:biome:     10 │ ---

apps-edlove-web:lint:biome:     11 │ 

apps-edlove-web:lint:biome:   

@repo/accounting:lint:biome:     34 │ 	entries: LedgerEntry[];

@repo/accounting:lint:biome:     35 │ }
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome:   × Formatter would have printed the following content:

@repo/accounting:lint:biome:   
@repo/accounting:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/base";␍
@repo/accounting:lint:biome:     2   │ - ␍
@repo/accounting:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/accounting:lint:biome:     4   │ - export·default·[...config];␍
@repo/accounting:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/base';
@repo/accounting:lint:biome:       2 │ + 
@repo/accounting:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/accounting:lint:biome:       4 │ + export·default·[...config];
@repo/accounting:lint:biome:     5 5 │   

@repo/accounting:lint:biome:   
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: src\budgeting.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome:   × Formatter would have printed the following content:
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome:      1    │ - import·{·supabase·}·from·"@repo/core/api";␍
@repo/accounting:lint:biome:      2    │ - ␍
@repo/accounting:lint:biome:      3    │ - export·class·Budgeting·{␍

@repo/accounting:lint:biome:      4    │ - → /**␍
@repo/accounting:lint:biome:      5    │ - → ·*·Checks·if·an·account·has·sufficient·budget·remaining.␍
@repo/accounting:lint:biome:      6    │ - → ·*/␍
@repo/accounting:lint:biome:      7    │ - → static·async·getBudgetRemaining(accountId:·string,·date:·Date·=·new·Date())·{␍
@repo/accounting:lint:biome:      8    │ - → → const·isoDate·=·date.toISOString().split("T")[0];␍
@repo/accounting:lint:biome:      9    │ - ␍
@repo/accounting:lint:biome:     10    │ - → → //·1.·Get·Budget·Allocation␍
@repo/accounting:lint:biome:     11    │ - → → const·{·data:·budget,·error:·budgetError·}·=·await·supabase␍
@repo/accounting:lint:biome:     12    │ - → → → .schema("accounting")␍

@repo/accounting:lint:biome:     13    │ - → → → .from("budgets")␍
@repo/accounting:lint:biome:     14    │ - → → → .select("amount")␍
@repo/accounting:lint:biome:     15    │ - → → → .eq("account_id",·accountId)␍
@repo/accounting:lint:biome:     16    │ - → → → .lte("period_start",·isoDate)␍
@repo/accounting:lint:biome:     17    │ - → → → .gte("period_end",·isoDate)␍
@repo/accounting:lint:biome:     18    │ - → → → .single();␍
@repo/accounting:lint:biome:     19    │ - ␍
@repo/accounting:lint:biome:     20    │ - → → if·(budgetError)·return·null;·//·No·budget·defined␍

@repo/accounting:lint:biome:     21    │ - ␍
@repo/accounting:lint:biome:     22    │ - → → //·2.·Get·Actual·Spent·(Cumulative·Balance·for·expense·accounts·is·usually·Debit)␍
@repo/accounting:lint:biome:     23    │ - → → const·{·data:·balanceData,·error:·balanceError·}·=·await·supabase␍
@repo/accounting:lint:biome:     24    │ - → → → .schema("accounting")␍
@repo/accounting:lint:biome:     25    │ - → → → .from("vw_account_balances")␍
@repo/accounting:lint:biome:     26    │ - → → → .select("balance")␍
@repo/accounting:lint:biome:     27    │ - → → → .eq("id",·accountId)␍
@repo/accounting:lint:biome:     28    │ - → → → .single();␍
@repo/accounting:lint:biome:     29    │ - ␍
@repo/accounting:lint:biome:     30    │ - → → if·(balanceError)·throw·balanceError;␍
@repo/accounting:lint:biome:     31    │ - ␍
@repo/accounting:lint:biome:     32    │ - → → return·budget.amount·-·balanceData.balance;␍

@repo/accounting:lint:biome:     33    │ - → }␍
@repo/accounting:lint:biome:     34    │ - }␍
@repo/accounting:lint:biome:         1 │ + import·{·supabase·}·from·'@repo/core/api';
@repo/accounting:lint:biome:         2 │ + 
@repo/accounting:lint:biome:         3 │ + export·class·Budgeting·{
@repo/accounting:lint:biome:         4 │ + ··/**
@repo/accounting:lint:biome:         5 │ + ···*·Checks·if·an·account·has·sufficient·budget·remaining.
@repo/accounting:lint:biome:         6 │ + ···*/

@repo/accounting:lint:biome:         7 │ + ··static·async·getBudgetRemaining(accountId:·string,·date:·Date·=·new·Date())·{
@repo/accounting:lint:biome:         8 │ + ····const·isoDate·=·date.toISOString().split('T')[0];
@repo/accounting:lint:biome:         9 │ + 
@repo/accounting:lint:biome:        10 │ + ····//·1.·Get·Budget·Allocation
@repo/accounting:lint:biome:        11 │ + ····const·{·data:·budget,·error:·budgetError·}·=·await·supabase
@repo/accounting:lint:biome:        12 │ + ······.schema('accounting')
@repo/accounting:lint:biome:        13 │ + ······.from('budgets')
@repo/accounting:lint:biome:        14 │ + ······.select('amount')

@repo/accounting:lint:biome:        15 │ + ······.eq('account_id',·accountId)
@repo/accounting:lint:biome:        16 │ + ······.lte('period_start',·isoDate)
@repo/accounting:lint:biome:        17 │ + ······.gte('period_end',·isoDate)
@repo/accounting:lint:biome:        18 │ + ······.single();
@repo/accounting:lint:biome:        19 │ + 
@repo/accounting:lint:biome:        20 │ + ····if·(budgetError)·return·null;·//·No·budget·defined
@repo/accounting:lint:biome:        21 │ + 
@repo/accounting:lint:biome:        22 │ + ····//·2.·Get·Actual·Spent·(Cumulative·Balance·for·expense·accounts·is·usually·Debit)
@repo/accounting:lint:biome:        23 │ + ····const·{·data:·balanceData,·error:·balanceError·}·=·await·supabase

@repo/accounting:lint:biome:        24 │ + ······.schema('accounting')
@repo/accounting:lint:biome:        25 │ + ······.from('vw_account_balances')
@repo/accounting:lint:biome:        26 │ + ······.select('balance')
@repo/accounting:lint:biome:        27 │ + ······.eq('id',·accountId)
@repo/accounting:lint:biome:        28 │ + ······.single();
@repo/accounting:lint:biome:        29 │ + 
@repo/accounting:lint:biome:        30 │ + ····if·(balanceError)·throw·balanceError;
@repo/accounting:lint:biome:        31 │ + 
@repo/accounting:lint:biome:        32 │ + ····return·budget.amount·-·balanceData.balance;
@repo/accounting:lint:biome:        33 │ + ··}
@repo/accounting:lint:biome:        34 │ + }
@repo/accounting:lint:biome:     35 35 │   
@repo/accounting:lint:biome:   

@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: src\cheques.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome:   × Formatter would have printed the following content:
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome:      1    │ - import·{·supabase·}·from·"@repo/core/api";␍
@repo/accounting:lint:biome:      2    │ - ␍
@repo/accounting:lint:biome:      3    │ - export·class·ChequeManager·{␍
@repo/accounting:lint:biome:      4    │ - → /**␍
@repo/accounting:lint:biome:      5    │ - → ·*·Registers·a·new·cheque·in·the·system.␍
@repo/accounting:lint:biome:      6    │ - → ·*/␍

@repo/accounting:lint:biome:      7    │ - → static·async·registerCheque(cheque:·{␍
@repo/accounting:lint:biome:      8    │ - → → cheque_no:·string;␍
@repo/accounting:lint:biome:      9    │ - → → bank_name:·string;␍
@repo/accounting:lint:biome:     10    │ - → → payee_name:·string;␍
@repo/accounting:lint:biome:     11    │ - → → amount:·number;␍
@repo/accounting:lint:biome:     12    │ - → → issue_date:·string;␍
@repo/accounting:lint:biome:     13    │ - → → metadata?:·any;␍
@repo/accounting:lint:biome:     14    │ - → })·{␍
@repo/accounting:lint:biome:     15    │ - → → const·{·data,·error·}·=·await·supabase␍
@repo/accounting:lint:biome:     16    │ - → → → .schema("accounting")␍
@repo/accounting:lint:biome:     17    │ - → → → .from("cheques")␍
@repo/accounting:lint:biome:     18    │ - → → → .insert({␍
@repo/accounting:lint:biome:     19    │ - → → → → ...cheque,␍
@repo/accounting:lint:biome:     20    │ - → → → → status:·"pending",␍
@repo/accounting:lint:biome:     21    │ - → → → })␍
@repo/accounting:lint:biome:     22    │ - → → → .select()␍
@repo/accounting:lint:biome:     23    │ - → → → .single();␍
@repo/accounting:lint:biome:     24    │ - ␍
@repo/accounting:lint:biome:     25    │ - → → if·(error)·throw·error;␍
@repo/accounting:lint:biome:     26    │ - → → return·data;␍
@repo/accounting:lint:biome:     27    │ - → }␍
@repo/accounting:lint:biome:     28    │ - ␍
@repo/accounting:lint:biome:     29    │ - → /**␍
@repo/accounting:lint:biome:     30    │ - → ·*·Marks·a·cheque·as·cleared·and·triggers·corresponding·ledger·entries.␍

@repo/accounting:lint:biome:     31    │ - → ·*/␍
apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
@repo/accounting:lint:biome:     32    │ - → static·async·clearCheque(␍
apps-edlove-web:lint:biome:   
@repo/accounting:lint:biome:     33    │ - → → id:·string,␍
apps-edlove-web:lint:biome: 
@repo/accounting:lint:biome:     34    │ - → → clearedDate:·string·=·new·Date().toISOString(),␍
@repo/graphics:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\charts\GiftedCharts.tsx:8:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      6 │ export const BarChart = (Gifted as any).BarChart;
@repo/people:lint:biome:      26     │ - ·*/␍
@repo/graphics:lint:biome:      7 │ export const LineChart = (Gifted as any).LineChart;

@repo/people:lint:biome:      27     │ - export·default·function·TeacherEchoHistoryModal({␍
@repo/graphics:lint:biome:    > 8 │ export const PieChart = (Gifted as any).PieChart;

@repo/graphics:lint:biome:        │                                    ^^^
@repo/graphics:lint:biome:      9 │ export const AreaChart = (Gifted as any).LineChart; // Area is a mode of LineChart
apps-edlove-web:lint:biome: src\components\Footer.astro:2:7 lint/correctness/noUnusedVariables  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   ! This variable currentYear is unused.
@repo/graphics:lint:biome:     10 │ export const StackedBarChart = (Gifted as any).BarChart; // Stacked is a mode of BarChart

apps-edlove-web:lint:biome:   
@repo/graphics:lint:biome:   
apps-edlove-web:lint:biome:     1 │ ---
@repo/graphics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:   > 2 │ const currentYear = new Date().getFullYear();
@repo/graphics:lint:biome:   
apps-edlove-web:lint:biome:       │       ^^^^^^^^^^^

@repo/graphics:lint:biome: 
apps-edlove-web:lint:biome:     3 │ ---
@repo/graphics:lint:biome: src\charts\GiftedCharts.tsx:9:37 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome:     4 │ 
apps-edlove-web:lint:biome:   

@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      7 │ export const LineChart = (Gifted as any).LineChart;
@repo/people:lint:biome:      28     │ - → visible,␍

@repo/people:lint:biome:      29     │ - → teacherId,␍
@repo/people:lint:biome:      30     │ - → onClose,␍
@repo/people:lint:biome:      31     │ - }:·TeacherEchoHistoryModalProps)·{␍
@repo/people:lint:biome:      32     │ - → const·[echoes,·setEchoes]·=·useState<TeacherSentEcho[]>([]);␍
@repo/accounting:lint:biome:     35    │ - → )·{␍

@repo/graphics:lint:biome:      8 │ export const PieChart = (Gifted as any).PieChart;
@repo/accounting:lint:biome:     36    │ - → → const·{·data,·error·}·=·await·supabase␍
@repo/graphics:lint:biome:    > 9 │ export const AreaChart = (Gifted as any).LineChart; // Area is a mode of LineChart
@repo/accounting:lint:biome:     37    │ - → → → .schema("accounting")␍
@repo/accounting:lint:biome:     38    │ - → → → .from("cheques")␍
@repo/accounting:lint:biome:     39    │ - → → → .update({␍
@repo/graphics:lint:biome:        │                                     ^^^

@repo/graphics:lint:biome:     10 │ export const StackedBarChart = (Gifted as any).BarChart; // Stacked is a mode of BarChart
@repo/accounting:lint:biome:     40    │ - → → → → status:·"cleared",␍
@repo/graphics:lint:biome:     11 │ export const ScatterChart = (Gifted as any).LineChart; // Scatter is a mode of LineChart
@repo/graphics:lint:biome:   

@repo/accounting:lint:biome:     41    │ - → → → → cleared_date:·clearedDate,␍
@repo/people:lint:biome:      33     │ - → const·[loading,·setLoading]·=·useState(false);␍
@repo/people:lint:biome:      34     │ - ␍
@repo/people:lint:biome:      35     │ - → useEffect(()·=>·{␍

apps-edlove-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-edlove-web:lint:biome:   

@repo/accounting:lint:biome:     42    │ - → → → })␍
@repo/accounting:lint:biome:     43    │ - → → → .eq("id",·id)␍
@repo/accounting:lint:biome:     44    │ - → → → .select()␍
@repo/accounting:lint:biome:     45    │ - → → → .single();␍
@repo/graphics:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/graphics:lint:biome:   
apps-edlove-web:lint:biome:   i Unsafe fix: If this is intentional, prepend currentYear with an underscore.
@repo/graphics:lint:biome: 
apps-edlove-web:lint:biome:   
@repo/graphics:lint:biome: src\charts\GiftedCharts.tsx:10:43 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/graphics:lint:biome: 
@repo/people:lint:biome:      36     │ - → → if·(!visible·||·!teacherId)·return;␍
@repo/accounting:lint:biome:     46    │ - ␍
@repo/accounting:lint:biome:     47    │ - → → if·(error)·throw·error;␍
@repo/accounting:lint:biome:     48    │ - ␍
@repo/accounting:lint:biome:     49    │ - → → //·In·a·real·implementation,·this·would·also·trigger·recordTransaction()␍

@repo/accounting:lint:biome:     50    │ - → → //·to·move·money·from·"Pending·Cheques"·to·"Bank·Account".␍
@repo/graphics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      8 │ export const PieChart = (Gifted as any).PieChart;

apps-edlove-web:lint:biome:     1 1 │   
@repo/graphics:lint:biome:      9 │ export const AreaChart = (Gifted as any).LineChart; // Area is a mode of LineChart
@repo/graphics:lint:biome:   > 10 │ export const StackedBarChart = (Gifted as any).BarChart; // Stacked is a mode of BarChart
@repo/graphics:lint:biome:        │                                           ^^^
@repo/people:lint:biome:      37     │ - ␍

@repo/people:lint:biome:      38     │ - → → let·mounted·=·true;␍
@repo/accounting:lint:biome:     51    │ - ␍
@repo/accounting:lint:biome:     52    │ - → → return·data;␍
@repo/accounting:lint:biome:     53    │ - → }␍
@repo/accounting:lint:biome:     54    │ - }␍
@repo/accounting:lint:biome:         1 │ + import·{·supabase·}·from·'@repo/core/api';
@repo/accounting:lint:biome:         2 │ + 

@repo/accounting:lint:biome:         3 │ + export·class·ChequeManager·{
@repo/graphics:lint:biome:     11 │ export const ScatterChart = (Gifted as any).LineChart; // Scatter is a mode of LineChart
@repo/graphics:lint:biome:     12 │ 
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 

@repo/graphics:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/base";␍

@repo/graphics:lint:biome:     2   │ - ␍
@repo/graphics:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/graphics:lint:biome:     4   │ - export·default·[...config];␍
@repo/graphics:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/base';
@repo/graphics:lint:biome:       2 │ + 
@repo/graphics:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/

@repo/graphics:lint:biome:       4 │ + export·default·[...config];
@repo/graphics:lint:biome:     5 5 │   
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\algorithms\CaptureEngine.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:

@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      1    │ - import·type·{·GraphNode,·KnowledgeTopology·}·from·"@repo/core/types";␍
@repo/graphics:lint:biome:      2    │ - ␍
@repo/graphics:lint:biome:      3    │ - /**␍
@repo/graphics:lint:biome:      4    │ - ·*·CaptureEngine··Prepares·and·optimizes·visualizations·for·static·export.␍
@repo/graphics:lint:biome:      5    │ - ·*␍
@repo/graphics:lint:biome:      6    │ - ·*·Used·for·including·maps/charts·in·generated·PDF/HTML·reports.␍

@repo/graphics:lint:biome:      7    │ - ·*/␍
@repo/graphics:lint:biome:      8    │ - export·const·CaptureEngine·=·{␍
@repo/graphics:lint:biome:      9    │ - → /**␍
@repo/graphics:lint:biome:     10    │ - → ·*·Prepares·the·topology·for·a·high-res·capture.␍
@repo/graphics:lint:biome:     11    │ - → ·*·Removes·temporary·UI·states,·filters·out·irrelevant·nodes·for·a·report·view.␍
@repo/graphics:lint:biome:     12    │ - → ·*/␍
@repo/graphics:lint:biome:     13    │ - → prepareForCapture:·(topology:·KnowledgeTopology)·=>·{␍
@repo/graphics:lint:biome:     14    │ - → → //·Rule:·Report·views·should·only·show·the·primary·knowledge·structure.␍

@repo/graphics:lint:biome:     15    │ - → → //·We·filter·out·any·'persona'·or·helper·nodes·that·might·be·in·the·live·view.␍
@repo/graphics:lint:biome:     16    │ - → → return·{␍
@repo/graphics:lint:biome:     17    │ - → → → ...topology,␍
@repo/graphics:lint:biome:     18    │ - → → → nodes:·topology.nodes.filter((n:·GraphNode)·=>·n.type·!==·"persona"),␍
@repo/graphics:lint:biome:     19    │ - → → };␍
@repo/graphics:lint:biome:     20    │ - → },␍
@repo/graphics:lint:biome:     21    │ - ␍
@repo/graphics:lint:biome:     22    │ - → /**␍
@repo/graphics:lint:biome:     23    │ - → ·*·Web-only:·Converts·an·SVG·element·to·a·DataURL·(PNG).␍

@repo/graphics:lint:biome:     24    │ - → ·*·This·is·used·in·the·web·app·to·"snapshot"·the·visualization·before·attaching·to·a·report.␍
@repo/graphics:lint:biome:     25    │ - → ·*/␍
@repo/graphics:lint:biome:     26    │ - → svgToDataURL:·async·(svgElement:·SVGSVGElement):·Promise<string>·=>·{␍
@repo/graphics:lint:biome:     27    │ - → → return·new·Promise((resolve,·reject)·=>·{␍
@repo/graphics:lint:biome:     28    │ - → → → try·{␍
@repo/graphics:lint:biome:     29    │ - → → → → const·svgData·=·new·XMLSerializer().serializeToString(svgElement);␍
@repo/graphics:lint:biome:     30    │ - → → → → const·canvas·=·document.createElement("canvas");␍
@repo/graphics:lint:biome:     31    │ - → → → → const·ctx·=·canvas.getContext("2d");␍
@repo/graphics:lint:biome:     32    │ - → → → → const·img·=·new·Image();␍

@repo/graphics:lint:biome:     33    │ - ␍
@repo/graphics:lint:biome:     34    │ - → → → → const·svgSize·=·svgElement.getBoundingClientRect();␍
@repo/graphics:lint:biome:     35    │ - → → → → canvas.width·=·svgSize.width·*·2;·//·High-res␍
@repo/graphics:lint:biome:     36    │ - → → → → canvas.height·=·svgSize.height·*·2;␍
@repo/graphics:lint:biome:     37    │ - ␍
@repo/graphics:lint:biome:     38    │ - → → → → img.onload·=·()·=>·{␍
@repo/graphics:lint:biome:     39    │ - → → → → → ctx?.drawImage(img,·0,·0,·canvas.width,·canvas.height);␍

@repo/people:lint:biome:      39     │ - → → const·load·=·async·()·=>·{␍
@repo/accounting:lint:biome:         4 │ + ··/**

@repo/accounting:lint:biome:         5 │ + ···*·Registers·a·new·cheque·in·the·system.
@repo/accounting:lint:biome:         6 │ + ···*/
@repo/accounting:lint:biome:         7 │ + ··static·async·registerCheque(cheque:·{
@repo/people:lint:biome:      40     │ - → → → setLoading(true);␍
@repo/accounting:lint:biome:         8 │ + ····cheque_no:·string;
@repo/people:lint:biome:      41     │ - → → → try·{␍
@repo/accounting:lint:biome:         9 │ + ····bank_name:·string;

@repo/people:lint:biome:      42     │ - → → → → const·data·=·await·teacherFeedbackAPI.listSentEchoes(teacherId,·20);␍
@repo/accounting:lint:biome:        10 │ + ····payee_name:·string;
@repo/accounting:lint:biome:        11 │ + ····amount:·number;
@repo/accounting:lint:biome:        12 │ + ····issue_date:·string;
@repo/people:lint:biome:      43     │ - → → → → if·(mounted)·setEchoes(data);␍
apps-edlove-web:lint:biome:     2   │ - const·currentYear·=·new·Date().getFullYear();

@repo/accounting:lint:biome:        13 │ + ····metadata?:·any;
@repo/graphics:lint:biome:     40    │ - → → → → → resolve(canvas.toDataURL("image/png"));␍
@repo/accounting:lint:biome:        14 │ + ··})·{
@repo/people:lint:biome:      44     │ - → → → }·catch·(err)·{␍
@repo/people:lint:biome:      45     │ - → → → → console.error("Failed·to·load·feedback·history:",·err);␍
apps-edlove-web:lint:biome:       2 │ + const·_currentYear·=·new·Date().getFullYear();

@repo/graphics:lint:biome:     41    │ - → → → → };␍
@repo/graphics:lint:biome:     42    │ - ␍
@repo/people:lint:biome:      46     │ - → → → }·finally·{␍
apps-edlove-web:lint:biome:     3 3 │   

apps-edlove-web:lint:biome:   
@repo/graphics:lint:biome:     43    │ - → → → → img.src·=·`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;␍
@repo/people:lint:biome:      47     │ - → → → → if·(mounted)·setLoading(false);␍
@repo/people:lint:biome:      48     │ - → → → }␍
@repo/people:lint:biome:      49     │ - → → };␍
@repo/graphics:lint:biome:     44    │ - → → → }·catch·(err)·{␍

apps-edlove-web:lint:biome: 
@repo/people:lint:biome:      50     │ - ␍
@repo/graphics:lint:biome:     45    │ - → → → → reject(err);␍
@repo/graphics:lint:biome:     46    │ - → → → }␍
@repo/graphics:lint:biome:     47    │ - → → });␍
@repo/people:lint:biome:      51     │ - → → void·load();␍

@repo/people:lint:biome:      52     │ - → → return·()·=>·{␍
@repo/graphics:lint:biome:     48    │ - → },␍
@repo/graphics:lint:biome:     49    │ - };␍
apps-edlove-web:lint:biome: src\types\index.ts:323:12 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome:         1 │ + import·type·{·GraphNode,·KnowledgeTopology·}·from·'@repo/core/types';

@repo/graphics:lint:biome:         2 │ + 
@repo/people:lint:biome:      53     │ - → → → mounted·=·false;␍
@repo/people:lint:biome:      54     │ - → → };␍
@repo/people:lint:biome:      55     │ - → },·[teacherId,·visible]);␍
@repo/people:lint:biome:      56     │ - ␍
@repo/people:lint:biome:      57     │ - → return·(␍
@repo/graphics:lint:biome:         3 │ + /**

@repo/graphics:lint:biome:         4 │ + ·*·CaptureEngine··Prepares·and·optimizes·visualizations·for·static·export.
apps-edlove-web:lint:biome: 
@repo/people:lint:biome:      58     │ - → → <SanctuaryModal␍
@repo/people:lint:biome:      59     │ - → → → isOpen={visible}␍
@repo/people:lint:biome:      60     │ - → → → onClose={onClose}␍

@repo/people:lint:biome:      61     │ - → → → title="Echo·History"␍
apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
@repo/graphics:lint:biome:         5 │ + ·*
@repo/graphics:lint:biome:         6 │ + ·*·Used·for·including·maps/charts·in·generated·PDF/HTML·reports.
@repo/people:lint:biome:      62     │ - → → → subtitle="SOVEREIGN·FEEDBACK"␍

apps-edlove-web:lint:biome:   
@repo/graphics:lint:biome:         7 │ + ·*/

@repo/people:lint:biome:      63     │ - → → >␍
@repo/graphics:lint:biome:         8 │ + export·const·CaptureEngine·=·{
@repo/graphics:lint:biome:         9 │ + ··/**
@repo/graphics:lint:biome:        10 │ + ···*·Prepares·the·topology·for·a·high-res·capture.
@repo/graphics:lint:biome:        11 │ + ···*·Removes·temporary·UI·states,·filters·out·irrelevant·nodes·for·a·report·view.

@repo/graphics:lint:biome:        12 │ + ···*/
@repo/people:lint:biome:      64     │ - → → → <Box·className="flex-1">␍
@repo/graphics:lint:biome:        13 │ + ··prepareForCapture:·(topology:·KnowledgeTopology)·=>·{
@repo/people:lint:biome:      65     │ - → → → → {/*·Content·*/}␍
@repo/people:lint:biome:      66     │ - → → → → <ScrollView␍
@repo/graphics:lint:biome:        14 │ + ····//·Rule:·Report·views·should·only·show·the·primary·knowledge·structure.

@repo/people:lint:biome:      67     │ - → → → → → className="flex-1"␍
@repo/people:lint:biome:      68     │ - → → → → → contentContainerStyle={{·padding:·0,·paddingBottom:·60·}}␍
apps-edlove-web:lint:biome:     321 │ 	type?: "video" | "image" | "form" | "confirmation" | "content";
@repo/graphics:lint:biome:        15 │ + ····//·We·filter·out·any·'persona'·or·helper·nodes·that·might·be·in·the·live·view.
@repo/graphics:lint:biome:        16 │ + ····return·{

@repo/graphics:lint:biome:        17 │ + ······...topology,
@repo/graphics:lint:biome:        18 │ + ······nodes:·topology.nodes.filter((n:·GraphNode)·=>·n.type·!==·'persona'),
@repo/graphics:lint:biome:        19 │ + ····};
@repo/graphics:lint:biome:        20 │ + ··},
@repo/graphics:lint:biome:        21 │ + 
@repo/graphics:lint:biome:        22 │ + ··/**

@repo/graphics:lint:biome:        23 │ + ···*·Web-only:·Converts·an·SVG·element·to·a·DataURL·(PNG).
@repo/people:lint:biome:      69     │ - → → → → → showsVerticalScrollIndicator={false}␍
@repo/graphics:lint:biome:        24 │ + ···*·This·is·used·in·the·web·app·to·"snapshot"·the·visualization·before·attaching·to·a·report.
@repo/people:lint:biome:      70     │ - → → → → >␍
@repo/graphics:lint:biome:        25 │ + ···*/

@repo/graphics:lint:biome:        26 │ + ··svgToDataURL:·async·(svgElement:·SVGSVGElement):·Promise<string>·=>·{
@repo/graphics:lint:biome:        27 │ + ····return·new·Promise((resolve,·reject)·=>·{
@repo/graphics:lint:biome:        28 │ + ······try·{
@repo/people:lint:biome:      71     │ - → → → → → {loading·?·(␍
@repo/people:lint:biome:      72     │ - → → → → → → <VStack·space="md">␍
@repo/people:lint:biome:      73     │ - → → → → → → → <SkeletonCard·/>␍
@repo/graphics:lint:biome:        29 │ + ········const·svgData·=·new·XMLSerializer().serializeToString(svgElement);

@repo/graphics:lint:biome:        30 │ + ········const·canvas·=·document.createElement('canvas');
@repo/people:lint:biome:      74     │ - → → → → → → → <SkeletonCard·/>␍
@repo/people:lint:biome:      75     │ - → → → → → → → <SkeletonCard·/>␍
apps-edlove-web:lint:biome:     322 │ 	title?: string;
@repo/people:lint:biome:      76     │ - → → → → → → </VStack>␍
@repo/people:lint:biome:      77     │ - → → → → → )·:·echoes.length·===·0·?·(␍

@repo/people:lint:biome:      78     │ - → → → → → → <Box·className="px-12·py-20·items-center·justify-center·mt-10">␍
@repo/people:lint:biome:      79     │ - → → → → → → → <Text·className="text-sm·text-phase-text-tertiary·italic·text-center·font-medium·leading-6">␍
@repo/people:lint:biome:      80     │ - → → → → → → → → No·echoes·sent·yet.·Use·the·"Principal·Echo"·action·to·share␍
@repo/people:lint:biome:      81     │ - → → → → → → → → feedback·with·the·governing·body.␍
@repo/people:lint:biome:      82     │ - → → → → → → → </Text>␍
@repo/people:lint:biome:      83     │ - → → → → → → </Box>␍
apps-edlove-web:lint:biome:   > 323 │ 	content?: any;
@repo/people:lint:biome:      84     │ - → → → → → )·:·(␍

@repo/people:lint:biome:      85     │ - → → → → → → <VStack·space="lg">␍
@repo/people:lint:biome:      86     │ - → → → → → → → {echoes.map((echo)·=>·(␍
@repo/people:lint:biome:      87     │ - → → → → → → → → <Box␍
apps-edlove-web:lint:biome:         │ 	          ^^^
@repo/people:lint:biome:      88     │ - → → → → → → → → → key={echo.id}␍
@repo/people:lint:biome:      89     │ - → → → → → → → → → className="bg-phase-surface/20·rounded-[32px]·border·border-phase-surface·shadow-sm·overflow-hidden"␍
@repo/people:lint:biome:      90     │ - → → → → → → → → >␍
@repo/people:lint:biome:      91     │ - → → → → → → → → → {/*·Priority·Indicator·*/}␍

@repo/people:lint:biome:      92     │ - → → → → → → → → → <Box␍
@repo/people:lint:biome:      93     │ - → → → → → → → → → → className={`absolute·left-0·top-0·bottom-0·w-1.5·${␍
@repo/people:lint:biome:      94     │ - → → → → → → → → → → → echo.priority·===·"high"␍
@repo/people:lint:biome:      95     │ - → → → → → → → → → → → → ?·"bg-phase-error"␍
@repo/people:lint:biome:      96     │ - → → → → → → → → → → → → :·"bg-phase-interactive"␍
@repo/people:lint:biome:      97     │ - → → → → → → → → → → }`}␍
@repo/people:lint:biome:      98     │ - → → → → → → → → → />␍
@repo/people:lint:biome:      99     │ - ␍
@repo/people:lint:biome:     100     │ - → → → → → → → → → <VStack·className="p-6">␍
@repo/people:lint:biome:     101     │ - → → → → → → → → → → <HStack·className="justify-between·items-center·mb-4">␍

@repo/people:lint:biome:     102     │ - → → → → → → → → → → → <HStack·space="xs"·className="items-center·flex-wrap">␍
@repo/people:lint:biome:     103     │ - → → → → → → → → → → → → <Box·className="bg-phase-surface·px-2.5·py-1·rounded-full·border·border-phase-surface">␍
apps-edlove-web:lint:biome:     324 │ 	on_close?: () => void;

@repo/people:lint:biome:     104     │ - → → → → → → → → → → → → → <Text·className="text-[10px]·font-bold·uppercase·text-phase-text-secondary·tracking-tight">␍
@repo/people:lint:biome:     105     │ - → → → → → → → → → → → → → → {echo.category}␍
@repo/people:lint:biome:     106     │ - → → → → → → → → → → → → → </Text>␍
@repo/people:lint:biome:     107     │ - → → → → → → → → → → → → </Box>␍
@repo/people:lint:biome:     108     │ - → → → → → → → → → → → → <Box␍
@repo/people:lint:biome:     109     │ - → → → → → → → → → → → → → className={`px-2.5·py-1·rounded-full·border·${␍
@repo/people:lint:biome:     110     │ - → → → → → → → → → → → → → → echo.priority·===·"high"␍

@repo/people:lint:biome:     111     │ - → → → → → → → → → → → → → → → ?·"bg-phase-error/10·border-phase-error/20"␍
@repo/people:lint:biome:     112     │ - → → → → → → → → → → → → → → → :·"bg-phase-interactive/10·border-phase-interactive/20"␍
@repo/people:lint:biome:     113     │ - → → → → → → → → → → → → → }`}␍
@repo/people:lint:biome:     114     │ - → → → → → → → → → → → → >␍
@repo/people:lint:biome:     115     │ - → → → → → → → → → → → → → <Text␍
@repo/people:lint:biome:     116     │ - → → → → → → → → → → → → → → className={`text-[10px]·font-bold·uppercase·${␍
@repo/people:lint:biome:     117     │ - → → → → → → → → → → → → → → → echo.priority·===·"high"␍
@repo/people:lint:biome:     118     │ - → → → → → → → → → → → → → → → → ?·"text-phase-error"␍
@repo/people:lint:biome:     119     │ - → → → → → → → → → → → → → → → → :·"text-phase-interactive"␍
@repo/people:lint:biome:     120     │ - → → → → → → → → → → → → → → }`}␍
@repo/people:lint:biome:     121     │ - → → → → → → → → → → → → → >␍
@repo/people:lint:biome:     122     │ - → → → → → → → → → → → → → → {echo.priority}␍

@repo/people:lint:biome:     123     │ - → → → → → → → → → → → → → </Text>␍
@repo/people:lint:biome:     124     │ - → → → → → → → → → → → → </Box>␍
@repo/people:lint:biome:     125     │ - → → → → → → → → → → → → <Box␍
@repo/people:lint:biome:     126     │ - → → → → → → → → → → → → → className={`px-2.5·py-1·rounded-full·border·${␍
@repo/people:lint:biome:     127     │ - → → → → → → → → → → → → → → echo.is_read␍
@repo/people:lint:biome:     128     │ - → → → → → → → → → → → → → → → ?·"bg-phase-success/10·border-phase-success/20"␍
@repo/people:lint:biome:     129     │ - → → → → → → → → → → → → → → → :·"bg-phase-warning/10·border-phase-warning/20"␍
@repo/people:lint:biome:     130     │ - → → → → → → → → → → → → → }`}␍
@repo/people:lint:biome:     131     │ - → → → → → → → → → → → → >␍
@repo/people:lint:biome:     132     │ - → → → → → → → → → → → → → <Text␍
@repo/people:lint:biome:     133     │ - → → → → → → → → → → → → → → className={`text-[10px]·font-bold·uppercase·${␍

@repo/people:lint:biome:     134     │ - → → → → → → → → → → → → → → → echo.is_read␍

apps-edlove-web:lint:biome:     325 │ 	on_confirm?: () => void;
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\types\index.ts:334:30 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     332 │ export interface AnalyticsEvent {

apps-edlove-web:lint:biome:     333 │ 	event_name: string;

apps-edlove-web:lint:biome:   > 334 │ 	properties?: Record<string, any>;

apps-edlove-web:lint:biome:         │ 	                            ^^^

apps-edlove-web:lint:biome:     335 │ 	user_id?: string;

@repo/graphics:lint:biome:        31 │ + ········const·ctx·=·canvas.getContext('2d');
@repo/graphics:lint:biome:        32 │ + ········const·img·=·new·Image();
@repo/graphics:lint:biome:        33 │ + 
@repo/graphics:lint:biome:        34 │ + ········const·svgSize·=·svgElement.getBoundingClientRect();
@repo/graphics:lint:biome:        35 │ + ········canvas.width·=·svgSize.width·*·2;·//·High-res
@repo/graphics:lint:biome:        36 │ + ········canvas.height·=·svgSize.height·*·2;
@repo/graphics:lint:biome:        37 │ + 
@repo/graphics:lint:biome:        38 │ + ········img.onload·=·()·=>·{
@repo/graphics:lint:biome:        39 │ + ··········ctx?.drawImage(img,·0,·0,·canvas.width,·canvas.height);

@repo/graphics:lint:biome:        40 │ + ··········resolve(canvas.toDataURL('image/png'));
@repo/graphics:lint:biome:        41 │ + ········};
@repo/graphics:lint:biome:        42 │ + 
@repo/graphics:lint:biome:        43 │ + ········img.src·=·`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;

@repo/graphics:lint:biome:        44 │ + ······}·catch·(err)·{
@repo/graphics:lint:biome:        45 │ + ········reject(err);
@repo/graphics:lint:biome:        46 │ + ······}
@repo/graphics:lint:biome:        47 │ + ····});
@repo/graphics:lint:biome:        48 │ + ··},

@repo/graphics:lint:biome:        49 │ + };
@repo/graphics:lint:biome:     50 50 │   
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\algorithms\CatchmentAnalysis.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      1    │ - /**␍
@repo/graphics:lint:biome:      2    │ - ·*·CatchmentAnalysis:·"Soul"·contribution·for·Gurudevi.␍

@repo/graphics:lint:biome:      3    │ - ·*·Handles·spatial·relationships·like·"Nearby·Schools"·and·"School·Zones".␍
@repo/graphics:lint:biome:      4    │ - ·*/␍
@repo/graphics:lint:biome:      5    │ - export·interface·Point·{␍
@repo/graphics:lint:biome:      6    │ - → lat:·number;␍
@repo/graphics:lint:biome:      7    │ - → lng:·number;␍
@repo/graphics:lint:biome:      8    │ - }␍
@repo/graphics:lint:biome:      9    │ - ␍
@repo/graphics:lint:biome:     10    │ - export·const·CatchmentAnalysis·=·{␍
@repo/graphics:lint:biome:     11    │ - → /**␍

@repo/graphics:lint:biome:     12    │ - → ·*·Haversine·formula·to·calculate·distance·between·two·points·on·Earth.␍
@repo/graphics:lint:biome:     13    │ - → ·*/␍

@repo/graphics:lint:biome:     14    │ - → getDistanceKm:·(p1:·Point,·p2:·Point):·number·=>·{␍
@repo/graphics:lint:biome:     15    │ - → → const·R·=·6371;·//·Earth's·radius·in·km␍
@repo/graphics:lint:biome:     16    │ - → → const·dLat·=·((p2.lat·-·p1.lat)·*·Math.PI)·/·180;␍
@repo/graphics:lint:biome:     17    │ - → → const·dLng·=·((p2.lng·-·p1.lng)·*·Math.PI)·/·180;␍
@repo/graphics:lint:biome:     18    │ - → → const·a·=␍

@repo/graphics:lint:biome:     19    │ - → → → Math.sin(dLat·/·2)·*·Math.sin(dLat·/·2)·+␍
@repo/graphics:lint:biome:     20    │ - → → → Math.cos((p1.lat·*·Math.PI)·/·180)·*␍
@repo/graphics:lint:biome:     21    │ - → → → → Math.cos((p2.lat·*·Math.PI)·/·180)·*␍
@repo/accounting:lint:biome:        15 │ + ····const·{·data,·error·}·=·await·supabase
@repo/accounting:lint:biome:        16 │ + ······.schema('accounting')
apps-edlove-web:lint:biome:     336 │ 	timestamp: string;

@repo/accounting:lint:biome:        17 │ + ······.from('cheques')
@repo/graphics:lint:biome:     22    │ - → → → → Math.sin(dLng·/·2)·*␍
@repo/accounting:lint:biome:        18 │ + ······.insert({
@repo/graphics:lint:biome:     23    │ - → → → → Math.sin(dLng·/·2);␍
@repo/accounting:lint:biome:        19 │ + ········...cheque,
@repo/accounting:lint:biome:        20 │ + ········status:·'pending',
@repo/accounting:lint:biome:        21 │ + ······})
@repo/graphics:lint:biome:     24    │ - → → const·c·=·2·*·Math.atan2(Math.sqrt(a),·Math.sqrt(1·-·a));␍

@repo/graphics:lint:biome:     25    │ - → → return·R·*·c;␍
@repo/accounting:lint:biome:        22 │ + ······.select()
@repo/graphics:lint:biome:     26    │ - → },␍
@repo/graphics:lint:biome:     27    │ - ␍
@repo/graphics:lint:biome:     28    │ - → /**␍
apps-edlove-web:lint:biome:   
@repo/graphics:lint:biome:     29    │ - → ·*·Checks·if·a·point·is·within·a·circular·catchment·zone.␍
@repo/accounting:lint:biome:        23 │ + ······.single();
@repo/graphics:lint:biome:     30    │ - → ·*/␍
@repo/graphics:lint:biome:     31    │ - → isWithinCatchment:·(␍

@repo/accounting:lint:biome:        24 │ + 
@repo/graphics:lint:biome:     32    │ - → → point:·Point,␍
@repo/graphics:lint:biome:     33    │ - → → center:·Point,␍
@repo/accounting:lint:biome:        25 │ + ····if·(error)·throw·error;
@repo/accounting:lint:biome:        26 │ + ····return·data;
@repo/accounting:lint:biome:        27 │ + ··}

@repo/accounting:lint:biome:        28 │ + 
@repo/accounting:lint:biome:        29 │ + ··/**
@repo/accounting:lint:biome:        30 │ + ···*·Marks·a·cheque·as·cleared·and·triggers·corresponding·ledger·entries.
@repo/accounting:lint:biome:        31 │ + ···*/
@repo/accounting:lint:biome:        32 │ + ··static·async·clearCheque(id:·string,·clearedDate:·string·=·new·Date().toISOString())·{
@repo/accounting:lint:biome:        33 │ + ····const·{·data,·error·}·=·await·supabase
@repo/accounting:lint:biome:        34 │ + ······.schema('accounting')

@repo/accounting:lint:biome:        35 │ + ······.from('cheques')
@repo/accounting:lint:biome:        36 │ + ······.update({
@repo/accounting:lint:biome:        37 │ + ········status:·'cleared',
@repo/accounting:lint:biome:        38 │ + ········cleared_date:·clearedDate,
@repo/accounting:lint:biome:        39 │ + ······})
@repo/accounting:lint:biome:        40 │ + ······.eq('id',·id)
@repo/accounting:lint:biome:        41 │ + ······.select()
@repo/accounting:lint:biome:        42 │ + ······.single();
@repo/accounting:lint:biome:        43 │ + 

@repo/accounting:lint:biome:        44 │ + ····if·(error)·throw·error;
@repo/accounting:lint:biome:        45 │ + 
@repo/accounting:lint:biome:        46 │ + ····//·In·a·real·implementation,·this·would·also·trigger·recordTransaction()
@repo/accounting:lint:biome:        47 │ + ····//·to·move·money·from·"Pending·Cheques"·to·"Bank·Account".
@repo/accounting:lint:biome:        48 │ + 
@repo/accounting:lint:biome:        49 │ + ····return·data;
@repo/accounting:lint:biome:        50 │ + ··}
@repo/graphics:lint:biome:     34    │ - → → radiusKm:·number,␍

@repo/accounting:lint:biome:        51 │ + }
@repo/accounting:lint:biome:     55 52 │   
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: src\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 
@repo/graphics:lint:biome:     35    │ - → ):·boolean·=>·{␍

@repo/graphics:lint:biome:     36    │ - → → return·CatchmentAnalysis.getDistanceKm(point,·center)·<=·radiusKm;␍
@repo/graphics:lint:biome:     37    │ - → },␍
@repo/graphics:lint:biome:     38    │ - ␍
@repo/graphics:lint:biome:     39    │ - → /**␍
@repo/graphics:lint:biome:     40    │ - → ·*·Filter·a·list·of·locations·based·on·a·search·center·and·radius.␍

@repo/graphics:lint:biome:     41    │ - → ·*/␍
@repo/graphics:lint:biome:     42    │ - → findNearby:·<T·extends·Point>(␍
@repo/graphics:lint:biome:     43    │ - → → locations:·T[],␍
@repo/graphics:lint:biome:     44    │ - → → center:·Point,␍
@repo/graphics:lint:biome:     45    │ - → → radiusKm:·number,␍
@repo/graphics:lint:biome:     46    │ - → ):·T[]·=>·{␍

@repo/graphics:lint:biome:     47    │ - → → return·locations.filter((loc)·=>␍
@repo/graphics:lint:biome:     48    │ - → → → CatchmentAnalysis.isWithinCatchment(loc,·center,·radiusKm),␍
@repo/graphics:lint:biome:     49    │ - → → );␍
@repo/graphics:lint:biome:     50    │ - → },␍
@repo/graphics:lint:biome:     51    │ - ␍
@repo/graphics:lint:biome:     52    │ - → /**␍

@repo/graphics:lint:biome:     53    │ - → ·*·Official·Sri·Lankan·Admission·Distance·Rules␍
@repo/graphics:lint:biome:     54    │ - → ·*/␍
@repo/graphics:lint:biome:     55    │ - → ADMISSION_RULES:·{␍
@repo/graphics:lint:biome:     56    │ - → → PRIMARY_ZONE_KM:·2.0,·//·Proximate·/·standard·catchment␍
@repo/graphics:lint:biome:     57    │ - → → SECONDARY_ZONE_KM:·5.0,·//·Extended·catchment·for·specific·school·types␍

@repo/graphics:lint:biome:     58    │ - → → PERMISSIBLE_MARGIN_KM:·0.1,·//·Tolerance·for·GPS·inaccuracies␍
@repo/graphics:lint:biome:     59    │ - → },␍
@repo/graphics:lint:biome:     60    │ - };␍
@repo/graphics:lint:biome:         1 │ + /**
@repo/graphics:lint:biome:         2 │ + ·*·CatchmentAnalysis:·"Soul"·contribution·for·Gurudevi.
@repo/graphics:lint:biome:         3 │ + ·*·Handles·spatial·relationships·like·"Nearby·Schools"·and·"School·Zones".

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/accounting:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
@repo/accounting:lint:biome:   

apps-edlove-web:lint:biome: 
@repo/accounting:lint:biome:     1   │ - export·*·from·"./budgeting";␍
@repo/accounting:lint:biome:     2   │ - export·*·from·"./cheques";␍
@repo/accounting:lint:biome:     3   │ - export·*·from·"./ledger";␍
@repo/accounting:lint:biome:     4   │ - export·*·from·"./types";␍
@repo/accounting:lint:biome:       1 │ + export·*·from·'./budgeting';
@repo/accounting:lint:biome:       2 │ + export·*·from·'./cheques';
@repo/accounting:lint:biome:       3 │ + export·*·from·'./ledger';
@repo/accounting:lint:biome:       4 │ + export·*·from·'./types';
@repo/accounting:lint:biome:     5 5 │   
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: src\ledger.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome:   × Formatter would have printed the following content:
@repo/accounting:lint:biome:   
@repo/accounting:lint:biome:      1    │ - import·{·supabase·}·from·"@repo/core/api";␍
@repo/accounting:lint:biome:      2    │ - ␍
@repo/accounting:lint:biome:      3    │ - import·type·{·FinancialTransaction,·LedgerEntry·}·from·"./types";␍
@repo/accounting:lint:biome:      4    │ - ␍
@repo/accounting:lint:biome:      5    │ - export·class·Ledger·{␍
@repo/accounting:lint:biome:      6    │ - → /**␍
@repo/accounting:lint:biome:      7    │ - → ·*·Records·a·full·financial·transaction·with·its·ledger·entries.␍
@repo/accounting:lint:biome:      8    │ - → ·*·Ensures·the·double-entry·balance·before·proceeding.␍
@repo/accounting:lint:biome:      9    │ - → ·*/␍
@repo/accounting:lint:biome:     10    │ - → static·async·recordTransaction(␍
apps-edlove-web:lint:biome: src\types\index.ts:355:12 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome:     11    │ - → → transaction:·Omit<FinancialTransaction,·"id"·|·"entries">,␍
apps-edlove-web:lint:biome: 
@repo/accounting:lint:biome:     12    │ - → → entries:·Omit<LedgerEntry,·"id"·|·"transactionId"·|·"createdAt">[],␍
@repo/accounting:lint:biome:     13    │ - → )·{␍
@repo/accounting:lint:biome:     14    │ - → → //·1.·Validate·Double·Entry·Balance␍
apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
@repo/accounting:lint:biome:     15    │ - → → const·total·=·entries.reduce((sum,·entry)·=>·{␍
apps-edlove-web:lint:biome:   
@repo/accounting:lint:biome:     16    │ - → → → return·entry.side·===·"debit"·?·sum·+·entry.amount·:·sum·-·entry.amount;␍
apps-edlove-web:lint:biome:     353 │ 	code: string;

@repo/accounting:lint:biome:     17    │ - → → },·0);␍
apps-edlove-web:lint:biome:     354 │ 	message: string;
@repo/accounting:lint:biome:     18    │ - ␍
@repo/accounting:lint:biome:     19    │ - → → if·(Math.abs(total)·>·0.001)·{␍
@repo/accounting:lint:biome:     20    │ - → → → throw·new·Error(␍
@repo/accounting:lint:biome:     21    │ - → → → → "Transaction·is·not·balanced.·Debits·must·equal·Credits.",␍
@repo/accounting:lint:biome:     22    │ - → → → );␍
@repo/accounting:lint:biome:     23    │ - → → }␍
@repo/accounting:lint:biome:     24    │ - ␍
@repo/accounting:lint:biome:     25    │ - → → //·2.·Insert·Transaction·Header␍
@repo/accounting:lint:biome:     26    │ - → → const·{·data:·tx,·error:·txError·}·=·await·supabase␍
@repo/accounting:lint:biome:     27    │ - → → → .schema("accounting")␍
@repo/accounting:lint:biome:     28    │ - → → → .from("transactions")␍
@repo/accounting:lint:biome:     29    │ - → → → .insert(transaction)␍
@repo/accounting:lint:biome:     30    │ - → → → .select()␍
@repo/accounting:lint:biome:     31    │ - → → → .single();␍
apps-edlove-web:lint:biome:   > 355 │ 	details?: any;
@repo/accounting:lint:biome:     32    │ - ␍
apps-edlove-web:lint:biome:         │ 	          ^^^
@repo/accounting:lint:biome:     33    │ - → → if·(txError)·throw·txError;␍
@repo/accounting:lint:biome:     34    │ - ␍
@repo/accounting:lint:biome:     35    │ - → → //·3.·Insert·Ledger·Entries␍
@repo/accounting:lint:biome:     36    │ - → → const·entriesWithTxId·=·entries.map((e)·=>·({␍
@repo/accounting:lint:biome:     37    │ - → → → ...e,␍
@repo/accounting:lint:biome:     38    │ - → → → transaction_id:·tx.id,␍
@repo/accounting:lint:biome:     39    │ - → → }));␍
@repo/accounting:lint:biome:     40    │ - ␍
@repo/accounting:lint:biome:     41    │ - → → const·{·error:·entriesError·}·=·await·supabase␍
@repo/accounting:lint:biome:     42    │ - → → → .schema("accounting")␍

@repo/accounting:lint:biome:     43    │ - → → → .from("ledger_entries")␍
@repo/accounting:lint:biome:     44    │ - → → → .insert(entriesWithTxId);␍
apps-edlove-web:lint:biome:     356 │ 	stack?: string;
@repo/accounting:lint:biome:     45    │ - ␍
@repo/accounting:lint:biome:     46    │ - → → if·(entriesError)·throw·entriesError;␍
@repo/accounting:lint:biome:     47    │ - ␍
@repo/accounting:lint:biome:     48    │ - → → return·tx;␍
@repo/accounting:lint:biome:     49    │ - → }␍
@repo/accounting:lint:biome:     50    │ - ␍
@repo/accounting:lint:biome:     51    │ - → /**␍
@repo/accounting:lint:biome:     52    │ - → ·*·Fetches·the·current·balance·of·an·account.␍
@repo/accounting:lint:biome:     53    │ - → ·*/␍
@repo/accounting:lint:biome:     54    │ - → static·async·getAccountBalance(accountId:·string)·{␍
@repo/accounting:lint:biome:     55    │ - → → const·{·data,·error·}·=·await·supabase␍
@repo/accounting:lint:biome:     56    │ - → → → .schema("accounting")␍
@repo/accounting:lint:biome:     57    │ - → → → .from("vw_account_balances")␍
@repo/accounting:lint:biome:     58    │ - → → → .select("balance")␍
@repo/accounting:lint:biome:     59    │ - → → → .eq("id",·accountId)␍
@repo/accounting:lint:biome:     60    │ - → → → .single();␍
@repo/accounting:lint:biome:     61    │ - ␍
@repo/accounting:lint:biome:     62    │ - → → if·(error)·throw·error;␍
@repo/accounting:lint:biome:     63    │ - → → return·data.balance;␍
@repo/accounting:lint:biome:     64    │ - → }␍
@repo/accounting:lint:biome:     65    │ - }␍
@repo/accounting:lint:biome:         1 │ + import·{·supabase·}·from·'@repo/core/api';
@repo/accounting:lint:biome:         2 │ + 
@repo/accounting:lint:biome:         3 │ + import·type·{·FinancialTransaction,·LedgerEntry·}·from·'./types';
@repo/accounting:lint:biome:         4 │ + 
@repo/accounting:lint:biome:         5 │ + export·class·Ledger·{
@repo/accounting:lint:biome:         6 │ + ··/**
@repo/accounting:lint:biome:         7 │ + ···*·Records·a·full·financial·transaction·with·its·ledger·entries.
@repo/accounting:lint:biome:         8 │ + ···*·Ensures·the·double-entry·balance·before·proceeding.
@repo/accounting:lint:biome:         9 │ + ···*/
@repo/accounting:lint:biome:        10 │ + ··static·async·recordTransaction(
@repo/accounting:lint:biome:        11 │ + ····transaction:·Omit<FinancialTransaction,·'id'·|·'entries'>,
apps-edlove-web:lint:biome:     357 │ 	timestamp: string;
apps-edlove-web:lint:biome:   

@repo/accounting:lint:biome:        12 │ + ····entries:·Omit<LedgerEntry,·'id'·|·'transactionId'·|·'createdAt'>[],
@repo/accounting:lint:biome:        13 │ + ··)·{
@repo/accounting:lint:biome:        14 │ + ····//·1.·Validate·Double·Entry·Balance
@repo/accounting:lint:biome:        15 │ + ····const·total·=·entries.reduce((sum,·entry)·=>·{
@repo/accounting:lint:biome:        16 │ + ······return·entry.side·===·'debit'·?·sum·+·entry.amount·:·sum·-·entry.amount;
@repo/accounting:lint:biome:        17 │ + ····},·0);
@repo/people:lint:biome:     135     │ - → → → → → → → → → → → → → → → → ?·"text-phase-success"␍
@repo/people:lint:biome:     136     │ - → → → → → → → → → → → → → → → → :·"text-phase-warning"␍

@repo/people:lint:biome:     137     │ - → → → → → → → → → → → → → → }`}␍
@repo/accounting:lint:biome:        18 │ + 
@repo/people:lint:biome:     138     │ - → → → → → → → → → → → → → >␍
@repo/people:lint:biome:     139     │ - → → → → → → → → → → → → → → {echo.is_read·?·"read"·:·"pending"}␍
@repo/accounting:lint:biome:        19 │ + ····if·(Math.abs(total)·>·0.001)·{
@repo/people:lint:biome:     140     │ - → → → → → → → → → → → → → </Text>␍
@repo/accounting:lint:biome:        20 │ + ······throw·new·Error('Transaction·is·not·balanced.·Debits·must·equal·Credits.');

@repo/accounting:lint:biome:        21 │ + ····}
apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/people:lint:biome:     141     │ - → → → → → → → → → → → → </Box>␍
@repo/people:lint:biome:     142     │ - → → → → → → → → → → → </HStack>␍
@repo/accounting:lint:biome:        22 │ + 
@repo/accounting:lint:biome:        23 │ + ····//·2.·Insert·Transaction·Header

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
@repo/people:lint:biome:     143     │ - → → → → → → → → → → </HStack>␍
@repo/people:lint:biome:     144     │ - ␍
@repo/people:lint:biome:     145     │ - → → → → → → → → → → <Text·className="text-base·text-phase-text-primary·leading-7·font-medium·mb-4">␍
@repo/people:lint:biome:     146     │ - → → → → → → → → → → → {echo.content}␍
@repo/people:lint:biome:     147     │ - → → → → → → → → → → </Text>␍
@repo/people:lint:biome:     148     │ - ␍

@repo/people:lint:biome:     149     │ - → → → → → → → → → → <HStack·className="justify-between·items-center·pt-4·border-t·border-phase-surface/50">␍
@repo/people:lint:biome:     150     │ - → → → → → → → → → → → <Text·className="text-[10px]·font-bold·text-phase-text-tertiary·uppercase·tracking-widest">␍
@repo/people:lint:biome:   208 more lines truncated

@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\TeacherFeedbackModal.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   

@repo/people:lint:biome:       1     │ - import·SanctuaryModal·from·"@repo/ui/components/SanctuaryModal";␍
@repo/people:lint:biome:       2     │ - import·{␍
@repo/people:lint:biome:       3     │ - → Box,␍
@repo/people:lint:biome:       4     │ - → Button,␍
@repo/people:lint:biome:       5     │ - → ButtonText,␍
@repo/people:lint:biome:       6     │ - → HStack,␍

@repo/people:lint:biome:       7     │ - → Icon,␍
@repo/people:lint:biome:       8     │ - → Select,␍
@repo/people:lint:biome:       9     │ - → SelectBackdrop,␍
@repo/people:lint:biome:      10     │ - → SelectContent,␍

@repo/people:lint:biome:      11     │ - → SelectIcon,␍
@repo/people:lint:biome:      12     │ - → SelectInput,␍

@repo/people:lint:biome:      13     │ - → SelectItem,␍
@repo/people:lint:biome:      14     │ - → SelectPortal,␍
apps-edlove-web:lint:biome: src\utils\helpers.ts:328:46 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome:      15     │ - → SelectTrigger,␍
@repo/people:lint:biome:      16     │ - → Spinner,␍

apps-edlove-web:lint:biome: 
@repo/people:lint:biome:      17     │ - → Text,␍
@repo/people:lint:biome:      18     │ - → Textarea,␍
@repo/people:lint:biome:      19     │ - → TextareaInput,␍
@repo/people:lint:biome:      20     │ - → VStack,␍
@repo/people:lint:biome:      21     │ - }·from·"@repo/ui/primitives";␍
@repo/people:lint:biome:      22     │ - import·{␍
@repo/people:lint:biome:      23     │ - → AlertTriangle,␍
@repo/people:lint:biome:      24     │ - → CheckCircle2,␍
@repo/people:lint:biome:      25     │ - → ChevronDown,␍
@repo/people:lint:biome:      26     │ - → Heart,␍
@repo/people:lint:biome:      27     │ - → MessageSquare,␍

@repo/people:lint:biome:      28     │ - }·from·"lucide-react-native";␍
@repo/people:lint:biome:      29     │ - import·{·useState·}·from·"react";␍
@repo/people:lint:biome:      30     │ - import·{·useTranslation·}·from·"react-i18next";␍
@repo/people:lint:biome:      31     │ - import·{·teacherFeedbackAPI·}·from·"../feedback";␍
@repo/people:lint:biome:      32     │ - ␍
@repo/people:lint:biome:      33     │ - interface·TeacherFeedbackModalProps·{␍
@repo/people:lint:biome:      34     │ - → isOpen:·boolean;␍
@repo/people:lint:biome:      35     │ - → onClose:·()·=>·void;␍
@repo/people:lint:biome:      36     │ - → schoolId:·string;␍
@repo/people:lint:biome:      37     │ - → teacherId:·string;␍

@repo/people:lint:biome:      38     │ - }␍
@repo/people:lint:biome:      39     │ - ␍
@repo/people:lint:biome:      40     │ - const·CATEGORIES·=·[␍
@repo/people:lint:biome:      41     │ - → {·label:·"Teaching·Support",·value:·"support",·icon:·MessageSquare·},␍
apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
@repo/people:lint:biome:      42     │ - → {·label:·"Staff·Morale",·value:·"morale",·icon:·Heart·},␍
apps-edlove-web:lint:biome:   
@repo/people:lint:biome:      43     │ - → {·label:·"Facility/Resource·Alert",·value:·"facility",·icon:·AlertTriangle·},␍
@repo/people:lint:biome:      44     │ - → {␍
@repo/people:lint:biome:      45     │ - → → label:·"Recognition/Positive·Note",␍
@repo/people:lint:biome:      46     │ - → → value:·"recognition",␍
@repo/people:lint:biome:      47     │ - → → icon:·CheckCircle2,␍
@repo/people:lint:biome:      48     │ - → },␍
@repo/people:lint:biome:      49     │ - ];␍

@repo/people:lint:biome:      50     │ - ␍

@repo/people:lint:biome:      51     │ - export·default·function·TeacherFeedbackModal({␍
@repo/people:lint:biome:      52     │ - → isOpen,␍

@repo/people:lint:biome:      53     │ - → onClose,␍
@repo/people:lint:biome:      54     │ - → schoolId,␍
@repo/people:lint:biome:      55     │ - → teacherId,␍
@repo/people:lint:biome:      56     │ - }:·TeacherFeedbackModalProps)·{␍
@repo/people:lint:biome:      57     │ - → const·{·t·}·=·useTranslation();␍
@repo/people:lint:biome:      58     │ - → const·[category,·setCategory]·=·useState<string>("support");␍
@repo/people:lint:biome:      59     │ - → const·[content,·setContent]·=·useState("");␍
@repo/people:lint:biome:      60     │ - → const·[priority,·setPriority]·=·useState<"low"·|·"medium"·|·"high">("medium");␍

@repo/people:lint:biome:      61     │ - → const·[isSubmitting,·setIsSubmitting]·=·useState(false);␍
@repo/people:lint:biome:      62     │ - ␍
@repo/people:lint:biome:      63     │ - → const·handleSubmit·=·async·()·=>·{␍
@repo/people:lint:biome:      64     │ - → → if·(!content.trim())·return;␍
@repo/people:lint:biome:      65     │ - ␍
@repo/people:lint:biome:      66     │ - → → setIsSubmitting(true);␍
@repo/people:lint:biome:      67     │ - → → try·{␍
@repo/people:lint:biome:      68     │ - → → → const·ok·=·await·teacherFeedbackAPI.submitTeacherFeedback({␍
apps-edlove-web:lint:biome:     326 │  * Debounce function (wait for pause in calls)
@repo/people:lint:biome:      69     │ - → → → → schoolId,␍
@repo/people:lint:biome:      70     │ - → → → → teacherId,␍

@repo/people:lint:biome:      71     │ - → → → → category,␍
@repo/people:lint:biome:      72     │ - → → → → content,␍
@repo/people:lint:biome:      73     │ - → → → → priority,␍
@repo/people:lint:biome:      74     │ - → → → });␍
@repo/people:lint:biome:      75     │ - → → → if·(!ok)·return;␍
@repo/people:lint:biome:      76     │ - ␍
apps-edlove-web:lint:biome:     327 │  */
@repo/people:lint:biome:      77     │ - → → → onClose();␍
@repo/people:lint:biome:      78     │ - → → → setContent("");␍
@repo/people:lint:biome:      79     │ - → → }·finally·{␍

@repo/people:lint:biome:      80     │ - → → → setIsSubmitting(false);␍
@repo/people:lint:biome:      81     │ - → → }␍
@repo/people:lint:biome:      82     │ - → };␍
@repo/people:lint:biome:      83     │ - ␍
@repo/people:lint:biome:      84     │ - → const·footer·=·(␍
@repo/people:lint:biome:      85     │ - → → <HStack·className="gap-4·w-full">␍
@repo/people:lint:biome:      86     │ - → → → <Button␍
@repo/people:lint:biome:      87     │ - → → → → variant="outline"␍
@repo/people:lint:biome:      88     │ - → → → → onPress={onClose}␍
@repo/people:lint:biome:      89     │ - → → → → className="flex-1·border-phase-surface·rounded-2xl·h-14"␍

@repo/people:lint:biome:      90     │ - → → → >␍
@repo/people:lint:biome:      91     │ - → → → → <ButtonText·className="text-phase-text-secondary·font-bold">␍
@repo/people:lint:biome:      92     │ - → → → → → {t("common.cancel")}␍
@repo/people:lint:biome:      93     │ - → → → → </ButtonText>␍
@repo/people:lint:biome:      94     │ - → → → </Button>␍
@repo/people:lint:biome:      95     │ - → → → <Button␍
@repo/people:lint:biome:      96     │ - → → → → onPress={handleSubmit}␍
@repo/people:lint:biome:      97     │ - → → → → isDisabled={isSubmitting·||·!content.trim()}␍

@repo/people:lint:biome:      98     │ - → → → → className={`flex-[2]·rounded-2xl·h-14·shadow-lg·${␍
@repo/people:lint:biome:      99     │ - → → → → → priority·===·"high"␍
@repo/people:lint:biome:     100     │ - → → → → → → ?·"bg-phase-error·shadow-error/20"␍
@repo/people:lint:biome:     101     │ - → → → → → → :·"bg-phase-interactive·shadow-blue-500/20"␍
@repo/people:lint:biome:     102     │ - → → → → }`}␍
@repo/people:lint:biome:     103     │ - → → → >␍
@repo/people:lint:biome:     104     │ - → → → → {isSubmitting·?·(␍
@repo/people:lint:biome:     105     │ - → → → → → <Spinner·className="text-white"·/>␍
@repo/people:lint:biome:     106     │ - → → → → )·:·(␍
@repo/people:lint:biome:     107     │ - → → → → → <ButtonText·className="text-white·font-bold">␍

@repo/people:lint:biome:     108     │ - → → → → → → {t("common.send")}␍
@repo/people:lint:biome:     109     │ - → → → → → </ButtonText>␍
@repo/people:lint:biome:     110     │ - → → → → )}␍
@repo/people:lint:biome:     111     │ - → → → </Button>␍
@repo/people:lint:biome:     112     │ - → → </HStack>␍
@repo/people:lint:biome:     113     │ - → );␍
@repo/people:lint:biome:     114     │ - ␍
@repo/people:lint:biome:     115     │ - → return·(␍
@repo/people:lint:biome:     116     │ - → → <SanctuaryModal␍
@repo/people:lint:biome:     117     │ - → → → isOpen={isOpen}␍
@repo/people:lint:biome:     118     │ - → → → onClose={onClose}␍
@repo/people:lint:biome:     119     │ - → → → title={t("teacher.feedback.title")}␍
@repo/people:lint:biome:     120     │ - → → → subtitle={t("teacher.feedback.subtitle")}␍
@repo/people:lint:biome:     121     │ - → → → footer={footer}␍

apps-edlove-web:lint:biome:   > 328 │ export function debounce<T extends (...args: any[]) => any>(
@repo/people:lint:biome:     122     │ - → → >␍
@repo/people:lint:biome:     123     │ - → → → <VStack·className="gap-6·pt-4">␍
@repo/people:lint:biome:     124     │ - → → → → {/*·Category·selection·*/}␍
@repo/people:lint:biome:     125     │ - → → → → <VStack·className="gap-2">␍
@repo/people:lint:biome:     126     │ - → → → → → <Text·className="text-phase-text-tertiary·text-[10px]·font-black·uppercase·tracking-[1px]·ml-1">␍

apps-edlove-web:lint:biome:         │                                              ^^^

apps-edlove-web:lint:biome:     329 │ 	func: T,

apps-edlove-web:lint:biome:     330 │ 	delay: number,
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

@repo/people:lint:biome:     127     │ - → → → → → → {t("teacher.feedback.category")}␍
@repo/people:lint:biome:     128     │ - → → → → → </Text>␍

@repo/people:lint:biome:     129     │ - → → → → → <Select·onValueChange={setCategory}·value={category}>␍
@repo/people:lint:biome:     130     │ - → → → → → → <SelectTrigger·className="border-phase-surface/50·bg-phase-surface/20·h-14·rounded-2xl·px-4">␍
@repo/people:lint:biome:     131     │ - → → → → → → → <SelectInput␍
@repo/people:lint:biome:     132     │ - → → → → → → → → placeholder="Select·category"␍
@repo/people:lint:biome:     133     │ - → → → → → → → → className="text-phase-text-primary·font-bold"␍
@repo/people:lint:biome:     134     │ - → → → → → → → />␍
@repo/people:lint:biome:     135     │ - → → → → → → → <SelectIcon·className="mr-2">␍
@repo/people:lint:biome:     136     │ - → → → → → → → → <Icon␍
@repo/people:lint:biome:     137     │ - → → → → → → → → → as={ChevronDown}␍
@repo/people:lint:biome:     138     │ - → → → → → → → → → size="sm"␍

@repo/people:lint:biome:     139     │ - → → → → → → → → → className="text-phase-text-tertiary"␍
@repo/people:lint:biome:     140     │ - → → → → → → → → />␍
@repo/people:lint:biome:     141     │ - → → → → → → → </SelectIcon>␍
@repo/people:lint:biome:     142     │ - → → → → → → </SelectTrigger>␍
@repo/people:lint:biome:     143     │ - → → → → → → <SelectPortal>␍
@repo/people:lint:biome:     144     │ - → → → → → → → <SelectBackdrop·/>␍
@repo/people:lint:biome:     145     │ - → → → → → → → <SelectContent·className="bg-phase-canvas·border-t·border-phase-surface·p-4·rounded-t-[32px]">␍
@repo/people:lint:biome:     146     │ - → → → → → → → → {CATEGORIES.map((cat)·=>·(␍
@repo/people:lint:biome:     147     │ - → → → → → → → → → <SelectItem␍
@repo/people:lint:biome:     148     │ - → → → → → → → → → → key={cat.value}␍
@repo/people:lint:biome:     149     │ - → → → → → → → → → → label={cat.label}␍
@repo/people:lint:biome:     150     │ - → → → → → → → → → → value={cat.value}␍
@repo/people:lint:biome:   265 more lines truncated

@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\components\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: src\utils\helpers.ts:328:56 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/people:lint:biome:     1   │ - export·{·default·as·StaffPresencePulse·}·from·"./StaffPresencePulse";␍
@repo/people:lint:biome:     2   │ - export·{·default·as·TeacherAdminPortalModal·}·from·"./TeacherAdminPortalModal";␍
@repo/people:lint:biome:     3   │ - export·{·default·as·TeacherAdminWidget·}·from·"./TeacherAdminWidget";␍
@repo/people:lint:biome:     4   │ - export·{·default·as·TeacherEchoHistoryModal·}·from·"./TeacherEchoHistoryModal";␍

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     326 │  * Debounce function (wait for pause in calls)

apps-edlove-web:lint:biome:     327 │  */

apps-edlove-web:lint:biome:   > 328 │ export function debounce<T extends (...args: any[]) => any>(

apps-edlove-web:lint:biome:         │                                                        ^^^

apps-edlove-web:lint:biome:     329 │ 	func: T,

apps-edlove-web:lint:biome:     330 │ 	delay: number,
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\utils\helpers.ts:343:46 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     341 │  * Throttle function (limit calls per time period)

apps-edlove-web:lint:biome:     342 │  */
apps-edlove-web:lint:biome:   > 343 │ export function throttle<T extends (...args: any[]) => any>(

apps-edlove-web:lint:biome:         │                                              ^^^
apps-edlove-web:lint:biome:     344 │ 	func: T,
apps-edlove-web:lint:biome:     345 │ 	limit: number,
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\utils\helpers.ts:343:56 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:     341 │  * Throttle function (limit calls per time period)

apps-edlove-web:lint:biome:     342 │  */

apps-edlove-web:lint:biome:   > 343 │ export function throttle<T extends (...args: any[]) => any>(

apps-edlove-web:lint:biome:         │                                                        ^^^

apps-edlove-web:lint:biome:     344 │ 	func: T,

apps-edlove-web:lint:biome:     345 │ 	limit: number,
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.

apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: astro.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      1    │ - //·@ts-check␍

apps-edlove-web:lint:biome:      2    │ - ␍

apps-edlove-web:lint:biome:      3    │ - import·sitemap·from·"@astrojs/sitemap";␍

apps-edlove-web:lint:biome:      4    │ - import·svelte·from·"@astrojs/svelte";␍

apps-edlove-web:lint:biome:      5    │ - ␍

apps-edlove-web:lint:biome:      6    │ - import·tailwindcss·from·"@tailwindcss/vite";␍

apps-edlove-web:lint:biome:      7    │ - import·{·defineConfig·}·from·"astro/config";␍

apps-edlove-web:lint:biome:      8    │ - ␍

apps-edlove-web:lint:biome:      9    │ - //·https://astro.build/config␍

apps-edlove-web:lint:biome:     10    │ - export·default·defineConfig({␍

apps-edlove-web:lint:biome:     11    │ - → site:·"https://edlove.org",␍

apps-edlove-web:lint:biome:     12    │ - ␍

apps-edlove-web:lint:biome:     13    │ - → vite:·{␍

apps-edlove-web:lint:biome:     14    │ - → → plugins:·[/**·@type·{any}·*/·(tailwindcss())],␍

apps-edlove-web:lint:biome:     15    │ - → },␍

apps-edlove-web:lint:biome:     16    │ - ␍

apps-edlove-web:lint:biome:     17    │ - → integrations:·[svelte(),·sitemap()],␍

apps-edlove-web:lint:biome:     18    │ - ␍

apps-edlove-web:lint:biome:     19    │ - → i18n:·{␍

apps-edlove-web:lint:biome:     20    │ - → → defaultLocale:·"en",␍

apps-edlove-web:lint:biome:     21    │ - → → locales:·["en",·"si",·"ta"],␍

apps-edlove-web:lint:biome:     22    │ - → → routing:·{␍

apps-edlove-web:lint:biome:     23    │ - → → → prefixDefaultLocale:·false,␍

apps-edlove-web:lint:biome:     24    │ - → → },␍

apps-edlove-web:lint:biome:     25    │ - → },␍
apps-edlove-web:lint:biome:     26    │ - });␍

apps-edlove-web:lint:biome:         1 │ + //·@ts-check

apps-edlove-web:lint:biome:         2 │ + 

apps-edlove-web:lint:biome:         3 │ + import·sitemap·from·'@astrojs/sitemap';

apps-edlove-web:lint:biome:         4 │ + import·svelte·from·'@astrojs/svelte';

apps-edlove-web:lint:biome:         5 │ + 

apps-edlove-web:lint:biome:         6 │ + import·tailwindcss·from·'@tailwindcss/vite';

apps-edlove-web:lint:biome:         7 │ + import·{·defineConfig·}·from·'astro/config';

apps-edlove-web:lint:biome:         8 │ + 

apps-edlove-web:lint:biome:         9 │ + //·https://astro.build/config

apps-edlove-web:lint:biome:        10 │ + export·default·defineConfig({

apps-edlove-web:lint:biome:        11 │ + ··site:·'https://edlove.org',

apps-edlove-web:lint:biome:        12 │ + 
apps-edlove-web:lint:biome:        13 │ + ··vite:·{

apps-edlove-web:lint:biome:        14 │ + ····plugins:·[/**·@type·{any}·*/·(tailwindcss())],

apps-edlove-web:lint:biome:        15 │ + ··},

apps-edlove-web:lint:biome:        16 │ + 

apps-edlove-web:lint:biome:        17 │ + ··integrations:·[svelte(),·sitemap()],

apps-edlove-web:lint:biome:        18 │ + 

apps-edlove-web:lint:biome:        19 │ + ··i18n:·{

apps-edlove-web:lint:biome:        20 │ + ····defaultLocale:·'en',

apps-edlove-web:lint:biome:        21 │ + ····locales:·['en',·'si',·'ta'],

apps-edlove-web:lint:biome:        22 │ + ····routing:·{

apps-edlove-web:lint:biome:        23 │ + ······prefixDefaultLocale:·false,

apps-edlove-web:lint:biome:        24 │ + ····},

apps-edlove-web:lint:biome:        25 │ + ··},

apps-edlove-web:lint:biome:        26 │ + });

apps-edlove-web:lint:biome:     27 27 │   

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\components\CinematicBackground.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      1  1 │   ---␍

apps-edlove-web:lint:biome:      2    │ - interface·Props·{␍

apps-edlove-web:lint:biome:      3    │ - → showVideo?:·boolean;␍

apps-edlove-web:lint:biome:      4    │ - }␍

apps-edlove-web:lint:biome:      5    │ - ␍

apps-edlove-web:lint:biome:      6    │ - const·{·showVideo·=·false·}·=·Astro.props;␍
apps-edlove-web:lint:biome:         2 │ + interface·Props·{
apps-edlove-web:lint:biome:         3 │ + ··showVideo?:·boolean;
apps-edlove-web:lint:biome:         4 │ + }
apps-edlove-web:lint:biome:         5 │ + 
apps-edlove-web:lint:biome:         6 │ + const·{·showVideo·=·false·}·=·Astro.props;
apps-edlove-web:lint:biome:      7  7 │   ---␍
apps-edlove-web:lint:biome:      8  8 │   ␍
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: src\components\ExpandableContent.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome:      1  1 │   ---␍

apps-edlove-web:lint:biome:      2    │ - interface·Props·{␍

apps-edlove-web:lint:biome:      3    │ - → title:·string;␍

apps-edlove-web:lint:biome:      4    │ - → subtitle?:·string;␍
apps-edlove-web:lint:biome:      5    │ - → icon?:·string;␍
apps-edlove-web:lint:biome:      6    │ - → mode?:·"panel"·|·"modal";␍

apps-edlove-web:lint:biome:      7    │ - }␍

apps-edlove-web:lint:biome:      8    │ - ␍

apps-edlove-web:lint:biome:      9    │ - const·{·title,·subtitle,·icon,·mode·=·"panel"·}·=·Astro.props;␍

apps-edlove-web:lint:biome:         2 │ + interface·Props·{

apps-edlove-web:lint:biome:         3 │ + ··title:·string;

apps-edlove-web:lint:biome:         4 │ + ··subtitle?:·string;

apps-edlove-web:lint:biome:         5 │ + ··icon?:·string;

apps-edlove-web:lint:biome:         6 │ + ··mode?:·'panel'·|·'modal';

apps-edlove-web:lint:biome:         7 │ + }

apps-edlove-web:lint:biome:         8 │ + 

apps-edlove-web:lint:biome:         9 │ + const·{·title,·subtitle,·icon,·mode·=·'panel'·}·=·Astro.props;

apps-edlove-web:lint:biome:     10 10 │   ---␍

apps-edlove-web:lint:biome:     11 11 │   ␍
apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: src\utils\helpers.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   

@repo/workforce:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/workforce:lint:biome: 
@repo/workforce:lint:biome:   × Some errors were emitted while running checks.
@repo/workforce:lint:biome:   
@repo/workforce:lint:biome: 

@repo/accounting:lint:biome:        24 │ + ····const·{·data:·tx,·error:·txError·}·=·await·supabase

@repo/library:lint:biome: src\api\database.web.ts:134:40 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     133 │ 	// Shim for compatibility with sync logic that uses SQLite methods
@repo/library:lint:biome:   > 134 │ 	async runAsync(query: string, params: any[]) {

@repo/library:lint:biome:         │ 	                                      ^^^
@repo/library:lint:biome:     135 │ 		if (!this.db) await this.init();
@repo/library:lint:biome:     136 │ 		if (!this.db) return;
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\database.web.ts:161:48 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     159 │ 	},
@repo/library:lint:biome:     160 │ 
@repo/library:lint:biome:   > 161 │ 	async getFirstAsync<T>(query: string, params: any[]): Promise<T | null> {
@repo/library:lint:biome:         │ 	                                              ^^^
@repo/library:lint:biome:     162 │ 		if (!this.db) await this.init();
@repo/library:lint:biome:     163 │ 		if (!this.db) return null;
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\library.ts:187:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     185 │ 			throw new APIError("Failed to fetch resources", error.code, error);
@repo/library:lint:biome:     186 │ 		}
@repo/library:lint:biome:   > 187 │ 		return (data || []).map((resource: any) => ({
@repo/library:lint:biome:         │ 		                                   ^^^
@repo/library:lint:biome:     188 │ 			...resource,
@repo/library:lint:biome:     189 │ 			creator_name:
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\CollectionPickerModal.tsx:54:27 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.

@repo/library:lint:biome:   
@repo/library:lint:biome:     52 │ 				<FlatList
@repo/library:lint:biome:     53 │ 					data={collections}
@repo/library:lint:biome:   > 54 │ 					keyExtractor={(item: any) => item.id}
@repo/library:lint:biome:        │ 					                     ^^^
@repo/library:lint:biome:     55 │ 					renderItem={({ item }: { item: any }) => (
@repo/library:lint:biome:     56 │ 						<Pressable
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\CollectionPickerModal.tsx:55:37 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   

@repo/library:lint:biome:     53 │ 					data={collections}
@repo/library:lint:biome:     54 │ 					keyExtractor={(item: any) => item.id}
@repo/library:lint:biome:   > 55 │ 					renderItem={({ item }: { item: any }) => (
@repo/library:lint:biome:        │ 					                               ^^^
@repo/library:lint:biome:     56 │ 						<Pressable
@repo/library:lint:biome:     57 │ 							className="flex-row items-center p-5 border-b border-phase-border active:opacity-70"
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\LibraryThumbnailCard.tsx:168:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     166 │ 		const thumbnailUrl = resource

@repo/library:lint:biome:     167 │ 			? resource.media?.url ||
@repo/library:lint:biome:   > 168 │ 				(resource as any).thumbnail_url ||
@repo/library:lint:biome:         │ 				             ^^^
@repo/library:lint:biome:     169 │ 				(resource.type === "video" || resource.type === "movie_trailer"
@repo/library:lint:biome:     170 │ 					? getYoutubeThumbnail(resource.url)
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   

@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\LibraryThumbnailCard.tsx:187:12 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     186 │ 		const handleBookmarkToggle = React.useCallback(
@repo/library:lint:biome:   > 187 │ 			(event: any) => {

@repo/library:lint:biome:         │ 			        ^^^
@repo/library:lint:biome:     188 │ 				if (coreRuntime.device.getMetadata().platform === "web")
@repo/library:lint:biome:     189 │ 					event.stopPropagation();
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 

@repo/library:lint:biome: eslint.config.mjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   
@repo/library:lint:biome:     1   │ - import·{·config·}·from·"@repo/eslint-config/react-internal";␍
@repo/library:lint:biome:     2   │ - ␍

@repo/library:lint:biome:     3   │ - /**·@type·{import("eslint").Linter.Config[]}·*/␍
@repo/library:lint:biome:     4   │ - export·default·[...config];␍
@repo/library:lint:biome:       1 │ + import·{·config·}·from·'@repo/eslint-config/react-internal';
@repo/library:lint:biome:       2 │ + 
@repo/library:lint:biome:       3 │ + /**·@type·{import("eslint").Linter.Config[]}·*/
@repo/library:lint:biome:       4 │ + export·default·[...config];
@repo/library:lint:biome:     5 5 │   
@repo/library:lint:biome:   

@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\database.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   

@repo/graphics:lint:biome:         4 │ + ·*/
@repo/graphics:lint:biome:         5 │ + export·interface·Point·{
@repo/graphics:lint:biome:         6 │ + ··lat:·number;
@repo/graphics:lint:biome:         7 │ + ··lng:·number;
@repo/graphics:lint:biome:         8 │ + }
@repo/graphics:lint:biome:         9 │ + 
@repo/graphics:lint:biome:        10 │ + export·const·CatchmentAnalysis·=·{
@repo/graphics:lint:biome:        11 │ + ··/**
@repo/graphics:lint:biome:        12 │ + ···*·Haversine·formula·to·calculate·distance·between·two·points·on·Earth.

@repo/graphics:lint:biome:        13 │ + ···*/
@repo/graphics:lint:biome:        14 │ + ··getDistanceKm:·(p1:·Point,·p2:·Point):·number·=>·{
@repo/graphics:lint:biome:        15 │ + ····const·R·=·6371;·//·Earth's·radius·in·km
@repo/graphics:lint:biome:        16 │ + ····const·dLat·=·((p2.lat·-·p1.lat)·*·Math.PI)·/·180;
@repo/graphics:lint:biome:        17 │ + ····const·dLng·=·((p2.lng·-·p1.lng)·*·Math.PI)·/·180;
@repo/graphics:lint:biome:        18 │ + ····const·a·=
@repo/graphics:lint:biome:        19 │ + ······Math.sin(dLat·/·2)·*·Math.sin(dLat·/·2)·+
@repo/graphics:lint:biome:        20 │ + ······Math.cos((p1.lat·*·Math.PI)·/·180)·*
@repo/graphics:lint:biome:        21 │ + ········Math.cos((p2.lat·*·Math.PI)·/·180)·*
@repo/graphics:lint:biome:        22 │ + ········Math.sin(dLng·/·2)·*
@repo/graphics:lint:biome:        23 │ + ········Math.sin(dLng·/·2);
@repo/graphics:lint:biome:        24 │ + ····const·c·=·2·*·Math.atan2(Math.sqrt(a),·Math.sqrt(1·-·a));

@repo/graphics:lint:biome:        25 │ + ····return·R·*·c;
@repo/graphics:lint:biome:        26 │ + ··},
@repo/graphics:lint:biome:        27 │ + 
@repo/graphics:lint:biome:        28 │ + ··/**

@repo/graphics:lint:biome:        29 │ + ···*·Checks·if·a·point·is·within·a·circular·catchment·zone.
@repo/graphics:lint:biome:        30 │ + ···*/
@repo/graphics:lint:biome:        31 │ + ··isWithinCatchment:·(point:·Point,·center:·Point,·radiusKm:·number):·boolean·=>·{
@repo/graphics:lint:biome:        32 │ + ····return·CatchmentAnalysis.getDistanceKm(point,·center)·<=·radiusKm;
@repo/graphics:lint:biome:        33 │ + ··},
@repo/graphics:lint:biome:        34 │ + 

@repo/graphics:lint:biome:        35 │ + ··/**
@repo/graphics:lint:biome:        36 │ + ···*·Filter·a·list·of·locations·based·on·a·search·center·and·radius.
@repo/graphics:lint:biome:        37 │ + ···*/
@repo/graphics:lint:biome:        38 │ + ··findNearby:·<T·extends·Point>(locations:·T[],·center:·Point,·radiusKm:·number):·T[]·=>·{
@repo/graphics:lint:biome:        39 │ + ····return·locations.filter((loc)·=>·CatchmentAnalysis.isWithinCatchment(loc,·center,·radiusKm));
@repo/graphics:lint:biome:        40 │ + ··},
@repo/graphics:lint:biome:        41 │ + 
@repo/graphics:lint:biome:        42 │ + ··/**
@repo/graphics:lint:biome:        43 │ + ···*·Official·Sri·Lankan·Admission·Distance·Rules
@repo/graphics:lint:biome:        44 │ + ···*/
@repo/graphics:lint:biome:        45 │ + ··ADMISSION_RULES:·{
@repo/graphics:lint:biome:        46 │ + ····PRIMARY_ZONE_KM:·2.0,·//·Proximate·/·standard·catchment
@repo/graphics:lint:biome:        47 │ + ····SECONDARY_ZONE_KM:·5.0,·//·Extended·catchment·for·specific·school·types
@repo/graphics:lint:biome:        48 │ + ····PERMISSIBLE_MARGIN_KM:·0.1,·//·Tolerance·for·GPS·inaccuracies
@repo/graphics:lint:biome:        49 │ + ··},
@repo/graphics:lint:biome:        50 │ + };
@repo/graphics:lint:biome:     61 51 │   
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\algorithms\GeoThematicEngine.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      1    │ - /**␍
@repo/graphics:lint:biome:      2    │ - ·*·GeoThematicEngine:·"Soul"·contribution·for·Gurudevi.␍
@repo/graphics:lint:biome:      3    │ - ·*·Provides·logic·for·Thematic·Coloring·(Choropleths)·and·Spatial·Insight.␍
@repo/graphics:lint:biome:      4    │ - ·*/␍
@repo/graphics:lint:biome:      5    │ - export·type·ColorPalette·=␍
@repo/graphics:lint:biome:      6    │ - → |·"saffron"␍
@repo/graphics:lint:biome:      7    │ - → |·"emerald"␍
@repo/graphics:lint:biome:      8    │ - → |·"ocean"␍
@repo/graphics:lint:biome:      9    │ - → |·"fire"␍
@repo/graphics:lint:biome:     10    │ - → |·"socioeconomic"␍
@repo/graphics:lint:biome:     11    │ - → |·"viability";␍
@repo/graphics:lint:biome:     12    │ - ␍

@repo/graphics:lint:biome:     13    │ - const·PALETTES:·Record<ColorPalette,·[string,·string]>·=·{␍
@repo/graphics:lint:biome:     14    │ - → saffron:·["#FFFBEB",·"#F59E0B"],␍
@repo/graphics:lint:biome:     15    │ - → emerald:·["#ECFDF5",·"#10B981"],␍
@repo/graphics:lint:biome:     16    │ - → ocean:·["#F0F9FF",·"#0EA5E9"],␍
@repo/graphics:lint:biome:     17    │ - → fire:·["#FEF2F2",·"#EF4444"],␍
@repo/graphics:lint:biome:     18    │ - → socioeconomic:·["#F5F3FF",·"#7C3AED"],·//·Purple·scale␍
@repo/graphics:lint:biome:     19    │ - → viability:·["#FFF7ED",·"#EA580C"],·//·Orange/Terra·scale␍
@repo/graphics:lint:biome:     20    │ - };␍
@repo/graphics:lint:biome:     21    │ - ␍
@repo/graphics:lint:biome:     22    │ - export·const·GeoThematicEngine·=·{␍
@repo/graphics:lint:biome:     23    │ - → /**␍
@repo/graphics:lint:biome:     24    │ - → ·*·Generates·a·color·based·on·a·value's·position·between·min·and·max.␍
@repo/graphics:lint:biome:     25    │ - → ·*·Perfect·for·student·population·or·school·performance·heatmaps.␍
@repo/graphics:lint:biome:     26    │ - → ·*/␍
@repo/graphics:lint:biome:     27    │ - → getColorForValue:·(␍
@repo/graphics:lint:biome:     28    │ - → → value:·number,␍

@repo/graphics:lint:biome:     29    │ - → → min:·number,␍
@repo/graphics:lint:biome:     30    │ - → → max:·number,␍
@repo/graphics:lint:biome:     31    │ - → → palette:·ColorPalette·=·"saffron",␍
@repo/graphics:lint:biome:     32    │ - → ):·string·=>·{␍
@repo/graphics:lint:biome:     33    │ - → → const·[low,·high]·=·PALETTES[palette];␍
@repo/graphics:lint:biome:     34    │ - → → const·ratio·=·(value·-·min)·/·(max·-·min·||·1);␍
@repo/graphics:lint:biome:     35    │ - → → const·clampedRatio·=·Math.max(0,·Math.min(1,·ratio));␍
@repo/graphics:lint:biome:     36    │ - ␍
@repo/graphics:lint:biome:     37    │ - → → //·Simple·hex·interpolation·(simplified·for·demonstration)␍
@repo/graphics:lint:biome:     38    │ - → → return·clampedRatio·>·0.5·?·high·:·low;␍
@repo/graphics:lint:biome:     39    │ - → },␍
@repo/graphics:lint:biome:     40    │ - ␍
@repo/graphics:lint:biome:     41    │ - → /**␍

@repo/graphics:lint:biome:     42    │ - → ·*·Map·a·dataset·of·{·districtId:·value·}·to·a·Record<districtId,·color·····*/␍
@repo/graphics:lint:biome:     43    │ - → generateChoropleth:·(␍
@repo/graphics:lint:biome:     44    │ - → → data:·Record<string,·number>,␍
@repo/graphics:lint:biome:     45    │ - → → palette:·ColorPalette·=·"saffron",␍
@repo/graphics:lint:biome:     46    │ - → ):·Record<string,·string>·=>·{␍
@repo/graphics:lint:biome:     47    │ - → → const·values·=·Object.values(data);␍
@repo/graphics:lint:biome:     48    │ - → → const·min·=·Math.min(...values);␍
@repo/graphics:lint:biome:     49    │ - → → const·max·=·Math.max(...values);␍
@repo/graphics:lint:biome:     50    │ - ␍
@repo/graphics:lint:biome:     51    │ - → → const·colors:·Record<string,·string>·=·{};␍
@repo/graphics:lint:biome:     52    │ - → → for·(const·[id,·val]·of·Object.entries(data))·{␍

@repo/graphics:lint:biome:     53    │ - → → → colors[id]·=·GeoThematicEngine.getColorForValue(val,·min,·max,·palette);␍
@repo/graphics:lint:biome:     54    │ - → → }␍
@repo/graphics:lint:biome:     55    │ - → → return·colors;␍
@repo/graphics:lint:biome:     56    │ - → },␍
@repo/graphics:lint:biome:     57    │ - };␍
@repo/graphics:lint:biome:         1 │ + /**

@repo/graphics:lint:biome:         2 │ + ·*·GeoThematicEngine:·"Soul"·contribution·for·Gurudevi.
@repo/graphics:lint:biome:         3 │ + ·*·Provides·logic·for·Thematic·Coloring·(Choropleths)·and·Spatial·Insight.
@repo/graphics:lint:biome:         4 │ + ·*/
@repo/graphics:lint:biome:         5 │ + export·type·ColorPalette·=·'saffron'·|·'emerald'·|·'ocean'·|·'fire'·|·'socioeconomic'·|·'viability';
@repo/graphics:lint:biome:         6 │ + 
@repo/graphics:lint:biome:         7 │ + const·PALETTES:·Record<ColorPalette,·[string,·string]>·=·{

@repo/graphics:lint:biome:         8 │ + ··saffron:·['#FFFBEB',·'#F59E0B'],
@repo/graphics:lint:biome:         9 │ + ··emerald:·['#ECFDF5',·'#10B981'],
@repo/graphics:lint:biome:        10 │ + ··ocean:·['#F0F9FF',·'#0EA5E9'],
@repo/graphics:lint:biome:        11 │ + ··fire:·['#FEF2F2',·'#EF4444'],
@repo/graphics:lint:biome:        12 │ + ··socioeconomic:·['#F5F3FF',·'#7C3AED'],·//·Purple·scale

@repo/graphics:lint:biome:        13 │ + ··viability:·['#FFF7ED',·'#EA580C'],·//·Orange/Terra·scale
@repo/graphics:lint:biome:        14 │ + };
@repo/graphics:lint:biome:        15 │ + 
@repo/graphics:lint:biome:        16 │ + export·const·GeoThematicEngine·=·{

@repo/graphics:lint:biome:        17 │ + ··/**
@repo/graphics:lint:biome:        18 │ + ···*·Generates·a·color·based·on·a·value's·position·between·min·and·max.
@repo/graphics:lint:biome:        19 │ + ···*·Perfect·for·student·population·or·school·performance·heatmaps.
@repo/graphics:lint:biome:        20 │ + ···*/
@repo/graphics:lint:biome:        21 │ + ··getColorForValue:·(

@repo/graphics:lint:biome:        22 │ + ····value:·number,
@repo/graphics:lint:biome:        23 │ + ····min:·number,
@repo/graphics:lint:biome:        24 │ + ····max:·number,
@repo/graphics:lint:biome:        25 │ + ····palette:·ColorPalette·=·'saffron',
@repo/graphics:lint:biome:        26 │ + ··):·string·=>·{
@repo/graphics:lint:biome:        27 │ + ····const·[low,·high]·=·PALETTES[palette];

@repo/graphics:lint:biome:        28 │ + ····const·ratio·=·(value·-·min)·/·(max·-·min·||·1);
@repo/graphics:lint:biome:        29 │ + ····const·clampedRatio·=·Math.max(0,·Math.min(1,·ratio));
@repo/graphics:lint:biome:        30 │ + 
@repo/graphics:lint:biome:        31 │ + ····//·Simple·hex·interpolation·(simplified·for·demonstration)
@repo/graphics:lint:biome:        32 │ + ····return·clampedRatio·>·0.5·?·high·:·low;
@repo/graphics:lint:biome:        33 │ + ··},
@repo/graphics:lint:biome:        34 │ + 

@repo/graphics:lint:biome:        35 │ + ··/**
@repo/graphics:lint:biome:        36 │ + ···*·Map·a·dataset·of·{·districtId:·value·}·to·a·Record<districtId,·color·····*/
@repo/graphics:lint:biome:        37 │ + ··generateChoropleth:·(
@repo/graphics:lint:biome:        38 │ + ····data:·Record<string,·number>,
@repo/graphics:lint:biome:        39 │ + ····palette:·ColorPalette·=·'saffron',
@repo/graphics:lint:biome:        40 │ + ··):·Record<string,·string>·=>·{
@repo/graphics:lint:biome:        41 │ + ····const·values·=·Object.values(data);
@repo/graphics:lint:biome:        42 │ + ····const·min·=·Math.min(...values);

@repo/graphics:lint:biome:        43 │ + ····const·max·=·Math.max(...values);
@repo/graphics:lint:biome:        44 │ + 
@repo/graphics:lint:biome:        45 │ + ····const·colors:·Record<string,·string>·=·{};
@repo/graphics:lint:biome:        46 │ + ····for·(const·[id,·val]·of·Object.entries(data))·{
@repo/graphics:lint:biome:        47 │ + ······colors[id]·=·GeoThematicEngine.getColorForValue(val,·min,·max,·palette);
@repo/graphics:lint:biome:        48 │ + ····}
@repo/graphics:lint:biome:        49 │ + ····return·colors;

@repo/graphics:lint:biome:        50 │ + ··},
@repo/graphics:lint:biome:        51 │ + };
@repo/graphics:lint:biome:     58 52 │   
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\algorithms\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:

@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     1   │ - export·*·from·"./CaptureEngine";␍
@repo/graphics:lint:biome:     2   │ - export·*·from·"./CatchmentAnalysis";␍
@repo/graphics:lint:biome:     3   │ - export·*·from·"./GeoThematicEngine";␍
@repo/graphics:lint:biome:     4   │ - export·*·from·"./KnowledgeParser";␍
@repo/graphics:lint:biome:     5   │ - export·{·getAvailablePerspectives·}·from·"./perspective";␍

@repo/graphics:lint:biome:       1 │ + export·*·from·'./CaptureEngine';
@repo/graphics:lint:biome:       2 │ + export·*·from·'./CatchmentAnalysis';

apps-edlove-web:lint:biome:       1     │ - /**␍

apps-edlove-web:lint:biome:       2     │ - ·*·EDLOVE·UTILITY·FUNCTIONS␍

apps-edlove-web:lint:biome:       3     │ - ·*␍

apps-edlove-web:lint:biome:       4     │ - ·*·Reusable·helper·functions·for·common·tasks␍

apps-edlove-web:lint:biome:       5     │ - ·*/␍

apps-edlove-web:lint:biome:       6     │ - ␍

@repo/graphics:lint:biome:       3 │ + export·*·from·'./GeoThematicEngine';
@repo/graphics:lint:biome:       4 │ + export·*·from·'./KnowledgeParser';
@repo/graphics:lint:biome:       5 │ + export·{·getAvailablePerspectives·}·from·'./perspective';

@repo/graphics:lint:biome:     6 6 │   
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\algorithms\perspective.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      1    │ - import·type·{␍
@repo/graphics:lint:biome:      2    │ - → GraphNode,␍
@repo/graphics:lint:biome:      3    │ - → KnowledgeTopology,␍
@repo/graphics:lint:biome:      4    │ - → PerspectiveId,␍
@repo/graphics:lint:biome:      5    │ - }·from·"@repo/core/types";␍
@repo/graphics:lint:biome:      6    │ - ␍
@repo/graphics:lint:biome:      7    │ - /**␍
@repo/graphics:lint:biome:      8    │ - ·*·getAvailablePerspectives··Data-driven·perspective·enablement.␍
@repo/graphics:lint:biome:      9    │ - ·*␍
@repo/graphics:lint:biome:     10    │ - ·*·Instead·of·hardcoding·which·tabs·are·enabled,·this·function␍
@repo/graphics:lint:biome:     11    │ - ·*·inspects·the·topology·and·returns·which·perspectives·make·sense.␍
@repo/graphics:lint:biome:     12    │ - ·*␍

@repo/graphics:lint:biome:     13    │ - ·*·This·is·the·"intelligence"·layer·that·lets·the·UI·auto-configure.␍
@repo/graphics:lint:biome:     14    │ - ·*/␍
@repo/graphics:lint:biome:     15    │ - export·function·getAvailablePerspectives(␍
@repo/graphics:lint:biome:     16    │ - → topology:·KnowledgeTopology,␍
@repo/graphics:lint:biome:     17    │ - ):·PerspectiveId[]·{␍
@repo/graphics:lint:biome:     18    │ - → //·If·the·API·explicitly·declares·supported·perspectives,·respect·it␍
@repo/graphics:lint:biome:     19    │ - → if·(␍
@repo/graphics:lint:biome:     20    │ - → → topology.supportedPerspectives·&&␍
@repo/graphics:lint:biome:     21    │ - → → topology.supportedPerspectives.length·>·0␍
@repo/graphics:lint:biome:     22    │ - → )·{␍
@repo/graphics:lint:biome:     23    │ - → → return·topology.supportedPerspectives;␍
@repo/graphics:lint:biome:     24    │ - → }␍

@repo/graphics:lint:biome:     25    │ - ␍
@repo/graphics:lint:biome:     26    │ - → const·available:·PerspectiveId[]·=·[];␍
@repo/graphics:lint:biome:     27    │ - ␍
@repo/graphics:lint:biome:     28    │ - → //·Astro·(Knowledge·Cosmos):·available·if·there·are·multiple·nodes·with·links␍
@repo/graphics:lint:biome:     29    │ - → if·(topology.nodes.length·>·1·&&·topology.links.length·>·0)·{␍
@repo/graphics:lint:biome:     30    │ - → → available.push("astro");␍
@repo/graphics:lint:biome:     31    │ - → }␍
@repo/graphics:lint:biome:     32    │ - ␍
@repo/graphics:lint:biome:     33    │ - → //·Terra·(Geo·Map):·available·if·at·least·20%·of·nodes·have·geo·data␍
@repo/graphics:lint:biome:     34    │ - → const·geoNodeCount·=·topology.nodes.filter((n:·GraphNode)·=>·n.geo).length;␍

@repo/graphics:lint:biome:     35    │ - → if·(geoNodeCount·>·0·&&·geoNodeCount·/·topology.nodes.length·>=·0.2)·{␍
@repo/graphics:lint:biome:     36    │ - → → available.push("terra");␍
@repo/graphics:lint:biome:     37    │ - → }␍
@repo/graphics:lint:biome:     38    │ - ␍
@repo/graphics:lint:biome:     39    │ - → //·Dharma·(Learning·Path):·available·if·nodes·have·`path.order`·fields␍
@repo/graphics:lint:biome:     40    │ - → const·pathNodeCount·=·topology.nodes.filter(␍
@repo/graphics:lint:biome:     41    │ - → → (n:·GraphNode)·=>·n.path?.order·!==·undefined,␍
@repo/graphics:lint:biome:     42    │ - → ).length;␍
@repo/graphics:lint:biome:     43    │ - → if·(pathNodeCount·>=·3)·{␍
@repo/graphics:lint:biome:     44    │ - → → available.push("dharma");␍
@repo/graphics:lint:biome:     45    │ - → }␍
@repo/graphics:lint:biome:     46    │ - ␍

@repo/graphics:lint:biome:     47    │ - → //·Vastu·(Mind·Map·/·Structure):·available·if·nodes·have·`parentId`·relationships␍
@repo/graphics:lint:biome:     48    │ - → const·treeNodeCount·=·topology.nodes.filter(␍
@repo/graphics:lint:biome:     49    │ - → → (n:·GraphNode)·=>·n.parentId,␍
@repo/graphics:lint:biome:     50    │ - → ).length;␍
@repo/graphics:lint:biome:     51    │ - → if·(treeNodeCount·>=·2)·{␍
@repo/graphics:lint:biome:     52    │ - → → available.push("vastu");␍
@repo/graphics:lint:biome:     53    │ - → }␍
@repo/graphics:lint:biome:     54    │ - ␍
@repo/graphics:lint:biome:     55    │ - → //·Jyoti·(Analytics·/·Charts):·available·if·nodes·have·quantifiable·metadata␍
@repo/graphics:lint:biome:     56    │ - → const·chartableNodeCount·=·topology.nodes.filter(␍
@repo/graphics:lint:biome:     57    │ - → → (n:·GraphNode)·=>·n.metadata?.subjects·&&·n.metadata.subjects.length·>·0,␍

@repo/graphics:lint:biome:     58    │ - → ).length;␍
@repo/graphics:lint:biome:     59    │ - → if·(chartableNodeCount·>=·3)·{␍
@repo/graphics:lint:biome:     60    │ - → → available.push("jyoti");␍
@repo/graphics:lint:biome:     61    │ - → }␍
@repo/graphics:lint:biome:     62    │ - ␍
@repo/graphics:lint:biome:     63    │ - → //·Always·return·at·least·'astro'·if·we·have·any·nodes␍
@repo/graphics:lint:biome:     64    │ - → if·(available.length·===·0·&&·topology.nodes.length·>·0)·{␍
@repo/graphics:lint:biome:     65    │ - → → available.push("astro");␍
@repo/graphics:lint:biome:     66    │ - → }␍
@repo/graphics:lint:biome:     67    │ - ␍
@repo/graphics:lint:biome:     68    │ - → return·available;␍

@repo/graphics:lint:biome:     69    │ - }␍
@repo/graphics:lint:biome:         1 │ + import·type·{·GraphNode,·KnowledgeTopology,·PerspectiveId·}·from·'@repo/core/types';
@repo/graphics:lint:biome:         2 │ + 
@repo/graphics:lint:biome:         3 │ + /**
@repo/graphics:lint:biome:         4 │ + ·*·getAvailablePerspectives··Data-driven·perspective·enablement.
@repo/graphics:lint:biome:         5 │ + ·*
@repo/graphics:lint:biome:         6 │ + ·*·Instead·of·hardcoding·which·tabs·are·enabled,·this·function
@repo/graphics:lint:biome:         7 │ + ·*·inspects·the·topology·and·returns·which·perspectives·make·sense.

@repo/graphics:lint:biome:         8 │ + ·*
@repo/graphics:lint:biome:         9 │ + ·*·This·is·the·"intelligence"·layer·that·lets·the·UI·auto-configure.
@repo/graphics:lint:biome:        10 │ + ·*/
@repo/graphics:lint:biome:        11 │ + export·function·getAvailablePerspectives(topology:·KnowledgeTopology):·PerspectiveId[]·{
@repo/graphics:lint:biome:        12 │ + ··//·If·the·API·explicitly·declares·supported·perspectives,·respect·it
@repo/graphics:lint:biome:        13 │ + ··if·(topology.supportedPerspectives·&&·topology.supportedPerspectives.length·>·0)·{
@repo/graphics:lint:biome:        14 │ + ····return·topology.supportedPerspectives;

@repo/graphics:lint:biome:        15 │ + ··}
@repo/graphics:lint:biome:        16 │ + 
@repo/graphics:lint:biome:        17 │ + ··const·available:·PerspectiveId[]·=·[];
@repo/graphics:lint:biome:        18 │ + 
@repo/graphics:lint:biome:        19 │ + ··//·Astro·(Knowledge·Cosmos):·available·if·there·are·multiple·nodes·with·links
@repo/graphics:lint:biome:        20 │ + ··if·(topology.nodes.length·>·1·&&·topology.links.length·>·0)·{
@repo/graphics:lint:biome:        21 │ + ····available.push('astro');
@repo/graphics:lint:biome:        22 │ + ··}

@repo/graphics:lint:biome:        23 │ + 
@repo/graphics:lint:biome:        24 │ + ··//·Terra·(Geo·Map):·available·if·at·least·20%·of·nodes·have·geo·data
@repo/graphics:lint:biome:        25 │ + ··const·geoNodeCount·=·topology.nodes.filter((n:·GraphNode)·=>·n.geo).length;
@repo/graphics:lint:biome:        26 │ + ··if·(geoNodeCount·>·0·&&·geoNodeCount·/·topology.nodes.length·>=·0.2)·{
@repo/graphics:lint:biome:        27 │ + ····available.push('terra');
@repo/graphics:lint:biome:        28 │ + ··}
@repo/graphics:lint:biome:        29 │ + 
@repo/graphics:lint:biome:        30 │ + ··//·Dharma·(Learning·Path):·available·if·nodes·have·`path.order`·fields

@repo/graphics:lint:biome:        31 │ + ··const·pathNodeCount·=·topology.nodes.filter((n:·GraphNode)·=>·n.path?.order·!==·undefined).length;
@repo/graphics:lint:biome:        32 │ + ··if·(pathNodeCount·>=·3)·{
@repo/graphics:lint:biome:        33 │ + ····available.push('dharma');
@repo/graphics:lint:biome:        34 │ + ··}
@repo/graphics:lint:biome:        35 │ + 
@repo/graphics:lint:biome:        36 │ + ··//·Vastu·(Mind·Map·/·Structure):·available·if·nodes·have·`parentId`·relationships
@repo/graphics:lint:biome:        37 │ + ··const·treeNodeCount·=·topology.nodes.filter((n:·GraphNode)·=>·n.parentId).length;
@repo/graphics:lint:biome:        38 │ + ··if·(treeNodeCount·>=·2)·{
@repo/graphics:lint:biome:        39 │ + ····available.push('vastu');

@repo/graphics:lint:biome:        40 │ + ··}
@repo/graphics:lint:biome:        41 │ + 
@repo/graphics:lint:biome:        42 │ + ··//·Jyoti·(Analytics·/·Charts):·available·if·nodes·have·quantifiable·metadata
@repo/graphics:lint:biome:        43 │ + ··const·chartableNodeCount·=·topology.nodes.filter(
@repo/graphics:lint:biome:        44 │ + ····(n:·GraphNode)·=>·n.metadata?.subjects·&&·n.metadata.subjects.length·>·0,
@repo/graphics:lint:biome:        45 │ + ··).length;
@repo/graphics:lint:biome:        46 │ + ··if·(chartableNodeCount·>=·3)·{
@repo/graphics:lint:biome:        47 │ + ····available.push('jyoti');
@repo/graphics:lint:biome:        48 │ + ··}

@repo/graphics:lint:biome:        49 │ + 
@repo/graphics:lint:biome:        50 │ + ··//·Always·return·at·least·'astro'·if·we·have·any·nodes
@repo/graphics:lint:biome:        51 │ + ··if·(available.length·===·0·&&·topology.nodes.length·>·0)·{
@repo/graphics:lint:biome:        52 │ + ····available.push('astro');
@repo/graphics:lint:biome:        53 │ + ··}
@repo/graphics:lint:biome:        54 │ + 
@repo/graphics:lint:biome:        55 │ + ··return·available;
@repo/graphics:lint:biome:        56 │ + }

@repo/graphics:lint:biome:     70 57 │   
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\charts\AnalyticsCharts.tsx:33:17 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/graphics:lint:biome:   

@repo/graphics:lint:biome:     31 │ 			<View style={styles.chartContainer}>
@repo/graphics:lint:biome:     32 │ 				{data.map((item, index) => (
@repo/graphics:lint:biome:   > 33 │ 					<View key={index} style={styles.barContainer}>
@repo/graphics:lint:biome:        │ 					           ^^^^^
@repo/graphics:lint:biome:     34 │ 						<View
@repo/graphics:lint:biome:     35 │ 							style={[
@repo/graphics:lint:biome:   

@repo/graphics:lint:biome:   i This is the source of the key value.

@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     30 │ 			)}

@repo/graphics:lint:biome:     31 │ 			<View style={styles.chartContainer}>
@repo/graphics:lint:biome:   > 32 │ 				{data.map((item, index) => (
@repo/graphics:lint:biome:        │ 				                 ^^^^^

@repo/graphics:lint:biome:     33 │ 					<View key={index} style={styles.barContainer}>
@repo/graphics:lint:biome:     34 │ 						<View
@repo/graphics:lint:biome:   

@repo/graphics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i Check the React documentation. 
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\charts\AnalyticsCharts.tsx:103:18 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     102 │ 					return (
@repo/graphics:lint:biome:   > 103 │ 						<View key={index} style={StyleSheet.absoluteFill}>
@repo/graphics:lint:biome:         │ 						           ^^^^^
@repo/graphics:lint:biome:     104 │ 							{/* Line segment to previous point */}
@repo/graphics:lint:biome:     105 │ 							{index > 0 && data[index - 1] && (
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i This is the source of the key value.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      96 │ 				]}

@repo/graphics:lint:biome:      97 │ 			>
@repo/graphics:lint:biome:    > 98 │ 				{data.map((point, index) => {
@repo/graphics:lint:biome:         │ 				                  ^^^^^
@repo/graphics:lint:biome:      99 │ 					const y = chartHeight - ((point.y - minValue) / range) * chartHeight;
@repo/graphics:lint:biome:     100 │ 					const x = (index / (data.length - 1 || 1)) * chartWidth;
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i Check the React documentation. 
@repo/graphics:lint:biome:   

@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\charts\AnalyticsCharts.tsx:205:18 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     204 │ 					return (
@repo/graphics:lint:biome:   > 205 │ 						<View key={index} style={styles.pieSliceContainer}>
@repo/graphics:lint:biome:         │ 						           ^^^^^

@repo/graphics:lint:biome:     206 │ 							<View
@repo/graphics:lint:biome:     207 │ 								style={[
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i This is the source of the key value.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     195 │ 			)}
@repo/graphics:lint:biome:     196 │ 			<View style={[styles.pieContainer, { width: size, height: size - 40 }]}>
@repo/graphics:lint:biome:   > 197 │ 				{data.map((item, index) => {

@repo/graphics:lint:biome:         │ 				                 ^^^^^
@repo/graphics:lint:biome:     198 │ 					const percentage = (item.value / total) * 100;
@repo/graphics:lint:biome:     199 │ 					const startAngle =
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:   i Check the React documentation. 

@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 

@repo/people:lint:biome:     5   │ - export·{·default·as·TeacherFeedbackModal·}·from·"./TeacherFeedbackModal";␍

@repo/people:lint:biome:       1 │ + export·{·default·as·StaffPresencePulse·}·from·'./StaffPresencePulse';

@repo/people:lint:biome:       2 │ + export·{·default·as·TeacherAdminPortalModal·}·from·'./TeacherAdminPortalModal';

@repo/people:lint:biome:       3 │ + export·{·default·as·TeacherAdminWidget·}·from·'./TeacherAdminWidget';

@repo/people:lint:biome:       4 │ + export·{·default·as·TeacherEchoHistoryModal·}·from·'./TeacherEchoHistoryModal';

apps-edlove-web:lint:biome:       7     │ - //·============================================================================␍

apps-edlove-web:lint:biome:       8     │ - //·STRING·UTILITIES␍

apps-edlove-web:lint:biome:       9     │ - //·============================================================================␍

apps-edlove-web:lint:biome:      10     │ - ␍

apps-edlove-web:lint:biome:      11     │ - /**␍

apps-edlove-web:lint:biome:      12     │ - ·*·Convert·string·to·URL-friendly·slug␍

apps-edlove-web:lint:biome:      13     │ - ·*·Example:·"Maria·Montessori"·\u2192·"maria-montessori"␍

@repo/graphics:lint:biome: src\charts\AnalyticsCharts.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 

@repo/accounting:lint:biome:        25 │ + ······.schema('accounting')

@repo/accounting:lint:biome:        26 │ + ······.from('transactions')

@repo/accounting:lint:biome:        27 │ + ······.insert(transaction)

@repo/people:lint:biome:       5 │ + export·{·default·as·TeacherFeedbackModal·}·from·'./TeacherFeedbackModal';

@repo/people:lint:biome:     6 6 │   
@repo/people:lint:biome:   
@repo/people:lint:biome: 

@repo/people:lint:biome: src\directory.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts:3:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     1 │ import { type ReactNode } from "react";

@repo/analytics:lint:biome:     2 │ interface AnalyticsContextProps {

@repo/analytics:lint:biome:   > 3 │ 	track: (event: string, properties?: any) => void;

@repo/analytics:lint:biome:       │ 	                                    ^^^

@repo/analytics:lint:biome:     4 │ 	identify: (userId: string, properties?: any) => void;

@repo/analytics:lint:biome:     5 │ 	screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts:4:42 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     2 │ interface AnalyticsContextProps {

@repo/analytics:lint:biome:     3 │ 	track: (event: string, properties?: any) => void;

@repo/analytics:lint:biome:   > 4 │ 	identify: (userId: string, properties?: any) => void;

@repo/analytics:lint:biome:       │ 	                                        ^^^

@repo/analytics:lint:biome:     5 │ 	screen: (name: string, properties?: any) => void;

@repo/analytics:lint:biome:     6 │ 	reset: () => void;
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts:5:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     3 │ 	track: (event: string, properties?: any) => void;

@repo/analytics:lint:biome:     4 │ 	identify: (userId: string, properties?: any) => void;

@repo/analytics:lint:biome:   > 5 │ 	screen: (name: string, properties?: any) => void;

@repo/analytics:lint:biome:       │ 	                                    ^^^

@repo/analytics:lint:biome:     6 │ 	reset: () => void;

@repo/analytics:lint:biome:     7 │ }
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx:5:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     4 │ interface AnalyticsContextProps {

@repo/analytics:lint:biome:   > 5 │ 	track: (event: string, properties?: any) => void;

@repo/analytics:lint:biome:       │ 	                                    ^^^
@repo/analytics:lint:biome:     6 │ 	identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:     7 │ 	screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx:6:42 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     4 │ interface AnalyticsContextProps {
@repo/analytics:lint:biome:     5 │ 	track: (event: string, properties?: any) => void;
@repo/analytics:lint:biome:   > 6 │ 	identify: (userId: string, properties?: any) => void;
@repo/analytics:lint:biome:       │ 	                                        ^^^
@repo/analytics:lint:biome:     7 │ 	screen: (name: string, properties?: any) => void;
@repo/analytics:lint:biome:     8 │ 	reset: () => void;
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx:7:38 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   ! Unexpected any. Specify a different type.
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     5 │ 	track: (event: string, properties?: any) => void;

@repo/analytics:lint:biome:     6 │ 	identify: (userId: string, properties?: any) => void;

apps-edlove-web:lint:biome:      14     │ - ·*/␍

apps-edlove-web:lint:biome:      15     │ - export·function·slugify(text:·string):·string·{␍

@repo/accounting:lint:biome:        28 │ + ······.select()

@repo/accounting:lint:biome:        29 │ + ······.single();

@repo/accounting:lint:biome:        30 │ + 

@repo/library:lint:biome:       1     │ - import·*·as·SQLite·from·"expo-sqlite";␍

@repo/library:lint:biome:       2     │ - ␍

@repo/library:lint:biome:       3     │ - const·DB_NAME·=·"gurudevi_library.db";␍

@repo/library:lint:biome:       4     │ - ␍

@repo/people:lint:biome:   × Formatter would have printed the following content:

@repo/people:lint:biome:   

apps-edlove-web:lint:biome:      16     │ - → return·text␍

apps-edlove-web:lint:biome:      17     │ - → → .toLowerCase()␍

@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   

@repo/analytics:lint:biome:   > 7 │ 	screen: (name: string, properties?: any) => void;

apps-edlove-web:lint:biome:      18     │ - → → .trim()␍

apps-edlove-web:lint:biome:      19     │ - → → .replace(/[^\w\s-]/g,·"")·//·Remove·special·chars␍

apps-edlove-web:lint:biome:      20     │ - → → .replace(/[\s_-]+/g,·"-")·//·Replace·spaces·with·hyphens␍

apps-edlove-web:lint:biome:      21     │ - → → .replace(/^-+|-+$/g,·"");·//·Remove·leading/trailing·hyphens␍

apps-edlove-web:lint:biome:      22     │ - }␍

apps-edlove-web:lint:biome:      23     │ - ␍

apps-edlove-web:lint:biome:      24     │ - /**␍

apps-edlove-web:lint:biome:      25     │ - ·*·Truncate·text·to·specified·length·with·ellipsis␍

apps-edlove-web:lint:biome:      26     │ - ·*/␍

apps-edlove-web:lint:biome:      27     │ - export·function·truncate(text:·string,·maxLength:·number):·string·{␍

@repo/accounting:lint:biome:        31 │ + ····if·(txError)·throw·txError;

@repo/accounting:lint:biome:        32 │ + 

@repo/accounting:lint:biome:        33 │ + ····//·3.·Insert·Ledger·Entries

@repo/accounting:lint:biome:        34 │ + ····const·entriesWithTxId·=·entries.map((e)·=>·({

@repo/accounting:lint:biome:        35 │ + ······...e,

@repo/accounting:lint:biome:        36 │ + ······transaction_id:·tx.id,

@repo/people:lint:biome:       1     │ - import·{·supabase·}·from·"@repo/core/api";␍

@repo/people:lint:biome:       2     │ - import·type·{·SchoolRole,·User,·WorkRole·}·from·"@repo/core/types";␍

@repo/analytics:lint:biome:       │ 	                                    ^^^

apps-edlove-web:lint:biome:      28     │ - → if·(text.length·<=·maxLength)·return·text;␍

apps-edlove-web:lint:biome:      29     │ - → return·`${text.slice(0,·maxLength).trim()}...`;␍

apps-edlove-web:lint:biome:      30     │ - }␍

apps-edlove-web:lint:biome:      31     │ - ␍

apps-edlove-web:lint:biome:      32     │ - /**␍

apps-edlove-web:lint:biome:      33     │ - ·*·Capitalize·first·letter·of·string␍

apps-edlove-web:lint:biome:      34     │ - ·*/␍

apps-edlove-web:lint:biome:      35     │ - export·function·capitalize(text:·string):·string·{␍

apps-edlove-web:lint:biome:      36     │ - → if·(!text)·return·"";␍

@repo/accounting:lint:biome:        37 │ + ····}));

@repo/library:lint:biome:       5     │ - export·interface·KnowledgeNodeIndex·{␍

@repo/library:lint:biome:       6     │ - → id:·string;␍

@repo/library:lint:biome:       7     │ - → type:·string;␍

@repo/analytics:lint:biome:     8 │ 	reset: () => void;
@repo/analytics:lint:biome:     9 │ }

@repo/analytics:lint:biome:   

apps-edlove-web:lint:biome:      37     │ - → return·text.charAt(0).toUpperCase()·+·text.slice(1).toLowerCase();␍

apps-edlove-web:lint:biome:      38     │ - }␍

apps-edlove-web:lint:biome:      39     │ - ␍

apps-edlove-web:lint:biome:      40     │ - /**␍

apps-edlove-web:lint:biome:      41     │ - ·*·Convert·to·title·case␍

apps-edlove-web:lint:biome:      42     │ - ·*·Example:·"hello·world"·\u2192·"Hello·World"␍

apps-edlove-web:lint:biome:      43     │ - ·*/␍

@repo/accounting:lint:biome:        38 │ + 

@repo/accounting:lint:biome:        39 │ + ····const·{·error:·entriesError·}·=·await·supabase

@repo/accounting:lint:biome:        40 │ + ······.schema('accounting')

@repo/library:lint:biome:       8     │ - → content_type:·string·|·null;␍

@repo/library:lint:biome:       9     │ - → title_si:·string·|·null;␍

@repo/library:lint:biome:      10     │ - → title_ta:·string·|·null;␍

@repo/library:lint:biome:      11     │ - → title_en:·string·|·null;␍

@repo/library:lint:biome:      12     │ - → tags:·string·|·null;␍

@repo/library:lint:biome:      13     │ - → map_x:·number·|·null;␍

@repo/library:lint:biome:      14     │ - → map_y:·number·|·null;␍

@repo/library:lint:biome:      15     │ - → latitude:·number·|·null;␍

apps-edlove-web:lint:biome:      44     │ - export·function·toTitleCase(text:·string):·string·{␍

@repo/accounting:lint:biome:        41 │ + ······.from('ledger_entries')

@repo/accounting:lint:biome:        42 │ + ······.insert(entriesWithTxId);

@repo/accounting:lint:biome:        43 │ + 

@repo/accounting:lint:biome:        44 │ + ····if·(entriesError)·throw·entriesError;

@repo/accounting:lint:biome:        45 │ + 

@repo/accounting:lint:biome:        46 │ + ····return·tx;

@repo/accounting:lint:biome:        47 │ + ··}

@repo/accounting:lint:biome:        48 │ + 

@repo/accounting:lint:biome:        49 │ + ··/**

@repo/accounting:lint:biome:        50 │ + ···*·Fetches·the·current·balance·of·an·account.

@repo/accounting:lint:biome:        51 │ + ···*/

@repo/accounting:lint:biome:        52 │ + ··static·async·getAccountBalance(accountId:·string)·{

@repo/accounting:lint:biome:        53 │ + ····const·{·data,·error·}·=·await·supabase

@repo/people:lint:biome:       3     │ - export·interface·PeopleDirectoryEntry·extends·User·{␍

@repo/people:lint:biome:       4     │ - → schoolRole:·SchoolRole·|·null;␍

@repo/people:lint:biome:       5     │ - → workRoles:·WorkRole[];␍

@repo/people:lint:biome:       6     │ - → personKind:·"staff"·|·"student";␍

@repo/people:lint:biome:       7     │ - }␍

@repo/people:lint:biome:       8     │ - interface·BondSeed·{␍

@repo/people:lint:biome:       9     │ - → user_id:·string;␍

@repo/people:lint:biome:      10     │ - → entity_id:·string;␍

@repo/people:lint:biome:      11     │ - → entity_type:·string;␍

@repo/people:lint:biome:      12     │ - → capacity:·string·|·null;␍

@repo/analytics:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: index.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

apps-edlove-web:lint:biome:      45     │ - → return·text␍

apps-edlove-web:lint:biome:      46     │ - → → .toLowerCase()␍

apps-edlove-web:lint:biome:      47     │ - → → .split("·")␍

apps-edlove-web:lint:biome:      48     │ - → → .map((word)·=>·capitalize(word))␍

@repo/graphics:lint:biome:       1     │ - import·{·useThemedColors·}·from·"@repo/ui/hooks";␍

apps-edlove-web:lint:biome:      49     │ - → → .join("·");␍

@repo/accounting:lint:biome:        54 │ + ······.schema('accounting')

@repo/accounting:lint:biome:        55 │ + ······.from('vw_account_balances')

@repo/accounting:lint:biome:        56 │ + ······.select('balance')

@repo/library:lint:biome:      16     │ - → longitude:·number·|·null;␍

@repo/accounting:lint:biome:        57 │ + ······.eq('id',·accountId)

@repo/library:lint:biome:      17     │ - → parent_id:·string·|·null;␍
@repo/accounting:lint:biome:        58 │ + ······.single();

@repo/accounting:lint:biome:        59 │ + 

@repo/library:lint:biome:      18     │ - → island_id:·string·|·null;␍

@repo/accounting:lint:biome:        60 │ + ····if·(error)·throw·error;

@repo/accounting:lint:biome:        61 │ + ····return·data.balance;

@repo/accounting:lint:biome:        62 │ + ··}

@repo/accounting:lint:biome:        63 │ + }

@repo/accounting:lint:biome:     66 64 │   
@repo/accounting:lint:biome:   

@repo/accounting:lint:biome: 

@repo/people:lint:biome:      13     │ - → status?:·string·|·null;␍

@repo/people:lint:biome:      14     │ - }␍

@repo/accounting:lint:biome: src\types.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/accounting:lint:biome: 

@repo/people:lint:biome:      15     │ - function·mapDirectoryEntry(user:·User,·bond:·BondSeed):·PeopleDirectoryEntry·{␍

@repo/people:lint:biome:      16     │ - → const·userWithTimestamps·=·{␍

@repo/people:lint:biome:      17     │ - → → ...user,␍

@repo/accounting:lint:biome:   × Formatter would have printed the following content:

@repo/accounting:lint:biome:   

@repo/people:lint:biome:      18     │ - → → created_at:·user.created_at·||·new·Date().toISOString(),␍

@repo/accounting:lint:biome:      1    │ - export·type·AccountType·=␍

@repo/accounting:lint:biome:      2    │ - → |·"asset"␍

@repo/accounting:lint:biome:      3    │ - → |·"liability"␍

apps-edlove-web:lint:biome:      50     │ - }␍

@repo/accounting:lint:biome:      4    │ - → |·"equity"␍

@repo/graphics:lint:biome:       2     │ - import·{·Text·}·from·"@repo/ui/primitives";␍

@repo/graphics:lint:biome:       3     │ - import·{·StyleSheet,·View·}·from·"react-native";␍

@repo/graphics:lint:biome:       4     │ - ␍

@repo/library:lint:biome:      19     │ - → updated_at:·number;␍

@repo/library:lint:biome:      20     │ - }␍

@repo/library:lint:biome:      21     │ - ␍

@repo/library:lint:biome:      22     │ - /**␍

@repo/library:lint:biome:      23     │ - ·*·Knowledge·Database·Manager␍

@repo/library:lint:biome:      24     │ - ·*·Handles·local·SQLite·operations·for·high-performance·search·and·discovery.␍

@repo/library:lint:biome:      25     │ - ·*/␍
@repo/analytics:lint:biome:      1    │ - declare·module·"@repo/analytics"·{␍

@repo/library:lint:biome:      26     │ - export·const·knowledgeDB·=·{␍

@repo/people:lint:biome:      19     │ - → → updated_at:·user.updated_at·||·new·Date().toISOString(),␍

@repo/people:lint:biome:      20     │ - → };␍

@repo/accounting:lint:biome:      5    │ - → |·"income"␍

@repo/people:lint:biome:      21     │ - → const·schoolRole·=·(bond.capacity·as·unknown·as·SchoolRole)·??·null;␍

@repo/accounting:lint:biome:      6    │ - → |·"expense";␍

@repo/accounting:lint:biome:      7    │ - ␍

@repo/accounting:lint:biome:      8    │ - export·interface·Account·{␍

apps-edlove-web:lint:biome:      51     │ - ␍

@repo/accounting:lint:biome:      9    │ - → id:·string;␍

@repo/accounting:lint:biome:     10    │ - → name:·string;␍

@repo/accounting:lint:biome:     11    │ - → code:·string;␍

@repo/accounting:lint:biome:     12    │ - → type:·AccountType;␍

apps-edlove-web:lint:biome:      52     │ - //·============================================================================␍

@repo/graphics:lint:biome:       5     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/graphics:lint:biome:       6     │ - //·SIMPLE·BAR·CHART␍

@repo/graphics:lint:biome:       7     │ - //·—————————————————————————————————————————————————————————————————————————————␍

@repo/graphics:lint:biome:       8     │ - ␍

@repo/graphics:lint:biome:       9     │ - interface·SimpleBarChartProps·{␍

@repo/graphics:lint:biome:      10     │ - → data:·{·label:·string;·value:·number;·color?:·string·}[];␍

@repo/graphics:lint:biome:      11     │ - → title?:·string;␍

@repo/graphics:lint:biome:      12     │ - → height?:·number;␍

@repo/graphics:lint:biome:      13     │ - → showValues?:·boolean;␍

@repo/graphics:lint:biome:      14     │ - }␍

@repo/graphics:lint:biome:      15     │ - ␍

@repo/graphics:lint:biome:      16     │ - export·function·SimpleBarChart({␍

@repo/graphics:lint:biome:      17     │ - → data,␍

@repo/graphics:lint:biome:      18     │ - → title,␍

@repo/graphics:lint:biome:      19     │ - → height·=·200,␍

@repo/graphics:lint:biome:      20     │ - → showValues·=·true,␍

@repo/graphics:lint:biome:      21     │ - }:·SimpleBarChartProps)·{␍

@repo/graphics:lint:biome:      22     │ - → const·colors·=·useThemedColors();␍

@repo/graphics:lint:biome:      23     │ - → const·maxValue·=·Math.max(...data.map((d)·=>·d.value),·1);␍

@repo/library:lint:biome:      27     │ - → db:·null·as·SQLite.SQLiteDatabase·|·null,␍

@repo/library:lint:biome:      28     │ - ␍

@repo/library:lint:biome:      29     │ - → /**␍

@repo/library:lint:biome:      30     │ - → ·*·Initialize·the·database·and·create·tables·if·they·don't·exist.␍

@repo/library:lint:biome:      31     │ - → ·*/␍

@repo/library:lint:biome:      32     │ - → async·init()·{␍

@repo/library:lint:biome:      33     │ - → → try·{␍

@repo/library:lint:biome:      34     │ - → → → if·(!this.db)·{␍

@repo/graphics:lint:biome:      24     │ - → const·barWidth·=·Math.max(20,·(300·-·data.length·*·40)·/·data.length);␍
@repo/graphics:lint:biome:      25     │ - ␍
@repo/graphics:lint:biome:      26     │ - → return·(␍
@repo/graphics:lint:biome:      27     │ - → → <View·style={[styles.container,·{·height·}]}>␍
@repo/graphics:lint:biome:      28     │ - → → → {title·&&·(␍
@repo/graphics:lint:biome:      29     │ - → → → → <Text·style={[styles.title,·{·color:·colors.text·}]}>{title}</Text>␍

@repo/graphics:lint:biome:      30     │ - → → → )}␍
@repo/graphics:lint:biome:      31     │ - → → → <View·style={styles.chartContainer}>␍
@repo/graphics:lint:biome:      32     │ - → → → → {data.map((item,·index)·=>·(␍
@repo/analytics:lint:biome:      2    │ - → export·*·from·"./index";␍
@repo/analytics:lint:biome:      3    │ - }␍
@repo/analytics:lint:biome:      4    │ - ␍
@repo/analytics:lint:biome:      5    │ - declare·module·"@repo/analytics/hooks"·{␍
@repo/analytics:lint:biome:      6    │ - → export·*·from·"./src/hooks";␍
@repo/analytics:lint:biome:      7    │ - }␍
@repo/analytics:lint:biome:      8    │ - ␍
@repo/analytics:lint:biome:      9    │ - declare·module·"@repo/analytics/ui"·{␍
@repo/analytics:lint:biome:     10    │ - → export·*·from·"./src/ui";␍
@repo/analytics:lint:biome:     11    │ - }␍
@repo/analytics:lint:biome:         1 │ + declare·module·'@repo/analytics'·{
@repo/analytics:lint:biome:         2 │ + ··export·*·from·'./index';
@repo/analytics:lint:biome:         3 │ + }
@repo/analytics:lint:biome:         4 │ + 
@repo/analytics:lint:biome:         5 │ + declare·module·'@repo/analytics/hooks'·{
@repo/analytics:lint:biome:         6 │ + ··export·*·from·'./src/hooks';
@repo/analytics:lint:biome:         7 │ + }
@repo/analytics:lint:biome:         8 │ + 
@repo/analytics:lint:biome:         9 │ + declare·module·'@repo/analytics/ui'·{
@repo/analytics:lint:biome:        10 │ + ··export·*·from·'./src/ui';
@repo/analytics:lint:biome:        11 │ + }
@repo/analytics:lint:biome:     12 12 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsChart.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:      1    │ - interface·AnalyticsChartProps·{␍
@repo/analytics:lint:biome:      2    │ - → title:·string;␍
@repo/analytics:lint:biome:      3    │ - → data:·{␍
@repo/analytics:lint:biome:      4    │ - → → label:·string;␍
@repo/analytics:lint:biome:      5    │ - → → value:·number;␍
@repo/analytics:lint:biome:      6    │ - → → color?:·string;␍
@repo/analytics:lint:biome:      7    │ - → }[];␍
@repo/analytics:lint:biome:      8    │ - → type?:·"bar"·|·"line"·|·"pie"·|·"progress";␍
@repo/analytics:lint:biome:      9    │ - → height?:·number;␍
@repo/analytics:lint:biome:     10    │ - → showValues?:·boolean;␍
@repo/analytics:lint:biome:     11    │ - → maxValue?:·number;␍
@repo/analytics:lint:biome:     12    │ - }␍
@repo/analytics:lint:biome:     13    │ - export·declare·function·AnalyticsChart({␍
@repo/analytics:lint:biome:     14    │ - → title,␍
@repo/analytics:lint:biome:     15    │ - → data,␍
@repo/analytics:lint:biome:     16    │ - → type,␍
@repo/analytics:lint:biome:     17    │ - → height,␍
@repo/analytics:lint:biome:     18    │ - → showValues,␍
@repo/analytics:lint:biome:     19    │ - → maxValue,␍
@repo/analytics:lint:biome:     20    │ - }:·AnalyticsChartProps):·import("react/jsx-runtime").JSX.Element·|·null;␍
@repo/analytics:lint:biome:     21    │ - interface·MultiSeriesChartProps·{␍
@repo/analytics:lint:biome:     22    │ - → title:·string;␍
@repo/analytics:lint:biome:     23    │ - → series:·{␍
@repo/analytics:lint:biome:     24    │ - → → name:·string;␍

@repo/analytics:lint:biome:     25    │ - → → data:·{␍
@repo/accounting:lint:biome: Checked 9 files in 1286ms. No fixes applied.

apps-edlove-web:lint:biome:      53     │ - //·DATE·&·TIME·UTILITIES␍
apps-edlove-web:lint:biome:      54     │ - //·============================================================================␍
@repo/analytics:lint:biome:     26    │ - → → → x:·string;␍
@repo/accounting:lint:biome: Found 7 errors.
@repo/analytics:lint:biome:     27    │ - → → → y:·number;␍
apps-edlove-web:lint:biome:      55     │ - ␍
@repo/accounting:lint:biome:     13    │ - → parentId?:·string;␍
@repo/analytics:lint:biome:     28    │ - → → }[];␍
@repo/accounting:lint:biome: Found 3 warnings.
@repo/analytics:lint:biome:     29    │ - → → color?:·string;␍
apps-edlove-web:lint:biome:      56     │ - /**␍
@repo/accounting:lint:biome:     14    │ - → balance:·number;␍
@repo/accounting:lint:biome:     15    │ - → metadata?:·Record<string,·any>;␍
@repo/analytics:lint:biome:     30    │ - → }[];␍
apps-edlove-web:lint:biome:      57     │ - ·*·Format·date·to·readable·string␍
apps-edlove-web:lint:biome:      58     │ - ·*·Example:·"2026-02-03"·\u2192·"February·3,·2026"␍
apps-edlove-web:lint:biome:      59     │ - ·*/␍
apps-edlove-web:lint:biome:      60     │ - export·function·formatDate(dateString:·string):·string·{␍
apps-edlove-web:lint:biome:      61     │ - → const·date·=·new·Date(dateString);␍
@repo/accounting:lint:biome:     16    │ - }␍
@repo/accounting:lint:biome:     17    │ - ␍
@repo/analytics:lint:biome:     31    │ - → type?:·"line"·|·"bar";␍
apps-edlove-web:lint:biome:      62     │ - → return·date.toLocaleDateString("en-US",·{␍
@repo/accounting:lint:biome:     18    │ - export·interface·LedgerEntry·{␍
@repo/analytics:lint:biome:     32    │ - → height?:·number;␍

apps-edlove-web:lint:biome:      63     │ - → → year:·"numeric",␍
apps-edlove-web:lint:biome:      64     │ - → → month:·"long",␍
@repo/accounting:lint:biome:     19    │ - → id:·string;␍
@repo/accounting:lint:biome:     20    │ - → transactionId:·string;␍
@repo/analytics:lint:biome:     33    │ - }␍
apps-edlove-web:lint:biome:      65     │ - → → day:·"numeric",␍
apps-edlove-web:lint:biome:      66     │ - → });␍
apps-edlove-web:lint:biome:      67     │ - }␍
apps-edlove-web:lint:biome:      68     │ - ␍

@repo/accounting:lint:biome:     21    │ - → accountId:·string;␍
@repo/analytics:lint:biome:     34    │ - export·declare·function·MultiSeriesChart({␍
apps-edlove-web:lint:biome:      69     │ - /**␍
@repo/accounting:lint:biome:     22    │ - → amount:·number;␍
@repo/analytics:lint:biome:     35    │ - → title,␍
@repo/analytics:lint:biome:     36    │ - → series,␍
apps-edlove-web:lint:biome:      70     │ - ·*·Format·date·to·short·format␍
apps-edlove-web:lint:biome:      71     │ - ·*·Example:·"2026-02-03"·\u2192·"Feb·3,·2026"␍

@repo/accounting:lint:biome:     23    │ - → side:·"debit"·|·"credit";␍
@repo/analytics:lint:biome:     37    │ - → type,␍
@repo/analytics:lint:biome:     38    │ - → height,␍
apps-edlove-web:lint:biome:      72     │ - ·*/␍
@repo/accounting:lint:biome:     24    │ - → description?:·string;␍

@repo/analytics:lint:biome:     39    │ - }:·MultiSeriesChartProps):·import("react/jsx-runtime").JSX.Element;␍
@repo/accounting:lint:biome:     25    │ - → createdAt:·string;␍

@repo/analytics:lint:biome:     40    │ - //#·sourceMappingURL=AnalyticsChart.d.ts.map␍
@repo/accounting:lint:biome:     26    │ - }␍
@repo/accounting:lint:biome:     27    │ - ␍
@repo/accounting:lint:biome:     28    │ - export·interface·FinancialTransaction·{␍

@repo/library:lint:biome:      35     │ - → → → → this.db·=·await·SQLite.openDatabaseAsync(DB_NAME);␍
@repo/analytics:lint:biome:         1 │ + interface·AnalyticsChartProps·{
@repo/accounting:lint:biome:     29    │ - → id:·string;␍

@repo/library:lint:biome:      36     │ - → → → }␍
@repo/analytics:lint:biome:         2 │ + ··title:·string;

@repo/accounting:lint:biome:     30    │ - → date:·string;␍

@repo/accounting:lint:biome:     31    │ - → description:·string;␍
@repo/analytics:lint:biome:         3 │ + ··data:·{
@repo/people:lint:biome:      22     │ - → return·{␍

@repo/people:lint:biome:      23     │ - → → ...userWithTimestamps,␍
@repo/accounting:lint:biome:     32    │ - → referenceNo?:·string;␍

@repo/accounting:lint:biome:     33    │ - → metadata?:·Record<string,·any>;␍
@repo/analytics:lint:biome:         4 │ + ····label:·string;
@repo/people:lint:biome:      24     │ - → → schoolRole,␍

@repo/people:lint:biome:      25     │ - → → workRoles:·[],␍
@repo/accounting:lint:biome:     34    │ - → entries:·LedgerEntry[];␍
@repo/analytics:lint:biome:         5 │ + ····value:·number;

@repo/people:lint:biome:      26     │ - → → personKind:·schoolRole·===·"student"·?·"student"·:·"staff",␍
@repo/accounting:lint:biome:     35    │ - }␍

@repo/accounting:lint:biome:     36    │ - ␍
@repo/analytics:lint:biome:         6 │ + ····color?:·string;
@repo/accounting:lint:biome:     37    │ - export·interface·Budget·{␍
@repo/analytics:lint:biome:         7 │ + ··}[];
@repo/accounting:lint:biome:     38    │ - → id:·string;␍
@repo/analytics:lint:biome:         8 │ + ··type?:·'bar'·|·'line'·|·'pie'·|·'progress';

@repo/accounting:lint:biome:     39    │ - → accountId:·string;␍
@repo/accounting:lint:biome:     40    │ - → amount:·number;␍
@repo/analytics:lint:biome:         9 │ + ··height?:·number;
@repo/analytics:lint:biome:        10 │ + ··showValues?:·boolean;
@repo/analytics:lint:biome:        11 │ + ··maxValue?:·number;

@repo/accounting:lint:biome:     41    │ - → periodStart:·string;␍
@repo/accounting:lint:biome:     42    │ - → periodEnd:·string;␍
@repo/analytics:lint:biome:        12 │ + }
@repo/analytics:lint:biome:        13 │ + export·declare·function·AnalyticsChart({

@repo/accounting:lint:biome:     43    │ - → actualSpent:·number;␍
@repo/analytics:lint:biome:        14 │ + ··title,
@repo/accounting:lint:biome:     44    │ - }␍
@repo/analytics:lint:biome:        15 │ + ··data,
@repo/accounting:lint:biome:         1 │ + export·type·AccountType·=·'asset'·|·'liability'·|·'equity'·|·'income'·|·'expense';

@repo/analytics:lint:biome:        16 │ + ··type,
@repo/accounting:lint:biome:         2 │ + 
@repo/analytics:lint:biome:        17 │ + ··height,
@repo/accounting:lint:biome:         3 │ + export·interface·Account·{

@repo/analytics:lint:biome:        18 │ + ··showValues,
@repo/analytics:lint:biome:        19 │ + ··maxValue,
@repo/analytics:lint:biome:        20 │ + }:·AnalyticsChartProps):·import('react/jsx-runtime').JSX.Element·|·null;
@repo/analytics:lint:biome:        21 │ + interface·MultiSeriesChartProps·{
@repo/analytics:lint:biome:        22 │ + ··title:·string;
@repo/analytics:lint:biome:        23 │ + ··series:·{
@repo/analytics:lint:biome:        24 │ + ····name:·string;

@repo/analytics:lint:biome:        25 │ + ····data:·{
@repo/analytics:lint:biome:        26 │ + ······x:·string;
@repo/accounting:lint:biome:         4 │ + ··id:·string;
@repo/accounting:lint:biome:         5 │ + ··name:·string;

@repo/analytics:lint:biome:        27 │ + ······y:·number;

@repo/accounting:lint:biome:         6 │ + ··code:·string;
@repo/accounting:lint:biome:         7 │ + ··type:·AccountType;

@repo/accounting:lint:biome:         8 │ + ··parentId?:·string;
@repo/analytics:lint:biome:        28 │ + ····}[];
@repo/analytics:lint:biome:        29 │ + ····color?:·string;
@repo/analytics:lint:biome:        30 │ + ··}[];

@repo/accounting:lint:biome:         9 │ + ··balance:·number;
@repo/accounting:lint:biome:        10 │ + ··metadata?:·Record<string,·any>;
@repo/analytics:lint:biome:        31 │ + ··type?:·'line'·|·'bar';

@repo/accounting:lint:biome:        11 │ + }
@repo/analytics:lint:biome:        32 │ + ··height?:·number;
@repo/accounting:lint:biome:        12 │ + 
@repo/analytics:lint:biome:        33 │ + }
@repo/analytics:lint:biome:        34 │ + export·declare·function·MultiSeriesChart({
@repo/analytics:lint:biome:        35 │ + ··title,

@repo/accounting:lint:biome:        13 │ + export·interface·LedgerEntry·{
@repo/analytics:lint:biome:        36 │ + ··series,
@repo/accounting:lint:biome:        14 │ + ··id:·string;
@repo/analytics:lint:biome:        37 │ + ··type,

@repo/accounting:lint:biome:        15 │ + ··transactionId:·string;
@repo/accounting:lint:biome:        16 │ + ··accountId:·string;
@repo/accounting:lint:biome:        17 │ + ··amount:·number;

@repo/accounting:lint:biome:        18 │ + ··side:·'debit'·|·'credit';
@repo/accounting:lint:biome:        19 │ + ··description?:·string;
@repo/accounting:lint:biome:        20 │ + ··createdAt:·string;

@repo/accounting:lint:biome:        21 │ + }
@repo/accounting:lint:biome:        22 │ + 
@repo/accounting:lint:biome:        23 │ + export·interface·FinancialTransaction·{
@repo/accounting:lint:biome:        24 │ + ··id:·string;

@repo/accounting:lint:biome:        25 │ + ··date:·string;
@repo/accounting:lint:biome:        26 │ + ··description:·string;
@repo/accounting:lint:biome:        27 │ + ··referenceNo?:·string;
@repo/accounting:lint:biome:        28 │ + ··metadata?:·Record<string,·any>;
@repo/accounting:lint:biome:        29 │ + ··entries:·LedgerEntry[];
@repo/accounting:lint:biome:        30 │ + }

@repo/accounting:lint:biome:        31 │ + 
@repo/accounting:lint:biome:        32 │ + export·interface·Budget·{
@repo/accounting:lint:biome:        33 │ + ··id:·string;
@repo/accounting:lint:biome:        34 │ + ··accountId:·string;

@repo/accounting:lint:biome:        35 │ + ··amount:·number;
@repo/accounting:lint:biome:        36 │ + ··periodStart:·string;
@repo/accounting:lint:biome:        37 │ + ··periodEnd:·string;

@repo/accounting:lint:biome:        38 │ + ··actualSpent:·number;
@repo/accounting:lint:biome:        39 │ + }
@repo/accounting:lint:biome:     45 40 │   
@repo/analytics:lint:biome:        38 │ + ··height,
@repo/analytics:lint:biome:        39 │ + }:·MultiSeriesChartProps):·import('react/jsx-runtime').JSX.Element;

@repo/accounting:lint:biome:   
@repo/analytics:lint:biome:        40 │ + //#·sourceMappingURL=AnalyticsChart.d.ts.map
@repo/accounting:lint:biome: 
@repo/analytics:lint:biome:     41 41 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsChart.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/accounting:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome:   × Formatter would have printed the following content:
@repo/accounting:lint:biome:   

@repo/accounting:lint:biome:      1    │ - {␍
@repo/accounting:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
@repo/accounting:lint:biome:      3    │ - → "compilerOptions":·{␍
@repo/accounting:lint:biome:      4    │ - → → "outDir":·"dist",␍
@repo/accounting:lint:biome:      5    │ - → → "rootDir":·"src",␍
@repo/accounting:lint:biome:      6    │ - → → "baseUrl":·".",␍
@repo/accounting:lint:biome:      7    │ - → → "jsx":·"react-native",␍
@repo/accounting:lint:biome:      8    │ - → → "esModuleInterop":·true,␍

@repo/accounting:lint:biome:      9    │ - → → "skipLibCheck":·true,␍
@repo/accounting:lint:biome:     10    │ - → → "paths":·{␍
@repo/accounting:lint:biome:     11    │ - → → → "@/*":·["src/*"]␍
@repo/accounting:lint:biome:     12    │ - → → },␍
@repo/accounting:lint:biome:     13    │ - → → "types":·["node"]␍
@repo/accounting:lint:biome:     14    │ - → },␍
@repo/accounting:lint:biome:     15    │ - → "include":·["src/**/*"],␍
@repo/accounting:lint:biome:     16    │ - → "exclude":·["node_modules",·"dist"]␍
@repo/accounting:lint:biome:     17    │ - }␍
@repo/accounting:lint:biome:         1 │ + {
@repo/accounting:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
@repo/accounting:lint:biome:         3 │ + ··"compilerOptions":·{
@repo/accounting:lint:biome:         4 │ + ····"outDir":·"dist",
@repo/accounting:lint:biome:         5 │ + ····"rootDir":·"src",
@repo/accounting:lint:biome:         6 │ + ····"baseUrl":·".",
@repo/accounting:lint:biome:         7 │ + ····"jsx":·"react-native",
@repo/accounting:lint:biome:         8 │ + ····"esModuleInterop":·true,
@repo/accounting:lint:biome:         9 │ + ····"skipLibCheck":·true,
@repo/accounting:lint:biome:        10 │ + ····"paths":·{
@repo/accounting:lint:biome:        11 │ + ······"@/*":·["src/*"]
@repo/accounting:lint:biome:        12 │ + ····},
@repo/accounting:lint:biome:        13 │ + ····"types":·["node"]
@repo/accounting:lint:biome:        14 │ + ··},
@repo/accounting:lint:biome:        15 │ + ··"include":·["src/**/*"],
@repo/accounting:lint:biome:        16 │ + ··"exclude":·["node_modules",·"dist"]
@repo/accounting:lint:biome:        17 │ + }

@repo/accounting:lint:biome:     18 18 │   

@repo/accounting:lint:biome:   
@repo/accounting:lint:biome: 
@repo/accounting:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/accounting:lint:biome: 
@repo/accounting:lint:biome:   × Some errors were emitted while running checks.

@repo/accounting:lint:biome:   
@repo/accounting:lint:biome: 

@repo/graphics:lint:biome:      33     │ - → → → → → <View·key={index}·style={styles.barContainer}>␍
@repo/graphics:lint:biome:      34     │ - → → → → → → <View␍
@repo/graphics:lint:biome:      35     │ - → → → → → → → style={[␍
@repo/graphics:lint:biome:      36     │ - → → → → → → → → styles.bar,␍
@repo/graphics:lint:biome:      37     │ - → → → → → → → → {␍
@repo/analytics:lint:biome:       1     │ - import·{␍

@repo/graphics:lint:biome:      38     │ - → → → → → → → → → height:·(item.value·/·maxValue)·*·(height·-·60),␍
@repo/graphics:lint:biome:      39     │ - → → → → → → → → → width:·barWidth,␍
@repo/graphics:lint:biome:      40     │ - → → → → → → → → → backgroundColor:·item.color·||·colors.primary,␍
@repo/graphics:lint:biome:      41     │ - → → → → → → → → → marginBottom:·showValues·?·4·:·0,␍
@repo/graphics:lint:biome:      42     │ - → → → → → → → → },␍
@repo/graphics:lint:biome:      43     │ - → → → → → → → ]}␍
@repo/graphics:lint:biome:      44     │ - → → → → → → />␍
@repo/graphics:lint:biome:      45     │ - → → → → → → {showValues·&&·(␍
@repo/graphics:lint:biome:      46     │ - → → → → → → → <Text·style={[styles.valueLabel,·{·color:·colors.text·}]}>␍
@repo/graphics:lint:biome:      47     │ - → → → → → → → → {item.value}␍
@repo/graphics:lint:biome:      48     │ - → → → → → → → </Text>␍
@repo/graphics:lint:biome:      49     │ - → → → → → → )}␍
@repo/graphics:lint:biome:      50     │ - → → → → → → <Text·style={[styles.barLabel,·{·color:·colors.textSecondary·}]}>␍
@repo/graphics:lint:biome:      51     │ - → → → → → → → {item.label}␍
@repo/graphics:lint:biome:      52     │ - → → → → → → </Text>␍
@repo/graphics:lint:biome:      53     │ - → → → → → </View>␍
@repo/graphics:lint:biome:      54     │ - → → → → ))}␍
@repo/graphics:lint:biome:      55     │ - → → → </View>␍
@repo/graphics:lint:biome:      56     │ - → → </View>␍
@repo/graphics:lint:biome:      57     │ - → );␍
@repo/graphics:lint:biome:      58     │ - }␍
@repo/graphics:lint:biome:      59     │ - ␍
@repo/graphics:lint:biome:      60     │ - //·—————————————————————————————————————————————————————————————————————————————␍
@repo/graphics:lint:biome:      61     │ - //·SIMPLE·LINE·CHART␍
@repo/graphics:lint:biome:      62     │ - //·—————————————————————————————————————————————————————————————————————————————␍
@repo/graphics:lint:biome:      63     │ - ␍
@repo/graphics:lint:biome:      64     │ - interface·SimpleLineChartProps·{␍
@repo/graphics:lint:biome:      65     │ - → data:·{·x:·string;·y:·number·}[];␍
@repo/graphics:lint:biome:      66     │ - → title?:·string;␍
@repo/graphics:lint:biome:      67     │ - → height?:·number;␍
@repo/graphics:lint:biome:      68     │ - → color?:·string;␍
@repo/graphics:lint:biome:      69     │ - }␍

@repo/graphics:lint:biome:      70     │ - ␍
@repo/graphics:lint:biome:      71     │ - export·function·SimpleLineChart({␍
@repo/graphics:lint:biome:      72     │ - → data,␍
@repo/graphics:lint:biome:      73     │ - → title,␍
@repo/graphics:lint:biome:      74     │ - → height·=·200,␍
@repo/graphics:lint:biome:      75     │ - → color,␍
@repo/graphics:lint:biome:      76     │ - }:·SimpleLineChartProps)·{␍
@repo/graphics:lint:biome:      77     │ - → const·colors·=·useThemedColors();␍
@repo/graphics:lint:biome:      78     │ - → const·chartColor·=·color·||·colors.primary;␍
@repo/graphics:lint:biome:      79     │ - → const·values·=·data.map((d)·=>·d.y);␍
@repo/graphics:lint:biome:      80     │ - → const·maxValue·=·Math.max(...values,·1);␍
@repo/graphics:lint:biome:      81     │ - → const·minValue·=·Math.min(...values,·0);␍
@repo/graphics:lint:biome:      82     │ - → const·range·=·maxValue·-·minValue·||·1;␍
@repo/graphics:lint:biome:      83     │ - ␍
@repo/graphics:lint:biome:      84     │ - → const·chartWidth·=·280;␍
@repo/graphics:lint:biome:      85     │ - → const·chartHeight·=·height·-·60;␍
@repo/graphics:lint:biome:      86     │ - ␍
@repo/graphics:lint:biome:      87     │ - → return·(␍
@repo/graphics:lint:biome:      88     │ - → → <View·style={[styles.container,·{·height·}]}>␍
@repo/graphics:lint:biome:      89     │ - → → → {title·&&·(␍

@repo/graphics:lint:biome:      90     │ - → → → → <Text·style={[styles.title,·{·color:·colors.text·}]}>{title}</Text>␍
@repo/graphics:lint:biome:      91     │ - → → → )}␍

@repo/graphics:lint:biome:      92     │ - → → → <View␍
@repo/graphics:lint:biome:      93     │ - → → → → style={[␍
@repo/graphics:lint:biome:      94     │ - → → → → → styles.chartContainer,␍
@repo/graphics:lint:biome:      95     │ - → → → → → {·width:·chartWidth,·height:·chartHeight,·alignItems:·"flex-start"·},␍

@repo/graphics:lint:biome:      96     │ - → → → → ]}␍
@repo/graphics:lint:biome:      97     │ - → → → >␍
@repo/graphics:lint:biome:      98     │ - → → → → {data.map((point,·index)·=>·{␍
@repo/graphics:lint:biome:      99     │ - → → → → → const·y·=·chartHeight·-·((point.y·-·minValue)·/·range)·*·chartHeight;␍
@repo/graphics:lint:biome:     100     │ - → → → → → const·x·=·(index·/·(data.length·-·1·||·1))·*·chartWidth;␍
@repo/graphics:lint:biome:     101     │ - ␍
@repo/graphics:lint:biome:     102     │ - → → → → → return·(␍

@repo/graphics:lint:biome:     103     │ - → → → → → → <View·key={index}·style={StyleSheet.absoluteFill}>␍
@repo/graphics:lint:biome:     104     │ - → → → → → → → {/*·Line·segment·to·previous·point·*/}␍
@repo/graphics:lint:biome:     105     │ - → → → → → → → {index·>·0·&&·data[index·-·1]·&&·(␍
@repo/graphics:lint:biome:     106     │ - → → → → → → → → <View␍
@repo/graphics:lint:biome:     107     │ - → → → → → → → → → style={[␍
@repo/graphics:lint:biome:     108     │ - → → → → → → → → → → styles.line,␍

@repo/analytics:lint:biome:       2     │ - → ProgressRing,␍
@repo/analytics:lint:biome:       3     │ - → SimpleBarChart,␍
@repo/analytics:lint:biome:       4     │ - → SimpleLineChart,␍
@repo/analytics:lint:biome:       5     │ - → SimplePieChart,␍

@repo/analytics:lint:biome:       6     │ - }·from·"@repo/graphics/charts";␍
@repo/analytics:lint:biome:       7     │ - import·{·Box,·HStack,·Text·}·from·"@repo/ui/primitives";␍
@repo/analytics:lint:biome:       8     │ - import·{·colors·}·from·"@repo/ui/theme";␍
@repo/analytics:lint:biome:       9     │ - import·{·jsx·as·_jsx,·jsxs·as·_jsxs·}·from·"react/jsx-runtime";␍
@repo/analytics:lint:biome:      10     │ - export·function·AnalyticsChart({␍

@repo/analytics:lint:biome:      11     │ - → title,␍
@repo/analytics:lint:biome:      12     │ - → data,␍
@repo/analytics:lint:biome:      13     │ - → type·=·"bar",␍
@repo/analytics:lint:biome:      14     │ - → height·=·200,␍
@repo/analytics:lint:biome:      15     │ - → showValues·=·true,␍
@repo/analytics:lint:biome:      16     │ - → maxValue,␍
@repo/analytics:lint:biome:      17     │ - })·{␍
@repo/analytics:lint:biome:      18     │ - → switch·(type)·{␍
@repo/analytics:lint:biome:      19     │ - → → case·"bar":␍
@repo/analytics:lint:biome:      20     │ - → → → return·_jsx(SimpleBarChart,·{␍

@repo/analytics:lint:biome:      21     │ - → → → → title:·title,␍
@repo/analytics:lint:biome:      22     │ - → → → → data:·data,␍
@repo/analytics:lint:biome:      23     │ - → → → → height:·height,␍
@repo/analytics:lint:biome:      24     │ - → → → → showValues:·showValues,␍
@repo/analytics:lint:biome:      25     │ - → → → });␍
@repo/analytics:lint:biome:      26     │ - → → case·"line":␍
@repo/analytics:lint:biome:      27     │ - → → → return·_jsx(SimpleLineChart,·{␍
@repo/analytics:lint:biome:      28     │ - → → → → title:·title,␍

@repo/analytics:lint:biome:      29     │ - → → → → data:·data.map((datum)·=>·({·x:·datum.label,·y:·datum.value·})),␍
@repo/analytics:lint:biome:      30     │ - → → → → height:·height,␍
@repo/analytics:lint:biome:      31     │ - → → → → color:·data[0]?.color,␍
@repo/analytics:lint:biome:      32     │ - → → → });␍
@repo/analytics:lint:biome:      33     │ - → → case·"pie":␍
@repo/analytics:lint:biome:      34     │ - → → → return·_jsx(SimplePieChart,·{·title:·title,·data:·data,·size:·height·});␍
@repo/analytics:lint:biome:      35     │ - → → case·"progress":·{␍
@repo/analytics:lint:biome:      36     │ - → → → const·progressValue·=·data[0]?.value·??·0;␍

@repo/analytics:lint:biome:      37     │ - → → → const·progressMax·=·maxValue·??·100;␍
@repo/analytics:lint:biome:      38     │ - → → → return·_jsxs(Box,·{␍
@repo/analytics:lint:biome:      39     │ - → → → → className:␍
@repo/analytics:lint:biome:      40     │ - → → → → → "items-center·rounded-3xl·border·border-black/5·bg-white/70·px-4·py-4",␍
@repo/analytics:lint:biome:      41     │ - → → → → style:·{·height·},␍
@repo/analytics:lint:biome:      42     │ - → → → → children:·[␍
@repo/analytics:lint:biome:      43     │ - → → → → → title␍

@repo/analytics:lint:biome:      44     │ - → → → → → → ?·_jsx(Text,·{␍

@repo/graphics:lint:biome:     109     │ - → → → → → → → → → → {␍
@repo/graphics:lint:biome:     110     │ - → → → → → → → → → → → left:·((index·-·1)·/·(data.length·-·1))·*·chartWidth,␍
@repo/graphics:lint:biome:     111     │ - → → → → → → → → → → → top:␍

@repo/graphics:lint:biome:     112     │ - → → → → → → → → → → → → chartHeight·-␍
@repo/graphics:lint:biome:     113     │ - → → → → → → → → → → → → (((data[index·-·1]?.y·??·0)·-·minValue)·/·range)·*␍
@repo/graphics:lint:biome:     114     │ - → → → → → → → → → → → → → chartHeight,␍
@repo/graphics:lint:biome:     115     │ - → → → → → → → → → → → width:·chartWidth·/·(data.length·-·1),␍
@repo/graphics:lint:biome:     116     │ - → → → → → → → → → → → height:·2,␍
@repo/graphics:lint:biome:     117     │ - → → → → → → → → → → → backgroundColor:·chartColor,␍
@repo/graphics:lint:biome:     118     │ - → → → → → → → → → → → transform:·[␍
@repo/graphics:lint:biome:     119     │ - → → → → → → → → → → → → {␍
@repo/graphics:lint:biome:     120     │ - → → → → → → → → → → → → → translateY:␍
@repo/graphics:lint:biome:     121     │ - → → → → → → → → → → → → → → (y·-␍
@repo/graphics:lint:biome:     122     │ - → → → → → → → → → → → → → → → (chartHeight·-␍
@repo/graphics:lint:biome:     123     │ - → → → → → → → → → → → → → → → → (((data[index·-·1]?.y·??·0)·-·minValue)·/␍
@repo/graphics:lint:biome:     124     │ - → → → → → → → → → → → → → → → → → range)·*␍
@repo/graphics:lint:biome:     125     │ - → → → → → → → → → → → → → → → → → chartHeight))·/␍
@repo/graphics:lint:biome:     126     │ - → → → → → → → → → → → → → → 2,␍
@repo/graphics:lint:biome:     127     │ - → → → → → → → → → → → → },␍
@repo/graphics:lint:biome:     128     │ - → → → → → → → → → → → → {␍

@repo/graphics:lint:biome:     129     │ - → → → → → → → → → → → → → rotate:·`${Math.atan2(y·-·(chartHeight·-·(((data[index·-·1]?.y·??·0)·-·minValue)·/·range)·*·chartHeight),·chartWidth·/·(data.length·-·1))·*·(180·/·Math.PI)}deg`,␍
@repo/graphics:lint:biome:     130     │ - → → → → → → → → → → → → },␍
@repo/graphics:lint:biome:     131     │ - → → → → → → → → → → → ],␍
@repo/graphics:lint:biome:     132     │ - → → → → → → → → → → },␍
@repo/graphics:lint:biome:     133     │ - → → → → → → → → → ]}␍
@repo/graphics:lint:biome:     134     │ - → → → → → → → → />␍
@repo/graphics:lint:biome:     135     │ - → → → → → → → )}␍
@repo/graphics:lint:biome:     136     │ - ␍
@repo/graphics:lint:biome:     137     │ - → → → → → → → {/*·Point·dot·*/}␍
@repo/graphics:lint:biome:     138     │ - → → → → → → → <View␍
@repo/graphics:lint:biome:     139     │ - → → → → → → → → style={[␍
@repo/graphics:lint:biome:     140     │ - → → → → → → → → → styles.point,␍

@repo/graphics:lint:biome:     141     │ - → → → → → → → → → {␍
@repo/graphics:lint:biome:     142     │ - → → → → → → → → → → left:·x·-·4,␍
@repo/graphics:lint:biome:     143     │ - → → → → → → → → → → top:·y·-·4,␍
@repo/graphics:lint:biome:     144     │ - → → → → → → → → → → backgroundColor:·chartColor,␍
@repo/graphics:lint:biome:     145     │ - → → → → → → → → → },␍
@repo/graphics:lint:biome:     146     │ - → → → → → → → → ]}␍
@repo/graphics:lint:biome:     147     │ - → → → → → → → />␍
@repo/graphics:lint:biome:     148     │ - ␍
@repo/graphics:lint:biome:     149     │ - → → → → → → → {/*·X-Axis·Label·*/}␍
@repo/graphics:lint:biome:     150     │ - → → → → → → → <Text␍
@repo/graphics:lint:biome:   603 more lines truncated
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: src\charts\AnalyticsEngine.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/graphics:lint:biome: 

apps-edlove-web:lint:biome:      73     │ - export·function·formatDateShort(dateString:·string):·string·{␍
apps-edlove-web:lint:biome:      74     │ - → const·date·=·new·Date(dateString);␍
apps-edlove-web:lint:biome:      75     │ - → return·date.toLocaleDateString("en-US",·{␍

apps-edlove-web:lint:biome:      76     │ - → → year:·"numeric",␍
apps-edlove-web:lint:biome:      77     │ - → → month:·"short",␍
apps-edlove-web:lint:biome:      78     │ - → → day:·"numeric",␍
apps-edlove-web:lint:biome:      79     │ - → });␍
apps-edlove-web:lint:biome:      80     │ - }␍
apps-edlove-web:lint:biome:      81     │ - ␍
apps-edlove-web:lint:biome:      82     │ - /**␍
apps-edlove-web:lint:biome:      83     │ - ·*·Get·relative·time␍
apps-edlove-web:lint:biome:      84     │ - ·*·Example:·"2·hours·ago",·"3·days·ago"␍
apps-edlove-web:lint:biome:      85     │ - ·*/␍
apps-edlove-web:lint:biome:      86     │ - export·function·getRelativeTime(dateString:·string):·string·{␍
apps-edlove-web:lint:biome:      87     │ - → const·date·=·new·Date(dateString);␍
apps-edlove-web:lint:biome:      88     │ - → const·now·=·new·Date();␍
apps-edlove-web:lint:biome:      89     │ - → const·diffInSeconds·=·Math.floor((now.getTime()·-·date.getTime())·/·1000);␍
apps-edlove-web:lint:biome:      90     │ - ␍
apps-edlove-web:lint:biome:      91     │ - → if·(diffInSeconds·<·60)·{␍
apps-edlove-web:lint:biome:      92     │ - → → return·"just·now";␍
apps-edlove-web:lint:biome:      93     │ - → }␍
apps-edlove-web:lint:biome:      94     │ - ␍
apps-edlove-web:lint:biome:      95     │ - → const·diffInMinutes·=·Math.floor(diffInSeconds·/·60);␍

apps-edlove-web:lint:biome:      96     │ - → if·(diffInMinutes·<·60)·{␍
apps-edlove-web:lint:biome:      97     │ - → → return·`${diffInMinutes}·minute${diffInMinutes·>·1·?·"s"·:·""}·ago`;␍
apps-edlove-web:lint:biome:      98     │ - → }␍
apps-edlove-web:lint:biome:      99     │ - ␍
apps-edlove-web:lint:biome:     100     │ - → const·diffInHours·=·Math.floor(diffInMinutes·/·60);␍

apps-edlove-web:lint:biome:     101     │ - → if·(diffInHours·<·24)·{␍
apps-edlove-web:lint:biome:     102     │ - → → return·`${diffInHours}·hour${diffInHours·>·1·?·"s"·:·""}·ago`;␍

apps-edlove-web:lint:biome:     103     │ - → }␍
apps-edlove-web:lint:biome:     104     │ - ␍
apps-edlove-web:lint:biome:     105     │ - → const·diffInDays·=·Math.floor(diffInHours·/·24);␍
apps-edlove-web:lint:biome:     106     │ - → if·(diffInDays·<·30)·{␍
apps-edlove-web:lint:biome:     107     │ - → → return·`${diffInDays}·day${diffInDays·>·1·?·"s"·:·""}·ago`;␍
apps-edlove-web:lint:biome:     108     │ - → }␍
apps-edlove-web:lint:biome:     109     │ - ␍
apps-edlove-web:lint:biome:     110     │ - → const·diffInMonths·=·Math.floor(diffInDays·/·30);␍
apps-edlove-web:lint:biome:     111     │ - → if·(diffInMonths·<·12)·{␍
apps-edlove-web:lint:biome:     112     │ - → → return·`${diffInMonths}·month${diffInMonths·>·1·?·"s"·:·""}·ago`;␍
apps-edlove-web:lint:biome:     113     │ - → }␍

apps-edlove-web:lint:biome:     114     │ - ␍
apps-edlove-web:lint:biome:     115     │ - → const·diffInYears·=·Math.floor(diffInMonths·/·12);␍
apps-edlove-web:lint:biome:     116     │ - → return·`${diffInYears}·year${diffInYears·>·1·?·"s"·:·""}·ago`;␍
apps-edlove-web:lint:biome:     117     │ - }␍
apps-edlove-web:lint:biome:     118     │ - ␍
apps-edlove-web:lint:biome:     119     │ - /**␍
apps-edlove-web:lint:biome:     120     │ - ·*·Calculate·reading·time·from·text␍
apps-edlove-web:lint:biome:     121     │ - ·*·Assumes·200·words·per·minute␍
apps-edlove-web:lint:biome:     122     │ - ·*/␍
apps-edlove-web:lint:biome:     123     │ - export·function·calculateReadingTime(text:·string):·number·{␍
apps-edlove-web:lint:biome:     124     │ - → const·wordsPerMinute·=·200;␍
apps-edlove-web:lint:biome:     125     │ - → const·wordCount·=·text.trim().split(/\s+/).length;␍

apps-edlove-web:lint:biome:     126     │ - → return·Math.ceil(wordCount·/·wordsPerMinute);␍
apps-edlove-web:lint:biome:     127     │ - }␍
apps-edlove-web:lint:biome:     128     │ - ␍
apps-edlove-web:lint:biome:     129     │ - //·============================================================================␍
apps-edlove-web:lint:biome:     130     │ - //·VALIDATION·UTILITIES␍
apps-edlove-web:lint:biome:     131     │ - //·============================================================================␍
apps-edlove-web:lint:biome:     132     │ - ␍
apps-edlove-web:lint:biome:     133     │ - /**␍
apps-edlove-web:lint:biome:     134     │ - ·*·Validate·email·format␍
apps-edlove-web:lint:biome:     135     │ - ·*/␍

apps-edlove-web:lint:biome:     136     │ - export·function·isValidEmail(email:·string):·boolean·{␍
apps-edlove-web:lint:biome:     137     │ - → const·emailRegex·=·/^[^\s@]+@[^\s@]+\.[^\s@]+$/;␍
apps-edlove-web:lint:biome:     138     │ - → return·emailRegex.test(email);␍
apps-edlove-web:lint:biome:     139     │ - }␍
apps-edlove-web:lint:biome:     140     │ - ␍
apps-edlove-web:lint:biome:     141     │ - /**␍
apps-edlove-web:lint:biome:     142     │ - ·*·Validate·URL·format␍
apps-edlove-web:lint:biome:     143     │ - ·*/␍
apps-edlove-web:lint:biome:     144     │ - export·function·isValidURL(url:·string):·boolean·{␍
apps-edlove-web:lint:biome:     145     │ - → try·{␍

apps-edlove-web:lint:biome:     146     │ - → → new·URL(url);␍
apps-edlove-web:lint:biome:     147     │ - → → return·true;␍
apps-edlove-web:lint:biome:     148     │ - → }·catch·{␍
apps-edlove-web:lint:biome:     149     │ - → → return·false;␍
apps-edlove-web:lint:biome:     150     │ - → }␍
apps-edlove-web:lint:biome:   647 more lines truncated
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome: svelte.config.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1   │ - import·{·vitePreprocess·}·from·"@astrojs/svelte";␍
apps-edlove-web:lint:biome:     2   │ - ␍
apps-edlove-web:lint:biome:     3   │ - export·default·{␍
apps-edlove-web:lint:biome:     4   │ - → preprocess:·vitePreprocess(),␍
apps-edlove-web:lint:biome:     5   │ - };␍
apps-edlove-web:lint:biome:       1 │ + import·{·vitePreprocess·}·from·'@astrojs/svelte';

apps-edlove-web:lint:biome:       2 │ + 
apps-edlove-web:lint:biome:       3 │ + export·default·{
apps-edlove-web:lint:biome:       4 │ + ··preprocess:·vitePreprocess(),
apps-edlove-web:lint:biome:       5 │ + };
apps-edlove-web:lint:biome:     6 6 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:      1    │ - {␍
apps-edlove-web:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍

apps-edlove-web:lint:biome:      3    │ - → "compilerOptions":·{␍
apps-edlove-web:lint:biome:      4    │ - → → "baseUrl":·".",␍
apps-edlove-web:lint:biome:      5    │ - → → "paths":·{␍
apps-edlove-web:lint:biome:      6    │ - → → → "@/*":·["./src/*"],␍
apps-edlove-web:lint:biome:      7    │ - → → → "@/types":·["./src/types"],␍
apps-edlove-web:lint:biome:      8    │ - → → → "@/constants/*":·["./src/constants/*"],␍
apps-edlove-web:lint:biome:      9    │ - → → → "@/components/*":·["./src/components/*"],␍

apps-edlove-web:lint:biome:     10    │ - → → → "@/lib/*":·["./src/lib/*"],␍
apps-edlove-web:lint:biome:     11    │ - → → → "@/utils/*":·["./src/utils/*"]␍
apps-edlove-web:lint:biome:     12    │ - → → }␍
apps-edlove-web:lint:biome:     13    │ - → },␍
apps-edlove-web:lint:biome:     14    │ - → "include":·[".astro/types.d.ts",·"**/*"],␍
apps-edlove-web:lint:biome:     15    │ - → "exclude":·["dist"]␍
apps-edlove-web:lint:biome:     16    │ - }␍

apps-edlove-web:lint:biome:         1 │ + {
apps-edlove-web:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
apps-edlove-web:lint:biome:         3 │ + ··"compilerOptions":·{
apps-edlove-web:lint:biome:         4 │ + ····"baseUrl":·".",
apps-edlove-web:lint:biome:         5 │ + ····"paths":·{
apps-edlove-web:lint:biome:         6 │ + ······"@/*":·["./src/*"],
apps-edlove-web:lint:biome:         7 │ + ······"@/types":·["./src/types"],
apps-edlove-web:lint:biome:         8 │ + ······"@/constants/*":·["./src/constants/*"],

apps-edlove-web:lint:biome:         9 │ + ······"@/components/*":·["./src/components/*"],
apps-edlove-web:lint:biome:        10 │ + ······"@/lib/*":·["./src/lib/*"],
apps-edlove-web:lint:biome:        11 │ + ······"@/utils/*":·["./src/utils/*"]
apps-edlove-web:lint:biome:        12 │ + ····}
apps-edlove-web:lint:biome:        13 │ + ··},
apps-edlove-web:lint:biome:        14 │ + ··"include":·[".astro/types.d.ts",·"**/*"],
apps-edlove-web:lint:biome:        15 │ + ··"exclude":·["dist"]
apps-edlove-web:lint:biome:        16 │ + }
apps-edlove-web:lint:biome:     17 17 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome: vercel.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 
apps-edlove-web:lint:biome:   × Formatter would have printed the following content:
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome:     1   │ - {␍
apps-edlove-web:lint:biome:     2   │ - → "framework":·null,␍
apps-edlove-web:lint:biome:     3   │ - → "outputDirectory":·"dist"␍

apps-edlove-web:lint:biome:     4   │ - }␍
apps-edlove-web:lint:biome:       1 │ + {
apps-edlove-web:lint:biome:       2 │ + ··"framework":·null,
apps-edlove-web:lint:biome:       3 │ + ··"outputDirectory":·"dist"
apps-edlove-web:lint:biome:       4 │ + }
apps-edlove-web:lint:biome:     5 5 │   
apps-edlove-web:lint:biome:   
apps-edlove-web:lint:biome: 

@repo/library:lint:biome:      37     │ - ␍

@repo/library:lint:biome:      38     │ - → → → //·Enable·WAL·mode·for·performance␍

@repo/people:lint:biome:      27     │ - → }·as·PeopleDirectoryEntry;␍

@repo/library:lint:biome:      39     │ - → → → await·this.db.execAsync("PRAGMA·journal_mode·=·WAL;");␍

@repo/people:lint:biome:      28     │ - }␍

@repo/library:lint:biome:      40     │ - ␍

@repo/people:lint:biome:      29     │ - export·const·peopleDirectoryAPI·=·{␍

@repo/people:lint:biome:      30     │ - → async·listBySchool(␍

@repo/people:lint:biome:      31     │ - → → schoolId:·string,␍

apps-edlove-web:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.

apps-edlove-web:lint:biome: Diagnostics not shown: 109.
apps-edlove-web:lint:biome: Checked 46 files in 1365ms. No fixes applied.
apps-edlove-web:lint:biome: Found 35 errors.
apps-edlove-web:lint:biome: Found 93 warnings.
apps-edlove-web:lint:biome: Found 1 info.

apps-edlove-web:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-edlove-web:lint:biome: 

apps-edlove-web:lint:biome:   × Some errors were emitted while running checks.

apps-edlove-web:lint:biome:   

apps-edlove-web:lint:biome: 

@repo/library:lint:biome:      41     │ - → → → //·Create·Main·Index·Table␍

@repo/library:lint:biome:      42     │ - → → → await·this.db.execAsync(`␍

@repo/people:lint:biome:      32     │ - → → options?:·{␍

@repo/types-shim:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/analytics:lint:biome:      45     │ - → → → → → → → → className:·"mb-4·text-center·text-base·font-bold",␍

@repo/library:lint:biome:      43     │ - ················CREATE·TABLE·IF·NOT·EXISTS·knowledge_index·(␍

@repo/library:lint:biome:      44     │ - ····················id·TEXT·PRIMARY·KEY,␍

@repo/library:lint:biome:      45     │ - ····················type·TEXT·NOT·NULL,␍

@repo/library:lint:biome:      46     │ - ····················content_type·TEXT,␍

@repo/library:lint:biome:      47     │ - ····················title_si·TEXT,␍

@repo/library:lint:biome:      48     │ - ····················title_ta·TEXT,␍

@repo/library:lint:biome:      49     │ - ····················title_en·TEXT,␍

@repo/library:lint:biome:      50     │ - ····················tags·TEXT,␍

@repo/library:lint:biome:      51     │ - ····················map_x·REAL,␍

@repo/people:lint:biome:      33     │ - → → → personKind?:·"all"·|·"staff"·|·"student";␍

@repo/people:lint:biome:      34     │ - → → },␍

@repo/people:lint:biome:      35     │ - → ):·Promise<PeopleDirectoryEntry[]>·{␍

@repo/analytics:lint:biome:      46     │ - → → → → → → → → style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:      47     │ - → → → → → → → → children:·title,␍

@repo/analytics:lint:biome:      48     │ - → → → → → → → })␍

@repo/analytics:lint:biome:      49     │ - → → → → → → :·null,␍

@repo/analytics:lint:biome:      50     │ - → → → → → _jsx(ProgressRing,·{␍

@repo/analytics:lint:biome:      51     │ - → → → → → → value:·progressValue,␍

@repo/analytics:lint:biome:      52     │ - → → → → → → max:·progressMax,␍

@repo/analytics:lint:biome:      53     │ - → → → → → → size:·Math.min(height,·150),␍

@repo/analytics:lint:biome:      54     │ - → → → → → → color:·data[0]?.color,␍

@repo/analytics:lint:biome:      55     │ - → → → → → → showLabel:·true,␍

@repo/people:lint:biome:      36     │ - → → const·{·data:·bondRows,·error:·bondError·}·=·await·supabase␍

@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   

@repo/analytics:lint:biome:      56     │ - → → → → → }),␍

@repo/library:lint:biome:      52     │ - ····················map_y·REAL,␍

@repo/library:lint:biome:      53     │ - ····················latitude·REAL,␍

@repo/library:lint:biome:      54     │ - ····················longitude·REAL,␍

@repo/workforce:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/analytics:lint:biome:      57     │ - → → → → → _jsxs(Text,·{␍

@repo/library:lint:biome:      55     │ - ····················parent_id·TEXT,␍

@repo/library:lint:biome:      56     │ - ····················island_id·TEXT,␍

@repo/people:lint:biome:      37     │ - → → → .from("bonds")␍

@repo/people:lint:biome:      38     │ - → → → .select("user_id,·entity_id,·entity_type,·capacity,·status")␍

@repo/people:lint:biome:      39     │ - → → → .eq("entity_type",·"SCHOOL")␍

@repo/people:lint:biome:      40     │ - → → → .eq("entity_id",·schoolId);␍

@repo/people:lint:biome:      41     │ - → → if·(bondError)·throw·bondError;␍

@repo/people:lint:biome:      42     │ - ␍

@repo/analytics:lint:biome:      58     │ - → → → → → → className:·"mt-3·text-center·text-sm",␍

@repo/library:lint:biome:      57     │ - ····················updated_at·INTEGER,␍

@repo/library:lint:biome:      58     │ - ····················is_favourite·INTEGER·DEFAULT·0␍

@repo/library:lint:biome:      59     │ - ················);␍

@repo/library:lint:biome:      60     │ - ············`);␍

@repo/library:lint:biome:      61     │ - ␍

@repo/library:lint:biome:      62     │ - → → → //·Create·FTS5·Search·Table␍

@repo/library:lint:biome:      63     │ - → → → await·this.db.execAsync(`␍

@repo/library:lint:biome:      64     │ - ················CREATE·VIRTUAL·TABLE·IF·NOT·EXISTS·knowledge_search_fts·USING·fts5(␍

@repo/library:lint:biome:      65     │ - ····················id·UNINDEXED,␍

@repo/people:lint:biome:      43     │ - → → let·filteredBonds·=·(bondRows·??·[])·as·BondSeed[];␍

@repo/library:lint:biome:      66     │ - ····················title_si,␍

@repo/library:lint:biome:      67     │ - ····················title_ta,␍

@repo/library:lint:biome:      68     │ - ····················title_en,␍

@repo/library:lint:biome:      69     │ - ····················tags,␍

@repo/analytics:lint:biome:      59     │ - → → → → → → style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:      60     │ - → → → → → → children:·[data[0]?.label,·":·",·progressValue,·"/",·progressMax],␍

@repo/analytics:lint:biome:      61     │ - → → → → → }),␍

@repo/analytics:lint:biome:      62     │ - → → → → ],␍

@repo/analytics:lint:biome:      63     │ - → → → });␍

@repo/analytics:lint:biome:      64     │ - → → }␍

@repo/analytics:lint:biome:      65     │ - → → default:␍

@repo/analytics:lint:biome:      66     │ - → → → return·null;␍

@repo/analytics:lint:biome:      67     │ - → }␍

@repo/analytics:lint:biome:      68     │ - }␍

@repo/analytics:lint:biome:      69     │ - export·function·MultiSeriesChart({␍

@repo/analytics:lint:biome:      70     │ - → title,␍

@repo/analytics:lint:biome:      71     │ - → series,␍

@repo/analytics:lint:biome:      72     │ - → type·=·"line",␍

@repo/analytics:lint:biome:      73     │ - → height·=·250,␍

@repo/analytics:lint:biome:      74     │ - })·{␍

@repo/analytics:lint:biome:      75     │ - → return·_jsxs(Box,·{␍

@repo/analytics:lint:biome:      76     │ - → → className:·"rounded-3xl·border·border-black/5·bg-white/70·px-4·py-4",␍

@repo/analytics:lint:biome:      77     │ - → → style:·{·height·},␍

@repo/analytics:lint:biome:      78     │ - → → children:·[␍

@repo/analytics:lint:biome:      79     │ - → → → title␍

@repo/analytics:lint:biome:      80     │ - → → → → ?·_jsx(Text,·{␍

@repo/graphics:lint:biome:       1     │ - import·{·marksToGPA·}·from·"@repo/core/lib";␍

@repo/people:lint:biome:      44     │ - → → if·(options?.personKind·===·"student")·{␍

@repo/library:lint:biome:      70     │ - ····················content='knowledge_index',␍

@repo/people:lint:biome:      45     │ - → → → filteredBonds·=·filteredBonds.filter((b)·=>·b.capacity·===·"student");␍

@repo/library:lint:biome:      71     │ - ····················content_rowid='rowid'␍

@repo/library:lint:biome:      72     │ - ················);␍

@repo/people:lint:biome:      46     │ - → → }·else·if·(options?.personKind·===·"staff")·{␍

@repo/library:lint:biome:      73     │ - ············`);␍

@repo/people:lint:biome:      47     │ - → → → filteredBonds·=·filteredBonds.filter((b)·=>·b.capacity·!==·"student");␍

@repo/analytics:lint:biome:      81     │ - → → → → → → className:·"mb-4·text-center·text-base·font-bold",␍

@repo/analytics:lint:biome:      82     │ - → → → → → → style:·{·color:·colors.text·},␍

@repo/analytics:lint:biome:      83     │ - → → → → → → children:·title,␍

@repo/analytics:lint:biome:      84     │ - → → → → → })␍

@repo/analytics:lint:biome:      85     │ - → → → → :·null,␍

@repo/analytics:lint:biome:      86     │ - → → → _jsx(HStack,·{␍

@repo/analytics:lint:biome:      87     │ - → → → → className:·"justify-around·gap-3",␍

@repo/analytics:lint:biome:      88     │ - → → → → children:·series.map((entry,·index)·=>␍

@repo/analytics:lint:biome:      89     │ - → → → → → _jsxs(␍

@repo/library:lint:biome:      74     │ - ␍

@repo/people:lint:biome:      48     │ - → → }␍

@repo/people:lint:biome:      49     │ - ␍

@repo/people:lint:biome:      50     │ - → → const·userIds·=·Array.from(␍

@repo/people:lint:biome:      51     │ - → → → new·Set(filteredBonds.map((b)·=>·b.user_id).filter(Boolean)),␍

@repo/analytics:lint:biome:      90     │ - → → → → → → Box,␍

@repo/graphics:lint:biome:       2     │ - import·{·Card·}·from·"@repo/ui/components/SanctuaryCard";␍

@repo/graphics:lint:biome:       3     │ - import·{␍

@repo/graphics:lint:biome:       4     │ - → HStack,␍

@repo/graphics:lint:biome:       5     │ - → Input,␍

@repo/graphics:lint:biome:       6     │ - → InputField,␍

@repo/graphics:lint:biome:       7     │ - → Pressable,␍

@repo/graphics:lint:biome:       8     │ - → ScrollView,␍

@repo/graphics:lint:biome:       9     │ - → Text,␍

@repo/graphics:lint:biome:      10     │ - → View,␍

@repo/graphics:lint:biome:      11     │ - → VStack,␍

@repo/graphics:lint:biome:      12     │ - }·from·"@repo/ui/primitives";␍

@repo/graphics:lint:biome:      13     │ - import·{·Theme·}·from·"@repo/ui/theme";␍

@repo/graphics:lint:biome:      14     │ - import·{·useCallback,·useMemo,·useState·}·from·"react";␍

@repo/library:lint:biome:      75     │ - → → → //·Create·Map·Layers·Index·Table␍

@repo/library:lint:biome:      76     │ - → → → await·this.db.execAsync(`␍

@repo/library:lint:biome:      77     │ - ················CREATE·TABLE·IF·NOT·EXISTS·map_layers_index·(␍

@repo/library:lint:biome:      78     │ - ····················id·TEXT·PRIMARY·KEY,␍

@repo/people:lint:biome:      52     │ - → → );␍

@repo/people:lint:biome:      53     │ - → → if·(userIds.length·===·0)·return·[];␍

@repo/people:lint:biome:      54     │ - ␍

@repo/people:lint:biome:      55     │ - → → const·{·data:·userRows,·error:·userError·}·=·await·supabase␍

@repo/people:lint:biome:      56     │ - → → → .from("users")␍

@repo/people:lint:biome:      57     │ - → → → .select("*")␍

@repo/people:lint:biome:      58     │ - → → → .in("id",·userIds)␍

@repo/people:lint:biome:      59     │ - → → → .order("full_name",·{·ascending:·true·});␍

@repo/people:lint:biome:      60     │ - → → if·(userError)·throw·userError;␍

@repo/people:lint:biome:      61     │ - ␍

@repo/analytics:lint:biome:      91     │ - → → → → → → {␍

@repo/analytics:lint:biome:      92     │ - → → → → → → → className:·"flex-1·items-center",␍

@repo/graphics:lint:biome:      15     │ - import·{·StyleSheet·}·from·"react-native";␍

@repo/graphics:lint:biome:      16     │ - ␍

@repo/analytics:lint:biome:      93     │ - → → → → → → → children:·[␍

@repo/graphics:lint:biome:      17     │ - interface·AnalyticsEngineProps·{␍

@repo/graphics:lint:biome:      18     │ - → data:·any[];␍

@repo/analytics:lint:biome:      94     │ - → → → → → → → → _jsx(Text,·{␍

@repo/analytics:lint:biome:      95     │ - → → → → → → → → → className:·"mb-2·text-center·text-xs·font-semibold",␍

@repo/graphics:lint:biome:      19     │ - → title?:·string;␍

@repo/graphics:lint:biome:      20     │ - → showFilters?:·boolean;␍

@repo/graphics:lint:biome:      21     │ - → showExport?:·boolean;␍

@repo/graphics:lint:biome:      22     │ - → showRealTime?:·boolean;␍

@repo/graphics:lint:biome:      23     │ - }␍

@repo/graphics:lint:biome:      24     │ - export·function·AnalyticsEngine({␍

@repo/graphics:lint:biome:      25     │ - → data,␍

@repo/graphics:lint:biome:      26     │ - → title,␍

@repo/graphics:lint:biome:      27     │ - → showFilters·=·true,␍

@repo/library:lint:biome:      79     │ - ····················name·TEXT·NOT·NULL,␍
@repo/graphics:lint:biome:      28     │ - → showExport·=·true,␍

@repo/library:lint:biome:      80     │ - ····················category·TEXT,␍

@repo/graphics:lint:biome:      29     │ - → showRealTime·=·false,␍

@repo/graphics:lint:biome:      30     │ - }:·AnalyticsEngineProps)·{␍

@repo/library:lint:biome:      81     │ - ····················is_geographic·INTEGER,␍

@repo/graphics:lint:biome:      31     │ - → const·[selectedMetric,·setSelectedMetric]·=·useState("all");␍

@repo/analytics:lint:biome:      96     │ - → → → → → → → → → style:·{·color:·entry.color·||·colors.gurudeviBlue·},␍

@repo/analytics:lint:biome:      97     │ - → → → → → → → → → children:·entry.name,␍

@repo/analytics:lint:biome:      98     │ - → → → → → → → → }),␍

@repo/library:lint:biome:      82     │ - ····················updated_at·INTEGER␍

@repo/library:lint:biome:      83     │ - ················);␍

@repo/graphics:lint:biome:      32     │ - → const·[dateRange,·setDateRange]·=·useState("month");␍

@repo/graphics:lint:biome:      33     │ - → const·[searchTerm,·setSearchTerm]·=·useState("");␍

@repo/graphics:lint:biome:      34     │ - → //·Calculate·analytics·metrics␍

@repo/people:lint:biome:      62     │ - → → const·bondByUserId·=·new·Map(filteredBonds.map((b)·=>·[b.user_id,·b]));␍

@repo/graphics:lint:biome:      35     │ - → const·analytics·=·useMemo(()·=>·{␍

@repo/graphics:lint:biome:      36     │ - → → if·(!data·||·data.length·===·0)␍

@repo/graphics:lint:biome:      37     │ - → → → return·{␍

@repo/graphics:lint:biome:      38     │ - → → → → totalItems:·0,␍

@repo/library:lint:biome:      84     │ - ············`);␍

@repo/library:lint:biome:      85     │ - ␍

@repo/library:lint:biome:      86     │ - → → → //·Triggers·for·FTS·consistency␍

@repo/library:lint:biome:      87     │ - → → → await·this.db.execAsync(`␍

@repo/library:lint:biome:      88     │ - ················CREATE·TRIGGER·IF·NOT·EXISTS·knowledge_index_ai·AFTER·INSERT·ON·knowledge_index·BEGIN␍

@repo/library:lint:biome:      89     │ - ····················INSERT·INTO·knowledge_search_fts(rowid,·id,·title_si,·title_ta,·title_en,·tags)␍

@repo/library:lint:biome:      90     │ - ····················VALUES·(new.rowid,·new.id,·new.title_si,·new.title_ta,·new.title_en,·new.tags);␍

@repo/library:lint:biome:      91     │ - ················END;␍

@repo/library:lint:biome:      92     │ - ␍

@repo/library:lint:biome:      93     │ - ················CREATE·TRIGGER·IF·NOT·EXISTS·knowledge_index_ad·AFTER·DELETE·ON·knowledge_index·BEGIN␍

@repo/library:lint:biome:      94     │ - ····················INSERT·INTO·knowledge_search_fts(knowledge_search_fts,·rowid,·id,·title_si,·title_ta,·title_en,·tags)␍

@repo/library:lint:biome:      95     │ - ····················VALUES('delete',·old.rowid,·old.id,·old.title_si,·old.title_ta,·old.title_en,·old.tags);␍

@repo/library:lint:biome:      96     │ - ················END;␍

@repo/library:lint:biome:      97     │ - ␍

@repo/library:lint:biome:      98     │ - ················CREATE·TRIGGER·IF·NOT·EXISTS·knowledge_index_au·AFTER·UPDATE·ON·knowledge_index·BEGIN␍

@repo/library:lint:biome:      99     │ - ····················INSERT·INTO·knowledge_search_fts(knowledge_search_fts,·rowid,·id,·title_si,·title_ta,·title_en,·tags)␍

@repo/library:lint:biome:     100     │ - ····················VALUES('delete',·old.rowid,·old.id,·old.title_si,·old.title_ta,·old.title_en,·old.tags);␍

@repo/library:lint:biome:     101     │ - ····················INSERT·INTO·knowledge_search_fts(rowid,·id,·title_si,·title_ta,·title_en,·tags)␍

@repo/library:lint:biome:     102     │ - ····················VALUES·(new.rowid,·new.id,·new.title_si,·new.title_ta,·new.title_en,·new.tags);␍

@repo/library:lint:biome:     103     │ - ················END;␍

@repo/library:lint:biome:     104     │ - ············`);␍

@repo/library:lint:biome:     105     │ - ␍

@repo/library:lint:biome:     106     │ - → → → //·Sync·State·Table␍

@repo/library:lint:biome:     107     │ - → → → await·this.db.execAsync(`␍

@repo/library:lint:biome:     108     │ - ················CREATE·TABLE·IF·NOT·EXISTS·sync_state·(␍

@repo/library:lint:biome:     109     │ - ····················key·TEXT·PRIMARY·KEY,␍

@repo/library:lint:biome:     110     │ - ····················last_sync_timestamp·INTEGER,␍

@repo/people:lint:biome:      63     │ - → → return·(userRows·??·[])␍

@repo/library:lint:biome:     111     │ - ····················sync_status·TEXT␍

@repo/library:lint:biome:     112     │ - ················);␍

@repo/people:lint:biome:      64     │ - → → → .map((row)·=>·{␍

@repo/library:lint:biome:     113     │ - ············`);␍

@repo/library:lint:biome:     114     │ - ␍

@repo/people:lint:biome:      65     │ - → → → → const·bond·=·bondByUserId.get((row·as·User).id);␍
@repo/library:lint:biome:     115     │ - → → → console.log("Knowledge·DB·Initialized·Successfully");␍

@repo/library:lint:biome:     116     │ - → → }·catch·(error)·{␍

@repo/people:lint:biome:      66     │ - → → → → return·bond·?·mapDirectoryEntry(row·as·User,·bond)·:·null;␍

@repo/library:lint:biome:     117     │ - → → → console.error("Failed·to·initialize·Knowledge·DB:",·error);␍

@repo/people:lint:biome:      67     │ - → → → })␍

@repo/people:lint:biome:      68     │ - → → → .filter(Boolean)·as·PeopleDirectoryEntry[];␍

@repo/people:lint:biome:      69     │ - → },␍

@repo/people:lint:biome:      70     │ - → async·getPerson(userId:·string):·Promise<PeopleDirectoryEntry·|·null>·{␍

@repo/graphics:lint:biome:      39     │ - → → → → averageValue:·0,␍

@repo/accounting:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/analytics:lint:biome:      99     │ - → → → → → → → → type·===·"line"␍

@repo/analytics:lint:biome:     100     │ - → → → → → → → → → ?·_jsx(SimpleLineChart,·{␍

@repo/library:lint:biome:     118     │ - → → }␍

@repo/graphics:lint:biome:      40     │ - → → → → trendDirection:·"stable"·as·"up"·|·"down"·|·"stable",␍

@repo/library:lint:biome:     119     │ - → },␍

@repo/library:lint:biome:     120     │ - ␍

@repo/library:lint:biome:     121     │ - → /**␍

@repo/library:lint:biome:     122     │ - → ·*·Search·the·local·knowledge·index·using·FTS5.␍

@repo/library:lint:biome:     123     │ - → ·*/␍

@repo/library:lint:biome:     124     │ - → async·search(query:·string,·limit:·number·=·20):·Promise<string[]>·{␍

@repo/analytics:lint:biome:     101     │ - → → → → → → → → → → → data:·entry.data,␍

@repo/analytics:lint:biome:     102     │ - → → → → → → → → → → → height:·height·-·60,␍

@repo/analytics:lint:biome:     103     │ - → → → → → → → → → → → color:·entry.color,␍

@repo/analytics:lint:biome:     104     │ - → → → → → → → → → → })␍

@repo/analytics:lint:biome:     105     │ - → → → → → → → → → :·_jsx(SimpleBarChart,·{␍

@repo/analytics:lint:biome:     106     │ - → → → → → → → → → → → data:·entry.data.map((datum)·=>·({␍

@repo/analytics:lint:biome:     107     │ - → → → → → → → → → → → → label:·datum.x,␍

@repo/analytics:lint:biome:     108     │ - → → → → → → → → → → → → value:·datum.y,␍

@repo/analytics:lint:biome:     109     │ - → → → → → → → → → → → → color:·entry.color,␍

@repo/analytics:lint:biome:     110     │ - → → → → → → → → → → → })),␍

@repo/analytics:lint:biome:     111     │ - → → → → → → → → → → → height:·height·-·60,␍

@repo/analytics:lint:biome:     112     │ - → → → → → → → → → → → showValues:·false,␍

@repo/analytics:lint:biome:     113     │ - → → → → → → → → → → }),␍

@repo/analytics:lint:biome:     114     │ - → → → → → → → ],␍

@repo/analytics:lint:biome:     115     │ - → → → → → → },␍

@repo/analytics:lint:biome:     116     │ - → → → → → → index,␍

@repo/analytics:lint:biome:     117     │ - → → → → → ),␍

@repo/analytics:lint:biome:     118     │ - → → → → ),␍

@repo/analytics:lint:biome:     119     │ - → → → }),␍

@repo/analytics:lint:biome:     120     │ - → → ],␍

@repo/analytics:lint:biome:     121     │ - → });␍

@repo/analytics:lint:biome:     122     │ - }␍

@repo/analytics:lint:biome:           1 │ + import·{

@repo/analytics:lint:biome:           2 │ + ··ProgressRing,

@repo/analytics:lint:biome:           3 │ + ··SimpleBarChart,

@repo/analytics:lint:biome:           4 │ + ··SimpleLineChart,

@repo/analytics:lint:biome:           5 │ + ··SimplePieChart,

@repo/analytics:lint:biome:           6 │ + }·from·'@repo/graphics/charts';

@repo/analytics:lint:biome:           7 │ + import·{·Box,·HStack,·Text·}·from·'@repo/ui/primitives';

@repo/analytics:lint:biome:           8 │ + import·{·colors·}·from·'@repo/ui/theme';

@repo/library:lint:biome:     125     │ - → → if·(!this.db)·return·[];␍

@repo/library:lint:biome:     126     │ - ␍

@repo/library:lint:biome:     127     │ - → → try·{␍

@repo/graphics:lint:biome:      41     │ - → → → → topPerformers:·[],␍
@repo/graphics:lint:biome:      42     │ - → → → → distribution:·{},␍
@repo/graphics:lint:biome:      43     │ - → → → → insights:·[],␍
@repo/graphics:lint:biome:      44     │ - → → → };␍
@repo/graphics:lint:biome:      45     │ - → → const·numericData·=·data.filter((item)·=>·typeof·item.value·===·"number");␍
@repo/graphics:lint:biome:      46     │ - → → const·totalItems·=·numericData.length;␍

@repo/graphics:lint:biome:      47     │ - → → const·averageValue·=␍
@repo/graphics:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/graphics:lint:biome:      48     │ - → → → numericData.reduce((sum,·item)·=>·sum·+·item.value,·0)·/·totalItems;␍
@repo/graphics:lint:biome: Diagnostics not shown: 67.
@repo/graphics:lint:biome: Checked 46 files in 1293ms. No fixes applied.
@repo/graphics:lint:biome: Found 58 errors.
@repo/graphics:lint:biome: Found 26 warnings.
@repo/graphics:lint:biome:      49     │ - → → //·Calculate·trend␍
@repo/graphics:lint:biome: Found 3 infos.
@repo/graphics:lint:biome:      50     │ - → → const·sortedData·=·[...numericData].sort((a,·b)·=>·b.value·-·a.value);␍
@repo/graphics:lint:biome:      51     │ - → → const·midPoint·=·Math.floor(sortedData.length·/·2);␍
@repo/graphics:lint:biome:      52     │ - → → const·trendDirection·=␍
@repo/graphics:lint:biome:      53     │ - → → → sortedData.length·>·1␍
@repo/graphics:lint:biome:      54     │ - → → → → ?·sortedData[midPoint].value·>·sortedData[midPoint·-·1].value␍
@repo/graphics:lint:biome:      55     │ - → → → → → ?·"up"␍
@repo/graphics:lint:biome:      56     │ - → → → → → :·"down"␍
@repo/graphics:lint:biome:      57     │ - → → → → :·"stable";␍
@repo/graphics:lint:biome:      58     │ - → → //·Get·top·performers␍
@repo/graphics:lint:biome:      59     │ - → → const·topPerformers·=·sortedData.slice(0,·5).map((item)·=>·({␍
@repo/graphics:lint:biome:      60     │ - → → → id:·item.id,␍
@repo/graphics:lint:biome:      61     │ - → → → name:·item.name,␍
@repo/graphics:lint:biome:      62     │ - → → → value:·item.value,␍
@repo/graphics:lint:biome:      63     │ - → → }));␍
@repo/graphics:lint:biome:      64     │ - → → //·Calculate·distribution␍
@repo/graphics:lint:biome:      65     │ - → → const·distribution·=·numericData.reduce((acc,·item)·=>·{␍
@repo/graphics:lint:biome:      66     │ - → → → const·grade·=·marksToGPA(item.value).grade;␍
@repo/graphics:lint:biome:      67     │ - → → → acc[grade]·=·(acc[grade]·||·0)·+·1;␍
@repo/graphics:lint:biome:      68     │ - → → → return·acc;␍
@repo/graphics:lint:biome:      69     │ - → → },·{});␍
@repo/graphics:lint:biome:      70     │ - → → //·Generate·insights␍
@repo/graphics:lint:biome:      71     │ - → → const·insights·=·[␍
@repo/graphics:lint:biome:      72     │ - → → → `Total·of·${totalItems}·items·analyzed`,␍
@repo/graphics:lint:biome:      73     │ - → → → `Average·value:·${averageValue.toFixed(2)}`,␍

@repo/graphics:lint:biome:      74     │ - → → → `Trend:·${trendDirection}`,␍
@repo/graphics:lint:biome:      75     │ - → → → `Top·performer:·${topPerformers[0]?.name·||·"N/A"}`,␍
@repo/graphics:lint:biome:      76     │ - → → → `Distribution:·${Object.keys(distribution).length}·categories`,␍
@repo/graphics:lint:biome:      77     │ - → → ];␍
@repo/graphics:lint:biome:      78     │ - → → return·{␍
@repo/graphics:lint:biome:      79     │ - → → → totalItems,␍
@repo/graphics:lint:biome:      80     │ - → → → averageValue,␍
@repo/graphics:lint:biome:      81     │ - → → → trendDirection,␍
@repo/graphics:lint:biome:      82     │ - → → → topPerformers,␍
@repo/graphics:lint:biome:      83     │ - → → → distribution,␍
@repo/graphics:lint:biome:      84     │ - → → → insights,␍
@repo/graphics:lint:biome:      85     │ - → → };␍
@repo/graphics:lint:biome:      86     │ - → },·[data]);␍
@repo/graphics:lint:biome:      87     │ - → const·handleExport·=·useCallback(()·=>·{␍
@repo/graphics:lint:biome:      88     │ - → → const·exportData·=·{␍
@repo/graphics:lint:biome:      89     │ - → → → title:·title·||·"Analytics·Report",␍
@repo/graphics:lint:biome:      90     │ - → → → date:·new·Date().toISOString(),␍
@repo/graphics:lint:biome:      91     │ - → → → metrics:·analytics,␍
@repo/graphics:lint:biome:      92     │ - → → → data:·data,␍
@repo/graphics:lint:biome:      93     │ - → → };␍
@repo/graphics:lint:biome:      94     │ - → → //·In·real·app,·this·would·save·to·file·or·share␍
@repo/graphics:lint:biome:      95     │ - → → console.log("Exporting·analytics:",·exportData);␍
@repo/graphics:lint:biome:      96     │ - → },·[analytics,·title,·data]);␍
@repo/graphics:lint:biome:      97     │ - → const·filteredData·=·useMemo(()·=>·{␍
@repo/graphics:lint:biome:      98     │ - → → if·(selectedMetric·===·"all")·return·data;␍

@repo/graphics:lint:biome:      99     │ - → → return·data.filter((item)·=>·{␍
@repo/graphics:lint:biome:     100     │ - → → → const·grade·=·marksToGPA(item.value).grade;␍
@repo/graphics:lint:biome:     101     │ - → → → return·selectedMetric·===·grade;␍
@repo/graphics:lint:biome:     102     │ - → → });␍
@repo/graphics:lint:biome:     103     │ - → },·[data,·selectedMetric]);␍
@repo/graphics:lint:biome:     104     │ - → return·(␍
@repo/graphics:lint:biome:     105     │ - → → <Card·style={styles.container}>␍
@repo/graphics:lint:biome:     106     │ - → → → {title·&&·<Text·style={styles.title}>{title}</Text>}␍
@repo/graphics:lint:biome:     107     │ - ␍
@repo/graphics:lint:biome:     108     │ - → → → {/*·Filters·*/}␍
@repo/graphics:lint:biome:     109     │ - → → → {showFilters·&&·(␍
@repo/graphics:lint:biome:     110     │ - → → → → <View·style={styles.filters}>␍
@repo/graphics:lint:biome:     111     │ - → → → → → <HStack·space="md">␍

@repo/graphics:lint:biome:     112     │ - → → → → → → <VStack·className="flex-1">␍
@repo/graphics:lint:biome:     113     │ - → → → → → → → <Text·style={styles.filterLabel}>Metric</Text>␍
@repo/graphics:lint:biome:     114     │ - → → → → → → → <ScrollView·horizontal·showsHorizontalScrollIndicator={false}>␍
@repo/graphics:lint:biome:     115     │ - → → → → → → → → <HStack·space="sm">␍
@repo/graphics:lint:biome:     116     │ - → → → → → → → → → {["all",·"A",·"B",·"C",·"S",·"F"].map((grade)·=>·(␍
@repo/graphics:lint:biome:     117     │ - → → → → → → → → → → <Pressable␍
@repo/graphics:lint:biome:     118     │ - → → → → → → → → → → → key={grade}␍
@repo/graphics:lint:biome:     119     │ - → → → → → → → → → → → onPress={()·=>·setSelectedMetric(grade)}␍
@repo/graphics:lint:biome:     120     │ - → → → → → → → → → → → className={␍
@repo/graphics:lint:biome:     121     │ - → → → → → → → → → → → → selectedMetric·===·grade␍
@repo/graphics:lint:biome:     122     │ - → → → → → → → → → → → → → ?·"rounded-lg·bg-gurudeviBlue"␍
@repo/graphics:lint:biome:     123     │ - → → → → → → → → → → → → → :·"rounded-lg"␍

@repo/graphics:lint:biome:     124     │ - → → → → → → → → → → → }␍
@repo/graphics:lint:biome:     125     │ - → → → → → → → → → → >␍
@repo/graphics:lint:biome:     126     │ - → → → → → → → → → → → <Text␍
@repo/graphics:lint:biome:     127     │ - → → → → → → → → → → → → style={[␍
@repo/graphics:lint:biome:     128     │ - → → → → → → → → → → → → → styles.filterOption,␍
@repo/graphics:lint:biome:     129     │ - → → → → → → → → → → → → → selectedMetric·===·grade·&&·styles.selectedFilter,␍
@repo/graphics:lint:biome:     130     │ - → → → → → → → → → → → → ]}␍
@repo/graphics:lint:biome:     131     │ - → → → → → → → → → → → >␍
@repo/graphics:lint:biome:     132     │ - → → → → → → → → → → → → {grade·===·"all"·?·"All"·:·grade}␍
@repo/graphics:lint:biome:     133     │ - → → → → → → → → → → → </Text>␍
@repo/graphics:lint:biome:     134     │ - → → → → → → → → → → </Pressable>␍
@repo/graphics:lint:biome:     135     │ - → → → → → → → → → ))}␍
@repo/graphics:lint:biome:     136     │ - → → → → → → → → </HStack>␍
@repo/graphics:lint:biome:     137     │ - → → → → → → → </ScrollView>␍
@repo/graphics:lint:biome:     138     │ - → → → → → → </VStack>␍
@repo/graphics:lint:biome:     139     │ - ␍
@repo/graphics:lint:biome:     140     │ - → → → → → → <VStack·className="flex-1">␍
@repo/graphics:lint:biome:     141     │ - → → → → → → → <Text·style={styles.filterLabel}>Date·Range</Text>␍
@repo/graphics:lint:biome:     142     │ - → → → → → → → <ScrollView·horizontal·showsHorizontalScrollIndicator={false}>␍
@repo/graphics:lint:biome:     143     │ - → → → → → → → → <HStack·space="sm">␍
@repo/graphics:lint:biome:     144     │ - → → → → → → → → → {["week",·"month",·"quarter",·"year"].map((range)·=>·(␍
@repo/graphics:lint:biome:     145     │ - → → → → → → → → → → <Pressable␍
@repo/graphics:lint:biome:     146     │ - → → → → → → → → → → → key={range}␍
@repo/graphics:lint:biome:     147     │ - → → → → → → → → → → → onPress={()·=>·setDateRange(range)}␍
@repo/graphics:lint:biome:     148     │ - → → → → → → → → → → → className={␍
@repo/graphics:lint:biome:     149     │ - → → → → → → → → → → → → dateRange·===·range␍
@repo/graphics:lint:biome:     150     │ - → → → → → → → → → → → → → ?·"rounded-lg·bg-gurudeviBlue"␍
@repo/graphics:lint:biome:   570 more lines truncated
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/analytics:lint:biome:           9 │ + import·{·jsx·as·_jsx,·jsxs·as·_jsxs·}·from·'react/jsx-runtime';
@repo/analytics:lint:biome:          10 │ + export·function·AnalyticsChart({
@repo/analytics:lint:biome:          11 │ + ··title,
@repo/analytics:lint:biome:          12 │ + ··data,
@repo/analytics:lint:biome:          13 │ + ··type·=·'bar',
@repo/analytics:lint:biome:          14 │ + ··height·=·200,
@repo/analytics:lint:biome:          15 │ + ··showValues·=·true,
@repo/analytics:lint:biome:          16 │ + ··maxValue,
@repo/analytics:lint:biome:          17 │ + })·{
@repo/analytics:lint:biome:          18 │ + ··switch·(type)·{
@repo/analytics:lint:biome:          19 │ + ····case·'bar':
@repo/analytics:lint:biome:          20 │ + ······return·_jsx(SimpleBarChart,·{
@repo/analytics:lint:biome:          21 │ + ········title:·title,
@repo/analytics:lint:biome:          22 │ + ········data:·data,
@repo/analytics:lint:biome:          23 │ + ········height:·height,
@repo/analytics:lint:biome:          24 │ + ········showValues:·showValues,
@repo/analytics:lint:biome:          25 │ + ······});

@repo/graphics:lint:biome: src\types-shim.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:     1   │ - declare·module·"srilankan-postalcode-backend";␍
@repo/graphics:lint:biome:       1 │ + declare·module·'srilankan-postalcode-backend';
@repo/graphics:lint:biome:     2 2 │   
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome: tsconfig.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Formatter would have printed the following content:
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome:      1    │ - {␍

@repo/graphics:lint:biome:      2    │ - → "extends":·"../../packages/typescript-config/base.json",␍
@repo/analytics:lint:biome:          26 │ + ····case·'line':

@repo/analytics:lint:biome:          27 │ + ······return·_jsx(SimpleLineChart,·{
@repo/analytics:lint:biome:          28 │ + ········title:·title,
@repo/analytics:lint:biome:   89 more lines truncated
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsChart.tsx:121:16 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Avoid using the index of an array as key property in an element.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     119 │ 			<HStack className="justify-around gap-3">
@repo/analytics:lint:biome:     120 │ 				{series.map((entry, index) => (
@repo/analytics:lint:biome:   > 121 │ 					<Box key={index} className="flex-1 items-center">
@repo/analytics:lint:biome:         │ 					          ^^^^^
@repo/analytics:lint:biome:     122 │ 						<Text
@repo/analytics:lint:biome:     123 │ 							className="mb-2 text-center text-xs font-semibold"
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i This is the source of the key value.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:     118 │ 			) : null}
@repo/analytics:lint:biome:     119 │ 			<HStack className="justify-around gap-3">
@repo/analytics:lint:biome:   > 120 │ 				{series.map((entry, index) => (
@repo/analytics:lint:biome:         │ 				                    ^^^^^
@repo/analytics:lint:biome:     121 │ 					<Box key={index} className="flex-1 items-center">
@repo/analytics:lint:biome:     122 │ 						<Text
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i The order of the items may change, and this also affects performances and component state.
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:   i Check the React documentation. 
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsChart.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   
@repo/library:lint:biome:     128     │ - → → → //·Sanitize·query·for·FTS5·(basic)␍
@repo/library:lint:biome:     129     │ - → → → const·sanitizedQuery·=·query.replace(/['"]/g,·"");␍
@repo/library:lint:biome:     130     │ - → → → if·(!sanitizedQuery)·return·[];␍

@repo/library:lint:biome:     131     │ - ␍
@repo/people:lint:biome:      71     │ - → → const·{·data:·userRow,·error:·userError·}·=·await·supabase␍
@repo/graphics:lint:biome:      3    │ - → "compilerOptions":·{␍

@repo/library:lint:biome:     132     │ - → → → const·results·=·(await·this.db.getAllAsync(␍
@repo/people:lint:biome:      72     │ - → → → .from("users")␍
@repo/graphics:lint:biome:      4    │ - → → "outDir":·"./dist",␍

@repo/graphics:lint:biome:      5    │ - → → "rootDir":·"./src",␍
@repo/library:lint:biome:     133     │ - → → → → `SELECT·id·FROM·knowledge_search_fts·WHERE·knowledge_search_fts·MATCH·?·LIMIT·?`,␍
@repo/people:lint:biome:      73     │ - → → → .select("*")␍

@repo/people:lint:biome:      74     │ - → → → .eq("id",·userId)␍
@repo/graphics:lint:biome:      6    │ - → → "baseUrl":·".",␍
@repo/library:lint:biome:     134     │ - → → → → [`${sanitizedQuery}*`,·limit],␍

@repo/people:lint:biome:      75     │ - → → → .maybeSingle();␍
@repo/graphics:lint:biome:      7    │ - → → "jsx":·"react-jsx"␍
@repo/library:lint:biome:     135     │ - → → → ))·as·{·id:·string·}[];␍

@repo/people:lint:biome:      76     │ - → → if·(userError)·throw·userError;␍
@repo/graphics:lint:biome:      8    │ - → },␍
@repo/graphics:lint:biome:      9    │ - → "include":·["src/**/*"]␍
@repo/library:lint:biome:     136     │ - ␍
@repo/people:lint:biome:      77     │ - → → if·(!userRow)·return·null;␍
@repo/graphics:lint:biome:     10    │ - }␍

@repo/library:lint:biome:     137     │ - → → → return·results.map((r)·=>·r.id);␍
@repo/people:lint:biome:      78     │ - ␍
@repo/people:lint:biome:      79     │ - → → const·schoolId·=·(userRow·as·User).school_id·as·string·|·null·|·undefined;␍

@repo/graphics:lint:biome:         1 │ + {
@repo/library:lint:biome:     138     │ - → → }·catch·(error)·{␍

@repo/people:lint:biome:      80     │ - → → if·(!schoolId)·{␍
@repo/graphics:lint:biome:         2 │ + ··"extends":·"../../packages/typescript-config/base.json",
@repo/graphics:lint:biome:         3 │ + ··"compilerOptions":·{

@repo/library:lint:biome:     139     │ - → → → console.error("Local·search·failed:",·error);␍
@repo/people:lint:biome:      81     │ - → → → return·{␍
@repo/people:lint:biome:      82     │ - → → → → ...(userRow·as·User),␍
@repo/graphics:lint:biome:         4 │ + ····"outDir":·"./dist",

@repo/graphics:lint:biome:         5 │ + ····"rootDir":·"./src",
@repo/library:lint:biome:     140     │ - → → → return·[];␍
@repo/people:lint:biome:      83     │ - → → → → schoolRole:·null,␍

@repo/people:lint:biome:      84     │ - → → → → workRoles:·[],␍
@repo/library:lint:biome:     141     │ - → → }␍
@repo/people:lint:biome:      85     │ - → → → → personKind:·"staff",␍

@repo/people:lint:biome:      86     │ - → → → }·as·PeopleDirectoryEntry;␍
@repo/library:lint:biome:     142     │ - → },␍
@repo/graphics:lint:biome:         6 │ + ····"baseUrl":·".",
@repo/library:lint:biome:     143     │ - ␍

@repo/people:lint:biome:      87     │ - → → }␍
@repo/graphics:lint:biome:         7 │ + ····"jsx":·"react-jsx"
@repo/graphics:lint:biome:         8 │ + ··},
@repo/graphics:lint:biome:         9 │ + ··"include":·["src/**/*"]

@repo/library:lint:biome:     144     │ - → /**␍
@repo/graphics:lint:biome:        10 │ + }
@repo/graphics:lint:biome:     11 11 │   
@repo/people:lint:biome:      88     │ - ␍

@repo/people:lint:biome:      89     │ - → → const·{·data:·bondRow,·error:·bondError·}·=·await·supabase␍
@repo/library:lint:biome:     145     │ - → ·*·Bulk·upsert·nodes·into·the·index.␍
@repo/library:lint:biome:     146     │ - → ·*/␍
@repo/graphics:lint:biome:   

@repo/people:lint:biome:      90     │ - → → → .from("bonds")␍
@repo/people:lint:biome:      91     │ - → → → .select("user_id,·entity_id,·entity_type,·capacity,·status")␍

@repo/library:lint:biome:     147     │ - → async·upsertNodes(nodes:·KnowledgeNodeIndex[])·{␍
@repo/graphics:lint:biome: 

@repo/people:lint:biome:      92     │ - → → → .eq("entity_type",·"SCHOOL")␍
@repo/people:lint:biome:      93     │ - → → → .eq("entity_id",·schoolId)␍
@repo/library:lint:biome:     148     │ - → → if·(!this.db)·return;␍
@repo/graphics:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/people:lint:biome:      94     │ - → → → .eq("user_id",·userId)␍
@repo/library:lint:biome:     149     │ - ␍
@repo/graphics:lint:biome: 
@repo/graphics:lint:biome:   × Some errors were emitted while running checks.
@repo/library:lint:biome:     150     │ - → → try·{␍

@repo/library:lint:biome:   415 more lines truncated
@repo/graphics:lint:biome:   
@repo/graphics:lint:biome: 
@repo/library:lint:biome:   

@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\database.web.ts:107:10 lint/suspicious/useIterableCallbackReturn ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × This callback passed to forEach() iterable method should not return a value.
@repo/library:lint:biome:   

@repo/library:lint:biome:     105 │ 			const store = transaction.objectStore(STORE_NAME);
@repo/library:lint:biome:     106 │ 
@repo/library:lint:biome:   > 107 │ 			nodes.forEach((node) => store.put(node));
@repo/library:lint:biome:         │ 			      ^^^^^^^
@repo/library:lint:biome:     108 │ 
@repo/library:lint:biome:     109 │ 			transaction.oncomplete = () => resolve();
@repo/library:lint:biome:   

@repo/library:lint:biome:   i Either remove this return or remove the returned value.
@repo/library:lint:biome:   
@repo/library:lint:biome:     105 │ 			const store = transaction.objectStore(STORE_NAME);
@repo/library:lint:biome:     106 │ 
@repo/library:lint:biome:   > 107 │ 			nodes.forEach((node) => store.put(node));
@repo/library:lint:biome:         │ 			                        ^^^^^^^^^^^^^^^
@repo/library:lint:biome:     108 │ 

@repo/library:lint:biome:     109 │ 			transaction.oncomplete = () => resolve();
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\database.web.ts:192:11 lint/suspicious/useIterableCallbackReturn ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × This callback passed to forEach() iterable method should not return a value.
@repo/library:lint:biome:   
@repo/library:lint:biome:     190 │ 			const store = transaction.objectStore(STORE_NAME);

@repo/library:lint:biome:     191 │ 
@repo/library:lint:biome:   > 192 │ 			layers.forEach((layer) =>
@repo/library:lint:biome:         │ 			       ^^^^^^^
@repo/library:lint:biome:     193 │ 				store.put({
@repo/library:lint:biome:     194 │ 					id: layer.id,
@repo/library:lint:biome:   

@repo/people:lint:biome:      95     │ - → → → .maybeSingle();␍

@repo/analytics:lint:biome:       1     │ - import·{␍
@repo/analytics:lint:biome:       2     │ - → ProgressRing,␍

@repo/analytics:lint:biome:       3     │ - → SimpleBarChart,␍
@repo/analytics:lint:biome:       4     │ - → SimpleLineChart,␍
@repo/analytics:lint:biome:       5     │ - → SimplePieChart,␍
@repo/analytics:lint:biome:       6     │ - }·from·"@repo/graphics/charts";␍
@repo/analytics:lint:biome:       7     │ - import·{·Box,·HStack,·Text·}·from·"@repo/ui/primitives";␍

@repo/analytics:lint:biome:       8     │ - import·{·colors·}·from·"@repo/ui/theme";␍
@repo/analytics:lint:biome:       9     │ - ␍
@repo/analytics:lint:biome:      10     │ - interface·AnalyticsChartProps·{␍
@repo/analytics:lint:biome:      11     │ - → title:·string;␍
@repo/analytics:lint:biome:      12     │ - → data:·{␍
@repo/analytics:lint:biome:      13     │ - → → label:·string;␍
@repo/analytics:lint:biome:      14     │ - → → value:·number;␍
@repo/analytics:lint:biome:      15     │ - → → color?:·string;␍
@repo/analytics:lint:biome:      16     │ - → }[];␍
@repo/analytics:lint:biome:      17     │ - → type?:·"bar"·|·"line"·|·"pie"·|·"progress";␍
@repo/analytics:lint:biome:      18     │ - → height?:·number;␍

@repo/analytics:lint:biome:      19     │ - → showValues?:·boolean;␍
@repo/analytics:lint:biome:      20     │ - → maxValue?:·number;␍
@repo/analytics:lint:biome:      21     │ - }␍
@repo/analytics:lint:biome:      22     │ - export·function·AnalyticsChart({␍
@repo/analytics:lint:biome:      23     │ - → title,␍
@repo/analytics:lint:biome:      24     │ - → data,␍
@repo/analytics:lint:biome:      25     │ - → type·=·"bar",␍
@repo/analytics:lint:biome:      26     │ - → height·=·200,␍
@repo/analytics:lint:biome:      27     │ - → showValues·=·true,␍
@repo/analytics:lint:biome:      28     │ - → maxValue,␍
@repo/analytics:lint:biome:      29     │ - }:·AnalyticsChartProps)·{␍

@repo/analytics:lint:biome:      30     │ - → switch·(type)·{␍
@repo/analytics:lint:biome:      31     │ - → → case·"bar":␍
@repo/analytics:lint:biome:      32     │ - → → → return·(␍
@repo/analytics:lint:biome:      33     │ - → → → → <SimpleBarChart␍
@repo/analytics:lint:biome:      34     │ - → → → → → title={title}␍
@repo/analytics:lint:biome:      35     │ - → → → → → data={data}␍
@repo/analytics:lint:biome:      36     │ - → → → → → height={height}␍

@repo/analytics:lint:biome:      37     │ - → → → → → showValues={showValues}␍
@repo/analytics:lint:biome:      38     │ - → → → → />␍
@repo/analytics:lint:biome:      39     │ - → → → );␍
@repo/analytics:lint:biome:      40     │ - → → case·"line":␍
@repo/analytics:lint:biome:      41     │ - → → → return·(␍
@repo/analytics:lint:biome:      42     │ - → → → → <SimpleLineChart␍
@repo/analytics:lint:biome:      43     │ - → → → → → title={title}␍
@repo/analytics:lint:biome:      44     │ - → → → → → data={data.map((datum)·=>·({·x:·datum.label,·y:·datum.value·}))}␍

@repo/analytics:lint:biome:      45     │ - → → → → → height={height}␍
@repo/analytics:lint:biome:      46     │ - → → → → → color={data[0]?.color}␍
@repo/analytics:lint:biome:      47     │ - → → → → />␍
@repo/analytics:lint:biome:      48     │ - → → → );␍
@repo/analytics:lint:biome:      49     │ - → → case·"pie":␍
@repo/analytics:lint:biome:      50     │ - → → → return·<SimplePieChart·title={title}·data={data}·size={height}·/>;␍
@repo/analytics:lint:biome:      51     │ - → → case·"progress":·{␍
@repo/analytics:lint:biome:      52     │ - → → → const·progressValue·=·data[0]?.value·??·0;␍
@repo/analytics:lint:biome:      53     │ - → → → const·progressMax·=·maxValue·??·100;␍

@repo/analytics:lint:biome:      54     │ - → → → return·(␍
@repo/analytics:lint:biome:      55     │ - → → → → <Box␍
@repo/analytics:lint:biome:      56     │ - → → → → → className="items-center·rounded-3xl·border·border-black/5·bg-white/70·px-4·py-4"␍
@repo/analytics:lint:biome:      57     │ - → → → → → style={{·height·}}␍
@repo/analytics:lint:biome:      58     │ - → → → → >␍
@repo/analytics:lint:biome:      59     │ - → → → → → {title·?·(␍
@repo/analytics:lint:biome:      60     │ - → → → → → → <Text␍

@repo/analytics:lint:biome:      61     │ - → → → → → → → className="mb-4·text-center·text-base·font-bold"␍
@repo/analytics:lint:biome:      62     │ - → → → → → → → style={{·color:·colors.text·}}␍
@repo/analytics:lint:biome:      63     │ - → → → → → → >␍
@repo/analytics:lint:biome:      64     │ - → → → → → → → {title}␍
@repo/analytics:lint:biome:      65     │ - → → → → → → </Text>␍
@repo/analytics:lint:biome:      66     │ - → → → → → )·:·null}␍
@repo/analytics:lint:biome:      67     │ - → → → → → <ProgressRing␍
@repo/analytics:lint:biome:      68     │ - → → → → → → value={progressValue}␍
@repo/analytics:lint:biome:      69     │ - → → → → → → max={progressMax}␍

@repo/analytics:lint:biome:      70     │ - → → → → → → size={Math.min(height,·150)}␍
@repo/analytics:lint:biome:      71     │ - → → → → → → color={data[0]?.color}␍
@repo/analytics:lint:biome:      72     │ - → → → → → → showLabel={true}␍
@repo/analytics:lint:biome:      73     │ - → → → → → />␍
@repo/analytics:lint:biome:      74     │ - → → → → → <Text␍
@repo/analytics:lint:biome:      75     │ - → → → → → → className="mt-3·text-center·text-sm"␍
@repo/analytics:lint:biome:      76     │ - → → → → → → style={{·color:·colors.text·}}␍
@repo/analytics:lint:biome:      77     │ - → → → → → >␍
@repo/analytics:lint:biome:      78     │ - → → → → → → {data[0]?.label}:·{progressValue}/{progressMax}␍

@repo/analytics:lint:biome:      79     │ - → → → → → </Text>␍
@repo/analytics:lint:biome:      80     │ - → → → → </Box>␍
@repo/analytics:lint:biome:      81     │ - → → → );␍
@repo/analytics:lint:biome:      82     │ - → → }␍
@repo/analytics:lint:biome:      83     │ - → → default:␍
@repo/analytics:lint:biome:      84     │ - → → → return·null;␍
@repo/analytics:lint:biome:      85     │ - → }␍
@repo/analytics:lint:biome:      86     │ - }␍
@repo/analytics:lint:biome:      87     │ - interface·MultiSeriesChartProps·{␍
@repo/analytics:lint:biome:      88     │ - → title:·string;␍
@repo/analytics:lint:biome:      89     │ - → series:·{␍
@repo/analytics:lint:biome:      90     │ - → → name:·string;␍

@repo/analytics:lint:biome:      91     │ - → → data:·{␍
@repo/analytics:lint:biome:      92     │ - → → → x:·string;␍
@repo/analytics:lint:biome:      93     │ - → → → y:·number;␍
@repo/analytics:lint:biome:      94     │ - → → }[];␍
@repo/analytics:lint:biome:      95     │ - → → color?:·string;␍

@repo/analytics:lint:biome:      96     │ - → }[];␍
@repo/analytics:lint:biome:      97     │ - → type?:·"line"·|·"bar";␍
@repo/analytics:lint:biome:      98     │ - → height?:·number;␍
@repo/analytics:lint:biome:      99     │ - }␍
@repo/analytics:lint:biome:     100     │ - export·function·MultiSeriesChart({␍
@repo/analytics:lint:biome:     101     │ - → title,␍
@repo/analytics:lint:biome:     102     │ - → series,␍

@repo/analytics:lint:biome:     103     │ - → type·=·"line",␍
@repo/analytics:lint:biome:     104     │ - → height·=·250,␍
@repo/analytics:lint:biome:     105     │ - }:·MultiSeriesChartProps)·{␍
@repo/analytics:lint:biome:     106     │ - → return·(␍
@repo/analytics:lint:biome:     107     │ - → → <Box␍
@repo/analytics:lint:biome:     108     │ - → → → className="rounded-3xl·border·border-black/5·bg-white/70·px-4·py-4"␍

@repo/analytics:lint:biome:     109     │ - → → → style={{·height·}}␍
@repo/analytics:lint:biome:     110     │ - → → >␍
@repo/analytics:lint:biome:     111     │ - → → → {title·?·(␍
@repo/analytics:lint:biome:     112     │ - → → → → <Text␍
@repo/analytics:lint:biome:     113     │ - → → → → → className="mb-4·text-center·text-base·font-bold"␍

@repo/analytics:lint:biome:     114     │ - → → → → → style={{·color:·colors.text·}}␍

@repo/analytics:lint:biome:     115     │ - → → → → >␍

@repo/analytics:lint:biome:     116     │ - → → → → → {title}␍

@repo/ui:lint:biome: src\__tests__\Input.test.tsx:36:28 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/analytics:lint:biome:     117     │ - → → → → </Text>␍

@repo/analytics:lint:biome:     118     │ - → → → )·:·null}␍

apps-edlove-web:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/library:lint:biome:   i Either remove this return or remove the returned value.
@repo/people:lint:biome:      96     │ - → → if·(bondError)·throw·bondError;␍

@repo/analytics:lint:biome:     119     │ - → → → <HStack·className="justify-around·gap-3">␍
@repo/analytics:lint:biome:     120     │ - → → → → {series.map((entry,·index)·=>·(␍
@repo/analytics:lint:biome:     121     │ - → → → → → <Box·key={index}·className="flex-1·items-center">␍
@repo/analytics:lint:biome:     122     │ - → → → → → → <Text␍
@repo/analytics:lint:biome:     123     │ - → → → → → → → className="mb-2·text-center·text-xs·font-semibold"␍
@repo/analytics:lint:biome:     124     │ - → → → → → → → style={{·color:·entry.color·||·colors.gurudeviBlue·}}␍
@repo/analytics:lint:biome:     125     │ - → → → → → → >␍
@repo/analytics:lint:biome:     126     │ - → → → → → → → {entry.name}␍
@repo/analytics:lint:biome:     127     │ - → → → → → → </Text>␍
@repo/analytics:lint:biome:     128     │ - → → → → → → {type·===·"line"·?·(␍
@repo/analytics:lint:biome:     129     │ - → → → → → → → <SimpleLineChart␍
@repo/analytics:lint:biome:     130     │ - → → → → → → → → data={entry.data}␍
@repo/analytics:lint:biome:     131     │ - → → → → → → → → height={height·-·60}␍
@repo/analytics:lint:biome:     132     │ - → → → → → → → → color={entry.color}␍
@repo/analytics:lint:biome:     133     │ - → → → → → → → />␍
@repo/analytics:lint:biome:     134     │ - → → → → → → )·:·(␍
@repo/analytics:lint:biome:     135     │ - → → → → → → → <SimpleBarChart␍
@repo/analytics:lint:biome:     136     │ - → → → → → → → → data={entry.data.map((datum)·=>·({␍
@repo/analytics:lint:biome:     137     │ - → → → → → → → → → label:·datum.x,␍
@repo/analytics:lint:biome:     138     │ - → → → → → → → → → value:·datum.y,␍
@repo/analytics:lint:biome:     139     │ - → → → → → → → → → color:·entry.color,␍
@repo/analytics:lint:biome:     140     │ - → → → → → → → → }))}␍
@repo/analytics:lint:biome:     141     │ - → → → → → → → → height={height·-·60}␍
@repo/analytics:lint:biome:     142     │ - → → → → → → → → showValues={false}␍
@repo/analytics:lint:biome:     143     │ - → → → → → → → />␍
@repo/analytics:lint:biome:     144     │ - → → → → → → )}␍
@repo/analytics:lint:biome:     145     │ - → → → → → </Box>␍
@repo/analytics:lint:biome:     146     │ - → → → → ))}␍
@repo/analytics:lint:biome:     147     │ - → → → </HStack>␍

@repo/analytics:lint:biome:     148     │ - → → </Box>␍
@repo/analytics:lint:biome:     149     │ - → );␍
@repo/analytics:lint:biome:     150     │ - }␍
@repo/analytics:lint:biome:   128 more lines truncated
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:      1    │ - import·{·type·ReactNode·}·from·"react";␍

@repo/analytics:lint:biome:      2    │ - interface·AnalyticsContextProps·{␍
@repo/analytics:lint:biome:      3    │ - → track:·(event:·string,·properties?:·any)·=>·void;␍
@repo/analytics:lint:biome:      4    │ - → identify:·(userId:·string,·properties?:·any)·=>·void;␍
@repo/analytics:lint:biome:      5    │ - → screen:·(name:·string,·properties?:·any)·=>·void;␍
@repo/analytics:lint:biome:      6    │ - → reset:·()·=>·void;␍
@repo/analytics:lint:biome:      7    │ - }␍
@repo/analytics:lint:biome:      8    │ - export·declare·function·useAnalyticsContext():·AnalyticsContextProps;␍
@repo/analytics:lint:biome:      9    │ - interface·Props·{␍
@repo/analytics:lint:biome:     10    │ - → children:·ReactNode;␍
@repo/analytics:lint:biome:     11    │ - → apiKey?:·string;␍
@repo/analytics:lint:biome:     12    │ - → enabled?:·boolean;␍
@repo/analytics:lint:biome:     13    │ - → options?:·{␍
@repo/analytics:lint:biome:     14    │ - → → host?:·string;␍
@repo/analytics:lint:biome:     15    │ - → → debug?:·boolean;␍

@repo/analytics:lint:biome:     16    │ - → };␍
@repo/analytics:lint:biome:     17    │ - }␍
@repo/analytics:lint:biome:     18    │ - export·declare·function·AnalyticsProvider({␍
@repo/analytics:lint:biome:     19    │ - → children,␍
@repo/analytics:lint:biome:     20    │ - → apiKey,␍
@repo/analytics:lint:biome:     21    │ - → enabled,␍
@repo/analytics:lint:biome:     22    │ - → options,␍
@repo/analytics:lint:biome:     23    │ - }:·Props):·import("react/jsx-runtime").JSX.Element;␍
@repo/analytics:lint:biome:     24    │ - //#·sourceMappingURL=AnalyticsProvider.d.ts.map␍
@repo/analytics:lint:biome:         1 │ + import·{·type·ReactNode·}·from·'react';

@repo/analytics:lint:biome:         2 │ + interface·AnalyticsContextProps·{
@repo/analytics:lint:biome:         3 │ + ··track:·(event:·string,·properties?:·any)·=>·void;
@repo/analytics:lint:biome:         4 │ + ··identify:·(userId:·string,·properties?:·any)·=>·void;
@repo/analytics:lint:biome:         5 │ + ··screen:·(name:·string,·properties?:·any)·=>·void;
@repo/analytics:lint:biome:         6 │ + ··reset:·()·=>·void;

@repo/analytics:lint:biome:         7 │ + }
@repo/analytics:lint:biome:         8 │ + export·declare·function·useAnalyticsContext():·AnalyticsContextProps;
@repo/analytics:lint:biome:         9 │ + interface·Props·{
@repo/analytics:lint:biome:        10 │ + ··children:·ReactNode;
@repo/analytics:lint:biome:        11 │ + ··apiKey?:·string;
@repo/analytics:lint:biome:        12 │ + ··enabled?:·boolean;
@repo/analytics:lint:biome:        13 │ + ··options?:·{

@repo/analytics:lint:biome:        14 │ + ····host?:·string;
@repo/analytics:lint:biome:        15 │ + ····debug?:·boolean;
@repo/analytics:lint:biome:        16 │ + ··};
@repo/analytics:lint:biome:        17 │ + }
@repo/analytics:lint:biome:        18 │ + export·declare·function·AnalyticsProvider({
@repo/analytics:lint:biome:        19 │ + ··children,
@repo/analytics:lint:biome:        20 │ + ··apiKey,
@repo/analytics:lint:biome:        21 │ + ··enabled,

@repo/analytics:lint:biome:        22 │ + ··options,
@repo/analytics:lint:biome:        23 │ + }:·Props):·import('react/jsx-runtime').JSX.Element;
@repo/analytics:lint:biome:        24 │ + //#·sourceMappingURL=AnalyticsProvider.d.ts.map
@repo/analytics:lint:biome:     25 25 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:      1    │ - import·{·PostHogProvider·as·NativePostHogProvider·}·from·"posthog-react-native";␍
@repo/analytics:lint:biome:      2    │ - import·{·createContext,·useContext·}·from·"react";␍
@repo/analytics:lint:biome:      3    │ - import·{·jsx·as·_jsx·}·from·"react/jsx-runtime";␍
@repo/analytics:lint:biome:      4    │ - ␍

@repo/analytics:lint:biome:      5    │ - const·AnalyticsContext·=·createContext(undefined);␍
@repo/analytics:lint:biome:      6    │ - export·function·useAnalyticsContext()·{␍
@repo/analytics:lint:biome:      7    │ - → const·context·=·useContext(AnalyticsContext);␍
@repo/analytics:lint:biome:      8    │ - → if·(!context)·{␍
@repo/analytics:lint:biome:      9    │ - → → throw·new·Error(␍
@repo/analytics:lint:biome:     10    │ - → → → "useAnalyticsContext·must·be·used·within·an·AnalyticsProvider",␍

@repo/analytics:lint:biome:     11    │ - → → );␍
@repo/analytics:lint:biome:     12    │ - → }␍
@repo/analytics:lint:biome:     13    │ - → return·context;␍
@repo/analytics:lint:biome:     14    │ - }␍
@repo/analytics:lint:biome:     15    │ - ␍
@repo/analytics:lint:biome:     16    │ - import·{·ActivityPulseProvider·}·from·"../context/ActivityPulseContext";␍
@repo/analytics:lint:biome:     17    │ - export·function·AnalyticsProvider({␍

@repo/analytics:lint:biome:     18    │ - → children,␍
@repo/analytics:lint:biome:     19    │ - → apiKey,␍
@repo/analytics:lint:biome:     20    │ - → enabled·=·true,␍
@repo/analytics:lint:biome:     21    │ - → options,␍
@repo/analytics:lint:biome:     22    │ - })·{␍
@repo/analytics:lint:biome:     23    │ - → if·(!apiKey·||·!enabled)·{␍
@repo/analytics:lint:biome:     24    │ - → → return·_jsx(ActivityPulseProvider,·{·children:·children·});␍

@repo/analytics:lint:biome:     25    │ - → }␍
@repo/analytics:lint:biome:     26    │ - → return·_jsx(NativePostHogProvider,·{␍
@repo/analytics:lint:biome:     27    │ - → → apiKey:·apiKey,␍
@repo/analytics:lint:biome:     28    │ - → → options:·{␍
@repo/analytics:lint:biome:     29    │ - → → → host:·options?.host,␍
@repo/analytics:lint:biome:     30    │ - → → },␍
@repo/analytics:lint:biome:     31    │ - → → autocapture:·false,␍

@repo/analytics:lint:biome:     32    │ - → → children:·_jsx(ActivityPulseProvider,·{·children:·children·}),␍
@repo/analytics:lint:biome:     33    │ - → });␍
@repo/analytics:lint:biome:     34    │ - }␍
@repo/analytics:lint:biome:         1 │ + import·{·PostHogProvider·as·NativePostHogProvider·}·from·'posthog-react-native';
@repo/analytics:lint:biome:         2 │ + import·{·createContext,·useContext·}·from·'react';

@repo/library:lint:biome:   

@repo/library:lint:biome:     192 │ 			layers.forEach((layer) =>

@repo/library:lint:biome:   > 193 │ 				store.put({

@repo/library:lint:biome:         │ 				^^^^^^^^^^^

@repo/library:lint:biome:   > 194 │ 					id: layer.id,

@repo/library:lint:biome:          ...

@repo/library:lint:biome:   > 207 │ 					updated_at: layer.updated_at,

@repo/library:lint:biome:   > 208 │ 				}),

@repo/library:lint:biome:         │ 				^^

@repo/library:lint:biome:     209 │ 			);

@repo/library:lint:biome:     210 │ 

@repo/library:lint:biome:   

@repo/library:lint:biome: 

@repo/library:lint:biome: src\api\database.web.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/library:lint:biome: 

@repo/library:lint:biome:   × Formatter would have printed the following content:

@repo/library:lint:biome:   

@repo/people:lint:biome:      97     │ - ␍
@repo/people:lint:biome:      98     │ - → → const·bond·=␍
@repo/people:lint:biome:      99     │ - → → → (bondRow·as·BondSeed·|·null)·??␍

@repo/people:lint:biome:     100     │ - → → → ({·user_id:·userId,·entity_id:·schoolId,·entity_type:·"SCHOOL",·capacity:·null·}·satisfies·BondSeed);␍
@repo/people:lint:biome:     101     │ - → → return·mapDirectoryEntry(userRow·as·User,·bond);␍
@repo/people:lint:biome:     102     │ - → },␍
@repo/people:lint:biome:     103     │ - → async·listStaff(schoolId:·string):·Promise<PeopleDirectoryEntry[]>·{␍
@repo/people:lint:biome:     104     │ - → → return·this.listBySchool(schoolId,·{·personKind:·"staff"·});␍
@repo/people:lint:biome:     105     │ - → },␍
@repo/people:lint:biome:     106     │ - → async·listStudents(schoolId:·string):·Promise<PeopleDirectoryEntry[]>·{␍
@repo/people:lint:biome:     107     │ - → → return·this.listBySchool(schoolId,·{·personKind:·"student"·});␍

@repo/people:lint:biome:     108     │ - → },␍
@repo/people:lint:biome:     109     │ - };␍
@repo/people:lint:biome:           1 │ + import·{·supabase·}·from·'@repo/core/api';
@repo/people:lint:biome:           2 │ + import·type·{·SchoolRole,·User,·WorkRole·}·from·'@repo/core/types';
@repo/people:lint:biome:           3 │ + export·interface·PeopleDirectoryEntry·extends·User·{
@repo/people:lint:biome:           4 │ + ··schoolRole:·SchoolRole·|·null;
@repo/people:lint:biome:           5 │ + ··workRoles:·WorkRole[];

@repo/people:lint:biome:           6 │ + ··personKind:·'staff'·|·'student';
@repo/people:lint:biome:           7 │ + }
@repo/people:lint:biome:           8 │ + interface·BondSeed·{
@repo/people:lint:biome:           9 │ + ··user_id:·string;
@repo/people:lint:biome:          10 │ + ··entity_id:·string;
@repo/people:lint:biome:          11 │ + ··entity_type:·string;
@repo/people:lint:biome:          12 │ + ··capacity:·string·|·null;

@repo/people:lint:biome:          13 │ + ··status?:·string·|·null;
@repo/people:lint:biome:          14 │ + }
@repo/people:lint:biome:          15 │ + function·mapDirectoryEntry(user:·User,·bond:·BondSeed):·PeopleDirectoryEntry·{
@repo/people:lint:biome:          16 │ + ··const·userWithTimestamps·=·{
@repo/people:lint:biome:          17 │ + ····...user,
@repo/people:lint:biome:          18 │ + ····created_at:·user.created_at·||·new·Date().toISOString(),
@repo/people:lint:biome:          19 │ + ····updated_at:·user.updated_at·||·new·Date().toISOString(),

@repo/people:lint:biome:          20 │ + ··};
@repo/people:lint:biome:          21 │ + ··const·schoolRole·=·(bond.capacity·as·unknown·as·SchoolRole)·??·null;
@repo/people:lint:biome:          22 │ + ··return·{
@repo/people:lint:biome:          23 │ + ····...userWithTimestamps,
@repo/people:lint:biome:          24 │ + ····schoolRole,
@repo/people:lint:biome:          25 │ + ····workRoles:·[],
@repo/people:lint:biome:          26 │ + ····personKind:·schoolRole·===·'student'·?·'student'·:·'staff',
@repo/people:lint:biome:          27 │ + ··}·as·PeopleDirectoryEntry;
@repo/people:lint:biome:          28 │ + }

@repo/people:lint:biome:          29 │ + export·const·peopleDirectoryAPI·=·{
@repo/people:lint:biome:          30 │ + ··async·listBySchool(
@repo/people:lint:biome:          31 │ + ····schoolId:·string,
@repo/people:lint:biome:          32 │ + ····options?:·{
@repo/people:lint:biome:          33 │ + ······personKind?:·'all'·|·'staff'·|·'student';
@repo/people:lint:biome:          34 │ + ····},
@repo/people:lint:biome:          35 │ + ··):·Promise<PeopleDirectoryEntry[]>·{
@repo/people:lint:biome:          36 │ + ····const·{·data:·bondRows,·error:·bondError·}·=·await·supabase

@repo/people:lint:biome:          37 │ + ······.from('bonds')
@repo/people:lint:biome:          38 │ + ······.select('user_id,·entity_id,·entity_type,·capacity,·status')
@repo/people:lint:biome:          39 │ + ······.eq('entity_type',·'SCHOOL')
@repo/people:lint:biome:          40 │ + ······.eq('entity_id',·schoolId);
@repo/people:lint:biome:          41 │ + ····if·(bondError)·throw·bondError;
@repo/people:lint:biome:   72 more lines truncated
@repo/people:lint:biome:   
@repo/people:lint:biome: 

@repo/people:lint:biome: src\feedback.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/people:lint:biome:      1    │ - import·{·supabase·}·from·"@repo/core/api";␍
@repo/people:lint:biome:      2    │ - import·{·handleAPIError·}·from·"@repo/core/logic";␍
@repo/people:lint:biome:      3    │ - ␍

@repo/people:lint:biome:      4    │ - export·interface·TeacherSentEcho·{␍
@repo/people:lint:biome:      5    │ - → id:·string;␍
@repo/people:lint:biome:      6    │ - → category:·string;␍
@repo/people:lint:biome:      7    │ - → content:·string;␍
@repo/people:lint:biome:      8    │ - → priority:·string;␍
@repo/people:lint:biome:      9    │ - → is_read:·boolean;␍
@repo/people:lint:biome:     10    │ - → principal_response?:·string;␍
@repo/people:lint:biome:     11    │ - → responded_at?:·string;␍
@repo/people:lint:biome:     12    │ - → created_at:·string;␍
@repo/people:lint:biome:     13    │ - }␍
@repo/people:lint:biome:     14    │ - ␍
@repo/people:lint:biome:     15    │ - export·const·teacherFeedbackAPI·=·{␍
@repo/people:lint:biome:     16    │ - → async·submitTeacherFeedback(input:·{␍

@repo/people:lint:biome:     17    │ - → → schoolId:·string;␍
@repo/people:lint:biome:     18    │ - → → teacherId:·string;␍
@repo/people:lint:biome:     19    │ - → → category:·string;␍
@repo/people:lint:biome:     20    │ - → → content:·string;␍
@repo/people:lint:biome:     21    │ - → → priority:·"low"·|·"medium"·|·"high";␍
@repo/people:lint:biome:     22    │ - → }):·Promise<boolean>·{␍
@repo/people:lint:biome:     23    │ - → → try·{␍
@repo/people:lint:biome:     24    │ - → → → const·{·error·}·=·await·supabase.from("school_echo_feedback").insert({␍

@repo/people:lint:biome:     25    │ - → → → → school_id:·input.schoolId,␍
@repo/people:lint:biome:     26    │ - → → → → teacher_id:·input.teacherId,␍
@repo/people:lint:biome:     27    │ - → → → → source:·"teacher",␍
@repo/people:lint:biome:     28    │ - → → → → category:·input.category,␍
@repo/people:lint:biome:     29    │ - → → → → content:·input.content,␍
@repo/people:lint:biome:     30    │ - → → → → priority:·input.priority,␍
@repo/people:lint:biome:     31    │ - → → → → is_read:·false,␍

@repo/people:lint:biome:     32    │ - → → → });␍
@repo/people:lint:biome:     33    │ - ␍
@repo/people:lint:biome:     34    │ - → → → if·(error)·throw·error;␍
@repo/people:lint:biome:     35    │ - → → → return·true;␍
@repo/people:lint:biome:     36    │ - → → }·catch·(error)·{␍
@repo/people:lint:biome:     37    │ - → → → handleAPIError(error);␍
@repo/people:lint:biome:     38    │ - → → → return·false;␍
@repo/people:lint:biome:     39    │ - → → }␍

@repo/people:lint:biome:     40    │ - → },␍
@repo/people:lint:biome:     41    │ - ␍
@repo/people:lint:biome:     42    │ - → async·listSentEchoes(␍
@repo/people:lint:biome:     43    │ - → → teacherId:·string,␍
@repo/people:lint:biome:     44    │ - → → limit·=·10,␍
@repo/people:lint:biome:     45    │ - → ):·Promise<TeacherSentEcho[]>·{␍

@repo/ui:lint:biome:   i The computed expression can be simplified without the use of a string literal.

@repo/ui:lint:biome:   

@repo/analytics:lint:biome:         3 │ + import·{·jsx·as·_jsx·}·from·'react/jsx-runtime';

@repo/analytics:lint:biome:         4 │ + 

@repo/analytics:lint:biome:         5 │ + const·AnalyticsContext·=·createContext(undefined);

@repo/analytics:lint:biome:         6 │ + export·function·useAnalyticsContext()·{

@repo/analytics:lint:biome:         7 │ + ··const·context·=·useContext(AnalyticsContext);

@repo/analytics:lint:biome:         8 │ + ··if·(!context)·{

@repo/analytics:lint:biome:         9 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');

@repo/analytics:lint:biome:        10 │ + ··}

@repo/analytics:lint:biome:        11 │ + ··return·context;

@repo/analytics:lint:biome:        12 │ + }

@repo/analytics:lint:biome:        13 │ + 

@repo/analytics:lint:biome:        14 │ + import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';

@repo/analytics:lint:biome:        15 │ + export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·})·{

@repo/people:lint:biome:     46    │ - → → if·(!teacherId)·return·[];␍

@repo/people:lint:biome:     47    │ - ␍

@repo/people:lint:biome:     48    │ - → → const·{·data,·error·}·=·await·supabase␍

@repo/people:lint:biome:     49    │ - → → → .from("school_echo_feedback")␍

@repo/people:lint:biome:     50    │ - → → → .select(␍

@repo/people:lint:biome:     51    │ - → → → → "id,·category,·content,·priority,·is_read,·principal_response,·responded_at,·created_at",␍

@repo/people:lint:biome:     52    │ - → → → )␍

@repo/people:lint:biome:     53    │ - → → → .eq("teacher_id",·teacherId)␍

@repo/people:lint:biome:     54    │ - → → → .order("created_at",·{·ascending:·false·})␍

@repo/people:lint:biome:     55    │ - → → → .limit(limit);␍

@repo/people:lint:biome:     56    │ - ␍

@repo/people:lint:biome:     57    │ - → → if·(error)·{␍

@repo/people:lint:biome:     58    │ - → → → handleAPIError(error);␍

@repo/people:lint:biome:     59    │ - → → → return·[];␍

@repo/people:lint:biome:     60    │ - → → }␍

@repo/people:lint:biome:     61    │ - ␍

@repo/people:lint:biome:     62    │ - → → return·(data·??·[])·as·TeacherSentEcho[];␍

@repo/people:lint:biome:     63    │ - → },␍

@repo/people:lint:biome:     64    │ - };␍

@repo/people:lint:biome:         1 │ + import·{·supabase·}·from·'@repo/core/api';

@repo/people:lint:biome:         2 │ + import·{·handleAPIError·}·from·'@repo/core/logic';

@repo/people:lint:biome:         3 │ + 

@repo/ui:lint:biome:     34 │     // Check if it has the danger border class (simulation)

@repo/ui:lint:biome:     35 │     const container = getByTestId('input-container');

@repo/ui:lint:biome:   > 36 │     expect(container.props['className']).toContain('border-phase-danger');

@repo/ui:lint:biome:        │                            ^^^^^^^^^^^

@repo/ui:lint:biome:     37 │   });

@repo/ui:lint:biome:     38 │ 

@repo/ui:lint:biome:   

@repo/ui:lint:biome:   i Unsafe fix: Use a literal key instead.

@repo/ui:lint:biome:   

@repo/ui:lint:biome:     34 34 │       // Check if it has the danger border class (simulation)

@repo/analytics:lint:biome:        16 │ + ··if·(!apiKey·||·!enabled)·{

@repo/library:lint:biome:       1     │ - //·Knowledge·Database·Manager·(Web·—·IndexedDB)␍

@repo/library:lint:biome:       2     │ - ␍

@repo/library:lint:biome:       3     │ - const·DB_NAME·=·"gurudevi_library";␍

@repo/library:lint:biome:       4     │ - const·STORE_NAME·=·"knowledge_index";␍

@repo/ui:lint:biome:     35 35 │       const container = getByTestId('input-container');

@repo/ui:lint:biome:     36    │ - ····expect(container.props['className']).toContain('border-phase-danger');

@repo/ui:lint:biome:        36 │ + ····expect(container.props.className).toContain('border-phase-danger');

@repo/ui:lint:biome:     37 37 │     });

@repo/ui:lint:biome:     38 38 │   

@repo/ui:lint:biome:   
@repo/ui:lint:biome: 

@repo/ui:lint:biome: src\__tests__\Input.test.tsx:46:53 lint/complexity/useLiteralKeys  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━

@repo/ui:lint:biome: 

@repo/ui:lint:biome:   i The computed expression can be simplified without the use of a string literal.
@repo/ui:lint:biome:   

@repo/ui:lint:biome:     44 │     );

@repo/analytics:lint:biome:        17 │ + ····return·_jsx(ActivityPulseProvider,·{·children:·children·});

@repo/analytics:lint:biome:        18 │ + ··}

@repo/analytics:lint:biome:        19 │ + ··return·_jsx(NativePostHogProvider,·{

@repo/people:lint:biome:         4 │ + export·interface·TeacherSentEcho·{

@repo/ui:lint:biome:     45 │ 

@repo/ui:lint:biome:   > 46 │     expect(getByPlaceholderText('Enter name').props['editable']).toBe(false);

@repo/ui:lint:biome:        │                                                     ^^^^^^^^^^

@repo/ui:lint:biome:     47 │   });

@repo/ui:lint:biome:     48 │ 

@repo/ui:lint:biome:   

@repo/ui:lint:biome:   i Unsafe fix: Use a literal key instead.

@repo/ui:lint:biome:   

@repo/ui:lint:biome:     44 44 │       );

@repo/ui:lint:biome:     45 45 │   

@repo/ui:lint:biome:     46    │ - ····expect(getByPlaceholderText('Enter·name').props['editable']).toBe(false);

@repo/ui:lint:biome:        46 │ + ····expect(getByPlaceholderText('Enter·name').props.editable).toBe(false);

@repo/ui:lint:biome:     47 47 │     });

@repo/ui:lint:biome:     48 48 │   
@repo/ui:lint:biome:   

@repo/ui:lint:biome: 

@repo/ui:lint:biome: src\__tests__\Actionsheet.test.tsx:34:13 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━

@repo/ui:lint:biome: 

@repo/ui:lint:biome:   ! This variable getByTestId is unused.

@repo/ui:lint:biome:   

@repo/ui:lint:biome:     32 │   it('calls onClose when backdrop/overlay is pressed', async () => {

@repo/ui:lint:biome:     33 │     const onClose = jest.fn();

@repo/ui:lint:biome:   > 34 │     const { getByTestId } = await render(

@repo/ui:lint:biome:        │             ^^^^^^^^^^^

@repo/library:lint:biome:       5     │ - const·SYNC_STORE·=·"sync_state";␍

@repo/people:lint:biome:         5 │ + ··id:·string;

@repo/analytics:lint:biome:        20 │ + ····apiKey:·apiKey,
@repo/analytics:lint:biome:        21 │ + ····options:·{
@repo/analytics:lint:biome:        22 │ + ······host:·options?.host,
@repo/analytics:lint:biome:        23 │ + ····},
@repo/analytics:lint:biome:        24 │ + ····autocapture:·false,
@repo/analytics:lint:biome:        25 │ + ····children:·_jsx(ActivityPulseProvider,·{·children:·children·}),
@repo/analytics:lint:biome:        26 │ + ··});

@repo/analytics:lint:biome:        27 │ + }
@repo/analytics:lint:biome:     35 28 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome:      1    │ - import·{·PostHogProvider·as·NativePostHogProvider·}·from·"posthog-react-native";␍
@repo/analytics:lint:biome:      2    │ - import·{·createContext,·type·ReactNode,·useContext·}·from·"react";␍
@repo/analytics:lint:biome:      3    │ - ␍

@repo/analytics:lint:biome:      4    │ - interface·AnalyticsContextProps·{␍
@repo/analytics:lint:biome:      5    │ - → track:·(event:·string,·properties?:·any)·=>·void;␍
@repo/analytics:lint:biome:      6    │ - → identify:·(userId:·string,·properties?:·any)·=>·void;␍
@repo/analytics:lint:biome:      7    │ - → screen:·(name:·string,·properties?:·any)·=>·void;␍
@repo/analytics:lint:biome:      8    │ - → reset:·()·=>·void;␍

@repo/analytics:lint:biome:      9    │ - }␍
@repo/analytics:lint:biome:     10    │ - ␍
@repo/analytics:lint:biome:     11    │ - const·AnalyticsContext·=·createContext<AnalyticsContextProps·|·undefined>(␍
@repo/analytics:lint:biome:     12    │ - → undefined,␍
@repo/analytics:lint:biome:     13    │ - );␍
@repo/analytics:lint:biome:     14    │ - ␍
@repo/analytics:lint:biome:     15    │ - export·function·useAnalyticsContext()·{␍

@repo/analytics:lint:biome:     16    │ - → const·context·=·useContext(AnalyticsContext);␍
@repo/analytics:lint:biome:     17    │ - → if·(!context)·{␍
@repo/analytics:lint:biome:     18    │ - → → throw·new·Error(␍
@repo/analytics:lint:biome:     19    │ - → → → "useAnalyticsContext·must·be·used·within·an·AnalyticsProvider",␍
@repo/analytics:lint:biome:     20    │ - → → );␍
@repo/analytics:lint:biome:     21    │ - → }␍
@repo/analytics:lint:biome:     22    │ - → return·context;␍
@repo/analytics:lint:biome:     23    │ - }␍

@repo/analytics:lint:biome:     24    │ - ␍
@repo/analytics:lint:biome:     25    │ - interface·Props·{␍
@repo/analytics:lint:biome:     26    │ - → children:·ReactNode;␍
@repo/analytics:lint:biome:     27    │ - → apiKey?:·string;␍
@repo/analytics:lint:biome:     28    │ - → enabled?:·boolean;␍
@repo/analytics:lint:biome:     29    │ - → options?:·{␍
@repo/analytics:lint:biome:     30    │ - → → host?:·string;␍

@repo/analytics:lint:biome:     31    │ - → → debug?:·boolean;␍
@repo/analytics:lint:biome:     32    │ - → };␍
@repo/analytics:lint:biome:     33    │ - }␍
@repo/analytics:lint:biome:     34    │ - ␍
@repo/analytics:lint:biome:     35    │ - import·{·ActivityPulseProvider·}·from·"../context/ActivityPulseContext";␍

@repo/analytics:lint:biome:     36    │ - ␍
@repo/analytics:lint:biome:     37    │ - export·function·AnalyticsProvider({␍
@repo/analytics:lint:biome:     38    │ - → children,␍
@repo/analytics:lint:biome:     39    │ - → apiKey,␍
@repo/analytics:lint:biome:     40    │ - → enabled·=·true,␍

@repo/analytics:lint:biome:     41    │ - → options,␍
@repo/analytics:lint:biome:     42    │ - }:·Props)·{␍
@repo/analytics:lint:biome:     43    │ - → if·(!apiKey·||·!enabled)·{␍
@repo/analytics:lint:biome:     44    │ - → → return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;␍

@repo/analytics:lint:biome:     45    │ - → }␍
@repo/analytics:lint:biome:     46    │ - ␍
@repo/analytics:lint:biome:     47    │ - → return·(␍
@repo/analytics:lint:biome:     48    │ - → → <NativePostHogProvider␍

@repo/analytics:lint:biome:     49    │ - → → → apiKey={apiKey}␍
@repo/analytics:lint:biome:     50    │ - → → → options={{␍
@repo/analytics:lint:biome:     51    │ - → → → → host:·options?.host,␍
@repo/analytics:lint:biome:     52    │ - → → → }}␍

@repo/analytics:lint:biome:     53    │ - → → → autocapture={false}␍
@repo/analytics:lint:biome:     54    │ - → → >␍
@repo/analytics:lint:biome:     55    │ - → → → <ActivityPulseProvider>{children}</ActivityPulseProvider>␍
@repo/analytics:lint:biome:     56    │ - → → </NativePostHogProvider>␍
@repo/analytics:lint:biome:     57    │ - → );␍
@repo/analytics:lint:biome:     58    │ - }␍
@repo/analytics:lint:biome:         1 │ + import·{·PostHogProvider·as·NativePostHogProvider·}·from·'posthog-react-native';
@repo/analytics:lint:biome:         2 │ + import·{·createContext,·type·ReactNode,·useContext·}·from·'react';
@repo/analytics:lint:biome:         3 │ + 
@repo/analytics:lint:biome:         4 │ + interface·AnalyticsContextProps·{
@repo/analytics:lint:biome:         5 │ + ··track:·(event:·string,·properties?:·any)·=>·void;
@repo/analytics:lint:biome:         6 │ + ··identify:·(userId:·string,·properties?:·any)·=>·void;

@repo/analytics:lint:biome:         7 │ + ··screen:·(name:·string,·properties?:·any)·=>·void;
@repo/analytics:lint:biome:         8 │ + ··reset:·()·=>·void;
@repo/analytics:lint:biome:         9 │ + }
@repo/analytics:lint:biome:        10 │ + 
@repo/analytics:lint:biome:        11 │ + const·AnalyticsContext·=·createContext<AnalyticsContextProps·|·undefined>(undefined);
@repo/analytics:lint:biome:        12 │ + 
@repo/analytics:lint:biome:        13 │ + export·function·useAnalyticsContext()·{
@repo/analytics:lint:biome:        14 │ + ··const·context·=·useContext(AnalyticsContext);

@repo/analytics:lint:biome:        15 │ + ··if·(!context)·{
@repo/analytics:lint:biome:        16 │ + ····throw·new·Error('useAnalyticsContext·must·be·used·within·an·AnalyticsProvider');
@repo/analytics:lint:biome:        17 │ + ··}
@repo/analytics:lint:biome:        18 │ + ··return·context;
@repo/analytics:lint:biome:        19 │ + }
@repo/analytics:lint:biome:        20 │ + 
@repo/analytics:lint:biome:        21 │ + interface·Props·{

@repo/analytics:lint:biome:        22 │ + ··children:·ReactNode;
@repo/analytics:lint:biome:        23 │ + ··apiKey?:·string;
@repo/analytics:lint:biome:        24 │ + ··enabled?:·boolean;
@repo/analytics:lint:biome:        25 │ + ··options?:·{
@repo/analytics:lint:biome:        26 │ + ····host?:·string;
@repo/analytics:lint:biome:        27 │ + ····debug?:·boolean;
@repo/analytics:lint:biome:        28 │ + ··};

@repo/analytics:lint:biome:        29 │ + }
@repo/analytics:lint:biome:        30 │ + 
@repo/analytics:lint:biome:        31 │ + import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';
@repo/analytics:lint:biome:        32 │ + 
@repo/analytics:lint:biome:        33 │ + export·function·AnalyticsProvider({·children,·apiKey,·enabled·=·true,·options·}:·Props)·{

@repo/analytics:lint:biome:        34 │ + ··if·(!apiKey·||·!enabled)·{
@repo/analytics:lint:biome:        35 │ + ····return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;
@repo/analytics:lint:biome:        36 │ + ··}
@repo/analytics:lint:biome:        37 │ + 
@repo/analytics:lint:biome:        38 │ + ··return·(
@repo/analytics:lint:biome:        39 │ + ····<NativePostHogProvider

@repo/analytics:lint:biome:        40 │ + ······apiKey={apiKey}
@repo/analytics:lint:biome:        41 │ + ······options={{
@repo/analytics:lint:biome:        42 │ + ········host:·options?.host,
@repo/analytics:lint:biome:        43 │ + ······}}
@repo/analytics:lint:biome:        44 │ + ······autocapture={false}

@repo/analytics:lint:biome:        45 │ + ····>
@repo/analytics:lint:biome:        46 │ + ······<ActivityPulseProvider>{children}</ActivityPulseProvider>
@repo/analytics:lint:biome:        47 │ + ····</NativePostHogProvider>
@repo/analytics:lint:biome:        48 │ + ··);
@repo/analytics:lint:biome:        49 │ + }

@repo/analytics:lint:biome:     59 50 │   
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\AnalyticsProvider.web.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/ui:lint:biome:     35 │       <Actionsheet isOpen={true} onClose={onClose}>

@repo/library:lint:biome:       6     │ - const·DB_VERSION·=·1;␍

@repo/library:lint:biome:       7     │ - ␍

@repo/people:lint:biome:         6 │ + ··category:·string;

@repo/people:lint:biome:         7 │ + ··content:·string;

@repo/people:lint:biome:         8 │ + ··priority:·string;

@repo/people:lint:biome:         9 │ + ··is_read:·boolean;

@repo/people:lint:biome:        10 │ + ··principal_response?:·string;

@repo/people:lint:biome:        11 │ + ··responded_at?:·string;

@repo/people:lint:biome:        12 │ + ··created_at:·string;

@repo/people:lint:biome:        13 │ + }

@repo/people:lint:biome:        14 │ + 

@repo/ui:lint:biome:     36 │         <ActionsheetContent>
@repo/ui:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·{·type·ReactNode·}·from·"react";␍

@repo/analytics:lint:biome:      2    │ - interface·Props·{␍

@repo/analytics:lint:biome:      3    │ - → children:·ReactNode;␍

@repo/analytics:lint:biome:      4    │ - → apiKey?:·string;␍

@repo/analytics:lint:biome:      5    │ - → options?:·{␍

@repo/analytics:lint:biome:      6    │ - → → host?:·string;␍

@repo/people:lint:biome:        15 │ + export·const·teacherFeedbackAPI·=·{

@repo/people:lint:biome:        16 │ + ··async·submitTeacherFeedback(input:·{

@repo/people:lint:biome:        17 │ + ····schoolId:·string;

@repo/people:lint:biome:        18 │ + ····teacherId:·string;

@repo/people:lint:biome:        19 │ + ····category:·string;

@repo/people:lint:biome:        20 │ + ····content:·string;

@repo/people:lint:biome:        21 │ + ····priority:·'low'·|·'medium'·|·'high';

@repo/people:lint:biome:        22 │ + ··}):·Promise<boolean>·{

@repo/people:lint:biome:        23 │ + ····try·{

@repo/people:lint:biome:        24 │ + ······const·{·error·}·=·await·supabase.from('school_echo_feedback').insert({

@repo/people:lint:biome:        25 │ + ········school_id:·input.schoolId,

@repo/people:lint:biome:        26 │ + ········teacher_id:·input.teacherId,

@repo/people:lint:biome:        27 │ + ········source:·'teacher',

@repo/people:lint:biome:        28 │ + ········category:·input.category,

@repo/people:lint:biome:        29 │ + ········content:·input.content,

@repo/people:lint:biome:        30 │ + ········priority:·input.priority,

@repo/people:lint:biome:        31 │ + ········is_read:·false,

@repo/people:lint:biome:        32 │ + ······});

@repo/people:lint:biome:        33 │ + 

@repo/people:lint:biome:        34 │ + ······if·(error)·throw·error;

@repo/people:lint:biome:        35 │ + ······return·true;

@repo/people:lint:biome:        36 │ + ····}·catch·(error)·{

@repo/people:lint:biome:        37 │ + ······handleAPIError(error);

@repo/people:lint:biome:        38 │ + ······return·false;

@repo/analytics:lint:biome:      7    │ - → → debug?:·boolean;␍

@repo/analytics:lint:biome:      8    │ - → };␍

@repo/analytics:lint:biome:      9    │ - }␍

@repo/library:lint:biome:       8     │ - export·interface·KnowledgeNodeIndex·{␍

@repo/people:lint:biome:        39 │ + ····}

@repo/analytics:lint:biome:     10    │ - export·declare·function·AnalyticsProvider({␍

@repo/ui:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
@repo/ui:lint:biome:   

@repo/people:lint:biome:        40 │ + ··},
@repo/ui:lint:biome: 

@repo/people:lint:biome:        41 │ + 

@repo/people:lint:biome:        42 │ + ··async·listSentEchoes(teacherId:·string,·limit·=·10):·Promise<TeacherSentEcho[]>·{

@repo/people:lint:biome:        43 │ + ····if·(!teacherId)·return·[];

@repo/people:lint:biome:        44 │ + 

@repo/people:lint:biome:        45 │ + ····const·{·data,·error·}·=·await·supabase

@repo/people:lint:biome:        46 │ + ······.from('school_echo_feedback')

@repo/people:lint:biome:        47 │ + ······.select(

@repo/people:lint:biome:        48 │ + ········'id,·category,·content,·priority,·is_read,·principal_response,·responded_at,·created_at',

@repo/people:lint:biome:        49 │ + ······)

@repo/people:lint:biome:        50 │ + ······.eq('teacher_id',·teacherId)

@repo/analytics:lint:biome:     11    │ - → children,␍

@repo/analytics:lint:biome:     12    │ - → apiKey,␍

@repo/analytics:lint:biome:     13    │ - → options,␍

@repo/analytics:lint:biome:     14    │ - }:·Props):·import("react/jsx-runtime").JSX.Element;␍

@repo/library:lint:biome:       9     │ - → id:·string;␍

@repo/library:lint:biome:      10     │ - → type:·string;␍

@repo/library:lint:biome:      11     │ - → content_type:·string·|·null;␍

@repo/library:lint:biome:      12     │ - → title_si:·string·|·null;␍

@repo/people:lint:biome:        51 │ + ······.order('created_at',·{·ascending:·false·})

@repo/people:lint:biome:        52 │ + ······.limit(limit);

@repo/people:lint:biome:        53 │ + 

@repo/library:lint:biome:      13     │ - → title_ta:·string·|·null;␍

@repo/library:lint:biome:      14     │ - → title_en:·string·|·null;␍

@repo/library:lint:biome:      15     │ - → tags:·string·|·null;␍

@repo/library:lint:biome:      16     │ - → map_x:·number·|·null;␍

@repo/library:lint:biome:      17     │ - → map_y:·number·|·null;␍

@repo/people:lint:biome:        54 │ + ····if·(error)·{

@repo/people:lint:biome:        55 │ + ······handleAPIError(error);

@repo/people:lint:biome:        56 │ + ······return·[];

@repo/analytics:lint:biome:     15    │ - //#·sourceMappingURL=AnalyticsProvider.web.d.ts.map␍

@repo/library:lint:biome:      18     │ - → latitude:·number·|·null;␍

@repo/library:lint:biome:      19     │ - → longitude:·number·|·null;␍

@repo/library:lint:biome:      20     │ - → parent_id:·string·|·null;␍

@repo/library:lint:biome:      21     │ - → island_id:·string·|·null;␍

@repo/library:lint:biome:      22     │ - → updated_at:·number;␍

@repo/ui:lint:biome: src\__tests__\Progress.test.tsx:6:13 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/ui:lint:biome:   ! This variable getByTestId is unused.

@repo/ui:lint:biome:   

@repo/people:lint:biome:        57 │ + ····}

@repo/people:lint:biome:        58 │ + 

@repo/people:lint:biome:        59 │ + ····return·(data·??·[])·as·TeacherSentEcho[];

@repo/people:lint:biome:        60 │ + ··},

@repo/people:lint:biome:        61 │ + };

@repo/library:lint:biome:      23     │ - }␍

@repo/people:lint:biome:     65 62 │   

@repo/people:lint:biome:   

@repo/people:lint:biome: 

@repo/people:lint:biome: src\hooks\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

@repo/people:lint:biome:   × Formatter would have printed the following content:

@repo/people:lint:biome:   

@repo/people:lint:biome:     1   │ - export·*·from·"./useStaffPresence";␍

@repo/people:lint:biome:       1 │ + export·*·from·'./useStaffPresence';

@repo/people:lint:biome:     2 2 │   
@repo/people:lint:biome:   
@repo/people:lint:biome: 

@repo/people:lint:biome: src\hooks\useStaffPresence.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 

@repo/analytics:lint:biome:         1 │ + import·{·type·ReactNode·}·from·'react';

@repo/library:lint:biome:      24     │ - ␍

@repo/library:lint:biome:      25     │ - /**␍

@repo/library:lint:biome:      26     │ - ·*·Knowledge·Database·Manager·(Web·\u2014·IndexedDB)␍

@repo/ui:lint:biome:     4 │ describe('Progress Component (Robustness)', () => {

@repo/ui:lint:biome:     5 │   it('renders correctly with value', async () => {

@repo/ui:lint:biome:   > 6 │     const { getByTestId } = await render(

@repo/analytics:lint:biome:         2 │ + interface·Props·{

@repo/analytics:lint:biome:         3 │ + ··children:·ReactNode;

@repo/analytics:lint:biome:         4 │ + ··apiKey?:·string;

@repo/analytics:lint:biome:         5 │ + ··options?:·{

@repo/analytics:lint:biome:         6 │ + ····host?:·string;

@repo/analytics:lint:biome:         7 │ + ····debug?:·boolean;

@repo/analytics:lint:biome:         8 │ + ··};

@repo/analytics:lint:biome:         9 │ + }

@repo/analytics:lint:biome:        10 │ + export·declare·function·AnalyticsProvider({

@repo/analytics:lint:biome:        11 │ + ··children,

@repo/analytics:lint:biome:        12 │ + ··apiKey,

@repo/analytics:lint:biome:        13 │ + ··options,

@repo/analytics:lint:biome:        14 │ + }:·Props):·import('react/jsx-runtime').JSX.Element;

@repo/analytics:lint:biome:        15 │ + //#·sourceMappingURL=AnalyticsProvider.web.d.ts.map

@repo/analytics:lint:biome:     16 16 │   

@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 

@repo/analytics:lint:biome: src\components\AnalyticsProvider.web.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/library:lint:biome:      27     │ - ·*·High-fidelity·un-shimming:·Using·browser-native·standards·for·local·state.␍

@repo/library:lint:biome:      28     │ - ·*/␍

@repo/library:lint:biome:      29     │ - export·const·knowledgeDB·=·{␍

@repo/ui:lint:biome:       │             ^^^^^^^^^^^

@repo/ui:lint:biome:     7 │       <Progress value={50} testID="progress">

@repo/ui:lint:biome:     8 │         <ProgressFilledTrack testID="filled-track" />
@repo/ui:lint:biome:   

@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   

@repo/graphics:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/analytics:lint:biome:   × Formatter would have printed the following content:

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:      1    │ - import·{·type·ReactNode,·useEffect·}·from·"react";␍

@repo/analytics:lint:biome:      2    │ - import·{·posthogAnalytics·}·from·"../engine/PostHogAnalytics.web";␍

@repo/analytics:lint:biome:      3    │ - ␍

@repo/library:lint:biome:      30     │ - → db:·null·as·IDBDatabase·|·null,␍

@repo/people:lint:biome:       1     │ - import·{·growthSignalsAPI,·supabase·}·from·"@repo/core/api";␍

@repo/analytics:lint:biome:      4    │ - interface·Props·{␍

@repo/analytics:lint:biome:      5    │ - → children:·ReactNode;␍

@repo/analytics:lint:biome:      6    │ - → apiKey?:·string;␍

@repo/analytics:lint:biome:      7    │ - → options?:·{␍

@repo/analytics:lint:biome:      8    │ - → → host?:·string;␍

@repo/analytics:lint:biome:      9    │ - → → debug?:·boolean;␍

@repo/analytics:lint:biome:     10    │ - → };␍

@repo/analytics:lint:biome:     11    │ - }␍

@repo/analytics:lint:biome:     12    │ - ␍

@repo/analytics:lint:biome:     13    │ - import·{·ActivityPulseProvider·}·from·"../context/ActivityPulseContext";␍

@repo/analytics:lint:biome:     14    │ - ␍

@repo/library:lint:biome:      31     │ - ␍

@repo/library:lint:biome:      32     │ - → async·init()·{␍

@repo/people:lint:biome:       2     │ - import·{·handleAPIError·}·from·"@repo/core/logic";␍

@repo/library:lint:biome:      33     │ - → → return·new·Promise<void>((resolve,·reject)·=>·{␍

@repo/library:lint:biome:      34     │ - → → → const·request·=·indexedDB.open(DB_NAME,·DB_VERSION);␍

@repo/library:lint:biome:      35     │ - ␍

@repo/library:lint:biome:      36     │ - → → → request.onupgradeneeded·=·(event)·=>·{␍

@repo/library:lint:biome:      37     │ - → → → → const·db·=·(event.target·as·IDBOpenDBRequest).result;␍

@repo/library:lint:biome:      38     │ - ␍

@repo/library:lint:biome:      39     │ - → → → → //·Main·resource·index␍

@repo/library:lint:biome:      40     │ - → → → → if·(!db.objectStoreNames.contains(STORE_NAME))·{␍

@repo/library:lint:biome:      41     │ - → → → → → const·store·=·db.createObjectStore(STORE_NAME,·{·keyPath:·"id"·});␍

@repo/library:lint:biome:      42     │ - → → → → → store.createIndex("updated_at",·"updated_at",·{·unique:·false·});␍

@repo/library:lint:biome:      43     │ - → → → → → store.createIndex("type",·"type",·{·unique:·false·});␍

@repo/ui:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.

@repo/ui:lint:biome:   
@repo/ui:lint:biome: 

@repo/ui:lint:biome: src\__tests__\Toast.test.tsx:5:62 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/ui:lint:biome:   ! Unexpected any. Specify a different type.

@repo/ui:lint:biome:   

@repo/ui:lint:biome:     3 │ import { ToastProvider, useToast } from '../providers/ToastProvider';

@repo/ui:lint:biome:     4 │ 

@repo/ui:lint:biome:   > 5 │ const TestComponent = ({ message = 'Hello', type = 'info' as any }) => {

@repo/ui:lint:biome:       │                                                              ^^^

@repo/ui:lint:biome:     6 │   const { showToast } = useToast();

@repo/ui:lint:biome:     7 │   return (

@repo/ui:lint:biome:   

@repo/ui:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/ui:lint:biome:   

@repo/ui:lint:biome: 

@repo/ui:lint:biome: src\components\AchievementUnlockOverlay.tsx:63:78 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/people:lint:biome:       3     │ - import·type·{·StaffAttendance,·StaffLeave·}·from·"@repo/core/types";␍

@repo/analytics:lint:biome:     15    │ - export·function·AnalyticsProvider({·children,·apiKey,·options·}:·Props)·{␍
@repo/analytics:lint:biome:     16    │ - → useEffect(()·=>·{␍

@repo/analytics:lint:biome:     17    │ - → → if·(apiKey)·{␍

@repo/analytics:lint:biome:     18    │ - → → → posthogAnalytics.initialize(apiKey,·options);␍

@repo/library:lint:biome:      44     │ - → → → → → //·Indexes·for·search␍

@repo/ui:lint:biome:   ! Unexpected any. Specify a different type.

@repo/ui:lint:biome:   

@repo/ui:lint:biome:     62 │   const animatedStyle = useAnimatedStyle(() => ({

@repo/people:lint:biome:       4     │ - ␍

@repo/analytics:lint:biome:     19    │ - → → }␍

@repo/library:lint:biome:      45     │ - → → → → → store.createIndex("title_en",·"title_en",·{·unique:·false·});␍

@repo/library:lint:biome:      46     │ - → → → → → store.createIndex("title_si",·"title_si",·{·unique:·false·});␍

@repo/library:lint:biome:      47     │ - → → → → → store.createIndex("title_ta",·"title_ta",·{·unique:·false·});␍

@repo/library:lint:biome:      48     │ - → → → → }␍

@repo/library:lint:biome:      49     │ - ␍

@repo/library:lint:biome:      50     │ - → → → → //·Sync·state·store␍

@repo/library:lint:biome:      51     │ - → → → → if·(!db.objectStoreNames.contains(SYNC_STORE))·{␍

@repo/library:lint:biome:      52     │ - → → → → → db.createObjectStore(SYNC_STORE,·{·keyPath:·"key"·});␍

@repo/library:lint:biome:      53     │ - → → → → }␍

@repo/library:lint:biome:      54     │ - → → → };␍

@repo/library:lint:biome:      55     │ - ␍

@repo/library:lint:biome:      56     │ - → → → request.onsuccess·=·(event)·=>·{␍

@repo/library:lint:biome:      57     │ - → → → → this.db·=·(event.target·as·IDBOpenDBRequest).result;␍

@repo/library:lint:biome:      58     │ - → → → → console.log("Knowledge·IndexedDB·Initialized");␍

@repo/library:lint:biome:      59     │ - → → → → resolve();␍

@repo/library:lint:biome:      60     │ - → → → };␍

@repo/library:lint:biome:      61     │ - ␍

@repo/library:lint:biome:      62     │ - → → → request.onerror·=·()·=>·reject(request.error);␍

@repo/library:lint:biome:      63     │ - → → });␍

@repo/library:lint:biome:      64     │ - → },␍

@repo/library:lint:biome:      65     │ - ␍

@repo/library:lint:biome:      66     │ - → async·search(query:·string,·limit:·number·=·20):·Promise<string[]>·{␍

@repo/library:lint:biome:      67     │ - → → if·(!this.db)·await·this.init();␍

@repo/library:lint:biome:      68     │ - → → if·(!this.db)·return·[];␍

@repo/people:lint:biome:       5     │ - import·{·useCallback,·useEffect,·useState·}·from·"react";␍

@repo/people:lint:biome:       6     │ - import·{·staffAPI·}·from·"../staff";␍

@repo/people:lint:biome:       7     │ - ␍

@repo/people:lint:biome:       8     │ - export·function·useStaffPresence(userId?:·string,·schoolId?:·string)·{␍

@repo/people:lint:biome:       9     │ - → const·[attendance,·setAttendance]·=·useState<StaffAttendance[]>([]);␍

@repo/ui:lint:biome:   > 63 │     transform: [{ translateY: translateY.value }, { scale: scale.value }] as any,

@repo/library:lint:biome:      69     │ - ␍

@repo/library:lint:biome:      70     │ - → → const·normalizedQuery·=·query.toLowerCase();␍

@repo/library:lint:biome:      71     │ - ␍

@repo/library:lint:biome:      72     │ - → → return·new·Promise((resolve)·=>·{␍

@repo/library:lint:biome:      73     │ - → → → const·transaction·=·this.db!.transaction([STORE_NAME],·"readonly");␍

@repo/library:lint:biome:      74     │ - → → → const·store·=·transaction.objectStore(STORE_NAME);␍

@repo/library:lint:biome:      75     │ - → → → const·results:·string[]·=·[];␍

@repo/library:lint:biome:      76     │ - ␍

@repo/library:lint:biome:      77     │ - → → → //·Simple·prefix·search·implementation·using·cursor·(high-performance·enough·for·library·size)␍

@repo/library:lint:biome:      78     │ - → → → store.openCursor().onsuccess·=·(event)·=>·{␍

@repo/library:lint:biome:      79     │ - → → → → const·cursor·=·(event.target·as·IDBRequest<IDBCursorWithValue>).result;␍

@repo/library:lint:biome:      80     │ - → → → → if·(cursor·&&·results.length·<·limit)·{␍

@repo/library:lint:biome:      81     │ - → → → → → const·node·=·cursor.value·as·KnowledgeNodeIndex;␍

@repo/library:lint:biome:      82     │ - → → → → → const·match·=␍

@repo/library:lint:biome:      83     │ - → → → → → → node.title_en?.toLowerCase().includes(normalizedQuery)·||␍

@repo/library:lint:biome:      84     │ - → → → → → → node.title_si?.toLowerCase().includes(normalizedQuery)·||␍

@repo/library:lint:biome:      85     │ - → → → → → → node.title_ta?.toLowerCase().includes(normalizedQuery)·||␍

@repo/library:lint:biome:      86     │ - → → → → → → node.tags?.toLowerCase().includes(normalizedQuery);␍

@repo/library:lint:biome:      87     │ - ␍

@repo/analytics:lint:biome:     20    │ - → },·[apiKey,·options]);␍

@repo/analytics:lint:biome:     21    │ - ␍

@repo/analytics:lint:biome:     22    │ - → return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;␍

@repo/analytics:lint:biome:     23    │ - }␍

@repo/analytics:lint:biome:         1 │ + import·{·type·ReactNode,·useEffect·}·from·'react';

@repo/analytics:lint:biome:         2 │ + import·{·posthogAnalytics·}·from·'../engine/PostHogAnalytics.web';

@repo/analytics:lint:biome:         3 │ + 

@repo/analytics:lint:biome:         4 │ + interface·Props·{

@repo/analytics:lint:biome:         5 │ + ··children:·ReactNode;

@repo/analytics:lint:biome:         6 │ + ··apiKey?:·string;

@repo/analytics:lint:biome:         7 │ + ··options?:·{

@repo/analytics:lint:biome:         8 │ + ····host?:·string;

@repo/analytics:lint:biome:         9 │ + ····debug?:·boolean;

@repo/analytics:lint:biome:        10 │ + ··};

@repo/analytics:lint:biome:        11 │ + }

@repo/analytics:lint:biome:        12 │ + 

@repo/analytics:lint:biome:        13 │ + import·{·ActivityPulseProvider·}·from·'../context/ActivityPulseContext';

@repo/analytics:lint:biome:        14 │ + 

@repo/analytics:lint:biome:        15 │ + export·function·AnalyticsProvider({·children,·apiKey,·options·}:·Props)·{

@repo/analytics:lint:biome:        16 │ + ··useEffect(()·=>·{

@repo/analytics:lint:biome:        17 │ + ····if·(apiKey)·{

@repo/analytics:lint:biome:        18 │ + ······posthogAnalytics.initialize(apiKey,·options);

@repo/analytics:lint:biome:        19 │ + ····}

@repo/analytics:lint:biome:        20 │ + ··},·[apiKey,·options]);

@repo/ui:lint:biome:        │                                                                              ^^^

@repo/ui:lint:biome:     64 │     opacity: opacity.value,

@repo/ui:lint:biome:     65 │   }));
@repo/ui:lint:biome:   

@repo/ui:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/ui:lint:biome:   
@repo/ui:lint:biome: 

@repo/ui:lint:biome: src\components\CitizenGate.tsx:24:95 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/ui:lint:biome:   ! Unexpected any. Specify a different type.

@repo/ui:lint:biome:   

@repo/ui:lint:biome:     22 │   onSecondary,

@repo/ui:lint:biome:     23 │ }: CitizenGateProps) {

@repo/ui:lint:biome:   > 24 │   const mappedContext = context === 'profile' || context === 'general' ? 'self' : (context as any);

@repo/library:lint:biome:      88     │ - → → → → → if·(match)·{␍

@repo/library:lint:biome:      89     │ - → → → → → → results.push(node.id);␍

@repo/library:lint:biome:      90     │ - → → → → → }␍

@repo/analytics:lint:biome:        21 │ + 

@repo/ui:lint:biome:        │                                                                                               ^^^

@repo/ui:lint:biome:     25 │ 

@repo/people:lint:biome:      10     │ - → const·[leaves,·setLeaves]·=·useState<StaffLeave[]>([]);␍

@repo/people:lint:biome:      11     │ - → const·[loading,·setLoading]·=·useState(true);␍

@repo/people:lint:biome:      12     │ - ␍

@repo/people:lint:biome:      13     │ - → const·fetchData·=·useCallback(async·()·=>·{␍

@repo/people:lint:biome:      14     │ - → → if·(!userId)·return;␍

@repo/analytics:lint:biome:        22 │ + ··return·<ActivityPulseProvider>{children}</ActivityPulseProvider>;
@repo/analytics:lint:biome:        23 │ + }

@repo/library:lint:biome:      91     │ - → → → → → cursor.continue();␍

@repo/library:lint:biome:      92     │ - → → → → }·else·{␍

@repo/ui:lint:biome:     26 │   return (
@repo/ui:lint:biome:   

@repo/people:lint:biome:      15     │ - → → try·{␍

@repo/people:lint:biome:      16     │ - → → → setLoading(true);␍

@repo/people:lint:biome:      17     │ - → → → const·[attData,·leaveData]·=·await·Promise.all([␍

@repo/people:lint:biome:      18     │ - → → → → staffAPI.getAttendance(userId),␍

@repo/analytics:lint:biome:     24 24 │   
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome: 

@repo/library:lint:biome:      93     │ - → → → → → resolve(results);␍

@repo/library:lint:biome:      94     │ - → → → → }␍

@repo/library:lint:biome:      95     │ - → → → };␍

@repo/library:lint:biome:      96     │ - → → });␍

@repo/analytics:lint:biome: src\components\GPAInsights.tsx:132:14 lint/suspicious/noArrayIndexKey ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/library:lint:biome:      97     │ - → },␍

@repo/library:lint:biome:      98     │ - ␍

@repo/ui:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/ui:lint:biome:   

@repo/ui:lint:biome: 

@repo/people:lint:biome:      19     │ - → → → → staffAPI.getLeaves(userId),␍

@repo/people:lint:biome:      20     │ - → → → ]);␍

@repo/people:lint:biome:      21     │ - → → → setAttendance(attData);␍

@repo/people:lint:biome:      22     │ - → → → setLeaves(leaveData);␍

@repo/analytics:lint:biome:   × Avoid using the index of an array as key property in an element.

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     130 │ 						).map((recommendation, index) => (

@repo/people:lint:biome:      23     │ - → → }·catch·(error)·{␍

@repo/people:lint:biome:      24     │ - → → → handleAPIError(error);␍

@repo/people:lint:biome:      25     │ - → → }·finally·{␍

@repo/people:lint:biome:      26     │ - → → → setLoading(false);␍

@repo/people:lint:biome:      27     │ - → → }␍

@repo/people:lint:biome:      28     │ - → },·[userId]);␍

@repo/people:lint:biome:      29     │ - ␍

@repo/people:lint:biome:      30     │ - → useEffect(()·=>·{␍

@repo/people:lint:biome:      31     │ - → → fetchData();␍

@repo/people:lint:biome:      32     │ - → },·[fetchData]);␍

@repo/people:lint:biome:      33     │ - ␍

@repo/people:lint:biome:      34     │ - → //·Real-time·subscription·to·reflect·check-in/out·changes·immediately␍

@repo/analytics:lint:biome:     131 │ 							<Text

@repo/library:lint:biome:      99     │ - → async·upsertNodes(nodes:·KnowledgeNodeIndex[])·{␍

@repo/people:lint:biome:      35     │ - → useEffect(()·=>·{␍

@repo/people:lint:biome:      36     │ - → → if·(!userId)·return;␍

@repo/people:lint:biome:      37     │ - ␍

@repo/analytics:lint:biome:   > 132 │ 								key={index}

@repo/people:lint:biome:      38     │ - → → const·channel·=·supabase␍

@repo/analytics:lint:biome:         │ 								     ^^^^^

@repo/analytics:lint:biome:     133 │ 								className="text-sm leading-5"

@repo/analytics:lint:biome:     134 │ 								style={{ color: colors.text }}
@repo/analytics:lint:biome:   

@repo/library:lint:biome:     100     │ - → → if·(!this.db)·await·this.init();␍

@repo/ui:lint:biome: src\components\CollectionCard.tsx:31:42 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/people:lint:biome:      39     │ - → → → .channel(`staff_attendance:${userId}-${Math.random().toString(36).slice(2,·9)}`)␍

@repo/analytics:lint:biome:   i This is the source of the key value.
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:     128 │ 							trendDirection,

@repo/analytics:lint:biome:     129 │ 							gapToTarget,

@repo/analytics:lint:biome:   > 130 │ 						).map((recommendation, index) => (

@repo/library:lint:biome:     101     │ - → → if·(!this.db)·return;␍

@repo/library:lint:biome:     102     │ - ␍

@repo/library:lint:biome:     103     │ - → → return·new·Promise<void>((resolve,·reject)·=>·{␍

@repo/library:lint:biome:     104     │ - → → → const·transaction·=·this.db!.transaction([STORE_NAME],·"readwrite");␍

@repo/library:lint:biome:     105     │ - → → → const·store·=·transaction.objectStore(STORE_NAME);␍

@repo/people:lint:biome:      40     │ - → → → .on(␍

@repo/library:lint:biome:     106     │ - ␍

@repo/library:lint:biome:     107     │ - → → → nodes.forEach((node)·=>·store.put(node));␍

@repo/library:lint:biome:     108     │ - ␍

@repo/library:lint:biome:     109     │ - → → → transaction.oncomplete·=·()·=>·resolve();␍

@repo/library:lint:biome:     110     │ - → → → transaction.onerror·=·()·=>·reject(transaction.error);␍

@repo/library:lint:biome:     111     │ - → → });␍

@repo/ui:lint:biome:   ! Unexpected any. Specify a different type.

@repo/ui:lint:biome:   

@repo/library:lint:biome:     112     │ - → },␍

@repo/library:lint:biome:     113     │ - ␍

@repo/library:lint:biome:     114     │ - → async·getNodesByIds(ids:·string[]):·Promise<KnowledgeNodeIndex[]>·{␍

@repo/library:lint:biome:     115     │ - → → if·(!this.db)·await·this.init();␍

@repo/library:lint:biome:     116     │ - → → if·(!this.db)·return·[];␍

@repo/library:lint:biome:     117     │ - ␍

@repo/ui:lint:biome:     29 │ // ============================================================================

@repo/ui:lint:biome:     30 │ 

@repo/ui:lint:biome:   > 31 │ export interface CollectionCardProps<T = any> {

@repo/ui:lint:biome:        │                                          ^^^

@repo/ui:lint:biome:     32 │   title: string;

@repo/ui:lint:biome:     33 │   creator: string;

@repo/ui:lint:biome:   

@repo/ui:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/ui:lint:biome:   

@repo/ui:lint:biome: 

@repo/analytics:lint:biome:         │ 						                       ^^^^^

@repo/analytics:lint:biome:     131 │ 							<Text

@repo/analytics:lint:biome:     132 │ 								key={index}
@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:   i The order of the items may change, and this also affects performances and component state.

@repo/analytics:lint:biome:   

@repo/analytics:lint:biome:   i Check the React documentation. 
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\components\GPAInsights.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/library:lint:biome:     118     │ - → → const·results:·KnowledgeNodeIndex[]·=·[];␍
@repo/library:lint:biome:     119     │ - → → const·transaction·=·this.db!.transaction([STORE_NAME],·"readonly");␍
@repo/library:lint:biome:     120     │ - → → const·store·=·transaction.objectStore(STORE_NAME);␍

@repo/library:lint:biome:     121     │ - ␍
@repo/library:lint:biome:     122     │ - → → for·(const·id·of·ids)·{␍
@repo/library:lint:biome:     123     │ - → → → const·node·=·await·new·Promise<KnowledgeNodeIndex·|·null>((resolve)·=>·{␍
@repo/library:lint:biome:     124     │ - → → → → const·request·=·store.get(id);␍
@repo/library:lint:biome:     125     │ - → → → → request.onsuccess·=·()·=>·resolve(request.result);␍
@repo/library:lint:biome:     126     │ - → → → → request.onerror·=·()·=>·resolve(null);␍
@repo/library:lint:biome:     127     │ - → → → });␍
@repo/library:lint:biome:     128     │ - → → → if·(node)·results.push(node);␍
@repo/library:lint:biome:     129     │ - → → }␍

@repo/library:lint:biome:     130     │ - → → return·results;␍

@repo/library:lint:biome:     131     │ - → },␍

@repo/library:lint:biome:     132     │ - ␍

@repo/ui:lint:biome: src\components\CollectionCard.tsx:48:36 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/ui:lint:biome:   ! Unexpected any. Specify a different type.
@repo/ui:lint:biome:   
@repo/ui:lint:biome:     46 │ // ============================================================================
@repo/ui:lint:biome:     47 │ 
@repo/ui:lint:biome:   > 48 │ export function CollectionCard<T = any>({
@repo/ui:lint:biome:        │                                    ^^^

@repo/ui:lint:biome:     49 │   title,
@repo/ui:lint:biome:     50 │   creator,
@repo/ui:lint:biome:   
@repo/ui:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/ui:lint:biome: src\archive\LotusPetalFAB.complex.tsx:14:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 

@repo/ui:lint:biome:   × The imports and exports are not sorted.
@repo/ui:lint:biome:   
@repo/ui:lint:biome:     12 │  */

@repo/ui:lint:biome:     13 │ 
@repo/ui:lint:biome:   > 14 │ import * as Haptics from 'expo-haptics';
@repo/ui:lint:biome:        │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

@repo/ui:lint:biome:     15 │ import { Edit, Flower2, MessageCircle, Plus, Upload } from 'lucide-react-native';
@repo/ui:lint:biome:     16 │ import type React from 'react';

@repo/ui:lint:biome:   
@repo/ui:lint:biome:   i Safe fix: Organize Imports (Biome)
@repo/ui:lint:biome:   
@repo/ui:lint:biome:      17  17 │   import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';␍

@repo/ui:lint:biome:      18  18 │   import { Dimensions, Image, PanResponder, StyleSheet } from 'react-native';␍
@repo/ui:lint:biome:      19     │ - import·{·Pressable,·Text,·View·}·from·'../primitives';␍
@repo/ui:lint:biome:      20     │ - import·Animated,·{␍
@repo/ui:lint:biome:      21     │ - ··Easing,␍

@repo/ui:lint:biome:      22     │ - ··Extrapolate,␍
@repo/ui:lint:biome:      23     │ - ··interpolate,␍
@repo/ui:lint:biome:      24     │ - ··type·SharedValue,␍
@repo/ui:lint:biome:      25     │ - ··useAnimatedStyle,␍

@repo/ui:lint:biome:      26     │ - ··useSharedValue,␍
@repo/ui:lint:biome:      27     │ - ··withRepeat,␍
@repo/ui:lint:biome:      28     │ - ··withSequence,␍
@repo/ui:lint:biome:      29     │ - ··withSpring,␍

@repo/ui:lint:biome:      30     │ - ··withTiming,␍
@repo/ui:lint:biome:      31     │ - }·from·'react-native-reanimated';␍
@repo/ui:lint:biome:      32     │ - import·{·useAccessibility·}·from·'../hooks/useAccessibility';␍

@repo/ui:lint:biome:          19 │ + import·Animated,·{␍
@repo/ui:lint:biome:          20 │ + ··Easing,␍
@repo/ui:lint:biome:          21 │ + ··Extrapolate,␍
@repo/ui:lint:biome:          22 │ + ··interpolate,␍
@repo/ui:lint:biome:          23 │ + ··type·SharedValue,␍

@repo/ui:lint:biome:          24 │ + ··useAnimatedStyle,␍
@repo/ui:lint:biome:          25 │ + ··useSharedValue,␍
@repo/ui:lint:biome:          26 │ + ··withRepeat,␍
@repo/ui:lint:biome:          27 │ + ··withSequence,␍

@repo/ui:lint:biome:          28 │ + ··withSpring,␍
@repo/ui:lint:biome:          29 │ + ··withTiming,␍
@repo/ui:lint:biome:          30 │ + }·from·'react-native-reanimated';␍

@repo/ui:lint:biome:          31 │ + import·{·useAccessibility·}·from·'../hooks/useAccessibility';␍
@repo/ui:lint:biome:          32 │ + import·{·Pressable,·Text,·View·}·from·'../primitives';␍
@repo/ui:lint:biome:      33  33 │   import { Theme } from '../theme/Theme';␍

@repo/ui:lint:biome:      34  34 │   ␍
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/ui:lint:biome: src\archive\LotusPetalFAB.complex.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/ui:lint:biome: 

@repo/people:lint:biome:      41     │ - → → → → "postgres_changes",␍
@repo/people:lint:biome:      42     │ - → → → → {␍
@repo/people:lint:biome:      43     │ - → → → → → event:·"*",␍
@repo/people:lint:biome:      44     │ - → → → → → schema:·"public",␍

@repo/people:lint:biome:      45     │ - → → → → → table:·"staff_attendance",␍
@repo/people:lint:biome:      46     │ - → → → → → filter:·`user_id=eq.${userId}`,␍
@repo/people:lint:biome:      47     │ - → → → → },␍
@repo/people:lint:biome:      48     │ - → → → → (payload)·=>·{␍
@repo/people:lint:biome:      49     │ - → → → → → if·(payload.eventType·===·"INSERT")·{␍

@repo/people:lint:biome:      50     │ - → → → → → → setAttendance((prev)·=>·[payload.new·as·StaffAttendance,·...prev]);␍
@repo/people:lint:biome:      51     │ - → → → → → }·else·if·(payload.eventType·===·"UPDATE")·{␍
@repo/people:lint:biome:      52     │ - → → → → → → setAttendance((prev)·=>␍
@repo/people:lint:biome:      53     │ - → → → → → → → prev.map((a)·=>␍

@repo/people:lint:biome:      54     │ - → → → → → → → → a.id·===·(payload.new·as·StaffAttendance).id␍
@repo/people:lint:biome:      55     │ - → → → → → → → → → ?·(payload.new·as·StaffAttendance)␍
@repo/people:lint:biome:      56     │ - → → → → → → → → → :·a,␍
@repo/people:lint:biome:      57     │ - → → → → → → → ),␍
@repo/people:lint:biome:      58     │ - → → → → → → );␍

@repo/people:lint:biome:      59     │ - → → → → → }␍
@repo/people:lint:biome:      60     │ - → → → → },␍
@repo/people:lint:biome:      61     │ - → → → )␍
@repo/people:lint:biome:      62     │ - → → → .subscribe();␍
@repo/people:lint:biome:      63     │ - ␍

@repo/people:lint:biome:      64     │ - → → return·()·=>·{␍
@repo/people:lint:biome:      65     │ - → → → supabase.removeChannel(channel);␍
@repo/people:lint:biome:      66     │ - → → };␍
@repo/people:lint:biome:      67     │ - → },·[userId]);␍

@repo/people:lint:biome:      68     │ - ␍
@repo/people:lint:biome:      69     │ - → const·checkIn·=·async·(notes?:·string)·=>·{␍
@repo/people:lint:biome:      70     │ - → → if·(!userId·||·!schoolId)·return·{·success:·false·};␍
@repo/people:lint:biome:      71     │ - → → try·{␍
@repo/people:lint:biome:      72     │ - → → → const·result·=·await·staffAPI.checkIn(userId,·schoolId,·notes);␍
@repo/people:lint:biome:      73     │ - → → → setAttendance((prev)·=>·[result,·...prev]);␍
@repo/people:lint:biome:      74     │ - → → → //·Growth·signal:·teacher/principal·chose·to·be·present␍

@repo/people:lint:biome:      75     │ - → → → growthSignalsAPI.emitSilent({␍
@repo/people:lint:biome:      76     │ - → → → → user_id:·userId,␍
@repo/people:lint:biome:      77     │ - → → → → event_type:·"attendance_marked",␍
@repo/people:lint:biome:      78     │ - → → → → event_metadata:·{␍
@repo/people:lint:biome:      79     │ - → → → → → school_id:·schoolId,␍
@repo/people:lint:biome:      80     │ - → → → → → type:·"check_in",␍
@repo/people:lint:biome:      81     │ - → → → → },␍

@repo/people:lint:biome:      82     │ - → → → });␍
@repo/people:lint:biome:      83     │ - → → → return·{·success:·true,·data:·result·};␍
@repo/people:lint:biome:      84     │ - → → }·catch·(error)·{␍
@repo/people:lint:biome:      85     │ - → → → handleAPIError(error);␍
@repo/people:lint:biome:      86     │ - → → → return·{·success:·false,·error·};␍

@repo/people:lint:biome:      87     │ - → → }␍
@repo/people:lint:biome:      88     │ - → };␍
@repo/people:lint:biome:      89     │ - ␍
@repo/people:lint:biome:      90     │ - → const·checkOut·=·async·()·=>·{␍
@repo/people:lint:biome:      91     │ - → → if·(!userId)·return·{·success:·false·};␍

@repo/people:lint:biome:      92     │ - → → try·{␍
@repo/people:lint:biome:      93     │ - → → → const·result·=·await·staffAPI.checkOut(userId);␍
@repo/people:lint:biome:      94     │ - → → → setAttendance((prev)·=>␍
@repo/people:lint:biome:      95     │ - → → → → prev.map((a)·=>·(a.id·===·result.id·?·result·:·a)),␍

@repo/people:lint:biome:      96     │ - → → → );␍
@repo/people:lint:biome:      97     │ - → → → return·{·success:·true,·data:·result·};␍
@repo/people:lint:biome:      98     │ - → → }·catch·(error)·{␍
@repo/people:lint:biome:      99     │ - → → → handleAPIError(error);␍

@repo/people:lint:biome:     100     │ - → → → return·{·success:·false,·error·};␍
@repo/people:lint:biome:     101     │ - → → }␍
@repo/people:lint:biome:     102     │ - → };␍
@repo/people:lint:biome:     103     │ - ␍

@repo/people:lint:biome:     104     │ - → const·requestLeave·=·async·(␍
@repo/people:lint:biome:     105     │ - → → leave:·Omit<␍
@repo/people:lint:biome:     106     │ - → → → StaffLeave,␍
@repo/people:lint:biome:     107     │ - → → → "id"·|·"user_id"·|·"school_id"·|·"status"·|·"created_at"␍

@repo/people:lint:biome:     108     │ - → → >,␍
@repo/people:lint:biome:     109     │ - → )·=>·{␍
@repo/people:lint:biome:     110     │ - → → if·(!userId·||·!schoolId)·return·{·success:·false·};␍
@repo/people:lint:biome:     111     │ - → → try·{␍

@repo/people:lint:biome:     112     │ - → → → const·result·=·await·staffAPI.submitLeave({␍
@repo/people:lint:biome:     113     │ - → → → → ...leave,␍
@repo/people:lint:biome:     114     │ - → → → → user_id:·userId,␍
@repo/people:lint:biome:     115     │ - → → → → school_id:·schoolId,␍

@repo/people:lint:biome:     116     │ - → → → });␍
@repo/people:lint:biome:     117     │ - → → → setLeaves((prev)·=>·[result,·...prev]);␍
@repo/people:lint:biome:     118     │ - → → → return·{·success:·true,·data:·result·};␍

@repo/people:lint:biome:     119     │ - → → }·catch·(error)·{␍
@repo/people:lint:biome:     120     │ - → → → handleAPIError(error);␍

@repo/people:lint:biome:     121     │ - → → → return·{·success:·false,·error·};␍
@repo/people:lint:biome:     122     │ - → → }␍
@repo/people:lint:biome:     123     │ - → };␍
@repo/people:lint:biome:     124     │ - ␍
@repo/people:lint:biome:     125     │ - → const·isCheckedIn·=␍
@repo/people:lint:biome:     126     │ - → → attendance.length·>·0·&&·attendance[0]·?·!attendance[0].check_out·:·false;␍
@repo/people:lint:biome:     127     │ - ␍
@repo/people:lint:biome:     128     │ - → return·{␍

@repo/people:lint:biome:     129     │ - → → attendance,␍
@repo/people:lint:biome:     130     │ - → → leaves,␍
@repo/people:lint:biome:     131     │ - → → loading,␍
@repo/people:lint:biome:     132     │ - → → isCheckedIn,␍
@repo/people:lint:biome:     133     │ - → → checkIn,␍
@repo/people:lint:biome:     134     │ - → → checkOut,␍
@repo/people:lint:biome:     135     │ - → → requestLeave,␍

@repo/people:lint:biome:     136     │ - → → refresh:·fetchData,␍
@repo/people:lint:biome:     137     │ - → };␍
@repo/people:lint:biome:     138     │ - }␍
@repo/people:lint:biome:           1 │ + import·{·growthSignalsAPI,·supabase·}·from·'@repo/core/api';
@repo/people:lint:biome:           2 │ + import·{·handleAPIError·}·from·'@repo/core/logic';
@repo/people:lint:biome:           3 │ + import·type·{·StaffAttendance,·StaffLeave·}·from·'@repo/core/types';

@repo/people:lint:biome:           4 │ + 
@repo/people:lint:biome:           5 │ + import·{·useCallback,·useEffect,·useState·}·from·'react';
@repo/people:lint:biome:           6 │ + import·{·staffAPI·}·from·'../staff';
@repo/people:lint:biome:           7 │ + 

@repo/library:lint:biome:     133     │ - → //·Shim·for·compatibility·with·sync·logic·that·uses·SQLite·methods␍

@repo/analytics:lint:biome:   × Formatter would have printed the following content:
@repo/analytics:lint:biome:   

@repo/ui:lint:biome:   × Formatter would have printed the following content:
@repo/ui:lint:biome:   

@repo/people:lint:biome:           8 │ + export·function·useStaffPresence(userId?:·string,·schoolId?:·string)·{

@repo/library:lint:biome:     134     │ - → async·runAsync(query:·string,·params:·any[])·{␍

@repo/library:lint:biome:     135     │ - → → if·(!this.db)·await·this.init();␍

@repo/library:lint:biome:     136     │ - → → if·(!this.db)·return;␍

@repo/library:lint:biome:     137     │ - → → if·(query.includes("sync_state"))·{␍

@repo/library:lint:biome:     138     │ - → → → const·key·=·params[0]·as·string;␍

@repo/library:lint:biome:     139     │ - → → → //·Two·SQL·variants·are·called·by·sync.ts:␍
@repo/library:lint:biome:     140     │ - → → → //···3-param:·INSERT·\u2026·(key,·last_sync_timestamp,·sync_status)␍
@repo/library:lint:biome:     141     │ - → → → //···2-param:·INSERT·\u2026·(key,·sync_status)··\u2190·error·path␍
@repo/library:lint:biome:     142     │ - → → → let·record:·Record<string,·unknown>;␍
@repo/library:lint:biome:     143     │ - → → → if·(query.includes("last_sync_timestamp"))·{␍
@repo/library:lint:biome:     144     │ - → → → → record·=·{␍
@repo/library:lint:biome:     145     │ - → → → → → key,␍

@repo/library:lint:biome:     146     │ - → → → → → last_sync_timestamp:·params[1],␍
@repo/library:lint:biome:     147     │ - → → → → → sync_status:·params[2]·??·"idle",␍
@repo/library:lint:biome:     148     │ - → → → → };␍
@repo/library:lint:biome:     149     │ - → → → }·else·{␍
@repo/library:lint:biome:     150     │ - → → → → record·=·{·key,·sync_status:·params[1]·??·"error"·};␍
@repo/library:lint:biome:   281 more lines truncated
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   
@repo/library:lint:biome:     1   │ - export·*·from·"./database";␍
@repo/library:lint:biome:     2   │ - export·*·from·"./library";␍

@repo/analytics:lint:biome:       1     │ - import·{·Card·}·from·"@repo/ui/components/SanctuaryCard";␍

@repo/analytics:lint:biome:       2     │ - import·{·Box,·HStack,·Text,·VStack·}·from·"@repo/ui/primitives";␍

@repo/analytics:lint:biome:       3     │ - import·{·colors·}·from·"@repo/ui/theme";␍

@repo/analytics:lint:biome:       4     │ - import·{·formatGPA,·getGradeColor·}·from·"../utils/analyticsHelpers";␍

@repo/ui:lint:biome:       1     │ - /**␍

@repo/ui:lint:biome:       2     │ - ·*·LOTUS·PETAL·FAB·-·Floating·Action·Button␍

@repo/ui:lint:biome:       3     │ - ·*␍

@repo/ui:lint:biome:       4     │ - ·*·A·petal-shaped·floating·action·button·with:␍

@repo/ui:lint:biome:       5     │ - ·*·-·Golden·Lotus·Art·image␍

@repo/ui:lint:biome:       6     │ - ·*·-·Breathing·animation·(4-second·cycle)␍

@repo/ui:lint:biome:       7     │ - ·*·-·Context-aware·icons·per·tab␍

@repo/analytics:lint:biome:       5     │ - ␍

@repo/library:lint:biome:     3   │ - export·*·from·"./sync";␍

@repo/library:lint:biome:       1 │ + export·*·from·'./database';

@repo/ui:lint:biome:       8     │ - ·*·-·Press·animation·with·haptic·feedback␍

@repo/library:lint:biome:       2 │ + export·*·from·'./library';

@repo/library:lint:biome:       3 │ + export·*·from·'./sync';

@repo/library:lint:biome:     4 4 │   

@repo/library:lint:biome:   
@repo/library:lint:biome: 

@repo/analytics:lint:biome:       6     │ - interface·GPAInsightsProps·{␍

@repo/analytics:lint:biome:       7     │ - → studentId:·string;␍

@repo/analytics:lint:biome:       8     │ - → currentGPA:·number;␍

@repo/ui:lint:biome:       9     │ - ·*·-·Floating·bubble·physics·for·dragging␍

@repo/ui:lint:biome:      10     │ - ·*␍

@repo/people:lint:biome:           9 │ + ··const·[attendance,·setAttendance]·=·useState<StaffAttendance[]>([]);
@repo/people:lint:biome:          10 │ + ··const·[leaves,·setLeaves]·=·useState<StaffLeave[]>([]);

@repo/people:lint:biome:          11 │ + ··const·[loading,·setLoading]·=·useState(true);
@repo/people:lint:biome:          12 │ + 
@repo/people:lint:biome:   119 more lines truncated
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\index.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   
@repo/people:lint:biome:      1    │ - import·{·peopleDirectoryAPI·}·from·"./directory";␍
@repo/people:lint:biome:      2    │ - import·{·teacherFeedbackAPI·}·from·"./feedback";␍
@repo/people:lint:biome:      3    │ - import·{·peopleMembershipsAPI·}·from·"./memberships";␍

@repo/people:lint:biome:      4    │ - import·{·staffAPI·}·from·"./staff";␍
@repo/people:lint:biome:      5    │ - ␍
@repo/people:lint:biome:      6    │ - export·*·from·"./components";␍
@repo/people:lint:biome:      7    │ - export·*·from·"./directory";␍
@repo/people:lint:biome:      8    │ - export·*·from·"./feedback";␍
@repo/people:lint:biome:      9    │ - export·*·from·"./hooks";␍
@repo/people:lint:biome:     10    │ - export·*·from·"./memberships";␍
@repo/people:lint:biome:     11    │ - export·*·from·"./staff";␍
@repo/people:lint:biome:     12    │ - ␍

@repo/people:lint:biome:     13    │ - export·const·peopleAPI·=·{␍
@repo/people:lint:biome:     14    │ - → directory:·peopleDirectoryAPI,␍
@repo/people:lint:biome:     15    │ - → feedback:·teacherFeedbackAPI,␍
@repo/people:lint:biome:     16    │ - → memberships:·peopleMembershipsAPI,␍
@repo/people:lint:biome:     17    │ - → staff:·staffAPI,␍
@repo/people:lint:biome:     18    │ - };␍
@repo/people:lint:biome:         1 │ + import·{·peopleDirectoryAPI·}·from·'./directory';
@repo/people:lint:biome:         2 │ + import·{·teacherFeedbackAPI·}·from·'./feedback';

@repo/library:lint:biome: src\api\sync.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 

@repo/ui:lint:biome:      11     │ - ·*·Philosophy:·Organic,·living·UI·that·breathes·with·intention␍

@repo/ui:lint:biome:      12     │ - ·*/␍

@repo/ui:lint:biome:      13     │ - ␍

@repo/ui:lint:biome:      14     │ - import·*·as·Haptics·from·'expo-haptics';␍

@repo/ui:lint:biome:      15     │ - import·{·Edit,·Flower2,·MessageCircle,·Plus,·Upload·}·from·'lucide-react-native';␍

@repo/ui:lint:biome:      16     │ - import·type·React·from·'react';␍

@repo/library:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:   

@repo/analytics:lint:biome:       9     │ - → trendDirection:·"improving"·|·"declining"·|·"stable";␍

@repo/ui:lint:biome:      17     │ - import·{·type·FC,·useCallback,·useEffect,·useMemo,·useRef,·useState·}·from·'react';␍

@repo/ui:lint:biome:      18     │ - import·{·Dimensions,·Image,·PanResponder,·StyleSheet·}·from·'react-native';␍

@repo/ui:lint:biome:      19     │ - import·{·Pressable,·Text,·View·}·from·'../primitives';␍

@repo/ui:lint:biome:      20     │ - import·Animated,·{␍

@repo/ui:lint:biome:      21     │ - ··Easing,␍

@repo/analytics:lint:biome:      10     │ - → predictedGPA?:·number;␍

@repo/people:lint:biome:         3 │ + import·{·peopleMembershipsAPI·}·from·'./memberships';

@repo/people:lint:biome:         4 │ + import·{·staffAPI·}·from·'./staff';

@repo/people:lint:biome:         5 │ + 

@repo/ui:lint:biome:      22     │ - ··Extrapolate,␍

@repo/analytics:lint:biome:      11     │ - → targetGPA?:·number;␍

@repo/analytics:lint:biome:      12     │ - }␍

@repo/analytics:lint:biome:      13     │ - ␍

@repo/analytics:lint:biome:      14     │ - export·function·GPAInsights({␍

@repo/analytics:lint:biome:      15     │ - → studentId,␍

@repo/analytics:lint:biome:      16     │ - → currentGPA,␍

@repo/analytics:lint:biome:      17     │ - → trendDirection,␍

@repo/analytics:lint:biome:      18     │ - → predictedGPA,␍

@repo/analytics:lint:biome:      19     │ - → targetGPA·=·3.0,␍
@repo/analytics:lint:biome:      20     │ - }:·GPAInsightsProps)·{␍
@repo/analytics:lint:biome:      21     │ - → void·studentId;␍

@repo/people:lint:biome:         6 │ + export·*·from·'./components';

@repo/ui:lint:biome:      23     │ - ··interpolate,␍

@repo/library:lint:biome:       1     │ - import·{·supabase·}·from·"@repo/core/api";␍

@repo/library:lint:biome:       2     │ - ␍

@repo/library:lint:biome:       3     │ - import·{·type·KnowledgeNodeIndex,·knowledgeDB·}·from·"./database";␍

@repo/library:lint:biome:       4     │ - ␍

@repo/library:lint:biome:       5     │ - const·SYNC_KEY·=·"library_index_sync";␍

@repo/library:lint:biome:       6     │ - ␍

@repo/library:lint:biome:       7     │ - /**␍

@repo/analytics:lint:biome:      22     │ - ␍

@repo/ui:lint:biome:      24     │ - ··type·SharedValue,␍

@repo/ui:lint:biome:      25     │ - ··useAnimatedStyle,␍

@repo/ui:lint:biome:      26     │ - ··useSharedValue,␍

@repo/library:lint:biome:       8     │ - ·*·Knowledge·Sync·Manager␍

@repo/analytics:lint:biome:      23     │ - → const·gapToTarget·=·targetGPA·-·currentGPA;␍

@repo/ui:lint:biome:      27     │ - ··withRepeat,␍

@repo/people:lint:biome:         7 │ + export·*·from·'./directory';

@repo/ui:lint:biome:      28     │ - ··withSequence,␍

@repo/ui:lint:biome:      29     │ - ··withSpring,␍

@repo/ui:lint:biome:      30     │ - ··withTiming,␍

@repo/analytics:lint:biome:      24     │ - → const·isOnTrack·=·predictedGPA␍

@repo/analytics:lint:biome:      25     │ - → → ?·predictedGPA·>=·targetGPA␍

@repo/analytics:lint:biome:      26     │ - → → :·currentGPA·>=·targetGPA;␍

@repo/analytics:lint:biome:      27     │ - → const·trendColor·=␍

@repo/analytics:lint:biome:      28     │ - → → trendDirection·===·"improving"␍

@repo/analytics:lint:biome:      29     │ - → → → ?·colors.success␍

@repo/analytics:lint:biome:      30     │ - → → → :·trendDirection·===·"declining"␍

@repo/analytics:lint:biome:      31     │ - → → → → ?·colors.error␍

@repo/analytics:lint:biome:      32     │ - → → → → :·colors.warning;␍

@repo/analytics:lint:biome:      33     │ - ␍

@repo/analytics:lint:biome:      34     │ - → return·(␍

@repo/people:lint:biome:         8 │ + export·*·from·'./feedback';

@repo/people:lint:biome:         9 │ + export·*·from·'./hooks';

@repo/people:lint:biome:        10 │ + export·*·from·'./memberships';

@repo/ui:lint:biome:      31     │ - }·from·'react-native-reanimated';␍

@repo/ui:lint:biome:      32     │ - import·{·useAccessibility·}·from·'../hooks/useAccessibility';␍

@repo/library:lint:biome:       9     │ - ·*·Orchestrates·the·"Radio·Broadcast"·(Uni-directional)·sync·from·Supabase·to·Local·SQLite.␍

@repo/analytics:lint:biome:      35     │ - → → <Card·className="rounded-3xl·bg-white/70·px-6·py-6">␍

@repo/people:lint:biome:        11 │ + export·*·from·'./staff';

@repo/people:lint:biome:        12 │ + 

@repo/people:lint:biome:        13 │ + export·const·peopleAPI·=·{

@repo/ui:lint:biome:      33     │ - import·{·Theme·}·from·'../theme/Theme';␍

@repo/people:lint:biome:        14 │ + ··directory:·peopleDirectoryAPI,

@repo/ui:lint:biome:      34     │ - ␍

@repo/ui:lint:biome:      35     │ - //·============================================================================␍

@repo/ui:lint:biome:      36     │ - //·TYPES␍

@repo/ui:lint:biome:      37     │ - //·============================================================================␍

@repo/ui:lint:biome:      38     │ - ␍

@repo/library:lint:biome:      10     │ - ·*/␍

@repo/ui:lint:biome:      39     │ - type·TabType·=·'self'·|·'classroom'·|·'community'·|·'library'·|·'profile';␍

@repo/people:lint:biome:        15 │ + ··feedback:·teacherFeedbackAPI,
@repo/people:lint:biome:        16 │ + ··memberships:·peopleMembershipsAPI,
@repo/people:lint:biome:        17 │ + ··staff:·staffAPI,

@repo/people:lint:biome:        18 │ + };
@repo/people:lint:biome:     19 19 │   
@repo/people:lint:biome:   
@repo/people:lint:biome: 
@repo/people:lint:biome: src\memberships.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/people:lint:biome: 
@repo/people:lint:biome:   × Formatter would have printed the following content:
@repo/people:lint:biome:   

@repo/library:lint:biome:      11     │ - export·const·knowledgeSync·=·{␍

@repo/library:lint:biome:      12     │ - → /**␍

@repo/library:lint:biome:      13     │ - → ·*·Perform·a·delta·sync·from·Supabase.␍

@repo/library:lint:biome:      14     │ - → ·*/␍

@repo/ui:lint:biome:      40     │ - ␍

@repo/ui:lint:biome:      41     │ - export·interface·ActionItem·{␍

@repo/ui:lint:biome:      42     │ - ··label:·string;␍

@repo/ui:lint:biome:      43     │ - ··onPress:·()·=>·void;␍

@repo/ui:lint:biome:      44     │ - ··icon?:·React.ComponentType<{␍

@repo/ui:lint:biome:      45     │ - ····size:·number;␍

@repo/ui:lint:biome:      46     │ - ····color:·string;␍

@repo/ui:lint:biome:      47     │ - ····strokeWidth:·number;␍

@repo/ui:lint:biome:      48     │ - ··}>;␍

gurudevi-mobile:lint:biome: cache miss, executing 96961e10bf4d7f37

@repo/ui:lint:biome:      49     │ - }␍
@repo/ui:lint:biome:      50     │ - ␍
@repo/ui:lint:biome:      51     │ - interface·LotusPetalFABProps·{␍
@repo/ui:lint:biome:      52     │ - ··currentTab?:·TabType;␍

@repo/ui:lint:biome:      53     │ - ··onPress?:·()·=>·void;␍
@repo/ui:lint:biome:      54     │ - ··icon?:·React.ReactNode;␍
@repo/ui:lint:biome:      55     │ - ··actions?:·ActionItem[];␍
@repo/ui:lint:biome:      56     │ - ··scrollY?:·SharedValue<number>;␍
@repo/ui:lint:biome:      57     │ - ··disabled?:·boolean;␍
@repo/ui:lint:biome:      58     │ - ··bottomInset?:·number;·//·New·prop·for·safe·area·handling␍
@repo/ui:lint:biome:      59     │ - }␍
@repo/ui:lint:biome:      60     │ - ␍
@repo/ui:lint:biome:      61     │ - //·============================================================================␍
@repo/ui:lint:biome:      62     │ - //·CONSTANTS␍
@repo/ui:lint:biome:      63     │ - //·============================================================================␍
@repo/ui:lint:biome:      64     │ - ␍
@repo/ui:lint:biome:      65     │ - const·FAB_SIZE·=·72;·//·Slightly·larger·for·the·art␍
@repo/ui:lint:biome:      66     │ - const·_FAB_HIT_SLOP·=·10;␍

@repo/form-builder:lint:biome: cache miss, executing 836e3530104d3135

apps-gurudevi-marketing-web:lint:biome: cache miss, executing 503d2a5ed323382e

@repo/analytics:lint:biome:      36     │ - → → → <Text·className="mb-5·text-xl·font-bold"·style={{·color:·colors.text·}}>␍
@repo/analytics:lint:biome:      37     │ - → → → → GPA·Insights␍

@repo/analytics:lint:biome:      38     │ - → → → </Text>␍
@repo/analytics:lint:biome:      39     │ - ␍
@repo/analytics:lint:biome:      40     │ - → → → <VStack·className="gap-5">␍
@repo/analytics:lint:biome:      41     │ - → → → → <HStack·className="w-full·justify-around·gap-4">␍
@repo/analytics:lint:biome:      42     │ - → → → → → <VStack·className="flex-1·items-center·gap-1">␍
@repo/analytics:lint:biome:      43     │ - → → → → → → <Text␍

@repo/analytics:lint:biome:      44     │ - → → → → → → → className="text-center·text-xs"␍
@repo/analytics:lint:biome:      45     │ - → → → → → → → style={{·color:·colors.textSecondary·}}␍
@repo/analytics:lint:biome:      46     │ - → → → → → → >␍
@repo/analytics:lint:biome:      47     │ - → → → → → → → Current·GPA␍
@repo/analytics:lint:biome:      48     │ - → → → → → → </Text>␍
@repo/analytics:lint:biome:      49     │ - → → → → → → <Text␍

@repo/analytics:lint:biome:      50     │ - → → → → → → → className="text-center·text-[28px]·font-bold"␍
@repo/analytics:lint:biome:      51     │ - → → → → → → → style={{␍
@repo/analytics:lint:biome:      52     │ - → → → → → → → → color:·getGradeColor(␍
@repo/analytics:lint:biome:      53     │ - → → → → → → → → → currentGPA·>=·3.5·?·"A"·:·currentGPA·>=·2.5·?·"B"·:·"C",␍
@repo/analytics:lint:biome:      54     │ - → → → → → → → → ),␍

@repo/analytics:lint:biome:      55     │ - → → → → → → → }}␍
@repo/analytics:lint:biome:      56     │ - → → → → → → >␍
@repo/analytics:lint:biome:      57     │ - → → → → → → → {formatGPA(currentGPA)}␍
@repo/analytics:lint:biome:      58     │ - → → → → → → </Text>␍
@repo/analytics:lint:biome:      59     │ - → → → → → </VStack>␍

@repo/analytics:lint:biome:      60     │ - ␍
@repo/analytics:lint:biome:      61     │ - → → → → → {predictedGPA·!==·undefined·?·(␍
@repo/analytics:lint:biome:      62     │ - → → → → → → <VStack·className="flex-1·items-center·gap-1">␍
@repo/analytics:lint:biome:      63     │ - → → → → → → → <Text␍
@repo/analytics:lint:biome:      64     │ - → → → → → → → → className="text-center·text-xs"␍

@repo/analytics:lint:biome:      65     │ - → → → → → → → → style={{·color:·colors.textSecondary·}}␍
@repo/analytics:lint:biome:      66     │ - → → → → → → → >␍
@repo/analytics:lint:biome:      67     │ - → → → → → → → → Predicted·GPA␍
@repo/analytics:lint:biome:      68     │ - → → → → → → → </Text>␍
@repo/analytics:lint:biome:      69     │ - → → → → → → → <Text␍

@repo/analytics:lint:biome:      70     │ - → → → → → → → → className="text-center·text-[28px]·font-bold"␍
@repo/analytics:lint:biome:      71     │ - → → → → → → → → style={{␍
@repo/analytics:lint:biome:      72     │ - → → → → → → → → → color:·getGradeColor(␍
@repo/analytics:lint:biome:      73     │ - → → → → → → → → → → predictedGPA·>=·3.5·?·"A"·:·predictedGPA·>=·2.5·?·"B"·:·"C",␍

@repo/analytics:lint:biome:      74     │ - → → → → → → → → → ),␍
@repo/analytics:lint:biome:      75     │ - → → → → → → → → }}␍
@repo/analytics:lint:biome:      76     │ - → → → → → → → >␍
@repo/analytics:lint:biome:      77     │ - → → → → → → → → {formatGPA(predictedGPA)}␍
@repo/analytics:lint:biome:      78     │ - → → → → → → → </Text>␍
@repo/analytics:lint:biome:      79     │ - → → → → → → </VStack>␍

@repo/analytics:lint:biome:      80     │ - → → → → → )·:·null}␍
@repo/analytics:lint:biome:      81     │ - → → → → </HStack>␍
@repo/analytics:lint:biome:      82     │ - ␍
@repo/analytics:lint:biome:      83     │ - → → → → <Box·className="items-center·gap-1">␍

@repo/analytics:lint:biome:      84     │ - → → → → → <Text·className="text-sm"·style={{·color:·colors.textSecondary·}}>␍
@repo/analytics:lint:biome:      85     │ - → → → → → → Performance·Trend␍
@repo/analytics:lint:biome:      86     │ - → → → → → </Text>␍
@repo/analytics:lint:biome:      87     │ - → → → → → <Text␍
@repo/analytics:lint:biome:      88     │ - → → → → → → className="text-base·font-semibold"␍
@repo/analytics:lint:biome:      89     │ - → → → → → → style={{·color:·trendColor·}}␍
@repo/analytics:lint:biome:      90     │ - → → → → → >␍

@repo/analytics:lint:biome:      91     │ - → → → → → → {trendDirection.charAt(0).toUpperCase()·+·trendDirection.slice(1)}␍
@repo/analytics:lint:biome:      92     │ - → → → → → </Text>␍
@repo/analytics:lint:biome:      93     │ - → → → → </Box>␍
@repo/analytics:lint:biome:      94     │ - ␍
@repo/analytics:lint:biome:      95     │ - → → → → <VStack·className="gap-2">␍
@repo/analytics:lint:biome:      96     │ - → → → → → <Text·className="text-sm"·style={{·color:·colors.text·}}>␍

@repo/analytics:lint:biome:      97     │ - → → → → → → Target:·{formatGPA(targetGPA)}␍
@repo/analytics:lint:biome:      98     │ - → → → → → </Text>␍
@repo/analytics:lint:biome:      99     │ - → → → → → <Box␍
@repo/analytics:lint:biome:     100     │ - → → → → → → className="h-2·w-full·overflow-hidden·rounded-full"␍
@repo/analytics:lint:biome:     101     │ - → → → → → → style={{·backgroundColor:·colors.border·}}␍
@repo/analytics:lint:biome:     102     │ - → → → → → >␍

@repo/analytics:lint:biome:     103     │ - → → → → → → <Box␍
@repo/analytics:lint:biome:     104     │ - → → → → → → → className="h-full·rounded-full"␍
@repo/analytics:lint:biome:     105     │ - → → → → → → → style={{␍
@repo/analytics:lint:biome:     106     │ - → → → → → → → → width:·`${Math.min(100,·Math.max(0,·(currentGPA·/·4.0)·*·100))}%`,␍

@repo/analytics:lint:biome:     107     │ - → → → → → → → → backgroundColor:·isOnTrack·?·colors.success·:·colors.warning,␍
@repo/analytics:lint:biome:     108     │ - → → → → → → → }}␍
@repo/analytics:lint:biome:     109     │ - → → → → → → />␍
@repo/analytics:lint:biome:     110     │ - → → → → → </Box>␍
@repo/analytics:lint:biome:     111     │ - → → → → → <Text·className="text-xs"·style={{·color:·colors.textSecondary·}}>␍

@repo/analytics:lint:biome:     112     │ - → → → → → → {gapToTarget·>·0␍
@repo/analytics:lint:biome:     113     │ - → → → → → → → ?·`${formatGPA(gapToTarget)}·to·target`␍
@repo/analytics:lint:biome:     114     │ - → → → → → → → :·"Target·achieved!"}␍
@repo/analytics:lint:biome:     115     │ - → → → → → </Text>␍
@repo/community:lint:biome: cache miss, executing 2ac45200392473fe

@repo/analytics:lint:biome:     116     │ - → → → → </VStack>␍
@repo/analytics:lint:biome:     117     │ - ␍
@repo/analytics:lint:biome:     118     │ - → → → → <VStack·className="gap-2·pt-2">␍
@repo/analytics:lint:biome:     119     │ - → → → → → <Text␍
@repo/analytics:lint:biome:     120     │ - → → → → → → className="text-base·font-semibold"␍
@repo/analytics:lint:biome:     121     │ - → → → → → → style={{·color:·colors.text·}}␍

@repo/analytics:lint:biome:     122     │ - → → → → → >␍
@repo/analytics:lint:biome:     123     │ - → → → → → → Recommendations␍
@repo/analytics:lint:biome:     124     │ - → → → → → </Text>␍
@repo/analytics:lint:biome:     125     │ - → → → → → <VStack·className="gap-2">␍
@repo/analytics:lint:biome:     126     │ - → → → → → → {generateRecommendations(␍

@repo/analytics:lint:biome:     127     │ - → → → → → → → currentGPA,␍
@repo/analytics:lint:biome:     128     │ - → → → → → → → trendDirection,␍
@repo/analytics:lint:biome:     129     │ - → → → → → → → gapToTarget,␍
@repo/analytics:lint:biome:     130     │ - → → → → → → ).map((recommendation,·index)·=>·(␍
@repo/analytics:lint:biome:     131     │ - → → → → → → → <Text␍
@repo/analytics:lint:biome:     132     │ - → → → → → → → → key={index}␍
@repo/analytics:lint:biome:     133     │ - → → → → → → → → className="text-sm·leading-5"␍
@repo/analytics:lint:biome:     134     │ - → → → → → → → → style={{·color:·colors.text·}}␍

@repo/analytics:lint:biome:     135     │ - → → → → → → → >␍
@repo/analytics:lint:biome:     136     │ - → → → → → → → → •·{recommendation}␍
@repo/analytics:lint:biome:     137     │ - → → → → → → → </Text>␍
@repo/analytics:lint:biome:     138     │ - → → → → → → ))}␍
@repo/analytics:lint:biome:     139     │ - → → → → → </VStack>␍
@repo/analytics:lint:biome:     140     │ - → → → → </VStack>␍
@repo/analytics:lint:biome:     141     │ - → → → </VStack>␍
@repo/analytics:lint:biome:     142     │ - → → </Card>␍
@repo/analytics:lint:biome:     143     │ - → );␍
@repo/analytics:lint:biome:     144     │ - }␍

@repo/analytics:lint:biome:     145     │ - ␍
@repo/analytics:lint:biome:     146     │ - function·generateRecommendations(␍

@repo/analytics:lint:biome:     147     │ - → currentGPA:·number,␍
@repo/analytics:lint:biome:     148     │ - → trendDirection:·string,␍
@repo/analytics:lint:biome:     149     │ - → gapToTarget:·number,␍

@repo/analytics:lint:biome:     150     │ - ):·string[]·{␍
@repo/analytics:lint:biome:   171 more lines truncated
@repo/analytics:lint:biome:   
@repo/analytics:lint:biome: 
@repo/analytics:lint:biome: src\utils\benchmarking.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/analytics:lint:biome: 

@repo/library:lint:biome:      15     │ - → async·performSync()·{␍
@repo/library:lint:biome:      16     │ - → → //·High-fidelity·un-shimming:·enabled·for·all·platforms·including·web·(IndexedDB)␍

@repo/library:lint:biome:      17     │ - ␍
@repo/library:lint:biome:      18     │ - → → console.log("Starting·Knowledge·Sync...");␍
@repo/library:lint:biome:      19     │ - ␍
@repo/library:lint:biome:      20     │ - → → try·{␍
@repo/library:lint:biome:      21     │ - → → → //·1.·Ensure·DB·is·initialized␍
@repo/library:lint:biome:      22     │ - → → → await·knowledgeDB.init();␍
@repo/library:lint:biome:      23     │ - ␍

@repo/library:lint:biome:      24     │ - → → → //·2.·Get·last·sync·timestamp␍
@repo/library:lint:biome:      25     │ - → → → const·syncState·=·await·knowledgeDB.getFirstAsync<{␍
@repo/library:lint:biome:      26     │ - → → → → last_sync_timestamp:·number;␍
@repo/library:lint:biome:      27     │ - → → → }>("SELECT·last_sync_timestamp·FROM·sync_state·WHERE·key·=·?",·[␍

@repo/library:lint:biome:      28     │ - → → → → SYNC_KEY,␍
@repo/library:lint:biome:      29     │ - → → → ]);␍
@repo/library:lint:biome:      30     │ - ␍
@repo/library:lint:biome:      31     │ - → → → const·lastSync·=·syncState?.last_sync_timestamp·||·0;␍
@repo/library:lint:biome:      32     │ - → → → const·lastSyncIso·=·new·Date(lastSync).toISOString();␍
@repo/library:lint:biome:      33     │ - ␍
@repo/library:lint:biome:      34     │ - → → → //·3.·Fetch·resources·from·Supabase␍

@repo/library:lint:biome:      35     │ - → → → const·{·data:·resourceData,·error:·resourceError·}·=·await·supabase␍
@repo/library:lint:biome:      36     │ - → → → → .from("nodes")␍
@repo/library:lint:biome:      37     │ - → → → → .select(␍
@repo/library:lint:biome:      38     │ - → → → → → "id,·title,·type,·subjects,·topics,·tags,·language,·map_x,·map_y,·latitude,·longitude,·parent_id:parent_node_id,·island_id,·updated_at",␍
@repo/library:lint:biome:      39     │ - → → → → )␍
@repo/library:lint:biome:      40     │ - → → → → .gt("updated_at",·lastSyncIso)␍
@repo/library:lint:biome:      41     │ - → → → → .order("updated_at",·{·ascending:·true·});␍
@repo/library:lint:biome:      42     │ - ␍
@repo/library:lint:biome:      43     │ - → → → if·(resourceError)·{␍

@repo/library:lint:biome:      44     │ - → → → → console.error("Fetch·resources·from·Supabase·failed:",·resourceError);␍
@repo/library:lint:biome:      45     │ - → → → → throw·resourceError;␍
@repo/library:lint:biome:      46     │ - → → → }␍
@repo/library:lint:biome:      47     │ - ␍
@repo/library:lint:biome:      48     │ - → → → //·4.·Fetch·map·layers·from·Supabase␍
@repo/library:lint:biome:      49     │ - → → → const·{·data:·layerData,·error:·layerError·}·=·await·supabase␍
@repo/library:lint:biome:      50     │ - → → → → .from("map_layers")␍
@repo/library:lint:biome:      51     │ - → → → → .select("id,·name,·category,·is_geographic,·updated_at")␍
@repo/library:lint:biome:      52     │ - → → → → .gt("updated_at",·lastSyncIso)␍
@repo/library:lint:biome:      53     │ - → → → → .order("updated_at",·{·ascending:·true·});␍
@repo/library:lint:biome:      54     │ - ␍

@repo/library:lint:biome:      55     │ - → → → if·(layerError)·throw·layerError;␍
@repo/library:lint:biome:      56     │ - ␍
@repo/library:lint:biome:      57     │ - → → → console.log(␍
apps-intuitui-web:lint:biome: cache miss, executing 08f4c5793f9f272c
@repo/library:lint:biome:      58     │ - → → → → `Sync·status:·${resourceData?.length·||·0}·resources,·${layerData?.length·||·0}·layers.`,␍
@repo/library:lint:biome:      59     │ - → → → );␍
@repo/library:lint:biome:      60     │ - ␍
@repo/library:lint:biome:      61     │ - → → → let·latestTimestamp·=·lastSync;␍

@repo/library:lint:biome:      62     │ - ␍
@repo/library:lint:biome:      63     │ - → → → //·5.·Upsert·Resources␍
@repo/library:lint:biome:      64     │ - → → → if·(resourceData·&&·resourceData.length·>·0)·{␍
@repo/library:lint:biome:      65     │ - → → → → const·nodesToUpsert:·KnowledgeNodeIndex[]·=·resourceData.map((res)·=>·({␍
@repo/library:lint:biome:      66     │ - → → → → → id:·res.id,␍
@repo/library:lint:biome:      67     │ - → → → → → type:·"resource",␍
@repo/library:lint:biome:      68     │ - → → → → → content_type:·res.type,␍
@repo/library:lint:biome:      69     │ - → → → → → title_si:·res.language·===·"sinhala"·?·res.title·:·null,␍

@repo/library:lint:biome:      70     │ - → → → → → title_ta:·res.language·===·"tamil"·?·res.title·:·null,␍
@repo/library:lint:biome:      71     │ - → → → → → title_en:·res.language·===·"english"·?·res.title·:·null,␍
@repo/library:lint:biome:      72     │ - → → → → → tags:·Array.isArray(res.tags)·?·res.tags.join(",·")·:·res.tags·||·"",␍
@repo/library:lint:biome:      73     │ - → → → → → map_x:·res.map_x·||·0,␍
@repo/library:lint:biome:      74     │ - → → → → → map_y:·res.map_y·||·0,␍
@repo/library:lint:biome:      75     │ - → → → → → latitude:·res.latitude,␍
@repo/library:lint:biome:      76     │ - → → → → → longitude:·res.longitude,␍
@repo/library:lint:biome:      77     │ - → → → → → parent_id:·res.parent_id,␍

@repo/library:lint:biome:      78     │ - → → → → → island_id:·res.island_id,␍
@repo/library:lint:biome:      79     │ - → → → → → updated_at:·new·Date(res.updated_at).getTime(),␍
@repo/library:lint:biome:      80     │ - → → → → }));␍
@repo/library:lint:biome:      81     │ - → → → → await·knowledgeDB.upsertNodes(nodesToUpsert);␍
@repo/library:lint:biome:      82     │ - → → → → latestTimestamp·=·Math.max(␍
@repo/library:lint:biome:      83     │ - → → → → → latestTimestamp,␍
@repo/library:lint:biome:      84     │ - → → → → → nodesToUpsert[nodesToUpsert.length·-·1]!.updated_at,␍
@repo/library:lint:biome:      85     │ - → → → → );␍
@repo/library:lint:biome:      86     │ - → → → }␍
@repo/library:lint:biome:      87     │ - ␍

@repo/library:lint:biome:      88     │ - → → → //·6.·Upsert·Layers␍
@repo/library:lint:biome:      89     │ - → → → if·(layerData·&&·layerData.length·>·0)·{␍

@repo/library:lint:biome:      90     │ - → → → → const·layersToUpsert·=·layerData.map((l)·=>·({␍
@repo/library:lint:biome:      91     │ - → → → → → ...l,␍
@repo/library:lint:biome:      92     │ - → → → → → updated_at:·new·Date(l.updated_at).getTime(),␍
@repo/library:lint:biome:      93     │ - → → → → }));␍
@repo/library:lint:biome:      94     │ - → → → → await·knowledgeDB.upsertLayers(layersToUpsert);␍

@repo/library:lint:biome:      95     │ - → → → → latestTimestamp·=·Math.max(␍
@repo/library:lint:biome:      96     │ - → → → → → latestTimestamp,␍
@repo/library:lint:biome:      97     │ - → → → → → layersToUpsert[layersToUpsert.length·-·1]!.updated_at,␍
@repo/library:lint:biome:      98     │ - → → → → );␍
@repo/library:lint:biome:      99     │ - → → → }␍
@repo/library:lint:biome:     100     │ - ␍

@repo/library:lint:biome:     101     │ - → → → //·7.·Update·sync·state␍
@repo/library:lint:biome:     102     │ - → → → if·(latestTimestamp·>·lastSync)·{␍
@repo/library:lint:biome:     103     │ - → → → → await·knowledgeDB.runAsync(␍
@repo/library:lint:biome:     104     │ - → → → → → "INSERT·OR·REPLACE·INTO·sync_state·(key,·last_sync_timestamp,·sync_status)·VALUES·(?,·?,·?)",␍

apps-neevsk-web:lint:biome: cache miss, executing 22ea3d40f4f893b6

@repo/database:lint:biome: cache miss, executing aba555e1d748bb4a

@repo/platform-mcp:lint:biome: cache miss, executing faae6c43f336f533

@repo/self:lint:biome: cache miss, executing e1e6c79b27c8de53

@repo/payments:lint:biome: cache miss, executing b3db607e9310f85a

@repo/classroom:lint:biome: cache miss, executing 8272f5d214560a15

@intuitui-labs/lk-edu-geo:lint:biome: cache miss, executing 5b1882cd80aae498

@repo/admin:lint:biome: cache miss, executing 9c3b79e56b11af1a

@repo/scanner-kit:lint:biome: cache miss, executing 3404c201e25f050f

@repo/ai:lint:biome: cache miss, executing 4bdf8e0067230890

@repo/profile:lint:biome: cache miss, executing 632722436a7d1cc0

 ERROR  @repo/workforce#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\workforce) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run lint:biome exited (1)


 Tasks:    0 successful, 26 total
Cached:    0 cached, 26 total
  Time:    7.05s 
Failed:    @repo/workforce#lint:biome


 ERROR  run failed: command  exited (1)

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-08T15:57:27.125Z

>>> Command: pnpm turbo run check-types

--------------------------------------------------------------------------------

• turbo 2.9.4


   • Packages in scope: @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/profile, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile
   • Running check-types in 29 packages
   • Remote caching disabled


apps-edlove-web:check-types: cache miss, executing d6196b5d09b140d5

@repo/schema:check-types: cache miss, executing 3e67804fa142ed98

@repo/platform-mcp:check-types: cache miss, executing 70f7a505502a4374

apps-intuitui-web:check-types: cache miss, executing 531d13043bd1c0b9

apps-neevsk-web:check-types: cache miss, executing 2c03b0b446e003a8

@repo/types-shim:check-types: cache hit, replaying logs 0017141e3826f77a

@repo/types-shim:check-types: 
@repo/types-shim:check-types: > @repo/types-shim@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:check-types: > pnpm exec tsc --noEmit
@repo/types-shim:check-types: 

@repo/schema:check-types: 
@repo/schema:check-types: > @repo/schema@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\schema
@repo/schema:check-types: > pnpm exec tsc --noEmit
@repo/schema:check-types: 

apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec tsc --noEmit
apps-neevsk-web:check-types: 

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec tsc --noEmit
apps-intuitui-web:check-types: 

apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec tsc --noEmit
apps-edlove-web:check-types: 

@repo/platform-mcp:check-types: 
@repo/platform-mcp:check-types: > @repo/platform-mcp@0.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\platform-mcp
@repo/platform-mcp:check-types: > pnpm exec tsc --noEmit
@repo/platform-mcp:check-types: 

@repo/database:check-types: cache miss, executing 82508adebd8007f6

@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > pnpm exec tsc --noEmit
@repo/database:check-types: 

@repo/core:check-types: cache miss, executing 48979584b6fbd73a

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 

@repo/core:check-types: src/adapters/native/NativeDeviceIdentityAdapter.ts(1,27): error TS2307: Cannot find module 'react-native-keychain' or its corresponding type declarations.

@repo/core:check-types: src/adapters/supabase/communityRepository.ts(5,25): error TS2305: Module '"../../types"' has no exported member 'PollStatus'.
@repo/core:check-types: src/adapters/zenstack/profileRepository.ts(98,3): error TS2739: Type '{ getUserProfile(userId: string): Promise<User | null>; getUserProfileAsOf(userId: string, asOf: string): Promise<User | null>; getUserProfileHistory(userId: string, limit?: number): Promise<...>; ... 13 more ...; getSchoolPulse(schoolId: string, options: ProfileTemporalReadOptions): Promise<...>; }' is missing the following properties from type 'ProfileRepository': getUserPreferences, updateUserPreferences
@repo/core:check-types: src/api/classrooms.ts(51,12): error TS2352: Conversion of type 'Promise<any>' to type '{ total_students: number; average_attendance: number; pending_assignments: number; active_classrooms: number; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
@repo/core:check-types:   Type 'Promise<any>' is missing the following properties from type '{ total_students: number; average_attendance: number; pending_assignments: number; active_classrooms: number; }': total_students, average_attendance, pending_assignments, active_classrooms

@repo/core:check-types: src/api/identity.ts(35,5): error TS2739: Type 'User' is missing the following properties from type '{ [x: string]: unknown; id: string; full_name: string; citizenship: string; pricing_tier: string; subjects_taught: string[]; qualifications: string[]; created_at: string; email?: string | null | undefined; ... 17 more ...; last_seen_at?: string | ... 1 more ... | undefined; }': citizenship, pricing_tier

@repo/core:check-types: src/api/identity.ts(42,43): error TS2345: Argument of type 'Partial<{ [x: string]: unknown; id: string; full_name: string; citizenship: string; pricing_tier: string; subjects_taught: string[]; qualifications: string[]; created_at: string; email?: string | null | undefined; ... 17 more ...; last_seen_at?: string | ... 1 more ... | undefined; }>' is not assignable to parameter of type 'Partial<User>'.
@repo/core:check-types:   Types of property 'profile_completed' are incompatible.

@repo/core:check-types:     Type 'boolean | null | undefined' is not assignable to type 'boolean | undefined'.
@repo/core:check-types:       Type 'null' is not assignable to type 'boolean | undefined'.

@repo/core:check-types: src/api/runtimes/classroomNotes.runtime.ts(1,56): error TS2307: Cannot find module '../../adapters/supabase/classroomNotesRepository' or its corresponding type declarations.
@repo/core:check-types: src/api/runtimes/profile.runtime.ts(10,5): error TS2554: Expected 2 arguments, but got 1.

@repo/core:check-types: src/hooks/useAuthorityLifecycle.ts(118,9): error TS2322: Type 'AuthSession | null' is not assignable to type 'Session | null'.
@repo/core:check-types:   Type 'AuthSession' is missing the following properties from type 'Session': expires_in, token_type
@repo/core:check-types: src/hooks/useFeatureRegistry.ts(2,62): error TS1149: File name 'C:/Users/Naween/projects/polymath-platform/packages/core/src/types/workspace.ts' differs from already included file name 'C:/Users/Naween/projects/polymath-platform/packages/core/src/types/Workspace.ts' only in casing.
@repo/core:check-types:   The file is in the program because:
@repo/core:check-types:     Imported via './Workspace' from file 'C:/Users/Naween/projects/polymath-platform/packages/core/src/types/index.ts'
@repo/core:check-types:     Imported via "../types/workspace" from file 'C:/Users/Naween/projects/polymath-platform/packages/core/src/hooks/useFeatureRegistry.ts'
@repo/core:check-types:     Matched by include pattern 'src/**/*' in 'C:/Users/Naween/projects/polymath-platform/packages/core/tsconfig.json'
@repo/core:check-types: src/hooks/useFeatureRegistry.ts(48,6): error TS2322: Type 'boolean | undefined' is not assignable to type 'boolean'.
@repo/core:check-types:   Type 'undefined' is not assignable to type 'boolean'.
@repo/core:check-types: src/index.ts(12,10): error TS2300: Duplicate identifier 'marksToGPA'.
@repo/core:check-types: src/index.ts(13,10): error TS2300: Duplicate identifier 'marksToGPA'.
@repo/core:check-types: src/logic/domains/community/ports.ts(1,25): error TS2305: Module '"../../../types"' has no exported member 'PollStatus'.
@repo/core:check-types: src/logic/domains/factory.ts(5,56): error TS2307: Cannot find module '../../adapters/supabase/classroomNotesRepository' or its corresponding type declarations.
@repo/core:check-types: src/logic/index.ts(18,8): error TS2300: Duplicate identifier 'InviteCodeData'.
@repo/core:check-types: src/logic/index.ts(19,3): error TS2300: Duplicate identifier 'incrementInviteCodeUsage'.
@repo/core:check-types: src/logic/index.ts(20,3): error TS2300: Duplicate identifier 'validateInviteCode'.
@repo/core:check-types: src/logic/index.ts(23,8): error TS2300: Duplicate identifier 'InviteCodeData'.
@repo/core:check-types: src/logic/index.ts(24,3): error TS2300: Duplicate identifier 'incrementInviteCodeUsage'.
@repo/core:check-types: src/logic/index.ts(25,3): error TS2300: Duplicate identifier 'validateInviteCode'.
@repo/core:check-types: src/logic/index.ts(77,1): error TS2308: Module './domains' has already exported a member named 'UserPreferences'. Consider explicitly re-exporting to resolve the ambiguity.
@repo/core:check-types: src/logic/managers/AuthManager.ts(83,7): error TS2353: Object literal may only specify known properties, and 'citizenship' does not exist in type 'Partial<User>'.

@repo/core:check-types: src/logic/managers/CommunityManager.ts(2,25): error TS2305: Module '"../../types"' has no exported member 'PollStatus'.
@repo/core:check-types: src/logic/managers/DeepLinkManager.ts(46,51): error TS4111: Property 'access_token' comes from an index signature, so it must be accessed with ['access_token'].
@repo/core:check-types: src/logic/managers/DeepLinkManager.ts(55,21): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
@repo/core:check-types:   Type 'undefined' is not assignable to type 'string'.
@repo/core:check-types: src/logic/managers/DeepLinkManager.ts(77,33): error TS4111: Property 'access_token' comes from an index signature, so it must be accessed with ['access_token'].
@repo/core:check-types: src/logic/managers/DeepLinkManager.ts(78,34): error TS4111: Property 'refresh_token' comes from an index signature, so it must be accessed with ['refresh_token'].
@repo/core:check-types: src/logic/managers/EducationalManager.ts(6,28): error TS2307: Cannot find module '../../../lib/grading' or its corresponding type declarations.
@repo/core:check-types: src/logic/managers/EducationalManager.ts(7,26): error TS2307: Cannot find module '../../../types/API' or its corresponding type declarations.
@repo/core:check-types: src/logic/managers/EducationalManager.ts(14,8): error TS2307: Cannot find module '../../schemas/classroom.schema' or its corresponding type declarations.

@repo/core:check-types: src/logic/managers/EducationalManager.ts(78,24): error TS2339: Property 'emitSilent' does not exist on type 'GrowthManager'.
@repo/core:check-types: src/logic/managers/EducationalManager.ts(94,26): error TS2339: Property 'emitSilent' does not exist on type 'GrowthManager'.

@repo/core:check-types: src/logic/managers/EducationalManager.ts(97,54): error TS4111: Property 'classroom_id' comes from an index signature, so it must be accessed with ['classroom_id'].
@repo/core:check-types: src/logic/managers/EducationalManager.ts(270,29): error TS2304: Cannot find name 'LessonMaterial'.
@repo/core:check-types: src/logic/managers/EducationalManager.ts(271,43): error TS2304: Cannot find name 'LessonMaterial'.
@repo/core:check-types: src/logic/managers/EducationalManager.ts(294,24): error TS2339: Property 'emitSilent' does not exist on type 'GrowthManager'.

@repo/core:check-types: src/logic/managers/PushNotificationManager.ts(47,33): error TS4111: Property 'url' comes from an index signature, so it must be accessed with ['url'].
@repo/core:check-types: src/logic/managers/TeacherManager.ts(2,22): error TS2307: Cannot find module '../../../types' or its corresponding type declarations.
@repo/core:check-types: src/logic/managers/TeacherManager.ts(3,26): error TS2307: Cannot find module '../../../types/API' or its corresponding type declarations.

@repo/core:check-types: src/logic/permissions/composer.test.ts(7,9): error TS2739: Type '{ user_id: string; userId: string; email: string; school_id: string; schoolId: string; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; ... 14 more ...; classroom_id: null; }' is missing the following properties from type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...': citizenship, pricing_tier

@repo/core:check-types: src/logic/permissions/hooks/usePermissions.ts(25,11): error TS2739: Type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 21 more ...; classr...' is missing the following properties from type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...': citizenship, pricing_tier

@repo/core:check-types: src/logic/schemas/feature-registry.schema.ts(19,15): error TS2554: Expected 2-3 arguments, but got 1.
@repo/core:check-types: src/logic/schemas/index.ts(12,1): error TS2308: Module './classroom.schema' has already exported a member named 'Lesson'. Consider explicitly re-exporting to resolve the ambiguity.
@repo/core:check-types: src/logic/schemas/index.ts(12,1): error TS2308: Module './classroom.schema' has already exported a member named 'LessonSchema'. Consider explicitly re-exporting to resolve the ambiguity.

@repo/core:check-types: src/native/runtimeAdapter.ts(6,33): error TS2307: Cannot find module 'expo-background-task' or its corresponding type declarations.
@repo/core:check-types: src/native/runtimeAdapter.ts(7,30): error TS2307: Cannot find module 'expo-task-manager' or its corresponding type declarations.
@repo/core:check-types: src/native/runtimeAdapter.ts(8,32): error TS2307: Cannot find module 'expo-notifications' or its corresponding type declarations.
@repo/core:check-types: src/native/runtimeAdapter.ts(26,23): error TS2307: Cannot find module 'expo-font' or its corresponding type declarations.
@repo/core:check-types: src/native/runtimeAdapter.ts(175,62): error TS7006: Parameter 'token' implicitly has an 'any' type.
@repo/core:check-types: src/native/useAuthorityLifecycle.ts(114,20): error TS2345: Argument of type 'AuthSession | null' is not assignable to parameter of type 'SetStateAction<Session | null>'.
@repo/core:check-types:   Type 'AuthSession' is not assignable to type 'SetStateAction<Session | null>'.
@repo/core:check-types:     Type 'AuthSession' is missing the following properties from type 'Session': expires_in, token_type
@repo/core:check-types: src/native/useAuthorityLifecycle.ts(115,24): error TS2345: Argument of type 'AuthSession | null' is not assignable to parameter of type 'Session | null'.
@repo/core:check-types:   Type 'AuthSession' is missing the following properties from type 'Session': expires_in, token_type
@repo/core:check-types: src/store/resetScopedStores.ts(49,51): error TS2345: Argument of type '{ user_id: null; userId: null; email: null; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; role: null; traits: never[]; ... 14 more ...; classroom_id: null; }' is not assignable to parameter of type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...'.
@repo/core:check-types:   Type '{ user_id: null; userId: null; email: null; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; role: null; traits: never[]; ... 14 more ...; classroom_id: null; }' is missing the following properties from type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...': citizenship, pricing_tier

@repo/core:check-types: src/store/slices/feature.slice.ts(23,30): error TS2345: Argument of type '{ user_id: null; userId: null; email: null; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; role: null; traits: never[]; ... 14 more ...; classroom_id: null; }' is not assignable to parameter of type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...'.
@repo/core:check-types:   Type '{ user_id: null; userId: null; email: null; bonds: never[]; primary_capacity: null; primaryCapacity: null; active_bond: null; activeBond: null; active_bond_status: string; role: null; traits: never[]; ... 14 more ...; classroom_id: null; }' is missing the following properties from type '{ user_id: string | null; userId: string | null; email: string | null; bonds: { [x: string]: unknown; id: string; user_id: string; entity_id: string; entity_type: "PLATFORM" | "SCHOOL" | "CLASSROOM" | "COMMUNITY" | "PERSONAL" | "GUEST"; ... 6 more ...; metadata?: Record<...> | undefined; }[]; ... 23 more ...; flags:...': citizenship, pricing_tier
@repo/core:check-types: src/types/API.ts(3,14): error TS2415: Class 'APIError' incorrectly extends base class 'SovereignError'.
@repo/core:check-types:   Property 'details' is optional in type 'APIError' but required in type 'SovereignError'.

@repo/core:check-types: src/types/API.ts(7,5): error TS4115: This parameter property must have an 'override' modifier because it overrides a member in base class 'SovereignError'.

@repo/core:check-types:  ELIFECYCLE  Command failed with exit code 2.

 ERROR  @repo/core#check-types: command (C:\Users\Naween\projects\polymath-platform\packages\core) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run check-types exited (2)


 Tasks:    7 successful, 8 total
Cached:    1 cached, 8 total
  Time:    34.748s 
Failed:    @repo/core#check-types


 ERROR  run failed: command  exited (2)


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 36.2s

Findings: 59

Log File: reports/check-types.txt

--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-08T15:58:05.284Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-circular
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src
/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  error no-circular: packages/core/src/logic/managers/NotificationManager.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/NotificationManager.ts
  error no-circular: packages/core/src/logic/managers/GrowthManager.ts → 
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/GrowthManager.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/ProfileManager.ts →
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/NotificationManager.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/GrowthManager.ts →
      packages/core/src/api/growthSignals.generated.ts →
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/EducationalManager.ts → 
      packages/core/src/logic/managers/GrowthManager.ts →
      packages/core/src/api/growthSignals.generated.ts →
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/EducationalManager.ts
  error no-circular: packages/core/src/logic/managers/EducationalManager.ts → 
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/EducationalManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/hooks/useNotifications.ts → 
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/hooks/useNotifications.ts
  error no-circular: packages/core/src/api/growthSignals.ts → 
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts
  error no-circular: packages/core/src/api/growthSignals.generated.ts → 
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts →
      packages/core/src/api/growthSignals.generated.ts
  error no-circular: packages/core/src/api/deviceTrust.ts → 
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts →
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/lib/security/deviceTrust.ts →
      packages/core/src/api/deviceTrust.ts
  error no-circular: packages/core/src/adapters/zenstack/profileRepository.ts → 
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/zenstack/profileRepository.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabase/profileRepository.ts → 
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts
  error no-circular: packages/core/src/adapters/supabase/profileRepository.ts → 
      packages/core/src/api/media.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts

x 88 dependency violations (20 errors, 68 warnings). 2012 modules, 6416 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 11.5s

Findings: 20

Log File: reports/circular_deps.txt

--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

❌ Circular Dependencies check failed!
--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-08T15:58:17.887Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

>>> Filter: no-orphans
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src
/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  error no-circular: packages/core/src/logic/managers/NotificationManager.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/NotificationManager.ts
  error no-circular: packages/core/src/logic/managers/GrowthManager.ts → 
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/GrowthManager.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/ProfileManager.ts →
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/NotificationManager.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/GrowthManager.ts →
      packages/core/src/api/growthSignals.generated.ts →
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/EducationalManager.ts → 
      packages/core/src/logic/managers/GrowthManager.ts →
      packages/core/src/api/growthSignals.generated.ts →
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/EducationalManager.ts
  error no-circular: packages/core/src/logic/managers/EducationalManager.ts → 
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/EducationalManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/hooks/useNotifications.ts → 
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/hooks/useNotifications.ts
  error no-circular: packages/core/src/api/growthSignals.ts → 
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts
  error no-circular: packages/core/src/api/growthSignals.generated.ts → 
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts →
      packages/core/src/api/growthSignals.generated.ts
  error no-circular: packages/core/src/api/deviceTrust.ts → 
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts →
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/lib/security/deviceTrust.ts →
      packages/core/src/api/deviceTrust.ts
  error no-circular: packages/core/src/adapters/zenstack/profileRepository.ts → 
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/zenstack/profileRepository.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabase/profileRepository.ts → 
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts
  error no-circular: packages/core/src/adapters/supabase/profileRepository.ts → 
      packages/core/src/api/media.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts

x 88 dependency violations (20 errors, 68 warnings). 2012 modules, 6416 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.5s
Findings: 61

Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-08T15:58:31.797Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src
/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/profile/src/hooks/useTeacherProfessionalHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useStudentAcademicHistory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  error no-circular: packages/core/src/logic/managers/NotificationManager.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/NotificationManager.ts
  error no-circular: packages/core/src/logic/managers/GrowthManager.ts → 
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/GrowthManager.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/ProfileManager.ts →
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/NotificationManager.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/factory.ts → 
      packages/core/src/logic/managers/GrowthManager.ts →
      packages/core/src/api/growthSignals.generated.ts →
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts
  error no-circular: packages/core/src/logic/managers/EducationalManager.ts → 
      packages/core/src/logic/managers/GrowthManager.ts →
      packages/core/src/api/growthSignals.generated.ts →
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/EducationalManager.ts
  error no-circular: packages/core/src/logic/managers/EducationalManager.ts → 
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/EducationalManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/logic/managers/DeviceSecurityManager.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/DeviceSecurityManager.ts
  error no-circular: packages/core/src/hooks/useNotifications.ts → 
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/hooks/useNotifications.ts
  error no-circular: packages/core/src/api/growthSignals.ts → 
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts
  error no-circular: packages/core/src/api/growthSignals.generated.ts → 
      packages/core/src/api/userGrowthState.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/logic/managers/CommunityManager.ts →
      packages/core/src/api/growthSignals.ts →
      packages/core/src/api/growthSignals.generated.ts
  error no-circular: packages/core/src/api/deviceTrust.ts → 
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts →
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/lib/security/deviceTrust.ts →
      packages/core/src/api/deviceTrust.ts
  error no-circular: packages/core/src/adapters/zenstack/profileRepository.ts → 
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/zenstack/profileRepository.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/logic/ports/notification.port.ts →
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseNotification.adapter.ts → 
      packages/core/src/hooks/useNotifications.ts →
      packages/core/src/store/useNotificationStore.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseNotification.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/logic/ports/deviceSecurity.port.ts →
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts → 
      packages/core/src/api/deviceTrust.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  error no-circular: packages/core/src/adapters/supabase/profileRepository.ts → 
      packages/core/src/logic/domains/profile/ports.ts →
      packages/core/src/store/index.ts →
      packages/core/src/store/resetScopedStores.ts →
      packages/core/src/api/identity.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts
  error no-circular: packages/core/src/adapters/supabase/profileRepository.ts → 
      packages/core/src/api/media.ts →
      packages/core/src/logic/managers/factory.ts →
      packages/core/src/adapters/supabase/profileRepository.ts

x 88 dependency violations (20 errors, 68 warnings). 2012 modules, 6416 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.3s
Findings: 89
Log File: reports/architecture.txt
--------------------------------------------------------------------------------

 ELIFECYCLE  Command failed with exit code 1.

❌ Architecture Boundaries check failed!


⚠️  Hygiene checks failed. Please review the reports in the 'reports/' directory.

>>> FACILITATION & HEALING SUGGESTIONS <<<
💡 Circular Dependencies: Run 'node scripts/refactor/sovereign-cycle-checker.mjs' or 'pnpm run ai:fix'
💡 Architectural Boundaries: Run 'pnpm run check:architecture' for details

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 identity:check C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"


>>> Starting Sovereign Audit: 2026-05-08T15:58:45.704Z

>>> Command: node scripts/check-identity-alignment.mjs

--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 0.58s. Found 0 potential alignment issues.



[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 1.2s
Findings: 0

Log File: reports/identity_check.txt

--------------------------------------------------------------------------------


> polymath-platform@1.0.0 i18n:check C:\Users\Naween\projects\polymath-platform
> pnpm run i18n:audit && pnpm run i18n:no-inline-fallbacks



> polymath-platform@1.0.0 i18n:audit C:\Users\Naween\projects\polymath-platform
> node scripts/i18n/audit-keys.mjs



[en] Missing 69 translation key(s):

  - chat.empty

  - chat.historicalView

  - chat.noConversationsDesc

  - chat.noConversationsTitle

  - chat.placeholder

  - chat.tapToContinue

  - common.plant

  - community.endorse

  - community.endorsers

  - community.groups.joinAuthRequired

  - community.groups.joinedSuccess
  - community.groups.member

  - community.groups.qrHint

  - community.groups.qrTitle

  - community.hearthSubtitle

  - community.hearthTitle

  - community.manifestoCarousel

  - community.manifestoTopic

  - community.profile.defaultBio

  - community.profile.explorer

  - community.profile.memberOfGurudevi

  - community.profile.privacyProtected

  - community.profile.privateNote

  - community.profile.privateSanctuary

  - community.profile.publicPresenceOf

  - community.profile.publicResonance
  - community.profile.pulseActive

  - community.profile.recent

  - community.profile.reflection

  - community.profile.resonanceSphere

  - community.profile.verified

  - community.spotlight

  - community.viewSpotlight

  - fireJournal.errorSaving

  - grades.empty

  - invitationWelcome.desc

  - invite.error.invalid

  - invite.error.noCode

  - invite.success.joining

  - key

  - progressTree.interactionsLabel

  - progressTree.philosophy

  - self.adminDescription
  - self.founderDesc

  - self.founderDescription

  - self.gratitudePlaceholder

  - self.guardianDescription
  - self.moodHowAreYou

  - self.moodNeutral

  - self.moodPositive
  - self.moodRadiant

  - self.noWisdomYet

  - self.plantSeed

  - self.principalDesc
  - self.principalDescription

  - self.recording
  - self.recordingHint

  - self.studentDesc
  - self.studentDescription
  - self.tapToStart

  - self.teacherDesc
  - self.teacherDescription
  - self.voiceJournal

  - self.voiceJournalSubtitle
  - self.wisdomPlaceholder

  - self.wisdomSeeds

  - sleepTracker.notTime
  - sleepTracker.philosophy

  - sleepTracker.tomorrowHint

[si] Missing 116 translation key(s):
  - chat.empty

  - chat.historicalView

  - chat.noConversationsDesc
  - chat.noConversationsTitle
  - chat.placeholder
  - chat.tapToContinue
  - common.plant
  - community.endorse
  - community.endorsers
  - community.groups.joinAuthRequired
  - community.groups.joinedSuccess
  - community.groups.member
  - community.groups.qrHint
  - community.groups.qrTitle
  - community.hearthSubtitle

  - community.hearthTitle
  - community.manifestoCarousel
  - community.manifestoTopic
  - community.profile.aspiration
  - community.profile.contributions
  - community.profile.defaultBio

  - community.profile.endorsements
  - community.profile.explorer
  - community.profile.memberOfGurudevi

  - community.profile.posts
  - community.profile.privacyNote

  - community.profile.privacyProtected
  - community.profile.privateNote

  - community.profile.privateSanctuary
  - community.profile.publicPresenceOf
  - community.profile.publicResonance

  - community.profile.pulse
  - community.profile.pulseActive

  - community.profile.recent
  - community.profile.reflection
  - community.profile.reportAccount

  - community.profile.resonanceSphere
  - community.profile.resonanceStats

  - community.profile.sanctuaryHonors
  - community.profile.sendMessage

  - community.profile.verified
  - community.spotlight

  - community.viewSpotlight
  - fireJournal.errorSaving
  - grades.empty
  - invitationWelcome.desc

  - invite.error.invalid

  - invite.error.noCode
  - invite.success.joining
  - key
  - ocr.captureDescription
  - ocr.chooseFromGallery

  - ocr.permission.description
  - ocr.permission.title

  - ocr.scanning

  - ocr.takePhoto

  - ocr.tipsTitle
  - ocr.title

  - ocr.tryAgain
  - progressTree.interactionsLabel
  - progressTree.philosophy
  - scanner.controls.flip
  - scanner.controls.gallery

  - scanner.dismiss

  - scanner.errors.customBuild

  - scanner.errors.noQrFound

  - scanner.errors.scanFailed

  - scanner.instructions

  - scanner.permission.grant

  - scanner.permission.message
  - scanner.status.mlKit
  - scanner.title
  - scanner.web.cameraMessage
  - scanner.web.closeScanner

  - scanner.web.desktopHint
  - scanner.web.emptyError
  - scanner.web.pasteCode

  - scanner.web.submitCode
  - scanner.web.title
  - self.adminDescription

  - self.breathingReset
  - self.founderDesc

  - self.founderDescription
  - self.gratitudePlaceholder

  - self.guardianDescription
  - self.moodHowAreYou
  - self.moodNeutral

  - self.moodPositive
  - self.moodRadiant

  - self.noWisdomYet

  - self.plantSeed
  - self.principalDesc
  - self.principalDescription
  - self.recording

  - self.recordingHint
  - self.studentDesc
  - self.studentDescription
  - self.tapToStart

  - self.teacherDesc
  - self.teacherDescription
  - self.voiceJournal

  - self.voiceJournalSubtitle
  - self.wisdomPlaceholder
  - self.wisdomSeeds

  - sleepTracker.notTime
  - sleepTracker.philosophy

  - sleepTracker.tomorrowHint
  - tabs.class

  - tabs.platform

  - webNav.alerts

  - webNav.brandName

  - webNav.menu
  - webNav.notifications

  - webNav.settings
  - webNav.tabNavigation

  - webNav.toggleNavigation

[ta] Missing 108 translation key(s):

  - chat.empty
  - chat.historicalView
  - chat.noConversationsDesc

  - chat.noConversationsTitle

  - chat.placeholder

  - chat.tapToContinue
  - common.plant

  - community.endorse

  - community.endorsers

  - community.groups.joinAuthRequired
  - community.groups.joinedSuccess
  - community.groups.member

  - community.groups.qrHint
  - community.groups.qrTitle

  - community.hearthSubtitle

  - community.hearthTitle

  - community.manifestoCarousel

  - community.manifestoTopic
  - community.profile.aspiration

  - community.profile.contributions
  - community.profile.defaultBio

  - community.profile.endorsements

  - community.profile.explorer

  - community.profile.memberOfGurudevi
  - community.profile.posts

  - community.profile.privacyNote
  - community.profile.privacyProtected
  - community.profile.privateNote
  - community.profile.privateSanctuary

  - community.profile.publicPresenceOf

  - community.profile.publicResonance

  - community.profile.pulse

  - community.profile.pulseActive
  - community.profile.recent
  - community.profile.reflection

  - community.profile.reportAccount
  - community.profile.resonanceSphere
  - community.profile.resonanceStats

  - community.profile.sanctuaryHonors
  - community.profile.sendMessage

  - community.profile.verified
  - community.spotlight

  - community.viewSpotlight
  - fireJournal.errorSaving

  - grades.empty
  - invitationWelcome.desc
  - invite.error.invalid

  - invite.error.noCode
  - invite.success.joining

  - key
  - ocr.captureDescription

  - ocr.chooseFromGallery
  - ocr.permission.description
  - ocr.permission.title

  - ocr.scanning
  - ocr.takePhoto

  - ocr.tipsTitle
  - ocr.title
  - ocr.tryAgain

  - progressTree.interactionsLabel
  - progressTree.philosophy

  - scanner.controls.flip
  - scanner.controls.gallery
  - scanner.dismiss

  - scanner.errors.customBuild
  - scanner.errors.noQrFound

  - scanner.errors.scanFailed
  - scanner.instructions

  - scanner.permission.grant

  - scanner.permission.message
  - scanner.status.mlKit
  - scanner.title
  - scanner.web.cameraMessage
  - scanner.web.closeScanner
  - scanner.web.desktopHint

  - scanner.web.emptyError
  - scanner.web.pasteCode
  - scanner.web.submitCode

  - scanner.web.title
  - self.adminDescription

  - self.founderDesc
  - self.founderDescription
  - self.gratitudePlaceholder

  - self.guardianDescription
  - self.moodHowAreYou

  - self.moodNeutral
  - self.moodPositive

  - self.moodRadiant
  - self.noWisdomYet
  - self.plantSeed

  - self.principalDesc
  - self.principalDescription

  - self.recording
  - self.recordingHint
  - self.studentDesc

  - self.studentDescription

  - self.tapToStart
  - self.teacherDesc
  - self.teacherDescription
  - self.voiceJournal

  - self.voiceJournalSubtitle
  - self.wisdomPlaceholder
  - self.wisdomSeeds
  - sleepTracker.notTime
  - sleepTracker.philosophy
  - sleepTracker.tomorrowHint

  - tabs.class
  - tabs.platform

 ELIFECYCLE  Command failed with exit code 1.

 ELIFECYCLE  Command failed with exit code 1.

```
