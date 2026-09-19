---
title: "Gurudevi Community Domain — Functional Authority and Migration Matrix"
status: "accepted"
created: 2026-09-15
updated: 2026-09-15
tags: [gurudevi, community, migration, web, mobile, workbench, safety]
---

# Community Domain — Functional Authority and Migration Matrix

This document is the canonical functional inventory for Community while the
older exploratory documents remain useful evidence. Migration means rebuilding
the capability in the receiving platform's idiom while preserving its product
behavior; it does not mean copying React Native files or dropping a capability.

It is the sole Community authority. The similarly named architecture note
`docs/architecture/2026-09-15-community-domain-canonical.md` is only a
temporary redirect to this document and must not be treated as a second source
of truth.

## Auditable coverage counts

These counts use capabilities, not files. **Discovered** means a named source,
route, registry, contract, or migration was located. **Read-understood** means
the primary UI and data path were traced. **Materially integrated** means the
capability is reachable and has a real data boundary; a rendered card or mock
callback does not qualify. Status categories are mutually exclusive: live,
legacy-runtime-evidenced, partial, blocked, and abandoned/not migrating. A
capability may be integrated while still partial or blocked. `Live` is reserved
by the shared platform-readiness authority for a capability that has passed the
shared-plumbing gate; no Community capability has that status yet.

Current conservative totals are: **12 inventoried; 12 discovered; 8
read-understood; 5 materially integrated; 3 legacy-runtime-evidenced (not
platform Live); 6 partial; 3 blocked; 0 abandoned/not migrating.** The
exhaustive feature ledger below is the counting source; these figures must be
recalculated when rows are added or split.

## Domain boundary

Community is the shared social layer: feed and announcements, circles/groups,
direct messages, public community profiles, invitations, and safety controls.
Profile, notifications, and settings remain account destinations. Community may
emit notification events, but it does not own notification preferences or the
global notification inbox.

The Community Overview is a floor arrangement, not a workbench task. It may
arrange orientation, urgent announcements, sanctuary/galaxy group entry points,
recent conversations, and catalog furniture. Open tasks are resource-scoped
working surfaces such as a group, post discussion, or conversation.

## Functional matrix

| Capability | User job / identity | Surface and task policy | Safety, privacy, network | Delivery evidence and risk |
|---|---|---|---|---|
| Feed/posts | Read and publish community updates in the right group | Overview furniture; feed task may be scoped to group | visibility/RLS, author identity, moderation, pagination, optimistic failure | Native and browser screens exist; browser is more mature; ordering and pagination need verification |
| Announcements | Notice urgent or official information | Fixed Overview furniture, not ordinary feed sorting | authorisation, urgency, read state, quiet-hours policy | Native screen and API exist; verify browser parity |
| Groups/circles | Find, join, and participate in classroom, club, interest, and wider “galaxy” groups | Group resource task; membership mutations are resumable only when safe | membership privacy, invite policy, moderation, offline conflict rules | Native groups/details exist; browser group details exists; full parity incomplete |
| Direct messages | Continue a private conversation | Conversation resource task; realtime thread | participant privacy, block/mute, reporting, retention, realtime reconnect | Native list/thread and browser adapter exist; two ordinary reads bypass central API |
| Comments | Discuss a post | Post discussion task or transient sheet depending draft state | authorisation, abuse/reporting, deletion, threading, realtime | Intended Hono route appears absent; separate repository path exists; production path uncertain |
| Reactions/resonate | Express lightweight response | Transient action; no task | abuse throttling, idempotency, privacy | Like path exists; Resonate is currently a no-op |
| Polls | Vote and see community signal | Embedded post furniture; no task | one-vote rule, eligibility, privacy, idempotency | UI exists but counts are mock/hardcoded |
| Public profiles | Understand a community member | Profile resource destination, owned by account/profile domain | visibility, consent, block/mute, identity boundary | Native and browser variants exist; account contract must remain authoritative |
| Invitations/onboarding | Enter a group/community safely | Transient flow unless pending invitation requires recovery | token privacy, expiry, abuse prevention | Native implementation exists; browser migration required |

## Cross-cutting contracts required before feature expansion

The shared spine must provide authn/authz context, feature flags, typed API
boundaries, loading/error/empty states, accessibility semantics, privacy and
moderation hooks, retry/idempotency, realtime lifecycle, and explicit offline
policy. Community must not invent parallel versions of these facilities.

Direct Supabase reads/writes are prohibited when a request-shaped central API
can serve the operation. The only narrow exceptions are realtime subscriptions
and the PowerSync stream. The current comments dual-path and DM lookup bypasses
are migration defects, not precedent.

Offline is not currently proven as a Community product requirement. Until a
conflict, moderation, privacy, and reconciliation design is accepted, expose
read-only cached state honestly and keep mutations online-required. Never imply
that a local optimistic mutation is durable.

## Platform and Explore policy

Native and browser use the same feature identity, access decision, task
identity, and API contracts. Their components are platform adapters. Existing
`.web.tsx` files are evidence and reusable behavior references, not automatic
Next.js components.

Explore may hydrate a local/demo dataset and exercise the same floor and
interaction contracts, but it must be visibly labeled and must never write to
the real account. Features requiring a real identity, private membership,
moderation authority, or realtime delivery must show a truthful unavailable or
demo state.

Every Community feature must specify loading, failure, empty, offline, keyboard
/screen-reader, destructive-action confirmation, and permission-denied states.

## Cross-role community ground

Community is one shared ground, not separate cloned feeds per capacity. The
active perspective's validated role set may influence relevance labels,
ordering, and explicit filters such as Personal, School, or Community. Each
post, group, conversation, comment, reaction, and poll retains its own
audience/scope/visibility policy. A role tag explains relevance only: it does
not grant visibility, copy an item into another role's feed, or authorize a
mutation. Reactions and replies remain attached to their original resource
scope; queued offline mutations preserve that scope and are reauthorized when
synced.

## Known implementation divergences

- Feed handlers use reverse chronological offset pagination; no urgency/priority
  field is integrated. Announcements are the separate urgent surface.
- Comments appear to call an unregistered Hono endpoint while a Supabase
  repository contains a competing implementation. Verify the live path before
  changing ordering or adding threading.
- Comment threading is not represented by a parent-comment field.
- Poll counts and Resonate are not real persisted behavior.
- Direct-message conversation lookup and realtime fetch-by-id contain ordinary
  Supabase reads outside the central API.
- Realtime reconnect, moderation, and browser accessibility need runtime
  evidence, not just component existence.

## Delivery sequence

1. Establish the shared contracts and error/privacy/accessibility seams.
2. Build Community Overview furniture with all catalog entries truthful and
   clearly marked by delivery state; do not create fake interactive cards.
3. Complete one representative vertical slice: feed + announcements, including
   authz, empty/error/offline/read states and browser/native parity.
4. Resolve the comments API authority, then implement comments/threading.
5. Complete groups and scoped task restoration.
6. Complete DM privacy/moderation/realtime lifecycle and remove ordinary API
   bypasses.
7. Implement poll persistence and Resonate only after their contracts exist.
8. Add Explore adapters and runtime accessibility/platform evidence.

No feature is considered complete because its screen renders. Completion
requires the matrix row, a real contract, platform delivery evidence, and
failure/privacy/accessibility behavior.

## Legacy documentation disposition

These documents remain historical evidence, but this authority supersedes their
Community functional decisions after references are checked:

- `docs/files/specialized/11-community-domain-audit.md` → retain as audit
  evidence; supersede functional conclusions here, then add a supersession
  banner rather than deleting it.
- `docs/current_progress/2026-08-10-community-domain-batch.md` → retain as
  migration evidence; this matrix supersedes its delivery sequencing and
  offline assumptions.
- `docs/current_progress/2026-08-06-community-chat-foundation-phased-plan.md`
  → supersede its phase order with this document after checking inbound links
  and active-plan references.
- `apps/gurudevi-mobile/docs/current_progress/2026-08-10-community-domain-batch.md`
  → retain as mobile evidence, but point it to this canonical authority.
- `apps/gurudevi-mobile/docs/current_progress/Alpha-Beta/COMMUNITY_LIBRARY_SUMMARY.md`
  and `COMMUNITY_LIBRARY_IMPLEMENTATION_PLAN.md` → review for Community
  overlap; retain historical material only after every active reference points
  to the current domain matrix.

Before archiving or removing any candidate, run a repository reference search,
record the result in the migration control matrix, and confirm that no active
plan, route, test, or generated index depends on it. No document is deleted by
inference from similar naming alone.

## Exhaustive feature ledger

The following is the implementation ledger. “Integrated” means the capability
has a mapped owner and evidence path; it does not mean that every acceptance
criterion is complete.

| Feature | Job and identity | Lifecycle / temporal | Required seams | Native / Next / Explore status and next action |
|---|---|---|---|---|
| Feed and posts | Read or publish to a group; identity is `groupId` plus post id | Overview entry; group-scoped task; chronological present/history | group visibility, authorisation, moderation, optimistic rollback, pagination, empty/error/offline cache, keyboard semantics | `CommunityScreen.tsx` and `.web.tsx`; Next adapter exists through package export; Explore needs local fixture; implement shared contract and verify browser runtime |
| Announcements | Receive official/urgent information for a school/community | Persistent Overview furniture; date and read state; not a normal feed task | issuer capability, audience RLS, urgency policy, quiet hours, read acknowledgement, inaccessible/empty state | `AnnouncementsScreen.tsx`, `announcements.ts`, notification APIs; browser parity not proven; make announcement contract explicit |
| Groups and circles | Discover/join/manage classroom, club, interest, grade, sanctuary/galaxy groups | Group resource task; membership changes resumable only with safe draft state | invite policy, membership privacy, role authz, moderation, join/leave errors, online mutation policy | `GroupsScreen.tsx`, `GroupDetailsScreen.tsx/.web.tsx`, `useCommunityGroups`; browser details exists; complete overview catalog and capability-specific controls |
| Group chat | Converse in a group | Group-conversation task; realtime present, history temporal | participant authz, mute/block/report, retention, reconnect, send queue/idempotency, draft recovery | `GroupChatScreen.tsx/.web.tsx`, `BaseChatScreen`, `chatQueueDelivery`; native/browser adapters exist; prove reconnect and moderation behavior |
| Direct messages | Continue a private conversation | Conversation resource task; preserve draft and last read position | two-party privacy, block/mute, abuse reporting, retention, realtime reconnect, offline disclosure | `DirectMessagesListScreen`, `DirectMessageScreen.tsx/.web.tsx`; ordinary Supabase reads bypass API; replace with typed routes and test privacy boundaries |
| Comments | Discuss a post with ordered replies | Post discussion task when draft exists; otherwise transient sheet | authorisation, delete/edit, report, threading, realtime, pagination, empty/error | `CommentSheet.tsx`, community hooks/types; intended Hono route appears unregistered and no parent id is modeled; resolve API authority before UI migration |
| Reactions / Resonate | Express a lightweight response | Transient idempotent action; no task | rate limit, one-action semantics, rollback, accessible pressed state, privacy | Post reaction path exists; `handleResonate` is a no-op; define persistence/API before exposing it |
| Polls | Vote and inspect aggregate signal | Embedded post furniture; vote is a durable mutation | eligibility, one-vote rule, privacy, idempotency, closed poll state, error retry | `usePollLogic` renders but counts are hardcoded; add contract/handler and real aggregation |
| Public community profile | Identify a participant before interacting | Profile resource destination; account-owned | visibility consent, block/mute, minimal-data policy, report, loading/empty | Native and `.web.tsx` variants exist; route to account/profile authority and verify browser parity |
| Invitations | Join a group from a trusted invitation | Transient flow; pending token may be restorable | token expiry, replay prevention, issuer authz, phishing-safe copy, failure recovery | `InvitationWelcomeScreen`, `InviteCodeEntry`, onboarding exports; browser Explore adapter needed; validate token boundary |
| Presence | Know who is available without exposing excess data | Ephemeral/realtime; never a durable workbench task | consent, minimisation, stale timeout, reconnect, offline “unknown” state | `useCommunityPresence`, `CommunityPresence(.web)` and presence API; verify realtime cleanup and privacy wording |
| Safety / moderation | Mute, shield, report, and protect participation | Account/community preference state; confirmation and undo where safe | block precedence, report privacy, moderator authz, audit trail, crisis/error handling | `SocialShieldModal`, `useSocialShield`, `HeaderMoreMenu`, mute surfaces; integration is partial; map central policy and browser controls |
| Community onboarding | Understand norms and enter a safe first group | Transient orientation; no durable task unless pending invitation | consent, age/role eligibility, abuse prevention, recoverable failure | feature/onboarding files and invitation screens exist; browser/Explore flow not proven |

## Coverage report

### File-denominator inventory by functionality

The capability totals above are not file totals. This table is the auditable
file denominator for the current review. A file is counted once in its primary
functional group (even when imported by several groups); generated files,
duplicate platform re-exports, and migration filenames with no traced caller
are excluded. **Integrated** means the file is wired to a real route, hook,
API, or transport path—not merely that it exists or renders.

| Functional group | Unique files discovered | Read/understood | Materially integrated | Included evidence |
|---|---:|---:|---:|---|
| Floor, navigation, and workspace furniture | 6 | 5 | 4 | Community screen, shared workspace mapping, route registry, mobile tab routes |
| Feed, posts, and publishing | 8 | 7 | 5 | Feed hook/API, post card, create-post flow, contracts, handler |
| Groups, circles, membership, and invitations | 11 | 8 | 6 | Groups/details screens, group hooks/API, creation/member controls, invite screens |
| Group chat and direct messages | 12 | 9 | 7 | Base chat, group/DM screens, list, queue delivery, chat API, realtime wiring |
| Comments, reactions, and polls | 6 | 5 | 3 | Comment sheet/hooks, reaction logic/API, poll logic/schema |
| Identity, safety, moderation, and presence | 6 | 3 | 2 | Public profile variants, social shield, moderation menu, presence hooks/API |
| Announcements and community onboarding | 3 | 2 | 0 | Announcement screen/API and onboarding evidence |
| **Total unique audit denominator** | **52** | **39** | **27** | Counts are file-based; capability status remains the ledger of user-facing truth. |

The 39 read/understood files are the subset whose primary behavior and data
boundary were traced. The 27 integrated files are the subset reachable through
the current application path with a real boundary. These denominators do not
claim browser runtime, device, accessibility, offline, realtime-reconnect, or
production evidence; those remain acceptance gaps recorded below.

### Discovered and read/understood source files

Core package and route inventory read in this audit:

- Registry/routes: `apps/gurudevi-mobile/src/navigation/registries/communityRegistry.ts`, `app/(tabs)/community/_layout.tsx`, `index.tsx`, `direct-messages.tsx`, `direct-messages/[conversationId].tsx`, `chat/[conversationId].tsx`, `groups/[groupId].tsx`, `profile/[id].tsx`.
- Package exports/contracts: `packages/community/src/index.ts`, `api/community.ts`, `api/presence.ts`, `api/sacredMissions.ts`, `types/Community.ts`, `types/index.ts`, `constants/communityRegistry.ts`, `navigation/communityRoutes.ts`.
- Screens: `CommunityScreen.tsx`, `CommunityScreen.web.tsx`, `AnnouncementsScreen.tsx`, `BaseChatScreen.tsx`, `DirectMessagesListScreen.tsx`, `DirectMessageScreen.tsx/.web.tsx`, `GroupChatScreen.tsx/.web.tsx`, `GroupDetailsScreen.tsx/.web.tsx`, `GroupsScreen.tsx`, `UserPublicProfileScreen.tsx/.web.tsx`, invitation screens.
- Components/hooks: `CommentSheet.tsx`, `PostCard.tsx`, `CreatePostModal.tsx`, `CreateGroupModal.tsx`, `GroupCard.tsx`, `GroupMemberManagement.tsx`, `SocialShieldModal.tsx`, `HeaderMoreMenu.tsx`, `CommunityPresence(.web).tsx`, `useCommunity.ts`, `useCommunityGroups.ts`, `useCommunityPresence.ts`, `useComposerLogic.ts`, `useSocialShield.ts`.
- Reliability tests/read paths: `baseChatDeliveryRecovery.test.ts`, `chatQueueDelivery.test.ts`, `directMessagesOwnership.test.ts`, `communityRoutes.test.ts`, `entrypoints.test.ts`.

### Discovered but not fully read or runtime-verified

`PinnedResourcesShelf.tsx`, `CommunityHearth.tsx`, `ManifestoCard.tsx`,
`atproto.ts`, `onboarding.ts`, `sacredMissions.ts`, and the complete Supabase
migration history were discovered but not treated as delivery evidence here.
The broader docs `docs/files/specialized/11-community-domain-audit.md`,
`docs/current_progress/2026-08-06-community-chat-foundation-phased-plan.md`,
`docs/current_progress/2026-08-10-community-domain-batch.md`, and
`apps/gurudevi-mobile/docs/current_progress/2026-08-10-community-domain-batch.md`
were read for architectural findings; no live deployment or device/browser
session was available in this audit.

### Evidence sources integrated into this authority

Integrated evidence: package exports, mobile route wiring, native/browser
screen presence, community API method names, typed community models, presence
and chat queue tests, the existing specialized Community audit, community batch
evidence, and the registry entry. Not integrated as proof: a rendered screen
alone, a mock provider, a stale migration name, or a declared but unregistered
API route.

Known evidence gaps are live comments endpoint verification, poll persistence,
Resonate persistence, browser accessibility/runtime behavior, realtime
reconnect under network loss, moderation end-to-end behavior, keyset/offset
pagination performance, and real Explore isolation. These gaps are acceptance
work, not reasons to mark the features absent from the catalog.
