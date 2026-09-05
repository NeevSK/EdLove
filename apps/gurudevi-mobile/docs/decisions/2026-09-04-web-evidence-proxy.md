---
title: "ADR: Sovereign Web-Evidence Proxy (TinyFish Pilot, Firecrawl Fallback)"
status: "deferred"
created: 2026-09-04
updated: 2026-09-05
author: "Naveen"
scribe: "opencode"
tags: [adr, ai, search, sovereignty, pilot]
---

# ADR: Sovereign Web-Evidence Proxy (TinyFish Pilot, Firecrawl Fallback) (deferred — 2026-09-05)

## Status

**Deferred** — no VPS/managed service available to run the sovereign proxy. Revisit when infrastructure is available.

## Date

2026-09-05 (updated from 2026-09-04 accepted)

## Context

`@repo/ai` agents (`packages/ai/src/api/agents.ts:27,126` — `ReliefCoordinator`, `TimetableScheduler`) read Supabase only. Chat streams to `${SOVEREIGN_API_URL}/api/ai/chat` (`packages/ai/src/hooks/useAIAgent.ts:231`) with no live web evidence. Research (`../research/2026-09-04-agent-search-infra.md`) verified: TinyFish Search+Fetch free per request within caps (Search 30 RPM + 500/hour; Fetch 150/min + 1,000/day — `tinyfish.ai/pricing`, fetched 2026-09-04); Firecrawl keyless capped per-IP/day with `429` over (`docs.firecrawl.dev/rate-limits`); keyless unsuitable for school-NAT fleets.

GUARDRAILS: server-side/agent-side only. No mobile runtime dep installs. No school PII in vendor calls. PDPA-aware.

## Decision

**Deferred** — the sovereign server-side proxy architecture is sound but requires a VPS/managed service to host the inngest worker/Hono endpoint. Without infrastructure to run the proxy (no VPS, no managed service), the pilot cannot proceed.

When infrastructure is available:
- Pilot a **sovereign server-side proxy** holding **one TinyFish key**
- Mobile emits at most `ai/evidence-requested`; all vendor calls run worker-side
- New server-side `WebEvidence` tool (`search` → `fetch` ≤5) injects cited snippets into `/api/ai/chat` context only. Default **OFF**, additionally gated behind existing `ai-assistant` beta flag
- Per-school daily budget (default 50 searches + 150 fetches) + Supabase `web_evidence_cache` (query-hash → JSONB, TTL 1–24h) + privacy-mode bypass
- Untrusted-marking (`<untrusted-web>` wrap), 3–5 fetch cap, 8 KB/snippet + 25 KB/answer caps, school-domain allowlist, PII-free rewritten queries
- **Firecrawl keyed free workspace (1,000 credits/mo) as fallback only** when TinyFish Fetch twice returns JS-shell/empty on an allowlisted URL with budget headroom. Never keyless from fleet.

## Alternatives considered

- Firecrawl keyless from handset — rejected: per-IP quota shared across school NAT, 1,000-credit pool throttles whole building.
- Monid as runtime — rejected: TinyFish-backed broker, extra hop, CLI-first; dev-workstation only.
- Incumbent paid (Tavily/Exa/Brave) now — deferred: revisit at beta review if sustained usage exceeds ~12K searches/day/key or needs SLA/SERP features.

## Consequences (if implemented)

- Good: $0 unit cost, fleet-safe quotas, PII stays in boundary, zero handset deps, reversible (flag + uninstall key).
- Bad: queries leave device boundary (retention terms must be tracked); free tier has no SLA and caps can change (cf. Brave Feb-2026 precedent); prompt-injection surface requires the §untrusted posture permanently.
- Capacity plan: 12,000 searches/day/key sustained (not 43,200), 1,000 fetches/day.

## Revisit trigger

When VPS/managed service is available (self-hosted or cloud), re-open this ADR and run the pilot gates (G1–G7 in `../research/2026-09-04-pilot-agent-evidence.md` §5).

## Rollout / reversibility

Staging-only proxy → single pilot school → beta review. Reverse by disabling flag, deleting server key, dropping cache table reads (retain migration). No client release required either direction.

## Implementation Evidence (2026-09-04)

- **Feature flag:** `isWebEvidenceEnabled` (placeholder) to be added; gated behind `ai-assistant` beta flag
- **No mobile runtime deps added** — all proxy logic server-side (inngest worker / Hono endpoint)
- **TypeScript:** ✅ passes (no new mobile code)
- **Style-stack gate:** ✅ verify:style-stack passes
