---
title: "F4 Operations, Telemetry and Resource Boundary Audit"
status: "active"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [f4, operations, telemetry, privacy, rate-limits, resilience]
---

# F4 Operations, Telemetry and Resource Boundary Audit

## Ground and status

Static inspection on 2026-10-13: API `entry-node.ts`, `index.ts`, `telemetry/otel.ts`, `agents/workerTelemetry.ts`, `core/app.ts`, `core/rateLimit.ts`, `core/routes/health.ts` and `core/routes/orpc.ts`. F4 is not passed. This audit distinguishes implemented controls from verified operational guarantees.

| Seam | Observed mechanism | Gap / bounded verification |
| --- | --- | --- |
| Node shutdown | SIGTERM/SIGINT, retention timer close, server.close, idle close, 15s forced close | Earlier generic “missing graceful shutdown” claim was incomplete. Prove draining writes/streams, readiness removal, DB closure, telemetry flush and process exit under an actual spawned server. |
| Bun/edge entry | Starts retention maintenance; exports fetch/port | Node signal handling cannot prove this runtime's lifecycle. Define supported deployment runtime and test its shutdown contract separately. |
| Early request failures | body limit/rate limit/timeout precede request-ID and OTel registration | Characterize early 413/429/timeout responses: stable IDs/diagnostics may be absent. Move responsibility only after testing response/header compatibility. |
| Rate limit | Postgres bucket upsert; startup requires configured proxy header; API limiter runs before identity | A configured header name is not proof of trusted ingress. Verify direct-origin access, overwrite rules, shared-network users, authenticated fairness and bucket-store outage. A DB-backed limit shares the DB failure domain. |
| HTTP tracing | Incoming W3C carrier, normalized paths, request ID, span status/duration, traced fetch | Basic payload minimization exists. Prove trace propagation, error status, concurrent isolation and collector outage without request failure. Raw exception recording still needs a redaction policy. |
| API logging | Raw exception passed to Pino/Sentry; native RPC diagnostics log full request URL | Safe client error does not establish safe server logs. Query strings and exception messages may contain sensitive values. Characterize with synthetic sentinel secrets; never inject real secrets. |
| Worker analytics | SAFE_KEYS allow-list; arbitrary content excluded; provider failure returns sent=false | Allow-list includes student IDs and grade; wellbeing event emits intervention_needed. Treat these as sensitive educational metadata, not automatically safe. Verify purpose/consent/retention/provider policy; no raw content leakage does not imply privacy compliance. |
| Readiness | SELECT 1; rate-limit table availability when configured | Valid DB readiness, not worker/auth/provider/global readiness. Separate critical serving dependencies from optional AI; report degraded capabilities without making AI outage fail all core traffic. |
| Async analytics | Catch handles fetch failure; no timeout visible in capturePlatformWorkerEvent | Add a bounded time budget and safe fallback only through a tested packet; observe hanging provider and worker deadline consequences. |

## Remediation packets and owners

- **F4-01 / operator:** establish allowed runtime/ingress topology. Supply sanitized deployment facts, no credentials. Record direct-origin policy and trusted-header overwrite evidence.
- **F4-02 / API engineer:** characterize early failures and IDs. Preserve protocol-specific wire behavior, add correlation at the earliest safe boundary.
- **F4-03 / security + telemetry owner:** classify exception messages, query strings, student IDs, grades and wellbeing analytics. Define allow-list, retention/access and synthetic-secret leakage tests.
- **F4-04 / operator:** process-level shutdown/drain/flush evidence per runtime; distinguish refusal of new traffic from waiting for accepted work.
- **F4-05 / API + operator:** DB bucket outage, proxy spoofing, shared-network and per-tenant fairness tests; set resource budgets from actual workload, not guessed requests-per-second.
- **F4-06 / worker owner:** bounded provider telemetry duration; queue age, dispatch lag and repair alarms tied to durable operation state.
- **F4-07 / product + operator:** capability-specific readiness and degraded-mode contract. Optional providers must not become accidental mandatory core dependencies.

Do not split services to solve these before testing the modular-monolith boundaries. Isolation, worker separation or cells may later be justified by measured contention/custody; they are not prerequisites for these controls.

## Gate and stop conditions

No reliability/privacy promise until ingress trust, early-failure correlation, log redaction, bounded async work and drain evidence exist for the supported runtime. Stop deployment promotion if sentinels leak into prohibited telemetry, a client can spoof trusted rate identity, or acknowledged operations cannot be reconciled after forced shutdown.

## Verification boundary

G0 source evidence only. No collector, analytics endpoint, deployment origin, shutdown process or load generator was exercised. Observed data fields establish disclosure intent in code, not actual production transmission or legal noncompliance.
