---
title: "API Runtime Foundation and Admission Checkpoints"
status: "active"
created: 2026-10-30
updated: 2026-10-31
author: "Naveen"
scribe: "Codex"
tags: [api, engineering, runtime, foundation, verification]
---

# API runtime foundation and admission checkpoints

The subsequent [authority and durability checkpoint](authority-and-durability.md)
now implements the required-mode identity, scoped Cedar/RLS, budget and durable
operation seams under isolated G2 scenarios. It provides the detailed implementation
status and limitations referenced below. Nothing here asserts
a deployment or business-feature completion.

The owner resumed horizontal engineering after the grounding round. Build and
verify these checkpoints before selecting business procedures. The two read-only
identity foundation procedures do not make this a production-ready application.

## Non-negotiable guarantees

| Checkpoint | Guarantee | Current implementation |
| --- | --- | --- |
| Native composition | One shared contract, SDK client and `/api/v1` handler; no legacy aliases or converter | Present; two identity foundation procedures, G0 source gate and G1 fixtures |
| Boundary budgets | Bounded payload, receive time, headers, procedure/stream cancellation and shutdown | Present for the Node HTTP/1 host; provisional configurable defaults, no capacity certification |
| Safe failures | Generic public failures; correlation and fixed diagnostic categories; failed streams terminate | Hono/oRPC host and Node response boundary exercised; no universal adapter-error claim |
| Lifecycle | Invalid startup fails; liveness differs from readiness; drain rejects new RPC and finishes or terminates existing work | Present; in-process host and real loopback socket scenarios |
| Identity and authority | Verified canonical account, scoped relationships and fail-closed Cedar decisions using authoritative facts | Integrated in required mode; isolated G2 with synthetic keys/minimal Auth schema; hosted ceremonies unverified |
| Persistence and concurrency | Explicit transaction, constraints, scoped data access, conflict and uncertain-commit handling | Transaction-local account/RLS access and authorized receipt transactions exercised; domain ORM admission remains separate |
| Distributed work controls | Shared quotas and operation identity bound to actor, capability and payload | PostgreSQL account budgets and scope/payload-bound receipts exercised across instances and concurrent requests |
| Durable effects | Transaction-bound outbox, bounded delivery/retry, reconciliation and revocation where required | Explicit fenced dispatcher/retry primitives exercised; no provider handler, automatic delivery or capability-specific reconciliation admitted |
| Operations in deployment | TLS/proxy trust, real readiness dependencies, deployment drain, observability retention and restore exercises | Repository configuration only; not deployed or verified here |

Identity, policy and database integration are engineering work before the business
round. Operation-specific payload rules, consequential approvals, retention and
delivery semantics require the later capability context. Do not create pretend
generic ports, in-memory receipts or unused stores to mark those checkpoints done.

The layered product diagram is compatible with this sequence. Web, mobile, bots
and agents are entry surfaces; protocol adapters invoke owned application
capabilities. Identity is verified at admission and resource/tenant permissions
are enforced at each capability. AI orchestration is another capability consumer,
not a privileged shortcut or a mandatory hop between every feature and storage.
LMS and ERP describe product breadth; smaller module ownership follows actual
business invariants. Shared infrastructure does not give every module unrestricted
access to every other's tables.

## Runtime and authority

Production configuration selects Node from `.nvmrc`, through `entry-node.ts` and
`node-server.ts`. The Dockerfile builds this same entry and Render probes
`/health/ready`. No deployment is performed by this repository edit. The Bun
descriptor remains available through `start:bun:local` for local experimentation; its lifecycle and server
limits are not equivalent evidence and it is not the configured container path.

The host never trusts incoming correlation IDs. It generates a new request ID;
responses include `X-Request-ID` and `Cache-Control: no-store`. Unexpected HTTP and
procedure failures log fixed categories without messages, stacks, credentials,
request URLs or bodies. `api.request.responded` measures time until response
creation (`headersDurationMs`), not stream completion or delivery. Node transport
failures have separate fixed categories. Startup logs expose only an allowlist
of OS error codes; unclassified failures stay generic.

Use oRPC's procedure callback `signal` for cancellation. `APIContext` deliberately
does not expose a second raw Fetch signal that misses the SDK timeout. The timeout
plugin requests cancellation; code must honor the signal. It cannot roll back a
commit, force CPU-bound code to yield, or prove an aborted operation did not run.
The transport receive timeout is a different budget from procedure execution.

The current browser-origin guard rejects foreign origins, including bare
`/api/v1`. It does not authenticate native clients or replace session/CSRF policy.
While draining, same-origin/native RPC receives native `SERVICE_UNAVAILABLE`
before procedure dispatch. `/health/live` stays available and `/health/ready`
returns 503. In required-authentication mode, readiness reports
`authenticated-foundation` and checks selected database, policy and key dependencies;
transport-only development/test mode reports `foundation-only` without those probes.
Neither scope establishes full product, hosted identity or deployment readiness.

## Unknown-length request admission

Hono 5.0.0-rc.1 buffers unknown-length request bodies before dispatch. The host
admits a bounded number per app instance and holds each permit through response
creation, rejecting excess with 503 without a server-side queue. The default is
8 (`API_MAX_UNKNOWN_LENGTH_REQUESTS`, range 1–1000); choose deployment values
from measured memory and concurrency, not the maximum permitted configuration.
Node's lazy incoming Request is normalized before Hono reconstructs it after
buffering; method, URL, headers, body stream and abort signal are preserved.

This bound does not limit known-length requests, total process memory, pre-auth
identity/database concurrency or response streams. It is not per-client fairness,
distributed rate limiting or edge protection. Slow senders may occupy all permits.
Node HTTP/1 loopback scenarios exercise saturation, disconnect recovery, 413 and
a valid chunked native request. Bun, proxy buffering and capacity are unverified.

## Authentication work admission

The Node app admits at most `API_MAX_AUTHENTICATION_REQUESTS` concurrent
credential-verification and account-budget operations per instance (default 8,
range 1–1000). Excess receives native `SERVICE_UNAVAILABLE` without an application
queue. A permit remains held until the actual asynchronous work settles, even if
the caller disconnects or its signal expires; PostgreSQL queries do not stop merely
because their caller aborts. Liveness remains available. Tune this limit alongside
the pool and deployment capacity using measured workloads.

A real Node socket and isolated PostgreSQL scenario holds the database pool,
disconnects a waiting client, checks saturation and subsequent recovery, and
exercises 401 and 429 release. Synthetic keys and a minimal Auth schema remain.
This is not per-client fairness, a distributed rate limit, an edge control or a
proof of hosted authentication and production capacity.

## Node response containment

Installed `@hono/node-server@2.1.5` can log an original response-stream exception,
append its message, or complete an empty response after a failed speculative read.
The public `errorHandler` option does not cover every response-conversion branch.
The narrow Node fetch boundary therefore validates response headers and forwards
bytes through a pull-driven stream. It sanitizes stream exceptions and terminates
the socket on source failure rather than reporting successful delivery.

HTTP/1 body responses use chunked framing and remove `Content-Length` to avoid
the adapter's speculative-read path. Payload bytes and SDK serialization are
preserved. This boundary is not a second business error taxonomy or policy layer.
Cancellation reaches the producer and backpressure is retained; no full-body
buffer is introduced. Re-audit this seam when upgrading the adapter or oRPC
standard-server cohort. HTTP/2, Bun, compression/proxy buffering and provider
streams require their own verification before admission.

## Configuration contract

All millisecond budgets must be integers from 1 through 600,000. Header receive
timeout cannot exceed the whole-request receive timeout. Invalid values fail
startup; unrelated environment values are not returned by configuration parsing.
Secrets remain in Doppler, never in this guide or source. The empty foundation's
Render declaration no longer requests retired feature credentials; this does not
delete or rotate credentials in existing external services.

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | 3000 | Listen port, integer 1–65535; tests inject ephemeral port 0 directly |
| `NODE_ENV` | development | development, test or production |
| `API_MAX_UNKNOWN_LENGTH_REQUESTS` | 8 | Concurrent unknown-length requests per app instance through response creation |
| `API_MAX_AUTHENTICATION_REQUESTS` | 8 | Concurrent authentication and account-budget operations per app instance |
| `API_REQUEST_TIMEOUT_MS` | 10000 | SDK procedure cancellation deadline |
| `API_STREAM_TIMEOUT_MS` | 120000 | SDK streaming cancellation deadline |
| `NODE_HEADERS_TIMEOUT_MS` | 10000 | Receive complete HTTP headers |
| `NODE_REQUEST_TIMEOUT_MS` | 30000 | Receive whole HTTP request |
| `NODE_KEEP_ALIVE_TIMEOUT_MS` | 5000 | Idle connection reuse after a response |
| `NODE_MAX_HEADER_BYTES` | 16384 | Header byte limit, range 1024–65536; oversized header fixture receives 431 |
| `NODE_MAX_HEADERS` | 100 | Node's retained header count limit, range 1–2000; excess headers may be truncated, not a promise of rejection |
| `SHUTDOWN_TIMEOUT_MS` | 15000 | Grace period, then force-close HTTP/1 connections and report forced shutdown |

Defaults are bounded engineering starting points, not measured workload SLOs.
Node checks incomplete-request timeouts every second; these are not precision
timers. Real slow-header and partial-body fixtures receive HTTP 408.
Long-running streams can exceed the shutdown grace period and be terminated.
TLS terminates at the deployment edge; no forwarded identity/IP header is trusted
by this foundation. Actual edge timeout and drain settings remain unverified.

## Verification and remaining gaps

### External admission work not proven by local foundation evidence

These items are outside the local development-admission gate. The named role is
the responsible next owner; no deployment or provider result is implied.

| Work | Next owner and evidence required | Admission condition |
| --- | --- | --- |
| Hosted identity lifecycle and deployed grants | API/platform owner with the Supabase project operator: exercise hosted sign-in, refresh, revocation, deletion/ban and verify actual grants against the complete migration ledger | Required-mode requests must pass and then deny against hosted Auth and the migrated target database |
| Edge TLS, proxy contract, slow-client and abuse controls | Deployment operator: document the trusted proxy boundary, test edge body/header/timeout limits and provide request admission evidence | Do not trust forwarded identity/IP; deploy only with verified edge-to-Node limits |
| Deployment drain, readiness, observability, backup and restore | Deployment operator with the API/platform owner: run staging startup/drain probes, redaction review, load profile, backup and restore exercise | Actual deployed dependencies and recovery objectives must be demonstrated before production readiness |
| External providers and agent/browser channels | Product/API owner: resolve `DEC-CHANNEL-001`, `DEC-MCP-001` and `DEC-WEBMCP-001`; then assign provider-specific integration owners and scenarios | No bot, MCP, WebMCP or provider delivery is admitted by this foundation |
| Business capability ownership and privacy | Product/domain owner: resolve `DEC-DOMAIN-001` and `DEC-DOMAIN-002`, then use PJC and source authorities to name each capability owner | Each capability needs its own authority, correction, privacy and client evidence before exposure |

`src/__tests__/foundation.test.ts` and `config.test.ts` exercise G1 host/config
contracts using synthetic procedures and in-memory Fetch requests.
`src/__tests__/node-server.test.ts` exercises G2 stateful Node HTTP/1 scenarios over
real loopback sockets, including disconnect, graceful/forced drain, stream errors,
cancellation and local backpressure. No database/provider is involved. The tests
call the lifecycle function; Windows loopback evidence does not establish real
POSIX signal delivery or container/proxy behavior.

Run the source composition fixtures and actual source gate, strict API typecheck,
Biome, API tests and build. Contract inventory remains available through
`scripts/audit-api-contracts.ts`; its implementation lives in the API package so
native SDK dependencies resolve from their owning manifest. JSON inventory of the
two identity procedures is a declaration, not an authorization or feature result.

The aggregate API gate intentionally retains the existing authorization parity
check. Its six SQL-owned resource classifications now reference real migration
authorities, with negative fixtures and explicit RLS activation, rather than fake
ORM models or waivers. The API source gate succeeds; broad anti-slop findings remain
separate. Required-mode database/control readiness is exercised in the subsequent
checkpoint. No deployment, canary, G5 or principal/teacher feature coverage is claimed.

Continue with the [engineering playbook](../api-engineering-playbook.md) and
[canonical policy](../api-domain-and-channel-model.md). Query
`journey:api.operate_runtime` in PJC for implementation/evidence links.

Primary references: [Node 24 HTTP lifecycle and limits](https://nodejs.org/docs/latest-v24.x/api/http.html),
[installed adapter release source](https://github.com/honojs/node-server/tree/v2.1.5),
[oRPC timeout](https://orpc.dev/docs/plugins/timeout), and
[signal sync](https://orpc.dev/docs/plugins/signal-sync).
