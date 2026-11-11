---
title: "Domain Index"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [architecture, domains, subdomains, index, reference]
---

# Domain Index

Every domain and subdomain in Gurudevi, with the state of its card and module. This is
the list the module skeleton is built from (see [module structure](../module-structure.md)).
How to write a card is in the [domain design method](../domain-design-method.md). The
subdomains are a first draft from the [platform map](../platform-map.md); the owner
confirms or changes them before cards are written.

Status words: **skeleton** (framed in the module catalog with a default-deny Cedar
namespace, no card yet), **card** (card written, decisions open), **admitted** (card
approved, layers ready, contract and policy exist), **retired**.

The catalog that frames every module is `apps/sanctuary-api/src/modules/catalog.ts`.
Its fitness test fails if this index and the catalog disagree, if the router exposes a
namespace that isn't admitted, or if a domain lacks its Cedar namespace in
`packages/policies/src/modules/`.

## Business domains

| Domain | Namespace | Subdomain | Namespace | Status |
| --- | --- | --- | --- | --- |
| Wellbeing | `wellbeing` | Mood and energy | `wellbeing.mood` | skeleton |
| | | Journals and thought records | `wellbeing.journal` | skeleton |
| | | Reflection | `wellbeing.reflection` | skeleton |
| | | Practice and goals | `wellbeing.practice` | skeleton |
| Learning | `learning` | Classrooms | `learning.classrooms` | skeleton |
| | | Teaching relations | `learning.relations` | card ([draft](learning/relations.md)) |
| | | Lessons and materials | `learning.lessons` | skeleton |
| | | Assignments and submissions | `learning.assignments` | skeleton |
| | | Assessments and quizzes | `learning.assessments` | skeleton |
| | | Grading | `learning.grading` | skeleton |
| | | Classroom notes | `learning.notes` | skeleton |
| Institution operations | `ops` | Schools and academic structure | `ops.institutions` | skeleton |
| | | Enrolment | `ops.enrolment` | skeleton |
| | | Timetables | `ops.timetables` | skeleton |
| | | Attendance | `ops.attendance` | skeleton (owner to confirm: Learning or Ops) |
| | | Staff and workforce | `ops.staff` | skeleton |
| | | Welfare | `ops.welfare` | skeleton |
| | | Inventory | `ops.inventory` | skeleton |
| | | Events and forms | `ops.events` | skeleton |
| | | Fees and accounting | `ops.finance` | skeleton |
| | | Tutoring institutes | `ops.tutoring` | skeleton |
| Family and guardianship | `family` | Guardian verification | `family.verification` | skeleton |
| | | Guardian access | `family.access` | skeleton |
| Community and messaging | `community` | Groups | `community.groups` | skeleton |
| | | Posts and reactions | `community.posts` | skeleton |
| | | Conversations | `community.conversations` | skeleton |
| | | Notices | `community.notices` | skeleton |
| | | Moderation and safety | `community.moderation` | skeleton |
| Library and commons | `library` | Resources | `library.resources` | skeleton |
| | | Collections | `library.collections` | skeleton |
| | | Authoring and review | `library.editorial` | skeleton |
| | | Media | `library.media` | skeleton |
| | | Public commons | `library.commons` | skeleton |
| Journey and profile | `journey` | Profile | `journey.profile` | skeleton |
| | | Life record | `journey.record` | skeleton |
| | | Achievements and milestones | `journey.achievements` | skeleton |
| | | Careers and portfolio | `journey.portfolio` | skeleton |
| | | Transitions | `journey.transitions` | skeleton |
| Rewards | `rewards` | Ledger | `rewards.ledger` | skeleton (owner to confirm: own domain or part of Journey) |
| AI and agents | `agents` | Assistance | `agents.assist` | skeleton |
| | | Agent runs and proposals | `agents.runs` | skeleton |
| | | Delegation grants | `agents.delegation` | skeleton |
| | | Agent memory | `agents.memory` | skeleton |

## Platform modules

| Module | Namespace | Status |
| --- | --- | --- |
| Identity and accounts | `identity` | admitted (`session`, `scopes`) |
| Bonds and authority | `authority` | admitted (`refreshSnapshot`; boundary in `security.ts`; domain namespaces permit nothing yet) |
| Durable operations | `operations` | skeleton (store and dispatcher implemented internally) |
| Request budgets | `budgets` | skeleton |
| Devices and trust | `devices` | skeleton |
| Consent, privacy and minors | `consent` | skeleton |
| Audit | `audit` | skeleton |
| Records lifecycle | `records` | skeleton |
| Notifications and delivery | `notify` | skeleton |
| Files and media | `files` | skeleton |
| Search | `search` | skeleton |
| Time and calendar | `calendar` | skeleton |
| Entitlements and billing | `entitlements` | skeleton |
| Integrations | `integrations` | skeleton |
| Exports | `exports` | skeleton |

## Channels

| Channel | Status |
| --- | --- |
| App (oRPC `/api/v1` for mobile and web) | admitted |
| Workers and schedules | skeleton |
| Messaging bots (WhatsApp and others) | skeleton |
| User MCP and external agents | skeleton |
| Partner standards (OneRoster, LTI …) | skeleton |
| Support and operators | skeleton |

How a channel is admitted, and the full list with WebMCP and others:
[channel admission model](../channel-admission-model.md).

## <a id="open-decisions"></a>Open decisions

- Attendance: owned by Learning or Institution operations.
- Rewards: its own domain or part of Journey.
- ~~Citizenship classes and names~~: decided. Citizenship is part of each bond
  (`FIRST_CLASS`, `SECOND_CLASS`, `THIRD_CLASS`); see the
  [authority model](../authority-model.md#citizenship-is-part-of-every-bond).
- The capacity list, as a decision record.
- One Postgres schema per domain or prefixed tables (see [module structure](../module-structure.md#decisions-for-the-owner)).
- Which vertical slice proves the frame first.
