---
title: "Gurudevi UI Audit Integration and Redesign Plan"
status: "draft"
created: 2026-08-13
updated: 2026-08-13
author: "Codex"
tags: [gurudevi, ui-audit, mobile, web, tablet, landscape, typography, wellbeing, redesign]
---

# Gurudevi UI Audit Integration and Redesign Plan

## Executive decision

The current experience should not be treated as a polish-only project. The repository already has a promising shared visual doctrine and responsive infrastructure, but several primary surfaces are carrying too many jobs at once. The implementation program should therefore combine targeted fixes with composition-level redesigns.

The governing rule is: share the grammar, not the layout.

- Native phone: calm, tactile, single-axis, one primary decision at a time.
- Mobile landscape: a distinct spatial mode with split/paired regions where useful, not a stretched portrait layout.
- Native tablet: richer two-column or canvas compositions when reachability and reading order remain clear.
- Web compact: top navigation and reduced chrome, optimized for constrained browser widths.
- Web tablet/desktop: rail-based navigation, keyboard/pointer affordances, comparison-friendly layouts, and a deliberate canvas.

## Audit set

These independent audits are the inputs to this plan:

- [Native mobile audit](./2026-08-13-native-mobile-audit.md)
- [Gurudevi web/PWA audit](./2026-08-13-gurudevi-web-audit.md)
- [Compact, tablet, and canvas audit](./2026-08-13-compact-tablet-canvas-audit.md)
- [Wellbeing/self audit](./2026-08-13-wellbeing-self-audit.md)
- Mobile landscape and typography are included as an explicit integration workstream below, with the supplemental audit and responsive-shell implementation now landed.

The audits were grounded in the imported corpus under `docs/files/`, the live route tree, `packages/ui`, and the responsive shell. They were code/document audits, not runtime screenshot audits; visual validation remains a required implementation gate.

## What is already worth keeping

- `apps/gurudevi-mobile/src/lib/responsiveShell.ts` already recognizes `mobile`, native tablet, web compact, web tablet-compact, and web desktop.
- `packages/ui` already owns semantic theme tokens, breakpoints, layout helpers, loading/error/empty states, and responsive workspace renderers.
- The native and web tab layouts are intentionally separate, which is the correct architectural direction.
- The existing sanctuary vocabulary—vellum, silk, warmth, breathing, lotus, and restrained atmosphere—can become a coherent doctrine if raw styles and duplicate ownership are removed.
- Wellbeing flows already have a foundation of breathing/reset and reflection concepts; the main problem is prioritization and burden, not lack of ambition.

## Integrated findings

### P0: correctness before redesign

1. Verify and fix classroom-selection payloads end to end. Multiple audits found a route path where a selected classroom ID can be discarded or not consumed downstream. Add a two-classroom regression test and make the selected ID the single source of truth from tap to query/render.
2. Resolve global-header ownership. Decide whether the tab shell or feature screens own header actions. Remove duplicated notification/settings/profile affordances and consolidate accessibility labels, badges, and semantic tokens in one component.
3. Confirm workspace surface mutations and drag/reorder semantics before changing the canvas. A visually elegant canvas with ambiguous or unsynced movement will reduce trust.

### P1: composition-level redesigns

1. Self phone entry: reduce the default view to one temporal decision and one primary action. Put scale/history/secondary practices behind a review surface or bottom sheet. Do not solve this by shrinking type or controls.
2. Profile: make the landing surface an identity and journey summary. Move settings, privacy, notifications, and support into explicit destinations or sheets.
3. Community phone: make Feed the default surface; expose Groups and Messages as intentional destinations; keep announcements conditional rather than permanently competing with the feed.
4. Library phone: separate Browse, Collections, and Contribute/Review as distinct information architectures while sharing resource-card anatomy.
5. Workspace canvas: use a single vertical arrangement on phone, richer 2D only where tablet/web space supports it, and explicit zones for pinned, suggested, and user-arranged content. Make drag handles, drop feedback, and non-drag fallbacks visible.
6. Web attendance/classroom surfaces: redesign their information hierarchy instead of forcing native compositions into browser panels.

### P1/P2: typography and copy quality

The concern that “text is written in lots of places” is valid. The issue is not simply font choice; it is cumulative text density, repeated labels, weak chrome/content separation, and copy that makes every surface announce itself.

Create a content and type pass with these rules:

- One visible title per surface; do not repeat the tab title, screen title, and card title when they answer the same question.
- Use a two-scale system: content type for meaning and chrome type for navigation/status. Keep labels short enough to scan without turning them into miniature paragraphs.
- Replace repeated helper text with one clear sentence near the decision it explains.
- Prefer action labels that say what happens (`Review today`, `Create post`, `Open settings`) over vague labels (`Continue`, `Manage`, `View`).
- Audit English, Sinhala, and Tamil expansion before locking widths. Never solve localization overflow by dropping below readable type sizes.
- Keep decorative or devotional language concentrated in welcome/hero moments; operational screens should be warm but direct.
- Centralize recurring copy keys and remove near-duplicate labels across header, tabs, cards, empty states, and modals.

### P1/P2: mobile landscape

Mobile landscape must be specified as its own mode. At minimum, audit:

- safe-area handling and reachable primary actions at both edges;
- whether a top header plus bottom tab bar leaves enough vertical reading space;
- two-pane opportunities for Self history, Library detail, classroom lists, and Workspace;
- keyboard/IME behavior when landscape is triggered during text entry;
- canvas gesture conflicts, scroll direction, and drag targets;
- type wrapping and localized label expansion at short heights;
- whether the user can recover orientation without losing selection, draft, or scroll position.

Recommended default: landscape preserves the mobile interaction model but changes composition—compact top chrome, one primary content pane plus an optional secondary pane, and no forced desktop rail unless the device is clearly in tablet territory.

## Shared doctrine versus platform dialect

### Shared in `packages/ui`

- semantic color roles and chromatic shadows;
- spacing, type, radius, elevation, and breakpoint tokens;
- component anatomy and state vocabulary;
- accessibility minimums and focus/pressed/disabled/loading/error behavior;
- motion families: breathe, drift, settle, bloom;
- content-density tiers and localization-safe layout contracts.

### Native mobile dialect

- single-axis reading and touch-first controls;
- bottom sheets and progressive disclosure;
- restrained ornament and stronger reachability constraints;
- offline/sync state visible without turning every screen into a status dashboard.

### Web/tablet dialect

- rail/topbar switching by available composition space;
- keyboard, pointer, hover, focus, and command-palette affordances;
- multi-column comparison where it improves the job;
- richer canvas behavior only when the spatial model remains legible.

## Implementation sequence

### Phase 0 — evidence and guardrails

- Capture runtime screenshots for phone portrait, phone landscape, native tablet, web compact, web tablet, and web desktop.
- Add a route/surface inventory with canonical entry points and payload contracts.
- Create a content inventory for repeated titles, labels, helper text, and status messages.
- Establish acceptance criteria for readability, touch targets, localization expansion, and reduced-motion behavior.

### Phase 1 — correctness and ownership

- Fix classroom selection and navigation payload tests.
- Consolidate header ownership and semantic actions.
- Align breakpoint/token sources so `packages/ui` and `responsiveShell.ts` do not drift.
- Define explicit sync/status semantics: connectivity, data freshness, and action sync state.

### Phase 2 — type and copy foundation

- Define content/chrome type tokens and per-breakpoint type decisions.
- Remove duplicate visible labels and centralize copy keys.
- Test Sinhala/Tamil/English at portrait, landscape, compact web, and tablet widths.
- Replace raw colors, one-off spacing, emoji-as-chrome, and unlabelled icon-only actions where they undermine clarity.

### Phase 3 — native composition redesign

- Redesign Self phone entry.
- Simplify Profile and Community phone information architecture.
- Split Library phone modes while preserving shared resource primitives.
- Define landscape-specific compositions and state restoration behavior.

### Phase 4 — Workspace/canvas redesign

- Implement phone single-axis zones with visible reorder affordances and fallback controls.
- Finish tablet/web canvas behavior with explicit pointer/keyboard semantics.
- Keep user arrangement, but make pinning, hiding, and zone movement visibly different operations.

### Phase 5 — web composition

- Refine compact web without treating it as a shrunken desktop.
- Redesign web classroom/attendance information hierarchy.
- Validate the rail, content max-width, header, command palette, and modal behavior across the three web bands.

### Phase 6 — visual validation and rollout

- Run screenshot-based audits for each platform/mode.
- Verify empty, loading, error, offline, stale, queued, and success states.
- Run accessibility, localization, reduced-motion, and touch/keyboard checks.
- Roll out by surface behind existing feature boundaries; do not mix visual redesign with native dependency or architecture changes.

## Decision framework for each screen

- **Fix in place:** one clear job, correct navigation/data, modest token or copy drift.
- **Refactor:** repeated ownership, token drift, state inconsistency, or component duplication across otherwise sound composition.
- **Redesign:** more than one primary job, fragmented continuity, overloaded phone surface, or a platform mismatch that cannot be solved with spacing.

## Implementation checkpoint — 2026-08-13

The first implementation tranche is now applied across the shared UI, native shell, web shell, Self, and Workspace slices:

- modal backdrops use native blur with a dim fallback and web backdrop blur;
- modal and toast semantics include labels, live-region behavior, safe-area placement, readable durations, and reduced-motion handling;
- native shell sizing now responds to portrait versus landscape dimensions;
- web navigation and command palette controls have visible focus treatment;
- Self entry copy, empty/error/offline states, shortcut feedback, and fallback colors use shared semantic roles;
- Workspace reordering has bounded movement helpers, keyboard/pointer fallback controls, and phone vertical-axis constraints;
- classroom selection regression coverage verifies the selected classroom ID survives navigation into distinct destinations;
- shared typechecks and focused modal, toast, workspace, Self, shell, and routing tests pass.

This is a foundation tranche, not a claim that every screen is visually complete. Remaining work is screenshot/runtime validation, broader surface-by-surface composition redesign, localization expansion testing, and resolving the existing full-UI Jest transform limitation around `lucide-react-native` ESM modules.

The next native composition tranche is also implemented:

- Profile now leads with identity and journey, progressively disclosing secondary account/support material and adapting its card spacing for short landscape.
- Community is Feed-first, with explicit Feed/Circles/Messages/Announcements destinations and quieter short-landscape chrome.
- Library separates Browse, Collections, and Contribute & Review while preserving resource, collection, map, and review payloads.
- `responsiveShell.ts` now exposes explicit phone portrait, phone landscape, short-height landscape, tablet portrait, and tablet landscape modes plus localized text-width budgeting.
- The shared global header removes emoji-as-chrome, labels its icon actions, tokenizes status colors, and reduces duplicate vertical copy in short landscape.
- Web Profile, Community, and Library now have compact-web breakpoints and explicit hierarchy/focus/state semantics while preserving their desktop compositions and route payloads.

Code-level validation after this tranche: the mobile app suite passes 22 test files and 99 tests; Profile, Community, and Library each pass package typecheck and test suites; the responsive-shell suite passes 7 tests; and the shared UI modal/toast/workspace suites pass. A local Expo web process did not expose a listening port in the available runtime window, so browser screenshots and physical-device validation remain an external/runtime gate rather than being claimed here.

The secondary-route consistency pass is also implemented:

- Community secondary routes now use branded loading, clearer offline/empty/error copy, retry semantics, and labeled search/actions.
- Library resource, map, collection, and curator-review routes now use branded loading/error/empty states, accessibility state labels, and semantic theme colors.
- Profile full/public/mute/claim routes now use branded loading/error/empty states, semantic colors, accessible retry/status behavior, and less decorative chrome.
- Workspace entry routes and Self wisdom detail now use the branded loader and semantic colors instead of generic spinners/raw accent values.

Runtime evidence status: Expo Web reached a successful Metro bundle during a static export attempt, but the export process terminated with native exit code `3221225477` before producing a runnable browser session. The device-control doctor found no local Android/iOS device and also reported the local Node engine is `24.11.0` while the workspace declares `>=22.23.0 <23`. Therefore screenshots, modal blur inspection, and physical landscape verification remain unproven until a supported Node runtime and device/browser session are available.

2026-08-14 runtime follow-up: the supported Node `22.23.2` runtime plus Doppler now produces a complete Expo Web static export, including the public runtime values required by the credential guard. A Playwright matrix was attempted at phone portrait, mobile landscape, compact tablet, and desktop sizes; after fixing missing community contract coverage there were no page errors, but the rendered page remained black/visually empty with only static shell markup. Browser UI, modal blur, toast placement, and landscape interaction therefore remain unproven. An Android device is visible and booted through ADB/device control, but the native build is blocked in `react-native-nitro-modules` CMake/Ninja processing by Windows path length in the pnpm store; a roughly 9m40s direct Gradle attempt produced no APK. The exact environment, timings, failed approaches, and durable next options are recorded in `2026-08-14-real-device-runtime-validation.md`. Code validation remains clean: `@repo/ui` and `gurudevi-mobile` typechecks pass, and `git diff --check` passes.

2026-08-14 blank-root diagnosis: the router was mounted, but `PowerSyncProvider.web.tsx` returned `null` before OPFS/WASQLite initialization. This affected signed-out startup because there was no account to initialize. The provider now keeps the route tree mounted while sync is unavailable and is scoped to the authenticated tab layouts instead of the root shell on native and web. Metro recognizes all Expo web platform invocation forms. A fresh static export and mobile typecheck pass; browser screenshots still require a fresh runtime check after this fix.

2026-08-14 landscape composition tranche: Self now switches from the portrait horizontal feature strip to a compact vertical feature rail beside the active content on native landscape, while portrait and tablet flows retain their existing reading order. The native tab bar now hides labels in short-height landscape and hides itself while the keyboard is open. `@repo/self` tests (2 files, 8 tests), `@repo/self` typecheck, and the mobile app typecheck pass.

2026-08-14 web classroom tranche: Attendance now uses semantic status tokens, localized attendance labels, live loading/error/success announcements, keyboard-operable student rows, explicit button labels/busy state, and a wider responsive reading frame. The classroom empty state replaces emoji-as-chrome with a labeled school icon. Gradebook now uses the branded loading treatment and labeled navigation/settings actions. `@repo/classroom` typecheck passes; the package currently has no test files, so browser interaction remains a required validation gate.

The same copy/chrome pass now covers the web no-school flow: success states and school-type choices use labeled icons instead of emoji, loading states use the branded pulse, and join-method tabs use icon-plus-text labels rather than emoji-prefixed copy. `@repo/classroom` typecheck remains clean.

The shared web header now keeps greeting copy text-only and uses initial-based avatar fallbacks rather than role or time-of-day emoji. This keeps role context legible in compact web and avoids decorative glyphs changing typography metrics across locales.

The loading-state tranche now replaces generic spinners in the primary auth/welcome/onboarding/QR/form routes and classroom attendance/gradebook flows with `BrandPulse` and accessible loading labels. App and classroom typechecks remain clean.

The same state vocabulary is now wired through the remaining gradebook save/settings actions and native attendance roster loading, so classroom progress feedback does not change component language between web and native.

The Community web feed and conversations states now use `BrandPulse` with explicit live-region labels instead of generic spinners. Community package typecheck passes; browser interaction and visual verification remain part of the runtime gate.

The Self dashboard section library now uses `BrandPulse` for its inner resonance, emotional flow, instructional energy, wisdom, practice, reflection, presence, and progress states. Accent colors are retained as semantic visual cues and each loading state has an accessible label. `@repo/self` and the mobile app typechecks pass.

Self’s web micro-interactions now use the same treatment for daily-content loading and save actions in reminders, tomorrow planning, and mood logging. These controls retain their action-specific tint and expose a readable busy label instead of switching to generic system spinners.

Profile microstates now follow the same rule for the living-journey panel and avatar upload overlay. `@repo/profile` typecheck and repository whitespace validation pass; the remaining generic spinner inventory is tracked as follow-up work for lower-frequency classroom/library/editor modals.

Classroom action modals now use branded, labeled progress feedback for invitation claiming, school/classroom creation, global classroom creation, and assignment submission on both native and web. `@repo/classroom` typecheck passes.

The remaining high-visibility Community/Self microstates now follow the same convention: invitation-code validation, privacy ledger, community presence, mood save/history, and journey timeline loading all expose branded feedback with task-specific labels. Community and Self typechecks pass.

Classroom roster, holistic-insights, infinite-scroll, and native gradebook loading now use the same branded feedback. Library’s student-analysis modal also now labels export, analysis, AI-insight, and save progress states. Classroom and Library typechecks pass.

The copy/chrome inventory also removed generic emoji-as-chrome from the web group-chat empty state and the Self goals list, replacing it with labeled iconography while preserving expressive wellbeing content where the emoji is part of the feature meaning. Community and Self typechecks pass.

The font-scaling audit command was repaired to delegate through the Expo/Jest transform instead of importing React Native from plain Node. It now passes four checks across 100%, 150%, and 200% scale fixtures, including `allowFontScaling` on heading/body/caption hierarchy. This is a transform-level contract check; physical-device visual overflow validation remains part of the runtime gate.

The shared UI `Text` and `Heading` primitives now default `allowFontScaling` to true while preserving explicit opt-out support for exceptional visual elements. UI and mobile typechecks plus the font-scaling audit pass.

The root i18n check is now cross-shell: its combined command delegates sequentially through Node instead of relying on PowerShell-incompatible `&&` parsing. `pnpm i18n:check` passes both locale-key and inline-fallback audits.

The contrast audit was likewise moved behind the Expo/Jest transform, and its semantic pair matrix exposed a real defect: `errorText` did not meet WCAG AA on `errorBackground`. The token is now a darker accessible red, and the contrast audit passes alongside UI/mobile typechecks.

Fresh web export validation after the latest changes completed successfully in approximately 65 seconds and served HTTP 200. The bounded browser inspector still timed out before producing a root snapshot, so modal blur, toast placement, and visual responsive behavior remain unclaimed until a browser session yields non-empty committed DOM evidence.

2026-08-14 runtime isolation: a fresh browser session produced committed DOM and exposed React error #130 only when root overlays were restored. The failing path was the open PDPA consent dialog using the shared `Shield` icon export. The web `UniversalModal` was also hardened to use direct semantic DOM elements with an 8px blurred backdrop, avoiding the invalid primitive-barrel component path. With the consent icon omitted pending a web-safe icon export, the complete root shell rendered with HTTP 200 and no React errors; only expected browser capability warnings remained. Native overlay behavior remains unchanged.

2026-08-14 follow-up: the PDPA shield is now platform-specific—native retains the Lucide component, while web uses a semantic inline SVG—so the consent dialog regains its visual affordance without depending on the incompatible web icon export. Classroom’s remaining high-visibility full-screen loading states now use `BrandPulse` with progress labels across notes, echoes, student analysis, assignments, observations, gradebook, and student profile. Classroom typecheck passes; the browser export/runtime check remains clean with HTTP 200 and no React errors.

Shared UI loading pass: provider boot, network sync banner, chat composer, conversation sheet, notification settings, presence, history timeline, lotus loader, device security, guest-data sync, poll, internal browser, and lifecycle monitor now use `BrandPulse` for branded waiting states. UI typecheck passes; compact action-button spinners remain intentionally preserved where they communicate a button-level in-flight operation.

Toast feedback pass: the queue-based `ToastProvider` now exposes the same manual dismissal affordance as the legacy sanctuary toast, with accessible label and hint. The existing queue timing, polite alert semantics, reduced-motion behavior, and minimum readable duration remain covered; the toast suite now passes four tests.

Copy/chrome follow-up: removed decorative emoji from active Library shelf and visibility labels, classroom pinned-note grouping, and onboarding error banners. Expressive wellbeing imagery remains intentionally retained where it is feature content rather than control/status chrome. UI, Library, and Classroom typechecks pass.

Error fallback pass: the shared boundary now uses an explicit dark browser-safe surface, accessible high-contrast retry button colors, and a typography-stable `!` status glyph instead of an emoji fallback. UI typecheck passes.

Native onboarding chrome pass: role cards and the five sanctuary-tour steps now use shared Lucide glyphs instead of emoji, keeping icon geometry and color consistent across fonts and mobile landscape. The web onboarding composition remains intentionally separate and uses inline SVG glyph geometry for pillars, roles, tour steps, and setup states, avoiding platform-dependent emoji rendering. UI typecheck passes.

Web onboarding validation pass: the web export completed with zero reported findings, and the bounded Chromium runtime inspector returned HTTP 200, the expected Gurudevi document title, committed root HTML, and no React errors. Remaining browser diagnostics are expected capability warnings for push notifications, Google Sign-In fallback, and Playwright service-worker isolation. Native device validation remains blocked by the documented Windows Nitro/CMake path-length failure.

## Non-negotiable implementation constraints

- App-specific docs remain under `apps/gurudevi-mobile/docs/` and follow the documentation SOP.
- Do not edit `android/` or `ios/`; native configuration changes belong in app config/plugins.
- Do not run `expo install --fix` or `expo prebuild --clean`.
- Keep RED/AMBER architectural changes behind the Gurudevi quality gate and write a feature spec before code changes in those zones.
- Use shared components/tokens before adding local variants; preserve separate native and web compositions.

## Open validation questions

- Which exact live route currently drops the classroom ID, and does the issue reproduce with two real classrooms?
- Which surface is the canonical owner of the global header on each platform?
- Which devices and orientations are supported for mobile landscape in the release target?
- Which repeated copy is user-facing product language versus implementation/debug text?
- Which wellbeing records are private by default, and how should shared/teacher-visible states be disclosed?

## Final assessment

Gurudevi has enough design and responsive infrastructure to support a strong product, but the next step is not to make every existing screen prettier. First make the routes, ownership, type/copy hierarchy, and platform compositions truthful. Then apply the atmospheric visual doctrine selectively—especially around Self and meaningful wellbeing moments—while keeping operational controls quiet, legible, and easy to reach.
