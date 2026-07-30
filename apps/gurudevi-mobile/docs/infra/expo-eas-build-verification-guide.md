---
title: "Expo, EAS, and GitHub Build Verification Guide"
status: "active"
created: 2026-07-16
updated: 2026-07-16
author: "Naveen"
scribe: "Codex"
tags: [expo, eas, android, github-actions, ci, dependencies]
---

# Expo, EAS, and GitHub Build Verification Guide

This is the repeatable verification path after upgrading Expo-related packages, Gluestack, React Native Gesture Handler, or other native dependencies.

The checks become progressively more expensive:

```text
Expo config → Metro production bundle → native Android compile → EAS cloud build → GitHub runner build
```

`expo-doctor` is useful diagnostic information, but it is not proof that the native app will compile. A package can be outside Doctor's expected version matrix and still build successfully; conversely, a clean Doctor result does not test every native plugin or Gradle interaction.

## Project facts

- App directory: `apps/gurudevi-mobile`
- Package manager: pnpm
- Node version: `.nvmrc` (`24.15.0`)
- EAS profiles: `development`, `preview`, and `production`
- GitHub build workflow: `.github/workflows/android-build.yml`
- The workflow supports both remote EAS builds and local Android builds on Ubuntu runners.

## Why some Expo checks are excluded

This repo already uses two different Expo-related exclusion mechanisms:

- `expo.doctor.reactNativeDirectoryCheck.exclude` is for packages that should stay in the app even if React Native Directory does not have complete metadata yet.
- `expo.install.exclude` is for packages that you intentionally want Expo's version-checking commands to stop warning about.

The current exclusions are deliberate runtime or native integration packages. They are not a signal that the package is broken; they are a signal that the repo owner chose to trust the package despite Expo not being the source of truth for that one check.

TypeScript 7 is different. It can be added to `expo.install.exclude` if we intentionally want to silence Expo's version checks, but that also hides a useful compatibility warning. Since this repo is explicitly testing TS7, the safer default is to keep the warning visible and document the decision rather than suppress it silently.

## Low-bandwidth verification

Run these first. They use the existing `node_modules` and do not reinstall packages:

```powershell
cd C:\Users\Naween\projects\polymath-platform

pnpm --filter gurudevi-mobile exec expo config --type public
pnpm --filter gurudevi-mobile exec expo config --type prebuild
pnpm --filter gurudevi-mobile run check-types
pnpm --filter gurudevi-mobile run lint
pnpm --filter gurudevi-mobile run expo:doctor
```

`expo-doctor` is installed as a pinned app development dependency, so this command does not download the tool on every run.

If the config commands fail, fix `app.json`, package/plugin resolution, or config plugins before attempting a build.

## Current verification snapshot

As of this pass:

- `pnpm exec tsc --build --noEmit` completed successfully with TypeScript `7.0.2`.
- `pnpm exec expo config --type prebuild` completed successfully.
- `pnpm exec expo-doctor . --verbose` reported real upgrade drift, not a fatal config crash:
  - Metro config mismatch for `resolver.disableHierarchicalLookup`
  - duplicate native module installations in the workspace
  - many Expo SDK 57 packages are still behind the versions expected by the installed SDK
- `pnpm exec expo export:embed` did not finish inside the local timeout, so the production bundle check still needs a longer local run or a CI-runner pass.

That mix means the app is not “fully clean” yet, but we do have proof that the TypeScript 7 compiler path and the Expo config path are both functioning.

## Production JavaScript bundle check

This validates Metro resolution, imports, aliases, web/native shims, minification, and the production entrypoint without compiling Android:

```powershell
cd apps/gurudevi-mobile
New-Item -ItemType Directory -Force .tmp | Out-Null

pnpm exec expo export:embed `
  --platform android `
  --entry-file index.ts `
  --bundle-output .tmp/index.android.bundle `
  --sourcemap-output .tmp/index.android.bundle.map `
  --dev false `
  --minify true
```

The repository's Sentry workflow performs the same type of Metro production bundle check on GitHub.

## Native Android verification

When Android Studio, the Android SDK, Java, and an emulator/device are already installed:

```powershell
cd apps/gurudevi-mobile
pnpm exec expo run:android
```

This is the best local check for native compilation and runtime behavior. It does not require downloading dependencies again if the local environment is already prepared.

For config-plugin changes, inspect the evaluated prebuild configuration first:

```powershell
pnpm exec expo config --type prebuild
```

Use `EXPO_DEBUG=1 expo prebuild --clean --platform android` only when regeneration is required. `--clean` deletes and recreates generated native directories, so commit or back up native changes first.

## EAS cloud build

This is the most representative test of what Expo's build service will produce:

```powershell
cd apps/gurudevi-mobile
pnpm exec eas build --platform android --profile preview --non-interactive
```

Use the production profile only when production credentials, environment variables, and versioning are intentionally being tested:

```powershell
pnpm exec eas build --platform android --profile production --non-interactive
```

Do not use `--local` as the default Windows test. EAS local builds are officially supported on macOS/Linux; Windows can use WSL, but it is not officially supported. The cloud build is the safer final check.

## GitHub runner verification

Open the Android Build workflow manually in GitHub Actions and select:

- platform: Android
- profile: `preview`
- build method: `local` to test the Ubuntu runner's native build, or `remote` to trigger EAS cloud build

The GitHub workflow installs dependencies and runs the build in a clean environment, which catches missing files, undeclared dependencies, lockfile problems, and CI-only configuration errors.

Before relying on this workflow, align its pnpm version with the repository. The root `package.json` declares pnpm `11.13.0`, while some workflows currently install pnpm `11.9.0`. Different pnpm versions can produce different dependency resolution behavior.

## Recommended order after a dependency upgrade

1. Run the low-bandwidth checks.
2. Run the Metro production bundle check.
3. Run `expo run:android` if the Android toolchain already exists locally.
4. Run one EAS cloud `preview` build.
5. Run the GitHub workflow when a clean-runner proof is required.

The mobile typecheck uses the repository's TypeScript 7.0.2 and the `tsc` command. Stable TypeScript 7 uses `tsc`; `tsgo` was tied to older native-preview tooling and is not installed in this repository. Expo Doctor still expects the SDK 57 TypeScript line, so it will continue to warn until the repo is aligned back to Expo's expected versions or the warning is intentionally accepted.

Avoid `pnpm install` unless `node_modules` is missing, the lockfile changed, or the current install no longer resolves the updated packages. If installation is required, use the lockfile-preserving command:

```powershell
pnpm install --frozen-lockfile
```
