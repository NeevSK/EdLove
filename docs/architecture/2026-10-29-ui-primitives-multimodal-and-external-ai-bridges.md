---
title: "UI Primitives, Multimodal Pipeline, OS App Intents & External AI Bridges Blueprint"
status: "active"
created: 2026-10-29
updated: 2026-10-29
author: "Naveen"
scribe: "Antigravity"
tags: [ai, legend-list, enriched-markdown, multimodal, app-intents, mcp, omnichannel, architecture]
---

# UI Primitives, Multimodal Pipeline, OS App Intents & External AI Bridges Blueprint

> **Executive Summary:**  
> A frontier 2026 AI Companion (matching the tactile fluidity of the **ChatGPT App**, **Gemini App**, and **Claude Mobile/Web**) requires four interlocking substrates beyond raw LLM intelligence:
> 1. **120fps Streaming UI & Rich Markdown Primitives:** `@legendapp/list` (`KeyboardAwareLegendList` with `anchoredEndSpace`), Software Mansion's C++/Fabric `react-native-enriched-markdown` (`EnrichedMarkdownText` & `EnrichedMarkdownTextInput`), `react-native-streamdown`, and `react-native-keyboard-controller`.
> 2. **Full Multimodal Input & Slash-Command Composer:** Camera/Photo Vision (`expo-image-picker` / `/api/ai/vision/extract`), Document/Syllabus attachment (`expo-document-picker`), Voice/Audio prompts (`expo-audio` / `@tanstack/ai` transcription), `/slash` & `@domain` starters, and 1-tap Clipboard/Canvas actions.
> 3. **OS-Level Agentic Bridges (Expo 58 Native Intents):** iOS **App Intents** (`expo-app-intents` / `@expo/ui` `AppEntity` for Siri, Apple Intelligence, Spotlight & Action Button) and **Android 16 `AppFunctions`** (on-device MCP exposing Sanctuary tools to the Gemini System Agent).
> 4. **Bidirectional External AI App Connectors & Real-World Messaging Bots:** A unified **External AI Connector Manifest (`/api/ai/connector-manifest`)** + **Streamable HTTP MCP Door (`/api/mcp`)** so users can connect Gurudevi inside ChatGPT, Gemini, or Claude, alongside **Verified Omnichannel Bot Doors (`/api/doors/omnichannel/whatsapp|telegram`)** routing real-world messaging bots into the exact same 4-Sphere Companion `Orchestrator`.

---

## 1. Native & Web UI Primitives Audit: LegendList, SWM Rich Markdown & Keyboard Physics

### 1.1 `@legendapp/list@3.6.0` vs. `@shopify/flash-list@2.3.3` for Streaming AI Chat

Both `@legendapp/list@3.6.0` and `@shopify/flash-list@2.3.3` are installed in the monorepo, and each serves its optimal mechanical niche:

| Dimension | `@legendapp/list@3.6.0` (`SanctuaryLegendList`) | `@shopify/flash-list@2.3.3` | Verdict for `AIScreen` Streaming Chat |
| :--- | :--- | :--- | :--- |
| **Dynamic Item Height Mutation (60–120fps Token Streaming)** | Native dynamic size tracking without layout measurement passes or blank cell flashing during rapid token growth | Optimized for uniform or predictable feed cards; rapid height expansion during token streaming can jitter | **Winner: `@legendapp/list`** |
| **Chat Auto-Scroll & Bottom Pinning** | Built-in `initialScrollAtEnd`, `maintainScrollAtEnd`, and `alignItemsAtEnd` | Requires manual `onContentSizeChange` + scroll offset math | **Winner: `@legendapp/list`** |
| **Interactive Keyboard Physics** | First-class `@legendapp/list/keyboard` (`KeyboardAwareLegendList`) integrated with `react-native-keyboard-controller@1.22.9` (`keyboardLiftBehavior="whenAtEnd"`) | Requires external keyboard padding wrapper | **Winner: `@legendapp/list`** |
| **Streaming Reply Trailing Anchor (`anchoredEndSpace`)** | Native `anchoredEndSpace` prop reserves breathing space beneath the active streaming assistant bubble so incoming lines never collide with the composer | Not built-in | **Winner: `@legendapp/list`** |

### 1.2 Software Mansion Rich Text & Streaming Markdown Stack

1. **`react-native-enriched-markdown@1.1.1` (Software Mansion — Installed in `packages/ui` & `apps/gurudevi-mobile`):**
   - Software Mansion's Fabric/New Architecture native text & input engine (`EnrichedMarkdownText` + `EnrichedMarkdownTextInput`) powered by a shared C++ `md4c` AST parser, mapping directly to iOS `UITextView` (`TextKit`) and Android `TextView` (`Spannable`) with **zero WebView overhead**.
   - Upgraded [`MessageBubble.tsx`](file:///c:/x/packages/ui/src/components/MessageBubble.tsx) with rich semantic styling for `codeBlock`, `code`, `h1`–`h3`, `blockquote`, `link`, and `strong`.
2. **`react-native-streamdown@^0.2.0` (Installed in `apps/gurudevi-mobile/package.json`):**
   - Stabilizes unterminated markdown tokens mid-stream.
3. **`react-native-keyboard-controller@1.22.9` + `react-native-external-keyboard@^1.2.1`:**
   - Frame-synchronized keyboard physics and hardware keyboard shortcuts.

---

## 2. Multimodal Input, Vision, Voice & Slash Command Pipeline

In [`AIScreen.tsx`](file:///c:/x/packages/ai/src/screens/AIScreen.tsx) and [`ChatComposer.tsx`](file:///c:/x/packages/ui/src/components/ChatComposer.tsx), the `+` button opens the **Multimodal & Slash-Command Tray** supporting:
- **📷 Photo / Vision Scan** (`/api/ai/vision/extract` integration for handwritten rubrics, attendance sheets, or notes).
- **📄 Document / Syllabus PDF** attachment cards.
- **🎙️ Voice Note / Dictation** prompt cards.
- **📌 Active Screen Context Snapshot** (`@repo/core/ai/contextRegistry`).
- **⚡ 1-Tap Slash Command Starters** (`/lesson`, `/quiz`, `/rubric`, `/explain`, `/summary`, `/world`).
- **📋 1-Tap Copy** on assistant replies and inside the Artifact Canvas modal.

---

## 3. OS-Level Agentic Bridges & External AI / Bot Connectors

Defined in [`packages/core/src/ai/appIntentsAndBridges.ts`](file:///c:/x/packages/core/src/ai/appIntentsAndBridges.ts) and exposed via `GET /api/ai/connector-manifest` in [`apps/sanctuary-api/src/ai/routes.ts`](file:///c:/x/apps/sanctuary-api/src/ai/routes.ts):
1. **OS App Intents (`SANCTUARY_APP_INTENTS`):** Maps 1:1 to iOS `AppIntents` (Siri / Apple Intelligence / Shortcuts) and Android 16 `AppFunctions` (on-device Gemini System Agent MCP).
2. **External AI App Connector Manifest (`GET /api/ai/connector-manifest`):** Standard discovery manifest for **ChatGPT Actions**, **Claude MCP Connectors**, and **Gemini Extensions** backed by `/api/mcp` and `/api/ai/mcp-sandbox`.
3. **Real-World Messaging Bots (`Omnichannel Door`):** Verified WhatsApp (`/api/doors/omnichannel/whatsapp`) and Telegram (`/api/doors/omnichannel/telegram`) webhook ingress governed by the same 4-Sphere Companion safety and Sacred Privacy Veto.
