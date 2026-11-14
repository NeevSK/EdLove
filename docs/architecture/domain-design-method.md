---
title: "Domain Design Method"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [architecture, domains, api, ownership, reference]
---

# Domain Design Method

How Gurudevi decides what a domain, subdomain and capability is, who owns it, and when
something new deserves its own place. This exists because the earlier API grew one
contract per feature (71 of them) with no owner, and every agent added more. Follow it
before adding any API procedure, package or table.

The structure it fills is in the [platform map](platform-map.md).

## Words

| Word | Meaning | Example |
| --- | --- | --- |
| Domain | A large area of business meaning | Learning |
| Subdomain | A coherent set of facts with one owner, one lifecycle and one set of rules | Assignments and submissions |
| Capability | One command or query on a subdomain's facts | Submit an assignment |
| Command | Changes facts. Has an outcome, may be retried, is audited | `learning.assignments.submit` |
| Query | Reads facts. Changes nothing | `learning.assignments.listForClassroom` |
| Event | A fact that something happened, published by the owner after it commits | `learning.assignment.submitted` |
| Journey | A sequence of capabilities a person goes through, possibly across subdomains | Teacher sets work, students submit, teacher grades |
| Place | Where a person goes in the app. Composes; owns nothing | Workspace tab |

## The shape of the API follows ownership

```text
/api/v1  →  <domain>.<subdomain>.<capability>
            learning.assignments.submit
            ops.attendance.record
            wellbeing.journal.write
```

- One namespace per subdomain, admitted through a card (below).
- One procedure per capability. Its name is a verb on the subdomain's facts, not a
  screen name.
- Platform services have their own namespaces (`identity`, `authority`, `consent`,
  `audit`, `files`, `exports` and so on) and own no business meaning.
- Feature count never sets namespace count. Ten screens on assignments still mean one
  `learning.assignments` namespace.

## Is this a new subdomain?

Ask these in order. If every answer is no, it is a capability in an existing subdomain.

1. Does it own facts that no existing subdomain owns?
2. Do those facts have their own lifecycle (created, changed, corrected, ended,
   archived) that differs from its neighbours'?
3. Does it have invariants that must hold inside one transaction and that nobody else
   enforces?
4. Does a different authority decide who may change it?
5. Does it have a different retention or privacy class?

A new screen, a new role, a new bot intent, a new agent tool or a new report is never by
itself a reason for a new subdomain.

## The subdomain card

Write one before the first procedure exists. Keep it short; it is a decision record,
not an essay. Cards live in `docs/architecture/domains/<domain>/<subdomain>.md`, one
file each.

```markdown
---
title: "Learning · Assignments and submissions"
status: draft | admitted | retired
owner: <person who decides its rules>
---

## Facts it owns
## Invariants (what must always be true)
## Lifecycle of each fact (states and who may move between them)
## Authority (which capacities, through which bonds, may do what)
## Privacy and visibility class (see data governance)
## Mutation kind per fact: editable | versioned | corrected | append-only
## Retention class and horizon
## Commands
## Queries
## Events it publishes
## What it reads from other subdomains (queries or events only)
## Standards it maps to (OneRoster, QTI, CLR …), if any
## Open questions
```

The seven admission questions in the
[API domain and channel model](../../apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md#ownership-discovery-and-admission)
must each be answered on the card, with links.

## How subdomains work together

- **One transaction, one subdomain.** A command changes only its own subdomain's
  tables. If two subdomains must both change, the first commits and publishes an event;
  the second reacts. The durable operation and outbox layer makes this reliable.
- **Reading across is allowed; writing across is not.** A query may combine facts from
  several owners for a screen (a read projection). It never becomes a back door for
  changing them.
- **No shared tables.** If two subdomains want to write the same table, ownership is
  wrong. Fix the card, not the code.
- **References, not copies.** Hold another owner's identifier; ask the owner for the
  current fact. Copy only for an explicit reason (a snapshot on a report card), and
  record that it is a snapshot.

## Places and journeys don't own

The Workspace tab, a principal's dashboard, an onboarding flow or a bot conversation
compose capabilities. They may hold UI state. They never hold business facts, and their
code never decides authority.

## Order of work

1. Draft the domain's subdomain list on the platform map.
2. Write cards for the subdomains you need first. Settle the open questions with the
   owner.
3. Admit a card (status `admitted`) only when the horizontal layers it depends on are
   ready. Most depend on authority, durable operations, audit and records lifecycle.
4. Add the contract in `@repo/core/api/v1`, then the implementation, then the scenario
   tests through the real host and database.
5. Only then build the screens.

## Signs it is going wrong

- A procedure is named after a screen (`getDashboardData`, `principalHomeView`).
- Two procedures in different namespaces write the same table.
- A namespace has one procedure that forwards to another.
- A command takes a free-form `update` object that can change anything.
- A domain checks roles with `if (user.role === 'teacher')` instead of asking authority.
- Client code decides whether something is allowed and the server trusts it.
- The procedure count grows faster than the subdomain card count.
