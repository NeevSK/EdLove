# Gurudevi — Design Retina
### UI Vision Lens for AI Agents
*The surface that receives Gurudevi's light and converts it into faithful signal*

---

## 🧭 The Steering Harness (TAIL-FIN Integration)

This document is governed by the principles in [TAIL_FIN.md](../../../../docs/TAIL_FIN.md). Every UI task must be an act of **Reparative Extraction** rather than mere "Software Writing."

### 1. The Convolutional Command
*   **Upstream First**: If you find yourself importing from `@gluestack-ui/themed` or `react-native` inside a screen, you are likely violating the **Metacognitive OS**. Shared logic must reside in `@repo/ui`.
*   **Aesthetic Resonance**: If a component looks "flat," it is because it lacks the **Glass Protocol** or **Breath-like Motion**. Self-correct before requested.

### 2. The Reparative Mindset
*   **Zero Biological Waste**: Magic numbers (e.g., `padding: 100`) and raw hex codes are "Software Decay." Every value must be a **Token of Intent**.

## What This Document Is

This is not a philosophy document. It is not a long read.

It is a **retina** — a precise translation layer between Gurudevi's visual soul and your implementation decisions. Every UI task you do for Gurudevi should be filtered through this lens first.

Read it entirely once before writing a single line of UI code.
Keep it in context for the entire session.

---

## The One Question

Before finishing any UI element, ask:

> **"Does this feel alive or does it feel made?"**

Alive — organic, breathing, warm, luminous from within, micro-variation present
Made — flat, cold, uniform, generic, could belong to any app

If it feels made — something below is being violated. Find it and fix it.

---

## The Absolute Rules — Never Violate These

These are not preferences. They are laws.

### Color Laws

```
❌ NEVER  #FFFFFF pure white — anywhere, ever
❌ NEVER  #000000 pure black — text, shadows, anywhere
❌ NEVER  rgba(0,0,0,x) — shadows, overlays, anything
❌ NEVER  grey shadows — rgba(128,128,128,x) or similar
❌ NEVER  flat grey neutrals — #888, #999, #ccc as UI colors
❌ NEVER  hardcode hex values in components — always use tokens

✅ ALWAYS #F5EDD6 vellum — default background (never pure white)
✅ ALWAYS #2A2318 ink deep — default text (never pure black)
✅ ALWAYS rgba(107,100,128,x) — ALL shadows, always Shadow Violet
✅ ALWAYS import colors from @gurudevi/design-tokens
✅ ALWAYS use theme tokens — never raw hex in component files
```

### Surface Laws

```
❌ NEVER flat single-value color on any surface
❌ NEVER outer glow on light backgrounds — physically wrong
❌ NEVER blur intensity 16-28 — the muddy zone, commits to nothing
❌ NEVER pure white glass surfaces

✅ ALWAYS micro-variation on surfaces — warm center, cool edges
✅ ALWAYS blur either ≤12 (transparent) or ≥36 (frosted) — commit
✅ ALWAYS vellum-based glass — rgba(245,237,214,x) not rgba(255,255,255,x)
✅ ALWAYS light comes THROUGH surfaces, not FROM edges
```

### Architecture Laws

```
❌ NEVER create a file without checking if it exists first
❌ NEVER hardcode colors in StyleSheet
❌ NEVER put Skia in feature packages (self, classroom etc)
❌ NEVER rgba(0,0,0,x) for shadows — ever, anywhere

✅ ALWAYS search before creating: find . -name "ComponentName*" | grep -v node_modules
✅ ALWAYS import UI from @gurudevi/ui
✅ ALWAYS import Skia from @gurudevi/ui/native
✅ ALWAYS put screens in apps/gurudevi-mobile/src/screens/[space]/
✅ ALWAYS put shared components in packages/ui/src/components/
```

---

## The Master Palette — Memorize This

```typescript
// THE GROUND — never pure white
vellum:         '#F5EDD6'   // warm off-white, manuscript quality
vellumWarm:     '#FDF0DC'   // Community space, amber hour
vellumCool:     '#EEF0F5'   // Classroom space, clarity
vellumNeutral:  '#FAF8F5'   // Profile space, quiet

// THE PRIMARY — sacred, warm, divine teacher
saffron:        '#f6bf8cff'   // full presence, primary actions
saffronMuted:   '#C4956A'   // most common usage, morning mist
saffronWhisper: '#F0D4B0'   // barely there warmth

// THE LIVING ACCENT — post-rain luminous leaf
daluGreen:      '#8BBF7A'   // luminous, alive, Self space
daluDeep:       '#5A8A4A'   // forest depth
daluWhisper:    '#D4EBC8'   // barely perceptible life

// THE ATMOSPHERIC — cool, ethereal
auroraBlue:     '#7DD4C0'   // focused, Classroom space
auroraViolet:   '#B8A9E0'   // depth, Library space
auroraWhisper:  '#E8F4F1'   // atmospheric mist

// THE SACRED MOMENT — use sparingly
lotusPink:      '#E8A0B0'   // celebrations, achievements only

// THE TEXT — warm ink, never black
inkPrimary:     '#2A2318'   // all primary text
inkSecondary:   'rgba(42,35,24,0.60)'
inkTertiary:    'rgba(42,35,24,0.35)'
inkInverse:     '#F5EDD6'   // text on dark backgrounds

// THE SHADOW — always and only this
shadowViolet:   '#6B6480'
shadowXS:       'rgba(107,100,128,0.04)'
shadowSM:       'rgba(107,100,128,0.08)'
shadowMD:       'rgba(107,100,128,0.12)'
shadowLG:       'rgba(107,100,128,0.16)'
shadowXL:       'rgba(107,100,128,0.20)'
```

---

## The Two Worlds

Gurudevi has two sovereign worlds determined by the user's device theme setting. They are not just color inversions — they are two different souls.

### Light World — Silk and Elegance

```
Character:   Sleek. Elegant. Silk quality.
Ground:      Vellum — warm, breathing
Light:       Comes FROM outside, surfaces reflect beautifully
Elevation:   Higher = more clarity, crisper edges, stronger silk
Shadows:     Soft, barely present, Shadow Violet at low opacity
Glass:       Transparent tendency — world breathes through
Micro-var:   Warm highlights, cool recesses — like silk catching light
Grain:       Fine, warm, 2-3%
```

### Dark World — Ethereal and Bioluminescent

```
Character:   Ethereal. Aurora. Bioluminescent.
Ground:      Deep warm violet — not cold navy
Light:       Comes FROM WITHIN — surfaces generate their own glow
Elevation:   Higher = more luminosity, stronger inner glow
Shadows:     Chromatic, deeper violet, more present
Glass:       Frosted tendency — depth held within
Micro-var:   Luminous center, darker recesses — like deep water
Grain:       Slightly coarser, cooler, 2-3%
Inner glow:  Top edge of elevated elements glows softly upward
```

**Critical difference in elevation behavior:**

```
Light world: card elevated → crisper shadow below, cleaner surface
Dark world:  card elevated → subtle inner glow at top edge, luminous
```

---

## The Temporal Phase Matrix

Two axes. Independent. Always active simultaneously.

**Axis 1** — World (device setting): `light` | `dark`
**Axis 2** — Phase (time of day): `predawn` | `dawn` | `morning` | `midday` | `afternoon` | `evening` | `dusk` | `night`

```typescript
// Access the current coordinate via useTheme()
const { world, phase, tokens } = useTheme();
// tokens = phases[world][phase]
// This gives you the exact right values for this moment
```

### Key Phase Personalities

```
PREDAWN   — Still. Hushed. Cool violet. Aurora barely visible.
DAWN      — Threshold. Warm emerging. First saffron warmth.
MORNING   — Most alive. Dalu luminous. Post-rain quality.
MIDDAY    — Crispest. Aurora blue. Classroom focus.
AFTERNOON — Warming. Saffron building. Community energy.
EVENING   — Warmest. Amber. Human gathering.
DUSK      — Violet returning. Mirror of dawn.
NIGHT     — Deepest. Jewel. Book of Kells. Library hour.
```

### Light World Phase Behavior

```
Light + Morning  → silk at its most alive, dalu accent leads
Light + Midday   → silk crispest, aurora blue leads, structure
Light + Evening  → silk warming, saffron leads, amber warmth
Light + Night    → moonlit vellum, quiet silk, muted and held
Light + Predawn  → silk hushed, cool violet whisper, still
```

### Dark World Phase Behavior

```
Dark + Night     → full bioluminescence, aurora peak, jewel depth
Dark + Predawn   → deepest dark, violet dominant, aurora still
Dark + Morning   → aurora softening into day, gentle luminosity
Dark + Evening   → warmest dark, bioluminescent amber glow
Dark + Midday    → aurora focused, cool depth, structured glow
```

---

## The Five Spaces — Color Signatures

Each space has its own personality within the world × phase matrix.

```
SELF        → Most intimate. Warm. Morning phase always leads.
              Accent: Dalu green. Ground: vellum.warm
              Feel: Safe, held, alive. Maximum grain.

CLASSROOM   → Focused. Structured. Midday phase leads.
              Accent: Aurora blue. Ground: vellum.cool
              Feel: Clear, academic, warm-institutional.

COMMUNITY   → Most human. Warmest. Evening phase leads.
              Accent: Saffron full. Ground: vellum.warmer
              Feel: Gathered, relational, amber warmth.

LIBRARY     → Timeless. Deep. Night phase ALWAYS regardless of time.
              Accent: Aurora violet. Ground: vellum standard
              Feel: Ancient, jewel, knowledge held across centuries.

PROFILE     → Quietest. Clean. Dawn phase leads.
              Accent: Saffron muted. Ground: vellum.neutral
              Feel: Spacious, personal, threshold quality.
```

---

## Component Behavior Patterns

### Cards

```typescript
// Light world card
{
  backgroundColor: tokens.surface,      // phase-appropriate vellum
  borderRadius: 14,
  shadowColor: '#6B6480',               // ALWAYS Shadow Violet
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  // Inner: warm center gradient via Skia LivingCard if available
}

// Dark world card
{
  backgroundColor: tokens.surface,      // phase-appropriate deep surface
  borderRadius: 14,
  shadowColor: '#6B6480',
  shadowOffset: { width: 0, height: 0 }, // dark: glow not shadow
  shadowOpacity: 0.20,
  shadowRadius: 16,
  // Inner: luminous top edge — light comes from within
}
```

### Buttons

```typescript
// Primary — always saffron
{
  backgroundColor: '#D4843A',
  borderRadius: 14,
  shadowColor: '#6B6480',   // Shadow Violet even on colored button
  // Text: '#F5EDD6' ink inverse — never pure white
}

// Secondary — outlined
{
  backgroundColor: 'transparent',
  borderColor: '#C4956A',   // saffron muted
  borderWidth: 1.5,
  // Text: '#D4843A' saffron full
}

// Never: grey disabled state
// Disabled: saffron.whisper '#F0D4B0', text ink.tertiary
// Never goes cold — even disabled stays warm
```

### Glass Surfaces (Navigation, Sheets, Modals)

```typescript
// Get from useTheme() — never hardcode glass values
const { tokens } = useTheme();

// tokens.glass.surface  — phase + world appropriate
// tokens.glass.border   — luminous edge color
// tokens.glass.blur     — committed value (≤12 or ≥36)

// Light world glass: vellum-based, transparent tendency
// Dark world glass: deep violet-based, frosted tendency
```

### Text Hierarchy

```typescript
// All text — warm ink, never pure black
primary:   '#2A2318'              // headings, important content
secondary: 'rgba(42,35,24,0.60)' // body text, descriptions
tertiary:  'rgba(42,35,24,0.35)' // placeholders, hints, captions
inverse:   '#F5EDD6'             // text on dark backgrounds (vellum not white)
accent:    tokens.phase.accent    // links, active states, current phase color

// On dark backgrounds:
// primary → '#F5EDD6' vellum
// secondary → 'rgba(245,237,214,0.60)'
// tertiary → 'rgba(245,237,214,0.35)'
```

---

## Empty States — Never Punish

```
❌ NEVER "No data found"
❌ NEVER "Nothing here yet"
❌ NEVER sad illustration with grey colors
❌ NEVER clinical language

✅ ALWAYS warm, inviting language pointing toward possibility
✅ ALWAYS phase-appropriate accent color in illustration
✅ ALWAYS "Your first [thing] is waiting to be [created/written/shared]"
```

---

## Placeholders — The Voice of the Sanctuary

```
❌ NEVER "Enter text here"
❌ NEVER "Type something"
❌ NEVER generic form language

✅ ALWAYS contextual, warm, human
✅ Self mood: "How are you holding yourself today?"
✅ Search: "What do you want to understand today?"
✅ Note: "This space is yours..."
✅ Community post: "What's alive in you to share?"
```

---

## The Silk Test — For Light World UI

Look at what you built in light mode. Ask:

Is there micro-variation on surfaces — or flat uniform color?
Do shadows feel like gentle depth — or harsh black weight?
Do the colors feel warm and breathing — or cold and clinical?
Does text feel like warm ink on vellum — or black pixels on white?
Does the primary action feel like an invitation — or a command?

If any answer is wrong — find the violated rule above and fix it.

---

## The Bioluminescence Test — For Dark World UI

Look at what you built in dark mode. Ask:

Do elevated elements seem to glow from within — or just sit on dark?
Are colors luminous and deep — or flat dark with white text?
Do glass surfaces feel frosted and material — or muddy and undefined?
Is the aurora quality present — cool colors with warm luminous behavior?
Does the overall screen feel like deep water with light below — or just dark mode?

If any answer is wrong — find the violated rule above and fix it.

---

## Quick Reference — Common Violations and Fixes

| What you see | What's wrong | Fix |
|---|---|---|
| Flat white background | Pure white used | Replace with vellum #F5EDD6 |
| Heavy dark shadows | Black shadow color | Replace with Shadow Violet |
| Cold grey disabled button | Grey used | Use saffron.whisper + ink.tertiary |
| Text bleeding through glass | Blur in muddy zone | Commit to ≤12 or ≥36 |
| Lifeless flat card | No micro-variation | Add warm center gradient or LivingCard |
| Generic notification badge | Red used | Replace with saffron #D4843A |
| Cold empty state | Generic language + grey | Warm language + phase accent |
| Outer glow on light bg | Wrong glow direction | Inner luminosity only |
| Pure black text | #000 used | Replace with ink #2A2318 |
| Wrong shadow color | rgba(0,0,0,x) | Replace with rgba(107,100,128,x) |

---

## File Location Quick Reference

```
Screens:              apps/gurudevi-mobile/src/screens/[space]/
Navigation:           apps/gurudevi-mobile/src/navigation/
Skia components:      packages/ui/src/components-native/
Pure RN components:   packages/ui/src/components/
Feature components:   packages/[space]/src/components/
Design tokens:        packages/design-tokens/src/
Hooks:                packages/[space]/src/hooks/ or packages/ui/src/hooks/
```

**Before creating any file:**
```bash
find . -name "YourComponentName*" | grep -v node_modules
```

---

## The Final Check

Before submitting any UI work — run through this list:

```
□ No pure white (#FFFFFF) anywhere
□ No pure black (#000000) anywhere  
□ No rgba(0,0,0,x) shadows anywhere
□ All shadows use Shadow Violet rgba(107,100,128,x)
□ Background is vellum-based not pure white
□ Text is ink-based not pure black
□ No hardcoded hex values in components
□ No flat uniform surfaces — micro-variation present
□ Blur is committed — ≤12 or ≥36, not 16-28
□ Empty states use warm inviting language
□ Placeholders speak with sanctuary voice
□ File created in correct location
□ Existing files checked before creating new ones
□ Does it feel alive or does it feel made?
```

If all checked — ship it. 🌿

---

*Document version 1.0 — February 2026*
*Gurudevi Design Retina*
*The surface that receives light and converts it into faithful signal*
*For every agent — large or small — who builds in this sanctuary*
