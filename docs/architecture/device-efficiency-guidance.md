---
title: "Gurudevi Device Efficiency Guidance"
status: "superseded"
superseded_by: "docs/engineering/runtime-performance/device-efficiency-guidance.md"
created: 2026-08-31
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, runtime-performance, device-efficiency]
---

> [!NOTE]
> This document has been relocated to the centralized performance suite:
> **[`docs/engineering/runtime-performance/device-efficiency-guidance.md`](file:///c:/x/docs/engineering/runtime-performance/device-efficiency-guidance.md)**.

# Gurudevi device-efficiency guidance

Status: superseded (relocated to `docs/engineering/runtime-performance/`)  
Scope: storage, battery, and network  
Updated: 2026-08-31

Related: [RAM and memory efficiency guidance](./memory-efficiency-guidance.md)

## Executive summary

Storage, battery, and network efficiency are one system. Large caches increase storage pressure and database work; frequent or fragmented requests wake the CPU and wireless radio; retries and background work consume battery and bandwidth; and media downloads often amplify all three costs.

The product policy should be:

- durable user data is protected and recoverable;
- disposable cache data is bounded, observable, and safe to delete;
- user-initiated work favors responsiveness;
- non-urgent work is batched and scheduled under OS constraints;
- metered, offline, low-battery, and low-storage states degrade gracefully;
- every policy is measured on release builds across realistic device/network conditions.

## Storage efficiency

### Choose the correct storage class

- Keep credentials, consent, preferences, and small critical state in the existing secure/persistent stores.
- Keep synchronized product data in PowerSync/SQLite; query only the columns and rows needed for the current screen.
- Keep downloaded previews, temporary exports, OCR inputs, generated PDFs, and re-downloadable media under `Paths.cache`.
- Keep user-created files that must survive cache eviction or app updates in an app document location, and export files to shared storage only when the user explicitly requests it.
- Never treat a cache directory as durable user storage: Android may remove cache files under storage pressure.
- Check file existence before opening cache files and handle eviction as a normal cache miss.

Sources: [Android app-specific storage](https://developer.android.com/training/data-storage/app-specific), [Android storage use cases](https://developer.android.com/training/data-storage/use-cases), and [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/).

### Bound every cache

- Use a single cache index/owner per media class with size, last-access time, creation time, and content version.
- Enforce both a byte cap and a free-space floor. Do not wait for the OS to clean up.
- Evict least-recently-used disposable media first; never evict pending mutations, unsynced user work, credentials, or records required for offline safety.
- Make downloads atomic: write to a temporary name, verify completion/size, then rename into the cache index.
- Remove orphaned files and stale index entries during scheduled maintenance.
- Avoid duplicate copies when moving from picker URI to processing URI to viewer URI.
- Prefer server thumbnails/transcoded media over storing multiple full-resolution variants.
- Batch SQLite writes in transactions, use indexes that match real filters/sorts, and avoid unbounded result sets.
- Run compaction only when it is worthwhile and safe; `VACUUM` is expensive and should not run during active user work.

Sources: [SQLite performance best practices](https://developer.android.com/topic/performance/sqlite-performance-best-practices) and [Android app-specific storage](https://developer.android.com/training/data-storage/app-specific).

### Current Gurudevi storage findings

- `useMediaDownloader` already uses `Paths.cache` and an LRU index with a 500 MB target and a 100 MB low-space trigger. This should become a shared policy rather than a hook-local policy.
- `retention-scheduler.ts` already prunes old rows, checkpoints WAL, runs incremental vacuum/`shrink_memory`, and conditionally runs `VACUUM`/`PRAGMA optimize`.
- The scheduler’s device-state fallback currently allows compaction when battery/network/disk checks fail. That is resilient for availability but risky for battery and storage pressure; the fallback should be a conservative light pass or a deferred retry.
- Storage thresholds, TTLs, and compaction choices are currently mixed with stubs and broad `any` types. They need typed adapters and tests before becoming a hard policy.

## Battery efficiency

### Minimize wakeups and radio transitions

- Prefer one batched transfer over many small requests. HTTP connection reuse helps, but fewer radio activations is the larger goal.
- Trigger foreground work immediately when the user asks for it.
- Batch analytics, retry queues, cache maintenance, and non-urgent refreshes.
- Use OS scheduling for deferred work and honor Doze, App Standby, battery restrictions, and user settings.
- Do not use exact alarms or wake locks unless the product requirement truly needs precise timing; release resources promptly.
- Stop polling, timers, animations, camera, video, location, WebView activity, and sync loops when the screen is not active.
- For downloads or large maintenance, prefer charging and unmetered Wi-Fi constraints where the user experience permits.
- Use push messages as a signal to refresh rather than maintaining a frequent background poll.

Sources: [Android network/battery preservation](https://developer.android.com/develop/connectivity/preserving-battery), [network access optimization](https://developer.android.com/develop/connectivity/network-ops/network-access-optimization), [power-management resource limits](https://developer.android.com/topic/performance/power/power-details), and [background optimization](https://developer.android.com/topic/performance/background-optimization).

### Measure battery correctly

- Use Android Studio Power Profiler/System Trace for subsystem and rail-level evidence where supported.
- Use Macrobenchmark `PowerMetric` on supported physical Pixel devices for repeatable journey comparisons; it measures system-level power, so control unrelated device activity.
- Use Android vitals for production signals such as excessive background network and wake-lock behavior.
- Do not infer battery impact from request count alone; correlate CPU, display, memory, disk, cellular, WLAN, and wakeup timelines.

Sources: [Android Power Profiler](https://developer.android.com/studio/profile/power-profiler), [Macrobenchmark power metrics](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics), and [Android vitals background network](https://developer.android.com/topic/performance/vitals/bg-network-usage).

### Current Gurudevi battery findings

- Background sync is registered at a 15-minute minimum interval. This is an upper scheduling hint, not a guarantee, and it currently needs explicit policy for connectivity, charging, queue size, and retry state.
- Storage eviction is registered hourly and already checks battery, metering, and free space, but its unknown-state fail-open behavior should be changed after tests confirm the safe fallback.
- There are long-lived intervals in theme/UI components and a number of timers. They need a lifecycle audit to confirm they stop when screens lose focus or the app backgrounds.
- The app already centralizes app lifecycle handling; it should become the single source for pausing nonessential activity.

## Network efficiency

### Request policy

- Check connectivity before user-independent work, but do not add a second redundant network probe before every user action.
- Classify requests as user-initiated, app-initiated, or server-signaled. Apply different latency and retry policies to each.
- Use stale-while-revalidate for suitable reads, conditional requests/ETags where the API supports them, and pagination for growing collections.
- Request only fields needed by the surface; filter, sort, and limit at the database/API boundary.
- Batch analytics and mutation uploads. Bound retry count, use exponential backoff with jitter, and stop retrying permanent failures.
- Use resumable downloads for large files, cancellation on screen exit, and progress UI for user-visible work.
- Avoid aggressive prefetching. Prefetch only the next likely screen or bounded thumbnail set, and gate large prefetches on Wi-Fi/charging.
- Treat metered networks as a first-class state: reduce image quality, skip speculative media, and defer bulk downloads.
- Preserve offline-first behavior: local reads should work without forcing a failed network request, and writes should queue safely for later sync.

Sources: [Android network access optimization](https://developer.android.com/develop/connectivity/network-ops/network-access-optimization), [network troubleshooting](https://developer.android.com/develop/connectivity/troubleshoot-network-issues), and [Android vitals background network](https://developer.android.com/topic/performance/vitals/bg-network-usage).

### Production network guardrails

Android vitals considers background mobile-network usage excessive at a combined 50 MB/day in the background. This is an external warning threshold, not Gurudevi’s desired budget; the app should aim substantially lower for ordinary background behavior.

Track per release and per network type:

- request count and transferred bytes;
- foreground/background bytes;
- retry and failure rates;
- radio-active periods or network power where available;
- cache hit rate and stale-read rate;
- bytes per successful user journey;
- large-download cancellation and resume success.

## Combined operating matrix

| State | User-facing reads | Media | Sync/maintenance |
| --- | --- | --- | --- |
| Foreground + Wi-Fi | Fresh request or local-first refresh | Normal quality; bounded prefetch | Small immediate batch if relevant |
| Foreground + metered | Fresh request when needed | Thumbnails/quality reduction | Small queue batch; no bulk work |
| Background + Wi-Fi | No speculative refresh | Defer bulk media unless opted in | OS-scheduled, batched work |
| Background + metered | No routine polling | Defer | Push-signal or OS-constrained queue only |
| Offline | Local cache/database | Local files only | Persist queue; no tight retry loop |
| Low battery | User action still works | Avoid prefetch/transcoding | Defer non-urgent work |
| Low storage | Reads from existing data | Evict disposable cache first | Prune/compact conservatively; protect durable data |

## Enforcement model

The rules are enforced at shared boundaries, not by screen authors remembering a checklist. `packages/core/src/efficiency/policy.ts` provides a typed decision function with `allow`, `defer`, and `reduce` outcomes. The mobile background-sync worker must defer when device state is unavailable, offline, metered, or low battery. Storage maintenance may run a reduced incremental pass under critical free-disk conditions, but full `VACUUM` is not allowed in that state. User actions remain allowed so the app does not turn efficiency into an availability failure.

The next enforcement layers are:

- a shared cache manager with byte caps, free-space floors, atomic writes, and orphan repair;
- network/request wrappers for pagination, response-size limits, cancellation, conditional reads, and retry budgets;
- lifecycle ownership for timers, polling, media, WebViews, and prefetch;
- static checks for new unbounded lists, raw background fetches, uncapped caches, and unowned timers;
- release-device tests and production dashboards that fail or alert on resource regressions.

An OS task’s interval is only a scheduling hint. Every worker re-evaluates the policy immediately before doing work.

## Source register

- [Android app-specific storage](https://developer.android.com/training/data-storage/app-specific)
- [Android storage use cases](https://developer.android.com/training/data-storage/use-cases)
- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [SQLite performance best practices](https://developer.android.com/topic/performance/sqlite-performance-best-practices)
- [Preserving battery](https://developer.android.com/develop/connectivity/preserving-battery)
- [Optimizing network access](https://developer.android.com/develop/connectivity/network-ops/network-access-optimization)
- [Network troubleshooting](https://developer.android.com/develop/connectivity/troubleshoot-network-issues)
- [Power-management resource limits](https://developer.android.com/topic/performance/power/power-details)
- [Background optimization](https://developer.android.com/topic/performance/background-optimization)
- [Android Power Profiler](https://developer.android.com/studio/profile/power-profiler)
- [Macrobenchmark PowerMetric](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics)
- [Excessive background mobile network usage](https://developer.android.com/topic/performance/vitals/bg-network-usage)
