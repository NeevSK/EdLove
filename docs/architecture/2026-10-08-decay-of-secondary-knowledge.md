---
title: "The Decay of Secondary Knowledge: Why Static Indexes and Web Search Fail at the Frontier"
status: "active"
date: "2026-10-08"
author: "Naveen & Antigravity"
tags: [architecture, epistemology, search, cache-invalidation, frontier-engineering]
---

# The Decay of Secondary Knowledge: Why Static Indexes and Web Search Fail at the Frontier

## 1. The Core Dilemma: The Halflife of Truth at the Frontier

Software engineering at the bleeding edge (Expo SDK 58, React Native 0.88, React 19.3, Effect v4) moves faster than any index can update. When an AI agent attempts to operate at this frontier, it encounters three layers of secondary knowledge—and **all three decay exponentially**:

```
                       ┌───────────────────────────────────────────────┐
                       │             1. PRETRAINED WEIGHTS             │
                       │   Static cutoff (months to years old)         │
                       │   Blind to breaking changes & new libraries   │
                       └───────────────────────┬───────────────────────┘
                                               ▼
                       ┌───────────────────────────────────────────────┐
                       │          2. OPEN WEB SEARCH (GOOGLE/BING)     │
                       │   Optimized for PageRank, SEO, and backlinks  │
                       │   Surfaces 9-month-old dead betas over 2d code│
                       └───────────────────────┬───────────────────────┘
                                               ▼
                       ┌───────────────────────────────────────────────┐
                       │         3. SPECIALIZED DOCS RAG (CONTEXT7)    │
                       │   Managed vector/crawler embeddings           │
                       │   Crawler lags behind active release tags     │
                       └───────────────────────────────────────────────┘
```

---

## 2. Empirical Case Study: The `@expo/agent-cli` Breakdown

On 2026-10-08, our team conducted an empirical test comparing how each secondary knowledge store handled the newly released agent-native CLI for Expo SDK 58:

| Information Store | What It Returned | Why It Failed / Rotted |
| :--- | :--- | :--- |
| **Model Pretraining** | *"Expo Agent does not exist."* | Knowledge cutoff predates the package. |
| **Google / Web Search** | *"Expo Agent is in closed beta at `agent.expo.dev`."* | PageRank indexed historical articles from 6–9 months ago; failed to detect that the web agent was wound down. |
| **Context7 Documentation RAG** | *Resolved `/expo/expo` with max version `sdk-56`; returned random third-party CLIs for `@expo/agent-cli`.* | Context7's crawler operates on a multi-month cadence and capped Expo at SDK 56. |
| **NPM Package Registry (`npm view`)** | **`@expo/agent-cli@1.0.18`**, published 2 days ago, complete binary entrypoint (`bin: expo-agent-cli`), and full README. | **Zero indexing lag.** The registry is an immutable, real-time append-only transaction ledger. |

---

## 3. The Root Cause: Mistaking Ephemeral State for Durable Policy

The failure mode is philosophical:
* **State** belongs in the codebase, package manifests, and registry APIs (`package.json`, `pnpm-lock.yaml`, `npm view`).
* **Invariants (Policy)** belong in prompt guardrails (`AGENTS.md`).

When developers or agents write:
> *"We are on Expo SDK 58 and using `@expo/agent-cli`."*
into a prompt or markdown file, they are **creating an ephemeral cache**. The moment Expo SDK 59 releases, that documentation rots and becomes the source of the next hallucination.

### The Rule of Invariant Isolation
1. **Never hardcode mutable framework versions as policy.**
2. **Never treat web search summaries as ground truth.**
3. **Never assume third-party RAG services are real-time.**
