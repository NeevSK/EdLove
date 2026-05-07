# Architecture: Retina Graphics Engine (Multi-Perspective)

This document defines the high-fidelity visualization strategy for the Gurudevi ecosystem. It transitions from basic "screens" to a standalone, programmable **Retina Graphics Engine**.

## 1. The Core Philosophy: "Signal over Noise"

Visualization in Gurudevi is not just "Obsidain nodes." It is a multi-dimensional lens system. A "Perspective" (Astro, Terra, Dharma, Vastu, Jyoti) is a specific renderer that interprets the underlying Knowledge Topology.

### The Rendering Law (Design Retina)
To respect the target constraints (low-end Android, 2GB RAM), we follow a strict rendering hierarchy:

-   **Skia**: Reserved **ONLY** for surface decoration (Grain, Glass, Luminous Glow). 
-   **Graphs/Trees/Paths**: Rendered via platform-optimized primitives (`react-native-svg` on mobile, D3-SVG on web).
-   **Geo Maps**: Native OEM rendering (`react-native-maps`).
-   **Sequential Lists**: Virtualized primitives (`FlatList`, `FlashList`).

---

## 2. Perspective Matrix & Rendering Strategy

| Perspective | Name | Visualization Type | Rendering Primitive |
|---|---|---|---|
| **Astro** | Knowledge Cosmos | Force-Directed Topology | `react-native-svg` + Pre-computed D3 |
| **Vastu** | Structure / Mind Map | Hierarchy / Tree | `react-native-svg` + D3 Hierarchy |
| **Dharma** | Sequential Path | Curated "Kinnu-style" Path | `FlatList` + Reanimated SVG Spine |
| **Terra** | Geo Map | Interactive Geographical Data | `react-native-maps` / Leaflet WebView |
| **Jyoti** | Analytics / Charts | Data Dashboards (Power BI-like) | `Gifted Charts` (SVG) / D3 |

---

## 3. The "@repo/graphics" Architecture

The visualization logic is decoupled into a standalone package. It is the **Topology & Layout Brain**.

### A. Layout Scaffolding
Every perspective runs through a separate layout algorithm (D3, Geo-projection, etc.) *outside* the rendering loop. 
-   **On Native**: The layout is pre-computed to static coordinates. This eliminates the "JS-to-Skia" frame-budget bottleneck.
-   **On Web**: The layout can remain live for physics-aware interactions.

### B. Perspective Orthogonality
Not all data is "crossview feasible." A `KnowledgeTopology` is automatically enabled for a perspective only if it passes a `validate()` check (e.g., must have `geo` metadata for Terra).

### C. Sub-Context Resolution ("Maps within Maps")
The engine supports zooming from "Global" to "Hyper-Local" contexts.
-   **Example**: Zooming into the "Southern Province" node on a Geo map swaps the current topology for a more dense provincial dataset. The renderer (`Terra`) remains the same, but the context shifts seamlessly.

---

## 4. Technical Constraints & Parity

-   **Memory Hygiene**: No heavy GPU contexts (Skia) for data-heavy nodes.
-   **Platform Parity**: The `@repo/graphics` package uses the same logic for Web and Native, delegating only the final "draw call" to the platform's best-in-class tool.
-   **Interactivity**: Gestures (Pan/Zoom/Tap) are managed at the `Canvas` level, standardizing interaction across all perspectives.

---

## 5. Implementation Protocol

Each new visualization type must be added as a `PerspectiveRenderer` implementation:
1.  **Define Layout**: Add to `packages/graphics/src/layouts/`.
2.  **Define Contract**: Implement the `PerspectiveRenderer` interface.
3.  **Optimize Primitive**: Choose the right rendering tool (SVG vs FlatList vs Maps).
