---
title: "Gurudevi Mascot Reset — Asset, Art Direction, and Mobile Migration Plan"
status: "proposed"
created: 2026-09-09
updated: 2026-09-09
author: "Codex"
tags: [gurudevi, mascot, design-system, asset-governance, mobile]
---

# Gurudevi Mascot Reset

## Decision in one sentence

Keep the generated illustrated firefly direction already used across Gurudevi, remove only the hand-coded SVG and visibly corrupted exports, then regenerate and implement the complete family from a locked visual reference through one registry.

## Audit findings

### Current sources

- `packages/ui/src/components/FireflyMascot.tsx` contains a hand-coded `react-native-svg` firefly. It is the runtime fallback when artwork is absent or fails, so the discarded vector is still reachable in the product.
- `packages/ui/assets/mascot/` contains four Figma-labeled SVG exports, but `manifest.json` says the source is still awaiting vector-master approval. These exports are not the artwork currently used by mobile.
- `apps/gurudevi-mobile/assets/mascot/` contains the intended generated illustrated family: welcome, onboarding, explore, empty, error, offline, coming-soon, and pro images, with both cutout and scene variants. The art direction is broadly coherent, but the exports need a clean regeneration pass and systematic registration.
- `apps/gurudevi-mobile/src/brand/mascotArtwork.ts` maps product and feedback states directly to individual files. It also uses the Gemini image as the unassigned fallback.
- `packages/ui/assets/images/gurudevi-firefly-character-sheet-v1.png` is dark-background concept-sheet art, not a production delivery asset.
- `packages/ui/assets/images/lotus_bloom.png` appears to be a broken or placeholder raster in the current checkout and must not be treated as a trustworthy brand source until verified.

### Defects observed

- The generated cutouts show pale/white matte fringes and rough remnants around transparent edges, especially around wings, antenna lights, and ground shadows.
- Poses vary in scale, crop, rendering, and environmental treatment; the family does not yet behave as one character system.
- The current character sheet and light mobile art use different palette and atmosphere decisions.
- Asset naming and manifest rules describe a future Figma pipeline, while runtime wiring uses a separate product-specific naming scheme.
- The welcome route passes `firefly-guide-explore-light-cutout-v2.webp` into the hero. That cutout contains baked transparency-checker pixels between the firefly’s legs and around the ground/shadow, plus pale matte fringes around the silhouette. The onboarding artwork has the same class of contamination. Separately, the onboarding screenshot also contains square and gear controls that are floating development overlays; those are a different issue and should be reviewed with debug overlays disabled.

## Design direction to approve

Gurudevi’s firefly is a small, perceptive companion: warm, dignified, curious, expressive, and unmistakably alive. “Quiet” describes the app surface—the vellum, spacing, typography, and ambient atmosphere—not the companion. The firefly should look like it is noticing, feeling, deciding, welcoming, pausing, and moving toward the user. It guides attention without becoming a cartoon assistant. The lotus is the place and identity; the firefly is the responsive presence that helps a person move through the app.

The art should feel like soft editorial illustration with restrained dimensionality: warm ink, saffron/apricot light, translucent wings, botanical rhythm, slight asymmetry, and enough silhouette clarity to read at 48px. Preserve the current firefly’s recognizable silhouette logic and characteristics—rounded luminous body, purple head, green lotus collar, transparent veined wings, glowing antenna tips, large attentive eyes, slender expressive limbs, and gentle hand-led gestures—while improving anatomy, pose, gaze, and emotional life. It must never feel like a generic icon, glossy sticker, chibi mascot, neon game character, frozen clip-art figure, or AI-generated collage.

### Aliveness doctrine

The companion is not a static ornament placed on a quiet screen. It is the living counterpoint to the quiet screen.

- The surface settles; the firefly breathes.
- The surface is spacious; the firefly notices and responds.
- The surface is calm; the firefly carries warmth, curiosity, and feeling.
- The surface reduces noise; the firefly uses gaze, posture, antenna tilt, wing angle, light intensity, and small gestures to communicate.
- Motion should be organic: breathe, blink, look, lean, hover, settle, and glow—not mechanical bouncing or constant animation.
- A resting state is still emotionally present, never blank or dead.
- Reduced motion removes movement, not personality: preserve expressive pose, gaze, and lighting in the static fallback.

## System rules

### One master, many approved deliveries

The source of truth is a locked image-generation reference package: approved character reference images, a canonical prompt, negative prompt, palette notes, pose/state briefs, crop rules, and provenance. Image generation is the intended creative production method. Generated images become production assets only after alpha cleanup, visual review, naming, and registration. A vector master is not required for this reset.

Each approved delivery records: source reference, role, state, theme, scale, format, crop policy, accessibility label, provenance, and review date.

### Semantic ownership

- Lotus: identity, belonging, sanctuary, home, milestone, app icon, and calm framing.
- Firefly: guidance, loading, progress, interruption, offline, empty-state invitation, and contextual reassurance.
- Do not place both as competing focal points in a small surface.

### Approved state vocabulary

Start with five states only:

- `resting`: present and calm
- `curious`: inviting exploration
- `guiding`: leading toward the next step
- `interrupted`: paused without shame
- `complete`: warm acknowledgement, not celebration noise

Roles are deferred until the base guide is approved. Do not create six characters before the anatomy and expression language are stable.

### Delivery tiers

- `inline`: 24–48px, silhouette and face must read without glow
- `card`: 96–160px, transparent cutout with optional motes
- `scene`: 240px+, composed environmental illustration for onboarding and empty states

Use WebP/PNG cutouts for native delivery, SVG only where it is genuinely an approved vector export, and animation only after static artwork passes review. Every animated asset needs a static fallback and reduced-motion behavior.

## Phased execution plan

### Phase 0 — quarantine and evidence

1. Mark the hand-coded SVG branch as legacy and prevent new usages.
2. Move existing concept/generated files into clearly named `reference` or `quarantine` locations only after a usage map is recorded.
3. Disable debug overlays in screenshot review so product defects are not confused with instrumentation.
4. Verify `lotus_bloom.png` and all existing transparent assets for dimensions, alpha, matte fringes, and actual visual content.

Exit condition: a complete inventory shows every mascot file, every import, every screen, and every fallback path.

### Phase 1 — image-generation art direction and reference lock

1. Preserve the current generated firefly’s recognizable identity and silhouette characteristics.
2. Select the strongest current references and create a reusable generation brief with fixed anatomy, palette, camera, illustration texture, silhouette rules, and emotional behavior.
3. Use image generation to create more alive variants from that reference: attentive welcome, curious discovery, guiding gesture, concerned pause, joyful completion, gentle hover, blink, and settling poses.
4. Reject poses that are merely different drawings of the same neutral stance; each state must communicate a feeling through gaze, posture, hands, wings, antennae, and light.
5. Use explicit negative constraints against checkerboards, white matte halos, duplicated limbs, malformed hands, dead eyes, stiff symmetry, text, UI controls, and accidental props.
6. Produce clean transparent cutouts and intentional scene compositions separately; never use a scene image as a cutout.
7. Approve light mode first, then generate a matching dark treatment from the same reference package.
8. Create only the states and scales that real surfaces need, but make each one emotionally distinct.

Exit condition: one master and a small approved set survive light/dark, grayscale, small-size, and reduced-motion review.

### Phase 2 — runtime contract

1. Replace direct product imports with a typed mascot registry in shared UI or the app brand boundary.
2. Add a deliberate `approved artwork -> safe static fallback` chain.
3. Remove the hand-coded firefly as a visual production fallback. A neutral placeholder or approved static guide should be used instead.
4. Make state, theme, scale, and role explicit inputs; do not infer art from arbitrary screen names.
5. Keep telemetry for decode failures, but ensure failure never swaps to the discarded vector.
6. Keep image-generation provenance beside each approved delivery: reference image, prompt revision, generation date, cleanup pass, and reviewer.

Exit condition: no production screen imports a raw mascot filename and no path can render the legacy SVG.

### Phase 3 — surface migration

Migrate in this order:

1. onboarding / welcome
2. loading, empty, offline, error, and success feedback
3. AI assistant and long-running work
4. workspace and profile contextual guidance
5. marketing and narrative web surfaces

For each surface, review composition, copy, touch targets, contrast, localization expansion, and reduced motion together. The mascot should support orientation or emotion; it should not fill empty space by default.

### Phase 4 — quality gate

Required checks:

- asset manifest validation and provenance review
- no legacy SVG imports or raw filename imports outside the registry
- light/dark screenshots at phone and tablet widths
- 24/48/96/240px legibility checks
- transparent-edge and matte-fringe inspection
- accessibility labels and reduced-motion behavior
- `check-types`, lint, relevant tests, and `pnpm run check:anti-slop`

## Proposed first production set

Do not start with a large cast. Approve this minimum set first:

| Asset | First use |
|---|---|
| guide / resting / light / inline | quiet inline reassurance |
| guide / guiding / light / card | onboarding and next-step guidance |
| guide / curious / light / scene | empty state / explore |
| guide / interrupted / light / card | recoverable error / offline |
| guide / complete / light / card | meaningful completion |
| guide / resting / dark / inline | dark-mode baseline |

Add role variants only after real screens prove the need.

## Non-goals for this reset

- deleting user-owned artwork without a reviewable archive
- adding a new animation dependency
- making every screen permanently mascot-heavy
- creating a mascot costume for every role
- pretending raw image-generation output is production-ready without cleanup and review
- replacing the current generated firefly identity with an unrelated mascot style

## Acceptance statement

The reset is complete when a user experiences one recognizable, humane, emotionally alive companion across the app; when the quiet surfaces give the companion room to breathe; when the firefly’s gaze, posture, gesture, wing/antenna language, and light communicate state; when the artwork is clean at the alpha edge; and when the code has one governed path for selecting it.
