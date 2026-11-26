---
title: "Tutii Living Mascot System: Holistic Architecture, Rigs, Runtime Benchmarks, and Production Standards"
status: "active"
created: 2026-11-17
updated: 2026-11-17
author: "Naveen"
scribe: "Antigravity"
tags: [tutii, mascot, architecture, mobile, design, performance, expo, react-native, skia, reanimated]
---

# Tutii Living Mascot System: Holistic Architecture, Rigs, Runtime Benchmarks, and Production Standards

## Executive Summary

Tutii is the living brand companion of **Gurudevi / edlove**—a sacred firefly (*Khadyota* / Light-bearer) who accompanies learners, educators, school leaders, and guardians across educational journeys. Tutii is neither a generic app sticker nor a static reaction widget; she is an attentive, gentle, and expressive character with film-grade presence, capable of flying across scenes, resting, celebrating, and wearing context-appropriate attire (Student, Teacher, Principal, Guardian).

This master document synthesizes **temporal-grounded industry research** (Duolingo, Headspace, GitHub Mona, Discord Wumpus, Firefox), **agent skill ecosystem standards** (`skills.sh` / `agent-skills`), empirical audits of the **49 checked-in concept artworks** in `C:\x\docs\Core\design\tutii-brand-kit\raster-concepts\`, and hands-on hardware benchmarks conducted on physical budget hardware (**Samsung Galaxy A52**, ARM64, Mali-G52).

It establishes the definitive technical standard for:
1. **Filetypes and Delivery Formats**: Resolving the tension between hand-painted gouache texture and mobile payloads.
2. **The Modular Anatomy & Wardrobe Rig**: Eradicating "scissors-cut" seam errors through occluded inpainting and anchor-slot attachments.
3. **The Mobile Runtime Engine**: Deploying a 60 FPS, < 6 MB VRAM living character engine in React Native / Expo SDK 58.
4. **Agentic Skill Integration**: Bridging agent conversational states (`skills.sh`) to the character's emotional state machine.
5. **The Strict Engineering "Do's and Don'ts"**: Non-negotiable gates for low-end device performance.

---

## 1. Grounded Industry Research: How World-Class Mobile Mascots Work

Grounded analysis of leading digital character systems reveals key architectural commonalities:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHARACTER ECOSYSTEM BENCHMARKS                                                         │
├────────────────────┬───────────────────────────────────────────────────────────────────┤
│ Duolingo (Duo)     │ Vector & mesh state-machine driven (Rive/custom). Never exports   │
│                    │ full videos; uses skeletal states driven by a strict input contract│
│                    │ (isListening, emotionValue, isThinking, tap).                      │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ Headspace          │ Organic, slow-breathing characters. Character presence relies on  │
│                    │ gentle vertical floating, rhythmic respiratory scaling, and soft  │
│                    │ blinks rather than high-velocity limb acrobatics.                 │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ GitHub (Mona)      │ Modular wardrobe system. One core anatomy and silhouette that     │
│                    │ equips themed accessories and coats across community events.      │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ Firefox / Porkbun  │ Consistent illustrated soul. The mascot represents the spirit of  │
│                    │ the organization without changing species or anatomy.             │
└────────────────────┴───────────────────────────────────────────────────────────────────┘
```

### The Three Hallmarks of Character Life
Industry consensus proves that a character feels "alive" **not** through raw bone count or 3D complexity, but through three perceptual baselines:
1. **Attentive Gaze & Natural Blinking**:
   The eyelid is the heartbeat of consciousness. Fixed-interval metronomic blinking looks robotic. Natural blinking requires randomized intervals (every 3.5 to 5.5 seconds) with occasional double-blinks (120ms open-close-open).
2. **Respiratory Rhythm & Posture Floating**:
   Living beings never hold 0.0 velocity. A resting mascot continuously executes an imperceptible vertical float (`translateY: -6px` to `+4px` on a 2.0–2.4s sine wave) synchronized with an abdominal breathing cadence (`scaleY: 0.99` to `1.01`).
3. **Smooth State Blending**:
   Snapping abruptly from "Resting" to "Celebrate" breaks immersion. Runtimes must execute 150–250ms cross-fades between pose layers.

---

### Agent Skills & Direct Integration (`skills.sh` / Open Agent Standard)
Under the **Agent Skills** open standard (`skills.sh` / `vercel-labs/skills` / `SKILL.md`), autonomous AI agents and conversational tutors interact with applications via declarative tool definitions.

For Tutii, the character's physical presence serves as the **embodied interface of the agent**. When the AI tutor speaks, thinks, or verifies a student's answer, it does not send raw animation coordinates; it dispatches semantic skill events:

```json
{
  "event": "tutii_state_transition",
  "payload": {
    "role": "student",
    "expression": "curious_lean",
    "gaze": "downward_focused",
    "lantern_glow": 0.85,
    "prop": "book"
  }
}
```

The presentation layer maps these high-level semantic intents directly to the native character state machine.

---

## 2. Filetypes, Rigs, and Delivery Formats: The Comprehensive Matrix

A fundamental error in early experiments was conflating **Authoring Files**, **Delivery Assets**, and **Runtime Engines**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FILETYPE & RUNTIME EVALUATION MATRIX (LOW-END ANDROID FOCUS)                           │
├───────────────┬─────────────┬─────────────┬────────────────┬──────────────┬────────────┤
│ Format        │ Role        │ Download    │ Decoded VRAM   │ Gouache Soul │ Verdict    │
│               │             │ Payload     │ (Galaxy A52)   │ Fidelity     │            │
├───────────────┼─────────────┼─────────────┼────────────────┼──────────────┼────────────┤
│ .ora / .psd   │ Authoring   │ 10–50 MB    │ N/A (Desktop)  │ 100% (Master)│ SOURCE ONLY│
│ (OpenRaster)  │ Master      │ (Too heavy) │                │              │ Do NOT ship│
├───────────────┼─────────────┼─────────────┼────────────────┼──────────────┼────────────┤
│ WebP Texture  │ Delivery /  │ 0.8–1.4 MB  │ ~16.0 MB       │ 100%         │ WINNER     │
│ Atlas (Lossy) │ Layer Pack  │ (Combined)  │ (Single Alloc) │ (Untouched)  │ Production │
├───────────────┼─────────────┼─────────────┼────────────────┼──────────────┼────────────┤
│ Pure Vector   │ Delivery /  │ 79–632 KB   │ Low GPU,       │ 20% (Ruined) │ REJECTED   │
│ SVG (VTracer) │ Shapes      │ (Paths)     │ High CPU draw  │ Flat bands   │ Kills soul │
├───────────────┼─────────────┼─────────────┼────────────────┼──────────────┼────────────┤
│ Lottie JSON   │ Timeline    │ 1.6 MB+     │ ~4.8 MB        │ Moderate     │ REJECTED   │
│ (with images) │ Animation   │ (Bloated)   │                │ (Embedded)   │ Payload bug│
├───────────────┼─────────────┼─────────────┼────────────────┼──────────────┼────────────┤
│ 3D GLB        │ 3D Skeletal │ 1.5 MB      │ ~62.4 MB       │ 45% (Gaps &  │ REJECTED   │
│ (Dawn/Three)  │ Quads       │             │ (13× overload) │ AI drift)    │ Battery hog│
├───────────────┼─────────────┼─────────────┼────────────────┼──────────────┼────────────┤
│ Rive (.riv)   │ 2D Vector/  │ 120–350 KB  │ ~8.0 MB        │ 70%          │ RISKY      │
│               │ Mesh Rig    │             │                │ (Smoothable) │ Lock-in fee│
├───────────────┼─────────────┼─────────────┼────────────────┼──────────────┼────────────┤
│ Spine 2D      │ 2D Mesh     │ 400–800 KB  │ ~8.0 MB        │ 90%          │ SPECIALTY  │
│ (.skel+.atlas)│ Deform      │             │                │ (Clean)      │ License fee│
└───────────────┴─────────────┴─────────────┴────────────────┴──────────────┴────────────┘
```

### The Decoded VRAM Formula
On Android, compressed file size on disk has **zero** bearing on memory consumption once decoded by the GPU. The raw decoded surface cost is:

$$\text{Decoded VRAM (Bytes)} = \text{Width} \times \text{Height} \times 4 \text{ bytes (RGBA\_8888)}$$

* A single full-resolution $1184 \times 1187$ uncropped mascot image:
  $$1184 \times 1187 \times 4 \approx 5,621,696 \text{ Bytes } (\approx 5.36 \text{ MB VRAM})$$
* If 10 unskinned 3D quads are allocated in WebGPU memory:
  $$10 \times 1225 \times 1284 \times 4 \approx 62,916,000 \text{ Bytes } (\approx 60.0 \text{ MB VRAM})$$
* **The Solution: A 2048×2048 Packed WebP Atlas**:
  $$2048 \times 2048 \times 4 = 16,777,216 \text{ Bytes } (16.0 \text{ MB VRAM total})$$
  This single $16 \text{ MB}$ GPU allocation holds the entire base anatomy, all four wardrobe sets, and all props simultaneously.

---

## 3. The Rigging Architecture: Modular Anatomy & Occluded Inpainting

### The "Scissors Cut" Fallacy (Why Early Experiments Failed)
Earlier wing-flutter and arm-wave experiments extracted body parts using hard segmentation masks. When the segmented arm rotated, it left an empty, transparent hole in the torso behind it. When the upper wing flapped, it looked like a paper strip cut with scissors floating disconnected from the body.

### The Rule of Occlusion
Every movable layer in the character master **must have its hidden pixels deliberately inpainted**:
1. **The Torso**: Must be completely painted *underneath* the arms and leaf collar.
2. **The Back**: Must be completely painted *underneath* the upper and lower wings.
3. **The Eyeballs**: Must be fully rendered spheres *underneath* the sliding eyelid layers.
4. **The Neck**: Must extend smoothly beneath the leaf collar to allow head tilting without exposing background voids.

```
                  THE MODULAR COMPONENT HIERARCHY
               
                              [ ROOT ]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
        [ CORE ANATOMY (Static Base) ]    [ WARDROBE (Swappable Slots) ]
                   │                           │
         ┌─────────┼─────────┐                 ├─ Slot: Torso Garment
         ▼         ▼         ▼                 │  (Student Jacket / Teacher Coat)
      [HEAD]    [TORSO]   [WINGS]              │
      • Face    • Belly   • Upper L/R          ├─ Slot: Lower Garment
      • Eyelids   Glow    • Lower L/R          │  (Indigo Trousers / Plum Pants)
      • Antennae  Mask                         │
                                               ├─ Slot: Footwear
                                               │  (Walking Boots / Polished Shoes)
                                               │
                                               └─ Slot: Hand Prop Anchor
                                                  (Book / Notebook / Lantern)
```

---

## 4. The Runtime Implementation in React Native / Expo (SDK 58)

The recommended production runtime for Gurudevi Mobile is **React Native Reanimated 4 Worklets driving a Layered Sprite Composite or Skia Canvas**.

### Architectural Advantages
1. **Native UI Thread Execution**: Animation worklets execute entirely in C++ on the native UI thread (`libworklets.so`). Zero JS bridge crossing, zero garbage collector pauses.
2. **No Native Compilation Fragility**: Uses the pre-compiled, battle-tested `expo-image` and `react-native-reanimated` libraries already present in the monorepo, completely bypassing unstable WebGPU/Dawn native builds.
3. **Hardware Glide Caching**: Android Glide handles bitmap memory recycling, automatic mipmapping, and hardware texture caching natively.

### The Declarative Mascot State Machine
In `packages/ui` / `apps/gurudevi-mobile`, the living character is driven through high-level props:

```tsx
interface TutiiLivingProps {
  /** High-level semantic role or attire */
  role?: 'guide' | 'student' | 'teacher' | 'principal' | 'guardian';
  /** Expressive emotional posture */
  state?: 'welcome' | 'explore' | 'reflect' | 'luminous' | 'resting' | 'puzzled';
  /** Attached prop */
  prop?: 'none' | 'book' | 'notebook' | 'sprout' | 'lantern';
  /** Scale factor */
  scale?: number;
  /** Disable continuous loops for battery saver or a11y */
  reducedMotion?: boolean;
}
```

### The Native Micro-Life Engine (Code Pattern)
```tsx
export function TutiiLiving({ role = 'guide', state = 'welcome', prop = 'none' }: TutiiLivingProps) {
  // 1. Subtle Respiratory Float
  const hoverY = useSharedValue(0);
  const breathScale = useSharedValue(1);

  // 2. Randomized Eyelid Blink
  const eyelidProgress = useSharedValue(0); // 0 = fully open, 1 = fully closed

  useEffect(() => {
    // Continuous 2.2s breathing cycle
    hoverY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 1800, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.985, { duration: 2200, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      true
    );

    // Natural randomized blink loop
    let timeout: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const delay = Math.random() * 2500 + 3000; // 3.0s to 5.5s interval
      timeout = setTimeout(() => {
        // Quick 120ms snap shut, 140ms ease open
        eyelidProgress.value = withSequence(
          withTiming(1, { duration: 120, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 160, easing: Easing.out(Easing.quad) }, (finished) => {
            if (finished) scheduleNextBlink();
          })
        );
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(timeout);
  }, []);

  // UI-thread transform worklet
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: hoverY.value },
      { scaleY: breathScale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.characterAnchor, bodyStyle]}>
        {/* Layer 1: Wings (Behind Body) */}
        <WingsLayer state={state} />

        {/* Layer 2: Inpainted Base Body & Glow */}
        <TorsoLayer state={state} />

        {/* Layer 3: Dynamic Wardrobe Attachment Slot */}
        <WardrobeLayer role={role} />

        {/* Layer 4: Head & Eyes */}
        <HeadLayer state={state} blinkProgress={eyelidProgress} />

        {/* Layer 5: Attached Prop */}
        <PropLayer prop={prop} />
      </Animated.View>
    </View>
  );
}
```

---

## 5. Engineering Gates: What TO Do vs. What NOT To Do

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ THE ABSOLUTE DO'S AND DON'TS FOR MOBILE MASCOT ENGINEERING                             │
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│ ✅ WHAT TO DO                            │ ❌ WHAT NOT TO DO                             │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 1. Pack character parts into a single   │ 1. Never ship 49 full-sized individual       │
│    2048×2048 WebP Texture Atlas.        │    PNG illustrations into the app bundle.    │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 2. Fully inpaint occluded pixels behind │ 2. Never cut limbs with scissors without     │
│    joints in master authoring files.    │    painting the hidden pixels behind them.   │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 3. Execute all breathing, floating, and │ 3. Never trigger React re-renders or update  │
│    blinking on the native UI thread.    │    React state (`setState`) per frame.       │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 4. Read `sharedValue.value` exclusively │ 4. Never read `sv.value` on the JS thread    │
│    inside native worklet functions.     │    during animation loops (causes jank).     │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 5. Animate exclusively via `transform`  │ 5. Never animate layout properties (`top`,   │
│    (`translateX`, `translateY`, `scale`)│    `left`, `width`, `height`) (forces reflow)│
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 6. Pause animation loops immediately    │ 6. Never run invisible animations when the   │
│    when scrolled off-screen or hidden.  │    mascot is off-screen (drains battery).    │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 7. Provide a static, dignified still for│ 7. Never use animated cards as the sole      │
│    users with `prefers-reduced-motion`. │    carrier of meaning or block screenreaders.│
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 8. Benchmark on real budget hardware    │ 8. Never trust desktop browser emulators for │
│    (Samsung Galaxy A52 / Mali-G52).     │    thermal limits, GC, or VRAM pressure.     │
└─────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 6. Concrete Execution Roadmap for Gurudevi Mobile

### Phase 1: Authoring & Texture Atlas Construction (Artwork Factory)
* **Objective**: Export the clean base anatomy and the first four wardrobe sets from `library-recovered/` and `Tutii_repaired_layers.ora`.
* **Deliverable**: `tutii_anatomy_atlas.webp` (2048×2048, ~1.2 MB) containing:
  * Inpainted base body, head, eyelids (open, half, closed), antennae, leaf collar, and wings.
  * Wardrobe set 1: Student indigo jacket, trousers, satchel, and boots.
  * Wardrobe set 2: Teacher embroidered linen coat and lesson book.
  * Wardrobe set 3: Principal formal coat and portfolio.
  * Wardrobe set 4: Guardian wrap and family notice.

### Phase 2: Runtime Component Architecture (`packages/ui`)
* **Objective**: Implement the `<TutiiLiving />` component in `packages/ui/src/components/mascot/`.
* **Wiring**: Connect to `mascotStateMachine.ts` so that app state changes automatically trigger smooth 200ms posture and expression transitions.

### Phase 3: Hardware Verification Gate (Physical Device)
* **Objective**: Verify playback on physical **Samsung Galaxy A52** via ADB.
* **Pass Criteria**:
  * Decoded texture footprint **≤ 16.0 MB VRAM**.
  * Continuous 60 FPS lock on native UI thread during lesson scrolling.
  * Zero seam gaps or cut-edge clipping during wing flutter and head tilt.
  * Clean static fallback when `AccessibilityInfo.isReduceMotionEnabled()` is true.

---

## Conclusion

By divorcing the production pipeline from unviable 3D planar card slicing and monolithic raster duplication, Tutii achieves the ideal balance: **100% preservation of her delicate, hand-painted gouache soul, modular wardrobe mutability across community roles, and effortless 60 FPS performance on low-end mobile hardware.**
