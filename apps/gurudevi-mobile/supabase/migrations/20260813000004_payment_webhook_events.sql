-- Durable replay/idempotency ledger for verified payment-provider callbacks.
create table if not exists public.payment_webhook_events (
  event_key text primary key,
  provider text not null,
  status text not null check (status in ('processing', 'processed', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  locked_until timestamptz,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

revoke all on table public.payment_webhook_events from anon, authenticated;
grant select, insert, update on table public.payment_webhook_events to service_role;

create index if not exists payment_webhook_events_created_at_idx
  on public.payment_webhook_events (created_at);
