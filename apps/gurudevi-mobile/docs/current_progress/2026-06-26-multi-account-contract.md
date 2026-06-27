---
title: "Multi-Account Contract"
status: "draft"
created: 2026-06-26
updated: 2026-06-26
author: "Naveen"
scribe: "Antigravity"
tags: [multi-account, auth, logout, device-state]
---

# Multi-Account Contract

## What the app already supports

- Multiple device-linked accounts are already modeled in core.
- Accounts can be captured from authenticated sessions.
- Active account switching is supported at the storage and session layer.
- Sign-out exists at both current-account and all-accounts scope.
- Account deletion can chain through remote deletion and logout cleanup.

## What is still missing

- A first-class UI for account switching.
- A clear in-app account chooser or account drawer.
- Surface copy that explains the difference between guest, signed-in, onboarding, and multiple stored accounts.

## Product rule

Multi-account should be treated as a primary product capability, not a later settings feature.

## Test rule

Even before the UI exists, the multi-account logic layer must be covered directly with unit tests around capture, switch, sign-out, and deletion.
