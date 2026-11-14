---
title: "Business Rules, Ownership and Deferred API Decisions"
status: "active"
created: 2026-10-30
updated: 2026-10-30
author: "Naveen"
scribe: "Codex"
tags: [domains, rules, decisions, pjc, authority]
---

# Business Rules, Ownership and Deferred API Decisions

Owns the method for eliciting and recording rules, not a newly invented school,
finance or wellbeing policy. Governing product/ownership decisions remain in the
[canonical model](../api-domain-and-channel-model.md), the
[product covenant](../../../../../docs/Core/gurudevi-soul-and-core-covenant.md),
actual policies and the owning PJC records.

## Separate the questions

| Question | Where its answer belongs |
| --- | --- |
| What does the person intend, and what outcome/feedback do they need? | PJC intent, journey, transitions and scenarios |
| Which module owns a fact and its correction rules? | Domain ownership record and capability contract |
| What may be requested/returned, including errors? | Native source contract and Zod DTOs |
| Who may act in this relationship and scope? | Product rule plus executable Cedar/application enforcement |
| What must remain valid in stored data? | Schema, constraints, transaction and data policies |
| What happens after lost replies, duplicate inputs or provider failures? | Operation/receipt/effect state model and scenario evidence |
| Which external channel may offer the capability? | Channel admission, consent/delegation and approved tool catalog |

One person can see the same authoritative fact through different places and
channels. Avoid duplicating its write implementation. A useful read projection
can combine records from multiple owners while preserving their access rules.

## Write one rule as a reviewable record

Use the existing PJC requirement/scenario/binding structure rather than a second
home-grown issue system. The minimal record answers:

```text
Actor and situation:
Intent and outcome:
Rule and provenance: user / source / proposal / verified
Owning capability and authoritative records:
Prerequisites, authority and scope:
Permitted action and forbidden alternatives:
Feedback, failure, retry and correction:
Linked scenario(s), source binding(s) and actual evidence:
Unresolved decision and owner, if any:
```

Expanded technical bindings point to the real schema, API, identity, Cedar,
tenancy, state, failure, privacy and architecture authorities. Do not paste copies
of those authorities into every record. Stable PJC IDs survive title/file moves;
Git versions the records and explanations. Keep roadmap and issue references as
links. [PJC operating guide](../../../../../docs/architecture/product-journey-catalog.md)

## Existing owner-supplied invariants

- ERP + LMS + social + wellbeing + AI describes product breadth, not API namespaces.
- Keep a modular monolith; navigation, business ownership and channels are distinct.
- First-party commands/queries target native oRPC v2 at `/api/v1`; no old aliases or alternate first-party transports.
- A principal operates institutionally/commercially; do not invent a personal principal workspace.
- Client role/scope selection or model output cannot establish institutional authority.
- The current API reset is an empty foundation. Old routes and client consumers do not count as rebuilt capabilities.
- Current work is research/documentation; no package installation or feature implementation follows automatically from a proposal.

These rules do not answer every institutional, commercial, guardian, consent or
finance question. Source and data discovery still precede each implementation.

## Deferred product decisions

IDs already recorded in the canonical model remain authoritative; this table
adds questions to prepare, not duplicate status tracking.

| Decision reference | Concrete question to bring to the owner | While unresolved |
| --- | --- | --- |
| DEC-CHANNEL-001 | Which bot reads/actions ship, in private chats versus groups, with which linking/consent/approval? | No implied bot domain execution or broad group visibility |
| DEC-MCP-001 | Which user MCP tools are exposed, to which delegated clients, and which actions require review? | No blanket router export |
| DEC-WEBMCP-001 | Which browser journeys benefit from page tools, and what is the normal-browser fallback? | Ordinary UI remains the product path |
| DEC-DOMAIN-001 | Which tasks/notes/rewards are person-owned versus institution-assigned, and who may see them? | No broader visibility inferred from role or navigation |
| DEC-DOMAIN-002 | Which institution/commercial/workforce/finance distinctions are real product rules? | No universal model or invented financial authority |
| New question: external interoperability | Which LMS/ERP/content systems and standards are actual requirements? | Research candidates only; no certification or adapter commitment |
| New question: consequential AI work | Which proposals require a person to approve the exact payload, with what expiry and correction? | No autonomous grant of consequential authority |

The owner's recollection of the Anthropic announcement and intended Hermes project
remain optional clarifications. They do not block building this knowledge reference.
When asking questions, present one real situation, alternatives, consequences and
a recommendation. Do not ask the owner to memorize every protocol or framework.

## Decisions engineering can prepare independently

Source/caller inventory, dependency/peer audits, contract composition, trust-boundary
maps, proposed ownership, typed errors, negative test design and evidence collection
are engineering work. They do not require inventing permissive product rules.
Unknown authority should block the affected action, not unrelated research.

For a proposed domain boundary, inspect authoritative facts, language, lifecycle,
transactional invariants, correction rights, privacy and dependencies. A screen,
table, actor role, harness or package name alone does not define a domain.
Do not force the entire taxonomy before implementing a clear bounded capability.

## Evidence and disagreement

If a user rule, schema, handler or document disagrees, record the conflict and the
affected scenarios. User intent determines product decisions; observed code is
evidence of existing behavior, not automatic endorsement. A dependency API's actual
installed declaration governs available methods, not an old tutorial or skill.

Preserve historical evidence with its original revision and substitutions. A
retired source binding may remain historical and show as missing; it must not be
represented as the current implementation. Discovered links and a structurally
valid PJC record are not proof that the rule is enforced.
