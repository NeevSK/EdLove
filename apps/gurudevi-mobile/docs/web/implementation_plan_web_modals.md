---
title: "Universal Web Modal System"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Universal Web Modal System

The current FAB and Modal implementations rely on Native `Modal` components which are inconsistent or non-functional on the web. This plan outlines the creation of a universal modal system and fixing the library's interactive elements.

## Proposed Changes

### [Component Name] @repo/ui

#### [NEW] [UniversalModal.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/UniversalModal.tsx)
A platform-aware modal component.
- **Mobile**: Uses `react-native` `Modal`.
- **Web**: Uses a fixed-position `View` with high `zIndex` to ensure it acts as a true overlay.

#### [NEW] [SanctuaryModal.web.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/SanctuaryModal.web.tsx)
Web override for `SanctuaryModal` to use `UniversalModal`.

#### [MODIFY] [LotusPetalFAB.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/LotusPetalFAB.tsx)
Replace internal `Modal` usage with `UniversalModal`.

### [Component Name] @repo/library

#### [MODIFY] [LibraryScreen.web.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/library/src/screens/LibraryScreen.web.tsx)
Ensure the FAB is correctly rendered and not obscured by the dashboard layout.

## Verification Plan

### Manual Verification
- Deploy web app and verify FAB opens the action drawer.
- Verify "Add Resource" modal appears and is interactive (keyboard input, buttons).
- Verify mobile remains functional and visually unchanged.
