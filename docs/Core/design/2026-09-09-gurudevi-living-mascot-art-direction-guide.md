---
title: "Gurudevi Living Mascot — Transparent Artwork and Joyful Motion Guide"
status: "proposed"
created: 2026-09-09
updated: 2026-09-09
author: "Codex"
tags: [gurudevi, mascot, art-direction, transparency, aliveness, motion]
---

# Gurudevi Living Mascot

## The thing we are trying to make

The firefly is not a static illustration placed on a quiet screen. It is a small companion with presence.

The app should feel quiet: spacious, gentle, readable, and uncluttered. The firefly should feel alive inside that quiet: attentive, curious, humane, emotionally responsive, and capable of joyful warmth.

The desired feeling is not cartoon energy or constant animation. It is the feeling that the firefly is aware of the user and the moment:

- it notices;
- it welcomes;
- it wonders;
- it offers help;
- it waits patiently;
- it feels relief when something completes;
- it remains kind when something is interrupted.

Joyful aliveness means a lightness in the eyes, an open gesture, an organic lean, a responsive glow, and a sense of movement about to happen. It does not mean a permanent grin, exaggerated bouncing, confetti, or visual noise.

## Identity to preserve

Every generated variation must still read as the same Gurudevi firefly:

- rounded luminous golden body;
- purple head and warm ink contour;
- green lotus collar;
- translucent, veined wings;
- glowing antenna tips;
- large attentive eyes;
- slender expressive limbs;
- gentle, human-readable hand gestures;
- lotus, leaf, light, and sanctuary associations used selectively.

The silhouette must remain recognizable at 48px before glow or decorative context is added.

## Transparent artwork rules

### Cutouts

Cutouts are foreground subjects intended to live directly on the app surface. They must have a genuine alpha channel.

They must not contain:

- checkerboard pixels;
- white or gray matte backgrounds;
- rectangular scene remnants;
- baked halos that look like a sticker edge;
- accidental floor patches unless the pose explicitly requires one;
- text, icons, buttons, checkboxes, or interface shapes.

Soft glow belongs on a separate layer or is kept subtle enough that it does not create a false background boundary.

### Scenes

Scenes are intentionally composed illustrations with a background. They are never used as cutouts by masking or cropping casually. A scene may include water, leaves, a lotus, a path, or sanctuary light when that context helps the user understand the state.

### Verification

Every export is checked in three ways:

1. visual inspection on vellum, dark, and saturated test surfaces;
2. alpha inspection at corners, between limbs, under wings, and around props;
3. automated rejection of opaque checkerboard or matte pixels.

Preview software may display transparency as a checkerboard. That preview is not evidence of a valid alpha channel; pixel verification is required.

## Image-generation method

Image generation is the creative production method, but raw generations are drafts until they pass cleanup.

For each pose:

1. Use the locked firefly reference package.
2. State the emotional intention before describing the pose.
3. Describe gaze, head angle, torso lean, hands, wing angle, antenna direction, and light intensity.
4. Request a transparent background and foreground-only composition.
5. Explicitly reject checkerboards, matte edges, duplicated limbs, dead eyes, stiff symmetry, text, and UI artifacts.
6. Inspect the result at actual mobile scale.
7. Clean the alpha deterministically if necessary without changing the foreground anatomy.
8. Version the approved export and record its prompt and provenance.

The prompt should describe the firefly as an actor with an intention, not as an object with a pose. For example: “the firefly notices the learner’s next step and opens one hand toward it, eyes bright with patient invitation.”

## Motion method

Generated images provide emotional keyframes. Reanimated or another approved runtime layer provides the living interval between them.

Use motion in this order:

1. entrance: arrive and settle into the space;
2. presence: breathe subtly while waiting;
3. attention: tiny lean, gaze direction, or antenna response when context changes;
4. state: glow, hover, pause, or brighten according to product meaning;
5. return: settle back instead of looping forever at high energy.

Motion should be slow enough to feel organic and clear enough to notice only when the user looks. Each loop needs a natural end or a low-amplitude cycle. Avoid mechanical bounce, constant wing flapping, rapid pulsing, and attention-seeking movement.

## Keyframe briefs

| State | Emotional intention | Visual direction | Motion |
|---|---|---|---|
| Welcome | “I’m glad you’re here.” | open hand, soft smile, attentive gaze | arrive, breathe, slight lean toward the next step |
| Curious | “There may be something here for you.” | forward lean, bright eyes, raised antenna | tiny look/tilt, gentle hover |
| Guiding | “Come this way.” | clear directional gesture, body angled toward action | hover toward action, then settle |
| Working | “I’m staying with you.” | patient face, warm steady body light | breathing only, no frantic activity |
| Interrupted | “It’s okay; we can pause.” | grounded posture, concerned but kind eyes | lower light, stillness, small settling motion |
| Complete | “You made progress.” | lifted posture, bright eyes, warm open expression | brief glow/lift, then return to calm |

## Runtime state contract

Screens provide semantic state. The mascot system chooses the approved artwork and motion behavior.

```text
surface state -> mascot state -> approved keyframe -> motion profile -> reduced-motion fallback
```

The reduced-motion fallback keeps the best expressive keyframe and removes movement. It must not fall back to a dead generic icon or the discarded hand-coded vector.

## First review question

When the welcome screen is still, ask: “Does the firefly look like it is waiting with awareness?”

When it is moving, ask: “Does the motion reveal a living intention, or is it merely animating pixels?”

If the answer is merely animating pixels, the pose, state mapping, or motion profile is not ready.
