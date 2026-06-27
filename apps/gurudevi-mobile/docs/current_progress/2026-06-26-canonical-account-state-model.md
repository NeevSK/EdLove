---
title: "Canonical Account State Model"
status: "draft"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [multi-account, auth, onboarding, state-model]
---

# Canonical Account State Model

## State ladder

1. `guest`
2. `authenticated`
3. `onboarding-needed`
4. `ready`
5. `multi-account-ready`

## Meaning of each state

- `guest`: anonymous or public entry, no durable account yet.
- `authenticated`: signed in, but onboarding may still be incomplete.
- `onboarding-needed`: account exists, but the user still must finish the onboarding contract.
- `ready`: account is complete and can enter the app.
- `multi-account-ready`: the device has more than one stored account and can switch among them.

## Canonical transitions

- `welcome -> guest`
- `login/signup -> authenticated`
- `authenticated -> onboarding-needed`
- `onboarding-needed -> ready`
- `ready -> multi-account-ready` when more than one device account is stored
- `logout -> guest`
- `delete account -> guest`

## Product rule

The UI may lag behind, but the state model should remain the same across web and mobile.
