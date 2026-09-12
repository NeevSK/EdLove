---
title: "Mobile Navigation Architecture: Active Sub-Tabs, Adaptive Chrome & Intentional Cadence"
status: "active"
created: 2026-09-12
updated: 2026-09-12
author: "Naveen"
scribe: "Antigravity"
tags: [navigation, architecture, adaptive-header, active-subtabs, anti-infinite-scroll]
---

# Mobile Navigation Architecture: Active Sub-Tabs, Adaptive Chrome & Intentional Cadence

This document serves as the living source of truth for mobile navigation architecture within Gurudevi Mobile (`apps/gurudevi-mobile`), defining how top headers, multitasking sub-tabs, role-aware feature catalogs, and anti-infinite scroll systems operate.

---

## 1. Philosophical & Ergonomic Foundations

Gurudevi is designed as an **educational sanctuary and calm professional workspace**. Desktop paradigms (such as browser-like "document tabs" and persistent clutter) or commercial dopamine loops (such as endless infinite scrolling) directly undermine attention and serenity.

The mobile navigation system is governed by three inviolable tenets:
1. **Active Tasks, Not Document Tabs**: The misleading desktop term "document tab" has been purged repo-wide. Mobile multitasking is modeled as **Active Sub-Tabs** (in-flight tasks within a domain).
2. **Adaptive Header Hierarchy**: Overview screens require high-level sanctuary context (`GlobalHeader`); deep in-flight sub-tasks require focused execution real-estate (`DomainSubHeader` with an immediate back-return reflex).
3. **Intentional & Finite Cadence**: Infinite scrolling is banned from feed surfaces in favor of bounded chapters and explicit mindful pause milestones.

---

## 2. Active Sub-Tabs & Store Mechanics

Mobile multitasking is managed by the sovereign, MMKV-persisted store [`useActiveSubTabsStore`](file:///c:/x/packages/core/src/store/useActiveSubTabsStore.ts).

### LRU Memory Budget Cap
To guarantee safe operation within low-memory devices (respecting the 2GB RAM budget per `AGENTS.md`), the store enforces a hard **LRU (Least Recently Used) cap of 5 tabs per domain**:
- Opening a 6th tab automatically evicts the oldest inactive tab.
- Re-opening an existing tab updates its `openedAt` timestamp and brings it to the active slot.

### Store State Contract
```typescript
export interface ActiveSubTabItem {
  id: string;
  title: string;
  route: string;
  params?: Record<string, string>;
  iconName?: string;
  domain: 'workspace' | 'self' | 'classroom' | 'library' | 'community' | 'profile';
  openedAt: number;
}

export interface NavigationPreferences {
  headerStyle: 'adaptive' | 'compact_domain' | 'classic_global' | 'minimal_tabs_only';
  catalogDefaultAction: 'open_in_subtab' | 'navigate_direct';
  showActiveSubTabs: boolean;
  autoHideChromeOnScroll: boolean;
  maxTabsPerDomain: number;
}
```

### Visual Multitasking Strip (`ActiveSubTabStrip`)
Mounted beneath the active domain header:
- **Active Pill**: Elevated background with an amber active-indicator dot.
- **Close Action**: Direct tap on `X` closes the tab and returns to the neighboring active tab or root overview.
- **Add Task (`+`)**: Directly opens the bottom catalog sheet for that domain.

---

## 3. Adaptive Header Architecture

Headers transition automatically based on route depth without stacking or redundant chrome:

```text
┌─────────────────────────────────────────────────────────┐
│ Root Domain Overview (e.g. /self, /workspace)           │
├─────────────────────────────────────────────────────────┤
│ [GlobalHeader]                                          │
│  - Perspective Pill (Institutional / Personal)          │
│  - Greeting & School Context                            │
│  - Notifications & App Settings                         │
│ [ActiveSubTabStrip] (only if background tasks exist)    │
└─────────────────────────────────────────────────────────┘
                           │
            (Tap task card / catalog item)
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Active Sub-Task (e.g. /self?feature=voice_journal)      │
├─────────────────────────────────────────────────────────┤
│ [DomainSubHeader]                                       │
│  - [<- Back Arrow] (returns to Root Domain Overview)    │
│  - Task / Feature Title                                 │
│  - Domain Badge & Actions                               │
│ [ActiveSubTabStrip] (current task highlighted)          │
└─────────────────────────────────────────────────────────┘
```

### User Configurable Modes
In `AppSettingsScreen` under **"Navigation & Active Sub-Tabs"**, users have total freedom:
- **Adaptive Smart (Recommended)**: GlobalHeader on overview, DomainSubHeader + Back button in sub-tasks.
- **Compact Domain Bar**: High-density domain header on all screens.
- **Full Global Header Always**: Classic grand header on every screen.
- **Active Sub-Tabs Only**: Content-first minimal mode with only tab strips.

---

## 4. Collapsible Chrome on Scroll

To provide an edge-to-edge reading experience, the interface supports direction-based chrome auto-hiding via [`useScrollChromeCollapser`](file:///c:/x/packages/ui/src/hooks/useScrollChromeCollapser.ts):

1. **Downwards Scroll ($> 15\text{px}$)**:
   - Header smoothly collapses out of view (`headerShown: false`).
   - Bottom Tab bar smoothly hides (`display: 'none'`).
2. **Upward Reflex ($< -10\text{px}$)**:
   - Header and bottom tabs immediately restore. Whenever a user wants to navigate, their human reflex is to flick slightly up.
3. **Top Boundary ($y \le 10\text{px}$)**:
   - Chrome remains permanently pinned at the top edge.
4. **User Preference**:
   - Governed by `autoHideChromeOnScroll` in `NavigationPreferences` and togglable via App Settings.

---

## 5. Canonical Role-Aware Registries & Query Serialization

Every domain exposes a typed registry in `src/navigation/registries/`:
- **Workspace**: Capacity-driven (`teacher`, `student`, `guardian`, `principal`, `founder`).
- **Self**: Canonicalized from `@repo/self/features/featureCatalog` (`FEATURE_CATALOG`).
  - Features are sorted dynamically by role affinity (`roleWeights[capacity]`).
  - Add a feature to `FEATURE_CATALOG` $\rightarrow$ automatically surfaces in the mobile registry, catalog sheet, and overview hub.

### Query Parameter Serialization
Instead of un-serialized modal state, every Self capability is addressed via clean URLs:
- Sanctuary Overview Hub: `/self`
- Voice Journal: `/self?feature=voice_journal`
- Mood Lotus: `/self?feature=mood_lotus`
- Decision Journal: `/self?feature=decision_journal`
- Daily Pulse: `/self?feature=daily_pulse`

---

## 6. Anti-Infinite Scroll & Mindful Cadence

Infinite scroll is banned from the community feed. In `CommunityScreen.tsx`:
- Un-gated auto-fetching via `onEndReached` is removed.
- Reaching the bottom of the current edition renders the **Mindful Pause Card**:
  - Displays a breathing prompt: *"You have reached the mindful pause. Take a mindful breath before continuing."*
  - Requires an intentional tap on **"Load Past Reflections"** to fetch older entries.
- Once all entries are viewed, renders the **"You are all caught up"** sanctuary completion seal.

---

## 7. Verification & Code Quality

All changes are strictly verified:
- `pnpm --filter @repo/core --filter @repo/ui --filter @repo/community --filter gurudevi-mobile check-types` must exit with **0 errors, 0 warnings**.
- `pnpm run check:anti-slop` must pass without un-reviewed defects.
