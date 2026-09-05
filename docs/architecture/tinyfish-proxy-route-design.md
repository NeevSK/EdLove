---
title: "TinyFish Sovereign Proxy — Route Design (Server-Side Only, OFF Default)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, ai, proxy, tinyfish, server-side]
---

# TinyFish Sovereign Proxy — Route Design

> **Guardrails:** Server-side only. No mobile runtime deps. No school PII to vendors. PDPA-aware. Flag OFF by default.

## Architecture Position

```
┌─────────────────────────────────────────────────────────────────┐
│  Handset (gurudevi-mobile)                                      │
│  - No vendor keys                                               │
│  - No new deps                                                  │
│  - Emits: ai/evidence-requested (Inngest) OR calls /api/ai/chat │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (auth'd, ai-assistant flag)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Sovereign Server (sanctuary-api / worker host per ADR-009)     │
│  - Holds ONE TinyFish key (Doppler, never EXPO_PUBLIC_*)       │
│  - Per-school budget counters                                   │
│  - web_evidence_cache (Supabase)                                │
│  - WebEvidence tool: search → fetch(≤5) → cited snippets        │
│  - Untrusted marking + injection defence                        │
│  - Privacy-mode respect (temporary/incognito bypass cache)      │
└─────────────────────────────────────────────────────────────────┘
```

## Route: `/api/ai/chat` (Enhanced)

**Existing:** Streams chat with context (role, gaps, billing, privacyMode)

**Enhancement (server-side only, behind `ai-assistant` flag + internal `web-evidence-enabled`):**

```typescript
// sanctuary-api/src/routes/ai/chat.ts (conceptual)
export async function chatHandler(req: Request, ctx: ExecutionContext) {
  // 1. Auth + flag check
  const session = await authMiddleware(req);
  const schoolId = session.school_id;
  const privacyMode = req.body.context?.privacyMode ?? 'saved';

  // 2. Flag gate (double-gated)
  const aiEnabled = await flagClient.getBoolean('isAIAssistantEnabled', { schoolId });
  const webEvidenceEnabled = await flagClient.getBoolean('isWebEvidenceEnabled', { schoolId }); // NEW, OFF default
  if (!aiEnabled || !webEvidenceEnabled) {
    return streamStandardChat(req, ctx); // no web evidence
  }

  // 3. Budget check
  const budget = await checkBudget(schoolId); // { searchesUsed, fetchesUsed, limits }
  if (budget.searchesUsed >= budget.searchLimit || budget.fetchesUsed >= budget.fetchLimit) {
    return streamStandardChat(req, ctx); // graceful degrade
  }

  // 4. LLM router: does this need web evidence?
  const needsEvidence = await classifyIntent(req.body.messages);
  if (!needsEvidence) return streamStandardChat(req, ctx);

  // 5. Build rewritten query (PII-free)
  const rewrittenQuery = await rewriteQueryPiiFree(req.body.messages, schoolId);

  // 6. Cache lookup
  const cacheKey = hashQuery(rewrittenQuery, freshnessWindow);
  const cached = await cacheGet(cacheKey);
  if (cached && !isStale(cached)) {
    return streamWithEvidence(req, ctx, cached.snippets, cached.citations);
  }

  // 7. TinyFish Search
  const searchResults = await tinyfishSearch(rewrittenQuery, { limit: 5 });
  await incrementBudget(schoolId, 'searches', 1);

  // 8. Rank + allowlist filter
  const allowedUrls = searchResults
    .filter(r => isAllowlisted(r.url))
    .slice(0, 5);

  // 9. TinyFish Fetch (sequential, timeout + size caps)
  const snippets: CitedSnippet[] = [];
  for (const url of allowedUrls) {
    const fetched = await tinyfishFetch(url, { timeoutMs: 8000, maxBytes: 8192 });
    if (fetched.markdown && !isJsShell(fetched.markdown)) {
      snippets.push({ url, markdown: fetched.markdown, source: 'tinyfish' });
      await incrementBudget(schoolId, 'fetches', 1);
    }
    if (snippets.length >= 3) break; // default cap 3, max 5
  }

  // 10. Firecrawl fallback (keyed workspace only)
  if (snippets.length === 0 && allowedUrls.length > 0 && budget.hasHeadroom) {
    for (const url of allowedUrls.slice(0, 2)) {
      const fc = await firecrawlScrape(url); // keyed workspace, 1 credit
      if (fc.markdown) {
        snippets.push({ url, markdown: fc.markdown, source: 'firecrawl' });
        break;
      }
    }
  }

  // 11. Build response with untrusted marking
  const cited = snippets.map((s, i) => ({
    ...s,
    markdown: `<untrusted-web src="${s.url}">\n${s.markdown}\n</untrusted-web>`,
    citationId: i + 1,
  }));

  // 12. Cache write (unless privacyMode bypass)
  if (privacyMode === 'saved') {
    await cacheSet(cacheKey, { query: rewrittenQuery, snippets: cited, freshnessWindow });
  }

  // 13. Stream with evidence injected
  return streamWithEvidence(req, ctx, cited);
}
```

## Inngest Event Alternative (for async/background)

```typescript
// apps/gurudevi-mobile/src/lib/inngestEvents.ts — ADD
export const aiEvidenceRequested = createInngestEvent({
  name: 'ai/evidence-requested',
  schema: z.object({
    schoolId: z.string(),
    query: z.string(), // already PII-rewritten by server
    freshness: z.enum(['day', 'week', 'any']).default('week'),
    maxSnippets: z.number().min(1).max(5).default(3),
    privacyMode: z.enum(['saved', 'temporary', 'incognito']).default('saved'),
  }),
});

// Worker function (server-side)
export const aiWebEvidenceFn = inngest.createFunction(
  { id: 'ai/web-evidence', retries: 2 },
  { event: 'ai/evidence-requested' },
  async ({ event, step }) => {
    // Same logic as route above, returns snippets to callback or stores for pickup
  }
);
```

## Flag Wiring (OFF by Default)

| Flag Key | Default | Scope | Purpose |
|----------|---------|-------|---------|
| `isAIAssistantEnabled` | `false` | school | Master AI gate (existing) |
| `isWebEvidenceEnabled` | `false` | school | WebEvidence tool gate (NEW) |

**GrowthBook keys:** `gurudevi.ai.ai-assistant`, `gurudevi.ai.web-evidence`

**Rollout:** Both OFF → staging → pilot school → beta review 2026-09-30

## Privacy Mode Matrix

| Privacy Mode | Cache Write | Query Log | Budget Counter |
|--------------|-------------|-----------|----------------|
| `saved` | ✅ | ✅ (hash only) | ✅ |
| `temporary` | ❌ | ❌ (counters only) | ✅ |
| `incognito` | ❌ | ❌ (counters only) | ✅ |

## Capacity Constants (Source: ADR web-evidence-proxy)

```typescript
const CAPACITY = {
  TINYFISH_SEARCH_RPM: 30,
  TINYFISH_SEARCH_HOURLY: 500,
  TINYFISH_FETCH_RPM: 150,
  TINYFISH_FETCH_DAILY: 1000,
  SUSTAINED_DAILY_MAX: 12000, // planning figure
  PER_SCHOOL_DAILY: { searches: 50, fetches: 150 },
  SNIPPET_MAX_BYTES: 8192,
  ANSWER_MAX_BYTES: 25600,
  FETCH_CAP_DEFAULT: 3,
  FETCH_CAP_MAX: 5,
};
```

## Allowlist (Auto-Fetch)

```typescript
const ALLOWLIST = [
  /\.gov\.lk$/,
  /\.edu\.lk$/,
  /\.wikipedia\.org$/,
  /ministry.*\.gov\.lk$/,
  /department.*\.gov\.lk$/,
  // school's own domain (resolved at runtime)
];
```

## Reversibility

- Disable `isWebEvidenceEnabled` → zero web evidence, no other changes
- Delete Doppler key → zero vendor calls
- Drop `web_evidence_cache` reads (retain migration for rollback)
- No client release required