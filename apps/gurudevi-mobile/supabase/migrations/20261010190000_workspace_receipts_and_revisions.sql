-- Workspace sync hardening (additive).
-- Existing layout rows remain valid while remote client writes move behind the
-- server-owned receipt/revision mutation boundary.

alter table public.user_workspace_layouts
  drop constraint if exists user_workspace_layouts_layout_version_check;

alter table public.user_workspace_layouts
  add constraint user_workspace_layouts_layout_version_check
  check (layout_version in (1, 2));

alter table public.user_workspace_layouts
  add column if not exists revision bigint not null default 0,
  add column if not exists last_operation_id uuid;

-- Workspace writes are server-owned. Clients retain read access for hydration,
-- while authenticated mutations go through the receipt-backed oRPC endpoint.
drop policy if exists "Users can insert own workspace layouts" on public.user_workspace_layouts;
drop policy if exists "Users can update own workspace layouts" on public.user_workspace_layouts;
drop policy if exists "Users can delete own workspace layouts" on public.user_workspace_layouts;

create or replace function public.bump_user_workspace_layout_revision()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
  else
    new.revision := 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bump_user_workspace_layout_revision on public.user_workspace_layouts;
create trigger trg_bump_user_workspace_layout_revision
before insert or update on public.user_workspace_layouts
for each row execute function public.bump_user_workspace_layout_revision();

create table if not exists public.workspace_mutation_receipts (
  operation_id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  idempotency_key text not null,
  workspace_id text not null,
  layout_target text not null check (layout_target in ('shared', 'web', 'mobile')),
  input_hash text not null,
  client_revision bigint,
  server_revision bigint,
  status text not null check (status in ('pending', 'completed', 'failed', 'conflict')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_workspace_mutation_receipt_idempotency
    unique (user_id, idempotency_key)
);

create index if not exists idx_workspace_mutation_receipts_user_updated
  on public.workspace_mutation_receipts(user_id, updated_at desc);

create or replace function public.touch_workspace_mutation_receipt_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_workspace_mutation_receipt_updated_at on public.workspace_mutation_receipts;
create trigger trg_touch_workspace_mutation_receipt_updated_at
before update on public.workspace_mutation_receipts
for each row execute function public.touch_workspace_mutation_receipt_updated_at();

alter table public.workspace_mutation_receipts enable row level security;

comment on table public.workspace_mutation_receipts is
  'Server-owned workspace mutation receipts for replay safety and revision reconciliation.';

revoke all on table public.workspace_mutation_receipts from anon, authenticated;
