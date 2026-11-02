---
title: "Module Structure"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [architecture, modules, modular-monolith, walking-skeleton, domains, platform, channels, reference]
---

# Module Structure

How Gurudevi is cut into modules, what every module looks like from outside, and how
modules are added, removed and connected. The idea: **build the frame of every module
first, with fixed public surfaces and thin or empty insides, then fill the insides one
at a time.** The frame decides where things go and how they talk. The insides can be
rewritten without touching anyone else.

The structure it implements is the [platform map](platform-map.md).

## The words for this

What you described intuitively has established names. Using them makes it easy to
explain to people and agents.

| Your idea | Industry term | Meaning |
| --- | --- | --- |
| One app made of separate blocks you can add or remove | **Modular monolith** | One deployable, many modules with hard boundaries. Modules can be split out later if one really needs it |
| Each block owns its own meaning | **Bounded context** (Domain-Driven Design) | A boundary inside which words and rules have one meaning. Our subdomains |
| The picture of how blocks relate | **Context map** | Which context depends on which, and how (events, queries, translation) |
| Build the whole frame first, insides later | **Walking skeleton** | The thinnest end-to-end version that touches every part of the architecture and is deployable and testable. Then you add flesh |
| The outside stays fixed, the inside can change | **Information hiding** (Parnas, 1972); **deep modules** (Ousterhout) | A module hides its design decisions behind a small, stable interface |
| The horizontal base | **Platform layer**, **cross-cutting concerns** | What every module needs the same way: identity, authority, audit and so on |
| Building features on top | **Vertical slices** | One capability through all layers: contract, policy, logic, storage, tests |
| Blocks talk without knowing each other's insides | **Published interface**, **domain events** | Contracts for queries and commands; events after commit |
| Translating an outside system's model | **Anti-corruption layer** | An adapter that keeps another system's model out of ours (a WhatsApp or OneRoster adapter) |
| Automatic checks that the structure holds | **Architectural fitness functions** (Evolutionary Architecture) | Tests that fail when a boundary is crossed |
| Ready for change you can't predict | **Evolvability**, the **open–closed principle** | New modules are added without editing existing ones |
| Safety in every part | **Secure by design**, **zero trust**, **defence in depth**, **least privilege** | See [security and AI threat model](security-and-ai-threat-model.md) |

In one sentence: *Gurudevi is a modular monolith of bounded contexts on a shared
platform layer, built as a walking skeleton first and then filled with vertical slices,
with fitness functions guarding the boundaries.*

## Four kinds of module

| Kind | Examples | Owns | Lives in |
| --- | --- | --- | --- |
| Domain module (one per subdomain) | `learning.assignments`, `ops.attendance`, `wellbeing.journal` | Business facts and rules | `apps/sanctuary-api/src/modules/<domain>/<subdomain>/` |
| Platform module | `identity`, `authority`, `audit`, `records`, `consent`, `exports` | Platform facts, no business meaning | `apps/sanctuary-api/src/<service>/`, as the existing `security/` (identity and authority) and `operations/` already are |
| Channel adapter | `app` (oRPC for our clients), `bots/whatsapp`, `mcp`, `workers`, `partners/oneroster` | Nothing; translates and forwards | `apps/sanctuary-api/src/channels/<channel>/` |
| Place | Self, Workspace, Community, Library, Profile | UI state only | `apps/gurudevi-mobile`, `apps/gurudevi-web` |

## What every domain module exposes

A module is a box with exactly these openings. Everything else inside is private.

| Opening | Where | Purpose |
| --- | --- | --- |
| Manifest | `apps/sanctuary-api/src/modules/catalog.ts` (one entry per module) | Name, status (`skeleton`, `admitted`, `retired`), layers it needs, what it publishes and reads |
| Contract | `@repo/core/api/v1/<domain>/<subdomain>.ts` | Commands and queries, shared with clients |
| Policy | `packages/policies/src/<domain>/<subdomain>.cedar` plus its schema fragment | Who may do what, as Cedar, in the module's own namespace |
| Storage | One Postgres schema per domain, tables owned by one subdomain | Only this module reads or writes them |
| Events | Declared in the manifest, published through the platform outbox | How other modules learn what happened |
| Export | A function the exports service calls | The module's data in the agreed formats |
| Card | `docs/architecture/domains/<domain>/<subdomain>.md` | The decisions (see the [domain design method](domain-design-method.md)) |
| Tests | Next to the module | Scenario tests through the real host and database |

A manifest entry, as its card fills it in:

```ts
{
  name: 'learning.assignments',
  domain: 'learning',
  status: 'skeleton',
  needs: ['identity', 'authority', 'operations', 'budgets', 'audit', 'records', 'consent'],
  publishes: ['learning.assignment.submitted'],
  reads: ['learning.classrooms'],
}
```

All manifests live in one catalog while modules are skeletons. Module folders under
`modules/<domain>/<subdomain>/` are created when a module gets its first code.

## How modules connect

- The **router is assembled from manifests**. Registering a module adds its namespace;
  removing it removes the namespace. Nothing else needs editing.
- **Commands change only their own module's tables.** Effects on another module happen
  through events.
- **Queries may read other modules only through their published queries**, never their
  tables.
- **Platform modules are called through their own interfaces** (`authority.decide`,
  `audit.record`, `records.softDelete`), never by touching their tables.
- **Channels never contain business rules.** A WhatsApp message becomes a call to a
  module's command, with the same authority checks as the app.

## Cedar as modules too

Today `packages/policies` is organised by role (`school/teacher.cedar`,
`school/principal.cedar`) over one flat schema with about 60 entity types and generic
actions (`read`, `create`). The principal carries one `capacity` and one `school_id`,
which can't represent a person with several bonds. The target:

- One Cedar **namespace per domain** (`Learning`, `Ops`, `Wellbeing` …). A policy file
  per subdomain, a schema fragment per subdomain, assembled at build time.
- **Actions named after capabilities** (`Learning::Action::"submit"`), not
  `read`/`create`.
- **Bonds as entities.** The principal is the account; the active bond (with its
  capacity and entity) comes in as an entity or context. Roles stop being files and
  become conditions on bonds.
- **Default deny.** No module is reachable until its policy file permits something.
- Policy tests per module, run in CI.

The existing role files are evidence of intended rules. They are translated into the
new modules, not deleted unread.

## Building it: skeleton first

1. **Frame the platform modules** that layers 0–7 need (see the
   [playbook's layer table](../../apps/sanctuary-api/docs/architecture/api-engineering-playbook.md#horizontal-layers-the-base-every-domain-stands-on)),
   with real implementations where they already exist (identity, operations) and
   honest stubs that deny everything where they don't.
2. **Frame every domain module** from the [domain index](domains/README.md) as a
   skeleton: manifest, empty contract namespace, default-deny Cedar namespace, empty
   storage schema, card stub. Status `skeleton`; nothing is callable.
3. **Frame the channels**: the app channel (oRPC) is real; bots, MCP, workers and
   partners exist as named, disabled adapters.
4. **Add fitness functions** so the frame can't erode: module internals can't be imported
   from outside, commands can't write another module's tables, every namespace has a
   manifest and a card, and no module is `admitted` without its card and policy tests.
   Extend `pnpm audit:api-composition` rather than adding a parallel checker.
5. **Fill one vertical slice** end to end through every layer, to prove the frame.
6. Then fill the rest, in the order the owner chooses.

### Skeleton status (2026-11-02)

| Step | Done | Not yet |
| --- | --- | --- |
| Platform frame | All 15 platform modules named in the catalog with their layer; `identity` admitted | Deny-by-default stubs for authority, audit, records and consent, which are real work in layers 2–7 |
| Domain frame | All 9 domains and 42 subdomains in the catalog as `skeleton`; one default-deny Cedar namespace per domain in `packages/policies/src/modules/` | Postgres schemas per domain (created with each domain's first migration); cards |
| Channels | `app` admitted; `workers`, `bots`, `mcp`, `partners`, `operators` named as skeletons | Adapters |
| Fitness | `catalog.test.ts`: unique names, router exposes only admitted namespaces, the domain index matches the catalog, every domain has a Cedar namespace, admitted modules have cards. `domain-namespaces.test.ts`: fragments parse, assemble and deny by default. The composition audit admits `modules/catalog.ts` | Import-boundary checks for module internals and cross-module table writes (added when the first module folder exists) |

## Decisions for the owner

- One Postgres schema per domain (`learning`, `ops`, …) or prefixed tables in `public`.
  Recommendation: schema per domain, so ownership is visible in the database and
  enforceable with grants.
- Whether domain logic for clients (local-first rules on the phone) lives next to the
  module's contract in `@repo/core`, or in the existing feature packages
  (`@repo/classroom`, `@repo/self`), which then become client halves of their modules.
- Which vertical slice proves the frame first.
