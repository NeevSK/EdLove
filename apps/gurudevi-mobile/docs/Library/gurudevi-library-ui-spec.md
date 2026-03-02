# Gurudevi — Library UI Specification
### For IDE Agent — Design & Implementation

---

## The Feeling Before The Code

Before you write a single line —
understand what this needs to feel like.

A teacher opens the library at 9pm.
They're tired. They have 20 minutes.
They don't know exactly what they need.

The app should feel like walking into
a space that was prepared for them.
Warm. Weighted. Intentional.

Not Netflix's cold dark interface
optimized for endless consumption.

Netflix soul — the **effortlessness.**
The way content surfaces without friction.
The way you're already inside something
before you decided to enter.

Gurudevi spirit — **reverence for knowledge.**
The content matters.
The space knows it matters.
The student with mom's phone
deserves the same quality of space
as anyone else.

**One rule above all:**
Every screen should feel like
it has gravity.
Not heavy. Not slow.
Weighted. Intentional.

---

## Design System

### Colors

```typescript
// Use your existing design doc as base
// These are principles not hard values

PRIMARY PALETTE:
  Background dark:  #0A0A0F  // near black, warm
  Background card:  #13131A  // slightly lighter
  Background glass: rgba(255,255,255,0.05)
  
  Surface:          #1C1C26
  Surface elevated: #242430
  
  Border subtle:    rgba(255,255,255,0.08)
  Border visible:   rgba(255,255,255,0.15)

ACCENT — warm, sacred, Sri Lankan:
  Primary:    #D4843A  // existing brand amber
  Secondary:  #8B6FD4  // deep violet
  Cosmic:     #4A9EDB  // map/cosmos blue
  
TEXT:
  Primary:    #F0EDE8  // warm white
  Secondary:  #9B9AA8  // muted
  Tertiary:   #5C5B68  // very muted

SEMANTIC:
  Ministry official: #4CAF7D  // trusted green
  Curated:           #D4843A  // amber (brand)
  Community:         #8B6FD4  // violet
  Wrong path:        #E8956D  // gentle orange
                               // not red — not shame

MAP SPECIFIC:
  Node visited:      #D4843A  // amber glow
  Node unexplored:   #2A2A3A  // dim
  Node recommended:  #4A9EDB  // pulse blue
  Edge:              rgba(212,132,58,0.3)
  Fog:               rgba(10,10,15,0.7)
  Cosmos background: radial gradient
                     #0A0A0F → #0D0D1A → #0A0F1A
```

### Typography

```typescript
// Pairs for Gurudevi's character:
// Display: something with weight and warmth
// Body: clean, readable, multilingual-safe

DISPLAY FONT:
  'Playfair Display' or 'DM Serif Display'
  → for section titles, featured cards
  → warmth + authority

BODY FONT:
  'Noto Sans' family
  → supports Sinhala + Tamil + Latin
  → critical for multilingual
  → clean at small sizes on low-end screens

MONO (for metadata, badges):
  'JetBrains Mono' or system mono
  → content type, language badges

SIZES:
  xs:   11px  // badges
  sm:   13px  // metadata
  base: 15px  // body
  md:   17px  // card titles
  lg:   20px  // section headers
  xl:   24px  // screen titles
  2xl:  32px  // featured titles
  3xl:  40px  // hero text
```

### Spacing & Shape

```typescript
BORDER RADIUS:
  sm:   8px   // badges, chips
  md:   12px  // cards
  lg:   16px  // sheets, containers
  xl:   24px  // featured cards
  full: 9999  // pills

SPACING (8px grid):
  xs:  4px
  sm:  8px
  md:  16px
  lg:  24px
  xl:  32px
  2xl: 48px
  3xl: 64px

CARD DIMENSIONS:
  Small (rail):   width 140px, height 200px
  Medium (rail):  width 180px, height 240px
  Large (grid):   full width - 32px padding
  Featured:       full width, height 280px
```

---

## Screen Architecture

### 1. Library Main Screen

```
HEADER (sticky):
  - Search bar (full width, warm placeholder)
  - Filter chips (horizontal scroll)
    Content Type | Language | Grade | Subject
  - subtle blur background on scroll

BODY (vertical ScrollView or FlashList):
  
  Section 1: Featured / Hero
    Single large card
    Full bleed image
    Gradient overlay bottom
    Title + metadata overlaid
    Pulsing amber border if ministry official
  
  Section 2-N: Horizontal Rails
    Each section is a category/domain:
    "For Teachers" / "Recently Added" /
    "Sri Lankan Stories" / "Ministry Circulars" /
    "Grade 6" / "Pedagogy" / etc.
    
    Each rail:
      Section title (left)
      "See all" (right, subtle)
      Horizontal FlashList of cards
  
  Section LAST: The Door
    Only renders when map is unlocked
    (user explored 5+ nodes)
    See Door section below
    
BOTTOM NAVIGATION:
  Existing — Library is active tab
```

### 2. Resource Card (Small — for rails)

```
COMPONENT: ResourceCard

┌──────────────────┐
│                  │  height: 140px
│   expo-image     │  width: 140px
│   blurhash       │  borderRadius: 12
│   placeholder    │
│                  │
│ ░░░░░░░░░░░░░░░░ │  ← gradient overlay
│ Title here       │  ← 2 lines max
│ 📄 SI            │  ← type + lang badge
└──────────────────┘

STATES:
  Default:  subtle shadow
  Pressed:  scale 0.96, opacity 0.9
            (Reanimated spring)
  Saved:    amber bookmark top-right
  Official: green dot top-right

ON PRESS:
  → open ResourceDetailSheet
  → record journey: 'viewed'
  → increment nodesExplored in store
```

### 3. Featured / Hero Card

```
COMPONENT: FeaturedCard

Full width - 32px
Height: 280px
Border radius: 16px
Overflow: hidden

[expo-image full bleed]
[linear gradient overlay: transparent → 80% black]

Overlaid content (bottom):
  Badge row: [Ministry Official ✓] [SI]
  Title: 2xl, Playfair Display, warm white
  Subtitle: sm, muted, 1 line

Border: 1px amber if is_ministry_official
Subtle glow effect: box shadow amber 0 0 20px

ANIMATION on mount:
  Fade in + slight scale up (1.02 → 1.0)
  Reanimated entering animation
  Duration: 400ms
```

### 4. Resource Detail Sheet

```
COMPONENT: ResourceDetailSheet
TYPE: Bottom sheet (full height)
LIBRARY: @gorhom/bottom-sheet

SHARED ELEMENT:
  Thumbnail image animates from card
  to sheet header
  sharedTransitionTag={`resource-${id}`}
  (Reanimated 4 shared transitions)

LAYOUT:

  [drag handle]
  
  [full bleed image — top 40% of sheet]
  [gradient overlay bottom of image]
  
  [content area — scrollable]
  
    Language toggle: [SI] [TA] [EN]
    → switches all text in sheet
    
    Title (xl, Playfair)
    
    Badge row:
      content_type badge
      language badge  
      grade badge
      [Ministry Official ✓] if true
    
    Description (base, readable)
    
    Source: "NIE Sri Lanka • 2024"
    
    ─── Related ───────────────────
    Horizontal rail of related nodes
    (from edges table, relationship: 'related')
    
    ─── Wrong paths ───────────────
    Only if wrong_path_to edges exist:
    subtle section, gentle orange
    "Many came here first"
    Small cards of those nodes
    
    [spacer for buttons]
  
  [bottom buttons — fixed]
    [Open Resource]  ← primary, amber
    [Save]           ← secondary, outlined
    [Share]          ← icon only

ON OPEN:
  Record journey: 'viewed'
  Start timer for duration tracking
  
ON CLOSE:
  Record journey with duration_seconds
  Update nodesExplored count
```

### 5. Search Screen

```
Activated when search bar focused.
Replaces main scroll with search results.

STATES:
  Empty (just focused):
    "Recent searches" (from MMKV)
    "Try: pedagogy, Grade 6, circulars"
    
  Typing (debounced 300ms):
    Text search results instantly
    (from MMKV cache first)
    
  Results:
    FlashList vertical
    Mix of cards and collection cards
    Resource type clearly labeled
    
  No results:
    Warm, not clinical
    "Nothing found for X"
    "Try in Sinhala / Tamil / English"
    Related tag suggestions

SEMANTIC SEARCH:
  Subtle indicator when online:
  "Searching by meaning..." 
  Falls back to text silently if offline
```

### 6. Filter Sheet

```
COMPONENT: FilterSheet
TYPE: Bottom sheet, half height

SECTIONS:
  Content Type (multi-select chips):
    📄 Books  📋 Lesson Plans  🎬 Videos
    📰 Circulars  🗺 Mindmaps  🎧 Podcasts
    + more
    
  Language (multi-select):
    [සිං Sinhala] [தமிழ் Tamil] [EN English]
    
  Grade Level (multi-select):
    Grade 1-5 / Grade 6-9 / Grade 10-11
    A/L / University / All
    
  For (single select):
    [Teachers] [Students] [Principals] [All]

FOOTER:
  [Clear All]  [Show Results (24)]
  → result count updates live
```

### 7. The Door — Map Portal

```
COMPONENT: MapDoor

Renders at bottom of library scroll
ONLY when mapUnlocked === true in store

VISUAL:

┌─────────────────────────────────────┐
│                                     │
│  · · · · · · · · · · · · · · · · ·  │  ← animated stars
│       ·    ✦         ·    ✦         │     (Reanimated)
│   ·       ·    ✦  ·          ·     │     very subtle
│                                     │     opacity 0.4-0.8
│         🌌                          │     random twinkle
│                                     │
│   The Epistemic Cosmos              │  ← Playfair, xl
│                                     │
│   Your explorations have            │  ← body, muted
│   opened a passage                  │
│                                     │
│         ┌─────────────┐             │
│         │   Enter  →  │             │  ← amber button
│         └─────────────┘             │     glowing border
│                                     │
└─────────────────────────────────────┘

Background: radial gradient
  center: #0D0F1A (deep cosmic blue)
  edge: #0A0A0F

Border: 1px rgba(212,132,58,0.3)
Border radius: 24px
Overflow: hidden

FIRST UNLOCK ANIMATION:
  Section fades in from below
  Stars spawn one by one
  Title types in character by character
  Button pulses once
  
  Only plays on first unlock.
  Saved to MMKV: 'door_animation_played'

ON PRESS ENTER:
  Portal expands to fill screen
  (Reanimated layout animation)
  Stars multiply
  Screen goes dark
  Map fades in
  navigate('/library/map')
```

### 8. Map Screen

```
ROUTE: /library/map

HEADER:
  ← Back to Library    [🔍 search map]
  Subtle — doesn't compete with map

MAP CANVAS:
  react-native-svg
  GestureDetector (pan + pinch zoom)
  Animated.View wraps SVG
  
  LAYERS (bottom to top):
  
  1. Background
     Radial gradient cosmos
     Static — not SVG
     
  2. Fog of War Layer
     SVG Rect full canvas
     opacity 0.85 dark
     "punched out" around visited nodes
     SVG clipPath technique
     
  3. Edge Layer
     SVG Path for each edge
     Color: rgba(212,132,58,0.25)
     Thicker for stronger weight
     Animated opacity on selection
     
  4. Node Layer
     Each node = SVG Circle + Text
     
     VISITED node:
       fill: #D4843A
       r: 8-16px (by importance)
       filter: drop-shadow amber glow
       
     UNEXPLORED node:
       fill: #2A2A3A
       r: 6-12px
       opacity: 0.6
       
     RECOMMENDED node:
       fill: #4A9EDB
       Reanimated pulse animation
       r oscillates 10→14→10
       
     WRONG PATH node:
       fill: #E8956D
       Slightly different shape (diamond not circle)
       
     SELECTED node:
       Scale up spring animation
       Label appears below
       
  5. Label Layer
     Only selected node shows label
     Or on zoom level > threshold
     SVG Text, warm white
     Background rect with opacity

INTERACTION:
  Tap node → select (show label + detail)
  Double tap node → open detail sheet
  Pinch → zoom in/out
  Pan → move around
  Two finger pinch out → zoom to fit
  
NODE COUNT:
  Maximum 30 rendered at once
  As user pans → load neighbourhood
  Smooth swap — old nodes fade, new fade in

DETAIL SHEET ON MAP:
  Same ResourceDetailSheet as library
  Slides up from bottom
  Map still visible and pannable behind it

BOTTOM HUD:
  Subtle floating pill:
  "You've explored 12 nodes"
  Small — doesn't compete
```

---

## Animations Reference

### Library Mount
```typescript
// Sections stagger in on first load
// Each section: fade + translateY
// 100ms delay between sections
// Total: smooth cascade feel
```

### Card Press
```typescript
const scale = useSharedValue(1)

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}))

onPressIn: () => {
  scale.value = withSpring(0.96, {
    damping: 15,
    stiffness: 300
  })
}
onPressOut: () => {
  scale.value = withSpring(1)
}
```

### Shared Element (Card → Detail)
```typescript
// On ResourceCard image:
<Animated.Image
  sharedTransitionTag={`resource-img-${item.id}`}
  source={{ uri: item.cloudinary_url }}
  style={styles.cardImage}
/>

// On ResourceDetailSheet header image:
<Animated.Image
  sharedTransitionTag={`resource-img-${item.id}`}
  source={{ uri: item.cloudinary_url }}
  style={styles.detailImage}
/>

// That's it. Reanimated 4 handles the rest.
// Works on New Architecture (already enabled)
```

### Stars (Map Door + Map Background)
```typescript
// Each star: independent Reanimated loop
// opacity oscillates between 0.2 and 0.9
// random duration: 2000-5000ms
// random delay: 0-3000ms
// withRepeat + withSequence
// Keep star count low: 30-50 max
// Performance first
```

### Map Node Pulse (Recommended)
```typescript
const pulse = useSharedValue(10)

useEffect(() => {
  pulse.value = withRepeat(
    withSequence(
      withTiming(14, { duration: 1000 }),
      withTiming(10, { duration: 1000 })
    ),
    -1,
    true
  )
}, [])
```

---

## Performance Rules for UI Layer

```
IMAGES:
  Always expo-image
  Always set blurhash
  Set contentFit="cover"
  recyclingKey={item.id} on FlashList

LISTS:
  FlashList everywhere
  Check if v2 available (no estimatedItemSize)
  keyExtractor={item => item.id}
  Horizontal rails: horizontal={true}

SHEETS:
  @gorhom/bottom-sheet
  enablePanDownToClose={true}
  snapPoints={['50%', '90%']}

ANIMATIONS:
  useNativeDriver always
  Reanimated worklets not JS thread
  No layout animations on lists
  Shared transitions only on explicit navigation

MAP SPECIFIC:
  SVG not Skia (Skia crashes low-end)
  Pre-computed coordinates from Supabase
  Never D3 force simulation on device
  Maximum 30 nodes rendered
  Fog via SVG clipPath not opacity per node

FONTS:
  Preload in _layout.tsx via expo-font
  useFonts hook at app root
  Fallback to system font until loaded
  Never block render waiting for fonts
```

---

## Component File Structure

```
apps/gurudevi-mobile/
  src/
    features/
      library/
        screens/
          LibraryScreen.tsx
          MapScreen.tsx
          
        components/
          ResourceCard.tsx
          ResourceCard.small.tsx
          ResourceCard.featured.tsx
          ResourceDetailSheet.tsx
          CollectionCard.tsx
          SearchScreen.tsx
          FilterSheet.tsx
          MapDoor.tsx
          MapCanvas.tsx
          MapNode.tsx
          MapEdge.tsx
          StarField.tsx
          SectionRail.tsx
          LanguageToggle.tsx
          ContentTypeBadge.tsx
          
        hooks/
          (consume from @repo/library)
          
        constants/
          library.colors.ts
          library.layout.ts
```

---

## Multilingual UI Rules

```
EVERY text string in the UI:
  Use getLocalizedText() from @repo/library
  Pass user's preferredLanguage from store
  
LANGUAGE TOGGLE in detail sheet:
  User can switch language per resource
  Saves preference to MMKV per resource
  
SEARCH:
  Searches all three language fields
  Results highlight matching language
  
FONTS:
  Noto Sans covers Sinhala + Tamil + Latin
  Single font family — no font switching needed
  
RIGHT TO LEFT:
  Not required for current languages
  But don't hardcode LTR — use I18nManager
```

---

## Accessibility

```
MINIMUM:
  accessibilityLabel on all interactive elements
  accessibilityRole on cards ("button")
  accessibilityHint on door ("Opens knowledge map")
  
COLOR:
  All text meets WCAG AA contrast
  Never use color alone to convey meaning
  (badges have icons + text not just color)
  
TOUCH TARGETS:
  Minimum 44x44px for all interactive elements
  Cards are naturally large enough
  Badges: ensure tap area not just visual size
```

---

## What NOT To Build In UI Layer

```
NOT YET:
  - Onboarding flow
  - User profile in library
  - Social/community features
  - Comments or reviews
  - Advanced map features (3D, clusters)
  - AI guide interface
  - Recommendation explanation UI
  - Admin/staging review UI

KEEP DOOR OPEN FOR:
  - Dark/light mode toggle
  - Different card layout options
  - Map zoom levels showing different detail
  - Collaborative features (see where peers are)
  - AI guide appearing as presence on map
```

---

## Definition of Done — UI

```
✓ Library main screen renders with
  real data from Supabase
  
✓ Hero/featured card shows with
  full bleed image + gradient overlay
  
✓ At least 3 horizontal rails with
  real categorized content
  
✓ ResourceCard shows blurhash placeholder
  before image loads
  
✓ Card press → scale animation
  smooth on low-end Android
  
✓ ResourceDetailSheet opens with
  shared element transition from card
  
✓ Language toggle works in detail sheet
  
✓ Related resources show in detail sheet
  
✓ Search bar is functional and debounced
  
✓ Filters work and update results
  
✓ MapDoor appears after 5 nodes explored
  
✓ MapDoor stars animate gently
  
✓ Enter → map screen transition feels
  like teleportation not navigation
  
✓ Map renders SVG nodes and edges
  
✓ Map pan and zoom works
  
✓ Node tap shows label and detail
  
✓ Wrong path nodes visually distinct
  
✓ All text uses Noto Sans (multilingual safe)
  
✓ No layout issues on small screens (360px width)
  
✓ Smooth at 60fps on 2GB RAM Android
  
✓ No Skia usage anywhere in library UI
```

---

*The UI is the Trübe made visible.*
*The student with mom's phone*
*deserves to feel the gravity.*
*Build it accordingly.*
