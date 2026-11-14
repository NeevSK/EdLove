---
title: "MapLibre React Native v11 Migration Assessment and Plan"
status: "active"
created: 2026-11-06
updated: 2026-11-06
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, maps, migration]
---

# MapLibre React Native v11 Migration Assessment and Plan

## Outcome

The repository is already pinned to `@maplibre/maplibre-react-native` `11.5.1` in `packages/library` and `packages/graphics`. The requested v10-to-v11 migration is therefore not a dependency upgrade. The earlier MapLibre marker branch in `packages/ui/src/components/maps/UnifiedMarker.tsx` used v11 names, but paired that annotation with a `react-native-maps` view, so it was not a functional MapLibre renderer and has been removed from the RN Maps wrapper.

No v10 `MapView`, `PointAnnotation`, `ShapeSource`, legacy layer component, old camera prop, or old MapLibre imperative method call was found in application source. The active Atlas and Terra map surfaces currently render through `react-native-maps`. `SchoolAtlasMapScreen` relies on `initialRegion`, `animateToRegion`, and `Marker`, so migrating that renderer to MapLibre would be a separate product implementation, not required to complete a v11 API migration.

## Scope found

| Area | Current evidence | v11 migration work |
|---|---|---|
| Dependency version | `11.5.1` in library and graphics manifests and lockfile | None |
| MapLibre map component | No MapLibre `Map`/old `MapView` call site found | None in current product surfaces |
| MapLibre annotation | The previous marker-only branch was selected independently from the rendered map engine | Removed from the RN Maps wrapper; full MapLibre rendering remains a separate feature |
| Native Atlas | `SchoolAtlasMapScreen.tsx` uses `react-native-maps`, region updates, `animateToRegion`, and markers | Separate renderer port; requires camera, marker-selection, interaction, style, and device parity work |
| Terra visualization | Uses the same `UnifiedMapView`/`UnifiedMarker` abstraction | Separate renderer port if MapLibre is selected for this surface |
| Offline maps, sources, layers, location and snapshots | No active MapLibre call sites found by source search | Not currently in migration scope |

The v11 guide covers a broad API redesign: `MapView`→`Map`; camera stop props and ref methods; interaction and inset prop changes; `ShapeSource`→`GeoJSONSource`; specialized layer components→`Layer`; annotation and event payload changes; location APIs; offline pack APIs; and static map APIs. Only APIs actually used by this repository need migration. See the [upstream v11 migration guide](https://github.com/maplibre/maplibre-react-native/blob/main/docs/content/setup/migrations/v11.md).

## Implementation plan

### Completed: v11 source audit and RN Maps wrapper repair

- Confirm the pinned package version and lockfile resolution.
- Search native and shared source for v10 MapLibre component, prop, and method names.
- Record that current production map screens use the `react-native-maps` adapter.
- Keep Atlas and Terra on the existing RN Maps renderer; do not present a marker-only MapLibre branch as a supported map engine.
- Bind markers to the RN Maps renderer without requiring absent `MapProvider` context.
- Use the installed RN Maps types in the shared native wrapper, make the initial viewport prop explicit, and animate Atlas between national and local scales.

### Deferred: MapLibre renderer adoption

Only proceed as a separately scoped feature when MapLibre is selected as the native renderer:

1. Define parity for Atlas and Terra: initial viewport, re-centering, map gestures, district/school selection, user location, styling, and failure/loading presentation.
2. Inspect the installed `11.5.1` package declarations and native implementation before designing the `Map`/`Camera` adapter. The checked-in pnpm package directory is currently empty, so local package declarations could not be verified during this audit.
3. Implement an additive native MapLibre adapter behind the existing map boundary. Preserve the current `react-native-maps` path until parity is established; do not silently replace the working path.
4. Migrate screen camera commands and annotation selection to v11 contracts, including `NativeSyntheticEvent.nativeEvent` payloads where required.
5. Verify Android rendering behavior (`GLSurfaceView` is the v11 default; `androidView="texture"` is the documented fallback), iOS behavior, web fallback, and network/style-load failure states on devices.
6. Remove an old map path only after explicit owner approval and evidence that consumers have moved.

## Verification record

- Read `docs/docs-sop.md` and followed its dated `current_progress` plan convention.
- Inspected package manifests, lockfile entries, map wrapper components, Atlas and Terra call sites, and source-wide MapLibre references.
- Reviewed upstream v11 migration sections relevant to the repository's annotation usage and broader renderer adoption.
- No source/API migration was justified by the current call sites. Runtime/native verification remains necessary only if the separate renderer adoption is approved and implemented.
