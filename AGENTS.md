# AGENTS.md — Agent Guardrails for Polymath Platform

> **This file exists to prevent agents from making build-breaking mistakes.**
> Read it before touching any Expo / React Native / Gradle code.

---

## Critical Rules (NEVER do these)

### 1. NEVER run `expo install --fix`

This command downgrades packages to Expo's recommended versions. This repo **intentionally** uses newer versions for new-architecture support. Running `expo install --fix` WILL break the build.

```bash
# ❌ NEVER
npx expo install --fix
npx expo install --check

# ✅ DO THIS INSTEAD (diagnostic only, no changes)
pnpm --filter gurudevi-mobile exec expo-doctor
```

### 2. NEVER run `expo prebuild --clean` without explicit user approval

`--clean` wipes the entire `android/` and `ios/` directories and regenerates from scratch. While this is sometimes necessary, it destroys any locally-generated state and requires a full rebuild.

```bash
# ❌ NEVER (without user approval)
npx expo prebuild --clean

# ✅ DO THIS INSTEAD
npx expo prebuild --no-install
# This regenerates without the destructive clean step.
```

### 3. NEVER edit files inside `android/` or `ios/` directly

These directories are **ephemeral build artifacts** (gitignored). Any edits will be wiped by the next prebuild.

All native configuration must go through:
- `apps/gurudevi-mobile/app.json` (config plugins)
- `apps/gurudevi-mobile/plugins/*.js` (custom config plugins)

### 4. NEVER remove version exclusions from `package.json`

The `expo.install.exclude` and `expo.doctor.reactNativeDirectoryCheck.exclude` arrays contain packages that are intentionally pinned to newer versions. Removing these exclusions causes `expo doctor` to flag them, and agents may try to "fix" them.

---

## Sacred Versions (do NOT change without explicit approval)

These packages are pinned to specific versions for new-architecture compatibility:

| Package | Sacred version | Why |
|---|---|---|
| `react-native-gesture-handler` | 3.0.2 | RNGH v3 for new arch |
| `react-native-reanimated` | 4.5.0 | Reanimated 4 for new arch |
| `react-native-worklets` | 0.11.1 | Required by reanimated 4 |
| `react-native-mmkv` | 4.3.2 | Nitro modules v4 |
| `react-native-nitro-modules` | 0.36.1 | Required by mmkv 4 |
| `@shopify/react-native-skia` | 2.6.5 | New arch Skia |
| `typescript` | 7.0.2 | Latest stable |

To update any of these: discuss with the user first, verify compatibility with Expo 57, and test on a physical device.

---

## How to Add a New Native Dependency

1. **Check if it has an Expo config plugin:**
   ```bash
   # Look for "expo" in the package's plugin field
   npx expo install <package-name>
   ```
   If the package provides a config plugin, add it to `app.json` plugins array.

2. **If it needs a Maven repo (Android):**
   - Add the URL to `app.json` under `expo-build-properties` → `android.extraMavenRepos`.
   - If it needs to be in `buildscript.repositories` (rare), create a new plugin in `plugins/` using `withProjectBuildGradle`.

3. **If it needs native code changes:**
   - Create a config plugin in `plugins/` using the shared helper (`plugins/lib/buildGradleBlock.js`).
   - Wire it into `app.json` plugins array.

4. **Never hand-edit `android/` or `ios/`.**

---

## How to Update Expo SDK

1. Check the Expo SDK changelog for breaking changes.
2. Run `npx expo upgrade` (this updates SDK + compatible deps).
3. Run `expo-doctor` to verify.
4. Test on a physical device.
5. If versions conflict with sacred versions, manually override and re-add exclusions.

---

## How to Debug Build Failures

1. **Check the error message** — most Gradle errors tell you exactly what's wrong.
2. **Regenerate android/** — delete and prebuild:
   ```bash
   Remove-Item -Path "apps\gurudevi-mobile\android" -Recurse -Force
   npx expo prebuild --no-install --platform android
   ```
3. **Check plugin output** — prebuild logs show which plugins ran.
4. **Verify app.json** — `npx expo config --type prebuild` shows resolved config.
5. **Check the docs**:
   - `docs/Learning/EXPO_BUILD_RUNBOOK.md` — developer runbook
   - `docs/infra/expo-57-native-gradle-sop.md` — infra reference

---

## Git Rules

- `android/` and `ios/` are gitignored. Do not commit them.
- `node_modules/` is gitignored. Do not commit it.
- Lock files (`pnpm-lock.yaml`) MUST be committed.
- Feature branches merge forward: feature → main-dev → main. No rebase on long-lived branches.

---

## Reference Docs

- `apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md` — build commands, git workflow, troubleshooting
- `apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md` — gradle state, plugin table, decision log
- `apps/gurudevi-mobile/app.json` — single source of truth for native config
- `apps/gurudevi-mobile/plugins/` — custom config plugins
