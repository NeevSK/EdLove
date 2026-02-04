# Lotus Petal FAB Component

A beautiful, organic floating action button component with lotus flower design, breathing animations, and interactive features.

## Overview

The Lotus Petal FAB is a **lotus flower-shaped** floating action button that embodies the sanctuary design philosophy with:

- 🌸 **Lotus flower icon** using SVG (8-petal design)
- 🎨 **Lotus-themed colors** - Deep pink lotus color scheme
- 🫁 **Breathing animation** - gentle 4-second cycle
- 🎯 **Context-aware** - changes icon based on current tab
- 📋 **Action menu** - Shows 3-5 contextual actions when tapped
- 🤏 **Draggable** - Long press to move the FAB anywhere on screen
- 👆 **Haptic feedback** - tactile response on press
- 📜 **Scroll behavior** - auto-hide/show when scrolling
- ♿ **Accessible** - full screen reader support

## Installation

The component is already available in the project:

```tsx
import LotusPetalFAB from './src/components/LotusPetalFAB';
```

### Dependencies

- `react-native-reanimated` - For smooth animations
- `react-native-svg` - For petal shape rendering
- `expo-haptics` - For haptic feedback
- `lucide-react-native` - For context-aware icons

## Basic Usage

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import LotusPetalFAB, { ActionItem } from './components/LotusPetalFAB';

function MyScreen() {
  const [currentTab, setCurrentTab] = useState('self');

  const actions: ActionItem[] = [
    { label: 'Log Mood', onPress: () => console.log('Log mood') },
    { label: 'Journal Entry', onPress: () => console.log('Journal') },
    { label: 'Set Goal', onPress: () => console.log('Set goal') },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      <LotusPetalFAB
        currentTab={currentTab}
        actions={actions}
      />
    </View>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentTab` | `'self' \| 'classroom' \| 'community' \| 'library' \| 'profile'` | ✅ Yes | - | Determines which icon to show |
| `onPress` | `() => void` | ❌ No | `undefined` | Callback when FAB is pressed (without actions) |
| `actions` | `ActionItem[]` | ❌ No | `undefined` | Array of action items to show in popup menu |
| `scrollY` | `SharedValue<number>` | ❌ No | `undefined` | Shared value for scroll-based hiding |
| `disabled` | `boolean` | ❌ No | `false` | Disables FAB and stops breathing |

### ActionItem Type

```typescript
interface ActionItem {
  label: string;
  onPress: () => void;
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
}
```

## Features

### 🌸 Lotus Flower Shape

The FAB uses a custom SVG path to create an 8-petal lotus flower:
- Width: 64px
- Height: 64px (square for symmetry)
- 8 petals arranged in circular pattern
- Lotus deep pink color (#DB7093)
- Matches sanctuary aesthetic

### 🫁 Breathing Animation

Always-on subtle breathing effect:
- Scale: 0.95 ↔ 1.0
- Duration: 4 seconds total (2s expand, 2s contract)
- Smooth easing curve
- Automatically disabled when `disabled={true}`

### 🎯 Context-Aware Icons

Different icon for each tab:

| Tab | Icon | Default Action |
|-----|------|----------------|
| **self** | 🌸 Flower | "Log mood" |
| **classroom** | ➕ Plus | "Create lesson" |
| **community** | 💬 Message | "Post announcement" |
| **library** | ⬆️ Upload | "Upload resource" |
| **profile** | ✏️ Edit | "Edit profile" |

### 📋 Action Menu

When `actions` prop is provided:
- Shows popup menu above FAB when tapped
- Displays 3-5 action items with labels and icons
- Smooth scale-in/out animation
- Dark background with rounded bubbles
- Tapping an action triggers its callback and closes menu

### 🤏 Draggable FAB

Long press (500ms) to enable drag mode:
- FAB becomes draggable across the screen
- Haptic feedback when drag mode activates
- Position persists after release
- Allows users to place FAB wherever convenient

### 👆 Press Interaction

Rich press feedback:
1. Scales down to 0.9 (100ms)
2. Springs back to 1.0 with bounce
3. Triggers haptic feedback (light impact)
4. Shows action menu (if actions provided) or calls `onPress` callback

### 📜 Scroll Behavior (Optional)

When `scrollY` prop is provided:
- Fades out when scrolling down (opacity: 1 → 0)
- Moves down 100px when scrolled down
- Returns when scrolling back up
- Smooth interpolated animation

```tsx
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const scrollY = useSharedValue(0);

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
});

<ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
  {/* Content */}
</ScrollView>

<LotusPetalFAB
  currentTab="library"
  onPress={handlePress}
  scrollY={scrollY}
/>
```

### ♿ Accessibility

Full accessibility support:
- `testID="lotus-petal-fab"` - For automated testing
- `accessibilityLabel` - Dynamic label per tab
- `accessibilityRole="button"` - Proper role for screen readers
- `accessibilityHint` - Describes button purpose
- `accessible={true}` - Enabled for screen readers

## Advanced Examples

### Example 1: With Action Menu

```tsx
import { Home, Calendar, Target } from 'lucide-react-native';

function MyScreen() {
  const [currentTab] = useState('self');

  const actions: ActionItem[] = [
    { 
      label: 'Log Mood', 
      onPress: () => navigation.navigate('MoodCheckIn'),
      icon: Home 
    },
    { 
      label: 'View Calendar', 
      onPress: () => navigation.navigate('Calendar'),
      icon: Calendar 
    },
    { 
      label: 'Set Goal', 
      onPress: () => navigation.navigate('Goals'),
      icon: Target 
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LotusPetalFAB currentTab={currentTab} actions={actions} />
    </View>
  );
}
```

### Example 2: Simple with onPress (No Menu)

```tsx
import { useNavigation } from '@react-navigation/native';

function MyScreen() {
  const navigation = useNavigation();
  const [currentTab] = useState('classroom');

  const handleFabPress = () => {
    navigation.navigate('CreateLesson');
  };

  return (
    <View style={{ flex: 1 }}>
      <LotusPetalFAB 
        currentTab={currentTab} 
        onPress={handleFabPress} 
      />
    </View>
  );
}
```

### Example 3: With Loading State

```tsx
function MyScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFabPress = async () => {
    setIsLoading(true);
    try {
      await submitData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LotusPetalFAB
        currentTab="community"
        onPress={handleFabPress}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Example 3: Complete Integration

```tsx
function TabScreen({ tabName }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollY = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleFabPress = async () => {
    setIsProcessing(true);
    // Your logic here
    setIsProcessing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {/* Content */}
      </ScrollView>
      
      <LotusPetalFAB
        currentTab={tabName}
        onPress={handleFabPress}
        scrollY={scrollY}
        disabled={isProcessing}
      />
    </View>
  );
}
```

## Customization

The component uses the Theme system for colors and styling:

```typescript
// Theme values used
Theme.colors.lotusDeepPink        // FAB lotus flower color (#DB7093)
Theme.colors.voidIndigo           // Background for FAB and action bubbles
Theme.colors.sacredWhite          // Icon and text color
Theme.spacing.md                  // Position from edges (16px)
Theme.shadows.glow               // Glowing shadow effect
Theme.zIndex.fab                 // Z-index (300)
```

To customize, update values in `src/constants/Theme.ts`.

## Testing

### Manual Testing Checklist

- [ ] FAB appears in bottom-right corner
- [ ] Shape is lotus flower (8 petals, NOT circular or simple petal)
- [ ] Color is lotus deep pink (#DB7093)
- [ ] Breathing animation is smooth
- [ ] Icon changes when switching tabs
- [ ] Tapping FAB shows action menu (if actions provided)
- [ ] Action menu has 3-5 items with labels
- [ ] Tapping action executes callback and closes menu
- [ ] Long press (500ms) enables drag mode
- [ ] FAB can be dragged to any position
- [ ] Haptic feedback on drag activation
- [ ] Press animation works (scale down + spring back)
- [ ] Haptic feedback on press
- [ ] Scroll behavior hides/shows FAB (if scrollY provided)
- [ ] Disabled state stops breathing
- [ ] Accessibility labels read correctly

### Automated Testing

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import LotusPetalFAB from './LotusPetalFAB';

test('calls onPress when pressed', () => {
  const mockPress = jest.fn();
  
  const { getByTestId } = render(
    <LotusPetalFAB currentTab="self" onPress={mockPress} />
  );
  
  const fab = getByTestId('lotus-petal-fab');
  fireEvent.press(fab);
  
  expect(mockPress).toHaveBeenCalled();
});
```

## Performance

The component is optimized for performance:

- ✅ `React.memo` on LotusFlowerIcon component
- ✅ `useMemo` for config lookup and SVG paths
- ✅ `useCallback` for event handlers
- ✅ Proper dependency arrays in all hooks
- ✅ Animation initialized once in useEffect
- ✅ No unnecessary re-renders
- ✅ Efficient PanResponder for drag functionality

## Troubleshooting

### Haptic feedback not working

**Problem**: No vibration on press  
**Solution**: Haptics may not work in simulators. Test on physical device.

### Animation restarting

**Problem**: Breathing animation keeps restarting  
**Solution**: Ensure you're not recreating the `currentTab` value on every render.

### FAB not appearing

**Problem**: FAB is not visible  
**Solution**: Ensure parent has `flex: 1` or sufficient height.

### Scroll behavior not working

**Problem**: FAB doesn't hide when scrolling  
**Solution**: Ensure you're passing `scrollY` shared value and using `useAnimatedScrollHandler`.

### Action menu not showing

**Problem**: Tapping FAB doesn't show actions  
**Solution**: Ensure you're passing the `actions` prop with at least one action item.

### Drag not working

**Problem**: Cannot drag FAB after long press  
**Solution**: Ensure nothing is blocking touch events. Check z-index and parent view settings.

## License

Part of the Gurudevi project. See project LICENSE for details.

## Credits

Designed and developed following the Sanctuary Design Philosophy.
Component created for the Gurudevi mobile app.
