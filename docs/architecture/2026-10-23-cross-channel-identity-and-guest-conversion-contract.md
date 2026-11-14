---
title: "Cross-Channel Identity and Guest Conversion Contract"
status: "active"
created: 2026-10-23
updated: 2026-10-24
author: "Naveen"
scribe: "Codex"
tags: [identity, auth, guest, omnichannel, whatsapp, telegram, ai-agents]
---

# Cross-Channel Identity and Guest Conversion Contract

## One account authority

Gurudevi and the wider EdLove platform have one durable human-account
authority: the verified Supabase account subject. A device-local guest ID,
external messaging identity, AI-agent run, email address, provider handle, or
EdLove UUID is never a substitute for that canonical account subject.

```text
device-local guest UUIDv4 ───────── guest conversion ────────┐
Supabase anonymous subject ─── credential link ──────────────┼─> durable Supabase subject
WhatsApp/Telegram identity ── explicit channel-link ceremony ┘             │
                                                                         server-only EdLove UUIDv8
```

The arrows do not mean automatic merging. Each is a separately authorized,
auditable ceremony.

## Mobile guest conversion

1. **Entry:** Welcome attempts Supabase anonymous sign-in when online. On
   offline/unavailable failure it creates `local-<uuid-v4>` in device storage.
2. **Exploration:** anonymous and device-local guests use only scoped local
   onboarding, local bonds, and local guest data. They receive no cloud
   membership, PowerSync/Cedar capability, ordinary domain write, or EdLove ID.
3. **New credentials:** a credential is linked to the active anonymous
   Supabase subject. The canonical subject is retained.
4. **Existing account:** sign-in authenticates the existing account first.
   The conversion ledger records the guest source and actual verified target;
   a target different from an anonymous source needs an explicit sign-in
   action. This is data migration, never an identity merge.
5. **Local data choice:** until Sanctuary has a record-level migration
   contract, the person can keep their local guest data or separately confirm
   discard. Remote transfer is deliberately disabled, and no data is cleared
   by a failed or ambiguous request.
6. **Durable identity:** EdLove UUIDv8 assignment is a private Sanctuary/
   database operation after durable-account confirmation. It is not called by
   the mobile guest flow and never accepts a local guest UUID.

## External social and messaging channels

The implemented external-channel surface is **WhatsApp and Telegram ingress**.
It is not social OAuth login and it does not turn a phone/chat identity into a
Gurudevi account.

| Capability | Current state | Identity rule |
| --- | --- | --- |
| WhatsApp ingress | Implemented: Meta signature verification, payload-size limit, replay fingerprint, hashed external subject, durable minimal-envelope acceptance. | No raw phone number or message content is persisted in the ingress envelope; account linkage requires a one-time link ceremony. |
| Telegram ingress | Implemented: configured secret-header verification, payload-size limit, replay fingerprint, hashed actor identity, private/group distinction. | Link commands are accepted only from a verified private chat; group messages cannot link an account. |
| Account linking | Implemented server-side for verified WhatsApp/Telegram identities. | The authenticated account receives a one-time ceremony token; the provider webhook confirms the matching verified external identity. No lookup or auto-merge occurs. |
| Other social networks | Not implemented as identity providers. | A social-profile URL or a community feature is not an authentication or account-linking mechanism. |

Messaging ingress records a verified provider fingerprint and acceptance event;
it does not dispatch a domain command, grant capabilities, or run an agent.
The next required work is dispatch/consent policy, not another provider login.

## WhatsApp-first and Telegram-first journeys

Someone may meet Gurudevi in a messaging channel before they have ever used
the app. That is an **unlinked channel contact**, not a guest account and not
an account-creation event.

```text
Person sends first WhatsApp/Telegram message
  → provider webhook verifies origin
  → Sanctuary stores a minimal hashed channel identity + replay-safe ingress event
  → identity state: verified / unlinked
  → no profile, bond, Supabase account, EdLove ID, agent action, or domain write

Later, the person chooses one of two explicit paths:
  A. already has Gurudevi account
     → authenticate in app/web → choose Connect channel → receive one-time token
     → send token from the same private channel → server confirms link

  B. has no Gurudevi account
     → create/sign into account in app/web first → then follow path A
```

The messaging channel cannot create an anonymous Supabase user on the
person's behalf. Nor may it silently attach to an account because a phone
number, email-like display value, previous message, or device looks familiar.
If the same person later uses offline mobile guest mode, that is a separate
local UUIDv4 principal; it is converted to a durable account through the
mobile ceremony first, and the channel is linked only afterward through its
own confirmation.

The authenticated server API implements link initiation, token confirmation,
linked-identity listing and revocation, plus scoped consent and delegation.
The provider ingress routes implement verification and durable minimal
storage. Search finds no Gurudevi mobile or web presentation/service call
sites for a person-facing **Connect channel**, status, revoke, or
support-recovery experience. Until those interfaces and their operational
recovery policy exist, first-contact channel identities remain unlinked in
the shipped app experience.

## AI agents

Durable classroom agents are implemented as **server-side capabilities**, not
identity providers:

- student-support and teacher-summary routes reject unauthenticated callers;
- their actor is the verified Supabase subject from Sanctuary middleware;
- the server resolves classroom and school scope from authoritative bonds and
  enrollment, never request-body identity fields;
- requests and run events are durable and idempotent; agent output is a draft
  requiring the existing review/promotion flow.

An agent cannot act as a guest, use a device-local UUIDv4 as an account, bind a
WhatsApp/Telegram identity, or cause EdLove assignment. Any future external
agent delegation must use the defined delegation and consent records with a
bounded resource scope.

## Required before enabling guest remote transfer

The current cross-platform policy is [Guest Data Transfer Policy
Authority](2026-10-24-guest-data-transfer-policy.md). It deliberately keeps
all record kinds local until the decisions below are approved and implemented.

For each guest-data kind, the product owner and Sanctuary contract must define
the following; client code must not infer them:

| Guest data | Required decision |
| --- | --- |
| Timetable | canonical server resource, target ownership, and explicit skip, append, deduplicate, review, or conflict-resolution behavior |
| Mood and journal | retention/privacy basis, canonical target resource, duplicate rule |
| Students | explicit target classroom selection plus authorization; never infer membership from a guest record |

The server must validate the verified durable target, chosen resource scope,
per-record authorization and idempotency, then return a durable receipt. Only
then may the client remove the local source payload.

## Evidence

- Verified WhatsApp and Telegram ingress tests establish provider verification,
  minimal hashed envelopes, retryable storage failure, and the private-link
  constraint.
- Durable-agent security tests establish unauthenticated rejection; route code
  establishes server-side scope resolution and durable request/run records.
- Mobile conversion tests establish local UUID isolation, anonymous-source
  continuity, explicit existing-account authorization, and recoverable
  keep/discard behavior. They do not prove a deployed webhook, real provider
  configuration, production Supabase, server guest-transfer policy, or a
  physical-device guest journey.
