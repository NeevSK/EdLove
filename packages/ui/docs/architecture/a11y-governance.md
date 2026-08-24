---
title: "Accessibility Governance: Design-First A11y"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, ui]
---

# Accessibility Governance: Design-First A11y

This document outlines the strategy for achieving **WCAG 2.2** compliance within the Sanctuary v3 design system without compromising its premium aesthetic.

## 1. Core Philosophy (Fall Forward)
We do not "fix" accessibility by regressing to simpler, high-contrast, or generic colors. We "Fall Forward" by using modern CSS and Native techniques to maintain visual excellence while meeting functional accessibility needs.

## 2. The Golden Rules
1. **Brand Sanctity**: Never change core brand colors (e.g., `gurudeviViolet`, `sanctuarySaffron`) to satisfy contrast linters. These are the identity of the platform.
2. **Environment over Mutation**: If a color combination lacks contrast, modify the **environment** (e.g., background opacity, inner borders, or text weight) instead of the brand color itself.
3. **Semantic Layering**: Always use **Phase Tokens** (`bg-phase-accent`, `text-phase-on-accent`) to allow for theme-based adjustments without hardcoding hex values.

## 3. Techniques for Modern WCAG 2.2
### A. Perceptual Contrast enhancement
*   **Shadow Shields**: Use subtle `text-shadow` or `inner-shadow` to create separation between similarly valued colors.
*   **Weight Mapping**: Use `font-semibold` or `font-bold` for important UI labels on brand backgrounds.
*   **Size Exceptions**: Leverage the Large Text (18pt+ or 14pt bold) WCAG exception to allow lower contrast ratios for headers.

### B. Interactive Indicators (Focus & State)
*   **Sanctuary Glow**: Replace browser-default focus rings with high-vibrancy glows using the `phase-accent` color.
*   **Stateful Overlays**: Use `active:opacity-80` and `hover:bg-phase-interactive/10` to communicate interactivity clearly.

### C. Semantic Orchestration
*   **FormControl Bridging**: All inputs must be linked to their labels via `accessibilityLabelledBy`.
*   **Role Mapping**: Every custom component must map to a valid `accessibilityRole`.

## 4. Visual Audit Checklist
- [ ] **Contrast**: Check `text-phase-primary` against `bg-phase-surface`.
- [ ] **Targets**: Ensure touch targets are at least 44x44dp for mobile.
- [ ] **Inversion**: Mark all avatars and non-decorative images with `accessibilityIgnoresInvertColors`.
