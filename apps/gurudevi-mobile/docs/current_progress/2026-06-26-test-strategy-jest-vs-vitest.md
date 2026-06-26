---
title: "Test Strategy: Jest vs Vitest for Gurudevi Mobile"
status: "draft"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [testing, jest, vitest, expo, strategy]
---

# Test Strategy: Jest vs Vitest for Gurudevi Mobile

## Why both exist

The app currently needs two testing lanes:

1. `Vitest` for fast, logic-level coverage of workspace helpers, route decision rules, and pure state machines.
2. `Jest` for Expo-compatible screen render tests and modules that are more reliable under the Expo Jest preset than under Vite transforms.

## Recommended seam choice

- Use `Vitest` when the code under test is a pure helper, state machine, or route decision function.
- Use `Jest` when the code under test mounts a screen or depends on Expo-specific render behavior.
- Prefer direct logic helpers over full screen mounts when a screen test becomes brittle.

## Current flow coverage

- Welcome guest entry uses an idempotent anonymous-auth path.
- Auth success routes to onboarding when onboarding is incomplete, and to `self` when onboarding is already complete.
- Logout or unauthenticated entry routes back to `welcome`.
- Onboarding progression is modeled as an explicit phase machine.

## Practical rule for future agents

If a screen test fails because of module transform or runtime glue, move the assertion one layer down to the route helper or state-machine helper before trying to force the full render harness.
