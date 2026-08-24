---
title: "Root Configuration Map"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [configuration, tooling, reference]
---

# Root Configuration Map

Every configuration file at the repository root, what owns it, and when you may
touch it. If a file is not on this list and appears at the root, treat it as a
stray artifact — investigate before committing.

## Runtime & workspace

| File | Purpose | When to touch |
|---|---|---|
| `package.json` | Workspace manifest, scripts, sacred-version exclusions (`expo.install.exclude`) | Adding deps/scripts; never unpin sacred versions |
| `pnpm-workspace.yaml` | Workspace package globs + dependency catalogs | Adding a new workspace package location |
| `pnpm-lock.yaml` | Lockfile — commit every change, same commit as the manifest change that caused it | Never hand-edit |
| `.npmrc` | pnpm/registry behavior | Rarely; team-wide policy only |
| `.nvmrc` / `mise.toml` | Node version pin (mise reads it for runtime resolution) | Bump only with an SDK/toolchain decision |
| `tsconfig.json` | Base TypeScript config extended by apps/packages | Compiler-policy changes (keep strict flags maximal) |
| `nativewind-env.d.ts` | NativeWind type shim | Only with NativeWind upgrades |
| `doppler.yaml` | Doppler CLI project settings | Secrets-tooling changes |

## CI / pipelines

| File | Purpose | When to touch |
|---|---|---|
| `turbo.json` | Task-graph orchestration (`build`, `lint`, `test` pipelines) | Adding/changing shared tasks |
| `dagger.ts` | Dagger pipeline-as-code (containerized full audit) | CI lane changes; keep in sync with turbo tasks |
| `.easrc` | Tells EAS where the mobile app lives in the monorepo | Never (path is stable) |
| `.github/workflows/*` | GitHub Actions (web deploy, EAS, checks) | See workflow headers |

## Lint & quality gates

The gate chain a push must survive: **commitlint → lint-staged (Biome+ESLint) →
pre-push sovereign gate (lint + react-doctor + tsc)**.

| File | Purpose | When to touch |
|---|---|---|
| `biome.json` / `.biomeignore` | Biome formatter+linter config | Style-policy decisions |
| `eslint.config.js` | ESLint flat config (rules Biome doesn't cover) | Rule additions; no suppressions without justification |
| `.oxlintrc.json` | OxLint pass (fast first-line linter) | Same policy as ESLint |
| `.lintstagedrc.cjs` | Per-staged-file lint commands (husky pre-commit) | Rarely |
| `commitlint.config.cjs` | Commit message convention enforcement | Convention changes |
| `.syncpackrc` | Cross-package dependency version alignment rules | Adding a version-pinned family |
| `knip.json` | Unused files/exports/deps detection | Entry-point tweaks when knip false-positives |
| `.dependency-cruiser.cjs` | Architecture boundary rules (import graph) | Boundary-policy changes — coordinate with `packages/*` ownership |
| `.size-limit.json` | Bundle size budgets | Budget renegotiation, not silent raises |
| `.watchmanconfig` | Watchman file-watching exclusions | Performance tuning of watchers |

## Agents & automation

| File | Purpose | When to touch |
|---|---|---|
| `AGENTS.md` | Agent guardrails: critical rules, sacred versions, native-config contract | Every structural repo change |
| `.cursorrules` | Source-of-truth agent rules; feeds `.github/copilot-instructions.md` via `scripts/sync-skills.mjs` | Edit here, then run the sync script — never edit generated output |
| `skills-lock.json` | Locked skill set for `scripts/sync-skills.mjs` imports | Regenerate via the script, not by hand |
| `runbyte.json` | MCP server wiring for the runbyte agent runtime (platform-mcp + filesystem) | Server/path changes |
| `promptfooconfig.yaml` | LLM prompt/eval test suite | Prompt-regression coverage for agent flows |

## Infra configs (directories)

| Path | Purpose |
|---|---|
| `config/doppler-secrets.json` | **Misleading name** — contains no secrets. It is the env-var requirement map per environment (which vars each app needs from Doppler). |
| `powersync/*.yaml` | PowerSync service/sync-stream deployment configs |
| `patches/` | pnpm `patchedDependencies` — each patch must state its reason in the PR that adds it |
| `.idx/dev.nix` | Google IDX cloud-dev environment definition |
| `.vscode/`, `.husky/`, `.changeset/`, `.github/` | Editor, git hooks, changesets, repo automation |

## Removed strays (do not resurrect)

- `android/` + root `app.json` — dead bare-workflow leftover (`com.neevsk.polymathplatform`);
  the real app is `apps/gurudevi-mobile` (`org.edlove.gurudevi`). Native config lives only in
  `apps/gurudevi-mobile/app.json` + `plugins/`.
- `.tmpbin/pnpm` — corepack shim accidentally committed.
- `tsc-mobile.txt`, `tsc-ui.txt`, `style-stack-audit.txt` — stray command output, now gitignored.
