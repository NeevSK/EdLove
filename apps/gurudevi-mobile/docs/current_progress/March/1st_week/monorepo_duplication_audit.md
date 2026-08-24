---
title: "Monorepo Diagnostic: Duplication & Architectural Drift (RESOLVED)"
status: "active"
created: 2026-02-26
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Monorepo Diagnostic: Duplication & Architectural Drift (RESOLVED)
# Last Audit Update: 2026-02-28

Following the **"Library First"** and **"Convolutional Resonance"** principles in `TAIL_FIN.md`, I've audited and resolved the `polymath-platform` monorepo duplication.

## 1. High-Impact Duplicates (UI & Screens) - [RESOLVED]

All mobile-specific orphans have been merged into their respective shared packages.

| Component / Screen | Former App Location | New Package Home | Status |
| :--- | :--- | :--- | :--- |
| **LotusPetalFAB** | `apps/gurudevi-mobile/...` | `packages/ui/...` | **Unified**: App logic merged into premium shared FAB. |
| **GroupsScreen** | `apps/gurudevi-mobile/...` | `packages/community/...` | **Purged**: Using library version. |
| **GroupDetailsScreen** | `apps/gurudevi-mobile/...` | `packages/community/...` | **Purged**: Using library version. |
| **CreatePostModal** | `apps/gurudevi-mobile/...` | `packages/community/...` | **Purged**. |
| **ReportPostModal** | `apps/gurudevi-mobile/...` | `packages/community/...` | **Purged**. |

## 2. Infrastructure & Logic Duplicates - [RESOLVED]

| Item | App Location | Package Location | Action |
| :--- | :--- | :--- | :--- |
| **useTheme / useAccessibility** | `apps/gurudevi-mobile` | `packages/ui` | Unified in `@repo/ui`. |
| **useInventory / useAttendance** | `apps/gurudevi-mobile` | `packages/classroom` | Moved to Domain Package. |
| **demo / mockData** | `apps/gurudevi-mobile` | `packages/core` | Unified in `@repo/core`. |

## 3. Implementation Verification
- **Resonant Imports**: All mobile screens now import from `@repo/` libraries.
- **Dissonant Imports**: Local orphans and replicated hooks eliminated.

## 4. Final Sanitization Status
1.  **Extraction**: Unique features moved from `apps/` into `@repo/`.
2.  **Harmonization**: Shared components support advanced app features.
3.  **Sanitization**: `apps/` orphans deleted; screens point to libraries.
4.  **Verification**: Codebase verified against regressions (2026-02-28).

**Reparative Extraction Complete.**
