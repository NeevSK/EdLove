# Firefly feedback system

## Intent

Feedback should help a person take the next clear step, not merely display a logo. Firefly is the current guide: small, warm, and purposeful rather than decorative.

## Art direction: the light path

The subject is a person using Gurudevi to make steady progress in a sanctuary,
often on a modest phone in bright conditions. A feedback surface has one job:
orient them to what happened and make the next action unmistakable.

Firefly is not an oversized sticker. It lives in a small illustrated field with
a curved, dotted light path that ends beside the content and recovery action.
That path is the recognisable signature: light is guidance, not ornament. The
scene stays compact, while the title and action carry the actual status.

| Role | Value | Use |
| --- | --- | --- |
| Vellum | `#F5EDD6` | calm page material |
| Ink | `#2A2318` | Firefly body and primary copy |
| Saffron | `#D4843A` | active light and forward movement |
| Lantern | `#FFC107` | luminous centre only |
| Dalu | `#8BBF7A` | grounded field and success detail |
| Weathered amber | `#D4A03A` | paused/offline path |

Typography remains deliberately familiar to the product: Outfit SemiBold for
the compact status title, Inter Regular for the explanation, and the existing
label role for a state cue. The scene never competes with a 44px recovery
control. On wide layouts it remains centered in a 320px reading measure; on
phone it occupies no more than 176px of vertical real estate.

I rejected the tempting "big friendly character in a rounded card" pattern:
it would make this look like a generic productivity empty state and would not
express Gurudevi's idea of quiet guidance. The light path is the one deliberate
risk; the rest of the surface is restrained.

## State language

| State | Firefly posture | Motion | Interface job |
| --- | --- | --- | --- |
| Loading | a bright, hovering guide above a live path | slow glow on web; static native equivalent | confirm work is underway |
| Empty | resting beside an unlit waypoint | still by default | invite the next meaningful action |
| Offline/error | grounded guide with a weathered, interrupted path | one web arrival, then still | explain the issue and offer recovery |
| Success | bright guide at the end of a complete path | short brightening | confirm completion without ceremony overload |

Every state must include direct, action-led copy. Errors name the failed task and recovery; empty states name the first useful action.

`BrandPulse` is the compact loading expression of this system. It uses the
same Firefly guide, not the product logo, and keeps its existing progressbar
semantics and tint override for constrained surfaces. Native uses a UI-thread
Reanimated breath; web uses CSS motion. Both settle to the same static guide
when reduced motion is requested.

## Configuration

`@repo/ui/components/Mascot` owns the public mascot seam. `MascotProvider` accepts a `MascotConfig`; the default is `{ id: 'firefly', name: 'Tutii' }` (the canonical sanctuary guide). `FireflyFeedbackScene` consumes that seam rather than importing a concrete animal in each state component. Adding a mascot requires one renderer case and an approved `MascotId`, without rewriting state surfaces.

## Accessibility and motion

Visible copy and controls remain the source of truth. Haptics and animation are progressive enhancement. Web respects reduced motion; native must retain a static equivalent. Decorative mascot graphics should not be the only status signal.

The semantic presentation map is unit-tested. That prevents a future shortcut
from turning an outage into an "empty" scene or giving a recoverable error the
same visual treatment as a successful completion.
