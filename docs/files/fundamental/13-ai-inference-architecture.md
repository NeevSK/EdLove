# AI Inference Architecture

New domain, not covered by any of the twelve preceding docs. Covers what's actually built (`apps/sanctuary-api/src/ai`) and what "keeping the door open" for future on-device/local inference genuinely requires — both the small, cheap interface changes worth making now, and the larger, correctly-deferred infrastructure this doc does not recommend building yet.

## What's real and already built

A genuine, multi-provider cloud inference layer, using the same ports/adapters pattern confirmed sound elsewhere in this codebase (attendance projection, storage): `LlmPort` (the abstraction), four concrete adapters (`AnthropicAdapter`, `OpenAiAdapter`, `GeminiAdapter`, `DeepSeekAdapter`), a real `Orchestrator` that resolves billing and selects a provider per request, a `BillingPort`, and rate-limiting middleware.

**Billing is genuinely sophisticated, not a stub:** `billingMode: 'baseline' | 'byok' | 'purchased'` — platform-provided baseline usage, Bring-Your-Own-Key (user supplies their own provider API key), and purchased credits. This connects directly to `pricing_tier` (confirmed live via the PayHere webhook in `11-community-domain-audit.md`).

## The current design does not actually keep the door open for local inference — two small, specific, fixable gaps

**1. `LlmPort.streamChat` requires `apiKey: string` as a mandatory parameter on every call.** A local, on-device model has no remote endpoint and no key — there's no API being called, only local computation. As written, any future local adapter would be forced to accept and ignore a meaningless parameter, which is itself a sign the interface was designed only around the remote-API shape, not genuinely abstracted over "how does this adapter get set up to answer a request."

**2. The provider selector type is a closed, hardcoded union:** `getLlmAdapter: (provider: 'openai' | 'gemini' | 'anthropic' | 'deepseek') => LlmPort`. Adding `'local'` later means touching this type and every place that switches on it — small, but real, and cheaper to do now (few callers) than later (many).

**The good news, worth stating plainly: `billingMode`'s three-way shape already has natural conceptual room for a fourth, `'local'` mode** — on-device inference is essentially zero-marginal-cost, closer in spirit to BYOK (cost shifted away from the platform) than to baseline or purchased. This part of the architecture doesn't need rework, just extension.

## What "keeping the door open" concretely means — and what it doesn't

**Worth doing now, cheap, low-risk, matches the same "design the interface to not preclude it, without building the thing itself yet" principle used throughout this whole exploration (Redis, partitioning):**
- Make `apiKey` optional on `LlmPort`, or better, replace the flat parameter list with an adapter-specific config object (`RemoteLlmConfig { apiKey, model }` vs. a future `LocalLlmConfig { modelPath, deviceTier }`) — one small refactor, before more callers accumulate against the current shape.
- Extend the provider union type to include `'local'` as a recognized-but-unimplemented option, so the type system itself documents the intention.
- Replace `Promise<any>` return types with a real, shared response type — the same type-safety gap found repeatedly elsewhere in this audit (OCR import's `as any`, the storage adapter's `as any`); worth fixing here too while the interface is still small.

**Correctly, deliberately not built yet, and shouldn't be started now — this is real, substantial infrastructure with its own hard tradeoffs, appropriately deferred until device/model capability justifies it:**
- An actual on-device inference runtime for React Native (realistic options: llama.cpp-style GGUF-format models via a native binding, Apple's Core ML on iOS, Android's NNAPI, or a cross-platform layer like MLC-LLM) — each has real, different integration costs, and none is a small addition.
- A device-capability gate (RAM tier, chip generation) to decide whether local inference is even offered on a given device, with cloud as the fallback — genuinely necessary given your own stated concern about low-end devices, and not something to guess at without real target-device data.
- Model bundling/download-and-cache strategy — a local model is a real, large file (hundreds of MB to several GB depending on the model), which intersects directly with `07-library-media.md`'s device-storage-management questions (sandboxed vs. user-visible storage, preload-vs-on-demand) — worth building on that doc's thinking rather than solving storage strategy twice.

**The honest recommendation:** do the two small interface changes now, while they're nearly free. Do not start building actual local-inference infrastructure until device/model capability genuinely justifies it — exactly the sequencing you described (keep the door open, don't walk through it yet).

## Open Questions / Not Yet Resolved

- `BillingPort`'s actual resolution logic — not read in this pass, only its role in the Orchestrator
- Rate-limiting middleware's specifics — not read
- Whether any client-side (mobile app) code already anticipates a local-inference path (e.g., a capability-detection stub) — not checked
- Real target-device RAM/chip-tier data for the Sri Lankan school market specifically — needed before any device-capability gate could be designed responsibly, not something to estimate from general assumptions
