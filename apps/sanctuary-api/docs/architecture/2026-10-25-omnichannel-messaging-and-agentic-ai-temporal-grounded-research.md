---
title: "Omnichannel Messaging & Agentic AI: Temporal-Grounded Architectural Research Report"
status: "active"
created: 2026-10-25
updated: 2026-10-25
author: "Naveen"
scribe: "Antigravity"
tags: [whatsapp, telegram, grammy, agentic-ai, mcp, inngest, llm, architecture, research]
---

# Omnichannel Messaging & Agentic AI Integration Patterns
**Research Date:** October 25, 2026

---

## 1. WhatsApp Business Platform (Cloud API v21.0 / v22.0)

### 1.1 Ingress Architecture & HMAC Verification
Meta uses a two-step webhook:
1. `GET /webhook`: Verification challenge handshake (`hub.challenge` returned if `hub.verify_token` matches).
2. `POST /webhook`: Message delivery validated against `X-Hub-Signature-256`.

> [!CAUTION]
> **Raw ArrayBuffer Requirement:** Always read `c.req.arrayBuffer()` before any JSON parsing. Re-serializing JSON alters whitespace and key sequence, causing HMAC-SHA256 signature checks to fail randomly. Verify using `crypto.timingSafeEqual()`.

### 1.2 2026 Pricing & 24h Customer Service Window
- Flat conversation fees are retired. Meta enforces per-message billing by category (Marketing, Utility, Authentication, Service).
- First 1,000 Service conversations per month per phone number are free.
- Outbound messages outside the 24h customer window (anchored to the latest inbound message timestamp) **must** use pre-approved Meta message templates.

---

## 2. Telegram Bot API (via grammY)

- **Library Standard:** `grammy` is the undisputed TypeScript standard in 2026. Telegraf is legacy.
- **Hono Adapter:** Built-in via `webhookCallback(bot, "hono", { secretToken: "..." })`.
- **Durable Conversations:** Use `@grammyjs/conversations` with a Redis or PostgreSQL storage adapter so multi-turn conversations survive container redeploys.

---

## 3. Agentic AI & Model Context Protocol (MCP)

### 3.1 AI SDK v4+ Streaming with Hono SSE
```typescript
import { Hono } from 'hono';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const app = new Hono();

app.post('/api/chat/stream', async (c) => {
  const { messages } = await c.req.json();
  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are an educational assistant.',
    messages,
    maxSteps: 10, // Multi-tool loop
  });
  return result.toDataStreamResponse();
});
```

### 3.2 oRPC Procedures as AI Tools
With `@orpc/contract` enforcing Zod schemas, procedures map directly into AI tools:
```typescript
import { tool } from 'ai';
import { orpcClient } from './orpc-client';
import { gradeInputSchema } from '@repo/core/api/classroom.contract';

const gradeTool = tool({
  description: 'Submit an academic grade for a student.',
  inputSchema: gradeInputSchema,
  execute: async (input) => orpcClient.classroom.submitGrade(input),
});
```

### 3.3 Model Context Protocol (MCP) on Hono
Using `@modelcontextprotocol/hono` and `@orpc/mcp` (new in oRPC v2 beta.45), the API mounts an authenticated `/api/mcp` endpoint exposing procedures as standard MCP tools for Claude Desktop and agentic orchestrators.

### 3.4 Multi-Agent Workflows via Inngest
Use `inngest/hono` for multi-step agent pipelines requiring durable retries, step checkpointing, and independent task recovery across server redeploys.
