---
title: "Phase 2 & Phase 3 Cutover: Resilient AI Streaming and Omnichannel Ingress"
status: "active"
created: 2026-10-28
author: "Naveen"
scribe: "Antigravity"
tags: [ai, streaming, sse, ndjson, abort-signal, render, anti-buffering, gemini, whatsapp, telegram, omnichannel]
---

# Phase 2 & Phase 3 Cutover: Resilient AI Streaming & Omnichannel Ingress

## Executive Summary
This document codifies the operational resolution and production hardening executed across **Phase 2 (Resilient AI Streaming & Provider Overhaul)** and **Phase 3 (Omnichannel Ingress - WhatsApp First, Telegram Second)** in `apps/sanctuary-api`.

---

## 1. Phase 2: AI Provider & Streaming Architecture Overhaul

### 1.1 The Anti-Buffering Reverse-Proxy Standard
Under free-tier edge deployments on Render, intermediate Nginx and Cloudflare proxies buffer chunked HTTP streams by default until either an internal buffer fills (typically 4KB) or the connection terminates. This destroyed real-time token-by-token generation.

We enforced the following zero-compromise HTTP headers across `/api/ai/chat`:
- `X-Accel-Buffering: no`: Informs upstream Nginx/Render proxies to disable chunk buffering and stream every token immediately.
- `Content-Type: application/x-ndjson; charset=utf-8`: Explicit MIME specification matching TanStack AI and standard JSON streaming clients.
- `Cache-Control: no-cache, no-transform`: Prevents intermediate CDNs or proxies from compressing, transforming, or coalescing chunk payloads.
- `Connection: keep-alive`: Maintains long-lived TCP connection for smooth SSE/NDJSON chunks.

### 1.2 Upstream AbortSignal Propagation & Resource Guardianship
- **The Problem:** In previous iterations, `c.req.raw.signal` was dropped at the HTTP boundary. When a client disconnected, cancelled a prompt, or navigated away, the upstream LLM API call continued generating tokens in the background, consuming CPU time on Render and exhausting model quota.
- **The Resolution:**
  - `LlmPort.streamChat` signature was upgraded with `abortSignal?: AbortSignal`.
  - All 10 adapters (`VercelGeminiAdapter`, `VercelOpenAiAdapter`, `VercelAnthropicAdapter`, `VercelDeepSeekAdapter`, `VercelOpenRouterAdapter`, and corresponding TanStack adapters) accept and propagate `abortSignal`.
  - In Vercel AI SDK adapters, `streamText({ ..., abortSignal })` directly instructs upstream LLM providers (Google Gemini, OpenAI, Anthropic) to cancel inference immediately upon client disconnection.
  - `toHttpResponse` receives an `abortController` linked to `c.req.raw.signal` via an event listener, terminating response readable streams instantly.

### 1.3 Provider & Model Selection Matrix (`DbBillingAdapter`)
- **Baseline Tier Realignment:**
  - Prioritized Google Gemini (`gemini-2.5-flash`) as the default free-tier friendly platform engine whenever `GEMINI_API_KEY` is present.
  - Eliminated the silent crash bug where an absent `OPENAI_API_KEY` caused baseline mode to return an empty API key and crash despite `GEMINI_API_KEY` being configured.
  - Modernized model fallback hierarchy:
    1. Google Gemini: `gemini-2.5-flash`
    2. OpenAI: `gpt-4o-mini`
    3. OpenRouter: `openrouter/auto`
    4. DeepSeek: `deepseek-chat`
    5. Anthropic: `claude-3-5-haiku-20241022`
- **BYOK Key Heuristic Upgrades:**
  - `AIzaSy...` prefix maps to `gemini-2.5-flash`.
  - `sk-ant-...` maps to `claude-3-5-haiku-20241022`.
  - `sk-...` maps to `gpt-4o-mini`.

---

## 2. Phase 3: Omnichannel Webhook Ingress (WhatsApp First, Telegram Second)

### 2.1 Meta WhatsApp Business Ingress
- **Canonical & Versioned Endpoints:** Mounted on both `/webhooks/whatsapp` and `/webhooks/whatsapp-v2`.
- **HMAC-SHA256 Verification:** Constant-time verification using `crypto.timingSafeEqual()` against `X-Hub-Signature-256` and `WHATSAPP_APP_SECRET`.
- **Latency Guarantee:** Ingress requests are persisted to `public.channel_ingress_events` and acknowledged with `HTTP 200 { status: 'accepted' }` in under 80ms to avoid Meta retry cascades.
- **Privacy Assurance:** Message body text and phone numbers are never stored raw in ingress event rows; sender is cryptographically hashed with `WHATSAPP_IDENTITY_HASH_SECRET` into `external_subject_key`.
- **One-Time Account Ceremonies:** Messages matching `/link <token>` trigger `confirmProviderChannelLink` to bind the channel identity to canonical `public.users.id`.

### 2.2 Telegram Bot Ingress
- **Endpoints:** Mounted on `/webhooks/telegram` and `/webhooks/telegram-v2`.
- **Header Secret Validation:** Validates `X-Telegram-Bot-Api-Secret-Token` in constant time against `TELEGRAM_WEBHOOK_SECRET`.
- **Group vs. Private Distinction:** Preserves boundary context (`private`, `group`, `channel`) in `endpointKind`.

---

## 3. Empirical Verification Record

| Test Suite | Scope | Tests | Result |
| :--- | :--- | :--- | :--- |
| `ai-streaming-resilience.test.ts` | Anti-buffering headers, AbortSignal propagation | 2 | ✅ PASSED (20ms) |
| `billing-adapter.test.ts` | Gemini-first baseline, BYOK model detection, failover | 4 | ✅ PASSED (9ms) |
| `ai-sdk-switching.test.ts` | TanStack vs Vercel dynamic switching | 5 | ✅ PASSED (22ms) |
| `ai-stream.probe.test.ts` | NDJSON serialization and token accounting | 1 | ✅ PASSED (111ms) |
| `verifiedWhatsappIngress.test.ts` | HMAC check, canonical alias, 413 guard, privacy | 7 | ✅ PASSED (78ms) |
| `verifiedTelegramIngress.test.ts` | Secret token check, canonical alias, actor extraction | 7 | ✅ PASSED (83ms) |
| **Total** | Full Phase 2 & 3 Gate | **26** | **✅ 100% PASS** |
