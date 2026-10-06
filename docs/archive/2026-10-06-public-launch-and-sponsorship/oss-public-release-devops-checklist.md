---
title: "OSS Public Release — DevOps & Release Engineering Checklist"
status: "active"
created: 2026-10-02
updated: 2026-10-02
author: "Naveen"
scribe: "opencode"
tags: [devops, ci-cd, release-engineering, oss, portability, open-source, github-actions]
---

# OSS Public Release — DevOps & Release Engineering Checklist

Companion to
[`oss-public-release-security-checklist.md`](./oss-public-release-security-checklist.md).
That document covers **what must be safe**. This one covers **whether the project
can be built, verified, and released by someone who is not the original author,
on a platform they do not own**.

If the security checklist is the gate on *disclosure*, this one is the gate on
*participation*. A repository that is secure but uninstallable gets zero external
contributions; a repository that installs but whose CI silently skips its own
security gates is worse than private, because it manufactures false confidence.

Related:

- [`developer-environment-and-distribution-plan.md`](./developer-environment-and-distribution-plan.md) — **the plan behind §1 and §8 below**: why Windows should not build Android natively, the WSL2 mechanics, toolchain single-sourcing, and the Phase 0–5 fix sequence
- [`production-readiness-program.md`](./production-readiness-program.md) — runtime/release readiness gates
- [`doppler-secrets-management-guide.md`](./doppler-secrets-management-guide.md) — secrets source of truth
- [`git-branching-model.md`](./git-branching-model.md) — branch promotion model
- [`../architecture/production-evidence-governance.md`](../architecture/production-evidence-governance.md) — G0–G5/R1 evidence contract

---

## 0. Verified current posture

Confirmed by inspection on 2026-10-02. Re-verify before the flip.

| Fact | Value | Source |
|---|---|---|
| Workflows | 12 | `.github/workflows/` |
| Declared toolchain | `pnpm@12.4.2`, Node `>=22.23.0 <23` | `package.json:183-186` |
| pnpm in CI | `12.4.2` everywhere (was `12.1.0` ×4, `11.21.0` ×5) | workflow `version:` keys |
| Workflows declaring `permissions:` | 7 of 12 | `.github/workflows/*.yml` |
| Actions pinned to SHA | 0 | all `uses:` use mutable tags |
| `.gitleaks.toml` present | yes | repo root |
| **`gitleaks` invoked by CI** | **never** — `gitleaks` is a devDependency, and `scripts/check-shiny-tools.mjs` only checks local install | `git grep gitleaks` |
| `audit:security` actually runs | Snyk + Semgrep via `pnpm dlx` — **not** gitleaks | `package.json:26` |
| Changesets | configured (`.changeset/config.json`, 3 pending) | `.changeset/` |
| Windows-only root scripts | 6 entries invoking `powershell -File *.ps1` | `package.json` |
| POSIX-only `clean` scripts | `rm -rf` across ~20 packages | `apps/*`, `packages/*` |
| Unverifiable dependency resolution | **0** — all `@intuitui-labs/*` resolve from npm registry ranges | see §1.1 |
| pnpm publish cooldown | disabled (`minimumReleaseAge: 0`) | `pnpm-workspace.yaml:6` |

---

## 1. P0 — Release gate: a stranger must be able to build this

No visibility flip until every row closes. Each row names the evidence, per the
[test-claim protocol](../../AGENTS.md#test-claim-protocol--mandatory-for-every-agent-and-code-review).

| # | Blocker | Why it blocks | Evidence to close |
|---|---|---|---|
| D-1 | Fix 4 absolute `link:` dependencies (§1.1) — ✅ **code done**, Linux/WSL2 verified; macOS + native-Windows CI still pending | `pnpm install` fails for 100% of external contributors and leaks the author's filesystem layout | Clean-clone `pnpm install --frozen-lockfile` succeeds on Linux **and** macOS |
| D-2 | Fix PR CI trigger branches (§2.1) | `pr-guard.yml` listens on `main`/`develop`; default branch is `main-dev` and `develop` does not exist. Every external PR runs **no checks** | PR against `main-dev`, all jobs green |
| D-3 | Move security scanning onto PRs (§2.1) | `audit:security` runs on a weekly cron only. No PR is ever scanned | PR-triggered security job, green |
| D-4 | Make `gitleaks` an actual CI gate (§2.2) | `.gitleaks.toml` is a decorative control — no workflow invokes the tool | PR-triggered full-history gitleaks job, green |
| D-5 | Reconcile pnpm versions (§1.2) — ✅ **done**, all 16 steps now `12.4.2` | `12.4.2` declared vs `12.1.0` vs `11.21.0` in CI. Classic "works on my machine" | One version, sourced from `packageManager`, everywhere |
| D-6 | Declare `permissions:` in the 5 workflows missing it (§2.3) | `pr-guard` and `quality-gate` run untrusted PR code with the default token scope | Every workflow declares least-privilege `permissions:` |
| D-7 | Make root scripts cross-platform (§1.3) | 6 root scripts hard-require PowerShell; contributors on Linux/macOS cannot run the documented gate commands | `pnpm lint && pnpm check-types && pnpm test` on Linux + macOS |
| D-8 | Pin actions to SHA (§2.4) | All 20+ `uses:` track movable tags | Zero `@vN` refs; pinning-aware scanner clean |
| D-9 | Set a non-zero `minimumReleaseAge` (§1.4) | `0` opts out of the publish cooldown | Non-zero value, or a written risk acceptance |
| D-10 | Un-track the 91 ignored-but-committed files | Compiled `.js` beside `.ts` breaks contributor builds and code review (security §1.7) | `git ls-files -c -i --exclude-standard` empty |
| D-11 | Branch protection on all five branches | An unprotected default branch lets any account with push access publish a release | Rulesets exported showing required checks |
| D-12 | Document the contributor path end to end | An undocumented setup is an unusable one | §8 checked by an outsider following only `README.md` |

### 1.1 Absolute-path dependencies

> **Status: RESOLVED and verified (2026-10-02).** All `link:` specifiers, the
> Metro override, and the lockfile entries are gone. A clean clone on WSL2
> (Linux ext4) completes `pnpm install --frozen-lockfile` with exit 0
> (115,846 files). Evidence:
> [`developer-environment-and-distribution-plan.md` §11](./developer-environment-and-distribution-plan.md).
>
> This section is kept because it explains *why* the migration was necessary and
> **why `link:` must never come back**.

Four tracked `package.json` files previously referenced a hardcoded path on the
author's machine. These are unresolvable anywhere else, so `pnpm install` failed
before a contributor could run anything.

| File | Was | Now |
|---|---|---|
| `packages/editorial/package.json` | `"link:C:/projects/packages/editorial"` (self-link) | `"@intuitui-labs/editorial": "^0.1.1"` |
| `packages/ui/package.json` | `"@intuitui-labs/a11y-gate": "link:C:/projects/packages/a11y-gate"` | `"^0.2.0"` |
| `apps/gurudevi-marketingWeb/package.json` | same `link:` | `"^0.2.0"` |
| `apps/edlove-web/package.json` | same `link:` | `"^0.2.0"` |

All four `@intuitui-labs/*` packages are published on npm under the
`@intuitui-labs` scope, all MIT. Verified against the live registry on
2026-10-02:

| Package | Published | Declared as | Status |
|---|---|---|---|
| `@intuitui-labs/a11y-gate` | `0.1.0`, **`0.2.0`** | `"^0.2.0"` in `packages/ui`, `apps/edlove-web`, `apps/gurudevi-marketingWeb` | ✅ done |
| `@intuitui-labs/editorial` | `0.1.0`, **`0.1.1`** | `"^0.1.1"` in `packages/editorial` (facade) | ✅ done |
| `@intuitui-labs/form-builder-engine` | **`0.1.0`** | `"^0.1.0"` in `packages/core`, `packages/form-builder` | ✅ done |
| `@intuitui-labs/lk-edu-geo` | **`1.0.1`** (`1.0.2` prepared, not yet published) | `"^1.0.1"` in `packages/graphics` | ⚠️ see defect note below |

`packages/editorial` is `@repo/editorial`, a facade re-exporting the published
upstream. Both Astro apps consume it, so it stays; it adds nothing upstream lacks
and needs no bidirectional sync.

> **Never reintroduce `link:`.** Measured, not assumed: `npm pack` embeds a
> `link:` path verbatim into the tarball. A consumer installing that tarball
> fails with `EUNSUPPORTEDPROTOCOL`; pnpm can exit `0` while silently omitting the
> package, then fail at runtime with `MODULE_NOT_FOUND`. For local iteration, use
> `pnpm pack` + install the tarball.

`form-builder-engine` and `lk-edu-geo` have been removed as in-repo workspace
packages and now resolve from the registry.

Subpath compatibility was verified, not assumed — this matters because these
were previously consumed as workspace sources:

- `form-builder-engine@0.1.0` exports all seven subpaths the repo imports
  (`/analytics`, `/codegen`, `/core`, `/hydration`, `/ports`, `/schema`,
  `/validation`), each with `types`.
- `lk-edu-geo@1.0.1` is imported by bare specifier only; `.` is exported.
- `a11y-gate@0.2.0` exports all four subpaths `packages/ui` imports (`.`,
  `/mobile`, `/wcag3`, `/web`), each with `types`.

Caveat on `form-builder-engine`: it also declares a `./*` wildcard, so a typo'd
subpath passes resolution and fails at load time rather than at build time.

All six steps completed:

1. ✅ Three `a11y-gate` manifests now declare `"^0.2.0"`.
2. ✅ The `candidateA11yPaths` / `extraNodeModules` override block at
   `apps/gurudevi-mobile/metro.config.js:231-242` is **deleted**, not repaired.
   Do not re-add it. It resolved `fs.existsSync` over three hardcoded paths and
   silently *skipped* the override when none matched (no error), and silently
   *forced* a local directory instead of the installed package when one did —
   either way Metro built against something other than what the manifest
   declared. For local engine editing use `pnpm pack` + install the tarball.
3. ✅ The `editorial` self-dependency is resolved: `packages/editorial` is a
   facade over the published `^0.1.1`.
4. ✅ `pnpm-lock.yaml` regenerated via `pnpm install --lockfile-only`. Zero
   `C:/projects`, `/home/`, or external `link:` references remain. Remaining
   `link:` entries are internal workspace links, which are correct.
5. ✅ `docs/architecture/external-packages-linking.md` §4C and
   `2026-09-05-a11y-gate-canonical-consolidation.md` Phase 1 corrected.
6. ✅ `git grep` finds no `C:/projects`, `/home/nsk/projects`, or personal
   `fd.exe` paths in tracked code. Remaining matches are historical and
   decision-record docs, plus `scripts/lib/wsl-workspace.mjs` which reads
   `$HOME`/`POLYMATH_WSL_DIR`.

### 1.1b Two defects surfaced by the clean-clone run

Neither was caused by the migration, and both are now recorded:

- **`check-types` failed on a fresh clone** because no `.astro/` directory
  existed, leaving `astro:content` untyped (`TS7031` in `feed.xml.ts`). Each
  Astro app now runs `astro sync` as a prerequisite of `check-types`. Verified
  by deleting `.astro/` and re-running: 3/3 tasks pass.
- **`lk-edu-geo@1.0.1` throws `ERR_IMPORT_ATTRIBUTE_MISSING` in real Node ESM**
  (missing `with { type: 'json' }`). Bundlers hid it and no test imported
  `dist/`. Fix is committed and pushed upstream (`Intuitui-Labs/lk-edu-geo`,
  commit `20e024a`, version `1.0.2`, upstream suite 3 files / 19 tests passing)
  but **`1.0.2` is not on the registry yet**. Because `packages/graphics`
  declares `^1.0.1`, a fresh install can still select the broken `1.0.1` and fail
  at runtime with this exact error. **Blocker: publish `1.0.2`, then
  `pnpm install --lockfile-only` and re-verify.**

Full detail in
[`developer-environment-and-distribution-plan.md` §11](./developer-environment-and-distribution-plan.md).

### 1.1c Known remaining blocker (not migration-related)

`packages/core/src/api/server.ts:36` imports
`@repo/core/api/profile.orpc.contract`, which **does not exist in the repository**.
It is the only one of five oRPC contracts referenced by `server.ts` that is
missing. Present at `HEAD` (76035c45a), untouched by these changes.

Not fixed here: authoring that contract requires choosing endpoint paths,
schemas, and authorization policy — a domain decision. Until it is authored,
`@repo/core` `check-types` reports one `TS2307`.

For reference, see
[`developer-environment-and-distribution-plan.md`](./developer-environment-and-distribution-plan.md) §6.1–6.4.

Acceptance test — clean clone, no author machine, both platforms:

```bash
git clone <repo> edlove-clean && cd edlove-clean
corepack enable
pnpm install --frozen-lockfile     # must succeed
pnpm run check-types              # must succeed
pnpm run lint                     # must succeed
pnpm test                         # must succeed
```

Run it on GitHub Actions (`ubuntu-latest` **and** `macos-latest`) so the evidence
is reproducible by a third party rather than asserted in a document.

**Current evidence (2026-10-02, WSL2 / Linux ext4):** `install --frozen-lockfile`
✅, `check-types` ⚠️ (one pre-existing `TS2307`, §1.1c), `lint` not run,
`test` ⚠️ (one pre-existing `@repo/ui` failure). **No native-Windows,
macOS, or Linux-native run exists yet.** Adding the CI matrix is what converts
this section from "verified on one platform" to a release gate.

### 1.2 Toolchain drift

> **Status: RESOLVED.** All 16 active `pnpm/action-setup` steps now pin `12.4.2`,
> matching `packageManager`. Node is pinned to `22.23.2` in `.nvmrc`, `mise.toml`,
> and all workflows. `bun` is retained in `mise.toml` because
> `apps/sanctuary-api` uses it.

| Location | pnpm |
|---|---|
| `package.json` `packageManager` | `12.4.2` |
| `pr-guard.yml`, `quality-gate.yml`, `storage-contract.yml`, `deploy-canary.yml` | `12.4.2` (was `12.1.0`) |
| `android-build.yml`, `browser-e2e.yml`, `cloudflare-gurudevi-platform.yml`, `eas-release.yml`, `sentry-sourcemap-upload.yml` | `12.4.2` (was `11.21.0`) |

Fix: remove the hardcoded `version:` from every `pnpm/action-setup` step and let
`packageManager` be the single source of truth. Two consequences worth stating
explicitly:

- **Node is pinned narrow.** `engines.node: ">=22.23.0 <23"` is correct for
  reproducible builds but hostile to newcomers — a contributor on Node 24 gets a
  hard failure. Document the requirement prominently in `README.md` and provide
  `.nvmrc` and/or a `volta` pin so setup is one command.
- **A major-version pin is intentional, not accidental.** Do not "fix" it by
  widening the range; that reintroduces the drift.

### 1.3 Cross-platform scripts

Two mutually exclusive idioms are both in use, so the documented gate commands
fail on one platform each.

| Problem | Count | Examples |
|---|---|---|
| `powershell -ExecutionPolicy Bypass -File *.ps1` | 6 root scripts | `biome:audit`, `audit:size`, `maintenance:outdated`, `audit:deprecations`, `audit:mobile:doctor` |
| `rm -rf` in `clean` | ~20 packages | every `apps/*` and most `packages/*` |

Required:

- [ ] Replace `powershell -File scripts/*.ps1` with `node scripts/*.mjs`. The
      repo already has the pattern — `scripts/run-and-report.mjs` is a Node
      wrapper used by the newer scripts. Port the six PowerShell scripts rather
      than shipping a Windows-only gate.
- [ ] Replace `rm -rf` with `node -e "fs.rmSync(...)"` or `rimraf` (already a
      resolved dependency in `overrides`), so `clean` works on every platform.
- [ ] Confirm no other script assumes a Windows path separator or a `C:\` prefix.

### 1.4 pnpm configuration as release infrastructure

`pnpm-workspace.yaml` gates every install. Full supply-chain treatment is in the
security checklist §4.5; the DevOps-relevant items:

- [ ] `minimumReleaseAge` set to a non-zero value (recommend `4320`) and the full
      install/build re-verified afterwards — this changes resolution and will
      surface previously-invisible breakage.
- [ ] `trustPolicy: no-downgrade` set.
- [ ] `allowBuilds` reviewed (30 entries, all `true` = 30 install-time code
      executions). Every addition must be a reviewed decision.
- [ ] `patchedDependencies` (3 patches) reviewed by the same standard as
      dependencies.

---

## 2. CI/CD pipeline

### 2.1 Trigger coverage

| Workflow | Current trigger | Problem | Required |
|---|---|---|---|
| `pr-guard.yml` | `main`, `develop` | `main-dev` is the default branch; `develop` does not exist | `pull_request` → `main-dev` (and every protected branch) |
| `quality-gate.yml` | weekly cron + manual dispatch | `audit:security`, coverage, bundle, a11y never run on a PR | `pull_request` (tiered) + retain the cron |
| `doppler-contract.yml` | needs verification | must run on PRs that touch config or workflows | `pull_request` paths filter |
| `workflow-lint.yml` | needs verification | must cover every workflow | `pull_request` paths `.github/**` |
| `storage-contract.yml` | needs verification | schema drift on a PR is the point | `pull_request` paths on `packages/database`, `packages/core` |
| `android-build.yml`, `browser-e2e.yml`, `cloudflare-*`, `web-deploy.yml`, `deploy-canary.yml`, `eas-release.yml`, `sentry-sourcemap-upload.yml` | deploy/release | confirm none fires on fork PRs | deploy only on `push` to protected branches |

Design guidance: run cheap checks on **every** PR, and the expensive
security/coverage/bundle tier on PRs touching security-relevant paths, to keep
the suite fast enough that people do not bypass it.

### 2.2 gitleaks must actually run

`.gitleaks.toml` exists, `gitleaks` is a devDependency (`^1.0.0`), and
`scripts/check-shiny-tools.mjs` verifies only that the binary is installed
locally. **No workflow invokes it.** `audit:secrets` is a misleading name — it
runs `scripts/verify-doppler-config.mjs`, which checks the Doppler config
contract, not for leaked credentials.

A control file without an invocation is a comment. Add:

```yaml
- name: Secret scan (full history)
  run: pnpm exec gitleaks detect --source . --log-opts="--all" --redact --exit-code 1
```

- [ ] Full-history scan (`--log-opts="--all"`) on PRs — a secret introduced two
      commits ago and moved into a file on this PR must still fail.
- [ ] Audit `.gitleaks.toml` for an allowlist that has grown to suppress
      findings. An allowlist that silences real issues is worse than none.
- [ ] Enable GitHub secret scanning and push protection (free on public repos).
- [ ] Document the rotation table from security §1.1 so a contributor who finds
      a leak knows it is handled.

### 2.3 Least-privilege tokens

5 of 12 workflows declare no `permissions:` at all — including `pr-guard.yml` and
`quality-gate.yml`, which execute untrusted pull-request code.

- [ ] Add explicit `permissions:` to every workflow and every job.
- [ ] Set a repository-level **default workflow permissions** to "read
      repository contents" so a newly added workflow is safe by omission.
- [ ] Grant `contents: write` only to the jobs that actually release.
- [ ] Use `persist-credentials: false` on `actions/checkout` in any job that also
      runs untrusted code.
- [ ] Keep `pull_request` (not `pull_request_target`). Verified absent today —
      keep it absent.

### 2.4 Action pinning

Zero of the 20+ `uses:` references are SHA-pinned. Two current safeguards are
therefore missing at once: nothing detects a compromised action, and nothing
detects that pinning went stale.

- [ ] Pin every action to a full commit SHA with the tag in a trailing comment.
- [ ] Enable Dependabot's `github-actions` ecosystem so pins receive updates —
      **Dependabot does not alert on SHA-pinned actions without it.**
- [ ] Reconcile with `renovate.json` so only one tool opens PRs (security §12.4).
- [ ] Add `zizmor` to `workflow-lint.yml` so pinning, `pull_request_target`, and
      template-injection regressions fail CI instead of review.

### 2.5 Unpinned tooling at CI time

`audit:security` runs `pnpm dlx snyk test --all-projects && pnpm dlx semgrep scan
--config auto`. Two independent problems: `pnpm dlx` resolves latest-at-runtime,
so CI executes whatever the registry serves that minute; and `--config auto`
varies by machine and date, so results are not reproducible and a green run
yesterday proves nothing today.

- [ ] Pin Snyk and Semgrep as devDependencies; call them via `pnpm exec`.
- [ ] Select and pin an explicit Semgrep ruleset instead of `auto`.
- [ ] Same treatment for `npx -y react-doctor`.
- [ ] Never let a PR-triggered job resolve `package.json` tooling from a
      modified fork manifest.

### 2.6 Required checks

Once §2.1–§2.5 close, make these **required** on `main-dev`:

```
pnpm install --frozen-lockfile
pnpm run check:test-evidence -- --changed
pnpm check-types
pnpm lint
pnpm test
gitleaks detect --source . --log-opts="--all"
pnpm run audit:security
```

`check:anti-slop` is currently `continue-on-error` in both `pr-guard.yml` and
`quality-gate.yml`, which makes the `AGENTS.md` merge gate advisory only. Either
make it blocking or delete the claim from `AGENTS.md` — a documented gate that
cannot fail is worse than no gate.

---

## 3. Environments and secrets plumbing

- [ ] `dev` / `stg` / `prd` Doppler model documented in `README.md` for
      contributors, with the exact commands to get `dev` running.
- [ ] `.env.example` per app documents every variable name **without values**,
      and marks which are safe to publish and which are not (security §2.3).
- [ ] No workflow reads a secret from a default, fallback, or literal. Secrets
      are referenced by name only.
- [ ] `load-doppler-env` composite action reviewed: confirm it masks values in
      output and does not echo a full Doppler download to logs.
- [ ] Contributor onboarding never requires a production credential. A stranger
      must be able to run the full local suite on their own Supabase project.
- [ ] Document which integrations are unavailable without paid accounts
      (Snyk, EAS, Doppler, GrowthBook) and provide a degraded path, so a
      contributor is not blocked by someone else's billing.

---

## 4. Versioning, releases, and publishing

- [ ] Changesets are configured (they are — `.changeset/config.json`) and 3
      changesets are currently pending. Decide whether they are consumed before
      the flip or carried into the first release.
- [ ] Decide the release unit: five apps and ~20 packages cannot all version
      together. A `@repo/*` change should not force an `edlove-web` release.
- [ ] Mark every package `private: true` unless it is genuinely published to npm
      (security §12.11) — otherwise `pnpm publish -r` leaks internal source.
- [ ] First public release is tagged, annotated, and signed. Unsigned tags cannot
      carry attestations and cannot be verified by consumers.
- [ ] `CHANGELOG.md` per released app, generated from changesets.
- [ ] Release notes state the supported-versions matrix (security §12.15) so
      downstream users know what they are pinned to.
- [ ] Reproducible-enough builds for the mobile app, or an explicit statement
      that bit-reproducibility is not a goal. Either is defensible; silence is not.
- [ ] SPDX/CycloneDX SBOM emitted per released app, not per package (security §12.7).

---

## 5. Branching and merge controls

Per `git-branching-model.md`: `main-innovate` → `main-dev` → `main-QA` →
`main-preview` → `main`.

- [ ] Protected ruleset on all five branches.
- [ ] Required status checks (§2.6) enforced on `main-dev` and above.
- [ ] Required review on `main-QA`, `main-preview`, `main`.
- [ ] Linear history enforced — the model uses merges, not rebases.
- [ ] Signed commits required on `main`.
- [ ] Tag protection: release tags restricted to maintainers.
- [ ] Force-push disabled on every branch.
- [ ] `.github/CODEOWNERS` with mandatory review on authorization surfaces:
      `apps/sanctuary-api/**`, `packages/policies/**`, `packages/database/**`,
      `packages/core/src/logic/permissions/**`, `.github/workflows/**`.
- [ ] Confirm PRs from forks can run CI without a maintainer granting anything
      (they can, via `pull_request`; verify no job needs a secret).

---

## 6. Observability and operational handoff

Publishing source invites contributors who cannot see production. Be explicit
about what they can and cannot observe, so they do not file speculative bugs.

- [ ] Public health/readiness endpoints documented and free of internal detail.
- [ ] `README.md` states where issues belong: bugs in the tracker, security in
      the channel from `SECURITY.md`, questions in Discussions.
- [ ] Issue templates redirect security reports away from the public tracker
      (security §12.13).
- [ ] PR template requires the evidence block from §7 and the AI-disclosure line
      from security §10.5.
- [ ] `.github/ISSUE_TEMPLATE/config.yml` disables blank issues, which is where
      un-actionable and sensitive reports land by default.
- [ ] `SUPPORT.md` distinguishes support from vulnerability reporting.

---

## 7. Evidence and reporting standard

Per `AGENTS.md` and `production-evidence-governance.md`, no DevOps claim closes on
an unqualified "tests passed". Each gate row in §1 requires:

- the exact command and the configuration file it read;
- the evidence level (G0–G5/R1);
- the runner, OS, and runtime version;
- the scenario exercised and the passed/failed count;
- what the result does **not** prove.

A green `ubuntu-latest` run is not evidence about `macos-latest`, a real device,
or a fork clone. Report:

```text
G0 contract / Node 22.23.0 / ubuntu-latest — pnpm install --frozen-lockfile
— clean clone @<sha>: 1/1 passed.
Proves: lockfile resolves with no absolute-path or missing-workspace errors on Linux.
Does not prove: macOS or Windows resolution, native build scripts, or a first-time
contributor's experience.
```

Re-run the §1.1 acceptance test on `macos-latest` before claiming portability. Do
not extrapolate one platform's result to another.

---

## 8. Contributor onboarding checklist

The §1 acceptance test is only meaningful if an outsider can find the steps.
Walk this path as a stranger, using only `README.md`.

- [ ] `README.md` states the project, prerequisites (Node 22.x, pnpm via
      Corepack), and a 5-minute quickstart.
- [ ] Quickstart verified by actually following it on a clean machine.
- [ ] `CONTRIBUTING.md` explains branch model, commit convention, the PR
      template, and the evidence requirement.
- [ ] `AGENTS.md` is either published intentionally or replaced with a public
      stub. At 387 KB it is agent-operational context, not contributor
      documentation — decide, and make `README.md` the real entry point.
- [ ] Every gate command in `AGENTS.md` runs on Linux and macOS (D-7). A
      documented command that fails for contributors is worse than an
      undocumented one.
- [ ] `LICENSE` is unambiguous at the root and mirrored into any published
      package.
- [ ] A maintainer response path for external PRs exists, so contributors learn
      whether review is expected.
- [ ] First-run experience measured: time to `pnpm install` green, and every
      step that required asking the maintainer.

---

## 9. Per-app DevOps matrix

Legend: **R** required before flip, **P** required before that app serves real
users, **O** ongoing.

| App | Item | Pri |
|---|---|---|
| **All** | Absolute `link:` deps removed; clean-clone install on Linux + macOS | R |
| **All** | `pnpm` version consistent with `packageManager` | R |
| **All** | Every workflow declares `permissions:`; SHA-pinned actions | R |
| **All** | `gitleaks` full-history scan running on PRs | R |
| **All** | Actions pinned; Dependabot `github-actions` enabled | R |
| `gurudevi-mobile` | EAS build profile reviewed — no secrets in `app.json` `extra`; release keystore external | R |
| `gurudevi-mobile` | `android/` + `ios/` stay gitignored; native config only via `app.json` + `plugins/` | R |
| `gurudevi-mobile` | Android build verified on CI (Linux) and document the Windows-host limitation from `AGENTS.md` | P |
| `gurudevi-mobile` | OTA update channel + rollback policy documented | P |
| `gurudevi-mobile` | Release APK signed and checksummed | P |
| `gurudevi-mobile` | Low-end device + offline matrix (§`production-hardening-guide.md`) | P |
| `gurudevi-web` | Preview deploys `noindex`; production canonical/sitemap verified | P |
| `gurudevi-web` | Build reproducible on Linux CI; Vercel/Cloudflare config documented | P |
| `gurudevi-web` | Browser E2E journey green at G4 | P |
| `gurudevi-marketingWeb` | Astro build green on Linux CI; static host + headers documented | R |
| `gurudevi-marketingWeb` | a11y and asset licenses cleared | P |
| `edlove-web` | Astro build green on Linux CI | R |
| `edlove-web` | Three.js/WebGL asset licenses and attribution | P |
| `sanctuary-api` | Health/readiness endpoints documented and public-safe | P |
| `sanctuary-api` | OpenAPI spec generated and drift-checked in CI | P |
| `sanctuary-api` | Deployment target documented with runbook; no production credentials needed for local dev | P |
| `packages/*` | `private: true` or explicit `publishConfig` on non-published packages | R |
| `packages/*` | Changesets release flow exercised once end to end | P |
| `packages/*` | SBOM emitted for published packages | O |

---

## 10. Sign-off

| Role | Confirms | Signature | Date |
|---|---|---|---|
| Maintainer | §1 gate complete; clean clone installs on Linux + macOS | | |
| CI owner | §2 complete; required checks green on a fork PR against `main-dev` | | |
| Release owner | §4 and §5 complete; first public tag signed and announced | | |
| Documentation | §8 walked by someone outside the project | | |

Record the public commit SHA and the flip date here, and copy it into
`CHANGELOG.md`. Later commits are public by association, so this is the earliest
point from which disclosure is irreversible:

| | |
|---|---|
| Flipped to public at | |
| Public commit SHA | |
| Approved by | |
| Security checklist state | P0-1…P0-15 closed / exceptions recorded |