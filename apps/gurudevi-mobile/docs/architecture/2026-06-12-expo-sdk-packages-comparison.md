---
title: "Expo SDK Package Comparison & Audit"
status: "active"
created: 2026-06-12
updated: 2026-06-12
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, architecture, expo]
---

# Expo SDK Package Comparison & Audit

This document provides a comprehensive, exhaustive review of all packages provided out-of-the-box (and officially supported) by the **Expo SDK (specifically targeting SDK 56)**, compared against the current usage in the **Gurudevi Mobile** app (`apps/gurudevi-mobile`) and core packages in our monorepo workspace (`packages/*`).

---

## 1. Executive Summary
- **Target Expo SDK**: `v56` (matches `expo` "~56.0.9" in our monorepo).
- **Active Expo Packages**: We currently consume **32 Expo/official packages** monorepo-wide.
- **Unused Expo Packages**: There are **50+ additional Expo packages** available in the SDK that we currently do not use.
- **Key Opportunities**: We can improve security, user experience, and accessibility by introducing specific SDK modules (e.g., Biometrics, Secure IDFA tracking, and System TTS).

---

## 2. Core Comparison Matrix
Below is a categorized breakdown of every official package offered in the Expo SDK, compared with our current usage.

### Hardware & Sensors
| Package | Functionality | Current Status | Notes / Potential Value |
| :--- | :--- | :--- | :--- |
| `expo-sensors` | Main entry point for accelerometer, gyroscope, magnetometer, pedometer, device motion. | `Unused` | Not currently needed unless we build motion-based features. |
| `expo-battery` | Provides battery state, level, and power mode status. | `Unused` | Can be used to pause background syncing or heavy calculations on low battery. |
| `expo-cellular` | Access information about the user's cellular network provider. | `Unused` | Helpful for region-specific adjustments or detecting bandwidth limits. |
| `expo-device` | Query info about hardware (brand, model, memory size, OS details). | **USED** (`gurudevi-mobile`, `@repo/core`, `@repo/ui`) | Used to fetch client device identifiers for telemetry and logging. |

### Security & Authentication
| Package | Functionality | Current Status | Notes / Potential Value |
| :--- | :--- | :--- | :--- |
| `expo-secure-store` | Encrypt and store key-value pairs locally on the device (Keychain/Keystore). | **USED** (`gurudevi-mobile`, `@repo/core`) | Used for token and credential caching. |
| `expo-local-authentication` | FaceID, TouchID, or passcode biometrics authentication. | `Unused` | **High Value**: Can add biometric lock screens to Gurudevi Mobile. |
| `expo-crypto` | Cryptographic functions (hashing, random UUIDs, crypto key generation). | **USED** (`gurudevi-mobile`, `@repo/core`) | Used for secure ID generation and data integrity checks. |
| `expo-auth-session` | Web-browser based authentication flow (OAuth2, OpenID Connect). | **USED** (`gurudevi-mobile`, `@repo/ui`) | Used for authentication integration. |

### User Interface & Media
| Package | Functionality | Current Status | Notes / Potential Value |
| :--- | :--- | :--- | :--- |
| `expo-image` | High-performance React Native image component with disk caching and smooth transition animations. | **USED** (`gurudevi-mobile`) | Used for fast image rendering. |
| `expo-image-manipulator` | Resize, crop, rotate, and compress images on the fly. | **USED** (`gurudevi-mobile`, `@repo/profile`, `@repo/scanner-kit`) | Used to optimize photo uploads before sending to Supabase storage. |
| `expo-image-picker` | System UI to choose images/videos from the gallery or capture a new photo. | **USED** (`gurudevi-mobile`, `@repo/classroom`, `@repo/community`, `@repo/profile`, `@repo/scanner-kit`) | Core dependency for file uploads. |
| `expo-camera` | Renders a camera preview and handles capturing photos/videos. | **USED** (`gurudevi-mobile`, `@repo/scanner-kit`) | Used for custom camera views in scanner kits. |
| `expo-audio` | Audio playback and recording APIs (new class-based module in SDK 56). | **USED** (`gurudevi-mobile`, `@repo/library`) | Replaces legacy audio utilities. |
| `expo-video` | Modern video playback component (new class-based module in SDK 56). | **USED** (`gurudevi-mobile`, `@repo/library`, `@repo/ui`) | Premium video playback interface. |
| `expo-video-thumbnails` | Generate preview thumbnail images from video files. | `Unused` | Can be used to show video previews in chat or libraries. |
| `expo-blur` | Blur effect view component (using native UIVisualEffectView / RenderEffect). | **USED** (`gurudevi-mobile`, `@repo/library`, `@repo/ui`) | Used for premium glassmorphism layouts. |
| `expo-linear-gradient` | Gradient overlay background view. | **USED** (`gurudevi-mobile`, `@repo/library`, `@repo/ui`) | Used extensively for rich theme aesthetics. |
| `expo-mesh-gradient` | Smooth, multi-point fluid gradients (new in SDK 56). | `Unused` | Excellent fit for premium dark mode UI designs. |
| `expo-symbols` | SF Symbols (iOS only, falls back gracefully) for crisp, system-consistent icons. | `Unused` | Can replace heavier vector icon resources for iOS targets. |
| `expo-haptics` | Trigger physical taptic/haptic feedback on supported devices. | **USED** (`gurudevi-mobile`, `@repo/core`, `@repo/graphics`, `@repo/self`, `@repo/ui`) | Enhances micro-animations and button presses. |

### Data, Files & Storage
| Package | Functionality | Current Status | Notes / Potential Value |
| :--- | :--- | :--- | :--- |
| `expo-sqlite` | Local high-speed SQLite database engine (with React hooks and modern async API). | **USED** (`gurudevi-mobile`, `@repo/library`) | Drives the local-first PowerSync pipeline. |
| `expo-file-system` | Read, write, upload, and download files locally on device storage. | **USED** (`gurudevi-mobile`, `@repo/core`, `@repo/library`, `@repo/profile`, `@repo/scanner-kit`, `@repo/ui`) | Heavy utilization for document caching and sync mechanisms. |
| `expo-sharing` | Share local files (images, PDFs) with other apps on the device. | **USED** (`gurudevi-mobile`, `@repo/core`, `@repo/library`, `@repo/scanner-kit`, `@repo/ui`) | Used for exporting reports, certificates, and scan assets. |
| `expo-document-picker` | Access device file picker to select custom files (PDF, docx, etc.). | **USED** (`gurudevi-mobile`) | Used for attachment selection in assignments. |
| `expo-media-library` | Access system photo/video libraries to save or load native assets. | `Unused` | **Potential Value**: Better gallery management in `packages/scanner-kit`. |

### System & Device APIs
| Package | Functionality | Current Status | Notes / Potential Value |
| :--- | :--- | :--- | :--- |
| `expo-location` | Query GPS location, handle updates, geofence, and parse addresses. | **USED** (`gurudevi-mobile`, `@repo/graphics`, `@repo/ui`) | Essential for location-aware classroom/attendance features. |
| `expo-clipboard` | Get and set text or images on the device clipboard. | **USED** (`gurudevi-mobile`, `@repo/admin`, `@repo/classroom`, `@repo/community`, `@repo/core`, `@repo/profile`, `@repo/scanner-kit`, `@repo/ui`) | Used monorepo-wide for sharing links, IDs, and codes. |
| `expo-notifications` | Push and local notifications scheduler. | **USED** (`gurudevi-mobile`, `@repo/core`) | Main messaging and alert channel. |
| `expo-localization` | Query regional settings, languages, currencies, and timezones. | **USED** (`gurudevi-mobile`) | Plugs into `react-i18next`. |
| `expo-web-browser` | Open in-app browser modals (Safari View Controller / Custom Tabs). | **USED** (`gurudevi-mobile`, `@repo/ui`) | Keeps the user inside the app during link clicks. |
| `expo-application` | Fetch bundle IDs, build version, install times, and release channels. | **USED** (`gurudevi-mobile`) | Used for store version check. |
| `expo-background-task` | Schedule background execution loops (New in SDK 56). | **USED** (`gurudevi-mobile`, `@repo/core`) | Essential for sync sync pipelines. |
| `expo-task-manager` | Coordinate background tasks (notifications, geo-updates, background syncs). | **USED** (`gurudevi-mobile`, `@repo/core`) | Works in tandem with `expo-background-task`. |
| `expo-linking` | Dynamic deep link configuration and parsing. | **USED** (`gurudevi-mobile`, `@repo/library`) | Powering app routing. |
| `expo-speech` | Text-to-speech engine. | `Unused` | **Value**: Read out classroom instructions, helping with accessibility. |
| `expo-mail-composer` | Standard mail client draft composer. | `Unused` | Simple feedback loop or contact channel. |
| `expo-sms` | SMS draft composer. | `Unused` | Invite friends/colleagues. |
| `expo-tracking-transparency` | Request iOS App Tracking Transparency (ATT) permissions for advertising/analytics. | `Unused` | **Recommended**: If we need precise analytics/IDFA access on iOS. |
| `expo-store-review` | Request in-app ratings and reviews. | `Unused` | **High Value**: Prompt users to rate Gurudevi Mobile directly in the app. |

---

## 3. High-Value Packages to Add to Gurudevi Mobile

Based on the audit, the following packages are officially available in the Expo SDK and should be considered for near-term integration:

### 1. `expo-local-authentication` (Biometrics)
- **Use Case**: Enable Touch ID / Face ID / Android Biometric prompts to secure the app.
- **Why**: Since Gurudevi is a multi-role educational platform (handling grades, student records, and payments), biometrics add standard security to token refreshes and sensitive screens.
- **Command**: `npx expo install expo-local-authentication`

### 2. `expo-store-review` (App Ratings)
- **Use Case**: Prompt students, teachers, or administrators to write a review.
- **Why**: Allows rating the app directly inside Gurudevi Mobile without kicking the user to the App Store/Play Store, significantly boosting store ratings.
- **Command**: `npx expo install expo-store-review`

### 3. `expo-speech` (Accessibility & Text-to-Speech)
- **Use Case**: Read classroom assignments, instructions, or flashcard content.
- **Why**: Provides a natively integrated TTS engine without calling external, slow web APIs, greatly assisting lower-grade or visually impaired classroom participants.
- **Command**: `npx expo install expo-speech`

### 4. `expo-media-library` (Local gallery saving)
- **Use Case**: Save captured scanner assets directly to the device's camera roll from `scanner-kit`.
- **Why**: Custom camera modules can bypass standard photo pipelines, and saving scans locally creates an offline backup for the user.
- **Command**: `npx expo install expo-media-library`

---

## 4. Cleaning Up Overlaps and Deprecated APIs

1. **`expo-barcode-scanner`**:
   - In `packages/scanner-kit/package.json` line 15, `expo-barcode-scanner` is marked as `"unused"`.
   - **Correction**: This library is deprecated by Expo in favor of `expo-camera`. It should be removed completely since we use `expo-camera` (~56.0.7) and native ML Kit barcode scanning (`@react-native-ml-kit/barcode-scanning`).

2. **Aligning Versions (from `sovereign_audit` details)**:
   - Several of our active packages are slightly misaligned within SDK 56 (e.g. `expo@56.0.9` wants `~56.0.11`, `expo-video@56.1.2` wants `~56.1.3`).
   - We should run `pnpm exec expo install --check` inside `apps/gurudevi-mobile` to align package versions.
