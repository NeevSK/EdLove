---
title: "Cloud Agent Prompt: Global Boundaries & Environment Engine"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Cloud Agent Prompt: Global Boundaries & Environment Engine

> **Implementation Status**: This document serves as a comprehensive guide and specification for implementing the Environment Engine. Most features described here are **not yet implemented**. Please refer to [task.md](./task.md) for current implementation status.

## Role: Senior React Native (Expo) Architect
You are tasked with establishing the foundational **Global Boundaries and Behavior** for the **Gurudevi Mobile App**. 

### 🗺️ Context & Guidance
- **Primary Reference**: Follow the [Environment Engine Implementation Plan](./ENVIRONMENT_ENGINE_IMPLEMENTATION.md) and [Task List](./task.md) for the specific component list and logic.
- **Architectural Soul**: Read the [Gurudevi Design Framework](../Core/gurudevi_design_framework.md) and [North Star](../Core/NORTH_STAR.md) to understand the "Studium/Punctum" approach and sanctuary design principles.

This is not just a UI task; it is an **Architectural Enforcement** task. You must implement the "Triple Helix" development philosophy (Constraints + BDD + TDD) to ensure the app is resilient, accessible, and performant on low-end devices.

---

## 🧬 The Philosophy: Triple Helix Development
You must follow this spiral for every feature:
1.  **Constraints (Gravity)**: Define the limits first (Hardware/Network).
2.  **BDD (Soul)**: Define the user intent and behavior (Gherkin).
3.  **TDD (Bone)**: Write the test, then the code (Jest/Testing Library).

---

## 1. Constraints (The Gravity)
**Objective**: Hard-code the "Reality" into the app's DNA.

*   **Target Device**: Low-end Android (2GB RAM), Intermittent Internet, 3G data.
*   **Tech Stack**: Expo SDK 54+ (New Architecture), React Native 0.81+, React 19.
*   **The "Mud" Rule**: If a feature works on an iPhone 15 but lags on a $100 Android, it is **broken**.
    *   *Implementation*: Create a `useReality()` hook or `EnvironmentGuard` component that automatically downgrades visuals (e.g., disables blur/shadows/animations) on low-end devices.
    *   *User Override*: **Critical**: This automatic downgrading must be **user-overridable**. Add a "Visual Fidelity" toggle in the new App Settings (Auto / High / Low).
*   **Network Reality**: Implement the **Network Strength Monitor**. If network is poor, switch to "Data Saver" mode automatically.
*   **Accessibility (The Foundation)**: All screens must support dynamic type, screen readers, and high contrast. This is not optional; it is a constraint.

---

## 2. BDD (The Soul / Behavior)
**Objective**: the app must be a "Living Organism" that adapts to its environment.

### Core Behavior: The "High Hierarchy" Environment Engine
The app must dynamically reorganize itself based on **Universal Parameters**. 
Start by implementing a global `EnvironmentContext` that unifies:

*   **Role (Expanded Identity)**: 
    *   *Scope*: Teacher, Student, Principal, **Admin, Founder, Section Head**.
    *   *Requirement*: The same 5-tab structure (Self, Classroom, Community, Library, Profile) must exist for EVERY role.
    *   *Context Alignment (Critical)*: Screens are NOT just permission-gated copies. They must reflect the **Information Hierarchy** of that role's "Care Work":
        *   **Teacher**: Focus on connection, lesson delivery, and student wellbeing.
        *   **Principal**: Focus on **Ecosystem Health**, resource allocation, and support signals (NOT surveillance).
        *   **Student**: Focus on discovery, peer support, and learning journey.
        *   **Founder/Admin**: Focus on **System Integrity**, performance metrics, and global configuration.
    *   *Audit*: You must check if the **Mental Model** of each section makes sense for the role. If a Founder visits "Self", it might show "Creator Reflection" instead of "Teacher Reflection."
*   **Theme Matrix (Universal + Temporal)**:
    *   *Core*: Light vs. Dark (The Base).
    *   *Temporal Modifier*: Dawn / Day / Evening / Night.
    *   *Matrix*: A "Light Mode Morning" looks different from a "Dark Mode Morning". The Temporal theme modulates the Base theme.
    *   *Reference*: Check `../../src/utils/themeColors.ts` and existing theme docs in [Design System](../Core/DESIGN_SYSTEM.md).
*   **Language**: English, Sinhala, Tamil (First-class citizens).
*   **Settings (The Control Room)**:
    *   *Requirement*: In the **Profile Tab**, create a dedicated **"App Settings"** section.
    *   *Contents*: Move all universal toggles here: Theme (Auto/Light/Dark), Language, Visual Fidelity (Auto/Low/High), Font Size, etc.
*   **Reality (Hardware/Network)**:
    *   *Requirement*: Active monitoring of Network Strength and Battery Saver mode.
    *   *Behavior*: If network drops, UI switches to "Offline Sovereignty" mode (cached data only).

### 🌿 The Bio-Resonance Layer (Architect's Addition)
*   **Adaptive Haptics**: Haptic feedback must match the **Temporal Phase**.
    *   *Day*: Sharp, crisp haptics for "High-EROI" productivity.
    *   *Night*: Soft, "breathing" haptics (slow-fade pulses) to respect the user's circadian rhythm.
*   **The Unfolding (Visual Grammar)**: UI elements must not "pop" or "slide." They must **Unfold** (petal-like scaling and opacity transitions). Ensure `reanimated` is used for these organic curves.
*   **Ecosystem Pulsing**: The Lotus Petal FAB should "glimmer" or "breathe" based on external signals (e.g., a "Stuck" signal from a student for the Teacher, or a "Thuthimal" flower received).

---

## 3. TDD (The Bone / Structure)
**Objective**: Prove it works before you build it.

*   **Unit Tests**: Use Jest to verify the `EnvironmentContext` logic.
    *   *Test*: "Given time is 8 PM, When app loads, Then theme should be 'Night'."
    *   *Test*: "Given user is 'Student', When navigating to Classroom, Then 'Create Lesson' button is hidden."
*   **Component Tests**: Use React Native Testing Library.
    *   *Test*: "Given low-end device simulation, Then 'GlassBlur' component renders as 'SolidView'."

---

## Execution Steps for You
1.  **Setup**: Initialize the `EnvironmentContext` (create `src/context/EnvironmentContext.tsx`) with initial states for Role, Theme (Time-aware), Language, and Reality.
2.  **BDD Proof**: Write a Gherkin feature file (`features/environment.feature`) describing the "Dawn to Night" transition and "Role-based View" adaptation.
3.  **TDD Loop**: Write a failing test for `useEnvironment()` hook, then implement it.
4.  **UI Implementation**: Update the main `App.tsx` and `src/constants/Theme.ts` to consume this new context.
5.  **Localization**: Ensure `i18n` is wired into this context (fix any existing issues).

**Go.**
