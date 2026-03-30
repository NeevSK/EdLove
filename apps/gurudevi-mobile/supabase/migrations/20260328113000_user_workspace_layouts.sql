-- User Workspace Layouts
-- Cross-device persistence for canvas arrangement preferences.
-- Local device storage remains the offline-first cache; this table is the
-- syncable remote record keyed by user and workspace.

create table if not exists public.user_workspace_layouts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    workspace_id text not null,
    order_json jsonb not null default '[]'::jsonb,
    hidden_json jsonb not null default '[]'::jsonb,
    pinned_json jsonb not null default '[]'::jsonb,
    zone_by_surface_jsonb jsonb not null default '{}'::jsonb,
    layout_version integer not null default 1 check (layout_version = 1),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_user_workspace_layout unique (user_id, workspace_id),
    constraint chk_user_workspace_layout_order_array check (jsonb_typeof(order_json) = 'array'),
    constraint chk_user_workspace_layout_hidden_array check (jsonb_typeof(hidden_json) = 'array'),
    constraint chk_user_workspace_layout_pinned_array check (jsonb_typeof(pinned_json) = 'array'),
    constraint chk_user_workspace_layout_zone_object check (jsonb_typeof(zone_by_surface_jsonb) = 'object')
);

create index if not exists idx_user_workspace_layouts_user_workspace
    on public.user_workspace_layouts(user_id, workspace_id);

create index if not exists idx_user_workspace_layouts_updated_at
    on public.user_workspace_layouts(updated_at desc);

create or replace function public.touch_user_workspace_layout_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists trg_touch_user_workspace_layout_updated_at on public.user_workspace_layouts;
create trigger trg_touch_user_workspace_layout_updated_at
before update on public.user_workspace_layouts
for each row execute function public.touch_user_workspace_layout_updated_at();

alter table public.user_workspace_layouts enable row level security;

create policy "Users can read own workspace layouts"
on public.user_workspace_layouts
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own workspace layouts"
on public.user_workspace_layouts
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own workspace layouts"
on public.user_workspace_layouts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own workspace layouts"
on public.user_workspace_layouts
for delete
to authenticated
using (user_id = auth.uid());
