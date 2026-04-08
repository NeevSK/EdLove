# UI Development Guide (Zero-Legacy Edition)

Welcome to the new UI architecture for Gurudevi. This guide outlines how to build and maintain components using **NativeWind** and our **Owner-Owned Primitives**.

## Core Principles

1.  **Tailwind First**: All styling must be done via `className` strings using Tailwind utility classes.
2.  **No Vendor Bloat**: We use locally implementation layout primitives to avoid large external dependencies and complex type systems.
3.  **Fabric Ready**: All components must be compliant with the React Native New Architecture (Fabric).

## Building a Component

### 1. Imports
**Always** import layout primitives from `@repo/ui`. Never import `View`, `Text`, `Pressable`, etc., directly from `react-native` inside your feature components.

```tsx
// ✅ CORRECT
import { Box, HStack, Text, Button } from '@repo/ui';

// ❌ INCORRECT
import { View, Text } from 'react-native';
import { Button } from '@gluestack-ui/themed';
```

### 2. Styling with NativeWind
Use the `className` prop for all styling. Use our theme tokens (defined in `tailwind.config.js`) for colors and spacing.

```tsx
// Example: Creating a Card
export const MyCard = () => (
    <Box className="bg-white p-4 rounded-lg shadow-sm border border-border">
        <Text className="text-xl font-bold text-textHeader mb-2">
            Card Title
        </Text>
        <Text className="text-base text-textMain">
            This is the card content using Tailwind classes.
        </Text>
    </Box>
);
```

## The Primitives

| Component | Usage |
| :--- | :--- |
| `Box` | Standard container (replacement for `View`). |
| `VStack` / `HStack` | Layout containers with simplified flex properties. |
| `Text` | **Mandatory** wrapper for all text nodes. |
| `Center` | Utility to center children perfectly. |
| `Button` | High-level interactive component. |

## Important Considerations

### Text Nodes
In the New Architecture (Fabric), text nodes MUST be children of a `<Text>` component. Our owner-owned `Text` primitive handles this consistently.

### Conditional Styling
For conditional styles, use the `clsx` or `tailwind-merge` patterns (built into our NativeWind setup):

```tsx
<Box className={`p-4 ${isActive ? 'bg-primary' : 'bg-gray-100'}`}>
```

### Active States
NativeWind 4 supports `active:` and `hover:` (web) prefixes:

```tsx
<Pressable className="bg-blue-500 active:bg-blue-700">
```

## Need Help?
Check the [ADR-001](./adr-001-ui-foundation-reset.md) for the architectural rationale behind these changes.
