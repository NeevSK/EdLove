# Sovereign Form Builder: Vision & Architecture

## 1. The Vision
To create a **shareable, premium, and platform-agnostic** form-building ecosystem. It should feel as intuitive as Google Forms while offering the high-fidelity UI and "Local-First" resilience of the Sovereign platform.

### Core Tenets:
- **Universal Design**: A single schema defines experiences on Web, iOS, and Android.
- **Standalone Capability**: The engine should be publishable as a standalone package, usable in any React or React Native project.
- **Institutional Intelligence**: Built-in analytics and QR-based distribution tailored for classrooms and organizations.
- **Zero-Latency Interactions**: Local-first by default, ensuring creators and responders never wait for a spinner.

---

## 2. Operational Strategy: The "Headless" Approach
To achieve standalone status and avoid "Monorepo Gravity," we follow a strict **Engine vs. UI** separation.

### A. The Engine (`@repo/form-builder/engine`)
- **Pure Logic**: Headless management of form state, validation, and analytics.
- **Zero Dependencies**: No imports from `@repo/core` or `@repo/ui`.
- **Inversion of Control**: Infrastructure (API, Storage) is injected via Adapters.

### B. The UI Layers (`@repo/form-builder/ui`)
- **Native Components**: Optimized for touch and mobile gestures.
- **Web Components**: Optimized for mouse/keyboard and accessibility.
- **Theming**: Consumes a shared design system but allows for brand-specific overrides.

---

## 3. Current State (Phase 1)
- [x] **Functional Builder**: Add/Remove fields, edit labels, and toggle requirements.
- [x] **Real-time Preview**: Instant hydration of the form schema for testing.
- [x] **Basic Analytics**: Client-side aggregation of responses (CSV/XLSX export).
- [x] **Persistence**: Auto-saving of drafts to local storage.
- [x] **Distribution**: Integrated QR code generator for physical sharing.

---

## 4. Limitations & Challenges
- **Monorepo Gravity**: Current tight coupling with `@repo/core` prevents standalone publishing.
- **Static List**: Lacks Drag-and-Drop reordering, making complex form design tedious.
- **Flat Structure**: Limited to single-page forms with no section support.
- **Logic Gaps**: Conditional branching ("If-Then-Else") is currently a placeholder.
- **Scalability**: Client-side analytics will degrade with thousands of responses.

---

## 5. The "Better Way" (Roadmap)
### **Drag-and-Drop (DND) Adapters**
Instead of a "Universal" DND library, we will implement **Platform-Specific Adapters**:
- **Web**: `@dnd-kit` for performant DOM-based dragging.
- **Native**: `react-native-draggable-flatlist` for smooth gesture-driven reordering.

### **Versioned JSON Schema**
Move to a `{ v: "1.0", schema: {...} }` structure. This allows us to evolve the builder (e.g., adding multi-page support) while running local migration scripts on older forms without breaking data integrity.

### **Local-First Querying**
Leverage **SQLite JSON extensions** for on-device analytics. This keeps the app fast even with large datasets and maintains privacy by processing data locally.

### **Server-Side Aggregation**
For large-scale institutional data, we will offload aggregation to Supabase (PostgreSQL) using JSONB indexing, returning only the "Final Stats" to the client.
