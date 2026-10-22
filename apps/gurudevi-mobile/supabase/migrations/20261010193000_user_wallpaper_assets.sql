create table if not exists public.user_wallpaper_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  public_id text not null,
  secure_url text not null,
  format text not null,
  byte_length integer not null check (byte_length > 0 and byte_length <= 8388608),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  created_at timestamptz not null default now(),
  constraint uq_user_wallpaper_public_id unique (user_id, public_id)
);

create index if not exists idx_user_wallpaper_assets_user_created
  on public.user_wallpaper_assets(user_id, created_at desc);

alter table public.user_wallpaper_assets enable row level security;
create policy "Users can read own wallpaper assets"
  on public.user_wallpaper_assets for select to authenticated using (user_id = auth.uid());
create policy "Users can insert own wallpaper assets"
  on public.user_wallpaper_assets for insert to authenticated with check (user_id = auth.uid());
create policy "Users can delete own wallpaper assets"
  on public.user_wallpaper_assets for delete to authenticated using (user_id = auth.uid());

revoke all on table public.user_wallpaper_assets from anon, authenticated, service_role;
grant select, insert, delete on table public.user_wallpaper_assets to authenticated;
