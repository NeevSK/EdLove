# Accessibility Strategy: Gurudevi Mobile

## 1. Vision & Standards
Our goal is to make Gurudevi fully accessible to users with diverse needs, aligning with **WCAG 2.2 Level AA** standards. We treat accessibility not as a checkbox, but as a core component of the user experience (UX).

## 2. Strategic Pillars

### A. Automated Guardrails (Linting & Testing)
We rely on tooling to catch basic errors early.
- **Linting**: Enforce `eslint-plugin-react-native-a11y` to catch missing labels, wrong roles, and insufficient contrast.
- **Unit Tests**: Ensure key components render with expected accessibility props.

### B. Component-Driven Accessibility
We solve accessibility at the *component level* so screens are accessible by default.
- **Atomic Components**: Button, Input, Card, and Modal must expose and handle `accessibilityLabel`, `accessibilityRole`, and `accessibilityState`.
- **Complex Interactions**: Custom gestures (like the Lotus FAB) must have fallback accessible actions (e.g., a simple menu for screen reader users).

### C. Semantic Navigation
Screen readers rely on a logical flow.
- **Grouping**: Use `accessibilityElementsHidden` for decorative items and `accessible={true}` to group related text/controls.
- **Focus Management**: When screens change or modals open, focus should move logically.

## 3. Reusable Audit Checklist (WCAG 2.2 Refined)
Use this checklist for every new feature or refactor iteration.

### Touch Targets & Sizing (WCAG 2.2 New)
- [ ] **Minimum Size**: All pointer inputs (touch) must be at least 24x24 pixels, or have sufficient spacing to avoid accidental activation. (Recommended: 44x44 for clarity).
- [ ] **Target Size (Enhanced)**: Critical controls should prioritize the 44x44 standard for ease of use in educational environments.

### Visual Clarity & Focus
- [ ] **Focus Appearance (WCAG 2.2 New)**: Focus indicators must have a high contrast ratio (at least 3:1) against the non-focused state and the background.
- [ ] **Contrast**: Text vs Background ratio at least 4.5:1.
- [ ] **Scaling**: Does the UI break when "Large Text" is enabled in system settings?

### Screen Reader (VoiceOver/TalkBack)
- [ ] **Labels**: Do all images and buttons have meaningful `accessibilityLabel`s?
- [ ] **Roles**: Do buttons say "Button", links say "Link", headers say "Heading"?
- [ ] **State**: Do checkboxes/toggles announce "Checked"/"Unchecked"?
- [ ] **Flow**: Does the swipe order match the visual reading order?
- [ ] **Hints**: Are `accessibilityHint`s used for complex or non-obvious actions?

## 4. Implementation Phase Plan

### Phase 1: Foundation (Complete)
- [x] Install and configure `eslint-plugin-react-native-a11y`.
- [x] Create `useAccessibility` helper hook.
- [x] Pilot fix: `LotusPetalFAB.tsx`.

### Phase 2: Delegated Iterations (Next)
- [ ] Assign GitHub Agent to resolve linting warnings in `src/screens`.
- [ ] Audit `@repo/ui` components for property forwarding.

### Phase 3: Verification
- [ ] Document manual testing procedure (VoiceOver/TalkBack).
- [ ] Implement "Reduced Motion" alternatives across all animations.
