---
title: "API Refactoring - Before & After Comparison"
status: "active"
created: 2026-02-11
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
> **⚠️ ARCHIVED — Historical Reference Only**
> This document is preserved for context. It describes the API refactoring that has already been completed. Do not treat it as current guidance. For up-to-date architecture notes, see the main project documentation.

# API Refactoring - Before & After Comparison

## Problem Statement

> "won't that be a problem when having loads of apis?"

This was a valid concern. The initial approach of a single `api.ts` file was convenient for a prototype but fatal for a scaling application.

## 1. The "Zombie File" Problem (Old Approach)

In the monolithic approach:
*   **File**: `src/lib/api.ts` (1000+ lines)
*   **Structure**: One giant object export.
*   **Risk**: Every agent modifies the **same file**.
*   **Result**: Merge conflicts are guaranteed. If Agent A adds "Grading" and Agent B adds "Attendance", git sees both editing the same 20 lines at the bottom of the file.

## 2. The Modular Solution (New Approach)

We have moved to a domain-driven structure:

```
src/lib/api/
├── teacher.ts      (Tasks, Notes)
├── classroom.ts    (Lessons, Students)
├── attendance.ts   (New Feature)
├── resources.ts    (New Feature)
└── index.ts        (Aggregator)
```

### Impact Analysis

| Metric | Old (`api.ts`) | New (`api/*.ts`) | Benefit |
| :--- | :--- | :--- | :--- |
| **Conflict Risk** | 🔴 High | 🟢 Low | Agents work on different files (`attendance.ts` vs `grading.ts`). |
| **Readability** | 🔴 Low | 🟢 High | Logic is grouped by domain, not piled together. |
| **Scalability** | 🔴 Limited | 🟢 Infinite | Add 100 new features = 100 new files, not 10,000 new lines in one file. |
| **Maintainability** | 🔴 Poor | 🟢 Excellent | Types are shared but logic is isolated. |

## 3. Evidence of Success

We successfully integrated **3 Parallel Missions** without code loss:
1.  **Mission 02 (Teacher Workbench)**: Added `attendance.ts` and `resources.ts`.
2.  **Fix Branch**: Refactored `auth.ts`.
3.  **Result**: Both coexist in `index.ts`.

## Conclusion

The "loads of apis" concern is solved by **organization**, not **reduction**. We have *more files* but *less complexity* per file. This is the standard pattern for enterprise React Native apps.
