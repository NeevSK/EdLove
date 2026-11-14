---
title: "Agent Infrastructure Layer"
status: "active"
created: 2026-11-07
updated: 2026-11-07
author: "Naveen"
scribe: "Claude"
tags: [architecture, agents, infrastructure, durable-execution, sandboxes, memory, research]
---

# Agent Infrastructure Layer

Agents need their own infrastructure, and the industry built much of it during 2026. This
doc records what exists, where our API's assumptions no longer hold, what belongs in the
foundation now, and what waits. Vendor numbers below are their claims, not measurements.

Related: [platform map](platform-map.md), [authority model](authority-model.md),
[security and AI threat model](security-and-ai-threat-model.md),
[channels and agents](../../apps/sanctuary-api/docs/architecture/api-foundations/channels-and-agents.md),
[channel admission model](channel-admission-model.md).

## The shift

An API call is short, stateless and answered in seconds. An agent run is long, stateful and
interrupted: it can last minutes or hours, wait for a person's approval, survive a crash and
call tools many times. That one difference creates the whole layer.

## What exists now (checked 2026-11-07)

| Need | Options | State |
| --- | --- | --- |
| Agent framework | [Mastra](https://www.developersdigest.tech/agent-frameworks/mastra) (TypeScript; 1.0 in January 2026; [server adapters for Hono](https://dev.to/jangwook_kim_e31e7291ad98/mastra-ai-10-the-typescript-agent-framework-developers-are-actually-shipping-2lan)), LangGraph, TanStack AI (already installed), Claude Agent SDK | Mature enough to evaluate. Mastra's facts come from secondary sources |
| Stateful agent runtime | [Rivet Actors](https://rivet.dev/agents/docs/): each agent is an actor with its own SQLite database; can sleep, crash or upgrade and resume; Apache 2.0, self-hostable, workers can run on Render | Promising. Stability not stated on the page. Its authorization pages weren't read |
| Durable steps | [Render Workflows](https://www.financialcontent.com/article/bizwire-2026-11-4-render-expands-its-platform-to-simplify-running-ai-agents-inside-production-apps) (GA 4 Nov 2026; Python or TypeScript; up to 24 hours; resumes from saved steps), Temporal, Inngest (already a dependency of `@repo/core`) | Available |
| Sandboxes | Render Sandboxes (public beta; microVMs), E2B, Modal, Daytona | Available. Needed only if agents run code |
| Shared files | Render Shared Filesystems | Early access |
| A database per agent | [Turso](https://supabase.com/blog/supabase-is-acquiring-turso) (SQLite; Supabase announced buying it on 2 Oct 2026; "Supabase will continue building around Postgres"), Rivet's per-actor SQLite, [Neon](https://neon.com/blog/were-building-backends) branches (Postgres, not SQLite) | Moving fast. Neither the Supabase nor the Neon page mentions device sync |
| Protocols | [MCP](https://datalakehousehub.com/blog/state-of-agentic-ai-standards-2026/) for tools, A2A 1.0 for agents, AG-UI for agent-to-UI | Settling. Our UI kit is already AG-UI shaped |
| Always-on agents with their own computer | [OpenAI dots](https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/) (29 Sep), [Grok Bot](https://www.infoq.com/news/2026/08/grok-bot-agent/) (11 Aug, beta), [Manus Cue](https://www.nerdheadz.com/blog/manus-cue-personal-ai-agents-explained) (28 Sep), [Claude Duet](https://claude.com/product/claude-duet) (21 Oct, preview) | New this autumn. See [identity](#how-these-agents-handle-identity) |
| Open versions of those | [CopilotKit OpenDuet](https://www.scriptbyai.com/openduet-claude-duet-alternative/) (MIT, built on its OpenBot platform; its runtime sends usage telemetry to CopilotKit), a separate [open-duet](https://skillsllm.com/skill/open-duet) project | Templates. "openclaude" wasn't found |
| Personal agents | [OpenClaw and Hermes Agent](https://docs.openclaw.ai/start/why-openclaw/openclaw-and-hermes-agent): self-hosted, reached through messaging apps | Popular. Their trust model is one person's, see below |
| Throwaway databases | Neon [ephemeral branches](https://neon.com/guides) and [Claimable Postgres](https://agent-skills.md/skills/neondatabase/agent-skills/claimable-postgres) (`neon.new`: no signup, reported to expire after 72 hours unless claimed), Turso | For scratch work and tests. Never for records, which must last decades |
| Infrastructure as code | [Alchemy](https://github.com/alchemy-run/alchemy) | Alpha or beta; supports AWS and Cloudflare, not our hosts. Not relevant now |

**Identity is the weak spot everywhere.** The [O'Reilly stack overview](https://www.oreilly.com/radar/the-ai-agents-stack-2026-edition/)
has no identity layer, and practitioner overviews
[call identity fragmented](https://thenuancedperspective.substack.com/p/the-ai-agent-stack-in-2026).
Bonds, Cedar and delegation are the part nobody sells, and Gurudevi's hardest requirement
with children's data, so we own that part.

## Where our API's assumptions no longer hold

| Assumption in the API today | Reality for agents | What it means |
| --- | --- | --- |
| Requests are short: 10-second timeout, 32 in flight per instance | Runs last minutes to hours | A run must never hold a request open. A command starts it and returns a run id |
| The actor is a person on a device | The actor may be an agent acting for a person | Audit has no channel, agent or delegator columns; Cedar's `Platform` namespace has no agent |
| Budgets count requests per account | The cost is tokens and tool calls | Budgets need a cost dimension per person, institution and agent |
| A failed call is retried by the client | A run resumes from its last completed step | Agent step state and authoritative commands are two different things and must stay separate |
| Results return in the response | Results stream, on phones with weak signal | Streams must be resumable from an event log |
| All server state is one Postgres | Per-person or per-agent state is becoming normal | It fits being person-centred: agent memory is person-owned. Worth evaluating, not assumed |

What still holds, and matters more now: every change goes through a durable command with
authority inside its transaction, handlers get no database pool, channels are adapters, and
content is never instructions. An agent framework's checkpoint doesn't make a grade
correction safe; the command path does.

## The layer's shape

Agents are two things on the platform map: the `agents.*` domain, which owns runs, proposals,
delegation grants and memory, and a runtime underneath it, which is replaceable.

```text
Channels      app, bots, MCP, A2A, external agents
                 │  delegated authority only
Domain        agents.runs · agents.delegation · agents.memory · agents.assist
                 │  starts and observes runs; a person approves risky steps
Runtime       framework · durable steps · sandbox · model gateway · agent state
                 │  every change to a fact
Commands      durable commands, Cedar, audit  ← the only way in
```

**Rule: the runtime holds no authority.** It can be swapped without touching what agents are
allowed to do, because tools call the same commands as the app.

## How these agents handle identity

There is no single standard yet, and the named products take three different approaches.
Most launch material is silent on revocation. Items below come from product pages and launch
coverage, not full vendor documentation.

| Approach | Who | How it works | Gaps stated |
| --- | --- | --- | --- |
| Borrows the person's logins | [Grok Bot](https://www.datacamp.com/blog/grok-bot) | Logs into sites "the way a person would"; all Bots on an account share one machine, files and logins; hands back for passwords and 2FA | Separate Bots aren't a security boundary; audit view not shipped yet |
| Works under the person's account | [Claude Duet](https://claude.com/product/claude-duet) | "Uses your Claude account"; asks before messages or payments; you can see what it did | No team plans yet; revocation not described |
| Has its own identity | [Manus Cue](https://www.nerdheadz.com/blog/manus-cue-personal-ai-agents-explained), [dots](https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/) | Cue: its own email, phone and wallet. Dots: "provisioned with specific identities, credentials, and tools" | How accounts are authorized isn't described |
| Forwards the person's token | [CopilotKit](https://docs.showcase.copilotkit.ai/ag2/auth) | The backend validates the user's token and scopes tools to them | No agent identity of its own |
| Pairs known senders | OpenClaw, [Hermes](https://www.fast.io/resources/hermes-agent-security/) | Allowlists and pairing codes, deny by default | Everyone admitted shares the agent's authority |

Protocols, as of 2026-11: [MCP uses OAuth 2.1](https://nhimg.org/agent-identity-standards-tracker)
with resource indicators and step-up; [A2A carries no field for the person the work is done
for](https://insights.bostonidentity.com/research/a2a-protocol-2026-05-28-a2a-protocol);
[token exchange with an `act` claim](https://thinkidentity.github.io/iam/2026/06/05/agentic-identity-protocols.html)
is the main way to show a chain of delegation, and it breaks when a sub-agent gets its own
credentials.

### What this means for Gurudevi

1. **Agents will arrive through the front door.** A teacher's agent can log in as the teacher
   and enter marks through the screens. The server can't reliably tell it from the person, so
   a delegation model alone doesn't cover this.
   - Give an easier official path: a narrow MCP delegation, so nobody needs to hand over a
     password.
   - Require a person for risky actions whichever way they arrive: step-up with a passkey on a
     trusted device for publishing marks, money and changing bonds. An agent can't complete it.
2. **An agent is never an account.** `public.users` is a person. An agent with its own email
   could otherwise sign up as a "student". An agent exists only as a delegation from a person. This narrow, person-bound agent is the
   main model. Short-lived, non-destructive [ephemeral workers](channel-admission-model.md#ephemeral-workers-a-separate-door-kept-open)
   are allowed as a separate case, and they aren't accounts either.
3. **Delegation is checked live, like bonds.** Revocation is the common gap, and we can close
   it: read the grant under lock in the command's transaction, so revoking takes effect on the
   next action.
4. **Authority only narrows along a chain.** Each sub-agent gets the intersection, and audit
   records the whole chain. No separate credentials for sub-agents.
5. **Proactive means read-only.** [Dots' background research uses read-only tools](https://9to5google.com/2026/09/29/openai-dots-agent/),
   and Duet asks before sending or paying. Our companion follows the same rule: it may notice
   and suggest in the background, and any change waits for approval.
6. **We don't give delegated agents a cloud computer.** Those products need one because they
   work across other companies' apps. Inside Gurudevi, an agent calls capabilities. A child's
   data doesn't go to a shared machine. Sandboxes are for ephemeral workers under their limits.

## OpenClaw and Hermes

These are clients, never the backend. OpenClaw's own model is that
[everyone who can message a tool-enabled agent shares its tool authority](https://docs.openclaw.ai/start/why-openclaw/openclaw-and-hermes-agent),
which can't hold for a school with minors. A person who runs one can connect it to Gurudevi
through a narrow, revocable delegation over MCP, like any other external agent.

## What to do, and when

### Now, in the foundation (small, and expensive to retrofit)

1. **Provenance in audit:** add channel, agent and delegator to `api_command_audit` while the
   table is new, null for ordinary calls. Fabricating these later is impossible.
2. **Agent as a delegation, not an account:** add `Platform::Agent` and a live-checked
   delegation in the request context, deciding the intersection of the person's authority and
   the grant. Default deny.
3. **Run contract:** a long job is a command that returns a run id; progress is read
   separately. Write the contract only; build nothing behind it yet.
4. **Cost budgets:** leave room for a token and tool-call dimension beside request budgets.
5. **Step-up for risky commands:** a capability can declare that it needs a fresh, verified
   person, so an agent holding a session can't complete it. Declare it now; passkeys later.

### At stage E, when the first agent feature is chosen

Run one spike on one real task, then decide:

- **Framework:** TanStack AI (installed) against Mastra (has a Hono adapter).
- **Durable steps:** Render Workflows (we're already on Render) against Inngest (already a
  dependency). Add only one. Rivet is the alternative if a long-lived per-person agent is
  what the product needs.
- **Memory:** Postgres with `pgvector` first, which O'Reilly also recommends starting with. A
  database per person only if that proves too limiting, and only with export and erasure.
- **Sandbox:** only if agents must run code. Never for a minor's data without review.

### Not now

Alchemy, A2A partners, shared filesystems, agent computers, and any second durable system
beside the operation store. Popularity isn't a reason; a named missing capability is. Check
OpenDuet's telemetry before using it near children's data.

Throwaway databases have one near-term use: running the real-database scenarios against a
disposable branch instead of creating a database on a shared server.

## Docs against reality (2026-11-07)

- `channels-and-agents.md` (30 Oct) covers protocols well and its rules hold, but omits Mastra,
  Rivet, Render Workflows and Sandboxes.
- `dependencies-and-evidence.md` lists Temporal and Inngest for durable work, not Render Workflows.
- The platform map had an `agents` domain and no runtime beneath it.
- The horizontal layer table had no agent row.
- `authority-model.md` describes delegation well; none of it is in code or in the audit table.
- `@repo/ai` still uses the retired API, and its route is an empty place.

Sources:
[Supabase on Turso](https://supabase.com/blog/supabase-is-acquiring-turso),
[Render release](https://www.financialcontent.com/article/bizwire-2026-11-4-render-expands-its-platform-to-simplify-running-ai-agents-inside-production-apps),
[Rivet agents](https://rivet.dev/agents/docs/),
[Neon backends](https://neon.com/blog/were-building-backends),
[O'Reilly stack](https://www.oreilly.com/radar/the-ai-agents-stack-2026-edition/).
