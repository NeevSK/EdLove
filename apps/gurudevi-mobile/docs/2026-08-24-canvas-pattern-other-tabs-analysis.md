---
title: "Configurable Canvas Pattern — Applicability Analysis for Self, Library, Community Tabs"
status: "draft"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
tags: [workspace, canvas, self, library, community, architecture, cross-tab-patterns]
---

# Configurable Canvas Pattern — Applicability Analysis for Self, Library, Community Tabs

## Executive Summary

This document analyzes whether the **Workspace Canvas pattern** (user-customizable dashboard with drag-and-drop, zones, pin/hide, cross-device sync) should be applied to the **Self**, **Library**, and **Community** tabs. The verdict: **Self — yes (high value, moderate effort); Library — partial (sections as surfaces); Community — no (different paradigm).**

---

## Current Architecture Comparison

| Aspect | Workspace (Teacher/Student/Principal/Founder/Guardian/Admin) | Self | Library | Community |
|--------|---------------------------------------------------------------|------|---------|-----------|
| **Paradigm** | User-configurable dashboard canvas | Tabbed feature hub (BaseSelfView) | Netflix-style browse + sections | Mode-switched feed (feed/circles/messages/announcements) |
| **Customization** | Full: drag, pin, hide, zone-move, persist | Pin shortcuts only (long-press) | View mode (shelf/grid/list), category filter | Mode tabs, filter chips |
| **Persistence** | Supabase + local (MMKV/AsyncStorage) per `layout_target` | Local only (pin state in store) | Local only (view mode, category, sort) | Local only (mode, filter) |
| **Cross-device sync** | ✅ Yes (layout_target: shared/web/mobile) | ❌ No | ❌ No | ❌ No |
| **Drag-and-drop** | ✅ Native (Reanimated 4 + RNGH v3) | ❌ No (tap to switch) | ❌ No | ❌ No |
| **Zones** | 5 semantic zones (today/work/institution/outlook/private) | N/A | N/A | N/A |
| **Capability gating** | Per-surface `capabilityKey` + `can()` | Per-feature `can()` + domain rollout | Per-action `can()` + domain rollout | Per-mode `can()` + domain rollout |
| **Web support** | Canvas renderers (mobile/stack, tablet/grid, web/kanban) | Separate `.web.tsx` views | Separate `.web.tsx` screen | Single screen (responsive) |
| **Settings UI** | In-canvas pin/hide/zone-move + planned Settings surface | No settings screen | No settings screen | No settings screen |

---

## Tab-by-Tab Analysis

### 1. Self Tab — **HIGH VIABILITY** ✅

#### Current Structure
- **Entry**: `SelfScreen.tsx` → role-resolved view (`StudentSelfView`, `TeacherSelfView`, etc.)
- **Kernel**: `BaseSelfView.tsx` — renders feature carousel (horizontal on mobile, sidebar on landscape/tablet) + active feature content
- **Features**: 15-25 features per role, grouped into 4-5 **domains** (journey, pulse, personal, physical, working)
- **State**: `useDynamicSelfFeatures` sorts by activity/frequency; `useFeatureActivity` tracks pins
- **Persistence**: Pinned features in Zustand store (local only); no server sync
- **Web**: Separate `.web.tsx` views (e.g., `BaseSelfView.web.tsx`, `TeacherSelfView.web.tsx`)

#### Mapping to Canvas Pattern

| Canvas Concept | Self Equivalent | Gap |
|----------------|-----------------|-----|
| **Surface** | Feature (`SelfViewFeature`) | ✅ 1:1 |
| **Zone** | Domain (journey/pulse/personal/physical/working) | ✅ Semantic match |
| **Pin** | Shortcut pin (long-press) | ✅ Exists, but local only |
| **Hide** | Not exposed (all features visible in carousel) | ❌ Missing |
| **Reorder** | `useDynamicSelfFeatures` auto-sorts by activity | ❌ No manual reorder |
| **Zone move** | Not possible (features fixed to domain) | ❌ Missing |
| **Layout persistence** | Local Zustand only | ❌ No server sync |
| **Cross-device** | No | ❌ Missing |

#### Effort to Adopt Canvas

| Task | Effort | Notes |
|------|--------|-------|
| Define `SelfWorkspaceSurface` types per role | Low | Already have feature registry |
| Create `useSelfWorkspaceSurfaces` hooks per role | Medium | Map domains → zones, features → surfaces |
| Add `useWorkspaceLayoutSync` to `BaseSelfView` | Low | Drop-in replacement for local state |
| Migrate `BaseSelfView` → `ResponsiveWorkspaceCanvas` | Medium | Replace carousel with zone columns |
| Add web drag (`dnd-kit`) | Medium | Same as workspace Phase 3 |
| Add Settings surface | Low | Generic component, add to each role |
| Enable remote sync | Low | Pass `enableRemoteSync: true` |

**Estimated: 5-7 days** (leverages existing workspace infrastructure)

#### Value Proposition
- **User benefit**: Manually arrange wellness tools (pin "Fire Journal" to `today`, move "Sleep Tracker" to `outlook`), persist across phone/web
- **Product benefit**: Self becomes a true "personal sanctuary canvas" — aligns with brand promise
- **Technical benefit**: Unifies persistence layer; eliminates custom pin/sort logic in `useDynamicSelfFeatures`

---

### 2. Library Tab — **PARTIAL VIABILITY** ⚠️

#### Current Structure
- **Single screen**: `LibraryScreen.tsx` (1,400+ lines) with massive reducer state
- **Sections**: Browse / Collections / Contribute (tabbed)
- **View modes**: Shelf (default, masonry) / Grid / List
- **Shelves**: Pulse, Hero, Map Invitation, Curator Invitation, Continue Learning, Bookmarks, Categories, Collections, Dynamic shelves (by orientation), Trending, New Arrivals
- **State**: All local (reducer + hooks); no persistence across sessions
- **Web**: `LibraryScreen.web.tsx` (separate implementation)

#### Mapping to Canvas Pattern

| Canvas Concept | Library Equivalent | Assessment |
|----------------|-------------------|------------|
| **Surface** | Shelf/Section (Pulse, Hero, Bookmarks, Categories, Collections, each dynamic shelf) | ⚠️ Shelves are *data-driven*, not capability-gated |
| **Zone** | Could map: `today`=Pulse/Hero/Continue, `work`=Bookmarks/Categories, `institution`=Collections, `outlook`=Trending/New | Possible but forced |
| **Pin** | Pin a shelf to top? | Low value — shelves are dynamic |
| **Hide** | Hide shelves user doesn't want | ✅ High value (e.g., hide "Curator Invitation") |
| **Reorder** | Reorder shelf priority | ✅ High value (move "Bookmarks" above "Categories") |
| **Zone move** | Move shelf between semantic groups | ⚠️ Low value |
| **Layout persistence** | Remember view mode, category, sort, shelf order | ✅ High value |
| **Cross-device** | Sync browse preferences | ✅ High value |

#### Key Constraint: **Shelves are data-driven, not capability-gated**
- Workspace surfaces = capability-gated widgets (show/hide based on `can()`)
- Library shelves = derived from data (show if `items.length > 0`)
- **Canvas pattern assumes surfaces exist independently of data**

#### Viable Approach: **Hybrid**
1. **Keep data-driven shelves as-is** (Pulse, Hero, dynamic shelves by type)
2. **Extract "configurable sections" as surfaces**: Bookmarks, Categories, Collections, Continue Learning, Trending, New Arrivals
3. **Use canvas for the "configurable layer"** — user controls which sections appear and in what order
4. **Data-driven shelves render above/below canvas** as fixed context

#### Effort to Adopt Canvas (Hybrid)

| Task | Effort | Notes |
|------|--------|-------|
| Extract configurable sections as surfaces | Medium | ~6-8 surfaces |
| Create `useLibraryWorkspaceSurfaces` hook | Medium | Map sections → surfaces with `defaultZone` |
| Wrap shelf renderer with canvas for configurable layer | Medium | `ResponsiveWorkspaceCanvas` inside `LibraryScreen` |
| Persist view mode/category/sort in layout | Low | Extend layout schema |
| Web drag for configurable layer | Medium | `dnd-kit` on web |

**Estimated: 7-10 days** (more complex due to hybrid approach)

#### Value Proposition
- **User benefit**: Persist "I want Bookmarks first, then Categories, hide Trending" across devices
- **Product benefit**: Library becomes personalizable without breaking Netflix-style browse
- **Risk**: Over-engineering for marginal gain; users may not care about shelf order

---

### 3. Community Tab — **LOW VIABILITY** ❌

#### Current Structure
- **Single screen**: `CommunityScreen.tsx` with reducer for mode/filter state
- **Modes**: Feed / Circles / Messages / Announcements (mutually exclusive tabs)
- **Each mode** = completely different UI:
  - Feed: Infinite list of posts
  - Circles: GroupsScreen (nested)
  - Messages: DirectMessagesListScreen
  - Announcements: AnnouncementsScreen
- **State**: Mode + filter + modals (all local)
- **Web**: Same responsive screen (no `.web.tsx` variant)

#### Mapping to Canvas Pattern

| Canvas Concept | Community Equivalent | Assessment |
|----------------|---------------------|------------|
| **Surface** | Mode (Feed, Circles, Messages, Announcements) | ❌ Modes are mutually exclusive, not composable |
| **Zone** | No semantic zones | ❌ N/A |
| **Pin** | Pin a mode? | ❌ Already tabbed |
| **Hide** | Hide a mode? | ⚠️ Possible but low value |
| **Reorder** | Reorder mode tabs | ⚠️ Low value (4 items) |
| **Zone move** | N/A | ❌ |
| **Layout persistence** | Remember last mode + filter | ✅ Already in reducer (but local only) |
| **Cross-device** | Sync last mode | ✅ Nice to have |

#### Why Canvas Doesn't Fit
1. **Mutually exclusive modes** — Canvas assumes multiple surfaces visible simultaneously; Community shows ONE mode at a time
2. **No capability-gated widgets** — Modes are navigation destinations, not dashboard widgets
3. **Feed is infinite list** — Not a "surface" you pin/hide/reorder
4. **Different mental model** — Community = communication hub; Workspace = productivity dashboard

#### Better Approach for Community
- **Persist mode/filter to Supabase** (like workspace layout but simpler: `{mode, filter, updatedAt}`)
- **Add to `user_preferences` table** (already exists in PowerSync schema)
- **No drag, no zones, no canvas renderer needed**

**Estimated: 1-2 days** (simple preference persistence)

---

## Unified Infrastructure Assessment

### What Can Be Shared (If Adopted)

| Infrastructure | Self | Library (Hybrid) | Community |
|----------------|------|------------------|-----------|
| `useWorkspaceLayoutSync` hook | ✅ Direct use | ✅ Direct use | ✅ Simplified use |
| `ResponsiveWorkspaceCanvas` | ✅ Direct use | ⚠️ Partial (configurable layer only) | ❌ No |
| `CanvasZoneColumn` | ✅ Direct use | ⚠️ Partial | ❌ No |
| `CanvasSurfaceCard` | ✅ Direct use | ✅ For configurable sections | ❌ No |
| Supabase `user_workspace_layouts` table | ✅ New workspaceId: `self`, `library` | ✅ New workspaceId | ❌ Use `user_preferences` |
| GrowthBook flags | ✅ `self-canvas-drag`, `self-cross-zone` | ✅ `library-canvas-sections` | ❌ N/A |

### Schema Extension Needed

```sql
-- For Self and Library (hybrid), add new workspace_ids
-- No schema change needed — workspace_id is TEXT
-- Just insert rows with workspace_id = 'self' or 'library'

-- For Community, use existing user_preferences table (PowerSync schema):
-- user_preferences.favorite_features, hidden_features already exist
-- Add: last_community_mode, last_community_filter
```

---

## Effort vs. Value Matrix

| Tab | Effort (Days) | User Value | Strategic Alignment | Recommendation |
|-----|---------------|------------|---------------------|----------------|
| **Self** | 5-7 | **High** — personal sanctuary customization | **High** — core "Self" brand promise | **DO IT** |
| **Library** | 7-10 | Medium — shelf order persistence | Medium — browse-focused | **HYBRID** (configurable sections only) |
| **Community** | 1-2 (prefs only) | Low — mode memory only | Low — different paradigm | **SKIP CANVAS**, just persist prefs |

---

## Implementation Sequence (If Approved)

### Phase A: Self Canvas (Week 1-2)
1. Define `SelfWorkspaceSurfaceId` per role (map domains → zones)
2. Create `useSelfWorkspaceSurfaces` hooks (6 roles)
3. Integrate `useWorkspaceLayoutSync` into `BaseSelfView`
4. Replace feature carousel with `ResponsiveWorkspaceCanvas`
5. Add web drag (`dnd-kit`) + migrate `.web.tsx` views
6. Add Settings surface to each role
7. Enable remote sync + GrowthBook flags

### Phase B: Library Hybrid Canvas (Week 2-3)
1. Extract configurable sections as surfaces
2. Create `useLibraryWorkspaceSurfaces` hook
3. Embed `ResponsiveWorkspaceCanvas` for configurable layer in `LibraryScreen`
4. Persist view mode/category/sort in layout
5. Add web drag for configurable layer

### Phase C: Community Prefs (Week 1, parallel)
1. Add `last_community_mode`, `last_community_filter` to `user_preferences`
2. Persist on mode/filter change
3. Hydrate on screen mount

---

## Risks & Mitigations

| Risk | Tab | Mitigation |
|------|-----|------------|
| Canvas overcomplicates Self (wellness ≠ productivity) | Self | Keep zones semantic (`today`=daily practice, `outlook`=weekly review); don't force workspace metaphors |
| Library hybrid creates two rendering systems | Library | Clear boundary: data-driven shelves (fixed) + configurable sections (canvas) |
| Web bundle size (`dnd-kit` ~15KB) | All | Code-split: only load drag bundle on web when canvas mounts |
| Feature flag fragmentation | All | Use GrowthBook namespace: `canvas.self`, `canvas.library` |
| Migration breaks existing pinned features | Self | Migrate Zustand pins → canvas layout on first load |

---

## Decision Framework

**Approve Self Canvas if:**
- Personalization is a top-3 Self priority for 2026
- Team has capacity for 5-7 days of focused work
- GrowthBook rollout infrastructure ready

**Approve Library Hybrid if:**
- User research shows shelf reorder/hide is requested
- "Continue Learning" and "Bookmarks" are high-engagement sections
- Can accept 7-10 days for hybrid complexity

**Defer Community Canvas:**
- Paradigm mismatch is fundamental
- Simple preference persistence delivers 80% value at 10% effort

---

## Appendix: Self Role Surface Mapping (Draft)

### Student Self → Canvas Surfaces
| Domain (Zone) | Features (Surfaces) | Default Order |
|---------------|---------------------|---------------|
| `journey` → `today` | Journal, Mood, Pulse | 10, 20, 30 |
| `pulse` → `today` | Daily Pulse, Mood Lotus, Wisdom Seeds | 40, 50, 60 |
| `personal` → `private` | Fire Journal, Voice Journal, Mood Checkin, Joy Jar, Gratitude | 10, 20, 30, 40, 50 |
| `physical` → `outlook` | Energy Forecast, Wind Down, Sleep Tracker | 10, 20, 30 |
| `working` → `work` | Daily Rhythm, Tomorrow Prep, Reminders, Decisions, Teaching History | 10, 20, 30, 40, 50 |

### Teacher Self → Canvas Surfaces
(Same domains, different features per role)

---

## Related Documents

- `apps/gurudevi-mobile/docs/2026-08-24-workspace-drag-drop-implementation-plan.md` — Workspace canvas implementation plan
- `packages/core/src/logic/workspace/canvas.ts` — Core layout logic
- `packages/core/src/native/useWorkspaceLayoutSync.ts` — State management hook
- `packages/self/src/components/BaseSelfView.tsx` — Self kernel
- `packages/library/src/screens/LibraryScreen.tsx` — Library screen
- `packages/community/src/screens/CommunityScreen.tsx` — Community screen