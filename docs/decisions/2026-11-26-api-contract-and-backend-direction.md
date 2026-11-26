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

## Built after the final round (2026-11-26)

**Bun, without touching Node.** `src/index.ts` now boots the authenticated foundation under
Bun (it used to refuse `API_AUTHENTICATION=required`). Both runtimes build the app in one place
(`src/server-app.ts`); `src/bun-server.ts` keeps the Node adapter's drain, deadline,
stream-failure and port-collision rules. `pnpm test:bun` runs the foundation suite inside Bun
plus Bun copies of the socket tests. Node stays the production entry (Dockerfile unchanged).
Still to prove under Bun: the G2 database suite (`test:database`, needs Doppler) and
`Server-Timing` before/after.

**Effect v4 with the API: yes, bounded.** oRPC stays the boundary and Zod the contract. Effect
fits inside procedures and the platform where it pays: the per-request transaction (acquire,
claims, commit or rollback as one scoped resource), retries and timeouts on outside calls, and
the maintenance loop. `@orpc/effect` (same beta as `@orpc/*`) can wrap a procedure when one
needs it. Not in handler signatures or the contract.

**ZenStack + Zod as the one description of tables: wiring only.**

| Wire | What exists now | Proof |
| --- | --- | --- |
| API → ZenStack | `createZenStackOnConnection(client)` in `@repo/database`; `platform.withAccountModel` gives typed ZenStack queries on the API's own transaction. Row-level security, timeouts and claims apply as for raw SQL; ZenStack's own transactions become savepoints; no policy plugin (RLS + Cedar decide) | `packages/database/src/transaction.test.ts` on a real Postgres: RLS holds, inner rollback stays inner, caller owns commit. ~1 ms to build a client |
| ZenStack → device (PowerSync) | `drift-check.test.ts` reads the model from `@repo/schema` and the tables from `powersync/sync-config.yaml`: every replicated device column must exist in the model with a SQLite type that can hold it; every stream must read a table the model and device both declare | Passes today. 7 device tables are neither local-only nor streamed (`jurisdiction_nodes`, `joy_moments`, `gratitude_glimmers`, `sleep_logs`, `timetable_periods`, `daily_prep_items`, `personal_reminders`); listed as undecided, the list may only shrink |
| ZenStack → Zod → contract | `makeModelSchema` already derives Zod from the model; the v1 contract still writes its own Zod | Not wired yet: the contract ships to the phone, so it needs generated static Zod, not ZenStack's runtime factory |

Open for Neev: with the model as the one description of tables, SQL migrations still own
row-level security, functions, grants and `pg_cron` (2026-11-11). Whether migrations for
tables and columns are then generated from the model (`zen migrate`) or written by hand and
checked against it is the next choice.
