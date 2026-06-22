---
title: "Decoupled TanStack Table and Virtual Integration"
status: "active"
created: 2026-06-12
updated: 2026-06-12
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, ui, web, native]
---

# Decoupled TanStack Table and Virtual Integration

This document outlines the architectural decision and implementation of **TanStack Table** (React Table) and **TanStack Virtual** (React Virtual) within the `gurudevi-mobile` and `@repo/ui` workspace.

---

## 1. Context & Objective

As a cross-platform Expo application (`native` + `web`), rendering large datasets (such as student gradebooks, attendance lists, and library curation queues) requires high-performance UI layouts.

We needed a system that:
1. **Shares layout logic**: Column definitions, cell value accessors, sorting, filtering, selection, and pagination states must be identical on both mobile screens and web panels.
2. **Handles native virtualization**: Mobile devices must use row recycling (like Shopify FlashList) to avoid DOM/View memory leak issues.
3. **Handles web virtualization**: Web dashboards must utilize high-performance scrolling calculations to avoid rendering thousands of table rows in the DOM.

---

## 2. Architectural Decision: Complete Decoupling

We decided to completely decouple the **state calculation engine** from the **rendering engine**. 

Instead of binding the virtualization math directly to the table state, we implemented:
*   **State Layer (`useSanctuaryTable`)**: Runs TanStack Table's core engine, managing cell structures, column models, sorting arrays, and filtering inputs. It is 100% platform-agnostic.
*   **Mobile View Layer (`SanctuaryTable`)**: A native-specific React Native wrapper. It pipes the table rows directly into `SanctuaryFlashList`, utilizing native recycler views.
*   **Web View Layer (`SanctuaryTable.web`)**: A basic semantic HTML table component styled with Tailwind for standard size datasets.
*   **Web Virtualized Layer (`SanctuaryVirtualTable.web`)**: A web-only grid that combines the table engine output with `@tanstack/react-virtual`'s `useVirtualizer` to calculate dynamic viewport offsets and absolute positions.

---

## 3. Implementation Details & File Nuances

### A. Shared Hook
*   **File**: [`useSanctuaryTable.ts`](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/hooks/useSanctuaryTable.ts)
*   **Details**: Configures React Table's core models (`getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`) with default state callbacks for sorting and selections.

### B. Mobile View (Recycler Layout)
*   **File**: [`SanctuaryTable.tsx`](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/SanctuaryTable.tsx)
*   **Nuance**: On Native, grids use a flex-row structure. Cells look up `columnDef.size` to apply dynamic widths. Rows are rendered inside `SanctuaryFlashList` for automatic item recycling.

### C. Web Virtualized View (DOM Scroll Windowing)
*   **File**: [`SanctuaryVirtualTable.web.tsx`](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/SanctuaryVirtualTable.web.tsx)
*   **Nuance**: Uses a reference ref `tableContainerRef` to hook into the DOM scroll element. It calculates `paddingTop` and `paddingBottom` heights dynamically so the scrollbar remains accurate while rendering only the visible window of rows.

---

## 4. Specific Contexts & Gotchas

### Size Definitions
In TanStack Table, default column widths are `150px`. In our native renderer, columns with the default `150` size are automatically given a `flex: 1` style to stretch and occupy remaining screen real estate. Columns with specific sizes are given exact widths (`columnDef.size`) to keep layouts predictable.

### Dependency Management
To run the table features, the following dependencies must be added to the packages:
- `@tanstack/react-table`: Core table engine.
- `@tanstack/react-virtual`: Required for web-based scroll windowing.
