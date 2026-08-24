---
title: "Version Management"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, infra]
---

# Version Management

## Status

**Decision: Replace `@changesets/cli` with pnpm native versioning**

## Context

- Solo-operator monorepo (100% commits by one person)
- 31 packages — 12 explicit `private: true`, 19 implicitly non-private
- Currently **zero packages published to npm** — but likely future ambition to publish some
- pnpm v11.13.0 is **already installed** and has native monorepo versioning built in (added in v11.13.0)
- `@changesets/cli@2.31.0` is currently installed but never used for an actual release — 2 stale changeset files sit unconsumed
- `scripts/smart-changeset.mjs` attempts to automate changeset generation but is fragile

## Why versioning matters

| Need | How it helps |
|---|---|
| **Changelog per package** | `git log` is noisy across 31 packages. Per-package changelogs carved by scope are signal. |
| **Semantic awareness** | Knowing `@repo/core` had a breaking change vs a patch tells consumers what to expect. `workspace:*` hides this. |
| **Future publishing** | `@repo/ui`, `@repo/core`, `@repo/form-builder-engine` may eventually go public. Preparing now avoids retrofitting. |

## pnpm native versioning

Already in pnpm v11.13.0 (currently installed). Same `.changeset/*.md` format as changesets — **zero migration needed** for existing config.

### Commands

| Action | Old (changesets CLI) | New (pnpm native) |
|---|---|---|
| Record intent | `pnpm changeset` | `pnpm change` |
| Preview plan | — | `pnpm change status` |
| Consume & bump | `pnpm changeset version` | `pnpm version -r` |
| Publish | `pnpm publish -r` | `pnpm publish -r` (same) |

### Configuration

No more `.changeset/config.json`. Config moves to `pnpm-workspace.yaml` under `versioning:` key:

```yaml
versioning:
  # fixed: packages that release together at one version
  # ignore: packages to skip
  # maxBump: minor — cap bump severity
  # lanes: prerelease tracks (alpha, beta)
  # epics: major-version coordination across groups
  changelog:
    storage: repository  # commit CHANGELOG.md files
```

### Key features not in changesets CLI

- **Lanes** — parallel prerelease tracks (`pnpm lane alpha --filter @repo/core`)
- **Epics** — constrain member packages' major versions relative to a lead package
- **Fixed groups** — packages that always release at one shared version
- **Ledger** — append-only `.changeset/ledger.yaml` tracks consumed intents; makes cherry-picks between release branches safe
- **Changelog modes** — `registry` (composed at publish time, no committed CHANGELOG.md) or `repository` (committed files)

## Recommended action

### 1. Remove `@changesets/cli`

```bash
pnpm remove @changesets/cli
```

### 2. Delete `scripts/smart-changeset.mjs`

The script is fragile (uses `HEAD~1`, uniform bump type, no semver awareness). Replaced by `pnpm change --bump --summary`.

### 3. Clean stale changeset files

```bash
rm .changeset/smart-1778255748985.md .changeset/smart-1778944136452.md
```

These were auto-generated but never consumed and refer to old changes. If the changes have already landed (they were committed alongside), the files are noise.

### 4. Remove `.changeset/config.json`

pnpm native versioning uses `pnpm-workspace.yaml` for config, not this file. The `.changeset/` directory itself stays — that's where intent files live.

### 5. Remove `change`, `change:smart`, `version:all` from package.json scripts

Replace with:

```json
{
  "scripts": {
    "change": "pnpm change",
    "change:status": "pnpm change status",
    "version:all": "pnpm version -r && pnpm install"
  }
}
```

### 6. Add `versioning` config to `pnpm-workspace.yaml`

```yaml
versioning:
  ignore:
    - '@repo/eslint-config'
    - '@repo/typescript-config'
    - '@repo/types-shim'
    - '@repo/policies'
  maxBump: minor
  changelog:
    storage: repository
```

`ignore` skips infra packages that don't need versioning. `maxBump: minor` prevents accidental major bumps. `changelog.storage: repository` commits CHANGELOG.md files (useful for solo operator who wants to see history in the repo).

## Workflow

### Daily (during development)

```
pnpm change
```

Interactive prompt:
1. Selects packages changed since merge-base with `main`
2. Asks which get major/minor/patch
3. Asks for changelog summary

Writes `.changeset/*.md`. Commit this alongside the change.

Alternatively, non-interactive for scripts:

```
pnpm change --bump patch --summary "Fix crash on empty input" @repo/core
```

### Release (when ready to cut)

```
pnpm version -r    # bumps versions, propagates dependents, writes changelogs
pnpm install       # update lockfile
git add -A
git commit -m "chore: release"
pnpm publish -r    # if publishing to npm
```

Preview before committing:

```
pnpm change status
```

## Anti-goals

- **Not automating release PRs via CI** — solo operator doesn't need a bot opening version PRs. Manual release cadence is fine.
- **Not using lanes/epics yet** — available if future need arises (e.g., alpha channel for a rewrite).
- **Not changing existing intent files format** — pnpm uses the same changesets format for compatibility.

## Migration diff

| File | Action |
|---|---|
| `package.json` — `devDependencies.@changesets/cli` | Remove |
| `package.json` — `scripts.change` | Change to `pnpm change` |
| `package.json` — `scripts.change:smart` | Remove |
| `package.json` — `scripts.version:all` | Keep, change to `pnpm version -r && pnpm install` |
| `.changeset/config.json` | Delete |
| `.changeset/smart-*.md` | Delete (stale) |
| `scripts/smart-changeset.mjs` | Delete |
| `pnpm-workspace.yaml` | Add `versioning:` section |
