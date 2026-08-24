---
title: "Expo & EAS: Modern Mobile Workflow"
status: "active"
created: 2026-02-17
updated: 2026-02-17
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Expo & EAS: Modern Mobile Workflow

This document explains why we use **EAS (Expo Application Services)** and how it compares to traditional local builds.

## 1. Online vs. Local: The "Why"

| Feature | Local Build (Native) | Online Build (EAS) |
| :--- | :--- | :--- |
| **Setup Cost** | High (Android Studio, Xcode, Java, CocoaPods) | Low (Just EAS CLI) |
| **Hardware** | Need Mac for iOS | Any OS for iOS/Android |
| **Performance** | Slow (Heavy on CPU/RAM) | Fast (Parallel cloud workers) |
| **Monorepo** | Complex linking | Native support for monorepos |
| **Consistency** | "Works on my machine" issues | Deterministic cloud environment |

> [!TIP]
> **EAS Build** is the standard way to build Expo apps since SDK 45+. It eliminates the "native environment nightmare" by building in a clean, managed cloud container.

---

## 2. Key Concepts

### Development Clients (`expo-dev-client`)
Traditional Expo Go has limitations with custom native code. We now use a **Development Client**, which is a custom version of the Expo Go app.
- **Why?** It includes all our specific native modules (Camera, Haptics, etc.).
- **How?** Run `pnpm build:dev` once per native change, then use it for weeks of JS iteration.

### EAS Update (Over-the-Air)
You don't always need to build a new binary.
- **JS Changes?** Use EAS Update to push code instantly to users without App Store review.
- **Native Changes?** Build a new version with EAS Build.

---

## 3. Recommended Workflow

1.  **Iterative Dev**: Use a Development Build on your device. Run `expo start` to stream JS changes instantly.
2.  **Native Change**: If you add a library like `expo-camera`, run `pnpm build:dev` again.
3.  **Preview**: Push a branch, run `pnpm build:preview`, and share the APK/link with teammates.
4.  **Ship**: Run `pnpm build:prod` and `eas submit`.

## 4. Maintenance & Troubleshooting

### `expo-doctor` (Highly Recommended)
Before every build, run:
```bash
npx expo-doctor
```
This tool checks for dependency mismatches, configuration errors, and environment issues that could break your EAS builds.

### `expo install --check`
If you suspect version issues:
```bash
npx expo install --check
```
This will automatically fix package versions that are incompatible with your current Expo SDK.

### Handling "Doctor" Failures
This project uses a bleeding-edge setup (**React 19** and **React Native 0.81**) via pnpm overrides. `expo-doctor` may report errors because it expects standard Expo 54 versions (React 18).

If EAS Build fails due to dependency validation:
1.  **Skip Validation**: You can force the build to proceed by adding an env variable in `eas.json` or your build command:
    ```bash
    EXPO_SKIP_DEPENDENCY_VALIDATION=1 pnpm build:dev
    ```
2.  **Hoisting**: Ensure `.npmrc` has `shamefully-hoist=true` to help the cloud builder find native modules.

## 5. Why pnpm matters here
EAS recognizes our monorepo structure. By using `shamefully-hoist=true` in `.npmrc`, we ensure that native dependencies are correctly resolved by the Android/iOS build tools in the cloud, even though they are nested in a monorepo.

---

## 5. What's Next?
Stay on the `feat/anonymous-onboarding` branch. Use the **EAS Build Guide** for specific commands to launch your first cloud build!
