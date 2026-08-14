---
title: "Gurudevi Web/PWA UI Audit"
status: "draft"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
tags: [gurudevi, web, pwa, ui, ux, responsive, audit]
---

# Gurudevi Web/PWA UI Audit

## Scope and limits

This is an independent audit of the Gurudevi platform-web expression in `apps/gurudevi-mobile`, with the public-facing marketing dialect in `apps/gurudevi-marketingWeb` reviewed where it affects family resemblance and web-specific composition. It covers the web route/layout chain, responsive shell, web variants, self/wellbeing, workspace/classroom, library/community/profile entry points, and the imported audit hypotheses in `docs/files`.

No runtime screenshots or live browser session were available during this pass. Spatial judgments are therefore reconstructed from layout code, styles, route topology, tests, and existing manual-test notes. They are lower-fidelity than a screenshot-based audit. The repository's own manual-test notes are treated as hypotheses and checked against current code; they are not accepted as implementation truth.

## Canonicality trace

The live platform-web chain is:

`apps/gurudevi-mobile/app/_layout.tsx` → `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx` → `apps/gurudevi-mobile/src/lib/responsiveShell.ts` → route `Slot` → app route entry → package-owned screen.

The mobile chain remains separate at `apps/gurudevi-mobile/app/(tabs)/_layout.tsx`, which uses Expo `Tabs` and `GlobalHeader`; the web chain uses a topbar or left rail and its own page header. This is a valid dialect split, not accidental duplication.

Important live route evidence:

- Primary web navigation declares `/self`, `/workspace`, `/community`, `/library`, `/profile`, and utility routes `/durable-agents`, `/notifications`, and `/settings` in `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx`.
- `/workspace` is a dispatcher in `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx`; it resolves role/capacity and redirects to founder, principal, guardian, student classroom, or classroom list.
- `/self` is exported to `@repo/self/screens/SelfScreen`, whose web entry is `packages/self/src/screens/SelfScreen.web.tsx`.
- `/workspace/classroom` is exported to `@repo/classroom/overview`; classroom detail, gradebook, attendance, and student classroom routes are explicit route files under `apps/gurudevi-mobile/app/(tabs)/workspace/classroom`.
- Several similarly named files exist in `apps/gurudevi-mobile/archives`; these are not live route sources and must not be treated as canonical.

## Executive assessment

The web shell is a credible foundation for a web dialect: it has a real route-aware rail/topbar, a defined responsive band model, URL-based page titles, accessible labels, and a separate marketing site rather than forcing one composition across product and public narrative surfaces. The main weakness is not absence of intent; it is inconsistent execution beneath the shell. Some web screens are genuinely web-first, while others are React Native/Flexbox compositions with raw inline CSS, emojis, mobile-shaped cards, or package-owned variants that do not inherit the shell's spatial logic.

The likely user experience is therefore “a web frame around several different products.” The redesign should be treated as a system and surface-composition reset for web, not a sequence of isolated polish passes. Preserve shared doctrine and semantic data/behavior; diverge layout, density, keyboard behavior, navigation affordances, and container grammar for web.

## Spatial-first findings

### 1. Global web shell: good topology, weak hierarchy at compact widths

**Evidence.** `apps/gurudevi-mobile/src/lib/responsiveShell.ts` defines three web bands: `webCompact` below 920px, `webTabletCompact` from 920px to 1279px, and `webDesktop` at 1280px and above. Compact uses a horizontal topbar; tablet uses an 84px icon rail; desktop uses a 248px expanded or 84px collapsed rail. `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx` places the route page title above a bordered content surface and moves all route content into `Slot`.

**Inference.** The band model is a strong canonical shell decision, but it creates three different spatial priorities without a corresponding screen-level container contract. A screen can be “responsive” at the shell while its inner content remains fixed-width or mobile-shaped. The compact topbar also puts every primary and utility route into one horizontally scrollable strip, which makes discoverability and prioritization weaker as route count grows.

**Severity.** High UX/system risk; medium immediate breakage risk.

**Recommendation.** Keep the three bands, but define a web surface contract for each: max readable width, working width, primary action zone, secondary navigation, and overflow behavior. At compact widths, group utilities behind a labeled menu or command surface rather than treating all routes as equal horizontal peers. Validate menu/rail state against the previously reported small-desktop clash hypothesis in `apps/gurudevi-mobile/docs/web/web_issues_i_saw.md`.

### 2. Global shell color and token drift

**Evidence.** The shell uses `webShellTokens` from `@repo/ui/theme` and semantic values such as vellum canvas, ink chrome, sage active state, and phase-aware surfaces. However, `apps/gurudevi-mobile/src/components/web/CommandPalette.web.tsx` directly uses `#FFFFFF`, `#000000`, `#FFFDF7`, `#D4843A`, `bg-black/40`, and emoji glyphs. `packages/classroom/src/screens/AttendanceScreen.web.tsx` directly uses traffic-light green/amber/red values and `rgba(...)` backgrounds. `packages/self/src/components/BaseSelfView.web.tsx` uses raw purple/orange/black-tinted values and `tokens` in the same component.

**Inference.** The live web experience cannot reliably feel like one sanctuary ecology when shell tokens, phase tokens, marketing tokens, and leaf-level raw values all compete. The implementation truth is not currently aligned with the retina's absolute color laws in `apps/gurudevi-mobile/docs/Core/design/gurudevi-design-retina.md`.

**Severity.** High design-system risk; medium accessibility risk because semantic contrast is not centrally governed.

**Recommendation.** Preserve semantic roles, not literal colors: canvas, chrome, surface, active, focus, warning, success, danger, and inverse text. Resolve them through the shared token layer and CSS variables on web. Allow web-specific semantic values where browser contrast or dense data requires it, but forbid leaf-level raw palette invention. A redesign is warranted for status indicators: keep text labels and icons, but express them through accessible status roles rather than generic traffic-light decoration.

### 3. Web/mobile dialect separation is correct in principle but incomplete in practice

**Evidence.** `apps/gurudevi-mobile/docs/web/WEB_GUIDE.md` explicitly distinguishes the platform web app from `apps/gurudevi-marketingWeb`. It also states an “Idealistic Web” direction: CSS Grid, native anchors, IndexedDB, and web-native components. `apps/gurudevi-mobile/docs/web/web_native_critique.md` identifies the current web surface as approximately 82% mobile-centric and recommends divergent `.web.tsx` composition for complex surfaces. The current shell and several variants follow that direction, but `packages/self/src/components/BaseSelfView.web.tsx` still uses React Native primitives, `ScrollView`, and a Flexbox-first layout; `packages/classroom/src/screens/TeacherDashboard.web.tsx` also uses `ScrollView` and workspace primitives designed for shared use.

**Inference.** The repository has already named the right architectural move, but implementation is at an intermediate state. The web dialect should not be evaluated as a failed mobile clone or as a complete web-native product; it is a hybrid that needs explicit migration boundaries.

**Severity.** High redesign priority, especially for high-traffic Self, Workspace, and Library surfaces.

**Recommendation.** Keep shared hooks, data contracts, permissions, empty/error semantics, and capability IDs. Diverge web composition for data-dense and multi-pane surfaces using CSS Grid/container queries, native focus management, hover affordances, URL-addressable state, and browser-appropriate controls. Do not force marketing-site composition into the authenticated app.

### 4. Self/wellbeing: conceptually rich, spatially over-fragmented

**Evidence.** `packages/self/src/screens/SelfScreen.web.tsx` wraps a role-specific dashboard in `sanctuary-screen` and `WebScreenHeader`. `packages/self/src/components/BaseSelfView.web.tsx` adds a sticky temporal control bar, Now/History controls, a max-width frame, domain sections, a 1/2/3-column feature grid, and focused feature cards. Feature cards contain emoji glyphs, pin controls, info controls, and a second focused-detail state. Existing manual notes in `apps/gurudevi-mobile/docs/web/web_issues_i_saw.md` report that Self feels grainy, rough, misaligned, or less human despite a generally acceptable layout.

**Inference.** The likely issue is job-count and material competition rather than missing content. The screen simultaneously asks the user to understand role identity, time mode, scale, domain grouping, feature discovery, pinning, and content entry. Cards then turn a continuous wellbeing practice into many discrete islands. Emoji are also acting as identity, navigation cue, and emotional tone, but their cross-platform rendering is not a stable brand asset.

**Severity.** High experience risk for the product's most intimate surface.

**Recommendation.** Redesign Self around one dominant job per viewport: “arrive and sense,” “choose a practice,” or “review a pattern.” Keep temporal state and feature metadata, but subordinate them to a calm primary canvas. Replace emoji-as-icon with a small semantic illustration/icon set; use continuous atmospheric sections for rituals and deliberate cards only for independent practices. Preserve the wellbeing language and gentle invitation doctrine from `docs/files/specialized/09-wellbeing-self-domain-audit.md`, while making the web layout more spacious and keyboard-addressable.

### 5. Workspace/classroom: functional depth, poor web information architecture

**Evidence.** `packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx` exposes a large feature set—insights, students, assignments, lessons, library, notes, attendance, inventory, echo, observations, analysis, and legacy—inside a single classroom dashboard. The feature list is a tab-like control inside one route. `packages/classroom/src/screens/StudentDashboard.web.tsx` renders a `WorkspaceCanvas` with movable/hidden/pinned surfaces. `packages/classroom/src/screens/ClassroomScreen.web.tsx` resolves principal, teacher, and student dashboards under one classroom list route.

**Inference.** The container-job mismatch is substantial: a classroom is a continuing work context, but many features are presented as sibling islands or a broad feature switcher. This can feel powerful to implementers and overwhelming to users. Web needs a stable information architecture with a classroom context header, one primary work area, and secondary tools that are discoverable without making every capability a top-level peer.

**Severity.** High task-completion and cognitive-load risk.

**Recommendation.** Keep role/capability resolution and the underlying feature registry. Redesign the web classroom as a contextual workspace: persistent classroom identity, a small set of primary lanes, contextual sub-navigation, and a right-side or drawer utility region for secondary tools. Use tables, split panes, and progressive disclosure where comparison or monitoring is the job. Treat the mobile workspace canvas as a related dialect, not the web's final information architecture.

### 6. Concrete navigation payload mismatch in student dashboard

**Evidence.** `packages/classroom/src/screens/StudentDashboard.web.tsx` sends `classroomId` and `classroomName` to `/self` in `onOpenClassroom`. The canonical student classroom destination is `apps/gurudevi-mobile/app/(tabs)/workspace/classroom/student/[classroomId].tsx`, whose package screen reads `classroomId` from route params. `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx` already contains the intended classroom-aware dispatcher logic, but this web action bypasses it.

**Inference.** A user selecting a classroom from the student dashboard may be taken to Self with classroom params that Self does not use as the classroom destination. This is a semantic navigation failure: the tap's payload is not consumed by the intended destination.

**Severity.** Critical for the affected student task; independently verifiable from source without runtime.

**Recommendation.** Route the web action to `/workspace` with the existing dispatcher payload or directly to `/workspace/classroom/student/[classroomId]`. Add a route contract test that asserts the selected classroom ID is consumed by the destination. Do not redesign visuals around this flow until the payload chain is corrected.

### 7. Attendance web screen is visibly divergent from the active doctrine

**Evidence.** `packages/classroom/src/screens/AttendanceScreen.web.tsx` is a real web implementation with a 700px maximum container, inline HTML buttons, row-based student list, status chips, and a full-width save action. It uses raw status colors, raw inline spacing, and clickable `div` rows for changing attendance rather than an explicit button/control per row.

**Inference.** The narrow 700px container is appropriate for a simple form but underuses web space for a class roster. The row click target is ambiguous for keyboard and assistive technology users. Status chips and “Mark all” controls create multiple visual representations of the same job without a clear primary action hierarchy.

**Severity.** High accessibility and task-efficiency risk.

**Recommendation.** Use a responsive roster/table dialect: student identity stays left, status is an explicit segmented control or button group, bulk actions are in a sticky toolbar, and save state is anchored to the work surface. Preserve the current domain behavior and date context. Replace inline raw styling with semantic web tokens and proper focus/keyboard semantics.

### 8. Command palette is a good web affordance with doctrine-breaking implementation details

**Evidence.** `apps/gurudevi-mobile/src/components/web/CommandPalette.web.tsx` provides Cmd/Ctrl+K, arrow navigation, Enter activation, Escape close, a native HTML input, and route actions. It also routes to `/a-i-assistant` and `/qr`, while those paths are not present in the listed `apps/gurudevi-mobile/app` route inventory. It directly uses pure white/black colors and emoji glyphs.

**Inference.** The interaction model is appropriately web-native and should be retained, but some commands may be stale or unreachable, and visual implementation is outside the canonical token system. A command palette that advertises a destination which is not in the current route graph damages trust more than a missing shortcut would.

**Severity.** Medium interaction risk; high trust risk if stale commands are visible.

**Recommendation.** Derive command availability from the route/capability registry, trace every command to a live destination, and retain only commands whose payload is consumed. Rebuild the visual layer with semantic tokens and a real icon set. Keep keyboard-first behavior as part of the web dialect.

### 9. Marketing web is a coherent separate dialect, but its token ecology is not yet shared doctrine

**Evidence.** `apps/gurudevi-marketingWeb/src/components/Header.astro` provides a semantic header, desktop navigation, launch link, platform link, and an inert/focus-managed mobile menu. `apps/gurudevi-marketingWeb/src/styles/global.css` uses an editorial display font, content font, cream background, charcoal ink, saffron action, and large narrative sections with responsive grid-to-stack transitions. It also contains pure white-ish colors and raw values that differ from the mobile retina palette.

**Inference.** The marketing site has the strongest intentionally composed web layout in the inspected set: it is scenic/editorial and narrative rather than operational. It should not be flattened into the authenticated platform shell. However, the family resemblance should come from semantic roles and material logic, not two unrelated palettes.

**Severity.** Low immediate usability risk; medium brand-system drift.

**Recommendation.** Preserve the marketing site's editorial pacing, serif display typography, hero composition, and public trust posture. Align only the shared doctrine—semantic ink, vellum/ground logic, saffron/green/aurora roles, focus treatment, motion restraint, and accessibility—not its grid, density, or navigation.

## What can remain shared vs. what must differ

### Shared doctrine that should remain

- Semantic token roles for ground, surface, chrome, text, active, focus, success, warning, danger, and inverse states.
- Warm, readable contrast and no accidental pure-black/pure-white dependency where the active design constitution forbids it.
- Sanctuary material logic: atmosphere and depth are selective, not a card/glow applied everywhere.
- Motion temperament: breathe, drift, settle, and bloom for meaningful moments; reduced motion must remain respected.
- Component anatomy and state contracts: loading, empty, offline, error, disabled, selected, and success states.
- Capability/permission resolution, data hooks, route payload contracts, and canonical IDs.
- Accessible focus rings, labels, keyboard reachability on web, and touch target safety on mobile.

### Web dialect that must differ from mobile

- Side rail/topbar and browser history/URL state instead of bottom tabs as the primary global navigation.
- CSS Grid/container queries, tables, split panes, and multi-column comparison where the job benefits from width.
- Hover, focus, keyboard shortcuts, native anchors, and context menus where appropriate.
- Larger working surfaces with explicit readable-width limits; avoid stretching every mobile card to full desktop width.
- Centered web modals/popovers and anchored utility panels instead of assuming a bottom sheet.
- Denser operational views for classroom/library work, but with clearer progressive disclosure and fewer equal-weight cards.
- Marketing narrative composition remains Astro/Svelte and public-facing; it should not inherit the authenticated app's operational shell.

### Mobile dialect that should remain mobile-specific

- Bottom-tab reachability, safe-area behavior, haptic confirmation, gesture-first sheets, and thumb-sized action placement.
- Compact sequential flows where a phone screen benefits from one decision at a time.
- Native visual treatments such as Skia where they materially improve mobile atmosphere and performance.

## Prioritized redesign program

1. **P0 — Correct route semantics.** Fix student classroom navigation and add payload-consumption tests. Audit command-palette destinations before further polish.
2. **P1 — Establish the web surface contract.** Define shell bands, content widths, primary action placement, overflow rules, focus behavior, and state anatomy for web.
3. **P1 — Recompose Self.** Reduce simultaneous jobs, replace emoji-as-identity, and create a calmer continuous arrival/practice/review composition while preserving wellbeing capabilities.
4. **P1 — Recompose classroom workspace.** Turn the feature switcher/canvas into a contextual web workbench with stable primary lanes and progressive disclosure.
5. **P1 — Tokenize web variants.** Migrate raw palette/spacing/status values in `packages/self`, `packages/classroom`, and `apps/gurudevi-mobile/src/components/web` to semantic web tokens/CSS variables.
6. **P2 — Upgrade dense web surfaces.** Prioritize attendance, gradebook, library, profile, and notifications for grid/table, keyboard, and browser-native interaction patterns.
7. **P2 — Validate at real widths.** Capture runtime screenshots at compact, tablet, desktop-expanded, and desktop-collapsed states; test light/dark/phase, long labels, Sinhala/Tamil, empty/loading/error, reduced motion, and keyboard-only flows.

## Evidence ledger and confidence

| Finding | Evidence type | Confidence |
|---|---|---|
| Three-band shell exists and is unit-tested | Live code + test | High |
| Web/mobile shells are intentionally different | Live route/layout code + web guide | High |
| Token/raw-value drift exists | Live source inspection | High |
| Self has competing jobs and visual fragmentation | Spatial reconstruction + manual notes | Medium; screenshot needed |
| Classroom needs a web IA reset | Live feature topology + spatial inference | Medium-high |
| Student classroom payload mismatch | Live route and handler tracing | High |
| Marketing site is a separate coherent dialect | Live Astro/CSS inspection | High |

This document is an audit, not an implementation plan or code change. It intentionally leaves source files untouched and identifies where the integrated implementation plan should preserve behavior while allowing a genuine web redesign.
