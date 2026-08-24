---
title: "Handover: Web Strategy & Architectural Alignment"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Handover: Web Strategy & Architectural Alignment

## 1. Context
As we evolve from a mobile-only app to a multi-platform ecosystem, we have established a strict boundary between "The Brain" (Logic) and "The Experience" (Interface).

## 2. The "Web vs Native" Dilemma
We use the `*.web.tsx` pattern to allow high-fidelity web experiences without polluting the native mobile code.

- **Mobile First:** Standard `.tsx` files focus on React Native primitives and Expo integration.
- **Idealistic Web:** `*.web.tsx` files use native browser standards (CSS Grid, `backdrop-blur`, native `<a>` tags) to provide a "premium desktop" feel, not just a stretched mobile view.

## 3. The Brain/Skin Split
To support this, we treat packages differently than apps:

### The Shared Package (`@repo/[domain]`)
- **Brain (Logic):** Hooks and API calls reside here. They must be platform-agnostic (using `supabase-js`, `axios`, or `@repo/core` shims).
- **Skin (Primitives):** Atomic UI components (Buttons, Cards, Domain Visuals like `MoodLotus`) reside here. They use `@repo/ui` which handles basic web/mobile branching.

### The Application (`apps/gurudevi-mobile`)
- **Experience (Screens):** This is where the complex layouts live. 
- A screen like `LibraryScreen.tsx` might be 100 lines of Flexbox for mobile, while `LibraryScreen.web.tsx` uses 200 lines of CSS Grid and complex sidebars for web.
- **Both use the same "Brain":** They import the same `useLibraryData` hook from `@repo/library`.

## 4. Key Decisions from Recent Alignment
- **Migrate Everything to Packages:** If logic is reusable, it **must** live in the package. An app should be a "dumb container" that orchestrates shared logic and components.
- **Functional Benefit:** Statistical improvement in code maintainability—bugs found in the mobile app's "Self" view are fixed in the package and automatically fixed for the future `edlove-web` dashboard.

## 5. Future Roadmap for Web
1.  **Aesthetic Decay Prevention:** Always use `Theme.colors` tokens; avoid hardcoded hex codes to ensure "The Black Purge" remains effective and contrast is high.
2.  **Navigation Shims:** Use `@react-navigation/native` consistent with web URL patterns.
3.  **SEO:** Ensure `*.web.tsx` screens use semantic HTML (`<h1>`, `<section>`) to prepare for public-facing search indexing.

---
**Status:** Architecture Aligned
**Agent:** Antigravity (DeepMind)
