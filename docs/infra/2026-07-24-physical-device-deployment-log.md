---
title: "Physical Device Execution Chronicle & Troubleshooting Log"
status: "active"
created: 2026-07-24
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, infra, historical]
---

# Physical Device Execution Chronicle & Troubleshooting Log

**Date:** July 24, 2026  
**Application:** `spike-rust-inline`  
**Target:** Physical Samsung Device (`R59WB00NMSF`, `arm64-v8a`)  
**Architecture:** Expo SDK 57 / React Native 0.86 (Bridgeless New Architecture) ⇄ Pure Rust JNI (`cedar_benchmark`)

---

## 1. Native Build & Bundling Execution Sequence

### Step 1: Dynamic Library Placement
Verified target ABI `arm64-v8a` on physical hardware and verified library:
```powershell
Copy-Item rust-stub\libcedarling_stub.so android\app\src\main\jniLibs\arm64-v8a\libcedar_benchmark.so -Force
```
- **Library Size:** 4,301,008 bytes (~4.1 MB)
- **Exported Symbols:** Dual exports (`Java_app_CedarBenchModule_native*` and `Java_app_CedarBenchModule_00024Companion_native*`).

### Step 2: Offline Bridgeless JS Bundle Export
To prevent React Native 0.86 Bridgeless Mode `PlatformConstants` RedBox crashes when launching on physical hardware:
```powershell
npx expo export --platform android
cmd.exe /c "copy /y dist\_expo\static\js\android\*.hbc android\app\src\main\assets\index.android.bundle"
```
- **Exported Bundle:** `index.android.bundle` (1.4 MB Hermes bytecode) placed in `android/app/src/main/assets/`.

### Step 3: Metro Port Forwarding
Configured port forwarding over USB ADB bridge:
```powershell
adb reverse tcp:8081 tcp:8081
```

### Step 4: Standalone Android APK Assembly
Compiled the standalone debug APK using `vcvarsall.bat x64` and `JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"`:
```powershell
call gradlew.bat assembleDebug
```
- **Build Outcome:** `BUILD SUCCESSFUL in 1m 6s`
- **Output APK:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 2. Hardware Deployment & ADB Authorization Alert

During `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`, ADB emitted:
```
List of devices attached
R59WB00NMSF    unauthorized
```

> [!IMPORTANT]
> **Action Required on Physical Device (`R59WB00NMSF`):**
> Please check your physical phone screen and accept the **"Allow USB Debugging?"** prompt (select "Always allow from this computer").

---

## 3. Post-Approval Deployment Execution

Once USB Debugging is accepted on your device, the following deployment command installs and launches the benchmark app:

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.neevsk.spikerustinline/.MainActivity
```
