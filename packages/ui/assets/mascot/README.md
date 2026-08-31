# Gurudevi mascot exports

This directory contains approved exports from the Figma mascot vector master.

The source file is the Figma library, not an exported SVG or raster file. Export
files must use this exact shape:

```text
firefly-{role}-{state}-{theme}-{scale}.{format}
```

Examples:

```text
firefly-guide-guiding-light-card.svg
firefly-student-curious-light-inline.webp
firefly-teacher-resting-dark-scene.png
```

Do not add a single pose or role by manually editing an export. Update the
master, export the complete approved set, then update `manifest.json` with the
Figma node reference and review date.

Animation files belong beside their static fallback and use the same semantic
identity:

```text
firefly-guide-complete-light-scene.json  # Lottie JSON
firefly-guide-complete-light-scene.riv
```

Runtime code must continue to work when an animation file is unavailable or
reduced motion is enabled.
