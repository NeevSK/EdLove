---
title: "API v0-to-v1 Gate A — Source-Grounded Baseline"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [api, architecture, inventory, migration, orpc, hono, gate-a]
---

# API v0-to-v1 Gate A — Source-Grounded Baseline

## Purpose and evidence boundary

This is the Gate A implementation artifact for the [inventory charter](./2026-10-23-api-v0-v1-gate-a-inventory-charter.md). It records what can be established from the checked-out source on 2026-10-23. It does not assert production reachability, live authorization correctness, client adoption, or an approved deletion decision.

The baseline is intentionally additive. Existing `/api/*` paths remain v0 compatibility surfaces until a later, explicitly approved Gate C retirement decision.

## Executive finding

The current external API is not one coherent versioned surface. It is a composite of:

1. a native oRPC handler at `/api/*`, reached through 50 explicit compatibility wildcard mounts plus a fallback catch-all;
2. 127 HTTP-described procedures in 17 source-visible oRPC contract modules;
3. dedicated ingress, webhook, AI, authentication, reward, durable-agent, OpenAPI, and SSE routes; and
4. a broad `@repo/core/api` compatibility barrel that combines legacy facades, dynamic proxy access, oRPC types, and contract exports.

That is a useful operational substrate, but it is not yet a canonical `/api/v1` domain/capability boundary. The premise for Gate B is therefore supported; a rewrite or route removal is not.

## Canonical evidence sources

| Concern | Source of evidence | Gate A interpretation |
| --- | --- | --- |
| Application composition | `apps/sanctuary-api/src/core/app.ts` | The actual Hono mount order and middleware boundary. |
| Native oRPC route reachability | `apps/sanctuary-api/src/core/routes/orpc.ts`, `nativeORPCPaths.ts` | Compatibility mount matrix, not an intentional domain map. |
| Procedure-level HTTP contracts | `packages/core/src/api/*.orpc.contract.ts` | The closest source of route/method/input/output intent. |
| Router composition | `apps/sanctuary-api/src/core/router.ts` | Current handler/domain namespace inventory. |
| Shared client surface | `packages/core/src/api/index.ts`, `client.ts`, `orpcClient.ts`, `appContract.ts` | Mixed compatibility/API SDK surface; not yet a clean v1 client. |
| Historical assertions | API documents listed below | Context only unless corroborated by the sources above. |

## Transport and route map

| Transport / boundary | Observed path or mount | Current role | Gate A disposition |
| --- | --- | --- | --- |
| Native oRPC | `/api/*` | Generic native handler fallback with explicit exceptions | Freeze as v0 compatibility; do not extend by default. |
| Native oRPC explicit mounts | 50 paths in `nativeORPCPaths.ts` | Namespace compatibility for camel-case, kebab-case, and legacy router families | Classify each during Gate B; do not infer canonicality from a mount. |
| OpenAPI adapter | `/api/openapi/*` | Read-only OpenAPI handler | Preserve; decide v1 publication policy before expansion. |
| Auth gateway | `/api/auth/*` | Sign-in, OTP, refresh, sign-out | Treat as identity boundary, not a generic BFF. |
| AI | `/api/ai/*` | Feature-gated, POA-protected route family | Keep isolated as a protected integration boundary. |
| Events stream | `/api/events/stream` | SSE handshake/heartbeat route | Gap: source-visible route does not establish authorization, replay, source, or backpressure semantics. Do not build product activity on it yet. |
| Durable agents | `/api/durable-agents/*` and `/api/inngest` | Asynchronous work orchestration | Integration/operations boundary; classify separately from user capability API. |
| Webhooks and payments | `/webhooks/*`, `/payments/payhere-webhook`, `/api/rewards/admob-ssv` | Third-party ingress | Keep outside end-user API versioning. |
| Health and API docs | `/health/*`, `/doc`, `/ui`, `/reference` | Operational and discovery paths | Preserve outside product API versioning. |

### Explicit native oRPC compatibility mounts

`/api/self/*`, `/api/learningReflections/*`, `/api/profile/*`, `/api/identity/*`, `/api/onboarding/*`, `/api/community/*`, `/api/channel/*`, `/api/messaging/*`, `/api/social/*`, `/api/announcements/*`, `/api/planBridge/*`, `/api/principalNotes/*`, `/api/principal-notes/*`, `/api/admin/*`, `/api/sync/*`, `/api/powersync/*`, `/api/dailyContent/*`, `/api/daily-content/*`, `/api/decisionJournal/*`, `/api/journalEntries/*`, `/api/sacredMissions/*`, `/api/library/*`, `/api/media/*`, `/api/authorization/*`, `/api/educational/*`, `/api/grading/*`, `/api/grades/*`, `/api/attendance/*`, `/api/guardianAssessment/*`, `/api/guardian/*`, `/api/agent/*`, `/api/thuthimal/*`, `/api/erp/*`, `/api/mapping/*`, `/api/inventory/*`, `/api/history/*`, `/api/longitudinal/*`, `/api/school-forest/*`, `/api/schoolForest/*`, `/api/privacy/*`, `/api/echoes/*`, `/api/studentPotential/*`, `/api/student-potential/*`, `/api/forms/*`, `/api/tracking/*`, `/api/warmMirror/*`, `/api/presence/*`, `/api/rewards/*`, `/api/classroom/*`, and `/api/events/*`.

The list has 50 entries; two path-name variants and names such as `planBridge` are direct evidence of migration compatibility, not proof that this is the target public vocabulary.

## Contract capability ledger

The following compact records are procedure-level source inventory. Each item is `operation (METHOD path)`. A procedure is counted only when the source module declares both `method` and `path`; modules that do not meet that condition are recorded separately.

| Contract source | Procedures | Operation records |
| --- | ---: | --- |
| `announcements.orpc.contract.ts` | 2 | `getAnnouncements (GET /announcements)`; `createAnnouncement (POST /announcements)` |
| `attendance.orpc.contract.ts` | 9 | `getByClassroom (GET /attendance/classroom)`; `record (POST /attendance/record)`; `batchRecord (POST /attendance/batch-record)`; `getSchoolPulse (GET /attendance/school-pulse)`; `getReport (GET /attendance/report)`; `getGradeClassRoster (GET /attendance/grade-class-roster)`; `getMyGradeClasses (GET /attendance/my-grade-classes)`; `quickMark (POST /attendance/quick-mark)`; `submitExcuse (POST /attendance/excuse)` |
| `channel.orpc.contract.ts` | 9 | `beginLink (POST /channels/:provider/link-attempts)`; `listMyIdentities (GET /channels/identities)`; `revokeIdentity (POST /channels/identities/:id/revoke)`; `grantConsent (POST /channels/identities/:id/consents)`; `listMyConsents (GET /channels/consents)`; `revokeConsent (POST /channels/consents/:id/revoke)`; `grantDelegation (POST /channels/delegations)`; `listMyDelegations (GET /channels/delegations)`; `revokeDelegation (POST /channels/delegations/:id/revoke)` |
| `community.orpc.contract.ts` | 26 | `getGroups (GET /community/groups)`; `createGroup (POST /community/groups)`; `getGroup (GET /community/groups/:groupId)`; `joinGroup (POST /community/groups/:groupId/join)`; `getPosts (GET /community/posts)`; `getCommunityResonance (GET /community/resonance/:userId)`; `getGroupMessages (GET /community/groups/:groupId/messages)`; `sendGroupMessage (POST /community/groups/:groupId/messages)`; `createPost (POST /community/posts)`; `toggleReaction (POST /community/posts/:postId/reactions)`; `updateMemberStatus (PATCH /community/groups/:groupId/members/status)`; `updateGroupPolicy (PATCH /community/groups/:groupId/policy)`; `getGroupMembers (GET /community/groups/:groupId/members)`; `updateMemberRole (PATCH /community/groups/:groupId/members/role)`; `approveAllMembers (POST /community/groups/:groupId/members/approve-all)`; `getComments (GET /community/posts/:postId/comments)`; `createComment (POST /community/posts/:postId/comments)`; `deleteComment (DELETE /community/comments/:commentId)`; `toggleCommentUpvote (POST /community/comments/:commentId/upvote)`; `markOfficialAnswer (POST /community/comments/:commentId/official)`; `getPollStatus (GET /community/polls/:postId)`; `voteInPoll (POST /community/polls/:postId/vote)`; `updatePost (PATCH /community/posts/:postId)`; `deletePost (DELETE /community/posts/:postId)`; `getReactionStatus (GET /community/posts/:postId/reaction)`; `reportContent (POST /community/report)` |
| `events.orpc.contract.ts` | 1 | `dispatch (POST /events/dispatch)` |
| `identity.orpc.contract.ts` | 6 | `capabilityBootstrap (GET /capabilities/bootstrap/v1)`; `selectActiveScope (PUT /identity/active-scope)`; `resolveWorkspaceContext (GET /identity/classroom-capacity-summary/:id)`; `modifyUserProfile (PATCH /identity/profile/:id)`; `fetchUserProfile (GET /identity/profile/:id)`; `identifyActiveCitizen (GET /identity/resolveIdentity)` |
| `library.orpc.contract.ts` | 20 | `createCollection (POST /library/collections)`; `getCollections (GET /library/collections)`; `getCollection (GET /library/collections/:id)`; `updateCollection (PUT /library/collections/:id)`; `deleteCollection (DELETE /library/collections/:id)`; `forkCollection (POST /library/collections/:id/fork)`; `addToCollection (POST /library/collections/:id/resources)`; `removeFromCollection (DELETE /library/collections/:id/resources/:resourceId)`; `getCounts (GET /library/counts)`; `getMapTopology (GET /library/map/topology)`; `createResource (POST /library/resources)`; `getResources (GET /library/resources)`; `getResource (GET /library/resources/:id)`; `updateResource (PUT /library/resources/:id)`; `deleteResource (DELETE /library/resources/:id)`; `reportBrokenLink (POST /library/resources/:id/broken-link)`; `engage (POST /library/resources/:id/engage)`; `verifyResource (POST /library/resources/:id/verify)`; `getBookmarkedResources (GET /library/resources/bookmarked)`; `searchLibrary (POST /library/resources/search)` |
| `mapping.orpc.contract.ts` | 4 | `getSchoolPulse (GET /mapping/schools/:schoolId/pulse)`; `getById (GET /mapping/topologies/:id)`; `upsert (PUT /mapping/topologies/:id)`; `createShareLink (POST /mapping/topologies/:id/share)` |
| `messaging.orpc.contract.ts` | 4 | `getOrCreateConversation (POST /messaging/conversations)`; `getConversations (GET /messaging/conversations)`; `getMessages (GET /messaging/messages)`; `sendMessage (POST /messaging/messages)` |
| `onboarding.orpc.contract.ts` | 4 | `completeOnboarding (POST /identity/complete-onboarding)`; `createInitialBond (POST /identity/initial-bond)`; `revokeSchoolBond (DELETE /identity/school-bond/:schoolId)`; `createFounderSchoolBond (POST /identity/school-founder-bond)` |
| `planBridge.orpc.contract.ts` | 12 | `listMyGradeClasses (GET /plan/grade-classes)`; `getSettings (GET /plan/settings)`; `updateQuietHours (POST /plan/settings/quiet-hours)`; `listEvents (GET /plan/events)`; `createEvent (POST /plan/events)`; `previewNotice (POST /plan/notices/preview)`; `scheduleNotice (POST /plan/notices)`; `cancelNotice (POST /plan/notices/cancel)`; `listNotices (GET /plan/notices)`; `verifyGuardianLink (POST /plan/guardian-links/verify)`; `updateModePolicy (POST /plan/settings/policy)`; `listGuardianLinks (GET /plan/guardian-links)` |
| `principalNotes.orpc.contract.ts` | 5 | `getAll (GET /principal-notes)`; `getRecent (GET /principal-notes/recent)`; `create (POST /principal-notes)`; `update (PATCH /principal-notes/:id)`; `delete (DELETE /principal-notes/:id)` |
| `privacy.orpc.contract.ts` | 2 | `getPrivacyLedger (GET /privacy/ledger)`; `logPrivacyEvent (POST /privacy/ledger/events)` |
| `profile.orpc.contract.ts` | 3 | `getSocialLinks (GET /profile/social-links)`; `upsertSocialLink (PUT /profile/social-links)`; `deleteSocialLink (DELETE /profile/social-links/:id)` |
| `rewards.orpc.contract.ts` | 9 | `getRewards (GET /rewards)`; `getRewardsHistory (GET /rewards/history)`; `getRewardsAsOf (GET /rewards/as-of)`; `getRewardsRangeHistory (GET /rewards/range-history)`; `initializeRewards (POST /rewards/initialize)`; `addPoints (POST /rewards/add-points)`; `awardBadge (POST /rewards/award-badge)`; `checkAndAwardAchievements (POST /rewards/check-achievements)`; `getWhisperedMoments (GET /rewards/whispered-moments)` |
| `social.orpc.contract.ts` | 8 | `getNotifications (GET /social/notifications)`; `getUnreadNotificationCount (GET /social/notifications/unread-count)`; `markNotificationRead (POST /social/notifications/read)`; `markAllNotificationsRead (POST /social/notifications/read-all)`; `blockUser (POST /social/block)`; `unblockUser (POST /social/unblock)`; `isBlockingActive (GET /social/block/active)`; `getBlockedUsers (GET /social/block/list)` |
| `sync.orpc.contract.ts` | 3 | `getMutationReceipt (GET /powersync/mutation/:mutationId)`; `uploadBatch (POST /powersync/upload)`; `patchWorkspaceLayout (POST /sync/patchWorkspaceLayout)` |

### Ledger cautions

- The source scan records **127** method/path procedures. The compact table intentionally records the full procedure list per contract module; the numeric count is the audit checksum.
- `admin.orpc.contract.ts`, `agent.orpc.contract.ts`, `dailyContent.orpc.contract.ts`, `educational.orpc.contract.ts`, and `self.orpc.contract.ts` are present among the 22 `*.orpc.contract.ts` files but were not counted because this scan found no sibling `method` and `path` declaration in the expected source shape. That is a classification task for Gate B, not evidence that their behavior is dead.
- The ledger has no duplicate method/path records. Procedure identity remains `contract domain + operation`, so same-named operations in different domains are not accidentally conflated.

## Machine-readable ledger and normalized checksum

The committed machine-readable companion is [`api-v0-v1-gate-a-capability-ledger.yaml`](./api-v0-v1-gate-a-capability-ledger.yaml). It carries every normalized procedure record, route family, evidence path, and classification state. It is the input to Gate B; this narrative is the reviewer-facing explanation.

## Router namespace inventory

`apps/sanctuary-api/src/core/router.ts` currently composes 43 handler namespaces: `events`, `self`, `learningReflections`, `profile`, `identity`, `onboarding`, `principalNotes`, `sync`, `dailyContent`, `decisionJournal`, `journalEntries`, `sacredMissions`, `library`, `authorization`, `educational`, `editorial`, `grading`, `attendance`, `community`, `channel`, `admin`, `messaging`, `social`, `announcements`, `guardianAssessment`, `agent`, `thuthimal`, `erp`, `mapping`, `inventory`, `history`, `longitudinal`, `schoolForest`, `media`, `tracking`, `warmMirror`, `presence`, `privacy`, `rewards`, `echoes`, `studentPotential`, `forms`, and `planBridge`.

This is an implementation namespace list, not the target domain map. It contains capabilities, bounded contexts, integrations, technical concerns, legacy aliases, and product surfaces in the same level.

## Client and direct-boundary register

| Boundary | Evidence | Finding | Gate B action |
| --- | --- | --- | --- |
| Compatibility client barrel | `packages/core/src/api/index.ts` | One public entry point exports legacy facades, dynamic API proxy aliases, oRPC items, and contracts. | Specify the v1 client export boundary before adding further consumers. |
| Contract aggregator | `packages/core/src/api/appContract.ts` | Aggregates multiple contracts with widened `Record<string, Record<string, any>>` / `Record<string, any>` escape hatches. | Replace only through an additive typed v1 composition seam; do not break current consumers. |
| oRPC Hono adaptation | `apps/sanctuary-api/src/core/orpc.ts` | Contract conversion uses a dynamic wrapper around `SovereignContract`. | Treat as v0 transport adapter; measure callers before any replacement. |
| Native route handler | `apps/sanctuary-api/src/core/routes/orpc.ts` | Explicit mounts coexist with a broad `/api/*` fallback and exception list. | Create a v1 composition route before changing fallback order. |
| Product activity | `packages/core/src/api/events.orpc.contract.ts`, `/api/events/stream` | A dispatch contract and a stream route exist, but they do not together establish a product activity ledger. | Gate B specifies event taxonomy, consent, actor/scope authority, retention, and read model. |
| Direct data callers | Source searches find direct Supabase use in API handlers/adapters and clients. | Existence alone does not prove a violation; authority and reachability need caller-by-caller classification. | Produce a bounded direct-access register; protected write paths are first priority. |

### Caller inventory checksum and triage

This register intentionally counts non-test TypeScript/TSX files. It is a discovery register, not a claim that every match represents a public request or an authorization defect.

| Search class | Files | Highest concentrations | Review meaning |
| --- | ---: | --- | --- |
| Imports of `@repo/core/api`, `api/client`, or `orpcClient` | 400 | `packages/core` 168; `apps/sanctuary-api` 52; `packages/classroom` 52; `packages/admin` 38; `apps/gurudevi-web` 26 | This is a coupling map. Separate API implementation imports from product consumers before any v1 client cutover. |
| Direct Supabase-chain patterns (`.from`, `.rpc`, `.auth`) | 198 | `packages/core` 74; `apps/gurudevi-web` 27; `packages/admin` 16; `apps/sanctuary-api` 14; `packages/community` 12 | This is an authority-review queue. Adapters and server-side repositories may be legitimate; browser and protected mutation paths need first review. |
| Raw `fetch` | 51 | `apps/gurudevi-web` 12; `packages/core` 11; `apps/gurudevi-mobile` 7; `apps/sanctuary-api` 7 | Classify as product API, third-party integration, operational callback, or internal runtime traffic before consolidation. |

First product-facing caller files to classify in Gate B are: `apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts`, `apps/gurudevi-web/lib/sanctuary/capabilityBootstrap.ts`, `apps/gurudevi-web/lib/sanctuary/selfApiClient.ts`, `apps/gurudevi-web/lib/workspace/attendance.ts`, `apps/gurudevi-web/lib/workspace/assignmentSubmissions.ts`, `apps/gurudevi-mobile/src/lib/inngestEvents.ts`, `apps/gurudevi-mobile/src/screens/DurableAgentsScreen.tsx`, `packages/classroom/src/planBridge/usePlanBridge.ts`, `packages/community/src/api/community.ts`, `packages/library/src/api/library.ts`, `packages/profile/src/api/index.ts`, and `packages/self/src/api/self.ts`.

### Duplication register

| Duplicate or overlap | Evidence | Risk | Decision required later |
| --- | --- | --- | --- |
| Contract dialect overlap | 66 legacy `*.contract.ts` files; 22 `*.orpc.contract.ts` files; 13 matching basenames: `admin`, `agent`, `community`, `educational`, `grading`, `guardian-assessment`, `identity`, `library`, `mapping`, `onboarding`, `privacy`, `profile`, `sync` | Parallel contract declarations can drift in request, response, or policy semantics. | Identify which declaration is v0 compatibility and which becomes the v1 source of truth per capability. |
| Route vocabulary aliases | `nativeORPCPaths.ts` contains camel-case/kebab-case pairs such as `dailyContent`/`daily-content`, `schoolForest`/`school-forest`, and `studentPotential`/`student-potential`; it also carries both `principalNotes` and `principal-notes`. | Client-specific route spelling can make deprecation and observability ambiguous. | Retain until caller and traffic evidence supports a removal proposal. |
| Namespace versus path mismatch | The `planBridge` router namespace serves `/plan/*` contract paths; identity/onboarding contracts share `/identity/*`; sync exposes `/powersync/*` and `/sync/*`. | A router namespace is not a domain boundary or public versioning vocabulary. | Model capability groups by authority and public path, not by handler filename. |
| Shared compatibility barrel | `index.ts` exports broad legacy and oRPC symbols, while `client.ts` re-exports it. | New consumers can continue expanding v0 coupling accidentally. | Add a narrow v1 entry point before discouraging the old barrel. |

## Documentation truth index

| Document | Current status in file | Truth role after Gate A | Reason |
| --- | --- | --- | --- |
| `docs/architecture/2026-10-23-api-v0-v1-canonicalization-plan.md` | active | Governing plan | States approved v0 freeze / v1 target direction. |
| `docs/architecture/2026-10-23-api-v0-v1-gate-a-inventory-charter.md` | active | Governing Gate A acceptance criteria | Defines deliverables and non-goals. |
| `docs/architecture/2026-10-23-sanctuary-api-vision-vs-reality-gap-audit.md` | active | Audit context | Source-grounded gap report; not a live deployment claim. |
| `docs/architecture/2026-10-23-product-activity-event-layer-and-top-down-api-design.md` | active | Product-event design direction | Separates activity, audit, receipts, and telemetry. |
| `docs/architecture/2026-10-17-orpc-v2-beta-evaluation-and-migration-spike.md` | active | Historical / reconcile | Its `/api/v1/rpc` and `/api/v2/rpc` narrative conflicts with observed current mounts and needs a dated correction, not silent overwrite. |
| `docs/architecture/2026-10-17-sovereign-api-v2-pqc-evolution-plan.md` | active | Future architecture input | Requires compatibility review against the v0/v1 terminology. |
| `apps/sanctuary-api/docs/architecture/orpc-api-architecture.md` | active | Local service guide | Must be checked against the current app composition before relying on it for rollout. |
| `apps/sanctuary-api/docs/architecture/orpc-migration-and-effect-standards.md` | active | Historical migration guidance | Does not supersede source evidence or this Gate A baseline. |
| `apps/sanctuary-api/docs/architecture/2026-07-30-orpc-test-audit.md` | active | Test-scope evidence | Useful for proof limitations; not an architecture source of truth. |
| `apps/sanctuary-api/docs/architecture/2026-08-25-comprehensive-audit-and-plan.md` | active | Historical audit | Needs explicit reconciliation rather than implied current status. |
| `apps/sanctuary-api/docs/architecture/2026-10-13-api-capability-platform-and-tooling-audit.md` | draft | Related draft | Useful input, not approved governance. |
| `packages/core/docs/current_progress/2026-05-16-api-migration-roadmap.md` | active, tagged historical | Historical | Retain for lineage; do not use for current routing decisions without source check. |
| `packages/core/docs/current_progress/2026-05-16-api-purge-implementation-plan.md` | active, tagged historical | Historical / conflicts with deletion veto | Its “purge” framing is not authorization to remove current paths. |
| `packages/core/docs/current_progress/2026-05-16-api-purge-tasks.md` | active, tagged historical | Historical | Retain; reconcile status when domain evidence is available. |

## Hostile review findings and Gate B entry conditions

1. **Do not rename a version and call it a boundary.** `/api/v1` must receive a separately composed, typed capability map; a wildcard rewrite of `/api/*` would preserve the ambiguity.
2. **Do not make activity logging a surveillance backdoor.** Product activity requires purpose, consent/visibility, minimization, retention, erasure/subject-access handling, and separation from immutable audit evidence.
3. **Do not declare the broad fallback safe.** The fallback and exception list are source-visible mechanics, not a proof of routing, authorization, or OpenAPI parity.
4. **Do not remove aliases yet.** Camel-case/kebab-case and legacy route aliases need callers, telemetry, deprecation notice, and acceptance proof before a retirement proposal.
5. **Keep the inventory executable.** The YAML companion is the normalized source of the 127-procedure checksum; CI should later verify it and the 50-mount count against contract and route source.

Gate B may start only with: (a) this normalized ledger reviewed, (b) each initial domain assigned an authority owner and source-of-truth data owner, (c) v1 error/envelope and idempotency rules selected, and (d) a testable compatibility matrix for every changed caller.
