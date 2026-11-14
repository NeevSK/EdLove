---
title: "Tutii Mascot Character Bible & Persona Guide"
status: "active"
created: 2026-10-18
updated: 2026-10-18
author: "Naveen"
scribe: "Antigravity"
tags: [gurudevi, edlove, mascot, tutii, character-bible, art-direction, design-system]
---

# Tutii Mascot Character Bible & Persona Guide

> **Core Philosophy**: Tutii is not an ornament, a cartoon sticker, or an intrusive gamification badge. Tutii is a calm, luminous companion with presence that guides without cluttering the screen or enclosing human dignity.

---

## 1. Persona & Identity

### Identity & Origins
- **Name**: **Tutii** (pronounced *Too-tee*)
- **Role**: Luminous Sanctuary Guide & Quiet Companion
- **Species**: Sacred Firefly (*Khadyota* / Light-bearer)
- **Ethos**: Luminous, attentive, patient, gentle, curious, and grounded in human dignity.

### The Personality Invariant
Tutii lives in a spacious, quiet app surface. The app should feel quiet; Tutii should feel gently alive inside that quiet.
- **Tutii notices**: Attentive eye gaze directs user focus toward the next clear step.
- **Tutii welcomes**: Warm, open posture without aggressive jumping or excessive waving.
- **Tutii waits**: Patient, restful posture when user is thinking, reading, or offline.
- **Tutii guides**: Creates a soft dotted light path toward actionable recovery when an error occurs.
- **Tutii rejoices**: Expresses quiet relief and luminous brightening when a goal completes—never noisy confetti or clownish fanfare.

---

## 2. Voice & Tone (Microcopy & Interaction)

| Context | What Tutii Does / Says | ❌ Anti-Pattern (What Tutii NEVER Does) |
| :--- | :--- | :--- |
| **Welcome / Onboarding** | *"Welcome back. Let's pick up where you left off."* | *"WOOHOO! Are you ready to crush your goals today?!"* (Hyperactive) |
| **Empty State** | *"Your sanctuary is quiet. Begin by adding your first reflection."* | *"Nothing here! So lonely! Click me!"* (Manipulative / Needy) |
| **Network / Interrupted Path** | *"The path is quiet right now. We'll hold your changes safe until you reconnect."* | *"Oopsie daisy! Something went boom!"* (Infantilizing) |
| **Completion / Milestone** | *"A steady step forward."* (Soft luminous pulse) | Explosion of bouncing coins, confetti, and sound horns. (Addictive dopamine loops) |

---

## 3. Visual Grammar & Anatomy

Tutii shares a consistent anatomy across all states:

```
           (•) (•)   <-- Glowing Antenna Tips (Soft gold aura)
           /_____\   <-- Purple/Warm Ink Head with large attentive eyes
          [ ✿ ✿ ✿ ]  <-- Green Lotus Collar (Grounding biological link)
         /  ▲ ▲ ▲  \ <-- Translucent, Veined Wings (Ethereal cream/glass)
        (   ◉   )  <-- Luminous Golden Amber Body (Saffron/Lantern glow)
         \_______/   <-- Slender, expressive limbs (Subtle, purposeful gestures)
```

### Color Palette

| Token / Role | Hex Value | Application |
| :--- | :--- | :--- |
| **Vellum** | `#F5EDD6` | Grounded surface and backdrop |
| **Ink** | `#2A2318` | Head, eye contour, body lines, primary typography |
| **Saffron** | `#D4843A` | Active light, forward movement, warm torso |
| **Lantern** | `#FFC107` | Core luminous centre, antenna tips |
| **Lotus / Dalu** | `#8BBF7A` | Collar petals, grounding flora, success states |
| **Weathered Amber** | `#D4A03A` | Interrupted path, paused state, offline indicator |

---

## 4. Scale & Fidelity Contracts

To ensure instant recognition at any viewport:

1. **Micro Scale (24px - 32px)**:
   - Simplified silhouette: Golden drop body, luminous antenna spark, clear eye dot.
   - Zero internal vein detailing; high-contrast ink contour.
2. **Standard Component Scale (48px - 96px)**:
   - Full silhouette: Lotus collar visible, translucent wing shapes, directional gaze.
   - Primary scale for tooltips, card waypoints, and inline status badges.
3. **Hero / Sanctuary Scene (176px - 240px max)**:
   - Soft dimensional shading, delicate wing veining, subtle luminous glow path.
   - Capped height on mobile to prevent viewport displacement of interactive controls.

---

## 5. Hostile Scaling & Performance Guardrails

### Memory Budget (Budget Mobile Protection)
- **One Active State Only**: Never mount multiple animated mascot frames simultaneously.
- **Zero Full-Deck Prefetching**: Poses are loaded lazily on demand.
- **Bounded Delivery Dimensions**: Never serve 2048px review PNGs to mobile runtime. Mobile assets must use pre-downscaled WebP with `expo-image` disk caching.
- **Low-Tier RGB Fallback**: Low-memory Android devices decode in RGB format where applicable.

### Motion Guardrails (Convivial Limit)
- **Reduced Motion Contract**: If `prefers-reduced-motion` is active, Tutii must remain completely static with zero loop timers or opacity breathing.
- **UI-Thread Only**: All micro-motion (opacity breath, subtle float) runs strictly via native UI-thread Worklets or CSS properties—zero React JS-thread frame locks.
