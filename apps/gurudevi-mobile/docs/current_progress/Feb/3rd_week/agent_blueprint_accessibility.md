---
title: "Instruction for GitHub Cloud Agent: Accessibility Refinement Cycle"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Instruction for GitHub Cloud Agent: Accessibility Refinement Cycle

## Task Overview
Systematically resolve accessibility (a11y) linting warnings in the `gurudevi-mobile` application to reach WCAG 2.2 Level AA compliance.

## Technical Context
- **Tooling**: `eslint-plugin-react-native-a11y` is active.
- **Hook**: Use `useAccessibility` from `src/hooks/useAccessibility.ts` for motion-related logic.
- **Standards**: WCAG 2.2 Level AA.
- **Reference**: Follow [accessibility_strategy.md](../accessibility_strategy.md).

## Instructions for the Agent

### 1. Audit Phase
Run the project linter to identify issues:
```bash
pnpm run lint
```

### 2. Implementation Rules
- **Labels**: Every `Pressable`, `TouchableOpacity`, or `Image` without text must have an `accessibilityLabel`.
- **Roles**: Use appropriate `accessibilityRole` (button, header, image, link, etc.).
- **Motion**: For any animation (`withTiming`, `withSpring`), check `isReduceMotionEnabled` and bypass or simplify the animation if true.
- **Grouping**: Ensure related information (e.g., a card with a title and description) is wrapped in an `accessible={true}` container to be read as a single element.

### 3. Iteration Scope
Focus on one screen at a time to ensure pull requests are reviewable. Priority order:
1. `WelcomeScreen.tsx`
2. `OnboardingScreen.tsx`
3. `SelfScreen.tsx`
4. `LibraryScreen.tsx`

## Technical Requirements
- Use `sx` props for any styling adjustments needed for focus indicators or touch targets.
- Ensure all new strings are internationalized using `useTranslation`.
- **Do NOT** suppress a11y warnings with `eslint-disable` unless a specific technical limitation is documented.

## Submission
- **Consolidation**: Do **NOT** create a PR for every screen. Instead, group related fixes into a single logical PR.
- **Batching Strategy**:
    - **Option A (Feature-based)**: One PR for "Foundational Screens" (Welcome, Onboarding, Auth).
    - **Option B (Domain-based)**: One PR for "Learning Space" (Library, Classroom).
- **Naming**: Use "Accessibility Audit: [Feature/Batch Name]" in the PR title.
- Include a list of components/screens touched in the PR description.
