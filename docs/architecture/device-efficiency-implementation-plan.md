---
title: "Gurudevi Storage, Battery, and Network Implementation Plan"
status: "superseded"
superseded_by: "docs/engineering/runtime-performance/device-efficiency-implementation-plan.md"
created: 2026-08-31
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, runtime-performance, device-efficiency]
---

> [!NOTE]
> This document has been relocated to the centralized performance suite:
> **[`docs/engineering/runtime-performance/device-efficiency-implementation-plan.md`](file:///c:/x/docs/engineering/runtime-performance/device-efficiency-implementation-plan.md)**.

# Gurudevi storage, battery, and network implementation plan

Status: superseded (relocated to `docs/engineering/runtime-performance/`)  
Created: 2026-08-31  
Related guidance: [device-efficiency-guidance.md](./device-efficiency-guidance.md)

## Goal

Make storage, battery, and network behavior bounded and lifecycle-aware without weakening offline correctness, losing user data, or delaying user-initiated actions.

## Relationship to adaptive visual capabilities

This plan is the operational-efficiency track of the shared runtime-capability architecture. It does not replace the UI visual resolver. Both tracks must consume the same normalized runtime facts, while retaining separate decisions:

- `VisualCapabilities` controls artwork delivery, blur, aura, animation, celebration density, and visual prefetching.
- `EfficiencyPolicy` controls background sync, cache writes, storage maintenance, analytics, and other non-urgent work.
- User-initiated actions remain allowed in both tracks unless an operation is impossible or accessibility requires a visual override.
- Explicit High fidelity may preserve rich visuals, but it never bypasses battery, network, storage, or background-work safeguards.

The target architecture is documented in [adaptive-visual-capabilities-integration.md](./adaptive-visual-capabilities-integration.md).

## Phase 0 — Baseline

Record before changing global policies:

- cache bytes by directory and media type;
- SQLite/PowerSync file size, WAL size, query duration, and compaction duration;
- foreground/background request count and bytes by endpoint/category;
- sync queue age, batch size, retry count, and dead-letter volume;
- battery drain for cold start, 30-minute idle, feed browsing, media viewing, upload, and background sync;
- behavior under offline, metered, low-battery, and low-storage conditions.

Use Android Studio System Trace/Power Profiler, Macrobenchmark `PowerMetric` on supported physical devices, Network Profiler, `dumpsys batterystats`, and `dumpsys netstats`/Play Console data where available.

## Enforcement already implemented

- `packages/core/src/efficiency/policy.ts` is the typed shared policy boundary. It classifies operations and returns `allow`, `defer`, or `reduce`.
- Background sync now re-checks battery and network state immediately before draining its queue. It defers on unavailable state, offline, metered cellular, or low battery.
- Storage maintenance now uses the same policy. Critical free disk selects a reduced incremental maintenance pass; low battery/offline/unknown network can defer work.
- Existing user-initiated flows are not gated by the background policy.

These checks are deliberately narrow. Cache-manager extraction, request wrappers, static lint rules, and device tests remain follow-up phases because they need baseline measurements and broad call-site review.

## Phase 1 — Storage policy consolidation

Owner: mobile platform + data layer  
Exit criteria: every local file/data class has an owner, storage class, TTL/eviction rule, and recovery behavior.

- Extract the `useMediaDownloader` LRU logic into a typed shared cache policy.
- Add atomic download finalization and orphan/index repair.
- Define separate caps for thumbnails, user-requested documents, generated exports, and temporary OCR/PDF inputs.
- Keep pending mutations and unsynced user work outside disposable eviction paths.
- Replace scheduler unknown-state fail-open compaction with a conservative deferred/light operation after testing.
- Measure whether WAL checkpointing, incremental vacuum, `shrink_memory`, and full `VACUUM` are appropriate at each database size.
- Add tests for cache miss after OS eviction, disk-full behavior, interrupted download, and queue preservation.

## Phase 2 — Network policy

Owner: networking + sync  
Exit criteria: non-urgent traffic is batched, cancellable, retry-bounded, and metered-aware.

- Instrument request bytes/counts and classify traffic by user/app/server initiation, foreground/background, and network type.
- Add a shared request policy for pagination, conditional reads, retry/backoff, cancellation, and response-size limits.
- Review PowerSync and mutation-queue batching; keep the existing exponential backoff but validate queue growth and dead-letter behavior.
- Gate large downloads and speculative prefetch on unmetered Wi-Fi, charging, or explicit user action.
- Reduce card/thumbnail payloads at the API/CDN layer rather than relying only on client downscaling.
- Make offline reads avoid redundant connectivity probes and failed network attempts.

## Phase 3 — Battery and background work

Owner: mobile platform  
Exit criteria: no routine polling or maintenance runs while hidden without a product-approved reason.

- Audit every `setInterval`, timer, background task, sync loop, animation, media player, camera, and WebView for app/screen lifecycle cleanup.
- Define background sync conditions: queue non-empty, network available, backoff ready, and OS-appropriate constraints.
- Keep urgent user-visible work immediate; batch analytics, eviction, retry, and refresh work.
- Review the 15-minute background sync registration and hourly eviction registration against real queue volume and Android scheduling behavior.
- Use push notifications as refresh signals where possible rather than short polling.
- Add low-battery and metered-network behavior to the shared runtime policy, not individual screens.

## Phase 4 — Verification and rollout

Owner: release engineering  
Exit criteria: release build has no material regression in usability, offline correctness, or power/resource consumption.

- Test 4 GB-class Android hardware/emulator, a mid-tier device, and a recent high-end device.
- Test Wi-Fi, metered cellular, offline transitions, airplane mode, Doze/idle, restricted battery mode, and low disk space.
- Run repeated navigation and foreground/background loops to detect retained timers, files, database handles, and network work.
- Compare battery, bytes, cache size, query latency, startup, and frame time against Phase 0.
- Roll out behind small release cohorts; monitor Play Console network/wake-lock vitals and app-specific telemetry.

## Proposed initial budgets

Validate these in Phase 0 before enforcing them:

| Metric | Initial target |
| --- | ---: |
| Routine background mobile-network usage | < 10 MB/day/user |
| Background sync request frequency | No fixed polling when queue is empty |
| Disposable media cache | < 500 MB and evict before 100 MB free space |
| Failed retry attempts per item | 3, then dead-letter/manual retry |
| Cache maintenance while low battery and not charging | Deferred |
| User-created or pending data evicted by maintenance | 0 |

The 50 MB/day Android vitals background mobile-network threshold is an external warning threshold, not the product target.

## Risks and decisions

- More batching can delay freshness; preserve immediate behavior for user actions and explicit refresh.
- More aggressive cache eviction can increase downloads and battery; use disk/cache-hit measurements to tune caps.
- Deferring work under metered or low-battery conditions can leave queues stale; surface sync state and retry on the next eligible opportunity.
- SQLite compaction can block or consume battery; schedule it only with evidence that reclaimed space justifies the cost.
- Background-task APIs are OS-controlled; minimum intervals are not exact schedules. Correctness must not depend on a task running at a particular time.
- Never delete MMKV, SQLite, PowerSync, pending mutations, or offline user work as a generic “cleanup” action.

## Decision log

- 2026-08-31: Documented storage, battery, and network guidance from Android, Expo, and repository evidence.
- 2026-08-31: Deferred broad code changes until device and release-build baselines exist.
- 2026-08-31: Identified storage scheduler fail-open device-state fallback and unconditioned 15-minute background-sync registration as priority review items.
- 2026-08-31: Added the typed efficiency policy and enforced it at background-sync and storage-maintenance boundaries.
