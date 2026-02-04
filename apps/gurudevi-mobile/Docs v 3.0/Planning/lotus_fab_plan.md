# LOTUS PETAL FAB - IMPLEMENTATION PLAN

## Overview
Create the Lotus Petal FAB (Floating Action Button) - a **petal-shaped** (not circular!) floating button with breathing animations and context-aware behavior.

---

## ❌ THE CONFUSION

**You got**: Circular FAB (simple button)  
**You need**: **PETAL-SHAPED FAB** with organic form 🪷

**Difference**:
- **LotusButton** = Rectangular button for forms/actions
- **Lotus Petal FAB** = Floating petal-shaped button (unique visual)

---

## 🎨 VISUAL DESIGN

### Shape (NOT a circle!)

**Option 1: Petal SVG Path** (Preferred):
```jsx
// Lotus petal shape using SVG path
<Svg width={56} height={56} viewBox="0 0 56 56">
  <Path
    d="M28 0 C20 10, 15 20, 15 28 C15 35, 20 45, 28 56 C36 45, 41 35, 41 28 C41 20, 36 10, 28 0 Z"
    fill={colors.sanctuarySaffron}
    opacity={0.95}
  />
</Svg>
```

**Option 2: Teardrop Shape** (Simpler):
```jsx
// Teardrop/petal using borderRadius manipulation
<View style={{
  width: 56,
  height: 72, // Taller than wide
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  borderBottomLeftRadius: 56,
  borderBottomRightRadius: 56,
  backgroundColor: colors.sanctuarySaffron
}} />
```

---

## 🎭 ANIMATIONS

### 1. Breathing (Always-On)
```typescript
// Scale 0.95 ↔ 1.0, 4-second cycle
const breathe = useAnimatedStyle(() => {
  return {
    transform: [{
      scale: withRepeat(
        withTiming(0.95, { 
          duration: 2000, 
          easing: Easing.inOut(Easing.ease) 
        }),
        -1, // infinite
        true // reverse (yoyo)
      )
    }]
  };
});
```

### 2. Press Response
```typescript
const handlePress = () => {
  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  // Visual feedback
  scale.value = withSequence(
    withTiming(0.9, { duration: 100 }),
    withSpring(1.0, { damping: 15, stiffness: 150 })
  );
  
  // Execute action
  onPress();
};
```

### 3. Scroll Hide/Show
```typescript
const scrollY = useSharedValue(0);

const fabStyle = useAnimatedStyle(() => {
  return {
    transform: [{
      translateY: interpolate(
        scrollY.value,
        [0, 100],
        [0, 100], // Move down 100px when scrolling down
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

---

## 🧭 CONTEXT-AWARE BEHAVIOR

**Different icon per tab**:
```typescript
const fabConfig = {
  self: { 
    icon: 'flower' as const, // Lotus icon
    label: 'Log mood',
    action: () => navigation.navigate('MoodCheckIn')
  },
  classroom: { 
    icon: 'plus' as const,
    label: 'Create lesson',
    action: () => navigation.navigate('CreateLesson')
  },
  community: { 
    icon: 'message-circle' as const,
    label: 'Post announcement',
    action: () => navigation.navigate('NewPost')
  },
  library: { 
    icon: 'upload' as const,
    label: 'Upload resource',
    action: () => navigation.navigate('UploadResource')
  },
  profile: { 
    icon: 'edit' as const,
    label: 'Edit profile',
    action: () => navigation.navigate('EditProfile')
  }
};
```

---

## 🔧 PROPOSED IMPLEMENTATION

### File Structure
```
src/components/
├── LotusPetalFAB.tsx       # Main FAB component
└── PetalShape.tsx          # SVG petal shape (isolated)
```

### LotusPetalFAB.tsx
```typescript
interface LotusPetalFABProps {
  currentTab: 'self' | 'classroom' | 'community' | 'library' | 'profile';
  onPress: () => void;
  scrollY?: SharedValue<number>; // For scroll behavior
  disabled?: boolean;
}
```

### Features
- [x] Petal-shaped visual (SVG or borderRadius)
- [x] Breathing animation (4-second cycle)
- [x] Press animation (scale down + spring back)
- [x] Haptic feedback on press
- [x] Context-aware icon (changes per tab)
- [x] Scroll hide/show (optional)
- [x] High elevation shadow
- [x] Position: fixed bottom-right (16px from edges)
- [x] Disabled state (semi-transparent, no breathing)

---

## 📋 ITERATIVE DEVELOPMENT

**Yes, you can iterate!** Agent Mode supports follow-ups:

### Round 1: Basic FAB
```
"Create basic petal-shaped FAB with breathing animation"
```

### Round 2: Add Context Awareness
```
"Update FAB to change icon based on currentTab prop"
```

### Round 3: Add Scroll Behavior
```
"Add scroll hide/show animation using scrollY shared value"
```

**OR** do it all in ONE prompt (see next section)

---

## 🎯 COMPLETE AGENT MODE PROMPT

```
Build a Lotus Petal FAB component at src/components/LotusPetalFAB.tsx

This is a floating action button with a PETAL SHAPE (not circular!)

Props interface:
interface LotusPetalFABProps {
  currentTab: 'self' | 'classroom' | 'community' | 'library' | 'profile';
  onPress: () => void;
  scrollY?: SharedValue<number>;
  disabled?: boolean;
}

Visual Design - Petal Shape:
Use SVG to create teardrop/petal shape:
- Width: 56px
- Height: 72px (taller than wide)
- Path: Organic petal curve (use cubic bezier)
- Color: Theme.colors.sanctuarySaffron
- Opacity: 0.95
- Shadow: Theme.shadows.high

Position:
- position: 'absolute'
- bottom: 16px
- right: 16px
- zIndex: 100

Context-Aware Icons (use lucide-react-native):
- self tab: 'flower' icon
- classroom tab: 'plus' icon
- community tab: 'message-circle' icon
- library tab: 'upload' icon
- profile tab: 'edit' icon

Animations (use react-native-reanimated):

1. Breathing (always-on when not disabled):
   - Scale from 0.95 to 1.0
   - Duration: 2000ms each direction (4s total cycle)
   - Easing: Easing.inOut(Easing.ease)
   - Repeat: infinite, reverse direction

2. Press animation:
   - Scale to 0.9 immediately (100ms)
   - Spring back to 1.0 (damping: 15, stiffness: 150)
   - Haptic feedback: Haptics.impactAsync(Light)

3. Scroll behavior (if scrollY provided):
   - Hide when scrolling down (translateY: 0 → 100)
   - Fade when scrolling (opacity: 1 → 0)
   - Trigger point: scrollY 0-100px
   - Use Extrapolate.CLAMP

Disabled state:
- opacity: 0.5
- No breathing animation
- Prevent press

Imports:
- React, { FC } from 'react'
- View, Pressable, StyleSheet from 'react-native'
- Svg, Path from 'react-native-svg'
- useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring, interpolate, SharedValue, Extrapolate from 'react-native-reanimated'
- Easing from 'react-native'
- * as Haptics from 'expo-haptics'
- Icon from 'lucide-react-native'
- Theme from '../constants/Theme'

Export as default

CRITICAL: The shape must be PETAL-LIKE (organic, teardrop), NOT a simple circle!
```

---

## ✅ VERIFICATION PLAN

### Manual Testing Steps:

1. **Visual Check**:
   - Run: `npm start` in gurudevi-mobile
   - Open app in simulator
   - Navigate to each tab (Self, Classroom, Community, Library, Profile)
   - **Verify**: FAB appears in bottom-right corner
   - **Verify**: Shape is PETAL-like (taller than wide, organic curve)

2. **Breathing Animation**:
   - Stay on any screen
   - Watch FAB for 10 seconds
   - **Verify**: FAB pulses gently (grows/shrinks subtly)
   - **Verify**: Animation is smooth, not jarring

3. **Context Awareness**:
   - Switch between tabs
   - **Verify**: Icon changes per tab:
     - Self = flower 🌸
     - Classroom = plus ➕
     - Community = message 💬
     - Library = upload ⬆️
     - Profile = edit ✏️

4. **Press Interaction**:
   - Tap FAB
   - **Verify**: Button scales down then springs back
   - **Verify**: Haptic feedback occurs (phone vibrates slightly)
   - **Verify**: onPress callback fires

5. **Scroll Behavior** (if implemented):
   - Scroll down on a long page
   - **Verify**: FAB fades out and moves down
   - Scroll back up
   - **Verify**: FAB reappears

6. **Disabled State**:
   - Pass `disabled={true}` to FAB
   - **Verify**: FAB is semi-transparent
   - **Verify**: No breathing animation
   - **Verify**: Cannot press

### Success Criteria:
- [ ] Petal shape visible (NOT circular)
- [ ] Breathing animation smooth
- [ ] Icons change per tab
- [ ] Press interaction with haptics works
- [ ] Scroll behavior works (if implemented)
- [ ] Disabled state works

---

**Ready to paste into Agent Mode!** 🪷
