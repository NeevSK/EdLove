-- Generic server-owned operation receipts for capability mutations.
-- Workspace receipts remain specialized; this table is for other durable
-- mutations such as assignment submissions and future bounded workflows.
create table if not exists public.operation_receipts (
  operation_id uuid primary key,
  account_id uuid not null references public.users(id) on delete cascade,
  capability text not null,
  idempotency_key uuid not null,
  payload_hash text not null,
  status text not null check (status in ('pending', 'committed', 'failed', 'conflict')),
  result jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_operation_receipt_account_key unique (account_id, capability, idempotency_key)
);

create index if not exists idx_operation_receipts_account_updated
  on public.operation_receipts(account_id, updated_at desc);

create or replace function public.touch_operation_receipt_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_operation_receipt_updated_at on public.operation_receipts;
create trigger trg_touch_operation_receipt_updated_at
before update on public.operation_receipts
for each row execute function public.touch_operation_receipt_updated_at();

alter table public.operation_receipts enable row level security;
revoke all on table public.operation_receipts from anon, authenticated;

comment on table public.operation_receipts is
  'Server-owned, payload-bound operation receipts for replay, conflict and recovery.';
