---
title: "Gurudevi Native Mobile UI Audit"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
tags: [mobile, ui, ux, audit, gurudevi, self, community, library, profile, workspace, onboarding]
---

# Gurudevi native mobile UI audit

## Executive finding

The native app has a real product spine and several good foundations: a five-tab shell, role-aware Workspace dispatch, offline-first language in Self, reusable loading/error/empty primitives, and explicit native/web entry points. The phone experience is not ready for a polish pass, however. The highest-leverage work is a structural redesign of the authenticated shell and primary surfaces, followed by targeted fixes.

The dominant native risk is not one bad color or missing component. It is a mismatch between the intended calm, reflective phone experience and the current composition: Self exposes too many tiny, emoji-led controls and three separate temporal controls; Profile presents a long static stack; Community combines feed, groups, messages, announcements, presence, and creation actions in one scrolling state machine; Library combines browse, contribute, collections, map, and review in a 1,279-line screen. These are redesign-level composition problems because local styling changes will not reduce job-count or navigation cost.

## Scope, evidence, and limits

### Evidence inspected

- Documentation SOP: `docs/docs-sop.md`.
- Required method and design references: `docs/files/fundamental/SKILL.md`, `docs/files/fundamental/02-ui-visual-design.md`, `docs/files/fundamental/03-ux-interaction-design.md`, `docs/files/fundamental/16-agent-ready-spacing-typography-ia.md`, and `docs/files/fundamental/27-screen-reading-method.md`.
- Relevant imported hypotheses, especially `docs/files/specialized/09-wellbeing-self-domain-audit.md`, `docs/files/specialized/11-community-domain-audit.md`, `docs/files/specialized/19-notifications-settings.md`, `docs/files/specialized/20-self-tab-ui-operationalization.md`, `docs/files/specialized/21-workspace-tab-ui-operationalization.md`, `docs/files/specialized/22-workspace-canvas-redesign.md`, `docs/files/specialized/24-profile-tab-full-arc.md`, `docs/files/specialized/25-library-tab-full-arc.md`, and `docs/files/specialized/30-global-header-audit.md`.
- Live route and shell code under `apps/gurudevi-mobile/app`, `apps/gurudevi-mobile/src`, and shared UI/domain code under `packages/ui`, `packages/self`, `packages/community`, `packages/library`, and `packages/profile`.

### Limits

No running-device session or runtime screenshots were available in this audit. Spatial judgments are therefore reconstructed from JSX/layout values and platform branches, not observed pixels. Contrast, clipping, keyboard avoidance, safe-area behavior, animation feel, scroll performance, and actual offline/cache behavior need runtime verification. Imported documents were treated as hypotheses and re-traced where possible; findings explicitly marked “risk” or “verify” are not confirmed production defects.

## Canonicality map

The live native path is:

`apps/gurudevi-mobile/app/(tabs)/_layout.tsx` → tab route → package screen → domain components/hooks.

Key confirmations:

- Self: `apps/gurudevi-mobile/app/(tabs)/self/index.tsx` re-exports `@repo/self/screens/SelfScreen`; role-specific native screens converge on `packages/self/src/components/BaseSelfView.tsx`.
- Community: `apps/gurudevi-mobile/app/(tabs)/community/index.tsx` exports `CommunityScreen`; the native implementation is `packages/community/src/screens/CommunityScreen.tsx`, with a separate `CommunityScreen.web.tsx`.
- Library: `apps/gurudevi-mobile/app/(tabs)/library/index.tsx` re-exports `LibraryScreen`; the native implementation is `packages/library/src/screens/LibraryScreen.tsx`.
- Profile: `apps/gurudevi-mobile/app/(tabs)/profile/index.tsx` chooses native or web at runtime; native composition is `packages/profile/src/screens/ProfileScreen.tsx`.
- Workspace: `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx` is a real role/param dispatcher, not the dashboard itself. It redirects to role and classroom routes under `apps/gurudevi-mobile/app/(tabs)/workspace`.
- Onboarding: `apps/gurudevi-mobile/app/onboarding.tsx` delegates to `packages/ui/src/screens/OnboardingWrapper.tsx` and `packages/ui/src/screens/OnboardingScreen.tsx`.
- Global shell: native tabs and header are `apps/gurudevi-mobile/app/(tabs)/_layout.tsx` and `packages/ui/src/components/GlobalHeader.tsx`; the web shell is intentionally separate in `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx`.

This means fixes should be made at the package-owned shared layer when the evidence is shared. Route files are mostly canonical adapters and should not become a second design system.

## Cross-cutting spatial and visual assessment

### What is working

- The native tab bar has five familiar destinations and 40dp header utility buttons in `apps/gurudevi-mobile/app/(tabs)/_layout.tsx`.
- The app has a token vocabulary in `packages/ui/src/tokens.ts`, theme exports in `packages/ui/src/theme/Theme.ts`, and branded state primitives such as `BrandPulse`, `BrandedErrorState`, and `BrandedEmptyState`.
- `packages/ui/src/components/NetworkStatusBanner.tsx` provides a global connection signal, while Self also explains what offline mode means locally. This is the right direction for an offline-first product, although duplication needs composition rules.
- The 4dp/8dp/16dp/24dp/32dp/48dp rhythm and Calm/Standard/Dense classification in `docs/files/fundamental/16-agent-ready-spacing-typography-ia.md` are usable audit criteria and broadly match several existing `className` tokens.

### Confirmed cross-cutting problems

1. **P1 — Styling discipline is visibly split.** `packages/ui/src/tokens.ts` defines one semantic system, `packages/ui/src/theme/Theme.ts` defines another exported vocabulary, while `packages/self/src/components/BaseSelfView.tsx` and `packages/ui/src/components/GlobalHeader.tsx` mix token classes with raw colors and arbitrary values. Examples include `#F5F3FF`, `#FFF7ED`, `#8B5CF6`, `#EBE5FA`, `#5B3FD6`, `#1A1610`, 72/104 widths, 9/10/11px labels, and `paddingHorizontal: 20` in Self. Evidence: `packages/self/src/components/BaseSelfView.tsx:123-205` and `:235-305`. Inference: adjacent states can drift in contrast, emphasis, and density even when they belong to one feature. Recommendation: define one native semantic surface/ink/accent/state layer, then migrate keystone components first; do not begin with one-off hex replacement across every screen.

2. **P1 — The global native header hides a high-frequency job behind an ambiguous affordance.** `packages/ui/src/components/GlobalHeader.tsx:193-329` puts back/menu, identity, title, and a three-dot “More” control in the primary row; Search and Notifications are revealed below it. The imported header audit correctly identifies this as a placement and job-count issue. Recommendation: promote Notifications to a direct, labeled or badge-bearing control where space permits; keep Search contextual to Library; remove or rename “More” if it has no remaining distinct job. This is a fix to the shell, not a page-level workaround.

3. **P1 — Touch-target compliance is inconsistent in the most dense native surface.** The native tab shell uses 40dp controls, below the 44pt/44dp floor recommended by `docs/files/fundamental/03-ux-interaction-design.md`; Self feature targets are 72dp wide but the visual label is 9px and the actual affordance is an emoji circle with stacked indicators. Many header and feature `Pressable`s omit explicit accessibility labels/hints. Recommendation: use a named 44dp minimum control token, expand hit slop where visual size must stay calm, and make every icon-only control announce its job.

4. **P1 — Native/web/tablet are intentionally different, but the breakpoint contract is not coherent.** `apps/gurudevi-mobile/src/lib/responsiveShell.ts` uses native tablet at 768dp and web bands at 920/1280px, while `packages/ui/src/tokens.ts` uses 600/1024 breakpoints and `packages/self/src/components/BaseSelfView.tsx` derives tablet from orientation and width. Evidence: `apps/gurudevi-mobile/src/lib/responsiveShell.ts:1-190`, `packages/ui/src/tokens.ts:85-112`, and `packages/self/src/components/BaseSelfView.tsx:47-50`. Inference: the same physical tablet can receive different density and composition rules depending on which package owns the screen. Recommendation: establish one compact-phone / regular-tablet contract for native, then allow web compact/tablet/desktop to diverge as a separate composition system. Do not force web’s rail/topbar onto native phone.

5. **P2 — Raw primitives remain in shell-level fallback states.** `apps/gurudevi-mobile/app/_layout.tsx` uses generic `Spinner` in bootstrap and Workspace loading, while the branded guidance says new loading states should use `BrandPulse`. Evidence: `apps/gurudevi-mobile/app/_layout.tsx`, `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:14-21`, and `packages/ui/src/components/BrandPulse.tsx`. Recommendation: standardize only after checking whether the native spinner communicates progress better in boot/security contexts; the app-lock screen may deliberately remain a high-contrast security state.

## Prioritized surface findings

### P0 — Fix before visual polish

#### Workspace classroom selection can be discarded

Evidence: `packages` documentation identifies the issue, and the live code confirms the structural risk. `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx:8-76` reads `classroomId`/`classroomName` and forwards them only when it redirects. The destination wrappers are mostly adapters, while the classroom list/dashboard implementations are package-owned. The imported audit traces the upstream tap from ClassroomList and reports that `/workspace` can discard a selected classroom before the eventual classroom screen chooses data from its own hook.

Inference: for multi-classroom teachers, the visible selection may not control the loaded classroom. This is a navigation payload correctness issue, not a style issue.

Severity: P0 if reproduced with two classrooms; it undermines trust in Workspace’s primary daily task. The exact current production manifestation still needs a runtime two-classroom test.

Recommendation: make the selected classroom ID a single source of truth from list tap to dashboard query; add a route-level test that taps classroom A and classroom B and asserts distinct destination data. Do not redesign the canvas until selection semantics are fixed.

#### Native Self has too many competing temporal jobs

Evidence: `packages/self/src/components/BaseSelfView.tsx:235-407` renders GlobalHeader, `TemporalNavigator`, `TemporalShellControls` with Now/History, and a second scale row with day/week/month/year. The active feature row then changes the content below it. `docs/files/fundamental/27-screen-reading-method.md` explicitly warns that the date navigator, mode toggle, and scale selector can become three versions of the same “when” job.

Inference: a calm phone surface is front-loaded with temporal chrome before the person reaches the wellbeing action. This is especially problematic for a screen whose primary job should be reflection or a quick check-in.

Severity: P0 redesign candidate for Self’s primary phone composition; not safely solvable by shrinking controls.

Recommendation: redesign the phone entry around one temporal control: “Today / Review” with scale selection inside Review, or a bottom sheet. Keep scroll and zoom conceptually separate in the data model, but do not expose all axes simultaneously. Preserve the deeper temporal capability for History screens.

### P1 — High-leverage fixes and redesigns

#### Self feature rail is visually dense and fragile

Evidence: `packages/self/src/components/BaseSelfView.tsx:145-211` renders a horizontal list of 72/104dp items, 64dp circles, emoji, pin badge, history badge, active dot, and 9/11px uppercase labels. It also uses `onLongPress` for pinning without visible instruction.

Inference: the feature rail is a control palette disguised as calm content. Tiny uppercase labels and two badges on a small circle violate the spatial-first guidance on stacked indicators and make the long-press behavior discoverability-poor. The active feature changes the entire content region, so the rail carries navigation, filtering, and mode selection jobs at once.

Severity: P1 on phone; P2 on regular tablet where the extra width helps but does not fix comprehension.

Recommendation: reduce the default set to one primary action plus a short “More practices” list/sheet; replace emoji-as-chrome with consistent icons or illustrated assets; move pin/history metadata into the detail header; expose a visible edit/customize affordance instead of relying on long press. This is a redesign of the Self launcher, not a badge tweak.

#### Profile exceeds the Calm-tier chunk budget

Evidence: `packages/profile/src/screens/ProfileScreen.tsx:309-651` renders a static ScrollView with identity, completion, journey/stats, social or institutional material, notification settings, support/app experience, logout, and destructive account actions. The imported profile audit counts approximately seven sections and confirms no accordion/progressive disclosure in the native composition.

Inference: the screen asks a reflective identity surface, account configuration, notifications, support, and irreversible actions to share one vertical hierarchy. A static stack makes the first visit feel longer than the identity job warrants and increases accidental proximity between low-frequency destructive actions and everyday profile content.

Severity: P1 redesign candidate.

Recommendation: split Profile into a calm identity landing surface plus explicit sub-screens/sheets for Settings, Notifications, Privacy, and Support. On phone, keep Identity and one progress/journey summary visible; put the remaining groups behind disclosure or routes. Keep web’s richer multi-column treatment separate rather than shrinking it into mobile.

#### Community is a multi-surface hub without a phone-level priority model

Evidence: `packages/community/src/screens/CommunityScreen.tsx:163-820` manages posts, groups, direct messages, announcements, temporal mode, offline state, FAB actions, presence, and several content modes in one native screen. It uses a ScrollView for multiple modes and routes groups via `handlePostPress` and related handlers around `:307-369`. The screen has loading, error, and offline branches around `:566-606`.

Inference: the implementation is defensive, but the person’s first mental model is unclear: is Community a feed, a group directory, a message inbox, or a school announcement surface? A single FAB can also become overloaded when creation has post and group jobs.

Severity: P1 composition redesign; the existing loading/error mechanics are a positive foundation.

Recommendation: make Feed the default phone surface; expose Groups and Messages as explicit segmented destinations or secondary routes; reserve Announcements for a visible priority shelf only when present; split the FAB into a single “Create” sheet with labeled actions. Keep the web multi-column hub if it proves useful at larger widths, but do not mirror its information architecture onto phone.

#### Library monolith increases user and implementation coupling

Evidence: `packages/library/src/screens/LibraryScreen.tsx` is 1,279 lines and contains shelf rendering, filters, search, bookmarks, collections, map/review navigation, contribution, action sheets, loading/error/refresh, and resource opening. The live navigation sends document/video payloads at `:526-535`, map/review at `:765-771`, and collection IDs at `:839-845`; destination screens consume their IDs in `packages/library/src/screens/ResourceHubScreen.tsx`, `DocumentViewerScreen.tsx`, `VideoPlayerScreen.tsx`, and `CollectionDetailScreen.tsx`.

Inference: payload tracing for the main resource routes is healthy, but browse and contribute are still one conceptual surface. A contributor action can compete with the reader’s primary job, particularly when the FAB is visible on the same screen.

Severity: P1 redesign/architecture boundary; not evidence that every current route is broken.

Recommendation: separate Browse, Collections, and Contribute/Review as distinct phone destinations. Keep one shared resource-card primitive across browse and curation, as suggested by `docs/files/specialized/25-library-tab-full-arc.md`. Treat Map as an exploratory mode entered from Browse, not a competing first-order tab on narrow screens.

#### Global header token and placement drift

Evidence: `packages/ui/src/components/GlobalHeader.tsx:199-207` uses raw `#F5EDD6` and `rgba(42,35,24,0.08)` while nearby components use class/token values. The native tabs layout separately creates Bell and Settings buttons with raw values in `apps/gurudevi-mobile/app/(tabs)/_layout.tsx:64-128`. The imported header audit confirms 32 usages and identifies the repeated More → secondary actions pattern.

Inference: the most repeated surface can make every screen feel slightly different from the token system, and the native tabs header may compete with GlobalHeader depending on which route renders which shell.

Severity: P1 keystone fix.

Recommendation: decide whether tab routes own the global header or package screens own it; remove double ownership. Then consolidate header surfaces, semantic tokens, direct notification access, and accessibility labels in one keystone component.

### P2 — Important but sequenced after structure

#### Onboarding is clear in intent but long for a phone gateway

Evidence: `packages/ui/src/screens/OnboardingScreen.tsx` defines seven total steps, a name step, capacity selection, multiple tour steps, skip/back/next controls, progress indicators, persisted progress, and error banners. `packages/ui/src/screens/OnboardingWrapper.tsx` refreshes profile after completion and reports failure through toast.

Inference: the flow has good recovery scaffolding, but seven steps plus tour copy can turn a gateway into a commitment before the user reaches the app. The fixed bottom action pattern in `TourStep` is appropriate, but needs keyboard and small-height runtime checks.

Severity: P2 now; promote to P1 if analytics show early abandonment.

Recommendation: separate “minimum viable setup” (name + capacity, with optional school context) from an interruptible in-app tour. Keep progress and resumability; make Skip explicit about what will remain available later. Validate with small-height phones and Sinhala/Tamil text expansion.

#### Workspace canvas should be constrained, not discarded

Evidence: the imported workspace docs confirm a real user-arranged canvas and a shared surface wrapper, while `docs/files/specialized/22-workspace-canvas-redesign.md` also notes the risk of freeform gesture complexity and unguarded pinned surfaces. The native route itself is a dispatcher, so the canvas lives below the route adapters.

Inference: a fixed dashboard redesign would remove a meaningful product differentiator. The problem is guardrails, surface count, and discoverability, not the existence of personalization.

Severity: P2 structural refinement after classroom selection is correct.

Recommendation: retain user arrangement; on phone use a single-axis vertical arrangement with a cap of roughly four pinned chunks, a visible drag handle, a non-drag fallback, and live drop-zone feedback. Keep richer 2D/tablet/web geometry only where the available space makes it legible.

#### Offline/loading/error states need one hierarchy

Evidence: Self has an inline offline notice and history read-only notice in `packages/self/src/components/BaseSelfView.tsx:255-268`; Community has local offline/error states in `packages/community/src/screens/CommunityScreen.tsx:566-606`; Library has loading/error/refresh branches in `packages/library/src/screens/LibraryScreen.tsx:1072-1213`; the root adds `NetworkStatusBanner` in `apps/gurudevi-mobile/app/_layout.tsx`.

Inference: users may receive a global banner plus a local message plus a control-level spinner for the same network condition. This can be correct when scopes differ, but no visible policy makes that distinction predictable.

Severity: P2 consistency fix, with P1 risk for destructive or unsynced actions.

Recommendation: define three levels: global connectivity, screen data freshness, and action sync status. Each level gets one visual treatment and one sentence of responsibility. Always say whether content is saved locally, stale, queued, or unavailable; do not rely on color alone.

## Phone ergonomics checklist

- Keep primary daily actions in the bottom thumb zone. Self’s key quick-log action is inside the active feature content, while temporal controls are near the top; test whether a user can log without grip change.
- Enforce 44dp minimum visual or hit target and at least 8dp separation for adjacent controls. The current 40dp header buttons and tiny Self labels need verification and likely expansion.
- Avoid hidden long-press as the only path for pinning. Provide an explicit visible affordance.
- Keep one-handed back navigation consistent. The native shell’s GlobalHeader menu/back behavior must not change meaning between tab root and nested detail routes.
- Test keyboard avoidance in onboarding, create-post/group, library contribution, chat, and profile editing. Static source does not prove correct IME behavior.
- Test Sinhala/Tamil expansion at the same hierarchy and touch sizes; do not solve translated overflow by shrinking below the specified chrome/content scales.
- Verify screen-reader labels for icon-only header, tab, FAB, badge, and feature controls. A visible emoji is not a sufficient accessible name.

## Navigation payload audit summary

Confirmed healthy or plausibly healthy traces:

- Library resource opening passes `resourceId` plus reader metadata to document/video routes; destination screens read the payload. Collection detail reads `id`; ResourceHub reads `resourceId`.
- Community group and direct-message destination implementations read `groupId`/`conversationId` from `useLocalSearchParams`. Public profile reads `id` or `userId`.
- Workspace role routing is explicit and easy to follow, but classroom selection has the highest-risk discard point and needs a two-classroom runtime test.

Navigation redesign principle: every visible choice must affect the next screen’s data or state. If a choice is only a filter/mode within the same screen, show that relationship locally; if it creates a durable destination, make the payload contract typed and testable.

## What to fix versus what to redesign

### Fix in place

- Preserve the existing shell and route canonicality while consolidating GlobalHeader ownership.
- Promote Notifications, add labels/hints, and meet touch-target requirements.
- Correct Workspace classroom payload propagation and add a regression test.
- Replace raw keystone colors/spacing with semantic tokens after agreeing on the canonical token source.
- Standardize global/local offline, loading, and error responsibilities.
- Keep existing Library and Community destination payloads where tracing confirms they are consumed.

### Redesign at composition level

- Self phone launcher and temporal chrome: one primary temporal model, fewer visible feature choices, progressive disclosure.
- Profile phone information architecture: identity landing plus sub-screens/disclosure for settings and support.
- Community phone hub: Feed-first with explicit Groups/Messages/Announcements destinations and a single creation entry point.
- Library phone IA: separate Browse from Contribute/Review and make Map a contextual exploration mode.
- Workspace phone canvas: retain personalization but constrain it to a vertical, accessible model; do not collapse it into a fixed desktop dashboard.
- Onboarding gateway: minimum setup first, tour later, with the existing resumability and recovery retained.

## Recommended implementation sequence

1. Reproduce and fix the Workspace classroom payload issue; establish route contract tests.
2. Choose the native token source and keystone shell ownership; consolidate GlobalHeader and notification placement.
3. Define the native compact-phone/regular-tablet composition contract and the three-level offline/state hierarchy.
4. Prototype the redesigned Self phone entry and Profile disclosure model with real screenshots on a small phone and regular tablet.
5. Split Community and Library phone IA at the route/surface level while preserving verified destination payloads.
6. Constrain Workspace canvas interactions and then refine onboarding based on runtime/device evidence.
7. Run a second visual audit with runtime screenshots, contrast checks, TalkBack/VoiceOver, keyboard, offline queue, and Sinhala/Tamil content.

## Audit conclusion

The native app should be treated as a distinct phone product surface, not as a smaller web shell. The repository already contains the ingredients for that direction—role-specific composition, platform files, offline signals, branded states, and responsive shell logic—but they are not yet governed by one phone-level job hierarchy. Fix the confirmed navigation and keystone shell defects first; redesign the high-job-count primary surfaces before investing in decorative polish.
