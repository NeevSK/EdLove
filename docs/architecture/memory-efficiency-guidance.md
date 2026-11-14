---
title: "Gurudevi Memory Efficiency Guidance"
status: "superseded"
superseded_by: "docs/engineering/runtime-performance/memory-efficiency-guidance.md"
created: 2026-08-31
updated: 2026-10-19
author: "Naveen"
scribe: "Antigravity"
tags: [performance, runtime-performance, memory-efficiency]
---

> [!NOTE]
> This document has been relocated to the centralized performance suite:
> **[`docs/engineering/runtime-performance/memory-efficiency-guidance.md`](file:///c:/x/docs/engineering/runtime-performance/memory-efficiency-guidance.md)**.

# Gurudevi memory-efficiency guidance

Status: superseded (relocated to `docs/engineering/runtime-performance/`)  
Owner: Gurudevi mobile  
Updated: 2026-08-31

## Executive summary

Google Play has announced new technical-quality requirements that begin in February 2027. For mobile and tablet apps, Play will evaluate the last 28 days of opted-in data and use the 90th percentile for memory usage and bitmap memory usage. The memory signal is Anonymous RSS + Swap; it covers JavaScript/native allocations, anonymous mappings, and zRAM-backed pages. Gurudevi should optimize for the 4–12 GB device tiers, where the announced app thresholds are most relevant, and should measure release builds on physical Android devices.

The working engineering rule is: keep only data needed for the current user journey in memory; keep reusable encoded media on disk; release decoded media and inactive resources at lifecycle boundaries; and verify memory with Android-native measurements rather than JavaScript heap size alone.

## Google Play thresholds to track

These are announced thresholds, not a substitute for a Gurudevi performance budget. They apply from February 2027 and are evaluated at P90 over a rolling 28-day window.

| Device physical-RAM tier | Foreground | User-perceived service | Background |
| --- | ---: | ---: | ---: |
| 4 GB | 2.00 GB | 1.00 GB | 1.00 GB |
| 6 GB | 2.25 GB | 1.25 GB | 1.25 GB |
| 8 GB | 2.25 GB | 1.50 GB | 1.50 GB |
| 12 GB | 3.25 GB | 1.75 GB | 1.75 GB |
| 16 GB | 4.25 GB | 2.00 GB | 2.00 GB |

Bitmap bad-behavior thresholds are greater than 200 MB at P90 for user-perceived services and background, and greater than 400 MB for cached state. Apps with more than 10 MB of DEX code also need at least 25% obfuscation, optimization, and shrinking from February 2027. Treat these as compliance guardrails; a lower product budget is still desirable for low-memory devices.

Source: [Play Console technical quality requirements](https://support.google.com/googleplay/android-developer/answer/17492799), especially “Reduced memory usage” and “DEX Code optimization”.

## Consolidated engineering guidance

### 1. Measure the right thing

- Use `adb shell dumpsys meminfo <package>` for a live breakdown. Track PSS for system snapshots, RSS for time-series tracking, USS for “what would be freed if the process died,” and SwapPss so zRAM is not missed.
- Inspect Anonymous RSS + Swap, Native Heap, Dalvik/Java Heap, graphics/DMA-BUF, bitmaps, and WebView/renderer processes separately.
- Establish baselines at cold start, after login, after each heavy journey, after leaving a journey, and after returning from background.
- Use Android Studio Memory Profiler and heap dumps for Java/Kotlin references; use Perfetto/heapprofd for native allocation call stacks and lifecycle-correlated spikes.
- Compare a clean heap snapshot with a post-journey snapshot. A growing retained object graph after navigating away is more actionable than a single high reading.

Sources: [Android memory concepts](https://developer.android.com/topic/performance/memory/guide/concepts), [quick assessment tools](https://developer.android.com/topic/performance/memory/guide/tools-overview), [Java memory analysis](https://developer.android.com/topic/performance/memory/guide/java-memory).

### 2. Treat bitmaps as a first-class budget

- Decode images close to their display size; do not load camera/library originals into list cards or avatars.
- Prefer `expo-image` for remote media because it uses native Glide/SDWebImage loaders and supports disk-only, memory-only, and memory-disk policies.
- Use disk caching by default for media that is not repeatedly visible in the same frame or screen. Use memory caching selectively for small, hot assets.
- Clear decoded image memory when the UI is hidden or when the app receives memory pressure. Preserve disk cache unless storage retention policy says otherwise.
- Avoid base64/data-URI images except for very small dynamic images.
- Give every image a bounded layout size and use stable recycling keys in virtualized lists.
- Treat animated images, large video frames, Skia surfaces, and camera/OCR buffers as high-risk allocations; release them when the owning screen unmounts or loses focus.

Sources: [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/), [React Native Images](https://reactnative.dev/docs/images), [Play bitmap guidance](https://support.google.com/googleplay/android-developer/answer/17492799).

### 3. Keep lists virtualized and bounded

- Use `FlatList`, `SectionList`, or the existing Legend/Flash list abstractions for unbounded data. Do not put growing feeds or comment histories inside a vertical `ScrollView`.
- Supply stable `keyExtractor`, lightweight memoized rows, bounded text (`numberOfLines` where the product permits), and fixed or predictable row geometry.
- Tune `initialNumToRender`, `maxToRenderPerBatch`, `updateCellsBatchingPeriod`, and `windowSize` from measurements on the target device tiers. Smaller windows reduce memory but can increase blanking or scroll work.
- Use `removeClippedSubviews` only after testing the affected screens; React Native documents correctness caveats.
- Avoid nesting same-axis virtualized lists and avoid creating large derived arrays on every render.

Source: [React Native FlatList](https://reactnative.dev/docs/flatlist) and [FlatList configuration](https://reactnative.dev/docs/0.74/optimizing-flatlist-configuration).

### 4. End work at lifecycle boundaries

- Cancel fetches, subscriptions, timers, animations, media playback, camera sessions, and WebView work when their screen or task ends.
- On background, stop work that does not serve a user-perceived service and release disposable decoded media.
- For Android-native memory pressure, respond to `ComponentCallbacks2.onTrimMemory()`/`TRIM_MEMORY_UI_HIDDEN` by dropping UI-only caches. Do not destroy durable user data or offline sync state.
- Keep background jobs short and bounded. Avoid retaining screen components, closures, Views, or Activities from singleton services.
- Destroy WebViews explicitly when their owning flow ends; profile the renderer process separately.

Sources: [Android memory allocation and low-memory handling](https://developer.android.com/topic/performance/memory-management), [WebView memory](https://developer.android.com/topic/performance/memory/guide/webview-memory).

### 5. Control code and dependency footprint

- Keep release builds minified/shrunk/optimized with R8 where compatible with Expo’s generated Android project and validate keep rules.
- Prefer platform or already-installed workspace capabilities over adding overlapping libraries.
- Measure DEX and native library changes in the uploaded App Bundle, not only in a development build.
- Keep startup work off the critical path; defer telemetry, nonessential warmups, and heavy parsing until after interactive content is ready.

Source: [Enable app optimization with R8](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization) and [Play DEX requirements](https://support.google.com/googleplay/android-developer/answer/17492799).

## Current Gurudevi assessment

### Existing strengths

- The app already detects a device memory tier and has a data/fidelity adaptation path.
- `expo-image` is installed and already used for `UserAvatar`.
- The repo has centralized lifecycle handling, offline storage retention, PowerSync, and media-download code that can become the ownership points for bounded caches.
- Many interactive rows are already memoized, and several surfaces use virtualized lists.

### Findings to resolve

- `UserAvatar` used `memory-disk`, which could retain decoded avatar bitmaps across screen changes. It now uses `disk`.
- The native app did not release the `expo-image` memory cache on background. It now calls `ExpoImage.clearMemoryCache()` when the app enters background.
- The generic UI `Image` wrapper still maps to React Native’s image component, so remote-image policy is inconsistent across `PostCard`, `CollectionCard`, and avatar variants.
- The repository has many `ScrollView` surfaces and several list wrappers without a measured low-memory configuration. Each needs journey-level profiling before global defaults are changed.
- There is no release-build memory budget test or automated Android `dumpsys meminfo` capture in CI.
- The existing device-tier fallback is conservative for feature fidelity, but it is not a measurement of current process memory and must not be used as a compliance metric.

## Guardrails for future changes

- Never use `expo install --fix` or `expo prebuild --clean` without explicit approval.
- Never hand-edit `android/` or `ios/`; use `app.json` or config plugins.
- Do not clear MMKV, SQLite, PowerSync, or offline queues as a memory shortcut. Durable data cleanup is a separate retention/consent operation.
- Do not add `useMemo`/`useCallback` mechanically; profile first and prioritize retained data, images, lists, WebViews, and native surfaces.
- Every optimization must report memory, cold-start, frame-time, and correctness impact on at least one 4 GB-class Android device.

## Source register

- Google Android Developers Blog, [Reducing memory usage and improving device migration](https://developer.android.com/blog/posts/elevating-app-quality-reducing-memory-usage-and-improving-device-migration), 2026-08-26.
- Google Play Help, [Play Console technical quality requirements](https://support.google.com/googleplay/android-developer/answer/17492799), accessed 2026-08-31.
- Android Developers, [Overview of memory management](https://developer.android.com/topic/performance/memory-overview), [Memory allocation among processes](https://developer.android.com/topic/performance/memory-management), and [Optimize app memory](https://developer.android.com/guide/topics/androidgo/optimize-memory).
- Android Developers, [Memory concepts](https://developer.android.com/topic/performance/memory/guide/concepts), [tools](https://developer.android.com/topic/performance/memory/guide/tools-overview), [Java memory](https://developer.android.com/topic/performance/memory/guide/java-memory), and [WebView memory](https://developer.android.com/topic/performance/memory/guide/webview-memory).
- Expo, [Image documentation](https://docs.expo.dev/versions/latest/sdk/image/), SDK 57 documentation.
- React Native, [Images](https://reactnative.dev/docs/images), [FlatList](https://reactnative.dev/docs/flatlist), and [FlatList configuration](https://reactnative.dev/docs/0.74/optimizing-flatlist-configuration).
