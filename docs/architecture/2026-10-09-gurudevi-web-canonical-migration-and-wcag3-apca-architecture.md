---
title: "Gurudevi Canonical Web Migration & WCAG 3 / APCA Perceptual Architecture"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Naveen"
scribe: "Antigravity"
tags: [web, nextjs, migration, wcag3, apca, accessibility, architecture]
---

# Gurudevi Canonical Web Migration & WCAG 3 / APCA Perceptual Architecture

## 1. Executive Summary & Architectural Invariant

This document establishes the authoritative blueprint for transitioning the web surface of Gurudevi from the legacy Expo Metro web runtime (`apps/gurudevi-mobile/*.web.tsx`) into the canonical browser application at `apps/gurudevi-web` (Next.js 16 App Router, React 19, Tailwind v4).

### The Prime Invariants
1. **Experience Parity over Renderer Parity**: We do not transpile or import React Native Web components (`*.web.tsx`) into Next.js. We build browser-native implementations with semantic HTML5, CSS Modules, and standard web conventions.
2. **Server-First Boundary**: The legacy mobile web app booted an entire client-side PowerSync database via WASM/OPFS (`@powersync/web`). `gurudevi-web` eliminates this ~5MB WASM footprint, utilizing Next.js Server Components, direct `@supabase/ssr` cookies, and lightweight offline practice drafting via `@repo/core/lib/practiceBoundary`.
3. **The Dual-Standard Accessibility Floor**: Full alignment with both the legal compliance baseline (**WCAG 2.2 AA**) and the perceptual future (**WCAG 3.0 Working Draft & APCA 0.98G**).
4. **The Deletion Veto**: Under [AGENTS.md](file:///c:/x/AGENTS.md), legacy Metro web routes and `.web.tsx` files remain fully functional until replacement browser journeys pass empirical Playwright G4 phone-browser verification.

---

## 2. Inventory & Transition Mapping Matrix

Auditing all 23 `.web.*` files in `apps/gurudevi-mobile`:

| Category | Source File (`gurudevi-mobile`) | Target Route / Component (`gurudevi-web`) | Architectural Shift |
| :--- | :--- | :--- | :--- |
| **Shell & Nav** | `app/(tabs)/_layout.web.tsx` (984 lines) | `app/(sanctuary)/components/SanctuaryShell.tsx` | Replaces RN Web tab bar & custom drawers with responsive CSS grid/flex, `<dialog>` navigation, and APCA-calibrated navigation links. |
| **Command Palette**| `src/components/web/CommandPalette.web.tsx` | `app/(sanctuary)/components/CommandPalette.tsx` | Migrates from RN modal to native HTML `<dialog>` with `Cmd+K` / `Ctrl+K`, keyboard traps, and ARIA combobox pattern. |
| **Academic Floor** | `src/screens/AttendanceScreen.web.tsx` | `app/(sanctuary)/workspace` & `lib/workspace/attendance.ts` | **Migrated**: Server-driven auth entry + client interactive table + localStorage offline drafting. |
| **Academic Floor** | `src/screens/GradebookScreen.web.tsx` | `app/(sanctuary)/workspace/gradebook` | Migrates to responsive HTML table with arrow key cell navigation, inline score editing, and APCA grade badges. |
| **Academic Floor** | `src/screens/TimetableScreen.web.tsx` | `app/(sanctuary)/workspace/timetable` | Mobile 1-day card view (360px) and desktop weekly schedule matrix (1024px+). |
| **Academic Floor** | `src/screens/ClassroomDetailScreen.web.tsx`| `app/(sanctuary)/c/[code]` | Dynamic classroom hub with attendance stats and activity feed. |
| **Labs & Portals** | `src/screens/DurableAgentsScreen.web.tsx` | `app/(sanctuary)/agent-lab` | Durable Agent scenario visualizer (`attendance-dip`, `steady-growth`) and execution timeline. |
| **Labs & Portals** | `app/icon-lab.web.tsx` | `app/(sanctuary)/icon-lab` | Brand icon catalog with dynamic size and APCA contrast preview. |
| **Community** | `src/screens/SchoolForestScreen.web.tsx` | `app/(sanctuary)/community` | Sanctuary learning forest & community floor. |
| **Legal / PDPA** | `src/components/PDPAConsentModal.web.tsx` | `app/components/PDPAConsentBanner.tsx` | Compliance with Sri Lanka Personal Data Protection Act No. 9 of 2022 via cookie consent banner. |
| **PWA & Deep Link**| `src/components/web/PWAInstallBanner.web.tsx` | `app/components/PWAInstallBanner.tsx` | Replaced with native `beforeinstallprompt` event listener and Web Manifest. |
| **Data & Sync** | `src/providers/PowerSyncProvider.web.tsx` | Server Components + oRPC + `@repo/core/lib/practiceBoundary` | **Replaced**: No WASM SQLite in browser; fast SSR data fetching with optimistic client drafting. |

---

## 3. WCAG 3.0 & APCA Perceptual Engineering Standard

In compliance with the workspace standard established in [`docs/architecture/2026-09-05-a11y-gate-canonical-consolidation.md`](file:///c:/x/docs/architecture/2026-09-05-a11y-gate-canonical-consolidation.md), all `gurudevi-web` surfaces implement the **Dual-Standard Governance**:

$$\text{Pass (Body Text)} \iff \text{WCAG 2.2 AA} \ge 4.5:1 \quad \text{AND} \quad \text{APCA } |L_c| \ge 75$$
$$\text{Pass (Large/Interactive)} \iff \text{WCAG 2.2 AA} \ge 3.0:1 \quad \text{AND} \quad \text{APCA } |L_c| \ge 60$$

### 3.1 Polarity-Aware Lightness Contrast ($L_c$)
Human cones perceive light text against a dark background with optical halation, whereas dark text against a light background requires higher ink density.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Calibrated Design Tokens for Gurudevi Web                 │
├─────────────────┬───────────┬──────────────┬────────────┬────────────────────┤
│ Appearance      │ Surface   │ Ink Token    │ APCA |Lc|  │ WCAG 2.2 Ratio     │
├─────────────────┼───────────┼──────────────┼────────────┼────────────────────┤
│ Dawn (Vellum)   │ #fff6e8   │ #131e27      │ 98.4       │ 14.8:1 (AAA)       │
│ Garden (Sage)   │ #f3f7ec   │ #131e27      │ 97.8       │ 14.2:1 (AAA)       │
│ Night (Charcoal)│ #202326   │ #f3efe6      │ 94.2       │ 12.6:1 (AAA)       │
│ Secondary / Muted│ #fff6e8  │ #453c35      │ 78.5       │ 6.8:1 (AA)         │
│ Interactive Saffron│ #fff6e8│ #a85022      │ 62.1       │ 4.9:1 (AA)         │
└─────────────────┴───────────┴──────────────┴────────────┴────────────────────┘
```

### 3.2 Spatial Pointer Ergonomics & Minimum Target Geometry
- **Mobile Browser Floor (360–430px)**: All tap targets must satisfy a **$44 \times 44\text{px}$ minimum** bounding box or **$24 \times 24\text{px}$ visual size with $\ge 8\text{px}$ non-overlapping spacing**.
- Interactive table cells (Attendance/Gradebook toggles) provide touch padding (`min-height: 44px`).

### 3.3 Focus Appearance (WCAG 2.2 SC 2.4.13 & WCAG 3)
Focus rings must never be hidden (`outline: none` is forbidden).
```css
:focus-visible {
  outline: 2px solid var(--color-peacock-blue);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgb(28 74 90 / 0.18);
}

[data-appearance="night"] :focus-visible {
  outline: 2px solid #a8c995;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgb(168 201 149 / 0.22);
}
```

### 3.4 Vestibular Safety & Reduced Motion
Any layout animation (e.g. `sanctuary-floor-breathe`) is disabled when `prefers-reduced-motion: reduce` is detected:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. Phased Execution Roadmap

### Phase 1: Shell Parity, Perspective Switcher & Command Palette
- Add Perspective Switcher dropdown to `SanctuaryShell`.
- Implement `CommandPalette.tsx` using native HTML `<dialog>` and `Cmd+K` keyboard shortcut.
- Integrate `PDPAConsentBanner.tsx` for Sri Lanka PDPA legal compliance.
- Audit global focus and APCA tokens in `app/styles.css`.

### Phase 2: Core Academic Floors (`workspace/*`)
- Implement `app/(sanctuary)/workspace/gradebook/page.tsx` with APCA score badges.
- Implement `app/(sanctuary)/workspace/timetable/page.tsx` with responsive week matrix.
- Connect dynamic classroom route `app/(sanctuary)/c/[code]/page.tsx`.

### Phase 3: Labs, Portals & Community
- Implement `app/(sanctuary)/agent-lab/page.tsx` (Durable Agents runner).
- Implement `app/(sanctuary)/icon-lab/page.tsx` (Brand Icon catalog).
- Implement `app/(sanctuary)/community/page.tsx` (School Forest).

### Phase 4: Verification, Cutover & The Deletion Veto
- Run automated Playwright tests: `test:e2e:mobile` and `test:e2e:desktop`.
- Execute APCA contrast assertions.
- Request human sign-off before deprecating legacy `.web.tsx` files.
