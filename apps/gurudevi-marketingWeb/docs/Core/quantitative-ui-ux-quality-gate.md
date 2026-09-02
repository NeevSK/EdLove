---
title: "Quantitative UI/UX Quality Gate: Typographic Harmonics & WCAG Contrast Standard"
status: "active"
created: 2026-09-01
updated: 2026-09-01
author: "Naveen"
scribe: "Antigravity"
tags: [ui-ux, typography, accessibility, wcag, quality-gate, design-tokens]
---

# Quantitative UI/UX Quality Gate (Step 1) & Qualitative Editorial Review (Step 2)

## 1. Problem Statement & Root Cause Analysis

Visual discrepancies across `gurudevi-marketingWeb` stem from three systemic issues:

1. **Extreme Typographic Jump Ratios (>5.5:1)**:
   - Headings inflated to `clamp(3.3rem, 7.5vw, 7rem)` (up to 112px on large desktops) contrasted with `text-xs` (12px) labels.
2. **Unconstrained Markdown Rendering & Scattered Prose**:
   - Lack of strict `max-w-prose` (68ch) reading boundaries on long-form articles.
3. **Contrast Ratios on Subtitles & Metadata**:
   - Secondary text muted to `text-charcoal-truth/60` or `text-mud-brown/60` occasionally dipping below 4.5:1 WCAG contrast on subtle vellum backgrounds.

---

## 2. The 2-Tier Quality Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: QUANTITATIVE QUALITY GATE (Automated & Mathematical Rules)          │
│ • Typographic Scale Ratio: Golden Major Third (1.25x) - Perfect Fourth (1.33x)│
│ • Line Length Budget: 45ch - 68ch max for all editorial reading surfaces    │
│ • WCAG 2.1 AA Contrast Ratio: ≥ 4.5:1 for body copy, ≥ 3.0:1 for H1-H3      │
│ • Tap Target Budget: Minimum 44x44px bounding box on touch viewports        │
│ • Vertical Rhythm: Consistent 8px baseline grid (rem multiples)             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIER 2: QUALITATIVE HUMAN GATE (Editorial Soul & Atmosphere)                │
│ • Sanctuary stillness, saffron & temple stone palette                        │
│ • Authentic photography, tactile typography, natural light                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Harmonic Scale Specification

### A. Typographic Scale (Fluid Harmony)
* **Display / Hero H1**: `clamp(2.5rem, 5vw, 4rem)` (40px – 64px, line-height: 1.05)
* **Section H2**: `clamp(1.75rem, 3.2vw, 2.5rem)` (28px – 40px, line-height: 1.2)
* **Sub-section H3**: `clamp(1.25rem, 2.2vw, 1.75rem)` (20px – 28px, line-height: 1.3)
* **Lead / Lede Paragraph**: `clamp(1.125rem, 1.4vw, 1.35rem)` (18px – 21px, line-height: 1.6)
* **Body Reading Prose**: `1.125rem` (18px, line-height: 1.75, font-family: DM Sans)
* **Meta / Eyebrow**: `0.8125rem` (13px, font-weight: 700, letter-spacing: 0.12em)

### B. Prose Column Dimensions
* **`max-w-prose`**: `68ch` (~680px)
* **Paragraph spacing**: `1.4em`
* **Heading top margin**: `2.2em`, bottom margin: `0.7em`
