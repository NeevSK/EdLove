---
title: "Agent Search Infra: Firecrawl Keyless vs TinyFish vs Monid for Gurudevi Mobile"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [research, ai, search]
---

# Agent Search Infra — Research (2026-09-04)

Theme: `ai-agent-search-infra`. Question: should Gurudevi Mobile give its AI agents live web search + page fetch, and if so via which free-tier infra (Firecrawl keyless, TinyFish, Monid)?

## 1. Sources

Local screenshots (`C:\x\temp\`):

- `Screenshot_20260829_004513_X.jpg` — Eric Ciarla post "introducing firecrawl free keyless": AI agents can "search and scrape the web 100% free"; claims state-of-the-art search accuracy (94.7% on SimpleQA), sub-3s scrapes to clean markdown, no API key / no signup; entry point `npx -y firecrawl-cli@latest init --all --browser`.
- `Screenshot_20260829_004637_X.jpg` — Shengkun Ye post "We just killed Exa, Tavily, SerpAPI, and Brave": agent can "search & fetch any webpage for 100% FREE"; "Them: $7 per 1,000 searches. Us: $0. No subscriptions, no quotas."; "Made possible by @Tiny_Fish and @MonidHQ"; follow-up reply points agents at `https://monid.ai/SKILL.md` ("We don't need your credit card for free search").
- `Screenshot_20260829_005938_X.jpg` — TinyFish post: "30 Search requests/min = up to 43,200 searches a day. And Fetch comes with it. All FREE."; "Search + Fetch are fundamental primitives for agents"; notes @MonidHQ put TinyFish Search + Fetch into its offering.

Web verification (Sept 2026, fetched 2026-09-04):

- Firecrawl keyless launch blog (`firecrawl.dev/blog/firecrawl-keyless-launch`, 2026-06-16, Eric Ciarla): keyless Search/Scrape/Interact, "1,000 free credits a month, automatically", MCP at `https://mcp.firecrawl.dev/v2/mcp`, CLI `npx firecrawl-cli@latest`, REST without `Authorization` header.
- Firecrawl docs (`docs.firecrawl.dev/rate-limits`, `/billing`, `/mcp-server/keyless`, `firecrawl.dev/pricing`): keyless MCP exposes exactly Search, Scrape, Parse (plus Interact on REST/CLI); keyless capped per IP per day by request count AND credit count, `429` on exceed; credit costs Scrape 1/page, Search 2 per 10 results, Interact 2/browser-minute; free API-key signup adds 1,000 credits and higher limits.
- TinyFish pricing (`tinyfish.ai/pricing`): "Search and Fetch really free? Yes, Search at 30 requests/min and 500 requests/hour, Fetch at 150 urls/min and 1,000 urls/day. No charge, no Wallet draw, $0 balance OK."
- TinyFish blog (`tinyfish.ai/blog/search-and-fetch-are-now-free-for-every-agent-everywhere`, 2026-05-04): Search + Fetch free across REST, MCP, SDKs, CLI, Skill; free tier "30 queries per minute for Search and 150 URLs per minute for Fetch".
- TinyFish search-api docs (`tinyfish.mintlify.app/search-api`): "Search never draws from your wallet — free at any balance, including $0."
- Monid (`monid.ai/blog/tinyfish`, `monid.ai/SKILL.md` v0.1.7, `monid.ai/tools/tinyfish`, `monid.ai/`): "Search & fetch the web. 100% free. Powered by TinyFish. No subscriptions, no API keys, no credit card." Comparison table per 1,000 API requests: SerpAPI $25.00 / Tavily $8.00 / Exa $7.00 / Brave $5.00 / TinyFish FREE $0. SKILL.md is a `monid discover/inspect/run` CLI catalog with hundreds of endpoints; precedence rule says use the user's existing dedicated tools first.
- Incumbent cross-checks (June–Aug 2026): serp.fast comparison normalizes Exa $7/1K searches + $1/1K content pages, Tavily ~$5–8/1K basic, Brave $5/1K, SerpAPI Starter ~$25/1K; cyberax.com table agrees (SerpAPI Starter $25/mo for 1,000; Brave $5/1K; Exa $7/1K PAYG). Brave dropped its free query tier Feb 2026 (stork.ai, 2026-07-13).

## 2. External claims — verified vs not

| Screenshot claim | Verdict (Sept 2026) |
|---|---|
| Firecrawl: "100% free, no key, no signup" | **Mostly true, capped.** Keyless is real and keyless MCP/CLI/REST exist, but free = 1,000 credits/month pool + per-IP daily request/credit caps (`429` over). Not unlimited. |
| Firecrawl: "94.7% on SimpleQA" / "sub-3s scrapes" | **Unverified vendor marketing.** No independent benchmark found in this pass; treat as unproven for Gurudevi content (Sinhala/English school-domain pages, JS-heavy sites). |
| TinyFish: "30 req/min = 43,200/day, all FREE" | **Arithmetic overstates effective cap.** 30×60×24 = 43,200 is correct math, but pricing page also caps Search at 500 requests/hour → effective max ≈ 12,000/day sustained, plus Fetch 1,000 urls/day. Free-per-request is verified; "no quota" is false. |
| TinyFish: "Fetch comes with it, free" | **Verified.** Fetch free at 150 urls/min, 1,000 urls/day, $0 wallet OK. |
| Monid: "search & fetch 100% FREE, no card" | **True via TinyFish passthrough.** Monid's free search/fetch is TinyFish-backed ("Search is free. Everything else starts with $1 in credit"). Monid is a broker/SKILL layer, not its own index. |
| "Them: $7/1,000; Us: $0" (Exa/Tavily/SerpAPI/Brave killed) | **Directionally true on unit price, misleading on parity.** Exa list is $7/1K, Tavily ~$5–8/1K, Brave $5/1K, SerpAPI ~$25/1K starter — so $0 vs paid is real. "Killed" is hype: incumbents differ on index ownership, freshness, SERP features, SLAs, logging, and deep-research tiers ($12–55+/1K) that free search+fetch does not replace. |

## 3. Gurudevi today

`packages/ai` (`@repo/ai` v1.5.0, `packages/ai/package.json:1-98`):

- Public surface is tiny: `packages/ai/src/index.ts:1-4` re-exports `api`, `constants/aiRegistry`, `hooks`, `screens`; `packages/ai/src/assistant.ts:1-2` re-exports `AIAssistantScreen` + `useAIAgent`.
- No web-search tool. Agents in `packages/ai/src/api/agents.ts:1-238` are Supabase-internal only: `ReliefCoordinator.checkSectionStatus` (staff_leaves + classrooms + users) and `TimetableScheduler.generateDraft` / `checkStructuralGaps` (classrooms + users, greedy client-side allocation). All reads best-effort with empty/error fallbacks.
- Chat in `packages/ai/src/hooks/useAIAgent.ts:1-404` streams via TanStack AI (`useChat` + `xhrHttpStream`) to `${SOVEREIGN_API_URL}/api/ai/chat` (`packages/ai/src/hooks/useAIAgent.ts:231-254`), with context = role, school name, active gaps, orientation seeds, moon phase, billing/privacy mode. Gap detectors (`detectAttendanceGaps`, `detectGradingGaps`) query Supabase `attendance` / `assignments` / `submissions`. Quick actions POST to `${SOVEREIGN_API_URL}/api/ai/action` (mark_attendance, create_assignment, gradebook_summary, attendance_summary). No `fetch()` to any search vendor, no key handling for search.
- Registry `packages/ai/src/constants/aiRegistry.ts:12-31`: single `ai-assistant` beta feature (`reviewAt`/`removalTarget` 2026-09-30), citizenship ≥ 3, workspace tab.
- Deps (`packages/ai/package.json:58-67`): `@repo/core`, `@repo/ui`, `@tanstack/ai ^0.43.1`, `@tanstack/ai-client`, `@tanstack/ai-react`, `@tanstack/react-query`, `expo-router`, `react-i18next`, `react-native-reanimated 4.3.1`. No search/scrape SDK.

`apps/gurudevi-mobile` usage:

- Consumes `@repo/ai`: `apps/gurudevi-mobile/package.json:85` (`"@repo/ai": "workspace:*"`); screens `apps/gurudevi-mobile/app/(tabs)/self/ai-assistant.tsx:1` and `apps/gurudevi-mobile/app/a-i-assistant.tsx:1`; catalog `apps/gurudevi-mobile/src/boot/registerAppCatalog.ts:2` (`AI_REGISTRY` import).
- Inngest pinned as baseline expects: `apps/gurudevi-mobile/package.json:193` (`"inngest": "^4.18.1"`). Lazy singleton `apps/gurudevi-mobile/src/lib/inngest.ts:8-20` loads `inngest` + `@repo/core/adapters/events/inngest.adapter`; emitters `apps/gurudevi-mobile/src/lib/inngestEvents.ts:14-31` cover only wellbeing-mood-logged, sync-mutation-queued, school-grade-published, school-classroom-created. No AI/search job, no search event.
- Supabase: runtime client is `@supabase/supabase-js 2.102.1` via `packages/core/package.json:351,377,413`; `packages/ai` imports `supabaseClient` from `@repo/core/adapters/supabaseClient` (`packages/ai/src/api/agents.ts:6`, `packages/ai/src/hooks/useAIAgent.ts:2`). No Supabase full-text/vector search wired for agents in this pass.
- Existing search/scrape in `apps/gurudevi-mobile`: **none-found**. Targeted grep for `fetch(.*google|serp|webSearch|web_search|searchWeb|scrape|exa|tavily` over `apps/gurudevi-mobile/src/*.ts,tsx` returns only unrelated matches (`backgroundSyncTask.ts:19` comment with "exactly once", `PowerSyncProvider.tsx:14` drizzle docs link, test/validator `example.com` fixtures) — zero web-search/scrape call sites.

## 4. Gap table (cost / rate / capability)

| Dimension | Firecrawl keyless | TinyFish Search+Fetch | Monid (TinyFish-backed) | Gurudevi today |
|---|---|---|---|---|
| Unit cost | $0 up to 1,000 credits/mo; then paid plans + $5 auto-reload batches | $0/req on every plan (Search + Fetch); paid Agent/Browser via Wallet | $0 for search/fetch; other endpoints from $1 credit | $0 (no vendor) |
| Rate cap | Per-IP daily req + credit caps; plan table (/search 10–10,000 RPM by plan); `429` over | Search 30 RPM + 500/hour; Fetch 150 urls/min + 1,000 urls/day | Inherits TinyFish caps + Monid workspace balance for non-free tools | N/A |
| Capability | Search + Scrape/Parse (+Interact keyless on REST/CLI); JS rendering; markdown/HTML/JSON (+4 credits JSON); no crawl/extract/map keyless | Search (ranked JSON, freshness windows) + Fetch (browser-rendered markdown, token-trimmed ~1,240 tok/fetch claimed); no answer synthesis; app still needs LLM + Fetch for evidence | Same search/fetch + catalog of hundreds of premium endpoints via `monid discover/inspect/run` | Supabase-internal gaps + sovereign chat; no live web evidence |
| Auth/fleet fit | No key = per-IP caps shared across devices behind NAT; unsuitable as mobile-fleet default; keyed free tier (1,000 credits) per workspace is the sane path | Free API key from `agent.tinyfish.ai`, no card; server-held key fits sovereign proxy model | `monid setup`, no API key required; CLI-first (Claude/Codex/Cursor/OpenCode); mobile fit unclear | Sovereign token (`authAPI.getAuthSession`) already plumbed for `/api/ai/chat` |
| Privacy/SLA | Queries leave device boundary; ZDR costs +1/page; no SLA on free | Live (never cached) results; query logging/SLA unspecified on free; Enterprise for SLA | Extra broker hop (Monid → TinyFish); precedence rules add behavior surface | Data stays in Supabase + sovereign API today |

Key risks: (a) keyless per-IP limits break on school NAT / shared egress — one quota for the whole building; (b) free tiers have no SLA and ToS/retention terms can change (cf. Brave killing free tier Feb 2026); (c) web evidence injects prompt-injection surface — needs citation + untrusted-content marking before it reaches `useAIAgent` context; (d) screenshot "43,200/day" ignores the 500/hour cap — capacity plan on 12,000/day/search-key, not 43K.

## 5. Recommendation

Pilot **TinyFish Search + Fetch behind the sovereign API** as Gurudevi's first web-evidence path; keep **Firecrawl keyed free tier as fallback** for JS-heavy pages needing Interact/JSON extraction; treat **Monid as dev-tooling only** (agent workstation `SKILL.md`), not a mobile runtime dependency.

1. Server-side proxy (new Inngest/background job or edge function, not from the handset): hold one TinyFish key, enforce per-school daily budget, cache search→fetch results in Supabase (query hash → JSONB + fetched markdown, TTL 1–24h by freshness need), and emit only cited snippets into `/api/ai/chat` context.
2. Extend `@repo/ai` with a single `WebEvidence` tool (`search(query, freshness)` → `fetch(urls)`), default OFF behind the existing `ai-assistant` beta flag; log cost=$0 + tokens saved for the 2026-09-30 beta review (`packages/ai/src/constants/aiRegistry.ts:4-10`).
3. Guardrails: mark all web content untrusted, cap 3–5 fetches per answer, strip to markdown, timeout + size caps, school-domain allowlist for auto-fetch, and privacy-mode respect (`temporary`/`incognito` in `packages/ai/src/hooks/useAIAgent.ts:146-175` skips persistence).
4. Do NOT ship Firecrawl keyless (no-key) from the app: per-IP caps + 1,000-credit pool will throttle a whole school; use a keyed free workspace if Firecrawl is needed.
5. Revisit at beta review: if sustained usage exceeds ~12K searches/day/key or needs SLAs/SERP features, price an Enterprise throughput tier or an incumbent (Tavily/Exa/Brave) for that slice — free search wins unit cost, not parity.

Open questions: TinyFish freshness-window semantics for Sinhala curricula sources; data-retention/logging terms for school queries; whether PowerSync/offline needs a pre-bundled evidence pack instead of live search.
