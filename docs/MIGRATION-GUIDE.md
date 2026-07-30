---
title: "Dependency Migration Guide — Solo Operator Edition"
status: "active"
created: 2026-07-18
updated: 2026-07-18
author: "Naween"
tags: [migration, dependencies, workflow, infra]
---

# Dependency Migration Guide

General pattern for upgrading any dependency in this monorepo. Works for native modules, JS libraries, UI frameworks — anything in `package.json`.

Built from what we've actually done (Expo 54→55→56→57, Gluestack v2→v3→v5, MMKV v3→v4) not what we wish we did.

---

## The Shape of Every Migration

Every upgrade follows four phases. The effort ratio is roughly 1:2:3:2.

```
  Phase 1: SCOPE  ──  10%  ──  Find what depends on it
  Phase 2: AUDIT  ──  20%  ──  Find every usage, every config
  Phase 3: EXECUTE ── 40%  ──  Change code, update versions
  Phase 4: VERIFY ──  30%  ──  Build, test, ship
```

---

## Phase 1: Scope — What Depends on This?

### 1.1 Find every package.json reference

```bash
pnpm why <package> -r
```

This shows which workspace packages declare it. If more than 3 packages depend on it, budget 2x time — version drift between packages is the #1 headache in a monorepo.

### 1.2 Find every source import

```bash
grep -r "from '<package>'" packages/ apps/ --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "require('<package>')" packages/ apps/ --include="*.ts" --include="*.tsx" --include="*.js"
```

### 1.3 Check the lockfile (not just package.json)

```bash
grep -A 4 "name: <package>" pnpm-lock.yaml | head -10
```

The lockfile stores the resolved version. If you only change `package.json` but don't run `pnpm install`, CI will install the old version.

### 1.4 Check for patches

```bash
ls patches/ | grep <package>
```

If a patch exists for the old version, it will break. Plan to update or remove it.

### 1.5 Check for web shims

```bash
grep -r "<package>" apps/*/src/shims/ apps/*/src/web/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null
```

Native module upgrades often break web because shims reference old APIs.

---

## Phase 2: Audit — What Will Break?

### 2.1 Read the changelog

- GitHub Releases page (not the README — releases tell you what changed)
- Look for "Breaking Changes", "Migration Guide", "⚠️"
- Note the **minimum RN version** if it's a native module
- Note **peer dependency changes**

### 2.2 Search for known issues

```
<package> <version> react native crash
<package> <version> expo build fail
<package> <version> migration issues
```

### 2.3 Map old API to new API

For each import found in Phase 1.2, check what changed:

| Old pattern | New pattern | Action |
|---|---|---|
| `new ClassName()` | `createFunction()` | Update constructor calls |
| `.oldMethod()` | `.newMethod()` or removed | Find/replace or remove |
| `OldType` | `NewType` | Update TypeScript types |
| Old import path | New import path | Update all imports |
| Old config option | New/removed option | Update config objects |

### 2.4 Check config files that reference the library

```bash
# These files often have hardcoded references to native modules
cat apps/*/metro.config.js 2>/dev/null | grep <package>
cat apps/*/babel.config.js 2>/dev/null | grep <package>
cat apps/*/jest-setup.ts 2>/dev/null | grep <package>
```

---

## Phase 3: Execute — The Actual Change

### 3.1 Version pinning

Pin native modules to exact versions. No `^`, no `~`, no `*`.

```json
// OK for JS-only libraries
"zod": "^4.3.6",

// Pin native modules exactly
"react-native-mmkv": "4.3.2",
"react-native-gesture-handler": "3.0.2",
"react-native-nitro-modules": "0.36.1",
```

### 3.2 Update all package.json files at once

```bash
# Edit every package.json found in Phase 1.1
# Then ONE install command at the root
pnpm install
```

### 3.3 Apply code changes

For each file found in Phase 1.2, apply the API mapping from Phase 2.3.

One commit per library. Resist the urge to bundle unrelated upgrades.

### 3.4 Handle patches

If a patch exists for the old version:

1. Remove the old patch file: `rm patches/<package>@<old-version>.patch`
2. Try `pnpm install` to see if the new version works without patches
3. If it still needs patches: `npx patch-package <package>` to generate a new one

### 3.5 Update stale configs (the thing we always forget)

When upgrading Expo SDK, check these files for stale version references:

```
.syncpackrc        ← semverGroups label often references old SDK version
renovate.json      ← comment may reference old SDK
docs/*.md          ← tech-stack references may be stale
.nvmrc             ← may need updating
```

---

## Phase 4: Verify — Did It Work?

### 4.1 Lockfile hygiene check

```bash
# Check for duplicate resolved versions
grep -c "name: <package>" pnpm-lock.yaml

# If > 1, you have version drift across packages
```

### 4.2 Version consistency check

```bash
pnpm exec syncpack list-mismatches
```

This checks every package.json in the workspace agrees on versions. If it flags your package, fix it before proceeding.

### 4.3 TypeScript

```bash
pnpm check-types
```

### 4.4 Lint

```bash
pnpm lint
```

### 4.5 Expo doctor (for Expo/RN projects)

```bash
pnpm audit:mobile:doctor
```

Know when to ignore it: `expo doctor` flags deliberate overrides. If you're deliberately running ahead of Expo's certification (like we did with RNGH v3 and Sentry v8), document the override in the PR.

### 4.6 Native build (non-negotiable for native modules)

```bash
eas build --platform android --local --profile preview
```

TypeScript cannot catch C++ compile errors. The native build is the only real test. This is what caught us when we deferred it — don't defer it.

### 4.7 Device smoke test

Test the actual features that use the library:

| Library | What to test |
|---|---|
| MMKV | Read, write, delete, clear, listener callback |
| RNGH | Pinch, pan, swipe, tap on real screens |
| Reanimated | Animations on gesture events, screen transitions |
| Gluestack | Theme switch, component rendering, style props |
| Sentry | Trigger a test error, confirm it reports |
| Supabase SDK | Auth signup/signin, data fetch |

---

## The Middle-Out Principles

These are the rules that actually work for a solo operator on a monorepo.

### One library, one branch, one PR

Don't bundle. If Expo SDK 58 requires RN 0.87, do them together because they're coupled. But don't add Gluestack v6 to the same branch just because "you're already upgrading."

### Batch verification, sequential execution

You can plan multiple upgrades at once (batch the intel phase), but execute them one at a time (sequential PRs). This way if something breaks, you know exactly which upgrade caused it.

### Document the deferred items

If you can't finish Phase 4 (native build, device test) in one session, tag it:

```markdown
## Deferred
- [ ] EAS Build not yet run — need to verify on device
- [ ] peerDependencies in packages/core not updated
```

Merge the code changes, but document what's pending. A documented gap is better than a forgotten gap.

### Configs get stale fast — clean them

Every time you upgrade Expo SDK, check these:

```
.syncpackrc          ← "Expo SDK 55 Pinning" becomes stale
.nvmrc               ← Node version may need bump
package.json         ← engines.node may need bump
renovate.json        ← Blocking rules may reference old SDK
```

### Stash is for emergencies, not workflow

When you find yourself running `git stash` during a migration, that's a sign the migration is too big. Split it.

---

## Quick Reference: Common Migration Patterns

### Expo SDK bump

1. `npx expo-cli upgrade <version>`
2. Check all expo-* packages are on the new `~<version>.x` range
3. `pnpm install`
4. `pnpm audit:mobile:doctor` — check what it flags
5. For each flagged package, decide: downgrade to match or deliberately override
6. If overriding: verify the override is safe (source diff, peer deps)
7. Update `renovate.json` comment and `.syncpackrc` label
8. EAS Build

### Native module major version

1. Read the changelog (especially "Breaking Changes" and "Migration Guide")
2. Check minimum RN version vs. your current RN version
3. Search for known issues with your exact RN/Expo version
4. Pin the exact version, no range
5. Update all package.json references in one go
6. Update patches or remove them
7. TypeScript check
8. EAS Build (non-negotiable)

### JS-only library major version

1. Read the changelog
2. Search for removed APIs
3. Update imports and usage
4. TypeScript check
5. Tests

### Peer dependency conflict

When two packages disagree on a shared dependency version:

1. `pnpm why <package>` to see why both versions exist
2. Decide which version is correct
3. If the conflict is in the pinned version, update the consuming package.json
4. If the conflict is in the transitive tree, use `pnpm.overrides` in root package.json
5. Remove overrides when the upstream package catches up

---

## Emergency Escape Hatches

| Problem | Action |
|---|---|
| Build fails after upgrade | `git checkout -- packages/*/package.json apps/*/package.json pnpm-lock.yaml` then `pnpm install` |
| Runtime crash on device | Revert the PR, check Sentry for the stack trace |
| Peer dep conflict in CI that passes locally | Run `pnpm install --frozen-lockfile` to reproduce |
| Lockfile won't resolve | `rm pnpm-lock.yaml && pnpm install` |
| Patch file breaks on new version | `rm patches/<package>@<old>.patch` and see if it's fixed upstream |
| Stash recovery needed | `git stash list` then `git stash apply stash@{N}` |

---

## Related Docs

- [Developer Workflow Guide](./infra/developer-workflow-guide.md) — Quality gates and local dev flow
- [Dependency Alignment & Upgrade Testing Playbook](../apps/gurudevi-mobile/docs/infra/2026-06-10-dependency-alignment-and-upgrade-testing.md) — Tool commands
- [Native Deps Migration Log](./gurudevi-native-deps-migration.md) — Example of a completed migration analysis
- [Tech Stack & Standards](./architecture/tech-stack-and-standards.md) — Current stack versions
- [Developer Playbook](./Core/developer-playbook.md) — Master strategy docs
