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

## Final round (Neev, 2026-11-26): settled direction, checked against `integrate/nov-convergence`

Direction is settled: keep TypeScript, change what is underneath where it pays. Each row below
was checked against `integrate/nov-convergence` (`5a466cd5e`, which contains
`integrate/worlds-and-upstream` and has 15 v1 capabilities).

| Area | Decision | What the branch shows | Note before acting |
| --- | --- | --- | --- |
| Language | TypeScript stays | All API code is TypeScript | |
| Runtime | Bun is the primary-runtime candidate; Node stays production until Bun passes the same suites | `src/index.ts` (Bun entry) throws `Authenticated foundation requires the Node entry point` when `API_AUTHENTICATION=required`; `Dockerfile` runs `node:24` with `dist/entry-node.js` | Bun parity = the G1/G2 and security suites passing under Bun, plus `Server-Timing` before/after. Gains are memory and toolchain, not network latency |
| Functional API | oRPC v2 continues | `@orpc/*` pinned exactly at `2.0.0-beta.53` | Keep exact pins; `hono` is exact (`5.0.0-rc.1`) but `@hono/node-server`, `effect`, `pg` are `^` ranges |
| HTTP shell | Hono v5 as a thin shell; oRPC owns procedures | Authentication and budget run in Hono (`app.all('/api/v1/*')` in `core/app.ts`); oRPC middleware only asserts an identity exists | Move auth + budget into one oRPC middleware so a future OpenAPI channel reuses it instead of duplicating it |
| Portable spec | OpenAPI generated and gated | `@orpc/openapi` still not installed | First step unchanged |
| Authorization | Cedar stays, Wasm, behind one interface | Already one interface: `check()` from `@repo/policies` (`cedar-wasm`); `platform.ts` imports it | No Rust Cedar integration exists on any branch; sidecar/native only on a measured need |
| Serialization | JSON default; Protobuf only where data shape justifies it | No Protobuf, CBOR or MessagePack anywhere | Signed snapshots need canonical JSON, not smaller bytes |
| Validation | Zod 4 / Standard Schema stays | `zod` exact `4.6.7` | |
| Database driver | `pg` stays; Bun SQL evaluated only after Bun parity | `pg` `^8.23.1` | Must keep transaction, role, claims and cancellation behaviour |
| Effect | Bounded: not in API handlers | Listed in `sanctuary-api` dependencies, but no `sanctuary-api` source imports it; used in packages (e.g. `attendanceSessionMachine.ts`) | Candidate to drop from the API's dependencies |
| Hosting | Always-on instance, same region as the database (Singapore) | `render.yaml` still `plan: free`, `region: singapore` | Cloud Run (min instances) or a paid Render plan both work |
| Rust | Selective computational engine only, as a Wasm library first | No `Cargo.toml` on any branch | Bake-off before the first one |
| Protobuf/Connect | Available for future interoperable services | None | |
