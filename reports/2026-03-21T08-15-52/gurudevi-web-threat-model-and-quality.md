# Gurudevi Web Threat Model And Quality Review

Generated: 2026-03-21
Workspace: `C:\Users\Naween\projects\polymath-platform`
Scope: `apps/gurudevi-mobile` and its package-owned web surfaces

## Inputs And Assumptions

- Demo mode is intentionally meaningful for product evaluation, but real data access requires registration.
- Authorization is intentionally defense-in-depth: Supabase RLS plus app-side capability checks.
- `founder`, `platform_admin`, and `developer` are intentionally allowed normal cross-tenant access.
- Current branch objective is release-readiness for web without breaking mobile parity.

## Executive Verdict

The branch is in a much healthier release state than it was before the web migration hardening pass. The build, type, lint, architecture, and migration checks are green locally, and the main security architecture is moving in the right direction: tenancy and capability evaluation are becoming centralized in `@repo/core`, while Supabase RLS remains active underneath.

The main residual risk is not missing authorization primitives. It is authorization drift: package-owned screens still perform direct `supabase` reads in UI code, which creates more places where capability intent and query behavior can diverge over time. Because RLS is also present, this is not an immediate ship-stopper, but it is the most important follow-up if the goal is a low-tech-debt web release.

## What Looks Strong

- Tenancy and authority foundations are now explicit in the schema migration at [`20260320120000_authority_tenancy_foundations.sql`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/supabase/migrations/20260320120000_authority_tenancy_foundations.sql#L1).
- Capability evaluation is centralized in [`capabilities.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/capabilities.ts#L14) and consumed by [`authorization.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/authorization.ts#L34).
- RLS is clearly enabled for core tables in the baseline migration at [`20260211170000_master_baseline.sql`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/supabase/migrations/20260211170000_master_baseline.sql#L394).
- Identity mapping has a single intended bootstrap path in [`identity.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/api/identity.ts#L62).
- Release guardrails are currently healthy: `migration:web:check`, architecture Jest suites, app/package typechecks, lint, and `build:web` all passed locally.

## Findings

### 1. High: Authorization drift remains possible through direct `supabase` access in UI screens

The strongest trust boundary is now the capability layer in `@repo/core`, but some package-owned UI screens still import `supabase` directly and query tables themselves. One concrete example is [`StudentDashboard.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/StudentDashboard.web.tsx#L3), which reads `classroom_students` and `assignments` directly at [`StudentDashboard.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/StudentDashboard.web.tsx#L72). This pattern makes it easier for future changes to bypass app-side policy decisions, overfetch data, or duplicate school/tenant scoping logic incorrectly.

Why this matters:
- You explicitly want both RLS and app-side authorization.
- Direct UI queries weaken that two-layer model by pushing security-sensitive scoping into screens.
- The risk is maintenance drift more than immediate data exfiltration, because RLS is active.

Recommended next move:
- Gradually move privileged reads into package or core APIs that call [`authorization.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/authorization.ts#L135) or capability helpers before querying.
- Treat direct screen-level `supabase` usage as acceptable only for clearly public/demo data.

### 2. High: Cross-tenant platform roles have intentionally large blast radius

The capability model grants unconditional allow decisions whenever `hasGlobalAccess` is true in [`capabilities.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/capabilities.ts#L148) and [`capabilities.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/capabilities.ts#L209). Since you confirmed this is intentional for `founder`, `platform_admin`, and `developer`, this is not a design bug. It is a governance hotspot.

Why this matters:
- A compromised platform-role account becomes a cross-tenant incident by design.
- Any weak operational control around those roles has platform-wide impact.

Recommended next move:
- Add stronger audit expectations around those roles.
- Make sensitive admin actions observable and reviewable.
- Avoid reusing these roles for convenience in day-to-day testing if lower-scope roles would work.

### 3. Medium: Identity bootstrap still tolerates mixed ID states

[`identity.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/api/identity.ts#L90) falls back to using the raw Supabase auth UID as the internal app user ID when no `auth_identities` mapping exists yet. That helps new-user onboarding and legacy healing, but it also means the system temporarily accepts mixed identity states.

Why this matters:
- Any code path that assumes “internal user id always means fully provisioned app user” can behave inconsistently during first-login or migration repair windows.
- This is more of a correctness and privilege-boundary hygiene risk than an immediate exploit.

Recommended next move:
- Gate privileged mutations on confirmed `users` row existence, not only a resolved current session.
- Keep the “single legitimate `auth.getUser()` path” rule from [`identity.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/api/identity.ts#L64) strict in CI and linting.

### 4. Medium: Demo/public boundary needs disciplined containment

Demo access is intentionally meaningful, and [`requireAuth()`](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/authorization.ts#L59) returns a mock teacher-shaped object when demo mode is active at [`authorization.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/authorization.ts#L60). That is fine for product goals, but it increases the importance of making sure demo flows never “accidentally” hit privileged real-data mutations because a screen forgot to branch correctly.

Recommended next move:
- Keep demo mode data sources obviously separated.
- Prefer dedicated demo providers/adapters over mixed real/demo branching inside large screens.

### 5. Medium: Web observability is weaker than mobile today

The current Sentry API token available in local `.env` is rejected by Sentry as an invalid org token, so issue inspection could not be completed. Separately, the web deployment workflow injects Sentry environment variables at [`web-deploy.yml`](C:/Users/Naween/projects/polymath-platform/.github/workflows/web-deploy.yml#L64) but does not upload web sourcemaps. The existing sourcemap upload workflow is manual and Android-specific at [`sentry-sourcemap-upload.yml`](C:/Users/Naween/projects/polymath-platform/.github/workflows/sentry-sourcemap-upload.yml#L34).

Why this matters:
- Browser incidents will be harder to triage.
- Even with a valid token, stack traces for deployed web bundles will be much less actionable without sourcemaps.

Recommended next move:
- Fix Sentry org/project token scope first.
- Add web sourcemap upload to the web deploy path, not only the manual Android workflow.

## Code Quality Summary

### Current quality bar

- Web migration boundary checks pass.
- Architecture tests pass against the new package-owned screen locations.
- App and touched-package TypeScript checks pass.
- Repo lint passes without blocking errors.
- Web production build succeeds and exports correctly.
- GitHub PR checks for PR `#115` show no failing checks.

### Current maintainability hotspots

- Screen files still mix data access, capability assumptions, and presentation.
- Direct `supabase` imports are still spread across app and package UI code.
- Large migration churn means boundary rules are especially important right now; the repaired architecture tests should stay strict.

## Open-Source Maintainer Skill Outcome

The maintainer sweep completed successfully, but it found no currently open issue or PR backlog to triage.

- Executive snapshot: [`executive-summary.md`](C:/Users/Naween/projects/polymath-platform/reports/2026-03-21T08-15-52/executive-summary.md)
- Raw triage template output: [`triage.md`](C:/Users/Naween/projects/polymath-platform/reports/2026-03-21T08-15-52/triage.md)

This means the useful maintainer outcome for this branch is not backlog prioritization. It is branch hygiene: keep tests, boundaries, and release docs trustworthy so future contributors inherit a stable base.

## Recommended Priority Order

1. Keep app-side authorization centralized by reducing direct screen-level `supabase` access in package-owned dashboards and flows.
2. Fix Sentry authentication and add web sourcemap upload to the normal deploy path.
3. Add light CI enforcement for identity and authorization architecture rules so drift is caught automatically.
4. Add auditing expectations for intentional cross-tenant platform roles.
