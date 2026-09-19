---
title: "Mobile Navigation Architecture: Active Sub-Tabs, Adaptive Chrome & Intentional Cadence"
status: "active"
created: 2026-09-12
updated: 2026-09-15
author: "Naveen"
scribe: "Antigravity"
tags: [navigation, architecture, adaptive-header, active-subtabs, anti-infinite-scroll]
---

# Mobile Navigation Architecture: Active Sub-Tabs, Adaptive Chrome & Intentional Cadence

This document defines the mobile expression of Gurudevi navigation. The shared
authority for active tasks, restoration, and time is the cross-platform
[Domain Workbenches, Active Tasks, and Temporal Horizon ADR](../../../../docs/decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md).

## 0. Authority and current alignment work

The existing active-sub-tab implementation is an important prototype, not a
finished source of truth. It currently registers Overview as a task, has a
global temporal store, and cannot fully express resource-specific task
instances or reliable close-to-Overview behavior. Those are migration defects,
not approved product behavior.

On mobile, the product model is:

```text
primary domain → Overview/Catalog → active task strip → focused task
```

Overview/Catalog is never a task pill. It is the stable return floor when no
task remains. The active-task strip appears only when there is at least one
real background or focused task.

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

### Recovery budget, not mounted-screen budget

The mobile workbench retains at most five recoverable task descriptors per
domain. It does not keep five feature trees mounted. When the budget is reached,
the least-recently-focused inactive descriptor may be removed only after its
draft/recovery policy has been checked. The next implementation must refresh
recency on focus and explicitly return to Overview when the final task closes.

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
Mounted beneath the active domain header when at least one real task is open:
- **Active Pill**: Elevated background with an amber active-indicator dot.
- **Close Action**: Direct tap on `X` closes the task and returns to the most-recently-focused neighboring task or the root overview.
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

### Focused-route serialization
The focused task is always addressable by a clean URL; the rest of the active
working set restores from device-local workbench state. This keeps links useful
without trying to serialize an entire workbench into a query string:
- Sanctuary Overview Hub: `/self`
- Voice Journal: `/self?feature=voice_journal`
- Mood Lotus: `/self?feature=mood_lotus`
- Decision Journal: `/self?feature=decision_journal`
- Daily Pulse: `/self?feature=daily_pulse`

Resource-backed tasks must add their stable resource context to their task key
and route. A classroom task is therefore not merely `attendance`; it is
attendance for a particular classroom.

## 5A. Mobile temporal horizon

When the domain supports time, place one quiet temporal horizon below the
domain header and task strip, above the overview or focused task. It contains a
human date, Today, previous/next, and calendar-on-demand. It is not repeated
inside every feature and it is not a global app filter.

On portrait it is a full-width orientation line. On short landscape it becomes
a terse date plus previous/next beside the Overview return control. A task may
follow the domain horizon, hold a fixed date, or declare itself present-time
only. See the canonical ADR for the shared rules.

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
