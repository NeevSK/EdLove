---
title: "Gurudevi Platform Map"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [architecture, domains, platform, api, map, reference]
---

# Gurudevi Platform Map

The single top-down picture of what Gurudevi is and how it is organized. Read this
before designing any API, package, screen or agent tool. Other documents go deeper;
none of them redefines this structure. If something here is wrong, fix it here first.

Explorable version: [Gurudevi Platform Map (artifact)](https://claude.ai/artifact/L1YK1DrYaAcs2LPeULdtBE).

## What Gurudevi is

A person-centred education platform that covers a person's whole life with learning:
their own wellbeing, their learning and work in schools and institutes, their
community, the knowledge they read and make, the record of who they became over the
years, and AI help across all of it. It is local first, mobile first, works on many
devices and with many accounts per device, and treats data as the person's or the
institution's, never the platform's.

## The six layers

Each layer has one job. A layer may use the layers below it; it never owns what a
lower layer owns.

| Layer | Job | Examples |
| --- | --- | --- |
| 1. Channels | Who calls in | Mobile app, web, messaging bots, external agents and MCP tools, workers and schedules, support operators |
| 2. Places | Where people go | Self, Workspace, Community, Library, Profile, the AI companion present everywhere |
| 3. Business domains | Who owns each fact | Wellbeing, Learning, Institution operations, Family, Community, Library, Journey, Rewards, AI and agents |
| 4. Platform services | What every domain uses | Identity, bonds and authority, consent and privacy, audit, records lifecycle, notifications, files, search, time and calendar, entitlements, integrations, export |
| 5. Runtime and edge | How it runs safely | Local-first sync, sessions and account switching, devices and trust, request controls, observability, client runtime (Verger), agent runtime, deployment |
| 6. Substrate | Where it is stored | Postgres with row-level security, schemas and contracts, Cedar policies, object storage, durable jobs |

### The one rule

**Every fact has exactly one owner, and the owner is a business domain** (or, for
identity and authority facts, a platform service). Places compose facts from many
owners. Channels carry requests to owners. Platform services give every owner the
same tools and own no business meaning.

Two consequences:

- A tab is not a domain. The Workspace tab shows facts owned by Learning,
  Institution operations and Family. A grade appears to a student, a teacher and a
  guardian, but only Learning owns it.
- A new screen, bot intent or agent tool never creates a new API namespace. It calls
  capabilities that an owner already exposes, or it asks an owner to add one.

## Places and the domains behind them

| Place (tab) | Domains it mostly shows | Notes |
| --- | --- | --- |
| Self | Wellbeing, Rewards | Person-owned, private by default |
| Workspace | Learning, Institution operations, Family, AI | Shaped by the person's active bond and capacity |
| Community | Community and messaging | Includes official notices, which carry institutional authority |
| Library | Library and commons | Includes authoring and review (CMS) and the public EdLove commons |
| Profile | Journey, Rewards, and the person's consent settings | The record across years |
| AI companion | AI and agents | Present in every place |

## Business domains

Subdomains are a first draft for the domain design work in
[the domain design method](domain-design-method.md). A subdomain becomes real only
when its card is written and admitted there.

| Domain | Draft subdomains | Owns | Key rule |
| --- | --- | --- | --- |
| Wellbeing | mood and energy, journals and thought records, reflection, practice and goals | Person-owned facts | No institution sees these by default. Any school signal is aggregate and consented |
| Learning (LMS) | classrooms, lessons and materials, assignments and submissions, assessments and quizzes, grading, notes | Grades, submissions, classroom membership | Grades are corrected, never edited in place |
| Institution operations (ERP) | schools and academic structure, enrolment, timetables, attendance, staff and workforce, welfare, inventory, events and forms, fees and accounting, tutoring institutes | Institutional records | Records outlive the people's bonds to the institution |
| Family and guardianship | guardian verification, guardian access | Guardian bonds | Guardian access ends or changes when the child comes of age |
| Community and messaging | groups, posts and reactions, conversations, notices, moderation and safety | Posts, conversations, notices | Minors are present, so moderation is part of the domain, not an add-on |
| Library and commons | resources, collections, authoring and review, media, reading and scanning tools, public commons | Resources and their editorial state | Public, institution-only and private resources are different visibility, not different systems |
| Journey and profile | profile, life record, achievements and milestones, careers and portfolio, transitions | The life record | What a person earned stays with them when a bond ends |
| Rewards | points, badges, streaks, milestones | An append-only ledger | Earned in many domains, shown in Profile, never edited by the domain that displays it |
| AI and agents | assistance inside domains, agent runs, proposals awaiting approval, delegation grants, agent memory | Agent runs, proposals, grants, memory | An agent never has more authority than the person who delegated to it |

Open questions the domain design must settle: whether attendance belongs to Learning
or Institution operations (it can't belong to both), and whether Rewards is its own
domain or part of Journey.

## Platform services

In domain-driven design terms the business domains above are the **core domains**, and
identity and authority are **generic subdomains**: every product needs them and they
carry no education meaning. Onboarding is a **journey** across identity, authority,
consent, journey and devices, not part of authentication (see the
[authority model](authority-model.md#authentication-authorization-and-onboarding)).

Platform services are horizontal: every domain uses them the same way. They are built
first, because domains can't be built safely without them. See
[the horizontal foundation order](../../apps/sanctuary-api/docs/architecture/api-engineering-playbook.md#horizontal-layers-the-base-every-domain-stands-on).

| Service | Owns | Does not own |
| --- | --- | --- |
| Identity and accounts | The canonical account (`public.users.id`, UUIDv8), credential bindings | Profiles, roles |
| Bonds and authority | Bonds (person ↔ entity, with capacity and lifecycle), active scope, the Cedar policy decision | What any domain's rules mean |
| Consent, privacy and minors | Consent and delegation records, guardian consent, sharing grants | The facts being shared |
| Audit | The append-only trail of who did what, as whom, through what | Telemetry and analytics |
| Records lifecycle | Versions, corrections, soft deletion, retention, legal holds | Which retention period a record class has (domain plus law decides) |
| Notifications and delivery | Delivery attempts and preferences | The meaning of the message |
| Files and media | Stored objects and access to them | What a document is about |
| Search | Indexes that respect authority | The facts |
| Time and calendar | Academic years, terms, timetables, holidays per institution | Domain deadlines (they reference the calendar) |
| Entitlements and billing | What a school or person has paid for | Authorization (allowed is not the same as paid for) |
| Integrations | Connection state to WhatsApp, payment providers, Google and others | Business facts |
| Export and portability | Producing a person's or institution's data in open formats | The data itself |

Governance rules for all of these live in
[data governance and records](data-governance-and-records.md).

## Person-centred, with tenants

Gurudevi is not classic multi-tenant, where the school is the root and every account
lives inside one school. Here **the person is the root**: one account for a whole
life. **Bonds** connect the person to entities (schools, classrooms, institutes,
families), each bond with a **capacity** (student, teacher, guardian, principal and
so on) and a lifecycle (invited, active, ended and kept).

Facts have one of two kinds of owner:

- **The person**: journals, mood, personal notes, their own memories with AI. These
  never sit inside an institution's data, even when the person studies there.
- **An institution**: enrolment, attendance, grades, fees. These are tenant-scoped,
  and people reach them only through a bond.

Authorization is relationship based (ReBAC): may this person, through this bond, in
this capacity, on this device, possibly via this agent, do this action to that fact?
Cedar answers that on the server. The client may hide what is not allowed; it never
decides.

## Time horizon

A student's bond to a school can last 13 years; a teacher's career, 40. Records must
stay readable, attributable and exportable across those spans: stable identifiers,
versioned stored shapes, open export formats, and history that survives schema
changes, account switches and the end of bonds. See
[data governance and records](data-governance-and-records.md#decades).

## Load shape

Load follows the school day in Asia/Colombo: a sharp burst around 7:30–8:00 (sign-in
and attendance), steady through school hours, a drop after 14:00, a smaller evening
peak for homework and Self, near zero overnight. This is expected, not measured; there
is no production traffic yet. The API must scale out before the morning burst and must
not run on hosting that sleeps when idle. Local-first moves most reads to the phone, so
capacity planning focuses on sync and write validation.

## Interoperability and lock-in

People and institutions must be able to take their data out and move to another
system, and other systems must be able to talk to Gurudevi through education standards
where they exist. Our own API should be clean enough to serve as an example. See
[data portability and education standards](../../apps/sanctuary-api/docs/architecture/api-foundations/data-portability-and-education-standards.md).

## Where the details live

| Question | Document |
| --- | --- |
| The first path that must run, and when each layer becomes mandatory | [Arrive journey](arrive-journey.md) |
| How is it cut into modules, and how are modules added, removed and connected? | [Module structure](module-structure.md) |
| Every domain, subdomain, platform module and channel, with status | [Domain index](domains/README.md) |
| How do I find the owner of a new capability, and when is something a new subdomain? | [Domain design method](domain-design-method.md) |
| Who may do what: accounts, bonds, capacities, Cedar, delegation, devices, minors | [Authority model](authority-model.md) |
| Privacy defaults, sharing, audit, soft deletion, retention, export | [Data governance and records](data-governance-and-records.md) |
| Threats, controls, and AI and agent security | [Security and AI threat model](security-and-ai-threat-model.md) |
| What agents need underneath, and what to build when | [Agent infrastructure layer](agent-infrastructure-layer.md) |
| How any channel or agent connects: MCP, WebMCP, WhatsApp, Telegram and others | [Channel admission model](channel-admission-model.md) |
| The gates to a secure, production-grade v1 | [Road to v1](road-to-v1.md) |
| Updating dependencies: what is held back and why | [Dependencies](dependencies.md) |
| How to design an API call, and what not to do | [API design first principles](../../apps/sanctuary-api/docs/architecture/api-design-first-principles.md) |
| Offline writes, replay, conflicts and sync | [Local-first writes and sync](../../apps/sanctuary-api/docs/architecture/api-foundations/local-first-writes-and-sync.md) |
| Load shape, scaling, deployment and production readiness | [Scale and production operation](../../apps/sanctuary-api/docs/architecture/api-foundations/scale-and-production-operation.md) |
| Export formats and education standards | [Data portability and education standards](../../apps/sanctuary-api/docs/architecture/api-foundations/data-portability-and-education-standards.md) |
| The API cutover policy and channels | [API domain and channel model](../../apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md) |
| The order the horizontal layers are built in, and their status | [API engineering playbook](../../apps/sanctuary-api/docs/architecture/api-engineering-playbook.md) |
| Earlier domain evidence (Oct 2026) | [Platform domain reality map](2026-10-23-platform-domain-reality-and-human-first-sanctuary-map.md), [D1A domain ledger](2026-10-24-d1a-platform-domain-api-ledger.md) |
