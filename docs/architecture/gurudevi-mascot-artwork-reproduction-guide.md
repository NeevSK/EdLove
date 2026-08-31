# Gurudevi mascot artwork reproduction guide

## Decision

The supplied Gemini artwork is the current visual reference. Its artistry is
not being approximated with a new SVG character. The original files remain
unchanged at:

```text
apps/gurudevi-mobile/assets/mascot/
  Gemini_Generated_Image_ezd4cqezd4cqezd4.jpg
  Gemini_Generated_Image_oaffwaoaffwaoaff.jpg
  image.webp
```

The single guide JPG is the first runtime artwork. The pose-sheet JPG is a
reference board only; it is not safe to crop in the app because its labels and
layout would become part of the asset.

The first light-mode state studies now live beside those originals:

```text
apps/gurudevi-mobile/assets/mascot/
  firefly-guide-welcome-light-scene.png
  firefly-guide-empty-light-scene.png
  firefly-guide-offline-light-scene.png
  firefly-guide-error-light-scene.png
```

## What is implemented now

`MascotProvider` injects the artwork family into the app shell. The shared
`Mascot` and `FireflyFeedbackScene` components consume semantic state keys, so
existing loading, empty, offline, error, and success surfaces can use the
correct approved study without each screen importing a private image.

The welcome route also uses the `guiding` artwork when the app opens. The
current mapping is `guiding → welcome`, `curious → empty`, `resting → offline`,
and `interrupted → error`. Success continues to fall back to the original
guide until a separate celebration artwork is approved.

The renderer uses `resizeMode="contain"` and preserves the artwork's square
composition. When no artwork is injected, the existing semantic fallback
renderer remains available for tests and other consumers; it is not the
approved visual direction.

## How to create separate roles and states

Do not redraw the JPG by tracing it and do not ask the runtime to extract
poses from the sheet. For each approved pose:

1. Use the original image-generation/source file or an illustrator working
   from it, not a screenshot of the Figma board.
2. Produce one complete pose on its own canvas, with the same paper tone,
   proportions, line texture, lighting, face, wings, and lotus collar.
3. Remove sheet labels and surrounding poses before export.
4. Export a high-resolution JPG/PNG master and a WebP delivery derivative;
   keep the master outside the runtime bundle if it is too large.
5. Review the isolated pose in light mode at inline, card, and scene sizes.
6. Only after approval, give it a semantic filename such as
   `firefly-guide-guiding-light-card.webp` and register it in the manifest.

Roles are narrative variants, not different species: guide welcomes,
student learns, teacher explains, guardian reassures, host celebrates, and
librarian helps someone find a path. States should change gesture and gaze
before changing color. The visual family must retain the same face, wing
anatomy, lotus relationship, texture, and warmth.

## Figma handoff

Figma page `01A — Firefly direction / reference-faithful study` contains the
untouched single artwork and pose sheet as separate source/reference nodes.
They are there for comparison and approval, not for destructive editing.

The approval order is:

1. approve the single guide artwork in light mode;
2. approve one isolated state at a time;
3. export the approved files;
4. update the asset manifest and visual QA snapshot;
5. then add motion, if a real interaction needs it.

This order keeps the visual source stable while closing the gap between Figma,
tokens, and the implemented web/mobile surfaces.
