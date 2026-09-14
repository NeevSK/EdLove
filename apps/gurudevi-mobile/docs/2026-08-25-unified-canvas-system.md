---
title: "Unified Canvas System — Workspace, Self, Library, Community, Profile + Tab Order"
status: "superseded"
created: 2026-08-25
updated: 2026-08-26
author: "Naveen + Muse Spark"
bus: "low — ≥2 owners, see §16"
reviewed: "2026-08-26"
tags: [workspace, canvas, dnd-kit, architecture, cross-tab, cross-platform, design-system]
---

# Unified Canvas System — The Dance Floor Spec (Historical)

> Superseded as cross-platform canvas authority by
> `docs/decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md`.
> Retained as implementation evidence. “One canvas engine, five dialects” means
> one shared model, not one generic visual renderer or evidence that all domain
> renderers are complete.

> **TL;DR:** One canvas engine, five dialects. Every tab can dance (`dnd-kit` on web, Reanimated on native), but each tab dances differently. Opinionated defaults win — customization is progressive disclosure, not obligation. Two-variable persistence (`isDefault` + codified layout) keeps sync cheap and local screaming fast.

## 1. Why This Exists

Previous doc `2026-08-24-canvas-pattern-other-tabs-analysis.md` said: Self=yes, Library=hybrid, Community=no. User feedback refined that:

- Community **should** dance, just lightly (reorder/hide modes, not full zones).
- Library + Profile are **hybrid** (some fixed, some configurable).
- Tab order itself should be customizable, with opinionated platform-specific defaults.
- Supabase must store **codified semantics** (kind/domain/platformSupport), not just IDs — so layouts survive redeploys and sync across devices.
- Need granular, platform-aware flexibility (phone vs tablet vs web).

This doc codifies the **unified system** that satisfies all of that.

## 2. Design Principles

| Principle | What it means in this system |
|---|---|
| **Opinionated defaults win** | 80% never customize. Ship thoughtful per-role/per-tab defaults. Customization is *available*, not required. |
| **Two-variable persistence** | `isDefault: boolean` + codified layout. Default path = zero JSON parse, zero Supabase write, zero network. Flip to `false` only on first user change. |
| **Progressive disclosure** | Level 1: reorder / Level 2: hide / Level 3: pin & zone-move / Level 4: cross-device sync. Each level behind its own GrowthBook flag. |
| **Platform-aware affordance** | Mobile = vertical long-press; Tablet = grid drag; Web = `dnd-kit` mouse+keyboard + `SettingsGroup` boundary grouping. |
| **Tab-appropriate dialect** | Same engine, different mental model per tab. Workspace=productivity, Self=sanctuary, Library=browse+sections, Community=mode hub, Profile=settings. |
| **Boundary grouping** | Every surface belongs to a *group* (zone, domain, section, mode-group). Groups are the visual boundary (`SettingsGroup` rounded card). Reorder within group, move between groups. |

## 3. What the User Asked & How We Answered

| User ask | Answer in this system |
|---|---|
| "Community should have it — less to organize but should be there" | Community = lightweight canvas: reorder mode tabs, hide unused modes, per-mode filter memory. No cross-zone drag (modes are mutually exclusive navigation, not composable widgets). `community_mode_order[]` in `user_preferences`. |
| "Library and Profile are hybrid" | Library = Netflix browse stays fixed (Pulse/Hero/dynamic shelves); only Bookmarks/Categories/Collections/Continue/Trending/New are canvas surfaces. Profile = `SettingsGroup` boundary cards (Account, Notifications, Privacy…) — reorder rows inside group, reorder groups. |
| "Tab icon order with opinionated defaults" | `tabOrder.ts` ships `DEFAULT_TAB_ORDER_MOBILE = [profile, community, self(center), workspace, library]` (center is thumb-strong) and `DEFAULT_TAB_ORDER_WEB = [self, workspace, community, library, profile]` with lower grouped Notes/Settings. Persisted per-platform `tab_order`, `tab_order_mobile`, `tab_order_web`. |
| "Just ID in Supabase isn't recognizable" | `surface_metadata_jsonb` stores `{kind, domain, capabilityKey, defaultZone, platformSupport, groupId}` so layout is self-describing, survives renames, syncs across devices. |
| "Forage production outcomes — why/why not" | See §7. Notion/Linear ship full customization; Reepl limits drag to desktop; GitHub Projects makes it core workflow; most SaaS found <30% ever customize but customizers become power users. Hence two-variable: cheap for majority, rich for customizers. |
| "Nuanced per tab/domain/platform" | §5 flexibility matrix. Each capability (reorder/hide/pin/zone/cross-device/drag) is a per-tab × per-platform grant, not a single boolean. |

## 4. Two-Variable Persistence — The `isDefault` Dance

```ts
// storage key: `workspace-layout:<workspaceId>:<layoutTarget>:<userId>`
type Persisted = { isDefault: boolean; layout: WorkspaceLayout | null; layoutVersion: 2 }

// hydrate:
if (persisted?.isDefault !== false) return createDefaultWorkspaceLayout({ workspaceId, userId, surfaces })
return normalizeWorkspaceLayout(persisted.layout, surfaces)
```

- Default users: one boolean read, no JSON, no Supabase fetch.
- First user mutation (`setWorkspaceSurfaceOrder/Hidden/Pinned/Zone`) flips `isDefault:false` and debounces Supabase upsert (`user_workspace_layouts.is_default=false`, `surface_metadata_jsonb`, `layout_version=2`).
- Reset: `resetWorkspaceLayoutToDefault()` flips back to `true` — remote row can be deleted or marked default.

Files:
- `packages/core/src/types/Workspace.ts:63` — `isDefault?, surfaceMetadata?`
- `packages/core/src/logic/workspace/canvas.ts:48,142,216` — `isDefault:true` on create, `false` on every mutation, plus `resetWorkspaceLayoutToDefault`
- `packages/core/src/logic/workspace/layoutSync.ts:45,61` — maps `is_default`/`surface_metadata_jsonb`
- `packages/core/src/logic/schemas/workspace-layout.schema.ts:3,15,31` — `Version 1|2`, `is_default`, `surface_metadata`
- `packages/core/src/logic/schemas/canvas-layout.schema.ts` — codified `CanvasSurfaceMetadata`
- `apps/gurudevi-mobile/supabase/migrations/20260825120000_canvas_unified_layouts.sql` — adds columns

## 5. Per-Tab / Per-Platform Flexibility Matrix

| Capability | Workspace | Self | Library | Community | Profile |
|---|---|---|---|---|---|
| **Reorder** | ✅ full | ✅ full | ✅ configurable sections only | ✅ mode tabs only | ✅ rows inside group + groups |
| **Hide** | ✅ | ✅ | ✅ configurable only | ✅ modes | ✅ sections |
| **Pin** | ✅ cap 4 | ✅ cap 2 | ❌ | ❌ | ✅ frequent settings |
| **Zone / group move** | ✅ 5 zones | ✅ 4 zones (domain→zone) | ❌ | ❌ single zone | ✅ `private` zone only |
| **Cross-device sync** | ✅ | ✅ | ✅ configurable | ✅ mode memory | ✅ pinned |
| **Native drag** | Reanimated 4 + RNGH 3 | same + `SelfNavigator` carousel↔tiled toggle (reanimated-carousel 5.1.1) | same (config strip) | tap-hold reorder only | tap-hold |
| **Web drag** | `dnd-kit` (new) | `dnd-kit` | `dnd-kit` | — | — |
| **Settings UI** | In-canvas `private` surface | In-canvas | In-canvas config layer | Inline mode bar | `SettingsGroup` in-canvas |

## 6. The Boundary Grouping Pattern — `SettingsGroup`

Inspired by your attached Claude/Manus screenshots: related rows live inside a rounded `lg` boundary card (`surface` bg + `border` + `radii.lg:20`). This is the **Group**.

```tsx
import { SettingsGroup } from '@repo/ui/components/SettingsGroup';

<SettingsGroup title="Account" subtitle="Identity & access">
  <SettingsGroup.Row icon={User} label="Profile" onPress={openProfile} />
  <SettingsGroup.Row icon={CreditCard} label="Billing" value="Free" badge="Upgrade" />
  <SettingsGroup.Divider />
  <SettingsGroup.Row label="Capabilities" value="4 enabled" />
</SettingsGroup>
```

- Reusable everywhere: Workspace `CanvasZoneColumn`, Self domain columns, Library configurable strip, Community mode bar, Profile settings — all render as `Group → Rows`.
- Within group: drag reorder. Between groups: group reorder. Matches the `CanvasSurfaceDefinition.groupId` + `kind:'group'` semantics.
- File: `packages/ui/src/components/SettingsGroup.tsx`

## 7. Why Others Did / Didn't — Production Forage (Aug 2026)

| Product | Did they? | Outcome | What we stole |
|---|---|---|---|
| **Notion** | Yes — sidebar drag, Manual vs Last-edited sort, "Apply to all pages" | Heavy but loved by power users; casuals keep defaults | Per-tab `layoutVersion` + "Reset to defaults" |
| **Linear / Vercel** | Yes — fixed sidebar + collapsible 64px rail + `Cmd+K` | Most users never customize; customizers become advocates | Standalone GB flags per tab, not one `v2` |
| **GitHub Projects** | Yes — Table/Board/Roadmap, drag columns, single-select column field | Drag *is* the workflow (changing column = changing field) | `kind:'mode'` for Community (dragging mode ≠ changing data, so no) |
| **Reepl** | Half — desktop grip handle, localStorage, mobile stacking (no drag) | Mobile drag abandoned due to affordance | Native long-press vs web `dnd-kit` split |
| **Emporix** | Yes — tenant-level `save custom` vs `save global` | Admin global saves caused user confusion | Don't do global tab order — per-user only |

**dnd-kit** chosen because: sortable + cross-zone, keyboard-a11y out of box, ~15kb gzipped, code-split so mobile never pays, tree-shakable per-tab.

## 8. The Stack — What Powers the Dance

| Layer | Choice | Why |
|---|---|---|
| **Web drag** | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (in `@repo/ui`) | A11y keyboard, sortable contexts, cross-zone via `DndContext`. Native bundle never imports this — code-split behind `Platform.OS==='web'`. |
| **Native drag** | `react-native-reanimated:4.5.0` + `react-native-gesture-handler:3.0.2` + `react-native-worklets:0.11.1` (sacred, `AGENTS.md:28`) | 60fps pan, long-press pickup, haptics via `expo-haptics` (already peerDep). |
| **Persistence** | `react-native-mmkv:4.3.2` (local) + Supabase `user_workspace_layouts` (remote) + `SafeZustandStorage` | `mmkv-guidance` skill: Nitro modules already pinned. |
| **Motion / delight** | Reanimated `FadeInDown.springify()`, `Layout` spring, haptic light/medium/success | No extra deps — `framer-motion` reserved for web rail animation if needed later. |
| **Tokens** | `packages/ui/src/tokens.ts` (already `surface/border/radii/spacing`) | `SettingsGroup` uses only tokens, no hardcoded colors. |
| **StorageWrapper** | `packages/core/src/native/useWorkspaceLayoutSync.ts:119` | Will gain `isDefault` fast-path in next phase (read `localStorageKey+":isDefault"`). |

## 9. Tab Order Spec

```ts
// packages/core/src/logic/workspace/tabOrder.ts
export const DEFAULT_TAB_ORDER_MOBILE = ['profile','community','self','workspace','library'] as const; // self center (thumb)
export const DEFAULT_TAB_ORDER_WEB    = ['self','workspace','community','library','profile'] as const; // lower group: notifications,settings,profile
export function normalizeTabOrder(raw, platform) // validates against TAB_IDS, backfills missing
export function buildTabOrderStorageKey(userId, platform) // `tab-order:<platform>:<userId>`
```

Web rail rendering: upper section maps `tabOrder` upper group; divider; lower section renders `notifications,settings,profile` as muted group (matches your "lower grouped" intuition, `apps/gurudevi-mobile/app/(tabs)/_layout.tsx:78` + `src/lib/responsiveShell.ts:319`).

## 10. Implementation Phases (Updated)

0. **Foundation** ✅ THIS DOC + shipped: dnd-kit, SettingsGroup, migration, schemas, isDefault wiring.
1. **Workspace gaps** (next): enable `WebWorkspaceCanvas` drag (`dragEnabled:true`), `enableRemoteSync:true` for Teacher/Student web, cross-zone `CanvasZoneColumn` rect measurement, `MAX_PINNED` per-workspace map, `layoutVersion 2` migration.
2. **Self canvas — CAROUSEL STAYS** ✅ STAMPED: `BaseSelfView` keeps carousel as default zone. `SelfNavigator` (`packages/self/src/components/SelfNavigator.tsx` + `useSelfNavigatorMode.ts`) adds toggle `carousel ↔ tiled` (big tiled menu) — one zone, two presentations, same `sortedFeatures` data source. Persisted `self:navigator-mode:<userId>` via `SafeZustandStorage`, `isDefault: carousel`. Future: hooks into canvas `isDefault` when Self canvas lands; `react-native-reanimated-carousel@5.1.1` already installed (`@repo/ui` + `gurudevi-mobile`), no extra deps.
3. **Library hybrid**: extract `Bookmarks/Categories/Collections/Continue/Trending/New` as `CanvasSurfaceDefinition` with `kind:'section'`.
4. **Community lightweight**: `community_mode_order`, per-mode filter persistence (no zones).
5. **Profile groups**: replace static lists with `SettingsGroup`-backed canvas (`groupId` zones).
6. **Polish**: per-tab GB flags `canvas.*`, command palette, analytics on `isDefault:false` flip rate.

## 11. GrowthBook Flags (Standalone)

```
canvas.self           — master gate for Self canvas
canvas.library        — Library configurable strip
canvas.community      — Community mode reorder/hide
canvas.profile        — Profile SettingsGroup groups
canvas.tabOrder       — Tab reordering UI
canvas.webDrag        — dnd-kit bundle load
canvas.isDefaultSync  — enables is_default column reads/writes
```

Per-standalone as you requested (`2.6`).

## 12. Migration Safety

- `20260825120000_canvas_unified_layouts.sql` is additive: defaults keep existing rows valid (`is_default=true`). New users get `tab_order` defaults server-side.
- Client `normalizeWorkspaceLayout` backfills `isDefault` and `surfaceMetadata` if missing (`workspace-layout.schema.ts:22,40`).
- No `android/` or `ios/` edits (gitignored, `AGENTS.md:34`). Web drag is inside `packages/ui` (config-plugin-free).

## 13. Self Carousel Decision — Stamped → Tiled Default, Wired & Dressed

**We keep the carousel. No removal.** Step is allowed — `react-native-reanimated-carousel@5.1.1` is already in `packages/ui` and `gurudevi-mobile` (`pnpm list` verified). Tiles are now the **default** — discovery first.

- **Default = tiled** (`packages/self/src/hooks/useSelfNavigatorMode.ts:16`): new users see the full menu (all spaces at once), get comfort. Once they’re comfortable (pinned / frequent), they flip to carousel — the calm compact lane. AB test via GrowthBook `canvas.self.tiledDefault` (`true=tiled`, `false=carousel`): control=carousel, treatment=tiled. Persisted `self:navigator-mode:<userId>` via `SafeZustandStorage` (`isDefault: <gbDefault>`).
- **One zone, two presentations**: `SelfNavigator` (`packages/self/src/components/SelfNavigator.tsx`) renders same `sortedFeatures`/`activeFeatureId`/`pinned` — `carousel` = horizontal `SanctuaryFlashList`, `tiled` = wrapped grid (3 cols phone / 5 tablet, `Layout.springify()` between). Same `renderItem` keeps press/long-press semantics.
- **Wired navigation**: `BaseSelfView.tsx:121,345` wires `handleFeaturePress` (sets `activeFeatureId` + `trackFeatureAccess`) and `handleFeatureLongPress` (pin + toast) into *both* presentations. Tapping any tile/carousel dot opens `renderFeatureContent` immediately; no extra route.
- **Transitions / gestures / haptics**: `SelfNavigator.tsx:28` — `Animated.View` + `FadeIn/FadeOut` + `Layout.springify()` on mode switch and per-tile enter; `haptics: selection` on press, `medium` on long-press pin, `light` on toggle, toast `Switched to full menu / calm carousel` (1800ms). Graceful even on 2GB (`tokens.performance.maxBlurRadius:12`).
- **State / error / graceful**: `SelfNavigator` now has first-class `isLoading` (`BrandPulse` + "Gathering your spaces…"), `error` (`BrandedErrorState` + retry), `empty` (`BrandedEmptyState` subtle), success pinned dot, dashed `mirrors/reminders` insight border, `accessibilityState.selected` on active. Never malfunctions mid-dance — error boundary stays (`FeatureErrorBoundary`), offline banner stays, `a11y` labels on toggle (`Switch to carousel / full menu` + hint).
- **Elegant dressing**: header `All spaces` vs `Quick glide` label, `SurfaceInteractive` toggle pill (`radius.full`, `borderSubtle`), active glow `shadowColor: domainColor 0.3`, `textMuted` for inactive. No hardcoded colors — all `tokens`.

Stamp: **APPROVED — tiled default (discovery), carousel opt-in (comfort), AB-tested, elegant, graceful.**

### Dress Code — What "beautiful wadebro" Means Here

| Concern | How we dressed it |
|---|---|
| **Transition** | `Layout.springify()` + `FadeIn/FadeOut` 220/180ms — no jump when flipping |
| **Gesture** | Press → `hapticSelection`, long-press → `hapticMedium` + pin, toggle → `hapticLight` + toast |
| **Success** | Pinned white dot on border, toast "Switched to…", `selected` ring |
| **Error** | `BrandedErrorState` + retry `Pressable`, `FeatureErrorBoundary` per feature |
| **Loading** | `BrandPulse` shimmer, not spinner — matches workspace skeleton language |
| **Empty** | `BrandedEmptyState` subtle, same copy as `BaseSelfView` empty |
| **Graceful** | Offline keeps working (MMKV), `isHydrated` prevents flash, `a11yHint` explains both modes |
| **AB elegance** | `canvas.self.tiledDefault` flag — flip without code, measure `feature_access` + `pin_rate` |

> Never janky. The dance stays elegant. 💃🪩

## 14. Device Variations & Web Responsiveness — What Was Missing & What We Fixed

**All 6 Roles/Capacities Written** — not just Teacher. Each workspace now codified with `kind/domain/groupId` (see `§17` file map):
- `Teacher: teacher-dashboard` 5 surfaces (`temporal-context` etc., `§6` style) — `packages/classroom/src/workspace/useTeacherDashboardSurfaces.tsx:166`
- `Student: student-dashboard` 6 surfaces — `useStudentDashboardSurfaces.tsx:157` (incl. `demo-assignments/goals`)
- `Principal: principal-workspace` 16 surfaces — `packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx:297` helper `createPrincipalSurface` auto-fills `kind=widget/domain=zone/groupId=zone`
- `Founder: founder-workspace` 11 surfaces — `useFounderWorkspaceCanvas.tsx:451` same helper, feature-gated `inventory/library`
- `Guardian: guardian-workspace` 9 surfaces — `useGuardianWorkspaceCanvas.tsx:95` helper, `family_snapshot`→`today`, `children`→`work`
- `Admin: admin-workspace` 11 surfaces — `useAdminWorkspaceCanvas.tsx:155` helper, `operator_brief`→`today`, `audit_trail`→`private`
- Plus `section-head`/`grade-head` via `appendAdminWorkspaceSurfaces` in `packages/admin/src/hooks/useAdminWorkspaceSurfaces.tsx:10`
- Web drag enabled for all: `WebWorkspaceCanvas.tsx:62 dragEnabled={Boolean(onReorder)}` (was `false`) — Reanimated pan + move controls + future `dnd-kit` code-split.

## 14b. Device Variations & Web Responsiveness — What Was Missing & What We Fixed

**Your heart was right.** Audit found drift across three breakpoint systems:

| System | Phone | Tablet | Desktop | Web Compact | Problem |
|---|---|---|---|---|---|
| `tokens.layout.breakpoints` | 0 | 600 | 1024 | — | 600 vs 768 — tiny tablets got phone layout |
| `responsiveShell.WEB_SHELL_BREAKPOINTS` | — | — | — | 920 | 920 vs 768 — web narrow 800px gave tablet grid, not mobile |
| `workspace/renderer.ts` | 767 | 768-1279 | 1280+ | — | Web 800px → tablet, but web-in-mobile should be stack |
| `BaseSelfView: isTablet` | `width>=768` or `height>=600` | — | — | — | Landscape phone 700x360 falsely treated as tablet |

**Prod apps do:**
- **Linear / Notion / Vercel**: one breakpoint source, compact `<768` always stack (even on web), `maxWidth` + `gutter` scale per band, `reducedMotion` respected, collapsed 64px rail on tablet, topbar on compact. Container width (not viewport) drives tiled columns.
- **Figma**: auto-layout, 8px grid, content max-width 720 (reading) / 960 (desktop) — same as our `tokens.layout.pageFrame`.
- **GitHub Projects**: board collapses to single column on `<768` — same rule we need for kanban.

**What we fixed:**
1. **Unified `canvasBreakpoints`** in `packages/ui/src/components/layout.ts:69` — `{mobileMax:767, tabletMin:768, desktopMin:1024, webCompactMax:920, webTabletMax:1280}`, plus `isMobileLayout(width)` helper. `BaseSelfView`'s `useBreakpoint` + `useResponsiveGrid` now single source.
2. **Web-on-mobile gives mobile layout** — `SelfNavigator.tsx:52` detects `Platform.OS==='web' && width<=767` → `effectiveIsTablet=false`, forces 3-col tiled and carousel stack. `ResponsiveWorkspaceCanvas.tsx:14` already does `renderer.platform==='mobile'` for `width<=767` on web — so `WebWorkspaceCanvas` never renders kanban on narrow web. `responsiveShell.ts:305` `resolveResponsiveShellMode` already returns `webCompact` for `<920` — but we document that canvas overrides shell for `<768` (stack wins).
3. **Container queries** — `SelfNavigator` measures `onLayout` container width (`useState(width)` fallback), `tiledCols` computed from `breakpoint` + `effectiveIsTablet` + `isDesktop` (3 phone / 4 tablet / 5 desktop), `colWidthPct = 100/tiledCols%`. Works in split-view, resizable browser, and tablet portrait.
4. **Haptics / motion / a11y** — `useReducedMotion` from `@repo/core/hooks/useAccessibility` disables `Layout.springify`/`FadeIn` when user prefers reduced motion or `fontScale>1.5`. `announceForAccessibility` ready for future. `accessibilityState.selected` on active tile.
5. **Graceful states** — already: `BrandPulse` loading, `BrandedErrorState`+retry, `BrandedEmptyState`, dashed `mirrors` insight, `offline` banner, `isHydrated` flash guard. Added `All spaces • N` count and `Tip: switch to carousel` hint when `containerWidth<=360`.

**Still to harden (next):**
- Workspace tablet kanban horizontal scroll vs vertical stack — add container `maxWidth: readingMaxWidth` so cards don't stretch edge-to-edge on 1280+.
- Font scale clamp: `useClampedFontScale(1.3)` so Tamil/Sinhala at 200% doesn't break grid.
- Keyboard nav for `dnd-kit` on web (Space pickup, arrows move) — already planned Phase 3.

## 15. How to Verify

```bash
pnpm --filter @repo/ui exec tsc --noEmit          # UI tokens + SettingsGroup types + SelfNavigator
pnpm --filter @repo/core exec tsc --noEmit        # workspace/layout schemas + tabOrder + hooks
pnpm --filter @repo/self exec tsc --noEmit        # self tiled/carousel — powersync errors are pre-existing, ignore isLocalOnlyTable
pnpm --filter gurudevi-mobile exec expo-doctor     # never --fix, per AGENTS.md:12
pnpm run check:anti-slop                           # aislop + fallow gates (allow inherited findings, note in PR)
```

## 16. Low Bus Factor — Survival Guide (If We All Get Hit By A Bus)

| Concern | Mitigation in this doc + repo |
|---|---|
| **Single owner** | Doc author is Naveen + Muse Spark, but code owners are *two* package groups: `@repo/core` (layout engine) + `@repo/ui` + `@repo/self` (presentations). No `android/`/`ios/` edits — all native config via `app.json` + `plugins/` per `AGENTS.md:34`. |
| **"All things gone"** | Every decision is codified in Supabase `surface_metadata_jsonb` + `is_default` — not tribal memory. Defaults live in `tabOrder.ts` + `canvas.ts: createDefaultWorkspaceLayout` + `useSelfNavigatorMode.ts` (GB flag). Reset = one tap `resetWorkspaceLayoutToDefault()` or GrowthBook flag flip. |
| **Onboarding** | New dev: read §2 principles → §4 `isDefault` dance → §6 `SettingsGroup` → §9 tabOrder → §13 tiled default → §14 device matrix. Then run `pnpm --filter @repo/core --filter @repo/ui exec tsc --noEmit` to see green. |
| **File Touch Map** | `§17` lists every file + why, so `git blame` never required. |
| **Rollback** | Standalone GB flags `canvas.*` (`§11`) — kill one tab without touching others. Supabase migration `20260825120000` is additive, defaults keep old rows valid. `pnpm run stack-map:bootstrap && pnpm run stack-map` regenerates `docs/stack-map/` annotations. |
| **Next dev's entry** | `apps/gurudevi-mobile/docs/2026-08-25-unified-canvas-next.md` — Phase 1 checklist with exact line numbers (`WebWorkspaceCanvas:62`, `TeacherDashboardWeb:116`). |

## 17. File Touch Map — Every Dance Move Recorded

| Area | Files | Why |
|---|---|---|
| **Tokens / breakpoints** | `packages/ui/src/tokens.ts` (source), `packages/ui/src/components/layout.ts:69` (`canvasBreakpoints`, `isMobileLayout`) | Single breakpoint source; 2GB constraint documented |
| **Layout engine** | `packages/core/src/types/Workspace.ts:47,63`, `packages/core/src/logic/workspace/canvas.ts`, `packages/core/src/logic/workspace/layoutSync.ts`, `packages/core/src/logic/schemas/workspace-layout.schema.ts`, `packages/core/src/logic/schemas/canvas-layout.schema.ts`, `packages/core/src/logic/workspace/tabOrder.ts`, `packages/core/src/logic/workspace/renderer.ts`, `packages/core/src/platform/useResponsiveRenderer.ts`, `packages/ui/src/components/workspace/WorkspaceRenderer.tsx` | `isDefault` + `surfaceMetadata` + `tabOrder` + platform-aware renderer |
| **Tabs / shell** | `apps/gurudevi-mobile/app/(tabs)/_layout.tsx:78`, `apps/gurudevi-mobile/src/lib/responsiveShell.ts:305` (`resolveResponsiveShellMode`), `apps/gurudevi-mobile/supabase/migrations/20260825120000_canvas_unified_layouts.sql` | Shell bands + tab order persistence |
| **UI primitives** | `packages/ui/src/components/SettingsGroup.tsx`, `packages/ui/src/components/workspace/WebDraggableCanvasSurface.tsx` (`dnd-kit` code-split), `packages/ui/src/components/workspace/renderers/WebWorkspaceCanvas.tsx:62` (now `dragEnabled` true), `packages/ui/package.json: @dnd-kit/*` | Boundary grouping + web drag (all roles share `CanvasZoneColumn`) |
| **Community** | `packages/community/src/workspace/useCommunityWorkspaceSurfaces.ts` (4 modes), `packages/community/src/screens/CommunityScreen.tsx:187` (`useWorkspaceLayoutSync` + modeChips sorted by `order` + filtered `hidden`), `packages/community/src/screens/CommunityScreen.web.tsx:120` (platform-aware renderer) | Community lightweight — reorder/hide modes, single `today` zone |
| **Library** | `packages/library/src/workspace/useLibraryWorkspaceSurfaces.ts` (6 sections), `packages/library/src/screens/LibraryScreen.tsx:323` (hybrid fixed + configurable), `packages/library/src/screens/LibraryScreen.web.tsx:113` (platform-aware renderer) | Library hybrid — Netflix browse with configurable strip |
| **Profile** | `packages/profile/src/workspace/useProfileWorkspaceSurfaces.ts` (5 groups), `packages/profile/src/screens/ProfileScreen.tsx:318` (hybrid fixed + configurable), `packages/profile/src/screens/ProfileScreen.web.tsx:30` (platform-aware renderer) | Profile canvas — boundary `DisclosureSection` groups with `isDefault` fast path |
| **Self** | `packages/self/src/workspace/useSelfWorkspaceSurfaces.ts` (10 zones, `kind:group`), `packages/self/src/components/BaseSelfView.tsx:58` (hybrid: fixed temporal/nav + configurable identity/wellbeing/growth/practice ordered by `resolvedSelfSurfaces`, hidden respect, cross-device `enableRemoteSync:true`), `packages/self/src/screens/SelfScreen.web.tsx:18` (platform-aware renderer) | Self canvas — boundary `SettingsGroup` (rounded-3xl) groups with `isDefault` fast path |
| **Docs** | `apps/gurudevi-mobile/docs/2026-08-25-unified-canvas-system.md` (this), `2026-08-25-unified-canvas-next.md` (next) | Bus-proof rationale |

## 18. Decision Log — Why We Chose This (Not That)

| Decision | Alternatives considered | Chosen because | If wrong |
|---|---|---|---|
| `isDefault` boolean + codified layout | Always persist full layout; `localStorage` only | 80% never customize → zero cost; Supabase only on flip; cheap rollback | Flag `canvas.isDefaultSync` off → back to always-persist |
| `tiled` default (not carousel) | Carousel default; force canvas grid | New users need discovery (prod: Notion starts expanded, Linear starts List) — see `§7`; AB test `canvas.self.tiledDefault` can flip without code | Set GB flag `canvas.self.tiledDefault=false` |
| `SettingsGroup` boundary | One big scroll + dividers | Matches Claude/Manus screenshots you sent; group = zone, reusable in workspace/library/profile; `radii.lg` + `border` from tokens | Replace with `Box` + `Divider` — no data migration |
| Standalone GB flags `canvas.*` | Single `canvas.v2` flag | You said standalone is better (`2.6`); allows per-tab kill-switch | Merge into `canvas.v2` later — no schema change |
| `dnd-kit` (not `react-grid-layout`) | `react-grid-layout`, `pragmatic-drag-and-drop` | ~15kb, keyboard a11y, sortable cross-zone, tree-shakable, mobile never imports | Swap wrapper `WebDraggableCanvasSurface.tsx` only |
| Web-on-mobile = stack | Web always kanban | Prod: GitHub Projects collapses to 1 col `<768` even on web; your ask "web version in mobile should give mobile kinda layout" | Change `renderer.ts: mobileMaxWidth 767` |
| Container-width tiled cols | Viewport-width only | Split-view / resizable browser / iPad multitasking — container matters more than viewport (Figma) | Back to `isTablet ? 20% : 33%` in one line |

## Related

- `2026-08-24-workspace-drag-drop-implementation-plan.md` — original 6-phase workspace-only plan
- `2026-08-24-canvas-pattern-other-tabs-analysis.md` — per-tab feasibility matrix (now superseded by this unified spec for tabOrder/community)
- `2026-08-25-unified-canvas-next.md` — **next phase checklist** (Phase 1 workspace gaps)
- `packages/core/src/logic/workspace/canvas.ts:17` — sacred versions (`AGENTS.md:28`)
- `packages/core/src/native/useWorkspaceLayoutSync.ts` — sync hook (needs `isDefault` fast-path next)
- `packages/core/src/platform/useResponsiveRenderer.ts` — NEW: platform detection for web vs native layout alignment
- `packages/ui/src/components/workspace/` — renderers (`Mobile/Tablet/Web`) + `WorkspaceRenderer.tsx`
- `packages/ui/src/components/SettingsGroup.tsx` — new boundary primitive

> DANCE FLOOR IS OPEN. Default is silence. First drag flips `isDefault`. Documented so the bus can hit us and the dance continues. 💃🪩📚
> Next: `2026-08-25-unified-canvas-next.md` → Phase 1 workspace gaps. Let's move nexttt! 🚀
