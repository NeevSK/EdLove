---
title: "Scale and Production Operation"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [api, scale, load, deployment, observability, hardening, operations]
---

# Scale and Production Operation

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
