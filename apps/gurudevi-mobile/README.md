---
title: "Gurudevi Mobile Flagship"
status: "active"
created: 2026-02-05
updated: 2026-10-15
author: "Naveen"
scribe: "Antigravity"
tags: [apps, gurudevi-mobile, expo, react-native, offline-first, teachers]
---

# Gurudevi Mobile Flagship

> **The daily operational haven for teachers, students, and school leaders on iOS and Android.**

Gurudevi Mobile is the primary mobile client of the **EdLove** ecosystem. Engineered for high performance on accessible mobile hardware, it brings offline-first simplicity and peace of mind directly into the classroom.

---

## 📱 Human-Centered Capabilities

* **Teacher Classroom Flow**: Fast, one-tap morning attendance, quick student notes, assignment tracking, and timetable orientation that works seamlessly without cellular data or Wi-Fi.
* **The Personal Sanctuary (`Self`)**: Private wellbeing check-ins, mindful reflection, gratitude notes, and personal energy awareness for educators.
* **Student Journey & Portfolios**: Safe spaces for learners to view schedules, submit project reflections, and celebrate learning milestones.
* **Institutional Coordination**: Quick announcements, school calendar overviews, and peer connection circles.
* **Offline Local-First Architecture**: Changes are saved immediately to local SQLite on the device and sync quietly via PowerSync once connectivity is restored.

---

## 🛠️ Architecture at a Glance

* **Framework**: React Native 0.88 with the New Architecture enabled, built with Expo SDK 58.
* **Local Persistence**: High-velocity SQLite with PowerSync offline synchronization and Nitro MMKV storage.
* **Design Primitives**: Tactile NativeWind tokens and APCA-certified high-contrast components from `@repo/ui`.
* **Domain Integration**: Shared business models, capabilities, and contracts provided by `@repo/core`, `@repo/classroom`, and `@repo/self`.

---

## 🚀 Getting Started

### Prerequisites
* Node.js `22.x` and `pnpm`
* Android Studio / Xcode (or Expo Go / Expo Development Client)

### Quick Start
```bash
# From repository root
pnpm install

# Start the Expo development server
pnpm --filter gurudevi-mobile dev

# Or run directly on an Android device/emulator
pnpm --filter gurudevi-mobile android
```

### Local Environment Setup
To develop locally without team credentials, copy the example environment file:
```bash
cp apps/gurudevi-mobile/.env.example apps/gurudevi-mobile/.env.local
pnpm --filter gurudevi-mobile dev:no-doppler
```

---

## 🤝 Contributor & Design Guardrails

* **Sacred Native Pins**: To maintain stability on the React Native New Architecture, native dependencies (`react-native-reanimated`, `react-native-gesture-handler`, `react-native-nitro-modules`, `react-native-skia`) are strictly pinned. Never run automated blanket dependency updates.
* **Respect Teacher Attention**: Every interaction should minimize taps and reduce visual noise. If an action can be completed with a single tap, design it that way.
* **Dignity & Privacy**: Never introduce behavioral trackers, invasive analytics, or third-party advertising SDKs into the mobile client.
