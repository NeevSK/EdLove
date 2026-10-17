alter table public.user_wallpaper_assets
  add column if not exists deletion_state text not null default 'active'
    check (deletion_state in ('active', 'pending', 'deleted'));
