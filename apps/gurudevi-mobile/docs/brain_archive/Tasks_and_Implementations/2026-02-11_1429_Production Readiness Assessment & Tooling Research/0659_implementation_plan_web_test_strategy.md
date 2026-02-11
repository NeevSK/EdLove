# Implementation Plan - Web-First BDD Strategy

## Goal Description
Resolve the "render not called" deadlock caused by `react-test-renderer` incompatibility with React 19. We will adopt a "Divergent" strategy by configuring Jest to run tests in a **Web (DOM)** environment using `react-native-web`. This allows us to use the stable React 19 DOM renderer to verify our Behavioral Logic (BDD) without waiting for Native toolchain updates.

## User Review Required
> [!IMPORTANT]
> This strategy changes the *testing environment* from Node/Native-Mock to JSDOM/Web. 
> *   **Pros:** It works with React 19 today. It verifies **Behavioral Logic** perfectly.
> *   **Cons:** It does not catch Native-specific UI crashes (e.g. iOS View properties). 
> *   **Verdict:** Highly recommended for BDD (Logic) testing.

## Proposed Changes

### Configuration
#### [MODIFY] [jest.config.js](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/jest.config.js)
- Change preset from `jest-expo` to `jest-expo/web`.
- This tells Jest: "When you see `<View>`, render a `<div>` using `react-dom`".

### Dependencies
#### [NEW] `react-native-web`
- Install as a Dev Dependency to support the web preset.

## Verification Plan

### Automated Tests
1.  **Sanity Check:** Run `pnpm jest src/__tests__/sanity.test.tsx`
    - Expectation: PASS (No "render not called" error).
2.  **BDD Verification:** Run `pnpm test src/__tests__/steps/invitation_welcome.steps.tsx`
    - Expectation: PASS (Steps execute and assertions hold).
