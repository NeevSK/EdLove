---
title: "Scale and Production Operation"
status: "active"
created: 2026-11-02
updated: 2026-11-03
author: "Naveen"
scribe: "Claude"
tags: [api, scale, load, deployment, observability, hardening, operations]
---

# Scale and Production Operation

## National design horizon (owner direction, 2026-11-03)

Design the horizontal foundation for approximately 10,000 Sri Lankan schools with
synchronized morning demand, while allowing a small deployment of the same system.
This is a design horizon, not a statement that the current API has demonstrated that
capacity. Do not pre-provision national capacity or introduce separate services solely
because of the population count.

The official [2025 School Census, table 3](https://www.statistics.gov.lk/Resource/en/Education/School_Census/Annual_School_Census_SummaryReport_2025.pdf)
reports 10,047 government schools, 3,747,544 students and 242,309 teaching staff.
These are population figures, not concurrent users, registered accounts or API requests.
Guardians, private institutions, multiple devices and partner integrations add separate
populations; do not infer their counts from this table.

Workload parameters must remain explicit: active devices, calls per active device,
arrival window, burst factor, payload size, rows touched, database time, sync fan-out,
retry amplification and background backlog. Model each operation class separately.
For a class, average offered requests/second is active devices multiplied by calls
per device divided by the arrival window in seconds. In-flight work depends on that
arrival rate and measured service time; peak behavior and queues need additional tests.

Illustrative scenarios below are arithmetic assumptions, not benchmarks or forecasts:

| Synthetic arrival assumption | Average offered load |
| --- | --- |
| All 242,309 teaching staff, 10 calls each in 15 minutes | About 2,692 requests/second |
| All 3,747,544 students, 2 calls each in 15 minutes | About 8,328 requests/second |
| The same combined hypothetical demand compressed into 5 minutes | About 33,062 requests/second |

A batch carrying 40 records is one HTTP request but may cause 40 validations, writes,
audit entries and sync changes. Bound and measure records, bytes, effects and SQL work,
not only request count. Load profiles must include uneven school sizes, noisy tenants,
offline catch-up, key refresh, cold caches, deployments, dependency slowdown and retry
storms. Use smaller cohorts first to calibrate the model, then scale the same harness.

### Capacity and failure invariants

- Sum of API and worker pools, deployment overlap and operator reserve must fit the
  database connection budget. Adding API replicas must not accidentally exhaust it.
- No globally serialized audit chain, quota row or job claim for all schools. Partition
  contention by a declared ownership key while preserving per-stream evidence and
  fairness. Verify any later partitioning against actual query and transaction paths.
- Keep ownership keys in durable operation identity and data access. Cross-institution
  reads and person-owned records need explicit authority; school is not a universal root.
- Expensive exports, indexing, analytics and provider delivery have bounded worker pools
  and durable backlogs. They cannot consume all interactive capacity.
- Shed excess work before acceptance. Distinguish capacity rejection (503) from a caller
  budget (429). Clients retain pending intents and use bounded backoff with jitter.
  A retry delay is guidance, not a promise that capacity exists after that interval.
- Preserve authorization, audit and transactional guarantees under degradation. Lower
  optional throughput, not correctness. Local persistence does not prove remote acceptance.
- Availability objectives, latency objectives, recovery time and recovery-point targets
  remain explicit decisions; population size does not determine them.

### Portability and independent operation

Use the existing [portability contract](data-portability-and-education-standards.md).
Native oRPC remains the first-party wire. Standards adapters call the same owned
capabilities. An export must be interpretable without the running Gurudevi service:
documented schema version, ownership, stable references, timestamps, original files,
checksums and a manifest of omissions. Test restoration/reading with an independent
consumer. Exportability never makes private or children's records public open data.

Infrastructure configuration must identify provider-specific dependencies and the
replacement boundary. Database restoration, object retrieval and durable job recovery
must not depend solely on a provider dashboard. This is a required portability proof,
not a claim that switching providers has already been tested.

How the API should run under Gurudevi's real load shape, and what "production ready"
means. The hardening work order and acceptance gates are in the
[API engineering playbook](../api-engineering-playbook.md#production-foundation-work-order-2026-10-31);
runtime guarantees already implemented are in the
[runtime foundation](runtime-foundation.md).

## The load shape

Expected, not measured (there is no production traffic yet). Weekdays in Asia/Colombo:

| Time | Load | Cause |
| --- | --- | --- |
| 07:00–08:30 | Highest, a sharp burst | Sign-in, attendance, timetable, notices |
| 08:30–14:00 | Steady | Classroom work, submissions |
| 14:00–17:00 | Falling | Dismissal |
| 19:00–21:00 | A second, smaller peak | Homework, Self, messaging |
| Night, weekends, holidays | Low | Term calendar matters: exam weeks and term starts are spikes |

Measure the real shape as soon as there is traffic, and plan from the measurement.

## What it asks for

- **Stateless API instances** behind a load balancer, so capacity can be added and removed.
- **Scale before the burst**: scheduled scale-out before 07:00 on school days, plus
  automatic scaling on load. Scale in after the afternoon.
- **No hosting that sleeps when idle.** The current Render free-tier blueprint (commit
  `85c0ef140`, Singapore) sleeps, so the first requests at 07:00 would wait for a cold
  start. Fine for development; not for production.
- **Database connections are the real limit.** Use a pooler, bound connections per
  instance, and keep transactions short. Long reports run on a replica or off-peak.
- **Budgets per person and per institution**, so one school's burst can't starve
  another. Layer 4 in the playbook's table.
- **Back-pressure instead of failure**: when overloaded, reject early with
  `TOO_MANY_REQUESTS` and a retry-after, so phones keep the write queued and retry.
  Local-first makes this harmless.
- **Background work off the request path**: notices, deliveries, exports and retention
  jobs run as durable jobs, scheduled away from the morning burst where possible.

## Node or Bun

The API runs on Node 24 (LTS), set in `.nvmrc`. Bun isn't used. Switching runtime is a
dependency decision for the cautious upgrade protocol, made on measured benefit; Hono
and oRPC run on both, so the modules don't depend on the choice.

## Observability

- Every request and operation carries an identifier through logs, traces and the audit.
- A few numbers define "healthy at 07:45": error rate, p95 latency of commands,
  rejected-for-budget rate, sync lag, database connection saturation. Alert on those.
- Telemetry is sampled and redacted; no personal content in logs.

## Ready for production means

Each item has evidence, not a claim:

- Deployed on hosting that doesn't sleep, in the chosen region, with TLS and a trusted
  proxy configuration.
- A load test of the morning burst against a production-like database, with the results
  recorded.
- Backups taken and **restored** in a drill.
- Migrations run forward on a copy of production data.
- Alerts firing on the health numbers above, tested.
- An incident procedure and a revocation drill (sessions, keys, delegations).

## Open decisions

- Hosting provider and region for production.
- The service objectives (what latency and error rate the morning burst must meet).
