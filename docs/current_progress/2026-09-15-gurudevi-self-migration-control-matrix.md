---
title: "Gurudevi Self Migration Control Matrix"
status: active
date: 2026-09-15
owners: [Naveen, Gurudevi platform]
tags: [self, migration, nextjs, react-native, feature-contract, registry]
authority:
  - docs/decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md
---

# Gurudevi Self Migration Control Matrix

## Purpose

This is the anti-soup control document for Self. A React Native implementation,
Metro `.web.tsx` variant, Next.js adapter, catalog entry, and renderer map must
not be mistaken for competing feature definitions. They are different layers.

Migration preserves the intended capability and rebuilds its platform boundary.
An incompatible native dependency is work to resolve, not a reason to defer or
silently narrow the feature.

## Canonical layers

| Concern | Canonical owner | Status | Non-owner rule |
| --- | --- | --- | --- |
| Feature identity, copy, zones, default ordering | `packages/self/src/features/featureCatalog.ts` | Canonical | No platform UI owns feature metadata. |
| Access, role and citizenship eligibility | `packages/self/src/features/accessPolicy.ts` | Canonical | Capacity labels do not grant authorization. |
| Overview selection, ordering, hidden/pinned/zone preferences | `packages/self/src/features/featureResolver.ts` + preferences | Canonical pure policy | Does not claim a renderer works. |
| Task, temporal and platform-delivery composition | `packages/self/src/features/featureManifest.ts` | Canonical composition | Must receive adapter delivery declarations; no default claim is evidence. |
| Native renderer binding | `packages/self/src/components/SelfFeatureRenderer.tsx` | Native adapter | Lazy import presence is not end-to-end delivery evidence. |
| Legacy renderer compatibility | `packages/self/src/components/FeatureRegistry.tsx` | Compatibility-only | Retain until every public/live caller migrates. |
| Role/domain grouping and aliases | `packages/self/src/constants/selfRegistry.ts` (`SELF_REGISTRY`) | Retain | It is not a feature renderer or delivery manifest. |
| Native visual floor/furniture | `packages/self/src/components/SelfCanvas.tsx` | Native floor | Must consume resolved contract, not recreate it. |
| Browser feature implementation/delivery | `apps/gurudevi-web/app/(sanctuary)/self/browserFeatureRegistry.ts` | Browser adapter | Must feed the manifest declaration; cannot become a second catalog. |

## Compatibility inventory

| Compatibility surface | Live callers | Retirement condition |
| --- | --- | --- |
| `FeatureRegistry.resolveFeatureContent` | mobile Self route; `StudentSelfView` | Both consume the canonical native renderer directly and external subpath audit is complete. |
| `FeatureRegistry.FEATURE_COMPONENT_MAP` | no known repository caller; public subpath compatibility | Breaking-release audit or confirmed downstream migration. Deprecated now. |
| `SelfFeatureRenderer` | `FeatureRegistry`, `SelfCanvas` | Native delivery registry has explicit typed render adapters. |
| `SELF_REGISTRY` | role views and sanctuary registry consumers | Role/domain grouping is derived from the composed feature contract with equivalent alias/access tests. |

## Required feature row before a feature is called migrated

Each canonical feature needs one maintained row with:

| Field | Required decision |
| --- | --- |
| User job | What the person can actually do, not component name. |
| Existing evidence | Legacy route/component, data use case, and relevant audit/docs. |
| Access | Resolved capability/citizenship source; anonymous/Explore behavior. |
| Lifecycle | Floor furniture, modal, transient action, resumable task, or resource/date-specific task. |
| Temporal semantics | `follow-domain`, fixed, or none; never infer global time. |
| Persistence/privacy | Account API, local Explore store, draft rules, retention wording. |
| Native adapter | Renderer and exact runtime evidence. |
| Browser adapter | Next renderer plus authenticated transport and exact runtime evidence. |
| Delivery state | `delivered`, `planned`, `blocked-with-owner`; never infer from catalog presence. |
| Acceptance | Loading, empty, error, access denied, responsive, accessibility, and persistence checks. |

## First vertical Self cohort

| Feature | Lifecycle decision | Native state | Browser state | Next migration work |
| --- | --- | --- | --- | --- |
| Fire Journal | resumable private task; temporal none | existing renderer/use case | delivered via authenticated browser adapter | audit retention wording and define Explore local policy |
| Mood Lotus | brief modal; not active task; temporal none until API supports time | existing component | delivered through authoritative mood API adapter | wire resolved account access context |
| Daily Pulse | undecided until API/use-case audit | legacy renderer exists | planned | define day semantics, use case, task/persistence policy |
| Tomorrow Prep | date-bound resumable task candidate | legacy renderer exists | planned | create authenticated transport, draft/commit and Explore policy |

## Complete Self feature inventory

This table is the maintained planning surface for every catalog feature. A
`.web.tsx` file is Metro/Web compatibility evidence, not proof of a Next.js
delivery. `planned` means the capability remains in scope; it is not removed.

| Feature | User job and scope | Lifecycle / time | Access and privacy | Offline / failure / a11y | Native | Next/browser | Explore |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `journey_timeline` | Review personal journey and progress | read floor furniture; domain horizon | `SelfJourney`; personal history | cached read, empty/error/retry; headings and timeline semantics | existing | planned | local sample timeline |
| `daily_pulse` | Record a daily energy check-in | transient daily action; domain day | `InnerPulse`; wellbeing-sensitive | retryable save, duplicate-day rule; labelled controls | existing | planned | local daily record |
| `mood_lotus` | Record and review emotional state | modal; no global time | `InnerPulse`; sensitive wellbeing data | save failure and history empty state; keyboard/dialog labels | existing | delivered API adapter | local-only mood history |
| `wisdom_seeds` | Receive or revisit reflective content | modal/read item; optional day | `InnerPulse`; content/history privacy | offline cached content; loading/error; readable content order | existing | planned | bundled/sample content |
| `study_rhythm` | Understand and plan study/focus rhythm | date-bound task candidate | `StudentDashboard`; student data | stale-data warning and retry; chart alternatives | existing | planned | local sample schedule |
| `personal_goals` | Set and review personal intentions | resource task; goal identity | `StudentDashboard`; private goals | draft/save conflict; form labels and status | existing | planned | local goals |
| `academic_grades` | Inspect academic progress | read resource task; term/date scope | `StudentDashboard`; protected academic data | explicit empty/error; table/list semantics | existing | planned | sample grades only |
| `sleep_tracker` | Record and review sleep | date-bound task; night/day | `SelfCare`; sensitive health-like data | offline queue and conflict policy; input labels | existing | planned | local sleep records |
| `joy_jar` | Capture positive moments | modal or single task; no required time | `SelfCare`; private entries | optimistic local draft/retry; dialog semantics | existing | planned | local entries |
| `gratitude_glimmers` | Practice gratitude | modal or single task; optional day | `SelfCare`; private entries | duplicate/save failure; accessible editor | existing | planned | local entries |
| `fire_journal` | Write a private reflection | resumable private task; no global time | `SelfReflection`; highest privacy/retention scrutiny | draft recovery, offline local draft, retry; labelled editor | existing | delivered authenticated adapter | local encrypted/session policy |
| `voice_journal` | Record spoken reflection | resumable task; recording session time | `SelfReflection`; microphone/audio consent and retention | permission denial, upload retry, no audio loss; transcript/audio alternatives | existing | planned Next recorder/upload | local recording policy |
| `reframe` | Examine and reframe an automatic thought | resumable guided task; no global time | `SelfReflection`; private thought data | step recovery and validation; focus order | existing | planned | local thought record |
| `tomorrow_prep` | Prepare the next day | date-bound resumable task; fixed target date | reflection plus role context; private/work split | draft/commit and date rollover; form semantics | existing | planned | local next-day plan |
| `daily_rhythm` | See a teacher’s working rhythm | date-bound/resource task | `TeacherDashboard`; role/institution data | stale timetable and retry; accessible schedule | existing | planned | sample schedule |
| `reminders` | Create and review personal/professional reminders | resource task; due-date scope | `TeacherDashboard` or guardian context | offline queue/conflict; list and form semantics | existing | planned | local reminders |
| `decisions` | Record and revisit consequential decisions | resource task; role/institution scope | teacher/principal capabilities; potentially sensitive | draft/save/error; structured labels | existing | planned | local decision examples |
| `professional_history` | Review teaching history | read resource task; date range | `TeacherDashboard`; professional history | pagination/empty/error; timeline semantics | existing | planned | sample history |
| `resonance_patterns` | Inspect leadership patterns | read analytics task; period scope | `PrincipalDashboard`; institution-sensitive | no-data/error and chart table alternative | existing | planned | synthetic sample only |
| `monthly_reflection` | Reflect on leadership month | resumable reflection; fixed month | principal/founder; private/institution policy | draft recovery; editor labels | existing | planned | local reflection |
| `governance_history` | Review governance evolution | read resource task; period/institution scope | principal/founder/admin; institution-sensitive | explicit access/empty/error; navigable timeline | existing | planned | synthetic sample only |

### Contextual duplicates are deliberate, not duplicate implementations

`tomorrow_prep`, `decisions`, and `wisdom_seeds` occur in more than one
`SELF_REGISTRY` domain because their placement changes with role or context.
They retain one catalog identity and one use case. Their resolved floor group,
access context, task key, and copy may vary. `mood_checkin` is a legacy alias,
not a second feature; it must resolve to the canonical mood feature or be
removed after stored-preference migration.

### Whole-self multi-role composition

Self is intentionally not reduced to the currently foregrounded Workspace
role. Its existing access policy can derive multiple roles, calculate role
affinity, and organize general and role-relevant furniture on one Sanctuary
floor. The platform capability bootstrap must provide the validated role set
for the selected perspective. The current `student` role fallback in role
derivation is compatibility/presentation behavior only; it must never act as
an authorization default. Role grouping changes discovery, ordering, and copy;
each feature still requires its own resolved capability and privacy policy.

## Shared plumbing gates

The following contracts are built once and consumed by every Self feature on
both platforms. They are prerequisites for a feature to be called delivered:

| Plumbing | Required contract | Can wait? |
| --- | --- | --- |
| Auth and authorization | resolved identity, citizenship, capabilities, denial and unresolved states | no |
| Feature flags | typed flag evaluation with safe-off and audit metadata | no for gated features |
| State and persistence | account adapter, Explore/local adapter, draft/commit, migration/versioning | no |
| Offline and sync | queue/conflict policy, stale indicator, retry, no silent data loss | no for writes |
| Loading/empty/error | shared state model, branded loading, truthful empty and retryable failure | no |
| Privacy | data classification, consent, retention, deletion/export behavior | no for sensitive data |
| Accessibility | keyboard/focus, labels, dialog semantics, reduced motion, chart alternatives | no |
| Temporal scope | domain horizon versus fixed task date; no global singleton leakage | no |
| Analytics | privacy-safe lifecycle and failure events | later for non-critical insights |
| Visual polish | final sanctuary composition, motion and spatial refinement | yes, after behavior |

“No” means the contract must exist before the feature integrates; it does not
mean every feature must wait for every backend endpoint. A catalog Overview
may show a planned feature with a truthful explanation, but it must not expose
an inoperative launch path.

## Sequencing decision

1. Finish and test the shared plumbing contracts above, including adapters for
   account, Explore, and offline/error states.
2. Build truthful Overview floors for Self, Workspace, Community, and Library
   from their canonical catalogs. These are structural integration milestones,
   not claims that every feature is delivered.
3. Complete Self’s first cohort (`fire_journal`, `mood_lotus`, `daily_pulse`,
   `tomorrow_prep`) end-to-end on native, Next.js, and Explore. This validates
   the plumbing against transient, modal, private, and date-bound behavior.
4. Migrate the remaining Self features row-by-row, preserving the one catalog
   identity and creating platform adapters where needed.
5. Retire compatibility layers only after live callers, stored aliases, and
   external subpaths are audited and their replacement tests are in place.
6. Begin deep Workspace implementation after this contract pattern is proven;
   Workspace adds perspective, institution, resource, and role consequences.

## Legacy documentation disposition

These documents are historical evidence, not parallel instructions. Before
archiving or deleting one, run a repository reference search and confirm that
its unique decisions are either preserved here or linked to a newer authority.

| Legacy document | Disposition | Replacement / required check |
| --- | --- | --- |
| `apps/gurudevi-mobile/docs/2026-08-27-self-feature-system-audit-and-plan.md` | supersede after migration gates are copied | this matrix plus the canvas/workbench ADR; search links and open tasks first |
| `apps/gurudevi-mobile/docs/2026-08-27-self-elegant-refactor-plan.md` | audit for overlapping sequencing, then supersede | this matrix and the implementation plan; preserve any uncaptured acceptance criteria |
| `packages/self/BASE_SELF_FEATURE_RECOVERY.md` | retain as recovery evidence until all callers are verified | `packages/self/ARCHITECTURE.md` and this matrix; check package README links |
| `packages/self/BASE_SELF_TEMPORAL_ARCHITECTURE.md` | supersede temporal guidance | domain workbench temporal ADR and this matrix; search for active imports/instructions |
| `docs/current_progress/old_docs/gurudevi-registry-agent-execution-guide.md` | archive as historical agent guidance | registry architecture plus this matrix; ensure no automation references it |
| `apps/gurudevi-mobile/docs/old_docs/feature_definitions.md` | archive after catalog parity check | `featureCatalog.ts` and this matrix; migrate any definitions not represented in code |
| `apps/gurudevi-mobile/docs/old_docs/MISSION_01_SELF.md` | retain as product intent, not implementation authority | sanctuary/domain ADRs; preserve mission language where still current |

No legacy document is removed merely because a similarly named file exists.
Retirement requires: `rg` reference audit, owner review, extraction of unique
requirements, link update, and an archive note naming the replacement.

## Alias ledger

Aliases are input normalization only; they never create additional features or
renderers. Existing stored preferences, deep links, and hashes must be passed
through `canonicalSelfFeatureId` before lookup.

| Alias(es) | Canonical feature | Origin / action |
| --- | --- | --- |
| `pulse` | `daily_pulse` | legacy navigator/hash; migrate stored IDs |
| `mood-lotus` | `mood_lotus` | legacy kebab route |
| `mood_picker`, `mood-picker`, `mood_checkin` | `mood_lotus` | legacy picker vocabulary; no separate catalog entry |
| `wisdom` | `wisdom_seeds` | legacy short route |
| `voice`, `voice-journal` | `voice_journal` | legacy short/kebab route |
| `joy`, `joy-jar` | `joy_jar` | legacy short/kebab route |
| `gratitude` | `gratitude_glimmers` | legacy short route |
| `sleep`, `sleep-tracker` | `sleep_tracker` | legacy short/kebab route |
| `tomorrow`, `tomorrow-prep` | `tomorrow_prep` | legacy short/kebab route |
| `rhythm`, `daily-rhythm` | `daily_rhythm` | legacy short/kebab route |
| `history` | `professional_history` | legacy short route |

## Coverage report (2026-09-15)

The audit began with `rg --files` rather than inferred filenames.

- Relevant Self source files discovered: **157** TypeScript/TSX files under
  `packages/self/src`.
- Relevant documentation candidates discovered: **72** Markdown/MDX files
  matching Self, feature, registry, canvas, wellbeing, reflection, or temporal
  terms across `packages/self`, `apps/gurudevi-mobile/docs`, and `docs`.
- Evidence/docs/contracts/tests discovered: **at least 34** directly relevant
  artifacts, including the catalog, registry, manifest, access policy,
  resolver, canvas persistence/store, renderer compatibility tests, role
  resolution tests, repository contracts, and the listed architecture/ADR
  documents.

### Files actually read and understood

The following sources materially informed this matrix (paths are exact):

1. `packages/self/src/features/featureCatalog.ts`
2. `packages/self/src/features/featureManifest.ts`
3. `packages/self/src/features/accessPolicy.ts`
4. `packages/self/src/features/featureResolver.ts`
5. `packages/self/src/features/userPreferences.ts`
6. `packages/self/src/features/selfCanvasStore.ts`
7. `packages/self/src/features/selfCanvasPersistence.ts`
8. `packages/self/src/constants/selfRegistry.ts`
9. `packages/self/src/components/SelfFeatureRenderer.tsx`
10. `packages/self/src/components/FeatureRegistry.tsx`
11. `packages/self/src/components/SelfCanvas.tsx`
12. `packages/self/src/components/BaseSelfView.web.tsx`
13. `packages/self/src/screens/SelfScreen.web.tsx`
14. `packages/self/src/screens/SelfScreen.unified.tsx`
15. `packages/self/src/screens/self/roleResolution.ts`
16. `packages/self/src/api/self.ts`
17. `packages/self/src/api/selfFeatureRepository.ts`
18. `packages/self/src/api/wellbeingRepository.ts`
19. `packages/self/src/api/thoughtRecordRepository.ts`
20. `packages/self/src/api/selfInsightsRepository.ts`
21. `packages/self/src/hooks/useFireJournal.ts`
22. `packages/self/src/hooks/useMoodLogs.ts`
23. `packages/self/src/hooks/useTomorrowPrep.ts`
24. `packages/self/src/hooks/useTemporalStore.ts`
25. `packages/self/src/components/FireJournal.web.tsx`
26. `packages/self/src/components/MoodLotus.web.tsx`
27. `packages/self/src/components/TomorrowPrep.web.tsx`
28. `packages/self/src/components/VoiceJournaling.web.tsx`
29. `packages/self/src/components/EnergyForecast.web.tsx`
30. `packages/self/src/components/SleepTracker.web.tsx`
31. `apps/gurudevi-web/app/(sanctuary)/self/browserFeatureRegistry.ts`
32. `apps/gurudevi-web/app/(sanctuary)/self/SelfJournalFloor.tsx`
33. `apps/gurudevi-mobile/src/components/self/SanctuaryOverviewHub.tsx`
34. `apps/gurudevi-mobile/app/(tabs)/self/index.tsx`
35. `apps/gurudevi-mobile/src/navigation/registries/selfRegistry.ts`
36. `packages/self/ARCHITECTURE.md`
37. `apps/gurudevi-mobile/docs/2026-08-27-self-feature-system-audit-and-plan.md`
38. `apps/gurudevi-mobile/docs/2026-08-27-self-elegant-refactor-plan.md`
39. `docs/decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md`
40. `docs/decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md`
41. `docs/current_progress/2026-08-31-gurudevi-registry-implementation-audit.md`
42. `docs/architecture/gurudevi-repository-registry-boundary.md`

The exact list above is the reviewed evidence set, not a claim that every
discovered file was read line-by-line. The 157 source files and 72 document
candidates include platform variants, archived components, unrelated shared
utilities, and historical plans.

### Known unreviewed or partially reviewed sources

The following remain deliberately unreviewed at feature-contract depth:

- Remaining component pairs (`DailyContentCard`, `BreathGuide`, `WindDownRitual`,
  `WelcomeModal`, `ImpactRipplesCard`, `WarmMirrorCard`, timelines, and archive
  components): mostly presentation/support furniture; review when their row is
  promoted to delivery.
- Remaining hooks (`useJourneyData`, `useEnergyForecast`, `useProgressTree`,
  `useCommunityPresence`, and related hooks): require API/privacy/offline audit
  before their features move from planned to delivered.
- Historical and archived docs outside the 42-source evidence set: retained as
  possible context, but not authoritative unless referenced by a live plan.
- Mobile Supabase migration history: schema evidence is not sufficient to
  establish current product behavior; inspect alongside current contracts when
  implementing each feature.

No delivery status in this document is promoted based solely on an unreviewed
source. Each planned row must be revisited with its exact hook, repository,
route, and tests before implementation begins.

## Auditable coverage metrics

### Denominators and calculation rules

These numbers describe the 2026-09-15 audit snapshot. They are intentionally
mechanical and can be reproduced with the `rg --files` commands described in
the audit notes above.

- A **canonical feature** is one key in `FEATURE_CATALOG`, not a registry row,
  component file, alias, or platform variant. Denominator: **21**.
- An **alias** is one key in `SELF_FEATURE_ID_ALIASES`; aliases do not increase
  feature count. Denominator: **12** alias keys (including the three mood
  picker spellings).
- A **source file discovered** is a matching `.ts`, `.tsx`, `.md`, or `.mdx`
  path returned by the stated `rg --files` filters. Denominators: **157** Self
  source files and **72** relevant document candidates.
- A **source read/understood** is a file listed under “Files actually read and
  understood”; it is not inferred from a filename or import graph. Count:
  **42** exact files.
- A **materially integrated source** is a reviewed source that changed a row,
  layer ownership rule, compatibility decision, sequencing decision, or
  delivery status in this document. Count: **42**; the evidence list is the
  exact list of materially integrated sources.
- A feature is **live** only when the named platform has a renderer, data path,
  access behavior, failure states, and relevant test/runtime evidence. A
  catalog entry or `.web.tsx` file alone cannot make it live.
- A feature is **partial** when at least one platform or lifecycle path is
  usable and another required path is missing or unverified.
- A feature is **planned** when its capability remains supported by the
  catalog/legacy implementation but the target migration path is not yet
  delivered with evidence.
- **Blocked** requires a named external or unresolved technical dependency;
  **abandoned/not migrating** requires an explicit product decision. Neither
  status may be inferred from missing files.

### Inventory by source family and function

| Source family | Discovered | Read/understood | Materially integrated | Function |
| --- | ---: | ---: | ---: | --- |
| Catalog/access/resolver/manifest/preferences | 8 | 8 | 8 | identity, authorization, placement, lifecycle, delivery |
| Registry/renderer/floor/screen composition | 12 | 7 | 7 | role grouping, native composition, compatibility |
| Self repositories and hooks | 33 | 6 | 6 | data, persistence, temporal and mutations |
| Feature component implementations | 70 | 8 | 8 | native and Metro/browser behavior evidence |
| Feature tests | 11 | 3 | 3 | contract, catalog, access, persistence evidence |
| Other Self source/support files | 23 | 3 | 3 | package boundaries and supporting behavior |
| Self/package and platform documentation | 72 | 7 | 7 | history, architecture, audits, rollout constraints |
| **Total** | **229** | **42** | **42** |

The source-family rows are mutually exclusive for this report: the first six
partition the 157 source files, while documentation is counted separately.
The 42 read/materially-integrated total is 35 source files plus 7 documents;
the earlier “42 exact sources” wording means evidence sources broadly, not 42
documents. These are files, not distinct feature capabilities.

### Capability delivery status

| Status | Count | Calculation and justification |
| --- | ---: | --- |
| Live | 0 | No feature has complete, evidence-backed native + Next/browser + Explore delivery under the current gates. |
| Partial | 2 | `fire_journal` and `mood_lotus` have usable native paths and current browser adapters, but Explore/privacy/runtime parity is incomplete. |
| Planned | 19 | Remaining catalog features have native/legacy evidence but lack complete Next/browser + Explore contracts and evidence. |
| Blocked | 0 | No feature currently has a named external dependency that makes migration impossible; missing work is owned implementation work. |
| Abandoned / not migrating | 0 | No explicit product decision has removed a canonical feature. |
| **Total canonical features** | **21** | Matches `Object.keys(FEATURE_CATALOG).length`. |

The status table is deliberately stricter than the legacy registry’s
`mobileSupport`/`webSupport` booleans. Those booleans describe intended or
historical support and are evidence to inspect, not proof of delivery. A
feature may move from planned to partial when one complete platform adapter is
verified, and to live only after all required account, Explore, privacy,
offline/error, accessibility, and runtime checks are recorded in its row.

### Evidence status by platform

| Platform/path | Features with implementation evidence | Features with complete migration evidence | Interpretation |
| --- | ---: | ---: | --- |
| Native/mobile | 21 | 0 | Existing renderers and routes exist, but unified access, lifecycle, offline, and acceptance evidence is incomplete. |
| Metro `.web.tsx` variants | 20+ | 0 | Compatibility variants exist, but they are not Next.js adapters and several use native/global assumptions. |
| Next/browser | 2 | 0 | Fire Journal and Mood Lotus have browser adapter work; parity gates are still open. |
| Explore/guest | 0 complete | 0 | Local/demo policy is defined but feature-by-feature adapters and retention guarantees remain to implement. |

These counts do not claim that every component variant has identical scope. The
“20+” notation is intentional because the source inventory includes support
components and not every `.web.tsx` file maps one-to-one to a catalog feature;
the canonical denominator remains 21 features.

## Web Self authorization/bootstrap adapter — feature spec

**Status:** readiness/specification only; no Next capability-bootstrap adapter
is complete. This section is subordinate to the accepted
[Cross-Domain Platform Readiness Authority](../decisions/2026-09-15-gurudevi-cross-domain-platform-readiness.md)
and the
[Account Destinations authority](../decisions/2026-09-15-gurudevi-account-destinations-functional-authority.md).
It does not change their API contract or authorize UI/API implementation.

### Readiness finding

The current Self route calls `resolveAuthorizedEntry`, whose trust sequence is
sound for identity authentication: verify Supabase claims, obtain a matching
session only to forward the bearer token, call Sanctuary with `cache: 'no-store'`,
and reject incomplete or subject-mismatched identity facts. It then reduces
the response to `{ displayName, activeCapacity }` and mounts Self.

That is not the new authorized-scope/capability bootstrap. The response schema
now has `scopeBootstrap`, but the browser parser is a handwritten loose
`IdentityPayload` and ignores that field. The route does not distinguish
`selection: 'needs_selection'` from a selected scope, and treats
`activeBond.capacity` as sufficient entry authorization. It also has no
capability, feature-flag, entitlement, privacy-readiness, or platform-delivery
snapshot bound to the selected scope. The current Self floor calls
`resolveSelfFeatureManifest(null, ...)`, which deliberately yields
`authorization-unresolved`; however, its catalog launch handling is based on
the separate browser renderer map, not on a server-issued Self feature
decision. Thus current copy (“available after secure check”) is not a secure
check and must not be read as authorization evidence.

The server-selected scope implementation is materially better than the old
profile-capacity/first-bond fallback: `resolvePersistedActiveBond` resolves
only the persisted pointer for the verified user and current active validity,
clears invalid pointers rather than choosing another bond, and
`buildIdentityBootstrap` combines roles only within the selected entity. The
existing API tests prove pure/mocked scope projection and the false-by-default
capacity confirmation boundary. They do not prove production routing, Cedar
decisions, Next consumption, or browser UX. The old Next mapper remains
capacity-only and is not compatible with that richer scope contract.

### Target browser boundary and payload

The Next server adapter is the only owner of this bootstrap call. It must:

1. Use `getClaims()` to verify the authenticated subject; only then obtain a
   session token for forwarding, and require `session.user.id === claims.sub`.
2. Call the authoritative Sanctuary identity/bootstrap endpoint over HTTPS
   with `Authorization: Bearer <token>`, explicit `cache: 'no-store'`, and no
   user-controlled identity, capacity, role, tenant, or scope authority.
3. Parse the versioned response with the exported strict schema. Unknown
   versions, malformed role/scope combinations, subject mismatch, or expired
   snapshot become typed unavailable/revalidation states, never “ready.”
4. Return only the minimal route projection needed by the Server Component:
   verified subject binding, identity mode/lifecycle, display name, selected
   scope identity/role labels needed for navigation, and a scope-bound feature
   decision summary with policy/entitlement/flag/privacy/delivery versions and
   expiry. Do not pass bearer tokens, raw claims, all unrelated bonds, raw
   policy data, school/classroom/student identifiers, private records, or
   server error internals into client props or rendered HTML. A deliberate
   scope picker may receive only a separately approved minimal safe list.
5. Keep response/request cache private and non-storable (`Cache-Control:
   private, no-store` at the route boundary where applicable). Never put tokens
   or scope IDs in URLs, analytics, browser storage, or logs. Browser feature
   mutations still reauthorize on the API; this expiring snapshot is only a UI
   hint.
6. Treat authenticated no-bond onboarding as Stage A, not an error converted
   into a fabricated Self role. Treat anonymous Explore/local identity as a
   separate local policy; it must not fall through to the account bearer path.

The exact Stage B snapshot fields and source versions remain owned by the
platform readiness contract. The web adapter must consume that contract, not
create a Self-only capability schema or a second authorization resolver.

### Self route consumption contract

`/self` must consume the server result as a discriminated route state:

| Bootstrap result | Self route behavior |
| --- | --- |
| signed out | private entry explanation and return-safe sign-in link |
| authenticated, onboarding incomplete / Stage A | continue onboarding; do not mount account feature launchers |
| identity ready, no selected scope | show deliberate scope/Personal Sanctuary setup state; no feature launch |
| selected scope, bootstrap loading/revalidating | retain safe shell context; feature actions disabled or loading, not inferred from cache |
| selected scope, feature denied/flag off/privacy not ready/platform unsupported | preserve catalog record with truthful locked/unavailable reason; never launch |
| selected scope, feature allowed and Next delivery declared | mount the corresponding feature using account API adapter |
| service unavailable / malformed / subject mismatch | safe retryable unavailable state; do not silently downgrade to capacity-only entry |

The initial web Self catalog currently uses a null access context. This should
remain non-launchable for any feature not explicitly proven, and must be
replaced by the shared server-computed feature decision before the catalog
claims availability. Browser renderer presence is necessary but not
sufficient: `browserFeatureRegistry` is delivery metadata only.

### Capacity-change confirmation modal contract

The API input `confirmCapacityChange` defaults to `false`; omitted and false
must retain the existing Personal Sanctuary bond capacity and compatibility
`User.capacity`. `true` updates only those two values together. For an
established account whose proposed onboarding capacity differs from its
current Personal Sanctuary bond, the web onboarding adapter must pause before
submission and present an accessible confirmation dialog:

- Explain that the change affects the primary role for the person's Personal
  Sanctuary only; it does not grant/change school, classroom, Community,
  Library, founder, admin, or developer authority.
- The safe/default action is “Keep current capacity” (No); Escape, backdrop,
  cancel, route interruption, and absent JS must never mean Yes.
- The affirmative button clearly says “Change Personal Sanctuary capacity.”
- Do not send `confirmCapacityChange: true` until affirmative activation.
- Pending submission prevents duplicate confirmation; network/API failure
  preserves the current selection and explains retry without implying that the
  change occurred.
- A successful response refreshes scope bootstrap and feature decisions;
  cached scope-bound capability data is invalidated. No confirmation is
  required for first-time creation or an unchanged value.

This is a later rendered/browser acceptance contract, not implemented UI or
G3/G4 evidence.

### G0 test plan and current evidence

G0 is pure contract/unit evidence only. It does not substitute for mocked
adapter boundaries, real API/route scenarios, rendered UI, or browser tests.

**Existing evidence discovered/read:**

- `packages/core/src/webAuthorizedEntry.test.ts`: pure tests for the old
  capacity-only mapper (ready, missing name, incomplete onboarding, missing
  capacity, malformed subject, inactive, upstream unavailable).
- `apps/sanctuary-api/src/__tests__/identity-scope-bootstrap.test.ts`: API
  contract defaults confirmation to false; tests explicit vs unconfirmed
  Personal capacity change, no fallback, same-perspective roles, and
  server-provisioned capacities.
- `apps/sanctuary-api/src/__tests__/identity-scope-context.test.ts`: mocked
  persistence query scoped by verified user and remembered bond, invalid
  preference cleared without fallback, and identity/bootstrap routes exempted
  narrowly from ordinary scope gate.
- `packages/core/src/api/identity.orpc.contract.ts`: strict v1 scope bootstrap
  schema with selected/needs-selection and active scope role projection.
- `apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts`: verified claims/session
  subject match and no-store identity fetch, but loose payload parsing and
  capacity-only projection.
- `apps/gurudevi-web/lib/sanctuary/selfApiClient.ts`: browser bearer path is
  account-only, checks current session and persistence boundary, but lacks an
  explicit `cache: 'no-store'` request option and no adapter-specific test was
  discovered.

**Required G0 acceptance suite before web adapter implementation is considered
ready:**

1. Strictly parse valid v1 `selected` and `needs_selection` payloads; reject
   unknown versions, additional authority fields, invalid entity/role shape,
   empty selected roles, a null scope paired with `selected`, and a non-null
   scope paired with `needs_selection`.
2. Purely map identity lifecycle + scope selection: pre-onboarding stays Stage
   A; missing selection never becomes an active Self route; stale/invalid
   selected scope becomes revalidation/unavailable, never a capacity fallback.
3. Bind feature decision summary to the same subject, selected bond/entity,
   roles, policy/entitlement/flag/privacy versions, delivery platform, and
   expiry. A snapshot for another subject/scope, expired snapshot, missing
   required policy version, or unknown flag/privacy state is denied/unavailable.
4. Verify safe serialization projection omits access token, raw claims,
   unrelated bond identifiers, private attributes, raw server errors, and
   unsupported records. Verify response cache metadata policy as a pure route
   contract where represented.
5. Pure onboarding confirmation decision: initial/equal capacity does not
   require confirmation; changed existing capacity requires explicit true;
   omitted/false produces no change. Confirm only Personal Sanctuary capacity
   is in scope.
6. Cover feature decision explanations for available, locked, coming soon,
   unsupported, privacy-not-ready, flag-off, and authorization-unresolved so
   the overview can never equate renderer registration with permission.

No new G0 tests were run in this audit lane. Existing tests above are evidence
of their individual pure/mocked assertions only; they do not prove browser
payload privacy, Next route behavior, UI confirmation, current deployed API
contract parity, or real authorization. The web app has Vitest installed and a
workbench-store test, but no dedicated `authorizedEntry`/Self bootstrap test
was discovered. Do not claim G0 complete until the new contract and mapper
tests exist and execute under an evidence-classified runner.

### G1/G2/G3/G4 handoff boundaries

- **G1 later:** injected fetch/auth mocks prove claim then session ordering,
  bearer subject match, endpoint/method, `cache: 'no-store'`, no token leakage,
  strict response validation, 401/403, malformed JSON, transport failure,
  non-OK, expiry/retry, and no call on signed-out claims. This is not part of
  this G0 lane.
- **G2 later:** API/route contract covers signed-out, anonymous Explore,
  pre-onboarding no-bond account, selected Personal scope, selected
  institutional scope, `needs_selection`, invalid/revoked remembered scope,
  cross-device remembered scope, explicit successful switch, subject mismatch,
  denied feature, stale lease, and service outage. Prove Self mutations still
  reauthorize and do not accept client-provided scope as authority.
- **G3 later:** rendered Next modal verifies default-No behavior, focus entry
  and return, Escape/cancel/backdrop semantics, affirmative-only boolean,
  duplicate-submit prevention, failure/retry, scope refresh after success,
  and accessible name/description/status.
- **G4 later:** browser verification of real cache headers, cookie refresh,
  route transitions, hydration/streaming behavior, responsive/landscape and
  keyboard flows. Explicitly outside this lane.

### Migration hazard and disposition

Current identity bootstrap emits `availableBonds`, including bond/entity IDs,
while the browser entry adapter presently discards these fields. Do not start
passing that entire object into client components to enable a scope picker;
define a minimal disclosure projection first. Current Self APIs authenticate
the bearer token but do not send an active-scope header. That is correct only
if the server uses the persisted selected scope for each operation; confirm
this for journal/mood handlers before relying on it. The account API client
also needs explicit cache suppression for sensitive responses and focused
boundary tests, but this lane records the requirement without changing API or
client code.

## Mandatory migration gates

1. No visual expansion before the feature contract row exists.
2. No `null` access context in an account-facing registry unless the state is explicitly authorization-unresolved and cannot launch.
3. Browser delivery declaration is supplied by the browser adapter to the composed manifest; duplicated delivery lists are a defect.
4. Native delivery is explicit and evidence-backed per feature; a lazy import is insufficient.
5. A platform-specific file is implementation evidence, never permission to bypass the shared contract.
6. Every compatibility layer has live callers, retirement conditions, and a deprecation owner.
7. Explore policy is decided with the feature's account adapter, not retrofitted later.

## Current correction sequence

1. Make the browser adapter declaration the single browser delivery input to
   `featureManifest`; remove any duplicate hard-coded browser truth.
2. Pass resolved access context into native and browser feature resolution.
3. Encode lifecycle, temporal, draft, privacy, and Explore policy for the first
   four-feature vertical cohort.
4. Complete that cohort across native, browser, and Explore before adding
   browser catalog cards for other features.
5. Recompose the final Self Overview from delivered, authorized furniture only.

## Relationship to the five-chunk plan

This is a correction within Chunk 2 (Self), not a new chunk. Chunk 1's shared
workbench spine is usable. Chunk 2 is not complete until the first vertical
cohort is real across the intended adapters and the Overview is rendered from
the resolved feature contract. Workspace must not begin as a broad UI build
until this contract pattern is proven.
