---
title: "Multi-Channel Identity, Consent, and Delegation Contract"
status: "active"
created: 2026-10-14
updated: 2026-10-14
author: "Naveen"
scribe: "Codex"
tags: [architecture, identity, channels, whatsapp, telegram, agents, consent, security]
---

# Multi-Channel Identity, Consent, and Delegation Contract

## Purpose

People may enter Gurudevi through email, SMS, WhatsApp, Telegram, the web app, the mobile app, or a future assistant acting on their behalf. These are entry channels, not separate accounts and not interchangeable proofs of authority.

The Sanctuary API remains the canonical authority. Each channel translates its own message, callback, deep link, or mobile action into the same account, identity, consent, capability, idempotency, audit, and policy path. Explore may describe this catalogue and provide safe local practice; it must not create a live account or exercise a protected mutation anonymously.

## Canonical model

The model has one durable internal account/subject and many explicitly linked identities:

```text
Account/Subject
  ├─ Auth identity: Supabase user, phone OTP, email, passkey, OAuth
  ├─ Channel identity: WhatsApp sender, Telegram user/chat, mobile installation
  ├─ Membership/bond: school, family, classroom, community role
  ├─ Consent grants: purpose, scope, actor, expiry, revocation
  └─ Delegations: human-approved agent acting for a bounded purpose
```

Proposed records (names are conceptual until schema work is approved):

| Record | Required meaning | Security rule |
| --- | --- | --- |
| `account` | Canonical Gurudevi subject | Stable internal ID; never use a phone/chat identifier as the primary key |
| `auth_identity` | Proof-bearing login identity | Provider, subject, assurance, verified-at, revoked-at; unique provider+subject |
| `channel_identity` | Addressable transport identity | Channel, opaque provider ID, normalized metadata, status, last-seen; never sufficient for Sanctuary authorization alone |
| `membership` | School/family/classroom/community relationship | Server-derived scope and role; never trusted from message text or client headers |
| `consent_grant` | Human permission for a purpose | Principal, delegate/channel, purpose, capabilities, resource scope, issued/expiry/revoked timestamps |
| `delegation` | Agent may act for a human | Human subject, agent identity, allowed operations, resource limits, expiry, revocation and audit link |
| `entry_attempt` | Onboarding/invite/recovery ceremony | Single-use nonce, channel, destination account if known, expiry, attempt count, consumed/revoked state |

The physical database design must reuse existing identity, account, bond, and audit ownership rather than creating a parallel channel database.

## Entry and lifecycle flows

### Direct WhatsApp or Telegram onboarding

1. The user starts from a signed deep link, an official bot entry point, or an existing authenticated account action.
2. The adapter verifies the provider webhook signature and replay/timestamp envelope. A message sender is a channel identity, not an authenticated Sanctuary subject.
3. The API creates a short-lived `entry_attempt` bound to the provider channel identity and requested onboarding purpose.
4. The API may create a pending channel-proved subject with only low-risk, non-sensitive capabilities (for example, explanation, catalogue browsing, or an uncommitted draft). This preserves low-friction entry without treating a chat message as full authentication.
5. Step-up proof—phone OTP, email link, mobile deep-link confirmation, or an already-authenticated Sanctuary session—upgrades the pending subject to a full canonical account or proposes linking to an existing account. Linking requires an authenticated session or a one-time confirmation ceremony bound to both identities.
6. The API records the resulting identity link and consent; the bot receives only the capabilities appropriate to that channel, assurance level, and purpose.

### Existing-account linking

Linking is an explicit authenticated action. A channel may be pending, verified, linked, suspended, or revoked. A phone number or chat ID discovered in a message must never merge accounts automatically. Conflicts produce a safe “already linked / continue in Sanctuary” result rather than account enumeration.

### Authentication, authorization, and consent

- **Authentication:** who/what presented a verifiable proof (Supabase session, OTP, webhook signature, device credential, or agent credential).
- **Authorization:** what the authenticated principal may do for a resource under current membership/policy.
- **Consent:** whether the human intentionally allowed a channel or delegate to perform a stated purpose within a bounded scope and time.

Authentication does not imply consent. Consent does not bypass authorization. A signed bot webhook proves provider origin, not that the sender may read a school, family, or classroom record.

### Human versus delegated agent

An agent request must carry a verifiable agent identity plus a human delegation reference. The server evaluates:

```text
effective authority = human membership/policy
                     ∩ delegation capabilities/resource scope/expiry
                     ∩ channel capability
                     ∩ operation safety class
```

AI may draft or propose by default. External effects, sensitive reads, account linking, invitations, and irreversible actions require explicit human confirmation unless a separately reviewed delegation grants that exact operation. Prompt text, tool names, MCP metadata, or a claimed “system role” are never authority.

## Security invariants

1. One canonical account/subject; no account per channel.
2. Channel identifiers are opaque and provider-scoped; do not expose them as public account IDs.
3. Provider webhook signatures, timestamps, nonce/idempotency keys, and bounded body sizes are verified before domain work.
4. Invite/deep-link tokens are random, single-use, short-lived, purpose-bound, and stored hashed where feasible. Consumed, expired, or mismatched tokens cannot be replayed.
5. Linking never reveals whether another identifier belongs to an account; use generic responses and authenticated confirmation.
6. Every inbound message, callback, agent request, and confirmation gets a correlation ID and an operation/idempotency key.
7. Message delivery is not database commit. Provider retries and unknown outcomes must be safe and queryable.
8. Revocation is checked at settlement, not only when a delegation or consent is issued.
9. Explore never receives real account subject data, live channel credentials, or a protected mutation path.
10. A channel adapter cannot write around the Sanctuary API or invent a second policy engine.

## Contract sketch

Channel adapters should converge on transport-neutral commands rather than domain-specific bot handlers:

```ts
type ChannelEnvelope = {
  channel: 'web' | 'mobile' | 'whatsapp' | 'telegram' | 'agent';
  providerMessageId?: string;
  channelIdentityRef: string;
  receivedAt: string;
  replayKey: string;
  proof: {
    kind: 'session' | 'webhook_signature' | 'otp' | 'agent_credential';
    assertionRef: string;
  };
};

type CapabilityRequest = {
  capability: string;
  input: unknown;
  consentRef?: string;
  delegationRef?: string;
  idempotencyKey: string;
  confirmation?: { humanConfirmedAt: string; confirmationRef: string };
};
```

`assertionRef` is a provider-verified, short-lived reference or internal verification result—not a raw token, signature, OTP, or secret. Raw proof material stays inside the channel adapter and is never placed in logs, generic envelopes, analytics, or downstream domain calls. The real implementation must use existing contract/converter/error types, strict schemas, canonical safe errors, and server-side capability bootstrap. This sketch is not permission to introduce an untyped generic gateway.

## Explore versus Sanctuary

| Surface | Allowed | Forbidden |
| --- | --- | --- |
| Explore catalogue | Declared capabilities, examples, local practice, fictional/local identities | Live account lookup, real channel linking, protected writes, real webhook credentials |
| Sanctuary web/mobile | Authenticated onboarding, linking, consent, live capabilities | Trusting client-selected role/school/channel as authority |
| WhatsApp/Telegram | Signed inbound envelope, onboarding ceremony, bounded approved capabilities | Treating a chat message as full authentication or unrestricted account access |
| Agent/MCP/workflow | Discover declared capabilities and submit bounded proposals | Prompt-based privilege, hidden side effects, bypassing human confirmation/delegation |

## Sequenced implementation

1. **Current foundation:** keep the shared auth/API seam, exact capability catalogue, account-scoped authorization, structured errors, idempotency and audit as the only domain path.
2. **Channel registry:** add reviewed contracts and storage for `channel_identity`, `entry_attempt`, consent and delegation; first ship read-only inspection and revocation.
3. **WhatsApp onboarding pilot:** signed webhook ingress, replay protection, one-time linking ceremony, SMS/email/Sanctuary confirmation, and a single low-risk capability.
4. **Telegram onboarding pilot:** reuse the same channel adapter contract and lifecycle; do not fork identity or policy logic.
5. **Agent/MCP projection:** expose discovery and proposal tools first; add confirmation and delegation only after audit/revocation evidence exists.
6. **Scale and offline:** add provider queues, receipts, repair/reconciliation and device/offline envelopes only for named capabilities with F3–F5 evidence.

No channel should be promoted merely because a message was delivered or a demo interaction worked. Promotion requires proof of identity binding, authorization, consent, replay resistance, failure semantics, revocation, and operator recovery for that capability.
