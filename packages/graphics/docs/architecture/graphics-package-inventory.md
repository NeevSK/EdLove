---
title: "`@repo/graphics` Inventory"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, graphics]
---

# `@repo/graphics` Inventory

Last updated: 2026-04-22
Owner scope: `packages/graphics`
Purpose: single source of truth for what this package contains, what each file is for, and what must be healed during the Gluestack v3 / owner-owned primitive migration.

## Progress log

- 2026-04-22: created this inventory as package-local SSOT.
- 2026-04-22: healed `src/components/SanctuaryCanvas.tsx` to remove the deep import from `@repo/core/src/...` and use the public `@repo/core` surface.
- 2026-04-22: added `@repo/analytics` as an explicit dependency in `package.json`.
- 2026-04-22: performed a first-pass v3 heal on `src/charts/AnalyticsEngine.tsx` by replacing invalid stack props and moving interaction/search controls closer to `@repo/ui` primitives.
- 2026-04-22: after those fixes, the remaining `@repo/graphics` typecheck noise is primarily dominated by upstream `packages/ui` typing failures rather than the original package-local `SanctuaryCanvas` and stack-prop errors.

## Package status

- Package name: `@repo/graphics`
- Current role: mixed package containing pure layout/math utilities, Sri Lanka geospatial helpers, and several legacy rendering components
- Lint status: passing (`pnpm --filter @repo/graphics lint`)
- Typecheck status: failing with 150 errors (`pnpm --filter @repo/graphics check-types`)
- Primary migration reality:
  - Pure engine/data files are mostly healthy and not UI-migration blockers.
  - Rendering files in `src/charts/**` and `src/components/**` are the hotspot.
  - Several files still mix raw `react-native` primitives with `@repo/ui`.
  - Several files still depend on `Theme` and style objects instead of Tailwind-first `className` usage.
  - Some package boundaries are broken by deep imports and missing workspace dependencies.

## Migration doctrine for this package

- Follow [apps/gurudevi-mobile/docs/Core/ui-development-guide.md](/abs/path/placeholder) in spirit:
- Follow [ui-development-guide.md](C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\docs\Core\ui-development-guide.md) in spirit:
  - prefer `@repo/ui` primitives over raw `react-native` UI primitives in feature/render components
  - prefer `className` over ad hoc style-driven layout props
  - keep Fabric-safe text discipline
- Follow Gurudevi design governance:
  - implementation truth first
  - use package-level docs as alignment tooling, not fantasy architecture
- Treat `@repo/graphics` in two layers:
  - doctrine-safe core: algorithms, layouts, data helpers, parsing, capture helpers
  - migration hotspot: chart and map renderers, interactive visual shells

## Current error themes

Observed from `packages/graphics/reports/check-types.txt`:

1. Missing workspace dependency usage
- `src/charts/AnalyticsEngine.tsx` imports `marksToGPA` from `@repo/analytics`, but `@repo/analytics` is not currently resolved by the package typecheck.

2. Legacy prop usage against `@repo/ui` primitives
- Examples: `flex`, `alignItems`, and `justifyContent` passed directly to `VStack` / `HStack`.
- These should be expressed through supported props or `className`, per the current primitive contract.

3. Raw `react-native` rendering mixed with package primitives
- Multiple chart and map files import `View`, `Text`, `TextInput`, `ScrollView`, `TouchableOpacity`, `ActivityIndicator`, and `StyleSheet` directly from `react-native`.
- This conflicts with the zero-legacy direction for shared UI rendering surfaces.

4. Legacy theme coupling
- Several files import `Theme` from `@repo/ui` and hardcode style objects around it.
- These are strong candidates for conversion to semantic classes and owner-owned primitive usage.

5. Broken package boundaries
- `src/components/SanctuaryCanvas.tsx` deep-imports `@repo/core/src/permissions/guards/FeatureGuard`.
- That should be replaced with a stable public export or removed from this package if the guard belongs higher in the app stack.

## Inventory rules

- This inventory is exhaustive for tracked package-owned files that matter to development and migration.
- Generated/runtime artifacts are listed separately and should not be treated as source of truth.
- Healing order should prioritize files marked `High`.

## Directory inventory

### Root config and package files

| File | Role | Status | Notes |
| :--- | :--- | :--- | :--- |
| `package.json` | package manifest and scripts | Active | Declares package purpose, scripts, deps, peer deps. Description is narrower than current contents. |
| `README.md` | package contract | Active | Useful, but underspecified relative to actual charts/maps/UI surface area. |
| `tsconfig.json` | TS package config | Active | Includes only `src/**/*`; no package-local docs or tests. |
| `eslint.config.mjs` | lint config | Active | Lint passes currently. |

### Source root

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/index.ts` | public exports | Core | Medium | Export surface should stay aligned with what we actually support after migration. |
| `src/CaptureEngine.ts` | capture prep and SVG export helpers | Core | Low | Pure helper logic; not a v3 blocker. |
| `src/KnowledgeParser.ts` | Mermaid/graph parsing into topology | Core | Low | Pure parser logic; healthy for now. |
| `src/types-shim.d.ts` | local module shim | Support | Low | Overlaps with `src/types/vendor.d.ts`; can be consolidated later. |

### Algorithms

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/algorithms/CatchmentAnalysis.ts` | geospatial distance/catchment math | Core | Low | Pure logic, no UI coupling. |
| `src/algorithms/GeoThematicEngine.ts` | thematic color interpolation | Core | Low | Healthy structurally; later we may align palette naming to Gurudevi tokens. |
| `src/algorithms/perspective.ts` | perspective enablement logic | Core | Low | Pure topology logic; no UI migration issue. |

### Charts

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/charts/AnalyticsCharts.tsx` | simple bar/line/pie/progress chart renderers | Renderer | High | Uses raw `react-native` `View` plus style objects and `Theme`; candidate for primitive-first rewrite. |
| `src/charts/AnalyticsEngine.tsx` | analytics dashboard shell with filters and export | Renderer | High | Current worst offender: missing `@repo/analytics` resolution, raw RN imports, invalid `VStack`/`HStack` props, heavy style-object usage. |
| `src/charts/GiftedCharts.tsx` | typed re-exports for `react-native-gifted-charts` | Adapter | Low | Fine structurally; verify whether this remains the blessed adapter. |
| `src/charts/HeatmapChart.tsx` | grid heatmap renderer | Renderer | High | Raw RN imports plus `Theme` styles. |
| `src/charts/InteractiveChat.tsx` | chart-adjacent interactive chat surface | Renderer | High | Raw RN imports, style objects, alert-driven UX; likely needs strongest structural rethink. |
| `src/charts/RadarSpiderChart.tsx` | radar/spider chart renderer | Renderer | High | Raw RN imports plus `Theme` styles. |
| `src/charts/SankeyDiagram.tsx` | sankey visualization | Renderer | High | Raw RN imports plus `Theme` styles. |
| `src/charts/TimelineChart.tsx` | event timeline renderer | Renderer | High | Raw RN imports plus `Theme` styles. |

### Components

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/components/CollaborativeGrove.tsx` | tenant metrics visualization shell | Renderer | High | Uses raw RN primitives, `Theme`, and mock analytics placeholder data. |
| `src/components/ResonanceVisualizer.tsx` | resonance visualization shell | Renderer | Medium | Uses raw RN `View`; simpler than chart files, but still style-object based. |
| `src/components/SanctuaryCanvas.tsx` | platform-aware render surface | Infrastructure | High | Deep-imports `FeatureGuard` from `@repo/core/src/...`; boundary break must be healed early. |

### Map components

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/components/maps/CatchmentOverlay.tsx` | overlay circles and markers for maps | Adapter | Medium | No `@repo/ui` issue, but tied to `react-native-maps`; likely acceptable as infra adapter. |
| `src/components/maps/GeographicPerspective.tsx` | higher-level map composition | Renderer | High | Raw RN `View`/`Text` with style objects. |
| `src/components/maps/GeospatialStudio.tsx` | data-driven map studio shell | Renderer | High | Raw RN `Text` and `ActivityIndicator`; likely should move to `@repo/ui` primitives. |
| `src/components/maps/SriLankaMap.tsx` | SVG district map with haptics | Renderer | High | Raw RN `TouchableOpacity` and `View`; candidate for primitive-safe interaction rewrite around `Pressable` where possible. |

### Data

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/data/AdministrativeHierarchy.ts` | province/district/DS/GN lookup helpers | Core | Low | Good domain utility; comments still reference prior package history. |
| `src/data/PostalCodes.ts` | postal code inference helper | Core | Low | Uses `@ts-ignore`; later clean-up candidate. Not a v3 blocker. |

### Hooks

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/hooks/useGeoData.ts` | Supabase GIS data fetcher | Data hook | Medium | Contains hardcoded Supabase URL and placeholder anon key. Not a UI-v3 blocker, but architecture debt. |
| `src/hooks/useSriLankaLocation.ts` | location state and lookup orchestration | Data hook | Low | Mostly healthy; no direct UI primitive issue. |

### Layouts

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/layouts/forceLayout.ts` | D3 force layout | Core | Low | Healthy pure layout logic. |
| `src/layouts/geoLayout.ts` | geo projection to canvas coordinates | Core | Low | Healthy pure logic. |
| `src/layouts/pathLayout.ts` | sequential path layout | Core | Low | Healthy pure logic. |
| `src/layouts/radarLayout.ts` | radar chart coordinate generation | Core | Low | Healthy, though `node: any` should be refined later. |
| `src/layouts/treeLayout.ts` | hierarchy tree layout | Core | Low | Healthy pure logic. |

### Types

| File | Role | Category | Migration priority | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/types/PerspectiveRenderer.ts` | renderer contract types | Core | Low | Good shared type surface. |
| `src/types/vendor.d.ts` | local external module declarations | Support | Low | Overlaps partly with `types-shim.d.ts`. |

## Non-source artifacts inside package

These exist in the package tree but are not package source of truth:

| Path | Type | Keep? | Notes |
| :--- | :--- | :--- | :--- |
| `.turbo/` | build logs/cache | Ignore for inventory decisions | Contains audit logs only. |
| `node_modules/` | installed dependencies | Ignore | Not package-owned source. |
| `reports/check-types.txt` | generated audit output | Keep | Useful evidence for migration tracking. |
| `reports/check-types-utf8.txt` | generated audit output | Keep | Supplemental artifact. |
| `reports/lint.txt` | generated audit output | Keep | Confirms lint is green. |
| `tsconfig.tsbuildinfo` | TS incremental build artifact | Ignore | Generated. |

## Import-pattern audit

### Files currently importing raw `react-native` UI primitives

- `src/charts/AnalyticsCharts.tsx`
- `src/charts/AnalyticsEngine.tsx`
- `src/charts/HeatmapChart.tsx`
- `src/charts/InteractiveChat.tsx`
- `src/charts/RadarSpiderChart.tsx`
- `src/charts/SankeyDiagram.tsx`
- `src/charts/TimelineChart.tsx`
- `src/components/CollaborativeGrove.tsx`
- `src/components/ResonanceVisualizer.tsx`
- `src/components/SanctuaryCanvas.tsx`
- `src/components/maps/GeographicPerspective.tsx`
- `src/components/maps/GeospatialStudio.tsx`
- `src/components/maps/SriLankaMap.tsx`

### Files currently coupling to `Theme` from `@repo/ui`

- `src/charts/AnalyticsCharts.tsx`
- `src/charts/AnalyticsEngine.tsx`
- `src/charts/HeatmapChart.tsx`
- `src/charts/InteractiveChat.tsx`
- `src/charts/RadarSpiderChart.tsx`
- `src/charts/SankeyDiagram.tsx`
- `src/charts/TimelineChart.tsx`
- `src/components/CollaborativeGrove.tsx`

### Files with package-boundary concerns

- `src/charts/AnalyticsEngine.tsx`
  - imports `@repo/analytics`
  - currently failing type resolution in this package context
- `src/components/SanctuaryCanvas.tsx`
  - deep-imports `@repo/core/src/permissions/guards/FeatureGuard`
  - violates public-boundary expectations
- `src/hooks/useGeoData.ts`
  - embeds environment-sensitive Supabase connection details directly in package source

## Healing order

Use this sequence unless a consuming screen forces a different path:

1. `src/components/SanctuaryCanvas.tsx`
- Fix the boundary contract first.
- Decide whether this package should even own guard behavior, or only the render surface.

2. `src/charts/AnalyticsEngine.tsx`
- It currently produces the densest concentration of package-local type failures.
- Replace invalid stack props with primitive-safe `className` usage.
- Remove raw RN text/input/layout usage where `@repo/ui` already has primitives.
- Resolve the `@repo/analytics` dependency boundary.

3. Chart renderers
- `AnalyticsCharts.tsx`
- `HeatmapChart.tsx`
- `RadarSpiderChart.tsx`
- `SankeyDiagram.tsx`
- `TimelineChart.tsx`
- Convert to primitive-first shells and reduce `Theme` reliance.

4. Interaction-heavy renderers
- `InteractiveChat.tsx`
- `CollaborativeGrove.tsx`
- `GeographicPerspective.tsx`
- `GeospatialStudio.tsx`
- `SriLankaMap.tsx`

5. Cleanup pass
- consolidate local shims
- tighten `README.md`
- review public exports in `src/index.ts`
- reduce placeholder/mock logic where it obscures package truth

## Guardrails for future edits

- Do not add new raw `react-native` layout/text primitives to chart or shared rendering shells unless a platform adapter genuinely requires it.
- If a file is an adapter around a platform library such as `react-native-maps` or `react-native-svg`, keep the platform-specific parts narrow and isolate them.
- Prefer `@repo/ui` primitives for container, typography, scroll, and press interactions.
- Prefer semantic classes over `Theme`-driven style objects for new or healed UI surfaces.
- Do not deep-import from sibling package internals.
- If a component cannot satisfy the current owner-owned primitive contract cleanly, document that exception here before adding more debt.

## Next actionable checkpoint

The next healing target should be `src/components/SanctuaryCanvas.tsx`, followed immediately by `src/charts/AnalyticsEngine.tsx`.

That sequence gives us:

- one boundary fix
- one high-error renderer fix
- a reusable migration pattern for the rest of the package
