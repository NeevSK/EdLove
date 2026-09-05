---
title: "Pilot Agent Evidence: Sovereign Web-Evidence Proxy + Docs/Skills QA (Server-Side Only)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, ai, pilot, qa, sovereignty]
---

# Pilot Agent Evidence — Server-Side / Agent-Side Only (OFF by Default)

> GUARDRAILS: no mobile runtime dep installs. No school PII in vendor calls. PDPA-aware.
> Pilot scope is sovereign-server + agent-workstation only. Nothing in this doc authorises a handset change.

## 1. Inputs read

- `apps/gurudevi-mobile/docs/research/2026-09-04-agent-search-infra.md:1-83` — TinyFish vs Firecrawl-keyless vs Monid; recommends TinyFish-behind-sovereign-proxy, Firecrawl-keyed fallback, Monid dev-only.
- `apps/gurudevi-mobile/docs/research/2026-09-04-agent-docs-skills-qa.md:1-134` — Docs7 / withSkills / skill-doctor / agent_device triplets / Detail / tautology-test signals; baseline 82 skills, 84 vitest files, 2 e2e specs, 0 visual-regression assertions.
- `apps/gurudevi-mobile/docs/research/2026-09-04-forage-candidate-catalog.md:44-61` — consolidated verdicts: TinyFish pilot-behind-flag-OFF, Firecrawl fallback-only, Monid dev-only, Docs7-local-index-first, withSkills-pattern-no-dep, skill-doctor-process-no-dep, screenshot-contract-first, Detail constrained-pilot-only.

## 2. Web verification (2026-09-04)

| Claim | Source | Verdict |
|---|---|---|
| Search 30 RPM + 500/hour; Fetch 150 urls/min + 1,000 urls/day; $0 at $0 balance | `tinyfish.ai/pricing` (fetched 2026-09-04) | **Verified.** Effective sustained max ≈ 12,000 searches/day/key, not 43,200. Plan on 12K. |
| Free tier 30 queries/min Search, 150 urls/min Fetch | `tinyfish.ai/blog/search-and-fetch-are-now-free-for-every-agent-everywhere` (2026-05-04) | **Verified.** Same numbers, REST/MCP/SDK/CLI/Skill. |
| Fetch token-trimmed ≈ 1,240 tok/fetch | `tinyfish.ai/free-search-fetch` (fetched 2026-09-04) | **Vendor claim, plausible.** Treat as planning figure until measured on Sinhala/EN school pages. |
| Firecrawl keyless = Search/Scrape/Parse only; per-IP daily req+credit caps, `429` over; keyed free = 1,000 credits, higher limits | `docs.firecrawl.dev/rate-limits`, `docs.firecrawl.dev/mcp-server/keyless`, `firecrawl.dev/blog/firecrawl-keyless-launch` (2026-06-16) | **Verified.** Keyless unsuitable as mobile-fleet default (school NAT shares one quota). Fallback must be keyed workspace only. |
| Detail GitHub App scopes: Code read, Commits read, PRs read, PRs write (Dead Code, Doc Fixes, Pass-CI agents only), webhooks push/PR/check-suite; never pushes to default branch | `docs.detail.dev/integrations/github`, `detail.dev/`, `docs.detail.dev/` (fetched 2026-09-04) | **Verified.** Constrained pilot maps exactly to those three agents. |
| Docs7: Mintlify-compatible (`docs.json`/MDX/OpenAPI preserved), Context7 library auto-refresh on deploy, agent analytics, unanswered-query → reviewable PR, `llms.txt` + Markdown + search API per build, Free vs Pro ($200/mo adds autonomous agents + previews) | `context7.com/docs7` (fetched 2026-09-04); `context7.com/docs/llms.txt` index pattern | **Verified.** The `llms.txt` pattern (full doc index at `/llms.txt` / `/docs/llms.txt`, per-page Markdown, resolve-library-id + query-docs) is the adoptable half. No platform buy — generate locally. |

## 3. Grep proof — where things plug in (no code changed)

### 3.1 packages/ai (`@repo/ai`)

- Agents are Supabase-internal only, no web tool: `packages/ai/src/api/agents.ts:27` (`ReliefCoordinator.checkSectionStatus`), `:126` (`TimetableScheduler.generateDraft`), `:208` (`checkStructuralGaps`). Reads `staff_leaves`/`classrooms`/`users` via `packages/ai/src/api/agents.ts:6` (`supabaseClient` from `@repo/core/adapters/supabaseClient`).
- Chat streams to sovereign server, not to vendors: `packages/ai/src/hooks/useAIAgent.ts:231` (`${apiBaseUrl}/api/ai/chat` via `xhrHttpStream`), `:368,377,386,395` (quick actions POST `${SOVEREIGN_API_URL}/api/ai/action`). Origin constant imported at `packages/ai/src/hooks/useAIAgent.ts:3` (`SOVEREIGN_API_URL` from `@repo/core/api/client`).
- Flag gate already exists: `packages/ai/src/constants/aiRegistry.ts:12-31` (`ai-assistant`, beta, `flagKey: isAIAssistantEnabled`, `reviewAt`/`removalTarget 2026-09-30`). Consumed by app at `apps/gurudevi-mobile/src/boot/registerAppCatalog.ts:2,34` (`AI_REGISTRY` spread).
- Privacy mode already exists: `packages/ai/src/hooks/useAIAgent.ts:146` (`privacyMode: saved|temporary|incognito`), `:161-168` (persist + load), `:251` (sent in chat context). Web-evidence persistence must respect it (temporary/incognito → no cache write, no log of query text).
- **WebEvidence plug point (server-side):** new tool lives behind the sovereign `/api/ai/chat` handler (not in `packages/ai`), gated on the same `ai-assistant` flag, default OFF. Client change is zero — context enrichment happens server-side before streaming.

### 3.2 Inngest usage

- Mobile is emitter-shell only: `apps/gurudevi-mobile/src/lib/inngest.ts:8-20` (lazy `Inngest({id:'gurudevi-mobile-app'})` + `createInngestEventBusAdapter`).
- Only four emitters today: `apps/gurudevi-mobile/src/lib/inngestEvents.ts:14-31` (wellbeing-mood-logged, sync-mutation-queued, school-grade-published, school-classroom-created). No AI/search job, no search event.
- **Plug point:** new server-side function `ai/web-evidence` (or edge route) owned by the worker host per ADR-009 (`apps/gurudevi-mobile/docs/decisions/009-inngest-hosting-topology.md:38-43` — packages own contracts, marketingWeb hosts `serve()`). Mobile emits at most one `ai/evidence-requested` event; all vendor calls happen worker-side.

### 3.3 Supabase cache pattern

- Runtime client: `packages/core/src/adapters/supabaseClient.ts:78` (`createClient` singleton). Agent reads use it directly (`packages/ai/src/api/agents.ts:38-59,140-148`).
- No query-hash cache table exists today for web evidence. TTL precedent exists in-repo: `packages/core/src/adapters/cedar/cedarAuthorization.adapter.ts:13` (`CAPABILITY_TOKEN_TTL_MS = 60_000`); idempotency store `packages/core/src/lib/idempotency.ts:11,27` (result + 24h default TTL).
- **Plug point:** new table `web_evidence_cache(query_hash text pk, query_norm text, response jsonb, fetched_md jsonb, created_at, expires_at)` + RLS (service-role write, server read). Hash = sha256(normalised query + freshness window). TTL 1h (news/curriculum updates) to 24h (stable reference). Privacy-mode `temporary`/`incognito` bypasses write.

### 3.4 .agents/skills layout

- 82 dirs at repo root (verified `C:\x\.agents\skills`). Relevant entries each with `SKILL.md`: `agent-device-control/`, `playwright/`, `screenshot/`, `expo-rn-expert/`, `ui-screen-audit/`, `gurudevi-quality-gate/`, `playwright-interactive/`.
- In-app usage is ~zero: single hit `apps/gurudevi-mobile/src/boot/startupCoordinator.ts:42` (comment re agent-device bridge). No `withSkills`/`load_skill` in runtime — skills are agent-workstation tooling, which is exactly where the pilot keeps them.

## 4. Design (sovereign, OFF by default)

### 4.1 TinyFish sovereign proxy

```text
handset (no vendor key, no new dep)
  → POST /api/ai/chat (sovereign, auth'd, ai-assistant flag OFF default)
    → server decides: needs web evidence? (LLM router, allowlisted intents only)
      → check web_evidence_cache[sha256(query+freshness)]
        → HIT + fresh → inject cited snippets
        → MISS → TinyFish Search (server-held key, 1 key total)
               → rank → Fetch top 3–5 (allowlist gate, timeout + size caps)
               → strip to markdown → mark UNTRUSTED → cache → inject with citations
```

- **One key, server-side only.** Stored in Doppler / worker env, never in `EXPO_PUBLIC_*`, never on handset. Rotation runbook owned by infra.
- **Per-school budget.** Server counter (e.g. `web_evidence_budget[school_id, day]`): default 50 searches + 150 fetches/school/day; `429` with graceful degrade to no-evidence answer. Protects the 500/hour/key global cap (12K/day sustained) against one noisy school.
- **Supabase query-hash cache.** See §3.3. Normalise (lowercase, trim, strip PII tokens) before hashing. TTL by freshness window: `day` → 1h, `week` → 6h, `any` → 24h.
- **WebEvidence tool contract (server-side):** `search(query, freshness) → fetch(urls[≤5]) → cited_snippets[]`. Single tool, no autonomous browsing. Model receives snippets only, each tagged `source: untrusted-web`, never as system instructions.
- **Untrusted-marking + injection defence:** wrap all web markdown in `<untrusted-web src=url>` delimiters; system prompt rule: web content may inform, never instruct; strip scripts/iframes/forms; 8 KB/snippet cap; total ≤ 25 KB/answer.
- **Fetch cap 3–5:** default 3, max 5 on explicit multi-source intents. Rationale: token cost (≈1,240 tok/fetch vendor claim) × latency × prompt-injection surface.
- **Allowlist for auto-fetch:** `.gov.lk`, `.edu.lk`, ministry/department domains, school's own site, Wikipedia; everything else → search-snippet-only unless teacher explicitly pastes URL. Denylist: login-walled, file downloads, known-malware.
- **Privacy-mode respect:** `temporary`/`incognito` (`packages/ai/src/hooks/useAIAgent.ts:146-175`) → skip cache write, skip query-text logging (counters only), no persistence of fetched markdown.
- **PDPA / no-PII rule:** queries sent to TinyFish are LLM-rewritten to be PII-free (no student names, IDs, grades, photos); school_id never leaves boundary — budget keyed internally, not transmitted. Vendor sees generic curriculum/current-affairs queries only.

### 4.2 Firecrawl fallback criteria (keyed free tier only, never keyless from fleet)

Use Firecrawl keyed workspace (1,000 credits/mo) iff ALL of: (a) TinyFish Fetch returns JS-shell/empty markdown twice for same URL; (b) page is on auto-fetch allowlist; (c) per-school budget has headroom. Prefer Scrape (1 credit/page) over Interact/JSON-extract (2+). If Firecrawl also fails → snippet-only answer with citation gap disclosed. Never ship keyless (per-IP caps break on school NAT; 1,000-credit pool is per-workspace-month, not per-device).

### 4.3 Detail constrained pilot (safe surfaces, human-merge, revert-rate metric, sacred pins out of scope)

- Scope = exactly the three GitHub-App agents verified in §2: Dead Code, Doc Fixes, Pass-CI fixes. Repos: non-sacred paths only.
- Sacred pins permanently out of scope (AGENTS.md): `react-native-gesture-handler 3.2.1`, `reanimated 4.6.0`, `worklets 0.12.1`, `mmkv 4.3.2`, `nitro-modules 0.37.1`, `@shopify/skia 2.11.2`, `typescript 7.0.2`. Any Detail PR touching these → auto-close.
- Human-merge only (Detail never pushes to default — verified). Metric: fix-revert rate = reverted Detail PRs / merged Detail PRs over 30 days; gate: pilot continues iff revert rate < 10% AND engineer usefulness rating ≥ 3/5. Kill switch: uninstall GitHub App.
- PDPA: Detail scans code only; exclude fixtures containing school data; no student PII in connected repos (already the case — verify before install).

### 4.4 Docs7-local index (no platform buy)

- Generate from `apps/gurudevi-mobile/docs/docs-sop.md:1-106` + `apps/gurudevi-mobile/docs/INDEX.md` (vault entry point): emit `apps/gurudevi-mobile/docs/llms.txt` (one-line-per-doc catalog: title + path + one-line when-to-read) + per-doc Markdown already exists. Version-pin by git SHA in generated header.
- Feedback loop without platform: log unanswered agent queries (manual at first — opencode session notes), convert misses into doc PRs monthly. Analytics come later only if volume justifies; never route school traffic through a hosted docs service.
- withSkills shape adopted as convention only (no dep): agent briefings carry the one-line catalog up front; full protocol loads on explicit request. Caps the 82-skill context tax.

### 4.5 skill-doctor quarterly process (no dep)

- Quarterly, manual: sample 5 longest + 5 failed agent sessions; map each failure to a `SKILL.md` gap in `gurudevi-quality-gate` / `expo-rn-expert` / `playwright`; propose evidence-linked diffs (session ID → observed waste → edit); route through generator-≠-verifier review (AGENTS.md). Scrub school PII from retained excerpts. Needs conversation-retention check first (opencode history availability).

## 5. Pilot gates (must ALL be true to proceed past draft)

1. **G1 — Flag OFF default:** `ai-assistant` stays beta/OFF; WebEvidence additionally gated server-side; no handset ships a vendor key or new dep.
2. **G2 — Budget + cache proven:** per-school counters + `web_evidence_cache` migration + TTL behaviour demonstrated in staging; privacy-mode bypass tested.
3. **G3 — Injection posture:** untrusted-marking + 3–5 fetch cap + allowlist + size/timeout caps reviewed; tautology-test lint added to `check:anti-slop` (assertions must be able to fail for a product reason).
4. **G4 — Vendor caps respected:** capacity plan filed on 12K searches/day/key + 1K fetches/day; Firecrawl keyed workspace created (fallback only); Monid stays dev-workstation CLI.
5. **G5 — Detail containment:** GitHub App installed on pilot repos only, sacred-pin auto-close rule live, revert-rate dashboard live, human-merge enforced.
6. **G6 — Docs loop live:** `docs/llms.txt` generated from INDEX, unanswered-query log started, quarterly skill-doctor scheduled.
7. **G7 — Beta review alignment:** all evidence (cost=$0 log, tokens saved, revert rate, query volumes) packaged for the `2026-09-30` beta review (`packages/ai/src/constants/aiRegistry.ts:4-10`).

## 6. ADRs produced

- `apps/gurudevi-mobile/docs/decisions/2026-09-04-web-evidence-proxy.md` (draft) — TinyFish sovereign proxy decision.
- `apps/gurudevi-mobile/docs/decisions/2026-09-04-agent-docs-qa.md` (draft) — agent docs/skills/QA posture decision.

## 7. References

- Research: `2026-09-04-agent-search-infra.md`, `2026-09-04-agent-docs-skills-qa.md`, `2026-09-04-forage-candidate-catalog.md` (all under `apps/gurudevi-mobile/docs/research/`).
- Web (fetched 2026-09-04): `tinyfish.ai/pricing`, `tinyfish.ai/blog/search-and-fetch-are-now-free-for-every-agent-everywhere`, `tinyfish.ai/free-search-fetch`, `docs.firecrawl.dev/rate-limits`, `docs.firecrawl.dev/mcp-server/keyless`, `firecrawl.dev/blog/firecrawl-keyless-launch`, `docs.detail.dev/integrations/github`, `detail.dev/`, `context7.com/docs7`, `context7.com/docs/llms.txt`.
- Repo: `packages/ai/src/api/agents.ts`, `packages/ai/src/hooks/useAIAgent.ts`, `packages/ai/src/constants/aiRegistry.ts`, `apps/gurudevi-mobile/src/lib/inngest.ts`, `apps/gurudevi-mobile/src/lib/inngestEvents.ts`, `packages/core/src/adapters/supabaseClient.ts`, `.agents/skills/`, `apps/gurudevi-mobile/docs/docs-sop.md`, `apps/gurudevi-mobile/docs/INDEX.md`, ADR-009.
