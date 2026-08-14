# API Boundary Migration Backlog

Updated: 2026-08-14

This is the companion classification for
`api-data-boundary-inventory.json`. A finding is not automatically a migration
candidate: some are native security adapters, repository boundaries, or
legacy features whose database authority is not represented in the local
schema. Those cases must be explicitly classified before the direct-access
audit can become a strict zero-finding gate.

## Core API findings

| Surface | Findings | Classification | Next action |
| --- | ---: | --- | --- |
| `deviceTrust.ts` | 6 | Native/security adapter | Keep local until a server device-attestation contract exists; add threat-model and platform-attestation review before migration. |
| `erp.ts` | 0 | Migrated with provider follow-up | Canonical accounting, invoice, receipt, and payment-intent persistence now use the server contract. External payment-provider integration remains a separate operational item. |
| `history.ts` | 0 | Migrated | All history methods now use server contracts. The generic lookup is narrowed to `classroom_notes`, validates the modeled note first, and uses a parameterized server read port. |
| `mapping.ts` | 0 | Migrated; deployment/realtime follow-up | Server-owned topology CRUD, school pulse authorization, and expiring share links are implemented. Apply the migration in deployment and migrate the remaining realtime subscription separately. |
| `inventory.ts` | 0 | Migrated | Inventory items and school request/resource-need reads now use the server contract with school-scoped policy metadata. |
| `schoolForest.ts` | 0 | Migrated derived read model | Gratitude gifts, overview, live fallback, and pulse now use Sanctuary-owned reads and writes. Refresh authority remains a staging/deployment concern, not a client database bypass. |
| `privacy.ts` | 0 | Migrated | Privacy ledger reads and writes now use actor-derived Sanctuary handlers and parameterized server queries. |
| `echo.ts` | 0 | Migrated | Student echo creation, scoped reads, teacher response, and read acknowledgement now use a server contract with server-side anonymity handling. |
| `classroom.ts` | 5 | Unmodeled legacy read surface | Classroom-student enrollment CRUD now uses the educational contract. The five historical-record reads target tables without current schema models or tracked authority; classify their migrations before exposing them. |
| `formTemplates.ts` | 0 | Migrated | Form template ownership, published reads, response submission, and owner-only response reads now use the Forms contract. The tracked migration reproduces the deployed backup schema and RLS semantics. |
| `presence.ts` | 0 | Split API/realtime boundary | Fallback counts and heartbeat writes use Sanctuary; only realtime channel membership remains in the explicit `presenceRealtime` adapter. |
| `rewards.ts` | 11 | Deprecated compatibility surface | Existing points/badges callers conflict with the growth-model direction. Migrate callers to growth/whispered-moment semantics or remove the compatibility API; do not expose reward CRUD as a new server contract. |
| `studentPotential.ts` | 0 | Migrated | Student Potential list, classroom-scoped read, upsert, and AI insight requests now use Sanctuary-owned boundaries. The mobile feature no longer depends on the legacy teacher-insights client seam. |
| `tracking.ts` | 0 | Migrated private ledger | Feature usage log reads/writes use authenticated Sanctuary routes; it remains a private exploration ledger rather than a public analytics domain. |
| `warmMirror.ts` | 0 | Migrated derived read model | The aggregate is now a server-owned, privacy-scoped read; narrative generation remains pure client presentation. |
| `longitudinal.ts` | 0 | Migrated | Student timeline and snapshot reads now use the server contract, explicit access checks, and access logging. |
| `thuthimal.ts` | 0 | Migrated | Server contract now owns creation, claiming, preview, and history; the client no longer calls Supabase. |
| **Total** | **22** |  |  |

## Other first-party package findings

The 60 findings are concentrated in these areas:

- `packages/library/src/api/library.ts` and `sync.ts` — 5 findings. This is the
  next major boundary program after the Core candidates because it combines
  search, collection membership, engagement counters, and mutations. Split it
  into read/search, membership, and engagement contracts; do not migrate the
  1,200-line adapter as one operation.
- `packages/self/src/api/*` — 35 findings. These are personal repositories
  with offline/local-first behavior. Classify each operation as local-first,
  sync upload, or server read before introducing a network route.
- `packages/admin`, `packages/ai`, and `packages/community` — 20 findings
  (6 admin, 6 AI, 8 Community).
  These are smaller contract candidates, but authorization and actor
  derivation must be checked before migration.

## Self journal-entry slice — 2026-08-14

The user-owned `journal_entries` read and create operations now use a narrow
Sanctuary contract. The server derives `user_id` from the authenticated
session, supports UTC day-scoped historical reads, validates content limits,
and returns a typed response. Self retains its existing repository signatures
and guest/local-first path while removing two direct database findings.

The inventory decreased from 70 to 68 findings. Remaining Self work is still
classified operation-by-operation; reminders, goals, and other local-first or
unmodeled surfaces are not being exposed as generic CRUD routes.

## Community and Self parity slices — 2026-08-14

Two Community methods that duplicated already-authorized server operations now
delegate to the canonical group-member status and group-policy contracts. A
third-party package direct-access finding was removed without changing the
public package signatures.

Self burned-journal history now delegates to the existing Sanctuary journal
history route. The contract supports an optional UTC day view, while the
mobile local/offline write path and content-preview privacy behavior remain
unchanged. Poll-vote deletion, resonance, and presence realtime remain
separate because they do not yet have equivalent server contracts.

The inventory decreased from 68 to 65 findings. The remaining findings are
still classified by authority and semantic parity rather than suppressed by
the audit.

## Sacred Missions classification — 2026-08-14

Sacred Missions is now backed by first-class `Manifesto` and
`ManifestoEndorsement` authorization resources. Sanctuary owns school-scoped
listing, principal/admin creation, and actor-derived endorsement mutations;
the Community package delegates all four operations without direct database
access. The handler verifies the manifesto belongs to the caller's active
school before writing an endorsement.

The authorization parity audit now validates 49 resources. This slice removed
five direct package findings while preserving the existing package method
signatures.

## Library boundary slice 1 — 2026-08-14

The first Library slice moves resource search and single-resource reads behind
the existing Sanctuary contract. The handler now returns the authenticated
user's endorsement/bookmark state, and the package adapter no longer performs
direct database access for those two operations. The focused Sanctuary suite
passes with 9 tests, and both Core and Library typechecks pass.

The static inventory decreased from 129 to 126 other-package findings. The
remaining Library work is intentionally split into resource filtering,
collections/membership, engagement writes, and legacy synchronization rather
than treated as one large rewrite.

## Library boundary slice 2 — resource-use engagement — 2026-08-14

The resource-use mutation now uses the existing transactional Sanctuary
engagement procedure. The client no longer increments counters or inserts
engagement rows directly, and the server derives the actor from authenticated
context. The contract now explicitly models the optional toggle field used by
the server procedure. The focused suite passes with 10 tests; Core and Library
typechecks pass.

The static inventory decreased from 126 to 124 other-package findings.

## Library boundary slices 3–5 — 2026-08-14

The Library contract was reconciled with the procedures already mounted by the
Sanctuary handler: bookmarked-resource reads, resource creation, collection
creation, and collection membership writes are now explicitly typed routes.
The client delegates those operations to Sanctuary, while the server derives
creator identity and makes collection membership idempotent for safe retries.
The focused suite passes with 11 tests; Core and Library typechecks pass.

The static inventory decreased from 124 to 118 other-package findings. The
remaining Library findings are concentrated in virtual/history-aware
collection reads, resource update/delete/verification, temporal projections,
and graph/map queries.

## Library boundary slice 6 — resource lifecycle authority — 2026-08-14

Resource update, deletion, and verification are now explicit Sanctuary
contracts. Updates and deletes require the authenticated creator or a platform
administrator; verification is platform-administrator-only and derives the
verifier from authenticated context. The client no longer writes resource rows
directly for these operations. The static inventory decreased from 118 to 115
other-package findings.

## Library boundary slice 7 — virtual and explicit collection reads — 2026-08-14

Sanctuary now owns the default read path for explicit collections and dynamic
subject/topic collections. Virtual collection discovery is derived from public
node metadata on the server, and collection identifiers accept the stable
`subject:<term>` / `topic:<term>` forms. The focused Library handler suite now
has 14 passing scenarios covering reads, malformed identifiers, authorization,
creation, idempotent membership, engagement, and bookmarks.

Temporal as-of reads, visibility/grade filters, collection fork/update/delete,
and graph/map projections remain intentionally on the legacy path until their
server-side semantics are modeled. This is a boundary slice, not a claim that
all Library behavior has moved.

## Library boundary slice 8 — temporal collection reads — 2026-08-14

Explicit and virtual collection detail reads now delegate to Sanctuary for both
current and historical views. For an explicit collection, the Sanctuary handler
reconstructs membership from `collection_node_events` at the requested cutoff,
orders the surviving nodes deterministically, and fetches their current resource
DTOs. The client-side Supabase collection-detail/RPC reconstruction path was
removed. The focused suite now has 15 passing scenarios, including a historical
membership case.

The static inventory decreased from 115 to 108 other-package findings. Remaining
Library work is collection listing with all legacy filters, membership removal,
collection metadata updates, fork/delete semantics, and map/graph projections.

## Library boundary slice 9 — collection lifecycle mutations — 2026-08-14

Collection membership removal, metadata updates, and deletion now use typed
Sanctuary procedures. The server derives the actor from the session, permits
only the collection creator or a platform administrator, restricts update
fields to modeled collection metadata, and makes removal idempotent. The
focused suite now has 17 passing scenarios, including creator and cross-owner
authorization behavior.

The static inventory decreased from 108 to 105 other-package findings. The
remaining Library candidates are legacy-filtered collection listing, fork
semantics, and graph/map projections.

## Library boundary slice 10 — transactional collection forks — 2026-08-14

Collection forking now runs in Sanctuary as one transaction. The server checks
the source collection's visibility/access, derives the new creator from the
session, copies ordered membership, creates a private fork, and increments the
source fork counter atomically. The client no longer inserts collections or
calls the legacy fork-counter RPC directly.

The focused Library suite now has 18 passing scenarios, including visible
collection forking and actor derivation. The static inventory decreased from
105 to 103 other-package findings. Remaining Library candidates are legacy
filter-complete collection listing and graph/map projections.

## Library boundary slice 11 — server-side collection listing filters — 2026-08-14

Current collection listing now supports server-owned visibility, grade,
name/description search, creator scoping, virtual-collection inclusion, and
offset/limit pagination. The handler applies visibility access constraints
before returning rows; private collections are not exposed merely because a
client supplied a creator filter. The client delegates all non-temporal listing
queries to Sanctuary.

The focused Library suite now has 19 passing scenarios, including inspection of
the server query shape. Temporal collection listing still uses the legacy path
because it needs the same event-reconstructed membership projection as detail
reads; that remains the next correctness slice.

## Library boundary slice 12 — temporal collection listing authority — 2026-08-14

Temporal collection listings now use the Sanctuary event stream in batch:
membership events for the page are reconstructed at the cutoff, surviving node
IDs are fetched once, and each collection is mapped with deterministic order.
The client-side temporal collection listing implementation—including per-row
Supabase RPC calls and resource fetches—was removed. Current and historical
collection listing now share the same server-owned contract.

The focused Library suite now has 21 passing scenarios, including temporal
listing reconstruction and map topology. The static inventory decreased from
103 to 81 other-package findings. Remaining Library boundary work is the
still-classified resource engagement/legacy compatibility surface.

## Required evidence for each migration

1. The authoritative table/function and its migration or deployment source
   are identified.
2. The contract defines input, output, authorization subject/action, and
   stable error behavior.
3. The handler derives the actor from the authenticated context and performs
   writes transactionally or through the existing atomic database function.
4. The client adapter has no direct database call for the migrated operation.
5. Static boundary, type, authorization-parity, and composition audits pass.
6. At least one behavior check exercises the real handler path; tests are
   supporting evidence, not the sole completion criterion.

7. The API quality gate (`pnpm run audit:api-quality`) passes, and the slice
   has negative authorization, stable-error, and duplicate-write evidence—not
   only a happy-path unit test.

## Ordering

1. Configure and verify the real Stripe/PayHere provider adapters and webhook
   lifecycle against the persisted payment-intent model.
2. Replace floating-point monetary fields with integer minor units or a
   database decimal type, with rounding and currency tests at the accounting
   boundary.
3. Resolve migration-state drift and apply the mapping/longitudinal deployment migrations; realtime follow-up remains separate.
4. Resolve the five unmodeled classroom historical tables against the deployment schema before adding routes.
5. Decide the fate of rewards compatibility; prefer removal or semantic
   replacement over new CRUD routes.
6. Run the Library boundary program in independently deployable slices.
7. Classify Self local-first operations and establish an explicit sync
   boundary before moving them to HTTP.

The reviewed exception ledger is enforced by `pnpm run audit:api-exceptions` and
the main quality workflow. It fails on unexpected files or changed counts, so a
new direct database caller cannot be silently reclassified as “intentional.”

## Remaining Core finding classification — 2026-08-14

The direct-access audit reports 22 findings, but they are not 22 equivalent
API migrations:

| Class | Findings | Surfaces | Decision |
| --- | ---: | --- | --- |
| Intentional security adapter | 6 | `deviceTrust.ts` (6) | Keep outside ordinary CRUD contracts until a server device-attestation contract and threat-model review exist. |
| Deprecated compatibility | 11 | `rewards.ts` | Do not build a server API around the old points/badges model. Remove or redirect callers after the growth-model replacement is agreed. |
| Unmodeled historical records | 5 | `classroom.ts` | Identify whether the five legacy tables are deployed and still needed. No route should be added from the client query alone. |
| Product consolidation | 0 | `studentPotential.ts` + Sanctuary durable-agent lane | The real mobile Student Potential feature and the separate Student Support Snapshot worker are now canonical under Sanctuary. Marketing retains only unrelated ingestion/mutation workers until the broader platform-worker consolidation slice. |
| **Total** | **22** |  |  |


## Mapping investigation and implementation evidence — 2026-08-14

The mapping surface was not safe to “just wrap” yet. The only local authority
found is `apps/gurudevi-mobile/supabase/backups/remote_schema_backup.sql`:

- `mapping_topologies` exists there with JSON graph fields and owner/public RLS,
  but no tracked migration creates it.
- `get_school_mapping_pulse(uuid)` exists there, while the client calls it
  with an additional `p_view_date` argument. Its backed-up implementation also
  emits `manages`/`contains` relationships that the current Zod link schema
  rejects, then the client silently falls back to the unvalidated payload.
- `generate_mapping_share_token(uuid, integer)` accepts an expiry argument but
  the backed-up table has no expiry column and the function only stores a token,
  making the advertised expiry ineffective.

This was a schema/deployment correctness issue, not merely a missing HTTP
wrapper. It is now addressed in the tracked migration and server contract.
Deployment still needs to apply the migration, and realtime subscriptions are
intentionally retained as a separately classified event-stream boundary.

## History investigation evidence — 2026-08-14

The history adapter is not one homogeneous table. Local migrations establish
the `audit.logs`/`audit_logs` view, `community_entity_versions`,
`library_entity_versions`, `collection_node_events`, and
`get_collection_membership_as_of`. Only `CollectionNodeEvent` is currently
represented in the ZenStack model. The collection timeline, as-of
reconstruction, community/library version reads, and narrowed classroom-note
audit lookup are now migrated to server contracts. The generic audit surface
is no longer exposed; it accepts only the one table with a tracked trigger and
validates the current note before reading history.

## Library map topology slice — 2026-08-14

Library map topology is now a Sanctuary-owned read contract at
`GET /library/map/topology`. The mobile package delegates to the contract
adapter instead of constructing the graph through a direct Supabase query.
The server reads only public resources, public official collection paths, and
public-to-public graph edges; edge relationships are normalized to the public
schema so legacy database values cannot make response validation fail.

Evidence: the focused Library suite passes 21 tests, the full Sanctuary suite
passes 147 tests, the contract audit reports 185 active routes with zero
findings, the Sanctuary direct-Supabase audit remains at zero, and the
other-first-party API inventory decreased from 98 to 81 findings.

## Library engagement slice — 2026-08-14

Resource views, endorsements, and bookmarks now use Sanctuary’s transactional
`engage` procedure. The compatibility methods retain their historical
signatures, but no longer read or mutate `resource_engagements` or counters
directly from the mobile package. Bookmark creation also creates the creator’s
impact ripple inside the same server transaction when the creator differs from
the actor.

The static first-party inventory decreased from 95 to 80 findings after this
slice. Remaining Library findings are resource reads/counts/search fallbacks,
broken-link/resonance/geo legacy surfaces, and the separate sync adapter.

## Library resource read slice — 2026-08-14

The primary `getResources` path now delegates to Sanctuary and preserves its
filter vocabulary: subjects/topics/grades, language, difficulty, visibility,
source, verification, tags, sorting, temporal cutoff, search, and pagination.
The server applies the public-or-owner access rule and composes search and
metadata filters with `AND` semantics so one filter cannot accidentally
replace another. The client no longer reads `nodes` directly for this path.

The direct-access inventory decreased from 81 to 80 findings. The remaining
Library work is counts, local/search fallback surfaces, broken-link/resonance/
geo legacy reads, and the separate sync adapter.

## Self decision-journal slice — 2026-08-14

Self Decision Journal reads and writes now use the existing Sanctuary contract.
The client compatibility methods retain their historical `userId` signatures,
but actor identity is derived by Sanctuary. Historical day reads are expressed
as a typed cutoff query, while the Self UI’s local cache remains intact.

The inventory decreased from 72 to 70 findings. Remaining Self work is still
classified by local-first versus server-owned behavior; the next candidates
must not be moved across the network boundary without schema and privacy
decisions.

## Library bookmarked-read slice — 2026-08-14

Current and as-of bookmarked-resource reads now use Sanctuary. The contract
accepts a temporal cutoff, derives the authenticated actor on the server, and
applies the cutoff before pagination. The client-side historical Supabase
query was removed, so bookmark reads now share one authorization and DTO
boundary with current reads.

The inventory decreased from 80 to 79 findings. Remaining Library work is
counts, local/search fallback surfaces, broken-link/resonance/geo legacy reads,
and the separate sync adapter.

## Library broken-link report slice — 2026-08-14

Broken-link reporting now uses a typed Sanctuary mutation. The server derives
platform-admin authority, increments `fail_count`, transitions the resource to
`broken` after three failures, and stamps `last_checked_at`, preserving the
tracked database function’s semantics without exposing a client RPC call.

The inventory decreased from 75 to 74 findings. Remaining Library work is
local/search fallback surfaces, resonance/geo legacy reads, and the separate
sync adapter.

## Library resonance slice — 2026-08-14

Resonant knowledge lookup now uses the Sanctuary resource and search
contracts. The client no longer fetches node metadata or invokes the
`search_map_universe` RPC directly; the server owns visibility, DTO mapping,
and search behavior for both steps.

The inventory decreased from 74 to 72 findings. Remaining Library work is
local/search fallback surfaces, geo topology, and the separate sync adapter.

## Library count read slice — 2026-08-14

Resource and collection counts now use a typed Sanctuary aggregate endpoint.
The server applies the same public-or-owner visibility boundary and computes
virtual subject/topic collections from the public resource graph. The client
no longer calls count RPCs or tables directly for dashboard totals.

The inventory decreased from 79 to 75 findings. Remaining Library work is
local/search fallback surfaces, broken-link/resonance/geo legacy reads, and the
separate sync adapter.
