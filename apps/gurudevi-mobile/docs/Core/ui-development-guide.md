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

## The Primitives (Exhaustive List)

Our UI library provides a hardened set of primitives built on NativeWind v4. Always prefer these over raw `react-native` components.

### 1. Layout & Foundation
| Component | Usage |
| :--- | :--- |
| `Box` | Fundamental container (replacement for `View`). Supports all Tailwind layout classes. |
| `HStack` | Horizontal flex container with simplified alignment. |
| `VStack` | Vertical flex container with simplified alignment. |
| `Center` | Utility to center children perfectly on both axes. |
| `View` | Raw bridge to `react-native` View (use `Box` for standard styling). |
| `AnimatedView` | Reanimated-integrated View for high-performance animations. |
| `ScrollView` | Standard scrollable container. |
| `FlatList` | Optimized list for large datasets. |
| `RefreshControl` | Standard pull-to-refresh indicator for ScrollViews/FlatLists. |
| `Divider` | Semantic and visual separator between elements. |

### 2. Typography & Icons
| Component | Usage |
| :--- | :--- |
| `Text` | **Mandatory** wrapper for all text nodes. Handles theme scale and platform normalization. |
| `Icon` | Generic wrapper for SVG/Lucide icons. Use the `as` prop to pass the icon component. |

### 3. Forms & Interaction
| Component | Usage |
| :--- | :--- |
| `Button` | Multi-variant interactive component (Primary, Secondary, Outline, Ghost). |
| `Input` | Text input primitive with focus states and theme integration. |
| `FormControl` | Orchestrates label, helper text, and error messages for form fields. |
| `Checkbox` | Standard multiple-choice selection. |
| `Radio` | Single selection from multiple options. |
| `Switch` | Platform-native binary toggle. |
| `Select` | Dropdown picker for single selection from a list. |
| `Textarea` | Multi-line text input for longer content. |
| `Slider` | Value selection along a continuous or discrete range. |
| `Pressable` | Transparent interactive primitive for building custom hit areas. |

### 4. Feedback & Information
| Component | Usage |
| :--- | :--- |
| `Toast` | Imperative feedback system (use `useToast` hook to trigger). |
| `Spinner` | Standard activity indicator with theme colors. |
| `Progress` | Visual representation of task completion. |
| `Avatar` | User identity display (supports images, initials, and fallback icons). |

### 5. Overlays & Layers
| Component | Usage |
| :--- | :--- |
| `Modal` | Full-screen or centered overlay for critical tasks. |
| `Actionsheet` | Slide-up context menu for action selection. |
| `Portal` | Escapes the current layout hierarchy to render at the root level. |
| `Overlay` | Backdrop layer for modals and sheets. |

### 6. Media & Effects
| Component | Usage |
| :--- | :--- |
| `Image` | Optimized image loading with failure handling. |
| `ImageBackground` | Container for layering content over an image. |
| `LinearGradient` | Native-speed color gradients. |
| `Fab` | Floating Action Button for primary screen actions. |

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
