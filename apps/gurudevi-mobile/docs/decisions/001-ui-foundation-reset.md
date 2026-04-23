# ADR-001: UI Foundation Reset (Owner-Owned Primitives & NativeWind)

## Status
Accepted

## Context
The previous UI architecture relied heavily on `@gluestack-ui/themed` and legacy `sx` props. This caused several critical issues:
1. **Performance**: Large meta-exported "barrel files" caused excessive memory usage during web bundling.
2. **Type Stability**: Complex generic types in Gluestack often caused TypeScript stack overflows or circular dependency leakage.
3. **Fabric Compliance**: Native components (like `Text`) needed explicit wrapping to be compatible with the new React Native architecture (Fabric).
4. **Consistency**: Mixing `sx` props with Tailwind classes created a fragmented developer experience.

## Decision
We have decided to move to a **"Zero-Legacy"** UI foundation built on:
1. **NativeWind (Tailwind CSS)**: Use Tailwind's utility-first classes for all styling.
2. **Owner-Owned Primitives**: Implement core layout components (`Box`, `Text`, `HStack`, `VStack`, `Button`) locally in `packages/ui/src/components/ui/`.
3. **UI Abstraction Layer**: Use `@repo/ui/gluestack` as the single source of truth for re-exporting these primitives to the rest of the application.

## Consequences

### Positive
- **Build Performance**: Smaller component files and direct exports significantly reduce bundler overhead.
- **Type Safety**: Simple, explicit types for local primitives eliminate TS-related crashes.
- **Cross-Platform Consistency**: NativeWind provides a unified styling engine for Web, Android, and iOS.
- **Fabric Ready**: Text nodes are systematically wrapped in owner-owned `<Text>` primitives.

### Negative / Risks
- **Transition Overhead**: Existing components must be refactored to remove `sx` props.
- **Discipline Required**: Developers must avoid direct `react-native` imports for layout and instead use `@repo/ui` primitives.
- **Styling Learning Curve**: Requires knowledge of Tailwind utility classes instead of inline style objects.

## Rules for Future Migrations
1. **No `sx` Props**: Always use `className` with Tailwind utilities.
2. **Standard Primitives**: Use `Box`, `VStack`, `HStack`, and `Text` from the abstraction layer.
3. **Fabric Core**: Never use raw `<Text>` or `<View>` from `react-native` directly in high-level components; use the owner-owned counterparts to ensure future compatibility.
