---
title: "Gurudevi Living Theme System â€” Design Document"
status: "active"
created: 2026-02-24
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Gurudevi Living Theme System — Design Document

> **Status:** Approved · Ready for implementation
> **Principle:** Follows TAIL_FIN.md — Tokens are Intent, Zero Fallback Rule, Library First, Convolutional Resonance.

---

## Vision

The app is a **living sanctuary** that breathes with the user's day. Two first-class themes (Light/Dark), each subdivided into temporal phases that shift mood, palette, and animation weight automatically. Every visual property derives from a single token matrix — change one value, the entire Sanctuary shifts simultaneously.

---

## 1. Temporal Phase Architecture

### 6 Phases (primary)

| Phase | Time | World | Mood |
|---|---|---|---|
| `predawn` | 4–6 am | Dark | Stillness, barely-lit stars, ultra-quiet |
| `dawn` | 6–9 am | Dark→Light transition | First warmth, rose-gold horizon bleed |
| `morning` | 9 am–12 pm | Light | Fresh, alive, dewy — new leaf energy |
| `afternoon` | 12–5 pm | Light | Full open light, warm and clear |
| `dusk` | 5–8 pm | Dark | Deep ocean, bioluminescent blues, coral |
| `night` | 8 pm–4 am | Dark | Cosmic Star Temple, gold stars, violet nebula |

### 4-Phase Fallback (for existing `temporalPhase` consumers)

```
predawn + dawn     → 'dawn'
morning + afternoon → 'day'
dusk               → 'dusk'
night              → 'night'
```

### Implementation Notes
- `EnvironmentContext` extended from 4 → 6 phases
- Auto-detected from device clock, overridable in `AppSettingsScreen`
- Theme mode (`light` / `dark` / `auto`) is a separate user setting
  - `auto`: follows device appearance setting
  - `light` / `dark`: manual override, phase still shifts sub-palette

---

## 2. Colour Token Matrix

### Architecture

All colors live in `packages/ui/src/theme/Theme.ts` as a `phases` map.
Components consume **semantic tokens only** — never phase-specific raw values.

```typescript
Theme.phases[phase][themeMode] = {
  // Backgrounds
  gradientNodes: [color0, color1, color2],   // AnimatedGradientMesh nodes

  // Glass surfaces (see Section 3)
  glass: {
    surface:   { bg, opacity, blur, border },
    modal:     { bg, opacity, blur, border },
    interact:  { bg, opacity, blur, border },
  },

  // Glow tokens
  glow: {
    soft:    { color, radius, opacity },   // ambient resting glow
    primary: { color, radius, opacity },   // identity / saffron pulse
    action:  { color, radius, opacity },   // button/CTA glow
    reward:  { color, radius, opacity },   // achievement celebration
  },

  // Accent colours
  accent: {
    action:  string,   // primary interactive (buttons, links, chips)
    reward:  string,   // achievements, celebrations
    danger:  string,   // destructive actions
    muted:   string,   // secondary/disabled states
  },

  // Text
  text: {
    primary:   string,
    secondary: string,
    inverse:   string,   // text on accent backgrounds
    muted:     string,
  },
}
```

### Palette Values

**DARK WORLD**

| Token | predawn | dawn | dusk | night |
|---|---|---|---|---|
| gradientNodes[0] | `#020617` | `#0F172A` | `#0C1A2E` | `#020617` |
| gradientNodes[1] | `#0A0F1E` | `#1E293B` | `#0E2A4A` | `#0F172A` |
| gradientNodes[2] | `#1E1B4B` | `#312E81` | `#134E7A` | `#1E1B4B` |
| accent.action | `#6D28D9` violet | `#E67E22` saffron | `#0EA5E9` teal | `#FDD925` gold |
| accent.reward | `#B45309` dim gold | `#DB7093` rose | `#F97316` coral | `#8B5CF6` violet |
| glow.primary | violet indigo | warm saffron | bioluminescent teal | nebula gold |

**LIGHT WORLD**

| Token | predawn | dawn | morning | afternoon |
|---|---|---|---|---|
| gradientNodes[0] | `#E8EAF6` lavender | `#FFF7ED` warm cream | `#F0F9FF` sky white | `#FAFAFA` clean white |
| gradientNodes[1] | `#F3F4F6` | `#FFFBF5` | `#E0F2FE` sky blue | `#F1F5F9` |
| gradientNodes[2] | `#DDD6FE` | `#FDE68A` | `#DCFCE7` leaf green | `#E0F2FE` |
| accent.action | `#7C3AED` violet | `#EA580C` saffron | `#16A34A` **leaf green** | `#0284C7` cerulean |
| accent.reward | `#D97706` amber | `#E11D48` rose | `#EA580C` **saffron** | `#D97706` saffron |

**Brand constant:** `sanctuarySaffron` appears in every phase — it is the golden thread.

### Semantic Resolver

```typescript
// useTheme() returns this — the ONLY interface components ever use
Theme.resolve(temporalPhase, themeMode): ResolvedTokens
```

`useTheme()` hook in `packages/ui/src/hooks/useTheme.ts` calls `Theme.resolve()` with current `temporalPhase` + `themeMode` from `useEnvironment()`.

---

## 3. Surface Language — Glass Protocol

Three elevation layers. Blur collapses to solid tint on low-tier devices.

| Layer | Token | Blur | Opacity | Use |
|---|---|---|---|---|
| Background | `glassBg` | 0 | 1.0 | Living gradient (SanctuaryBackground) |
| Cards / Sheets | `glass.surface` | 16px | 0.12 | SanctuaryCard, bottom sheets |
| Modals / Drawers | `glass.modal` | 24px | 0.18 | Modals, GlobalHeader |
| Buttons / Chips | `glass.interact` | 8px | 0.08 | Interactive elements, subtle |

**Border:** 1px — 15% white in dark mode, 20% dark-tint in light mode (`glassBorder` token).
**Shadow:** Phase-tinted using `glow.soft` token.

**Device tier fallback:**
- `enableBlur: false` → blur collapses to `glassBg` solid tint, same visual weight, zero blur cost
- `enableShadows: false` → glow shadows removed, border remains

**Glass flavour options (documented for future swapping via config):**
- A: Apple/iOS subtle (current default for interactive)
- B: Bold dramatic glass
- C: Neumorphic hybrid
- D: Layered depth (current default for surfaces) ← **active**

---

## 4. Background System — SanctuaryBackground

**Component:** `packages/ui/src/components/SanctuaryBackground.tsx`
**Rendered once:** Inside `TabNavigator`, behind all tabs. All screens are transparent over it.

### High / Mid devices (`enableAnimations: true`)
```
AnimatedGradientMesh (Reanimated worklet, UI thread):
  - 3 colour nodes from phase.gradientNodes
  - Drift speed: 0.3px/frame (~18px over 60 frames)
  - Scroll response: 0.05x parallax
  - Phase transition: 2s crossfade between palettes
  - Implemented as shared value interpolation — zero JS thread cost
```

### Low devices / `fidelityLevel: 'low'`
```
Static LinearGradient:
  - Same gradientNodes, frozen
  - Phase transition: instant swap (no animation)
```

### Future artwork layer (optional, additive)
When phase artwork is created, it slots as a layer between `glassBg` and `glass.surface` — zero architectural change required.

---

## 5. Animation System

Gated by `useEnvironment()` flags: `enableAnimations`, `enableBlur`, device tier.

### Tier 1 — Organic Baseline (all devices with `enableAnimations: true`)
```
Screen entry:     FadeInDown 500ms, staggered 150ms per section
Button press:     scale 1.0 → 0.95 → 1.02 → 1.0  (bloom, spring damping=15 stiffness=90)
Card tap:         ripple from touch point, accent.action tint, 300ms fade
Tab switch:       crossfade 200ms + 8px slide
Scroll:           native momentum, no overrides
```
> TAIL_FIN: "Screens do not pop. They breathe. The user must feel the UI making space."

### Tier 2 — Ceremonial (mid+ devices, meaningful moments only)
```
Form submit:      glow pulse from button → brief accent bloom → settle (400ms)
Grade posted:     ZoomIn + 1s glow.reward ring on card
Attendance done:  SVG checkmark draws itself (stroke animation, 400ms) + haptic
Profile 100%:     lotus bloom from avatar, glow.reward burst
Post published:   saffron ripple across feed
```

### Tier 3 — Celestial (high devices, `enableBlur: true`)
```
Phase transition: gradient morphs 2s + glass layers shimmer
Modal open:       BlurView blur expands outward (0 → 24px, 300ms)
Long-press:       card lifts — shadow grows, depth reveal (glass.interact → glass.modal)
FAB drag:         momentum spring, deceleration on release
```

### Low-end fallback
All tiers collapse to instant state changes. No animation, no jank. `SanctuaryButton` still changes color on press. UI remains fully functional.

---

## 6. Component Token Map

All components consume semantic tokens. No conditional color logic inside components.

```
SanctuaryCard:
  bg=glass.surface  border=glassBorder  shadow=glow.soft  text=text.primary

SanctuaryButton:
  primary:  bg=accent.action   shadow=glow.action  text=text.inverse
  secondary:bg=glass.surface   border=glassBorder  text=accent.action
  ghost:    bg=transparent     border=glassBorder  text=accent.action
  danger:   bg=accent.danger   shadow=glow.soft    text=text.inverse

SanctuaryChip:
  idle:     bg=glass.interact  border=glassBorder  text=text.secondary
  selected: bg=accent.action   border=none         text=text.inverse

SanctuaryInput:
  idle:     bg=glass.surface   border=glassBorder
  focused:  bg=glass.surface   border=accent.action  glow=glow.action (subtle)

GlobalHeader:    bg=glass.modal    blur=24px
TabBar:          bg=glass.surface  blur=16px  activeIcon=accent.action
LotusFAB:        bg=accent.action  glow=glow.primary  shadow=glow.action
SanctuaryCard (identity/verified): glow=glow.primary pulsing (Active Resonance)
```

---

## 7. Technical Architecture

### File Changes

| File | Change |
|---|---|
| `packages/ui/src/theme/Theme.ts` | Add `phases` matrix, `resolve()` function |
| `packages/ui/src/hooks/useTheme.ts` | New hook — returns resolved tokens for current phase+mode |
| `packages/ui/src/context/EnvironmentContext.tsx` | Extend `temporalPhase` from 4 → 6 phases |
| `packages/ui/src/context/types.ts` | Add `TemporalPhase` type with 6 values + 4-phase fallback map |
| `packages/ui/src/components/SanctuaryBackground.tsx` | New — animated gradient mesh component |
| `packages/ui/src/components/SanctuaryCard.tsx` | Consume `useTheme()` tokens |
| `packages/ui/src/components/SanctuaryButton.tsx` | Consume `useTheme()` tokens |
| `packages/ui/src/components/SanctuaryChip.tsx` | Consume `useTheme()` tokens |
| `packages/ui/src/components/SanctuaryInput.tsx` | Consume `useTheme()` tokens |
| `packages/ui/src/components/GlobalHeader.tsx` | Consume `useTheme()` tokens + glass.modal |
| `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx` | Render SanctuaryBackground, tabBar glass tokens |
| `packages/ui/src/index.ts` | Export new components + hook |

### Convolutional Resonance
Once `useTheme()` is wired and `Theme.resolve()` is the single source — every component across Classroom, Community, Library, Profile, Self gets the Living Theme for free. No per-module changes needed.

### Zero Fallback Rule compliance
If a semantic token is missing in any phase, the duty is to expand `Theme.phases` — never add a local fallback hex in a component.

---

## Open Options (documented, not implemented)

- **Glass flavour B/C** — swappable via `Theme.glassStyle` config key
- **Phase artwork layer** — additive PNG/SVG layer in SanctuaryBackground
- **Custom phase boundaries** — user-configurable time ranges in AppSettingsScreen
- **Manual phase lock** — user can pin a phase (e.g. always Night)

---

*Designed in alignment with TAIL_FIN.md v1.2 — The Convolutional Soul.*
