---
title: "API Vocabulary and Historical Design Choices"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Codex"
tags: [api, learning, contracts, history, feeds]
---

# API Vocabulary and Historical Design Choices

Owns definitions and historical context. Return to [What](../api-landscape.md) or
continue to [channels and agents](channels-and-agents.md). Historical milestones
below are not claims that a technology was invented on its publication date.

## Terms we should use precisely

| Term | Meaning | Attendance example |
| --- | --- | --- |
| API | Defined interface offered by software | Request an attendance operation |
| Capability | Meaningful work under explicit authority and rules | Record a batch or correct an existing record |
| Contract | Inputs, outputs, errors and behavioral promises | Permitted statuses and retry semantics |
| Protocol | Rules for communication and interpretation | Native oRPC request/response wire format |
| Transport | Communication mechanism | HTTP connection or WebSocket |
| Endpoint/procedure | Addressable operation | A procedure under the chosen v1 router |
| DTO (Data Transfer Object) | Deliberate public data representation | Attendance result without internal metadata |
| Schema | Declared shape and constraints | Zod input schema or database model; identify which |
| Implementation | Code that fulfills the capability | Policy checks, transaction and result mapping |
| SDK | Library for using a protocol/service | Typed oRPC client or provider client |
| Framework/runtime | Machinery hosting application or agent execution | Hono host or agent harness |
| Domain module | Owner of consistent business rules and authoritative facts | Learning records and correction rules |
| Projection | Derived view for a purpose | A principal's attendance summary |
| PJC (Product and Journey Catalog) | Repository records linking intent, behavior, implementation and evidence | A teacher journey linked to its contract and scenarios |
| Cedar | Authorization policy language/engine used by the platform | Evaluate a teacher's permitted action over trustworthy facts |
| Scope / tenant | The relevant resource/relationship boundary / participating data-isolation context | A particular institution or classroom; not every action has the same scope |
| Delegation | Explicitly limited permission to act for another principal | An assistant may request one approved operation until expiry |
| Idempotency | Repetition of one logical operation does not add unintended effects | Retry a batch without creating duplicate changes |
| Receipt | Durable record of an operation's known state/outcome | Retrieve a prior result after a lost response |
| Outbox | Durable intent for later external work, coupled to a commit when needed | A permitted notification waits for dispatch |
| SSE (Server-Sent Events) | Server-to-client event stream over HTTP | Stream bounded progress updates |
| RPC (Remote Procedure Call) | Invoke an operation across a process/network boundary | Call an attendance capability remotely |
| JWT / OAuth / OIDC | Token format / delegated authorization framework / identity layer on OAuth | Relevant credential standards; none alone establishes classroom authority |

Navigation is another map: a principal sees school work through Workspace, but
that does not make Workspace the universal owner of financial, learning and
person-private facts. The [canonical model](../api-domain-and-channel-model.md)
governs those distinctions.

## Different schemas establish different facts

Zod validates runtime values at the API boundary. TypeScript checks developer
code before execution. Database models and constraints govern stored structure
and integrity. Cedar policies evaluate whether an action is permitted over
trusted facts. None alone establishes the others.

A valid UUID can identify an unauthorized classroom. A database row may contain
fields that must never be returned publicly. A well-typed handler can still apply
the wrong business rule. The contract must include behavioral promises, with
scenario tests for the relevant invariants.

## Historical approaches coexist

| Approach | Problem addressed | Continuing tradeoff |
| --- | --- | --- |
| Library/OS interfaces | Reuse through defined functions | Signature and behavior coupling |
| RPC | Invoke work across processes or machines | Remote calls introduce partial failure |
| SOAP/web services | Formal structured cross-system messaging | More envelope and tooling machinery |
| REST/HTTP | Resource representations using web architectural constraints | Resource design, caching and HTTP semantics need care |
| GraphQL | Client-selected shapes across related data | Authorization and query-cost control remain necessary |
| gRPC | Typed remote calls and streaming | Protocol/tooling and client support matter |
| TypeScript RPC | Shared contracts with convenient typed callers | Runtime validation and network failures still exist |
| Agent tool protocols | Discover and invoke structured capabilities | Model-generated requests need bounded authority |

The influential [Birrell/Nelson RPC paper](https://www.microsoft.com/en-us/research/publication/implementing-remote-procedure-calls/?lang=ko-kr)
was published in 1984. [SOAP 1.1](https://www.w3.org/TR/2000/NOTE-SOAP-20000508/)
and [Fielding's REST dissertation](https://ics.uci.edu/~fielding/pubs/dissertation/abstract.htm)
provide 2000 milestones. [GraphQL's original announcement](https://www.graphql.org/blog/2015-09-14-graphql/)
describes Facebook's 2012 use and 2015 public work;
[Google's gRPC introduction](https://developers.googleblog.com/en/introducing-grpc-a-new-open-source-http2-rpc-framework/)
was published in 2015. These approaches did not replace one another universally.
REST is not deprecated by our native oRPC choice. Our retired duplicate
implementations were a repository decision, not the retirement of a web standard.

## Queries, commands and events

A query asks for information; a command requests a change; an authoritative
event states that an outcome occurred. A client requesting attendance changes
does not get to manufacture an authoritative attendance-completed event.

Keep domain records, operation receipts, audit, product activity and operational
telemetry distinct. Their audiences, privacy, authority and retention differ.
An activity feed is a projection, not proof of a business transaction.

## HTTP, webhooks, SSE and WebSockets

| Mechanism | Usual interaction | Example use | Necessary extra work |
| --- | --- | --- | --- |
| HTTP request/response | Caller asks, server replies | Read or commit a capability | Identity, authorization, validation, failures |
| Webhook | Provider calls a receiver when something occurs | Message or payment notification | Provider verification, replay handling, durable ingress |
| SSE | Server streams events on an HTTP response | Progress or generated text | Framing, cancellation, disconnect/recovery |
| WebSocket | Ongoing bidirectional connection | Interactive real-time session | Authentication lifecycle, backpressure, reconnect |
| Polling | Caller asks repeatedly for changed state | Read an operation's current status | Budgets, interval, cache validators and authorization |

Neither the HTTP method nor an operation's name guarantees idempotency. A
timeout can happen after a commit. Retrying safely needs operation identity and
server behavior; see [AWS's idempotency guidance](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).
REST's stateless request constraint does not mean a system has no stored data.
CORS controls browser cross-origin access; it is not application authorization.

## What is an RSS feed?

RSS means **Really Simple Syndication**. RSS 2.0 is an XML publication format
containing channel metadata and items, commonly titles, links, descriptions,
identifiers and dates. A feed reader fetches it to discover updates; common
clients poll, while additional notification mechanisms can also exist.
[RSS specification](https://www.rssboard.org/rss-specification)

Examples are public articles, release announcements or a public resource shelf.
An RSS feed is not a chat channel, an agent protocol, a database change stream or
the same thing as a personalized social feed. A public-content RSS projection
could be useful for EdLove/Library, but it has not been approved or implemented.

Release feeds may support upstream research. Feed content is untrusted data,
not instructions to execute commands or automatically upgrade dependencies.
An importer needs bounded fetching/parsing, safe URL handling and deduplication.
Never publish private learner, wellbeing or institutional records in a public
feed by default.
