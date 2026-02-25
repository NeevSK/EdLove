# Sustainable Implementation Strategy
## Split approach for One-time Structural Fixes vs Recurring Quality Programs

You are absolutely right: findings from the audits naturally split into two categories that should be managed differently.

- **Category A (One-time / finite refactors):** QR flow unification, package redundancy consolidation.
- **Category B (Recurring / continuous quality):** accessibility, localization, architecture health, reliability, security posture.

A sustainable execution model needs **two separate strategies** with different governance, ownership, KPIs, and cadence.

---

## 1) Strategy A — Structural Convergence Program (One-time, finite)

## Goal
Remove architectural fragmentation that causes repeated bugs and duplicated maintenance.

## Scope
1. **QR flow convergence**
   - Canonical payload format/versioning.
   - Central resolver/router for scan outcomes.
   - Unified generation + share + consume contracts.
2. **Package redundancy convergence**
   - Eliminate duplicate API/component forks in app-local `src` when package source-of-truth exists.
   - Keep only thin app wrappers for truly app-specific behavior.

## Delivery model
- **Program duration:** 6–10 weeks.
- **Team shape:** small tiger team (1 tech lead, 2–3 implementers, 1 QA/automation shared).
- **Change policy:** freeze net-new QR/redundancy-related features until convergence milestones pass.

## Workstreams and milestones
### A1. Contract freeze (Week 1)
- Approve QR payload schema and migration policy.
- Approve package ownership matrix (which package owns what).
- Produce deprecation list for duplicate mobile modules.

### A2. Migration + compatibility layer (Weeks 2–5)
- Build resolver and route all scanners through it.
- Add backward-compatible parser for legacy payloads.
- Replace direct imports of duplicated modules with package APIs.

### A3. Removal + enforcement (Weeks 6–8)
- Remove deprecated duplicate files.
- Add CI checks to block reintroduction of duplicate paths.
- Add integration tests for QR join/claim/group flows.

### A4. Hardening + handoff (Weeks 9–10)
- Load/perf + failure-path testing.
- Security review for ownership-changing actions.
- Publish architecture decision records (ADRs) and hand over to steady-state teams.

## Exit criteria (must be true)
- 100% scanner entry points route through central resolver.
- No unmanaged QR payload formats in production paths.
- Redundancy inventory closed (or explicitly waived with owner/date).
- CI guardrails active (import boundaries + duplication checks).

---

## 2) Strategy B — Continuous Quality Operating System (Recurring)

## Goal
Continuously improve app quality dimensions that naturally regress over time: a11y, localization, reliability, security, performance.

## Scope
- Accessibility compliance and regression prevention.
- Localization completeness and translation freshness (`en/si/ta`).
- Reliability/SLO trends (sync, auth, join flows).
- Type-safety and architecture hygiene debt burn-down.

## Operating cadence
- **Sprint cadence:** every sprint includes quality budget.
- **Monthly quality review:** scorecards + incident trends + top regressions.
- **Quarterly reset:** targets adjusted and roadmap refreshed.

## Quality governance model
### B1. “Quality budget” per sprint
Reserve fixed capacity (e.g., 20%) for recurring quality backlog:
- a11y fixes,
- localization key parity,
- flaky test cleanup,
- typed contract tightening,
- performance hotspots.

### B2. Release gates (automated)
A release cannot ship unless minimum bars pass:
- a11y lint/tests for interactive elements,
- missing i18n key checks for `si/ta` parity,
- critical journey E2E smoke tests,
- error-rate/SLO thresholds.

### B3. Ownership model
- **Feature teams** own quality in their surfaces.
- **Platform/architecture guild** owns shared guardrails (linters, CI policies, ADRs, dashboards).
- **Localization owner** manages translation workflow SLA.

### B4. Scorecards (tracked every sprint)
Suggested metrics:
- A11y coverage score (controls with labels/roles/hints).
- Localization parity score (`si`, `ta` vs `en`).
- Hardcoded string count trend.
- Critical flow success rates (auth, invite, join, sync).
- Crash-free sessions and severe error rate.

---

## 3) Combined governance: how both strategies coexist

## Principle
- **Program mode** for convergence work (A): intense, finite, milestone-driven.
- **Operating mode** for quality work (B): permanent, metric-driven.

## Planning rule
- During Strategy A window, keep Strategy B minimum viable guardrails active (don’t pause quality).
- After Strategy A exits, fold remaining debt into Strategy B backlog and maintain through gates.

## Portfolio split recommendation
- For first 2 months: **60% structural convergence / 40% recurring quality**.
- After convergence exit: **20% recurring quality baseline** every sprint (never 0%).

---

## 4) Concrete implementation plan (next 12 weeks)

## Weeks 1–2
- Ratify two-track governance in engineering leadership sync.
- Finalize QR schema + package ownership matrix.
- Enable baseline quality dashboards (a11y/i18n/smoke tests).

## Weeks 3–6
- Implement QR resolver + migrate scanner entry points.
- Start duplicate module replacement wave 1 (APIs first).
- Add automated i18n parity + a11y checks to CI (warn mode).

## Weeks 7–9
- Remove deprecated QR/redundant paths.
- Duplicate replacement wave 2 (components/hooks).
- Switch CI quality checks from warn to fail for critical rules.

## Weeks 10–12
- Close convergence punch-list.
- Publish ADRs/runbooks.
- Transition ownership to recurring quality operating model with fixed sprint budget.

---

## 5) Risks and mitigations

1. **Risk:** convergence work breaks active features.
   - **Mitigation:** compatibility layer + feature flags + staged rollout.
2. **Risk:** quality work gets deprioritized after deadline pressure.
   - **Mitigation:** hard release gates + mandated sprint quality budget.
3. **Risk:** ownership confusion across packages/apps.
   - **Mitigation:** explicit ownership matrix + CODEOWNERS + ADR references.
4. **Risk:** teams bypass new contracts.
   - **Mitigation:** CI import/contract checks + resolver-only policy.

---

## 6) Final recommendation
Treat this as **two different management problems**:

- **Structural Convergence Program** (one-time): aggressively fix QR contract fragmentation and package duplication.
- **Continuous Quality OS** (recurring): institutionalize a11y/localization/quality as ongoing engineering discipline.

This split avoids a common trap: doing a one-time cleanup and then drifting back into the same debt.
