---
title: "Trial — CI Visual QA (Screenmap Preview Channel + sling Read-Only)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, trial, visual-qa, ci, screenmap, sling]
---

# Trial — CI Visual QA: Screenmap Preview Channel + sling Read-Only (2026-09-04)

Trial design only. **Zero app-code change. No CI workflow writes in this trial.**
Guardrails: no `android/` or `ios/` edits, no sacred-pin changes
(`react-native-gesture-handler 3.2.1`, `reanimated 4.6.0`, `worklets 0.12.1`,
`mmkv 4.3.2`, `nitro-modules 0.37.1`, `skia 2.11.2`, `typescript 7.0.2`),
no `.github/workflows/*` writes until the trial exit criteria below are met
and the user explicitly approves.

Parent signals: `2026-09-04-agent-docs-skills-qa.md` (§5.4 agent screenshot
triplets, §6 rec 1 screenshot-evidence contract) and
`2026-09-04-build-bundler-tooling.md` (§Gap table sling row, §Recommendation 4
trial sling read-only), consolidated in
`2026-09-04-forage-candidate-catalog.md` (§2 Screenmap "Trial on preview
channel", §5 sling "Trial read-only").

## 1. Repo baseline (file:line proof, 2026-09-04)

- Workflows (11 files, `.github/workflows/`): `android-build.yml`,
  `browser-e2e.yml`, `cloudflare-gurudevi-platform.yml`, `deploy-canary.yml`,
  `doppler-contract.yml`, `eas-release.yml`, `pr-guard.yml`, `quality-gate.yml`,
  `sentry-sourcemap-upload.yml`, `storage-contract.yml`, `web-deploy.yml`,
  `workflow-lint.yml`. No `screenmap-*.yml` exists today.
- EAS preview channel: `apps/gurudevi-mobile/eas.json:27-43` — `preview`
  profile, `"distribution": "internal"`, `"channel": "preview"`,
  `buildType: apk`, `NODE_ENV: production`. No `development-simulator`
  profile exists (Screenmap default); trial must either add one later (with
  approval) or pass `app_path` / `eas_profile: preview` — decision deferred
  to trial week 1.
- Playwright: `apps/gurudevi-mobile/playwright.config.ts:60`
  (`screenshot: 'only-on-failure'`), `:61` (`video: 'retain-on-failure'`),
  `:59` (`trace: 'on-first-retry'`), `:65-80` (Pixel 5 + Desktop Chrome
  projects). Failure forensics only — zero visual-regression assertions.
- E2E specs (2): `apps/gurudevi-mobile/tests/e2e/navigation.spec.ts:19`
  (`toBeVisible`), `:30` / `:51` (locale `toHaveAttribute`), `:61` / `:66`
  (`toHaveURL`), `:79-80` (validation copy); `tests/e2e/web-shell.spec.ts:11-12`
  (`toBeVisible`, `toHaveTitle`). DOM/behavioral only.
- Visual-regression grep (`toMatchScreenshot|toHaveScreenshot|visual.*regression`):
  0 hits. The agent_device triplet artifact (baseline/current/diff,
  informational-not-blocking) has no counterpart in-repo.
- Skills available (repo root `.agents/skills/`): `agent-device-control`,
  `screenshot`, `playwright`, `playwright-interactive`, `ui-screen-audit`,
  `gurudevi-quality-gate` — reuse targets for the evidence contract, not new deps.

## 2. Web verification (2026-09-04)

### 2.1 Screenmap (screenmap.dev + github.com/aleqsio/screenmap) — VERIFIED

- What it is: GitHub Action that maps every screen of an Expo / React Native
  app (expo-router or react-navigation route map) and comments on each PR
  with screenshots of the screens the change touched, plus a full-map viewer
  link. Source: `https://screenmap.dev/` ("Preview changes without running
  the app … runs it in CI, screenshots the screens your change touched, and
  posts them to the pull request").
- EAS support: fingerprints the project, reuses a finished EAS build when the
  fingerprint matches (JS-only PRs skip rebuilds); otherwise runs `eas build`.
  Requires `extra.eas.projectId` (i.e. `npx eas init` linked) and
  `EXPO_TOKEN`. Defaults to a `development-simulator` profile
  (`developmentClient: true`, `ios.simulator: true`); override with
  `eas_profile` or bypass EAS entirely with `app_path` to an existing
  simulator `.app`. Monorepo supported via `project: apps/mobile`-style path.
- Determinism: without `ANTHROPIC_API_KEY` Screenmap runs deterministically
  on the routes it can reach on its own; with a key, the agent
  (Claude default; Codex/Gemini/OpenCode presets) explores unreached screens
  and records tap flows. Flow replay powered by argent (SWM) per site footer.
  Route params come from two files in `.screenmap/` ("Real values for route
  params"); coverage modes `fast` / `balanced` (default) / `thorough`.
- Auth handling: **not documented as a first-class feature.** Public docs say
  "finds your screens from the router and records the tap paths itself — no
  tests required" and "posts a comment and nothing else". Seeded/authenticated
  screens therefore depend on `.screenmap/` config + recorded flows, which is
  exactly why this trial mandates auth-screen masking (§4) and treats
  authenticated routes as out-of-scope until a seeded-flow recipe is proven.
- Pricing: MIT licensed, "You pay for CI minutes and your agent, nothing
  else." No per-seat Screenmap charge. Cost drivers: (a) macOS runners only
  (`macos-26`, billed at ~10x Linux — site: "one run costs about what a short
  iOS build costs"); stated ~12 min for a JS-only change + EAS build time when
  native code changes; (b) agent API usage when a key is configured;
  (c) EAS build credits when a fingerprint miss triggers a build.
  Private repos: `publish: "false"` keeps bundles as run artifacts instead of
  a `screenmaps` branch. Coming soon: hosted simulators from argent cloud and
  Expo ("skip the runner").
- Platform limit: **iOS only for now; Android "not yet".**
  Baseline storage: bundles pushed to a `screenmaps` branch in-repo (public)
  or run artifacts (private); viewer opens `.scrmap` bundles in the browser;
  local runs land in `.screenmap/out/`.

### 2.2 sling CLI (starsling.dev/cli, docs.starsling.dev/sling-cli) — VERIFIED

- What it is: agent-first CLI for GitHub Actions from StarSling
  (`curl -fsSL https://runners.starsling.dev/cli/install.sh | sh`; Apple
  Silicon macOS + glibc x64 Linux). Companion `/sling` skill
  (`npx skills add starslingdev/skills --skill sling -y`). Sits beside `gh`:
  `gh` mutates (rerun/cancel/trigger/download), sling reads and diagnoses.
- Why it is read-only for this trial: `sling bill` is documented as "a
  read-only budget check for the open period"; `sling bill history` lists
  prior finalized invoices; `sling usage` / `sling top` / `sling why` /
  `sling time` / `sling logs` query StarSling's control plane and emit
  structured JSON — none of them edit workflows, rerun jobs, or touch
  `.github/workflows/*`. State-changing CI ops stay on `gh` and are
  explicitly out of scope.
- Commands to run (all read-only): §3.2. Preconditions per skill docs:
  CLI installed, `sling login` (GitHub device-code flow, session per user),
  StarSling GitHub App installed on the org.

## 3. Screenmap preview-channel trial design

### 3.1 Which PRs (route-heavy, JS-only first)

- IN (weeks 1–4): PRs touching `app/`, `features/`, `packages/ui` with no
  native fingerprint change — themed surfaces, login sheets, feed cards,
  welcome/auth routes already covered by `navigation.spec.ts` paths
  (`/welcome`, `/auth`). Target 3–5 such PRs minimum for a signal.
- OUT (until proven): PRs with native changes (new EAS build each run blows
  the minutes budget), PRs touching sacred pins, PRs carrying real
  school/PII fixtures, Android-only visual claims (Screenmap is iOS-only —
  Android evidence still comes from the existing Playwright + Maestro path).

### 3.2 EAS minutes budget

- Baseline math: ~12 min macOS per JS-only run (vendor figure) at ~10x Linux
  rate ≈ one short iOS build per run. Cap trial at **≤ 8 PR runs + 2 baseline
  runs** (≈ 10 runs ≈ ~120 macOS-minutes + fingerprint-hit rebuilds only).
- Cost controls: fingerprint reuse is the lever — JS-only PRs must not
  trigger `eas build`; any run that triggers a full build counts 2x against
  the cap. Track projected vs actual with `sling bill` / `sling usage`
  (§3.2 of the sling surface) and stop the trial early if the cap is hit.
- No standing `screenmap-baseline.yml` on `main` during the trial; baselines
  are produced on demand (`workflow_dispatch` equivalent, after approval) so
  push-to-main costs stay at zero.

### 3.3 Determinism criteria (trial passes only if all hold)

1. Same commit re-run twice → identical screen set (route list diff empty).
2. Informational comment posts baseline/current/diff triplets per touched
   screen, matching the @parbez artifact shape from the QA research doc.
3. No run fails the PR for visual reasons (informational phase — see ADR).
4. Unreached/authenticated routes are reported as unreached, not silently
   dropped — coverage mode recorded per run (`fast` vs `balanced`).

### 3.4 Auth-screen masking for PDPA (non-negotiable)

- Mask by default: `/auth`, OTP/email fields, any route rendering student
  names, grades, or photos. Masking config lives in `.screenmap/` (approved
  later, not in this trial) — until then, trial screenshots of auth routes
  are reviewed for PII before any external share, and bundles stay on the
  private-artifact setting (`publish: false` equivalent).
- No real school fixtures in trial flows; seeded demo accounts only.
- Full masking matrix is defined in the companion ADR
  (`docs/decisions/2026-09-04-visual-qa-contract.md` §3).

### 3.5 Baseline storage TTL

- During trial: baselines live as workflow run artifacts with **14-day
  retention** (mirrors `browser-e2e.yml:84` Playwright report retention).
- Promotion criterion: only after exit criteria pass does the trial propose
  a `screenmaps` branch (public-bundle model) vs artifacts-only (private
  model) decision, with PDPA sign-off. No branch is created in the trial.

## 4. sling read-only commands to run (no workflow edits)

```bash
# once per workstation (outside CI)
sling login
sling doctor
sling whoami

# per trial week (read-only CI telemetry)
sling bill                  # open-period spend + month-end projection
sling bill history          # prior finalized invoices (trend anchor)
sling usage --window 7d     # runner minutes + cost attributed per repo
sling top                   # slowest/costliest workflows + trend
sling why <run-or-job-id>   # failure classification with evidence (on any red trial run)
sling time <run-or-job-id>  # wall-clock decomposition (provision/checkout/steps/teardown)
sling logs <job-id> --grep  # server-side filtered log lines only (never full-log paste)
```

Routing rule (from `/sling` skill): state-changing questions
(rerun/cancel/trigger/download) go to `gh`, never sling; workflow-file
questions go to review skills, never to silent edits. Trial produces a
one-page cost/latency note (p50/p95, queue wait, WoW trend) attached to the
trial close-out.

## 5. Screenshot-evidence contract for UI PRs (summary; norm in ADR)

- Phase 0 (trial, now): informational triplets (baseline/current/diff) as PR
  comments on route-heavy PRs; zero blocking; reuse `agent-device-control` +
  `screenshot` + `playwright` skills for local capture discipline.
- Phase 1 (after exit): per-route blocking only for stabilized routes with
  masks + flake budget proven (flake sources: fonts, Skia, shimmer, dates —
  see ADR §4).
- Phase 2 (later): extend to authenticated/seeded flows once masking +
  determinism recipes exist. Detail-style background healing stays out of
  scope; sacred pins permanently out of autonomous scope.

## 6. Trial exit criteria (all must hold to propose workflows)

1. ≥ 3 route-heavy JS-only PRs each received an informational triplet comment
   with zero false-block (no PR failed for visual reasons).
2. Determinism criteria (§3.3) held on at least one repeat run.
3. EAS/macOS spend stayed within the §3.2 cap, evidenced by `sling bill` /
   `sling usage` output pasted into the close-out note.
4. Auth-screen masking reviewed clean on every trial run (no unmasked PII in
   any posted bundle) per ADR §3.
5. Close-out note records flake sources observed (fonts/Skia/shimmer/dates)
   and names the routes proposed for Phase-1 blocking — or recommends
   no-go with reasons.
6. Explicit user approval obtained before any `.github/workflows/screenmap-*.yml`,
   `eas.json` profile, `app.json`, or sacred-pin change. This trial doc
   authorizes none of them.

## 7. References

- `apps/gurudevi-mobile/docs/research/2026-09-04-agent-docs-skills-qa.md`
  (§3.3, §5.4, §6 rec 1); `2026-09-04-build-bundler-tooling.md` (§Gap table,
  §Recommendation 4); `2026-09-04-forage-candidate-catalog.md` (§2, §5).
- Repo: `.github/workflows/` (11 files, no screenmap-*); `eas.json:27-43`
  (preview channel); `playwright.config.ts:59-61` (failure forensics);
  `tests/e2e/navigation.spec.ts`, `tests/e2e/web-shell.spec.ts`.
- Web (2026-09-04): `https://screenmap.dev/`,
  `https://github.com/aleqsio/screenmap`, `https://starsling.dev/cli`,
  `https://docs.starsling.dev/sling-cli`,
  `https://github.com/starslingdev/skills/blob/main/skills/sling/SKILL.md`.
