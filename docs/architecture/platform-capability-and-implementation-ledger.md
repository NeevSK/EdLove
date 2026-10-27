---
title: "Platform Capability and Implementation Ledger"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [platform, architecture, capability-ledger, domains, packages, ui, evidence, hostile-review]
---

# Platform Capability and Implementation Ledger

> **One ecosystem, many doors; one evidence standard.** This is the platform-wide
> map of what the checked-out repository demonstrates, what it only proposes, and
> where the evidence disagrees. It is a reference ledger, not a release claim.

## 1. Purpose, scope, and claim discipline

Gurudevi is a human-first educational Sanctuary, not a conventional ERP with a
warmer interface. It supports the person as learner, educator, family member,
community participant, and institutional steward. Administrative capability is
valuable only when it removes drudgery without converting people into managed
inventory.

This ledger maps the whole present platform: apps, packages, UI places, routes,
schema, APIs, persistence, workers, product documents, and control-plane tools.
It deliberately includes incomplete and contradictory material because hidden
partiality is the main source of accidental architecture.

### Claim rule

`Implemented` means source-visible code exists at the stated seam. It does **not**
mean production-deployed, authorized in every situation, resilient during outage,
or usable by real people. A capability may only be called end-to-end when the
ledger has evidence for all applicable links:

```text
actor and scope → reachable UI/channel → contract → authorization →
durable data change → receipt/recovery → projection/feedback → test evidence
```

Registry `state: 'live'`, an exported component, a schema model, a mock test, or
a marketing statement proves only that individual artifact. It never proves the
whole chain.

### Maturity vocabulary

| Label | Meaning |
| --- | --- |
| **end-to-end evidenced** | Source-visible UI/channel, contract, authorization, persistence, recovery behaviour and relevant evidence have all been inspected. Deployment remains a separate claim. |
| **implemented / wired** | A real code path is connected across at least two layers, but some authority, recovery, route, data, or runtime proof is incomplete. |
| **partial** | Useful real pieces exist but an essential part of the job is absent, simulated, local-only, or not connected. |
| **scaffold** | Types, registry, route shell, heartbeat, interface, or placeholder exists without the real operation. |
| **document intent** | A desirable direction in a document or README; no corroborating implementation claim is made. |
| **historical / stale** | Preserved evidence or proposal whose runtime assumptions conflict with current source or are dated. |
| **unknown** | Not inspected deeply enough; absence of a finding is not proof of absence. |

The terms `live`, `wired`, `planned`, `restricted`, and `demo` used by the
[Workspace/Classroom authority audit](2026-09-15-workspace-classroom-domain-authority.md)
remain useful at capability level. This ledger does not collapse them into a
single optimistic package label.

## 2. Evidence precedence and document status

When artifacts disagree, use this order:

1. Checked-out source, package manifests, schema, migrations, and route mounts.
2. Source-linked tests, with their stated G0–G5 evidence level and substitutions.
3. Generated inventories that identify their input and generation date.
4. Dated architecture decisions/audits that name source evidence and limits.
5. Package READMEs and product descriptions, treated as intent unless corroborated.
6. Marketing and registry metadata, treated as discovery material only.

An existing test does not automatically establish an adjacent route, policy,
persistence or recovery seam. Assign an evidence level only to the assertion
actually exercised, and record its substitutions and limitations beside the
capability it supports.

| Artifact | Disposition | Why |
| --- | --- | --- |
| [Soul & Core Covenant](../Core/gurudevi-soul-and-core-covenant.md) | governing product covenant | Defines the human-first Sanctuary, five places, many doors, and non-negotiables; explicitly does not claim all described work is shipped. |
| [API Gate A baseline](2026-10-23-api-v0-v1-gate-a-baseline.md) | authoritative API snapshot for its observation date | Names its checked sources and limitations; it is not a whole-platform maturity claim. |
| [Workspace/Classroom authority audit](2026-09-15-workspace-classroom-domain-authority.md) | canonical for inspected classroom/UI jobs | Distinguishes wired from production-complete and records known gaps. |
| `docs/atlas/capabilities.yaml` | generated supporting index, not yet an accepted ledger seed | Valuable schema→API→client→route evidence, but its generator date, inputs, consumer linkage and route checks must be verified before it is extended or used as a decision authority. |
| `docs/stack-map/landscape/stack-map.md` | generated dependency map | Supports consumer/dependency analysis, not functional maturity. |
| 2026-10-11 many-doors dossier | supporting future/critical exploration | Strong failure analysis; its possibilities are not implementation evidence. |
| package READMEs | intent/overview | Several overstate current behaviour; drift is listed below rather than silently erased. |
| older Hono/data-odyssey/ERP plans | historical/supporting design | Keep for rationale, but do not let their `active` front matter override present source. |

## 3. Product topology: places, roles, doors, and applications

The product topology is not equivalent to the package tree. A person moves
between five lived places; packages are implementation modules that may support
more than one place.

```text
EdLove Epistemic Commons  ↔  Gurudevi Sanctuary
                                  │
               ┌───────┬──────────┼──────────┬───────────┐
               │       │          │          │           │
             Self  Workspace   Library   Community   Profile/Settings
                      │
     Learning Studio · Classroom · School · Family Space · specialist workrooms
```

| Product place | People and human job | Main current source owners | Current reading |
| --- | --- | --- | --- |
| **Self** | Personal reflection, wellbeing, privacy, goals, rhythms; the person behind every role | `@repo/self`, `@repo/profile`, core identity/storage, web Self floor | Implemented/wired in several private flows; privacy boundaries and repository migration remain capability-specific. It is not institutional surveillance data. |
| **Workspace** | Learning, teaching, leadership, family-school work, institutional operations | `@repo/classroom`, `@repo/admin`, core workbench/permissions, mobile/workspace, web workspace | Largest working surface. Classroom is strongest; leadership/guardian/inventory/form/editorial maturity varies. |
| **Library** | Read, discover, curate, map, scan, share resources and learning tools | `@repo/library`, scanner-kit, EdLove public atlas | Implemented package and screens; public/curation/route reachability differs by app. It is not yet evidence of a municipal circulation system. |
| **Community** | Groups, feed, notices, direct/group conversation, belonging with boundaries | `@repo/community`, API community handlers, mobile and web community floors | Real conversation/community seams; protocol/federation and workspace surface composition are partial/scaffold. |
| **Profile & Settings** | Identity, bonds/memberships, consent, history, notifications, control | `@repo/profile`, core identity/auth, policies, account scope | Central and substantial, but policy authority is fragmented across runtime layers. |
| **EdLove Commons** | Public editorial research, atlas, civic/educational knowledge | `apps/edlove-web`, `@repo/editorial`, library/atlas sources | Public research/editorial surface distinct from protected school work. |

### Roles are perspectives, not separate products

Core defines personal, commercial, institutional-bond, and guardian-bond
perspectives in `packages/core/src/types/Perspective.ts`. Workspace changes its
expression for learner, teacher, principal, guardian/family, founder/platform
administrator, and future workforce roles. A route or tab may be role-shaped;
it is not proof of server authority. `Bond` relationship context and
`SchoolMembership` affiliation are distinct and must not be casually merged.

### Applications and surface ownership

| App | Role in the topology | Evidence-grounded status and concern |
| --- | --- | --- |
| `apps/gurudevi-mobile` | Primary native Sanctuary, rich tab/workspace route tree | Main consumer of domain packages and registries. It exposes many nested workrooms, whose route presence still needs per-capability proof. |
| `apps/gurudevi-web` | Next.js Sanctuary/browser experience | Contains its own Workspace and local Library/Community canvases. Inspection of its `package.json` and app imports found no `@repo/library` or `@repo/community` dependency/consumer. Its README and CONTEXT disagree about completeness, creating parallel-surface drift risk. |
| `apps/sanctuary-api` | Hono/oRPC/OpenAPI server, policy/data/worker boundary | Active modular-monolith transport. It contains both real handlers and prototypes/scaffolds; procedure count is not business capability count. |
| `apps/edlove-web` | Public research/atlas/editorial commons | Public knowledge surface, not a protected LMS/workflow interface. Its docs must not be used as sanctuary delivery proof. |
| `apps/gurudevi-marketingWeb` | Astro marketing/public presentation | Coexists with a Next marketing route in `gurudevi-web`; canonical public-site ownership and launch copy need a decision. Its dated alpha language is not current product state. |

## 4. UI and route truth

### Primary native navigation

`apps/gurudevi-mobile/app/(tabs)/_layout.tsx` exposes the five Sanctuary tabs:
Library, Workspace, Self, Community, and Profile. Workspace then contains
role- and task-specific routes including classroom/attendance/gradebook,
guardian, founder, welfare, inventory, events, editorial, commercial, atlas,
and a workforce-role screen.

The mobile catalog composes package registries in
`apps/gurudevi-mobile/src/boot/registerAppCatalog.ts`. This is discovery and
lifecycle metadata—not authorization or proof that a screen has durable data.

### Browser navigation

`apps/gurudevi-web/app/(sanctuary)/workspace/workspaceFeatureRegistry.ts` is a
separate hard-coded 14-item Workspace navigation catalog. It is consumed by the
Workspace navigation/floor and is tested for count and role filtering, not for
filesystem-route existence, authority parity, or data persistence. Every target
must therefore be recorded as **route verified**, **headless**, **unresolved**,
or **planned** before being called available.

### Registry and surface finding

`@repo/library` and `@repo/community` have package registries with `live` items,
but their workspace surface hooks create definitions with
`content: undefined as unknown as React.ReactNode`. That **content field** is a
placeholder and cannot evidence a rendered workspace projection. The packages'
screens separately render content and consume the surface metadata. Similarly,
navigation visibility, `webSupport`, a screen export, and an integrated rendered
surface are separate facts.

### Browser Workspace route inventory — filesystem resolution only

Every current target in `WORKSPACE_FEATURES` has a corresponding `page.tsx` in
the checked-out browser app. This verifies only file presence, not route guard,
authorization, data correctness, persistence, or production availability.

| Feature ID | Registry href | Filesystem resolution | Capability maturity remains |
| --- | --- | --- | --- |
| attendance | `/workspace` | `workspace/page.tsx` | partial/wired |
| timetable | `/workspace/timetable` | `workspace/timetable/page.tsx` | partial |
| notices | `/workspace/notices` | `workspace/notices/page.tsx` | partial |
| submissions | `/workspace/submissions` | `workspace/submissions/page.tsx` | partial/wired |
| climate | `/workspace/climate` | `workspace/climate/page.tsx` | partial |
| tuition | `/workspace/tuition` | `workspace/tuition/page.tsx` | partial |
| gradebook | `/workspace/gradebook` | `workspace/gradebook/page.tsx` | partial/wired |
| plan | `/workspace/plan` | `workspace/plan/page.tsx` | partial |
| kiosk | `/workspace/kiosk` | `workspace/kiosk/page.tsx` | scaffold/partial |
| badges | `/workspace/badges` | `workspace/badges/page.tsx` | partial |
| school | `/workspace/school` | `workspace/school/page.tsx` | partial |
| events | `/workspace/events` | `workspace/events/page.tsx` | partial |
| claim | `/workspace/claim` | `workspace/claim/page.tsx` | partial |
| editorial | `/workspace/editorial` | `workspace/editorial/page.tsx` | partial/wired |

## 5. Package implementation catalogue

This catalogue accounts for the 29 top-level directories returned by the
checked-out `packages/` inventory on 2026-10-23. It summarizes the
implementation seam; detailed jobs belong in the capability matrix that
follows. It does not claim that every source file inside a package was executed.

| Package | Implemented/source-visible seam | Maturity | Boundary or truth warning |
| --- | --- | --- | --- |
| `@repo/core` | Shared contracts, API clients, auth/identity, stores, errors, offline/outbox, workspace/permission logic; actual PowerSync connector/runtime/schema/hooks | implemented central spine | It is very broad and high-centrality. Treat it as platform substrate, not an unbounded dumping ground. |
| `@repo/schema` | ZenStack-derived ORM metadata, models, input types, schema factories | implemented generator output | `schema.zmodel` plus generation is stronger authority than its generated artifacts alone; Core also has overlapping domain contracts. |
| `@repo/database` | ZenStack/Kysely client, policy-auth loading, SQL ports, sandbox/DuckDB adapters | partial server data adapter | README claims PowerSync/local SQLite/Drizzle/migration ownership that is actually in Core or elsewhere. |
| `@repo/policies` | Cedar evaluator, schemas/policies, action/resource registries, parity tests | implemented policy engine | Coexists with ZenStack policy enforcement; a platform authority/parity map is required. |
| `@repo/classroom` | Attendance, gradebook, teacher/student/content/plan surfaces, contracts/screens/hooks | implemented/wired strongest school domain | Cross-depends on Admin; offline, privacy, data parity and demo/live distinctions remain open. |
| `@repo/admin` | Principal/guardian/founder/admin screens; school structure, staff, inventory, feedback, reports/governance | partial/wired | Broad institutional surface with uneven depth; split governance, family, operations and platform-admin jobs rather than treating it as one domain. |
| `@repo/workforce` | Job/position/assignment types, registry, construction shell | scaffold/planned | No demonstrated workforce persistence/API. Do not confuse it with existing teacher/staff utilities. Past removal target makes registry lifecycle stale. |
| `@repo/accounting` | Double-entry validation, journal/ERP bridge; server-side atomic transaction/entries insertion | partial backend foundation | Stored account balance is not evidently derived on transaction insertion; budgets/cheques/audit/reporting/tenant scope are incomplete. |
| `@repo/payments` | Payment-intent/invoice/receipt contracts and handler; PayHere webhook validation | partial/wired | Provider classes are demo in production; no proven payment→ledger/receipt reconciliation; offline cash is not implemented evidence. |
| `@repo/form-builder` | Form editor, contracts, template/response handlers and SQL-backed records | partial/wired | Default services deliberately throw; fallback persistence is browser/process local; no demonstrated offline response queue. |
| `@repo/editorial` | Editorial model/adapters; durable API control plane is in Core/API/mobile | partial/wired | Map-backed hexagonal adapter and dry-run distribution must not be marketed as live publishing integration. |
| `@repo/library` | Resource/collection/reader/map/curation APIs, hooks and screens | implemented/wired | Browser consumption and workspace embedding differ from native package support; no lending/circulation claim. |
| `@repo/community` | Groups, posts, comments, notices, messages, screens, delivery/idempotency helpers | implemented/wired | AT protocol integration is a stub; workspace surface metadata is not rendered content. |
| `@repo/self` | Wellbeing/wisdom/progress/privacy feature model; local native reads/writes, outbox, RPC fallback | implemented/wired in inspected wellbeing flows | Old architecture recovery note is stale for mood/fire persistence; inspect every sensitive mutation independently. |
| `@repo/profile` | Profile/settings/history/public/own screens and APIs | implemented/wired UI/domain seam | Privacy guarantees in overview docs need behavioural/policy evidence per field/action. |
| `@repo/people` | Directory/staff/feedback components and hooks | partial/local simulation | Directory/bonds, check-in/out, leave, and echoes use local SafeZustandStorage in inspected sources; not school-wide durable workflows. |
| `@repo/ai` | Assistant hook/screens, provider/chat actions, classroom scheduling support | partial | Client submits operational context and BYOK/privacy data; server authority, provider storage and privacy enforcement require a focused audit. |
| `@repo/analytics` | Performance/prediction hooks, charts, PostHog adapter, benchmark tools | partial | Some multi-tenant metrics are mock/zero; GPA delegates to Core despite README ownership; `/ui` is not a declared export. |
| `@repo/scanner-kit` | QR, deep links, camera/OCR providers/pipeline | wired capture infrastructure | It is not a complete attendance/asset/benefit workflow. Inspect `STUDENT:` discriminant mismatch before reuse. |
| `@repo/graphics` | Charts, layouts, geospatial/catchment, visualization utilities | supporting toolkit | Do not count visual capability as institutional workflow completion. |
| `@repo/ui` | Native/RN-first primitives, tokens, world/theme, canvas and feedback components | implemented shared UI layer | Web must follow stated web-boundary rules; an exported web variant is not carte blanche to put web product components here. |
| `@repo/platform-mcp` | Executable stdio developer MCP gateway: discovery/audit/maintenance/scout/device/document tools | implemented developer control plane | Private side-effectful executable, not a user product runtime nor a generic package library. |
| `@repo/verger-core` | Runtime capacity/performance governor | implemented supporting substrate | Supports device/runtime adaptation, not product-domain authority. |
| `@repo/verger-android` | Android native bridge/mapping for governor | implemented supporting substrate | Native/runtime integration requires device evidence. |
| `@repo/verger-react` | React provider/hooks around governor | partial supporting adapter | Low observed consumption; verify before expanding. |
| `@repo/eslint-config`, `@repo/typescript-config`, `@repo/types-shim`, `@repo/scripts` | Tooling/configuration | supporting infrastructure | No product capability inference. |

## 6. Capability ledger by human job

The maturity values below are **family summaries, not a maximum inherited by
every action or surface**. Each row explicitly retains independent tracks and
must be decomposed into stable capability IDs before release certification.

| Capability family | Primary people/place | Current implementation seam | Maturity | Material gap or decision |
| --- | --- | --- | --- | --- |
| Identity, account and perspective | Every person / Profile edge | Core identity, active account/bond resolution, auth stores, server context | implemented/wired | Define one explicit authority map for account, bond, membership, delegation, revocation and cross-app selection. |
| Authorization | Every protected action | Cedar evaluator, ZenStack policy plugin, handler checks, POA-like contracts | partial | Two enforcement systems and incomplete parity evidence; choose canonical decision/result model per boundary. |
| Personal wellbeing/reflection | Person / Self | Mood, thought, fire journal, reminders/goals repositories; local/outbox/RPC fallback in inspected wellbeing path | implemented/wired | Private records must never become institutional observation by default; inventory remaining repository paths and consent/export/deletion semantics. |
| Learning and classroom work | Learner/teacher / Workspace | Classroom screens, assignment, attendance, gradebook, plans, contract/API seams | implemented/wired | Route visibility, offline conflict handling, RLS/privacy and exact recovery differ by job. |
| Attendance | Teacher/learner/school / Workspace | Existing v0 paths plus first canonical v1 command work, local queues and QR-related infrastructure | partial/wired | Gate kiosk, teacher roll, reconciliation, pastoral notes and query projections need one event/authority model—not just a batch API. |
| Guardian/family bridge | Guardian, learner, educator / Family Space | Admin/community/profile related screens and bonds | partial/wired | Clarify relationship scope, notices, consent, correction and secure channel boundaries. |
| School governance/operations | Principal/founder / School workspace | Admin dashboards, structure, inventory, staff, reports/documents | partial | Separate live data from demo/local utilities and name the school registry/canonical tenant model. |
| Workforce/HR | Staff/steward / future workspace | Shell, types, registry only | scaffold/planned | Do not declare HR/ERP. First define employment/assignment/leave/time/payroll authority and retention before implementation. |
| Finance/accounting | Institutional steward / operations | Ledger validation, transaction/entry records, budgets, ERP bridge | partial | Tenant ownership, derived balance, fiscal period, correction, audit/export and reconciliation are release-blocking for financial claims. |
| Payments | Payer/institution / operations | Intent creation, invoices/receipts models, callback verification | partial | Live provider lifecycle, disputes/refunds, ledger posting, receipt durability, offline cash and operational ownership are not demonstrated. |
| Forms | Staff/family/community / Workspace | Templates/responses, contracts, handler/SQL, UI builder | partial/wired | Offline submission/replay, conditional logic/analytics, public safety and scope need separate evidence. |
| Editorial/publication | Author/reviewer/steward / Workspace + Commons | Submission/review/rights/events/deliveries API and mobile workflow | partial/wired | External distribution default is dry-run; public publication/projector lifecycle needs explicit proof. |
| Library/commons | All people / Library + EdLove | Resources/collections, readers, curation, map/tools, scanner integration | implemented/wired | Differentiate protected library, public commons, link verification and resource engagement; avoid unsupported physical-lending claim. |
| Community/conversation | All people / Community | Group/feed/message/notice/direct-message persistence and screens | implemented/wired | Trust/moderation, cross-surface reachability, notification/outbox and protocol federation are separate maturity tracks. |
| AI assistant | People with bounded help / all places | Assistant client, chat route, role-aware operational prompts, limited action requests | partial | No autonomous authority claim. Audit data minimization, confirmation, input truthfulness, tool authorization, provider retention and recovery. |
| Durable agents/workflows | Authorized human + reviewer / Workspace | Durable-run/ledger routes and Inngest dispatch | partial | Persist-then-dispatch handoff has no demonstrated compensation/reconciler; generic workflow engine remains absent by design. |
| Events/realtime | People awaiting change / all places | Event dispatch and SSE route mount | scaffold/partial | SSE presently sends handshake/heartbeat, not authenticated scoped domain events; enqueue path can return success after send failure. |
| Notifications/channels | People in real conditions / doors | Push/SMS/WhatsApp/Telegram/QR directions and selected adapters | partial | Each channel needs durable inbox/outbox, linkage, consent, delivery observation, correction, and failure truth—not a generic “omnichannel” label. |
| Product activity and audit | Persons, stewards, operators | Domain receipts/audit fragments, events, analytics, logs | partial | Separate user-visible activity history, compliance/security audit, operational logs, and privacy-preserving product analytics. Do not build a surveillance event lake. |
| Offline/local continuity | All people / all places | PowerSync, local stores, outbox/receipts, web-specific state paths | partial | Capability-by-capability availability/revocation/conflict/recovery proof is required. Offline is not a platform-wide boolean. |
| Developer/platform control | Maintainers / control plane | Platform MCP, codegraph/audits, contracts/tooling | implemented for developer use | It is not end-user agent authority. Constrain side effects, credentials and audit at the tool boundary. |

## 7. Cross-cutting ownership map and contradictions

| Seam | Observed current owner(s) | Contradiction/risk | Required architectural decision |
| --- | --- | --- | --- |
| PowerSync/local data | Core adapters, schema, hooks, connector | Database README claims ownership absent from package exports | Declare Core as runtime sync owner; revise documentation only after owners confirm. |
| Schema and contracts | `schema.zmodel`/generated schema; Core types/contracts; API handlers | Multiple representations can drift | Specify model→contract→migration generation/change protocol and enforce drift check. |
| Authorization | Cedar in Policies; ZenStack policy client in Database; handler/POA checks | Multiple decisions can disagree or leave seams uncovered | Publish a per-boundary authority matrix and parity tests; never silently pick one. |
| UI catalogues | Core AppCatalog, package registries, mobile route tree, web local registry | No single verified route-to-capability graph | Make one generated/validated ledger ID the join key; retain local presentation registries as projections. |
| Data and institution | School, membership, bond, tuition, academic registry and financial records | School/tenant taxonomy is incomplete; finance models show weak tenant scoping | Define organization/tenant/education-provider model before claiming general ERP or university support. |
| Events/workers | Hono event handlers, durable agent routes, Inngest, SSE | Dispatch and stream outcomes do not yet represent durable delivery | Define inbox/outbox, receipt and replay semantics before widening automation. |
| Analytics/activity | Core typed telemetry, Analytics package, product logs/audit concepts | Measurement can become surveillance; analytics capability is uneven | Establish four distinct ledgers: user activity, compliance audit, operational telemetry, consented product learning. |
| Marketing/public entry | Astro marketing app, Next marketing route, EdLove site | Duplicate claims/manifests and dated launch text | Assign canonical host/ownership and link supporting surfaces. |

## 8. Documentation drift register

These records preserve rather than delete older work. The indicated disposition
applies to the cited claim, not necessarily every useful idea in the document.

| Claim/document | Current evidence | Ledger disposition | Accountable owner | Review by |
| --- | --- | --- | --- | --- |
| `packages/database/README.md` says Database owns PowerSync/local SQLite/Drizzle/migrations | `packages/database/src/index.ts` exports ZenStack/sandbox/DuckDB; PowerSync public runtime is under Core | stale operational ownership claim | Data-platform owner | 2026-11-06 |
| `packages/people/README.md` describes directory, presence, leave and guardian workflows | inspected directory/staff/feedback paths use SafeZustandStorage keys/local state | intent; not server-workflow proof | People/Admin owner | 2026-11-06 |
| `packages/self/ARCHITECTURE.md` presents mood/fire migration as current focus | `wellbeingRepository.ts` has guest/local PowerSync/outbox/RPC behaviour | historical recovery status for that seam | Self owner | 2026-11-06 |
| `packages/analytics/README.md` claims `/ui` and GPA ownership | manifest lacks explicit `/ui`; root delegates GPA to Core; some tenant metrics are mock | stale/partial API ownership claim | Analytics/Core owner | 2026-11-06 |
| `packages/library/ARCHITECTURE.md` says Expo Router ~4 and calls library registry a format registry | current stack/source differ | historical architecture note | Library owner | 2026-11-06 |
| `apps/gurudevi-web/README.md` says complete authenticated workspace and `/library`; `CONTEXT.md` says no authentication, production data, or deployment config | source has many Sanctuary pages but no verified `/library` filesystem route or package integration | contradictory; scope/date reconciliation required | Web platform owner | 2026-10-30 |
| Event-stream route comment claims live attendance/grade/notice delivery | `eventsStream.ts` only handshake/heartbeat/sleep; no auth/subscription/data source | false current implementation comment; repair under a scoped change later | API/events owner | 2026-10-30 |
| March 2026 school ERP plans marked active | current package/source maturity differs; conceptual human-first ERP distinction remains useful | historical/planning source | Architecture + institutional owner | 2026-11-13 |
| Editorial platform architecture says migration/API pending | current migration, handler and mobile desk exist; distribution defaults dry-run | historical implementation snapshot; operations guide is better supporting evidence | Editorial owner | 2026-11-06 |
| Workforce/accounting/payments/forms READMEs use broad active language | source demonstrates narrower seams and placeholders | product intent unless individual capability evidence says otherwise | Institutional operations owner | 2026-11-06 |

## 9. Hostile architecture gate

No new “domain”, tab, API family, agent, or ERP label may advance on catalogue
presence alone. Before calling a capability implemented, the owning team must
answer all applicable questions:

1. **Real user and authority:** Which person acts, under which bond/membership,
   organization, role, delegation, and consent? What happens after revocation?
2. **Reachability:** Which filesystem route or explicit headless endpoint invokes
   it? Which catalogues link to it? Is navigation merely visible, or authorized?
3. **Truth and durability:** Which contract, schema, transaction, receipt, and
   correction/reconciliation mechanism establishes the result?
4. **Failure:** What is shown after timeout, provider failure, device loss,
   stale offline data, duplicate operation, worker crash, or lost response?
5. **Privacy:** What data crosses client/channel/model boundaries? What is the
   minimum disclosure, retention, export, deletion and audit story?
6. **Operational ownership:** Who repairs a stuck workflow, rotates credentials,
   reconciles finance, manages a tenant, and funds the ongoing operation?
7. **Evidence:** What exact G0–G5/R1 result supports the claim, and what does it
   explicitly not prove?

### Non-negotiable ledger acceptance criteria

- Every `implemented` UI surface resolves to a verified route or is explicitly
  marked headless, and names its screen/component owner.
- Every meaningful action links actor/scope, contract, authorization, durable
  store, failure/recovery behaviour, and evidence. Missing links downgrade it.
- Every package export records platform condition and actual consumers. A package
  README, mock, or registry item cannot promote maturity.
- Every agent/workflow/event records its trigger → durable acceptance → dispatch
  → execution → human review/promotion → queryable result/recovery chain.
- Every source/document disagreement enters the drift register with a review
  date and named owner; historical documents are retained, not deleted.
- `undefined as unknown as ReactNode`, timer/canned-agent replies, in-memory
  provider results, local-only repositories, zero/empty metric mocks, and
  heartbeat-only streams are labeled honestly and excluded from end-to-end count.

## 10. Operationalising the ledger

This document is the constitution and index. A machine-verifiable companion
should be created only after an audited decision on whether to extend or replace
`docs/atlas/capabilities.yaml`. That generated file is not yet a verified seed.
The selected machine-readable ledger must join package export, route, contract,
schema/migration, policy mechanism, persistence/sync path, evidence and review
date. It must validate:

```text
declared UI route       → existing route or explicit external/headless marker
registry capability ID  → one owning package and lifecycle record
implemented action      → contract + authorization + persistence evidence
agent/workflow action   → durable outcome/recovery evidence
documentation claim     → source evidence or intent/historical classification
```

### First decision programme (not implementation approval)

1. Publish the identity, organization/tenant, bond, membership and delegation
   model; include school, tuition institution, future university/organization,
   and person-owned scope without pretending all are already generalized.
2. Reconcile Cedar, ZenStack, handler, and UI authorization into one explicit
   authority/parity map.
3. Build the route/package/capability join and downgrade all unverified registry
   labels. This is the prerequisite for UI/domain rationalization.
4. Establish a humane activity/audit taxonomy before adding event capture:
   user-visible history, compliance audit, operational logs, and consented
   product learning must remain separate.
5. Choose one complete, recoverable cross-door workflow—such as attendance or
   an approved notice—and prove it through two clients before expanding agents,
   ERP, or realtime labels.
6. Treat financial tenancy/reconciliation and workforce data authority as
   explicit design gates before pursuing an ERP claim.

## 11. Evidence limitations and review cadence

This ledger is a source reconnaissance dated **2026-10-23**. It did not execute
production traffic, inspect secrets, establish deployment configuration, or
prove real-device/real-database behaviour beyond evidence explicitly cited in
the supporting documents. It must be reviewed when a package boundary, route
registry, schema/migration, authorization engine, worker transport, or public
application ownership changes.

The hostile reviewer remains part of every update: read the raw diff first,
preserve historical records, reject claims that skip a seam, and prefer an
honest `partial` label to ceremonial completeness.
