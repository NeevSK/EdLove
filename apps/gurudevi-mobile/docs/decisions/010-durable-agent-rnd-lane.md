# ADR-010: Durable Agent R&D Lane

## Status

Accepted

## Date

2026-04-28

## Context

Gurudevi now has a working durable workflow path using Inngest for selected
cross-domain and background workflows.

At the same time, some future educator-facing tasks may be better expressed as
bounded agentic loops than as deterministic orchestration. Examples include:

- teacher summary drafting
- narrative report generation
- timetable proposal generation
- principal synthesis digests

We want to explore that possibility without prematurely replacing the existing
workflow architecture or introducing uncontrolled agent behavior.

## Decision

We will create a distinct durable-agent R&D lane.

This lane is explicitly:

- narrow
- cost-aware
- human-review-first
- separate from the existing Inngest production workflow model

We will not:

- replace Inngest with a durable-agent runtime today
- route ordinary product workflows through an agent
- grant autonomous privileged write authority to an LLM by default

## Rationale

### Why explore this at all?

Because some educator tasks are not just "run steps in order."

They require:

- synthesis
- planning
- iterative evidence gathering
- structured drafting

Those are better candidates for bounded tool loops than for purely
deterministic event handlers.

### Why keep it separate from Inngest?

Because durable workflows and durable agents solve different problems.

Inngest is already a good fit for:

- deterministic orchestration
- retries
- idempotent background reactions
- event-driven execution

Durable agents should be introduced only where model-driven reasoning adds
clear value.

### Why make it human-review-first?

Because Gurudevi operates on sensitive educational and wellbeing data.

The first trustworthy use of agents here is as:

- drafter
- synthesizer
- recommender

not as an unchecked autonomous decision-maker.

## Consequences

### Positive

- We can learn whether durable agents are actually valuable here.
- We avoid cargo-culting "agentic" architecture into the whole platform.
- We keep production workflow infrastructure stable.
- We can introduce a governor model from the start.

### Negative

- We now maintain two mental models:
  - durable workflows
  - durable-agent R&D
- There is an extra documentation burden.
- Some future contributors may still confuse the two unless we keep the guides synchronized.

## Guardrails

- Start with one read-heavy internal prototype.
- Use strict schema validation for every tool.
- Bound every tool loop with hard stop conditions.
- Require human review before sensitive writes or external communication.
- Keep agent tools behind the same domain-service boundaries as the rest of the platform.
- Preserve correlation and auditability for every run.

## Review Trigger

Re-evaluate this ADR when:

- one durable-agent prototype proves clear product value
- cost becomes material
- latency or resume semantics become a blocking issue
- we need a dedicated durable-agent runtime rather than an R&D lane

## Links

- Architecture guide:
  [DURABLE_AGENTS_RND_GUIDE.md](/C:/Users/Naween/projects/polymath-platform/docs/architecture/DURABLE_AGENTS_RND_GUIDE.md)
- Existing workflow architecture:
  [INNGEST_V4_CORE_SHELL.md](/C:/Users/Naween/projects/polymath-platform/docs/architecture/INNGEST_V4_CORE_SHELL.md)
