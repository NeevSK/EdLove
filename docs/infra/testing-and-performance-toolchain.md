---
title: "Gurudevi Testing and Performance Toolchain"
status: "active"
created: 2026-08-12
updated: 2026-08-12
author: "Codex"
tags: [testing, performance, react-native, playwright, maestro, doppler]
---

# Gurudevi Testing and Performance Toolchain

The source notes in [`docs/sort these/`](../../docs/sort%20these/) are retained as
research material. This page turns their recommendations into operational lanes.

## Current lanes

| Concern | Tool | Repository path / command | CI policy |
| --- | --- | --- | --- |
| Unit and component behavior | Vitest, Jest, React Native Testing Library | `pnpm test` | Required PR gate |
| Browser smoke and navigation | Playwright Chromium | `.github/workflows/browser-e2e.yml` | Required for web changes |
| Mobile critical paths | Maestro YAML flows | `apps/gurudevi-mobile/maestro/flows/` | Optional when a device/key is available |
| Native build verification | Expo/EAS and Android runner | `.github/workflows/android-build.yml` | Manual/release-oriented because builds consume quota |
| React render diagnosis | React Native DevTools | Metro `j` shortcut or device Dev Menu | Local profiling |
| JS/UI frame diagnosis | Perf Monitor and Flashlight where available | Release-mode device runs | Scheduled/manual benchmark lane |
| Bundle and startup analysis | Expo Atlas and Hermes artifacts | Mobile bundle audit and release builds | On demand/release changes |

## Doppler boundary

All CI lanes that need configuration use the Doppler project `gurudevi-mobile`.
GitHub stores only a scoped `DOPPLER_TOKEN`; provider credentials and public
build-time variables come from the selected Doppler config. `dev` is local,
`stg` is preview, and `prd` is production.

Run the all-environment contract with:

```powershell
pnpm env:check:ci
```

It prints names and counts only. It never writes `.env` or prints secret values.
The current repository check confirms `dev`; `stg` and `prd` must still be
populated with their environment-specific values before preview/production CI.

## Mobile E2E decision

Maestro is the first mobile E2E layer because its YAML flows are easy to review
and run on local emulators or Linux CI. Detox remains a future gray-box option
for timing-sensitive native flows. BrowserStack, LambdaTest, and similar hosted
services are exploratory spot-check lanes, not the sole release gate, because
their free access is quota- or trial-limited.

Firebase Test Lab can be added as a scheduled Android real-device lane after the
build artifact and Google Cloud credentials are placed in Doppler. It should not
block every pull request.

## Performance rules from the source notes

- Frame-driven values stay in Reanimated shared values/worklets, never React
  state or reducers.
- Use React Native DevTools to distinguish React re-renders, JS CPU work, memory
  retention, and UI-thread frame drops.
- Profile release-like builds on a representative mid-tier Android device; do
  not treat development-mode FPS as a shipping benchmark.
- Keep E2E focused on critical user journeys and use unit/component tests for
  the majority of behavioral coverage.
- Add stable `testID` and accessibility selectors as interactive surfaces are built.

## Source research

- [RN E2E testing and free device access](../../docs/sort%20these/rn-e2e-testing.md)
- [RN JS and React profiling](../../docs/sort%20these/rn-js-react-profiling.md)
- [RN performance surface map](../../docs/sort%20these/rn-perf-surface-map.md)
- [UI-thread discipline](../../docs/sort%20these/ui-thread-discipline.md)
