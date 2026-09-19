---
title: "Gurudevi Library Domain Authority"
status: active
created: 2026-09-15
updated: 2026-09-15
tags: [library, migration, architecture, web, mobile, explore]
---

# Library Domain Authority

This document supersedes Library-specific implementation plans and inventories
when they conflict. It is based on the live `packages/library` package, the
mobile routes, the existing web variants, and the Library documentation.

## Non-negotiable migration rule

Migration means preserving the capability and rebuilding its platform adapter
in the correct Next.js or React Native way. Platform incompatibility is work
for the implementer, never a reason to complain, defer, or silently remove a
capability. Do not copy RN components into Next.js. Do not create a second
product called Explore. Explore, guest, and signed-in modes use the same floors
and feature contracts with different storage, access, and sync adapters.

## Three layers that must not be conflated

| Layer | Meaning | Authority |
| --- | --- | --- |
| Domain capability | A durable product ability such as browse, read, curate, or convert | `LIBRARY_REGISTRY` plus capability/entitlement policy |
| Overview furniture | Arranged entry points on the Library floor | `useLibraryWorkspaceSurfaces` |
| Resource task | A focused, resumable instance such as reading resource `r7` at page 12 | Workbench task contract with resource/format/context identity |

The Library Overview is a floor arrangement, not an open task. Its furniture
currently consists of Continue Learning, Bookmarks, Categories, Collections,
Trending, and New Arrivals. A reader task may be opened from any of these and
must return to the Overview when closed.

## Canonical capability inventory

| Capability | User job | Rights/scope | Persistence and temporal needs | Delivery |
| --- | --- | --- | --- | --- |
| Browse/archive | Find knowledge resources | public/read policy; filters scoped to visible resources | query/filter state local; results network-backed; explicit empty/error states | native live; browser migrate |
| Resource hub/detail | Inspect metadata and open a resource | resource visibility and ownership | resource ID and format are task identity | native live; browser migrate |
| Reading | Read PDF, document, video, or ebook | resource read right | progress, bookmarks, annotations; local-first with optional sync; date context only when relevant | native live; browser variants exist, integration required |
| Bookmarks | Save resources for later | authenticated user or local guest identity | private, durable, sync when authenticated; offline queue | native hook live; browser adapter required |
| Collections | Organize/share resources | owner/member/read rights; collection scope | mutations need optimistic/queued/error states; realtime invalidation | native routes/hooks live; browser migrate |
| Offline desk | Use explicitly downloaded/cached materials without network | user-controlled device storage | quota, cancellation, retry, eviction, encryption/privacy policy | native infrastructure partial; browser IndexedDB/OPFS adapter required |
| Map/atlas | Explore knowledge topology | only expose permitted metadata/presence | visited regions and presence are privacy-sensitive; temporal browsing may be relevant | native route live; browser not implemented |
| Contribution | Add or upload a resource | contributor entitlement and moderation state | draft, upload progress, retry, pending review, deletion | embedded in monolith; extract as separate task |
| Curator studio | Review/moderate submissions | curator capability and PRO entitlement | queue state, audit trail, reporter quorum, no accidental public exposure | native/web package screen exists; browser route required |
| Document tools | OCR, PDF edit, image-to-PDF, spreadsheet, cloud export | tool capability, file ownership, network/provider rights | large local processing, progress, cancellation, recoverable failures; cloud actions explicit | native routes live; browser adapters required |

The package registry (`archive`, `hub`, `curator`) is product-level capability
metadata. The mobile navigation registry (`lib-curriculum`, `lib-resources`,
`lib-exams`, `lib-saved`) is currently a divergent presentation list and must
become an adapter of this authority, not a second inventory.

## Cross-cutting contracts required before feature completion

Every Library surface must use shared contracts for:

- authentication, authorization, entitlement, and feature-flag decisions;
- loading, retry, offline, stale, empty, not-found, and permission-denied states;
- local-first writes, queued sync, conflict handling, and confirmed server state;
- resource privacy, annotation visibility, download consent, and deletion;
- keyboard/screen-reader labels, focus restoration, reduced motion, touch targets,
  and non-colour-only status signals;
- task identity, restoration, close-to-Overview behavior, and resource scope.

No feature may claim offline support merely because a utility exists. A download
must report bytes, storage destination, quota failure, cancellation, and removal.
No failed network request may be converted into an empty result.

## Platform and Explore matrix

| Surface | Native | Web | Explore/guest |
| --- | --- | --- | --- |
| Overview floor | responsive mobile floor and existing workspace furniture | same information architecture, browser layout adapter | hydrated baseline/local state, clearly marked local workspace |
| Browse/detail | Supabase/React Query | Next server/client data adapter | public/sample resources or anonymous read path |
| Reading | native/WebView readers and local bytes | browser readers and browser storage | read and annotate locally where policy permits |
| Bookmarks/collections | authenticated sync plus offline queue | authenticated sync plus IndexedDB queue | local-only unless user explicitly upgrades/syncs |
| Curator/contribution | capability-gated | capability-gated | unavailable or safe simulation with explicit label |
| Tools | device file APIs and local engines | browser file APIs/workers | local-only, network export disabled unless explicit |

Explore must be the same feature behavior where possible. It may have sample
data and local persistence, but must not silently create accounts, send writes
to a real user's cloud, or present unavailable operations as successful.

## Known risks in the existing implementation

`LibraryScreen.tsx` combines browsing, maps, filters, cards, and contribution
in a 1,279-line screen. Extract shared resource cards and query/state contracts;
move contribution to its own flow. Keep `CuratorReviewScreen` separate because
moderation is a different cognitive task.

The native and package registries disagree; the web Explore Library route is
still an honest placeholder. `useLibraryWorkspaceSurfaces` is the best current
Overview source, but its `content` cast is not a safe renderer contract and must
be replaced by platform-owned furniture renderers. Existing web screen variants
are useful evidence and behavior specifications, not drop-in Next components.

## Delivery sequence

1. Canonicalize capability IDs, aliases, access policy, and task behavior.
2. Build native and browser Overview floors from the six workspace surfaces.
3. Extract shared resource-card/query/bookmark/collection/error contracts.
4. Migrate browser browse and resource detail.
5. Migrate reading progress, annotations, and bookmarks with browser storage.
6. Add collections and offline desk with quota/retry/conflict behavior.
7. Extract contribution and migrate curator as separate capability-gated tasks.
8. Migrate map/topology after privacy and visit-history contracts are accepted.
9. Place OCR/PDF/spreadsheet/conversion/cloud tools under Advanced with explicit
   per-platform delivery declarations.

The Overview milestone may use truthful furniture placeholders, but it is not a
claim that the underlying capability is implemented. Each task becomes real only
when its rights, state, failure, persistence, accessibility, and platform
adapter evidence are recorded.

## Evidence paths

- `packages/library/src/constants/libraryRegistry.ts`
- `packages/library/src/workspace/useLibraryWorkspaceSurfaces.ts`
- `packages/library/src/hooks/useLibrary.ts`
- `packages/library/src/screens/LibraryScreen.tsx`
- `packages/library/src/screens/CuratorReviewScreen.tsx`
- `apps/gurudevi-mobile/src/navigation/registries/libraryRegistry.ts`
- `apps/gurudevi-mobile/app/(tabs)/library/`
- `apps/gurudevi-web/app/(sanctuary)/explore/library/page.tsx`
- `packages/library/ARCHITECTURE.md`
- `docs/files/specialized/25-library-tab-full-arc.md`

## Legacy-document disposition

These documents remain historical evidence, not implementation authority:

| Legacy document | Disposition | Replacement |
| --- | --- | --- |
| `apps/gurudevi-mobile/docs/Library/implementation-plan.md` | supersede after reference check | this authority plus the delivery sequence above |
| `apps/gurudevi-mobile/docs/Library/gurudevi-library-spec.md` | retain as product-history input; supersede conflicting architecture | this authority |
| `apps/gurudevi-mobile/docs/Library/gurudevi-library-ui-spec.md` | retain visual evidence; supersede conflicting navigation/layout | domain floor and platform UI contracts |
| `apps/gurudevi-mobile/docs/Library/innovation-vision.md` | retain vision only | this authority for implementable decisions |
| `apps/gurudevi-mobile/docs/Library/holistic_library_report.md` | retain research only | capability inventory above |
| `apps/gurudevi-mobile/docs/Library/ARCHITECTURE_VISUALIZATION.md` | retain diagram evidence; supersede conflicting boundaries | this authority |
| `docs/files/specialized/25-library-tab-full-arc.md` | supersede as active plan | this authority |
| `apps/gurudevi-mobile/docs/current_progress/2026-08-10-library-domain-batch.md` | close as historical batch record | this authority and tracked delivery tasks |

Before archiving or deleting any candidate, run a repository reference search,
check links from `docs/INDEX.md` and handoffs, and preserve unique decisions or
evidence in this authority. No document is removed solely because its filename
looks old; the replacement must be linked and the reference check recorded.

## Per-capability implementation ledger

“Placeholder” means visible Overview furniture only; it is not feature delivery.

| Capability / layer | Identity, scope, time | Rights and privacy | Offline, download, state, failure, empty, accessibility | Account / native / Next / Explore | Evidence and next action |
| --- | --- | --- | --- | --- | --- |
| Archive / browse | query, filters, page cursor; domain scoped | visible-resource read policy; no restricted metadata leaks | stale cache distinct from no matches/offline/error; labelled filters and counts | native live; Next not integrated; Explore placeholder | `useLibrary`, `LibraryScreen`; build browser query adapter |
| Continue Learning furniture | recent reading/task records; user scoped | private to user/device | local recent index; stale/recovery state; focus restoration | native surface defined; Next absent; Explore local baseline | `useLibraryWorkspaceSurfaces`; implement both-platform furniture |
| Resource Hub/detail task | `resourceId + format + source`; focused/resumable | resource visibility, licensing, owner/share rights | loading/not-found/permission/offline distinct; announced title/format | native `resource/[resourceId]`; web component exists; Next absent | `ResourceHubScreen`, `resourceLinks`; migrate Next detail |
| Reading task | `resourceId + viewerKind + version`; page/CFI/time position | private progress/annotations; sharing explicit | local progress, annotation queue, byte cache, retry/conflict; accessible reader controls | native PDF/document/video/reader; web variants; Next unintegrated; Explore should allow public/local read | reader screens, `annotations`, database; add browser persistence |
| Bookmarks furniture/action | `userId + resourceId`; action transient, saved list furniture | private by default; auth sync or local guest namespace | optimistic/queued/failed states; empty saved desk; stateful accessible toggle | native hook live; Next absent; Explore local only | `useLibrary` bookmark mutation; add shared contract/browser adapter |
| Collections furniture/task | `collectionId`, owner/member/read scope | owner/member/read rights | mutation queue/conflict/realtime errors; empty collection distinct | native route and web screen variant; Next/Explore absent | collection screens/picker/realtime; migrate detail/mutations |
| Categories/New Arrivals furniture | category or publication window; read-only | visible resources only | empty/stale/network state; exposed filter semantics | surfaces declared, not rendered in Overview | workspace surfaces + API filters; implement furniture |
| Trending furniture | sustained engagement window; resource IDs | aggregate only; protect private/low-volume usage | stale/unavailable state; explain ranking | declared only | Library arc + filters; define aggregate API/privacy review |
| Offline Desk furniture | `device + resourceId + contentVersion` | explicit consent, license, device privacy | quota, progress, cancel, retry, eviction, corruption; announce storage | native partial; browser OPFS/IndexedDB absent; Explore local | architecture, bytes, database, sync; implement adapter |
| Map/atlas task | region/island + topology and optional visit window | visit/presence privacy; opt-in realtime | offline map/stale topology/no-presence empty; non-colour location cues | native map route and web package variant; Next/Explore absent | MapScreen and mapping hooks; privacy/browser storage first |
| Contribution task | draft/upload ID + owned resource | contributor capability and moderation visibility | draft recovery, upload progress/cancel/retry, pending review | embedded in monolith; no dedicated Next/Explore | LibraryScreen/API; extract route/task/server contract |
| Curator Studio/review | submission/review ID + institution scope | curator capability + PRO entitlement; private audit | queue loading/empty/error; distinct-reporter quorum; keyboard review | native route/package screen; Next absent; Explore unavailable | CuratorReviewScreen/registry; migrate gated route |
| Document tools | file ID + operation + format; transient/resumable by operation | file ownership/provider consent | worker progress/cancel/large-file errors; no silent cloud upload | native routes/engines; browser possible; Explore local only | ToolsHub and PDF/OCR/spreadsheet/cloud APIs; Advanced |

## Coverage report (2026-09-15)

### Discovered and read/understood

- Registries: package `libraryRegistry.ts` and mobile navigation `libraryRegistry.ts`.
- Overview: `useLibraryWorkspaceSurfaces.ts`, `categories.ts`, `shelf.ts`.
- Every file under mobile `app/(tabs)/library/` and the browser Explore Library page.
- All package screens, web variants, entrypoints, components, APIs, hooks, types,
  constants, shims, and resource/format/bytes utilities.
- Package `ARCHITECTURE.md`, README, CHANGELOG, CONTENT_LICENSE, all files under
  mobile `docs/Library/`, and `docs/files/specialized/25-library-tab-full-arc.md`.
- Tests: resource-page query, format detection, resource links, and mobile
  Library surface-entrypoint architecture coverage.

### Discovered but not fully reviewed or proven

- Full behavior of the 1,279-line `LibraryScreen.tsx`, especially contribution
  and map composition.
- Backend/RLS/migration semantics for licensing, download retention, annotation
  sharing, and collection membership.
- Browser runtime behavior of every `.web.tsx` screen and `database.web.ts` under
  real IndexedDB/OPFS conditions.
- Production data volume, pagination performance, realtime reconnect, and
  large-file memory behavior for readers/OCR/spreadsheets/PDF tools.
- Complete accessibility audit of native readers, map, progress, modals, and
  curator review.
- Whether architecture dependency claims match the current lockfile/builds.
- External consumers of legacy registry exports and old document links.

These gaps block a production-readiness claim, not the capability itself. Each
is a verification or migration task in the delivery sequence.

## Auditable coverage metrics

Counts are from repository file enumeration on 2026-09-15. A file is
“discovered” when `rg --files` found it. “Read/understood” means its public
purpose and boundary were inspected for this inventory; it does not mean every
branch was runtime-tested. “Materially integrated” means the capability is
wired into a real user route or shared use case, not merely exported by a
barrel or listed in a registry.

### Source inventory by functionality

| Source group | Discovered | Read/understood | Materially integrated into the migrated domain |
| --- | ---: | ---: | ---: |
| `packages/library/src/api` | 12 | 12 | 0 in Next; native use varies by capability |
| `packages/library/src/screens` | 21 | 21 at inventory level | 0 in Next Overview; native routes consume most |
| `packages/library/src/components` | 11 | 11 at inventory level | 0 in Next Overview |
| `packages/library/src/hooks` | 9 | 9 at inventory level | 0 in Next Overview; native `useLibrary` is live |
| `packages/library/src/entrypoints` | 6 | 6 | native barrels/routes only |
| constants/types/workspace/utils/shims/index | 17 | 17 | workspace surfaces are native/package definitions |
| **Package source total** | **76** | **76 inventory-level** | **0 browser-domain integrations** |
| Mobile Library routes | 15 | 15 | 15 route entries; runtime depth varies |
| Browser Explore Library routes | 1 | 1 | 0 real capability routes; truthful placeholder |
| Library documentation | 15 | 15 as evidence/intent | 0 direct runtime integration |

The “read/understood” package number deliberately reports inventory-level
coverage, not a claim of exhaustive line-by-line review. The unresolved gaps
above qualify it.

### Capability status counts

The ledger contains **13 capabilities/furniture groups**: browse, Continue
Learning, detail, reading, bookmarks, collections, categories/new arrivals,
trending, Offline Desk, map/atlas, contribution, curator, and document tools.

| Status dimension | Count | Calculation and justification |
| --- | ---: | --- |
| Documented in this authority | 13 | one ledger row per capability/group |
| Explored from live source evidence | 13 | each row has at least one source path and route/package evidence |
| Planned with next action | 13 | every row has an explicit migration action |
| Native live or route-backed | 11 | browse, detail, reading, bookmarks, collections, map, curator, and tools are live/route-backed; furniture groups are definitions rather than complete screens |
| Native partial/infrastructure-only | 2 | Offline Desk and some temporal/topology behavior lack complete guarantees |
| Browser live | 0 | the only browser route is an explicit placeholder |
| Browser partial/package variant | 4 | reader/video/PDF/map/collection web variants exist, but are not integrated into the Next domain floor; counted by capability family, not file count |
| Explore live | 0 | no real Library Explore capability is integrated |
| Explore local/planned | 13 | all may share the eventual floor with local/sample adapters, subject to rights |
| Blocked for production claim | 13 | each lacks at least one required browser, rights, privacy, failure, accessibility, or runtime proof |
| Abandoned/not migrating | 0 | no Library capability is authorized for deletion or silent removal |

These status counts are intentionally not additive across dimensions. “Native
live” means route/code existence, not production assurance. “Blocked” means a
production-readiness claim is blocked, not that implementation cannot proceed.
The browser partial count is a family-level count of existing web variants, not
an assertion that four browser experiences are complete.

### Evidence integration versus source coverage

The source inventory proves that 76 package files, 15 mobile routes, one browser
route, and 15 Library documents were located and classified. It does **not**
prove that their behavior is composed into one domain. At present the materially
integrated browser count is zero because the browser route intentionally stops
at a truthful restoration message. The first integration milestone is therefore
not another registry: it is the Library Overview floor consuming the six
workspace surfaces, followed by real browse/detail adapters.
