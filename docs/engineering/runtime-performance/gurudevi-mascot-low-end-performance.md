# Gurudevi mascot adaptive performance contract

## Goal

Preserve the approved warm raster artwork and its expressive presentation on
capable devices while making the experience safe for older Android devices,
small-memory phones, and slow connections. Low-end support is an adaptive
fallback, not the visual baseline. Reduced quality must preserve product
feedback and interaction; it removes expensive layers before removing
meaningful behavior.

## The important distinction

JSI, C++, and UI-thread worklets solve different problems:

- `expo-image` delegates image loading, decoding, caching, and native image
  views to platform implementations (Glide on Android and SDWebImage on
  Apple platforms). This is the right path for bitmap artwork.
- Reanimated/worklets keep small property animations off the React JS thread.
  They do not make a large bitmap cheaper to decode.
- Skia is useful for a small number of procedural effects, but it is not
  required for the current mascot artwork. A second Skia aura around a raster
  image only adds another render surface and another animation workload.

React Native has separate JS and UI frame budgets. The target is to keep the
mascot image static and let only inexpensive `opacity`/`transform` motion run
on the UI runtime when motion is actually needed. Capable devices may also
receive the existing Skia aura; it is gated by the canonical fidelity and
blur/animation settings.

## Memory budget

Encoded file size is not decoded memory size. A 2048×2048 image is about 4.2
million pixels. At 32-bit ARGB that is roughly 16 MiB before view/cache
overhead. Four simultaneously decoded states can therefore exceed 64 MiB.

The implementation follows these rules:

1. Only the active state is rendered.
2. State sources are not prefetched as a group.
3. Medium/low tiers use `cachePolicy="disk"`; high tier may use
   `cachePolicy="memory-disk"` when effective fidelity is high and data saver
   is not active.
4. `allowDownscaling` stays enabled so native decode can match the view size.
5. Android uses `decodeFormat="rgb"` only on the low tier for these opaque,
   paper-background illustrations. Medium/high tiers retain the normal color
   path so the approved artwork is not unnecessarily degraded.
6. The app clears the `expo-image` memory cache when it backgrounds.
7. Future delivery exports should be WebP at a bounded maximum dimension; the
   2048px PNGs remain review masters, not the long-term low-end delivery tier.

## Runtime policy

| Surface | Default | Motion | Image policy |
|---|---|---|---|
| Welcome | welcome scene | rich aura only in full quality; subtle state motion remains available | adaptive cache, downscaled |
| Loading | welcome/guiding scene | optional opacity/translate | no size animation |
| Empty | unopened lotus | subtle only when requested | one active image |
| Offline | resting lantern | static by default | no repeated pulse |
| Error | interrupted path | static acknowledgement | no red flashing |
| Success | existing fallback until approved | reduced particle count before static fallback | do not preload |

Do not animate image width, height, or layout. If motion is added later, use
Reanimated shared values and animate `opacity` or `transform`; do not read
shared values from JS during a frame and do not capture large theme/config
objects inside worklets.

## What is deliberately not used by default

- No Rive runtime for static feedback states.
- No Lottie runtime for error, empty, offline, or loading states.
- No per-frame React re-render for breathing or glow.
- No full pose sheet in the bundle or runtime crop logic.
- No `memory-disk` prefetch of all mascot states.
- No extra Skia glow on reduced/essential quality, in reduced-motion mode, or
  when the user has selected low fidelity. High-capability devices retain the
  aura.

Low/essential quality still permits bounded, non-layout transitions and a
small celebration particle burst. Only reduced-motion accessibility removes
motion entirely.

### Visual budgets

| Quality | Ambient aura/blur | Subtle transitions | Celebration budget | Artwork |
|---|---:|---:|---:|---|
| Full | yes | yes | up to 200 particles | approved artwork |
| Reduced | no | yes | up to 64 particles | approved artwork |
| Essential | no | yes | up to 32 particles | approved artwork |
| Reduced motion | no | no | static success | approved artwork |

## Canonical capability pipeline

```text
coreRuntime.device.getTotalMemory()
coreRuntime.device.getPowerState()
AccessibilityInfo.reduceMotionChanged
  -> RealityProvider (one runtime snapshot)
  -> FidelityProvider + resolveVisualCapabilities()
  -> useVisualCapabilities()
  -> mascot/background/blur/celebration policy
```

`RealityProvider` is the only source of runtime hardware, network, power, and
motion facts. `FidelityProvider` combines those facts with the user's Auto,
Low, or High preference. The old app-local tier/config helper has been
removed. New UI behavior must consume `useVisualCapabilities()` or resolved
theme flags; it must not recreate thresholds in a component. Native detection
must not require a browser `navigator` global.

Rive may be evaluated later for a genuinely interactive guide. Lottie may be
evaluated for a finite celebration. Both must retain a static fallback and
must pass low-end profiling before adoption.

## Asset ladder

```text
Figma/source master
  -> review PNG/JPG (large, untouched visual reference)
  -> delivery WebP (bounded dimensions, quality checked)
  -> expo-image native decode with allowDownscaling
  -> disk cache, one visible state
```

The current approved guide/state studies have WebP delivery derivatives in
`apps/gurudevi-mobile/assets/mascot/`, generated at the source dimensions so
the artistry is unchanged. The PNG/JPG files remain review masters. Do not
resize the source artwork in code as a substitute for a proper delivery
export; runtime downscaling is a memory guard, not an asset pipeline.

## Current visual rollout boundary

- Welcome, loading, empty, offline, error, and success all use the semantic
  firefly state scene.
- The registry supports role-and-state artwork without changing component
  APIs. Guide art is the approved fallback until teacher, student, and guardian
  sheets receive individual visual approval.
- Light artwork is currently used in both theme modes so dark mode does not
  silently invent a second illustration. A dedicated dark export should be
  reviewed in Figma before it replaces that fallback.
- Figma review board: `ySLDA1pqD7dpn1bJk1UCUX`, page `33:2`. Device review and
  release-build profiling remain acceptance work, not assumptions.

## Measurement protocol

Always profile a release build, not Metro development mode.

Record on a representative low-end Android phone:

- cold launch time until welcome artwork displays;
- JS and UI FPS during welcome arrival and route transition;
- native heap before artwork, after artwork, after switching states, and after
  backgrounding;
- peak memory while visiting empty, offline, and error surfaces;
- APK/AAB asset contribution and web transfer size;
- whether a repeated state switch decodes the image again.

Use React Native's performance monitor/profiling tools and Expo Atlas for
bundle inspection. A mascot change is accepted only if it keeps the app
responsive and does not create a sustained memory climb after state changes.

## References

- [Expo Image documentation](https://docs.expo.dev/versions/latest/sdk/image/)
- [React Native performance overview](https://reactnative.dev/docs/performance)
- [React Native profiling](https://reactnative.dev/docs/profiling)
- [React Native threading model](https://reactnative.dev/architecture/threading-model)
- [Reanimated worklets](https://docs.swmansion.com/react-native-reanimated/docs/guides/worklets/)
- [Reanimated performance](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)
- [Expo bundle analysis](https://docs.expo.dev/guides/analyzing-bundles/)
