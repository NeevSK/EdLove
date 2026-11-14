---
title: "Hono v5 RC: Temporal-Grounded Architectural Research Report"
status: "active"
created: 2026-10-25
updated: 2026-10-25
author: "Naveen"
scribe: "Antigravity"
tags: [hono, hono-v5, edge, bun, web-standards, architecture, research]
---

# Hono v5 RC — Temporal-Grounded Research Report (October 2026)

> Sources: hono.dev official migration docs, GitHub honojs/hono releases, npmjs.com, dev.to, snyk.io — all retrieved October 25, 2026.

---

## 1. Exact Latest v5 RC Version & Release Timeline

- **Current RC tag**: `v5.0.0-rc.1` (at minimum; `5.0.0-rc.0` came first)
- **Install command**: `npm install hono@next` (resolves to latest RC) or `npm install hono@5.0.0-rc.1`
- **Release window**: October 2026 (both `rc.0` and `rc.1` rolled out in this window per GitHub and Snyk.io records)
- **GA stable status**: NOT YET RELEASED as of Oct 25, 2026 — still in RC phase
- **Official migration guide URL**: `https://hono.dev/docs/migration/v5`

---

## 2. Breaking Changes: v4 → v5

### 2a. ESM-Only (HIGH IMPACT)
- **CJS build completely removed.** `require('hono')` no longer works via traditional CJS resolution.
- **Node.js minimum**: v22.12+ required (Node 22.12+ can `require()` ES modules natively, so the import syntax may still work there, but older Node is hard-blocked).
- **Impact**: Any project on Node < 22.12, any bundler that outputs CJS-only, or any `ts-node` setup not in `--esm` mode will break.

### 2b. Decoupled Runtime Adapters (HIGH IMPACT — affects ALL runtime-specific projects)
All platform adapters previously bundled inside `hono/` have been extracted to their own `@hono/*` scoped packages:

| Old import (v4) | New package + import (v5) |
|---|---|
| `hono/bun` | `@hono/bun` |
| `hono/deno` | `@hono/deno` |
| `hono/cloudflare-workers` | `@hono/cloudflare-workers` |
| `hono/aws-lambda` | `@hono/aws-lambda` |
| `hono/vercel` | `@hono/vercel` |
| `hono/netlify` | `@hono/netlify` |
| `hono/cloudflare-pages` | **REMOVED ENTIRELY** — no replacement; migrate to CF Workers with Static Assets |

**Special note**: `hono/adapter` utilities (`env()`, `getRuntimeKey()`) remain in core `hono`. Only platform-specific entrypoints moved.

### 2c. `onError()` and `notFound()` Signature Changes (MEDIUM IMPACT)

```ts
// ❌ v4 — error passed as first arg
app.onError((err, c) => {
  console.error(err)
  return c.text('Custom Error', 500)
})

// ✅ v5 — standard middleware signature, error on c.error
app.onError((c) => {
  console.error(c.error)
  return c.text('Custom Error', 500)
})

// ✅ v5 — also supports (c, next) for composable chains
app.onError((c, next) => {
  if (c.error instanceof MySpecificError) {
    return c.json({ error: 'handled' }, 400)
  }
  return next()
})
```

- Multiple `.onError()` / `.notFound()` registrations now **compose (chain)** instead of silently overwriting the previous one.
- Both now support **optional path scoping** (path-specific error boundaries).
- Internally dispatched as reserved routes `@ERROR` and `@NOT_FOUND` inside the router engine.

### 2d. Type Tightening (MEDIUM IMPACT for TS projects)

| API | v4 behavior | v5 behavior |
|---|---|---|
| `c.req.json()` | Returns `any` | Returns `unknown` (forces explicit validation) |
| `c.req.query()` | Loose `undefined` handling | Strict `undefined`-aware types |
| `c.json()` | Accepts non-serializable values silently | Throws on non-JSON-serializable values |

- Running `tsc --strict` before migration is **strongly recommended** to surface all implicit `any` leakage.

---

## 3. New Features in v5

### 3a. "Hono for AI" Design Direction
- v5 is explicitly marketed as "Hono for AI" — optimized for LLM streaming backends, edge AI inference workers, and real-time SSE.
- Streaming helpers (`streamText`, `streamSSE`, `stream`) are refined for minimal time-to-first-token (TTFT) across Cloudflare Workers AI, OpenAI, and Anthropic proxies.
- Web Standard `Request`/`Response` alignment means zero-overhead pass-through piping for AI provider streams.

### 3b. Routable Error & Not-Found Handlers
- `onError()` / `notFound()` promoted to first-class router citizens — they can now be scoped to paths, composed, and chained like normal middleware. This enables per-route error boundaries for the first time.

### 3c. Wildcard Routing Homogenization
- Wildcard `*` behavior is now identical across all underlying router engines (`RegExpRouter`, `SmartRouter`, `TrieRouter`). Previously, edge cases differed per engine.

### 3d. Improved `app.mount()` Mechanics
- Mount middleware patterns are cleaner. Sub-application mounting edge cases (path parameter conflicts, nested wildcard handling) resolved.

### 3e. Standard Schema Ecosystem Integration
- `c.req.json()` returning `unknown` pushes developers toward explicit validation. The ecosystem officially embraces **Standard Schema** (a shared specification across Zod, Valibot, ArkType, Effect Schema). Any Standard Schema-compliant validator plugs into Hono middleware without a custom adapter.

### 3f. Typed RPC Client (`hc`) Improvements
- RPC client type inference is more robust for streaming and SSE endpoints when combined with strict TypeScript.
- Monorepo setups require `"strict": true` in `tsconfig.json` for full inference accuracy.

---

## 4. Middleware Ecosystem Compatibility

### Core `@hono/*` packages — v5 compatible:
| Package | Status |
|---|---|
| `@hono/zod-validator` | ✅ v5 compatible |
| `@hono/zod-openapi` | ✅ v5 compatible |
| `@hono/bun` | ✅ New separate package (extracted from core) |
| `@hono/cloudflare-workers` | ✅ New separate package |
| `@hono/aws-lambda` | ✅ New separate package |
| `@hono/vercel` | ✅ New separate package |
| `@hono/deno` | ✅ New separate package |
| `@hono/netlify` | ✅ New separate package |
| `@hono/node-server` | ✅ Confirmed compatible |

### Removed without replacement:
| Package | Status |
|---|---|
| `hono/cloudflare-pages` | ❌ **Permanently removed** — migrate to CF Workers + Static Assets |

### Standard validation ecosystem:
- `@hono/zod-validator` — official, fully supported
- Valibot, ArkType, Effect Schema — all work via Standard Schema spec with no adapter needed
- `hono-zod-openapi` / `@hono/zod-openapi` — Zod → validation + TypeScript types + OpenAPI/Scalar docs in one

---

## 5. Bun Compatibility Status in v5

**Verdict: Fully compatible, but import path changed.**

- Bun's native `Bun.serve` uses Web Standard `Request`/`Response` — aligns perfectly with Hono's architecture.
- For basic HTTP routing, **no adapter package needed**:
  ```ts
  import { Hono } from 'hono'
  const app = new Hono()
  app.get('/', (c) => c.text('Hello Bun!'))
  export default app  // Bun picks this up natively
  // or: export default { port: 3000, fetch: app.fetch }
  ```
- For `serveStatic` (filesystem assets) or Bun-specific utilities: install `@hono/bun` and import from there.
- **No known Bun-specific issues** in v5 RC beyond the adapter import path change.

---

## 6. Known Issues, Gotchas & Nuances

### 6a. `hono/cloudflare-pages` Hard Removal (Most Dangerous Gotcha)
- Projects using Pages Functions patterns will have **build-time import failures** after upgrade.
- No backward-compat shim exists. Migration to Cloudflare Workers + Static Assets is the only path.
- This is the most disruptive single change for existing CF Pages deployments.

### 6b. Cloudflare SSE/Streaming Buffering Bug (Pre-existing, amplified in v5)
- `streamSSE` on Cloudflare Workers (including `wrangler dev`) can buffer all chunks until stream close, delivering nothing in real-time.
- **Workaround**:
  ```ts
  c.header('Content-Encoding', 'Identity')
  return streamSSE(c, async (stream) => { ... })
  ```

### 6c. `onError` Composition Surprise
- If your v4 code registered multiple `onError` handlers expecting the last one to "win," v5 will **chain them all**, which can cause double-responses or unexpected execution order.

### 6d. TypeScript Noise Spike on Migration
- The `c.req.json()` → `unknown` change and stricter `c.req.query()` types surface previously-hidden `any` payloads. Expect significant TS error count increase on first `tsc` run post-upgrade.

### 6e. Node.js Version Gate
- Node < 22.12 is hard-blocked. This may be a blocker for teams on LTS Node 20 until they upgrade their runtime.

### 6f. CJS-dependent Toolchains
- Any tool that bundles or runs Hono in CJS mode (older `ts-node` without `--esm`, Webpack 4 with `module: commonjs`, Jest without ESM transform) will require toolchain updates before the Hono upgrade can proceed.

---

## 7. Migration Effort Estimate (v4 → v5)

| Project Type | Estimated Effort |
|---|---|
| Simple Cloudflare Worker (no CF Pages, no SSE) | **0.5–2 hours** — update adapter imports, fix `onError` signature, run `tsc --strict` |
| Bun/Deno app with `serveStatic` | **1–3 hours** — adapter package swap, TypeScript cleanup |
| Node.js app (currently on Node 18/20) | **4–8 hours** — includes Node version upgrade, CJS→ESM migration, adapter swap |
| Cloudflare Pages app | **1–3 days** — architectural migration to Workers + Static Assets required |
| Full-stack monorepo with multiple adapters + strict types | **3–5 days** — type cleanup, adapter splits, RPC client re-validation |

---

## 8. Community Consensus on Production Readiness

- **For Greenfield Prototyping / Small Demos:** **100% fine and encouraged.** The RC designation means API surfaces and routing engines are frozen. Starting a fresh Bun service on v5 RC avoids taking on v4 technical debt.
- **For Mission-Critical Monolithic Upgrades:** Upgrade cautiously. Verify `@hono/zod-openapi` and related middleware versions against your monorepo typecheck before cutover.
