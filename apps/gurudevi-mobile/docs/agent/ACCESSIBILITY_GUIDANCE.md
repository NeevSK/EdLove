---
title: "Sanctuary Accessibility Guidance (Phase 3)"
status: "active"
created: 2026-03-13
updated: 2026-03-13
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Sanctuary Accessibility Guidance (Phase 3)

## Infrastructure Overview

We have implemented a robust accessibility infrastructure to ensure the Sanctuary is inclusive and compliant with both legacy WCAG 2.1 and modern APCA (WCAG 3) standards.

### 1. Utility: `a11yUtils.ts`
Located in `packages/ui/src/utils/a11yUtils.ts`.
- **APCA Contrast**: Use `getAPCAContrast(fg, bg)` for perceptually accurate contrast checks.
  - **Lc 75**: Minimum for body text.
  - **Lc 60**: Minimum for large text (18pt/24px+).
  - **Lc 45**: Minimum for non-text graphics and UI boundaries.
- **WCAG 2.1 Fallback**: `getContrastRatio(fg, bg)` ensures compatibility with current legal standards (AA >= 4.5).
- **Automated Selection**: Use `getBestText(bg, candidates)` to automatically pick the most accessible text color from a palette.

### 2. Automated Auditing
Run the theme auditor to catch contrast regressions:
```bash
npx tsx packages/ui/scripts/audit-theme.ts
```
This script validates all colors in `Theme.ts` and `phaseMatrix` across all temporal phases (dawn, morning, etc.).

### 3. Web-Auditing with Axe
We use `axe-core` for real-time accessibility auditing on the web.
In development mode, `axe-core` will log violations to the browser console.

### 4. Component Best Practices
- **Semantic HTML**: Use `<header>`, `<nav>`, `<main>`, `<section>` instead of generic `div`s where possible.
- **ARIA Live Regions**: Use `aria-live="polite"` for dynamic content that updates without user interaction (e.g., personalized greetings).
- **Labels & Roles**:
  - Always provide `accessibilityLabel` or `aria-label` for icons and buttons without visible text.
  - Use `accessibilityRole` (e.g., `'header'`, `'button'`, `'link'`, `'summary'`).
  - Use `aria-labelledby` to link cards/sections to their titles.

## Phase 3 Completion Checklist
- [x] APCA Contrast Engine (`a11yUtils.ts`)
- [x] Automated Theme Audit Script
- [x] Component Audit (Header, Card)
- [x] Axe-core Integration
- [x] Standardized Inverse Text Contrast

---
*Developed with a Reparative Mindset for a Healing Ecosystem.*
