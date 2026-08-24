---
title: "Gurudevi Ã¢â‚¬â€ AI Session Starter"
status: "active"
created: 2026-02-28
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi â€” AI Session Starter
### Paste This At The Beginning of Every Agent Session

---

## The Compact Version (Under 200 words â€” for quick sessions)

```
I am building Gurudevi â€” an Education Ecology Support System. A sanctuary for learning, born with love, built with love.

Core metaphor: Lotus rising from mud, blooming in water, holding light from within.
App name meaning: Not goddess â€” divine teacher. One who creates conditions for blooming.

Tech stack: Expo SDK 57, React Native 0.86, New Architecture only, @shopify/react-native-skia installed.
Monorepo: apps/gurudevi-mobile (thin shell), packages/ui, packages/self, packages/classroom, packages/community, packages/library, packages/core.
Skia components location: packages/ui/src/components-native/ â€” import via '@gurudevi/ui/native'

Visual references: Secret of Kells 2009 film, dalu leaves post-rain, aurora borealis, Book of Kells manuscript.

Color rules (non-negotiable):
â€” Primary: Sanctuary Saffron #D4843A
â€” Ground: Vellum #F5EDD6 (never pure white)
â€” ALL shadows: rgba(107,100,128,opacity) â€” Shadow Violet, never grey or black
â€” Living accent: Dalu Green #8BBF7A
â€” Atmospheric: Aurora Blue #95f5deff, Aurora Violet #e78ddbff
â€” Text: Ink #2A2318 (never pure black)

Luminosity: light comes THROUGH surfaces, not FROM edges. Inner luminosity, never outer glow on light backgrounds.

Before creating any file: check if it already exists. Ask if unsure.
```

---

## The Full Version (For complex or architectural sessions)

```
I am building Gurudevi â€” an Education Ecology Support System inspired by Bronfenbrenner's ecological systems theory and Ashby's Law of Requisite Variety. A sanctuary for learning. Born with love, built with love.

IDENTITY
App name: Gurudevi â€” not goddess, but divine teacher. One who creates conditions for blooming.
Core metaphor: The lotus. Rises from mud, blooms in water, holds light from within.
Five spaces: Self (intimate glade), Classroom (structured grove), Community (gathering clearing), Library (ancient forest), Profile (threshold).
Three roles, one reality: Student, Teacher, Principal â€” same app, different views.

TECH STACK
Expo SDK 57, React Native 0.86, React 19.2, New Architecture only (Legacy Architecture removed in SDK 55).
@shopify/react-native-skia â€” installed, for pixel-level rendering and fragment shaders.
react-native-reanimated 4 + react-native-worklets â€” for animations.
Monorepo structure:
  apps/gurudevi-mobile â€” thin shell, navigation, screen composition
  apps/gurudevi-marketingWeb, apps/neevsk-web, apps/foundation-web â€” separate web apps
  packages/ui â€” shared UI components (pure RN + dedicated mobile-only native boundary)
  packages/self, classroom, community, library, profile â€” feature modules
  packages/core â€” shared utilities (native deps as peerDependencies)
  packages/scanner-kit â€” OCR/QR/ML (native, mobile only)
  packages/design-tokens â€” color tokens, theme (SINGLE SOURCE OF TRUTH)
Skia components location: packages/ui/src/components-native/
  Import in mobile: import { NoiseOverlay } from '@gurudevi/ui/native'
  Web apps import only from '@gurudevi/ui' â€” never '@gurudevi/ui/native'
  Never scatter Skia across feature packages â€” all Skia in components-native only

VISUAL SOUL
References: Secret of Kells 2009 film, dalu (young Sri Lankan tree leaves post-rain), aurora borealis, Book of Kells illuminated manuscript.
Core principle: Color is never one color. Color is an experiential event. Design for scenes, not swatches.
Luminosity: Light comes THROUGH surfaces (subsurface scattering), never FROM edges. No outer glow on light backgrounds.
Shadows: Always chromatic and cool â€” Shadow Violet rgba(107,100,128,x). Never grey. Never black opacity. This is non-negotiable.
Flatness: Nothing is one uniform color. Micro-variation always. Global 3% warm Perlin noise grain overlay via Skia.

MASTER PALETTE
Sanctuary Saffron #D4843A â€” primary, sacred, divine teacher's robe (saffron through morning mist)
Saffron Muted #C4956A â€” secondary saffron, most common
Vellum #F5EDD6 â€” ground of everything (never pure white #FFFFFF)
Dalu Green #8BBF7A â€” living accent, post-rain luminous leaf
Aurora Blue #7DD4C0 â€” atmospheric, cool, focused
Aurora Violet #B8A9E0 â€” depth, knowledge, ethereal
Lotus Pink #E8A0B0 â€” sacred moments only, used very sparingly
Ink Deep #2A2318 â€” all text (never pure black #000000)
Shadow Violet #6B6480 â€” ALL shadows, all components, always

TEMPORAL PHASE SYSTEM
The app has a living theme that shifts with time of day.
Phases: predawn / dawn / morning / midday / afternoon / evening / dusk / night
Each phase has: glass.surface, glass.border, glass.highlight, glass.blur, background, accent, shadow
Blur commits: below 12 (transparent) or above 36 (frosted) â€” never the muddy 16-28 range
See: packages/design-tokens for full phase token values

FIVE SPACE SIGNATURES
Self: vellum.warm ground, dalu accent, morning phase, 3% warm grain, softest shadows
Classroom: vellum.cool ground, aurora.blue accent, midday phase, 2% cool grain
Community: vellum.warmer ground, saffron accent, evening phase, 4% warm grain (warmest)
Library: vellum ground, aurora.violet accent, night phase ALWAYS (timeless), fine grain
Profile: vellum.neutral ground, saffron.muted accent, dawn phase, 1% grain (quietest)

SKIA COMPONENTS (already built or to build)
NoiseOverlay â€” global warm grain, added to root layout, pointerEvents none, always on top
LivingCard â€” subsurface scattering quality card backgrounds (warm center, cool edges)
TemporalGlass â€” phase-aware luminous edge treatment for glass surfaces
TemporalGlass wraps existing BlurView â€” never replaces it

EXISTING ARCHITECTURE (respect this)
SanctuaryCard â€” BlurView + Reanimated animations, phase-aware, already sophisticated
GlassCard â€” simple token-based glass, used for lightweight glass needs
Temporal phase system â€” already implemented, only needs correct token values
TabNavigator â€” glass bar, needs blur intensity fix (commit to transparent or frosted)

WHAT NEVER TO DO
â€” Never use pure white #FFFFFF as background
â€” Never use pure black #000000 for text or shadows
â€” Never use rgba(0,0,0,x) for shadows â€” always Shadow Violet
â€” Never blur at intensity 16-28 â€” commit to transparent (â‰¤12) or frosted (â‰¥36)
â€” Never add outer glow to light background elements
â€” Never create flat single-value color regions â€” use micro-variation
â€” Never hardcode color values in components â€” always consume from theme tokens
â€” Never scatter Skia components across feature packages (self, classroom etc) â€” all Skia lives in packages/ui/src/components-native/
â€” Never create a file without checking if it already exists first
â€” Never use "No data found" or punishing empty states
â€” Never make interactions feel urgent or alarming without genuine need

WHAT ALWAYS TO DO
â€” Read the full session starter before writing any code
â€” Check existing files before creating new ones
â€” Use Shadow Violet for every shadow in the system
â€” Use Vellum as ground, never pure white
â€” Ask "does this feel alive or does it feel made?" before finalizing
â€” Treat the empty state as an invitation, not a failure
â€” Honor the teacher-student relationship as sacred
â€” Remember: Gurudevi is a sanctuary, not a productivity app
```

---

## Session-Type Specific Additions

### For Growth / Gamification / Aliveness Sessions
```
Additional context: Gurudevi uses a NATURE-INSPIRED GROWTH MODEL, NOT conventional gamification.
Reference: apps/gurudevi-mobile/docs/Core/GROWTH_MODEL.md â€” read before touching any growth mechanics.

Key rules:
â€” NO points as visible scores. NO leaderboards. NO streak shaming. (North Star Law 3: EROI)
â€” Growth is measured across 5 Aliveness Dimensions: Presence, Nourishing, Witnessing, Weaving, Blooming
â€” The Bhumi Model uses Lotus Life Stages (Bijam â†’ Purna Kamala) â€” not numerical levels
â€” Whispered Moments are hidden discoveries, NOT a badge collection system
â€” Thuthimal (alumni gifting subscriptions) is the HIGHEST recognition event â€” human-sourced, not algorithmic
â€” The existing rewards.ts / AchievementGallery.tsx is misaligned with this model â€” see GROWTH_MODEL.md Section 9
â€” Memory Garden replaces Achievement Gallery; Lotus Life Stage replaces Stats/Points display
```

### For Color/Theme Sessions
```
Additional context: The temporal phase system is the living heart of Gurudevi's theme.
Phases shift automatically based on device time.
Token file location: packages/design-tokens/src/
Phase token structure: { glass: { surface, border, highlight, blur }, background, surface, accent, accentWarm, text, textMuted, shadow }
Current known issue: static glass tokens (glassBg, glassBorder, glassHighlight) still use cold values â€” update to warm Gurudevi values.
```

### For Component Sessions
```
Additional context: Component library lives in packages/ui/src/components/
Skia-enhanced components live in packages/ui/src/components-native/
When wrapping existing components with Skia: use wrapper pattern (LivingCard, TemporalGlass) â€” never rewrite working components.
Reanimated animation logic in SanctuaryCard is intentional â€” do not remove or replace.
```

### For Screen/Feature Sessions
```
Additional context: Screens live in apps/gurudevi-mobile/src/screens/
Specify which space this screen belongs to: self / classroom / community / library / profile
Apply the space color signature from the Space Specifications document.
Role consideration: is this screen visible to student / teacher / principal? Design accordingly.
Privacy rule: student Self data is never visible to any other role without explicit consent.
```

### For Architecture Sessions
```
Additional context: Before touching any file structure, run diagnostic:
  find . -name "*.tsx" | grep -v node_modules | sort
  npx tsc --noEmit
  npx expo-doctor
Monorepo uses workspaces. Native dependencies must be peerDependencies in packages, concrete in apps/gurudevi-mobile.
Golden rule: if a file will only ever be used in gurudevi-mobile, it stays in gurudevi-mobile.
If it will be shared across apps, it goes in packages. If it uses React Native primitives (not usable on web), it stays in app.
```

---

## The One Sentence Reminder

When in doubt about any decision â€” ask: **"Does this feel like something alive, or something made?"**

The lotus doesn't look designed. Neither should Gurudevi. ðŸŒ¿

---

*Document version 1.0 â€” February 2026*
*Gurudevi AI Session Starter*
*The compressed soul of a sanctuary â€” ready for every new conversation*
