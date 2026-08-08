# Expo Prebuild, Config Drift, and "Things Get Silently Wiped" — Reference

Context: solo dev + AI, RN/Expo monorepo, doing custom native (C++/Rust) module
work, applying manual patches — this doc covers what actually gets lost when
generated-config workflows run repeatedly, how to preserve changes properly,
and related patterns in the same "silent loss" family.

---

## 1. What `expo prebuild --clean` actually does

- It is a **full delete + regenerate** of `ios/` and `android/`, built from
  `app.json`/`app.config.js` + whatever config plugins your installed
  packages ship — not a merge, no diff, no warning.
- Anything sitting *directly* inside those folders that isn't represented by
  a plugin is gone on every run. Concretely wiped:
  - Hand-edited `Info.plist` / `AndroidManifest.xml` entries
  - Manual `Podfile` / `build.gradle` tweaks
  - Custom Xcode build settings changed by hand in Xcode itself
  - Native source files dropped directly into `ios/`/`android/`
  - Any patch applied directly to a generated file

## 2. How to actually preserve changes across repeated prebuild runs

- **`@expo/config-plugins`' `withMod` API** — the sanctioned mechanism: write
  a small function that programmatically edits `Info.plist`/
  `AndroidManifest.xml`/`Podfile`/`build.gradle` *during* prebuild, so the
  edit is reapplied every regeneration instead of surviving by accident.
- **`expo-build-properties`** — first-party plugin covering the most common
  tweaks (minSdkVersion, extra Pods, ProGuard rules) without writing a custom
  plugin — check this before hand-rolling anything.
- **Custom native source files** (Swift/Kotlin/C++ you wrote yourself) —
  keep them *outside* `ios/`/`android/` (e.g. your own `modules/` folder),
  and have a config plugin copy/reference them in during prebuild.
- **The blunt, honest fix once you're doing serious native customization**:
  stop running `prebuild --clean`. Commit `ios/`/`android/` to git and
  hand-maintain them from that point — this *is* the bare workflow, arrived
  at gradually instead of all at once.

## 3. CI implications — smaller than they feel

- EAS Build and GitHub Actions both just build whatever's in `ios`/`android`
  — managed-regenerated or hand-edited, doesn't matter. **No actual
  lock-in.**
- The real risk is a workflow-discipline one, not a tooling one: if you
  hand-edit generated folders directly (instead of through a config plugin)
  and someone/something later runs `prebuild --clean` again, the manual
  edits are silently wiped with no error.
- Pick one lane and stay in it — don't live in the ambiguous middle:
  1. **Config-plugin-everything** — stay prebuild-compatible, safe to
     regenerate anytime.
  2. **Commit-and-hand-maintain** — fully bare from here on, no more
     `prebuild --clean`.

## 4. `expo install --fix` — a real, separate gotcha

- Rewrites `package.json` dependency versions to whatever the currently
  installed Expo SDK's compatibility list recommends.
- If you deliberately pinned a version — e.g. needed a fix from a newer
  release, or a `patch-package` patch is keyed to an exact version — this
  can silently revert that pin back to "Expo recommended."
- Saving grace: `patch-package` usually **fails loudly** on postinstall if a
  patch no longer applies cleanly against the new version — you get an
  error, not a silent broken build. But you then have to re-diff and update
  the patch file.
- **Treat `expo install --fix` as something to run deliberately and diff,
  never blindly, especially with pinned versions or active patches.**

## 5. The single biggest sneaky one — check this first

- Expo's default project template puts `ios/` and `android/` in
  **`.gitignore`**, because in the managed workflow those folders are meant
  to be ephemeral/regenerated, not committed.
- If you've started hand-editing those folders (or placed patched native
  files there) but never removed that `.gitignore` rule, **your changes
  were never committed at all** — a fresh clone or clean CI checkout would
  silently regenerate from scratch, and the edits simply don't exist there.
- **Check `git status` inside `ios/`/`android/` right now** and confirm
  nothing you care about is untracked, before anything else on this list.

---

## 6. Related "things silently get muddied/thrown away" patterns (extended)

These aren't the same mechanism as prebuild, but they're the same *family*
of failure — something regenerates or gets overwritten without you noticing.

### `node_modules` patches (`patch-package`)
- Any patch lives in `patches/*.patch` and is reapplied on every
  `npm install`/`yarn install` via a postinstall hook — **if that hook is
  missing or misconfigured**, a fresh CI checkout silently runs unpatched
  code with no error at all (unlike a version mismatch, which at least fails
  loudly). Worth explicitly verifying the postinstall hook exists and runs
  in CI, not just locally.
- If a patched package gets upgraded (by you, by `expo install --fix`, or by
  a teammate/AI), the patch may silently no longer apply — always check
  patch application logs in CI, don't assume "it worked before."

### Lockfile drift (`yarn.lock` / `package-lock.json` / `Podfile.lock`)
- `Podfile.lock` pins exact native iOS dependency versions — if it's not
  committed, two builds of the "same" code can silently link different Pod
  versions, causing "works on my machine" native crashes.
- In a monorepo, a hoisted dependency can resolve to a different version
  than what a single package expects, if the lockfile isn't respected
  consistently across install locations (CI vs local).

### Monorepo autolinking + symlinks
- Yarn/npm workspaces symlink local packages into `node_modules` — RN's
  autolinking has to resolve through those symlinks correctly on both
  platforms. A local native module package (e.g. your Nitro/UBRN adapter)
  can silently fail to autolink if the monorepo's hoisting moves it to an
  unexpected path, especially after a lockfile or workspace config change.
- CocoaPods in particular has had recurring issues correctly resolving
  symlinked local podspecs in monorepos — worth a real device/simulator
  build check after any workspace restructuring, not just a JS-level test.

### New Architecture opt-in flags
- Some native modules/packages have their own per-package flag for whether
  they build against the New Architecture (JSI/Fabric/TurboModules) or the
  old bridge. If one dependency in the monorepo is silently still on the
  old flag while your app is New-Architecture-only, you get a runtime
  crash or silent no-op rather than a build-time error — worth explicitly
  auditing this list after adding any new native dependency.

### EAS Build profile/env drift
- `eas.json` build profiles (development/preview/production) can have
  silently different env vars, native config overrides, or credentials —
  a bug that only reproduces in one profile is often this, not the code.

---

## 7. Practical checklist for where you are right now

1. `git status` inside `ios/`/`android/` — confirm nothing important is
   untracked; remove them from `.gitignore` if you're hand-maintaining them.
2. Audit current patches — are they patching **generated** files (fragile,
   wiped on prebuild) or your **own package's** files (safe either way)?
3. Confirm the `patch-package` postinstall hook actually runs in CI, not
   just locally — check a CI log for the "applying patch" output.
4. Decide and commit to one lane: config-plugin-everything, or
   commit-and-hand-maintain (bare). Don't stay in the ambiguous middle.
5. If you ever run `expo install --fix`, diff the resulting `package.json`
   before committing it — don't accept it blindly if anything is pinned
   deliberately.
6. After any monorepo workspace/lockfile change, do one real device/
   simulator build — not just a JS-level check — to catch autolinking or
   symlink resolution breakage early.
