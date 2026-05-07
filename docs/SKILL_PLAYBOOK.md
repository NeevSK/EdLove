# Repo Skill Playbook

This playbook defines the best Codex skill stack for `polymath-platform`, when to use each skill, and how to combine them for high-confidence delivery.

It is tuned for this repo's actual shape:

- `pnpm` workspace monorepo
- `turbo` task orchestration
- Expo / React Native mobile app
- Astro and Svelte marketing/content sites
- shared packages in `packages/*`
- Supabase migrations and Edge Functions under `apps/gurudevi-mobile/supabase`
- GitHub Actions based CI and deployment

## Core Principle

Use the smallest set of skills that materially improves the current task.

Do not stack skills just because they exist. In this repo, quality usually comes from combining:

- repo context
- one domain skill
- one validation or release skill

## Default Stack

These are the default skills worth reaching for most often:

- `supabase`
- `gh-fix-ci`
- `sentry`
- `security-best-practices`
- `security-threat-model`
- `intentional-ui-design`
- `frontend-skill`
- `playwright`
- `open-source-maintainer`
- `yeet`

These are situational but useful:

- `gh-address-comments`
- `security-ownership-map`
- `figma`
- `figma-implement-design`
- `vercel-deploy`
- `cloudflare-deploy`
- `netlify-deploy`
- `render-deploy`
- `openai-docs`

## Skill Map By Concern

### Supabase

Use:

- `supabase`
- `security-best-practices`
- `security-threat-model`

Typical tasks:

- schema changes
- SQL migrations
- RLS and policy review
- auth flows
- Edge Functions
- generated types
- local CLI workflows

Use this stack when working in:

- `apps/gurudevi-mobile/supabase`

Recommended prompt shape:

```text
Use the supabase skill to review this migration plan, check RLS safety, and implement the safest minimal change.
```

Escalate to `security-threat-model` when:

- new trust boundaries are introduced
- data becomes more public
- admin or multi-tenant access rules change
- Edge Functions start handling privileged actions

### CI/CD

Use:

- `gh-fix-ci`
- `open-source-maintainer`
- one deploy skill if deployment is part of the task

Typical tasks:

- failing GitHub Actions
- flaky checks
- missing pipeline steps
- release process hardening
- deployment workflow cleanup

Primary workflow files:

- `.github/workflows/quality-gate.yml`
- `.github/workflows/web-deploy.yml`
- `.github/workflows/pr-guard.yml`
- `.github/workflows/android-build.yml`
- `.github/workflows/sentry-sourcemap-upload.yml`

Recommended prompt shape:

```text
Use gh-fix-ci to inspect the failing checks, summarize the root cause, and propose the smallest safe fix.
```

Pick deploy skills by platform:

- `vercel-deploy` for Vercel-hosted apps
- `cloudflare-deploy` for Cloudflare-hosted sites or Workers
- `netlify-deploy` for Netlify
- `render-deploy` for Render

### Testing And Validation

Use:

- `playwright`
- `gh-fix-ci`
- `sentry`

Typical tasks:

- browser flow verification
- regressions in public web experiences
- smoke tests for web exports
- production bug validation after a fix

This repo benefits most from Playwright on:

- Astro marketing sites in `apps/edlove-web`
- Astro marketing site in `apps/gurudevi-marketingWeb`
- Expo web output from `apps/gurudevi-mobile`

Recommended prompt shape:

```text
Use playwright to verify the critical user journey, capture any broken states, and confirm the fix.
```

Use `sentry` when:

- a bug exists in production but is hard to reproduce locally
- you need recent error context before changing code
- you want to verify whether a shipped fix actually reduced errors

### Security

Use:

- `security-best-practices`
- `security-threat-model`
- `security-ownership-map`

Typical tasks:

- auth review
- secrets handling review
- RLS and access control review
- sensitive code ownership analysis
- identifying risky single-maintainer areas

Recommended prompt shape:

```text
Use the security-best-practices skill to review this auth and data-access change for practical risks in TypeScript, Expo, and Supabase.
```

Use `security-ownership-map` when:

- access to production is expanding
- you want to know who effectively owns sensitive areas
- you want a bus-factor view before release or handoff

### Code Quality

Use:

- `open-source-maintainer`
- `gh-address-comments`
- `gh-fix-ci`

Typical tasks:

- tightening project hygiene
- resolving review feedback cleanly
- improving maintainability
- aligning docs, scripts, and workflows

This skill area is especially useful for:

- stale repo process
- inconsistent package boundaries
- weak release notes or issue hygiene
- dependency and workflow drift

Recommended prompt shape:

```text
Use open-source-maintainer to audit release blockers, maintenance gaps, and repo hygiene issues that would make this project harder to scale.
```

### Architecture Validity

There is no single "architecture skill" in your current set, so use a combination:

- `open-source-maintainer`
- `security-threat-model`
- `supabase` for backend and data architecture
- `intentional-ui-design` for UX and design-system architecture

Use this combined stack for:

- validating domain boundaries across `apps/*` and `packages/*`
- checking whether shared packages are too coupled to app code
- reviewing whether backend policy changes still match product roles
- making sure UX flows still reflect the intended product model

Recommended prompt shape:

```text
Review this change for architectural validity in the context of this monorepo: package boundaries, trust boundaries, and whether the UX flow still matches the product model.
```

### UX And Product Quality

Use:

- `intentional-ui-design`
- `frontend-skill`
- `playwright`
- `figma` or `figma-implement-design` when a design source exists

Typical tasks:

- improving information hierarchy
- accessibility and usability passes
- reducing generic UI
- aligning implementation to Figma
- validating responsive behavior

Recommended prompt shape:

```text
Use intentional-ui-design to improve this screen's hierarchy, polish, and mobile responsiveness without breaking the existing visual language.
```

Use `playwright` after the design pass to verify:

- layout stability
- navigation
- form behavior
- obvious accessibility regressions

### Release Readiness

Use:

- `open-source-maintainer`
- `gh-fix-ci`
- `sentry`
- `playwright`
- `security-best-practices`
- `supabase` if database changes are involved

This is the most important combined workflow in this repo.

Before shipping a meaningful change, check:

- code passes lint, typecheck, and tests
- critical journeys work in the browser or app surface affected
- Sentry does not show an unresolved known blocker in the changed area
- env vars and secrets are present in CI or deployment targets
- Supabase migrations are ordered, minimal, and safe to roll forward
- no new RLS or auth gap was introduced
- deploy target matches the app being shipped

Recommended prompt shape:

```text
Run a release-readiness pass for this change: CI health, user-flow verification, Sentry risk, Supabase safety, and any obvious ship blockers.
```

## Recommended Skill Recipes

### 1. Supabase Schema Change

Use:

- `supabase`
- `security-best-practices`

Add `security-threat-model` if roles, tenancy, or public access change.

### 2. Broken PR Checks

Use:

- `gh-fix-ci`

Add `open-source-maintainer` if the failure reveals a broader process gap.

### 3. UI Polish Pass

Use:

- `intentional-ui-design`
- `frontend-skill`
- `playwright`

Add `figma-implement-design` if the screen should match a Figma source.

### 4. Production Incident

Use:

- `sentry`
- `gh-fix-ci` if deployment or sourcemaps are involved
- `supabase` if the incident touches database logic or Edge Functions

### 5. Pre-Release Audit

Use:

- `open-source-maintainer`
- `gh-fix-ci`
- `playwright`
- `sentry`
- `security-best-practices`

Add `supabase` for any migration-bearing release.

## When Not To Overuse Skills

Do not force a skill when simple repo-native work is enough.

Examples:

- For straightforward TypeScript fixes, normal coding plus repo checks is enough.
- For package-local refactors, architecture discussion may matter more than a formal skill.
- For tiny UI copy changes, skip the larger UX stack unless the surface is already under redesign.

## Suggested Operating Routine

For most meaningful tasks in this repo:

1. Read the local app context and affected package boundaries.
2. Pick one domain skill.
3. Pick one validation skill.
4. Implement the change.
5. Run repo-native checks.
6. Do a release-readiness pass if the change is user-facing, infra-facing, or security-sensitive.

## Fast Prompts To Reuse

```text
Use the supabase skill to implement this migration safely and review the RLS impact.
```

```text
Use gh-fix-ci to inspect the failing GitHub Actions checks and propose the smallest robust fix.
```

```text
Use intentional-ui-design and playwright to improve this screen and then verify the user flow.
```

```text
Use security-best-practices to review this auth, secret-handling, and data-access change.
```

```text
Use open-source-maintainer to run a release-readiness pass on this branch and call out concrete blockers.
```
