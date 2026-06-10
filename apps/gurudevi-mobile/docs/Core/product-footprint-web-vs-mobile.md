---
title: "Product Footprint: Web vs Mobile"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [product, footprint, web, mobile]
---

# Product Footprint: Web vs Mobile

This document outlines the user experiences, target audience segments, and functional allocations across the Gurudevi ecosystem environments.

---

## 1. Product Ecosystem Strategy

Gurudevi exists across three distinct environments. Each has a specific job to do for a different part of the educational ecology:

```
                  ┌────────────────────────┐
                  │ GURUDEVI ECOSYSTEM     │
                  └───────────┬────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  NATIVE MOBILE   │ │   PLATFORM WEB   │ │  MARKETING WEB   │
│  "The Companion" │ │ "The Workbench"  │ │   "The Hub"      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 2. Environment Segmentation

### A. Native Mobile & Tablet App (The Operational Companion)
* **Target Users**: Teachers, Students, and Guardians.
* **Core Job**: Serving as the real-time, daily interface inside and outside classrooms.
* **Form Factors (Phones & Tablets)**:
  * **Phones**: Optimized for tight mobile budgets, using single-column list views, barcode scan triggers, and fast check-in tools.
  * **Tablets (iPads / Android Tablets)**: Serve as a bridge form factor. They run the native mobile codebase but scale up via the **Responsive Shell Spec** to render expanded multi-column views, sidebars, and grid structures.
* **Key Features**:
  * Barcode checking scanning (using native camera barcode-scanning kit).
  * Rapid classroom marking (attendance, grades).
  * Personal reflection logs (Self tab wellbeing logs).
  * Multi-account profile switching (allowing parents and kids to share a single phone device).
* **Constraints**: Optimized for low-end Androids, low battery drain, and offline database synchronization (PowerSync + OP-SQLite).

### B. Platform Web App (The Administrative & Power-User Twin)
* **Target Users**: Principals, Administrators, Section/Grade Heads, and Teachers.
* **Core Job**: Serving as the desktop twin of the mobile experience, enabling the same feature set but optimized for the spacious desktop workspace.
* **Affordances & Layouts**:
  * Exposes the same workspace tools (Lessons, Attendance, Library, Community) as mobile, but leverages the large desktop real estate to display side-by-side components.
  * High-fidelity administrative grids, bulk imports/exports, and school configuration views.
  * Desktop-native Library grid views with interactive D3.js knowledge maps.
* **Technology**: Expo Web + Metro bundling resolving `.web.tsx` overrides and layouts optimized with CSS Grid.

### C. Marketing Web App (The Public Hub)
* **Target Users**: Alumni, Gifters (Thuthimal donors), and the General Public.
* **Core Job**: Static information hub, documentation, and external payment processing.
* **Key Features**:
  * Central EdLove/Gurudevi educational manifestos and public documentation.
  * Stripe/local payment gateway integrations for Thuthimal subscription gifting.
  * Public FAQ, about pages, and privacy policy hosting.
* **Technology**: Astro + Svelte + Tailwind (highly optimized for fast SEO and landing ergonomics).
