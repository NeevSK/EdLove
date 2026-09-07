---
title: "Gurudevi native color runtime diagnosis"
status: "active"
created: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi-mobile, android, metro, nativewind, react-native-svg, debugging]
---

# Gurudevi native color runtime diagnosis

Date: 2026-09-07 (Asia/Colombo)

## Symptom

On a connected Samsung SM-A525F running Android 14, Metro recorded repeated warnings:

```text
"rgb(NaN, NaN, NaN)" is not a valid color or brush
```

## Evidence

- The message is emitted by `react-native-svg`'s brush extractor when React Native's `processColor` cannot convert a supplied SVG color value. It is not a Skia diagnostic.
- `@repo/ui`'s `Icon` primitive uses `useCssElement` from `react-native-css` to map `className` onto Lucide SVG styles.
- `CircadianProvider` publishes phase CSS variables through `vars` from `nativewind`.
- pnpm had installed two instances of both `nativewind@5.0.0-preview.4` and `react-native-css@3.0.7`: one for `gurudevi-mobile`, one for `@repo/ui`.
- The app-level provider and the UI-level icon primitive could therefore use distinct variable contexts. A phase-derived SVG color can become unresolved at the native SVG boundary, yielding the observed invalid brush warning.

## Resolution

Metro now pins `nativewind`, `react-native-css`, and `react-native-css-interop` to the app's dependency graph in `SINGLETON_OVERRIDES`, matching the existing React/React Native singleton strategy. This preserves the current versions and ensures variable publication and SVG style resolution share one runtime context.

## Follow-up verification

1. Start Metro with `pnpm --filter gurudevi-mobile start`.
2. Connect the development build over a working device-to-Metro route.
3. Exercise the signed-in tab shell and inspect the Metro log for new invalid-brush warnings.
4. If the warning persists, capture the component stack at the warning boundary and audit that concrete SVG call site; do not broadly replace phase variables or suppress SVG warnings.

## Verification attempt — 2026-09-07

- Metro initially reported a Windows file-watcher startup timeout, but remained alive and subsequently listened on port 8081.
- `adb reverse tcp:8081 tcp:8081` now lists `UsbFfs tcp:8081 tcp:8081`; the development-client intent for `org.edlove.gurudevi` was accepted.
- A clean device-log capture after the reload contained neither the earlier `useInput` exception nor a new `rgb(NaN, NaN, NaN)` warning.
- The phone locked immediately after launch, leaving Android's lock screen as the foreground surface. The signed-in tab shell has therefore not yet been visually exercised, so absence of the warning is a promising but not final runtime verification.
