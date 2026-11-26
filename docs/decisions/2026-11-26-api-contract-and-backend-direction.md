---
title: "Decision: API contract and backend direction"
status: "draft"
created: 2026-11-26
updated: 2026-11-26
author: "Naveen"
scribe: "Claude"
tags: [decision, api, contract, orpc, openapi, rust, python, typespec, protobuf]
---

# Decision: API contract and backend direction

**Status:** proposed, waiting for Neev. Full brief:
[2026-11-26 API contract and backend direction](../../apps/sanctuary-api/docs/architecture/2026-11-26-api-contract-and-backend-direction.md).

## Decision (proposed default, reversible)

- The API server stays TypeScript (Hono + oRPC).
- `packages/core/src/api/v1/contract.ts` stays the one source of the contract; `catalog.ts`
  stays the one capability list. No TypeSpec, Protobuf or Smithy file beside it.
- RPC stays the wire for Gurudevi's own web and mobile apps.
- A generated, CI-checked OpenAPI projection of v1 replaces the stale `docs/api/openapi.json`.
- Plain-HTTP JSON behaviour fixtures per capability become the check any implementation, in
  any language, must pass.
- No Rust, Python, Protobuf or Connect now. Rust enters only as a small library compiled to
  Wasm (as Cedar already does) for a computation that must match offline and online.

## Why

- The repo uses RPC only; no client depends on OpenAPI or a non-TypeScript language.
- Phones feel payload and offline behaviour, not the server's language; PowerSync and the signed
  snapshot already carry offline.
- Rust compile times remain a top complaint (2025 survey: 55% wait over 10 s per rebuild), and
  2025–2026 studies find LLMs make the most errors in Rust; the compiler catches some, tests are
  still what make code correct.
- Rust was decided twice before (2026-07-28 local PDP, 2026-10-25 sidecar) and both times the
  Wasm Cedar library was enough.

## Decided (Neev, 2026-11-26)

- **Production database moves to Singapore**, next to the API (today it is in Mumbai,
  `ap-south-1`, while the API runs in Singapore). Reminder: not done yet.
- **Standing rule:** API host and database share a region; any new host, worker or database is
  checked against this before it is added.
- **Refine in this order before considering Rust:** measure (`Server-Timing`), database to
  Singapore, always-on instance, fewer database round trips per call (~12 to 2–3), fewer calls
  per screen (PowerSync for reads), payload and connection reuse, then profile CPU. Details in
  the brief, section 3b.

## Triggers to revisit

Non-TypeScript client; a measured offline/online computation; multi-language services with
streaming; oRPC breaking its wire again; a job that needs a Python library.

## First step (needs Neev's yes)

One PR: generate OpenAPI from `appContract` with a drift gate, and plain-`fetch` fixtures for
`identity.session` and `identity.createInitialBond`.
