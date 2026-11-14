-- Wallpaper asset records are server-verified before registration. Client SQL
-- access must remain read-only so an unverified row cannot authorize a layout.
drop policy if exists "Users can insert own wallpaper assets" on public.user_wallpaper_assets;
drop policy if exists "Users can delete own wallpaper assets" on public.user_wallpaper_assets;
