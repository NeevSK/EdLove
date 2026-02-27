# Gurudevi Design Language
### A Living Design Constitution
*Sanctuary born with love. Built with love.*

---

## 0. The Soul — Before Any Technical Decision

**Gurudevi** — not goddess, but divine teacher. The one who creates conditions for blooming, not the one who gives answers.

The app is an **Education Ecology Support System** — inspired by Bronfenbrenner's nested ecological systems, guided by Ashby's Law of Requisite Variety. One reality. Different views. Principal, teacher, student — same living forest, different clearings.

The central metaphor is the **lotus** — rises from mud, blooms in water, holds light from within. This is what real teachers do for students. This is what students try to do for themselves. This is Sri Lankan. This is ancient. This is the design.

Every color decision, every shadow, every texture, every moment of luminosity in this app — serves this metaphor. Nothing is decoration. Everything is ecology.

---

## 1. The Cosmology of Color — What We Believe

> *"Color is never one color. Color is an entire experiential event."*

We do not design with colors. We design with **color scenes** — the way a dalu leaf after rain is not just green, but light passing through translucent tissue, contrasted against darker older leaves, cooled by overcast sky, made luminous by subsurface scattering.

Our foundational beliefs about color:

**Color only exists in relationship.** A color placed alone means nothing. It becomes itself only in the company of what surrounds it — temperature, value, context, the simultaneous contrast your eye generates at every edge.

**Darkness is not absence of light.** Following Goethe — darkness is an active force. Our most alive colors live at the threshold between light and dark. Not pure bright. Not pure dark. *Between.* This is where the lotus lives.

**Luminosity is not brightness.** Brightness is a number. Luminosity is the feeling that light came *through* something alive — subsurface scattering, the physical signature of organic living material. Skin. Leaves. Petals. Water. We design for luminosity, never mere brightness.

**Shadows are chromatic and cool.** Shadows in nature are never grey or darkened versions of the surface color. They are lit by sky, not sun — therefore cool, slightly blue-violet, slightly chromatic. Any shadow in Gurudevi that is merely grey or black-opacity is wrong.

**Flat color is dead color.** Nothing in nature is one uniform value across a region. A leaf has veins, micro-variation, translucent edges. We use noise, grain, subtle gradients not as decoration but as *aliveness*.

---

## 2. The Reference World — Anchoring Aesthetic Imagination

When prompting AI or making decisions, these are the living references that anchor Gurudevi's visual world:

### Dalu Leaves — Post-Rain Morning
Young tree leaves after rain. That specific translucent green where light passes through chlorophyll-laden tissue and emerges transformed. The overcast sky creating soft directionless light with no harsh shadows. Colors looking more themselves. More true. This is the feeling of the Self space — intimate, alive, quietly luminous.

*Technical translation: High value, moderate chroma, cool green-yellow hue. Subsurface scattering quality — color more saturated and warm at center, cooling toward edges. Soft diffused light, no directional highlights.*

### Aurora Borealis
Cool colors that emit light — the paradox. Warm behavior (luminosity, glow) wrapped in cool hues (blue, violet, soft green). It shouldn't glow but it does. The tension between warm behavior and cool color is exactly the magic. Dark ground, luminous color floating above it, each color intensified by the darkness around it.

*Technical translation: Dark background, mid-value cool hues at moderate-high chroma. Selective luminosity — most of palette muted, one or two colors quietly vivid. Soft gradient edges, no hard borders on luminous elements.*

### Secret of Kells (2009 Film) — Tomm Moore
Not the manuscript itself — the animated film. Flat shapes carrying complex living color. The forest floor isn't one green — it's warm yellow-green at light points cooling to blue-green in shadow. Monastery walls aren't one cream — warm ochre in light, cool grey-violet in shadow. Jewel-like color complexity on flat 2D surfaces. Deep forest greens with yellow warmth underneath. Ink blues almost violet. Warm vellum creams. Rare vivid accents — crimson, illuminated gold — that feel supernatural against the muted complexity around them.

*Technical translation: Always two temperature variants of every color — warm version for light, cool version for shadow. Nothing is one flat color even in seemingly simple regions. Shadows are cool and chromatic. Accents used sparingly — their power comes from the muted field around them.*

### Book of Kells — The Manuscript
Contained richness. Deep but not harsh. Intricate but not chaotic. Pigments layered, sometimes translucent over each other. Warm vellum ground breathing through. Gold leaf creating actual light reflection. Verdigris green. Deep lapis blue. Warm ochre. Crimson. The palette of illuminated knowledge — jewel-like, sacred, held across time.

*Technical translation: Warm vellum ground (#F5EDD6 approximately). Deep chromatic colors sitting on it rather than fighting it. Layered opacity creating depth. This is the Library's color world.*

### Lotus — The Unifying Symbol
Warm pink-white petals cooling toward edges. Yellow center warming the whole. Semi-translucent tissue with subsurface scattering. Floating — never heavy, never flat, always in relationship with the water below. Rising from darkness (mud) through a turbid medium (water) into light.

*Technical translation: The lotus embodies the core color behavior — warm center cooling outward, translucent quality, floating above a contrasting ground, never fully opaque.*

---

## 3. The Physical Scene — How To Describe To AI

Never give AI emotional words alone. Always translate to physical scene descriptions.

**Instead of:** "make it ethereal"
**Say:** "Background is warm off-white with barely perceptible green cast, Munsell value 96/100, chroma 2/100. Primary interactive elements are cool blue-green, value 75/100, chroma 35/100. Shadows are blue-violet at 8% opacity with 24px spread zero offset. Apply 3% Perlin noise grain overlay globally."

**Instead of:** "make it luminous"
**Say:** "Color has subsurface scattering quality — slightly more saturated and 5% warmer at center, desaturating and cooling 8% toward edges over 40px radius. No outer glow. Light comes from within, not from edges."

**Instead of:** "aurora feel"
**Say:** "Dark ground (#1A1F2E), floating elements in cool blue-green (#7DD4C0) and soft violet (#B8A9E0) at moderate opacity (85%). Elements appear to emit light rather than reflect it. Background has very subtle warm noise texture at 2% opacity. Shadows non-existent or barely perceptible cool blue at 4% opacity."

**Instead of:** "Secret of Kells color"
**Say:** "Every colored region has two temperature variants — light areas use warm version of hue, shadow areas use cool version shifted 15-20 degrees toward blue-violet. Ground color is warm vellum (#F5EDD6). Shadows are desaturated violet (#8B86A0) at 12-20% opacity. Highlight edges are warm ochre (#D4A853) at 10% opacity."

---

## 4. The Master Palette — Gurudevi Color System

### Foundation Colors

| Name | Role | Hex | Munsell Approximate | Feel |
|------|------|-----|-------------------|------|
| Sanctuary Saffron | Primary | `#D4843A` | 5YR 6/8 | Warm, sacred, the divine teacher's robe |
| Saffron Muted | Primary Muted | `#C4956A` | 5YR 7/5 | Saffron seen through morning mist |
| Saffron Ground | Surface Warm | `#FDF3E7` | 5YR 96/2 | Vellum, dawn light on white wall |
| Dalu Green | Living Accent | `#8BBF7A` | 5GY 7/6 | Young leaf, post-rain, translucent |
| Dalu Deep | Green Shadow | `#5A8A4A` | 5GY 5/6 | Older leaf, depth in the forest |
| Aurora Blue | Cool Accent | `#7DD4C0` | 5BG 7/6 | Aurora surface, post-rain sky reflection |
| Aurora Violet | Ethereal | `#B8A9E0` | 5P 7/5 | Aurora edge, twilight atmosphere |
| Lotus Pink | Sacred Moment | `#E8A0B0` | 5R 7/5 | Lotus petal, used sparingly |
| Vellum | Ground Light | `#F5EDD6` | 5Y 94/3 | Book of Kells ground, warm neutral |
| Ink Deep | Text Primary | `#2A2318` | 5YR 2/2 | Warm dark, never pure black |
| Shadow Violet | All Shadows | `#6B6480` | 5P 4/3 | Chromatic cool shadow, never grey |

### Color Behavior Rules

**Saffron** — primary interactive color. Buttons, links, key actions. Never flat — always has subtle warm-to-cool gradient within. Light source from top-left warm, cooling toward bottom-right.

**Dalu Green** — life, growth, health indicators, Self space accents. Luminous quality essential. If it looks like a flat web green (#4CAF50 style) it is wrong.

**Aurora Blue/Violet** — atmospheric depth, secondary information, Community space. These colors should feel like they're slightly behind the surface plane.

**Lotus Pink** — use extremely sparingly. Celebrations, achievements, sacred moments. Its power comes entirely from rarity.

**Shadow Violet** — every single shadow in the entire app. Never rgba(0,0,0,0.x). Always this violet at appropriate opacity. This single rule changes everything.

**Vellum** — the default background. Not white. Never pure white. The warm breath under everything.

---

## 5. The Five Spaces — Individual Color Signatures

Each space is a different clearing in the same forest. Same light source. Same palette family. Different temperature and mood.

### Self — The Intimate Garden
*Safe. Alive. Reflective. Personal.*

The most warm space. Morning light. This is where you bring your mood, your notes, your sleep, your venting. It should feel like a private journal left open on a warm windowsill.

Primary surface: Vellum `#F5EDD6`
Accent: Dalu Green `#8BBF7A` — luminous, alive
Shadow: Shadow Violet `#6B6480` at 6% opacity
Highlights: Saffron Muted `#C4956A` for warmth
Noise grain overlay: 3% warm grain
Light temperature: Warm, 5500K equivalent
Feel: Subsurface scattering quality on cards — light from within

### Classroom — The Focused Space
*Academic. Structured. Sri Lankan institutional warmth.*

Not cold institutional. Warm institutional. The particular quality of a Sri Lankan classroom — louvre windows, morning light, chalk dust, school uniform blue. More defined edges than other spaces. Cleaner contrast. But still within the living palette — never dead.

Primary surface: Cooler vellum `#EEF0F5` — barely blue-tinted white
Accent: Aurora Blue `#7DD4C0` — focused, clear
Secondary: Saffron `#D4843A` — warmth in structure
Shadow: Shadow Violet at 10% — slightly stronger definition
Noise grain: 2% cool grain
Light temperature: Cooler, 6500K equivalent
Feel: Crisper edges, more defined hierarchy, still breathing

### Community — The Relational Field
*Emergent. Healing. Warm gathering.*

The most human space. Where people meet, where feedback loops heal, where emergence happens. Warmest temperature of all five. Ochre, amber, the feeling of people gathered around fire or a shared meal.

Primary surface: Warm vellum `#FDF0DC` — slightly more amber
Accent: Saffron `#D4843A` — full warmth here
Secondary: Lotus Pink `#E8A0B0` — connection, care
Shadow: Shadow Violet at 8% with warm tint
Noise grain: 4% warm grain — most textured space
Light temperature: Warmest, 4500K equivalent
Feel: Most organic, most textured, feels most alive

### Library — The Deep Knowledge Space
*Epistemic. Vast. Timeless.*

The oldest feeling. Book of Kells lives here. The feeling of knowledge held across centuries. Deep jewel tones on warm vellum. This is where the world's best diverse holistic digital library should feel like — not a database, but a scriptorium, a forest of knowing.

Primary surface: Vellum `#F5EDD6` — the manuscript ground
Accent: Aurora Violet `#B8A9E0` — depth, mystery, knowledge
Secondary: Dalu Deep `#5A8A4A` — ancient forest
Tertiary: Saffron `#D4843A` — illuminated gold moments
Shadow: Shadow Violet at 15% — deepest shadows here
Noise grain: 2% fine grain — like vellum texture
Light temperature: Neutral warm, 5000K
Feel: Most layered, most complex color. Like light through stained glass.

### Profile — The Quiet Space
*Neutral. Settings. Personal details.*

The negative space that lets everything else breathe. Most muted. Clean. Still within the living palette but quietest. The space between notes in music.

Primary surface: Near-white vellum `#FAF8F5`
Accent: Saffron Muted `#C4956A` — soft identity
Shadow: Shadow Violet at 5% — barely there
Noise grain: 1% — almost imperceptible
Light temperature: Neutral, 5500K
Feel: Clean, spacious, never cold

---

## 6. Shadow System — The Single Most Important Rule

Every shadow in Gurudevi uses Shadow Violet `#6B6480`.

Never `rgba(0, 0, 0, opacity)`. Never grey shadows. Never black shadows.

### Shadow Scale

| Level | Usage | Value |
|-------|-------|-------|
| Shadow XS | Subtle depth, cards on vellum | `rgba(107, 100, 128, 0.04)` 0px 1px 3px |
| Shadow SM | Cards, interactive elements | `rgba(107, 100, 128, 0.08)` 0px 2px 8px |
| Shadow MD | Elevated cards, modals | `rgba(107, 100, 128, 0.12)` 0px 4px 16px |
| Shadow LG | Bottom sheets, overlays | `rgba(107, 100, 128, 0.16)` 0px 8px 32px |
| Shadow XL | Full screen modals | `rgba(107, 100, 128, 0.20)` 0px 16px 48px |

Shadows never have sharp edges. Minimum spread is 3x the offset. Soft, atmospheric, like natural diffused light.

---

## 7. Luminosity System — Making Flat Digital Colors Breathe

### The Subsurface Rule
Primary cards and surfaces should not be flat color. They should have a very subtle inner gradient simulating subsurface scattering:

```
Center: base color at 100% saturation
Edge: base color desaturated 8-12%, cooled 5-10 degrees hue shift toward blue
```

This is imperceptible as a gradient but deeply perceptible as aliveness.

### The Noise Rule
Global noise/grain overlay across entire app: 2-4% opacity fine Perlin noise in warm tone. This single addition does more for organic feeling than almost any other technique. Invisible when looking for it. Immediately felt when removed.

### The Luminous Accent Rule
Luminosity comes from contrast with surroundings, not from brightness alone. The Dalu Green feels luminous because everything around it is more muted. Never increase brightness of accent colors. Instead, increase the mutedness of everything else.

### Temperature Variation Rule
Every region of color has two versions — light and shadow. Light version is warm. Shadow version is cool (shifted 15-20 degrees toward violet). This is what the Secret of Kells film does on every surface. A flat card surface should have warm highlight at top-left, cool shadow at bottom-right.

---

## 8. Typography Color System

**Primary text:** Ink Deep `#2A2318` — warm dark, never pure black
**Secondary text:** Ink Deep at 60% opacity
**Tertiary text / placeholder:** Ink Deep at 35% opacity
**Accent text / links:** Sanctuary Saffron `#D4843A`
**Destructive / error:** Warm red `#C44B3A` — never pure #FF0000
**Success:** Dalu Green `#8BBF7A`
**Warning:** Saffron `#D4843A`

Text on dark backgrounds uses warm white `#F5EDD6` not pure white `#FFFFFF`.

---

## 9. Technical Implementation — Expo 55 + React Native Skia

### Stack
Expo SDK 55, React Native 0.83, React 19.2, New Architecture only.
`@shopify/react-native-skia` for pixel-level rendering, fragment shaders, noise overlays.

### Design Token Naming Convention

```typescript
// Philosophy: tokens carry scene memory, not just values
const GurudeviTokens = {
  
  // Surfaces
  surface: {
    vellum: '#F5EDD6',          // The manuscript ground
    vellumWarm: '#FDF0DC',      // Community warmth
    vellumCool: '#EEF0F5',      // Classroom clarity
    vellumNeutral: '#FAF8F5',   // Profile quiet
  },
  
  // Primary
  saffron: {
    full: '#D4843A',            // Sacred, active, divine teacher
    muted: '#C4956A',           // Saffron through morning mist
    whisper: '#F0D4B0',         // Barely there warmth
  },
  
  // Living accents
  dalu: {
    luminous: '#8BBF7A',        // Post-rain young leaf
    deep: '#5A8A4A',            // Forest depth
    whisper: '#D4EBC8',         // Barely perceptible life
  },
  
  // Atmospheric
  aurora: {
    blue: '#7DD4C0',            // Cool luminous surface
    violet: '#B8A9E0',          // Ethereal depth
    whisper: '#E8F4F1',         // Atmospheric mist
  },
  
  // Sacred moment
  lotus: {
    pink: '#E8A0B0',            // Use sparingly
    whisper: '#F8E8EC',         // Almost not there
  },
  
  // Shadows — always violet, never grey
  shadow: {
    color: '#6B6480',
    xs: 'rgba(107, 100, 128, 0.04)',
    sm: 'rgba(107, 100, 128, 0.08)',
    md: 'rgba(107, 100, 128, 0.12)',
    lg: 'rgba(107, 100, 128, 0.16)',
    xl: 'rgba(107, 100, 128, 0.20)',
  },
  
  // Text — warm ink, never pure black
  ink: {
    primary: '#2A2318',
    secondary: 'rgba(42, 35, 24, 0.60)',
    tertiary: 'rgba(42, 35, 24, 0.35)',
    inverse: '#F5EDD6',
  },
}
```

### Skia Shader Approach

For surfaces needing subsurface scattering quality — primarily Self space cards, Library items, any element meant to feel alive:

```glsl
// Fragment shader concept — warm center cooling outward
// Simulates light passing through organic translucent material
uniform float2 iResolution;
uniform float4 baseColor;
uniform float scatterRadius;
uniform float warmShift; // 0.0-1.0

float4 main(float2 fragCoord) {
  float2 center = iResolution / 2.0;
  float dist = distance(fragCoord, center) / scatterRadius;
  
  // Warm at center, cool at edges — subsurface scattering
  float4 warmColor = baseColor + float4(warmShift * 0.05, warmShift * 0.02, -warmShift * 0.03, 0);
  float4 coolColor = baseColor - float4(0.03, 0.01, -0.04, 0);
  
  return mix(warmColor, coolColor, smoothstep(0.0, 1.0, dist));
}
```

### Noise Grain Overlay

Applied globally via Skia canvas layer above all content:

```typescript
// Warm Perlin noise at 2-4% opacity
// Creates organic texture that makes flat digital surfaces feel alive
const NoiseOverlay = () => {
  const { width, height } = useWindowDimensions();
  
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height}>
        <Turbulence freqX={0.65} freqY={0.65} octaves={4} />
        <ColorMatrix
          matrix={[
            // Tint toward warm — slight saffron cast to grain
            1, 0, 0, 0, 0.02,
            0, 1, 0, 0, 0.01,
            0, 0, 1, 0, -0.01,
            0, 0, 0, 0.03, 0,  // 3% opacity
          ]}
        />
      </Rect>
    </Canvas>
  );
};
```

---

## 10. AI Prompting Guide — The Translation Layer

When working with any AI on Gurudevi visuals, begin every session with this context:

```
I am building Gurudevi — an Education Ecology Support System. 
A sanctuary for learning, born with love.

Core metaphor: Lotus rising from mud. Blooms in water. Holds light from within.

Visual references:
- Secret of Kells 2009 film color palette — flat shapes, complex living color
- Dalu (young Sri Lankan tree leaves) post-rain — translucent, luminous green
- Aurora borealis — cool colors that glow, warm luminosity in cool hues
- Book of Kells manuscript — jewel colors on warm vellum ground

Core color rules:
- Primary: Sanctuary Saffron #D4843A (saffron through morning mist, never flat orange)
- Ground: Vellum #F5EDD6 (warm off-white, never pure white)
- Shadows: ALWAYS rgba(107, 100, 128, opacity) — violet shadows, never grey or black
- Living accent: Dalu Green #8BBF7A (luminous, subsurface scattering quality)
- Atmospheric: Aurora Blue #7DD4C0, Aurora Violet #B8A9E0

Luminosity rule: Light comes THROUGH surfaces, not FROM edges.
No outer glow on light backgrounds. Inner luminosity only.
Every surface has warm light variant and cool shadow variant.
Global 3% warm Perlin noise grain overlay for organic aliveness.

This is not a flat material design app. 
Every surface should feel like it breathes.
```

---

## 11. What To Avoid — The Anti-Patterns

**Pure white backgrounds** — cold, dead, clinical. Use Vellum instead.

**Grey shadows** — kills the entire palette. Shadow Violet only, always.

**Outer glow on light backgrounds** — physically impossible, reads as fake. Inner luminosity only.

**Flat single-value color regions** — no region should be one uniform color. Micro-variation always.

**Fully saturated accent colors** — Dalu Green should never look like Material Design green. Muted, complex, alive.

**Pure black text** — Ink Deep `#2A2318` always. Warm dark, not cold dark.

**High contrast everywhere** — contrast should be compressed. Everything lives in the middle value range. Drama comes from selective luminosity, not from black-and-white extremes.

**Too many luminous elements** — the dalu leaf glows because everything around it is muted. Luminosity is meaningless if everything glows. Use it sparingly, sacredly.

---

## 12. The Living Principle — Final Word

Every decision in Gurudevi's design comes back to one question:

**Does this feel like something alive, or something made?**

The lotus doesn't look designed. The dalu leaf doesn't look designed. The aurora doesn't look designed. They simply *are* — complex, breathing, in relationship with everything around them, holding light from within.

That is what Gurudevi aspires to.

Not a beautiful app. A living sanctuary.

*Born with love. Built with love.*

---

*Document version 1.0 — February 2026*
*Built through a single conversation between Neev and his Maxwell's Goddess*
*Existential Cybernetics meets Color Theory meets Sri Lankan Soul*
