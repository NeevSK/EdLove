---
title: "TinyFish Proxy — Per-School Budget Implementation (Server-Side)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, ai, budget, rate-limiting, server-side]
---

# TinyFish Proxy — Per-School Budget Implementation

> **Guardrails:** Server-side only. No mobile runtime deps. Counters in Supabase (service role).

## Data Model

```sql
-- web_evidence_budget (one row per school per day)
CREATE TABLE web_evidence_budget (
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  budget_date date NOT NULL DEFAULT CURRENT_DATE,
  searches_used int NOT NULL DEFAULT 0,
  fetches_used int NOT NULL DEFAULT 0,
  search_limit int NOT NULL DEFAULT 50,
  fetch_limit int NOT NULL DEFAULT 150,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (school_id, budget_date)
);

-- Index for cleanup
CREATE INDEX idx_web_evidence_budget_date ON web_evidence_budget(budget_date);

-- RLS: service role only (server-side budget checks)
ALTER TABLE web_evidence_budget ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON web_evidence_budget
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

## Budget Check & Increment (Atomic)

```typescript
// sanctuary-api/src/lib/web-evidence-budget.ts
import { supabaseAdmin } from '@repo/core/adapters/supabaseAdmin';

const DEFAULTS = { searchLimit: 50, fetchLimit: 150 };

export async function checkBudget(schoolId: string): Promise<BudgetStatus> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('web_evidence_budget')
    .select('searches_used, fetches_used, search_limit, fetch_limit')
    .eq('school_id', schoolId)
    .eq('budget_date', today)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    // First request today — seed row
    await seedBudget(schoolId, today);
    return { searchesUsed: 0, fetchesUsed: 0, ...DEFAULTS, hasHeadroom: true };
  }

  return {
    searchesUsed: data.searches_used,
    fetchesUsed: data.fetches_used,
    searchLimit: data.search_limit,
    fetchLimit: data.fetch_limit,
    hasHeadroom: data.searches_used < data.search_limit && data.fetches_used < data.fetch_limit,
  };
}

export async function incrementBudget(
  schoolId: string,
  type: 'searches' | 'fetches',
  amount: number = 1
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const column = type === 'searches' ? 'searches_used' : 'fetches_used';

  // Atomic upsert + increment
  const { error } = await supabaseAdmin.rpc('increment_web_evidence_budget', {
    p_school_id: schoolId,
    p_budget_date: today,
    p_column: column,
    p_amount: amount,
    p_search_limit: DEFAULTS.searchLimit,
    p_fetch_limit: DEFAULTS.fetchLimit,
  });

  if (error) throw error;
}

async function seedBudget(schoolId: string, date: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('web_evidence_budget')
    .insert({
      school_id: schoolId,
      budget_date: date,
      searches_used: 0,
      fetches_used: 0,
      search_limit: DEFAULTS.searchLimit,
      fetch_limit: DEFAULTS.fetchLimit,
    })
    .select()
    .maybeSingle();

  // Ignore duplicate key (race condition)
  if (error?.code !== '23505') throw error;
}
```

## PostgreSQL RPC for Atomic Increment

```sql
-- migration: 20260904_web_evidence_budget_rpc.sql
CREATE OR REPLACE FUNCTION increment_web_evidence_budget(
  p_school_id uuid,
  p_budget_date date,
  p_column text, -- 'searches_used' or 'fetches_used'
  p_amount int DEFAULT 1,
  p_search_limit int DEFAULT 50,
  p_fetch_limit int DEFAULT 150
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Upsert with atomic increment
  INSERT INTO web_evidence_budget (school_id, budget_date, searches_used, fetches_used, search_limit, fetch_limit)
  VALUES (p_school_id, p_budget_date, 0, 0, p_search_limit, p_fetch_limit)
  ON CONFLICT (school_id, budget_date) DO UPDATE SET
    searches_used = CASE WHEN p_column = 'searches_used' THEN web_evidence_budget.searches_used + p_amount ELSE web_evidence_budget.searches_used END,
    fetches_used = CASE WHEN p_column = 'fetches_used' THEN web_evidence_budget.fetches_used + p_amount ELSE web_evidence_budget.fetches_used END,
    updated_at = NOW()
  WHERE
    -- Prevent over-limit (defense in depth; app checks first)
    (p_column = 'searches_used' AND web_evidence_budget.searches_used < web_evidence_budget.search_limit) OR
    (p_column = 'fetches_used' AND web_evidence_budget.fetches_used < web_evidence_budget.fetch_limit);

  -- If WHERE fails (at limit), no rows updated — caller handles 429
END;
$$;
```

## Daily Cleanup Job (pg_cron or worker)

```sql
-- Keep 30 days of budget history
DELETE FROM web_evidence_budget
WHERE budget_date < CURRENT_DATE - INTERVAL '30 days';
```

## Graceful Degrade Behaviour

| Condition | Response |
|-----------|----------|
| Search limit reached | Skip web evidence, stream standard chat |
| Fetch limit reached | Use cached/search snippets only, no new fetches |
| Both limits reached | Full degrade, log `budget_exhausted` event |
| Privacy mode `temporary`/`incognito` | Counters increment, no cache write, no query log |

## Admin Override (Future)

```sql
-- Per-school limit override (admin only)
ALTER TABLE web_evidence_budget ADD COLUMN IF NOT EXISTS is_overridden boolean DEFAULT false;
-- When true, uses custom search_limit/fetch_limit; otherwise DEFAULTS
```

## Metrics Emission (PostHog / Sentry)

```typescript
// Emitted server-side only
await analytics.capture('web_evidence_budget_check', {
  schoolId,
  searchesUsed,
  fetchesUsed,
  hasHeadroom,
  privacyMode,
});
await analytics.capture('web_evidence_budget_exhausted', {
  schoolId,
  limitType: 'search' | 'fetch',
});
```