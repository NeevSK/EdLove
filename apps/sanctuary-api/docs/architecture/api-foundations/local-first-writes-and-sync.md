---
title: "Local-First Writes and Sync"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [api, local-first, offline, sync, powersync, idempotency]
---

# Local-First Writes and Sync

How a write travels from a phone with no signal to an authoritative record, and what the
API must guarantee for that to be safe. Client-side rules for state and storage are in
the [client state canon](../../../../../docs/architecture/client-state-and-web-offline-capability-canon.md)
and the [offline resilience SOP](../../../../../docs/architecture/offline-state-resilience-sop.md).

## The path

```text
person acts → local SQLite (PowerSync) → write queue on the device
            → when online: command to /api/v1 with an idempotency key
            → server: authority, validation, invariants, commit, audit, outbox
            → sync streams the authoritative result back to every device
```

The phone shows the person's change at once, marked pending until the server accepts or
rejects it.

## What the server guarantees

- **Idempotent commands.** The same key and payload return the same outcome; the same
  key with a different payload is a conflict. Covered by the operation store.
- **Late writes are judged by current authority.** A command queued while the teacher's
  bond was active but delivered after it ended is denied, and the device is told why.
- **Two times are kept.** The time the person acted on the device (recorded) and the
  server commit time (authoritative for ordering).
- **Rejections are specific.** A rejected queued write returns a typed reason the app can
  show and act on (fix and resend, discard, ask someone).
- **Sync never bypasses the API's rules.** Sync rules decide what each device may
  *receive*; writes still go through commands. If a write path goes through sync
  uploads, it must call the same command logic and authority.

## Conflicts

Each subdomain card says how its facts handle concurrent changes:

| Strategy | Use for |
| --- | --- |
| Commands that can't conflict (append) | Journal entries, posts, submissions, ledger entries |
| Last writer wins, per field | Low-stakes editable fields (display preferences) |
| Version check: reject if changed since read | Versioned records (notes, lesson materials) |
| Correction only | Grades, attendance, money: concurrent corrections are both kept and reviewed |

## What each device receives

Sync scopes follow authority: a device gets the facts its account may read through its
bonds, and nothing about other people beyond that. When a bond ends, the next sync
removes the institution's facts that the person may no longer see from the device. The
person's own data stays.

## Several accounts on one device

Each account has its own local database and write queue. Switching accounts never sends
one account's queued writes as another. This is already implemented on mobile
(account switch preserves offline work); the server checks it again, because the
session decides the account, not the queue.

## Open decisions

- Which writes go through v1 commands directly and which (if any) through sync uploads.
- How long a device may stay offline before queued writes need re-confirmation.
