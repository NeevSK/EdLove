---
title: "Expo 57 Orchestrator — Production Setup Plan"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [expo, orchestrator, agents, mcp, visual-editing, inngest, eve, doppler, plan]
---

# Expo 57 Orchestrator — Production Setup Plan

Point-in-time implementation plan for turning the existing `apps/gurudevi-mobile`
(Expo SDK 57 universal app) into a production-grade **app orchestrator**: a single
codebase where AI agents generate, verify, and refine both mobile and web targets,
and where a human (or agent) can make visual point-and-edit changes against the
running web build without fragile rewrites.

This is a dated, point-in-time document. When this program is delivered, it moves
to `docs/current_progress/old_docs/` and the operational runbook becomes the
source of truth.

---

## 1. Context & Signal

The driving mental model (distilled from planning conversations):

1. **Foundation first, then generation, then dance.**
   - Foundational infrastructure (shell, state, auth, typed agent API surface,
     observability, design tokens, build/update pipeline, agent hooks) is the
     non-negotiable base.
   - One strong generation pass builds the real app on that foundation.
   - A "dance layer" (visual edits + agents on the running system) operates
     safely on top — the running Expo app is the source of truth that agents
     can see, control, and improve.
2. **Agents must be able to verify, not just generate.** Wire Expo Skills,
   Expo MCP, and a device-control agent so agents can tap, swipe, screenshot,
   read the React tree, and read logs on the running app.
3. **Close the visual loop on the web target.** Since Expo runs on web, layer a
   visual editor on the running web build; changes map back to the shared
   Expo/React Native codebase.
4. **Make the orchestrator actually orchestrate.** Durable multi-agent
   workflows (planner → coder → tester → reviewer) with human-in-the-loop
   approval, user-triggered feature requests, and (later) continuous
   self-improvement driven by logs/errors.
5. **Ship cheap.** EAS Build + EAS Update (OTA) + a web deploy path.

> Vertical slices are the wrong starting unit when the foundation is missing.
> This plan builds the foundation and the dance layer first, then adds vertical
> features on top of real infrastructure.

---

## 2. Target & Current-State Inventory

### 2.1 Target app

- **App:** `apps/gurudevi-mobile` — Expo SDK 57 (`expo ~57.0.12`), Expo Router,
  RN Web target (Metro), React Native Web, NativeWind 5 preview.
- **Web target:** `platform.gurudevi.edlove.org` (GitHub Pages via
  `.github/workflows/web-deploy.yml`, export from `dist/`).
- **Marketing site (out of scope):** `apps/gurudevi-marketingWeb` (Astro).

### 2.2 What already exists

| Capability | Status | Evidence |
|---|---|---|
| App shell & typed navigation | ✅ Exists | Expo Router, typed routes, layouts, deep links |
| Auth & identity | ✅ Exists | Supabase auth, device accounts, session handling |
| State & data layer | ✅ Exists | Zustand stores, TanStack Query, PowerSync/SQLite local-first |
| Observability | 🟡 Partial | Sentry + PostHog wired; agent-visible logs not yet defined |
| Design tokens & primitives | ✅ Exists | `@repo/ui` — branded components, motion tokens, layout helpers |
| Build & update pipeline | ✅ Exists | `eas.json` (development/preview/production), EAS Update URL |
| Web deploy | ✅ Exists | GitHub Pages workflow (`web-deploy.yml`) |
| Expo skills | 🟡 Partial | `.agents/skills/expo-rn-expert` — but documents **SDK 56**, must update to 57 |
| MCP servers | 🟡 Partial | `packages/platform-mcp`, `packages/rn-terrain-mcp`, Supabase MCP |
| Device-control agent | ❌ Gap | No agent-device / Argent integration |
| Visual point-and-edit | ❌ Gap | No editor wired to the web build |
| Durable orchestration | ❌ Gap | Inngest present as a dependency; no workflows |
| Typed agent API surface | ❌ Gap | No clean read/write contract for agents |
| Doppler secrets | ✅ Exists | Project `gurudevi-mobile`, `dev`/`stg`/`prd`, contract in `config/doppler-secrets.json` |
| GitHub Environments | ❌ Gap | `development` / `preview` / `production` not yet created |

### 2.3 Guardrails that MUST be respected (from AGENTS.md)

- **Never** run `expo install --fix` or `--check` (breaks intentional new-arch pins).
- **Never** edit files inside `android/` or `ios/` directly — config via
  `app.json` plugins + `plugins/*.js`.
- **Never** remove version exclusions or bump sacred versions without explicit
  approval (RNGH 3.0.2, Reanimated 4.5.0, worklets 0.11.1, mmkv 4.3.2,
  nitro-modules 0.36.1, Skia 2.6.5, TypeScript 7.0.2).
- After any dependency change: `pnpm run stack-map:bootstrap` → review → `pnpm run stack-map`.
- Pass the sovereign quality gate before any commit (`.agents/workflows/sovereign-quality-gate.md`).

---

## 3. Secrets Contract — "Go Through My SecOps Doppler"

Every tool or service introduced by this plan that needs a credential or
provider token MUST route through the existing Doppler setup. Contract
(`config/doppler-secrets.json` + `docs/infra/doppler-toolchain.md`):

1. **Names-only contract.** New secret names are registered in
   `config/doppler-secrets.json` under `required` / `optional` per scope.
   Values are never committed; `pnpm run env:check` and `pnpm run audit:secrets`
   verify names only.
2. **Runtime injection.** All app/API/CI commands run under
   `doppler run --no-fallback -- <cmd>`. No `.env` fallback in CI.
3. **Provider credentials live in Doppler configs, not workflow YAML.** EAS,
   Sentry, Cloudflare, Inngest, model-provider keys (OpenAI/Anthropic), etc.
   go into the matching Doppler config.
4. **Environment mapping.** Local = `dev`; PR/CI checks = `dev` (GitHub
   environment `development`); preview/QA = `stg` (GitHub `preview`);
   production = `prd` (GitHub `production`). One read-only scoped service token
   per config stored as `DOPPLER_TOKEN` in the matching GitHub Environment.
5. **Public Expo config** may be bundled (`EXPO_PUBLIC_*`) but is still managed
   and promoted through Doppler. **Private credentials are never** placed in
   `EXPO_PUBLIC_*`, app code, `.env`, workflow YAML, or source control.
6. **Fail-closed.** `stg` and `prd` must be populated with environment-specific
   values before preview/production workflows are enabled. Do not copy dev
   credentials into them.
7. **Incident response.** Exposed secret → stop workflow, rotate in Doppler,
   revoke provider credential, review access logs, rerun names-only check.

### 3.1 Secrets that Phase 4 (orchestration) adds

| Secret | Scope | Notes |
|---|---|---|
| `EXPO_PUBLIC_INNGEST_EVENT_KEY` | mobile (already optional) | Present in contract |
| `INNGEST_SIGNING_KEY` | api | Signing key for Inngest events |
| `INNGEST_API_KEY` | api/ci | Inngest cloud API access |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | api (already optional) | Model providers for Eve agents |
| `EXPO_TOKEN` | ci (already optional) | EAS builds from CI |

Register any new names before the related phase starts. Keep names stable
across `dev` / `stg` / `prd` so code promotes unchanged.

---

## 4. Phases

Each phase lists: **Goal**, **Tasks**, **Acceptance criteria**, **Gate** (the
quality checks that must pass before the phase is considered done).

### Phase 0 — Docs & Contracts (this session)

**Goal:** Freeze the plan, record the architecture decisions, and make the
operational runbook discoverable.

- [ ] Write this plan (`docs/current_progress/2026-08-13-expo-orchestrator-production-setup-plan.md`).
- [ ] Write the ADR (`docs/decisions/2026-08-13-expo-orchestrator-agent-toolchain-adr.md`).
- [ ] Update `docs/INDEX.md` (entries + changelog).
- [ ] Confirm the guardrail set above is referenced by every subsequent phase.

**Acceptance:** Both docs committed per docs-sop; INDEX updated.

### Phase 1 — Foundation Hard Contracts

**Goal:** Close the two real foundation gaps (typed agent API surface,
agent-visible observability) and document the ownership map so the dance layer
never hacks files blindly.

- [x] **Typed agent API surface.** Define a clean, typed read/write contract for
      agents (routes, Zod-validated inputs, auth-scoped permissions) so agents
      can read/write the system safely instead of editing files blindly.
      Reuse `@ts-rest/core` (already pinned) or a typed router; follow the
      existing Sanctuary API patterns. Do NOT build a parallel ad-hoc system.
      *Implemented v1: `packages/core/src/api/agent.contract.ts` +
      `apps/sanctuary-api/src/core/handlers/agent.ts` + typed client
      (`agentAPI.getSystemStatus()`, `POST /api/agent/getSystemStatus`),
      gated by `doubleGateMiddleware` (anonymous → FORBIDDEN, then Cedar
      `guest/personal.cedar` read-own-User). Tests in
      `apps/sanctuary-api/src/__tests__/agent.orpc.test.ts` (passing).*
- [x] **State/data ownership map.** Document where the source of truth lives per
      domain (Zustand slice vs. TanStack Query vs. PowerSync table) so agents
      target the right layer.
      *Delivered: `docs/Core/data-state-ownership-map.md` (six storage layers,
      per-domain source-of-truth table, agent read/write rules, known
      anti-patterns).*
- [x] **Agent-visible observability.** Define a log/event contract (Sentry breadcrumbs,
      structured logs, PostHog events) that agents and humans can query when the
      app misbehaves. Keep it consistent with `scripts/check-observability-boundaries.mjs`.
      *Delivered: `docs/Core/agent-observability-contract.md` (signal-by-destination,
      single-line-JSON log contract, correlation flow, agent rules).*
- [x] **Auth gate audit.** Confirm auth gates and deep links are deterministic
      and testable so the device-control agent can log in and drive flows.
      *Delivered: `apps/gurudevi-mobile/docs/architecture/2026-08-13-auth-gate-deeplink-audit.md`
      — auth gates are deterministic pure functions (TOBAC guard in root
      `_layout.tsx`); dev fast-track gives deterministic login. Audit found
      **DeepLinkProvider never mounted** (magic-link callback + classroom
      invites dead on native) — **fixed 2026-08-13**: mounted in root
      `_layout.tsx` inside `GlobalProvider`. No iOS universal links yet
      (scheme-only on iOS). Agent should use dev fast-track for login.*
**Gate:** `pnpm run lint && pnpm run check-types && pnpm run test && pnpm run audit:secrets`.

### Phase 2 — Agent Tooling & MCP

**Goal:** Any coding agent (opencode, Claude Code, Codex, Cursor) can build AND
verify against this repo.

- [x] **Update `expo-rn-expert`** (`.agents/skills/expo-rn-expert/skill.md`) from
      SDK 56 to SDK 57 facts (EAS, Router, native modules) — it is currently stale.
      *Done 2026-08-13: SDK 57/RN 0.86/New-Arch stack facts, sacred pins, EAS
      profiles, deep-link provider tree, Nitro/Reanimated 4 native guidance,
      build/verify commands.*
- [ ] **MCP inventory + wiring.** Formalize which MCP servers are available to
      agents and where they are registered:
      - `packages/platform-mcp` (in-repo; audit/help/document/discovery)
      - `packages/rn-terrain-mcp` (RN native terrain)
      - Supabase MCP (`mcp:supabase:debug` script exists; `@supabase/mcp-server-supabase` dep present)
      - **Doppler MCP** for secret-name lookups (ADR already cites AI-agent secret
        access as a Doppler benefit). Read-only; never surfaces values.
- [ ] **Device-control agent.** Integrate a device-control agent (agent-device or
      Argent-class tooling) so agents can tap, swipe, screenshot, read the React
      tree, open deep links, and check logs against the running Expo app
      (web + dev client).
- [ ] **Verification workflow.** Standardize "generate → build → verify on
      device/web → report" so agents close their own loop.

**Acceptance:** MCP servers discoverable by agents; device-control works on web
and dev client; verification workflow documented.
**Gate:** `pnpm run lint && pnpm run check-types && pnpm run audit:secrets &&
pnpm run stack-map` (after any dep change).

### Phase 3 — Visual Editing Loop (OSS primary, custom fallback)

**Goal:** Close the visual loop on the running Expo web build — full-capability
point-and-edit, not just drag-and-drop of small things.

- [ ] **Evaluate OSS visual editors** against the Expo web build
      (`pnpm --filter gurudevi-mobile web`):
      - **Onlook** (Next.js + Tailwind focus — assess fit with Expo Router/NativeWind)
      - **Layrr** (point-click-edit any existing site; MIT)
      - **OpenPage** (JSON-first, self-hosted, structured-edit API)
      - Success criteria: can it map DOM edits back to the actual Expo component
        (not a generated copy)? Does it survive Metro/RNGW rendering?
- [ ] **Decision gate.** If an OSS editor maps back to the real codebase and
      survives RNGW DOM structure → adopt it as primary (record in ADR). If it
      cannot (falls back to generated copies or fights Metro) → build the
      **custom point-and-edit bridge**: click element → describe change →
      agent edits the exact Expo component, verified against the running build.
- [ ] **Dance workflow.** Wire the chosen editor to the running web target so
      changes land back in `apps/gurudevi-mobile` + `packages/*`.

**Acceptance:** A working "edit live on web → change maps to repo" loop with a
documented choice in the ADR.
**Gate:** manual demo + `pnpm run lint && pnpm run check-types`.

### Phase 4 — Orchestration (Inngest + Eve)

**Goal:** Durable multi-agent workflows with human-in-the-loop approval.

- [ ] **Inngest = durable substrate.** Durable eventing, scheduling, fan-out,
      retries, resumability for workflow steps. Uses the existing
      `EXPO_PUBLIC_INNGEST_EVENT_KEY`; add `INNGEST_SIGNING_KEY` / `INNGEST_API_KEY`
      to Doppler (`api` scope) per §3.1.
- [ ] **Eve (Vercel AI SDK WorkflowAgent / AgentKit) = reasoning loop.** The
      planner → coder → tester → reviewer agent loops. Eve agents execute
      **inside Inngest steps**, so the workflow survives crashes and resumes.
- [ ] **Layering (feasibility confirmed).** Inngest owns *when and how reliably*
      steps run; Eve owns *what each step decides*. They compose: an Inngest
      workflow step invokes an Eve agent; Eve returns a structured result;
      Inngest persists it and advances the workflow.
- [ ] **Human-in-the-loop gates.** Approval steps between generate → apply →
      ship so agents propose changes and the user accepts/rejects them.
- [ ] **User-triggered features.** A route/UI that spins up a feature workflow
      from a prompt (via the typed agent API surface from Phase 1).
- [ ] **Post-MVP (record as backlog, do not implement now):** continuous
      self-improvement — agents watch logs/errors and open PRs.

**Acceptance:** A runnable planner→coder→tester→reviewer workflow executes
through Inngest, with Eve agents inside steps and an approval gate; secrets come
from Doppler.
**Gate:** `pnpm run lint && pnpm run check-types && pnpm run test && pnpm run audit:secrets`.

### Phase 5 — Ship Pipeline

**Goal:** "Ship a change" is cheap and safe on mobile (OTA) and web.

- [ ] **GitHub Environments.** Create `development`, `preview`, `production`;
      add read-only scoped `DOPPLER_TOKEN` to each; require approval and restrict
      branches for `production`.
- [ ] **Populate `stg` and `prd` Doppler configs** with environment-specific
      values. Run `pnpm run env:check:ci` (names-only) before enabling workflows.
- [ ] **EAS Build + EAS Update (OTA).** Keep existing `eas.json` profiles; ensure
      EAS Update is the over-the-air path for JS-only changes.
- [ ] **Web deploy contract.** Keep GitHub Pages (`web-deploy.yml`) as today;
      record EAS Hosting / Vercel / Cloudflare Pages as candidates. Decision to
      be recorded in the runbook, not this plan.
- [ ] **CI workflow updates.** All build/test/deploy commands run under
      `doppler run -p gurudevi-mobile -c <config> -- ...`; provider creds come
      from Doppler configs, never workflow YAML.

**Acceptance:** Preview + production workflows exist and are fail-closed on
missing config; OTA path verified on a physical device (per AGENTS.md);
web deploy verified.
**Gate:** `pnpm run check-all` + manual release rehearsal.

### Phase 6 — Verification, Observability & Handoff

- [ ] End-to-end rehearsal of the dance layer (visual edit + agent proposal +
      approval + ship).
- [ ] Quality gates per phase documented in the runbook; `check-all` green.
- [ ] Move this plan to `old_docs/` and promote the operational runbook to the
      source of truth.
- [ ] Update `docs/INDEX.md` changelog for the final state.

**Acceptance:** This plan is superseded by a runbook; the loop
"prompt → agent builds/tests → visually adjust → ship update" is operational.

---

## 5. Risk Register

| Risk | Mitigation |
|---|---|
| OSS visual editor can't map back to Expo/RNGW components | Phase 3 decision gate with explicit fallback (custom bridge); ADR records choice |
| Eve agents add heavy dependency surface | Eve runs only inside Inngest steps; keep agent code in `packages/ai`-style packages; no global agent runtime in the app shell |
| Inngest/Eve key exposure | Secrets via Doppler only (§3.1), never `EXPO_PUBLIC_*` for private keys |
| `stg`/`prd` left as metadata → prod workflow silently broken | Fail-closed workflows; `env:check:ci` runs before any build/deploy |
| Version drift (expo-doctor flags pinned packages) | Never `expo install --fix`; exclusions in `package.json` stay; sacred versions untouched |
| Web build churn from the dance layer | All edits land in repo + pass `lint`/`check-types`; visual tool never writes `dist/` directly |
| Scope creep (self-improvement, multi-app orchestration) | Explicitly backlogged post-MVP |

---

## 6. Success Metrics

- An agent can build a feature, verify it on web + dev client, and report
  evidence — without hand-holding.
- A human can make a visual change on the running web build that maps back to
  the real Expo component tree.
- A planner→coder→tester→reviewer workflow runs durably through Inngest with
  Eve agents and an approval gate.
- OTA update + web deploy are push-button; secrets are never in CI YAML or git.
- All phases pass the sovereign quality gate; no sacred versions changed;
  stack-map regenerated after any dependency change.

---

## 7. References

- `docs/docs-sop.md` — documentation standards (this file complies)
- `docs/infra/doppler-toolchain.md` — Doppler contract / CI / incident response
- `docs/infra/doppler-secrets-management-guide.md` — Doppler integration guide
- `docs/decisions/2026-08-09-doppler-secrets-management-adoption.md` — Doppler ADR
- `docs/decisions/2026-08-13-expo-orchestrator-agent-toolchain-adr.md` — this plan's ADR
- `docs/infra/production-readiness-program.md` — cross-platform readiness checklist
- `apps/gurudevi-mobile/docs/web/WEB_GUIDE.md` — web architecture
- `AGENTS.md` — sacred versions + native guardrails
- `.agents/workflows/sovereign-quality-gate.md` — commit/quality protocol

---

*Last updated: 2026-08-13 — Phase 1 complete (typed agent API surface, ownership map,
observability contract, auth gate audit + education authz fix). Ready for Phase 2.*
