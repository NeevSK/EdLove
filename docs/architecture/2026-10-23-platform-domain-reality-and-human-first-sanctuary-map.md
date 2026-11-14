---
title: "Platform Domain Reality and Human-First Sanctuary Map"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, platform, sanctuary, domains, erp, discovery, api]
---

# Platform Domain Reality and Human-First Sanctuary Map

## Status and decision

This is the required discovery record before replacing the prematurely narrow Gate D API plan. It is grounded in the current product covenant, source trees, package manifests, schema, Sanctuary API, route trees, and historical documentation.

**Decision:** the platform is not modeled correctly as a school ERP with wellbeing and community attached. The current governing product model is a connected ecosystem:

```text
EdLove Epistemic Commons  <->  Gurudevi Sanctuary
public knowledge/research       operational ecology for people and relationships
```

Gurudevi's lived top-level places are **Self, Workspace, Library, Community, and Profile & Settings**. Workspace changes according to the person's active relationship and responsibility: learner, teacher, school leader, guardian/family, founder, workforce, or other approved capacity. Classroom is an important Workspace module, not the platform's organizing center.

This document distinguishes **implemented source evidence**, **current product intent**, and **aspirational/unproven territory**. It does not authorize implementation or retirement.

## Authority hierarchy

| Authority | What it establishes | Limitation |
| --- | --- | --- |
| `docs/Core/gurudevi-soul-and-core-covenant.md` (active, 2026-10-11) | Current product/architecture covenant: Self, Workspace, Library, Community, Profile & Settings; bounded AI; human authority; local-first continuity | Product intent, not proof every capability ships |
| `README.md` (active, 2026-10-15) | Two-engine ecosystem and broad package inventory | Ecosystem overview, not detailed domain truth |
| Source routes, contracts, handlers, schemas, tests | What is currently represented or exercised | A route/package alone does not prove production completeness |
| Older roadmaps/decisions | Historical rationale | Must not override active covenant where superseded or contradicted |

The earlier Gate D draft at `docs/architecture/2026-10-23-api-v0-v1-gate-d-domain-capability-constitution.md` remains preserved as `draft`; it over-centred Classroom because it was inferred from API migration work alone.

## The human-first ERP question

"Human-first ERP" is useful only if it does **not** mean traditional enterprise control software with a more pleasant interface. In this platform it means:

1. the primary record is a person in relationships and contexts, not an employee, student, customer, or database row isolated from life;
2. institutional coordination exists to reduce administrative burden and support human judgement, not to enclosure or surveillance;
3. self-owned wellbeing, reflection, privacy, consent, and agency are first-class alongside institutional work;
4. educational, household, community, knowledge, and organizational contexts may meet through explicit relationships and permissions—not a universal organization table that silently owns people;
5. consequential decisions remain accountable to people; AI and automation assist with drafts, explanation, clerical coordination, and bounded workflows;
6. the system continues to serve people under weak connectivity and unequal access; and
7. audit, product activity, telemetry, and external effects remain separate so operational convenience cannot turn into behavioral surveillance.

The Sanctuary is therefore both an architectural and ethical boundary: it gives people a private/control-bearing place while allowing consented participation in learning, organizations, community, and public knowledge.

## Actual product topology

```text
                    ┌───────────────────────────────────┐
                    │ EdLove Epistemic Commons           │
                    │ public research, editorial, atlas, │
                    │ educational resources and library  │
                    └───────────────┬───────────────────┘
                                    │ curated exchange
┌───────────────────────────────────▼───────────────────────────────────┐
│ Gurudevi Sanctuary                                                     │
│  Self  |  Workspace  |  Library  |  Community  |  Profile & Settings   │
│         relationship- and capacity-shaped participation                │
└────────────┬───────────────┬───────────────┬───────────────┬──────────┘
             │               │               │               │
          person          organizations    commons       relationships
```

### Surface evidence

| Product surface | Current source evidence | Architectural role |
| --- | --- | --- |
| `apps/gurudevi-mobile` | Bottom tabs: Library, Workspace, Self, Community, Profile; route/registry evidence for role-specific Workspace, chat, library tools | Native lived Sanctuary experience |
| `apps/gurudevi-web` | Authenticated Sanctuary routes for workspace, self, library, community, profile, admin, agent lab | Browser Sanctuary and web composition |
| `apps/sanctuary-api` | oRPC/Hono domain handlers, active-scope context, policies, workers, specialized ingress | Capability/adaptation service, not product taxonomy authority |
| `apps/edlove-web` | Astro editorial/public resource surface | Public Commons; its README framework claim conflicts with manifest/source and is not authoritative |
| `apps/gurudevi-marketingWeb` | Astro marketing/legal/support site with `DEPRECATION.md` | Legacy/migration surface until lifecycle is reconciled |

## Implemented or source-represented domain map

### Person, identity, relationship and control

| Domain | Evidence | Reality statement |
| --- | --- | --- |
| Identity, account and onboarding | `User`, identity handlers, onboarding, permission snapshot, active context builder | Implemented central system |
| Bonds, capacities and active scope | `Bond`, `SchoolMembership`, `activeScope.ts`, router context resolution | Core relationship/authority model; bond and institutional membership are intentionally distinct |
| Profile and settings | Profile package, Sanctuary Profile tab/routes | Real top-level control edge |
| Privacy/consent/security | privacy contracts, policy layer, audit/security records | Cross-cutting, not merely settings UI |

### Self: private life, practice and wellbeing

| Domain | Evidence | Guardrail |
| --- | --- | --- |
| Mood/wellbeing | `MoodLog`, `UserEnergyBalance`, self contract, `packages/self` | Private/person-owned by default; school signals must not become blanket surveillance |
| Reflection/journals/thought work | `FireJournalEntry`, `ThoughtRecord`, `LearningReflection`, journal/reflection handlers | Draft/ownership/visibility need explicit lifecycle rules |
| Personal goals and practice | Self package and routes | Represented; production surface must be assessed capability by capability |

### Workspace: role-shaped coordination and organizational work

| Module | Evidence | Current truth |
| --- | --- | --- |
| Schools and academic structure | `School`, school membership/join/claim models, grade classes/classrooms, school registry | First-class organizational implementation |
| Classroom learning | `@repo/classroom`, attendance, roster, assignments, submissions, grading handlers/contracts | Substantial real domain; not the whole product |
| Guardians/family | verified guardian/student context and dedicated routes | Real relationship module, distinct from generic school staff authority |
| Tutoring | `TuitionInstitute`, `TuitionBatch`, commercial/workspace routes | Real but narrow institution model |
| Founder/principal/admin operations | role-aware Workspace/admin routes and admin package | Represented, completeness varies |
| Workforce | `@repo/workforce`, workforce routes/roles, `StaffLeave` | Partial workforce operation—not full HR suite |
| Welfare, inventory, events, forms | Workspace navigation and focused contracts/packages | Real surface/modules, not yet proof of unified ERP maturity |
| Accounting and payments | accounting, payments packages; ERP contract/handler with ledger/invoices/payment intents/receipts | Real financial core; not whole enterprise back office |

### Library and Commons

| Domain | Evidence | Reality statement |
| --- | --- | --- |
| Educational resource library | library schema, contracts, handler, web/mobile library routes | End-to-end resource/collection/search/engagement domain |
| Reader, map, video, scanning and tools | Sanctuary Library routes/tabs and scanner kit | Real product surfaces |
| EdLove public commons/editorial/research atlas | `edlove-web`, editorial package, research/docs | Public epistemic commons, not simply a private school document module |

### Community and communication

| Domain | Evidence | Reality statement |
| --- | --- | --- |
| Groups, posts, membership, reactions/comments | Community package, schema models, community contract/handler | Real social/community domain |
| Direct and group messaging | conversations/messages models, messaging/channel/social routers, web/mobile routes | Real communication surface |
| Notices and delivery | channel/delivery workers, notice release workflow | Publication intent and provider delivery must remain distinct |

### Intelligence, automation and operations

| Domain | Evidence | Reality statement |
| --- | --- | --- |
| AI assistance | AI package, provider dependencies, AI route, agent-lab surface | Product/technical surface exists |
| Durable workers/automations | Inngest, `studentSupport.ts`, `platformEvents.ts`, scheduled notice release | Bounded workflows exist; not a general autonomous-agent runtime |
| Platform operations | receipts, audits, policies, platform MCP, telemetry, workers | Necessary cross-cutting capabilities, not ownership of product meaning |

## What is not yet justified as a first-class implemented domain

| Claim | Current evidence | Correct treatment |
| --- | --- | --- |
| General university/college tenant model | no first-class University/College organizational schema found; school fields include free-form type/tenant-kind | Vision/research question; do not design an API as though it already exists |
| Complete generalized organization model | schools and tutoring are concrete; broad generic institutional taxonomy is not | Design later from relationship/invariant requirements, not an `Organization` mega-table impulse |
| Full HR suite | staff leave and workforce surface exist; no full lifecycle, recruitment, payroll, benefits, or time-clock model found | Partial workforce domain; avoid claiming HR ERP parity |
| General municipal/public lending library | educational resource/collection commons exists | Do not equate it with library circulation/cataloguing system without evidence |
| Arbitrary autonomous agent orchestration | bounded workers and agent support flows exist | Keep human approval and deterministic policy; no "agent platform" abstraction by slogan |
| Every documented feature is shipped | covenant explicitly separates intent from shipped capability | Require source and evidence per capability |

## Existing documentation hazards

1. The active Covenant is the product anchor; older decisions that it supersedes are historical evidence only.
2. `apps/edlove-web/README.md` claims a Next.js framework while its current manifest/source show Astro; treat the README as stale on implementation facts.
3. Mobile and web READMEs understate several role/workspace/community/library surfaces visible in navigation and routes.
4. Package/route existence proves represented code, not finished workflow, live policy, or production readiness.
5. The API-v0/v1 documents are useful transport/migration evidence but cannot define the platform's full domain map alone.

## Implications for the replacement Gate D plan

The replacement Gate D must begin from the lived places and relationship model, then organize capabilities underneath them:

```text
Person & control
  -> Self / Profile / identity, bonds, consent, privacy
Participating contexts
  -> Workspace: learning, family, organization, workforce, financial operations
Shared meaning
  -> Library / EdLove Commons / editorial and research
Shared life
  -> Community / conversation / notices / participation
Bounded assistance
  -> AI, workflows, automations, external delivery
```

API domains need not mirror UI tabs one-to-one. Instead:

- places describe the lived product and information boundaries;
- relationship and organizational contexts define scope/authority;
- capability families define stable promises and transactions;
- transports adapt capabilities to mobile, web, workers, webhooks, and approved BFFs.

This preserves modularity without reducing the whole platform to isolated feature APIs.

## Next discovery deliverable

Before a new active Gate D constitution, produce a **Platform Domain Ledger** with one entry per source-grounded capability family, containing:

1. lived place(s) and participating roles;
2. relationship/scope context and authority facts;
3. source packages, schemas, API procedures, UI routes, workers, and callers;
4. implemented / partial / aspirational confidence;
5. adjacent capabilities that must evolve together;
6. privacy, activity, audit, automation, and offline implications; and
7. v0/v1 disposition only after the domain picture is clear.

The Classroom Learning slice—including attendance—will then be one ledger section among Self, Library/Commons, Community/Communication, Organization/Workspace, and Intelligence/Automation; it cannot dictate the ontology of the whole platform.
