---
title: Premium UI/UX Polish and Visual Excellence
description: Guides the agent to review design hierarchy, replace generic layouts with premium components, inject micro-animations, and verify responsiveness using Playwright.
triggers:
  - "polish screen"
  - "make it look premium"
  - "improve UI aesthetics"
  - "responsive layout check"
  - "add animations or gradients"
---

# Premium UI/UX Polish & Visual Excellence Playbook

Use this skill when polishing screens, fixing visual cutoffs, adjusting responsive layouts, or updating design system components in `apps/edlove-web`, `apps/gurudevi-marketingWeb`, or `apps/gurudevi-mobile`.

## Core Guidelines for Premium Design

1. **Colors & Gradients**: Avoid boring solid primaries (plain #FF0000, #0000FF). Use rich HSL palettes, glassmorphism (`backdrop-filter: blur`), and subtle linear gradients (`bg-gradient-to-tr`).
2. **Typography**: Enforce proper visual hierarchy. Do not use browser defaults. Use curated Google Fonts (Outfit, Inter, Playfair Display) with varying weights (`font-light`, `font-semibold`).
3. **Micro-Animations**: Add subtle interactive state transitions. Use tailwind/css transitions (e.g., `transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg`).
4. **Layout & Bounding Boxes**: Do not hardcode height constraints on parent panels. Use adaptive flex boxes, safe area insets, and overflow containers to prevent layout cutoffs on mobile/small viewports.

## Step-by-Step Polish Workflow

### 1. Visual Review
- Inspect the targeted layout or component file.
- Locate static styles, hardcoded colors, and rigid heights.

### 2. Style Remediation
- Replace raw styles with design system tokens.
- Add dynamic shadows, smooth corners (`rounded-2xl` or `rounded-3xl`), and state-specific hover effects.

### 3. Verify Journey & Layout
- Start the local dev server using:
  ```powershell
  pnpm run dev
  ```
- Use the **Browser Subagent** tool to navigate to the page and visually check the layout.
- Review alignment, typography, and contrast. Confirm there are no visual glitches or overlaps.
