---
title: "Developer Sandbox Console & Onboarding Parser"
status: "active"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, security, developer-tools, onboarding]
---

# Developer Sandbox Console & Onboarding Parser

This document is the canonical Gurudevi app-level contract for the hidden developer sandbox path inside onboarding.

It mirrors the behavior that already existed in the older architecture note, but relocates it to the app docs where the onboarding code actually lives.

## Purpose

- Keep the dev shortcut invisible to standard users.
- Let developers and QA create real scoped accounts quickly.
- Preserve the same onboarding, auth, RLS, and account-scoping rules as normal users.
- Support both mobile and web with one shared helper contract.

## Trigger Contract

The onboarding name step may accept hidden `dev::` inputs only when dev mode is enabled.

Allowed dev modes:
- `__DEV__`
- `EXPO_PUBLIC_ENABLE_DEV_SANDBOX === 'true'`

Supported inputs:
- `dev::menu`
- `dev::sandbox`
- `dev::name:...,role:...,pricing:...,citizenship:...,school:...`

## Behavior

- `dev::menu` and `dev::sandbox` open the hidden developer console.
- Inline `dev::...` templates create a real onboarding profile using the normal API path.
- Dev fast-track must still create:
  - a bond
  - a profile update
  - onboarding completion
- The flow must not bypass auth, RLS, POA, or Cedar.

## Security Boundary

The hidden console and inline parser are developer tooling, not public UI.

They are allowed only when the build or runtime explicitly enables the sandbox mode.
In production, the console path should be tree-shaken or return `null`.

## Implementation Note

The shared helper currently lives in `packages/ui/src/screens/devOnboardingFastTrack.ts` and is used by both native and web onboarding screens.

## Future UI Note

We do not need a visible public dev button.
If a developer-only modal is ever reintroduced, it should still be hidden behind the same dev gate and never appear for standard users.

## Preferred End State

The helper-only path is the default preferred implementation because it keeps the standard user interface clean while still allowing developers and QA to create real scoped accounts quickly.

Only add a modal if the team has a concrete QA need that the helper path cannot satisfy.
