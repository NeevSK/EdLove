---
title: "Agent-Native Mobile Development Workflow"
status: "active"
created: 2026-10-16
updated: 2026-10-16
author: "Polymath Platform"
tags: [expo, agents, codex, mobile, device-testing, cloud-builds]
---

# Agent-Native Mobile Development Workflow

This runbook connects Expo guidance, the repo's device tooling, Codex actions, Android verification, and the existing cloud build paths. It applies to `apps/gurudevi-mobile`; it does not change the app's native dependency pins.

## Available in this workspace

- The project has Expo Skills in `.agents/skills/`. For Expo tasks, load `expo-overview` first and follow its router to the focused skill. The root `AGENTS.md` covers reloading skills after context compaction or handoff.
- Expo skills are present in the repository under `.agents/skills/`. The official Expo Codex plugin is installed from `openai-curated`; fully restart Codex Desktop to load its skills and Expo MCP server.
- The mobile app pins `@expo/agent-cli` `1.0.19` and `eas-cli` `25.0.0`; `eas.json` enforces EAS CLI `25.0.0`. `expo-agent-cli status --json` recognizes this as Expo SDK 58, a CNG app requiring a development build, and Codex package skills are synced by `expo-agent-cli skills:sync --agent codex`.
- `agent-device@0.21.28` is already a dependency of `@repo/platform-mcp`. A user-level Codex MCP entry named `agent-device` points to that workspace package. The WSL install currently resolves 0.21.28. Restart Codex Desktop after MCP configuration changes. The executable and version-matched usage guidance are available with:

  ```powershell
  pnpm --filter @repo/platform-mcp exec agent-device --version
  pnpm --filter @repo/platform-mcp exec agent-device help workflow
  pnpm --filter @repo/platform-mcp exec agent-device doctor
  ```

- Software Mansion Argent is a separate device MCP server, pinned as `@swmansion/argent@0.29.0` by `@repo/platform-mcp`. The Windows Codex config starts its stdio server inside the Ubuntu WSL checkout (`pnpm --filter @repo/platform-mcp exec argent mcp`) so device discovery and interaction use WSL's ADB/SDK. Restart Codex Desktop after the MCP entry is added. In the MCP tool list, use `argent`'s `list-devices` and then the live schemas for `describe`, `debugger-component-tree`, gestures, screenshot, recording, or profiling. The React Native component tree requires a running app with its debugger connected to Metro.

- Keep the roles distinct: direct Callstack `agent-device` is the general agent interaction surface; direct SWM Argent provides its richer native/RN inspection and profiling tools; `sovereign_device` is the repo gateway's smaller curated adapter. Its `params.tool = "argent"` branch does not expose the full Argent tool server.

- The WSL Ubuntu checkout has Android platform-tools and sees the connected Galaxy A52 (`R58T33Y0E3M`, Android 14) through both Callstack `agent-device` and Argent `list-devices`. Argent reports no configured AVDs. The Windows host and WSL have separate SDK/device discovery; use WSL for Android builds and the connected device workflow. iOS simulator/device tooling requires macOS.
- The repo's `sovereign_device` gateway is a separate, narrower adapter. Its contract is in `packages/platform-mcp/src/services/DeviceService.ts`; use the upstream `agent-device` CLI help for the CLI and the gateway implementation for adapter calls.
- Codex project actions are defined in `.codex/environments/environment.toml`. From this app directory, Codex exposes **Run**, **Run Android**, and **Expo Doctor**. The run script keeps Metro in the foreground and injects existing Doppler values; it does not store secrets in action configuration.

## Local agent loop

1. Build and install a development client on the Android device/emulator if one is not already installed. The existing `pnpm run build:dev` command in this app submits an EAS development build and requires EAS/Doppler access.
2. In Codex, open the `apps/gurudevi-mobile` project and start **Run** (or **Run Android** when the emulator is running). The matching shell commands are:

   ```powershell
   cd apps/gurudevi-mobile
   bash ./script/build_and_run.sh --dev-client
   # Or launch the Android target as well:
   bash ./script/build_and_run.sh --android
   ```

3. Ask Codex to use `agent-device` to open the installed app, inspect `snapshot -i`, interact with current refs/selectors, verify the requested visible state, capture focused screenshots/logs if useful, and close the session. Use `agent-device help debugging` or `help react-devtools` only when the task needs those capabilities.
4. For cloud device providers, inspect `agent-device help remote` first. `connect` checks provider access and records a local profile; providers can create billable sessions when a device is opened. Keep provider credentials in the approved secret manager or user environment, never in the repo. Always close the session and disconnect when finished.

The Codex Run actions are an app-local startup convenience. They do not replace the `agent-device` verification step, and they do not claim a flow was tested until an agent observed its resulting state.

## Codex Mobile Dev plugin

Callstack's Mobile Dev plugin is a separate Codex desktop application plugin with device panels, accessibility inspection, logs, and performance displays. Its current prebuilt plugin targets **Apple Silicon macOS**. It is not supported on this Windows host, so it has not been installed here. On a supported Mac, the upstream installation instructions are:

```sh
codex plugin marketplace add https://github.com/callstackincubator/codex-mobile-dev-plugin.git --ref release/latest
codex plugin add mobile-dev@mobile-dev
```

The repo remains usable on Windows with the `agent-device` CLI/MCP and Android SDK. When a supported Mac is available, Mobile Dev can be added as an optional device UI; do not make core workflow steps depend on it.

## Cloud build paths already configured

- **GitHub Android APK:** `.github/workflows/android-build.yml` builds an APK on PRs that touch app/workspace files and can be dispatched manually. It runs the bundle and mobile contract checks before generating a temporary native project and assembling the APK. The uploaded artifact is retained for seven days.
- **EAS cloud build:** `apps/gurudevi-mobile/eas.json` defines `development`, `preview`, and `production` profiles. Use the existing scripts (`pnpm run build:dev`, `pnpm run build:preview`, or `pnpm run build:prod`) from this app directory when an EAS build is intended. EAS Build has a limited monthly free quota; check the Expo account's current billing/usage before repeated builds.
- **Gated Android EAS release:** `.github/workflows/eas-release.yml` has a manual dispatch for preview or production and requires the explicit `github-apk-verified` gate. It needs `EAS_TOKEN` in the selected GitHub environment. Keep this release path gated; do not add an always-on production build action to Codex.
- **Build image alignment:** all three Android profiles use Expo's SDK 58 Android image, matching the app's Expo SDK 58 baseline.
- **iOS builds:** EAS profile commands exist, but iOS runtime verification and the Callstack Mobile Dev plugin require macOS tooling. The GitHub EAS release workflow currently triggers Android only.

The EAS build workflow is already the primary cloud path. The project also has a GitHub Actions Android builder, so a third build provider is not needed for basic coverage. The pasted `@react-native-feel/deploy` suggestion is a new third-party wrapper rather than an Expo-maintained service; it is not installed or trusted with store credentials here. Revisit it only after checking its current source, release, permissions, and whether it actually lowers cost for this repo.

## Expo Simulators / remote EAS devices

Expo currently labels EAS Simulators as an experimental, limited-access preview. It is separate from ordinary EAS Build availability. The global EAS CLI was updated to `25.0.0`; `eas simulator:availability --json` returned `available: false` for the linked Expo account. This reports preview eligibility only; it did not start a simulator session or build.

The workspace uses a **24-hour** `minimumReleaseAge: 1440` package quarantine, not 12 hours. It applies to pnpm installs and `pnpm dlx`; it does not prevent using the separately installed global CLI. Keep the quarantine intact. The existing GitHub EAS workflow already uses `eas-version: latest`.

Do not start a simulator session or submit a build just to check eligibility. If access is granted later, follow the current Expo `eas simulator:start` and `agent-device help remote` documentation; session duration, features, and billing/preview limits can change.

## Items from the shared stack note

| Item | Current disposition |
|---|---|
| Expo Skills | The official Expo Codex plugin is installed; restart Codex Desktop to load it. These skills are not SDK-58-exclusive; load `expo-overview` and its focused router skill for Expo work. |
| Expo MCP | Registered by the Expo Codex plugin after Codex Desktop restarts. |
| `@expo/agent-cli` | Experimental Expo SDK 58-era agent CLI, pinned at `1.0.19`. It recognizes the app as SDK 58. `dev --android` can choose local compilation or an EAS Simulator flow; inspect `--plan` first. Current EAS Simulator access is unavailable, and local emulator/system-image setup is incomplete. Do not use a plan that would build on Windows contrary to the repo's Android build workflow. |
| Callstack `agent-device` | Already installed as a workspace dependency, documented by CLI help, and registered as a Codex MCP server. It is the general device interaction layer once an emulator or physical device is running. |
| Software Mansion Argent | Pinned at `@swmansion/argent@0.29.0`; its direct MCP server is configured to run in WSL alongside `agent-device`. Use for native/RN inspection, gestures, recording, and profiling; restart Codex Desktop to load the added MCP server. |
| Callstack Codex Mobile Dev plugin | Real, but Apple Silicon Mac only. Optional; not compatible with this Windows workstation. |
| Callstack Agent Skills plugins | The official **Testing React Native Apps** Codex plugin is installed. Use its agent-device / React Native QA / GitHub Actions skills alongside the `agent-device` runtime. Its instructions are upstream-owned; the repo's platform boundaries, evidence gates, and existing GitHub workflow remain authoritative. |
| Callstack `pkg-skills` | Dependency-based skill recommender is available, but it installs/removes skills using its own mapping and pruning model. Do not run its auto/prune mode against this curated monorepo skill catalog without a scoped integration review. |
| Apex model | Do not depend on a limited-access model offering for repo workflows; the current general Codex/Expo tool loop already has portable paths. |
| Expo Simulators | Experimental limited-access preview. Check eligibility before using; not assumed available or free. |
| EAS Build | Already configured for development, preview, and production. EAS offers a limited free quota; costs/quotas must be checked in account billing. |
| React Native Deploy | Not adopted. It is a third-party project and not needed beside the existing GitHub Android builder and EAS path. |
| Other community GitHub build scripts | Not adopted. The repo's pinned GitHub workflow is the existing self-hosted-by-GitHub path. |
| Local builds | Existing app scripts remain available; local Android requires Android SDK/NDK, Java, and an emulator/device. iOS builds require macOS/Xcode. |
| New project scaffolding | Not applicable to this existing monorepo app. Do not rerun `create-expo-app` or overwrite its instructions. |

## Sources checked on 2026-10-16

- [Expo AI agents overview](https://docs.expo.dev/agents/)
- [Expo `agent-device` workflow](https://docs.expo.dev/agents/agent-device/)
- [Expo EAS Build plans](https://docs.expo.dev/billing/plans/)
- [Expo EAS Simulator CLI reference](https://docs.expo.dev/eas/cli/)
- [Expo build server images](https://docs.expo.dev/build-reference/infrastructure/)
- [Callstack Codex Mobile Dev plugin and requirements](https://github.com/callstackincubator/codex-mobile-dev-plugin)
- [Callstack `agent-device`](https://github.com/callstack/agent-device)
- [Official Expo skills](https://github.com/expo/skills)
- [Expo SDK 58 changelog and `@expo/agent-cli`](https://expo.dev/changelog/sdk-58)
- [Android Studio and SDK Command-Line Tools](https://developer.android.com/studio)
- [Android Virtual Device setup](https://developer.android.com/studio/run/managing-avds)
- [Callstack Agent Skills and Codex bundles](https://github.com/callstackincubator/agent-skills)
- [Callstack `pkg-skills`](https://github.com/callstackincubator/pkg-skills)
