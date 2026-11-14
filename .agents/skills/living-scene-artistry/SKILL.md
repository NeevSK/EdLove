---
name: living-scene-artistry
description: Prescriptive, high-fidelity implementation guide for procedural living landscapes, painterly watercolor washes, organic noise fields, and wide-gamut atmosphere in Gurudevi Web and Mobile. Use when designing, animating, or modernizing procedural SVG backgrounds, Skia scenes, canvas backdrops, or world environments.
---

# Living Scene Artistry: Procedural Landscapes, Shaders & Atmosphere

> **PRIME DIRECTIVE**: Never generate flat, sterile, mathematical vector geometry. A living scene requires **atmospheric depth**, **tactile paper/canvas tooth**, **perceptually uniform lighting (OKLCH)**, and **subtle diurnal breathing**, all constrained within strict GPU/battery limits (TBDR tile invalidation).

---

## 1. The 4 Layers of a Living Scene

When creating or upgrading a procedural scene (e.g. `SanctuaryWorldScene.tsx`, `WorldSceneSvg.tsx`, or `SceneBackdrop.tsx`), build in four discrete spatial layers:

```
+-------------------------------------------------------------------------+
| Layer 4: Living Atmosphere & Micro-Weather                              |
| (Light shafts, volumetric haze, drift mist, rain/firefly accents)       |
+-------------------------------------------------------------------------+
| Layer 3: Foreground Tactile Anchors & Water Caustics                     |
| (Gentle water ripples with harmonic phases, overhanging silhouette flora)|
+-------------------------------------------------------------------------+
| Layer 2: Midground Mountain Ridges & Living Pigment                     |
| (Multi-harmonic FBM terrain, coffee-ring edge pooling, subtle mist veil)|
+-------------------------------------------------------------------------+
| Layer 1: Celestial Vault & Wide-Gamut Sky Gradient                      |
| (Sun/Moon halo, Rayleigh scattering, OKLCH twilight transitions)        |
+-------------------------------------------------------------------------+
```

---

## 2. Prescriptive "What-To-Do" Techniques (With Code Recipes)

### A. Procedural Paper Tooth & Film Grain (Zero GPU Penalty)
To eliminate sterile computer-generated vector flatness, overlay a pre-baked microscopic noise pattern. Never re-calculate noise per frame in a loop!

#### Web SVG Technique:
```xml
<defs>
  <!-- Atmospheric and Paper Grain Filter -->
  <filter id="scene-paper-grain" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.045 0" result="faintGrain" />
    <feComposite in="SourceGraphic" in2="faintGrain" operator="over" />
  </filter>
</defs>
```
*Apply `filter="url(#scene-paper-grain)"` to the midground hill group or background sky.*

---

### B. Natural Horizon Scattering & Volumetric Beams (God Rays)
Gradients should not just fade linearly. Use multi-stop atmospheric scattering:

```xml
<defs>
  <!-- Volumetric Cathedral Light Shafts -->
  <linearGradient id="crepuscular-beam" x1="0%" y1="0%" x2="40%" y2="100%">
    <stop offset="0%" stop-color="var(--glow-color, #FFF5DF)" stop-opacity="0.35" />
    <stop offset="40%" stop-color="var(--glow-color, #FFF5DF)" stop-opacity="0.12" />
    <stop offset="100%" stop-color="var(--glow-color, #FFF5DF)" stop-opacity="0" />
  </linearGradient>
</defs>

<!-- Light Beams angled from upper atmosphere -->
<g style="mix-blend-mode: screen; pointer-events: none;">
  <polygon points="200,0 350,0 550,900 300,900" fill="url(#crepuscular-beam)" opacity="0.6" />
  <polygon points="500,0 720,0 1100,900 800,900" fill="url(#crepuscular-beam)" opacity="0.4" />
</g>
```

---

### C. Wide-Gamut OKLCH Color Transitions
To avoid the muddy/gray desaturated dead-zone between gold/orange and teal/sky blue:

```css
/* In SVG stop-color or CSS themes */
.sun-halo-inner {
  stop-color: oklch(0.88 0.18 75); /* Rich luminous morning sun */
}
.sun-halo-outer {
  stop-color: oklch(0.92 0.06 90 / 0);
}
.sky-twilight-transition {
  stop-color: oklch(0.65 0.14 240); /* Vivid twilight blue without sRGB clipping */
}
```

---

### D. Multi-Octave Harmonic Ridge Math
Instead of plain bezier arcs, generate terrain using combined harmonic frequencies:

$$y(x) = y_0 + \sum_{i=1}^n A_i \cdot \sin(f_i \cdot x + \phi_i)$$

```ts
import { createHarmonicPath } from './artisticMath';

// Distant ethereal ridge with 3 harmonic octaves
const distantPeaks = createHarmonicPath(0, W, horizonY - 30, 24, 1.8, 36, [
  { freq: 0.65, amp: 0.65, phase: 0.4 },  // Base mountain massif
  { freq: 1.5,  amp: 0.25, phase: 1.8 },  // Secondary ridges
  { freq: 3.2,  amp: 0.10, phase: 0.9 },  // Crag and rocky detail
]);
```

---

### E. Subtle Living Micro-Motion (CSS-Driven, Verger-Gated)
Never run JS animation loops (`requestAnimationFrame`) for static backgrounds. Drive organic breathing purely via hardware-accelerated CSS keyframes:

```css
@keyframes scene-lake-breathe {
  0% { transform: translateY(0px) scaleY(1); opacity: 0.12; }
  50% { transform: translateY(-1.5px) scaleY(1.05); opacity: 0.22; }
  100% { transform: translateY(0px) scaleY(1); opacity: 0.12; }
}

@keyframes scene-mist-drift {
  0% { transform: translateX(0px); }
  50% { transform: translateX(25px); }
  100% { transform: translateX(0px); }
}

.scene-ripple {
  animation: scene-lake-breathe 14s ease-in-out infinite alternate;
  will-change: transform, opacity;
}

.scene-mist-layer {
  animation: scene-mist-drift 60s ease-in-out infinite alternate;
}
```

---

## 3. Mobile Performance & Verger Budget Invariants

1. **TBDR Tile Protection**: Never place `backdrop-filter: blur()` directly on top of an actively animating scene layer. Use static tinted cards (`backgroundColor: rgba(...)`) or low-radius blurs (`blur(6px)`).
2. **Device Pixel Ratio (DPR) Clamping**: When rendering to canvas or offscreen surfaces on mobile:
   ```ts
   const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Never 3.0+!
   ```
3. **Verger Fidelity Tiers**:
   - `quiet`: World ground color only, zero scene drawing.
   - `still`: Static vector terrain + celestial disc, zero CSS animations.
   - `subtle`: Ambient mist + static sun/moon + CSS water shimmer.
   - `rich`: Full volumetric beams, animated mist drift, fireflies, and paper grain.

