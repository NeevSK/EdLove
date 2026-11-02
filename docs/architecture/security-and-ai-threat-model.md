---
title: "Security and AI Threat Model"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [architecture, security, threat-model, ai, agents, minors, owasp, reference]
---

# Security and AI Threat Model

Gurudevi holds children's records, wellbeing data and institutional authority, and it
lets AI agents act for people. Security is a design input for every module, not a
review at the end. This document names the principles, what we protect, the threats,
and the controls each layer owns.

Earlier focused records: [deep linking threat model](2026-10-08-sovereign-deep-linking-and-threat-model.md),
[Sanctuary API adversarial audit](2026-08-29-sanctuary-api-adversarial-security-audit.md).

## Principles

- **Secure by default.** Every module starts denying everything; features open access
  deliberately.
- **Zero trust.** No request is trusted for where it comes from: not our own app, not a
  worker, not an agent. Every call is authenticated and authorized.
- **Least privilege.** Every person, agent, worker, operator and service account gets
  only what it needs, for only as long as it needs it.
- **Defence in depth.** Cedar, then data scoping, then database row-level security,
  then audit. One layer failing is not a breach.
- **Assume breach.** Limit what one stolen session, key or device can reach, detect it,
  and be able to revoke it.

## What we protect

| Asset | Why it matters |
| --- | --- |
| Children's records and identity | Harm to minors; legal duty |
| Wellbeing, journals, AI memory | The most private data people give us |
| Grades, attendance, fees | Disputes, fraud, institutional trust |
| Institutional authority (notices, enrolment) | Impersonating a school or principal |
| Accounts and sessions | Everything else follows from them |
| Secrets and keys | Infrastructure takeover |
| Audit trail | Without it, nothing can be proven |

## Threats by layer (STRIDE)

STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service,
Elevation of privilege.

| Layer | Main threats | Controls |
| --- | --- | --- |
| Channels | Spoofed bot messages, forged webhooks, session theft | Signed webhooks, channel identity, short-lived sessions, device trust |
| Identity | Account takeover, credential stuffing, weak recovery for children | Rate limits on sign-in, passkeys, guardian-mediated recovery, session revocation |
| Authority | Elevation through a stale bond, cross-school access, confused deputy | Bond checks per request, Cedar default deny, scoped data, re-check inside transactions |
| Durable operations | Replay, duplicate effects, tampering in transit | Idempotency keys with payload fingerprints, TLS, server-side validation |
| Audit | Repudiation, silent tampering | Append-only chained audit, audited audit reads |
| Records | Unrecoverable deletion, over-retention | Soft delete windows, legal hold, retention jobs |
| Files | Malware uploads, public links leaking | Content-type checks, scanning, access through authority only, no unauthenticated links for private files |
| Runtime | Morning-burst exhaustion, abuse by one tenant | Budgets per person and institution, back-pressure, timeouts |
| Substrate | SQL injection, mis-set row-level security, backup theft | Typed queries (Kysely), RLS tests, encrypted backups with expiry |
| Supply chain | Malicious or compromised packages | Lockfile, pinned versions, provenance and SBOM (existing release workflow), minimal dependencies |
| Secrets | Keys in code, logs or chat | Doppler only; rotate any key that appeared in a chat or file |

## AI and agents

Two OWASP lists are the reference:
[Top 10 for LLM Applications 2025](https://genai.owasp.org/2024/11/17/owasp-reveals-updated-2025-top-10-risks-for-llms-announces-new-llm-project-sponsorship-program-and-inaugural-sponsors/)
(prompt injection, sensitive information disclosure, supply chain, data and model
poisoning, improper output handling, excessive agency, system prompt leakage, vector and
embedding weaknesses, misinformation, unbounded consumption), and
[Top 10 for Agentic Applications for 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026)
(published December 2025; it includes agent goal hijack, tool misuse and rogue agents,
and covers identity, memory, inter-agent communication and cascading failures). Read the
official lists before designing an agent capability.

Rules for Gurudevi:

- **Content is never instructions.** A message, document, web page or another agent's
  output can't widen what an agent may do. Authority comes only from delegation and
  Cedar.
- **Tools are capabilities.** An agent calls the same commands as the app, through the
  same authority. There are no agent-only back doors.
- **Excessive agency is designed out.** Delegations are narrow and time-limited. Risky
  actions need human approval per action.
- **Outputs are checked like input.** Model output that becomes a command, a query, a
  notice or HTML is validated and escaped first.
- **Memory is person-owned data.** It can be poisoned, so it is inspectable,
  correctable and deletable by the person; agents can't write another person's memory.
- **Minors get stricter defaults**: guardian-visible AI settings, no open-ended agents
  acting for a child, content filters on what reaches them.
- **Costs are bounded**: per person, per institution and per agent, so one runaway loop
  can't exhaust the budget (unbounded consumption).
- **Everything an agent does is audited** with the delegator and the delegation.

## Detection and response

- Alerts on unusual patterns: mass reads of minors' records, many denials from one
  account, an agent hitting its limits.
- Revocation that works in seconds: sessions, devices, delegations, keys.
- A written incident procedure: who decides, how affected people and institutions are
  told, and the legal notice duty (see [data governance, law](data-governance-and-records.md#11-law)).
- Restore drills: a backup is real only after it has been restored.

## Ready for what isn't here yet

New channels, new agent protocols and new models will arrive. They enter as channel
adapters through the same authority, audit and budgets, so the core doesn't change when
they do. A new protocol never gets permissions by being discovered; it gets them by an
admitted delegation.
