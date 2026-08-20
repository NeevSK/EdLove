# EAS Local Build with Docker: Windows Guide

This guide documents how to run unlimited **EAS Local Builds** (`eas build --local`) for **Gurudevi Mobile** on a Windows host using **Docker Desktop**, bypassing standard Windows filesystem limitations (such as CMake `MAX_PATH` errors and Ninja file locking issues).

---

## 1. Why Docker is Required on Windows

When compiling React Native apps using the New Architecture on Windows, the build will often fail due to:
1. **Windows `MAX_PATH` Limits**: Deeply nested `node_modules` (common in `pnpm` monorepos) exceed the 250-character path limit for CMake object files.
2. **Ninja File Locks**: The compilation hooks touch Prefab files during Gradle configuration, causing `ninja: error: manifest still dirty` filesystem loops on Windows.
3. **CPU and RAM Constrains**: Running native C++ compilation (for RNGH v3, Reanimated 4, Skia, and Nitro Modules) requires clean JVM allocation and wide multi-core execution.

Using Docker runs the compilation in an isolated, high-performance Linux environment.

---

## 2. Key Challenges & How We Solved Them

### A. Git Scanning Overhead (10,000+ Untracked Files)
* **Problem**: Running `pnpm install` inside the container created a global `.pnpm-store` directory at the project root. Since it wasn't in the root `.gitignore`, Git attempted to track over 10,000 package cache files, causing severe performance degradation.
* **Solution**: Added `.pnpm-store` and `.pnpm-store/` to the root `.gitignore`. Git now ignores the store cache instantly.

### B. Missing Credentials (`An Expo user account is required`)
* **Problem**: The isolated Docker container did not have your local Expo credentials, causing `eas build` to fail immediately.
* **Solution**: Mounted the host's global Expo configurations directory (`C:\Users\<Username>\.expo`) to the container's root directory (`/root/.expo`). This instantly authenticates the builder.

### C. Missing Runtime Environment Variables (`Missing public Supabase runtime config`)
* **Problem**: The Metro bundler checks for public Supabase keys (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) during eager bundling. Since the container had no access to Doppler secrets, it failed.
* **Solution**: Dumped the host's active Doppler secrets into a temporary `.env.docker` file on the host and passed it to the container using the `--env-file` parameter.

### D. Expired Token Conflicts (`The bearer token is invalid`)
* **Problem**: Your Doppler secrets contained an old or mock `EXPO_TOKEN`. Having this variable present forced EAS CLI to use it instead of falling back to the mounted `.expo` credentials, resulting in a GraphQL auth failure.
* **Solution**: Overrode the token inside the run command using `-e EXPO_TOKEN=""`, forcing EAS CLI to fall back to the mounted `.expo` directory credentials.

---

## 3. Precise Developer Start-from-Zero Build Guide

Follow these steps to run a local EAS build on Windows using Docker:

### Step 1: Prerequisites
1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) and ensure it is running in the background.
2. Ensure you are logged into your Expo account on your Windows host:
   ```powershell
   npx eas-cli login
   ```

### Step 2: Download Doppler Secrets to a Temp Env File
From the workspace root or the app directory on your Windows host (e.g. `apps/gurudevi-mobile`), run:
```powershell
doppler secrets download --no-file --format env | Out-File -Encoding ascii .env.docker
```

### Step 3: Run the Docker Build Command
Execute the following containerized build command directly in **Windows PowerShell**:

```powershell
docker run --name gurudevi_eas_build_container --rm -i `
  --env-file .env.docker `
  -e EXPO_TOKEN="" `
  -v "c:/Users/Naween/projects/polymath-platform:/workspace" `
  -v "c:/Users/Naween/.expo:/root/.expo" `
  -w /workspace/apps/gurudevi-mobile `
  reactnativecommunity/react-native-android:latest `
  bash -c "npm install -g pnpm eas-cli && pnpm install --frozen-lockfile && eas build --platform android --profile preview --local"
```

### Step 4: Cleanup
Once the build completes and exports your APK, delete the temporary env file:
```powershell
Remove-Item .env.docker
```

---

## 4. Troubleshooting: Container Crashes / `unexpected EOF`

* **Problem**: The build suddenly terminates during the Metro Bundler bundling task (`:app:createBundleReleaseJsAndAssets`) with the error:
  `level=error msg="error waiting for container: unexpected EOF"`
* **Cause**: React Native New Architecture compilation + Gradle Daemon + Kotlin Compiler Daemon + Metro Bundler Node process running concurrently exceeds Docker's virtual memory limits, causing the WSL2 VM or Docker Desktop daemon to kill the container.
* **Solution**:
  1. **Increase Docker Desktop Memory**: Open Docker Desktop Settings → Resources → Virtual Disk / Memory, and allocate at least **8GB - 12GB** of RAM and **4-6 CPUs** to the Docker engine.
  2. **Increase WSL 2 Memory**: If using WSL 2, configure your global WSL memory limits. Create or modify `C:\Users\<Username>\.wslconfig`:
     ```ini
     [wsl2]
     memory=12GB # Or 16GB depending on host RAM
     processors=6
     ```
     Then restart WSL by running `wsl --shutdown` in PowerShell.

---

## 5. Reusing the Docker Setup
* **Global Availability**: The `reactnativecommunity/react-native-android:latest` Docker image is stored in your global Docker cache. It is not locked to `gurudevi-mobile`.
* **Cross-Project Use**: You can reuse this image to build any other React Native or Android project on your machine by mounting different folders:
  ```powershell
  -v "C:/Path/To/Your/Other/Project:/workspace"
  ```

---

## 6. Native Windows Development Setup (C:\x)

To run, test, and develop the app natively on Windows offline without path length limits or downloading WSL binaries:

1. **Close your IDE** (to release file locks).
2. Open Windows File Explorer, navigate to `C:\Users\Naween\projects\`, and rename the `polymath-platform` folder to `x`.
3. Move the `x` folder to the root of your `C:` drive (so the path becomes `C:\x`).
4. Reopen `C:\x` in your IDE.
5. Enable Windows Long Paths support by opening PowerShell as Administrator and running:
   ```powershell
   git config --global core.longpaths true
   Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -Value 1
   ```
6. Navigate to `C:\x\apps\gurudevi-mobile` and run your development server offline:
   ```powershell
   pnpm start
   ```
