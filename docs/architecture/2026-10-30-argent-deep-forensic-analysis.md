---
title: "Argent Deep Forensic Analysis & Capability Ledger (v0.31.0)"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Antigravity"
tags: [argent, software-mansion, mcp, diagnostics, profiling, react-native, testing]
---

# Argent Deep Forensic Analysis & Capability Ledger (v0.31.0)

> **Substrate Origin:** `@swmansion/argent@0.31.0` installed at `packages/platform-mcp/node_modules/@swmansion/argent`  
> **Physical Footprint:** 27.03 MB tarball / ~65 MB unpacked on disk  
> **Core Architecture:** Dual-engine test-runner, CDP Hermes debugger, native binary daemon, and MCP server.

---

## 1. Physical Binary Substrate & Architecture

Software Mansion’s Argent v0.31 embeds raw, cross-platform native daemons directly inside its package distribution (`bin/`):

```
@swmansion/argent/bin/
├── win32/
│   └── simulator-server.exe          # Windows Host Native IPC Daemon
├── linux / linux-arm64/
│   └── simulator-server              # Linux / Ubuntu WSL Host Daemon
├── darwin/
│   ├── ax-service                    # macOS Accessibility / CoreSimulator Hook
│   ├── simulator-server              # macOS Native Streaming Engine
│   ├── tvos-ax-service               # Apple TV UI Automation Agent
│   └── tvos-hid-daemon               # Apple TV Remote / D-Pad Simulator
├── resources/android/
│   ├── argent-android-devtools-0.3.0.apk  # On-device companion APK
│   ├── screen-sharing-agent.jar           # Surface flinger & uiautomator bridge
│   ├── arm64-v8a/libscreen-sharing-agent.so
│   ├── armeabi-v7a/libscreen-sharing-agent.so
│   └── x86_64/libscreen-sharing-agent.so
└── tcp/
    └── ax-service                    # Networked accessibility bridge
```

### Operational Mechanism:
* **Android (via ADB / WSL):** Argent injects `screen-sharing-agent.jar` and `libscreen-sharing-agent.so` into `/data/local/tmp` on the Android target. It bypasses conventional UIAutomator2 latency by hooking surface flinger directly, reading accessibility buffers without full OS screen capture penalties.
* **Apple (iOS / tvOS / macOS):** Uses Mach kernel IPC and the proprietary `ax-service` to stream simulator views and dispatch normalized touch/remote events.
* **Licensing Seam:** Dual-license model. Source TypeScript and tool wrappers are **Apache 2.0**. Compiled native daemons (`bin/darwin/*`, `bin/win32/*`, `resources/android/*.so`) are **Software Mansion Proprietary Binary Distributions**.

---

## 2. Complete Functional Tool Catalog (65 Live Tools)

Argent exposes 65 distinct tools across 6 primary operational domains:

### Domain A: Live React 19 / Hermes Runtime Diagnostics
| Tool Name | Parameters | Forensic Functionality |
| :--- | :--- | :--- |
| `react-profiler-renders` | `udid` | Scans live React Fiber tree to collect component render counts and durations *without* requiring an active profiler session. |
| `react-profiler-fiber-tree` | `udid` | Dumps the in-memory React component hierarchy as raw structured JSON. |
| `react-profiler-component-source` | `udid`, `componentName` | Performs host-side Tree-sitter AST lookup: returns the exact file path, line number, and memoization status (`React.memo`, `useMemo`) for any on-screen component. |
| `react-profiler-cpu-summary` | `udid` | Extracts a raw Hermes CPU flamegraph summary (top hotspot functions by self-time). |
| `debugger-evaluate` | `udid`, `expression` | Evaluates arbitrary JavaScript inside the running Hermes engine via Chrome DevTools Protocol (CDP). |
| `debugger-reload-metro` | `udid` | Restarts the Metro JS bundle without restarting the host container or dropping native state. |
| `debugger-inspect-element` | `udid`, `x`, `y` | Inspects the exact React component hierarchy under physical coordinate `(x, y)`. |
| `debugger-log-registry` | `udid` | Dumps structured, deduplicated console log registries captured directly from the JS runtime. |

### Domain B: Native Kernel & OS Profiling
| Tool Name | Parameters | Forensic Functionality |
| :--- | :--- | :--- |
| `native-profiler-start` | `udid`, `mode` | Starts native kernel profiling: Perfetto scheduler traces on Android; Instruments (`xctrace`) on iOS/macOS. |
| `native-profiler-stop` | `udid` | Halts native trace capture and exports binary trace data. |
| `native-profiler-analyze` | `udid`, `tracePath` | Processes raw Perfetto/xctrace data and outputs an LLM-optimized Markdown diagnostics report. |
| `profiler-stack-query` | `udid`, `mode: "hangs" \| "leaks"` | Drill-down tool for investigating thread lockups, hang call chains, and native memory leak stacks. |
| `profiler-combined-report` | `udid` | **Cross-correlates React Fiber commits with native kernel thread hangs on the same timeline.** |

### Domain C: Human Interaction & Gesture Simulation
| Tool Name | Parameters | Forensic Functionality |
| :--- | :--- | :--- |
| `gesture-tap` | `udid`, `x`, `y` | Taps normalized coordinate `(0..1, 0..1)` with precise contact timing. |
| `gesture-swipe` | `udid`, `direction`, `durationMs` | Directional swipe with physical velocity curves. |
| `gesture-pinch` | `udid`, `scale`, `focalX`, `focalY` | Multi-touch pinch-to-zoom or pinch-to-shrink gesture. |
| `gesture-rotate` | `udid`, `rotationDegrees` | Dual-finger rotational torque simulation. |
| `gesture-drag` | `udid`, `from`, `to`, `durationMs` | Continuous coordinate drag. |
| `gesture-custom` | `udid`, `points[]` | Multi-stroke vector gesture. (v0.31 enforces strict `[0, 1]` bounding validation). |
| `button` | `udid`, `button` | Hardware button triggering: `home`, `back`, `power`, `volumeUp`, `volumeDown`, `appSwitch`. |

### Domain D: Deterministic Replay & Assertion
| Tool Name | Parameters | Forensic Functionality |
| :--- | :--- | :--- |
| `await-screen-idle` | `udid`, `timeoutMs`, `minStableMs` | Blocks execution until the screen surface buffer stops dirtying/rendering for at least `minStableMs` (default 250ms). |
| `await-ui-element` | `udid`, `selector`, `condition` | Blocks until an element matches `exists`, `visible`, `hidden`, or text equality (`contains` / `equals`). |
| `e2e-start-recording` / `e2e-finish-recording` | `name`, `project_root` | Records an interactive session into `.argent/flows/*.yaml` for deterministic replay. |
| `e2e-execute` | `flowPath` | Executes a recorded YAML flow with strict timeouts and assertions. |
| `screenshot-diff` | `baselinePath`, `currentPath` | Compares two PNG captures with OCR- and font-aware mismatch thresholds. |

### Domain E: Native Network & Storage Inspection
| Tool Name | Parameters | Forensic Functionality |
| :--- | :--- | :--- |
| `view-network-logs` | `udid` | Captures in-flight HTTP/HTTPS requests from both JS `fetch`/Axios and native `NSURLProtocol`/OkHttp. |
| `view-network-request-details` | `udid`, `requestId` | Extracts raw request/response headers, latency breakdowns, and payload bodies. |
| `chromium-cookies` / `chromium-storage` | `udid`, `action` | Reads, writes, or flushes cookies and `localStorage`/`sessionStorage` on Chromium/Electron surfaces. |

---

## 3. The Typed Client Substrate: `@swmansion/argent/client`

Argent exports a typed Node.js client (`dist/client.d.ts`):

```typescript
export interface ArgentClient {
  listTools(options?: { signal?: AbortSignal }): Promise<ArgentTool[]>;
  callTool<N extends ArgentToolName, T = unknown>(
    name: N, 
    ...params: CallToolParams<N>
  ): Promise<ArgentToolResult<T>>;
  stopServer(): Promise<boolean>;
}

export declare function createArgentClient(): ArgentClient;
export declare function listFlags(): ArgentFlag[];
```

### Strategic Value:
* Bypasses CLI child-process spawning and string quoting vulnerabilities.
* Direct in-process or socket RPC with built-in `AbortSignal` cancellation support.
* Type-safe validation on all tool arguments via generated TypeScript schemas.

