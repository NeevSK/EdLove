---
title: "@repo/ui"
status: "active"
created: 2026-03-25
updated: 2026-04-26
author: "Naveen"
scribe: "opencode"
tags: [packages, ui]
---

# @repo/ui

## Purpose
`@repo/ui` is the shared sanctuary design system and shell primitive layer for Gurudevi.

## Owns
- design tokens, surfaces, layout primitives, modals, headers, and shared interaction components
- global style systems and reusable shell primitives
- cross-domain UI that is not owned by one business package

## Does Not Own
- domain-specific workflows
- product orchestration or feature data loading
- route registration and app navigation policy

## Collaborates With
- every product package
- `apps/gurudevi-mobile` for shell composition and root providers

## Web Placement
`*.web.tsx` files are appropriate here for shared presentation primitives, browser-only shell helpers, and cross-domain components reused by multiple domains.

## Architectural Governance (Zero-Legacy)

To maintain the **100/100 Architectural Maturity** of this package, the following rules are strictly enforced:

1.  **Platform Sovereignty**: NO direct imports from `react-native`, `expo-*`, or any platform-specific binary libraries are allowed in `.tsx` files (unless it is a `.web.tsx` or `.native.tsx` shim).
2.  **Runtime Mediation**: All native capabilities (Haptics, Storage, Location, etc.) MUST be accessed via the `coreRuntime` registry provided by `@repo/core`.
3.  **Atomic UI Design**: Raw React Native primitives (e.g., `<View>`, `<Text>`, `StyleSheet`) are forbidden. Use Sanctuary V3 primitives (`Box`, `VStack`, `HStack`, `Heading`, `Text`, `Pressable`) and NativeWind utility classes.
4.  **Isomorphism**: All components should be designed to run on Web and Mobile without modification, utilizing the `nativeRuntimeEnvironment` adapter for platform-specific bridge logic.

5.  **State Excellence**: Every provider MUST be referentially stable. Use `useReducer` for complex logic and `useMemo` for context values. Follow the [State vs. Memory Management Guide](./docs/state-management-guide.md).

Failure to follow these rules will lower the package's maturity score and trigger architectural audit warnings.

