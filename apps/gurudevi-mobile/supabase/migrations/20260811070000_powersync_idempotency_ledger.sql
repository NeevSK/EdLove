-- Durable replay protection for PowerSync upload batches.
-- The row is inserted and marked completed inside the same transaction as CRUD writes.
create table if not exists public.powersync_idempotency_keys (
  principal_id text not null,
  idempotency_key text not null,
  payload_hash text not null,
  status text not null check (status in ('processing', 'completed')),
  processed_count integer not null default 0 check (processed_count >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (principal_id, idempotency_key)
);

create index if not exists powersync_idempotency_keys_created_at_idx
  on public.powersync_idempotency_keys (created_at);

comment on table public.powersync_idempotency_keys is
  'Durable account-scoped replay protection for PowerSync upload batches.';

-- This table is server-owned. Clients must never read or write it through Supabase APIs.
revoke all on table public.powersync_idempotency_keys from anon, authenticated;
