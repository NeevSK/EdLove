---
title: "Implementation Plan: Knowledge Dashboard (Premium Web Experience)"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Implementation Plan: Knowledge Dashboard (Premium Web Experience)

This plan outlines the transformation of the Gurudevi Library from a "stretched mobile" layout to a premium, desktop-native **Knowledge Dashboard** for the web.

## Goal
Provide a spatial, multi-column dashboard for web users that leverages larger screens to show more context and social pulse simultaneously.

## Technical Approach
We will use the **Full Replacement pattern** (`.web.tsx`) to provide a dedicated web screen while sharing the `useLibrary` business logic.

### 1. New Component: `LibraryScreen.web.tsx` [NEW]
- **File**: `packages/library/src/screens/LibraryScreen.web.tsx`
- **Layout Structure**:
    - **AppFrame**: A flex container for sidebar + content.
    - **Sidebar**: Fixed-width navigation with glassmorphism effects.
    - **Grid Content**: A responsive CSS grid (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`) for library cards.

### 2. UI Enhancements
- **Density**: Increase item density on screen.
- **Hover Effects**: Add subtle scale-up or shadow transitions on cards.
- **Side Filters**: Move the chip row from a horizontal scroll to a vertical list in the sidebar.

## Implementation Steps
1. [ ] Create `LibraryScreen.web.tsx` in `@repo/library`.
2. [ ] Port `useLibrary` and search logic.
3. [ ] Build the "AppFrame" layout with `react-native-web` compatible containers.
4. [ ] Implement the responsive masonry-style grid.
5. [ ] Add premium web-only transitions.

## Verification
- **Responsiveness**: Test on 1080p, 1440p, and tablet widths.
- **Business Logic**: Ensure search, sync, and filters work exactly as they do on mobile.
