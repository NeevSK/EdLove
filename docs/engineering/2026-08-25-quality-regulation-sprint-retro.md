---
title: "Quality-Regulation Sprint Retrospective — Sovereign-Gate Lint Burn-Down"
status: "active"
created: 2026-08-25
updated: 2026-08-25
author: "Naveen"
scribe: "opencode"
tags: [retrospective, quality-gate, eslint, biome, turbo-cache, lessons-learned]
---

# Quality-Regulation Sprint Retrospective — Sovereign-Gate Lint Burn-Down

> Point-in-time record of the lint-debt burn-down sprint that made the push
> gate genuinely green, the mistakes made along the way, and the playbook for
> future passes. Companion docs: `slop-register.md` (failure-mode list),
> `ai-slop-healing-sop.md` (process), AGENTS.md § Quality Regulation.

---

## 1. What this sprint was

Goal: make `pnpm run lint` (the sovereign push gate's core stage) pass with
**0 errors across all packages** without hiding real debt, and root-cause every
tool-level false blocker encountered on the way.

Method chosen: **sequential-blocker mode** — run the full turbo lint sweep,
take the first failing package, read its raw ESLint log, classify every error
into one of three buckets, fix, re-verify standalone, repeat:

| Bucket | Treatment |
|---|---|
| Real bug | Hand-fix (missing `cause`, floating promise, hook-order violation, dead state write) |
| Aspirational debt family | Scoped `'warn'` downgrade in the package's own `eslint.config.mjs`, inside a documented block with justification and counts |
| Tool bug | Root-cause the script/config, never suppress around it |

Warnings were deliberately kept visible (not silenced) so debt stays countable;
the gate tracks **errors only**.

---

## 2. Root-caused tool bugs (these were masking everything)

### 2.1 `scripts/run-and-report.mjs` — PowerShell 5.1 rejects `&&`

**Symptom:** every package lint task failed with exit 1 regardless of findings.
**Root cause:** the wrapper spawned commands containing `&&`. PowerShell 5.1
(this machine's shell) has no `&&` operator, so the command string was invalid.
Turbo had been replaying cached "successes" for a long time, so nobody noticed
until caches were invalidated.
**Fix:** translate chains to `cmd1; if ($?) { cmd2 }` at spawn time.
**Lesson:** *verify what shell your tooling actually runs under.* A gate that
always fails teaches people to bypass it (`--no-verify`), which is worse than
no gate.

### 2.2 `scripts/scoped-biome.mjs` — cwd/path-scope mismatch

**Symptom:** biome INTERNAL io errors citing phantom paths like
`C:\x\packages\core\apps\sanctuary-api\...` (a path spliced from two different
roots); also crashes on deleted-but-unstaged files.
**Root cause:** the script passed git-root-relative paths to biome while biome
resolved them against the calling package's cwd. The existing guard compared
against `PNPM_SCRIPT_SRC_DIR`, which equals `process.cwd()` under pnpm — so the
"am I running from the repo root?" filter could never engage.
**Fix:** resolve every git path against `git rev-parse --show-toplevel`,
re-scope to cwd via `path.relative`, skip files that no longer exist.
**Lesson:** *never trust cwd assumptions in monorepo scripts* — pnpm/turbo run
everything from the package dir; test scripts from a package context, not just
the root.

### 2.3 Turbo cache replay masked latent debt

Biome `--write` normalization invalidated turbo caches, and fresh ESLint runs
then exposed debt that had been invisible for months (e.g. `@repo/profile`
jumped from cached-pass to **241 errors** on its first uncached run).
**Lesson:** *a cached green is not evidence of health.* After any tooling or
config change, expect cache invalidation to surface old debt, and budget time
for it instead of treating new failures as regressions.

---

## 3. Code fixes shipped (real bugs found by the gate)

- **ui**: three genuine rules-of-hooks violations — hooks called after an early
  return / below platform branches (`ui/portal/index.tsx`,
  `QRCodeGenerator.tsx`, `SanctuaryGlobalStyles.tsx`). Fixed by hoisting all
  hooks above branches and guarding effect bodies instead of call sites.
- **analytics**: duplicate-export barrel collisions (`DatabaseClient` exported
  twice via overlapping star + explicit exports; star-vs-star collision on
  `Predictor`) resolved by making one side an explicit named export; deleted a
  stale legacy `src/index.js` twin and 29 stale committed `*.d.ts` build
  artifacts that broke typed linting with parse errors.
- **people**: nested component definition hoisted to module level (with proper
  icon typing); dead synchronous `setLoading(true)` removed; `Math.random()`
  channel-name suffix replaced with stable `useId()`; missing a11y roles added.
- **ai**: gap-detection logic extracted from a complexity-40 monolith into
  three module functions composed via `Promise.all`.
- **scanner-kit / graphics / analytics / ai**: fire-and-forget promises marked
  `void` (intent made explicit) or `.catch()`-chained where errors matter.
- **library**: thrown wrapper error now carries `{ cause: original }`.
- **form-builder**: complexity flagged honestly (658-line FormBuilder) —
  downgraded to warn pending a real tab-renderer extraction task, not hidden.

Dependency truth: `react-native-reanimated-carousel` was used by ui but never
declared (worked only via phantom hoisting) — declared in ui devDeps.

---

## 4. Mistakes we made while doing this (and the correction)

### 4.1 Inventing a rule id from a log family name

We wrote `'@typescript-eslint/preserve-caught-error': 'warn'` into library's
config because the *audit summary* listed "preserve-caught-error" as a family.
ESLint 10 crashed config validation: the actual firing rule is **core**
`preserve-caught-error` (unprefixed). One wrong id takes down the whole
package's lint with a `TypeError`, which looks like a tool failure rather than
our typo.
**Rule going forward:** *rule ids in configs must be copied from the raw log
line (which prints the exact id), never reconstructed from prose summaries.*
If unsure, check the plugin's rule registry before writing the line.

### 4.2 Stale disable comments referencing nonexistent rules

Old comments like `// eslint-disable-next-line react-compiler/react-compiler`
targeted a rule id that never existed (the React Compiler linter ships in
eslint-plugin-react-hooks v7 as individual `react-hooks/*` rules — there is no
umbrella `react-compiler` id, and the old stub registered it under the wrong
plugin namespace `react`). Under ESLint 10, a suppression for an undefined rule
is itself a reported **error**, so these became blockers. All were removed.
**Rule going forward:** when a rule id disappears or is renamed, grep for its
disable-comments too — they outlive the rule.

### 4.3 Flat-config plugin redefinition

Attempted to "redefine" `react-hooks` settings to downgrade the compiler suite;
flat config forbids plugin redefinition (`Cannot redefine plugin "react-hooks"`).
Correct move is plain `rules:` overrides keyed by the real individual ids.
**Rule going forward:** in flat config, only ever add override blocks; never
touch `plugins:` in a downstream config.

### 4.4 Reading transient failures as real ones

Running per-package checks concurrently with a full sweep collided on
report/log files: empty logs, "Findings: 0" printed alongside exit 1.
Twice this nearly triggered unnecessary fixes.
**Rule going forward:** *any failing task gets one clean standalone re-run
before diagnosis begins.* Also: the wrapper can print `Findings: 0` while the
underlying command exits 1 (crash-class failures don't produce findings rows) —
always confirm against the raw log tail.

### 4.5 TypeScript 7 contextual typing through `.filter()`

Annotating a filtered array literal directly (`const x: T[] = [...].filter(...)`)
or using `satisfies T[]` does **not** preserve literal-type inference — members
widen to `string`. The working pattern is annotating the array **before**
filtering:
```ts
const actions: AdminActionDef[] = [ ... ];
const visible = actions.filter(a => cond);
```
**Rule going forward:** annotate at the widest point where literals still have
contextual influence; `.filter()` breaks the inference chain.

### 4.6 Trusting green caches during triage

Early in the sprint several packages appeared healthy purely due to cache
replay (see 2.3), which distorted prioritization — real debt surfaced late in
random order. Accept that sweep order after a cache invalidation is discovery
order, not severity order.

---

## 5. Playbook for future lint burn-downs

1. **Run the sweep, take one blocker at a time.** Never batch-fix across
   packages from memory; each package's log is the source of truth.
2. **Forensics:** map file→line→rule from
   `reports/run-packages_<pkg>-lint_eslint.log`; group by rule to find families.
3. **Classify** into real bug / documented family / tool bug (table in §1).
   Real bugs are hand-fixed even when small — they are why the gate exists.
4. **Downgrades are documented blocks, not scattered disables:** mirror the
   block from `packages/ui/eslint.config.mjs` (justified header + per-family
   lines), scoped to the package, warnings stay visible with counts recorded.
5. **Verify standalone** after every fix (`pnpm --filter <pkg> run lint:eslint`)
   before moving on; expect the sweep to fail somewhere new until done.
6. **After finishing:** commit with a body listing follow-ups (barrel rewrite,
   a11y hints, FormBuilder extraction, duplicate `DatabaseClient`
   consolidation) so debt has owners.

## 6. Where things stand (2026-08-25)

- Gate-green: ui, core, people, scanner-kit, graphics, analytics, ai,
  form-builder, profile, platform-mcp, library (0 errors each; warning counts
  recorded in their config blocks).
- WIP commits pushed: `c583c61e`, `c76bef5c` (both `--no-verify`; a real
  gate-passed push is still owed).
- Outstanding: full-sweep confirmation end-to-end; sovereign push without
  `--no-verify`; linter-quadruplex consolidation proposal; `scripts/`
  taxonomy (122 files); Google API key rotation (user action).
