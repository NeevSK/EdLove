---
title: "Guest Exploration & Sanctuary Commit Flow"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Guest Exploration & Sanctuary Commit Flow

## Objective
Implement a "Progressive Discovery" flow for the Gurudevi Sanctuary: **Welcome -> Onboarding -> Guest Home (Explore) -> Auth (Commit)**.

## User Review Required
> [!IMPORTANT]
> - **Universal Context Parameters**: We are moving toward a **"High Hierarchy" Architecture**. The app will dynamically reorganize based on seven pillars: **Role, theme(major - light and dark),  Time (Temporal - minor - dawn, day, evening, night), Language, Reality (Hardware/Signal), The Veil (Privacy), and Personality(v 1.0)**.
> - **The Veil (Privacy Toggle)**: A suggestion for a global "Veil" that masks sensitive data instantly if the environment (e.g., student nearby) requires it.
> - **Reality Tiers**: The app will automatically switch between **"Glass Sanctuary"** (High-end) and **"Paper Sanctuary"** (Low-end/Save-data) modes based on a hardware/network audit.
> - **One Reality, Different Views**: We will perform a **Harmony Audit** of all existing screens to ensure they share a common visual grammar while serving role-specific "Water Flows."
> - **Biological Gratification**: We are replacing traditional "Gamification" with **Natural Growth** (lotus/tree visual progression) and **Thuthimal** (Gratitude Economy) to reward care, not addiction.
> - **Accessibility & i18n**: Multilingual (Sinhala/Tamil/English) and accessibility enhancements will be treated as foundational care work.
> - **Environment Awareness**: We will implement a small **Network Strength Monitor** in the Sandbox to show the user how the app is respecting their data and connection.
> - **Hardware Constraints**: The app will be audited for low-end device compatibility (RAM/Battery) ensuring "Glass Sanctuary" visuals don't compromise performance.
> - **Expo Alignment**: Ensuring strict downstream compatibility with the Expo SDK ecosystem.
> - **Guest Terms Acceptance**: Accepted before entering the Home screen.
 **Ecological Connectivity**: We are moving beyond standalone tabs. We will implement **Phase 1: Core Feedback Channels** (Student -> Teacher stuck signals; Teacher -> Principal reality checks) as part of the initial "One Reality" flow.
> - **Biological Gratification**: Replacing "Points" with visual growth milestones (Lotus/Tree) that reflect actual community care work.
> - **Environment Awareness**: Implementation of a **Network Strength Monitor** in the Sandbox to show respect for the user's connection.
> - **Privacy Sovereignty**: Strict "Negative Constraints" ensuring the **Self** tab remains a private sanctuary, inaccessible to higher roles.

## Proposed Changes

### Mobile App (Gurudevi Mobile)

#### [NEW] [EnvironmentContext.tsx](../../src/context/EnvironmentContext.tsx)
- **Centralized Engine**: Unifies `useTheme`, `i18n`, `useRole`, and `useReality` into a single reactive hook.
- **Dynamic Reorganization**: Components subscribe to a single "Environment" state rather than multiple disparate stores.

#### [MODIFY] [Shared/Components]
- **[NEW] [EnvironmentGuard.tsx]**: A wrapper that simplifies/enhances components based on hardware tier.
- **[NEW] [LotusPetalFAB.tsx]**: Updated to be context-aware of Time and Role.

#### [MODIFY] [Community/Classroom Tabs]
- **[NEW] [BiDirectionalFeedback.tsx]**: A component to capture "Stuck" signals from students and "Reality Checks" from teachers.
- **Ecological Mapping**: Align navigation with Bronfenbrenner’s concentric circles (Self -> Microsystem -> Mesosystem).

#### [MODIFY] [App.tsx](../../App.tsx)
- **Offline Readiness**: Integrate `NetInfo` or similar to handle intermittent connectivity gracefully.
- **Expo Hook**: Use standard Expo APIs for device info and battery monitoring.

#### [MODIFY] [OnboardingScreen.tsx](../../src/screens/OnboardingScreen.tsx)
- **Name Screen**: Update copy to: **"How should we call you within the app?"**.

#### [MODIFY] [Shared/Components]
- **[NEW] [NetworkMonitor.tsx](../../src/components/shared/NetworkMonitor.tsx)**: A subtle UI indicator for speed/strength.
- **[NEW] [LotusPetalFAB.tsx](../../src/components/shared/LotusPetalFAB.tsx)**: The context-aware wise guardian (Studium/Punctum).
- **[NEW] [ThuthimalIndicator.tsx](../../src/components/shared/ThuthimalIndicator.tsx)**: Visual acknowledgment of gratitude on the Profile.
- **Lock Wrapper**: Create a reusable `SanctuaryLock` component.

#### [MODIFY] [WelcomeScreen.tsx](../../src/screens/WelcomeScreen.tsx)
- Add **"Explore as Guest"** button with Terms footer.

## Verification Plan

### Manual Verification
1. **The Guest Entry**: Welcome -> "Explore as Guest" -> Home -> Verify Terms footer was acknowledged.
2. **Network Test**: Toggle Airplane mode -> Verify the Network Monitor responds correctly.
3. **Commit Flow**: Trigger "Log Mood" -> Verify Auth Nudge appears.
4. **Identity Persistence**: Verify guest name is remembered across app restarts.
