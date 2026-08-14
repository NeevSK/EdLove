# Gurudevi Android Build Delivery Plan

Date: 2026-08-14

Status: implemented in the repository; release signing remains approval-gated.

## Decision

Use three deliberately separate lanes:

```text
Pull request
  -> fast Quality Gate and workflow lint
  -> no native APK compilation

Manual pull-request/device build
  -> GitHub Ubuntu runner
  -> Expo prebuild --no-install
  -> Gradle assembleRelease with debug signing
  -> GitHub APK artifact

Preview/release build
  -> explicit manual GitHub dispatch
  -> only after GitHub APK/device gate is verified
  -> remote EAS isolated Android builder
  -> APK or AAB in EAS
```

This preserves EAS quota for builds that need EAS distribution or release signing. The GitHub artifact is release-mode code with the generated debug key, so it exercises more of the native/release path while consuming no EAS build.

## Findings and evidence

### GitHub exit 143

Runs 31706303096 and 31688457590 ended with exit code 143 and the runner message that it received a shutdown signal. The logs showed Gradle still compiling; this was not a compiler diagnosis. The previous workflow nested `eas build --local` inside a GitHub-hosted runner, creating a second temporary build environment. Swap, heap, and disk cleanup were reasonable experiments but cannot fix an externally terminated runner.

### Quality Gate startup failure

The Quality Gate referenced `secrets.DOPPLER_TOKEN` directly in step `if` expressions. GitHub does not permit secrets directly in `if`; the workflow therefore produced a failed check suite with zero jobs. The conditions now use the job environment variable instead.

### Windows native build path

The physical-device build encountered the Windows CMake/Ninja long-path class of failure. The supported local mitigation is a short pnpm virtual-store path and, when needed, an Android NDK symlink. This is a developer diagnostic tactic, not a reason to make Windows the CI builder.

### Signing credential exposure

A historical local-EAS GitHub Actions log contained serialized Android signing credential material. This was not treated as a Doppler token-printing claim: Doppler injects values into the process environment, but a downstream build command can serialize or print credentials. The local-EAS-in-GitHub architecture is therefore retired.

Treat the affected Android signing credential as potentially exposed. Do not paste the old log, credential payload, passwords, or encoded values into issues, commits, or new logs. Before a production build, determine whether the app is already published and whether Google Play App Signing is enabled. Rotate an upload key or plan the appropriate Play migration accordingly.

## Implemented changes

- `.github/workflows/android-build.yml` now builds a release-mode, device-installable APK directly with Gradle on Ubuntu using only the generated debug signing key. It contains no EAS token, Doppler token, production signing credential, or local-EAS invocation.
- The GitHub debug lane installs the repository-pinned NDK `27.1.12297006` before Gradle, making native toolchain selection explicit.
- `.github/workflows/eas-release.yml` is a manual, remote-only EAS trigger. It uses a protected `EAS_TOKEN` environment secret and returns quickly after dispatching the isolated EAS build.
- `.github/workflows/workflow-lint.yml` validates workflow syntax with actionlint whenever workflow files change.
- `.github/workflows/quality-gate.yml` uses environment variables for optional Doppler conditions, eliminating the invalid secret-context expressions.
- `apps/gurudevi-mobile/eas.json` pins the documented SDK 57 Android builder image and medium resource class for development, preview, and production profiles.

## Operating procedure

## Verification record

- Workflow syntax: passed local actionlint across every workflow file.
- `eas.json`: parsed successfully as JSON.
- Local Windows native verification was not treated as proof of CI readiness: this machine currently has no Java executable, no WSL installation, and no `act`/Docker runner emulator. The existing relocated workspace dependencies also fail Expo config resolution for `@expo/config-plugins`; that is a local dependency-layout issue and is not reproduced by a fresh CI install.
- The first authoritative APK verification must therefore be the GitHub Ubuntu workflow artifact, followed by installation on the physical Android device.

### Device APK

1. Open the `Android APK Build (GitHub)` workflow and run it manually, or let it run for a relevant pull request.
2. Download the `gurudevi-github-device-apk-*` artifact from the completed run.
3. Install it with `adb install -r app-debug.apk`.
4. Validate portrait and landscape, modal background blur, toast positioning, typography, font scaling, offline/error states, and accessibility.
5. Record the device model, Android version, commit SHA, APK run URL, and findings in the real-device validation runbook.

### First full-source GitHub attempt

Run: [31779380444](https://github.com/NeevSK/EdLove/actions/runs/31779380444)

Commit: `d47f9be1a3b0ca2fe4e3c5a47b9cf209ca0f7f85`

Result: failed during `Assemble release-mode APK` after approximately 4 minutes 54 seconds of Gradle execution. The attached GitHub UI evidence shows `System.IO.IOException: No space left on device` while the runner was writing its own diagnostic log under `/home/runner/actions-runner/_diag`. Checkout, pnpm, Node, Java, Android SDK, pinned NDK installation, dependency installation, mobile contract validation, and Expo native project generation all passed. This is a hosted-runner disk exhaustion failure, not an application or Gradle source diagnosis.

This run is important because it compiled the complete audited UI commit, not only the build workflow. It also consumed no EAS build. The workflow now reclaims unused preinstalled toolchains, disables large pnpm/Gradle cache restores for this artifact lane, and records disk usage before dependency installation and Gradle. If the standard runner still cannot complete, the next supported option is a larger GitHub-hosted runner or a dedicated Android builder; changing application code would be unrelated.

### Second full-source GitHub attempt

Run: [31780627576](https://github.com/NeevSK/EdLove/actions/runs/31780627576)

Commit: `1ef893df8dc9c9039c11b84ca89b15a803eb3f55`

Result: the disk fix worked. The runner reported `23 GB` available immediately before Gradle, and native compilation progressed for 34 minutes 22 seconds with 972 actionable tasks executed. The build then failed at `:app:createBundleReleaseJsAndAssets` because Metro rejected the missing `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The dependent Sentry upload task also failed with `No such file or directory` because the JavaScript bundle was never produced. This was a configuration/bootstrap failure, not a disk failure and not evidence that the native modules failed to compile.

The next workflow revision disables automatic Sentry artifact upload for this device APK lane and injects the two already-configured public Supabase values from repository secrets. The Doppler service token is not currently configured in GitHub, so this lane must not depend on it. Sentry sourcemap publication remains a separate explicit workflow concern.

### Third attempt: early configuration guard

Run: [31783622949](https://github.com/NeevSK/EdLove/actions/runs/31783622949)

Commit: `f4cc038042126896a996d8e27aac68db0b5f9cbf`

Result: intentionally stopped in 39 seconds at the runtime-configuration step because the repository has no `DOPPLER_TOKEN` secret. The token was empty and was not printed. This prevented another long native build with missing Metro inputs. Repository secret inventory confirmed that `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` already exist, so the workflow now uses those existing values directly and does not require Doppler for the device-artifact lane.

### Warning inventory from run 31780627576

| Class | Evidence | Disposition |
| --- | --- | --- |
| Kotlin configuration-check tasks marked `SKIPPED` | Repeated `checkKotlinGradlePluginConfigurationErrors SKIPPED` lines across Expo and native modules | Informational Gradle task status; do not treat the word `Error` in the task name as a build error. |
| Native C++ unused parameter/variable | `react-native-nitro-modules` `queueMutexLock`; `@op-engineering/op-sqlite` `errMsg` | Upstream warnings; track during dependency upgrades, but not a blocker for this APK. |
| Native C++ exception/deprecation warnings | `react-native-worklets-core` exception handler ordering; Expo/Nitro `RawPropsParser` deprecations | Upstream/new-architecture compatibility noise; verify after Expo/RN upgrades rather than patching generated or vendored code. |
| Android/Kotlin React Native API deprecations | `react-native-webview` `RCTEventEmitter` and event constructor warnings; NetInfo `onCatalystInstanceDestroy` removal warning | Dependency maintenance items. Pin compatibility is currently intentional; create upgrade follow-ups, not build-lane workarounds. |
| Gradle daemon performance logging notice | Suggestion to set `org.gradle.daemon.performance.disable-logging=true` | Low priority informational notice; unrelated to the failure. |
| Missing public runtime configuration | Metro error for the two `EXPO_PUBLIC_SUPABASE_*` variables | P0 build defect for any fresh CI checkout; fixed by loading the reviewed Doppler allowlist before prebuild/Metro. |
| Sentry upload with no bundle | `createBundleReleaseJsAndAssets_SentryUpload...` and `No such file or directory` after Metro failure | Secondary failure; automatic upload is disabled for the device lane, while explicit source-map upload remains separate. |

### EAS preview or release

Use `Android EAS Release Build` only after the GitHub APK has compiled and the device validation has passed. The workflow requires an explicit `github-apk-verified` confirmation. Select `preview` for an internal APK and `production` for a store AAB. The workflow must never be changed back to `--local`.

### Local Windows diagnosis

Keep the workspace virtual store outside the long project path, for example `C:\gd-pnpm-vs`, and use `expo run:android` or direct Gradle logs for diagnosis. Do not edit generated `android/` files and do not use `expo prebuild --clean` without explicit approval.

## Quality Gate policy

`--no-verify` only bypasses local Git hooks. It does not bypass GitHub Actions or required branch checks. The repository already has `pr-guard.yml` for the fast required lint/typecheck path. The former PR-triggered Quality Gate is now a scheduled/manual deep audit, so it does not duplicate the fast guard or interrupt every PR with API, coverage, security, and bundle work. Native APK compilation is removed from both quality workflows. Do not use bypassed commits as the normal delivery strategy.

## References

- [Expo EAS pricing](https://expo.dev/pricing)
- [Expo local builds](https://docs.expo.dev/build-reference/local-builds/)
- [Expo CI builds](https://docs.expo.dev/build/building-on-ci/)
- [Expo Android build infrastructure](https://docs.expo.dev/build-reference/infrastructure/)
- [Expo APK configuration](https://docs.expo.dev/build-reference/apk/)
- [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Doppler CLI](https://docs.doppler.com/docs/cli)
- [pnpm node_modules settings](https://pnpm.io/settings/node-modules)
- [Android build configuration](https://developer.android.com/build)
