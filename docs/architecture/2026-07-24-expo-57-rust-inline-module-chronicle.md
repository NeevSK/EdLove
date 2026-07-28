# Developer Chronicle & Post-Mortem: Expo SDK 57 Inline Modules ⇄ Pure Rust JNI

## 1. Executive Summary & Goal
The objective of this isolated spike (`spike-rust-inline`) was to **prove whether an Expo SDK 57 Inline Kotlin Module can call a Rust binary directly on a physical Android device (`arm64-v8a`) under New Architecture (`newArchEnabled: true`)**.

**Final Result:** ✅ **100% PROVEN AT RUNTIME ON PHYSICAL DEVICE**.
The app rendered the verbatim string: **`Vessel Secure: Hello from Pure Rust JNI`**.

---

## 2. Technical Journey & Critical Breakthroughs

### Breakthrough 1: Eliminating C++ Glue (`CMakeLists.txt` & `rust_bridge.cpp`)
- **Initial Assumption:** We initially assumed we needed a hand-written C++ JNI bridge (`rust_bridge.cpp`) compiled with CMake to call the Rust library.
- **The Breakthrough:** By leveraging standard JNI symbol mangling rules directly in Rust (`#[no_mangle] pub extern "C" fn Java_app_RustTestModule_...`), Rust exports native JNI functions directly into `.so`. Kotlin loads `libcedarling_stub.so` directly with zero intermediate C++ code!

### Breakthrough 2: Solving the `PlatformConstants` RedBox Crash on Physical Devices
- **Symptom:** When running on a physical Android phone under New Architecture (`newArchEnabled: true`), React Native 0.86 showed a RedBox crash: `TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found`.
- **Root Cause:** React Native 0.86 runs in **Bridgeless Mode** by default. When launching a native binary without Metro active via `adb reverse tcp:8081 tcp:8081` AND without an offline pre-bundled JS asset, the runtime threw an error before rendering any UI.
- **Fix:** Pre-exporting the JS bundle into `android/app/src/main/assets/index.android.bundle` using `npx expo export` created a 100% standalone APK that boots cleanly without Metro network dependencies.

### Breakthrough 3: Expo Autolinking CLI Patch for Windows
- **Symptom:** During Gradle prebuild, Expo autolinking failed with `SyntaxError: Unexpected token 'a', "[app]" is not valid JSON`.
- **Root Cause:** On Windows PowerShell, the CLI passed serialized string arrays like `["app"]` without escaped inner quotes.
- **Fix:** Added a defensive fallback parser in `node_modules/expo-modules-autolinking/build/commands/mirrorKotlinInlineModulesCommand.js`.

---

## 3. Exact Code Architecture & File Chronicle

### 1. `app.json` (Inline Modules Configuration)
Enabled `inlineModules` and configured watched directories:
```json
{
  "expo": {
    "name": "spike-rust-inline",
    "slug": "spike-rust-inline",
    "version": "1.0.0",
    "newArchEnabled": true,
    "experiments": {
      "inlineModules": {
        "watchedDirectories": ["app"]
      }
    },
    "android": {
      "package": "com.neevsk.spikerustinline"
    }
  }
}
```

### 2. `rust-stub/src/lib.rs` (Pure Rust JNI Export)
Directly exported JNI symbols with C-ABI string allocation:
```rust
#[no_mangle]
pub extern "C" fn Java_app_RustTestModule_00024Companion_nativeGetRustMessage(
    env: *mut std::ffi::c_void,
    _class: *mut std::ffi::c_void,
) -> *mut std::ffi::c_void {
    unsafe {
        type NewStringUTF = unsafe extern "system" fn(*mut std::ffi::c_void, *const i8) -> *mut std::ffi::c_void;
        let vtbl = *(env as *mut *mut *mut std::ffi::c_void);
        let new_string_utf: NewStringUTF = std::mem::transmute(*vtbl.add(167));
        let cstr = b"Vessel Secure: Hello from Pure Rust JNI\0";
        new_string_utf(env, cstr.as_ptr() as *const i8)
    }
}

#[no_mangle]
pub extern "C" fn Java_app_RustTestModule_nativeGetRustMessage(
    env: *mut std::ffi::c_void,
    _class: *mut std::ffi::c_void,
) -> *mut std::ffi::c_void {
    unsafe {
        type NewStringUTF = unsafe extern "system" fn(*mut std::ffi::c_void, *const i8) -> *mut std::ffi::c_void;
        let vtbl = *(env as *mut *mut *mut std::ffi::c_void);
        let new_string_utf: NewStringUTF = std::mem::transmute(*vtbl.add(167));
        let cstr = b"Vessel Secure: Hello from Pure Rust JNI\0";
        new_string_utf(env, cstr.as_ptr() as *const i8)
    }
}
```

### 3. `app/RustTestModule.kt` (Expo Kotlin Inline Module)
Placed under `package app` in `app/`:
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

### 4. `App.tsx` (React Native Component)
```typescript
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

const RustTestModule = requireNativeModule('RustTestModule');

export default function App() {
  const [result, setResult] = useState<string>('Not invoked yet');

  const handleTestRustCall = () => {
    const msg = RustTestModule.getRustMessage();
    setResult(msg);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleTestRustCall}>
        <Text style={styles.buttonText}>TEST RUST INLINE CALL</Text>
      </TouchableOpacity>
      <Text style={styles.resultText}>{result}</Text>
    </SafeAreaView>
  );
}
```

---

## 4. Key Learnings & Rules for Future Production Code

1. **Direct JNI Exports in Rust:** When target native interfaces match specific package paths, direct JNI function exports eliminate C++ glue completely.
2. **Kotlin Companion JNI Mangling:** Kotlin Companion object external methods require `00024Companion` in JNI symbol names.
3. **Physical Device Bridgeless Bundling:** Always bundle JavaScript assets (`index.android.bundle`) into `android/app/src/main/assets/` when running release/debug standalone APKs on physical hardware.
