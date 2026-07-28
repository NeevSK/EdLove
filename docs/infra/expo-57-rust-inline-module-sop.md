# SOP & Engineering Playbook: Expo SDK 57 Local Inline Native Modules ⇄ Pure Rust JNI

## 1. Executive Summary & Architectural Overview
This document serves as the **definitive standard operating procedure (SOP)** for integrating Rust native libraries directly into an Expo SDK 57 application using **Expo Local Inline Native Modules** under React Native's New Architecture (`newArchEnabled: true`).

### Core Architecture
- **Expo Inline Modules:** Kotlin (`.kt`) files placed directly inside `app/` (or configured directories) are automatically detected and autolinked into the native build by Expo CLI.
- **Pure Rust JNI Export:** Rust native code exports JNI function symbols (`Java_app_ModuleName_functionName`) directly via `#[no_mangle] pub extern "C" fn`. This completely eliminates the need for intermediate C++ files (`CMakeLists.txt` and `rust_bridge.cpp`).
- **JSI Interop Layer:** Expo's `ExpoModulesCore` exposes these Kotlin methods directly to JavaScript/TypeScript via `requireNativeModule('ModuleName')`.

---

## 2. Step-by-Step Implementation SOP

### Step 1: Configure `app.json` for Inline Modules
Add the `inlineModules` experiment to `app.json`:
```json
{
  "expo": {
    "name": "your-app",
    "slug": "your-app",
    "version": "1.0.0",
    "newArchEnabled": true,
    "experiments": {
      "inlineModules": {
        "watchedDirectories": ["app"]
      }
    },
    "android": {
      "package": "com.yourcompany.app"
    }
  }
}
```

### Step 2: Implement Pure Rust JNI Library
Create `rust-stub/src/lib.rs` exporting JNI functions directly.

#### Option A: Using `jni = "0.22"` crate (Recommended)
```rust
use jni::objects::{JClass, JString};
use jni::sys::jstring;
use jni::JNIEnv;

#[no_mangle]
pub unsafe extern "C" fn Java_app_RustTestModule_nativeGetRustMessage<'local>(
    env: JNIEnv<'local>,
    _class: JClass<'local>,
) -> jstring {
    let output = env
        .new_string("Hello from Pure Rust JNI")
        .expect("Failed to create JString");
    output.into_raw()
}

// Support for static companion calls
#[no_mangle]
pub unsafe extern "C" fn Java_app_RustTestModule_00024Companion_nativeGetRustMessage<'local>(
    env: JNIEnv<'local>,
    _class: JClass<'local>,
) -> jstring {
    let output = env
        .new_string("Hello from Pure Rust JNI")
        .expect("Failed to create JString");
    output.into_raw()
}
```

#### Option B: Zero-Dependency Pure Rust JNI (No Crates)
```rust
#[no_mangle]
pub extern "C" fn Java_app_RustTestModule_nativeGetRustMessage(
    env: *mut std::ffi::c_void,
    _class: *mut std::ffi::c_void,
) -> *mut std::ffi::c_void {
    unsafe {
        type NewStringUTF = unsafe extern "system" fn(*mut std::ffi::c_void, *const i8) -> *mut std::ffi::c_void;
        let vtbl = *(env as *mut *mut *mut std::ffi::c_void);
        let new_string_utf: NewStringUTF = std::mem::transmute(*vtbl.add(167));
        let cstr = b"Hello from Pure Rust JNI\0";
        new_string_utf(env, cstr.as_ptr() as *const i8)
    }
}
```

### Step 3: Cross-Compile Rust for Android (`arm64-v8a`)
Compile using Android NDK's LLVM Clang linker:
```powershell
$env:ANDROID_NDK_HOME = "C:\Users\Naween\AppData\Local\Android\Sdk\ndk\27.1.12297006"
cargo build --target aarch64-linux-android --release
```
Copy `libcedarling_stub.so` to:
`android/app/src/main/jniLibs/arm64-v8a/libcedarling_stub.so`

### Step 4: Write Kotlin Inline Module (`app/RustTestModule.kt`)
Place `RustTestModule.kt` directly inside `app/` under `package app`:
```kotlin
package app

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RustTestModule : Module() {
  companion object {
    init {
      System.loadLibrary("cedarling_stub")
    }

    @JvmStatic
    private external fun nativeGetRustMessage(): String
  }

  override fun definition() = ModuleDefinition {
    Name("RustTestModule")

    Function("getRustMessage") {
      return@Function nativeGetRustMessage()
    }
  }
}
```

### Step 5: Consume in React Native (`App.tsx` or `app/index.tsx`)
```typescript
import React, { useState } from 'react';
import { Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

const RustTestModule = requireNativeModule('RustTestModule');

export default function App() {
  const [result, setResult] = useState<string>('Not called');

  const handlePress = () => {
    const msg = RustTestModule.getRustMessage();
    setResult(msg);
  };

  return (
    <SafeAreaView>
      <TouchableOpacity onPress={handlePress}>
        <Text>Call Rust Module</Text>
      </TouchableOpacity>
      <Text>{result}</Text>
    </SafeAreaView>
  );
}
```

---

## 3. Hard-Learned Lessons & Physical Device Troubleshooting Runbook

### Lesson 1: Bridgeless Mode `PlatformConstants` RedBox Crash
- **Symptom:** RedBox crash `TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found`.
- **Cause:** React Native 0.86 in Bridgeless Mode (`newArchEnabled: true`) requires core TurboModules immediately upon JS engine startup. Launching an APK without active Metro server connection or embedded offline JS assets causes this failure.
- **Rule:** Before installing an APK on physical hardware for offline testing, **always export the JS bundle into native assets**:
  ```powershell
  npx expo export --platform android --output-dir android/app/src/main/assets
  Copy-Item "android\app\src\main\assets\_expo\static\js\android\*.hbc" "android\app\src\main\assets\index.android.bundle" -Force
  ```

### Lesson 2: USB Debugging Port Forwarding
- **Rule:** When testing live with Metro over USB, always run:
  ```powershell
  adb reverse tcp:8081 tcp:8081
  ```

### Lesson 3: Expo Autolinking Windows Path Parsing Patch
- **Symptom:** Gradle build fails with `SyntaxError: Unexpected token 'a', "[app]" is not valid JSON`.
- **Cause:** Windows PowerShell passes `watchedDirectoriesSerialized` as unquoted string arrays.
- **Patch:** In `node_modules/expo-modules-autolinking/build/commands/mirrorKotlinInlineModulesCommand.js`:
  ```javascript
  let watchedDirectories;
  try {
      watchedDirectories = JSON.parse(watchedDirectoriesSerialized);
  } catch {
      watchedDirectories = watchedDirectoriesSerialized.replace(/^\[|\]$/g, '').split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  ```

### Lesson 4: Kotlin Companion JNI Symbol Mangling Rule
- **Rule:** External methods inside Kotlin companion objects get mangled by the JVM with `$Companion` (`00024Companion` in JNI C export names). Always export both standard and companion JNI symbols from Rust:
  - `Java_app_RustTestModule_nativeGetRustMessage`
  - `Java_app_RustTestModule_00024Companion_nativeGetRustMessage`
