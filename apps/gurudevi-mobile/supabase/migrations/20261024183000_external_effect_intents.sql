-- Server-owned transactional intent queue for provider-facing effects.
-- This is intentionally not a product activity feed, audit log, or telemetry store.
create table if not exists public.external_effect_intents (
  id uuid primary key,
  capability text not null,
  effect_name text not null,
  operation_id uuid,
  idempotency_key text not null,
  privacy_class text not null check (privacy_class in ('minimal', 'sensitive', 'restricted')),
  purpose text not null,
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'dispatching', 'dispatched', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  lock_token uuid,
  locked_until timestamptz,
  provider_event_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_external_effect_intent unique (capability, idempotency_key)
);

create index if not exists idx_external_effect_intents_dispatch
  on public.external_effect_intents (status, available_at)
  where status in ('pending', 'dispatching');

create or replace function public.touch_external_effect_intent_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_external_effect_intent_updated_at on public.external_effect_intents;
create trigger trg_touch_external_effect_intent_updated_at
before update on public.external_effect_intents
for each row execute function public.touch_external_effect_intent_updated_at();

alter table public.external_effect_intents enable row level security;
revoke all on table public.external_effect_intents from anon, authenticated;

comment on table public.external_effect_intents is
  'Server-owned effect intents. Dispatcher handoff is durable and repairable; provider delivery truth remains provider-specific.';
