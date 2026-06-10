---
title: "Web-Native Compatibility Guide"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [technical, web, native, shims]
---

# Web-Native Compatibility Guide

This document defines code-sharing guidelines, shimming practices, and layout adaptations for cross-platform development on mobile and web environments.

---

## 1. Code Sharing via Metro Resolution

Gurudevi is built on a shared monorepo architecture. Code-sharing uses Metro's platform resolution extensions:
* **Default imports**: Imports targeting `.tsx` files automatically resolve to standard mobile layouts.
* **Platform Overrides**: Creating a companion file with a `.web.tsx` extension instructs Metro to inject this file for web bundle compilation. This is the preferred method for building desktop layouts.

---

## 2. Shimming Native Packages on Web

Some third-party packages in `package.json` require native iOS/Android APIs and will crash the web bundler if imported directly. We resolve this by writing web shims:

* **Barcode Scanner Kit**: Shims `@react-native-ml-kit/barcode-scanning` to utilize the browser's native webcam stream via MediaDevices API, or falls back to a manual image upload input.
* **Haptics (`expo-haptics`)**: Shims `expo-haptics` to call a no-op function or fallback browser vibration (`navigator.vibrate`).
* **Secure Store (`expo-secure-store`)**: Shims secure storage to read/write using encrypted cookies or session-scoped browser storage.
* **Geolocation (`expo-location`)**: Shims location providers to fall back to the standard browser Geolocation API.

---

## 3. Layout Affordances & Responsive shells

Mobile phones operate on single-column flex layouts. Web platform users require desktop grids.
* **Responsive Shell Spec**: Screens use the shared responsive layout engine. For mobile, the screen is single-column. For tablets and web, it scales dynamically to side-by-side CSS grids, columns, and navigation sidebars.
* **Expo Router Navigation Compatibility**:
  * Navigation actions must use `<Link />` or the `useRouter()` hook from `expo-router` to ensure browser URL routing is preserved (allowing back/forward history and deep linking).
  * Web overrides (like `LibraryScreen.web.tsx`) must preserve the exact same route parameters as their native counterparts to prevent link breakage.
