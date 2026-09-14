---
title: "ChatGPT Desktop & Codex Windows App State Desync & Send Button Lock Recovery SOP"
status: "active"
created: 2026-09-14
updated: 2026-09-14
author: "Naveen"
scribe: "Antigravity"
tags: [codex, chatgpt-desktop, windows, troubleshooting, recovery-sop, dev-tools]
---

# ChatGPT Desktop & Codex Windows App State Desync Recovery SOP

> **Purpose**: Document the root cause, diagnostic steps, and automated one-command recovery procedure for the Windows ChatGPT / Codex Desktop app bug where the message composer locks, dictation hangs, and the "Send" button becomes grayed out or permanently disabled after the first turn.

---

## 1. Problem Overview & Symptoms

### Symptoms
- **Turn 1 works**: The user can launch a conversation and send the first prompt successfully.
- **Subsequent turns lock up**: On turn 2 and beyond, the input box becomes unresponsive, the Send button is muted/grayed out, or clicking it results in an infinite spinner without submitting.
- **Dictation fails**: Voice input/dictation cannot start because the composer is trapped in a false "busy/streaming" lock.
- **Cross-platform discrepancy**: The exact same thread/conversation functions normally when accessed via the web client ([chatgpt.com](https://chatgpt.com)) or mobile apps.

### Affected Builds
- Windows MSIX packages in the `26.90x.x` series (specifically observed and verified on `OpenAI.Codex 26.908.4834.0_x64__2p2nqsd0c76g0`).

---

## 2. Root Cause Analysis

The failure is caused by a client-side state desync between the desktop Chromium/Electron renderer and the background Codex session manager:

1. **Renderer Streaming Lock (`latestTurnStatus=completed` + `markedStreaming=true`)**:
   When a turn completes, the backend flags the stream as done, but the desktop window renderer misses the state transition event. The UI composer remains locked in an internal streaming state, disabling user interaction for subsequent turns.
2. **Orphaned State Files & File Lock Collisions**:
   The app writes runtime state to `%USERPROFILE%\.codex\.codex-global-state.json`. In recent updates, failed write-backs or abrupt app terminations leave dangling atomic write fragments (e.g. `..codex-global-state.json.tmp-*`). Over time, dozens of stale temp files and locks accumulate in `%USERPROFILE%\.codex\`, preventing proper state reconciliation on app relaunch.
3. **Lingering Background Daemons**:
   Closing the ChatGPT window often leaves zombie background processes (`ChatGPT.exe`, `codex.exe`, and prerender helper sub-processes) alive in the background. Because these background tasks keep file locks open, simply relaunching the desktop icon does not reset the corrupted memory or disk state.

---

## 3. Automated One-Command Recovery Procedure

Whenever the issue occurs, run the following PowerShell command. It safely stops all lingering processes, backs up your state file, clears the lock files, and purges stale atomic temp fragments.

### PowerShell Command

```powershell
# 1. Terminate all remaining ChatGPT, Codex, and helper processes
Get-Process -Name "*chatgpt*", "*codex*" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# 2. Paths
$codexDir = "$env:USERPROFILE\.codex"
$stateFile = "$codexDir\.codex-global-state.json"
$stateBak = "$codexDir\.codex-global-state.json.bak"
$timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")

# 3. Safely backup and clear the corrupted global state
if (Test-Path $stateFile) {
    Copy-Item $stateFile "$codexDir\.codex-global-state.json.saved_$timestamp" -Force
    Remove-Item $stateFile -Force
    Write-Output "Backed up state to .codex-global-state.json.saved_$timestamp and removed corrupt file."
}
if (Test-Path $stateBak) {
    Remove-Item $stateBak -Force
}

# 4. Clean up orphaned atomic temporary files
$tmpFiles = Get-ChildItem "$codexDir" -Filter "..codex-global-state.json.tmp-*" -ErrorAction SilentlyContinue
if ($tmpFiles) {
    $tmpFiles | Remove-Item -Force
    Write-Output "Purged $($tmpFiles.Count) stale temporary state files."
}

Write-Output "Recovery complete. You can now launch ChatGPT / Codex and sign in."
```

---

## 4. Post-Recovery User Steps

1. Launch the **ChatGPT / Codex** app from the Start menu.
2. Log in with your account credentials.
3. Start or continue your chat in Codex or Work mode. The composer and Send button will now function normally.

---

## 5. Alternatives & Long-Term Solutions

| Method | Description | When to Use |
| :--- | :--- | :--- |
| **Web Client Fallback** | Use [chatgpt.com](https://chatgpt.com) in browser | Instant zero-maintenance workaround; completely unaffected by desktop renderer bugs. |
| **Recovery Script** | Run Section 3 script above | Best local fix if you prefer using the dedicated Windows Desktop app. |
| **Official Update** | Wait for OpenAI update (> 26.908.x) | Upstream patch via Microsoft Store / app auto-updater when OpenAI ships the fix for GitHub issues #44102 / #43366. |
