---
title: "ðŸŒ¿ The Project Soul"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, platform-mcp]
---

# 🌿 The Project Soul
## The Sovereign Engineering Manifesto & Aesthetic Non-Negotiables

This document is the "Spirit of the Codebase." It captures the philosophical and aesthetic constraints that an agent must honor to maintain architectural integrity.

---

### 🎨 1. Aesthetic Non-Negotiables (Gurudevi)
*Color is an experiential event, not just a hex code.*

*   **Shadows**: Must always be **Shadow Violet** `rgba(107, 100, 128, opacity)`. Never use grey or pure black.
*   **Ground**: The base background is **Vellum** `#F5EDD6`. Never use pure white `#FFFFFF`.
*   **Luminosity**: Light comes *through* surfaces (subsurface scattering), not from edges.
*   **Text**: Use **Ink Deep** `#2A2318`. Never use pure black `#000000`.
*   **Texture**: Global 3% warm Perlin noise grain overlay is required for that "organic" feel.

---

### 🏛️ 2. Architectural Pillars
*   **Zero-Legacy**: We aggressively purge old UI libraries (Gluestack/RN) in favor of the custom Skia-enhanced system.
*   **Gateway Pattern**: We maintain a flat top-level tool list in the MCP by using Gateways (`sovereign_audit`, `sovereign_discovery`, etc.).
*   **Platform Agnosticism**: Logic in `packages/core` must never depend on React Native or Web-specific primitives.
*   **Teacher-Student Sacredness**: The app is a sanctuary for learning, not a productivity factory. Interactions should be calm and inviting.

---

### 🎭 3. Core Metaphors
*   **The Lotus**: Rises from mud, blooms in water, holds light from within.
*   **The Sanctuary**: Every screen should feel like a glade, grove, or clearing—not a dashboard.
*   **Bijam (Seed)**: The earliest stage of any feature. It must be nurtured, not just "shipped."

---

### 🚫 4. The "No" List (Guardian Rules)
*   **No Streak Shaming**: We don't use aggressive gamification.
*   **No Punishing Empty States**: Empty states are invitations to bloom.
*   **No Muddy Blurs**: Blur intensity must be ≤12 (transparent) or ≥36 (frosted). Never in between.

---

> [!IMPORTANT]
> **Agents**: Before implementing any feature, check this ledger. If your plan violates these rules, you MUST propose an alternative that honors the Soul.
