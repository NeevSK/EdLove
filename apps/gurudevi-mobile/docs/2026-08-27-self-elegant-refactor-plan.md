# Self Elegant Refactor — Plan (post-shallow audit)

status: draft
created: 2026-08-27
author: Naveen + Muse Spark
tags: [self, canvas, refactor, elegant, dnd, domain]
source: `2026-08-27-self-feature-system-audit-and-plan.md` + shallow critique `SelfCanvas.tsx:1`, `CanvasZoneColumn.tsx:1`, `SelfScreen.unified.tsx:1`

## 1. Goal

Replace shallow Self canvas scaffolding with elegant, testable, platform-correct architecture that satisfies intent:

- Feature registry is single source (already `featureCatalog.ts:1` 20 features)
- Roles: `teacher`, `student`, `guardian`, `principal`, `founder`, `admin` + **combined** (`teacher+guardian`, `parent+teacher`) via **roleWeights** 0-100, not single `resolveSelfViewRole`
- General + role features: `isGeneral` + `roleAffinity` (already `accessPolicy.ts:1`)
- User selects & prioritizes: multi-select picker + drag reorder + hide + pin + role emphasis
- Web == mobile: same `FeatureCatalog`/`Resolver`/`Store`/`SelfCanvas` logic, web uses `*.web.tsx` platform files, native uses gesture-handler
- No theater: `SelfFeatureRenderer` renders real components, not `null` content

Non-goals: change `SELF_REGISTRY` ownership, touch `android/`/`ios/`, bump sacred versions.

## 2. Principles (from AGENTS.md + audit)

- Types over `any`/`as never`/`@ts-ignore`; no `require` in render; no `Platform.OS` branching in one file — use `*.web.tsx` split
- Pure domain (no hooks) → Zustand store (persistence + sync) → UI (compound components) — vertical slice, not God component
- `isDefault` fast-path: 80% never customize → zero Supabase cost, flip on first user action
- GrowthBook flags: `canvas.self.unified`, `canvas.self.drag`, `canvas.self.roleWeights` — per-tab kill-switch

## 3. Target Architecture

```
featureCatalog (value object)
  ↓
AccessPolicy (composite: CapabilityPolicy + CitizenshipPolicy) → AccessibleFeature { roleAffinity, isGeneral }
  ↓
FeatureResolver (Strategy: RoleAffinityStrategy + TemporalPhaseStrategy) → ResolvedFeatureSet { all, selected, discoverable, byZone, byCategory }
  ↓
SelfCanvasStore (Zustand: preferences { layout { isDefault, hiddenIds, order }, features { selectedIds, customOrder, hiddenIds, roleWeights }, viewMode } + persist SafeZustandStorage + debounced supabase upsert user_preferences, LWW lastSyncedAt)
  ↓
SelfCanvasProvider (resolver + store, useMemo boundaries)
  ↓
SelfScreen (30 lines, orchestrator) → SelfCanvas (platform files) → Zone / SortableCard / CardActions / FeaturePicker / RoleWeightEditor / WorkspaceSettingsSurface
  ↓
SelfFeatureRenderer (componentId → lazy import, Suspense + BrandPulse)
```

## 4. File Map (exact)

| Layer | File (create/edit) | Why |
|---|---|---|
| Domain | `packages/self/src/features/featureCatalog.ts:1` (edit) | Make `FeatureCatalog` class: `private map`, `get(id)`, `all()`, `byCategory()`, immutable `Object.freeze`, no record literal export |
| Domain | `packages/self/src/features/accessPolicy.ts:1` (edit) | Split to `CapabilityPolicy`, `CitizenshipPolicy`, `AccessPolicyComposite` class with `isAllowed(feature, ctx)`; `resolveAccessibleFeatures` becomes `composite.filter(catalog.all())` |
| Domain | `packages/self/src/features/featureResolver.ts:1` (edit) | `ScoringStrategy` interface, `RoleAffinityStrategy` + `TemporalPhaseStrategy` + `CompositeScoringStrategy`; `FeatureResolver` class |
| State | `packages/self/src/features/selfCanvasStore.ts` (new) | `createSelfCanvasStore(userId)` Zustand, `persist` middleware wrapping `SafeZustandStorage` + `supabase.from('user_preferences').upsert({ key: 'self:canvas', value: { layout, features, viewMode } })` debounced 800ms, `isDefault` flips false on first `setHidden`/`setOrder`/`setRoleWeights`, `migrateSelfV1ToV2` pure |
| State | `packages/self/src/features/migrateSelfPreferences.ts:1` (edit) | Use `SafeZustandStorage.getItem` async + `storage.set('self:migrated:v2')` idempotence, pure fixture-tested |
| State | `packages/self/src/features/userPreferences.ts:1` (deprecate → shim) | Re-export from `selfCanvasStore` for backward compat, then delete next PR |
| UI web | `packages/self/src/components/SelfCanvas.tsx` (edit → native) | Keep native: `GestureHandler` + `Reanimated` Layout, `Pressable` up/down fallback, no `require` |
| UI web | `packages/self/src/components/SelfCanvas.web.tsx` (new) | Web: top `DndContext(closestCenter)` + single `SortableContext(items=features.map(f=>f.id))` `verticalListSortingStrategy`, `arrayMove` on global `features` array (true cross-zone), `WebDraggableCanvasSurface` per card, `DragOverlay` |
| UI | `packages/self/src/components/SelfFeatureRenderer.tsx:1` (edit) | Add `componentMap` completeness check, `aria-busy`, error boundary per card |
| UI | `packages/self/src/components/Zone.tsx` (new) | `Zone({ zoneId, features, pinnedIds, hiddenIds, onTogglePin, onToggleHidden })` → `SettingsGroup` + `SortableCard` list |
| UI | `packages/self/src/components/SortableCard.tsx` (new) | `SortableCard({ feature, isPinned, isHidden })` wraps `WebDraggableCanvasSurface` (web) or `DraggableCanvasSurface` (native) |
| UI | `packages/self/src/components/FeaturePicker.tsx:1` (edit) | `useDeferredValue(query)`, `Combobox` a11y, `selectedIds` ↔ `customOrder` consistent, `virtualized` if >20 |
| UI | `packages/self/src/components/RoleWeightEditor.tsx:1` (edit) | `Slider` 0-100 per role + presets, `onChange` → `store.setRoleWeights` (persist) |
| UI | `packages/ui/src/components/workspace/WorkspaceSettingsSurface.tsx:1` (edit) | Disclosure + `SegmentedControl` for zone, `DragHandle` preview, `Reset to defaults` → `store.reset()` + `resetWorkspaceLayoutToDefault()` |
| UI | `packages/ui/src/components/workspace/CanvasZoneColumn.tsx:1` (edit) | Keep measured `cardHeightsRef` + `onLayout` per card + `onMeasureZone` for `ResponsiveWorkspaceCanvas` cross-zone; add `ResizeObserver` for web path |
| Screen | `packages/self/src/screens/SelfScreen.tsx:1` (edit) | Reduce to orchestrator: `const { features, byZone } = useSelfCanvas()` → `<SelfCanvasProvider><SelfCanvas /></SelfCanvasProvider>`; delete God logic |
| Screen | `packages/self/src/screens/SelfScreen.unified.tsx:1` (delete) | Logic moves to `SelfCanvasProvider` + store; file removed after migration |
| Screen | `packages/self/src/screens/SelfScreen.web.tsx:1` (edit) | Thin: `WorkspaceRenderer` + `SelfScreen` (no duplicate `useResponsiveRenderer` logic) |
| Tests | `packages/self/src/features/__tests__/featureCatalog.test.ts` (new) | `FeatureCatalog` immutability, `byCategory` |
| Tests | `packages/self/src/features/__tests__/accessPolicy.test.ts` (new) | Table-driven all role×citizenship combos |
| Tests | `packages/self/src/features/__tests__/featureResolver.test.ts:1` (edit) | Add `fast-check` properties: `hiddenIds ⊆ accessible`, `customOrder` permutation, empty catalog |
| Tests | `packages/self/src/features/__tests__/selfCanvasStore.test.ts` (new) | `isDefault` flips, debounce, migration idempotence |
| Docs | `apps/gurudevi-mobile/docs/2026-08-27-self-feature-system-audit-and-plan.md:1` | Add elegant plan link |

## 5. Acceptance Criteria

- [ ] `pnpm --filter @repo/self exec tsc --noEmit --skipLibCheck` 0 errors, no `any`/`as never`/`@ts-ignore`
- [ ] `pnpm --filter @repo/self test` — catalog/policy/resolver/store 100% pure, `fast-check` passes 100 runs
- [ ] `Platform.OS` branching removed from `SelfCanvas.tsx` — `SelfCanvas.web.tsx` exists, Expo resolves correctly
- [ ] Web drag: drag `pulse` today → `private` works, `arrayMove` on global array, keyboard Space/Arrows, `DragOverlay` visible
- [ ] Native drag: long-press + haptics, up/down fallback, `measured` height (not 180)
- [ ] `FeaturePicker` search `deferred`, selecting `daily_pulse` adds to `selectedIds` + `customOrder` + `layout.order`, persists, refresh keeps order
- [ ] `RoleWeightEditor` slider 70/30 → `resolveFeatureSet` re-sorts discoverable, web + mobile same order
- [ ] `WorkspaceSettingsSurface` zone change moves feature zone, hide/show persists, reset clears `isDefault:true`
- [ ] Combined roles: `teacher+guardian` user sees union of features, `isGeneral` true for cross-role, `roleAffinity` max weight
- [ ] Migration: user with legacy `self_pinned_features_<uid>` → `selectedIds`/`customOrder` preserved, `migrated:v2` flag set, second run no-op
- [ ] Supabase: `user_preferences` upsert debounced, `lastSyncedAt` LWW, offline → local `SafeZustandStorage` fallback

## 6. Rollout

- Flags: `canvas.self.unified` (unified screen), `canvas.self.drag` (dnd), `canvas.self.roleWeights` (editor) — all default false, enable per-env
- Migration: `useEffect` in `SelfCanvasProvider` runs `migrateSelfV1ToV2` once
- Rollback: flip flag false → legacy `BaseSelfView` route; no data loss (`isDefault` additive)

## 7. Plan Approval

If approved, proceed in order: Domain (catalog/policy/resolver) → Store (+ migration) → UI platform split (SelfCanvas.web.tsx, Zone, SortableCard) → Pickers/Settings → Screen orchestrator → Tests + `tsc`.

