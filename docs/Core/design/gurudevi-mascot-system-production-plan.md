---
title: "Gurudevi Mascot System — Production Build Plan"
status: "active"
created: 2026-08-30
updated: 2026-08-30
author: "Codex"
tags: [gurudevi, mascot, firefly, lotus, design-system, figma]
---

# Gurudevi Mascot System — Production Build Plan

## Summary

Build an original, light-first mascot family that combines:

- firefly as the guide and emotional companion;
- lotus, sanctuary, warmth, and human dignity as the world around it;
- soft dimensional illustration with elegant organic forms;
- a small related cast for student, teacher, guardian, librarian, and host roles;
- static production assets first, with animation deferred.

The existing primitive SVGs and generated character sheet remain references only—not final production artwork.

Apache Beam is the most useful precedent because it documents one stable Firefly anatomy with contextual adaptations. [Apache Beam Firefly](https://beam.apache.org/community/mascot/)

Winnie-the-Pooh’s bees will influence emotional qualities only: tenderness, curiosity, simplicity, and storybook warmth. Their visual design will not be copied.

## Creative direction

The mascot system will be:

- soft dimensional rather than flat geometric;
- warm and humane rather than childish or chibi;
- slightly asymmetrical and memorable at silhouette level;
- elegant enough for light mode and calm enough for dark mode;
- expressive through gaze, posture, and gesture before props;
- visually connected to lotus through light, petal-like rhythm, sanctuary atmosphere, and unfolding—not through literal lotus costumes.

Light mode is the primary approval target:

- vellum or silk background;
- warm ink contour;
- saffron/apricot body;
- translucent cream wings;
- restrained internal glow;
- subtle leaf or aurora accents;
- no dark vignette, black sticker outline, or neon halo.

Dark mode will be a separately approved palette variant using the same anatomy.

## Figma and asset work

Create a production-ready Figma structure containing:

- character anatomy and proportion sheet;
- front and three-quarter master views;
- light and dark variants;
- expression sheet;
- pose sheet;
- role variants;
- prop library;
- 24px, 48px, 96px, and 240px scale checks;
- do/don’t usage rules;
- asset naming and export rules.

The cast will use a shared family grammar:

- same overall species logic;
- related body proportions;
- consistent eye, wing, contour, and glow language;
- distinct personalities through face shape, posture, accent color, and restrained props.

Initial roles:

- Guide — forward gaze and light trail;
- Student — curious posture, book or seedling;
- Teacher — grounded posture, offering or teaching gesture;
- Guardian — attentive stance, soft protective arc;
- Librarian — quiet gaze, bookmark or book;
- Community host — open posture and shared motes.

No role will be represented through generic uniforms, costumes, armor, or decorative clichés.

## Production pipeline

1. Lock the primary silhouette and face.
2. Redraw the master as layered vector artwork.
3. Separate body, face, wings, glow, props, and motes.
4. Produce light and dark variants from the same vector source.
5. Create the small cast from the shared family grammar.
6. Export organized assets under a dedicated mascot asset directory in `packages/ui/assets/images`.
7. Produce SVG for scalable web/Figma use and PNG/WebP for practical mobile surfaces.
8. Defer Lottie until the static character system is approved; the current app already has Lottie, Reanimated, Skia, and SVG support, so no new rendering dependency is required.
9. Record provenance, source file, variant, role, state, theme, dimensions, and export date for every asset.

## Scope boundary

This milestone includes:

- Figma artwork and component organization;
- production-ready static asset exports;
- light/dark character variants;
- the first shared mascot family;
- documentation of usage and reproduction.

This milestone does not yet replace `FireflyMascot`, `BrandPulse`, `FireflyFeedbackScene`, or other shared UI renderers. Code integration begins only after the vector master passes visual review.

There will be no public API changes in this milestone.

## Acceptance criteria

The mascot system is accepted only when:

- it looks elegant on light backgrounds before dark-mode tuning;
- each role remains recognizably part of the same family;
- the character is identifiable at 48px without relying on glow;
- poses communicate state without explanatory text;
- light and dark variants preserve the same identity;
- assets are individually exportable;
- no pose depends on copying Pooh, Porkbun, PostHog, or Apache Beam artwork;
- the character does not read as an icon, emoji, or generic insect clip-art;
- grayscale, low-contrast, and small-size checks remain legible;
- all assets have a defined product use;
- the final artwork has clear ownership/provenance documentation.

The official trademark guidance supports this approach: risk is assessed through similarity of appearance, meaning, and overall commercial impression—not merely because two brands use an animal. [USPTO likelihood-of-confusion guidance](https://www.uspto.gov/trademarks/search/likelihood-confusion)
