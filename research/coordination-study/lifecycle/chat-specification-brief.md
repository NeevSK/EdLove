---
title: "Worked chat specification for lifecycle verification"
status: "draft"
created: 2026-11-11
updated: 2026-11-11
author: "Codex"
tags: [fixture, lifecycle, chat, requirements]
---

# Scope

The owner requested an executable development lifecycle that can classify a request,
decompose a complete feature across product, UX, screen states, errors, feedback, motion,
data, API, database, dependencies and shared concerns; route work to relevant tools;
preserve requirements, invariants and role outputs; retrieve them at handoff; and reopen
affected work when inputs change. This file paraphrases that request for a worked example.

Use the existing AI assistant as the chat example because it has source records and
implementations to inspect. This is a feature-specification exercise, not authorization to
ship chat, migrate a business vertical or invent privacy/retention/product policy. The
existing horizontal-foundation admission constraint in AGENTS.md remains applicable.

Represent intended, observed, proposed and unknown behavior explicitly. Do not infer
working behavior from a catalog entry, screen file, typecheck, mock, test title, tool
availability or another agent's summary. Inspect source files and retain source identifiers.
Document requirement origins and unresolved decisions. Acceptance of an agent handoff
means its bounded proposed output is usable by the next role, not product-owner approval.

The worked handoff must include:

- A structured analysis of every required dimension, with sourced applicability reasons.
- A proposed requirement, an invariant and a scenario with explicit acceptance criteria.
- A separate review explaining whether that bounded product output supports the handoff.
- A UX proposal consuming the exact reviewed versions, with screens, independent state
  axes, event transitions, guards, effects, feedback, recovery and motion requirements.
- Explicit missing runtime evidence, unavailable checkers and product decisions.

No production source edits, external messages, deployment or feature implementation are
part of this example. Any future implementation remains gated by its owning decisions,
architecture and evidence requirements.
