---
title: "First-Principles Cross-Platform Native Build SOP"
status: "active"
created: 2026-09-08
updated: 2026-09-08
author: "Naveen"
scribe: "Antigravity"
tags: [infra, architecture, monorepo, wsl, expo, react-native, hermes, gradle, diagnostics, sop]
---

# First-Principles Cross-Platform Native Build SOP

> **Foundational Standard Operating Procedure for compiling, validating, and accelerating Android native builds within a Windows 11 host, WSL 2 Ubuntu target, pnpm monorepo, and Hermes runtime.**

---

## 1. The 4 First-Principles Architecture Boundaries

Every compilation, bundling, and packaging failure in this repository traces back to one of **four fundamental system boundaries**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    THE 4 FIRST-PRINCIPLES BOUNDARIES                                   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
  ┌───────────────────────────┬─────────────────────┴─────────────┬───────────────────────────┐
  ▼                           ▼                                   ▼                           ▼
[1. HOST/GUEST OS]      [2. PNPM MONOREPO & SYMLINKS]       [3. JS ENGINE (HERMES)]     [4. ANDROID TOOLCHAIN]
• win32 vs linux ELF    • Content-addressable store vs      • Static AST vs Dynamic     • Ephemeral prebuild
• Native .node addons   • Metro SINGLETON_OVERRIDES         • Web Workers, dynamic      • NDK 27 toolchain
• Filesystem bridge     • Duplicate TurboModule singletons  • import() & Node built-ins • local.properties / ccache
```

---

## 2. Exhaustive Boundary Breakdown

### Boundary 1: Host (Windows 11) vs Target (WSL 2 Ubuntu Linux)
* **First Principle:** Native Node addons (`.node` C++/Rust shared objects) are ABI-specific.
* **Mechanism:** `pnpm install` run on Windows host inspects `process.platform === 'win32'` and pulls Windows native binaries. When Gradle/Metro executes inside WSL 2 (Linux x64), Node crashes when loading native addons.
* **Invariant:** Every dependency with platform-specific native addons (`@tailwindcss/oxide`, `lightningcss`, `@sentry/cli`) must have its `linux-x64-gnu` variant declared and installed.

### Boundary 2: Monorepo Hoisting & Symlink Resolution
* **First Principle:** React Native native modules (TurboModules, JSI, Nitro) must maintain strict single-instance resolution at runtime.
* **Mechanism:** In an isolated `pnpm` monorepo, multiple packages (`apps/gurudevi-mobile`, `packages/ui`, `packages/core`) may resolve separate symlinks to identical package versions.
* **Invariant:** Metro must enforce `disableHierarchicalLookup = true` and `SINGLETON_OVERRIDES` for all coordinated packages (`react`, `react-native`, `react-native-reanimated`, `react-native-worklets`, `react-native-nitro-modules`, `react-native-mmkv`, `@shopify/react-native-skia`).

### Boundary 3: JavaScript Engine Boundary (Hermes vs V8/Browser)
* **First Principle:** Hermes compiles static ECMAScript to bytecode (`.hbc`) and rejects dynamic web runtime primitives.
* **Mechanism:** Monorepo packages shared with web surfaces may import libraries using `import(...)` dynamic imports, Web Workers (`new Worker()`), or Node.js core modules (`fs`, `net`, `tls`, `dns`, `stream`, `crypto`).
* **Invariant:** Metro must maintain a deterministic Platform Firewall (`UNIVERSAL_SHIMS` and `WEB_SHIMS`) intercepting all web/Node modules before Hermes parses the module graph.

### Boundary 4: Ephemeral Prebuild & Android Toolchain Boundary
* **First Principle:** In Expo Continuous Native Generation (CNG), the `android/` directory is ephemeral.
* **Mechanism:** Clean prebuilds destroy non-committed files (like `android/local.properties`). Without explicit pointers, Gradle cannot locate `$ANDROID_HOME` or the NDK toolchain in WSL 2.
* **Invariant:** `android/local.properties` must always specify `sdk.dir=/home/nsk/Android/Sdk`, and build scripts must supply `ANDROID_SDK_ROOT`, `ANDROID_NDK_HOME` (NDK 27.1.12297006), and `ccache` options.

---

## 3. The 6-Tier Integrated Verification Suite

To eliminate trial-and-error, our custom diagnostic suite (`scripts/audit-native-pipeline.mjs`) automatically audits all 4 boundaries across 6 distinct validation tiers:

| Tier | Name | Target Validated |
| :--- | :--- | :--- |
| **Tier 1** | **Cross-Platform Native Binaries** | Validates Linux native bindings for Tailwind Oxide, LightningCSS, and Sentry CLI in WSL 2. |
| **Tier 2** | **Android Toolchain & Environment** | Validates SDK path, NDK 27 installation, `local.properties`, and `ccache` responsiveness. |
| **Tier 3** | **Monorepo Package & Singleton Matrix** | Audits sacred versions (`RNGH 3.2.1`, `Reanimated 4.6.0`, `Worklets 0.12.1`, `MMKV 4.3.2`, `Nitro 0.37.1`, `Skia 2.11.2`) and singleton overrides. |
| **Tier 4** | **Metro Firewall & Hermes Compliance** | Validates `UNIVERSAL_SHIMS`, Node core shims, and checks for unhandled dynamic import expressions. |
| **Tier 5** | **PostCSS & Styling Engine** | Headless compilation check of `packages/ui/src/global.css` through Tailwind v4 in WSL 2. |
| **Tier 6** | **Dual-Installation Coexistence** | Asserts `applicationIdSuffix ".release"` and distinct display name `"Gurudevi (Release)"`. |

---

## 4. Operational Runbook

```powershell
# Run the complete integrated diagnostic suite
node apps/gurudevi-mobile/scripts/audit-native-pipeline.mjs

# Build Release APK in WSL 2 (Only after audit passes 100%)
wsl bash /mnt/c/x/apps/gurudevi-mobile/build_release_wsl.sh

# Install to connected device side-by-side with Debug app
adb install -r apps/gurudevi-mobile/android/app/build/outputs/apk/release/app-release.apk
```
