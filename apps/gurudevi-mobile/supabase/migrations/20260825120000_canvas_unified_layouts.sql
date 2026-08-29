-- Unified Canvas: is_default + tab_order + surface metadata
-- Supports two-variable persistence (isDefault boolean + codified layout) and
-- opinionated tab ordering per platform.

-- 1. user_workspace_layouts: add is_default flag
alter table public.user_workspace_layouts
  add column if not exists is_default boolean not null default true;

alter table public.user_workspace_layouts
  add column if not exists surface_metadata_jsonb jsonb not null default '{}'::jsonb;

-- Index for fast lookup of customized layouts
create index if not exists idx_user_workspace_layouts_is_default
  on public.user_workspace_layouts(user_id, workspace_id, layout_target)
  where is_default = false;

comment on column public.user_workspace_layouts.is_default is
  'Two-variable persistence: true uses opinionated defaults (no codified blob); false means codified order/hidden/pinned/zone_by_surface is user-customized.';

comment on column public.user_workspace_layouts.surface_metadata_jsonb is
  'Codified surface metadata per surfaceId: {kind, domain, capabilityKey, defaultZone, platformSupport}. Allows recognition and cross-device sync without relying on volatile IDs.';

-- 2. user_preferences: tab order (opinionated defaults + per-platform overrides)
alter table public.user_preferences
  add column if not exists tab_order text[] default array['profile','community','self','workspace','library']::text[];

alter table public.user_preferences
  add column if not exists tab_order_mobile text[];

alter table public.user_preferences
  add column if not exists tab_order_web text[];

alter table public.user_preferences
  add column if not exists last_community_mode text default 'feed';

alter table public.user_preferences
  add column if not exists last_community_filter text default 'all';

alter table public.user_preferences
  add column if not exists community_mode_order text[] default array['feed','circles','messages','announcements']::text[];

comment on column public.user_preferences.tab_order is
  'Global opinionated tab order. Mobile default: [profile, community, self(center), workspace, library]. Web rail upper: [self, workspace, community, library]; lower: [notifications, settings, profile].';

-- 3. Backfill: existing rows are considered default (already true)
update public.user_workspace_layouts
  set is_default = false
  where order_json::text != '[]'::text
    and is_default = true;

-- Validation check for tab_order values
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_user_preferences_tab_order_values'
  ) then
    alter table public.user_preferences
      add constraint chk_user_preferences_tab_order_values
      check (
        tab_order is null or
        tab_order <@ array['self','workspace','community','library','profile','notifications','settings']::text[]
      );
  end if;
end $$;
