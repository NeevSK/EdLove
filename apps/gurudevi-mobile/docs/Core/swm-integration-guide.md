---
title: "Software Mansion Libraries Integration Guide"
status: "active"
created: 2026-06-13
updated: 2026-06-13
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, architecture, ui, packages]
---

# Software Mansion Integration Guide: Performance & UI Optimization

This guide serves as the source of truth for the Software Mansion (SWM) and SWM Labs libraries integrated into the **Gurudevi Platform (`gurudevi-mobile`)** monorepo workspace. It outlines their core use cases and specifies exactly where and how they should be applied across packages.

---

## 1. Newly Installed Packages & Use Cases

### A. React Freeze (`react-freeze`)
*   **Use Case:** Suspends drawing updates of inactive/background screens in navigation layouts. When a screen is not in focus (e.g., a background tab or previous screen in the stack), its component tree is "frozen," which completely skips drawing operations while retaining state.
*   **Where to Apply:**
    *   Integrate directly inside custom route layout wrappers in `apps/gurudevi-mobile/app/` (Expo Router).
    *   Wrap heavy nested dashboard views (like student/teacher classrooms in `@repo/classroom`) that are pushed onto navigation stacks.

### B. React Native Avoid Softinput (`react-native-avoid-softinput`)
*   **Use Case:** Prevents soft keyboards from overlapping text entry fields. It uses native OS hooks to dynamically shift the screen offset smoothly, bypassing the sluggish layouts of standard JS-thread keyboard-avoiding views.
*   **Where to Apply:**
    *   `packages/ai/src/screens/AIAssistantScreen.tsx` — In the AI assistant messaging console.
    *   `packages/profile/src/components/InlineSocialLinkEditor.tsx` — Inside user profile settings sheets.
    *   Form templates in `@repo/form-builder` which have multiple input layers.

### C. React Native Streamdown (`react-native-streamdown`)
*   **Use Case:** Fast, real-time Markdown rendering optimized for streaming LLM text outputs. Unlike typical Markdown parsers, it tolerates partial/unfinished syntax, preventing layout jumps as text streams in.
*   **Where to Apply:**
    *   `packages/ai/src/screens/AIAssistantScreen.tsx` — Replace the plain `<Text>` render block with a streaming Markdown component to support formatted response streams from the remote AI model.

### D. React Native Enriched Markdown (`react-native-enriched-markdown`)
*   **Use Case:** High-fidelity native Markdown renderer that supports tables, bullet points, headers, inline equations, and LaTeX formatting without relying on a slow webview.
*   **Where to Apply:**
    *   `packages/library/src/screens/DocumentViewerScreen.tsx` — For rendering content pages.
    *   Exercise and homework specifications in `@repo/classroom`.

### E. React Native Nano Icons (`react-native-nano-icons`)
*   **Use Case:** Generates and compiles vector SVG icons into custom native icon fonts at build time. It improves application launch time and UI thread responsiveness by rendering icons as text glyphs rather than running complex SVG path parsers on each render cycle.
*   **Where to Apply:**
    *   `packages/ui/src/components/` — Replace standard Lucide SVG imports in common buttons, headers, and tabs with nano-compiled fonts in the central `@repo/ui` library.

### F. SWM Native Bottom Sheet (`@swmansion/react-native-bottom-sheet`)
*   **Use Case:** A highly performant native bottom-sheet drawer with content-based height calculation and native touch tracking, avoiding laggy JS thread calculations during drag/swipe physics.
*   **Where to Apply:**
    *   `packages/library/src/screens/LibraryScreen.tsx` — Filter drawers and curation option menus.
    *   Classroom list selectors and student details options in `@repo/classroom`.
