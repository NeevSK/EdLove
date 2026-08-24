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

## Stack Map (REQUIRED after dependency changes)

- **After adding/removing any workspace package or dependency:** run `pnpm run stack-map:bootstrap` (drafts an entry), review it in `docs/stack-map/landscape/stack-map-annotations.yaml`, then run `pnpm run stack-map` to regenerate the docs.
- `docs/stack-map/landscape/stack-map.md` + `catalog/` are **generated** — never hand-edit them; edit the annotations YAML instead.
- The annotations YAML carries: layer (core/ui/domain/tooling/app), summary, overlap verdicts, floating verdicts, upgrade notes.
- **External deps (npm/SDK/CLI):** `pnpm run stack-map:deps` regenerates `docs/stack-map/landscape/dependency-catalog.md` from `dependency-annotations.yaml`. Sacred pins live there — never bump them without user approval.

---

## Reference Docs

- `apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md` — build commands, git workflow, troubleshooting
- `apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md` — gradle state, plugin table, decision log
- `apps/gurudevi-mobile/app.json` — single source of truth for native config
- `apps/gurudevi-mobile/plugins/` — custom config plugins

---

## Branded Components Usage Guide

The `@repo/ui` package now includes branded components that replace generic system defaults with brand-consistent UI elements. These components use the same motion tokens, colors, and brand geometry throughout the app.

### Motion System

Import motion tokens from `@repo/ui`:
```typescript
import { duration, easing, scale, color } from '@repo/ui';
```

- `duration`: Predefined animation durations (micro, transition, breathe, meaningful, ceremony)
- `easing`: Easing functions (standard, decelerate, accelerate)
- `scale`: Scale tokens (enter, rest, breatheMin, breatheMax)
- `color`: Brand and neutral color palettes

### New Branded Components

#### BrandPulse
Replaces `ActivityIndicator` / `Spinner` for all loading states. Uses the brand mark with a breathing animation.

```typescript
import { BrandPulse } from '@repo/ui';

// Default size
<BrandPulse />

// Custom size and color
<BrandPulse size={28} tintColor="#D4843A" />
```

#### ErrorState
For error/offline states. Uses the brand mark in muted amber (caution color), static (no breathing - the absence of the loop signals "paused").

```typescript
import { BrandedErrorState } from '@repo/ui';

<BrandedErrorState
  title="Connection lost"
  message="Please check your internet connection and try again"
>
  <Button onPress={retry}>Try again</Button>
</BrandedErrorState>
```

#### Success Components
Two tiers of success feedback - use deliberately:

- `SuccessCheck`: For trivial actions (field saved, item checked). Fast, generic checkmark.
- `SuccessGlow`: For meaningful milestones (first connection, session booked). Branded heart with motes.

```typescript
import { SuccessCheck, SuccessGlow } from '@repo/ui';

// Trivial success
<SuccessCheck size={22} />

// Meaningful success
<SuccessGlow size={64} />
```

#### BrandedEmptyState
For empty states. Uses the brand mark as an outline (not filled), signifying "hasn't bloomed yet."

```typescript
import { BrandedEmptyState } from '@repo/ui';

<BrandedEmptyState
  title="No items yet"
  message="Create your first item to get started"
  subtle={false} // Set to true for subtle breathing animation
>
  <Button onPress={create}>Create item</Button>
</BrandedEmptyState>
```

#### Skeleton Components
For loading placeholders. Uses the same responsive grid system as real content.

```typescript
import { ShimmerBlock, BrandedSkeletonCard, BrandedSkeletonList } from '@repo/ui';

// Custom shimmer block
<ShimmerBlock width="70%" height={12} />

// Skeleton card (thumbnail + lines)
<BrandedSkeletonCard />

// Skeleton list with responsive grid
<BrandedSkeletonList count={6} />
```

### Layout Helpers

Import layout utilities from `@repo/ui`:
```typescript
import { useBreakpoint, useResponsiveGrid } from '@repo/ui';
```

- `useBreakpoint()`: Returns current breakpoint ('phone' | 'tablet' | 'desktop')
- `useResponsiveGrid()`: Returns grid configuration (columns, maxWidth) for responsive layouts

### Screen Transitions

For Expo Router screen transitions:

```typescript
import { softCrossfadeScale, sharedTransitionTiming } from '@repo/ui';

// Use in Stack.Screen options
<Stack.Screen name="example" options={softCrossfadeScale} />
```

### Backward Compatibility

- The original `EmptyState` component is preserved with its original API (including `icon` and `description` props)
- New branded components are exported with `Branded` prefix to avoid conflicts
- Use the branded versions for new development, original versions remain for existing code
