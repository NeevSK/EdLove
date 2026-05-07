# Durable Agents R&D Guide

This document defines how Gurudevi should explore durable agentic workflows
without confusing them with the existing Inngest production workflow model.

## Purpose

We already have a working durable workflow lane:

- mobile emits events
- shared packages own contracts and pure logic
- `gurudevi-marketingWeb` hosts Inngest workers

That solves deterministic background orchestration.

Durable agents are a different problem.

They matter when the system is no longer just reacting to an event with
deterministic steps, but is instead running a bounded model-driven tool loop
that may:

- plan
- gather data
- call tools
- revise its own draft
- pause and resume
- take long enough that durability matters

This guide exists so we can explore that lane intentionally, cheaply, and
without destabilizing the production workflow foundation.

## Core Distinction

### Durable workflow

Use a durable workflow when:

- the steps are mostly known ahead of time
- the orchestration is deterministic
- retries and idempotency matter more than reasoning depth
- the system is coordinating actions, not thinking through an open task

Examples:

- attendance replay
- grade publication reactions
- classroom creation audit and analytics
- scheduled notification fan-out

Today, this repo uses Inngest for that lane.

### Durable agent

Use a durable agent when:

- the system must reason through a task, not just run a fixed sequence
- tool calls are chosen dynamically
- the interaction may span many steps
- interruption, resume, and checkpointing matter
- a teacher or admin is effectively delegating a bounded thinking task

Examples:

- report card narrative drafting
- teacher summary synthesis from attendance, grades, and wellbeing
- timetable proposal generation with constraint reasoning
- principal weekly digest generation with iterative evidence gathering

Today, this repo does not yet have that lane implemented.

## Current Repo Reality

As of 2026-04-28:

- we have durable workflows
- we do not yet have a durable-agent runtime
- we do not currently use Temporal
- we do not currently use the Vercel AI SDK in production workflow code
- we do not currently have a general governor layer for model tool loops

That is not a failure.

It means durable agents should be treated as an R&D lane, not as a hidden
assumption in current architecture.

## R&D Goal

The goal is not to replace Inngest.

The goal is to prove or disprove this hypothesis:

> Some educator-facing tasks in Gurudevi are better expressed as bounded,
> durable model-driven tool loops than as deterministic background workflows.

We should only graduate durable agents into the core architecture if the R&D
proves they improve quality, resilience, or user leverage enough to justify
their complexity and cost.

## What Exists Today

As of 2026-04-28, there is now a functional internal demo lane in
`gurudevi-marketingWeb`, not just a conceptual prototype.

Current demo surface:

- `/durable-agents`
- bounded "Teacher Summary Draft" run
- bounded "Student Support Snapshot" run
- demo scenarios with governed evidence inputs
- durable execution via Inngest
- pollable run status and recent run history
- explicit human-review checkpoint
- one narrow promotion action into a real teacher note artifact

This is still R&D, but it is now demoable to another person as a product slice.

## Cost-Aware R&D Posture

The R&D lane should stay deliberately cheap.

### What "cheap" means here

- one or two narrow use cases only
- no platform-wide rollout
- no agent embedded into every screen
- low-volume internal or staff-only entrypoints first
- explicit step limits
- strong input validation
- low-cost model choice by default
- manual review or approval before any sensitive side effect

### What we should avoid in the R&D phase

- broad autonomous agents
- background agents acting on every event
- expensive multi-model chains by default
- unbounded tool loops
- agent authority over sensitive writes without human confirmation

## Recommended R&D Use Cases

Start with tasks that are:

- high value
- low frequency
- bounded in scope
- reviewable by a human
- mostly read-heavy at first

Best candidates:

1. Teacher progress summary draft
2. Grade/report narrative draft
3. Principal weekly insight digest
4. Timetable proposal draft with human approval before apply

Avoid starting with:

- automatic parent messaging
- autonomous wellbeing escalation
- autonomous student labeling or risk scoring
- any workflow that writes sensitive state without review

## Governor Model

If we explore durable agents, we must not let them run unchecked.

The governor model is mandatory.

### Governor rules

1. Every tool must have a strict schema contract.
2. Every loop must have a hard step boundary.
3. Every sensitive tool must require approval or a human checkpoint.
4. Every run must be traceable with correlation metadata.
5. Every side effect must be reviewable or idempotent.

### Practical controls

- Zod-backed tool input schemas
- bounded loop control
- explicit stop conditions
- allowlisted tools only
- no direct DB writes from generic model output
- a narrow adapter layer between agent tools and domain services

### Gurudevi-specific interpretation

The agent should not be treated as a new source of truth.

It should be treated as a drafting and synthesis partner that operates inside
our existing domain boundaries and service contracts.

Automate cues and drafts first, not conclusions and commitments.

## Relationship To Inngest

Durable agents do not replace the Inngest architecture.

Use this split:

- Inngest for deterministic orchestration
- durable-agent runtime for bounded model-driven loops

A durable agent may still emit or trigger Inngest workflows after human review
or after a bounded result is accepted.

Examples:

- agent drafts a teacher summary
- user approves it
- approval emits a normal workflow event
- Inngest handles notifications, audit, and downstream reactions

That keeps agent reasoning and production side effects cleanly separated.

## Proposed Evaluation Track

### Stage 0: Documentation and boundary lock

- keep [INNGEST_V4_CORE_SHELL.md](/C:/Users/Naween/projects/polymath-platform/docs/architecture/INNGEST_V4_CORE_SHELL.md) as the production workflow guide
- treat this document as the durable-agent exploration guide
- do not merge the two mental models

### Stage 1: Read-only prototype

Build one internal-only prototype that:

- accepts a bounded educator task
- reads from approved tools only
- produces a draft output
- cannot perform sensitive writes

Success criteria:

- useful output quality
- bounded cost
- bounded latency
- no runaway loops

### Stage 1.5: Functional demo slice

Before building a larger agent platform, make one prototype feel like a small,
credible product experience.

That means:

- pre-baked scenarios or demo presets
- visible run history
- durable status polling
- a review checkpoint with one safe promoted action
- an output artifact that lands somewhere real in the domain model

This is the current posture of the teacher-summary lane.

### Stage 2: Human-reviewed action prototype

Add one reviewed action:

- draft generated
- human approves
- approved result flows into normal durable workflow infrastructure

Success criteria:

- good operator trust
- low correction burden
- clear auditability

Current live example:

- durable teacher summary draft
- durable student support snapshot
- human explicitly promotes the draft to a teacher private note
- the agent never performs that promotion autonomously

## Capability Pattern

Each durable-agent capability should share the same overhead shape.

Required shared factors:

1. Event contract in a shared package
2. Request API route in the shell
3. Inngest handler in the worker shell
4. Evidence loader and deterministic fallback
5. Provider-agnostic synthesis adapter
6. Audit-backed run materializer
7. Human review or promotion checkpoint

Current reusable pieces:

- provider abstraction:
  `apps/gurudevi-marketingWeb/src/lib/durableAgents/llmProvider.ts`
- run materialization and promotion:
  `apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts`
- shared request surfaces:
  `/api/durable-agents/*`

Recommended environment knobs:

- `DURABLE_AGENT_PROVIDER=openai|anthropic`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- provider-specific model env vars when needed

If no supported provider is configured, the lane must still remain usable via
deterministic fallback.

This means new capabilities should add domain-specific evidence and prompting,
not re-invent the whole durable-agent lane each time.

## How To Add Another Capability

Use this sequence:

1. Define the shared event contract and payload schema.
2. Add a producer helper in `@repo/core`.
3. Create one domain-specific agent file with:
   - live evidence loaders
   - demo scenarios
   - deterministic fallback
   - synthesis call through the shared provider adapter
4. Add one Inngest handler with stable audit metadata.
5. Add one shell request route.
6. Extend the demo UI presets only after the backend slice works.
7. Add a human review action only if it lands in a safe, domain-native artifact.

If a new capability needs a different promotion target, add a narrow promotion
adapter rather than putting branching write logic directly into the page.

### Stage 3: Decision checkpoint

After the first prototype, decide:

- stay with Inngest-only for this use case
- keep durable agents as a narrow specialist lane
- or invest in a proper durable-agent runtime

Do not decide this abstractly.
Decide it based on one real use case.

## Suggested Technical Direction

If we do pursue durable-agent R&D, the likely shape is:

- AI SDK-based tool loop interface
- strict tool schemas
- bounded stop conditions
- one durable runtime for pause/resume semantics

But we should not commit the whole platform to that stack before the R&D
proves it earns its keep.

## Non-Goals

This document does not recommend:

- replacing Inngest today
- turning every workflow into an agent
- letting LLMs write privileged records without review
- treating "agentic" as a synonym for "better"

## Demo Rule Of Thumb

If you are preparing something to show another human, do not stop at
"the run completes."

A proper durable-agent demo should answer all four of these questions:

1. How is the run started?
2. How is the run observed while it is happening?
3. What does the human review?
4. What real-but-safe thing can happen after approval?

If any one of those is missing, it is still mostly an engineering playground.

## Rule Of Thumb

Ask two questions:

1. Is this mostly deterministic orchestration?
   - use Inngest
2. Is this a bounded reasoning task with tool selection and draft synthesis?
   - consider the durable-agent R&D lane

## Links

- Production workflow architecture:
  [INNGEST_V4_CORE_SHELL.md](/C:/Users/Naween/projects/polymath-platform/docs/architecture/INNGEST_V4_CORE_SHELL.md)
- Decision record:
  [010-durable-agent-rnd-lane.md](/C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/010-durable-agent-rnd-lane.md)

---

_Updated: 2026-04-28_  
_Status: R&D guidance only; not yet implemented as a production runtime._
