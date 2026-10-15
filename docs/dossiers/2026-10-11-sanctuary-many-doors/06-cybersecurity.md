---
title: "Cybersecurity: Bounded Trust Across Doors and Agents"
status: "draft"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [security, threat-model, delegation, privacy, channels]
---

# Cybersecurity: Bounded Trust Across Doors and Agents

## Possibility

People delegate narrow tasks to trusted assistants without surrendering accounts. Schools share selected records without sharing entire databases. Privacy follows the person across interfaces, and a compromised adapter can be revoked without invalidating educational memory. Strong boundaries enable more doors; they do not have to make every interaction cumbersome.

## Assets, actors, boundaries

Protect identity/bonds, learner and family records, private Self data, grades/attendance, fees, provider credentials, proposal/receipt integrity, exports, backups, and operational administration. Potential adversaries include outsiders, compromised accounts/devices, dishonest insiders, malicious documents, compromised agents, and a tenant accidentally misconfigured as another tenant. Accidents and coercion also cause harm without a sophisticated attacker.

Boundaries are device↔local store, channel↔ingress, linked external identifier↔Gurudevi actor, actor↔scope, agent↔delegation, domain↔database, server↔provider, institutional↔personal records, and operator↔administrative plane. A green authorization middleware does not prove coverage of all these boundaries.

## Priority threat scenarios

| Threat | Concrete route | Proposed control and proof |
| --- | --- | --- |
| Spoofed webhook | Secret absent makes E07 skip HMAC | Fail closed on production ingress; real invalid/absent signature cases |
| Replayed confirmation | Generic button applies to ambiguous/stale draft | Actor + proposal version + scope + effect hash + expiry binding; replay test |
| Wrong account/child | Recycled number or shared phone treated as durable identity | Verified linking, unlink/recovery, minimal initial disclosure; family-role scenario |
| Revoked teacher | Offline draft replays after departure | Current server reauthorization at commit; keep draft, reject institutional effect |
| Prompt injection | Document/audio tells agent to export learner data | Treat content as data; allowlisted actions/scopes; policy at each effect, not model discretion |
| Cross-tenant data | Client passes another school/classroom identifier | Authoritative relationship resolution and query isolation; positive/negative real-DB proof |
| Agent escalation | Tool list includes developer maintenance or raw database tools | Separate product exposure from engineering gateway; per-client grants and constrained responses |
| Media/URL abuse | Oversized audio or attacker-directed network fetch | Size/time/content limits; controlled provider media resolution; redirect/egress policy |
| Private-data leakage | Journal appears in school summary/log/model prompt | Domain privacy boundaries, output filtering, redaction, retention and tracing tests |
| Cost exhaustion | Repeated audio/extraction/template sending | Per-actor/tenant budgets, quotas and bounded retries; telemetry without content logging |
| Operator compromise | Shared admin credentials or exposed backup/key | Separate duties, recoverable key custody, access audit and incident drill |
| Malicious peer | Mesh forwards raw mutation objects from unauthenticated peer | Signed scoped envelope, membership/key lifecycle, replay limits and server validation |

## Current code concerns and their limits

E07–E09 require scrutiny before live protected work: optional signature enforcement, predictable verification-token fallback, nondurable duplicate tracking, synthetic voice input, invented fallback facts, and absent confirmation persistence. These are observed source properties. The exact production exploitability is unknown because configuration and deployment were not tested.

E16 derives an AES key from supplied text, with a comment permitting a school ID. A public identifier has no secret entropy; hashing it does not create a secret. A plain SHA-256 header hash is not a sender signature. AES-GCM protects encrypted content under its key but cannot by itself establish which teacher had authority. Key distribution, rotation, authenticated metadata, membership revocation, and malicious-peer handling require a design and proof. This dossier does not assert a complete exploit or the absence of additional defenses elsewhere.

E12 exposes engineering tools including maintenance and downstream infrastructure access. The product agent must never inherit the operator's environment credentials by becoming a client of that gateway. Product capability tools need a separate exposure boundary, even if they reuse shared contracts. Boot-time filesystem synchronization is another reason this runtime cannot be casually embedded in a user server.

## Delegation and future assistants

An assistant grant should identify user, client, permitted action, resources, expiry, disclosure limits, and whether it may commit or only draft. School membership is not blanket delegation. Revalidate important effects and revoke grants independently of the person's account. Log actor, delegating person, tool, policy version, and receipt without retaining unnecessary private content.

Current [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) requires resource-bound token validation for protected HTTP use. SDK installation alone is not authorization. Supporting [MCP security guidance](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices) identifies confused-deputy and token-passthrough hazards. Design exact consent and token audiences before product MCP exposure; no universal forwarding of arbitrary assistant tokens.

Device-assistant availability, supported invocation, and user/device authentication differ by platform. Later integration needs official version-specific research and a device experiment. A voice utterance is an intent, not proof of actor identity or school authority.

## Privacy after failures

Offline access trades continuity against revocation speed. Define what may remain cached, for how long, and how logout/device change destroys or isolates account data. A stolen offline device cannot be remotely revoked instantly without connectivity. Critical writes can be blocked pending revalidation while private drafts continue. Own that compromise openly.

Do not put full learner details in lock-screen previews, ordinary QR codes, analytics, or error traces. Opaque QR references should expire and require authorization where needed. Paper has custody and disclosure risks too. Deletion policies must include provider copies, local caches, backups, and lawful retention; promise only what can be performed and evidenced.

## Integration round R5

Carry forward channel linking and proposal-bound authorization as prerequisites for protected effects. Scope restrictions must apply equally to UI and agents. Finance must fund credential recovery/security maintenance; database review must preserve receipt/privacy semantics; product must keep high-risk exports, payments, grades, and welfare out of the initial assistant scope. Independent security review remains a later launch gate, not a completed claim.
