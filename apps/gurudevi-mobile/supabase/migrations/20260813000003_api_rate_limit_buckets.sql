-- Shared fixed-window rate-limit state for horizontally scaled API instances.
-- The API only stores opaque bucket keys, counters, and expiry timestamps.
create table if not exists public.api_rate_limit_buckets (
  bucket_key text primary key,
  count integer not null check (count > 0),
  reset_at timestamptz not null
);

revoke all on table public.api_rate_limit_buckets from anon, authenticated;
grant select, insert, update, delete on table public.api_rate_limit_buckets to service_role;

create index if not exists api_rate_limit_buckets_reset_at_idx
  on public.api_rate_limit_buckets (reset_at);
