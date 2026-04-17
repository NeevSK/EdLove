# Beta vs Production Monorepo Guidance

This guide explains how to keep beta and production versions living in the same monorepo without confusing local development, Git history, or mobile release channels.

## 1) The core rule

Do not try to make one branch serve every version at once.

Instead:

- `main` should represent the production baseline.
- A `beta` or `preview` branch should represent the next version line.
- Local workspaces can exist side by side using Git worktrees or separate clones.

This keeps the lockfile, environment files, and app channels aligned.

## 2) Recommended branch model

Use three lanes:

1. Production
   - branch: `main`
   - dependency versions: stable
   - EAS channel: `production`
   - default app behavior: released, user-facing

2. Preview / beta
   - branch: `beta` or `preview`
   - dependency versions: stable pre-release testing, or explicitly allowed experimental versions
   - EAS channel: `preview`
   - default app behavior: testable, not the public baseline

3. Local development
   - branch: whichever branch you are currently testing
   - EAS channel: `development`
   - default app behavior: developer-only and disposable

## 3) Local machine strategy

If you need both production and beta checked out on the same machine, use Git worktrees:

- one worktree for `main`
- one worktree for `beta` or `preview`
- separate terminal windows for each
- separate `.env.local` files when needed

This works better than trying to keep multiple version sets in one install folder.

Practical local rules:

- keep the production worktree on stable dependencies only
- keep the beta worktree isolated from the stable worktree
- do not share a single experimental lockfile across both worktrees
- rebuild the app after switching channels or dependency baselines

## 4) Git strategy

In Git, version choice should be branch-specific.

Good patterns:

- stable dependency updates land on `main`
- beta-only dependency experiments live on `preview`
- once beta proves stable, merge it into `main`

Avoid:

- checking experimental canary dependencies directly into `main`
- mixing production and beta dependency ranges in the same manifest without a clear runtime gate
- using local-only overrides as a long-term solution

## 5) EAS and release channels

The mobile app already has a useful split in `apps/gurudevi-mobile/eas.json`:

- `development`
- `preview`
- `production`

Use those channels as the runtime mirror of your Git branches:

- development channel for local or internal debug builds
- preview channel for beta validation
- production channel for shipped builds

That keeps the app binary, update channel, and dependency baseline aligned.

## 6) How to keep beta and production versions apart

Use version separation in one of these ways:

1. Branch separation
   - best default
   - simplest to reason about
   - easiest rollback

2. Feature flag separation
   - good when the code path can live in one branch
   - useful for toggling beta UI or beta APIs

3. Channel separation
   - good for Expo and mobile release flows
   - lets the same codebase serve different release trains

4. Package-level isolation
   - good for leaf packages and experimental submodules
   - not enough by itself for React, Expo, or RN foundation changes

## 7) What to do with shared packages

If a package is used by both web and mobile:

- keep the package stable on `main`
- widen peer dependencies before upgrading the consumer apps
- test the mobile app and every web app that imports it
- do not let beta-only code leak into the shared package API unless there is a clear feature-flag path

For this repo, the most sensitive shared packages are:

- `@repo/core`
- `@repo/ui`
- `@repo/graphics`
- `@repo/library`
- `@repo/scanner-kit`

## 8) Suggested operating model

### Production

- stable dependency range
- locked build output
- public or internal release that is meant to stay supported
- no canary-only APIs

### Beta

- preview branch
- preview channel
- canary or alpha only when the upgrade is intentionally being tested
- isolated to a small surface first

### Local development

- use the branch that matches the line you are working on
- do not assume your local branch is safe to publish
- keep beta experiments in a separate worktree if you need to compare them side by side

## 9) Practical rule of thumb

If a change would force you to answer "which version am I actually running?" more than once, the version separation is too loose.

For this repo, we want version clarity at three levels:

- branch
- channel
- dependency baseline

That is what keeps the monorepo easy to maintain.
