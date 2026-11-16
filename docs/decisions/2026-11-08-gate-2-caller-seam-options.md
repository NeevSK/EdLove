---
title: "Gate 2, the caller seam: options and trade-offs"
status: "draft"
created: 2026-11-08
updated: 2026-11-08
author: "Naveen"
scribe: "Claude"
tags: [decision, channels, agents, authority, cedar, budgets, gate-2]
---

# Gate 2, the caller seam: options and trade-offs

A decision brief for the owner. It decides nothing. Each question lists the options, what each
costs, what the outside world does, and a recommendation marked as one.

Gate 2 in the [road to v1](../architecture/road-to-v1.md#gate-2-the-caller-seam): `Caller`,
catalog declarations, `Platform::Agent` with a live grant, step-up, the run contract and cost
budgets. Only the contract and default deny; no channel behind it.

## Already decided (not reopened here)

From the [channel admission model](../architecture/channel-admission-model.md) D1–D11:

- An agent is never an account; it exists only as a grant from one person (D5, "Delegated agents").
- Tokens prove identity; grants carry authority, read live in the transaction (D1).
- Each token is for one audience; no passthrough (D2, as MCP's authorization spec requires).
- An outside client's token never opens the database (D3).
- Risky actions need a fresh, verified person, on every channel (D7).
- Ephemeral workers: one task, read-only or public data, writes only to their scratch space,
  real records only as proposals, a budget (the "Ephemeral workers" table).

## What exists (measured 2026-11-08)

| Piece | State |
| --- | --- |
| `Caller` {channel, agent, runId, assurance} | Built, `security.ts` |
| Agent ∩ person through a live grant, under share lock | Built, `assertDelegation`; G2 test passes (revoke applies to the next action) |
| An ephemeral run can't pass a command | Built; G2 test passes |
| Step-up (`fresh-person`) and channel check | Built, but **per call**: each caller passes `channels` and `assurance` |
| Catalog declares channels and assurance per capability | Built today, **not read by enforcement** |
| Queries | **Not checked by channel at all**; only commands go through admission |
| `Platform::Agent` in Cedar | Not built |
| Budgets for agents and runs | Not built (layer 4 budgets are per person and institution) |

## Question 1: where is the one enforcement point?

The idea behind the OpenChoreo post and every agent-security source read: one place decides,
the same way for a person and an agent. Today the catalog declares; callers enforce what they
pass. Two sources can drift.

| Option | What it means | Cost | Risk |
| --- | --- | --- | --- |
| **A. Per-call options (today)** | Each command passes its own `channels`, `assurance` | None | A handler can open a channel the catalog doesn't declare; queries aren't covered |
| **B. Catalog read inside `executeAccountCommand`** | Admission looks up the capability's declaration | Small | Still commands only; queries keep no channel check |
| **C. Catalog read at the router, for every procedure** | One middleware maps procedure path → declaration, checks channel, assurance, kind (run can't call a command), before any handler | Medium: a middleware plus a fitness test that every procedure is covered | Needs a declaration for every procedure, which the catalog test already enforces |

Outside practice: policy enforcement at one gateway or middleware, policy decision in one
engine, is the standard pattern (AWS's Cedar multi-agent reference evaluates agent, tool and
user layers in one evaluator and stops at the first deny).

**Recommendation: C.** It is the only option that covers queries, and the catalog fitness
tests already guarantee every procedure has a declaration. Keep `executeAccountCommand`'s
in-transaction checks (grant under lock), which C doesn't replace.

## Question 2: what is a "channel"?

Two vocabularies exist: the caller's concrete doors (`app`, `mcp`, `webmcp`, `whatsapp`,
`telegram`, `worker`) and the catalog's groups (`app`, `workers`, `bots`, `mcp`, `partners`,
`operators`).

| Option | Pro | Con |
| --- | --- | --- |
| **A. Groups only** | Capabilities are declared per kind of door; adding Viber changes no capability | Audit and token audience lose which provider it was |
| **B. Concrete only** | Exact | Every new provider means editing every capability; declarations grow with providers |
| **C. Two levels** | The caller carries the concrete door (for audit, token audience, provider rules); the catalog declares groups; one fixed map joins them (`whatsapp`, `telegram` → `bots`; `worker` → `workers`; `mcp`, `webmcp` → `mcp`) | One more small table to keep |

D2 (one audience per token) and the audit columns need the concrete door; D5 and the catalog
want coarse declarations. Provider rules (D10, WhatsApp) are per provider.

**Recommendation: C.** It is what the existing decisions already imply; the map is a few lines
and a test that every concrete door maps to exactly one group.

## Question 3: how do agents appear in Cedar?

Today the person's authority comes from Cedar, and the grant check is SQL (`assertDelegation`),
read under lock in the transaction.

| Option | What it means | Pro | Con |
| --- | --- | --- | --- |
| **A. SQL grant only (today)** | Cedar sees the person; the grant narrows outside Cedar | Live revoke under lock; already proven at G2 | Policies can't say "never by an agent" or "agents may only read here"; the rule lives in code |
| **B. `Platform::Agent` as the principal** | Cedar decides for the agent, with the person and grant as attributes | All rules in policy | Grant must be loaded into Cedar's entities each time; risk of a stale grant if read outside the lock; doubles policies |
| **C. Person as principal, agent in context** | Cedar decides for the person, with `context.agent` (key, grant id, chain depth, run) so policies can forbid or narrow agent use; the grant itself stays the SQL check under lock | Live revoke kept; policies gain agent rules; one principal model | Two places to read (policy and grant), joined by one function |

Outside practice: keep the human and the agent as separate identities, carry the delegation in
the decision context, and narrow at each hop. Windley's "delegation as data" injects delegation
attributes into the Cedar context; AWS's reference keeps the originating user's claims in every
decision; RFC 8693 token exchange carries both `sub` (person) and `act` (agent).

**Recommendation: C** now. B can come later if policies need to reason about agents as subjects
(for example, an agent's own reputation), which no current capability does.

## Question 4: what do budgets count, and for whom?

Layer 4 budgets count requests per person and per institution, for the morning burst.

| Option | Pro | Con |
| --- | --- | --- |
| **A. Requests per person (today)** | Built | An agent shares the person's budget and can starve them |
| **B. Separate counter per grant and per run** | An agent or run can't exhaust the person; a runaway is cut off alone | More keys in the budget table |
| **C. B plus cost weighting** | Matches what agent gateways do: tokens or money, not request counts | Needs a cost per capability; estimates, not invoices |

Outside practice: budgets keyed by agent identity and end user together, layered per minute and
per day, with a hard 429 at the limit (Cloudflare AI Gateway spend limits; Gravitee, which is
vendor material).

**Recommendation: B** in Gate 2 (keys: person, grant, run), with a `cost` weight field declared
per capability defaulting to 1, so C is a data change later, not a schema change.

## Question 5: the run contract, and where runs execute

D11: a long job returns a run id. Ephemeral workers have a budget and a scratch space.

Render launched **Render Sandboxes** (public beta, 2026-11-04): Firecracker microVMs for agents,
with control over where each sandbox can send data and which keys it sees, and early-access
credential brokering that attaches credentials at the boundary. Private networking and more
regions than Oregon are planned before general availability.

| Option | Fit |
| --- | --- |
| **A. Define the contract only (Gate 2 as written)** | `runId`, starter, budget, expiry, scratch space; refused for commands (already) |
| **B. Also pick an execution host now** | Premature: no worker capability is admitted, and children's data may not enter a sandbox without review |

**Recommendation: A.** Sandboxes fit the ephemeral-worker row closely (credential brokering
matches "its credential expires with the run"). Evaluate them when the first worker is chosen;
note that Oregon-only today means data leaves the region, which the Gate 7 data-protection
review must allow first.

## If all recommendations are taken

1. A router middleware reads the catalog for every procedure: channel group, assurance, kind
   (no command for a run). Fitness test: every procedure covered, every concrete door mapped.
2. `Caller` keeps the concrete door; one map gives its group.
3. Cedar's request context gains `agent` (key, grant, depth, run); default policies unchanged,
   so nothing permits more; a test proves an agent-forbidding policy works.
4. Budget keys gain grant and run; capabilities may declare a cost weight (default 1).
5. The run contract as a type and a refusal; no execution host.

Evidence to close Gate 2, as the road map asks: G1 decision tests for agent ∩ person, revoked
grant, wrong channel group, command refused for a run; G2 revoke-under-lock (exists).

## Sources

- [AWS: least privilege in multi-agent chains with Cedar](https://aws.amazon.com/blogs/security/enforce-least-privilege-authorization-in-multi-agent-ai-chains-using-cedar/)
- [Windley: delegation as data, Cedar and subagents](https://www.windley.com/archives/2026/03/delegation_as_data_applying_cedar_policies_to_openclaw_subagents.shtml)
- [MCP authorization, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) (cited in D2, D7)
- [RFC 8693 token exchange for agent delegation, worked example](https://mojoauth.com/blog/oauth-2-0-token-exchange-rfc-8693-for-agent-delegation-a-worked-example)
- [IETF draft: OAuth for AI agents on behalf of users](https://datatracker.ietf.org/doc/draft-oauth-ai-agents-on-behalf-of-user/01/) (expired draft, context only)
- [Cloudflare AI Gateway spend limits](https://codex-container-api-docs.previews.developers.cloudflare.com/ai-gateway/features/spend-limits/index.md)
- [Gravitee: cost and rate-limit management for agents](https://www.gravitee.io/corpus/gen-1987/design-management/cost-and-rate-limit-management.html) (vendor)
- [Render: introducing Render Sandboxes](https://render.com/blog/introducing-render-sandboxes)
- [Pydantic AI: Render sandbox integration](https://pydantic.dev/docs/ai/harness/render-sandbox/)
