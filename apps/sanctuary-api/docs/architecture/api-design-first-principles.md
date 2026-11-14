---
title: "API Design First Principles"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [api, first-principles, patterns, anti-patterns, learning, reference]
---

# API Design First Principles

A teaching guide: what an API is for, the few ideas that make one last, how they look
in our stack (oRPC v2 on Hono v5, Node 24, Cedar, Zod 4), and what not to do. Read it
before writing a procedure. The structure the API serves is in the
[platform map](../../../../docs/architecture/platform-map.md); how to find a
capability's owner is in the
[domain design method](../../../../docs/architecture/domain-design-method.md).

## 1. What the API is

The API is the only door to facts that the server owns. It is a **contract** between
an owner (a subdomain) and its callers (apps, bots, agents, workers, partners). A good
contract lets both sides change their insides without breaking each other.

Three consequences:

- Callers depend on the contract, never on tables or internal functions.
- Everything that matters for safety happens behind the door: authority, validation,
  invariants, audit. A check that only happens in the app is not a check.
- The contract outlives the code. Designing it carefully is cheaper than changing it.

## 2. The principles

### 2.1 Contract first

Write the input, output and error shapes before the implementation. In our stack the
contract lives in `@repo/core/api/v1/contract.ts` (Zod schemas under `oc`), and the
server implements it with `implement(appContract)`. Clients get types from the same
contract, so they can't drift.

### 2.2 Commands, queries and events are different things

| | Command | Query | Event |
| --- | --- | --- | --- |
| Changes facts | Yes | Never | Reports a change |
| Retried safely | Only with idempotency | Always | Consumers must handle duplicates |
| Audited | Always | Sensitive classes only | Published after commit |
| Named | Verb on facts: `submit`, `record`, `correct` | `get`, `list`, `search` | Past tense: `submitted` |

Never combine them: a query that "also marks as read" is a command in disguise.

### 2.3 One owner per fact

Every procedure belongs to the subdomain that owns its facts. See the
[domain design method](../../../../docs/architecture/domain-design-method.md).

### 2.4 Authority on every call

Every call goes through the same order: verified identity → active bond and capacity →
device trust and delegation → Cedar decision → data scoped to what was allowed. The
client never sends "I am a teacher"; the server works it out from bonds. Denial is a
normal, typed outcome.

### 2.5 Commands are idempotent

Phones are offline, and the network drops. A command may arrive twice, late, or after
the caller has given up. Every command carries an idempotency key. The server records
the first outcome and returns the same result for the same key and payload; the same
key with a different payload is a conflict. This is what makes local-first writes safe.
The operation store in `apps/sanctuary-api/src/operations` implements it.

### 2.6 Errors are part of the contract

Errors are named, typed and documented, like outputs: `UNAUTHORIZED`, `FORBIDDEN`,
`NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `SERVICE_UNAVAILABLE`, plus domain errors
that carry meaning (`ASSIGNMENT_CLOSED`). Messages are safe to show and never contain
internals. An unknown outcome (the server may or may not have committed) is its own
state that the client handles by asking again with the same key.

### 2.7 Everything is bounded

Every list is paginated with a maximum page size. Every call has a timeout and honours
cancellation (`AbortSignal`). Every caller has a budget. Nothing returns "all rows".

### 2.8 Change by adding

Add new optional fields and new procedures. Never change the meaning of a field, never
remove one that callers use, never reuse a name for something else. When a shape must
change, add a new procedure and retire the old one deliberately. `/api/v1` is the
product's API generation; it is not bumped for ordinary changes.

### 2.9 Time is explicit

The server's commit time is the authority for ordering. Offline writes also carry the
time the person acted on the device, which is recorded but never trusted for authority.
Dates that mean something in a school (term, academic year) are stored as such, not
derived later.

### 2.10 Observable by design

Every request and operation has an identifier that flows to logs, traces and the audit.
Telemetry is sampled and redacted; audit is complete. They are different systems.

## 3. How it looks in our stack

```ts
// @repo/core/api/v1/contract.ts: the contract
export const appContract = {
  learning: {
    assignments: {
      submit: foundation
        .input(z.strictObject({ assignmentId: z.uuid(), body: submissionBody }))
        .output(z.strictObject({ submissionId: z.uuid(), submittedAt: z.number().int() }))
        .errors({ ASSIGNMENT_CLOSED: {}, CONFLICT: {} }),
    },
  },
} satisfies RouterContract;

// apps/sanctuary-api: the implementation is a plain function, not a class
submit: api.learning.assignments.submit.handler(async ({ input, context, signal }) =>
  submitAssignment(context.platform, context.identity, input, signal)),
```

- Modules export plain functions and types. State lives in the database or in a value
  passed in (the `platform` object), not in module-level singletons.
- Dependencies are passed as arguments. There is no dependency injection container.
- Middleware handles cross-cutting concerns once: identity, budgets, operation
  recording.
- Zod schemas are the boundary. Inside, use the inferred types; don't re-validate.

## 4. Do and don't

| Don't | Do instead | Why |
| --- | --- | --- |
| One procedure per screen (`getPrincipalDashboard`) | Capabilities on the owner; screens compose them | Screens change weekly; owners don't |
| `UserManager`, `GradeService`, `AttendanceRepository` classes | Plain exported functions grouped by subdomain module | TypeScript modules are already the unit of organisation; classes add ceremony without state |
| `IGradeRepository` interfaces with one implementation | Use the function's type; add an interface only when there are real alternatives | An interface with one implementation is a dead abstraction |
| DTO, entity and mapper layers mirroring each other | One Zod schema at the boundary, inferred types inside | Three copies of one shape drift apart |
| A DI container or a factory that builds singletons | Pass dependencies as arguments; build them once at startup | Explicit, testable, no hidden global state |
| Exceptions for expected outcomes | Typed errors in the contract | Callers can handle what they can see |
| A generic `update(id, partial)` command | Named commands for each allowed change (`correctGrade`, `renameClassroom`) | Each change has its own rules, authority and audit |
| Boolean flags that change behaviour (`submit({ force: true })`) | Separate, named commands | Flags hide decisions that need their own authority |
| Returning database rows | Return the contract's shape | Tables are an inside; the contract is the outside |
| Checking roles in UI code only | Cedar on the server; the UI only hides | The UI can be bypassed |
| Retrying a command without an idempotency key | Always send a key | Retries otherwise double-submit |
| Unbounded lists, N+1 queries per item | Pagination, batched reads | Morning bursts find every unbounded query |
| `v2` copies of a procedure next to the old one, forever | Add, migrate callers, retire the old one with a date | Parallel versions are where drift starts |
| `any`, `as unknown as X` | Model the type honestly | Casts hide contract bugs until runtime |

## 5. Pitfalls and lessons from teams that ran APIs for years

- **Every behaviour callers can observe becomes part of the contract**, documented or
  not ([Hyrum's law](https://www.hyrumslaw.com/)). Keep outputs minimal; don't leak
  order, timing or extra fields you don't intend to keep.
- **Idempotency keys are how payment APIs survive bad networks**
  ([Stripe](https://docs.stripe.com/api/idempotent_requests)). A school on mobile data
  at 7:45 is the same problem.
- **Resource-oriented naming and standard methods age well**
  ([Google AIP](https://google.aip.dev/)). Our names follow owner, then subdomain, then
  verb.
- **Published guidelines exist; borrow them before inventing**
  ([Microsoft REST guidelines](https://github.com/microsoft/api-guidelines),
  [Zalando RESTful guidelines](https://opensource.zalando.com/restful-api-guidelines/)).
  They are written for HTTP+JSON. Take the ideas (naming, pagination, errors,
  compatibility) even though our first-party transport is oRPC.
- **Make wrong states impossible to represent.** A strict object schema that can't hold
  a half-filled submission beats a runtime check.
- **The hardest bugs are uncertain outcomes**: a timeout after the server committed.
  Design for "ask again with the same key" from the start.
- **Authorization added later is never complete.** That is why authority is a
  horizontal layer, built before domains.
- **Versioning is a last resort.** Teams that version often end up running every
  version forever.

## 6. What went wrong here, so it isn't repeated

- Features got their own contracts with no owner (71 contract files in
  `packages/core/src/api`), so nobody could say who owned a fact.
- Java and C#-style layers (managers, factories, repositories, `I`-prefixed
  interfaces) were added around TypeScript modules that didn't need them.
- On 1 Nov 2026 an autonomous agent "retired legacy callers" by deleting whole product
  screens, because the domains had no v1 procedures yet. Retiring a transport isn't the
  same as retiring a feature. Removals of product need the owner's yes.
- Retention and audit were left for "each capability later", which means never.
  They're now horizontal layers.
