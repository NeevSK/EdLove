---
title: "Senior Engineering: Contracts, Handoffs, and Maintainable Delivery"
status: "draft"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [engineering, commands, durability, verification]
---

# Senior Engineering: Contracts, Handoffs, and Maintainable Delivery

## Possibility

A new interface can adopt an existing action contract, preserve identity and recovery semantics, and spend its complexity on the person's experience. Teams can add useful capabilities without rebuilding authorization, retry, or confirmation for every channel. Future frameworks can change without changing what a lesson record means.

## Present reality

Existing contracts, capability manifest, receipts, mutation queue, and agent ledger are useful but uneven. E05 concerns workspace layout; it cannot be assumed to cover attendance, grades, family notices, or invoices. E13 shows client action calls without a handler found in the inspected AI routes. E08 and E14 show simulations presented through credible interfaces.

The first engineering deliverable is a capability inventory by action, platform, persistence, permission, and evidence. A route directory or impressive page does not establish the action's lifecycle. Extend existing registries deliberately; do not create a parallel all-purpose “omnichannel framework.”

## Smallest reusable contract

For the chosen action, define input schema and version, actor and current scope, operation identity, effect class, expected revision if relevant, proposal identity, confirmation semantics, cancellation, result schema, receipt lookup, and error categories. Domain modules own business validation. Core owns transport-neutral identity/policy/receipt contracts. Apps own native/browser presentation and integrations.

Use a finite action list. Natural language suggests an action and fields; deterministic code validates them. A proposed lesson's missing classroom, date, subject, or counts stays unknown until clarified. A model confidence number is not validation. Voice extraction must not default unknown attendance to plausible-looking counts.

### Lifecycle and effect boundaries

| Stage | Durable meaning | Failure behavior |
| --- | --- | --- |
| Local draft | Saved on one device/store | Recover after restart if that store is intact; export option |
| Accepted request | Inbox/operation committed | Replay yields same operation or a mismatch error |
| Awaiting review | Proposal version and expiry committed | Old confirmation cannot authorize a revised proposal |
| Committed | Domain record and receipt settled | Response loss leads to receipt lookup, not a new operation |
| Notification pending | Delivery intent committed | Provider failure retries independently |
| Delivery unknown | Provider might have accepted before timeout | Reconcile where supported; do not promise exactly one delivery |
| Conflict/denied | Current rules reject requested effect | Preserve draft and offer a lawful recovery route |

Cancellation before commit and correction after commit are different operations. A lesson-note correction can create a revision. A sent notice cannot be made unread by changing a database flag. Make compensating actions explicit.

## Concrete handoff weakness

E06 persists a durable-agent run, then a requested event, then calls Inngest separately. Inferred crash window: run persists, process fails before dispatch, client retries with the same key, replay returns the existing run without sending the event. No repair dispatcher was found in the inspected agents directory. A durable runner cannot repair work it never received.

Proposed remedy to investigate: commit accepted operation and dispatch intent atomically, have a dispatcher claim/retry work, and reconcile old queued runs. Reuse an existing outbox if its storage/ownership contracts fit. Do not introduce a second overlapping queue without mapping the current mutation and agent queues first.

E07 acknowledges WhatsApp before durable persistence and marks duplicates before processing. A processing error can therefore be ignored on later delivery in the same process. Durable acceptance must precede success acknowledgement. Invalid signatures and malformed payloads must be rejected; accepted valid messages must be recoverable after restart. This is a source-based inference, not a live webhook failure reproduction.

## Maintainability and evolution

Separate runtime-only credential/media/model code from platform-neutral domain contracts; the current voice parser's environment access and `Buffer` use deserve boundary review. Preserve app/package import boundaries. Pin behavior through action schemas and version compatibility, not framework-specific agent messages.

Do not upgrade unrelated dependencies as a side effect. Validate exact installed declarations before using new APIs. Introduce one bounded workflow with meaningful failure scenarios, then share its contract across clients. Remove simulation claims through explicit product correction, preserving working examples under truthful demo semantics rather than silently deleting routes.

## Verification that would change the conclusion

Test duplicate confirmations, wrong proposal version, concurrent edits, wrong account, expired delegation, process termination after acceptance, response loss after commit, restart while offline, and provider timeout after acceptance. Use real database transactions for race/commit assertions, browser runtime for web, and physical device proof for local restart/recovery. Current test files and previous mock results do not supply this dossier's runtime evidence.

## Integration round R2

R1 becomes actionable through one domain action and complete lifecycle. Adopt operation identity and receipts, not a giant generic executor. Retain human control without making every click a ceremonial approval. Carry the state model into UX; let database review decide transaction/locking details and cybersecurity decide linking/revalidation. Ship no “saved” message without evidence of the named durable effect.
