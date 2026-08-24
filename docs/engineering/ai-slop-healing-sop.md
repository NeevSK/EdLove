---
title: "AI-Slop Healing — Standard Operating Procedure"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [quality, anti-slop, tooling, sop]
---

# AI-Slop Healing — Operating Procedure

> Companion to [`2026-ai-slop-healing-audit.md`](./2026-ai-slop-healing-audit.md)
> and the pattern register [`slop-register.md`](./slop-register.md). This is the
> durable *how-to-run-and-heal* reference for the anti-slop tooling added on
> 2026-08-24.

## 1. Toolchain at a glance

| Tool | Command (repo) | What it catches | Installation |
| --- | --- | --- | --- |
| `jscpd` v5 (block clones) | `pnpm run audit:duplication` | Copy-paste blocks ≥8 lines / ≥50 tokens | devDep (exists) |
| `aislop` | `pnpm run audit:aislop` · `pnpm run heal:aislop` | Narrative comments, TODO stubs, swallowed exceptions, `as any` casts, oversized functions, dead code | devDep `aislop@0.14.1` |
| `fallow` | `pnpm run audit:fallow` | Semantic duplication, dead code, circular risk, complexity, design-drift | devDep `fallow@3.17.0` |
| `jscpd` MCP | via `platform-mcp` | Agents query duplication *before* generating | wiring only |
| depcruise / Oxlint / ESLint | `pnpm lint`, `check:architecture` | Boundaries, cycles, orphans, static correctness | exists |

## 2. When to run (the healing loop)

```
1. Agent writes code.
2. pnpm run audit:aislop   pnpm run audit:fallow   (changed-surface pass)
3. Feed findings back to the SAME agent (reuse existing helpers, remove
   narrative comments, tighten types).
4. Opt-in safe fixes: pnpm run heal:aislop  (non-behavioral classes only).
5. Human reviews only the architectural decisions that remain.
6. Pre-commit/CI re-verifies via lint-staged + quality-gate.yml.
```

## 3. Thresholds & exit criteria

- **Baseline**: first run on 2026-08-24 established a numeric baseline per
  package. A *blocker* is any **new** finding introduced by a diff vs. the
  baseline (diff-mode); pre-existing findings are a backlog, not a PR gate.
- `audit:aislop` — exit `0` when no *critical* (behavior-changing) findings in
  changed files; warnings are reported but non-fatal.
- `audit:fallow` — exit `0` when no *new* duplication/circular/complexity
  findings in changed files. Use `fallow check --diff` for PR scope.
- **Never gate CI on historical noise**: pin `--changed`/`--diff` scope.

## 4. Safe-fix rules (what `heal:aislop` may touch)

Only these, and only when the change is provably behavior-preserving:

- Remove *narrative/restating* comments (rule: a comment must say something the
  code cannot).
- Remove unused imports / variables.
- Remove `// TODO` stubs that reference no work item — replace with a real
  reference (issue number) or remove.
- Collapse obviously-redundant optional chaining / `as any` where the type is
  already narrow.

Never auto-fix (human decision required):

- Swallowed exceptions (`.catch(() => {})`) — the failure path must be
  re-read by a human; prefer surfacing a recovery state.
- Reordering / extracting functions — that is a refactor, not a healing fix.
- Anything that drops a guard, a test, or a quality gate (Anti-Slop rules #6/#7).

## 5. De-duplication boundary (rule #3 in AGENTS.md)

Do **not** add a new detector that overlaps an existing one:

| Concern | Owner | Don't also add |
| --- | --- | --- |
| Copy-paste blocks | `jscpd` | `fallow` block-dup mode is fine but not required |
| Semantic dedup | `fallow` | `dupehound` (not on npm; Rust) |
| Dead code / orphans | Knip + depcruise | `fallow` covers extras only as convenience |
| Architecture / cycles | depcruise | — |

If a future proposal brings a new detector, first note the overlap verdict in
`docs/stack-map/landscape/dependency-annotations.yaml` and regenerate.

## 6. Adding a new analysis surface

1. Add the CLI as a root devDependency via `pnpm add -Dw <pkg>`.
2. Create `scripts/audit-<name>.mjs` following the `run-and-report.mjs` and the
   `audit-*.mjs` style (ignore list = `node_modules`, `dist`, `.expo`,
   `android/`, `ios/`, coerce Windows paths).
3. Add `pnpm run audit:<name>` to root `package.json`.
4. Wire a lean `--diff`/`--changed` variant into `pr-guard.yml` and a full run
   into `quality-gate.yml` (or keep as `audit:`-only until the baseline stabilizes).
5. If it is also an MCP server, register it in `packages/platform-mcp` and
   document the tool name against `slop-register.md`/`ai-slop SOP`.

## 7. Sign-off / owning

- Owner: Naveen (architecture). Scribe policy: any agent that generates code
  must have run `audit:aislop` + `audit:fallow` on its changed files before
  marking "done".
- If a new recurring slop pattern is found, add it to `slop-register.md` and
  to `AGENTS.md` Slop List so agents stop producing it.