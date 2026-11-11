---
title: "Product Shape and Tool Ownership"
status: "proposed"
created: 2026-11-11
updated: 2026-11-11
author: "Naveen"
scribe: "Claude"
tags: [architecture, product, state, errors, effect, xstate, zustand, versions, national-scale, reference]
supersedes-in-part:
  - 2026-10-23-client-state-architecture-decision.md (kept; this adds errors, Effect and the authority read)
  - 2026-10-24-monorepo-state-architecture-and-decision-guide.md
  - 2026-10-26-adr-xstate-v6-alpha-and-effect-v4-statechart-runtime.md (version line only)
---

# Product Shape and Tool Ownership

What Gurudevi has to do, what kind of work each part is, and which tool owns which job.
The [platform map](platform-map.md) says *who owns each fact*. This document says *what
kind of machinery each fact needs*, so a tool is chosen because of the work, not because
a doc mentioned it. If a tool isn't in the table in [section 3](#3-one-tool-one-job), it
needs a reason before it is added.

## 1. What the product is

In the owner's words: **wellbeing + LMS + ERP + feed + messaging + AI and agents (bots) +
a rich digital library**, aiming to be a national platform. On the platform map these
are the Wellbeing, Learning, Institution operations, Community and messaging, AI and
agents, and Library domains, with Family and Journey joining them. They all sit on one
person-rooted identity and bond model.

Everything below inherits the upstream in the project's start-here: the person exists
first, relations exist through their content, containers are composed from relations,
and every fact carries its time and place.

### What "national" means in numbers

| Fact | Value | Source |
| --- | --- | --- |
| Government schools | 10,076 (2024) | MoE School Census 2024 |
| Students in government schools | about 3.8 million | MoE School Census 2024 |
| Government teachers | about 225,000–230,000 | School Census 2024/2025 |
| Schools with fewer than 50 students | about 1,576 | Census Dept. 2024–25 dataset |
| Personal data law | PDPA No. 9 of 2022 (amended 2025): processing and controller duties operational **1 January 2027** | Gazette 2498/16, 22 Jul 2026 |

Add guardians, private and international schools, tutoring institutes and graduates, and
the design target is **about 10 million accounts and about 15,000 institutions**. Two
consequences shape everything:

- **The morning burst is the load.** About 4 million students and their teachers sign in
  and take attendance in roughly 30 minutes. Reads must already be on the phone. The
  server mostly validates writes and serves sync.
- **Most schools are small and poorly connected.** Thousands have fewer than 10
  teachers. The product has to be complete offline on a low-end phone, and cheap enough
  to run without a budget.

## 2. Seven kinds of work

Each pillar is a different shape of work. The tool follows the shape.

| Pillar | Truth lives | Consistency | Offline | Realtime | Sensitivity | Shape |
| --- | --- | --- | --- | --- | --- | --- |
| Wellbeing (Self) | The person's device; server only by the person's choice | Single writer | Complete | No | Highest; health data under PDPA | Private local store |
| Learning (LMS) | Server, replicated to members | Commands with idempotency; grades corrected, never edited | Read and write, replayed | Low | Minors' records | Local-first replica plus durable commands |
| Institution operations (ERP) | Server | Strong for money and enrolment, by command | Attendance yes; fees never final offline | Low | Institutional, 13–40 year records | Server-authoritative ledgers |
| Feed (Community) | Server | Eventual | Read cache; post queued | Medium | Minors present; moderation is part of it | Paged cache plus moderation pipeline |
| Messaging | Server-ordered log per conversation | Ordered per conversation | Queue and send later | High | Minors; guardian and safety rules | Ordered log plus push |
| AI and agents | Agent runs on the server; the person's memory is theirs | Runs are durable, with a run id | Degrades to queued requests | Streaming | An agent never exceeds its delegator | Durable workflows plus streaming |
| Library | Object storage plus catalogue | Editorial states | Downloads kept offline | No | Licensing, visibility tiers | Content delivery, search, offline packs |

Three cross-cutting needs come out of the table: **one identity and authority path**
(every pillar), **durable work** (commands, agent runs, deliveries, moderation, exports),
and **search in Sinhala, Tamil and English** (library, feed, messaging, people).

## 3. One tool, one job

### On the wire and on the server

| Job | Tool | Rule | Not for |
| --- | --- | --- | --- |
| The app's API contract | **oRPC** v2 (`@repo/core/api/v1`) | Every capability is a contract entry with a closed error set; clients get typed clients and TanStack Query bindings from it | Business rules; a second hand-written client |
| HTTP host | **Hono** 4 | Thin: runtime limits, routing to oRPC | Anything domain-specific |
| Inside every capability | **Effect** v4 | Ports are `Context` tags (`*.port.ts`); adapters are `Layer`s (`*.adapter.ts`), following the [naming rules](2026-11-02-monorepo-naming-conventions-and-consistency-rules.md). Typed errors, retries with `Schedule`, timeouts, cancellation and resource scope | Wrapping trivial pure functions |
| Durable work (commands, deliveries, agent runs, exports) | Our `operations` store now; **`effect/workflow`** for multi-step jobs once Gate 3 is in | One receipt identity per command; every outside call recorded as intent before it is sent | Fire-and-forget promises |
| AI provider access | **`effect/ai`** | Provider-neutral; tool calls go through the same capabilities as people, under a delegation grant | Calling providers directly from screens |
| Authority | **Cedar** (`@cedar-policy/cedar-wasm`) on the server; a signed snapshot on the device | The server decides; the device only hides | Client-side decisions that the server doesn't re-check |
| Storage | **Postgres** with row-level security; Kysely or Drizzle for queries | One schema per domain; only the owning module writes its tables | Cross-module table reads |
| Observability | **`effect/observability`** to OpenTelemetry | Every request and operation carries one id through logs, traces and audit | Logging personal data |

oRPC and `effect/rpc` overlap. Keep oRPC for the wire, because the contract and the
clients already exist, and use Effect inside. Don't run both.

### On the device

| Kind of state | Tool | Rule |
| --- | --- | --- |
| Data the person can read offline (classes, lessons, assignments, timetables, attendance) | **PowerSync** SQLite replica with Drizzle, read through watched queries | Synced tables are read from SQLite only. TanStack Query never holds a second copy of a synced table |
| Server data that isn't synced (search results, feed pages, library catalogue, AI runs) | **TanStack Query** with keys that include account and bond | Cleared on account or bond switch |
| Offline writes | **The outbox** (durable commands) | Account-scoped and versioned; never cleared by a cosmetic reset |
| What the person may do | **One authority read** over the signed snapshot from `authority.refreshSnapshot` | One hook; no store keeps its own copy of decisions |
| Small shared client state (preferences, view controls, drafts index, the active world) | **Zustand** 5, one slice per concern, versioned `persist` | No server facts, no authority, no entitlements |
| Long, recoverable flows (attendance session, gradebook batch, bulk create, provisioning, scanning, media playback, sign-in) | **XState** 6 with `setup({ schemas })`, effects run through **`@xstate/effect`** | Must pass the XState admission test; persisted snapshots are versioned |
| One screen's state | React state and reducers | Not persisted |
| Private Self data | Local SQLite tables that never sync unless the person shares | Encrypted at rest (decision 6.4) |
| Motion, haptics, sound | The active **world**, scaled by **Verger** | Screens never pick durations, curves or haptic strengths; Verger reduces them on weak devices and in low power |

## 4. Errors: one taxonomy

Today there are three systems that don't connect: `types/Errors.ts` (tiers and RFC 9457
problem details), `lib/errors.ts`, and the Effect `Data.TaggedError` classes in
`effect/Errors.ts`. Next to them sit 21 plain `extends Error` classes and the four
foundation codes on the v1 contract. The target has three kinds of failure and one path
to the person.

| Kind | What it is | How it is built | Who sees it |
| --- | --- | --- | --- |
| **Expected failure** | Something the caller can act on: denied, offline, conflict, invalid, not found, rate limited, step-up needed | `Schema.TaggedError`, so it serializes across oRPC and storage; each capability declares its closed set in the contract | The person, through the feedback path, in their language |
| **Defect** | A bug or a broken invariant | Effect `die`; never caught by business code | Telemetry only; the person sees a calm generic message |
| **Interruption** | Cancelled: navigated away, account switched, timed out | Effect interruption | No one, unless the person asked for the work |

The feedback path. Every expected error has a tag, and the tag maps to:

1. **Can the person do something?** Retry, sign in again, wait, ask a teacher, or nothing.
2. **The message key** in `si`, `ta` and `en`.
3. **How the world shows it**: inline next to the field, a world toast, or a dialog for
   things that can't be undone.

The mapping is a table in code, checked by a test that fails when a tag has no entry.
Agents get the same tag plus structured details, never the prose.

## 5. What is wrong today

Each item points to a step in [section 7](#7-order-of-work).

| Finding | Evidence | Step |
| --- | --- | --- |
| Authority facts live in Zustand | `useCedarDecisionStore`, `useEntitlementStore`, `useFeatureStore` and `usePerspectiveStore` all feed `useSanctuaryFeature`, which reads six stores to answer one question | 3 |
| Three error systems | `types/Errors.ts`, `lib/errors.ts`, `effect/Errors.ts`; 21 plain `Error` subclasses; 23 `Data.TaggedError` that can't cross the wire | 2 |
| The XState decision is half done | 19 machines; `@xstate/effect` installed with no users; pinned to `6.0.0-alpha.70` while `6.0.0-beta.2` and `@xstate/effect@1.0.0-beta.1` were released on 11 Nov 2026 | 4 |
| Two API generations on the client | About 200 files in `packages/core/src/api` next to a small `api/v1` contract | 5, with Gate 1 of [road to v1](road-to-v1.md) |
| No runtime boundary | `effect/Runtime.ts` has safe runners, but there is no single `ManagedRuntime` with the app's layers that machines and hooks share | 2 |

## 6. Pieces that are missing

These are decisions, not installs. Each needs a small spike before it is chosen.

1. **Search in Sinhala and Tamil.** Postgres full-text search has no Sinhala
   configuration. Options: Postgres with trigram matching plus an ICU-based tokenizer
   step, or a separate engine such as Meilisearch or Typesense. Decide when the Library
   has real content.
2. **Messaging transport.** PowerSync streams may be enough for classroom and family
   conversations. Measure the delay before adding a socket service.
3. **Files and media.** Object storage, resumable uploads and offline packs for the
   library; layer 11 of the API playbook isn't settled since the reset.
4. **Encryption at rest for Self.** op-sqlite with SQLCipher, or field-level encryption
   with a key in the platform keystore. Needed before journals hold real data, given the
   PDPA date.
5. **Push notifications.** One delivery service (layer 10), with the meaning owned by
   each domain.
6. **Moderation pipeline.** Durable, queued review for feed and messaging, because
   minors are present. It belongs to the Community domain, not the client.
7. **Data protection duties.** A data protection officer, records of processing, breach
   procedure and consent records, all in place before 1 January 2027. The audit, records
   and consent layers (Gate 3) are the technical part of that.

## 7. Order of work

A step is done when the code is wired, a check fails if it drifts, and the docs it
replaces are marked as replaced. Steps 2 to 4 are guarded by four ceilings in
`tooling/ratchet.json` (`node scripts/ratchet.mjs`), which may only go down:

| Metric | Ceiling (11 Nov 2026) | Target |
| --- | --- | --- |
| `plainErrorSubclasses` (`class X extends Error`) | 21 | 0 outside adapters to third-party code |
| `dataTaggedErrors` (`Data.TaggedError`, not serializable) | 23 | 0; expected failures use `Schema.TaggedError` |
| `authorityStoreReads` (decision, entitlement, flag and perspective stores read outside `store/`) | 57 | 0 |
| `machinesWithoutSetup` (`= createMachine(`) | 14 | 0 |

1. **Versions.** Patch and minor updates now; prereleases moved together; native majors
   held until they can be tried on a phone (section 8). Done for Effect, zustand and
   TanStack Query on 11 Nov 2026.
2. **Errors and the runtime.** One taxonomy (section 4), one `ManagedRuntime` per app
   with the shared layers, the feedback mapping with its test, and a lint rule against
   new `extends Error`.
3. **Authority read.** `useSanctuaryFeature` reads one authority source built from the
   signed snapshot and the scope session. Decision, entitlement and flag stores stop
   holding authority. The 16 callers keep the same hook signature.
4. **Machines.** Move to XState 6 beta and `@xstate/effect`. Each of the 19 machines
   passes the admission test or becomes Query, Zustand or local state. A check rejects
   machines outside `machines/` folders and machines without schemas.
5. **Stores.** Every remaining Zustand store is a slice with a version, a migration and
   an account scope where it needs one. A check rejects server-shaped fields in stores.
6. **API Gates 1–3**, from [road to v1](road-to-v1.md), with the bond self-assignment fix
   first.
7. **Motion and feedback.** Verger is the only place that sets motion and haptic budgets;
   a check flags screens that animate outside the world.

## 8. Versions (checked on npm, 11 Nov 2026)

Rules followed: [dependencies](dependencies.md) (cohort file and manifests together, 24-hour
release-age guard, owner holds).

| Package | Was | Latest | Action |
| --- | --- | --- | --- |
| effect | 4.1.2 | 4.1.4 | **Updated** to 4.1.4 (exempt from the age guard) |
| zustand | 5.0.16 | 5.1.0 | **Updated**. Type change only: `persist.rehydrate()` always returns a Promise, and storage may return any thenable. All callers already await it |
| @tanstack/react-query, query-core, react-query-devtools | 5.106.1 | 5.107.1 | **Updated** together |
| hono | API 5.0.0-rc.1; `@repo/core` 4.13.16 | 5.0.0-rc.1 is the newest v5 | **Hono 5 everywhere**, nothing on 4: core moved after its retired handlers were removed ([ledger](2026-11-11-retired-core-api-handlers-ledger.md)); tools forced through an override and one patch (see [dependencies](dependencies.md#hono-5-everywhere)) |
| @powersync/* | 2.4.0 | 2.4.1 | Hold: owner decision, moves with the sync work |
| xstate | 6.0.0-alpha.70 | 6.0.0-beta.2 | Move with `@xstate/effect` 1.0.0-beta.1 (which requires xstate `^6.0.0-beta.2`), exact pins, in step 4. Both released 11 Nov, so not before 12 Nov |
| @orpc/* | 2.0.0-beta.46 | 2.0.0-beta.50 | **Updated** together (released 9 Nov, clears the guard). API 119/119, typecheck and build clean; core type errors unchanged (55) |
| react-native-skia (aliased as `@shopify/react-native-skia`) | 3.9.1 | 3.10.0 | Hold until it can be tried on a phone (native) |
| @op-engineering/op-sqlite | 17.2.0 | 19.0.5 | Hold: two majors, native; decide with encryption (6.4) |
| react-native, expo, reanimated, gesture-handler, mmkv, flash-list, drizzle-orm, zod, cedar-wasm, vitest | current | current | Nothing to do |
| typescript | 7.1.0-beta | 7.0.2 stable; 7.1 still beta | Keep for tsgo; revisit at 7.1 stable |

`effect@3.21.0` is also in the lockfile, pulled in by Prisma's config through ZenStack.
It is build tooling only and never reaches an app bundle. The `check:effect-single`
idea: fail if any app or package other than schema tooling resolves Effect 3.
