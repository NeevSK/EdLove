# 📱 Physical Android Device Deployment Playbook via ADB

This playbook serves as the definitive reference guide for running, debugging, and testing **Gurudevi Mobile** on a physical Android device over an ADB (Android Debug Bridge) connection.

---

## 1. Prerequisites & Environment Setup

Before starting, ensure your local development machine has the following tools installed and configured:

### 1.1 Android SDK & Platform Tools
- The Android SDK must be installed (typically via Android Studio).
- Ensure `adb` is added to your system's PATH.
- Test connection:
  ```powershell
  adb devices
  ```
  *(Should list your device. If it says `unauthorized`, accept the prompt on your mobile screen).*

### 1.2 Java Development Kit (JDK)
- JDK 17 (or the version recommended for the current Expo SDK) must be installed.
- Ensure the `JAVA_HOME` environment variable points to your JDK directory.

---

## 2. Fast Local Development: Live Run over USB (Metro Sync)

This mode allows you to compile the native Android application locally, install it on your physical device, and load the JS bundle dynamically from your local Metro server.

### Step 1: Reverse Port Forwarding
By default, the device cannot access `localhost:8081` on your machine. You must forward the port over the USB bridge:
```powershell
adb reverse tcp:8081 tcp:8081
```

### Step 2: Run the App
From the repository root directory, run the Android build command with the Java configuration:
```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; $env:PATH="$env:JAVA_HOME\bin;$env:PATH"; pnpm --filter gurudevi-mobile android
```
Or directly inside `apps/gurudevi-mobile` (ensuring Java environment is set up):
```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; $env:PATH="$env:JAVA_HOME\bin;$env:PATH"; pnpm exec expo run:android
```
This command compiles the native code, generates a debug APK, installs it on your device, and launches it.

---

## 3. Standalone Offline Testing (No Metro Needed)

If you need to test the app without being connected to your computer (e.g., demonstrating the app offline or testing external network changes), you must pre-build the JS bundle and assets into the APK.

### Step 1: Export JS Bundle to Assets
React Native Bridgeless Mode requires core TurboModules immediately. If Metro isn't running, you must bundle the JS into the native assets directory to avoid a `PlatformConstants` RedBox crash:
```powershell
# Create directories if they don't exist
New-Item -ItemType Directory -Force apps/gurudevi-mobile/android/app/src/main/assets

# Export the bundle
pnpm --filter gurudevi-mobile exec expo export --platform android --output-dir apps/gurudevi-mobile/android/app/src/main/assets

# Copy and rename bundle for Android native assets loader
Copy-Item "apps/gurudevi-mobile/android/app/src/main/assets/_expo/static/js/android/*.hbc" "apps/gurudevi-mobile/android/app/src/main/assets/index.android.bundle" -Force
```

### Step 2: Compile Standalone Debug APK
```powershell
cd apps/gurudevi-mobile/android
./gradlew assembleDebug
```
The compiled APK will be generated at:
`apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Install and Launch APK
```powershell
adb install -r apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.neevsk.gurudevi/.MainActivity
```

---

## 4. Hard-Learned Lessons & Troubleshooting

### 4.1 Device shows `unauthorized` in ADB
- **Symptom:** Running `adb devices` shows `R59WB00NMSF unauthorized`.
- **Solution:** Check your phone screen. Accept the **"Allow USB Debugging?"** prompt (select "Always allow from this computer").

### 4.2 RedBox: `'PlatformConstants' could not be found`
- **Symptom:** App crashes immediately upon launch on the physical device with a red error screen.
- **Solution:** You are launching in Bridgeless Mode without an active Metro connection or preloaded offline assets.
  1. Ensure your USB is connected, and run `adb reverse tcp:8081 tcp:8081`.
  2. Start the dev server: `pnpm --filter gurudevi-mobile start`.
  3. Reload the app on the phone.

### 4.3 Out of Memory Errors during Gradle Build
- **Symptom:** Gradle crashes with Java heap space / OutOfMemory errors.
- **Solution:** Run the start scripts with extended memory:
  ```powershell
  $env:NODE_OPTIONS="--max-old-space-size=8192"
  ```
