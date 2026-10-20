---
title: "Performance Engineering Execution Plan"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [mobile, performance, profiling, low-end, execution]
---

# Performance Engineering Execution Plan

## Objective and ownership

Make the whole native application efficient within the resources of its target
phones, preserving teachers' time, interaction quality, offline work and account
safety. The primary support target is 2 GB Android; the operator designates the
connected Galaxy A52 as the middle reference. This A52 reports 7,668,940 KiB
physical memory (approximately 7.3 GiB): its reference label must not overwrite
the measured memory class or imply equal CPU/storage capacity across phones.

The architect owns workload design, measurement interpretation, budgets,
architectural changes and acceptance. Reuse the same Luna workers for bounded
tool implementation, source research, fixtures and ledger maintenance. Workers
own named files and report their evidence. Device operation remains with the
architect. Keep one device session and one measured architectural change active
at a time; no parallel builds or speculative dependency upgrades.

## Current authority

- [Architecture audit](../architecture/2026-10-19-low-end-startup-architecture-audit.md):
  actual launch chain and verified source discrepancies.
- [Work ledger](../architecture/2026-10-19-startup-work-ledger.md): operation owners,
  dependencies, lifecycle and measurement requirements.
- [Official source register](../research/2026-10-19-device-profiling-source-register.md):
  version and date grounding, metric meanings and profiler limitations.
- [Reusable profiling runbook](../architecture/mobile-performance-profiling.md):
  capture, journey, comparison and evidence procedure.
- [Entry standard](../architecture/entry-system-standard.md): admission authority
  and guest/account/offline invariants remain mandatory.

## Evidence update — 2026-10-19

The shipped change so far is limited to a single optional-startup admission
pilot plus five essential-startup duration spans and bounded Observe events;
see the [runtime adaptation design](../architecture/2026-10-19-runtime-adaptation-design.md).
It does not yet adapt to thermal or current-memory pressure and makes no
performance-improvement claim.

Two physical A52 captures are available at
`reports/mobile-performance/2026-10-19T08-30-57-639Z-0c8da8bb` (process PSS
1,587,235 KiB) and
`reports/mobile-performance/2026-10-19T08-35-28-711Z-7b0bfdc5` (PSS
1,573,926 KiB). These are G5 observations from development runs, not a
release-like before/after comparison or a low-end acceptance baseline. The
second capture's `native.pftrace` is 8,301,702 bytes against a requested 10 s
capture and an 8 MB file cap; file size does not establish actual trace
duration. Interpret both with their manifests and exact run conditions.

The approved EAS internal performance build
`36d2f7b8-3f83-4364-86ff-433c23682ca7` is **IN_PROGRESS** and is not yet a
usable artifact. No release-like result is available. A user-visible Wellbeing
tab tap currently crashes with Maximum update depth in `ActiveSubTabStrip`; a
separate worker is investigating its selector. There is no evidence attributing
that crash to Observe or the admission pilot. The Argent flow did not complete
readable accessibility checks, so it is not a validated benchmark journey.

G1 evidence: core admission 8 tests, optional startup scheduler 4 tests,
startup coordinator/telemetry 12 tests. The full anti-slop gate remains blocked
by pre-existing repository findings (39 errors, 514 warnings); the new owned
files had no reported errors. This is not an overall gate pass.

## Design contract

Use three independent inputs: stable capacity, live pressure/conditions, and
journey stage. Extend the existing runtime facts / visual capabilities /
operational efficiency boundaries after baseline measurement; do not install a
second profiler or scheduler solely because its name sounds useful.

Capacity descriptors include RAM, OS low-RAM signal if available, CPU topology,
and measured CPU/storage behavior. Core count or GHz is not throughput. Live
conditions include heat, charging, battery saver, memory pressure, connectivity
and storage availability. Missing data remains unknown. A safe initial policy
must not require a startup benchmark or network request.

Only minimum local boot, visible language/theme, input and required identity
work belong before a usable entry screen. Local DB readiness, remote first sync,
flag refresh, telemetry, rewards and asset warmup are separate capabilities with
their own failure and cancellation owners. User-requested work takes precedence
over optional jobs. Durable writes keep their ordering and receipts.

## Ordered work packages and exit gates

| ID | Work | Concrete deliverable | Exit gate |
| --- | --- | --- | --- |
| P0 | Reconcile architecture and old plans | Work ledger, source register, device matrix | Source owners and unknowns documented; no guessed cost numbers |
| P1 | Reusable observational capture | Existing gateway action, raw evidence, manifest, parser fixtures | Permission/missing-field tests; real A52 capture; no automatic production score |
| P2 | Reproducible journey baseline | Recorded flows, artifact identity, repeated per-stage runs and traces | Usable endpoints verified; release-like artifact present; timing and memory compared under matching conditions |
| P3 | Startup scheduling design | Dependency DAG, required/optional ownership, bounded admission pilot and cancellation spec | Pilot contracts covered at G1; broader queue and pressure inputs remain unimplemented; critical path still needs P2 evidence |
| P4 | Implement measured changes | One change per comparison: import evaluation, job scheduling, subscriptions, DB options, image/screen lifetime | No performance victory claim until same-journey release-like comparison; auth/offline/error behavior preserved |
| P5 | Low-end adaptation and pressure | Conservative capacity policy plus live-pressure reductions | A52 policy exercises labelled simulation; physical 2–3 GB verification tracked separately |
| P6 | Regression and release evidence | Stored runs, comparison rules, release checklist | No unsupported G5/R1 claims; production rollout remains separately authorized |

P0/P1 are authorized now. Continue P2 using available artifacts and read-only
tools. New standalone release builds follow the Android build skill's explicit
build authorization requirement. Do not treat a missing artifact as permission
to run a debug benchmark and report release numbers.

## Device and scenario matrix

| Reference | Purpose | Status |
| --- | --- | --- |
| A52 middle reference, actual RAM recorded separately | Develop workflow, explain CPU/JS/native behavior, establish reference journeys | Connected; operator authorized use |
| 2–3 GB physical Android | Primary memory/startup acceptance | Operator chose later availability |
| Capable reference | Verify adaptation does not degrade useful richer behavior | Future device; no fabricated measurements |
| A52 constrained policy | Exercise low-end permissions/work limits while retaining hardware truth | Simulation only; does not certify low-end CPU, storage or LMK behavior |

Run signed-out cold/warm launch; local guest onboarding; admitted guest first
value; permanent-account first value; offline return; first local DB open and
remote first sync; backlog drain; navigation loops; background/resume and account
switch. Each run records identity mode without personal identifiers. Use an
authorized test identity before cloud/account claims.

Do not change device clocks, thermal controls, battery/network settings, clear
data, or delete queues as an incidental profiling step. Such interventions need
an explicit experiment specification and restoration procedure.

## Measurement and decision rules

- Separate installation, native Activity launch, first meaningful React frame,
  actual interactive readiness and settled background work.
- Capture JS task/call stacks and React commits when investigating JS cost;
  capture native scheduling, thread states and frames when investigating OS
  contention. Snapshot memory cannot establish a leak or CPU bottleneck.
- Start with five repeatable runs per scenario for diagnostic median/range.
  Increase sample size before tail-percentile claims; report raw values and N.
  Keep cold/warm runs and development/release artifacts separate.
- Record process PSS, RSS and swap with exact units and method. Do not equate
  system free memory, process memory, heap size and decoded bitmap memory.
- Candidate goals (not current guarantees): P95 visible tap feedback <=100 ms,
  optional JS work units <=50 ms, frame work within the display deadline, no
  unexplained retained growth over ten navigation loops, no lost commands.
  Ratify absolute RAM/startup budgets from release evidence on the primary tier.
- A meaningful change must improve the named metric without unacceptable
  correctness, energy, memory, startup or resume regressions. Retain/revert based
  on that comparison, not a dependency count or static quality score.

## Implementation candidates, awaiting measured rank

The [runtime adaptation controller design](../architecture/2026-10-19-runtime-adaptation-design.md)
specifies shipped-app behavior, including conservative startup, stage-based work
admission, pressure reductions, hysteresis and existing integration boundaries.
It does not require a debug profiler in users' apps.

1. Stop optional startup services converging immediately after `setState(ready)`.
2. Contain import-time work and domain registration while preserving required
   catalogs, background task definition and Router's actual production behavior.
3. Replace hot whole-store facade consumers with existing atomic selectors.
4. Replace the unconsumed PowerSync `onConfigure` configuration path with the
   installed supported options, then verify live PRAGMAs and native memory.
5. Bound media decode, list growth, screen retention, query cache and outbox work.
6. Add actual interactive-stage markers through the installed Observe API;
   mounting a screen alone does not prove its touch handlers can run.

These are hypotheses/known contract gaps, not a ranked claim about production
cost. Do not remove GrowthBook or PowerSync wholesale to obtain a small number.

## Resource discipline for engineering

Keep the architect's context focused on contracts, evidence and decisions.
Reuse Luna with explicit follow-up scope rather than restarting broad discovery.
Workers return changed paths, command outcomes and limitations. Use compact
summaries and saved raw artifacts instead of repeatedly printing logs. Record
failed experiments so the next session does not repeat them. Do not create a
recurring automation or paid cloud job without the operator requesting it.
