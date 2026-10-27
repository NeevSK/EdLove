---
title: "Guest Data Transfer Policy Authority"
status: "active"
created: 2026-10-24
updated: 2026-10-25
decision_owner: "Gurudevi product and Sanctuary architecture"
tags: [guest, identity, privacy, classroom, sanctuary, data-transfer]
---

# Guest Data Transfer Policy Authority

## Decision

This is the canonical cross-platform authority for **guest feature-record
transfer eligibility and its server contract**. It applies the accepted
[Guest Local-First Lease](../decisions/2026-09-10-guest-local-first-lease.md),
the active [safe exploration model](safe-exploration-and-reversible-work-model.md),
and the [cross-channel conversion contract](2026-10-23-cross-channel-identity-and-guest-conversion-contract.md).

**No guest feature record is currently authorized for remote transfer.**
The product may offer only **Keep on device** or separately confirmed
**Discard**. This is an intentional policy, not an implementation gap that a
client-side bulk uploader may fill.

The approved local Guest lease is fifteen days. Older documents that describe
a 7- or 14-day duration are historical planning material and do not override
the accepted lease decision.

## Identity boundary

- A `local-<uuid-v4>` is device storage identity only. It has no cloud
  authority and is never submitted as an account or EdLove identifier.
- New credentials link to the existing anonymous Supabase subject. Signing
  into a different existing account is a data-only ceremony requiring an
  explicit, recoverable choice; it is never an account merge.
- A durable Supabase account is necessary but not sufficient for data
  transfer. The server must resolve and authorize the selected target.
- Canonical UUIDv8 issuance is database-owned account creation, including
  cloud-backed anonymous accounts; it does not imply durable credentials,
  onboarding completion or transfer eligibility. A device-local guest has no
  canonical cloud account. Guest conversion never chooses or mints the account ID.

## Record policy register

| Local record kind | Current policy | Decision required before enablement |
| --- | --- | --- |
| Timetable | Retain locally; remote transfer disabled. | Canonical server resource, accountable owner, and explicit skip, append, deduplicate, review, or conflict-resolution behavior. |
| Mood and journal | Retain locally; remote transfer disabled. | Privacy and retention basis, canonical destination, consent copy, and duplicate/conflict rule. Mood and journal are independently evaluated records, not one generic payload. |
| Students | Retain locally; remote transfer disabled. | Person-selected target classroom plus verified server authorization and canonical roster semantics. A local student record must never infer classroom membership. |

The older `GuestDataSync` batch implementation is not a policy source and
must remain fail-closed. Its client-built operations cannot establish the
target resource, classroom authority, per-record privacy treatment, or a
durable migration receipt.

The mobile implementation represents this register with
`GuestDataTransferPolicy` (`packages/core/src/native/guestDataTransferPolicy.ts`).
It is deliberately configurable by record kind, but no configuration value can
enable transport: even a kind marked `awaiting-server-contract` remains
fail-closed until Sanctuary supplies the reviewed command and receipt contract.

## Conditions for a future, bounded transfer

The product owner and Sanctuary owner must approve the missing decision for
one record kind at a time. Each approved kind requires all of the following
before its client feature flag or transport is enabled:

1. A versioned eligible-record manifest with stable local source IDs and an
   explicit target chosen by the person where a target is needed.
2. A normal server-authorized command that validates the durable target,
   resource scope, and every record; the client never chooses authorization.
3. A stable conversion/operation key, payload hash, per-record idempotency,
   auditable state, and a durable server receipt.
4. Source-write freeze for the manifest during submission; timeout, 503,
   replay, process death, and partial completion retain the local source.
5. Removal only after the receipt confirms the whole approved manifest. An
   unknown or ambiguous outcome is recoverable and remains local.
6. Feature-specific existing-account handling. No default append, replace,
   merge, or deduplication rule is implied by another feature's decision.

Unsupported records remain device-local through the lease and are never
silently mapped into institutional, shared, or wellbeing data.

## Authority and historical materials

This document supersedes only historical claims that Guest data sync is
seamless, complete, or automatically preserves all history. It does not
delete those documents or legacy code; they remain historical implementation
records.

The authority ladder is deliberately narrow: the Guest Local-First Lease ADR
controls lease duration; the cross-channel contract controls account and
channel identity; the mobile lifecycle controls app entry; and this document
controls whether a feature record may leave the device. A conflict about
record-transfer eligibility resolves to this document; a conflict about the
other subjects resolves to its named authority.

The implementation ledger is [Mobile Guest-to-Durable-Account Conversion:
Completion Plan](../current_progress/2026-10-23-mobile-guest-conversion-completion-plan.md).
It records evidence and delivery status; it cannot authorize transfer on its
own.
