# Gurudevi — Architecture Constitution
### Where Everything Lives and Why
*For AI agents: read before creating any file*

---

## 0. The Single Most Important Rule

**Before creating any file — search for it first.**

```bash
find . -name "YourFileName*" | grep -v node_modules
```

If it exists somewhere — work with what exists. Do not create a duplicate.
If it doesn't exist — create it in the right location according to this document.

---

## 1. The Golden Question

For every file you are about to create, ask:

**"Will more than one app in this monorepo ever use this?"**

```
Yes, multiple apps will use it  →  goes in packages/
No, only gurudevi-mobile needs it  →  stays in apps/gurudevi-mobile/src/
Uses React Native primitives (won't work on web)  →  stays in apps/gurudevi-mobile/src/
Uses Skia specifically  →  goes in packages/ui/src/components-native/
Is a screen  →  always in apps/gurudevi-mobile/src/screens/
Is navigation  →  always in apps/gurudevi-mobile/src/navigation/
```

---

## 2. Monorepo Structure

```
gurudevi-monorepo/
│
├── apps/
│   ├── gurudevi-mobile/          ← The main app — thin shell and consumer
│   │   └── src/
│   │       ├── screens/          ← ALL screens — never in packages
│   │       │   ├── self/
│   │       │   ├── classroom/
│   │       │   ├── community/
│   │       │   ├── library/
│   │       │   └── profile/
│   │       ├── navigation/       ← ALL navigation — never in packages
│   │       │   ├── RootNavigator.tsx
│   │       │   ├── TabNavigator.tsx
│   │       │   └── [space]Navigator.tsx
│   │       ├── components/
│   │       │   └── skia/         ← Optional app-level wrappers; canonical Skia is in packages/ui/src/components-native/
│   │       │       ├── index.ts
│   │       │       ├── NoiseOverlay.tsx
│   │       │       ├── LivingCard.tsx
│   │       │       ├── TemporalGlass.tsx
│   │       │       └── shaders/
│   │       └── lib/              ← Mobile-specific utilities
│   │
│   ├── gurudevi-web/             ← App landing/marketing website
│   ├── neevsk-web/               ← Personal website
│   └── foundation-web/           ← Foundation website
│
├── packages/
│   ├── design-tokens/            ← SINGLE SOURCE OF TRUTH for all colors/tokens
│   │   └── src/
│   │       ├── colors.ts         ← Master palette
│   │       ├── phases.ts         ← Temporal phase tokens
│   │       ├── spacing.ts        ← Spacing scale
│   │       ├── typography.ts     ← Font scale and families
│   │       ├── shadows.ts        ← Shadow scale (always Shadow Violet)
│   │       ├── corners.ts        ← Border radius tokens
│   │       └── index.ts          ← Exports everything
│   │
│   ├── ui/                       ← Shared UI components
│   │   └── src/
│   │       ├── components/       ← Pure React Native — cross-platform safe
│   │       │   ├── SanctuaryCard.tsx
│   │       │   ├── GlassCard.tsx
│   │       │   ├── SanctuaryButton.tsx
│   │       │   ├── SanctuaryText.tsx
│   │       │   ├── SanctuaryInput.tsx
│   │       │   └── [other shared primitives]
│   │       ├── components-native/ ← React Native + Skia — mobile only
│   │       │   ├── index.ts
│   │       │   ├── NoiseOverlay.tsx
│   │       │   ├── LivingCard.tsx
│   │       │   ├── TemporalGlass.tsx
│   │       │   └── shaders/
│   │       ├── theme/
│   │       │   └── Theme.ts      ← Consumes from design-tokens, adds component-level tokens
│   │       └── hooks/
│   │           └── useTheme.ts   ← Theme hook with temporal phase logic
│   │
│   ├── self/                     ← Self space feature module
│   │   └── src/
│   │       ├── components/       ← Self-specific components
│   │       ├── hooks/            ← Self-specific hooks
│   │       └── utils/            ← Self-specific utilities
│   │
│   ├── classroom/                ← Classroom feature module
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── utils/
│   │
│   ├── community/                ← Community feature module
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── utils/
│   │
│   ├── library/                  ← Library feature module
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── utils/
│   │
│   ├── profile/                  ← Profile feature module (currently light)
│   │
│   ├── core/                     ← Shared utilities across all packages
│   │   └── src/
│   │       ├── api/              ← API clients
│   │       ├── storage/          ← Storage abstractions
│   │       ├── utils/            ← Date, string, math utilities
│   │       └── types/            ← Shared TypeScript types
│   │
│   ├── scanner-kit/              ← OCR, QR, ML — native, mobile only
│   │
│   ├── typescript-config/        ← Shared tsconfig bases
│   └── eslint-config/            ← Shared eslint rules
```

---

## 3. What Goes Where — Decision Table

| Type of file | Location |
|---|---|
| Screen component | `apps/gurudevi-mobile/src/screens/[space]/` |
| Navigation file | `apps/gurudevi-mobile/src/navigation/` |
| Skia component | `packages/ui/src/components-native/` |
| Pure RN shared component | `packages/ui/src/components/` |
| Mobile-only non-Skia component | `apps/gurudevi-mobile/src/components/` |
| Color tokens | `packages/design-tokens/src/colors.ts` |
| Phase tokens | `packages/design-tokens/src/phases.ts` |
| Feature component (Self/Classroom etc) | `packages/[space]/src/components/` |
| Feature hook | `packages/[space]/src/hooks/` |
| Shared utility | `packages/core/src/utils/` |
| Shared types | `packages/core/src/types/` |
| API logic | `packages/core/src/api/` |
| Web component | `apps/[web-app]/src/components/` |

---

## 4. Native Dependencies — The Critical Rule

Native modules (modules with iOS/Android native code) must follow this rule:

**In `packages/` — declare as `peerDependencies`**
**In `apps/gurudevi-mobile/` — declare as concrete `dependencies`**

This prevents version conflicts that cause build failures.

Currently known native deps in packages/core that must be peerDependencies:
- `@react-native-async-storage/async-storage`
- `expo-constants`
- `react-native-mmkv`

If you add a new native module to a package — always make it a peerDependency.

---

## 5. Import Rules

### From packages to packages
```typescript
// packages/self imports from packages/ui — OK
import { SanctuaryCard } from '@gurudevi/ui';

// packages/self imports from packages/design-tokens — OK
import { colors } from '@gurudevi/design-tokens';

// packages/self imports from packages/classroom — CAUTION
// Feature packages should not import from each other
// If they need to share something, it belongs in packages/core
```

### From app to packages
```typescript
// apps/gurudevi-mobile imports from packages — OK
import { SanctuaryCard } from '@gurudevi/ui';
import { NoiseOverlay } from '@gurudevi/ui/native'; // Canonical Skia import

// Skia imports must come from @gurudevi/ui/native only
// NEVER import screen components from packages — screens are always local
```

### Circular imports
Never. If A imports B and B imports A — something belongs in packages/core instead.

---

## 6. File Naming Conventions

```
Components:     PascalCase          SanctuaryCard.tsx
Hooks:          camelCase, use-     useTheme.ts
Utilities:      camelCase           formatDate.ts
Types:          PascalCase          UserProfile.ts
Constants:      SCREAMING_SNAKE     PHASE_COLORS.ts
Screens:        PascalCase + Screen PulseDashboardScreen.tsx
Navigators:     PascalCase + Nav    TabNavigator.tsx
Contexts:       PascalCase + Context ThemeContext.tsx
```

---

## 7. The Skia Boundary

Skia is powerful. Skia is also React Native only.

Currently packages/ui is consumed only by apps/gurudevi-mobile — no web apps import from it. So Skia lives in packages/ui but in a dedicated subfolder that makes the boundary explicit and future-safe.

```
packages/ui/src/
├── components/           ← Pure React Native — cross-platform safe
│   ├── SanctuaryCard.tsx
│   ├── SanctuaryButton.tsx
│   ├── SanctuaryText.tsx
│   └── ...
└── components-native/    ← React Native + Skia — mobile only
    ├── index.ts
    ├── NoiseOverlay.tsx
    ├── LivingCard.tsx
    ├── TemporalGlass.tsx
    └── shaders/
```

Two separate export entry points in packages/ui/package.json:

```json
{
  "exports": {
    ".": "./src/components/index.ts",
    "./native": "./src/components-native/index.ts"
  }
}
```

Mobile imports both:
```typescript
import { SanctuaryCard } from '@gurudevi/ui';
import { NoiseOverlay, LivingCard } from '@gurudevi/ui/native';
```

If a web version of Gurudevi ever arrives — it imports only from '@gurudevi/ui', never '@gurudevi/ui/native'. The boundary is already clean. No refactor needed.

```
✅ packages/ui/src/components-native/  ← Skia lives here
✅ packages/ui/src/components/         ← Pure RN lives here
❌ packages/self/src/components/       ← Never Skia here
❌ packages/classroom/src/components/  ← Never Skia here
❌ apps/gurudevi-web/                  ← Never Skia here
```

Never scatter Skia components across feature packages. All Skia stays in packages/ui/components-native — one home, one import path, one boundary to maintain.

---

## 8. The Token Hierarchy

```
packages/design-tokens/    ← RAW values
    colors.ts              #D4843A, #F5EDD6, etc.
    phases.ts              predawn, dawn, morning...

packages/ui/src/theme/
    Theme.ts               ← COMPONENT values — consumes design-tokens
                           cornerRadius, spacing, component-specific tokens

apps/gurudevi-mobile/src/
    (consumes via useTheme hook)
```

Never hardcode a hex value in a component. Always trace to a token.
Never duplicate token definitions across files. One source, many consumers.

---

## 9. Diagnostic Commands

Run these to understand the current state before making architectural changes:

```bash
# See all TypeScript files
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v dist | sort

# Check for duplicate file names
find . -not -path "*/node_modules/*" -not -path "*/dist/*" -name "*.tsx" | \
  xargs -I {} basename {} | sort | uniq -d

# TypeScript health check (run from apps/gurudevi-mobile)
npx tsc --noEmit

# Expo environment health
npx expo-doctor

# Find all imports from a specific package
grep -r "from '@gurudevi/ui'" apps/ packages/ --include="*.tsx" --include="*.ts"

# Find all shadow color definitions (should all be Shadow Violet after migration)
grep -r "shadowColor\|rgba(0,0,0" apps/ packages/ --include="*.tsx" --include="*.ts" -l
```

---

## 10. When AI Agents Go Wrong

The most common agent mistakes in this codebase:

**Creating files in wrong locations**
Agent creates a component in `apps/gurudevi-mobile/src/components/` that should be in `packages/ui/src/components/` or vice versa.
→ Prevention: Share this document at session start. Always ask "golden question" before creating.

**Duplicating existing components**
Agent creates `SanctuaryCard2.tsx` instead of finding and using `SanctuaryCard.tsx`.
→ Prevention: Always search before creating.

**Adding Skia to packages**
Agent puts `NoiseOverlay.tsx` in `packages/ui/` breaking web apps.
→ Prevention: Skia boundary rule is absolute.

**Hardcoding colors**
Agent writes `backgroundColor: '#D4843A'` instead of `backgroundColor: colors.saffron.full`.
→ Prevention: No hex values in components. Ever.

**Installing native deps in packages as regular deps**
Agent adds `react-native-mmkv` to `packages/core/dependencies` instead of `peerDependencies`.
→ Prevention: Native deps rule is absolute.

**Replacing working architecture**
Agent rewrites `SanctuaryCard` from scratch instead of evolving it.
→ Prevention: Explicitly told to evolve not replace. Always check what exists first.

---

*Document version 1.0 — February 2026*
*Gurudevi Architecture Constitution*
*The map that keeps every agent from creating chaos*
