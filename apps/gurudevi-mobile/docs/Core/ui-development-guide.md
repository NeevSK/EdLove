# UI Development Guide (Zero-Legacy Edition)

Welcome to the new UI architecture- Continue replacing package-internal imports of `src/gluestack/index.tsx` inside `src/components/*`, `src/components/workspace/*`, `src/context/*`, and `src/screens/*` with direct canonical primitive imports.
- Keep `src/components-legacy/*` and `src/gluestack-legacy/index.ts` documented but non-canonical until a later delete pass.

### **Hardening Journal (2026-04-25)**
*Proactive component foundation reset.*

| Progress | Component | Category | Status |
| :--- | :--- | :--- | :--- |
| ✅ | `Select` | Interactive | Hardened |
| ✅ | `Input` | Input | Hardened |
| ✅ | `Button` | Interactive | Hardened |
| ✅ | `Actionsheet` | Overlay | Hardened |
| ✅ | `Checkbox` | Choice | Hardened |
| ✅ | `Radio` | Choice | Hardened |
| ✅ | `Modal` | Overlay | Hardened |
| ✅ | `Toast` | Feedback | Hardened |
| ✅ | `Switch` | Choice | Hardened |
| ✅ | `Progress` | Feedback | Hardened |
| ✅ | `Avatar` | Identity | Hardened |
| ✅ | `Slider` | Value | Hardened |
| ✅ | `Fab` | Overlay | Hardened |
 using Tailwind utility classes.
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

## 🧠 State Management Excellence (2026 April Standard)

To maintain the "Zero-Legacy" performance guarantee, abide by these "Atomic Subscription" rules for all stateful components and providers.

### 1. The "Atomic" Rule (Context Splitting)
**Never** put stable data and high-frequency changing data in the same Context. 
- **Rule**: If a piece of state changes more than once per second (animations, keyboard, scroll), it MUST live in a separate provider or a fine-grained store.
- **Why**: Prevents the entire app from re-rendering every time the interface jitters.

### 2. Memoization is Mandatory
Every value passed through a Provider's `value` prop MUST be wrapped in `useMemo`. Every function MUST be wrapped in `useCallback`.
- **Logic**: Use the `Z-State` pattern (Z-Index + Zero-Bridge). Keep overlay state (Toasts/Modals) in specialized stores to avoid "God Context" re-renders.

### 3. Reducers for Mechanisms, Hooks for Skins
If a component has more than 2 related `useState` hooks, or logic that follows a sequence (like a Toast queue), use `useReducer`.
- **Discriminated Unions**: All actions must be strictly typed.
- **Example**: `type Action = { type: 'ADD_TOAST', payload: Toast } | { type: 'REMOVE_TOAST', id: string }`.

### 4. Side-Effect Hygiene & Self-Healing
Internal timers, event listeners, or subscriptions must be cleaned up in a `useEffect` return block.
- **Self-Healing**: Prefer state that is a derived view of a data source. If the database changes, the UI should "heal" (sync) without manual `setSomething` calls.

---

## Need Help?
Check the [ADR-001](./adr-001-ui-foundation-reset.md) for the architectural rationale behind these changes.

---

## 🛠️ Hardening Log (2026-04-25)
*Systematic transition to Zero-Legacy Architecture.*

### **Phase 1: Foundation (Hardened)**
| Date | Component | Changes | Status |
| :--- | :--- | :--- | :--- |
| Apr 25 | `Select` | `SelectContext` implementation, Slide animations, Aria roles. | ✅ Hardened |
| Apr 25 | `Input` | `InputContext` for focus state, standardized accessibility. | ✅ Hardened |
| Apr 25 | `Button` | `ButtonContext` for variant/action propagation. | ✅ Hardened |
| Apr 25 | `Actionsheet` | `Portal` integration, `SlideInDown` animations. | ✅ Hardened |
| Apr 25 | `Checkbox` | `GroupContext` for multi-selection logic, robust types. | ✅ Hardened |
| Apr 25 | `Radio` | `GroupContext` for single-selection exclusion. | ✅ Hardened |
| Apr 25 | `Modal` | `Portal` & `Overlay` orchestration, `ZoomIn` animations. | ✅ Hardened |

### **Phase 2: Feedback & Interaction (Hardened)**
| Date | Component | Changes | Status |
| :--- | :--- | :--- | :--- |
| Apr 25 | `Toast` | `ToastContext` integration, Action-based styling (Success/Error). | ✅ Hardened |
| Apr 25 | `Switch` | Platform-native theme bridge, type safety hardened. | ✅ Hardened |
| Apr 25 | `Progress` | `ProgressContext` for track synchronization, Aria roles. | ✅ Hardened |
| Apr 25 | `Avatar` | `AvatarContext` for size-aware typography scaling. | ✅ Hardened |
| Apr 25 | `Slider` | Bridge to `@react-native-community/slider` stabilized. | ✅ Hardened |
| Apr 25 | `Fab` | Placement logic hardened, active-state feedback added. | ✅ Hardened |

### **Phase 3: Media & Display (Next)**
- [ ] `Image` (Caching & loading state)
- [ ] `Badge` (Action mapping)
- [ ] `Textarea` (Auto-grow & validation)
