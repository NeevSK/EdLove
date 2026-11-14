# Monorepo Dependency Audit & Decision Ledger

> **Date:** October 9, 2026  
> **Repository:** `NeevSK/EdLove` (Polymath Platform)  
> **Toolchain Baseline:** `pnpm@12.10.1`, `Node 22.23.2`, `TypeScript 7.0.2`

---

## 1. Sacred Native Pins (The Kernel)

| Package | Pinned in AGENTS.md | Installed | Latest on npm | Status |
| :--- | :--- | :--- | :--- | :--- |
| `react-native-gesture-handler` | `3.3.0` | `3.3.0` | `3.3.0` | 🟢 At latest stable |
| `react-native-reanimated` | `4.7.1` | `4.7.1` | `4.7.1` | 🟢 At latest stable |
| `react-native-worklets` | `0.13.0` | `0.13.0` | `0.13.0` | 🟢 At latest stable |
| `react-native-mmkv` | `4.3.2` | `4.3.2` | `4.3.2` | 🟢 At latest stable |
| `react-native-nitro-modules` | `0.37.1` | `0.37.1` | `0.37.1` | 🟢 At latest stable |
| `react-native-skia` | `3.0.2` | `3.0.2` | `3.0.2` (Graphite) | 🟢 Sacred New Arch Pin |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | 🟢 Sacred Toolchain Pin |

**Kernel Assessment:** Zero drift. All sacred pins are functioning at their designated New Architecture baselines.

---

## 2. Expo SDK 58 Internal Patch Alignment

`expo-doctor` identified **31 Expo modules** with official patch releases within the SDK 58 release channel:

| Module | Current | Recommended by Expo SDK 58 | Type |
| :--- | :--- | :--- | :--- |
| `expo` | `58.0.3` | `~58.0.6` | Bugfix patch |
| `expo-router` | `58.0.13` | `~58.0.16` | Route resolution & web fixes |
| `expo-file-system` | `58.0.5` | `~58.0.7` | Native I/O patch |
| `expo-crypto` | `58.0.4` | `~58.0.5` | Security / entropy patch |
| `expo-haptics` | `58.0.4` | `~58.0.5` | Hardware vibration patch |
| `expo-sqlite` | `58.0.9` | `~58.0.10` | SQLite WAL / driver patch |
| `expo-notifications` | `58.1.0` | `~58.1.1` | Push notification patch |
| `expo-image` | `58.0.11` | `~58.0.13` | Image caching / memory patch |
| `expo-video` | `58.0.6` | `~58.0.8` | Video player lifecycle patch |
| `expo-audio` | `58.0.5` | `~58.0.7` | Audio session patch |
| `@expo/metro-runtime` | `58.0.11` | `~58.0.13` | Fast Refresh / bundler patch |
| `expo-constants` | `58.0.9` | `~58.0.10` | Manifest resolution patch |
| `expo-location` | `58.0.11` | `~58.0.12` | Geolocation accuracy patch |
| `expo-updates` | `58.0.14` | `~58.0.15` | EAS update rollback patch |

**Impact Assessment:** These are pure bugfix patches released by the Expo team specifically for SDK 58. They do not change major APIs or break native bindings.

---

## 3. Tooling & Domain Logic Packages

Scanned across `@repo/platform-mcp`, `@repo/core`, `@repo/ui`, and applications:

| Package Group | Current | Available | Update Type | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| `@modelcontextprotocol/*` | `^2.0.0` | `^2.3.1` | Minor | 🟢 Very Low (gateway features) |
| `vitest` / `@vitest/*` | `^5.0.0` | `^5.0.3` | Patch | 🟢 Very Low (test runner fixes) |
| `eslint` | `^10.10.0` | `^10.12.0` | Patch | 🟢 Very Low (linter engine) |
| `lucide-react` / `lucide-react-native` | `^1.51.0` | `^1.53.0` | Minor | 🟢 Very Low (new icons) |
| `xstate` | `^5.32.6` | `^5.33.2` | Minor | 🟢 Low (state machine performance) |
| `pdfjs-dist` (in `@repo/library`) | `^6.3.289` | `^6.4.299` | Minor | 🟢 Low (PDF parsing) |

---

## 4. Upgrade Decision Paths

- **Path A (Full Safe Patch Alignment):** Align the 31 Expo SDK 58 patch updates and update tooling (`vitest`, `eslint`, `mcp`, `lucide`). Keeps all Sacred Pins 100% frozen.
- **Path B (Tooling Only):** Update only dev tools (`vitest`, `eslint`, `mcp`, `lucide`) and leave Expo modules at their current versions.
- **Path C (Status Quo):** Keep all dependencies as-is.
