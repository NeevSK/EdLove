---
title: "@repo/ui"
status: "active"
created: 2026-03-25
updated: 2026-08-29
author: "Naveen"
scribe: "opencode"
tags: [packages, ui, design-system, nativewind]
---

# @repo/ui

`@repo/ui` is Gurudevi's source-owned, NativeWind-aware design system for Expo, React Native, and web. It owns the visual language and reusable interaction surfaces; product packages compose those surfaces into domain workflows.

## Architecture

The package is organized as a small ownership hierarchy:

1. **Tokens** — semantic colors, typography, spacing, geometry, motion, and responsive behavior.
2. **Primitives** — `Box`, `Text`, `Heading`, `VStack`, `HStack`, `Pressable`, `Input`, `Icon`, and related neutral building blocks.
3. **Compounds** — `Button`, `FormField`, `Tabs`, `Command`, `Combobox`, `Popover`, `Dialog`, `Sheet`, and other reusable interaction contracts.
4. **Brand components** — Gurudevi-specific feedback, loading, empty, success, and shell components.
5. **Product components** — cross-domain UI intentionally shared by multiple product packages.

Prefer `@repo/ui/primitives` for neutral building blocks and explicit `@repo/ui/components/*` paths for larger components. Components should accept `className` where styling is part of the public contract and derive colors and behavior from semantic tokens.

## Third-party UI policy

Third-party libraries may provide behavior references, accessibility patterns, or native capability adapters. They are not the package's styling authority. Wrap or re-implement them behind an `@repo/ui` façade when they become part of the product surface, so consumers receive consistent tokens, NativeWind styling, dark mode, platform behavior, and accessibility semantics.

The compatibility layer in `@repo/ui/gluestack` is retained for migration only. New consumers must use the source-owned primitives and compounds.

## Platform boundaries

Shared components should work across native and web where practical. Use `.native.tsx` and `.web.tsx` variants when platform behavior genuinely differs; keep the public contract aligned across variants. React Native imports are appropriate inside primitive implementations and platform adapters. Native capabilities such as storage, haptics, location, and sync belong behind the relevant `@repo/core` runtime boundary.

## Showcase and documentation

- [Source-owned NativeWind architecture](./docs/architecture/source-owned-nativewind-ui.md)
- [Implementation roadmap](./docs/architecture/source-owned-nativewind-ui-roadmap.md)
- [Semantic token guide](./docs/architecture/semantic-tokens.md)
- [Component inventory](./docs/architecture/component-inventory.yaml)
- [Documentation index](./docs/INDEX.md)
- Development showcase route: `/ui-showcase` in `apps/gurudevi-mobile` (development builds only)

## Verification

From the repository root:

```bash
node node_modules/typescript/bin/tsc --build packages/ui/tsconfig.json --noEmit --pretty false
pnpm --filter @repo/ui exec jest --runInBand --watchman=false
pnpm --filter @repo/ui run lint:biome
```

Keep tests focused on public interaction contracts—keyboard and pointer behavior, accessibility state, controlled open/close state, form validation, and platform parity. Do not weaken assertions to accommodate implementation details.
