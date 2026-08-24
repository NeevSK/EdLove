---
title: "Openness and Reuse Strategy"
status: "accepted"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "ox-alpha"
tags: [open-source, licensing, monorepo, adr, extraction]
---

# ADR: Openness and Reuse Strategy

## Status

**Accepted**

## Context

The Polymath Platform monorepo mixes three kinds of work:

1. **Business products** — Gurudevi (mobile + marketing web), EdLove web,
   Intuitui web, Neevsk personal site, Sanctuary API.
2. **Domain packages** — `@repo/*` business logic (`core`, `database`, `ai`,
   `payments`, `classroom`, `accounting`, etc.) that only makes sense inside
   the platform.
3. **Independent projects** — conceived with their own identity from day one:
   - **RN Terrain** (`@rn-terrain/{core,cli,mcp,vscode}` + extensive docs) —
     a React Native ecosystem intelligence tool with its own open-source
     strategy (`docs/RN Terrain/decisions/2026-06-02-rn-terrain-open-source-strategy.md`).
   - **trube-art** (`@repo/trube-art`) — "Living light surfaces for RN & Skia",
     already excluded from the pnpm workspace (`pnpm-workspace.yaml`) with its
     own lockfile.

The repo was private; the question was whether/how to open source.

### Verified facts informing this decision

- **A real Google API key exists in git history** (added in commit `b56f62af`,
  removed in `83e3b4c9`). Deleting a secret does not remove it from history;
  making the repo public would have exposed it. It must be rotated in Google
  Cloud Console regardless of any open-source decision.
- Current tracked files are clean: all `.env` files are gitignored, tracked
  `.env.example` files contain placeholders only, secrets are managed via
  Doppler, and `config/doppler-secrets.json` is a variable-name contract
  (no values).
- **Dependency scan results** (all workspace `package.json` files + source
  imports):
  - `@rn-terrain/*`: zero dependents outside its own four packages.
  - `trube-art`: zero live dependents (only archived files in
    `apps/gurudevi-mobile/archives/`).
  - `lk-edu-geo`: actively used (`graphics`, mobile metro alias/web shim).
  - `form-builder-engine`: used by `core` and `form-builder`.
  - `accounting`: depends on `@repo/core`.

### Options considered

| Option | Description | Verdict |
|---|---|---|
| A. Flip repo public as-is | Rewrite 1349 commits to purge history, expose all products | Too much exposure for business code |
| B. Fresh-start public publish | Publish HEAD snapshot with clean history | Still exposes all business logic going forward |
| **C/D. Extract identity projects** | Keep platform private; publish product-agnostic projects as separate repos | **Chosen** |

## Decision

**Staged hybrid (Option D):** extract independent projects into their own
repositories now; revisit full-repo openness later if ever warranted.

1. **Extract RN Terrain** → new repo `rn-terrain`
   (`packages/rn-terrain-{core,cli,mcp,vscode}` → `packages/{core,cli,mcp,vscode}`,
   plus its docs except `landscape/` which is monorepo stack-map infrastructure).
2. **Extract trube-art** → new repo `trube-art`.
3. Both repos are created **private** and follow the June strategy's own rule:
   *don't open source a skeleton* — they go public only when their launch
   criteria are met (e.g., Bloom 1 working, ground-truth tests passing).
4. **Everything else stays in the monorepo**, which remains private:
   all apps, all domain packages, `lk-edu-geo` (actively consumed),
   `form-builder-engine` (embedded in core).

### Reuse rules (the "what if I need accounting elsewhere?" question)

- Business/domain packages stay in the monorepo. When a second project needs
  one, consume it via **private npm publishing or a git dependency** — no
  restructuring required.
- Extract only when a package is product-agnostic AND wants its own identity.
- Extraction is reversible: re-absorbing a repo into the monorepo later is a
  copy plus a workspace entry. The "everything unifies one day" scenario costs
  nothing under this model.

## Consequences

- Monorepo daily workflow unchanged; no branch-model changes.
- New repos start with fresh single-commit histories (zero archaeology risk).
- Monorepo config cleanup required: root `tsconfig.json` paths,
  `pnpm-workspace.yaml` exclusion, `rn:radar*` scripts, dependency-cruiser
  rules, stack-map annotations.
- The leaked Google API key must be rotated before any public exposure.
- Commit author emails include personal Gmail addresses
  (`prageeth.har2002@gmail.com`, `sdnskiq1@gmail.com`); irrelevant while the
  monorepo stays private but worth remembering if Option A/B is ever revisited.

## References

- License tradeoffs: [2026-08-24-license-tradeoffs.md](./2026-08-24-license-tradeoffs.md)
- RN Terrain open-source strategy: `docs/RN Terrain/decisions/2026-06-02-rn-terrain-open-source-strategy.md`
  (moves to the `rn-terrain` repo)
