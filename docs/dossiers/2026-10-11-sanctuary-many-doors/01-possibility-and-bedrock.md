---
title: "Possibility First: Future Sanctuary and Present Bedrock"
status: "draft"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [vision, evidence, horizons, sanctuary, bedrock]
---

# Possibility First: Future Sanctuary and Present Bedrock

## Dream without prematurely selecting an implementation

A teacher speaks after a lesson. Gurudevi turns a rough thought into a correctable draft and leaves the teacher free to meet the next learner. A parent asks about tomorrow using the channel already open on their phone. A student carries a learning space between school, home, a shared device, and a future personal assistant. A principal sees what requires action without monitoring private reflection. A school continues through a disrupted connection. A community can leave a vendor without losing its memory.

The opportunity is wider than administrative automation: personal agency, institutional memory, accessible knowledge, multilingual expression, and continuity across changing devices and decades. The Sanctuary can become a useful substrate for educational life while the actual learning relationship remains human.

### Future horizons: possibility rather than forecasts

| Horizon from this exploration | Expansive possibility | What would make it valuable |
| --- | --- | --- |
| 0–1 year | Familiar channels and native/web work share a few reliable actions; learning and reflection continue without AI | A person completes useful work with fewer interruptions and understandable status |
| 1–3 years | A personal companion drafts and coordinates across roles; voice, accessibility, and language become ordinary affordances | Consent survives role changes; translation preserves meaning; assistance removes actual work |
| 3–5 years | Schools can use managed regional cells or local hubs; agents interoperate with school tools and personal calendars | Operators can maintain nodes; data boundaries and recovery responsibilities are explicit |
| 5–10 years | A portable educational commons connects independent institutions, assistants, resources, and civic knowledge | Interoperability and exit work without coercive central control or surveillance |
| Beyond 10 years | Interfaces become ambient, wearable, conversational, or as-yet unknown; individuals retain a coherent personal learning context | People retain control, privacy, representation, and the ability to act without the interface |

Possible experiments include an accessibility companion that translates a teacher's intended action into a familiar gesture; an offline library distribution cooperative; a parent-selected multilingual notice channel; a school hub that serves cached materials during a regional interruption; and a personal agent that prepares a weekly plan across institutions. None requires making all records globally replicated.

### Future paths kept open

**Managed shared Sanctuary:** easiest adoption for institutions without operators; depends on central stewardship and a credible continuity plan.

**Regional institutional cells:** groups of schools share bounded operations; can limit incident scope but introduce routing, migrations, and cross-cell identity work.

**School-operated hub:** local cache or carefully bounded command authority; potentially useful for repeated long outages, but needs power, maintenance, key custody, and reconciliation expertise.

**Personal/local agency:** personal drafts, selected downloads, portable receipts, local computation, and later personal agents. This can mature independently of institutional federation.

**Federated commons:** independent institutions exchange permissioned documents and resource references. Begin with portable exports and explicit imports; explore online federation only when actual collaboration requires it.

**Alternative future:** an institution may need a quiet library and family notice bridge rather than a complete ERP. Success includes a smaller role for Gurudevi when that serves the people better.

## Work backward: invariant bedrock

The bedrock is the meaning of actions and records: who acts, for whom, in which role, with which scope, what changes, how it is confirmed, and how the person recovers. A particular cloud, protocol, model, or GUI is a replaceable expression of that bedrock.

Distinguish four authorities: identity establishes an actor; policy decides permitted action; domain rules decide a valid change; durable storage records its result. They may share deployment today without becoming one unlimited abstraction. Private Self records must not become school authority merely because the user has a school role.

## Repository evidence ledger

Paths below are relative to the repository root and are linked to inspected source.

| ID | Observed substrate | Implication and boundary |
| --- | --- | --- |
| E01 | [Capability manifest](../../../packages/core/src/logic/registry/capabilityManifest.ts) defines four domains, platforms, access/practice policies, and operations | Reuse its vocabulary; declarations explicitly are not authorization decisions and are not a general command engine |
| E02 | [Mobile Workspace resolver](../../../apps/gurudevi-mobile/src/lib/workspace/routeResolution.ts) resolves guardian/principal/student/staff destinations and loading/error/denial states | Role-shaped navigation exists; UI routing alone cannot authorize a server write |
| E03 | [Web authorized entry](../../../apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts) verifies claims and requests authoritative identity from API | Useful security seam; this entry path depends on live service availability |
| E04 | [API application](../../../apps/sanctuary-api/src/core/app.ts) mounts ORPC, read-filtered OpenAPI, AI, durable agents, and WhatsApp; checks production JWT/rate-limit configuration | Significant transport groundwork; actual configuration, availability, and policy coverage remain to verify |
| E05 | [Workspace outbox](../../../packages/core/src/logic/workspace/outbox.ts), [receipt mapping](../../../packages/core/src/lib/sync/receipts.ts), and [sync handler](../../../apps/sanctuary-api/src/core/handlers/sync.ts) model IDs, revisions, conflicts, and receipts | Specific reusable mechanisms; no proof that all domains/channels have equivalent settlement |
| E06 | [Durable-agent routes](../../../apps/sanctuary-api/src/core/routes/durableAgents.ts) persist scoped runs/events, enforce teacher promotion for live drafts, and send to Inngest | Good building blocks; separate persistence/send steps create an inferred handoff failure window; replay returns before re-dispatch |
| E07 | [WhatsApp webhook](../../../apps/sanctuary-api/src/core/routes/whatsappWebhook.ts) is mounted, acknowledges quickly, checks HMAC only if configured, and deduplicates in memory | Prototype trust/durability boundary; acknowledgement precedes durable acceptance |
| E08 | Same webhook parses a fixed sample transcript for every audio input and replies that confirmation succeeded without writing a lesson | Source-observed capability fiction; inappropriate for real protected workflow claims |
| E09 | [Voice parser](../../../packages/core/src/logic/omnichannel/voiceExoskeletonParser.ts) has real-provider calls and heuristic defaults, including attendance counts and fixed confidence | Unknown fields can appear as facts; raw JSON casting lacks demonstrated runtime domain validation |
| E10 | [WhatsApp client](../../../packages/core/src/logic/omnichannel/whatsappClient.ts) sends text/buttons/templates and fetches media; default Graph version is v21.0 | Adapter foundation; timeout/retry/receipt lifecycle and current provider-version support require verification |
| E11 | [School query bot](../../../packages/core/src/logic/omnichannel/schoolGroundTruthBot.ts) accepts a DB port but defaults to seeded school examples | No demonstrated complete live atlas integration; modeled diagnostics need provenance and uncertainty |
| E12 | [Platform MCP](../../../packages/platform-mcp/src/index.ts) serves stdio engineering tools and proxies downstream tools; boot includes skill-file writes | Developer control plane; not a safely exposed end-user product endpoint |
| E13 | [Mobile AI hook](../../../packages/ai/src/hooks/useAIAgent.ts) uses API chat and calls `/api/ai/action`; [AI routes](../../../apps/sanctuary-api/src/ai/routes.ts) expose chat | No action handler found in inspected AI routes; calls need explicit route/contract evidence |
| E14 | [Next.js assistant](../../../apps/gurudevi-web/app/(sanctuary)/agent-lab/assistant/AIAssistantFloor.tsx) generates canned replies with a timer | Dedicated web assistant is a simulation; mobile and web AI maturity differ |
| E15 | [LAN bearer](../../../packages/core/src/logic/mesh/transports/LanMdnsBearerTransport.ts) and [Nostr bearer](../../../packages/core/src/logic/mesh/transports/NostrDtnBearerTransport.ts) track state/counts without socket or relay publication in broadcast methods | Mesh source presence does not establish actual network transport or throughput |
| E16 | [Mesh encryption](../../../packages/core/src/logic/mesh/crypto/MeshEncryptionEnvelope.ts) derives AES key by hashing input; header signature is a plain hash; [mesh engine](../../../packages/core/src/logic/mesh/LocalMeshSyncEngine.ts) routes mutation objects | Encryption does not establish sender identity; school-ID-as-secret is unsafe; engine trust boundary needs separate review |
| E17 | Targeted search of core/API/client source found communication preferences and auth SMS config but no Telegram bot or product MCP/App Intents integration | Treat these doors as future options; absence claim is scoped to the inspected terrain |

## Precision research and source boundaries

Research proceeded from broad conflict/authorization patterns to active-version evidence. Local package metadata: PowerSync common 2.3.1, MCP server 2.3.1, Inngest 4.22.0. The local connector declaration requires backend upload implementation and distinguishes unavailable credentials from signed-out state. The installed Inngest changelog was inspected; no new orchestration API is prescribed here.

The [MCP SDK v2.3.1 release](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/v2.3.1) and [2026-07-28 authorization specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) anchor current authorization research. Resource-bound tokens, validated discovery, and restricted scopes require implementation; adopting the SDK does not automatically provide them. Earlier [security guidance](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices) remains supporting material for confused-deputy and token-passthrough threats.

Local Supabase config selects PostgreSQL 17. [PostgreSQL 17 serialization retry guidance](https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html) supports whole-transaction retry when required. Production version is unknown. [PowerSync conflict documentation](https://docs.powersync.com/handling-writes/handling-update-conflicts) assigns backend conflict handling and idempotency to the application. Neither substitutes for domain-specific reconciliation.

[Inngest retry guidance](https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors) is supporting context for durable execution, not proof that events reach the runner. [Meta pricing](https://whatsappbusiness.com/products/platform-pricing/) establishes a delivered-message/category/market model; exact Sri Lankan rates and exemptions must be rechecked for procurement. No monetary quotation is inferred here.

Unresolved: current support horizon of the code's Graph v21.0 and Gemini model default; production Postgres version; provider account capability/policy; telco package treatment of deep links/media/API features. These are explicit launch checks, not reasons to abandon the future vision.

## Integration round R0: dream to questions

Retain every future path as an option. Select the first experiment based on participant value and testability, not architectural elegance. The first decisive question is whether one real workflow can save effort while producing an inspectable, recoverable, authorized result. Carry forward three constraints: no invented facts, no misleading success, and no mandatory advanced interface for essential work.
