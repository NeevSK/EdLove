---
title: "ðŸ›¸ Media Consumption Architecture (2026 Edition)"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, ui]
---

# 🛸 Media Consumption Architecture (2026 Edition)

## 📖 Overview
The Polymath Platform uses a **Decoupled Media Strategy**. By promoting media tools from local packages (like `@repo/library`) to `@repo/core` and `@repo/ui`, we ensure that high-fidelity media consumption (Video, PDF, DOCX, XLSX, PPTX) is consistent, robust, and premium across the entire monorepo.

---

## 🎨 The 2026 "Fluid Media" Pattern
In 2026, we move away from "Click to Open File" toward "Embedded Intent." 

### 1. Spatial Design & Hierarchy
*   **Translucent Portals**: Media viewers (like `VideoPlayer`) use high-depth translucency (Glassmorphism) to keep the user grounded in the application context.
*   **Adaptive Backgrounds**: Hardware-aware blur. On high-end devices, use real-time blur; on low-end devices, fall back to solid HSL themed colors to preserve frames.
*   **Phase Tokens**: Components must strictly use `phase-surface`, `phase-accent`, and `phase-border` to ensure seamless transition between light/dark/spatial modes.

### 2. "Zero UI" & Anticipatory Logic
*   **Intentional Actions**: Pre-emptive background downloading (`useMediaDownloader`) for bookmarked items.
*   **AI Contextual Overlays**: Placeholders for LLM-summarized previews of Word/PDF documents before the user opens them.
*   **Tactile Textures**: Use subtle grain or analog paper textures for document backgrounds to provide a "premium human feel."
*   **Markdown Transformation**: For 2026 "Zero-Legacy" apps, use services like **Jina AI Reader** to transform complex DOCX/WebView content into clean, AI-ready Markdown, allowing a unified "Reader Mode" across all document types.

---

## ⚙️ Core Architecture

### State Management (`mediaReducer.ts`)
We use a deterministic state machine for all media players.
*   **Agnostic Logic**: The same reducer handles Video, Audio, and Scanned Document progress.
*   **Referential Stability**: All handlers are memoized via `useCallback` for the 2026 React Compiler.

### Orchestration Hook (`useMediaDownloader.ts`)
A cross-platform hook that abstracts the physical file:
*   **Native**: Local caching via `expo-file-system` and handoff via `expo-sharing`.
*   **Web**: Browser-native blob handling or external tab redirection.
*   **Robustness**: Built-in retry logic and progress tracking for unreliable networks.

---

## 🛠️ The "Universal Document Portal"
We implement a `UniversalDocumentPortal` to handle non-video/PDF formats (XLSX, DOCX, PPTX).

### Strategy by File Type:
| Format | 2026 Best Practice Implementation |
| :--- | :--- |
| **PDF** | Integrated logic-agnostic viewer (`PdfViewer`) + Native Share. |
| **DOCX / PPTX** | `WebView` based preview (Google/Microsoft API) + **Deep Link** to native Office app. |
| **XLSX / CSV** | Interactive Data Table primitive (`@repo/ui/DataTable`) or native app handoff. |
| **MP3 / AAC** | Compact floating `AudioPlayer` with background audio support. |

---

## 🚀 Recommended Tooling & SDKs (2026)

### Professional Grade (Paid/Complex)
*   **Apryse (PDFTron)**: The absolute standard for cross-platform document rendering, annotation, and redaction. Use for "Institutional Hardening."
*   **Cloudinary SDK**: For dynamic delivery and automatic transcoding of media resources based on device bandwidth.

### Foundation Grade (Free/OSS)
*   **`expo-video`**: High-performance, New Architecture compatible video player for native.
*   **`react-native-skia`**: Use for custom audio visualizers or high-frequency rendering of media overlays.
*   **`react-native-webview`**: For orchestrated document previews via web APIs.

---

## 🌊 Robustness & Hardware Limits

### 1. The "Network Resilience" Pattern
*   **Offline First**: Every resource ID maps to a local hash. If the network drops, the portal automatically presents the cached version with a "Synced [Date]" indicator.
*   **Lazy Decoders**: Don't initialize high-memory players until the user interacts with the "Portal."

### 2. Hardware-Aware Rendering
```typescript
// Pattern: Feature detection for 2026 Hardware
const blurStyle = hardwareTier === 'high' ? styles.spatialBlur : styles.solidSurface;
```

---

## ⚠️ Anti-Patterns (The "Don'ts")
*   **❌ Unhandled Large Files**: Never próbale to load a 100MB XLSX into a standard React state. Always stream or use native handoff.
*   **❌ Inline Function Handlers**: Do not use `onPress={() => ...}` inside media components; it triggers unnecessary re-renders in high-frequency players.
*   **❌ Package Pollution**: Do not import `expo-video` directly into a screen; always use the `@repo/ui` wrapper to allow web-shims.
*   **❌ Platform Branching in Logic**: Keep `useMediaDownloader` platform-branched internally; the UI should only see `downloadState`.

---

## 🎯 Implementation Roadmap
1. [x] **Phase 1**: Promote `mediaReducer` and `useMediaDownloader` to `@repo/core`.
2. [x] **Phase 2**: Implement `VideoPlayer` and `PdfViewer` in `@repo/ui`.
3. [ ] **Phase 3**: Implement `UniversalDocumentPortal` in `@repo/ui` for Office formats.
4. [ ] **Phase 4**: Promote `ResourceActionSheet` and `ResourceRow` for unified platform UX.
