---
title: "Sovereign Core: Structural Audit & Strategy (2026)"
status: "active"
created: 2026-04-18
updated: 2026-04-18
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Sovereign Core: Structural Audit & Strategy (2026)

## 0. The Confusion Buffer
If you are confused, it's because our current codebase is in a **Hybrid State**. We have components that behave like React Native (Mobile) and logic that behaves like ZenStack (Database), and we are trying to force them to run in Astro v6 (Web/SEO). 

This doc explains **What** happened, **Why** we are changing it, and **How** it protects the future.

---

## 🏗️ 1. WHAT: The Current Layers
| Layer | Name | Identity | Current State |
| :--- | :--- | :--- | :--- |
| **L0** | **Pure Core** | Business Rules, Types, Zod | **Mixed**. Lurking inside `@repo/core` with framework code. |
| **L1** | **Infrastructure** | Supabase, LocalStorage, Auth | **Scattered**. Split between `database` and `core`. |
| **L2** | **Satellites** | Astro Web Apps, Expo Mobile | **Inflexible**. They struggle to import L0 rules without breaking. |

---

## 🏛️ 2. WHY: The ZenStack/Astro Failure Reasons
We spent days debugging ZenStack because we were missing a **"Pure Neutral Ground."**

1.  **The Astro Problem**: Astro v6 runs on Node 26. It is very fast and strict.
2.  **The `@repo/core` Leak**: `@repo/core` currently imports `react-native`. 
3.  **The Collision**: When Astro tries to import a "User Schema" from `core`, it pulls in the `react-native` dependency. **Astro crashes** because it doesn't know what a "Mobile Screen" is.
4.  **The ZenStack Pivot**: ZenStack v3 shifted from "Static Files" to "Runtime Factories." We tried to use the v2 way in a v3 world, which led to the "Mocking/Ghost" loop.

---

## 🛤️ 3. HOW: Moving from "Mixed" to "Sovereign"

### The OLD Way (Fragile)
*   **Database**: Writes schema files to its own folder.
*   **Core**: Tries to reach into the database package and import them.
*   **Apps**: Try to import from Core, catch "Framework Germs" (React-Native imports), and crash.

### The NEW Way: "Parallel Path" Safety Strategy
To avoid breaking the 100+ dependencies on `@repo/core`, we are NOT moving files. We are adding a **Strictly Clean Path** alongside the existing one.

| Target App | Connection Point | Content Type | Rationale |
| :--- | :--- | :--- | :--- |
| **Mobile (Expo)** | `@repo/core` | Mixed (Framework + Logic) | **Stability**. No changes to existing imports ensure zero mobile breakage. |
| **Web (Astro v6)** | `@repo/core/generated` | **Pure Sovereign Logic** | **Compatibility**. Pure TS allows Astro to run on Node 26 without "Framework Germs." |

---

## 🥊 4. "What Might Break?" (The Safety Audit)
If we change things the wrong way, we break **The Metro Bridge**:

*   **Risk**: If we move Supabase logic out of `core` too fast, the Mobile app loses its "Session MMKV" link, and users get logged out.
*   **Mitigation**: Use **Alias Siphoning**.
    1. Keep the old export names in `@repo/core`.
    2. Point them internally to the new `generated` schemas.
    3. The dependants never see the change, but the "Truth" is now unified.

## 🌉 5. Preventing SMR (Server-Mobile-React) Friction
The reason past updates took days is that **React Native polyfills** were leaking into **Server-side code**.
- **Action**: `@repo/core/generated` is strictly forbidden from importing `react-native-url-polyfill` or `Platform`.
- **Result**: Immediate 10x reduction in "Module not found" or "Buffer is not defined" errors in Astro.

**Summary**: We aren't moving things "here and there" randomly. We are **Siphoning the Brain out of the Hands** so that the Brain can work in Astro while the Hands keep working in Mobile.
