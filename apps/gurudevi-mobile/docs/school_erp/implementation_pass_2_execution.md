# Gurudevi Web/Mobile Architecture Execution - Pass 2

Grounding references:
- `implementation plan doc 1.md`
- `docs/agent/TAIL_FIN.md`
- `docs/agent/MASTER_PROTOCOL.md`

Date: 2026-03-21
Scope priority: Web-first execution, mobile-safe contracts.

## 1) User Intent We Must Satisfy

1. Principal users need institutional governance behavior that is clearly separate from classroom operations.
2. Teacher/staff workflows must not be orchestrated from classroom principal surfaces.
3. Demo users should freely explore core flows with seeded data and no fragile DB dependency for trial behavior.
4. Founder/platform visibility must remain explicit, capability-gated, and auditable.

## 2) Pass 2 Outcomes (Definition of Done)

1. Principal screen/container ownership is admin-owned behaviorally and structurally (not only cosmetically).
2. Teacher/staff management UI orchestration exits classroom package and lives in people/admin boundaries.
3. Institutional inventory and classroom resources split is enforced in UI/service contracts.
4. Boundary tests prevent regressions (no direct supabase imports in principal web views, no governance drift into classroom).
5. `tenant_kind` is query-visible for reporting segmentation (`internal`, `customer`, `demo`, `sandbox`).

## 3) Sprint Sequence

## Sprint A - Boundary Hardening and Ownership Extraction

### A1. Principal container ownership finalization
Tasks:
1. Ensure principal composition entrypoint is admin-owned (container + orchestrators).
2. Keep `apps/gurudevi-mobile` screen as thin adapter only.
3. Keep existing nav shell and route names unchanged.

Candidate target areas:
1. `apps/gurudevi-mobile/src/screens/classroom/views/PrincipalSchoolView.web.tsx`
2. `packages/admin/src/*` (workspace/container orchestration)

Acceptance criteria:
1. Principal web screen contains only routing/adapter wiring and presentation shell hooks.
2. Governance-oriented data fetch/orchestration exists in `@repo/admin` or `@repo/people`, not `@repo/classroom`.

### A2. Add hard architecture guardrails
Tasks:
1. Add/extend tests that fail if principal web views import `supabase` directly.
2. Add/extend tests that fail if classroom package imports admin governance orchestrators.
3. Assert capability checks for `school.manage` gating on principal-only actions.

Candidate target tests:
1. `apps/gurudevi-mobile/src/__tests__/architecture/principal-boundaries.test.ts`
2. `apps/gurudevi-mobile/src/__tests__/architecture/package-boundaries.test.ts`
3. Add `principal-governance-guardrails.test.ts` if needed.

Acceptance criteria:
1. Boundary tests fail on intentional violation.
2. Existing architecture tests remain green.

### A3. Tenant-kind segmentation readiness
Tasks:
1. Ensure reporting-oriented query helpers include `tenant_kind` filtering support.
2. Add helper contract (where missing): default behavior excludes mixed internal/demo in customer reporting views.

Candidate target areas:
1. `packages/core/src/types/Tenancy*`
2. `packages/admin/src/api/reporting*`
3. `packages/core/src/lib/capabilities.ts` (already tenant-aware; verify consumption path)

Acceptance criteria:
1. Reporting APIs can request segmented views by tenant kind.
2. Demo/internal data can be excluded deterministically.

## Sprint B - Teacher/Staff Flow Extraction + Inventory Split Enforcement

### B1. Teacher/staff workflow UI extraction from classroom
Tasks:
1. Move teacher/staff attendance and leave orchestration views to `@repo/people`.
2. Keep classroom package focused on class delivery contexts and student-facing classroom flows.
3. Preserve current user-visible routes and shell.

Candidate target areas:
1. `packages/classroom/src/*` (remove staff orchestration ownership)
2. `packages/people/src/*` (new/expanded orchestration surfaces)
3. `apps/gurudevi-mobile/src/screens/*` (adapter rewires only)

Acceptance criteria:
1. No staff-orchestration feature requires classroom-owned principal components.
2. Role-aware access remains intact for principal/teacher/staff.

### B2. Inventory/resource split rule enforcement
Tasks:
1. Formalize a shared classification helper:
   - classroom-owned => `classroom/resources`
   - institution-owned => `admin/inventory`
2. Apply helper in form labels, card destinations, and submit actions.
3. Add test coverage for misclassification regression.

Candidate target areas:
1. `packages/admin/src/*inventory*`
2. `packages/classroom/src/*resource*`
3. `packages/core/src/types/*` (shared type enum/contract if missing)

Acceptance criteria:
1. Classroom resources never land in institutional inventory by default path.
2. Institutional assets (including labs) never route to classroom resource APIs.

## 4) UX Coherence Rules for This Pass (No Nav-Shell Changes)

1. Keep sanctuary metaphor language.
2. Use explicit scope aids:
   - Institutional
   - Classroom
   - Cross-Ecosystem
3. Avoid mixed ambiguous labels that imply both governance and classroom execution in one action name.
4. No hardcoded design values; use existing tokens and i18n keys.

## 5) Technical Guardrails

1. Upstream rule:
   - Logic/hard policy decisions in domain packages.
   - App screens remain thin sensing shells.
2. No direct DB client calls from view components.
3. No new role shortcuts:
   - always use capability model (`useCapabilities().policy.can(...)`).
4. Keep API compatibility for mobile consumers in this pass.

## 6) Verification Matrix (Per PR)

Required checks:
1. `pnpm exec tsc --noEmit -p apps/gurudevi-mobile/tsconfig.json`
2. `pnpm exec tsc --noEmit -p packages/classroom/tsconfig.json`
3. `pnpm exec tsc --noEmit -p packages/admin/tsconfig.json`
4. `pnpm exec tsc --noEmit -p packages/people/tsconfig.json`
5. Architecture tests:
   - principal boundaries
   - package boundaries
   - principal IA coherence
   - new guardrail tests from Sprint A

Behavior checks:
1. Principal with school ID can access institutional operations.
2. Guest principal cannot access manage-only operations.
3. Demo principal can explore seeded features without create-school dependency.
4. School creation success unlocks manage availability in-session.
5. School creation failure leaves manage unavailable.

## 7) Recommended Implementation Order for Next Coding Pass

1. Implement Sprint A2 tests first (safety net).
2. Complete Sprint A1 extraction cleanup.
3. Add Sprint A3 tenant-kind reporting helper path.
4. Move into Sprint B1 teacher/staff extraction.
5. Finish with Sprint B2 inventory split enforcement and regression tests.

## 8) Non-goals for Pass 2

1. No nav-shell redesign.
2. No DB schema overhauls unless essential for compatibility.
3. No deep `@repo/workforce` implementation yet (reserve architecture only).
4. No parent portal launch yet (only compatibility-safe foundations).

## 9) Risk Register and Mitigation

1. Risk: Boundary extraction breaks legacy imports.
   - Mitigation: add failing boundary tests first, then refactor.
2. Risk: Capability regressions around principal routes.
   - Mitigation: explicit gating tests for `school.manage`.
3. Risk: Demo behavior diverges from customer behavior.
   - Mitigation: shared contracts + tenant kind tagging and segmented reporting.
4. Risk: Mobile breakage from package ownership move.
   - Mitigation: preserve interface contracts and run package typechecks each PR.

## 10) Handoff Note

This execution plan intentionally follows O(Trajectory):
1. preserve current shell stability,
2. deepen domain clarity,
3. increase policy correctness,
4. reduce long-term refactor debt before adding new stakeholder modules.
