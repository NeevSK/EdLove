-- School Forest gratitude gifts are server-owned API data.
create table if not exists public.gratitude_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null references public.users(id) on delete cascade,
  recipient_user_id uuid not null references public.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  message text,
  gift_type text not null check (gift_type in ('lantern', 'rain', 'sunlight', 'seed')),
  warm_message_en text not null,
  warm_message_si text,
  warm_message_ta text,
  delivered boolean not null default false,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_gratitude_gifts_recipient_pending
  on public.gratitude_gifts(recipient_user_id, delivered, created_at desc);

alter table public.gratitude_gifts enable row level security;

drop policy if exists "gratitude_gifts_recipient_or_sender_read" on public.gratitude_gifts;
create policy "gratitude_gifts_recipient_or_sender_read"
on public.gratitude_gifts for select to authenticated
using (sender_user_id = auth.uid() or recipient_user_id = auth.uid());

drop policy if exists "gratitude_gifts_recipient_update" on public.gratitude_gifts;
create policy "gratitude_gifts_recipient_update"
on public.gratitude_gifts for update to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());
