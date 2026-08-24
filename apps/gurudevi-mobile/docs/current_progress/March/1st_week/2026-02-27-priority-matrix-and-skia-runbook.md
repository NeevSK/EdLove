---
title: "Priority Matrix + Skia Dark Overlay Runbook"
status: "active"
created: 2026-02-27
updated: 2026-02-27
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Priority Matrix + Skia Dark Overlay Runbook

Date: 2026-02-27  
Inputs reviewed:
- `docs/current_progress/Feb/4th_week/tasks.md`
- `docs/current_progress/March/1st_week/tasks.md`

---

## 1) What to do next (recommended sequence)

### Phase 0 — Stabilize visuals and architecture first (do this now)
1. Fix Skia overlay rendering path with a safe incremental rollout (see Section 3).
2. Enforce token-only theming audit on shared surfaces (header, navbar, profile modals).
3. Lock one canonical “done” list for Week 4 vs March carry-over (remove duplicate/open ambiguity).

### Phase 1 — High value UX polish with low backend coupling
4. Global Header redesign + alignment (all spaces).
5. Bottom navbar redesign + token alignment.
6. Self default view + mood tracker redesign.

### Phase 2 — Core feature flows
7. Community next flows (create/join/leave/settings/members/chat shell).
8. Classroom view parity by role (student + principal specific defaults).
9. Library view cleanup + content pipeline preparation.

### Phase 3 — Production hardening
10. Real notifications (remove hardcoded).
11. Error handling normalization.
12. QA matrix (a11y/localization/perf/security) + CI/CD path.

---

## 2) Priority matrix: Agent vs User ownership + complexity

Legend:
- **Owner**: `Agent` (Codex/GitHub cloud agent), `User`, or `Joint`
- **Complexity**: S/M/L/XL
- **Risk**: Low/Medium/High

| Priority | Work Item | Owner | Complexity | Risk | Why |
|---|---|---:|---:|---:|---|
| P0 | Skia dark overlay fix + guarded rollout | Joint | M | High | Needs device/runtime validation plus implementation discipline. |
| P1 | Header + navbar theme-aligned redesign | Agent | M | Medium | Strong candidate for deterministic UI refactor. |
| P1 | Profile modal premium alignment (if still open in current branch) | Agent | S | Low | Mostly component/theming consistency work. |
| P1 | Self screen default + mood tracker redesign | Joint | M | Medium | Agent can implement; user should approve emotional/visual direction. |
| P2 | Community flow shell (create/join/leave/settings/members/chat scaffold) | Agent | L | Medium | Agent-friendly for navigation/state scaffolding. |
| P2 | Community “education-tag required” posting nudge | Agent | M | Low | Clear validation + UI affordance task. |
| P2 | Classroom role-specific default demos/views | Joint | L | Medium | Product rules and sample data choices need user input. |
| P2 | Library minimal redesign + FAB/layout fixes | Agent | M | Low | UI architecture task, low business risk. |
| P3 | Library content curation defaults | User | L | Medium | Domain/editorial work needs human judgment. |
| P3 | Multi-year classroom data model and yearly promotion logic | Joint | XL | High | Deep product + data modeling decisions. |
| P3 | OCR/files/grading/attendance breadth expansion | Joint | XL | High | Multi-domain feature engineering with backend implications. |
| P3 | Real notification system (end-to-end) | Joint | L | Medium | Requires backend/event ownership + app integration. |
| P4 | QA matrix and test automation (unit/BDD/E2E) | Agent | L | Medium | Agent can build test scaffolds and smoke checks well. |
| P4 | CI/CD app-store readiness | Joint | M | Medium | Technical + credential/release owner actions needed. |

---

## 3) Skia issue: “full dark rectangle overlay” — practical fix path

Observed symptom: Skia overlay renders as a dark opaque rectangle, hiding UI.

### Probable causes
1. Overlay alpha is too high or color math multiplies alpha unexpectedly.
2. ColorMatrix used as tint/alpha control creates unintended full-surface darkening.
3. Overlay z-order + blend mode defaults produce opaque composition.
4. Root integration applies overlay before/around wrong container.
5. Device/GPU-specific Skia behavior (especially with turbulence + matrix combos).

### Safe implementation sequence (recommended)

#### Step A — Prove baseline with zero-risk overlay
- Render `NoiseOverlay` as a transparent no-op first (opacity `0.0`).
- Confirm no full-screen dark fill appears.

#### Step B — Replace complex matrix pipeline with minimal additive grain
- Start with tiny alpha (`0.01` → `0.02`), no warm/cool matrix transforms.
- Add turbulence only; postpone tint matrix until stable.

#### Step C — Clamp all runtime values
- Opacity hard clamp: `0 <= opacity <= 0.03`
- Frequency hard clamp to safe range (e.g., `0.35..0.85`).
- Disable overlay automatically on unsupported/unstable path via feature flag.

#### Step D — Guarded integration
- Mount as last child in root app tree with `pointerEvents="none"`.
- Keep behind modal blockers if needed; avoid accidental darkening of overlays.

#### Step E — Feature-flag rollout
- `skiaNoiseOverlay=false` by default in production branch.
- Enable on dev builds first; then staged rollout by role/percentage.

### Ownership split for Skia fix
- **Agent**: implement guarded fallback path, clamps, and flags.
- **User**: approve visual target and test on real target devices (low-end + mid-range + flagship).

---

## 4) Tasks review summary: what seems done vs open

### Likely done (from Feb Week 4 checklist status marks)
- Dynamic profile completion system.
- Avatar/default avatar usage in identity/global header paths.
- Horizontal chips/carousel DRY architecture.
- Several profile modal/theming alignment items.

### Still open / should be prioritized from March Week 1
- Header and bottom navbar premium redesign alignment.
- Self screen redesign (default, mood tracker, organization).
- Classroom and community role-specific default experiences.
- Library redesign + content acquisition workflow.

---

## 5) Immediate 7-day execution suggestion

Day 1-2:
- Skia stabilization + feature flag + fallback.
- Header/navbar token audit and cleanup.

Day 3-4:
- Self screen redesign pass (default + mood tracker).
- Community posting constraints (tag required + group relevance nudges).

Day 5:
- Classroom role-specific default demos.
- Library visual cleanup.

Day 6-7:
- Real notifications wiring plan.
- QA smoke suite + backlog re-prioritization.

---

This runbook is execution-focused: keep architecture stable, fix rendering risk first, then ship visible UX wins.
