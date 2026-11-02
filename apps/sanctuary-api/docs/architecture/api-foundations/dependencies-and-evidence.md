---
title: "API Dependencies, Industry Examples and Evidence"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Codex"
tags: [dependencies, api, benchmarks, lms, erp, research]
---

# API Dependencies, Industry Examples and Evidence

Owns technology comparisons and measurement limits. This is a dated research
snapshot, not an installation plan or a ranking of frameworks. Read
[What](../api-landscape.md), [channels](channels-and-agents.md) and
[How](../api-engineering-playbook.md) for the surrounding decisions.

## Dependency choices by responsibility

| Responsibility | Existing direction or researched examples | Selection test |
| --- | --- | --- |
| HTTP host | Hono in the foundation; [Fastify](https://fastify.dev/) and [NestJS](https://docs.nestjs.com/) are alternative framework choices | Hosting model, middleware, testability and operational needs; no second host without a requirement |
| First-party contract/client | [Native oRPC](https://orpc.dev/docs/contract-first) | One source of input/output/error contracts and typed implementation/client agreement |
| Validation | [Zod](https://zod.dev/) already selected | Runtime boundaries and canonical DTOs; not a substitute for policy |
| Data access | Existing `@repo/database` and schema packages | Actual transaction, query and model authority rather than a new generic repository layer |
| Policy | Existing Cedar/relationship facts | Verified identity and trustworthy resource facts, with denial tests |
| Application effect composition | Existing Effect declarations | Explicit failures, dependencies and cancellation where useful; not mandatory wrapping of every function |
| UI query/cache | Existing TanStack Query | Query ownership, cache invalidation and account/tenant isolation |
| Local-first state | Existing platform-specific offline mechanisms | Queued intent, conflict/recovery and server reauthorization; no native package leakage into web |
| Agent/UI integration | Existing TanStack AI; optional protocol adapters | Named missing capability, provider portability and interoperability; not accumulation of harnesses |
| Durable workflow | [Temporal](https://docs.temporal.io/) or [Inngest](https://www.inngest.com/docs) are candidates | Recovery across restarts, explicit effects, concurrency and operating cost |
| Job queue | [BullMQ](https://docs.bullmq.io/) is an example | Queue backend, duplicate behavior, retry ownership and worker operations |
| Telemetry | [OpenTelemetry](https://opentelemetry.io/docs/), structured logging and appropriate backends | Correlation, cost, redaction and actionable failures |
| Verification | Existing Vitest plus suitable real-boundary harnesses; [k6](https://grafana.com/docs/k6/latest/testing-guides/test-types/) is a load-testing example | Evidence scope and reproducibility, not the tool's name |

Examples are not claims about market share. Durable workflows, queues and a
transactional outbox are related mechanisms, not interchangeable products.
Do not add Temporal, Inngest, BullMQ and LangGraph simply because each has retries.
Identify the state/effect owner and the missing behavior first.

## Version grounding snapshot: 2026-10-30

| Component | Repository observation | Upstream observation | Meaning |
| --- | --- | --- | --- |
| oRPC | API/core client, contract and server declare beta.46 | beta.47 published October 27 | Review the complete package cohort before any upgrade |
| Hono | API declares 5.0.0-rc.1; core still declares a v4 range | v5 next remains rc.1; stable v4 continues | A remaining declaration needs caller analysis; v4 is not inherently deprecated |
| Zod | 4.6.7 | latest observed 4.6.7 | No upgrade implied |
| ZenStack ORM | 3.9.8 in data/schema packages | latest observed 3.10.0 | Review schema/generated-client/driver cohort |
| Effect | Core declares ^4.0.5 | latest observed 4.1.0 | A declaration is not proof of the actually resolved version |
| MCP SDK | Platform MCP declares ^2.3.1 | server latest observed 2.4.0 | Separate developer gateway from any future user MCP adapter |

Sources: [oRPC beta.47 release](https://github.com/middleapi/orpc/releases/tag/v2.0.0-beta.47),
[Hono releases](https://github.com/honojs/hono/releases),
[Zod registry](https://registry.npmjs.org/zod/latest),
[ZenStack registry](https://registry.npmjs.org/@zenstackhq/orm/latest),
[Effect registry](https://registry.npmjs.org/effect/latest),
[MCP registry](https://registry.npmjs.org/@modelcontextprotocol/server/latest).
Live registry links may report newer values after this snapshot. Before acting,
compare manifest, lockfile, installed package exports/declarations, release notes,
peer requirements and exact selected-version source.

Beta.47 changes Effect schema extension naming and OpenAPI options, updates the
standard-server transport cohort, and changes content-type/stream handling.
These are upgrade investigation topics, not proof of compatibility. No upgrade
or new package is authorized or performed by these documents.

## What established products publicly expose

| Product | Documented public interface | Lesson, not a prescription |
| --- | --- | --- |
| [Canvas LMS](https://canvas.instructure.com/doc/api/) | REST API and extensions, OAuth2, pagination/throttling and a GraphQL surface | Mature products document access and operational semantics as well as routes |
| [Moodle External Services](https://moodledev.io/docs/5.0/apis/subsystems/external) | External-function/service framework with declarations and security boundaries | A service is more than an endpoint-shaped database table |
| [Open edX](https://docs.openedx.org/projects/edx-platform/en/latest/concepts/rest_apis.html) | REST with personal and machine-to-machine access distinctions | Caller identity and granted permissions remain material even for automation |
| [Odoo 19](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html) | Documented JSON-2 model/method HTTP API | RPC-style operations also exist in ERP; this is a versioned example, not an assertion about all Odoo releases |
| [Dynamics 365 Finance & Operations](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/odata) | OData V4 over selected public data entities | External data integration has explicit contracts and selection boundaries |
| [OpenAI public API](https://developers.openai.com/api/reference/overview) | HTTP APIs, [SSE streaming](https://developers.openai.com/api/docs/guides/streaming-responses) and [webhooks](https://developers.openai.com/api/docs/guides/webhooks) | Different interaction needs can justify different adapters |
| [Gemini public API](https://ai.google.dev/api) | Unary/streaming APIs and stateful WebSocket Live API | Request/response, server streaming and live sessions solve different needs |

These are public product interfaces. They do not reveal the private implementation
stack of ChatGPT, Google or every deployment of an LMS/ERP. No source establishes
that these products use our libraries. Some documentation URLs are version-pinned;
older Moodle wiki pages explicitly redirect to the developer site and should not
be treated as current. Odoo/Meta pages intermittently failed retrieval during this
review; check the selected release's primary source again before implementation.

Inference for Gurudevi: retain one internal capability authority while adding
explicit external interoperability adapters only for approved needs. Public REST,
OpenAPI or OData support elsewhere does not justify resurrecting our retired
parallel first-party transport.

## LMS standards are another layer

| Standard family | Problem it addresses | Decision needed |
| --- | --- | --- |
| LTI / LTI Advantage | Learning-tool launches and associated services | Do we integrate into another LMS, host external tools, or neither? |
| OneRoster | Exchange of roster/course/grade information | Which institutions and external systems require exchange? |
| QTI / Common Cartridge | Assessment/content interchange | Which import/export formats must be supported? |
| Caliper | Structured learning-activity exchange | Approved purpose, minimization and retention |
| SCORM, xAPI, cmi5 | Learning-content/runtime/experience interoperability | Actual content/customer requirements and conformance scope |

See [1EdTech's specifications](https://www.1edtech.org/specifications) and
[ADL's reference projects](https://adlnet.github.io/). These standards are not
replacement HTTP frameworks or automatic authorization models. They are not
implemented by this research, and no certification is claimed.

## Adoption numbers: useful with a denominator

The **2025 Postman State of the API** report surveyed over **5,700** developers,
architects and executives. It reports REST use at **93%**, webhooks **50%**,
WebSockets **35%**, GraphQL **33%**, and contract testing **17%**.
[Official report](https://www.postman.com/state-of-api/2025/)

These are reported respondent practices; categories overlap and percentages are
not exclusive market shares. This is a vendor survey, not a representative census
of all APIs or evidence that a style causes correctness/performance. Do not label
it a 2026 result. A newer published report was not verified in this review.
If future comparisons add download or star counts, identify their limitations:
downloads can include CI, mirrors and repeat installs; stars indicate interest,
not deployed usage, safety or suitability.

## Benchmarks: what a number must identify

TechEmpower measured specific framework/workload/environment combinations.
Its repository was archived and the project sunset on **March 24, 2026**.
Historical charts remain useful for their recorded setups, not as a current
ranking of complete educational APIs.
[Repository](https://github.com/TechEmpower/FrameworkBenchmarks),
[maintainer notice](https://github.com/TechEmpower/FrameworkBenchmarks/issues/10932).

For a meaningful Gurudevi measurement, record runtime/package versions, hardware,
payload, validation, identity/policy path, database and indexes, concurrency,
dataset, cache state, warm-up, duration and all substitutions. Report throughput
with latency distributions, error rates, resource use and correctness. An empty
JSON route cannot predict an authorized transactional attendance workload.

Separate host overhead, policy evaluation, database contention, end-to-end command
latency, reconnect/retry behavior and agent task quality/cost. Include denial,
overload and ambiguous-outcome scenarios. Set budgets from real needs and measured
constraints; no request-per-second or uptime target is invented here.

Each published benchmark/result needs a revision, environment, workload, command,
result, substitutions and limitations. The repository's G0–G5/R1 evidence policy
still applies; a unit fixture or external marketing chart cannot be promoted to
production proof.
