---
title: "Channel Admission Model"
status: "active"
created: 2026-11-06
updated: 2026-11-06
author: "Naveen"
scribe: "Claude"
tags: [architecture, channels, agents, mcp, webmcp, whatsapp, telegram, delegation, security, research]
---

# Channel Admission Model

How every way into Gurudevi connects to the same identity, authority and records: the app,
web, AI agents, MCP, WebMCP, WhatsApp, Telegram and whatever comes next. Read this before
adding a channel or an agent tool. The order of work is in the [road to v1](road-to-v1.md).

Nothing in this document is running yet. The API has one admitted channel, the app, and the
hosted API is still the pre-reset code. See [where the code stands](#where-the-code-stands).

Related: [authority model](authority-model.md), [agent infrastructure layer](agent-infrastructure-layer.md),
[security and AI threat model](security-and-ai-threat-model.md),
[channels and agents landscape](../../apps/sanctuary-api/docs/architecture/api-foundations/channels-and-agents.md).

## The idea

**Channels differ only in how they prove who is calling and what they can show. After that,
there is one path.** A new channel is an adapter, so adding one never changes who may do what.

```text
App · Web · MCP · WebMCP · WhatsApp · Telegram · workers · partners
   │  each channel proves the caller in its own way
   ▼
Caller       account, bond, channel, agent, grant, assurance
   ▼
Admission    is this capability open on this channel?
   ▼
Decision     person's authority ∩ channel ceiling ∩ grant ∩ assurance  (Cedar, default deny)
   ▼
Command      durable, idempotent, authority re-read inside the transaction
   ▼
Record       domain fact + receipt + audit with full provenance + outbox
   ▼
Reply        each channel shows the outcome; delivery is tracked separately
```

An action is allowed only if all four agree:

| Check | Question | Who owns it |
| --- | --- | --- |
| Person's authority | May this person, through this bond and capacity, do this? | Bonds and Cedar |
| Channel ceiling | Is this capability open on this channel at all? | Capability catalog |
| Grant | Did the person hand this to this agent or linked chat, and is it still live? | Delegation and consent |
| Assurance | Does this action need a fresh, verified person, and is one present? | Capability declaration, device trust |

## Five kinds of caller

| Caller | What it is | Authority | Example |
| --- | --- | --- | --- |
| **Person** | A signed-in human | Their bonds | A teacher in the app |
| **Delegated agent** (the main model) | Acts for one person, narrowly | That person's authority ∩ the grant | A teacher's assistant reading their timetable through MCP |
| **Ephemeral worker** (separate case) | Spun up for one task, then destroyed | Read-only or public data, plus its own scratch space | Drafting a lesson pack from the public commons |
| **System actor** | A named worker or schedule | A fixed list of capabilities | A retention job |
| **Provider event** | A verified message from WhatsApp, Telegram or a payment provider | None. It must resolve to one of the above, or to a named system capability | A Telegram update |

### Delegated agents: the main model

- **An agent is never an account.** `public.users` holds people. An agent exists only as a
  grant from a person.
- A grant names capabilities, entities, expiry and limits. It is **read live inside the
  transaction**, like a bond, so revoking takes effect on the next action, even when the
  agent still holds an unexpired token.
- Sub-agents get a narrower grant, never a wider one, and audit records the whole chain.
- Agents that log in with a person's password can't be told apart reliably. So risky actions
  need a [verified person](#d7-risky-actions-need-a-person), whichever way they arrive.

### Ephemeral workers: a separate door, kept open

We aren't purists about this. A short-lived, non-destructive agent is fine when a task
needs one. It is a different case, with its own limits, and it doesn't change the rules above.

| Limit | Rule |
| --- | --- |
| Lifetime | One task. Its credential expires with the run |
| Reads | Public or synthetic data, or what its starter could read through a read-only grant |
| Writes | Only to its own scratch space, which is destroyed with the run |
| Reaching real records | Only as a proposal, which a person or a delegated agent then commits through the normal path |
| Identity | A run id tied to whoever started it. Never an account, and it can't hold a bond |
| Children's data | Not copied into scratch space or a sandbox without a separate review |
| Cost and trace | Has a budget. Audit records start, end, reads of person-owned data and any proposal |

Enforcement sits on the server: the catalog marks each capability as a query or a command, and
the run's credential can't pass admission for a command. "Non-destructive" is not a promise
made by the agent.

Fits: summarising public material, converting documents, preparing a draft, running
real-database tests on a throwaway database. Doesn't fit: entering marks, sending messages,
or anything scheduled to change a record. Those are delegated agents with approval.

Admitting one needs a named use case, not a new authority model.

## The channels

| Channel | How it proves the caller | Ceiling | First version | Status |
| --- | --- | --- | --- | --- |
| **Mobile app** | Supabase session, plus device trust where it applies | Full | Now | Admitted |
| **Web** | Session; needs a browser session and origin policy, which doesn't exist yet | Full, minus device-trust actions | Next | Not connected |
| **AI companion in the app** | The person's session plus a grant | Queries and proposals; the person approves changes | Stage E | Empty place |
| **Remote MCP** | OAuth 2.1, with a token only for the MCP server | Curated tools, read-only first | After the first domain | Not started |
| **WebMCP** | The page's existing session, same origin | Read and draft only | After web is on v1, and only if useful | Not started |
| **WhatsApp** | Verified webhook, then a linked account | Notices and structured tasks. No general AI assistant | Outbound notices first | Tables only |
| **Telegram** | Verified webhook, then a linked account | Notices and structured tasks; AI possible later | With WhatsApp | Tables only |
| **Workers and schedules** | Service identity | Named capabilities only | With durable effects | Skeleton |
| **Payment and provider webhooks** | Provider signature | One named capability each | With entitlements | Retired, check first |
| **Partner standards** (OneRoster, LTI and others) | Per-institution client credentials | Export and roster scopes an institution turned on | With exports | Skeleton |
| **Support and operators** | Staff identity, step-up, reason required | Narrow, audited, visible to the person where the law allows | Before schools go live | Skeleton |
| **A2A** | Not settled; the protocol has no field for the person served | Nothing | Only with a real partner | Not now |
| **Email, SMS and push** | Outbound only; replies aren't commands | Delivery only | With notifications | Not started |

Every channel can be **switched off on its own** without affecting the others. If a provider is
down, intents wait in the outbox. The app never depends on a bot working.

## Decisions

### D1. Tokens prove identity; grants carry authority

A token says who the person is, which client, and which grant. It doesn't list what is
allowed. The server works that out live, every time.

### D2. Each token is for one audience

An MCP token is refused at `/api/v1`, an app token is refused at MCP, and neither is passed
downstream. MCP [requires servers to check that a token was issued for them](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
and forbids accepting other tokens. We apply that to every channel.

### D3. An MCP token must not open the database

**This is the most important finding.** Supabase can act as an
[OAuth 2.1 server](https://supabase.com/docs/guides/auth/oauth-server), which looks like the
easy answer. Its docs say:

- It is in beta.
- Tokens default to `aud: authenticated` and role `authenticated`.
- ["All OAuth access tokens have full access to user data"](https://supabase.com/docs/guides/auth/oauth-server/token-security);
  separation is left to row-level policies that check `client_id`.
- Custom scopes aren't supported, and the pages read don't mention the `resource` parameter or
  Client ID Metadata Documents. A token hook can change `aud`.

So an agent's token could reach our data through PostgREST with the person's full access,
past the capability catalog, Cedar, audit and budgets. Our policies don't check `client_id`.

**Requirement, decided:** a token issued to an outside client gets nothing from PostgREST,
PowerSync or any path except the MCP server. A test must prove it.

**How, decided when the MCP channel opens,** with a spike in this order:

1. Supabase with a token hook that sets the audience and a role with no database grants. Use
   it only if the test passes and it can meet MCP's rules.
2. Otherwise a small authorization server of our own. The person signs in through Supabase and
   we issue our own short-lived signed token, which Postgres never accepts.

### D4. Supabase stays the person's credential

Passwords, passkeys and social login stay in Supabase, and subjects stay in `auth_identities`.
Everything is hexagonal: replacing the provider must not change a grant, a bond or a policy.

### D5. Grants are ours, and scopes stay coarse

The grant table holds the exact capabilities. OAuth scopes only say roughly what a client asks
for (for example read, or propose) and the consent screen turns that into a grant the person
can read. A wide scope never widens a grant.

### D6. Linking a chat account needs a signed-in person

1. The person, signed in to the app, asks to link.
2. The server creates a single-use, short-lived token in `channel_link_attempts`.
3. The person opens the link. Telegram's [deep link](https://core.telegram.org/bots/features#deep-linking)
   allows 64 characters and officially suggests this use.
4. The server binds the provider's subject to the account and records consent.

A phone number, display name or model output never identifies an account. On WhatsApp, key on
the [business-scoped user id](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks),
because the phone-based field may be missing. Unlinking takes effect immediately.

### D7. Risky actions need a person

A capability can declare that it needs a fresh, verified person: publishing marks, money,
changing bonds, sending to many people, anything about a minor's record. This holds for every
channel, including a person's own chat and an agent logged in with their password.

The approval is a record on the server, bound to the exact payload, actor, scope and expiry. A
changed payload needs a new approval. It happens in the app:

| Channel | How it asks |
| --- | --- |
| App | A prompt on a trusted device |
| MCP | `input_required` with a link to the app; on missing scope, a [403 `insufficient_scope` challenge](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) |
| WebMCP | Page confirmation plus the server check. [Annotations are hints, not enforcement](https://webmachinelearning.github.io/webmcp/) |
| WhatsApp, Telegram | A message with a link to the app. A chat reply is never an approval |

This agrees with the [device trust boundary](../../apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md#device-trust-vs-channel-ingress-boundary):
device trust isn't required to enter other channels, but high-risk actions do need it.

### D8. Chat carries as little as possible

We don't assume bot messages are end-to-end encrypted; Telegram's bot pages make no such
statement. Student records don't go into chat by default. A message says something is ready
and links to the app. A group chat can receive a permitted notice, and never issues commands.

### D9. Minors

Default deny: no delegated agents acting for a child, no chat linking and no MCP grants for a
minor's account until the [open decision](#open-decisions) below is made. A guardian's own
linked chat is the guardian's authority, not the child's.

### D10. Provider rules set the WhatsApp product

[Meta's terms](https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform) prohibit
AI providers from the platform where AI is the primary function rather than incidental, in
Meta's sole discretion, with country exceptions we haven't read. So:

- **The AI companion isn't offered on WhatsApp.** Enrolment, notices, reminders and support
  tasks are the safer shape. An open-ended tutor is the risky one.
- [Opt-in, the 24-hour window, approved templates and human escalation](https://whatsappbusiness.com/policy/)
  are product requirements.
- Platform data can't train models or build profiles.
- Sending codes needs [authentication templates](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates).

Telegram [welcomes third-party AI bots](https://core.telegram.org/bots/features) within its
rules, so AI on Telegram is possible later. This isn't legal advice; Meta's terms need a proper
review before launch.

### D11. A long job returns a run id

A command starts it, and progress is read separately. This suits MCP well, because the
2026-07-28 revision removed stream resumption and made tasks an extension with polling. Our
run id maps directly to its task handle. Agent checkpoints never count as committed work.

## What to build, in one seam

Small and shared, so channels stay thin:

```ts
// Target shape, not yet in code. Every channel adapter produces one of these.
type Caller = {
  account: AccountId | null;     // null only for system actors
  channel: ChannelName;
  agent?: { key: string; grantId: GrantId; chain: GrantId[] };
  run?: RunId;                   // ephemeral worker
  assurance: 'session' | 'fresh-person';
};
```

| Piece | Change |
| --- | --- |
| Capability catalog | Each capability declares `kind` (query or command), open channels (default: app only) and required assurance |
| Decision | Cedar gets `Platform::Agent` and the grant. Default deny |
| Audit | Done in the table: channel, agent key, grant and run. The writers need the real values from `Caller` |
| Adapter rule | A channel may verify, resolve the caller and call a capability. It can't import domains or get a database pool |
| Conformance suite | One set of scenarios runs against every admitted channel: denied, committed, replayed, revoked, unknown outcome |

The conformance suite is what holds this together. A new channel is admitted by passing it and
the [checklist](#admitting-a-channel), and passing it says the semantics match. It doesn't
prove a provider's real behaviour or production readiness.

## Admitting a channel

1. A named person and task. Discovering a protocol isn't a reason.
2. How it proves the caller, including what an attacker could forge.
3. Account linking and unlinking; how an ambiguous identity is refused.
4. The exact capabilities open to it, read-only first.
5. Provider terms and retention read from the primary source, with the date.
6. Minors and group behaviour.
7. Budgets, an off switch and what happens when the provider is down.
8. The conformance suite passes, including revocation.
9. Threat model updated and the status table above changed.

## Where the code stands

| Exists | Where | Note |
| --- | --- | --- |
| Tables for channel identities, link attempts, consent, delegations, ingress, delivery, media jobs and AI proposals | [`20261015160000_omnichannel_authority_foundation.sql`](../../apps/gurudevi-mobile/supabase/migrations/20261015160000_omnichannel_authority_foundation.sql) | Reuse them; whether they are applied to the hosted database wasn't checked. Providers are limited to `whatsapp` and `telegram`. `channel_delegations` has no chain, run, budget or approval link |
| Delivery plan, envelope and milestones | [Omnichannel foundation plan](../../apps/sanctuary-api/docs/architecture/2026-10-15-omnichannel-sanctuary-foundation-delivery-plan.md) | Its operating model matches this one. Its implementation checkpoints describe runtime code the reset retired |
| Provider and bot runtime, old MCP, `src/doors`, `src/agents` | Deleted in the uncommitted reset | Stays gone. Rebuild as adapters only when a channel is admitted |
| `Caller`, `Platform::Agent`, catalog declarations | Not built | `APIContext` has only request id, identity and platform |
| `api_command_audit`, `api_command_denials` | [`20261104010000`](../../apps/gurudevi-mobile/supabase/migrations/20261104010000_api_command_audit.sql) | Channel, agent key, grant and run columns added; `account_id` is the person who delegated. Only `app` is written. Not yet run |

`@repo/platform-mcp` is the developer control plane. It isn't a product channel and none of
this applies to it.

## Open decisions

**Deferred by the owner (2026-11-06):** both of these wait until the foundation is done, and D9's
default deny holds until then.

- **Minors:** may a guardian allow a limited assistant or chat link for a child, and at what age?
- **First outside channel:** Telegram, WhatsApp or both may be tried. The recommendation stays
  outbound notices first.

Still open:

- **Support access:** when an operator may see private content, which also settles the founder's
  access. Open in the [Arrive journey](arrive-journey.md).
- **Authorization server:** see D3. Decide when MCP opens, not before.

## Research record (read 2026-11-06)

Written so this needn't be repeated. Check again when the trigger happens.

| Topic | What the source says | Check again when |
| --- | --- | --- |
| [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog) | Versions are dates; the official pages don't use "v2" ([Cloudflare's post](https://blog.cloudflare.com/mcp-v2/) does). Sessions and the initialize handshake removed, `server/discover` required. `input_required` retry replaces server-initiated requests. Streams aren't resumable; a broken one is re-issued. Tasks moved to an extension, polled with `tasks/get`. Roots, Sampling, Logging and HTTP+SSE deprecated. Dynamic client registration deprecated in favour of Client ID Metadata Documents | Building MCP. The pages read don't label the revision final; [a project post](https://blog.modelcontextprotocol.io/) reportedly does. A `draft` version also exists |
| [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) | Server is an OAuth 2.1 resource server. Protected Resource Metadata required; clients send `resource`; server validates audience; `iss` validated by clients; step-up through scope challenges. Client registration and security pages not read | Same |
| [WebMCP](https://webmachinelearning.github.io/webmcp/) | Community Group draft dated 2 Nov 2026, not on the standards track. `document.modelContext.registerTool`. Same origin by default, cross-origin needs opt-ins. Page cookies apply. Hints such as `consequentialHint` can be misrepresented. [Chrome](https://developer.chrome.com/docs/ai/webmcp): origin trial from 149, and browser extensions can call tools. Mobile isn't mentioned. Security section read from a summary only | Web is on v1 and a browser agent matters to users. Trial end dates conflict in secondary sources |
| [WhatsApp terms](https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform) and [policy](https://whatsappbusiness.com/policy/) | Both updated 23 Sep 2026. See D10. Messages must be gated by legal age. No education-specific rule on minors found. Effective dates came only from [a vendor blog](https://respond.io/blog/whatsapp-general-purpose-chatbots-ban), and one blog reported an EU exception | Before building. The AI-provider country list wasn't read |
| [WhatsApp webhooks](https://developers.facebook.com/docs/graph-api/webhooks/getting-started) | GET challenge with a verify token. `X-Hub-Signature-256`, generated with the app secret. Deduplicate. Retry period conflicts: [7 days](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks) against 36 hours. Optional mTLS | Before building. Confirm HMAC and raw-body signing, which the page doesn't spell out |
| [Telegram webhooks](https://core.telegram.org/bots/api#setwebhook) | `secret_token`, 1–256 characters, returned in `X-Telegram-Bot-Api-Secret-Token`. Retries, count unstated. Updates kept up to 24 hours. Deduplicate on `update_id`, which can jump after a quiet week | Before building |
| [Telegram Mini Apps](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app) | HMAC validation of `initData`, or Ed25519 without the bot token. Read from a summary only. [Bot developer terms](https://telegram.org/tos/bot-developers) not read | Before using either |
| [Supabase OAuth server](https://supabase.com/docs/guides/auth/oauth-server) | See D3. Authorization code with PKCE and refresh only. Consent screen is ours. Dynamic registration off by default. Revoking a grant kills refresh tokens; the docs don't say an issued access token stops working, which the live grant check covers. Token hook page not read | When MCP opens; it may leave beta |
