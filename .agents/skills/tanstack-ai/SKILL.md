---
name: tanstack-ai
description: "Master director for TanStack AI SDK. Use when implementing chat(), tool calling, structured outputs, streaming SSE, AG-UI protocol, or client persistence with @tanstack/ai."
---

# TanStack AI Master Director

Hierarchical entry point for type-safe TanStack AI implementation across server and client runtimes.

## Progressive Disclosure Router

All deep specifications are quarantined in `vendor/tanstack-ai-core/` to preserve context budget. Consult on-demand:

| Task Intent | Target Specification | Key Invariants & Rules |
| :--- | :--- | :--- |
| **Streaming Chat UI** | [`../vendor/tanstack-ai-core/chat-experience/SKILL.md`](../vendor/tanstack-ai-core/chat-experience/SKILL.md) | Use `chat()` not `streamText()`; import from `@tanstack/ai-react` |
| **Tool Calling (Client/Server)** | [`../vendor/tanstack-ai-core/tool-calling/SKILL.md`](../vendor/tanstack-ai-core/tool-calling/SKILL.md) | Type-safe schemas with Zod, multi-step tool execution |
| **Structured Outputs** | [`../vendor/tanstack-ai-core/structured-outputs/SKILL.md`](../vendor/tanstack-ai-core/structured-outputs/SKILL.md) | JSON schema enforcement and object generation |
| **AG-UI Protocol Integration** | [`../vendor/tanstack-ai-core/ag-ui-protocol/SKILL.md`](../vendor/tanstack-ai-core/ag-ui-protocol/SKILL.md) | Server-sent event adapters, streaming JSON patches |
| **Client Persistence** | [`../vendor/tanstack-ai-core/client-persistence/SKILL.md`](../vendor/tanstack-ai-core/client-persistence/SKILL.md) | Surviving browser reloads and offline state caching |
| **Middleware & Concurrency** | [`../vendor/tanstack-ai-core/middleware/SKILL.md`](../vendor/tanstack-ai-core/middleware/SKILL.md) | Request lifecycle hooks, lock mechanisms |
| **Provider Adapters** | [`../vendor/tanstack-ai-core/adapter-configuration/SKILL.md`](../vendor/tanstack-ai-core/adapter-configuration/SKILL.md) | Configuring Gemini, OpenAI, Anthropic adapters via `openaiText()` |

## Golden Rules
1. Use `chat()` not legacy `streamText()`.
2. Use `openaiText()` not `createOpenAI()`.
3. Use `toServerSentEventsResponse()` not manual SSE string building.

