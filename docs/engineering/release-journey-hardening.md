---
title: "Release Journey Hardening — Three Critical Journeys"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [release, journeys, state-machine, recovery, production]
---

# Release Journey Hardening — Three Critical Journeys

> Reference for the universal-Expo-monorepo first pass: pick three journeys,
> harden them end to end, encode the state machine + failure/recovery matrix,
> then run the **three-device, three-network** release gate from
> [`production-hardening-runbook.md`](./production-hardening-runbook.md).

## 1. The journeys (for Gurudevi Mobile)

| # | Journey | Why these three |
| --- | --- | --- |
| J1 | **Onboarding / Authentication** | First-run trust, permission timing, deep links, session/expiry. |
| J2 | **Primary create-or-edit** | Draft persistence, optimistic + undo, idempotency, offline queue. (e.g. log an entry / create a post) |
| J3 | **Primary return / synchronization** | Pull-to-refresh, sync status, offline queue replay, account-switch isolation. |

## 2. Per-journey spec contract

For each journey, document when hardening begins (this is an *enumerate-then-editor*
workstream: journey specs are written here; RED/AMBER code changes go through
`gurudevi-quality-gate` proposal-first):

- **State machine** — idle → loading → empty → offline → error → success → expired → repeated;
   explicit terminal + recovery states.
- **Failure modes** — retry, cancellation, partial failure, offline, duplicate
  taps, stale data, permission denial, expired session, interrupted mutation.
- **Recovery behavior** — undo/retry/idempotency; never discard user intent
  (drafts survive background/failure).
- **Analytics events** — funnel events + failure rates (align with observability).
- **Accessibility** — loading/empty/error announce, focus restoration after
  dialogs, reduced motion, error association near fields.
- **Platform differences** — push/permission timing, deep-link, web focus.

### J1 — Onboarding / auth

- Machine: `welcome → invite-claim → auth-callback → setup → ready`; guard on
  `_layout.tsx` (TOBAC); expired session → `/welcome`.
- Failure modes: network on claim, expired invite, invalid callback token,
  permission prompt timing (Apple: not at launch).
- Draft: preserve onboarding answers across backgrounding.
- Deep link: `gurudevi://auth/callback` handled in `DeepLinkProvider`.

### J2 — Primary create-or-edit

- Machine: `draft → dirty → saving → saved/errored → (undo) → clean`.
- Every mutation: is it optimistic? retryable? cancellable? idempotent?
  `OptimisticRow` pattern where a non-blocking overlay item exists.
- On failure: keep the draft, inline error near field, retry action.

### J3 — Primary return / synchronization

- Machine: `fresh → refreshing → synced → offlinePending → conflict`.
- Idempotent upload ledger; queues observable (`SyncStatus*`).
- Account-switch/liquidation closes old runtime before new (`PowerSync`).

## 3. Three-device, three-network gate (the release step)

| | fast | slow | offline |
| --- | --- | --- | --- |
| Current iPhone | J1 J2 J3 | J1 J2 J3 | J1 J2 J3 |
| Low-end Android | J1 J2 J3 | J1 J2 J3 | J1 J2 J3 |
| Desktop browser (web) | J1 J2 J3 | J1 J2 J3 | J1 J2 J3 |

Also re-run each journey after: **cold start**, **background/resume**,
**permission denial**, **expired session**, **interrupted mutation**,
**app upgrade**. Gate in the release checklist in
[`production-hardening-runbook.md`](./production-hardening-runbook.md) §5.

## 4. Monorepo boundary checks enforced by this doc

- One dependency owner for native packages (sacred pins; `AGENTS.md`).
- Stable public exports for shared UI (subpath exports; `check:deep-imports`).
- No duplicated Metro configuration; app `package.json` owns Expo config + entry
  points; shared packages remain platform-aware via explicit adapters, never
  hidden global side effects.

## 5. Working notes

- This doc is the journey *inventory + spec skeleton*. Screen-level specs that
  touch RED/AMBER zones get written as feature-specs under
  `gurudevi-quality-gate` and land in `docs/engineering/` or the app docs
  per their blast radius.
- Progress is tracked in `apps/gurudevi-mobile/docs/current_progress/` when a
  journey is being hardened, per the docs-SOP.