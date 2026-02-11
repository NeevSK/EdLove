# 🎨 UI/UX Redesign Master Plan

**Goal**: Transform the "functional" UI into a "Soulful, Artistic, and Premium" experience (The "Gurudevi" Aesthetic).

## 1. 🪷 The "Living" Lotus FAB (Priority High)
**Current State**: "Ugly", static icon pasted on top, dragging is broken.
**Target State**:
*   **Visual**: Use the photorealistic Golden Lotus (Bud/Bloom) assets. No generic icons on top.
*   **Animation**: "Breathing" effect (gentle expansion/contraction) when idle.
*   **Interaction**: Fully draggable (floating bubble physics). fluid morphing when changing states/screens.
*   **Tech**: Use `react-native-reanimated` + `react-native-gesture-handler`.

## 2. 🎭 Mood Tracker (Refinement)
**Current State**: Slider is hard to see/"think what's there".
**Target State**:
*   **Visibility**: Make the slider track thicker, the thumb larger and glowing.
*   **Feedback**: Add haptic ticks as you slide.
*   **Visual**: Ensure the "Lotus" visualization clearly responds to the slider value (which we started with the image swap).

## 3. 👤 Profile Section (The "Sanctuary Identity" Redesign)
**Goal**: Completely separate "User Identity" from "App Settings" visually and functionally. No clumsy tabs.

### Part A: Top Section - "The Identity Card" (User Focus)
*   **Visual**: A floating, glassmorphism card (`SanctuaryCard`) that looks like a futuristic ID.
*   **Elements**:
    *   **Avatar**: Centered with a **Progress Ring** (Golden) indicating profile completion.
    *   **Details**: Name, Role (in native language), School Name.
    *   **Verification**: A "Verified" badge if they belong to a real school.
*   **Interaction**:
    *   **Tap to Flip**: Tapping the card flips it to show QR Code (for sharing).
    *   **Tap Details**: Directly opens "Edit Mode" (Modal) to update Name/School.
*   **Progressive Profiling**:
    *   "70% Complete" label below avatar.
    *   "Complete your profile to unlock [Feature Name]" message if incomplete.

### Part B: Bottom Section - "The Control Scroll" (App Focus)
*   **Visual**: A vertical list that flows like a scroll below the user card.
*   **Items**:
    *   **Language**: **Globe** icon. Tapping opens a bottom sheet with beautiful language cards (Sinhala/Tamil/English).
    *   **Theme**: **Moon/Sun** icon. Toggle for Dark/Light mode.
    *   **Data Saver**: Toggle.
*   **Style**: Each item is a "LotusPetal" - a soft, rounded row that glows when touched.

### Part C: Editability & i18n
*   **Edit Mode**: Full-screen modal with input fields for Name, Role, School Type.
*   **Detached Strings**: ALL labels (`t('profile.name')`, `t('profile.theme')`) must be localized. NO hardcoded English.


## 6. 🏠 Global Header Strategy
**Problem**: Screens currently show generic titles like "Classroom" or "Self" at the top. This feels impersonal and robotic.
**Target State**:
*   **Home/Dashboard**: Show **"Ayubowan, [User Name]"** (Greeting).
    *   Subtitle: "Student • Royal College" (Role + School).
*   **Section Headers**: Instead of big "CLASSROOM" text, use a subtle context indicator.
*   **Consistency**: Apply this personalized header pattern across all main tabs (Self, Classroom, Community).


## 5. ✨ General "Soulfulness"
*   **Buttons**: Replace standard buttons with custom, "soft" touchables (using the new `LotusButton` logic but better styled).
*   **Glows**: Use `sanctuarySaffron` shadow props to create depth.
*   **Motion**: All transitions should feel like "breathing" (ease-in-out), never linear/instant.
