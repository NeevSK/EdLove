# Gurudevi visual system operating model

This document turns the mascot and adaptive visual work into a durable product
practice. It is intentionally broader than an illustration inventory: visual
quality, resilience, accessibility, performance, and observability are one
system.

## Product principles

1. Preserve meaning before decoration. A low-end device keeps the same action,
   state, copy, and approved artwork; it loses expensive layers first.
2. Make the mascot emotionally scarce. Use it for welcome, uncertainty,
   interruption, completion, and guidance—not every toast or button.
3. Make roles behavioral. Guide, teacher, student, and guardian differ through
   gesture, posture, props, and situation—not arbitrary recoloring.
4. Light mode is the art baseline. Dark mode receives a deliberate approved
   adaptation, never an accidental filter or invented replacement.
5. Every visual enhancement is optional. A failed image, animation, provider,
   network, or storage read must not remove product functionality.

## Canonical runtime path

```text
native signals → RealityProvider → resolveVisualCapabilities()
  → visual components → measurable fallback/telemetry
```

The capability API is frozen. Components must not receive raw memory, network,
battery, or device-tier props and must not recreate thresholds locally.

## Semantic state model

```text
empty → loading → success
  └────────────→ error → loading
offline ───────→ loading
success ───────→ loading
```

The state machine prevents impossible visual combinations. Unknown runtime
states resolve to an actionable interruption. Product actions remain available
in every visual fallback.

## Failure matrix

| Failure | Required result |
|---|---|
| Provider unavailable | Neutral Auto/medium capabilities and renderable UI |
| Invalid persisted preference | Ignore it and use Auto |
| Preference storage failure | Continue rendering and retain Auto |
| Image missing or decode failure | SVG mascot fallback plus safe telemetry |
| Unknown state/role | Semantic fallback; never a blank surface |
| Offline during loading | Offline state with retry/queued-action explanation |
| Reduced motion | Remove animated/ambient layers, retain state and action |
| Low memory/battery | Retain artwork and behavior, reduce expensive effects |
| Poor network | Avoid prefetch and favor disk-oriented delivery |
| Remote visual emergency | Safe mode disables expensive layers without disabling features |

## Visual QA matrix

Every approved state is reviewed in:

- light and dark presentation;
- Auto, Low, and High fidelity;
- low and high device tiers;
- online, poor, and offline network;
- reduced motion;
- missing/failed artwork;
- guide, teacher, student, and guardian roles when art exists.

Figma is the source for visual approval. Device screenshots are the source for
runtime truth. Neither replaces the other.

## Performance and asset budgets

- Delivery mascot WebP: ≤500 KB per file.
- One visible mascot state at a time.
- No state-sheet crop logic in runtime.
- No layout animation for raster artwork.
- Ambient aura/blur only when capabilities permit it.
- Measure cold launch, image decode, FPS/frame time, heap growth, and repeated
  state switching in release builds.

The asset validator enforces delivery presence and size. Physical profiling is
still required because encoded size is not decoded memory.

## Observability

Record privacy-safe operational events such as:

- `mascot_asset_decode_failed`
- `visual_capability_downgraded`
- `visual_prefetch_skipped`
- `visual_state_fallback_used`

Do not include image URLs, user content, names, or raw device identifiers.

## Developer tools

`VisualCapabilityInspector` is an opt-in overlay for development screens. It
shows the resolved tier, fidelity, quality, cache/decode policy, motion/blur
permissions, role, and mascot identity. It is not a production user-facing
setting.

## Emergency safe mode

The visual safety override disables ambient effects, blur, rich/subtle motion,
prefetch, and memory-oriented caching while preserving artwork and behavior.
It can be enabled through the environment variable
`EXPO_PUBLIC_GURUDEVI_VISUAL_SAFE_MODE=true` or the native/remote-config bridge
by setting `globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ = true`.

## Release gates

Release is blocked until:

1. targeted resilience tests pass;
2. asset validation passes;
3. repository type/lint gates are clean or inherited findings are explicitly
   isolated;
4. light/dark Figma review is approved;
5. one capable and one low-end device are profiled in a release build;
6. role-specific art is individually approved before it replaces the guide
   fallback.
