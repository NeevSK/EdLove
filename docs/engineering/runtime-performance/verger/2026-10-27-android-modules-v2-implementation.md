---
title: "Verger's Android binding on Expo Modules API 2.0: implementation and acceptance evidence"
status: active
created: 2026-10-27
updated: 2026-10-27
author: Naveen
scribe: Codex
tags: [verger, android, expo-modules-v2, verification]
---

# State and isolation

**Naming (2026-10-29):** "v2" in this record means Expo's Modules API 2.0, which the Android binding was rewritten against. Verger itself is not versioned 2; its behaviour and JS API are unchanged by the rewrite.

**2026-10-29 update:** the rewritten binding (`VergerModule.kt`, `VergerModuleBindingTest.kt`, `build.gradle`, `expo-module.config.json`, README) was brought into the main checkout on `integrate/worlds-and-upstream` during Verger consolidation ([consolidation map](2026-10-29-consolidation-map.md)). The legacy DSL binding remains recoverable from `refs/codex-backups/verger-v2-before-20261027`. The statement below that C:/x retains the DSL binding describes 2026-10-27. The native compile and the 48 JVM cases have not been re-run in this checkout.

The v2 binding is implemented in the managed `verger-android-v2` worktree. C:/x retains the older DSL binding. No native client was replaced, and this candidate is not merged, pushed, or approved for rollout. There is one implementation per checkout and one Verger registration per compiled candidate, not a runtime selector or dual registration.

Preserved states:

- `refs/codex-backups/verger-v2-before-20261027`: `9f4fea4942b139204961d4ebcefe888aa140b460`, the pre-migration module/contracts and relevant dependency manifests.
- `refs/codex-backups/verger-v2-workspace-20261027`: `785958472d95a06d589224da85566a324e7c56d2`, the integrated workspace snapshot used as the worktree base, including the native test portability repairs described below.

Both are local recovery snapshots. The original index and branch were not staged or advanced by snapshot creation. Restore only scoped module files from the snapshot if needed; never reset unrelated main-checkout changes.

## Boundary changes

`VergerModule.kt` uses the SDK's v2 Module, @ExpoModule and @JS annotations. Nine functions retain their names, synchronous behavior and parameters. Capacity and exits remain methods, not cached constants. The eleven event names are explicit: the v2 compiler normally strips an `on` prefix, which would break existing JS subscribers. SenseEmitter routes the existing immutable map payloads to those events. Sampling, collectors, estimator, hardware levers, sensor precedence, policy and TS mapping remain unchanged.

Start now validates configuration before constructing a sensor; invalid configuration remains a synchronous exception and additionally cannot create a sampler thread. Stop remains a queued teardown request, not a synchronous completion acknowledgement. The v2 destruction hook invokes the existing sensor destruction path.

The activity provider captures ReactApplicationContext and asks for its current activity at use time. It does not capture an Activity. This matters because native teardown is queued and can run after the ExpoContext has closed. The binding therefore declares a compileOnly React Android dependency from the existing cohort, without changing versions or adding another runtime.

`expoModule { v2 true }` enables the real v2 compiler. Annotation-generated discovery replaces the legacy android.modules list; keeping the list would make the legacy provider try to register the v2 class as a DSL module. The shared JS wrapper and fallback behavior need no schema change.

## Native verification method

The separate WSL checkout contains older source and its own edits. It was not overwritten. Exact module sources and golden/JSON fixtures were staged into:

`/home/nsk/projects/verger-v2-verification-20261027/{baseline,candidate}`

A Gradle init file adds a `:verger-verification` project pointing to the selected staged module. It is guarded to apply only to the actual Android settings directory, not Gradle's included builds. The existing generated Android host provides the real dependency/plugin cohort. This proves module compilation and packaging; it does not prove the host app has autolinked the candidate into an installed APK.

Commands use the existing host Gradle wrapper:

```bash
ANDROID_HOME=/home/nsk/Android/Sdk ./gradlew \
  -I /home/nsk/projects/verger-v2-verification-20261027/candidate.init.gradle \
  :verger-verification:testDebugUnitTest :verger-verification:assembleDebug \
  --no-daemon --max-workers=2 --console=plain
```

The baseline uses baseline.init.gradle and compileDebugKotlin/testDebugUnitTest. Native dependency versions in the actual build: expo-modules-core 58.0.24, v2 plugin/runtime 0.2.5, Kotlin 2.2.10, KSP 2.2.10-2.0.2, compileSdk/targetSdk 37, minSdk 28, NDK 27.1.12297006. No signature stubs were substituted for the Expo binding.

Baseline discovery found three pre-existing test compilation failures: JSONObject.keySet is unavailable in the Android compile surface. The tests now enumerate keys() into a set. Every prior key-set and payload assertion remains. These portability repairs are in the main checkout too; its binding remains legacy.

## Evidence and limits

- G0/native Kotlin compiler and Gradle: legacy baseline and v2 candidate compile against the real native cohort; candidate debug AAR packages successfully. This is not an APK installation, JNI execution test, or R8 release proof.
- G1/G2/JUnit desktop JVM: baseline 42/42; candidate 48/48. The six binding cases inspect compiler-generated definition/discovery, nine synchronous methods and arities, nullable refresh release, all eleven wire names, the real map converter, unused stop/destruction, and synchronous rejection before sensor creation. Android framework/native runtime behavior is not exercised by these JVM cases.
- G0–G3/TypeScript, Vitest and React test engines: the isolated worktree's unchanged Verger gate completed with 517 cases and `ALL_PASS=1`, recorded in `reports/verger-v2-final-gate-isolated.log`. The first attempt (`verger-v2-final-gate.log`) hit a dependency-path resolution failure in vitest-native and was not accepted as green. An independent frozen-lockfile dependency layout fixed that tooling problem. These engines do not prove physical Android behavior.
- Existing Gradle warnings, including the host's ndk.dir warning and Gradle deprecations, remain visible. No native sensor or lint rule was suppressed by this migration.
- Repository checks: CNG, native-slop, version-drift and test-evidence classification completed successfully. `audit:device-evidence` also exited successfully, but inspection of its implementation shows that without `--fixture` it generates a claim from a built-in synthetic accessibility snapshot. That run supplies no physical-device evidence for this candidate; its generated claim was not retained. The broad `check:anti-slop` command stopped at Fallow (900 dead-code issues, 2074 complexity findings and 1773 clone groups across 8633 changed files against its configured merge base). That gate remains red; no threshold, exclusion or test was weakened.

Logs include `verger-v2-baseline-gate.log`, `verger-v2-native-baseline.log` (initial test compile failures), `verger-v2-native-baseline-fixed.log`, `verger-v2-native-candidate.log`, `verger-v2-native-binding-tests-final.log`, `verger-v2-native-acceptance.log`, and the final gate. Native compiler and test diagnostics from intermediate attempts are retained.

## Physical A52 verification, 2026-10-27

The complete client built successfully in WSL: `:app:assembleDebug`, arm64-v8a, debug signing, 19m 12s, 1403 actionable tasks. Its application ID is `app.gurudevi.sanctuary.vergerv2.dev`; the original `app.gurudevi.sanctuary.dev` remains installed alongside it. No original app data was cleared or replaced. The APK is retained at `/home/nsk/projects/verger-v2-verification-20261027/client/apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk` and the Windows temporary copy is `C:/Users/Naween/AppData/Local/Temp/verger-v2-a52-debug.apk`.

- APK SHA-256: `1CB4750F3C45826E3BEA96F8C574A1AE7CA4D0179ADF39CE403C27F366A6B50B`.
- VergerModule.kt SHA-256, identical in candidate and Linux build: `7D653AE9189904CF98D8BC78E8C0C81ED48A2E4C9A0CC125056C841E7642E60F`.
- Re-running native JUnit through the complete client's actual `:repo-verger-android:testDebugUnitTest` graph: 48 tests, zero failures/errors/skips; log `reports/verger-v2-complete-client-junit.log`. This remains G1/G2 JVM evidence, separate from the physical observations below.

G5/physical Samsung SM-A525F, Android 14/API 34, actual Hermes, Argent CDP and ADB:

| Check | Observed result | Limit |
| --- | --- | --- |
| Registration and wrapper | Native Verger exists; all nine methods are functions; `isVergerAndroidAvailable()` is true after reload; wrapper frame totals work | One compiled debug client |
| Synchronous reads | PID 8830, exit-history array, capacity and totals returned directly; total memory 7,852,994,560 bytes, 8 CPU cores, SDK 34 | Capacity is a reading, not calibration |
| Events | All eleven channel names accept subscriptions with removable handles. Frames, thermal, trim, power, threads, memory, network, battery, data usage and lever payloads were observed | CPU headroom requires API 36 and was not observable on this phone |
| Battery and network | Battery 32°C matches `dumpsys battery` temperature 320; Wi-Fi validated, unmetered, Data Saver disabled | No airplane-mode or network-handoff experiment |
| Validation | Missing windowMs, NaN, zero and negative values throw synchronous JS exceptions | Does not exhaust every malformed payload |
| Start and stop | Repeated start keeps one sensor thread. Repeated stop, after a 500ms settling interval, produced stable sensor counts and frame totals over 2500ms; restart resumed readings | Stop is still queued, not an acknowledgement API |
| Background/foreground | Settled background counts and totals stayed stable; foregrounding resumed thread readings | Does not force a null Activity or prove all recreation paths |
| Sensor switches | All six native sensors disabled: no frame/thread callbacks during the observation window | Cold floors-only and kill-switch startup remain separate checks |
| Unsubscribe | Ten sensor subscriptions and one lever subscription removed; restart/emission produced no further diagnostic callbacks | Bounded observation, not a concurrency proof |
| Refresh cap | 60 Hz request reported applied with modeId 2; null release reported applied with modeId 0 | No sustained display/performance comparison |
| CPU boost | True and false calls returned lever reports with applied=false | Positive hint-session creation and release are unverified |
| Reload | Two deliberate CDP reloads recovered native lookup in the same PID. Old diagnostic globals disappeared. Sensor TIDs 10206 → 10970 → 11299, with one VergerSense thread at each settled inventory | No heap-retention or exhaustive queued-destruction proof |
| Callback duplication after reload | A uniquely tagged refresh request produced exactly one matching callback | One request in the final reloaded runtime |

Raw accepted observations and limitations: [physical device record](../../../../reports/device-evidence/verger-v2-a52-20261027.json). No external network/storage replacement was used for those native calls. The injected diagnostics were transient debugger globals and subscriptions; reload cleared them, and the final probe subscription was explicitly removed. No product debug route or runtime selector was introduced.

### Diagnostic failures and unresolved app findings

The first loop-created debugger callbacks all attributed their events to the last loop variable. A raw eval closure probe returned `b,b` for callbacks created over `a,b`; these initial per-channel counts were discarded. Literal callbacks and per-call parameter closures then confirmed correct native channel routing. This was a probe defect, not evidence of a binding defect.

An early stop observation was interrupted by a runtime reset during manual navigation. Its cause was not established and that observation was not accepted. The subsequent uninterrupted timed stop probe and two deliberate reloads are the accepted evidence. The first evaluation attempted during reload briefly hit an unavailable runtime; reconnect/status and a later evaluation confirmed recovery. No candidate AndroidRuntime/Expo native exception was observed in the scoped log queries. This is not proof that no failure can occur.

The running app repeatedly logs a missing queryFn for `['capability', 'entitlement', 'disabled']`. The source seam is `packages/core/src/hooks/useEntitlementQuery.ts:198`: the no-identity fallback supplies a query key and enabled=false but no query function. This code is present in the integrated baseline and was not changed by the binding migration. It needs a separately verified disabled-query treatment against installed @tanstack/react-query 5.104.5. React Native CSS also warns about late variable changes remounting children. These findings prevent an unqualified whole-app/World UI sign-off; they were not hidden or fixed by changing Verger policy.

Development frame traces include stressed windows and substantial startup work. The process used roughly 1.4–1.6 GB RSS during debugging. These are diagnostic observations under a large development bundle, logging and debugger activity, not production budgets or proof of a migration regression. No threshold or sensor cadence was tuned from them.

## Remaining acceptance gates: keep main on legacy

1. Complete development client and live Hermes lookup/subscription checks are met on the A52. Compiler hints include the single Verger class, and the actual app wrapper resolves it. Other Android/API combinations remain unverified.
2. Repeated start/stop, background/foreground, subscription removal and two active-sensing reloads were observed as above. Still verify forced no-current-activity, activity recreation, positive CPU-session teardown, heap/Activity retention and adverse queued-destruction timing. One settled thread per inventory is useful evidence, not a general leak proof.
3. Native sensor disablement was observed. Still verify cold floors-only/off and kill-switch startup touch no sensors; clients missing the module keep the JS fallback. Compare native/JS sensor precedence and unknown values end to end through host snapshots and UI/workload consumers. Existing boundary tests are not physical proof of these cold-start paths.
4. Compare equal workloads with the old build on a lower-memory and a normal phone: event cadence, queue lag, allocations, thread CPU, wakeups and frame behavior. No new budgets or sampling frequency were introduced. Native v2 microbenchmarks are not app-level performance proof.
5. Verify release shrinking/registration separately before production adoption. A native binding change requires a new binary and compatible runtime/fingerprint delivery; an OTA update cannot install it.

The A52 debug smoke checks are recorded, but full migration qualification and production acceptance remain open. The runtime kill switch is not a substitute for rollback from native registration failure. Rollback retains the old binding and native build; do not merge the candidate merely because these bounded checks are green.

## Complete client staging

The full integrated workspace snapshot was extracted into `/home/nsk/projects/verger-v2-verification-20261027/client`, overlaid with the candidate module, and installed with the frozen lockfile. A verification-only app-config package override uses `app.gurudevi.sanctuary.vergerv2` (debug suffix `.dev`) to preserve the existing development app and its data. This override is not a product configuration change.

Fresh prebuild exposed ignored inputs already referenced by app.json: three config plugins (withProfileableBuild, withGradleWrapperVersion and withSubprojectsBuildConfig) and splash-poster-line-draw-transparent.png. The candidate preserves the exact original files from C:/x and adds narrow ignore exceptions so a clean checkout includes them. No plugin behavior or artwork was recreated. Prebuild with `--no-install --no-clean --platform android` then completed without manifest dependency changes. The complete debug APK subsequently built and was installed under the separate package ID above.

The first complete build then exposed another ignored baseline input: react-native.config.js. Its existing configuration excludes the @shopify/react-native-skia alias from native autolinking while retaining react-native-skia. Without it the same physical package is linked as two Gradle projects sharing generated output, and Gradle 9.4.1 rejects the implicit task dependency. The candidate preserves that original file byte-for-byte and explicitly includes it in Git; neither JavaScript import alias nor Skia functionality is removed. This follows [Expo's autolinking configuration](https://docs.expo.dev/modules/autolinking/). The failed attempt is retained in verger-v2-client-apk.log.

The regenerated autolinking graph contains only react-native-skia. Full app Kotlin and Java compilation, including repo-verger-android, completed before native C++ packaging. Metro initially failed on the ignored mascot assets imported by mascotArtwork.ts. The candidate restores precisely its 17 existing imported images plus the existing garden/dance preview assets imported by source routes; narrow asset-directory ignore exceptions preserve those build inputs. No imagery was generated or changed. G4/Metro Android development bundle: 7597 modules, 50,467,635 bytes, served successfully after restoring these inputs. It is development JavaScript targeting Hermes, not an exported HBC release artifact or evidence of native execution.

## Exact API grounding

The SDK's installed expo-application 58.1.2 supplies the Android annotation/Gradle reference. Source at [v0.2.5](https://github.com/expo/expo-modules-v2-android/tree/v0.2.5) establishes event scheduling, map conversion, context closure and discovery. Event emission is allowed from any thread; payload conversion occurs on the receiving JS thread, so payloads must not mutate after emission. Existing Verger payload construction was inspected for this constraint. The upstream source confirms addListener/remove behavior, but that is supporting evidence, not execution of our app.

[The plan](2026-10-27-android-modules-v2-plan.md) remains the acceptance contract. New sensors, World migration, device calibration and policy tuning are separate work.
