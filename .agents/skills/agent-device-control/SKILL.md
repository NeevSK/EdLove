---
name: agent-device-control
description: Guided workflow and commands for running agent-device (Callstack) and argent (SWM) controls.
---

# Agent Device Control & Automation Guide

This skill provides guides and instructions on how to use device automation tools in the Gurudevi Platform to interact with, inspect, and test mobile applications running on simulators, emulators, or **connected physical devices**.

---

## 🚀 Unified MCP Tool: `sovereign_device`

The repo gateway exposes a small, curated action set through `sovereign_device`. It is useful for platform-MCP-routed operations, but it is not the full device-control surface.

### Software Mansion Argent MCP

Argent is a separate Software Mansion MCP server. This workstation runs it from the Ubuntu WSL checkout so it uses the same ADB/Android SDK environment as native builds. Codex registers it as the `argent` MCP server; after a Codex restart, use its exposed tools directly. Its current tool server has live schemas for device discovery, accessibility descriptions, RN component trees, gestures, recording, network logs, and profilers.

Use Argent's `list-devices` first to get the exact device id, then pass that id to each device-specific tool. Use `debugger-component-tree` for the live React Native component tree; it requires a debugger connection to Metro. Use `describe` for the accessibility/DOM tree. These are different inspections.

Use Callstack `agent-device` for general cross-platform open/press/type/snapshot loops. Use `sovereign_device` when its smaller gateway action set fits or when the repo gateway is specifically required. Do not assume its optional `params.tool = "argent"` route exposes all native Argent tools.

### Selecting a Tool

For calls made through `sovereign_device`, omit `params.tool` for the Callstack `agent-device` adapter or set `params.tool = "argent"` for its limited SWM compatibility path. The richer Argent MCP server is a separate Codex connection; call its exposed tools directly instead of wrapping them in `sovereign_device`.

---

## 📋 Action Verb Reference

### `sovereign_device` actions — Callstack adapter by default

| Action Verb | Description | Key Params |
| :--- | :--- | :--- |
| `doctor` | Health check / device readiness | — |
| `snapshot` | Accessibility tree (XML + bounds) | `{ platform: "android" \| "ios" }` |
| `screenshot` | Capture screen image | `{ platform: "android" \| "ios" }` |
| `open_app` | Launch app by bundle ID | `{ appId: "com.gurudevi", platform }` |
| `press` | Press element by a11y identifier | `{ element: "login-button" }` |
| `type` | Type text into focused input | `{ text: "hello@example.com" }` |
| `scroll` | Scroll the active view | `{ direction: "up" \| "down" \| "left" \| "right" }` |
| `tap` | Tap at physical coordinates | `{ x: number, y: number }` |
| `find-text` | Find element by visible text | `{ text: "Sign In", platform? }` |
| `find-role` | Find element by ARIA role | `{ role: "button", label?: "Submit", platform? }` |
| `logs` | Dump device/system logs | — |
| `network` | Dump captured network requests | — |
| `reload` | Hot-reload Metro JS bundle | — |
| `clear-cache` | Clear Metro cache + reload | — |
| `profile` | CPU/memory sample (JSON) | `{ duration?: number (ms) }` |

### Argent tool names

Argent tools are named by the live MCP schema. The workspace's pinned CLI can also list them with `argent tools` and describe a tool with `argent tools describe <tool-name>`. Invoke the MCP tool itself rather than inventing CLI subcommands such as `argent screenshot` or `argent doctor`; CLI invocations use `argent run <tool-name>`.

---

## 🛠️ Diagnostics & Setup Verification

Check device availability before interacting:

```json
// agent-device
{ "action": "doctor" }

// Argent MCP: list-devices (then use the returned id on tool calls)
{ "platform": "android" }
```

---

## 👁️ Inspecting UI & Accessibility Tree

```json
// Get accessibility snapshot (agent-device)
{ "action": "snapshot", "params": { "platform": "android" } }

// Argent MCP: call debugger-component-tree with the id returned by list-devices.
// It requires the app's React Native debugger to be connected to Metro.
```

Always read the snapshot before pressing/tapping — it reveals element identifiers.

---

## 👆 Basic Interaction

```json
// Press by a11y id
{ "action": "press", "params": { "element": "login-button" } }

// Type text
{ "action": "type", "params": { "text": "teacher@gurudevi.org" } }

// Tap by coordinate
{ "action": "tap", "params": { "x": 200, "y": 450 } }

// Scroll down
{ "action": "scroll", "params": { "direction": "down" } }
```

---

## 🔍 Finding Elements

When you don't know the a11y id, use finders (agent-device):

```json
// Find by visible text
{ "action": "find-text", "params": { "text": "Sign In", "platform": "android" } }

// Find by ARIA role
{ "action": "find-role", "params": { "role": "button", "label": "Submit" } }
```

---

## Gestures, recording, network and profiling

These capabilities are available through the direct Argent MCP server. Load each tool's current schema before calling it; names and required arguments are versioned with the installed package. For sequences, use Argent's `run-sequence` or recorded-flow tools when their current schemas match the task. Do not route them through `sovereign_device` unless its gateway schema explicitly supports the operation.

---

## 🔄 Metro Bundler Control (agent-device)

Useful during development to hot-reload without restarting:

```json
// Hot reload (fast — no cache clear)
{ "action": "reload" }

// Full reload with cache clear (slower, for stale module issues)
{ "action": "clear-cache" }
```

---

## 📊 Performance Profiling (agent-device)

```json
// 5-second CPU/memory sample
{ "action": "profile", "params": { "duration": 5000 } }
```

---

## 🩺 Recommended Debug Workflow (Connected Mode)

When diagnosing a splash screen hang or boot stall:

```
1. doctor        → verify connection
2. screenshot    → confirm what's currently on screen
3. logs          → read boot trace output ([boot trace] lines)
4. network       → check if any network call is hanging
5. reload        → hot-reload if JS bundle seems stuck
6. snapshot      → verify app rendered past splash
```
