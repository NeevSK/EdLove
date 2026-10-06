---
title: "ChatGPT Desktop & Codex Windows App First-Launch Stalls & Elevated Sandbox Recovery SOP"
status: "active"
created: 2026-10-01
updated: 2026-10-01
author: "Naveen"
scribe: "Antigravity"
tags: [codex, chatgpt-desktop, windows, troubleshooting, recovery-sop, sandbox, infra]
---

# ChatGPT Desktop & Codex Windows App First-Launch & Sandbox Recovery SOP

> **Purpose**: Document the complete root causes, diagnostic methodology, and verified resolution procedures for first-launch stalls (infinite spinning logo on blank white screen), MFA session deadlocks, and Windows Sandbox setup failures (`status Some(1)` and error 1332) in the official ChatGPT / Codex Windows desktop app (`OpenAI.Codex`).

---

## 1. Executive Summary & Diagnostic Map

| Symptom | Underlying Root Cause | Verification Evidence | Resolution |
| :--- | :--- | :--- | :--- |
| **Infinite Spinning Logo on White Screen** (Post-MS Store install) | App container is only Tier 1; Tier 2 runtime (~472 MB tar.gz) failed download due to Cloudflare WARP / hotspot TCP reset (`ERR_CONNECTION_RESET`). | `codex-desktop-*.log`: `primary_runtime_bundle_install_outcome ... outcome=failed retryable=false` | Download archive with `curl -C -` and unpack to `~/.cache/codex-runtimes/codex-primary-runtime`. |
| **Infinite Spinning Logo after Runtime Installed** | `~/.codex/auth.json` contained a stale session; OpenAI returned `HTTP 403: Multi-factor authentication required`. React Router rendered `null` at `/`. | `scope_v3.json`: `HTTP 403 Forbidden ... Multi-factor authentication required` and `Matched leaf route at location "/"` | Run `codex logout` to clear deadlocked tokens, forcing the app to mount the fresh login/MFA screen. |
| **"Windows setup didn't finish" Banner** (`status Some(1)`) | Version mismatch: `codex.exe` was updated (v0.159.2), but `codex-windows-sandbox-setup.exe` in `bin/` was an old May 2026 8 MB build. | `orchestrator_helper_exit_nonzero: setup helper exited with status Some(1)` | Copy current binaries from `bin/<hash>/` into `bin/`. |
| **Setup Banner Error 1332** | Windows profile folder is `C:\Users\Naween`, but actual Windows SAM account username is `NSK` (`NAVEEN\NSK`). | `LookupAccountNameW failed for Naween: 1332` (`ERROR_NONE_MAPPED`) | Run elevated setup explicitly specifying `--user NSK`. |

---

## 2. In-Depth Root Cause Analysis

### A. The Two-Stage Installation Architecture
The Microsoft Store package (`OpenAI.Codex_..._x64`) does **not** bundle the execution engine. It only delivers the ~150 MB Electron shell. On first launch:
1. The app contacts `https://persistent.oaistatic.com/codex-primary-runtime/alpha/<version>/codex-primary-runtime-win32-x64-<version>.tar.gz` (~495 MB).
2. It expects to extract the payload to:
   ```text
   C:\Users\<User>\.cache\codex-runtimes\codex-primary-runtime
   ```
3. If this stream is interrupted (e.g., via VPN/WARP timeouts), Electron marks the install as `retryable=false` and stops retrying within that session, trapping the UI on the initial static HTML loader (`<div class="startup-loader">`).

### B. Cloudflare WARP on Cellular Hotspot
- Default network gateway `192.168.137.1` (mobile hotspot/tethering) aggressively expires inactive UDP NAT mappings (30–60s).
- Cloudflare WARP runs over **WireGuard UDP** with IPv6 tunneling (`[2606:4700:cf1:1000::1]`).
- Dropped UDP packets cause the tunnel to mark `Network: unstable`, dropping long-running TLS streams and causing `WSAECONNRESET` / `ERR_CONNECTION_RESET` across both desktop downloads and IDE API sockets.

### C. MFA Session Lock & React Router `null` Leaf Route
- `~/.codex/auth.json` stores CLI and desktop auth. When an account requires MFA or the refresh token expires, the backend API rejects remote control server enrollment with `HTTP 403 Forbidden: {"detail":"Multi-factor authentication required"}`.
- Because `auth.json` existed, the app bypassed the Login screen. Because 403 was received, the main thread router failed to resolve a component for route `"/"`, mounting `<Outlet />` with `null`. The initial loader was never replaced.

### D. Sandbox Setup Binary Drift & SAM Account Mapping
- The elevated Windows Sandbox allows Codex Agent Mode to run commands in an isolated token container.
- When `codex.exe` calls `codex-windows-sandbox-setup.exe`, both must share the same ABI version. When `bin/` contains a stale helper, the helper exits with code 1.
- Furthermore, calling `sandbox setup` with the wrong username (e.g. using folder name `Naween` instead of SAM username `NSK`) triggers Win32 error `1332` (`ERROR_NONE_MAPPED`).

---

## 3. Standard Operating Procedure (SOP) & Fix Runbook

### Step 1: Fix Network & Complete Runtime Engine Installation
If the app is stuck on first launch:
```powershell
# 1. Close hanging processes
Get-Process -Name "ChatGPT" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Check WARP status
warp-cli status
# If unstable, reconnect: warp-cli disconnect; warp-cli connect

# 3. Create destination and download runtime archive with resume support
New-Item -ItemType Directory -Path "$HOME\.cache\codex-runtimes" -Force | Out-Null
curl.exe -L --progress-bar -C - "https://persistent.oaistatic.com/codex-primary-runtime/alpha/26.915.20218/codex-primary-runtime-win32-x64-26.915.20218.tar.gz" -o "$HOME\.cache\codex-runtimes\codex-primary-runtime-win32-x64-26.915.20218.tar.gz"

# 4. Extract runtime package
tar.exe -zxf "$HOME\.cache\codex-runtimes\codex-primary-runtime-win32-x64-26.915.20218.tar.gz" -C "$HOME\.cache\codex-runtimes"

# 5. Clean up archive
Remove-Item "$HOME\.cache\codex-runtimes\codex-primary-runtime-win32-x64-26.915.20218.tar.gz" -Force
```

### Step 2: Clear Deadlocked Auth Tokens
To break out of the MFA/403 blank route loop:
```powershell
# 1. Back up auth file
Copy-Item "$HOME\.codex\auth.json" "$HOME\.codex\auth.json.bak" -Force -ErrorAction SilentlyContinue

# 2. Run official logout command
& "$env:LOCALAPPDATA\OpenAI\Codex\bin\codex.exe" logout

# 3. Verify status returns 'Not logged in'
& "$env:LOCALAPPDATA\OpenAI\Codex\bin\codex.exe" login status
```

### Step 3: Synchronize Release Binaries
Ensure the root `bin/` tools match the newest version:
```powershell
$activeBinDir = Get-ChildItem "$env:LOCALAPPDATA\OpenAI\Codex\bin" -Directory | 
    Sort-Object LastWriteTime -Descending | Select-Object -First 1

Copy-Item -Path "$($activeBinDir.FullName)\*" -Destination "$env:LOCALAPPDATA\OpenAI\Codex\bin\" -Force
```

### Step 4: Elevated Sandbox Provisioning
Resolve the actual Windows SAM account username:
```powershell
# Determine real SAM user name (e.g. NSK)
$realUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name.Split('\')[-1]
Write-Host "Target Windows User: $realUser"
```

In an **Administrator PowerShell** window:
```powershell
& "$env:LOCALAPPDATA\OpenAI\Codex\bin\codex.exe" sandbox setup --elevated --user NSK --codex-home "$env:USERPROFILE\.codex"
```

### Step 5: Verify Whole-Stack Health
Run the built-in diagnostic suite:
```powershell
& "$env:LOCALAPPDATA\OpenAI\Codex\bin\codex.exe" doctor
```
Confirm:
- `✓ auth`: configured or ready for login
- `✓ sandbox`: `sandbox provisioning complete`
- `✓ desktop`: application installed
- `✓ reachability`: endpoints reachable (HTTP 200/405)

---

## 4. Lessons for Future Scenarios

1. **Never Assume MS Store Installs Everything**:
   Modern Electron/native hybrid apps frequently use stubs in the Store and pull runtime weights (~500 MB) during first launch. Always inspect app log directories (`AppData\Local\Packages\<Package>\LocalCache\Local\<App>\Logs`) when an app hangs on its initial window.

2. **Check WireGuard / VPN MTU & UDP Timeouts on Tethering**:
   When working over mobile hotspots, WireGuard UDP connections will silently drop long TCP streams. Always check `warp-cli status` and use `curl -C -` for large artifacts rather than relying on browser/Electron one-shot downloaders.

3. **User Profile Folder != Windows SAM Username**:
   `C:\Users\<Name>` is frequently out of sync with `$env:USERNAME` (due to Microsoft Account logins or renamed profiles). Always check `whoami` or `[System.Security.Principal.WindowsIdentity]::GetCurrent().Name` when configuring Win32 ACLs, services, or sandboxes with Win32 APIs like `LookupAccountNameW`.

4. **Always Inspect Sentry Breadcrumbs on Electron Whitescreens**:
   When an Electron app displays a blank screen or fails to navigate, check `LocalCache\Roaming\<App>\web\<App>\sentry\scope_v3.json`. React Router warnings (`Matched leaf route at location ... is null`) and HTTP 403 API responses pinpoint the exact frontend render blocker.
