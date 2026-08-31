# Gurudevi memory-efficiency implementation plan

Status: active plan  
Created: 2026-08-31  
Related guidance: [memory-efficiency-guidance.md](./memory-efficiency-guidance.md)

## Goal

Reduce avoidable Anonymous RSS + Swap and bitmap memory, improve background survivability on 4–8 GB Android devices, and prepare the mobile app for Google Play’s announced February 2027 memory and DEX quality thresholds.

## Relationship to the shared capability architecture

Memory adaptation is enforced through the visual-capabilities track for UI effects and image delivery, and through the operational-efficiency track for cache writes, storage maintenance, and background work. The tracks share runtime facts but do not share visual decisions with storage/network workers. See [adaptive-visual-capabilities-integration.md](./adaptive-visual-capabilities-integration.md).

## Completed in this change

1. Changed `packages/ui/src/components/UserAvatar.tsx` from `memory-disk` to `disk` image caching. This prevents decoded avatar bitmaps from becoming a long-lived memory cache while retaining disk reuse.
2. Added native-app background handling in `apps/gurudevi-mobile/app/_layout.tsx` to call `ExpoImage.clearMemoryCache()` when the UI is hidden. The disk cache and durable app data remain intact.
3. Added the consolidated evidence-based guidance document and this implementation plan.

## Phased work

### Phase 0 — Baseline and instrumentation

Owner: mobile platform  
Exit criteria: repeatable measurements for release builds on 4 GB, 6 GB, and 8 GB Android devices or equivalent emulators.

- Record `dumpsys meminfo -s` and full `dumpsys meminfo -a` at cold start, authenticated home, library browsing, community feed, media viewer, OCR/PDF flow, video flow, and after background/foreground.
- Capture Android Studio heap dumps after navigating away from each heavy flow.
- Capture Perfetto/heapprofd traces for native spikes and correlate them with image decode, Skia, video, SQLite/PowerSync, and WebView activity.
- Record P90-style internal budgets by device tier. Start with guardrails below Google’s thresholds, then tune using real production data.
- Add a release-build checklist to the Expo build runbook; do not treat development memory as production evidence.

### Phase 1 — Image and media ownership

Owner: UI/media  
Exit criteria: all remote image classes have an explicit cache policy, bounded display dimensions, and lifecycle ownership.

- Inventory `PostCard`, `CollectionCard`, `AvatarImage`, `UserAvatar`, hero artwork, OCR input, PDF generation, video thumbnails, and Skia surfaces.
- Migrate remote list/card images to `expo-image` where platform support is confirmed, using disk-only caching by default and stable `recyclingKey` values.
- Pass server-generated thumbnail URLs or image transformation parameters sized to the rendered surface; avoid downloading originals for cards.
- Bound upload/OCR/PDF source images before decode or processing; never keep the picker’s full-resolution original in React state after the operation completes.
- Stop video playback and release player references when screens lose focus; profile the video cache separately from bitmap memory.

### Phase 2 — Lists and screen lifetime

Owner: feature teams with UI review  
Exit criteria: heavy journeys remain bounded as item count grows and do not retain prior screens.

- Replace same-axis growing `ScrollView` feeds with virtualized lists.
- Tune list window/batch properties per screen using blanking, frame time, and memory measurements; do not apply one global configuration blindly.
- Memoize row components only when profiling shows parent updates are expensive; keep row props stable and avoid inline object/array churn for large lists.
- Audit Expo Router screen retention, modal stacks, navigation listeners, and route-scoped stores for references to previous screens.
- Cancel requests and timers at unmount/focus loss using the existing lifecycle and abort helpers.

### Phase 3 — Memory-pressure response

Owner: mobile platform  
Exit criteria: UI-only caches are released at Android memory-pressure callbacks without data loss or user-visible corruption.

- Add an Expo config plugin/native module boundary for Android `ComponentCallbacks2` only if JS `AppState` background handling is insufficient in measurements.
- Route `TRIM_MEMORY_UI_HIDDEN` and higher trim levels to image memory clearing, disposable screen caches, and nonessential prefetch cancellation.
- Keep MMKV, SQLite, PowerSync, offline queues, and security state untouched by memory trimming.
- Add instrumentation counters for trim events and the cache actions taken, with privacy-safe aggregate telemetry only after consent.

### Phase 4 — Code and bundle footprint

Owner: release engineering  
Exit criteria: uploaded AAB reports acceptable DEX optimization and no regression in startup or native size.

- Inspect current Expo Android release configuration and R8 status in the generated release bundle.
- Verify shrinking, obfuscation, and optimization coverage in Play Console Bundle Explorer; preserve required keep rules for Reanimated, Skia, Nitro, Stripe, Sentry, and generated modules.
- Use R8 Configuration Analyzer for unexpected keep rules and large DEX contributors.
- Defer nonessential initialization already identified in the boot path and verify that deferred work does not accumulate after repeated foreground/background cycles.

### Phase 5 — Production monitoring and regression gates

Owner: release engineering + observability  
Exit criteria: memory regressions are detected before broad rollout.

- Monitor Play Console Android vitals memory metrics by app state, RAM tier, Android version, and release.
- Query the Play Developer Reporting API when access is available; retain a release-over-release P90 report.
- Add a pre-release device matrix covering cold start, navigation loops, media flows, background/foreground, and low-memory stress.
- Gate rollout on no new OOM/LMK-related crashes, no sustained bitmap growth after background, and no unacceptable startup/frame-time regression.

## Proposed internal budgets

These are working targets to validate in Phase 0, not claims about current performance.

| Measurement | 4 GB-class device target | 6–8 GB device target |
| --- | ---: | ---: |
| Background bitmap memory at settled state | < 50 MB | < 75 MB |
| Memory increase after 10 navigation loops | < 10% | < 10% |
| Post-background memory recovery | Return within 10% of pre-journey baseline | Return within 10% of pre-journey baseline |
| Full-resolution media retained after flow exit | 0 | 0 |

The final budgets must be based on release-build evidence and product-critical journeys. Google’s P90 thresholds remain the external compliance ceiling, not the desired everyday target.

## Verification commands

On an Android device with the release build installed:

```text
adb shell dumpsys meminfo org.edlove.gurudevi
adb shell dumpsys meminfo -s org.edlove.gurudevi
adb shell am force-stop org.edlove.gurudevi
adb shell am start -W -n org.edlove.gurudevi/.MainActivity
```

For Java heap analysis, use a profileable/debuggable build and `adb shell am dumpheap -g -b png ...`; for native allocation call stacks and lifecycle correlation, use Perfetto/heapprofd.

Repository checks for the first implementation slice:

```text
pnpm --filter @repo/ui check-types
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test
pnpm --filter gurudevi-mobile exec tsc --noEmit
```

Run the repository anti-slop gate before merging any broader optimization batch:

```text
pnpm run check:anti-slop
```

## Risks and decisions

- Clearing image memory on background can increase decode/network work after resume. Disk caching keeps the tradeoff bounded; measure resume latency and network traffic before expanding the policy.
- `removeClippedSubviews` can cause missing-content bugs according to React Native documentation, so it must be screen-tested rather than enabled globally.
- R8 changes can break reflection-heavy native packages. Analyze and test the uploaded AAB, preserving explicit keep rules.
- Memory optimization must not delete durable offline data. Storage retention and memory pressure are separate policies.
- Native Android callbacks belong in a config plugin/native module, never in hand-edited `android/` files, because this repo regenerates native artifacts.

## Decision log

- 2026-08-31: Adopted disk-only caching for `UserAvatar` remote images.
- 2026-08-31: Added `expo-image` memory-cache clearing on native background transition.
- 2026-08-31: Deferred global list tuning, native `onTrimMemory`, R8 changes, and broad image migration until baseline measurements exist.
