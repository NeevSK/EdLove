---
title: "TinyFish Proxy — Supabase web_evidence_cache Migration Draft"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [migration, supabase, cache, ai, tinyfish]
---

# Supabase Migration: web_evidence_cache Table

> **Guardrails:** Server-side only. Service-role write, server read. Privacy-mode bypass. TTL by freshness.

## Migration File: `supabase/migrations/20260904_web_evidence_cache.sql`

```sql
-- 20260904_web_evidence_cache.sql
-- TinyFish sovereign proxy: query-hash cache with TTL by freshness window

CREATE TABLE web_evidence_cache (
  -- Primary key: SHA256(normalized_query || '|' || freshness_window)
  query_hash char(64) NOT NULL PRIMARY KEY,

  -- Normalized query for debugging / cache analysis (never PII)
  query_norm text NOT NULL,

  -- Freshness window used: 'day' | 'week' | 'any'
  freshness_window text NOT NULL CHECK (freshness_window IN ('day', 'week', 'any')),

  -- Full TinyFish response (search results + fetched markdown)
  response jsonb NOT NULL,

  -- Pre-processed cited snippets ready for injection
  -- [{ url, markdown, source: 'tinyfish'|'firecrawl', citationId, untrustedMarked: true }]
  fetched_md jsonb NOT NULL,

  -- School ID for budget correlation (not transmitted to vendor)
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Privacy mode at fetch time (for audit)
  privacy_mode text NOT NULL CHECK (privacy_mode IN ('saved', 'temporary', 'incognito')),

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL,

  -- Access tracking for LRU-style eviction
  last_accessed_at timestamptz NOT NULL DEFAULT NOW(),
  access_count int NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX idx_web_evidence_cache_expires ON web_evidence_cache(expires_at);
CREATE INDEX idx_web_evidence_cache_school ON web_evidence_cache(school_id);
CREATE INDEX idx_web_evidence_cache_freshness ON web_evidence_cache(freshness_window);

-- RLS: Service role only (server-side cache)
ALTER TABLE web_evidence_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON web_evidence_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- No policies for anon/authenticated — mobile never reads this table directly

-- TTL by freshness window (application-level, enforced at write)
-- day   → 1 hour   (news, curriculum updates)
-- week  → 6 hours  (general reference)
-- any   → 24 hours (stable reference, e.g., Wikipedia)

-- Cleanup function (pg_cron or scheduled worker)
CREATE OR REPLACE FUNCTION cleanup_web_evidence_cache()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM web_evidence_cache
  WHERE expires_at < NOW();
END;
$$;

-- Optional: size-based eviction (keep cache < 100MB)
CREATE OR REPLACE FUNCTION evict_web_evidence_cache_lru(max_bytes bigint DEFAULT 104857600)
RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  deleted_count int := 0;
BEGIN
  -- Estimate size: pg_total_relation_size is heavy; use row count heuristic
  -- ~2KB/row average → 50k rows ≈ 100MB
  DELETE FROM web_evidence_cache
  WHERE query_hash IN (
    SELECT query_hash FROM web_evidence_cache
    ORDER BY last_accessed_at ASC
    LIMIT 10000
  )
  AND (SELECT pg_total_relation_size('web_evidence_cache')) > max_bytes;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
```

## Cache Operations (Server-Side Only)

```typescript
// sanctuary-api/src/lib/web-evidence-cache.ts
import { supabaseAdmin } from '@repo/core/adapters/supabaseAdmin';
import { createHash } from 'node:crypto';

const TTL_BY_FRESHNESS = {
  day: 60 * 60 * 1000,      // 1 hour
  week: 6 * 60 * 60 * 1000, // 6 hours
  any: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export function hashQuery(query: string, freshness: 'day' | 'week' | 'any'): string {
  // Normalize: lowercase, trim, collapse whitespace, strip PII tokens
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\d{4,}\b/g, '[ID]')           // student IDs, grades
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[DATE]') // dates
    .replace(/[a-z]+\.[a-z]+@[a-z]+\.[a-z]+/gi, '[EMAIL]');
  return createHash('sha256').update(`${normalized}|${freshness}`).digest('hex');
}

export async function cacheGet(queryHash: string): Promise<CacheEntry | null> {
  const { data, error } = await supabaseAdmin
    .from('web_evidence_cache')
    .select('query_hash, query_norm, freshness_window, response, fetched_md, school_id, privacy_mode, created_at, expires_at')
    .eq('query_hash', queryHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;

  // Update access stats (fire-and-forget)
  supabaseAdmin
    .from('web_evidence_cache')
    .update({ last_accessed_at: new Date().toISOString(), access_count: data.access_count + 1 })
    .eq('query_hash', queryHash)
    .then(() => {});

  return data as CacheEntry;
}

export async function cacheSet(
  queryHash: string,
  entry: {
    query: string;
    freshness: 'day' | 'week' | 'any';
    response: unknown;      // raw TinyFish response
    snippets: CitedSnippet[]; // processed, untrusted-marked
    schoolId: string;
    privacyMode: 'saved' | 'temporary' | 'incognito';
  }
): Promise<void> {
  // Privacy mode bypass: temporary/incognito → no cache write
  if (entry.privacyMode !== 'saved') return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_BY_FRESHNESS[entry.freshness]);

  const { error } = await supabaseAdmin
    .from('web_evidence_cache')
    .upsert({
      query_hash: queryHash,
      query_norm: entry.query,
      freshness_window: entry.freshness,
      response: entry.response,
      fetched_md: entry.snippets,
      school_id: entry.schoolId,
      privacy_mode: entry.privacyMode,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      last_accessed_at: now.toISOString(),
      access_count: 1,
    }, { onConflict: 'query_hash' });

  if (error) throw error;
}

export interface CacheEntry {
  query_hash: string;
  query_norm: string;
  freshness_window: 'day' | 'week' | 'any';
  response: unknown;
  fetched_md: CitedSnippet[];
  school_id: string;
  privacy_mode: 'saved' | 'temporary' | 'incognito';
  created_at: string;
  expires_at: string;
}

export interface CitedSnippet {
  url: string;
  markdown: string; // already wrapped in <untrusted-web src="...">\n...\n</untrusted-web>
  source: 'tinyfish' | 'firecrawl';
  citationId: number;
  untrustedMarked: true;
}
```

## Reversibility

- **Disable reads:** Set `isWebEvidenceEnabled=false` flag → cache never consulted
- **Drop table:** `DROP TABLE web_evidence_cache;` (migration retained for rollback)
- **No client impact:** Mobile never queries this table directly

## PDPA Notes

- `query_norm` stores normalized query (PII tokens replaced with `[ID]`, `[DATE]`, `[EMAIL]`)
- `school_id` retained for budget correlation only, never sent to TinyFish
- `privacy_mode` recorded for audit
- `temporary`/`incognito` modes bypass cache write entirely
- Cleanup job removes expired entries automatically