---
title: "Omnichannel Sanctuary Foundation: Phased Delivery and Hostile Implementation Plan"
status: "draft"
created: 2026-10-15
updated: 2026-10-15
author: "Naveen"
scribe: "Codex"
tags: [architecture, delivery-plan, omnichannel, whatsapp, telegram, mobile, ai, operations]
---

# Omnichannel Sanctuary Foundation

## Decision in one sentence

Gurudevi will make WhatsApp, Telegram, mobile, web, and delegated AI different
doors into one Sanctuary capability system—not separate products, accounts,
databases, or policy engines.

This document turns that decision into an executable programme. It supplements,
and does not replace, the [multi-channel identity and delegation contract](2026-10-14-multi-channel-identity-and-delegation-contract.md), the [LMS task/workflow seam](2026-10-14-lms-task-workflow-seam.md), and the platform's [horizontal-foundation gate](../decisions/2026-10-13-horizontal-foundation-gate.md).

## Product horizon and pilot boundary

The end state supports text, voice, images, documents, video, official records,
notifications, community announcements, and AI-assisted work over all doors.
The first field proof is deliberately smaller: five schools, up to 500 people,
with staff and teachers as the only people allowed to invoke protected writes.

| Door | Long-term role | Pilot role |
| --- | --- | --- |
| Mobile / web | Full authenticated workspaces, offline drafts, linking, receipts | Account linking, consent, record/receipt recovery, operator controls |
| WhatsApp | Low-friction vernacular operational assistant | Private linked chat, voice-derived drafts, approved receipts and alerts |
| Telegram | Bot, resource/community access, Mini App for rich flows | Private linked bot, callbacks, Mini App linking and safe capability projection |
| External groups | Community coordination and public reach | Approved announcements only; protected responses move to a private linked door |
| AI / agents | Bounded assistant and, later, delegated operator | Draft, translate, classify, transcribe, retrieve, propose; human confirms protected effects |

### Non-negotiable limits

1. A provider sender ID, telephone number, chat ID, prompt, or AI confidence score is not Sanctuary authority.
2. Provider acknowledgement is not a committed record; a domain receipt is not delivery; both must be queryable separately.
3. A failed or unknown external effect is repaired from durable state, never guessed from a chat transcript.
4. Groups do not become a shortcut around identity, consent, moderation, or school scope.
5. No agent can gain a capability merely because it can describe or invoke a tool.
6. No retained media without a declared purpose, owner/scope, lifecycle, and deletion/revocation route.

## Canonical operating model

```text
Provider update / mobile action / web action / agent request
    -> provider verification + bounded envelope
    -> canonical account link, consent, current scope and delegation check
    -> named Sanctuary capability command
    -> atomic domain result + operation receipt + audit + outbox intent
    -> provider dispatcher / media processor / AI worker
    -> delivery receipt, reconciliation and truthful user status
```

The first five stages are synchronous only where their data is local and
transactional. Provider sends, downloads, transcription, virus scanning,
translation, AI calls, and notifications are effects: they must be outboxed,
time-bounded, observable, and repairable.

## Milestone programme

Every milestone is additive. A later milestone may not start protected exposure
until its predecessor's exit gate is evidenced. “Demo works” is never an exit
gate.

### M0 — Admission: make the existing foundation safe to extend

**Outcome:** the channel work has a trustworthy API authority floor rather than
building on known unresolved transport or recovery gaps.

- [ ] Inventory the actual contracts, handler paths, receipt tables, outbox
  callers, media boundaries, and current capability registry to be reused.
- [ ] Reconcile the outstanding F1–F5 items in the horizontal-foundation gate
  that affect channel ingress: canonical account resolution, structured errors,
  account-bound receipt settlement, auth expiry/retry, telemetry redaction, and
  recovery/operator ownership.
- [ ] Declare an exact impact set and migration order before schema work; keep
  existing WhatsApp prototype behavior available only as a test fixture until
  its production replacement is verified.

**Hostile exit gate:** demonstrate that a forged caller cannot select another
account or school, that a replayed command cannot duplicate a record, and that a
crash after acceptance produces a recoverable receipt rather than false success.

### M1 — Shared channel authority and durable ledgers

**Outcome:** provider-specific input can be represented without becoming a
provider-specific authorization system.

- [ ] Add strict, transport-neutral contracts for inbound envelope,
  `ChannelIdentityLink`, entry/link attempt, consent grant, delegation,
  channel endpoint, delivery intent, delivery attempt, and media-processing
  job. Reuse existing account, identity, bond, capability, audit, and operation
  receipt semantics rather than copying them.
- [ ] Add server-owned migrations with uniqueness constraints for provider
  event IDs and replay keys, external identity links, single-use link attempts,
  idempotency/payload binding, and outbox delivery identity.
- [ ] Add lifecycle operations: begin link, prove/confirm link, inspect linked
  doors, revoke/unlink, revoke consent/delegation, query operation receipt, and
  query delivery status. All protected operations derive actor and school scope
  server-side.
- [ ] Implement an explicit capability/channel safety matrix. It classifies
  every command as public-read, linked-read, draft, human-confirmed write,
  delegated write, or forbidden; a missing classification denies execution.

**Hostile exit gate:** competing account-link attempts, expired/reused links,
provider-ID collisions, consent revocation during confirmation, changed-payload
idempotency replay, and account enumeration all fail safely and leave audit
evidence.

### M1 implementation checkpoint — 2026-10-15

The first additive foundation is in the workspace but not yet deployed: shared
strict schemas now model channel identity, consent, delegation, sanitised ingress
envelopes, and delivery intents; a server-owned migration defines their durable
ledgers; and authenticated users can inspect, revoke, and start a hashed,
short-lived link ceremony. The raw ceremony secret is returned only to that
authenticated caller and is not persisted.

This is deliberately not provider binding. Confirming a ceremony still requires
the M2 signed, replay-safe provider ingress path. The legacy WhatsApp prototype
therefore remains outside this authority path and must not be promoted by merely
mounting it.

### FEATURE SPEC: verified provider ingress adapter

**Blast Zone:** AMBER — `apps/sanctuary-api/src/core/routes/`; it consumes the
RED-zone authority contracts and migration without altering them.

**Canonical identity dependency:** `20261015160000_omnichannel_authority_foundation.sql`
must run after `20261015150000_server_owned_auth_identity.sql` (or its approved
successor). The channel tables use only `public.users.id`; provider sender,
chat, phone, and email values remain opaque lookup material and never cause an
automatic account merge. Both migrations remain un-applied pending the database
owner's ordered, real-Postgres acceptance run.

**Authority lifecycle checkpoint:** authenticated canonical accounts can now
grant, list, and revoke channel consent only through their own active linked
identity, and can grant, list, and revoke named delegations. Both grants carry
typed school/resource scope, bounded capabilities, and optional future expiry.
Provider identifiers are never accepted as account identifiers. This remains an
API boundary backed by mocked database evidence; the migration has not been
applied. The later M4 dispatcher checkpoint now consumes these grants through a
fresh server-side authorization recheck immediately before any injected adapter
call; this does not constitute live provider or real-database evidence.

**Target files:** `channelIngress.ts`, a new WhatsApp ingress adapter, and their
bounded tests.

**Reuses:** `ChannelInboundEnvelopeSchema`, `queryDatabaseRows`, the existing
Meta HMAC verifier, and the `channel_ingress_events` ledger.

**Does not:** mount or modify the legacy WhatsApp handler; dispatch replies;
fetch media; create a canonical account; bind a channel identity; invoke a
domain command; or log raw request content, signatures, tokens, or sender IDs.

**Complexity budget:** small single-purpose functions; each under 15 cognitive
complexity. A verified request receives `200` only after an atomic durable
acceptance attempt. A duplicate is acknowledged without repeat work; any
database failure returns `503` for provider retry.

### M2–M4 implementation checkpoint — 2026-10-15

Two additive `/webhooks/*-v2` adapters are mounted. WhatsApp requires Meta
HMAC verification and Telegram requires its configured webhook-secret header;
both cap bodies, persist a provider-event/replay ledger before acknowledging,
and use a per-provider keyed fingerprint instead of retaining a sender ID. The
adapters accept only a strict, private `/link <token>` ceremony command after
ingress verification. It consumes the one-time token hash and links only an
otherwise unlinked, verified channel identity through a non-enumerating atomic
database operation. Telegram groups are recorded as group envelopes but cannot
run that ceremony.

The foundation now also has server-only models for transient/quarantined media
jobs, AI proposals pending human confirmation, and delivery intents. A delivery
intent is always `pending` at creation; neither its creation nor provider ingress
claims delivery, record creation, transcription, or AI authority. The M4
dispatcher now provides a bounded, disabled-by-default authorization and adapter
seam for delivery intents; concrete provider effects, media fetch/scan, model
execution, confirmation settlement, reconciliation, and dead-letter operations
remain later protected increments.

### M3 persistence checkpoint — 2026-10-15

Server workers now have a narrow persistence seam to queue an opaque media job
from an ingress event and to create an opaque AI proposal only after a media job
is `ready` and unexpired. This is intentionally not wired to provider download,
storage, scanning, transcription, OCR, or an LLM: those effects require their
own bounded adapters and operator recovery path. The proposal cannot be treated
as an authoritative command; it remains `pending_confirmation` and no settle
path has been exposed.

The persistence seam also defines the eventual settlement boundary: only the
canonical account that owns a `pending_confirmation` and unexpired proposal may
confirm or reject it, and settlement must match the exact stored payload
fingerprint. An optional channel identity must be active, linked, and match the
proposal's recorded identity before it can participate in confirmation. A
`confirmed_at` timestamp is written only for confirmation; rejection leaves it
unset. This seam has no AI, provider, media, or domain-capability effect and has
not been validated against a real database.

### G2 migration evidence checkpoint — `20261015160000` — 2026-10-15

An isolated PostgreSQL 17.11 pgTAP/TAP::Harness rollback-only fixture recorded
50/50 assertions for the exact `20261015160000_omnichannel_authority_foundation.sql`
migration. Source hashes were verified before execution: migration
`A280DBC4CBDDC3F1F13F6CAC820222AE7C8684BE394B6305FE7384D2DA24A5AC` and fixture
`F92055E2AF1FF317199CFD0D3A04BE61EB2F67271A4B62405D1C79322BF01420`. The fixture
covered all eight channel tables, RLS, client privilege denial,
provider-subject non-merge behavior, provider-event/replay/idempotency
uniqueness, and delivery/media lease-column presence. Independent cleanup
verified zero tables, no pgTAP extension, and zero fixture accounts remained.

This is G2 scenario evidence for the isolated migration fixture only. Lease
column presence does not establish runtime lease semantics. It does not prove
the full migration chain, a deployed database, API/ORM behavior, or media or
provider integration. The migration remains unapplied to the shared or
production database.

### M4 dispatcher checkpoint — 2026-10-15

The delivery outbox now supports a short, bounded lease of one unexpired
`pending` intent, performs a fresh authorization check, resolves an exact-
enabled provider from the registry, and only then invokes the injected
provider adapter. Registry selection reads no credentials and performs no
network action. An adapter is resolvable only when both the global
`CHANNEL_OUTBOUND_ENABLED` flag and the provider-specific flag are exactly
`'true'`; if either is absent or differs, the dispatcher records the
repairable `failed` outcome `OUTBOUND_PROVIDER_DISABLED` and makes no provider
call. A successful adapter call records `accepted`; an adapter exception or a
receipt-persistence failure instead records `unknown`, intentionally excluded
from automatic dispatch so an operator can reconcile a possible external send.
Adapters remain injected seams: no concrete provider implementation, credential
read, live network action, or real-database evidence is claimed by this
checkpoint. Recipient resolution, rate limits, callbacks, repair tooling, and
delivery confirmation remain explicit later work.

### M2 — Provider onboarding and ingress hardening

**Outcome:** official provider traffic reaches the Sanctuary API only through
verified, bounded, observable routes.

- [ ] Provision a dedicated Meta Business portfolio, WABA, pilot number, and
  approved utility templates; provision a Telegram bot, its public identity,
  Mini App configuration, and webhook secret. Use separate development, pilot,
  and production assets.
- [ ] Register public HTTPS/DNS webhook endpoints and configure all credentials
  through Doppler. Write an operator checklist for rotation, compromise,
  provider account loss, and test-account isolation.
- [ ] Replace the current WhatsApp prototype's optional signature/fallback
  token and memory-only deduplication with fail-closed verification, bounded
  body/media intake, persistent event ledger, and fast acknowledgement after
  durable acceptance.
- [ ] Implement Telegram webhook verification using its configured secret-token
  header, persisted `update_id` replay handling, allowed-update allowlist, and
  bounded callback/deep-link payload parsing.
- [ ] Emit only redacted correlation and provider outcome telemetry. Raw tokens,
  signatures, private message bodies, transcripts, and child-related content
  never enter ordinary logs.

**Hostile exit gate:** unsigned, malformed, oversized, replayed, reordered, and
cross-environment updates are rejected; a provider timeout/503 leaves one
durable, repairable ingress state; logs reveal neither secrets nor content.

### M3 — Media, voice, and safe AI proposal pipeline

**Outcome:** every supported media type has truthful processing and retention
semantics before it is used to influence a record or message.

- [ ] Normalize inbound text, audio/voice, image, document/PDF, and video into
  the common media-job contract; provider adapters only fetch/normalize and do
  not interpret domain meaning.
- [ ] Enforce allowlisted MIME types, size/duration limits, authenticated
  provider download, malware scanning, content quarantine, transformation
  limits, and explicit processing timeouts.
- [ ] Apply three retention states: transient processing by default; explicit
  promotion to a retained workspace asset; mandatory retained audit/evidence
  where the authoritative capability requires it. Each state exposes deletion
  and expired/failed-processing status.
- [ ] Route transcription, translation, OCR, classification, retrieval, and
  drafting through durable AI jobs. Their output is a typed proposal with source
  references and confidence/limitations, never a direct protected mutation.
- [ ] Build explicit confirmation views/buttons that bind the user-approved
  normalized payload, capability, account, scope, and expiry to the eventual
  command. “Confirm” must not reuse an earlier unrelated draft.

**Hostile exit gate:** a malicious file, provider media URL swap, unsupported
format, scan outage, model timeout, prompt injection in a document, and a
stale/altered confirmation all yield visible safe states and no unauthorized
commit.

### M4 — Delivery outbox, receipts, and repair operations

**Dispatcher feature spec.** A dispatcher may lease exactly one unexpired `pending` intent, invoke one explicitly injected provider adapter, and record either an `accepted` receipt or `unknown` outcome. A timeout or transport error is `unknown`, never automatically retried, because the external effect may already have occurred. The dispatcher has no payload resolver and no provider credentials; those belong to the later adapter implementation and must revalidate identity, consent, delegation, and operation receipt immediately before send.

**Delivery authorization checkpoint.** Before an adapter can be enabled, each
intent must bind a named capability, its typed resource scope, and (when used)
the named delegation agent allowed to exercise that capability. The dispatcher
currently performs a fresh server-side check of the linked identity, active and
unexpired consent/delegation, named capability, and contained resource scope
immediately before invoking the adapter. A denied check records a repairable
`failed` outcome with `DELIVERY_AUTHORIZATION_DENIED` and invokes no provider
effect. An unavailable authorization store fails closed: it leaves no send
receipt and must not be converted into a retryable authorization success.
Emergency-stop checking remains planned and is not implemented in this
checkpoint. No live provider adapter or real-DB authorization evidence exists
yet.

**Outcome:** Sanctuary tells the truth about a message or notification's state
and can repair it without duplicating it.

- [ ] Create provider-neutral outbox intents only after the related domain
  transaction commits. Include recipient endpoint, message/template/media
  reference, causation/correlation IDs, idempotency identity, cost class, and
  expiry/consent requirement.
- [ ] Implement a worker/dispatcher with provider-specific adapters, bounded
  retry/backoff, delivery status ingestion, dead-letter review, reconciliation,
  and manual-safe replay. It must distinguish accepted, delivered, failed, and
  unknown rather than compressing all into “sent.”
- [ ] Apply WhatsApp session-window/template policy and Telegram rate limits in
  the dispatcher—not in a UI or agent prompt. Operational and opt-in alerts are
  permitted; marketing/broad promotional delivery is not.
- [ ] Provide an operations view for stuck items, provider health, consent
  failures, retry reason, cost counters, and the global/per-school/per-channel
  emergency stop.

**Hostile exit gate:** crash between commit and send, duplicate worker lease,
provider accepted-but-response-lost, rate limit, revoked consent, and a manual
repair attempt cannot cause either a lost mandatory message or an unbounded
duplicate flood.

### M5 — Account linking, private door UX, and group boundary

**Outcome:** people can link and control their doors without leaking identity or
scope.

- [ ] Add authenticated mobile/web flows for beginning a link, showing a
  short-lived QR/deep link/code, confirming the exact external identity,
  viewing capabilities and consent, and unlinking/revoking immediately.
- [ ] Implement WhatsApp and Telegram private-chat ceremonies: public/help
  interaction may be low risk; a protected action always redirects to or proves
  a linked account and current membership.
- [ ] Launch Telegram Mini App only as a signed rich client for the same
  Sanctuary APIs; validate its initialization data server-side and do not treat
  client theme, chat context, or user-provided IDs as authority.
- [ ] Support group/channel registration only for a verified school/operator
  owner. Pilot group capability is announcement delivery plus an opt-in private
  reply path—no protected command executes in a group.

**Hostile exit gate:** another user cannot link, unlink, inspect, or act through
someone else's chat; group membership/sender text cannot escalate scope; expired
or forwarded links do not work; loss of a phone/bot account has a supportable
revocation route.

### M6 — First vertical capability slices

**Outcome:** real value proves the foundation without pretending all Sanctuary
workflows are channel-ready.

- [ ] Ship public, read-only school/resource lookup with clear provenance and
  no account disclosure.
- [ ] Ship a linked teacher voice-note flow: ingest → typed lesson/attendance
  draft → human review/edit → named authorized capability command → operation
  receipt → optional delivery receipt.
- [ ] Ship approved operational alerts and direct replies for linked staff and
  teachers, applying declared consent, school scope, audience, template, and
  provider policy.
- [ ] Define a capability promotion checklist. Every later action—group post,
  files-to-record, attendance, assignment, fee notice, or AI tool—must pass it
  individually; no broad “channel access” switch exists.

**Hostile exit gate:** each slice survives offline/retry, authorization change,
concurrent update, duplicate confirmation, a provider failure, and receipt
recovery. A green chat transcript alone is rejected as evidence.

### M7 — Graduated AI delegation

**Outcome:** the system can grow toward full AI capability without creating an
unaccountable operator.

- [ ] Keep pilot AI in proposal mode for protected actions; all human approval
  must be attributable, scoped, time-bounded, and receipt-backed.
- [ ] Add delegation policies only for named low-risk actions after their M6
  evidence exists: named capability, resource scope, quota, schedule, expiry,
  provider/channel boundary, audit events, current-scope recheck, and kill
  switch.
- [ ] Require a separate design/approval packet before allowing any autonomous
  external send or protected write. It must state harm analysis, reversal or
  compensation route, monitoring threshold, human escalation, and revocation
  drill.

**Hostile exit gate:** prompt injection, adversarial uploaded content, confused
deputy scope, expired delegation, model/provider outage, quota exhaustion, and
emergency stop all preserve human control and do not leave ambiguous authority.

### M8 — Five-school pilot and scale decision

**Outcome:** production claims follow observed operator and participant evidence.

- [ ] Onboard one internal school first, then the remaining four through a
  documented readiness checklist: staff identity, consent, operator contacts,
  test chat/bot, approved group endpoint if applicable, and support route.
- [ ] Run daily review of link success, command success/unknown outcomes,
  delivery latency/failure, retries/dead letters, media failures, AI proposal
  approval/rejection, cost, abuse reports, and manual interventions.
- [ ] Perform incident drills: provider outage, credential rotation, lost phone,
  malicious media, AI stop, failed dispatch, and receipt recovery.
- [ ] Produce a field evidence report and an explicit scale/no-scale decision;
  do not expand audiences, add parent/student protected actions, enable group
  collaboration, or grant AI delegation based on usage enthusiasm alone.

**Hostile exit gate:** named operations staff resolve a simulated failure from
the runbook; no unexplained protected write/delivery remains; measured capacity,
provider cost, safety incidents, and support burden fit the funded operating
model.

## Work packages and ownership

| Package | Primary owner | Review owner | Depends on |
| --- | --- | --- | --- |
| W1 authority/contracts/migrations | Sanctuary API engineer | security + data steward | M0 |
| W2 Meta and Telegram ingress | integrations engineer | security + operations | W1 |
| W3 media and AI proposals | media/AI engineer | privacy + domain steward | W1, W2 |
| W4 outbox and reconciliation | reliability engineer | operations + data steward | W1, W2 |
| W5 web/mobile linking and receipts | web/mobile engineers | identity/security | W1, W4 |
| W6 capability slices | domain engineers | classroom/school steward | W1–W5 |
| W7 pilot operations | Sanctuary operations desk | product steward | W1–W6 |

Each work package gets an implementation brief containing: exact symbols/files,
database owner, backward-compatibility posture, migration/rollback plan, secret
requirements, test selection, evidence level, and a deletion-veto statement.
No broad refactor or dependency upgrade is implied by this programme.

## Required evidence

| Evidence level | Required proof |
| --- | --- |
| G0 static | Contracts, schemas, policy matrix, migrations, dependency/boundary checks |
| G1 boundary | Signature/secret validation, authorization, idempotency, receipt projection, provider failure mapping using substitutes |
| G2 scenario | Link/revoke, media/AI draft/confirm, commit/outbox/repair, group denial, changed-payload retry |
| G3 mounting | Mobile/web link, receipt, consent and recovery views mount against realistic provider/API fakes |
| G4 bundling/integration | Public HTTPS handshakes, Meta/Telegram provider test accounts, Mini App initialization, real worker wiring |
| G5 field | Five-school device/network usage, outage drills, operator recovery, accessibility and vernacular voice evidence |

Every report must state what its evidence proves and does not prove. Do not say
“tests passed” without the level, engine, substitutions, and limitation.

## Hostile-review checklist before any promotion

1. Can a forged, replayed, reordered, delayed, or cross-environment provider
   update cause a state change?
2. Can a number, chat, group, callback, Mini App payload, or AI prompt choose
   another account, school, role, or delegation?
3. What precisely happens after a timeout, 503, worker crash, media scan
   outage, provider duplicate, or response loss?
4. Is every claimed send/commit backed by the right receipt, with an authorized
   repair route for `unknown`?
5. Did any new logging, analytics, AI context, or provider payload expand
   sensitive-data retention without explicit policy?
6. Does the diff delete a fallback, route, test, guard, or storage path? If so,
   halt for explicit deletion approval.
7. Can the operations desk revoke a link, consent, delegation, endpoint, or AI
   capability quickly enough to bound real harm?
8. Is the claimed scale supported by actual throughput, delivery, cost, support,
   and incident evidence rather than a dashboard estimate?

## Explicit deferrals

The following are not pilot scope: parent/student protected workflows,
unmoderated external group collaboration, autonomous AI protected writes,
autonomous broad broadcasts, channel-specific parallel domain logic, a second
channel database, and a microservice split. Each requires a separate capability
brief and hostile-review packet after this foundation has field evidence.
