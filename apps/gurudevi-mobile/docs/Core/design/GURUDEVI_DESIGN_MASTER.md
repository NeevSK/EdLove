# Gurudevi Design Master
## Source of Truth, Decision Policy, and Change Protocol

**Purpose**: Define one authoritative design-doc workflow so new ideas can evolve fast without fragmenting implementation.

---

## 1) Source-of-Truth Hierarchy

When documents disagree, use this precedence order:

1. **Implementation truth** (code + tokens currently used by app)
   - `packages/design-tokens/src/*`
   - `packages/ui/src/theme/*`
   - `packages/ui/src/components/*`
   - `packages/ui/src/components-native/*`
   - `apps/gurudevi-mobile/src/*` (screen composition and behavior)
2. **Design constitution docs** in `docs/Core/design/*`
3. **Core foundation docs** in `docs/Core/*`
4. **All other docs** in `docs/*` (tasks, old docs, exploratory notes)

If a lower-priority doc conflicts with higher-priority truth, the lower-priority doc must be updated or marked legacy.

---

## 2) Canonical Design Set (Current)

These files form the active design constitution:

- `gurudevi-aesthetic-doctrine.md` (higher-order aesthetic doctrine: layout, light, material, typography)
- `gurudevi-design-language.md` (palette + visual laws)
- `gurudevi-scene-token-hierarchy.md` (shared scene layer stack and readable text pairings across mobile and web)
- `gurudevi-token-resolution.md` (token architecture for world, phase, profile, and readability)
- `gurudevi-space-specifications.md` (space-level intent and behavior)
- `gurudevi-design-retina.md` (implementation/QA laws)
- `gurudevi-component-library.md` (component contracts)
- `gurudevi-skia-implementation.md` (Skia and token migration path)
- `gurudevi-architecture.md` (file placement and monorepo boundaries)

This file (`GURUDEVI_DESIGN_MASTER.md`) governs how those docs stay aligned.

---

## 3) Resolved Architecture Decision

**Skia location is canonicalized as:**

- `packages/ui/src/components-native/`
- Import path from app: `@gurudevi/ui/native`

This keeps one mobile-only boundary and prevents feature-package drift.

---

## 4) How To Decide “Doc vs Code” Conflicts

Use this decision order:

1. **Is this already implemented in tokens/theme/components?**
   - If yes, treat it as temporary runtime truth.
2. **Does the active constitution explicitly disagree?**
   - If yes, create a migration task and align code deliberately.
3. **Is it only in old/task docs?**
   - Treat as proposal, not requirement.

Outcome rule:
- No silent divergence. Every discrepancy must become either:
  - a code migration task, or
  - a doc update, or
  - a legacy annotation.

---

## 5) Change Protocol (Lightweight)

For any design-system change:

1. Update this master doc section **"Change Log"** with summary.
2. Update the canonical doc(s) affected.
3. If code-impacting, update tokens/components in same PR when possible.
4. If not implemented yet, add an explicit `Pending Implementation` note in docs.

---

## 6) Master Backlog for Alignment

### A. Immediate
- [ ] Add one `docs/Core/design/README.md` index linking all canonical docs and marking legacy references.
- [ ] Add “Last validated against code” metadata to canonical design docs.
- [ ] Run repository audit for forbidden colors/shadows (`#FFFFFF`, `#000000`, `rgba(0,0,0,*)`) and map exceptions.

### B. Short Term
- [ ] Align any conflicting blur guidance into one token-driven rule.
- [ ] Define final token naming map from legacy names to current names.
- [ ] Mark outdated docs in `docs/old_docs` and `docs/Tasks` with header badge: `Legacy / Inspiration`.

### C. Ongoing
- [ ] Monthly doc-code drift review.
- [ ] Before major UI work, re-validate this hierarchy.

---

## 7) Change Log

- **2026-03-20**: Retuned Gurudevi dark-phase palettes toward sanctuary graphite with blue-violet undertones so guarded dark mode no longer depends on the older brown-black night world.
- **2026-03-20**: Added `gurudevi-scene-token-hierarchy.md` to formalize the shared layer grammar for world, chrome, canvas, surfaces, elevation, and readable text roles across web and mobile.
- **2026-03-20**: Added `gurudevi-token-resolution.md` to define a manageable token architecture for world, phase, future theme profiles, and derived readability.
- **2026-03-20**: Added `gurudevi-aesthetic-doctrine.md` to formalize the higher-order UI doctrine connecting Swiss clarity, silk elegance, ecological aliveness, and sacred illumination.
- **2026-02-27**: Created design master governance doc; confirmed Skia canonical location as `packages/ui/src/components-native` with `@gurudevi/ui/native` import path.
- **2026-02-27**: Added execution priority matrix + Skia dark-overlay runbook in `docs/current_progress/March/1st_week/2026-02-27-priority-matrix-and-skia-runbook.md`.

---

This document is intentionally small and procedural. The soul lives in the design-language docs; this file keeps the system coherent as it evolves.
