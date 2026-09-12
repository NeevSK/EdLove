---
title: "Gurudevi Living Firefly — Image, State Machine, and Motion Specification"
status: "proposed"
created: 2026-09-09
updated: 2026-09-09
author: "Codex"
tags: [gurudevi, mascot, image-generation, animation, reanimated, state-machine]
---

# Gurudevi Living Firefly

## Product principle

The app surface is quiet; the companion is alive. Quiet means spacious backgrounds, calm typography, restrained decoration, and low visual noise. Alive means the firefly has attention, feeling, breath, and response.

The firefly must preserve the current identity: rounded luminous golden body, purple head, green lotus collar, translucent veined wings, glowing antenna tips, large attentive eyes, slender expressive limbs, and gentle hand-led gestures.

## What image generation does

Image generation creates approved visual keyframes and scene compositions. It is the creative source for the character, not a per-render runtime dependency.

Every generated delivery must be:

- a real transparent PNG or WebP cutout when used as a cutout;
- free of checkerboard pixels, white matte halos, background scraps, text, UI controls, and accidental props;
- consistent with the locked firefly reference;
- reviewed at 48px, 96px, and scene scale;
- recorded with reference image, prompt revision, generation date, cleanup status, and intended state.

Use image generation to create emotional keyframes, not dozens of random poses. The first keyframe set is: resting-attentive, welcoming, curious, guiding, interrupted-but-okay, and complete.

## What animation does

Animation adds life between the keyframes. It must remain organic and subordinate to the user’s task.

Allowed motion vocabulary:

- breathing: small body scale and light change;
- blinking: occasional and non-looping at an obvious interval;
- noticing: tiny head/eye tilt toward the relevant action;
- antennae: slight independent sway or light pulse;
- wings: restrained lift or settle, never constant flapping;
- hover: low-amplitude rise and fall for guiding/loading;
- settle: return to a grounded resting pose after a response.

Reduced motion removes movement but keeps the expressive keyframe, gaze, posture, and light treatment.

## State model

The visual state is derived from product meaning, not arbitrary animation names.

| Product state | Character meaning | Presentation |
|---|---|---|
| `idle` | present and attentive | resting-attentive pose, slow breath |
| `guiding` | showing the next step | open gesture, gaze toward action, gentle hover |
| `curious` | inviting exploration | forward lean, bright eyes, small antenna response |
| `working` | patiently accompanying | calm breath, soft body light, no frantic spinner behavior |
| `interrupted` | something paused | concerned but steady, lowered light, no shame signal |
| `complete` | acknowledging progress | brighter light, brief lift, then settle |

Transitions should be explicit and interruptible. A new product state cancels or completes the previous transition safely; it must not stack unlimited animations.

## First experiment

The first transparent-background generation attempt was rejected: the output file had an opaque checkerboard (`alpha=255`) across the canvas. It is not a production asset and must not be wired into the app. A generated image is accepted only after pixel-level alpha verification, not from the preview appearance.

Prototype one `LivingFirefly` on the welcome hero:

1. Use a clean generated transparent welcome/guiding cutout.
2. Render it inside the existing welcome hero composition.
3. Add an idle breathing loop with a small glow variation.
4. Add one entrance transition: settle into place rather than pop in.
5. Add one interaction transition: when the user changes realm, the firefly subtly notices the selected realm.
6. Respect reduced motion and low-end visual capability settings.
7. Compare against the current static hero at 48px, 96px, and 170px.

Success means the firefly feels present and responsive without distracting from the welcome actions.

## Implementation boundary

The shared component owns state-to-motion behavior. The app brand boundary owns which approved artwork is selected. Screens do not import raw mascot filenames.

The hand-coded SVG firefly remains a legacy fallback during migration only. It must not be used as the final visual fallback after the clean generated baseline is available.

## Quality gate

- no baked transparency checkerboard or matte edge;
- same character identity across keyframes;
- emotion readable without motion or explanatory copy;
- motion remains calm at normal speed and does not loop distractingly;
- reduced-motion output retains personality;
- no crash or blank state if an asset fails to decode;
- type checks, relevant tests, lint, mascot validation, and anti-slop checks pass.
