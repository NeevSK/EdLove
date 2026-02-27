# Gurudevi — Living Theme Implementation Guide
### For AI Agents: Complete Implementation Instructions
*Read entirely before touching a single file.*

---

## 0. Who You Are Working With

You are implementing the visual soul of **Gurudevi** — an Education Ecology Support System. A sanctuary for learning, born with love.

The person you are working for (Neev) is the **idea originator and architect**. You are the implementation arm. Respect what already exists. Evolve it, don't replace it. The existing temporal phase system, BlurView architecture, and Reanimated animations are intentional and sophisticated. Your job is to pour the right soul into them, then layer Skia atmosphere on top.

**Core metaphor:** Lotus rising from mud. Blooms in water. Holds light from within.

**Never:**
- Replace working architecture with something new unless explicitly asked
- Use pure black `#000000` or pure white `#FFFFFF` anywhere
- Use grey or black-opacity shadows
- Use `rgba(255,255,255,x)` for glass surfaces
- Generate flat single-value color regions
- Place outer glow effects on light backgrounds
- Create new files without checking if the thing already exists somewhere

**Always:**
- Ask "does this file already exist?" before creating
- Use Shadow Violet `rgba(107, 100, 128, opacity)` for ALL shadows
- Use Vellum `#F5EDD6` as warm ground, never pure white
- Keep blur intensity either below 12 (intentionally transparent) or above 36 (intentionally frosted) — never the muddy middle zone 16-28
- Treat every surface as having a warm light variant and cool shadow variant

---

## 1. The Color Soul — Master Reference

These are the canonical Gurudevi colors. Every token in the system must trace back to these.

### Foundation Palette

```typescript
// SANCTUARY SAFFRON — primary, sacred, divine teacher's robe
// Saffron seen through morning mist — never flat orange
saffron: {
  full:    '#D4843A',  // Active, interactive, full presence
  muted:   '#C4956A',  // Saffron through mist — most common usage
  whisper: '#F0D4B0',  // Barely perceptible warmth
  deep:    '#A8622A',  // Pressed states, deep emphasis
}

// VELLUM — the ground of everything
// Book of Kells manuscript ground — warm off-white, never pure white
vellum: {
  warm:    '#F5EDD6',  // Standard ground — most backgrounds
  warmer:  '#FDF0DC',  // Community space — amber hour
  cool:    '#EEF0F5',  // Classroom space — clarity and focus
  neutral: '#FAF8F5',  // Profile space — quiet breathing
  deep:    '#E8DFC8',  // Pressed surfaces, depth
}

// DALU GREEN — living accent
// Young Sri Lankan tree leaves post-rain — translucent, luminous
dalu: {
  luminous: '#8BBF7A',  // Full living green — use sparingly
  deep:     '#5A8A4A',  // Forest depth, older leaves
  whisper:  '#D4EBC8',  // Barely perceptible life
  morning:  '#A8D494',  // Slightly cooler, morning dew quality
}

// AURORA — atmospheric, cool, ethereal
// Cool colors that glow — warm behavior in cool hues
aurora: {
  blue:    '#7DD4C0',  // Cool luminous surface
  violet:  '#B8A9E0',  // Ethereal depth, knowledge
  whisper: '#E8F4F1',  // Atmospheric mist
  deep:    '#5BA89A',  // Aurora depth
}

// LOTUS PINK — sacred moments only
// Use extremely sparingly — power comes from rarity
lotus: {
  pink:    '#E8A0B0',  // Celebration, achievement, sacred
  whisper: '#F8E8EC',  // Almost not there
}

// INK — text, never pure black
ink: {
  primary:   '#2A2318',              // Warm dark — all primary text
  secondary: 'rgba(42,35,24,0.60)', // Secondary text
  tertiary:  'rgba(42,35,24,0.35)', // Placeholder, hint text
  inverse:   '#F5EDD6',             // Text on dark backgrounds
}

// SHADOW VIOLET — ALL shadows in entire app
// This is non-negotiable. Never rgba(0,0,0,x). Ever.
shadow: {
  color: '#6B6480',
  xs:  'rgba(107,100,128,0.04)',  // 0px 1px 3px   — subtle depth
  sm:  'rgba(107,100,128,0.08)',  // 0px 2px 8px   — cards
  md:  'rgba(107,100,128,0.12)',  // 0px 4px 16px  — elevated cards
  lg:  'rgba(107,100,128,0.16)',  // 0px 8px 32px  — modals
  xl:  'rgba(107,100,128,0.20)', // 0px 16px 48px — overlays
}
```

---

## 2. The Temporal Phase System — Soul Upgrade

The existing temporal phase architecture is correct and beautiful. Do not change its structure. Only update the token values inside each phase. The system already shifts with time of day — now it needs to speak Gurudevi's actual color language.

### Phase Token Replacement

Replace ALL existing phase glass token values with these. Structure stays identical, values change completely.

```typescript
// ═══════════════════════════════════════════
// PREDAWN PHASE — deep indigo hour, 3am-5am
// Cool, still, intimate. The world before dawn.
// Reference: Aurora in darkest sky
// ═══════════════════════════════════════════
predawn: {
  // Glass tokens
  glass: {
    surface:   'rgba(26, 20, 35, 0.78)',      // Warm violet-dark — NOT cold navy
    border:    'rgba(184, 169, 224, 0.12)',   // Aurora violet edge
    highlight: 'rgba(184, 169, 224, 0.06)',  // Violet luminosity whisper
    blur: 44,                                 // COMMIT to frosted — deep night
  },
  // Surface colors
  background: '#1A1423',                      // Warm dark violet ground
  surface:    'rgba(35, 28, 48, 0.92)',       // Card surfaces
  // Accent behavior — aurora is most visible predawn
  accent:     '#B8A9E0',                      // Aurora violet leads
  accentWarm: '#7DD4C0',                      // Aurora blue secondary
  // Text
  text:       '#F5EDD6',                      // Vellum on dark
  textMuted:  'rgba(245,237,214,0.60)',
  // Shadows — still violet, just darker context
  shadow:     'rgba(107,100,128,0.24)',
},

// ═══════════════════════════════════════════
// DAWN PHASE — threshold hour, 5am-7am
// Light and dark in living tension — Goethe's trübe
// Reference: Sky just before sun appears
// ═══════════════════════════════════════════
dawn: {
  glass: {
    surface:   'rgba(235, 220, 195, 0.65)',   // Warm vellum emerging
    border:    'rgba(212, 132, 58, 0.18)',    // Saffron edge appearing
    highlight: 'rgba(212, 132, 58, 0.08)',   // First warmth
    blur: 32,
  },
  background: '#F0E4C8',
  surface:    'rgba(245, 237, 214, 0.88)',
  accent:     '#D4843A',                      // Saffron emerging
  accentWarm: '#8BBF7A',                      // Dalu waking
  text:       '#2A2318',                      // Ink primary
  textMuted:  'rgba(42,35,24,0.55)',
  shadow:     'rgba(107,100,128,0.08)',
},

// ═══════════════════════════════════════════
// MORNING PHASE — dalu hour, 7am-11am
// Post-rain quality. Luminous. Alive. Self space.
// Reference: Dalu leaves after rain, soft overcast sky
// ═══════════════════════════════════════════
morning: {
  glass: {
    surface:   'rgba(245, 237, 214, 0.68)',   // Vellum glass — warm not white
    border:    'rgba(139, 191, 122, 0.22)',   // Dalu green edge — life present
    highlight: 'rgba(212, 132, 58, 0.08)',   // Saffron warmth breathing through
    blur: 10,                                 // COMMIT to transparent — world shows through
  },
  background: '#F5EDD6',                      // Pure vellum
  surface:    'rgba(245, 237, 214, 0.92)',
  accent:     '#8BBF7A',                      // Dalu green leads morning
  accentWarm: '#D4843A',                      // Saffron secondary
  text:       '#2A2318',
  textMuted:  'rgba(42,35,24,0.55)',
  shadow:     'rgba(107,100,128,0.06)',        // Softest shadows — diffused morning light
},

// ═══════════════════════════════════════════
// MIDDAY PHASE — clarity hour, 11am-2pm
// Focused. Academic. Classroom energy.
// Reference: Clear sky, sharp shadows, structured light
// ═══════════════════════════════════════════
midday: {
  glass: {
    surface:   'rgba(238, 240, 245, 0.74)',   // Cool vellum — clarity
    border:    'rgba(125, 212, 192, 0.20)',   // Aurora blue edge — focused
    highlight: 'rgba(125, 212, 192, 0.08)',  // Cool luminosity
    blur: 12,                                 // Intentionally transparent — clear light
  },
  background: '#EEF0F5',                      // Cool vellum ground
  surface:    'rgba(238, 240, 245, 0.94)',
  accent:     '#7DD4C0',                      // Aurora blue leads — focus
  accentWarm: '#D4843A',                      // Saffron for actions
  text:       '#2A2318',
  textMuted:  'rgba(42,35,24,0.55)',
  shadow:     'rgba(107,100,128,0.10)',
},

// ═══════════════════════════════════════════
// AFTERNOON PHASE — gathering hour, 2pm-5pm
// Warming. Community energy building.
// Reference: Afternoon light through leaves, warmth building
// ═══════════════════════════════════════════
afternoon: {
  glass: {
    surface:   'rgba(253, 240, 220, 0.70)',   // Amber vellum warming
    border:    'rgba(212, 132, 58, 0.20)',    // Saffron border glowing
    highlight: 'rgba(212, 132, 58, 0.10)',   // Warm presence
    blur: 14,
  },
  background: '#FDF0DC',                      // Warmer vellum
  surface:    'rgba(253, 240, 220, 0.92)',
  accent:     '#D4843A',                      // Saffron leads afternoon
  accentWarm: '#8BBF7A',                      // Dalu secondary
  text:       '#2A2318',
  textMuted:  'rgba(42,35,24,0.55)',
  shadow:     'rgba(107,100,128,0.09)',
},

// ═══════════════════════════════════════════
// EVENING PHASE — warm gathering, 5pm-8pm
// Most human. Community. Ochre and amber.
// Reference: Golden hour, people gathering, firelight quality
// ═══════════════════════════════════════════
evening: {
  glass: {
    surface:   'rgba(253, 235, 200, 0.72)',   // Deep amber vellum
    border:    'rgba(212, 132, 58, 0.28)',    // Saffron border strongest here
    highlight: 'rgba(212, 132, 58, 0.14)',   // Warm glow present
    blur: 8,                                  // Most transparent — warmth shows through
  },
  background: '#FDE8C0',                      // Amber ground
  surface:    'rgba(253, 235, 200, 0.90)',
  accent:     '#D4843A',                      // Saffron full presence
  accentWarm: '#E8A0B0',                      // Lotus pink can emerge at evening
  text:       '#2A2318',
  textMuted:  'rgba(42,35,24,0.58)',
  shadow:     'rgba(107,100,128,0.10)',
},

// ═══════════════════════════════════════════
// DUSK PHASE — threshold closing, 8pm-10pm
// Mirror of dawn. Light returning to darkness.
// Reference: Sky after sunset, violet hour
// ═══════════════════════════════════════════
dusk: {
  glass: {
    surface:   'rgba(45, 35, 60, 0.72)',      // Violet dark emerging
    border:    'rgba(184, 169, 224, 0.16)',   // Aurora violet returning
    highlight: 'rgba(212, 132, 58, 0.08)',   // Last saffron warmth
    blur: 36,                                 // Frosting begins
  },
  background: '#2D2340',
  surface:    'rgba(55, 44, 72, 0.90)',
  accent:     '#B8A9E0',                      // Aurora violet returning
  accentWarm: '#D4843A',                      // Saffron last light
  text:       '#F5EDD6',
  textMuted:  'rgba(245,237,214,0.58)',
  shadow:     'rgba(107,100,128,0.20)',
},

// ═══════════════════════════════════════════
// NIGHT PHASE — library hour, 10pm-3am
// Deep. Jewel. Knowledge across time. Book of Kells.
// Reference: Illuminated manuscript by candlelight
// ═══════════════════════════════════════════
night: {
  glass: {
    surface:   'rgba(26, 20, 35, 0.82)',      // Deepest warm-violet dark
    border:    'rgba(184, 169, 224, 0.18)',   // Aurora violet most luminous at night
    highlight: 'rgba(125, 212, 192, 0.07)',  // Aurora blue depth
    blur: 48,                                 // Most frosted — night is deep and held
  },
  background: '#1A1423',                      // Warm dark — jewel ground
  surface:    'rgba(32, 25, 44, 0.94)',
  accent:     '#B8A9E0',                      // Aurora violet — knowledge depth
  accentWarm: '#7DD4C0',                      // Aurora blue secondary
  text:       '#F5EDD6',                      // Vellum text on dark
  textMuted:  'rgba(245,237,214,0.55)',
  shadow:     'rgba(107,100,128,0.28)',        // Deepest shadows at night
},
```

### Static Legacy Glass Token Replacement

Replace the flat static glass tokens used by GlassCard and simple components:

```typescript
// OLD — cold, generic, wrong
glassBg:        'rgba(15, 23, 42, 0.6)',
glassBorder:    'rgba(255, 255, 255, 0.1)',
glassHighlight: 'rgba(255, 255, 255, 0.05)',

// NEW — warm, Gurudevi, right
glassBg:        'rgba(26, 20, 35, 0.72)',      // Warm violet-dark
glassBorder:    'rgba(184, 169, 224, 0.12)',   // Aurora violet edge
glassHighlight: 'rgba(212, 132, 58, 0.06)',   // Saffron warmth breathing

// Light mode glass — vellum not white
glassLight: {
  surface:   'rgba(245, 237, 214, 0.72)',     // Vellum glass
  border:    'rgba(139, 191, 122, 0.20)',     // Dalu green edge
  highlight: 'rgba(212, 132, 58, 0.08)',     // Saffron warmth
}
```

---

## 3. Shadow System — The Non-Negotiable Rule

Find every shadow in the entire codebase and replace.

```bash
# Find all shadow color definitions
grep -r "shadowColor\|shadow.*rgba\|rgba(0,0,0\|rgba(0, 0, 0" \
  apps/gurudevi-mobile/src packages/ui/src packages/self/src \
  packages/classroom/src packages/community/src packages/library/src \
  --include="*.tsx" --include="*.ts" -l
```

For every file found, replace:

```typescript
// ANY of these patterns — replace all
shadowColor: '#000'
shadowColor: '#000000'  
shadowColor: 'rgba(0,0,0,0.x)'
shadowColor: 'black'
boxShadow: '... rgba(0,0,0,...)'

// WITH THIS — always, everywhere, no exceptions
shadowColor: '#6B6480'
// And ensure shadowOpacity, shadowRadius, shadowOffset are set appropriately
// xs: opacity 0.04, radius 3, offset {0,1}
// sm: opacity 0.08, radius 8, offset {0,2}  
// md: opacity 0.12, radius 16, offset {0,4}
// lg: opacity 0.16, radius 32, offset {0,8}
```

---

## 4. React Native Skia Integration

### Installation Verification

```bash
# Verify Skia is installed
cat apps/gurudevi-mobile/package.json | grep skia

# Should show @shopify/react-native-skia
# If not: npx expo install @shopify/react-native-skia
```

### File Location — Where Skia Lives

```
packages/ui/src/components-native/
├── index.ts                    ← exports all skia components
├── NoiseOverlay.tsx            ← global grain layer (BUILD FIRST)
├── LivingCard.tsx              ← subsurface card backgrounds
├── LuminousEdge.tsx            ← glowing edge treatment
├── TemporalGlass.tsx           ← phase-aware glass with Skia depth
└── shaders/
    └── warmGrain.ts            ← shader string constants
```

Import in gurudevi-mobile:
```typescript
import { NoiseOverlay, LivingCard, TemporalGlass } from '@gurudevi/ui/native';
```

packages/ui/package.json needs dual exports:
```json
{
  "exports": {
    ".": "./src/components/index.ts",
    "./native": "./src/components-native/index.ts"
  }
}
```

Pure RN components stay in packages/ui/src/components/ — cross-platform safe.
Skia components stay in packages/ui/src/components-native/ — mobile only.
Feature packages (self, classroom, community, library) never contain Skia directly.
If a web version of Gurudevi ever arrives — it imports from '@gurudevi/ui' only. Boundary already clean.

### Component 1 — NoiseOverlay (Build This First)

This is the highest-impact, lowest-risk change. Adds organic grain across entire app. Touches nothing existing. Immediately makes every surface feel alive instead of digital.

```typescript
// apps/gurudevi-mobile/src/components/skia/NoiseOverlay.tsx

import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Rect,
  Turbulence,
  ColorMatrix,
  Paint,
} from '@shopify/react-native-skia';

interface NoiseOverlayProps {
  opacity?: number;        // Default 0.03 — 3% warm grain
  warm?: boolean;          // Default true — warm tinted grain
  frequency?: number;      // Default 0.65 — grain fineness
}

export const NoiseOverlay: React.FC<NoiseOverlayProps> = ({
  opacity = 0.03,
  warm = true,
  frequency = 0.65,
}) => {
  const { width, height } = useWindowDimensions();

  // Warm grain color matrix — slight saffron tint
  // Cool grain color matrix — slight aurora tint
  const warmMatrix = [
    1, 0, 0, 0,  0.02,   // R: slight warm boost
    0, 1, 0, 0,  0.01,   // G: slight warm boost  
    0, 0, 1, 0, -0.01,   // B: slight cool reduction
    0, 0, 0, opacity, 0, // A: controlled opacity
  ];

  const coolMatrix = [
    1, 0, 0, 0, -0.01,   // R: slight cool reduction
    0, 1, 0, 0,  0.01,   // G: neutral
    0, 0, 1, 0,  0.02,   // B: slight cool boost
    0, 0, 0, opacity, 0,
  ];

  return (
    <Canvas
      style={[StyleSheet.absoluteFill, styles.canvas]}
      pointerEvents="none"  // Never intercepts touches
    >
      <Rect x={0} y={0} width={width} height={height}>
        <Paint>
          <Turbulence
            freqX={frequency}
            freqY={frequency}
            octaves={4}
            seed={2}
          />
          <ColorMatrix matrix={warm ? warmMatrix : coolMatrix} />
        </Paint>
      </Rect>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    zIndex: 9999,           // Above everything
    pointerEvents: 'none',  // Passes all touches through
  },
});
```

### Integrating NoiseOverlay Into Root Layout

Find the root layout file — likely `apps/gurudevi-mobile/app/_layout.tsx` or `apps/gurudevi-mobile/src/navigation/RootNavigator.tsx`.

Add NoiseOverlay as the last child, after all navigation:

```typescript
import { NoiseOverlay } from '../components/skia';

// Inside your root component return:
return (
  <View style={{ flex: 1 }}>
    {/* Your existing navigation — completely unchanged */}
    <Stack />
    
    {/* Skia grain overlay — sits above everything, passes touches through */}
    <NoiseOverlay opacity={0.03} warm={true} />
  </View>
);
```

For temporal phase awareness — pass warm based on current phase:

```typescript
const { currentPhase } = useTheme();
const isWarmPhase = ['morning', 'afternoon', 'evening'].includes(currentPhase);

<NoiseOverlay 
  opacity={0.03} 
  warm={isWarmPhase}
  frequency={currentPhase === 'night' ? 0.45 : 0.65} // Coarser grain at night
/>
```

### Component 2 — LivingCard

Wraps existing card children with subsurface scattering quality background. Does not replace existing cards — wraps them.

```typescript
// apps/gurudevi-mobile/src/components/skia/LivingCard.tsx

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import {
  Canvas,
  Rect,
  RadialGradient,
  vec,
  Turbulence,
  ColorMatrix,
  Group,
  RoundedRect,
} from '@shopify/react-native-skia';

interface LivingCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  width: number;           // Required — Skia needs explicit dimensions
  height: number;          // Required
  baseColor?: string;      // Default vellum
  warmCenter?: boolean;    // Default true — warm center, cool edges
  cornerRadius?: number;   // Default 16
  grainOpacity?: number;   // Default 0.04
}

export const LivingCard: React.FC<LivingCardProps> = ({
  children,
  style,
  width,
  height,
  baseColor = 'rgba(245, 237, 214, 0.92)',
  warmCenter = true,
  cornerRadius = 16,
  grainOpacity = 0.04,
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) * 0.7;

  // Warm center gradient — simulates subsurface scattering
  // Light enters at center, cools and desaturates toward edges
  const warmCenterColor = 'rgba(253, 245, 228, 0.95)';  // Warm vellum center
  const coolEdgeColor = 'rgba(235, 228, 215, 0.85)';     // Cooler vellum edge

  return (
    <View style={[{ width, height }, style]}>
      {/* Skia living background */}
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Base rounded rect */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={cornerRadius}
          color={baseColor}
        />
        
        {/* Subsurface scattering — warm center, cool edges */}
        {warmCenter && (
          <Group>
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={height}
              r={cornerRadius}
            >
              <RadialGradient
                c={vec(centerX, centerY * 0.6)}  // Center slightly high — light from above
                r={radius}
                colors={[warmCenterColor, coolEdgeColor]}
                positions={[0, 1]}
              />
            </RoundedRect>
          </Group>
        )}

        {/* Fine grain texture — organic surface */}
        <Rect x={0} y={0} width={width} height={height}>
          <Turbulence freqX={0.8} freqY={0.8} octaves={3} seed={5} />
          <ColorMatrix
            matrix={[
              1, 0, 0, 0,  0.01,
              0, 1, 0, 0,  0.005,
              0, 0, 1, 0, -0.005,
              0, 0, 0, grainOpacity, 0,
            ]}
          />
        </Rect>
      </Canvas>

      {/* Children — existing card content completely unchanged */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: cornerRadius, overflow: 'hidden' }]}>
        {children}
      </View>
    </View>
  );
};
```

### Component 3 — TemporalGlass

Enhances existing BlurView glass with Skia luminous border and subtle inner glow. Wraps the existing BlurView — does not replace it.

```typescript
// apps/gurudevi-mobile/src/components/skia/TemporalGlass.tsx

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Paint,
  BlurMask,
} from '@shopify/react-native-skia';

interface TemporalGlassProps {
  children: React.ReactNode;
  style?: ViewStyle;
  width: number;
  height: number;
  phase: 'predawn' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'dusk' | 'night';
  cornerRadius?: number;
}

// Phase-specific edge colors
const PHASE_EDGES = {
  predawn:   { top: 'rgba(184,169,224,0.20)', bottom: 'rgba(107,100,128,0.08)' },
  dawn:      { top: 'rgba(212,132,58,0.22)',  bottom: 'rgba(139,191,122,0.08)' },
  morning:   { top: 'rgba(212,132,58,0.18)',  bottom: 'rgba(139,191,122,0.12)' },
  midday:    { top: 'rgba(125,212,192,0.18)', bottom: 'rgba(107,100,128,0.08)' },
  afternoon: { top: 'rgba(212,132,58,0.20)',  bottom: 'rgba(184,169,224,0.08)' },
  evening:   { top: 'rgba(212,132,58,0.28)',  bottom: 'rgba(184,169,224,0.10)' },
  dusk:      { top: 'rgba(184,169,224,0.22)', bottom: 'rgba(107,100,128,0.12)' },
  night:     { top: 'rgba(184,169,224,0.24)', bottom: 'rgba(125,212,192,0.08)' },
};

export const TemporalGlass: React.FC<TemporalGlassProps> = ({
  children,
  style,
  width,
  height,
  phase,
  cornerRadius = 20,
}) => {
  const edges = PHASE_EDGES[phase];

  return (
    <View style={[{ width, height }, style]}>
      {/* Skia luminous border — phase-aware color */}
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Outer luminous edge */}
        <RoundedRect
          x={0.5}
          y={0.5}
          width={width - 1}
          height={height - 1}
          r={cornerRadius}
          style="stroke"
          strokeWidth={1}
        >
          <LinearGradient
            start={vec(width / 2, 0)}
            end={vec(width / 2, height)}
            colors={[edges.top, edges.bottom]}
          />
        </RoundedRect>

        {/* Inner top highlight — light hitting top edge of glass */}
        <RoundedRect
          x={2}
          y={2}
          width={width - 4}
          height={height * 0.3}
          r={cornerRadius - 2}
          style="stroke"
          strokeWidth={0.5}
        >
          <Paint color={edges.top} opacity={0.6}>
            <BlurMask blur={2} style="normal" />
          </Paint>
        </RoundedRect>
      </Canvas>

      {/* Existing BlurView children — completely unchanged */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: cornerRadius, overflow: 'hidden' }]}>
        {children}
      </View>
    </View>
  );
};
```

---

## 5. TabNavigator and Header Glass — The Most Visible Fix

The bottom tab navigator and global header are using blur intensity 16-20 which causes text to bleed through unpleasantly. This is the fix.

### Find TabNavigator Glass

```bash
cat apps/gurudevi-mobile/src/navigation/TabNavigator.tsx
```

### The Fix — Two Changes

**Change 1 — Blur intensity**

```typescript
// FIND this pattern (whatever intensity is currently set)
<BlurView intensity={20} ...>
// or
<BlurView intensity={16} ...>

// REPLACE based on phase:
// Light phases (morning, midday, afternoon) — intentionally transparent
<BlurView intensity={10} tint={isDark ? 'dark' : 'light'} ...>

// Dark phases (predawn, dusk, night) — intentionally frosted  
<BlurView intensity={44} tint="dark" ...>

// If not using phase-aware blur yet, use 44 as safe default
// Commit to frosted — eliminates the muddy bleeding text problem immediately
<BlurView intensity={44} tint={isDark ? 'dark' : 'light'} ...>
```

**Change 2 — Wrap with TemporalGlass**

After fixing blur, wrap the tab bar with TemporalGlass to add the luminous edge:

```typescript
import { TemporalGlass } from '../components/skia';

// In your tab bar render, wrap the BlurView container:
<TemporalGlass
  width={tabBarWidth}
  height={tabBarHeight}
  phase={currentPhase}
  cornerRadius={24}
  style={styles.tabBarContainer}
>
  <BlurView intensity={44} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
    {/* existing tab bar content unchanged */}
  </BlurView>
</TemporalGlass>
```

---

## 6. Existing Component Evolution — What To Do With Each

### GlassCard — Simple Token Update

GlassCard is architecturally simple and correct. Only needs updated token values (handled in Section 2) plus shadow color fix:

```typescript
// In GlassCard.tsx — add shadow with Shadow Violet
shadowColor: '#6B6480',  // Add this
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,
elevation: 3,
```

No Skia needed for GlassCard. Token update is enough.

### SanctuaryCard — BlurView Intensity Fix

SanctuaryCard already has excellent architecture — BlurView, Reanimated animations, phase awareness. Only needs:

1. Blur intensity fix (see Section 5, Change 1)
2. Shadow color replacement (Section 3)
3. Optional: wrap with TemporalGlass for luminous edge

Do not replace the Reanimated animation logic. It is working correctly.

### DailyResonanceCard — Candidate for LivingCard

This card likely displays content in Self space — the most intimate, alive space. Good candidate for LivingCard wrapping:

```typescript
// Measure the card dimensions first
// Then wrap:
<LivingCard
  width={cardWidth}
  height={cardHeight}
  warmCenter={true}
  grainOpacity={0.04}
  style={existingCardStyle}
>
  {/* existing DailyResonanceCard content unchanged */}
</LivingCard>
```

---

## 7. Space-Specific Color Behavior

When building or modifying screens in each space, use these as the governing color signatures:

### Self Space
Background: Vellum `#F5EDD6` | Accent: Dalu `#8BBF7A` | Glass: Morning phase tokens
Feel: Intimate, warm, living. Most grain. Softest shadows.

### Classroom Space  
Background: Cool Vellum `#EEF0F5` | Accent: Aurora Blue `#7DD4C0` | Glass: Midday phase tokens
Feel: Focused, clear, structured. Crisper edges. Medium shadows.

### Community Space
Background: Warm Vellum `#FDF0DC` | Accent: Saffron `#D4843A` | Glass: Evening phase tokens
Feel: Human, warm, relational. Most texture. Warmest grain.

### Library Space
Background: Vellum `#F5EDD6` | Accent: Aurora Violet `#B8A9E0` | Glass: Night phase tokens
Feel: Deep, jewel, timeless. Rich color complexity. Deepest shadows.

### Profile Space
Background: Neutral Vellum `#FAF8F5` | Accent: Saffron Muted `#C4956A` | Glass: Dawn phase tokens
Feel: Quiet, clean, breathing. Least grain. Softest presence.

---

## 8. Implementation Sequence — Do This In Order

Do not skip steps. Do not do step 3 before step 1 is confirmed working.

**STEP 1 — Token Soul Upgrade**
Update all phase glass token values (Section 2).
Update static glass tokens (Section 2).
Run app. Verify colors look warm and alive.
Expected outcome: Immediate palette transformation. Everything speaks Gurudevi's language.

**STEP 2 — Shadow Replacement**
Find all shadow colors (Section 3 bash command).
Replace every instance with Shadow Violet.
Run app. Verify no grey or black shadows anywhere.
Expected outcome: Depth feels chromatic and warm instead of cold.

**STEP 3 — Blur Intensity Fix**
Fix TabNavigator blur intensity (Section 5).
Fix Header blur intensity if applicable.
Run app. Verify text does not bleed through glass.
Expected outcome: Glass feels like material, not muddy overlay.

**STEP 4 — NoiseOverlay Global**
Create `apps/gurudevi-mobile/src/components/skia/NoiseOverlay.tsx` (Section 4).
Add to root layout (Section 4).
Run app. Verify subtle grain visible, no performance issues.
Expected outcome: Every surface gains organic texture. Digital flatness gone.

**STEP 5 — TemporalGlass on TabNavigator**
Wrap tab bar with TemporalGlass component (Section 5).
Expected outcome: Luminous phase-aware edges on navigation glass.

**STEP 6 — LivingCard First Usage**
Identify one card screen to test — Self space DailyResonanceCard recommended.
Wrap with LivingCard component.
Verify subsurface quality visible.
Expected outcome: Card surface breathes with warm center, cool edges.

**STEP 7 — Gradual Migration**
As you touch each screen in normal development, wrap cards with LivingCard.
Never do a big bang migration.
Let the living quality spread organically.

---

## 9. Performance Considerations

Skia runs on the GPU via the Skia rendering engine. It is fast. But be aware:

**NoiseOverlay** — uses Turbulence shader. Render once, display always. No per-frame computation. Safe globally.

**LivingCard** — RadialGradient and Turbulence per card. Fine for 5-10 visible cards. If you have long lists with 50+ cards, use `memo` and only apply LivingCard to hero/featured cards, not every list item.

**TemporalGlass** — renders two RoundedRect strokes. Extremely lightweight. Safe everywhere.

**General rule** — if a screen feels slow after adding Skia, check if LivingCard is inside a FlatList with many items. Move LivingCard to featured/hero cards only in list contexts.

---

## 10. The Test — How To Know It's Right

When the implementation is complete, the app should feel like:

Opening it in the morning feels different from opening it at night. Not just color — the material quality of the glass, the warmth of surfaces, the depth of shadows shifts with time.

Cards do not feel like flat rectangles with rounded corners. They feel like they have some quality of light within them — warm at center, slightly cooler at edges.

The bottom tab bar and header feel like actual material — frosted glass with a luminous edge — not a blurry overlay with text bleeding through.

The overall texture of the app has a subtle grain that you don't notice consciously but feel immediately when it's removed. Like the difference between film and digital. Between vellum and printer paper.

If someone looks at the app and says "this feels different, more alive" without being able to say exactly why — the implementation is correct.

That is the Gurudevi aesthetic. That is the lotus holding light from within. 🌿

---

*Document version 1.0 — February 2026*
*Gurudevi Design System — Skia Integration Guide*
*For implementation agents: read entirely before touching files*
