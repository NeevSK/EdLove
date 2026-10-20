---
title: "Workbench Task Order and Drag Reordering"
status: implemented
created: 2026-10-20
updated: 2026-10-20
author: "Naveen"
tags: [gurudevi, workbench, navigation, accessibility, performance]
---

# Workbench Task Order and Drag Reordering

## Decision

Each domain keeps one ordered list of active task descriptors. Home is a fixed
floor before that list. Quick Access is a separate set of shortcuts, not a
second task list. Tabs are not grouped.

The horizontal primary-navigation row below the shell header is the default at
all widths; on small screens it keeps compact icon-and-label destinations.
Settings can switch to a side rail, which becomes a full-width four-destination
bottom bar on small screens. Within Self and Workspace, the contextual header
(greeting and temporal controls) remains above the task strip; Home stays fixed
at the start of the strip and opened feature tasks follow it. The Quick Access
control opens a sheet containing pinned and available tools. Choosing a tool
focuses its existing task or opens its real route directly, with no intermediate
preview step.

The navigation layout preference is stored locally in the browser. It changes
presentation only and does not affect route access, role authorization, or
feature data. Account synchronization of this preference is deferred.

- Opening a new task puts it immediately after Home, so the newest work is
  easiest to reach.
- Opening an already-open task changes focus only; it does not change order.
- Dragging changes only descriptor order. It does not change focus, route,
  resource, temporal binding, draft data, or authorization.
- Closing a task removes that descriptor and preserves the relative order of
  the others. Closing Home is not supported.
- Self, Workspace, Community, and Library retain separate workbenches.
- The browser uses its existing local workbench snapshot; native uses the
  existing persisted Zustand store. Reordering is local metadata and makes no
  server request or feature-data write.

## Interaction

The browser exposes a visible-on-focus drag handle with native drag-and-drop,
plus `Alt` + Left/Right Arrow keyboard movement on a task tab. Native mobile
uses a long-press drag handle with an animated finger-following translation and
screen-reader actions to move earlier or later. Home and Quick Access are not
draggable. A canceled gesture leaves the order unchanged.

The tab strip remains horizontally scrollable. Reordering is bounded to the
current domain; it never moves a task into another domain. Browser and native
share the same pure reorder policy, while each platform owns its input and
presentation adapter.

## Data, recovery, and resource limits

Task order is represented by the order of the existing `tasks` array, so there
is no parallel ordering map to reconcile. The current browser and native
per-domain caps remain unchanged. Hitting capacity still follows the existing
non-evicting policy for tasks whose recovery state is unknown. No workbench
screen is mounted just to keep a background tab warm; only its descriptor is
retained, and the focused route remains the source of rendered feature UI.

The local descriptor snapshot is not authoritative feature data. Route entry
must continue to re-check the route's normal access and resource validity.
The existing browser storage key is shared by the current browser workbench
implementation; account/demo scoping remains a separate privacy hardening item
before storing richer resource labels or drafts in task metadata. Do not treat
this navigation-order change as resolving that storage-scope limitation.

## Operationalization

1. Keep Home and the overview catalog as the feature discovery surface; remove
   the redundant Features control from the task strip.
2. Keep pinned Quick Access separate from open task tabs. Its sheet is available
   from the task strip, and selecting a tool focuses its existing task or opens
   the feature route as a new task at the front of the task order.
3. Apply the shared reorder operation in web and native stores.
4. Keep visual task panels lazy and preserve existing hard caps; no background
   pre-rendering or task grouping is introduced.
5. Verify desktop pointer drag, web keyboard movement, native long-press drag,
   screen-reader movement, refresh restoration, close/focus behavior, and the
   capacity path before broadening task persistence or adding groups.

## Risks and deferred work

- Long titles and narrow widths can make tab targets hard to distinguish;
  scrolling and the drag handle must remain separate gestures.
- Native drag is gesture-handler-version-sensitive. This implementation uses
  the installed hook-based API and must be exercised on supported physical
  devices before being called device-verified.
- Existing task snapshots are device-local and the browser namespace is not
  yet account/demo scoped. No feature payloads are added here. Resolve that
  scoping before task descriptors begin carrying sensitive labels or drafts.
- User-created groups, cross-domain tabs, synchronization, and automatic tab
  eviction are deliberately deferred until usage evidence and recovery policy
  justify their added state and failure modes.
