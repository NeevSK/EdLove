-- Shared authenticated-account budget. Untrusted forwarding headers never
-- become an account key; connection-level abuse remains an edge responsibility.
create table if not exists public.api_request_budgets (
  account_id uuid not null references public.users(id) on delete cascade,
  window_start timestamptz not null,
  used integer not null check (used > 0),
  primary key (account_id, window_start)
);
alter table public.api_request_budgets enable row level security;
revoke all on table public.api_request_budgets from public, anon, authenticated;
grant all on table public.api_request_budgets to service_role;
create index if not exists api_request_budgets_expiry on public.api_request_budgets(window_start);
