---
title: "ADR: Gurudevi Domain Workbenches, Active Tasks, and Temporal Horizon"
status: accepted
date: 2026-09-15
owners: [Naveen, Gurudevi platform]
tags: [gurudevi, navigation, mobile, web, temporal, multitasking]
supersedes:
  - "the active-task and temporal-state portions of apps/gurudevi-mobile/docs/architecture/mobile-navigation-and-adaptive-chrome.md"
---

# ADR: Gurudevi Domain Workbenches, Active Tasks, and Temporal Horizon

## Decision

Each primary Sanctuary domain is a **workbench**, not a single page and not a
browser-tab clone. A workbench has a permanent Overview/Catalog floor, a
recoverable set of active tasks, one focused task, and an optional domain-level
temporal horizon.

```text
Sanctuary shell
  → primary domain workbench
    → Overview / Catalog (always available; never an active task)
    → active task working set
      → focused task instance
        → optional temporal binding
```

Self, Workspace, Community, and Library keep independent working sets. Profile
is an account destination, not a primary workbench. Switching a primary domain
must preserve the other domains' task working sets without keeping all feature
trees mounted in memory.

## Overview is a floor arrangement

Overview/Catalog is not a separate landing page built beside the domain canvas.
It is the domain floor's default arrangement: fixed orientation furniture,
allowed configurable/pinned furniture, and the catalog/discovery entry.

```text
domain floor / canvas
  → Overview arrangement
    → fixed orientation furniture
    → allowed pinned or ordered task furniture
    → catalog / discovery furniture
    → active-task working set
```

The shared canvas model may support organization where the domain permits it;
it does not make Overview a generic draggable-card dashboard. A feature opened
from Overview becomes an active task on the same workbench and returns to that
floor when closed.

This ADR is the cross-platform authority. The mobile document describes
placement and interaction on mobile; the browser migration plan describes its
browser implementation sequence.

## What is an active task

An active task is an in-progress, resumable domain activity: Fire Journal,
Daily Pulse, a particular classroom's attendance, a resource reader, a group
conversation, or a collection editor. It is not a generic screen label.

Every task descriptor must contain:

- a stable task-instance key derived from feature plus resource/context;
- the domain and browser/mobile route needed to reopen it;
- a human title and minimal icon/presentation metadata;
- temporal binding, if the task supports time;
- last-focus time and recoverable local UI state policy.

The current route remains a deep-link to the focused task. The rest of the
working set is a device-local session restoration record; it is never encoded
as a giant URL and never treated as durable feature data.

## Task rules

1. Entering a domain with no active tasks lands on Overview/Catalog.
2. Overview/Catalog is permanent and is never inserted into the task strip.
3. Opening an already-open identical task focuses it; it does not duplicate it.
4. A domain may allow distinct instances where resource context differs, such
   as Attendance for Classroom 8B and Attendance for Classroom 9A.
5. Closing the focused task selects the most recently focused remaining task.
   Closing the final task navigates explicitly to Overview/Catalog.
6. Eviction is a restoration-policy decision, not a way to keep feature trees
   alive. It must prefer inactive least-recently-focused tasks, never discard
   unsaved work, and explain a forced removal when it happens.
7. A task whose resource no longer exists or whose access is revoked restores
   to Overview/Catalog with a specific reason and a recovery action.
8. Home is fixed before the ordered task strip. New tasks are inserted directly
   after Home; focusing an existing task does not reorder it. Users can reorder
   task descriptors within their domain. Quick Access remains a separate
   shortcut set, and tasks are not grouped.

The initial platform caps are experience safeguards, not a claim about memory:
three visible tasks on compact phones, five recoverable tasks per mobile domain,
and seven recoverable tasks per browser domain. Domains may choose a lower cap
when their tasks are sensitive or expensive. Caps must be tested and are not
user-configurable until their recovery behavior is proven.

## Temporal horizon

Time belongs to the **domain workbench** whenever that domain has a meaningful
temporal lens. In the browser, the compact greeting/date context band sits above
the task strip, and the strip sits above the focused feature content. Time is a
quiet orientation line, not a universal dashboard filter and not another task
tab.

```text
[ Overview ] [ Daily Pulse × ] [ Goals × ] [ + ]

Monday, 15 September                    Today  ‹  ›  Calendar

[ focused task or overview floor ]
```

The shared temporal contract contains a selected anchor, scale, and intent:

- anchor: now/today, a date, a period, or a domain-specific cycle;
- scale: domain-defined day, week, term, reading period, or equivalent;
- intent: current, review, or plan;
- binding: `follow-domain`, `fixed`, or `none` for each task instance.

Tasks follow the domain horizon by default when they can safely do so. A task
with `none` remains present-time and says so plainly. A deliberate historical
comparison may create a fixed-date task instance, for example “Daily Pulse —
12 September.” Changing the domain horizon changes only following compatible
tasks; it must never silently alter unrelated domains or a fixed task.

Self's horizon is day-oriented and calm. Workspace may use day/week/term.
Library normally uses shelf or reading progress context rather than a calendar.
Community is normally current/live. Profile and Settings have no horizon.

## Presentation rules

| Context | Mobile portrait | Mobile landscape | Browser |
| --- | --- | --- | --- |
| Overview, no tasks | domain header then overview; no empty strip | compact header and overview | shell, primary navigation, workbench context, then overview |
| Overview with background tasks | horizontally scrollable active-task strip; Overview remains an explicit first destination | compact switcher with Overview/back action | task strip or vertical work list within the domain floor |
| Focused task | focused domain header, task strip, then temporal horizon if relevant | title, Overview return, compact task switcher; do not consume scarce height with two full bars | workbench context, task strip, then focused feature content |
| Temporal horizon | one human date line with Today, previous/next, and calendar on demand | terse date and previous/next; calendar in overflow | date line or a richer period control only when the domain needs it |

The horizon should read like a change in daylight over the workbench: “Monday,
15 September,” followed by a short domain-appropriate orientation. It must not
be a row of global metric cards, a permanent date-range form, or repeated
inside every feature.

## Restoration and data truth

Task restoration is layered:

1. restore the workbench descriptor set and last focused task locally;
2. navigate to the focused task's normal route;
3. rehydrate authoritative feature data through its account or Explore adapter;
4. restore an allowed local draft/panel/scroll state only after the task is
   valid and authorized.

Account data remains authoritative at its server/API boundary. Explore stores
only its allowed local records. The workbench descriptor never implies that a
server write, account conversion, or sync has occurred.

## Critical corrections to current implementation

- `self-overview` must not be an active task.
- A global `useTemporalStore` must be replaced by scoped domain-workbench
  temporal state; global clock/formatting utilities may remain shared.
- Task identity must include resource/context, not just a feature ID.
- Focus must update recency. Closing the last task must route to Overview.
- Existing task strips, Overview Hub, and older `BaseSelfView` navigation must
  converge on one workbench model rather than competing feature-switchers.
- Auto-hide chrome must never hide the only available task switcher or temporal
  control while it has keyboard focus or while a user is editing.

## Implementation sequence

1. Define pure task-descriptor, task-key, temporal-binding, restoration, and
   close/focus policies with tests.
2. Adapt the mobile workbench store and route integration; retain current
   feature behavior while removing Overview-as-task and global temporal bleed.
3. Build the browser workbench state adapter and shell placement from the same
   contract.
4. Rebuild Self Overview and its first complete tasks against the contract.
5. Migrate Workspace resource instances, then Library, Community, and the
   account destinations only where their domain behavior warrants it.

## Browser shell composition

The browser uses a horizontal primary navigation row by default at every
width; at compact widths it uses compact icon-and-label destinations. Settings
can switch to a side rail, which adapts into a full-width four-destination
bottom bar on small screens. Self and Workspace keep Home fixed at the start of
their task strip.
Quick Access opens a sheet from the strip, keeps pinned tools separate from
open tasks, and opens the selected feature route directly. The layout preference
is browser-local presentation state; it does not grant access or alter feature
data.

## Cross-platform migration rule

Migration does **not** mean copying a React Native component into Next.js, nor
does it mean dropping a feature because its existing implementation depends on
native infrastructure. It means preserving the user-visible capability and
rebuilding the platform adapter at the appropriate boundary.

```text
shared feature manifest and use-case
  → native adapter: Expo navigation, MMKV, native permissions, native auth
  → browser adapter: Next route/rendering, browser session, browser storage,
    authenticated server/API transport
```

An existing `.web.tsx` file is evidence of intended capability and interaction,
not proof that it is a safe Next.js module. It must be audited for its actual
storage, authorization, temporal, and runtime dependencies. If those differ,
the browser implementation is rebuilt against the same feature contract rather
than imported through an unsafe compatibility path.

Platform incompatibility is a migration task to solve, never a rationale for
complaining about the old implementation, deferring the intended capability, or
silently narrowing the product. Record the missing boundary, create the proper
adapter or transport, and keep the feature explicitly planned until it is
delivered.

Feature registries are compatibility-critical. Before consolidating or retiring
one, inventory every consumer, preserve a thin adapter for live callers, and
prove that the new canonical manifest produces the same feature identity and
route parameters. No registry may be silently sidelined; its remaining callers
and retirement criteria must be explicit.
