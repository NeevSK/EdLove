---
name: agent-device-control
description: Guided workflow and commands for running agent-device (Callstack) and argent (SWM) controls.
---

# Agent Device Control & Automation Guide

This skill provides guides and instructions on how to use device automation tools in the Gurudevi Platform to interact with, inspect, and test mobile applications running on simulators or emulators.

---

## 🚀 Unified MCP Tool: `sovereign_device`

The primary way to control and query emulator or simulator states is using the `sovereign_device` tool registered on our `platform-mcp` gateway.

### Action Verbs

The tool supports the following `action` values:

| Action Verb | Target Tool | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `doctor` | Both | Runs diagnostics/health checks. | `{ "tool": "agent-device" \| "argent" }` |
| `snapshot` | `agent-device` | Retrieves the structural accessibility tree. | `{ "platform": "android" \| "ios" }` |
| `screenshot` | Both | Captures the screen of the active device. | `{ "tool": "argent" \| "agent-device", "platform": "android" \| "ios" }` |
| `open_app` | `agent-device` | Launches a specific application bundle. | `{ "appId": "com.gurudevi", "platform": "android" \| "ios" }` |
| `press` | `agent-device` | Presses an element by accessibility identifier. | `{ "element": "login-button" }` |
| `type` | `agent-device` | Inputs text into the currently focused input. | `{ "text": "student@gurudevi.org" }` |
| `scroll` | `agent-device` | Scrolls the active view. | `{ "direction": "up" \| "down" \| "left" \| "right" }` |
| `tap` | `agent-device` | Performs a tap at physical screen coordinates. | `{ "x": number, "y": number }` |
| `logs` | Both | Dumps device and system logs. | `{ "tool": "argent" \| "agent-device" }` |

---

## 🛠️ Diagnostics & Setup Verification

Before attempting interactions, verify that your active emulator or simulator is online and recognized:

```json
// Call tool: sovereign_device
{
  "action": "doctor",
  "params": {
    "tool": "agent-device"
  }
}
```

If using **Argent** (SWM):
```json
{
  "action": "doctor",
  "params": {
    "tool": "argent"
  }
}
```

---

## 👁️ Inspecting UI & Accessibility Tree

Coding agents should always read the accessibility snapshot first to locate interactive elements:

```json
// Call tool: sovereign_device
{
  "action": "snapshot",
  "params": {
    "platform": "android"
  }
}
```

This returns an accessibility JSON node tree containing elements, their bounds, and accessibility labels.

---

## 👆 Performing UI Actions

Once you've identified the target accessibility node label (e.g. `"Login Button"`), you can click it or input text:

```json
// Click the login button
{
  "action": "press",
  "params": {
    "element": "Login Button"
  }
}

// Enter email text
{
  "action": "type",
  "params": {
    "text": "teacher@gurudevi.org"
  }
}
```

To scroll through views:
```json
{
  "action": "scroll",
  "params": {
    "direction": "down"
  }
}
```
