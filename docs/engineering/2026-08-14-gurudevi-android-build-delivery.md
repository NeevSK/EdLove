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

Result: failed during `Assemble release-mode APK` after approximately 4 minutes 54 seconds of Gradle execution. Checkout, pnpm, Node, Java, Android SDK, pinned NDK installation, dependency installation, mobile contract validation, and Expo native project generation all passed. GitHub exposed no Gradle log for the terminated step (`gh run view --log-failed` and the job log endpoint returned no blob), and the job metadata left the assembly step without a conclusion. Treat this as an abrupt runner/process termination until a subsequent run produces a compiler diagnostic; do not label it an application or Gradle source error from this evidence alone.

This run is important because it compiled the complete audited UI commit, not only the build workflow. It also consumed no EAS build. The next diagnosis should preserve the same commit and inspect runner termination/resource telemetry before changing application code or spending an EAS build.

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
