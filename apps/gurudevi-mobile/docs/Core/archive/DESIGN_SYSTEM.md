---
title: "GURUDEVI DESIGN SYSTEM"
status: "active"
created: 2026-02-28
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI DESIGN SYSTEM
## Visual & Interaction Patterns

**Version**: 1.0  
**Created**: February 2, 2026  
**Update Frequency**: When design patterns stabilize  
**Purpose**: Visual truth for building UI

---

## Document Scope

**This Document Contains**:
- Color palette and usage
- Typography system
- Component specifications
- Animation principles
- Lotus petal companion (FAB) behavior
- Interaction patterns
- Technical Implementation: UI Abstraction Layer (`@/ui`)
- Verification: Behavior-Driven Development (BDD) via `jest-cucumber`
- [Comprehensive Analysis: Triple-Helix BDD Architecture](./TRIPLE_HELIX_BDD_ANALYSIS.md)

**This Document Does NOT Contain**:
- Architecture decisions (see ARCHITECTURE.md)
- Philosophy (see NORTH_STAR.md)
- Current sprint work (see CURRENT_SPRINT.md)

---

# 1. COLOR PALETTE

## Sanctuary Colors (Primary)

```javascript
// Background - Sanctuary Base
const colors = {
  // Primary backgrounds
  voidIndigo: '#0f0f1e',      // Deep night (dark mode default)
  creamSilence: '#FFF8E7',    // Warm cream (light mode default)
  templeStone: '#F5F1E8',     // Off-white (cards, surfaces)
  
  // Accent - Warmth & Action
  sanctuarySaffron: '#E67E22',  // Primary actions, warmth
  templeGold: '#F39C12',        // Elevated moments, achievements
  emberRed: '#FF6347',          // Courage, transformation
  
  // Nature - Growth & Calm
  sageGreen: '#8FBC8F',         // Joy, growth, moss
  tealWater: '#5F9EA0',         // Calm, breathing, twilight
  peacockBlue: '#1E88A8',       // Depth, connection
  
  // Earth - Grounding
  mudBrown: '#5D4E37',          // Roots, stability
  earthConnection: '#8B4513',   // Secondary actions
  
  // Text
  sacredWhite: '#FFF8F0',       // Primary text on dark (never pure white)
  silverSubtle: '#C0C0C0',      // Secondary text, captions
  charcoalTruth: '#2C3E50',     // Text on light backgrounds
};
```

## Color Usage Rules

**Backgrounds**:
- Light mode: `creamSilence` (not pure white)
- Dark mode: `voidIndigo` (deep, not black)
- Cards/surfaces: `templeStone` (light) or `rgba(255,255,255,0.1)` (dark)

**Actions**:
- Primary button: `sanctuarySaffron`
- Secondary button: `earthConnection`
- Destructive: `emberRed` (use sparingly)

**States**:
- Success/growth: `sageGreen`
- Calm/info: `tealWater`
- Warning: `templeGold`
- Error: `emberRed`

**Text**:
- On dark: `sacredWhite` (primary), `silverSubtle` (secondary)
- On light: `charcoalTruth` (primary), `mudBrown` (secondary)

**Never Use**:
- Pure white (`#FFFFFF`) - too harsh
- Pure black (`#000000`) - too harsh
- Bright neon colors - violates sanctuary feel

---

## Time-Based Palettes (Future v0.5)

The app can shift colors based on time of day:

**Dawn (5-9 AM)**: Awakening
```javascript
background: 'linear-gradient(180deg, #1E3A5F 0%, #FFE4B5 100%)',
accent: '#FFD700', // Sunrise gold
```

**Day (9 AM-5 PM)**: Clarity
```javascript
background: '#F5F1E8', // Warm cream
accent: '#8FBC8F', // Sage green
```

**Evening (5-9 PM)**: Reflection
```javascript
background: '#4A4E69', // Twilight purple
accent: '#FFB700', // Soft amber
```

**Night (9 PM-5 AM)**: Rest
```javascript
background: '#0f0f1e', // Deep indigo
accent: '#B0C4DE', // Silver-blue
```

**v0.1 Implementation**: Use fixed light/dark mode. Time-based in v0.5.

---

# 2. TYPOGRAPHY

## Font Stack

**Primary Font**: Noto Sans Sinhala (for Sinhala script)  
**Secondary Font**: Noto Sans Tamil (for Tamil script)  
**Fallback Font**: System default (for English)

```javascript
const fonts = {
  sinhala: {
    regular: 'NotoSansSinhala-Regular',
    medium: 'NotoSansSinhala-Medium',
    bold: 'NotoSansSinhala-Bold',
  },
  tamil: {
    regular: 'NotoSansTamil-Regular',
    medium: 'NotoSansTamil-Medium',
    bold: 'NotoSansTamil-Bold',
  },
  english: {
    regular: 'System', // Use system font for English
  }
};
```

## Type Scale

```javascript
const typography = {
  // Display (Page titles)
  display: {
    fontSize: 28,
    lineHeight: 44.8, // 1.6x for readability
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  
  // Title (Section headers)
  title: {
    fontSize: 20,
    lineHeight: 32, // 1.6x
    fontWeight: '600',
    letterSpacing: 0,
  },
  
  // Body (Main content)
  body: {
    fontSize: 18, // MINIMUM 18sp (not 16)
    lineHeight: 28.8, // 1.6x
    fontWeight: '400',
    letterSpacing: 0,
  },
  
  // Caption (Secondary info)
  caption: {
    fontSize: 14, // Never go below 14sp
    lineHeight: 19.6, // 1.4x
    fontWeight: '400',
    letterSpacing: 0.2,
  },
};
```

## Typography Rules

**Minimum Sizes**:
- Body text: 18sp (never smaller for primary content)
- Captions: 14sp minimum
- Buttons: 16sp minimum

**Line Height**:
- 1.6x for body and titles (better readability)
- 1.4x for captions (tighter for secondary info)

**Language-Specific**:
- Sinhala needs 1.8x line height (script has more vertical space)
- Tamil needs 1.7x line height
- English can use 1.5x

**Contrast**:
- Minimum 4.5:1 for body text (WCAG AA)
- Minimum 3:1 for large text (titles)

**Never Use**:
- Small text (<14sp) for any content
- All caps for Sinhala/Tamil (no uppercase concept)
- Condensed fonts (hard to read)

---

# 3. SPACING SYSTEM

```javascript
const spacing = {
  xs: 4,    // Tight spacing (icon padding)
  sm: 8,    // Small gaps (between elements)
  md: 16,   // Standard spacing (most common)
  lg: 24,   // Large gaps (between sections)
  xl: 32,   // Extra large (page margins)
  xxl: 48,  // Section separators
  xxxl: 96, // Major section breaks
};
```

**Usage**:
- Card padding: `lg` (24px)
- Button padding: `md` horizontal, `sm` vertical
- Page margins: `xl` (32px)
- Between list items: `md` (16px)
- Between sections: `xxl` (48px)

---

# 4. CORNER RADIUS

```javascript
const corners = {
  tight: 8,        // Small elements (badges, tags)
  comfortable: 16, // Buttons, inputs (most common)
  generous: 24,    // Cards, modals
  full: '50%',     // Circular (avatars, FAB)
};
```

**Rules**:
- Default for most UI: `comfortable` (16px)
- Lotus petal companion (FAB): `full` (circular)
- Never use sharp 90° corners (feels harsh)

---

# 5. SHADOWS & ELEVATION

```javascript
const shadows = {
  // Soft, warm shadows (not harsh black)
  low: {
    shadowColor: '#5D4E37', // Mud brown, not black
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  medium: {
    shadowColor: '#5D4E37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  high: {
    shadowColor: '#5D4E37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

**Usage**:
- Cards: `low` elevation (subtle lift)
- Modals: `medium` elevation
- FAB (Lotus petal): `high` elevation (always on top)

**Never Use**:
- Black shadows (too harsh)
- Large shadows (feels heavy)
- Shadows on dark mode (use borders instead)

---

# 6. ANIMATION PRINCIPLES

## Timing (Breath-Like)

```javascript
const motion = {
  instant: 100,    // Immediate feedback (rarely used)
  quick: 200,      // Fast transitions
  standard: 300,   // Default (most common)
  gentle: 500,     // Slower, meditative
  breathing: 4000, // Lotus companion breathing cycle
};
```

**Rules**:
- Default transitions: `standard` (300ms)
- Never instant (0ms) - feels robotic
- Never >500ms for UI (feels slow)
- Breathing animations: 3-5 seconds (calm rhythm)

## Easing (Organic, Not Mechanical)

```javascript
const easing = {
  // React Native Reanimated easing
  natural: Easing.bezier(0.25, 0.1, 0.25, 1),   // Default
  spring: { damping: 15, stiffness: 150 },      // Bouncy (buttons)
  breath: Easing.inOut(Easing.ease),            // Breathing
  float: Easing.inOut(Easing.cubic),            // Floating motion
};
```

**Usage**:
- Buttons: `spring` (feels responsive)
- Transitions: `natural` (smooth)
- Lotus companion: `breath` + `float` (alive)
- Scrolling: Native (don't override)

**Never Use**:
- Linear easing (feels robotic)
- Bounce easing (too playful, not sanctuary)
- Complex cubic-bezier (keep it simple)

## Animation Guidelines

**Micro-motion** (Subtle, Always-On):
- Background gradients shift (8-second cycles)
- Lotus companion breathes (4-second cycle)
- Cards have subtle hover lift (2px)

**Transitions** (User-Initiated):
- Tab changes: Fade + slide (300ms)
- Modal open: Scale from center (300ms)
- Button press: Scale down (200ms) + haptic

**Celebrations** (Rare, Special):
- Achievement unlocked: Gentle glow + fade (500ms)
- Lesson completed: Soft confetti (1 second, then stop)
- Long absence return: Lotus petal "wakes up" (1 second)

**Performance**:
- Use `useNativeDriver: true` (60fps on low-end devices)
- Limit simultaneous animations to 3 max
- Disable complex animations on low-tier devices

---

# 7. LOTUS PETAL COMPANION (FAB)

## What It Is

**Floating Action Button (FAB)** styled as a lotus petal that serves as:
- Context-aware quick action
- Gentle guide (not intrusive assistant)
- Living presence (breathes, responds)

## Visual Design

**Assets**:
*   Use `lotus_bloom.png` (high-res) for the open state.
*   Use `lotus_bud.png` for closed/resting states if applicable.
*   **Crucial**: Images must be transparent PNGs. No square backgrounds.
*   **Glow**: Use a `0.8` opacity circle behind the image for the "Bloom" effect.

```javascript
// Lotus Petal FAB Component
<LotusPetalFAB
  size={56} // diameter
  color={colors.sanctuarySaffron} // Primary saffron
  position="bottomRight" // 16px from edges
  shadow={shadows.high}
  breathingEnabled={true} // Expand/contract animation
/>
```

**States**:
- **Resting**: Circular petal, breathing gently (scale 0.95 ↔ 1.0, 4-second cycle)
- **Hovered/Focused**: Slight glow (opacity 0.8)
- **Pressed**: Scale down to 0.9, haptic feedback
- **Active**: Ripple animation (water droplet effect)

## Behavior Per Tab

**Self Tab**:
- Icon: Lotus (closed) → opens mood check-in
- Action: "Record reflection" or "Log mood"

**Classroom Tab**:
- Icon: Plus (+) → create new lesson/assignment
- Action: "Create lesson" or "Add assignment"

**Community Tab**:
- Icon: Message → new discussion/announcement
- Action: "Post announcement" (principal) or "Start discussion" (teacher)

**Library Tab**:
- Icon: Upload → add resource
- Action: "Upload resource" (teacher) or "Add to favorites" (student)

**Profile Tab**:
- Icon: Edit → edit profile
- Action: "Edit profile"

**Adaptive Behavior**:
- Hides when scrolling down (stays out of way)
- Reappears when scrolling up
- Fades out when keyboard open
- Disabled states: Semi-transparent, no breathing

## Animation Details

**Breathing** (Always-on when visible):
```javascript
const breathe = useAnimatedStyle(() => {
  return {
    transform: [{
      scale: withRepeat(
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1, // infinite
        true // reverse
      )
    }]
  };
});
```

**Press Response**:
```javascript
const handlePress = () => {
  // Haptic
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  // Visual
  scale.value = withSequence(
    withTiming(0.9, { duration: 100 }),
    withSpring(1.0, { damping: 15 })
  );
  
  // Action
  onPress();
};
```

**Scroll Hide/Show**:
```javascript
const scrollY = useScrollViewOffset(scrollRef);

const fabStyle = useAnimatedStyle(() => {
  return {
    transform: [{
      translateY: interpolate(
        scrollY.value,
        [0, 100],
        [0, 100], // Hide when scrolling down
        Extrapolate.CLAMP
      )
    }],
    opacity: interpolate(
      scrollY.value,
      [0, 50, 100],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    )
  };
});
```

## Character Guidelines

**The Lotus Petal IS**:
- Gentle presence (you notice it but it doesn't demand attention)
- Helpful guide (offers path but doesn't force)
- Patient witness (waits for you, no pressure)
- Organic companion (breathes, lives, responds)

**The Lotus Petal IS NOT**:
- Chatty assistant (no speech bubbles, no tips)
- Intrusive helper (no pop-ups, no interruptions)
- Corporate mascot (no forced personality)
- Gamification prop (no celebrations for everything)

---

# 8. COMPONENT SPECIFICATIONS

## 8.1 Buttons

### Primary Button (LotusButton)

```javascript
<LotusButton
  title="සුරකින්න" // "Save"
  onPress={handleSave}
  variant="primary" // or "secondary", "ghost"
  size="large" // or "medium", "small"
  icon="save" // optional, from lucide-react-native
  loading={isLoading} // shows breathing loader
  disabled={!canSave}
/>
```

**Visual Specs**:
```javascript
const buttonStyles = {
  primary: {
    background: colors.sanctuarySaffron,
    text: colors.sacredWhite,
    borderRadius: corners.comfortable,
    padding: { horizontal: spacing.lg, vertical: spacing.md },
    shadow: shadows.low,
  },
  secondary: {
    background: 'transparent',
    text: colors.sanctuarySaffron,
    border: `1px solid ${colors.sanctuarySaffron}`,
    borderRadius: corners.comfortable,
    padding: { horizontal: spacing.lg, vertical: spacing.md },
  },
  ghost: {
    background: 'transparent',
    text: colors.charcoalTruth,
    padding: { horizontal: spacing.md, vertical: spacing.sm },
  }
};
```

**Animation**:
- Press: Scale 0.95, haptic light
- Release: Spring back to 1.0
- Loading: Breathing pulse on icon

---

## 8.2 Cards (SanctuaryCard)

```javascript
<SanctuaryCard
  title="පාඩම් සැලැස්ම" // "Lesson Plan"
  description="විද්‍යාව - ශ්‍රේණිය 10" // "Science - Grade 10"
  onPress={handleCardPress}
  footer={<Text>3 දිනකට පෙර</Text>} // "3 days ago"
>
  {/* Card content */}
</SanctuaryCard>
```

**Visual Specs**:
```javascript
const cardStyles = {
  background: colors.templeStone,
  borderRadius: corners.generous,
  padding: spacing.lg,
  shadow: shadows.low,
  marginBottom: spacing.md,
};
```

**Animation**:
- Hover/press: Lift (translateY: -2px, shadow increases)
- Transition: 300ms natural easing

---

## 8.3 Input Fields

```javascript
<ReflectionInput
  placeholder="ඔබේ හිත කියන්න..." // "Speak your heart..."
  value={text}
  onChangeText={setText}
  multiline={true}
  minHeight={120}
  maxLength={500}
  language="si" // or "ta", "en"
/>
```

**Visual Specs**:
```javascript
const inputStyles = {
  background: colors.creamSilence,
  border: `1px solid ${colors.silverSubtle}`,
  borderRadius: corners.comfortable,
  padding: spacing.md,
  fontSize: typography.body.fontSize,
  lineHeight: typography.body.lineHeight,
  color: colors.charcoalTruth,
  
  // Focus state
  focus: {
    borderColor: colors.sanctuarySaffron,
    borderWidth: 2,
    shadow: shadows.low,
  }
};
```

---

## 8.4 Bottom Navigation

```javascript
<LotusBottomNav
  currentTab="self"
  onTabChange={handleTabChange}
  tabs={[
    { id: 'self', icon: 'lotus', label: { si: 'ස්වයං', ta: 'சுய', en: 'Self' } },
    { id: 'classroom', icon: 'school', label: { si: 'පන්ති', ta: 'வகுப்பு', en: 'Classroom' } },
    { id: 'community', icon: 'users', label: { si: 'ප්‍රජාව', ta: 'சமூகம்', en: 'Community' } },
    { id: 'library', icon: 'book', label: { si: 'පුස්තකාලය', ta: 'நூலகம்', en: 'Library' } },
    { id: 'profile', icon: 'user', label: { si: 'පැතිකඩ', ta: 'சுயவிவரம்', en: 'Profile' } },
  ]}
/>
```

**Visual Specs**:
```javascript
const navStyles = {
  height: 64,
  background: colors.templeStone,
  borderTop: `1px solid ${colors.silverSubtle}`,
  padding: { horizontal: spacing.sm, vertical: spacing.xs },
  
  // Tab item
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
    // Active state
    active: {
      icon: { color: colors.sanctuarySaffron, size: 24 },
      label: { color: colors.sanctuarySaffron, fontWeight: '600' },
    },
    
    // Inactive state
    inactive: {
      icon: { color: colors.silverSubtle, size: 22 },
      label: { color: colors.silverSubtle, fontWeight: '400' },
    }
  }
};
```

**Animation**:
- Tab switch: Icon scales 1.0 → 1.1 → 1.0 (200ms)
- Active indicator: Slide under current tab (300ms)

---

# 9. INTERACTION PATTERNS

## 9.1 Touch Targets

**Minimum Sizes**:
- Buttons: 44x44 px (Apple HIG standard)
- Icons: 40x40 px touch area (even if visual is smaller)
- List items: 48px height minimum

**Spacing**:
- Between touch targets: 8px minimum
- Around primary actions: 16px minimum

---

## 9.2 Haptic Feedback

Use sparingly (battery impact on low-end devices).

```javascript
import * as Haptics from 'expo-haptics';

// Light tap (buttons, toggles)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium (important actions)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy (destructive actions, achievements)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Notification (new message, milestone)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

**Guidelines**:
- Primary actions: Light haptic
- Destructive actions: Heavy haptic
- Achievements: Notification success
- Errors: Notification error
- DON'T use for every interaction (exhausting)

---

## 9.3 Loading States

### Breathing Loader (for in-progress actions)

```javascript
<BreathingLoader
  size={40}
  color={colors.sanctuarySaffron}
  message="සුරකිමින්..." // "Saving..."
/>
```

**Animation**: Pulsing circle (scale 0.8 ↔ 1.0, 1.5-second cycle)

### Skeleton Loaders (for content loading)

```javascript
<SkeletonCard
  lines={3}
  shimmer={true}
/>
```

**Visual**: Soft gray rectangles with shimmer effect (left to right)

**Never Use**:
- Spinners (feels mechanical)
- Progress bars (implies known duration, creates pressure)
- "Loading..." text only (not visual enough)

---

## 9.4 Empty States

```javascript
<EmptyState
  icon="lotus"
  title="තවම පාඩම් නැත" // "No lessons yet"
  description="ඔබේ පළමු පාඩම එකතු කරන්න" // "Add your first lesson"
  action={
    <LotusButton
      title="පාඩමක් එකතු කරන්න"
      onPress={handleCreateLesson}
      icon="plus"
    />
  }
/>
```

**Guidelines**:
- Always provide next action (button)
- Use gentle language (not "Nothing here!")
- Include relevant icon
- Keep description short (one sentence)

---

## 9.5 Error States

```javascript
<ErrorMessage
  type="gentle" // or "warning", "severe"
  message="සම්බන්ධතාවය අහිමි විය" // "Connection lost"
  action="නැවත උත්සාහ කරන්න" // "Try again"
  onRetry={handleRetry}
/>
```

**Tone**:
- Gentle errors (offline): Calm, informative
- Warning (validation): Helpful, not blaming
- Severe (critical failure): Clear, with support link

**Never Use**:
- Technical jargon ("Error 500")
- Blame language ("You did X wrong")
- Dead ends (no action to fix)

---

# 10. ACCESSIBILITY

## Contrast Requirements

- Body text: 4.5:1 minimum (WCAG AA)
- Large text (18sp+): 3:1 minimum
- Icons: 3:1 minimum

**Test all color combinations.** If fails, adjust.

---

## Screen Reader Support

```javascript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="පාඩම් සැලැස්ම විවෘත කරන්න" // "Open lesson plan"
  accessibilityHint="ඔබේ විද්‍යා පාඩම් සැලැස්ම අවකාශය වෙත ගොස්" // "Goes to your science lesson plan"
  accessibilityRole="button"
  onPress={handlePress}
>
  {/* Content */}
</TouchableOpacity>
```

**All interactive elements must have**:
- `accessible={true}`
- `accessibilityLabel` (in user's language)
- `accessibilityRole` (button, link, header, etc.)
- `accessibilityHint` (optional, what happens when pressed)

---

## Focus Management

- Ensure keyboard navigation works (tab through elements)
- Focus indicator visible (outline or highlight)
- Focus order logical (top to bottom, left to right)

---

# 11. RESPONSIVE DESIGN

## Breakpoints (for tablets/large phones)

```javascript
const breakpoints = {
  small: 320,  // Smallest phones
  medium: 375, // Standard phones
  large: 428,  // Large phones
  tablet: 768, // iPads, tablets
};
```

**Design mobile-first, scale up for tablets.**

---

## Safe Area (Notches, Home Indicators)

```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Screen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }}>
      {/* Content */}
    </View>
  );
}
```

**Always respect safe area** (notches, home indicators, status bar).

---

# 12. PERFORMANCE OPTIMIZATION

## Image Guidelines

**v0.1 Target**: Minimize images (use procedural design)

When images needed:
- Use WebP format (smaller than PNG/JPG)
- Optimize: <50KB for thumbnails, <200KB for full images
- Lazy load: Only when visible on screen
- Cache: Store locally after first load

---

## Animation Performance

**Use `useNativeDriver: true`** whenever possible:
```javascript
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Runs on UI thread (60fps)
});
```

**Don't animate**:
- Layout properties (width, height, padding) - can't use native driver
- Too many elements simultaneously (>5)
- On low-tier devices (detect and disable)

---

## Device Tier Detection

```javascript
import * as Device from 'expo-device';

function getDeviceTier() {
  const totalMemory = Device.totalMemory;
  
  if (totalMemory > 4 * 1024 * 1024 * 1024) {
    return 'high'; // >4GB RAM - full animations
  } else if (totalMemory > 2 * 1024 * 1024 * 1024) {
    return 'mid'; // 2-4GB RAM - reduced animations
  } else {
    return 'low'; // <2GB RAM - essential only
  }
}

// Adapt features
const tier = getDeviceTier();
const config = {
  high: { lotusPetalBreathing: true, backgroundGradient: true },
  mid: { lotusPetalBreathing: true, backgroundGradient: false },
  low: { lotusPetalBreathing: false, backgroundGradient: false },
};
```

---

# 13. ANTI-PATTERNS (What NOT to Do)

## Visual Anti-Patterns

❌ Pure white backgrounds (`#FFFFFF`) → Use Cream Silence  
❌ Sharp 90° corners → Use rounded (16-24px)  
❌ Small text (<14sp) → Minimum 18sp for body  
❌ Low contrast (<4.5:1) → Ensure readability  
❌ Harsh shadows (pure black) → Use soft, warm shadows (mud brown)  
❌ Bright neon colors → Violates sanctuary feel  

---

## Interaction Anti-Patterns

❌ Instant feedback (0ms) → 200-300ms organic transitions  
❌ Linear animations → Spring physics (feels alive)  
❌ No haptics → Every significant action has haptic  
❌ English-first → Sinhala-first, English secondary  
❌ Blocking the user → Always allow dismissal  

---

## Emotional Anti-Patterns

❌ Guilt mechanics (streaks, "You missed a day!") → No pressure  
❌ Gamification (points, leaderboards) → Organic growth  
❌ Toxic positivity ("You got this!") → Gentle realism  
❌ Extractive language ("Give us feedback") → Generous ("If you'd like...")  

---

# APPENDIX: DESIGN TOKENS (Copy-Paste)

```javascript
// /constants/Theme.ts
export const Theme = {
  colors: {
    // Background
    voidIndigo: '#0f0f1e',
    creamSilence: '#FFF8E7',
    templeStone: '#F5F1E8',
    
    // Accent
    sanctuarySaffron: '#E67E22',
    templeGold: '#F39C12',
    emberRed: '#FF6347',
    
    // Nature
    sageGreen: '#8FBC8F',
    tealWater: '#5F9EA0',
    peacockBlue: '#1E88A8',
    
    // Earth
    mudBrown: '#5D4E37',
    earthConnection: '#8B4513',
    
    // Text
    sacredWhite: '#FFF8F0',
    silverSubtle: '#C0C0C0',
    charcoalTruth: '#2C3E50',
  },
  
  typography: {
    display: { fontSize: 28, lineHeight: 44.8, fontWeight: '700' },
    title: { fontSize: 20, lineHeight: 32, fontWeight: '600' },
    body: { fontSize: 18, lineHeight: 28.8, fontWeight: '400' },
    caption: { fontSize: 14, lineHeight: 19.6, fontWeight: '400' },
  },
  
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 96
  },
  
  corners: {
    tight: 8, comfortable: 16, generous: 24, full: '50%'
  },
  
  motion: {
    instant: 100, quick: 200, standard: 300, gentle: 500, breathing: 4000
  },
  
  shadows: {
    low: {
      shadowColor: '#5D4E37',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#5D4E37',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    high: {
      shadowColor: '#5D4E37',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  }
};
```

---

**END OF DESIGN SYSTEM**

*Update this document when visual/interaction patterns stabilize. For current work, see CURRENT_SPRINT.md. For philosophy, see NORTH_STAR.md.*
