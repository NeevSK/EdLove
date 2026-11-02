---
title: "Channels, Agent Protocols and Execution Frameworks"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Codex"
tags: [agents, mcp, ag-ui, webhooks, messaging, research]
---

# Channels, Agent Protocols and Execution Frameworks

Owns the integration landscape. These are researched options, not a list of
installed or approved Gurudevi capabilities. [What](../api-landscape.md) explains
the learning order; [How](../api-engineering-playbook.md) owns implementation gates.
Refer to the [short glossary](vocabulary-and-history.md#terms-we-should-use-precisely)
for policy, delegation, outbox and operation terms.

## Anthropic: several separate building blocks

| Building block | Meaning | Source/date |
| --- | --- | --- |
| Agent Skills | Portable instructions and supporting resources | [Introduced October 16, 2025; open-standard update December 18, 2025](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) |
| Skills governance donation | Donation to the Agentic AI Foundation; plausible match to the owner's recollection | [October 22, 2026](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation) |
| MCP | Tool/resource integration protocol | [Original announcement November 25, 2024](https://www.anthropic.com/news/model-context-protocol) |
| Claude Agent SDK | Programmable agent execution machinery derived from Claude Code | [Overview](https://code.claude.com/docs/en/agent-sdk/overview) |
| Browser/computer-use toolsets | Model-mediated interaction with a supplied browser/computer driver | [Current beta documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-sdk) |

An open standard, open-source implementation, source-available example and
hosted service have different licensing and operating implications. Inspect the
specific package/release/license rather than assuming every repository asset has
one permission model. Installing a skill does not prove compliance with it or
grant the agent domain authority.

## Protocols are not interchangeable

| Name | Boundary | What remains our responsibility |
| --- | --- | --- |
| Native oRPC | Typed application caller to command/query implementation | Actual business rules, identity and policy enforcement |
| MCP (Model Context Protocol) | Agent/assistant to exposed tools and resources | Approved catalog, delegation, data minimization and action controls |
| Browser WebMCP | Browser agent to page-exposed actions | Session boundaries and server authorization |
| AG-UI (Agent–User Interaction) | Agent backend to user-facing application interactions/events | State ownership, approved actions and truthful UI feedback |
| A2A (Agent-to-Agent) | Cooperation between independently hosted agents | Trust, audience, delegation, tenant isolation and task budgets |
| A2UI | Declarative UI descriptions | Allowed rendering components and action validation |
| Skills | Procedural knowledge loaded by an agent | Review, provenance, trust and executable enforcement |

[AG-UI](https://docs.ag-ui.com/introduction) standardizes agent/application events;
[A2A](https://a2a-protocol.org/latest/) concerns agent cooperation. They do not
authorize changes to records. [MCP security guidance](https://modelcontextprotocol.io/specification/latest/basic/security_best_practices)
and [WebMCP security guidance](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
must be applied alongside our own capability policies.

User-facing MCP is distinct from `@repo/platform-mcp`, our developer control
plane. Browser WebMCP is also distinct from a remote MCP endpoint opened in a
browser. Do not expose the complete API router merely because an SDK can
register it automatically. Tool discovery is not permission to execute.

## Frameworks and harnesses

| Project | Role | Evaluation question for Gurudevi |
| --- | --- | --- |
| [TanStack AI](https://tanstack.com/blog/ag-ui-compliance) | Model/tool and application integration; documented AG-UI support | Can the existing package cohort satisfy the named interaction without another harness? |
| [LangChain](https://docs.langchain.com/oss/javascript/langchain/overview) | Configurable model/tool agent harness | Which missing capability justifies another abstraction and its operational burden? |
| [LangGraph](https://docs.langchain.com/oss/javascript/langgraph/overview) | Low-level stateful agent orchestration | Does this workflow need its checkpoint/interrupt semantics, and where are side effects settled? |
| [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) | Hosted-by-us agent loop with Claude Code capabilities | Is this a bounded task requiring that runtime and permission model? |
| [Nous Hermes Agent](https://github.com/NousResearch/hermes-agent) | Agent harness/runtime | Can it operate as an isolated, narrowly delegated consumer rather than own product authority? |
| [OpenClaw](https://docs.openclaw.ai/start/why-openclaw) | Personal-assistant/gateway runtime with channels and tools | Does its trust/operating model fit this deployment and tenant boundary? |

Hermes Agent is unrelated to the [Hermes JavaScript engine](https://reactnative.dev/docs/hermes)
used by React Native. The pairing with OpenClaw makes Hermes Agent a plausible
interpretation of the owner's wording; the intended project is not confirmed.
No new harness is selected by this document.

LangGraph checkpoints, a UI state machine, and a database transaction solve
different problems. A persisted agent graph does not prove that a payment or
attendance change is idempotent. A harness's memory does not establish an
authorized source of educational truth. Keep app FlowDAG/XState state, agent
execution state, client cache, durable receipts and provider delivery state distinct.

OpenClaw's own guidance documents default execution/sandbox trust assumptions;
review the selected release and deployment configuration rather than treating a
personal-assistant runtime as a ready-made multi-tenant school backend. Popularity,
stars or the presence of a SECURITY.md are not evidence of isolation.
[Project security policy](https://github.com/openclaw/openclaw/blob/main/SECURITY.md)

## Telegram, WhatsApp and other provider channels

An inbound webhook needs a provider-specific verifier, minimal durable envelope,
event deduplication and a verified account-linking process. Only then may a
supported intent be resolved into a bounded capability under current authority.
Transport acknowledgement, command commit and message delivery are separate outcomes.

Telegram documents `setWebhook`, secret-token verification and update delivery;
its exact transport controls differ from Meta's provider verification.
[Telegram Bot API](https://core.telegram.org/bots/api#setwebhook)
Use the [WhatsApp developer hub](https://whatsappbusiness.com/developers/developer-hub/)
and selected product/version's webhook documentation. Detailed Meta webhook
pages returned access/rate-limit errors in this research session; exact current
signatures, retry windows, templates and delivery rules require renewed primary
verification before implementation. Do not substitute Telegram assumptions.

```text
Provider message
  -> verify provider request and event identity
  -> persist bounded ingress and deduplicate
  -> resolve verified person/channel binding
  -> check supported intent, consent, delegation and current scope
  -> invoke owned application capability
  -> record command outcome
  -> dispatch permitted reply and track provider delivery separately
```

Unlinked or ambiguous identities need a linking/recovery journey; they must not
be guessed from a phone number, display name, model output or role label.
Private chats, group chats and institutional broadcasts require separate audience
decisions. Neither the bot nor the provider is the owner of school records.

## AI-specific failure scenarios to design

Retrieved content may contain hostile instructions; treat it as data. Tool input
needs ordinary schema and authority validation even when model-generated.
Keep credentials out of prompts; enforce token audience, delegated scope, expiry,
tenant boundaries and approval binding in trusted code. Approval of one proposal
must not become permission for a changed payload or subsequent arbitrary calls.

Budget tokens, tool calls, money, time, recursion and concurrent work. Distinguish
model completion from committed domain work. Record safe progress events; do not
stream confidential reasoning or raw learner content into logs or public tools.
Use deterministic scenario tests and adversarial agent evaluations; a model judge
alone cannot verify database invariants or authorization.

## Current source and intended future

The API reset retired the old bots, workers, AI and MCP runtime sources. Shared
app-intent declarations and AI UI packages elsewhere still exist; they are not
proof of a running backend. `packages/ai/package.json` declares TanStack AI
packages, which makes that ecosystem existing terrain to investigate before
adding LangChain, OpenClaw or another runtime. No provider/harness integration
has been rebuilt in the empty foundation.
