---
title: "@repo/ui - Humane Design System"
status: "active"
created: 2026-03-25
updated: 2026-10-15
author: "EdLove Foundation & Gurudevi Sanctuary"
tags: [packages, ui, design-system, accessibility, tokens, apca]
---

# @repo/ui — Humane Design System

> **A tactile, calm, and accessible visual language built for educators and learners.**

`@repo/ui` provides the design primitives, semantic tokens, and interaction components that define the look, feel, and soul of Gurudevi and EdLove. It is designed to feel restorative, clear, and dignified across both mobile touchscreens and desktop browsers.

---

## 🎨 Design Philosophy & Principles

1. **Restorative Pacing & Visual Calm**: Learning environments should foster focus and tranquility. We avoid garish neon accents, relentless flashing badges, and high-stress notification red-dots.
2. **APCA & WCAG3 Contrast Rigor**: Every text and UI element is rigorously checked against modern perceptual contrast algorithms, ensuring effortless legibility in bright classroom daylight as well as evening study.
3. **Tactile & Natural Motion**: Subtle animations and gestures provide responsive, organic physical feedback without disorienting motion sickness or lag.
4. **Universal Accessibility**: Semantic HTML for browsers, full screen-reader label coverage, and accessible touch target sizes (minimum 44x44 points) across all devices.

---

## 🏛️ Component & Token Hierarchy

The design system is structured to provide consistency without rigidity:

* **Semantic Tokens (`@repo/ui/tokens`)**: Platform-neutral color palettes, typography scales, spacing units, and corner radii. Free of framework dependencies so they can be consumed anywhere.
* **Primitives (`@repo/ui/primitives`)**: Elemental layout blocks—`Box`, `Text`, `Heading`, `VStack`, `HStack`, `Pressable`, and `Icon`.
* **Compounds**: Accessible interactive components—`Button`, `FormField`, `Tabs`, `Dialog`, `Sheet`, `Popover`, `Combobox`, and `Command`.
* **Sanctuary Shells**: Branded states for calm loading, compassionate empty screens, and celebratory milestone moments.

---

## 🤝 For Contributors & Designers

* Design from the mobile viewport upward: a component must feel completely natural in one hand on a compact smartphone before being scaled for desktop monitors.
* Favor semantic colors (`surface-primary`, `text-secondary`, `brand-accent`) over raw hex codes so dark and light sanctuary themes remain harmonious.
* Keep interactions fluid and respectful of user intent.
