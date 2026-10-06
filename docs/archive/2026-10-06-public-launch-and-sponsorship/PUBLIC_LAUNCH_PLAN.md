# Public Launch Plan — Polymath Platform (EdLove / Gurudevi)

**Status**: Draft — not yet executed
**Created**: 2026-10-02
**Target**: GitHub public repository `NeevSK/EdLove` (or `NeevSK/polymath-platform` after rename)
**Owner**: Naveen (maintainer)

---

## Phase 0 — Immediate Blockers (Must complete before ANY public push)

| ID | Task | Command / Action | Acceptance | Owner | ETA |
|----|------|------------------|------------|-------|-----|
| B-01 | Fix PR trigger branches | Edit `.github/workflows/pr-guard.yml`: change `branches: [main, develop]` → `branches: [main-dev]` | PR against `main-dev` runs lint + typecheck | Naveen | 15 min |
| B-02 | Fix changeset baseBranch | Edit `.changeset/config.json`: `"baseBranch": "main-dev"` | `pnpm change:smart` targets correct branch | Naveen | 5 min |
| B-03 | Fix clone URL in CONTRIBUTING | Edit `CONTRIBUTING.md`: `git clone https://github.com/NeevSK/EdLove` | Contributor can clone & install | Naveen | 5 min |
| B-04 | Add root `check-types` & `test` scripts | Edit `package.json` scripts: `"check-types": "pnpm turbo run check-types"`, `"test": "pnpm turbo run test"` | `pnpm run check-types` and `pnpm test` exit 0 on clean clone | Naveen | 10 min |
| B-05 | Publish `lk-edu-geo@1.0.2` | In `C:\projects\packages\lk-edu-geo`: create GitHub Release `v1.0.2` (triggers `publish.yml`) | `npm view @intuitui-labs/lk-edu-geo versions` includes `1.0.2` | Naveen | 15 min + CI |
| B-06 | Refresh lockfile & verify | `pnpm install --lockfile-only && pnpm run check-types && node -e "import('@intuitui-labs/lk-edu-geo')"` | Lockfile records 1.0.2; ESM import succeeds | Naveen | 5 min |

**Gate**: All B-* tasks ✅ before proceeding to Phase 1.

---

## Phase 1 — Security & Supply Chain Foundations (Required for Credible Public Repo)

| ID | Task | Command / Action | Acceptance | Owner | ETA |
|----|------|------------------|------------|-------|-----|
| S-01 | Add gitleaks to CI | Create `.github/workflows/security-gitleaks.yml` with PR + scheduled full-history scan | `gitleaks detect --source . --config .gitleaks.toml` runs on every PR + weekly cron | Naveen | 45 min |
| S-02 | Add security scanning to PR | Add `pnpm dlx snyk test --all-projects && pnpm dlx semgrep scan --config auto` step to `pr-guard.yml` (or new `security-scan.yml`) | PR shows Snyk + Semgrep results | Naveen | 30 min |
| S-03 | Add `permissions:` to 5 workflows | Edit `pr-guard.yml`, `quality-gate.yml`, `storage-contract.yml`, `deploy-canary.yml`, `sentry-sourcemap-upload.yml` with least-privilege permissions | Each workflow declares explicit `permissions:` | Naveen | 45 min |
| S-04 | Pin all actions to SHA | Run `step-security/harden-runner` audit or manually replace every `uses: X@vN` with `uses: X@sha256:...` | Zero mutable tags in `.github/workflows/*.yml` | Naveen | 60 min |
| S-05 | Set publish cooldown | Edit `pnpm-workspace.yaml`: `minimumReleaseAge: 7d` (or `14d`) | `pnpm publish` respects cooldown | Naveen | 5 min |
| S-06 | Add DCO | Create `DCO.md` (Developer Certificate of Origin 1.1); add `git commit -s` to CONTRIBUTING | Contributors sign off; CI can verify with `git log --show-signature` | Naveen | 15 min |
| S-07 | Add CODEOWNERS | Create `.github/CODEOWNERS` mapping critical paths (workflows, scripts, core packages) to `@NeevSK` | GitHub shows reviewers automatically | Naveen | 15 min |
| S-08 | Require signed commits | Enable "Require signed commits" branch protection on `main-dev`; document GPG/SSH setup in CONTRIBUTING | Unsigned pushes rejected | Naveen | 15 min |
| S-09 | Add SBOM / provenance | Add `pnpm sbom --format=spdx` (or `syft`) to release workflow; publish SLSA provenance artifact | Release includes `sbom.spdx.json` and provenance | Naveen | 45 min |
| S-10 | Harden Dependabot | Edit `.github/dependabot.yml`: add `schedule.interval: daily` for security, `groups: security` with `update-types: [patch]`, enable `allow: auto-merge` | Security PRs auto-merged; minor/patch auto-merged | Naveen | 30 min |

**Gate**: All S-* tasks ✅ before proceeding to Phase 2.

---

## Phase 2 — CI Matrix & Evidence (Cross-Platform Credibility)

| ID | Task | Command / Action | Acceptance | Owner | ETA |
|----|------|------------------|------------|-------|-----|
| M-01 | Add macOS matrix to pr-guard | Edit `pr-guard.yml`: `strategy.matrix.os: [ubuntu-latest, macos-latest]` | Both runners pass lint + typecheck | Naveen | 30 min |
| M-02 | Add macOS matrix to quality-gate | Edit `quality-gate.yml`: same matrix | Both runners pass quality checks | Naveen | 15 min |
| M-03 | Verify Android build on clean runner | Ensure `android-build.yml` produces APK artifact on `ubuntu-latest` | Workflow uploads `app-debug.apk` artifact | Naveen | 60 min |
| M-04 | Add native Windows matrix (or Codespaces) | Option A: Add `windows-latest` matrix to pr-guard (may fail due to path limits) — document known gap. Option B: Add `.devcontainer/devcontainer.json` with WSL2/Ubuntu image for Codespaces. | Contributors can build via Codespaces or documented WSL2 path | Naveen | 60 min |
| M-05 | Add iOS build verification | Add `eas-build` step on `macos-latest` (or document EAS-only) | iOS build passes or documented as manual | Naveen | 60 min |
| M-06 | Add anti-slop gate to CI | Add `pnpm run check:anti-slop` step to `pr-guard.yml` or `quality-gate.yml` | PR fails on slop patterns | Naveen | 15 min |
| M-07 | Add test-evidence audit to CI | Add `pnpm run check:test-evidence` step to CI | PR fails on unclassified test commands | Naveen | 15 min |
| M-08 | Document TypeScript `exactOptionalPropertyTypes` gap | Add note to `docs/engineering/typescript-policy.md`: ~500 errors, adopt per-package | Gap documented with migration plan | Naveen | 15 min |
| M-09 | Resolve core `TS2307` (profile contract) | Either author `packages/core/src/api/profile.orpc.contract.ts` OR add `// @ts-expect-error` with justification comment | `pnpm turbo run check-types` clean or documented exception | Naveen | 60 min |
| M-10 | Resolve UI test flake | Fix `PressableScale > applies disabled state` OR document as known unrelated flake with evidence | Test suite 100% green or documented exception | Naveen | 60 min |

**Gate**: All M-* tasks ✅ (or documented exceptions with evidence) before Phase 3.

---

## Phase 3 — Polish & Contributor Experience

| ID | Task | Command / Action | Acceptance | Owner | ETA |
|----|------|------------------|------------|-------|-----|
| P-01 | Delete stale root logs | `rm gurudevi-web-dev.log gurudevi-web-dev.err.log` | `git status` clean | Naveen | 2 min |
| P-02 | Update CONTRIBUTING Doppler section | Add complete "Without Doppler" path: `.env.example` files, mock Supabase, mock PowerSync | Contributor without Doppler can `pnpm dev` | Naveen | 30 min |
| P-03 | Add devcontainer | Create `.devcontainer/devcontainer.json` with Ubuntu + Node 22 + pnpm + Android SDK stub | `gh codespace create` opens working environment | Naveen | 45 min |
| P-04 | Verify production URL | Ensure `platform.gurudevi.edlove.org` resolves or replace badge | Badge links to live site | Naveen | 10 min |
| P-05 | Process changesets & create Release | `pnpm change:smart && pnpm version:all && git push && gh release create vX.Y.Z --generate-notes` | GitHub Release published; changelog updated | Naveen | 15 min |
| P-06 | Configure branch protection | Enable on `main-dev`: require PR, require status checks (pr-guard, quality-gate, security-gitleaks, anti-slop, test-evidence), require signed commits, require CODEOWNERS review | Settings → Branches → Branch protection rules | Naveen | 15 min |
| P-07 | Add security advisory template | Create `.github/ISSUE_TEMPLATE/security_advisory.yml` | Security reports routed correctly | Naveen | 10 min |
| P-08 | Add standard GitHub labels | `gh label create "good first issue" --color 7057ff --description "Good for newcomers"` etc. | Labels visible in Issues | Naveen | 10 min |
| P-09 | Add FUNDING.yml | Create `.github/FUNDING.yml` (even `custom: []`) | GitHub shows "Sponsor" button | Naveen | 5 min |
| P-10 | Add .env.example files | Create `apps/gurudevi-mobile/.env.example`, `apps/edlove-web/.env.example`, `apps/gurudevi-marketingWeb/.env.example` with placeholder keys | Contributor copies → works | Naveen | 20 min |

**Gate**: All P-* tasks ✅ before public announcement.

---

## Phase 4 — "Build in Public" Foundations (Post-Launch, Ongoing)

| ID | Task | Description | Target |
|----|------|-------------|--------|
| O-01 | Public project board | GitHub Projects board with "Backlog", "Ready", "In Progress", "Review", "Done" columns | Week 1 |
| O-02 | Public roadmap | `docs/ROADMAP.md` with quarterly themes, linked to issues | Week 1 |
| O-03 | RFC process | `docs/RFC_TEMPLATE.md` + `rfcs/` directory + lightweight review | Week 2 |
| O-04 | Community channel | Discord/Slack invite link in README + CONTRIBUTING | Week 1 |
| O-05 | Public API docs | Deploy `@repo/sanctuary-api` OpenAPI spec to `docs.api.gurudevi.edlove.org` via CI | Week 2 |
| O-06 | Architecture decision log | Publish `docs/decisions/*.md` as public ADRs (already mostly done) | Week 1 |
| O-07 | Release cadence doc | Document monthly minor / weekly patch schedule + changelog automation | Week 2 |
| O-08 | Support triage rotation | Assign weekly triage owner; document SLA for security (24h) / bugs (7d) | Week 2 |
| O-09 | Governance doc | `GOVERNANCE.md`: maintainer team, bus factor ≥2 per component, succession | Week 3 |
| O-10 | Contributor onboarding call | Monthly 30-min "Office Hours" for new contributors | Ongoing |

---

## Tracking

| Phase | Total Tasks | Done | In Progress | Blocked |
|-------|-------------|------|-------------|---------|
| 0 — Blockers | 6 | 0 | 0 | 0 |
| 1 — Security | 10 | 0 | 0 | 0 |
| 2 — CI Matrix | 10 | 0 | 0 | 0 |
| 3 — Polish | 10 | 0 | 0 | 0 |
| 4 — Ongoing | 10 | 0 | 0 | 0 |
| **Total** | **46** | **0** | **0** | **0** |

---

## Notes

- This plan assumes **solo maintainer** (Naveen). Adjust owners/ETAs if team grows.
- Each task should be a **separate commit/PR** with clear message referencing the ID (e.g., `S-03: add permissions to quality-gate.yml`).
- Run the **acceptance test** after Phase 0 and after Phase 3:
  ```bash
  git clone https://github.com/NeevSK/EdLove edlove-clean && cd edlove-clean
  corepack enable
  pnpm install --frozen-lockfile     # must succeed
  pnpm run check-types              # must succeed
  pnpm run lint                     # must succeed
  pnpm test                         # must succeed
  ```
- Run on **GitHub Actions** (`ubuntu-latest` + `macos-latest`) so evidence is reproducible.
- Do **not** announce publicly until Phase 0–3 gates pass and branch protection is enabled.