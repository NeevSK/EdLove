---
title: "Expo Orchestrator Agent Toolchain Architecture"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [adr, architecture, agents, mcp, orchestration, visual-editing, doppler]
---

# ADR: Expo Orchestrator Agent Toolchain Architecture

## Status

**Accepted** (Phase 0 of `current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md`).

## Context

The Polymath Platform runs a universal Expo SDK 57 app (`apps/gurudevi-mobile`,
React Native Web + mobile). The vision is an **app orchestrator**: agents build,
verify, and refine the app; humans refine visually on the running web build; and
durable multi-agent workflows coordinate feature work with human approval.

Existing assets that constrain the design:

- Agent tooling is partially present: `.agents/skills/expo-rn-expert`,
  `packages/platform-mcp`, `packages/rn-terrain-mcp`, Supabase MCP,
  Playwright, and `.agents/workflows/sovereign-quality-gate.md`.
- Secrets are centralized in Doppler (project `gurudevi-mobile`, configs
  `dev`/`stg`/`prd`) per
  `decisions/2026-08-09-doppler-secrets-management-adoption.md` and
  `infra/doppler-toolchain.md`.
- `inngest` is already a dependency and `EXPO_PUBLIC_INNGEST_EVENT_KEY` is
  already in the Doppler contract.
- Quality doctrine requires every change to pass the sovereign quality gate and
  never touch `android/`/`ios/` or bump sacred versions.

The core questions this ADR answers:

1. How do agents read/write the system safely (typed agent API surface)?
2. Which MCP servers are part of the standard toolchain, and how do secrets flow?
3. How is the visual point-and-edit loop built on the Expo web target?
4. How is durable multi-agent orchestration layered?

## Decision

### 1. Typed agent API surface (safe read/write for agents)

Adopt a **typed, validated, auth-scoped API surface** as the primary way agents
read/write the system. Reuse `@ts-rest/core` (already pinned) or the existing
Sanctuary API routing conventions. Every endpoint declares Zod-validated inputs
and enforces existing authorization policies (Cedar → entitlement gate order per
ADR-005/ADR-009). Agents are *discouraged* from editing files blindly; file edits
remain a fallback behind the sovereign quality gate.

Rationale: the running app — not ad-hoc file edits — is the source of truth that
agents see, control, and improve. A typed surface gives permission checks, audit,
and validation for free and composes with the device-control agent.

### 2. MCP toolchain and secrets

Standard agent toolchain = in-repo `platform-mcp` + `rn-terrain-mcp`,
Supabase MCP, the device-control agent, and **Doppler MCP (read-only, names-only
lookups)**. Provider credentials (model keys, EAS, Sentry, Cloudflare, Inngest)
live in Doppler configs and reach processes only through
`doppler run --no-fallback`. New secret names are registered in
`config/doppler-secrets.json`; private values are never placed in
`EXPO_PUBLIC_*`, `.env`, workflow YAML, or git.

Rationale: the Doppler adoption ADR already cites secure AI-agent secret access
as a benefit; names-only MCP access gives agents config-awareness without
exposing values. This preserves the fail-closed contract.

### 3. Visual editing loop on the Expo web target

**Primary: integrate an open-source visual editor** (evaluate Onlook, Layrr,
OpenPage against the Expo web build) for full-capability point-and-edit
(drag, restyle, rearrange, text edit) with changes mapping back to the real Expo
component tree.

**Decision gate:** adoption requires (a) edits map back to the actual
component/`packages/*` source — not a generated copy, and (b) it survives the
React Native Web / Metro DOM structure. If no OSS editor satisfies both,
**fallback: build a custom point-and-edit bridge** — click element → describe
change → agent edits the exact component, verified against the running build.

Rationale: OSS full-capability editing is the vision; the fallback guarantees we
never settle for a fragile editor that operates on detached generated code. The
choice is recorded in the implementation runbook.

### 4. Orchestration layering — Inngest (durable substrate) + Eve (reasoning loop)

Feasibility: **both is feasible and complementary.**

- **Inngest** owns *when and how reliably* steps run: scheduling, event-driven
  fan-out, retries, durable state, resumability across crashes.
- **Eve (Vercel AI SDK WorkflowAgent / AgentKit)** owns *what each step decides*:
  the planner → coder → tester → reviewer agent reasoning loops.
- **Composition:** an Inngest workflow step invokes an Eve agent; Eve returns a
  structured result; Inngest persists it and advances the workflow. Human
  approval is an explicit gate between generate → apply → ship.

Inngest already exists in the dependency graph; Eve is additive and stays
scoped to `packages/`-level agent code, never the app shell runtime. No single
agent runtime is embedded in the mobile app.

## Alternatives Considered

### A. No typed agent surface (agents edit files directly)
- **Pros:** no new code; already the default.
- **Cons:** no permission checks or audit; fragile against a moving codebase;
  contradicts the "running app is source of truth" model.
- **Rejected.**

### B. Custom visual editor only (no OSS evaluation)
- **Pros:** guaranteed mapping to Expo components; fully in-repo.
- **Cons:** significant build effort; reinvents mature editor features
  (drag/drop, resize handles, property panels).
- **Accepted as the documented fallback, not the primary.**

### C. Eve standalone (no Inngest)
- **Pros:** simpler; pure agent framework.
- **Cons:** no durable eventing/retry/fan-out for long-running workflows;
  workflows die with the process.
- **Rejected:** the plan requires durable multi-agent workflows with approvals.

### D. Inngest only (no Eve; Inngest calls models directly)
- **Pros:** minimal dependencies.
- **Cons:** hand-rolled agent loops lose the WorkflowAgent abstractions
  (tool-calling, sub-agent orchestration, checkpoints).
- **Rejected:** Eve/WorkflowAgent is the cleaner reasoning layer.

### E. Secrets ad hoc per tool (not Doppler)
- **Pros:** zero setup per tool.
- **Cons:** violates the existing Doppler ADR; secret sprawl; no audit.
- **Rejected:** all new tool credentials route through Doppler (§2 above).

## Consequences

### Positive

1. Agents get a safe, typed, auditable read/write surface instead of file hacking.
2. MCP + device-control closes the "generate but can't verify" gap.
3. OSS visual editing (or a documented fallback) delivers the dance layer.
4. Inngest + Eve compose without embedding a runtime in the app shell.
5. Secrets remain centralized, names-only-visible to agents, and fail-closed in CI.

### Negative

1. MCP inventory and device-control wiring is real integration work.
2. OSS editor evaluation may fail the mapping gate, forcing the custom bridge.
3. Eve adds packages and model-provider costs (keys via Doppler).
4. Inngest needs cloud setup (signing/API keys) for production workflows.

### Mitigations

- Phased delivery: foundation (P1) → tooling (P2) → visual (P3) → orchestration
  (P4) → ship (P5). Each phase has its own gate.
- The visual-editor decision gate (P3) has an explicit fallback so the loop
  always closes.
- All new secrets follow `docs/infra/doppler-toolchain.md`; `env:check:ci` runs
  before any workflow enables preview/production.

## References

- `docs/current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md` — implementing plan
- `docs/decisions/2026-08-09-doppler-secrets-management-adoption.md` — Doppler ADR
- `docs/infra/doppler-toolchain.md` — Doppler contract, CI, incident response
- `docs/infra/doppler-secrets-management-guide.md` — Doppler integration guide
- `docs/architecture/gurudevi-data-state-lifecycle.md` — gate order (Cedar → entitlement)
- `.agents/workflows/sovereign-quality-gate.md` — commit/quality protocol
- `AGENTS.md` — sacred versions + native guardrails

## Related Decisions

- `2026-08-09-doppler-secrets-management-adoption` — secret routing for every tool in this ADR.

## Review Schedule

- **3 months after implementation** — assess OSS editor adoption, orchestration
  durability, and agent API surface usage.
- **Annually** — strategic fit with the platform's agent strategy.

---

**Decision Date:** 2026-08-13
**Decision Maker:** Naveen
**Status:** Accepted and Active
