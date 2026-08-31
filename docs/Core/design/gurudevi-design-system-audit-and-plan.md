---
title: "Gurudevi Design System — Existing Audit and Figma Plan"
status: "active"
created: 2026-08-30
updated: 2026-08-30
author: "Codex"
tags: [gurudevi, design-system, figma, web, mobile]
---

# Gurudevi Design System — Existing Audit and Figma Plan

## Executive summary

Gurudevi already has the beginnings of a real design system, but the central problem is a large gap between design intent, token definitions, and implemented visual reality. The repo contains an active design constitution, semantic tokens, temporal light/dark worlds, shared UI primitives, a lotus asset, and a newly emerging firefly feedback language. That does not mean the product consistently renders those decisions today.

The governing model for this work is: **implementation reality → gap diagnosis → target system → migration**. The docs are intent, the code and rendered screens are current reality, and Figma becomes the reviewed target state plus the migration map. Figma must not be treated as proof that the product already matches the constitution.

The proposed system is a shared doctrine with two platform dialects:

- **Shared doctrine:** sanctuary calm, warm ink on living surfaces, lotus as the enduring mark, firefly as the guide through change, accessible contrast, and motion that breathes / drifts / settles / blooms.
- **Mobile dialect:** tactile, safe, calm, thumb-friendly, lower density, expressive only at moments that need reassurance or orientation.
- **Web dialect:** more scenic and spacious, stronger narrative composition, richer hero and empty-state framing, while retaining the same token and component grammar.

## What already exists

### Source-of-truth and design governance

- `apps/gurudevi-mobile/docs/Core/design/GURUDEVI_DESIGN_MASTER.md` defines implementation truth, canonical design documents, and a change protocol.
- `apps/gurudevi-mobile/docs/Core/design/gurudevi-design-retina.md` defines the active aesthetic laws: vellum, warm ink, Shadow Violet, no pure white/black, living surfaces, temporal phases, five space signatures, and humane empty states.
- Additional canonical documents cover aesthetic doctrine, design language, scene-token hierarchy, token resolution, spaces, components, Skia implementation, and architecture.

### Tokens and visual vocabulary

- `packages/ui/src/tokens.ts` provides semantic colors, spacing, radii, breakpoints, typography roles, interaction targets, status colors, glass, overlays, skeleton materials, and performance limits.
- `packages/ui/src/theme/Theme.ts` provides the wider sanctuary palette, light/dark surfaces, phase vocabulary, semantic aliases, and typography foundations.
- Existing named vocabulary includes **vellum, silk, linen, ink, saffron, dalu green, aurora blue, aurora violet, lotus pink, Shadow Violet, dawn, dusk, night, sanctuary, classroom, community, library, and profile**.

### Brand assets and branded behavior

- `packages/ui/assets/images/lotus_bloom.png` is an existing lotus asset.
- `apps/gurudevi-marketingWeb/public/Gurudevi-logo.png` is an existing logo asset.
- `packages/ui/src/components/FireflyMascot.tsx` defines a compact firefly mascot with glowing, resting, and offline modes.
- `packages/ui/src/components/FireflyFeedbackScene.tsx` and `fireflyFeedback.ts` define an interaction metaphor: the firefly marks active, quiet, interrupted, and complete paths.
- `packages/ui/src/components/BrandPulse.tsx` uses the firefly as a living loading signal.
- `packages/ui/src/components/ErrorState.tsx` and `BrandedEmptyState.tsx` already use the firefly scene for recoverable errors and invitations to begin.
- `packages/ui/src/components/Success.tsx` distinguishes lightweight success checks from meaningful milestone glow.
- `packages/ui/src/components/Skeleton.tsx` provides responsive shimmer blocks, cards, and lists.
- `packages/ui/src/components-native/LivingCard`, `TemporalGlass`, and `NoiseOverlay` provide the beginnings of a selective atmospheric material system.
- `packages/ui/src/components/PressableScale.tsx`, focus-ring behavior, screen transitions, and layout helpers already support interaction and responsive adaptation.

### Existing implementation surfaces to audit in Figma

- Mobile onboarding, authentication, welcome, workspace, attendance, gradebook, AI assistant, QR, notifications, settings, and public forms.
- Web-facing Gurudevi marketing / narrative surfaces.
- Shared UI showcase and error-message demo screens in `packages/ui/src/screens`.
- Existing branded error, empty, loading, skeleton, success, modal, toast, dialog, form, list, navigation, and responsive-grid primitives.

## The current truth gap

### 1. Intent is more coherent than the rendered system

The design docs describe a disciplined world of semantic tokens, temporal phases, space signatures, chromatic shadows, selective atmospheric depth, and meaningful motion. The implementation has many of the ingredients, but they are not yet a consistently enforced visual contract across every screen.

### 2. Token vocabulary is split

`packages/ui/src/tokens.ts` and `packages/ui/src/theme/Theme.ts` both contain overlapping but different names and values. There are canonical semantic roles alongside legacy aliases and direct component-facing values. This creates drift risk: two components can express “primary,” “error,” “surface,” or “text secondary” differently while both appear valid in code review.

### 3. Brand behavior is newer than the surrounding UI

The firefly feedback components are a strong new direction, but the surrounding buttons, forms, navigation, overlays, and product screens still need to be evaluated against the same anatomy, state language, motion tempo, and content voice. A branded error state cannot carry the whole product alone.

### 4. Docs specify more states than components consistently expose

The constitution calls for light/dark, phase, space, reduced-motion, loading, empty, offline, error, success, warning, focus, pressed, disabled, and accessibility behavior. The next audit must verify each state in actual rendered surfaces, not just in token or component files.

### 5. Asset intent and asset usage are not yet fully governed

Lotus and firefly exist, but the repo does not yet provide a single, reviewed rule set for when each appears, which variants are allowed, how they scale, or how they behave in web versus native contexts. That ambiguity can make a brand feel inconsistent even when the colors are correct.

### 6. Visual QA is not yet the same as code QA

Type tests and component tests can pass while spacing, contrast, density, hierarchy, and composition still drift on real screens. The audit therefore needs rendered reference boards and screenshot comparisons for representative web and mobile surfaces.

## Reality-first audit matrix

| Layer | Current evidence | What must be verified | Intended output |
|---|---|---|---|
| Design intent | Active Gurudevi constitution and retina docs | Whether principles are precise enough to make decisions | Short, non-ambiguous doctrine |
| Tokens | `tokens.ts`, `Theme.ts`, motion and layout exports | Duplicate roles, divergent values, missing semantic states | Canonical token map + migration aliases |
| Shared components | `packages/ui/src/components` and `components-native` | Actual anatomy, states, platform differences, raw values | Component inventory with pass / partial / gap status |
| Product screens | `apps/gurudevi-mobile/app`, `src/screens`, web app surfaces | What users actually see at phone, tablet, desktop, light/dark | Representative screenshot audit |
| Brand assets | lotus PNG, logo PNG, FireflyMascot, FireflyFeedbackScene | Usage, scale, contrast, emotional meaning | Brand usage rules and Figma assets |
| Accessibility | Tests, focus behavior, font scaling, reduced motion | Whether visual intent survives real accessibility settings | Acceptance checklist and variants |
| Figma target | New system file / library | Whether it represents an implementable target | Reviewable source of truth, not a fantasy layer |

## Where the design system is needed

This is the full surface map, prioritized by leverage.

### Tier 1 — system foundations

1. **Brand foundation:** logo lockups, lotus mark, firefly mascot, clear-space, minimum sizes, light/dark use, monochrome fallbacks, and “lotus vs firefly” usage rules.
2. **Color and semantic themes:** light/dark world, temporal phase, space signatures, status roles, contrast pairings, and token naming.
3. **Typography:** English plus Sinhala/Tamil support, display / heading / body / label / meta roles, line-height, weight, truncation, and content density.
4. **Layout grammar:** spacing, page frames, max reading widths, responsive breakpoints, grids, safe areas, and web/mobile adaptation rules.
5. **Material and elevation:** vellum ground, silk surface, glass, quiet recess, elevated surface, chromatic shadow, grain, and blur limits.
6. **Motion language:** breathe, drift, settle, bloom, arrival, and reduced-motion behavior.

### Tier 2 — core components

7. Buttons, icon buttons, links, and action groups.
8. Inputs, text areas, selects, comboboxes, checkboxes, radios, switches, validation, and focus.
9. Cards, list rows, stat tiles, chips, badges, dividers, tabs, and progress.
10. Navigation: mobile tabs, web navigation, headers, breadcrumbs, back affordances, and workspace shells.
11. Overlays: dialog, modal, sheet, action sheet, popover, tooltip, toast, and banners.
12. Feedback: loading pulse, skeleton, empty, offline, recoverable error, blocking error, success, warning, permission, and maintenance states.

### Tier 3 — product patterns

13. Onboarding and invitation flows.
14. Workspace / role-based dashboards.
15. Classroom, community, library, self, and profile space templates.
16. Forms, public forms, submissions, attendance, grading, and QR flows.
17. AI assistant and long-running task states.
18. Notifications, activity, sync, retry, and offline-first patterns.
19. Marketing / narrative web sections: hero, proof, story, feature explanation, trust, CTA, and footer.

### Tier 4 — quality and operations

20. Accessibility: contrast, focus, touch targets, keyboard order, screen-reader labels, reduced motion, font scaling, and localization expansion.
21. Content guidance: humane error copy, empty-state copy, placeholder voice, and action labels.
22. Theme QA: light/dark × phase × space matrix, web/mobile screenshots, visual regression, and token drift checks.
23. Developer handoff: Figma variables, component properties, naming, code mapping, and migration notes.

## Brand roles: lotus and firefly

### Lotus — the enduring identity

Use the lotus for the brand mark, app icon, splash, high-level navigation identity, milestone / sanctuary moments, and calm “home” framing. It represents the place and the possibility of unfolding. It should feel still, balanced, and composed.

### Firefly — the responsive guide

Use the firefly for loading, progress, interruptions, offline, empty-state invitations, contextual guidance, and small moments of reassurance. It represents presence in motion: a small light that helps someone find the next step. It should feel warm, curious, and never childish or noisy.

### Guardrail

Do not use both as competing mascots in the same small surface. Lotus owns identity and belonging; firefly owns state and guidance. The lotus is the sanctuary. The firefly helps you move through it.

## Mascot production system

The character sheet is an art-direction prototype, not yet the production source. Reproducibility comes from separating the system into stable layers.

### Light and dark mode

Do not simply place the dark character-sheet artwork on a light background. The light-world version needs its own palette treatment:

- warm ink contour instead of near-black outline;
- saffron / apricot abdomen with a restrained inner light;
- vellum-cream wings with visible translucent veins;
- smaller, softer halo with no neon bloom;
- dalu or aurora accents only where the state needs them;
- no heavy dark vignette or sticker-like shadow.

The dark-world version can keep deeper ink contours, stronger bioluminescence, and violet atmospheric depth. These should be two approved art variants of the same character, not a runtime filter applied blindly to a raster.

### Separate assets

The sheet is useful for choosing direction, but it is not the final asset format. The production sequence should be:

1. Select one character direction and lock the silhouette.
2. Redraw one canonical front / three-quarter character in clean vector paths.
3. Separate the artwork into stable layers: body, face, wings, glow, props, and motes.
4. Create light and dark palette variants from those same paths.
5. Create individual pose assets from the master, rather than regenerating each pose independently.
6. Export only the combinations the product actually uses as SVG, PNG/WebP, and optionally Lottie/Rive for motion.

This prevents the face, proportions, wing shape, and line quality from drifting between assets.

### Character roles

The mascot can represent different Gurudevi people without becoming a costume collection. Keep one species, silhouette, face, and illustration grammar; vary posture, prop, and context.

| Role | Character expression | Selective prop language | Avoid |
|---|---|---|---|
| Guide | forward-facing, light leading the way | small lantern / light trail | superhero pose |
| Student | curious, observant, learning | book, seedling, small satchel | childish school uniform |
| Teacher | open, grounded, offering | lotus page, lamp, teaching gesture | authority costume |
| Guardian | attentive, steady, protective | low lantern, gentle boundary arc | militarized armor |
| Community host | welcoming, relational | two motes / shared glow | party mascot energy |
| Librarian | quiet, timeless, reflective | book or bookmark | fantasy wizard cliché |

Roles should be semantic variants in Figma (`role=student`, `role=teacher`) and compositional variants in the app. They should not create six unrelated mascots.

### Figma component model

Use a restrained variant matrix:

- `Theme`: light / dark
- `Role`: guide / student / teacher / guardian / host / librarian
- `State`: resting / curious / guiding / interrupted / complete
- `Scale`: inline / card / scene

Do not publish every possible combination immediately. Publish a small approved set, then add combinations only when a real product surface requires them.

### Reproduction checklist

Every new mascot asset must be checked against:

- silhouette at 24px, 48px, 96px, and 240px;
- face and expression legibility without relying on color;
- light and dark contrast;
- no accidental resemblance to an icon, emoji, or unrelated animal;
- consistent body / wing / eye proportions;
- one clear emotional meaning;
- a defined place in the product, not decoration added after layout;
- static fallback and reduced-motion behavior;
- SVG/PNG naming, source link, role, state, theme, and export date.

## Reference audit: what to borrow, what to avoid

The closest useful precedent is Apache Beam’s Firefly. Beam documents a mascot model sheet, an identity-linked body silhouette, and adaptations for learning and data processing. The useful lesson is not its visual style; it is that the mascot has a stable anatomy plus meaningful modes. [Apache Beam Firefly mascot](https://beam.apache.org/community/mascot/)

Winnie-the-Pooh’s bees are a useful emotional reference for softness, curiosity, and storybook warmth, but Gurudevi should not borrow Pooh-specific proportions, clothing, facial treatment, or scene language. The lesson is “a simple creature can carry a whole emotional world,” not “make a Pooh-like bee.” Disney describes Pooh’s enduring appeal through warmth, simplicity, and storybook artistry. [Disney on Winnie-the-Pooh](https://thewaltdisneycompany.com/news/winnie-pooh-100/)

The reference pattern we should extract is:

- **Stable identity:** one instantly recognizable base character.
- **Pose-led meaning:** emotion comes from posture and gaze before props.
- **Mode system:** the same character can be quiet, helpful, worried, or joyful.
- **Contextual props:** roles are signaled sparingly through objects and gestures.
- **Production discipline:** one model sheet, one source library, many controlled exports.

Avoid copying any existing mascot’s silhouette, face, palette, jokes, clothing, or signature pose. Gurudevi’s distinctiveness should come from the lotus/firefly relationship, warm sanctuary atmosphere, and the idea of a small light helping someone take their next step.

## Proposed Figma file structure

1. **00 — Read me:** principles, doctrine/dialects, usage rules, accessibility, contribution and naming conventions.
2. **01 — Foundations:** logo, lotus, firefly, color variables, themes, typography, spacing, radii, elevation, materials, motion.
3. **02 — Core components:** component sets with default, hover, focus, pressed, disabled, loading, selected, error, and platform variants.
4. **03 — Feedback states:** loading, empty, offline, recoverable error, blocking error, success, warning, permission, maintenance.
5. **04 — Mobile patterns:** onboarding, home/workspace, navigation, forms, sheets, sync, and role spaces.
6. **05 — Web patterns:** marketing hero, narrative sections, product shell, dashboard, forms, and responsive states.
7. **06 — Theme matrix:** light/dark × temporal phase × five spaces, with readable text pairings.
8. **07 — Playground / QA:** contrast checks, localization stress, reduced motion, edge cases, and component combinations.
9. **08 — Archive:** screenshots or explorations that are useful context but are not current truth.
10. **09 — Reality audit:** current screenshots / captures, annotated drift, severity, source file, and migration owner.

## Initial design direction

Gurudevi should feel like **a living sanctuary of warm clarity**: lotus-still at the level of identity, firefly-alive at the level of interaction, and grounded in vellum, silk, ink, saffron, leaf-light, and aurora depth. The system must never feel like a generic SaaS dashboard, a glossy glassmorphism kit, or a childish mascot app. Every expressive treatment should carry meaning; ordinary controls should remain quiet, legible, and fast.

## Recommended first Figma slice

The first pass should establish the smallest coherent system that can be compared against reality:

- Reality audit board showing current implementation examples and the exact gap against the constitution.
- Brand cover with lotus / firefly role split.
- Light and dark foundation boards.
- Core color variables and typography scale.
- Button, input, card, navigation, and modal foundations.
- The complete feedback family: pulse, skeleton, empty, offline, error, and success.
- One mobile workspace example and one web sanctuary / marketing example.
- A theme matrix showing how the same component changes by world, phase, and space.

This slice is intentionally enough to reveal whether the doctrine works in practice before expanding into every product workflow. Any target component that cannot be mapped to a real implementation surface is marked **proposed**, not **existing**.

## Rollout and governance

1. Review this audit and the first Figma slice as the design source of truth.
2. Resolve any conflict in favor of current implementation truth, then record the migration in the canonical design docs.
3. Add Figma variables and component properties before adding more screens.
4. Migrate shared primitives in `packages/ui` first; keep mobile and web composition distinct where platform behavior differs.
5. Run contrast, font-scaling, reduced-motion, responsive, and visual regression checks for each component family.
6. Maintain a monthly doc/code/Figma drift review.

## Severity model for the gap

- **P0 — trust or accessibility break:** unreadable contrast, misleading error state, broken focus, inaccessible touch target, or state that hides recovery.
- **P1 — system drift:** the same semantic role renders differently across shared components or platforms.
- **P2 — brand dilution:** surface is usable but feels generic, flat, overly decorative, or disconnected from lotus/firefly meaning.
- **P3 — polish opportunity:** spacing, rhythm, animation timing, or asset refinement that does not change comprehension.

Migration should clear P0 and P1 first, then use P2 and P3 to establish the desired character without expanding scope uncontrollably.

## Known gaps and risks

- The repo has multiple overlapping token vocabularies and legacy aliases; the Figma layer must show canonical semantic names and a migration map rather than reproducing every alias.
- Some existing implementation code still contains direct visual values and conditional fallback patterns; Figma should capture intended behavior while implementation cleanup remains scoped and deliberate.
- The firefly feedback system is present in code but needs a complete state matrix, copy guidance, and platform-specific component anatomy.
- Existing logo and lotus assets need provenance, variants, and clear usage rules before they become the foundation of a shared library.
- Rich atmospheric effects must remain selective and performant on lower-memory mobile devices.
