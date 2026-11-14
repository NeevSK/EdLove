---
title: "Agent-Device Forensic Analysis & Autonomous Navigation Engine (v0.21.33)"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Antigravity"
tags: [agent-device, callstack, mcp, navigation, settlement, accessibility, testing]
---

# Agent-Device Forensic Analysis & Autonomous Navigation Engine (v0.21.33)

> **Substrate Origin:** `agent-device@0.21.33` installed at `packages/platform-mcp/node_modules/agent-device`  
> **Physical Footprint:** Multi-package monorepo bundle with embedded native helper APKs and swift bridges.  
> **Core Architecture:** Autonomous navigation daemon, semantic accessibility ref engine, virtual IME injector, and interactive settlement loop.

---

## 1. Physical Architecture & Runtime Substrate

Callstack’s `agent-device` is engineered specifically to eliminate agent hallucinations during mobile UI automation. It provides 75 distinct CLI commands and typed SDK entry points (`dist/src/index.d.ts`):

```
agent-device (v0.21.33)
├── Daemon Runtime:
│   ├── State directory tracking & session leasing (`DaemonConnection`, `Lease`)
│   └── Bearer-token IPC with graceful drain budgets (`ShutdownReport`)
├── Embedded Helpers:
│   ├── android/snapshot-helper/dist/   # Native APK reading accessibility buffers
│   ├── android/ime-helper/dist/        # Native Android IME bypass APK
│   ├── apple/snapshot-bridge/          # Swift accessibility extractor for iOS
│   ├── apple/fold-helper/              # Foldable and dual-screen posture helper
│   └── linux/atspi-dump.py             # Linux AT-SPI accessibility dumper
└── Typed Modular Exports:
    ├── . (Main client & command runners)
    ├── ./finders & ./selectors         # Semantic accessibility query parser
    ├── ./metro                         # Metro JS bundle control & cache invalidation
    ├── ./artifacts                     # Screenshot diffing and local trace management
    └── ./batch                         # Multi-step atomic execution sequences
```

---

## 2. Core Operational Pillars & Key Mechanics

### A. The `--settle` Protocol (Anti-Flapping Loop)
In standard mobile test tools (Appium, Detox), clicking an element returns immediately while animations, network debounce, or layout recalculations continue in the background. An AI agent checking the screen immediately reads a stale or half-rendered state.

`agent-device` solves this with the `--settle` modifier:
* **Syntax:** `press <target> --settle`, `scroll <direction> --settle`, `back --settle`.
* **Execution:** Dispatches the hardware event $\rightarrow$ polls surface buffer dirty bits until UI stops moving $\rightarrow$ computes and prints **only the semantic UI diff** (`diffSnapshot`) rather than the entire 500-line XML tree.
* **Agent Benefit:** Minimizes token usage and eliminates race conditions.

### B. Stable Element References (`@ref` IDs)
Rather than relying on brittle raw coordinates `(x, y)` or ambiguous XPath queries:
* `agent-device` tags every visible interactive node with a stable pinned identifier: `@e12`, `@e12~s4`.
* If an element moves slightly due to a scroll or layout reflow, the `@ref` anchor remains intact.
* **Fallback Hierarchy:** `@ref` $\rightarrow$ Semantic Selector (`id`, `role`, `text`, `label`) $\rightarrow$ Coordinate Tap `(x, y)` as a strict last resort.

### C. Native IME Bypass (`ime-helper`)
* Mobile software keyboards (Gboard, iOS Virtual Keyboard) introduce layout jumps and slow key-entry animations that cause UI elements to slide off-screen.
* `agent-device` bundles `android/ime-helper`, injecting text directly into the focused `InputConnection` without animating or opening the soft keyboard.

---

## 3. Tool & Command Inventory Summary (75 Commands)

| Category | Primary Commands | Operational Surface |
| :--- | :--- | :--- |
| **Session Control** | `open`, `close`, `devices`, `apps`, `appstate` | Lifecycle management; launches target bundle ID and returns initial `@ref` snapshot. |
| **Navigation & Action** | `press`, `click`, `fill`, `longpress`, `hover`, `type`, `back`, `scroll` | Dispatches interaction events with optional `--settle` raster verification. |
| **Verification & Assertions** | `is`, `get`, `find`, `wait text`, `wait <selector>`, `wait absent` | Deterministic verification predicates. Enforces rule: *A bare screenshot is not verification.* |
| **Metro Bundler** | `metro reload`, `metro clear-cache` | Restarts the React Native Metro JS bundle directly over CDP. |
| **Evidence & Diagnostics** | `snapshot`, `screenshot`, `diff`, `logs`, `network`, `profile` | Captures XML snapshots, network logs, and hardware telemetry. |
| **Platform Hardware** | `button`, `shake`, `orientation`, `telephony` | Controls physical buttons (`home`, `back`, `power`), screen orientation, and phone calls. |

---

## 4. Current State in `DeviceService.ts`

In [`packages/platform-mcp/src/services/DeviceService.ts`](file:///c:/x/packages/platform-mcp/src/services/DeviceService.ts):
* `agent-device` powers the default action verbs (`doctor`, `snapshot`, `screenshot`, `open_app`, `press`, `type`, `scroll`, `tap`, `find-text`, `find-role`, `logs`, `network`, `reload`, `clear-cache`, `profile`).
* By bumping `agent-device` from `0.21.29` to `0.21.33`, we acquired improved Android 15 snapshot stability, hardened session lease cleanup, and more resilient daemon process recovery.

