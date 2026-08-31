# FEATURE SPEC: Gurudevi visual feedback hardening

## Blast Zone: AMBER

## Target Files

- `packages/ui/src/components/FireflyMascot.tsx`
- `packages/ui/src/components/FireflyFeedbackScene.tsx`
- `packages/ui/src/components/fireflyFeedback.ts`
- `packages/ui/src/context/FidelityProvider.tsx`

## Reuses

- `useVisualCapabilities()` and `resolveVisualCapabilities()`
- the existing semantic feedback presentation registry
- the existing SVG mascot fallback
- the existing approved raster artwork registry

## Does NOT

- change the frozen capability API
- add another provider or duplicate device/network thresholds
- replace approved artwork
- hide product functionality when a visual asset fails
- add telemetry dependencies or modify the root layout

## Failure contract

Every visual state must remain meaningful when its preferred asset, animation,
provider data, persisted fidelity value, or runtime state is unavailable.
Fallbacks must preserve the semantic state, accessibility label, and action
surface while removing only the failed or expensive visual layer.

## Product moments

`FireflyProductMoment` is the shared composition for product-facing states
that are not failures:

| Kind | Meaning | Primary action pattern |
|---|---|---|
| `coming-soon` | The feature is intentionally still being built. | Notify me, preview, or return to the sanctuary. |
| `pro` | A premium capability is worth understanding before asking for access. | See what is included or upgrade. |
| `onboarding` | The user is moving through first-use steps. | Continue, with optional progress and skip. |
| `explore` | The user has a safe invitation to discover another part of the app. | Explore the suggested space. |

These moments share the same firefly scene, accessibility contract, action
anatomy, and capability policy. Copy and actions remain screen-owned so the
component does not invent product promises or gate functionality by itself.

The AI Assistant premium guard now uses the `pro` moment as the first live
consumer. Future screens should use the same component for `coming-soon`,
`onboarding`, and `explore` rather than creating another mascot card.

### V2 art and delivery roles

The four approved light-mode illustrations have two delivery roles. The
`*-light-v2.png` files are spacious scene compositions; the matching
`*-light-cutout-v2.png` files are true-alpha compact assets. A scene must not
be placed in a compact mascot slot because its paper canvas will appear as a
rectangular edge.

- `firefly-guide-coming-soon-light-v2.png` — tending an unopened lotus bud
- `firefly-guide-pro-light-v2.png` — opening a lotus-shaped sanctuary doorway
- `firefly-guide-onboarding-light-v2.png` — inviting the user onto a short path
- `firefly-guide-explore-light-v2.png` — following a few distant lights through
  lotus leaves

The compact cutouts are currently wired to the product moments and welcome /
onboarding compact slots. WebP delivery derivatives are checked into the
mobile asset set; the source PNGs remain the lossless review masters. The full
scenes remain available for a future spacious scene component. Visual review
on light and dark surfaces is still required before final art sign-off.

## Implemented safeguards

| Boundary | Production behavior |
|---|---|
| Missing provider snapshot | Visual components use neutral Auto/medium defaults. |
| Invalid persisted fidelity | Ignore the value and retain Auto. |
| Fidelity storage read failure | Keep Auto and report a warning; do not block rendering. |
| Unknown feedback state | Render the actionable interrupted presentation. |
| Artwork decode failure | Fall back to the existing procedural SVG mascot. |
| Reduced motion | Remove ambient and animated layers while keeping state and actions. |
| Low-end device | Keep artwork and functionality; reduce blur, cache pressure, and particles. |
| Poor/offline network | Avoid prefetch and use disk-oriented image loading. |

## Evidence still required

- Exercise each failure boundary in a release build on one capable device and
  one low-end Android device.
- Confirm native image error callbacks behave consistently on Android and iOS.
- Capture light/dark screenshots for every semantic state in Figma and on
  device before approving dedicated dark or role-specific artwork.

## Complexity budget

Keep each changed component below cognitive complexity 15 and prefer shared
resolution helpers over repeated guards.
