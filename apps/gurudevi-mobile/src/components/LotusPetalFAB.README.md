# Lotus Petal FAB Component

A beautiful, organic floating action button component with petal shape and breathing animations.

## Overview

The Lotus Petal FAB is NOT a circular button - it's a **petal-shaped** floating action button that embodies the sanctuary design philosophy with:

- 🌸 **Organic petal shape** using SVG (taller than wide)
- 🫁 **Breathing animation** - gentle 4-second cycle
- 🎯 **Context-aware** - changes icon based on current tab
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
import LotusPetalFAB from './components/LotusPetalFAB';

function MyScreen() {
  const [currentTab, setCurrentTab] = useState('self');

  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      <LotusPetalFAB
        currentTab={currentTab}
        onPress={() => console.log('FAB pressed!')}
      />
    </View>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentTab` | `'self' \| 'classroom' \| 'community' \| 'library' \| 'profile'` | ✅ Yes | - | Determines which icon to show |
| `onPress` | `() => void` | ✅ Yes | - | Callback when FAB is pressed |
| `scrollY` | `SharedValue<number>` | ❌ No | `undefined` | Shared value for scroll-based hiding |
| `disabled` | `boolean` | ❌ No | `false` | Disables FAB and stops breathing |

## Features

### 🌸 Petal Shape

The FAB uses a custom SVG path to create an organic petal shape (not circular!):
- Width: 56px
- Height: 72px (taller than wide)
- Pointed at top, rounded at bottom
- Matches sanctuary aesthetic

### 🫁 Breathing Animation

Always-on subtle breathing effect:
- Scale: 0.95 ↔ 1.0
- Duration: 4 seconds total (2s expand, 2s contract)
- Smooth easing curve
- Automatically disabled when `disabled={true}`

### 🎯 Context-Aware Icons

Different icon for each tab:

| Tab | Icon | Label |
|-----|------|-------|
| **self** | 🌸 Flower | "Log mood" |
| **classroom** | ➕ Plus | "Create lesson" |
| **community** | 💬 Message | "Post announcement" |
| **library** | ⬆️ Upload | "Upload resource" |
| **profile** | ✏️ Edit | "Edit profile" |

### 👆 Press Interaction

Rich press feedback:
1. Scales down to 0.9 (100ms)
2. Springs back to 1.0 with bounce
3. Triggers haptic feedback (light impact)
4. Calls `onPress` callback

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

### Example 1: With Navigation

```tsx
import { useNavigation } from '@react-navigation/native';

function MyScreen() {
  const navigation = useNavigation();
  const [currentTab] = useState('classroom');

  const handleFabPress = () => {
    switch (currentTab) {
      case 'classroom':
        navigation.navigate('CreateLesson');
        break;
      // ... other cases
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LotusPetalFAB currentTab={currentTab} onPress={handleFabPress} />
    </View>
  );
}
```

### Example 2: With Loading State

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
Theme.colors.sanctuarySaffron  // FAB background color
Theme.colors.sacredWhite       // Icon color
Theme.spacing.md               // Position from edges (16px)
Theme.shadows.glow            // Glowing shadow effect
Theme.zIndex.fab              // Z-index (300)
```

To customize, update values in `src/constants/Theme.ts`.

## Testing

### Manual Testing Checklist

- [ ] FAB appears in bottom-right corner
- [ ] Shape is petal-like (NOT circular)
- [ ] Breathing animation is smooth
- [ ] Icon changes when switching tabs
- [ ] Press animation works (scale down + spring back)
- [ ] Haptic feedback on physical device
- [ ] Scroll behavior hides/shows FAB
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

- ✅ `React.memo` on PetalShape component
- ✅ `useMemo` for config lookup and SVG path
- ✅ `useCallback` for event handlers
- ✅ Proper dependency arrays in all hooks
- ✅ Animation initialized once in useEffect
- ✅ No unnecessary re-renders

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

## License

Part of the Gurudevi project. See project LICENSE for details.

## Credits

Designed and developed following the Sanctuary Design Philosophy.
Component created for the Gurudevi mobile app.
