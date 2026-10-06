---
title: "Developer Environment & Cross-Platform Distribution Plan"
status: "in-progress"
created: 2026-10-02
updated: 2026-10-02
author: "Naveen"
scribe: "opencode"
tags: [devops, onboarding, cross-platform, windows, wsl2, pnpm, distribution, contributor-experience]
---

# Developer Environment & Cross-Platform Distribution Plan

A plan to make this monorepo installable, buildable, and contributable on
Windows, macOS, and Linux — without every contributor rediscovering the
platform failure modes by hand.

Related:

- [`oss-public-release-devops-checklist.md`](./oss-public-release-devops-checklist.md) — the gate this plan feeds (D-1, D-5, D-7)
- [`oss-public-release-security-checklist.md`](./oss-public-release-security-checklist.md) — security gate
- [`../architecture/external-packages-linking.md`](../architecture/external-packages-linking.md) — background on the `link:` dependencies
- [`../../apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md`](../../apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md) — existing build runbook
- [`../../apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md`](../../apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md) — native gradle SOP

---

## 0. The short version

You are not missing knowledge — you are working without a written model of
*which parts of this project can possibly work on which OS*, so every failure
looks like a mystery instead of a known, solvable class.

There are three separate problems hiding under "it doesn't work on my OS":

| Problem | What it actually is | Fix |
|---|---|---|
| `pnpm install` fails everywhere | **4 hardcoded paths to your C: drive** are committed into `package.json`, the lockfile, *and* `metro.config.js` | §6 Phase 0 |
| Root commands fail on Linux/macOS | 6 scripts require PowerShell; ~20 `clean` scripts require `rm -rf` | §6 Phase 1 |
| Android build fails on Windows | Windows cannot reliably do the symlink and native-toolchain work React Native needs | §2 — build it in the cloud instead |

The first two are ordinary bugs and must be fixed. **The third is not a bug —
it is a design decision.** This plan's central recommendation is: *do not build
Android natively on Windows. Use EAS cloud builds.* That deletes most of the
problem rather than solving it.

---

## 1. Three supported paths

Not every contributor needs every toolchain. Declaring tiers is what makes this
elegant — it means a web contributor never installs an Android SDK.

| | **Path A — Default** | **Path B — Android native** | **Path C — iOS** |
|---|---|---|---|
| **Who** | New contributors, web/API work, JS-only mobile work, CI | Mobile engineers changing native code, config plugins, gradle | Anyone shipping iOS |
| **Windows** | ✅ native Windows | ⚠️ WSL2 only | ❌ cloud only |
| **macOS** | ✅ native | ✅ native | ✅ native |
| **Linux** | ✅ native | ✅ native | ❌ cloud only |
| **Installs** | Node + pnpm | + JDK 17, Android SDK 36, NDK r27b | + Xcode |
| **Builds Android** | ☁ EAS cloud | local Gradle | ☁ EAS cloud |
| **Builds iOS** | ☁ EAS cloud | ☁ EAS cloud | local Xcode |
| **Effort** | minutes | hours, and it will break | days |

**Path A must work flawlessly.** It is the first impression and it gates every
external contribution. Paths B and C are for maintainers and a small number of
specialists.

### Why iOS is separate

Apple's toolchain only runs on macOS, and a signed iOS build requires a paid
Apple Developer Program membership ($99/year). Expo's own matrix marks iOS
local builds as **"no first-class support [on non-macOS], but possible with
WSL."** Treat iOS as macOS-only for real work, cloud-only for everyone else.

---

## 2. The core decision: do not build Android natively on Windows

This is the recommendation that removes most of your pain, so it is worth
stating the evidence.

### 2.1 It is already your own policy

`AGENTS.md` says, verbatim:

> **NEVER** build native Android on the Windows host directly. Windows paths
> exceed limits (`CMAKE_OBJECT_PATH_MAX`) and trigger Ninja manifest timestamp
> loops. Always run from the active workspace inside WSL 2.

So the policy exists. What is missing is that **a new contributor never reads
`AGENTS.md`**, and nothing in `README.md` or the onboarding path tells them.
The policy is real but invisible. That is the actual defect.

### 2.2 The cloud build is already pinned and reproducible

`apps/gurudevi-mobile/eas.json` pins a fully-specified Linux image for every
profile:

```json
"image": "ubuntu-26.04-jdk-17-ndk-r27b-sdk-57"
"node": "22.23.2"
```

That is the environment you would spend a day assembling by hand on Windows. It
already exists, it is identical for every developer and for CI, and it removes
JDK, SDK, NDK, CMake, Ninja, and Gradle from the contributor's machine
entirely. Use it as the default and stop asking Windows users to do better.

### 2.3 The cost is lower than it looks

From Expo's current pricing: the **Free plan includes 15 Android and 15 iOS
builds per month** (low-priority queue, 45-minute build timeout). A paid
Starter plan is $19/month with $45 of credit. Usage pricing beyond credit is
$1 per Android build on a medium worker.

For a project that builds debug + preview + release, 15 cloud builds a month
covers normal iteration. If a contributor needs unlimited local builds, that is
a Path B decision for that person — not a tax on everyone.

### 2.4 What cloud builds cannot do

Stated plainly so the tiering is honest. EAS Build is **not** for debugging
native code. You cannot attach a debugger to a cloud build, and iterating on a
config plugin or a gradle change means a cloud round-trip per attempt. Path B
exists for exactly that, and per your own runbook it belongs in WSL2.

---

## 3. Windows: the mechanics, if you must

You said you feel blind on this, so here is the whole picture. Six things cause
essentially every Windows failure in a project like this.

### 3.1 Windows requires opt-in permission to create symlinks

pnpm builds `node_modules` almost entirely from symlinks and junctions. Windows
refuses to create them without either Administrator rights or **Developer Mode**.
This is the single most common cause of:

```
EPERM: operation not permitted, symlink '...node_modules\.pnpm\...'
```

Fix once, permanently: **Settings → Privacy & security → For developers →
Developer Mode → On.** This needs no reinstall and fixes a large share of
Windows install failures.

### 3.2 pnpm's store hard-links, so it must live on the same filesystem

pnpm's FAQ is explicit: *"The package store should be on the same drive and
filesystem as installations, otherwise packages will be copied, not linked."*
A store on `C:` and a project on `D:` silently degrades into a full copy of
every dependency, which looks like "install is broken/slow" rather than an error.

Note this repo's global override of `@types/react-native` to
`link:./packages/types-shim` — a local link — is fine, but any future
cross-drive `link:` will hit this.

### 3.3 Long paths

`node_modules/.pnpm/<name>@<version>_<peers>/node_modules/<name>` nests deeply
and can exceed Windows' historical 260-character limit. Enable long paths via
the registry key `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled = 1`
(Git for Windows "Use Git's long path support" is a subset of this). Your
`AGENTS.md` already documents hitting `CMAKE_OBJECT_PATH_MAX` for exactly this
reason.

### 3.4 Antivirus and indexers hold file locks

Windows Defender, TortoiseGit's `TGitCache.exe`, OneDrive, and indexers open
files without sharing, producing `EACCES` / `EBUSY` on rename during install.
Add Defender exclusions for the repo and the pnpm store:

```
Add-MpPreference -ExclusionPath "C:\path\to\repo"
Add-MpPreference -ExclusionPath "$env:LOCALAPPDATA\pnpm\store"
```

### 3.5 If you use WSL2: the project must live on the Linux filesystem

This is the single most important WSL2 rule and the most commonly violated.

Expo's official WSL guide states it directly:

> **Important: Your Expo project must be entirely on the Linux filesystem.**
> … once you are using WSL, your Expo project needs to exist on the Linux
> filesystem, and any source control operations must be performed via the Linux
> version of git.

A project cloned into `/mnt/c/...` is on the Windows filesystem, reached over
WSL2's 9P protocol. That causes:

- installs that fail with `EACCES: permission denied, rename` mid-download
  (a very well-known pnpm-on-WSL failure);
- file-watching (`inotify`) that does not work, which breaks Metro fast refresh;
- build times that are many times slower than the same build on native Linux.

Correct location and command:

```bash
# WSL terminal
cd ~ && git clone <repo> edlove && cd edlove
pnpm install
code .        # VS Code WSL extension; it uses the Linux git and terminal
```

Access it from Windows Explorer at `\\wsl$\<distro>\home\<you>\edlove`. Do not
edit the same tree from a Windows-side tool at the same time — that reintroduces
the cross-filesystem problem.

If `pnpm install` hangs with slow DNS inside WSL2, the cause is usually the
generated `/etc/resolv.conf`; see §3.6.

### 3.6 Networking: device connections and DNS

Two separate problems, both documented by Expo:

**Reaching the Metro dev server from a phone.** Under WSL2 the dev server binds a
`172.x` address internal to the VM, so a physical device on your LAN cannot reach
it. The modern fix is mirrored networking in `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
networkingMode=mirrored
[experimental]
hostAddressLoopback=true
```

Then `wsl --shutdown` and reopen. The QR-code IP should then match `ipconfig`.
You may also need an inbound Hyper-V firewall rule. The zero-config fallback is
`npx expo start --tunnel` (ngrok — slower reloads, but it always works).

**Slow DNS inside WSL2** — a classic cause of "npm install just hangs". Fix by
pinning the resolver in `/etc/wsl.conf`:

```ini
[network]
generateResolvConf = false
```

and writing a working `nameserver` into `/etc/resolv.conf`. Changing Windows DNS
to a reliable resolver (e.g. Cloudflare `1.1.1.1`) resolves it without touching
WSL config at all.

### 3.7 Line endings

There is **no `.gitattributes`** in this repository, and your local git has
`core.autocrlf=true`. That means Windows checkout converts LF to CRLF in your
working tree. Consequences specific to this repo:

- **Husky hooks break.** `.husky/pre-commit`, `commit-msg`, and `pre-push` are
  shell scripts. CRLF makes them fail with `bad interpreter: /bin/sh^M`.
- `.sh` scripts anywhere in the tree behave the same way.
- Any test that compares file content byte-for-byte becomes OS-dependent.

Adding `.gitattributes` (Phase 3) fixes this for everyone and is a prerequisite
for public release, not just for Windows.

---

## 4. macOS and Linux

Much shorter, which is the point.

### macOS
- Install Node via `mise` (§5). Xcode CLT via `xcode-select --install`.
- Path C (local iOS) additionally needs a full Xcode and an Apple Developer
  account for signed builds.
- Apple Silicon: watch for native modules without `arm64` prebuilds. The
  `allowBuilds` list in `pnpm-workspace.yaml` already permits `onnxruntime-node`,
  `better-sqlite3`, `sharp`, and `node-pty` to compile from source — those are
  the ones most likely to need Rosetta or a source build.

### Linux
- The natural, well-supported environment. Needs `build-essential`,
  `python3`, and `pkg-config` for the native modules in `allowBuilds`.
- Android Path B additionally needs JDK 17, Android SDK platform 36,
  build-tools, platform-tools, and NDK r27b — matching the `eas.json` image.
- Keep `ANDROID_HOME` / `ANDROID_SDK_ROOT` / `ANDROID_NDK_HOME` exported in the
  shell, per `AGENTS.md`.

---

## 5. Single source of truth for versions

Right now **five places** declare a toolchain version and they disagree. This is
the root cause of "pnpm breaks" more than any platform bug.

| Source | Node | pnpm |
|---|---|---|
| `package.json` `engines` | `>=22.23.0 <23` | — |
| `package.json` `packageManager` | — | `12.4.2` |
| `.nvmrc` | `22.23.2` | — |
| `mise.toml` | `"22"` (any 22.x) | `12.4.2` |
| `apps/gurudevi-mobile/eas.json` (×3) | `22.23.2` | — |
| CI workflows (5 of them) | — | **`11.21.0`** |
| CI workflows (4 of them) | — | **`12.1.0`** |

Note `mise.toml` says Node `"22"` while every other source says `22.23.2`. A
contributor on 22.0.0 satisfies mise but violates `engines`. Fix by making
`mise.toml` exact and letting the others agree.

### 5.1 Also remove the unused `bun`

`mise.toml` installs `bun = "1.3.14"`. A repository-wide search for
`bun run`, `bunx`, `bun install`, and `bunfig` returns **zero hits**. Nothing
uses it. Every contributor pays the download and disk cost for a tool that is
never invoked. Remove it, or add the one script that needs it.

### 5.2 Decide how pnpm gets installed — and know the deadline

`packageManager: pnpm@12.4.2` currently works because **Corepack**, which ships
with Node, reads that field. But:

> **Corepack will no longer be distributed starting with Node.js v25.**

You pin Node `<23`, so this works today. It will not survive a Node upgrade, and
a contributor who ignores `engines` and installs Node 25 gets a confusing
failure. Separately, pnpm maintainer Zoltan Kochan notes pnpm v12 is a **native
executable**, so routing every `pnpm` invocation through Corepack's JavaScript
wrapper adds startup overhead.

Pick one, now, and write it in the README:

| Option | What it means | Cost |
|---|---|---|
| **A. `mise` (recommended)** | `mise install` reads `mise.toml`, `.nvmrc`, and `packageManager`; `mise` puts the real binaries on `PATH` with no Corepack wrapper | one more tool to install; `mise` is not on every machine |
| B. Corepack | `corepack enable` — bundled, zero install, but dies with Node 25 | future breakage |
| C. pnpm self-management | install pnpm directly; `devEngines.packageManager` + `pmOnFail: ignore` in `pnpm-workspace.yaml` makes pnpm check itself | least familiar |

Whichever you choose, `pnpm` must arrive at exactly `12.4.2`, including in CI.

---

## 6. The repo fixes, in dependency order

### Phase 0 — Remove the hardcoded C: paths (blocking, do first)

> **Status: complete and verified.** All `link:` specifiers, the Metro override,
> and the lockfile entries are gone. A clean clone on WSL2 Linux ext4 now
> completes `pnpm install --frozen-lockfile` (115,846 files, exit 0). See §11 for
> the full verification record and for two defects this surfaced.

This is why `pnpm install` fails for every contributor and why your own Linux
attempts fell over. `C:/projects` appeared in **8 files / 11 occurrences**:

| File | What |
|---|---|
| `packages/editorial/package.json:28` | self-link to `link:C:/projects/packages/editorial` |
| `packages/ui/package.json:879` | `link:C:/projects/packages/a11y-gate` |
| `apps/gurudevi-marketingWeb/package.json:27` | `link:C:/projects/packages/a11y-gate` |
| `apps/edlove-web/package.json:26` | `link:C:/projects/packages/a11y-gate` |
| `pnpm-lock.yaml` (**8 refs**) | the resolved links are **baked into the lockfile** |
| **`apps/gurudevi-mobile/metro.config.js:233`** | `path.resolve('C:/projects/packages/a11y-gate')` |
| `docs/architecture/external-packages-linking.md` | documents the linking |
| `docs/architecture/2026-09-05-a11y-gate-canonical-consolidation.md` | documents the consolidation |

Two things make this more than a find-and-replace:

1. **The lockfile carries the damage.** Fixing the four `package.json` files is
   not enough; `pnpm-lock.yaml` must be regenerated, which means a deliberate
   `pnpm install` that produces a reviewed diff.
2. **`metro.config.js` is a sixth location** and is easy to miss because it is
   not a manifest — and it is the most dangerous of the six, for a reason
   described next.

### 6.1 `@intuitui-labs/*` — verified state

All four `@intuitui-labs/*` packages are now published on npm under the
`@intuitui-labs` scope, all MIT. Verified against the live registry on
2026-10-02:

> **Status: complete.** All four now declare registry semver ranges. Verified by
> resolving each specifier from a clean WSL2 clone against the pnpm store.

| Package | Published versions | Declared in this repo as | Status |
|---|---|---|---|
| `@intuitui-labs/a11y-gate` | `0.1.0`, **`0.2.0`** | `"^0.2.0"` in `packages/ui`, `apps/edlove-web`, `apps/gurudevi-marketingWeb` | ✅ done |
| `@intuitui-labs/editorial` | `0.1.0`, **`0.1.1`** | `"^0.1.1"` in `packages/editorial` | ✅ done |
| `@intuitui-labs/form-builder-engine` | **`0.1.0`** | `"^0.1.0"` in `packages/core`, `packages/form-builder` | ✅ done |
| `@intuitui-labs/lk-edu-geo` | **`1.0.1`** | `"^1.0.1"` in `packages/graphics` | ✅ done |

`packages/editorial` is `@repo/editorial`, a thin facade that re-exports
`@intuitui-labs/editorial`; the dependency is on the published upstream, not a
self-link. Both Astro apps consume it, so the wrapper stays.

### 6.2 Subpath export compatibility — verified

Because these packages were consumed as workspace sources, their subpath exports
must match every import the repo makes. Checked rather than assumed:

**`form-builder-engine@0.1.0`** — the repo imports seven subpaths:
`/analytics`, `/codegen`, `/core`, `/hydration`, `/ports`, `/schema`,
`/validation`. The published `exports` map declares **all seven** explicitly,
each with `types` + `import` + `default`, plus `.`, `./*`, and `./package.json`.
✅ No gap.

Note the `./*` wildcard: it makes resolution *permissive*, so a typo'd subpath
resolves at the map level and then fails at load time with
`ERR_MODULE_NOT_FOUND` rather than a clean resolution error. Not a release
blocker, but worth knowing when a subpath import mysteriously half-works.

**`lk-edu-geo@1.0.1`** — the repo imports the bare specifier only, with no
subpaths. Published exports are `.`, `/data/*`, and `./package.json`.
✅ No gap on exports — but the *runtime* entry was broken. See §11.1.

**`a11y-gate@0.2.0`** — `packages/ui/src/utils/a11yUtils.ts` imports `.`,
`/mobile`, `/wcag3`, and `/web`. All four are exported, along with `/cvd`,
`/audit`, `/contrast`, `/motion`, `/runner`, `/spatial`, `/tokens`.
✅ No gap.

Because all three are pre-1.0 except `lk-edu-geo`, a caret range allows only
patch updates within the same minor (`^0.2.0` → `>=0.2.0 <0.3.0`). That is the
conservative and correct choice given the subpath surface is public API, but it
does mean new minors require a deliberate pin bump.

### 6.3 The Metro override is the real hazard — remove it, do not just fix it

`apps/gurudevi-mobile/metro.config.js:231-242` is worse than a hardcoded path:

```js
const candidateA11yPaths = [
  path.resolve('/home/nsk/projects/packages/a11y-gate'),   // personal Linux path
  path.resolve('C:/projects/packages/a11y-gate'),          // personal Windows path
  path.resolve(workspaceRoot, '../packages/a11y-gate'),
];
const a11yGateExternalPath = candidateA11yPaths.find((p) => fs.existsSync(p));
if (a11yGateExternalPath) {
  SINGLETON_OVERRIDES['@intuitui-labs/a11y-gate'] = a11yGateExternalPath;
  ...
}
```

Two distinct failures:

- **On a machine without those paths**, `find` returns `undefined`, the override
  is **silently skipped**, and no error is raised. Metro just falls through to
  normal resolution — which currently means resolving a `link:` that does not
  exist. A contributor gets a confusing downstream module-not-found instead of
  a clear "a11y-gate is not installed".
- **On a machine that *does* have them**, the override forces Metro to build
  against a **local directory instead of the installed package** — silently. Two
  different codebases then ship under the same package name, and the one you
  tested is not the one a contributor built. This is a correctness and
  supply-chain hazard, and it survives the manifest fix.

Therefore: **delete the whole `candidateA11yPaths` block** as part of Phase 0.
Fixing only the `link:` strings leaves a machine-dependent override in place. If
you still want to edit the engine in place while developing it, do it the
standard way — `pnpm add --global` + `pnpm link --global` — rather than through
a hardcoded path list in shared config.

### 6.4 Correct the architecture doc, which will otherwise re-introduce the bug

`docs/architecture/external-packages-linking.md:128-138` prescribes a fix that
was never executed and is wrong. Following it as written would produce a broken
repo:

```json
"@intuitui-labs/a11y-gate": "^1.0.0",  // ❌ 1.0.0 does not exist; latest is 0.2.0
"@intuitui-labs/editorial": "^1.0.0",  // ❌ 1.0.0 does not exist; latest is 0.1.1
"@intuitui-labs/form-builder-engine": "^1.0.0",  // ❌ latest is 0.1.0
"@intuitui-labs/lk-edu-geo": "^1.0.0",            // ❌ latest is 1.0.1
```

None of those `^1.0.0` ranges resolve. The doc's own premise — "publish the 4
canonical packages to npm under `@intuitui-labs/*`" — has since been carried out,
and the two that were previously in-repo workspace packages now exist only on
npm (`form-builder-engine@0.1.0`, `lk-edu-geo@1.0.1`); their workspace
directories have been removed.

Update the doc to the real published versions and the real intent, otherwise the
next person will "restore" the broken `link:` paths or reintroduce a workspace
package whose name collides with a published npm package.

Exit criteria: `pnpm install --frozen-lockfile` succeeds from a clean clone on
Linux and macOS, with a reviewed `pnpm-lock.yaml` diff; `git grep "C:/projects"`
and `git grep "/home/nsk/projects"` both return nothing outside historical docs.

### Phase 1 — Make the scripts portable

> **Status: partially complete.** The two blockers that would have hard-failed
> for any new contributor are fixed; the remaining rows are still open.

Done:

| Problem | Resolution |
|---|---|
| Personal `fd.exe` path in 3 audit scripts | New `scripts/lib/fd-resolver.mjs`: honours `FD_BIN`, else `fd` on `PATH`, else `null`. All three scripts (`audit-imports.mjs`, `find-native-leaks.mjs`, `report-cognitive-load.mjs`) already had a pure-Node fallback walker, so they now degrade cleanly. Verified on a host with no `fd` installed. |
| `/home/nsk/projects/polymath-platform` in `build-android.mjs` (5 sites) and `sync-wsl.mjs` | New `scripts/lib/wsl-workspace.mjs`: `POLYMATH_WSL_DIR` override, default `$HOME/projects/polymath-platform`. The rsync source is derived from the repo root instead of a literal `/mnt/c/x`. |

Still open:

| Problem | Count | Change |
|---|---|---|
| `powershell -ExecutionPolicy Bypass -File scripts/*.ps1` | 6 root scripts: `biome:audit`, `audit:size`, `maintenance:outdated`, `audit:deprecations`, `audit:mobile:doctor` | port to `node scripts/*.mjs`, matching the existing `scripts/run-and-report.mjs` pattern |
| `rm -rf` in `clean` | ~20 packages | use `rimraf` (already resolved in `overrides`) or `node -e "fs.rmSync(...)"` |
| `C:\Program Files\...chrome.exe` / `brave.exe` | `playwright.config.ts`, `diag*.mjs`, `diag2`–`diag8`, `inspect-brave.mjs` | resolve the browser via Playwright's own API or an env var, never a hardcoded path |
| `C:/Users/Naween/.gemini/...` | `docs/Support/consolidate_docs.ps1` | personal path in a tracked file → remove or parameterize |

The browser-path scripts are one-line-per-file and low risk; do them early
because they are the most obviously Windows-only thing in the tree after the
manifests.

### Phase 2 — One toolchain version

> **Status: complete.** Node `22.23.2` and pnpm `12.4.2` are pinned in
> `.nvmrc`, `mise.toml`, `package.json`, and all 16 active CI `pnpm/action-setup`
> steps. `bun` was **retained**, not removed: `apps/sanctuary-api` still needs it.

- Set `mise.toml` to the exact Node `22.23.2`; make `.nvmrc`, `engines`, and
  `eas.json` agree.
- Delete the hardcoded pnpm `version:` from all 9 workflows so
  `packageManager` is authoritative.
- ~~Remove `bun` from `mise.toml`~~ — **reverted**: `apps/sanctuary-api` uses it.
- Record the pnpm-installation decision (A§5.2) in `README.md`.

### Phase 3 — Line endings and hooks

> **Status: complete.** `.gitattributes` added with LF defaults, CRLF for
> `.bat`/`.cmd`, LF for husky hooks and shell scripts, and binary rules. Husky
> hooks verified LF in a WSL2 clone. Note the `.ps1` rule was intentionally
> **omitted** — PowerShell 5.1 reads LF files fine, and the existing scripts are
> committed LF.

Add `.gitattributes`. This is the standard, and it is what stops Windows
contributors from getting broken husky hooks:

```gitattributes
* text=auto eol=lf
*.bat text eol=crlf
*.cmd  text eol=crlf
*.ps1  text eol=crlf
*.sh   text eol=lf
*.png binary
*.jpg binary
*.pdf binary
*.apk binary
*.aab binary
*.keystore binary
pnpm-lock.yaml text eol=lf
```

Then, on every contributor machine, one normalisation re-checkout. Do this
**before** the repo goes public, since it rewrites working trees.

### Phase 4 — Make the environment reproducible

Two artifacts, both optional but high value:

- **`.devcontainer/devcontainer.json`** — one-click Node 22 + pnpm + JDK 17 +
  Android SDK environment on VS Code and GitHub Codespaces. This is the cheapest
  possible answer to "how do I set this up" for web/API contributors and for CI
  parity. It does not replace Path A's local setup; it complements it.
- **`scripts/bootstrap.mjs`** — a cross-platform Node script that checks Node and
  pnpm versions, verifies long-path/Developer-Mode-adjacent settings where it
  can, runs the install, and prints the next step. One command for a new
  contributor: `node scripts/bootstrap.mjs`.

### Phase 5 — Prove it

See §7. Do not claim cross-platform support from a Windows working copy.

---

## 7. Verification matrix

Each cell needs a real run on that platform. A green Windows run is **not**
evidence about Linux. Per `AGENTS.md`, report the runner and what it does not
prove.

| Check | Windows | WSL2 | macOS | Linux |
|---|---|---|---|---|
| `pnpm install --frozen-lockfile` from clean clone | ⚠️ fail¹ | ✅ | not run | ✅ |
| `pnpm run check-types` | not run | ⚠️ fail² | not run | not run |
| `pnpm lint` | not run | not run | not run | not run |
| `pnpm test` | not run | ⚠️ fail³ | not run | not run |
| Husky hooks fire and pass | not run | ⚠️ LF only⁴ | not run | not run |
| `pnpm --filter apps-gurudevi-marketing-web build` | not run | not run | not run | not run |
| `pnpm --filter apps-edlove-web build` | not run | not run | not run | not run |
| `pnpm --filter @repo/sanctuary-api test` | not run | not run | not run | not run |
| `pnpm --filter @repo/core test drift-check` | not run | not run | not run | not run |
| EAS cloud Android build (`development` profile) | not run | not run | — | — |
| Local `:app:assembleDebug` | ❌ by policy | not run | not run | not run |
| Device install via `adb install` | optional | not run | not run | not run |

¹ `ERR_PNPM_PACKAGE_MANAGER_INSPECT_OPTIONAL_DEPENDENCY` / OS error `1920` on the
`/mnt/c` 9p mount. Lockfile *validation* passes; this is the 9p/AV environment,
not the manifest.

² One error, `packages/core/src/api/server.ts:36` — pre-existing, unrelated to
this migration. See §11.3.

³ `@repo/ui` 229/230. The single failure is pre-existing and unrelated; see §11.4.

⁴ Verified LF in the working tree. Not verified that a commit actually fires a
hook.

Per `AGENTS.md`, read these labels narrowly. "✅ WSL2" is a Linux-ext4 run via
`wsl -d Ubuntu`; it is **not** native Windows evidence and **not** macOS or
Linux-native evidence. Every cell still marked `not run` is unproven, and
"Astro build", "lint", and every test suite outside the four packages listed in
§11 remain unverified on any platform.

CI is the cheapest way to close the remaining cells: add `windows-latest` and
`macos-latest` to the install-and-verify tier so no one has to prove it manually
again.

---

## 8. What I am deliberately not recommending

Naming these so they are not silently reintroduced.

- **Native Windows Android builds.** Documented as forbidden in `AGENTS.md` and
  structurally unreliable. The cloud path is cheaper and already configured.
- **WSL1 to "fix" filesystem speed.** It improves cross-filesystem performance
  but loses the real Linux kernel and breaks other things. Put the project on
  the ext4 filesystem instead (§3.5).
- **Keeping PowerShell scripts alongside Node ports.** Two implementations of
  every audit is how they drift. Port, do not mirror.
- **`node-linker=hoisted`.** It is pnpm's escape hatch for broken dependencies.
  Enabling it repo-wide to dodge a symlink problem on Windows would give up
  pnpm's isolation and strictness for everyone. Fix the platform instead.

---

## 9. Decisions needed from you

These change the plan and I should not pick them for you.

1. **Where should the contributor's first stop be?** I propose a single
   `docs/infra/developer-environment-guide.md`, linked from `README.md`, that
   says: "Path A by default; here is why; here is Path B if you touch native
   code." Currently the equivalent knowledge lives only in `AGENTS.md`, which
   contributors never read.
2. **pnpm installation mechanism** — mise (A), Corepack (B, has a Node 25
   deadline), or pnpm self-management (C)?
3. **Cloud vs local Android as the default for you personally?** Cloud is
   reproducible; local is faster to iterate on native changes. A reasonable split
   is cloud for release/preview and local for plugin work.
4. **`@intuitui-labs/editorial`: remove the self-dependency, or delete the
   in-workspace `packages/editorial` and depend on the published `0.1.1`?** The
   manifest has `packages/editorial` depending on itself via a `C:` path. Both
   resolutions are defensible, but they have opposite consequences — one keeps
   the source in-repo for local editing, the other makes the repo a pure
   consumer. I cannot infer which you want, and it changes the public shape of
   `packages/`.
5. **Do you want a `.devcontainer`?** High value for contributors and CI
   parity, but it is another surface to maintain.

---

## 10. Effort summary

| Phase | Work | Blocks public release? |
|---|---|---|
| 0 — remove C: paths + regenerate lockfile | 8 files, medium | **Yes** |
| 1 — portable scripts | ~30 files, mostly one-liners | **Yes** |
| 2 — single toolchain version | ~12 files, low | **Yes** |
| 3 — `.gitattributes` + renormalize | 1 new file + re-checkout | **Yes** |
| 4 — bootstrap script + devcontainer | 2 new artifacts, medium | No |
| 5 — verify on 3 OSes | CI matrix | **Yes** (evidence) |

Phases 0–3 are the release-blocking set and are mostly mechanical. Phase 4 is
what turns "installable" into "friendly". Phase 5 is what makes the claim honest.

---

## 11. Verification record (2026-10-02)

What was actually run, and what it does and does not prove.

**Environment.** WSL2, Ubuntu, Linux **ext4** (`/home/nsk/verify/repo`), Node
`22.23.2`, pnpm `12.4.2`, Git `2.53.0`. The repository was cloned from the
Windows working tree with `--no-hardlinks` and the tracked diff applied, so this
is a clean-clone test of the *current* uncommitted state — not of `main`.

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ exit 0, 115,846 files, 2m56s |
| All four `@intuitui-labs/*` resolve from the pnpm store | ✅ no `C:`/`/mnt/c` in `node_modules/.pnpm` keys |
| Runtime import: `a11y-gate` `.` `/mobile` `/wcag3` `/web` | ✅ 56 / 17 / 5 / 17 exports |
| Runtime import: `editorial` | ✅ 36 exports |
| Runtime import: `form-builder-engine` × 5 subpaths | ✅ all load |
| Runtime import: `lk-edu-geo` | ❌ see §11.1 |
| Husky hook line endings | ✅ `pre-commit`, `pre-push`, `commit-msg` all LF |
| `check-types` (8 affected packages) | ⚠️ 6 pass, 1 pre-existing fail — §11.2, §11.3 |
| `@repo/core` test | ✅ exit 0 |
| `@repo/editorial` test | ✅ 13/13 |
| `@repo/graphics` test | ✅ no test files |
| `@repo/ui` test | ⚠️ 229/230 — §11.4 |
| Pristine `HEAD` (no changes) install | ❌ `frozen-lockfile` fails on `link:` targets — confirms Phase 0 was a real blocker |

### 11.1 `lk-edu-geo@1.0.1` throws `ERR_IMPORT_ATTRIBUTE_MISSING` in Node ESM

**Real, platform-independent, and shipped.** `tsconfig.json` combines
`moduleResolution: bundler` with `resolveJsonModule`, so `tsc` emits the dataset
import verbatim:

```js
import dataRaw from './data/lk-edu-data.json';   // no attribute
```

Node's ESM loader requires `with { type: 'json' }` and throws
`ERR_IMPORT_ATTRIBUTE_MISSING`. Vite and Metro resolve JSON at build time and
tolerate the omission, which is why this was invisible until a real Node runtime
loaded the published entry.

**Why no test caught it.** Every suite imported `../src/index.js` through Vite.
CI ran `check-types`, `test:coverage`, `build` — and never imported `dist/`.
Source-level tests are structurally unable to observe artifact-only defects.

**Fixed upstream** in `Intuitui-Labs/lk-edu-geo`, prepared as `1.0.2`
(commit `20e024a`, pushed to `main`; upstream `check-types`, `build`, and full
suite pass — 3 files / 19 tests):

- added the import attribute in `src/index.ts`
- added `test/dist-artifact.test.ts`, which spawns a real `node` process against
  the built `dist/` entry — verified to fail when the attribute is removed and
  pass when present
- `test:artifact` runs in CI and in the publish workflow, after `build`
- `prepublishOnly` reordered to build *before* test so the guard has an artifact
- `.gitattributes` added to that repo

**Not yet on the registry.** Verified during this audit:
`npm view @intuitui-labs/lk-edu-geo versions` → `1.0.1` only. The repo declares
`^1.0.1`, so a fresh install can still select the broken `1.0.1` and fail at
runtime with this exact error. Remaining steps: publish `1.0.2` (the repo's
`publish.yml` triggers on a published GitHub Release), then run
`pnpm install --lockfile-only` in this repo and confirm the lockfile records
`1.0.2`, then re-run the real Node ESM import check.

### 11.2 `check-types` failed on a fresh clone until `astro sync` ran

A clean clone has no `.astro/` directory, so `astro:content` is untyped and both
Astro apps failed `tsc` with `TS7031: Binding element 'data' implicitly has an
'any' type` in `feed.xml.ts`.

**Fixed** by making each Astro app generate its own types as a prerequisite:

```json
"astro:sync": "node ../../scripts/run-and-report.mjs --cmd \"pnpm exec astro sync\" --name \"apps_<app>-astro_sync\"",
"check-types": "node ../../scripts/run-and-report.mjs --cmd \"pnpm run astro:sync && pnpm exec tsc --build --noEmit\" --name \"apps_<app>-check-types\""
```

Verified by deleting both `.astro/` directories in the WSL2 clone and re-running
`check-types --force`: 3/3 tasks pass. Without the change, the same run fails.

### 11.3 `packages/core/src/api/profile.orpc.contract.ts` does not exist

`src/api/server.ts:36` imports `profileORPCContract` from
`@repo/core/api/profile.orpc.contract`. That file is **not in the repository**.
It is the only one of five oRPC contracts referenced by `server.ts` that is
missing; the other four (`identity`, `library`, `onboarding`, `sync`) all resolve.

This is **pre-existing and unrelated to the npm migration** — the import is
present at `HEAD` (76035c45a) and untouched by these changes. It produced exactly
one `TS2307` and was masked before, because nobody could complete an install
outside the author's machine.

**Not fixed here on purpose.** Authoring that contract means choosing endpoint
paths, request/response schemas, and authorization policy for the profile API —
a domain decision, not a mechanical repair. Tracked as an open blocker for
`@repo/core` typecheck.

### 11.4 `@repo/ui` — 1 pre-existing test failure

`PressableScale.test.tsx > applies disabled state` expects `onPress` not to fire
when the button is disabled, but `fireEvent.press` invokes it once.

**Proven unrelated to the a11y-gate bump.** Re-ran with `@intuitui-labs/a11y-gate`
pinned back to `0.1.0` (the pre-migration version) and the test failed
identically. Neither the test nor `PressableScale.tsx` references a11y-gate.
Root cause is a React Native Testing Library / RN Pressable `disabled` behaviour
change, not this migration.